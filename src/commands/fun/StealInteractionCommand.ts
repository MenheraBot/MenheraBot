import 'moment-duration-format';
import moment from 'moment';
import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import { HuntingTypes } from '@utils/Types';
// import { getUserStealCooldown } from '@utils/HuntUtils';
import Util from '@utils/Util';

const choices: { name: string; value: HuntingTypes }[] = [
  {
    name: '😈 | Demônios',
    value: 'demons',
  },
  {
    name: '👊 | Gigantes',
    value: 'giants',
  },
  {
    name: '👼 | Anjos',
    value: 'angels',
  },
  {
    name: '🧚‍♂️ | Arcanjos',
    value: 'archangels',
  },
  {
    name: '🙌 | Semideuses',
    value: 'demigods',
  },
  {
    name: '✝️ | Deuses',
    value: 'gods',
  },
];
export default class StealInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'roubar',
      description: '「🏹」・Pega Ladrão! Roube as caças de alguém',
      options: [
        {
          name: 'tipo',
          type: 'STRING',
          description: 'Tipo da caça',
          required: true,
          choices,
        },
        {
          name: 'user',
          description: 'Usuário que você quer roubar',
          type: 'USER',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 7,
      authorDataFields: ['stealCooldown', 'inUseItems', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    //   const huntType = ctx.options.getString('tipo', true) as HuntingTypes;
    const user = ctx.options.getUser('user', true);

    const canSteal = ctx.data.user.stealCooldown < Date.now();

    if (!canSteal) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:roubar.cooldown', {
          time: moment.utc(ctx.data.user.stealCooldown - Date.now()).format('HH:mm:ss'),
        }),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    // const cooldown = getUserStealCooldown(ctx.data.user.inUseItems, huntType) + Date.now();

    const embed = new MessageEmbed()
      .setColor(COLORS.HuntDefault)
      .setThumbnail(avatar)
      .setTitle(ctx.locale(`commands:roubar.title`, { user: user.username }));
    /*
      .setDescription(
        ctx.locale('commands:cacar.hunt_description', {
          value: result.value,
          hunt: ctx.locale(`commands:cacar.${selected}`),
          rank: rankinkg ? rankinkg.rank + 1 : '`??`',
          count: toRun,
        }),
      ); */
    // @ts-expect-error HuntString is actually HuntHUNTYPE
    embed.setColor(COLORS[`Hunt${Util.capitalize(selected)}`]);

    /*   const APIHuntTypes = {
      demons: 'demon',
      giants: 'giant',
      angels: 'angel',
      archangels: 'archangel',
      demigods: 'demigod',
      gods: 'god',
    }; */

    //  HttpRequests.postHuntCommand(ctx.author.id, APIHuntTypes[selected], result);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
