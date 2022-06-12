import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class PartyCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'grupo',
      description: '「🔱」・Forme um grupo de até 3 pessoas para se aventurar contigo',
      nameLocalizations: { 'en-US': 'party' },
      descriptionLocalizations: {
        'en-US': '「🔱」・Enter in a party up to 3 people to adventure with you',
      },
      options: [
        {
          name: 'criar',
          nameLocalizations: { 'en-US': 'create' },
          description: '「🔱」・Forme um grupo de até 3 pessoas para se aventurar contigo',
          descriptionLocalizations: {
            'en-US': '「🔱」・Enter in a party up to 3 people to adventure with you',
          },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user_um',
              type: 'USER',
              description: 'Um dos integrantes de seu grupo',
              required: true,
              nameLocalizations: { 'en-US': 'user_one' },
              descriptionLocalizations: { 'en-US': 'One of the group members' },
            },
            {
              name: 'user_dois',
              type: 'USER',
              description: 'Um dos integrantes de seu grupo',
              required: false,
              nameLocalizations: { 'en-US': 'user_two' },
              descriptionLocalizations: { 'en-US': 'One of the group members' },
            },
          ],
        },
      ],
      category: 'roleplay',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand();

    switch (command) {
      case 'criar':
        return PartyCommand.createParty(ctx);
    }
  }

  static async createParty(ctx: InteractionCommandContext): Promise<void> {
    ctx.makeMessage({ content: 'Temo fazendo ai' });
  }
}
