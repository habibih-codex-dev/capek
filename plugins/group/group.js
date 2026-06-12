/**
 * plugins/group/group.js — Buka/tutup grup, link undangan, reset link
 * Penggunaan:
 *   .group open | close
 *   .linkgc
 *   .revoke
 */
export default {
  command: ["group", "grup", "linkgc", "revoke", "resetlink"],
  category: "group",
  desc: "Buka/tutup grup, ambil/reset link undangan",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, command, args, config, prefix, groupMetadata } = ctx;

    // Ambil link undangan
    if (command === "linkgc") {
      const code = await sock.groupInviteCode(m.chat);
      return m.reply(
        `🔗 Link grup *${groupMetadata?.subject || ""}*:\nhttps://chat.whatsapp.com/${code}`
      );
    }

    // Reset link undangan
    if (command === "revoke" || command === "resetlink") {
      await sock.groupRevokeInvite(m.chat);
      return m.reply(`✅ Link undangan grup berhasil direset.`);
    }

    // Buka/tutup grup
    const sub = (args[0] || "").toLowerCase();
    if (sub === "close" || sub === "tutup") {
      await sock.groupSettingUpdate(m.chat, "announcement");
      return m.reply(`🔒 Grup ditutup. Hanya admin yang bisa kirim pesan.`);
    }
    if (sub === "open" || sub === "buka") {
      await sock.groupSettingUpdate(m.chat, "not_announcement");
      return m.reply(`🔓 Grup dibuka. Semua member bisa kirim pesan.`);
    }

    return m.reply(
      `⚙️ *PENGATURAN GRUP*\n` +
        `• *${prefix}group open* — buka grup\n` +
        `• *${prefix}group close* — tutup grup\n` +
        `• *${prefix}linkgc* — link undangan\n` +
        `• *${prefix}revoke* — reset link`
    );
  },
};
