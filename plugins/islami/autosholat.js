/**
 * plugins/islami/autosholat.js — Pengingat sholat otomatis (admin)
 * Penggunaan:
 *   .autosholat on | off
 *   .autosholat sound on | off
 */
export default {
  command: ["autosholat", "autosolat"],
  category: "islami",
  desc: "Aktifkan pengingat sholat otomatis di grup",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { db, args, prefix, config } = ctx;
    const g = db.group(m.chat);
    const a = (args[0] || "").toLowerCase();
    const b = (args[1] || "").toLowerCase();

    if (a === "sound") {
      if (b !== "on" && b !== "off")
        return m.reply(`Gunakan: *${prefix}autosholat sound on/off*`);
      g.autosholatSound = b === "on";
      db.markDirty();
      if (g.autosholatSound && !config.islami.adzanUrl)
        return m.reply(
          `🔊 Suara adzan diaktifkan, tetapi URL adzan belum diatur di config. Notif tetap berupa teks + gambar.`
        );
      return m.reply(`✅ Suara adzan *${b.toUpperCase()}*.`);
    }

    if (a === "on" || a === "off") {
      g.autosholat = a === "on";
      db.markDirty();
      const kota = g.kota || config.islami.defaultCity;
      return m.reply(
        a === "on"
          ? `✅ Auto-sholat *AKTIF* untuk kota *${kota}*.\n` +
              `Pengingat dikirim *${config.islami.reminderBeforeMinutes} menit sebelum* & *saat* waktu sholat.\n` +
              `Ubah kota: *${prefix}setkota <kota>* | Suara: *${prefix}autosholat sound on*`
          : `✅ Auto-sholat *NONAKTIF*.`
      );
    }

    return m.reply(
      `🕌 *AUTO-SHOLAT*\n` +
        `Status : ${g.autosholat ? "🟢 ON" : "🔴 OFF"}\n` +
        `Suara  : ${g.autosholatSound ? "🟢 ON" : "🔴 OFF"}\n` +
        `Kota   : ${g.kota || config.islami.defaultCity + " (default)"}\n\n` +
        `• *${prefix}autosholat on/off*\n` +
        `• *${prefix}autosholat sound on/off*\n` +
        `• *${prefix}setkota <kota>*`
    );
  },
};
