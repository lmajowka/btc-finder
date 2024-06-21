import { parentPort } from 'worker_threads';
import walletsArray from './data/wallets.js';
import { generatePublic, generateWIF } from './utils/index.js';
import chalk from 'chalk';
import fs from 'fs';

const walletsSet = new Set(walletsArray);

async function encontrarBitcoinsWorker(key, min, max, workerData) {
    let segundos = 0;
    const startTime = Date.now();
    const zeroes = Array.from({ length: 65 }, (_, i) => '0'.repeat(64 - i));
    const totalChaves = BigInt(max) - BigInt(min) + BigInt(1);
    const blocoId = workerData.blocoId;
    const testadas = new Set();

    console.log(`Worker para Bloco ${blocoId}: Buscando Bitcoins de forma aleatória...`);

    let running = true;
    const executeLoop = async () => {
        while (running) {
            if (workerData.found) {
                console.log(`Worker para Bloco ${blocoId}: Busca interrompida - chave encontrada em outro processo.`);
                return;
            }

            const randomOffset = BigInt(Math.floor(Math.random() * Number(totalChaves)));
            key = BigInt(min) + randomOffset;

            let pkey = key.toString(16);
            pkey = `${zeroes[pkey.length]}${pkey}`;

            if (testadas.has(pkey)) continue;
            testadas.add(pkey);

            const chavesVerificadas = testadas.size;

            if (Date.now() - startTime > segundos) {
                segundos += 1000;

                const progressoPercentual = (BigInt(chavesVerificadas) * BigInt(100)) / totalChaves;

                console.log(`Worker para Bloco ${chalk.blue(blocoId)}: ${chalk.yellow(segundos / 1000)} segundos\nProgresso: ${chalk.red(progressoPercentual.toString(), "%")} concluído`);
                
                if (segundos % 10000 === 0) {
                    const tempo = (Date.now() - startTime) / 1000;
                    console.clear();
                    console.log(`Worker para Bloco ${blocoId}: Resumo:`);
                    console.log('Velocidade:', chavesVerificadas / tempo, ' chaves por segundo');
                    console.log('Chaves buscadas: ', chavesVerificadas.toLocaleString('pt-BR'));
                    console.log('Ultima chave tentada: ', pkey);

                    const filePath = `Ultima_chave_bloco_${blocoId}.txt`;
                    const content = `Ultima chave tentada: ${pkey}`;
                    try {
                        fs.writeFileSync(filePath, content, 'utf8');
                    } catch (err) {
                        console.error('Erro ao escrever no arquivo:', err);
                    }
                }
            }

            let publicKey = generatePublic(pkey);
            if (walletsSet.has(publicKey)) {
                const tempo = (Date.now() - startTime) / 1000;
                console.log(`Worker para Bloco ${blocoId}: Velocidade:`, chavesVerificadas / tempo, ' chaves por segundo');
                console.log(`Worker para Bloco ${blocoId}: Tempo:`, tempo, ' segundos');
                console.log(`Worker para Bloco ${blocoId}: Private key:`, chalk.green(pkey));
                console.log(`Worker para Bloco ${blocoId}: WIF:`, chalk.green(generateWIF(pkey)));

                const filePath = 'keys.txt';
                const lineToAppend = `Worker para Bloco ${blocoId}: Private key: ${pkey}, WIF: ${generateWIF(pkey)}\n`;

                try {
                    fs.appendFileSync(filePath, lineToAppend);
                    console.log(`Worker para Bloco ${blocoId}: Chave escrita no arquivo com sucesso.`);
                } catch (err) {
                    console.error(`Worker para Bloco ${blocoId}: Erro ao escrever chave em arquivo:`, err);
                }

                console.log(`Worker para Bloco ${blocoId}: ACHEI!!!! 🎉🎉🎉🎉🎉`);
                workerData.found = true;
                parentPort.postMessage({ found: true });
                running = false;
            }

            await new Promise(resolve => setImmediate(resolve));
        }
    };

    try {
        await executeLoop();
    } catch (err) {
        if (err !== 'ACHEI!!!! 🎉🎉🎉🎉🎉') {
            console.error(`Worker para Bloco ${blocoId}: Erro inesperado:`, err);
            running = false;
        }
    }

    console.log(`Worker para Bloco ${blocoId}: Processo interrompido ou concluído.`);
}

parentPort.on('message', (workerData) => {
    const { key, min, max } = workerData;
    encontrarBitcoinsWorker(BigInt(key), BigInt(min), BigInt(max), workerData);
});
