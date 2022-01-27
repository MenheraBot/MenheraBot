import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { RoleplayUserSchema } from '@roleplay/Types';
import {
  ButtonInteraction,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
  User,
} from 'discord.js-light';
import Util, { actionRow, disableComponents, resolveCustomId } from '@utils/Util';
import Handler from '@roleplay/Handler';
import HttpRequests from '@utils/HTTPrequests';

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
    mentioned: User,
  ): Promise<void> {
    ctx.defer();
    const userAvatarLink = mentioned.displayAvatarURL({ format: 'png' });
    const dmg = user.damage + user?.weapon?.damage;
    const ptr = user.armor + user?.protection?.armor;
    const ap = user.abilityPower;

    const UserDataToSend = {
      life: user.life,
      maxLife: user.maxLife,
      mana: user.mana,
      maxMana: user.maxMana,
      xp: user.xp,
      level: user.level,
      nextLevelXp: user.nextLevelXp,
      damage: dmg,
      armor: ptr,
      abilityPower: ap,
      tag: mentioned.tag,
      money: user.money,
    };

    const i18nData = {
      damage: ctx.locale('commands:ficha.show.dmg'),
      armor: ctx.locale('commands:ficha.show.armor'),
      ap: ctx.locale('commands:ficha.show.ap'),
      money: ctx.locale('commands:ficha.show.money'),
      userClass: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
    };

    const res = await HttpRequests.statusRequest(UserDataToSend, userAvatarLink, i18nData);

    if (res.err) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:http-error') });
      return;
    }
    await ctx.defer({
      files: [new MessageAttachment(res.data, 'status.png')],
    });
  }

  static async registerUser(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.locale('commands:ficha.register.title'))
      .setDescription(ctx.locale('commands:ficha.register.description'));

    const selector = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    for (let i = 0; i <= Object.keys(Handler.abilities).length; i++) {
      selector.addOptions({
        label: ctx.locale(
          `roleplay:register-classes.${Object.keys(Handler.abilities)[i] as 'assassin'}`,
        ),
        value: ctx.locale(
          `roleplay:register-classes.${Object.keys(Handler.abilities)[i] as 'assassin'}`,
        ),
      });

      embed.setDescription(
        (embed.description += `\n${ctx.locale(
          `roleplay:register-classes.${Object.keys(Handler.abilities)[i] as 'assassin'}`,
        )}`),
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

    embed
      .setTitle(ctx.locale('commands:ficha.register.confirm-title'))
      .setDescription(
        ctx.locale('commands:ficha.register.confirm-description', {
          class: ctx.locale(`roleplay:register-classes.${selectedClass.values[0] as 'assassin'}`),
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

    await ctx.client.repositories.roleplayRepository.registerUser(
      ctx.author.id,
      selectedClass.values[0],
    );

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:ficha.register.success'),
      embeds: [],
      components: [],
    });
  }
}
