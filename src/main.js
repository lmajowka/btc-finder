import chalk from 'chalk';
import {
    fazerPergunta, rl,
    escolherCarteira,
    escolherMinimo,
    escolherPorcentagem,
    escolherNumWorkers,
    createWorker
} from './utils/index.js';

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
    const answer = await fazerPergunta(`Escolha uma opção (${chalk.cyan(1)} - Começar do início, ${chalk.cyan(2)} - Escolher uma porcentagem, ${chalk.cyan(3)} - Escolher mínimo): `);

    switch (answer) {
        case '2':
            [min, max, key] = await escolherPorcentagem(min, max);
            key = min;
            break;
        case '3':
            [min, key] = await escolherMinimo(min);
            break;
        default:
            min = BigInt(min);
            break;
    }

    const numWorkers = await escolherNumWorkers();
    const range = BigInt(max) - BigInt(min);
    const rangePerWorker = range / BigInt(numWorkers);

    console.log(`Iniciando ${chalk.blue(numWorkers)} workers para buscar chaves no intervalo de ${chalk.cyan(min)} a ${chalk.cyan(max)}`);

    const workerPromises = [];
    let totalKeysProcessed = BigInt(0);
    const startTime = Date.now();
    const workerProgress = Array(numWorkers).fill(BigInt(0));
    let lastKey = '';
    let foundKey = '';
    let foundWIF = '';
    let found = false;

    global.progressCallback = (workerId, key, pkey) => {
        workerProgress[workerId] = key - BigInt(min);
        totalKeysProcessed = workerProgress.reduce((acc, val) => acc + val, BigInt(0));
        lastKey = pkey;

        const tempo = (Date.now() - startTime) / 1000;
        if (!found) {
            console.clear();
            console.log('Resumo: ');
            console.log('Tempo:', tempo.toFixed(2), 'segundos');
            console.log('Chaves processadas:', totalKeysProcessed.toLocaleString('pt-BR'));
            console.log('Última chave tentada:', lastKey);
            if (foundKey) {
                console.log('Private key:', foundKey);
                console.log('WIF:', foundWIF);
            }

            const chavesPorSegundo = Number(totalKeysProcessed) / tempo;
            console.log('Velocidade:', chavesPorSegundo.toFixed(2), ' chaves por segundo');
        }
    };

    for (let i = 0; i < numWorkers; i++) {
        const workerMin = BigInt(min) + rangePerWorker * BigInt(i);
        const workerMax = (i === numWorkers - 1) ? BigInt(max) : workerMin + rangePerWorker - BigInt(1);

        console.log(`Worker ${chalk.blue(i + 1)}: processando intervalo de ${chalk.cyan(workerMin)} a ${chalk.cyan(workerMax)}`);

        const workerPromise = createWorker(workerMin, workerMax, i);
        workerPromises.push(workerPromise);
    }

    process.on('message', (message) => {
        if (message.type === 'ACHEI') {
            foundKey = message.pkey;
            foundWIF = message.wif;
            found = true;

            for (const worker of workerPromises) {
                worker.postMessage('STOP');
            }

            console.log('Resumo Final: ');
            console.log('Private key:', foundKey);
            console.log('WIF:', foundWIF);
            console.log('Tempo total:', ((Date.now() - startTime) / 1000).toFixed(2), 'segundos');
            console.log('Total de chaves processadas:', totalKeysProcessed.toLocaleString('pt-BR'));
            console.log('Última chave tentada:', lastKey);
            console.log('Velocidade média:', (Number(totalKeysProcessed) / ((Date.now() - startTime) / 1000)).toFixed(2), ' chaves por segundo');
        }
    });

    await Promise.all(workerPromises);

    if (!found) {
        console.log('Todos os workers concluíram a busca.');
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
