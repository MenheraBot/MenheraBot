import CmdRepository from './CmdsRepository';
import StatusRepository from './StatusRepository';

export default class MaintenanceRepository {
  constructor(private cmdRepository: CmdRepository, private statusRepository: StatusRepository) {
    this.cmdRepository = cmdRepository;
    this.statusRepository = statusRepository;
  }

  async addMaintenance(commandName: string, maintenanceReason: string): Promise<void> {
    await this.cmdRepository.editMaintenance(commandName, true, maintenanceReason);
    await this.statusRepository.addMaintenance(commandName, maintenanceReason);
  }

  async removeMaintenance(commandName: string): Promise<void> {
    await this.cmdRepository.editMaintenance(commandName, false, null);
    await this.statusRepository.removeMaintenance(commandName);
  }
}
