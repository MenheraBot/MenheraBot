import { FluffetySchema, FluffetyStatus } from '@custom_types/Menhera';
import { HOURS_TO_FULL_ENERGY, SLEEPING_HOURS_TO_FULL_ENERGY } from '@fluffety/Constants';
import { getPercentageByTimePassed, hoursToMilis } from '@fluffety/FluffetyUtils';
import { FluffetyActionIdentifier } from '@fluffety/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';

export const executeBedroom = async (
  ctx: InteractionCommandContext,
  fluffety: FluffetySchema,
  percentages: FluffetyStatus,
): Promise<boolean> => {
  const isSleeping = fluffety.currentAction.identifier === FluffetyActionIdentifier.Sleeping;

  if (!isSleeping) {
    if (percentages.energy >= 80) {
      ctx.send({
        content: ctx.locale('commands:fluffety.commodes.bedroom.fully-energy'),
        ephemeral: true,
      });
      return false;
    }

    fluffety.currentAction = {
      startAt: Date.now(),
      identifier: FluffetyActionIdentifier.Sleeping,
      finishAt: 0,
    };

    await ctx.client.repositories.fluffetyRepository.updateFluffety(fluffety.ownerId, {
      currentAction: {
        identifier: FluffetyActionIdentifier.Sleeping,
        startAt: Date.now(),
        finishAt: 0,
      },
    });

    ctx.makeMessage({
      content: ctx.locale('commands:fluffety.commodes.bedroom.start-sleep', {
        name: fluffety.fluffetyName,
      }),
      components: [],
      embeds: [],
      attachments: [],
    });
    return true;
  }

  const percentageGained = getPercentageByTimePassed(
    Date.now() - fluffety.currentAction.startAt,
    hoursToMilis(SLEEPING_HOURS_TO_FULL_ENERGY),
  );

  const newPercentage = Math.min(percentages.energy + percentageGained, 100);

  const newTimeToFull = Math.floor(hoursToMilis((newPercentage * HOURS_TO_FULL_ENERGY) / 100));

  const newDateToFull = Date.now() - hoursToMilis(HOURS_TO_FULL_ENERGY) + newTimeToFull;

  const newAction = { identifier: FluffetyActionIdentifier.Nothing, startAt: 0, finishAt: 0 };

  await ctx.client.repositories.fluffetyRepository.updateFluffety(fluffety.ownerId, {
    currentAction: newAction,
    energyAt: newDateToFull,
  });

  fluffety.currentAction = newAction;
  percentages.energy = newPercentage;

  return false;
};

export const executeKitchen = async (
  ctx: InteractionCommandContext,
  fluffety: FluffetySchema,
): Promise<void> => {
  console.log(ctx, fluffety);
};

export const executeOutisde = async (
  ctx: InteractionCommandContext,
  fluffety: FluffetySchema,
): Promise<void> => {
  console.log(ctx, fluffety);
};
