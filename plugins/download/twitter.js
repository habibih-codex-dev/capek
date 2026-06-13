/**
 * plugins/download/twitter.js — Download media Twitter/X (vxtwitter, gratis)
 * ------------------------------------------------------------------
 * Sumber: https://api.vxtwitter.com/Twitter/status/{id}
 *   -> JSON berisi media_extended:[{ url, type }], text, user_name, dll.
 * Gratis, tanpa API key, termasuk yang paling stabil.
 *
 * Command: .twitter | .x | .twitterdl  <link>
 * Mendeteksi otomatis: foto tunggal, banyak foto, video, atau GIF.
 */
import { fetchJson, pick, errorJaringan } from "../../lib/api.js";
import { extractMediaList, sendMediaList } from "../../lib/downloader.js";

function isTwitterUrl(t = "") {
  return /(?:twitter\.com|x\.com|fxtwitter\.com|vxtwitter\.com)\//i.test(t);
}
function tweetId(t = "") {
  return t.match(/(?:status|statuses)\/(\d+)/)?.[1] || null;
}

export default {
  command: ["twitter", "x", "twitterdl", "tweet"],
  category: "download",
  desc: "Download foto/video/GIF dari Twitter (X)",
  scope: "both",

  run: async (m, ctx) => {
    const { config } = ctx;
    const url = (ctx.text || "").trim();

    if (!url) {
      return m.reply(
        `📥 Kirim link Twitter/X.\nContoh: *${ctx.prefix}twitter https://x.com/user/status/123*`
      );
    }
    if (!isTwitterUrl(url)) {
      return m.reply("❌ Itu bukan link Twitter/X yang valid.");
    }
    const id = tweetId(url);
    if (!id) {
      return m.reply("❌ Tidak menemukan ID tweet pada link tersebut.");
    }

    await m.react("⏳").catch(() => {});
    let res;
    try {
      const base =
        config.downloads?.twitter ||
        "https://api.vxtwitter.com/Twitter/status/{id}";
      res = await fetchJson(base.replace("{id}", id));
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    const list = extractMediaList(res);
    if (!list.length) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Tidak ada media pada tweet ini (mungkin hanya teks, atau akun private)."
      );
    }

    const author = pick(res, ["user_name", "user_screen_name"], "Twitter");
    const text = pick(res, ["text"], "");
    const caption =
      `🐦 *Twitter / X*\n` +
      (text ? `📝 ${text}\n` : "") +
      `👤 ${author}\n\n${config.watermark}`;

    try {
      await sendMediaList(m, list, caption);
      await m.react("✅").catch(() => {});
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
