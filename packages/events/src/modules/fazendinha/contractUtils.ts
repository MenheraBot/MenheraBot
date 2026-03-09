import contractsRepository from '../../database/repositories/contractsRepository.js';
import { DatabaseContractSchema, DatabaseFarmerSchema } from '../../types/database.js';

const getNextContracts = async (
  farmer: DatabaseFarmerSchema,
): Promise<DatabaseContractSchema[]> => {
  console.log(farmer);
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
