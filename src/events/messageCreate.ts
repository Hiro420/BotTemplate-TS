import fs from 'fs';
import {
  Client,
  Message
} from 'discord.js';
import { prefix } from '../../config.json';

interface Command {
  name: string;
  aliases ? : string[];
  run: (client: Client, message: Message, args: string[]) => void;
}

module.exports = (client: Client < boolean > & {
  commands: Map < string,
  Command >
}, message: Message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  // Find the command based on the command name or alias
  const command = client.commands.get(commandName) || [...client.commands.values()].find((cmd) => cmd.aliases &&
  cmd.aliases.includes(commandName));

  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (error) {
    console.error(error);
    message.reply('Oops, there was an error trying to execute that command!');
  }
};
