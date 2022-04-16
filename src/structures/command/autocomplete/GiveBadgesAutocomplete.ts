import Badges from '@data/ProfileBadges';
import { ApplicationCommandOptionChoice, AutocompleteInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import { findBestMatch } from 'string-similarity';

const GiveBadgeAutocomplete = async (
  interaction: AutocompleteInteraction & { client: MenheraClient },
): Promise<void> => {
  const texted = interaction.options.getInteger('badgeid');

  if (Date.now() - interaction.createdTimestamp >= 3000) return;

  const badges = Object.entries(Badges).map((a) => ({
    id: a[0],
    ...a[1],
    name: `${a[0]} ${a[1].name}`,
  }));

  const ratings = findBestMatch(
    `${texted}`,
    badges.map((a) => a.name),
  );

  const toSendOptions = ratings.ratings.filter((a) => a.rating >= 0.35);
  if (toSendOptions.length === 0) return interaction.respond([]);

  const toSendBadges: ApplicationCommandOptionChoice[] = [];

  toSendOptions.forEach((a) => {
    if (toSendBadges.length >= 25) return;
    const badge = badges.find((b) => b.name === a.target);
    if (!badge) return;
    const toPush = { name: badge.name, value: badge.id };
    if (toSendBadges.some((b) => b.value === toPush.value)) return;
    toSendBadges.push(toPush);
  });

  if (toSendBadges.length > 0) interaction.respond(toSendBadges);

  interaction.client.interactionStatistics.success += 1;
};

export default GiveBadgeAutocomplete;
