// Vendedor identificado?
if(!sessionStorage.getItem('vendedor')) {
    location.href = 'identificar';
};

// Atualizar valor
function AtualizarValorTotal(document) {
    if (!document.querySelector('aside').classList.contains('Ativo')) return;

    let dados_volateis = '';
    let valor_total = 0;
    document.querySelectorAll('.Produto.Selecionado').forEach(produto => {
        dados_volateis += `- ${produto.querySelector('label').id} (${produto.querySelector('input#quantidade').valueAsNumber}xR$${produto.querySelector('input#valor_da_unidade').value})<br>`;
        valor_total += parseFloat(produto.querySelector('input#valor_da_unidade').value)*parseInt(produto.querySelector('input#quantidade').value);
    });

    if(document.forms['FormularioRegistrarVenda'].elements["metodo_de_pagamento"].value === 'cartao') {
        document.querySelector('aside').querySelector('#DadosVolateis').innerHTML = dados_volateis+`<h4>TOTAL + taxa: R$${(valor_total*1.05).toFixed(2)}</h4>`;
    } else if(document.forms['FormularioRegistrarVenda'].elements["metodo_de_pagamento"].value === 'gratis') {
        document.querySelector('aside').querySelector('#DadosVolateis').innerHTML = dados_volateis+`<h4>TOTAL: R$0.00</h4>`;
    } else {
        document.querySelector('aside').querySelector('#DadosVolateis').innerHTML = dados_volateis+`<h4>TOTAL: R$${valor_total}</h4>`;
    };
};
document.querySelectorAll('.Opcoes#Metodo>input').forEach(element => {
    element.addEventListener('input', () => {
        AtualizarValorTotal(document);
    });
});

// Produtos
(async () => {
    try {

        // Escrever estoque

        // Comunicação com o backend
        let response = await fetch('https://evolved-legible-spider.ngrok-free.app/obter-estoque', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ })
        });

        let data = await response.json();
        
        if(data.error_message) return alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        (() => {
            document.getElementById("Produtos").innerHTML = '';
            
            // Adicionar produtos
            data.produtos.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(produto => {

                // Adicionar produto na tela se tiver no estoque
                if(produto.quantidade>0) {
                    document.getElementById("Produtos").innerHTML += `
                        <div class="Produto">
                            <img src="${produto.icone || 'https://pngimg.com/uploads/question_mark/question_mark_PNG134.png'}">
                            <label id="${produto.nome}">
                                <i class="fa-solid fa-circle-check"></i>
                                ${produto.nome.replace(
                                    /\w\S*/g,
                                    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                                )}
                                <input type="number" name="quantidade" id="quantidade" placeholder="quantidade" value="1" max="${produto.quantidade}" min="1">
                                <input type="hidden" name="valor_da_unidade" id="valor_da_unidade" value="${produto.valor_da_unidade}">
                            </label>
                        </div>
                    `;
                };
                

                //produtos_string.push(`${produto.nome} ${produto.quantidade} (R$${produto.valor_da_unidade})`);

            });

            // Produto selecionável
            Array.from(document.getElementsByClassName('Produto')).forEach(produto => {

                if (!produto) return;
                
                // Selecionar produto
                produto.addEventListener('click', () => {
                    produto.classList.toggle('Selecionado');

                    // Ativar aside caso tenha produtos selecionados
                    if(document.querySelectorAll('.Produto.Selecionado').length<1) {
                        document.querySelector('aside').classList.remove('Ativo');
                        produto.querySelector('input#quantidade').value = "1";
                        document.forms['FormularioRegistrarVenda'].reset();
                    } else {
                        document.querySelector('aside').classList.add('Ativo');
                    };

                    AtualizarValorTotal(document);
                });

                // Impede que o clique no input deselect o produto
                produto.querySelectorAll('input').forEach(input => {
                    input.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                });

            });

            // Atualizar valor total no input de quantidade
            document.querySelectorAll('input#quantidade').forEach(element => {
                element.addEventListener('input', () => {AtualizarValorTotal(document)});
            });

        })();
        
    } catch (error) {
        console.error(error);
        if(`${error}`.includes(`TypeError: Failed to fetch`) || `${error}`.includes(`TypeError: Load failed`)) {
            location.href = 'desligado';
        } else {
            alert(`Erro ao tentar comunicação\n${error}`);
        };
    }
})();

// Registrar venda no banco de dados
document.getElementById('FormularioRegistrarVenda').addEventListener('submit', async (event) => {
    event.preventDefault();

    let nome_pre;
    if (!document.getElementById('FormularioRegistrarVenda').elements["nome"].value) {
        nome_pre = "NÃO INFORMADO";
    } else {
        nome_pre = document.getElementById('FormularioRegistrarVenda').elements["nome"].value.toUpperCase();
    }

    const nome = nome_pre;
    const data_venda = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date()).replace(',', '');
    
    const vendedor = sessionStorage.getItem('vendedor');
    const metodo_de_pagamento = document.getElementById('FormularioRegistrarVenda').elements["metodo_de_pagamento"].value.toUpperCase();
    const fiado = document.getElementById('FormularioRegistrarVenda').elements["fiado"].value.toUpperCase();

    const produtosSelecionados = document.querySelectorAll('.Produto.Selecionado');

    const fetches = Array.from(produtosSelecionados).map(async (produto) => {
        const produto_id = produto.querySelector('label').id;
        const quantidade = produto.querySelector('input#quantidade').valueAsNumber;
        const valor = metodo_de_pagamento == "GRATIS" ? 0 : null;

        try {
            const response = await fetch('https://evolved-legible-spider.ngrok-free.app/registrar-venda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
});
