const { app, ipcMain } = require('electron');
const { settingDB, itemDB } = require('./lib/database')
const common = require('./lib/common');
global = require('./lib/global');

const LoadWindow = require('./windows/controllers/loadWindow.js')
const ListWindow = require('./windows/controllers/listWindow.js')
const ItemWindow = require('./windows/controllers/itemWindow.js')

class App {
    constructor() {
        // 窗口管理
        this.loadWindow = null;
        this.listWindow = null;
        this.itemWindows = new Array();
        // this.itemWindows = new Map();
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
            this.createLoadWindow();
        });
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        });
    }

    initIpc() {
        ipcMain.on('load-data', event => {
            // 本地数据库读取数据-同步-引用绑定
            global.setting = settingDB.value();
            global.items = itemDB.get('items').value();

            let openitems = global.items.filter(item => {
                return item.open === true;
            });

            openitems.forEach(item => {
                this.createItemWindow(item)
            })

            // 打开list窗口，如目前没有open的item窗口组，则忽略list窗口状态，直接打开
            if (openitems.length == 0) {
                this.createListWindow();
            } else if (global.setting.open) {
                this.createListWindow();
            }

            // 读取完毕关闭数据载入窗口
            this.loadWindow.close();
        })

        ipcMain.on('item-create', (event, item) => {
            this.createItemWindow(item);
            if (this.listWindow) {
                this.listWindow.webContents.send('list-update', global.items);
            }
        });

        ipcMain.on('item-update', (event, item) => {

            // 查找，找到更新，找不到插入
            let result = itemDB
                .get('items')
                .find({ id: item.id })
                .value();

            if (result) {//update
                itemDB.get('items')
                    .find({ id: item.id })
                    .assign(item)
                    .write();
            } else {//insert
                itemDB.get('items')
                    .push(item)
                    .write()
            }

            if (this.listWindow) {
                this.listWindow.webContents.send('list-update', global.items);
            }
        });

        // 窗口属性改变
        ipcMain.on('itemWindow-change', (event, item) => {
            let itemWindow = this.itemWindows.find(value => {
                return value.item.id === item.id;
            });

            itemWindow.setAlwaysOnTop(item.pin);
        });

        ipcMain.on('item-close', (event, item) => {
            // 关闭对应窗口
            let itemWindow = this.itemWindows.find(value => {
                return value.item.id === item.id;
            });

            if (itemWindow) itemWindow.close();

            item.open = false;

            let flag = itemDB.get('items')
                .find({ id: item.id })
                .value();

            // 如果content变成空的，就删除这个item
            if (!item.content) {
                if (flag) {
                    itemDB.get('items')
                        .remove({ id: item.id })
                        .write();
                }
            } else {
                itemDB.get('items')
                    .find({ id: item.id })
                    .assign(item)
                    .write();
            }

            if (this.listWindow) {
                this.listWindow.webContents.send('list-update', global.items);
            }
        });

        ipcMain.on('item-delete', (event, item) => {
            // 关闭对应窗口
            let itemWindow = this.itemWindows.find(value => {
                return value.item.id === item.id;
            });

            if (itemWindow) itemWindow.close();

            // 删除item
            itemDB.get('items')
                .remove({ id: item.id })
                .write();

            // 更新list视图
            if (this.listWindow) {
                this.listWindow.webContents.send('list-update', global.items);
            }
        });

        ipcMain.on('show-list', () => {
            if (this.listWindow) {
                this.listWindow.focus();
            } else {
                this.createListWindow();
            }
        })
    }

    createLoadWindow() {
        this.loadWindow = new LoadWindow();
        this.loadWindow.once('ready-to-show', () => {
            this.loadWindow.show();
        });

        this.loadWindow.on('closed', () => {
            this.loadWindow = null;
        });
    }

    createListWindow() {
        this.listWindow = new ListWindow();
        this.listWindow.once('ready-to-show', () => {
            this.listWindow.show();
            settingDB.set('open', true)
                .then(() => {
                    global.setting.open = true;
                });
        });

        this.listWindow.on('closed', () => {
            this.listWindow = null;
            settingDB.set('open', false)
                .then(() => {
                    global.setting.open = false;
                });
        });
    }

    createItemWindow(item) {
        let itemWindow = this.itemWindows.find(value => {
            return value.item.id === item.id;
        });

        if (itemWindow) {
            itemWindow.focus();
            return;
        }

        // 设置窗口打开状态
        item.open = true;

        itemWindow = new ItemWindow(item);

        // 窗口引用
        this.itemWindows.unshift(itemWindow);

        // pin
        itemWindow.setAlwaysOnTop(true)

        itemWindow.once('ready-to-show', () => {
            itemWindow.show();
        });

        itemWindow.on('closed', () => {
            // 窗口关闭后，删除该窗口的在窗口集合中的引用
            let index = this.itemWindows.findIndex(value => {
                return value.item.id === itemWindow.item.id;
            });

            this.itemWindows.splice(index, 1);

            itemWindow = null;
        });

        itemWindow.on('focus', () => {
            itemWindow.webContents.send('item-focus');
        });

        itemWindow.on('blur', () => {
            itemWindow.webContents.send('item-blur');
        })
    }
}

new App().init()