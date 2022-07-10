import Badges from '@data/ProfileBadges';
import { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import { findBestMatch } from 'string-similarity';

const GiveBadgeAutocomplete = async (
  interaction: AutocompleteInteraction & { client: MenheraClient },
): Promise<void> => {
  const texted = interaction.options.getInteger('badgeid');

  const entries = Object.entries(Badges);

  const badges: { id: string; name: string }[] = entries.map((a) => ({
    id: a[0],
    name: `${a[0]} ${a[1].name}`,
  }));

  badges.push(...entries.map((c) => ({ name: c[0], id: c[0] })));

  const ratings = findBestMatch(
    `${texted}`,
    badges.map((a) => a.name),
  );

  const toSendOptions = ratings.ratings.filter((a) => a.rating >= 0.2);

  if (toSendOptions.length === 0) return interaction.respond([]);

  const toSendBadges: ApplicationCommandOptionChoiceData[] = [];

  toSendOptions.forEach((a) => {
    if (toSendBadges.length >= 25) return;
    const badge =
      a.target.length < 3
        ? badges.find((b) => b.name.startsWith(a.target))
        : badges.find((b) => b.name === a.target);

    if (!badge) return;

    const toPush = { name: badge.name, value: Number(badge.id) };
    if (toSendBadges.some((b) => b.value === toPush.value)) return;
    toSendBadges.push(toPush);
  });

  if (toSendBadges.length > 0) interaction.respond(toSendBadges);

  interaction.client.interactionStatistics.success += 1;
};

export default GiveBadgeAutocomplete;
