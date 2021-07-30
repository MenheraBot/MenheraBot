import { Message, MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { confirmRegister } from '@structures/Rpgs/checks';

export default class RegisterCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'register',
      aliases: ['registrar'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);

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
    await ctx.send(embed);

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1 });

    collector.on('collect', (m) => {
      switch (m.content) {
        case '1':
          return this.confirmation(ctx, 'Assassino');
        case '2':
          return this.confirmation(ctx, 'Bárbaro');
        case '3':
          return this.confirmation(ctx, 'Clérigo');
        case '4':
          return this.confirmation(ctx, 'Druida');
        case '5':
          return this.confirmation(ctx, 'Espadachim');
        case '6':
          return this.confirmation(ctx, 'Feiticeiro');
        case '7':
          return this.confirmation(ctx, 'Monge');
        case '8':
          return this.confirmation(ctx, 'Necromante');
        default:
          return ctx.replyT('error', 'commands:register.invalid-input');
      }
    });
  }

  async confirmation(ctx: CommandContext, option: string): Promise<Message | void> {
    const selectedOption = ctx.locale(`commands:register.${option}`);
    await ctx.replyT('warn', 'commands:register.confirm', { option: selectedOption });

    const filtro = (m: Message) => m.author.id === ctx.message.author.id;
    const confirmCollector = ctx.message.channel.createMessageCollector(filtro, { max: 1 });

    confirmCollector.on('collect', async (m: Message) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        await ctx.replyT('success', 'commands:register.confirmed', { option: selectedOption });
        const user = await this.client.repositories.rpgRepository.create(
          ctx.message.author.id,
          option,
        );
        return confirmRegister(user, ctx);
      }
      return ctx.replyT('error', 'commands:register.canceled');
    });
  }
}
