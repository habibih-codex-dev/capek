/**
 * plugins/download/youtube.js — Pencarian & unduh YouTube
 * ------------------------------------------------------------------
 * - PENCARIAN (gratis, tanpa key): scrape `ytInitialData` dari HTML hasil.
 * - UNDUH (mp3/mp4):
 *     1) Jika config.downloads.ytmp3/.ytmp4 diisi -> pakai endpoint API itu.
 *     2) Jika kosong -> pakai `yt-dlp` (gratis, tanpa key) bila terpasang.
 *        Pasang dengan: pip install -U yt-dlp  (atau unduh binary yt-dlp).
 *
 * Command:
 *   .ytsearch <kata kunci>   -> daftar hasil pencarian
 *   .play <judul lagu>       -> cari + kirim audio
 *   .ytmp3 <link|judul>      -> unduh audio
 *   .ytmp4 <link|judul>      -> unduh video
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fetchText, fetchJson, pick, errorJaringan } from "../../lib/api.js";

const execFileP = promisify(execFile);

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
  const raw =
    html.split("var ytInitialData = ")[1]?.split(";</script>")[0] ||
    html.split('window["ytInitialData"] = ')[1]?.split(";</script>")[0] ||
    html.match(/ytInitialData"?\]?\s*=\s*(\{.+?\});<\/script>/s)?.[1];
  if (!raw) throw new Error("Gagal membaca hasil pencarian YouTube.");
  let json;
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
    res?.data?.result,
  ];
  for (const c of cand) {
    if (typeof c === "string" && /^https?:\/\//i.test(c)) return c;
  }
  return null;
}

/** Mode API: jalankan endpoint unduh dari config (template berisi {url}). */
async function unduhApi(endpoint, videoUrl) {
  const api = endpoint.replace("{url}", encodeURIComponent(videoUrl));
  const res = await fetchJson(api);
  const dl = findDownloadUrl(res);
  if (!dl) throw new Error("Respons API tidak berisi link unduhan.");
  return {
    dl,
    title: pick(res, ["title"]) || pick(res?.result || {}, ["title"]) || "",
  };
}

/** Parse output `yt-dlp --get-title --get-url`. */
export function parseYtDlpOutput(stdout = "") {
  const lines = stdout
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const dl = [...lines].reverse().find((l) => /^https?:\/\//i.test(l)) || null;
  const title = lines.find((l) => !/^https?:\/\//i.test(l)) || "";
  return { dl, title };
}

/** Mode yt-dlp: ambil direct URL tanpa mengunduh ke disk (-g). */
async function unduhYtDlp(videoUrl, isVideo) {
  const fmt = isVideo
    ? "best[ext=mp4][acodec!=none][vcodec!=none]/best[ext=mp4]/best"
    : "bestaudio[ext=m4a]/bestaudio/best";
  try {
    const { stdout } = await execFileP(
      "yt-dlp",
      [
        "-f",
        fmt,
        "--get-title",
        "--get-url",
        "--no-warnings",
        "--no-playlist",
        videoUrl,
      ],
      { timeout: 60000, maxBuffer: 1024 * 1024 }
    );
    const { dl, title } = parseYtDlpOutput(stdout);
    if (!dl) throw new Error("yt-dlp tidak mengembalikan link.");
    return { dl, title };
  } catch (e) {
    if (e?.code === "ENOENT") {
      const err = new Error("yt-dlp belum terpasang.");
      err.code = "YTDLP_MISSING";
      throw err;
    }
    throw e;
  }
}

function formatHasil(list, prefix) {
  let teks = `🔎 *Hasil pencarian YouTube*\n\n`;
  teks += list
    .map(
      (v, i) =>
        `${i + 1}. *${v.title}*\n` +
        `   👤 ${v.channel}${v.duration ? ` • ⏱️ ${v.duration}` : ""}\n` +
        `   🔗 https://youtu.be/${v.id}`
    )
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

    try {
      const { dl, title } = endpoint
        ? await unduhApi(endpoint, videoUrl)
        : await unduhYtDlp(videoUrl, isVideo);

      await m.react("✅").catch(() => {});
      const namaFile = (title || judul || "youtube").replace(
        /[\\/:*?"<>|]/g,
        ""
      );
      if (isVideo) {
        return m.reply({
          video: { url: dl },
          caption: `🎬 ${title || judul}\n\n${config.watermark}`,
        });
      }
      return m.reply({
        audio: { url: dl },
        mimetype: "audio/mp4",
        fileName: `${namaFile}.mp3`,
      });
    } catch (e) {
      await m.react("❌").catch(() => {});
      if (e?.code === "YTDLP_MISSING") {
        return m.reply(
          `⚠️ *yt-dlp* belum terpasang di server.\n\n` +
            `Pasang salah satu cara:\n` +
            `• \`pip install -U yt-dlp\`\n` +
            `• atau unduh binary yt-dlp ke PATH\n\n` +
            `Alternatif: isi *config.downloads.${
              isVideo ? "ytmp4" : "ytmp3"
            }* dengan endpoint API.\n\n` +
            `🔗 Sementara, link videonya: ${videoUrl}`
        );
      }
      return m.reply(errorJaringan(e));
    }
  },
};
