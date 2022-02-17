import { ENEMY_ATTACK_MULTIPLIER_CHANCE } from '@roleplay/Constants';
import { ReadyToBattleEnemy, UserBattleEntity } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import { calculateProbability } from '@utils/HuntUtils';
import Util, { actionRow, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import { isDead } from './AdventureUtils';
import {
  calculateAttackSuccess,
  calculateDodge,
  calculateEffectiveDamage,
  calculateHeal,
  calculatePoison,
  calculateUserPenetration,
  didUserDodged,
  didUserHit,
  getAbilityCost,
  getUserAgility,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
} from './Calculations';
import { getAbilityById } from './DataUtils';

export default class RoleplayBattle {
  public missedAttacks = 0;

  private readonly TIME_TO_SELECT = 12_000;

  constructor(
    public user: UserBattleEntity,
    public enemy: ReadyToBattleEnemy,
    private ctx: InteractionCommandContext,
    public lastText: string,
  ) {}

  public async battleLoop(): Promise<RoleplayBattle> {
    const willEnemyStart = this.enemy.agility > getUserAgility(this.user);
    const needStop = willEnemyStart ? this.enemyAttack() : await this.userAttack();

    console.log(this.user.effects, this.enemy.effects);

    if (!needStop) {
      const enemyStop = willEnemyStart ? await this.userAttack() : this.enemyAttack();
      this.clearEffects();
      if (!enemyStop) return this.battleLoop();
    }

    return this;
  }

  private clearEffects(): void {
    this.user.effects.forEach((a, i) => {
      switch (a.effectType) {
        case 'heal':
          this.user.life = Math.min(getUserMaxLife(this.user), calculateHeal(this.user, a));
          break;
      }

      a.durationInTurns -= 1;
      if (a.durationInTurns <= 0) this.user.effects.splice(i, 1);
    });

    this.enemy.effects.forEach((a, i) => {
      switch (a.effectType) {
        case 'poison':
          this.enemy.life -= calculatePoison(this.user, a, this.enemy.life);
          break;
      }
      a.durationInTurns -= 1;
      if (a.durationInTurns <= 0) this.user.effects.splice(i, 1);
    });
  }

  private enemyAttack(): boolean {
    const multiplier = calculateProbability(ENEMY_ATTACK_MULTIPLIER_CHANCE);
    const effectiveDamage = calculateEffectiveDamage(
      this.enemy.damage * multiplier,
      calculateUserPenetration(this.user),
      getUserArmor(this.user),
    );

    const didDodged = didUserDodged(calculateDodge(getUserAgility(this.user), this.enemy.agility));

    if (!didDodged) this.user.life -= effectiveDamage;

    if (isDead(this.user)) {
      this.lastText = this.ctx.locale('roleplay:battle.user-death');
    }
    this.lastText = `${this.lastText}\n${this.ctx.locale('roleplay:battle.deffend-text', {
      enemy: this.ctx.locale(`enemies:${this.enemy.id as 1}.name`),
      damage: didDodged ? this.ctx.locale('roleplay:battle.dodged') : effectiveDamage,
      attack: this.ctx.locale(`roleplay:attacks.${multiplier.toString().replace('.', '-') as '1'}`),
    })}`;
    return false;
  }

  private async userAttack(): Promise<boolean> {
    if (this.missedAttacks >= 4) {
      this.user.life = 0;
      this.lastText = this.ctx.locale('roleplay:battle.user-death');
      return true;
    }

    const embed = new MessageEmbed()
      .setTitle(
        this.ctx.prettyResponse('sword', 'roleplay:battle.title', {
          name: this.ctx.locale(`enemies:${this.enemy.id as 1}.name`),
        }),
      )
      .setColor(COLORS.Battle)
      .setFooter({
        text: this.ctx.locale('roleplay:battle.footer', { time: this.TIME_TO_SELECT / 1000 }),
      })
      .setDescription(this.lastText)
      .addFields([
        {
          name: this.ctx.locale('roleplay:battle.your-stats'),
          value: this.ctx.locale('roleplay:battle.your-stats-info', {
            life: this.user.life,
            mana: this.user.mana,
            damage: getUserDamage(this.user),
            armor: getUserArmor(this.user),
            intelligence: getUserIntelligence(this.user),
            agility: getUserAgility(this.user),
            chanceToConnect: (
              100 - calculateAttackSuccess(getUserAgility(this.user), this.enemy.agility)
            ).toFixed(2),
            chanceToDodge: calculateDodge(getUserAgility(this.user), this.enemy.agility).toFixed(2),
          }),
          inline: true,
        },
        {
          name: this.ctx.locale('roleplay:battle.enemy-stats'),
          value: this.ctx.locale('roleplay:battle.enemy-stats-info', {
            life: this.enemy.life,
            damage: this.enemy.damage,
            armor: this.enemy.armor,
            agility: this.enemy.agility,
          }),
          inline: true,
        },
        {
          name: this.ctx.locale('roleplay:battle.options.available'),
          value: '\u200b',
          inline: false,
        },
      ]);

    const options = new MessageSelectMenu()
      .setCustomId(`${this.ctx.interaction.id} | SELECT`)
      .setPlaceholder(this.ctx.locale('roleplay:battle.select'))
      .addOptions({
        label: this.ctx.locale('roleplay:battle.options.hand-attack'),
        value: 'HANDATTACK',
        description: this.ctx
          .locale('roleplay:battle.options.hand-attack-description')
          .substring(0, 100),
      });

    embed.addField(
      this.ctx.locale('roleplay:battle.options.hand-attack'),
      this.ctx.locale('roleplay:battle.options.info', {
        damage: getUserDamage(this.user),
        cost: 0,
      }),
      true,
    );

    this.user.abilities.forEach((ability) => {
      embed.addField(
        this.ctx.locale(`abilities:${ability.id as 100}.name`),
        this.ctx.locale('roleplay:battle.options.info', {
          damage: '`??`',
          cost: getAbilityCost(ability),
          'no-mana':
            this.user.mana < getAbilityCost(ability)
              ? this.ctx.locale('roleplay:battle.no-mana')
              : '',
        }),
        true,
      );

      if (this.user.mana >= getAbilityCost(ability)) {
        options.addOptions({
          label: this.ctx.locale(`abilities:${ability.id as 100}.name`),
          value: `ABILITY | ${ability.id}`,
        });
      }
    });

    this.ctx.makeMessage({ embeds: [embed], components: [actionRow([options])] });

    const selectedOptions =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        this.ctx.channel,
        this.ctx.author.id,
        this.ctx.interaction.id,
        this.TIME_TO_SELECT,
      );

    if (!selectedOptions) {
      this.missedAttacks += 1;
      this.lastText = this.ctx.locale('roleplay:battle.no-action');
      return false;
    }

    switch (resolveSeparatedStrings(selectedOptions.values[0])[0]) {
      case 'HANDATTACK': {
        const damageDealt = calculateEffectiveDamage(
          getUserDamage(this.user),
          calculateUserPenetration(this.user),
          this.enemy.armor,
        );
        const didConnect = didUserHit(
          calculateAttackSuccess(getUserAgility(this.user), this.enemy.agility),
        );

        if (didConnect) this.enemy.life -= damageDealt;

        if (isDead(this.enemy)) {
          this.lastText = this.ctx.locale('roleplay:battle.enemy-death');
          return true;
        }
        this.lastText = this.ctx.locale('roleplay:battle.attack-text', {
          attack: this.ctx.locale(`roleplay:battle.options.hand-attack`),
          damage: didConnect ? damageDealt : this.ctx.locale('roleplay:battle.miss-attack'),
        });
        return false;
      }
      case 'ABILITY': {
        const abilityId = Number(resolveSeparatedStrings(selectedOptions.values[0])[1]);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const usedAbility = this.user.abilities.find((a) => a.id === abilityId)!;
        const parsedAbility = getAbilityById(usedAbility.id);

        const didConnect = calculateAttackSuccess(getUserAgility(this.user), this.enemy.agility);
        let damageDealt = 0;

        parsedAbility.data.effects.forEach((a) => {
          if (a.effectType === 'damage') {
            const abilityDamage =
              a.effectValue +
              getUserIntelligence(this.user) * (a.effectValueByIntelligence / 100) +
              a.effectValuePerLevel * usedAbility.level;

            damageDealt = abilityDamage;

            if (didConnect)
              this.enemy.life -= calculateEffectiveDamage(abilityDamage, 0, this.enemy.armor);
          } else if (a.effectType === 'heal' && a.durationInTurns === -1) {
            this.user.life = Math.min(
              getUserMaxLife(this.user),
              calculateHeal(this.user, { ...a, level: usedAbility.level }),
            );
          } else if (a.target === 'self')
            this.user.effects.push({ ...a, level: usedAbility.level });
          else if (a.target === 'enemy')
            this.enemy.effects.push({ ...a, level: usedAbility.level });
        });

        this.user.mana -= getAbilityCost(usedAbility);

        if (isDead(this.enemy)) {
          this.lastText = this.ctx.locale('roleplay:battle.enemy-death');
          return true;
        }
        this.lastText = this.ctx.locale('roleplay:battle.attack-text', {
          attack: this.ctx.locale(
            `abilities:${resolveSeparatedStrings(selectedOptions.values[0])[1] as '100'}.name`,
          ),
          damage: didConnect ? damageDealt : this.ctx.locale('roleplay:battle.miss-attack'),
        });
        return false;
      }
    }
    this.lastText = this.ctx.locale('roleplay:battle.no-action');
    return false;
  }
}