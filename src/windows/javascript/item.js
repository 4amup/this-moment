// CONST 变量
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const Common = require('../../lib/common');

// 全局数据变量
let item = currentWindow.item;

// OFFSET计数器
let offsetIndex = -1;

// 全局dom变量
let userCommand = document.getElementById('user-command');
let userSetting = document.getElementById('user-setting');
let timeCommand = document.getElementById('time-command');
let messageElement = document.getElementById('message');
let caltextElement = document.getElementById('caltext');
let content = document.getElementById('content');
let content_date = document.getElementById('content-date');
let content_time = document.getElementById('content-time');
let content_type = document.getElementById('content-type');
let content_type_checked = document.getElementById(item.content_type);
let pinElement = document.getElementById('pin');
let colorSelected = document.getElementById(item.color);

// 初始化生成调色板
renderPalette();

//初始化窗口内容和样式
renderItem();

// 先直接执行，然后按秒刷新
caltextElement.innerText = renderMessage(item);
setInterval(() => {
    caltextElement.innerText = renderMessage(item);
}, 1000);

//user-comand区域事件监听
userCommand.addEventListener('click', event => {
    event.stopPropagation();
    switch (event.target.id) {
        case 'add':
            itemCreate();
            break;
        case 'close':
            ipcRenderer.send('close-item', item);
            break;
        case 'menu':
            userSetting.style.visibility = 'visible';
            userCommand.style.visibility = 'hidden';
            break;
        case 'pin':
            if (item.pin) {
                item.pin = false;
            } else {
                item.pin = true;
            }
            renderItem();
            ipcRenderer.send('update-item', item);
            break;
        default:
            break;
    }
})

// 点击内容区域，自动隐藏
document.addEventListener("click", event => {
    userSetting.style.visibility = 'hidden';
    userCommand.style.visibility = 'visible';
});

// 隐藏菜单功能设置
userSetting.addEventListener("click", event => {
    let className = event.target.className;

    if (className !== "setting-item" && className !== "color-item") {
        return;
    }

    // 设置值
    let setting = event.target.id;

    // 用户命令
    if (className === "setting-item") {
        switch (setting) {
            case "delete":
                ipcRenderer.send('delete-item', item);
                break;
            case "show-list":
                ipcRenderer.send('show-list');
                break;
            default:
                break;
        };
    }

    // item属性设置
    if (className === "color-item") {
        colorSelected.innerHTML = ``;
        item.color = setting;
        colorSelected = document.getElementById(item.color);
        colorSelected.innerHTML = `<span class="iconfont icon-selected"></span>`;
        document.body.style.background = setting;
        ipcRenderer.send('update-item', item);
    }

    // 点击后隐藏menu
    userSetting.style.visibility = 'hidden';
});


// 自动保存：监听输入时自动保存
content.addEventListener("input", updateItem);
content_type.addEventListener("input", updateItem);
timeCommand.addEventListener("input", updateItem);

// 功能：根据主数据生成颜色选择面板
function renderPalette() {
    let colorPalette = document.getElementById('color-palette');
    colorPalette.innerText = null;
    Common.ITEM_COLOR.forEach(color => {
        let div = document.createElement('div');
        div.id = color;
        div.className = 'color-item';
        div.style.background = color;
        colorPalette.appendChild(div);
    });
}

// 功能：渲染item窗口
function renderItem(event) {
    // 内容渲染
    content.innerText = item.content;
    content_date.value = item.content_date;
    content_time.value = item.content_time;
    document.body.style.background = item.color;
    content_type_checked.checked = true;

    // 样式渲染
    if (item.pin) {
        pinElement.style.background = 'grey';
    } else {
        pinElement.style.background = '';
    };

    // 颜色选中勾选
    if (colorSelected) colorSelected.innerHTML = ``;
    colorSelected = document.getElementById(item.color);
    colorSelected.innerHTML = `<span class="iconfont icon-selected"></span>`;

    // 动态改变工具栏可见性
    if (currentWindow.isFocused()) {
        userCommand.style.visibility = 'visible';
        timeCommand.style.visibility = 'visible';
    } else {
        userCommand.style.visibility = 'hidden';
        timeCommand.style.visibility = 'hidden';
    }

    // 动态改变设置栏属性
    userSetting.style.visibility = 'hidden';

}

// 功能：更新当前item数据
function updateItem() {
    item.update_dt = Date.now();
    item.content = content.innerText;
    item.content_date = content_date.value;
    item.content_time = content_time.value;
    item.content_type = getContenType('content-type');

    // 传送数据回主进程
    ipcRenderer.send('update-item', item);
}

// 功能：添加新窗口
function itemCreate() {
    // 窗口偏移index设置
    offsetIndex++;
    if (offsetIndex > Common.ITEM_OFFSET.length - 1) {
        offsetIndex = 0;
    };

    let postion = Common.ITEM_OFFSET[offsetIndex];

    if (offsetIndex === 0) {
        postion[0] + currentWindow.getSize()[0];
    }

    if (offsetIndex === 1) {
        postion[0] - currentWindow.getSize()[0];
    }

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
    ipcRenderer.send('open-item', item);
    ipcRenderer.send('update-item', item);
}

// 根据input渲染message，content还有1年3个月1天23小时2分就开始，content已经过去345天2分
// type 1按秒显示，2按分钟显示，3按小时显示，4按天显示，5按月显示，6按年显示；不传此参数，就是按秒显示
function renderMessage(item) {
    //有日期或时间才计算，否则仅仅显示content
    //只有日期，仅仅计算到天数
    //只有时间，按当天计算
    if (!item.content) {
        return '<-单击输入';
    }

    if (!item.content_date && !item.content_time) {
        return '';
    }

    let interval;
    let datetime;
    let timestamp;
    let now = Date.now();
    let nowDate = new Date(now);
    let intervalStr;

    // 日期为空，日期按当天
    if (!item.content_date) {
        datetime = `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1) < 10 ? "0" + "" + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1)}-${nowDate.getDate() < 10 ? "0" + "0" + nowDate.getDate() : nowDate.getDate()}`;
    } else {
        datetime = item.content_date;
    }

    // 时间为空，时间为00:00
    if (!item.content_time) {
        datetime = datetime + `T00:00`;
    } else {
        datetime = datetime + 'T' + item.content_time;
    }

    timestamp = Date.parse(datetime);

    // 如果date和time有值，才继续，否则直接返回
    if (!timestamp) {
        messageElement.innerText = item.content;
        return;
    } else {
        interval = timestamp - now;
    }

    // 计算时间间隔
    switch (item.content_type) {
        case 'second'://second
            intervalStr = Math.floor(Math.abs(interval) / 1000) + '秒';
            break;
        case 'minute'://minute
            intervalStr = Math.floor(Math.abs(interval) / (60 * 1000)) + '分钟';
            break;
        case 'hour'://hour
            intervalStr = Math.floor(Math.abs(interval) / (60 * 60 * 1000)) + '小时';
            break;
        case 'day'://day
            intervalStr = Math.floor(Math.abs(interval) / (24 * 60 * 60 * 1000)) + '天';
            break;
        case 'full'://full年月日时分秒
            intervalStr = getFullInterval(timestamp, now);
            break;
        default:
            break;
    }

    if (interval > 0) {//将来
        return `还有${intervalStr}`;
    } else {//过去
        return `已过去${intervalStr}`;
    }

}

// 传入两个时间戳，返回相差的年月天时分秒，datetime1为小，datetime2为大
function getFullInterval(datetime1, datetime2) {
    // 借天标志位
    let isBorrowDay = false;

    // 转换成时间对象，1为小时间，2为大时间
    let dateTime1, dateTime2;

    // 比较时间
    if (datetime1 < datetime2) {
        dateTime1 = new Date(datetime1);
        dateTime2 = new Date(datetime2);
    } else if (datetime1 > datetime2) {
        dateTime1 = new Date(datetime2);
        dateTime2 = new Date(datetime1);
    }

    // 取数值
    let yearDiff = dateTime2.getFullYear() - dateTime1.getFullYear();
    let monthDiff = dateTime2.getMonth() - dateTime1.getMonth();
    let dayDiff = dateTime2.getDate() - dateTime1.getDate();
    let hourDiff = dateTime2.getHours() - dateTime1.getHours();
    let minuteDiff = dateTime2.getMinutes() - dateTime1.getMinutes();
    let secondDiff = dateTime2.getSeconds() - dateTime1.getSeconds();

    // 借位算差值
    if (secondDiff < 0) {
        secondDiff += 60;
        minuteDiff--;
    }

    if (minuteDiff < 0) {
        minuteDiff += 60;
        hourDiff--;
    }
    if (hourDiff < 0) {
        hourDiff += 24;
        dayDiff--;
        isBorrowDay = true;
    }
    if (dayDiff < 0) {
        // 计算截止日期上一个月有多少天，补上去
        let prevMonth = getMonthDays(dateTime2.getFullYear(), dateTime2.getMonth() + 1 - 1);
        dayDiff += prevMonth;

        // 截止日期是月底最后一天，且day=本月天数，即刚好是一个月，如20160131~20160229，day=29，刚好1个月
        // 这种情况刚好是整月，不用向month借位，只需day置0
        if (!isBorrowDay
            && dateTime2.getDate() === getMonthDays(dateTime2.getFullYear(), dateTime2.getMonth() + 1)
            && dayDiff >= getMonthDays(dateTime2.getFullYear(), dateTime2.getMonth() + 1)
        ) {
            dayDiff = 0;
        } else {
            monthDiff--;
        }
    }
    if (monthDiff < 0) {
        monthDiff += 12;
        yearDiff--;
    }

    return `${yearDiff}年${monthDiff}个月${dayDiff}天${hourDiff}小时${minuteDiff}分钟${secondDiff}秒`;
}

// 闰年判断
function isLeapYear(year) {
    let r = year / 100
    if (r === parseInt(r)) {
        r = year / 400
        return r === parseInt(r)
    }
    r = year / 4
    if (r === parseInt(r)) {
        return true
    }
    return false
}

// 根据年月返回当月的天数，如2020年1月，返回31天；2020,2，返回29天
function getMonthDays(year, month) {
    let commonMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let leapMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (isLeapYear(year)) {
        return leapMonth[month - 1];
    } else {
        return commonMonth[month - 1];
    }
}

function getContenType(tagNameAttr) {
    var radio_tag = document.getElementsByName(tagNameAttr);
    for (var i = 0; i < radio_tag.length; i++) {
        if (radio_tag[i].checked) {
            var checkvalue = radio_tag[i].id;
            return checkvalue;
        }
    }
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

    if (position[0] < 0) {
        position[0] = 5;
    }

    if (position[1] < 0) {
        position[1] = 5;
    }
    return position;
}

ipcRenderer.on('item-change', renderItem);