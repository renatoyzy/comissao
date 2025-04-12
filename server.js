// Importações
const express = require('express');
const { MongoClient, Db } = require('mongodb');
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
//let db = (await client).db('comissao');

// Rota de exemplo
app.get('/', (req, res) => {
    res.send('Olá, mundo! Conectado ao MongoDB!');
});

// Adicionar estoque de produto
app.post('/adicionar-estoque', async (req, res) => {
    const { nome, quantidade, data_criacao } = req.body;

    try {
        if (!nome || !quantidade || !data_criacao) {
            return res.status(400).json({ error_message: 'Todos os dados são obrigatórios' });
        }

        // Verifica se produto já existe no banco de dados
        if (await db.collection('produtos').findOne({ nome })) {
            
            db.collection('produtos').findOne({ nome }).then(produto_original => {

                let quantia_antiga = produto_original.quantidade;

                db.collection('produtos').deleteOne({ nome }).then(async () => {

                    db.collection('produtos').insertOne({ nome, quantidade: parseInt(quantidade)+parseInt(quantia_antiga) }).then(result => {
                        console.log(`${data_criacao} Produto modificado: ${result.insertedId}`);
                    });

                    res.status(201).json({ certo: true });

                });
            })

        } else {

            db.collection('produtos').insertOne({ nome, quantidade: parseInt(quantidade) }).then(result => {
                console.log(`${data_criacao} Produto inserido: ${result.insertedId}`);
            });
            res.status(201).json({ certo: true });

        }

    } catch (error) {
        console.error('Erro ao adicionar estoque:', error);
        res.status(500).json({ error_message: error.message });
    }
});

// Obter estoque de produto
app.post('/obter-estoque', async (req, res) => {

    try {

        // Verifica se produto já existe no banco de dados
        let produtos = db.collection('produtos').find().toArray().then(produtos => {
            res.status(201).json({ produtos });
        })

    } catch (error) {
        console.error('Erro ao obter estoque:', error);
        res.status(500).json({ error_message: error.message });
    }
});

// Registrar venda de produto
app.post('/registrar-venda', async (req, res) => {
    const { nome, produto, quantidade, valor, vendedor, data_venda } = req.body;

    try {
        if (!nome || !produto || !quantidade || !valor || !vendedor || !data_venda) {
            return res.status(400).json({ error_message: 'Todos os dados são obrigatórios' });
        }

        db.collection('vendas').insertOne({ nome, produto, quantidade, valor, vendedor, data_venda }).then(result => {
            console.log(`${data_venda} Venda inserida: ${result.insertedId}`);
            
            db.collection('produtos').findOne({ nome: produto }).then(produto_achado => {
                let novo_nome = produto_achado.nome;
                let nova_quantidade = parseInt(produto_achado.quantidade)-parseInt(quantidade);
                let nova_data = new Date();

                db.collection('produtos').deleteOne({ nome: produto }).then(() => {
                    db.collection('produtos').insertOne({ nome: novo_nome, quantidade: nova_quantidade});
                });
            });

        });

        res.status(201).json({ certo: true });


    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        res.status(500).json({ error_message: error.message });
    }
});

// Ngrok
(async () => {
    // Conectar
    const listener = await ngrok.forward({
        addr: port,
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