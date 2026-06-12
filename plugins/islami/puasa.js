/**
 * plugins/islami/puasa.js — Info puasa sunnah (Senin-Kamis & Ayyamul Bidh)
 */
import { hijriDate } from "../../lib/scraper.js";

function nextDate(targetDow) {
  // targetDow: 1=Senin ... 4=Kamis (getDay: 0=Min)
  const now = new Date();
  const diff = (targetDow - now.getDay() + 7) % 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d;
}

const fmt = (d) =>
  d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default {
  command: ["puasa", "puasasunnah"],
  category: "islami",
  desc: "Jadwal puasa sunnah (Senin-Kamis & Ayyamul Bidh)",
  scope: "both",

  run: async (m, ctx) => {
    await m.react("⏳");
    const senin = nextDate(1);
    const kamis = nextDate(4);

    let bidhInfo = "";
    try {
      const h = await hijriDate(new Date());
      const day = parseInt(h.day);
      if (day >= 13 && day <= 15)
        bidhInfo = `\n🌕 *Hari ini ${h.day} ${h.month?.en}* — termasuk *Ayyamul Bidh* (puasa sunnah)!`;
      else
        bidhInfo = `\n🌕 *Ayyamul Bidh*: tanggal 13, 14, 15 ${h.month?.en} (sekarang ${h.day} ${h.month?.en}).`;
    } catch {
      bidhInfo = `\n🌕 *Ayyamul Bidh*: setiap tanggal 13, 14, 15 Hijriah.`;
    }

    const teks =
      `🌙 *PUASA SUNNAH*\n\n` +
      `📌 *Senin & Kamis* (rutin tiap pekan):\n` +
      `• Senin terdekat: ${fmt(senin)}\n` +
      `• Kamis terdekat: ${fmt(kamis)}\n` +
      bidhInfo +
      `\n\n_Semoga Allah memudahkan ibadah kita._ 🤲\n${ctx.config.watermark}`;

    await m.reply(teks);
    await m.react("✅");
  },
};
