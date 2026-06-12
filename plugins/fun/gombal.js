/**
 * plugins/fun/gombal.js — Kata-kata gombal acak (offline)
 */
import { pickRandom } from "../../lib/myfunc.js";

const GOMBAL = [
  "Kamu capek nggak? Soalnya dari tadi kamu lari-lari di pikiranku.",
  "Aku bukan tukang parkir, tapi bisa bantu kamu mundur ke pelukanku.",
  "Kalau kamu jadi wifi, aku mau connect selamanya.",
  "Namamu siapa? Soalnya udah aku simpan di hati.",
  "Aku gak jago matematika, tapi aku tahu kita berdua = jodoh.",
  "Kamu pasti capek ya, jadi bayangan di mimpiku tiap malam.",
  "Kalau cinta itu penjara, aku rela dipenjara sama kamu seumur hidup.",
  "Kamu tahu nggak bedanya kamu sama bintang? Bintang di langit, kamu di hatiku.",
];

export default {
  command: ["gombal", "rayuan"],
  category: "fun",
  desc: "Kata-kata gombal acak",
  scope: "both",

  run: async (m) => {
    await m.reply(`💘 ${pickRandom(GOMBAL)}`);
  },
};
