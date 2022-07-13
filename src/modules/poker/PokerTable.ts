/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IUserSchema } from '@custom_types/Menhera';
import { BLACKJACK_CARDS, COLORS } from '@structures/Constants';
import { MessageEmbed, User } from 'discord.js-light';
import PokerInteractionContext from './PokerInteractionContext';
import { PokerRoundData, PokerTableData } from './types';

export default class PokerTable {
  private roundData: PokerRoundData;

  private tableData: PokerTableData;

  constructor(
    private ctx: PokerInteractionContext,
    private players: Map<string, User>,
    private idsOrder: string[],
    private playersData: Map<string, IUserSchema>,
    private interactions: Map<string, PokerInteractionContext>,
  ) {
    this.tableData = {
      lastDealerIndex: -1,
      mainInteraction: ctx.interaction,
    };
    this.roundData = this.setupTable();
  }

  private setupTable(): PokerRoundData {
    const cards = [...BLACKJACK_CARDS].sort(() => Math.random() - 0.5);

    console.log(this.playersData, this.interactions);

    const getNextIndex = (afterDealer: number): number => {
      const index = this.tableData.lastDealerIndex + afterDealer;
      return index % this.idsOrder.length;
    };

    const userHands = new Map<string, number[]>();

    this.idsOrder.forEach((id) => {
      userHands.set(id, cards.splice(0, 2));
    });

    const dealerId = this.idsOrder[getNextIndex(1)];
    const smallBlindId = this.idsOrder[getNextIndex(2)];
    const bigBlindId = this.idsOrder.length > 2 ? this.idsOrder[getNextIndex(3)] : null;

    this.tableData.lastDealerIndex = getNextIndex(1);

    return {
      dealerId,
      smallBlindId,
      bigBlindId,
      cards,
      hands: userHands,
      currentPlay: 'PRE-FLOP',
      currentPlayer: smallBlindId,
    };
  }

  async startRound(): Promise<void> {
    const mainEmbed = new MessageEmbed()
      .setTitle(this.ctx.locale('commands:poker.match.main-message.embed-title'))
      .setColor(COLORS.Poker)
      .setDescription(
        this.ctx.locale('commands:poker.match.main-message.embed-description', {
          action: this.ctx.locale(`commands:poker.round-actions.${this.roundData.currentPlay}`),
          user: this.players.get(this.roundData.currentPlayer)?.username,
          dealer: `<@${this.roundData.dealerId}>`,
          smallBlind: `<@${this.roundData.smallBlindId}>`,
          bigBlind: this.roundData.bigBlindId ? `<@${this.roundData.bigBlindId}>` : '-',
        }),
      )
      .setThumbnail(
        this.players.get(this.roundData.currentPlayer)!.displayAvatarURL({ dynamic: true }),
      );

    this.ctx.makeMessage({ content: null, embeds: [mainEmbed] });
  }
}
