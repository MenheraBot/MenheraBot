const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const abilitiesFile = require('../../structures/RpgHandler').abiltiies;

module.exports = class AbilityInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'infohabilidade',
      aliases: ['ih', 'abilityinfo'],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.replyT('question', 'commands:infohabilidade.no-args');

    const validArgs = [
      {
        opção: 'classe',
        arguments: ['classe', 'class', 'c'],
      },
      {
        opção: 'minhas',
        arguments: ['minhas', 'minha', 'meu', 'meus', 'mine', 'my'],
      },
    ];

    const selectedOption = validArgs.some((so) => so.arguments.includes(ctx.args[0].toLowerCase()));
    if (!selectedOption) return ctx.replyT('error', 'commands:infohabilidade.invalid-option');
    const filtredOption = validArgs.filter((f) => f.arguments.includes(ctx.args[0].toLowerCase()));

    const option = filtredOption[0].opção;

    switch (option) {
      case 'classe':
        if (!ctx.args[1]) return ctx.replyT('error', 'commands:infohabilidade.no-class');
        AbilityInfoCommand.getClass(ctx);
        break;
      case 'minhas':
        this.getAll(ctx);
        break;
    }
  }

  static getClass(ctx) {
    const classes = [
      'assassino',
      'barbaro',
      'clerigo',
      'druida',
      'espadachim',
      'feiticeiro',
      'monge',
      'necromante',
    ];

    const normalized = ctx.args[1]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (!classes.includes(normalized))
      return ctx.replyT('error', 'commands:infohabilidade.invalid-class');

    let filtrado;

    switch (normalized) {
      case 'assassino':
        filtrado = abilitiesFile.assassin;
        break;
      case 'barbaro':
        filtrado = abilitiesFile.barbarian;
        break;
      case 'clerigo':
        filtrado = abilitiesFile.clerigo;
        break;
      case 'druida':
        filtrado = abilitiesFile.druida;
        break;
      case 'espadachim':
        filtrado = abilitiesFile.espadachim;
        break;
      case 'feiticeiro':
        filtrado = abilitiesFile.feiticeiro;
        break;
      case 'monge':
        filtrado = abilitiesFile.monge;
        break;
      case 'necromante':
        filtrado = abilitiesFile.necromante;
        break;
    }

    const filtredOption = filtrado.uniquePowers;

    const embed = new MessageEmbed()
      .setTitle(`🔮 | ${ctx.locale('commands:infohabilidade.abilities', { class: ctx.args[1] })}`)
      .setColor('#9cfcde');

    filtredOption.forEach((hab) => {
      embed.addField(
        hab.name,
        `📜 | **${ctx.locale('commands:infohabilidade.desc')}:** ${
          hab.description
        }\n⚔️ | **${ctx.locale('commands:infohabilidade.dmg')}:** ${
          hab.damage
        }\n💉 | **${ctx.locale('commands:infohabilidade.heal')}:** ${hab.heal}\n💧 | **${ctx.locale(
          'commands:infohabilidade.cost',
        )}:** ${hab.cost}\n🧿 | **${ctx.locale('commands:infohabilidade.type')}:** ${hab.type}`,
      );
    });

    return ctx.sendC(ctx.message.author, embed);
  }

  async getAll(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:infohabilidade.non-aventure');

    let filtrado;

    switch (user.class) {
      case 'Assassino':
        filtrado = abilitiesFile.assassin;
        break;
      case 'Senhor das Sombras':
        filtrado = abilitiesFile.assassin;
        break;
      case 'Bárbaro':
        filtrado = abilitiesFile.barbarian;
        break;
      case 'Berserker':
        filtrado = abilitiesFile.barbarian;
        break;
      case 'Clérigo':
        filtrado = abilitiesFile.clerigo;
        break;
      case 'Arcanjo':
        filtrado = abilitiesFile.clerigo;
        break;
      case 'Druida':
        filtrado = abilitiesFile.druida;
        break;
      case 'Guardião da Natureza':
        filtrado = abilitiesFile.druida;
        break;
      case 'Espadachim':
        filtrado = abilitiesFile.espadachim;
        break;
      case 'Mestre das Armas':
        filtrado = abilitiesFile.espadachim;
        break;
      case 'Feiticeiro':
        filtrado = abilitiesFile.feiticeiro;
        break;
      case 'Senhor das Galáxias':
        filtrado = abilitiesFile.feiticeiro;
        break;
      case 'Mestre dos Elementos':
        filtrado = abilitiesFile.feiticeiro;
        break;
      case 'Conjurador Demoníaco':
        filtrado = abilitiesFile.feiticeiro;
        break;
      case 'Monge':
        filtrado = abilitiesFile.monge;
        break;
      case 'Sacerdote':
        filtrado = abilitiesFile.monge;
        break;
      case 'Necromante':
        filtrado = abilitiesFile.necromante;
        break;
      case 'Senhor das Trevas':
        filtrado = abilitiesFile.necromante;
        break;
    }

    const uniquePowerFiltred = filtrado.uniquePowers.filter(
      (f) => f.name === user.uniquePower.name,
    );
    const abilitiesFiltred = [];

    user.abilities.forEach((hab) => {
      const a = filtrado.normalAbilities.filter((f) => f.name === hab.name);
      abilitiesFiltred.push(a[0]);
    });

    const embed = new MessageEmbed()
      .setTitle(`🔮 | ${ctx.locale('commands:infohabilidade.your-abilities')}`)
      .setColor('#a9ec67');

    embed.addField(
      ` ${ctx.locale('commands:infohabilidade.uniquePower')}: ${uniquePowerFiltred[0].name}`,
      `📜 | **${ctx.locale('commands:infohabilidade.desc')}:** ${
        uniquePowerFiltred[0].description
      }\n⚔️ | **${ctx.locale('commands:infohabilidade.dmg')}:** ${
        uniquePowerFiltred[0].damage
      }\n💉 | **${ctx.locale('commands:infohabilidade.heal')}:** ${
        uniquePowerFiltred[0].heal
      }\n💧 | **${ctx.locale('commands:infohabilidade.cost')}:** ${uniquePowerFiltred[0].cost}`,
    );

    abilitiesFiltred.forEach((hab) => {
      embed.addField(
        `🔮 | ${ctx.locale('commands:infohabilidade.ability')}: ${hab.name}`,
        `📜 | **${ctx.locale('commands:infohabilidade.desc')}:** ${
          hab.description
        }\n⚔️ | **${ctx.locale('commands:infohabilidade.dmg')}:** ${
          hab.damage
        }\n💉 | **${ctx.locale('commands:infohabilidade.heal')}:** ${hab.heal}\n💧 | **${ctx.locale(
          'commands:infohabilidade.cost',
        )}:** ${hab.cost}`,
      );
    });
    return ctx.sendC(ctx.message.author, embed);
  }
};
