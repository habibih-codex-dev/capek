/**
 * plugins/sticker/toimg.js — Stiker -> Gambar
 */
import { stickerToImage } from "../../lib/sticker.js";

export default {
  command: ["toimg", "toimage"],
  category: "sticker",
  desc: "Ubah stiker menjadi gambar (reply stiker)",
  scope: "both",

  run: async (m, ctx) => {
    const { config } = ctx;
    if (!m.quoted || m.quoted.type !== "stickerMessage")
      return m.reply("Reply *stiker* (bukan animasi) yang ingin diubah jadi gambar.");

    await m.react("⏳");
    try {
      const buffer = await m.quoted.download();
      const png = await stickerToImage(buffer);
      await m.reply({ image: png, caption: config.watermark });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
