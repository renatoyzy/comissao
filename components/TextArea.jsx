"use client"

import { useEffect, useRef, useState } from "react";

export default function TextArea({}) {
  const [value, setValue] = useState("");
  const wsRef = useRef(null);
  const reconnectCount = useRef(0);
  const sendTimeout = useRef(null);

  useEffect(() => {
    // busca o conteúdo inicial
    fetch("/api/get", { method: "GET", headers: { "Content-Type": "application/json" } })
      .then(r => { if (!r.ok) throw r; return r.json(); })
      .then(result => setValue(result?.content ?? ""))
      .catch(e => { console.error("❌ Erro ao carregar:", e); });
  }, []);

  useEffect(() => {
    // Usando Server-Sent Events (EventSource) para receber atualizações
    // e fetch POST para enviar (broadcast) para o servidor.
    const es = new EventSource('/api/realtime');
    wsRef.current = es; // reuso do ref para simplificar limpeza

    es.onopen = () => {
      reconnectCount.current = 0;
      console.log('SSE conectado');
    };

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.type === 'update' && typeof data.content === 'string') {
          setValue(prev => (prev === data.content ? prev : data.content));
        }
      } catch (err) {
        console.error('mensagem SSE inválida', err);
      }
    };

    es.onerror = (err) => {
      // EventSource faz reconexão automática. Apenas logamos.
      console.error('EventSource error', err);
    };

    return () => {
      try { es.close(); } catch (e) {}
      if (sendTimeout.current) clearTimeout(sendTimeout.current);
    };
  }, []);

  function handleChange(e) {
    const next = e.target.value;
    setValue(next);

    // debounce de envio para reduzir mensagens
    if (sendTimeout.current) clearTimeout(sendTimeout.current);
    sendTimeout.current = setTimeout(() => {
      const payload = JSON.stringify({ type: 'update', content: next });

      // Envia para /api/realtime (o endpoint faz broadcast) e em caso de erro
      // tenta o fallback `/api/save` para persistência.
      fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).then(res => {
        if (!res.ok) throw new Error('failed realtime post');
      }).catch((err) => {
        console.warn('realtime post falhou, tentando /api/save', err);
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        }).catch((err2) => console.error('❌ Erro ao salvar fallback:', err2));
      });
    }, 300);
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={handleChange}
        name="content"
        id="content"
        cols="30"
        rows="10"
      />
    </div>
  );
}