# life-timer

# 页面设计
- 加载页面：实现数据的加载，数据结构是一个data对象，包含items数组
- list：管理items的增删查
- items：页面多个

# 开发todo list
- [X] 设计数据结构
- [X] electron实现
- [X] 数据载入功能实现
- [X] item的id使用Date.now()即毫秒数
- [X] list页面实现
- [ ] 开机自启动
- [X] 设置页面功能
- [X] 按照windows sticky的逻辑实现
- [X] list页面的search+高亮功能实现
- [ ] 思考model和view的同步问题
- [ ] 思考数据和model的映射问题
- [ ] 置顶功能
- [ ] css美化
- [ ] 在main.js做双向绑定功能，实现一个数据分发中心，管理item和list页面的数据同步问题
- [ ] 重构程序结构，按照推荐目前结构实现

# 功能思路
- 程序启动时，加载data数据，然后有一个数据载入窗口，一闪而过。
- 只要程序没关闭，数据的增删查改都通过渲染进程间传递数据，进行视图的更新。
- 多页面间共享数据，采取ipc通信方式，main存放一个全局数据，每次更新。
- 加入close状态，开关item时候更新，一个是main窗口list列表需要更新，一个是每个item需要更新，初始化程序时按照状态显示item窗口
- 如果item全没开，就必开main窗口的list，否则按照正常的close状态默认开启窗口
