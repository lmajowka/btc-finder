import chalk from 'chalk';

async function escolherPorcentagemBlocos(min, max, numBlocos) {
    const range = BigInt(max) - BigInt(min);

   
    const tamanhoBloco = range / BigInt(numBlocos);

    const blocos = [];

    for (let i = 0; i < numBlocos; i++) {
        const blocoInicio = BigInt(min) + tamanhoBloco * BigInt(i);
        const blocoFim = (i === numBlocos - 1) ? BigInt(max) : blocoInicio + tamanhoBloco - BigInt(1);

        blocos.push({ inicio: blocoInicio, fim: blocoFim });
    }

    blocos.forEach((bloco, index) => {
        console.log(`Bloco ${index + 1}:`);
        console.log('Início:', chalk.yellow('0x' + bloco.inicio.toString(16)));
        console.log('Fim:', chalk.yellow('0x' + bloco.fim.toString(16)));
        console.log('Intervalo:', (bloco.fim - bloco.inicio + BigInt(1)).toLocaleString('pt-BR'));
    });

    return blocos;
}

export default escolherPorcentagemBlocos;
