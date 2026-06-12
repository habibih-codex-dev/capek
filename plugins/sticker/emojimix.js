/**
 * plugins/sticker/emojimix.js — Gabung 2 emoji menjadi stiker (Emoji Kitchen)
 */
import { emojiMix } from "../../lib/scraper.js";
import { makeSticker } from "../../lib/sticker.js";

export default {
  command: ["emojimix", "emix"],
  category: "sticker",
  desc: "Gabungkan 2 emoji jadi stiker",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}emojimix 😀+😭* atau *${prefix}emojimix 😀 😭*`);

    const parts = text.includes("+") ? text.split("+") : text.split(/\s+/);
    const e1 = (parts[0] || "").trim();
    const e2 = (parts[1] || "").trim();
    if (!e1 || !e2) return m.reply(`Butuh 2 emoji.\nContoh: *${prefix}emojimix 😀+😭*`);

    await m.react("⏳");
    try {
      const png = await emojiMix(e1, e2);
      const webp = await makeSticker(png, {
        pack: config.botName,
        author: config.ownerName,
      });
      await m.reply({ sticker: webp });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(
        `Gagal menggabungkan emoji (kombinasi mungkin tidak didukung).\n_${e.message}_`
      );
    }
  },
};
