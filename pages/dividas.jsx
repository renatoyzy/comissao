import Head from "@/components/Head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";

export default function Dividas() {
  const [seller, setSeller] = useState('');
  const [debtors, setDebtors] = useState(undefined);

  // Definir vendedor
  useEffect(() => {
    if (typeof window == 'undefined') return;

    const storedSeller = sessionStorage.getItem('vendedor');

    if (storedSeller) {
      setSeller(storedSeller);
    } else {
      window.location.href = "identificar";
    }
  }, []);

  // Definir devedores
  useEffect(() => {
    async function retrieveDebtors() {
      try {
        // Comunicação com o backend
        let response = await fetch('/api/obter_devedores', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        let data = await response.json();

        if (data.error_message) return typeof window !== 'undefined' && window.alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
          throw new Error('Falha na solicitação');
        }

        return setDebtors(data.devedores.sort((a, b) => a.nome.localeCompare(b.nome)));

      } catch (error) {
        console.error(error);
        typeof window !== 'undefined' && window.alert(`Erro ao tentar comunicação\n${error}`);
      }
    }
    retrieveDebtors();
  }, []);

  /**
   * Manuseio do formulário
   * @param {Event} e 
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const devedor = data["devedor"];
    const valor = parseFloat(data["valor"]);

    try {
      // Comunicação com o backend
      const response = await fetch('/api/pagar_divida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devedor, valor })
      });

      const data = await response.json();

      if (data.error_message) return alert(`Erro de comunicação\n${data.error_message}`);

      if (!response.ok) {
        throw new Error('Falha na solicitação');
      }

      location.reload();

    } catch (error) {
      console.error(error);
      alert(`Erro ao tentar comunicação\n${error}`);
    }

  }

  return (
    <>
      <Head />

      <Header />

      <main>

        <div className="CorpoElemento">
          <h1>Pagar dívida</h1>
          <form id="FormularioPagarDivida" onSubmit={handleFormSubmit}>
            <label htmlFor="NomeDevedorPagando">Nome</label>
            <select name="devedor" id="NomeDevedorPagando" required>
              {
                debtors?.map(debtor => <option value={debtor.nome} key={debtor.nome}>{debtor.nome}</option>) || <option value="volvo">Aguarde...</option>
              }
            </select>
            <label htmlFor="ValorDivida">Valor pago</label>
            <input placeholder="0,00" type="text" name="valor" id="ValorDivida" required />
            <input type="submit" className="BotaoPrimario" value="Pagar" />
          </form>
        </div>

        <div className="CorpoElemento">
          <div className="ScrollContent">
            <h1>Devedores</h1>

            <p id="CampoDevedoresDb">
              {
                debtors?.map(debtor => <>- {debtor.nome}: R${debtor.divida}<br /></>) || <span className="Carregando ElementoCentral"></span>
              }
            </p>

            <a className="BotaoPrimario" href="/api/planilha_devedores">Baixar planilha de cobrança</a>
          </div>
        </div>

      </main>

      <p id="Copyright">64.99324-9400 © Site feito pelo Renato (2025)</p>
    </>
  );
}
