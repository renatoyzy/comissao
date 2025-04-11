// Importações
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ngrok = require("@ngrok/ngrok");
require('dotenv').config();

// Definições
const app = express();
const port = process.env.BACKEND_PORTA; 

// Configuração do CORS para permitir o frontend específico
const corsOptions = {
    origin: 'https://dfmrenato.github.io', // Permite requisições apenas deste site
    methods: 'GET,POST', // Métodos permitidos
    allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions)); // Middleware principal de CORS

// Permite requisições preflight (importante para o navegador validar permissões antes da requisição real)
app.options('*', cors(corsOptions));

// Middleware para aceitar JSON
app.use(express.json());

// Conectar ao MongoDB usando o link de conexão fornecido
const uri = process.env.MONGODB_URI;

// Conectar ao MongoDB
const client = MongoClient.connect(uri);
client.then((client) => {
    db = client.db('comissao');  // Acessa o banco de dados padrão
    console.log('Conectado ao MongoDB');
}).catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
});

// Rota de exemplo
app.get('/', (req, res) => {
    res.send('Olá, mundo! Conectado ao MongoDB!');
});

// Ngrok
(async () => {
    // Conectar
    const listener = await ngrok.forward({
        addr: process.env,
        authtoken: process.env.NGROK_AUTHTOKEN,
        domain: process.env.NGROK_DOMAIN
    });
  
    // Avisar
    console.log(`Ngrok conectado`);
})();

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
process.on('uncaughtException', (error) => {
    return console.error(`Exceção não capturada: `+error);
});