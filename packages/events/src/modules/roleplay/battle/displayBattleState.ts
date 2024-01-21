/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../../utils/discord/componentUtils';
import { createEmbed } from '../../../utils/discord/embedUtils';
import { millisToSeconds } from '../../../utils/miscUtils';
import { getStatusDisplayFields } from '../statusDisplay';
import { InBattleUser, PlayerVsEnviroment } from '../types';
import { getUserAvatar } from '../../../utils/discord/userUtils';
import cacheRepository from '../../../database/repositories/cacheRepository';
import { GenericContext } from '../../../types/menhera';
import { SECONDS_TO_CHOICE_ACTION_IN_BATTLE } from '../constants';
import { Abilities } from '../data/abilities';

interface Choice {
  id: number;
  name: string;
  damage: number;
  energyCost: number;
}

const getAvailableChoices = (_ctx: GenericContext, user: InBattleUser): Choice[] => [
  { damage: user.damage, energyCost: 1, id: 0, name: 'Ataque Básico' },
  ...user.abilitites.map((ab) => ({ ...ab, name: Abilities[ab.id].$devName })),
];

const displayBattleControlMessage = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  const statusEmbed = createEmbed({
    title: 'Estatísticas da Batalha',
    description: `Mate o seu inimigo!`,
    thumbnail: {
      url: getUserAvatar((await cacheRepository.getDiscordUser(adventure.user.id, true))!, {
        enableGif: true,
      }),
    },
    fields: getStatusDisplayFields(adventure.user, adventure.enemy),
  });

  const choices = getAvailableChoices(ctx, adventure.user);

  const choicesEmbed = createEmbed({
    title: 'Ações Disponíveis',
    description: `Se tu não tomar nenhuma ação <t:${millisToSeconds(
      Date.now() + SECONDS_TO_CHOICE_ACTION_IN_BATTLE * 1000,
    )}:R>, o inimigo te atacará!`,
    fields: choices.map((a) => ({
      name: a.name,
      value: `Dano: ${a.damage}\nCusto de Energia: ${a.energyCost}`,
      inline: true,
    })),
  });

  ctx.makeMessage({
    embeds: [statusEmbed, choicesEmbed],
    content: '',
    components: [
      createActionRow([
        createSelectMenu({
          customId: createCustomId(0, adventure.user.id, ctx.commandId, 'USE_SKILL', adventure.id),
          options: choices.map((a) => ({ label: a.name, value: `${a.id}` })),
        }),
      ]),
    ],
  });
};

export { displayBattleControlMessage };
