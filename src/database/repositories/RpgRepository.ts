import { Rpg } from '@structures/DatabaseCollections';
import { IUserRpgSchema } from '@utils/Types';

export default class RpgRepository {
  constructor(private rpgModal: typeof Rpg) {
    this.rpgModal = rpgModal;
  }

  async find(userID: string): Promise<IUserRpgSchema | null> {
    return this.rpgModal.findById(userID);
  }

  async create(userID: string): Promise<IUserRpgSchema> {
    return this.rpgModal.create({ _id: userID });
  }
}
