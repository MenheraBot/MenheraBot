const Command = require('../../structures/command');

module.exports = class DepositeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deposite',
      aliases: ['depositar'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run({ message, args }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:deposite.non-aventure'));
    if (!user.hasFamily) return message.menheraReply('error', t('commands:deposite.no-family'));

    const familia = await this.client.database.Familias.findById(user.familyName);

    const input = args[0];
    if (!input) return message.menheraReply('error', t('commands:deposite.invalid-value'));
    const valor = parseInt(input.replace(/\D+/g, ''));
    if (!valor || valor < 1) return message.menheraReply('error', t('commands:deposite.invalid-value'));

    if (valor > user.money) return message.menheraReply('error', t('commands:deposite.poor'));

    user.money -= valor;
    familia.bank = parseInt(familia.bank) + valor;
    user.save();
    familia.save();

    message.menheraReply('success', t('commands:deposite.transfered', { value: valor }));
    setTimeout(() => {
      const server = this.client.guilds.cache.get('717061688460967988');

      const FreyaRole = server.roles.cache.get('765069003440914443'); // Freya
      const ApoloRole = server.roles.cache.get('765069063146962995'); // Apolo
      const LokiRole = server.roles.cache.get('765069110018703371'); // Loki
      const SomaRole = server.roles.cache.get('765069167363096616'); // Soma
      const AresRole = server.roles.cache.get('765069139885948928'); // Ares

      let role;
      switch (familia._id) {
        case 'Freya':
          role = FreyaRole;
          break;
        case 'Apolo':
          role = ApoloRole;
          break;
        case 'Loki':
          role = LokiRole;
          break;
        case 'Soma':
          role = SomaRole;
          break;
        case 'Ares':
          role = AresRole;
          break;
      }

      if (parseInt(familia.bank) >= parseInt(familia.nextLevel)) {
        this.client.channels.cache.get('765427597101760573').send(`A família **${user.familyName}** acabou de passar de nível com o depósito de **${this.client.users.cache.get(user._id)}**\nAgora, a família \`${user.familyName}\` está nível **${familia.levelFamilia + 1}**\n\n${role}`);
        this.CheckLevel(familia);
      }
    }, 500);
  }

  async CheckLevel(familia) {
    // Freya, Soma e Apolo mudar na DB, o resto é automáico

    switch (familia._id) {
      case 'Loki': // Aumento do dano de ataque
        familia.levelFamilia += 1;
        familia.boost = {
          name: familia.boost.name,
          value: familia.boost.value + 30,
        };
        break;
      case 'Freya': // Aumento da Mana máxima
        familia.levelFamilia += 1;
        familia.boost = {
          name: familia.boost.name,
          value: familia.boost.value + 100,
        };
        familia.members.forEach(async (membro) => {
          const user = await this.client.database.Rpg.findById(membro);
          user.maxMana += 100;
          user.save();
        });
        break;
      case 'Ares': // Aumento da defesa
        familia.levelFamilia += 1;
        familia.boost = {
          name: familia.boost.name,
          value: familia.boost.value + 20,
        };
        break;
      case 'Soma': // Aumento de vida máxima
        familia.levelFamilia += 1;
        familia.boost = {
          name: familia.boost.name,
          value: familia.boost.value + 100,
        };
        familia.members.forEach(async (membro) => {
          const user = await this.client.database.Rpg.findById(membro);
          user.maxLife += 100;
          user.save();
        });
        break;
      case 'Apolo': // Aumento de Poder de Habilidade
        familia.levelFamilia += 1;
        familia.boost = {
          name: familia.boost.name,
          value: familia.boost.value + 1,
        };
        familia.members.forEach(async (membro) => {
          const user = await this.client.database.Rpg.findById(membro);
          user.abilityPower += 1;
          user.save();
        });
        break;
    }
    DepositeCommand.ShyrleiTeresinha(familia);
  }

  static async ShyrleiTeresinha(family) {
    const level = family.levelFamilia;

    setTimeout(() => {
      switch (level) {
        case 2:
          family.nextLevel = '100000';
          break;
        case 3:
          family.nextLevel = '500000';
          break;
        case 4:
          family.nextLevel = '1000000';
          break;
        case 5:
          family.nextLevel = '2000000';
          break;
        case 6:
          family.nextLevel = '3000000';
          break;
        case 7:
          family.nextLevel = '5000000';
          break;
        case 8:
          family.nextLevel = '10000000';
          break;
        case 9:
          family.nextLevel = '50000000';
          break;
        case 10:
          family.nextLevel = '100000000';
          break;
      }
      family.save();
    }, 500);
  }
};
