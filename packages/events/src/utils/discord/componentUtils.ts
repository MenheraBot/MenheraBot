import { Interaction } from 'discordeno/transformers';
import {
  ActionRow,
  ButtonComponent,
  InteractionResponseTypes,
  InteractionTypes,
  MessageComponentTypes,
} from 'discordeno/types';

import { bot } from '../../index';
import InteractionCollector, {
  InteractionCollectorOptions,
} from '../../structures/InteractionCollector';

type PropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const createButton = (component: PropertyOptional<ButtonComponent, 'type'>): ButtonComponent => ({
  ...component,
  type: MessageComponentTypes.Button,
});

const createActionRow = (components: ActionRow['components']): ActionRow => ({
  type: MessageComponentTypes.ActionRow,
  components,
});

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
        interactionType: InteractionTypes.MessageComponent,
      });

      collector.once('end', (interactions, reason) => {
        const interaction = [...(interactions as Map<bigint, Interaction>).values()][0];
        if (interaction) resolve(interaction);
        else reject(new Error(`InteractionCollector: ${reason}`));
      });
    }) as Promise<Interaction>
  )
    .then((a) => {
      bot.helpers.sendInteractionResponse(a.id, a.token, {
        type: InteractionResponseTypes.DeferredUpdateMessage,
      });
      return a;
    })
    .catch(() => null);
};

export { createButton, createActionRow, collectComponentInteractionWithCustomFilter };
