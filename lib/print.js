/**
 * lib/print.js — Logging berwarna & terstruktur
 */
import chalk from "chalk";

const ts = () => new Date().toLocaleString("id-ID", { hour12: false });

export const log = {
  info: (...a) => console.log(chalk.cyan(`[INFO ${ts()}]`), ...a),
  success: (...a) => console.log(chalk.green(`[ OK  ${ts()}]`), ...a),
  warn: (...a) => console.log(chalk.yellow(`[WARN ${ts()}]`), ...a),
  error: (...a) => console.log(chalk.red(`[ERR  ${ts()}]`), ...a),
  debug: (...a) => console.log(chalk.gray(`[DBG  ${ts()}]`), ...a),
  system: (...a) => console.log(chalk.magenta(`[SYS  ${ts()}]`), ...a),
};

/**
 * Cetak ringkasan pesan masuk ke konsol.
 */
export function printMessage(m, sock) {
  try {
    const from = m.isGroup ? `${m.groupName || m.chat}` : m.pushName || m.sender;
    const txt = (m.body || m.type || "").toString().slice(0, 100);
    console.log(
      chalk.blueBright("┌─[MSG]"),
      chalk.white(ts())
    );
    console.log(
      chalk.blueBright("│"),
      chalk.yellow("from :"),
      chalk.white(from),
      m.isGroup ? chalk.gray(`(${m.pushName || m.sender})`) : ""
    );
    console.log(chalk.blueBright("│"), chalk.yellow("type :"), chalk.white(m.type));
    console.log(chalk.blueBright("└─"), chalk.greenBright(txt || "-"));
  } catch {
    /* abaikan error logging */
  }
}

export default log;
