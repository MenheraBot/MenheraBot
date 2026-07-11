import { ButtonStyles, ContainerComponent, MessageFlags } from '@discordeno/bot';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
  deleteMessageCustomId,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import { getAvailableSeeds, parseUserPlantations, SeasonEmojis } from './displayPlantations.js';
import {
  AvailableItems,
  AvailablePlants,
  PlantCategories,
  PlantQuality,
  Seasons,
} from './types.js';
import {
  hoursToMillis,
  isUndefined,
  millisToSeconds,
  minutesToMillis,
} from '../../utils/miscUtils.js';
import { getComposterDisplayText } from './farmComposter.js';
import { extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils.js';
import { Items, Plants } from './constants.js';
import { getBuySeedsComponents } from '../shop/buySeeds.js';
import { getSellPlantsComponents, getSiloComponents } from './displaySilo.js';
import { getAdministrateFarmComponents } from './administrateFarm.js';
import { getQualityEmoji } from './siloUtils.js';
import userRepository from '../../database/repositories/userRepository.js';
import giveRepository from '../../database/repositories/giveRepository.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { devEnviroment } from '../../utils/getEnviroments.js';

const TUTORIAL_TITLE_ID = devEnviroment ? 2 : 33;

export enum FarmTutorialStep {
  Start,
  FirstPlantation,
  RottedPlants,
  Composter,
  BuySeed,
  DisplaySilo,
  AdminFarm,
  PlantUpgraded,
  HarvestQuality,
  CheckDeliveries,
  TradePlants,
  BuyProduct,
  FinishDelivery,
  SellPlants,
  End,
}

interface TutorialInfo {
  category?: PlantCategories;
  plant?: AvailablePlants;
  siloUpgraded?: boolean;
  itemApplied?: boolean;
}

const DEFAULT_TUTORIAL_PLANT = AvailablePlants.Blueberries;
const TUTORIAL_SEASON = Seasons.Spring;

const sendTutorialMessage = async (
  ctx: InteractionContext,
  commandName: string,
  step: FarmTutorialStep,
  objectiveTranslationData: (Record<string, unknown> & { finished?: boolean })[],
  tutorialComponents: ContainerComponent['components'],
  descriptionTranslation?: Record<string, unknown>,
) => {
  const [currentCommand] = commandName.split(' ');
  const commandId = (await commandRepository.getCommandInfo(currentCommand))?.discordId ?? '';

  const objectivesText = objectiveTranslationData
    .map(
      (o, i) =>
        `- ${o.finished ? '✅' : '🔳'} ${ctx.locale(
          `commands:fazendinha.tutorial.steps.${step}.objective-${i as 0}`,
          objectiveTranslationData[i],
        )}`,
    )
    .join('\n');

  ctx.makeLayoutMessage({
    flags: MessageFlags.Ephemeral,
    components: [
      createContainer({
        accentColor: ctx.userColor,
        components: [
          createTextDisplay(
            `# </${commandName}:${commandId}>\n\n${ctx.locale(`commands:fazendinha.tutorial.steps.${step}.description`, descriptionTranslation)}`,
          ),
          createSeparator(true, false),
          ...tutorialComponents,
          createSeparator(true),
          createTextDisplay(
            `### ${ctx.locale('commands:fazendinha.tutorial.objective', { count: objectiveTranslationData.length })}\n\n${objectivesText}`,
          ),
        ],
      }),
    ],
  });
};

const tutorialSteps = {
  [FarmTutorialStep.Start]: (ctx: InteractionContext) =>
    ctx.makeLayoutMessage({
      components: [
        createContainer({
          accentColor: ctx.userColor,
          components: [
            createTextDisplay(
              `## ${ctx.locale('commands:fazendinha.tutorial.title')}\n\n${ctx.locale(
                `commands:fazendinha.tutorial.steps.${FarmTutorialStep.Start}.description`,
              )}`,
            ),
            createActionRow([
              createButton({
                style: ButtonStyles.Success,
                label: ctx.locale('commands:fazendinha.tutorial.start'),
                customId: createCustomId(
                  12,
                  ctx.user.id,
                  ctx.originalInteractionId,
                  'STEP',
                  FarmTutorialStep.FirstPlantation,
                ),
              }),
            ]),
          ],
        }),
      ],
      flags: MessageFlags.Ephemeral,
    }),

  [FarmTutorialStep.FirstPlantation]: (ctx: InteractionContext) =>
    sendTutorialMessage(
      ctx,
      'fazendinha plantações',
      FarmTutorialStep.FirstPlantation,
      [
        {
          plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
          emoji: Plants[AvailablePlants.Mate].emoji,
        },
      ],
      [
        createTextDisplay(
          ctx.locale('commands:fazendinha.plantations.description', {
            season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
            unix: millisToSeconds(Date.now() + hoursToMillis(24)),
            emoji: SeasonEmojis[TUTORIAL_SEASON],
          }),
        ),
        ...parseUserPlantations(
          ctx,
          [{ isPlanted: false }],
          AvailablePlants.Mate,
          -1,
          FarmTutorialStep.RottedPlants,
        ),
        createActionRow([
          createSelectMenu({
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'IGNORE'),
            options: getAvailableSeeds(ctx, [], AvailablePlants.Mate, TUTORIAL_SEASON),
            maxValues: 1,
            minValues: 1,
          }),
        ]),
      ],
    ),

  [FarmTutorialStep.RottedPlants]: (ctx: InteractionContext) =>
    sendTutorialMessage(
      ctx,
      'fazendinha plantações',
      FarmTutorialStep.RottedPlants,
      [{}],
      [
        createTextDisplay(
          ctx.locale('commands:fazendinha.plantations.description', {
            season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
            unix: millisToSeconds(Date.now() + hoursToMillis(24)),
            emoji: SeasonEmojis[TUTORIAL_SEASON],
          }),
        ),
        ...parseUserPlantations(
          ctx,
          [
            {
              isPlanted: true,
              harvestAt: Date.now() - minutesToMillis(5),
              plantType: AvailablePlants.Mate,
              plantedSeason: TUTORIAL_SEASON,
            },
          ],
          AvailablePlants.Mate,
          -1,
          FarmTutorialStep.Composter,
        ),
        createActionRow([
          createSelectMenu({
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'IGNORE'),
            options: getAvailableSeeds(ctx, [], AvailablePlants.Mate, TUTORIAL_SEASON),
            maxValues: 1,
            minValues: 1,
          }),
        ]),
      ],
      {
        season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
        plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
        emoji: SeasonEmojis[TUTORIAL_SEASON],
      },
    ),
  [FarmTutorialStep.Composter]: (ctx: InteractionContext) =>
    sendTutorialMessage(
      ctx,
      'fazendinha composteira',
      FarmTutorialStep.Composter,
      [{}],
      [
        ...getComposterDisplayText(ctx, 100),
        createActionRow([
          createButton({
            style: ButtonStyles.Success,
            customId: createCustomId(
              12,
              ctx.user.id,
              ctx.originalInteractionId,
              'STEP',
              FarmTutorialStep.BuySeed,
            ),
            emoji: extractNameAndIdFromEmoji(Items[AvailableItems.Fertilizer].emoji),
            label: ctx.locale('commands:fazendinha.composteira.get-fertilizer', {
              count: 1,
            }),
          }),
        ]),
      ],
    ),
  [FarmTutorialStep.BuySeed]: (ctx: InteractionContext, info?: TutorialInfo) => {
    const [selectCategory, textComponents, selectSeed] = getBuySeedsComponents(
      ctx,
      info?.category ?? PlantCategories.Grain,
      true,
    );

    return sendTutorialMessage(
      ctx,
      'loja comprar sementes',
      FarmTutorialStep.BuySeed,
      [
        {
          season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
          emoji: SeasonEmojis[TUTORIAL_SEASON],
        },
      ],
      [selectCategory, ...textComponents, selectSeed],
      {
        msg: info?.plant
          ? ctx.locale('commands:fazendinha.tutorial.steps.4.warning', {
              season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
            })
          : undefined,
        season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
        emoji: SeasonEmojis[TUTORIAL_SEASON],
      },
    );
  },
  [FarmTutorialStep.DisplaySilo]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha silo',
      FarmTutorialStep.DisplaySilo,
      [{}],
      getSiloComponents(
        ctx,
        [],
        [{ id: AvailableItems.Fertilizer, amount: 1 }],
        [{ plant: info?.plant ?? DEFAULT_TUTORIAL_PLANT, amount: 1 }],
        true,
        false,
        { limit: 2, used: 2 },
        true,
      )[0],
      {
        plant: ctx.locale(`data:plants.${info?.plant ?? DEFAULT_TUTORIAL_PLANT}`),
        emoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
      },
    ),
  [FarmTutorialStep.AdminFarm]: (ctx: InteractionContext, info?: TutorialInfo) => {
    if (info?.itemApplied && info.siloUpgraded)
      return executeTutorialStep(ctx, FarmTutorialStep.PlantUpgraded, info);

    const components = getAdministrateFarmComponents(
      ctx,
      [
        {
          isPlanted: false,
          upgrades: info?.itemApplied
            ? [{ id: AvailableItems.Fertilizer, expiresAt: Date.now() + hoursToMillis(6) }]
            : [],
        },
      ],
      [{ id: AvailableItems.Fertilizer, amount: info?.itemApplied ? 0 : 1 }],
      [{ plant: info?.plant ?? DEFAULT_TUTORIAL_PLANT, weight: 1 }],
      info?.siloUpgraded ? 1 : 0,
      info?.siloUpgraded ? 7 : 2,
      false,
      0,
      true,
    );

    return sendTutorialMessage(
      ctx,
      'fazendinha administrar',
      FarmTutorialStep.AdminFarm,
      [{ finished: !!info?.siloUpgraded }, { finished: !!info?.itemApplied }],
      [...components[0].components, createSeparator(), ...components[1].components],
    );
  },

  [FarmTutorialStep.PlantUpgraded]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha plantações',
      FarmTutorialStep.PlantUpgraded,
      [
        {
          emoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
          plant: ctx.locale(`data:plants.${info?.plant ?? DEFAULT_TUTORIAL_PLANT}`),
        },
        {},
      ],
      [
        createTextDisplay(
          ctx.locale('commands:fazendinha.plantations.description', {
            season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
            unix: millisToSeconds(Date.now() + hoursToMillis(24)),
            emoji: SeasonEmojis[TUTORIAL_SEASON],
          }),
        ),
        ...parseUserPlantations(
          ctx,
          [
            {
              isPlanted: false,
              upgrades: [
                { expiresAt: Date.now() + hoursToMillis(6), id: AvailableItems.Fertilizer },
              ],
            },
          ],
          info?.plant ?? DEFAULT_TUTORIAL_PLANT,
          -1,
          FarmTutorialStep.HarvestQuality,
        ),
        createActionRow([
          createSelectMenu({
            customId: createCustomId(12, ctx.user.id, ctx.originalInteractionId, 'IGNORE'),
            options: [
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              getAvailableSeeds(
                ctx,
                [{ amount: 1, plant: info?.plant ?? DEFAULT_TUTORIAL_PLANT }],
                info?.plant ?? DEFAULT_TUTORIAL_PLANT,
                TUTORIAL_SEASON,
              ).pop()!,
            ],
            maxValues: 1,
            minValues: 1,
          }),
        ]),
      ],
      { emoji: getQualityEmoji(PlantQuality.Best) },
    ),
  [FarmTutorialStep.HarvestQuality]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha plantações',
      FarmTutorialStep.HarvestQuality,
      [
        {
          emoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
          plant: ctx.locale(`data:plants.${info?.plant ?? DEFAULT_TUTORIAL_PLANT}`),
          finished: true,
        },
        {},
      ],
      [
        createTextDisplay(
          ctx.locale('commands:fazendinha.plantations.description', {
            season: ctx.locale(`commands:fazendinha.seasons.${TUTORIAL_SEASON}`),
            unix: millisToSeconds(Date.now() + hoursToMillis(24)),
            emoji: SeasonEmojis[TUTORIAL_SEASON],
          }),
        ),
        ...parseUserPlantations(
          ctx,
          [
            {
              isPlanted: true,
              harvestAt: Date.now() - 2000,
              plantedSeason: TUTORIAL_SEASON,
              plantType: info?.plant ?? DEFAULT_TUTORIAL_PLANT,
              upgrades: [
                { expiresAt: Date.now() + hoursToMillis(6), id: AvailableItems.Fertilizer },
              ],
              weight: 6.7,
            },
          ],
          info?.plant ?? DEFAULT_TUTORIAL_PLANT,
          -1,
          FarmTutorialStep.CheckDeliveries,
        ),
        createActionRow([
          createSelectMenu({
            customId: createCustomId(12, ctx.user.id, ctx.originalInteractionId, 'IGNORE'),
            options: [
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              getAvailableSeeds(
                ctx,
                [{ amount: 1, plant: info?.plant ?? DEFAULT_TUTORIAL_PLANT }],
                info?.plant ?? DEFAULT_TUTORIAL_PLANT,
                TUTORIAL_SEASON,
              ).pop()!,
            ],
            maxValues: 1,
            minValues: 1,
          }),
        ]),
      ],
      {
        worst: ctx.locale(`data:fazendinha.quality_${PlantQuality.Worst}`),
        worstEmoji: getQualityEmoji(PlantQuality.Worst),
        normal: ctx.locale(`data:fazendinha.quality_${PlantQuality.Normal}`),
        normalEmoji: getQualityEmoji(PlantQuality.Normal),
        best: ctx.locale(`data:fazendinha.quality_${PlantQuality.Best}`),
        bestEmoji: getQualityEmoji(PlantQuality.Best),
      },
    ),
  [FarmTutorialStep.CheckDeliveries]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha entregas',
      FarmTutorialStep.CheckDeliveries,
      [
        {},
        {
          emoji: Plants[AvailablePlants.Mate].emoji,
          plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
        },
        {},
        {},
      ],
      [
        createSection({
          accessory: createButton({
            label: ctx.locale('commands:fazendinha.entregas.deliver-button'),
            style: ButtonStyles.Primary,
            disabled: true,
            customId: createCustomId(
              12,
              ctx.user.id,
              ctx.originalInteractionId,
              'STEP',
              FarmTutorialStep.CheckDeliveries,
              info?.plant ?? DEFAULT_TUTORIAL_PLANT,
            ),
          }),
          components: [
            createTextDisplay(
              `### ${ctx.locale(`commands:fazendinha.entregas.deliver-embed-name`, {
                index: 1,
              })}\n${ctx.locale('commands:fazendinha.entregas.deliver-embed-field', {
                award: 420,
                xp: 92,
              })}\n${ctx.locale('commands:fazendinha.entregas.deliver-embed-field-need', {
                amount: 2.5,
                emoji: Plants[AvailablePlants.Mate].emoji,
              })}`,
            ),
          ],
        }),
        createSeparator(false, false),
        createActionRow([
          createButton({
            label: 'Checar trocas de usuários',
            style: ButtonStyles.Primary,
            customId: createCustomId(
              12,
              ctx.user.id,
              ctx.originalInteractionId,
              'STEP',
              FarmTutorialStep.TradePlants,
              info?.plant ?? DEFAULT_TUTORIAL_PLANT,
            ),
          }),
        ]),
      ],
      {
        qualityEmoji: getQualityEmoji(PlantQuality.Best),
        plantEmoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
        amount: 6.7,
      },
    ),
  [FarmTutorialStep.TradePlants]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha feira trocas',
      FarmTutorialStep.TradePlants,
      [
        {},
        {
          emoji: Plants[AvailablePlants.Mate].emoji,
          plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
        },
        {},
        {},
      ],
      [
        createTextDisplay(
          `${ctx.locale('commands:fazendinha.feira.order.neighbor-trades')}\n${`- **${ctx.locale(
            'commands:fazendinha.feira.order.order-name',
            {
              plantEmoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
              weight: 2.7,
              plantName: ctx.locale(`data:plants.${info?.plant ?? DEFAULT_TUTORIAL_PLANT}`),
              qualityEmoji: getQualityEmoji(PlantQuality.Best),
            },
          )} |** ${ctx.locale('commands:fazendinha.feira.order.order-public-description', {
            user: 'Usuário Fofo',
            awards: ctx.locale('commands:fazendinha.feira.order.order-award', {
              amount: 5500,
              metric: '',
              emoji: ctx.safeEmoji('estrelinhas'),
            }),
          })}`}`,
        ),
        createActionRow([
          createSelectMenu({
            customId: createCustomId(
              12,
              ctx.user.id,
              ctx.originalInteractionId,
              'STEP',
              FarmTutorialStep.BuyProduct,
              info?.plant ?? DEFAULT_TUTORIAL_PLANT,
            ),
            options: [
              {
                label: ctx.locale('commands:fazendinha.feira.order.order-name', {
                  plantEmoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
                  weight: 2.7,
                  plantName: ctx.locale(`data:plants.${info?.plant ?? DEFAULT_TUTORIAL_PLANT}`),
                  qualityEmoji: ctx.locale(`data:fazendinha.quality_${PlantQuality.Best}`),
                }),
                value: `marcha`,
                description: ctx
                  .locale('commands:fazendinha.feira.order.order-public-description', {
                    user: 'Usuário Fofo',
                    awards: ctx.locale('commands:fazendinha.feira.order.order-award', {
                      amount: 5500,
                      metric: '',
                      emoji: ctx.safeEmoji('estrelinhas'),
                    }),
                  })
                  .replaceAll('*', ''),
              },
            ],
            minValues: 1,
            maxValues: 1,
          }),
        ]),
      ],
      {
        emoji: Plants[info?.plant ?? DEFAULT_TUTORIAL_PLANT].emoji,
        plant: ctx.locale(`data:plants.${info?.plant ?? DEFAULT_TUTORIAL_PLANT}`),
      },
    ),

  [FarmTutorialStep.BuyProduct]: async (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha feira comprar',
      FarmTutorialStep.BuyProduct,
      [
        { finished: true },
        {
          emoji: Plants[AvailablePlants.Mate].emoji,
          plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
        },
        {},
        {},
      ],
      [
        createSeparator(),
        createTextDisplay(
          `### ${ctx.locale('commands:fazendinha.feira.comprar.fair')}\n${`${ctx.locale(
            'commands:fazendinha.feira.comprar.description',
            {
              amount: 2.5,
              emoji: `${getQualityEmoji(PlantQuality.Normal)} ${Plants[AvailablePlants.Mate].emoji}`,
              plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
              price: 300,
            },
          )} ${ctx.locale('commands:fazendinha.feira.comprar.user-info', {
            user: 'Um usuário qualquer',
            index: 1,
          })}`}`,
        ),
        createActionRow([
          createSelectMenu({
            customId: createCustomId(
              12,
              ctx.user.id,
              ctx.originalInteractionId,
              'STEP',
              FarmTutorialStep.FinishDelivery,
              info?.plant ?? DEFAULT_TUTORIAL_PLANT,
            ),
            placeholder: ctx.locale('commands:fazendinha.feira.comprar.select-item'),
            options: [
              {
                label: `${ctx.locale('commands:fazendinha.feira.order.order-name', {
                  plantEmoji: '',
                  plantName: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
                  weight: 2.5,
                  qualityEmoji: getQualityEmoji(PlantQuality.Normal),
                })}(1)`,
                value: `yay`,
                description: `300 ⭐`,
                emoji: { name: Plants[AvailablePlants.Mate].emoji },
              },
            ],
            minValues: 1,
            maxValues: 1,
          }),
        ]),
      ],
      { commandId: (await commandRepository.getCommandInfo('fazendinha'))?.discordId },
    ),
  [FarmTutorialStep.FinishDelivery]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'fazendinha entregas',
      FarmTutorialStep.FinishDelivery,
      [
        { finished: true },
        {
          emoji: Plants[AvailablePlants.Mate].emoji,
          plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
          finished: true,
        },
        {},
        {},
      ],
      [
        createSection({
          accessory: createButton({
            label: ctx.locale('commands:fazendinha.entregas.deliver-button'),
            style: ButtonStyles.Primary,
            disabled: false,
            customId: createCustomId(
              12,
              ctx.user.id,
              ctx.originalInteractionId,
              'STEP',
              FarmTutorialStep.SellPlants,
              info?.plant ?? DEFAULT_TUTORIAL_PLANT,
            ),
          }),
          components: [
            createTextDisplay(
              `### ${ctx.locale(`commands:fazendinha.entregas.deliver-embed-name`, {
                index: 1,
              })}\n${ctx.locale('commands:fazendinha.entregas.deliver-embed-field', {
                award: 420,
                xp: 92,
              })}\n${ctx.locale('commands:fazendinha.entregas.deliver-embed-field-need', {
                amount: 2.5,
                emoji: Plants[AvailablePlants.Mate].emoji,
              })}`,
            ),
          ],
        }),
      ],
    ),
  [FarmTutorialStep.SellPlants]: (ctx: InteractionContext, info?: TutorialInfo) =>
    sendTutorialMessage(
      ctx,
      'loja vender plantas',
      FarmTutorialStep.SellPlants,
      [
        { finished: true },
        {
          emoji: Plants[AvailablePlants.Mate].emoji,
          plant: ctx.locale(`data:plants.${AvailablePlants.Mate}`),
          finished: true,
        },
        { finished: true },
        {},
      ],
      getSellPlantsComponents(
        ctx,
        [{ plant: info?.plant ?? DEFAULT_TUTORIAL_PLANT, weight: 4, quality: PlantQuality.Best }],
        [`${PlantQuality.Best}`],
        undefined,
        false,
        { used: 4, limit: 7 },
        true,
      ).components,
      { emoji: ctx.safeEmoji('estrelinhas') },
    ),
  [FarmTutorialStep.End]: async (ctx: InteractionContext) => {
    const user = await userRepository.ensureFindUser(ctx.user.id);

    if (!user.titles.some((a) => a.id === TUTORIAL_TITLE_ID)) {
      await giveRepository.giveTitleToUser(ctx.user.id, TUTORIAL_TITLE_ID);

      notificationRepository.createNotification(
        ctx.user.id,
        'commands:notificações.notifications.lux-gave-title',
        {},
      );
    }

    ctx.makeLayoutMessage({
      components: [
        createContainer({
          accentColor: ctx.userColor,
          components: [
            createTextDisplay(
              `## ${ctx.locale('commands:fazendinha.tutorial.title')}\n${ctx.locale(
                `commands:fazendinha.tutorial.steps.${FarmTutorialStep.End}.description`,
              )}`,
            ),
            createSeparator(),
            createActionRow([
              createButton({
                style: ButtonStyles.Secondary,
                label: ctx.locale('commands:fazendinha.tutorial.restart'),
                customId: createCustomId(
                  12,
                  ctx.user.id,
                  ctx.originalInteractionId,
                  'STEP',
                  FarmTutorialStep.Start,
                ),
              }),
              createButton({
                style: ButtonStyles.Secondary,
                label: ctx.locale('common:close'),
                customId: deleteMessageCustomId(ctx),
              }),
            ]),
          ],
        }),
      ],
    });
  },
};

const executeTutorialStep = (
  ctx: InteractionContext,
  step: FarmTutorialStep,
  tutorialInfo?: TutorialInfo,
): unknown => tutorialSteps[step](ctx, tutorialInfo);

const handleTutorialComponents = async (ctx: ComponentInteractionContext) => {
  const [action, step, plant, upgraded, applied] = ctx.sentData;

  const isApplied = applied === 'true';
  const isUpgraded = upgraded === 'true';

  if (action === 'STEP')
    return executeTutorialStep(
      ctx,
      Number(step),
      isUndefined(plant)
        ? undefined
        : {
            plant: Number(plant),
            itemApplied: isApplied,
            siloUpgraded: isUpgraded,
          },
    );

  const selectedValue = ctx.interaction.data?.values?.[0];

  if (action === 'JUMP') return executeTutorialStep(ctx, Number(selectedValue));

  if (action === 'CHANGE_CATEGORY')
    return executeTutorialStep(ctx, FarmTutorialStep.BuySeed, {
      category: Number(selectedValue),
    });

  if (action === 'BUY_SEED') {
    const currentSeed = Number(selectedValue) as AvailablePlants;

    if (Plants[currentSeed].bestSeason !== TUTORIAL_SEASON)
      return executeTutorialStep(ctx, FarmTutorialStep.BuySeed, {
        plant: currentSeed,
        category: Number(step),
      });

    return executeTutorialStep(ctx, FarmTutorialStep.DisplaySilo, {
      plant: currentSeed,
    });
  }
};

export { handleTutorialComponents, executeTutorialStep };
