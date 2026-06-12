/**
 * plugins/islami/niat.js — Niat sholat fardhu (offline)
 * .niat <subuh|dzuhur|ashar|maghrib|isya>
 */
import { NIAT } from "../../lib/islami-data.js";

export default {
  command: ["niat", "niatsholat"],
  category: "islami",
  desc: "Niat sholat fardhu",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    const key = (text || "").toLowerCase().trim();
    if (!NIAT[key]) {
      return m.reply(
        `🤲 *NIAT SHOLAT*\nPilih: ${Object.keys(NIAT).join(", ")}\n\nContoh: *${prefix}niat subuh*`
      );
    }
    await m.reply(`🤲 *Niat Sholat ${key.charAt(0).toUpperCase() + key.slice(1)}*\n\n${NIAT[key]}`);
  },
};
