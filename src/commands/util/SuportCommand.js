const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');

module.exports = class SuportCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'support',
      aliases: ['suporte'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'util',
    });
  }

  async run(ctx) {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:support.embed_title'))
      .setURL('https://discord.gg/fZMdQbA')
      .setColor('#970045')
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setFooter(
        `${ctx.locale('commands:support.embed_footer')} ${ctx.message.author.tag}`,
        ctx.message.author.displayAvatarURL(),
      )
      .setTimestamp();
    ctx.sendC(ctx.message.author, embed);
  }
};
