import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonStyles,
  DiscordEmbedField,
} from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { bot } from '../../index';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createCommand } from '../../structures/command/createCommand';
import farmerRepository from '../../database/repositories/farmerRepository';
import userRepository from '../../database/repositories/userRepository';
import { MessageFlags, extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { InteractionContext } from '../../types/menhera';
import { getPlantationState } from '../../modules/fazendinha/plantationState';
import { millisToSeconds } from '../../utils/miscUtils';
import notificationRepository from '../../database/repositories/notificationRepository';
import { EMOJIS } from '../../structures/constants';

const canDo = (value: number): boolean => value <= 0;

const createField = (
  ctx: InteractionContext,
  type: string,
  cooldown: number,
  username: string,
): DiscordEmbedField => ({
  name: ctx.locale(`commands:cooldowns.${type as 'vote'}`),
  value: ctx.locale(
    canDo(cooldown) ? 'commands:cooldowns.no-cooldown' : 'commands:cooldowns.time',
    {
      unix: millisToSeconds(cooldown + Date.now()),
      user: username,
    },
  ),
  inline: false,
});

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
        flags: MessageFlags.EPHEMERAL,
      });

    const huntCooldown = userData.huntCooldown - Date.now();
    const voteCooldown = userData.voteCooldown - Date.now();
    const displayName = getDisplayName(userToUse);

    const farmer = await farmerRepository.getFarmer(userToUse.id);

    const farmerFields = farmer.plantations.map((p, i) => ({
      name: ctx.locale('commands:cooldowns.field', { field: i + 1 }),
      value: ctx.locale(`commands:cooldowns.field-states.${getPlantationState(p)[0]}`, {
        unix: millisToSeconds(getPlantationState(p)[1]),
      }),
      inline: true,
    }));

    const embed = createEmbed({
      title: ctx.locale('commands:cooldowns.title', { user: getDisplayName(userToUse) }),
      color: hexStringToNumber(userData.selectedColor),
      fields: [
        createField(ctx, 'vote', voteCooldown, displayName),
        createField(ctx, 'hunt', huntCooldown, displayName),
        ...farmerFields,
      ],
    });

    const components: ActionRow[] = [];

    if (userToUse.id === ctx.user.id) {
      if (voteCooldown < 0)
        components.push(
          createActionRow([
            createButton({
              style: ButtonStyles.Link,
              url: `https://top.gg/bot/${bot.applicationId}/vote`,
              label: ctx.locale('commands:cooldowns.click-to-vote'),
            }),
          ]),
        );

      const unreadNotifications = await notificationRepository.getUserTotalUnreadNotifications(
        ctx.user.id,
      );

      const notificationButton = createButton({
        label: ctx.locale('commands:cooldowns.read-notifications'),
        style: ButtonStyles.Primary,
        emoji: extractNameAndIdFromEmoji(EMOJIS.notify),
        customId: createCustomId(0, ctx.user.id, ctx.commandId),
      });

      if (unreadNotifications > 0) {
        if (components.length === 0) components.push(createActionRow([notificationButton]));
        else components[0].components.push(notificationButton);
      }
    }

    ctx.makeMessage({ embeds: [embed], components });
    finishCommand();
  },
});

export default CooldownsCommand;
