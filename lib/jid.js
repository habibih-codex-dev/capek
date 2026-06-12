/**
 * lib/jid.js — Helper JID / LID (kompatibel update WhatsApp terbaru)
 * ------------------------------------------------------------------
 * WhatsApp memperkenalkan LID (Linked ID, format "xxxx@lid") di samping
 * JID klasik ("xxxx@s.whatsapp.net"). Akibatnya deteksi admin sering gagal
 * kalau hanya membandingkan satu format. Helper ini menormalkan keduanya
 * dan menyediakan deteksi admin yang membandingkan baik JID maupun LID.
 */
import baileys from "@whiskeysockets/baileys";
const { jidDecode, jidNormalizedUser, isJidGroup, isJidUser } = baileys;

/**
 * Normalisasi sebuah JID/LID menjadi bentuk standar.
 * Mengembalikan string ternormalisasi atau jid asli bila gagal.
 */
export function decodeJid(jid) {
  if (!jid || typeof jid !== "string") return jid;
  try {
    // Pertahankan @lid apa adanya (jangan dipaksa ke @s.whatsapp.net)
    if (jid.endsWith("@lid")) {
      const d = jidDecode(jid);
      if (d?.user) return `${d.user}@lid`;
      return jid;
    }
    if (/@/.test(jid)) {
      const norm = jidNormalizedUser(jid);
      return norm || jid;
    }
    return jid;
  } catch {
    return jid;
  }
}

/** Ambil bagian "user" (angka) dari sebuah jid/lid. */
export function jidToUser(jid) {
  if (!jid) return "";
  try {
    const d = jidDecode(jid);
    if (d?.user) return d.user;
  } catch {
    /* fallback di bawah */
  }
  return String(jid).split("@")[0].split(":")[0];
}

/**
 * Kumpulan kandidat identitas dari sebuah participant.
 * Participant terbaru bisa punya: { id, lid, jid, phoneNumber }.
 * Kita kumpulkan semuanya agar pembandingan tahan banting.
 */
function candidateIds(participant) {
  const set = new Set();
  for (const key of ["id", "lid", "jid", "phoneNumber"]) {
    const v = participant?.[key];
    if (v) {
      set.add(decodeJid(v));
      set.add(jidToUser(v));
    }
  }
  return set;
}

/**
 * Cek apakah `userJid` cocok dengan `participant` (membandingkan JID & LID & user).
 */
export function sameUser(userJid, participant) {
  if (!userJid || !participant) return false;
  const want = new Set([decodeJid(userJid), jidToUser(userJid)]);
  for (const c of candidateIds(participant)) {
    if (want.has(c)) return true;
  }
  return false;
}

/**
 * Daftar JID admin (termasuk superadmin) dari groupMetadata.
 */
export function getGroupAdmins(participants = []) {
  return participants
    .filter((p) => p?.admin === "admin" || p?.admin === "superadmin")
    .map((p) => decodeJid(p.id));
}

/**
 * Apakah `userJid` adalah admin grup? Membandingkan JID maupun LID.
 */
export function isGroupAdmin(userJid, participants = []) {
  if (!userJid || !Array.isArray(participants)) return false;
  for (const p of participants) {
    if (p?.admin !== "admin" && p?.admin !== "superadmin") continue;
    if (sameUser(userJid, p)) return true;
  }
  return false;
}

/**
 * Apakah bot (botJid) admin di grup?
 */
export function isBotAdmin(botJid, participants = []) {
  return isGroupAdmin(botJid, participants);
}

export { isJidGroup, isJidUser, jidNormalizedUser, jidDecode };

export default {
  decodeJid,
  jidToUser,
  sameUser,
  getGroupAdmins,
  isGroupAdmin,
  isBotAdmin,
  isJidGroup,
  isJidUser,
};
