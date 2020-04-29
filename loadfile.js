const fs = require('fs')
const path = require('path')

let start = Date.now()

// 路径设置
const entry_path = path.join(__dirname, 'data/')
const setting_path = "setting.json"

// 拼接路径
let header_path = path.join(entry_path, setting_path)
let items_path = path.join(entry_path, "items/")

// 读取header设置，并转化为可操作的对象
let data_json = fs.readFileSync(header_path, 'utf8')
let data = JSON.parse(data_json)

// 读取items文件名
let items_file_name = fs.readdirSync(items_path)
// 遍历读取items文件内容并放入items数组中
data.items = []
items_file_name.forEach((value, index) => {
    let item_path = path.join(items_path, value)
    let item_json = fs.readFileSync(item_path, 'utf8')
    let item = JSON.parse(item_json)
    data.items[index] = item
})

let result = JSON.stringify(data)
let end = Date.now()
let counter = end - start
console.log('json 文件格式')
console.log(result)
console.log('载入文件总耗时：' + counter + 'ms')
console.log('人生海海个数' + data.items.length)
data.counter = counter

// 导出变量，CommonJS规范
module.export = { data };