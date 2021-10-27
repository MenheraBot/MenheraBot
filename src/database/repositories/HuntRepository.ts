import { Users } from '@structures/DatabaseCollections';
import { HuntingTypes } from '@utils/Types';

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
      { $inc: { [huntType]: value, rolls: -rolls }, huntCooldown: cooldown },
    );
  }
}
