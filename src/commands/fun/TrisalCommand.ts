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
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class TrisalCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'polyamory',
      nameLocalizations: { 'pt-BR': 'trisal' },
      description: '「💘」・Start a poliamory with your friends',
      descriptionLocalizations: { 'pt-BR': '「💘」・Faça um belo trisal com seus amigos' },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'First User',
          descriptionLocalizations: { 'pt-BR': 'Primeiro usuário do trisal' },
          required: false,
        },
        {
          name: 'second_user',
          nameLocalizations: { 'pt-BR': 'segundo_usuário' },
          type: 'USER',
          description: '',
          descriptionLocalizations: { 'pt-BR': 'Segundo usuário do trisal' },
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      authorDataFields: ['trisal', 'selectedColor'],
    });
  }

  static async displayTrisal(ctx: InteractionCommandContext): Promise<void> {
    const marryTwo = await ctx.client.users.fetch(ctx.data.user.trisal[0]).catch(debugError);
    const marryThree = await ctx.client.users.fetch(ctx.data.user.trisal[1]).catch(debugError);

    if (!marryTwo || !marryThree) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.marry-not-found'),
        ephemeral: true,
      });
      return;
    }

    const userOneAvatar = ctx.author.displayAvatarURL({ dynamic: false, size: 512, format: 'png' });
    const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 512, format: 'png' });
    const userThreeAvatar = marryThree.displayAvatarURL({
      dynamic: false,
      size: 512,
      format: 'png',
    });

    const res = await requestPicassoImage(
      PicassoRoutes.Trisal,
      { userOne: userOneAvatar, userTwo: userTwoAvatar, userThree: userThreeAvatar },
      ctx,
    );

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
        ephemeral: true,
      });
      return;
    }

    const attachment = new MessageAttachment(res.data, 'trisal.png');

    const embed = new MessageEmbed()
      .setDescription(`${ctx.author.toString()}, ${marryTwo.toString()}, ${marryThree.toString()}`)
      .setTitle(ctx.locale('commands:trisal.title'))
      .setColor(ctx.data.user.selectedColor)
      .setImage('attachment://trisal.png');

    const untrisalButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | UNTRISAL`)
      .setLabel(ctx.locale('commands:trisal.untrisal.breakup'))
      .setStyle('DANGER');

    await ctx.makeMessage({
      embeds: [embed],
      files: [attachment],
      components: [actionRow([untrisalButton])],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) &&
      [ctx.author.id, ...ctx.data.user.trisal].includes(int.user.id);

    const didBreakup = await Util.collectComponentInteractionWithCustomFilter(
      ctx.channel,
      filter,
      15000,
    );

    if (!didBreakup) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [untrisalButton]))],
      });
      return;
    }

    const sureButton = new MessageButton()
      .setStyle('DANGER')
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:trisal.untrisal.breakup'));

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:trisal.untrisal.sure'),
      components: [actionRow([sureButton])],
      embeds: [],
    });

    const confirmed = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15000,
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

    await ctx.client.repositories.relationshipRepository.untrisal(
      ctx.author.id,
      ctx.data.user.trisal[0],
      ctx.data.user.trisal[1],
    );
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.data.user.trisal.length === 0 && !ctx.options.getUser('user')) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-args'),
        ephemeral: true,
      });
      return;
    }

    if (ctx.data.user.trisal.length > 0) return TrisalCommand.displayTrisal(ctx);

    const firstUser = ctx.options.getUser('user');
    const secondUser = ctx.options.getUser('second_dois');

    if (!firstUser || !secondUser) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-args'),
        ephemeral: true,
      });
      return;
    }

    if (firstUser.bot || secondUser.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.bot-mention'),
        ephemeral: true,
      });
      return;
    }

    if (firstUser.id === ctx.author.id || secondUser.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (firstUser.id === secondUser.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.same-mention'),
        ephemeral: true,
      });
      return;
    }

    const [firstUserData, secondUserData] = await Promise.all([
      ctx.client.repositories.userRepository.find(firstUser.id, ['ban', 'trisal']),
      ctx.client.repositories.userRepository.find(secondUser.id, ['ban', 'trisal']),
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
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('common:accept'))
      .setStyle('SUCCESS');

    ctx.makeMessage({
      content: ctx.locale('commands:trisal.accept-message', {
        author: ctx.author.toString(),
        first: firstUser.toString(),
        second: secondUser.toString(),
      }),
      components: [actionRow([confirmButton])],
    });

    const acceptableIds = [ctx.author.id, firstUser.id, secondUser.id];

    const filter = (int: MessageComponentInteraction) =>
      acceptableIds.includes(int.user.id) && int.customId === ctx.interaction.id;

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
          ctx.author.id,
          firstUser.id,
          secondUser.id,
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
}
