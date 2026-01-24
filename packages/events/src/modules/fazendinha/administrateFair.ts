import { ButtonStyles } from '@discordeno/bot';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import fairRepository from '../../database/repositories/fairRepository.js';
import { Plants } from './constants.js';
import {
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { DatabaseUserSchema } from '../../types/database.js';

const handleDissmissShop = async (ctx: ComponentInteractionContext): Promise<void> => {
  const products = await fairRepository.getUserProducts(ctx.user.id);

  const [index] = ctx.sentData;

  const announcement = products[Number(index)];

  if (typeof announcement === 'undefined')
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.feirinha.dont-exists'),
      components: [],
      embeds: [],
    });

  await fairRepository.deleteAnnouncement(announcement._id);

  return executeAdministrateFair(ctx);
};

const executeAdministrateFair = async (
  ctx: InteractionContext,
  authorData?: DatabaseUserSchema,
): Promise<void> => {
  const fromUser = await fairRepository.getUserProducts(ctx.user.id);

  const userData = authorData ?? (await userRepository.ensureFindUser(ctx.user.id));

  const container = createContainer({
    accentColor: hexStringToNumber(userData.selectedColor),
    components: [
      createTextDisplay(
        `## ${ctx.locale('commands:fazendinha.feira.comprar.user-fair', { user: getDisplayName(ctx.user) })}`,
      ),
    ],
  });

  const goBackContainer = createContainer({
    components: [
      createSection({
        accessory: createButton({
          label: ctx.locale('commands:fazendinha.admin.silo.goto-fields'),
          style: ButtonStyles.Primary,
          customId: createCustomId(5, ctx.user.id, ctx.originalInteractionId, 'ADMIN_FIELDS'),
        }),
        components: [
          createTextDisplay(
            `## ${ctx.locale('commands:fazendinha.admin.silo.goto-fields')}\n${ctx.locale('commands:fazendinha.admin.silo.manage-fields')}`,
          ),
        ],
      }),
    ],
  });

  if (fromUser.length === 0) {
    container.components.push(
      createTextDisplay(ctx.locale('commands:fazendinha.admin.feirinha.no-items-in-user-fair')),
    );

    return ctx.makeLayoutMessage({ components: [goBackContainer, container] });
  }

  fromUser.forEach((item, i) => {
    container.components.push(
      createSeparator(),
      createSection({
        accessory: createButton({
          label: ctx.locale('commands:fazendinha.admin.feirinha.remove-announcement'),
          style: ButtonStyles.Danger,
          customId: createCustomId(6, ctx.user.id, ctx.originalInteractionId, i),
        }),
        components: [
          createTextDisplay(`### ${item[`name_${ctx.guildLocale}`]}`),
          createTextDisplay(
            `- ${item.price} :star:\n- ${Plants[item.plantType].emoji} ${item.weight} kg`,
          ),
        ],
      }),
    );
  });

  ctx.makeLayoutMessage({ components: [goBackContainer, container] });
};

export { executeAdministrateFair, handleDissmissShop };
