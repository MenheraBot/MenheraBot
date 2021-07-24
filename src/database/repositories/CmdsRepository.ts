import { Cmds } from '@structures/DatabaseCollections';

export default class CmdRepository {
  constructor(private cmdModal: typeof Cmds) {
    this.cmdModal = cmdModal;
  }

  findByName(commandName: string) {
    return this.cmdModal.findById(commandName);
  }

  async editMaintenance(
    commandName: string,
    maintenanceStatus: boolean,
    maintenanceReason: string,
  ) {
    await this.cmdModal.updateOne(
      { _id: commandName },
      { $set: { maintenance: maintenanceStatus, maintenanceReason } },
    );
  }

  create(commandName: string) {
    return this.cmdModal.create({ _id: commandName });
  }
}
