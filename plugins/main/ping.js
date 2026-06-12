/**
 * plugins/main/ping.js — Cek kecepatan respon + runtime
 */
import os from "os";
import { formatRuntime, formatSize } from "../../lib/myfunc.js";

export default {
  command: ["ping", "speed"],
  category: "main",
  desc: "Cek kecepatan respon bot",
  scope: "both",

  run: async (m, ctx) => {
    const start = Date.now();
    const { startTime } = ctx;

    const latency = Date.now() - start + (Date.now() - (m.messageTimestamp * 1000 || Date.now()));
    const speed = Date.now() - start;

    const used = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const teks =
      `🏓 *PONG!*\n\n` +
      `⚡ Speed : ${speed} ms\n` +
      `⏱️ Runtime : ${formatRuntime(Date.now() - startTime)}\n` +
      `🧠 RAM : ${formatSize(totalMem - freeMem)} / ${formatSize(totalMem)}\n` +
      `📦 Heap : ${formatSize(used.heapUsed)}\n` +
      `💻 Platform : ${os.platform()} (${os.arch()})\n` +
      `🔧 Node : ${process.version}`;

    await m.reply(teks);
  },
};
