import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getUserStatusDisplay } from '../../modules/roleplay/statusDisplay';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { checkDeath, didUserResurrect } from '../../modules/roleplay/battle/battleUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { Items } from '../../modules/roleplay/data/items';
import { EMOJIS } from '../../structures/constants';
import { getAbility } from '../../modules/roleplay/data/abilities';

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

    if (checkDeath(character)) await didUserResurrect(character);

    const embed = createEmbed({
      title: `Personagem de ${getDisplayName(ctx.user, false)}`,
      thumbnail: { url: getUserAvatar(user, { enableGif: true }) },
      color: hexStringToNumber(ctx.authorData.selectedColor),
      fields: [
        {
          name: '🎭 | Atributos',
          value: getUserStatusDisplay(prepareUserToBattle(character)),
        },
        {
          name: `${EMOJIS.magic_ball} | Habilidades`,
          value:
            character.abilities.length === 0
              ? 'Sem Habilidades'
              : character.abilities
                  .map((hab) => `${getAbility(hab.id).$devName} - Proficiência: ${hab.proficience}`)
                  .join('\n'),
        },
        {
          name: `${EMOJIS.chest} | Inventário`,
          value:
            character.inventory.length > 0
              ? character.inventory
                  .map((a) => `**${a.amount}x** - ${Items[a.id as 1].$devName} - Lvl. ${a.level}`)
                  .join('\n')
              : 'Sem itens no inventário',
        },
      ],
    });

    await ctx.makeMessage({
      content: `Bem vindo, jogador ${mentionUser(character.id)}!`,
      embeds: [embed],
    });
  },
});

export default CharacterCommand;
