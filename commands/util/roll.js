const database = require("../../models/user.js")

module.exports = {
    name: "roll",
    aliases: ["rolls", "useroll", "hr", "cr"],
    cooldown: 2,
    category: "util",
    description: "Use um DR para resetar seu tempo de caçadas",
    usage: "m!roll",
    run: async (client, message, args) => {

        let user = await database.findOne({id: message.author.id});

     if (!user || user === null) {
         new database({
            id: message.author.id,
            nome: message.author.username
          }).save()
    }

    if (parseInt(user.caçarTime) < Date.now()) return message.channel.send(`❌ | Ei ${message.author}, você já pode caçar! Caçe antes de usar um Roll!`);

    if(user.rolls < 1) return message.channel.send(`❌ | Você não possui DailyRolls! Use m!daily para resgatar um DR`);

    user.rolls = user.rolls - 1;
    user.caçarTime = "000000000000"
    user.save()
    message.channel.send(`✅ | Prontinho, você resetou seu tempo de caçadas, pode caçar!`)
    
    }}

