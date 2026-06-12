/**
 * plugins/sticker/sticker.js — Gambar/Video -> Stiker
 */
import { getMedia, hasMedia, makeSticker } from "../../lib/sticker.js";

export default {
  command: ["sticker", "s", "stiker"],
  category: "sticker",
  desc: "Ubah gambar/video jadi stiker (reply atau kirim media + caption)",
  scope: "both",

  run: async (m, ctx) => {
    const { config, prefix } = ctx;
    if (!hasMedia(m))
      return m.reply(
        `Kirim atau reply *gambar/video* dengan caption *${prefix}sticker*`
      );

    await m.react("⏳");
    const buffer = await getMedia(m);
    if (!buffer) return m.reply(config.messages.error);

    try {
      const webp = await makeSticker(buffer, {
        pack: config.botName,
        author: config.ownerName,
      });
      await m.reply({ sticker: webp });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(
        `Gagal membuat stiker.\nUntuk video/GIF pastikan *ffmpeg* ter-install di server.\n_${e.message}_`
      );
    }
  },
};
