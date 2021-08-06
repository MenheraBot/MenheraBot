import { Interaction, Collection, ClientUser } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';
import i18next from 'i18next';

import { LANGUAGES } from '@structures/MenheraConstants';
import InteractionCommandContext from '@structures/InteractionContext';

export default class InteractionCreate extends Event {
  constructor(public client: MenheraClient) {
    super(client);
  }

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild() || interaction.channel?.type === 'DM')
      return interaction.reply({
        content:
          'SLASH COMMANDS ARE ONLY AVAILABLE IN GUILDS\nCOMANDOS SLASH ESTÃO DISPONÍVEIS APENAS EM SERVIDORES',
        ephemeral: true,
      });

    const server = await this.client.repositories.cacheRepository.fetchGuild(interaction.guildId);
    const language = LANGUAGES[server.lang] ?? LANGUAGES['pt-BR'];
    const t = i18next.getFixedT(language);

    const command = this.client.slashCommands.get(interaction.commandName);
    if (!command) {
      interaction.reply({ content: t('permissions:UNKNOW_SLASH'), ephemeral: true });
      return;
    }

    if (server.blockedChannels?.includes(interaction.channelId)) {
      interaction.reply({ content: `🔒 | ${t('events:blocked-channel')}`, ephemeral: true });
      return;
    }

    const dbCommand = await this.client.repositories.cacheRepository.fetchCommand(
      interaction.commandName,
    );

    if (server.disabledCommands?.includes(command.config.name)) {
      await interaction.reply({
        content: `🔒 | ${t('permissions:DISABLED_COMMAND', {
          prefix: server.prefix,
          cmd: command.config.name,
        })}`,
        ephemeral: true,
      });
      return;
    }
    if (command.config.devsOnly && process.env.OWNER !== interaction.user.id) {
      await interaction.reply({ content: `${t('permissions:ONLY_DEVS')}`, ephemeral: true });
      return;
    }

    if (dbCommand?.maintenance && process.env.OWNER !== interaction.user.id) {
      await interaction.reply({
        content: `<:negacao:759603958317711371> | ${t('events:maintenance', {
          reason: dbCommand.maintenanceReason,
        })}`,
        ephemeral: true,
      });
      return;
    }

    if (!this.client.cooldowns.has(command.config.name))
      this.client.cooldowns.set(command.config.name, new Collection());

    if (process.env.OWNER !== interaction.user.id) {
      const now = Date.now();
      const timestamps = this.client.cooldowns.get(command.config.name) as Collection<
        string,
        number
      >;
      const cooldownAmount = (command.config.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply({
            content: `<:atencao:759603958418767922> | ${t('events:cooldown', {
              time: timeLeft.toFixed(2),
              cmd: command.config.name,
            })}`,
            ephemeral: true,
          });
          return;
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => {
        timestamps.delete(interaction.user.id);
      }, cooldownAmount);
    }

    if (command.config.userPermissions) {
      const missing = interaction.channel
        ?.permissionsFor(interaction.user)
        ?.missing(command.config.userPermissions);
      if (missing?.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        await interaction.reply({
          content: `<:negacao:759603958317711371> | ${t('permissions:USER_MISSING_PERMISSION', {
            perm,
          })}`,
          ephemeral: true,
        });
        return;
      }
    }
    if (command.config.clientPermissions) {
      const missing = interaction.channel
        ?.permissionsFor(this.client.user as ClientUser)
        ?.missing(command.config.clientPermissions);
      if (missing?.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        await interaction.reply({
          content: `<:negacao:759603958317711371> | ${t('permissions:CLIENT_MISSING_PERMISSION', {
            perm,
          })}`,
          ephemeral: true,
        });
        return;
      }
    }

    const authorData = await this.client.repositories.userRepository.findOrCreate(
      interaction.user.id,
    );

    if (authorData?.ban) {
      await interaction.reply({
        content: `<:negacao:759603958317711371> | ${t('permissions:BANNED_INFO', {
          banReason: authorData?.banReason,
        })}`,
        ephemeral: true,
      });
      return;
    }
    const ctx = new InteractionCommandContext(
      this.client,
      interaction,
      interaction.options.data,
      { user: authorData, server },
      t,
    );

    try {
      if (!command.run) return;
      await command.run(ctx).catch((err) => {
        console.log(err);
        interaction.reply({ content: t('events:error_embed.title'), ephemeral: true });
      });
    } catch {
      interaction.reply({ content: t('events:error_embed.title'), ephemeral: true });
    }
  }
}
