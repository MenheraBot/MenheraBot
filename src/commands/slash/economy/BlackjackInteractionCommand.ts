import {
  ColorResolvable,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  TextBasedChannels,
} from 'discord.js';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import http from '@utils/HTTPrequests';
import { IBlackjackCards } from '@utils/Types';
import { BLACKJACK_CARDS } from '@structures/MenheraConstants';
import Util from '@utils/Util';

const CalculateHandValue = (cards: Array<number>): Array<IBlackjackCards> =>
  cards.reduce((p: Array<IBlackjackCards>, c: number) => {
    if (c <= 13) {
      p.push({
        value: c > 10 ? 10 : c,
        isAce: c === 1,
        id: c,
      });
    }

    if (c > 13 && c <= 26) {
      const newC = c - 13;
      p.push({
        value: newC > 10 ? 10 : newC,
        isAce: newC === 1,
        id: c,
      });
    }
    if (c > 26 && c <= 39) {
      const newC = c - 26;
      p.push({
        value: newC > 10 ? 10 : newC,
        isAce: newC === 1,
        id: c,
      });
    }
    if (c > 39 && c <= 52) {
      const newC = c - 39;
      p.push({
        value: newC > 10 ? 10 : newC,
        isAce: newC === 1,
        id: c,
      });
    }
    return p;
  }, []);

export default class BlackjackInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blackjack',
      description: '「🃏」・Disputa num jogo de BlackJack contra a Menhera',
      options: [
        {
          name: 'aposta',
          description: 'Valor da aposta',
          type: 4,
          required: true,
        },
      ],
      category: 'economy',
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  static async continueFromBuy(
    ctx: InteractionCommandContext,
    valor: number,
    dealerCards: Array<number>,
    usrCards: Array<number>,
    deckCards: Array<number>,
  ): Promise<void> {
    if (usrCards.length === 2) {
      const oldUserCards = CalculateHandValue(usrCards);
      const oldUserTotal = BlackjackInteractionCommand.checkHandFinalValue(oldUserCards);

      if (oldUserTotal >= 21)
        return BlackjackInteractionCommand.finishGame(ctx, valor, dealerCards, usrCards, deckCards);
    }

    const matchCards = deckCards;

    const newCard = matchCards.splice(0, 1);
    const playerCards = [...usrCards, ...newCard];

    const userCards = CalculateHandValue(playerCards);
    const userTotal = BlackjackInteractionCommand.checkHandFinalValue(userCards);

    const res = await http.blackjackRequest(
      valor,
      userCards,
      CalculateHandValue(dealerCards),
      userTotal,
      BlackjackInteractionCommand.checkHandFinalValue(CalculateHandValue([dealerCards[0]])),
      false,
      {
        yourHand: ctx.locale('commands:blackjack.your-hand'),
        dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
      },
    );

    const embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${CalculateHandValue(playerCards)
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${BlackjackInteractionCommand.checkHandFinalValue(
          CalculateHandValue(playerCards),
        )}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${CalculateHandValue([
          dealerCards[0],
        ])
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${BlackjackInteractionCommand.checkHandFinalValue(
          CalculateHandValue([dealerCards[0]]),
        )}\``,
      )
      .setFooter(ctx.locale('commands:blackjack.footer'))
      .setColor(ctx.data.user.cor as ColorResolvable)
      .setThumbnail(ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true }));

    const BuyButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id}|BUY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:blackjack.buy'));

    const StopButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id}|STOP`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:blackjack.stop'));

    if (!res.err) {
      const attachment = new MessageAttachment(Buffer.from(res.data as Buffer), 'blackjack.png');
      embed.setImage('attachment://blackjack.png');
      await ctx.editReply({
        embeds: [embed],
        files: [attachment],
        components: [{ type: 1, components: [BuyButton, StopButton] }],
      });
    } else {
      await ctx.editReply({
        embeds: [embed],
        components: [{ type: 1, components: [BuyButton, StopButton] }],
      });
    }

    const collected = await Util.collectComponentInteraction(
      ctx.interaction.channel as TextBasedChannels,
      ctx.interaction.user.id,
      10000,
    );

    if (!collected) {
      ctx.replyT('error', 'commands:blackjack.timeout');
      ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      return;
    }

    if (collected.customId === `${ctx.interaction.id}|BUY`) {
      if (userTotal >= 21) {
        BlackjackInteractionCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
        return;
      }
      BlackjackInteractionCommand.continueFromBuy(ctx, valor, dealerCards, playerCards, matchCards);
      return;
    }

    if (collected.customId === `${ctx.interaction.id}|STOP`) {
      BlackjackInteractionCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
    }
  }

  static checkHandFinalValue(cards: Array<IBlackjackCards>): number {
    let total: number;

    const baseSum = cards.reduce((p: number, a: IBlackjackCards) => a.value + p, 0);

    if (cards.some((a) => a.isAce) && baseSum < 10) {
      total = cards.reduce((p, a) => (a.isAce ? 11 : a.value) + p, 0);
    } else total = baseSum;

    return total;
  }

  static async finishGame(
    ctx: InteractionCommandContext,
    valor: number,
    menheraCards: number[],
    playerCards: number[],
    matchCards: number[],
  ): Promise<void> {
    const userCards = CalculateHandValue(playerCards);
    const dealerCards = CalculateHandValue(menheraCards);

    const userTotal = BlackjackInteractionCommand.checkHandFinalValue(userCards);
    let menheraTotal = BlackjackInteractionCommand.checkHandFinalValue(dealerCards);

    let embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${userCards
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${userTotal}\`\n${ctx.locale(
          'commands:blackjack.dealer-hand',
        )}: **${dealerCards.map((a) => `${a.value}`).join(', ')}** -> \`${menheraTotal}\``,
      )
      .setColor(ctx.data.user.cor as ColorResolvable)
      .setThumbnail(ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true }));

    const res = await http.blackjackRequest(
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
    );

    let attc: MessageAttachment | null = null;

    if (!res.err) {
      attc = new MessageAttachment(Buffer.from(res.data as Buffer), 'blackjack.png');
      embed.setImage('attachment://blackjack.png');
    }

    if (userTotal === 21 && playerCards.length === 2) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.blackjack', { value: valor * 4 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.interaction.user.id, valor * 2);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, true, valor * 2);
      return;
    }

    // Estourou
    if (userTotal > 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.explode'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, false, valor * 2);
      return;
    }

    // Continua

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bj'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, false, valor * 2);
      return;
    }

    if (menheraTotal < 17 || menheraTotal < userTotal) {
      do {
        const newCards = CalculateHandValue(matchCards.splice(0, 1));
        dealerCards.push(...newCards);
        menheraTotal = BlackjackInteractionCommand.checkHandFinalValue(dealerCards);
      } while (menheraTotal < 17 && menheraTotal < userTotal);
    }

    embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${userCards
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${userTotal}\`\n${ctx.locale(
          'commands:blackjack.dealer-hand',
        )}: **${dealerCards.map((a) => `${a.value}`).join(', ')}** -> \`${menheraTotal}\``,
      )
      .setColor(ctx.data.user.cor as ColorResolvable)
      .setThumbnail(ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true }));

    const newRes = await http.blackjackRequest(
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
    );

    if (!newRes.err) {
      attc = new MessageAttachment(Buffer.from(newRes.data as Buffer), 'blackjack.png');
      embed.setImage('attachment://blackjack.png');
    }

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-21'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, false, valor * 2);
      return;
    }

    if (userTotal === 21 && menheraTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.user-21', { value: valor * 2 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, true, valor * 2);
      return;
    }

    if (menheraTotal > 21 && userTotal <= 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bust', { value: valor * 2 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, true, valor * 2);
      return;
    }

    if (menheraTotal > 21 && userTotal > 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.draw'),
      );
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      return;
    }

    if (menheraTotal === 21 && userTotal === 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.both-21'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, false, valor * 2);
      return;
    }

    if (menheraTotal === userTotal) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.equal'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, false, valor * 2);
      return;
    }

    if (menheraTotal > userTotal) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bigger'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      if (attc) {
        await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
      } else {
        await ctx.editReply({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.interaction.user.id, false, valor * 2);
      return;
    }

    embed.addField(
      ctx.locale('commands:blackjack.result'),
      ctx.locale('commands:blackjack.user-bigger', { value: valor * 2 }),
    );
    await ctx.client.repositories.starRepository.add(ctx.interaction.user.id, valor);
    if (attc) {
      await ctx.editReply({ embeds: [embed], files: [attc], components: [] });
    } else {
      await ctx.editReply({ embeds: [embed], components: [] });
    }
    await http.postBlackJack(ctx.interaction.user.id, true, valor * 2);
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const valor = ctx.args[0].value as number;
    if (!valor) {
      await ctx.replyT('error', 'commands:blackjack.bad-usage', {}, true);
      return;
    }
    if (!valor || valor > 50000 || valor < 1000) {
      await ctx.replyT('error', 'commands:blackjack.invalid-value', {}, true);
      return;
    }

    if (ctx.data.user.estrelinhas < valor) {
      await ctx.replyT('error', 'commands:blackjack.poor', {}, true);
      return;
    }

    const matchCards = [...BLACKJACK_CARDS].sort(() => Math.random() - 0.5);

    const dealerCards = matchCards.splice(0, 2);
    const playerCards = matchCards.splice(0, 2);

    const res = await http.blackjackRequest(
      valor,
      CalculateHandValue(playerCards),
      CalculateHandValue(dealerCards),
      BlackjackInteractionCommand.checkHandFinalValue(CalculateHandValue(playerCards)),
      BlackjackInteractionCommand.checkHandFinalValue(CalculateHandValue([dealerCards[0]])),
      false,
      {
        yourHand: ctx.locale('commands:blackjack.your-hand'),
        dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
      },
    );

    const embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(
        `${ctx.locale('commands:blackjack.your-hand')}: **${CalculateHandValue(playerCards)
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${BlackjackInteractionCommand.checkHandFinalValue(
          CalculateHandValue(playerCards),
        )}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${CalculateHandValue([
          dealerCards[0],
        ])
          .map((a) => `${a.value}`)
          .join(', ')}** -> \`${BlackjackInteractionCommand.checkHandFinalValue(
          CalculateHandValue([dealerCards[0]]),
        )}\``,
      )
      .setFooter(ctx.locale('commands:blackjack.footer'))
      .setColor(ctx.data.user.cor as ColorResolvable)
      .setThumbnail(ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true }));

    let attc: MessageAttachment | null = null;

    if (!res.err) {
      attc = new MessageAttachment(Buffer.from(res.data as Buffer), 'blackjack.png');
      embed.setImage('attachment://blackjack.png');
    }

    const BuyButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id}|BUY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:blackjack.buy'));

    const StopButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id}|STOP`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:blackjack.stop'));

    if (attc) {
      await ctx.reply({
        embeds: [embed],
        files: [attc],
        components: [{ type: 1, components: [BuyButton, StopButton] }],
      });
    } else {
      await ctx.reply({
        embeds: [embed],
        components: [{ type: 1, components: [BuyButton, StopButton] }],
      });
    }

    const collected = await Util.collectComponentInteraction(
      ctx.interaction.channel as TextBasedChannels,
      ctx.interaction.user.id,
      10000,
    );

    if (!collected) {
      ctx.replyT('error', 'commands:blackjack.timeout');
      ctx.client.repositories.starRepository.remove(ctx.interaction.user.id, valor);
      return;
    }

    if (collected.customId === `${ctx.interaction.id}|BUY`) {
      BlackjackInteractionCommand.continueFromBuy(ctx, valor, dealerCards, playerCards, matchCards);
      return;
    }

    if (collected.customId === `${ctx.interaction.id}|STOP`) {
      BlackjackInteractionCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
    }
  }
}
