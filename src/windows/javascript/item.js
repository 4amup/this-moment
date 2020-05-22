// CONST 变量
const { remote, ipcRenderer } = require('electron');
const currnetWindow = remote.getCurrentWindow();

// 全局dom变量
let userSetting = document.getElementById('user-setting');
let userComand = document.getElementById('user-command');
let container = document.getElementById('container');
let content = document.getElementById('content');//内容-事件
let content_dt = document.getElementById('content-dt');//内容-时间

// 全局数据变量
let item = currnetWindow.item;

// 根据数据对象item->view
content.value = item.content;
content_dt.value = item.content_dt;
container.style.background = item.color;

//----------------------------user-comand区域事件监听---------------------------------------
userComand.addEventListener("click", event => {
    event.stopPropagation();
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "exit":
            ipcRenderer.send('item-close', item);
            // currnetWindow.close();
            break;
        case "add":
            itemCreate();
            break;
        case "del":
            ipcRenderer.send('item-delete', item);
            break;
        case "menu":
            userSetting.className = 'setting-show';
            break;
        default:
            break;
    }
});

container.addEventListener("click", event => {
    userSetting.className = 'setting-init';
})

userSetting.addEventListener("click", event => {
    event.stopPropagation();
    let className = event.target.className;
    if (className !== "button" && className !== "color-pad") {
        return;
    }

    // 设置值
    let setting = event.target.value;

    // 设置功能
    if (className === "button") {
        switch (setting) {
            case "delete":
                ipcRenderer.send('item-delete', item);
                break;
            case "show-list":
                ipcRenderer.send('show-list');
                break;
            default:
                break;
        };
    } else if (className === "color-pad") {
        container.style.background = setting;
        item.color = setting;
        ipcRenderer.send('item-update', item);
    }

    userSetting.className = 'setting-init';
});


// 自动保存：监听输入时自动保存
content.addEventListener("input", updateItem);
content_dt.addEventListener("input", updateItem);

// 初始化工具栏可见性
if (currnetWindow.isFocused()) {
    userComand.style.visibility = 'visible';
} else {
    userComand.style.visibility = 'hidden';
}

// 动态改变工具栏可见性
ipcRenderer.on('item-focus', () => {
    userComand.style.visibility = 'visible';
});

ipcRenderer.on('item-blur', () => {
    userComand.style.visibility = 'hidden';
});


// 函数功能，更新当前窗口对象的事件信息
function updateItem() {
    item.update_dt = Date.now();
    item.content = content.value;
    item.content_dt = content_dt.value;
    // 传送数据回主进程
    ipcRenderer.send('item-update', item);
}

// 添加新窗口
function itemCreate() {
    let item = {
        id: Date.now(),
        create_dt: Date.now(),
        update_dt: Date.now(),
        open: true,
        content: '',
        content_dt: '',
        color: 'red'
    }
    ipcRenderer.send('item-create', item);
    ipcRenderer.send('item-update', item);
}