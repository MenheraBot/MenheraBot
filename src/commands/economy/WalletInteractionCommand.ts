import { MessageEmbed } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class WalletInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'carteira',
      description: '「💳」・Mostra a carteira de alguém',
      options: [
        {
          name: 'user',
          description: 'Usuário para mostrar a carteira',
          type: 'USER',
          required: false,
        },
      ],
      category: 'economy',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: [
        'estrelinhas',
        'caçados',
        'giants',
        'anjos',
        'arcanjos',
        'deuses',
        'semideuses',
        'rolls',
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const pessoa = ctx.options.getUser('user') ?? ctx.author;

    const user =
      pessoa.id === ctx.author.id
        ? ctx.data.user
        : await this.client.repositories.userRepository.find(pessoa.id);

    if (!user) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (user.ban === true) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'banned-user'),
        ephemeral: true,
      });
      return;
    }

    const color = user?.cor ?? ('#a788ff' as const);

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('title', { user: pessoa.tag }))
      .setColor(color)
      .addFields([
        {
          name: `⭐ | ${ctx.translate('stars')}`,
          value: `**${user.estrelinhas}**`,
          inline: true,
        },
        {
          name: `🔑 | ${ctx.translate('rolls')}`,
          value: `**${user.rolls}**`,
          inline: true,
        },
        {
          name: `<:DEMON:758765044443381780> | ${ctx.translate('demons')} `,
          value: `**${user.caçados}**`,
          inline: true,
        },
        {
          name: `🦍 | ${ctx.translate('giants')}`,
          value: `**${user.giants || 0}**`,
          inline: true,
        },
        {
          name: `<:ANGEL:758765044204437535> | ${ctx.translate('angels')}`,
          value: `**${user.anjos}**`,
          inline: true,
        },
        {
          name: `👼| ${ctx.translate('archangel')}`,
          value: `**${user.arcanjos || 0}**`,
          inline: true,
        },
        {
          name: `<:SemiGod:758766732235374674> | ${ctx.translate('sd')}`,
          value: `**${user.semideuses}**`,
          inline: true,
        },
        {
          name: `<:God:758474639570894899> | ${ctx.translate('god')}`,
          value: `**${user.deuses}**`,
          inline: true,
        },
      ]);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
