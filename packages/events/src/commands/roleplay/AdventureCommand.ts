import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import { confirmAdventure } from '../../modules/roleplay/adventureManager';
import { battleInteractionReceptor } from '../../modules/roleplay/battleInteractionReceptor';
import { millisToSeconds } from '../../utils/miscUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { Abilities } from '../../modules/roleplay/data/abilities';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { Action, DeathAction } from '../../modules/roleplay/types';
import { getCurrentAvailableEnemy } from '../../modules/roleplay/worldEnemiesManager';

const executeSelectAbility = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedAbility] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (character.abilities.length > 0)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:aventura.first-ability.already-learned'),
    });

  await roleplayRepository.updateCharacter(ctx.user.id, {
    abilities: [{ id: Number(selectedAbility) as 1, proficience: 0 }],
  });

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('magic_ball', 'roleplay:common.unlock-ability', {
      name: ctx.locale(`abilities:${selectedAbility as '1'}.name`),
    }),
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
        content: ctx.prettyResponse('error', 'commands:aventura.in-battle'),
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(ctx.user.id);

    if (character.currentAction.type === Action.DEATH)
      return ctx.makeMessage({
        flags: MessageFlags.EPHEMERAL,
        content: ctx.prettyResponse('error', 'commands:aventura.dead', {
          unix: millisToSeconds((character.currentAction as DeathAction).reviveAt),
        }),
      });

    if (![Action.NONE, Action.TRAVEL].includes(character.currentAction.type))
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:aventura.other-action'),
        flags: MessageFlags.EPHEMERAL,
      });

    const availableAbilities = Object.entries(Abilities).filter((a) =>
      ['1', '2', '3', '4'].includes(a[0]),
    );

    if (character.abilities.length === 0) {
      const embed = createEmbed({
        title: ctx.locale('commands:aventura.first-ability.title'),
        description: ctx.locale('commands:aventura.first-ability.description'),
        color: hexStringToNumber(ctx.authorData.selectedColor),
        fields: availableAbilities.map(([id, ability]) => ({
          name: ctx.locale(`abilities:${id as '1'}.name`),
          value: ctx.locale('commands:aventura.battle.energy-cost', {
            cost: ability.energyCost,
          }),
          inline: true,
        })),
      });

      const buttons = availableAbilities.map(([id]) =>
        createButton({
          label: ctx.locale(`abilities:${id as '1'}.name`),
          style: ButtonStyles.Primary,
          customId: createCustomId(1, ctx.user.id, ctx.commandId, id),
        }),
      );

      return ctx.makeMessage({
        embeds: [embed],
        components: [createActionRow(buttons as [ButtonComponent])],
      });
    }

    const enemy = await getCurrentAvailableEnemy(character.location);

    if (!enemy)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:aventura.no-enemies'),
        flags: MessageFlags.EPHEMERAL,
      });

    confirmAdventure(ctx, prepareUserToBattle(character), ctx.authorData.selectedColor);
  },
});

export default AdventureCommand;
