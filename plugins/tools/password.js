/**
 * plugins/tools/password.js — Generator password acak (offline)
 */
export default {
  command: ["password", "genpass", "pass"],
  category: "tools",
  desc: "Buat password acak (default 12 karakter)",
  scope: "both",

  run: async (m, ctx) => {
    const { args } = ctx;
    let len = parseInt(args[0]) || 12;
    len = Math.max(4, Math.min(64, len));

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
    let pass = "";
    for (let i = 0; i < len; i++)
      pass += chars[Math.floor(Math.random() * chars.length)];

    await m.reply(`🔐 Password (${len} karakter):\n\`\`\`${pass}\`\`\``);
  },
};
