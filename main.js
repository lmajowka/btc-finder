import chalk from 'chalk'
import encontrarBitcoins from './bitcoin-find.js'
import {
    fazerPergunta, rl,
    escolherCarteira,
    escolherMinimo,
    escolherPorcentagem
} from './utils/index.js'

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
    let [min, max, key] = await escolherCarteira(`Escolha uma carteira puzzle( ${chalk.cyan(1)} - ${chalk.cyan(160)}): `)
    const answer = await fazerPergunta(`Escolha uma opcao (${chalk.cyan(1)} - Comecar do inicio, ${chalk.cyan(2)} - Escolher uma porcentagem, ${chalk.cyan(3)} - Escolher minimo): `)

    switch (answer) {
        case '2':
            [min, max, key] = await escolherPorcentagem(min, max)
            rl.close()

            key = min;

            encontrarBitcoins(key, min, max)
            break
        case '3':
            [min, key] = await escolherMinimo(min)
            rl.close();

            encontrarBitcoins(key, min, max)
            break
        default:
            min = BigInt(min)
            rl.close();

            encontrarBitcoins(key, min, max)
            break
    }
}

function main() {
    console.clear()
    titulo()
    menu()
}

main()


rl.on('SIGINT', () => {
    console.log("\nFechando Programa!")
    rl.close();
    process.exit();
});

// process.on('SIGINT', () => {
//     console.log("\nFechando Programa!")
//     rl.close();
//     process.exit();
// });