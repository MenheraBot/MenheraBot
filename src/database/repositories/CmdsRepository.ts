import { Cmds } from '@structures/DatabaseCollections';
import { ICmdSchema } from '@custom_types/Menhera';

export default class CmdRepository {
  constructor(private cmdModal: typeof Cmds) {}

  async findByName(commandName: string): Promise<ICmdSchema | null> {
    return this.cmdModal.findById(commandName, null, { lean: true });
  }

  async getAllCommandsInMaintenance(): Promise<ICmdSchema[]> {
    return this.cmdModal.find({ maintenance: true }, null, { lean: true });
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
