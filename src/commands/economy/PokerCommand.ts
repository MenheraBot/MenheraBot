import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import { actionRow } from '@utils/Util';
import { MessageButton, MessageEmbed, User } from 'discord.js-light';

export default class PokerCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'poker',
      description: '「🃏」・Inicia uma partida de poker',
      descriptionLocalizations: { 'en-US': '「🃏」・Start a poker match' },
      options: [
        {
          type: 'STRING',
          name: 'partida',
          nameLocalizations: { 'en-US': 'match' },
          description: 'Privacidade da partida',
          descriptionLocalizations: { 'en-US': 'Privacy of the match' },
          choices: [
            { name: 'Pública', nameLocalizations: { 'en-US': 'Public' }, value: 'public' },
            { name: 'Privada', nameLocalizations: { 'en-US': 'Private' }, value: 'private' },
            { name: 'Aberta', nameLocalizations: { 'en-US': 'Open' }, value: 'open' },
          ],
          required: true,
        },
        {
          type: 'USER',
          name: 'jogador_1',
          nameLocalizations: { 'en-US': 'player_1' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
        {
          type: 'USER',
          name: 'jogador_2',
          nameLocalizations: { 'en-US': 'player_2' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
        {
          type: 'USER',
          name: 'jogador_3',
          nameLocalizations: { 'en-US': 'player_3' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
        {
          type: 'USER',
          name: 'jogador_4',
          nameLocalizations: { 'en-US': 'player_4' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
        {
          type: 'USER',
          name: 'jogador_5',
          nameLocalizations: { 'en-US': 'player_5' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
        {
          type: 'USER',
          name: 'jogador_6',
          nameLocalizations: { 'en-US': 'player_6' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
        {
          type: 'USER',
          name: 'jogador_7',
          nameLocalizations: { 'en-US': 'player_7' },
          description: 'Caso a partida seja privada, especifique os jogadores',
          descriptionLocalizations: { 'en-US': 'If the match is private, specify the players' },
          required: false,
        },
      ],
      category: 'economy',
      cooldown: 5,
      authorDataFields: [],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const matchPrivacy = ctx.options.getString('partida', true);

    switch (matchPrivacy) {
      case 'public':
        ctx.makeMessage({
          ephemeral: true,
          content: ctx.locale('commands:poker.public-not-released'),
        });
        return;
      case 'private':
        return PokerCommand.setupPrivateMatch(ctx);
      case 'open':
        ctx.makeMessage({ content: 'Partida aberta' });
        break;
    }
  }

  static async setupPrivateMatch(ctx: InteractionCommandContext): Promise<void> {
    const toMatchPlayer = ctx.options.data
      .reduce<User[]>((p, c) => {
        if (!c.name.startsWith('jogador_')) return p;
        if (p.some((b) => b.id === c.user?.id)) return p;
        if (c.user?.id === ctx.author.id) return p;
        p.push(c.user as User);
        return p;
      }, [])
      .concat(ctx.author);

    if (toMatchPlayer.length < 2) {
      ctx.makeMessage({
        ephemeral: true,
        content: ctx.locale('commands:poker.private-not-enough-players'),
      });
      return;
    }

    const canUsersPlay = await Promise.all(
      toMatchPlayer.map(async (u) => ({
        user: u,
        isPlaying: await ctx.client.repositories.pokerRepository.isUserInPokerMatch(u.id),
      })),
    );

    if (canUsersPlay.some((u) => u.isPlaying)) {
      ctx.makeMessage({
        ephemeral: true,
        content: ctx.locale('commands:poker.private-users-already-in-match', {
          users: canUsersPlay
            .filter((u) => u.isPlaying)
            .map((u) => u.user.username)
            .join(', '),
        }),
      });
      return;
    }

    const enterButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ENTER`)
      .setLabel(ctx.locale('commands:poker.accept-match'))
      .setStyle('SUCCESS');

    const startButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | START`)
      .setLabel(ctx.locale('commands:poker.start-match'))
      .setStyle('PRIMARY');

    const cancelButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | CANCEL`)
      .setLabel(ctx.locale('commands:poker.cancel-match'))
      .setStyle('DANGER');

    const accepted = [ctx.author.id];

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:poker.private-accept-embed.title', { author: ctx.author.tag }))
      .setDescription(
        ctx.locale('commands:poker.private-accept-embed.description', {
          invites: toMatchPlayer.map((u) => `**${u.tag}**`).join(', '),
        }),
      )
      .addField(
        ctx.locale('commands:poker.private-accept-embed.inTable', {
          users: accepted.length,
          maxUsers: toMatchPlayer.length,
        }),
        accepted.map((a) => `• <@${a}>`).join('\n'),
      )
      .setColor(COLORS.Pinkie)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }));

    ctx.makeMessage({
      content: toMatchPlayer.map((u) => u.toString()).join(', '),
      embeds: [embed],
      components: [actionRow([enterButton, startButton, cancelButton])],
    });

    console.log('a');
  }
}
