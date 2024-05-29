import { EmbedBuilder, Client, Message } from "discord.js";

exports.run = async (client: Client, message: Message, args: string[]) => {
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription('Calculating bot latency...')
      .setColor('Purple');
    message.channel.send({ embeds: [embed] }).then((sentMessage: Message) => {
      const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
      const apiLatency = message.client.ws.ping;
      embed.setDescription(`Bot latency is **${botLatency}ms**. API latency is **${apiLatency}ms**.`);
      sentMessage.edit({ embeds: [embed] });
    }).catch(console.error);
}