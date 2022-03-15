import { ABILITY_BATTLE_LEVEL, USER_BATTLE_LEVEL } from '@roleplay/Constants';
import { makeCloseCommandButton } from '@roleplay/utils/AdventureUtils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import { actionRow, makeCustomId, resolveCustomId } from '@utils/Util';
import {
  InteractionCollector,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js-light';

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
    });
  }

  static async configurate(): Promise<void> {
    console.log('a');
  }

  static async pvpLoop(): Promise<void> {
    console.log('n');
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selectedCommand = ctx.options.getSubcommand(true);

    if (selectedCommand === 'configurar') return ArenaInteractionCommand.configurate();

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
    const closeCommandButton = makeCloseCommandButton(baseId);

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
      await int.deferUpdate();
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
            return ArenaInteractionCommand.pvpLoop();
          }
        }
      }
    });
  }
}
