import { languageByLocale } from '@structures/MenheraConstants';
import HttpRequests from '@utils/HTTPrequests';
import { ICommandUsedData } from '@utils/Types';
import {
  CommandInteraction,
  BaseGuildCommandInteraction,
  GuildMember,
  MessageEmbed,
  Collection,
} from 'discord.js-light';
import i18next from 'i18next';
import MenheraClient from 'MenheraClient';
import InteractionCommandContext from './InteractionContext';

const InteractionCommandExecutor = async (
  client: MenheraClient,
  interaction: BaseGuildCommandInteraction<'present'> & CommandInteraction,
): Promise<void> => {
  const server = await client.repositories.cacheRepository.fetchGuild(
    interaction.guildId,
    interaction.guild?.preferredLocale ?? languageByLocale.brazil,
  );

  const t = i18next.getFixedT(server.lang ?? 'pt-BR');

  const isUserBanned = await client.repositories.blacklistRepository.isUserBanned(
    interaction.user.id,
  );

  if (isUserBanned) {
    const userBannedInfo = await client.repositories.userRepository.getBannedUserInfo(
      interaction.user.id,
    );
    await interaction
      .reply({
        content: `<:negacao:759603958317711371> | ${t('permissions:BANNED_INFO', {
          banReason: userBannedInfo?.banReason,
        })}`,
        ephemeral: true,
      })
      .catch(() => null);
    return;
  }

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    interaction
      .reply({ content: t('permissions:UNKNOWN_SLASH'), ephemeral: true })
      .catch(() => null);
    return;
  }

  if (
    server.blockedChannels?.includes(interaction.channelId) &&
    !(interaction.member as GuildMember).permissions.has('MANAGE_CHANNELS')
  ) {
    interaction
      .reply({ content: `🔒 | ${t('events:blocked-channel')}`, ephemeral: true })
      .catch(() => null);
    return;
  }

  const dbCommand = await client.repositories.cacheRepository.fetchCommand(interaction.commandName);

  if (server.disabledCommands?.includes(command.config.name)) {
    await interaction
      .reply({
        content: `🔒 | ${t('permissions:DISABLED_COMMAND', {
          cmd: command.config.name,
        })}`,
        ephemeral: true,
      })
      .catch(() => null);
    return;
  }
  if (command.config.devsOnly && process.env.OWNER !== interaction.user.id) {
    await interaction.reply({ content: `${t('permissions:ONLY_DEVS')}`, ephemeral: true });
    return;
  }

  if (dbCommand?.maintenance && process.env.OWNER !== interaction.user.id) {
    await interaction
      .reply({
        content: `<:negacao:759603958317711371> | ${t('events:maintenance', {
          reason: dbCommand.maintenanceReason,
        })}`,
        ephemeral: true,
      })
      .catch(() => null);
    return;
  }

  if (!client.cooldowns.has(command.config.name))
    client.cooldowns.set(command.config.name, new Collection());

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.config.name) as Map<string, number>;
  const cooldownAmount = (command.config.cooldown || 3) * 1000;

  if (now - interaction.createdTimestamp >= 3000) return;

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
        .catch(() => null);
      return;
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => {
    timestamps.delete(interaction.user.id);
  }, cooldownAmount);

  if (command.config.userPermissions) {
    const member =
      interaction.member instanceof GuildMember
        ? interaction.member
        : await (await client.guilds.fetch(interaction.guildId)).members.fetch(interaction.user.id);
    const missing = interaction.channel
      ?.permissionsFor(member)
      ?.missing(command.config.userPermissions);
    if (missing?.length) {
      const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
      await interaction
        .reply({
          content: `<:negacao:759603958317711371> | ${t('permissions:USER_MISSING_PERMISSION', {
            perm,
          })}`,
          ephemeral: true,
        })
        .catch(() => null);
      return;
    }
  }

  if (command.config.clientPermissions) {
    const clientMember = interaction.guild?.members.cache.get(
      client.user?.id as string,
    ) as GuildMember;
    const missing = interaction.channel
      ?.permissionsFor(clientMember)
      ?.missing(command.config.clientPermissions);
    if (missing?.length) {
      const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
      await interaction
        .reply({
          content: `<:negacao:759603958317711371> | ${t('permissions:CLIENT_MISSING_PERMISSION', {
            perm,
          })}`,
          ephemeral: true,
        })
        .catch(() => null);
      return;
    }
  }

  const authorData = await client.repositories.userRepository.findOrCreate(interaction.user.id);

  const ctx = new InteractionCommandContext(
    client,
    interaction,
    { user: authorData, server },
    t,
    command.config.name,
  );

  try {
    if (!command.run) return;
    await command.run(ctx).catch(async (err) => {
      const errorWebHook = await client.fetchWebhook(
        process.env.BUG_HOOK_ID as string,
        process.env.BUG_HOOK_TOKEN as string,
      );
      if (interaction.deferred) {
        interaction.webhook
          .send({ content: t('events:error_embed.title'), ephemeral: true })
          .catch(() => null);
      } else
        interaction
          .reply({ content: t('events:error_embed.title'), ephemeral: true })
          .catch(() => null);

      if (err instanceof Error && err.stack) {
        const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
        const embed = new MessageEmbed();
        embed.setColor('#fd0000');
        embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
        embed.addField(
          '<:atencao:759603958418767922> | Usage',
          `UserId: \`${interaction.user.id}\` \nServerId: \`${interaction.guild?.id}\``,
        );
        embed.setTimestamp();
        embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

        if (client.user?.id === '708014856711962654')
          errorWebHook.send({ embeds: [embed] }).catch(() => null);
      }
    });
  } catch (err) {
    const errorWebHook = await client.fetchWebhook(
      process.env.BUG_HOOK_ID as string,
      process.env.BUG_HOOK_TOKEN as string,
    );

    if (interaction.deferred) {
      interaction.webhook
        .send({ content: t('events:error_embed.title'), ephemeral: true })
        .catch(() => null);
    } else
      interaction
        .reply({ content: t('events:error_embed.title'), ephemeral: true })
        .catch(() => null);

    if (err instanceof Error && err.stack) {
      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
      const embed = new MessageEmbed();
      embed.setColor('#fd0000');
      embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
      embed.addField(
        '<:atencao:759603958418767922> | Usage',
        `UserId: \`${interaction.user.id}\` \nServerId: \`${interaction.guild?.id}\``,
      );
      embed.setTimestamp();
      embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

      if (client.user?.id === '708014856711962654')
        errorWebHook.send({ embeds: [embed] }).catch(() => null);
    }
  }

  if (!interaction.guild) return;
  const data: ICommandUsedData = {
    authorId: interaction.user.id,
    guildId: interaction.guild.id,
    commandName: command.config.name,
    data: Date.now(),
    args: interaction.options.data,
    shardId: client.shard?.ids[0] ?? 0,
  };

  await HttpRequests.postCommand(data);
};

export default InteractionCommandExecutor;
