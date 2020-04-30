// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

let main_win = null

// 导入数据文件
// const data = require('./loadfile.js')
const data = {}
const loadFile = exports.loadFile = (data, main_win) => {
  data = require('./loadfile.js')
  if (data) {
    main_win.webContents.send('load-file', data)
  }
}

function createWindow() {
  const win_main = new BrowserWindow({
    width: 400,
    height: 300,
    width: 800,
    height: 800,
    // frame: false,
    webPreferences: {
      // preload: path.join(__dirname, 'loadfile.js')
      nodeIntegration: true
    }
  })

  win_main.setMenu(null)

  // const list_win = new BrowserWindow({
  //   width: 400,
  //   height: 300,
  //   frame: false
  // })
  win_main.loadFile('index.html')
  // list_win.loadFile('./pages/list.html')
  win_main.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)
// app.whenReady().then(createWindow(main_win))
// app.whenReady().then(() => {
//   main_win = new BrowserWindow({
//     width: 400,
//     height: 300,
//     width: 800,
//     height: 800,
//     // frame: false,
//     webPreferences: {
//       // preload: path.join(__dirname, 'loadfile.js')
//       nodeIntegration: true
//     }
//   })

//   win_main.setMenu(null)
//   win_main.loadFile('index.html')
//   win_main.webContents.openDevTools()
// })

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
