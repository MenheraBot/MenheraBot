const Command = require('../../structures/Command');
const http = require('../../utils/HTTPrequests');

module.exports = class CoinflipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'coinflip',
      aliases: ['cf'],
      cooldown: 5,
      category: 'economia',
    });
  }

  async run(ctx) {
    const user1 = ctx.message.author;
    const user2 = ctx.message.mentions.users.first();
    const input = ctx.args[1];
    if (!input) return ctx.replyT('error', 'commands:coinflip.invalid-value');
    const valor = input.replace(/\D+/g, '');

    if (!user2) return ctx.replyT('error', 'commands:coinflip.no-mention');
    if (user2.bot) return ctx.replyT('error', 'commands:coinflip.bot');
    if (user2.id === user1.id) return ctx.replyT('error', 'commands:coinflip.self-mention');

    if (Number.isNaN(parseInt(valor)))
      return ctx.replyT('error', 'commands:coinflip.invalid-value');
    if (parseInt(valor) < 1) return ctx.replyT('error', 'commands:coinflip.invalid-value');

    const db1 = await this.client.repositories.userRepository.find(user1.id);
    const db2 = await this.client.repositories.userRepository.find(user2.id);

    if (!db1 || !db2) return ctx.replyT('error', 'commands:coinflip.no-dbuser');

    if (valor > db1.estrelinhas) return ctx.replyT('error', 'commands:coinflip.poor');
    if (valor > db2.estrelinhas)
      return ctx.send(
        `<:negacao:759603958317711371> **|** ${user2} ${ctx.locale('commands:coinflip.poor')}`,
      );

    ctx
      .send(
        `${user2}, ${user1} ${ctx.locale('commands:coinflip.confirm-start', {
          value: valor,
        })} ${user1} ${ctx.locale('commands:coinflip.confirm-middle')} ${user2} ${ctx.locale(
          'commands:coinflip.win',
        )}!\n${user2} ${ctx.locale('commands:coinflip.confirm-end')}`,
      )
      .then((msg) => {
        msg.react(this.client.constants.emojis.yes);
        const filter = (reaction, usuario) =>
          reaction.emoji.name === this.client.constants.emojis.yes && usuario.id === user2.id;

        const coletor = msg.createReactionCollector(filter, { max: 1, time: 7000 });

        coletor.on('collect', async () => {
          const shirleyTeresinha = ['Cara', 'Coroa'];
          const choice = shirleyTeresinha[Math.floor(Math.random() * shirleyTeresinha.length)];

          let winner = user1.id;
          let loser = user2.id;

          if (choice === 'Cara') {
            ctx.send(
              `${ctx.locale('commands:coinflip.cara')}\n${user1} ${ctx.locale(
                'commands:coinflip.cara-texto-start',
                { value: valor },
              )} ${user2}! ${ctx.locale(
                'commands:coinflip.cara-text-middle',
              )} ${user2} ${ctx.locale('commands:coinflip.cara-text-end')}`,
            );
          } else {
            winner = user2.id;
            loser = user1.id;
            ctx.send(
              `${ctx.locale('commands:coinflip.coroa')}\n${user2} ${ctx.locale(
                'commands:coinflip.coroa-texto',
                { value: valor },
              )} ${user1}`,
            );
          }

          await this.client.repositories.starRepository.add(winner, valor);
          await this.client.repositories.starRepository.remove(loser, valor);
          await http.postCoinflipGame(winner, loser, parseInt(valor), Date.now());
        });
      });
  }
};
