/**
 * plugins/group/add.js — Tambah member ke grup (KHUSUS OWNER)
 * Jika gagal karena privasi WA, bot mengirim link undangan ke japri target.
 */
import { numberToJid, add } from "../../lib/group-actions.js";
import { jidToUser } from "../../lib/jid.js";

export default {
  command: ["add"],
  category: "group",
  desc: "Tambah member ke grup (owner)",
  owner: true,
  group: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, config, text, prefix } = ctx;
    const nums = (text || "").match(/\d{5,}/g);
    if (!nums || !nums.length)
      return m.reply(`Ketik nomor yang ingin ditambahkan.\nContoh: *${prefix}add 628xxxx*`);

    const jids = nums.map(numberToJid).filter(Boolean);
    try {
      const res = await add(sock, m.chat, jids);
      const okList = [];
      const inviteList = [];

      for (const r of res || []) {
        const tjid = r.jid;
        if (String(r.status) === "200") {
          okList.push(tjid);
        } else {
          // Fallback: kirim link undangan ke japri target
          try {
            const code = await sock.groupInviteCode(m.chat);
            await sock.sendMessage(tjid, {
              text:
                `Halo! Kamu diundang bergabung ke grup *${ctx.groupMetadata?.subject || ""}*.\n` +
                `Klik untuk gabung: https://chat.whatsapp.com/${code}`,
            });
            inviteList.push(tjid);
          } catch {
            /* abaikan bila tetap gagal */
          }
        }
      }

      let teks = "";
      if (okList.length)
        teks += `✅ Ditambahkan:\n${okList.map((j) => `• @${jidToUser(j)}`).join("\n")}\n`;
      if (inviteList.length)
        teks += `📨 Tidak bisa ditambah langsung (privasi), link undangan dikirim via japri:\n${inviteList
          .map((j) => `• @${jidToUser(j)}`)
          .join("\n")}`;
      if (!teks) teks = config.messages.error;

      await m.reply({ text: teks.trim(), mentions: [...okList, ...inviteList] });
    } catch (e) {
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
