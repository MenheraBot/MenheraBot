import { ActionRow, TextStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { Plants } from '../fazendinha/plants';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';

const handleBuySeedsInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [option] = ctx.sentData;

  if (option === 'SHOW_MODAL')
    return showModal(ctx as ComponentInteractionContext<SelectMenuInteraction>);
};

const showModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const selectedOptions = ctx.interaction.data.values;
  const [, embedColor] = ctx.sentData;

  const modalFields = selectedOptions.reduce<ActionRow[]>((fields, plant) => {
    fields.push(
      createActionRow([
        createTextInput({
          label: `Comprar semente de ${plant}`,
          customId: plant,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: 2,
          required: true,
          placeholder: `Selecione quantas sementes você quer comprar`,
        }),
      ]),
    );

    return fields;
  }, []);

  ctx.respondWithModal({
    customId: createCustomId(2, ctx.user.id, ctx.commandId, 'BUY', embedColor),
    title: 'Comprar Sementes',
    components: modalFields,
  });
};

const buySeeds = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  finishCommand();

  const selectMenu = createSelectMenu({
    customId: createCustomId(
      4,
      ctx.user.id,
      ctx.commandId,
      'SHOW_MODAL',
      ctx.authorData.selectedColor,
    ),
    options: [],
    minValues: 1,
    placeholder: 'Selecione as sementes que você quer comprar',
    maxValues: 4,
  });

  const embed = createEmbed({
    title: 'Comprar Sementes',
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: Object.entries(Plants).map(([plant, data]) => {
      selectMenu.options.push({ label: `Sementede de ${plant}`, value: `${plant}` });
      return {
        name: `${plant}`,
        inline: true,
        value: `Valor da planta: ${data.sellValue}\nMadura em ${data.minutesToHarvest} minutos\nApodrece em ${data.minutesToRot} minutos`,
      };
    }),
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([selectMenu])],
  });
};

export { buySeeds, handleBuySeedsInteractions };
