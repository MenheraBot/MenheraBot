import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { COLORS } from '../../structures/constants';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getAssetLink } from '../../structures/cdnManager';
import { createCommand } from '../../structures/command/createCommand';
import InteractionContext from '../../structures/command/InteractionContext';

const ExecuteFodase = async (ctx: InteractionContext, finishCommand: () => void): Promise<void> => {
  const randomPhrase = `${Math.floor(Math.random() * 3)}`;

  const phrase = ctx.locale(`commands:fodase.${randomPhrase as '1'}`, {
    author: ctx.author.username,
  });

  const selectedImage = getAssetLink(`fodase`);

  const embed = createEmbed({
    image: { url: selectedImage },
    footer: { text: ctx.locale('commands:fodase.author', { author: ctx.author.username }) },
    title: phrase,
    color: COLORS.Colorless,
  });

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const ExecuteHumor = async (ctx: InteractionContext, finishCommand: () => void): Promise<void> => {
  const selectedImage = getAssetLink('humor');

  const embed = createEmbed({ image: { url: selectedImage }, color: COLORS.Random() });

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const MemeCommand = createCommand({
  path: '',
  name: 'meme',
  description: '「🤣」・Atumalaca KKKK. Apenas os melhores memes',
  descriptionLocalizations: { 'en-US': '「🤣」・Atumalaca LOL. Only the best memes' },
  options: [
    {
      name: 'fds',
      nameLocalizations: { 'en-US': 'idc' },
      description: '「🤫」・Lançe o Bruno Henrique no chat',
      descriptionLocalizations: { 'en-US': "「🤫」・Show that you don't care" },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'humor',
      description: '「🤣」・KK Tumor e Piadas',
      descriptionLocalizations: { 'en-US': '「🤣」・LOL Humor and Jokes' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    if (command === 'fds') return ExecuteFodase(ctx, finishCommand);
    if (command === 'humor') return ExecuteHumor(ctx, finishCommand);
  },
});

export default MemeCommand;
