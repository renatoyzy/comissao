import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método não permitido' });

  const client = new MongoClient(String(process.env.MONGODB_URI), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {

    await client.connect();

    const produtos = await client.db('comissao').collection('produtos').find().toArray();

    return res.status(201).json({ produtos });

  } catch (error) {
    console.error('Erro ao obter estoque:', error);
    return res.status(500).json({ error_message: error.message });
  } finally {
    await client.close();
  }
}
