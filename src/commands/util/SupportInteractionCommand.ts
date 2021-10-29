import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class SupportInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'suporte',
      description: '「🙋」・Precisa de ajuda? Entre no meu servidor de suporte',
      category: 'util',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setURL('https://discord.gg/fZMdQbA')
      .setColor('#970045')
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setTimestamp();
    await ctx.makeMessage({ embeds: [embed], ephemeral: true });
  }
}
