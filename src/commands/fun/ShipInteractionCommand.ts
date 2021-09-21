import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment, MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class ShipInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ship',
      description: '「❤️」・Mostra o valor do ship de um casal',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Primeiro usuário',
          required: true,
        },
        {
          name: 'user_dois',
          type: 'USER',
          description: 'Segundo usuário. Caso não seja passado, o ship será feio com você',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user1 = ctx.options.getUser('user', true);
    const user2 = ctx.options.getUser('user_dois') ?? ctx.author;

    if (!user1) {
      await ctx.replyT('error', 'unknow-user', {}, true);
      return;
    }

    if (!user2) {
      await ctx.replyT('error', 'unknow-user', {}, true);
      return;
    }

    if (
      (await this.client.repositories.blacklistRepository.isUserBanned(user1.id)) === true ||
      (await this.client.repositories.blacklistRepository.isUserBanned(user2.id)) === true
    ) {
      ctx.replyT('error', 'banned-user', {}, true);
      return;
    }

    const dbUserToTakeValue1 = await this.client.repositories.userRepository.find(user1.id);
    const dbUserToTakeValue2 = await this.client.repositories.userRepository.find(user2.id);

    const FinalValue1 = dbUserToTakeValue1?.shipValue
      ? dbUserToTakeValue1.shipValue
      : Math.floor(Math.random() * 55);
    const FinalValue2 = dbUserToTakeValue2?.shipValue
      ? dbUserToTakeValue2.shipValue
      : Math.floor(Math.random() * 55);

    let value = Number(FinalValue1) + Number(FinalValue2);
    if (Number(value) >= 100) {
      value = 100;
    }

    if (dbUserToTakeValue1?.casado && dbUserToTakeValue1?.casado === user2.id) value = 100;

    const avatarLinkOne = user1.displayAvatarURL({ format: 'png', size: 256 });
    const avatarLinkTwo = user2.displayAvatarURL({ format: 'png', size: 256 });
    const bufferedShipImage = await HttpRequests.shipRequest(avatarLinkOne, avatarLinkTwo, value);

    const guild =
      ctx.interaction.guild ?? (await this.client.guilds.fetch(ctx.interaction.guildId ?? ''));

    const member1 = await guild.members.fetch(user1.id).catch(() => null);
    const member2 = await guild.members.fetch(user2.id).catch(() => null);

    const name1 = member1 && member1?.nickname ? member1.nickname : user1.username;
    const name2 = member2 && member2?.nickname ? member2.nickname : user2.username;
    const mix = `${
      name1.substring(0, name1.length / 2) + name2.substring(name2.length / 2, name2.length)
    }`.replace(' ', '');

    const embed = new MessageEmbed()
      .setTitle(`${name1} + ${name2} = ${mix}`)
      .setDescription(`\n${ctx.translate('value')} **${value}%**\n\n${ctx.translate('default')}`);

    let attc: MessageAttachment | null = null;

    if (!bufferedShipImage.err) {
      attc = new MessageAttachment(Buffer.from(bufferedShipImage.data as Buffer), 'ship.png');
      embed.setImage('attachment://ship.png');
    } else embed.setFooter(ctx.locale('commands:http-error'));

    if (Number(value) >= 25)
      embed
        .setColor('#cadf2a')
        .setDescription(`\n${ctx.translate('cvalue')} **${value}%**\n\n${ctx.translate('low')}`);
    if (Number(value) >= 50)
      embed
        .setColor('#d8937b')
        .setDescription(`\n${ctx.translate('value')} **${value}%**\n\n${ctx.translate('ok')}`);
    if (Number(value) >= 75)
      embed
        .setColor('#f34a4a')
        .setDescription(`\n${ctx.translate('value')} **${value}%**\n\n${ctx.translate('medium')}`);
    if (Number(value) >= 99)
      embed
        .setColor('#ec2c2c')
        .setDescription(`\n${ctx.translate('value')} **${value}%**\n\n${ctx.translate('high')}`);
    if (Number(value) === 100)
      embed
        .setColor('#ff00df')
        .setDescription(`\n${ctx.translate('value')} **${value}%**\n\n${ctx.translate('perfect')}`);

    if (attc)
      await ctx.reply({
        content: `**${ctx.translate('message-start')}**`,
        embeds: [embed],
        files: [attc],
      });
    else
      await ctx.reply({
        content: `**${ctx.translate('message-start')}**`,
        embeds: [embed],
      });
  }
}
