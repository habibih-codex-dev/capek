/**
 * plugins/islami/menuislami.js — Submenu khusus islami
 */
export default {
  command: ["menuislami", "islami", "menuislam"],
  category: "islami",
  desc: "Menu khusus fitur islami",
  scope: "both",

  run: async (m, ctx) => {
    const { prefix, config } = ctx;
    const p = prefix;
    const teks =
      `🕌 *MENU ISLAMI — ${config.botName}*\n\n` +
      `*Sholat & Pengingat*\n` +
      `• ${p}jadwalsholat <kota>\n` +
      `• ${p}setkota <kota>\n` +
      `• ${p}autosholat on/off\n` +
      `• ${p}autosholat sound on/off\n\n` +
      `*Al-Qur'an*\n` +
      `• ${p}listsurah\n` +
      `• ${p}surah <nomor>\n` +
      `• ${p}ayat <surah>:<ayat>\n` +
      `• ${p}randomayat\n\n` +
      `*Doa & Dzikir*\n` +
      `• ${p}listdoa  |  ${p}doa <kata>\n` +
      `• ${p}niat <sholat>\n` +
      `• ${p}dzikir  |  ${p}sholawat\n` +
      `• ${p}asmaulhusna [no/random]\n\n` +
      `*Lainnya*\n` +
      `• ${p}tanggalhijriah\n` +
      `• ${p}puasa\n\n` +
      `${config.watermark}`;
    await m.reply(teks);
  },
};
