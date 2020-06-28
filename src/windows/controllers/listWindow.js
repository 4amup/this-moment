const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')

class ListWindow extends BrowserWindow {
    constructor() {
        super({
            title: Common.TITLE,
            // icon: path.join(__dirname, '../../../assets/icon.png'),
            icon: path.join(__dirname, Common.ICON),
            frame: false,
            width: Common.WINDOW_SIZE_LIST.width,
            height: Common.WINDOW_SIZE_LIST.height,
            enableRemoteModule: true,
            webPreferences: {
                nodeIntegration: true,
            },
        });
        this.setMenu(null);
        this.loadURL(Common.WINDOW_URL.list);
        if (Common.DEBUG_MODE) this.webContents.openDevTools();
    }
}

module.exports = ListWindow;