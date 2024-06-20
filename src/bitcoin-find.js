import CoinKey from 'coinkey';
import walletsArray from './data/wallets.js';
import { parentPort } from 'worker_threads';
import chalk from 'chalk';
import fs from 'fs';

const walletsSet = new Set(walletsArray);

async function encontrarBitcoins(min, max, worker) {
    let key = BigInt(min);
    let running = true;
    let segundos = 0;
    const startTime = Date.now();
    const zeroes = Array.from({ length: 65 }, (_, i) => '0'.repeat(64 - i));

    parentPort.on('message', (message) => {
        if (message === 'STOP') {
            running = false;
        }
    });

    const executeLoop = async () => {
        while (running && key <= max) {
            let pkey = key.toString(16);
            pkey = `${zeroes[pkey.length]}${pkey}`;

            let publicKey = generatePublic(pkey);
            if (walletsSet.has(publicKey)) {
                const tempo = (Date.now() - startTime) / 1000;
                const wif = generateWIF(pkey);
                console.log('Private key:', chalk.green(pkey));
                console.log('WIF:', chalk.green(wif));

                const filePath = 'keys.txt';
                const lineToAppend = `Private key: ${pkey}, WIF: ${wif}\n`;

                try {
                    fs.appendFileSync(filePath, lineToAppend);
                    console.log('Chave escrita no arquivo com sucesso.');
                } catch (err) {
                    console.error('Erro ao escrever chave em arquivo:', err);
                }

                console.log('ACHEI!!!! 🎉🎉🎉🎉🎉');
                parentPort.postMessage({ type: 'ACHEI', pkey, wif });
                running = false;
                break;
            }

            if (Date.now() - startTime > segundos) {
                segundos += 1000;
                parentPort.postMessage({ type: 'PROGRESS', workerId: worker, key: key, lastKey: pkey });
                
                if (segundos % 10000 === 0) {
                    const filePath = 'Ultima_chave.txt';
                    const content = `Última chave tentada: ${pkey}`;
                    try {
                        fs.writeFileSync(filePath, content, 'utf8');
                    } catch (err) {
                        console.error('Erro ao escrever no arquivo:', err);
                    }
                }
            }

            key++;
            await new Promise(resolve => setImmediate(resolve));
        }
    };

    try {
        await executeLoop();
    } catch (err) {
        console.error('Erro inesperado:', err);
        running = false;
    }
}

function generatePublic(privateKey) {
    let _key = new CoinKey(Buffer.from(privateKey, 'hex'));
    _key.compressed = true;
    return _key.publicAddress;
}

function generateWIF(privateKey) {
    let _key = new CoinKey(Buffer.from(privateKey, 'hex'));
    return _key.privateWif;
}

export default encontrarBitcoins;
