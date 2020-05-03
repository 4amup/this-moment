const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow();

// 从主进程实时读取最新的item数据对象
// let item = {
//     id: null,
//     create_dt: null,
//     content: null,
//     color: null,
//     content_dt: null,
//     update_dt: null
// }
let item = mainProcess.openItemFile(currnetWindow, './data/items/1588429757886.json')

// 根据收到信消息和数据，渲染页面
ipcRenderer.on('file-opened', (event, file, content) => {
    console.log(content)
})

// user-comand区域事件监听
let userComand = document.getElementById('user-command')
userComand.addEventListener("click", (event) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "exit":
            remote.getCurrentWindow().close()
            break;
        case "add":
            mainProcess.addItem()
            break;
        default:
            break;
    }

})

// 内容改变事件监听，自动保存
let content = document.getElementById("content")
let content_dt = document.getElementById("content-dt")

// 监听事件
content.addEventListener("change", saveCotent)
content_dt.addEventListener("change", saveCotent)

// 定义数据保存函数
function saveCotent(event) {
    // id初始赋值
    if (item.id == null) {
        item.id = Date.now()
        item.create_dt = Date.now()
    }

    // 数据更新
    item.update_dt = Date.now()
    item.content = content.value
    item.content_dt = content_dt.value

    // db save
    let itemPath = path.join('./data/items/', item.id + '.json')
    fs.writeFile(itemPath, JSON.stringify(item, "", "\t"), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}