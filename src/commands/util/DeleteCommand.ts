import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import { emojis } from '@structures/MenheraConstants';
import { MessageReaction, User } from 'discord.js';

export default class DeleteCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'delete',
      aliases: ['deletar'],
      cooldown: 30,
      category: 'util',
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx) {
    ctx.replyT('warn', 'commands:delete.confirm').then(async (msg) => {
      msg.react(emojis.yes).catch();
      msg.react(emojis.no).catch();

      const filter = (reaction: MessageReaction, usuario: User) =>
        reaction.emoji.name === emojis.yes && usuario.id === ctx.message.author.id;
      const filter1 = (reação: MessageReaction, user: User) =>
        reação.emoji.name === emojis.no && user.id === ctx.message.author.id;

      const ncoletor = msg.createReactionCollector(filter1, { max: 1, time: 5000 });
      const coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 });

      ncoletor.on('collect', () => {
        ctx.replyT('success', 'commands:delete.negated');
      });

      coletor.on('collect', async () => {
        await this.client.repositories.userRepository.delete(ctx.message.author.id);
        ctx.replyT('success', 'commands:delete.acepted');
      });
      setTimeout(() => {
        msg.delete().catch();
      }, 5050);
    });
  }
}
