/* eslint-disable no-nested-ternary */
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
import {
  getAbilityById,
  getClassById,
  getClasses,
  getRaceById,
  getRaces,
  getUserAvailableAbilities,
} from '@roleplay/utils/DataUtils';
import {
  getAbilityNextLevelBlessings,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
  makeBlessingStatusUpgrade,
  nextLevelXp,
} from '@roleplay/utils/Calculations';
import { BLESSES_DIFFERENCE_LIMIT } from '@roleplay/Constants';

export default class FichaInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'ficha',
      description: '【ＲＰＧ】📜 | Mostra a ficha de um personagem ou cria a sua própria',
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
      authorDataFields: ['selectedColor', 'badges'],
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

    return FichaInteractionCommand.showFicha(ctx, user, optionUser);
  }

  static async abilityBlessing(
    ctx: InteractionCommandContext,
    user: RoleplayUserSchema,
    embed: MessageEmbed,
    mentioned: User,
  ): Promise<void> {
    embed
      .setDescription('')
      .setTitle(ctx.locale('commands:ficha.show.abilities.title', { name: mentioned.username }));

    if (user.id === mentioned.id && user.holyBlessings.ability === 0)
      embed.setFooter({ text: ctx.locale('commands:ficha.show.abilities.no-blesses') });

    user.abilities.forEach((a) => {
      embed.addField(
        ctx.locale(`abilities:${a.id as 100}.name`),
        `${ctx.prettyResponse('level', 'common:roleplay.level')}: **${
          a.level
        }**\n${ctx.prettyResponse('experience', 'common:roleplay.blesses')}: **${
          a.blesses
        } / ${getAbilityNextLevelBlessings(a.level)}**`,
      );
    });

    const upgradeButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | UPGRADE`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.abilities.upgrade'));

    const unlockButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | UNLOCK`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.abilities.unlock'));

    ctx.makeMessage({
      embeds: [embed],
      components:
        user.id !== ctx.author.id || user.holyBlessings.ability === 0
          ? []
          : [actionRow([upgradeButton, unlockButton])],
    });

    if (user.id !== ctx.author.id || user.holyBlessings.ability === 0) return;

    const buttonClicked = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
    );

    if (!buttonClicked) {
      ctx.makeMessage({
        components: [
          actionRow(disableComponents(ctx.locale('common:timesup'), [upgradeButton, unlockButton])),
        ],
      });
      return;
    }

    if (resolveCustomId(buttonClicked.customId) === 'UPGRADE') {
      const upgradeEmbed = new MessageEmbed()
        .setTitle(ctx.locale('commands:ficha.show.abilities.upgrade'))
        .setColor(ctx.data.user.selectedColor)
        .setDescription(
          ctx.locale('commands:ficha.show.abilities.upgrade-description', {
            points: user.holyBlessings.ability,
          }),
        );

      const abilities = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | ABILITY`);

      user.abilities.forEach((a) => {
        abilities.addOptions({
          label: ctx.locale(`abilities:${a.id as 100}.name`),
          value: `${a.id}`,
        });
        upgradeEmbed.addField(
          ctx.locale(`abilities:${a.id as 100}.name`),
          `${ctx.prettyResponse('level', 'common:roleplay.level')}: **${
            a.level
          }**\n${ctx.prettyResponse('experience', 'common:roleplay.blesses')}: **${
            a.blesses
          } / ${getAbilityNextLevelBlessings(a.level)}**`,
        );
      });

      ctx.makeMessage({ components: [actionRow([abilities])], embeds: [upgradeEmbed] });

      const selectedAbility =
        await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
          ctx.channel,
          ctx.author.id,
          ctx.interaction.id,
          15_000,
        );

      if (!selectedAbility) {
        ctx.makeMessage({
          components: [actionRow(disableComponents(ctx.locale('common:timesup'), [abilities]))],
        });
        return;
      }

      abilities.setOptions([]);
      abilities.setPlaceholder(ctx.locale('commands:ficha.show.select-amount'));

      for (
        let i = 1;
        i <= user.holyBlessings.ability &&
        i <= 25 &&
        i <=
          getAbilityNextLevelBlessings(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            user.abilities.find((a) => a.id === Number(selectedAbility.values[0]))!.level,
          ) -
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            user.abilities.find((a) => a.id === Number(selectedAbility.values[0]))!.blesses;
        i++
      )
        abilities.addOptions({ label: `${i}`, value: `${i}` });

      ctx.makeMessage({ components: [actionRow([abilities])] });

      const selectedAmount =
        await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
          ctx.channel,
          ctx.author.id,
          ctx.interaction.id,
          15000,
        );

      if (!selectedAmount) {
        ctx.deleteReply();
        return;
      }

      const newAbility = user.abilities.find((a) => a.id === Number(selectedAbility.values[0]));
      const userHolyBlessings = user.holyBlessings;

      userHolyBlessings.ability -= Number(selectedAmount.values[0]);

      if (!newAbility) return;

      newAbility.blesses += Number(selectedAmount.values[0]);

      if (newAbility.blesses >= getAbilityNextLevelBlessings(newAbility.level))
        newAbility.level += 1;

      await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
        holyBlessings: userHolyBlessings,
        abilities: user.abilities,
      });

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:ficha.show.abilities.success'),
      });
      return;
    }

    const availableAbilities = getUserAvailableAbilities(user.abilities);

    const unlockEmbed = new MessageEmbed()
      .setTitle(ctx.locale('commands:ficha.show.abilities.unlock'))
      .setColor(ctx.data.user.selectedColor)
      .setDescription(
        ctx.locale('commands:ficha.show.abilities.unlock-description', {
          points: user.holyBlessings.ability,
        }),
      );

    const unlockAbilityMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | UNLOCK`);

    availableAbilities.forEach((a) => {
      unlockEmbed.addField(
        ctx.locale(`abilities:${a.id as 100}.name`),
        `${ctx.locale(`abilities:${a.id as 100}.description`)}\n${ctx.prettyResponse(
          'lock',
          'commands:ficha.show.abilities.cost',
        )}: **${a.data.unlockCost}** ${ctx.locale('common:roleplay.blesses')}`,
      );

      if (user.holyBlessings.ability >= a.data.unlockCost)
        unlockAbilityMenu.addOptions({
          label: ctx.locale(`abilities:${a.id as 100}.name`),
          value: `${a.id}`,
        });
    });

    ctx.makeMessage({
      embeds: [unlockEmbed],
      components: unlockAbilityMenu.options.length > 0 ? [actionRow([unlockAbilityMenu])] : [],
    });

    if (unlockAbilityMenu.options.length === 0) return;

    const selectedAbility =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        15000,
      );

    if (!selectedAbility) {
      ctx.deleteReply();
      return;
    }

    const userHolyBlessings = user.holyBlessings;

    userHolyBlessings.ability -= getAbilityById(Number(selectedAbility.values[0])).data.unlockCost;

    user.abilities.push({ id: Number(selectedAbility.values[0]), blesses: 0, level: 1 });

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      holyBlessings: userHolyBlessings,
      abilities: user.abilities,
    });

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:ficha.show.abilities.unlock-success', {
        name: ctx.locale(`abilities:${selectedAbility.values[0] as '100'}.name`),
      }),
    });
  }

  static async statusBlessing(
    ctx: InteractionCommandContext,
    user: RoleplayUserSchema,
    embed: MessageEmbed,
  ): Promise<void> {
    embed
      .setDescription(
        ctx.locale('commands:ficha.show.blessings', {
          vitality: user.holyBlessings.vitality,
          battle: user.holyBlessings.battle,
          limit: BLESSES_DIFFERENCE_LIMIT,
        }),
      )
      .addFields([
        {
          name: ctx.locale('commands:ficha.show.vitality'),
          value: `${ctx.prettyResponse('blood', 'common:roleplay.life')}: **${getUserMaxLife(
            user,
          )}**\n${ctx.prettyResponse('mana', 'common:roleplay.mana')}: **${getUserMaxMana(user)}**`,
          inline: true,
        },
        {
          name: ctx.locale('commands:ficha.show.battle'),
          value: `${ctx.prettyResponse('damage', 'common:roleplay.damage')}: **${getUserDamage(
            user,
          )}**\n${ctx.prettyResponse('armor', 'common:roleplay.armor')}: **${getUserArmor(
            user,
          )}**\n${ctx.prettyResponse(
            'intelligence',
            'common:roleplay.intelligence',
          )}: **${getUserIntelligence(user)}**`,
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

    const databaseField =
      resolveCustomId(statusSelected.customId).toLowerCase() === 'mana' ||
      resolveCustomId(statusSelected.customId).toLowerCase() === 'life'
        ? (`max${Util.capitalize(resolveCustomId(statusSelected.customId).toLowerCase())}` as
            | 'maxMana'
            | 'maxLife')
        : (resolveCustomId(statusSelected.customId).toLowerCase() as
            | 'damage'
            | 'armor'
            | 'intelligence');

    const blessingField = resolveCustomId(buttonSelected.customId).toLowerCase() as
      | 'vitality'
      | 'battle';

    if (blessingField === 'vitality') {
      const antiBlessing = databaseField === 'maxMana' ? 'maxLife' : 'maxMana';
      if (
        Math.abs(user.blesses[databaseField] + points - user.blesses[antiBlessing]) >
        BLESSES_DIFFERENCE_LIMIT
      ) {
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:ficha.show.limit-bless', {
            limit: BLESSES_DIFFERENCE_LIMIT,
          }),
          embeds: [],
          components: [],
        });
        return;
      }
    } else {
      const antiBlessingLimit =
        databaseField === 'armor'
          ? Math.abs(
              Math.max(user.blesses.damage, user.blesses.intelligence) -
                (user.blesses.armor + points),
            )
          : databaseField === 'damage'
          ? Math.abs(
              Math.max(user.blesses.armor, user.blesses.intelligence) -
                (user.blesses.damage + points),
            )
          : Math.abs(
              Math.max(user.blesses.armor, user.blesses.damage) -
                (user.blesses.intelligence + points),
            );

      if (antiBlessingLimit > BLESSES_DIFFERENCE_LIMIT) {
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:ficha.show.limit-bless', {
            limit: BLESSES_DIFFERENCE_LIMIT,
          }),
          embeds: [],
          components: [],
        });
        return;
      }
    }

    const userHolyBlessings = user.holyBlessings;
    const userBlesses = user.blesses;

    userHolyBlessings[blessingField] -= points;
    userBlesses[databaseField] += points;

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      holyBlessings: userHolyBlessings,
      blesses: userBlesses,
    });

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:ficha.show.status-success'),
    });
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
        )}**\n${ctx.prettyResponse('blood', 'common:roleplay.life')}: **${
          user.life
        } / ${getUserMaxLife(user)}**\n${ctx.prettyResponse('mana', 'common:roleplay.mana')}: **${
          user.mana
        } / ${getUserMaxMana(user)}**\n${ctx.prettyResponse(
          'damage',
          'common:roleplay.damage',
        )}: **${getUserDamage(user)}**\n${ctx.prettyResponse(
          'armor',
          'common:roleplay.armor',
        )}: **${getUserArmor(user)}**\n${ctx.prettyResponse(
          'intelligence',
          'common:roleplay.intelligence',
        )}: **${getUserIntelligence(user)}**\n${ctx.prettyResponse(
          'coin',
          'commands:ficha.show.money',
        )}: **${user.money}**\n${ctx.prettyResponse('level', 'commands:ficha.show.level')}: **${
          user.level
        }**\n${ctx.prettyResponse('experience', 'commands:ficha.show.experience')}: **${
          user.experience
        } / ${nextLevelXp(user.level)}**`,
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

    await ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([abilityTreeButton, statusTreeButton])],
    });

    const selectedOption = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7_000,
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
      if (
        mentioned.id !== ctx.author.id ||
        (user.holyBlessings.battle === 0 && user.holyBlessings.vitality === 0)
      ) {
        const statusEmbed = new MessageEmbed()
          .setTitle(ctx.locale('commands:ficha.show.poor-title'))
          .setColor(ctx.data.user.selectedColor)
          .setDescription(
            ctx.locale('commands:ficha.show.poor-description', {
              life: makeBlessingStatusUpgrade('life', user.blesses.maxLife),
              mana: makeBlessingStatusUpgrade('mana', user.blesses.maxMana),
              damage: makeBlessingStatusUpgrade('damage', user.blesses.damage),
              armor: makeBlessingStatusUpgrade('armor', user.blesses.armor),
              intelligence: makeBlessingStatusUpgrade('intelligence', user.blesses.intelligence),
              lifePoints: user.blesses.maxLife,
              manaPoints: user.blesses.maxMana,
              damagePoints: user.blesses.damage,
              armorPoints: user.blesses.armor,
              intelligencePoints: user.blesses.intelligence,
            }),
          );
        ctx.makeMessage({
          components: [],
          embeds: [statusEmbed],
          content:
            user.id !== ctx.author.id
              ? ''
              : ctx.prettyResponse('error', 'commands:ficha.show.no-blesses'),
        });
        return;
      }

      return FichaInteractionCommand.statusBlessing(ctx, user, embed);
    }

    return FichaInteractionCommand.abilityBlessing(ctx, user, embed, mentioned);
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
        15_000,
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
        15_000,
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
      15_000,
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
    const resolvedRace = getRaceById(Number(selectedRace.values[0]));

    const life =
      resolvedClass.data.baseMaxLife +
      resolvedClass.data.attributesPerLevel.maxLife +
      resolvedRace.data.facilities.reduce(
        (p, c) => (c.facility === 'maxLife' ? p + c.boostPerLevel : 0),
        0,
      );
    const mana =
      resolvedClass.data.baseMaxMana +
      resolvedClass.data.attributesPerLevel.maxMana +
      resolvedRace.data.facilities.reduce(
        (p, c) => (c.facility === 'maxMana' ? p + c.boostPerLevel : 0),
        0,
      );

    const registerStatus = {
      class: Number(selectedClass.values[0]),
      race: Number(selectedRace.values[0]),
      life,
      mana,
      abilities: [{ id: resolvedClass.data.abilityTree, level: 0, blesses: 0 }],
      holyBlessings: { ability: 0, vitality: 0, battle: 0 },
      blesses: {
        maxLife: 0,
        maxMana: 0,
        armor: 0,
        damage: 0,
        intelligence: 0,
      },
    };

    await ctx.client.repositories.roleplayRepository.registerUser(ctx.author.id, registerStatus);
    if (!ctx.data.user.badges.some((a) => a.id === 16))
      await ctx.client.repositories.badgeRepository.addBadge(ctx.author.id, 16);

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:ficha.register.success'),
      embeds: [],
      components: [],
    });
    ctx.send({ content: ctx.locale('common:rpg-beta', { user: ctx.author.toString() }) });
  }
}
