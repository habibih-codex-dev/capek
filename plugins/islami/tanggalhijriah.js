/**
 * plugins/islami/tanggalhijriah.js — Konversi tanggal Masehi -> Hijriah
 */
import { hijriDate } from "../../lib/scraper.js";

export default {
  command: ["tanggalhijriah", "hijriah", "hijri", "kalenderhijriah"],
  category: "islami",
  desc: "Lihat tanggal Hijriah hari ini",
  scope: "both",

  run: async (m, ctx) => {
    await m.react("⏳");
    try {
      const h = await hijriDate(new Date());
      const teks =
        `📅 *TANGGAL HIJRIAH*\n\n` +
        `${h.weekday?.en || ""}\n` +
        `*${h.day} ${h.month?.en} ${h.year} H*\n` +
        `(${h.month?.ar} / ${h.day}-${h.month?.number}-${h.year})`;
      await m.reply(teks);
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`Gagal mengonversi tanggal.\n_${e.message}_`);
    }
  },
};
