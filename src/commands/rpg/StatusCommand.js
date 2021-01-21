const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');

const Canvas = require('../../utils/Canvas');

module.exports = class StatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'status',
      aliases: ['stats'],
      cooldown: 7,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
    });
  }

  async run({ message, args }, t) {
    let mentioned;
    if (args[0]) {
      try {
        mentioned = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
      } catch {
        return message.menheraReply('error', t('commands:status.not-found'));
      }
    } else mentioned = message.author;

    const user = await this.client.database.Rpg.findById(mentioned.id);
    if (!user) return message.menheraReply('error', t('commands:status.not-found'));

    const familia = await this.client.database.Familias.findById(user.familyName);
    const image = await Canvas.RpgStatusBuilder(user, mentioned, t, familia);

    message.channel.send(message.author, new MessageAttachment(image, 'status.png'));
  }
};
