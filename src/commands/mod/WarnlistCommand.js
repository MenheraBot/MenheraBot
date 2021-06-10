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

  async run(ctx) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:warnlist.no-mention');

    let user;
    try {
      user = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
    } catch {
      return ctx.replyT('error', 'commands:warnlist.no-mention');
    }

    if (!user) return ctx.replyT('error', 'commands:warnlist.no-mention');
    if (user.bot) return ctx.replyT('error', 'commands:warnlist.bot');
    if (!ctx.message.guild.members.cache.get(user.id)) return ctx.replyT('error', 'commands:warnlist.invalid-member');

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
      .setTitle(ctx.locale('commands:warnlist.embed_title', { user: user.tag }));

    this.client.database.Warns.find({
      userId: user.id,
      guildId: ctx.message.guild.id,
    }).sort([
      ['data', 'ascending'],
    ]).exec(async (err, db) => {
      if (err) console.log(err);

      if (!db || db.length < 1) {
        embed.setDescription(`${user} ${ctx.locale('commands:warnlist.no_warns')}`);
        rand = noWarn[Math.floor(Math.random() * noWarn.length)];
      } else {
        rand = warned[Math.floor(Math.random() * warned.length)];
      }

      for (let i = 0; i < db.length; i++) {
        if (embed.fields.length === 24) break;
        // eslint-disable-next-line no-await-in-loop
        const warner = await this.client.users.fetch(db[i].warnerId);
        embed.addField(`${ctx.locale('commands:warnlist.warn')} #${i + 1}`, `**${ctx.locale('commands:warnlist.Warned_by')}** ${warner || '404'}\n**${ctx.locale('commands:warnlist.Reason')}** ${db[i].reason}\n**${ctx.locale('commands:warnlist.Data')}** ${db[i].data}\n**${ctx.locale('commands:warnlist.WarnID')}** \`${db[i]._id}\``);
      }

      embed.setImage(rand);
      ctx.send(embed);
    });
  }
};
