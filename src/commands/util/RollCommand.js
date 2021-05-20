const Command = require('../../structures/command');

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      cooldown: 5,
      category: 'util',
    });
  }

  async run({ message, authorData: selfData, args }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });
    if (args[0]) {
      const rpgUser = await this.client.database.Rpg.findById(message.author.id);
      if (!rpgUser) return message.menheraReply('error', t('commands:roll.no-adventure'));

      if (parseInt(rpgUser.dungeonCooldown) < Date.now()) return message.menheraReply('error', t('commands:roll.can-dungeon'));

      if (rpgUser.resetRoll < 1) return message.menheraReply('error', t('commands:roll.dungeon-poor'));

      this.client.database.Rpg.updateOne({ _id: message.author.id }, { $inc: { resetRoll: -1 }, $set: { dungeonCooldown: '0' } });
      message.menheraReply('success', t('commands:roll.dungeon-success'));
    } else {
      if (parseInt(authorData.caçarTime) < Date.now()) return message.menheraReply('error', t('commands:roll.can-hunt'));

      if (authorData.rolls < 1) return message.menheraReply('error', t('commands:roll.poor'));

      authorData.rolls -= 1;
      authorData.caçarTime = '000000000000';
      await authorData.save();
      message.menheraReply('success', t('commands:roll.success'));
    }
  }
};
