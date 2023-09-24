import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import { PokerMatch, PokerPlayer } from './types';

const handleGameAction = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  ctx.makeMessage({ content: `O jogador jogou ${ctx.interaction.data.values[0]}` });

  console.log(gameData, player);
};

export { handleGameAction };
