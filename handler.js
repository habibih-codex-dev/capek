/**
 * handler.js — Routing command + sistem permission otomatis
 * ------------------------------------------------------------------
 * Alur:
 *   1. Auto-read / auto-typing (opsional)
 *   2. Self mode (hanya owner) bila diaktifkan
 *   3. Parsing prefix + command + args
 *   4. Ambil metadata grup (admin/botAdmin) — kompatibel JID & LID
 *   5. Cek permission otomatis berdasarkan flag plugin
 *   6. Cek scope (group/private/both)
 *   7. Cooldown anti-spam
 *   8. Jalankan plugin dengan context lengkap
 */
import baileys from "@whiskeysockets/baileys";
import { log, printMessage } from "./lib/print.js";
import {
  decodeJid,
  isGroupAdmin,
  getGroupAdmins,
  sameUser,
} from "./lib/jid.js";
import * as func from "./lib/myfunc.js";

const { jidNormalizedUser } = baileys;

// Map cooldown: `${sender}:${command}` -> timestamp
const cooldowns = new Map();

/** Cek apakah jid termasuk owner (config.ownerNumber atau fromMe). */
function checkOwner(m, config) {
  if (m.fromMe) return true;
  const senderNum = String(m.sender).split("@")[0];
  return config.ownerNumber.some((o) => {
    const on = String(o).replace(/[^0-9]/g, "");
    return senderNum === on || senderNum.endsWith(on) || on.endsWith(senderNum);
  });
}

/** Ambil command yang cocok dari teks setelah prefix. */
function parseCommand(body, prefixes) {
  const text = (body || "").trim();
  // dukung multi-prefix; "" berarti tanpa prefix
  let used = "";
  let matched = false;
  for (const p of prefixes) {
    if (p === "") {
      matched = true; // tanpa prefix: izinkan, tapi prioritas prefix nyata
      continue;
    }
    if (text.startsWith(p)) {
      used = p;
      matched = true;
      break;
    }
  }
  if (!matched) return null;
  const without = used ? text.slice(used.length) : text;
  const args = without.trim().split(/\s+/);
  const command = (args.shift() || "").toLowerCase();
  if (!command) return null;
  return {
    prefix: used,
    command,
    args,
    text: args.join(" "),
    fullArgs: without.trim(),
  };
}

export async function handleMessage(sock, m, raw, ctx) {
  const { db, plugins, pluginList, config, groupCache, startTime } = ctx;
  if (!m || !m.message) return;

  const botJid = decodeJid(sock.user?.id);
  const botLid = sock.user?.lid ? decodeJid(sock.user.lid) : null;

  /* ---- Auto-read ---- */
  if (config.settings.autoRead) {
    try {
      await sock.readMessages([m.key]);
    } catch {}
  }

  // Abaikan pesan dari diri sendiri kecuali untuk command (fromMe diizinkan utk owner self)
  const isOwner = checkOwner(m, config);

  /* ---- Self mode ---- */
  if (config.settings.self && !isOwner) return;

  printMessage(m, sock);

  /* ---- Parsing command ---- */
  const parsed = parseCommand(m.body, config.prefix);

  /* ---- Metadata grup & status admin ---- */
  let groupMetadata = null;
  let participants = [];
  let isAdmin = false;
  let isBotAdmin = false;
  let groupAdmins = [];

  if (m.isGroup) {
    try {
      groupMetadata =
        groupCache.get(m.chat) || (await sock.groupMetadata(m.chat));
      groupCache.set(m.chat, groupMetadata);
      participants = groupMetadata.participants || [];
      groupAdmins = getGroupAdmins(participants);

      // Cek admin: bandingkan sender JID & LID (kompatibel update terbaru)
      isAdmin =
        isGroupAdmin(m.sender, participants) ||
        (m.senderLid ? isGroupAdmin(m.senderLid, participants) : false);

      // Cek bot admin: bandingkan bot JID & LID
      isBotAdmin =
        isGroupAdmin(botJid, participants) ||
        (botLid ? isGroupAdmin(botLid, participants) : false);
    } catch (e) {
      log.warn("Gagal ambil metadata grup:", e.message);
    }
  }

  const isPremium = isOwner || db.isPremium(m.sender);

  /* ---- Context yang diberikan ke plugin ---- */
  const userData = db.user(m.sender);
  const groupData = m.isGroup ? db.group(m.chat) : null;

  const pluginCtx = {
    sock,
    raw,
    db,
    config,
    plugins,
    pluginList,
    func,
    startTime,
    groupCache,
    // info pengirim
    isOwner,
    isPremium,
    isAdmin,
    isBotAdmin,
    groupAdmins,
    botJid,
    botLid,
    // data
    groupMetadata,
    participants,
    userData,
    groupData,
    // parsing (diisi di bawah jika ada command)
    prefix: parsed?.prefix || "",
    command: parsed?.command || "",
    args: parsed?.args || [],
    text: parsed?.text || "",
  };

  /* ---- Auto-typing ---- */
  if (config.settings.autoTyping && parsed) {
    try {
      await sock.sendPresenceUpdate("composing", m.chat);
    } catch {}
  }

  /* ---- Passive hook: jalankan fungsi all() pada plugin (mis. antilink) ---- */
  for (const plugin of pluginList) {
    if (typeof plugin.all === "function") {
      try {
        await plugin.all(m, pluginCtx);
      } catch (e) {
        log.error(`plugin.all (${plugin._file}):`, e.message);
      }
    }
  }

  if (!parsed) return;

  /* ---- Cari plugin ---- */
  const plugin = plugins.get(parsed.command);
  if (!plugin || typeof plugin.run !== "function") return;

  db.data.stats.commandCount = (db.data.stats.commandCount || 0) + 1;
  db.markDirty();

  /* ============ SISTEM PERMISSION OTOMATIS ============ */
  const M = config.messages;

  // Banned user (kecuali owner)
  if (userData.banned && !isOwner) return;

  if (plugin.owner && !isOwner) return m.reply(M.owner);
  if (plugin.group && !m.isGroup) return m.reply(M.group);
  if (plugin.private && m.isGroup) return m.reply(M.private);
  if (plugin.admin && m.isGroup && !isAdmin && !isOwner)
    return m.reply(M.admin);
  if (plugin.botAdmin && m.isGroup && !isBotAdmin) return m.reply(M.botAdmin);
  if (plugin.premium && !isPremium) return m.reply(M.premium);

  // Scope: group | private | both
  const scope = plugin.scope || config.scope.default || "both";
  if (scope === "group" && !m.isGroup) return m.reply(M.group);
  if (scope === "private" && m.isGroup) return m.reply(M.private);

  // OnlyAdmin grup: jika diaktifkan, hanya admin/owner yang bisa pakai command
  if (m.isGroup && groupData?.onlyadmin && !isAdmin && !isOwner) return;

  /* ---- Cooldown anti-spam (owner dikecualikan) ---- */
  if (!isOwner && config.settings.cooldown > 0) {
    const key = `${m.sender}:${parsed.command}`;
    const now = Date.now();
    const last = cooldowns.get(key) || 0;
    if (now - last < config.settings.cooldown) {
      try {
        await m.react("⏳");
      } catch {}
      return;
    }
    cooldowns.set(key, now);
  }

  /* ---- Jalankan ---- */
  try {
    await plugin.run(m, pluginCtx);
  } catch (e) {
    log.error(`Error command ${parsed.command}:`, e?.message || e);
    try {
      await m.reply(`${config.messages.error}\n\n_${e?.message || e}_`);
    } catch {}
  } finally {
    if (config.settings.autoTyping) {
      try {
        await sock.sendPresenceUpdate("paused", m.chat);
      } catch {}
    }
  }
}

export default handleMessage;
