import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class InviteInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'convidar',
      description: '「🥳」・Veja o link de convite para me adicionar em algum servidor',
      category: 'util',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:convidar.embed_title'))
      .setColor('#f763f8')
      .setURL(
        'https://discord.com/api/oauth2/authorize?client_id=708014856711962654&permissions=260608224336&scope=applications.commands%20bot',
      )
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setDescription(ctx.locale('commands:convidar.embed_description'))
      .setFooter(
        ctx.locale('commands:convidar.embed_footer', { user: ctx.author.tag }),
        ctx.author.displayAvatarURL(),
      )
      .setTimestamp();

    await ctx.makeMessage({ embeds: [embed] });
  }
}
