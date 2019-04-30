var sqlite3 = require('sqlite3').verbose();
const path = require('path');
var db = new sqlite3.Database(path.join(__dirname, 'HxIm.db')); 