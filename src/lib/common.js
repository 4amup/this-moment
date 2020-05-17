const path = require('path')

// 此类承载静态属性，抽象出常用属性
class Common {
    static DEBUG_MODE = true
    static LIFE_OCEAN = '人生海海';
    static WINDOW_SIZE = {
        width: 800,
        height: 600,
    };
    static WINDOW_SIZE_LOAD = {
        width: 800,
        height: 600,
    };
    static WINDOW_SIZE_LIST = {
        width: 800,
        height: 600,
    };
    static WINDOW_SIZE_SETTING = {
        width: 800,
        height: 600,
    };
    static WINDOW_SIZE_ITEM = {
        width: 400,
        height: 400,
    };
    static WINDOW_URL = {
        // load: `file://${__dirname}/windows/views/load.html`,
        load: `file://${path.join(__dirname, '/../windows/views/load.html')}`,
        list: `file://${path.join(__dirname, '/../windows/views/list.html')}`,
        item: `file://${path.join(__dirname, '/../windows/views/item.html')}`,
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
        repo: 'GitHub 目录',
        feedback: '联系我们',
        checkRelease: '检查更新',
    };
}

module.exports = Common;