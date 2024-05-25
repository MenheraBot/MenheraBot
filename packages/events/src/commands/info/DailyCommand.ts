import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import { getUserDailies } from '../../modules/dailies/getUserDailies';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDailyById } from '../../modules/dailies/dailies';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { DatabaseDaily } from '../../modules/dailies/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';

const getDailyStatus = (daily: DatabaseDaily): 'reedem' | 'unfinished' | 'reedemed' =>
  // eslint-disable-next-line no-nested-ternary
  daily.redeemed ? 'reedemed' : daily.has >= daily.need ? 'reedem' : 'unfinished';

const redeemInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, dailyIndex] = ctx.sentData;

  const user = await userRepository.ensureFindUser(ctx.user.id);
  const missionToReedem = getUserDailies(user)[Number(dailyIndex)];

  if (action === 'REEDEM') {
    if (missionToReedem.need > missionToReedem.has)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:daily.cannot-reedem'),
      });

    if (missionToReedem.redeemed)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:daily.already-reedemed'),
      });

    // TODO(ySnoopyDogy): Send the user all prizes options for they to choose
  }
};

const DailyCommand = createCommand({
  path: '',
  name: 'daily',
  description: '「📅」・Veja e resgate suas missões diárias',
  descriptionLocalizations: { 'en-US': '「📅」・See and reedem your daily missions' },
  category: 'info',
  authorDataFields: ['dailies', 'dailyDayId', 'selectedColor', 'estrelinhas'],
  commandRelatedExecutions: [redeemInteractions],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const userDailies = getUserDailies(ctx.authorData);

    const embed = createEmbed({
      title: ctx.prettyResponse('calendar', 'commands:daily.title'),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: `- ${userDailies
        .map((d) => {
          const daily = getDailyById(d.id);
          return ctx.locale(`commands:daily.descriptions.${daily.type}`, {
            ...d,
            ...daily,
            emoji:
              // eslint-disable-next-line no-nested-ternary
              d.has < d.need
                ? ctx.safeEmoji('hourglass')
                : d.redeemed
                ? ctx.safeEmoji('success')
                : ctx.safeEmoji('gift'),
          });
        })
        .join('\n- ')}`,
    });

    const buttons = userDailies.map((daily, index) =>
      createButton({
        label: ctx.locale(`commands:daily.${getDailyStatus(daily)}`, {
          index: index + 1,
          need: daily.need,
          has: daily.has,
        }),
        style: getDailyStatus(daily) === 'reedem' ? ButtonStyles.Success : ButtonStyles.Secondary,
        customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'REEDEM', index),
        disabled: getDailyStatus(daily) !== 'reedem',
      }),
    ) as [ButtonComponent];

    ctx.makeMessage({ embeds: [embed], components: [createActionRow(buttons)] });
  },
});

export default DailyCommand;
