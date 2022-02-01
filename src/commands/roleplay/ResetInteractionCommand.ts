import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class ResetInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'reset-dungeon',
      description: '「📸」・RESETA STATUS DA DUNGEON',
      category: 'roleplay',
      options: [
        {
          type: 'STRING',
          name: 'option',
          description: 'Você deseja deletar a conta ou só resetar mana e vida?',
          required: true,
          choices: [
            { name: 'Resetar Mana e Vida', value: '1' },
            { name: 'Resetar Conta Pra pegar Outra Classe', value: '2' },
            { name: 'Pegar Bençãos Pra upar habilidade', value: '3' },
          ],
        },
      ],
      cooldown: 60,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const option = ctx.options.getString('option', true);

    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: 'USA /FICHA PRA CRIAR CONTA' });
      return;
    }

    switch (option) {
      case '2': {
        ctx.client.database.Rpgs.deleteOne({ id: ctx.author.id });
        break;
      }
      case '1': {
        ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
          life: getUserMaxLife(user),
          mana: getUserMaxMana(user),
        });
        break;
      }
      case '3': {
        ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
          holyBlessings: {
            ability: 100,
            vitality: 100,
            battle: 100,
          },
        });
        break;
      }
    }
    ctx.makeMessage({ content: 'dale' });
  }
}
