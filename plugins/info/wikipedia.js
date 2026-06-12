/**
 * plugins/info/wikipedia.js — Ringkasan Wikipedia (online)
 */
import { wikipedia } from "../../lib/scraper.js";

export default {
  command: ["wikipedia", "wiki"],
  category: "info",
  desc: "Cari ringkasan artikel Wikipedia",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix, config } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}wiki Soekarno*`);
    await m.react("⏳");
    try {
      const w = await wikipedia(text);
      const caption =
        `📖 *${w.judul}*\n\n${w.ringkasan}\n\n` + (w.url ? `🔗 ${w.url}` : "");
      if (w.thumb) {
        await m.reply({ image: { url: w.thumb }, caption });
      } else {
        await m.reply(caption);
      }
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Artikel tidak ditemukan.\n_${e.message}_`);
    }
  },
};
