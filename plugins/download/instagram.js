/**
 * plugins/download/instagram.js — Download Reels/foto/video Instagram
 * ------------------------------------------------------------------
 * Belum ada API gratis Instagram yang benar-benar awet, jadi endpoint
 * dibuat swappable lewat config.downloads.instagram (format {url}).
 * Jika belum diisi, bot memberi info yang jelas (tidak error).
 *
 * Command: .instagram | .ig | .igdl  <link>
 * Mendeteksi otomatis: foto tunggal, carousel (banyak), atau video.
 */
import { fetchJson, errorJaringan } from "../../lib/api.js";
import { extractMediaList, sendMediaList } from "../../lib/downloader.js";

function isInstagramUrl(t = "") {
  return /instagram\.com\/(?:p|reel|reels|tv|stories)\//i.test(t);
}

export default {
  command: ["instagram", "ig", "igdl", "reels"],
  category: "download",
  desc: "Download Reels/foto/video Instagram",
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

    const endpoint = config.downloads?.instagram;
    if (!endpoint) {
      return m.reply(
        `⚠️ Fitur unduh Instagram belum diaktifkan.\n` +
          `Owner perlu mengisi *config.downloads.instagram* dengan endpoint API ` +
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

    const list = extractMediaList(res);
    if (!list.length) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Tidak ada media yang bisa diunduh (akun private atau konten dihapus)."
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
