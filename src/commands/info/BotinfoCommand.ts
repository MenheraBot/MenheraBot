import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '@structures/Command';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { version } from '../../../package.json';

export default class BotinfoCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'botinfo',
      aliases: ['menhera'],
      cooldown: 10,
      category: 'info',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async getAllSizeObject(collection: string): Promise<number> {
    const info = await this.client.shard.fetchClientValues(`${collection}.cache.size`);
    const i = info.reduce((prev, val) => prev + val);
    return i;
  }

  async run(ctx: CommandContext) {
    const owner = await this.client.users.fetch(process.env.OWNER);
    if (ctx.data.server.lang === 'pt-BR') {
      moment.locale('pt-br');
    } else moment.locale('en-us');

    const memoryUsedGross = await this.client.shard.broadcastEval('process.memoryUsage().heapUsed');
    const memoryUsedPolish = memoryUsedGross.reduce((a, b) => a + b, 0);

    const embed = new MessageEmbed()
      .setColor('#fa8dd7')
      // .setTitle(t('commands:botinfo.title'))
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setDescription(
        ctx.locale('commands:botinfo.embed_description', {
          name: this.client.user.username,
          createdAt: moment.utc(this.client.user.createdAt).format('LLLL'),
          joinedAt: moment.utc(ctx.message.guild.me.joinedAt).format('LLLL'),
        }),
      )
      .setFooter(
        `${this.client.user.username} ${ctx.locale('commands:botinfo.embed_footer')} ${owner.tag}`,
        owner.displayAvatarURL({
          format: 'png',
          dynamic: true,
        }),
      )
      .addFields([
        {
          name: '🌐 | Servers | 🌐',
          value: `\`\`\`${await this.getAllSizeObject('guilds')}\`\`\``,
          inline: true,
        },
        {
          name: `🗄️ | ${ctx.locale('commands:botinfo.channels')} | 🗄️`,
          value: `\`\`\`${await this.getAllSizeObject('channels')}\`\`\``,
          inline: true,
        },
        {
          name: '⏳ | Uptime | ⏳',
          value: `\`\`\`${moment
            .duration(this.client.uptime)
            .format('D[d], H[h], m[m], s[s]')}\`\`\``,
          inline: true,
        },
        {
          name: `<:memoryram:762817135394553876> | ${ctx.locale(
            'commands:botinfo.memory',
          )} | <:memoryram:762817135394553876>`,
          value: `\`\`\`${(memoryUsedPolish / 1024 / 1024).toFixed(2)}MB\`\`\``,
          inline: true,
        },
        {
          name: `🇧🇷 | ${ctx.locale('commands:botinfo.version')} | 🇧🇷`,
          value: `\`\`\`${version}\`\`\``,
          inline: true,
        },
      ]);
    ctx.send(embed);
  }
}
