import { Users } from '@structures/DatabaseCollections';

export default class UserRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async multiUpdate(IDs: Array<string>, query: unknown) {
    await this.userModal.updateMany({ id: { $in: IDs } }, query);
  }

  async update(userId: string, query: unknown) {
    await this.userModal.updateOne({ id: userId }, query);
  }

  async findOrCreate(userID: string) {
    const result = await this.userModal.findOne({ id: userID });
    if (result) return result;

    return this.userModal.create({ id: userID });
  }

  async delete(userID: string) {
    return this.userModal.deleteOne({ id: userID });
  }

  async find(userID: string) {
    return this.userModal.findOne({ id: userID });
  }

  async create(userID: string) {
    return this.userModal.create({ id: userID, shipValue: Math.floor(Math.random() * 55) });
  }

  findAfkByIDs(ids: Array<string>) {
    return this.userModal.find({ id: { $in: ids }, afk: true });
  }
}
