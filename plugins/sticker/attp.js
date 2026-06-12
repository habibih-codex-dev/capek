/**
 * plugins/sticker/attp.js — Teks -> Stiker warna-warni
 * (Animasi penuh butuh encoder GIF; di sini dibuat stiker statis berwarna acak.)
 */
import { renderTextPNG, makeSticker } from "../../lib/sticker.js";

const COLORS = ["#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#00c7be", "#007aff", "#af52de", "#ff2d55"];

export default {
  command: ["attp"],
  category: "sticker",
  desc: "Ubah teks menjadi stiker berwarna",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, prefix } = ctx;
    const content = text || m.quoted?.body;
    if (!content) return m.reply(`Ketik teks.\nContoh: *${prefix}attp Halo*`);

    await m.react("⏳");
    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const png = await renderTextPNG(content, { color, stroke: "#ffffff" });
      const webp = await makeSticker(png, {
        pack: config.botName,
        author: config.ownerName,
      });
      await m.reply({ sticker: webp });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
