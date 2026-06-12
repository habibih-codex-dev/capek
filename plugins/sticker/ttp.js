/**
 * plugins/sticker/ttp.js — Teks -> Stiker (statis)
 */
import { renderTextPNG, makeSticker } from "../../lib/sticker.js";

export default {
  command: ["ttp"],
  category: "sticker",
  desc: "Ubah teks menjadi stiker",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, prefix } = ctx;
    const content = text || m.quoted?.body;
    if (!content) return m.reply(`Ketik teks.\nContoh: *${prefix}ttp Halo Dunia*`);

    await m.react("⏳");
    try {
      const png = await renderTextPNG(content, { color: "#ffffff", stroke: "#000000" });
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
