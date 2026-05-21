import { Queue } from 'bullmq';
import redis from '../../config/redis';

export const autoInvestQueue = new Queue('autoInvest', {
  connection: redis,
});
