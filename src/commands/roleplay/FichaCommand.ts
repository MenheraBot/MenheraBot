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
import Util, {
  actionRow,
  capitalize,
  disableComponents,
  makeCustomId,
  resolveCustomId,
} from '@utils/Util';
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
  getUserAgility,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
  makeBlessingStatusUpgrade,
  nextLevelXp,
} from '@roleplay/utils/Calculations';
import { BLESSES_DIFFERENCE_LIMIT } from '@roleplay/Constants';
import { makeCloseCommandButton, prepareUserForDungeon } from '@roleplay/utils/AdventureUtils';

export default class FichaCommand extends InteractionCommand {
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
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const optionUser = ctx.options.getUser('user') ?? ctx.author;
    const user = await ctx.client.repositories.roleplayRepository.findUser(optionUser.id);

    if (!user && optionUser.id === ctx.author.id) return FichaCommand.registerUser(ctx);

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ficha.no-user'),
        ephemeral: true,
      });
      return;
    }

    return FichaCommand.showFicha(ctx, user, optionUser);
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
        } / ${getAbilityNextLevelBlessings(a.level)}**\nID: **${a.id}**`,
      );
    });

    const [upgradeCustomId, baseId] = makeCustomId('UPGRADE');
    const [unlockCustomId] = makeCustomId('UNLOCK', baseId);

    const upgradeButton = new MessageButton()
      .setCustomId(upgradeCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.abilities.upgrade'));

    const unlockButton = new MessageButton()
      .setCustomId(unlockCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.abilities.unlock'));

    const exitButton = makeCloseCommandButton(baseId, ctx.i18n);

    ctx.makeMessage({
      embeds: [embed],
      components:
        user.id !== ctx.author.id || user.holyBlessings.ability === 0
          ? []
          : [actionRow([upgradeButton, unlockButton, exitButton])],
    });

    if (user.id !== ctx.author.id || user.holyBlessings.ability === 0) return;

    const buttonClicked = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
    );

    if (!buttonClicked) {
      ctx.makeMessage({
        components: [
          actionRow(disableComponents(ctx.locale('common:timesup'), [upgradeButton, unlockButton])),
        ],
      });
      return;
    }

    if (resolveCustomId(buttonClicked.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const [abilityCustomId, nextBase] = makeCustomId('ABILITY');
    exitButton.setCustomId(makeCustomId('CLOSE_COMMAND', nextBase)[0]);

    if (resolveCustomId(buttonClicked.customId) === 'UPGRADE') {
      const upgradeEmbed = new MessageEmbed()
        .setTitle(ctx.locale('commands:ficha.show.abilities.upgrade'))
        .setColor(ctx.data.user.selectedColor)
        .setDescription(
          ctx.locale('commands:ficha.show.abilities.upgrade-description', {
            points: user.holyBlessings.ability,
          }),
        );

      const abilities = new MessageSelectMenu().setCustomId(abilityCustomId);

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
          } / ${getAbilityNextLevelBlessings(a.level)}**\n${ctx.prettyResponse(
            'mana',
            'commands:ficha.show.abilities.nextCost',
          )}: **${(() => {
            const ability = getAbilityById(a.id);
            return ability.data.cost + ability.data.costPerLevel * (a.level + 1);
          })()}**`,
        );
      });

      ctx.makeMessage({
        components: [actionRow([exitButton]), actionRow([abilities])],
        embeds: [upgradeEmbed],
      });

      const selectedAbility =
        await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
          ctx.channel,
          ctx.author.id,
          nextBase,
          15_000,
        );

      if (!selectedAbility) {
        ctx.makeMessage({
          components: [actionRow(disableComponents(ctx.locale('common:timesup'), [abilities]))],
        });
        return;
      }

      if (resolveCustomId(selectedAbility.customId) === 'CLOSE_COMMAND') {
        ctx.deleteReply();
        return;
      }

      const [newAbilityCustomId, lastBase] = makeCustomId('ABILITY');

      exitButton.setCustomId(makeCustomId('CLOSE_COMMAND', lastBase)[0]);

      abilities
        .setOptions([])
        .setPlaceholder(ctx.locale('commands:ficha.show.select-amount'))
        .setCustomId(newAbilityCustomId);

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

      ctx.makeMessage({ components: [actionRow([exitButton]), actionRow([abilities])] });

      const selectedAmount =
        await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
          ctx.channel,
          ctx.author.id,
          lastBase,
          15000,
        );

      if (!selectedAmount) {
        ctx.deleteReply();
        return;
      }

      if (resolveCustomId(selectedAmount.customId) === 'CLOSE_COMMAND') {
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

    const unlockAbilityMenu = new MessageSelectMenu().setCustomId(`${nextBase} | UNLOCK`);

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
      components:
        unlockAbilityMenu.options.length > 0
          ? [actionRow([exitButton]), actionRow([unlockAbilityMenu])]
          : [],
    });

    if (unlockAbilityMenu.options.length === 0) return;

    const selectedAbility =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        nextBase,
        15000,
      );

    if (!selectedAbility) {
      ctx.deleteReply();
      return;
    }

    if (resolveCustomId(selectedAbility.customId) === 'CLOSE_COMMAND') {
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
          )}** | ${user.blesses.maxLife}\n${ctx.prettyResponse(
            'mana',
            'common:roleplay.mana',
          )}: **${getUserMaxMana(user)}** | ${user.blesses.maxMana}\n${ctx.prettyResponse(
            'agility',
            'common:roleplay.agility',
          )}: **${getUserAgility(prepareUserForDungeon(user))}** | ${user.blesses.agility}`,
          inline: true,
        },
        {
          name: ctx.locale('commands:ficha.show.battle'),
          value: `${ctx.prettyResponse('damage', 'common:roleplay.damage')}: **${getUserDamage(
            prepareUserForDungeon(user),
          )}** | ${user.blesses.damage}\n${ctx.prettyResponse(
            'armor',
            'common:roleplay.armor',
          )}: **${getUserArmor(prepareUserForDungeon(user))}** | ${
            user.blesses.armor
          }\n${ctx.prettyResponse(
            'intelligence',
            'common:roleplay.intelligence',
          )}: **${getUserIntelligence(prepareUserForDungeon(user))}** | ${
            user.blesses.intelligence
          }`,
          inline: true,
        },
      ]);

    const [vitalityCustomId, baseId] = makeCustomId('VITALITY');
    const [battleCustomId] = makeCustomId('BATTLE', baseId);

    const vitalityButton = new MessageButton()
      .setCustomId(vitalityCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.vitality'));

    const battleButton = new MessageButton()
      .setCustomId(battleCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.battle'));

    const exitButton = makeCloseCommandButton(baseId, ctx.i18n);

    if (user.holyBlessings.vitality === 0) vitalityButton.setDisabled(true);
    if (user.holyBlessings.battle === 0) battleButton.setDisabled(true);

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([vitalityButton, battleButton, exitButton])],
    });

    const buttonSelected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
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

    if (resolveCustomId(buttonSelected.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const pointsToUse =
      resolveCustomId(buttonSelected.customId) === 'VITALITY'
        ? user.holyBlessings.vitality
        : user.holyBlessings.battle;

    const [amountCustomId, nextBase] = makeCustomId('AMOUNT');
    exitButton.setCustomId(makeCustomId('CLOSE_COMMAND', nextBase)[0]);

    const selectAmount = new MessageSelectMenu()
      .setCustomId(amountCustomId)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:ficha.show.select-amount'));

    for (let i = 1; i <= pointsToUse && i <= BLESSES_DIFFERENCE_LIMIT; i++)
      selectAmount.addOptions({ label: `${i}`, value: `${i}` });

    ctx.makeMessage({ components: [actionRow([exitButton]), actionRow([selectAmount])] });

    const selectedAmount =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        nextBase,
      );

    if (!selectedAmount) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectAmount]))],
      });
      return;
    }

    if (resolveCustomId(selectedAmount.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const points = Number(selectedAmount.values[0]);

    embed.setFooter({ text: ctx.locale('commands:ficha.show.select-type', { count: points }) });

    const toSendComponents: MessageActionRow[] = [];

    const [lifeCustomId, lastId] = makeCustomId('LIFE');
    exitButton.setCustomId(makeCustomId('CLOSE_COMMAND', lastId)[0]);

    if (resolveCustomId(buttonSelected.customId) === 'VITALITY') {
      const lifeButton = new MessageButton()
        .setCustomId(lifeCustomId)
        .setStyle('DANGER')
        .setLabel(ctx.locale('common:roleplay.life'));

      const manaButton = new MessageButton()
        .setCustomId(`${lastId} | MANA`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('common:roleplay.mana'));

      const agilityButton = new MessageButton()
        .setCustomId(`${lastId} | AGILITY`)
        .setStyle('SECONDARY')
        .setLabel(ctx.locale('common:roleplay.agility'));

      toSendComponents.push(actionRow([lifeButton, manaButton, agilityButton, exitButton]));
    } else {
      const damageButton = new MessageButton()
        .setCustomId(`${lastId} | DAMAGE`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('common:roleplay.damage'));

      const armorButton = new MessageButton()
        .setCustomId(`${lastId} | ARMOR`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('common:roleplay.armor'));

      const intelligenceButton = new MessageButton()
        .setCustomId(`${lastId} | INTELLIGENCE`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('common:roleplay.intelligence'));

      toSendComponents.push(actionRow([damageButton, armorButton, intelligenceButton, exitButton]));
    }

    ctx.makeMessage({ embeds: [embed], components: toSendComponents });

    const statusSelected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      lastId,
    );

    if (!statusSelected) {
      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'common:timesup'),
      });
      return;
    }

    if (resolveCustomId(statusSelected.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const databaseField =
      resolveCustomId(statusSelected.customId).toLowerCase() === 'mana' ||
      resolveCustomId(statusSelected.customId).toLowerCase() === 'life'
        ? (`max${capitalize(resolveCustomId(statusSelected.customId).toLowerCase())}` as
            | 'maxMana'
            | 'maxLife')
        : (resolveCustomId(statusSelected.customId).toLowerCase() as
            | 'damage'
            | 'armor'
            | 'intelligence'
            | 'agility');

    const blessingField = resolveCustomId(buttonSelected.customId).toLowerCase() as
      | 'vitality'
      | 'battle';

    if (blessingField === 'vitality') {
      const antiBlessingLimit =
        databaseField === 'agility'
          ? Math.abs(
              Math.max(user.blesses.maxLife, user.blesses.maxMana) -
                (user.blesses.agility + points),
            )
          : databaseField === 'maxLife'
          ? Math.abs(
              Math.max(user.blesses.agility, user.blesses.maxMana) -
                (user.blesses.maxLife + points),
            )
          : Math.abs(
              Math.max(user.blesses.maxLife, user.blesses.agility) -
                (user.blesses.maxMana + points),
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
        )}: **${getUserDamage(prepareUserForDungeon(user))}**\n${ctx.prettyResponse(
          'armor',
          'common:roleplay.armor',
        )}: **${getUserArmor(prepareUserForDungeon(user))}**\n${ctx.prettyResponse(
          'intelligence',
          'common:roleplay.intelligence',
        )}: **${getUserIntelligence(prepareUserForDungeon(user))}**\n${ctx.prettyResponse(
          'agility',
          'common:roleplay.agility',
        )}: **${getUserAgility(prepareUserForDungeon(user))}**\n${ctx.prettyResponse(
          'coin',
          'commands:ficha.show.money',
        )}: **${user.money}**\n${ctx.prettyResponse('level', 'commands:ficha.show.level')}: **${
          user.level
        }**\n${ctx.prettyResponse('experience', 'commands:ficha.show.experience')}: **${
          user.experience
        } / ${nextLevelXp(user.level)}**`,
      )
      .setColor(ctx.data.user.selectedColor);

    const [abilityCustomId, baseId] = makeCustomId('ABILITY');
    const [statusCustomId] = makeCustomId('STATUS', baseId);

    const abilityTreeButton = new MessageButton()
      .setCustomId(abilityCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.abilitiesButton'));

    const statusTreeButton = new MessageButton()
      .setCustomId(statusCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.statsButton'));

    const exitButton = makeCloseCommandButton(baseId, ctx.i18n);

    await ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([abilityTreeButton, statusTreeButton, exitButton])],
    });

    const selectedOption = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
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

    if (resolveCustomId(selectedOption.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
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
              agility: makeBlessingStatusUpgrade('agility', user.blesses.agility),
              lifePoints: user.blesses.maxLife,
              manaPoints: user.blesses.maxMana,
              damagePoints: user.blesses.damage,
              armorPoints: user.blesses.armor,
              intelligencePoints: user.blesses.intelligence,
              agilityPoints: user.blesses.agility,
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

      return FichaCommand.statusBlessing(ctx, user, embed);
    }

    return FichaCommand.abilityBlessing(ctx, user, embed, mentioned);
  }

  static async registerUser(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.locale('commands:ficha.register.title'))
      .setDescription(ctx.locale('commands:ficha.register.description'));

    const [selectorCustomId, baseId] = makeCustomId('SELECT');

    const selector = new MessageSelectMenu().setCustomId(selectorCustomId);

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
        baseId,
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
        baseId,
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
      resolvedClass.data.maxLife +
      resolvedClass.data.attributesPerLevel.maxLife +
      resolvedRace.data.facilities.reduce(
        (p, c) => (c.facility === 'maxLife' ? p + c.boostPerLevel : 0),
        0,
      );
    const mana =
      resolvedClass.data.maxMana +
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
      abilities: [{ id: resolvedClass.data.starterAbility, level: 0, blesses: 0 }],
      holyBlessings: { ability: 0, vitality: 0, battle: 0 },
      blesses: {
        maxLife: 0,
        maxMana: 0,
        armor: 0,
        damage: 0,
        agility: 0,
        intelligence: 0,
      },
    };

    await ctx.client.repositories.roleplayRepository.registerUser(ctx.author.id, registerStatus);

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:ficha.register.success'),
      embeds: [],
      components: [],
    });
  }
}
