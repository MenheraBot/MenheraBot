import { FluffetyRace, FluffetySchema } from '@custom_types/Menhera';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/Constants';
import Util, { actionRow, disableComponents, capitalize, resolveCustomId } from '@utils/Util';
import {
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
  User,
} from 'discord.js-light';
import { getCommode, getFluffetyStats } from '@fluffety/FluffetyUtils';
import { DISPLAY_FLUFFETY_ORDER as houseOrder } from '@fluffety/Constants';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';
import {
  executeBedroom,
  executeKitchen,
  executeOutisde,
} from '@fluffety/structures/ExecuteCommodes';

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
        {
          type: 'SUB_COMMAND_GROUP',
          name: 'relacionamentos',
          description: '「✨」・Gerencie suas relações com outros fluffetys',
          options: [
            {
              type: 'SUB_COMMAND',
              name: 'lista',
              description: '「📜」・Veja suas relações atuais',
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
      case 'lista':
        return FluffetyCommand.ListRelationshipsCommand(ctx);
    }
  }

  static async ListRelationshipsCommand(ctx: InteractionCommandContext): Promise<void> {
    const fluffetyRelations =
      await ctx.client.repositories.relationshipRepository.getAllFluffetyRelations(ctx.author.id);

    if (fluffetyRelations.length === 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse(
          'error',
          'commands:fluffety.relacionamentos.lista.no-relations',
        ),
      });
      return;
    }

    const embed = new MessageEmbed()
      .setDescription(
        fluffetyRelations
          .map((a) =>
            ctx.locale('commands:fluffety.relacionamentos.lista.display', {
              owner: a.leftOwner === ctx.author.id ? a.rightOwner : a.leftOwner,
              name: a.leftOwner === ctx.author.id ? a.rightName : a.leftName,
              level: a.relationshipLevel,
            }),
          )
          .join('\n'),
      )
      .setTitle(
        ctx.locale('commands:fluffety.relacionamentos.lista.title', {
          fluffety:
            fluffetyRelations[0].leftOwner === ctx.author.id
              ? fluffetyRelations[0].leftName
              : fluffetyRelations[0].rightName,
        }),
      )
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setColor(ctx.data.user.selectedColor);

    ctx.makeMessage({ embeds: [embed] });
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
    let mainCommodeIndex = Math.floor(houseOrder.length / 2);

    const updateCommodes = async (order?: 'next' | 'last') => {
      if (order === 'next') {
        if (mainCommodeIndex === houseOrder.length - 1) mainCommodeIndex = 0;
        else mainCommodeIndex += 1;
      }

      if (order === 'last') {
        if (mainCommodeIndex === 0) mainCommodeIndex = houseOrder.length - 1;
        else mainCommodeIndex -= 1;
      }

      const mainCommode = getCommode(houseOrder, mainCommodeIndex);
      const nextCommode = getCommode(houseOrder, mainCommodeIndex, 'next');
      const lastCommode = getCommode(houseOrder, mainCommodeIndex, 'last');
      const percentages = getFluffetyStats(fluffety);

      const lastButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | LAST`)
        .setStyle('SECONDARY')
        .setLabel(ctx.locale(`data:fluffety.commodes.${lastCommode.identifier as 'outside'}.name`))
        .setEmoji(lastCommode.emoji);

      const mainButton = new MessageButton()
        .setStyle('PRIMARY')
        .setCustomId(`${ctx.interaction.id} | ${mainCommode.identifier.toUpperCase()}`)
        .setLabel(
          ctx.locale(
            `commands:fluffety.actions.${mainCommode.action as 'eat'}${
              mainCommode.actionIdentifier === fluffety.currentAction.identifier ? '-active' : ''
            }`,
          ),
        )
        .setEmoji(mainCommode.emoji);

      const nextButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | NEXT`)
        .setStyle('SECONDARY')
        .setLabel(ctx.locale(`data:fluffety.commodes.${nextCommode.identifier as 'outside'}.name`))
        .setEmoji(nextCommode.emoji);

      const embed = new MessageEmbed()
        .setTitle(
          ctx.locale('commands:fluffety.display.title', {
            name: fluffety.fluffetyName ?? 'Marquinhos',
            commode: capitalize(
              ctx.locale(`data:fluffety.commodes.${mainCommode.identifier as 'outside'}.name`),
            ),
          }),
        )
        .setDescription(
          ctx.locale('commands:fluffety.display.description', {
            // hungry: percentages.foody,
            // health: percentages.healty,
            happy: percentages.happy,
            energy: percentages.energy,
            action: ctx.locale(
              `commands:fluffety.actions.current-${fluffety.currentAction.identifier}`,
            ),
          }),
        )
        .setAuthor({
          name: owner.tag,
          iconURL: owner.displayAvatarURL({ size: 512 }),
        })
        .setColor(ctx.data.user.selectedColor);

      const image = await requestPicassoImage(
        PicassoRoutes.Fluffety,
        {
          commode: mainCommode.identifier,
          race: fluffety.race,
          percentages,
          action: fluffety.currentAction.identifier,
        },
        ctx,
      );

      if (!image.err) {
        embed.setImage('attachment://fluffety.png');

        ctx.makeMessage({
          embeds: [embed],
          attachments: [],
          files: [new MessageAttachment(image.data, 'fluffety.png')],
          components: [actionRow([lastButton, mainButton, nextButton])],
        });
        return;
      }

      embed.setFooter({ text: ctx.locale('common:http-error') });

      ctx.makeMessage({
        embeds: [embed],
        attachments: [],
        components: [actionRow([lastButton, mainButton, nextButton])],
      });
    };

    updateCommodes();

    const collector = ctx.channel.createMessageComponentCollector({
      idle: 15_000,
      componentType: 'BUTTON',
      filter: (int) => int.user.id === ctx.author.id && int.customId.startsWith(ctx.interaction.id),
    });

    collector.on('end', (_, reason) => {
      if (reason === 'idle')
        ctx.makeMessage({
          components: [
            actionRow(
              disableComponents(ctx.locale('common:timesup'), [
                new MessageButton().setStyle('SECONDARY').setCustomId('a'),
                new MessageButton().setStyle('PRIMARY').setCustomId('b'),
                new MessageButton().setStyle('SECONDARY').setCustomId('c'),
              ]),
            ),
          ],
        });
    });

    collector.on('collect', async (int) => {
      switch (resolveCustomId(int.customId)) {
        case 'NEXT':
          int.deferUpdate();
          updateCommodes('next');
          break;
        case 'LAST':
          int.deferUpdate();
          updateCommodes('last');
          break;
        case 'BEDROOM': {
          int.deferUpdate();
          const didCommandEnd = await executeBedroom(ctx, fluffety, getFluffetyStats(fluffety));
          if (didCommandEnd) return collector.stop('finish');
          updateCommodes();
          break;
        }
        case 'KITCHEN':
          executeKitchen(ctx, fluffety);
          break;
        case 'OUTSIDE':
          executeOutisde(ctx, fluffety);
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
