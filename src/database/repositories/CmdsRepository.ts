import { Cmds } from '@structures/DatabaseCollections';
import { ICmdSchema } from '@utils/Types';

export default class CmdRepository {
  constructor(private cmdModal: typeof Cmds) {}

  async findByName(commandName: string): Promise<ICmdSchema | null> {
    return this.cmdModal.findById(commandName);
  }

  async editMaintenance(
    commandName: string,
    maintenanceStatus: boolean,
    maintenanceReason: string | null,
  ): Promise<void> {
    await this.cmdModal.updateOne(
      { _id: commandName },
      { $set: { maintenance: maintenanceStatus, maintenanceReason } },
    );
  }

  async create(commandName: string): Promise<ICmdSchema> {
    return this.cmdModal.create({ _id: commandName });
  }
}
