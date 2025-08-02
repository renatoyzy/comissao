import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

    const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        },
    });

    let { nome, produto, quantidade, valor, metodo_de_pagamento, fiado, vendedor, data_venda } = req.body;

    try {
        if (!nome || !produto || !quantidade || !metodo_de_pagamento || !fiado || !vendedor || !data_venda) {
            return res.status(400).json({ error_message: 'Todos os dados são obrigatórios' });
        };

        if(fiado=="SIM") metodo_de_pagamento = "-";
        if(metodo_de_pagamento == "GRATIS") metodo_de_pagamento = "-";

        await client.connect();

        const produto_achado = await client.db('comissao').collection('produtos').findOne({ nome: produto });

        if(valor == null) valor = (parseFloat(produto_achado.valor_da_unidade) * parseInt(quantidade));

        const result = await client.db('comissao').collection('vendas').insertOne({ nome, produto, quantidade, valor, metodo_de_pagamento, fiado, vendedor, data_venda });

        console.log(`${data_venda} Venda inserida: ${result.insertedId}`);

        client.db('comissao').collection('produtos').findOneAndUpdate(
            { nome: produto },
            { $inc: { quantidade: -parseInt(quantidade) } },
            { returnDocument: "after", upsert: true }
        );

        if(fiado == "SIM") {
            await client.db('comissao').collection('devedores').findOneAndUpdate(
                { nome },
                { $set: { nome, ultimo_fiado: data_venda }, $inc: { divida: valor } },
                { returnDocument: "after", upsert: true }
            );
        };

        return res.status(201).json({ certo: true });

    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        return res.status(500).json({ error_message: error.message });
    } finally {
        client.close();
    }
}