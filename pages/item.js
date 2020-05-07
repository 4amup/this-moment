const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow()
const itemId = currnetWindow.itemId

let items = remote.getGlobal('data').data.items

// 从主进程实时读取最新的item数据对象
let item = items.find(item => {
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
            currnetWindow.close()
            break;
        case "add":
            mainProcess.createItemWindow()
            break;
        case "del":
            if (item == undefined) {
                currnetWindow.close()
            } else {
                items = remote.getGlobal('data').data.items
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    if (item.id == itemId) {
                        items.splice(index, 1)
                    }
                }
                remote.getGlobal('data').data.items = items
                ipcRenderer.send('update-items')
                let itemPath = path.join('./data/items/', item.id + '.json')
                fs.unlinkSync(itemPath)
                currnetWindow.close()
            }
            break;
        default:
            break;
    }

})

let content = document.getElementById("content")
let content_dt = document.getElementById("content-dt")

// 初始赋值
if (item != undefined) content.value = item.content


// 内容改变事件监听，自动保存
content.addEventListener("change", saveCotent)
content_dt.addEventListener("change", saveCotent)

// 定义数据保存函数
function saveCotent(event) {
    // id初始赋值
    if (item == undefined) {
        item = {
            id: Date.now(),
            create_dt: Date.now(),
        }
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

    // 数据更新到主线程的数据中，add或者update
    let index = items.findIndex((value,index,item) => {
        return value.id == itemId
    })

    if (index == -1) {
        items.push(item)
    } else {
        items[index] = item
    }

    remote.getGlobal('data').data.items = items
    
    ipcRenderer.send('update-items')
}