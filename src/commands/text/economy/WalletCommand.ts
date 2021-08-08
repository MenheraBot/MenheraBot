import { MessageEmbed, User } from 'discord.js';
import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class WalletCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'wallet',
      aliases: ['carteira'],
      category: 'economia',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    let pessoa: User;

    if (ctx.args[0]) {
      try {
        pessoa = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
      } catch {
        await ctx.replyT('error', 'commands:wallet.unknow-user');
        return;
      }
    } else {
      pessoa = ctx.message.author;
    }

    const user = await this.client.repositories.userRepository.find(pessoa.id);
    if (!user) {
      await ctx.replyT('error', 'commands:wallet.no-dbuser');
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

    await ctx.sendC(ctx.message.author.toString(), embed);
  }
}
