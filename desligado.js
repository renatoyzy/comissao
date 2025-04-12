window.addEventListener("DOMContentLoaded", () => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;

    // Só redireciona se o tipo de navegação for 'reload'
    if (navType === "reload" && window.location.pathname.endsWith("/desligado")) {
        window.location.href = "./";
    }
});