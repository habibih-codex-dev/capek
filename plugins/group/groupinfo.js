/**
 * plugins/group/groupinfo.js — Info grup & daftar admin
 * Penggunaan: .infogc | .listadmin
 */
import { decodeJid, jidToUser, getGroupAdmins } from "../../lib/jid.js";

export default {
  command: ["infogc", "groupinfo", "listadmin", "admin"],
  category: "group",
  desc: "Info grup / daftar admin",
  group: true,

  run: async (m, ctx) => {
    const { command, groupMetadata, participants, config } = ctx;
    if (!groupMetadata) return m.reply(config.messages.error);

    const admins = getGroupAdmins(participants);

    if (command === "listadmin" || command === "admin") {
      let teks = `👮 *ADMIN ${groupMetadata.subject}*\n\n`;
      teks += admins.map((a) => `➥ @${jidToUser(a)}`).join("\n");
      return m.reply({ text: teks, mentions: admins });
    }

    const owner = groupMetadata.owner ? decodeJid(groupMetadata.owner) : admins[0];
    const teks =
      `📋 *INFO GRUP*\n\n` +
      `🏷️ Nama : ${groupMetadata.subject}\n` +
      `🆔 ID : ${groupMetadata.id}\n` +
      `👥 Member : ${participants.length}\n` +
      `👮 Admin : ${admins.length}\n` +
      `👑 Pembuat : ${owner ? "@" + jidToUser(owner) : "-"}\n` +
      `📝 Deskripsi :\n${groupMetadata.desc || "-"}`;

    await m.reply({ text: teks, mentions: owner ? [owner] : [] });
  },
};
