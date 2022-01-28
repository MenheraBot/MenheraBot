import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { RoleplayUserSchema } from '@roleplay/Types';
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
  User,
} from 'discord.js-light';
import Util, { actionRow, disableComponents, resolveCustomId } from '@utils/Util';
import { getClassById, getClasses, getRaces } from '@roleplay/utils/ClassUtils';
import { getUserNextLevelXp, makeBlessingStatusUpgrade } from '@roleplay/utils/Calculations';
import { ToBLess } from '@utils/Types';

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
      if (user.holyBlessings.battle === 0 && user.holyBlessings.vitality === 0) {
        ctx.makeMessage({
          components: [],
          embeds: [],
          content: ctx.prettyResponse('error', 'commands:ficha.show.no-blesses'),
        });
        return;
      }

      embed
        .setDescription(
          ctx.locale('commands:ficha.show.blessings', {
            vitality: user.holyBlessings.vitality,
            battle: user.holyBlessings.battle,
          }),
        )
        .addFields([
          {
            name: ctx.locale('commands:ficha.show.vitality'),
            value: `${ctx.prettyResponse('blood', 'common:roleplay.life')}: **${
              user.maxLife
            }**\n${ctx.prettyResponse('mana', 'common:roleplay.mana')}: **${user.maxMana}**`,
            inline: true,
          },
          {
            name: ctx.locale('commands:ficha.show.battle'),
            value: `${ctx.prettyResponse('damage', 'common:roleplay.damage')}: **${
              user.damage
            }**\n${ctx.prettyResponse('armor', 'common:roleplay.armor')}: **${
              user.armor
            }**\n${ctx.prettyResponse('intelligence', 'common:roleplay.intelligence')}: **${
              user.intelligence
            }**`,
            inline: true,
          },
        ]);

      const vitalityButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | VITALITY`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('commands:ficha.show.vitality'));

      const battleButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | BATTLE`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('commands:ficha.show.battle'));

      if (user.holyBlessings.vitality === 0) vitalityButton.setDisabled(true);
      if (user.holyBlessings.battle === 0) battleButton.setDisabled(true);

      ctx.makeMessage({ embeds: [embed], components: [actionRow([vitalityButton, battleButton])] });

      const buttonSelected = await Util.collectComponentInteractionWithStartingId(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        15000,
      );

      if (!buttonSelected) {
        ctx.makeMessage({
          components: [
            actionRow(
              disableComponents(ctx.locale('common:timesup'), [vitalityButton, battleButton]),
            ),
          ],
        });
        return;
      }

      const pointsToUse =
        resolveCustomId(buttonSelected.customId) === 'VITALITY'
          ? user.holyBlessings.vitality
          : user.holyBlessings.battle;

      const selectAmount = new MessageSelectMenu()
        .setCustomId(`${ctx.interaction.id} | AMOUNT`)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder(ctx.locale('commands:ficha.show.select-amount'));

      for (let i = 1; i <= pointsToUse && i <= 25; i++)
        selectAmount.addOptions({ label: `${i}`, value: `${i}` });

      ctx.makeMessage({ components: [actionRow([selectAmount])] });

      const selectedAmount =
        await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
          ctx.channel,
          ctx.author.id,
          ctx.interaction.id,
        );

      if (!selectedAmount) {
        ctx.makeMessage({
          components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectAmount]))],
        });
        return;
      }

      const points = Number(selectedAmount.values[0]);

      embed.setFooter({ text: ctx.locale('commands:ficha.show.select-type', { count: points }) });

      const toSendComponents: MessageActionRow[] = [];

      if (resolveCustomId(buttonSelected.customId) === 'VITALITY') {
        const lifeButton = new MessageButton()
          .setCustomId(`${ctx.interaction.id} | LIFE`)
          .setStyle('DANGER')
          .setLabel(ctx.locale('common:roleplay.life'));

        const manaButton = new MessageButton()
          .setCustomId(`${ctx.interaction.id} | MANA`)
          .setStyle('PRIMARY')
          .setLabel(ctx.locale('common:roleplay.mana'));

        toSendComponents.push(actionRow([lifeButton, manaButton]));
      } else {
        const damageButton = new MessageButton()
          .setCustomId(`${ctx.interaction.id} | DAMAGE`)
          .setStyle('PRIMARY')
          .setLabel(ctx.locale('common:roleplay.damage'));

        const armorButton = new MessageButton()
          .setCustomId(`${ctx.interaction.id} | ARMOR`)
          .setStyle('PRIMARY')
          .setLabel(ctx.locale('common:roleplay.armor'));

        const intelligenceButton = new MessageButton()
          .setCustomId(`${ctx.interaction.id} | INTELLIGENCE`)
          .setStyle('PRIMARY')
          .setLabel(ctx.locale('common:roleplay.intelligence'));

        toSendComponents.push(actionRow([damageButton, armorButton, intelligenceButton]));
      }

      ctx.makeMessage({ embeds: [embed], components: toSendComponents });

      const statusSelected = await Util.collectComponentInteractionWithStartingId(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
      );

      if (!statusSelected) {
        ctx.makeMessage({
          components: [],
          embeds: [],
          content: ctx.prettyResponse('error', 'common:timesup'),
        });
        return;
      }

      const newStatus = makeBlessingStatusUpgrade(
        resolveCustomId(statusSelected.customId).toLowerCase() as ToBLess,
        points,
      );

      const databaseField =
        resolveCustomId(statusSelected.customId).toLowerCase() === 'mana' ||
        resolveCustomId(statusSelected.customId).toLowerCase() === 'life'
          ? `max${Util.capitalize(resolveCustomId(statusSelected.customId).toLowerCase())}`
          : resolveCustomId(statusSelected.customId).toLowerCase();

      const blessingField = resolveCustomId(buttonSelected.customId).toLowerCase() as
        | 'vitality'
        | 'battle';

      const oldHolyBlessings = user.holyBlessings;

      oldHolyBlessings[blessingField] -= points;

      await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
        $inc: { [databaseField]: newStatus },
        holyBlessings: oldHolyBlessings,
      });

      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('success', 'commands:ficha.show.status-success'),
      });

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
