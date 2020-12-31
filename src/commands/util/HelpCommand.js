const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const Util = require('../../utils/Util');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      aliases: ['ajuda', 'h'],
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, args, server }, t) {
    if (args[0]) {
      // eslint-disable-next-line no-use-before-define
      return getCMD(this.client, message, args[0], t, server);
    }
    // eslint-disable-next-line no-use-before-define
    return getAll(this.client, message, t, server);
  }
};

function getCommmandSize(category, client) {
  return client.commands.filter((c) => c.config.category === category).size;
}

function getCategory(category, client, server) {
  return client.commands.filter((c) => c.config.category === category).map((c) => `\`${server.prefix}${c.config.name}\``).join(', ');
}

function getAll(client, message, t, server) {
  const embed = new MessageEmbed();
  embed.setColor('#b880e6');
  embed.setThumbnail(client.user.displayAvatarURL());

  embed.addField(`${t('commands:help.actions')} (${getCommmandSize('ações', client)})`, getCategory('ações', client, server));
  embed.addField(`${t('commands:help.fun')} (${getCommmandSize('diversão', client)})`, getCategory('diversão', client, server));
  embed.addField(`${t('commands:help.economy')} (${getCommmandSize('economia', client)})`, getCategory('economia', client, server));
  embed.addField(`${t('commands:help.info')} (${getCommmandSize('info', client)})`, getCategory('info', client, server));
  embed.addField(`${t('commands:help.mod')} (${getCommmandSize('moderação', client)})`, getCategory('moderação', client, server));
  embed.addField(`${t('commands:help.rpg')} (${getCommmandSize('rpg', client)})`, getCategory('rpg', client, server));
  embed.addField(`${t('commands:help.util')} (${getCommmandSize('util', client)})`, getCategory('util', client, server));

  embed.addField(t('commands:help.link_name'), t('commands:help.link_value'));

  message.author.send(embed).then(() => {
    message.menheraReply('success', t('commands:help.dm_sent'));
  }).catch(() => {
    message.menheraReply('error', t('commands:help.dm_error'));
  });
}

function getCMD(client, message, input, t, server) {
  const embed = new MessageEmbed();

  const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

  let info = t('commands:help.without-info', { cmd: input.toLowerCase() });

  if (!cmd) return message.channel.send(embed.setColor('#ff0000').setDescription(info));

  info = `**${t('commands:help.cmd')}**: ${Util.captalize(cmd.config.name)}`;
  if (cmd.config.aliases.length > 0) info += `\n**${t('commands:help.aliases')}**: ${cmd.config.aliases.map((a) => `\`${a}\``).join(', ')}`;
  info += `\n**${t('commands:help.desc')}**: ${t(`commands:${cmd.config.name}.description`)}`;
  info += `\n**Cooldown**: ${cmd.config.cooldown} ${t('commands:help.seconds')}`;
  info += `\n**${t('commands:help.howTo')}**: ${server.prefix}${cmd.config.name} ${t(`commands:${cmd.config.name}.usage`)}`;
  embed.setFooter(t('commands:help.footer'));

  return message.channel.send(embed.setColor('#00ffe1').setDescription(info));
}
