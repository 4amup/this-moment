const path = require('path');
const { BrowserWindow } = require('electron');
const Common = require('../../lib/common');
const { settingDB, itemDB } = require('../../lib/database');

class ItemWindow extends BrowserWindow {
    constructor(item) {
        super({
            title: Common.TITLE,
            // icon: path.join(__dirname, '../../../assets/icon.png'),
            icon: path.join(__dirname, Common.ICON),
            frame: false,
            transparent: true,
            width: item.size[0] ? item.size[0] : Common.WINDOW_SIZE_ITEM.width,
            height: item.size[1] ? item.size[1] : Common.WINDOW_SIZE_ITEM.height,
            minWidth: Common.WINDOW_SIZE_ITEM.minWidth,
            minHeight: Common.WINDOW_SIZE_ITEM.minHeight,
            enableRemoteModule: true,
            webPreferences: {
                nodeIntegration: true,
            },
            skipTaskbar: true,
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