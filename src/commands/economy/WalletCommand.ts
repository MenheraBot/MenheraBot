import { MessageEmbed } from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class WalletCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'carteira',
      nameLocalizations: { 'en-US': 'wallet' },
      description: '「💳」・Mostra a carteira de alguém',
      descriptionLocalizations: { 'en-US': "「💳」・Show someone's wallet" },
      options: [
        {
          name: 'usuário',
          nameLocalizations: { 'en-US': 'user' },
          description: 'Usuário para mostrar a carteira',
          descriptionLocalizations: { 'en-US': 'User to show wallet' },
          type: 'USER',
          required: false,
        },
      ],
      category: 'economy',
      cooldown: 5,
      authorDataFields: [
        'estrelinhas',
        'demons',
        'giants',
        'angels',
        'archangels',
        'selectedColor',
        'gods',
        'demigods',
        'rolls',
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const pessoa = ctx.options.getUser('user') ?? ctx.author;

    const user =
      pessoa.id === ctx.author.id
        ? ctx.data.user
        : await ctx.client.repositories.userRepository.find(pessoa.id);

    if (!user) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:carteira.no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (user.ban === true) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:carteira.banned-user'),
        ephemeral: true,
      });
      return;
    }

    const color = user?.selectedColor ?? ('#a788ff' as const);

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:carteira.title', { user: pessoa.tag }))
      .setColor(color)
      .addFields([
        {
          name: `⭐ | ${ctx.locale('commands:carteira.stars')}`,
          value: `**${user.estrelinhas}**`,
          inline: true,
        },
        {
          name: `🔑 | ${ctx.locale('commands:carteira.rolls')}`,
          value: `**${user.rolls}**`,
          inline: true,
        },
        {
          name: `<:DEMON:758765044443381780> | ${ctx.locale('commands:carteira.demons')} `,
          value: `**${user.demons}**`,
          inline: true,
        },
        {
          name: `🦍 | ${ctx.locale('commands:carteira.giants')}`,
          value: `**${user.giants}**`,
          inline: true,
        },
        {
          name: `<:ANGEL:758765044204437535> | ${ctx.locale('commands:carteira.angels')}`,
          value: `**${user.angels}**`,
          inline: true,
        },
        {
          name: `👼| ${ctx.locale('commands:carteira.archangel')}`,
          value: `**${user.archangels}**`,
          inline: true,
        },
        {
          name: `<:SemiGod:758766732235374674> | ${ctx.locale('commands:carteira.sd')}`,
          value: `**${user.demigods}**`,
          inline: true,
        },
        {
          name: `<:God:758474639570894899> | ${ctx.locale('commands:carteira.god')}`,
          value: `**${user.gods}**`,
          inline: true,
        },
      ]);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
