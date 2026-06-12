/**
 * plugins/islami/setkota.js — Atur kota jadwal sholat untuk grup (admin)
 */
export default {
  command: ["setkota", "setcity"],
  category: "islami",
  desc: "Atur kota jadwal sholat grup",
  group: true,
  admin: true,

  run: async (m, ctx) => {
    const { db, text, prefix, config } = ctx;
    const g = db.group(m.chat);

    if (!text) {
      return m.reply(
        `🏙️ Kota grup saat ini: *${g.kota || config.islami.defaultCity + " (default)"}*\n\n` +
          `Ubah dengan: *${prefix}setkota Surabaya*`
      );
    }

    g.kota = text.trim();
    db.markDirty();
    await m.reply(
      `✅ Kota jadwal sholat grup di-set ke *${g.kota}*.\n` +
        `Cek dengan *${prefix}jadwalsholat*.`
    );
  },
};
