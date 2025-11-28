import { ApplicationCommandOptionTypes, ButtonStyles, DiscordEmbedField } from '@discordeno/bot';

import userRepository from '../../database/repositories/userRepository.js';
import huntRepository from '../../database/repositories/huntRepository.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import { calculateProbability, capitalize, millisToSeconds } from '../../utils/miscUtils.js';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { COLORS, transactionableCommandOption } from '../../structures/constants.js';
import { MessageFlags } from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { DatabaseHuntingTypes, HuntCooldownBoostItem } from '../../modules/hunt/types.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import {
  dropHuntItem,
  getMagicItemById,
  getUserHuntCooldown,
  getUserHuntProbability,
} from '../../modules/hunt/huntUtils.js';
import { postHuntExecution, postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import { InteractionContext, ProbabilityAmount } from '../../types/menhera.js';
import executeDailies from '../../modules/dailies/executeDailies.js';
import { DatabaseUserSchema } from '../../types/database.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';

const choices = [
  ...transactionableCommandOption.filter((a) => a.value !== 'estrelinhas'),
  {
    name: '📊 | Probabilidades',
    nameLocalizations: { 'en-US': '📊 | Probabilities' },
    value: 'probabilities',
  },
];

const executeDisplayProbabilities = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const generateField = (huntType: DatabaseHuntingTypes): DiscordEmbedField => ({
    name: ctx.prettyResponse(huntType, `commands:cacar.${huntType}`),
    value: getUserHuntProbability(ctx.authorData.inUseItems, huntType)
      .map((a) =>
        ctx.locale('commands:cacar.chances', {
          count: a.value,
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

const executeHuntCommand = async (
  ctx: InteractionContext,
  user: DatabaseUserSchema,
  selection: DatabaseHuntingTypes,
  rollsToUse?: number,
) => {
  if (rollsToUse && rollsToUse > user.rolls)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:cacar.rolls-poor'),
      embeds: [],
      components: [],
      flags: MessageFlags.Ephemeral,
    });

  const canHunt = user.huntCooldown < Date.now();

  if (!canHunt && !rollsToUse)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:cacar.cooldown', {
        unix: millisToSeconds(user.huntCooldown),
      }),
      components:
        user.rolls > 0
          ? [
              createActionRow([
                createButton({
                  label: ctx.locale('commands:cacar.use-a-roll'),
                  style: ButtonStyles.Primary,
                  customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, selection),
                  emoji: { name: ctx.safeEmoji('roll') },
                }),
              ]),
            ]
          : undefined,
      embeds: [],
      flags: MessageFlags.Ephemeral,
    });

  const avatar = getUserAvatar(ctx.user, { enableGif: true });

  const cooldown = getUserHuntCooldown(user.inUseItems, selection) + Date.now();

  const embed = createEmbed({
    thumbnail: { url: avatar },
    title: ctx.locale(`commands:cacar.${selection}`),
  });

  const timesToHunt = canHunt && rollsToUse ? rollsToUse + 1 : (rollsToUse ?? 1);

  const executeHunt = async (probability: ProbabilityAmount[]) => {
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
      ctx.user.id,
      selection,
      value,
      cooldown,
      rollsToUse ?? 0,
    );

    return { value, success, tries };
  };

  const result = await executeHunt(getUserHuntProbability(user.inUseItems, selection));

  if (selection === 'gods') {
    embed.description =
      result.value > 0
        ? ctx.locale('commands:cacar.god_hunted_success', {
            count: result.value,
            hunt: ctx.locale(`commands:cacar.gods`),
            toRun: timesToHunt,
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

  await ctx.makeMessage({ embeds: [embed], components: [], content: '' });

  if (result.value > 0) {
    await executeDailies.successOnHunt(user, result.success);
    await postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      result.value,
      selection,
      ApiTransactionReason.HUNT_COMMAND,
    );
  }

  await postHuntExecution(
    `${ctx.user.id}`,
    APIHuntTypes[selection],
    result,
    getDisplayName(ctx.user, true),
  );

  const droppedItem = dropHuntItem(user.inventory, user.inUseItems, selection);

  if (!droppedItem) return;

  await userRepository.updateUserWithSpecialData(ctx.user.id, {
    $push: { inventory: { id: droppedItem } },
  });

  const commandInfo = await commandRepository.getCommandInfo('itens');

  ctx.followUp({
    content: ctx.prettyResponse('wink', 'commands:cacar.drop', {
      name: ctx.locale(`data:magic-items.${droppedItem as 1}.name`),
      author: mentionUser(ctx.user.id),
      command: `</itens:${commandInfo?.discordId}>`,
      chance: (getMagicItemById(droppedItem).data as HuntCooldownBoostItem).dropChance,
    }),
  });
};

const clickUseRoll = async (ctx: ComponentInteractionContext) => {
  const [selection] = ctx.sentData;

  const user = await userRepository.ensureFindUser(ctx.user.id);

  executeHuntCommand(ctx, user, selection as 'demons', 1);
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
  commandRelatedExecutions: [clickUseRoll],
  authorDataFields: ['rolls', 'huntCooldown', 'inUseItems', 'selectedColor', 'inventory'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const selection = ctx.getOption<DatabaseHuntingTypes>('tipo', false, true);

    if (selection === ('probabilities' as string))
      return executeDisplayProbabilities(ctx, finishCommand);

    const rollsToUse = ctx.getOption<number>('rolls', false);

    executeHuntCommand(ctx, ctx.authorData, selection, rollsToUse);
  },
});

export default HuntCommand;
