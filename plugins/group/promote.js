/**
 * plugins/group/promote.js — Jadikan member sebagai admin
 */
import { resolveTargets, promote } from "../../lib/group-actions.js";
import { jidToUser } from "../../lib/jid.js";

export default {
  command: ["promote"],
  category: "group",
  desc: "Jadikan member sebagai admin grup",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (m, ctx) => {
    const { sock, config, prefix } = ctx;
    const targets = resolveTargets(m, ctx);
    if (!targets.length)
      return m.reply(`Tag / reply / ketik nomor.\nContoh: *${prefix}promote @user*`);
    try {
      await promote(sock, m.chat, targets);
      await m.reply({
        text: `⬆️ Berhasil mempromosikan jadi admin:\n${targets
          .map((t) => `• @${jidToUser(t)}`)
          .join("\n")}`,
        mentions: targets,
      });
    } catch (e) {
      await m.reply(`${config.messages.error}\n_${e.message}_`);
    }
  },
};
