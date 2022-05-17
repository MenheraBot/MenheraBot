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
import { FluffetyRelationLevels } from '@fluffety/Types';

export default class FluffetyCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'fluffety',
      description: '「🐰」・Cuide da sua fofura de estimação',
      descriptionLocalizations: { 'en-US': '「🐰」・Take care of your pet cuteness' },
      category: 'fluffety',
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'info',
          description: '「🐰」・Veja o fluffety de alguém',
          descriptionLocalizations: { 'en-US': "「🐰」・See someone's fluffety" },
          options: [
            {
              type: 'USER',
              name: 'dono',
              nameLocalizations: { 'en-US': 'owner' },
              description: 'Dono do flufetty que você quer ver',
              descriptionLocalizations: { 'en-US': 'Owner of the flufetty you want to see' },
              required: false,
            },
          ],
        },
        {
          type: 'SUB_COMMAND_GROUP',
          name: 'relacionamentos',
          nameLocalizations: { 'en-US': 'relationships' },
          description: '「✨」・Gerencie suas relações com outros fluffetys',
          descriptionLocalizations: {
            'en-US': '「✨」・Manage your relationships with other fluffetys',
          },
          options: [
            {
              type: 'SUB_COMMAND',
              name: 'lista',
              nameLocalizations: { 'en-US': 'list' },
              description: '「📜」・Veja suas relações atuais',
              descriptionLocalizations: { 'en-US': '「📜」・View your current relationships' },
            },
            {
              type: 'SUB_COMMAND',
              name: 'adicionar',
              nameLocalizations: { 'en-US': 'add' },
              description: '「✅」・Crie uma nova relação com um Fluffety',
              descriptionLocalizations: {
                'en-US': '「✅」・Build a new relationship with a Fluffety',
              },
              options: [
                {
                  type: 'USER',
                  name: 'dono',
                  nameLocalizations: { 'en-US': 'owner' },
                  description: 'Dono do flufetty que você quer criar uma relação',
                  descriptionLocalizations: {
                    'en-US': 'Flufetty owner you want to create a relationship with',
                  },
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'tipo',
                  nameLocalizations: { 'en-US': 'type' },
                  description: 'Tipo da relação que você quer criar',
                  descriptionLocalizations: { 'en-US': 'Type of relationship you want to create' },
                  required: true,
                  choices: [
                    {
                      name: 'Começar uma Amizade',
                      nameLocalizations: { 'en-US': 'Start a Friendship' },
                      value: 0,
                    },
                  ],
                },
              ],
            },
            {
              type: 'SUB_COMMAND',
              name: 'remover',
              nameLocalizations: { 'en-US': 'remove' },
              description: '「❌」・Corte relações com algum Fluffety',
              descriptionLocalizations: { 'en-US': '「❌」・Cut ties with some Fluffety' },
              options: [
                {
                  type: 'USER',
                  name: 'dono',
                  nameLocalizations: { 'en-US': 'owner' },
                  description: 'Dono do Flufetty que você quer cortar relações',
                  descriptionLocalizations: { 'en-US': 'Flufetty owner you want to cut ties' },
                  required: true,
                },
              ],
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
      case 'remover':
        return FluffetyCommand.RemoveRelationshipCommand(ctx);
      case 'adicionar':
        return FluffetyCommand.AddRelationshipCommand(ctx);
    }
  }

  static async upsertRelationshipLevel(
    ctx: InteractionCommandContext,
    authorId: string,
    targetId: string,
    relationLevel: FluffetyRelationLevels,
    relationExists: boolean,
    authorFluffetyName = '',
    targetFluffetyName = '',
  ): Promise<void> {
    if (!relationExists)
      await ctx.client.repositories.relationshipRepository.createFluffetyRelationship(
        authorId,
        targetId,
        authorFluffetyName,
        targetFluffetyName,
        relationLevel,
      );
    else
      await ctx.client.repositories.relationshipRepository.updateRelationshipLevel(
        authorId,
        targetId,
        relationLevel,
      );
  }

  static async AddRelationshipCommand(ctx: InteractionCommandContext): Promise<void> {
    const fluffetyOwner = ctx.options.getUser('dono', true);
    const relationshipType = ctx.options.getInteger('tipo', true) as FluffetyRelationLevels;

    if (fluffetyOwner.id === ctx.author.id) {
      ctx.makeMessage({
        content: ctx.prettyResponse(
          'error',
          'commands:fluffety.relacionamentos.adicionar.self-mention',
        ),
        ephemeral: true,
      });
      return;
    }

    const authorFluffety = await ctx.client.repositories.fluffetyRepository.findUserFluffety(
      ctx.author.id,
    );

    if (!authorFluffety) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:fluffety.author-unexists'),
        ephemeral: true,
      });
      return;
    }

    const targetFluffety = await ctx.client.repositories.fluffetyRepository.findUserFluffety(
      fluffetyOwner.id,
    );

    if (!targetFluffety) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:fluffety.unexists'),
        ephemeral: true,
      });
      return;
    }

    const acceptButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ACCEPT`)
      .setLabel(ctx.locale('common:accept'))
      .setStyle('SUCCESS');

    const negateButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEGATE`)
      .setLabel(ctx.locale('common:negate'))
      .setStyle('DANGER');

    ctx.makeMessage({
      content: ctx.prettyResponse(
        'question',
        `commands:fluffety.relacionamentos.adicionar.${relationshipType}-request`,
        {
          mention: fluffetyOwner.toString(),
          author: authorFluffety.fluffetyName,
          target: targetFluffety.fluffetyName,
        },
      ),
      components: [actionRow([negateButton, acceptButton])],
    });

    const response = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      fluffetyOwner.id,
      ctx.interaction.id,
      15000,
    );

    if (!response || resolveCustomId(response.customId) === 'NEGATE') {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:fluffety.relacionamentos.adicionar.negate', {
          mention: fluffetyOwner.toString(),
          fluffety: authorFluffety.fluffetyName,
          target: targetFluffety.fluffetyName,
        }),
        components: [],
      });
      return;
    }

    const existingRelation =
      await ctx.client.repositories.relationshipRepository.getFluffetyRelationship(
        ctx.author.id,
        fluffetyOwner.id,
      );

    FluffetyCommand.upsertRelationshipLevel(
      ctx,
      ctx.author.id,
      fluffetyOwner.id,
      FluffetyRelationLevels.Friends,
      !!existingRelation,
      authorFluffety.fluffetyName,
      targetFluffety.fluffetyName,
    );

    ctx.makeMessage({
      content: ctx.locale('commands:fluffety.relacionamentos.adicionar.success', {
        author: authorFluffety.fluffetyName,
        target: targetFluffety.fluffetyName,
        relationLevel: ctx.locale(`data:fluffety.relation-levels.${relationshipType}`),
      }),
      components: [],
    });
  }

  static async RemoveRelationshipCommand(ctx: InteractionCommandContext): Promise<void> {
    const fluffetyOwner = ctx.options.getUser('dono', true);

    if (fluffetyOwner.id === ctx.author.id) {
      ctx.makeMessage({
        content: ctx.prettyResponse(
          'error',
          'commands:fluffety.relacionamentos.remover.self-mention',
        ),
        ephemeral: true,
      });
      return;
    }

    const confirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | CONFIRM`)
      .setLabel(ctx.locale('common:confirm'))
      .setStyle('DANGER');

    const negateButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEGATE`)
      .setLabel(ctx.locale('common:negate'))
      .setStyle('SECONDARY');

    ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:fluffety.relacionamentos.remover.sure', {
        mention: fluffetyOwner.username,
      }),
      components: [actionRow([confirmButton, negateButton])],
    });

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      8000,
    );

    if (!selected || resolveCustomId(selected.customId) === 'NEGATE') {
      ctx.makeMessage({
        content: ctx.prettyResponse('heart', 'commands:fluffety.relacionamentos.remover.negate', {
          mention: fluffetyOwner.username,
        }),
        components: [],
      });
      return;
    }

    await ctx.client.repositories.relationshipRepository.deleteFluffetyRelation(
      ctx.author.id,
      fluffetyOwner.id,
    );

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:fluffety.relacionamentos.remover.complete', {
        mention: fluffetyOwner.username,
      }),
      components: [],
    });
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
    const fluffetyOwner = ctx.options.getUser('dono', false) ?? ctx.author;
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
            name: fluffety.fluffetyName,
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
    // TODO: PICK FLUFFETY NAME WITH MODAL
    await ctx.client.repositories.fluffetyRepository.createUserFluffety(
      ctx.author.id,
      chosenRace,
      '',
    );

    ctx.makeMessage({
      content: ctx.prettyResponse(chosenRace, 'commands:fluffety.adopt.success', {
        race: ctx.locale(`data:fluffety.${chosenRace}.name`),
      }),
      embeds: [],
      components: [],
    });
  }
}
