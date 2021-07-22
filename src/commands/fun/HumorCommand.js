const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class HumorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'humor',
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run(ctx) {
    if (ctx.message.deletable) ctx.message.delete();

    const rand = await getImageUrl('humor');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setTitle(`${ctx.message.author.username} ${ctx.locale('commands:humor.phrase')}`);

    ctx.send(embed);
  }
};
