import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { actionRow, resolveCustomId } from '@utils/Util';
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
    }
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
      if (resolveCustomId(int.customId) === 'NEGATE') {
        collector.stop('OWO');
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:party.create_cancelled', {
            user: int.user.username,
          }),
        });
        return;
      }

      if (acceptedIds.includes(int.user.id)) return;
      acceptedIds.push(int.user.id);

      if (acceptedIds.length !== availableIds.length) return;

      collector.stop('nya');

      await ctx.client.repositories.roleplayRepository.createParty(ctx.author.id, acceptedIds);

      ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:party.create_success') });
    });
  }
}
