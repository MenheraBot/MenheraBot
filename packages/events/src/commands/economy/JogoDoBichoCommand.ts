import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { collectResponseComponentInteraction } from 'utils/discord/collectorUtils';
import { BICHO_BET_MULTIPLIER } from '../../modules/bicho/finishBets';
import { millisToSeconds } from '../../utils/miscUtils';
import {
  canRegisterBet,
  getCurrentGameStatus,
  getLastGameStatus,
} from '../../modules/bicho/bichoManager';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createSelectMenu,
  disableComponents,
} from '../../utils/discord/componentUtils';

const BichoCommand = createCommand({
  path: '',
  name: 'bicho',
  nameLocalizations: { 'en-US': 'animal' },
  description: '「🦌」・Aposte no famoso Jogo do Bicho',
  descriptionLocalizations: { 'en-US': '「🦌」・Bet on the Animal Game' },
  options: [
    {
      name: 'aposta',
      nameLocalizations: { 'en-US': 'bet' },
      description: 'Valor da aposta',
      descriptionLocalizations: { 'en-US': 'Bet amount' },
      type: ApplicationCommandOptionTypes.Integer,
      required: false,
      minValue: 1,
      maxValue: 500000,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'selectedColor'],
  execute: async (ctx) => {
    const bet = ctx.getOption<number>('aposta', false);

    if (!bet) {
      const lastRaffle = getLastGameStatus();
      const currentRaffle = getCurrentGameStatus();

      const embed = createEmbed({
        color: hexStringToNumber(ctx.authorData.selectedColor),
        title: ctx.locale('commands:bicho.sorted-title'),
        description: ctx.locale('commands:bicho.sorted-description', {
          nextDate: currentRaffle?.dueDate
            ? `<t:${millisToSeconds(currentRaffle.dueDate)}:R>`
            : ctx.locale('commands:bicho.no-register'),
          lastDate: lastRaffle?.dueDate
            ? `<t:${millisToSeconds(lastRaffle.dueDate)}:R>`
            : ctx.locale('commands:bicho.no-register'),
          value:
            currentRaffle?.bets.reduce((p, c) => p + c.bet, 0) ??
            ctx.locale('commands:bicho.no-register'),
          first: lastRaffle
            ? lastRaffle.results[0].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          second: lastRaffle
            ? lastRaffle.results[1].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          third: lastRaffle
            ? lastRaffle.results[2].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          fourth: lastRaffle
            ? lastRaffle.results[3].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          fifth: lastRaffle
            ? lastRaffle.results[4].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          biggestProfit: lastRaffle?.biggestProfit ?? 0,
        }),
      });

      if (currentRaffle?.bets.some((a) => a.id === ctx.author.id))
        embed.fields?.push({
          name: ctx.locale('commands:bicho.in'),
          value: ctx.locale('commands:bicho.in-description'),
        });

      return ctx.makeMessage({ embeds: [embed] });
    }

    if (bet > ctx.authorData.estrelinhas)
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.poor') });

    const currentRaffle = getCurrentGameStatus();

    if (!currentRaffle || currentRaffle.dueDate <= Date.now())
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') });

    if (!canRegisterBet(ctx.author.id))
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.already') });

    const embed = createEmbed({
      title: ctx.locale('commands:bicho.bet-title'),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: ctx.locale('commands:bicho.bet-description', BICHO_BET_MULTIPLIER),
    });

    const firstMenu = createSelectMenu({
      customId: `${ctx.interaction.id} | SELECT`,
      options: [
        { label: ctx.locale('commands:bicho.number'), value: 'number' },
        { label: ctx.locale('commands:bicho.one-animal'), value: 'animal' },
        { label: ctx.locale('commands:bicho.sequence'), value: 'sequence' },
        { label: ctx.locale('commands:bicho.corner'), value: 'corner' },
      ],
    });

    ctx.makeMessage({ embeds: [embed], components: [createActionRow([firstMenu])] });

    const selection = await collectResponseComponentInteraction(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
      15_000,
      false,
    );

    if (!selection)
      return ctx.makeMessage({
        components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [firstMenu]))],
      });

    switch ((selection.data?.values as string[])[0]) {
      case 'number': {
        // TODO: Continue
      }
    }
  },
});

export default BichoCommand;
