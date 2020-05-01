// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')

let control_element = document.getElementById('control')

control_element.addEventListener("click", (ev) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "close":
            remote.BrowserWindow.fromId(1).hide()
            break;
        case "add":
            mainProcess.addItem()
            break;
        default:
            break;
    }

})

ipcRenderer.on('load-file', (event, data) => {
    console.log("load-file!!!!")
    console.log(data)
});


// 页面加载的三个阶段
// list列表动态图转圈
// node.js读取文件后转化为对象
// 渲染list，插入HTML文件中
const list_element = document.getElementById('list')
list_element.innerText = `加载中...`

let start = Date.now()
let data = {}
mainProcess.loadFile(data)


// // 加载node原生模块
// const fs = require('fs')
// const path = require('path')

// // 路径设置
// const entry_path = path.join(__dirname, 'data/')
// const setting_path = "setting.json"

// // 拼接路径
// let header_path = path.join(entry_path, setting_path)
// let items_path = path.join(entry_path, "items/")

// // 读取header设置，并转化为可操作的对象
// let data_json = fs.readFileSync(header_path, 'utf8')
// let data = JSON.parse(data_json)

// // 读取items文件名
// let items_file_name = fs.readdirSync(items_path)
// // 遍历读取items文件内容并放入items数组中
// data.items = []
// items_file_name.forEach((value, index) => {
//     let item_path = path.join(items_path, value)
//     let item_json = fs.readFileSync(item_path, 'utf8')
//     let item = JSON.parse(item_json)
//     data.items[index] = item
// })

// let result = JSON.stringify(data)
let end = Date.now()
let timer = end - start


// 加载完毕，清掉之前的等待状态，切换为根据结果构建的list列表
list_element.innerText = null
data.items.forEach((item, index) => {
    let div = document.createElement("div")
    div.id = item.id
    div.innerText = item.content
    list_element.appendChild(div)
})