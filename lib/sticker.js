/**
 * lib/sticker.js — Pembuatan & konversi stiker (terpusat)
 * ------------------------------------------------------------------
 * Memakai wa-sticker-formatter (butuh sharp; stiker video/animasi butuh
 * ffmpeg ter-install di server). Semua fungsi melempar error yang jelas
 * agar plugin bisa memberi pesan ramah, bukan crash.
 */
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import sharp from "sharp";

/**
 * Buat stiker dari buffer media (gambar/video).
 * @param {Buffer} buffer
 * @param {{pack?:string, author?:string, full?:boolean}} opt
 * @returns {Promise<Buffer>} buffer webp
 */
export async function makeSticker(buffer, opt = {}) {
  const { pack = "", author = "", full = true } = opt;
  const sticker = new Sticker(buffer, {
    pack,
    author,
    type: full ? StickerTypes.FULL : StickerTypes.CROPPED,
    quality: 60,
  });
  return await sticker.toBuffer();
}

/**
 * Konversi stiker (webp) menjadi gambar PNG.
 * @param {Buffer} buffer webp
 * @returns {Promise<Buffer>} png
 */
export async function stickerToImage(buffer) {
  return await sharp(buffer).png().toBuffer();
}

export default { makeSticker, stickerToImage };


/* ============ Render teks (untuk ttp / attp / smeme) ============ */

function escapeXml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Pecah teks menjadi beberapa baris berdasarkan perkiraan lebar. */
function wrapText(text, maxChars = 14) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines.length ? lines : [""];
}

/**
 * Render teks menjadi PNG transparan (untuk ttp/attp).
 * @param {string} text
 * @param {{color?:string, stroke?:string}} opt
 * @returns {Promise<Buffer>} PNG 512x512
 */
export async function renderTextPNG(text, opt = {}) {
  const { color = "#ffffff", stroke = "#000000" } = opt;
  const size = 512;
  const lines = wrapText(text, 12);
  const fontSize = Math.max(48, Math.min(140, Math.floor(420 / Math.max(lines.length, 1))));
  const lineHeight = fontSize * 1.1;
  const startY = size / 2 - ((lines.length - 1) * lineHeight) / 2;

  const tspans = lines
    .map(
      (ln, i) =>
        `<text x="50%" y="${startY + i * lineHeight}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color}" stroke="${stroke}" stroke-width="${Math.max(
          2,
          fontSize / 16
        )}" text-anchor="middle" dominant-baseline="middle" paint-order="stroke">${escapeXml(
          ln
        )}</text>`
    )
    .join("");

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${tspans}</svg>`;
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Buat gambar meme: teks atas & bawah pada media.
 * @param {Buffer} imageBuffer
 * @param {string} top
 * @param {string} bottom
 * @returns {Promise<Buffer>} PNG
 */
export async function memeImage(imageBuffer, top = "", bottom = "") {
  const size = 512;
  const base = await sharp(imageBuffer)
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();

  const mkText = (txt, y) => {
    if (!txt) return "";
    const lines = wrapText(txt, 16);
    const fontSize = 46;
    const lh = fontSize * 1.05;
    return lines
      .map(
        (ln, i) =>
          `<text x="50%" y="${y + i * lh}" font-family="Impact, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" stroke="#000000" stroke-width="3" text-anchor="middle" paint-order="stroke">${escapeXml(
            ln.toUpperCase()
          )}</text>`
      )
      .join("");
  };

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${mkText(
    top,
    60
  )}${mkText(bottom, size - 40)}</svg>`;

  return await sharp(base)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}


/* ============ Ambil media dari pesan ============ */
const MEDIA_TYPES = ["imageMessage", "videoMessage", "stickerMessage"];

/**
 * Ambil buffer media dari pesan (prioritas: pesan yang di-reply, lalu pesan saat ini).
 * @returns {Promise<Buffer|null>}
 */
export async function getMedia(m) {
  try {
    if (m.quoted && MEDIA_TYPES.includes(m.quoted.type)) {
      return await m.quoted.download();
    }
    if (MEDIA_TYPES.includes(m.type)) {
      return await m.download();
    }
  } catch {
    return null;
  }
  return null;
}

/** Cek apakah pesan (atau quoted) mengandung media stiker-able. */
export function hasMedia(m) {
  return (
    (m.quoted && MEDIA_TYPES.includes(m.quoted.type)) ||
    MEDIA_TYPES.includes(m.type)
  );
}
