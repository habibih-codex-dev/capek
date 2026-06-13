/**
 * plugins/download/instagram.js — Download Reels/foto/video Instagram
 * ------------------------------------------------------------------
 * GRATIS tanpa API key: scrape halaman embed publik Instagram
 *   https://www.instagram.com/p/{shortcode}/embed/captioned/
 * Halaman ini memuat video_url / display_url untuk post publik.
 *
 * Opsional: jika config.downloads.instagram diisi (endpoint API {url}),
 * mode API dipakai sebagai pengganti scrape.
 *
 * Command: .instagram | .ig | .igdl | .reels  <link>
 * Catatan: hanya untuk konten PUBLIK. IG kadang membatasi scraping
 * dari server — jika gagal, isi endpoint API di config sebagai cadangan.
 */
import { fetchText, fetchJson, errorJaringan } from "../../lib/api.js";
import {
  extractMediaList,
  sendMediaList,
  unescapeUrl,
  uniq,
} from "../../lib/downloader.js";

function isInstagramUrl(t = "") {
  return /instagram\.com\/(?:p|reel|reels|tv)\//i.test(t);
}
function shortcode(url = "") {
  return url.match(/(?:\/p\/|\/reel\/|\/reels\/|\/tv\/)([A-Za-z0-9_-]+)/)?.[1] || null;
}

/** Ekstrak media dari HTML halaman embed Instagram. */
function scrapeIg(html) {
  const videos = uniq(
    [...html.matchAll(/"video_url":"([^"]+)"/g)].map((x) => unescapeUrl(x[1]))
  );
  if (videos.length) return videos.map((u) => ({ url: u, type: "video" }));

  const imgs = uniq(
    [...html.matchAll(/"display_url":"([^"]+)"/g)].map((x) => unescapeUrl(x[1]))
  );
  if (imgs.length) return imgs.map((u) => ({ url: u, type: "image" }));

  // fallback: gambar di tag embed
  const embedImg = html.match(
    /class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i
  )?.[1];
  return embedImg ? [{ url: unescapeUrl(embedImg), type: "image" }] : [];
}

export default {
  command: ["instagram", "ig", "igdl", "reels"],
  category: "download",
  desc: "Download Reels/foto/video Instagram (publik)",
  scope: "both",

  run: async (m, ctx) => {
    const { config } = ctx;
    const url = (ctx.text || "").trim();

    if (!url) {
      return m.reply(
        `📥 Kirim link Instagram.\nContoh: *${ctx.prefix}ig https://www.instagram.com/reel/xxxx*`
      );
    }
    if (!isInstagramUrl(url)) {
      return m.reply("❌ Itu bukan link Instagram yang valid (post/reel/tv).");
    }

    await m.react("⏳").catch(() => {});
    let list = [];
    try {
      const endpoint = config.downloads?.instagram;
      if (endpoint) {
        // mode API (override)
        const res = await fetchJson(
          endpoint.replace("{url}", encodeURIComponent(url))
        );
        list = extractMediaList(res);
      } else {
        // mode scrape (default, gratis)
        const code = shortcode(url);
        if (!code) {
          await m.react("❌").catch(() => {});
          return m.reply("❌ Tidak menemukan kode post pada link tersebut.");
        }
        const html = await fetchText(
          `https://www.instagram.com/p/${code}/embed/captioned/`
        );
        list = scrapeIg(html);
      }
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    if (!list.length) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Tidak ada media yang bisa diunduh. Kemungkinan akun private, " +
          "konten dihapus, atau Instagram membatasi akses.\n" +
          "_Owner bisa isi config.downloads.instagram dengan endpoint API sebagai cadangan._"
      );
    }

    try {
      await sendMediaList(m, list, `📷 *Instagram*\n\n${config.watermark}`);
      await m.react("✅").catch(() => {});
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
