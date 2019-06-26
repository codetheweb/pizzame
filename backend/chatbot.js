const path = require('path');
const fs = require('fs');
require('dotenv').config({path: path.join(__dirname, '../.env')});
const Discord = require('discord.js');

const discord = new Discord.Client();

discord.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./chat-commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./chat-commands/${file}`);
  discord.commands.set(command.name, command);
}

discord.login(process.env.DISCORD_TOKEN);

discord.on('ready', () => {
  console.log(`Logged in as ${discord.user.tag}!`);
});

discord.on('message', msg => {
  if (!msg.content.startsWith(process.env.DISCORD_PREFIX) || msg.author.bot) {
    return;
  }

  const args = msg.content.slice(process.env.DISCORD_PREFIX.length + 1).split(' ');
  const commandName = args.shift().toLowerCase();

  if (!discord.commands.has(commandName)) {
    return discord.commands.get('help').execute(msg, args);
  }

  const command = discord.commands.get(commandName);

  if (command.args && args.length === 0) {
    return msg.channel.send(`You didn't provide any arguments, ${msg.author}!`);
  }

  try {
    command.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
