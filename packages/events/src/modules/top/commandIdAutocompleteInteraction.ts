import { ApplicationCommandOptionChoice, Interaction } from 'discordeno/transformers';
import { InteractionResponseTypes } from 'discordeno/types';
import { findBestMatch } from 'string-similarity';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption';
import { debugError } from '../../utils/debugError';
import { sendInteractionResponse } from '../../utils/discord/interactionRequests';
import { bot } from '../..';

const respondWithChoices = (interaction: Interaction, choices: ApplicationCommandOptionChoice[]) =>
  sendInteractionResponse(interaction.id, interaction.token, {
    type: InteractionResponseTypes.ApplicationCommandAutocompleteResult,
    data: {
      choices,
    },
  }).catch(debugError);

const namedCommands: ApplicationCommandOptionChoice[] = [];

const getCommandNames = () => {
  if (namedCommands.length > 0) return namedCommands;

  const fromBot = bot.commands.array().reduce<ApplicationCommandOptionChoice[]>((p, c) => {
    if (c.devsOnly) return p;

    p.push({ value: c.name, name: `/${c.name}`, nameLocalizations: c.nameLocalizations });

    if (c.nameLocalizations?.['en-US'])
      p.push({
        value: c.name,
        name: `/${c.nameLocalizations['en-US']}`,
        nameLocalizations: c.nameLocalizations,
      });

    return p;
  }, []);

  namedCommands.push(...fromBot);

  return namedCommands;
};

const executeCommandNameAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  const input = getOptionFromInteraction<string>(interaction, 'comando', false, true);

  if (`${input}`.length < 3) return respondWithChoices(interaction, []);

  const ratings = findBestMatch(
    `${input}`,
    getCommandNames().map((a) => a.name),
  ).ratings.reduce<ApplicationCommandOptionChoice[]>((p, c) => {
    if (p.length >= 25 || c.rating < 0.3) return p;

    const command = namedCommands.find((a) => a.name === c.target);

    if (!command) return p;

    p.push(command);

    return p;
  }, []);

  return respondWithChoices(interaction, ratings);
};

export { executeCommandNameAutocomplete };
