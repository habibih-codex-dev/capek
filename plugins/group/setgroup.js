/**
 * plugins/group/setgroup.js — Ubah nama / deskripsi grup
 * Penggunaan:
 *   .setname <nama baru>
 *   .setdesc <deskripsi baru>
 */
export default {
  command: ["setname", "setsubject", "setdesc", "setdescription"],
  category: "group",
  desc: "Ubah nama / deskripsi grup",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, command, text, config, prefix } = ctx;
    if (!text)
      return m.reply(
        `Ketik teks baru.\nContoh: *${prefix}${command} ${
          command.includes("desc") ? "Deskripsi baru..." : "Nama Grup Baru"
        }*`
      );

    try {
      if (command === "setname" || command === "setsubject") {
        await sock.groupUpdateSubject(m.chat, text);
        return m.reply(`✅ Nama grup diubah menjadi:\n*${text}*`);
      }
      await sock.groupUpdateDescription(m.chat, text);
      return m.reply(`✅ Deskripsi grup berhasil diperbarui.`);
    } catch (e) {
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
