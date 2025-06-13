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