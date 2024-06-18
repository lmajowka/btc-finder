import fazerPergunta from './fazerPergunta.js'

function addPrefixMin(answer) {
    const input = answer.replace(/^0x/i, ''); // remove '0x' prefix
    return BigInt('0x' + input.toUpperCase());
}

async function escolherMinimo(min) {
    const answer = await fazerPergunta('Entre o minimo: ')

    min = addPrefixMin(answer);
    let key = BigInt(min)

    return [min, key]
}

export default escolherMinimo