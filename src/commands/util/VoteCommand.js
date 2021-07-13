const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class VoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'vote',
      aliases: ['votar', 'upvote'],
      cooldown: 5,
      description: 'Vote no bot (pfv vote, isso ajuda muito X3 >.< ',
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx) {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:vote.embed_title'))
      .setColor('#f763f8')
      .setURL('https://top.gg/bot/708014856711962654/vote')
      .setImage('https://i.imgur.com/27GxqX1.jpg')
      .setDescription(ctx.locale('commands:vote.embed_description'))
      .setFooter(
        `${ctx.locale('commands:vote.embed_footer')} ${ctx.message.author.tag}`,
        ctx.message.author.displayAvatarURL(),
      )
      .setTimestamp();

    ctx.send(embed);
  }
};
