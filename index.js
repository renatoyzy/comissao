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
        
            data.produtos.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(produto => {

                document.getElementById("Produtos").innerHTML += `
                    <div class="Produto">
                        <img src="${produto.icone || 'https://snowfruit.com.br/wp-content/webp-express/webp-images/uploads/2021/12/Picole-1.png.webphttps://media.istockphoto.com/id/1341411204/pt/foto/question-mark-golden-interrogation-point-symbol-asking-questions-sign-white-stick-figure-man.jpg?s=612x612&w=0&k=20&c=qZ4sDYldc3bOm3Po4EymT7Luo3vQi99Zz2IkLggZAEg='}">
                        <label id="${produto.nome.replace(
                            /\w\S*/g,
                            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
                        )}">
                            <i class="fa-solid fa-circle-check"></i>
                            ${produto.nome}
                            <input type="number" name="quantidade" id="quantidade" placeholder="quantidade" value="1">
                        </label>
                    </div>
                `;
                
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
                        } else {
                            document.querySelector('aside').classList.add('Ativo');

                            let dados_volateis = '';
                            document.querySelectorAll('.Produto.Selecionado').forEach(produto => {
                                dados_volateis += `- ${produto.querySelector('label').id} (${produto.querySelector('input#quantidade').valueAsNumber}x)<br>`
                            });

                            document.querySelector('aside').querySelector('#DadosVolateis').innerHTML = dados_volateis;
                        };
                    });

                    // Impede que o clique no input deselect o produto
                    produto.querySelectorAll('input').forEach(input => {
                        input.addEventListener('click', (e) => {
                            e.stopPropagation();
                        });
                    });

                });

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