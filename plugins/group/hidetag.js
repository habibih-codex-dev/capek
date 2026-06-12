/**
 * plugins/group/hidetag.js — Mention semua member tanpa menampilkan tag
 */
import { decodeJid } from "../../lib/jid.js";

export default {
  command: ["hidetag", "h", "htag"],
  category: "group",
  desc: "Mention semua member secara tersembunyi",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { sock, participants, config, text } = ctx;
    const members = participants.map((p) => decodeJid(p.id));

    // Jika me-reply pesan, teruskan pesan itu ke semua (hidden mention)
    let content = text;
    if (!content && m.quoted) content = m.quoted.body || "";
    if (!content) content = config.watermark;

    await sock.sendMessage(m.chat, { text: content, mentions: members });
  },
};
