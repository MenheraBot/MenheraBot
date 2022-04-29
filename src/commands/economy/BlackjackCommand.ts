/* eslint-disable no-param-reassign */
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
import Util, { resolveCustomId, actionRow, MayNotExists, negate, debugError } from '@utils/Util';

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
    if (i === 1) a.hidden = true;
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

    const gameMessage = await BlackjackCommand.sendGameMessage(ctx, null, embed, res, [
      actionRow([BuyButton, StopButton]),
    ]);

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

    return BlackjackCommand.startDealerPlay(
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
        text: ctx.locale(`commands:blackjack.${didUserWin ? 'profit' : 'loss'}`),
      }),
    );

    BlackjackCommand.sendGameMessage(ctx, gameMessage, embed, image, []);
    http.postBlackJack(ctx.author.id, didUserWin, prize);
  }

  static async continueFromBuy(
    ctx: InteractionCommandContext,
    bet: number,
    dealerCards: Array<number>,
    usrCards: Array<number>,
    matchCards: Array<number>,
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
    gameMessage: MayNotExists<Message>,
  ): Promise<void> {
    const newCard = matchCards.shift() as number;
    const playerCards = [...usrCards, newCard];

    const menheraCards = getBlackjackCards(dealerCards);
    const menheraTotal = BlackjackCommand.checkHandFinalValue([menheraCards[0]]);

    const userCards = getBlackjackCards(playerCards);
    const userTotal = BlackjackCommand.checkHandFinalValue(userCards);
    const res = await BlackjackCommand.makePicassoRequest(
      ctx,
      bet,
      userCards,
      hideMenheraCard(menheraCards),
      userTotal,
      menheraTotal,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
    );

    const embed = makeBlackjackEmbed(
      ctx,
      userCards,
      hideMenheraCard(menheraCards),
      userTotal,
      menheraTotal,
    );

    const BuyButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | BUY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:blackjack.buy'));

    const StopButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | STOP`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:blackjack.stop'));

    gameMessage = await BlackjackCommand.sendGameMessage(ctx, gameMessage, embed, res, [
      actionRow([BuyButton, StopButton]),
    ]);

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

    if (resolveCustomId(collected.customId) === 'BUY') {
      const expectedNextCard = matchCards[0];
      const expectedNextUserCards = [...playerCards, expectedNextCard];
      const expectedNextUserBlackjackCards = getBlackjackCards(expectedNextUserCards);
      const expectedUserTotal = BlackjackCommand.checkHandFinalValue(
        expectedNextUserBlackjackCards,
      );
      if (expectedUserTotal > 21)
        return BlackjackCommand.finishMatch(
          ctx,
          bet,
          hideMenheraCard(menheraCards),
          expectedNextUserBlackjackCards,
          expectedUserTotal,
          menheraTotal,
          cardTheme,
          tableTheme,
          backgroundCardTheme,
          'busted',
          false,
          0,
          gameMessage,
        );

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
    }

    if (userTotal === 21)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        hideMenheraCard(menheraCards),
        userCards,
        userTotal,
        menheraTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'blackjack',
        true,
        BLACKJACK_PRIZE_MULTIPLIERS.blackjack,
        gameMessage,
      );

    if (userTotal > 21)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        hideMenheraCard(menheraCards),
        userCards,
        userTotal,
        menheraTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'busted',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.base,
        gameMessage,
      );

    return BlackjackCommand.startDealerPlay(
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
    components: MessageActionRow[],
  ): Promise<MayNotExists<Message<boolean>>> {
    const timestamp = Date.now();

    if (!res.err) embed.setImage(`attachment://blackjack-${timestamp}.png`);

    return gameMessage
      ? gameMessage
          .edit({
            attachments: [],
            embeds: [embed],
            files: res.err ? [] : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
            components,
          })
          .catch(() =>
            ctx
              .send({
                embeds: [embed],
                attachments: [],
                files: res.err
                  ? []
                  : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
                components,
              })
              .catch(debugError),
          )
      : ctx.send({
          embeds: [embed],
          attachments: [],
          files: res.err ? [] : [new MessageAttachment(res.data, `blackjack-${timestamp}.png`)],
          components,
        });
  }

  static async startDealerPlay(
    ctx: InteractionCommandContext,
    bet: number,
    menheraCards: number[],
    playerCards: number[],
    matchCards: number[],
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
    gameMessage: MayNotExists<Message>,
  ): Promise<void> {
    const userCards = getBlackjackCards(playerCards);
    const userTotal = BlackjackCommand.checkHandFinalValue(userCards);

    const dealerCards = getBlackjackCards(menheraCards);
    let menheraTotal = BlackjackCommand.checkHandFinalValue(dealerCards);

    while (menheraTotal < 17) {
      const newCards = getBlackjackCards(matchCards.splice(0, 1));
      dealerCards.push(...newCards);
      menheraTotal = BlackjackCommand.checkHandFinalValue(dealerCards);
    }

    if (menheraTotal === 21)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        dealerCards,
        userCards,
        userTotal,
        menheraTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'blackjack',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.blackjack,
        gameMessage,
      );

    if (menheraTotal > 21)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        dealerCards,
        userCards,
        userTotal,
        menheraTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'busted',
        true,
        BLACKJACK_PRIZE_MULTIPLIERS.base,
        gameMessage,
      );

    if (userTotal === menheraTotal)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        dealerCards,
        userCards,
        userTotal,
        menheraTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'draw',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.base,
        gameMessage,
      );

    if (menheraTotal > userTotal)
      return BlackjackCommand.finishMatch(
        ctx,
        bet,
        dealerCards,
        userCards,
        userTotal,
        menheraTotal,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'biggest',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.base,
        gameMessage,
      );

    return BlackjackCommand.finishMatch(
      ctx,
      bet,
      dealerCards,
      userCards,
      userTotal,
      menheraTotal,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
      'biggest',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      gameMessage,
    );
  }
}
