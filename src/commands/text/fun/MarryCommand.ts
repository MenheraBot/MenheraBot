import moment from 'moment';
import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';
import { emojis } from '@structures/MenheraConstants';
import { MessageReaction, User } from 'discord.js';

export default class MarryCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'marry',
      aliases: ['casar'],
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;

    const mencionado = ctx.message.mentions.users.first();

    if (!mencionado) {
      await ctx.replyT('error', 'commands:marry.no-mention');
      return;
    }
    if (mencionado.bot) {
      await ctx.replyT('error', 'commands:marry.bot');
      return;
    }
    if (mencionado.id === ctx.message.author.id) {
      await ctx.replyT('error', 'commands:marry.self-mention');
      return;
    }

    if (authorData.casado && authorData.casado !== 'false') {
      await ctx.replyT('error', 'commands:marry.married');
      return;
    }

    const user2 = await this.client.repositories.userRepository.findOrCreate(mencionado.id);

    if (!user2) {
      await ctx.replyT('warn', 'commands:marry.no-dbuser');
      return;
    }

    if (user2.casado && user2.casado !== 'false') {
      await ctx.replyT('error', 'commands:marry.mention-married');
      return;
    }

    return ctx
      .send(
        `${mencionado} ${ctx.locale('commands:marry.confirmation_start')} ${
          ctx.message.author
        }? ${ctx.locale('commands:marry.confirmation_end')}`,
      )
      .then(async (msg) => {
        await msg.react(emojis.yes);
        await msg.react(emojis.no);

        const validReactions = [emojis.no, emojis.yes];

        const filter = (reaction: MessageReaction, usuario: User) => {
          if (!reaction.emoji.name) return false;
          return validReactions.includes(reaction.emoji.name) && usuario.id === mencionado.id;
        };

        const colector = msg.createReactionCollector({ filter, max: 1, time: 15000 });

        colector.on('collect', async (reaction) => {
          if (reaction.emoji.name === emojis.no)
            return ctx.send(
              `${mencionado} ${ctx.locale('commands:marry.negated')} ${ctx.message.author}`,
            );

          await ctx.send(
            `💍${ctx.message.author} ${ctx.locale('commands:marry.acepted')} ${mencionado}💍`,
          );

          moment.locale('pt-br');

          const dataFormated = moment(Date.now()).format('l LTS');

          await this.client.repositories.relationshipRepository.marry(
            ctx.message.author.id,
            mencionado.id,
            dataFormated,
          );
        });
      });
  }
}
