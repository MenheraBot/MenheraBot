import { ButtonStyles, MessageComponentTypes, MessageFlags } from '@discordeno/bot';
import { InteractionContext } from '../../types/menhera.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { PlantStateIcon } from './displayPlantations.js';
import { COMPOSTER_FERTILIZER_YIELD, Items, MAX_COMPOSTER_VALUE } from './constants.js';
import { AvailableItems, PlantationState, PlantedField, Seasons } from './types.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  extractNameAndIdFromEmoji,
  setComponentsV2Flag,
} from '../../utils/discord/messageUtils.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { addItems, getSiloLimits } from './siloUtils.js';
import { getCalculatedFieldQuality } from './plantationState.js';

const handleComposterInteractions = async (ctx: ComponentInteractionContext) => {
  const [action] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (action === 'GET_FERTILIZER') {
    if (farmer.composter < MAX_COMPOSTER_VALUE)
      return ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.composteira.composter-not-full'),
          ),
        ],
      });

    const siloLimits = getSiloLimits(farmer);

    if (siloLimits.used + COMPOSTER_FERTILIZER_YIELD > siloLimits.limit)
      return ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.composteira.silo-full'),
          ),
        ],
      });

    await farmerRepository.executeComposter(
      ctx.user.id,
      addItems(farmer.items, [
        { amount: COMPOSTER_FERTILIZER_YIELD, id: AvailableItems.Fertilizer },
      ]),
      0,
    );

    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(
          ctx.prettyResponse('success', 'commands:fazendinha.composteira.success', {
            emoji: Items[AvailableItems.Fertilizer].emoji,
            amount: COMPOSTER_FERTILIZER_YIELD,
          }),
        ),
      ],
    });
  }
  /* 
  if (action === "ADD_PLANTS")  */
};

const displayComposter = (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const total = 23;
  const percent = farmer.composter / MAX_COMPOSTER_VALUE;
  const filled = Math.round(total * percent);
  const progressBar = `[${'█'.repeat(filled) + '░'.repeat(total - filled)}]`;

  const havePlants = farmer.silo.some((a) => a.weight > 0);

  ctx.makeLayoutMessage({
    components: [
      {
        accentColor: hexStringToNumber(embedColor),
        type: MessageComponentTypes.Container,
        components: [
          createTextDisplay(
            `## ${ctx.prettyResponse('composter', 'commands:fazendinha.composteira.title')}\n${ctx.locale(
              'commands:fazendinha.composteira.description',
              { percent: Math.floor(percent * 100) },
            )}`,
          ),
          createTextDisplay(`### ${progressBar}`),
          createActionRow([
            createButton({
              style: ButtonStyles.Primary,
              customId: createCustomId(10, ctx.user.id, ctx.originalInteractionId, 'ADD_PLANTS'),
              disabled: !havePlants || percent >= 1,
              emoji: { name: PlantStateIcon.GROWING },
              label: ctx.locale('commands:fazendinha.composteira.add-plants'),
            }),
            createButton({
              style: ButtonStyles.Success,
              customId: createCustomId(
                10,
                ctx.user.id,
                ctx.originalInteractionId,
                'GET_FERTILIZER',
              ),
              emoji: extractNameAndIdFromEmoji(Items[AvailableItems.Fertilizer].emoji),
              disabled: percent < 1,
              label: ctx.locale('commands:fazendinha.composteira.get-fertilizer'),
            }),
          ]),
        ],
      },
    ],
  });
};

const composterEquivalentForField = (
  field: PlantedField,
  plantState: PlantationState,
  season: Seasons,
): number => {
  if (plantState === PlantationState.Growing) return 0;

  const quality = getCalculatedFieldQuality(field, season);
  const value = field.plantType + 1 + quality + 1;

  if (plantState === PlantationState.Rotten) return value + 15 + (quality + 1) * 7;

  return value;
};

export { displayComposter, handleComposterInteractions, composterEquivalentForField };
