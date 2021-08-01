import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { emojis } from '@structures/MenheraConstants';
import { Message, MessageReaction, User } from 'discord.js';

export default class DivorceCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'divorce',
      aliases: ['divorciar'],
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;

    if (authorData.casado && authorData.casado !== 'false') {
      return this.divorciar(ctx);
    }
    await ctx.replyT('warn', 'commands:divorce.author-single');
  }

  async divorciar(ctx: CommandContext): Promise<void> {
    const user2Mention = await this.client.users.fetch(ctx.data.user.casado);

    ctx
      .send(`${ctx.locale('commands:divorce.confirmation')} ${user2Mention}`)
      .then(async (msg: Message) => {
        await msg.react(emojis.yes);
        await msg.react(emojis.no);

        const validReactions = [emojis.no, emojis.yes];

        const filter = (reaction: MessageReaction, usuario: User) =>
          validReactions.includes(reaction.emoji.name) && usuario.id === ctx.message.author.id;

        const colector = msg.createReactionCollector(filter, { max: 1, time: 15000 });

        colector.on('collect', async (reaction) => {
          if (reaction.emoji.name === emojis.no)
            return ctx.replyT('success', ctx.locale('commands:divorce.canceled'));
          await ctx.send(
            `${ctx.message.author} ${ctx.locale(
              'commands:divorce.confirmed_start',
            )} ${user2Mention}. ${ctx.locale('commands:divorce.confirmed_end')}`,
          );

          await this.client.repositories.relationshipRepository.divorce(
            ctx.data.user.casado,
            ctx.message.author.id,
          );
        });
      });
  }
}
