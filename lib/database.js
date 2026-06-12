/**
 * lib/database.js — Database JSON sederhana + auto-save + backup
 * ------------------------------------------------------------------
 * Struktur:
 *   db.data = {
 *     users:    { [jid]: { premium, premiumExp, banned, exp, ... } },
 *     groups:   { [gid]: { welcome, goodbye, antilink, antitoxic, antibot,
 *                          antiforeign, mute, ... } },
 *     store:    { [gid]: { list: { key: { text, image } } } },
 *     settings: { ...global runtime settings... },
 *     stats:    { commandCount, ... }
 *   }
 */
import fs from "fs";
import path from "path";

export default class Database {
  constructor(dir = "./database") {
    this.dir = dir;
    this.file = path.join(dir, "database.json");
    this.backupDir = path.join(dir, "backup");
    this.data = {
      users: {},
      groups: {},
      store: {},
      settings: {},
      stats: { commandCount: 0 },
    };
    this._dirty = false;
    this._ensureDirs();
    this.load();
    // tandai dirty -> simpan berkala
    this._saveTimer = setInterval(() => this._flush(), 5000);
  }

  _ensureDirs() {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
    if (!fs.existsSync(this.backupDir))
      fs.mkdirSync(this.backupDir, { recursive: true });
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        const raw = fs.readFileSync(this.file, "utf-8");
        const parsed = JSON.parse(raw || "{}");
        this.data = { ...this.data, ...parsed };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("[DB] Gagal load, memakai data kosong:", e.message);
    }
    return this.data;
  }

  /** Tandai perlu disimpan (di-flush otomatis). */
  markDirty() {
    this._dirty = true;
  }

  _flush() {
    if (this._dirty) {
      this.save();
      this._dirty = false;
    }
  }

  save() {
    try {
      fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
      return true;
    } catch (e) {
      console.error("[DB] Gagal save:", e.message);
      return false;
    }
  }

  /** Backup database ke folder backup dengan timestamp. */
  backup() {
    try {
      this.save();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const dest = path.join(this.backupDir, `database-${stamp}.json`);
      fs.copyFileSync(this.file, dest);
      // simpan maksimal 20 backup terbaru
      const files = fs
        .readdirSync(this.backupDir)
        .filter((f) => f.startsWith("database-"))
        .sort();
      while (files.length > 20) {
        const old = files.shift();
        fs.unlinkSync(path.join(this.backupDir, old));
      }
      return dest;
    } catch (e) {
      console.error("[DB] Gagal backup:", e.message);
      return null;
    }
  }

  /* ============ Helper akses ============ */
  user(jid) {
    if (!this.data.users[jid]) {
      this.data.users[jid] = {
        premium: false,
        premiumExp: 0,
        banned: false,
        exp: 0,
        registered: false,
      };
      this.markDirty();
    }
    return this.data.users[jid];
  }

  group(gid) {
    if (!this.data.groups[gid]) {
      this.data.groups[gid] = {
        welcome: false,
        goodbye: false,
        antilink: false,
        antitoxic: false,
        antibot: false,
        antiforeign: false,
        onlyadmin: false,
        mute: false,
      };
      this.markDirty();
    }
    return this.data.groups[gid];
  }

  storeOf(gid) {
    if (!this.data.store[gid]) {
      this.data.store[gid] = { list: {} };
      this.markDirty();
    }
    return this.data.store[gid];
  }

  /** Apakah user premium & belum kedaluwarsa. */
  isPremium(jid) {
    const u = this.data.users[jid];
    if (!u) return false;
    if (u.premium && (u.premiumExp === 0 || u.premiumExp > Date.now()))
      return true;
    return false;
  }
}
