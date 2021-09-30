import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import { Message, MessageOptions, MessagePayload, EmbedFieldData } from 'discord.js-light';
import EventEmitter from 'events';
import { IBattleUser, TBattleEntity } from './Types';
import { createBaseBattleEmbed } from './Utils';

export default class BolehamBattle extends EventEmitter {
  private attackerIndex = 0;

  private defenderIndex = 0;

  private battleMessage?: Message;

  private battlelingStartStatus: IBattleUser[] | null = [];

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
      if (a.isUser) {
        if (!this.battlelingStartStatus) this.battlelingStartStatus = [];
        this.battlelingStartStatus.push(a);
      } else this.battlelingStartStatus = null;
    });

    this.enemy.forEach((a) => {
      if (a.isUser) {
        if (!this.enemyStartStatus) this.enemyStartStatus = [];
        this.enemyStartStatus.push(a);
      } else this.battlelingStartStatus = null;
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

  private addStatusBuilds(): EmbedFieldData[] {
    return [
      {
        name: this.ctx.locale('common:your_status'),
        inline: true,
        value: `${emojis.blood} | ${this.ctx.locale('roleplay:stats.life')}: **${
          this.battleling[this.attackerIndex].life
        }**`,
      },
      {
        name: this.ctx.locale('common:entity_status'),
        inline: true,
        value: `${emojis.blood} | ${this.ctx.locale('roleplay:stats.life')}: **${
          this.enemy[this.defenderIndex].life
        }**`,
      },
    ];
  }

  public async startBattle(): Promise<this> {
    const embed = createBaseBattleEmbed(
      this.ctx.locale.bind(this.ctx),
      `<@${this.battleling[0].id}>`,
      'name' in this.enemy[0] ? this.enemy[0].name : `<@${this.enemy[0].id}>`,
    ).addFields(this.addStatusBuilds());
    this.editMessage({ embeds: [embed] });

    return this;
  }
}
