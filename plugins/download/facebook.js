/**
 * plugins/download/facebook.js — Download video Facebook
 * ------------------------------------------------------------------
 * Endpoint swappable lewat config.downloads.facebook (format {url}).
 * Jika belum diisi, bot memberi info yang jelas (tidak error).
 *
 * Command: .facebook | .fb | .fbdl  <link>
 * Memilih kualitas HD bila tersedia, fallback ke SD.
 */
import { fetchJson, pick, errorJaringan } from "../../lib/api.js";
import { extractMediaList, sendMediaList } from "../../lib/downloader.js";

function isFacebookUrl(t = "") {
  return /(?:facebook\.com|fb\.watch|fb\.com)\//i.test(t);
}

export default {
  command: ["facebook", "fb", "fbdl"],
  category: "download",
  desc: "Download video dari Facebook",
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

    const endpoint = config.downloads?.facebook;
    if (!endpoint) {
      return m.reply(
        `⚠️ Fitur unduh Facebook belum diaktifkan.\n` +
          `Owner perlu mengisi *config.downloads.facebook* dengan endpoint API ` +
          `(format berisi {url}).`
      );
    }

    await m.react("⏳").catch(() => {});
    let res;
    try {
      res = await fetchJson(endpoint.replace("{url}", encodeURIComponent(url)));
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    // Utamakan HD bila API menyediakan field terpisah.
    const hd = pick(res, ["hd"], "") || pick(res?.data || {}, ["hd"], "");
    let list = [];
    if (hd && /^https?:\/\//i.test(hd)) list = [{ url: hd, type: "video" }];
    else list = extractMediaList(res);

    if (!list.length) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Tidak ada video yang bisa diunduh (video private atau link salah)."
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
