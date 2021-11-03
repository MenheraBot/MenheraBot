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
        },
      ],
      category: 'economy',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['estrelinhas'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user1 = ctx.author;
    const user2 = ctx.options.getUser('user', true);
    const input = ctx.options.getInteger('aposta', true);

    if (!input) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.invalid-value'),
        ephemeral: true,
      });
      return;
    }

    if (user2.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.bot'),
        ephemeral: true,
      });
      return;
    }
    if (user2.id === user1.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (input < 1) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.invalid-value'),
        ephemeral: true,
      });
      return;
    }

    const db1 = ctx.data.user;
    const db2 = await ctx.client.repositories.userRepository.find(user2.id);

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
        content: ctx.prettyResponse('error', 'commands:coinflip.poor', { user: user1.toString() }),
        ephemeral: true,
      });
      return;
    }

    if (input > db2.estrelinhas) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.poor', { user: user2.toString() }),
        ephemeral: true,
      });
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:coinflip.bet'))
      .setStyle('SUCCESS');

    ctx.makeMessage({
      content: ctx.locale('commands:coinflip.confirm', {
        value: input,
        author: ctx.author.toString(),
        mention: user2.toString(),
      }),
      components: [{ type: 1, components: [ConfirmButton] }],
    });

    const coletor = await Util.collectComponentInteractionWithId(
      ctx.channel,
      user2.id,
      ctx.interaction.id,
      7000,
    );

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

    let winner = user1.id;
    let loser = user2.id;

    if (choice === 'Cara') {
      await ctx.makeMessage({
        content: `${ctx.locale('commands:coinflip.cara')}\n${ctx.locale(
          'commands:coinflip.cara-texto',
          {
            value: input,
            author: user1.toString(),
            mention: user2.toString(),
          },
        )}`,
        components: [],
      });
    } else {
      winner = user2.id;
      loser = user1.id;
      await ctx.makeMessage({
        content: `${ctx.locale('commands:coinflip.coroa')}\n${ctx.locale(
          'commands:coinflip.coroa-texto',
          {
            value: input,
            author: user1.toString(),
            mention: user2.toString(),
          },
        )}`,
        components: [],
      });
    }

    await ctx.client.repositories.coinflipRepository.coinflip(winner, loser, input);
    await HttpRequests.postCoinflipGame(winner, loser, input, Date.now());
  }
}
