import { Interaction, Collection, GuildMember, MessageEmbed } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';
import i18next from 'i18next';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import { ICommandUsedData } from '@utils/Types';

export default class InteractionCreate extends Event {
  constructor(public client: MenheraClient) {
    super(client);
  }

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild() || interaction.channel?.type === 'DM')
      return interaction
        .reply({
          content:
            'SLASH COMMANDS ARE ONLY AVAILABLE IN GUILDS\nCOMANDOS SLASH ESTÃO DISPONÍVEIS APENAS EM SERVIDORES',
          ephemeral: true,
        })
        .catch(() => undefined);

    const server = await this.client.repositories.cacheRepository.fetchGuild(interaction.guildId);
    const language = server.lang ?? 'pt-BR';
    const t = i18next.getFixedT(language);

    const isUserBanned = await this.client.repositories.blacklistRepository.isUserBanned(
      interaction.user.id,
    );

    if (isUserBanned) {
      const userBannedInfo = await this.client.repositories.userRepository.getBannedUserInfo(
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

    const command = this.client.slashCommands.get(interaction.commandName);
    if (!command) {
      interaction
        .reply({ content: t('permissions:UNKNOW_SLASH'), ephemeral: true })
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

    const dbCommand = await this.client.repositories.cacheRepository.fetchCommand(
      interaction.commandName,
    );

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

    if (!this.client.cooldowns.has(command.config.name))
      this.client.cooldowns.set(command.config.name, new Collection());

    const now = Date.now();
    const timestamps = this.client.cooldowns.get(command.config.name) as Collection<string, number>;
    const cooldownAmount = (command.config.cooldown || 3) * 1000;

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
          : await (
              await this.client.guilds.fetch(interaction.guildId)
            ).members.fetch(interaction.user.id);
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
      const clientMember = await (
        await this.client.guilds.fetch(interaction.guildId)
      ).members.fetch(this.client.user?.id ?? '');
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

    const authorData = await this.client.repositories.userRepository.findOrCreate(
      interaction.user.id,
    );

    const ctx = new InteractionCommandContext(
      this.client,
      interaction,
      { user: authorData, server },
      t,
      command.config.name,
    );

    try {
      if (!command.run) return;
      await command.run(ctx).catch(async (err) => {
        const errorWebHook = await this.client.fetchWebhook(
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
          const errorMessage =
            err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
          const embed = new MessageEmbed();
          embed.setColor('#fd0000');
          embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
          embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
          embed.addField(
            '<:atencao:759603958418767922> | Usage',
            `UserId: \`${interaction.user.id}\` \nServerId: \`${interaction.guild?.id}\``,
          );
          embed.setTimestamp();
          embed.addField(
            t('events:error_embed.report_title'),
            t('events:error_embed.report_value'),
          );

          if (this.client.user?.id === '708014856711962654')
            errorWebHook.send({ embeds: [embed] }).catch(() => null);
        }
      });
    } catch (err) {
      const errorWebHook = await this.client.fetchWebhook(
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

        if (this.client.user?.id === '708014856711962654')
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
    };

    await HttpRequests.postCommand(data);
  }
}
