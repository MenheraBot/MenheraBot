import MenheraClient from 'MenheraClient';

import { resolve } from 'path';
import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';

export default class AudioCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'audio',
      category: 'diversão',
      cooldown: 15,
      clientPermissions: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
    });
  }

  async run(ctx: CommandContext) {
    const { voice } = ctx.message.member;
    if (!voice.channelID) return ctx.replyT('error', 'commands:audio.not-in-voice');

    const availableFiles = ['gemidao', 'among', 'rojao', 'wpp', 'yamete', 'atumalaca', 'ratinho'];

    if (!ctx.args[0])
      return ctx.replyT('error', 'commands:audio.no-args', { audios: availableFiles.join('`, `') });

    if (!availableFiles.includes(ctx.args[0]))
      return ctx.replyT('error', 'commands:audio.unknow-args', {
        audios: availableFiles.join('`, `'),
      });

    ctx.message.react('🍰');

    let dis;

    try {
      await ctx.message.member.voice.channel.join().then(async (conn) => {
        const audioLocal = resolve(`src/media/audio/${ctx.args[0]}.mp3`);
        dis = conn.play(audioLocal);
      });
    } catch {
      ctx.replyT('error', 'commands:audio.no-perm');
    }

    if (dis) {
      try {
        dis.on('finish', () => {
          if (ctx.message.guild.me.voice.channelID) ctx.message.guild.me.voice.channel.leave();
        });
      } catch {
        // sim
      }
    }
  }
}
