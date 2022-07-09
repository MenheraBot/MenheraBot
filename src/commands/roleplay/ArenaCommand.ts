import {
  ABILITY_BATTLE_LEVEL,
  BLESSES_DIFFERENCE_LIMIT,
  LEVEL_UP_BLESSES,
  USER_BATTLE_LEVEL,
} from '@roleplay/Constants';
import { RoleplayUserSchema, UserBattleConfig, UserBattleEntity } from '@roleplay/Types';
import { makeCloseCommandButton, prepareUserForDungeon } from '@roleplay/utils/AdventureUtils';
import { isDead } from '@roleplay/utils/BattleUtils';
import {
  getUserAgility,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
} from '@roleplay/utils/Calculations';
import { getClassAbilities } from '@roleplay/utils/DataUtils';
import PlayerVsPlayer from '@roleplay/structures/PlayerVsPlayer';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis } from '@structures/Constants';
import Util, { actionRow, disableComponents, makeCustomId, resolveCustomId } from '@utils/Util';
import {
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  Modal,
  TextInputComponent,
  User,
} from 'discord.js-light';
import { BattleDiscordUser } from '@roleplay/structures/PlayerVsEntity';

const defaultBlessesConfiguration = (): UserBattleConfig => ({
  agility: 0,
  armor: 0,
  damage: 0,
  intelligence: 0,
  maxLife: 0,
  maxMana: 0,
});

const discordUserToBattleUser = (usr: User): BattleDiscordUser => ({
  id: usr.id,
  username: usr.username,
  imageUrl: usr.displayAvatarURL({ dynamic: true }),
});

export default class ArenaCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'arena',
      description: '【ＲＰＧ】🏟️ | Entre na Arena PvP de Boleham',
      descriptionLocalizations: { 'en-US': '【ＲＰＧ】🏟️ | Enter the Boleham PvP Arena' },
      options: [
        {
          name: 'batalhar',
          nameLocalizations: { 'en-US': 'battle' },
          description: '【ＲＰＧ】🏟️ | Entre na Arena PvP de Boleham',
          descriptionLocalizations: { 'en-US': "【ＲＰＧ】🏟️ | Enter Boleham's PvP Arena" },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Inimigo de Batalha',
              descriptionLocalizations: { 'en-US': 'Battle Enemy' },
              type: 'USER',
              required: true,
            },
          ],
        },
        {
          name: 'configurar',
          nameLocalizations: { 'en-US': 'configure' },
          description: '【ＲＰＧ】🏟️ | Configure seu perfil de batalha',
          descriptionLocalizations: { 'en-US': '【ＲＰＧ】🏟️ | Configure your battle profile' },
          type: 'SUB_COMMAND',
        },
      ],
      category: 'roleplay',
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

  static prepareUserForPvP(
    user: RoleplayUserSchema,
    needToLevel: boolean,
    battleConfig: UserBattleConfig,
  ): UserBattleEntity {
    if (!needToLevel) {
      return {
        id: user.id,
        class: user.class,
        race: user.race,
        life: getUserMaxLife(user),
        mana: getUserMaxMana(user),
        level: user.level,
        experience: user.experience,
        holyBlessings: user.holyBlessings,
        blesses: user.blesses,
        abilities: user.abilities,
        inventory: user.inventory,
        cooldowns: user.cooldowns,
        weapon: user.weapon,
        protection: user.protection,
        backpack: user.backpack,
        money: user.money,
        effects: [],
        abilitiesCooldowns: [],
        didParticipate: true,
      };
    }

    const baseUserStructure = {
      class: user.class,
      race: user.race,
      level: USER_BATTLE_LEVEL,
      blesses: battleConfig,
    };

    const userMaxLife = getUserMaxLife(baseUserStructure);
    const userMaxMana = getUserMaxMana(baseUserStructure);

    const userAbilities = getClassAbilities(user.class).map((a) => ({
      level: ABILITY_BATTLE_LEVEL,
      id: a.id,
      blesses: 0,
    }));

    return {
      id: user.id,
      class: user.class,
      race: user.race,
      abilities: userAbilities,
      life: userMaxLife,
      mana: userMaxMana,
      blesses: battleConfig,
      level: USER_BATTLE_LEVEL,
      experience: user.experience,
      holyBlessings: user.holyBlessings,
      inventory: user.inventory,
      cooldowns: user.cooldowns,
      weapon: user.weapon,
      protection: user.protection,
      backpack: user.backpack,
      money: user.money,
      effects: [],
      abilitiesCooldowns: [],
      didParticipate: true,
    };
  }

  static async configurate(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:unregistered'),
        ephemeral: true,
      });
      return;
    }

    const userConfig: UserBattleConfig =
      (await ctx.client.repositories.roleplayRepository.getUserConfigurationBattle(
        ctx.author.id,
      )) ?? defaultBlessesConfiguration();

    const maxPointsToUse = ArenaCommand.getBlessesAvailable(defaultBlessesConfiguration());

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
          battle: maxPointsToUse.battle,
          vitality: maxPointsToUse.vitality,
        }),
      )
      .addFields([
        {
          name: ctx.locale('commands:ficha.show.vitality'),
          value: ctx.locale('commands:ficha.show.vitality-description', {
            emojis,
            maxLife: getUserMaxLife(pvpUser),
            lifeBlesses: pvpUser.blesses.maxLife,
            maxMana: getUserMaxMana(pvpUser),
            manaBlesses: pvpUser.blesses.maxMana,
            agility: getUserAgility(pvpUser),
            agilityBlesses: pvpUser.blesses.agility,
          }),

          inline: true,
        },
        {
          name: ctx.locale('commands:ficha.show.battle'),
          value: ctx.locale('commands:ficha.show.battle-description', {
            emojis,
            damage: getUserDamage(pvpUser),
            damageBlesses: pvpUser.blesses.damage,
            armor: getUserArmor(pvpUser),
            armorBlesses: pvpUser.blesses.armor,
            intelligence: getUserIntelligence(pvpUser),
            intelligenceBlesses: pvpUser.blesses.intelligence,
          }),
          inline: true,
        },
      ]);

    const [vitalityCustomId, baseId] = makeCustomId('VITALITY');
    const [battleCustomId] = makeCustomId('BATTLE', baseId);
    const closeCommandButton = makeCloseCommandButton(baseId, ctx.i18n);

    const vitalityButton = new MessageButton()
      .setCustomId(vitalityCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.vitality'));

    const battleButton = new MessageButton()
      .setCustomId(battleCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:ficha.show.battle'));

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([vitalityButton, battleButton, closeCommandButton])],
    });

    const selectedOption = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
      15000,
      false,
    );

    if (!selectedOption) {
      ctx.makeMessage({
        components: [
          actionRow(
            disableComponents(ctx.locale('common:timesup'), [
              vitalityButton,
              battleButton,
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

    const selectedPoint = resolveCustomId(selectedOption.customId).toLowerCase() as
      | 'vitality'
      | 'battle';

    const modal = new Modal()
      .setCustomId(`${ctx.interaction.id} | MODAL`)
      .setTitle(ctx.locale('commands:ficha.bless.modal-title'));

    const firstInput = new TextInputComponent()
      .setCustomId('FIRST')
      .setStyle('SHORT')
      .setMaxLength(2)
      .setRequired(false)
      .setLabel(ctx.locale(`common:roleplay.${selectedPoint === 'vitality' ? 'life' : 'damage'}`));

    const secondInput = new TextInputComponent()
      .setCustomId(`SECOND`)
      .setStyle('SHORT')
      .setMaxLength(2)
      .setRequired(false)
      .setLabel(ctx.locale(`common:roleplay.${selectedPoint === 'vitality' ? 'mana' : 'armor'}`));

    const thirdInput = new TextInputComponent()
      .setCustomId(`THIRD`)
      .setStyle('SHORT')
      .setMaxLength(2)
      .setRequired(false)
      .setLabel(
        ctx.locale(`common:roleplay.${selectedPoint === 'vitality' ? 'agility' : 'intelligence'}`),
      );

    modal.setComponents(
      { type: 1, components: [firstInput] },
      { type: 1, components: [secondInput] },
      { type: 1, components: [thirdInput] },
    );

    selectedOption.showModal(modal);

    const modalResponse = await selectedOption.awaitModalSubmit({ time: 30000 }).catch(() => null);

    if (!modalResponse) {
      ctx.deleteReply();
      return;
    }

    modalResponse.deferUpdate();

    const parsedFirstSelection = parseInt(modalResponse.fields.getTextInputValue('FIRST'), 10);
    const parsedSecondSelection = parseInt(modalResponse.fields.getTextInputValue('SECOND'), 10);
    const parsedThirdSelecion = parseInt(modalResponse.fields.getTextInputValue('THIRD'), 10);

    if (parsedFirstSelection < 0 || parsedSecondSelection < 0 || parsedThirdSelecion < 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ficha.bless.invalid-number'),
        components: [],
        embeds: [],
      });
      return;
    }

    const databaseField = {
      vitality: {
        FIRST: 'maxLife' as const,
        SECOND: 'maxMana' as const,
        THIRD: 'agility' as const,
      },
      battle: {
        FIRST: 'damage' as const,
        SECOND: 'armor' as const,
        THIRD: 'intelligence' as const,
      },
    }[selectedPoint];

    if (!Number.isNaN(parsedFirstSelection))
      pvpUser.blesses[databaseField.FIRST] = parsedFirstSelection;

    if (!Number.isNaN(parsedSecondSelection))
      pvpUser.blesses[databaseField.SECOND] = parsedSecondSelection;

    if (!Number.isNaN(parsedThirdSelecion))
      pvpUser.blesses[databaseField.THIRD] = parsedThirdSelecion;

    const availableBlesses = ArenaCommand.getBlessesAvailable(pvpUser.blesses);

    if (availableBlesses[selectedPoint] < 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ficha.bless.no-points', {
          points: maxPointsToUse[selectedPoint],
        }),
        components: [],
        embeds: [],
      });
      return;
    }

    if (
      Math.abs(pvpUser.blesses[databaseField.FIRST] - pvpUser.blesses[databaseField.SECOND]) >
        BLESSES_DIFFERENCE_LIMIT ||
      Math.abs(pvpUser.blesses[databaseField.FIRST] - pvpUser.blesses[databaseField.THIRD]) >
        BLESSES_DIFFERENCE_LIMIT ||
      Math.abs(pvpUser.blesses[databaseField.SECOND] - pvpUser.blesses[databaseField.THIRD]) >
        BLESSES_DIFFERENCE_LIMIT
    ) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ficha.bless.bless-limit', {
          limit: BLESSES_DIFFERENCE_LIMIT,
        }),
        components: [],
        embeds: [],
      });
      return;
    }

    await ctx.client.repositories.roleplayRepository.setUserConfigurationBattle(
      ctx.author.id,
      pvpUser.blesses,
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
    attackerDiscordUser: BattleDiscordUser,
    defenderDiscordUser: BattleDiscordUser,
  ): Promise<void> {
    const battleResults = await new PlayerVsPlayer(
      ctx,
      prepareUserForDungeon(attacker),
      prepareUserForDungeon(defender),
      attackerDiscordUser,
      defenderDiscordUser,
      ctx.locale('roleplay:pvp.start-text', {
        author: attackerDiscordUser.username,
        mentioned: defenderDiscordUser.username,
      }),
    ).battleLoop();

    const winner = isDead(battleResults.defender)
      ? { winner: battleResults.attacker, winnerDiscordUser: battleResults.attackerDiscordUser }
      : { winner: battleResults.defender, winnerDiscordUser: battleResults.defenderDiscordUser };

    const loser = isDead(battleResults.attacker)
      ? { loser: battleResults.attacker, loserDiscordUser: battleResults.attackerDiscordUser }
      : { loser: battleResults.defender, loserDiscordUser: battleResults.defenderDiscordUser };

    const embed = new MessageEmbed()
      .setColor(COLORS.ACTIONS)
      .setTitle(ctx.locale('commands:arena.results.title'))
      .setDescription(
        ctx.locale('commands:arena.results.description', {
          text: battleResults.lastText,
          winnerName: winner.winnerDiscordUser.username,
          loserName: loser.loserDiscordUser.username,
        }),
      )
      .setThumbnail(winner.winnerDiscordUser.imageUrl);

    ctx.makeMessage({ embeds: [embed], content: null, components: [] });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selectedCommand = ctx.options.getSubcommand(true);

    if (selectedCommand === 'configurar') return ArenaCommand.configurate(ctx);

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
      time: 25_000,
    });

    const readyPlayers: string[] = [];

    collector.on('collect', async (int) => {
      switch (resolveCustomId(int.customId)) {
        case 'CLOSE_COMMAND': {
          collector.stop();
          int.deferUpdate();
          ctx.makeMessage({
            content: ctx.locale('commands:arena.closed-command', { author: int.user.toString() }),
            embeds: [],
            components: [],
          });
          break;
        }
        case 'TYPE': {
          if (int.user.id !== ctx.author.id)
            return int.reply({
              content: ctx.locale('commands:arena.ask-change-battle-type', {
                user: mentioned.username,
                author: ctx.author.toString(),
              }),
            });
          int.deferUpdate();
          battleTypeButton
            .setLabel(
              ctx.locale(`commands:arena.${isLeveledBattle ? 'default-battle' : 'leveled-battle'}`),
            )
            .setStyle(isLeveledBattle ? 'SECONDARY' : 'PRIMARY');
          isLeveledBattle = !isLeveledBattle;

          ctx.makeMessage({
            embeds: [embed],
            components: [actionRow([battleTypeButton, readyButton, closeCommandButton])],
          });
          break;
        }
        case 'READY': {
          int.deferUpdate();
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

          collector.stop();
          if (!isLeveledBattle) {
            return ArenaCommand.pvpLoop(
              ctx,
              ArenaCommand.prepareUserForPvP(author, false, defaultBlessesConfiguration()),
              ArenaCommand.prepareUserForPvP(enemy, false, defaultBlessesConfiguration()),
              discordUserToBattleUser(ctx.author),
              discordUserToBattleUser(mentioned),
            );
          }

          if (isLeveledBattle) {
            const authorBlesses =
              await ctx.client.repositories.roleplayRepository.getUserConfigurationBattle(
                ctx.author.id,
              );

            const enemyBlesses =
              await ctx.client.repositories.roleplayRepository.getUserConfigurationBattle(
                mentioned.id,
              );

            if (!authorBlesses || !enemyBlesses) {
              ctx.makeMessage({
                content: ctx.prettyResponse('error', 'commands:arena.user-not-configurated', {
                  user: !authorBlesses ? ctx.author.toString() : mentioned.toString(),
                }),
                embeds: [],
                components: [],
              });
              return;
            }

            const canUseAuthor = ArenaCommand.getBlessesAvailable(authorBlesses);
            const canUseEnemy = ArenaCommand.getBlessesAvailable(enemyBlesses);

            if (canUseAuthor.battle !== 0 || canUseAuthor.vitality !== 0) {
              ctx.makeMessage({
                content: ctx.prettyResponse('error', 'commands:arena.user-not-configurated', {
                  user: ctx.author.toString(),
                }),
                embeds: [],
                components: [],
              });
              return;
            }

            if (canUseEnemy.battle !== 0 || canUseEnemy.vitality !== 0) {
              ctx.makeMessage({
                content: ctx.prettyResponse('error', 'commands:arena.user-not-configurated', {
                  user: mentioned.toString(),
                }),
                embeds: [],
                components: [],
              });
              return;
            }

            return ArenaCommand.pvpLoop(
              ctx,
              ArenaCommand.prepareUserForPvP(author, true, authorBlesses),
              ArenaCommand.prepareUserForPvP(enemy, true, enemyBlesses),
              discordUserToBattleUser(ctx.author),
              discordUserToBattleUser(mentioned),
            );
          }
        }
      }
    });
  }
}
