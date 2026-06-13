/**
 * plugins/download/facebook.js — Download video Facebook
 * ------------------------------------------------------------------
 * GRATIS tanpa API key: scrape HTML halaman video publik Facebook,
 * ambil URL HD (browser_native_hd_url / hd_src) atau SD sebagai fallback.
 *
 * Opsional: jika config.downloads.facebook diisi (endpoint API {url}),
 * mode API dipakai sebagai pengganti scrape.
 *
 * Command: .facebook | .fb | .fbdl  <link>
 * Catatan: hanya video PUBLIK. Jika gagal, isi endpoint API di config.
 */
import { fetchText, fetchJson, errorJaringan } from "../../lib/api.js";
import {
  extractMediaList,
  sendMediaList,
  unescapeUrl,
} from "../../lib/downloader.js";

function isFacebookUrl(t = "") {
  return /(?:facebook\.com|fb\.watch|fb\.com)\//i.test(t);
}

/** Ekstrak URL video (utamakan HD) dari HTML halaman Facebook. */
function scrapeFb(html) {
  const hd =
    html.match(/"browser_native_hd_url":"([^"]+)"/)?.[1] ||
    html.match(/"playable_url_quality_hd":"([^"]+)"/)?.[1] ||
    html.match(/hd_src(?:_no_ratelimit)?\s*:\s*"([^"]+)"/)?.[1];
  const sd =
    html.match(/"browser_native_sd_url":"([^"]+)"/)?.[1] ||
    html.match(/"playable_url":"([^"]+)"/)?.[1] ||
    html.match(/sd_src(?:_no_ratelimit)?\s*:\s*"([^"]+)"/)?.[1];
  const u = hd || sd;
  return u ? [{ url: unescapeUrl(u), type: "video" }] : [];
}

export default {
  command: ["facebook", "fb", "fbdl"],
  category: "download",
  desc: "Download video Facebook (publik)",
  scope: "both",

  run: async (m, ctx) => {
    const { config } = ctx;
    const url = (ctx.text || "").trim();

    if (!url) {
      return m.reply(
        `📥 Kirim link Facebook.\nContoh: *${ctx.prefix}fb https://www.facebook.com/watch?v=xxxx*`
      );
    }
    if (!isFacebookUrl(url)) {
      return m.reply("❌ Itu bukan link Facebook yang valid.");
    }

    await m.react("⏳").catch(() => {});
    let list = [];
    try {
      const endpoint = config.downloads?.facebook;
      if (endpoint) {
        // mode API (override)
        const res = await fetchJson(
          endpoint.replace("{url}", encodeURIComponent(url))
        );
        const hd = res?.hd || res?.data?.hd;
        if (typeof hd === "string" && /^https?:\/\//i.test(hd)) {
          list = [{ url: hd, type: "video" }];
        } else {
          list = extractMediaList(res);
        }
      } else {
        // mode scrape (default, gratis)
        const html = await fetchText(url);
        list = scrapeFb(html);
      }
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    if (!list.length) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Tidak ada video yang bisa diunduh. Kemungkinan video private, " +
          "link salah, atau Facebook membatasi akses.\n" +
          "_Owner bisa isi config.downloads.facebook dengan endpoint API sebagai cadangan._"
      );
    }

    try {
      await sendMediaList(m, list, `📘 *Facebook*\n\n${config.watermark}`);
      await m.react("✅").catch(() => {});
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
