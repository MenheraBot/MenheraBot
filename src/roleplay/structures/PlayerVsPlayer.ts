import { PVP_USER_RESPONSE_TIME_LIMIT } from '@roleplay/Constants';
import { BattleUserTurn, UserBattleEntity } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import Util, { actionRow, makeCustomId, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction, User } from 'discord.js-light';
import { invertBattleTurn, isDead } from '../utils/AdventureUtils';
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
} from '../utils/Calculations';
import { getAbilityById, getClassById } from '../utils/DataUtils';

// TODO: Make new localizations for PvP

interface PvpUserInfoStructure {
  missedAttacks: number;
  didRunaway: boolean;
}

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
    public attackerDiscordUser: User,
    public defenderDiscordUser: User,
    public lastText: string,
  ) {}

  public async battleLoop(): Promise<PlayerVsPlayer> {
    const whoWillStart =
      getUserAgility(this.defender) > getUserAgility(this.attacker) ? 'defender' : 'attacker';

    const needStop = await this.userAttack(whoWillStart);

    if (!needStop) {
      const enemyStop = await this.userAttack(invertBattleTurn(whoWillStart));
      this.clearEffects();
      if (!enemyStop) return this.battleLoop();
    }

    return this;
  }

  private clearEffects(): void {
    (['attacker', 'defender'] as const).forEach((toEffect) => {
      this[toEffect].effects.forEach((a, i) => {
        switch (a.effectType) {
          case 'heal':
            this[toEffect].life = Math.min(
              getUserMaxLife(this[toEffect]),
              this[toEffect].life + calculateHeal(this[toEffect], a),
            );
            break;
          case 'poison':
            this[toEffect].life -= calculatePoison(a, this[toEffect].life);
            break;
        }

        a.durationInTurns -= 1;
        if (a.durationInTurns <= 0) this.attacker.effects.splice(i, 1);
      });
    });
  }

  private async userAttack(user: BattleUserTurn): Promise<boolean> {
    if (this[`${user}Info`].missedAttacks >= 4) {
      this[user].life = 0;
      this.lastText = this.ctx.locale('roleplay:battle.user-death');
      return true;
    }

    const toAttack = this[user];
    const toDefend = this[invertBattleTurn(user)];
    const toAttackUser = this[`${user}DiscordUser`];
    // const toDefendUser = this[`${invertBattleTurn(user)}DiscordUser`];

    const attackerDamage = getUserDamage(toAttack);
    const attackerArmor = getUserArmor(toAttack);
    const attackerAgility = getUserAgility(toAttack);
    const attackerIntelligence = getUserIntelligence(toAttack);
    const attackerPenetration = calculateUserPenetration(toAttack);

    const defenderDamage = getUserDamage(toDefend);
    const defenderArmor = getUserArmor(toDefend);
    const defenderAgility = getUserAgility(toDefend);

    const attackerDodge = calculateDodge(attackerAgility, defenderAgility);
    const attackerAttackSuccess = calculateAttackSuccess(attackerAgility, defenderAgility);
    const attackerRunaway = calculateRunawaySuccess(attackerAgility, defenderAgility);

    const embed = new MessageEmbed()
      .setTitle(
        this.ctx.prettyResponse('sword', 'roleplay:battle.title', {
          name: toAttackUser.username,
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
            life: toAttack.life,
            mana: toAttack.mana,
            damage: attackerDamage,
            armor: attackerArmor,
            intelligence: attackerIntelligence,
            agility: attackerAgility,
            chanceToConnect: (100 - attackerAttackSuccess).toFixed(2),
            chanceToDodge: attackerDodge.toFixed(2),
          }),
          inline: true,
        },
        {
          name: this.ctx.locale('roleplay:battle.enemy-stats'),
          value: this.ctx.locale('roleplay:battle.enemy-stats-info', {
            life: toDefend.life,
            damage: defenderDamage,
            armor: defenderArmor,
            agility: defenderAgility,
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
          damage: attackerDamage,
          chanceToConnect: (100 - attackerAttackSuccess).toFixed(2),
        }),
        inline: true,
      },
      {
        name: this.ctx.locale('roleplay:battle.options.runaway'),
        value: this.ctx.locale('roleplay:battle.options.runaway-info', {
          chance: (100 - attackerRunaway).toFixed(2),
        }),
        inline: true,
      },
    ]);

    toAttack.abilities.forEach((ability) => {
      embed.addField(
        this.ctx.locale(`abilities:${ability.id as 100}.name`),
        this.ctx.locale('roleplay:battle.options.ability-info', {
          damage: '`??`',
          cost: getAbilityCost(ability),
          'no-mana':
            toAttack.mana < getAbilityCost(ability)
              ? this.ctx.locale('roleplay:battle.no-mana')
              : '',
        }),
        true,
      );

      if (toAttack.mana >= getAbilityCost(ability)) {
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
        toAttackUser.id,
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
          attackerDamage,
          attackerPenetration,
          defenderArmor,
        );
        const didConnect = didUserHit(attackerAttackSuccess);

        if (didConnect) toDefend.life -= damageDealt;

        if (isDead(toDefend)) {
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
        const didRunaway = didUserHit(attackerRunaway);

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

        const didConnect = didUserHit(attackerAttackSuccess);
        let damageDealt = 0;

        parsedAbility.data.effects.forEach((a) => {
          if (a.effectType === 'damage') {
            const abilityDamage = Math.floor(
              a.effectValue +
                attackerIntelligence * (a.effectValueByIntelligence / 100) +
                a.effectValuePerLevel * usedAbility.level,
            );

            damageDealt = abilityDamage;

            if (didConnect)
              toDefend.life -= calculateEffectiveDamage(abilityDamage, 0, defenderArmor);
          } else if (a.effectType === 'heal' && a.durationInTurns === -1) {
            toAttack.life = Math.min(
              getUserMaxLife(toAttack),
              calculateHeal(toAttack, {
                ...a,
                level: usedAbility.level,
                author: {
                  totalIntelligence: attackerIntelligence,
                  elementSinergy: getClassById(toAttack.class).data.elementSinergy,
                },
              }),
            );
          } else if (a.target === 'self')
            toAttack.effects.push({
              ...a,
              level: usedAbility.level,
              author: {
                totalIntelligence: attackerIntelligence,
                elementSinergy: getClassById(toAttack.class).data.elementSinergy,
              },
            });
          else if (a.target === 'enemy')
            toDefend.effects.push({
              ...a,
              level: usedAbility.level,
              author: {
                totalIntelligence: attackerIntelligence,
                elementSinergy: getClassById(toAttack.class).data.elementSinergy,
              },
            });
        });

        toAttack.mana -= getAbilityCost(usedAbility);

        if (isDead(toDefend)) {
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
