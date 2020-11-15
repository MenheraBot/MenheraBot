const { MessageEmbed } = require('discord.js');
const util = require('util');
const Command = require('../../structures/command');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      description: 'Evaleda um código js puro',
      devsOnly: true,
      category: 'Dev',
    });
  }

  // eslint-disable-next-line no-unused-vars
  async run({ message, args }, t) {
    try {
      // eslint-disable-next-line no-eval
      let evaled = await eval(args.join(' '));
      evaled = util.inspect(evaled, { depth: 1 });
      evaled = evaled.replace(new RegExp(`${this.client.token}`, 'g'), undefined);

      if (evaled.length > 1800) evaled = `${evaled.slice(0, 1800)}...`;
      message.channel.send(evaled, { code: 'js' });
    } catch (err) {
      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
      const embed = new MessageEmbed();
      embed.setColor('#ff0000');
      embed.setTitle('<:negacao:759603958317711371> | Erro');
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);

      message.channel.send(embed);
    }
  }
};
