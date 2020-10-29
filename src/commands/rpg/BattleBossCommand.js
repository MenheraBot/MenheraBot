const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")

module.exports = class BattleBoss extends Command {
    constructor(client) {
        super(client, {
            name: "boss",
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg"
        })
    }
    async run({ message, args, server }, t) {

        const user = await this.client.database.Rpg.findById(message.author.id)
        if (!user) return message.menheraReply("error", t("commands:boss.non-aventure"))

        if (user.level < 20) return message.menheraReply("error", t("commands:boss.min-level"))

        const inimigo = await this.client.rpgChecks.getEnemy(user, "boss")
        const canGo = await this.client.rpgChecks.initialChecks(user, message, t)

        if (!canGo) return;

        let familia
        let dmgView = user.damage + user.weapon.damage
        let ptcView = user.armor + user.protection.armor

        if (user.hasFamily) {
            familia = await this.client.database.Familias.findById(user.familyName)
            if (user.familyName === "Loki") dmgView = user.damage + user.weapon.damage + familia.boost.value
            if (user.familyName === "Ares") ptcView = user.armor + user.protection.armor + familia.boost.value
        }

        const habilidades = await this.client.rpgChecks.getAbilities(user, familia)

        if (user.uniquePower.name == "Morte Instantânea") {
            habilidades.splice(habilidades.findIndex(function (i) {
                return i.name === "Morte Instantânea"
            }), 1);
        }

        let embed = new MessageEmbed()
            .setTitle(`⌛ | ${t("commands:boss.preparation.title")}`)
            .setDescription(t("commands:boss.preparation.description"))
            .setColor('#e3beff')
            .setFooter(t("commands:boss.preparation.footer"))
            .addField(t("commands:boss.preparation.stats"), `🩸 | **${t("commands:boss.life")}:** ${user.life}/${user.maxLife}\n💧 | **${t("commands:boss.mana")}:** ${user.mana}/${user.maxMana}\n🗡️ | **${t("commands:boss.dmg")}:** ${dmgView}\n🛡️ | **${t("commands:boss.armor")}:** ${ptcView}\n🔮 | **${t("commands:boss.ap")}:** ${user.abilityPower}\n\n${t("commands:boss.preparation.description_end")}`)
        habilidades.forEach(hab => {
            embed.addField(hab.name, `🔮 | **${t("commands:boss.damage")}:** ${hab.damage}\n💧 | **${t("commands:boss.cost")}** ${hab.cost}`)
        })
        message.channel.send(embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        collector.on('collect', m => {
            if (m.content.toLowerCase() == "sim" || m.content.toLowerCase() == "yes") {
                this.battle(message, inimigo, habilidades, user, "boss", familia, t);
            } else return message.menheraReply("error", t("commands:boss.amarelou"))

        })
    }

    async battle(message, inimigo, habilidades, user, type, familia, t) {

        user.dungeonCooldown = 3600000 + Date.now();
        user.inBattle = true;
        user.save()

        let options = [];

        if (user.hasFamily && user.familyName === "Loki") {

            options.push({
                name: t("commands:boss.battle.basic"),
                damage: user.damage + user.weapon.damage + familia.boost.value
            })
        } else {
            options.push({
                name: t("commands:boss.battle.basic"),
                damage: user.damage + user.weapon.damage
            })
        }

        habilidades.forEach(hab => {
            options.push(hab)
        })

        let texto = `${t("commands:boss.battle.enter", { enemy: inimigo.name })}\n\n❤️ | ${t("commands:boss.life")}: **${inimigo.life}**\n⚔️ | ${t("commands:boss.damage")}: **${inimigo.damage}**\n🛡️ | ${t("commands:boss.armor")}: **${inimigo.armor}**\n\n${t("commands:boss.battle.end")}`

        let escolhas = []

        for (var i = 0; i < options.length; i++) {
            texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`
            escolhas.push(i + 1);
        }

        let embed = new MessageEmbed()
            .setFooter(t("commands:boss.battle.footer"))
            .setTitle("BossBattle: " + inimigo.name)
            .setColor('#f04682')
            .setDescription(texto)
        message.channel.send(message.author, embed)


        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

        let time = false;

        collector.on('collect', m => {
            time = true;
            const choice = Number(m.content);
            if (escolhas.includes(choice)) {
                this.client.rpgChecks.battle(message, options[choice - 1], user, inimigo, type, familia, t)
            } else {
                this.client.rpgChecks.enemyShot(message, `⚔️ |  ${t("commands:boss.battle.newTecnique")}`, user, inimigo, type, familia, t)
            }
        })

        setTimeout(() => {
            if (!time) {
                this.client.rpgChecks.enemyShot(message, `⚔️ |  ${t("commands:boss.battle.timeout")}`, user, inimigo, type, familia, t)
            }
        }, 15000)
    }
}
