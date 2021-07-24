import CommandContext from '@structures/CommandContext';
import { IGuildSchema } from '@utils/Types';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import Util from '@utils/Util';

export default class HelpCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'help',
      aliases: ['ajuda', 'h'],
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext) {
    if (ctx.args[0]) {
      // eslint-disable-next-line no-use-before-define
      return getCMD(ctx);
    }
    // eslint-disable-next-line no-use-before-define
    return getAll(ctx);
  }
}

function getCommmandSize(category: string, client: MenheraClient) {
  return client.commands.filter((c) => c.config.category === category).size;
}

function getCategory(category: string, client: MenheraClient, server: IGuildSchema) {
  return client.commands
    .filter((c) => c.config.category === category)
    .map((c) => `\`${server.prefix}${c.config.name}\``)
    .join(', ');
}

function getAll(ctx: CommandContext) {
  const embed = new MessageEmbed();
  embed.setColor('#b880e6');
  embed.setThumbnail(ctx.client.user.displayAvatarURL());

  embed.addField(
    `${ctx.locale('commands:help.actions')} (${getCommmandSize('ações', ctx.client)})`,
    getCategory('ações', ctx.client, ctx.data.server),
  );
  embed.addField(
    `${ctx.locale('commands:help.fun')} (${getCommmandSize('diversão', ctx.client)})`,
    getCategory('diversão', ctx.client, ctx.data.server),
  );
  embed.addField(
    `${ctx.locale('commands:help.economy')} (${getCommmandSize('economia', ctx.client)})`,
    getCategory('economia', ctx.client, ctx.data.server),
  );
  embed.addField(
    `${ctx.locale('commands:help.info')} (${getCommmandSize('info', ctx.client)})`,
    getCategory('info', ctx.client, ctx.data.server),
  );
  embed.addField(
    `${ctx.locale('commands:help.mod')} (${getCommmandSize('moderação', ctx.client)})`,
    getCategory('moderação', ctx.client, ctx.data.server),
  );
  embed.addField(
    `${ctx.locale('commands:help.rpg')} (${getCommmandSize('rpg', ctx.client)})`,
    getCategory('rpg', ctx.client, ctx.data.server),
  );
  embed.addField(
    `${ctx.locale('commands:help.util')} (${getCommmandSize('util', ctx.client)})`,
    getCategory('util', ctx.client, ctx.data.server),
  );

  embed.addField(ctx.locale('commands:help.link_name'), ctx.locale('commands:help.link_value'));

  ctx.message.author
    .send(embed)
    .then(() => {
      ctx.replyT('success', 'commands:help.dm_sent');
    })
    .catch(() => {
      ctx.replyT('error', 'commands:help.dm_error');
    });
}

function getCMD(ctx: CommandContext) {
  const embed = new MessageEmbed();

  const cmd =
    ctx.client.commands.get(ctx.args[0].toLowerCase()) ||
    ctx.client.commands.get(ctx.client.aliases.get(ctx.args[0].toLowerCase()));

  let info = ctx.locale('commands:help.without-info', { cmd: ctx.args[0].toLowerCase() });

  if (!cmd) return ctx.send(embed.setColor('#ff0000').setDescription(info));

  info = `**${ctx.locale('commands:help.cmd')}**: ${Util.captalize(cmd.config.name)}`;
  if (cmd.config.aliases.length > 0)
    info += `\n**${ctx.locale('commands:help.aliases')}**: ${cmd.config.aliases
      .map((a) => `\`${a}\``)
      .join(', ')}`;
  info += `\n**${ctx.locale('commands:help.desc')}**: ${ctx.locale(
    `commands:${cmd.config.name}.description`,
  )}`;
  info += `\n**Cooldown**: ${cmd.config.cooldown} ${ctx.locale('commands:help.seconds')}`;
  info += `\n**${ctx.locale('commands:help.howTo')}**: ${ctx.data.server.prefix}${
    cmd.config.name
  } ${ctx.locale(`commands:${cmd.config.name}.usage`)}`;
  embed.setFooter(ctx.locale('commands:help.footer'));

  return ctx.send(embed.setColor('#00ffe1').setDescription(info));
}
