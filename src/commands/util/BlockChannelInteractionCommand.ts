import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class BlockChannelInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blockcanal',
      description: '「🚫」・Mude as permissões de usar comandos meus em algum canal',
      category: 'util',
      options: [
        {
          type: 'CHANNEL',
          name: 'canal',
          description: 'Canal para ser bloqueado/desbloqueado',
          required: true,
        },
      ],
      cooldown: 7,
      userPermissions: ['MANAGE_CHANNELS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selectedChannel = ctx.options.getChannel('canal', true);

    if (selectedChannel?.type !== 'GUILD_TEXT') {
      ctx.replyT('error', 'commands:blockchannel.invalid-channel', {}, true);
      return;
    }

    if (ctx.data.server.blockedChannels.includes(selectedChannel.id)) {
      const index = ctx.data.server.blockedChannels.indexOf(selectedChannel.id);

      ctx.data.server.blockedChannels.splice(index, 1);
      await this.client.repositories.cacheRepository.updateGuild(
        ctx.interaction.guild?.id as string,
        ctx.data.server,
      );
      await ctx.replyT('success', 'commands:blockchannel.unblock', {
        channel: selectedChannel.toString(),
      });
      return;
    }
    ctx.data.server.blockedChannels.push(selectedChannel.id);
    await this.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );
    await ctx.replyT('success', 'commands:blockchannel.block', {
      channel: selectedChannel.toString(),
    });
  }
}
