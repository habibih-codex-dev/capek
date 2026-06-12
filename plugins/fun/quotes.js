/**
 * plugins/fun/quotes.js — Kutipan motivasi acak (offline)
 */
import { pickRandom } from "../../lib/myfunc.js";

const QUOTES = [
  "Kerja keras tidak pernah mengkhianati hasil.",
  "Mulailah dari mana kamu berada, gunakan apa yang kamu punya.",
  "Jangan menyerah, hal hebat butuh waktu.",
  "Kegagalan adalah guru terbaik, bukan lawan.",
  "Sukses adalah penjumlahan dari usaha kecil yang diulang tiap hari.",
  "Lebih baik mencoba dan gagal daripada tidak pernah mencoba.",
  "Masa depan milik mereka yang percaya pada keindahan mimpinya.",
  "Disiplin adalah jembatan antara tujuan dan pencapaian.",
];

export default {
  command: ["quotes", "quote", "motivasi"],
  category: "fun",
  desc: "Kutipan motivasi acak",
  scope: "both",

  run: async (m) => {
    await m.reply(`📜 _"${pickRandom(QUOTES)}"_`);
  },
};
