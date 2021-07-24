import moment from 'moment';
import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
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

  async run(ctx: CommandContext) {
    const authorData = ctx.data.user;

    const mencionado = ctx.message.mentions.users.first();

    if (!mencionado) return ctx.replyT('error', 'commands:marry.no-mention');
    if (mencionado.bot) return ctx.replyT('error', 'commands:marry.bot');
    if (mencionado.id === ctx.message.author.id)
      return ctx.replyT('error', 'commands:marry.self-mention');

    if (authorData.casado && authorData.casado !== 'false')
      return ctx.replyT('error', 'commands:marry.married');

    const user2 = await this.client.repositories.userRepository.findOrCreate(mencionado.id);

    if (!user2) return ctx.replyT('warn', 'commands:marry.no-dbuser');

    if (user2.casado && user2.casado !== 'false')
      return ctx.replyT('error', 'commands:marry.mention-married');

    ctx
      .send(
        `${mencionado} ${ctx.locale('commands:marry.confirmation_start')} ${
          ctx.message.author
        }? ${ctx.locale('commands:marry.confirmation_end')}`,
      )
      .then(async (msg) => {
        msg.react(emojis.yes);
        msg.react(emojis.no);

        const validReactions = [emojis.no, emojis.yes];

        const filter = (reaction: MessageReaction, usuario: User) =>
          validReactions.includes(reaction.emoji.name) && usuario.id === mencionado.id;

        const colector = await msg.createReactionCollector(filter, { max: 1, time: 15000 });

        colector.on('collect', async (reaction) => {
          if (reaction.emoji.name === emojis.no)
            return ctx.send(
              `${mencionado} ${ctx.locale('commands:marry.negated')} ${ctx.message.author}`,
            );

          ctx.send(
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
