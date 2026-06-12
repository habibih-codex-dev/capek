/**
 * lib/group-events.js — Event peserta grup (welcome / goodbye)
 * ------------------------------------------------------------------
 * Dipanggil index.js pada event "group-participants.update".
 * Mengaktifkan sapaan masuk/keluar bila diaktifkan di database grup.
 */
import { decodeJid } from "./jid.js";

export async function handleGroupParticipants(sock, update, db, config) {
  const { id, participants, action } = update;
  const g = db.group(id);

  let meta;
  try {
    meta = await sock.groupMetadata(id);
  } catch {
    meta = { subject: "Grup" };
  }

  for (const raw of participants) {
    const user = decodeJid(raw);
    const tag = `@${String(user).split("@")[0]}`;

    if (action === "add" && g.welcome) {
      const text =
        (g.welcomeText || `Selamat datang ${tag} di *${meta.subject}*! 🎉`)
          .replace(/@user/g, tag)
          .replace(/@subject/g, meta.subject || "")
          .replace(/@desc/g, meta.desc || "");
      await sock.sendMessage(id, { text, mentions: [user] });
    }

    if ((action === "remove" || action === "leave") && g.goodbye) {
      const text =
        (g.goodbyeText || `Selamat tinggal ${tag} 👋`)
          .replace(/@user/g, tag)
          .replace(/@subject/g, meta.subject || "");
      await sock.sendMessage(id, { text, mentions: [user] });
    }
  }
}

export default handleGroupParticipants;
