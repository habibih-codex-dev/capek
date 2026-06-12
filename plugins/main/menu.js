/**
 * plugins/main/menu.js — Menu utama (otomatis dari plugin yang ter-load)
 */
import { formatRuntime } from "../../lib/myfunc.js";

const ICONS = {
  main: "🏠",
  owner: "👑",
  group: "👥",
  download: "📥",
  tools: "🛠️",
  sticker: "🎨",
  islami: "🕌",
  ai: "🤖",
  store: "🏪",
  fun: "🎮",
};

export default {
  command: ["menu", "help", "allmenu"],
  category: "main",
  desc: "Menampilkan daftar semua perintah",
  scope: "both",

  run: async (m, ctx) => {
    const { config, pluginList, startTime, isOwner, isPremium } = ctx;

    // Kelompokkan command berdasarkan kategori
    const byCat = {};
    for (const p of pluginList) {
      const cat = p.category || "main";
      if (!byCat[cat]) byCat[cat] = [];
      for (const c of p._commands) {
        // tampilkan tag permission singkat
        const tags = [];
        if (p.owner) tags.push("owner");
        if (p.premium) tags.push("premium");
        if (p.admin) tags.push("admin");
        byCat[cat].push(
          `  ◦ ${config.prefix[0]}${c}${tags.length ? ` _(${tags.join("/")})_` : ""}`
        );
      }
    }

    const uptime = formatRuntime(Date.now() - startTime);
    const status = isOwner ? "Owner" : isPremium ? "Premium" : "Free";

    let teks = `╭───「 *${config.botName}* 」\n`;
    teks += `│ 👋 Halo, *${m.pushName || "User"}*\n`;
    teks += `│ 🧩 Status : ${status}\n`;
    teks += `│ ⏱️ Runtime : ${uptime}\n`;
    teks += `│ 🔣 Prefix : ${config.prefix.join(" ")}\n`;
    teks += `│ 👑 Owner : ${config.ownerName}\n`;
    teks += `╰────────────\n\n`;

    const cats = Object.keys(byCat).sort();
    for (const cat of cats) {
      const icon = ICONS[cat] || "📂";
      teks += `╭──「 ${icon} *${cat.toUpperCase()}* 」\n`;
      teks += byCat[cat].sort().join("\n") + "\n";
      teks += `╰────────────\n\n`;
    }

    teks += `${config.watermark}`;

    // Kirim dengan thumbnail bila tersedia
    if (config.thumbnail) {
      try {
        return m.reply({
          image: { url: config.thumbnail },
          caption: teks,
        });
      } catch {
        return m.reply(teks);
      }
    }
    return m.reply(teks);
  },
};
