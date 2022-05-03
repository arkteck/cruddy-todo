const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};


// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = Promise.promisify((text, callback) => {

  counter.getNextUniqueId((err, counterString) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(path.join(exports.dataDir, counterString + '.txt'), text, (error) => {
        if (error) {
          callback(error);
        } else {
          var createTime = Date().toString();
          var updateTime = Date().toString();
          fs.writeFile(path.join(exports.timeDir, counterString + '.txt'), `${createTime}\n${updateTime}`, (error) => {
            if (error) {
              callback(error);
            } else {
              callback(null, {id: counterString, text, createTime, updateTime});
            }
          });
        }
      });
    }
  });
});

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
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
      Promise.all(promArr)
        .then((data) => {
          callback(null, data);
        })
        .catch((error) => {
          callback(error);
        });
    }
  });
};

exports.readOne = Promise.promisify((id, callback) => {

  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { id, text: data.toString() });
    }
  });
});

exports.update = Promise.promisify((id, text, callback) => {

  fs.exists(path.join(exports.dataDir, id + '.txt'), (exists) => {
    if (!exists) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          callback(err);
        } else {
          fs.readFile(path.join(exports.timeDir, id + '.txt'), (err, data) => {
            if (err) {
              callback(err);
            } else {
              data = data.toString().split('\n');
              var createTime = data[0];
              var updateTime = Date().toString();
              fs.writeFile(path.join(exports.timeDir, id + '.txt'), `${createTime}\n${updateTime}`, (err) => {
                if (err) {
                  callback(err);
                } else {
                  callback(null, {id, text, createTime, updateTime});
                }
              });
            }
          });
        }
      });

    }
  });

});

exports.delete = Promise.promisify((id, callback) => {

  fs.rm(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(err);
    } else {
      fs.rm(path.join(exports.timeDir, id + '.txt'), (err) => {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    }
  });

});

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');
exports.timeDir = path.join(__dirname, 'time');
exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};