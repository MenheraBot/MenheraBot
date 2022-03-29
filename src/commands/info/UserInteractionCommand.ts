/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import { GuildMember, MessageEmbed } from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { debugError } from '@utils/Util';

export default class UserInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'user',
      description: '「📸」・Mostra as imagens do perfil de alguém',
      category: 'info',
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'avatar',
          description: '「📸」・Mostra o avatar de alguém',
          options: [
            {
              type: 'USER',
              name: 'user',
              description: 'Usuário para mostrar a foto de perfil',
              required: false,
            },
            {
              type: 'BOOLEAN',
              name: 'servidor',
              description: 'Você quer ver o ícone do usuário neste servidor?',
              required: false,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'banner',
          description: '「📸」・Mostra o banner de alguém',
          options: [
            {
              type: 'USER',
              name: 'user',
              description: 'Usuário para mostrar o banner',
              required: false,
            },
          ],
        },
      ],
      cooldown: 5,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const imageType = ctx.options.getSubcommand();

    if (imageType === 'banner') return UserInteractionCommand.showBanner(ctx);

    const fromServer = ctx.options.getBoolean('servidor', false);

    const user =
      (fromServer ? ctx.options.getMember('user', false) : ctx.options.getUser('user')) ??
      ctx.author;

    const username = user instanceof GuildMember ? user.user.username : user.username;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:user.title', { user: username }))
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(ctx.data.user.selectedColor)
      .setFooter({ text: ctx.locale('commands:user.footer') });

    if (user.id === ctx.client.user?.id) {
      embed.setTitle(ctx.locale('commands:user.client_title', { user: username }));
      embed.setColor('#f276f3');
      embed.setFooter({ text: ctx.locale('commands:user.client_footer') });
    }

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async showBanner(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const userBanner = await ctx.client.users.fetch(user.id).catch(debugError);

    const bannerUrl = userBanner?.bannerURL({ dynamic: true, size: 1024 });

    if (!userBanner || !bannerUrl) {
      ctx.makeMessage({ content: ctx.locale('commands:user.banner.no-banner'), ephemeral: true });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:user.banner.title', { user: user.username }))
      .setImage(bannerUrl)
      .setColor(ctx.data.user.selectedColor)
      .setFooter({ text: ctx.locale('commands:user.banner.footer') });

    await ctx.makeMessage({ embeds: [embed] });
  }
}
