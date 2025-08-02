import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });
  
  let { nome, icone, quantidade, data_criacao, valor_da_unidade } = req.body;

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
      if (!nome || !data_criacao) {
          return res.status(400).json({ error_message: 'Todos os dados são obrigatórios' });
      };

      if(!quantidade) quantidade = 0;

      await client.connect();

      const alreadyExists = await client.db('comissao').collection('produtos').findOne({ nome });
      if(!alreadyExists && !valor_da_unidade) return res.status(500).json({ error_message: 'Se o produto a adicionar é novo, deve-se especificar o preço.' });
      
      const result = await client.db('comissao').collection('produtos').findOneAndUpdate(
        { nome },
        { $set: {
            nome,
            icone: icone || alreadyExists?.icone || '',
            valor_da_unidade: parseFloat(valor_da_unidade) || parseFloat(alreadyExists?.valor_da_unidade)
          },
          $inc: {
            quantidade: parseInt(quantidade),
          }
        },
        { returnDocument: "after", upsert: true }
      )

      console.log(`${data_criacao} Produto modificado: ${result.insertedId}`);

      res.status(201).json({ certo: true });

  } catch (error) {
    console.error('Erro ao adicionar estoque:', error);
    res.status(500).json({ error_message: error.message });
  } finally {
    await client.close();
  }
}
