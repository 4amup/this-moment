const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow()
const updateItems  = require('../../lib/updateItems.js')

// 根据窗口id读取对应的item数据对象
let item = readMainItem()

// 从主进程实时读取最新的item数据对象
function readMainItem(item) {
    let items = remote.getGlobal('data').data.items
    if (items !== null) {
        item = items.find(item => {
            return item.id == currnetWindow.itemId
        })
    } else {
        item = null
    }
    return item
}

// user-comand区域事件监听
let userComand = document.getElementById('user-command')
userComand.addEventListener("click", (event) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "exit":
            exitItem(item)
            break;
        case "add":
            mainProcess.createItemWindow()
            break;
        case "del":
            delItem(item)
            break;
        case "menu":
            ipcRenderer.send('show-main')
            break;
        default:
            break;
    }

})

// item->view
let content = document.getElementById("content")
let content_dt = document.getElementById("content-dt")
if (item) {
    content.value = item.content
    content_dt.value = item.content_dt
}

// 内容改变事件监听，自动保存
content.addEventListener("input", saveCotent)
content_dt.addEventListener("input", saveCotent)

// 函数功能，将item进行持久化保存
function saveCotent() {
    // id初始赋值
    if (item == null) {
        item = {
            id: Date.now(),
            create_dt: Date.now(),
        }
        currnetWindow.itemId = item.id //更新窗口itemId
    }

    // item字段更新
    item.update_dt = Date.now()
    item.content = content.value
    item.content_dt = content_dt.value
    item.open = true

    // db save
    let itemPath = path.join('./data', item.id + '.json')
    fs.writeFile(itemPath, JSON.stringify(item, "", "\t"), (err) => {
        if (err) throw err
        updateItems(item, "update")
        console.log(item.id + "is saved")
    })
}

// 异步删除文件，删除文件成功后，主进程数据数据对象
function delItem(item) {
    if (item == null) {
        currnetWindow.close()
    } else {
        // 文件路径
        let itemPath = path.join('./data/', item.id + '.json')
        // 异步处理删除文件操作，删除成功后关闭窗口，更新全局数据
        fs.unlink(itemPath, (err) => {
            if (err) throw err
            updateItems(item, "delete")
            currnetWindow.close()
        })
    }
}

// 退出窗口，open属性改为false，更新主进程数据数据对象
function exitItem(item) {
    if (item == null) {
        currnetWindow.close()
    } else {
        // 文件路径
        let itemPath = path.join('./data/', item.id + '.json')

        // 改为关闭属性
        item.open = false

        fs.writeFile(itemPath, JSON.stringify(item, "", "\t"), (err) => {
            if (err) throw err
            updateItems(item, "update")
            currnetWindow.close()// 关闭窗口
        });


    }
}