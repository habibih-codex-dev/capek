/**
 * plugins/group/demote.js — Turunkan admin menjadi member biasa
 */
import { resolveTargets, demote } from "../../lib/group-actions.js";
import { jidToUser } from "../../lib/jid.js";

export default {
  command: ["demote"],
  category: "group",
  desc: "Turunkan admin menjadi member",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, config, prefix } = ctx;
    const targets = resolveTargets(m, ctx);
    if (!targets.length)
      return m.reply(`Tag / reply / ketik nomor.\nContoh: *${prefix}demote @user*`);
    try {
      await demote(sock, m.chat, targets);
      await m.reply({
        text: `⬇️ Berhasil menurunkan dari admin:\n${targets
          .map((t) => `• @${jidToUser(t)}`)
          .join("\n")}`,
        mentions: targets,
      });
    } catch (e) {
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
