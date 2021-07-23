import { Rpg } from '@structures/DatabaseCollections';

export default class RpgRepository {
  constructor(private rpgModal: typeof Rpg) {
    this.rpgModal = rpgModal;
  }

  async find(userID: string) {
    return this.rpgModal.findById(userID);
  }

  async findByIdOrCreate(userID: string) {
    const result = await this.rpgModal.findById(userID);
    if (result) return result;

    return this.rpgModal.create({ _id: userID });
  }
}
