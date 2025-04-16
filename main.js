// Vendedor identificado?
if(!sessionStorage.getItem('vendedor')) {
    location.href = 'identificar';
};

// Adicionar estoque no banco de dados
document.getElementById('FormularioAdicionarEstoque').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const nome = document.getElementById('FormularioAdicionarEstoque').elements["nome"].value.toLowerCase();
    const valor_da_unidade = parseFloat(document.getElementById('FormularioAdicionarEstoque').elements["valor"].value.replaceAll(',', '.'));
    const quantidade = document.getElementById('FormularioAdicionarEstoque').elements["quantidade"].value;
    const data_criacao = new Date();

    try {
        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/adicionar-estoque', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, quantidade, data_criacao, valor_da_unidade })
        });

        const data = await response.json();
        
        if(data.error_message) return alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        location.reload();
        
    } catch (error) {
        console.error(error);
        alert(`Erro ao tentar comunicação\n${error}`);
    }
});

// Escrever estoque pro usuário
(async () => {
    try {
        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/obter-estoque', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ })
        });

        const data = await response.json();
        
        if(data.error_message) return alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        (() => {

            document.getElementById('RegistrarVendaProduto').innerHTML = '';
            let produtos_string = [];
        
            data.produtos.forEach(produto => {
                produtos_string.push(`${produto.nome} ${produto.quantidade} - R$${produto.valor_da_unidade}`);

                document.getElementById('RegistrarVendaProduto').innerHTML += `
                    <option value="${produto.nome}">${produto.nome}</option>
                `;
            });

            produtos_string = produtos_string.join('<br>');

            document.getElementById("CampoDadosDb").innerHTML = produtos_string;

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
    if(!document.getElementById('FormularioRegistrarVenda').elements["nome"].value) {
        nome_pre = "NÃO INFORMADO";
    } else {
        nome_pre = document.getElementById('FormularioRegistrarVenda').elements["nome"].value.toUpperCase();
    };
    const nome = nome_pre;
    const produto = document.getElementById('FormularioRegistrarVenda').elements["produto"].value.toLowerCase();
    const quantidade = parseInt(document.getElementById('FormularioRegistrarVenda').elements["quantidade"].value);
    const valor = parseFloat(document.getElementById('FormularioRegistrarVenda').elements["valor"].value.replaceAll(",","."));
    const metodo_de_pagamento = document.getElementById('FormularioRegistrarVenda').elements["metodo_de_pagamento"].value.toUpperCase();
    const fiado = document.getElementById('FormularioRegistrarVenda').elements["fiado"].value.toUpperCase();
    const vendedor = sessionStorage.getItem('vendedor');
    const data_venda = new Intl.DateTimeFormat('pt-BR', {
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
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/registrar-venda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, produto, quantidade, valor, metodo_de_pagamento, fiado, vendedor, data_venda })
        });

        const data = await response.json();
        
        if(data.error_message) return alert(`Erro de comunicação\n${data.error_message}`);

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        location.reload();
        
    } catch (error) {
        console.error(error);
        alert(`Erro ao tentar comunicação\n${error}`);
    };
});