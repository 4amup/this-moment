const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currnetWindow = remote.getCurrentWindow()
const updateItems  = require('../../lib/updateItems.js')

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
let data = readMainData()

// 加载完毕，清掉之前的等待状态，切换为根据结果构建的list列表
contentRender(data)

// 加载完毕后为每个item绑定事件监听器：双击显示
list_element.addEventListener("dblclick", (event) => {
    // 非item的事件，直接过滤
    if (event.target.className !== "item") {
        return
    }

    // 读取当前双击item的数据对象
    let item = data.items.find(value => {
        return value.id == event.target.id
    })

    // 原open状态为false才可以新建窗口：储存->更新数据->建新窗口->控制台打印信息
    if (item.open == false) {
        let itemPath = path.join('./data/', item.id + '.json')
        item.open = true
        fs.writeFile(itemPath, JSON.stringify(item, "", "\t"), (err) => {
            if (err) throw err
            updateItems(item, "update")
            mainProcess.createItemWindow(item)
            console.log(item.id + "is saved")
        })
    } else {
        // focus这个item窗口
    }
})

// 函数功能：从主进程读取最新的data数据对象
function readMainData() {
    return remote.getGlobal('data').data
}

// 负责根据主进程的data，渲染list列表
function contentRender(data) {
    list_element.innerText = null
    if (data.items == undefined) {
        let div = document.createElement("div")
        div.innerText = '写点你的人生海浪吧！'
        list_element.appendChild(div)
    } else {
        data.items.forEach((item, index) => {
            let div = document.createElement("div")
            div.id = item.id
            div.className = "item"
            // div.innerText = "序号" + index + ". " + item.content + item.open
            div.innerText = `序号${index}. ${item.content} ${item.open}`
            list_element.appendChild(div)
        })
    }
}