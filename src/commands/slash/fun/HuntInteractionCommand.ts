import 'moment-duration-format';
import moment from 'moment';
import MenheraClient from 'MenheraClient';
import { COLORS, probabilities } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ColorResolvable, MessageEmbed } from 'discord.js';

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
              name: 'Demônios',
              value: 'demônio',
            },
            {
              name: 'Anjos',
              value: 'anjos',
            },
            {
              name: 'Semideuses',
              value: 'semideuses',
            },
            {
              name: 'Deuses',
              value: 'deus',
            },
            {
              name: 'Probabilidades',
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

    const selected = ctx.args[0].value as string;

    if (!selected) {
      await ctx.replyT('error', `${ctx.locale('commands:hunt.no-args')}`, {}, true);
      return;
    }

    const probabilidadeDemonio =
      ctx.interaction.guild.id === '717061688460967988'
        ? probabilities.support.demon
        : probabilities.normal.demon;
    const probabilidadeAnjo =
      ctx.interaction.guild.id === '717061688460967988'
        ? probabilities.support.angel
        : probabilities.normal.angel;
    const probabilidadeSD =
      ctx.interaction.guild.id === '717061688460967988'
        ? probabilities.support.demigod
        : probabilities.normal.demigod;
    const probabilidadeDeuses =
      ctx.interaction.guild.id === '717061688460967988'
        ? probabilities.support.god
        : probabilities.normal.god;

    if (selected === 'probabilidades') {
      await ctx.reply(
        ctx.locale('commands:hunt.probabilities', {
          demon: probabilidadeDemonio,
          angel: probabilidadeAnjo,
          demi: probabilidadeSD,
          god: probabilidadeDeuses,
        }),
      );
      return;
    }

    const rollsToUse = ctx.args[1]?.value as number;

    if (rollsToUse) {
      if (rollsToUse < 1) {
        ctx.replyT('error', 'commands:hunt.invalid-rolls', {}, true);
        return;
      }
      if (rollsToUse > ctx.data.user.rolls) {
        ctx.replyT('error', 'commands:hunt.rolls-poor', {}, true);
        return;
      }
    }

    const canHunt = parseInt(authorData.caçarTime) < Date.now();

    if (!canHunt && !rollsToUse) {
      ctx.replyT(
        'error',
        'commands:hunt.cooldown',
        {
          time: moment.utc(parseInt(authorData.caçarTime) - Date.now()).format('mm:ss'),
        },
        true,
      );
      return;
    }

    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });
    const cooldown = probabilities.defaultTime + Date.now();
    const embed = new MessageEmbed()
      .setColor(COLORS.HuntDefault as ColorResolvable)
      .setThumbnail(avatar);
    if (ctx.interaction.guild.id !== '717061688460967988')
      embed.setFooter(ctx.locale('commands:hunt.footer'));

    const { huntDemon, huntAngel, huntDemigod, huntGod } = this.client.repositories.huntRepository;

    const toRun = canHunt && rollsToUse ? rollsToUse + 1 : rollsToUse ?? 1;

    const areYouTheHuntOrTheHunter = async (
      probability: Array<number>,
      saveFn: typeof huntDemon,
    ) => {
      let value = 0;

      for (let i = toRun; i > 0; i--) {
        value += probability[Math.floor(Math.random() * probability.length)];
      }

      await saveFn.call(
        this.client.repositories.huntRepository,
        ctx.interaction.user.id,
        value,
        cooldown.toString(),
        rollsToUse || 0,
      );
      return value;
    };

    // eslint-disable-next-line no-shadow
    enum huntEnum {
      DEMON = 'caçados',
      ANGEL = 'anjos',
      DEMIGOD = 'semideuses',
      GOD = 'deuses',
    }

    switch (selected) {
      case 'demônio': {
        const demons = await areYouTheHuntOrTheHunter(probabilidadeDemonio, huntDemon);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.interaction.user.id,
          huntEnum.DEMON,
        );
        embed
          .setTitle(ctx.locale('commands:hunt.demons'))
          .setColor(COLORS.HuntDemon as ColorResolvable)
          .setDescription(
            ctx.locale('commands:hunt.description_start', {
              value: demons,
              hunt: ctx.locale('commands:hunt.demons'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        break;
      }
      case 'anjos': {
        const angels = await areYouTheHuntOrTheHunter(probabilidadeAnjo, huntAngel);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.interaction.user.id,
          huntEnum.ANGEL,
        );
        embed
          .setTitle(ctx.locale('commands:hunt.angels'))
          .setColor(COLORS.HuntAngel as ColorResolvable)
          .setDescription(
            ctx.locale('commands:hunt.description_start', {
              value: angels,
              hunt: ctx.locale('commands:hunt.angels'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        break;
      }
      case 'semideuses': {
        const demigods = await areYouTheHuntOrTheHunter(probabilidadeSD, huntDemigod);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.interaction.user.id,
          huntEnum.DEMIGOD,
        );
        embed
          .setTitle(ctx.locale('commands:hunt.sd'))
          .setColor(COLORS.HuntSD as ColorResolvable)
          .setDescription(
            ctx.locale('commands:hunt.description_start', {
              value: demigods,
              hunt: ctx.locale('commands:hunt.sd'),
              rank: rank + 1,
              count: toRun,
            }),
          );
        break;
      }
      case 'deus': {
        const gods = await areYouTheHuntOrTheHunter(probabilidadeDeuses, huntGod);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.interaction.user.id,
          huntEnum.GOD,
        );
        embed
          .setColor(COLORS.HuntGod as ColorResolvable)
          .setTitle(ctx.locale('commands:hunt.gods'))
          .setDescription(
            gods > 0
              ? ctx.locale('commands:hunt.god_hunted_success', {
                  count: gods,
                  hunt: ctx.locale('commands:hunt.gods'),
                  rank: rank + 1,
                  toRun,
                })
              : ctx.locale('commands:hunt.god_hunted_fail', { rank: rank + 1, count: toRun }),
          );
        if (gods > 0)
          embed
            .setColor(COLORS.HuntGod as ColorResolvable)
            .setThumbnail('https://i.imgur.com/053khaH.gif');
        break;
      }
    }
    await ctx.reply({ embeds: [embed] });
  }
}
