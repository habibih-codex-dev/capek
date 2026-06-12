/**
 * plugins/tools/binary.js — Teks <-> Biner (offline)
 * Penggunaan: .binary enc <teks> | .binary dec <biner>
 */
export default {
  command: ["binary", "biner"],
  category: "tools",
  desc: "Konversi teks <-> biner",
  scope: "both",

  run: async (m, ctx) => {
    const { args, prefix } = ctx;
    const mode = (args[0] || "").toLowerCase();
    const data = args.slice(1).join(" ");
    if (!["enc", "encode", "dec", "decode"].includes(mode) || !data)
      return m.reply(
        `Penggunaan:\n*${prefix}binary enc <teks>*\n*${prefix}binary dec <biner>*`
      );

    try {
      if (mode.startsWith("enc")) {
        const bin = data
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ");
        return m.reply(bin);
      }
      const txt = data
        .trim()
        .split(/\s+/)
        .map((b) => String.fromCharCode(parseInt(b, 2)))
        .join("");
      return m.reply(txt);
    } catch {
      await m.reply("❌ Gagal memproses data.");
    }
  },
};
