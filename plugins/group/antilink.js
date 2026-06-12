/**
 * plugins/group/antilink.js — Proteksi link grup
 * ------------------------------------------------------------------
 * Toggle (admin):
 *   .antilink   on/off   -> hapus semua link (SILENT)
 *   .antilinkv2 on/off   -> hapus + kick (SILENT)
 *   .antilinkwa on/off   -> hapus link grup WA (SILENT)
 *   .antilinkch on/off   -> hapus link channel WA (SILENT)
 *   .warnlink   on/off   -> share link -> warn (ADA NOTIF), >limit -> kick
 *
 * Catatan:
 * - Admin & Owner DIKECUALIKAN (bebas kirim link).
 * - Bot wajib admin; jika bukan admin, dilewati diam-diam.
 * - Link di config.linkWhitelist + website + channel di-whitelist.
 * - Prioritas aksi saat beberapa aktif: kick > warn > delete.
 */
import { kick } from "../../lib/group-actions.js";
import { addWarn, resetWarn } from "../../lib/warn.js";
import { jidToUser } from "../../lib/jid.js";

const TOGGLES = {
  antilink: "Hapus semua link (silent)",
  antilinkv2: "Hapus + kick (silent)",
  antilinkwa: "Hapus link grup WA (silent)",
  antilinkch: "Hapus link channel WA (silent)",
  warnlink: "Share link → warn (ada notif), >limit → kick",
};

const SEV = { none: 0, delete: 1, warn: 2, kick: 3 };

function buildWhitelist(config) {
  return [...(config.linkWhitelist || []), config.website, config.channel]
    .filter(Boolean)
    .map((w) =>
      String(w)
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
    );
}

export default {
  command: ["antilink", "antilinkv2", "antilinkwa", "antilinkch", "warnlink"],
  category: "group",
  desc: "Proteksi link grup (antilink/v2/wa/ch/warnlink)",
  group: true,
  admin: true,

  /* ---- Toggle on/off ---- */
  run: async (m, ctx) => {
    const { db, command, args, prefix } = ctx;
    const g = db.group(m.chat);
    const sub = (args[0] || "").toLowerCase();

    if (sub === "on" || sub === "off") {
      g[command] = sub === "on";
      db.markDirty();
      return m.reply(`✅ *${command}* sekarang *${sub.toUpperCase()}*.\n_${TOGGLES[command]}_`);
    }

    let teks = `🔗 *PROTEKSI LINK*\n\n`;
    for (const [k, label] of Object.entries(TOGGLES)) {
      teks += `${g[k] ? "🟢" : "🔴"} *${k}* — ${label}\n`;
    }
    teks += `\nContoh: *${prefix}${command} on*`;
    return m.reply(teks);
  },

  /* ---- Deteksi pasif (dijalankan handler untuk setiap pesan grup) ---- */
  all: async (m, ctx) => {
    if (!m.isGroup) return;
    const { sock, db, config, isAdmin, isOwner, isBotAdmin } = ctx;

    const g = db.group(m.chat);
    const anyOn =
      g.antilink || g.antilinkv2 || g.antilinkwa || g.antilinkch || g.warnlink;
    if (!anyOn) return;

    // Admin & Owner bebas kirim link
    if (isAdmin || isOwner) return;
    // Bot harus admin untuk bisa hapus/kick
    if (!isBotAdmin) return;

    const text = m.body || "";
    if (!text) return;

    // Deteksi link
    const found =
      text.match(
        /(https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+|wa\.me\/[0-9]+)/gi
      ) || [];
    if (!found.length) return;

    // Buang yang masuk whitelist
    const whitelist = buildWhitelist(config);
    const offending = found.filter(
      (l) => !whitelist.some((w) => l.toLowerCase().includes(w))
    );
    if (!offending.length) return;

    const hasWaGroup = offending.some((l) => /chat\.whatsapp\.com/i.test(l));
    const hasWaChannel = offending.some((l) =>
      /whatsapp\.com\/channel/i.test(l)
    );
    const hasGeneral = offending.length > 0;

    // Tentukan aksi (prioritas: kick > warn > delete)
    let action = "none";
    const bump = (a) => {
      if (SEV[a] > SEV[action]) action = a;
    };
    if (hasGeneral) {
      if (g.antilinkv2) bump("kick");
      if (g.warnlink) bump("warn");
      if (g.antilink) bump("delete");
    }
    if (hasWaGroup && g.antilinkwa) bump("delete");
    if (hasWaChannel && g.antilinkch) bump("delete");

    if (action === "none") return;

    // Eksekusi
    try {
      // Hapus pesan (untuk semua aksi)
      await sock.sendMessage(m.chat, { delete: m.key });

      if (action === "kick") {
        // SILENT: langsung kick tanpa respon
        await kick(sock, m.chat, [m.sender]);
        return;
      }

      if (action === "warn") {
        const { count, limit } = addWarn(db, m.chat, m.sender);
        if (count > limit) {
          // melebihi batas -> kick + reset warn (ada notif)
          await kick(sock, m.chat, [m.sender]);
          resetWarn(db, m.chat, m.sender);
          await sock.sendMessage(m.chat, {
            text: `🚫 @${jidToUser(
              m.sender
            )} dikeluarkan karena melebihi batas peringatan (${limit}x share link).`,
            mentions: [m.sender],
          });
        } else {
          // notif peringatan
          await sock.sendMessage(m.chat, {
            text: `⚠️ @${jidToUser(
              m.sender
            )} dilarang membagikan link!\nPeringatan: *${count}/${limit}*\n_Lebih dari ${limit}x akan dikeluarkan._`,
            mentions: [m.sender],
          });
        }
        return;
      }

      // action === "delete": SILENT, cukup hapus (sudah dilakukan di atas)
    } catch (e) {
      /* diam-diam, jangan spam error ke grup */
    }
  },
};
