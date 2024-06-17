import rl from './readInterface.js'

export default function fazerPergunta(pergunta) {
    return new Promise((resolve) => rl.question(pergunta, resolve))
}