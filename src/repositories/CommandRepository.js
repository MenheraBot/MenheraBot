const { Commands } = require('../structures/DatabaseConnection');

module.exports = class CommandRepository {
  static findByName(commandName) {
    return Commands.findOne({
      name: commandName,
    });
  }

  static create(commandName, {
    category,
    ptDescription,
    ptUsage,
    usDescription,
    usUsage,
  }) {
    return Commands.create({
      name: commandName,
      category,
      pt_description: ptDescription,
      pt_usage: ptUsage,
      us_description: usDescription,
      us_usage: usUsage,
    });
  }

  static updateByName(
    commandName,
    {
      category, ptDescription, ptUsage, usDescription, usUsage,
    },
  ) {
    return Commands.updateOne(
      {
        name: commandName,
      },
      {
        category,
        pt_description: ptDescription,
        pt_usage: ptUsage,
        us_description: usDescription,
        us_usage: usUsage,
      },
    );
  }
};
