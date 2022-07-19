import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js-light';
import { emojis } from '@structures/Constants';
import Util, { actionRow, debugError, disableComponents } from '@utils/Util';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class TrisalCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'trisal',
      nameLocalizations: { 'en-US': 'polyamory' },
      description: '「💘」・Faça um belo trisal com seus amigos',
      descriptionLocalizations: { 'en-US': '「💘」・Start a poliamory with your friends' },
      options: [
        {
          name: 'ver',
          nameLocalizations: { 'en-US': 'see' },
          type: 'SUB_COMMAND',
          description: '「💘」・Veja o trisal atual de alguém',
          descriptionLocalizations: { 'en-US': '「💘」・See the current poliamory of someone' },
          options: [
            {
              name: 'user',
              type: 'USER',
              description: 'Usuário para ver o trisal',
              descriptionLocalizations: { 'en-US': 'User to see their polyamory' },
              required: false,
            },
          ],
        },
        {
          name: 'terminar',
          nameLocalizations: { 'en-US': 'breakup' },
          type: 'SUB_COMMAND',
          description: '「💔」・Termine o seu trisal atual',
          descriptionLocalizations: { 'en-US': '「💔」・ Breakup with your current polyamory' },
        },
        {
          name: 'formar',
          type: 'SUB_COMMAND',
          description: '「💘」・Faça um belo trisal com seus amigos',
          descriptionLocalizations: { 'en-US': '「💘」・Start a poliamory with your friends' },
          nameLocalizations: { 'en-US': 'make' },
          options: [
            {
              name: 'user',
              type: 'USER',
              description: 'Primeiro usuário do trisal',
              descriptionLocalizations: { 'en-US': 'First user of the polyamory' },
              required: true,
            },
            {
              name: 'user_dois',
              nameLocalizations: { 'en-US': 'second_user' },
              type: 'USER',
              description: 'Segundo usuário do trisal',
              descriptionLocalizations: { 'en-US': 'Second user of the polyamory' },
              required: true,
            },
            {
              name: 'user_tres',
              nameLocalizations: { 'en-US': 'third_user' },
              type: 'USER',
              description:
                'Caso queira formar um trisal bem ordenado, coloque aqui o terceiro usuário',
              descriptionLocalizations: {
                'en-US': 'If you want an order polyamory, write the third user',
              },
              required: false,
            },
          ],
        },
        {
          name: 'ordem',
          type: 'SUB_COMMAND',
          description: '「💘」・Arrume a ordem das pessoas das metadinhas',
          descriptionLocalizations: {
            'en-US': '「💘」・Fix the order of the users avatars in the command',
          },
          nameLocalizations: { 'en-US': 'order' },
          options: [
            {
              name: 'primeiro_usuário',
              nameLocalizations: { 'en-US': 'first_user' },
              type: 'USER',
              description: 'Primeiro usuário do trisal',
              descriptionLocalizations: { 'en-US': 'First user of the polyamory' },
              required: true,
            },
            {
              name: 'segundo_usuário',
              nameLocalizations: { 'en-US': 'second_user' },
              type: 'USER',
              description: 'Segundo usuário do trisal',
              descriptionLocalizations: { 'en-US': 'Second user of the polyamory' },
              required: true,
            },
            {
              name: 'terceiro_usuário',
              nameLocalizations: { 'en-US': 'third_user' },
              type: 'USER',
              description: 'Terceiro usuário do trisal',
              descriptionLocalizations: { 'en-US': 'Third user of the polyamory' },
              required: true,
            },
          ],
        },
      ],
      category: 'fun',
      cooldown: 5,
      authorDataFields: ['trisal', 'selectedColor'],
    });
  }

  static async finishTrisal(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.data.user.trisal.length === 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.not-in-trisal'),
        ephemeral: true,
      });
      return;
    }

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) &&
      [...ctx.data.user.trisal, ctx.author.id].includes(int.user.id);

    const sureButton = new MessageButton()
      .setStyle('DANGER')
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:trisal.untrisal.breakup'));

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:trisal.untrisal.sure'),
      components: [actionRow([sureButton])],
    });

    const confirmed = await Util.collectComponentInteractionWithCustomFilter(
      ctx.channel,
      filter,
      15_000,
    );

    if (!confirmed) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [sureButton]))],
      });
      return;
    }

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:trisal.untrisal.done'),
      components: [],
    });

    const hasThirdUser = ctx.data.user.trisal.length === 3;

    await ctx.client.repositories.relationshipRepository.untrisal(
      ctx.data.user.trisal[0],
      ctx.data.user.trisal[1],
      hasThirdUser ? ctx.data.user.trisal[2] : ctx.author.id,
    );
  }

  static async displayTrisal(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') || ctx.author;

    const databaseUser =
      user.id === ctx.author.id
        ? ctx.data.user
        : await ctx.client.repositories.userRepository
            .find(user.id, ['ban', 'trisal'])
            .catch(() => null);

    if (!databaseUser) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.user-not-in-trisal'),
        ephemeral: true,
      });
      return;
    }

    if (databaseUser.trisal.length === 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse(
          'error',
          `commands:trisal.${user.id !== ctx.author.id ? 'user-' : ''}not-in-trisal`,
        ),
        ephemeral: true,
      });
      return;
    }

    const marryOne = await ctx.client.users.fetch(databaseUser.trisal[0]).catch(debugError);
    const marryTwo = await ctx.client.users.fetch(databaseUser.trisal[1]).catch(debugError);
    const marryThree =
      // eslint-disable-next-line no-nested-ternary
      databaseUser.trisal.length === 3
        ? await ctx.client.users.fetch(databaseUser.trisal[2]).catch(debugError)
        : user.id === ctx.author.id
        ? ctx.author
        : null;

    if (!marryOne || !marryTwo || !marryThree) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.marry-not-found'),
        ephemeral: true,
      });
      return;
    }

    const userOneAvatar = marryOne.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
    const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
    const userThreeAvatar = marryThree.displayAvatarURL({
      dynamic: false,
      size: 256,
      format: 'png',
    });

    await ctx.defer();

    const res = await requestVangoghImage(VangoghRoutes.Trisal, {
      userOne: userOneAvatar,
      userTwo: userTwoAvatar,
      userThree: userThreeAvatar,
    });

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
        ephemeral: true,
      });
      return;
    }

    const attachment = new MessageAttachment(res.data, 'trisal-kawaii.png');

    const embed = new MessageEmbed()
      .setDescription(`${marryOne.toString()}, ${marryTwo.toString()}, ${marryThree.toString()}`)
      .setTitle(ctx.locale('commands:trisal.title'))
      .setColor(ctx.data.user.selectedColor)
      .setImage('attachment://trisal-kawaii.png');

    await ctx.makeMessage({
      embeds: [embed],
      files: [attachment],
    });
  }

  static async makeTrisal(ctx: InteractionCommandContext): Promise<void> {
    const firstUser = ctx.options.getUser('user', true);
    const secondUser = ctx.options.getUser('user_dois', true);
    const thirdUser = ctx.options.getUser('user_tres') ?? ctx.author;

    if (firstUser.bot || secondUser.bot || thirdUser.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.bot-mention'),
        ephemeral: true,
      });
      return;
    }

    const trisalIds = [firstUser.id, secondUser.id, thirdUser.id];

    const withUser = trisalIds.filter((a) => a === ctx.author.id).length;

    if (withUser !== 1) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.mention-error'),
        ephemeral: true,
      });
      return;
    }

    if (
      firstUser.id === secondUser.id ||
      firstUser.id === thirdUser.id ||
      secondUser.id === thirdUser.id
    ) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.same-mention'),
        ephemeral: true,
      });
      return;
    }

    const usersWithouthOwner = trisalIds.filter((a) => a !== ctx.author.id);

    const [firstUserData, secondUserData] = await Promise.all([
      ctx.client.repositories.userRepository.find(usersWithouthOwner[0], ['ban', 'trisal']),
      ctx.client.repositories.userRepository.find(usersWithouthOwner[1], ['ban', 'trisal']),
    ]);

    if (!firstUserData || !secondUserData) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-db'),
        ephemeral: true,
      });
      return;
    }

    if (firstUserData.ban || secondUserData.ban) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (firstUserData.trisal.length > 0 || secondUserData.trisal.length > 0) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.comedor-de-casadas'),
        ephemeral: true,
      });
      return;
    }

    const confirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | CONFIRM`)
      .setLabel(ctx.locale('common:accept'))
      .setStyle('SUCCESS');

    ctx.makeMessage({
      content: ctx.locale('commands:trisal.accept-message', {
        first: firstUser.toString(),
        second: secondUser.toString(),
        third: thirdUser.toString(),
      }),
      components: [actionRow([confirmButton])],
    });

    const filter = (int: MessageComponentInteraction) =>
      trisalIds.includes(int.user.id) && int.customId.startsWith(`${ctx.interaction.id}`);

    const collector = ctx.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    const acceptedIds: string[] = [];

    collector.on('collect', async (int) => {
      if (!acceptedIds.includes(int.user.id)) acceptedIds.push(int.user.id);
      int.deferUpdate().catch(debugError);

      if (acceptedIds.length === 3) {
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'commands:trisal.done'),
          components: [
            actionRow([confirmButton.setDisabled(true).setEmoji(emojis.ring).setLabel('')]),
          ],
        });

        await ctx.client.repositories.relationshipRepository.trisal(
          firstUser.id,
          secondUser.id,
          thirdUser.id,
        );
      }
    });

    collector.once('end', () => {
      if (acceptedIds.length !== 3)
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:trisal.error'),
          components: [actionRow(disableComponents(ctx.locale('common:timesup'), [confirmButton]))],
        });
    });
  }

  static async orderTrisal(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.data.user.trisal.length === 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.not-in-trisal'),
        ephemeral: true,
      });
      return;
    }

    const newIdOrder = [
      ctx.options.getUser('primeiro_usuário', true).id,
      ctx.options.getUser('segundo_usuário', true).id,
      ctx.options.getUser('terceiro_usuário', true).id,
    ];

    if (ctx.data.user.trisal.length === 2) ctx.data.user.trisal.push(ctx.author.id);

    if (newIdOrder.some((a) => !ctx.data.user.trisal.includes(a))) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.some-user-not-in-trisal'),
        ephemeral: true,
      });
      return;
    }

    if (
      newIdOrder[1] === newIdOrder[2] ||
      newIdOrder[0] === newIdOrder[2] ||
      newIdOrder[0] === newIdOrder[1]
    ) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.same-mention'),
        ephemeral: true,
      });
      return;
    }

    ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:trisal.order-done') });

    await ctx.client.repositories.relationshipRepository.trisal(
      newIdOrder[0],
      newIdOrder[1],
      newIdOrder[2],
    );
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand();

    switch (command) {
      case 'ver':
        return TrisalCommand.displayTrisal(ctx);
      case 'ordem':
        return TrisalCommand.orderTrisal(ctx);
      case 'terminar':
        return TrisalCommand.finishTrisal(ctx);
      case 'formar':
        return TrisalCommand.makeTrisal(ctx);
    }
  }
}
