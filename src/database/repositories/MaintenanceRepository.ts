import CmdRepository from './CmdsRepository';

export default class MaintenanceRepository {
  constructor(private cmdRepository: CmdRepository) {}

  async addMaintenance(commandName: string, maintenanceReason: string): Promise<void> {
    await this.cmdRepository.editMaintenance(commandName, true, maintenanceReason);
  }

  async removeMaintenance(commandName: string): Promise<void> {
    await this.cmdRepository.editMaintenance(commandName, false, null);
  }
}
