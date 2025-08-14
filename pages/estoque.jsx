import Head from "@/components/Head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";

export default function Estoque() {
  const [seller, setSeller] = useState('');
  const [products, setProducts] = useState(undefined);

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

  // Definir produtos
  useEffect(() => {
    async function retrieveProducts() {
      try {
        // Comunicação com o backend
        let response = await fetch('/api/obter_estoque', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        let data = await response.json();

        if (data.error_message) return typeof window !== 'undefined' && window.alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
          throw new Error('Falha na solicitação');
        }

        (() => {
          // Adicionar produtos
          setProducts(
            data.produtos
              ?.sort((a, b) => a.nome.localeCompare(b.nome))
              ?.map((produto) => {
                return (
                  <div
                    className="Produto NaoSelecionavel"
                    key={produto.nome}
                    id={produto.nome}
                    onClick={(e) => {
                      document.getElementById(produto.nome).classList.toggle('Selecionado');
                      const insertProduct = produto;
                      insertProduct['quantidade'] = 1;
                      setSelectedProducts(prevSet => prevSet.includes(produto) ? prevSet.filter(elemento => elemento != produto) : [...prevSet, insertProduct]);
                    }}
                  >
                    <img src={produto.icone || 'https://pngimg.com/uploads/question_mark/question_mark_PNG134.png'} />
                    <label id={produto.nome}>
                      {
                        produto.nome.replace(
                          /\w\S*/g,
                          text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                        ) + ` - ${produto.quantidade} (R$${produto.valor_da_unidade})`
                      }
                    </label>
                  </div>
                )
              })
          )
        })();

      } catch (error) {
        console.error(error);
        typeof window !== 'undefined' && window.alert(`Erro ao tentar comunicação\n${error}`);
      }
    }
    retrieveProducts();
  }, []);

  /**
   * Manuseio do formulário
   * @param {Event} e 
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const nome = data["nome"];
    const icone = data["icone"];
    const valor_da_unidade = parseFloat(data["valor"]);
    const quantidade = parseInt(data["quantidade"]);
    const data_criacao = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date()).replace(',', '');

    try {
      // Comunicação com o backend
      const response = await fetch('/api/adicionar_estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, icone, quantidade, data_criacao, valor_da_unidade })
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
          <h1>Adicionar estoque</h1>

          <form id="FormularioAdicionarEstoque" onSubmit={handleFormSubmit}>
            <label htmlFor="nomeProduto">Nome do produto</label>
            <input placeholder="Picolé" type="text" name="nome" id="nomeProduto" required />
            <label htmlFor="icone">Ícone do produto</label>
            <input type="text" name="icone" id="icone" placeholder="Link da imagem" />
            <label htmlFor="valor">Valor da unidade do produto</label>
            <input placeholder="0,00" type="text" name="valor" id="valor" min="1" />
            <label htmlFor="quantidade">Quantidade a adicionar</label>
            <input placeholder="99" type="number" name="quantidade" id="quantidade" />
            <input type="submit" value="Adicionar" className="BotaoPrimario" />
          </form>
        </div>

        <div className="CorpoElemento">
          <div className="ScrollContent">
            <h1>Estoque e planilha</h1>

            <div className="Produtos" id="CampoDadosDb">
              {
                products || <span className="Carregando ElementoCentral"></span>
              }
            </div>

            <a className="BotaoPrimario" href="/api/planilha_vendas">Baixar planilha de vendas</a>
          </div>
        </div>

      </main>

      <p id="Copyright">64.99324-9400 © Site feito pelo Renato (2025)</p>
    </>
  );
}
