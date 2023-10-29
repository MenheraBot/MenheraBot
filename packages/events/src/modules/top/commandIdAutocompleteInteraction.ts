import { ApplicationCommandOptionChoice, Interaction } from 'discordeno/transformers';
import { InteractionResponseTypes } from 'discordeno/types';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption';
import { debugError } from '../../utils/debugError';
import { sendInteractionResponse } from '../../utils/discord/interactionRequests';
import { serachApiCommands } from '../../utils/apiRequests/commands';
import { bot } from '../..';

const respondWithChoices = (interaction: Interaction, choices: ApplicationCommandOptionChoice[]) =>
  sendInteractionResponse(interaction.id, interaction.token, {
    type: InteractionResponseTypes.ApplicationCommandAutocompleteResult,
    data: {
      choices,
    },
  }).catch(debugError);

const executeCommandIdAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  const input = getOptionFromInteraction<number>(interaction, 'comando', false, true);

  if (`${input}`.length < 3) return respondWithChoices(interaction, []);

  const result = await serachApiCommands(`${input}`);

  if (!result) return respondWithChoices(interaction, []);

  const choices = result.reduce<ApplicationCommandOptionChoice[]>((p, c) => {
    if (p.length >= 25) return p;

    const commandFromMenhera = bot.commands.get(c.name);

    p.push({
      name: c.name,
      nameLocalizations: commandFromMenhera?.nameLocalizations,
      value: Number(c.id),
    });

    return p;
  }, []);

  return respondWithChoices(interaction, choices);
};

export { executeCommandIdAutocomplete };
