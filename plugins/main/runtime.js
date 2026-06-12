/**
 * plugins/main/runtime.js — Info runtime / uptime bot
 */
import { formatRuntime } from "../../lib/myfunc.js";

export default {
  command: ["runtime", "uptime"],
  category: "main",
  desc: "Menampilkan lama bot aktif",
  scope: "both",

  run: async (m, ctx) => {
    const { startTime, config, db } = ctx;
    const teks =
      `⏱️ *RUNTIME ${config.botName}*\n\n` +
      `Aktif selama: *${formatRuntime(Date.now() - startTime)}*\n` +
      `Total command dijalankan: *${db.data.stats.commandCount || 0}*`;
    await m.reply(teks);
  },
};
