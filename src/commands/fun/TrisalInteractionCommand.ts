import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/Constants';
import { debugError } from '@utils/Util';

export default class TrisalInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'trisal',
      description:
        '「💘」・Inicie um trisal com mais dois amigos ou veja a metadinha de seu trisal',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Primeiro usuário do trisal',
          required: false,
        },
        {
          name: 'user_dois',
          type: 'USER',
          description: 'Segundo usuário do trisal',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      authorDataFields: ['trisal', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;
    if (authorData.trisal?.length === 0 && !ctx.options.getUser('user')) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-args'),
        ephemeral: true,
      });
      return;
    }

    if (authorData.trisal?.length > 0) {
      const marryTwo = await ctx.client.users.fetch(authorData.trisal[0]).catch(debugError);
      const marryThree = await ctx.client.users.fetch(authorData.trisal[1]).catch(debugError);

      if (!marryTwo || !marryThree) {
        await ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:trisal.marry-not-found'),
          ephemeral: true,
        });
        return;
      }

      const userOneAvatar = ctx.author.displayAvatarURL({
        dynamic: false,
        size: 256,
        format: 'png',
      });
      const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userThreeAvatar = marryThree.displayAvatarURL({
        dynamic: false,
        size: 256,
        format: 'png',
      });

      const res = await HttpRequests.trisalRequest(userOneAvatar, userTwoAvatar, userThreeAvatar);
      if (res.err) {
        await ctx.makeMessage({
          content: ctx.prettyResponse('error', 'common:http-error'),
          ephemeral: true,
        });
        return;
      }

      const attachment = new MessageAttachment(res.data, 'trisal.png');

      const embed = new MessageEmbed()
        .setDescription(
          `${ctx.author.toString()}, ${marryTwo.toString()}, ${marryThree.toString()}`,
        )
        .setTitle(ctx.locale('commands:trisal.title'))
        .setColor(ctx.data.user.selectedColor)
        .setImage('attachment://trisal.png');

      await ctx.makeMessage({ embeds: [embed], files: [attachment] });
      return;
    }

    const mencionado1 = ctx.options.getUser('user');
    const mencionado2 = ctx.options.getUser('user_dois');

    if (!mencionado1 || !mencionado2) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-args'),
        ephemeral: true,
      });
      return;
    }
    if (mencionado1.id === ctx.author.id || mencionado2.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.self-mention'),
        ephemeral: true,
      });
      return;
    }
    if (mencionado1.id === mencionado2.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.same-mention'),
        ephemeral: true,
      });
      return;
    }

    const user1 = authorData;
    const user2 = await ctx.client.repositories.userRepository.find(mencionado1.id);
    const user3 = await ctx.client.repositories.userRepository.find(mencionado2.id);

    if (!user1 || !user2 || !user3) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-db'),
        ephemeral: true,
      });
      return;
    }

    if (user1.ban === true || user2.ban === true || user3.ban === true) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.comedor-de-casadas'),
        ephemeral: true,
      });
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('common:accept'))
      .setStyle('SUCCESS');

    await ctx.makeMessage({
      content: `${ctx.locale(
        'commands:trisal.accept-message',
      )} ${ctx.author.toString()}, ${mencionado1.toString()}, ${mencionado2.toString()}`,
      components: [{ type: 'ACTION_ROW', components: [ConfirmButton] }],
    });

    const acceptableIds = [ctx.author.id, mencionado1.id, mencionado2.id];

    const filter = (int: MessageComponentInteraction) =>
      acceptableIds.includes(int.user.id) && int.customId === ctx.interaction.id;

    const collector = ctx.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    const acceptedIds: string[] = [];

    collector.on('collect', async (int) => {
      if (!acceptedIds.includes(int.user.id)) acceptedIds.push(int.user.id);
      int.deferUpdate().catch(() => null);

      if (acceptedIds.length === 3) {
        await ctx.makeMessage({
          content: ctx.prettyResponse('success', 'commands:trisal.done'),
          components: [
            {
              type: 'ACTION_ROW',
              components: [ConfirmButton.setDisabled(true).setEmoji(emojis.ring)],
            },
          ],
        });
        await ctx.client.repositories.relationshipRepository.trisal(user1.id, user2.id, user3.id);
      }
    });

    collector.once('end', () => {
      if (acceptedIds.length !== 3)
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:trisal.error'),
          components: [
            {
              type: 'ACTION_ROW',
              components: [
                ConfirmButton.setDisabled(true)
                  .setLabel(ctx.locale('common:timesup'))
                  .setStyle('SECONDARY'),
              ],
            },
          ],
        });
    });
  }
}
