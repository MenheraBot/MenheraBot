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

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);

    if (user)
      return ctx.replyT('error', 'commands:register.already', {
        name: ctx.message.author.username,
      });

    const classes = [
      ctx.locale('commands:register.Assassino'),
      ctx.locale('commands:register.Bárbaro'),
      ctx.locale('commands:register.Clérigo'),
      ctx.locale('commands:register.Druida'),
      ctx.locale('commands:register.Espadachim'),
      ctx.locale('commands:register.Feiticeiro'),
      ctx.locale('commands:register.Monge'),
      ctx.locale('commands:register.Necromante'),
    ];

    let description = ctx.locale('commands:register.text');

    const embed = new MessageEmbed()
      .setTitle(`<:guilda:759892389724028948> | ${ctx.locale('commands:register.title')}`)
      .setColor('#ffec02')
      .setFooter(ctx.locale('commands:register.footer'));

    for (let i = 0; i < classes.length; i++) {
      description += `\n${i + 1} - **${classes[i]}**`;
    }
    embed.setDescription(description);
    ctx.send(embed);

    const filter = (m) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1 });

    collector.on('collect', (m) => {
      switch (m.content) {
        case '1':
          this.confirmação(ctx, 'Assassino');
          break;
        case '2':
          this.confirmação(ctx, 'Bárbaro');
          break;
        case '3':
          this.confirmação(ctx, 'Clérigo');
          break;
        case '4':
          this.confirmação(ctx, 'Druida');
          break;
        case '5':
          this.confirmação(ctx, 'Espadachim');
          break;
        case '6':
          this.confirmação(ctx, 'Feiticeiro');
          break;
        case '7':
          this.confirmação(ctx, 'Monge');
          break;
        case '8':
          this.confirmação(ctx, 'Necromante');
          break;
        default:
          return ctx.replyT('error', 'commands:register.invalid-input');
      }
    });
  }

  confirmação(ctx, option) {
    const selectedOption = ctx.locale(`commands:register.${option}`);
    ctx.replyT('warn', 'commands:register.confirm', { option: selectedOption });

    const filtro = (m) => m.author.id === ctx.message.author.id;
    const confirmCollector = ctx.message.channel.createMessageCollector(filtro, { max: 1 });

    confirmCollector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        ctx.replyT('success', 'commands:register.confirmed', { option: selectedOption });
        const user = await new this.client.database.Rpg({
          _id: ctx.message.author.id,
          class: option,
        }).save();
        this.client.rpgChecks.confirmRegister(user, ctx);
      } else ctx.replyT('error', 'commands:register.canceled');
    });
  }
};
