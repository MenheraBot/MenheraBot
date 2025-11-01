import * as Sentry from '@sentry/node';
import { InteractionCallbackData, InteractionResponseTypes } from '@discordeno/bot';
import i18next, { TFunction } from 'i18next';

import { DatabaseUserSchema } from '../../types/database.js';
import { AvailableLanguages, Translation } from '../../types/i18next.js';
import { MessageFlags } from "@discordeno/bot";
import { logger } from '../../utils/logger.js';
import { EMOJIS, TOP_EMOJIS } from '../constants.js';
import { getFullCommandUsed, getOptionFromInteraction } from './getCommandOption.js';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests.js';
import { Interaction, User } from '../../types/discordeno.js';

export type CanResolve = 'users' | 'members' | 'attachments' | false;

export default class {
  public replied = false;

  public subCommand: string | undefined;

  public subCommandGroup: string | undefined;

  public i18n: TFunction;

  constructor(
    public interaction: Interaction,
    public authorData: DatabaseUserSchema,
    public guildLocale: AvailableLanguages,
  ) {
    this.i18n = i18next.getFixedT(guildLocale);

    const { subCommand, subCommandGroup } = getFullCommandUsed(interaction);

    this.subCommandGroup = subCommandGroup;
    this.subCommand = subCommand;
  }

  get author(): User {
    return this.interaction.user;
  }

  get user(): User {
    return this.author;
  }

  get originalInteractionId(): string {
    return `${this.interaction.id}`;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
  }

  // eslint-disable-next-line class-methods-use-this
  safeEmoji(emoji: keyof typeof EMOJIS, topEmojis?: boolean): string {
    return topEmojis ? TOP_EMOJIS[emoji as 'gods'] : EMOJIS[emoji];
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${this.safeEmoji(emoji)} **|** ${this.locale(text, translateOptions)}`;
  }

  async followUp(options: InteractionCallbackData): Promise<void> {
    await sendFollowupMessage(this.interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: options,
    }).catch((e) => this.captureException(e));
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    if (this.replied) {
      await editOriginalInteractionResponse(this.interaction.token, options).catch((e) =>
        this.captureException(e),
      );
      return;
    }

    this.replied = true;

    await sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: options,
    }).catch((e) => this.captureException(e));
  }

  getSubCommandGroup(required = false): string {
    const command = this.subCommandGroup;

    if (!command && required)
      throw new Error(`SubCommandGroup is required in ${this.interaction.data?.name}`);

    return command as string;
  }

  getSubCommand(): string {
    const command = this.subCommand;

    if (!command) throw new Error(`SubCommand is required in ${this.interaction.data?.name}`);

    return command as string;
  }

  getOption<T>(name: string, shouldResolve: CanResolve, required: true): T;

  getOption<T>(name: string, shouldResolve: CanResolve, required?: false): T | undefined;

  getOption<T>(name: string, shouldResolve: CanResolve, required?: boolean): T | undefined {
    return getOptionFromInteraction<T>(this.interaction, name, shouldResolve, required);
  }

  async defer(ephemeral = false): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.DeferredChannelMessageWithSource,
      data: {
        flags: ephemeral ? MessageFlags.Ephemeral : undefined,
      },
    }).catch((e) => this.captureException(e));
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  captureException(error: Error): null {
    logger.error(this.interaction.data?.name, error.message);

    Sentry.withScope((scope) => {
      scope.setContext('command', {
        name: this.interaction.data?.name,
        subCommand: this.subCommand,
        subCommandGroup: this.subCommandGroup,
        commandAuthor: this.author.id,
      });
      try {
        Sentry.captureException(error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        logger.error('Error while sending the event', e?.message ?? e);
      }
    });

    return null;
  }
}
