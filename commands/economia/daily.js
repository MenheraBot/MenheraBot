const user = require("../../models/user.js");
const config = require("../../config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

const DBL = require("dblapi.js")

module.exports = {
    name: "daily",
    aliases: ["diário", "diario", "dailyroll", "dr"],
    cooldown: 60,
    category: "economia",
    description: "Pegue seu DailyRolls de caçados",
    usage: "m!daily",
    run: async (client, message, args) => {

        let usuario = await user.findOne({id: message.author.id})
		const dbl = new DBL(config.dbt, client)
		if (!usuario || usuario === null) {
			new user({
				id: message.author.id
			}).save()
        }
        
        if (parseInt(usuario.rollTime) < Date.now()) {

			let checkVote = await dbl.hasVoted(message.author.id)
			const embed = new MessageEmbed()
			.setColor("#f2baf8")
			.setAuthor("Estamos quase lá", message.author.displayAvatarURL({ format: "png", dynamic: true }))
			.setThumbnail("https://i.imgur.com/o9WQEja.png")
			.setFooter("O site tem um pouco de delay, aguarde uns 3 minutos para executar o comando novamente depois de votar")
			.addField("O que é um DR?", "Um DR (Daily Roll) é uma ficha que você pode utilizar para resetar o seu tempo de caçar! Use com sabedoria")
			.setDescription("Para receber o seu DailyRoll, você deve primeiro votar em mim [NESTE SITE](https://top.gg/bot/708014856711962654/vote), feito isso, use este comando novamente para receber seu DR")
			
			if (!checkVote) return message.channel.send(embed)

			let random = Math.floor(Math.random() * (1400 - 340 + 1)) + 340

			usuario.rolls = usuario.rolls + 1
			usuario.estrelinhas = usuario.estrelinhas + random;
			usuario.rollTime = 43200000 + Date.now()
			usuario.save()
			message.channel.send(`<:positivo:759603958485614652> | obrigada por votar em mim bebezinho >.<\nComo forma de agradecimento, você recebeu um roll e ${random} estrelinhas!\nSua carteira atualizada está assim:\n🔑 | **${usuario.rolls}** rolls\n⭐ | **${usuario.estrelinhas}** estrelinhas`);


		} else {                                                     
			message.channel.send(`<:negacao:759603958317711371> | você já resgatou seu DailyRoll! Tente novamente em **${(parseInt(usuario.rollTime - Date.now()) > 3600000) ? moment.utc(parseInt(usuario.rollTime - Date.now())).format("hh:mm:ss") : moment.utc(parseInt(usuario.rollTime - Date.now())).format("mm:ss")}**`)
		}
 }}

