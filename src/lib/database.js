const path = require('path')
const Datastore = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const SETTING_PATH = new FileSync(path.join(__dirname, '../../userdata/setting.json'));
const ITEM_PATH = new FileSync(path.join(__dirname, '../../userdata/items.json'));

const settingDB = Datastore(SETTING_PATH);
const itemDB = Datastore(ITEM_PATH);

// init itemDB，只有item.json文件为空才执行
settingDB.defaults({open: true});
itemDB.defaults({ items: []}).write();

module.exports = {
    settingDB: settingDB,
    itemDB: itemDB,
};