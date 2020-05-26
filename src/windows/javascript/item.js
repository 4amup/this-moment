// CONST 变量
const { remote, ipcRenderer } = require('electron');
const currnetWindow = remote.getCurrentWindow();
const Common = require('../../lib/common');

// 全局数据变量
let item = currnetWindow.item;

// 全局dom变量
let userSetting = document.getElementById('user-setting');
let colorPalette = document.getElementById('color-palette');
let userComand = document.getElementById('user-command');
let pin = document.getElementById('pin');
let tip = document.getElementById('tip');
let container = document.getElementById('container');
let contentContainer = document.getElementById('content-container');
let content = document.getElementById('content');//内容-事件
let content_date = document.getElementById('content-date');//内容-日期
let content_time = document.getElementById('content-time');//内容-时间
let content_type = document.getElementsByName('content-type');//内容-显示类型
let content_type_checked = document.getElementById(item.content_type);//选中的radio

// 动态生成user-setting区域
colorPalette.innerText = null;
Object.values(Common.ITEM_COLOR).forEach(element => {
    let div = document.createElement('div');
    div.id = element;
    div.className = 'color-pick';
    div.innerText = element;
    div.style.background = element;
    colorPalette.appendChild(div);
});


// 根据数据对象item->view
content.value = item.content;
content_date.value = item.content_date;
content_time.value = item.content_time;
container.style.background = item.color;
if (item.pin) {
    pin.innerText = 'Pined';
} else {
    pin.innerText = 'Pin';
};

content_type_checked.checked = true;

// 先直接执行，然后按秒刷新
tip.innerText = renderTip(item)
setInterval(() => {
    tip.innerText = renderTip(item)
}, 1000);

// 按秒重复刷新时间
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
        case "pin":
            if (item.pin) {
                item.pin = false;
                pin.innerText = 'Pin';
            } else {
                item.pin = true;
                pin.innerText = 'Pined';
            }
            ipcRenderer.send('itemWindow-change', item);
            ipcRenderer.send('item-update', item);
            break;
        default:
            break;
    }
});

// 点击内容区域，自动隐藏
container.addEventListener("click", event => {
    userSetting.className = 'setting-init';
});

userSetting.addEventListener("click", event => {
    event.stopPropagation();
    let className = event.target.className;
    if (className !== "setting-item" && className !== "color-pick") {
        return;
    }

    // 设置值
    let setting = event.target.id;

    // 设置功能
    if (className === "setting-item") {
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
    } else if (className === "color-pick") {
        container.style.background = setting;
        item.color = setting;
        ipcRenderer.send('item-update', item);
    }
    userSetting.className = 'setting-init';
});


// 自动保存：监听输入时自动保存
contentContainer.addEventListener("input", updateItem);

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
    userSetting.className = 'setting-init';
});


// 函数功能，更新当前窗口对象的事件信息
function updateItem() {
    item.update_dt = Date.now();
    item.content = content.value;
    item.content_date = content_date.value;
    item.content_time = content_time.value;
    item.content_type = getContenType('content-type');
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
        content_date: '',
        content_time: '',
        content_type: Common.ITEM_CONTEN_TYPE.type1,
        color: Common.ITEM_COLOR.color1,
        pin: false,
    }
    ipcRenderer.send('item-create', item);
    ipcRenderer.send('item-update', item);
}

// 根据input渲染tip，content还有1年3个月1天23小时2分就开始，content已经过去345天2分
// type 1按秒显示，2按分钟显示，3按小时显示，4按天显示，5按月显示，6按年显示；不传此参数，就是按秒显示
function renderTip(item) {
    //有日期或时间才计算，否则仅仅显示content
    //只有日期，仅仅计算到天数
    //只有时间，按当天计算
    if (!item.content) {
        return '海浪未起';
    }

    if(!item.content_date && !item.content_time) {
        return item.content;
    }

    let interval;
    let datetime;
    let timestamp;
    let now = Date.now();
    let nowDate = new Date(now);
    let intervalStr;

    // 日期为空，日期按当天
    if (!item.content_date) {
        datetime = `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1)<10?"0" +""+(nowDate.getMonth() + 1):(nowDate.getMonth() + 1)}-${nowDate.getDate()<10?"0"+"0"+nowDate.getDate():nowDate.getDate()}`;
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
        tip.innerText = item.content;
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
        return `距离${item.content}还有${intervalStr}`;
    } else {//过去
        return `${item.content}已过去${intervalStr}`;
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

function getContenType(tagNameAttr){
    var radio_tag = document.getElementsByName(tagNameAttr);
    for(var i=0;i<radio_tag.length;i++){
        if(radio_tag[i].checked){
            var checkvalue = radio_tag[i].id;            
            return checkvalue;
        }
    }
}