/**
 * lib/api.js — Helper request HTTP untuk plugin (fetch + timeout + error ramah)
 * ------------------------------------------------------------------
 * Dipakai plugin islami (jadwal sholat, al-quran, asmaul husna, doa).
 * Memakai `fetch` bawaan Node 20+ (tanpa dependency tambahan).
 */

/** fetch JSON dengan timeout + User-Agent (beberapa API menolak request tanpa UA). */
export async function fetchJson(url, timeout = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (HabibihBot)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ambil nilai pertama yang tersedia dari sebuah objek berdasarkan
 * daftar kemungkinan nama field. Berguna saat skema API tidak pasti.
 */
export function pick(obj, keys, fallback = "") {
  if (!obj) return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}

/** Pesan error yang ramah: bedakan gagal koneksi vs error lain. */
export function errorJaringan(e) {
  const msg = String(e?.message || e);
  if (
    /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|aborted|network|abort|EAI_AGAIN/i.test(
      msg
    )
  ) {
    return (
      "⚠️ Gagal terhubung ke server.\n" +
      "Penyebab: koneksi internet bermasalah atau server sedang down.\n\n" +
      `_${msg}_`
    );
  }
  return `⚠️ Terjadi kesalahan: _${msg}_`;
}

export default { fetchJson, pick, errorJaringan };
