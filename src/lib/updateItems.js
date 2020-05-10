// 函数功能：从主数据读取最新的items，并根据命令更新
module.exports = function updateItems(itemNew, command) {
    let items = remote.getGlobal('data').data.items
    let destIndex = -1 //是否找到
    for (let index = 0; index < items.length; index++) {
        let item = items[index];
        if (item.id == itemNew.id) {
            destIndex = index
        } else {
            continue
        }
    }

    // 根据指令做数据操作
    switch (command) {
        case "update":
            if (destIndex > -1) {
                items[destIndex] = itemNew
            } else {
                items.push(itemNew)
            }
            break;
        case "delete":
            if (destIndex > -1) {
                items.splice(destIndex, 1)
            }
            break;
        default:
            break;
    }

    // update 主进程的items数据对象
    remote.getGlobal('data').data.items = items

    // 发送数据更新指令
    ipcRenderer.send('update-items')
}