module.exports = class BolehamRepository {
  constructor(bolehamModal) {
    this.bolehamModal = bolehamModal;
  }

  find(id) {
    return this.bolehamModal.findById(id);
  }

  create(commandName, options) {
    return this.bolehamModal.create({ _id: commandName, ...options });
  }
};
