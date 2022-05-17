import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { BICHO_BET_MULTIPLIER, JOGO_DO_BICHO } from '@structures/Constants';
import Util, { actionRow, capitalize, disableComponents, resolveCustomId } from '@utils/Util';
import {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';
import moment from 'moment';

export default class JogoDoBichoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'animal_game',
      nameLocalizations: { 'pt-BR': 'jogo_do_bicho' },
      description: '「🦌」・Bet on the Animal Game',
      descriptionLocalizations: { 'pt-BR': '「🦌」・Aposte no famoso Jogo do Bicho' },
      options: [
        {
          name: 'bet',
          nameLocalizations: { 'pt-BR': 'aposta' },
          description: 'Bet amount',
          descriptionLocalizations: { 'pt-BR': 'Valor da aposta' },
          type: 'INTEGER',
          required: false,
          minValue: 1,
        },
      ],
      category: 'economy',
      cooldown: 8,
      authorDataFields: ['estrelinhas', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (!ctx.client.shardProcessEnded) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') });
      return;
    }

    const bet = ctx.options.getInteger('bet');

    if (!bet) {
      const lastRaffle = await ctx.client.jogoDoBichoManager.lastGameStatus();
      const nextRaffle = await ctx.client.jogoDoBichoManager.currentGameStatus();

      moment.locale(ctx.data.server.lang);

      const embed = new MessageEmbed()
        .setColor(ctx.data.user.selectedColor)
        .setTitle(ctx.locale('commands:bicho.sorted-title'))
        .setDescription(
          ctx.locale('commands:bicho.sorted-description', {
            nextDate: nextRaffle?.dueDate
              ? moment.utc(nextRaffle.dueDate - Date.now()).format('HH:mm:ss')
              : ctx.locale('commands:bicho.no-register'),
            lastDate: lastRaffle?.dueDate
              ? moment(lastRaffle.dueDate).fromNow()
              : ctx.locale('commands:bicho.no-register'),
            value:
              nextRaffle?.bets.reduce((p, c) => p + c.bet, 0) ??
              ctx.locale('commands:bicho.no-register'),
            first: lastRaffle
              ? lastRaffle.results[0].join(', ')
              : ctx.locale('commands:bicho.no-register'),
            second: lastRaffle
              ? lastRaffle.results[1].join(', ')
              : ctx.locale('commands:bicho.no-register'),
            third: lastRaffle
              ? lastRaffle.results[2].join(', ')
              : ctx.locale('commands:bicho.no-register'),
            fourth: lastRaffle
              ? lastRaffle.results[3].join(', ')
              : ctx.locale('commands:bicho.no-register'),
            fifth: lastRaffle
              ? lastRaffle.results[4].join(', ')
              : ctx.locale('commands:bicho.no-register'),
            biggestProfit: lastRaffle?.biggestProfit ?? 0,
          }),
        );

      if (nextRaffle?.bets.some((a) => a.id === ctx.author.id))
        embed.addField(
          ctx.locale('commands:bicho.in'),
          ctx.locale('commands:bicho.in-description'),
        );

      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    if (bet > ctx.data.user.estrelinhas) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.poor') });
      return;
    }

    const nextRaffle = await ctx.client.jogoDoBichoManager.currentGameStatus();

    if (!nextRaffle || nextRaffle.dueDate <= Date.now()) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') });
      return;
    }

    if (!(await ctx.client.jogoDoBichoManager.canRegister(ctx.author.id))) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.already') });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bicho.bet-title'))
      .setColor(ctx.data.user.selectedColor)
      .setDescription(ctx.locale('commands:bicho.bet-description', BICHO_BET_MULTIPLIER));

    const firstmenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setOptions([
        { label: ctx.locale('commands:bicho.unity'), value: 'unity' },
        { label: ctx.locale('commands:bicho.ten'), value: 'ten' },
        { label: ctx.locale('commands:bicho.hundred'), value: 'hundred' },
        { label: ctx.locale('commands:bicho.thousand'), value: 'thousand' },
        { label: ctx.locale('commands:bicho.one-animal'), value: 'animal' },
        { label: ctx.locale('commands:bicho.sequence'), value: 'sequence' },
        { label: ctx.locale('commands:bicho.corner'), value: 'corner' },
      ]);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([firstmenu])] });

    const selection = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
    );

    if (!selection) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [firstmenu]))],
      });
      return;
    }

    const componentsToSend: MessageActionRow[] = [];

    switch (selection.values[0]) {
      case 'unity': {
        const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | UNITY`);

        for (let i = 0; i < 10; i++) selectMenu.addOptions({ label: `${i}`, value: `${i}` });
        componentsToSend.push(actionRow([selectMenu]));
        break;
      }
      case 'ten':
      case 'hundred':
      case 'thousand': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | ${selection.values[0].toUpperCase()}`)
          .setPlaceholder(
            ctx.locale('commands:bicho.select', {
              option: ctx.locale(`commands:bicho.${selection.values[0]}`),
            }),
          );

        for (let i = 0; i < 10; i++) selectMenu.addOptions({ label: `${i}`, value: `${i}` });
        componentsToSend.push(actionRow([selectMenu]));
        break;
      }
      case 'animal':
      case 'sequence':
      case 'corner': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(
            `${ctx.interaction.id} | ${
              selection.values[0] !== 'animal' ? selection.values[0].toUpperCase() : 'UNITY'
            }`,
          )
          .setPlaceholder(
            ctx.locale('commands:bicho.animal', { option: ctx.locale('commands:bicho.first') }),
          );

        for (let i = 0; i < 25; i++)
          selectMenu.addOptions({
            label: `${capitalize(JOGO_DO_BICHO[i])}`,
            value: `${JOGO_DO_BICHO[i]}`,
          });
        componentsToSend.push(actionRow([selectMenu]));
        break;
      }
    }

    ctx.makeMessage({ components: componentsToSend });

    const filter = (int: SelectMenuInteraction) =>
      int.user.id === ctx.author.id && int.customId.startsWith(ctx.interaction.id);

    const collector = ctx.channel.createMessageComponentCollector({
      filter,
      componentType: 'SELECT_MENU',
      max: 10,
      time: 15000,
    });

    const whereToGoNumber = {
      TEN: 'UNITY',
      HUNDRED: 'TEN',
      THOUSAND: 'HUNDRED',
    };

    const whereToGoAnimals = {
      ONE: 'UNITY',
      SECOND: 'ONE',
      THIRD: 'SECOND',
      CORNER: 'THIRD',
    };

    collector.on('collect', async (int) => {
      await int.deferUpdate();
      collector.resetTimer();

      const newerComponents: MessageActionRow[] = [];

      switch (resolveCustomId(int.customId)) {
        case 'TEN':
        case 'HUNDRED':
        case 'THOUSAND': {
          const newSelectMenu = new MessageSelectMenu()
            .setCustomId(
              `${ctx.interaction.id} | ${whereToGoNumber[resolveCustomId(int.customId) as 'TEN']}`,
            )
            .setPlaceholder(
              ctx.locale('commands:bicho.select', {
                option: ctx.locale(
                  `commands:bicho.${
                    whereToGoNumber[resolveCustomId(int.customId) as 'TEN'].toLowerCase() as 'ten'
                  }`,
                ),
              }),
            );

          for (let i = 0; i < 10; i++)
            newSelectMenu.addOptions({
              label: `${int.values[0]}${i}`,
              value: `${int.values[0]}${i}`,
            });
          newerComponents.push(actionRow([newSelectMenu]));
          ctx.makeMessage({ components: newerComponents });
          break;
        }
        case 'UNITY': {
          collector.stop();
          ctx.makeMessage({
            embeds: [],
            components: [],
            content: ctx.prettyResponse('success', 'commands:bicho.success'),
          });

          await ctx.client.repositories.starRepository.remove(ctx.author.id, bet);
          ctx.client.jogoDoBichoManager.addBet(ctx.author.id, bet, int.values[0]);
          break;
        }
        case 'SEQUENCE': {
          const newSelectMenu = new MessageSelectMenu()
            .setCustomId(`${ctx.interaction.id} | UNITY`)
            .setPlaceholder(
              ctx.locale('commands:bicho.animal', { option: ctx.locale('commands:bicho.second') }),
            );

          for (let i = 0; i < 25; i++)
            newSelectMenu.addOptions({
              label: `${capitalize(JOGO_DO_BICHO[i])}`,
              value: `${int.values[0]} | ${JOGO_DO_BICHO[i]}`,
            });

          newerComponents.push(actionRow([newSelectMenu]));
          ctx.makeMessage({ components: newerComponents });
          break;
        }
        case 'SECOND':
        case 'ONE':
        case 'CORNER':
        case 'THIRD': {
          const newSelectMenu = new MessageSelectMenu()
            .setCustomId(
              `${ctx.interaction.id} | ${
                whereToGoAnimals[resolveCustomId(int.customId) as 'THIRD']
              }`,
            )
            .setPlaceholder(
              ctx.locale('commands:bicho.animal', {
                option: '',
              }),
            );

          for (let i = 0; i < 25; i++)
            newSelectMenu.addOptions({
              label: `${capitalize(JOGO_DO_BICHO[i])}`,
              value: `${int.values[0]} | ${JOGO_DO_BICHO[i]}`,
            });

          newerComponents.push(actionRow([newSelectMenu]));
          ctx.makeMessage({ components: newerComponents });
          break;
        }
      }
    });
  }
}
