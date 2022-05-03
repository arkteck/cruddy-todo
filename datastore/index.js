const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

var fsaccess = Promise.promisify(fs.access);
var fsreadFile = Promise.promisify(fs.readFile);
var fsreaddir = Promise.promisify(fs.readdir);
var fswriteFile = Promise.promisify(fs.writeFile);
var fsrm = Promise.promisify(fs.rm);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = Promise.promisify((text, callback) => {

  return counter.getNextUniqueId((err, id) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (error) => {
        if (error) {
          callback(error);
        } else {
          var createTime = Date().toString();
          var updateTime = Date().toString();
          fs.writeFile(path.join(exports.timeDir, id + '.txt'), `${createTime}\n${updateTime}`, (error) => {
            if (error) {
              callback(error);
            } else {
              callback(null, {id, text, createTime, updateTime});
            }
          });
        }
      });
    }
  });

});

exports.readAll = (callback) => {

  return fsreaddir(exports.dataDir)
    .then(files => {
      var readFile = (filePath) => {
        return new Promise((resolve, reject) => {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              reject (err);
            } else {
              resolve({id: path.basename(filePath, '.txt'), text: data.toString()});
            }
          });
        });
      };
      var promArr = [];
      files.forEach(file => {
        promArr.push(readFile(path.join(exports.dataDir, file)));
      });
      return Promise.all(promArr);
    })
    .then((data) => {
      callback(null, data);
    })
    .catch(callback);

};

exports.readOne = (id, callback) => {

  return fsreadFile(path.join(exports.dataDir, id + '.txt'))
    .then(data => {
      callback(null, { id, text: data.toString() });
    }).catch(callback);

};

exports.update = (id, text, callback) => {

  return fsaccess(path.join(exports.dataDir, id + '.txt'))
    .then(() => {
      return fswriteFile(path.join(exports.dataDir, id + '.txt'), text);
    }).then(() => {
      return fsreadFile(path.join(exports.timeDir, id + '.txt'));
    }).then((data) => {
      data = data.toString().split('\n');
      var createTime = data[0];
      var updateTime = Date().toString();
      return fswriteFile(path.join(exports.timeDir, id + '.txt'), `${createTime}\n${updateTime}`);
    }).then(() => {
      callback(null, {id, text, createTime, updateTime});
    }).catch(callback);

};

exports.delete = (id, callback) => {

  return fsrm(path.join(exports.dataDir, id + '.txt'))
    .then(() => {
      return fsrm(path.join(exports.timeDir, id + '.txt'));
    }).then(callback)
    .catch(callback);

};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');
exports.timeDir = path.join(__dirname, 'time');
exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};