/**
 * lib/myfunc.js — Utilitas umum
 */

/** Format milidetik -> "Xd Xh Xm Xs" (untuk runtime). */
export function formatRuntime(ms) {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hr = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const day = Math.floor(ms / (1000 * 60 * 60 * 24));
  const parts = [];
  if (day) parts.push(`${day} hari`);
  if (hr) parts.push(`${hr} jam`);
  if (min) parts.push(`${min} menit`);
  parts.push(`${sec} detik`);
  return parts.join(" ");
}

/** Format byte -> human readable. */
export function formatSize(bytes) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Penundaan async. */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Acak elemen array. */
export const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Validasi URL sederhana. */
export function isUrl(text = "") {
  return /https?:\/\/[^\s]+/gi.test(text);
}

/** Ambil semua URL dari teks. */
export function extractUrls(text = "") {
  return text.match(/https?:\/\/[^\s]+/gi) || [];
}

/** Apakah teks mengandung link grup/undangan WhatsApp. */
export function isWaGroupLink(text = "") {
  return /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(text);
}

/** Cek nomor luar negeri (bukan +62) dari sebuah jid/nomor. */
export function isForeignNumber(jidOrNumber = "") {
  const num = String(jidOrNumber).split("@")[0].split(":")[0];
  return !num.startsWith("62");
}

/** Kapitalisasi awal kata. */
export const toTitle = (s = "") =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());

export default {
  formatRuntime,
  formatSize,
  sleep,
  pickRandom,
  isUrl,
  extractUrls,
  isWaGroupLink,
  isForeignNumber,
  toTitle,
};
