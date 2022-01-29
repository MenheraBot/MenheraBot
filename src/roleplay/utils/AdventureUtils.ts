import { RoleplayUserSchema } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { moreThanAnHour } from '@utils/Util';
import { EmbedFieldData } from 'discord.js-light';
import moment from 'moment';

export const a = 'a';

export const canGoToDungeon = (
  user: RoleplayUserSchema,
  ctx: InteractionCommandContext,
): { canGo: boolean; reason: EmbedFieldData[] } => {
  let canGo = true;
  const reason: EmbedFieldData[] = [];

  user.cooldowns.forEach((cd) => {
    if (cd.until > Date.now()) {
      canGo = false;
      reason.push({
        name: ctx.locale(`roleplay:cooldowns.${cd.reason as 'death'}`),
        value: ctx.locale(`roleplay:cooldowns.${cd.reason as 'death'}-description`, {
          time: moment.utc(cd.until).format(moreThanAnHour(cd.until) ? 'HH:mm:ss' : 'mm:ss'),
          subtime: ctx.locale(`common:${moreThanAnHour(cd.until) ? 'hours' : 'minutes'}`),
        }),
      });
    }
  });

  return { canGo, reason };
};
