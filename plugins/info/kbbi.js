/**
 * plugins/info/kbbi.js — Arti kata menurut KBBI (online, best-effort)
 */
import { kbbi } from "../../lib/scraper.js";

export default {
  command: ["kbbi", "arti"],
  category: "info",
  desc: "Cari arti kata di KBBI",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}kbbi gembira*`);
    await m.react("⏳");
    try {
      const data = await kbbi(text);
      let teks = `📚 *KBBI: ${text}*\n\n`;
      if (Array.isArray(data)) {
        teks += JSON.stringify(data, null, 2).slice(0, 1500);
      } else if (data.arti) {
        teks += (Array.isArray(data.arti) ? data.arti : [data.arti])
          .map((a, i) => `${i + 1}. ${typeof a === "string" ? a : a.deskripsi || a.arti}`)
          .join("\n");
      } else {
        teks += JSON.stringify(data).slice(0, 1500);
      }
      await m.reply(teks.trim());
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Kata tidak ditemukan / layanan KBBI sedang tidak tersedia.\n_${e.message}_`);
    }
  },
};
