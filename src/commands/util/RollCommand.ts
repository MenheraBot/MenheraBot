import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { Message } from 'discord.js';

export default class RollCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'roll',
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const authorData = ctx.data.user;
    if (ctx.args[0]) {
      const rpgUser = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
      if (!rpgUser) return ctx.replyT('error', 'commands:roll.no-adventure');

      if (parseInt(rpgUser.dungeonCooldown) < Date.now())
        return ctx.replyT('error', 'commands:roll.can-dungeon');

      if (rpgUser.resetRoll < 1) return ctx.replyT('error', 'commands:roll.dungeon-poor');

      rpgUser.resetRoll -= 1;
      rpgUser.dungeonCooldown = '0';
      await rpgUser.save();
      return ctx.replyT('success', 'commands:roll.dungeon-success');
    }
    if (parseInt(authorData.caçarTime) < Date.now())
      return ctx.replyT('error', 'commands:roll.can-hunt');

    if (authorData.rolls < 1) return ctx.replyT('error', 'commands:roll.poor');

    authorData.rolls -= 1;
    authorData.caçarTime = '000000000000';
    await authorData.save();
    return ctx.replyT('success', 'commands:roll.success');
  }
}
