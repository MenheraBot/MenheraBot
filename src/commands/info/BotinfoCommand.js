const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../structures/command');
const http = require('../../utils/HTTPrequests');
require('moment-duration-format');
const { version } = require('../../../package.json');

module.exports = class BotinfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'botinfo',
      aliases: ['menhera'],
      cooldown: 10,
      category: 'info',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx) {
    const owner = await this.client.users.fetch(process.env.OWNER);
    const commandsExecuted = await http.getCommands();
    if (ctx.data.server.lang === 'pt-BR') {
      moment.locale('pt-br');
    } else moment.locale('en-us');

    const memoryUsedGross = await this.client.shard.broadcastEval('process.memoryUsage().heapUsed');
    const memoryUsedPolish = memoryUsedGross.reduce((a, b) => a + b, 0);

    const embed = new MessageEmbed()
      .setColor('#fa8dd7')
      // .setTitle(t('commands:botinfo.title'))
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setDescription(ctx.locale('commands:botinfo.embed_description', {
        name: this.client.user.username, createdAt: moment.utc(this.client.user.createdAt).format('LLLL'), joinedAt: moment.utc(ctx.message.guild.me.joinedAt).format('LLLL'), cmds: commandsExecuted,
      }))
      .setFooter(`${this.client.user.username} ${ctx.locale('commands:botinfo.embed_footer')} ${owner.tag}`, owner.displayAvatarURL({
        format: 'png',
        dynamic: true,
      }))
      .addFields([{
        name: '🌐 | Servers | 🌐',
        value: `\`\`\`${await this.client.shardManager.getAllSizeObject('guilds')}\`\`\``,
        inline: true,
      },
      {
        name: `🗄️ | ${ctx.locale('commands:botinfo.channels')} | 🗄️`,
        value: `\`\`\`${await this.client.shardManager.getAllSizeObject('channels')}\`\`\``,
        inline: true,
      },
      {
        name: '⏳ | Uptime | ⏳',
        value: `\`\`\`${moment.duration(this.client.uptime).format('D[d], H[h], m[m], s[s]')}\`\`\``,
        inline: true,
      },
      {
        name: `<:memoryram:762817135394553876> | ${ctx.locale('commands:botinfo.memory')} | <:memoryram:762817135394553876>`,
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
};
