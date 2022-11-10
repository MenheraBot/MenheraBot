import dayjs from 'dayjs';
import { ApplicationCommandOptionTypes, DiscordEmbedField } from 'discordeno/types';

import { ApplicationCommandOptionChoice } from 'discordeno/transformers';
import { postHuntExecution } from '../../utils/apiRequests/statistics';
import userRepository from '../../database/repositories/userRepository';
import huntRepository from '../../database/repositories/huntRepository';
import { capitalize } from '../../utils/miscUtils';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { COLORS } from '../../structures/constants';
import { MessageFlags } from '../../utils/discord/messageUtils';
import InteractionContext from '../../structures/command/InteractionContext';
import {
  DatabaseHuntingTypes,
  HuntCooldownBoostItem,
  HuntProbabiltyProps,
} from '../../modules/hunt/types';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createCommand } from '../../structures/command/createCommand';
import {
  calculateProbability,
  dropHuntItem,
  getMagicItemById,
  getUserHuntCooldown,
  getUserHuntProbability,
} from '../../modules/hunt/huntUtils';

type ChoiceTypes = DatabaseHuntingTypes | 'probabilities';
const choices: Array<ApplicationCommandOptionChoice & { value: ChoiceTypes }> = [
  {
    name: '😈 | Demônios',
    nameLocalizations: { 'en-US': '😈 | Demons' },
    value: 'demons',
  },
  {
    name: '👊 | Gigantes',
    nameLocalizations: { 'en-US': '👊 | Giants' },
    value: 'giants',
  },
  {
    name: '👼 | Anjos',
    nameLocalizations: { 'en-US': '👼 | Angels' },
    value: 'angels',
  },
  {
    name: '🧚‍♂️ | Arcanjos',
    nameLocalizations: { 'en-US': '🧚‍♂️ | Atchangels' },
    value: 'archangels',
  },
  {
    name: '🙌 | Semideuses',
    nameLocalizations: { 'en-US': '🙌 | Demigods' },
    value: 'demigods',
  },
  {
    name: '✝️ | Deuses',
    nameLocalizations: { 'en-US': '✝️ | Gods' },
    value: 'gods',
  },
  {
    name: '📊 | Probabilidades',
    nameLocalizations: { 'en-US': '📊 | Probabilities' },
    value: 'probabilities',
  },
];

const executeDisplayProbabilities = async (
  ctx: InteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const generateField = (huntType: DatabaseHuntingTypes): DiscordEmbedField => ({
    name: ctx.prettyResponse(huntType, `commands:cacar.${huntType}`),
    value: getUserHuntProbability(ctx.authorData.inUseItems, huntType)
      .map((a) =>
        ctx.locale('commands:cacar.chances', {
          count: a.amount,
          percentage: a.probability,
        }),
      )
      .join('\n'),
    inline: true,
  });

  const embed = createEmbed({
    title: ctx.locale('commands:cacar.probabilities'),
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: choices.reduce<ReturnType<typeof generateField>[]>(
      (fields, choice) =>
        choice.value === 'probabilities'
          ? fields
          : [...fields, generateField(choice.value as DatabaseHuntingTypes)],
      [],
    ),
  });

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const HuntCommand = createCommand({
  path: '',
  name: 'caçar',
  nameLocalizations: { 'en-US': 'hunt' },
  description: '「🎯」・Sai para uma caçada com Xandão',
  descriptionLocalizations: { 'en-US': '「🎯」・Go on a hunt' },
  options: [
    {
      name: 'tipo',
      nameLocalizations: { 'en-US': 'type' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Tipo da Caça',
      descriptionLocalizations: { 'en-US': 'Hunting Type' },
      required: true,
      choices,
    },
    {
      name: 'rolls',
      description: 'Quantidade de rolls que você quer usar de uma vez só',
      descriptionLocalizations: { 'en-US': 'Number of rolls you want to use at once' },
      type: ApplicationCommandOptionTypes.Integer,
      required: false,
      minValue: 1,
    },
  ],
  category: 'economy',
  authorDataFields: ['rolls', 'huntCooldown', 'inUseItems', 'selectedColor', 'inventory'],
  execute: async (ctx, finishCommand) => {
    const selection = ctx.getOption<DatabaseHuntingTypes>('tipo', false, true);

    if (selection === ('probabilities' as string))
      return executeDisplayProbabilities(ctx, finishCommand);

    const rollsToUse = ctx.getOption<number>('rolls', false);

    if (rollsToUse && rollsToUse > ctx.authorData.rolls)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:cacar.rolls-poor'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const canHunt = ctx.authorData.huntCooldown < Date.now();

    if (!canHunt && !rollsToUse)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:cacar.cooldown', {
            time: dayjs(ctx.authorData.huntCooldown - Date.now()).format('mm:ss'),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    const cooldown = getUserHuntCooldown(ctx.authorData.inUseItems, selection) + Date.now();

    const embed = createEmbed({
      thumbnail: { url: avatar },
      title: ctx.locale(`commands:cacar.${selection}`),
    });

    const timesToHunt = canHunt && rollsToUse ? rollsToUse + 1 : rollsToUse ?? 1;

    const executeHunt = async (probability: HuntProbabiltyProps[]) => {
      let value = 0;
      let tries = 0;
      let success = 0;

      for (let i = timesToHunt; i > 0; i--) {
        const taked = calculateProbability(probability);
        value += taked;
        tries += 1;
        if (taked > 0) success += 1;
      }

      await huntRepository.executeHuntEntity(
        ctx.author.id,
        selection,
        value,
        cooldown,
        rollsToUse ?? 0,
      );

      return { value, success, tries };
    };

    const result = await executeHunt(getUserHuntProbability(ctx.authorData.inUseItems, selection));

    if (selection === 'gods') {
      embed.description =
        result.value > 0
          ? ctx.locale('commands:cacar.god_hunted_success', {
              count: result.value,
              hunt: ctx.locale(`commands:cacar.gods`),
              timesToHunt,
            })
          : ctx.locale('commands:cacar.god_hunted_fail', {
              count: timesToHunt,
            });

      if (result.value > 0) embed.thumbnail = { url: 'https://i.imgur.com/053khaH.gif' };
    } else
      embed.description = ctx.locale('commands:cacar.hunt_description', {
        value: result.value,
        hunt: ctx.locale(`commands:cacar.${selection}`),
        count: timesToHunt,
      });

    embed.color = COLORS[`Hunt${capitalize(selection)}`];

    const APIHuntTypes = {
      demons: 'demon',
      giants: 'giant',
      angels: 'angel',
      archangels: 'archangel',
      demigods: 'demigod',
      gods: 'god',
    } as const;

    postHuntExecution(
      `${ctx.author.id}`,
      APIHuntTypes[selection],
      result,
      `${ctx.author.username}#${ctx.author.discriminator}`,
    );

    await ctx.makeMessage({ embeds: [embed] });

    const droppedItem = dropHuntItem(
      ctx.authorData.inventory,
      ctx.authorData.inUseItems,
      selection,
    );

    if (!droppedItem) return finishCommand();

    await userRepository.updateUserWithSpecialData(ctx.author.id, {
      $push: { inventory: { id: droppedItem } },
    });

    ctx.followUp({
      content: ctx.prettyResponse('wink', 'commands:cacar.drop', {
        name: ctx.locale(`data:magic-items.${droppedItem as 1}.name`),
        author: mentionUser(ctx.author.id),
        chance: (getMagicItemById(droppedItem).data as HuntCooldownBoostItem).dropChance,
      }),
    });

    finishCommand();
  },
});

export default HuntCommand;
