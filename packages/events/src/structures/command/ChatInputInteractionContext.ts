import * as Sentry from '@sentry/node';
import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';
import { Interaction, User } from 'discordeno/transformers';
import i18next, { TFunction } from 'i18next';

import { DatabaseUserSchema } from '../../types/database';
import { AvailableLanguages, Translation } from '../../types/i18next';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { logger } from '../../utils/logger';
import { EMOJIS } from '../constants';
import { getFullCommandUsed, getOptionFromInteraction } from './getCommandOption';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests';
import { GenericContext } from '../../types/menhera';
import commandRepository from '../../database/repositories/commandRepository';

export type CanResolve = 'users' | 'members' | 'attachments' | false;

export const ROLEPLAY_COMMANDS = ['acessar', 'aventura', 'personagem', 'viajar'];

export const injectRoleplayWarnIfNeeded = async (
  ctx: GenericContext,
  options: InteractionCallbackData,
): Promise<void> => {
  if (!Array.isArray(options.embeds) || options.embeds.length === 0) return;

  const commandUsed = await commandRepository.getOriginalInteraction(ctx.originalInteractionId);

  if (!commandUsed) return;

  if (!ROLEPLAY_COMMANDS.includes(commandUsed.commandName)) return;

  const lastEmbed = options.embeds.at(-1);

  if (typeof lastEmbed !== 'undefined')
    lastEmbed.footer = { text: `⚠️ ${ctx.locale('roleplay:common.beta-warn')}` };
};

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

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${EMOJIS[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async followUp(options: InteractionCallbackData): Promise<void> {
    await injectRoleplayWarnIfNeeded(this, options);

    await sendFollowupMessage(this.interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: options,
    }).catch((e) => this.captureException(e));
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    await injectRoleplayWarnIfNeeded(this, options);

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
