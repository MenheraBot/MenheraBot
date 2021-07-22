const Command = require('../../structures/Command');

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

  async run(ctx) {
    const [prefix] = ctx.args;
    if (!prefix) return ctx.replyT('error', 'commands:prefix.no-args');
    if (prefix.length > 3) return ctx.replyT('error', 'commands:prefix.invalid-input');

    ctx.data.server.prefix = prefix;
    ctx.data.server.save();

    ctx.replyT('success', 'commands:prefix.done', { prefix: ctx.data.server.prefix });
  }
};
