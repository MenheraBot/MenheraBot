/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import {
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  Message,
  MessageActionRow,
} from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import http from '@utils/HTTPrequests';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
  BlackjackFinishGameReason,
  IBlackjackCards,
  IPicassoReturnData,
} from '@custom_types/Menhera';
import { BLACKJACK_CARDS, BLACKJACK_PRIZE_MULTIPLIERS } from '@structures/Constants';
import Util, { resolveCustomId, actionRow, MayNotExists, negate } from '@utils/Util';

const getBlackjackCards = (cards: Array<number>): Array<IBlackjackCards> =>
  cards.reduce((p: Array<IBlackjackCards>, c: number) => {
    const multiplier = Math.floor(c / 14);
    const newC = c - multiplier * 13;

    p.push({
      value: newC > 10 ? 10 : newC,
      isAce: newC === 1,
      id: c,
    });

    return p;
  }, []);

const hideMenheraCard = (cards: IBlackjackCards[]): IBlackjackCards[] =>
  cards.map((a, i) => {
    if (i === 1) a.hidden === true;
    return a;
  });

const makeBlackjackEmbed = (
  ctx: InteractionCommandContext,
  playerCards: IBlackjackCards[],
  dealerCards: IBlackjackCards[],
  playerTotal: number,
  dealerTotal: number,
): MessageEmbed =>
  new MessageEmbed()
    .setTitle(ctx.prettyResponse('estrelinhas', 'commands:blackjack.title'))
    .setDescription(
      ctx.locale('commands:blackjack.description', {
        userHand: playerCards.map((a) => a.value).join(', '),
        userTotal: playerTotal,
        dealerCards: dealerCards.map((a) => a.value).join(', '),
        dealerTotal,
      }),
    )
    .setFooter({ text: ctx.locale('commands:blackjack.footer') })
    .setColor(ctx.data.user.selectedColor)
    .setThumbnail(ctx.author.displayAvatarURL({ format: 'png', dynamic: true }));

export default class BlackjackCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'blackjack',
      description: '「🃏」・Disputa num jogo de BlackJack contra a Menhera',
      options: [
        {
          name: 'aposta',
          description: 'Valor da aposta. Mínimo 1000. Máximo 50000',
          type: 'INTEGER',
          required: true,
          minValue: 1000,
          maxValue: 50000,
        },
      ],
      category: 'economy',
      cooldown: 10,
      authorDataFields: ['selectedColor', 'estrelinhas'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const bet = ctx.options.getInteger('aposta', true);

    if (ctx.data.user.estrelinhas < bet) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blackjack.poor'),
        ephemeral: true,
      });
      return;
    }

    await ctx.defer();

    const matchCards = [...BLACKJACK_CARDS].sort(() => Math.random() - 0.5);

    const dealerCards = matchCards.splice(0, 2);
    const playerCards = matchCards.splice(0, 2);

    const tableTheme = await ctx.client.repositories.themeRepository.getTableTheme(ctx.author.id);
    const cardTheme = await ctx.client.repositories.themeRepository.getCardsTheme(ctx.author.id);
    const backgroundCardTheme =
      await ctx.client.repositories.themeRepository.getCardBackgroundTheme(ctx.author.id);

    const bjPlayerCards = getBlackjackCards(playerCards);
    const bjDealerCards = getBlackjackCards(dealerCards);
    const userTotal = BlackjackCommand.checkHandFinalValue(bjPlayerCards);
    const dealerTotal = BlackjackCommand.checkHandFinalValue([bjDealerCards[0]]);

    if (userTotal === 21)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        hideMenheraCard(bjDealerCards),
        bjPlayerCards,
        userTotal,
        dealerTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'init_blackjack',
        true,
        BLACKJACK_PRIZE_MULTIPLIERS.init_blackjack,
        null,
      );

    if (BlackjackCommand.checkHandFinalValue(bjDealerCards) === 21)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        bjDealerCards,
        bjPlayerCards,
        userTotal,
        21,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'init_blackjack',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.init_blackjack,
        null,
      );

    const res = await BlackjackCommand.makePicassoRequest(
      ctx,
      bet,
      bjPlayerCards,
      hideMenheraCard(bjDealerCards),
      userTotal,
      dealerTotal,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
    );

    const embed = makeBlackjackEmbed(
      ctx,
      bjPlayerCards,
      [bjDealerCards[0]],
      userTotal,
      dealerTotal,
    );

    const BuyButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | BUY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:blackjack.buy'));

    const StopButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | STOP`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:blackjack.stop'));

    const gameMessage = await BlackjackCommand.sendGameMessage(
      ctx,
      null,
      embed,
      res,
      actionRow([BuyButton, StopButton]),
    );

    const collected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      10_000,
    );

    if (!collected) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blackjack.timeout'),
        embeds: [],
        attachments: [],
        components: [],
      });

      ctx.client.repositories.starRepository.remove(ctx.author.id, bet);
      return;
    }

    if (resolveCustomId(collected.customId) === 'BUY')
      return BlackjackCommand.continueFromBuy(
        ctx,
        bet,
        dealerCards,
        playerCards,
        matchCards,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        gameMessage,
      );

    return BlackjackCommand.finishGame(
      ctx,
      bet,
      dealerCards,
      playerCards,
      matchCards,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
      gameMessage,
    );
  }

  static async makePicassoRequest(
    ctx: InteractionCommandContext,
    bet: number,
    dealerCards: Array<IBlackjackCards>,
    playerCards: Array<IBlackjackCards>,
    userTotal: number,
    menheraTotal: number,
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
  ): Promise<IPicassoReturnData> {
    return ctx.client.picassoWs.isAlive
      ? ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'blackjack',
          data: {
            userCards: playerCards,
            menheraCards: dealerCards,
            userTotal,
            menheraTotal,
            i18n: {
              yourHand: ctx.locale('commands:blackjack.your-hand'),
              dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
            },
            aposta: bet,
            cardTheme,
            tableTheme,
            backgroundCardTheme,
          },
        })
      : http.blackjackRequest(
          bet,
          playerCards,
          dealerCards,
          userTotal,
          menheraTotal,
          {
            yourHand: ctx.locale('commands:blackjack.your-hand'),
            dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
          },
          cardTheme,
          tableTheme,
          backgroundCardTheme,
        );
  }

  static async finishMatch(
    ctx: InteractionCommandContext,
    bet: number,
    dealerCards: Array<IBlackjackCards>,
    playerCards: Array<IBlackjackCards>,
    userTotal: number,
    menheraTotal: number,
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
    finishReason: BlackjackFinishGameReason,
    didUserWin: boolean,
    prizeMultiplier: number,
    gameMessage: MayNotExists<Message<boolean>>,
  ): Promise<void> {
    const winner = didUserWin ? ctx.author.username : ctx.client.user.username;
    const prize = didUserWin ? Math.floor(bet * prizeMultiplier) : bet;

    if (didUserWin) ctx.client.repositories.starRepository.add(ctx.author.id, prize);
    else ctx.client.repositories.starRepository.remove(ctx.author.id, prize);

    const image = await BlackjackCommand.makePicassoRequest(
      ctx,
      bet,
      dealerCards,
      playerCards,
      userTotal,
      menheraTotal,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
    );

    const embed = makeBlackjackEmbed(ctx, playerCards, dealerCards, userTotal, menheraTotal);

    embed.addField(
      ctx.prettyResponse(didUserWin ? 'crown' : 'no', 'commands:blackjack.result'),
      ctx.locale(`commands:blackjack.${finishReason}`, {
        winner,
        prize: didUserWin ? prize : negate(prize),
      }),
    );

    BlackjackCommand.sendGameMessage(ctx, gameMessage, embed, image, []);
  }

  static async continueFromBuy(
    ctx: InteractionCommandContext,
    valor: number,
    dealerCards: Array<number>,
    usrCards: Array<number>,
    deckCards: Array<number>,
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
    gameMessage: MayNotExists<Message>,
  ): Promise<void> {
    if (usrCards.length === 2) {
      const oldUserCards = getBlackjackCards(usrCards);
      const oldUserTotal = BlackjackCommand.checkHandFinalValue(oldUserCards);

      if (oldUserTotal >= 21)
        return BlackjackCommand.finishGame(
          ctx,
          valor,
          dealerCards,
          usrCards,
          deckCards,
          cardTheme,
          tableTheme,
          backgroundCardTheme,
          gameMessage,
        );
    }

    const matchCards = deckCards;

    const newCard = matchCards.shift() as number;
    const playerCards = [...usrCards, newCard];

    const userCards = getBlackjackCards(playerCards);
    const userTotal = BlackjackCommand.checkHandFinalValue(userCards);

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'blackjack',
          data: {
            userCards,
            menheraCards: getBlackjackCards(dealerCards).map((a, i) => {
              if (i === 1) {
                a.hidden = true;
              }
              return a;
            }),
            userTotal,
            menheraTotal: BlackjackCommand.checkHandFinalValue(getBlackjackCards([dealerCards[0]])),
            i18n: {
              yourHand: ctx.locale('commands:blackjack.your-hand'),
              dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
            },
            aposta: valor,
            cardTheme,
            tableTheme,
            backgroundCardTheme,
          },
        })
      : await http.blackjackRequest(
          valor,
          userCards,
          getBlackjackCards(dealerCards),
          userTotal,
          BlackjackCommand.checkHandFinalValue(getBlackjackCards([dealerCards[0]])),
          false,
          {
            yourHand: ctx.locale('commands:blackjack.your-hand'),
            dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
          },
          cardTheme,
          tableTheme,
          backgroundCardTheme,
        );

    const embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${getBlackjackCards(playerCards)
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${BlackjackCommand.checkHandFinalValue(
          getBlackjackCards(playerCards),
        )}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${getBlackjackCards([
          dealerCards[0],
        ])
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${BlackjackCommand.checkHandFinalValue(
          getBlackjackCards([dealerCards[0]]),
        )}\``,
      )
      .setFooter({ text: ctx.locale('commands:blackjack.footer') })
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ format: 'png', dynamic: true }));

    const BuyButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | BUY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:blackjack.buy'));

    const StopButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | STOP`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:blackjack.stop'));

    const timestamp = Date.now();
    if (!res.err) embed.setImage(`attachment://blackjack-${timestamp}.png`);

    gameMessage = gameMessage
      ? await gameMessage.edit({
          attachments: [],
          embeds: [embed],
          files: res.err ? [] : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
          components: [actionRow([BuyButton, StopButton])],
        })
      : await ctx.send({
          embeds: [embed],
          attachments: [],
          files: res.err ? [] : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
          components: [actionRow([BuyButton, StopButton])],
        });

    const collected = await Util.collectComponentInteraction(ctx.channel, ctx.author.id, 10000);

    if (!collected) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blackjack.timeout'),
        embeds: [],
        components: [],
        attachments: [],
      });
      ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      return;
    }

    if (resolveCustomId(collected.customId) === 'BUY') {
      if (userTotal >= 21) {
        BlackjackCommand.finishGame(
          ctx,
          valor,
          dealerCards,
          playerCards,
          matchCards,
          cardTheme,
          tableTheme,
          backgroundCardTheme,
          gameMessage,
        );
        return;
      }
      BlackjackCommand.continueFromBuy(
        ctx,
        valor,
        dealerCards,
        playerCards,
        matchCards,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        gameMessage,
      );
      return;
    }

    BlackjackCommand.finishGame(
      ctx,
      valor,
      dealerCards,
      playerCards,
      matchCards,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
      gameMessage,
    );
  }

  static checkHandFinalValue(cards: Array<IBlackjackCards>): number {
    let total: number;

    const baseSum = cards.reduce((p, a) => a.value + p, 0);

    if (cards.some((a) => a.isAce) && baseSum <= 11) {
      total = cards.reduce((p, a) => (a.isAce && p <= 10 ? 11 : a.value) + p, 0);
    } else total = baseSum;

    return total;
  }

  static async sendGameMessage(
    ctx: InteractionCommandContext,
    gameMessage: MayNotExists<Message>,
    embed: MessageEmbed,
    res: IPicassoReturnData,
    componentsRow: MessageActionRow,
  ): Promise<MayNotExists<Message<boolean>>> {
    const timestamp = Date.now();

    if (!res.err) embed.setImage(`attachment://blackjack-${timestamp}.png`);

    return gameMessage
      ? gameMessage.edit({
          attachments: [],
          embeds: [embed],
          files: res.err ? [] : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
          components: [componentsRow],
        })
      : ctx.send({
          embeds: [embed],
          attachments: [],
          files: res.err ? [] : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
          components: [componentsRow],
        });
  }

  static async finishGame(
    ctx: InteractionCommandContext,
    valor: number,
    menheraCards: number[],
    playerCards: number[],
    matchCards: number[],
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
    gameMessage: MayNotExists<Message>,
  ): Promise<void> {
    const userCards = getBlackjackCards(playerCards);
    const dealerCards = getBlackjackCards(menheraCards);

    const userTotal = BlackjackCommand.checkHandFinalValue(userCards);
    let menheraTotal = BlackjackCommand.checkHandFinalValue(dealerCards);

    let embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${userCards
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${userTotal}\`\n${ctx.locale(
          'commands:blackjack.dealer-hand',
        )}: **${dealerCards.map((a) => `${a.value}`).join(', ')}** -> \`${menheraTotal}\``,
      )
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ format: 'png', dynamic: true }));

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'blackjack',
          data: {
            userCards,
            menheraCards: dealerCards,
            userTotal,
            menheraTotal,
            i18n: {
              yourHand: ctx.locale('commands:blackjack.your-hand'),
              dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
            },
            aposta: valor,
            cardTheme,
            tableTheme,
            backgroundCardTheme,
          },
        })
      : await http.blackjackRequest(
          valor,
          userCards,
          dealerCards,
          userTotal,
          menheraTotal,
          true,
          {
            yourHand: ctx.locale('commands:blackjack.your-hand'),
            dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
          },
          cardTheme,
          tableTheme,
          backgroundCardTheme,
        );

    if (userTotal === 21 && playerCards.length === 2) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.blackjack', { value: valor * 4 }),
      );

      await ctx.client.repositories.starRepository.add(ctx.author.id, valor * 2);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, res);
      await http.postBlackJack(ctx.author.id, true, valor * 2);
      return;
    }

    // Estourou
    if (userTotal > 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.explode'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);

      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, res);
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    // Continua

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bj'),
      );

      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, res);
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (menheraTotal < 17)
      do {
        const newCards = getBlackjackCards(matchCards.splice(0, 1));
        dealerCards.push(...newCards);
        menheraTotal = BlackjackCommand.checkHandFinalValue(dealerCards);
      } while (menheraTotal < 17);

    embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${userCards
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${userTotal}\`\n${ctx.locale(
          'commands:blackjack.dealer-hand',
        )}: **${dealerCards.map((a) => `${a.value}`).join(', ')}** -> \`${menheraTotal}\``,
      )
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ format: 'png', dynamic: true }));

    const newRes = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'blackjack',
          data: {
            userCards,
            menheraCards: dealerCards,
            userTotal,
            menheraTotal,
            i18n: {
              yourHand: ctx.locale('commands:blackjack.your-hand'),
              dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
            },
            aposta: valor,
            cardTheme,
            tableTheme,
            backgroundCardTheme,
          },
        })
      : await http.blackjackRequest(
          valor,
          userCards,
          dealerCards,
          userTotal,
          menheraTotal,
          true,
          {
            yourHand: ctx.locale('commands:blackjack.your-hand'),
            dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
          },
          cardTheme,
          tableTheme,
          backgroundCardTheme,
        );

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-21'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (userTotal === 21 && menheraTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.user-21', { value: valor * 2 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      await http.postBlackJack(ctx.author.id, true, valor * 2);
      return;
    }

    if (menheraTotal > 21 && userTotal <= 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bust', { value: valor * 2 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      await http.postBlackJack(ctx.author.id, true, valor * 2);
      return;
    }

    if (menheraTotal > 21 && userTotal > 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.draw'),
      );
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      return;
    }

    if (menheraTotal === 21 && userTotal === 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.both-21'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (menheraTotal === userTotal) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.equal'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (menheraTotal > userTotal) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bigger'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    embed.addField(
      ctx.locale('commands:blackjack.result'),
      ctx.locale('commands:blackjack.user-bigger', { value: valor * 2 }),
    );
    await ctx.client.repositories.starRepository.add(ctx.author.id, valor);
    BlackjackCommand.sendGameResult(ctx, gameMessage, embed, newRes);
    await http.postBlackJack(ctx.author.id, true, valor * 2);
  }
}
