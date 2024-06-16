import ranges from './src/impl/ranges.js';
import encontrarBitcoins from './src/impl/bitcoin-find.js';
import readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let shouldStop = false;

console.clear();

console.log("\x1b[38;2;250;128;114m" + "╔════════════════════════════════════════════════════════╗\n" +
            "║" + "\x1b[0m" + "\x1b[36m" + "   ____ _____ ____   _____ ___ _   _ ____  _____ ____   " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
            "║" + "\x1b[0m" + "\x1b[36m" + "  | __ )_   _/ ___| |  ___|_ _| \\ | |  _ \\| ____|  _ \\  " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
            "║" + "\x1b[0m" + "\x1b[36m" + "  |  _ \\ | || |     | |_   | ||  \\| | | | |  _| | |_) | " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
            "║" + "\x1b[0m" + "\x1b[36m" + "  | |_) || || |___  |  _|  | || |\\  | |_| | |___|  _ <  " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
            "║" + "\x1b[0m" + "\x1b[36m" + "  |____/ |_| \\____| |_|   |___|_| \\_|____/|_____|_| \\_\\ " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
            "║" + "\x1b[0m" + "\x1b[36m" + "                                                        " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
            "╚══════════════════════\x1b[32m" + "Investidor Internacional - v0.5" + "\x1b[0m\x1b[38;2;250;128;114m═══╝" + "\x1b[0m");

rl.question(`Escolha uma carteira puzzle( ${chalk.cyan(1)} - ${chalk.cyan(160)}): `, (answer) => {
    
    if (parseInt(answer) < 1 || parseInt(answer) > 160) {
        console.log(chalk.bgRed('Erro: você precisa escolher um número entre 1 e 160'));
        rl.close();
        return;
    }

    let min = ranges[answer - 1].min;
    let max = ranges[answer - 1].max;
    console.log('Carteira escolhida: ', chalk.cyan(answer), ' Min: ', chalk.yellow(min), ' Max: ', chalk.yellow(max));
    console.log('Número possível de chaves:', chalk.yellow(parseInt(max - min).toLocaleString('pt-BR')));
    let status = ranges[answer - 1].status === 1 ? chalk.red('Encontrada') : chalk.green('Não Encontrada');
    console.log('Status: ', status);

    rl.question(`Escolha uma opção (${chalk.cyan(1)} - Começar do início, ${chalk.cyan(2)} - Escolher uma porcentagem, ${chalk.cyan(3)} - Escolher mínimo): `, (answer2) => {
        if (answer2 === '2') {
            rl.question('Escolha um número entre 0 e 1: ', (answer3) => {
                const percent = parseFloat(answer3);
                if (isNaN(percent) || percent < 0 || percent > 1) {
                    console.log(chalk.bgRed('Erro: você precisa escolher um número entre 0 e 1'));
                    rl.close();
                    return;
                }

                const range = max - min;
                const start = min + BigInt(Math.floor(percent * parseFloat(range)));
                console.log('Começando em: ', chalk.yellow('0x' + start.toString(16)));
                encontrarBitcoins(start, min, max, () => shouldStop);
                rl.close();
            });
        } else if (answer2 === '3') {
            rl.question('Entre o mínimo: ', (answer3) => {
                // Remover qualquer prefixo '0x' e converter para BigInt
                const input = answer3.replace(/^0x/i, ''); // remove '0x' prefix
                const start = BigInt('0x' + input); // convert hex string to BigInt
                console.log('Começando em: ', chalk.yellow('0x' + start.toString(16)));
                encontrarBitcoins(start, min, max, () => shouldStop);
                rl.close();
            });
        } else {
            console.log('Começando do início');
            encontrarBitcoins(min, min, max, () => shouldStop);
            rl.close();
        }
    });
});

rl.on('SIGINT', () => {
    shouldStop = true;
    rl.close();
    process.exit();
});

process.on('SIGINT', () => {
    shouldStop = true;
    rl.close();
    process.exit();
});
