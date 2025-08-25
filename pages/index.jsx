import Head from "@/components/Head";
import Header from "@/components/Header";
import { useState, useEffect } from 'react';
import { FaCheck, FaCircleCheck, FaCreditCard, FaMoneyBillWave, FaPix, FaStar, FaXmark } from "react-icons/fa6";

export default function Home() {
  const [seller, setSeller] = useState('');
  const [products, setProducts] = useState(undefined);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('cartao');
  const [fiado, setFiado] = useState(false);

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
        const response = await fetch('/api/obter_estoque', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.error_message) return typeof window !== 'undefined' && window.alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
          throw new Error('Falha na solicitação');
        }

        (() => {
          // Adicionar produtos
          setProducts(
            data.produtos
              ?.sort((a, b) => a.nome.localeCompare(b.nome))
              ?.filter((produto) => produto?.quantidade > 0)
              ?.map((produto) => {
                return (
                  <div
                    className="Produto"
                    key={produto.nome}
                    id={produto.nome}
                    onClick={(e) => {
                      document.getElementById(produto.nome).classList.toggle('Selecionado');
                      Array.from(e.currentTarget.children).find(e => e.id === 'quantidade').value = 1;
                      const insertProduct = produto;
                      insertProduct['quantidade'] = 1;
                      setSelectedProducts(prevSet => prevSet.includes(produto) ? prevSet.filter(elemento => elemento != produto) : [...prevSet, insertProduct]);
                    }}
                  >
                    <img src={produto.icone || 'https://pngimg.com/uploads/question_mark/question_mark_PNG134.png'} />
                    <label id={produto.nome}>
                      <FaCircleCheck />
                      {
                        produto.nome.replace(
                          /\w\S*/g,
                          text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                        )
                      }
                      <input 
                        type="number"
                        name="quantidade"
                        id={`quantidade-${produto.nome}`}
                        placeholder="quantidade"
                        defaultValue="1"
                        max={produto.quantidade}
                        min="1" 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.value<1) return;
                          const newProduct = produto;
                          newProduct['quantidade'] = e.target.valueAsNumber;
                          setSelectedProducts(prevSet => [...prevSet.filter(elemento => elemento.nome != produto.nome), newProduct])
                        }}
                      />
                      <input type="hidden" name="valor_da_unidade" id="valor_da_unidade" value={produto.valor_da_unidade} />
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
  }, [setSelectedProducts, seller]);

  /**
   * Manuseio do formulário
   * @param {Event} e 
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const nome = `${data['nome']?.toUpperCase()}` || "NÃO INFORMADO";
    const data_venda = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date()).replace(',', '');

    const vendedor = seller;
    const metodo_de_pagamento = `${data["metodo_de_pagamento"].toUpperCase()}`;
    const fiado = `${data["fiado"].toUpperCase()}`;

    const produtosSelecionados = document.querySelectorAll('.Produto.Selecionado');

    const fetches = Array.from(produtosSelecionados).map(async (produto) => {
      const produto_id = produto.querySelector('label').id;
      const quantidade = produto.querySelector(`input#quantidade`)?.valueAsNumber;
      const valor = metodo_de_pagamento == "GRATIS" ? 0 : null;

      try {
        const response = await fetch('/api/registrar_venda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, produto: produto_id, quantidade, valor, metodo_de_pagamento, fiado, vendedor, data_venda })
        });

        const data = await response.json();

        if (data.error_message) {
          alert(`Erro de comunicação\n${data.error_message}`);
          return Promise.reject(data.error_message); // para o Promise.all saber que houve erro
        }

        if (!response.ok) {
          throw new Error('Falha na solicitação');
        }

      } catch (error) {
        console.error(error);
        alert(`Erro ao tentar comunicação\n${error}`);
        return Promise.reject(error); // para o Promise.all saber que houve erro
      }
    });

    try {
      await Promise.all(fetches); // espera todas as requisições terminarem com sucesso
      location.reload(); // recarrega a página
    } catch (e) {
      console.error(`Erro de comunicação: ${e}`);
      alert(`Erro de comunicação: ${e}`);
    }

  }

  return (
    <>
      <Head />

      <Header />

      <main>

        {
          selectedProducts?.length>0 && (
            <aside>
              <div className="ScrollContent">
                <h1>Nova venda</h1>
                <p id="DadosVolateis">
                  {
                    selectedProducts
                    .map(produto => <>- R${produto.quantidade * produto.valor_da_unidade} {produto.nome} ({produto.quantidade}xR${produto.valor_da_unidade})<br /></>)
                  }
                </p>
                <h4>TOTAL: R${
                  selectedProducts.map(produto => produto.quantidade * produto.valor_da_unidade)
                  .reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue), 0)
                  || 0
                }</h4>
                <h1>Dados</h1>
                <form id="FormularioRegistrarVenda" onSubmit={handleFormSubmit}>
                  <label htmlFor="nome">Nome do cliente</label>
                  <input placeholder="Opcional" type="text" name="nome" id="nome" />
                  <label>Método de pagamento</label>
                  <div className="Opcoes" id="Metodo">
                    <input type="radio" name="metodo_de_pagamento" id="cartao" value="cartao" checked={paymentMethod == 'cartao'} onChange={() => setPaymentMethod('cartao')} />
                    <label htmlFor="cartao"><FaCreditCard /></label>
                    <input type="radio" name="metodo_de_pagamento" id="dinheiro" value="dinheiro" checked={paymentMethod == 'dinheiro'} onChange={() => setPaymentMethod('dinheiro')} />
                    <label htmlFor="dinheiro"><FaMoneyBillWave /></label>
                    <input type="radio" name="metodo_de_pagamento" id="outro" value="outro" checked={paymentMethod == 'outro'} onChange={() => setPaymentMethod('outro')} />
                    <label htmlFor="outro"><FaPix /></label>
                    <input type="radio" name="metodo_de_pagamento" id="gratis" value="gratis" checked={paymentMethod == 'gratis'} onChange={() => setPaymentMethod('gratis')} />
                    <label htmlFor="gratis" style={{ color: 'transparent', boxShadow: 'none' }}><FaStar /></label>
                  </div>
                  <label>Fiado</label>
                  <div className="Opcoes">
                    <input type="radio" name="fiado" id="fiado_nao" value="nao" checked={!fiado} onChange={() => setFiado(false)} />
                    <label htmlFor="fiado_nao"><FaXmark /></label>
                    <input type="radio" name="fiado" id="fiado_sim" value="sim" checked={fiado} onChange={() => setFiado(true)} />
                    <label htmlFor="fiado_sim"><FaCheck /></label>
                  </div>
                  <input type="submit" className="BotaoPrimario" />
                </form>
              </div>
            </aside>
          )
        }

        <div id="Produtos" className="Produtos">
          {
            products || <span className="Carregando ElementoCentral"></span>
          }
        </div>

      </main>

      <p id="Copyright">64.99324-9400 © Site feito pelo Renato (2025)</p>
    </>
  );
}
