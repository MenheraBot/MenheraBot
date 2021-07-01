const Command = require('../../structures/command');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx) {
    const agr = await ctx.client.repositories.topRepository.getUserStarsRank(ctx.message.author.id);
    ctx.message.channel.send(`Tu é rank ${agr.rank} com ${agr.user.estrelinhas} estrelinhas`);
  }
};
