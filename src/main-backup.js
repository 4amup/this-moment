// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const common = require('./lib/common')

// 数据对象data，初始化时为空，在加载完listWindow后，此对象被赋值
global.data = {
    data: null,
    itemWindows: new Set()
}

// 窗口引用
let loadWindow = null
let listWindow = null

// 创建数据载入窗口
const createLoadWindow = exports.createLoadWindow = () => {
    loadWindow = new BrowserWindow({
        width: 200,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            // webSecurity: false
        },
    })

    loadWindow.loadURL(`file://${__dirname}/windows/views/load.html`)

    loadWindow.once('ready-to-show', () => {
        loadWindow.show()
    })

    // 窗口关闭事件
    loadWindow.on('closed', () => {
        loadWindow = null
    })

    loadWindow.webContents.openDevTools()
}

// 创建main窗口
function createListWindow() {
    listWindow = new BrowserWindow({
        width: 800,
        height: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    listWindow.setMenu(null)
    listWindow.loadURL(`file://${__dirname}/windows/views/list.html`)
    listWindow.webContents.openDevTools()
    listWindow.on('closed', () => {
        listWindow = null
    })
}

// 创建item窗口
// const createItemWindow = exports.createItemWindow = (itemId) => {
const createItemWindow = exports.createItemWindow = (item) => {
    let itemWindow = new BrowserWindow({
        width: 500,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // 将数据id传递给窗口
    // if (item) itemWindow.itemId = item.id
    itemWindow.item = item
    itemWindow.setMenu(null)
    itemWindow.loadURL(`file://${__dirname}/windows/views/item.html`)

    itemWindow.once('ready-to-show', () => {
        itemWindow.show();
    })

    itemWindow.on('closed', () => {
        // itemWindows.delete(itemWindow) //从已关闭的窗口Set中移除引用
        global.data.itemWindows.delete(itemWindow) //从已关闭的窗口Set中移除引用
        itemWindow = null
    })

    // itemWindows.add(itemWindow) //将item窗口添加到已打开时设置的窗口
    global.data.itemWindows.add(itemWindow) //将item窗口添加到已打开时设置的窗口
    itemWindow.webContents.openDevTools()
    return itemWindow
}

// app准备好之后，加载载入文件窗口
app.whenReady().then(createLoadWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// app.on('activate', function () {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })


// 根据主窗口异步消息，加载数据，加载数据完成后，创建main窗口
ipcMain.on('load-data', (event) => {
    // 同步开始载入文件
    global.data.data = require('./lib/loadfile')

    // 创建main窗口
    createListWindow()

    let items = global.data.data.items

    // 创建打开状态item窗口
    if (items) {
        items = items.filter((item) => {
            return item.open == true
        })

        items.forEach(item => {
            createItemWindow(item)
        })
    }

    // 发送消息，关闭数据载入窗口
    event.sender.send('load-end')
})

// item窗口更新完毕后，更新主进程数据
ipcMain.on('update-items', () => {
    if (listWindow) listWindow.reload()
})

// 打开主窗口
ipcMain.on('show-main', () => {
    if (listWindow) {
        listWindow.focus()
    } else {
        createListWindow()
    }
})

ipcMain.on('open-item-window', openItemWindow)

function openItemWindow(event, item) {
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
        global.data.itemWindows.forEach(value => {
            if (value.item.id === item.id) {
                itemWindow = value
            }
        })
        if (itemWindow) itemWindow.focus()
    }
}

// 载入本地数据文件，如初始化，则创建文件
function loadJsonFile () {

}