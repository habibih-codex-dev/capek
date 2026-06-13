/**
 * plugins/islami/doa.js — Doa harian (myQuran API v2)
 * ------------------------------------------------------------------
 * Sumber: https://api.myquran.com/v2/doa
 *   - /doa/acak          -> satu doa acak
 *   - /doa/semua         -> semua doa (dipakai untuk pencarian judul)
 *
 * Command:
 *   .doa                 -> doa acak
 *   .doa <kata kunci>    -> cari doa berdasarkan judul (mis. ".doa tidur")
 *
 * Nama field diambil secara defensif agar aman terhadap variasi skema API.
 */
import { fetchJson, pick, errorJaringan } from "../../lib/api.js";

const API = "https://api.myquran.com/v2/doa";

function normalize(item) {
  return {
    judul: pick(item, ["judul", "title", "nama", "doa"]),
    arab: pick(item, ["arab", "arabic", "teks_arab", "ar"]),
    latin: pick(item, ["latin", "transliterasi", "indo_latin"]),
    arti: pick(item, ["indo", "arti", "terjemah", "translation"]),
    sumber: pick(item, ["source", "sumber", "footnote"]),
  };
}

function formatDoa(d) {
  let teks = `🤲 *DOA${d.judul ? `: ${d.judul.toUpperCase()}` : ""}*\n\n`;
  if (d.arab) teks += `${d.arab}\n\n`;
  if (d.latin) teks += `_${d.latin}_\n\n`;
  if (d.arti) teks += `Artinya:\n"${d.arti}"\n`;
  if (d.sumber) teks += `\n📖 ${d.sumber}`;
  if (!d.arab && !d.latin && !d.arti) {
    teks += "_(format data dari API tidak dikenali)_";
  }
  return teks.trim();
}

export default {
  command: ["doa", "doaharian"],
  category: "islami",
  desc: "Doa harian (acak atau cari judul)",
  scope: "both",

  run: async (m, ctx) => {
    const keyword = (ctx.text || "").trim().toLowerCase();
    await m.react("⏳").catch(() => {});

    try {
      /* ---- Cari berdasarkan judul ---- */
      if (keyword) {
        const data = await fetchJson(`${API}/semua`);
        const arr = Array.isArray(data?.data) ? data.data : [];
        const cocok = arr.filter((it) => {
          const judul = String(
            pick(it, ["judul", "title", "nama", "doa"])
          ).toLowerCase();
          return judul.includes(keyword);
        });

        if (!cocok.length) {
          await m.react("❌").catch(() => {});
          return m.reply(
            `❌ Doa dengan kata kunci *${keyword}* tidak ditemukan.\n` +
              `Coba kata lain, atau ketik *${ctx.prefix}doa* untuk doa acak.`
          );
        }

        // Jika hasil banyak, tampilkan daftar judul; jika sedikit, tampilkan langsung.
        if (cocok.length > 1) {
          let teks = `🤲 *Ditemukan ${cocok.length} doa* untuk "${keyword}":\n\n`;
          teks += cocok
            .slice(0, 15)
            .map(
              (it, i) => `${i + 1}. ${pick(it, ["judul", "title", "nama"])}`
            )
            .join("\n");
          teks += `\n\n_Ketik kata kunci lebih spesifik untuk menampilkan isi doa._`;
          await m.react("🤲").catch(() => {});
          return m.reply(teks);
        }

        await m.react("🤲").catch(() => {});
        return m.reply(formatDoa(normalize(cocok[0])));
      }

      /* ---- Doa acak ---- */
      const data = await fetchJson(`${API}/acak`);
      const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
      if (!item) throw new Error("Data tidak ditemukan.");
      await m.react("🤲").catch(() => {});
      return m.reply(formatDoa(normalize(item)));
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
