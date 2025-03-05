import i18next from 'i18next';
import { ApplicationCommandOptionChoice, Interaction } from 'discordeno/transformers';
import { findBestMatch } from 'string-similarity';
import fairRepository from '../../database/repositories/fairRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import {
  MAXIMUM_PRICE_TO_SELL_IN_FAIR,
  MAX_ITEMS_IN_FAIR_PER_USER,
  MINIMUM_PRICE_TO_SELL_IN_FAIR,
  Plants,
} from './constants';
import { checkNeededPlants, removePlants } from './siloUtils';
import { AvailablePlants } from './types';
import farmerRepository from '../../database/repositories/farmerRepository';
import { localizedResources } from '../../utils/miscUtils';
import { respondWithChoices } from '../../utils/discord/interactionRequests';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption';
import executeDailies from '../dailies/executeDailies';

let plantNames: ApplicationCommandOptionChoice[] = [];

const announceAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  if (plantNames.length === 0)
    plantNames = Object.keys(Plants).reduce<ApplicationCommandOptionChoice[]>((p, c) => {
      if (c === `${AvailablePlants.Mate}`) return p;

      const names = localizedResources(`data:plants.${c as '1'}`);

      const plant = Plants[c as '1'];

      p.push({
        name: `${plant.emoji} ${names['pt-BR']}`,
        nameLocalizations: {
          'en-US': `${plant.emoji} ${names['en-US']}`,
          'pt-BR': `${plant.emoji} ${names['pt-BR']}`,
        },
        value: Number(c),
      });

      return p;
    }, []);

  const options = interaction.data?.options?.[0].options?.[0].options;

  if (typeof options === 'undefined') return;

  const focused = options.find((a) => a.focused);
  const input = focused.value;

  if (focused.name === 'produto') {
    const searchString = plantNames.map(
      (a) => a.nameLocalizations?.[(interaction.locale as 'en-US') ?? 'pt-BR'] ?? a.name,
    );

    const ratings = findBestMatch(`${input}`, searchString);

    const toSendOptions = ratings.ratings.filter((a) => a.rating >= 0.3);

    if (toSendOptions.length === 0) return respondWithChoices(interaction, []);

    const infoToReturn: ApplicationCommandOptionChoice[] = [];

    for (let i = 0; i < toSendOptions.length && i < 25; i++) {
      const { target } = toSendOptions[i];

      const plant = plantNames.find(
        (a) => a.name === target || a.nameLocalizations?.['en-US'] === target,
      );

      if (plant) infoToReturn.push(plant);
    }

    return respondWithChoices(interaction, infoToReturn);
  }

  const invalidInfo = () => {
    const invalidPlantOrAmount = localizedResources(
      'commands:fazendinha.feira.invalid-plant-or-amount',
    );

    return respondWithChoices(interaction, [
      { value: -1, name: invalidPlantOrAmount['pt-BR'], nameLocalizations: invalidPlantOrAmount },
    ]);
  };

  if (focused.name === 'preço') {
    const plant = getOptionFromInteraction<number>(interaction, 'produto', false);
    const amount = getOptionFromInteraction(interaction, 'quantidade', false);

    if (typeof plant !== 'number' || typeof amount !== 'number') return invalidInfo();

    const plantFile = Plants[(plant as 0) ?? 0];

    if (!plantFile) return invalidInfo();

    const basePrice = Math.floor(plantFile.sellValue * amount);
    const minimumPrice = Math.floor(basePrice * MINIMUM_PRICE_TO_SELL_IN_FAIR);
    const maximumPrice = Math.floor(basePrice * MAXIMUM_PRICE_TO_SELL_IN_FAIR);

    const choiceText = localizedResources('commands:fazendinha.feira.select-between', {
      min: minimumPrice,
      max: maximumPrice,
    });

    return respondWithChoices(interaction, [
      { name: choiceText['pt-BR'], nameLocalizations: choiceText, value: basePrice },
      { name: `⭐ | ${maximumPrice}`, value: maximumPrice },
      { name: `⭐ | ${basePrice}`, value: basePrice },
      { name: `⭐ | ${minimumPrice}`, value: minimumPrice },
    ]);
  }
};

const executeAnnounceProduct = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const plant = ctx.getOption<AvailablePlants>('produto', false, true);
  const amount = parseFloat(ctx.getOption<number>('quantidade', false, true).toFixed(1));
  const price = ctx.getOption<number>('preço', false, true);

  const plantInfo = Plants[plant];

  if (typeof plantInfo === 'undefined')
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.announce.no-such-product'),
    });

  if (plant === AvailablePlants.Mate)
    return ctx.makeMessage({
      content: ctx.prettyResponse(
        'error',
        'commands:fazendinha.feira.announce.no-mate-announcement',
        { emoji: plantInfo.emoji },
      ),
    });

  const userHaveItems = checkNeededPlants([{ amount, plant }], farmer.silo);

  if (!userHaveItems)
    return ctx.makeMessage({
      content: ctx.prettyResponse(
        'error',
        'commands:fazendinha.feira.announce.not-enough-products',
        { amount, emoji: plantInfo.emoji },
      ),
    });

  const maxValue = Math.floor(plantInfo.sellValue * amount * MAXIMUM_PRICE_TO_SELL_IN_FAIR);
  const minValue = Math.floor(plantInfo.sellValue * amount * MINIMUM_PRICE_TO_SELL_IN_FAIR);

  if (price < minValue || price > maxValue)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.announce.out-needed-prices', {
        amount,
        emoji: plantInfo.emoji,
        price,
        min: minValue,
        max: maxValue,
      }),
    });

  const userAnnouncements = await fairRepository.getUserProducts(ctx.user.id);

  if (userAnnouncements.some((a) => a.plantType === plant))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.announce.already-announced', {
        emoji: plantInfo.emoji,
      }),
    });

  if (userAnnouncements.length >= MAX_ITEMS_IN_FAIR_PER_USER)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.announce.announce-limits', {
        limit: MAX_ITEMS_IN_FAIR_PER_USER,
      }),
    });

  await fairRepository.announceProduct(
    ctx.user.id,
    plant,
    amount,
    price,
    `[${ctx.user.username}] ${amount} Kg ${i18next.getFixedT('pt-BR')(
      `data:plants.${plant}`,
    )} ${price}⭐`,
    `[${ctx.user.username}] ${amount} Kg ${i18next.getFixedT('en-US')(
      `data:plants.${plant}`,
    )} ${price}⭐`,
  );

  await farmerRepository.updateSilo(
    ctx.user.id,
    removePlants(farmer.silo, [{ weight: amount, plant }]),
  );

  await executeDailies.announceProduct(ctx.authorData);

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:fazendinha.feira.announce.success'),
  });
};

export { executeAnnounceProduct, announceAutocomplete };
