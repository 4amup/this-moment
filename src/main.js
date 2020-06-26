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
        // 从数据库读取数据，绑定对象引用
        ipcMain.on('load-data', event => {
            global.setting = settingDB.value();
            global.items = itemDB.get('items').value();

            let items = global.items.filter(item => {
                return item.open === true;
            });

            // 创建显示窗口
            items.forEach(item => {
                this.createItemWindow(item)
            });

            // 根据设置选项决定是否打开list窗口，如没有open的item窗口组，则直接打开
            if (items.length == 0) {
                this.createListWindow();
            } else if (global.setting.open) {
                this.createListWindow();
            };

            // 读取完毕关闭数据载入窗口
            this.loadWindow.close();
        })

        // 创建item窗口对象
        ipcMain.on('open-item', (event, item) => {
            this.createItemWindow(item);
            if (this.listWindow) this.listWindow.webContents.send('render-item', item);
        });

        // 更新item窗口对象显示状态
        ipcMain.on('update-item', (event, item) => {
            let itemWindow = this.itemWindows.find(value => {
                return value.item.id === item.id;
            });

            itemWindow.setAlwaysOnTop(item.pin);

            this.modifyItemDB(item);

            if (this.listWindow) this.listWindow.webContents.send('render-item', item);
        });

        // 关闭item窗口显示
        ipcMain.on('close-item', (event, item) => {
            // 关闭对应窗口
            let itemWindow = this.itemWindows.find(value => {
                return value.item.id === item.id;
            });

            if (itemWindow) itemWindow.close();

            item.open = false;

            // 如果content变成空的，就删除这个item
            if (item.content) {
                this.modifyItemDB(item);
                this.listWindow.webContents.send('render-item', item);
            } else {
                this.deleteItemDB(item);
                this.listWindow.webContents.send('remove-item', item);
            }
        });

        // 删除item对象并关闭对应窗口
        ipcMain.on('delete-item', (event, item) => {
            // 关闭对应窗口
            let itemWindow = this.itemWindows.find(value => {
                return value.item.id === item.id;
            });

            if (itemWindow) itemWindow.close();

            // 删除item
            this.deleteItemDB(item);

            // 更新list视图
            if (this.listWindow) this.listWindow.webContents.send('remove-item', item);
        });

        // 显示list页面
        ipcMain.on('show-list', () => {
            if (this.listWindow) {
                this.listWindow.focus();
            } else {
                this.createListWindow();
            }
        });

        // 在list页面切换setting页面
        ipcMain.on('show-setting', () => {
            this.listWindow.loadURL(common.WINDOW_URL.setting);
        });

        // 切换回list页面
        ipcMain.on('back', () => {
            this.listWindow.loadURL(common.WINDOW_URL.list);
        });

        // 设置项改变
        ipcMain.on('update-setting', (event, setting) => {
            settingDB.setState(setting).write();
            global.setting = setting;

            if (setting.login) {
                app.setLoginItemSettings({
                    openAtLogin: true,
                });
            } else {
                app.setLoginItemSettings({
                    openAtLogin: false,
                });
            }
            
        });

        ipcMain.on('sync-items', event => {
            if (this.listWindow) {
                this.listWindow.webContents.send('sync-items', global.items);
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
        });

        this.listWindow.on('closed', () => {
            this.listWindow = null;
            settingDB.set('open', false)
                .write();
            global.setting.open = false;
        });

        this.listWindow.on('focus', () => {
            settingDB.set('open', true)
                .write();
            global.setting.open = true;
        });
    }

    createItemWindow(item) {
        // 遍历寻找当前窗口对象，如果窗口已经创建，则聚焦此窗口
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

        // 内存中的窗口数组管理
        this.itemWindows.unshift(itemWindow);

        // 窗口置顶
        itemWindow.setAlwaysOnTop(item.pin)

        // 窗口显示
        itemWindow.once('ready-to-show', () => {
            itemWindow.show();
        });

        // 窗口关闭
        itemWindow.on('closed', () => {
            // 窗口关闭后，删除该窗口的在窗口集合中的引用
            let index = this.itemWindows.findIndex(value => {
                return value.item.id === itemWindow.item.id;
            });

            this.itemWindows.splice(index, 1);

            itemWindow = null;
        });

        itemWindow.on('focus', () => {
            itemWindow.webContents.send('item-change');
        });

        itemWindow.on('blur', () => {
            itemWindow.webContents.send('item-change');
        });

        itemWindow.on('move', () => {
            let item = itemWindow.item;
            item.position = itemWindow.getPosition();
            this.modifyItemDB(item);
        });

        itemWindow.on('resize', () => {
            let item = itemWindow.item;
            item.size = itemWindow.getSize();
            this.modifyItemDB(item);
        });

        this.modifyItemDB(item);

    }

    // 查找，找到更新，找不到插入
    modifyItemDB(item) {
        let result = itemDB
            .get('items')
            .find({ id: item.id })
            .value();

        if (result) {
            itemDB.get('items')
                .find({ id: item.id })
                .assign(item)
                .write();
        } else {
            itemDB.get('items')
                .push(item)
                .write()
        }
    }

    // 删除，找到删除，找不到无效
    deleteItemDB(item) {
        let result = itemDB.get('items')
            .find({ id: item.id })
            .value();

        // 如果content变成空的，就删除这个item
        if (result) {
            itemDB.get('items')
                .remove({ id: item.id })
                .write();
        }
    }

    // 设置setup数据保存
    saveSetting(setting, boolean) {
        settingDB.set(setting, boolean);
    }
}
new App().init()