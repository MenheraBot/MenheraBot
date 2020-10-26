const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class TopCommand extends Command {
    constructor(client) {
        super(client, {
            name: "top",
            aliases: ["rank"],
            cooldown: 7,
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run({ message, args, server }, t) {

        const prefix = server.prefix

        const txt = t("commands:top.txt", { prefix })

        const argumento = args[0];
        if (!argumento) return message.reply(txt)

        let argsDemonios = ["demonios", "demônios", "demons"];
        let argsAnjos = ["anjos", "angels"]
        let argsSemideuses = ["semideuses", "semi-deuses", "sd", "demigods", "dg"];
        let argsDeuses = ["deuses", "gods"]
        let argsMamou = ["mamou", "mamadores", "suckers"];
        let argsMamados = ["mamados", "chupados", "suckled"];
        let argsEstrelinhas = ["estrelinhas", "estrelinha", "stars", "star"];
        let argsVotos = ["votadores", "voto", "votes", "votos", "upvotes", "upvote", "vote"];
        let argsDungeon = ["dungeon", "rpg"]
        let argsFamilias = ["famílias", "familias", "familia", "família", "family", "families"]

        if (argsMamou.includes(argumento)) {
            this.topMamadores(this.client, message, t)
        } else if (argsMamados.includes(argumento)) {
            this.topMamados(this.client, message, t)
        } else if (argsEstrelinhas.includes(argumento)) {
            this.topEstrelinhas(this.client, message, t)
        } else if (argsDemonios.includes(argumento)) {
            this.topDemonios(this.client, message, t)
        } else if (argsAnjos.includes(argumento)) {
            this.topAnjos(this.client, message, t)
        } else if (argsSemideuses.includes(argumento)) {
            this.topSD(this.client, message, t)
        } else if (argsDeuses.includes(argumento)) {
            this.topDeuses(this.client, message, t)
        } else if (argsVotos.includes(argumento)) {
            this.topVotos(this.client, message, t)
        } else if (argsDungeon.includes(argumento)) {
            this.topDungeon(this.client, message, t)
        } else if (argsFamilias.includes(argumento)) {
            this.topFamilia(message, t)
        } else message.menheraReply("warn", t("commands:top.txt"))

    }

    async topMamados(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`👑 | ${t("commands:top.mamouTitle")}`)
            .setColor('#eab3fa')
        this.client.database.Users.find({}, ['mamadas', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                mamadas: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Mamado: **${res[i].mamadas}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Mamado: **${res[i].mamadas}**`, false)
                    }
                }
                message.channel.send(message.author, embed)
            })
    }

    async topMamadores(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`👑 |  ${t("commands:top.mamadoresTitle")}`)
            .setColor('#eab3fa')

        this.client.database.Users.find({}, ['mamou', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                mamou: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Mamou: **${res[i].mamou}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Mamou: **${res[i].mamou}**`, false)
                    }
                }
                message.channel.send(message.author, embed)
            })
    }

    async topDemonios(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`<:DEMON:758765044443381780> |  ${t("commands:top.demonTitle")}`)
            .setColor('#ec8227')

        this.client.database.Users.find({}, ['caçados', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                caçados: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Demônios: **${res[i].caçados}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Demônios: **${res[i].caçados}**`, false)
                    }
                }
                message.channel.send(message.author, embed)
            })
    }

    async topAnjos(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`<:ANGEL:758765044204437535> |  ${t("commands:top.angelTitle")}`)
            .setColor('#bdecee')

        this.client.database.Users.find({}, ['anjos', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                anjos: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Anjos: **${res[i].anjos}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Anjos: **${res[i].anjos}**`, false)
                    }
                }
                message.channel.send(message.author, embed)
            })
    }

    async topSD(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`<:SEMIGOD:758766732235374674> | ${t("commands:top.sdTitle")}`)
            .setColor('#eab3fa')

        this.client.database.Users.find({}, ['semideuses', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                semideuses: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Semideuses: **${res[i].semideuses}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Semideuses: **${res[i].semideuses}**`, false)
                    }
                }
                message.channel.send(message.author, embed)
            })
    }

    async topDeuses(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`<:God:758474639570894899> | ${t("commands:top.godTitle")}`)
            .setColor('#a67cec')

        this.client.database.Users.find({}, ['deuses', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                deuses: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Deuses: **${res[i].deuses}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Deuses: **${res[i].deuses}**`, false)
                    }
                }
                message.channel.send(message.author, embed)
            })
    }

    async topEstrelinhas(client, message, t) {

        let embed = new MessageEmbed()

            .setTitle(`⭐ | ${t("commands:top.starsTitle")}`)
            .setColor('#74bd63')

        this.client.database.Users.find({}, ['estrelinhas', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                estrelinhas: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Estrelinhas: **${res[i].estrelinhas}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Estrelinhas: **${res[i].estrelinhas}**`, false)
                    }
                }
                message.channel.send(message.author, embed)

            })
    }

    async topVotos(client, message, t) {
        let embed = new MessageEmbed()

            .setTitle(`<:ok:727975974125436959> |  ${t("commands:top.voteTitle")}`)
            .setColor('#ff29ae')

        this.client.database.Users.find({}, ['votos', 'nome', 'id'], {
            skip: 0,
            limit: 10,
            sort: {
                votos: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** ${res[i].nome}`, `Upvotes: **${res[i].votos}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Upvotes: **${res[i].votos}**`, false)
                    }
                }
                message.channel.send(message.author, embed)

            })
    }

    async topDungeon(client, message, t) {
        let embed = new MessageEmbed()

            .setTitle(`<:Chest:760957557538947133> | ${t("commands:top.rpgTitle")}`)
            .setColor('#a1f5ee')

        this.client.database.Rpg.find({}, ['level', '_id', 'xp'], {
            skip: 0,
            limit: 10,
            sort: {
                level: -1,
                xp: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                for (var i = 0; i < res.length; i++) {
                    let member = await client.shardManager.getUsers(res[i].id);
                    if (!member) {
                        embed.addField(`**${i + 1} -** \`USER NOT FOUND\``, `Level: **${res[i].level}**\nXp: **${res[i].xp}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${member.username}`, `Level: **${res[i].level}**\nXp: **${res[i].xp}**`, false)
                    }
                }
                message.channel.send(message.author, embed)

            })
    }

    async topFamilia(message, t) {
        let embed = new MessageEmbed()

            .setTitle(`🔱 | ${t("commands:top.familyTitle")}`)
            .setColor('#c780f3')

        this.client.database.Familias.find({}, ['_id', 'members', 'levelFamilia', 'bank'], {
            skip: 0,
            limit: 5,
            sort: {
                levelFamilia: -1,
                bank: -1
            }
        },
            async function (err, res) {
                if (err) console.log(err)

                res.sort((a, b) => parseInt(b.bank) - parseInt(a.bank));

                for (var i = 0; i < res.length; i++) {
                    embed.addField(`${i + 1} - ${res[i]._id}`, `:fleur_de_lis: | **Nível da Família:** ${res[i].levelFamilia}\n💎 | **Dinheiro da Família:** ${res[i].bank}\n<:God:758474639570894899> | **Membros:** ${res[i].members.length}`)
                }
                message.channel.send(message.author, embed)
            })
    }
}