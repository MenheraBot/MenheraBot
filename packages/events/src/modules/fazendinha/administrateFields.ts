import { ActionRow, ButtonComponent, ButtonStyles, SelectOption } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { PlantStateIcon, repeatIcon } from './displayPlantations';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils';
import { Items, Plants, UnloadFields } from './constants';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import farmerRepository from '../../database/repositories/farmerRepository';
import { checkNeededPlants, removeItems, removePlants } from './siloUtils';
import { extractNameAndIdFromEmoji, MessageFlags } from '../../utils/discord/messageUtils';
import starsRepository from '../../database/repositories/starsRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';
import { millisToSeconds } from '../../utils/miscUtils';
import { AvailableItems } from './types';
import { isUpgradeApplied } from './plantationState';

const displayAdministrateField = async (
  ctx: ComponentInteractionContext,
  field: number,
): Promise<void> => {
  const user = await userRepository.ensureFindUser(ctx.user.id);
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.admin.fields.title'),
    color: hexStringToNumber(user.selectedColor),
    fields: [],
    footer: { text: ctx.locale('commands:fazendinha.admin.fields.footer', { field: field + 1 }) },
  });

  const buttons = farmer.plantations.map((f, i) => {
    embed.fields?.push({
      inline: true,
      name: ctx.locale('commands:fazendinha.plantations.field', { index: i + 1 }),
      value:
        f.upgrades && f.upgrades.length > 0
          ? f.upgrades
              .map((u) =>
                ctx.locale('commands:fazendinha.admin.fields.upgrade', {
                  emoji: Items[u.id].emoji,
                  upgrade: ctx.locale(`data:farm-items.${u.id}`),
                  unix: millisToSeconds(u.expiresAt),
                  expireLabel: ctx.locale(
                    `commands:fazendinha.admin.fields.${
                      u.expiresAt > Date.now() ? 'expires' : 'expired'
                    }`,
                  ),
                }),
              )
              .join('\n')
          : `:x: ${ctx.locale('commands:fazendinha.admin.fields.no-upgrades')}`,
    });

    return createButton({
      label: ctx.locale('commands:fazendinha.admin.admin', {
        field: i + 1,
      }),
      style: ButtonStyles.Primary,
      customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'ADMIN', i),
      disabled: i === field,
    });
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'USE_ITEM', field),
    maxValues: 1,
    minValues: 1,
    placeholder: ctx.locale('commands:fazendinha.admin.fields.use-item', { field: field + 1 }),
    options: farmer.items.flatMap<SelectOption>((item) =>
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

  components.push(createActionRow(buttons as [ButtonComponent]));

  ctx.makeMessage({ embeds: [embed], components });
};

const executeUseItem = async (
  ctx: ComponentInteractionContext,
  field: number,
  itemId: AvailableItems,
  confirmed: boolean,
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

  const upgrades = farmer.plantations[field].upgrades ?? [];

  if (isUpgradeApplied(itemId, upgrades) && !confirmed)
    return ctx.makeMessage({
      embeds: [],
      content: ctx.prettyResponse('question', 'commands:fazendinha.admin.fields.confirm-usage', {
        index: field + 1,
      }),
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
            ),
          }),
        ]),
      ],
    });

  // TODO

  removeItems(farmer.items, [{ id: item.id, amount: 1 }]);
};

const handleAdministrativeComponents = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, field, sentItemId, confirmed] = ctx.sentData;

  if (action === 'USE_ITEM') {
    const itemId = sentItemId ?? ctx.interaction.data.values?.[0];

    return executeUseItem(
      ctx,
      Number(field),
      Number(itemId) as AvailableItems,
      confirmed === 'true',
    );
  }

  if (action === 'UNLOCK') return executeUnlockField(ctx);

  if (action === 'ADMIN') return displayAdministrateField(ctx, Number(field));
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
        { index: i + 1 },
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
