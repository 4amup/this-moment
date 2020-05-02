const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')

// 窗口加载完成后，设置监听事件 
window.onload(() => {

    // user-comand区域事件监听
    let userComand = document.getElementById('user-command')
    userComand.addEventListener("click", (ev) => {
        let button = event.target
        console.log(button.id)
        // 将主窗口控制指令传输到mainProcess
        switch (button.id) {
            case "close":
                remote.getCurrentWindow().close()
                break;
            case "add":
                mainProcess.addItem()
                break;
            default:
                break;
        }
    
    })
})