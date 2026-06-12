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
