import { IContextData } from '@custom_types/Menhera';
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  InteractionReplyOptions,
  Message,
  MessagePayload,
  TextBasedChannel,
  User,
} from 'discord.js-light';
import { TFunction } from 'i18next';
import MenheraClient from 'MenheraClient';
import { emojis, EmojiTypes } from '@structures/Constants';
// eslint-disable-next-line import/no-extraneous-dependencies
import { APIMessage } from 'discord-api-types/v10';
import { debugError } from '@utils/Util';

import { Translation } from '../../types/i18next';

export default class InteractionCommandContext {
  constructor(
    public interaction: CommandInteraction & { client: MenheraClient },
    public i18n: TFunction,
    public data: IContextData,
  ) {}

  get client(): MenheraClient {
    return this.interaction.client;
  }

  get options(): Omit<CommandInteractionOptionResolver<'cached'>, 'getMessage' | 'getFocused'> {
    return this.interaction.options;
  }

  get channel(): TextBasedChannel {
    return this.interaction.channel as TextBasedChannel;
  }

  get author(): User {
    return this.interaction.user;
  }

  async defer(
    options?: MessagePayload | InteractionReplyOptions,
    ephemeral = false,
  ): Promise<void> {
    if (this.interaction.deferred && options) {
      await this.send(options);
      return;
    }

    await this.interaction
      .deferReply({ ephemeral })
      .then(() => {
        this.client.interactionStatistics.success += 1;
      })
      .catch((e) => {
        this.client.interactionStatistics.catchedErrors += 1;
        debugError(e);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  prettyResponseText(emoji: EmojiTypes, text: string): string {
    return `${emojis[emoji] || '🐛'} **|** ${text}`;
  }

  prettyResponse(emoji: EmojiTypes, text: Translation, translateOptions = {}): string {
    return `${emojis[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  private resolveMessage(message: Message | APIMessage | null): Message | null {
    if (!message) return null;
    if (message instanceof Message) return message;
    // @ts-expect-error Message constructor is private
    return new Message(this.client, message);
  }

  async makeMessage(options: InteractionReplyOptions): Promise<Message | null> {
    if (this.interaction.replied || this.interaction.deferred)
      return this.resolveMessage(
        await this.interaction
          .editReply(options)
          .then((a) => {
            this.client.interactionStatistics.success += 1;
            return a;
          })
          .catch((e) => {
            this.client.interactionStatistics.catchedErrors += 1;
            return debugError(e);
          }),
      );

    return this.resolveMessage(
      await this.interaction
        .reply({ ...options, fetchReply: true })
        .then((a) => {
          this.client.interactionStatistics.success += 1;
          return a;
        })
        .catch((e) => {
          this.client.interactionStatistics.catchedErrors += 1;
          return debugError(e);
        }),
    );
  }

  async send(options: MessagePayload | InteractionReplyOptions): Promise<Message | null> {
    return this.resolveMessage(
      await this.interaction
        .followUp(options)
        .then((a) => {
          this.client.interactionStatistics.success += 1;
          return a;
        })
        .catch((e) => {
          this.client.interactionStatistics.catchedErrors += 1;
          return debugError(e);
        }),
    );
  }

  async fetchReply(): Promise<Message | null> {
    return this.resolveMessage(
      await this.interaction
        .fetchReply()
        .then((a) => {
          this.client.interactionStatistics.success += 1;
          return a;
        })
        .catch((e) => {
          this.client.interactionStatistics.catchedErrors += 1;
          return debugError(e);
        }),
    );
  }

  async deleteReply(): Promise<void | null> {
    return this.interaction
      .deleteReply()
      .then(() => {
        this.client.interactionStatistics.success += 1;
      })
      .catch((e) => {
        this.client.interactionStatistics.catchedErrors += 1;
        debugError(e);
      });
  }

  locale(text: Translation, translateVars = {}): string {
    return this.i18n(text, {
      ...translateVars,
      // context: this.data.server.uncensored ? 'uncensored' : null, -- THIS IS FOR UNCENSORED FUTURE OPTION
    });
  }
}
