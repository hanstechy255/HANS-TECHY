const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const config = require("./config");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text && text.startsWith(config.prefix)) {
            const command = text.slice(1).trim().toLowerCase();

            // 🔒 Private Mode: ni owner pekee anaweza kutumia
            if (config.mode === "private" && from !== config.ownerNumber + "@s.whatsapp.net") {
                await sock.sendMessage(from, { text: "⚠️ Samahani, bot iko PRIVATE mode. Ni Hans pekee anaweza kutumia." });
                return;
            }

            // 🔓 Public Mode: mtu yeyote anaweza kutumia
            if (command === "ping") {
                await sock.sendMessage(from, { text: "🏓 Pong! Bot HANS TECHY iko live." });
            }

            if (command === "help") {
                await sock.sendMessage(from, { text: `🤖 ${config.botName} Commands:\n!ping - Test bot\n!help - List commands\n!mode public/private - Badilisha mode` });
            }

            // 👨‍💻 Owner anaweza kubadilisha mode
            if (command.startsWith("mode")) {
                if (from === config.ownerNumber + "@s.whatsapp.net") {
                    const newMode = command.split(" ")[1];
                    if (newMode === "public" || newMode === "private") {
                        config.mode = newMode;
                        await sock.sendMessage(from, { text: `✅ Mode imebadilishwa kuwa: ${newMode.toUpperCase()}` });
                    } else {
                        await sock.sendMessage(from, { text: "⚠️ Tumia: !mode public au !mode private" });
                    }
                } else {
                    await sock.sendMessage(from, { text: "⚠️ Ni Hans pekee anaweza kubadilisha mode." });
                }
            }
        }
    });
}

startBot();
