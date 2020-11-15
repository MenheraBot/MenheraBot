const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class ProfileCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'profile',
      aliases: ['perfil'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run({ message, args }, t) {
    let pessoa;
    if (args[0]) {
      try {
        pessoa = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
      } catch {
        return message.menheraReply('error', t('commands:profile.unknow-user'));
      }
    } else {
      pessoa = message.author;
    }

    if (pessoa.bot) return message.menheraReply('error', t('commands:profile.bot'));

    const embed = new MessageEmbed()
      .setTitle(`${pessoa.username}`)
      .setThumbnail(pessoa.displayAvatarURL({ dynamic: true }));

    const user = await this.client.database.Users.findOne({ id: pessoa.id });

    if (!user) return message.menheraReply('error', t('commands:profile.no-dbuser'));
    if (user.ban) return message.menheraReply('error', t('commands:profile.banned', { reason: user.banReason }));
    const mamadas = user.mamadas || 0;
    const mamou = user.mamou || 0;
    const nota = user.nota || 'Sem Nota';
    const cor = user.cor || '#a788ff';
    const votos = user.votos || 0;

    embed.setColor(cor);

    embed.addFields([{
      name: `👅 | ${t('commands:profile.mamou')}`,
      value: mamou,
      inline: true,
    },
    {
      name: `❤️ | ${t('commands:profile.mamado')}`,
      value: mamadas,
      inline: true,
    },
    {
      name: '<:God:758474639570894899> | Upvotes',
      value: votos,
      inline: true,
    },
    ]);

    if (user.casado && user.casado !== 'false') {
      const persona = await this.client.users.fetch(user.casado) || '`Sem informações do usuário`';
      const data = user.data || 'Sem data registrada';
      embed.addFields([{
        name: `💗 | ${t('commands:profile.married-with')}`,
        value: persona,
        inline: true,
      },
      {
        name: `💍 | ${t('commands:profile.married-in')}`,
        value: data,
        inline: true,
      },
      ]);
    }
    embed.addField(`<:apaixonada:727975782034440252> | ${t('commands:profile.about-me')}`, nota, true);

    message.channel.send(message.author, embed);
  }
};
