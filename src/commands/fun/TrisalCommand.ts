import http from '@utils/HTTPrequests';
import { Message, MessageAttachment, MessageEmbed, MessageReaction, User } from 'discord.js';
import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { emojis } from '@structures/MenheraConstants';

export default class TrisalCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'trisal',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const authorData = ctx.data.user;
    if (authorData.trisal?.length === 0 && !ctx.args[1])
      return ctx.replyT('error', 'commands:trisal.no-args');

    if (authorData.trisal?.length > 0) {
      const marryTwo = await this.client.users.fetch(authorData.trisal[0]);
      const marryThree = await this.client.users.fetch(authorData.trisal[1]);

      if (!marryTwo || !marryThree) return ctx.replyT('error', 'commands:trisal.marry-not-found');

      const userOneAvatar = ctx.message.author.displayAvatarURL({
        dynamic: false,
        size: 256,
        format: 'png',
      });
      const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userThreeAvatar = marryThree.displayAvatarURL({
        dynamic: false,
        size: 256,
        format: 'png',
      });

      const res = await http.trisalRequest(userOneAvatar, userTwoAvatar, userThreeAvatar);
      if (res.err) return ctx.replyT('error', 'commands:http-error');

      const attachment = new MessageAttachment(Buffer.from(res.data as Buffer), 'trisal.png');

      const embed = new MessageEmbed()
        .attachFiles([attachment])
        .setDescription(
          `${ctx.locale('commands:trisal.embed.description')} ${
            ctx.message.author
          }, ${marryTwo}, ${marryThree}`,
        )
        .setColor('#ac76f9')
        .setImage('attachment://trisal.png');

      return ctx.send(embed);
    }

    const [mencionado1, mencionado2] = ctx.message.mentions.users.keyArray();

    if (!mencionado1 || !mencionado2) return ctx.replyT('error', 'commands:trisal.no-mention');
    if (mencionado1 === ctx.message.author.id || mencionado2 === ctx.message.author.id)
      return ctx.replyT('error', 'commands:trisal.self-mention');
    if (mencionado1 === mencionado2) return ctx.replyT('error', 'commands:trisal:same-mention');

    const user1 = authorData;
    const user2 = await this.client.repositories.userRepository.find(mencionado1);
    const user3 = await this.client.repositories.userRepository.find(mencionado2);

    if (!user1 || !user2 || !user3) return ctx.replyT('error', 'commands:trisal.no-db');

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0)
      return ctx.replyT('error', 'commands:trisal.comedor-de-casadas');

    const messageMention1 = await this.client.users.fetch(mencionado1);
    const messageMention2 = await this.client.users.fetch(mencionado2);

    const msg = await ctx.send(
      `${ctx.locale('commands:trisal.accept-message')} ${
        ctx.message.author
      }, ${messageMention1}, ${messageMention2}`,
    );
    await msg.react(emojis.yes);

    const acceptableIds = [ctx.message.author.id, mencionado1, mencionado2];

    const filter = (reaction: MessageReaction, usuario: User) =>
      reaction.emoji.name === emojis.yes && acceptableIds.includes(usuario.id);

    const collector = msg.createReactionCollector(filter, { time: 14000 });

    const acceptedIds: string[] = [];

    collector.on('collect', async (_reaction, user) => {
      if (!acceptedIds.includes(user.id)) acceptedIds.push(user.id);

      if (acceptedIds.length === 3) {
        await ctx.replyT('success', 'commands:trisal.done');
        await this.client.repositories.relationshipRepository.trisal(user1.id, user2.id, user3.id);
      }
    });

    setTimeout(() => {
      if (acceptedIds.length !== 3) ctx.replyT('error', 'commands:trisal.error');
    }, 15000);
  }
}
