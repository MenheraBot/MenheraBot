import { ApplicationCommandData } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export default async (client: MenheraClient): Promise<void> => {
  const allCommands = client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
    if (!c.config.devsOnly) return p;
    p.push({
      name: c.config.name,
      description: c.config.description,
      options: c.config.options,
      nameLocalizations: c.config.nameLocalizations,
      descriptionLocalizations: c.config.descriptionLocalizations,
    });
    return p;
  }, []);

  await client.guilds.forge('717061688460967988').commands.set(allCommands);
};
