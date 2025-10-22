import { Camelize, DiscordEmbed } from '@discordeno/bot';

export type Embed = Camelize<DiscordEmbed>;

const createEmbed = (data: Omit<Embed, 'timestamp'> & { timestamp?: number }): Embed =>
  data.timestamp ? { ...data, timestamp: new Date(data.timestamp).toISOString() } : data as unknown as Embed;

const hexStringToNumber = (color: string): number => parseInt(color.replace(/^#/, ''), 16);

export { createEmbed, hexStringToNumber };
