import { ActionRow, ButtonStyles, SelectOption } from '@discordeno/bot';
import userRepository from '../../database/repositories/userRepository.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { Items, Plants, UnloadFields } from './constants.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { checkNeededPlants, removeItems, removePlants } from './siloUtils.js';
import { extractNameAndIdFromEmoji, MessageFlags } from '../../utils/discord/messageUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import { AvailableItems } from './types.js';
import { isUpgradeApplied } from './plantationState.js';
import { applyUpgrade } from './fieldAction.js';
import { InteractionContext } from '../../types/menhera.js';

const displayItemsHelp = async (ctx: ComponentInteractionContext) => {
  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  const voteCooldown = authorData.voteCooldown - Date.now();

  const components: ActionRow[] = [];

  if (voteCooldown < 0)
    components.push(
      createActionRow([
        createButton({
          style: ButtonStyles.Link,
          url: `https://top.gg/bot/${bot.applicationId}/vote`,
          label: ctx.locale('commands:cooldowns.click-to-vote'),
        }),
      ]),
    );

  ctx.respondInteraction({
    flags: MessageFlags.Ephemeral,
    components,
    embeds: [
      createEmbed({
        color: hexStringToNumber(authorData.selectedColor),
        title: ctx.prettyResponse('question', 'commands:fazendinha.admin.fields.help-item-title'),
        description: ctx.locale('commands:fazendinha.admin.fields.help-item'),
      }),
    ],
  });
};

const displayAdministrateField = async (
  ctx: InteractionContext,
  applyToAll: boolean,
): Promise<void> => {
  const user = await userRepository.ensureFindUser(ctx.user.id);
  const farmer = await farmerRepository.getFarmer(ctx.user.id);
  const fertilizerItemId = AvailableItems.Fertilizer;

  const itemsToAllFields = farmer.items.filter((i) => i.amount >= farmer.plantations.length);

  const hasItems = farmer.items.filter((i) => i.amount >= 1).length > 0;

  const hasUpgrade = farmer.plantations.some((p) =>
    isUpgradeApplied(fertilizerItemId, p.upgrades ?? []),
  );

  const container = createContainer({
    accentColor: hexStringToNumber(user.selectedColor),
    components: [
      createSection({
        accessory: createButton({
          label: ctx.locale(
            `commands:fazendinha.admin.fields.${applyToAll ? 'use-anyway' : 'apply-to-all'}`,
          ),
          style: applyToAll ? ButtonStyles.Success : ButtonStyles.Secondary,
          customId: createCustomId(
            3,
            ctx.user.id,
            ctx.originalInteractionId,
            'ALL_FIELDS',
            -1,
            fertilizerItemId,
            applyToAll || !hasUpgrade,
          ),
          disabled: itemsToAllFields.length === 0 && !applyToAll,
        }),
        components: [
          createTextDisplay(
            `## ${ctx.locale('commands:fazendinha.admin.fields.title')}\n\n${applyToAll ? ctx.locale('commands:fazendinha.admin.fields.confirm-usage-all') : ''}`,
          ),
        ],
      }),
    ],
  });

  farmer.plantations.forEach((f, i) => {
    container.components.push(
      createSeparator(),
      createSection({
        components: [
          createTextDisplay(
            `### ${ctx.locale('commands:fazendinha.plantations.field', { index: i + 1, emojis: '' })}\n${
              f.upgrades && f.upgrades.length > 0
                ? f.upgrades
                    .map((u) =>
                      // TODO(ysnoopyDogy): Quando tiver novos tipos de upgrades, tem que mudar a forma que apresenta
                      // não ter upgrades para não ficar uma lista quebrada. Preguića de fazer agora =/
                      ctx.locale(
                        u.expiresAt > Date.now()
                          ? 'commands:fazendinha.admin.fields.upgrade'
                          : 'commands:fazendinha.admin.fields.no-upgrades',
                        {
                          emoji: Items[u.id].emoji,
                          upgrade: ctx.locale(`data:farm-items.${u.id}`),
                          unix: millisToSeconds(u.expiresAt),
                          expireLabel: ctx.locale(`commands:fazendinha.admin.fields.expires`),
                        },
                      ),
                    )
                    .join('\n')
                : `:x: ${ctx.locale('commands:fazendinha.admin.fields.no-upgrades')}`
            }`,
          ),
        ],
        accessory: createButton({
          label: ctx.locale('commands:fazendinha.admin.use-item'),
          style: ButtonStyles.Primary,
          emoji: extractNameAndIdFromEmoji(Items[fertilizerItemId].emoji),
          customId: createCustomId(
            3,
            ctx.user.id,
            ctx.originalInteractionId,
            'USE_ITEM',
            i,
            fertilizerItemId,
            applyToAll,
          ),
          disabled: !hasItems,
        }),
      }),
    );
  });

  const itemsToUse = applyToAll ? itemsToAllFields : farmer.items;

  const selectMenu = createSelectMenu({
    customId: createCustomId(
      3,
      ctx.user.id,
      ctx.originalInteractionId,
      'USE_ITEM',
      -1,
      -1,
      applyToAll,
    ),
    maxValues: 1,
    minValues: 1,
    placeholder: ctx.locale('commands:fazendinha.admin.fields.select-item'),
    options: itemsToUse.flatMap<SelectOption>((item) =>
      item.amount <= 0
        ? []
        : [
            {
              label: `${item.amount}x ${ctx.locale(`data:farm-items.${item.id}`)}`,
              value: `${item.id}`,
              default: true,
              emoji: extractNameAndIdFromEmoji(Items[item.id].emoji),
            },
          ],
    ),
  });

  if (selectMenu.options.length > 0) {
    container.components.push(
      createSeparator(true),
      createTextDisplay(ctx.locale('commands:fazendinha.admin.fields.select-item')),
      createActionRow([selectMenu]),
    );
  }

  container.components.push(
    createSection({
      components: [createTextDisplay(`-# Dúvida sobre fertilizantes? Clique:`)],
      accessory: createButton({
        label: ctx.locale('commands:fazendinha.admin.fields.help-item-title'),
        style: ButtonStyles.Secondary,
        customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'SHOW_HELP'),
      }),
    }),
  );

  ctx.makeLayoutMessage({ components: [container] });
};

const executeUseItem = async (
  ctx: ComponentInteractionContext,
  field: number,
  itemId: AvailableItems,
  applyToAll: boolean,
): Promise<void> => {
  const itemData = Items[itemId];

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const item = farmer.items.find((i) => i.id === itemId && i.amount > 0);

  if (!item)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.fields.no-item', {
        item: ctx.locale(`data:farm-items.${itemId}`),
        emoji: itemData.emoji,
      }),
    });

  if (applyToAll && item.amount < farmer.plantations.length)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.fields.no-item-to-all', {
        item: ctx.locale(`data:farm-items.${itemId}`),
        emoji: itemData.emoji,
      }),
    });

  const updatedItems = removeItems(farmer.items, [
    { id: item.id, amount: applyToAll ? farmer.plantations.length : 1 },
  ]);

  const updatedFields = applyToAll
    ? farmer.plantations.map((p) => applyUpgrade(itemId, p))
    : applyUpgrade(itemId, farmer.plantations[field]);

  await farmerRepository.applyUpgrade(ctx.user.id, updatedItems, field, updatedFields, applyToAll);

  return displayAdministrateField(ctx, false);
};

const handleAdministrativeComponents = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, field, sentItemId, applyToAll] = ctx.sentData;

  if (action === 'USE_ITEM') {
    const itemId =
      sentItemId && sentItemId !== '-1' ? sentItemId : ctx.interaction.data.values?.[0];

    return executeUseItem(
      ctx,
      Number(field),
      Number(itemId) as AvailableItems,
      applyToAll === 'true',
    );
  }

  if (action === 'SHOW_HELP') return displayItemsHelp(ctx);

  if (action === 'UNLOCK') return executeUnlockField(ctx);

  if (action === 'ADMIN') return displayAdministrateField(ctx, applyToAll === 'true');

  if (action === 'ALL_FIELDS') {
    const farmer = await farmerRepository.getFarmer(ctx.user.id);

    const hasUpgrade = farmer.plantations.some((p) =>
      isUpgradeApplied(AvailableItems.Fertilizer, p.upgrades ?? []),
    );

    if (hasUpgrade && applyToAll !== 'true') return displayAdministrateField(ctx, true);

    return executeUseItem(ctx, Number(field), Number(sentItemId), true);
  }
};

const executeUnlockField = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [, selectedField] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const neededItems = UnloadFields[Number(selectedField)];

  const userData = await userRepository.ensureFindUser(ctx.user.id);
  const canUnlock = checkNeededPlants(neededItems.neededPlants, farmer.silo);

  if (!canUnlock || userData.estrelinhas < neededItems.cost)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.needed-items', {
        star: neededItems.cost,
        plants: neededItems.neededPlants.map(
          (a) =>
            `${a.weight ?? a.amount} Kg ${ctx.locale(`data:plants.${a.plant}`)} ${
              Plants[a.plant].emoji
            }`,
        ),
      }),
    });

  await Promise.all([
    starsRepository.removeStars(ctx.user.id, neededItems.cost),
    farmerRepository.unlockField(ctx.user.id),
    postTransaction(
      `${ctx.user.id}`,
      `${bot.id}`,
      neededItems.cost,
      'estrelinhas',
      ApiTransactionReason.UPGRADE_FARM,
    ),
  ]);

  await farmerRepository.updateSilo(
    ctx.user.id,
    removePlants(farmer.silo, neededItems.neededPlants),
  );

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:fazendinha.admin.unlocked-field'),
    components: [],
    embeds: [],
  });
};

export { handleAdministrativeComponents, displayAdministrateField };
