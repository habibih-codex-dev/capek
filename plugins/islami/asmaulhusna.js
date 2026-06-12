/**
 * plugins/islami/asmaulhusna.js — 99 Asmaul Husna (offline)
 * .asmaulhusna           -> daftar lengkap
 * .asmaulhusna <1-99>    -> nama tertentu
 * .asmaulhusna random    -> acak
 */
import { ASMAUL_HUSNA } from "../../lib/islami-data.js";
import { pickRandom } from "../../lib/myfunc.js";

export default {
  command: ["asmaulhusna", "asmaul"],
  category: "islami",
  desc: "99 Asmaul Husna",
  scope: "both",

  run: async (m, ctx) => {
    const { args } = ctx;
    const a = (args[0] || "").toLowerCase();

    if (a === "random" || a === "acak") {
      const i = Math.floor(Math.random() * ASMAUL_HUSNA.length);
      const n = ASMAUL_HUSNA[i];
      return m.reply(`✨ *Asmaul Husna #${i + 1}*\n\n${n.ar}\n*${n.latin}*\n"${n.arti}"`);
    }

    const num = parseInt(a);
    if (num >= 1 && num <= 99) {
      const n = ASMAUL_HUSNA[num - 1];
      return m.reply(`✨ *Asmaul Husna #${num}*\n\n${n.ar}\n*${n.latin}*\n"${n.arti}"`);
    }

    let teks = `✨ *ASMAUL HUSNA (99 Nama Allah)*\n\n`;
    teks += ASMAUL_HUSNA.map(
      (n, i) => `${i + 1}. ${n.ar} *${n.latin}* — ${n.arti}`
    ).join("\n");
    await m.reply(teks);
  },
};
