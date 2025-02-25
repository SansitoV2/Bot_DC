import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';


dotenv.config();

console.log("Token cargado:", process.env.DISCORD_TOKEN ? "Sí" : "No");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.content === '!ping') {
        message.reply('🏓 Pong!');
    }
});

client.login(process.env.DISCORD_TOKEN);
