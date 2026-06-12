/**
 * plugins/islami/doa.js — Doa harian (offline)
 * .doa <kata kunci>  |  .listdoa
 */
import { DOA } from "../../lib/islami-data.js";

export default {
  command: ["doa", "listdoa"],
  category: "islami",
  desc: "Doa harian",
  scope: "both",

  run: async (m, ctx) => {
    const { command, text, prefix } = ctx;
    const keys = Object.keys(DOA);

    if (command === "listdoa" || !text) {
      return m.reply(
        `📿 *DAFTAR DOA*\n\n` +
          keys.map((k) => `• ${prefix}doa ${k}`).join("\n") +
          `\n\nContoh: *${prefix}doa bangun tidur*`
      );
    }

    const q = text.toLowerCase().trim();
    const key = keys.find((k) => k.includes(q) || q.includes(k));
    if (!key)
      return m.reply(
        `Doa "${text}" tidak ditemukan. Ketik *${prefix}listdoa* untuk daftar.`
      );

    const d = DOA[key];
    await m.reply(
      `📿 *Doa ${key}*\n\n${d.arab}\n\n_${d.latin}_\n\n"${d.arti}"`
    );
  },
};
