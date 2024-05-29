import {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    Interaction,
    Events,
    GuildMember
} from 'discord.js';
import {
    token,
    clientId
} from '../config.json';
const fs = require('node:fs');
const path = require('node:path');
const {
    REST
} = require("@discordjs/rest");
const {
    Routes
} = require("discord-api-types/v10");
const {
    SlashCommandOption
} = require("discord.js");

let intents: number[] = [];

for (const intent of Object.keys(GatewayIntentBits) as(keyof typeof GatewayIntentBits)[]) {
    const intentValue = GatewayIntentBits[intent];
    intents.push(intentValue);
}

const client: any = new Client({
    intents: intents,
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

/* Load all events */
fs.readdir("./src/events/", (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) return console.error(err);
    files.forEach((file: string) => {
        if (!file.endsWith(".ts")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        console.log(`👌 Event loaded: ${eventName}`);
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});


// Function to register slash commands
async function registerSlashCommands(clientId: string, token: string) {
    try {
        const rest = new REST({
            version: "9"
        }).setToken(token);

        const slashCommands: {
            name: string;description: string;options: typeof SlashCommandOption[]
        } [] = [];

        // Load slash commands
        fs.readdirSync("./src/slash-commands").forEach((file: string) => {
            if (!file.endsWith(".ts")) return;
            
            const props = require(`./slash-commands/${file}`);
            const commandName = file.split(".")[0];

            // Create a new slash command object and add it to the slashCommands array
            const slashCommand: {
                name: string;
                description: string;
                options: typeof SlashCommandOption[]; // Assuming options is an array
            } = {
                name: commandName,
                description: props.description,
                options: props.options || [], // Include options if applicable
            };
            slashCommands.push(slashCommand);
        });

        // Register the slash commands globally or in a specific guild
        await rest.put(
            Routes.applicationCommands(clientId),
            // Routes.applicationGuildCommands(clientId, guildId), // Use this line for guild-specific commands
            {
                body: slashCommands
            }
        );

        //console.log('👌 Slash commands loaded:');
        //console.log(slashCommands.map(command => command.name));
    } catch (error) {
        console.error("Failed to register slash commands:", error);
    }
}

// Load regular commands
const regularCommandFiles = fs
    .readdirSync("./src/commands")
    .filter((file: string) => file.endsWith(".ts"));
const slashCommandFiles = fs
    .readdirSync("./src/slash-commands")
    .filter((file: string) => file.endsWith(".ts"));

client.commands = new Collection();
client.slashCommands = new Collection();

// Load regular commands
for (const file of regularCommandFiles) {
    const filePath = path.join(__dirname, 'commands', file);
    const command = require(filePath);
    const commandName = file.split('.')[0];
    client.commands.set(commandName, command);
}

console.log("👌 Regular commands loaded:");
console.log([...client.commands.keys()]); // Display only the regular command names

// Load slash commands
for (const file of regularCommandFiles) {
    const filePath = path.join(__dirname, 'slash-commands', file);
    const command = require(filePath);
    const commandName = file.split('.')[0];
    client.slashCommands.set(commandName, command);
}

console.log("👌 Slash commands loaded:");
console.log([...client.slashCommands.keys()]); // Display only the slash command names

// Event handler for slash command interactions
client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply("There was an error while executing this command.");
    }
});

// Register slash commands after loading regular commands
registerSlashCommands(clientId, token);

client.login(token);

client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    await member.guild.members.fetch(member).then((fetchedMember: GuildMember) => {
        //console.log(`Cached ${fetchedMember.user.tag} with id ${fetchedMember.id}`);
    })
    .catch(console.error);
});