import ranges from './ranges.js'
import encontrarBitcoins from './bitcoin-find.js'
import readline from 'readline'
import chalk from 'chalk'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



let key = 0;
let min, max = 0;

rl.question(`Escolha uma carteira puzzle( ${chalk.cyan(1)} - ${chalk.cyan(160)}): `, (answer) => {
    
    if (parseInt(answer) < 1 || parseInt(answer) > 160) {
        console.log(chalk.bgRed('Erro: voce precisa escolher um numero entre 1 e 160'))
    }

    min = ranges[answer-1].min
    max = ranges[answer-1].max
    console.log('Carteira escolhida: ', chalk.cyan(answer), ' Min: ', chalk.yellow(min), ' Max: ', chalk.yellow(max) )
    console.log('Numero possivel de chaves:',  chalk.yellow(parseInt(BigInt(max) - BigInt(min)).toLocaleString('pt-BR')))
    key = BigInt(min)
    
    rl.question(`Escolha uma opcao (${chalk.cyan(1)} - Comecar do inicio, ${chalk.cyan(2)} - Escolher uma porcentagem, ${chalk.cyan(3)} - Escolher minimo): `, (answer2) => {
        if (answer2 == '2'){
            rl.question('Escolha um numero entre 0 e 1: ', (answer3) => {
                if (parseFloat(answer3) > 1 || parseFloat(answer3) < 0) {
                    console.log(chalk.bgRed('Erro: voce precisa escolher um numero entre 0 e 1'))
                    throw 'Numero invalido'
                }


                const range = BigInt(max) - BigInt(min);
                const percentualRange = range * BigInt(Math.floor(parseFloat(answer3) * 1e18)) / BigInt(1e18);
                min = BigInt(min) + BigInt(percentualRange);
                console.log('Comecando em: ', chalk.yellow('0x'+min.toString(16)));
                key = BigInt(min)
                encontrarBitcoins(key, min, max)
                rl.close();
            });
        } else if (answer2 == '3'){
            rl.question('Entre o minimo: ', (answer3) => {
                min = answer3
                key = BigInt(min)
                encontrarBitcoins(key, min, max)
                rl.close();
            });
        } else {
            min = BigInt(min)
            encontrarBitcoins(key, min, max)
            rl.close();
        }
    })
});

rl.on('SIGINT', () => {

    rl.close();
    process.exit();
});



// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log(chalk.yellow('\nGracefully shutting down from SIGINT (Ctrl+C)'));
    rl.close();
    process.exit();
});