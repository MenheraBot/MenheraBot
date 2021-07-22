module.exports = class CommandRepository {
  constructor(commandModal) {
    this.commandModal = commandModal;
  }

  findByName(commandName) {
    return this.commandModal.findOne({
      name: commandName,
    });
  }

  create(commandName, { category, ptDescription, ptUsage, usDescription, usUsage }) {
    return this.commandModal.create({
      name: commandName,
      category,
      pt_description: ptDescription,
      pt_usage: ptUsage,
      us_description: usDescription,
      us_usage: usUsage,
    });
  }

  updateByName(commandName, { category, ptDescription, ptUsage, usDescription, usUsage }) {
    return this.commandModal.updateOne(
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
