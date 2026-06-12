/**
 * lib/group-actions.js — Helper aksi grup terpusat
 * ------------------------------------------------------------------
 * Menyeragamkan cara menentukan target (mention / reply / ketik nomor)
 * dan membungkus aksi grup Baileys (promote/demote/add/remove).
 */
import { decodeJid } from "./jid.js";

/** Ubah teks nomor menjadi JID WhatsApp. */
export function numberToJid(num) {
  const clean = String(num).replace(/[^0-9]/g, "");
  if (!clean) return null;
  return `${clean}@s.whatsapp.net`;
}

/**
 * Ambil SATU target dari pesan.
 * Prioritas: mention > reply (pengirim quoted) > nomor di teks.
 */
export function resolveTarget(m, ctx) {
  if (m.mentionedJid && m.mentionedJid.length) return decodeJid(m.mentionedJid[0]);
  if (m.quoted && m.quoted.sender) return decodeJid(m.quoted.sender);
  const nums = (ctx.text || "").match(/\d{5,}/g);
  if (nums && nums[0]) return numberToJid(nums[0]);
  return null;
}

/**
 * Ambil BANYAK target dari pesan (gabungan mention + reply + nomor).
 */
export function resolveTargets(m, ctx) {
  const out = new Set();
  if (m.mentionedJid?.length) m.mentionedJid.forEach((j) => out.add(decodeJid(j)));
  if (m.quoted?.sender) out.add(decodeJid(m.quoted.sender));
  const nums = (ctx.text || "").match(/\d{5,}/g) || [];
  for (const n of nums) {
    const jid = numberToJid(n);
    if (jid) out.add(jid);
  }
  return [...out];
}

/* ============ Pembungkus aksi grup ============ */
export const promote = (sock, gid, jids) =>
  sock.groupParticipantsUpdate(gid, [].concat(jids), "promote");

export const demote = (sock, gid, jids) =>
  sock.groupParticipantsUpdate(gid, [].concat(jids), "demote");

export const kick = (sock, gid, jids) =>
  sock.groupParticipantsUpdate(gid, [].concat(jids), "remove");

export const add = (sock, gid, jids) =>
  sock.groupParticipantsUpdate(gid, [].concat(jids), "add");

export default {
  numberToJid,
  resolveTarget,
  resolveTargets,
  promote,
  demote,
  kick,
  add,
};
