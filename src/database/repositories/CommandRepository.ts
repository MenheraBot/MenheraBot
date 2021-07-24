import { Commands } from '@structures/DatabaseCollections';

export default class CommandRepository {
  constructor(private commandModal: typeof Commands) {
    this.commandModal = commandModal;
  }

  findByName(commandName: string) {
    return this.commandModal.findOne({
      name: commandName,
    });
  }

  create(commandName: string, { category, ptDescription, ptUsage, usDescription, usUsage }) {
    return this.commandModal.create({
      name: commandName,
      category,
      pt_description: ptDescription,
      pt_usage: ptUsage,
      us_description: usDescription,
      us_usage: usUsage,
    });
  }

  updateByName(commandName: string, { category, ptDescription, ptUsage, usDescription, usUsage }) {
    return this.commandModal.updateOne(
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
