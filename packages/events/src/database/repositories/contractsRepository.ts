import { BigString } from '@discordeno/bot';

import { registerCacheStatus } from '../../structures/initializePrometheus.js';
import { DatabaseContractSchema } from '../../types/database.js';
import { MainRedisClient } from '../databases.js';
import { debugError } from '../../utils/debugError.js';
import { contractsModel } from '../collections.js';
import { ContractStatus } from '../../modules/fazendinha/types.js';
import { SEVEN_DAYS_IN_SECONDS } from '../../structures/constants.js';

const parseMongoUserToRedisUser = (contract: DatabaseContractSchema): DatabaseContractSchema => ({
  farmerId: `${contract.farmerId}`,
  createdAt: contract.createdAt,
  duration: contract.duration,
  npcId: contract.npcId,
  requirements: contract.requirements,
  reward: contract.reward,
  status: contract.status,
});

const createUserContracts = (contracts: DatabaseContractSchema[]): void =>
  contracts.forEach((c) => contractsModel.create(c).catch(debugError));

const getUserContracts = async (farmerId: BigString): Promise<DatabaseContractSchema[]> => {
  const fromRedis = await MainRedisClient.get(`contracts:${farmerId}`).catch(debugError);

  registerCacheStatus(fromRedis, 'contracts');

  if (fromRedis) return JSON.parse(fromRedis).map(parseMongoUserToRedisUser);

  const fromMongo = await contractsModel
    .find({ farmerId: `${farmerId}`, status: ContractStatus.OFFERED })
    .catch(debugError);

  if (!fromMongo) return [];

  MainRedisClient.setex(
    `contracts:${farmerId}`,
    SEVEN_DAYS_IN_SECONDS,
    JSON.stringify(fromMongo.map(parseMongoUserToRedisUser)),
  );

  return fromMongo;
};

export default { getUserContracts, createUserContracts };
