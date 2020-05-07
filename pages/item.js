const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow()
const itemId = currnetWindow.itemId

// 从主进程实时读取最新的item数据对象
let item = {
    id: itemId,//新建窗口id为空，读取的话是有id的
    create_dt: null,
    content: null,
    color: null,
    content_dt: null,
    update_dt: null
}

item = remote.getGlobal('data').data.items.find(item => {
    return item.id == itemId
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
            mainProcess.createItemWindow()
            break;
        case "del":
            break;
        default:
            break;
    }

})

let content = document.getElementById("content")
let content_dt = document.getElementById("content-dt")

// 初始赋值
content.value = item.content

// 内容改变事件监听，自动保存
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
        if (err) throw err
        console.log(item.id + "is saved")
    });
}