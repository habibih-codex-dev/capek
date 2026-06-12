/**
 * plugins/fun/faktaunik.js — Fakta unik acak (offline)
 */
import { pickRandom } from "../../lib/myfunc.js";

const FAKTA = [
  "Madu tidak pernah basi; madu berusia ribuan tahun masih bisa dimakan.",
  "Gurita punya tiga jantung.",
  "Pisang secara botani termasuk buah beri, sedangkan stroberi bukan.",
  "Manusia berbagi sekitar 60% DNA dengan pisang.",
  "Hiu sudah ada lebih dulu dari pohon.",
  "Menara Eiffel bisa lebih tinggi ~15 cm saat musim panas karena pemuaian.",
  "Jantung udang berada di kepalanya.",
  "Tidak mungkin menyentuh siku dengan lidahmu sendiri (kebanyakan orang).",
];

export default {
  command: ["faktaunik", "fakta"],
  category: "fun",
  desc: "Fakta unik acak",
  scope: "both",

  run: async (m) => {
    await m.reply(`💡 *Tahukah kamu?*\n\n${pickRandom(FAKTA)}`);
  },
};
