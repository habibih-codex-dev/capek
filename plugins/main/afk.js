/**
 * plugins/main/afk.js — Status AFK (Away From Keyboard)
 * ------------------------------------------------------------------
 * .afk [alasan]  -> set status AFK
 * Saat user AFK di-mention / di-reply -> bot infokan.
 * Saat user AFK kirim pesan lagi -> status AFK otomatis hilang (welcome back).
 */
import { decodeJid, jidToUser } from "../../lib/jid.js";

export default {
  command: ["afk"],
  category: "main",
  desc: "Set status AFK",
  group: true,

  run: async (m, ctx) => {
    const { db, text } = ctx;
    const u = db.user(m.sender);
    u.afk = { reason: text || "Tidak ada alasan", since: Date.now() };
    db.markDirty();
    await m.reply({
      text: `🛌 @${jidToUser(m.sender)} sekarang *AFK*.\nAlasan: ${u.afk.reason}`,
      mentions: [m.sender],
    });
  },

  /* ---- Pasif: cek AFK pada setiap pesan ---- */
  all: async (m, ctx) => {
    if (!m.isGroup) return;
    const { db, func, command } = ctx;

    // 1) Pengirim sedang AFK & mengirim pesan -> matikan AFK (kecuali saat set .afk)
    const su = db.data.users[m.sender];
    if (su?.afk && command !== "afk") {
      const dur = func.formatRuntime(Date.now() - su.afk.since);
      delete su.afk;
      db.markDirty();
      await m.reply({
        text: `👋 Selamat datang kembali @${jidToUser(m.sender)}!\nKamu AFK selama *${dur}*.`,
        mentions: [m.sender],
      });
    }

    // 2) Ada yang mention / reply user yang sedang AFK -> beri tahu
    const targets = new Set();
    (m.mentionedJid || []).forEach((j) => targets.add(decodeJid(j)));
    if (m.quoted?.sender) targets.add(decodeJid(m.quoted.sender));

    for (const t of targets) {
      if (t === m.sender) continue;
      const tu = db.data.users[t];
      if (tu?.afk) {
        const dur = func.formatRuntime(Date.now() - tu.afk.since);
        await m.reply({
          text: `📴 @${jidToUser(t)} sedang *AFK*.\nAlasan: ${tu.afk.reason}\nSejak: *${dur}* lalu`,
          mentions: [t],
        });
      }
    }
  },
};
