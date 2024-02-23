import {
  ApplicationCommandOptionTypes,
  BigString,
  ButtonComponent,
  ButtonStyles,
} from 'discordeno/types';

import { Embed, User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { effectToEmoji, getUserStatusDisplay } from '../../modules/roleplay/statusDisplay';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { DatabaseCharacterSchema } from '../../types/database';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import cacheRepository from '../../database/repositories/cacheRepository';
import { getAbility } from '../../modules/roleplay/data/abilities';

const characterPages = ['vitality', 'abilities', 'inventory', 'location'] as const;

type Pages = (typeof characterPages)[number];

const createCharacterNaviagtionButtons = (
  ctx: InteractionContext,
  current: Pages,
  selectedColor: string,
  userId: BigString,
): [ButtonComponent] =>
  characterPages.map((a) =>
    createButton({
      label: ctx.locale(`roleplay:common.${a}`),
      style: ButtonStyles.Primary,
      disabled: a === current,
      customId: createCustomId(0, ctx.user.id, ctx.commandId, userId, a, selectedColor),
    }),
  ) as [ButtonComponent];

const createCharacterEmbed = (
  ctx: InteractionContext,
  user: User,
  character: DatabaseCharacterSchema,
  selectedColor: string,
  currentField: Pages,
): Embed => {
  const embed = createEmbed({
    title: ctx.locale('commands:personagem.embed-title', { user: getDisplayName(user, false) }),
    thumbnail: { url: getUserAvatar(user, { enableGif: true }) },
    color: hexStringToNumber(selectedColor),
  });

  switch (currentField) {
    case 'vitality':
      embed.fields = [
        {
          name: ctx.prettyResponse('attributes', 'roleplay:common.vitality'),
          value: getUserStatusDisplay(ctx, prepareUserToBattle(character)),
        },
      ];
      break;
    case 'inventory':
      embed.fields = [
        {
          name: ctx.prettyResponse('chest', 'roleplay:common.inventory'),
          inline: true,
          value:
            character.inventory.length === 0
              ? ctx.prettyResponse('no', 'commands:personagem.no-items')
              : character.inventory
                  .map((a) =>
                    ctx.locale('commands:personagem.display-item', {
                      amount: a.amount,
                      name: ctx.locale(`items:${a.id}.name`),
                    }),
                  )
                  .join('\n'),
        },
        {
          name: ctx.prettyResponse('dragonnys', 'roleplay:common.money'),
          value: `${character.money}`,
          inline: true,
        },
      ];

      break;
    case 'abilities':
      embed.fields = [
        {
          name: ctx.prettyResponse('magic_ball', 'roleplay:common.abilities'),
          value:
            character.abilities.length === 0
              ? ctx.locale('commands:personagem.no-abilities')
              : character.abilities
                  .map(
                    (hab) =>
                      `- ${ctx.locale('commands:personagem.display-ability', {
                        name: ctx.locale(`abilities:${hab.id}.name`),
                        proficience: hab.proficience,
                      })}\n${getAbility(hab.id)
                        .effects.map((e) =>
                          ctx.locale(
                            `commands:personagem.${e.timesToApply ? 'turns-' : ''}effect-display`,
                            { ...e, emoji: effectToEmoji[e.type] },
                          ),
                        )
                        .join('\n')}`,
                  )
                  .join('\n\n'),
        },
      ];
      break;
    case 'location': {
      embed.description = `${ctx.prettyResponse('pin', 'roleplay:common.location')}: ${
        character.location
      }`;
    }
  }

  return embed;
};

const navigateThrough = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [userId, page, selectedColor] = ctx.sentData as [string, Pages, string];

  const isUserInBattle = await battleRepository.isUserInBattle(userId);

  const user = await cacheRepository.getDiscordUser(userId);

  if (!user) throw new Error(`Unable to retrive discord user for ID ${userId}`);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:personagem.in-battle-user', {
        name: getDisplayName(user),
      }),
      flags: MessageFlags.EPHEMERAL,
    });

  const character = await roleplayRepository.getCharacter(userId);

  const embed = createCharacterEmbed(ctx, user, character, selectedColor, page);

  const buttons = createCharacterNaviagtionButtons(ctx, page, selectedColor, userId);

  await ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow(buttons)],
  });
};

const CharacterCommand = createCommand({
  path: '',
  name: 'personagem',
  nameLocalizations: { 'en-US': 'character' },
  description: '「RPG」・Veja o seu personagem do RPG',
  descriptionLocalizations: {
    'en-US': '「RPG」・Check your RPG character',
  },
  options: [
    {
      name: 'jogador',
      nameLocalizations: { 'en-US': 'player' },
      type: ApplicationCommandOptionTypes.User,
      description: 'Jogador que tu quer ver o personagem',
      descriptionLocalizations: { 'en-US': 'Player that you want to check the character' },
      required: false,
    },
  ],
  category: 'roleplay',
  commandRelatedExecutions: [navigateThrough],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const user = ctx.getOption<User>('jogador', 'users', false) ?? ctx.user;

    if (user.toggles.bot)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:personagem.bot-mentioned'),
        flags: MessageFlags.EPHEMERAL,
      });

    const isUserInBattle = await battleRepository.isUserInBattle(user.id);

    if (isUserInBattle)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:personagem.in-battle-user', {
          name: getDisplayName(user),
        }),
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(user.id);

    const embed = createCharacterEmbed(
      ctx,
      user,
      character,
      ctx.authorData.selectedColor,
      'vitality',
    );

    const buttons = createCharacterNaviagtionButtons(
      ctx,
      'vitality',
      ctx.authorData.selectedColor,
      user.id,
    );

    await ctx.makeMessage({
      embeds: [embed],
      components: [createActionRow(buttons)],
    });
  },
});

export default CharacterCommand;
