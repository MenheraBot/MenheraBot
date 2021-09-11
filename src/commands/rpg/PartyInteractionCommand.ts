import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import { MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Util from '@utils/Util';

export default class PartyInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'party',
      description:
        '【ＲＰＧ】Inicie um grupo com pessoas da sua localização para irem à uma batalha contra monstros',
      category: 'rpg',
      options: [
        {
          name: 'user_one',
          description: 'Primeiro usuário da party',
          type: 'USER',
          required: false,
        },
        {
          name: 'user_two',
          description: 'Segundo usuário da party',
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.replyL('error', 'common:not-registred', {}, true);
      return;
    }

    const userParty = await this.client.repositories.rpgRepository.getUserParty(user.id);
    const userOne = ctx.options.getUser('user_one');
    const userTwo = ctx.options.getUser('user_two');

    if (userOne?.id === ctx.author.id || userTwo?.id === ctx.author.id) {
      ctx.replyT('error', 'self-mention', {}, true);
      return;
    }

    if (userOne && userOne.id === userTwo?.id) {
      ctx.replyT('error', 'same-mention', {}, true);
      return;
    }

    if (!userParty && !userOne && !userTwo) {
      ctx.replyT('error', 'no-mention', {}, true);
      return;
    }

    const embed = new MessageEmbed().setTitle(ctx.translate('title')).setColor(ctx.data.user.cor);

    if (userParty) {
      embed.setDescription(ctx.translate('description'));
      embed.addField(
        ctx.author.username,
        ctx.translate('stats', {
          life: user.life,
          maxLife: user.maxLife,
          mana: user.mana,
          maxMana: user.maxMana,
          tiredness: user.tiredness,
        }),
      );
      const toDel: string[] = [ctx.author.id];
      const promises = userParty.party.map(async (a) => {
        toDel.push(a);
        const fetchedUser = await this.client.users.fetch(a);
        const userStats = await this.client.repositories.rpgRepository.findUser(a);
        if (!userStats || !fetchedUser)
          return embed.addField(ctx.translate('not-found'), ctx.translate('not-found-value'), true);

        embed.addField(
          fetchedUser.username,
          ctx.translate('stats', {
            life: userStats.life,
            maxLife: userStats.maxLife,
            mana: userStats.mana,
            maxMana: userStats.maxMana,
            tiredness: userStats.tiredness,
          }),
          true,
        );
      });

      await Promise.all(promises);

      const finishButton = new MessageButton()
        .setCustomId(ctx.interaction.id)
        .setStyle('DANGER')
        .setLabel(ctx.translate('over'));

      ctx.reply({
        embeds: [embed],
        components: [{ type: 'ACTION_ROW', components: [finishButton] }],
      });

      const collected = await Util.collectComponentInteractionWithId(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        10000,
      );

      if (!collected) {
        ctx.editReply({
          components: [
            {
              type: 'ACTION_ROW',
              components: [finishButton.setDisabled(true).setLabel(ctx.locale('common:timesup'))],
            },
          ],
        });
        return;
      }

      toDel.forEach((a) => {
        this.client.repositories.rpgRepository.deleteParty(a);
      });

      ctx.editReply({
        content: ctx.translate('party-end', {
          author: ctx.author.toString(),
          users: toDel.map((a) => `<@${a}>`).join(', '),
        }),
        components: [],
        embeds: [],
      });

      return;
    }

    const ids: string[] = [];

    if (userOne) {
      ids.push(userOne.id);

      const isUserBanned = await this.client.repositories.blacklistRepository.isUserBanned(
        userOne.id,
      );

      if (isUserBanned) {
        ctx.replyT('error', 'user-banned', { user: userOne.toString() }, true);
        return;
      }

      const findedUser = await this.client.repositories.rpgRepository.findUser(userOne.id);
      if (!findedUser) {
        ctx.replyT('error', 'user-banned', { user: userOne.toString() }, true);
        return;
      }
      const firstPary = await this.client.repositories.rpgRepository.getUserParty(userOne.id);
      if (firstPary) {
        ctx.replyT('error', 'user-has-party', { user: userOne.toString() }, true);
        return;
      }
    }

    if (userTwo) {
      ids.push(userTwo.id);

      const isUserBanned = await this.client.repositories.blacklistRepository.isUserBanned(
        userTwo.id,
      );

      if (isUserBanned) {
        ctx.replyT('error', 'user-banned', { user: userTwo.toString() }, true);
        return;
      }

      const findedUser = await this.client.repositories.rpgRepository.findUser(userTwo.id);
      if (!findedUser) {
        ctx.replyT('error', 'user-not-registred', { user: userTwo.toString() }, true);
        const secondParty = await this.client.repositories.rpgRepository.getUserParty(userTwo.id);
        if (secondParty) {
          ctx.replyT('error', 'user-has-party', { user: userTwo.toString() }, true);
          return;
        }
      }
    }

    const length = userOne && userTwo ? 2 : 1;

    embed.setDescription(
      ctx.translate('ask-desc', { count: length, author: ctx.author.toString() }),
    );

    const acceptButton = new MessageButton()
      .setLabel(ctx.locale('common:accept'))
      .setStyle('SUCCESS')
      .setEmoji(emojis.success)
      .setCustomId(ctx.interaction.id);

    ctx.reply({
      content:
        // eslint-disable-next-line no-nested-ternary
        length === 2
          ? `${userOne?.toString()} ${userTwo?.toString()}`
          : userOne
          ? userOne.toString()
          : userTwo?.toString(),
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [acceptButton] }],
    });

    const accepted: string[] = [];

    const filter = (int: MessageComponentInteraction) => {
      int.deferUpdate();
      if (int.customId !== ctx.interaction.id) return false;
      if (!ids.includes(int.user.id)) return false;
      accepted.push(int.user.id);
      return true;
    };

    const collector = ctx.channel.createMessageComponentCollector({
      filter,
      time: 10000,
      max: length,
      componentType: 'BUTTON',
    });

    collector.on('end', () => {
      if (accepted.length !== length) {
        ctx.editReply({ components: [], content: ctx.translate('not-accepted'), embeds: [] });
        return;
      }

      if (length === 1) {
        this.client.repositories.rpgRepository.createParty(ctx.author.id, accepted, ctx.author.id);
        this.client.repositories.rpgRepository.createParty(
          accepted[0],
          [ctx.author.id],
          ctx.author.id,
        );
      } else {
        this.client.repositories.rpgRepository.createParty(ctx.author.id, accepted, ctx.author.id);
        this.client.repositories.rpgRepository.createParty(
          accepted[0],
          [ctx.author.id, accepted[1]],
          ctx.author.id,
        );
        this.client.repositories.rpgRepository.createParty(
          accepted[1],
          [ctx.author.id, accepted[0]],
          ctx.author.id,
        );
      }

      ctx.editReply({
        embeds: [embed.setDescription(ctx.translate('success'))],
        components: [
          {
            type: 'ACTION_ROW',
            components: [acceptButton.setDisabled(true).setStyle('SECONDARY')],
          },
        ],
      });
    });
  }
}
