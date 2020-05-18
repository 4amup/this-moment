const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')
const { settingDB, itemDB } = require('../../lib/database')

class ItemWindow extends BrowserWindow {
    constructor(item) {
        super({
            title: Common.LIFE_OCEAN,
            icon: path.join(__dirname, '../../../assets/icon.png'),
            frame: false,
            width: Common.WINDOW_SIZE_LOAD.width,
            height: Common.WINDOW_SIZE_LOAD.height,
            titleBarStyle: 'hidden-inset',
            webPreferences: {
                nodeIntegration: true,
            },
        });
        this.item = item;
        this.setMenu(null);
        this.loadURL(Common.WINDOW_URL.item);
        if (Common.DEBUG_MODE) this.webContents.openDevTools();
    }

    saveItem() {
        // 数据查找
        let flag = itemDB.get('items')
            .find({ id: this.item.id })
            .value();

        // 查到更新，查不到插入
        if (flag) {
            itemDB.get('items')
                .find({ id: this.item.id })
                .assign(this.item)
                .write();
        } else if(this.item.content) {
            itemDB.get('items')
                .push(this.item)
                .write();
        }
    }
}

module.exports = ItemWindow;