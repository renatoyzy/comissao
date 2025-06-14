// Vendedor identificado?
if(!sessionStorage.getItem('vendedor')) {
    location.href = 'identificar';
};

// Adicionar estoque no banco de dados
document.getElementById('FormularioAdicionarEstoque').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const nome = document.getElementById('FormularioAdicionarEstoque').elements["nome"].value.toLowerCase().replaceAll(' ', '');
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