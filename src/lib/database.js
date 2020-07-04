const path = require('path');
const fs = require('fs');
const os = require('os');
const Common = require('./common');
const Datastore = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// const SETTING_PATH = new FileSync(path.join(__dirname, Common.DB_SETTING));
// const ITEM_PATH = new FileSync(path.join(__dirname, Common.DB_ITEMS));

const userdir = path.join(os.homedir(), '/now');

if (!fs.existsSync(userdir)) {
    fs.mkdirSync(userdir);
} 

const SETTING_PATH = new FileSync(path.join(userdir, '/setting.js'));
const ITEM_PATH = new FileSync(path.join(userdir, '/items.js'));

const settingDB = Datastore(SETTING_PATH);
const itemDB = Datastore(ITEM_PATH);

// init itemDB，只有item.json文件为空才执行
settingDB.defaults({open: true});
itemDB.defaults({ items: []}).write();

module.exports = {
    settingDB: settingDB,
    itemDB: itemDB,
};