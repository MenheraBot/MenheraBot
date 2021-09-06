import { Users } from '@structures/DatabaseCollections';

export default class StarRepository {
  constructor(private userModal: typeof Users) {}

  async add(userID: string, value: number): Promise<void> {
    await this.userModal.updateOne({ id: userID }, { $inc: { estrelinhas: value } });
  }

  async remove(userID: string, value: number): Promise<void> {
    const invertedValue = value * -1;
    await this.userModal.updateOne({ id: userID }, { $inc: { estrelinhas: invertedValue } });
  }

  async set(userID: string, value: number): Promise<void> {
    await this.userModal.updateOne({ id: userID }, { $set: { estrelinhas: value } });
  }
}
