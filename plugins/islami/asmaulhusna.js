/**
 * plugins/islami/asmaulhusna.js — 99 Asmaul Husna (myQuran API v2)
 * ------------------------------------------------------------------
 * Sumber: https://api.myquran.com/v2/husna
 *   - /husna/semua      -> semua nama
 *   - /husna/{urutan}   -> satu nama berdasarkan urutan (1-99)
 *   - /husna/acak       -> satu nama acak
 *
 * Command:
 *   .asmaulhusna        -> nama acak
 *   .asmaulhusna 25     -> nama ke-25
 *   .asmaulhusna list   -> daftar 99 nama (ringkas)
 *
 * Catatan: nama field di-ambil secara defensif (arab/arabic, indo/arti, dst.)
 * agar tetap aman walau skema API sedikit berbeda.
 */
import { fetchJson, pick, errorJaringan } from "../../lib/api.js";

const API = "https://api.myquran.com/v2/husna";

/** Normalisasi satu item asmaul husna ke bentuk standar. */
function normalize(item) {
  return {
    urutan: pick(item, ["urutan", "id", "no", "nomor"], "?"),
    arab: pick(item, ["arab", "arabic", "teks_arab", "ar"]),
    latin: pick(item, ["latin", "transliterasi", "latin_text", "indoLatin"]),
    arti: pick(item, ["indo", "arti", "terjemah", "translation", "id_arti"]),
  };
}

function formatSatu(n) {
  let teks = `📿 *ASMAUL HUSNA${n.urutan !== "?" ? ` ke-${n.urutan}` : ""}*\n\n`;
  if (n.arab) teks += `${n.arab}\n`;
  if (n.latin) teks += `*${n.latin}*\n`;
  if (n.arti) teks += `_"${n.arti}"_\n`;
  if (!n.arab && !n.latin && !n.arti) {
    teks += "_(format data dari API tidak dikenali)_\n";
  }
  return teks.trim();
}

export default {
  command: ["asmaulhusna", "asmaul", "99nama"],
  category: "islami",
  desc: "Asmaul Husna (acak / nomor / daftar)",
  scope: "both",

  run: async (m, ctx) => {
    const arg = (ctx.text || "").trim().toLowerCase();
    await m.react("⏳").catch(() => {});

    try {
      /* ---- Daftar 99 nama ---- */
      if (arg === "list" || arg === "semua") {
        const data = await fetchJson(`${API}/semua`);
        const arr = Array.isArray(data?.data) ? data.data : [];
        if (!arr.length) throw new Error("Data kosong dari server.");
        let teks = `📿 *99 ASMAUL HUSNA*\n\n`;
        teks += arr
          .map((it) => {
            const n = normalize(it);
            return `${n.urutan}. ${n.latin || n.arab}${
              n.arti ? ` — ${n.arti}` : ""
            }`;
          })
          .join("\n");
        await m.react("📿").catch(() => {});
        return m.reply(teks.trim());
      }

      /* ---- Nomor tertentu ---- */
      if (/^\d+$/.test(arg)) {
        const no = parseInt(arg, 10);
        if (no < 1 || no > 99) {
          await m.react("❌").catch(() => {});
          return m.reply("❌ Nomor Asmaul Husna harus antara 1–99.");
        }
        const data = await fetchJson(`${API}/${no}`);
        const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
        if (!item) throw new Error("Data tidak ditemukan.");
        await m.react("📿").catch(() => {});
        return m.reply(formatSatu(normalize(item)));
      }

      /* ---- Acak ---- */
      const data = await fetchJson(`${API}/acak`);
      const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
      if (!item) throw new Error("Data tidak ditemukan.");
      await m.react("📿").catch(() => {});
      return m.reply(formatSatu(normalize(item)));
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
