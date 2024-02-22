import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { prepareEnemyToBattle, prepareUserToBattle } from '../../modules/roleplay/devUtils';
import { confirmAdventure } from '../../modules/roleplay/adventureManager';
import { battleInteractionReceptor } from '../../modules/roleplay/battleInteractionReceptor';
import { millisToSeconds } from '../../utils/miscUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { Abilities } from '../../modules/roleplay/data/abilities';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { getCurrentAvailableEnemy } from '../../modules/roleplay/worldEnemiesManager';
import { Action, DeathAction } from '../../modules/roleplay/types';

const executeSelectAbility = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedAbility] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (character.abilities.length > 0)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: 'Tu ja aprendeu uma habilidade',
    });

  await roleplayRepository.updateCharacter(ctx.user.id, {
    abilities: [{ id: Number(selectedAbility) as 1, proficience: 0 }],
  });

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: `Você aprendeu a habilidade ${
      Abilities[selectedAbility as '1'].$devName
    }! Vá para a batalha!`,
  });
};

const AdventureCommand = createCommand({
  path: '',
  name: 'aventura',
  nameLocalizations: { 'en-US': 'adventure' },
  description: '「RPG」・Vá para uma aventura na dungeon',
  descriptionLocalizations: {
    'en-US': '「RPG」・Go to a dungeon adventure',
  },
  category: 'roleplay',
  commandRelatedExecutions: [battleInteractionReceptor, executeSelectAbility],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    if (await battleRepository.isUserInBattle(ctx.user.id))
      return ctx.makeMessage({
        content: 'Você ja está em uma aventura!',
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(ctx.user.id);

    if (character.currentAction.type === Action.DEATH)
      return ctx.makeMessage({
        content: `Você está morto! Você poderá entrar em uma aventura <t:${millisToSeconds(
          (character.currentAction as DeathAction).reviveAt,
        )}:R>`,
      });

    if (![Action.NONE, Action.TRAVEL].includes(character.currentAction.type))
      return ctx.makeMessage({
        content: `Não é possível batalhar enquanto se está fazendo outra coisa`,
        flags: MessageFlags.EPHEMERAL,
      });

    const availableAbilities = Object.entries(Abilities).filter((a) =>
      ['1', '2', '3', '4'].includes(a[0]),
    );

    if (character.abilities.length === 0) {
      const embed = createEmbed({
        title: 'Escolha sua primeira habilidade',
        color: hexStringToNumber(ctx.authorData.selectedColor),
        fields: availableAbilities.map(([, ability]) => ({
          name: ability.$devName,
          value: `Efeitos: ${JSON.stringify(ability.effects)}\nCusto de Energia: ${
            ability.energyCost
          }`,
          inline: true,
        })),
      });

      const buttons = availableAbilities.map(([id, ability]) =>
        createButton({
          label: ability.$devName,
          style: ButtonStyles.Primary,
          customId: createCustomId(1, ctx.user.id, ctx.commandId, id),
        }),
      );

      return ctx.makeMessage({
        content: `Bem vindo!\nPara começar o seu personagem, escolha uma habilidade para aprender`,
        embeds: [embed],
        components: [createActionRow(buttons as [ButtonComponent])],
      });
    }

    const enemy = await getCurrentAvailableEnemy(character.location);

    if (!enemy) return ctx.makeMessage({ content: `Não há inimigos disponíveis por perto` });

    confirmAdventure(ctx, prepareUserToBattle(character), prepareEnemyToBattle(enemy, 1));
  },
});

export default AdventureCommand;
