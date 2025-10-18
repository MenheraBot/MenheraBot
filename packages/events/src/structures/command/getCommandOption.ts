import { Interaction, User } from '@discordeno/bot';
import { ApplicationCommandOptionTypes } from '@discordeno/bot';
import { CanResolve } from './ChatInputInteractionContext.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { bot } from '../../index.js';

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required: true,
): T;

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required?: false,
): T | undefined;

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required?: boolean,
): T | undefined;

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required?: boolean,
): T | undefined {
  let options = interaction.data?.options ?? [];

  if (options[0]?.type === ApplicationCommandOptionTypes.SubCommandGroup)
    options = options[0].options ?? [];

  if (options[0]?.type === ApplicationCommandOptionTypes.SubCommand)
    options = options[0].options ?? [];

  const found = options.find((option) => option.name === name) as { value: T } | undefined;

  if (!found && required)
    throw new Error(`Option ${name} is required in ${interaction.data?.name}`);

  if (!found) return undefined;

  if (shouldResolve) {
    const resolved = interaction.data?.resolved?.[shouldResolve]?.get(
      BigInt(found?.value as unknown as string),
    ) as unknown as T;

    if (shouldResolve === 'users')
      cacheRepository.setDiscordUser(bot.transformers.reverse.user(bot, resolved as User));

    return resolved;
  }

  return found?.value as T;
}

interface CommandUsed {
  command: string;
  subCommand?: string;
  subCommandGroup?: string;
  fullCommand: string;
}

const getFullCommandUsed = (interaction: Interaction): CommandUsed => {
  const commandName = interaction.data?.name as string;
  const commandUsed: CommandUsed = { command: commandName, fullCommand: commandName };

  let options = interaction.data?.options ?? [];

  if (options[0]?.type === ApplicationCommandOptionTypes.SubCommandGroup) {
    commandUsed.subCommandGroup = options[0].name;
    commandUsed.fullCommand += ` ${options[0].name}`;
    options = options[0]?.options ?? [];
  }

  if (options[0]?.type === ApplicationCommandOptionTypes.SubCommand) {
    commandUsed.subCommand = options[0].name;
    commandUsed.fullCommand += ` ${options[0].name}`;
  }

  return commandUsed;
};

export { getOptionFromInteraction, getFullCommandUsed };
