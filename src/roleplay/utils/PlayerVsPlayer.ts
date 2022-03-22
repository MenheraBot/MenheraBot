import { PVP_USER_RESPONSE_TIME_LIMIT } from '@roleplay/Constants';
import { UserBattleEntity } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import Util, { actionRow, makeCustomId, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import { isDead } from './AdventureUtils';
import {
  calculateAttackSuccess,
  calculateDodge,
  calculateEffectiveDamage,
  calculateHeal,
  calculatePoison,
  calculateRunawaySuccess,
  calculateUserPenetration,
  didUserHit,
  getAbilityCost,
  getUserAgility,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
} from './Calculations';
import { getAbilityById } from './DataUtils';

// TODO: Make get status with debuff too

interface PvpUserInfoStructure {
  missedAttacks: number;
  didRunaway: boolean;
}

type UserTurn = 'attacker' | 'defender';

export default class PlayerVsPlayer {
  public attackerInfo: PvpUserInfoStructure = {
    didRunaway: false,
    missedAttacks: 0,
  };

  public defenderInfo: PvpUserInfoStructure = {
    didRunaway: false,
    missedAttacks: 0,
  };

  constructor(
    private ctx: InteractionCommandContext,
    public attacker: UserBattleEntity,
    public defender: UserBattleEntity,
    public lastText: string,
  ) {}

  static invertTurn(lastTurn: UserTurn): UserTurn {
    if (lastTurn === 'attacker') return 'defender';
    return 'attacker';
  }

  public async battleLoop(): Promise<PlayerVsPlayer> {
    const whoWillStart =
      getUserAgility(this.defender) > getUserAgility(this.attacker) ? 'defender' : 'attacker';

    const needStop = await this.userAttack(whoWillStart);

    if (!needStop) {
      const enemyStop = await this.userAttack(PlayerVsPlayer.invertTurn(whoWillStart));
      this.clearEffects();
      if (!enemyStop) return this.battleLoop();
    }

    return this;
  }

  private clearEffects(): void {
    this.attacker.effects.forEach((a, i) => {
      switch (a.effectType) {
        case 'heal':
          this.attacker.life += Math.min(
            getUserMaxLife(this.attacker),
            calculateHeal(this.attacker, a),
          );
          break;
        case 'poison':
          this.attacker.life -= calculatePoison(this.defender, a, this.attacker.life);
          break;
      }

      a.durationInTurns -= 1;
      if (a.durationInTurns <= 0) this.attacker.effects.splice(i, 1);
    });

    this.defender.effects.forEach((a, i) => {
      switch (a.effectType) {
        case 'heal':
          this.defender.life += Math.min(
            getUserMaxLife(this.defender),
            calculateHeal(this.defender, a),
          );
          break;
        case 'poison':
          this.defender.life -= calculatePoison(this.defender, a, this.defender.life);
          break;
      }
      a.durationInTurns -= 1;
      if (a.durationInTurns <= 0) this.defender.effects.splice(i, 1);
    });
  }

  private async userAttack(user: UserTurn): Promise<boolean> {
    if (this[`${user}Info`].missedAttacks >= 4) {
      this[user].life = 0;
      this.lastText = this.ctx.locale('roleplay:battle.user-death');
      return true;
    }

    const embed = new MessageEmbed()
      .setTitle(
        this.ctx.prettyResponse('sword', 'roleplay:battle.title', {
          name: `<@${this[PlayerVsPlayer.invertTurn(user)].id as '1'}>`,
        }),
      )
      .setColor(COLORS.Battle)
      .setFooter({
        text: this.ctx.locale('roleplay:battle.footer', {
          time: PVP_USER_RESPONSE_TIME_LIMIT / 1000,
        }),
      })
      .setDescription(this.lastText)
      .addFields([
        {
          name: this.ctx.locale('roleplay:battle.your-stats'),
          value: this.ctx.locale('roleplay:battle.your-stats-info', {
            life: this[user].life,
            mana: this[user].mana,
            damage: getUserDamage(this[user]),
            armor: getUserArmor(this[user]),
            intelligence: getUserIntelligence(this[user]),
            agility: getUserAgility(this[user]),
            chanceToConnect: (
              100 -
              calculateAttackSuccess(
                getUserAgility(this[user]),
                getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
              )
            ).toFixed(2),
            chanceToDodge: calculateDodge(
              getUserAgility(this[user]),
              getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
            ).toFixed(2),
          }),
          inline: true,
        },
        {
          name: this.ctx.locale('roleplay:battle.enemy-stats'),
          value: this.ctx.locale('roleplay:battle.enemy-stats-info', {
            life: this[user].life,
            damage: getUserDamage(this[PlayerVsPlayer.invertTurn(user)]),
            armor: getUserArmor(this[PlayerVsPlayer.invertTurn(user)]),
            agility: getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
          }),
          inline: true,
        },
        {
          name: this.ctx.locale('roleplay:battle.options.available'),
          value: '\u200b',
          inline: false,
        },
      ]);

    const [selectCustomId, battleId] = makeCustomId('SELECT');

    const options = new MessageSelectMenu()
      .setCustomId(selectCustomId)
      .setPlaceholder(this.ctx.locale('roleplay:battle.select'))
      .addOptions(
        {
          label: this.ctx.locale('roleplay:battle.options.hand-attack'),
          value: 'HANDATTACK',
          description: this.ctx
            .locale('roleplay:battle.options.hand-attack-description')
            .substring(0, 100),
        },
        {
          label: this.ctx.locale('roleplay:battle.options.runaway'),
          value: 'RUNAWAY',
          description: this.ctx.locale('roleplay:battle.options.runaway-description'),
        },
      );

    embed.addFields([
      {
        name: this.ctx.locale('roleplay:battle.options.hand-attack'),
        value: this.ctx.locale('roleplay:battle.options.attack-info', {
          damage: getUserDamage(this[user]),
          chanceToConnect: (
            100 -
            calculateAttackSuccess(
              getUserAgility(this[user]),
              getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
            )
          ).toFixed(2),
        }),
        inline: true,
      },
      {
        name: this.ctx.locale('roleplay:battle.options.runaway'),
        value: this.ctx.locale('roleplay:battle.options.runaway-info', {
          chance: (
            100 -
            calculateRunawaySuccess(
              getUserAgility(this[user]),
              getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
            )
          ).toFixed(2),
        }),
        inline: true,
      },
    ]);

    this[user].abilities.forEach((ability) => {
      embed.addField(
        this.ctx.locale(`abilities:${ability.id as 100}.name`),
        this.ctx.locale('roleplay:battle.options.ability-info', {
          damage: '`??`',
          cost: getAbilityCost(ability),
          'no-mana':
            this[user].mana < getAbilityCost(ability)
              ? this.ctx.locale('roleplay:battle.no-mana')
              : '',
        }),
        true,
      );

      if (this[user].mana >= getAbilityCost(ability)) {
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
        battleId,
        PVP_USER_RESPONSE_TIME_LIMIT,
      );

    if (!selectedOptions) {
      this[`${user}Info`].missedAttacks += 1;
      this.lastText = this.ctx.locale('roleplay:battle.no-action');
      return false;
    }

    switch (resolveSeparatedStrings(selectedOptions.values[0])[0]) {
      case 'HANDATTACK': {
        const damageDealt = calculateEffectiveDamage(
          getUserDamage(this[user]),
          calculateUserPenetration(this[user]),
          getUserArmor(this[PlayerVsPlayer.invertTurn(user)]),
        );
        const didConnect = didUserHit(
          calculateAttackSuccess(
            getUserAgility(this[user]),
            getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
          ),
        );

        if (didConnect) this[PlayerVsPlayer.invertTurn(user)].life -= damageDealt;

        if (isDead(this[PlayerVsPlayer.invertTurn(user)])) {
          this.lastText = this.ctx.locale('roleplay:battle.enemy-death');
          return true;
        }
        this.lastText = this.ctx.locale('roleplay:battle.attack-text', {
          attack: this.ctx.locale(`roleplay:battle.options.hand-attack`),
          damage: didConnect ? damageDealt : this.ctx.locale('roleplay:battle.miss-attack'),
        });
        return false;
      }
      case 'RUNAWAY': {
        const didRunaway = didUserHit(
          calculateRunawaySuccess(
            getUserAgility(this[user]),
            getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
          ),
        );

        if (didRunaway) {
          this.lastText = this.ctx.locale('roleplay:battle.runaway-success');
          this[`${user}Info`].didRunaway = true;
          return true;
        }

        this.lastText = this.ctx.locale('roleplay:battle.runaway-fail');
        return false;
      }
      case 'ABILITY': {
        const abilityId = Number(resolveSeparatedStrings(selectedOptions.values[0])[1]);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const usedAbility = this[user].abilities.find((a) => a.id === abilityId)!;
        const parsedAbility = getAbilityById(usedAbility.id);

        const didConnect = calculateAttackSuccess(
          getUserAgility(this[user]),
          getUserAgility(this[PlayerVsPlayer.invertTurn(user)]),
        );
        let damageDealt = 0;

        parsedAbility.data.effects.forEach((a) => {
          if (a.effectType === 'damage') {
            const abilityDamage = Math.floor(
              a.effectValue +
                getUserIntelligence(this[user]) * (a.effectValueByIntelligence / 100) +
                a.effectValuePerLevel * usedAbility.level,
            );

            damageDealt = abilityDamage;

            if (didConnect)
              this[PlayerVsPlayer.invertTurn(user)].life -= calculateEffectiveDamage(
                abilityDamage,
                0,
                getUserArmor(this[PlayerVsPlayer.invertTurn(user)]),
              );
          } else if (a.effectType === 'heal' && a.durationInTurns === -1) {
            this[user].life += Math.min(
              getUserMaxLife(this[user]),
              calculateHeal(this[user], { ...a, level: usedAbility.level }),
            );
          } else if (a.target === 'self')
            this[user].effects.push({ ...a, level: usedAbility.level });
          else if (a.target === 'enemy')
            this[PlayerVsPlayer.invertTurn(user)].effects.push({ ...a, level: usedAbility.level });
        });

        this[user].mana -= getAbilityCost(usedAbility);

        if (isDead(this[PlayerVsPlayer.invertTurn(user)])) {
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
