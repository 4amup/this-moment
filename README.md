# 人生海海 有很多海浪 life-ocean wave 
 
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
- [X] 设置页面功能
- [X] 按照windows sticky的逻辑实现
- [X] list页面的search+高亮功能实现
- [X] 思考model和view的同步问题，和数据相关全部放到主进程管理
- [X] handle考虑全部放到main进程管理处，itemWindow的focus和打开已经放到主进程管理了
- [X] 实现了右键菜单的动态生成，未实现关闭和删除功能
- [X] 思考数据和model的映射问题
- [X] 在main.js做双向绑定功能，实现一个数据分发中心，管理item和list页面的数据同步问题
- [X] 重构程序结构，按照推荐目前结构实现
- [X] 置顶功能
- [ ] 新建窗口旋转偏移，避免覆盖
- [ ] 开机自启动
- [ ] css美化

# 功能思路
- 程序启动时，加载data数据，然后有一个数据载入窗口，一闪而过。
- 只要程序没关闭，数据的增删查改都通过渲染进程间传递数据，进行视图的更新。
- 多页面间共享数据，采取ipc通信方式，main存放一个全局数据，每次更新。
- 加入close状态，开关item时候更新，一个是main窗口list列表需要更新，一个是每个item需要更新，初始化程序时按照状态显示item窗口
- 如果item全没开，就必开main窗口的list，否则按照正常的close状态默认开启窗口
- item是否绑定到窗口上？是的
- css需要动态注入

# 备忘
- 将loadWindow的标题栏和窗口统一颜色
- 关闭itemWindow存在问题，判断空时，删除还未完成
- item的key值在点击时创建，同时发出事件更新主数据和别的视图

# 窗口管理

## db设计
1. setting全局设置，键值对储存；
2. items储存数据；
## setting，全局设置，键值对
默认配置好，然后程序只更新

## itemWindow操作集
1. 打开新itemWindow
2. 关闭当前itemWindow。关闭前检查：如有内容，则更新状态。如无内容，则删除item对应的db条目。
3. 保存当前itemWindow的内容，并通知listWindow，更新对应条目的内容
4. 删除当前itemWindow内容，并关闭itemWindow
5. 点击更改颜色
6. 更改透明度
7. 显示listWindow，如已经显示，则focus
8. 点击置顶

## listWindow操作集
1. 打开新的itemWindow
2. 双击item打开对应的itemWindow，如果已经开了，则focus
3. 输入搜索内容，自动搜索，filter列表中的item，并高亮搜索词
4. 点击设置按钮，转到设置页面，更改设置项后，保存并更新前端显示
5. 右键点击item或者hover到item上面，出现close、open或删除的操作
6. 右键菜单打开对应的itemWindow
7. 右键菜单删除对应的itemWindow
8. 右键菜单关闭对应的itemWindow