import MenheraClient from 'MenheraClient';

import { Message, MessageEmbed } from 'discord.js';
import Command from '@structures/Command';

import CommandContext from '@structures/CommandContext';
import { abilities as abilitiesFile } from '@structures/RpgHandler';
import { IAbility, IClassAbilities } from '@utils/Types';

export default class AbilityInfoCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'infohabilidade',
      aliases: ['ih', 'abilityinfo'],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  static getClass(ctx: CommandContext): Promise<Message | Message[]> {
    const normalized = ctx.args[1]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

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
      default:
        return ctx.replyT('error', 'commands:infohabilidade.invalid-class');
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

    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async run(ctx: CommandContext): Promise<Message | Message[] | void> {
    if (!ctx.args[0]) return ctx.replyT('question', 'commands:infohabilidade.no-args');

    const validArgs = [
      {
        option: 'classe',
        arguments: ['classe', 'class', 'c'],
      },
      {
        option: 'minhas',
        arguments: ['minhas', 'minha', 'meu', 'meus', 'mine', 'my'],
      },
    ];

    const selectedOption = validArgs.some((so) => so.arguments.includes(ctx.args[0].toLowerCase()));
    if (!selectedOption) return ctx.replyT('error', 'commands:infohabilidade.invalid-option');
    const filtredOption = validArgs.filter((f) => f.arguments.includes(ctx.args[0].toLowerCase()));

    const { option } = filtredOption[0];

    if (option === 'classe') {
      if (!ctx.args[1]) return ctx.replyT('error', 'commands:infohabilidade.no-class');
      return AbilityInfoCommand.getClass(ctx);
    }
    if (option === 'minhas') return this.getAll(ctx);
  }

  async getAll(ctx: CommandContext): Promise<Message | Message[]> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:infohabilidade.non-aventure');

    let filtrado: IClassAbilities;

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
      default:
        return ctx.replyT('error', 'commands:infohabilidade.no-class');
    }

    const uniquePowerFiltred = filtrado.uniquePowers.filter(
      (f) => f.name === user.uniquePower.name,
    );
    const abilitiesFiltred: IAbility[] = [];

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
    return ctx.sendC(ctx.message.author.toString(), embed);
  }
}
