import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import {
  Message,
  MessageOptions,
  MessagePayload,
  EmbedFieldData,
  MessageSelectMenu,
  MessageSelectOptionData,
  MessageButton,
  MessageComponentInteraction,
  MessageActionRow,
} from 'discord.js-light';
import EventEmitter from 'events';
import BattleFunctions from './Functions/BattleFunctions';
import { IBattleUser, TBattleEntity, TBattleTurn } from './Types';
import { createBaseBattleEmbed } from './Utils';

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
    this.emit('error', reason);
  }

  private async sendMessageToChannel(
    options: string | MessagePayload | MessageOptions,
  ): Promise<void> {
    const sentMessage = await this.ctx.interaction.followUp(options).catch((e) => this.onError(e));

    if (!sentMessage) return this.onError('SEND_MESSAGE');

    if (!(sentMessage instanceof Message)) {
      this.battleMessage = new Message(this.ctx.client, sentMessage);
    } else this.battleMessage = sentMessage;
  }

  private async makeMessage(options: string | MessagePayload | MessageOptions): Promise<void> {
    if (!this.battleMessage || this.battleMessage.deleted)
      return this.sendMessageToChannel(options);
    this.battleMessage.edit(options).catch(() => this.sendMessageToChannel(options));
  }

  private createMessageComponents(user: IBattleUser): MessageActionRow[] {
    const abilitiesRow = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId(`${this.ctx.interaction.id} | ABILITY`)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder(this.ctx.locale('roleplay:battle.select-ability'))
        .addOptions(
          user.abilities.reduce((p: MessageSelectOptionData[], c) => {
            p.push({
              label: this.ctx.locale(`roleplay:abilities.${c.id}.name`),
              value: `${c.id}`,
              description: this.ctx.locale(`roleplay:abilities.${c.id}.description`),
            });
            return p;
          }, []),
        ),
    );

    const basicButton = new MessageButton()
      .setCustomId(`${this.ctx.interaction.id} | BASIC`)
      .setEmoji(emojis.sword)
      .setLabel(this.ctx.locale('roleplay:battle.basic-attack'))
      .setStyle('PRIMARY');

    const buttonRows = new MessageActionRow().addComponents(basicButton);

    if (user.inventory.length > 0) {
      const inventoryItens = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId(`${this.ctx.interaction.id} | INVENTORY`)
          .setPlaceholder(this.ctx.locale('roleplay:battle.inventory-itens'))
          .setDisabled(true)
          .setMinValues(1)
          .setMaxValues(1),
      );

      for (let i = 0; i < user.inventory.length; i++) {
        if (i >= 24) break;
        (inventoryItens.components[0] as MessageSelectMenu)
          .addOptions({
            label: this.ctx.locale(`items:${user.inventory[i].id}.name`),
            value: `${user.inventory[i].id} ${i}`,
            description: this.ctx.locale(`items:${user.inventory[i].id}.description`),
          })
          .setDisabled(false);
      }
      return [buttonRows, abilitiesRow, inventoryItens];
    }

    return [buttonRows, abilitiesRow];
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
        ),
      };
  }

  public async startBattle(): Promise<this> {
    const embed = createBaseBattleEmbed(
      this.ctx.locale.bind(this.ctx),
      `<@${this.attacking[0].id}>`,
      'name' in this.defending[0] ? this.defending[0].name : `<@${this.defending[0].id}>`,
    ).addFields(this.addStatusBuilds());
    this.makeMessage({
      embeds: [embed],
      components: this.createMessageComponents(this.attacking[0]),
    });

    return this;
  }
}
