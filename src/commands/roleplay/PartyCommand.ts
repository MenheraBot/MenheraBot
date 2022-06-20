import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { actionRow, resolveCustomId } from '@utils/Util';
import moment from 'moment';
import { MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js-light';

export default class PartyCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'grupo',
      description: '「🔱」・Forme um grupo de até 3 pessoas para se aventurar contigo',
      nameLocalizations: { 'en-US': 'party' },
      descriptionLocalizations: {
        'en-US': '「🔱」・Enter in a party up to 3 people to adventure with you',
      },
      options: [
        {
          name: 'criar',
          nameLocalizations: { 'en-US': 'create' },
          description: '「🔱」・Forme um grupo de até 3 pessoas para se aventurar contigo',
          descriptionLocalizations: {
            'en-US': '「🔱」・Enter in a party up to 3 people to adventure with you',
          },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user_um',
              type: 'USER',
              description: 'Um dos integrantes de seu grupo',
              required: true,
              nameLocalizations: { 'en-US': 'user_one' },
              descriptionLocalizations: { 'en-US': 'One of the group members' },
            },
            {
              name: 'user_dois',
              type: 'USER',
              description: 'Um dos integrantes de seu grupo',
              required: false,
              nameLocalizations: { 'en-US': 'user_two' },
              descriptionLocalizations: { 'en-US': 'One of the group members' },
            },
          ],
        },
        {
          name: 'sair',
          nameLocalizations: { 'en-US': 'left' },
          description: '「🔱」・Saida do seu grupo atual',
          descriptionLocalizations: { 'en-US': '「🔱」・Left your current party' },
          type: 'SUB_COMMAND',
        },
        {
          name: 'ver',
          nameLocalizations: { 'en-US': 'see' },
          description: '「🔱」・Veja o grupo de alguém',
          descriptionLocalizations: { 'en-US': '「🔱」・See someones current party' },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              type: 'USER',
              description: 'Usuário que você quer ver o grupo',
              required: false,
              descriptionLocalizations: { 'en-US': 'User that you want to see the party' },
            },
          ],
        },
      ],
      category: 'roleplay',
      authorDataFields: ['selectedColor'],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand();

    switch (command) {
      case 'criar':
        return PartyCommand.createParty(ctx);
      case 'sair':
        return PartyCommand.leftParty(ctx);
      case 'ver':
        return PartyCommand.seeParty(ctx);
    }
  }

  static async seeParty(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const userParty = await ctx.client.repositories.roleplayRepository.getUserParty(user.id);

    if (!userParty) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.user-not-in-party', {
          user: user.username,
        }),
      });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('crown', 'commands:party.party-of', { user: user.username }))
      .setColor(ctx.data.user.selectedColor)
      .setDescription(
        ctx.locale('commands:party.party-description', {
          owner:
            ctx.client.users.cache.get(userParty.ownerId)?.username ?? `ID: ${userParty.ownerId}`,
          users: userParty.users
            .map((u) => ctx.client.users.cache.get(u)?.username ?? `ID: ${u}`)
            .concat(user.username)
            .join(', '),
          time: moment.duration(userParty.ttl, 'seconds').format('mm:ss'),
        }),
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    ctx.makeMessage({ embeds: [embed] });
  }

  static async leftParty(ctx: InteractionCommandContext): Promise<void> {
    const userParty = await ctx.client.repositories.roleplayRepository.getUserParty(ctx.author.id);

    if (!userParty) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:party.not-in-party') });
      return;
    }

    ctx.client.repositories.roleplayRepository.deleteUserParty(ctx.author.id);

    userParty.users.forEach((user) =>
      ctx.client.repositories.roleplayRepository.deleteUserParty(user),
    );

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:party.left-party', {
        users: userParty.users.map((user) => `<@${user}>`).join(', '),
      }),
    });
  }

  static async createParty(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:unregistered'),
        ephemeral: true,
      });
      return;
    }

    if (await ctx.client.repositories.roleplayRepository.getUserParty(ctx.author.id)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.already_in_party'),
        ephemeral: true,
      });
      return;
    }

    const userOne = ctx.options.getUser('user_um', true);
    const userTwo = ctx.options.getUser('user_dois');

    if (userOne.bot || (userTwo && userTwo.bot)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.bot_in_party'),
        ephemeral: true,
      });
    }

    if (userOne.id === ctx.author.id || (userTwo && userTwo.id === ctx.author.id)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.cannot_invite_self'),
        ephemeral: true,
      });
      return;
    }

    if (await ctx.client.repositories.roleplayRepository.getUserParty(userOne.id)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.other_in_party', {
          user: userOne.username,
        }),
        ephemeral: true,
      });
      return;
    }

    if (userTwo && (await ctx.client.repositories.roleplayRepository.getUserParty(userTwo.id))) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.other_in_party', {
          user: userTwo.username,
        }),
        ephemeral: true,
      });
      return;
    }

    if (!(await ctx.client.repositories.roleplayRepository.findUser(userOne.id))) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.user_unregistered', {
          user: userOne.username,
        }),
        ephemeral: true,
      });
      return;
    }

    if (userTwo && !(await ctx.client.repositories.roleplayRepository.findUser(userOne.id))) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:party.user_unregistered', {
          user: userTwo.username,
        }),
        ephemeral: true,
      });
      return;
    }

    const maxUsers = userTwo ? 3 : 2;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:party.create_title'))
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setDescription(
        ctx.locale('commands:party.create_description', { user: ctx.author.username }),
      )
      .setFooter({ text: ctx.locale('commands:party.create_footer', { users: 0, maxUsers }) });

    const acceptButton = new MessageButton()
      .setStyle('PRIMARY')
      .setCustomId(`${ctx.interaction.id} | ACCEPT`)
      .setLabel(ctx.locale('common:accept'));

    const negateButton = new MessageButton()
      .setStyle('DANGER')
      .setCustomId(`${ctx.interaction.id} | NEGATE`)
      .setLabel(ctx.locale('common:negate'));

    const availableIds = [ctx.author.id, userOne.id, userTwo ? userTwo.id : null].filter(Boolean);

    ctx.makeMessage({
      content: availableIds.map((a) => `<@${a}>`).join(', '),
      embeds: [embed],
      components: [actionRow([acceptButton, negateButton])],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && availableIds.includes(int.user.id);

    const collector = ctx.channel.createMessageComponentCollector({ time: 15_000, filter });

    const acceptedIds: string[] = [];

    collector.on('end', (_, reason) => {
      if (reason !== 'time') return;
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:party.create_timesup'),
      });
    });

    collector.on('collect', async (int: MessageComponentInteraction) => {
      int.deferUpdate();
      if (resolveCustomId(int.customId) === 'NEGATE') {
        collector.stop();
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:party.create_cancelled', {
            user: int.user.username,
          }),
          embeds: [],
          components: [],
        });
        return;
      }

      if (acceptedIds.includes(int.user.id)) return;

      acceptedIds.push(int.user.id);
      embed.setFooter({
        text: ctx.locale('commands:party.create_footer', { users: acceptedIds.length, maxUsers }),
      });

      if (acceptedIds.length !== availableIds.length) {
        ctx.makeMessage({ embeds: [embed] });
        return;
      }

      collector.stop();

      await ctx.client.repositories.roleplayRepository.createParty(ctx.author.id, acceptedIds);

      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:party.create_success'),
        embeds: [],
        components: [],
      });
    });
  }
}
