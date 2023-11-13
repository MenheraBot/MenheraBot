import { BigString } from 'discordeno/types';
import { DatabaseFeirinhaSchema } from '../../types/database';
import { feirinhaModel } from '../collections';
import { AvailablePlants } from '../../modules/fazendinha/types';
import { MainRedisClient } from '../databases';

const getUserProducts = async (farmerId: BigString): Promise<DatabaseFeirinhaSchema[]> =>
  feirinhaModel.find({ userId: `${farmerId}` });

const deleteAnnouncement = async (id: string): Promise<void> => {
  await feirinhaModel.deleteOne({ _id: id });
};

const getAllItems = async (): Promise<string[]> => MainRedisClient.smembers('feirinha_items');

const announceProduct = async (
  userId: BigString,
  plant: AvailablePlants,
  amount: number,
  price: number,
  nameBr: string,
  nameUs: string,
): Promise<void> => {
  await feirinhaModel.create({
    userId,
    price,
    plantType: plant,
    amount,
    'name_pt-BR': nameBr,
    'name_en-US': nameUs,
  });

  await MainRedisClient.sadd('feirinha_items', [nameBr, nameUs]);
};

export default { getUserProducts, deleteAnnouncement, announceProduct, getAllItems };
