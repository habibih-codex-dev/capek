/**
 * plugins/islami/jadwalsholat.js — Jadwal sholat hari ini
 */
import { jadwalSholat } from "../../lib/scraper.js";

export default {
  command: ["jadwalsholat", "jadwalsolat", "sholat", "shalat"],
  category: "islami",
  desc: "Lihat jadwal sholat hari ini",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, db } = ctx;
    const g = m.isGroup ? db.group(m.chat) : null;
    const kota = text || g?.kota || config.islami.defaultCity;

    await m.react("⏳");
    try {
      const j = await jadwalSholat(kota, config.islami.method);
      const h = j.hijri;
      const tanggal = j.date?.readable || "";
      const hijri = h ? `${h.day} ${h.month?.en} ${h.year} H` : "";

      const teks =
        `🕌 *JADWAL SHOLAT*\n` +
        `📍 ${kota}\n` +
        `📅 ${tanggal}${hijri ? ` / ${hijri}` : ""}\n\n` +
        `🌙 Imsak   : ${j.timings.Imsak}\n` +
        `🌅 Subuh   : ${j.timings.Subuh}\n` +
        `☀️ Terbit  : ${j.timings.Terbit}\n` +
        `🌤️ Dzuhur  : ${j.timings.Dzuhur}\n` +
        `🌇 Ashar   : ${j.timings.Ashar}\n` +
        `🌆 Maghrib : ${j.timings.Maghrib}\n` +
        `🌃 Isya    : ${j.timings.Isya}\n\n` +
        `${config.watermark}`;

      await m.reply(teks);
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(
        `Gagal mengambil jadwal untuk *${kota}*. Pastikan nama kota benar.\n_${e.message}_`
      );
    }
  },
};
