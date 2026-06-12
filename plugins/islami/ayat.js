/**
 * plugins/islami/ayat.js — Tampilkan ayat tertentu / ayat acak (online)
 * .ayat <surah>:<ayat>   contoh: .ayat 2:255
 * .randomayat
 */
import { quranAyat, quranSurah } from "../../lib/scraper.js";

export default {
  command: ["ayat", "randomayat"],
  category: "islami",
  desc: "Tampilkan ayat Al-Qur'an",
  scope: "both",

  run: async (m, ctx) => {
    const { command, text, prefix, config } = ctx;
    await m.react("⏳");
    try {
      let surahNo, ayatNo;

      if (command === "randomayat") {
        surahNo = Math.floor(Math.random() * 114) + 1;
        const s = await quranSurah(surahNo);
        ayatNo = Math.floor(Math.random() * s.jumlahAyat) + 1;
      } else {
        if (!text || !text.includes(":"))
          return m.reply(`Format: *${prefix}ayat 2:255*`);
        [surahNo, ayatNo] = text.split(":").map((x) => parseInt(x.trim()));
      }

      const { surah, ayat } = await quranAyat(surahNo, ayatNo);
      const teks =
        `📖 *${surah.namaLatin} : ${ayat.nomorAyat}*\n\n` +
        `${ayat.teksArab}\n\n` +
        `_${ayat.teksLatin}_\n\n` +
        `"${ayat.teksIndonesia}"\n\n${config.watermark}`;
      await m.reply(teks);
      if (ayat.audio) {
        const url = Object.values(ayat.audio)[0];
        if (url) {
          try {
            await m.reply({ audio: { url }, mimetype: "audio/mpeg" });
          } catch {}
        }
      }
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Gagal mengambil ayat.\n_${e.message}_`);
    }
  },
};
