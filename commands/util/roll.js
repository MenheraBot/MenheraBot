const database = require("../../models/user.js")

module.exports = {
    name: "roll",
    aliases: ["rolls", "useroll", "hr", "cr"],
    cooldown: 5,
    category: "util",
    description: "Use um DR para resetar seu tempo de caçadas",
    userPermission: null,
    clientPermission: null,
    usage: "m!roll",
    run: async (client, message, args) => {

        let user = await database.findOne({id: message.author.id});

     if (!user || user === null) {
         new database({
            id: message.author.id,
            nome: message.author.username
          }).save()
    }

    if (parseInt(user.caçarTime) < Date.now()) return message.channel.send(`<:negacao:759603958317711371> | Ei ${message.author}, você já pode caçar! Caçe antes de usar um Roll!`);

    if(user.rolls < 1) return message.channel.send(`<:negacao:759603958317711371> | Você não possui DailyRolls! Use m!daily para resgatar um DR`);

    user.rolls = user.rolls - 1;
    user.caçarTime = "000000000000"
    user.save()
    message.channel.send(`<:positivo:759603958485614652> | Prontinho, você resetou seu tempo de caçadas, pode caçar!`)
    
    }}

