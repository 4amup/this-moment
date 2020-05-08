const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow()
let itemId = currnetWindow.itemId

let items = remote.getGlobal('data').data.items

// 从主进程实时读取最新的item数据对象
let item = items.find(item => {
    return item.id == itemId
})
let itemIndex = items.findIndex((item, index) => {
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
            item.open = false
            items[itemIndex] = item
            remote.getGlobal('data').data.items = items
            currnetWindow.close()
            break;
        case "add":
            mainProcess.createItemWindow()
            break;
        case "del":
            delItem()
            break;
        case "menu":
            ipcRenderer.send('show-main')
            break;
        default:
            break;
    }

})

let content = document.getElementById("content")
let content_dt = document.getElementById("content-dt")

// 初始赋值
if (item != undefined) {
    content.value = item.content
    content_dt.value = item.content_dt
}


// 内容改变事件监听，自动保存
content.addEventListener("change", saveCotent)
content_dt.addEventListener("change", saveCotent)

// 定义数据保存函数
function saveCotent() {

    // if (content.value == "" && content_dt.value == "") {
    //     break;
    // }

    // id初始赋值
    if (item == undefined) {
        item = {
            id: Date.now(),
            create_dt: Date.now(),
        }
        itemId = item.id
    }

    // 数据更新
    item.update_dt = Date.now()
    item.content = content.value
    item.content_dt = content_dt.value
    item.open = true

    // db save
    let itemPath = path.join(__dirname,'../../userdata/items/', item.id + '.json')
    fs.writeFile(itemPath, JSON.stringify(item, "", "\t"), (err) => {
        if (err) throw err
        console.log(item.id + "is saved")
    });

    // 数据更新到主线程的数据中，add或者update
    let index = items.findIndex((item, index) => {
        return item.id == itemId
    })

    if (index == -1) {
        items.push(item)
    } else {
        items[index] = item
    }

    remote.getGlobal('data').data.items = items

    // 发送数据更新指令
    ipcRenderer.send('update-items')
}

function delItem() {
    if (item == undefined) {
        currnetWindow.close()
    } else {
        // 文件路径
        let itemPath = path.join('./data/items/', item.id + '.json')
        // fs.unlinkSync(itemPath)

        // 异步处理删除文件操作，删除成功后关闭窗口，更新全局数据
        fs.unlink(itemPath, (err) => {
            if (err) throw err
            // 获取最新全局数据，删除本次的对象，然后更新全局数据后关闭本窗口
            items = remote.getGlobal('data').data.items
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                if (item.id == itemId) {
                    items.splice(index, 1)
                }
            }
            remote.getGlobal('data').data.items = items
            ipcRenderer.send('update-items')
            currnetWindow.close()
        })
    }
}