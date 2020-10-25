const Command = require("../../structures/command")
module.exports = class DivorceCommand extends Command {
  constructor(client) {
    super(client, {
      name: "divorciar",
      aliases: ["divorce"],
      cooldown: 10,
      category: "diversão",
      clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"]
    })
  }
  async run({ message, args, server }, t) {

    const user = await this.client.database.Users.findOne({ id: message.author.id })
    if (user.casado && user.casado != "false") {
      return this.divorciar(user, message, t)
    } else message.menheraReply("warn", t("commands:divorce.author-single"))
  }

  async divorciar(user, message, t) {

    const user2 = await this.client.database.Users.findOne({ id: user.casado })

    const user2Mention = this.client.users.cache.get(user.casado) || user2.nome

    message.channel.send(`${t("commands:divorce.confirmation")} ${user2Mention}`).then(msg => {

      msg.react("✅");
      msg.react("❌");

      let filterYes = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === message.author.id;
      let filterNo = (reação, user) => reação.emoji.name === "❌" && user.id === message.author.id;

      let yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
      let noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

      noColetor.on("collect", co => {
        msg.reactions.removeAll().catch();
        message.menheraReply("success", t("commands:divorce.canceled"))
      });

      yesColetor.on("collect", cp => {

        msg.reactions.removeAll().catch();
        message.channel.send(`${message.author} ${t("commands:divorce.confirmed_start")} ${user2Mention}. ${t("commands:divorce.confirmed_end")}`);

        user.casado = "false"
        user.data = "null"
        user2.casado = false
        user2.data = "null"

        user.save()
        user2.save()
      });
    });
  }
}
