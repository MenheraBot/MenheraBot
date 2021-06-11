const Command = require('../../structures/command');

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx) {
    const authorData = ctx.data.user;
    if (ctx.args[0]) {
      const rpgUser = await this.client.database.Rpg.findById(ctx.message.author.id);
      if (!rpgUser) return ctx.replyT('error', 'commands:roll.no-adventure');

      if (parseInt(rpgUser.dungeonCooldown) < Date.now()) return ctx.replyT('error', 'commands:roll.can-dungeon');

      if (rpgUser.resetRoll < 1) return ctx.replyT('error', 'commands:roll.dungeon-poor');

      rpgUser.resetRoll -= 1;
      rpgUser.dungeonCooldown = '0';
      await rpgUser.save();
      ctx.replyT('success', 'commands:roll.dungeon-success');
    } else {
      if (parseInt(authorData.caçarTime) < Date.now()) return ctx.replyT('error', 'commands:roll.can-hunt');

      if (authorData.rolls < 1) return ctx.replyT('error', 'commands:roll.poor');

      authorData.rolls -= 1;
      authorData.caçarTime = '000000000000';
      await authorData.save();
      ctx.replyT('success', 'commands:roll.success');
    }
  }
};
