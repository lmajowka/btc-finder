# Instruções para rodar o projeto

## Requisitos
  -  [NODE][install-node]
  -  [NPM][install-npm]

[![instalação do Node.js no Windows](https://img.youtube.com/vi/3bDtzMzaaCw/0.jpg)](https://www.youtube.com/watch?v=3bDtzMzaaCw)


## Execução do projeto (na maquina)
Execute os seguintes comandos no terminal:
 * Clone o repositório:
  ``` git clone git@github.com:lmajowka/btc-finder.git ```
 * Entre na pasta do projeto:
  ``` cd btc-finder ```
 * Instale as dependências:
 ``` npm install ```
 * Execute o projeto:
 ``` npm start ```

## Execução do projeto (em container)
## Requisitos
  -  [Docker][install-docker]
  -  [Docker-compose][install-dockercompose]

## É fácil como voar, siga os passos:
 * Clona o repo:
  ``` git clone git@github.com:lmajowka/btc-finder.git && cd btc-finder```
 * Build do Dockerfile:
   ``` docker buildx build --no-cache -t btc-finder .```
 * Executa a imagem contruída no passo anterior:
   ``` docker run -it --name btc-finder -p 3000:3000 btc-finder```



[install-node]: https://nodejs.org/en/download/
[install-npm]: https://www.npmjs.com/get-npm
[install-docker]: https://www.docker.com/get-started/
[install-dockercompose]: https://docs.docker.com/compose/install/