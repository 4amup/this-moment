const path = require('path');
const { BrowserWindow } = require('electron');
const Common = require('../../lib/common');
const { settingDB, itemDB } = require('../../lib/database');

class ItemWindow extends BrowserWindow {
    constructor(item) {
        super({
            title: Common.LIFE_OCEAN,
            icon: path.join(__dirname, '../../../assets/icon.png'),
            frame: false,
            width: item.size[0],
            height: item.size[1],
            minWidth: Common.WINDOW_SIZE_ITEM.minWidth,
            minHeight: Common.WINDOW_SIZE_ITEM.minHeight,
            titleBarStyle: 'hidden-inset',
            enableRemoteModule: true,
            webPreferences: {
                nodeIntegration: true,
            },
            x: item.position[0],
            y: item.position[1],
            show: false,
        });
        this.item = item;
        this.setMenu(null);
        this.loadURL(Common.WINDOW_URL.item);
        if (Common.DEBUG_MODE) this.webContents.openDevTools();
    }
}

module.exports = ItemWindow;