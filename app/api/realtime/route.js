// Simple SSE (Server-Sent Events) broadcast endpoint.
// NOTE: This keeps clients in memory and will only broadcast to clients
// connected to the same server instance. On Vercel this means it will not
// work across multiple serverless instances in production — for that use a
// dedicated real-time service (Supabase Realtime, Pusher, Ably, etc.).

import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let clients = [];

function sendToAll(data) {
  for (const c of clients) {
    try {
      c.send(data);
    } catch (e) {
      // ignore write errors; client removal happens on abort
      console.warn('failed send to client', e);
    }
  }
}

export async function GET(req) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const id = Math.random().toString(36).slice(2);

      const send = (data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // enqueue may fail if controller closed
        }
      };

      clients.push({ id, send });

      // send a comment line to confirm connection (and avoid some proxies timing out)
      controller.enqueue(encoder.encode(': connected\n\n'));

      // heartbeat every 15s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(': heartbeat\n\n')); } catch (e) {}
      }, 15000);

      // cleanup when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clients = clients.filter(c => c.id !== id);
        try { controller.close(); } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    // Broadcast to all connected clients
    sendToAll(body);
    // Persist as well (same behavior as /api/save)
    try {
      await client.connect();
      await client.db('comissao').collection('anotacao').findOneAndUpdate(
        { anotacao: true },
        { $set: { anotacao: true, content: body.content } },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (dbErr) {
      console.error('❌ Erro ao salvar no DB (realtime):', dbErr);
      // continue — we already broadcasted; return still OK but include db error
      return new Response(JSON.stringify({ ok: true, dbError: String(dbErr) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } finally {
      try { await client.close(); } catch (e) {}
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
