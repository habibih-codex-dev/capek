/**
 * plugins/info/lirik.js — Cari lirik lagu (online, best-effort)
 */
import { lirik } from "../../lib/scraper.js";

export default {
  command: ["lirik", "lyrics"],
  category: "info",
  desc: "Cari lirik lagu",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    if (!text)
      return m.reply(`Contoh: *${prefix}lirik Coldplay Yellow* (artis judul)`);
    await m.react("⏳");
    try {
      let lyr = await lirik(text);
      if (lyr.length > 3500) lyr = lyr.slice(0, 3500) + "...";
      await m.reply(`🎵 *LIRIK: ${text}*\n\n${lyr}`);
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Lirik tidak ditemukan. Coba format: *artis judul*.\n_${e.message}_`);
    }
  },
};
