module.exports = class CmdRepository {
  constructor(cmdModal) {
    this.cmdModal = cmdModal;
  }

  findByName(commandName) {
    return this.cmdModal.findById(commandName);
  }

  create(commandName) {
    return this.cmdModal.create({ _id: commandName });
  }
};
