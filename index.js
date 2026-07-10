const express = require("express");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_NUMBER = process.env.OWNER_NUMBER || "+255674688818";
const MODE = process.env.MODE || "qr"; // chaguo: "qr" au "number"

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: MODE === "qr", // QR itaonekana tu kama mode ni "qr"
  });

  sock.ev.on("creds.update", saveCreds);

  if (MODE === "number") {
    console.log(`🤖 Bot imeanzishwa kwa namba: ${OWNER_NUMBER}`);
    await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, { text: "✅ HANS TECHY bot imeanza kwa mode ya namba moja kwa moja!" });
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (text === "!ping") {
      await sock.sendMessage(from, { text: "🏓 Pong! Bot HANS TECHY iko live." });
    }
  });
}

app.get("/", (req, res) => res.send("✅ HANS TECHY bot is running!"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startBot();
