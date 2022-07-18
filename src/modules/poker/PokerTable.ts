/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BLACKJACK_CARDS, COLORS, emojis } from '@structures/Constants';
import { actionRow, resolveCustomId, toWritableUTF } from '@utils/Util';
import { requestVangoghImage, VangoghRoutes } from '@utils/VangoghRequests';
import {
  Collection,
  CommandInteraction,
  InteractionCollector,
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  Modal,
  TextInputComponent,
  User,
} from 'discord.js-light';
import { getFixedT } from 'i18next';
import MenheraClient from 'MenheraClient';
import { Hand } from 'pokersolver';
import PokerInteractionContext from './PokerInteractionContext';
import { getPokerCard } from './PokerUtils';
import {
  PokerPlayAction,
  PokerPlayerData,
  PokerRoundData,
  PokerTableData,
  PokerUserData,
} from './types';

const getNextPlayerIndex = (ids: string[], current: string) => {
  const index = ids.indexOf(current) + 1;
  return index % ids.length;
};

export default class PokerTable {
  private roundData: PokerRoundData;

  private tableData: PokerTableData;

  private needToBet = true;

  private Collector: InteractionCollector<MessageComponentInteraction>;

  constructor(
    private ctx: PokerInteractionContext,
    private players: Map<string, User>,
    private idsOrder: string[],
    private playersData: Map<string, PokerUserData>,
    private interactions: Collection<string, PokerInteractionContext>,
  ) {
    this.tableData = {
      inGame: true,
      lastDealerIndex: -1,
      mainInteraction: ctx.interaction as CommandInteraction & { client: MenheraClient },
      blindBet: 1000,
      quittedPlayers: [],
    };
    this.roundData = this.setupTable();
    this.Collector = this.startCollector();
    this.listenToInteractions();
    this.makeMainMessage();
  }

  private get playersPlaying(): string[] {
    return this.idsOrder.filter((id) => !this.tableData.quittedPlayers.includes(id));
  }

  private listenToInteractions(): void {
    this.Collector.on('collect', async (interaction) => {
      const interactionType = resolveCustomId(interaction.customId);

      if (interactionType === 'CONTROL') {
        this.makeControlMessage(interaction.user.id, interaction);
        return;
      }

      if (
        !this.tableData.inGame &&
        interaction.user.id !== this.tableData.mainInteraction.user.id
      ) {
        interaction
          .reply({
            ephemeral: true,
            content: getFixedT(interaction.locale)('common:not-your-interaction'),
          })
          .catch(() => null);
        return;
      }

      if (interaction.user.id !== this.roundData.currentPlayer && this.tableData.inGame) {
        interaction
          .reply({
            ephemeral: true,
            content: getFixedT(interaction.locale)('commands:poker.match.replies.not-turn', {
              user: this.players.get(this.roundData.currentPlayer)?.username,
            }),
          })
          .catch(() => null);
        return;
      }

      if (interactionType === 'EXIT') {
        if (interaction.user.id === this.tableData.mainInteraction.user.id) {
          interaction
            .reply({
              ephemeral: true,
              content: getFixedT(interaction.locale)(
                'commands:poker.match.replies.owner-cant-exit-table',
              ),
            })
            .catch(() => null);
          return;
        }

        this.tableData.mainInteraction.client.repositories.pokerRepository.removeUserFromPokerMatch(
          interaction.user.id,
        );
        this.tableData.mainInteraction.client.repositories.starRepository.add(
          interaction.user.id,
          this.playersData.get(interaction.user.id)!.estrelinhas,
        );
        this.interactions.delete(interaction.user.id);
        this.tableData.quittedPlayers.push(interaction.user.id);
        this.executePlay('FOLD', interaction);
        return;
      }

      if (interactionType === 'TABLE-NEXT') {
        this.roundData = this.setupTable();
        interaction.deferUpdate();
        this.makeMainMessage();
        return;
      }

      if (interactionType === 'TABLE-STOP') {
        interaction.deferUpdate();
        this.closeTable();
        return;
      }

      if (!this.tableData.inGame) return;

      this.executePlay(interactionType as PokerPlayAction, interaction);
    });
  }

  private setupTable(): PokerRoundData {
    const cards = [...BLACKJACK_CARDS].sort(() => Math.random() - 0.5);

    const getNextIndex = (afterDealer: number): number => {
      const index = this.tableData.lastDealerIndex + afterDealer;
      const toReturn =
        index % this.idsOrder.filter((a) => !this.tableData.quittedPlayers.includes(a)).length;

      if (toReturn === this.tableData.lastDealerIndex) {
        return getNextIndex(afterDealer + 1);
      }

      return toReturn;
    };

    const dealerId = this.idsOrder[getNextIndex(1)];
    const smallBlindId = this.idsOrder[getNextIndex(2)];
    const bigBlindId = this.playersPlaying.length > 2 ? this.idsOrder[getNextIndex(3)] : null;

    this.playersData.get(smallBlindId)!.estrelinhas -= this.tableData.blindBet * 0.5;
    if (bigBlindId) this.playersData.get(bigBlindId)!.estrelinhas -= this.tableData.blindBet;

    const roundPlayersData = new Map<string, PokerPlayerData>();

    this.playersPlaying.forEach((id) => {
      const userHand = cards.splice(0, 2);

      roundPlayersData.set(id, { hand: userHand, folded: false, allIn: false });
    });

    this.tableData.lastDealerIndex = getNextIndex(1);
    this.tableData.inGame = true;
    this.needToBet = true;

    return {
      dealerId,
      smallBlindId,
      bigBlindId,
      cards,
      comunityCards: [],
      players: roundPlayersData,
      currentAction: 'PRE-FLOP',
      currentPlayer: this.idsOrder[getNextIndex(bigBlindId ? 3 : 2)],
      lastPlayer: this.playersPlaying[this.playersPlaying.length - 1],
      currentBet: this.tableData.blindBet,
      pot: this.tableData.blindBet * (bigBlindId ? 1.5 : 0.5),
      lastPlayerToPlay: dealerId,
    };
  }

  private startCollector(): InteractionCollector<MessageComponentInteraction> {
    return new InteractionCollector(this.ctx.interaction.client, {
      interactionType: 'MESSAGE_COMPONENT',
      filter: (interaction) => {
        let didPass =
          interaction.customId.startsWith(this.ctx.interaction.id) ||
          this.interactions.some((val) => interaction.customId.startsWith(val.interaction.id));

        if (!this.idsOrder.includes(interaction.user.id)) {
          didPass = false;
          interaction
            .reply({
              ephemeral: true,
              content: getFixedT(interaction.locale)('common:not-your-interaction'),
            })
            .catch(() => null);
        }

        if (this.tableData.quittedPlayers.includes(interaction.user.id)) {
          didPass = false;
          interaction
            .reply({
              ephemeral: true,
              content: getFixedT(interaction.locale)('commands:poker.match.replies.quitted'),
            })
            .catch(() => null);
        }

        return didPass;
      },
    });
  }

  private async makeControlMessage(
    requestUser: string,
    interaction: MessageComponentInteraction,
  ): Promise<void> {
    if (!this.tableData.inGame || this.roundData.players.get(requestUser)!.folded) {
      interaction
        .reply({
          ephemeral: true,
          content: getFixedT(interaction.locale)(
            'commands:poker.match.replies.cannot-request-control',
          ),
        })
        .catch(() => null);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(this.ctx.locale('commands:poker.match.control-message.embed-title'))
      .setDescription(
        this.roundData.players
          .get(requestUser)!
          .hand.map((cardId) => {
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
      .setCustomId(`${interaction.id} | ALL-IN`)
      .setStyle('SECONDARY')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.allin-button'));

    const exitButton = new MessageButton()
      .setCustomId(`${interaction.id} | EXIT`)
      .setStyle('DANGER')
      .setLabel(userInteraction.locale('commands:poker.match.control-message.exit-button'));

    const image = await requestVangoghImage(VangoghRoutes.POKER_HAND, {
      cards: this.roundData.players.get(requestUser)!.hand,
      theme: this.playersData.get(requestUser)!.cardTheme,
    });

    if (!image.err) embed.setImage(`attachment://poker-${this.ctx.interaction.id}.png`);

    userInteraction.makeMessage({
      ephemeral: true,
      attachments: [],
      files: image.err
        ? []
        : [new MessageAttachment(image.data, `poker-${this.ctx.interaction.id}.png`)],
      embeds: [embed],
      components: [
        actionRow([allInButton, raiseButton, callButton, checkButton, foldButton]),
        actionRow([exitButton]),
      ],
    });
  }

  private async makeMainMessage(): Promise<void> {
    const mainEmbed = new MessageEmbed()
      .setTitle(this.ctx.locale('commands:poker.match.main-message.embed-title'))
      .setColor(COLORS.Poker)
      .setDescription(
        this.ctx.locale('commands:poker.match.main-message.embed-description', {
          action: this.ctx.locale(`commands:poker.round-actions.${this.roundData.currentAction}`),
          user: this.players.get(this.roundData.currentPlayer)?.username,
          dealer: this.players.get(this.roundData.dealerId)?.username,
          smallBlind: this.players.get(this.roundData.smallBlindId)?.username,
          bigBlind: this.roundData.bigBlindId
            ? this.players.get(this.roundData.bigBlindId)?.username
            : '-',
          pot: this.roundData.pot,
          cards: this.roundData.comunityCards
            .map((cardId) => {
              const card = getPokerCard(cardId);

              return `${card.displayValue} ${emojis[`suit_${card.suit}`]}`;
            })
            .join(' | '),
        }),
      )
      .setThumbnail(
        this.players.get(this.roundData.currentPlayer)!.displayAvatarURL({ dynamic: true }),
      );

    const requestControlMessage = new MessageButton()
      .setCustomId(`${this.ctx.interaction.id} | CONTROL`)
      .setStyle('SECONDARY')
      .setEmoji('🎮')
      .setLabel(this.ctx.locale('commands:poker.match.main-message.request-control'));

    const usersDataToVangogh = [...this.roundData.players].map((u) => {
      const [userId, userData] = u;

      return {
        avatar: this.players.get(userId)?.displayAvatarURL({ size: 256 }),
        name: toWritableUTF(this.players.get(userId)?.username ?? '???'),
        fold: userData.folded,
        chips: this.playersData.get(userId)!.estrelinhas,
        dealer: userId === this.roundData.dealerId,
        theme: this.playersData.get(userId)!.backgroundTheme,
      };
    });

    const image = await requestVangoghImage(VangoghRoutes.POKER, {
      cards: this.roundData.comunityCards,
      pot: this.roundData.pot,
      users: usersDataToVangogh,
    });

    if (!image.err) mainEmbed.setImage(`attachment://poker-${this.ctx.interaction.id}.png`);

    this.ctx.makeMessage({
      content: null,
      attachments: [],
      embeds: [mainEmbed],
      files: image.err
        ? []
        : [new MessageAttachment(image.data, `poker-${this.ctx.interaction.id}.png`)],
      components: [actionRow([requestControlMessage])],
    });
  }

  private checkGameCanContinue(): boolean {
    if (this.playersPlaying.length < 2) return true;
    return false;

    // TODO: Make this work, checking user money and amonut of users
  }

  private async closeTable(): Promise<void> {
    this.Collector.stop();
    this.playersData.forEach((a) => {
      if (this.tableData.quittedPlayers.includes(a.id)) return;

      this.tableData.mainInteraction.client.repositories.starRepository.add(a.id, a.estrelinhas);
      this.tableData.mainInteraction.client.repositories.pokerRepository.removeUserFromPokerMatch(
        a.id,
      );
    });

    this.interactions.forEach((a) =>
      a.interaction
        .editReply({
          components: [],
          embeds: [],
          attachments: [],
          content: a.prettyResponse(
            'ok',
            'commands:poker.match.control-message.can-close-ephemeral',
          ),
        })
        .catch(() => null),
    );

    this.ctx.makeMessage({
      content: this.ctx.prettyResponse('wink', 'commands:poker.match.replies.table-close'),
      components: [],
      attachments: [],
      embeds: [],
    });
  }

  private async changeRoundAction(): Promise<void> {
    switch (this.roundData.currentAction) {
      case 'PRE-FLOP': {
        this.roundData.currentAction = 'FLOP';
        this.roundData.comunityCards = this.roundData.cards.splice(0, 3);
        break;
      }
      case 'FLOP': {
        this.roundData.currentAction = 'TURN';
        this.roundData.comunityCards.push(...this.roundData.cards.splice(0, 1));
        break;
      }
      case 'TURN': {
        this.roundData.currentAction = 'RIVER';
        this.roundData.comunityCards.push(...this.roundData.cards.splice(0, 1));
        break;
      }
      case 'RIVER': {
        this.roundData.currentAction = 'SHOWDOWN';
        break;
      }
    }
  }

  private async finishRound(winners: string[], winReason: string): Promise<void> {
    const moneyForEach = Math.floor(this.roundData.pot / winners.length);
    winners.forEach((a) => {
      this.playersData.get(a)!.estrelinhas += moneyForEach;
    });

    this.tableData.inGame = false;

    const continueButton = new MessageButton()
      .setCustomId(`${this.ctx.interaction.id} | TABLE-NEXT`)
      .setLabel(this.ctx.locale('commands:poker.match.main-message.next-table'))
      .setStyle('PRIMARY');

    const stopButton = new MessageButton()
      .setCustomId(`${this.ctx.interaction.id} | TABLE-STOP`)
      .setLabel(this.ctx.locale('commands:poker.match.main-message.stop-table'))
      .setStyle('DANGER');

    this.interactions.forEach((a) =>
      a.interaction
        .editReply({
          components: [],
          content: a.prettyResponse(
            'ok',
            'commands:poker.match.control-message.can-close-ephemeral',
          ),
        })
        .catch(() => null),
    );

    const embed = new MessageEmbed()
      .setTitle(this.ctx.locale('commands:poker.match.main-message.embed-title'))
      .setDescription(
        this.ctx.locale('commands:poker.match.main-message.round-finished', {
          winner: winners.map((winner) => this.players.get(winner)?.username).join(', '),
          chips: moneyForEach,
          reason: this.ctx.locale(`commands:poker.match.win-reasons.${winReason as 'FOLD'}`),
        }),
      )
      .setColor(this.playersData.get(winners[0])!.selectedColor)
      .setImage(`attachment://poker-${this.ctx.interaction.id}.png`);

    this.ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([continueButton, stopButton])],
    });
  }

  private async showdown(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersHands = [...this.roundData.players].reduce<{ hand: any; userId: string }[]>(
      (p, c) => {
        const userData = c[1];
        if (userData.folded) return p;

        const cardsToUse = [
          ...userData.hand.map((a) => getPokerCard(a).solverValue),
          ...this.roundData.comunityCards.map((a) => getPokerCard(a).solverValue),
        ];

        const hand = Hand.solve(cardsToUse);

        p.push({ hand, userId: c[0] });
        return p;
      },
      [],
    );

    const winners = Hand.winners(usersHands.map((a) => a.hand)).map(
      (a: { cards: unknown; suits: unknown }) =>
        usersHands.find((b) => b.hand.cards === a.cards && b.hand.suits === a.suits),
    );

    const winReason = winners[0].hand.descr.includes('Royal Flush')
      ? 'STRAIGHT-FLUSH-ROYAL'
      : winners[0].hand.name.replace(' ', '-').toUpperCase();

    this.finishRound(
      winners.map((a: { userId: string }) => a.userId),
      winReason,
    );
  }

  private async changePlayer(): Promise<void> {
    const willGameEnd = this.checkGameCanContinue();

    if (willGameEnd) return this.closeTable();

    let { currentPlayer } = this.roundData;

    if (
      currentPlayer === this.roundData.lastPlayerToPlay &&
      (this.roundData.currentAction === 'PRE-FLOP' || !this.needToBet)
    )
      await this.changeRoundAction();

    if (this.roundData.currentAction === 'SHOWDOWN') return this.showdown();

    do {
      currentPlayer = this.idsOrder[getNextPlayerIndex(this.idsOrder, currentPlayer)];
    } while (
      this.roundData.players.get(currentPlayer)!.folded ||
      this.tableData.quittedPlayers.includes(currentPlayer)
    );

    this.roundData.currentPlayer = currentPlayer;

    const foldedPlayers = [...this.roundData.players].filter((a) => a[1].folded);

    if (foldedPlayers.length === this.roundData.players.size - 1)
      return this.finishRound([this.roundData.currentPlayer], 'FOLD');

    this.makeMainMessage();
  }

  private async executePlay(
    play: PokerPlayAction,
    interaction: MessageComponentInteraction,
  ): Promise<void> {
    switch (play) {
      case 'FOLD': {
        if (!interaction.replied) interaction.update({ components: [] }).catch(() => null);
        else interaction.editReply({ components: [] }).catch(() => null);

        this.roundData.players.get(this.roundData.currentPlayer)!.folded = true;
        this.changePlayer();
        break;
      }
      case 'CHECK': {
        if (this.needToBet) {
          interaction
            .reply({
              content: this.ctx.prettyResponse(
                'error',
                'commands:poker.match.replies.call-or-raise',
              ),
              ephemeral: true,
            })
            .catch(() => null);
          break;
        }

        interaction.deferUpdate().catch(() => null);
        this.changePlayer();
        break;
      }
      case 'CALL': {
        if (!this.needToBet) {
          interaction
            .reply({
              content: this.ctx.prettyResponse(
                'error',
                'commands:poker.match.replies.not-active-bet',
              ),
              ephemeral: true,
            })
            .catch(() => null);
          break;
        }

        if (
          this.roundData.currentBet >
          this.playersData.get(this.roundData.currentPlayer)!.estrelinhas
        )
          return this.executePlay('ALL-IN', interaction);

        interaction.deferUpdate().catch(() => null);

        if (
          this.roundData.smallBlindId === this.roundData.currentPlayer &&
          this.roundData.currentAction === 'FLOP' &&
          this.roundData.currentBet === this.tableData.blindBet
        ) {
          this.playersData.get(this.roundData.currentPlayer)!.estrelinhas -=
            this.tableData.blindBet * 0.5;

          this.roundData.pot += this.tableData.blindBet * 0.5;
          this.needToBet = false;
          this.changePlayer();
          break;
        }

        this.playersData.get(this.roundData.currentPlayer)!.estrelinhas -=
          this.roundData.currentBet;

        this.roundData.pot += this.roundData.currentBet;

        if (
          this.roundData.currentPlayer === this.roundData.lastPlayerToPlay &&
          this.roundData.currentAction !== 'PRE-FLOP'
        )
          this.needToBet = false;

        this.changePlayer();
        break;
      }
      case 'ALL-IN': {
        this.roundData.pot += this.playersData.get(this.roundData.currentPlayer)!.estrelinhas;
        this.roundData.currentBet = this.playersData.get(this.roundData.currentPlayer)!.estrelinhas;
        this.playersData.get(this.roundData.currentPlayer)!.estrelinhas = 0;
        this.roundData.players.get(this.roundData.currentPlayer)!.allIn = true;
        this.needToBet = true;
        interaction.deferUpdate().catch(() => null);
        this.changePlayer();
        break;
      }
      case 'RAISE': {
        const modal = new Modal()
          .setCustomId(`${interaction.id} | MODAL`)
          .setTitle(this.ctx.locale('commands:poker.match.control-message.raise-modal-title'));

        const input = new TextInputComponent()
          .setCustomId('RAISE')
          .setLabel(
            this.ctx.locale('commands:poker.match.control-message.raise-modal-label', {
              minBet: this.roundData.currentBet,
            }),
          )
          .setStyle('SHORT')
          .setRequired(true);

        modal.addComponents({ type: 1, components: [input] });

        interaction.showModal(modal).catch(() => null);

        const result = await interaction
          .awaitModalSubmit({
            time: 15_000,
            filter: (int) => int.customId.startsWith(interaction.id),
          })
          .catch(() => null);

        if (!result) return this.executePlay('FOLD', interaction);

        const userInput = result.fields.getTextInputValue('RAISE');

        const polishedNumber = parseInt(userInput, 10);

        if (Number.isNaN(polishedNumber)) {
          result.reply({
            ephemeral: true,
            content: this.ctx.prettyResponse('error', 'commands:poker.match.replies.raise-nan'),
          });
          return;
        }

        if (polishedNumber <= this.roundData.currentBet) {
          result.reply({
            ephemeral: true,
            content: this.ctx.prettyResponse('error', 'commands:poker.match.replies.raise-too-low'),
          });
          return;
        }

        if (polishedNumber >= this.playersData.get(this.roundData.currentPlayer)!.estrelinhas) {
          result.reply({
            ephemeral: true,
            content: this.ctx.prettyResponse(
              'error',
              'commands:poker.match.replies.raise-too-high',
            ),
          });
          return;
        }

        if (
          this.roundData.currentBet === polishedNumber &&
          this.roundData.currentPlayer === this.roundData.lastPlayerToPlay
        )
          this.needToBet = false;
        else this.needToBet = true;

        this.roundData.currentBet = polishedNumber;
        this.playersData.get(this.roundData.currentPlayer)!.estrelinhas -= polishedNumber;
        this.roundData.pot += polishedNumber;
        result.deferUpdate().catch(() => null);
        this.changePlayer();
        break;
      }
    }
  }
}
