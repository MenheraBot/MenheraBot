import 'moment-duration-format';
import moment from 'moment';
import MenheraClient from 'MenheraClient';
import { COLORS, probabilities } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class HuntInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'cacar',
      description: '「🎯」・Sai para uma caçada com Xandão',
      options: [
        {
          name: 'tipo',
          type: 'STRING',
          description: 'Tipo da caça',
          required: true,
          choices: [
            {
              name: '😈 | Demônios',
              value: 'demônio',
            },
            {
              name: '👊 | Gigantes',
              value: 'gigantes',
            },
            {
              name: '👼 | Anjos',
              value: 'anjos',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              value: 'arcanjos',
            },
            {
              name: '🙌 | Semideuses',
              value: 'semideuses',
            },
            {
              name: '✝️ | Deuses',
              value: 'deus',
            },
            {
              name: '📊 | Probabilidades',
              value: 'probabilidades',
            },
          ],
        },
        {
          name: 'rolls',
          description: 'Quantidade de rolls que você quer usar de uma vez só',
          type: 'INTEGER',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;
    if (!ctx.interaction.guild) return;

    const selected = ctx.options.getString('tipo', true);

    if (!selected) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'no-args'), ephemeral: true });
      return;
    }

    const Probabilities =
      ctx.interaction.guild.id === '717061688460967988'
        ? probabilities.support
        : probabilities.normal;

    if (selected === 'probabilidades') {
      await ctx.makeMessage({
        content: ctx.translate('probabilities', {
          demon: Probabilities.demon,
          giant: Probabilities.giant,
          angel: Probabilities.angel,
          archangel: Probabilities.archangel,
          demi: Probabilities.demigod,
          god: Probabilities.god,
        }),
      });
      return;
    }

    const rollsToUse = ctx.options.getInteger('rolls');

    if (rollsToUse) {
      if (rollsToUse < 1) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'invalid-rolls'), ephemeral: true });
        return;
      }
      if (rollsToUse > ctx.data.user.rolls) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'rolls-poor'), ephemeral: true });
        return;
      }
    }

    const canHunt = parseInt(authorData.caçarTime) < Date.now();

    if (!canHunt && !rollsToUse) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'cooldown', {
          time: moment.utc(parseInt(authorData.caçarTime) - Date.now()).format('mm:ss'),
        }),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const cooldown = probabilities.defaultTime + Date.now();
    const embed = new MessageEmbed().setColor(COLORS.HuntDefault).setThumbnail(avatar);
    if (ctx.interaction.guild.id !== '717061688460967988') embed.setFooter(ctx.translate('footer'));

    const { huntDemon, huntGiant, huntAngel, huntArchangel, huntDemigod, huntGod } =
      this.client.repositories.huntRepository;

    const toRun = canHunt && rollsToUse ? rollsToUse + 1 : rollsToUse ?? 1;

    const areYouTheHuntOrTheHunter = async (
      probability: Array<number>,
      saveFn: typeof huntDemon,
    ) => {
      let value = 0;
      let tries = 0;
      let success = 0;

      for (let i = toRun; i > 0; i--) {
        const taked = probability[Math.floor(Math.random() * probability.length)];
        value += taked;
        tries += 1;
        if (taked > 0) success += 1;
      }

      await saveFn.call(
        this.client.repositories.huntRepository,
        ctx.author.id,
        value,
        cooldown.toString(),
        rollsToUse || 0,
      );
      return { value, success, tries };
    };

    // eslint-disable-next-line no-shadow
    enum huntEnum {
      DEMON = 'caçados',
      ANGEL = 'anjos',
      DEMIGOD = 'semideuses',
      GIANT = 'giants',
      ARCHANGEL = 'arcanjos',
      GOD = 'deuses',
    }

    switch (selected) {
      case 'demônio': {
        const result = await areYouTheHuntOrTheHunter(Probabilities.demon, huntDemon);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.author.id,
          huntEnum.DEMON,
          await this.client.repositories.cacheRepository.getDeletedAccounts(),
        );
        embed
          .setTitle(ctx.translate('demons'))
          .setColor(COLORS.HuntDemon)
          .setDescription(
            ctx.translate('description_start', {
              value: result.value,
              hunt: ctx.translate('demons'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        HttpRequests.postHuntCommand(ctx.author.id, 'demon', result);
        break;
      }
      case 'gigantes': {
        const result = await areYouTheHuntOrTheHunter(Probabilities.giant, huntGiant);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.author.id,
          huntEnum.GIANT,
          await this.client.repositories.cacheRepository.getDeletedAccounts(),
        );
        embed
          .setTitle(ctx.translate('giants'))
          .setColor(COLORS.HuntGiant)
          .setDescription(
            ctx.translate('description_start', {
              value: result.value,
              hunt: ctx.translate('giants'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        HttpRequests.postHuntCommand(ctx.author.id, 'giant', result);
        break;
      }
      case 'anjos': {
        const result = await areYouTheHuntOrTheHunter(Probabilities.angel, huntAngel);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.author.id,
          huntEnum.ANGEL,
          await this.client.repositories.cacheRepository.getDeletedAccounts(),
        );
        embed
          .setTitle(ctx.translate('angels'))
          .setColor(COLORS.HuntAngel)
          .setDescription(
            ctx.translate('description_start', {
              value: result.value,
              hunt: ctx.translate('angels'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        HttpRequests.postHuntCommand(ctx.author.id, 'angel', result);
        break;
      }
      case 'arcanjos': {
        const result = await areYouTheHuntOrTheHunter(Probabilities.archangel, huntArchangel);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.author.id,
          huntEnum.ARCHANGEL,
          await this.client.repositories.cacheRepository.getDeletedAccounts(),
        );
        embed
          .setTitle(ctx.translate('archangel'))
          .setColor(COLORS.HuntArchangel)
          .setDescription(
            ctx.translate('description_start', {
              value: result.value,
              hunt: ctx.translate('archangel'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        HttpRequests.postHuntCommand(ctx.author.id, 'archangel', result);
        break;
      }
      case 'semideuses': {
        const result = await areYouTheHuntOrTheHunter(Probabilities.demigod, huntDemigod);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.author.id,
          huntEnum.DEMIGOD,
          await this.client.repositories.cacheRepository.getDeletedAccounts(),
        );
        embed
          .setTitle(ctx.translate('sd'))
          .setColor(COLORS.HuntSD)
          .setDescription(
            ctx.translate('description_start', {
              value: result.value,
              hunt: ctx.translate('sd'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        HttpRequests.postHuntCommand(ctx.author.id, 'demigod', result);
        break;
      }
      case 'deus': {
        const result = await areYouTheHuntOrTheHunter(Probabilities.god, huntGod);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.author.id,
          huntEnum.GOD,
          await this.client.repositories.cacheRepository.getDeletedAccounts(),
        );
        embed
          .setColor(COLORS.HuntGod)
          .setTitle(ctx.translate('gods'))
          .setDescription(
            result.value > 0
              ? ctx.translate('god_hunted_success', {
                  count: result.value,
                  hunt: ctx.translate('gods'),
                  rank: rank + 1,
                  toRun,
                })
              : ctx.translate('god_hunted_fail', { rank: rank + 1, count: toRun }),
          );
        if (result.value > 0)
          embed.setColor(COLORS.HuntGod).setThumbnail('https://i.imgur.com/053khaH.gif');
        HttpRequests.postHuntCommand(ctx.author.id, 'god', result);
        break;
      }
    }
    await ctx.makeMessage({ embeds: [embed] });
  }
}
