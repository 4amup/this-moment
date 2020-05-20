// CONST 变量
const { remote, ipcRenderer } = require('electron')
const currnetWindow = remote.getCurrentWindow()

// 全局dom变量
let userComand = document.getElementById('user-command')
let content = document.getElementById('content')//内容-事件
let content_dt = document.getElementById('content-dt')//内容-时间

// 全局数据变量
let item = currnetWindow.item;

// 根据数据对象item->view
content.value = item.content
content_dt.value = item.content_dt

//----------------------------user-comand区域事件监听---------------------------------------
userComand.addEventListener("click", (event) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "exit":
            ipcRenderer.send('item-close', item);
            // currnetWindow.close();
            break;
        case "add":
            ipcRenderer.send('item-create', {
                id: Date.now(),
                create_dt: Date.now(),
                update_dt: Date.now(),
                open: true,
                content: '',
                content_dt: ''
            });
            break;
        case "del":
            ipcRenderer.send('item-delete', item);
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
    item.update_dt = Date.now();
    item.content = content.value;
    item.content_dt = content_dt.value;
    // 传送数据回主进程
    ipcRenderer.send('item-update', item);
}