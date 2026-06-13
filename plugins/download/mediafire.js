/**
 * plugins/download/mediafire.js — Download file MediaFire (scrape, tanpa API key)
 * ------------------------------------------------------------------
 * Cara kerja: ambil halaman MediaFire, ekstrak link unduhan langsung dari
 * tombol download (atribut data-scrambled-url / href "download...").
 *
 * Command:
 *   .mediafire <link>   (alias: .mf)
 *
 * Catatan: bergantung struktur HTML MediaFire. Jika halaman berubah, regex
 * mungkin perlu disesuaikan. Tanpa API key, gratis.
 */
import { fetchText, errorJaringan } from "../../lib/api.js";

function isMediafireUrl(t = "") {
  return /mediafire\.com\//i.test(t);
}

/** Ekstrak link unduhan langsung dari HTML halaman MediaFire. */
function extractDownload(html) {
  // 1) Beberapa halaman menyimpan URL ter-enkode base64 di data-scrambled-url
  const scrambled = html.match(/data-scrambled-url="([^"]+)"/i);
  if (scrambled) {
    try {
      const decoded = Buffer.from(scrambled[1], "base64").toString("utf-8");
      if (/^https?:\/\//i.test(decoded)) return decoded;
    } catch {
      /* lanjut ke metode lain */
    }
  }
  // 2) href tombol download langsung
  const direct = html.match(
    /href="(https?:\/\/download[^"]+\.mediafire\.com\/[^"]+)"/i
  );
  if (direct) return direct[1];
  // 3) fallback: cari pola download....mediafire.com di mana saja
  const any = html.match(
    /https?:\/\/download[^"'\s]+\.mediafire\.com\/[^"'\s]+/i
  );
  return any ? any[0] : null;
}

/** Ambil metadata sederhana (nama file & ukuran) dari HTML. */
function extractMeta(html) {
  const nama =
    html.match(/<div class="filename">([^<]+)<\/div>/i)?.[1] ||
    html.match(/aria-label="([^"]+)" class="dl-btn-label"/i)?.[1] ||
    html.match(/"file_name":"([^"]+)"/i)?.[1] ||
    "";
  const ukuran =
    html.match(/Download \(([^)]+)\)/i)?.[1] ||
    html.match(/class="details">[\s\S]*?<li>([^<]*?bytes?[^<]*)<\/li>/i)?.[1] ||
    "";
  return { nama: nama.trim(), ukuran: ukuran.trim() };
}

export default {
  command: ["mediafire", "mf"],
  category: "download",
  desc: "Download file dari link MediaFire",
  scope: "both",

  run: async (m, ctx) => {
    const url = (ctx.text || "").trim();
    if (!url) {
      return m.reply(
        `📥 Kirim link MediaFire.\nContoh: *${ctx.prefix}mediafire https://www.mediafire.com/file/xxxx*`
      );
    }
    if (!isMediafireUrl(url)) {
      return m.reply("❌ Itu bukan link MediaFire yang valid.");
    }

    await m.react("⏳").catch(() => {});
    let html;
    try {
      html = await fetchText(url);
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }

    const link = extractDownload(html);
    if (!link) {
      await m.react("❌").catch(() => {});
      return m.reply(
        "❌ Gagal menemukan link unduhan. File mungkin dihapus, private, " +
          "atau struktur halaman MediaFire berubah."
      );
    }

    const { nama, ukuran } = extractMeta(html);
    const fileName = nama || link.split("/").pop().split("?")[0] || "file";

    await m.react("✅").catch(() => {});
    return m.reply({
      document: { url: link },
      fileName,
      mimetype: "application/octet-stream",
      caption:
        `📁 *MediaFire*\n` +
        `📄 ${fileName}\n` +
        (ukuran ? `📦 ${ukuran}\n` : "") +
        `\n${ctx.config.watermark}`,
    });
  },
};
