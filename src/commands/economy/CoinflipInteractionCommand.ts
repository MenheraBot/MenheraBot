import { MessageButton } from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import Util from '@utils/Util';

export default class CoinflipInteractionCommand extends InteractionCommand {
  constructor() {
    super({
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
          minValue: 1,
        },
      ],
      category: 'economy',
      cooldown: 5,
      authorDataFields: ['estrelinhas'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const { author } = ctx;
    const user = ctx.options.getUser('user', true);
    const input = ctx.options.getInteger('aposta', true);

    if (!input) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.invalid-value'),
        ephemeral: true,
      });
      return;
    }

    if (user.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.bot'),
        ephemeral: true,
      });
      return;
    }
    if (user.id === author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (ctx.client.commandExecutions.has(user.id)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:economy_usage'),
        ephemeral: true,
      });
    }

    if (input < 1) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.invalid-value'),
        ephemeral: true,
      });
      return;
    }

    const db1 = ctx.data.user;
    const db2 = await ctx.client.repositories.userRepository.find(user.id);

    if (!db1 || !db2) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (db2.ban === true) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (input > db1.estrelinhas) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.poor', { user: author.toString() }),
        ephemeral: true,
      });
      return;
    }

    if (input > db2.estrelinhas) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.poor', { user: user.toString() }),
        ephemeral: true,
      });
      return;
    }

    ctx.client.commandExecutions.add(user.id);

    const ConfirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:coinflip.bet'))
      .setStyle('SUCCESS');

    ctx.makeMessage({
      content: ctx.locale('commands:coinflip.confirm', {
        value: input,
        author: ctx.author.toString(),
        mention: user.toString(),
      }),
      components: [{ type: 1, components: [ConfirmButton] }],
    });

    const coletor = await Util.collectComponentInteractionWithId(
      ctx.channel,
      user.id,
      ctx.interaction.id,
      7000,
    );

    ctx.client.commandExecutions.delete(user.id);

    if (!coletor) {
      ctx.makeMessage({
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

    let winner = author.id;
    let loser = user.id;

    if (choice === 'Cara') {
      await ctx.makeMessage({
        content: `${ctx.locale('commands:coinflip.cara')}\n${ctx.locale(
          'commands:coinflip.cara-texto',
          {
            value: input,
            author: author.toString(),
            mention: user.toString(),
          },
        )}`,
        components: [],
      });
    } else {
      winner = user.id;
      loser = author.id;
      await ctx.makeMessage({
        content: `${ctx.locale('commands:coinflip.coroa')}\n${ctx.locale(
          'commands:coinflip.coroa-texto',
          {
            value: input,
            author: author.toString(),
            mention: user.toString(),
          },
        )}`,
        components: [],
      });
    }

    await ctx.client.repositories.coinflipRepository.coinflip(winner, loser, input);
    await HttpRequests.postCoinflipGame(winner, loser, input, Date.now());
  }
}
