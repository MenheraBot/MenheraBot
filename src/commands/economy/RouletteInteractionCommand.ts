import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ROULETTE_NUMBERS } from '@structures/Constants';
import Util, { actionRow, resolveCustomId, resolveSeparatedStrings } from '@utils/Util';
import {
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class RouletteInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'roleta',
      description: '「🎡」・O famoso jogo da roleta, aposte em algo e ganhe milhões de estrelinhas',
      options: [
        {
          name: 'aposta',
          description: 'Valor da aposta',
          type: 'INTEGER',
          required: true,
          minValue: 1,
          maxValue: 15000,
        },
      ],
      category: 'economy',
      cooldown: 8,
      authorDataFields: ['estrelinhas', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const bet = ctx.options.getInteger('aposta', true);

    if (ctx.data.user.estrelinhas < bet) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:roleta.poor') });
      return;
    }

    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.prettyResponse('estrelinhas', 'commands:roleta.title'))
      .setDescription(ctx.locale('commands:roleta.description'))
      .addFields([
        {
          name: ctx.locale('commands:roleta.straight-up-title'),
          value: ctx.locale('commands:roleta.straight-up-value', { profit: bet + bet * 17 }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.split-title'),
          value: ctx.locale('commands:roleta.split-value', { profit: bet + bet * 8 }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.dozens-title'),
          value: ctx.locale('commands:roleta.dozens-value', { profit: bet + bet * 2 }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.color-title'),
          value: ctx.locale('commands:roleta.color-value', { profit: bet * 2 }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.oddeven-title'),
          value: ctx.locale('commands:roleta.oddeven-value', { profit: bet * 2 }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.lowhigh-title'),
          value: ctx.locale('commands:roleta.lowhigh-value', { profit: bet * 2 }),
          inline: true,
        },
      ]);

    const straightButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | STRAIGHT`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:roleta.straight-up-title'));

    const splitButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | SPLIT`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:roleta.split-title'));

    const dozensButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | DOZENS`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:roleta.dozens-title'));

    const colorButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | COLOR`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:roleta.color-title'));

    const oddevenButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ODDEVEN`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:roleta.oddeven-title'));

    const lowhighButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | LOWHIGH`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:roleta.lowhigh-title'));

    ctx.makeMessage({
      embeds: [embed],
      components: [
        actionRow([straightButton, splitButton, dozensButton]),
        actionRow([colorButton, oddevenButton, lowhighButton]),
      ],
    });

    const selector = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      14000,
    );

    if (!selector) {
      ctx.deleteReply();
      return;
    }

    const operation = resolveCustomId(selector.customId);
    const toSendComponents: MessageActionRow[] = [];

    switch (operation) {
      case 'STRAIGHT': {
        const firstSelectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET 1`)
          .setPlaceholder(ctx.locale('commands:roleta.make-bet'));

        const secondSelectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET 2`)
          .setPlaceholder(ctx.locale('commands:roleta.make-bet'));

        for (let i = 0; i <= 18; i++)
          firstSelectMenu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${i}`,
            value: `${i}`,
          });

        for (let i = 19; i <= 36; i++)
          secondSelectMenu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${i}`,
            value: `${i}`,
          });

        toSendComponents.push(actionRow([firstSelectMenu]));
        toSendComponents.push(actionRow([secondSelectMenu]));
        break;
      }
      case 'SPLIT': {
        const firstSelectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | FIRST`)
          .setPlaceholder(ctx.locale('commands:roleta.main-number'));

        const secondSelectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | SECOND`)
          .setPlaceholder(ctx.locale('commands:roleta.main-number'));

        for (let i = 0; i <= 18; i++)
          firstSelectMenu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${i}`,
            value: `${i}`,
          });

        for (let i = 19; i <= 36; i++)
          secondSelectMenu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${i}`,
            value: `${i}`,
          });

        toSendComponents.push(actionRow([firstSelectMenu]));
        toSendComponents.push(actionRow([secondSelectMenu]));
        break;
      }
      case 'ODDEVEN': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET`)
          .setPlaceholder(ctx.locale('commands:roleta.make-bet'))
          .setOptions([
            { label: ctx.locale('commands:roleta.odd'), value: 'odd' },
            { label: ctx.locale('commands:roleta.even'), value: 'even' },
          ]);

        toSendComponents.push(actionRow([selectMenu]));

        break;
      }
      case 'COLOR': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET`)
          .setPlaceholder(ctx.locale('commands:roleta.make-bet'))
          .setOptions([
            { label: ctx.locale('commands:roleta.red'), value: 'red' },
            { label: ctx.locale('commands:roleta.black'), value: 'black' },
          ]);

        toSendComponents.push(actionRow([selectMenu]));

        break;
      }
      case 'LOWHIGH': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET`)
          .setPlaceholder(ctx.locale('commands:roleta.make-bet'))
          .setOptions([
            { label: ctx.locale('commands:roleta.low'), value: 'low' },
            { label: ctx.locale('commands:roleta.high'), value: 'high' },
          ]);

        toSendComponents.push(actionRow([selectMenu]));

        break;
      }
      case 'DOZENS': {
        const selectMenu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET`)
          .setPlaceholder(ctx.locale('commands:roleta.make-bet'))
          .setOptions([
            { label: ctx.locale('commands:roleta.first'), value: 'first' },
            { label: ctx.locale('commands:roleta.second'), value: 'second' },
            { label: ctx.locale('commands:roleta.third'), value: 'third' },
          ]);

        toSendComponents.push(actionRow([selectMenu]));

        break;
      }
    }
    ctx.makeMessage({ components: toSendComponents });

    const filter = (int: MessageComponentInteraction) =>
      int.user.id === ctx.author.id && int.customId.startsWith(ctx.interaction.id);

    const collector = ctx.channel.createMessageComponentCollector({ filter, time: 14000 });

    const randomValue = ROULETTE_NUMBERS[Math.floor(Math.random() * 36)];

    const didWin = (profit: number, selection: string) => {
      collector.stop();

      const winEmbed = new MessageEmbed()
        .setColor(ctx.data.user.selectedColor)
        .setTitle(ctx.locale('commands:roleta.win-title'))
        .setDescription(
          ctx.locale('commands:roleta.win', {
            profit,
            number: randomValue,
            operation,
            selection:
              operation === 'STRAIGHT' || operation === 'SPLIT'
                ? selection
                : ctx.locale(`commands:roleta.${selection as 'first'}`),
          }),
        );

      ctx.client.repositories.starRepository.add(ctx.author.id, profit);

      ctx.makeMessage({
        embeds: [winEmbed],
        components: [],
      });
    };

    const didLose = (selection: string) => {
      collector.stop();

      const loseEmbed = new MessageEmbed()
        .setColor(ctx.data.user.selectedColor)
        .setTitle(ctx.locale('commands:roleta.lose-title'))
        .setDescription(
          ctx.locale('commands:roleta.lose', {
            bet,
            number: randomValue,
            operation,
            selection:
              operation === 'STRAIGHT' || operation === 'SPLIT'
                ? selection
                : ctx.locale(`commands:roleta.${selection as 'first'}`),
          }),
        );

      ctx.client.repositories.starRepository.remove(ctx.author.id, bet);

      ctx.makeMessage({
        embeds: [loseEmbed],
        components: [],
      });
    };

    collector.on('collect', async (int: SelectMenuInteraction) => {
      await int.deferUpdate();
      const resolvedId = resolveCustomId(int.customId);

      if (operation === 'SPLIT' && resolvedId !== 'BET') {
        const numberSelected = Number(int.values[0]);
        const menu = new MessageSelectMenu()
          .setCustomId(`${ctx.interaction.id} | BET`)
          .setPlaceholder(ctx.locale('commands:roleta.select-bord'));

        if (numberSelected < 36 && numberSelected !== 0)
          menu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 1}`,
            value: `${numberSelected} | ${numberSelected + 1}`,
          });

        if (numberSelected < 34 && numberSelected !== 0)
          menu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 3}`,
            value: `${numberSelected} | ${numberSelected + 3}`,
          });

        if (numberSelected > 2)
          menu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${numberSelected - 3}`,
            value: `${numberSelected} | ${numberSelected - 3}`,
          });

        if (numberSelected > 0)
          menu.addOptions({
            label: `${ctx.locale('commands:roleta.number')} ${numberSelected - 1}`,
            value: `${numberSelected} | ${numberSelected - 1}`,
          });

        if (numberSelected === 0) {
          menu.addOptions([
            {
              label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 1}`,
              value: `${numberSelected} | ${numberSelected + 1}`,
            },
            {
              label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 2}`,
              value: `${numberSelected} | ${numberSelected + 2}`,
            },
            {
              label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 1}`,
              value: `${numberSelected} | ${numberSelected + 3}`,
            },
          ]);
        }
        ctx.makeMessage({ components: [actionRow([menu])] });
        return;
      }

      switch (operation) {
        case 'STRAIGHT': {
          if (Number(int.values[0]) !== randomValue.value) return didLose(int.values[0]);
          return didWin(bet + bet * 35, int.values[0]);
        }
        case 'SPLIT': {
          if (!resolveSeparatedStrings(int.values[0]).includes(`${randomValue.value}`))
            return didLose(int.values[0]);
          return didWin(bet + bet * 17, int.values[0]);
        }
        case 'ODDEVEN': {
          if (randomValue.color === 'green') return didLose(int.values[0]);
          if (int.values[0] !== randomValue.parity) return didLose(int.values[0]);
          return didWin(bet * 2, int.values[0]);
        }
        case 'COLOR': {
          if (randomValue.color === 'green') return didLose(int.values[0]);
          if (int.values[0] !== randomValue.color) return didLose(int.values[0]);
          return didWin(bet * 2, int.values[0]);
        }
        case 'LOWHIGH': {
          if (randomValue.color === 'green') return didLose(int.values[0]);
          if (int.values[0] !== randomValue.size) return didLose(int.values[0]);
          return didWin(bet * 2, int.values[0]);
        }
        case 'DOZENS': {
          if (randomValue.color === 'green') return didLose(int.values[0]);
          if (int.values[0] !== randomValue.dozen) return didLose(int.values[0]);
          return didWin(bet + bet * 2, int.values[0]);
        }
      }
    });
  }
}
