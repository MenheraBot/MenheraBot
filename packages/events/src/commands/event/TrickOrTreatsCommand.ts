import { ApplicationCommandOptionTypes, BigString, TextStyles } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { EMOJIS } from '../../structures/constants';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { calculateProbability } from '../../modules/hunt/huntUtils';
import eventRepository from '../../database/repositories/eventRepository';
import { millisToSeconds, randomFromArray } from '../../utils/miscUtils';
import cacheRepository from '../../database/repositories/cacheRepository';
import { halloweenEventModel } from '../../database/collections';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import { extractFields } from '../../utils/discord/modalUtils';

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
  ENGLISH_COMMANDS,
  OTHER_MARRY,
  OTHER_INFO,
  OUT_OF_TOP,
  NO_BADGES,
  BANNED_ON_PROFILE,
  NEGATIVE_RESPONSES,
  RANDOM_TRISAL,
  USER_CANT_MAMAR,
  USER_CANT_BE_MAMADO,
  USER_CANT_HUNT,
  ANGRY_EMOJI,
  TEXT_MIRROR,
}

export const cooldownTime = 1_800_000;

const tricks: { id: Tricks; text: string; name: string }[] = [
  {
    id: Tricks.CHANGE_COLOR,
    name: 'Mudança de cor',
    text: 'Os vizinhos acharam que sua fantasia está ruim, portanto **alteraram a sua cor** para ficar mais assustadora!',
  },
  {
    id: Tricks.ENGLISH_COMMANDS,
    name: 'Comandos em inglês',
    text: 'Os vizinhos querem pregar uma peça contigo. Como eles são bilíngues, todos seus comandos estarão em inglês.',
  },
  {
    id: Tricks.OTHER_MARRY,
    name: 'Casamento forçado',
    text: 'Na intenção de brincar com você e seu cônjuge, seus vizinhos estão fofocando que você está casado com outra pessoa.... Você está casado com uma pessoa aleatória agora.',
  },
  {
    id: Tricks.OTHER_INFO,
    name: 'Sobre mim diferente',
    text: 'Seus vizinhos estão falando de você pelas costas... O seu "sobre mim" foi alterado!',
  },
  {
    id: Tricks.OUT_OF_TOP,
    name: 'Fora do /top',
    text: 'Os seus vizinhos estão te ignorando. Você não aparecerá em nenhum /top.',
  },
  {
    id: Tricks.NO_BADGES,
    name: 'Nenhuma badge',
    text: 'Seus vizinhos estão falando que você nunca recebeu nenhum prêmio. Você não possui mais badges no /perfil.',
  },
  {
    id: Tricks.BANNED_ON_PROFILE,
    name: 'Banido do /perfil',
    text: 'Seus vizinhos não querem mais interagir com você. Para outros usuários, o seu /perfil aparecerá como se você estivesse banido.',
  },
  {
    id: Tricks.NEGATIVE_RESPONSES,
    name: '8ball negativo',
    text: 'Seus vizinhos conversaram com a Menhera, e ela se comprometeu a ajudar nessa travessura. Todas as suas respostas do 8ball serão negativas.',
  },
  {
    id: Tricks.RANDOM_TRISAL,
    name: 'Trisal especial',
    text: 'Seus vizinhos estão falando pelas suas costas sobre suas amizades. Você está em um trisal com duas pessoas especiais...',
  },
  {
    id: Tricks.USER_CANT_MAMAR,
    name: 'Proibido mamar',
    text: 'Seus vizinhos te prenderam em uma cadeira na frente de sua casa. Você está impossibilitado de mamar outras pessoas',
  },
  {
    id: Tricks.USER_CANT_BE_MAMADO,
    name: 'Proibido ser mamado',
    text: 'Seus vizinhos colocaram um sinto de castidade em ti. As pessoas estão impossibilitadas de te mamar',
  },
  {
    id: Tricks.USER_CANT_HUNT,
    name: 'Proibido caçar',
    text: 'Os vizinhos lhe enrolaram em papel como uma múmia. Você não pode mais caçar monstros, pois você é agora um deles',
  },
  {
    id: Tricks.ANGRY_EMOJI,
    name: '😡😡😡',
    text: 'Seus vizinhos pintaram sua cara (😡). Um emoji de raiva será inserido em seus comandos',
  },
  {
    id: Tricks.TEXT_MIRROR,
    name: 'Textos invertidos',
    text: 'Seus vizinhos te amarraram na frente de um espelho. Seus comandos terão textos invertidos.',
  },
];

const availableProducts = [
  {
    name: 'Mil estrelinhas',
    value: 1,
    execute: (user: BigString, amount: number) => starsRepository.addStars(user, amount * 1000),
  },
  {
    name: 'Roll de caça',
    value: 14,
    execute: (user: BigString, amount: number) =>
      userRepository.updateUserWithSpecialData(user, { $inc: { rolls: amount } }),
  },
  {
    name: 'Imagem: _Evento Halloween 2023_',
    value: 50,
    execute: (user: BigString) => userThemesRepository.addProfileImage(user, 17),
  },
  {
    name: 'Tema de Fundo de Carta: _Fundo Azul_',
    value: 55,
    execute: (user: BigString) => userThemesRepository.addCardBackgroundTheme(user, 8),
  },
  {
    name: 'Tema de Mesa: _Mesa Vermelha_',
    value: 90,
    execute: (user: BigString) => userThemesRepository.addTableTheme(user, 11),
  },
  {
    // titulos não existem ainda. Eu vou criar isso, e adicionar no perfil.
    // O titulo vai ser algo obrigatório de aparecer nos temas de perfil.
    // Os temas que ja existem eu vou mudar pra adicionar um campinho de título tbm
    // Esse vai ser o primeiro titulo que as pessoas podem pegar, só n vai aparecer ainda
    name: 'Título: _Caçador de doces nato_',
    value: 100,
    execute: (user: BigString) => userRepository.updateUser(user, { titles: [1] }),
  },
  {
    name: 'Tema de Mesa: _Mesa Rosa_',
    value: 100,
    execute: (user: BigString) => userThemesRepository.addTableTheme(user, 12),
  },
  {
    name: 'Tema de Perfil: _Mundo Invertido_',
    value: 150,
    execute: (user: BigString) => userThemesRepository.addProfileTheme(user, 2),
  },
  {
    name: 'Tema de Cartas: _Morte Concreta_',
    value: 300,
    execute: (user: BigString) => use.addCardsTheme(user, 7),
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
          'Caso a vizinhança decida te dar uma **travessura**, você sofrerá com uma traquinagem maligna por uma hora <:MenheraThink:767210250779754536>\nExistem diversos tipos de pequenas travessuras que a vizinhança pode fazer com sua conta, portanto apenas usando você descubrirá tudo. Boa sorte >.<',
      },
    ],
    image: { url: 'https://cdn.menherabot.xyz/images/event/halloween.png' },
    footer: {
      text: 'O evento acabará dia 01/11/2023 00:00, portanto, gaste os seus doces até lá.',
    },
  });

  ctx.makeMessage({ embeds: [embed] });
};

const buyRollAndStar = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
): Promise<void> => {
  const fields = extractFields(ctx.interaction)[0];

  const parsed = parseInt(fields.value, 10);

  if (parsed < 0)
    return ctx.makeMessage({
      content: 'Você informou um número inválido de doces',
      components: [],
      embeds: [],
    });

  if (Number.isNaN(parsed))
    return ctx.makeMessage({
      content: 'Você informou um número inválido de doces',
      components: [],
      embeds: [],
    });

  const eventUser = await eventRepository.getEventUser(ctx.user.id);

  const item = availableProducts[Number(fields.customId)];

  if (eventUser.candies < item.value * parsed)
    return ctx.makeMessage({
      content: 'Você não possui todos esses doces para comprar tudo isso',
      components: [],
      embeds: [],
    });

  await eventRepository.updateUser(ctx.user.id, {
    candies: eventUser.candies - item.value * parsed,
  });
  // @ts-expect-error uwu
  item.execute(ctx.user.id, parsed);

  ctx.makeMessage({
    content: '🎃 **Feliz Halloween!**',
    components: [],
    embeds: [],
  });
};

const buyItem = async (ctx: ComponentInteractionContext<SelectMenuInteraction>): Promise<void> => {
  const [selectedIndex] = ctx.interaction.data.values;

  const eventUser = await eventRepository.getEventUser(ctx.user.id);

  const item = availableProducts[Number(selectedIndex)];

  switch (Number(selectedIndex)) {
    case 0:
    case 1: {
      const input = createTextInput({
        customId: selectedIndex,
        label: 'Selecione quantas vezes você quer comprar',
        style: TextStyles.Short,
        minLength: 1,
        maxLength: 3,
        required: true,
      });

      ctx.respondWithModal({
        customId: createCustomId(1, ctx.user.id, ctx.commandId),
        title: 'Halloween UwU',
        components: [createActionRow([input])],
      });
      return;
    }
    case 2: {
      const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
      if (userThemes.profileImages.some((a) => a.id === 17))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);
      break;
    }
    case 3: {
      const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
      if (userThemes.cardsBackgroundThemes.some((a) => a.id === 8))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);

      break;
    }
    case 4: {
      const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
      if (userThemes.tableThemes.some((a) => a.id === 11))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);

      break;
    }
    case 5: {
      const userThemes = await userRepository.ensureFindUser(ctx.user.id);
      if (userThemes?.titles?.includes?.(0))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);

      break;
    }
    case 6: {
      const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
      if (userThemes.tableThemes.some((a) => a.id === 12))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);

      break;
    }
    case 7: {
      const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
      if (userThemes.profileThemes.some((a) => a.id === 2))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);

      break;
    }
    case 8: {
      const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
      if (userThemes.cardsThemes.some((a) => a.id === 7))
        return ctx.makeMessage({
          content: 'Você já possui esse item!',
          components: [],
          embeds: [],
        });
      if (eventUser.candies < item.value)
        return ctx.makeMessage({
          content: 'Você não possui todos esses doces para comprar isso!',
          components: [],
          embeds: [],
        });

      await eventRepository.updateUser(ctx.user.id, { candies: eventUser.candies - item.value });
      // @ts-expect-error uwu
      await item.execute(ctx.user.id);

      break;
    }
  }

  ctx.makeMessage({
    content: '🎃 **Feliz Halloween!**',
    components: [],
    embeds: [],
  });
};

const eventShop = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const eventUser = await eventRepository.getEventUser(ctx.author.id);

  const embed = createEmbed({
    title: '<:MenheraDevil:768621225420652595> Loja do Evento',
    color: hexStringToNumber(ctx.authorData.selectedColor),
    description: `Bem vindo à loja do **Evento de Halloween 2023** <a:MenheraChibiSnowball:768621226138140732>\nVocê possui atualmente **${eventUser.candies}** 🍭 doces.\nNo total, você já pegou **${eventUser.allTimeTreats}** 🍭 doces`,
    footer: {
      text: 'A compra de itens ainda não está disponível. Os preços podem mudar até o fim do evento',
    },
    fields: [
      {
        name: 'Produtos Disponíveis',
        value: availableProducts.map((a) => `- **${a.name}** (${a.value})`).join('\n'),
      },
    ],
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(0, ctx.author.id, ctx.commandId),
    minValues: 1,
    options: availableProducts.map((a, i) => ({
      label: a.name.replaceAll('_', '"'),
      value: `${i}`,
      description: `${a.value} ⭐`,
    })),
    maxValues: 1,
    placeholder: 'Selecione o que você quer comprar',
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([selectMenu])] });
};

const displayTop = async (ctx: ChatInputInteractionContext): Promise<void> => {
  await ctx.defer();

  const res = await halloweenEventModel.find({ ban: false }, ['allTimeTreats', 'id'], {
    limit: 10,
    sort: { allTimeTreats: -1 },
  });

  const embed = createEmbed({
    title: `🍭 | TOP 10 Doceiros do Evento`,
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [],
  });

  const members = await Promise.all(
    res.map((a) => cacheRepository.getDiscordUser(`${a.id}`, true)),
  );

  for (let i = 0; i < res.length; i++) {
    const member = members[i];
    const memberName = member ? getDisplayName(member) : `ID ${res[i].id}`;

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([`${res[i].id}`]);
    }

    embed.fields?.push({
      name: `**${1 + i} -** ${memberName}`,
      value: `Conseguiui **${res[i].allTimeTreats}** doces`,
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
};

const displayTricks = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const eventUser = await eventRepository.getEventUser(ctx.author.id);

  const embed = createEmbed({
    title: '<:MenheraDevil:768621225420652595> Travessuras disponíveis',
    color: hexStringToNumber(ctx.authorData.selectedColor),
    description: tricks
      .map(
        (trick) =>
          `**${trick.name}**. Adquirido: ${
            eventUser.allTimeTricks.includes(trick.id) ? ':white_check_mark:' : ':x:'
          }`,
      )
      .join('\n'),
  });

  ctx.makeMessage({ embeds: [embed] });
};

const TrickOrTreatCommand = createCommand({
  path: '',
  name: 'gostosuras',
  description: '「🍬」・Peça por gostosuras ou travessuras nas casas da vizinhança',
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
                { name: 'Travessuras disponíveis', value: 'tricks' },
                { name: 'O que a vizinhança tem a oferecer?', value: 'ask' },
                { name: 'Ir para a loja de doces', value: 'shop' },
                { name: 'Ver quem mais tem doces', value: 'top' },
              ],
            },
          ],
        },
      ],
    },
  ],
  category: 'event',
  commandRelatedExecutions: [buyItem, buyRollAndStar],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const action = ctx.getOption<'hunt' | 'ask' | 'shop' | 'top' | 'tricks'>('ação', false, true);

    if (action === 'ask') return explainEvent(ctx);

    if (action === 'shop') return eventShop(ctx);

    if (action === 'top') return displayTop(ctx);

    if (action === 'tricks') return displayTricks(ctx);

    const eventUser = await eventRepository.getEventUser(ctx.author.id);

    const canHunt = eventUser.cooldown < Date.now();

    if (!canHunt)
      return ctx.makeMessage({
        content: `Tu caminhou demais para buscar doces. Fique descansando um pouco mais...\nTu poderá pegar mais doces <t:${millisToSeconds(
          eventUser.cooldown,
        )}:R>.`,
        flags: MessageFlags.EPHEMERAL,
      });

    if (
      eventUser.currentTrick?.id === Tricks.OUT_OF_TOP &&
      Date.now() >= eventUser.currentTrick.endsIn
    )
      await cacheRepository.removeDeletedAccount(`${ctx.author.id}`);

    const getCandy = Math.random() < 0.5;

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
        allTimeTreats: eventUser.allTimeTreats + candies,
        cooldown: Date.now() + cooldownTime,
      });

      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const selectedTrick = randomFromArray(tricks);

    if (!eventUser.allTimeTricks.includes(selectedTrick.id))
      eventUser.allTimeTricks.push(selectedTrick.id);

    await eventRepository.updateUser(ctx.author.id, {
      cooldown: Date.now() + cooldownTime,
      allTimeTricks: eventUser.allTimeTricks,
      currentTrick: {
        endsIn: Date.now() + cooldownTime,
        id: selectedTrick.id,
      },
    });

    await eventRepository.setUserTrick(ctx.author.id, selectedTrick.id);

    if (selectedTrick.id === Tricks.OUT_OF_TOP)
      await cacheRepository.addDeletedAccount([`${ctx.author.id}`]);

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
