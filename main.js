// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

// 管理item窗口的多窗口引用
const itemWindows = new Set();

// 数据对象data，初始化时为空，在加载完mainWindow后，此对象被赋值
global.data = {
    data: null
}

// 数据对象
let data = null

let loadWindow = null;

// 创建数据载入窗口
const createLoadWindow = exports.createLoadWindow = () => {
    loadWindow = new BrowserWindow({
        width: 200,
        height: 200,
        webPreferences: {
            nodeIntegration: true
        }
    })

    loadWindow.loadFile(path.join(__dirname, './pages/load.html'))

    loadWindow.once('ready-to-show', () => {
        loadWindow.show();
    })

    // 窗口关闭事件
    loadWindow.on('closed', () => {
        loadWindow = null
    })


    loadWindow.webContents.openDevTools()
}

// 创建main窗口
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.setMenu(null)
    mainWindow.loadFile('index.html')
    mainWindow.webContents.openDevTools()
}

// 创建item窗口
const createItemWindow = exports.createItemWindow = (item) => {
    const itemWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // 将数据id传递给窗口
    itemWindow.itemId = item.id
    itemWindow.setMenu(null)
    itemWindow.loadFile(path.join(__dirname, './pages/item.html'))

    itemWindow.once('ready-to-show', () => {
        itemWindow.show();
    });

    itemWindow.on('closed', () => {
        itemWindows.delete(itemWindow) //从已关闭的窗口Set中移除引用
        itemWindow = null
    })

    itemWindows.add(itemWindow) //将item窗口添加到已打开时设置的窗口
    itemWindow.webContents.openDevTools()
    return itemWindow
}

// 打开item窗口对应文件，并将数据发送到对象item窗口
const openItemFile = exports.openItemFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send('file-opened', file, content); // 将文件的内容发送到提供的浏览器窗口
}

// This method will be called when Electron has finished
// app.whenReady().then(createMainWindow)
// app准备好之后，加载载入文件窗口
app.whenReady().then(createLoadWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


// 根据主窗口异步消息，加载数据，加载数据完成后，创建main窗口
ipcMain.on('load-data', (event, arg) => {
    // 同步开始载入文件
    global.data.data = require('./loadfile')

    // 创建main窗口
    createMainWindow()

    // 创建打开状态item窗口
    global.data.data.items.forEach(item => {
        createItemWindow(item)
    });

    // 发送消息，关闭数据载入窗口
    event.sender.send('load-end')
})