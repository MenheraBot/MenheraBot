import { Camelize, DiscordEmbed } from '@discordeno/bot';

export type Embed = Camelize<DiscordEmbed>;

const createEmbed = (data: Embed): Embed => data;

const hexStringToNumber = (color: string): number => parseInt(color.replace(/^#/, ''), 16);

export { createEmbed, hexStringToNumber };
