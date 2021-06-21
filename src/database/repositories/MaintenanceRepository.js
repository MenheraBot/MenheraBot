module.exports = class MaintenanceRepository {
  constructor(cmdRepository, statusRepository) {
    this.cmdRepository = cmdRepository;
    this.statusRepository = statusRepository;
  }

  async addMaintenance(commandName, maintenanceReason) {
    this.cmdRepository.editMaintenance(commandName, true, maintenanceReason);
    this.statusRepository.addMaintenance(commandName, maintenanceReason);
  }

  async removeMaintenance(commandName) {
    this.cmdRepository.editMaintenance(commandName, false, null);
    this.statusRepository.removeMaintenance(commandName);
  }
};
