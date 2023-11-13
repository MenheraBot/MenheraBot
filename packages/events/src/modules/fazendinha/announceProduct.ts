import i18next from 'i18next';
import fairRepository from '../../database/repositories/fairRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { MAX_ITEMS_IN_FAIR_PER_USER, Plants } from './constants';
import { checkNeededItems, removeItems } from './siloUtils';
import { AvailablePlants } from './types';
import { getDisplayName } from '../../utils/discord/userUtils';
import farmerRepository from '../../database/repositories/farmerRepository';

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

export { executeAnnounceProduct };
