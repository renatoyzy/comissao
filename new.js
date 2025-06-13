// Produto selecionável
Array.from(document.getElementsByClassName('Produto')).forEach(produto => {
    if(!produto) return;
    produto.addEventListener('click', () => {
        produto.classList.toggle('Selecionado');
    });
})