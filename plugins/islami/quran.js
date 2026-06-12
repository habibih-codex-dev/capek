/**
 * plugins/islami/quran.js — Daftar surah & info surah (online: equran.id)
 * .listsurah            -> daftar 114 surah
 * .surah <nomor>        -> info surah + audio
 */
import { quranListSurah, quranSurah } from "../../lib/scraper.js";

export default {
  command: ["quran", "surah", "listsurah", "alquran"],
  category: "islami",
  desc: "Daftar & info surah Al-Qur'an",
  scope: "both",

  run: async (m, ctx) => {
    const { command, text, prefix, config } = ctx;
    await m.react("⏳");
    try {
      if (command === "surah" && text) {
        const s = await quranSurah(text);
        const audio = s.audioFull
          ? Object.values(s.audioFull)[0]
          : "";
        const teks =
          `📖 *${s.nomor}. ${s.namaLatin}* (${s.nama})\n` +
          `Arti: ${s.arti}\n` +
          `Jumlah ayat: ${s.jumlahAyat}\n` +
          `Tempat turun: ${s.tempatTurun}\n\n` +
          `${s.deskripsi ? s.deskripsi.replace(/<[^>]+>/g, "").slice(0, 500) + "...\n\n" : ""}` +
          `Baca ayat: *${prefix}ayat ${s.nomor}:1*\n${config.watermark}`;
        await m.reply(teks);
        if (audio) {
          try {
            await m.reply({ audio: { url: audio }, mimetype: "audio/mpeg" });
          } catch {}
        }
        await m.react("✅");
        return;
      }

      // daftar surah
      const list = await quranListSurah();
      let teks = `📖 *DAFTAR SURAH AL-QUR'AN*\n\n`;
      teks += list
        .map((s) => `${s.nomor}. ${s.namaLatin} (${s.arti}) — ${s.jumlahAyat} ayat`)
        .join("\n");
      teks += `\n\nDetail: *${prefix}surah <nomor>*\nAyat: *${prefix}ayat <surah>:<ayat>*`;
      await m.reply(teks);
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Gagal mengambil data Al-Qur'an.\n_${e.message}_`);
    }
  },
};
