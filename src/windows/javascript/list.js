const { remote, ipcRenderer } = require('electron')
const Menu = remote.Menu
const MenuItem = remote.MenuItem
const mainProcess = remote.require('./main.js')
const fs = require('fs')
const path = require('path')
const currentWindow = remote.getCurrentWindow()
const updateItems = require('../../lib/updateItems.js')

// 读取全局数据
let setting = remote.getGlobal('setting');
let item = null;//当前操作的item引用
let items = remote.getGlobal('items');

let userComand = document.getElementById('user-command')
let listElement = document.getElementById('list')
let searchElement = document.getElementById('search')
let menu = new Menu()//创建右键菜单
menu.append(new MenuItem({ label: 'open', click: openItemWindow }))
menu.append(new MenuItem({ label: 'close' }))
menu.append(new MenuItem({ label: 'delte' }))

// 根据数据渲染list列表
contentRender(items)

// user-comand区域事件监听
userComand.addEventListener("click", (event) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "close":
            currentWindow.close()
            break;
        case "add":
            ipcRenderer.send('add-item', null);
            break;
        default:
            break;
    }
})

// listElement.addEventListener("dblclick", openItemWindow)// item双击open
listElement.addEventListener("dblclick", handleDoubleClick)// item双击open
listElement.addEventListener("contextmenu", contentMenu)// item右键菜单open close del
// search功能按照keyup绑定事件，触发查询操作，高亮查询内容，并过滤
searchElement.addEventListener("input", matchItems)

// 函数功能区

// 函数功能：根据输入内容，查找复合要求的内容，高亮匹配词，重新渲染界面
function matchItems(event) {
    let keyWord = searchElement.value
    let matchItem
    if (keyWord == "") {
        matchItem = data.items
    }

    // 搜索内容
    matchItems = items.filter(item => {
        let matchIndex = item.content.indexOf(keyWord)
        return matchIndex > -1
    })

    // 根据查询结果渲染list列表
    contentRender(matchItems, keyWord)
}

// 负责根据主进程的data，渲染list列表
function contentRender(items) {
    listElement.innerText = null
    if (items == undefined) {
        let div = document.createElement("div")
        div.innerText = '写点你的人生海浪吧！'
        listElement.appendChild(div)
    } else {
        items.forEach((item, index) => {
            let div = document.createElement("div")
            div.id = item.id
            div.className = "item"
            div.innerText = `序号${index + 1}. ${item.content} ${item.open}`
            listElement.appendChild(div)
        })
    }
}

function handleDoubleClick(event) {
    if (event.target.className !== "item") {
        return;
    }
    // 找到当前双击的item
    findItemById(event.target.id);
    ipcRenderer.send('add-item', item);
}

// 打开item窗口函数
function openItemWindow() {
    if (!item) return
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
    } else {// focus这个item窗口

        let itemWindow = null
        itemWindows.forEach(value => {
            if (value.item.id === item.id) {
                itemWindow = value
            }
        })
        if (itemWindow) itemWindow.focus()
    }
}

function contentRender(items, keyWord) {
    listElement.innerText = null
    if (items == undefined) {
        let div = document.createElement("div")
        div.innerText = '写点你的人生海浪吧！'
        listElement.appendChild(div)
    } else {
        items.forEach((item, index) => {
            let div = document.createElement("div")
            div.id = item.id
            div.className = "item"
            let innerHTML = `序号${index + 1}. ${item.content} ${item.open}`
            if (keyWord) {// 高亮关键字处理
                innerHTML = innerHTML.replace(keyWord, `<mark>${keyWord}</mark>`)
            }
            div.innerHTML = innerHTML
            listElement.appendChild(div)
        })
    }
}

// item右键单击事件
function contentMenu(event) {
    event.preventDefault()
    // 非item的事件，不触发
    if (event.target.className !== "item") {
        return
    }

    // 读取当前双击item的数据对象
    findItemById(event.target.id);

    // 动态改变menu项目
    if (item.open) {
        menu.items[0].visible = false
        menu.items[1].visible = true
    } else {
        menu.items[0].visible = true
        menu.items[1].visible = false
    }
    menu.popup(currentWindow)
}

// 根据id查找当前正在操作的item，并返回引用
function findItemById(id) {
    item = items.find(value => {
        return value.id == id;
    });
}