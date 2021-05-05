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
    if (!args[0]) return message.menheraReply('error', t('commands:audio.no-args'));

    let file = 'gemidao';
    switch (args[0]) {
      case 'gemidao':
        file = 'gemidao';
        break;
      case 'among':
        file = 'among';
        break;
      case 'rojao':
        file = 'rojao';
        break;
      case 'wpp':
        file = 'wpp';
        break;
      case 'yamete':
        file = 'yamete';
        break;
      default: return message.menheraReply('error', t('commands:audio.unknow-args'));
    }

    let dis;

    await message.member.voice.channel.join().then((conn) => {
      const audioLocal = resolve(`src/media/audio/${file}.mp3`);
      dis = conn.play(audioLocal);
    });

    dis.on('finish', () => {
      if (message.guild.me.voice.channelID) message.guild.me.voice.channel.leave();
    });
  }
};
