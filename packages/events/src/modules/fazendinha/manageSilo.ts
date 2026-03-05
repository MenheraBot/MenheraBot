import { MAX_SILO_UPGRADES, Plants } from './constants.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { ApiTransactionReason } from '../../types/api.js';
import { bot } from '../../index.js';
import {
  ActionRow,
  ButtonStyles,
  MessageFlags,
  SeparatorComponent,
  TextDisplayComponent,
  TextStyles,
} from '@discordeno/bot';
import { displayAdministrateFarm } from './administrateFarm.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createLabel,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import { DatabaseFarmerSchema, QuantitativeSeed } from '../../types/database.js';
import { filterPlant, getSiloLimits, isMatePlant } from './siloUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';
import { extractLayoutFields } from '../../utils/discord/modalUtils.js';
import { displaySilo } from './displaySilo.js';

const handleUpgradeSilo = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);
  const user = await userRepository.ensureFindUser(ctx.user.id);

  if (farmer.siloUpgrades >= MAX_SILO_UPGRADES)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.silo.max-level-description'),
      flags: MessageFlags.Ephemeral,
    });

  const cost = 50_000 + farmer.siloUpgrades * 15_000;

  if (user.estrelinhas < cost)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.silo.poor'),
    });

  await Promise.all([
    starsRepository.removeStars(ctx.user.id, cost),
    farmerRepository.upgradeSilo(ctx.user.id),
    postTransaction(
      `${ctx.user.id}`,
      `${bot.id}`,
      cost,
      'estrelinhas',
      ApiTransactionReason.UPGRADE_FARM,
    ),
  ]);

  await displayAdministrateFarm(ctx, false);

  return ctx.followUp({
    flags: MessageFlags.Ephemeral,
    content: ctx.prettyResponse('success', 'commands:fazendinha.admin.silo.success'),
  });
};

const sendDiscardSeedsMessage = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  confirm: boolean,
) => {
  const components: (SeparatorComponent | TextDisplayComponent | ActionRow)[] = [];

  if (farmer.seeds.length === 0) return displaySilo(ctx, farmer, embedColor);

  const plantOptions = farmer.seeds.flatMap((p) =>
    isMatePlant(p.plant)
      ? []
      : [
          {
            label: ctx.locale('commands:fazendinha.silo.discard-seed', {
              plant: ctx.locale(`data:plants.${p.plant}`),
            }),
            emoji: { name: Plants[p.plant].emoji },
            value: `${p.plant}`,
          },
        ],
  );

  components.push(
    createActionRow([
      createSelectMenu({
        options: plantOptions,
        minValues: 1,
        maxValues: plantOptions.length >= 5 ? 5 : plantOptions.length,
        placeholder: ctx.locale('commands:fazendinha.silo.choose-discard'),
        customId: createCustomId(
          11,
          ctx.user.id,
          ctx.originalInteractionId,
          'SHOW_MODAL',
          embedColor,
        ),
      }),
    ]),
  );

  components.push(
    createSeparator(),
    createTextDisplay(
      `### ${ctx.locale(`commands:fazendinha.plantations.seeds`)}\n${
        farmer.seeds.length === 0
          ? `_${ctx.locale('commands:fazendinha.silo.nothing')}_`
          : `- ${farmer.seeds
              .map(
                (plant) =>
                  `${Plants[Number(plant.plant) as 1].emoji} **${plant.amount}x** - ${ctx.locale(`data:plants.${plant.plant}`)}`,
              )
              .join('\n- ')}`
      }`,
    ),
  );

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        components: [
          createTextDisplay(
            `## ${ctx.locale(`commands:fazendinha.silo.${confirm ? 'confirm-discard-title' : 'discard-title'}`)}\n-# ${ctx.locale(
              'commands:fazendinha.silo.footer',
              { ...getSiloLimits(farmer) },
            )}`,
          ),
        ],
        accessory: createButton({
          style: confirm ? ButtonStyles.Danger : ButtonStyles.Primary,
          label: ctx.locale(`commands:fazendinha.silo.${confirm ? 'confirm-' : ''}discard-all`),
          disabled: farmer.seeds.length === 0,
          customId: createCustomId(
            11,
            ctx.user.id,
            ctx.originalInteractionId,
            confirm ? 'DISCARD_ALL' : 'DISCARD',
            embedColor,
            true,
          ),
        }),
      }),
      ...components,
    ],
  });

  return ctx.makeLayoutMessage({
    components: [container],
  });
};

const respondInvalidAmount = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  await sendDiscardSeedsMessage(ctx, farmer, embedColor, false);

  await ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(ctx.prettyResponse('error', 'commands:fazendinha.silo.invalid-amount')),
    ],
  });
};

const executeDiscardPlant = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  selectedSeeds: QuantitativeSeed[],
) => {
  let count = 0;

  for (let i = selectedSeeds.length - 1; i >= 0; i--) {
    const currentSeed = selectedSeeds[i];
    const fromSilo = farmer.seeds.find(filterPlant(currentSeed));

    if (!fromSilo || fromSilo.amount < currentSeed.amount) {
      const updatedFarmer = await farmerRepository.getFarmer(farmer.id);

      await sendDiscardSeedsMessage(ctx, updatedFarmer, embedColor, false);

      return ctx.followUp({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.silo.not-enough-seeds'),
          ),
        ],
      });
    }

    if (currentSeed.amount <= 0) return respondInvalidAmount(ctx, farmer, embedColor);

    fromSilo.amount = fromSilo.amount - currentSeed.amount;
    count += currentSeed.amount;

    if (fromSilo.amount <= 0) farmer.seeds.splice(farmer.seeds.findIndex(filterPlant(fromSilo)), 1);
  }

  await farmerRepository.updateSeeds(ctx.user.id, farmer.seeds);

  const updatedFarmer = await farmerRepository.getFarmer(ctx.user.id);

  const successMessage = {
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('success', 'commands:fazendinha.silo.discarded', { count }),
      ),
    ],
  };

  if (updatedFarmer.seeds.filter((a) => a.amount > 0).length === 0)
    return ctx.makeLayoutMessage(successMessage);

  await sendDiscardSeedsMessage(ctx, updatedFarmer, embedColor, false);

  return ctx.followUp(successMessage);
};

const discardAllSeeds = (farmer: DatabaseFarmerSchema) =>
  farmerRepository.updateSeeds(farmer.id, []);

const receiveModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const selectedSeeds: QuantitativeSeed[] = extractLayoutFields(ctx.interaction).map((a) => ({
    plant: Number(a.customId),
    amount: parseInt(a.value ?? '', 10),
  }));

  for (const plant of selectedSeeds) {
    if (Number.isNaN(plant.amount)) return respondInvalidAmount(ctx, farmer, embedColor);

    if (plant.amount <= 0) return respondInvalidAmount(ctx, farmer, embedColor);
  }

  return executeDiscardPlant(ctx, farmer, embedColor, selectedSeeds);
};

const handleDiscardSeeds = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, embedColor, confirm] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (action === 'DISCARD')
    return sendDiscardSeedsMessage(ctx, farmer, embedColor, confirm === 'true');

  if (action === 'DISCARD_ALL') {
    await discardAllSeeds(farmer);

    farmer.seeds = [];

    return displaySilo(ctx, farmer, embedColor);
  }

  if (action === 'MODAL')
    return receiveModal(ctx as ComponentInteractionContext<ModalInteraction>, farmer, embedColor);

  if (action === 'SHOW_MODAL')
    return ctx.respondWithModal({
      title: ctx.locale('commands:fazendinha.silo.discard-seeds'),
      customId: createCustomId(
        11,
        ctx.user.id,
        ctx.originalInteractionId,
        'MODAL',
        embedColor,
        confirm,
      ),
      components: (
        ctx as ComponentInteractionContext<SelectMenuInteraction>
      ).interaction.data.values.map((s) =>
        createLabel({
          component: createTextInput({ customId: s, style: TextStyles.Short }),
          label: ctx.locale('commands:fazendinha.silo.max', {
            plant: ctx.locale(`data:plants.${s as '0'}`),
            emoji: Plants[s as '1'].emoji,
            amount: farmer.seeds.find((seed) => s === `${seed.plant}`)?.amount,
          }),
        }),
      ),
    });
};

export { handleUpgradeSilo, handleDiscardSeeds };
