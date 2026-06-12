/**
 * plugins/group/kick.js — Keluarkan member dari grup
 */
import { resolveTargets, kick } from "../../lib/group-actions.js";
import { decodeJid, jidToUser, sameUser } from "../../lib/jid.js";

export default {
  command: ["kick", "tendang"],
  category: "group",
  desc: "Keluarkan member (tag/reply/ketik nomor)",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, participants, botJid, botLid, config, prefix } = ctx;
    const targets = resolveTargets(m, ctx);
    if (!targets.length)
      return m.reply(
        `Tag / reply / ketik nomor member yang ingin dikeluarkan.\nContoh: *${prefix}kick @user*`
      );

    const ownerUsers = config.ownerNumber.map((o) => String(o).replace(/[^0-9]/g, ""));

    const safe = targets.filter((t) => {
      // jangan kick bot sendiri
      if (sameUser(t, { id: botJid }) || (botLid && sameUser(t, { id: botLid })))
        return false;
      // jangan kick owner bot
      if (ownerUsers.includes(jidToUser(t))) return false;
      // jangan kick admin grup
      const isAdm = participants.find(
        (p) =>
          sameUser(t, p) && (p.admin === "admin" || p.admin === "superadmin")
      );
      return !isAdm;
    });

    if (!safe.length)
      return m.reply("❌ Target tidak valid (admin/owner/bot tidak bisa dikeluarkan).");

    try {
      await kick(sock, m.chat, safe);
      await m.reply(
        {
          text: `✅ Berhasil mengeluarkan:\n${safe
            .map((t) => `• @${jidToUser(t)}`)
            .join("\n")}`,
          mentions: safe,
        }
      );
    } catch (e) {
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
