var CoinKey = require('coinkey')

const min = 0x2126875fd00000000
const max = 0x3ffffffffffffffff

const wallets = ['13zb1hQbWVsc2S7ZTZnP2G4undNNpdh5so']

let key = BigInt(min)

console.log(key)

while(true){

    key = key + BigInt(parseInt(1))
    pkey = key.toString(16)
    while (pkey.length < 64){
        pkey = '0' + pkey
    }

    public = generatePublic(pkey)
    console.log(pkey)
    console.log(public)
    for (i=0;i<wallets.length;i++){
        if (public == wallets[i]){
            throw 'ACHEI!!!! 🎉🎉🎉🎉🎉'
        }
    }
}


function generatePublic(privateKey){
    _key = new CoinKey(new Buffer(privateKey, 'hex'))
    _key.compressed = true
    return _key.publicAddress
}