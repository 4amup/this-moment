'use strict'
const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')

class LoadWindow extends BrowserWindow {
    constructor() {
        super({
            title: Common.LIFE_OCEAN,
            icon: path.join(__dirname, '../../../assets/icon.png'),
            width: Common.WINDOW_SIZE_LOAD.width,
            height: Common.WINDOW_SIZE_LOAD.height,
            titleBarStyle: 'hidden-inset',
            enableRemoteModule: true,
            webPreferences: {
                nodeIntegration: true,
            },
        });
        this.loadURL(Common.WINDOW_URL.load);
        // if(Common.DEBUG_MODE) this.webContents.openDevTools();
    }
}

module.exports = LoadWindow;