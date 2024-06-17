import fazerPergunta from './fazerPergunta.js'

async function escolherMinimo(min) {
    const answer = await fazerPergunta('Entre o minimo: ')

    min = BigInt(answer);
    let key = BigInt(min)
    return [min, key]
}

export default escolherMinimo