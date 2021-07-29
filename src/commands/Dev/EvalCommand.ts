import CommandContext from '@structures/CommandContext';
import { Message, MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import util from 'util';

import Command from '@structures/Command';

export default class EvalCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'eval',
      devsOnly: true,
      category: 'Dev',
    });
  }

  // eslint-disable-next-line no-unused-vars
  async run(ctx: CommandContext): Promise<Message> {
    try {
      // eslint-disable-next-line no-eval
      let evaled = await eval(ctx.args.join(' '));
      evaled = util.inspect(evaled, { depth: 1 });
      evaled = evaled.replace(new RegExp(`${this.client.token}`, 'g'), undefined);

      if (evaled.length > 1800) evaled = `${evaled.slice(0, 1800)}...`;
      return ctx.message.channel.send(evaled, { code: 'js' });
    } catch (err) {
      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
      const embed = new MessageEmbed();
      embed.setColor('#ff0000');
      embed.setTitle('<:negacao:759603958317711371> | Erro');
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);

      return ctx.send(embed);
    }
  }
}
