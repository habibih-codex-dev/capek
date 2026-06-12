/**
 * plugins/islami/testsholat.js — Kirim contoh notif sholat (KHUSUS OWNER)
 * Penggunaan: .testsholat [subuh|dzuhur|ashar|maghrib|isya]
 */
import { sendPrayerNotif } from "../../lib/prayer-scheduler.js";

const VALID = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];

export default {
  command: ["testsholat", "testsolat"],
  category: "islami",
  desc: "Uji tampilan notif sholat (owner)",
  owner: true,
  scope: "both",

  run: async (m, ctx) => {
    const { config, db, args } = ctx;
    const input = (args[0] || "maghrib").toLowerCase();
    const prayer =
      VALID.find((p) => p.toLowerCase() === input) || "Maghrib";

    const g = m.isGroup ? db.group(m.chat) : null;
    const kota = g?.kota || config.islami.defaultCity;
    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: config.islami.timezone || "Asia/Jakarta",
    });

    await m.reply(`🧪 Mengirim contoh notif *${prayer}*...`);

    // Pengingat sebelum
    await sendPrayerNotif(ctx.sock, config, m.chat, {
      city: kota,
      prayer,
      time: now,
      type: "before",
      before: config.islami.reminderBeforeMinutes,
    });
    // Notif saat waktunya (sound mengikuti pengaturan grup)
    await sendPrayerNotif(ctx.sock, config, m.chat, {
      city: kota,
      prayer,
      time: now,
      type: "at",
      sound: !!g?.autosholatSound,
    });
  },
};
