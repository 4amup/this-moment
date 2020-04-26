// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
let data_path = path.join(__dirname, 'data/items/')
let items = fs.readdirSync(data_path);

window.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById('test')
  if (element) element.innerText = items[0]
})