function closeIt() {
  return location.href = './';
};
window.onbeforeunload = closeIt;