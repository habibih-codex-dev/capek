/**
 * lib/downloader.js — Util bersama untuk plugin download media sosial.
 * ------------------------------------------------------------------
 * - extractMediaList(res): menormalkan respons API yang skemanya beragam
 *   menjadi daftar [{ url, type }] (type: image | video | gif | audio).
 * - sendMediaList(m, list, caption): mengirim semua media (album-aware),
 *   memilih image/video/audio sesuai tipe.
 */

export function guessType(u = "") {
  if (/\.(mp4|mov|webm|mkv|m4v)(\?|$|&)/i.test(u)) return "video";
  if (/\.(mp3|m4a|ogg|wav|aac)(\?|$|&)/i.test(u)) return "audio";
  return "image";
}

/** Bersihkan escape pada URL hasil scrape (\/ -> /, \u0026 -> &, dll.). */
export function unescapeUrl(u = "") {
  return String(u)
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\"/g, '"');
}

/** Hilangkan duplikat sambil mempertahankan urutan. */
export function uniq(arr = []) {
  return [...new Set(arr)];
}

/** Ekstrak daftar media dari respons API apa pun bentuknya (defensif). */
export function extractMediaList(res) {
  const out = [];
  const seen = new Set();
  const push = (u, type) => {
    if (typeof u !== "string" || !/^https?:\/\//i.test(u)) return;
    if (seen.has(u)) return;
    seen.add(u);
    out.push({ url: u, type: String(type || guessType(u)).toLowerCase() });
  };
  const handle = (it) => {
    if (!it) return;
    if (typeof it === "string") return push(it);
    if (Array.isArray(it)) return it.forEach(handle);
    if (typeof it === "object") {
      const u =
        it.url || it.media || it.download || it.link || it.src || it.hd || it.sd;
      const type = it.type || it.media_type;
      if (Array.isArray(u)) u.forEach(handle);
      else push(u, type);
    }
  };
  const candidates = [
    res?.media_extended,
    res?.media,
    res?.medias,
    res?.result,
    res?.results,
    res?.data,
    res?.url,
    res?.links,
    res?.data?.media,
    res?.result?.media,
    res?.data?.url,
    res?.result?.url,
  ];
  for (const c of candidates) handle(c);
  return out;
}

/** Kirim semua media ke chat (maks `max` item). Mengembalikan jumlah terkirim. */
export async function sendMediaList(m, list, caption = "", max = 20) {
  if (!Array.isArray(list) || !list.length) {
    throw new Error("Tidak ada media yang bisa diunduh.");
  }
  const items = list.slice(0, max);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const cap = i === 0 ? caption : `Media ${i + 1}/${items.length}`;
    if (it.type === "video" || it.type === "gif") {
      await m.reply({
        video: { url: it.url },
        caption: cap,
        gifPlayback: it.type === "gif",
      });
    } else if (it.type === "audio") {
      await m.reply({ audio: { url: it.url }, mimetype: "audio/mpeg" });
    } else {
      await m.reply({ image: { url: it.url }, caption: cap });
    }
  }
  return items.length;
}

export default { guessType, unescapeUrl, uniq, extractMediaList, sendMediaList };
