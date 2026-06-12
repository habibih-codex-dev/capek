/**
 * plugins/owner/setting.js — Pengaturan bot (khusus Owner)
 * Toggle mode runtime: self, autoRead, autoTyping, alwaysOnline, antiCall.
 */
const TOGGLEABLE = {
  self: "Mode self (hanya owner)",
  autoRead: "Auto baca pesan",
  autoTyping: "Auto mengetik",
  alwaysOnline: "Selalu online",
  antiCall: "Anti panggilan",
  autoReconnect: "Auto reconnect",
};

export default {
  command: ["setting", "mode", "set"],
  category: "owner",
  desc: "Pengaturan bot (owner)",
  owner: true,
  scope: "both",

  run: async (m, ctx) => {
    const { config, args, prefix, command } = ctx;
    const key = (args[0] || "").trim();
    const val = (args[1] || "").trim().toLowerCase();

    if (!key) {
      let teks = `⚙️ *PENGATURAN BOT*\n\n`;
      for (const [k, label] of Object.entries(TOGGLEABLE)) {
        const on = config.settings[k] ? "🟢 ON" : "🔴 OFF";
        teks += `${on}  *${k}* — ${label}\n`;
      }
      teks += `\nContoh: *${prefix}${command} self on*`;
      return m.reply(teks);
    }

    if (!(key in TOGGLEABLE)) {
      return m.reply(
        `❌ Pengaturan "${key}" tidak dikenal.\nGunakan: ${Object.keys(
          TOGGLEABLE
        ).join(", ")}`
      );
    }

    if (val !== "on" && val !== "off") {
      return m.reply(`❌ Nilai harus *on* atau *off*.`);
    }

    config.settings[key] = val === "on";
    await m.reply(
      `${config.messages.success}\nPengaturan *${key}* sekarang *${val.toUpperCase()}*.`
    );
  },
};
