/**
 * plugins/tools/qr.js — Buat QR code dari teks (offline)
 */
import QRCode from "qrcode";

export default {
  command: ["qr", "qrcode", "qrmaker"],
  category: "tools",
  desc: "Buat QR code dari teks/link",
  scope: "both",

  run: async (m, ctx) => {
    const { config, text, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}qr https://habibih.com*`);

    await m.react("⏳");
    try {
      const buffer = await QRCode.toBuffer(text, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      await m.reply({ image: buffer, caption: `🔳 QR Code\n${config.watermark}` });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
