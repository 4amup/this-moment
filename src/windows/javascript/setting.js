const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const Common = require('../../lib/common');

// 读取全局数据
let setting = remote.getGlobal('setting');
let settingCommand = document.getElementById('setting-command');

// 设置项
let login = document.getElementById('login');
let open = document.getElementById('open');
let backElement = document.getElementById('back');
let closeElement = document.getElementById('close');
let loginState = setting.login ? true : false;
let openState = setting.open ? true : false;
login.checked = loginState;
open.checked = openState;

// user-comand区域事件监听
backElement.addEventListener('click', () => {
    currentWindow.close();
});

closeElement.addEventListener('click', () => {
    ipcRenderer.send('back');
});

// 设置项事件监听
settingCommand.addEventListener("input", event => {
    let item = event.target;

    switch (item.id) {
        case "login":
            loginState = document.getElementById(item.id).checked;
            ipcRenderer.send('setting-login', loginState);
            break;
        case "open":
            openState = document.getElementById(item.id).checked;
            ipcRenderer.send('setting-open', openState);
            break;
        default:
            break;
    }
});