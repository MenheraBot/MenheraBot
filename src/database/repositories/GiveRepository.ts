import { Users } from '@database/Collections';
import { IUserSchema } from '@custom_types/Menhera';

export default class GiveRepository {
  constructor(private userModal: typeof Users) {}

  async executeGive(
    field: keyof IUserSchema,
    fromID: string,
    toID: string,
    value: number,
  ): Promise<void> {
    await this.userModal.updateOne(
      { id: fromID },
      { $inc: { [field]: -value }, lastCommandAt: Date.now() },
    );
    await this.userModal.updateOne(
      { id: toID },
      { $inc: { [field]: value }, lastCommandAt: Date.now() },
    );
  }
}
