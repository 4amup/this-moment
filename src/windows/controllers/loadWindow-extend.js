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
            webPreferences: {
                nodeIntegration: true,
            },
        })
        
        this.initWindowEvents();

        this.loadURL(Common.WINDOW_URL.load);
        if(Common.DEBUG_MODE) this.webContents.openDevTools();
    }

       
    // createWindow() {
    //     this.loadWindow = new BrowserWindow({
    //         title: Common.LIFE_OCEAN,
    //         icon: path.join(__dirname, '../../../assets/icon.png'),
    //         width: Common.WINDOW_SIZE_LOAD.width,
    //         height: Common.WINDOW_SIZE_LOAD.height,
    //         titleBarStyle: 'hidden-inset',
    //         webPreferences: {
    //             nodeIntegration: true,
    //         },
    //     });
    //     this.initWindowEvents();
    //     this.loadWindow.loadURL(Common.WINDOW_URL.load);
    //     if (Common.DEBUG_MODE) this.loadWindow.webContents.openDevTools();
    //     return this.loadWindow;
    // }

    initWindowEvents() {
        this.once('ready-to-show', () => {
            this.show();
        });

        this.on('closed', () => {
            this = null;
        });
    }

}

module.exports = LoadWindow;