import CoinKey from 'coinkey';
import walletsArray from './wallets.js';
import chalk from 'chalk'
import fs from 'fs';
const walletsSet = new Set(walletsArray);

function encontrarBitcoins(key, min, max){

    let segundos = 0;
    let pkey = 0;
    const um = BigInt(1);
    const startTime = Date.now()

    console.log('Buscando Bitcoins...')

    while(true){
    
        key = key + um
        
        pkey = key.toString(16)
        while (pkey.length < 64){
            pkey = '0' + pkey
        }
    
    
        if (Date.now() - startTime > segundos){
            segundos += 1000
            console.log(segundos/1000);
            if (segundos % 10000 == 0){
              console.log('Chaves buscadas: ', (key - min).toLocaleString('pt-BR'));    
              console.log('Ultima chave tentada: ',pkey )
            }
        }
    
        let publicKey = generatePublic(pkey)
        if (walletsSet.has(publicKey)){
            const tempo = (Date.now() - startTime)/1000
            console.log('Velocidade:', (Number(key) - Number(min))/ tempo, ' chaves por segundo')
            console.log('Tempo:', tempo, ' segundos');
            console.log('Private key:', chalk.green(pkey))
            console.log('WIF:', chalk.green(generateWIF(pkey)))

            const filePath = 'keys.txt';
            const lineToAppend = `Private key: ${pkey}, WIF: ${generateWIF(pkey)}\n`;

            try {
                fs.appendFileSync(filePath, lineToAppend);
                console.log('Chave escrita no arquivo com sucesso.');
            } catch (err) {
                console.error('Erro ao escrever chave em arquivo:', err);
            }

            throw 'ACHEI!!!! 🎉🎉🎉🎉🎉'
        }
        
    }

}

function generatePublic(privateKey){
    let _key = new CoinKey(new Buffer(privateKey, 'hex'))
    _key.compressed = true
    return _key.publicAddress
}

function generateWIF(privateKey){
    let _key = new CoinKey(new Buffer(privateKey, 'hex'))
    return _key.privateWif
}



export default encontrarBitcoins;