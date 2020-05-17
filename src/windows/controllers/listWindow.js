const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')

class ListWindow {
    constructor() {
        this.createWindow();
    }

    createWindow() {
        this.listWindow = new BrowserWindow({
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
        this.listWindow.setMenu(null);
        this.listWindow.loadURL(Common.WINDOW_URL.list);
        if (Common.DEBUG_MODE) this.listWindow.webContents.openDevTools();
    }

    initWindowEvents() {
        this.listWindow.once('ready-to-show', () => {
            this.listWindow.show();
        });

        this.listWindow.on('closed', () => {
            this.listWindow = null;
        });
    }

}

module.exports = ListWindow;