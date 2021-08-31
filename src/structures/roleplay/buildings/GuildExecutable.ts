import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import { MessageEmbed } from 'discord.js';
import { IRpgUserSchema } from '../Types';

export default async (ctx: InteractionCommandContext, user: IRpgUserSchema): Promise<void> => {
  const embed = new MessageEmbed()
    .setColor(ctx.data.user.cor)
    .setTitle(ctx.locale('roleplay:guild.first.title'))
    .setDescription(ctx.locale('roleplay:guild.first.description'));

  const userDailyQuests = await ctx.client.repositories.rpgRepository.getUserDailyQuests(
    ctx.interaction.user.id,
    user.level,
    ctx.client.boleham.Quests,
  );

  embed.addField(
    ctx.locale('roleplay:guild.first.daily'),
    userDailyQuests
      ? userDailyQuests
          .map((a) => {
            const quest = ctx.client.boleham.Functions.getQuestById(a.id);
            return `**${ctx.locale(`roleplay:quests.${a.id}.name`)}**\n**${ctx.locale(
              'common:objective',
            )}**: ${ctx.locale(`roleplay:quests.${a.id}.description`, {
              value: quest.objective.value + quest.objective.perLevel * a.level,
            })}\n${ctx.locale('common:progress')}: ${
              a.finished
                ? ctx.locale('common:completed')
                : `${a.progress}/${quest.objective.value + quest.objective.perLevel * a.level}`
            }\n**${ctx.locale('common:rewards')}:**\n ${ctx.locale('common:experience')} - ${
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
      : ctx.locale('roleplay:guild.first.no-daily'),
  );
  ctx.editReply({ embeds: [embed] });
};
