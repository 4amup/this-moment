const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')

class ListWindow extends BrowserWindow {
    constructor() {
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
            show: true
        });
        this.setMenu(null);
        this.loadURL(Common.WINDOW_URL.list);
        if (Common.DEBUG_MODE) this.webContents.openDevTools();
    }
}

module.exports = ListWindow;