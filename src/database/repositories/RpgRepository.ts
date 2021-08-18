import { Rpg } from '@structures/DatabaseCollections';
import { IBasicData, IRpgUserSchema } from '@structures/roleplay/Types';
import { Document } from 'mongoose';

export default class RpgRepository {
  constructor(private rpgModal: typeof Rpg) {}

  async findUser(userID: string): Promise<(IRpgUserSchema & Document) | null> {
    return this.rpgModal.findOne({ id: userID });
  }

  async createUser(data: IBasicData): Promise<boolean> {
    return this.rpgModal
      .create(data)
      .then(() => true)
      .catch(() => false);
  }
}
