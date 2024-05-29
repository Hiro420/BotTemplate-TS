import Discord from 'discord.js';

module.exports = (client: Discord.Client) => {
    if (client.user) {
        console.log(`Ready as ${client.user.tag} to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);
    } else {
        throw new Error('Client user is null.');
    }
};
