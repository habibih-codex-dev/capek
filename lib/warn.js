/**
 * lib/warn.js — Helper sistem peringatan (warn) per grup
 * ------------------------------------------------------------------
 * Disimpan di db.data.groups[gid].warns = { [jid]: jumlah }
 * Batas warn: db.data.groups[gid].warnLimit (default 3).
 */
import { decodeJid } from "./jid.js";

export function getLimit(db, gid) {
  const g = db.group(gid);
  return g.warnLimit || 3;
}

export function setLimit(db, gid, limit) {
  const g = db.group(gid);
  g.warnLimit = Math.max(1, parseInt(limit) || 3);
  db.markDirty();
  return g.warnLimit;
}

export function getWarn(db, gid, jid) {
  const g = db.group(gid);
  return g.warns?.[decodeJid(jid)] || 0;
}

/** Tambah 1 warn, kembalikan { count, limit }. */
export function addWarn(db, gid, jid) {
  const g = db.group(gid);
  const key = decodeJid(jid);
  if (!g.warns) g.warns = {};
  g.warns[key] = (g.warns[key] || 0) + 1;
  db.markDirty();
  return { count: g.warns[key], limit: g.warnLimit || 3 };
}

/** Kurangi 1 warn (minimal 0). */
export function removeWarn(db, gid, jid) {
  const g = db.group(gid);
  const key = decodeJid(jid);
  if (!g.warns) g.warns = {};
  g.warns[key] = Math.max(0, (g.warns[key] || 0) - 1);
  if (g.warns[key] === 0) delete g.warns[key];
  db.markDirty();
  return { count: g.warns[key] || 0, limit: g.warnLimit || 3 };
}

/** Reset warn seseorang menjadi 0. */
export function resetWarn(db, gid, jid) {
  const g = db.group(gid);
  const key = decodeJid(jid);
  if (g.warns && g.warns[key] !== undefined) {
    delete g.warns[key];
    db.markDirty();
  }
  return 0;
}

/** Daftar warn aktif: [{ jid, count }] */
export function listWarn(db, gid) {
  const g = db.group(gid);
  return Object.entries(g.warns || {}).map(([jid, count]) => ({ jid, count }));
}

export default {
  getLimit,
  setLimit,
  getWarn,
  addWarn,
  removeWarn,
  resetWarn,
  listWarn,
};
