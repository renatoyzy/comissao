import { MongoClient, ServerApiVersion } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse<ResponseData>} res 
 */
export async function POST(req, res) {
    return new Response('Método incorreto.', {
        status: 405,
        headers: { "Content-Type": "application/json" },
    })
}

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse<ResponseData>} res 
 */
export async function GET(req, res) {
    try {
        await client.connect();

        const annotation = await client.db('comissao').collection('anotacao').findOne({ anotacao: true });

        return new Response(JSON.stringify({ 
            content: annotation.content, 
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error('❌ Erro:', error);
        
        return new Response(JSON.stringify({ 
            error: error.message || 'Erro desconhecido' 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    } finally {
        await client.close();
    }
}