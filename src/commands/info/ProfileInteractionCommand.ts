import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserDataToProfile, IUserSchema } from '@utils/Types';
import HttpRequests from '@utils/HTTPrequests';
import { MessageAttachment } from 'discord.js-light';

export default class ProfileInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'perfil',
      description: '「✨」・Mostra o perfil de algúem',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para mostrar o perfil',
          required: false,
        },
      ],
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: [
        'married',
        'selectedColor',
        'votes',
        'info',
        'voteCooldown',
        'badges',
        'marriedDate',
        'mamado',
        'mamou',
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    let { user }: { user: IUserSchema | null } = ctx.data;
    const member = ctx.options.getUser('user') ?? ctx.author;

    if (member.id !== ctx.author.id) {
      if (member.bot) {
        await ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:perfil.bot'),
          ephemeral: true,
        });
        return;
      }
      user = await ctx.client.repositories.userRepository.find(member.id, [
        'married',
        'selectedColor',
        'votes',
        'info',
        'voteCooldown',
        'badges',
        'marriedDate',
        'mamado',
        'mamou',
        'ban',
        'banReason',
      ]);
    }

    if (!user) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (user.ban && ctx.author.id !== process.env.OWNER) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.banned', { reason: user.banReason }),
        ephemeral: true,
      });
      return;
    }

    const marry = user.married ? await ctx.client.users.fetch(user.married) : null;

    await ctx.defer();

    const avatar = member.displayAvatarURL({ format: 'png' });
    const usageCommands = await HttpRequests.getProfileCommands(member.id);

    const userSendData: IUserDataToProfile = {
      cor: user.selectedColor,
      avatar,
      votos: user.votes,
      nota: user.info,
      tag: member.tag,
      flagsArray: member.flags?.toArray() ?? ['NONE'],
      casado: user.married as string,
      voteCooldown: user.voteCooldown as number,
      badges: user.badges,
      username: member.username,
      data: user.marriedDate as string,
      mamadas: user.mamado,
      mamou: user.mamou,
    };

    const i18nData = {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      zero: ctx.locale('commands:perfil.zero'),
      um: ctx.locale('commands:perfil.um'),
      dois: ctx.locale('commands:perfil.dois'),
      tres: ctx.locale('commands:perfil.tres'),
    };

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'profile',
          data: { user: userSendData, marry, usageCommands, i18n: i18nData },
        })
      : await HttpRequests.profileRequest(userSendData, marry, usageCommands, i18nData);

    if (res.err) {
      await ctx.makeMessage({ content: ctx.prettyResponseLocale('error', 'commands:http-error') });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'profile.png')],
    });
  }
}
