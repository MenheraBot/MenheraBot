const Discord = require("discord.js");
const client = new Discord.Client({fetchAllMembers: true, disableEveryone: true});
const config = require("./config.json");
const fs = require("fs-extra");

const DBL = require("dblapi.js");
const dbl = new DBL(config.dbt, client);

const mongoose = require("mongoose");
mongoose.connect(config.uri, {useNewUrlParser: true, useUnifiedTopology: true }).catch(error => console.error(error));


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = fs.readdirSync("./commands/");

//client.cooldowns = new Discord.Collection();

["command"].forEach(handler => {
  require(`./handler/${handler}`)(client);
})

client.on("message", async message => {

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return message.channel.send(`Oizinho, meu prefixo é '${config.prefix}'`);
  if (!message.content.startsWith(config.prefix)) return;
  if (!message.member) message.member = await message.guild.fetch(message);

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  
  if(cmd.length === 0) return;

  let command = client.commands.get(cmd);
  if(!command) command = client.commands.get(client.aliases.get(cmd));

  /* const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

	if (now < expirationTime) {
		const timeLeft = (expirationTime - now) / 1000;
		return message.reply(`por favor, espere ${timeLeft.toFixed(1)} segundos antes de usar o comando \`${command.name}\``).then(m => {
      if(m.deletable) m.delete({timeout: 3000})
      if(message.deletable) message.delete({timeout: 3000})
    });
  }}
  
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  */
  if(command){
     command.run(client, message, args).catch(err => {
       console.log(err);
       message.reply("Ocorreu um erro na execução desse comando... Bugs e mais bugs...")
     });
  }
  
});

client.on("guildDelete", server => {
  console.log(`Bot removido do servidor "${server}"`)
  client.users.cache.get('435228312214962204').send(`Bot removido do servidor **${server}**`);
  client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`Bot removido do servidor **${server}**`);
});

client.on("guildCreate", server => {
  console.log(`Bot adicionado ao servidor ${server}`)
  client.users.cache.get('435228312214962204').send(`Bot adicionado ao servidor ${server}`);
  client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`Bot adicionado ao servidor **${server}**`);
});

client.on("ready", () => {

  let activities = [
      "Eu preciso de permissões para mandar mensagens no canal que você executa meu comando",
      "Oizinho, sou a Menhera, meu prefixo é m!",
      "Para obter ajuda, use m!ajdua",
      "Vote em mim para me ajudar a crescer 'm!votar'"
    ],
    i = 0;

  setInterval(() => {
    client.user.setActivity(`${activities[i++ % activities.length]}`, {
      type: "WATCHING"
    });
  }, 1000 * 60);

});

process.on('unhandledRejection', error =>	console.error('Unhandled promise rejection:', error));
process.on('warning', e => console.warn(e.stack));



client.login(config.token);
