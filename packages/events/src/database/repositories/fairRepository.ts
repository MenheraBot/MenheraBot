import { BigString } from 'discordeno/types';
import { DatabaseFeirinhaSchema } from '../../types/database';
import { feirinhaModel } from '../collections';
import { AvailablePlants } from '../../modules/fazendinha/types';
import { MainRedisClient } from '../databases';
import { AvailableLanguages } from '../../types/i18next';

const mongoToRedis = (announcement: DatabaseFeirinhaSchema): DatabaseFeirinhaSchema => ({
  _id: announcement._id,
  'name_en-US': announcement['name_en-US'],
  'name_pt-BR': announcement['name_pt-BR'],
  amount: announcement.amount,
  plantType: announcement.plantType,
  price: announcement.price,
  userId: announcement.userId,
});

const doesAnnouncementExists = async (id: string): Promise<boolean> =>
  MainRedisClient.sismember(`fair_announcement:all`, id).then((res) => res === 1);

const getUserProducts = async (farmerId: BigString): Promise<DatabaseFeirinhaSchema[]> =>
  feirinhaModel.find({ userId: `${farmerId}` });

const deleteAnnouncement = async (id: string): Promise<void> => {
  MainRedisClient.srem(`fair_announcement:all`, id);
  MainRedisClient.del(`fair_announcement:${id}`);

  const deleted = await feirinhaModel.findByIdAndDelete(id);
  if (!deleted) return;

  MainRedisClient.srem('fair_announcement:pt-BR', `${deleted['name_pt-BR']}|${id}`);
  await MainRedisClient.srem('fair_announcement:en-US', `${deleted['name_en-US']}|${id}`);
};

const getAnnoucementNames = async (language: AvailableLanguages): Promise<string[]> =>
  MainRedisClient.smembers(`fair_announcement:${language}`);

const getAnnouncement = async (announcementId: string): Promise<null | DatabaseFeirinhaSchema> => {
  const fromRedis = await MainRedisClient.get(`fair_announcement:${announcementId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await feirinhaModel.findById(announcementId);

  if (!fromMongo) return null;

  MainRedisClient.setex(
    `fair_announcement:${announcementId}`,
    3600,
    JSON.stringify(mongoToRedis(fromMongo)),
  );

  return fromMongo;
};

const getAnnouncementIds = async (skip: number, take: number): Promise<string[]> => {
  const [, result] = await MainRedisClient.sscan(`fair_announcement:all`, skip, 'COUNT', take);

  return result;
};

const announceProduct = async (
  userId: BigString,
  plant: AvailablePlants,
  amount: number,
  price: number,
  nameBr: string,
  nameUs: string,
): Promise<void> => {
  const announcement = await feirinhaModel.create({
    userId: `${userId}`,
    price,
    plantType: plant,
    amount,
    'name_pt-BR': nameBr,
    'name_en-US': nameUs,
  });

  MainRedisClient.sadd(`fair_announcement:all`, announcement._id);
  MainRedisClient.sadd('fair_announcement:pt-BR', `${nameBr}|${announcement._id}`);
  await MainRedisClient.sadd('fair_announcement:en-US', `${nameUs}|${announcement._id}`);
};

export default {
  getUserProducts,
  deleteAnnouncement,
  doesAnnouncementExists,
  announceProduct,
  getAnnoucementNames,
  getAnnouncementIds,
  getAnnouncement,
};
