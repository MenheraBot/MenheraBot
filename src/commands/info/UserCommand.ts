/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import { GuildMember, MessageEmbed } from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { debugError } from '@utils/Util';

export default class UserCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'user',
      description: '「📸」・Mostra as imagens do perfil de alguém',
      descriptionLocalizations: { 'en-US': "「📸」・Show someone's profile pictures" },
      category: 'info',
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'avatar',
          description: '「📸」・Mostra o avatar de alguém',
          descriptionLocalizations: { 'en-US': "「📸」・Show someone's avatar" },
          options: [
            {
              type: 'USER',
              name: 'user',
              description: 'Usuário para mostrar a foto de perfil',
              descriptionLocalizations: { 'en-US': 'User to show profile picture' },
              required: false,
            },
            {
              type: 'BOOLEAN',
              name: 'servidor',
              nameLocalizations: { 'en-US': 'server' },
              description: 'Você quer ver o ícone do usuário neste servidor?',
              descriptionLocalizations: {
                'en-US': 'Do you want to see the user icon on this server?',
              },
              required: false,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'banner',
          description: '「📸」・Mostra o banner de alguém',
          descriptionLocalizations: { 'en-US': "「📸」・Show someone's banner" },
          options: [
            {
              type: 'USER',
              name: 'user',
              description: 'Usuário para mostrar o banner',
              descriptionLocalizations: { 'en-US': 'User to show banner' },
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

    if (imageType === 'banner') return UserCommand.showBanner(ctx);

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
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:user.banner.no-banner'),
        ephemeral: true,
      });
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
