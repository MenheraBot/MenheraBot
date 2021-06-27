const { BLACKJACK_CARDS } = require('@structures/MenheraConstants');
const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

const CalculateHandValue = (cards) => {
  const realValue = cards.reduce((p, c) => {
    if (c <= 13) {
      p.push({
        value: (c > 10 ? 10 : c), isAce: (c === 1), suit: 1, id: c,
      });
    }

    if (c > 13 && c <= 26) {
      const newC = c - 13;
      p.push({
        value: (newC > 10 ? 10 : newC), isAce: (newC === 1), suit: 2, id: c,
      });
    }
    if (c > 26 && c <= 39) {
      const newC = c - 26;
      p.push({
        value: (newC > 10 ? 10 : newC), isAce: (newC === 1), suit: 3, id: c,
      });
    }
    if (c > 39 && c <= 52) {
      const newC = c - 39;
      p.push({
        value: (newC > 10 ? 10 : newC), isAce: (newC === 1), suit: 4, id: c,
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
      cooldown: 20,
      clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx) {
    const input = ctx.args[0];
    if (!input) return ctx.replyT('error', 'commands:blackjack.bad-usage');
    const valor = parseInt(input.replace(/\D+/g, ''));
    if (!valor || valor > 50000 || valor < 1000) return ctx.replyT('error', 'commands:blackjack.invalid-value');

    if (ctx.data.user.estrelinhas < valor) return ctx.replyT('error', 'commands:blackjack.poor');

    const matchCards = BLACKJACK_CARDS.sort(() => Math.random() - 0.5);

    const dealerCards = matchCards.splice(0, 2);
    const playerCards = matchCards.splice(0, 2);

    const embed = new MessageEmbed().setTitle('BLACKJACK').setDescription(`Suas Cartas: **${CalculateHandValue(playerCards).map((a) => `${a.value}`).join(', ')}**\nMesa Cartas: **${dealerCards[0]}, \`Carta Virada\`**`)
      .addField(ctx.locale('commands:blackjack.available-options'), ctx.locale('commands:blackjack.initial-options'))
      .setFooter(ctx.locale('commands:blackjack.footer'));
    ctx.sendC(ctx.message.author, embed);

    const acceptOptions = ['começar', 'comecar', '1', 'start'];
    const pararOptions = ['desistir', 'surrender', '2'];

    const filter = (msg) => msg.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 10000 });

    const timeout = setTimeout(() => {
      ctx.reply('error', 'tempo esgotado');
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
    }, 12000);
    collector.on('collect', (msg) => {
      if (pararOptions.includes(msg.content)) {
        clearTimeout(timeout);
        ctx.send('Você desistiu');
        ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      } else if (acceptOptions.includes(msg.content)) {
        clearTimeout(timeout);
        BlackJackCommand.continueFromBuy(ctx, valor, dealerCards, playerCards, matchCards);
      }
    });
  }

  static continueFromBuy(ctx, valor, dealerCards, usrCards, deckCards) {
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

    const embed = new MessageEmbed().setTitle('BLACKJACK').setDescription(`Suas Cartas: **${userCards.map((a) => `${a.value}`).join(', ')}**\n**SUA MAO:**${userTotal} \nMesa Cartas: **${dealerCards[0]}, \`Carta Virada\`**`)
      .addField(ctx.locale('commands:blackjack.available-options'), ctx.locale('commands:blackjack.options'))
      .setFooter(ctx.locale('commands:blackjack.footer'));

    ctx.sendC(ctx.message.author, embed);

    const acceptOptions = ['comprar', '1', 'buy', 'draw'];
    const pararOptions = ['parar', '2', 'stop'];

    const filter = (msg) => msg.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 10000 });

    const timeout = setTimeout(() => {
      ctx.reply('error', 'tempo esgotado');
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
      } else {
        clearTimeout(timeout);
        ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
        ctx.reply('error', 'Movimento invalido, perdeu tudo');
      }
    });
  }

  static checkHandFinalValue(cards) {
    let total;

    const baseSum = cards.reduce((p, a) => a.value + p, 0);

    if (cards.some((a) => a.isAce) && baseSum <= 10) {
      total = cards.reduce((p, a) => ((a.isAce ? 11 : a.value) + p), 0);
    } else total = baseSum;

    console.log(baseSum, total);
    console.log(cards);

    return total;
  }

  static async finishGame(ctx, valor, menheraCards, playerCards, matchCards) {
    const userCards = CalculateHandValue(playerCards);
    let dealerCards = CalculateHandValue(menheraCards);

    const userTotal = BlackJackCommand.checkHandFinalValue(userCards);
    let menheraTotal = BlackJackCommand.checkHandFinalValue(dealerCards);

    if (userTotal === 21 && playerCards.length === 2) {
      ctx.message.channel.send('BLACKJACK!!! Você ganhou');
      ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
      return;
    }

    // Estourou
    if (userTotal > 21) {
      ctx.message.channel.send(`Você Estourou! Perdeu tudo\nSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      return;
    }

    // Continua

    if (menheraTotal === 21 && userTotal !== 21) {
      ctx.message.channel.send(`A Menhera tem um blackjack! Perdeu tudo\nnSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      return;
    }

    if (menheraTotal < 17) {
      do {
        dealerCards = [...dealerCards, ...CalculateHandValue(matchCards.splice(0, 1))];
        menheraTotal = BlackJackCommand.checkHandFinalValue(dealerCards);
      } while (menheraTotal < 17);
    }

    if (menheraTotal === 21 && userTotal !== 21) {
      ctx.message.channel.send(`A Menhera fez 21! Tu foi de ralo\nSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      return;
    }

    if (userTotal === 21 && menheraTotal !== 21) {
      ctx.message.channel.send(`Tu fez 21 pia, dale\nnSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
      return;
    }

    if (menheraTotal > 21 && userTotal <= 21) {
      ctx.message.channel.send(`A Menhera estourou, dale pra ti\nnSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
      return;
    }

    if (menheraTotal > 21 && userTotal > 21) {
      ctx.message.channel.send(`Ambos estouraram, nada acontece\nnSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      return;
    }

    if (menheraTotal === 21 && userTotal === 21) {
      ctx.message.channel.send('Ambos fizeram 21, mas a Menhera tem preferência. Infelizmente assim que funcionam os cassinos. Perdeu Tudo');
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      return;
    }

    if (menheraTotal > userTotal) {
      ctx.message.channel.send(`A Menhera está mais proxima de 21, ela ganha!\nSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
      ctx.client.repositories.starRepository.remove(ctx.message.author.id, valor);
      return;
    }

    ctx.message.channel.send(`Você está mais próximo de 21, você ganhou\nSua mao: ${userTotal}\nMenhera: ${menheraTotal}`);
    ctx.client.repositories.starRepository.add(ctx.message.author.id, valor);
  }
};
