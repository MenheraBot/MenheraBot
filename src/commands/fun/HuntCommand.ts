import 'moment-duration-format';
import moment from 'moment';
import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ApplicationCommandOptionChoiceData, MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import {
  huntEnum,
  HuntingTypes,
  HuntProbabiltyProps,
  IHuntCooldownBoostItem,
} from '@custom_types/Menhera';
import {
  calculateProbability,
  dropItem,
  getUserHuntCooldown,
  getUserHuntProbability,
} from '@utils/HuntUtils';
import { capitalize, getMagicItemById } from '@utils/Util';

type ChoiceTypes = HuntingTypes | 'probabilities';
const choices: Array<ApplicationCommandOptionChoiceData & { value: ChoiceTypes }> = [
  {
    name: '😈 | Demons',
    nameLocalizations: { 'pt-BR': '😈 | Demônios' },
    value: 'demons',
  },
  {
    name: '👊 | Giants',
    nameLocalizations: { 'pt-BR': '👊 | Gigantes' },
    value: 'giants',
  },
  {
    name: '👼 | Angels',
    nameLocalizations: { 'pt-BR': '👼 | Anjos' },
    value: 'angels',
  },
  {
    name: '🧚‍♂️ | Archangels',
    nameLocalizations: { 'pt-BR': '🧚‍♂️ | Arcanjos' },
    value: 'archangels',
  },
  {
    name: '🙌 | Demigods',
    nameLocalizations: { 'pt-BR': '🙌 | Semideuses' },
    value: 'demigods',
  },
  {
    name: '✝️ | Gods',
    nameLocalizations: { 'pt-BR': '✝️ | Deuses' },
    value: 'gods',
  },
  {
    name: '📊 | Probabilities',
    nameLocalizations: { 'pt-BR': '📊 | Probabilidades' },
    value: 'probabilities',
  },
];
export default class HuntCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'hunt',
      nameLocalizations: { 'pt-BR': 'caçar' },
      description: '「🎯」・Go on a hunt',
      descriptionLocalizations: { 'pt-BR': '「🎯」・Sai para uma caçada com Xandão' },
      options: [
        {
          name: 'type',
          nameLocalizations: { 'pt-BR': 'tipo' },
          type: 'STRING',
          description: 'Hunting Type',
          descriptionLocalizations: { 'pt-BR': 'Tipo da Caça' },
          required: true,
          choices,
        },
        {
          name: 'rolls',
          description: 'Number of rolls you want to use at once',
          descriptionLocalizations: {
            'pt-BR': 'Quantidade de rolls que você quer usar de uma vez só',
          },
          type: 'INTEGER',
          required: false,
          minValue: 1,
        },
      ],
      category: 'fun',
      cooldown: 7,
      authorDataFields: ['rolls', 'huntCooldown', 'inUseItems', 'selectedColor', 'inventory'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selected = ctx.options.getString('type', true) as ChoiceTypes;

    if (selected === 'probabilities') {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:cacar.probabilities'))
        .setColor(ctx.data.user.selectedColor)
        .addFields([
          {
            name: ctx.prettyResponse(huntEnum.DEMON, `commands:cacar.${huntEnum.DEMON}`),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.DEMON)
              .map((a) =>
                ctx.locale('commands:cacar.chances', {
                  count: a.amount,
                  percentage: a.probability,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.GIANT, `commands:cacar.${huntEnum.GIANT}`),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.GIANT)
              .map((a) =>
                ctx.locale('commands:cacar.chances', {
                  count: a.amount,
                  percentage: a.probability,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.ANGEL, `commands:cacar.${huntEnum.ANGEL}`),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.ANGEL)
              .map((a) =>
                ctx.locale('commands:cacar.chances', {
                  count: a.amount,
                  percentage: a.probability,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.ARCHANGEL, `commands:cacar.${huntEnum.ARCHANGEL}`),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.ARCHANGEL)
              .map((a) =>
                ctx.locale('commands:cacar.chances', {
                  count: a.amount,
                  percentage: a.probability,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.DEMIGOD, `commands:cacar.${huntEnum.DEMIGOD}`),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.DEMIGOD)
              .map((a) =>
                ctx.locale('commands:cacar.chances', {
                  count: a.amount,
                  percentage: a.probability,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.GOD, `commands:cacar.${huntEnum.GOD}`),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.GOD)
              .map((a) =>
                ctx.locale('commands:cacar.chances', {
                  count: a.amount,
                  percentage: a.probability,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
        ]);

      await ctx.makeMessage({
        embeds: [embed],
      });
      return;
    }

    const rollsToUse = ctx.options.getInteger('rolls');

    if (rollsToUse) {
      if (rollsToUse > ctx.data.user.rolls) {
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:cacar.rolls-poor'),
          ephemeral: true,
        });
        return;
      }
    }

    const canHunt = ctx.data.user.huntCooldown < Date.now();

    if (!canHunt && !rollsToUse) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:cacar.cooldown', {
          time: moment.utc(ctx.data.user.huntCooldown - Date.now()).format('mm:ss'),
        }),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const cooldown = getUserHuntCooldown(ctx.data.user.inUseItems, selected) + Date.now();

    const embed = new MessageEmbed()
      .setColor(COLORS.HuntDefault)
      .setThumbnail(avatar)
      .setTitle(ctx.locale(`commands:cacar.${selected}`));

    const toRun = canHunt && rollsToUse ? rollsToUse + 1 : rollsToUse ?? 1;

    const areYouTheHuntOrTheHunter = async (
      probability: Array<HuntProbabiltyProps>,
      huntType: HuntingTypes,
    ) => {
      let value = 0;
      let tries = 0;
      let success = 0;

      for (let i = toRun; i > 0; i--) {
        const taked = calculateProbability(probability);
        value += taked;
        tries += 1;
        if (taked > 0) success += 1;
      }

      await ctx.client.repositories.huntRepository.huntEntity(
        ctx.author.id,
        huntType,
        value,
        cooldown,
        rollsToUse || 0,
      );
      return { value, success, tries };
    };

    const result = await areYouTheHuntOrTheHunter(
      getUserHuntProbability(ctx.data.user.inUseItems, selected),
      selected,
    );

    if (selected === 'gods') {
      embed.setDescription(
        result.value > 0
          ? ctx.locale('commands:cacar.god_hunted_success', {
              count: result.value,
              hunt: ctx.locale(`commands:cacar.gods`),
              toRun,
            })
          : ctx.locale('commands:cacar.god_hunted_fail', {
              count: toRun,
            }),
      );
      if (result.value > 0) embed.setThumbnail('https://i.imgur.com/053khaH.gif');
    } else
      embed.setDescription(
        ctx.locale('commands:cacar.hunt_description', {
          value: result.value,
          hunt: ctx.locale(`commands:cacar.${selected}`),
          count: toRun,
        }),
      );
    embed.setColor(COLORS[`Hunt${capitalize(selected) as 'Default'}`]);

    const APIHuntTypes = {
      demons: 'demon',
      giants: 'giant',
      angels: 'angel',
      archangels: 'archangel',
      demigods: 'demigod',
      gods: 'god',
    };

    HttpRequests.postHuntCommand(ctx.author.id, APIHuntTypes[selected], result);

    await ctx.makeMessage({ embeds: [embed] });

    const droppedItem = dropItem(ctx.data.user.inventory, ctx.data.user.inUseItems, selected);
    if (!droppedItem) return;

    ctx.client.repositories.userRepository.update(ctx.author.id, {
      $push: { inventory: { id: droppedItem } },
    });

    ctx.send({
      content: ctx.prettyResponse('wink', 'commands:cacar.drop', {
        name: ctx.locale(`data:magic-items.${droppedItem as 1}.name`),
        author: ctx.author.toString(),
        chance: getMagicItemById<IHuntCooldownBoostItem>(droppedItem).data.dropChance,
      }),
    });
  }
}
