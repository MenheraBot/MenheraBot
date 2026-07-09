import { ApplicationCommandOptionChoice, ApplicationCommandOptionTypes } from '@discordeno/bot';
import { findBestMatch } from 'string-similarity';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption.js';
import { bot } from '../../index.js';
import { respondWithChoices } from '../../utils/discord/interactionRequests.js';
import { Interaction } from '../../types/discordeno.js';

const namedCommands: ApplicationCommandOptionChoice[] = [];
const fullNamedCommands: ApplicationCommandOptionChoice[] = [];

const getCommandNames = () => {
  if (namedCommands.length > 0) return namedCommands;

  const fromBot = bot.commands.array().reduce<ApplicationCommandOptionChoice[]>((p, c) => {
    if (c.devsOnly) return p;

    p.push({
      value: c.name,
      name: `/${c.name}`,
      nameLocalizations: c.nameLocalizations || undefined,
    });

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

interface CommandNode {
  name: string;
  nameLocalizations?: Record<string, string> | null;
  type?: ApplicationCommandOptionTypes;
  options?: CommandNode[] | null;
}

const isSubcommandLike = (type?: ApplicationCommandOptionTypes) =>
  type === ApplicationCommandOptionTypes.SubCommand ||
  type === ApplicationCommandOptionTypes.SubCommandGroup;

const collectCommandChoices = (
  node: CommandNode,
  ancestors: { raw: string; localized: string }[],
  choices: ApplicationCommandOptionChoice[],
) => {
  const localizedName = node.nameLocalizations?.['en-US'];
  const path = [...ancestors, { raw: node.name, localized: localizedName ?? node.name }];
  const value = path.map((part) => part.raw).join(' ');

  choices.push({ value, name: `/${value}` });

  if (localizedName)
    choices.push({ value, name: `/${path.map((part) => part.localized).join(' ')}` });

  node.options?.forEach((child) => {
    if (isSubcommandLike(child.type)) collectCommandChoices(child, path, choices);
  });
};

const getFullComandNames = () => {
  if (fullNamedCommands.length > 0) return fullNamedCommands;

  bot.commands.array().forEach((command) => {
    if (command.devsOnly) return;
    collectCommandChoices(command as CommandNode, [], fullNamedCommands);
  });

  return fullNamedCommands;
};

const executeCommandNameAutocomplete = async (
  interaction: Interaction,
): Promise<undefined | null> => {
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

const executeFullCommandNameAutocomplete = async (
  interaction: Interaction,
): Promise<undefined | null> => {
  const input = getOptionFromInteraction<string>(interaction, 'comando', false, true);

  if (`${input}`.length < 3) return respondWithChoices(interaction, []);

  const ratings = findBestMatch(
    `${input}`,
    getFullComandNames().map((a) => a.name),
  ).ratings.reduce<ApplicationCommandOptionChoice[]>((p, c) => {
    if (p.length >= 25 || c.rating < 0.3) return p;

    const command = fullNamedCommands.find((a) => a.name === c.target);

    if (!command) return p;

    p.push(command);

    return p;
  }, []);

  return respondWithChoices(interaction, ratings);
};

export { executeCommandNameAutocomplete, executeFullCommandNameAutocomplete, getFullComandNames };
