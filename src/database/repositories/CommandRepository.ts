import { Commands } from '@structures/DatabaseCollections';
import { ICommandsSchema } from '@utils/Types';

export default class CommandRepository {
  constructor(private commandModal: typeof Commands) {
    this.commandModal = commandModal;
  }

  async findByName(commandName: string): Promise<ICommandsSchema | null> {
    return this.commandModal.findOne({
      name: commandName,
    });
  }

  async create(
    commandName: string,
    {
      category,
      ptDescription,
      ptUsage,
      usDescription,
      usUsage,
    }: {
      category: string;
      ptDescription: string;
      ptUsage: string;
      usDescription: string;
      usUsage: string;
    },
  ): Promise<ICommandsSchema> {
    return this.commandModal.create({
      name: commandName,
      category,
      pt_description: ptDescription,
      pt_usage: ptUsage,
      us_description: usDescription,
      us_usage: usUsage,
    });
  }

  async updateByName(
    commandName: string,
    {
      category,
      ptDescription,
      ptUsage,
      usDescription,
      usUsage,
    }: {
      category: string;
      ptDescription: string;
      ptUsage: string;
      usDescription: string;
      usUsage: string;
    },
  ): Promise<void> {
    await this.commandModal.updateOne(
      {
        name: commandName,
      },
      {
        category,
        pt_description: ptDescription,
        pt_usage: ptUsage,
        us_description: usDescription,
        us_usage: usUsage,
      },
    );
  }
}
