/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../../utils/discord/componentUtils';
import { createEmbed } from '../../../utils/discord/embedUtils';
import { millisToSeconds } from '../../../utils/miscUtils';
import { getStatusDisplayFields } from '../statusDisplay';
import { Ability, InBattleUser, PlayerVsEnviroment } from '../types';
import { getUserAvatar } from '../../../utils/discord/userUtils';
import cacheRepository from '../../../database/repositories/cacheRepository';
import { GenericContext } from '../../../types/menhera';
import { SECONDS_TO_CHOICE_ACTION_IN_BATTLE } from '../constants';
import { getAbility } from '../data/abilities';

interface Choice {
  id: number;
  name: string;
  energyCost: number;
  effects: Ability['effects'];
}

const getAvailableChoices = (_ctx: GenericContext, user: InBattleUser): Choice[] => [
  {
    id: 0,
    name: getAbility(0).$devName,
    energyCost: getAbility(0).energyCost,
    effects: [{ applyTo: 'enemy', type: 'damage', value: user.damage }],
  },
  ...user.abilitites.map((ab) => {
    const ability = getAbility(ab.id);

    return {
      id: ab.id,
      name: ability.$devName,
      energyCost: ability.energyCost,
      effects: ability.effects,
    };
  }),
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
      value: `Efeitos: ${JSON.stringify(a.effects)}\nCusto de Energia: ${a.energyCost}`,
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
