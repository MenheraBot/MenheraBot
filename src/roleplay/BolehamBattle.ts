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
  MessageActionRow,
} from 'discord.js-light';
import EventEmitter from 'events';
import { IBattleUser, TBattleEntity } from './Types';
import { createBaseBattleEmbed } from './Utils';

export default class BolehamBattle extends EventEmitter {
  private attackerIndex = 0;

  private defenderIndex = 0;

  private battleMessage?: Message;

  private battlelingStartStatus: IBattleUser[] = [];

  private enemyStartStatus: IBattleUser[] | null = [];

  constructor(
    private ctx: InteractionCommandContext,
    private battleling: IBattleUser[],
    private enemy: TBattleEntity[],
  ) {
    super();
    this.saveCurrentUserStats();
  }

  private saveCurrentUserStats(): void {
    this.battleling.forEach((a) => {
      this.battlelingStartStatus.push(a);
    });

    this.enemy.forEach((a) => {
      if (a.isUser) {
        if (!this.enemyStartStatus) this.enemyStartStatus = [];
        this.enemyStartStatus.push(a);
      } else this.enemyStartStatus = null;
    });
  }

  private onError(reason: string): void {
    this.emit('error', reason);
  }

  private async createNewMessage(options: string | MessagePayload | MessageOptions): Promise<void> {
    const sentMessage = await this.ctx.interaction.followUp(options).catch(() => null);

    if (!sentMessage) return this.onError('SEND_MESSAGE');

    if (!(sentMessage instanceof Message)) {
      this.battleMessage = new Message(this.ctx.client, sentMessage);
    } else this.battleMessage = sentMessage;
  }

  private async editMessage(options: string | MessagePayload | MessageOptions): Promise<void> {
    if (!this.battleMessage || this.battleMessage.deleted) return this.createNewMessage(options);
    this.battleMessage.edit(options).catch(() => this.createNewMessage(options));
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

    const inventoryItens = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId(`${this.ctx.interaction.id} | INVENTORY`)
        .setPlaceholder(this.ctx.locale('roleplay:battle.inventory-itens'))
        .setDisabled(true)
        .setMinValues(1)
        .setMaxValues(1),
    );

    if (user.inventory.length > 0) {
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
    }

    return [buttonRows, abilitiesRow, inventoryItens];
  }

  private addStatusBuilds(inverse = false): EmbedFieldData[] {
    const actualEnemy = this.enemy[this.defenderIndex];
    const defaultReturn = [
      {
        name: this.ctx.locale('common:your_status'),
        inline: true,
        value: `${emojis.blood} | ${this.ctx.locale('roleplay:stats.life')}: **${
          this.battleling[this.attackerIndex].life
        }**\n${emojis.mana} | ${this.ctx.locale('roleplay:stats.mana')}: **${
          this.battleling[this.attackerIndex].mana
        }**\n${emojis.roleplay_custom.tired} | ${this.ctx.locale('roleplay:stats.tiredness')}: **${
          this.battleling[this.attackerIndex].tiredness
        }**\n${emojis.roleplay_custom.speed} | ${this.ctx.locale('roleplay:stats.speed')}: **${
          this.battleling[this.attackerIndex].speed
        }**\n${emojis.sword} | ${this.ctx.locale('roleplay:stats.damage')}: **${
          this.battleling[this.attackerIndex].damage
        }**\n${emojis.shield} | ${this.ctx.locale('roleplay:stats.armor')}: **${
          this.battleling[this.attackerIndex].armor
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
        }**\n${emojis.roleplay_custom.speed} | ${this.ctx.locale('roleplay:stats.speed')}: **${
          actualEnemy.speed
        }**\n${emojis.sword} | ${this.ctx.locale('roleplay:stats.damage')}: **${
          actualEnemy.damage
        }**\n${emojis.shield} | ${this.ctx.locale('roleplay:stats.armor')}: **${
          actualEnemy.armor
        }**`,
      },
    ];

    return inverse ? defaultReturn.reverse() : defaultReturn;
  }

  public async startBattle(): Promise<this> {
    const embed = createBaseBattleEmbed(
      this.ctx.locale.bind(this.ctx),
      `<@${this.battleling[0].id}>`,
      'name' in this.enemy[0] ? this.enemy[0].name : `<@${this.enemy[0].id}>`,
    ).addFields(this.addStatusBuilds());
    this.editMessage({
      embeds: [embed],
      components: this.createMessageComponents(this.battleling[0]),
    });

    return this;
  }
}
