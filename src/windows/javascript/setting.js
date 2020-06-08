const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const Common = require('../../lib/common');

// 读取全局数据
let setting = remote.getGlobal('setting');

let userComand = document.getElementById('user-command')

// user-comand区域事件监听
userComand.addEventListener("click", (event) => {
    let button = event.target;
    console.log(button.id);
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "close":
            currentWindow.close();
            break;
        case "back":
            ipcRenderer.send('back');
            break;
        default:
            break;
    }
});