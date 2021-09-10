import { Commands } from '@structures/DatabaseCollections';
import { ICommandsSchema } from '@utils/Types';

export default class CommandsRepository {
  constructor(private commandsModal: typeof Commands) {}

  async updateByName(command: ICommandsSchema): Promise<void> {
    const updated = await this.commandsModal.findByIdAndUpdate(command._id, command);
    if (!updated) await this.commandsModal.create(command);
  }

  async deleteOldCommands(existingCommands: string[]): Promise<void> {
    await this.commandsModal.deleteMany({ _id: { $nin: existingCommands } });
  }
}
