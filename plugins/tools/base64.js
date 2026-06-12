/**
 * plugins/tools/base64.js — Encode/Decode Base64 (offline)
 * Penggunaan: .base64 enc <teks> | .base64 dec <base64>
 */
export default {
  command: ["base64", "b64"],
  category: "tools",
  desc: "Encode/decode Base64",
  scope: "both",

  run: async (m, ctx) => {
    const { args, prefix } = ctx;
    const mode = (args[0] || "").toLowerCase();
    const data = args.slice(1).join(" ");
    if (!["enc", "encode", "dec", "decode"].includes(mode) || !data)
      return m.reply(
        `Penggunaan:\n*${prefix}base64 enc <teks>*\n*${prefix}base64 dec <base64>*`
      );

    try {
      if (mode.startsWith("enc")) {
        return m.reply(Buffer.from(data, "utf-8").toString("base64"));
      }
      return m.reply(Buffer.from(data, "base64").toString("utf-8"));
    } catch {
      await m.reply("❌ Gagal memproses data.");
    }
  },
};
