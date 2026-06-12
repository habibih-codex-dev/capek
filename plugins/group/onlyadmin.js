/**
 * plugins/group/onlyadmin.js — Mode hanya-admin & mute bot di grup
 * Penggunaan:
 *   .onlyadmin on | off   -> hanya admin yang bisa pakai command bot
 *   .mute                 -> bot diam di grup ini
 *   .unmute               -> bot aktif lagi
 */
export default {
  command: ["onlyadmin", "mute", "unmute"],
  category: "group",
  desc: "Mode only-admin & mute bot di grup",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { db, command, args, config, prefix } = ctx;
    const g = db.group(m.chat);

    if (command === "mute") {
      g.mute = true;
      db.markDirty();
      return m.reply(`🔇 Bot dimute di grup ini. Ketik *${prefix}unmute* untuk mengaktifkan.`);
    }
    if (command === "unmute") {
      g.mute = false;
      db.markDirty();
      return m.reply(`🔊 Bot aktif kembali.`);
    }

    // onlyadmin
    const sub = (args[0] || "").toLowerCase();
    if (sub === "on" || sub === "off") {
      g.onlyadmin = sub === "on";
      db.markDirty();
      return m.reply(
        `✅ Mode only-admin *${sub.toUpperCase()}*.\n${
          sub === "on" ? "Hanya admin yang bisa pakai command bot." : "Semua member bisa pakai command bot."
        }`
      );
    }
    return m.reply(
      `⚙️ Only-admin: ${g.onlyadmin ? "🟢 ON" : "🔴 OFF"}\nGunakan: *${prefix}onlyadmin on/off*`
    );
  },
};
