const { ipcRenderer } = require('electron');
// 发送消息通知主线程开始载入文件，载入文件完毕后，关闭载入窗口，加载main窗口和item窗口
ipcRenderer.send('load-data');