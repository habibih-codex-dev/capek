/**
 * plugins/download/pinterest.js — Download gambar/video Pinterest (scrape)
 * ------------------------------------------------------------------
 * Default: scrape halaman pin (ambil og:video / og:image / video_list).
 * Bisa dioverride lewat config.downloads.pinterest (endpoint API {url}).
 *
 * Command: .pinterest | .pin  <link pin>
 */
import { fetchText, fetchJson, errorJaringan } from "../../lib/api.js";
import { extractMediaList, sendMediaList } from "../../lib/downloader.js";

function isPinterestUrl(t = "") {
  return /(?:pinterest\.[a-z.]+\/|pin\.it\/)/i.test(t);
}

/** Bersihkan escape pada URL hasil scrape (\/ -> /, \u002F -> /). */
function clean(u = "") {
  return u
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/&amp;/g, "&");
}

/** Ambil media dari HTML halaman Pinterest. */
function scrapeMedia(html) {
  // 1) Video (mp4) — biasanya di video_list / contentUrl / og:video
  const vid =
    html.match(/"url":"(https:[^"]+\.mp4[^"]*)"/i)?.[1] ||
    html.match(/<meta property="og:video" content="([^"]+)"/i)?.[1] ||
    html.match(/<meta property="og:video:url" content="([^"]+)"/i)?.[1];
  if (vid) return [{ url: clean(vid), type: "video" }];

  // 2) Gambar — og:image (resolusi tinggi)
  const img =
    html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] ||
    html.match(/"orig":\{"url":"(https:[^"]+)"/i)?.[1];
  if (img) return [{ url: clean(img), type: "image" }];

  return [];
}

export default {
  command: ["pinterest", "pin", "pinterestdl"],
  category: "download",
  desc: "Download gambar/video dari Pinterest",
  scope: "both",

  run: async (m, ctx) => {
    const { config } = ctx;
    const url = (ctx.text || "").trim();

    if (!url) {
      return m.reply(
        `📥 Kirim link Pinterest.\nContoh: *${ctx.prefix}pinterest https://pin.it/xxxx*`
      );
    }
    if (!isPinterestUrl(url)) {
      return m.reply("❌ Itu bukan link Pinterest yang valid.");
    }

    await m.react("⏳").catch(() => {});
    let list = [];
    try {
      const endpoint = config.downloads?.pinterest;
      if (endpoint) {
        // mode API (override)
        const res = await fetchJson(endpoint.replace("{url}", encodeURIComponent(url)));
        list = extractMediaList(res);
      } else {
        // mode scrape (default)
        const html = await fetchText(url);
        list = scrapeMedia(html);
      }
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    if (!list.length) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Gagal menemukan media. Pin mungkin private atau struktur halaman berubah."
      );
    }

    try {
      await sendMediaList(m, list, `📌 *Pinterest*\n\n${config.watermark}`);
      await m.react("✅").catch(() => {});
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
