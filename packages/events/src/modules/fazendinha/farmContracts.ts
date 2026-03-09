import { DatabaseFarmerSchema } from '../../types/database.js';
import { InteractionContext } from '../../types/menhera.js';
import { createContainer, createTextDisplay } from '../../utils/discord/componentUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { mentionUser } from '../../utils/discord/userUtils.js';
import { getCurrentUserContracts } from './contractUtils.js';

const displayContracts = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const userContracts = await getCurrentUserContracts(farmer);

  if (!userContracts || userContracts.length === 0)
    return ctx.makeMessage({ content: 'Você não tem nenhum contrato no momento.' });

  return ctx.makeLayoutMessage({
    components: [
      createContainer({
        accentColor: hexStringToNumber(embedColor),
        components: [createTextDisplay(`# Seus contratos\n${mentionUser(farmer.id)}`)],
      }),
    ],
  });
};

export { displayContracts };
