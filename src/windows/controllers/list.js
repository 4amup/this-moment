const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow()

let item = null

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
        default:
            break;
    }

})

// 页面加载的三个阶段：1.list列表动态图转圈；2.node.js读取文件后转化为对象；3.渲染list，插入HTML文件中
const list_element = document.getElementById('list')
list_element.innerText = `加载中...`

// 读取数据
let start = Date.now()
let items = readMainItems(currnetWindow, item)
let end = Date.now()
let timer = end - start

// 加载完毕，清掉之前的等待状态，切换为根据结果构建的list列表
list_element.innerText = null
if (items == undefined) {
    let div = document.createElement("div")
        div.innerText = '写点你的人生海浪吧！'
        list_element.appendChild(div)
} else {
    items.forEach((item, index) => {
        let div = document.createElement("div")
        div.id = item.id
        div.className = "item"
        div.innerText = item.content + item.open
        list_element.appendChild(div)
    })
}

// 追加载入时间信息
const message = document.createElement("span")
message.id = "message"
message.innerText = "载入文件耗时：" + timer + "ms"
list_element.appendChild(message)

// 加载完毕后为每个item绑定事件监听器：双击显示
list_element.addEventListener("dblclick", (event) => {
    let item_element = event.target

    // 找对象和index
    let item = {
        id: item_element.id
    }

    // 读取最新对象
    readMainItems(item)

    // 绑定事件过滤
    if (item_element.className !== "item") {
        return
    }

    // 原open状态为false才可以新建窗口：储存->更新数据->建新窗口
    if (item.open == false) {
        let itemPath = path.join('./data/', item.id + '.json')
        item.open = true
        fs.writeFile(itemPath, JSON.stringify(item, "", "\t"), (err) => {
            if (err) throw err
            // 更新主进程数据对象
            remote.getGlobal('data').data.items[itemIndex] = item
            mainProcess.createItemWindow(item)
            console.log(item.id + "is saved")
            // 发送数据更新指令
            ipcRenderer.send('update-items')
        })
    }
})

// 从主进程实时读取最新的item数据对象
function readMainItems(item) {
    let items = remote.getGlobal('data').data.items
    if (items !== null) {
        item = items.find(item => {
            return item.id == item.id
        })
        item.index = items.findIndex((item, index) => {
            return item.id == item.id
        })
    }
    return items
}