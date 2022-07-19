/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bot } from 'discordeno';
import ping from './info/ping';

const commands = {
  ping,
};

const setGuildCommands = async (bot: Bot, data: any) => {
  if (!data.t) return;

  const id = bot.transformers.snowflake(
    (['GUILD_CREATE', 'GUILD_UPDATE'].includes(data.t)
      ? // deno-lint-ignore no-explicit-any
        (data.d as any).id
      : // deno-lint-ignore no-explicit-any
        (data.d as any).guild_id ?? '') ?? '',
  );

  if (data.t !== 'GUILD_CREATE') return;
  // NEW GUILD AVAILABLE OR NOT USING LATEST VERSION
  await bot.helpers.upsertApplicationCommands(
    Object.entries(commands)
      // ONLY GUILD COMMANDS
      .map(([name, command]) => ({
        name,
        description: command.description,
        type: command.type,
      })),
    id,
  );
};

export { commands, setGuildCommands };
