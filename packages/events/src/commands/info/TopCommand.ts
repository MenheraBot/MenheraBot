import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { ApiHuntingTypes, DatabaseHuntingTypes } from '../../modules/hunt/types';
import { createCommand } from '../../structures/command/createCommand';
import { COLORS, transactionableCommandOption } from '../../structures/constants';
import { DatabaseUserSchema } from '../../types/database';
import { executeGamblingTop } from '../../modules/top/gamblingTop';
import { executeTopHuntStatistics } from '../../modules/top/huntStatistics';
import { executeUserDataRelatedTop } from '../../modules/top/userDataRelated';
import { executeUsedCommandsFromUserTop } from '../../modules/top/usedCommandsFromUser';
import { executeUsedCommandsTop } from '../../modules/top/usedCommands';
import { executeUserCommandsTop } from '../../modules/top/userCommands';
import { executeTopPagination, topEmojis } from '../../modules/top';
import { executeUsersByUsedCommandTop } from '../../modules/top/usersByUsedCommand';
import { bot } from '../..';

const TopCommand = createCommand({
  path: '',
  name: 'top',
  description: '「💹」・Veja o top de usuários da Menhera',
  descriptionLocalizations: { 'en-US': "「💹」・See Menhera's top users" },
  category: 'info',
  options: [
    {
      name: 'caças',
      nameLocalizations: { 'en-US': 'hunting' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「🎯」・Veja o top caçadores atuais da Menhera',
      descriptionLocalizations: { 'en-US': "「🎯」・See Menhera's current top hunters" },
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: 'caça',
          nameLocalizations: { 'en-US': 'hunt' },
          description: 'O tipo da caça que você quer ver',
          descriptionLocalizations: { 'en-US': 'The kind of hunt you want to see' },
          required: true,
          choices: transactionableCommandOption.filter((a) => a.value !== 'estrelinhas'),
        },
        {
          type: ApplicationCommandOptionTypes.Integer,
          name: 'página',
          nameLocalizations: { 'en-US': 'page' },
          description: 'Página do top que tu quer ver',
          descriptionLocalizations: { 'en-US': 'Top page you want to see' },
          required: false,
          minValue: 2,
          maxValue: 99,
        },
      ],
    },
    {
      name: 'diversos',
      nameLocalizations: { 'en-US': 'misc' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「⭐」・Veja os melhores usuários da Menhera',
      descriptionLocalizations: { 'en-US': "「⭐」・See Menhera's best users" },
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: 'tipo',
          nameLocalizations: { 'en-US': 'type' },
          description: 'O tipo de top que tu queres ver',
          descriptionLocalizations: { 'en-US': 'The type of top you want to see' },
          required: true,
          choices: [
            {
              name: '💋 | Mamadores',
              nameLocalizations: { 'en-US': '💋 | Lickers' },
              value: 'mamou',
            },
            {
              name: '👅 | Mamados',
              nameLocalizations: { 'en-US': '👅 | Licked' },
              value: 'mamado',
            },
            {
              name: '⭐ | Estrelinhas',
              nameLocalizations: { 'en-US': '⭐ | Stars' },
              value: 'estrelinhas',
            },
            {
              name: '🆙 | Votos',
              nameLocalizations: { 'en-US': '🆙 | Votes' },
              value: 'votes',
            },
          ],
        },
        {
          type: ApplicationCommandOptionTypes.Integer,
          name: 'página',
          nameLocalizations: { 'en-US': 'page' },
          description: 'Página do top que tu quer ver',
          descriptionLocalizations: { 'en-US': 'Top page you want to see' },
          required: false,
          minValue: 2,
          maxValue: 99,
        },
      ],
    },
    {
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      name: 'usos',
      nameLocalizations: { 'en-US': 'uses' },
      description: '「📟」・Veja os melhores sobre os comandos',
      descriptionLocalizations: { 'en-US': '「📟」・See the best about commands' },
      options: [
        {
          type: ApplicationCommandOptionTypes.SubCommand,
          name: 'comandos',
          nameLocalizations: { 'en-US': 'commands' },
          description: '「📟」・Veja informações dos comandos mais usados',
          descriptionLocalizations: { 'en-US': '「📟」・See info about the most used commands' },
          options: [
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'O tipo de informação que queres ver',
              descriptionLocalizations: { 'en-US': 'The type of information you want to see' },
              required: true,
              choices: [
                {
                  name: 'Comandos mais usados',
                  nameLocalizations: { 'en-US': 'Most used commands' },
                  value: 'commands',
                },
                {
                  name: 'Comandos mais usados de um usuário',
                  nameLocalizations: { 'en-US': 'Most used commands by an user' },
                  value: 'user',
                },
              ],
            },
            {
              type: ApplicationCommandOptionTypes.User,
              name: 'user',
              description: 'Usuário para ver os comandos mais usados',
              descriptionLocalizations: { 'en-US': 'User to see most used commands' },
              required: false,
            },
            {
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página do top que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Top page you want to see' },
              required: false,
              minValue: 2,
              maxValue: 99,
            },
          ],
        },
        {
          type: ApplicationCommandOptionTypes.SubCommand,
          name: 'usuários',
          nameLocalizations: { 'en-US': 'users' },
          description: '「📟」・Veja informações sobre o uso de comandos de usuários',
          descriptionLocalizations: { 'en-US': '「📟」・See info about command usage from users' },
          options: [
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'O tipo de informação que queres ver',
              descriptionLocalizations: { 'en-US': 'The type of information you want to see' },
              required: true,
              choices: [
                {
                  name: 'Usuários que mais usaram comandos',
                  nameLocalizations: { 'en-US': 'Users that used commands the most' },
                  value: 'users',
                },
                {
                  name: 'Usuários que mais usaram um comando específico',
                  nameLocalizations: { 'en-US': 'Users that used a specific command the most' },
                  value: 'command',
                },
              ],
            },
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'comando',
              nameLocalizations: { 'en-US': 'command' },
              description: 'Comando que você quer buscar pelos usuários que mais o usaram',
              descriptionLocalizations: {
                'en-US': 'Command you want to search for the users who used it the most',
              },
              required: false,
              autocomplete: true,
            },
            {
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página do top que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Top page you want to see' },
              required: false,
              minValue: 2,
              maxValue: 99,
            },
          ],
        },
      ],
    },
    {
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      name: 'estatísticas',
      nameLocalizations: { 'en-US': 'statistics' },
      description: '「📊」・Veja os melhores em termos de estatísticas',
      descriptionLocalizations: { 'en-US': '「📊」・See the best in terms of stats' },
      options: [
        {
          name: 'apostas',
          nameLocalizations: { 'en-US': 'bets' },
          description: '「📊」・Veja os melhores apostadores',
          descriptionLocalizations: { 'en-US': '「📊」・See the best bettors' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'jogo',
              nameLocalizations: { 'en-US': 'game' },
              description: 'Jogo de apostas que você quer ver',
              descriptionLocalizations: { 'en-US': 'Betting game you want to see' },
              type: ApplicationCommandOptionTypes.String,
              choices: [
                {
                  name: '🃏 | Blackjack',
                  value: 'blackjack',
                },
                {
                  name: '📀 | Coinflip',
                  value: 'coinflip',
                },
                {
                  name: '🎡 | Roleta',
                  nameLocalizations: { 'en-US': '🎡 | Roulette' },
                  value: 'roulette',
                },
                {
                  name: '🦌 | Jogo do Bicho',
                  nameLocalizations: { 'en-US': '🦌 | Animal Game' },
                  value: 'bicho',
                },
              ],
              required: true,
            },
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'ordenar',
              nameLocalizations: { 'en-US': 'order' },
              description: 'Modo que você quer ordenar o Top',
              descriptionLocalizations: { 'en-US': 'How you want to sort the Top' },
              choices: [
                {
                  name: '⭐ | Estrelinhas Ganhas',
                  nameLocalizations: { 'en-US': '⭐ | Stars Earned' },
                  value: 'money',
                },
                {
                  name: '👑 | Mais Vitórias',
                  nameLocalizations: { 'en-US': '👑 | Most Wins' },
                  value: 'wins',
                },
              ],
              required: true,
            },
            {
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página do top que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Top page you want to see' },
              required: false,
              minValue: 2,
              maxValue: 99,
            },
          ],
        },
        {
          name: 'caçar',
          nameLocalizations: { 'en-US': 'hunt' },
          description: '「🎯」・Veja os melhores caçadores de todos os tempos',
          descriptionLocalizations: { 'en-US': '「🎯」・See the best hunters of all time' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'caça',
              nameLocalizations: { 'en-US': 'hunt' },
              description: 'O tipo da caça que você quer ver',
              descriptionLocalizations: { 'en-US': 'The kind of hunt you want to see' },
              required: true,
              choices: transactionableCommandOption.filter((a) => a.value !== 'estrelinhas'),
            },
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'ordenar',
              nameLocalizations: { 'en-US': 'order' },
              description: 'Modo que você quer ver o top',
              descriptionLocalizations: { 'en-US': 'How do you want to see the top' },
              choices: [
                {
                  name: '👑 | Caças bem-sucedidas',
                  nameLocalizations: { 'en-US': '👑 | Successful Hunts' },
                  value: 'success',
                },
                {
                  name: '🏅 | Vezes que caçou',
                  nameLocalizations: { 'en-US': '🏅 | Times Hunted' },
                  value: 'tries',
                },
                {
                  name: '🍀 | Quantidade de caças',
                  nameLocalizations: { 'en-US': '🍀 | Number of Hunts' },
                  value: 'hunted',
                },
              ],
              required: true,
            },
            {
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página do top que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Top page you want to see' },
              required: false,
              minValue: 2,
              maxValue: 99,
            },
          ],
        },
      ],
    },
  ],
  commandRelatedExecutions: [executeTopPagination],
  authorDataFields: ['selectedColor', 'inUseItems', 'inventory', 'id'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const command = ctx.getSubCommand();

    await ctx.defer();

    switch (command) {
      case 'caças':
      case 'diversos': {
        const type = ctx.getOption<keyof DatabaseUserSchema>(
          command === 'caças' ? 'caça' : 'tipo',
          false,
          true,
        );

        const page = ctx.getOption<number>('página', false) ?? 0;

        return executeUserDataRelatedTop(
          ctx,
          type,
          topEmojis[type],
          ctx.locale(`commands:top.economia.${type as 'mamou'}-title`),
          ctx.locale(`commands:top.economia.${type as 'mamou'}`),
          page,
          COLORS.Purple,
        );
      }
      case 'comandos': {
        const type = ctx.getOption<'commands' | 'user'>('tipo', false, true);
        const page = ctx.getOption<number>('página', false) ?? 0;

        if (type === 'commands')
          return executeUsedCommandsTop(ctx, page, ctx.authorData.selectedColor);

        const user = ctx.getOption<User>('user', 'users') ?? ctx.author;

        return executeUsedCommandsFromUserTop(ctx, user, page, ctx.authorData.selectedColor);
      }
      case 'usuários': {
        const type = ctx.getOption<'command' | 'users'>('tipo', false, true);
        const page = ctx.getOption<number>('página', false) ?? 0;

        if (type === 'users')
          return executeUserCommandsTop(ctx, page, ctx.authorData.selectedColor);

        const commandName = ctx.getOption<string>('comando', false);

        if (!commandName)
          return ctx.makeMessage({
            content: ctx.prettyResponse('error', 'commands:top.command-required'),
          });

        const commandInMenhera = bot.commands.get(commandName);

        if (!commandInMenhera)
          return ctx.makeMessage({
            content: ctx.prettyResponse('error', 'permissions:UNKNOWN_SLASH'),
          });

        return executeUsersByUsedCommandTop(
          ctx,
          commandInMenhera.name,
          page,
          ctx.authorData.selectedColor,
        );
      }

      case 'caçar': {
        const selectedOption = ctx.getOption<DatabaseHuntingTypes>('caça', false, true);
        const huntType = selectedOption.substring(0, selectedOption.length - 1) as ApiHuntingTypes;
        const topMode = ctx.getOption<'success'>('ordenar', false, true);
        const page = ctx.getOption<number>('página', false) ?? 0;

        return executeTopHuntStatistics(ctx, huntType, topMode, page);
      }

      case 'apostas': {
        const gameMode = ctx.getOption<'bicho' | 'roulette' | 'coinflip' | 'blackjack'>(
          'jogo',
          false,
          true,
        );
        const topMode = ctx.getOption<'money'>('ordenar', false, true);
        const page = ctx.getOption<number>('página', false) ?? 0;

        return executeGamblingTop(ctx, gameMode, topMode, page);
      }
    }
  },
});

export default TopCommand;
