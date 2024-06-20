import { Worker } from 'worker_threads';
import path from 'path';

const workers = [];

function createWorker(workerMin, workerMax, workerId) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve('./src/utils/bitcoinWorker.js'), {
            workerData: { min: workerMin, max: workerMax, numWorker: workerId }
        });

        worker.on('message', (msg) => {
            if (msg.type === 'ACHEI') {
                console.log(`Worker ${workerId} encontrou a chave: ${msg.pkey}`);
                for (const w of workers) {
                    w.postMessage('STOP');
                }
            } else if (msg.type === 'PROGRESS') {
                if (typeof global.progressCallback === 'function') {
                    global.progressCallback(workerId, msg.key, msg.lastKey);
                }
            } else {
                console.log(`Worker mensagem: ${msg}`);
            }
        });

        worker.on('error', (err) => {
            console.error('Erro no worker:', err);
            reject(err);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker finalizou com o código de saída ${code}`);
                reject(new Error(`Worker finalizou com o código de saída ${code}`));
            } else {
                resolve();
            }
        });

        workers.push(worker);
    });
}

export default createWorker;
