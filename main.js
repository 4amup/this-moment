// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

// 管理item窗口的多窗口引用
const itemWindows = new Set();

// 数据对象data
global.data = {
    test: 'hello'
}

// 创建数据载入窗口
const createLoadWindow = exports.createLoadWindow = () => {
    const loadWindow = new BrowserWindow({
        width: 200,
        height: 200,
        webPreferences: {
            nodeIntegration: true
        }
    })
    loadWindow.loadFile(path.join(__dirname, './pages/item.html'))

    loadWindow.once('ready-to-show', () => {
        loadWindow.show();
    })

    // 窗口关闭事件
    loadWindow.on('closed', () => {
        loadWindow = null
    })
}

// 创建主窗口
const createItemWindow = exports.createItemWindow = () => {
    const itemWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
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

// 创建item窗口
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

// 打开item窗口对应文件，并将数据发送到对象item窗口
const openItemFile = exports.openItemFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send('file-opened', file, content); // 将文件的内容发送到提供的浏览器窗口
}

// This method will be called when Electron has finished
app.whenReady().then(createMainWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
