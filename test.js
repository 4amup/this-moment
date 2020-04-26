const fs = require('fs')
const path = require('path')

let data_path = path.join(__dirname, 'data/items/')
let items = fs.readdirSync(data_path);

console.log(items[0])