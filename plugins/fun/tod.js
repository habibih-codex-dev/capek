/**
 * plugins/fun/tod.js — Truth or Dare (data lokal, offline)
 */
import { pickRandom } from "../../lib/myfunc.js";

const TRUTH = [
  "Siapa orang terakhir yang kamu stalk di sosmed?",
  "Pernah nggak suka sama teman sendiri? Jujur!",
  "Apa hal paling memalukan yang pernah kamu lakukan?",
  "Siapa gebetan kamu sekarang?",
  "Pernah bohong ke orang tua soal apa?",
  "Apa rahasia yang belum pernah kamu ceritakan ke siapa pun?",
  "Lebih milih kaya tapi sendiri, atau biasa aja tapi bahagia?",
  "Siapa nama kontak WA yang paling sering kamu chat?",
];

const DARE = [
  "Kirim stiker paling lucu yang kamu punya sekarang!",
  "Ketik 'Aku ganteng/cantik' di grup ini.",
  "Voice note nyanyi 10 detik sekarang!",
  "Ganti foto profil jadi emoji selama 1 jam.",
  "Tag 3 orang dan bilang 'kamu spesial'.",
  "Ceritakan kejadian terlucu hari ini.",
  "Kirim screenshot chat terakhir kamu (yang aman).",
  "Bikin pantun buat satu orang di grup ini.",
];

export default {
  command: ["truth", "dare"],
  category: "fun",
  desc: "Game Truth or Dare",
  scope: "both",

  run: async (m, ctx) => {
    const { command } = ctx;
    const list = command === "dare" ? DARE : TRUTH;
    const emoji = command === "dare" ? "😈" : "🤔";
    await m.reply(`${emoji} *${command.toUpperCase()}*\n\n${pickRandom(list)}`);
  },
};
