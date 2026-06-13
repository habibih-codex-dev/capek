/**
 * plugins/islami/jadwalsholat.js — Jadwal sholat harian + setkota
 * ------------------------------------------------------------------
 * Sumber data: myQuran API v2 (https://api.myquran.com/v2/sholat)
 *   - Cari kota   : /kota/cari/{keyword}      -> [{ id, lokasi }]
 *   - Jadwal      : /jadwal/{id}/{thn}/{bln}/{tgl} -> { lokasi, daerah, jadwal{...} }
 *
 * Command:
 *   .setkota <nama kota>      -> simpan kota untuk chat ini
 *   .jadwalsholat [nama kota] -> tampilkan jadwal (pakai kota tersimpan bila kosong)
 *
 * Catatan: butuh koneksi internet. Error "fetch failed" = bot tidak bisa
 * terhubung ke server (cek internet / API down), BUKAN karena nama kota salah.
 */

const API = "https://api.myquran.com/v2/sholat";

/** fetch JSON dengan timeout + User-Agent (banyak API menolak request tanpa UA). */
async function fetchJson(url, timeout = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (HabibihBot)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Cari kota berdasarkan kata kunci. Mengembalikan array [{ id, lokasi }]. */
async function cariKota(keyword) {
  const data = await fetchJson(
    `${API}/kota/cari/${encodeURIComponent(keyword)}`
  );
  if (!data?.status || !Array.isArray(data.data)) return [];
  return data.data;
}

/** Ambil jadwal hari ini untuk id kota tertentu. */
async function getJadwalHariIni(id) {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const data = await fetchJson(`${API}/jadwal/${id}/${y}/${mo}/${d}`);
  if (!data?.status || !data?.data?.jadwal) {
    throw new Error("Jadwal tidak tersedia untuk kota ini.");
  }
  return data.data; // { id, lokasi, daerah, jadwal: {...} }
}

/** Ambil/simpan data kota tersimpan untuk chat (grup -> per grup, pribadi -> per user). */
function lokasiStore(m, ctx) {
  return m.isGroup ? ctx.db.group(m.chat) : ctx.db.user(m.sender);
}

/** Pesan error yang ramah: bedakan gagal koneksi vs error lain. */
function errorJaringan(e) {
  const msg = String(e?.message || e);
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|aborted|network|abort/i.test(msg)) {
    return (
      "⚠️ Gagal terhubung ke server jadwal sholat.\n" +
      "Penyebab: koneksi internet bermasalah atau server sedang down — " +
      "*bukan* karena nama kota salah.\n\n" +
      `_${msg}_`
    );
  }
  return `⚠️ Terjadi kesalahan: _${msg}_`;
}

/* ============ Handler: setkota ============ */
async function setKota(m, ctx) {
  const { text } = ctx;
  const store = lokasiStore(m, ctx);

  if (!text) {
    const skrg = store.kotaSholat
      ? `*${store.kotaSholat.lokasi}*`
      : "_(belum diatur)_";
    return m.reply(
      `📍 Kota saat ini: ${skrg}\n\n` +
        `Atur dengan: *${ctx.prefix}setkota <nama kota>*\n` +
        `Contoh: *${ctx.prefix}setkota Surabaya*`
    );
  }

  await m.react("⏳").catch(() => {});
  let hasil;
  try {
    hasil = await cariKota(text);
  } catch (e) {
    await m.react("❌").catch(() => {});
    return m.reply(errorJaringan(e));
  }

  if (!hasil.length) {
    await m.react("❌").catch(() => {});
    return m.reply(
      `❌ Kota *${text}* tidak ditemukan.\n` +
        `Coba nama kota/kabupaten lain (mis. "Surabaya", "Kab. Sidoarjo").`
    );
  }

  // Simpan hasil teratas, tampilkan alternatif bila ada.
  const pilih = hasil[0];
  store.kotaSholat = { id: pilih.id, lokasi: pilih.lokasi };
  ctx.db.markDirty();
  await m.react("✅").catch(() => {});

  let teks = `✅ Kota jadwal sholat diatur ke *${pilih.lokasi}*.\n`;
  teks += `Ketik *${ctx.prefix}jadwalsholat* untuk melihat jadwal hari ini.`;
  if (hasil.length > 1) {
    teks += `\n\n_Kota lain yang cocok:_\n`;
    teks += hasil
      .slice(0, 6)
      .map((k) => `• ${k.lokasi}`)
      .join("\n");
    teks += `\n_Jika kurang tepat, ketik ulang dengan nama lebih spesifik._`;
  }
  return m.reply(teks);
}

/* ============ Handler: jadwalsholat ============ */
async function jadwalSholat(m, ctx) {
  const { text } = ctx;
  const store = lokasiStore(m, ctx);

  let id, lokasiNama;

  if (text) {
    // kota diberikan langsung di argumen
    await m.react("⏳").catch(() => {});
    let hasil;
    try {
      hasil = await cariKota(text);
    } catch (e) {
      await m.react("❌").catch(() => {});
      return m.reply(errorJaringan(e));
    }
    if (!hasil.length) {
      await m.react("❌").catch(() => {});
      return m.reply(`❌ Kota *${text}* tidak ditemukan. Cek ejaan nama kota.`);
    }
    id = hasil[0].id;
    lokasiNama = hasil[0].lokasi;
  } else if (store.kotaSholat) {
    id = store.kotaSholat.id;
    lokasiNama = store.kotaSholat.lokasi;
    await m.react("⏳").catch(() => {});
  } else {
    return m.reply(
      `📍 Kota belum diatur.\n` +
        `Atur dulu: *${ctx.prefix}setkota <nama kota>*\n` +
        `Atau langsung: *${ctx.prefix}jadwalsholat <nama kota>*`
    );
  }

  let data;
  try {
    data = await getJadwalHariIni(id);
  } catch (e) {
    await m.react("❌").catch(() => {});
    return m.reply(errorJaringan(e));
  }

  const j = data.jadwal;
  await m.react("🕌").catch(() => {});
  const teks =
    `🕌 *JADWAL SHOLAT*\n` +
    `📍 ${data.lokasi}${data.daerah ? `, ${data.daerah}` : ""}\n` +
    `🗓️ ${j.tanggal}\n` +
    `────────────────\n` +
    `🌅 Imsak   : ${j.imsak}\n` +
    `🕓 Subuh   : ${j.subuh}\n` +
    `🌄 Terbit  : ${j.terbit}\n` +
    `🌞 Dzuhur  : ${j.dzuhur}\n` +
    `🌤️ Ashar   : ${j.ashar}\n` +
    `🌆 Maghrib : ${j.maghrib}\n` +
    `🌙 Isya    : ${j.isya}\n` +
    `────────────────\n` +
    `${ctx.config.watermark}`;
  return m.reply(teks);
}

export default {
  command: [
    "jadwalsholat",
    "jadwalshalat",
    "jadwalsolat",
    "sholat",
    "shalat",
    "setkota",
    "setlokasi",
  ],
  category: "islami",
  desc: "Jadwal sholat harian + atur kota (.setkota)",
  scope: "both",

  run: async (m, ctx) => {
    const cmd = ctx.command;
    if (cmd === "setkota" || cmd === "setlokasi") return setKota(m, ctx);
    return jadwalSholat(m, ctx);
  },
};
