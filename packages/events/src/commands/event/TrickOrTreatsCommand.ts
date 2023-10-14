import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { EMOJIS } from '../../structures/constants';
import { getDisplayName } from '../../utils/discord/userUtils';
import { calculateProbability } from '../../modules/hunt/huntUtils';
import { logger } from '../../utils/logger';
import eventRepository from '../../database/repositories/eventRepository';
import { millisToSeconds, randomFromArray } from '../../utils/miscUtils';
import { defaultHuntCooldown } from '../../modules/hunt/defaultValues';

const candiesProbability: { amount: number; probability: number }[] = [
  { amount: 1, probability: 37 },
  { amount: 2, probability: 24 },
  { amount: 4, probability: 15 },
  { amount: 3, probability: 12 },
  { amount: 5, probability: 11 },
  { amount: 6, probability: 1 },
];

export enum Tricks {
  CHANGE_COLOR,
}

const tricks: { id: Tricks; text: string }[] = [
  {
    id: Tricks.CHANGE_COLOR,
    text: 'Os vizinhos acharam que sua fantasia está ruim, portanto **alteraram a sua cor** para ficar mais assustadora!',
  },
];

const explainEvent = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const embed = createEmbed({
    title: `${EMOJIS.badge_12} | Gostosuras ou Travessuras?`,
    color: hexStringToNumber(ctx.authorData.selectedColor),
    description: `Bem vindo ao **Evento de Halloween 2023,** ${getDisplayName(
      ctx.author,
    )}.\n\nNeste evento, você pode sair para caçar gostosuras ou travessuras pela vizinhança. Você possui uma chance de 50/50 de receber **gostosuras** ou **travessuras**.`,
    fields: [
      {
        name: '🍭 Gostosuras',
        value: `Caso você consiga **gostosuras**, você terá a chance de ganhar doces. Você pode trocar doces por itens na loja desse evento\n\n**Chances de Doces:**\n${candiesProbability
          .map((c) => `- **${c.amount}** - ${c.probability}%`)
          .join('\n')}`,
      },
      {
        name: '<:MenheraDevil:768621225420652595> Travessuras',
        value:
          'Caso a vizinhança decida te dar uma **travessura**, você sofrerá com uma traquinagem maligna <:MenheraThink:767210250779754536>\nExistem diversos tipos de pequenas travessuras que a vizinhança pode fazer com sua conta, portanto apenas usando você descubrirá tudo. Boa sorte >.<',
      },
    ],
    image: { url: 'https://cdn.menherabot.xyz/images/event/halloween.png' },
    footer: {
      text: 'O evento acabará dia 01/11/2023 00:00, portanto, gaste os seus doces até lá.',
    },
  });

  ctx.makeMessage({ embeds: [embed] });
};

const eventShop = async (ctx: ChatInputInteractionContext): Promise<void> => {
  logger.debug(ctx.author.id);
};

const TrickOrTreatCommand = createCommand({
  path: '',
  name: 'gostosuras',
  description: '「🎯」・Sai para uma caçada com Xandão',
  options: [
    {
      name: 'ou',
      nameLocalizations: { 'en-US': 'type' },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      description: 'Tipo da Caça',
      options: [
        {
          type: ApplicationCommandOptionTypes.SubCommand,
          name: 'travessuras',
          description: '「🍬」・Peça por gostosuras ou travessuras nas casas da vizinhança',
          options: [
            {
              name: 'ação',
              type: ApplicationCommandOptionTypes.String,
              description:
                'Você gostaria de pedir doces, ou saber o que a vizinhança tem a oferecer?',
              required: true,
              choices: [
                { name: 'Sair para pedir gostosuras ou travessuras', value: 'hunt' },
                { name: 'Ir para a loja de doces', value: 'shop' },
                { name: 'O que a vizinhança tem a oferecer?', value: 'ask' },
              ],
            },
          ],
        },
      ],
    },
  ],
  category: 'event',
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    if (ctx.author.id !== 435228312214962204n)
      return ctx.makeMessage({
        content: 'Sai daqui!!! Isso ainda não está pronto',
        flags: MessageFlags.EPHEMERAL,
      });

    const action = ctx.getOption<'hunt' | 'ask' | 'shop'>('ação', false, true);

    if (action === 'ask') return explainEvent(ctx);

    if (action === 'shop') return eventShop(ctx);

    const eventUser = await eventRepository.getEventUser(ctx.author.id);

    const canHunt = eventUser.cooldown < Date.now();

    if (!canHunt)
      return ctx.makeMessage({
        content: `Tu caminhou demais para buscar doces. Fique descansando um pouco mais...\nTu poderá pegar mais doces <t:${millisToSeconds(
          eventUser.cooldown,
        )}:R>.`,
        flags: MessageFlags.EPHEMERAL,
      });

    const getCandy = Math.random() > 0.5;

    if (getCandy) {
      const candies = calculateProbability(candiesProbability);

      const embed = createEmbed({
        title: '🍭 Gostosuras',
        color: hexStringToNumber(ctx.authorData.selectedColor),
        description: `A vizinhança gostou de sua fantasia, e te deu **${candies}** doce${
          candies > 1 ? 's' : ''
        }. Você volta para casa para descansar um pouco.`,
        thumbnail: {
          url: 'https://cdn.discordapp.com/avatars/708014856711962654/7566028cf51a0abc7b84e4b103c56894.png?size=2048',
        },
      });

      await eventRepository.updateUser(ctx.author.id, {
        candies: eventUser.candies + candies,
        cooldown: Date.now() + defaultHuntCooldown,
      });

      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const selectedTrick = randomFromArray(tricks);

    if (!eventUser.allTimeTricks.includes(selectedTrick.id))
      eventUser.allTimeTricks.push(selectedTrick.id);

    await eventRepository.updateUser(ctx.author.id, {
      cooldown: Date.now() + defaultHuntCooldown,
      allTimeTricks: eventUser.allTimeTricks,
      currentTrick: {
        endsIn: Date.now() + defaultHuntCooldown,
        id: selectedTrick.id,
      },
    });

    const embed = createEmbed({
      title: '<:MenheraDevil:768621225420652595> Travessuras',
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: selectedTrick.text,
      thumbnail: {
        url: 'https://cdn.menherabot.xyz/images/event/trick.png',
      },
    });

    ctx.makeMessage({ embeds: [embed] });
  },
});

export default TrickOrTreatCommand;
