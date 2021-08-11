import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';

export default class InviteInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'convidar',
      description: '「🥳」・Veja o link de convite para me adicionar em algum servidor',
      category: 'util',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:invite.embed_title'))
      .setColor('#f763f8')
      .setURL(
        'https://discord.com/api/oauth2/authorize?client_id=708014856711962654&permissions=260608224336&scope=applications.commands%20bot',
      )
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setDescription(ctx.locale('commands:invite.embed_description'))
      .setFooter(
        ctx.locale('commands:invite.embed_footer', { user: ctx.interaction.user.tag }),
        ctx.interaction.user.displayAvatarURL(),
      )
      .setTimestamp();

    await ctx.reply({ embeds: [embed] });
  }
}
