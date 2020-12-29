const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      aliases: ['pcm'],
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message, args }, t) {
    let member;
    let avatar;
    if (args[0]) {
      member = await this.client.users.fetch(args[0].replace(/[<@!>]/g, '')).catch();
      if (!member) {
        member = message.author;
        avatar = member.displayAvatarURL({ format: 'png', dynamic: true });
      }
      avatar = member.avatar?.startsWith('a_') ? member.displayAvatarURL().replace('webp', 'gif') : member.displayAvatarURL().replace('webp', 'png');
    } else {
      member = message.author;
      avatar = member.displayAvatarURL({ format: 'png', dynamic: true });
    }
    const user = await this.client.database.Users.findOne({ id: member.id });

    const marry = await this.client.users.fetch(user.casado);
    delete require.cache[require.resolve('../../utils/Canvas')];
    // eslint-disable-next-line global-require
    const { ProfileImage } = require('../../utils/Canvas');
    const image = await ProfileImage({
      member, user, avatar, marry,
    }, t);

    message.channel.send(new MessageAttachment(image, 'profile.png'));
  }
};
