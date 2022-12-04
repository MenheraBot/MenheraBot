import { Interaction } from 'discordeno/transformers';
import { InteractionResponseTypes, InteractionTypes } from 'discordeno/types';
import i18next from 'i18next';
import { ModalInteraction } from '../../types/interaction';

import { bot } from '../../index';
import InteractionCollector, {
  InteractionCollectorOptions,
} from '../../structures/InteractionCollector';
import { MessageFlags } from './messageUtils';

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

const collectModalResponse = async (
  customId: string,
  time = 10_000,
  defer = true,
): Promise<null | ModalInteraction> =>
  (
    new Promise((resolve, reject) => {
      const collector = new InteractionCollector({
        filter: (interaction) => {
          const isWantedModal = (interaction.data?.customId as string).startsWith(customId);

          if (!isWantedModal) return false;

          if (defer)
            bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
              type: InteractionResponseTypes.DeferredUpdateMessage,
            });

          return true;
        },
        time,
        max: 1,
        interactionType: InteractionTypes.ModalSubmit,
      });

      collector.once('end', (interactions, reason) => {
        const interaction = [...(interactions as Map<bigint, ModalInteraction>).values()][0];
        if (interaction) resolve(interaction);
        else reject(new Error(`InteractionCollector: ${reason}`));
      });
    }) as Promise<ModalInteraction>
  )
    .then((a) => a)
    .catch(() => null);

const collectResponseComponentInteraction = async <InteractionType = Interaction>(
  channelId: bigint,
  userId: bigint,
  customId: string,
  time = 10_000,
  defer = true,
): Promise<null | InteractionType> => {
  return (
    new Promise((resolve, reject) => {
      const collector = new InteractionCollector({
        channelId,
        filter: (interaction) => {
          const isWantedButton = (interaction.data?.customId as string).startsWith(customId);

          if (!isWantedButton) return false;

          if (interaction.user.id !== userId) {
            bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: {
                content: i18next.getFixedT(interaction.locale ?? 'pt-BR')(
                  'common:not-your-interaction',
                ),
                flags: MessageFlags.EPHEMERAL,
              },
            });
            return false;
          }

          if (defer)
            bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
              type: InteractionResponseTypes.DeferredUpdateMessage,
            });

          return true;
        },
        time,
        max: 1,
        interactionType: InteractionTypes.MessageComponent,
      });

      collector.once('end', (interactions, reason) => {
        const interaction = [...(interactions as Map<bigint, InteractionType>).values()][0];
        if (interaction) resolve(interaction);
        else reject(new Error(`InteractionCollector: ${reason}`));
      });
    }) as Promise<InteractionType>
  )
    .then((a) => a)
    .catch(() => null);
};

export {
  collectComponentInteractionWithCustomFilter,
  collectResponseComponentInteraction,
  collectModalResponse,
};
