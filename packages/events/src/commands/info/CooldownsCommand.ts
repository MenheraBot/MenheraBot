import {
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
  SectionComponent,
  TextDisplayComponent,
} from '@discordeno/bot';

import { bot } from '../../index.js';
import {
  createButton,
  createContainer,
  createSection,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import { MessageFlags } from '@discordeno/bot';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { getPlantationState } from '../../modules/fazendinha/plantationState.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import { User } from '../../types/discordeno.js';

const canDo = (value: number): boolean => value <= 0;

const createField = (
  ctx: InteractionContext,
  type: string,
  cooldown: number,
  username: string,
  button?: ButtonComponent,
): TextDisplayComponent | SectionComponent => {
  const text = createTextDisplay(
    `### ${ctx.locale(`commands:cooldowns.${type as 'vote'}`)}\n${ctx.locale(
      canDo(cooldown) ? 'commands:cooldowns.no-cooldown' : 'commands:cooldowns.time',
      {
        unix: millisToSeconds(cooldown + Date.now()),
        user: username,
      },
    )}`,
  );

  if (!button) return text;

  return createSection({ components: [text], accessory: button });
};

const CooldownsCommand = createCommand({
  path: '',
  name: 'cooldowns',
  description: '「⌛」・Mostra os principais recursos de um usuário',
  descriptionLocalizations: { 'en-US': '「⌛」・Shows the main resources from an user' },
  category: 'info',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para ver os recursos',
      descriptionLocalizations: { 'en-US': 'User to see the main resources' },
      required: false,
    },
  ],
  authorDataFields: ['huntCooldown', 'voteCooldown', 'selectedColor'],
  execute: async (ctx, finishCommand) => {
    const userToUse = ctx.getOption<User>('user', 'users', false) ?? ctx.user;
    const userData =
      userToUse.id === ctx.user.id ? ctx.authorData : await userRepository.findUser(userToUse.id);

    if (!userData)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:cooldowns.no-user'),
        flags: MessageFlags.Ephemeral,
      });

    const huntCooldown = userData.huntCooldown - Date.now();
    const voteCooldown = userData.voteCooldown - Date.now();
    const displayName = getDisplayName(userToUse);

    const farmer = await farmerRepository.getFarmer(userToUse.id);

    const farmerFields = farmer.plantations.map((p, i) => [
      createSeparator(),
      createTextDisplay(
        `### ${ctx.locale('commands:cooldowns.field', { field: i + 1 })}\n${ctx.locale(
          `commands:cooldowns.field-states.${getPlantationState(p)[0]}`,
          {
            unix: millisToSeconds(getPlantationState(p)[1]),
          },
        )}`,
      ),
    ]);

    const voteButton =
      userToUse.id === ctx.user.id && voteCooldown < 0
        ? createButton({
            style: ButtonStyles.Link,
            url: `https://top.gg/bot/${bot.applicationId}/vote`,
            label: ctx.locale('commands:cooldowns.click-to-vote'),
          })
        : undefined;

    const container = createContainer({
      accentColor: hexStringToNumber(userData.selectedColor),
      components: [
        createTextDisplay(
          `## ${ctx.locale('commands:cooldowns.title', { user: getDisplayName(userToUse) })}`,
        ),
        createSeparator(),
        createField(ctx, 'vote', voteCooldown, displayName, voteButton),
        createSeparator(),
        createField(ctx, 'hunt', huntCooldown, displayName),
        ...farmerFields.flat(),
      ],
    });

    const unreadNotifications = await notificationRepository.getUserTotalUnreadNotifications(
      ctx.user.id,
    );

    if (unreadNotifications > 0) {
      const notificationCommand = await commandRepository.getCommandInfo('notificações');

      container.components.push(
        createSeparator(),
        createTextDisplay(
          `### ${ctx.locale('commands:cooldowns.unread-notifications')}\n${ctx.locale(
            'commands:cooldowns.check-your-notifications',
            {
              command: `</notificações:${notificationCommand?.discordId}>`,
              count: unreadNotifications,
            },
          )}`,
        ),
      );
    }

    ctx.makeLayoutMessage({ components: [container] });
    finishCommand();
  },
});

export default CooldownsCommand;
