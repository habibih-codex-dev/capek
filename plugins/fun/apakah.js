/**
 * plugins/fun/apakah.js — Bola ajaib / jawab pertanyaan ya-tidak (offline)
 */
import { pickRandom } from "../../lib/myfunc.js";

const JAWAB = [
  "Ya, pasti! ✅",
  "Tidak. ❌",
  "Mungkin saja 🤔",
  "Sudah jelas iya! 💯",
  "Jangan harap 😂",
  "Coba tanya lagi nanti ⏳",
  "Sepertinya begitu 👍",
  "Tidak mungkin 🙅",
  "Insya Allah 🤲",
  "Yakin? Tidak. 😏",
];

export default {
  command: ["apakah", "bola8", "8ball"],
  category: "fun",
  desc: "Jawaban acak untuk pertanyaanmu",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    if (!text) return m.reply(`Tanya sesuatu.\nContoh: *${prefix}apakah dia jodohku?*`);
    await m.reply(`🎱 *${text}*\n\n➥ ${pickRandom(JAWAB)}`);
  },
};
