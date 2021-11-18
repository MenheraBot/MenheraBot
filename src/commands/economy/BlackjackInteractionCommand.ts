/* eslint-disable no-unused-expressions */
import { MessageAttachment, MessageButton, MessageEmbed } from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import http from '@utils/HTTPrequests';
import { IBlackjackCards } from 'types/Types';
import { BLACKJACK_CARDS, emojis } from '@structures/Constants';
import Util, { resolveCustomId } from '@utils/Util';

const CalculateHandValue = (cards: Array<number>): Array<IBlackjackCards> =>
  cards.reduce((p: Array<IBlackjackCards>, c: number) => {
    const multiplier = Math.floor(c / 13);
    const newC = c - (multiplier * 13 - 1);

    p.push({
      value: newC > 10 ? 10 : newC,
      isAce: newC === 1,
      id: c,
    });

    return p;
  }, []);

export default class BlackjackInteractionCommand extends InteractionCommand {
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
        },
      ],
      category: 'economy',
      cooldown: 10,
      authorDataFields: ['selectedColor', 'estrelinhas'],
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

    const newCard = matchCards.shift() as number;
    const playerCards = [...usrCards, newCard];

    const userCards = CalculateHandValue(playerCards);
    const userTotal = BlackjackInteractionCommand.checkHandFinalValue(userCards);

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'blackjack',
          data: {
            userCards,
            menheraCards: CalculateHandValue(dealerCards).map((a, i) => {
              if (i === 1) {
                a.hidden = true;
              }
              return a;
            }),
            userTotal,
            menheraTotal: BlackjackInteractionCommand.checkHandFinalValue(
              CalculateHandValue([dealerCards[0]]),
            ),
            i18n: {
              yourHand: ctx.locale('commands:blackjack.your-hand'),
              dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
            },
            aposta: valor,
          },
        })
      : await http.blackjackRequest(
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

    const message = await ctx.channel.messages
      .fetch((await ctx.interaction.fetchReply()).id)
      .catch(() => null);
    if (message) message.removeAttachments();

    if (!res.err) {
      const timestamp = Date.now();
      const attachment = new MessageAttachment(res.data, `blackjack-${timestamp}.png`);
      embed.setImage(`attachment://blackjack-${timestamp}.png`);

      message
        ? await message.edit({
            embeds: [embed],
            files: [attachment],
            components: [{ type: 1, components: [BuyButton, StopButton] }],
          })
        : await ctx.send({
            embeds: [embed],
            files: [attachment],
            components: [{ type: 1, components: [BuyButton, StopButton] }],
          });
    } else {
      message
        ? await message.edit({
            embeds: [embed],
            components: [{ type: 1, components: [BuyButton, StopButton] }],
          })
        : await ctx.send({
            embeds: [embed],
            components: [{ type: 1, components: [BuyButton, StopButton] }],
          });
    }

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
        BlackjackInteractionCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
        return;
      }
      BlackjackInteractionCommand.continueFromBuy(ctx, valor, dealerCards, playerCards, matchCards);
      return;
    }

    BlackjackInteractionCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
  }

  static checkHandFinalValue(cards: Array<IBlackjackCards>): number {
    let total: number;

    const baseSum = cards.reduce((p, a) => a.value + p, 0);

    if (cards.some((a) => a.isAce) && baseSum <= 11) {
      total = cards.reduce((p, a) => (a.isAce && p <= 10 ? 11 : a.value) + p, 0);
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
          },
        })
      : await http.blackjackRequest(valor, userCards, dealerCards, userTotal, menheraTotal, true, {
          yourHand: ctx.locale('commands:blackjack.your-hand'),
          dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
        });

    let attc: MessageAttachment | null = null;

    const message = await ctx.channel.messages
      .fetch((await ctx.interaction.fetchReply()).id)
      .catch(() => null);
    if (message) message.removeAttachments();

    if (!res.err) {
      const timestamp = Date.now();
      attc = new MessageAttachment(res.data, `blackjack-${timestamp}.png`);
      embed.setImage(`attachment://blackjack-${timestamp}.png`);
    }

    if (userTotal === 21 && playerCards.length === 2) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.blackjack', { value: valor * 4 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.author.id, valor * 2);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
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
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
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
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (menheraTotal <= 17 || menheraTotal < userTotal) {
      do {
        const newCards = CalculateHandValue(matchCards.splice(0, 1));
        dealerCards.push(...newCards);
        menheraTotal = BlackjackInteractionCommand.checkHandFinalValue(dealerCards);
      } while (menheraTotal <= 17 && menheraTotal < userTotal);
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
          },
        })
      : await http.blackjackRequest(valor, userCards, dealerCards, userTotal, menheraTotal, true, {
          yourHand: ctx.locale('commands:blackjack.your-hand'),
          dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
        });

    if (!newRes.err) {
      const timestamp = Date.now();
      attc = new MessageAttachment(
        Buffer.from(newRes.data as Buffer),
        `blackjack-${timestamp}.png`,
      );
      embed.setImage(`attachment://blackjack-${timestamp}.png`);
    }

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-21'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (userTotal === 21 && menheraTotal !== 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.user-21', { value: valor * 2 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.author.id, valor);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, true, valor * 2);
      return;
    }

    if (menheraTotal > 21 && userTotal <= 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bust', { value: valor * 2 }),
      );
      await ctx.client.repositories.starRepository.add(ctx.author.id, valor);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, true, valor * 2);
      return;
    }

    if (menheraTotal > 21 && userTotal > 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.draw'),
      );
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      return;
    }

    if (menheraTotal === 21 && userTotal === 21) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.both-21'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (menheraTotal === userTotal) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.equal'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    if (menheraTotal > userTotal) {
      embed.addField(
        ctx.locale('commands:blackjack.result'),
        ctx.locale('commands:blackjack.menhera-bigger'),
      );
      await ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
      if (attc) {
        message
          ? await message.edit({ embeds: [embed], files: [attc], components: [] })
          : ctx.send({ embeds: [embed], files: [attc], components: [] });
      } else {
        message
          ? await message.edit({ embeds: [embed], components: [] })
          : ctx.send({ embeds: [embed], components: [] });
      }
      await http.postBlackJack(ctx.author.id, false, valor * 2);
      return;
    }

    embed.addField(
      ctx.locale('commands:blackjack.result'),
      ctx.locale('commands:blackjack.user-bigger', { value: valor * 2 }),
    );
    await ctx.client.repositories.starRepository.add(ctx.author.id, valor);
    if (attc) {
      message
        ? await message.edit({ embeds: [embed], files: [attc], components: [] })
        : ctx.send({ embeds: [embed], files: [attc], components: [] });
    } else {
      message
        ? await message.edit({ embeds: [embed], components: [] })
        : ctx.send({ embeds: [embed], components: [] });
    }
    await http.postBlackJack(ctx.author.id, true, valor * 2);
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const valor = ctx.options.getInteger('aposta', true);
    if (!valor) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blackjack.bad-usage'),
        ephemeral: true,
      });
      return;
    }
    if (!valor || valor > 50000 || valor < 1000) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blackjack.invalid-value'),
        ephemeral: true,
      });
      return;
    }

    if (ctx.data.user.estrelinhas < valor) {
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

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'blackjack',
          data: {
            userCards: CalculateHandValue(playerCards),
            menheraCards: CalculateHandValue(dealerCards).map((a, i) => {
              if (i === 1) {
                a.hidden = true;
              }
              return a;
            }),
            userTotal: BlackjackInteractionCommand.checkHandFinalValue(
              CalculateHandValue(playerCards),
            ),
            menheraTotal: BlackjackInteractionCommand.checkHandFinalValue(
              CalculateHandValue([dealerCards[0]]),
            ),
            i18n: {
              yourHand: ctx.locale('commands:blackjack.your-hand'),
              dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
            },
            aposta: valor,
          },
        })
      : await http.blackjackRequest(
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
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ format: 'png', dynamic: true }));

    let attc: MessageAttachment | null = null;

    if (!res.err) {
      attc = new MessageAttachment(res.data, 'blackjack.png');
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
      await ctx.defer({
        embeds: [embed],
        files: [attc],
        components: [{ type: 1, components: [BuyButton, StopButton] }],
      });
    } else {
      await ctx.defer({
        embeds: [embed],
        components: [{ type: 1, components: [BuyButton, StopButton] }],
      });
    }

    const collected = await Util.collectComponentInteraction(ctx.channel, ctx.author.id, 10000);

    if (!collected) {
      ctx.interaction.editReply({
        content: `${emojis.error} ${ctx.locale('commands:blackjack.timeout')}`,
        embeds: [],
        attachments: [],
        components: [],
      });
      ctx.client.repositories.starRepository.remove(ctx.author.id, valor);
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
