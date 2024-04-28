import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { Plants } from '../fazendinha/constants';
import { huntValues } from './constants';

const sellInfo = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  finishCommand();
  const type = ctx.getOption('tipo', false, true);

  if (type === 'hunts') {
    const dataVender = {
      title: ctx.locale('commands:loja.embed_title'),
      color: 0xe77fa1,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      fields: [
        {
          name: ctx.locale('commands:loja.dataVender.main.fields.name'),
          value: ctx.locale('commands:loja.dataVender.main.fields.value', {
            demon: huntValues.demons,
            giant: huntValues.giants,
            angel: huntValues.angels,
            archangel: huntValues.archangels,
            demi: huntValues.demigods,
            god: huntValues.gods,
          }),
          inline: false,
        },
      ],
    };
    ctx.makeMessage({ embeds: [dataVender] });
    return;
  }

  if (type === 'plants') {
    const dataVender = {
      title: ctx.locale('commands:loja.embed_title'),
      color: 0xe77fa1,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      fields: Object.entries(Plants).map((c) => {
        return {
          name: `${Plants[c[0] as '1'].emoji} ${ctx.locale(`data:plants.${c[0] as '1'}`)}`,
          value: `${c[1].sellValue} :star: Kg`,
          inline: true,
        };
      }),
    };

    ctx.makeMessage({ embeds: [dataVender] });
  }
};

export { sellInfo };
