import { EMOJIS } from '../../structures/constants';

const calculateSkipCount = (page: number): number => (page - 1) * 10;

const topEmojis: { [key: string]: string } = {
  mamou: EMOJIS.crown,
  mamado: EMOJIS.lick,
  estrelinhas: EMOJIS.estrelinhas,
  demons: EMOJIS.demons,
  giants: EMOJIS.giants,
  angels: EMOJIS.angels,
  archangels: EMOJIS.archangels,
  demigods: EMOJIS.demigods,
  gods: EMOJIS.gods,
  votes: EMOJIS.ok,
  blackjack: '🃏',
  coinflip: '📀',
  roulette: '🎡',
  bicho: '🦌',
};

const executePagination = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [command] = ctx.sentData;

  const noop = () => undefined;

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
    const [, type, page] = ctx.sentData;

    return executeUserDataRelatedTop(
      ctx,
      type as keyof DatabaseUserSchema,
      topEmojis[type],
      ctx.locale(`commands:top.economia.${type as 'mamou'}-title`),
      ctx.locale(`commands:top.economia.${type as 'mamou'}`),
      Number(page),
      COLORS.Purple,
      noop,
    );
  }

  if (command === 'hunt') {
    const [, type, topMode, page] = ctx.sentData;

    return executeTopHuntStatistics(
      ctx,
      type as ApiHuntingTypes,
      topMode as 'success',
      Number(page),
      noop,
    );
  }

  const [, gameMode, topMode, page] = ctx.sentData;

  if (command === 'gambling')
    return executeGamblingTop(ctx, gameMode as 'bicho', topMode as 'money', Number(page), noop);
};

export { calculateSkipCount, topEmojis, executePagination };
