import { Users } from '@structures/DatabaseCollections';

export default class HuntRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async huntDemon(userID: string, value: number, cooldown: string, rolls: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { caçados: value, rolls: -rolls }, caçarTime: cooldown },
    );
  }

  async huntAngel(userID: string, value: number, cooldown: string, rolls: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { anjos: value, rolls: -rolls }, caçarTime: cooldown },
    );
  }

  async huntDemigod(userID: string, value: number, cooldown: string, rolls: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { semideuses: value, rolls: -rolls }, caçarTime: cooldown },
    );
  }

  async huntGod(userID: string, value: number, cooldown: string, rolls: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { deuses: value, rolls: -rolls }, caçarTime: cooldown },
    );
  }
}
