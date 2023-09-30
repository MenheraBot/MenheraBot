import { ActionRow, AllowedMentionsTypes, ButtonComponent, ButtonStyles } from 'discordeno/types';
import { Embed } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createButton,
  createCustomId,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import pokerRepository from '../../database/repositories/pokerRepository';
import { SelectMenuUsersInteraction } from '../../types/interaction';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags, removeNonNumbers } from '../../utils/discord/messageUtils';

const createStartMatchEmbed = (embedColor: number, alreadyInPlayers: string[]): Embed =>
  createEmbed({
    title: 'Partida de Poker',
    color: embedColor,
    description:
      'Uma partida de poker está se iniciando, os convidados podem entrar na mesa clicando no botão abaixo',
    fields: [
      {
        name: 'Jogadores Participando',
        value: alreadyInPlayers.map(mentionUser).join('\n'),
      },
    ],
  });

const selectPlayers = async (
  ctx: ComponentInteractionContext<SelectMenuUsersInteraction>,
): Promise<void> => {
  const selectedUsers = ctx.interaction.data.resolved.users;
  const selectedUsersIds = ctx.interaction.data.values;

  if (selectedUsers.some((a) => a.toggles.bot))
    return ctx.makeMessage({ content: 'Bots não podem jogar poker!', components: [] });

  if (selectedUsersIds.includes(`${ctx.user.id}`))
    return ctx.makeMessage({
      content: 'Por favor, não escolha a si mesmo para jogar!',
      components: [],
    });

  const isSomeoneBanned = await Promise.all(selectedUsersIds.map(blacklistRepository.isUserBanned));

  if (isSomeoneBanned.includes(true))
    return ctx.makeMessage({
      components: [],
      content:
        'Um dos usuários que você selecionou está banido da Menhera, portanto não pode jogar Poker',
    });

  const isSomeoneInMatch = await Promise.all(selectedUsersIds.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      components: [],
      content: 'Um dos usuários que você selecionou já está jogando uma partida de Poker!',
    });

  const embed = createStartMatchEmbed(hexStringToNumber(ctx.sentData[0]), [`${ctx.user.id}`]);

  ctx.makeMessage({
    allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
    embeds: [embed],
    components: [
      createActionRow([
        createButton({
          label: 'Participar da partida',
          style: ButtonStyles.Primary,
          customId: createCustomId(1, 'N', ctx.commandId, 'JOIN'),
        }),
        createButton({
          label: 'Iniciar Partida',
          style: ButtonStyles.Secondary,
          disabled: true,
          customId: createCustomId(1, ctx.user.id, ctx.commandId, 'START'),
        }),
      ]),
    ],
    content: selectedUsersIds.map(mentionUser).join(', '),
  });
};

const checkStartMatchInteraction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption] = ctx.sentData;

  if (selectedOption === 'JOIN') return enterMatch(ctx);

  const joinedUsers = ctx.interaction.message?.embeds?.[0].fields?.[0].value
    .split('\n')
    .map(removeNonNumbers) as string[];

  const isSomeoneInMatch = await Promise.all(joinedUsers.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      embeds: [],
      components: [],
      content:
        'Alguém acabou entrando em uma outra partida enquanto esta estava sendo preparada...',
    });

  await pokerRepository.addUsersInMatch(joinedUsers);

  ctx.makeMessage({ embeds: [], components: [], content: 'Iniciando Partida UwU' });
};

const enterMatch = async (ctx: ComponentInteractionContext): Promise<void> => {
  const allowedUsers = ctx.interaction.message?.content.split(', ').map(removeNonNumbers) ?? [];

  if (!allowedUsers.includes(`${ctx.user.id}`))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você não está convidado a participar dessa partida!',
    });

  const oldEmbed = ctx.interaction.message?.embeds[0] as Embed;

  const alreadyInPlayers = oldEmbed.fields?.[0].value.split('\n').map(removeNonNumbers) ?? [];

  if (alreadyInPlayers.includes(`${ctx.user.id}`))
    return ctx.respondInteraction({
      content: 'Você já está nessa partida! Aguarde o início dela',
      flags: MessageFlags.EPHEMERAL,
    });

  const oldButton = ctx.interaction.message?.components?.[0].components?.[1] as ButtonComponent;
  oldButton.disabled = false;

  if (alreadyInPlayers.length === allowedUsers.length) oldButton.style = ButtonStyles.Success;

  ctx.makeMessage({
    components: (ctx.interaction.message?.components as ActionRow[]) ?? [],
    embeds: [createStartMatchEmbed(oldEmbed.color ?? 0, [...alreadyInPlayers, `${ctx.user.id}`])],
  });
};

const PokerCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「💳」・Gerencia partidas de poker',
  descriptionLocalizations: { 'en-US': '「💳」・Manage poker matches' },
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [selectPlayers, checkStartMatchInteraction],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const userInMatch = await pokerRepository.isUserInMatch(ctx.author.id);

    if (userInMatch) return ctx.makeMessage({ content: 'already in match' });

    ctx.makeMessage({
      content: 'Selecione os jogadores dessa partida. Você não deve escolher a si mesmo',
      components: [
        createActionRow([
          createUsersSelectMenu({
            customId: createCustomId(0, ctx.author.id, ctx.commandId, ctx.authorData.selectedColor),
            maxValues: 7,
            placeholder: 'Selecione no máximo 7 pessoas',
          }),
        ]),
      ],
    });
  },
});

export default PokerCommand;
