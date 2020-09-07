const Discord = require("discord.js");
const client = new Discord.Client({fetchAllMembers: true, disableEveryone: true});
const config = require("./config.json");
const fs = require("fs-extra");
const DBL = require("dblapi.js");
const dbl = new DBL(config.dbt, client);
const database = require("./models/user");
const mongoose = require("mongoose");
mongoose.connect(config.uri, {useNewUrlParser: true, useUnifiedTopology: true }).catch(error => console.error(error));

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = fs.readdirSync("./commands/");

const cooldown = new Set();

["command"].forEach(handler => {
  require(`./handler/${handler}`)(client);
})

//pequenos eventos
client.on("guildDelete", server => client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${server}**`));
client.on("guildCreate", server => client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:apaixonada:727975782034440252> | Fui adicionada ao servidor **${server}**`));
process.on('unhandledRejection', error =>	console.error('Unhandled promise rejection:', error));
process.on('warning', e => console.warn(e.stack));

//ready event
client.on("ready", () => {

  let status = [
    {name: "a moon ser perfeita", type: "WATCHING"},
    {name: "o meu servidor de suporte m!suporte", type: "LISTENING", url: "https://discord.gg/fZMdQbA"},
    {name: "sabia que a moon é a salvação da minha dona? sem moon, menhera = inexistente m!moon", type: " PLAYING"},
    {name: "a vida é dificil, mas estamos aqui pra facilitá-la", type: "PLAYING"}
    ];

  setInterval(() => {
    let randomStatus = status[Math.floor(Math.random() * status.length)]
    client.user.setPresence({ activity: randomStatus })
  }, 1000 * 60);

});

//message event
client.on("message", async message => {

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

	if (message.mentions.users.size >= 0) {
    message.mentions.users.forEach(async (member) => {
      if (!member) return
      const usuario = await database.findOne({id: member.id})
      if (usuario) {
        if (usuario.afk === true) {
          message.reply(`\`${member.tag}\` está AFK: ${usuario.afkReason}`)
        }
      }
    })
  }
  let user = await database.findOne({id: message.author.id})
if(user){
    if (user.afk == true) {
      user.afk = false
      user.afkReason = null
      user.save()
      message.channel.send(`Bem vindo de volta ${message.author} >.<`).then(msg => msg.delete({timeout: 5000})).catch()
    }
  }
  if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return message.channel.send(`Oizinho, meu prefixo é '${config.prefix}'`);
  if (!message.content.startsWith(config.prefix)) return;
  if (!message.member) message.member = await message.guild.fetch(message);

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  
  if(cmd.length === 0) return;

  let command = client.commands.get(cmd);
  if(!command) command = client.commands.get(client.aliases.get(cmd));
  if(!command) return;

  if (user.ban) {
    let avatar
    if (!message.author.avatar.startsWith("a_")) {
      if (!message.author.avatar) {
        avatar = message.author.displayAvatarURL()
      } else {
        avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=2048`
      }
    } else {
      if (!message.author.avatar) {
        avatar = message.author.displayAvatarURL()
      } else {
        avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.gif?size=2048`
      }
    }
    let owner = await client.users.fetch("435228312214962204")

    const embed = new Discord.MessageEmbed()
      .setColor('#c1001d')
      .setAuthor("Você foi banido", avatar)
      .setDescription(`Olá ${message.author}, você foi banido de usar a Menhera`)
      .addField("Motivo", user.banReason)
      .addField("Banido injustamente?", `Se você acha que foi banido injustamente, então entre em contato com a ${owner.tag} ou entre no meu servidor de suporte.`)

    message.channel.send(embed).catch(() => {
      message.author.send(embed)
    })
    return
  }

  if(command){  
    if (!user) {
      new database({
        id: message.author.id,
        nome: message.author.username,
        shipValue: Math.floor(Math.random() * 55)
      }).save()
    }
    if (cooldown.has(message.author.id)) {
      message.delete().catch()
      return message.reply("você está utilizando comandos rápido demais! Fica frio").then(msg => msg.delete({timeout: 3500})).catch();
    }
    
    if(message.author.id != '435228312214962204') cooldown.add(message.author.id);
     command.run(client, message, args).catch(err => {
       console.log(err);
       message.reply("Ocorreu um erro na execução desse comando... Bugs e mais bugs...")
     });
     console.log(`Comando: '${command.name}'. Autor: '${message.author.tag}' id: '${message.author.id}' | Servidor: '${message.guild.name}' ServerId: '${message.guild.id}'`);
  }
  
  setTimeout(() => {
    if(message.author.id != '435228312214962204') cooldown.delete(message.author.id)
  }, 2000)

});   //fim do message

//mudar para config.token para logar na menhrea
//testToken = DevBot

client.login(config.testToken);
