const path = require('path');
const Common = require('./common');
const Datastore = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const SETTING_PATH = new FileSync(path.join(__dirname, Common.DB_SETTING));
const ITEM_PATH = new FileSync(path.join(__dirname, Common.DB_ITEMS));

const settingDB = Datastore(SETTING_PATH);
const itemDB = Datastore(ITEM_PATH);

// init itemDB，只有item.json文件为空才执行
settingDB.defaults({open: true});
itemDB.defaults({ items: []}).write();

module.exports = {
    settingDB: settingDB,
    itemDB: itemDB,
};