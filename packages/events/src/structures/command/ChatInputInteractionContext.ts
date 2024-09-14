import * as Sentry from '@sentry/node';
import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';
import { Interaction, User } from 'discordeno/transformers';
import i18next, { TFunction } from 'i18next';

import { DatabaseUserSchema } from '../../types/database';
import { AvailableLanguages, Translation } from '../../types/i18next';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { logger } from '../../utils/logger';
import { EMOJIS, SAFE_EMOJIS, SAFE_TOP_EMOJIS, TOP_EMOJIS } from '../constants';
import { getFullCommandUsed, getOptionFromInteraction } from './getCommandOption';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests';
import { bot } from '../..';

export type CanResolve = 'users' | 'members' | 'attachments' | false;

export const ROLEPLAY_COMMANDS = ['acessar', 'aventura', 'personagem', 'viajar'];

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

  get interactionToken(): string {
    return this.interaction.token;
  }

  get author(): User {
    return this.interaction.user;
  }

  get user(): User {
    return this.author;
  }

  get originalInteractionId(): bigint {
    return this.interaction.id ?? 0n;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
  }

  safeEmoji(emoji: keyof typeof EMOJIS, topEmojis?: boolean): string {
    const canUseCustomEmojis = bot.utils
      .calculatePermissions(this.interaction.appPermissions ?? 0n)
      .includes('USE_EXTERNAL_EMOJIS');

    const emojisToUse = topEmojis ? TOP_EMOJIS : EMOJIS;
    const safeEmojisToUse = topEmojis ? SAFE_TOP_EMOJIS : SAFE_EMOJIS;

    return canUseCustomEmojis
      ? emojisToUse[emoji]
      : safeEmojisToUse[emoji as 'gods'] || emojisToUse[emoji] || '🐛';
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
        flags: ephemeral ? MessageFlags.EPHEMERAL : undefined,
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
