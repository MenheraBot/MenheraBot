/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IUserSchema } from '@custom_types/Menhera';
import { BLACKJACK_CARDS, COLORS, emojis } from '@structures/Constants';
import { actionRow, resolveCustomId } from '@utils/Util';
import {
  Collection,
  InteractionCollector,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  User,
} from 'discord.js-light';
import { getFixedT } from 'i18next';
import PokerInteractionContext from './PokerInteractionContext';
import { getPokerCard } from './PokerUtils';
import { PokerPlayAction, PokerRoundData, PokerTableData } from './types';

export default class PokerTable {
  private roundData: PokerRoundData;

  private tableData: PokerTableData;

  private Collector: InteractionCollector<MessageComponentInteraction>;

  constructor(
    private ctx: PokerInteractionContext,
    private players: Map<string, User>,
    private idsOrder: string[],
    private playersData: Map<string, IUserSchema>,
    private interactions: Collection<string, PokerInteractionContext>,
  ) {
    this.tableData = {
      lastDealerIndex: -1,
      mainInteraction: ctx.interaction,
    };
    this.roundData = this.setupTable();
    this.Collector = this.startCollector();
    this.listenToInteractions();
  }

  private listenToInteractions(): void {
    this.Collector.on('collect', async (interaction) => {
      const interactionType = resolveCustomId(interaction.customId);

      if (interactionType === 'CONTROL') {
        this.makeControlMessage(interaction.user.id, interaction);
        return;
      }

      if (interaction.user.id !== this.roundData.currentPlayer) {
        interaction
          .reply({
            ephemeral: true,
            content: getFixedT(interaction.locale)('commands:poker.match.not-turn', {
              user: this.players.get(this.roundData.currentPlayer)?.username,
            }),
          })
          .catch(() => null);
        return;
      }

      if (interactionType === 'EXIT') {
        this.executePlay('FOLD');
        this.players.delete(interaction.user.id);
        this.interactions.delete(interaction.user.id);
        this.idsOrder.splice(this.idsOrder.indexOf(interaction.user.id), 1);
        this.playersData.delete(interaction.user.id);
        return;
      }

      this.executePlay(interactionType as PokerPlayAction);
    });
  }

  private setupTable(): PokerRoundData {
    const cards = [...BLACKJACK_CARDS].sort(() => Math.random() - 0.5);

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

  private startCollector(): InteractionCollector<MessageComponentInteraction> {
    return new InteractionCollector(this.ctx.interaction.client, {
      filter: (interaction) => {
        const didPass =
          (interaction.customId.startsWith(this.ctx.interaction.id) &&
            this.idsOrder.includes(interaction.user.id)) ||
          this.interactions.some((val) => interaction.customId.startsWith(val.interaction.id));

        if (!this.idsOrder.includes(interaction.user.id)) {
          interaction
            .reply({
              ephemeral: true,
              content: getFixedT(interaction.locale)('common:not-your-interaction'),
            })
            .catch(() => null);
        }

        return didPass;
      },
    });
  }

  private makeControlMessage(requestUser: string, interaction: MessageComponentInteraction): void {
    const embed = new MessageEmbed()
      .setTitle(this.ctx.locale('commands:poker.match.control-message.embed-title'))
      .setDescription(
        this.roundData.hands
          .get(requestUser)!
          .map((cardId) => {
            const card = getPokerCard(cardId);

            return `${card.displayValue} ${emojis[`suit_${card.suit}`]}`;
          })
          .join(' | '),
      )
      .setColor(this.playersData.get(requestUser)!.selectedColor);

    const userInteraction = this.interactions.get(requestUser)!;
    userInteraction.updateInteraction(interaction);

    const foldButton = new MessageButton()
      .setCustomId(`${interaction.id} | FOLD`)
      .setStyle('DANGER')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.fold-button'));

    const checkButton = new MessageButton()
      .setCustomId(`${interaction.id} | CHECK`)
      .setStyle('PRIMARY')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.check-button'));

    const callButton = new MessageButton()
      .setCustomId(`${interaction.id} | CALL`)
      .setStyle('PRIMARY')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.call-button'));

    const raiseButton = new MessageButton()
      .setCustomId(`${interaction.id} | RAISE`)
      .setStyle('SECONDARY')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.raise-button'));

    const allInButton = new MessageButton()
      .setCustomId(`${interaction.id} | ALLIN`)
      .setStyle('SECONDARY')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.allin-button'));

    const exitButton = new MessageButton()
      .setCustomId(`${interaction.id} | EXIT`)
      .setStyle('DANGER')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.exit-button'));

    userInteraction.makeMessage({
      ephemeral: true,
      embeds: [embed],
      components: [
        actionRow([allInButton, raiseButton, callButton, checkButton, foldButton]),
        actionRow([exitButton]),
      ],
    });
  }

  async startRound(): Promise<void> {
    const mainEmbed = new MessageEmbed()
      .setTitle(this.ctx.locale('commands:poker.match.main-message.embed-title'))
      .setColor(COLORS.Poker)
      .setDescription(
        this.ctx.locale('commands:poker.match.main-message.embed-description', {
          action: this.ctx.locale(`commands:poker.round-actions.${this.roundData.currentPlay}`),
          user: this.players.get(this.roundData.currentPlayer)?.username,
          dealer: this.players.get(this.roundData.dealerId)?.username,
          smallBlind: this.players.get(this.roundData.smallBlindId)?.username,
          bigBlind: this.roundData.bigBlindId
            ? this.players.get(this.roundData.bigBlindId)?.username
            : '-',
        }),
      )
      .setThumbnail(
        this.players.get(this.roundData.currentPlayer)!.displayAvatarURL({ dynamic: true }),
      );

    // TODO: Add VanGogh Image

    const requestControlMessage = new MessageButton()
      .setCustomId(`${this.ctx.interaction.id} | CONTROL`)
      .setStyle('SECONDARY')
      .setEmoji('🎮')
      .setLabel(this.ctx.locale('commands:poker.match.main-message.request-control'));

    this.ctx.makeMessage({
      content: null,
      embeds: [mainEmbed],
      components: [actionRow([requestControlMessage])],
    });
  }

  private async checkGameCanContinue(): Promise<boolean> {
    if (this.idsOrder.length < 2) return false;
    return true;

    // TODO: Make this work, checking user money and amonut of users
  }

  private async changePlayer(): Promise<void> {
    const { currentPlayer } = this.roundData;
    const nextPlayer = this.idsOrder[getNextIndex(this.idsOrder.indexOf(currentPlayer) + 1)];

    this.roundData.currentPlayer = nextPlayer;
  }

  private async executePlay(play: PokerPlayAction): Promise<void> {
    // TODO: HANDLE PLAYS HERE
    console.llog(this.Collector);
  }
}
