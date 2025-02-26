import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import mcUtil from 'minecraft-server-util';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const SERVER_IP = 'joseandocraft.ddns.net';  // IP del servidor de Minecraft
const SERVER_PORT = 25565;  // Puerto del servidor
const CHANNEL_ID = '1293938607282720819';  // ID del canal donde se enviará el embed

let lastMessage = null;
let lastPlayers = new Set(); // Guardamos los jugadores anteriores

async function checkMinecraftServer() {
    try {
        const status = await mcUtil.status(SERVER_IP, SERVER_PORT);
        const playersOnline = status.players.online;
        const maxPlayers = status.players.max;
        const motd = status.motd.clean || 'Sin descripción';
        const version = status.version.name || 'Desconocida';
        
        const currentPlayers = new Set(status.players.sample ? status.players.sample.map(p => p.name) : []);
        const joinedPlayers = [...currentPlayers].filter(p => !lastPlayers.has(p));
        const leftPlayers = [...lastPlayers].filter(p => !currentPlayers.has(p));
        lastPlayers = currentPlayers; // Actualizamos los jugadores previos

        const playersText = currentPlayers.size > 0 ? [...currentPlayers].join(', ') : 'Ninguno';
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00') // Verde si está online
            .setTitle('🌍 JoseandoCraft 🌍')
            .setDescription(`**Estado del servidor en tiempo real**\n${motd}`)
            .addFields(
                { name: '🖥️ Dirección IP', value: `\`${SERVER_IP}:${SERVER_PORT}\``, inline: true },
                { name: '👥 Jugadores', value: `${playersOnline}/${maxPlayers}`, inline: true },
                { name: '🎮 Versión', value: version, inline: true },
                { name: '📝 Lista de jugadores', value: playersText }
            )
            .setFooter({ text: '📡 Actualizado cada minuto' })
            .setTimestamp();

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel && channel instanceof TextChannel) {
            if (lastMessage) {
                await lastMessage.edit({ embeds: [embed] });
            } else {
                lastMessage = await channel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error al obtener el estado del servidor:', error);
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel && channel instanceof TextChannel) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000') // Rojo si está caído
                .setTitle('❌ Servidor OFFLINE')
                .setDescription(`El servidor de Minecraft no responde.`)
                .setFooter({ text: '🚨 Se actualizará automáticamente' })
                .setTimestamp();
            
            if (lastMessage) {
                await lastMessage.edit({ embeds: [embed] });
            } else {
                lastMessage = await channel.send({ embeds: [embed] });
            }
        }
    }
}

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    checkMinecraftServer();
    setInterval(checkMinecraftServer, 60000); // Actualiza cada 60 segundos
});

client.login(process.env.DISCORD_TOKEN);
