const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const moment = require("moment")
module.exports = class HuntCommand extends Command {
    constructor(client) {
        super(client, {
            name: "caçar",
            aliases: ["cacar", "caça", "caca", "hunt"],
            category: "diversão",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run({ message, args, server }, t) {

        let user = await this.client.database.Users.findOne({ id: message.author.id });

        const validOptions = ["demonios", "anjos", "semideuses", "deuses", "ajuda", "probabilidades"];

        const validArgs = [{
            opção: "demônio",
            arguments: ["demonios", "demônios", "demons", "demonio", "demônio"]
        },
        {
            opção: "anjos",
            arguments: ["anjos", "anjo", "angels"]
        },
        {
            opção: "semideuses",
            arguments: ["semideuses", "semideus", "semi-deuses", "sd", "semi-deus"]
        },
        {
            opção: "deus",
            arguments: ["deus", "deuses", "gods", "god"]
        },
        {
            opção: "ajuda",
            arguments: ["ajudas", "help", "h", "ajuda"]
        },
        {
            opção: "probabilidades",
            arguments: ["probabilidades", "probabilidade", "probability", "probabilities"]
        }
        ];


        if (!args[0]) return message.menheraReply("error", `${t("commands:hunt.no-args")} \`${validOptions.join("`, `")}\``)
        const selectedOption = validArgs.some(so => so.arguments.includes(args[0].toLowerCase()))
        if (!selectedOption) return message.menheraReply("error", `${t("commands:hunt.no-args")} \`${validOptions.join("`, `")}\``)
        const filtredOption = validArgs.filter(f => f.arguments.includes(args[0].toLowerCase()))

        const option = filtredOption[0].opção

        if (!option) return message.menheraReply("error", `${t("commands:hunt.no-args")} \`${validOptions.join("`, `")}\``)

        //probabilidades normais
        const probabilidadeDemonioBasica = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4];
        const probabilidadeAnjoBasica = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2];
        const probabilidadeSDBasica = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const probabilidadeDeusesBasica = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        //probabilidades do servidor de suporte
        const probabilidadeDemonioServer = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4];
        const probabilidadeAnjoServer = [0, 0, 0, 1, 1, 1, 1, 2];
        const probabilidadeSDServer = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const probabilidadeDeusesServer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

        let probabilidadeDemonio;
        let probabilidadeAnjo;
        let probabilidadeSD;
        let probabilidadeDeuses;

        if (message.guild.id === '717061688460967988') {
            probabilidadeDemonio = probabilidadeDemonioServer;
            probabilidadeAnjo = probabilidadeAnjoServer;
            probabilidadeSD = probabilidadeSDServer;
            probabilidadeDeuses = probabilidadeDeusesServer;
        } else {
            probabilidadeDemonio = probabilidadeDemonioBasica;
            probabilidadeAnjo = probabilidadeAnjoBasica;
            probabilidadeSD = probabilidadeSDBasica;
            probabilidadeDeuses = probabilidadeDeusesBasica;
        }


        if (option === "ajuda") return message.menheraReply("question", t("commands:hunt.help"))
        if (option === "probabilidades") return message.channel.send(t("commands:hunt.probabilities", {probabilidadeDemonio, probabilidadeAnjo, probabilidadeSD, probabilidadeDeuses}))

        if (parseInt(user.caçarTime) < Date.now()) {
            let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
            let embed = new MessageEmbed()
                .setTitle(t("commands:hunt.title"))
                .setColor("#faa40f")
                .setThumbnail(avatar)
                .setFooter(t("commands:hunt.footer"))

            switch (option) {
                case 'demônio':
                    const dc = probabilidadeDemonio[Math.floor(Math.random() * probabilidadeDemonio.length)];
                    user.caçados = user.caçados + dc;
                    user.caçarTime = 3600000 + Date.now();
                    user.save()
                    embed.setDescription(`${t("commands:hunt.description_start", {value: dc})} ${t("commands:hunt.demons")}`)
                    message.channel.send(embed)
                    break;
                case 'anjos':
                    const da = probabilidadeAnjo[Math.floor(Math.random() * probabilidadeAnjo.length)];
                    user.anjos = user.anjos + da;
                    user.caçarTime = 3600000 + Date.now();
                    user.save()
                    embed.setDescription(`${t("commands:hunt.description_start", {value: da})} ${t("commands:hunt.angels")}`)
                    message.channel.send(embed)
                    break;
                case 'semideuses':
                    const ds = probabilidadeSD[Math.floor(Math.random() * probabilidadeSD.length)];
                    user.semideuses = user.semideuses + ds;
                    user.caçarTime = 3600000 + Date.now();
                    user.save()
                    embed.setDescription(`${t("commands:hunt.description_start", {value: ds})} ${t("commands:hunt.sd")}`)
                    message.channel.send(embed)
                    break;
                case 'deus':
                    const dd = probabilidadeDeuses[Math.floor(Math.random() * probabilidadeDeuses.length)];
                    user.deuses = user.deuses + dd;
                    user.caçarTime = 3600000 + Date.now();
                    user.save()
                    if (dd > 0) embed.setColor('#e800ff')
                    embed.setDescription((dd > 0) ? t("commands:hunt.god_hunted_success", {value: dd}) : t("commands:hunt.god_hunted_fail", {value: dd}))
                    message.channel.send(embed)
                    break;
            }
        } else {
            message.menheraReply("error", t("commands:hunt.cooldown", {time: moment.utc(parseInt(user.caçarTime - Date.now())).format("mm:ss")}))
        }
    }
}