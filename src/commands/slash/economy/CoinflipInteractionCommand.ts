import { MessageButton } from 'discord.js';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import Util from '@utils/Util';

export default class CoinflipInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'coinflip',
      description: '「💶」・Disputa num jogo de Cara e Coroa com um amigo',
      options: [
        {
          name: 'user',
          description: 'Usuário para disputar',
          type: 'USER',
          required: true,
        },
        {
          name: 'aposta',
          description: 'Valor da aposta',
          type: 'INTEGER',
          required: true,
        },
      ],
      category: 'economy',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (!ctx.interaction.channel) return;
    const user1 = ctx.interaction.user;
    const user2 = ctx.args[0].user;
    const input = ctx.args[1].value as number;
    if (!input) {
      await ctx.replyT('error', 'commands:coinflip.invalid-value', {}, true);
      return;
    }

    if (!user2) {
      await ctx.replyT('error', 'commands:coinflip.no-mention', {}, true);
      return;
    }

    if (user2.bot) {
      await ctx.replyT('error', 'commands:coinflip.bot', {}, true);
      return;
    }
    if (user2.id === user1.id) {
      await ctx.replyT('error', 'commands:coinflip.self-mention', {}, true);
      return;
    }

    if (input < 1) {
      await ctx.replyT('error', 'commands:coinflip.invalid-value', {}, true);
      return;
    }

    const db1 = await this.client.repositories.userRepository.find(user1.id);
    const db2 = await this.client.repositories.userRepository.find(user2.id);

    if (!db1 || !db2) {
      await ctx.replyT('error', 'commands:coinflip.no-dbuser', {}, true);
      return;
    }

    if (input > db1.estrelinhas) {
      await ctx.replyT('error', 'commands:coinflip.poor', {}, true);
      return;
    }

    if (input > db2.estrelinhas) {
      await ctx.reply(
        `<:negacao:759603958317711371> **|** ${user2} ${ctx.locale('commands:coinflip.poor')}`,
        true,
      );
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:coinflip.bet'))
      .setStyle('SUCCESS');

    ctx.reply({
      content: `${user2.toString()}, ${user1.toString()} ${ctx.locale(
        'commands:coinflip.confirm-start',
        {
          value: input,
        },
      )} ${user1} ${ctx.locale('commands:coinflip.confirm-middle')} ${user2} ${ctx.locale(
        'commands:coinflip.win',
      )}!\n${user2} ${ctx.locale('commands:coinflip.confirm-end')}`,
      components: [{ type: 1, components: [ConfirmButton] }],
    });

    const coletor = await Util.collectComponentInteractionWithId(
      ctx.interaction.channel,
      user2.id,
      ctx.interaction.id,
      7000,
    );

    if (!coletor) {
      ctx.interaction.editReply({
        components: [
          {
            type: 1,
            components: [
              ConfirmButton.setDisabled(true)
                .setLabel(ctx.locale('commands:coinflip.timeout'))
                .setEmoji('⌛'),
            ],
          },
        ],
      });
      return;
    }

    const shirleyTeresinha = ['Cara', 'Coroa'];
    const choice = shirleyTeresinha[Math.floor(Math.random() * shirleyTeresinha.length)];

    let winner = user1.id;
    let loser = user2.id;

    if (choice === 'Cara') {
      await ctx.editReply({
        content: `${ctx.locale('commands:coinflip.cara')}\n${user1.toString()} ${ctx.locale(
          'commands:coinflip.cara-texto-start',
          { value: input },
        )} ${user2.toString()}! ${ctx.locale(
          'commands:coinflip.cara-text-middle',
        )} ${user2.toString()} ${ctx.locale('commands:coinflip.cara-text-end')}`,
        components: [],
      });
    } else {
      winner = user2.id;
      loser = user1.id;
      await ctx.editReply({
        content: `${ctx.locale('commands:coinflip.coroa')}\n${user2.toString()} ${ctx.locale(
          'commands:coinflip.coroa-texto',
          { value: input },
        )} ${user1.toString()}`,
        components: [],
      });
    }

    await this.client.repositories.starRepository.add(winner, input);
    await this.client.repositories.starRepository.remove(loser, input);
    await HttpRequests.postCoinflipGame(winner, loser, input, Date.now());
  }
}
