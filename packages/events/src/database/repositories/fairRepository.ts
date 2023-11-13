import { BigString } from 'discordeno/types';
import { DatabaseFeirinhaSchema } from '../../types/database';
import { feirinhaModel } from '../collections';

const getUserProducts = async (farmerId: BigString): Promise<DatabaseFeirinhaSchema[]> =>
  feirinhaModel.find({ userId: `${farmerId}` });

export default { getUserProducts };
