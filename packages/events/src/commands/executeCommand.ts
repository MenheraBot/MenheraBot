import { Bot, Interaction } from 'discordeno';
import { commands } from './index';

const executeSlashCommand = async (bot: Bot, interaction: Interaction) => {
  const { data } = interaction;
  const name = data?.name as keyof typeof commands;

  const command = commands[name];

  if (command) command.execute(interaction);
};

export { executeSlashCommand };
