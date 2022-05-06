import { FluffetyRace, FluffetySchema } from '@custom_types/Menhera';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/Constants';
import Util, { actionRow, disableComponents, capitalize } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction, User } from 'discord.js-light';
import { getFluffetyStats } from '@fluffety/FluffetyUtils';

export default class FluffetyCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'fluffety',
      description: '「🐰」・Cuide da sua fofura de estimação',
      category: 'fluffety',
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'info',
          description: '「🐰」・Veja o fluffety de alguém',
          options: [
            {
              type: 'USER',
              name: 'user',
              description: 'Dono do flufetty que você quer ver',
              required: false,
            },
          ],
        },
      ],
      cooldown: 5,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand();

    switch (command) {
      case 'info':
        return FluffetyCommand.InfoCommand(ctx);
    }
  }

  static async InfoCommand(ctx: InteractionCommandContext): Promise<void> {
    const fluffetyOwner = ctx.options.getUser('user', false) ?? ctx.author;
    const fluffety = await ctx.client.repositories.fluffetyRepository.findUserFluffety(
      fluffetyOwner.id,
    );

    if (!fluffety && ctx.author.id === fluffetyOwner.id) return FluffetyCommand.AdoptFlufetty(ctx);

    if (!fluffety) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:fluffety.unexists'),
        ephemeral: true,
      });
      return;
    }

    return FluffetyCommand.DisplayFluffety(ctx, fluffety, fluffetyOwner);
  }

  static async DisplayFluffety(
    ctx: InteractionCommandContext,
    fluffety: FluffetySchema,
    owner: User,
  ): Promise<void> {
    const percentages = getFluffetyStats(fluffety);

    const embed = new MessageEmbed()
      .setTitle(fluffety.fluffetyName ?? `Um ${capitalize(fluffety.race)} Fofo`)
      .setAuthor({
        name: owner.tag,
        iconURL: owner.displayAvatarURL({ size: 512 }),
      })
      .setColor(ctx.data.user.selectedColor)
      .setDescription(
        ctx.locale('commands:fluffety.description', {
          hungry: percentages.foody,
          happy: percentages.happy,
          energy: percentages.energy,
          health: percentages.healty,
        }),
      );

    ctx.makeMessage({ embeds: [embed] });
  }

  static async AdoptFlufetty(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('lhama', 'commands:fluffety.adopt.title'))
      .setDescription(ctx.locale('commands:fluffety.adopt.description'))
      .addField(
        ctx.locale('commands:fluffety.adopt.types-title'),
        ctx.locale('commands:fluffety.adopt.types-description'),
      )
      .addFields(
        {
          name: ctx.locale('data:fluffety.hamsin.name'),
          value: ctx.locale('data:fluffety.hamsin.description'),
          inline: true,
        },
        {
          name: ctx.locale('data:fluffety.pingus.name'),
          value: ctx.locale('data:fluffety.pingus.description'),
          inline: true,
        },
        {
          name: ctx.locale('data:fluffety.chikys.name'),
          value: ctx.locale('data:fluffety.chikys.description'),
          inline: true,
        },
      )
      .setImage('https://i.imgur.com/HelM8YT.png')
      .setColor(ctx.data.user.selectedColor);

    const selectMenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setPlaceholder(ctx.locale('commands:fluffety.adopt.select'))
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        {
          label: ctx.locale('data:fluffety.hamsin.name'),
          value: 'hamsin',
          emoji: emojis.hamsin,
        },
        {
          label: ctx.locale('data:fluffety.pingus.name'),
          value: 'pingus',
          emoji: emojis.pingus,
        },
        {
          label: ctx.locale('data:fluffety.chikys.name'),
          value: 'chikys',
          emoji: emojis.chikys,
        },
      );

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selectMenu])] });

    const selected = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15000,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    const chosenRace = selected.values[0] as FluffetyRace;
    await ctx.client.repositories.fluffetyRepository.createUserFluffety(ctx.author.id, chosenRace);

    ctx.makeMessage({
      content: ctx.prettyResponse(chosenRace, 'commands:fluffety.adopt.success', {
        race: ctx.locale(`data:fluffety.${chosenRace}.name`),
      }),
      embeds: [],
      components: [],
    });
  }
}
