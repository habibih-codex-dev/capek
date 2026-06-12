/**
 * plugins/info/cuaca.js — Info cuaca kota (online, tanpa API key)
 */
import { cuaca } from "../../lib/scraper.js";

export default {
  command: ["cuaca", "weather"],
  category: "info",
  desc: "Cek cuaca suatu kota",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}cuaca Jakarta*`);
    await m.react("⏳");
    try {
      const c = await cuaca(text);
      await m.reply(
        `🌤️ *CUACA ${c.kota.toUpperCase()}*\n\n` +
          `🌡️ Suhu : ${c.suhu}°C (terasa ${c.terasa}°C)\n` +
          `☁️ Kondisi : ${c.kondisi}\n` +
          `💧 Kelembapan : ${c.kelembapan}%\n` +
          `💨 Angin : ${c.angin} km/jam`
      );
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Gagal mengambil data cuaca.\n_${e.message}_`);
    }
  },
};
