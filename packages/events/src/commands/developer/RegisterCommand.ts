import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { bot } from '../..';
import badgeRepository from '../../database/repositories/badgeRepository';
import profileImagesRepository from '../../database/repositories/profileImagesRepository';
import themeCreditsRepository from '../../database/repositories/themeCreditsRepository';
import userRepository from '../../database/repositories/userRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createCommand } from '../../structures/command/createCommand';

const registerCredit = async (ctx: ChatInputInteractionContext) => {
  const user = ctx.getOption<User>('owner', 'users', true);
  const themeId = ctx.getOption<number>('theme', false, true);
  const royalty = ctx.getOption<number>('royalty', false) ?? 7;
  const themeType = ctx.getOption<string>('type', false, true) as 'addCardBackgroundTheme';

  const alreadyExists = await themeCreditsRepository.getThemeInfo(themeId);

  if (alreadyExists) return ctx.makeMessage({ content: 'Já existe um tema com esse ID!' });

  await themeCreditsRepository.registerTheme(themeId, user.id, royalty);
  await userThemesRepository[themeType](user.id, themeId);

  ctx.makeMessage({
    content: `Tema \`${themeId}\` registrado com sucesso! Dono: <@${user.id}> (${user.id})\nEle já recebeu o tema, basta dar a recompensa em estrelinhas`,
  });

  const userDM = await bot.helpers.getDmChannel(user.id).catch(ctx.captureException.bind(ctx));

  if (userDM)
    bot.helpers.sendMessage(userDM.id, {
      content: `:sparkles: **OBRIGADA POR CRIAR UM TEMA! **:sparkles:\n\nSeu tema \`${ctx.locale(
        `data:themes.${themeId as 1}.name`,
      )}\` foi registrado pela minha dona.\nEle já está em seu perfil (até por que tu que fez, é teu por direito >.<). Divulge bastante teu tema, que tu ganha uma parte em estrelinhas pelas compras de seu tema!`,
    });

  const userBadges = await userRepository.ensureFindUser(user.id);

  if (userBadges.badges.some((a) => a.id === 15)) return;
  await badgeRepository.giveBadgeToUser(user.id, 15);
};

const RegisterCommand = createCommand({
  path: '',
  name: 'register',
  description: '[DEV] Registra algo UwU',
  options: [
    {
      type: ApplicationCommandOptionTypes.SubCommand,
      name: 'credits',
      description: 'Registra creditos e royalties de um tema',
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
            { name: 'eb_background', value: 'addEbBackgroundTheme' },
            { name: 'eb_text_box', value: 'addEbTextBoxTheme' },
            { name: 'eb_menhera', value: 'addEbMenheraTheme' },
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
    },
    {
      name: 'imagem',
      description: 'Registra uma imagem de perfil',
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'id',
          description: 'ID da imagem',
          type: ApplicationCommandOptionTypes.Integer,
          required: true,
        },
        {
          name: 'uploader',
          description: 'ID do usuário que uplodeou a imagem',
          type: ApplicationCommandOptionTypes.User,
          required: true,
        },
        {
          name: 'publico',
          description: 'Se essa imagem é comprável na loja',
          type: ApplicationCommandOptionTypes.Boolean,
          required: true,
        },
        {
          name: 'nome',
          description: 'Nome dessa imagem',
          type: ApplicationCommandOptionTypes.String,
          required: true,
        },
        {
          name: 'preço',
          description: 'Quando que essa bomba custa',
          type: ApplicationCommandOptionTypes.Integer,
          required: false,
        },
      ],
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const subCommand = ctx.getSubCommand();

    if (subCommand === 'credits') return registerCredit(ctx);

    const uploader = ctx.getOption<User>('uploader', 'users', true);
    const imageId = ctx.getOption<number>('id', false, true);
    const isPublic = ctx.getOption<boolean>('publico', false, true);
    const name = ctx.getOption<string>('nome', false, true);
    const price = ctx.getOption<number>('preço', false) ?? 0;

    const alreadyExists = await profileImagesRepository.getImageInfo(imageId);

    if (alreadyExists) return ctx.makeMessage({ content: 'Já existe uma imagem com esse ID!' });

    await profileImagesRepository.registerImage(imageId, uploader.id, price, name, isPublic);
    await userThemesRepository.addProfileImage(uploader.id, imageId);

    ctx.makeMessage({
      content: `Imagem \`${imageId}\` registrado com sucesso! Dono: <@${uploader.id}> (${uploader.id})`,
    });

    const userDM = await bot.helpers
      .getDmChannel(uploader.id)
      .catch(ctx.captureException.bind(ctx));

    if (userDM)
      bot.helpers
        .sendMessage(userDM.id, {
          content: `:sparkles: **OBRIGADA POR ENVIAR UMA IMAGEM! **:sparkles:\n\nSua imagem \`${name}\` foi registrada pela minha dona.\nEla já está em seu perfil (até por que tu que enviou, é teu por direito >.<)`,
        })
        .catch(ctx.captureException.bind(ctx));
  },
});

export default RegisterCommand;
