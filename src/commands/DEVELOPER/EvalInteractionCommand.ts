import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import util from 'node:util';
import { MessageEmbed } from 'discord.js-light';

export default class EvalSlashInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'eval',
      description: 'Evaleda algo em js ae',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'script',
          description: 'Eval to run',
          required: true,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['angels', 'huntCooldown', 'ban', 'trisal', 'estrelinhas'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    try {
      // eslint-disable-next-line no-eval
      let evaled = await eval(ctx.options.getString('script', true));
      evaled = util.inspect(evaled, { depth: 1 });
      evaled = evaled.replace(new RegExp(`${ctx.client.token}`, 'g'), undefined);

      if (evaled.length > 1800) evaled = `${evaled.slice(0, 1800)}...`;
      await ctx.makeMessage({ content: `\`\`\`js\n ${evaled}\`\`\`` });
      return;
    } catch (err) {
      if (err instanceof Error && err.stack) {
        const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
        const embed = new MessageEmbed();
        embed.setColor('#ff0000');
        embed.setTitle('<:negacao:759603958317711371> | Erro');
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);

        await ctx.makeMessage({ embeds: [embed] });
      }
    }
  }
}
