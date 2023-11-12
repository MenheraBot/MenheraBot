import { DatabaseFarmerSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { Plants } from './constants';
import { calculateUserDailyDeliveries } from './deliveryUtils';

const executeDailyDelivery = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const embed = createEmbed({
    title: 'Entregas Diárias',
    color: hexStringToNumber(embedColor),
    fields: [],
    description:
      'Uma vez por dia o caminhão de entregas aparecerá em sua fazendinha para buscar por entregas. Preencha todos os pedidos e ganhe prêmios',
  });

  const userDailies = calculateUserDailyDeliveries(farmer);

  userDailies.forEach((a, i) => {
    embed.fields?.push({
      name: `Entrega ${i + 1}`,
      inline: true,
      value: `Estrelinhas: **${a.award}** :star:\nExperiência: **${a.experience}**\n${a.needs.map(
        (b) => `${b.amount}x ${Plants[b.plant].emoji}`,
      )}`,
    });
  });

  ctx.makeMessage({ embeds: [embed] });
};

export { executeDailyDelivery };
