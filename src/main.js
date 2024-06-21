import chalk from 'chalk';
import os from 'os';
import { Worker } from 'worker_threads';
import {
    fazerPergunta, rl,
    escolherCarteira,
    escolherMinimo,
    escolherPorcentagem,
    escolherPorcentagemBlocos
} from './utils/index.js';
import encontrarBitcoins from './bitcoin-find.js';

function titulo() {
    console.log("\x1b[38;2;250;128;114m" + "╔════════════════════════════════════════════════════════╗\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "   ____ _____ ____   _____ ___ _   _ ____  _____ ____   " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  | __ )_   _/ ___| |  ___|_ _| \\ | |  _ \\| ____|  _ \\  " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  |  _ \\ | || |     | |_   | ||  \\| | | | |  _| | |_) | " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  | |_) || || |___  |  _|  | || |\\  | |_| | |___|  _ <  " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  |____/ |_| \\____| |_|   |___|_| \\_|____/|_____|_| \\_\\ " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "                                                        " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "╚══════════════════════\x1b[32m" + "Investidor Internacional - v0.6" + "\x1b[0m\x1b[38;2;250;128;114m═══╝" + "\x1b[0m");
}

async function menu() {
    let [min, max, key] = await escolherCarteira(`Escolha uma carteira puzzle( ${chalk.cyan(1)} - ${chalk.cyan(161)}): `);
    const answer = await fazerPergunta(`Escolha uma opcao (${chalk.cyan(1)} - Comecar do inicio, ${chalk.cyan(2)} - Escolher uma porcentagem, ${chalk.cyan(3)} - Escolher minimo, ${chalk.cyan(4)} - Dividir em blocos): `);

    switch (answer) {
        case '2':
            [min, max, key] = await escolherPorcentagem(min, max);
            rl.close();

            encontrarBitcoins(key, min, max);
            break;
        case '3':
            [min, key] = await escolherMinimo(min);
            rl.close();

            encontrarBitcoins(key, min, max);
            break;
        case '4':
            const numCPUs = os.cpus().length;
            const numBlocos = parseInt(await fazerPergunta(`Digite o número de blocos para dividir o intervalo (ou pressione Enter para usar ${numCPUs} blocos, com base no número de CPUs disponíveis): `)) || numCPUs;
            const blocos = await escolherPorcentagemBlocos(min, max, numBlocos);
            rl.close();

            const control = { found: false };
            let workers = [];

           
            const criarWorker = (bloco, blocoId) => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker('./src/worker.js');
                    worker.postMessage({ key: bloco.inicio, min: bloco.inicio, max: bloco.fim, blocoId, found: control.found });

                    worker.on('message', (message) => {
                        if (message.found) {
                            control.found = true; 
                            workers.forEach(w => w.terminate()); 
                            resolve();
                        }
                        if (message.completed) {
                            console.log(`Bloco ${message.blocoId} completado sem encontrar chave.`);
                            resolve();
                        }
                    });

                    worker.on('error', reject);
                    worker.on('exit', (code) => {
                        if (code !== 0) {
                            reject();
                        }
                        resolve();
                    });

                    workers.push(worker);
                });
            };

            
            const promises = blocos.map((bloco, index) => criarWorker(bloco, index + 1));

            try {
                await Promise.all(promises);
            } catch (error) {
                return;
            }
            break;
        default:
            min = BigInt(min);
            rl.close();

            encontrarBitcoins(key, min, max, { found: false });
            break;
    }
}

function main() {
    console.clear();
    titulo();
    menu();
}

main();

rl.on('SIGINT', () => {
    console.log("\nFechando Programa!");
    rl.close();
    process.exit();
});

process.on('SIGINT', () => {
    console.log("\nFechando Programa!");
    rl.close();
    process.exit();
});
