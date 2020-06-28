'use strict'
const path = require('path')
const { BrowserWindow } = require('electron')
const Common = require('../../lib/common')

class LoadWindow extends BrowserWindow {
    constructor() {
        super({
            title: Common.TITLE,
            // icon: path.join(__dirname, '../../../assets/icon.png'),
            icon: path.join(__dirname, Common.ICON),
            // frame: false,
            center: true,
            resizable: false,
            movable: false,
            width: Common.WINDOW_SIZE_LOAD.width,
            height: Common.WINDOW_SIZE_LOAD.height,
            titleBarStyle: 'hiddenInset',
            enableRemoteModule: true,
            webPreferences: {
                nodeIntegration: true,
            },
            show: false,
            backgroundColor: '#2e2c29'
        });
        this.loadURL(Common.WINDOW_URL.load);
    }
}

module.exports = LoadWindow;