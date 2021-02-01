const Command = require('../../structures/command');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message }) {
    const totalTime = Date.now();
    const apolo = await this.client.database.Familias.findById('Apolo');
    const freya = await this.client.database.Familias.findById('Freya');
    const soma = await this.client.database.Familias.findById('Soma');

    let allApolo = 0;
    const beforeApolo = Date.now();

    apolo.members.forEach(async (a) => {
      const user = await this.client.database.Rpg.findById(a);
      if (user) {
        user.abilityPower -= apolo.boost.value;
        await user.save();
        allApolo++;
      }
    });
    const finalTimeApolo = Date.now - beforeApolo;

    let allFreya = 0;
    const beforeFreya = Date.now();

    freya.members.forEach(async (a) => {
      const user = await this.client.database.Rpg.findById(a);
      if (user) {
        user.maxMana -= freya.boost.value;
        await user.save();
        allFreya++;
      }
    });
    const finalTimeFreya = Date.now() - beforeFreya;

    let allSoma = 0;
    const beforeSoma = Date.now();

    soma.members.forEach(async (a) => {
      const user = await this.client.database.Rpg.findById(a);
      if (user) {
        user.maxLife -= soma.boost.value;
        await user.save();
        allSoma++;
      }
    });
    const finalTimeSoma = Date.now() - beforeSoma;
    const ALL_TIME = Date.now() - totalTime;

    message.channel.send(`**REMOÇÃO DAS FAMÍLIAS**\nA família apolo teve **${allApolo}** membros removidos! Demorou **${finalTimeApolo}ms** para conclusão desta família\nA família freya teve **${allFreya}** membros removidos! Demorou **${finalTimeFreya}ms** para conclusão desta família!\nA familia soma teve **${allSoma}** membros removidos! Demorou **${finalTimeSoma}ms** para conslusão desta família\n\nNo total, foram **${ALL_TIME}ms** para esta opeeração`);
  }
};
