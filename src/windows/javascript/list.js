const { remote, ipcRenderer } = require('electron');
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const currentWindow = remote.getCurrentWindow();
const Common = require('../../lib/common');

// OFFSET计数器
let offsetIndex = -1;

// 读取全局数据
let setting = remote.getGlobal('setting');
// let item = null;//当前操作的item引用
let items = remote.getGlobal('items');
let item = null;

let userComand = document.getElementById('user-command')
let listElement = document.getElementById('list')
let searchElement = document.getElementById('search')
let menu = new Menu()//创建右键菜单
menu.append(new MenuItem({
    label: 'open', click() {
        ipcRenderer.send('item-create', item);
    }
}))
menu.append(new MenuItem({
    label: 'close', click() {
        ipcRenderer.send('item-close', item);
    }
}))
menu.append(new MenuItem({
    label: 'delete', click() {
        ipcRenderer.send('item-delete', item);
    }
}))

// 根据数据渲染list列表
contentRender(null, items, null);

// user-comand区域事件监听
userComand.addEventListener("click", (event) => {
    let button = event.target;
    console.log(button.id);
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "close":
            currentWindow.close();
            break;
        case "add":
            itemCreate();
            break;
        default:
            break;
    }
})

// listElement.addEventListener("dblclick", openItemWindow)// item双击open
listElement.addEventListener("dblclick", handleDoubleClick);// item双击open
listElement.addEventListener("contextmenu", contentMenu);// item右键菜单open close del
// search功能按照keyup绑定事件，触发查询操作，高亮查询内容，并过滤
searchElement.addEventListener("input", matchItems);

// 函数功能区

// 函数功能：根据输入内容，查找复合要求的内容，高亮匹配词，重新渲染界面
function matchItems(event) {
    let keyWord = searchElement.value;
    let matchItem;
    if (keyWord == "") {
        matchItem = items;
    }

    // 搜索内容
    let matchItems = items.filter(item => {
        let matchIndex = item.content.indexOf(keyWord);
        return matchIndex > -1;
    })

    // 根据查询结果渲染list列表
    contentRender(null, matchItems, keyWord);
}

// 双击item事件
function handleDoubleClick(event) {
    if (event.target.className !== "item") {
        return;
    }
    // 找到当前双击的item
    let item = findItemById(event.target.id);
    ipcRenderer.send('item-create', item);
}

function contentRender(event, items, keyWord) {
    listElement.innerText = null;
    if (items) {
        items.forEach((item, index) => {
            let div = document.createElement("div");
            div.id = item.id;
            div.className = "item";
            let innerHTML = `${index + 1}. ${item.id} ${item.content} ${item.open}`;
            if (keyWord) {// 高亮关键字处理
                innerHTML = innerHTML.replace(keyWord, `<mark>${keyWord}</mark>`);
            }
            div.innerHTML = innerHTML;
            listElement.appendChild(div);
        })
    } else {
        let div = document.createElement("div");
        div.innerText = '写点你的人生海浪吧！';
        listElement.appendChild(div);

    }
}

// item右键单击事件
function contentMenu(event) {
    event.preventDefault()
    // 非item的事件，不触发
    if (event.target.className !== "item") {
        return;
    }

    // 读取当前双击item的数据对象
    item = findItemById(event.target.id);
    // gv_id = event.target.id;

    // 动态改变menu项目
    if (item.open) {
        menu.items[0].visible = false;
        menu.items[1].visible = true;
    } else {
        menu.items[0].visible = true;
        menu.items[1].visible = false;
    }
    menu.popup(currentWindow);
}

// 根据id查找当前正在操作的item，并返回引用
function findItemById(id) {
    let items = remote.getGlobal('items');
    let item = items.find(value => {
        return value.id == id;
    });
    return item;
}

function itemCreate() {
    

    let item = {
        id: Date.now(),
        create_dt: Date.now(),
        update_dt: Date.now(),
        open: true,
        content: '',
        content_date: '',
        content_time: '',
        content_type: Common.ITEM_CONTEN_TYPE.type1,
        color: Common.ITEM_COLOR.color1,
        pin: false,
        position: getPosition(),
    }
    ipcRenderer.send('item-create', item);
    ipcRenderer.send('item-update', item);
}

function getPosition() {
    // 窗口偏移index设置
    offsetIndex++;
    if (offsetIndex > Common.ITEM_OFFSET.length - 1) {
        offsetIndex = 0;
    };

    let size = currentWindow.getSize();
    let position = currentWindow.getPosition();
    let offset = Common.ITEM_OFFSET[offsetIndex];

    switch (offsetIndex) {
        case 0:
            position[0] += size[0];
            position[0] += offset[0];
            break;
        case 1:
            position[0] -= size[0];
            position[0] -= offset[0];
            break;
        default:
            position[0] += offset[0];
            position[1] += offset[1];
            break;
    }
    return position;
}

// 根据事件渲染列表界面
ipcRenderer.on('list-update', contentRender);