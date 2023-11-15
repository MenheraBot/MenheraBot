import { Interaction } from 'discordeno/transformers';
import { findBestMatch } from 'string-similarity';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption';
import { InteractionContext } from '../../types/menhera';
import fairRepository from '../../database/repositories/fairRepository';
import { DatabaseFarmerSchema } from '../../types/database';
import { addItems, getSiloLimits } from './siloUtils';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';
import farmerRepository from '../../database/repositories/farmerRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { ApiTransactionReason } from '../../types/api';
import { respondWithChoices } from '../../utils/discord/interactionRequests';
import { resolveSeparatedStrings } from '../../utils/discord/componentUtils';

const listItemAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  const input = getOptionFromInteraction<string>(interaction, 'item', false);

  if (!input) return;

  const availableItems = await fairRepository.getAnnoucementNames(
    interaction.locale === 'en-US' ? 'en-US' : 'pt-BR',
  );

  const ratings = findBestMatch(input, availableItems)
    .ratings.sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  if (ratings.length === 0)
    return respondWithChoices(interaction, [{ name: 'Não há anúncios disponíveis', value: 's' }]);

  respondWithChoices(
    interaction,
    ratings.map((item, i) => {
      const [name, id] = resolveSeparatedStrings(item.target);

      return {
        name: `${name} (${i + 1})`,
        value: id,
      };
    }),
  );
};

const executeBuyItem = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  item: string,
): Promise<void> => {
  const exists = await fairRepository.doesAnnouncementExists(item);

  if (!exists)
    return ctx.makeMessage({ components: [], embeds: [], content: `Este anúncio não existe mais` });

  const announcement = await fairRepository.getAnnouncement(item);

  if (!announcement)
    return ctx.makeMessage({ components: [], embeds: [], content: `Este anúncio não existe mais` });

  if (announcement.userId === `${ctx.user.id}`)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não pode comprar seus próprios itens`,
    });

  const userLimits = getSiloLimits(farmer);

  if (userLimits.used + announcement.amount > userLimits.limit)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não tem espaço suficiente em seu silo para comprar isso`,
    });

  const user = await userRepository.ensureFindUser(ctx.user.id);

  if (user.estrelinhas < announcement.price)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não tem estrelinhas o suficiente para comprar isso`,
    });

  if (announcement.plantType > farmer.biggestSeed)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não pode comprar esse item porque ainda não o desbloqueou!`,
    });

  await Promise.all([
    starsRepository.addStars(announcement.userId, announcement.price),
    starsRepository.removeStars(ctx.user.id, announcement.price),
    fairRepository.deleteAnnouncement(announcement._id),
    farmerRepository.updateSilo(
      ctx.user.id,
      addItems(farmer.silo, [{ amount: announcement.amount, plant: announcement.plantType }]),
    ),
    postTransaction(
      `${ctx.user.id}`,
      announcement.userId,
      announcement.price,
      'estrelinhas',
      ApiTransactionReason.BUY_FAIR,
    ),
  ]);

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: `Você comporu esse item`,
  });
};

const executeExploreFair = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  // const user = getOptionFromInteraction<User>(ctx.interaction, 'vizinho', 'users', false);
  const item = getOptionFromInteraction<string>(ctx.interaction, 'item', false, false);

  if (item) return executeBuyItem(ctx, farmer, item);
};

export { executeExploreFair, listItemAutocomplete };
