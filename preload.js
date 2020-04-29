// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const test = document.getElementById('test')
  if (test) test.innerText = 'test'
  const counter = document.getElementById('counter')
  if (counter) counter.innerText = 12
})

