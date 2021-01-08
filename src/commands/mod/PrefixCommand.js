const Command = require('../../structures/command');

module.exports = class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      aliases: ['prefixo'],
      cooldown: 10,
      description: 'Troque meu prefixo neste servidor',
      userPermissions: ['MANAGE_CHANNELS'],
      category: 'moderação',
    });
  }

  async run({ message, args, server }, t) {
    const [prefix] = args;
    if (!prefix) return message.menheraReply('error', t('commands:prefix.no-args'));
    if (prefix.length > 3) return message.menheraReply('error', t('commands:prefix.invalid-input'));

    server.prefix = prefix;
    server.save();

    message.menheraReply('success', t('commands:prefix.done', { prefix: server.prefix }));
  }
};
