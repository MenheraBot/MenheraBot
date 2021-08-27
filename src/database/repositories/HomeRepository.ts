import { Homes } from '@structures/DatabaseCollections';
import { IHomeSchema } from '@structures/roleplay/Types';
import { Document } from 'mongoose';

export default class HomeRepository {
  constructor(private homeModal: typeof Homes) {}

  async getAllUserHomes(userId: string): Promise<(IHomeSchema & Document)[]> {
    return this.homeModal.find({ ownerId: userId });
  }
}
