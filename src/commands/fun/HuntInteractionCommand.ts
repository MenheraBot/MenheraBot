import 'moment-duration-format';
import moment from 'moment';
import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { huntEnum, HuntingTypes, HuntProbabiltyProps, IHuntCooldownBoostItem } from '@utils/Types';
import {
  calculateProbability,
  dropItem,
  getUserHuntCooldown,
  getUserHuntProbability,
} from '@utils/HuntUtils';
import Util, { debugError, getMagicItemById } from '@utils/Util';

type ChoiceTypes = HuntingTypes | 'probabilities';
const choices: { name: string; value: ChoiceTypes }[] = [
  {
    name: '😈 | Demônios',
    value: 'demons',
  },
  {
    name: '👊 | Gigantes',
    value: 'giants',
  },
  {
    name: '👼 | Anjos',
    value: 'angels',
  },
  {
    name: '🧚‍♂️ | Arcanjos',
    value: 'archangels',
  },
  {
    name: '🙌 | Semideuses',
    value: 'demigods',
  },
  {
    name: '✝️ | Deuses',
    value: 'gods',
  },
  {
    name: '📊 | Probabilidades',
    value: 'probabilities',
  },
];
export default class HuntInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cacar',
      description: '「🎯」・Sai para uma caçada com Xandão',
      options: [
        {
          name: 'tipo',
          type: 'STRING',
          description: 'Tipo da caça',
          required: true,
          choices,
        },
        {
          name: 'rolls',
          description: 'Quantidade de rolls que você quer usar de uma vez só',
          type: 'INTEGER',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 7,
      authorDataFields: ['rolls', 'huntCooldown', 'inUseItems', 'selectedColor', 'inventory'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selected = ctx.options.getString('tipo', true) as ChoiceTypes;

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
      if (rollsToUse < 1) {
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:cacar.invalid-rolls'),
          ephemeral: true,
        });
        return;
      }
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

    const rankinkg = await ctx.client.repositories.topRepository
      .getUserHuntRank(
        ctx.author.id,
        selected,
        await ctx.client.repositories.cacheRepository.getDeletedAccounts(),
      )
      .catch((e) => debugError(e, true));

    if (selected === 'gods') {
      embed.setDescription(
        result.value > 0
          ? ctx.locale('commands:cacar.god_hunted_success', {
              count: result.value,
              hunt: ctx.locale(`commands:cacar.gods`),
              rank: rankinkg ? rankinkg.rank + 1 : '`??`',
              toRun,
            })
          : ctx.locale('commands:cacar.god_hunted_fail', {
              rank: rankinkg ? rankinkg.rank + 1 : '`??`',
              count: toRun,
            }),
      );
      if (result.value > 0) embed.setThumbnail('https://i.imgur.com/053khaH.gif');
    } else
      embed.setDescription(
        ctx.locale('commands:cacar.hunt_description', {
          value: result.value,
          hunt: ctx.locale(`commands:cacar.${selected}`),
          rank: rankinkg ? rankinkg.rank + 1 : '`??`',
          count: toRun,
        }),
      );
    // @ts-expect-error HuntString is actually HuntHUNTYPE
    embed.setColor(COLORS[`Hunt${Util.capitalize(selected)}`]);

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
