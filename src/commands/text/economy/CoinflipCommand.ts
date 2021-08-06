import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';

import { emojis } from '@structures/MenheraConstants';

import Command from '@structures/command/Command';

import { MessageReaction, User } from 'discord.js';
import http from '@utils/HTTPrequests';

export default class CoinflipCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'coinflip',
      aliases: ['cf'],
      cooldown: 5,
      category: 'economia',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const user1 = ctx.message.author;
    const user2 = ctx.message.mentions.users.first();
    const input = ctx.args[1];
    if (!input) {
      await ctx.replyT('error', 'commands:coinflip.invalid-value');
      return;
    }
    const valor = input.replace(/\D+/g, '');

    if (!user2) {
      await ctx.replyT('error', 'commands:coinflip.no-mention');
      return;
    }

    if (user2.bot) {
      await ctx.replyT('error', 'commands:coinflip.bot');
      return;
    }
    if (user2.id === user1.id) {
      await ctx.replyT('error', 'commands:coinflip.self-mention');
      return;
    }

    if (Number.isNaN(parseInt(valor))) {
      await ctx.replyT('error', 'commands:coinflip.invalid-value');
      return;
    }
    if (parseInt(valor) < 1) {
      await ctx.replyT('error', 'commands:coinflip.invalid-value');
      return;
    }

    const db1 = await this.client.repositories.userRepository.find(user1.id);
    const db2 = await this.client.repositories.userRepository.find(user2.id);

    if (!db1 || !db2) {
      await ctx.replyT('error', 'commands:coinflip.no-dbuser');
      return;
    }

    if (parseInt(valor) > db1.estrelinhas) {
      await ctx.replyT('error', 'commands:coinflip.poor');
      return;
    }

    if (parseInt(valor) > db2.estrelinhas) {
      await ctx.send(
        `<:negacao:759603958317711371> **|** ${user2} ${ctx.locale('commands:coinflip.poor')}`,
      );
      return;
    }

    return ctx
      .send(
        `${user2}, ${user1} ${ctx.locale('commands:coinflip.confirm-start', {
          value: valor,
        })} ${user1} ${ctx.locale('commands:coinflip.confirm-middle')} ${user2} ${ctx.locale(
          'commands:coinflip.win',
        )}!\n${user2} ${ctx.locale('commands:coinflip.confirm-end')}`,
      )
      .then((msg) => {
        msg.react(emojis.yes);
        const filter = (reaction: MessageReaction, usuario: User) =>
          reaction.emoji.name === emojis.yes && usuario.id === user2.id;

        const coletor = msg.createReactionCollector({ filter, max: 1, time: 7000 });

        coletor.on('collect', async () => {
          const shirleyTeresinha = ['Cara', 'Coroa'];
          const choice = shirleyTeresinha[Math.floor(Math.random() * shirleyTeresinha.length)];

          let winner = user1.id;
          let loser = user2.id;

          if (choice === 'Cara') {
            await ctx.send(
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
            await ctx.send(
              `${ctx.locale('commands:coinflip.coroa')}\n${user2} ${ctx.locale(
                'commands:coinflip.coroa-texto',
                { value: valor },
              )} ${user1}`,
            );
          }

          await this.client.repositories.starRepository.add(winner, parseInt(valor));
          await this.client.repositories.starRepository.remove(loser, parseInt(valor));
          await http.postCoinflipGame(winner, loser, parseInt(valor), Date.now());
        });
      });
  }
}
