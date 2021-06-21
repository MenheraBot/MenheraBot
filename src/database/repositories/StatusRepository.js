module.exports = class StatusRepository {
  constructor(statusModal) {
    this.statusModal = statusModal;
  }

  async CreateOrUpdate(shardID, ping, lastPingAt, guilds, uptime) {
    const result = await this.statusModal.findById(shardID);
    if (result) {
      await this.statusModal.updateOne({ _id: shardID }, {
        ping, lastPingAt, guilds, uptime,
      });
    } else {
      await this.statusModal.create({
        _id: shardID, ping, lastPingAt, guilds, uptime,
      });
    }
  }

  async addMaintenance(commandName, maintenanceReason) {
    await this.statusModal.updateOne({ _id: 'main' }, { $push: { disabledCommands: { name: commandName, reason: maintenanceReason } } });
  }

  async removeMaintenance(commandName) {
    await this.statusModal.updateOne({ _id: 'main' }, { $pull: { disabledCommands: { name: commandName } } });
  }
};
