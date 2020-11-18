const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class RegisterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'register',
      aliases: ['registrar'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run({ message }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);

    if (user) return message.menheraReply('error', t('commands:register.already', { name: message.author.username }));

    const classes = ['Assassino', 'Bárbaro', 'Clérigo', 'Druida', 'Espadachim', 'Feiticeiro', 'Monge', 'Necromante'];

    let description = t('commands:register.text');

    const embed = new MessageEmbed()
      .setTitle(`<:guilda:759892389724028948> | ${t('commands:register.title')}`)
      .setColor('#ffec02')
      .setFooter(t('commands:register.footer'));

    for (let i = 0; i < classes.length; i++) {
      description += `\n${i + 1} - **${classes[i]}**`;
    }
    embed.setDescription(description);
    message.channel.send(embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1 });

    collector.on('collect', (m) => {
      switch (m.content) {
        case '1':
          this.confirmação(message, 'Assassino', t);
          break;
        case '2':
          this.confirmação(message, 'Bárbaro', t);
          break;
        case '3':
          this.confirmação(message, 'Clérigo', t);
          break;
        case '4':
          this.confirmação(message, 'Druida', t);
          break;
        case '5':
          this.confirmação(message, 'Espadachim', t);
          break;
        case '6':
          this.confirmação(message, 'Feiticeiro', t);
          break;
        case '7':
          this.confirmação(message, 'Monge', t);
          break;
        case '8':
          this.confirmação(message, 'Necromante', t);
          break;
        default:
          return message.menheraReply('error', t('commands:register.invalid-input'));
      }
    });
  }

  confirmação(message, option, t) {
    message.menheraReply('warn', t('commands:register.confirm', { option }));

    const filtro = (m) => m.author.id === message.author.id;
    const confirmCollector = message.channel.createMessageCollector(filtro, { max: 1 });

    confirmCollector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        message.menheraReply('success', t('commands:register.confirmed', { option }));
        const user = await new this.client.database.Rpg({
          _id: message.author.id,
          class: option,
        }).save();
        this.client.rpgChecks.confirmRegister(user, message, t);
      } else message.menheraReply('error', t('commands:register.canceled'));
    });
  }
};
