const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class PatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pat',
      aliases: ['carinho', 'cuddle'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('pat');
    const user = ctx.message.mentions.users.first();

    if (!user) return ctx.replyT('error', 'commands:pat.no-mention');

    if (user === ctx.message.author) return ctx.replyT('error', 'commands:pat.self-mention');

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:pat.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:pat.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
