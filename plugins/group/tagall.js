/**
 * plugins/group/tagall.js — Tag semua member grup
 */
import { decodeJid, jidToUser } from "../../lib/jid.js";

export default {
  command: ["tagall", "tagsemua"],
  category: "group",
  desc: "Tag semua member grup",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { participants, config, text, pushName } = ctx;
    const members = participants.map((p) => decodeJid(p.id));
    if (!members.length) return m.reply(config.messages.error);

    const note = text || "Tanpa pesan";
    let teks = `📢 *TAG ALL*\n📝 ${note}\n\n`;
    for (const j of members) teks += `➥ @${jidToUser(j)}\n`;
    teks += `\n${config.watermark}`;

    await m.reply({ text: teks, mentions: members });
  },
};
