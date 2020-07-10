const path = require('path')

// 此类承载静态属性，抽象出常用属性
class Common {
    static DEBUG_MODE = true;
    // static DEBUG_MODE = false;
    static TITLE = '此刻';
    static ICON = '../../static/icon.png';
    static TRAY = './static/tray.png';
    // static DB_SETTING = '../userdata/setting.json';
    static DB_SETTING = '/resources/userdata/setting.json';
    static DB_ITEMS = '/resources/userdata/items.json';
    // static DB_ITEMS = '../userdata/items.json';
    static BLANK = '../../static/blank.png';
    static WINDOW_SIZE = {
        width: 800,
        height: 600,
    };
    static WINDOW_SIZE_LOAD = {
        width: 800,
        height: 400,
    };
    static WINDOW_SIZE_LIST = {
        width: 400,
        height: 800,
        minWidth: 200,
        minheight: 200
    };
    static WINDOW_SIZE_SETTING = {
        width: 400,
        height: 800,
    };
    static WINDOW_SIZE_ITEM = {
        width: 280,
        height: 120,
        minWidth: 280,
        minHeight: 120
    };
    static WINDOW_URL = {
        load: `file://${path.join(__dirname, '/../windows/views/load.html')}`,
        list: `file://${path.join(__dirname, '/../windows/views/list.html')}`,
        item: `file://${path.join(__dirname, '/../windows/views/item.html')}`,
        setting: `file://${path.join(__dirname, '/../windows/views/setting.html')}`,
    }
    static MENU_LABEL = {
        about: '关于 Electronic Wechat',
        service: '服务',
        hide: '隐藏应用',
        hideOther: '隐藏其他窗口',
        showAll: '显示全部窗口',
        pref: '偏好',
        quit: '退出',
        edit: '编辑',
        undo: '撤销',
        redo: '取消撤销',
        cut: '剪切',
        copy: '复制',
        paste: '粘贴',
        selectAll: '选择全部',
        view: '视图',
        reload: '重新加载当前窗口',
        toggleFullScreen: '切换全屏',
        searchContacts: '搜索联系人',
        devtool: '开发者工具',
        window: '窗口',
        min: '最小化',
        close: '关闭',
        allFront: '全部打开',
        help: '帮助',
        repo: '目录',
        feedback: '联系我们',
        checkRelease: '检查更新',
    };
    static ITEM_COLOR = [
        '#e7e7eb',//紫水晶
        '#ebf6f7',//蓝白
        '#d6e9ca',//白緑
        '#edd1d8',//藕色
        '#dcd3b2',//砂色
        '#a0d8ef',//空色
    ];
    static ITEM_CONTEN_TYPE = [
        'second',
        'minute',
        'hour',
        'day',
        'full',
    ];
    static ITEM_OFFSET = [
        [40, 0],//右
        [40, 0],//左
        [40, 40],//右下
        [-40, 40],//左下
        [40, -40],//右上
        [-40, -40],//左上
    ]
}

module.exports = Common;