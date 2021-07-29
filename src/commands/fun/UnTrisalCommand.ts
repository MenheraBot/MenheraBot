import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import { emojis } from '@structures/MenheraConstants';
import CommandContext from '@structures/CommandContext';
import { Message, MessageReaction, User } from 'discord.js';

export default class UnTrisalCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'untrisal',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['ADD_REACTIONS'],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    if (ctx.data.user.trisal?.length === 0) return ctx.replyT('error', 'commands:untrisal.error');

    const msg = await ctx.send(ctx.locale('commands:untrisal.sure'));
    await msg.react(emojis.yes);

    const filter = (reaction: MessageReaction, usuario: User) =>
      reaction.emoji.name === emojis.yes && usuario.id === ctx.message.author.id;

    const collector = msg.createReactionCollector(filter, { max: 1, time: 14000 });

    collector.on('collect', async () => {
      await this.client.repositories.relationshipRepository.untrisal(
        ctx.message.author.id,
        ctx.data.user.trisal[0],
        ctx.data.user.trisal[1],
      );
      return ctx.replyT('success', 'commands:untrisal.done');
    });
  }
}
