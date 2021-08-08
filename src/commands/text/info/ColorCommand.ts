import CommandContext from '@structures/command/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../../structures/command/Command';

export default class ColorCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'color',
      aliases: ['cor'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;

    const haspadrao = authorData.cores.some((pc) => pc.cor === '#a788ff');

    if (!haspadrao) {
      await this.client.repositories.userRepository.update(ctx.message.author.id, {
        $push: { cores: { nome: '0 - Padrão', cor: '#a788ff', price: 0 } },
      });
    }
    const embed = new MessageEmbed()
      .setTitle(`🏳️‍🌈 | ${ctx.locale('commands:color.embed_title')}`)
      .setColor('#aee285')
      .setDescription(
        ctx.locale('commands:color.embed_description', { prefix: ctx.data.server.prefix }),
      );

    const validArgs = [];

    for (let i = 0; i < authorData.cores.length; i++) {
      embed.addField(`${authorData.cores[i].nome}`, `${authorData.cores[i].cor}`);
      validArgs.push(authorData.cores[i].nome.replace(/[^\d]+/g, ''));
    }
    if (!ctx.args[0]) {
      await ctx.sendC(ctx.message.author.toString(), embed);
      return;
    }

    if (validArgs.includes(ctx.args[0])) {
      const findColor = authorData.cores.filter(
        (cor) => cor.nome.startsWith(ctx.args[0]) || cor.nome.startsWith(`**${ctx.args[0]}`),
      );

      const dataChoose = {
        title: ctx.locale('commands:color.dataChoose.title'),
        description: ctx.locale('commands:color.dataChoose.title'),
        color: findColor[0].cor,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
      };
      await this.client.repositories.userRepository.update(ctx.message.author.id, {
        cor: findColor[0].cor,
      });
      await ctx.sendC(ctx.message.author.toString(), { embeds: [dataChoose] });
      return;
    }
    await ctx.replyT('error', 'commands:color.no-own', { prefix: ctx.data.server.prefix });
  }
}
