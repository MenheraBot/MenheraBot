import contractsRepository from '../../database/repositories/contractsRepository.js';
import { DatabaseContractSchema, DatabaseFarmerSchema } from '../../types/database.js';
import { randomFromArray } from '../../utils/miscUtils.js';
import { MAX_CONTRACTS_PER_NPC, NPC_BASE_CONTRACT_DURATION_IN_MILLIS } from './constants.js';
import { NeighborsNpcs } from './npcConstants.js';
import { AvailableNpcs, ContractStatus } from './types.js';

const getNextContracts = async (
  farmer: DatabaseFarmerSchema,
): Promise<DatabaseContractSchema[]> => {
  const lastContract = farmer.lastNpcInteraction;

  if (!lastContract) {
    const randomNpcId = Number(randomFromArray(Object.keys(NeighborsNpcs))) as 0;
    const npcData = NeighborsNpcs[randomNpcId];

    const contracts: DatabaseContractSchema[] = [];

    for (let i = 0; i < MAX_CONTRACTS_PER_NPC; i++) {
      contracts.push({
        createdAt: Date.now(),
        duration: NPC_BASE_CONTRACT_DURATION_IN_MILLIS,
        farmerId: farmer.id,
        npcId: randomNpcId,
        requirements: [],
        reward: 10,
        status: ContractStatus.OFFERED,
      });
    }

    return contracts;
  }

  return [];
};

const getCurrentUserContracts = async (
  farmer: DatabaseFarmerSchema,
): Promise<DatabaseContractSchema[]> => {
  const contractsFromDb = await contractsRepository.getUserContracts(farmer.id);

  if (contractsFromDb.length > 0) return contractsFromDb;

  const nextContracts = await getNextContracts(farmer);

  contractsRepository.createUserContracts(nextContracts);

  return nextContracts;
};

export { getCurrentUserContracts };
