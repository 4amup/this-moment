const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')

// user-comand区域事件监听
let userComand = document.getElementById('user-command')
userComand.addEventListener("click", (ev) => {
    let button = event.target
    console.log(button.id)
    // 将主窗口控制指令传输到mainProcess
    switch (button.id) {
        case "exit":
            remote.getCurrentWindow().close()
            break;
        case "add":
            mainProcess.addItem()
            break;
        default:
            break;
    }

})

ipcRenderer.on('load-file', (event, data) => {
    console.log("load-file!!!!")
    console.log(data)
});


// 页面加载的三个阶段
// list列表动态图转圈
// node.js读取文件后转化为对象
// 渲染list，插入HTML文件中
const list_element = document.getElementById('list')
list_element.innerText = `加载中...`

let start = Date.now()
let data = {}

let end = Date.now()
let timer = end - start


// 加载完毕，清掉之前的等待状态，切换为根据结果构建的list列表
list_element.innerText = null
data.items.forEach((item, index) => {
    let div = document.createElement("div")
    div.id = item.id
    div.innerText = item.content
    list_element.appendChild(div)
})
