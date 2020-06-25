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
setting.login = setting.login ? true : false;
setting.open = setting.open ? true : false;
login.checked = setting.login;
open.checked = setting.open;

// user-comand区域事件监听
backElement.addEventListener('click', () => {
    ipcRenderer.send('back');
});

closeElement.addEventListener('click', () => {
    currentWindow.close();
});

// 设置项事件监听
settingCommand.addEventListener("input", event => {
    let item = event.target;

    switch (item.id) {
        case "login":
            setting.login = document.getElementById(item.id).checked;
            ipcRenderer.send('update-setting', setting);
            break;
        case "open":
            setting.open = document.getElementById(item.id).checked;
            ipcRenderer.send('update-setting', setting);
            break;
        default:
            break;
    }
});