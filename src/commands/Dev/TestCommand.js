/* const { MessageAttachment } = require('discord.js'); */
const Command = require('../../structures/command');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test?',
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(/* { message, args }, t */) {
    /* const all = await this.client.database.Rpg.find();

    const vrau = all.reduce((p, c) => {
      if (c.xp >= c.nextLevelXp) {
        p.push(c);
        console.log(c._id);
      }

      return p;
    }, []);

    message.channel.send(`No total, ${vrau.length} pessoas se aproveitaram do problema, mamãe! Devo matá-los imediatamente?`);
    console.log(vrau); */
  }
};
