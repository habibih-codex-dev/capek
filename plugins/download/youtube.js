/**
 * plugins/download/youtube.js — Pencarian & unduh YouTube
 * ------------------------------------------------------------------
 * - PENCARIAN (gratis, tanpa key): scrape hasil pencarian YouTube
 *   dari objek `ytInitialData` pada HTML halaman hasil.
 * - UNDUH (mp3/mp4): memakai endpoint yang diatur di
 *   config.downloads.ytmp3 / .ytmp4 (swappable). Tidak ada endpoint
 *   unduh YouTube gratis yang benar-benar awet, jadi dibuat opsional.
 *
 * Command:
 *   .ytsearch <kata kunci>   -> daftar hasil pencarian
 *   .play <judul lagu>       -> cari + kirim audio (butuh config.ytmp3)
 *   .ytmp3 <link|judul>      -> unduh audio
 *   .ytmp4 <link|judul>      -> unduh video
 */
import { fetchText, fetchJson, pick, errorJaringan } from "../../lib/api.js";

function isYoutubeUrl(t = "") {
  return /(?:youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts)/i.test(t);
}

/** Kumpulkan node videoRenderer secara rekursif dari ytInitialData. */
function collectVideos(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (node.videoRenderer?.videoId) {
    const vr = node.videoRenderer;
    out.push({
      id: vr.videoId,
      title:
        vr.title?.runs?.[0]?.text || vr.title?.simpleText || "(tanpa judul)",
      duration: vr.lengthText?.simpleText || "",
      channel:
        vr.ownerText?.runs?.[0]?.text ||
        vr.longBylineText?.runs?.[0]?.text ||
        "",
      views: vr.viewCountText?.simpleText || "",
    });
  }
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((it) => collectVideos(it, out));
    else if (v && typeof v === "object") collectVideos(v, out);
  }
  return out;
}

/** Cari video YouTube. Mengembalikan array hasil (maks `limit`). */
async function searchYoutube(query, limit = 8) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}&hl=id`;
  const html = await fetchText(url);
  let json;
  // ekstrak ytInitialData (beberapa varian penulisan)
  const raw =
    html.split("var ytInitialData = ")[1]?.split(";</script>")[0] ||
    html.split('window["ytInitialData"] = ')[1]?.split(";</script>")[0] ||
    html.match(/ytInitialData"?\]?\s*=\s*(\{.+?\});<\/script>/s)?.[1];
  if (!raw) throw new Error("Gagal membaca hasil pencarian YouTube.");
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("Format hasil pencarian tidak dikenali.");
  }
  return collectVideos(json).slice(0, limit);
}

/** Cari URL unduhan di dalam respons API (skema tak pasti). */
function findDownloadUrl(res) {
  const cand = [
    res?.url,
    res?.result,
    res?.download,
    res?.dl,
    res?.link,
    res?.data?.url,
    res?.data?.dl,
    res?.result?.url,
    res?.result?.download,
    res?.data?.download,
  ];
  for (const c of cand) {
    if (typeof c === "string" && /^https?:\/\//i.test(c)) return c;
  }
  return null;
}

/** Jalankan endpoint unduh dari config (template berisi {url}). */
async function unduh(endpoint, videoUrl) {
  const api = endpoint.replace("{url}", encodeURIComponent(videoUrl));
  const res = await fetchJson(api);
  const dl = findDownloadUrl(res);
  if (!dl) throw new Error("Respons API tidak berisi link unduhan.");
  return { dl, title: pick(res, ["title"]) || pick(res?.result || {}, ["title"]) };
}

function formatHasil(list, prefix) {
  let teks = `🔎 *Hasil pencarian YouTube*\n\n`;
  teks += list
    .map((v, i) => {
      return (
        `${i + 1}. *${v.title}*\n` +
        `   👤 ${v.channel}${v.duration ? ` • ⏱️ ${v.duration}` : ""}\n` +
        `   🔗 https://youtu.be/${v.id}`
      );
    })
    .join("\n\n");
  teks += `\n\n_Unduh: ${prefix}ytmp3 <link>  atau  ${prefix}ytmp4 <link>_`;
  return teks;
}

export default {
  command: ["ytsearch", "yts", "youtube", "play", "ytmp3", "ytmp4", "ytv"],
  category: "download",
  desc: "Cari (ytsearch) & unduh YouTube (play/ytmp3/ytmp4)",
  scope: "both",

  run: async (m, ctx) => {
    const { command, config } = ctx;
    const input = (ctx.text || "").trim();

    if (!input) {
      return m.reply(
        `📥 Masukkan kata kunci atau link.\n` +
          `Contoh:\n• *${ctx.prefix}ytsearch lo-fi hip hop*\n` +
          `• *${ctx.prefix}play sholawat nabi*\n` +
          `• *${ctx.prefix}ytmp3 https://youtu.be/xxxx*`
      );
    }

    /* ============ PENCARIAN MURNI ============ */
    if (command === "ytsearch" || command === "yts" || command === "youtube") {
      await m.react("⏳").catch(() => {});
      try {
        const list = await searchYoutube(input);
        if (!list.length) {
          await m.react("❌").catch(() => {});
          return m.reply(`❌ Tidak ada hasil untuk *${input}*.`);
        }
        await m.react("✅").catch(() => {});
        return m.reply(formatHasil(list, ctx.prefix));
      } catch (e) {
        await m.react("❌").catch(() => {});
        return m.reply(errorJaringan(e));
      }
    }

    /* ============ UNDUH (play/ytmp3/ytmp4) ============ */
    const isVideo = command === "ytmp4" || command === "ytv";
    const endpoint = isVideo ? config.downloads?.ytmp4 : config.downloads?.ytmp3;

    await m.react("⏳").catch(() => {});

    // Tentukan link video: dari input (link) atau hasil pencarian teratas.
    let videoUrl = input;
    let judul = "";
    if (!isYoutubeUrl(input)) {
      try {
        const list = await searchYoutube(input, 1);
        if (!list.length) {
          await m.react("❌").catch(() => {});
          return m.reply(`❌ Tidak ada hasil untuk *${input}*.`);
        }
        videoUrl = `https://youtu.be/${list[0].id}`;
        judul = list[0].title;
      } catch (e) {
        await m.react("❌").catch(() => {});
        return m.reply(errorJaringan(e));
      }
    }

    // Endpoint unduh belum diatur -> beri info jujur + tetap berguna.
    if (!endpoint) {
      await m.react("✅").catch(() => {});
      return m.reply(
        `🎬 *${judul || "Video YouTube"}*\n🔗 ${videoUrl}\n\n` +
          `⚠️ Fitur unduh ${isVideo ? "video" : "audio"} belum diaktifkan.\n` +
          `Owner perlu mengisi *config.downloads.${isVideo ? "ytmp4" : "ytmp3"}* ` +
          `dengan endpoint API (format berisi {url}).`
      );
    }

    try {
      const { dl, title } = await unduh(endpoint, videoUrl);
      await m.react("✅").catch(() => {});
      const namaFile = (title || judul || "youtube").replace(/[\\/:*?"<>|]/g, "");
      if (isVideo) {
        return m.reply({
          video: { url: dl },
          caption: `🎬 ${title || judul}\n\n${config.watermark}`,
        });
      }
      return m.reply({
        audio: { url: dl },
        mimetype: "audio/mpeg",
        fileName: `${namaFile}.mp3`,
      });
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
