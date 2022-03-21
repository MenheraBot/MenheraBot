/* eslint-disable no-nested-ternary */
import {
  ABILITY_BATTLE_LEVEL,
  BLESSES_DIFFERENCE_LIMIT,
  LEVEL_UP_BLESSES,
  USER_BATTLE_LEVEL,
} from '@roleplay/Constants';
import { RoleplayUserSchema, UserBattleConfig } from '@roleplay/Types';
import { makeCloseCommandButton, prepareUserForDungeon } from '@roleplay/utils/AdventureUtils';
import {
  getUserAgility,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
} from '@roleplay/utils/Calculations';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import Util, { actionRow, disableComponents, makeCustomId, resolveCustomId } from '@utils/Util';
import {
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

const defaultBlessesConfiguration = (): UserBattleConfig => ({
  agility: 0,
  armor: 0,
  damage: 0,
  intelligence: 0,
  maxLife: 0,
  maxMana: 0,
});

export default class ArenaInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'arena',
      description: '【ＲＰＧ】🏟️ | Entre na Arena PVP de Boleham',
      category: 'roleplay',
      options: [
        {
          name: 'batalhar',
          description: '【ＲＰＧ】🏟️ | Entre na Arena PVP de Boleham',
          type: 'SUB_COMMAND',
          options: [
            { name: 'user', description: 'Inimigo de Batalha', type: 'USER', required: true },
          ],
        },
        {
          name: 'configurar',
          description: '【ＲＰＧ】🏟️ | Configure seu perfil de batalha',
          type: 'SUB_COMMAND',
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  static getBlessesAvailable(userConfig: UserBattleConfig): {
    vitality: number;
    battle: number;
  } {
    let totalBattlePointsToUse = 0;
    let totalVitalityPointsToUse = 0;

    for (let i = 1; i < USER_BATTLE_LEVEL; i++) {
      totalBattlePointsToUse += LEVEL_UP_BLESSES[i].battle;
      totalVitalityPointsToUse += LEVEL_UP_BLESSES[i].vitality;
    }

    const userAvailableBattlePoints =
      totalBattlePointsToUse - (userConfig.armor + userConfig.damage + userConfig.intelligence);

    const userAvailableVitalityPoints =
      totalVitalityPointsToUse - (userConfig.maxMana + userConfig.maxLife + userConfig.agility);

    return { vitality: userAvailableVitalityPoints, battle: userAvailableBattlePoints };
  }

  static async configurate(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);

    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const userConfig: UserBattleConfig =
      (await ctx.client.repositories.roleplayRepository.getConfigurationBattle(ctx.author.id)) ??
      defaultBlessesConfiguration();

    const { battle: userAvailableBattlePoints, vitality: userAvailableVitalityPoints } =
      ArenaInteractionCommand.getBlessesAvailable(userConfig);
    // TODO: Add abilities and custom weapon to batle

    const pvpUser = {
      level: USER_BATTLE_LEVEL,
      class: user.class,
      blesses: userConfig,
      race: user.race,
      weapon: user.weapon,
      protection: user.protection,
      effects: [],
    };

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:arena.configurate.title'))
      .setColor(ctx.data.user.selectedColor)
      .setDescription(
        ctx.locale('commands:arena.configurate.description', {
          battle: userAvailableBattlePoints,
          vitality: userAvailableVitalityPoints,
        }),
      )
      .addFields([
        {
          name: ctx.locale('commands:ficha.show.vitality'),
          value: `${ctx.prettyResponse('blood', 'common:roleplay.life')}: **${getUserMaxLife(
            pvpUser,
          )}**\n${ctx.prettyResponse('mana', 'common:roleplay.mana')}: **${getUserMaxMana(
            pvpUser,
          )}**\n${ctx.prettyResponse('agility', 'common:roleplay.agility')}: **${getUserAgility(
            pvpUser,
          )}**`,
          inline: true,
        },
        {
          name: ctx.locale('commands:ficha.show.battle'),
          value: `${ctx.prettyResponse('damage', 'common:roleplay.damage')}: **${getUserDamage(
            pvpUser,
          )}**\n${ctx.prettyResponse('armor', 'common:roleplay.armor')}: **${getUserArmor(
            pvpUser,
          )}**\n${ctx.prettyResponse(
            'intelligence',
            'common:roleplay.intelligence',
          )}: **${getUserIntelligence(pvpUser)}**`,
          inline: true,
        },
      ]);

    const [resetPointsCustomId, baseId] = makeCustomId('RESET');
    const [vitalityCustomId] = makeCustomId('VITALITY', baseId);
    const [battleCustomId] = makeCustomId('BATTLE', baseId);
    const closeCommandButton = makeCloseCommandButton(baseId, ctx.i18n);

    const resetPointsButton = new MessageButton()
      .setCustomId(resetPointsCustomId)
      .setStyle('SECONDARY')
      .setLabel(ctx.locale('commands:arena.configurate.reset-points'));

    const vitalityButton = new MessageButton()
      .setCustomId(vitalityCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.vitality'));

    const battleButton = new MessageButton()
      .setCustomId(battleCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.battle'));

    if (userAvailableVitalityPoints === 0) vitalityButton.setDisabled(true);
    if (userAvailableBattlePoints === 0) battleButton.setDisabled(true);

    ctx.makeMessage({
      embeds: [embed],
      components: [
        actionRow([vitalityButton, battleButton, resetPointsButton, closeCommandButton]),
      ],
    });

    const selectedOption = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
      15000,
    );

    if (!selectedOption) {
      ctx.makeMessage({
        components: [
          actionRow(
            disableComponents(ctx.locale('common:timesup'), [
              vitalityButton,
              battleButton,
              resetPointsButton,
              closeCommandButton,
            ]),
          ),
        ],
      });
      return;
    }

    if (resolveCustomId(selectedOption.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    if (resolveCustomId(selectedOption.customId) === 'RESET') {
      await ctx.client.repositories.roleplayRepository.setUserConfigurationBattle(
        ctx.author.id,
        defaultBlessesConfiguration(),
      );

      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('success', 'commands:arena.configurate.success-points'),
      });
      return;
    }

    const pointsToUse =
      resolveCustomId(selectedOption.customId) === 'VITALITY'
        ? userAvailableVitalityPoints
        : userAvailableBattlePoints;

    const [amountCustomId, nextBase] = makeCustomId('AMOUNT');
    closeCommandButton.setCustomId(makeCustomId('CLOSE_COMMAND', nextBase)[0]);

    const selectAmount = new MessageSelectMenu()
      .setCustomId(amountCustomId)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:ficha.show.select-amount'));

    for (let i = 1; i <= pointsToUse && i <= 25; i++)
      selectAmount.addOptions({ label: `${i}`, value: `${i}` });

    ctx.makeMessage({ components: [actionRow([closeCommandButton]), actionRow([selectAmount])] });

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
    closeCommandButton.setCustomId(makeCustomId('CLOSE_COMMAND', lastId)[0]);

    if (resolveCustomId(selectedOption.customId) === 'VITALITY') {
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

      toSendComponents.push(actionRow([lifeButton, manaButton, agilityButton, closeCommandButton]));
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

      toSendComponents.push(
        actionRow([damageButton, armorButton, intelligenceButton, closeCommandButton]),
      );
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
        ? (`max${Util.capitalize(resolveCustomId(statusSelected.customId).toLowerCase())}` as
            | 'maxMana'
            | 'maxLife')
        : (resolveCustomId(statusSelected.customId).toLowerCase() as
            | 'damage'
            | 'armor'
            | 'intelligence'
            | 'agility');

    const blessingField = resolveCustomId(selectedOption.customId).toLowerCase() as
      | 'vitality'
      | 'battle';

    if (blessingField === 'vitality') {
      const antiBlessingLimit =
        databaseField === 'agility'
          ? Math.abs(
              Math.max(userConfig.maxLife, userConfig.maxMana) - (userConfig.agility + points),
            )
          : databaseField === 'maxLife'
          ? Math.abs(
              Math.max(userConfig.agility, userConfig.maxMana) - (userConfig.maxLife + points),
            )
          : Math.abs(
              Math.max(userConfig.maxLife, userConfig.agility) - (userConfig.maxMana + points),
            );
      if (antiBlessingLimit >= BLESSES_DIFFERENCE_LIMIT) {
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
              Math.max(userConfig.damage, userConfig.intelligence) - (userConfig.armor + points),
            )
          : databaseField === 'damage'
          ? Math.abs(
              Math.max(userConfig.armor, userConfig.intelligence) - (userConfig.damage + points),
            )
          : Math.abs(
              Math.max(userConfig.armor, userConfig.damage) - (userConfig.intelligence + points),
            );

      if (antiBlessingLimit >= BLESSES_DIFFERENCE_LIMIT) {
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

    const userBlesses = userConfig;

    userBlesses[databaseField] += points;

    await ctx.client.repositories.roleplayRepository.setUserConfigurationBattle(
      ctx.author.id,
      userConfig,
    );

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:arena.configurate.success-points'),
    });
  }

  static async pvpLoop(
    ctx: InteractionCommandContext,
    attacker: RoleplayUserSchema,
    defender: RoleplayUserSchema,
  ): Promise<void> {
    console.log(ctx, attacker, defender);
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selectedCommand = ctx.options.getSubcommand(true);

    if (selectedCommand === 'configurar') return ArenaInteractionCommand.configurate(ctx);

    const mentioned = ctx.options.getUser('user', true);

    if (mentioned.bot) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:arena.enemy-unregistered'),
      });
      return;
    }

    if (mentioned.id === ctx.author.id) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:arena.same-user'),
        ephemeral: true,
      });
      return;
    }

    const author = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    const enemy = await ctx.client.repositories.roleplayRepository.findUser(mentioned.id);

    if (!author) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    if (!enemy) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:arena.enemy-unregistered'),
      });
      return;
    }

    const authorBlesses = await ctx.client.repositories.roleplayRepository.getConfigurationBattle(
      ctx.author.id,
    );

    const enemyBlesses = await ctx.client.repositories.roleplayRepository.getConfigurationBattle(
      mentioned.id,
    );

    if (!authorBlesses || !enemyBlesses) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:arena.user-not-configurated', {
          user: !authorBlesses ? ctx.author.username : mentioned.username,
        }),
      });
      return;
    }

    const canUseAuthor = ArenaInteractionCommand.getBlessesAvailable(authorBlesses);
    const canUseEnemy = ArenaInteractionCommand.getBlessesAvailable(authorBlesses);

    if (canUseAuthor.battle !== 0 || canUseAuthor.vitality !== 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:arena.user-not-configurated', {
          user: ctx.author.username,
        }),
      });
      return;
    }

    if (canUseEnemy.battle !== 0 || canUseEnemy.vitality !== 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:arena.user-not-configurated', {
          user: mentioned.username,
        }),
      });
      return;
    }

    const embed = new MessageEmbed()
      .setThumbnail(mentioned.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:arena.title', { user: mentioned.username }))
      .setColor(COLORS.Battle)
      .setFooter({ text: ctx.locale('commands:arena.ready-users', { ready: 0 }) })
      .setDescription(
        ctx.locale('commands:arena.description', {
          author: ctx.author.username,
          enemy: mentioned.username,
          level: USER_BATTLE_LEVEL,
          abilityLevel: ABILITY_BATTLE_LEVEL,
          authorLevel: author.level,
          enemyLevel: enemy.level,
        }),
      );

    const [battleTypeCustomId, baseId] = makeCustomId('TYPE');
    const [readyCustomId] = makeCustomId('READY', baseId);
    const closeCommandButton = makeCloseCommandButton(baseId, ctx.i18n);

    let isLeveledBattle = true;

    const battleTypeButton = new MessageButton()
      .setCustomId(battleTypeCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:arena.leveled-battle'));

    const readyButton = new MessageButton()
      .setCustomId(readyCustomId)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('commands:arena.ready'));

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([battleTypeButton, readyButton, closeCommandButton])],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(`${baseId}`) && [ctx.author.id, mentioned.id].includes(int.user.id);

    const collector = ctx.channel.createMessageComponentCollector({
      componentType: 'BUTTON',
      filter,
      time: 20_000,
    });

    const readyPlayers: string[] = [];

    collector.on('collect', async (int) => {
      switch (resolveCustomId(int.customId)) {
        case 'CLOSE_COMMAND': {
          collector.stop();
          ctx.deleteReply();
          break;
        }
        case 'TYPE': {
          collector.resetTimer();
          battleTypeButton
            .setLabel(
              ctx.locale(`commands:arena.${isLeveledBattle ? 'default-battle' : 'leveled-battle'}`),
            )
            .setStyle('SECONDARY');
          isLeveledBattle = !isLeveledBattle;

          ctx.makeMessage({
            embeds: [embed],
            components: [actionRow([battleTypeButton, readyButton, closeCommandButton])],
          });
          break;
        }
        case 'READY': {
          collector.resetTimer();
          if (!readyPlayers.includes(int.user.id)) readyPlayers.push(int.user.id);

          if (readyPlayers.length === 1) {
            ctx.makeMessage({
              embeds: [
                embed.setFooter({ text: ctx.locale('commands:arena.ready-users', { ready: 1 }) }),
              ],
              components: [actionRow([battleTypeButton, readyButton, closeCommandButton])],
            });
            break;
          }

          if (!isLeveledBattle) {
            collector.stop();
            return ArenaInteractionCommand.pvpLoop(
              ctx,
              prepareUserForDungeon(author),
              prepareUserForDungeon(enemy),
            );
          }
        }
      }
    });
  }
}
