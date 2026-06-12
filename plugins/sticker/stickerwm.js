/**
 * plugins/sticker/stickerwm.js — Stiker dengan watermark custom / ganti watermark
 * Penggunaan:
 *   .swm packname|author        (kirim/reply media)
 *   .take packname|author       (reply stiker untuk ganti wm)
 */
import { getMedia, hasMedia, makeSticker } from "../../lib/sticker.js";

export default {
  command: ["stickerwm", "swm", "take", "wm"],
  category: "sticker",
  desc: "Stiker dengan watermark custom (packname|author)",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, prefix, command } = ctx;
    if (!hasMedia(m))
      return m.reply(
        `Kirim/reply media atau stiker dengan:\n*${prefix}${command} packname|author*`
      );

    let pack = config.botName;
    let author = config.ownerName;
    if (text && text.includes("|")) {
      const [p, a] = text.split("|");
      pack = p.trim() || pack;
      author = a.trim() || author;
    } else if (text) {
      pack = text.trim();
    }

    await m.react("⏳");
    const buffer = await getMedia(m);
    if (!buffer) return m.reply(config.messages.error);

    try {
      const webp = await makeSticker(buffer, { pack, author });
      await m.reply({ sticker: webp });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
