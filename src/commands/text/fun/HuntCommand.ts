import { ColorResolvable, MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '@structures/command/Command';
import { COLORS, probabilities } from '@structures/MenheraConstants';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class HuntCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'hunt',
      aliases: ['cacar', 'caça', 'caca', 'caçar'],
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;
    if (!ctx.message.guild) return;

    const validArgs = [
      {
        option: 'demônio',
        arguments: ['demonios', 'demônios', 'demons', 'demonio', 'demônio', 'demon'],
      },
      {
        option: 'anjos',
        arguments: ['anjos', 'anjo', 'angels', 'angel'],
      },
      {
        option: 'semideuses',
        arguments: [
          'semideuses',
          'semideus',
          'semi-deuses',
          'sd',
          'semi-deus',
          'demigods',
          'dg',
          'demigod',
        ],
      },
      {
        option: 'deus',
        arguments: ['deus', 'deuses', 'gods', 'god'],
      },
      {
        option: 'ajuda',
        arguments: ['ajudas', 'help', 'h', 'ajuda'],
      },
      {
        option: 'probabilidades',
        arguments: ['probabilidades', 'probabilidade', 'probability', 'probabilities'],
      },
    ];

    if (!ctx.args[0]) {
      await ctx.reply('error', `${ctx.locale('commands:hunt.no-args')}`);
      return;
    }
    const filtredOption = validArgs.filter((so) =>
      so.arguments.includes(ctx.args[0].toLowerCase()),
    );
    if (filtredOption.length === 0) {
      await ctx.reply('error', `${ctx.locale('commands:hunt.no-args')}`);
      return;
    }

    const { option } = filtredOption[0];

    const probabilidadeDemonio =
      ctx.message.guild.id === '717061688460967988'
        ? probabilities.support.demon
        : probabilities.normal.demon;
    const probabilidadeAnjo =
      ctx.message.guild.id === '717061688460967988'
        ? probabilities.support.angel
        : probabilities.normal.angel;
    const probabilidadeSD =
      ctx.message.guild.id === '717061688460967988'
        ? probabilities.support.demigod
        : probabilities.normal.demigod;
    const probabilidadeDeuses =
      ctx.message.guild.id === '717061688460967988'
        ? probabilities.support.god
        : probabilities.normal.god;

    if (option === 'ajuda') {
      await ctx.replyT('question', 'commands:hunt.help');
      return;
    }
    if (option === 'probabilidades') {
      await ctx.send(
        ctx.locale('commands:hunt.probabilities', {
          demon: probabilidadeDemonio,
          angel: probabilidadeAnjo,
          demi: probabilidadeSD,
          god: probabilidadeDeuses,
        }),
      );
      return;
    }

    if (parseInt(authorData.caçarTime) > Date.now()) {
      await ctx.replyT('error', 'commands:hunt.cooldown', {
        time: moment.utc(parseInt(authorData.caçarTime) - Date.now()).format('mm:ss'),
      });
      return;
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });
    const cooldown = probabilities.defaultTime + Date.now();
    const embed = new MessageEmbed()
      .setColor(COLORS.HuntDefault as ColorResolvable)
      .setThumbnail(avatar);
    if (ctx.message.channel.id === '717061688460967988')
      embed.setFooter(ctx.locale('commands:hunt.footer'));

    const { huntDemon, huntAngel, huntDemigod, huntGod } = this.client.repositories.huntRepository;

    const areYouTheHuntOrTheHunter = async (
      probability: Array<number>,
      saveFn: typeof huntDemon,
    ) => {
      const value = probability[Math.floor(Math.random() * probability.length)];
      await saveFn.call(
        this.client.repositories.huntRepository,
        ctx.message.author.id,
        value,
        cooldown.toString(),
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

    switch (option) {
      case 'demônio': {
        const demons = await areYouTheHuntOrTheHunter(probabilidadeDemonio, huntDemon);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.message.author.id,
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
            }),
          );
        break;
      }
      case 'anjos': {
        const angels = await areYouTheHuntOrTheHunter(probabilidadeAnjo, huntAngel);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.message.author.id,
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
            }),
          );
        break;
      }
      case 'semideuses': {
        const demigods = await areYouTheHuntOrTheHunter(probabilidadeSD, huntDemigod);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.message.author.id,
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
            }),
          );
        break;
      }
      case 'deus': {
        const gods = await areYouTheHuntOrTheHunter(probabilidadeDeuses, huntGod);
        const { rank } = await this.client.repositories.topRepository.getUserHuntRank(
          ctx.message.author.id,
          huntEnum.GOD,
        );
        embed
          .setColor(COLORS.HuntGod as ColorResolvable)
          .setTitle(ctx.locale('commands:hunt.gods'))
          .setDescription(
            gods > 0
              ? ctx.locale('commands:hunt.god_hunted_success', {
                  value: gods,
                  hunt: ctx.locale('commands:hunt.gods'),
                  rank: rank + 1,
                })
              : ctx.locale('commands:hunt.god_hunted_fail', { rank: rank + 1 }),
          );
        if (gods > 0)
          embed
            .setColor(COLORS.HuntGod as ColorResolvable)
            .setThumbnail('https://i.imgur.com/053khaH.gif');
        break;
      }
    }
    await ctx.send(embed);
  }
}
