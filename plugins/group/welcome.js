/**
 * plugins/group/welcome.js — Atur sapaan masuk/keluar grup
 * Penggunaan:
 *   .welcome on | off
 *   .welcome settext Selamat datang @user di @subject
 *   .goodbye on | off
 *   .goodbye settext Sampai jumpa @user
 * Variabel teks: @user, @subject, @desc
 */
export default {
  command: ["welcome", "goodbye", "selamatdatang"],
  category: "group",
  desc: "Atur pesan welcome/goodbye grup",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { db, args, command, prefix, config } = ctx;
    const g = db.group(m.chat);
    const isWelcome = command !== "goodbye";
    const key = isWelcome ? "welcome" : "goodbye";
    const textKey = isWelcome ? "welcomeText" : "goodbyeText";
    const label = isWelcome ? "Welcome" : "Goodbye";
    const sub = (args[0] || "").toLowerCase();

    if (sub === "on" || sub === "off") {
      g[key] = sub === "on";
      db.markDirty();
      return m.reply(`✅ ${label} *${sub.toUpperCase()}*.`);
    }

    if (sub === "settext") {
      const txt = args.slice(1).join(" ");
      if (!txt)
        return m.reply(
          `Ketik teksnya.\nContoh: *${prefix}${command} settext Halo @user di @subject*\n\nVariabel: @user, @subject, @desc`
        );
      g[textKey] = txt;
      db.markDirty();
      return m.reply(`✅ Teks ${label} disimpan.`);
    }

    return m.reply(
      `⚙️ *${label.toUpperCase()}*\nStatus: ${g[key] ? "🟢 ON" : "🔴 OFF"}\n` +
        `Teks: ${g[textKey] || "(default)"}\n\n` +
        `• *${prefix}${command} on/off*\n` +
        `• *${prefix}${command} settext <teks>*\n` +
        `Variabel: @user, @subject, @desc`
    );
  },
};
