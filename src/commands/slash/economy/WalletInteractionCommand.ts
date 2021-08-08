import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class WalletInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'carteira',
      description: '「💳」・Mostra a carteira de alguém',
      options: [
        {
          name: 'user',
          description: 'Usuário para mostrar a carteira',
          type: 'USER',
          required: false,
        },
      ],
      category: 'economy',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const pessoa = ctx.args[0]?.user ?? ctx.interaction.user;

    const user = await this.client.repositories.userRepository.find(pessoa.id);
    if (!user) {
      await ctx.replyT('error', 'commands:wallet.no-dbuser', {}, true);
      return;
    }

    let cor;

    if (user.cor) {
      cor = user.cor;
    } else cor = '#a788ff' as const;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:wallet.title', { user: pessoa.tag }))
      .setColor(cor)
      .addFields([
        {
          name: `⭐ | ${ctx.locale('commands:wallet.stars')}`,
          value: `**${user.estrelinhas}**`,
          inline: true,
        },
        {
          name: `🔑 | ${ctx.locale('commands:wallet.rolls')}`,
          value: `**${user.rolls}**`,
          inline: true,
        },
        {
          name: `<:DEMON:758765044443381780> | ${ctx.locale('commands:wallet.demons')} `,
          value: `**${user.caçados}**`,
          inline: true,
        },
        {
          name: `<:ANGEL:758765044204437535> | ${ctx.locale('commands:wallet.angels')}`,
          value: `**${user.anjos}**`,
          inline: true,
        },
        {
          name: `<:SemiGod:758766732235374674> | ${ctx.locale('commands:wallet.sd')}`,
          value: `**${user.semideuses}**`,
          inline: true,
        },
        {
          name: `<:God:758474639570894899> | ${ctx.locale('commands:wallet.god')}`,
          value: `**${user.deuses}**`,
          inline: true,
        },
      ]);

    const rpguser = await this.client.repositories.rpgRepository.find(user.id);
    if (rpguser && rpguser.resetRoll)
      embed.addField(
        `🔑 | RPG ${ctx.locale('commands:wallet.rolls')}`,
        `**${rpguser.resetRoll}**`,
        true,
      );

    await ctx.reply({ embeds: [embed] });
  }
}
