import { MongoClient, ServerApiVersion } from "mongodb";
import xlsx from "xlsx";
import stream from "stream";

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

  const dados = await client.db('comissao').collection('vendas').find({}).toArray();

  if (dados.length === 0) {
    return res.status(404).send('Nenhum dado encontrado.');
  };

  try {

    // Gera o Excel na memória
    const worksheet = xlsx.utils.json_to_sheet(dados);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dados');

    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Envia o arquivo como download
    res.setHeader('Content-Disposition', `attachment; filename=Planilha de vendas ${new Date().toLocaleDateString('pt-BR', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replaceAll('/', '.')}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const readStream = new stream.PassThrough();
    readStream.end(excelBuffer);
    readStream.pipe(res);

  } catch (error) {
    console.error('Erro ao baixar tabela de vendas:', error);
    res.status(500).json({ error_message: error.message });
  } finally {
    await client.close();
  }
}
