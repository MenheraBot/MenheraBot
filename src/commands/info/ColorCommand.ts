import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../structures/Command';

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

  async run(ctx: CommandContext) {
    const authorData = ctx.data.user;

    const haspadrao = authorData.cores.filter((pc) => pc.cor === '#a788ff');

    if (haspadrao.length === 0) {
      authorData.cores.push({
        nome: '0 - Padrão',
        cor: '#a788ff',
        price: 0,
      });
      authorData.save().then();
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
    if (!ctx.args[0]) return ctx.sendC(ctx.message.author.toString(), embed);

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

      ctx.sendC(ctx.message.author.toString(), { embed: dataChoose });
      authorData.cor = findColor[0].cor;
      authorData.save();
    } else ctx.replyT('error', 'commands:color.no-own', { prefix: ctx.data.server.prefix });
  }
}
