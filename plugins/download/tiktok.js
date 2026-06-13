/**
 * plugins/download/tiktok.js — Download TikTok (tikwm API, gratis & stabil)
 * ------------------------------------------------------------------
 * Mendeteksi tipe konten secara otomatis:
 *   - VIDEO  -> kirim video (utamakan HD tanpa watermark)
 *   - SLIDE  -> kirim semua foto (album) + musik latar sebagai audio
 *   - AUDIO  -> command khusus untuk ambil musik/mp3 saja
 *
 * Command:
 *   .tiktok <link>            -> video / slide foto otomatis
 *   .tiktokmp3 <link>         -> ambil audio (mp3) saja
 *
 * Sumber: https://www.tikwm.com/api/?url={url}&hd=1
 * Catatan: tikwm membatasi ~1 request/detik (free). Tanpa API key.
 */
import { fetchJson, pick, errorJaringan } from "../../lib/api.js";

function isTiktokUrl(t = "") {
  return /(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|douyin\.com)/i.test(t);
}

/** Caption ringkas info video. */
function buildCaption(d, config) {
  const author = pick(d?.author || {}, ["nickname", "unique_id"], "TikTok");
  const title = pick(d, ["title"], "");
  const likes = pick(d, ["digg_count"], "");
  const views = pick(d, ["play_count"], "");
  let cap = `🎵 *TikTok*\n`;
  if (title) cap += `📝 ${title}\n`;
  cap += `👤 ${author}\n`;
  if (views !== "") cap += `▶️ ${views}  ❤️ ${likes}\n`;
  cap += `\n${config.watermark}`;
  return cap;
}

export default {
  command: ["tiktok", "tt", "tiktokdl", "ttdl", "tiktokmp3", "ttmp3", "tiktokaudio"],
  category: "download",
  desc: "Download video/slide/audio TikTok",
  scope: "both",

  run: async (m, ctx) => {
    const { config, command } = ctx;
    const url = (ctx.text || "").trim();
    const audioOnly = ["tiktokmp3", "ttmp3", "tiktokaudio"].includes(command);

    if (!url) {
      return m.reply(
        `📥 Kirim link TikTok.\nContoh: *${ctx.prefix}${command} https://vt.tiktok.com/xxxx*`
      );
    }
    if (!isTiktokUrl(url)) {
      return m.reply("❌ Itu bukan link TikTok yang valid.");
    }

    await m.react("⏳").catch(() => {});
    let data;
    try {
      const base = config.downloads?.tiktok || "https://www.tikwm.com/api/";
      const api = `${base}?url=${encodeURIComponent(url)}&hd=1`;
      const res = await fetchJson(api);
      if (res?.code !== 0 || !res?.data) {
        throw new Error(res?.msg || "Konten tidak ditemukan.");
      }
      data = res.data;
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    const music = pick(data, ["music", "music_url"]);
    const images = Array.isArray(data.images) ? data.images : [];

    try {
      /* ---- Mode audio saja ---- */
      if (audioOnly) {
        if (!music) throw new Error("Audio tidak tersedia untuk konten ini.");
        await m.react("✅").catch(() => {});
        return m.reply({
          audio: { url: music },
          mimetype: "audio/mpeg",
          fileName: `${pick(data, ["title"], "tiktok")}.mp3`,
        });
      }

      /* ---- SLIDE: kumpulan foto ---- */
      if (images.length > 0) {
        const max = config.downloads?.maxSlideImages || 20;
        const kirim = images.slice(0, max);
        await m.reply(
          `🖼️ Konten ini berupa *slide ${images.length} foto*. Mengirim ${kirim.length} foto...`
        );
        for (let i = 0; i < kirim.length; i++) {
          await m.reply({
            image: { url: kirim[i] },
            caption: i === 0 ? buildCaption(data, config) : `Foto ${i + 1}/${kirim.length}`,
          });
        }
        // kirim musik latar bila ada
        if (music) {
          await m.reply({
            audio: { url: music },
            mimetype: "audio/mpeg",
            fileName: "tiktok-audio.mp3",
          });
        }
        await m.react("✅").catch(() => {});
        return;
      }

      /* ---- VIDEO: utamakan HD tanpa watermark ---- */
      const video = pick(data, ["hdplay", "play", "wmplay"]);
      if (!video) throw new Error("Video tidak tersedia / konten private.");
      await m.react("✅").catch(() => {});
      return m.reply({
        video: { url: video },
        caption: buildCaption(data, config),
      });
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
