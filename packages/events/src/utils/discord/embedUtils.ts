import { Camelize, DiscordEmbed, Embed as Embedd } from '@discordeno/bot';

const createEmbed = (data: Embedd): Camelize<DiscordEmbed> => data as unknown as Camelize<DiscordEmbed>;

const hexStringToNumber = (color: string): number => parseInt(color.replace(/^#/, ''), 16);

// FIXME esses embeds tao quyebradasssos
export type Embed = Camelize<DiscordEmbed>;

export { createEmbed, hexStringToNumber };
