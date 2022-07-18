import { Abilities } from '@roleplay/data';
import { AutocompleteInteraction, ApplicationCommandOptionChoiceData } from 'discord.js-light';
import i18next from 'i18next';
import MenheraClient from 'MenheraClient';
import { findBestMatch } from 'string-similarity';

const availableAbilities: { name: string; id: number }[] = [];
const locales: { 'pt-BR': string[]; 'en-US': string[] } = { 'pt-BR': [], 'en-US': [] };

const populateTranslations = () => {
  const toPortuguese = i18next.getFixedT('pt-BR');
  const toEnglish = i18next.getFixedT('en-US');

  Object.keys(Abilities).forEach((id) => {
    const pt = toPortuguese(`abilities:${id}.name`);
    const en = toEnglish(`abilities:${id}.name`);

    locales['pt-BR'].push(pt);
    locales['en-US'].push(en);

    availableAbilities.push({ name: pt, id: Number(id) });
    availableAbilities.push({ name: en, id: Number(id) });
  });
};

const LibraryAutocomplete = async (
  interaction: AutocompleteInteraction & { client: MenheraClient },
): Promise<void> => {
  if (availableAbilities.length === 0) populateTranslations();
  const texted = interaction.options.getInteger('id');

  if (`${texted}`.length < 5) return interaction.respond([]);

  const ratings =
    interaction.guildLocale === 'en-US'
      ? findBestMatch(`${texted}`, locales['en-US'])
      : findBestMatch(`${texted}`, locales['pt-BR']);

  const toSendOptions = ratings.ratings.filter((a) => a.rating >= 0.35);
  if (toSendOptions.length === 0) return interaction.respond([]);

  const abilities: ApplicationCommandOptionChoiceData[] = [];

  toSendOptions.forEach((a) => {
    if (abilities.length >= 25) return;
    const ability = availableAbilities.find((b) => b.name === a.target);
    if (!ability) return;
    const toPush = { name: ability.name, value: ability.id };
    if (abilities.some((b) => b.value === toPush.value)) return;
    abilities.push(toPush);
  });

  if (abilities.length > 0) interaction.respond(abilities);

  interaction.client.interactionStatistics.success += 1;
};

export default LibraryAutocomplete;
