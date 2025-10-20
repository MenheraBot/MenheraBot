import { bot } from '../index.js';

export type Attachment = typeof bot.transformers.$inferredTypes.attachment;
export type Interaction = typeof bot.transformers.$inferredTypes.interaction;
export type Member = typeof bot.transformers.$inferredTypes.member;
export type User = typeof bot.transformers.$inferredTypes.user;
