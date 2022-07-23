import { InteractionApplicationCommandCallbackData, InteractionResponseTypes } from 'discordeno';
import { Interaction } from 'discordeno/transformers';
import { TFunction } from 'i18next';

import { emojis } from '../constants';
import { Translation } from '../../types/i18next';
import { bot } from '../../index';

type CanResolve = 'users' | false;

export default class {
  constructor(public interaction: Interaction, private i18n: TFunction) {}

  prettyResponse(emoji: keyof typeof emojis, text: Translation, translateOptions = {}): string {
    return `${emojis[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async makeMessage(options: InteractionApplicationCommandCallbackData): Promise<void> {
    bot.helpers.sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.DeferredChannelMessageWithSource,
      data: options,
    });
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
