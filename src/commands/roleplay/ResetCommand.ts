import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import Util, { actionRow, makeCustomId, resolveCustomId } from '@utils/Util';
import { MessageButton, MessageEmbed } from 'discord.js-light';

export default class ResetCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'reset',
      nameLocalizations: { 'pt-BR': 'resetar' },
      description: '【ＲＰＧ】↪️ | RPG Reset System',
      descriptionLocalizations: { 'pt-BR': '【ＲＰＧ】↪️ | Sistema de Reset do RPG' },
      category: 'roleplay',
      options: [
        {
          name: 'blesses',
          nameLocalizations: { 'pt-BR': 'bençãos' },
          description: "【ＲＰＧ】↪️ | Resets your character's blessings",
          descriptionLocalizations: {
            'pt-BR': '【ＲＰＧ】↪️ | Reseta as bênçãos do teu personagem',
          },
          type: 'SUB_COMMAND',
        },
        {
          name: 'sheet',
          nameLocalizations: { 'pt-BR': 'ficha' },
          description: '【ＲＰＧ】↪️ | Reset Your Sheet',
          descriptionLocalizations: { 'pt-BR': '【ＲＰＧ】↪️ | Reseta tua ficha' },
          type: 'SUB_COMMAND',
        },
      ],
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    if (ctx.options.getSubcommand() === 'blesses') {
      ctx.makeMessage({ content: ctx.prettyResponseText('error', 'soon') });
      return;
    }

    if (user.level < 5) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:resetar.ficha.level'),
        components: [],
        embeds: [],
      });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('warn', 'commands:resetar.ficha.title'))
      .setColor('DARK_NAVY')
      .setDescription(ctx.locale('commands:resetar.ficha.description'));

    const [yesCustomId, baseId] = makeCustomId('YES');
    const [noCustomId] = makeCustomId('NO', baseId);

    const yesButton = new MessageButton()
      .setCustomId(yesCustomId)
      .setLabel(ctx.locale('commands:resetar.ficha.yes'))
      .setStyle('DANGER');

    const noButton = new MessageButton()
      .setCustomId(noCustomId)
      .setLabel(ctx.locale('commands:resetar.ficha.no'))
      .setStyle('PRIMARY');

    ctx.makeMessage({ embeds: [embed], components: [actionRow([yesButton, noButton])] });

    const clicked = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
      15_000,
    );

    if (!clicked) {
      ctx.deleteReply();
      return;
    }

    if (resolveCustomId(clicked.customId) === 'NO') {
      ctx.makeMessage({
        content: ctx.prettyResponse('crown', 'commands:resetar.ficha.negated'),
        embeds: [],
        components: [],
      });
      return;
    }

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:resetar.ficha.success'),
      components: [],
      embeds: [],
    });

    await ctx.client.repositories.roleplayRepository.deleteUser(ctx.author.id);
  }
}
