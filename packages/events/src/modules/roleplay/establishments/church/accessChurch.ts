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
import {
  MAX_CHARACTER_ENERGY,
  MAX_CHARACTER_LIFE,
  STATUS_RECOVERY_IN_CHURCH_PER_MINUTE,
} from '../../constants';
import { millisToSeconds, minutesToMillis } from '../../../../utils/miscUtils';

const fullyRecoveredAt = (life: number, energy: number): number => {
  const missingLife = MAX_CHARACTER_LIFE - life;
  const missingEnergy = MAX_CHARACTER_ENERGY - energy;

  const fullyHealthMinutes = Math.round(missingLife / STATUS_RECOVERY_IN_CHURCH_PER_MINUTE.life);
  const fullyEnergyMinutes = Math.round(
    missingEnergy / STATUS_RECOVERY_IN_CHURCH_PER_MINUTE.energy,
  );

  const fullyHealthAt = Math.max(minutesToMillis(fullyHealthMinutes), 0);
  const fullyEnergyAt = Math.max(minutesToMillis(fullyEnergyMinutes), 0);

  return (fullyHealthAt || fullyEnergyAt) === 0
    ? -1
    : Math.max(Date.now() + fullyEnergyAt, Date.now() + fullyHealthAt);
};

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

  const recoveredAt = fullyRecoveredAt(character.life, character.energy);

  const embed = createEmbed({
    title: ctx.prettyResponse('church', 'commands:acessar.igreja.title'),
    description:
      character.currentAction.type === Action.CHURCH && recoveredAt !== -1
        ? ctx.locale('commands:acessar.igreja.praying-now', {
            unix: millisToSeconds(recoveredAt),
          })
        : ctx.locale(
            character.currentAction.type === Action.CHURCH
              ? 'commands:acessar.igreja.recovered'
              : 'commands:acessar.igreja.description',
          ),
    color: hexStringToNumber(ctx.authorData.selectedColor),
  });

  const inChurch = character.currentAction.type === Action.CHURCH;

  const disableClick = !inChurch && character.life >= 95 && character.energy >= 95;

  const confirmButton = createButton({
    label: ctx.locale(`commands:acessar.igreja.${inChurch ? 'stop' : 'start'}-praying`),
    style: inChurch ? ButtonStyles.Secondary : ButtonStyles.Success,
    disabled: disableClick,
    customId: createCustomId(1, ctx.user.id, ctx.originalInteractionId),
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
