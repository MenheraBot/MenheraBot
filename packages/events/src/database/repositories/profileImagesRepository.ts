import { BigString } from 'discordeno/types';

import { DatabaseProfileImagesSchema } from '../../types/database';
import { profileImagesModel } from '../collections';
import { MainRedisClient } from '../databases';

const registerImage = async (
  imageId: number,
  uploaderId: BigString,
  price: number,
  name: string,
  isPublic: boolean,
): Promise<void> => {
  await profileImagesModel.create({
    imageId,
    uploaderId,
    price,
    name,
    isPublic,
    totalEarned: 0,
    registeredAt: Date.now(),
    timesSold: 0,
  });
};

const getImageName = async (imageId: number): Promise<string> => {
  const fromRedis = await MainRedisClient.get(`image_name:${imageId}`);

  if (fromRedis) return fromRedis;

  const entireData = await getImageInfo(imageId);

  if (!entireData) return `ID ${imageId}`;

  MainRedisClient.set(`image_name:${imageId}`, entireData.name);

  return entireData.name;
};

const getImageInfo = async (imageId: number): Promise<DatabaseProfileImagesSchema | null> => {
  const fromRedis = await MainRedisClient.get(`images:${imageId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await profileImagesModel.findOne({ imageId });

  if (fromMongo)
    MainRedisClient.set(
      `images:${imageId}`,
      JSON.stringify({
        imageId: fromMongo.imageId,
        uploaderId: fromMongo.uploaderId,
        price: fromMongo.price,
        name: fromMongo.name,
        isPublic: fromMongo.isPublic,
        totalEarned: fromMongo.totalEarned,
        registeredAt: fromMongo.registeredAt,
        timesSold: fromMongo.timesSold,
      }),
    );

  return fromMongo;
};

export default {
  registerImage,
  getImageInfo,
  getImageName,
};
