/**
 * plugins/islami/alquran.js — Al-Quran (myQuran API v2)
 * ------------------------------------------------------------------
 * Sumber: https://api.myquran.com/v2/quran
 *   - /quran/surat/semua      -> daftar 114 surat
 *   - /quran/surat/{nomor}    -> info satu surat
 *   - /quran/ayat/{surat}/{ayat} -> satu ayat (arab + terjemah)
 *
 * Command:
 *   .surat                    -> daftar 114 surat
 *   .surat <nomor>            -> info surat (nama, arti, jumlah ayat)
 *   .ayat <surat> <ayat>      -> tampilkan ayat tertentu
 *
 * Nama field diambil secara defensif agar aman terhadap variasi skema API.
 */
import { fetchJson, pick, errorJaringan } from "../../lib/api.js";

const API = "https://api.myquran.com/v2/quran";

function normSurat(s) {
  return {
    nomor: pick(s, ["nomor", "number", "no", "id"], "?"),
    namaLatin: pick(s, ["nama_latin", "namaLatin", "latin", "nama_indo"]),
    nama: pick(s, ["nama", "name", "arab"]),
    arti: pick(s, ["arti", "translation", "terjemah", "name_translation"]),
    jumlahAyat: pick(s, ["jumlah_ayat", "jumlahAyat", "ayat", "numberOfVerses"], "?"),
    tempat: pick(s, ["tempat_turun", "tempatTurun", "revelation", "type"]),
  };
}

function normAyat(a) {
  return {
    surat: pick(a, ["surah", "surat", "nomor_surat"], ""),
    nomor: pick(a, ["ayah", "nomor", "ayat", "number_in_surah"], "?"),
    arab: pick(a, ["arab", "arabic", "teks_arab", "ar", "text_arab"]),
    latin: pick(a, ["latin", "transliterasi", "text_latin"]),
    arti: pick(a, ["idn", "indo", "arti", "terjemah", "text_indonesia", "translation_id"]),
  };
}

export default {
  command: ["surat", "surah", "quran", "alquran", "ayat", "ayah"],
  category: "islami",
  desc: "Al-Quran: daftar surat, info surat, & baca ayat",
  scope: "both",

  run: async (m, ctx) => {
    const cmd = ctx.command;
    const args = ctx.args || [];
    await m.react("⏳").catch(() => {});

    try {
      /* ============ AYAT: .ayat <surat> <ayat> ============ */
      if (cmd === "ayat" || cmd === "ayah") {
        const s = parseInt(args[0], 10);
        const a = parseInt(args[1], 10);
        if (!s || !a) {
          await m.react("❌").catch(() => {});
          return m.reply(
            `❌ Format salah.\nContoh: *${ctx.prefix}ayat 1 1* (Al-Fatihah ayat 1)`
          );
        }
        if (s < 1 || s > 114) {
          await m.react("❌").catch(() => {});
          return m.reply("❌ Nomor surat harus 1–114.");
        }
        const data = await fetchJson(`${API}/ayat/${s}/${a}`);
        const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
        if (!item) throw new Error("Ayat tidak ditemukan.");
        const ay = normAyat(item);
        let teks = `📖 *AL-QURAN ${s}:${a}*\n\n`;
        if (ay.arab) teks += `${ay.arab}\n\n`;
        if (ay.latin) teks += `_${ay.latin}_\n\n`;
        if (ay.arti) teks += `Artinya:\n"${ay.arti}"`;
        if (!ay.arab && !ay.arti)
          teks += "_(format data dari API tidak dikenali)_";
        await m.react("📖").catch(() => {});
        return m.reply(teks.trim());
      }

      /* ============ SURAT ============ */
      const arg = (args[0] || "").trim();

      // Info satu surat: .surat <nomor>
      if (/^\d+$/.test(arg)) {
        const no = parseInt(arg, 10);
        if (no < 1 || no > 114) {
          await m.react("❌").catch(() => {});
          return m.reply("❌ Nomor surat harus 1–114.");
        }
        const data = await fetchJson(`${API}/surat/${no}`);
        const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
        if (!item) throw new Error("Surat tidak ditemukan.");
        const s = normSurat(item);
        let teks = `📖 *SURAT ${s.nomor}${s.nama ? ` — ${s.nama}` : ""}*\n\n`;
        if (s.namaLatin) teks += `Nama : ${s.namaLatin}\n`;
        if (s.arti) teks += `Arti : ${s.arti}\n`;
        if (s.jumlahAyat !== "?") teks += `Jumlah ayat : ${s.jumlahAyat}\n`;
        if (s.tempat) teks += `Tempat turun : ${s.tempat}\n`;
        teks += `\nBaca ayat: *${ctx.prefix}ayat ${s.nomor} <no_ayat>*`;
        await m.react("📖").catch(() => {});
        return m.reply(teks.trim());
      }

      // Daftar semua surat: .surat
      const data = await fetchJson(`${API}/surat/semua`);
      const arr = Array.isArray(data?.data) ? data.data : [];
      if (!arr.length) throw new Error("Data surat kosong dari server.");
      let teks = `📖 *DAFTAR SURAT AL-QURAN*\n\n`;
      teks += arr
        .map((it) => {
          const s = normSurat(it);
          return `${s.nomor}. ${s.namaLatin || s.nama}${
            s.arti ? ` (${s.arti})` : ""
          }`;
        })
        .join("\n");
      teks += `\n\n_Info surat: ${ctx.prefix}surat <nomor>_\n_Baca ayat: ${ctx.prefix}ayat <surat> <ayat>_`;
      await m.react("📖").catch(() => {});
      return m.reply(teks.trim());
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
  },
};
