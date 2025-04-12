document.getElementById('FormularioEntrarVendedor').addEventListener('submit', (event) => {
    event.preventDefault();

    sessionStorage.setItem('vendedor', document.getElementById('FormularioEntrarVendedor').elements["nome"].value.toUpperCase());
    location.href = '';
    
})