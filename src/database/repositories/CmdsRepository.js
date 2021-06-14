module.exports = class CmdRepository {
  constructor(cmdModal) {
    this.cmdModal = cmdModal;
  }

  findByName(commandName) {
    return this.cmdModal.findById(commandName);
  }

  editMaintenance(commandName, maintenanceStatus, maintenanceReason) {
    this.cmdModal.updateOne({ _id: commandName }, { $set: { maintenance: maintenanceStatus, maintenanceReason } });
  }

  create(commandName) {
    return this.cmdModal.create({ _id: commandName });
  }
};
