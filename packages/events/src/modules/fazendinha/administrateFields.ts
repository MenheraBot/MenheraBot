import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { PlantStateIcon, repeatIcon } from './displayPlantations';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { Plants, UnloadFields } from './constainst';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import farmerRepository from '../../database/repositories/farmerRepository';
import { checkNeededItems, removeItems } from './siloUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import starsRepository from '../../database/repositories/starsRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';

const handleAdministrativeComponents = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action] = ctx.sentData;

  if (action === 'UNLOCK') return executeUnlockField(ctx);

  if (action === 'ADMIN')
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('wink', 'permissions:WIP'),
    });
};

const executeUnlockField = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [, selectedField] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const neededItems = UnloadFields[Number(selectedField)];

  const userData = await userRepository.ensureFindUser(ctx.user.id);
  const canUnlock = checkNeededItems(neededItems.neededPlants, farmer.silo);

  if (!canUnlock || userData.estrelinhas < neededItems.cost)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.needed-items', {
        star: neededItems.cost,
        plants: neededItems.neededPlants.map(
          (a) => `${a.amount}x ${ctx.locale(`data:plants.${a.plant}`)} ${Plants[a.plant].emoji}`,
        ),
      }),
    });

  await Promise.all([
    starsRepository.removeStars(ctx.user.id, neededItems.cost),
    farmerRepository.updateSilo(ctx.user.id, removeItems(farmer.silo, neededItems.neededPlants)),
    farmerRepository.unlockField(ctx.user.id),
    postTransaction(
      `${ctx.user.id}`,
      `${bot.id}`,
      neededItems.cost,
      'estrelinhas',
      ApiTransactionReason.UPGRADE_FARM,
    ),
  ]);

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
          ctx.commandId,
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
