import CoinKey from 'coinkey';

export function generatePublic(privateKey) {
    let _key = new CoinKey(Buffer.from(privateKey, 'hex'));
    _key.compressed = true;
    return _key.publicAddress;
}

export function generateWIF(privateKey) {
    let _key = new CoinKey(Buffer.from(privateKey, 'hex'));
    return _key.privateWif;
}