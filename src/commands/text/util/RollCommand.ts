import Command from '@structures/command/Command';
import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';

export default class RollCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'roll',
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;
    if (ctx.args[0]) {
      const rpgUser = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
      if (!rpgUser) {
        await ctx.replyT('error', 'commands:roll.no-adventure');
        return;
      }

      if (parseInt(rpgUser.dungeonCooldown) < Date.now()) {
        await ctx.replyT('error', 'commands:roll.can-dungeon');
        return;
      }

      if (rpgUser.resetRoll < 1) {
        await ctx.replyT('error', 'commands:roll.dungeon-poor');
        return;
      }

      rpgUser.resetRoll -= 1;
      rpgUser.dungeonCooldown = '0';
      await rpgUser.save();
      await ctx.replyT('success', 'commands:roll.dungeon-success');
      return;
    }
    if (parseInt(authorData.caçarTime) < Date.now()) {
      await ctx.replyT('error', 'commands:roll.can-hunt');
      return;
    }

    if (authorData.rolls < 1) {
      await ctx.replyT('error', 'commands:roll.poor');
      return;
    }

    authorData.rolls -= 1;
    authorData.caçarTime = '000000000000';
    await authorData.save();
    await ctx.replyT('success', 'commands:roll.success');
  }
}
