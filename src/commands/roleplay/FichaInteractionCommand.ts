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
import { getClassById, getClasses, getRaces } from '@roleplay/utils/ClassUtils';
import { getUserNextLevelXp } from '@roleplay/utils/Calculations';

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
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:ficha.show.title', { name: mentioned.username }))
      .setDescription(
        `${ctx.prettyResponse('heart', 'commands:ficha.show.race')}: **${ctx.locale(
          `roleplay:races.${user.race as 1}.name`,
        )}**\n${ctx.prettyResponse('crown', 'commands:ficha.show.class')}: **${ctx.locale(
          `roleplay:classes.${user.class as 1}.name`,
        )}**\n${ctx.prettyResponse('blood', 'common:roleplay.life')}: **${user.life} / ${
          user.maxLife
        }**\n${ctx.prettyResponse('mana', 'common:roleplay.mana')}: **${user.mana} / ${
          user.maxMana
        }**\n${ctx.prettyResponse('damage', 'common:roleplay.damage')}: **${
          user.damage
        }**\n${ctx.prettyResponse('armor', 'common:roleplay.armor')}: **${
          user.armor
        }**\n${ctx.prettyResponse('intelligence', 'common:roleplay.intelligence')}: **${
          user.intelligence
        }**\n${ctx.prettyResponse('level', 'commands:ficha.show.level')}: **${
          user.level
        }**\n${ctx.prettyResponse('experience', 'commands:ficha.show.experience')}: **${
          user.experience
        } / ${getUserNextLevelXp(user.level)}**`,
      )
      .setColor(ctx.data.user.selectedColor);

    const abilityTreeButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ABILITY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.abilitiesButton'));

    const statusTreeButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | STATUS`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.statsButton'));

    if (ctx.author.id !== user.id) statusTreeButton.setDisabled(true);

    await ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([abilityTreeButton, statusTreeButton])],
    });

    const selectedOption = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
    );

    if (!selectedOption) {
      ctx.makeMessage({
        components: [
          actionRow(
            disableComponents(ctx.locale('common:timesup'), [abilityTreeButton, statusTreeButton]),
          ),
        ],
      });
      return;
    }

    if (resolveCustomId(selectedOption.customId) === 'STATUS') {
      embed.setDescription(`${user.life} ${user.mana} ${user.level}`);

      if (user.holyBlessings.battle > 0 || user.holyBlessings.vitality > 0)
        embed.addField('PONTOS', 'VOCÊ TEM PONTOS PRA USAR');

      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    if (user.holyBlessings.ability > 0) embed.addField('PONTOS', 'VOCÊ TEM PONTOS PRA USAR');

    console.log('a');
  }

  static async registerUser(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.locale('commands:ficha.register.title'))
      .setDescription(ctx.locale('commands:ficha.register.description'));

    const selector = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    for (let i = 1; i <= getClasses().length; i++) {
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

    selector.setOptions([]);
    embed.setFields([]);

    for (let i = 1; i <= getRaces().length; i++) {
      selector.addOptions({
        label: ctx.locale(`roleplay:races.${i as 1}.name`),
        value: `${i}`,
      });

      embed.addField(
        ctx.locale(`roleplay:races.${i as 1}.name`),
        ctx.locale(`roleplay:races.${i as 1}.description`),
        true,
      );
    }

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selector])] });

    const selectedRace =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        45_000,
      );

    if (!selectedRace) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
      });
      return;
    }

    embed
      .setTitle(ctx.locale('commands:ficha.register.confirm-title'))
      .setDescription(
        ctx.locale('commands:ficha.register.confirm-description', {
          class: ctx.locale(`roleplay:classes.${selectedClass.values[0] as '1'}.name`),
          race: ctx.locale(`roleplay:races.${selectedRace.values[0] as '1'}.name`),
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

    const resolvedClass = getClassById(Number(selectedClass.values[0]));

    const registerStatus = {
      class: Number(selectedClass.values[0]),
      race: Number(selectedRace.values[0]),
      armor: resolvedClass.data.baseArmor,
      damage: resolvedClass.data.baseDamage,
      intelligence: resolvedClass.data.baseIntelligence,
      maxLife: resolvedClass.data.baseMaxLife,
      maxMana: resolvedClass.data.baseMaxMana,
      life: resolvedClass.data.baseMaxLife,
      mana: resolvedClass.data.baseMaxMana,
      abilities: [{ id: resolvedClass.data.abilityTree, level: 0, blesses: 0 }],
      holyBlessings: { ability: 0, vitality: 0, battle: 0 },
    };

    await ctx.client.repositories.roleplayRepository.registerUser(ctx.author.id, registerStatus);

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:ficha.register.success'),
      embeds: [],
      components: [],
    });
  }
}
