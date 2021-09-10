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
    const user1 = ctx.author;
    const user2 = ctx.options.getUser('user', true);
    const input = ctx.options.getInteger('aposta', true);

    if (!input) {
      await ctx.replyT('error', 'invalid-value', {}, true);
      return;
    }

    if (!user2) {
      await ctx.replyT('error', 'no-mention', {}, true);
      return;
    }

    if (user2.bot) {
      await ctx.replyT('error', 'bot', {}, true);
      return;
    }
    if (user2.id === user1.id) {
      await ctx.replyT('error', 'self-mention', {}, true);
      return;
    }

    if (input < 1) {
      await ctx.replyT('error', 'invalid-value', {}, true);
      return;
    }

    const db1 = await this.client.repositories.userRepository.find(user1.id);
    const db2 = await this.client.repositories.userRepository.find(user2.id);

    if (!db1 || !db2) {
      await ctx.replyT('error', 'no-dbuser', {}, true);
      return;
    }

    if (db2.ban === true) {
      await ctx.replyT('error', 'banned-user', {}, true);
      return;
    }

    if (input > db1.estrelinhas) {
      await ctx.replyT('error', 'poor', { user: user1.toString() }, true);
      return;
    }

    if (input > db2.estrelinhas) {
      await ctx.replyT('error', 'poor', { user: user2.toString() }, true);
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.translate('bet'))
      .setStyle('SUCCESS');

    ctx.reply({
      content: ctx.translate('confirm', {
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
      ctx.editReply({
        components: [
          {
            type: 1,
            components: [
              ConfirmButton.setDisabled(true).setLabel(ctx.translate('timeout')).setEmoji('⌛'),
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
        content: `${ctx.translate('cara')}\n${ctx.translate('cara-texto', {
          value: input,
          author: user1.toString(),
          mention: user2.toString(),
        })}`,
        components: [],
      });
    } else {
      winner = user2.id;
      loser = user1.id;
      await ctx.editReply({
        content: `${ctx.translate('coroa')}\n${ctx.translate('coroa-texto', {
          value: input,
          author: user1.toString(),
          mention: user2.toString(),
        })}`,
        components: [],
      });
    }

    await this.client.repositories.starRepository.add(winner, input);
    await this.client.repositories.starRepository.remove(loser, input);
    await HttpRequests.postCoinflipGame(winner, loser, input, Date.now());
  }
}
