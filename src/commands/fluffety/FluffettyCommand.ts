import { FluffetyRace, FluffetySchema } from '@custom_types/Menhera';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/Constants';
import Util, { actionRow, disableComponents, capitalize, resolveCustomId } from '@utils/Util';
import {
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
  User,
} from 'discord.js-light';
import { getCommode, getFluffetyStats } from '@fluffety/FluffetyUtils';
import { DISPLAY_FLUFFETY_ORDER as houseOrder } from '@fluffety/Constants';
import { executeBedroom, executeKitchen } from '@fluffety/structures/ExecuteCommodes';

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

    let mainCommodeIndex = Math.floor(houseOrder.length / 2);
    let mainCommode = getCommode(houseOrder, mainCommodeIndex);
    let nextCommode = getCommode(houseOrder, mainCommodeIndex, 'next');
    let lastCommode = getCommode(houseOrder, mainCommodeIndex, 'last');

    const nextButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEXT`)
      .setStyle('SECONDARY')
      .setLabel(ctx.locale(`data:fluffety.commodes.${nextCommode.identifier as 'outside'}.name`))
      .setEmoji(nextCommode.emoji);

    const mainButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ${mainCommode.identifier.toUpperCase()}`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale(`common:fluffety.actions.${mainCommode.action as 'eat'}`))
      .setEmoji(mainCommode.emoji);

    const lastButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | LAST`)
      .setStyle('SECONDARY')
      .setLabel(ctx.locale(`data:fluffety.commodes.${lastCommode.identifier as 'outside'}.name`))
      .setEmoji(lastCommode.emoji);

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:fluffety.display.title', {
          name: fluffety.fluffetyName ?? 'Marquinhos',
          commode: capitalize(
            ctx.locale(`data:fluffety.commodes.${mainCommode.identifier as 'outside'}.name`),
          ),
        }),
      )
      .setAuthor({
        name: owner.tag,
        iconURL: owner.displayAvatarURL({ size: 512 }),
      })
      .setColor(ctx.data.user.selectedColor)
      .setDescription(
        ctx.locale('commands:fluffety.display.description', {
          hungry: percentages.foody,
          happy: percentages.happy,
          energy: percentages.energy,
          health: percentages.healty,
        }),
      );

    const changeCommodes = (order: 'next' | 'last') => {
      if (order === 'next') {
        if (mainCommodeIndex === houseOrder.length - 1) mainCommodeIndex = 0;
        else mainCommodeIndex += 1;
      }

      if (order === 'last') {
        if (mainCommodeIndex === 0) mainCommodeIndex = houseOrder.length - 1;
        else mainCommodeIndex -= 1;
      }

      mainCommode = getCommode(houseOrder, mainCommodeIndex);
      nextCommode = getCommode(houseOrder, mainCommodeIndex, 'next');
      lastCommode = getCommode(houseOrder, mainCommodeIndex, 'last');

      mainButton
        .setCustomId(`${ctx.interaction.id} | ${mainCommode.identifier.toUpperCase()}`)
        .setLabel(ctx.locale(`common:fluffety.actions.${mainCommode.action as 'eat'}`))
        .setEmoji(mainCommode.emoji);

      nextButton
        .setLabel(ctx.locale(`data:fluffety.commodes.${nextCommode.identifier as 'outside'}.name`))
        .setEmoji(nextCommode.emoji);

      lastButton
        .setLabel(ctx.locale(`data:fluffety.commodes.${lastCommode.identifier as 'outside'}.name`))
        .setEmoji(lastCommode.emoji);

      embed.setTitle(
        ctx.locale('commands:fluffety.display.title', {
          name: fluffety.fluffetyName ?? 'Marquinhos',
          commode: capitalize(
            ctx.locale(`data:fluffety.commodes.${mainCommode.identifier as 'outside'}.name`),
          ),
        }),
      );

      ctx.makeMessage({
        embeds: [embed],
        components: [actionRow([lastButton, mainButton, nextButton])],
      });
    };

    if (ctx.author.id !== owner.id) mainButton.setDisabled(true);

    const collector = ctx.channel.createMessageComponentCollector({
      idle: 15_000,
      componentType: 'BUTTON',
      filter: (int) => int.user.id === ctx.author.id && int.customId.startsWith(ctx.interaction.id),
    });

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([lastButton, mainButton, nextButton])],
    });

    collector.on('end', (_, reason) => {
      if (reason === 'idle')
        ctx.makeMessage({
          components: [
            actionRow(
              disableComponents(ctx.locale('common:timesup'), [lastButton, mainButton, nextButton]),
            ),
          ],
        });
    });

    collector.on('collect', (int) => {
      switch (resolveCustomId(int.customId)) {
        case 'NEXT':
          int.deferUpdate();
          changeCommodes('next');
          break;
        case 'LAST':
          int.deferUpdate();
          changeCommodes('last');
          break;
        case 'BEDROOM':
          executeBedroom(ctx);
          break;
        case 'KITCHEN':
          executeKitchen(ctx);
          break;
        case 'OUTSIDE':
          executeKitchen(ctx);
          break;
      }
    });
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
