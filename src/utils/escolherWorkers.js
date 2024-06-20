import chalk from 'chalk'
import fazerPergunta from './fazerPergunta.js'
import { cpus } from 'os';

async function escolherNumWorkers() {
    const numCPUs = cpus().length;

    const usarWorkers = await fazerPergunta(`Deseja ativar workers? (${chalk.cyan(1)} Sim - ${chalk.cyan(0)} Não): `);

    if (parseInt(usarWorkers) === 1) {
        while (true) {
            const answer = await fazerPergunta(`Escolha o número de workers (${chalk.cyan(1)} a ${chalk.cyan(numCPUs)}): `);
            const numWorkers = parseInt(answer);

            if (numWorkers >= 1 && numWorkers <= numCPUs) {
                return numWorkers;
            } else {
                console.log(chalk.bgRed(`Erro: você precisa escolher um número entre 1 e ${numCPUs}`));
            }
        }
    } else {
        return 1;
    }
}

export default escolherNumWorkers;