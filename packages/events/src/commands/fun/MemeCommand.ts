import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { COLORS } from '../../structures/constants.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { createCommand } from '../../structures/command/createCommand.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';

const ExecuteFodase = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
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
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    if (command === 'fds') return ExecuteFodase(ctx, finishCommand);
  },
});

export default MemeCommand;
