import { Users } from '@structures/DatabaseCollections';

export default class HuntRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async huntDemon(userID: string, value: number, cooldown: string): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { caçados: value }, caçarTime: cooldown },
    );
  }

  async huntAngel(userID: string, value: number, cooldown: string): Promise<void> {
    await this.userModal.updateOne({ id: userID }, { $inc: { anjos: value }, caçarTime: cooldown });
  }

  async huntDemigod(userID: string, value: number, cooldown: string): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { semideuses: value }, caçarTime: cooldown },
    );
  }

  async huntGod(userID: string, value: string, cooldown: string): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { deuses: value }, caçarTime: cooldown },
    );
  }
}
