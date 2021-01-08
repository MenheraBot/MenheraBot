const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class WarnListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'warnlist',
      alisases: ['warns', 'punishmentlist', 'avisos'],
      cooldown: 5,
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'moderação',
    });
  }

  async run({ message, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:warnlist.no-mention'));

    let user;
    try {
      user = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
    } catch {
      return message.menheraReply('error', t('commands:warnlist.no-mention'));
    }

    if (!user) return message.menheraReply('error', t('commands:warnlist.no-mention'));
    if (user.bot) return message.menheraReply('error', t('commands:warnlist.bot'));
    if (!message.guild.members.cache.get(user.id)) return message.menheraReply('error', t('commands:warnlist.invalid-member'));

    // listas

    const noWarn = [
      'https://i.imgur.com/pwMKAPd.png',
      'https://i.imgur.com/d8cgWvS.png',
      'https://i.imgur.com/aVXTWSA.jpg',
      'https://i.imgur.com/bUuehyU.jpg',
      'https://i.imgur.com/4FfgL7h.png',
    ];

    const warned = [
      'https://i.imgur.com/vS46DHp.png',
      'https://i.imgur.com/ziNWVxo.jpg',
      'https://i.imgur.com/ZVQh20v.jpg',
      'https://i.imgur.com/oPTIn2Z.jpg',
      'https://i.imgur.com/2kxswoS.png',
      'https://i.imgur.com/FEEjyY3.png',
    ];

    let rand;

    const embed = new MessageEmbed()
      .setTitle(t('commands:warnlist.embed_title', { user: user.tag }));

    this.client.database.Warns.find({
      userId: user.id,
      guildId: message.guild.id,
    }).sort([
      ['data', 'ascending'],
    ]).exec((err, db) => {
      if (err) console.log(err);

      if (!db || db.length < 1) {
        embed.setDescription(`${user} ${t('commands:warnlist.no_warns')}`);
        rand = noWarn[Math.floor(Math.random() * noWarn.length)];
      } else {
        rand = warned[Math.floor(Math.random() * warned.length)];
      }

      for (let i = 0; i < db.length; i++) {
        if (embed.fields.length === 24) break;
        const warner = this.client.users.fetch(db[i].warnerId);
        embed.addField(`${t('commands:warnlist.warn')} #${i + 1}`, `**${t('commands:warnlist.Warned_by')}** ${warner || '404'}\n**${t('commands:warnlist.Reason')}** ${db[i].reason}\n**${t('commands:warnlist.Data')}** ${db[i].data}\n**${t('commands:warnlist.WarnID')}** \`${db[i]._id}\``);
      }

      embed.setImage(rand);
      message.channel.send(embed);
    });
  }
};
