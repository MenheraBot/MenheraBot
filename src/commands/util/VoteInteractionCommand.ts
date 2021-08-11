import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';

export default class VoteInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'votar',
      description: '「🆙」・Veja o link para votar em mim. Vote e receba prêmios UwU',
      category: 'util',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:vote.embed_title'))
      .setColor('#f763f8')
      .setURL('https://top.gg/bot/708014856711962654/vote')
      .setImage('https://i.imgur.com/27GxqX1.jpg')
      .setDescription(ctx.locale('commands:vote.embed_description'))
      .setFooter(
        ctx.locale('commands:vote.embed_footer', { author: ctx.interaction.user.tag }),
        ctx.interaction.user.displayAvatarURL(),
      )
      .setTimestamp();

    await ctx.reply({ embeds: [embed] });
  }
}