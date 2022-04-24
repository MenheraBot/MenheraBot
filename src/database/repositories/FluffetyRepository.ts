import { FluffetySchema } from '@custom_types/Menhera';
import { Fluffetys } from '@database/Collections';
import { MayNotExists } from '@utils/Util';

export default class FluffetyRepository {
  constructor(private fluffetyModal: typeof Fluffetys) {}

  public async findUserFluffety(userId: string): Promise<MayNotExists<FluffetySchema>> {
    return this.fluffetyModal.findOne({ id: userId });
  }
}
