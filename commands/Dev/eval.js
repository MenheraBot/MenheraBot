const Discord = require("discord.js");

const database = require("../../models/user.js");
const Warns = require("../../models/warn.js");

module.exports = {
  name: "eval",
  aliases: ["run", "execute"],
  cooldown: 2,
  category: "Dev",
  description: "Executa algo",
  usage: "m!eval <comando>",

  run: async (client, message, args) => {
    
    if(message.author.id !== '435228312214962204') return message.reply("Este comando é exclusivo da minha Dona");

    try {
        const code = args.join(" ");
        let evaled = eval(code);
   
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
   
        message.channel.send(clean(evaled), {code:"xl"}).catch(err => message.channel.send(`Erro no retorno do código \`\`\`js\n${err}\`\`\``))
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
}};
function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
  }
