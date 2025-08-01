import Head from "@/components/Head";
import { useState } from "react";

export default function Identificar() {
  const [name, setName] = useState('');

  /**
   * Manuseio do formulário
   * @param {Event} e 
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    sessionStorage.setItem('vendedor', data["nome"]);
    location.href = './';
  };

  return (
    <>
      <Head />

      <header>
          <h1>Sistema de vendas da comissão de formatura</h1>
      </header>

      <main>
          <div className="ElementoCentral">
              <h1>Identifique-se</h1>

              <form id="FormularioEntrarVendedor" onSubmit={handleFormSubmit}>
                  <label for="nome">Seu nome completo</label>
                  <input placeholder="Fulano da Silva" type="text" name="nome" id="nome" required="" value={name} onChange={(e) => setName(e.target.value)} />
                  <input type="submit" value="Começar a vender" className="BotaoPrimario" />
              </form>
          </div>
      </main>

      <p id="Copyright">64.99324-9400 © Site feito pelo Renato (2025)</p>
    </>
  );
}
