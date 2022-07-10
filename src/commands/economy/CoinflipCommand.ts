import { MessageButton } from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import Util, { actionRow, disableComponents, RandomFromArray } from '@utils/Util';

export default class CoinflipCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'coinflip',
      description: '「📀」・Disputa num jogo de Cara e Coroa com um amigo',
      descriptionLocalizations: { 'en-US': '「📀」・Dispute in a coin toss game with a friend' },
      options: [
        {
          name: 'user',
          description: 'Usuário para disputar',
          descriptionLocalizations: { 'en-US': 'User to dispute' },
          type: 'USER',
          required: true,
        },
        {
          name: 'aposta',
          nameLocalizations: { 'en-US': 'bet' },
          description: 'Valor da aposta',
          descriptionLocalizations: { 'en-US': 'Bet ammount' },
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

    if (input > ctx.data.user.estrelinhas) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.poor', { user: author.toString() }),
        ephemeral: true,
      });
      return;
    }

    if (ctx.client.economyUsages.has(user.id)) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:economy_usage'),
        ephemeral: true,
      });
      return;
    }

    const enemyData = await ctx.client.repositories.userRepository.find(user.id, [
      'ban',
      'estrelinhas',
    ]);

    if (!enemyData) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (enemyData.ban) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (input > enemyData.estrelinhas) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:coinflip.poor', { user: user.toString() }),
        ephemeral: true,
      });
      return;
    }

    ctx.client.economyUsages.add(user.id);

    const confirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:coinflip.bet'))
      .setStyle('SUCCESS');

    ctx.makeMessage({
      content: ctx.locale('commands:coinflip.confirm', {
        value: input,
        author: ctx.author.toString(),
        mention: user.toString(),
      }),
      components: [actionRow([confirmButton])],
    });

    const coletor = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      user.id,
      ctx.interaction.id,
      7000,
    );

    ctx.client.economyUsages.delete(user.id);

    if (!coletor) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [confirmButton]))],
      });
      return;
    }

    const options = ['cara', 'coroa'];
    const choice = RandomFromArray(options);

    const winner = choice === 'cara' ? author : user;
    const loser = choice === 'coroa' ? author : user;

    await ctx.makeMessage({
      content: ctx.locale('commands:coinflip.text', {
        choice: ctx.locale(`commands:coinflip.${choice as 'cara'}`),
        value: input,
        winner: winner.toString(),
        loser: loser.toString(),
      }),
      components: [],
    });

    await ctx.client.repositories.coinflipRepository.coinflip(winner.id, loser.id, input);
    await HttpRequests.postCoinflipGame(winner.id, loser.id, input, Date.now());
  }
}
