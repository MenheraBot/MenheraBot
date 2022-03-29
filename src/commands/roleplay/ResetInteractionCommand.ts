import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import Util, { actionRow, makeCustomId, resolveCustomId } from '@utils/Util';
import { MessageButton, MessageEmbed } from 'discord.js-light';

export default class ResetInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'resetar',
      description: '【ＲＰＧ】↪️ | Sistema de Reset do RPG',
      category: 'roleplay',
      options: [
        {
          name: 'bencaos',
          description: '【ＲＰＧ】↪️ | Reseta as bênçãos do teu personagem',
          type: 'SUB_COMMAND',
        },
        {
          name: 'ficha',
          description: '【ＲＰＧ】↪️ | Reseta tua ficha',
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

    if (ctx.options.getSubcommand() === 'bencaos') {
      ctx.makeMessage({ content: ctx.prettyResponseText('error', 'soon') });
      return;
    }

    if (user.level < 5) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:resetar.ficha.level') });
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

    ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:resetar.ficha.success') });

    await ctx.client.repositories.roleplayRepository.deleteUser(ctx.author.id);
  }
}
