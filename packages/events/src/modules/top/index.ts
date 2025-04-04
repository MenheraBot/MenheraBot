import { ActionRow, ButtonStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { COLORS } from '../../structures/constants';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { executeUserDataRelatedTop } from './userDataRelated';
import { DatabaseUserSchema } from '../../types/database';
import { executeTopHuntStatistics } from './huntStatistics';
import { ApiHuntingTypes } from '../hunt/types';
import { executeGamblingTop } from './gamblingTop';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import cacheRepository from '../../database/repositories/cacheRepository';
import { InteractionContext } from '../../types/menhera';
import { executeUsedCommandsTop } from './usedCommands';
import { executeUsedCommandsFromUserTop } from './usedCommandsFromUser';
import { executeUserCommandsTop } from './userCommands';
import { executeUsersByUsedCommandTop } from './usersByUsedCommand';
import { executeFarmersTop } from './farmersTop';
import { executeFarmersExperienceTop } from './farmersExperienceTop';

const calculateSkipCount = (page: number): number => (page > 1 ? page - 1 : 0) * 10;

const usersToIgnoreInTop = async (): Promise<string[]> =>
  Promise.all([
    blacklistRepository.getAllBannedUsersId(),
    cacheRepository.getDeletedAccounts(),
  ]).then((a) => a[0].concat(a[1]));

type TopType =
  | 'gambling'
  | 'hunt'
  | 'economy'
  | 'commands'
  | 'command'
  | 'user'
  | 'users'
  | 'farmers';

const createPaginationButtons = (
  ctx: InteractionContext,
  topType: TopType,
  firstInfo: string,
  secondInfo: string,
  page: number,
  thirdInfo = '',
): ActionRow =>
  createActionRow([
    createButton({
      customId: createCustomId(
        0,
        ctx.interaction.user.id,
        ctx.originalInteractionId,
        topType,
        firstInfo,
        secondInfo,
        page === 0 ? 1 : page - 1,
        thirdInfo,
      ),
      style: ButtonStyles.Primary,
      label: ctx.locale('common:back'),
      disabled: page < 2,
    }),
    createButton({
      customId: createCustomId(
        0,
        ctx.interaction.user.id,
        ctx.originalInteractionId,
        topType,
        firstInfo,
        secondInfo,
        page === 0 ? 2 : page + 1,
        thirdInfo,
      ),
      style: ButtonStyles.Primary,
      label: ctx.locale('common:next'),
      disabled: page === 100,
    }),
  ]);

const executeTopPagination = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [command, firstInfo, secondInfo, page, thirdInfo] = ctx.sentData;

  await ctx.makeMessage({
    components: [
      createActionRow([
        createButton({
          customId: 'UNCLICKABLE_ONE',
          label: ctx.locale('common:back'),
          style: ButtonStyles.Primary,
          disabled: true,
        }),
        createButton({
          customId: 'UNCLICKABLE_TWO',
          label: ctx.locale('common:next'),
          style: ButtonStyles.Primary,
          disabled: true,
        }),
      ]),
    ],
  });

  if (command === 'economy') {
    return executeUserDataRelatedTop(
      ctx,
      firstInfo as keyof DatabaseUserSchema,
      ctx.safeEmoji(firstInfo as 'success', true),
      ctx.locale(`commands:top.economia.${firstInfo as 'mamou'}-title`),
      ctx.locale(`commands:top.economia.${firstInfo as 'mamou'}`),
      Number(page),
      COLORS.Purple,
    );
  }

  if (command === 'farmers') {
    if (secondInfo === 'EXPERIENCE')
      return executeFarmersExperienceTop(ctx, Number(page), firstInfo);

    let plant = Number(secondInfo);
    if (secondInfo === 'CHANGE') plant = Number(ctx.interaction?.data?.values?.[0]);

    return executeFarmersTop(ctx, Number(page), firstInfo, plant, thirdInfo as 'harvested');
  }

  if (command === 'commands') return executeUsedCommandsTop(ctx, Number(page), firstInfo);

  if (command === 'command')
    return executeUsersByUsedCommandTop(ctx, firstInfo, Number(page), secondInfo);

  if (command === 'users') return executeUserCommandsTop(ctx, Number(page), firstInfo);

  if (command === 'user') {
    const user = await cacheRepository.getDiscordUser(firstInfo, true);

    if (!user)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'common:api-error'),
      });

    return executeUsedCommandsFromUserTop(ctx, user, Number(page), secondInfo);
  }

  if (command === 'hunt') {
    return executeTopHuntStatistics(
      ctx,
      firstInfo as ApiHuntingTypes,
      secondInfo as 'success',
      Number(page),
    );
  }

  if (command === 'gambling')
    return executeGamblingTop(ctx, firstInfo as 'bicho', secondInfo as 'money', Number(page));
};

export { calculateSkipCount, executeTopPagination, usersToIgnoreInTop, createPaginationButtons };
