import {
  ActionRow,
  ButtonStyles,
  DiscordEmbedField,
  SelectOption,
  TextStyles,
} from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { AvailablePlants } from './types';
import { Plants } from './plants';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import farmerRepository from '../../database/repositories/farmerRepository';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import { executeSellPlant, receiveModal } from '../shop/sellPlants';
import { InteractionContext } from '../../types/menhera';
import commandRepository from '../../database/repositories/commandRepository';

const displaySilo = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  let maySell = false;

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.silo.embed-title', { user: getDisplayName(ctx.user) }),
    color: hexStringToNumber(embedColor),
    fields: ['seeds' as const, 'silo' as const].reduce<DiscordEmbedField[]>((p, c) => {
      const items = farmer[c].filter((a) => a.amount > 0);

      if (c === 'seeds') {
        const hasMate = items.some((a) => a.plant === AvailablePlants.Mate);

        if (!hasMate) items.push({ amount: 0, plant: AvailablePlants.Mate });
      } else if (items.length > 0) maySell = true;

      p.push({
        name: ctx.locale(`commands:fazendinha.plantations.${c}`),
        value:
          items.length === 0
            ? ctx.locale('commands:fazendinha.silo.nothing')
            : items
                .map((a) =>
                  ctx.locale(
                    `commands:fazendinha.silo.display-${
                      a.plant === AvailablePlants.Mate ? 'mate' : 'other'
                    }`,
                    {
                      emoji: Plants[a.plant].emoji,
                      amount: a.amount,
                      plant: ctx.locale(`data:plants.${a.plant}`),
                    },
                  ),
                )
                .join('\n'),
        inline: true,
      });

      return p;
    }, []),
  });

  const sellButton = createButton({
    label: ctx.locale('commands:fazendinha.silo.sell-plants'),
    style: maySell ? ButtonStyles.Success : ButtonStyles.Secondary,
    disabled: !maySell,
    customId: createCustomId(2, ctx.user.id, ctx.commandId, 'DISPLAY', embedColor),
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([sellButton])] });
};

const handleButtonAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption, embedColor] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (selectedOption === 'DISPLAY') return buildSellPlantsMessage(ctx, farmer, embedColor);

  if (selectedOption === 'SHOW_MODAL') {
    const sellAll = ctx.interaction.data.values?.includes('ALL');
    if (!sellAll)
      return showModal(
        ctx as ComponentInteractionContext<SelectMenuInteraction>,
        farmer,
        embedColor,
      );

    return executeSellPlant(ctx, farmer, farmer.silo);
  }

  if (selectedOption === 'SELL')
    return receiveModal(ctx as ComponentInteractionContext<ModalInteraction>, farmer);
};

const showModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const selectedOptions = ctx.interaction.data.values;

  const modalFields = selectedOptions.reduce<ActionRow[]>((fields, plant) => {
    const fromSilo = farmer.silo.find((a) => a.plant === Number(plant) && a.amount > 0);

    if (!fromSilo) return fields;

    fields.push(
      createActionRow([
        createTextInput({
          label: ctx.locale('commands:fazendinha.silo.max', {
            plant: ctx.locale(`data:plants.${plant as '0'}`),
            amount: fromSilo.amount,
          }),
          customId: plant,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: `${fromSilo.amount}`.length,
          required: true,
          placeholder: ctx.locale('commands:fazendinha.silo.select', {
            plant: ctx.locale(`data:plants.${plant as '0'}`),
          }),
        }),
      ]),
    );

    return fields;
  }, []);

  if (modalFields.length === 0)
    return ctx.makeMessage({
      components: [],
      content: ctx.locale('commands:fazendinha.silo.not-enough-plants'),
    });

  ctx.respondWithModal({
    customId: createCustomId(2, ctx.user.id, ctx.commandId, 'SELL', embedColor),
    title: ctx.locale('commands:fazendinha.silo.sell-plants'),
    components: modalFields,
  });
};

const buildSellPlantsMessage = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const options: SelectOption[] = [];

  const description = farmer.silo.reduce((text, plant) => {
    if (plant.amount === 0) return text;

    options.push({
      label: ctx.locale('commands:fazendinha.silo.sell-plant', {
        plant: ctx.locale(`data:plants.${plant.plant}`),
      }),
      emoji: { name: Plants[plant.plant].emoji },
      value: `${plant.plant}`,
    });

    return ctx.locale('commands:fazendinha.silo.description', {
      text,
      emoji: Plants[plant.plant].emoji,
      amount: plant.amount,
      plant: ctx.locale(`data:plants.${plant.plant}`),
      value: Plants[plant.plant].sellValue,
    });
  }, '');

  if (options.length === 0) {
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.locale('commands:fazendinha.silo.no-plants'),
    });
  }

  options.unshift({
    label: ctx.locale('commands:fazendinha.silo.sell-all'),
    value: 'ALL',
    emoji: { name: '💰' },
  });

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.silo.sell-title'),
    description,
    color: hexStringToNumber(embedColor),
  });

  const commandId = await commandRepository.getCommandInfo('fazendinha');

  ctx.makeMessage({
    embeds: [embed],
    components: [
      createActionRow([
        createSelectMenu({
          options,
          minValues: 1,
          maxValues: options.length >= 5 ? 5 : options.length,
          customId: createCustomId(
            2,
            ctx.user.id,
            commandId?.discordId ?? ctx.commandId,
            'SHOW_MODAL',
            embedColor,
          ),
        }),
      ]),
    ],
  });
};

export { displaySilo, handleButtonAction, buildSellPlantsMessage };