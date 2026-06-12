/**
 * plugins/islami/dzikir.js — Dzikir & sholawat (offline)
 */
import { DZIKIR, SHOLAWAT } from "../../lib/islami-data.js";
import { pickRandom } from "../../lib/myfunc.js";

export default {
  command: ["dzikir", "sholawat", "zikir"],
  category: "islami",
  desc: "Dzikir & sholawat",
  scope: "both",

  run: async (m, ctx) => {
    if (ctx.command === "sholawat") {
      return m.reply(`🕊️ *Sholawat*\n\n${pickRandom(SHOLAWAT)}`);
    }
    await m.reply(`📿 *DZIKIR*\n\n${DZIKIR.map((d) => `• ${d}`).join("\n\n")}`);
  },
};
