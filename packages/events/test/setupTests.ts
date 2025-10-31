import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve('packages/events/test/.env.test'), quiet: true });
