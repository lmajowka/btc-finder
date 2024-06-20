import { workerData } from 'worker_threads';
import encontrarBitcoins from '../bitcoin-find.js';

const { min, max, numWorker } = workerData;

(async () => {
  await encontrarBitcoins(min, max, numWorker);
})();
