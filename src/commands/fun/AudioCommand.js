const { resolve } = require('path');
const Command = require('../../structures/command');

module.exports = class AudioCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'audio',
      category: 'diversão',
      cooldown: 15,
      clientPermissions: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
    });
  }

  async run({ message, args }, t) {
    const { voice } = message.member;
    if (!voice.channelID) return message.menheraReply('error', t('commands:audio.not-in-voice'));

    const availableFiles = ['gemidao', 'among', 'rojao', 'wpp', 'yamete', 'atumalaca'];

    if (!args[0]) return message.menheraReply('error', t('commands:audio.no-args', { audios: availableFiles.join('`, `') }));

    if (!availableFiles.includes(args[0])) return message.menheraReply('error', t('commands:audio.unknow-args', { audios: availableFiles.join('`, `') }));

    message.react('🍰');

    let dis;

    try {
      await message.member.voice.channel.join().then(async (conn) => {
        const audioLocal = resolve(`src/media/audio/${args[0]}.mp3`);
        dis = await conn.play(audioLocal);
      });
    } catch {
      message.menheraReply('error', t('commands:audio.no-perm'));
    }

    if (dis) {
      dis.on('finish', () => {
        if (message.guild.me.voice.channelID) message.guild.me.voice.channel.leave();
      });
    }
  }
};
