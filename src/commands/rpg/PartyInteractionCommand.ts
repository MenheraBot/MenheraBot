import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class PartyInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'party',
      description:
        '【ＲＰＧ】Inicie um grupo com pessoas da sua localização para irem à uma batalha contra monstros',
      category: 'rpg',
      options: [
        {
          name: 'user_one',
          description: 'Primeiro usuário da party',
          type: 'USER',
          required: false,
        },
        {
          name: 'user_two',
          description: 'Segundo usuário da party',
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.findUser(ctx.interaction.user.id);
    if (!user) {
      ctx.replyT('error', 'common:not-registred');
      return;
    }

    const userParty = await this.client.repositories.rpgRepository.getUserParty(user.id);
    const userOne = ctx.options.getUser('user_one');
    const userTwo = ctx.options.getUser('user_two');

    if (!userParty && !userOne && !userTwo) {
      ctx.replyT('error', 'party.no-mention');
      return;
    }

    const embed = new MessageEmbed().setTitle(ctx.translate('title')).setColor(ctx.data.user.cor);

    if (userParty) {
      embed.setDescription(ctx.translate('description'));
      embed.addField(
        ctx.interaction.user.username,
        ctx.translate('stats', {
          life: user.life,
          maxLife: user.maxLife,
          mana: user.mana,
          maxMana: user.maxMana,
          tiredness: user.tiredness,
        }),
      );
      userParty.map(async (a) => {
        const fetchedUser = await this.client.users.fetch(a);
        const userStats = await this.client.repositories.rpgRepository.findUser(a);
        if (!userStats || !fetchedUser)
          return embed.addField(ctx.translate('not-found'), ctx.translate('not-found-value'));

        embed.addField(
          fetchedUser.username,
          ctx.translate('stats', {
            life: userStats.life,
            maxLife: userStats.maxLife,
            mana: userStats.mana,
            maxMana: userStats.maxMana,
            tiredness: userStats.tiredness,
          }),
        );
      });

      ctx.editReply({ embeds: [embed], components: [{ type: 'ACTION_ROW', components: [] }] });
    }
  }
}
