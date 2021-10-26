/* eslint-disable no-unused-expressions */
import { MessageEmbed } from 'discord.js-light';
import moment from 'moment';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class CooldownsInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'cooldowns',
      description: '「⌛」・Mostra todos os seus tempos de recarga',
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (!ctx.data.user) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'error'), ephemeral: true });
      return;
    }

    const huntCooldownInMilis = parseInt(ctx.data.user.caçarTime) - Date.now();
    const voteCooldownInMilis = parseInt(ctx.data.user.voteCooldown) - Date.now();

    let txt = '';

    txt +=
      huntCooldownInMilis < 0
        ? `\`${ctx.translate('hunt')}\` | ${ctx.translate('no-cooldown')}\n`
        : `\`${ctx.translate('hunt')}\` | **${moment
            .utc(huntCooldownInMilis)
            .format('mm:ss')}** ${ctx.translate('minutes')}\n`;

    txt +=
      voteCooldownInMilis < 0
        ? `\`${ctx.translate('vote')}\` | ${ctx.translate('no-cooldown')}`
        : `\`${ctx.translate('vote')}\` | ${
            voteCooldownInMilis > 3600000
              ? `**${moment.utc(voteCooldownInMilis).format('HH:mm:ss')}** ${ctx.translate(
                  'hours',
                )}`
              : `**${moment.utc(voteCooldownInMilis).format('mm:ss')}** ${ctx.translate('minutes')}`
          }`;

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('title'))
      .setColor('#6597df')
      .setDescription(txt);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
