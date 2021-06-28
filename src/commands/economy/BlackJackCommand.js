const { BLACKJACK_CARDS } = require('@structures/MenheraConstants');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const NewHttp = require('@utils/NewHttp');
const Command = require('../../structures/command');

const CalculateHandValue = (cards) => {
  const realValue = cards.reduce((p, c) => {
    if (c <= 13) {
      p.push({
        value: (c > 10 ? 10 : c), isAce: (c === 1), id: c,
      });
    }

    if (c > 13 && c <= 26) {
      const newC = c - 13;
      p.push({
        value: (newC > 10 ? 10 : newC), isAce: (newC === 1), id: c,
      });
    }
    if (c > 26 && c <= 39) {
      const newC = c - 26;
      p.push({
        value: (newC > 10 ? 10 : newC), isAce: (newC === 1), id: c,
      });
    }
    if (c > 39 && c <= 52) {
      const newC = c - 39;
      p.push({
        value: (newC > 10 ? 10 : newC), isAce: (newC === 1), id: c,
      });
    }
    return p;
  }, []);
  return realValue;
};

module.exports = class BlackJackCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blackjack',
      aliases: ['bj', '21'],
      category: 'economia',
      cooldown: 15,
      clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx) {
    const input = ctx.args[0];
    if (!input) return ctx.replyT('error', 'commands:blackjack.bad-usage');
    const valor = parseInt(input.replace(/\D+/g, ''));
    if (!valor || valor > 50000 || valor < 1000) return ctx.replyT('error', 'commands:blackjack.invalid-value');

    if (ctx.data.user.estrelinhas < valor) return ctx.replyT('error', 'commands:blackjack.poor');

    const matchCards = BLACKJACK_CARDS;
    matchCards.sort(() => Math.random() - 0.5);

    const dealerCards = matchCards.splice(0, 2);
    const playerCards = matchCards.splice(0, 2);

    const res = await NewHttp.blackjackRequest(valor, CalculateHandValue(playerCards), CalculateHandValue(dealerCards), BlackJackCommand.checkHandFinalValue(CalculateHandValue(playerCards)), BlackJackCommand.checkHandFinalValue(CalculateHandValue([dealerCards[0]])), false, { yourHand: ctx.locale('commands:blackjack.your-hand'), dealerHand: ctx.locale('commands:blackjack.dealer-hand') });

    const embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(`${ctx.locale('commands:blackjack.your-hand')}: **${CalculateHandValue(playerCards).map((a) => `${a.value}`).join(', ')}** -> \`${BlackJackCommand.checkHandFinalValue(CalculateHandValue(playerCards))}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${CalculateHandValue([dealerCards[0]]).map((a) => `${a.value}`).join(', ')}** -> \`${BlackJackCommand.checkHandFinalValue(CalculateHandValue([dealerCards[0]]))}\``)
      .addField(ctx.locale('commands:blackjack.available-options'), ctx.locale('commands:blackjack.options'))
      .setFooter(ctx.locale('commands:blackjack.footer'))
      .setColor(ctx.data.user.cor)
      .setThumbnail(ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true }));

    if (!res.err) {
      const attachment = new MessageAttachment(Buffer.from(res.data), 'blackjack.png');
      embed.attachFiles(attachment)
        .setImage('attachment://blackjack.png');
    }

    ctx.sendC(ctx.message.author, embed);

    const acceptOptions = ['comprar', '1', 'buy', 'draw'];
    const pararOptions = ['parar', '2', 'stop'];

    const filter = (msg) => msg.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 10000 });

    const timeout = setTimeout(() => {
      ctx.replyT('error', 'commands:blackjack.timeout');
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
    }, 12000);
    collector.on('collect', (msg) => {
      if (pararOptions.includes(msg.content)) {
        clearTimeout(timeout);
        BlackJackCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
      } else if (acceptOptions.includes(msg.content)) {
        clearTimeout(timeout);
        BlackJackCommand.continueFromBuy(ctx, valor, dealerCards, playerCards, matchCards);
      }
    });
  }

  static async continueFromBuy(ctx, valor, dealerCards, usrCards, deckCards) {
    if (usrCards.length === 2) {
      const oldUserCards = CalculateHandValue(usrCards);
      const oldUserTotal = BlackJackCommand.checkHandFinalValue(oldUserCards);

      if (oldUserTotal >= 21) return BlackJackCommand.finishGame(ctx, valor, dealerCards, usrCards, deckCards);
    }

    const matchCards = deckCards;

    const newCard = matchCards.splice(0, 1);
    const playerCards = [...usrCards, ...newCard];

    const userCards = CalculateHandValue(playerCards);
    const userTotal = BlackJackCommand.checkHandFinalValue(userCards);

    const res = await NewHttp.blackjackRequest(valor, userCards, CalculateHandValue(dealerCards), userTotal, BlackJackCommand.checkHandFinalValue(CalculateHandValue([dealerCards[0]])), false, { yourHand: ctx.locale('commands:blackjack.your-hand'), dealerHand: ctx.locale('commands:blackjack.dealer-hand') });

    const embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(`${ctx.locale('commands:blackjack.your-hand')}: **${CalculateHandValue(playerCards).map((a) => `${a.value}`).join(', ')}** -> \`${BlackJackCommand.checkHandFinalValue(CalculateHandValue(playerCards))}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${CalculateHandValue([dealerCards[0]]).map((a) => `${a.value}`).join(', ')}** -> \`${BlackJackCommand.checkHandFinalValue(CalculateHandValue([dealerCards[0]]))}\``)
      .addField(ctx.locale('commands:blackjack.available-options'), ctx.locale('commands:blackjack.options'))
      .setFooter(ctx.locale('commands:blackjack.footer'))
      .setColor(ctx.data.user.cor)
      .setThumbnail(ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true }));

    if (!res.err) {
      const attachment = new MessageAttachment(Buffer.from(res.data), 'blackjack.png');
      embed.attachFiles(attachment)
        .setImage('attachment://blackjack.png');
    }

    ctx.sendC(ctx.message.author, embed);

    const acceptOptions = ['comprar', '1', 'buy', 'draw'];
    const pararOptions = ['parar', '2', 'stop'];

    const filter = (msg) => msg.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 10000 });

    const timeout = setTimeout(() => {
      ctx.replyT('error', 'commands:blackjack.timeout');
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
    }, 12000);

    collector.on('collect', (msg) => {
      if (userTotal >= 21) {
        clearTimeout(timeout);
        BlackJackCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
        return;
      }
      if (pararOptions.includes(msg.content)) {
        clearTimeout(timeout);
        BlackJackCommand.finishGame(ctx, valor, dealerCards, playerCards, matchCards);
      } else if (acceptOptions.includes(msg.content)) {
        clearTimeout(timeout);
        BlackJackCommand.continueFromBuy(ctx, valor, dealerCards, playerCards, matchCards);
      }
    });
  }

  static checkHandFinalValue(cards) {
    let total;

    const baseSum = cards.reduce((p, a) => a.value + p, 0);

    if (cards.some((a) => a.isAce) && baseSum <= 10) {
      total = cards.reduce((p, a) => ((a.isAce ? 11 : a.value) + p), 0);
    } else total = baseSum;

    return total;
  }

  static async finishGame(ctx, valor, menheraCards, playerCards, matchCards) {
    const userCards = CalculateHandValue(playerCards);
    const dealerCards = CalculateHandValue(menheraCards);

    const userTotal = BlackJackCommand.checkHandFinalValue(userCards);
    let menheraTotal = BlackJackCommand.checkHandFinalValue(dealerCards);

    let embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(`${ctx.locale('commands:blackjack.your-hand')}: **${userCards.map((a) => `${a.value}`).join(', ')}** -> \`${userTotal}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${dealerCards.map((a) => `${a.value}`).join(', ')}** -> \`${menheraTotal}\``)
      .setColor(ctx.data.user.cor)
      .setThumbnail(ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true }));

    const res = await NewHttp.blackjackRequest(valor, userCards, dealerCards, userTotal, menheraTotal, true, { yourHand: ctx.locale('commands:blackjack.your-hand'), dealerHand: ctx.locale('commands:blackjack.dealer-hand') });

    if (!res.err) {
      const attachment = new MessageAttachment(Buffer.from(res.data), 'blackjack.png');
      embed.attachFiles(attachment)
        .setImage('attachment://blackjack.png');
    }

    if (userTotal === 21 && playerCards.length === 2) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.blackjack', { value: (valor * 4) }));
      ctx.client.repositories.starRepository.add(ctx.message.author.id, (valor * 2));
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    // Estourou
    if (userTotal > 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.explode'));
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    // Continua

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.menhera-bj'));
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (menheraTotal < 17 || menheraTotal < userTotal) {
      do {
        const newCards = CalculateHandValue(matchCards.splice(0, 1));
        dealerCards.push(...newCards);
        menheraTotal = BlackJackCommand.checkHandFinalValue(dealerCards);
      } while (menheraTotal < 17 && menheraTotal < userTotal);
    }

    embed = new MessageEmbed()
      .setTitle('⭐ | BlackJack')
      .setDescription(`${ctx.locale('commands:blackjack.your-hand')}: **${userCards.map((a) => `${a.value}`).join(', ')}** -> \`${userTotal}\`\n${ctx.locale('commands:blackjack.dealer-hand')}: **${dealerCards.map((a) => `${a.value}`).join(', ')}** -> \`${menheraTotal}\``)
      .setColor(ctx.data.user.cor)
      .setThumbnail(ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true }));

    const newRes = await NewHttp.blackjackRequest(valor, userCards, dealerCards, userTotal, menheraTotal, true, { yourHand: ctx.locale('commands:blackjack.your-hand'), dealerHand: ctx.locale('commands:blackjack.dealer-hand') });

    if (!newRes.err) {
      const newAtt = new MessageAttachment(Buffer.from(newRes.data), 'bj.png');
      embed.attachFiles(newAtt)
        .setImage('attachment://bj.png');
    }

    if (menheraTotal === 21 && userTotal !== 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.menhera-21'));
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (userTotal === 21 && menheraTotal !== 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.user-21', { value: valor * 2 }));
      ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (menheraTotal > 21 && userTotal <= 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.menhera-bust', { value: valor * 2 }));
      ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (menheraTotal > 21 && userTotal > 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.draw'));
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (menheraTotal === 21 && userTotal === 21) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.both-21'));
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (menheraTotal === userTotal) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.equal'));
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    if (menheraTotal > userTotal) {
      embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.menhera-bigger'));
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      ctx.sendC(ctx.message.author, embed);
      return;
    }

    embed.addField(ctx.locale('commands:blackjack.result'), ctx.locale('commands:blackjack.user-bigger', { value: valor * 2 }));
    ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
    ctx.sendC(ctx.message.author, embed);
  }
};
