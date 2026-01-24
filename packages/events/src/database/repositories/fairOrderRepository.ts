import { BigString } from '@discordeno/bot';
import { AvailablePlants, PlantQuality } from '../../modules/fazendinha/types.js';
import { MainRedisClient } from '../databases.js';
import { feirinhaOrderModel } from '../collections.js';
import { DatabaseFeirinhaOrderSchema, OrderAward } from '../../types/database.js';
import { MAX_ORDER_IN_FAIR_PER_USER } from '../../modules/fazendinha/constants.js';

const mongoToRedis = (order: DatabaseFeirinhaOrderSchema): DatabaseFeirinhaOrderSchema =>
  ({
    _id: order._id,
    weight: order.weight,
    plant: order.plant,
    awards: order.awards,
    quality: order.quality,
    userId: order.userId,
    placedAt: order.placedAt,
  }) satisfies DatabaseFeirinhaOrderSchema;

const getUserOrders = async (farmerId: BigString): Promise<DatabaseFeirinhaOrderSchema[]> =>
  feirinhaOrderModel.find({ userId: `${farmerId}` }, null, {
    sort: { weight: -1, price: 1 },
    limit: MAX_ORDER_IN_FAIR_PER_USER,
  });

const deleteOrder = async (id: string): Promise<void> => {
  await feirinhaOrderModel.deleteOne({ _id: id });
  await MainRedisClient.del(`fair_order:${id}`);
};

const getOrder = async (orderId: string): Promise<null | DatabaseFeirinhaOrderSchema> => {
  const fromRedis = await MainRedisClient.get(`fair_order:${orderId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await feirinhaOrderModel.findById(orderId);

  if (!fromMongo) return null;

  MainRedisClient.setex(`fair_order:${orderId}`, 604800, JSON.stringify(mongoToRedis(fromMongo)));

  return fromMongo;
};

const listPublicOrders = async (farmerId: string, skip: number, limit: number) => {
  const sortedItems = await feirinhaOrderModel.aggregate([
    {
      $addFields: {
        isTargetUser: {
          $cond: { if: { $eq: ['$userId', farmerId] }, then: 0, else: 1 },
        },
      },
    },
    { $sort: { isTargetUser: 1, placedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return sortedItems.map(mongoToRedis);
};

const countPublicOrders = async () => {
  return feirinhaOrderModel.countDocuments({});
};

const placeOrder = async (
  userId: BigString,
  plant: AvailablePlants,
  weight: number,
  quality: PlantQuality,
  awards: OrderAward[],
): Promise<void> => {
  await feirinhaOrderModel.create({
    userId: `${userId}`,
    awards,
    plant,
    quality,
    weight,
    placedAt: Date.now(),
  } satisfies Omit<DatabaseFeirinhaOrderSchema, '_id'>);
};

export default {
  placeOrder,
  countPublicOrders,
  getOrder,
  deleteOrder,
  getUserOrders,
  listPublicOrders,
};
