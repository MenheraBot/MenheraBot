import http from '@utils/HTTPrequests';
import { MessageAttachment, MessageEmbed, MessageReaction, User } from 'discord.js';
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

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;
    if (authorData.trisal?.length === 0 && !ctx.args[1]) {
      await ctx.replyT('error', 'commands:trisal.no-args');
      return;
    }

    if (authorData.trisal?.length > 0) {
      const marryTwo = await this.client.users.fetch(authorData.trisal[0]);
      const marryThree = await this.client.users.fetch(authorData.trisal[1]);

      if (!marryTwo || !marryThree) {
        await ctx.replyT('error', 'commands:trisal.marry-not-found');
        return;
      }

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
      if (res.err) {
        await ctx.replyT('error', 'commands:http-error');
        return;
      }

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

      await ctx.send(embed);
      return;
    }

    const [mencionado1, mencionado2] = ctx.message.mentions.users.keyArray();

    if (!mencionado1 || !mencionado2) {
      await ctx.replyT('error', 'commands:trisal.no-mention');
      return;
    }
    if (mencionado1 === ctx.message.author.id || mencionado2 === ctx.message.author.id) {
      await ctx.replyT('error', 'commands:trisal.self-mention');
      return;
    }
    if (mencionado1 === mencionado2) {
      await ctx.replyT('error', 'commands:trisal:same-mention');
      return;
    }

    const user1 = authorData;
    const user2 = await this.client.repositories.userRepository.find(mencionado1);
    const user3 = await this.client.repositories.userRepository.find(mencionado2);

    if (!user1 || !user2 || !user3) {
      await ctx.replyT('error', 'commands:trisal.no-db');
      return;
    }

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0) {
      await ctx.replyT('error', 'commands:trisal.comedor-de-casadas');
      return;
    }

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
