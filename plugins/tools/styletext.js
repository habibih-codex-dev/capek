/**
 * plugins/tools/styletext.js — Ubah teks ke berbagai gaya unicode (offline)
 */

/** Pemetaan generik berdasarkan offset codepoint. */
function mapBy(text, { upper, lower, digit }) {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (upper && code >= 65 && code <= 90) {
      out += String.fromCodePoint(upper + (code - 65));
    } else if (lower && code >= 97 && code <= 122) {
      out += String.fromCodePoint(lower + (code - 97));
    } else if (digit && code >= 48 && code <= 57) {
      out += String.fromCodePoint(digit + (code - 48));
    } else {
      out += ch;
    }
  }
  return out;
}

function circled(text) {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 65 && code <= 90) out += String.fromCodePoint(0x24b6 + (code - 65));
    else if (code >= 97 && code <= 122) out += String.fromCodePoint(0x24d0 + (code - 97));
    else if (code === 48) out += "⓪";
    else if (code >= 49 && code <= 57) out += String.fromCodePoint(0x2460 + (code - 49));
    else out += ch;
  }
  return out;
}

const STYLES = {
  Bold: (t) => mapBy(t, { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce }),
  Italic: (t) => mapBy(t, { upper: 0x1d608, lower: 0x1d622 }),
  Monospace: (t) => mapBy(t, { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 }),
  Fullwidth: (t) => mapBy(t, { upper: 0xff21, lower: 0xff41, digit: 0xff10 }),
  Squared: (t) => mapBy(t, { upper: 0x1f130 }),
  Circled: circled,
};

export default {
  command: ["styletext", "style", "fancytext"],
  category: "tools",
  desc: "Ubah teks ke berbagai gaya unik",
  scope: "both",

  run: async (m, ctx) => {
    const { text, prefix } = ctx;
    if (!text) return m.reply(`Contoh: *${prefix}styletext Habibih*`);

    let out = `🎀 *STYLE TEXT*\n`;
    for (const [name, fn] of Object.entries(STYLES)) {
      try {
        out += `\n*${name}*\n${fn(text)}\n`;
      } catch {
        /* lewati gaya bermasalah */
      }
    }
    await m.reply(out.trim());
  },
};
