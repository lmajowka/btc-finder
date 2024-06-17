import chalk from 'chalk'
import fazerPergunta from './fazerPergunta.js'
import ranges from '../ranges.js'

async function validaEscolherCarteira(pergunta) {
    while (true) {
        const answer = await fazerPergunta(pergunta)
        const number = parseInt(answer)

        if (number > 1 && number < 160) {
            return answer

        } else {
            console.log(chalk.bgRed('Erro: voce precisa escolher um numero entre 1 e 160'))
        }
    }
}

async function escolherCarteira(pergunta) {
    const answer = await validaEscolherCarteira(pergunta)

    let min = ranges[answer - 1].min
    let max = ranges[answer - 1].max

    console.log('Carteira escolhida: ', chalk.cyan(answer), ' Min: ', chalk.yellow(min), ' Max: ', chalk.yellow(max))
    console.log('Numero possivel de chaves:', chalk.yellow(parseInt(BigInt(max) - BigInt(min)).toLocaleString('pt-BR')))

    let status = ''
    if (ranges[answer - 1].status == 1) {
        status = chalk.red('Encontrada')
    } else {
        status = chalk.green('Nao Encontrada')
    }

    console.log('Status: ', status)
    let key = BigInt(min)
    return [min, max, key]
}

export default escolherCarteira
