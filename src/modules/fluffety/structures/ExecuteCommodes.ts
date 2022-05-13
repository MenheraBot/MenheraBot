import { FluffetySchema, FluffetyStatus } from '@custom_types/Menhera';
import { FluffetyActionIdentifier } from '@fluffety/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';

export const executeBedroom = async (
  ctx: InteractionCommandContext,
  fluffety: FluffetySchema,
  percentages: FluffetyStatus,
): Promise<boolean> => {
  const isSleeping =
    typeof fluffety.currentAction !== 'undefined' &&
    fluffety.currentAction.identifier === FluffetyActionIdentifier.Sleeping;

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
      finishAt: null,
    };
    ctx.makeMessage({
      content: ctx.locale('commands:fluffety.commodes.bedroom.start-sleep'),
      components: [],
      embeds: [],
      attachments: [],
    });
    return true;
  }
  return false;

  /*   const timeSleeping = Date.now() - fluffety.currentAction?.startAt;
  const; */
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
