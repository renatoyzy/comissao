// Adicionar produtos
// Escrever estoque e fiados pro usuário
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
        
            data.produtos.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(produto => {

                document.getElementById("Produtos").innerHTML += `
                    <div class="Produto">
                        <img src="https://snowfruit.com.br/wp-content/webp-express/webp-images/uploads/2021/12/Picole-1.png.webp">
                        <label id="${produto.nome.replace(
                            /\w\S*/g,
                            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                        )}">
                            <i class="fa-solid fa-circle-check"></i>
                            ${produto.nome}
                            <form>
                                <input type="number" name="quantidade" id="quantidade" value="1">
                            </form>
                        </label>
                    </div>
                `;

                //produtos_string.push(`${produto.nome} ${produto.quantidade} (R$${produto.valor_da_unidade})`);

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

// Produto selecionável
Array.from(document.getElementsByClassName('Produto')).forEach(produto => {

    if (!produto) return;
    
    // Selecionar produto
    produto.addEventListener('click', () => {
        produto.classList.toggle('Selecionado');

        // Ativar aside caso tenha produtos selecionados
        if(document.querySelectorAll('.Produto.Selecionado').length<1) {
            document.querySelector('aside').classList.remove('Ativo');
        } else {
            document.querySelector('aside').classList.add('Ativo');
        };
    });

    // Impede que o clique no input deselect o produto
    produto.querySelectorAll('input').forEach(input => {
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Impede que o formulário do produto seja enviado sozinho
    produto.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        })
    })

});