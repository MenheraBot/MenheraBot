const Command = require('../../structures/command');

module.exports = class BlockCmdCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blockcommand',
      aliases: ['blockcmd', 'blockearcomando'],
      cooldown: 10,
      userPermissions: ['MANAGE_GUILD'],
      category: 'moderação',
    });
  }

  async run({ message, server, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:blockcommand.no-args'));

    const cmd = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]));

    if (!cmd) return message.menheraReply('error', t('commands:blockcommand.no-cmd'));

    if (cmd.config.devsOnly) return message.menheraReply('error', t('commands:blockcommand.dev-cmd'));

    if (cmd.config.name === this.config.name) return message.menheraReply('error', t('commands:blockcommand.foda'));

    if (server.disabledCommands?.includes(cmd.config.name)) {
      const index = server.disabledCommands.indexOf(cmd.config.name);
      if (index > -1) {
        server.disabledCommands.splice(index, 1);
        message.menheraReply('success', t('commands:blockcommand.unblock', { cmd: cmd.config.name }));
      }
    } else {
      server.disabledCommands.push(cmd.config.name);
      message.menheraReply('success', t('commands:blockcommand.block', { cmd: cmd.config.name }));
    }

    await server.save();
  }
};
