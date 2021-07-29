import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { emojis } from '@structures/MenheraConstants';

export default class SarrarCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'sarrar',
      aliases: ['dance'],
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
      category: 'ações',
    });
  }

  static async sarrada(ctx: CommandContext, reactUser: User): Promise<Message> {
    const rand = await http.getAssetImageUrl('sarrar');

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const Embed = new MessageEmbed()

      .setTitle(ctx.locale('commands:sarrar.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:sarrar.embed_description')} ${reactUser}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    return ctx.send(Embed);
  }

  async run(ctx: CommandContext): Promise<void> {
    const user = ctx.message.mentions.users.first();

    if (!user) {
      const randSozinho = await http.getAssetImageUrl('sarrar_sozinho');
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:sarrar.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.locale('commands:sarrar.no-mention.embed_description_start')} ${
            ctx.message.author
          }?\n${ctx.locale('commands:sarrar.no-mention.embed_description_end')}`,
        )
        .setImage(randSozinho)
        .setThumbnail(ctx.message.author.displayAvatarURL())
        .setFooter(ctx.locale('commands:sarrar.no-mention.embed_footer'))
        .setAuthor(ctx.message.author.tag, ctx.message.author.displayAvatarURL());

      await ctx.send(embed).then(async (msg) => {
        await msg.react(emojis.yes).catch();
        const filter = (reaction: MessageReaction, usuario: User) =>
          reaction.emoji.name === emojis.yes &&
          usuario.id !== ctx.message.author.id &&
          !usuario.bot;

        const coletor = msg.createReactionCollector(filter, { max: 1, time: 30000 });

        coletor.on('collect', (_, colectorUser) => {
          SarrarCommand.sarrada(ctx, colectorUser);
          msg.delete();
        });
      });
    } else await SarrarCommand.sarrada(ctx, user);
  }
}
