import { Users } from '@database/Collections';
import { HuntingTypes } from '@custom_types/Menhera';

export default class HuntRepository {
  constructor(private userModal: typeof Users) {}

  async huntEntity(
    userID: string,
    huntType: HuntingTypes,
    value: number,
    cooldown: number,
    rolls: number,
  ): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { [huntType]: value, rolls: -rolls },
        huntCooldown: cooldown,
        lastCommandAt: Date.now(),
      },
    );
  }
}
