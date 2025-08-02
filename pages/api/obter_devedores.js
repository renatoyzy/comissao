import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método não permitido' });

  await client.connect();

  try {

    const devedores = await client.db('comissao').collection('devedores').find().toArray();

    return res.status(201).json({ devedores });

  } catch (error) {
    console.error('Erro ao obter devedores:', error);
    return res.status(500).json({ error_message: error.message });
  } finally {
    await client.close();
  }
}
