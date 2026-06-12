/**
 * lib/scraper.js — Fungsi yang butuh internet (terpusat)
 * ------------------------------------------------------------------
 * Semua fitur "online" lewat sini. Kalau ada endpoint mati, cukup ganti
 * satu fungsi di file ini. Memakai global fetch (Node.js >= 18).
 * Setiap fungsi melempar Error dengan pesan jelas agar plugin bisa
 * menampilkan pesan ramah, bukan crash.
 */

const UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36";

async function fetchJson(url, opt = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, accept: "application/json", ...(opt.headers || {}) },
    ...opt,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function fetchBuffer(url, opt = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...(opt.headers || {}) }, ...opt });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/* ============ INFO ============ */

/** Cuaca via wttr.in (tanpa API key). */
export async function cuaca(kota) {
  const data = await fetchJson(
    `https://wttr.in/${encodeURIComponent(kota)}?format=j1&lang=id`
  );
  const c = data.current_condition?.[0];
  const area = data.nearest_area?.[0];
  if (!c) throw new Error("Data cuaca tidak ditemukan.");
  return {
    kota:
      area?.areaName?.[0]?.value ||
      kota,
    suhu: c.temp_C,
    terasa: c.FeelsLikeC,
    kondisi: c.lang_id?.[0]?.value || c.weatherDesc?.[0]?.value,
    kelembapan: c.humidity,
    angin: c.windspeedKmph,
  };
}

/** Ringkasan Wikipedia (Bahasa Indonesia). */
export async function wikipedia(judul) {
  const data = await fetchJson(
    `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(judul)}`
  );
  if (!data.extract) throw new Error("Artikel tidak ditemukan.");
  return {
    judul: data.title,
    ringkasan: data.extract,
    url: data.content_urls?.desktop?.page || "",
    thumb: data.thumbnail?.source || "",
  };
}

/** Arti kata (best-effort, sumber komunitas). */
export async function kbbi(kata) {
  // Endpoint komunitas; bila mati akan melempar error & ditangani plugin.
  const data = await fetchJson(
    `https://kbbi-api-zhirraff.herokuapp.com/cari/${encodeURIComponent(kata)}`
  );
  if (!data || data.error) throw new Error("Kata tidak ditemukan di KBBI.");
  return data;
}

/** Lirik lagu via lyrics.ovh (format: "artis judul" atau hanya judul). */
export async function lirik(query) {
  const parts = query.split(" ");
  let artist = "";
  let title = query;
  if (parts.length > 1) {
    artist = parts[0];
    title = parts.slice(1).join(" ");
  }
  const data = await fetchJson(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
  );
  if (!data.lyrics) throw new Error("Lirik tidak ditemukan.");
  return data.lyrics.trim();
}

/* ============ STICKER ONLINE ============ */

/** Emoji mix (Emoji Kitchen) -> buffer PNG. */
export async function emojiMix(emoji1, emoji2) {
  const url = `https://emojik.vercel.app/s/${encodeURIComponent(
    emoji1
  )}_${encodeURIComponent(emoji2)}?size=256`;
  return await fetchBuffer(url);
}

export default { cuaca, wikipedia, kbbi, lirik, emojiMix };
export { fetchJson, fetchBuffer };


/* ============ ISLAMI ============ */

/** Jadwal sholat hari ini berdasarkan kota (API aladhan, tanpa key). */
export async function jadwalSholat(city, method = 20, country = "Indonesia") {
  const data = await fetchJson(
    `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
      city
    )}&country=${encodeURIComponent(country)}&method=${method}`
  );
  if (!data?.data?.timings) throw new Error("Kota tidak ditemukan.");
  const t = data.data.timings;
  return {
    timings: {
      Imsak: t.Imsak,
      Subuh: t.Fajr,
      Terbit: t.Sunrise,
      Dzuhur: t.Dhuhr,
      Ashar: t.Asr,
      Maghrib: t.Maghrib,
      Isya: t.Isha,
    },
    raw: t,
    date: data.data.date,
    hijri: data.data.date?.hijri,
  };
}

/** Konversi tanggal Masehi (Date) -> Hijriah via aladhan. */
export async function hijriDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const data = await fetchJson(
    `https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`
  );
  if (!data?.data?.hijri) throw new Error("Gagal konversi tanggal.");
  return data.data.hijri;
}

/* ============ AL-QUR'AN (equran.id, tanpa key) ============ */

/** Daftar 114 surah. */
export async function quranListSurah() {
  const data = await fetchJson("https://equran.id/api/v2/surat");
  if (!data?.data) throw new Error("Gagal mengambil daftar surah.");
  return data.data;
}

/** Detail surah berdasarkan nomor (1-114), termasuk ayat. */
export async function quranSurah(nomor) {
  const n = parseInt(nomor);
  if (!n || n < 1 || n > 114) throw new Error("Nomor surah harus 1-114.");
  const data = await fetchJson(`https://equran.id/api/v2/surat/${n}`);
  if (!data?.data) throw new Error("Surah tidak ditemukan.");
  return data.data;
}

/** Ambil satu ayat: surah (nomor) + ayat (nomor). */
export async function quranAyat(surah, ayat) {
  const s = await quranSurah(surah);
  const a = (s.ayat || []).find((x) => x.nomorAyat === parseInt(ayat));
  if (!a) throw new Error(`Ayat ${ayat} tidak ada di surah ini.`);
  return { surah: s, ayat: a };
}
