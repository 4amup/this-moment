// 添加新窗口
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

function greet(name) {
    console.log('Hello, ' + name + '!');
}

module.exports = {
    itemCreate: itemCreate,
    greet: greet
};