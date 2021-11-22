import { ApplicationCommandData } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export default async (client: MenheraClient): Promise<void> => {
  const permissionSet: string[] = [];

  const allCommands = client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
    if (!c.config.devsOnly) return p;
    permissionSet.push(c.config.name);
    p.push({
      name: c.config.name,
      description: c.config.description,
      options: c.config.options,
      defaultPermission: c.config.defaultPermission,
    });
    return p;
  }, []);

  const res = await client.guilds
    .fetch('717061688460967988')
    .then((guild) => guild.commands.set(allCommands));

  res.forEach((a) => {
    if (permissionSet.includes(a.name)) {
      a.permissions.add({
        permissions: [{ id: process.env.OWNER as string, permission: true, type: 'USER' }],
      });
    }
  });
};
