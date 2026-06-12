/**
 * lib/prayer-scheduler.js — Penjadwal autosholat (node-cron)
 * ------------------------------------------------------------------
 * Berjalan tiap menit:
 *  - Untuk tiap grup dengan autosholat ON, ambil jadwal sholat kotanya.
 *  - Kirim pengingat X menit sebelum waktu + notif saat waktu tiba.
 *  - Opsional kirim audio adzan (jika autosholatSound ON & URL tersedia).
 *  - Jumat: ingatkan baca Al-Kahfi.
 * Memakai timezone dari config (default Asia/Jakarta / WIB).
 *
 * Catatan: jadwal dari aladhan mengikuti waktu lokal kota. Untuk kota
 * di luar WIB (WITA/WIT), sesuaikan config.islami.timezone bila perlu.
 */
import cron from "node-cron";
import { jadwalSholat } from "./scraper.js";
import { log } from "./print.js";

let started = false;
const sentFlags = new Set(); // `${date}|${gid}|${prayer}|${type}`
const PRAYERS = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];

function nowInTz(tz) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return {
    hm: `${get("hour")}:${get("minute")}`,
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"),
  };
}

const toMinutes = (hm) => {
  const [h, m] = String(hm).split(":").map(Number);
  return h * 60 + m;
};

/** Doa/ucapan yang menyertai notifikasi saat waktu sholat tiba. */
function adzanDoa(prayer) {
  const base =
    "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ\n\n" +
    "_Doa setelah adzan:_\n" +
    "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ\n" +
    "_\"Ya Allah, Tuhan pemilik seruan yang sempurna dan sholat yang ditegakkan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan.\"_";
  if (prayer === "Subuh")
    return "🌅 Telah masuk waktu Subuh. *Ash-shalâtu khairum minan naum* (sholat lebih baik daripada tidur).\n\n" + base;
  return base;
}

/**
 * Kirim satu notifikasi sholat ke grup. Dipakai scheduler & .testsholat.
 * @param {*} sock
 * @param {*} config
 * @param {string} gid
 * @param {{city, prayer, time, type:'before'|'at', sound:boolean, before:number}} opt
 */
export async function sendPrayerNotif(sock, config, gid, opt) {
  const { city, prayer, time, type, sound = false, before = 5 } = opt;
  const img = config.islami?.mosqueImage || config.thumbnail || "";

  let text;
  if (type === "before") {
    text =
      `⏰ *${before} menit lagi waktu ${prayer}*\n` +
      `📍 Wilayah: *${city}*  |  🕐 Pukul: *${time}*\n\n` +
      `Yuk bersiap menuju sholat. 🕌`;
  } else {
    text =
      `🕌 *WAKTU ${prayer.toUpperCase()} TELAH TIBA*\n` +
      `📍 Wilayah: *${city}*  |  🕐 Pukul: *${time}*\n\n` +
      `${adzanDoa(prayer)}\n\n${config.watermark}`;
  }

  try {
    if (img) await sock.sendMessage(gid, { image: { url: img }, caption: text });
    else await sock.sendMessage(gid, { text });
  } catch {
    await sock.sendMessage(gid, { text });
  }

  if (type === "at" && sound) {
    const url =
      prayer === "Subuh"
        ? config.islami?.adzanSubuhUrl || config.islami?.adzanUrl
        : config.islami?.adzanUrl;
    if (url) {
      try {
        await sock.sendMessage(gid, { audio: { url }, mimetype: "audio/mpeg" });
      } catch {
        /* lewati jika audio gagal */
      }
    }
  }
}

export function startPrayerScheduler(sock, db, config) {
  if (started) return;
  started = true;

  const tz = config.islami?.timezone || "Asia/Jakarta";
  const before = config.islami?.reminderBeforeMinutes || 5;
  const cache = {}; // date -> { city -> timings }

  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const { hm, date, weekday } = nowInTz(tz);
        const curMin = toMinutes(hm);

        const groups = db.data.groups || {};
        const active = [];
        const cities = new Set();
        for (const [gid, g] of Object.entries(groups)) {
          if (g.autosholat) {
            const city = g.kota || config.islami?.defaultCity || "Jakarta";
            active.push({ gid, g, city });
            cities.add(city);
          }
        }
        if (!active.length) return;

        if (!cache[date]) {
          for (const k of Object.keys(cache)) delete cache[k]; // buang cache hari lama
          cache[date] = {};
        }
        for (const city of cities) {
          if (cache[date][city] === undefined) {
            try {
              cache[date][city] = (
                await jadwalSholat(city, config.islami?.method)
              ).timings;
            } catch (e) {
              cache[date][city] = null;
              log.warn(`Jadwal sholat "${city}" gagal: ${e.message}`);
            }
          }
        }

        for (const { gid, g, city } of active) {
          const timings = cache[date][city];
          if (!timings) continue;
          for (const p of PRAYERS) {
            const t = timings[p];
            if (!t) continue;
            const pm = toMinutes(t);

            if (curMin === pm - before) {
              const key = `${date}|${gid}|${p}|before`;
              if (!sentFlags.has(key)) {
                sentFlags.add(key);
                await sendPrayerNotif(sock, config, gid, {
                  city,
                  prayer: p,
                  time: t,
                  type: "before",
                  before,
                });
              }
            }
            if (curMin === pm) {
              const key = `${date}|${gid}|${p}|at`;
              if (!sentFlags.has(key)) {
                sentFlags.add(key);
                await sendPrayerNotif(sock, config, gid, {
                  city,
                  prayer: p,
                  time: t,
                  type: "at",
                  sound: !!g.autosholatSound,
                });
              }
            }
          }
        }

        // Jumat: ingatkan Al-Kahfi (06:00 waktu setempat)
        if (config.islami?.jumatReminder && weekday === "Fri" && hm === "06:00") {
          for (const { gid } of active) {
            const key = `${date}|${gid}|jumat`;
            if (!sentFlags.has(key)) {
              sentFlags.add(key);
              await sock.sendMessage(gid, {
                text:
                  `🕌 *Selamat Hari Jumat!*\n\n` +
                  `Jangan lupa amalan sunnah hari ini:\n` +
                  `• Membaca *Surah Al-Kahfi*\n` +
                  `• Memperbanyak *sholawat* kepada Nabi ﷺ\n` +
                  `• Memperbanyak doa di waktu mustajab\n\n` +
                  `${config.watermark}`,
              });
            }
          }
        }

        // Jaga memori: buang flag yang bukan hari ini
        if (sentFlags.size > 5000) {
          for (const k of sentFlags) if (!k.startsWith(date)) sentFlags.delete(k);
        }
      } catch (e) {
        log.error("prayer-scheduler:", e?.message || e);
      }
    },
    { timezone: tz }
  );

  log.success("Penjadwal autosholat aktif (cek tiap menit).");
}

export default { startPrayerScheduler, sendPrayerNotif };
