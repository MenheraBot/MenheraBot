import { FluffetyRace, FluffetySchema } from '@custom_types/Menhera';
import { Fluffetys } from '@database/Collections';
import { MayNotExists } from '@utils/Util';

export default class FluffetyRepository {
  constructor(private fluffetyModal: typeof Fluffetys) {}

  public async findUserFluffety(userId: string): Promise<MayNotExists<FluffetySchema>> {
    return this.fluffetyModal.findOne({ ownerId: userId });
  }

  public async createUserFluffety(userId: string, race: FluffetyRace): Promise<void> {
    await this.fluffetyModal.create({ ownerId: userId, race });
  }
}
