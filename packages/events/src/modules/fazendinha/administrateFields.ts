import { ActionRow, ButtonComponent, ButtonStyles, SelectOption } from '@discordeno/bot';
import userRepository from '../../database/repositories/userRepository.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { InteractionContext } from '../../types/menhera.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { PlantStateIcon, repeatIcon } from './displayPlantations.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
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

  ctx.makeMessage({
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
  ctx: ComponentInteractionContext,
  field: number,
  applyToAll: boolean,
): Promise<void> => {
  const user = await userRepository.ensureFindUser(ctx.user.id);
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.admin.fields.title'),
    color: hexStringToNumber(user.selectedColor),
    fields: [],
    footer: {
      text: ctx.locale(
        `commands:fazendinha.admin.fields.footer${applyToAll ? ('-all' as const) : ''}`,
        {
          field: field + 1,
        },
      ),
    },
  });

  const buttons = farmer.plantations.map((f, i) => {
    embed.fields?.push({
      inline: true,
      name: ctx.locale('commands:fazendinha.plantations.field', { index: i + 1, emojis: '' }),
      value:
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
          : `:x: ${ctx.locale('commands:fazendinha.admin.fields.no-upgrades')}`,
    });

    return createButton({
      label: ctx.locale('commands:fazendinha.admin.admin', {
        field: i + 1,
      }),
      style: ButtonStyles.Primary,
      customId: createCustomId(
        3,
        ctx.user.id,
        ctx.originalInteractionId,
        'ADMIN',
        i,
        0,
        0,
        applyToAll,
      ),
      disabled: i === field,
    });
  });

  const itemsToAllFields = farmer.items.filter((i) => i.amount >= farmer.plantations.length);

  const itemsToUse = applyToAll ? itemsToAllFields : farmer.items;

  const selectMenu = createSelectMenu({
    customId: createCustomId(
      3,
      ctx.user.id,
      ctx.originalInteractionId,
      'USE_ITEM',
      field,
      -1,
      -1,
      applyToAll,
    ),
    maxValues: 1,
    minValues: 1,
    placeholder: ctx.locale(
      applyToAll
        ? 'commands:fazendinha.admin.fields.use-item-all'
        : 'commands:fazendinha.admin.fields.use-item',
      { field: field + 1 },
    ),
    options: itemsToUse.flatMap<SelectOption>((item) =>
      item.amount <= 0
        ? []
        : [
            {
              label: `${item.amount}x ${ctx.locale(`data:farm-items.${item.id}`)}`,
              value: `${item.id}`,
              emoji: extractNameAndIdFromEmoji(Items[item.id].emoji),
            },
          ],
    ),
  });

  const components: ActionRow[] = [];

  if (selectMenu.options.length > 0) components.push(createActionRow([selectMenu]));

  const helpButton = createButton({
    label: ctx.locale('commands:fazendinha.admin.fields.help-item-title'),
    style: ButtonStyles.Secondary,
    customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'SHOW_HELP'),
  });

  const applyToAllButton = createButton({
    label: ctx.locale('commands:fazendinha.admin.fields.apply-to-all'),
    style: applyToAll ? ButtonStyles.Success : ButtonStyles.Secondary,
    customId: createCustomId(
      3,
      ctx.user.id,
      ctx.originalInteractionId,
      'ALL_FIELDS',
      field,
      -1,
      -1,
      applyToAll,
    ),
    disabled: itemsToAllFields.length === 0 && !applyToAll,
  });

  components.push(
    createActionRow([...(buttons as [ButtonComponent]), helpButton, applyToAllButton]),
  );

  ctx.makeMessage({ embeds: [embed], components });
};

const executeUseItem = async (
  ctx: ComponentInteractionContext,
  field: number,
  itemId: AvailableItems,
  confirmed: boolean,
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

  const upgrades = farmer.plantations[field].upgrades ?? [];

  if (
    (applyToAll
      ? farmer.plantations.some((p) => isUpgradeApplied(itemId, p.upgrades ?? []))
      : isUpgradeApplied(itemId, upgrades)) &&
    !confirmed
  )
    return ctx.makeMessage({
      embeds: [],
      content: ctx.prettyResponse(
        'question',
        'commands:fazendinha.admin.fields.confirm-usage-all',
        {
          index: field + 1,
        },
      ),
      components: [
        createActionRow([
          createButton({
            label: ctx.locale('commands:fazendinha.admin.fields.use-anyway'),
            style: ButtonStyles.Secondary,
            customId: createCustomId(
              3,
              ctx.user.id,
              ctx.originalInteractionId,
              'USE_ITEM',
              field,
              itemId,
              true,
              applyToAll,
            ),
          }),
        ]),
      ],
    });

  const updatedItems = removeItems(farmer.items, [
    { id: item.id, amount: applyToAll ? farmer.plantations.length : 1 },
  ]);

  const updatedFields = applyToAll
    ? farmer.plantations.map((p) => applyUpgrade(itemId, p))
    : applyUpgrade(itemId, farmer.plantations[field]);

  await farmerRepository.applyUpgrade(ctx.user.id, updatedItems, field, updatedFields, applyToAll);

  ctx.makeMessage({
    embeds: [],
    components: [],
    content: ctx.prettyResponse('success', 'commands:fazendinha.admin.fields.upgrade-applied', {
      unix: millisToSeconds(Date.now() + itemData.duration),
    }),
  });
};

const handleAdministrativeComponents = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, field, sentItemId, confirmed, applyToAll] = ctx.sentData;

  if (action === 'USE_ITEM') {
    const itemId =
      sentItemId && sentItemId !== '-1' ? sentItemId : ctx.interaction.data.values?.[0];

    return executeUseItem(
      ctx,
      Number(field),
      Number(itemId) as AvailableItems,
      confirmed === 'true',
      applyToAll === 'true',
    );
  }

  if (action === 'SHOW_HELP') return displayItemsHelp(ctx);

  if (action === 'UNLOCK') return executeUnlockField(ctx);

  if (action === 'ADMIN')
    return displayAdministrateField(ctx, Number(field), applyToAll === 'true');

  if (action === 'ALL_FIELDS')
    return displayAdministrateField(ctx, Number(field), applyToAll !== 'true');
};

const executeUnlockField = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [, selectedField] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const neededItems = UnloadFields[Number(selectedField)];

  const userData = await userRepository.ensureFindUser(ctx.user.id);
  const canUnlock = checkNeededPlants(neededItems.neededPlants, farmer.silo);

  if (!canUnlock || userData.estrelinhas < neededItems.cost)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
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

const executeAdministrateFields = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const userData =
    ctx instanceof ChatInputInteractionContext
      ? ctx.authorData
      : await userRepository.ensureFindUser(ctx.user.id);

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.admin.your-fields'),
    color: hexStringToNumber(userData.selectedColor),
    fields: [],
  });

  const plantationsLength = farmer.plantations.length;
  const emojis = repeatIcon(PlantStateIcon.EMPTY);

  const buttonsToSend: ButtonComponent[] = [];

  const aditionalFields = Object.values(UnloadFields);

  for (let i = 0; i <= aditionalFields.length; i++) {
    embed.fields?.push({
      name: `${i < plantationsLength ? '' : ':lock:'}${ctx.locale(
        'commands:fazendinha.plantations.field',
        { index: i + 1, emojis: '' },
      )}`,
      value: i < plantationsLength ? emojis : `||${emojis}||`,
      inline: true,
    });

    buttonsToSend.push(
      createButton({
        label: ctx.locale(`commands:fazendinha.admin.${i < plantationsLength ? 'admin' : 'buy'}`, {
          field: i + 1,
        }),
        style: ButtonStyles.Primary,
        customId: createCustomId(
          3,
          ctx.user.id,
          ctx.originalInteractionId,
          i < plantationsLength ? 'ADMIN' : 'UNLOCK',
          i,
        ),
        disabled: i > plantationsLength,
      }),
    );
  }

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow(buttonsToSend as [ButtonComponent])],
  });
};

export { executeAdministrateFields, handleAdministrativeComponents };
