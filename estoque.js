// Vendedor identificado?
if(!sessionStorage.getItem('vendedor')) {
    location.href = 'identificar';
};

// Escrever estoque pro usuário
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

            let produtos_string = [];
        
            data.produtos.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(produto => {
                produtos_string.push(`
                    <div class="Produto NaoSelecionavel">
                        <img src="${produto.icone || 'https://pngimg.com/uploads/question_mark/question_mark_PNG134.png'}">
                        <label id="${produto.nome}">
                            ${produto.nome.replace(
                                /\w\S*/g,
                                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                            )} - ${produto.quantidade} (R$${produto.valor_da_unidade})
                        </label>
                    </div>
                `);
            });

            produtos_string = produtos_string.join('\n');

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

// Adicionar estoque no banco de dados
document.getElementById('FormularioAdicionarEstoque').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const nome = document.getElementById('FormularioAdicionarEstoque').elements["nome"].value.toLowerCase();
    const icone = document.getElementById('FormularioAdicionarEstoque').elements["icone"].value;
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
            body: JSON.stringify({ nome, icone, quantidade, data_criacao, valor_da_unidade })
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