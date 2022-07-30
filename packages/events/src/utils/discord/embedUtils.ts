import { Embed } from 'discordeno/transformers';

const createEmbed = (data: Embed): Embed => data;

const hexStringToNumber = (color: string): number => parseInt(color.replace(/^#/, ''), 16);

export { createEmbed, hexStringToNumber };
