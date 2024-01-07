import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../../utils/discord/componentUtils';
import { createEmbed } from '../../../utils/discord/embedUtils';
import { millisToSeconds } from '../../../utils/miscUtils';
import { getStatusDisplayFields } from '../statusDisplay';
import { PlayerVsEnviroment } from '../types';
import { getUserAvatar } from '../../../utils/discord/userUtils';

const displayBattleControlMessage = (
  ctx: ComponentInteractionContext,
  adventure: PlayerVsEnviroment,
): void => {
  const statusEmbed = createEmbed({
    title: 'Estatísticas da Batalha',
    description: `Mate e ganha X itens`,
    thumbnail: { url: getUserAvatar(ctx.user, { enableGif: true }) },
    fields: getStatusDisplayFields(adventure.user, adventure.enemy),
  });

  const choicesEmbed = createEmbed({
    title: 'Ações Disponíveis',
    description: `Se tu não tomar nenhuma ação <t:${millisToSeconds(
      Date.now() + 1000 * 10,
    )}:R>, o inimigo te atacará!`,
    fields: [
      { name: 'Ataque Básico', value: `Dano: ${adventure.user.damage}\nCusto de Energia: 1` },
    ],
  });

  ctx.makeMessage({
    embeds: [statusEmbed, choicesEmbed],
    content: '',
    components: [
      createActionRow([
        createSelectMenu({
          customId: createCustomId(0, ctx.user.id, ctx.commandId, 'USE_SKILL', adventure.id),
          options: [{ label: 'Ataque Básico', value: '0' }],
        }),
      ]),
    ],
  });
};

export { displayBattleControlMessage };
