import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { BICHO_BET_MULTIPLIER, JOGO_DO_BICHO } from '@structures/Constants';
import Util, { actionRow, capitalize, disableComponents, resolveCustomId } from '@utils/Util';
import {
  InteractionCollector,
  MessageActionRow,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
  Modal,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js-light';
import moment from 'moment';

export default class JogoDoBichoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'bicho',
      nameLocalizations: { 'en-US': 'animal' },
      description: '「🦌」・Aposte no famoso Jogo do Bicho',
      descriptionLocalizations: { 'en-US': '「🦌」・Bet on the Animal Game' },
      options: [
        {
          name: 'aposta',
          nameLocalizations: { 'en-US': 'bet' },
          description: 'Valor da aposta',
          descriptionLocalizations: { 'en-US': 'Bet amount' },
          type: 'INTEGER',
          required: false,
          minValue: 1,
          maxValue: 500000,
        },
      ],
      category: 'economy',
      cooldown: 5,
      authorDataFields: ['estrelinhas', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (!ctx.client.shardProcessEnded) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') });
      return;
    }

    const bet = ctx.options.getInteger('aposta');

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
        { label: ctx.locale('commands:bicho.number'), value: 'number' },
        { label: ctx.locale('commands:bicho.one-animal'), value: 'animal' },
        { label: ctx.locale('commands:bicho.sequence'), value: 'sequence' },
        { label: ctx.locale('commands:bicho.corner'), value: 'corner' },
      ]);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([firstmenu])] });

    const selection = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15_000,
      false,
    );

    if (!selection) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [firstmenu]))],
      });
      return;
    }

    const componentsToSend: MessageActionRow[] = [];

    switch (selection.values[0]) {
      case 'number': {
        const modal = new Modal()
          .setCustomId(`${ctx.interaction.id} | MODAL`)
          .setTitle(ctx.locale('commands:bicho.bet-title'));
        const betInput = new TextInputComponent()
          .setCustomId('BET')
          .setMinLength(1)
          .setMaxLength(4)
          .setRequired(true)
          .setStyle('SHORT')
          .setLabel(
            ctx.locale('commands:bicho.label', {
              min: 0,
              max: 9999,
            }),
          );
        modal.setComponents({ type: 1, components: [betInput] });

        selection.showModal(modal);
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

    const filter = (int: MessageComponentInteraction) =>
      int.user.id === ctx.author.id && int.customId.startsWith(ctx.interaction.id);

    const collector = new InteractionCollector(ctx.client, {
      channel: ctx.channel,
      filter,
      idle: selection.values[0].length === 1 ? 25_000 : 20_000,
    });

    const whereToGoAnimals = {
      ONE: 'UNITY',
      SECOND: 'ONE',
      THIRD: 'SECOND',
      CORNER: 'THIRD',
    };

    collector.on('end', (_, reason) => {
      if (reason === 'idle')
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'common:timesup'),
          components: [],
          embeds: [],
        });
    });

    collector.on('collect', async (int) => {
      await int.deferUpdate();

      const newerComponents: MessageActionRow[] = [];

      switch (resolveCustomId(int.customId)) {
        case 'MODAL': {
          collector.stop();

          const userInput = (int as unknown as ModalSubmitInteraction).fields.getTextInputValue(
            'BET',
          );
          const polishedNumber = parseInt(userInput, 10);

          if (Number.isNaN(polishedNumber)) {
            ctx.makeMessage({
              embeds: [],
              components: [],
              content: ctx.prettyResponse('error', 'commands:bicho.invalid-bet'),
            });
            return;
          }

          if (polishedNumber < 0 || polishedNumber > 9999) {
            ctx.makeMessage({
              embeds: [],
              components: [],
              content: ctx.prettyResponse('error', 'commands:bicho.invalid-bet'),
            });
            return;
          }

          ctx.makeMessage({
            embeds: [],
            components: [],
            content: ctx.prettyResponse('success', 'commands:bicho.success'),
          });

          await ctx.client.repositories.starRepository.remove(ctx.author.id, bet);
          ctx.client.jogoDoBichoManager.addBet(ctx.author.id, bet, `${polishedNumber}`);
          return;
        }
        case 'UNITY': {
          collector.stop();
          ctx.makeMessage({
            embeds: [],
            components: [],
            content: ctx.prettyResponse('success', 'commands:bicho.success'),
          });

          await ctx.client.repositories.starRepository.remove(ctx.author.id, bet);
          ctx.client.jogoDoBichoManager.addBet(
            ctx.author.id,
            bet,
            (int as SelectMenuInteraction).values[0],
          );
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
              value: `${(int as SelectMenuInteraction).values[0]} | ${JOGO_DO_BICHO[i]}`,
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
              value: `${(int as SelectMenuInteraction).values[0]} | ${JOGO_DO_BICHO[i]}`,
            });

          newerComponents.push(actionRow([newSelectMenu]));
          ctx.makeMessage({ components: newerComponents });
          break;
        }
      }
    });
  }
}
