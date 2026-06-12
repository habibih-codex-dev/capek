/**
 * plugins/group/del.js — Hapus pesan (reply pesan yang ingin dihapus)
 */
export default {
  command: ["del", "delete", "d"],
  category: "group",
  desc: "Hapus pesan (reply pesan target)",
  group: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, config } = ctx;
    if (!m.quoted)
      return m.reply("Reply pesan yang ingin dihapus, lalu ketik perintah ini.");

    try {
      await sock.sendMessage(m.chat, { delete: m.quoted.key });
    } catch (e) {
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
