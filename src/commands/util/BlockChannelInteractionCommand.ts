import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import Util from '@utils/Util';

export default class BlockChannelInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blockcanal',
      description: '「🚫」・Mude as permissões de comandos nos canais',
      category: 'util',
      options: [
        {
          name: 'config',
          description: '「🚫」・ Adicione ou remova um canal da lista de bloqueados',
          type: 'SUB_COMMAND',
          options: [
            {
              type: 'CHANNEL',
              name: 'canal',
              description: 'Canal para ser bloqueado/desbloqueado',
              required: true,
              channelTypes: ['GUILD_TEXT'],
            },
          ],
        },
        {
          name: 'lista',
          description: '「📄」・ Modifique a lista de comandos bloqueados',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'opcao',
              description: 'A opção que você deseja fazer na lista de comandos bloqueados',
              type: 'STRING',
              required: true,
              choices: [
                {
                  name: '🗑️ | Remover Todos Canais',
                  value: 'delete',
                },
                {
                  name: '📜 | Ver Canais Bloqueados',
                  value: 'view',
                },
              ],
            },
          ],
        },
      ],
      cooldown: 7,
      userPermissions: ['MANAGE_CHANNELS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selectedOption = ctx.options.getSubcommand(true);

    if (selectedOption === 'config') {
      const selectedChannel = ctx.options.getChannel('canal', true);

      if (selectedChannel?.type !== 'GUILD_TEXT') {
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'invalid-channel'),
          ephemeral: true,
        });
        return;
      }

      if (ctx.data.server.blockedChannels.includes(selectedChannel.id)) {
        const index = ctx.data.server.blockedChannels.indexOf(selectedChannel.id);

        ctx.data.server.blockedChannels.splice(index, 1);
        await this.client.repositories.cacheRepository.updateGuild(
          ctx.interaction.guild?.id as string,
          ctx.data.server,
        );
        await ctx.makeMessage({
          content: ctx.prettyResponse('success', 'unblock', {
            channel: selectedChannel.toString(),
          }),
        });
        return;
      }
      ctx.data.server.blockedChannels.push(selectedChannel.id);
      await this.client.repositories.cacheRepository.updateGuild(
        ctx.interaction.guild?.id as string,
        ctx.data.server,
      );
      await ctx.makeMessage({
        content: ctx.prettyResponse('success', 'block', {
          channel: selectedChannel.toString(),
        }),
      });
      return;
    }

    const option = ctx.options.getString('opcao', true);

    switch (option) {
      case 'view':
        ctx.makeMessage({
          content: `${emojis.list} | ${ctx.translate('blocked-channels')}\n\n${
            ctx.data.server.blockedChannels.length === 0
              ? ctx.translate('zero-value')
              : ctx.data.server.blockedChannels.map((a) => `• <#${a}>`).join('\n')
          }`,
        });
        break;
      case 'delete': {
        ctx.makeMessage({
          content: ctx.translate('sure'),
          components: [
            {
              type: 'ACTION_ROW',
              components: [
                new MessageButton()
                  .setCustomId(ctx.interaction.id)
                  .setStyle('DANGER')
                  .setLabel(ctx.locale('common:confirm')),
              ],
            },
          ],
        });

        const confirmed = await Util.collectComponentInteractionWithId(
          ctx.channel,
          ctx.author.id,
          ctx.interaction.id,
          7000,
        );

        if (confirmed && ctx.interaction.guild) {
          this.client.repositories.guildRepository.update(ctx.interaction.guild.id, {
            blockedChannels: [],
          });
          ctx.makeMessage({ components: [], content: ctx.prettyResponse('yes', 'done') });
          return;
        }

        ctx.deleteReply();
        break;
      }
    }
  }
}
