import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as socketIo } from 'socket.io';
import fs from 'fs';
import axios from 'axios';
import basicAuth from 'express-basic-auth';
import { promisify } from 'util';
import { generatePublic } from '../src/utils/generators.js';

let cache = { saldo: null, timestamp: 0, numChaves: 0 };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

const port = 3000;

let authMiddleware;

const perguntarParaIniciarInterface = (rl) => {
  //As credencias de usuário e senha servem para conseguir acessar as chaves privadas e evitar que qualquer pessoa da rede seja capaz de ter acesso as chaves.
  return new Promise((resolve, reject) => {

    rl.question('[beta] Deseja iniciar a interface web? (s/n) [n]: ', (resposta) => {
      const respostaNormalizada = resposta.trim().toLowerCase();
      if (respostaNormalizada === 's' || respostaNormalizada === 'sim') {
        rl.question('Crie um nome de usuário: ', (username) => {
          rl.question('Crie uma senha: ', (password) => {
            authMiddleware = basicAuth({
              users: { [username]: password },
              challenge: true,
              unauthorizedResponse: (req) => (req.auth ? 'Credenciais inválidas' : 'Necessário fornecer credenciais'),
            });
            resolve(true);
          });
        });
      } else {
        resolve(false);
      }
    });
  });
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/keys', (req, res, next) => {
  if (authMiddleware) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
}, (req, res) => {
  const filePath = path.join(__dirname, '../keys.txt');
  const chavesWIF = lerChavesWIF(filePath);
  res.render('keys', { keys: chavesWIF ? chavesWIF : [] });
});

io.on('connection', (socket) => {
  descobrirSaldoNasCarteiras().then((saldo) => {
    enviarSaldoAtualizado(socket, saldo);
  });
  enviarCarteirasEncontradas(socket);
});

const enviarSaldoAtualizado = (socket, saldo) => {
  socket.emit('saldoAtualizado', saldo.trim());
};

const enviarCarteirasEncontradas = (socket) => {
  const filePath = path.join(__dirname, '../keys.txt');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('O arquivo não foi encontrado:', err);
      } else {
        console.error('Erro ao ler o arquivo:', err);
      }
      const numChaves = 0;
      socket.emit('carteirasEncontradas', numChaves);
      return;
    }

    const chavesPrivadas = lerChavesPrivadas(filePath);
    const numChaves = chavesPrivadas.length;

    socket.emit('carteirasEncontradas', numChaves);
  });
};


const lerChavesPrivadas = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const linhas = content.split('\n');
    const chavesPrivadas = [];

    linhas.forEach((linha) => {
      const match = linha.match(/Private key: ([a-fA-F0-9]+)/);
      if (match) {
        const chavePrivada = match[1];
        chavesPrivadas.push(chavePrivada);
      }
    });

    return chavesPrivadas;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('O arquivo não foi encontrado:', error);
    } else {
      console.error('Erro ao ler o arquivo:', error);
    }
    return [];
  }
};

const lerChavesWIF = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const linhas = content.split('\n');
  const chavesWIF = [];

  linhas.forEach((linha) => {
    const match = linha.match(/WIF: ([A-Za-z0-9]+)/);
    if (match) {
      const chaveWIF = match[1];
      chavesWIF.push(chaveWIF);
    }
  });

  return chavesWIF;
};

const buscarSaldos = async (enderecosParaConsulta) => {
  try {
    //Essa requisição não é perigosa, ela envia os endereços das chaves encontradas para conseguir o saldo em bitcoin de cada uma delas
    const response = await axios.get(`https://blockchain.info/balance?active=${enderecosParaConsulta}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar saldos:', error);
  }
};

const descobrirSaldoNasCarteiras = async () => {
  const filePath = path.join(__dirname, '../keys.txt');
  const chavesPrivadas = lerChavesPrivadas(filePath);
  const numChaves = chavesPrivadas.length;

  const now = Date.now();
  if (cache.saldo !== null && now - cache.timestamp < 60000 && cache.numChaves === numChaves) {
    return cache.saldo;
  }

  const chavesPublicas = chavesPrivadas.map((chavePrivada) => generatePublic(chavePrivada));
  const enderecosParaConsulta = chavesPublicas.join(',');
  const dados = await buscarSaldos(enderecosParaConsulta);

  let somaFinalBalance = 0;
  for (const endereco in dados) {
    if (dados.hasOwnProperty(endereco)) {
      somaFinalBalance += dados[endereco].final_balance;
    }
  }

  const resultadoEmBitcoin = somaFinalBalance / 1e8;
  const saldoArredondado = resultadoEmBitcoin.toFixed(2);

  const saldoFilePath = path.join(__dirname, '../saldo.txt');
  fs.writeFileSync(saldoFilePath, saldoArredondado, 'utf8');

  cache = { saldo: saldoArredondado, timestamp: now, numChaves: numChaves };

  return saldoArredondado;
};

const monitorarKeys = () => {
  const filePath = path.join(__dirname, '../keys.txt');

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      fs.writeFileSync(filePath, '', 'utf8');
    }

    fs.watch(filePath, (eventType, filename) => {
      if (filename && eventType === 'change') {
        enviarCarteirasEncontradas(io);
        descobrirSaldoNasCarteiras().then((saldo) => {
          enviarSaldoAtualizado(io, saldo);
        });
      }
    });
  });
};


const listenAsync = promisify(server.listen).bind(server);

export const iniciarServidor = async (rl) => {
  const iniciarInterface = await perguntarParaIniciarInterface(rl);
  if (iniciarInterface) {
    monitorarKeys();
    try {
      await listenAsync(port);
      console.log(`[beta] Servidor rodando em http://localhost:${port}`);
    } catch (error) {
      console.error('Erro ao iniciar o servidor:', error);
    }
  } else {
    console.log('Interface web não iniciada.');
  }
};


