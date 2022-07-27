import { Interaction } from 'discordeno/transformers';
import { InteractionTypes } from 'discordeno/types';

import InteractionCollector, {
  InteractionCollectorOptions,
} from '../../structures/InteractionCollector';

const collectComponentInteractionWithCustomFilter = async (
  channelId: bigint,
  filter: InteractionCollectorOptions['filter'],
  time = 10000,
): Promise<null | Interaction> => {
  return (
    new Promise((resolve, reject) => {
      const collector = new InteractionCollector({
        channelId,
        filter,
        time,
        max: 1,
        interactionType: InteractionTypes.MessageComponent,
      });

      collector.once('end', (interactions, reason) => {
        const interaction = [...(interactions as Map<bigint, Interaction>).values()][0];
        if (interaction) resolve(interaction);
        else reject(new Error(`InteractionCollector: ${reason}`));
      });
    }) as Promise<Interaction>
  )
    .then((a) => a)
    .catch(() => null);
};

const collectResponseComponentInteraction = async (
  channelId: bigint,
  userId: bigint,
  customId: string,
  time = 10_000,
): Promise<null | Interaction> => {
  return (
    new Promise((resolve, reject) => {
      const collector = new InteractionCollector({
        channelId,
        filter: (interaction) =>
          interaction.user.id === userId &&
          (interaction.data?.customId as string).startsWith(customId),
        time,
        max: 1,
        interactionType: InteractionTypes.MessageComponent,
      });

      collector.once('end', (interactions, reason) => {
        const interaction = [...(interactions as Map<bigint, Interaction>).values()][0];
        if (interaction) resolve(interaction);
        else reject(new Error(`InteractionCollector: ${reason}`));
      });
    }) as Promise<Interaction>
  )
    .then((a) => a)
    .catch(() => null);
};

export { collectComponentInteractionWithCustomFilter, collectResponseComponentInteraction };
