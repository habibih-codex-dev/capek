/**
 * plugins/group/warn.js — Sistem peringatan manual (admin)
 * Penggunaan:
 *   .warn @user [alasan]   -> tambah 1 peringatan (>limit otomatis kick)
 *   .unwarn @user          -> kurangi 1 peringatan
 *   .resetwarn @user       -> reset peringatan jadi 0
 *   .listwarn              -> daftar member yang punya peringatan
 *   .setwarn <angka>       -> ubah batas peringatan grup
 */
import { resolveTarget, kick } from "../../lib/group-actions.js";
import { addWarn, removeWarn, resetWarn, listWarn, getLimit, setLimit } from "../../lib/warn.js";
import { jidToUser } from "../../lib/jid.js";

export default {
  command: ["warn", "unwarn", "resetwarn", "listwarn", "setwarn"],
  category: "group",
  desc: "Sistem peringatan member (admin)",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { db, sock, command, args, text, prefix, isBotAdmin, config } = ctx;
    const gid = m.chat;

    // Ubah batas warn
    if (command === "setwarn") {
      const n = parseInt(args[0]);
      if (!n || n < 1) return m.reply(`Ketik angka batas.\nContoh: *${prefix}setwarn 3*`);
      const limit = setLimit(db, gid, n);
      return m.reply(`✅ Batas peringatan grup di-set ke *${limit}*.`);
    }

    // Daftar warn
    if (command === "listwarn") {
      const list = listWarn(db, gid);
      if (!list.length) return m.reply("📋 Belum ada member dengan peringatan.");
      const limit = getLimit(db, gid);
      const teks =
        `📋 *DAFTAR PERINGATAN* (batas ${limit})\n\n` +
        list.map((w) => `• @${jidToUser(w.jid)} — ${w.count}/${limit}`).join("\n");
      return m.reply({ text: teks, mentions: list.map((w) => w.jid) });
    }

    // Butuh target
    const target = resolveTarget(m, ctx);
    if (!target)
      return m.reply(`Tag / reply member.\nContoh: *${prefix}${command} @user*`);

    if (command === "warn") {
      const reason = (text || "").replace(/@\d+/g, "").trim() || "Tidak ada alasan";
      const { count, limit } = addWarn(db, gid, target);

      if (count > limit) {
        // melebihi batas -> kick (jika bot admin)
        if (isBotAdmin) {
          try {
            await kick(sock, gid, [target]);
          } catch {}
        }
        resetWarn(db, gid, target);
        return m.reply({
          text: `🚫 @${jidToUser(target)} dikeluarkan (melebihi batas ${limit} peringatan).`,
          mentions: [target],
        });
      }

      return m.reply({
        text:
          `⚠️ @${jidToUser(target)} diberi peringatan!\n` +
          `Alasan: ${reason}\n` +
          `Peringatan: *${count}/${limit}*\n` +
          `_Lebih dari ${limit}x akan dikeluarkan._`,
        mentions: [target],
      });
    }

    if (command === "unwarn") {
      const { count, limit } = removeWarn(db, gid, target);
      return m.reply({
        text: `✅ Peringatan @${jidToUser(target)} dikurangi. Sekarang: *${count}/${limit}*`,
        mentions: [target],
      });
    }

    if (command === "resetwarn") {
      resetWarn(db, gid, target);
      return m.reply({
        text: `✅ Peringatan @${jidToUser(target)} direset menjadi 0.`,
        mentions: [target],
      });
    }
  },
};
