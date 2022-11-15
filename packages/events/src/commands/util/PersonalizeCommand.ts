import { ApplicationCommandOptionTypes } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';
import InteractionContext from '../../structures/command/InteractionContext';
import { toWritableUtf } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';

const executeAboutMeCommand = async (ctx: InteractionContext, finishCommand: () => void) => {
  const info = ctx.getOption<string>('frase', false, true);

  await userRepository.updateUser(ctx.author.id, { info: toWritableUtf(info) });

  ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:sobremim.success') });
  finishCommand();
};

const PersonalizeCommand = createCommand({
  path: '',
  name: 'personalizar',
  nameLocalizations: { 'en-US': 'personalize' },
  description: '「🎨」・Personalize o seu perfil para ficar a coisa mais linda do mundo!',
  descriptionLocalizations: {
    'en-US': '「🎨」・Customize your profile to be the most beautiful thing in the world!',
  },
  options: [
    {
      name: 'sobre_mim',
      nameLocalizations: { 'en-US': 'about_me' },
      description: '「💬」・Mude o seu "sobre mim" (A mensagem que aparece em seu perfil)',
      descriptionLocalizations: {
        'en-US': '「💬」・Change your "about me" (The message that appears on your profile)',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: 'frase',
          nameLocalizations: { 'en-US': 'phrase' },
          description: 'Frase para colocar em seu sobre mim. No máximo 200 caracteres',
          descriptionLocalizations: {
            'en-US': 'Phrase to put in your about me. Maximum 200 characters',
          },
          maxLength: 200,
          required: true,
        },
      ],
    },
    {
      name: 'cor',
      nameLocalizations: { 'en-US': 'color' },
      description: '「🌈」・Muda a cor base da sua conta',
      descriptionLocalizations: { 'en-US': '「🌈」・Change your account base color' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'temas',
      nameLocalizations: { 'en-US': 'themes' },
      description: '「🎊」・Personalize os temas da sua conta!',
      descriptionLocalizations: { 'en-US': '「🎊」・Customize your account themes!' },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'tipo',
          nameLocalizations: { 'en-US': 'type' },
          description: 'O tipo de tema que você quer alterar',
          descriptionLocalizations: { 'en-US': 'The type of theme you want to change' },
          type: ApplicationCommandOptionTypes.String,
          required: true,
          choices: [
            {
              name: '✨ | Perfil',
              nameLocalizations: { 'en-US': '✨ | Profile' },
              value: 'profile',
            },
            {
              name: '🃏 | Estilo de Carta',
              nameLocalizations: { 'en-US': '🃏 | Card Style' },
              value: 'cards',
            },
            {
              name: '🖼️ | Mesa de Cartas',
              nameLocalizations: { 'en-US': '🖼️ | Table Cards' },
              value: 'table',
            },
            {
              name: '🎴 | Fundo de Carta',
              nameLocalizations: { 'en-US': '🎴 | Card Background' },
              value: 'card_background',
            },
          ],
        },
      ],
    },
    {
      name: 'badges',
      description: '「📌」・Escolha quais badges devem aparecer em seu perfil',
      descriptionLocalizations: {
        'en-US': '「📌」・Choose which badges should appear on your profile',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  category: 'util',
  authorDataFields: [
    'selectedColor',
    'colors',
    'info',
    'badges',
    'hiddingBadges',
    'voteCooldown',
    'married',
  ],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    if (command === 'sobre_mim') return executeAboutMeCommand(ctx, finishCommand);
  },
});

export default PersonalizeCommand;
