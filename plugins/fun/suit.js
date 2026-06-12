/**
 * plugins/fun/suit.js — Suit batu-gunting-kertas lawan bot (offline)
 */
const PILIHAN = { batu: "🪨", gunting: "✂️", kertas: "📄" };
const KALAH = { batu: "gunting", gunting: "kertas", kertas: "batu" }; // key mengalahkan value

export default {
  command: ["suit"],
  category: "fun",
  desc: "Suit batu/gunting/kertas lawan bot",
  scope: "both",

  run: async (m, ctx) => {
    const { args, prefix } = ctx;
    const pilih = (args[0] || "").toLowerCase();
    if (!PILIHAN[pilih])
      return m.reply(`Pilih: *${prefix}suit batu* / *gunting* / *kertas*`);

    const keys = Object.keys(PILIHAN);
    const bot = keys[Math.floor(Math.random() * keys.length)];

    let hasil;
    if (pilih === bot) hasil = "🤝 SERI!";
    else if (KALAH[pilih] === bot) hasil = "🎉 KAMU MENANG!";
    else hasil = "😎 BOT MENANG!";

    await m.reply(
      `🎮 *SUIT*\n\nKamu: ${PILIHAN[pilih]} ${pilih}\nBot: ${PILIHAN[bot]} ${bot}\n\n${hasil}`
    );
  },
};
