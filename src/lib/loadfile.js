// 此文件的功能是从文件中读取持久化储存的全部文件

// 加载node原生模块
const fs = require('fs')
const path = require('path')

// 路径设置
const entry_path = path.join(__dirname, '../../data/')
const setting_path = path.join(__dirname, '../../setting.json')

// 拼接路径
let header_path = path.join(setting_path)
let items_path = path.join(entry_path)

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

// 导出一个对象，CommonJS规范
// 后续目标，导出一个对象类，可以直接使用的
module.exports = data