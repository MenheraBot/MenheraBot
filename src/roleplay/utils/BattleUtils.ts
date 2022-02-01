import { ReadyToBattleEnemy, RoleplayUserSchema } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, ENEMY_ATTACK_MULTIPLIER_CHANCE } from '@structures/Constants';
import { calculateProbability } from '@utils/HuntUtils';
import Util, { actionRow, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import {
  calculateEffectiveDamage,
  getAbilityCost,
  getAbilityDamage,
  getAbilityHeal,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
} from './Calculations';

const TIME_TO_SELECT = 8000;

export const battleLoop = async (
  user: RoleplayUserSchema,
  enemy: ReadyToBattleEnemy,
  ctx: InteractionCommandContext,
  text: string,
): Promise<{ user: RoleplayUserSchema; enemy: ReadyToBattleEnemy; lastText: string }> => {
  const [needStop, newUser, newEnemy, newText] = await userAttack(user, enemy, ctx, text);

  if (!needStop) {
    const [enemyStop, enemyUser, enemyEnemy, enemyText] = enemyAttack(
      newUser,
      newEnemy,
      ctx,
      newText,
    );
    if (!enemyStop) return battleLoop(enemyUser, enemyEnemy, ctx, enemyText);
  }

  return { user, enemy, lastText: text };
};

export const enemyAttack = (
  user: RoleplayUserSchema,
  enemy: ReadyToBattleEnemy,
  ctx: InteractionCommandContext,
  text: string,
): [boolean, RoleplayUserSchema, ReadyToBattleEnemy, string] => {
  const multiplier = calculateProbability(ENEMY_ATTACK_MULTIPLIER_CHANCE);
  const effectiveDamage = calculateEffectiveDamage(enemy.damage * multiplier, getUserArmor(user));

  user.life -= effectiveDamage;

  if (user.life < 0) return [true, user, enemy, ctx.locale('roleplay:battle.user-death')];
  return [
    false,
    user,
    enemy,
    `${text}\n${ctx.locale('roleplay:battle.deffend-text', {
      enemy: ctx.locale(`enemies:${enemy.id as 1}.name`),
      damage: effectiveDamage,
      attack: ctx.locale(`roleplay:attacks.${multiplier as 1}`),
    })}`,
  ];
};

export const userAttack = async (
  user: RoleplayUserSchema,
  enemy: ReadyToBattleEnemy,
  ctx: InteractionCommandContext,
  text: string,
): Promise<[boolean, RoleplayUserSchema, ReadyToBattleEnemy, string]> => {
  const embed = new MessageEmbed()
    .setTitle(
      ctx.prettyResponse('sword', 'roleplay:battle.title', {
        name: ctx.locale(`enemies:${enemy.id as 1}.name`),
      }),
    )
    .setColor(COLORS.Battle)
    .setFooter({ text: ctx.locale('roleplay:battle.footer', { time: TIME_TO_SELECT / 1000 }) })
    .setDescription(text)
    .addFields([
      {
        name: ctx.locale('roleplay:battle.your-stats'),
        value: ctx.locale('roleplay:battle.your-stats-info', {
          life: user.life,
          mana: user.mana,
          damage: getUserDamage(user),
          armor: getUserArmor(user),
          intelligence: getUserIntelligence(user),
        }),
        inline: true,
      },
      {
        name: ctx.locale('roleplay:battle.enemy-stats'),
        value: ctx.locale('roleplay:battle.enemy-stats-info', {
          life: enemy.life,
          damage: enemy.damage,
          armor: enemy.armor,
        }),
        inline: true,
      },
      {
        name: ctx.locale('roleplay:battle.options.available'),
        value: '\u200b',
        inline: false,
      },
    ]);

  const options = new MessageSelectMenu()
    .setCustomId(`${ctx.interaction.id} | SELECT`)
    .setPlaceholder(ctx.locale('roleplay:battle.select'))
    .addOptions({
      label: ctx.locale('roleplay:battle.options.hand-attack'),
      value: 'HANDATTACK',
      description: ctx.locale('roleplay:battle.options.hand-attack-description').substring(0, 100),
    });

  embed.addField(
    ctx.locale('roleplay:battle.options.hand-attack'),
    ctx.locale('roleplay:battle.options.info', { damage: getUserDamage(user), cost: 0, heal: 0 }),
    true,
  );

  user.abilities.forEach((ability) => {
    embed.addField(
      ctx.locale(`abilities:${ability.id as 100}.name`),
      ctx.locale('roleplay:battle.options.info', {
        damage: getAbilityDamage(ability, getUserIntelligence(user)),
        heal: getAbilityHeal(ability, getUserIntelligence(user)),
        cost: getAbilityCost(ability),
        'no-mana': user.mana < getAbilityCost(ability) ? ctx.locale('roleplay:battle.no-mana') : '',
      }),
      true,
    );

    if (user.mana >= getAbilityCost(ability)) {
      options.addOptions({
        label: ctx.locale(`abilities:${ability.id as 100}.name`),
        value: `ABILITY | ${ability.id}`,
      });
    }
  });

  ctx.makeMessage({ embeds: [embed], components: [actionRow([options])] });

  const selectedOptions =
    await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      TIME_TO_SELECT,
    );

  if (!selectedOptions) return [false, user, enemy, ctx.locale('roleplay:battle.no-action')];

  switch (resolveSeparatedStrings(selectedOptions.values[0])[0]) {
    case 'HANDATTACK': {
      const damageDealt = calculateEffectiveDamage(getUserDamage(user), enemy.armor);
      enemy.life -= damageDealt;
      if (enemy.life <= 0) return [true, user, enemy, ctx.locale('roleplay:battle.enemy-death')];
      return [
        false,
        user,
        enemy,
        ctx.locale('roleplay:battle.attack-text', {
          attack: ctx.locale(`roleplay:battle.options.hand-attack`),
          damage: damageDealt,
        }),
      ];
    }
    case 'ABILITY': {
      const abilityId = Number(resolveSeparatedStrings(selectedOptions.values[0])[1]);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const usedAbility = user.abilities.find((a) => a.id === abilityId)!;

      const damageDealt = getAbilityDamage(usedAbility, getUserIntelligence(user));
      enemy.life -= damageDealt;
      user.mana -= getAbilityCost(usedAbility);

      if (enemy.life <= 0) return [true, user, enemy, ctx.locale('roleplay:battle.enemy-death')];
      return [
        false,
        user,
        enemy,
        ctx.locale('roleplay:battle.attack-text', {
          attack: ctx.locale(
            `abilities:${resolveSeparatedStrings(selectedOptions.values[0])[1] as '100'}.name`,
          ),
          damage: damageDealt,
        }),
      ];
    }
  }
  return [false, user, enemy, ctx.locale('roleplay:battle.no-action')];
};
