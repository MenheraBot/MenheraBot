import { DiscordEmbedField } from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { AvailablePlants } from './types';
import { Plants } from './plants';

const displaySilo = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const embed = createEmbed({
    title: `Silo de ${getDisplayName(ctx.user)}`,
    color: hexStringToNumber(embedColor),
    fields: ['seeds' as const, 'silo' as const].reduce<DiscordEmbedField[]>((p, c) => {
      const items = farmer[c].filter((a) => a.amount > 0);

      if (c === 'seeds') {
        const hasMate = items.some((a) => a.plant === AvailablePlants.Mate);

        if (!hasMate) items.push({ amount: 0, plant: AvailablePlants.Mate });
      }

      if (items.length === 0) {
        p.push({ name: c === 'seeds' ? 'Sementes' : 'Plantas', value: `**Nada**`, inline: true });
        return p;
      }

      p.push({
        name: c === 'seeds' ? 'Sementes' : 'Plantas',
        value: items
          .map(
            (a) =>
              `- ${Plants[a.plant].emoji} **${
                a.plant === AvailablePlants.Mate ? '∞' : `${a.amount}x`
              }** - ${a.plant} `,
          )
          .join('\n'),
        inline: true,
      });

      return p;
    }, []),
  });

  ctx.makeMessage({ embeds: [embed] });
};

export { displaySilo };
