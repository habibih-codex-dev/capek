/**
 * index.js — Entry point Habibih Bot
 * ------------------------------------------------------------------
 * - Login via Pairing Code atau QR
 * - Auto-reconnect
 * - Plugin loader (hot-reloadable)
 * - Event: messages.upsert, group-participants.update, call (anti-call)
 * - Auto-backup database
 *
 * Jalankan:
 *   node index.js            -> pakai config.login.method
 *   node index.js --pairing  -> paksa pairing code
 *   node index.js --qr       -> paksa QR
 */
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import NodeCache from "node-cache";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import config from "./config.js";
import { log } from "./lib/print.js";
import Database from "./lib/database.js";
import { serialize } from "./lib/serialize.js";
import { handleMessage } from "./handler.js";
import { handleGroupParticipants } from "./lib/group-events.js";
import { startPrayerScheduler } from "./lib/prayer-scheduler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ============ State global ============ */
export const db = new Database(config.paths.database);
export const plugins = new Map(); // command -> plugin
export const pluginList = []; // semua plugin (untuk menu)
export const startTime = Date.now();

const groupCache = new NodeCache({ stdTTL: 300, useClones: false });
const msgRetryCache = new NodeCache();

/* ============ CLI args ============ */
const argv = process.argv.slice(2);
let loginMethod = config.login.method;
if (argv.includes("--qr")) loginMethod = "qr";
if (argv.includes("--pairing")) loginMethod = "pairing";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (q) => new Promise((res) => rl.question(q, res));

/* ============ Plugin loader ============ */
export async function loadPlugins(dir = config.paths.plugins) {
  plugins.clear();
  pluginList.length = 0;
  const root = path.join(__dirname, dir);
  if (!fs.existsSync(root)) {
    log.warn(`Folder plugins tidak ditemukan: ${root}`);
    return;
  }

  const walk = (d) => {
    let files = [];
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) files = files.concat(walk(full));
      else if (entry.name.endsWith(".js")) files.push(full);
    }
    return files;
  };

  const files = walk(root);
  let ok = 0;
  for (const file of files) {
    try {
      // cache-busting agar bisa reload
      const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
      const plugin = mod.default;
      if (!plugin || !plugin.command) continue;
      const cmds = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command];
      plugin._file = file;
      plugin._commands = cmds;
      pluginList.push(plugin);
      for (const c of cmds) plugins.set(c.toLowerCase(), plugin);
      ok++;
    } catch (e) {
      log.error(`Gagal load plugin ${path.basename(file)}:`, e.message);
    }
  }
  log.success(`Memuat ${ok} plugin (${plugins.size} command).`);
}

/* ============ Koneksi ============ */
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(
    config.paths.session
  );
  const { version, isLatest } = await fetchLatestBaileysVersion();
  log.info(`Baileys v${version.join(".")} (latest: ${isLatest})`);

  const usePairing = loginMethod === "pairing" && !state.creds.registered;

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false, // kita handle manual
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: "silent" })
      ),
    },
    browser: Browsers.ubuntu("Chrome"),
    markOnlineOnConnect: config.settings.alwaysOnline,
    generateHighQualityLinkPreview: true,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    msgRetryCounterCache: msgRetryCache,
    getMessage: async () => undefined,
  });

  // Simpan referensi global yang dipakai handler
  sock.db = db;
  sock.groupCache = groupCache;

  /* ---- Pairing code ---- */
  if (usePairing) {
    let number = config.login.pairingNumber.replace(/[^0-9]/g, "");
    if (!number || number.includes("x")) {
      number = (await question(
        "Masukkan nomor bot (cth 628xxxx): "
      )).replace(/[^0-9]/g, "");
    }
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(number);
        const pretty = code?.match(/.{1,4}/g)?.join("-") || code;
        log.system(`PAIRING CODE: ${pretty}`);
        log.info(
          "Buka WhatsApp > Perangkat Tertaut > Tautkan perangkat > Tautkan dengan nomor telepon, lalu masukkan kode di atas."
        );
      } catch (e) {
        log.error("Gagal meminta pairing code:", e.message);
      }
    }, 3000);
  }

  /* ---- Connection update ---- */
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && loginMethod === "qr") {
      log.info("Scan QR berikut dengan WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      config.botNumber = sock.user?.id?.split(":")[0] || config.botNumber;
      log.success(`Terhubung sebagai ${sock.user?.id}`);
      log.system(`${config.botName} siap digunakan!`);
      try {
        startPrayerScheduler(sock, db, config);
      } catch (e) {
        log.error("Gagal memulai penjadwal autosholat:", e.message);
      }
      try {
        rl.close();
      } catch {}
    }

    if (connection === "close") {
      const code =
        new Boom(lastDisconnect?.error)?.output?.statusCode ||
        lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      log.warn(`Koneksi tertutup (code ${code}).`);

      if (loggedOut) {
        log.error(
          "Sesi logout. Hapus folder session lalu login ulang."
        );
        return;
      }
      if (config.settings.autoReconnect) {
        log.info("Mencoba menyambung ulang...");
        setTimeout(() => startBot(), 3000);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  /* ---- Cache group metadata ---- */
  sock.ev.on("groups.update", async ([ev]) => {
    if (ev?.id) {
      try {
        const meta = await sock.groupMetadata(ev.id);
        groupCache.set(ev.id, meta);
      } catch {}
    }
  });
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const meta = await sock.groupMetadata(update.id);
      groupCache.set(update.id, meta);
      await handleGroupParticipants(sock, update, db, config);
    } catch (e) {
      log.error("group-participants.update:", e.message);
    }
  });

  /* ---- Anti-call ---- */
  sock.ev.on("call", async (calls) => {
    if (!config.settings.antiCall) return;
    for (const call of calls) {
      if (call.status === "offer") {
        try {
          await sock.rejectCall(call.id, call.from);
          await sock.sendMessage(call.from, {
            text: `❌ Maaf, panggilan tidak diizinkan. Anda akan diblokir otomatis.`,
          });
          await sock.updateBlockStatus(call.from, "block");
        } catch {}
      }
    }
  });

  /* ---- Pesan masuk ---- */
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const raw of messages) {
      try {
        if (!raw.message) continue;
        const m = await serialize(sock, raw, db, config);
        await handleMessage(sock, m, raw, { db, plugins, pluginList, config, groupCache, startTime });
      } catch (e) {
        log.error("messages.upsert:", e?.message || e);
      }
    }
  });

  return sock;
}

/* ============ Auto-backup database ============ */
if (config.settings.autoBackupMinutes > 0) {
  setInterval(() => {
    const dest = db.backup();
    if (dest) log.info(`Backup database -> ${path.basename(dest)}`);
  }, config.settings.autoBackupMinutes * 60 * 1000);
}

/* ============ Global error handling ============ */
process.on("uncaughtException", (e) =>
  log.error("uncaughtException:", e?.message || e)
);
process.on("unhandledRejection", (e) =>
  log.error("unhandledRejection:", e?.message || e)
);

/* ============ Jalankan ============ */
(async () => {
  log.system(`Memulai ${config.botName}...`);
  await loadPlugins();
  await startBot();
})();
