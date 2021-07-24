import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

export default class InviteCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'invite',
      aliases: ['adicionar'],
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext) {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:invite.embed_title'))
      .setColor('#f763f8')
      .setURL(
        'https://discord.com/api/oauth2/authorize?client_id=708014856711962654&permissions=1007025271&scope=bot',
      )
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setDescription(ctx.locale('commands:invite.embed_description'))
      .setFooter(
        ctx.locale('commands:invite.embed_footer', { user: ctx.message.author.tag }),
        ctx.message.author.displayAvatarURL(),
      )
      .setTimestamp();

    ctx.send(embed).catch(() => null);
  }
}
