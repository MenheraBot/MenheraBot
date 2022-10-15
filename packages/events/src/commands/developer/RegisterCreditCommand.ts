import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import userRepository from '../../database/repositories/userRepository';
import badgeRepository from '../../database/repositories/badgeRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import themeCreditsRepository from '../../database/repositories/themeCreditsRepository';
import { createCommand } from '../../structures/command/createCommand';
import { bot } from '../../index';
import { debugError } from '../../utils/debugError';

const RegisterCreditCommand = createCommand({
  path: '',
  name: 'registercredit',
  description: '[DEV] Registra um crédito de algum tema',
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'owner',
      description: 'Dono do tema',
      required: true,
    },
    {
      name: 'theme',
      description: 'Id do tema',
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
    },
    {
      name: 'type',
      description: 'Tipo do tema',
      type: ApplicationCommandOptionTypes.String,
      choices: [
        { name: 'card_background', value: 'addCardBackgroundTheme' },
        { name: 'cards', value: 'addCardsTheme' },
        { name: 'profile', value: 'addProfileTheme' },
        { name: 'table', value: 'addTableTheme' },
      ],
      required: true,
    },
    {
      name: 'royalty',
      description: 'Porcentagem de participação do usuário sob este tema',
      type: ApplicationCommandOptionTypes.Integer,
      required: false,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('owner', 'users', true);
    const themeId = ctx.getOption<number>('theme', false, true);
    const royalty = ctx.getOption<number>('royalty', false) ?? 7;
    const themeType = ctx.getOption<string>('type', false, true) as
      | 'addCardBackgroundTheme'
      | 'addCardsTheme'
      | 'addProfileTheme'
      | 'addTableTheme';

    const alreadyExists = await themeCreditsRepository.findThemeInfo(themeId);

    if (alreadyExists) return ctx.makeMessage({ content: 'Já existe um tema com esse ID!' });

    await themeCreditsRepository.registerTheme(themeId, user.id, royalty);
    await userThemesRepository[themeType](user.id, themeId);

    ctx.makeMessage({
      content: `Tema \`${themeId}\` registrado com sucesso! Dono: <@${user.id}> (${user.id})\nEle já recebeu o tema, basta dar a recompensa em estrelinhas`,
    });

    const userDM = await bot.helpers.getDmChannel(user.id).catch(debugError);

    if (userDM)
      bot.helpers.sendMessage(userDM.id, {
        content: `:sparkles: **OBRIGADA POR CRIAR UM TEMA! **:sparkles:\n\nSeu tema \`${ctx.locale(
          `data:themes.${themeId as 1}.name`,
        )}\` foi registrado pela minha dona.\nEle já está em seu perfil (até por que tu que fez, é teu por direito >.<). Divulge bastante teu tema, que tu ganha uma parte em estrelinhas pelas compras de seu tema!`,
      });

    const userBadges = await userRepository.ensureFindUser(user.id);

    if (userBadges.badges.some((a) => a.id === 15)) return;
    await badgeRepository.giveBadgeToUser(user.id, 15);
  },
});

export default RegisterCreditCommand;
