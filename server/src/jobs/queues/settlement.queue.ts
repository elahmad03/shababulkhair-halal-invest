import { Queue } from 'bullmq';
import redis from '../../config/redis';

export const settlementQueue = new Queue('settlement', {
  connection: redis,
});
