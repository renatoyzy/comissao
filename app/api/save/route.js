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
    try {
        const body = await req.json();
        
        console.log('📦 Body recebido:', body);

        await client.connect();

        await client.db('comissao').collection('anotacao').findOneAndUpdate(
            { anotacao: true },
            {$set: {anotacao: true, content: body.content}},
            {upsert: true, returnDocument: 'after'}
        );

        return new Response(JSON.stringify({ 
            message: 'Salvo com sucesso!', 
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

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse<ResponseData>} res 
 */
export async function GET(req, res) {
    return new Response('Método incorreto.', {
        status: 405,
        headers: { "Content-Type": "application/json" },
    })
}