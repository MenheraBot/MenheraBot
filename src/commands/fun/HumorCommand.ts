import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import CommandContext from '@structures/CommandContext';

export default class HumorCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'humor',
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext) {
    if (ctx.message.deletable) ctx.message.delete();

    const rand = await http.getAssetImageUrl('humor');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setTitle(`${ctx.message.author.username} ${ctx.locale('commands:humor.phrase')}`);

    ctx.send(embed);
  }
}
