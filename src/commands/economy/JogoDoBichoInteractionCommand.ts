import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { JOGO_DO_BICHO } from '@structures/Constants';
import Util, { actionRow, disableComponents } from '@utils/Util';
import {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class JogoDoBichoInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'bicho',
      description: '「💶」・Aposte no famoso Jogo do Bicho',
      options: [
        {
          name: 'aposta',
          description: 'Valor da aposta',
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
    const bet = ctx.options.getInteger('aposta');

    if (!bet) {
      const [lastRaffle, nextRaffle] = await Promise.all([
        ctx.client.repositories.bichoRepository.getLastRaffle(),
        ctx.client.repositories.bichoRepository.getNextRaffleDate(),
      ]);

      const embed = new MessageEmbed()
        .setColor(ctx.data.user.selectedColor)
        .setTitle(ctx.locale('commands:bicho.sorted-title'))
        .setDescription(
          ctx.locale('commands:bicho.sorted-description', {
            nextDate: nextRaffle?.date ?? ctx.locale('commands:bicho.no-register'),
            lastDate: lastRaffle?.date ?? ctx.locale('commands:bicho.no-register'),
            value: nextRaffle?.totalBet ?? ctx.locale('commands:bicho.no-register'),
            first: lastRaffle
              ? lastRaffle.sortedNumbers[0].join('-')
              : ctx.locale('commands:bicho.no-register'),
            second: lastRaffle
              ? lastRaffle.sortedNumbers[1].join('-')
              : ctx.locale('commands:bicho.no-register'),
            third: lastRaffle
              ? lastRaffle.sortedNumbers[2].join('-')
              : ctx.locale('commands:bicho.no-register'),
            fourth: lastRaffle
              ? lastRaffle.sortedNumbers[3].join('-')
              : ctx.locale('commands:bicho.no-register'),
            fifth: lastRaffle
              ? lastRaffle.sortedNumbers[4].join('-')
              : ctx.locale('commands:bicho.no-register'),
          }),
        );

      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    if (bet > ctx.data.user.estrelinhas) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.poor') });
      return;
    }

    /*  const nextRaffle = await ctx.client.repositories.bichoRepository.getNextRaffleDate();

    if (!nextRaffle || nextRaffle.date <= Date.now()) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') });
      return;
    } */

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bicho.bet-title'))
      .setColor(ctx.data.user.selectedColor)
      .setDescription(ctx.locale('commands:bicho.bet-description'));

    const firstmenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setOptions([
        { label: ctx.locale('commands:bicho.unity'), value: 'unity' },
        { label: ctx.locale('commands:bicho.ten'), value: 'ten' },
        { label: ctx.locale('commands:bicho.hundred'), value: 'hundred' },
        { label: ctx.locale('commands:bicho.thousand'), value: 'thousand' },
        { label: ctx.locale('commands:bicho.sequence'), value: 'sequence' },
        { label: ctx.locale('commands:bicho.square'), value: 'square' },
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
        const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | BET`);

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
      case 'sequence':
      case 'square':
      case 'corner': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | ${selection.values[0].toUpperCase()}`)
          .setPlaceholder(
            ctx.locale('commands:bicho.animal', { option: ctx.locale('commands:bicho.first') }),
          );

        for (let i = 0; i < 25; i++)
          selectMenu.addOptions({
            label: `${Util.capitalize(JOGO_DO_BICHO[i])}`,
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
      time: 15,
    });

    collector.on('collect', async (int) => {
      await int.deferUpdate();
    });
  }
}
