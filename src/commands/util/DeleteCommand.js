const Command = require('../../structures/Command');

module.exports = class DeleteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['deletar'],
      cooldown: 30,
      category: 'util',
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx) {
    ctx.replyT('warn', 'commands:delete.confirm').then(async (msg) => {
      msg.react(this.client.constants.emojis.yes).catch();
      msg.react(this.client.constants.emojis.no).catch();

      const filter = (reaction, usuario) =>
        reaction.emoji.name === this.client.constants.emojis.yes &&
        usuario.id === ctx.message.author.id;
      const filter1 = (reação, user) =>
        reação.emoji.name === this.client.constants.emojis.no && user.id === ctx.message.author.id;

      const ncoletor = msg.createReactionCollector(filter1, { max: 1, time: 5000 });
      const coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 });

      ncoletor.on('collect', () => {
        ctx.replyT('success', 'commands:delete.negated');
      });

      coletor.on('collect', () => {
        this.client.database.Users.findOneAndDelete(
          {
            id: ctx.message.author.id,
          },
          (err) => {
            if (err) console.log(err);
            ctx.replyT('success', 'commands:delete.acepted');
          },
        );
      });
      setTimeout(() => {
        msg.delete().catch();
      }, 5050);
    });
  }
};
