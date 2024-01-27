import { ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import battleRepository from '../../database/repositories/battleRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { Action } from '../../modules/roleplay/types';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const enterChurch = async (ctx: ComponentInteractionContext): Promise<void> => {
  if (await battleRepository.isUserInBattle(ctx.user.id))
    return ctx.makeMessage({
      content: `Não é possível entrar na igreja enquanto está em uma batalha`,
      flags: MessageFlags.EPHEMERAL,
    });

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (![Action.NONE, Action.CHURCH].includes(character.currentAction.type))
    return ctx.makeMessage({
      content: `Não é possível entrar na igreja enquanto você está fazendo outra coisa`,
      flags: MessageFlags.EPHEMERAL,
    });

  if (character.currentAction.type === Action.CHURCH) {
    await roleplayRepository.updateCharacter(ctx.user.id, {
      currentAction: { type: Action.NONE },
      life: character.life,
      energy: character.energy,
    });

    return ctx.makeMessage({
      content: 'Tu revigorou tuas forças!',
      embeds: [],
      components: [],
    });
  }

  const enableHeal = character.life < 95 || character.energy < 95;

  if (!enableHeal)
    return ctx.respondInteraction({
      content: 'Tua vitalidade ta tri, não precisa descança',
      flags: MessageFlags.EPHEMERAL,
    });

  await roleplayRepository.updateCharacter(ctx.user.id, {
    currentAction: { type: Action.CHURCH, startAt: Date.now() },
  });

  ctx.makeMessage({ content: 'Tu começou a descançar na igreja', embeds: [], components: [] });
};

const ChurchCommand = createCommand({
  path: '',
  name: 'igreja',
  nameLocalizations: { 'en-US': 'church' },
  description: '「RPG」・Recupere sua vitalidade e fortaleça sua fé',
  descriptionLocalizations: {
    'en-US': '「RPG」・Recover your vitality and strengthen your faith',
  },
  category: 'roleplay',
  commandRelatedExecutions: [enterChurch],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    if (await battleRepository.isUserInBattle(ctx.user.id))
      return ctx.makeMessage({
        content: `Não é possível entrar na igreja enquanto está em uma batalha`,
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(ctx.user.id);

    if (![Action.NONE, Action.CHURCH].includes(character.currentAction.type))
      return ctx.makeMessage({
        content: `Não é possível entrar na igreja enquanto você está fazendo outra coisa`,
        flags: MessageFlags.EPHEMERAL,
      });

    const embed = createEmbed({
      title: 'Pontifícia Igreja de Boleham',
      description: `Entre na igreja para revigorar suas forças`,
      color: hexStringToNumber(ctx.authorData.selectedColor),
    });

    const inChurch = character.currentAction.type === Action.CHURCH;

    const disableClick = !inChurch && (character.life >= 95 || character.energy >= 95);

    const confirmButton = createButton({
      label: inChurch ? 'Sair da igreja' : 'Revigorar-se',
      style: inChurch ? ButtonStyles.Secondary : ButtonStyles.Success,
      disabled: disableClick,
      customId: createCustomId(0, ctx.user.id, ctx.commandId),
    });

    ctx.makeMessage({ embeds: [embed], components: [createActionRow([confirmButton])] });
  },
});

export default ChurchCommand;
