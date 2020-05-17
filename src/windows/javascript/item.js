// CONST 变量
const { remote, ipcRenderer } = require('electron')
const currnetWindow = remote.getCurrentWindow()

// 全局变量数据变量
let item = null;
let items = remote.getGlobal('items')
if (items) {
    item = items.find((item => {
        return item.id == currnetWindow.windowid;
    }));
};

if(item == undefined) item = null;

// 全局dom变量
let userComand = document.getElementById('user-command')
let content = document.getElementById('content')//内容-事件
let content_dt = document.getElementById('content-dt')//内容-时间

// 根据数据对象item->view
if (item) {
    content.value = item.content
    content_dt.value = item.content_dt
}

//----------------------------user-comand区域事件监听---------------------------------------
userComand.addEventListener("click", (event) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "exit":
            ipcRenderer.send('close-item', item);
            currnetWindow.close();
            break;
        case "add":
            ipcRenderer.send('add-item', null);
            break;
        case "del":
            ipcRenderer.send('del-item', item);
            break;
        case "menu":
            ipcRenderer.send('show-list');
            break;
        default:
            break;
    }

})

// 自动保存：监听输入时自动保存
content.addEventListener("input", updateItem);
content_dt.addEventListener("input", updateItem);

// 函数功能，更新当前窗口对象的事件信息
function updateItem() {
    // id初始赋值
    if (item === null) {
        item = {
            id: Date.now(),
            create_dt: Date.now(),
            open: true,
        }
        currnetWindow.windowid = item.id //更新窗口id
    }

    // item字段更新
    item.update_dt = Date.now();
    item.content = content.value;
    item.content_dt = content_dt.value;
    item.open = true;

    // 传送数据回主进程
    ipcRenderer.send('item-update', item);
}