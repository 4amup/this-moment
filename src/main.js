const { app, ipcMain } = require('electron');
const {settingDB, itemDB} = require('./lib/database')
const common = require('./lib/common');
const global = require('./lib/global');

const LoadWindow = require('./windows/controllers/loadWindow.js')
const ListWindow = require('./windows/controllers/listWindow.js')
// const ItemWindow = require('./windows/controllers/itemWindow.js')

class App {
    constructor() {
        // 窗口管理
        this.loadWindow = null;
        this.listWindow = null;
        this.itemWindows = new Set();
    }

    init() {
        if (this.CheckInstance()) {
            this.initApp();
            this.initIpc();
        } else {

        }
    }

    CheckInstance() {
        return true
    }

    initApp() {
        app.on('ready', () => {
            this.loadWindow = new LoadWindow();
        });
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        });
    }

    initIpc() {
        ipcMain.on('load-data', event => {
            // 本地数据库读取数据-同步
            global.setting = settingDB.value();
            global.items = itemDB.get('items').value();

            // 逐一打开open状态的item窗口组
            let openitems = global.items.filter((item) => {
                return item.open == true;
            });

            openitems.forEach(item => {
                this.createItemWindow(item.id)
            })

            // 打开list窗口，如目前没有open的item窗口组，则忽略list窗口状态，直接打开
            if (openitems.length == 0) {
                this.createListWindow();
            } else if(this.setting.open) {
                this.createListWindow();
            }

            // 读取完毕关闭数据载入窗口
            this.loadWindow.loadWindow.close();
        })
    }

    createLoadWindow() {
        this.loadWindow = new LoadWindow()
    }

    createListWindow() {
        this.listWindow = new ListWindow()
    }

    createItemWindow() {
        this.itemWindows.add(new ItemWindow())
    }

    createItemWindow(id) {
        let itemWindow = new BrowserWindow({
            width: common.WINDOW_SIZE.item,
            height: common.WINDOW_SIZE.item,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        })
    
        // 将数据id传递给窗口
        // if (item) itemWindow.itemId = item.id
        itemWindow.id = id
        itemWindow.setMenu(null)
        itemWindow.loadURL(common.WINDOW_URL.item)
    
        itemWindow.once('ready-to-show', () => {
            itemWindow.show();
        })
    
        itemWindow.on('closed', () => {
            // itemWindows.delete(itemWindow) //从已关闭的窗口Set中移除引用
            this.itemWindows.delete(itemWindow) //从已关闭的窗口Set中移除引用
            itemWindow = null
        })
    
        this.itemWindows.add(itemWindow) //将item窗口添加到已打开时设置的窗口
        if (common.DEBUG_MODE) itemWindow.webContents.openDevTools();
        return itemWindow
    }
}

new App().init()