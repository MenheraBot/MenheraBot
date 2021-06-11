const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class SarrarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sarrar',
      aliases: ['dance'],
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const randSozinho = await getImageUrl('sarrar_sozinho');
    const user = ctx.message.mentions.users.first();

    if (!user) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:sarrar.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${ctx.locale('commands:sarrar.no-mention.embed_description_start')} ${ctx.message.author}?\n${ctx.locale('commands:sarrar.no-mention.embed_description_end')}`)
        .setImage(randSozinho)
        .setThumbnail(ctx.message.author.displayAvatarURL())
        .setFooter(ctx.locale('commands:sarrar.no-mention.embed_footer'))
        .setAuthor(ctx.message.author.tag, ctx.message.author.displayAvatarURL());

      return ctx.send(embed).then((msg) => {
        msg.react('✅').catch();
        const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id !== ctx.message.author.id && !usuario.bot;

        const coletor = msg.createReactionCollector(filter, { max: 1, time: 30000 });

        coletor.on('collect', (_, colectorUser) => {
          msg.delete().catch();
          SarrarCommand.sarrada(ctx, colectorUser);
        });
      });
    } return SarrarCommand.sarrada(ctx, ctx.message.mentions.users.first());
  }

  static async sarrada(ctx, reactUser) {
    const rand = await getImageUrl('sarrar');

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const Embed = new MessageEmbed()

      .setTitle(ctx.locale('commands:sarrar.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:sarrar.embed_description')} ${reactUser}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(Embed);
  }
};
