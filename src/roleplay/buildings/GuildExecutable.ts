import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/Constants';
import {
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js-light';
import { IQuest, IRpgUserSchema } from '../Types';
import { resolveCustomId } from '../Utils';
import BasicFunctions from '../Functions/BasicFunctions';

export default async (ctx: InteractionCommandContext, user: IRpgUserSchema): Promise<void> => {
  const embed = new MessageEmbed()
    .setColor(ctx.data.user.cor)
    .setTitle(ctx.locale('buildings:guild.first.title'))
    .setDescription(ctx.locale('buildings:guild.first.description'));

  const userDailyQuests = await ctx.client.repositories.rpgRepository.getUserDailyQuests(
    ctx.author.id,
    user.level,
    ctx.client.boleham.Quests,
  );

  embed.addField(
    ctx.locale('buildings:guild.first.daily'),
    userDailyQuests
      ? userDailyQuests
          .map((a) => {
            const quest = ctx.client.boleham.Functions.getQuestById(a.id);
            return `**${ctx.locale(`quests:${a.id}.name`)}**\n**${ctx.locale(
              'common:objective',
            )}**: ${ctx.locale(`quests:${a.id}.description`, {
              count: quest.objective.value + quest.objective.perLevel * a.level,
            })}\n**${ctx.locale('common:progress')}**: ${
              a.finished
                ? ctx.locale('common:completed')
                : `${a.progress}/${quest.objective.value + quest.objective.perLevel * a.level}`
            }\n**${ctx.locale('common:rewards')}:**\n**${ctx.locale('common:experience')}**:${
              quest.reward.experience * a.level
            }\n${
              quest.reward.type === 'money'
                ? `**${ctx.locale('common:money')}:** ${emojis.roleplay_custom.gold} ${
                    quest.reward.amount.gold
                  }, ${emojis.roleplay_custom.silver} ${quest.reward.amount.silver}, ${
                    emojis.roleplay_custom.bronze
                  } ${quest.reward.amount.bronze}`
                : `**${ctx.locale('common:items')}:** ${ctx.locale(
                    `roleplay:items.${quest.reward.value}.name`,
                  )}`
            }`;
          })
          .join('\n\n')
      : ctx.locale('buildings:guild.first.no-daily'),
    true,
  );

  const activeQuest = user.quests?.active
    ? ctx.client.boleham.Functions.getQuestById(user.quests.active.id)
    : null;

  embed.addField(
    ctx.locale('buildings:guild.first.active'),
    activeQuest
      ? `**${ctx.locale(`quests:${user.quests.active?.id}.name`)}**\n**${ctx.locale(
          'common:objective',
        )}**: ${ctx.locale(`quests:${user.quests.active?.id}.description`, {
          count:
            activeQuest.objective.value +
            activeQuest.objective.perLevel * (user.quests.active?.level ?? 0),
        })}\n${ctx.locale('common:progress')}: ${
          user.quests.active?.finished
            ? ctx.locale('common:completed')
            : `${user.quests.active?.progress}/${
                activeQuest.objective.value +
                activeQuest.objective.perLevel * (user.quests.active?.level ?? 0)
              }`
        }\n**${ctx.locale('common:rewards')}:**\n ${ctx.locale('common:experience')} - ${
          activeQuest.reward.experience * (user.quests.active?.level ?? 0)
        }\n${
          activeQuest.reward.type === 'money'
            ? `**${ctx.locale('common:money')}:** ${emojis.roleplay_custom.gold} ${
                activeQuest.reward.amount.gold
              }, ${emojis.roleplay_custom.silver} ${activeQuest.reward.amount.silver}, ${
                emojis.roleplay_custom.bronze
              } ${activeQuest.reward.amount.bronze}`
            : `**${ctx.locale('common:items')}:** ${ctx.locale(
                `items:${activeQuest.reward.value}.name`,
              )}`
        }`
      : ctx.locale('buildings:guild.first.no-active'),
    true,
  );

  const claimButton = new MessageButton()
    .setCustomId(`${ctx.interaction.id} | CLAIM`)
    .setLabel(ctx.locale('buildings:guild.first.claim'))
    .setStyle('PRIMARY')
    .setDisabled(true);

  const questButton = new MessageButton()
    .setCustomId(`${ctx.interaction.id} | GET`)
    .setLabel(ctx.locale('buildings:guild.first.get'))
    .setStyle('PRIMARY')
    .setDisabled(true);

  if (userDailyQuests?.some((a) => a.finished && !a.claimed)) claimButton.setDisabled(false);
  if (!user.quests?.active || (user.quests?.active?.finished && user.quests?.active?.claimed))
    questButton.setDisabled(false).setStyle('SUCCESS');
  ctx.editReply({
    embeds: [embed],
    components: [{ type: 'ACTION_ROW', components: [claimButton, questButton] }],
  });

  const filter = (int: MessageComponentInteraction) =>
    int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

  const collector = ctx.channel.createMessageComponentCollector({ filter, max: 2, time: 10000 });

  collector.on('collect', async (int) => {
    int.deferUpdate();

    switch (resolveCustomId(int.customId)) {
      case 'CLAIM': {
        const toClaim: IQuest[] = [];

        if (userDailyQuests)
          toClaim.push(...userDailyQuests.filter((a) => a.finished && !a.claimed));

        if (user.quests.active && user.quests.active.finished && user.quests.active.claimed)
          toClaim.push(user.quests.active);

        toClaim.forEach((a) => {
          const quest = ctx.client.boleham.Functions.getQuestById(a.id);
          user.xp += quest.reward.experience * a.level;
          if (quest.reward.type === 'money')
            user.money = BasicFunctions.mergeCoins(
              user.money,
              BasicFunctions.mergeCoins(quest.reward.amount, {
                bronze: quest.reward.perLevel.bronze * a.level,
                silver: quest.reward.perLevel.silver * a.level,
                gold: quest.reward.perLevel.gold * a.level,
              }),
            );
          else {
            for (let i = quest.reward.amount + quest.reward.perLevel * a.level; i > 0; i--)
              BasicFunctions.mergeInventory(user.inventory, quest.reward.value);
          }
        });

        if (
          user.inventory.length >
          ctx.client.boleham.Functions.getBackPackLimit(user.equiped.backpack)
        ) {
          ctx.editReply({
            embeds: [embed.setDescription(ctx.locale('common:backpack-full'))],
          });
          return;
        }

        const { updatedUser, didUp } = ctx.client.boleham.Functions.checkUserUp(user);

        if (!didUp)
          ctx.editReply({ content: ctx.locale('buildings:guild.second.claimed'), components: [] });
        else
          ctx.editReply({
            content: `${ctx.locale('buildings:guild.second.claimed')}\n\n${ctx.locale(
              'common:level_up',
              { level: user.level },
            )}`,
            components: [],
            embeds: [],
          });

        await ctx.client.repositories.rpgRepository.editUser(user.id, updatedUser);
        break;
      }
      case 'GET': {
        const availableQuests = user.quests?.available.filter((a) => !a.finished && !a.claimed);

        if (!availableQuests || availableQuests.length === 0) {
          ctx.editReply({
            embeds: [
              embed
                .setDescription(ctx.locale('buildings:guild.first.no-available-quests'))
                .spliceFields(0, 2),
            ],
            components: [],
          });
          return;
        }

        collector.resetTimer();

        const selectQuest = new MessageSelectMenu()
          .setMinValues(1)
          .setMaxValues(1)
          .setCustomId(`${ctx.interaction.id} | QUEST`)
          .setPlaceholder(ctx.locale('buildings:guild.first.select-quest'));

        embed.setDescription(ctx.locale('buildings:guild.second.description'));

        availableQuests.forEach((a) => {
          const quest = ctx.client.boleham.Functions.getQuestById(a.id);
          embed.addField(
            ctx.locale(`quests:${a.id}.name`),
            `${ctx.locale(`quests:${a.id}.description`)}\n**${ctx.locale(
              'common:rewards',
            )}:**\n${ctx.locale('common.experience')}: ${quest.reward.experience * a.level}\n${
              quest.reward.type === 'money'
                ? ctx.locale('buildings:guild.second.money-reward', {
                    money: BasicFunctions.mergeCoins(quest.reward.amount, {
                      bronze: quest.reward.perLevel.bronze * a.level,
                      silver: quest.reward.perLevel.silver * a.level,
                      gold: quest.reward.perLevel.gold * a.level,
                    }),
                    emojis: {
                      gold: emojis.roleplay_custom.gold,
                      silver: emojis.roleplay_custom.silver,
                      bronze: emojis.roleplay_custom.bronze,
                    },
                  })
                : `${ctx.locale(`items:${quest.reward.value.id}.name`)} (${
                    quest.reward.amount
                  }) | ${ctx.locale('common:level', { level: quest.reward.value.level })}`
            }`,
          );
          selectQuest.addOptions({
            label: ctx.locale(`quests:${a.id}.name`),
            value: `${a.id}`,
          });
        });

        ctx.editReply({
          embeds: [embed],
          components: [{ type: 'ACTION_ROW', components: [selectQuest] }],
        });
        break;
      }
      case 'QUEST': {
        if (!int.isSelectMenu()) return;
        const getQuestLevel = (level: number): number => Math.floor(level / 3) + 1;

        user.quests.active = {
          claimed: false,
          finished: false,
          id: Number(int.values[0]),
          level: getQuestLevel(user.level),
          progress: 0,
        };
        await ctx.client.repositories.rpgRepository.editUser(user.id, { quests: user.quests });

        ctx.editReply({
          components: [],
          embeds: [],
          content: ctx.locale('buildings:guild.second.taken', {
            name: ctx.locale(`quests:${int.values[0]}.name`),
          }),
        });
        break;
      }
    }
  });
};
