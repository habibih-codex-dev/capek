/**
 * config.js — Konfigurasi utama Habibih Bot
 * ------------------------------------------------------------------
 * Semua pengaturan global bot ada di sini. Ubah sesuai kebutuhan.
 * File ini di-import oleh index.js, handler.js, dan seluruh plugin.
 */

const config = {
  /* ============ IDENTITAS BOT ============ */
  botName: "Habibih Bot",
  ownerName: "Habibi Official",
  ownerNumber: ["6285181576338"], // bisa lebih dari satu owner
  botNumber: "628xxxxxxxxx", // diisi otomatis saat bot login (boleh dibiarkan)

  /* ============ PREFIX & TAMPILAN ============ */
  // Prefix command. Bisa multi-prefix. Set "" (string kosong) = tanpa prefix.
  prefix: [".", "!", "#"],
  watermark: "© Habibih Bot",
  thumbnail: "https://telegra.ph/file/8b2f0e2c0e3a1f9c2d4b6.jpg", // ganti dgn URL gambar sendiri
  website: "https://habibih.example.com",
  channel: "https://whatsapp.com/channel/0000000000000000000000", // link channel WA

  /* ============ SLOT API KEY (isi nanti) ============ */
  // Dikosongkan dulu. Plugin yang butuh akan memberi pesan jika kosong.
  apikey: {
    openai: "",
    gemini: "",
    rapidapi: "",
    // tambahkan key lain di sini bila perlu
  },

  /* ============ SETTINGS BOT ============ */
  settings: {
    // Mode bot: true = hanya owner yang bisa pakai (self), false = publik
    self: false,
    // Auto-read pesan masuk
    autoRead: false,
    // Auto-typing saat memproses command
    autoTyping: false,
    // Tampilkan "online" terus
    alwaysOnline: false,
    // Anti-call: tolak/auto-block panggilan masuk
    antiCall: true,
    // Auto-reconnect saat koneksi terputus
    autoReconnect: true,
    // Backup database otomatis (menit). 0 = nonaktif
    autoBackupMinutes: 30,
    // Batas cooldown command per user (ms) untuk anti-spam
    cooldown: 3000,
  },

  /* ============ SCOPE PENGATURAN ============
   * Mengatur di mana sebuah fitur/pengaturan boleh dipakai/diubah.
   * Nilai valid: "group" | "private" | "both"
   * Dipakai handler untuk memvalidasi command bertanda scope tertentu.
   */
  scope: {
    default: "both", // default semua command jika tidak ditentukan
    settingsChange: "both", // di mana command pengubah setting boleh dipakai
  },

  /* ============ PESAN OTOMATIS ============ */
  messages: {
    owner: "❌ Perintah ini khusus Owner bot.",
    group: "❌ Perintah ini hanya bisa digunakan di Grup.",
    private: "❌ Perintah ini hanya bisa digunakan di Chat Pribadi.",
    admin: "❌ Perintah ini hanya untuk Admin Grup.",
    botAdmin: "❌ Jadikan bot sebagai Admin terlebih dahulu.",
    premium: "❌ Fitur ini hanya untuk pengguna Premium.",
    wait: "⏳ Sedang diproses...",
    success: "✅ Berhasil.",
    error: "⚠️ Terjadi kesalahan saat menjalankan perintah.",
    // Tambahan umum
    cooldown: "⏳ Sabar, jangan spam. Coba lagi sebentar.",
    onlyForeign: "❌ Nomor luar negeri tidak diizinkan di grup ini.",
  },

  /* ============ PATH (jangan diubah kecuali paham) ============ */
  paths: {
    session: "./session",
    database: "./database",
    plugins: "./plugins",
  },

  /* ============ LOGIN ============
   * method: "pairing" | "qr"  (bisa di-override lewat argumen CLI)
   * pairingNumber: nomor bot tanpa "+" / spasi, untuk pairing code
   */
  login: {
    method: "pairing",
    pairingNumber: "628xxxxxxxxx",
  },
};

export default config;
