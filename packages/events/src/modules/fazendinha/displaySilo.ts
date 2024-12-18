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
import { Items, Plants } from './constants';
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
import { getSiloLimits } from './siloUtils';
import cacheRepository from '../../database/repositories/cacheRepository';

const displaySilo = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  let maySell = false;

  const user =
    `${ctx.user.id}` !== farmer.id ? await cacheRepository.getDiscordUser(farmer.id) : ctx.user;

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.silo.embed-title', {
      user: getDisplayName(user ?? ctx.user),
    }),
    color: hexStringToNumber(embedColor),
    fields: ['seeds' as const, 'silo' as const].reduce<DiscordEmbedField[]>((p, c) => {
      const items = farmer[c as 'seeds'].filter(
        (a) => a[('weight' in a ? 'weight' : 'amount') as 'amount'] > 0,
      );

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
                      a.plant === AvailablePlants.Mate && c === 'seeds' ? 'mate' : 'other'
                    }`,
                    {
                      emoji: Plants[a.plant].emoji,
                      amount: 'weight' in a ? a.weight : a.amount,
                      metric: 'weight' in a ? ' kg' : 'x',
                      plant: ctx.locale(`data:plants.${a.plant}`),
                    },
                  ),
                )
                .join('\n'),
        inline: true,
      });

      return p;
    }, []),
    footer: { text: ctx.locale('commands:fazendinha.silo.footer', { ...getSiloLimits(farmer) }) },
  });

  embed.fields?.push({
    name: ctx.locale('commands:fazendinha.silo.items'),
    value:
      farmer.items.length === 0
        ? ctx.locale('commands:fazendinha.silo.nothing')
        : farmer.items
            .flatMap((item) =>
              item.amount > 0
                ? [
                    ctx.locale('commands:fazendinha.silo.display-other', {
                      emoji: Items[item.id].emoji,
                      amount: item.amount,
                      metric: 'x',
                      plant: ctx.locale(`data:farm-items.${item.id}`),
                    }),
                  ]
                : [],
            )
            .join('\n'),
    inline: true,
  });

  const sellButton = createButton({
    label: ctx.locale('commands:fazendinha.silo.sell-plants'),
    style: maySell ? ButtonStyles.Success : ButtonStyles.Secondary,
    disabled: !maySell,
    customId: createCustomId(8, ctx.user.id, ctx.originalInteractionId, 'DISPLAY', embedColor),
  });

  const useItemsButton = createButton({
    label: ctx.locale('commands:fazendinha.silo.use-items'),
    style: ButtonStyles.Primary,
    customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'ADMIN', 0),
    disabled: farmer.items.length === 0 || farmer.items.every((i) => i.amount <= 0),
  });

  ctx.makeMessage({
    embeds: [embed],
    components:
      farmer.id === `${ctx.user.id}` ? [createActionRow([sellButton, useItemsButton])] : [],
  });
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
    const fromSilo = farmer.silo.find((a) => a.plant === Number(plant) && a.weight > 0);

    if (!fromSilo) return fields;

    fields.push(
      createActionRow([
        createTextInput({
          label: ctx.locale('commands:fazendinha.silo.max', {
            plant: ctx.locale(`data:plants.${plant as '0'}`),
            amount: fromSilo.weight,
          }),
          customId: plant,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: `${fromSilo.weight}`.length,
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
    customId: createCustomId(8, ctx.user.id, ctx.originalInteractionId, 'SELL', embedColor),
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
    if (plant.weight === 0) return text;

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
      amount: plant.weight,
      metric: ' kg',
      plant: ctx.locale(`data:plants.${plant.plant}`),
      value: Plants[plant.plant].sellValue,
    });
  }, '');

  if (options.length === 0) {
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.silo.no-plants'),
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
    footer: { text: ctx.locale('commands:fazendinha.silo.footer', { ...getSiloLimits(farmer) }) },
    color: hexStringToNumber(embedColor),
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [
      createActionRow([
        createSelectMenu({
          options,
          minValues: 1,
          maxValues: options.length >= 5 ? 5 : options.length,
          customId: createCustomId(
            8,
            ctx.user.id,
            ctx.originalInteractionId,
            'SHOW_MODAL',
            embedColor,
          ),
        }),
      ]),
    ],
  });
};

export { displaySilo, handleButtonAction, buildSellPlantsMessage };
