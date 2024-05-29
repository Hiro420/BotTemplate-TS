// ping.js
import { CommandInteraction } from 'discord.js';

module.exports = {
    name: 'ping',
    description: 'Calculate bot ping.',
    options: [], // Command options if applicable

    async execute(interaction: CommandInteraction) {
        const sentTimestamp = interaction.createdTimestamp;
        await interaction.reply('Pinging...');
      
        const reply = await interaction.fetchReply();
        const receivedTimestamp = reply.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;
        const latency = receivedTimestamp - sentTimestamp;
      
        await interaction.editReply(`Pong!\n Bot Latency: ${latency}ms\n API Latency: ${apiLatency}ms`);
      },
};
