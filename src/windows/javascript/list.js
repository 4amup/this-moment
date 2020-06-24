const { remote, ipcRenderer } = require('electron');
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const currentWindow = remote.getCurrentWindow();
const Common = require('../../lib/common');

// OFFSET计数器
let offsetIndex = -1;

// 读取全局数据
let items = remote.getGlobal('items');
let item = null;

let addElement = document.getElementById('add');
let settingElement = document.getElementById('setting');
let closeElement = document.getElementById('close');
let listElement = document.getElementById('list');
let searchElement = document.getElementById('search');

//菜单：显示和删除动态切换显示
let menu = new Menu();
menu.append(new MenuItem({
    label: 'open', click() {
        ipcRenderer.send('create-window-item', item);
    }
}));
menu.append(new MenuItem({
    label: 'close', click() {
        ipcRenderer.send('item-close', item);
    }
}));
menu.append(new MenuItem({
    label: 'delete', click() {
        ipcRenderer.send('item-delete', item);
    }
}));

// 初始化list列表
renderList(event, items);

// 用户命令事件监听
addElement.onclick = itemCreate;

settingElement.onclick = () => {
    ipcRenderer.send('show-setting');
};

closeElement.onclick = () => {
    currentWindow.close();
};

// 双击item打开itemWindow
listElement.addEventListener("dblclick", handleDoubleClick);

// item右键菜单open close del
listElement.addEventListener("contextmenu", showMenu, true);

// 搜索功能，高亮查询内容
searchElement.addEventListener("input", matchItems);

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
    renderList(event, matchItems, keyWord);
}

// 双击打开item窗口
function handleDoubleClick(event) {
    if (event.target.className !== "item") {
        return;
    }
    // 找到当前双击的item
    let item = findItemById(event.target.id);
    ipcRenderer.send('create-window-item', item);
}

// 由item数组渲染list列表
function renderList(event, items, keyWord) {
    listElement.innerText = null;
    if (items) {
        items.forEach(item => renderItem(event, item, keyWord));
    } else {
        let div = document.createElement("div");
        div.innerText = '写点你的人生海浪吧！';
        listElement.appendChild(div);

    }
}

// 由item属性，渲染item样式
function renderItem(event, item, keyWord) {
    let element = document.getElementById(item.id);

    if (!element) {
        element = document.createElement("div");
        listElement.append(element);
        element.id = item.id;
    }

    // 是否打开状态
    if (item.open) {
        element.className = "item fold";
    } else {
        element.className = "item";
    }

    // 背景色
    element.style.backgroundColor = item.color;

    // 更新时间
    let time = calculateTime(item.update_dt);

    // 高亮内容关键词
    let content = item.content;
    if (keyWord) {
        content = content.replace(keyWord, `<mark>${keyWord}</mark>`);
    }

    // 添加内容
    let innerHTML = `<time>${time}</time><p>${content}</p>`;

    // 内容放到节点上
    element.innerHTML = innerHTML;
}

// 计算时间，返回字符串，如果是今天，返回具体时间，否则返回5天前
function calculateTime(agoTimestamp) {
    let nowTimestamp = Date.now();
    let now = new Date(nowTimestamp);
    let ago = new Date(agoTimestamp);

    if (now.getFullYear() === ago.getFullYear() && now.getMonth() === ago.getMonth() && now.getDate() === ago.getDate()) {
        let hours = ago.getHours();
        let minutes = ago.getMinutes();
        if (hours < 10) {
            hours = `0${hours}`;
        }
        if (minutes<10) {
            minutes = `0${minutes}`;
        }
        return `${hours}:${minutes}`;
    } else {
        let days = Math.round((nowTimestamp - agoTimestamp) / (24 * 3600 * 1000));
        return `${days}天前`;
    }
}

// 动态显示操作菜单
function showMenu(event) {
    event.preventDefault()
    // 非item的事件，不触发
    if (event.target.className.indexOf("item") === -1) {
        return;
    }

    // 读取当前双击item的数据对象
    item = findItemById(event.target.id);

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

// 根据id从main-process中查找item，返回其引用
function findItemById(id) {
    let items = remote.getGlobal('items');
    let item = items.find(value => {
        return value.id == id;
    });
    return item;
}

// 函数功能：新建item数据对象，并将事件发送给main进程
function itemCreate() {
    let item = {
        id: Date.now(),
        create_dt: Date.now(),
        update_dt: Date.now(),
        open: true,
        content: '',
        content_date: '',
        content_time: '',
        content_type: Common.ITEM_CONTEN_TYPE[0],
        color: Common.ITEM_COLOR[0],
        pin: false,
        position: getPosition(),
        size: Common.WINDOW_SIZE_ITEM,
    }
    ipcRenderer.send('create-window-item', item);
    ipcRenderer.send('item-update', item);
}

// 新建窗口偏移设置，防止重叠窗口
function getPosition() {
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

    if (position[0] < 0) {
        position[0] = 5;
    }

    if (position[1] < 0) {
        position[1] = 5;
    }

    return position;
}

// 刷新list页面
ipcRenderer.on('list-update', renderList);