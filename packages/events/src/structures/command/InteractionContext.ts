import { InteractionApplicationCommandCallbackData, InteractionResponseTypes } from 'discordeno';
import { Interaction, User } from 'discordeno/transformers';
import { TFunction } from 'i18next';

import { EMOJIS } from '../constants';
import { Translation } from '../../types/i18next';
import { bot } from '../../index';

type CanResolve = 'users' | false;

export default class {
  public replied = false;

  constructor(public interaction: Interaction, private i18n: TFunction) {}

  get author(): User {
    return this.interaction.user;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${EMOJIS[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async makeMessage(options: InteractionApplicationCommandCallbackData): Promise<void> {
    if (this.replied) {
      bot.helpers.editInteractionResponse(this.interaction.token, options);
      return;
    }

    bot.helpers.sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: options,
    });
    this.replied = true;
  }

  getOption<T>(name: string, toResolve: CanResolve, required: true): T;

  getOption<T>(name: string, shouldResolve: CanResolve, required?: false): T | undefined;

  getOption<T>(name: string, shouldResolve: CanResolve, required?: boolean): T | undefined {
    const found = this.interaction.data?.options?.find((option) => option.name === name) as
      | { value: T }
      | undefined;

    if (!found && required)
      throw new Error(`Option ${name} is required in ${this.interaction.data?.name}`);

    if (!found) return undefined;

    if (shouldResolve)
      return this.interaction.data?.resolved?.[shouldResolve]?.get(
        BigInt(found?.value as unknown as string),
      ) as unknown as T;

    return found?.value as T;
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }
}
