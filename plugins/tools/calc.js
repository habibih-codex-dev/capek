/**
 * plugins/tools/calc.js — Kalkulator sederhana (offline)
 */
export default {
  command: ["calc", "kalkulator", "hitung"],
  category: "tools",
  desc: "Hitung ekspresi matematika",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}calc (5+3)*2*`);

    // Hanya izinkan karakter aman
    const expr = text.replace(/[^0-9+\-*/().%\s]/g, "");
    if (!expr.trim()) return m.reply("❌ Ekspresi tidak valid.");

    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      if (result === undefined || Number.isNaN(result))
        return m.reply("❌ Ekspresi tidak valid.");
      await m.reply(`🧮 *${expr.trim()}* = *${result}*`);
    } catch {
      await m.reply("❌ Ekspresi tidak valid.");
    }
  },
};
