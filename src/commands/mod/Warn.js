const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class WarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: "warn",
            cooldown: 5,
            userPermissions: ["KICK_MEMBERS"],
            clientPermissions: ["EMBED_LINKS"],
            category: "moderação"
        })
    }
    async run({ message, args, server }, t) {

        if (!args[0]) return message.menheraReply("error", t("commands:warn.no-mention"))

        let user;
        try {
            user = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ""))
        } catch {
            return message.menheraReply("error", t("commands:warn.no-mention"))
        }

        if (!user) return message.menheraReply("error", t("commands:warn.no-mention"))
        if (user.bot) return message.menheraReply("error", t("commands:warn.bot"))
        if (user.id === message.author.id) return message.menheraReply("error", t("commands:warn.self-mention"))

        if (!message.guild.members.cache.get(user.id)) returnmessage.menheraReply("error", t("commands:warn.invalid-member"))

        let reason = args.slice(1).join(" ");
        if (!reason) reason = t("commands:warn.default_reason");

        var data1 = new Date();

        var dia = data1.getDate();
        var mes = data1.getMonth();
        var ano4 = data1.getFullYear();
        var hora = data1.getHours();
        var min = data1.getMinutes();
        var seg = data1.getSeconds();
        var str_data = dia + '/' + (mes + 1) + '/' + ano4;
        var str_hora = hora + ':' + min + ':' + seg;
        var data = str_data + ' às ' + str_hora;

        var list = [
            "https://i.imgur.com/GWFaksV.jpg",
            "https://i.imgur.com/RWcPEZp.jpg",
            "https://i.imgur.com/HQA1w2P.jpg",
            "https://i.imgur.com/ockkEoX.jpg",
            "https://i.imgur.com/YW2cuG2.jpg",
            "https://i.imgur.com/QX0IU4B.png",
            "https://i.imgur.com/B6d7BHd.jpg",
            "https://i.imgur.com/MFcF93z.jpg",
            "https://i.imgur.com/IJomzjE.jpg",
            "https://i.imgur.com/SsBmqcN.jpg",
            "https://i.imgur.com/i3EW4He.png",
            "https://i.imgur.com/lJt5lYS.png",
            "https://i.imgur.com/X0BTT0I.png",
            "https://i.imgur.com/vebRVyD.png"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];

        const embed = new MessageEmbed()
            .setTitle(t("commands:warn.embed_title"))
            .setDescription(`${message.author} ${t("commands:embed_description")} ${user}`)
            .setImage(rand)

        this.client.database.Warns.findOne({
            id: user.id,
            guildId: message.guild.id
        }, (err, db) => {
            if (err) console.log(err);

            const addUser = new this.client.database.Warns({
                userId: user.id,
                warnerId: message.author.id,
                guildId: message.guild.id,
                reason,
                data
            });
            addUser.save().then(message.channel.send(embed)).catch(err => console.log(err))
        })
    }
}