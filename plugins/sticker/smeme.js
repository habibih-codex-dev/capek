/**
 * plugins/sticker/smeme.js — Stiker meme (teks atas|bawah pada media)
 * Penggunaan: .smeme teksatas|teksbawah  (reply/kirim gambar)
 */
import { getMedia, hasMedia, memeImage, makeSticker } from "../../lib/sticker.js";

export default {
  command: ["smeme", "memesticker"],
  category: "sticker",
  desc: "Buat stiker meme (teks atas|bawah)",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, prefix } = ctx;
    if (!hasMedia(m))
      return m.reply(
        `Kirim/reply gambar dengan caption:\n*${prefix}smeme teks atas|teks bawah*`
      );
    if (!text)
      return m.reply(`Tambahkan teks.\nContoh: *${prefix}smeme atas|bawah*`);

    const [top, bottom] = text.split("|");
    await m.react("⏳");
    const buffer = await getMedia(m);
    if (!buffer) return m.reply(config.messages.error);

    try {
      const png = await memeImage(buffer, (top || "").trim(), (bottom || "").trim());
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
