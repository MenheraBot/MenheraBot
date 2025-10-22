import { DiscordEmbed, Embed } from '@discordeno/bot';
import { bot } from '../../index.js';

const createEmbed = (data: Embed): DiscordEmbed => bot.transformers.reverse.embed(bot, data);

const hexStringToNumber = (color: string): number => parseInt(color.replace(/^#/, ''), 16);

export { createEmbed, hexStringToNumber };
