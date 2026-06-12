/**
 * plugins/fun/cek.js — Cek-cekan iseng (jodoh, ganteng, cantik, kapankawin, rate)
 * Semua hasil acak untuk hiburan (offline).
 */
import { jidToUser } from "../../lib/jid.js";

function persen() {
  return Math.floor(Math.random() * 101);
}

export default {
  command: [
    "cekjodoh",
    "cekganteng",
    "cekcantik",
    "kapankawin",
    "rate",
    "cekbucin",
    "cekgoblok",
  ],
  category: "fun",
  desc: "Cek-cekan iseng (hiburan)",
  scope: "both",

  run: async (m, ctx) => {
    const { command, text } = ctx;
    // target: mention -> teks -> diri sendiri
    let target = m.mentionedJid?.[0] || null;
    let label = target ? `@${jidToUser(target)}` : text || m.pushName || "Kamu";
    const mentions = target ? [target] : [];

    let out = "";
    switch (command) {
      case "cekjodoh": {
        const p = persen();
        out = `💞 *CEK JODOH*\n${label} & gebetan: *${p}%* cocok!\n${
          p > 70 ? "Lanjutkan! 🔥" : p > 40 ? "Lumayan 😅" : "Sabar ya 😂"
        }`;
        break;
      }
      case "cekganteng":
        out = `😎 Tingkat kegantengan ${label}: *${persen()}%*`;
        break;
      case "cekcantik":
        out = `🌸 Tingkat kecantikan ${label}: *${persen()}%*`;
        break;
      case "cekbucin":
        out = `🥰 Level bucin ${label}: *${persen()}%*`;
        break;
      case "cekgoblok":
        out = `🤪 Tingkat kegoblokan ${label}: *${persen()}%* (just kidding 😆)`;
        break;
      case "rate":
        out = `⭐ Rate ${label}: *${persen()}/100*`;
        break;
      case "kapankawin": {
        const tahun = new Date().getFullYear() + Math.floor(Math.random() * 8) + 1;
        out = `💍 ${label} diperkirakan menikah tahun *${tahun}* 😏`;
        break;
      }
    }

    await m.reply({ text: out, mentions });
  },
};
