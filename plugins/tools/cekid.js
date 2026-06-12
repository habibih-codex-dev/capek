/**
 * plugins/tools/cekid.js — Lihat JID/LID & info pengirim (offline)
 */
import { jidToUser } from "../../lib/jid.js";

export default {
  command: ["cekid", "id", "myid", "tagme"],
  category: "tools",
  desc: "Lihat JID/LID & info kamu",
  scope: "both",

  run: async (m, ctx) => {
    const { isOwner, isPremium, isAdmin, isBotAdmin, botJid, botLid } = ctx;
    const teks =
      `🪪 *INFO ID*\n\n` +
      `👤 Nama : ${m.pushName || "-"}\n` +
      `🆔 Sender JID : ${m.sender}\n` +
      `🔗 Sender LID : ${m.senderLid || "-"}\n` +
      `📱 Nomor : ${jidToUser(m.sender)}\n` +
      `💬 Chat : ${m.chat}\n` +
      `👥 Di grup : ${m.isGroup ? "Ya" : "Tidak"}\n` +
      (m.isGroup ? `👮 Admin : ${isAdmin ? "Ya" : "Tidak"}\n🤖 Bot admin : ${isBotAdmin ? "Ya" : "Tidak"}\n` : "") +
      `👑 Owner : ${isOwner ? "Ya" : "Tidak"}\n` +
      `💎 Premium : ${isPremium ? "Ya" : "Tidak"}\n` +
      `\n🤖 Bot JID : ${botJid}\n🔗 Bot LID : ${botLid || "-"}`;
    await m.reply(teks);
  },
};
