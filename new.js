// Produto selecionável
Array.from(document.getElementsByClassName('Produto')).forEach(produto => {
    if (!produto) return;
    produto.addEventListener('click', () => {
        produto.classList.toggle('Selecionado');
    });

    // Impede que o clique no input deselect o produto
    const inputs = produto.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
});