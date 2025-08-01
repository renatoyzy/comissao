import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { devedor, valor } = req.body;

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    if (!devedor || !valor) {
      return res.status(400).json({ error_message: 'Todos os dados são obrigatórios' });
    }

    await client.connect();
    
    const devedor_achado = await client.db('comissao').collection('devedores').findOne({ nome: devedor });

    if (!devedor_achado) return res.status(404).json({ error_message: 'Devedor não encontrado no banco.' });

    if (devedor_achado.divida - valor > 0) {
      await client.db('comissao').collection('devedores').findOneAndUpdate(
        { nome: devedor_achado.nome },
        { $inc: { divida: -valor } },
        { returnDocument: "after", upsert: true }
      );
    } else {
      await client.db('comissao').collection('devedores').deleteOne({ nome: devedor_achado.nome });
    }

    return res.status(201).json({ certo: true });

  } catch (error) {
    console.error('Erro ao pagar dívida:', error);
    res.status(500).json({ error_message: error.message });
  } finally {
    await client.close();
  }
}
