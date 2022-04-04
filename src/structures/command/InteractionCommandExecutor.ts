/* eslint-disable @typescript-eslint/ban-ts-comment */
import { languageByLocale } from '@structures/Constants';
import HttpRequests from '@utils/HTTPrequests';
import { ICommandUsedData } from '@utils/Types';
import { debugError } from '@utils/Util';
import { CommandInteraction, MessageEmbed, Collection } from 'discord.js-light';
import i18next from 'i18next';
import MenheraClient from 'MenheraClient';
import InteractionCommandContext from './InteractionContext';

const InteractionCommandExecutor = async (
  interaction: CommandInteraction<'cached'> & { client: MenheraClient },
): Promise<void> => {
  const server = await interaction.client.repositories.cacheRepository.fetchGuild(
    interaction.guildId,
    interaction.guild?.preferredLocale ?? languageByLocale.brazil,
  );

  const t = i18next.getFixedT(server.lang ?? interaction.guildLocale);

  const isUserBanned = await interaction.client.repositories.blacklistRepository.isUserBanned(
    interaction.user.id,
  );

  if (isUserBanned) {
    const userBannedInfo = await interaction.client.repositories.userRepository.getBannedUserInfo(
      interaction.user.id,
    );

    await interaction
      .reply({
        content: `<:negacao:759603958317711371> | ${t('permissions:BANNED_INFO', {
          banReason: userBannedInfo?.banReason,
        })}`,
        ephemeral: true,
      })
      .catch(debugError);
    return;
  }

  const command = interaction.client.slashCommands.get(interaction.commandName);
  if (!command) {
    interaction
      .reply({ content: t('permissions:UNKNOWN_SLASH'), ephemeral: true })
      .catch(debugError);
    return;
  }

  if (
    (command.config.category === 'economy' || command.config.category === 'roleplay') &&
    interaction.client.economyUsages.has(interaction.user.id)
  ) {
    await interaction
      .reply({
        content: `<:negacao:759603958317711371> | ${t('permissions:IN_COMMAND_EXECUTION')}`,
        ephemeral: true,
      })
      .catch(debugError);
    return;
  }

  if (command.config.devsOnly && process.env.OWNER !== interaction.user.id) {
    await interaction.reply({ content: `${t('permissions:ONLY_DEVS')}`, ephemeral: true });
    return;
  }

  if (
    server.blockedChannels?.includes(interaction.channelId) &&
    !interaction.memberPermissions?.has('MANAGE_CHANNELS')
  ) {
    interaction
      .reply({ content: `🔒 | ${t('events:blocked-channel')}`, ephemeral: true })
      .catch(debugError);
    return;
  }

  if (server.disabledCommands?.includes(command.config.name)) {
    await interaction
      .reply({
        content: `🔒 | ${t('permissions:DISABLED_COMMAND', {
          cmd: command.config.name,
        })}`,
        ephemeral: true,
      })
      .catch(debugError);
    return;
  }

  const dbCommand = await interaction.client.repositories.cacheRepository.fetchCommand(
    interaction.commandName,
  );

  if (dbCommand?.maintenance && process.env.OWNER !== interaction.user.id) {
    await interaction
      .reply({
        content: `<:negacao:759603958317711371> | ${t('events:maintenance', {
          reason: dbCommand.maintenanceReason,
        })}`,
        ephemeral: true,
      })
      .catch(debugError);
    return;
  }

  if (!interaction.client.cooldowns.has(command.config.name))
    interaction.client.cooldowns.set(command.config.name, new Collection());

  const now = Date.now();

  if (now - interaction.createdTimestamp >= 3000) {
    interaction.client.interactionStatistics.failed += 1;
    return;
  }

  const timestamps = interaction.client.cooldowns.get(command.config.name) as Collection<
    string,
    number
  >;

  const cooldownAmount = (command.config.cooldown ?? 3) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      await interaction
        .reply({
          content: `<:atencao:759603958418767922> | ${t('events:cooldown', {
            time: timeLeft.toFixed(2),
            cmd: command.config.name,
          })}`,
          ephemeral: true,
        })
        .catch(debugError);
      return;
    }
  }

  timestamps.set(interaction.user.id, now);

  setTimeout(() => {
    timestamps.delete(interaction.user.id);
  }, cooldownAmount);

  const authorData =
    command.config.authorDataFields.length > 0
      ? await interaction.client.repositories.userRepository.findOrCreate(
          interaction.user.id,
          command.config.authorDataFields,
        )
      : null;

  const ctx = new InteractionCommandContext(
    interaction,
    t,
    // @ts-expect-error
    { server, user: authorData },
  );

  if (!command.run) return;

  if (command.config.category === 'economy') interaction.client.economyUsages.add(ctx.author.id);

  await command
    .run(ctx)
    .catch(async (err) => {
      const errorWebHook = await interaction.client.fetchWebhook(
        process.env.BUG_HOOK_ID as string,
        process.env.BUG_HOOK_TOKEN as string,
      );

      if (interaction.deferred) {
        interaction.webhook
          .send({ content: t('events:error_embed.title'), ephemeral: true })
          .catch(debugError);
      } else
        interaction
          .reply({ content: t('events:error_embed.title'), ephemeral: true })
          .catch(debugError);

      if (err instanceof Error && err.stack) {
        const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
        const embed = new MessageEmbed();
        embed.setColor('#fd0000');
        embed.setTitle(
          `${process.env.NODE_ENV === 'development' ? '[BETA]' : ''} ${t(
            'events:error_embed.title',
            {
              cmd: command.config.name,
            },
          )}`,
        );
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
        embed.addField(
          '<:atencao:759603958418767922> | Usage',
          `UserId: \`${interaction.user.id}\` \nServerId: \`${interaction.guild?.id}\``,
        );
        embed.setTimestamp();
        embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

        errorWebHook.send({ embeds: [embed] }).catch(debugError);
      }
    })
    .finally(() => {
      if (command.config.category === 'economy')
        interaction.client.economyUsages.delete(ctx.author.id);
    });

  if (!interaction.guild || process.env.NODE_ENV === 'development') return;

  const data: ICommandUsedData = {
    authorId: interaction.user.id,
    guildId: interaction.guild.id,
    commandName: command.config.name,
    data: Date.now(),
    args: interaction.options.data,
    shardId: interaction.client.cluster?.id ?? 0,
  };

  await HttpRequests.postCommand(data);
};

export default InteractionCommandExecutor;
