const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')

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
}

module.exports = ItemWindow;