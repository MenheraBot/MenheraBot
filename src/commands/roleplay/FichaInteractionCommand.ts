import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { RoleplayUserSchema } from '@roleplay/Types';
import {
  ButtonInteraction,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
  User,
} from 'discord.js-light';
import Util, { actionRow, disableComponents, resolveCustomId } from '@utils/Util';
import { getClassById } from '@roleplay/Utils';
import Classes from '@roleplay/data';
import { emojis } from '@structures/Constants';

export default class FichaInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'ficha',
      description: '【ＲＰＧ】Mostra a ficha de um personagem ou cria a sua própria',
      category: 'roleplay',
      options: [
        {
          name: 'user',
          description: 'Usuário para ver a ficha',
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const optionUser = ctx.options.getUser('user') ?? ctx.author;
    const user = await ctx.client.repositories.roleplayRepository.findUser(optionUser.id);

    if (!user && optionUser.id === ctx.author.id) return FichaInteractionCommand.registerUser(ctx);

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ficha.no-user'),
        ephemeral: true,
      });
      return;
    }

    FichaInteractionCommand.showFicha(ctx, user, optionUser);
  }

  static async showFicha(
    ctx: InteractionCommandContext,
    user: RoleplayUserSchema,
    optionUser: User,
  ): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:ficha.show.title', { user: optionUser.username }))
      .setColor(ctx.data.user.selectedColor)
      .addFields([
        {
          name: ctx.prettyResponse('list', 'commands:ficha.show.base'),
          value: `${emojis.blood} | **${ctx.locale('common:roleplay.life')}**: ${user.life}\n${
            emojis.mana
          } | **${ctx.locale('common:roleplay.mana')}**: ${user.mana}`,
        },
        {
          name: ctx.prettyResponse('crown', 'commands:ficha.show.player'),
          value: `${emojis.level} | **${ctx.locale('common:roleplay.level')}**: ${user.level}`,
          inline: true,
        },
      ]);

    ctx.makeMessage({ embeds: [embed] });
  }

  static async registerUser(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.locale('commands:ficha.register.title'))
      .setDescription(ctx.locale('commands:ficha.register.description'));

    const selector = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    for (let i = 1; i <= Object.keys(Classes).length; i++) {
      selector.addOptions({
        label: ctx.locale(`roleplay:classes.${i as 1}.name`),
        value: `${i}`,
      });

      embed.addField(
        ctx.locale(`roleplay:classes.${i as 1}.name`),
        ctx.locale(`roleplay:classes.${i as 1}.description`),
        true,
      );
    }

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selector])] });

    const selectedClass =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        45_000,
      );

    if (!selectedClass) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
      });
      return;
    }

    const resolvedSelectedClass = getClassById(Number(selectedClass.values[0]));

    embed
      .setTitle(ctx.locale('commands:ficha.register.confirm-title'))
      .setDescription(
        ctx.locale('commands:ficha.register.confirm-description', {
          class: ctx.locale(`roleplay:classes.${resolvedSelectedClass.id as 1}.name`),
        }),
      )
      .setFields([]);

    const confirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | CONFIRM`)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('common:confirm'));

    const negateButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEGATE`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('common:negate'));

    ctx.makeMessage({ embeds: [embed], components: [actionRow([confirmButton, negateButton])] });

    const confirmRegister = await Util.collectComponentInteractionWithStartingId<ButtonInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      25_000,
    );

    if (!confirmRegister) {
      ctx.makeMessage({
        components: [
          actionRow(disableComponents(ctx.locale('common:timesup'), [confirmButton, negateButton])),
        ],
      });
      return;
    }

    if (resolveCustomId(confirmRegister.customId) === 'NEGATE') {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:ficha.register.negate'),
      });
      return;
    }

    await ctx.client.repositories.roleplayRepository.registerUser(ctx.author.id, {
      class: resolvedSelectedClass.id,
      life: resolvedSelectedClass.data.baseMaxLife,
      mana: resolvedSelectedClass.data.baseMaxMana,
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:ficha.register.success'),
      embeds: [],
      components: [],
    });
  }
}
