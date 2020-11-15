const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class WalletCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'wallet',
      aliases: ['carteira'],
      category: 'economia',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, args }, t) {
    let pessoa;

    if (args[0]) {
      try {
        pessoa = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
      } catch {
        return message.menheraReply('error', t('commands:wallet.unknow-user'));
      }
    } else {
      pessoa = message.author;
    }

    const user = await this.client.database.Users.findOne({ id: pessoa.id });
    if (!user) return message.menheraReply('error', t('commands:wallet.no-dbuser'));

    let cor;

    if (user.cor) {
      cor = user.cor;
    } else cor = '#a788ff';

    const embed = new MessageEmbed()
      .setTitle(t('commands:wallet.title', { user: pessoa.tag }))
      .setColor(cor)
      .addFields([{
        name: `⭐ | ${t('commands:wallet.stars')}`,
        value: `**${user.estrelinhas}**`,
        inline: true,
      },
      {
        name: `🔑 | ${t('commands:wallet.rolls')}`,
        value: `**${user.rolls}**`,
        inline: true,
      },
      {
        name: `<:DEMON:758765044443381780> | ${t('commands:wallet.demons')} `,
        value: `**${user.caçados}**`,
        inline: true,
      },
      {
        name: `<:ANGEL:758765044204437535> | ${t('commands:wallet.angels')}`,
        value: `**${user.anjos}**`,
        inline: true,
      },
      {
        name: `<:SemiGod:758766732235374674> | ${t('commands:wallet.sd')}`,
        value: `**${user.semideuses}**`,
        inline: true,
      },
      {
        name: `<:God:758474639570894899> | ${t('commands:wallet.god')}`,
        value: `**${user.deuses}**`,
        inline: true,
      },
      ]);

    message.channel.send(message.author, embed);
  }
};
