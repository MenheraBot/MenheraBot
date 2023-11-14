import i18next from 'i18next';
import { ApplicationCommandOptionChoice, Interaction } from 'discordeno/transformers';
import { findBestMatch } from 'string-similarity';
import fairRepository from '../../database/repositories/fairRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { MAX_ITEMS_IN_FAIR_PER_USER, Plants } from './constants';
import { checkNeededItems, removeItems } from './siloUtils';
import { AvailablePlants } from './types';
import { getDisplayName } from '../../utils/discord/userUtils';
import farmerRepository from '../../database/repositories/farmerRepository';
import { localizedResources } from '../../utils/miscUtils';
import { respondWithChoices } from '../../utils/discord/interactionRequests';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption';

let plantNames: ApplicationCommandOptionChoice[] = [];

const announceAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  if (plantNames.length === 0)
    plantNames = Object.keys(Plants).reduce<ApplicationCommandOptionChoice[]>((p, c) => {
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
    const minimumPrice = Math.floor(basePrice * 0.5);
    const maximumPrice = Math.floor(basePrice * 1.5);

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
  const amount = ctx.getOption<number>('quantidade', false, true);
  const price = ctx.getOption<number>('preço', false, true);

  const plantInfo = Plants[plant];

  if (typeof plantInfo === 'undefined')
    return ctx.makeMessage({ content: 'Esse produto não existe' });

  const userHaveItems = checkNeededItems([{ amount, plant }], farmer.silo);

  if (!userHaveItems)
    return ctx.makeMessage({
      content: `Você não tem **${amount}** ${plantInfo.emoji} para vender`,
    });

  const maxValue = Math.floor(plantInfo.sellValue * amount * 1.5);
  const minValue = Math.floor(plantInfo.sellValue * amount * 0.75);

  if (price < minValue || price > maxValue)
    return ctx.makeMessage({
      content: `Você não pode vender **${amount}x** ${plantInfo.emoji} por **${amount}** :star:. Esse anúncio deve ter valor entre **${minValue}** :star: e **${maxValue}** :star:`,
    });

  const userAnnouncements = await fairRepository.getUserProducts(ctx.user.id);

  if (userAnnouncements.length >= MAX_ITEMS_IN_FAIR_PER_USER)
    return ctx.makeMessage({
      content: `Você não possui anúncios disponíveis! Você só pode anunciar ${MAX_ITEMS_IN_FAIR_PER_USER} itens de uma só ves`,
    });

  await fairRepository.announceProduct(
    ctx.user.id,
    plant,
    amount,
    price,
    `[${getDisplayName(ctx.user, true)}] ${i18next.getFixedT('pt-BR')(`data:plants.${plant}`)}`,
    `[${getDisplayName(ctx.user, true)}] ${i18next.getFixedT('en-US')(`data:plants.${plant}`)}`,
  );

  await farmerRepository.updateSilo(ctx.user.id, removeItems(farmer.silo, [{ amount, plant }]));
  ctx.makeMessage({
    content: `Item anunciado! Você anunciou **${amount}x** ${plantInfo.emoji} por ${price} :star:`,
  });
};

export { executeAnnounceProduct, announceAutocomplete };
