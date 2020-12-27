const Command = require('../../structures/command');

module.exports = class StarManagerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'managestar',
      aliases: ['ms'],
      description: 'Edite as estrelas de um usuário',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message, args }) {
    const id = args[0];
    const option = args[1];
    const value = args[2];

    if (!value) return message.menheraReply('error', 'Use `m!managestar <userId> <add | remove | set> <valor>`');

    const userInDatabase = await this.client.database.Users.findOne({ id });

    if (!userInDatabase) return message.menheraReply('error', 'Usuário não encontrado');

    const oldStars = userInDatabase.estrelinhas;

    switch (option.toLowerCase()) {
      case 'add':
        userInDatabase.estrelinhas += parseInt(value);
        break;
      case 'remove':
        userInDatabase.estrelinhas -= parseInt(value);
        break;
      case 'set':
        userInDatabase.estrelinhas = parseInt(value);
        break;
      default:
        return message.menheraReply('error', 'Use `m!managestar <userId> <add | remove | set> <valor>`');
    }

    if (userInDatabase.estrelinhas < 0) userInDatabase.estrelinhas = 0;
    userInDatabase.save();
    message.menheraReply('success', `Estrelinhas de ${id} alteradas de **${oldStars}** :star: para **${userInDatabase.estrelinhas}** :star:`);
  }
};
