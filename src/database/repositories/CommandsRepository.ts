import { Commands } from '@structures/DatabaseCollections';

export default class CommandsRepository {
  constructor(private commandsModal: typeof Commands) {}

  async updateByName(commandName: string): Promise<void> {
    const updated = await this.commandsModal.findByIdAndUpdate(commandName);
    if (!updated) await this.commandsModal.create({ _id: commandName });
  }

  async deleteOldCommands(existingCommands: string[]): Promise<void> {
    await this.commandsModal.deleteMany({ _id: { $nin: existingCommands } });
  }
}
