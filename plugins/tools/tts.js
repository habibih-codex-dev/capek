/**
 * plugins/tools/tts.js — Teks menjadi suara (Google TTS, tanpa API key)
 * Catatan: butuh internet. Maks ~200 karakter.
 */
import { fetchBuffer } from "../../lib/scraper.js";

export default {
  command: ["tts"],
  category: "tools",
  desc: "Ubah teks menjadi suara",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, args, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}tts Halo semua* atau *${prefix}tts en Hello*`);

    // bahasa opsional di argumen pertama (id/en/ja/dst), default id
    let lang = "id";
    let say = text;
    if (/^[a-z]{2}$/i.test(args[0])) {
      lang = args[0].toLowerCase();
      say = args.slice(1).join(" ");
    }
    if (!say) return m.reply("Teks kosong.");
    if (say.length > 200) say = say.slice(0, 200);

    await m.react("⏳");
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        say
      )}&tl=${lang}&client=tw-ob`;
      const audio = await fetchBuffer(url);
      await m.reply({ audio, mimetype: "audio/mpeg", ptt: true });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Gagal membuat suara.\n_${e.message}_`);
    }
  },
};
