import { BigString } from 'discordeno/types';

import { DatabaseProfileImagesSchema } from '../../types/database';
import { profileImagesModel } from '../collections';
import { MainRedisClient } from '../databases';
import starsRepository from './starsRepository';

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
  const fromRedis = await MainRedisClient.get(`image:${imageId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await profileImagesModel.findOne({ imageId });

  if (fromMongo)
    MainRedisClient.set(
      `image:${imageId}`,
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

const getAvailableToBuyImages = (
  alreadyBought: number[],
): Promise<{ id: number; price: number; name: string }[]> => {
  return profileImagesModel
    .find({ imageId: { $nin: alreadyBought }, isPublic: true })
    .then((res) => res.map((b) => ({ name: b.name, id: b.imageId, price: b.price })));
};

const giveUploaderImageRoyalties = async (imageId: number, value: number): Promise<void> => {
  const receiveValue = Math.floor(0.01 * value);

  const imageData = await profileImagesModel.findOneAndUpdate(
    { imageId },
    { $inc: { timesSold: 1, totalEarned: receiveValue } },
  );

  await MainRedisClient.del(`image:${imageId}`);

  await starsRepository.addStars(imageData?.uploaderId ?? '', receiveValue);
};

export default {
  giveUploaderImageRoyalties,
  registerImage,
  getAvailableToBuyImages,
  getImageInfo,
  getImageName,
};
