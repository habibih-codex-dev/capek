/**
 * lib/serialize.js — Ubah pesan mentah Baileys menjadi objek yang rapi.
 * ------------------------------------------------------------------
 * Menyediakan field umum (chat, sender, type, body, quoted, mentions)
 * serta helper (reply, react, deleteMsg, downloadMedia).
 */
import {
  getContentType,
  downloadMediaMessage,
  jidNormalizedUser,
} from "@whiskeysockets/baileys";
import { decodeJid } from "./jid.js";

/** Ambil teks dari berbagai tipe pesan. */
function extractText(message, type) {
  if (!message) return "";
  switch (type) {
    case "conversation":
      return message.conversation || "";
    case "extendedTextMessage":
      return message.extendedTextMessage?.text || "";
    case "imageMessage":
      return message.imageMessage?.caption || "";
    case "videoMessage":
      return message.videoMessage?.caption || "";
    case "documentMessage":
      return message.documentMessage?.caption || "";
    case "buttonsResponseMessage":
      return message.buttonsResponseMessage?.selectedButtonId || "";
    case "listResponseMessage":
      return (
        message.listResponseMessage?.singleSelectReply?.selectedRowId || ""
      );
    case "templateButtonReplyMessage":
      return message.templateButtonReplyMessage?.selectedId || "";
    default:
      return "";
  }
}

export async function serialize(sock, msg, db, config) {
  const m = {};
  if (!msg.message) return msg;

  m.key = msg.key;
  m.id = msg.key.id;
  m.chat = msg.key.remoteJid;
  m.fromMe = msg.key.fromMe;
  m.isGroup = m.chat?.endsWith("@g.us");
  m.pushName = msg.pushName || "";
  m.messageTimestamp = msg.messageTimestamp;

  // Pengirim: di grup pakai participant, di pribadi pakai chat.
  const rawSender = m.isGroup
    ? msg.key.participant || msg.participant
    : msg.key.remoteJid;
  m.sender = decodeJid(rawSender);
  // simpan kemungkinan LID pengirim (jika ada) untuk pencocokan admin
  m.senderLid = msg.key.senderLid ? decodeJid(msg.key.senderLid) : null;

  m.type = getContentType(msg.message);
  m.message = msg.message;
  m.body = extractText(msg.message, m.type);

  // Mentions
  const ctx =
    msg.message?.[m.type]?.contextInfo ||
    msg.message?.extendedTextMessage?.contextInfo ||
    {};
  m.mentionedJid = (ctx.mentionedJid || []).map(decodeJid);

  // Quoted message
  if (ctx.quotedMessage) {
    const qtype = getContentType(ctx.quotedMessage);
    m.quoted = {
      type: qtype,
      message: ctx.quotedMessage,
      sender: decodeJid(ctx.participant),
      id: ctx.stanzaId,
      body: extractText(ctx.quotedMessage, qtype),
      key: {
        remoteJid: m.chat,
        fromMe: decodeJid(ctx.participant) === decodeJid(sock.user?.id),
        id: ctx.stanzaId,
        participant: decodeJid(ctx.participant),
      },
      download: async () =>
        downloadMediaMessage(
          { key: m.quoted.key, message: ctx.quotedMessage },
          "buffer",
          {},
          { reuploadRequest: sock.updateMediaMessage }
        ),
    };
  } else {
    m.quoted = null;
  }

  /* ============ Helper ============ */
  m.reply = (text, opts = {}) => {
    if (typeof text === "string") {
      return sock.sendMessage(
        m.chat,
        { text, ...opts },
        { quoted: msg, ...opts }
      );
    }
    return sock.sendMessage(m.chat, text, { quoted: msg, ...opts });
  };

  m.react = (emoji) =>
    sock.sendMessage(m.chat, { react: { text: emoji, key: msg.key } });

  m.deleteMsg = (key = msg.key) => sock.sendMessage(m.chat, { delete: key });

  m.download = async () =>
    downloadMediaMessage(
      msg,
      "buffer",
      {},
      { reuploadRequest: sock.updateMediaMessage }
    );

  return m;
}

export default serialize;
