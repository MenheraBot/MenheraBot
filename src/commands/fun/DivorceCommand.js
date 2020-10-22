const Command = require("../../structures/command")
module.exports = class DivorceCommand extends Command {
  constructor(client) {
    super(client, {
      name: "divorciar",
      aliases: ["divorce"],
      cooldown: 10,
      description: "Não quer mais ficar casado com aquele corno? Divorcie com este comando",
      category: "diversão",
      clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"]
    })
  }
  async run(message, args) {

    const user = await this.client.database.Users.findOne({ id: message.author.id })
    if (user.casado && user.casado != "false") {
      return this.divorciar(user, message)
    } else message.channel.send("<:atencao:759603958418767922> | Você não está casado com ninguém")
  }

  async divorciar(user, message) {

    const user2 = await this.client.database.Users.findOne({ id: user.casado })

    const user2Mention = this.client.users.cache.get(user.casado) || user2.nome

    message.channel.send(`Você realmente quer se divorciar de ${user2Mention}`).then(msg => {

      msg.react("✅");
      msg.react("❌");

      let filterYes = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === message.author.id;
      let filterNo = (reação, user) => reação.emoji.name === "❌" && user.id === message.author.id;

      let yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
      let noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

      noColetor.on("collect", co => {
        msg.reactions.removeAll().catch();
        message.channel.send(`<:positivo:759603958485614652> | Eu acho bom que ainda estejam casados, mas se tu pensou em terminar uma vez, talvez pense mais vezes... Se o relacionamento não te faz bem, não tem por que continuar...`);
      });

      yesColetor.on("collect", cp => {

        msg.reactions.removeAll().catch();
        message.channel.send(`${message.author} acaba de se divorciar de ${user2Mention}. Eu sinto muito por ter acabado tudo... Mas ta tudo bem, todos relacionamentos são apenas experiências, tu ainda tem muita vida pela frente, e ainda vai encontrar pessoas que te fazem tão bem quanto tu merece`);

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
