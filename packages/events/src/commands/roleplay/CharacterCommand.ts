import {
  ApplicationCommandOptionTypes,
  BigString,
  ButtonComponent,
  ButtonStyles,
} from 'discordeno/types';

import { Embed, User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getUserStatusDisplay } from '../../modules/roleplay/statusDisplay';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { DatabaseCharacterSchema } from '../../types/database';
import cacheRepository from '../../database/repositories/cacheRepository';
import { EMOJIS } from '../../structures/constants';
import { Items } from '../../modules/roleplay/data/items';
import { getAbility } from '../../modules/roleplay/data/abilities';

const characterPages = ['VITALITY', 'ABILITY', 'INVENTORY', 'LOCATION'] as const;

type Pages = (typeof characterPages)[number];

type ReturnButtons = [
  ButtonComponent,
  ButtonComponent,
  ButtonComponent,
  ButtonComponent,
  ButtonComponent,
];

const createCharacterNaviagtionButtons = (
  ctx: InteractionContext,
  current: Pages,
  selectedColor: string,
  userId: BigString,
): ReturnButtons =>
  characterPages.map((a) =>
    createButton({
      label: a,
      style: ButtonStyles.Primary,
      disabled: a === current,
      customId: createCustomId(0, ctx.user.id, ctx.commandId, userId, a, selectedColor),
    }),
  ) as ReturnButtons;

const createCharacterEmbed = (
  user: User,
  character: DatabaseCharacterSchema,
  selectedColor: string,
  currentField: Pages,
): Embed => {
  const embed = createEmbed({
    title: `Personagem de ${getDisplayName(user, false)}`,
    thumbnail: { url: getUserAvatar(user, { enableGif: true }) },
    color: hexStringToNumber(selectedColor),
  });

  switch (currentField) {
    case 'VITALITY':
      embed.fields = [
        {
          name: '🎭 | Atributos',
          value: getUserStatusDisplay(prepareUserToBattle(character)),
        },
      ];
      break;
    case 'INVENTORY':
      embed.fields = [
        {
          name: `${EMOJIS.chest} | Inventário`,
          value:
            character.inventory.length > 0
              ? character.inventory
                  .map((a) => `**${a.amount}x** - ${Items[a.id as 1].$devName}`)
                  .join('\n')
              : 'Sem itens no inventário',
        },
      ];
      break;
    case 'ABILITY':
      embed.fields = [
        {
          name: `${EMOJIS.magic_ball} | Habilidades`,
          value:
            character.abilities.length === 0
              ? 'Sem Habilidades'
              : character.abilities
                  .map((hab) => `${getAbility(hab.id).$devName} - Proficiência: ${hab.proficience}`)
                  .join('\n'),
        },
      ];
      break;
    case 'LOCATION': {
      embed.description = `📍 | Sua localização: ${character.location}`;
    }
  }

  return embed;
};

const navigateThrough = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [userId, page, selectedColor] = ctx.sentData;

  const isUserInBattle = await battleRepository.isUserInBattle(userId);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: `Não é possível ver os status de alguém que está em batalha`,
      flags: MessageFlags.EPHEMERAL,
    });

  const character = await roleplayRepository.getCharacter(userId);

  const user = await cacheRepository.getDiscordUser(userId);

  const embed = createCharacterEmbed(
    user ?? ctx.user,
    character,
    selectedColor,
    page as 'VITALITY',
  );

  const buttons = createCharacterNaviagtionButtons(ctx, page as 'VITALITY', selectedColor, userId);

  await ctx.makeMessage({
    content: `Bem vindo, jogador ${mentionUser(character.id)}!`,
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

    if (user.toggles.bot) return ctx.makeMessage({ content: `Não eras, bot nao joga` });

    const isUserInBattle = await battleRepository.isUserInBattle(user.id);

    if (isUserInBattle)
      return ctx.makeMessage({
        content: `Não é possível ver os status de alguém que está em batalha`,
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(user.id);

    const embed = createCharacterEmbed(user, character, ctx.authorData.selectedColor, 'VITALITY');

    const buttons = createCharacterNaviagtionButtons(
      ctx,
      'VITALITY',
      ctx.authorData.selectedColor,
      user.id,
    );

    await ctx.makeMessage({
      content: `Bem vindo, jogador ${mentionUser(character.id)}!`,
      embeds: [embed],
      components: [createActionRow(buttons)],
    });
  },
});

export default CharacterCommand;
