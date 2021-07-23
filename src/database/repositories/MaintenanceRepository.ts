import CmdRepository from './CmdsRepository';
import StatusRepository from './StatusRepository';

export default class MaintenanceRepository {
  constructor(private cmdRepository: CmdRepository, private statusRepository: StatusRepository) {
    this.cmdRepository = cmdRepository;
    this.statusRepository = statusRepository;
  }

  async addMaintenance(commandName: string, maintenanceReason: string) {
    this.cmdRepository.editMaintenance(commandName, true, maintenanceReason);
    this.statusRepository.addMaintenance(commandName, maintenanceReason);
  }

  async removeMaintenance(commandName: string) {
    this.cmdRepository.editMaintenance(commandName, false, null);
    this.statusRepository.removeMaintenance(commandName);
  }
}
