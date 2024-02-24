import { ButtonStyles } from 'discordeno/types';
import battleRepository from '../../../../database/repositories/battleRepository';
import roleplayRepository from '../../../../database/repositories/roleplayRepository';
import ChatInputInteractionContext from '../../../../structures/command/ChatInputInteractionContext';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../../../utils/discord/embedUtils';
import { MessageFlags } from '../../../../utils/discord/messageUtils';
import { Action } from '../../types';
import ComponentInteractionContext from '../../../../structures/command/ComponentInteractionContext';

const executeDisplayChurch = async (ctx: ChatInputInteractionContext): Promise<void> => {
  if (await battleRepository.isUserInBattle(ctx.user.id))
    return ctx.makeMessage({
      content: ctx.prettyResponse('chick', 'commands:acessar.igreja.in-battle'),
      flags: MessageFlags.EPHEMERAL,
    });

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (![Action.NONE, Action.CHURCH].includes(character.currentAction.type))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:acessar.igreja.other-action'),
      flags: MessageFlags.EPHEMERAL,
    });

  const embed = createEmbed({
    title: ctx.prettyResponse('church', 'commands:acessar.igreja.title'),
    description: ctx.locale('commands:acessar.igreja.description'),
    color: hexStringToNumber(ctx.authorData.selectedColor),
  });

  const inChurch = character.currentAction.type === Action.CHURCH;

  const disableClick = !inChurch && character.life >= 95 && character.energy >= 95;

  const confirmButton = createButton({
    label: ctx.locale(`commands:acessar.igreja.${inChurch ? 'stop' : 'start'}-praying`),
    style: inChurch ? ButtonStyles.Secondary : ButtonStyles.Success,
    disabled: disableClick,
    customId: createCustomId(1, ctx.user.id, ctx.commandId),
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([confirmButton])] });
};

const enterChurch = async (ctx: ComponentInteractionContext): Promise<void> => {
  if (await battleRepository.isUserInBattle(ctx.user.id))
    return ctx.makeMessage({
      content: ctx.prettyResponse('chick', 'commands:viajar.in-battle'),
      components: [],
      embeds: [],
    });

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (![Action.NONE, Action.CHURCH].includes(character.currentAction.type))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:acessar.igreja.other-action'),
      components: [],
      embeds: [],
    });

  if (character.currentAction.type === Action.CHURCH) {
    await roleplayRepository.updateCharacter(ctx.user.id, {
      currentAction: { type: Action.NONE },
      life: character.life,
      energy: character.energy,
    });

    return ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:acessar.igreja.recovered'),
      embeds: [],
      components: [],
    });
  }

  const enableHeal = character.life < 95 || character.energy < 95;

  if (!enableHeal)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:acessar.igreja.no-needed'),
      embeds: [],
      components: [],
    });

  await roleplayRepository.updateCharacter(ctx.user.id, {
    currentAction: { type: Action.CHURCH, startAt: Date.now() },
  });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:acessar.igreja.praying'),
    embeds: [],
    components: [],
  });
};

export { executeDisplayChurch, enterChurch };
