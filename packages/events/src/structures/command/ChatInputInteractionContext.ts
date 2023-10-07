import * as Sentry from '@sentry/node';
import {
  ApplicationCommandOptionTypes,
  InteractionCallbackData,
  InteractionResponseTypes,
} from 'discordeno';
import { Interaction, User } from 'discordeno/transformers';
import { TFunction } from 'i18next';

import { bot } from '../../index';
import { DatabaseUserSchema } from '../../types/database';
import { Translation } from '../../types/i18next';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { logger } from '../../utils/logger';
import { EMOJIS } from '../constants';
import { getOptionFromInteraction } from './getCommandOption';

export type CanResolve = 'users' | 'members' | 'attachments' | false;

export default class {
  public replied = false;

  public subCommand: string | undefined;

  public subCommandGroup: string | undefined;

  constructor(
    public interaction: Interaction,
    public authorData: Readonly<DatabaseUserSchema>,
    public i18n: TFunction,
  ) {
    let options = interaction.data?.options ?? [];

    if (options[0]?.type === ApplicationCommandOptionTypes.SubCommandGroup) {
      this.subCommandGroup = options[0].name;
      options = options[0].options ?? [];
    }

    if (options[0]?.type === ApplicationCommandOptionTypes.SubCommand) {
      this.subCommand = options[0].name;
    }
  }

  get author(): User {
    return this.interaction.user;
  }

  get commandId(): bigint {
    return this.interaction.data?.id ?? 0n;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${EMOJIS[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async followUp(options: InteractionCallbackData): Promise<void> {
    await bot.helpers
      .sendFollowupMessage(this.interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: options,
      })
      .catch((e) => this.captureException(e));
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    if (this.replied) {
      await bot.helpers
        .editOriginalInteractionResponse(this.interaction.token, options)
        .catch((e) => this.captureException(e));
      return;
    }

    this.replied = true;

    await bot.helpers
      .sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: options,
      })
      .catch((e) => this.captureException(e));
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
    if (this.replied) {
      logger.info(
        `TRIED TO DEFER AN ALREADY REPLIED COMMAND. Author: ${this.author.id} Command: ${this.interaction.data?.name}`,
      );
      return;
    }

    this.replied = true;
    await bot.helpers
      .sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.DeferredChannelMessageWithSource,
        data: {
          flags: ephemeral ? MessageFlags.EPHEMERAL : undefined,
        },
      })
      .catch((e) => this.captureException(e));
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
