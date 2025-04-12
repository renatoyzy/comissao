function closeIt() {
    window.location.href = './';
    return "oi"
};
window.onbeforeunload = closeIt;