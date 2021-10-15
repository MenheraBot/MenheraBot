/* eslint-disable no-nested-ternary */
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import {
  Message,
  MessageOptions,
  MessagePayload,
  EmbedFieldData,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
  MessageButton,
  MessageComponentInteraction,
  MessageActionRow,
} from 'discord.js-light';
import EventEmitter from 'events';
import BattleFunctions from './Functions/BattleFunctions';
import {
  IAbilityResolved,
  IBattleMob,
  IBattleUser,
  IEffectData,
  IResolvedAbilityEffect,
  IResolvedBattleInventory,
  TBattleEntity,
  TBattleTurn,
  TEffectTarget,
} from './Types';
import {
  calculateValue,
  createBaseBattleEmbed,
  isDead,
  resolveEffects,
  resolveItemUsage,
} from './Utils';

export default class BolehamBattle extends EventEmitter {
  private attackerIndex = 0;

  private defenderIndex = 0;

  private battleMessage?: Message;

  private turn: 'defender' | 'attacker' = 'attacker';

  private attackerStartStatus: IBattleUser[] = [];

  private defenderStartStatus: IBattleUser[] | null = [];

  constructor(
    private ctx: InteractionCommandContext,
    private attacking: IBattleUser[],
    private defending: TBattleEntity[],
  ) {
    super();
    this.saveCurrentUserStats();
    this.userTurn();
  }

  private saveCurrentUserStats(): void {
    this.attacking.forEach((a) => {
      this.attackerStartStatus.push(a);
    });

    this.defending.forEach((a) => {
      if (a.isUser) {
        if (!this.defenderStartStatus) this.defenderStartStatus = [];
        this.defenderStartStatus.push(a);
      } else this.defenderStartStatus = null;
    });
  }

  private onError(reason: string): void {
    this.emit('exception', reason);
  }

  private onEndBattle(winner: TBattleEntity[]): void {
    this.emit('endBattle', winner);
  }

  private async sendMessageToChannel(
    options: string | MessagePayload | MessageOptions,
  ): Promise<void> {
    const sentMessage = await this.ctx.interaction.followUp(options).catch((e) => this.onError(e));

    if (!sentMessage) return this.onError('SEND_MESSAGE');

    if (!(sentMessage instanceof Message)) {
      // @ts-expect-error Message is private
      this.battleMessage = new Message(this.ctx.client, sentMessage);
    } else this.battleMessage = sentMessage;
  }

  private async makeMessage(options: string | MessagePayload | MessageOptions): Promise<void> {
    if (!this.battleMessage || this.battleMessage.deleted)
      return this.sendMessageToChannel(options);
    this.battleMessage.edit(options).catch(() => this.sendMessageToChannel(options));
  }

  private createMessageComponents(user: IBattleUser): MessageActionRow[] {
    const toSendComponents: MessageActionRow[] = [];

    if (user.abilities.some((a) => a.inCooldown < 1 && a.cost <= user.mana)) {
      toSendComponents.push(
        new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId(`${this.ctx.interaction.id} | ABILITY`)
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder(this.ctx.locale('roleplay:battle.select-ability'))
            .addOptions(
              user.abilities.reduce((p: MessageSelectOptionData[], c) => {
                if (c.cost > user.mana || c.inCooldown > 0) return p;

                p.push({
                  label: this.ctx.locale(`roleplay:abilities.${c.id}.name`),
                  value: `${c.id}`,
                  description: this.ctx.locale(`roleplay:abilities.${c.id}.description`),
                });
                return p;
              }, []),
            ),
        ),
      );
    }

    const basicButton = new MessageButton()
      .setCustomId(`${this.ctx.interaction.id} | BASIC`)
      .setEmoji(emojis.sword)
      .setLabel(this.ctx.locale('roleplay:battle.basic-attack'))
      .setStyle('PRIMARY');

    toSendComponents.push(new MessageActionRow().addComponents(basicButton));

    if (user.inventory.length > 0) {
      const inventoryItens = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId(`${this.ctx.interaction.id} | INVENTORY`)
          .setPlaceholder(this.ctx.locale('roleplay:battle.inventory-itens'))
          .setDisabled(true)
          .setMinValues(1)
          .setMaxValues(1),
      );

      if (user.inventory.some((a) => a.amount > 0)) {
        for (let i = 0; i < user.inventory.length; i++) {
          if (i === 25) break;
          if (user.inventory[i].amount > 0) {
            (inventoryItens.components[0] as MessageSelectMenu)
              .addOptions({
                label: this.ctx.locale(`items:${user.inventory[i].id}.name`),
                value: `${user.inventory[i].id} ${user.inventory[i].level}`,
                description: this.ctx.locale(`items:${user.inventory[i].id}.description`),
              })
              .setDisabled(false);
          }
        }
        toSendComponents.push(inventoryItens);
      }
    }

    return toSendComponents;
  }

  private finishTurn(): void {
    this.defending.forEach((entity, index) => {
      entity.effects.forEach((effect) => {
        effect.turns -= 1;

        switch (effect.type) {
          case 'armor_buff':
            if (!effect.wasExecuted)
              entity.armor = calculateValue(entity.armor, effect.isValuePercentage, effect.value);
            else if (effect.cumulative)
              entity.armor = calculateValue(entity.armor, effect.isValuePercentage, effect.value);
            break;
          case 'blind':
            if (effect.cumulative)
              effect.value = calculateValue(effect.value, effect.isValuePercentage, effect.value);
            break;
          case 'confusion':
            if (effect.cumulative)
              effect.value = calculateValue(effect.value, effect.isValuePercentage, effect.value);
            break;
          case 'damage_buff':
            if (!effect.wasExecuted)
              entity.damage = calculateValue(entity.damage, effect.isValuePercentage, effect.value);
            else if (effect.cumulative)
              entity.damage = calculateValue(entity.damage, effect.isValuePercentage, effect.value);
            break;
          case 'degradation':
            if (effect.cumulative)
              effect.value = calculateValue(effect.value, effect.isValuePercentage, effect.value);
            break;
          case 'heal':
            if (!effect.wasExecuted)
              entity.life = calculateValue(entity.life, effect.isValuePercentage, effect.value);
            else if (effect.cumulative)
              entity.life = calculateValue(entity.life, effect.isValuePercentage, effect.value);
            break;
          case 'life_buff':
            if (!effect.wasExecuted)
              entity.life = calculateValue(entity.life, effect.isValuePercentage, effect.value);
            else if (effect.cumulative)
              entity.life = calculateValue(entity.life, effect.isValuePercentage, effect.value);
            break;
          case 'mana':
            if (!effect.wasExecuted && entity.isUser)
              entity.mana = calculateValue(entity.mana, effect.isValuePercentage, effect.value);
            else if (effect.cumulative && entity.isUser)
              entity.mana = calculateValue(entity.mana, effect.isValuePercentage, effect.value);
            break;
          case 'mana_buff':
            if (!effect.wasExecuted && entity.isUser)
              entity.mana = calculateValue(entity.mana, effect.isValuePercentage, effect.value);
            else if (effect.cumulative && entity.isUser)
              entity.mana = calculateValue(entity.mana, effect.isValuePercentage, effect.value);
            break;
          case 'poison':
            if (effect.cumulative)
              effect.value = calculateValue(effect.value, effect.isValuePercentage, effect.value);
            break;
          case 'vampirism':
            if (effect.cumulative)
              effect.value = calculateValue(effect.value, effect.isValuePercentage, effect.value);
            break;
        }

        effect.wasExecuted = true;
        if (effect.turns <= 0) entity.effects.splice(index, 1);
      });
    });
  }

  private changeTurn(): void {
    const newIndex = (currentIndex: number, array: TBattleEntity[]): number => {
      const nextIndex = (index: number) => (index + 1 === array.length ? 0 : index + 1);
      let returnedIndex = nextIndex(currentIndex);
      for (let i = 0; i <= array.length; i++) {
        if (!isDead(array[returnedIndex])) break;
        returnedIndex = nextIndex(returnedIndex);
      }
      return returnedIndex;
    };

    this.finishTurn();

    if (this.turn === 'attacker') {
      this.turn = 'defender';
      this.attackerIndex = newIndex(this.attackerIndex, this.attacking);
    } else {
      this.turn = 'attacker';
      this.attackerIndex = newIndex(this.defenderIndex, this.defending);
    }
  }

  private addStatusBuilds(inverse = false): EmbedFieldData[] {
    const actualEnemy = this.defending[this.defenderIndex];
    const defaultReturn = [
      {
        name: this.ctx.locale('common:your_status'),
        inline: true,
        value: `${emojis.blood} | ${this.ctx.locale('roleplay:stats.life')}: **${
          this.attacking[this.attackerIndex].life
        }**\n${emojis.mana} | ${this.ctx.locale('roleplay:stats.mana')}: **${
          this.attacking[this.attackerIndex].mana
        }**\n${emojis.roleplay_custom.tired} | ${this.ctx.locale('roleplay:stats.tiredness')}: **${
          this.attacking[this.attackerIndex].tiredness
        }**\n${emojis.sword} | ${this.ctx.locale('roleplay:stats.damage')}: **${
          this.attacking[this.attackerIndex].damage
        }**\n${emojis.shield} | ${this.ctx.locale('roleplay:stats.armor')}: **${
          this.attacking[this.attackerIndex].armor
        }**`,
      },
      {
        name: this.ctx.locale('common:entity_status'),
        inline: true,
        value: `${emojis.blood} | ${this.ctx.locale('roleplay:stats.life')}: **${
          actualEnemy.life
        }**\n${emojis.mana} | ${this.ctx.locale('roleplay:stats.mana')}: **${
          actualEnemy.isUser ? actualEnemy.mana : '???'
        }**\n${emojis.roleplay_custom.tired} | ${this.ctx.locale('roleplay:stats.tiredness')}: **${
          actualEnemy.isUser ? actualEnemy.tiredness : '???'
        }**\n${emojis.sword} | ${this.ctx.locale('roleplay:stats.damage')}: **${
          actualEnemy.damage
        }**\n${emojis.shield} | ${this.ctx.locale('roleplay:stats.armor')}: **${
          actualEnemy.armor
        }**`,
      },
    ];

    return inverse ? defaultReturn.reverse() : defaultReturn;
  }

  private async waitUserResponse(userId: string, timeout = 8000): Promise<TBattleTurn | null> {
    const filter = (int: MessageComponentInteraction) => {
      if (int.user.id === userId && int.customId.startsWith(this.ctx.interaction.id)) return true;
      int.deferUpdate();
      return false;
    };
    const collected = await this.ctx.channel
      .awaitMessageComponent({ filter, time: timeout })
      .catch(() => null);

    if (!collected) return null;
    return this.handleResponse(collected);
  }

  private async handleResponse(int: MessageComponentInteraction): Promise<TBattleTurn> {
    const findedUser =
      this.turn === 'attacker'
        ? this.attacking[this.attackerIndex]
        : (this.defending[this.defenderIndex] as IBattleUser);

    if (int.customId.endsWith('BASIC'))
      return {
        type: 'basic',
        damage: BattleFunctions.CalculateAttackDamage(
          findedUser.damage,
          findedUser.attackSkill,
          findedUser.tiredness,
          findedUser.effects,
        ),
      };

    if (int.customId.endsWith('ABILITY')) {
      const ability = findedUser.abilities.find(
        (a) => a.id === Number((int as SelectMenuInteraction).values[0]),
      ) as IAbilityResolved;

      ability.inCooldown = ability.turnsCooldown + 1;
      findedUser.mana -= ability.cost;

      return {
        type: 'ability',
        effects: resolveEffects(findedUser, ability),
      };
    }

    const [itemId, itemLevel] = int.customId.split(' ');
    const item = findedUser.inventory.find(
      (a) => a.id === Number(itemId) && a.level === Number(itemLevel),
    ) as IResolvedBattleInventory;

    item.amount -= 1;

    return resolveItemUsage(item);
  }

  private getEntitiesDisplay(): Array<string> {
    const defenderEntity = this.defending[this.defenderIndex];
    const defendingName =
      'name' in defenderEntity ? defenderEntity.name : `<@${defenderEntity.id}>`;
    const entities = [`<@${this.attacking[this.attackerIndex].id}>`, defendingName];

    if (this.turn === 'defender') entities.reverse();

    return entities;
  }

  private executeEffects(
    effects: IEffectData[] | IResolvedAbilityEffect[],
    author: TBattleEntity,
    defender: TBattleEntity,
  ): void {
    const willEffect = (targetType: TEffectTarget): TBattleEntity[] => {
      if (targetType === 'self') return [author];
      if (targetType === 'enemy') return [defender];

      return targetType === 'allies' ? this.getAllies() : this.getEnemies();
    };

    effects.forEach((eff) => {
      const whoWillEffect = willEffect(eff.target);
      whoWillEffect.forEach((entity) => {
        if ('isValuePercentage' in eff)
          return entity.effects.push({ ...(eff as IResolvedAbilityEffect), wasExecuted: false });

        switch (eff.type) {
          case 'armor_buff':
            entity.armor += eff.value;
            break;
          case 'attack':
            entity.life -= BattleFunctions.CalculateAttackEffectiveness(
              eff.value,
              this.getSelf(),
              this.getSelf(true),
            );
            break;
          case 'damage_buff':
            entity.damage += eff.value;
            break;
          case 'heal':
            entity.life += eff.value;
            break;
          case 'mana':
            if ('mana' in entity) entity.mana += eff.value;
            break;
        }
      });
    });
  }

  private makeAction(action: TBattleTurn | null): void | boolean {
    const user = this.getSelf();

    if (!action) return this.changeTurn();

    switch (action.type) {
      case 'inventory':
      case 'ability':
        this.executeEffects(action.effects, this.getSelf(), this.getSelf(true));
        break;
      case 'basic':
        this.getSelf(true).life -= BattleFunctions.CalculateAttackEffectiveness(
          action.damage,
          user,
          this.getSelf(true),
        );
    }

    this.changeTurn();

    return this.checkEndBattle();
  }

  private getEnemies<T extends boolean>(): T extends true ? IBattleUser[] : IBattleMob[];

  private getEnemies(): TBattleEntity[] {
    return this.turn === 'attacker' ? this.defending : this.attacking;
  }

  private getAllies<T extends boolean>(): T extends true ? IBattleUser[] : IBattleMob[];

  private getAllies(): TBattleEntity[] {
    return this.turn === 'attacker' ? this.attacking : this.defending;
  }

  private getSelf<T extends boolean>(enemy?: boolean): T extends true ? IBattleUser : IBattleMob;

  private getSelf(enemy?: boolean): TBattleEntity {
    if (enemy)
      return this.turn === 'defender'
        ? this.attacking[this.attackerIndex]
        : this.defending[this.defenderIndex];

    return this.turn === 'attacker'
      ? this.attacking[this.attackerIndex]
      : this.defending[this.defenderIndex];
  }

  private checkEndBattle(): boolean {
    const attackingDead = this.attacking.every((a) => isDead(a));
    const defendingDead = this.defending.every((a) => isDead(a));
    if (attackingDead || defendingDead) {
      this.onEndBattle(attackingDead ? this.attacking : this.defending);
      return true;
    }
    return false;
  }

  private mobTurn(): Promise<void>;

  private async userTurn(): Promise<void> {
    const embed = createBaseBattleEmbed(
      this.ctx.locale.bind(this.ctx),
      this.getEntitiesDisplay(),
    ).addFields(this.addStatusBuilds());

    this.makeMessage({
      embeds: [embed],
      components: this.createMessageComponents(this.getSelf<true>()),
    });

    const action = await this.waitUserResponse(this.attacking[this.attackerIndex].id);
    const makeAction = this.makeAction(action);
    if (makeAction) return;
    console.log('owo');
  }
}
