/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ENEMY_ATTACK_MULTIPLIER_CHANCE, PVE_USER_RESPONSE_TIME_LIMIT } from '@roleplay/Constants';
import { ReadyToBattleEnemy, UserBattleEntity } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis, EmojiTypes } from '@structures/Constants';
import { calculateProbability } from '@utils/HuntUtils';
import Util, { actionRow, capitalize, makeCustomId, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import {
  calculateAttackSuccess,
  calculateDodge,
  calculateEffectiveDamage,
  calculateHeal,
  calculatePoison,
  calculateRunawaySuccess,
  calculateUserPenetration,
  didUserDodged,
  didUserHit,
  getAbilityCost,
  getEnemyStatusWithEffects,
  getUserAgility,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
} from '@roleplay/utils/Calculations';
import { getAbilityById, getClassById } from '@roleplay/utils/DataUtils';
import { getAbilityDamageFromEffects, isDead } from '@roleplay/utils/AdventureUtils';

export interface BattleDiscordUser {
  id: string;
  username: string;
  imageUrl: string;
}

export default class PlayerVsEntity {
  public unresponsiveAttacks: number[];

  public didRunaway = false;

  private userIndex = 0;

  private enemyIndex = 0;

  constructor(
    public users: UserBattleEntity[],
    public enemies: ReadyToBattleEnemy[],
    public discordUsers: BattleDiscordUser[],
    private ctx: InteractionCommandContext,
    public lastText: string,
  ) {
    this.unresponsiveAttacks = Array(users.length).fill(0);
  }

  private didBattleEnd(): boolean {
    return this.users.every((a) => isDead(a)) || this.enemies.every((a) => isDead(a));
  }

  // TODO: FOr some reason, effects are being distributed and consumed for everyone every turn
  public async battleLoop(): Promise<PlayerVsEntity> {
    const willEnemyStart =
      this.enemies[this.enemyIndex].agility > getUserAgility(this.users[this.userIndex]);

    const gameOver = willEnemyStart ? this.enemyAttack() : await this.userAttack();
    if (gameOver) return this;

    const enemyStop = willEnemyStart ? await this.userAttack() : this.enemyAttack();
    if (enemyStop) return this;

    const endGame = this.changeTurn();
    if (endGame) return this;

    return this.battleLoop();
  }

  private changeTurn(): boolean {
    const attacker = this.users[this.userIndex];
    const defender = this.enemies[this.enemyIndex];

    attacker.effects.forEach((a, i) => {
      if (isDead(this.users[a.author.indexInBattle])) {
        attacker.effects.splice(i, 1);
        return;
      }

      switch (a.effectType) {
        case 'heal':
          attacker.life = Math.min(
            getUserMaxLife(attacker),
            attacker.life + calculateHeal(attacker, a),
          );
          break;
      }

      a.durationInTurns -= 1;
      if (a.durationInTurns <= 0) attacker.effects.splice(i, 1);
    });

    defender.effects.forEach((a, i) => {
      if (isDead(this.users[a.author.indexInBattle])) {
        defender.effects.splice(i, 1);
        return;
      }

      switch (a.effectType) {
        case 'poison':
          defender.life -= calculatePoison(a, defender.life);
          break;
      }
      a.durationInTurns -= 1;
      if (a.durationInTurns <= 0) defender.effects.splice(i, 1);
    });

    attacker.life = Math.max(attacker.life, 0);
    defender.life = Math.max(defender.life, 0);

    if (this.didBattleEnd()) return true;

    do {
      this.userIndex = (this.userIndex + 1) % this.users.length;
    } while (isDead(this.users[this.userIndex]));

    do {
      this.enemyIndex = (this.enemyIndex + 1) % this.enemies.length;
    } while (isDead(this.enemies[this.enemyIndex]));

    return false;
  }

  private enemyAttack(): boolean {
    const enemyToAttack = this.enemies[this.enemyIndex];
    const userToDefend = this.users[this.userIndex];

    const multiplier = calculateProbability(ENEMY_ATTACK_MULTIPLIER_CHANCE);

    const effectiveDamage = calculateEffectiveDamage(
      getEnemyStatusWithEffects(enemyToAttack, 'damage') * multiplier,
      calculateUserPenetration(userToDefend),
      getUserArmor(userToDefend),
    );

    const didDodged = didUserDodged(
      calculateDodge(
        getUserAgility(userToDefend),
        getEnemyStatusWithEffects(enemyToAttack, 'agility'),
      ),
    );

    if (!didDodged) userToDefend.life -= effectiveDamage;

    if (isDead(userToDefend)) {
      this.lastText = `${this.lastText}\n${this.ctx.locale('roleplay:battle.user-death', {
        user: this.discordUsers[this.userIndex].username,
      })}`;

      return this.didBattleEnd();
    }

    this.lastText = `${this.lastText}\n${this.ctx.locale('roleplay:battle.deffend-text', {
      enemy: this.ctx.locale(`enemies:${enemyToAttack.id as 1}.name`),
      user: this.discordUsers[this.userIndex].username,
      text: didDodged
        ? this.ctx.locale('roleplay:battle.dodged', {
            user: this.discordUsers[this.userIndex].username,
          })
        : this.ctx.locale('roleplay:battle.hit-success', { damage: effectiveDamage }),
      attack: this.ctx.locale(`roleplay:attacks.${multiplier.toString().replace('.', '-') as '1'}`),
    })}`;

    return false;
  }

  private static getEffectsDisplayText(
    effects: UserBattleEntity['effects'],
    wanned: 'buff' | 'debuff',
  ): string {
    const toUseEffects = effects.reduce<UserBattleEntity['effects']>((p, c) => {
      if (
        c.effectType.endsWith(`_${wanned}`) ||
        c.effectType === (wanned === 'buff' ? 'heal' : 'poison')
      ) {
        const found = p.find((a) => a.effectType === c.effectType);

        if (found) {
          found.durationInTurns = Math.max(c.durationInTurns, found.durationInTurns);
        } else p.push(c);
      }
      return p;
    }, []);

    if (toUseEffects.length === 0) return '';

    return `${emojis[wanned]} | ${capitalize(wanned)}s: ${toUseEffects
      .map((a) => `**${a.durationInTurns}**${emojis[a.effectType.split('_')[0] as EmojiTypes]}`)
      .join('  ')}\n`;
  }

  /*
    TODO: I'm not finished with this yet.

    - [ ] User may choose who wants to attack (after coosing which attack, check if is buff for alied or enemy, and 
      then show the available alternative (if tehre is only one, dont ask))
    - [ ] Maybe some multi target attacks
    - [ ] Support abilities, with multi users to effect
    - [ ] Abilities cooldown
    - [x] Different embeds to show the battle, once to show all users and enemies, one to choose attacks
    - [ ] Heal abilities cannot be used in dead allies, but maybe a resurrect ability (settar didParticipate)

    IN A NEAR FUTURE: 
    TODO:
    Mudar o interaction do CTX para uma interaction de algum botão...
    Caso alguma batalha dure mais de 15 minutos e/ou a mensagem foi apagada, dar um jeito de conseguir a mensagem de volta
    Talvez executando /dungeon e ver que ta em uma batalha, finaliza a antiga e começa uma nova no estado atual
    ou então salva as interactions passadas, e caso o /dungeon seja usado por alguem da batalha, cria uma nova mensagem
    com novo contexto baseado na ultima interaction usada
  */

  private async userAttack(): Promise<boolean> {
    const toAttackUser = this.users[this.userIndex];
    const toDefendEnemy = this.enemies[this.enemyIndex];

    if (this.unresponsiveAttacks[this.userIndex] >= 4) {
      toAttackUser.life = 0;
      this.lastText = this.ctx.locale('roleplay:battle.non-resposive-user', {
        user: this.discordUsers[this.userIndex].username,
      });

      return true;
    }

    const userDamage = getUserDamage(toAttackUser);
    const userArmor = getUserArmor(toAttackUser);
    const userAgility = getUserAgility(toAttackUser);
    const userIntelligence = getUserIntelligence(toAttackUser);
    const userAttackSuccess = calculateAttackSuccess(userAgility, toDefendEnemy.agility);
    const userDodge = calculateDodge(userAgility, toDefendEnemy.agility);
    const userPenetration = calculateUserPenetration(toAttackUser);

    const enemyDamage = getEnemyStatusWithEffects(toDefendEnemy, 'damage');
    const enemyArmor = getEnemyStatusWithEffects(toDefendEnemy, 'armor');
    const enemyAgility = getEnemyStatusWithEffects(toDefendEnemy, 'agility');

    const userRunaway = calculateRunawaySuccess(userAgility, enemyAgility);

    const statusEmbed = new MessageEmbed()
      .setColor(COLORS.Pear)
      .setThumbnail(this.discordUsers[this.userIndex].imageUrl)
      .addField(this.ctx.locale('roleplay:battle.users-statuses'), '\u200b', false);

    this.users.forEach((user, i) => {
      const isAttacking = i === this.userIndex;
      statusEmbed.addField(
        this.ctx.locale('roleplay:battle.your-stats', {
          name: this.discordUsers[i].username,
          emoji: isAttacking ? emojis.sword : isDead(user) ? emojis.cross : '',
        }),
        `${this.ctx.locale('roleplay:battle.your-stats-info', {
          life: user.life,
          mana: user.mana,
          damage: isAttacking ? userDamage : getUserDamage(user),
          armor: isAttacking ? userArmor : getUserArmor(user),
          intelligence: isAttacking ? userIntelligence : getUserIntelligence(user),
          agility: isAttacking ? userAgility : getUserAgility(user),
          chanceToConnect: isAttacking ? (100 - userAttackSuccess).toFixed(2) : '---',
          chanceToDodge: isAttacking ? userDodge.toFixed(2) : '---',
        })}\n${PlayerVsEntity.getEffectsDisplayText(
          user.effects,
          'buff',
        )}${PlayerVsEntity.getEffectsDisplayText(user.effects, 'debuff')}`,
        true,
      );
    });

    statusEmbed.addField(this.ctx.locale('roleplay:battle.enemies-statuses'), '\u200b', false);

    this.enemies.forEach((enemy, i) => {
      const isDefending = i === this.enemyIndex;
      statusEmbed.addField(
        this.ctx.locale('roleplay:battle.enemy-stats', {
          name: this.ctx.locale(`enemies:${enemy.id as 1}.name`),
          emoji: isDefending ? emojis.armor : isDead(enemy) ? emojis.cross : '',
        }),
        `${this.ctx.locale('roleplay:battle.enemy-stats-info', {
          life: enemy.life,
          damage: isDefending ? enemyDamage : getEnemyStatusWithEffects(enemy, 'damage'),
          armor: isDefending ? enemyArmor : getEnemyStatusWithEffects(enemy, 'armor'),
          agility: isDefending ? enemyAgility : getEnemyStatusWithEffects(enemy, 'agility'),
        })}\n${PlayerVsEntity.getEffectsDisplayText(
          enemy.effects,
          'buff',
        )}${PlayerVsEntity.getEffectsDisplayText(enemy.effects, 'debuff')}`,
        true,
      );
    });

    const attackEmbed = new MessageEmbed()
      .setTitle(
        this.ctx.prettyResponse('sword', 'roleplay:battle.title', {
          name: this.ctx.locale(`enemies:${toDefendEnemy.id as 1}.name`),
          count: this.enemies.length,
        }),
      )
      .setColor(COLORS.Battle)
      .setFooter({
        text: this.ctx.locale('roleplay:battle.footer', {
          user: this.userIndex + 1,
          aliveUser: this.users.filter((a) => !isDead(a)).length,
          enemy: this.enemyIndex + 1,
          aliveEnemy: this.enemies.filter((a) => !isDead(a)).length,
        }),
      })
      .setDescription(this.lastText)
      .addField(this.ctx.locale('roleplay:battle.options.available'), '\u200b', false);

    const [selectCustomId, battleId] = makeCustomId('SELECT');

    const options = new MessageSelectMenu()
      .setCustomId(selectCustomId)
      .setPlaceholder(
        this.ctx.locale('roleplay:battle.select', {
          user: this.discordUsers[this.userIndex].username,
        }),
      )
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

    attackEmbed.addFields([
      {
        name: this.ctx.locale('roleplay:battle.options.hand-attack'),
        value: this.ctx.locale('roleplay:battle.options.attack-info', {
          damage: userDamage,
          chanceToConnect: (100 - userAttackSuccess).toFixed(2),
        }),
        inline: true,
      },
      {
        name: this.ctx.locale('roleplay:battle.options.runaway'),
        value: this.ctx.locale('roleplay:battle.options.runaway-info', {
          chance: (100 - userRunaway).toFixed(2),
        }),
        inline: true,
      },
    ]);

    toAttackUser.abilities.forEach((ability) => {
      const abilityName = this.ctx.locale(`abilities:${ability.id as 100}.name`);
      const abilityCost = getAbilityCost(ability);
      const canUseAbility = toAttackUser.mana >= abilityCost;

      attackEmbed.addField(
        abilityName,
        this.ctx.locale('roleplay:battle.options.ability-info', {
          damage: getAbilityDamageFromEffects(
            getAbilityById(ability.id).data.effects,
            userIntelligence,
            ability.level,
          ),
          cost: abilityCost,
          'no-mana': !canUseAbility ? this.ctx.locale('roleplay:battle.no-mana') : '',
        }),
        true,
      );

      if (canUseAbility)
        options.addOptions({
          label: abilityName,
          description: this.ctx
            .locale(`abilities:${ability.id as 100}.description`)
            .substring(0, 100),
          value: `ABILITY | ${ability.id}`,
        });
    });

    this.ctx.makeMessage({
      embeds: [statusEmbed, attackEmbed],
      components: [actionRow([options])],
      content: `<@${toAttackUser.id}>`,
    });

    const selectedOptions =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        this.ctx.channel,
        toAttackUser.id,
        battleId,
        PVE_USER_RESPONSE_TIME_LIMIT,
      );

    if (!selectedOptions) {
      this.unresponsiveAttacks[this.userIndex] += 1;
      this.lastText = this.ctx.locale('roleplay:battle.no-action', {
        user: this.discordUsers[this.userIndex].username,
      });

      return false;
    }

    switch (resolveSeparatedStrings(selectedOptions.values[0])[0]) {
      case 'HANDATTACK': {
        const damageDealt = calculateEffectiveDamage(userDamage, userPenetration, enemyArmor);
        const didConnect = didUserHit(userAttackSuccess);

        if (didConnect) toDefendEnemy.life -= damageDealt;

        if (isDead(toDefendEnemy)) {
          this.lastText = this.ctx.locale('roleplay:battle.enemy-death', {
            user: this.discordUsers[this.userIndex].username,
            name: this.ctx.locale(`enemies:${toDefendEnemy.id as 1}.name`),
          });

          return this.didBattleEnd();
        }

        this.lastText = this.ctx.locale('roleplay:battle.attack-text', {
          attack: this.ctx.locale(`roleplay:battle.options.hand-attack`),
          user: this.discordUsers[this.userIndex].username,
          enemy: this.ctx.locale(`enemies:${toDefendEnemy.id as 1}.name`),
          text: didConnect
            ? this.ctx.locale('roleplay:battle.hit-success', { damage: damageDealt })
            : this.ctx.locale('roleplay:battle.hit-fail'),
        });

        return false;
      }
      case 'RUNAWAY': {
        // TODO: SISTEMA DE MAIORIA ACEITAR RUNAWAY
        const didRunaway = didUserHit(userRunaway);

        if (didRunaway) {
          this.lastText = this.ctx.locale('roleplay:battle.runaway-success');
          this.didRunaway = true;
          return true;
        }

        this.lastText = this.ctx.locale('roleplay:battle.runaway-fail');
        return false;
      }
      case 'ABILITY': {
        const abilityId = Number(resolveSeparatedStrings(selectedOptions.values[0])[1]);

        const usedAbility = toAttackUser.abilities.find((a) => a.id === abilityId)!;
        const parsedAbility = getAbilityById(usedAbility.id);

        const didConnect = didUserHit(userAttackSuccess);
        let damageDealt = 0;

        parsedAbility.data.effects.forEach((a) => {
          if (a.effectType === 'damage') {
            const abilityDamage = Math.floor(
              a.effectValue +
                userIntelligence * (a.effectValueByIntelligence / 100) +
                a.effectValuePerLevel * usedAbility.level,
            );

            damageDealt = abilityDamage;

            if (didConnect)
              toDefendEnemy.life -= calculateEffectiveDamage(abilityDamage, 0, enemyArmor);
          }

          if (a.effectType === 'heal' && a.durationInTurns === -1) {
            toAttackUser.life = Math.min(
              getUserMaxLife(toAttackUser),
              toAttackUser.life +
                calculateHeal(toAttackUser, {
                  ...a,
                  level: usedAbility.level,
                  author: {
                    indexInBattle: this.userIndex,
                    totalIntelligence: userIntelligence,
                    elementSinergy: getClassById(toAttackUser.class).data.elementSinergy,
                  },
                }),
            );
          }

          if (a.target === 'self' && a.durationInTurns > 0)
            toAttackUser.effects.push({
              ...a,
              level: usedAbility.level,
              author: {
                indexInBattle: this.userIndex,
                totalIntelligence: userIntelligence,
                elementSinergy: getClassById(toAttackUser.class).data.elementSinergy,
              },
            });

          if (a.target === 'enemy' && a.durationInTurns > 0)
            toDefendEnemy.effects.push({
              ...a,
              level: usedAbility.level,
              author: {
                indexInBattle: this.userIndex,
                totalIntelligence: userIntelligence,
                elementSinergy: getClassById(toAttackUser.class).data.elementSinergy,
              },
            });
        });

        toAttackUser.mana -= getAbilityCost(usedAbility);

        if (isDead(toDefendEnemy)) {
          this.lastText = this.ctx.locale('roleplay:battle.enemy-death', {
            user: this.discordUsers[this.userIndex].username,
            name: this.ctx.locale(`enemies:${toDefendEnemy.id as 1}.name`),
          });

          return this.didBattleEnd();
        }

        this.lastText = this.ctx.locale('roleplay:battle.attack-text', {
          attack: this.ctx.locale(
            `abilities:${resolveSeparatedStrings(selectedOptions.values[0])[1] as '100'}.name`,
          ),
          user: this.discordUsers[this.userIndex].username,
          enemy: this.ctx.locale(`enemies:${toDefendEnemy.id as 1}.name`),
          text: didConnect
            ? this.ctx.locale('roleplay:battle.hit-success', { damage: damageDealt })
            : this.ctx.locale('roleplay:battle.hit-fail'),
        });

        return false;
      }
    }

    this.lastText = this.ctx.locale('roleplay:battle.no-action', {
      user: this.discordUsers[this.userIndex].username,
    });

    return false;
  }
}