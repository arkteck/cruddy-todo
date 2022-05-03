const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};


// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, counterString) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(path.join(exports.dataDir, counterString + '.txt'), text, (error) => {
        if (error) {
          callback(error);
        } else {
          callback(null, {id: counterString, text});
        }
      });
    }
  });
};

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {

      // files is array of filenames
      // for each file, we would have a fs.readfile(file)
      // promisify that fs.readfile(file)
      // push that to an array of promises
      // Promise.all(array of promises)

      var promisify = (asyncFn) => {
        return (...args) => (new Promise((resolve, reject) => {
          asyncFn(...args, (err, ...data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        }));
      };
      var promiseArr = [];
      files.forEach((file) => {
        var promiseFunc = promisify(() => {
          fs.readFile(path.join(exports.dataDir, file), (err, data) => {
            if (err) {
              throw 'error';
            } else {
              return { id, text: data.toString() };
            }
          });
        });
        promiseArr.push(promiseFunc);
      });

      console.log(promiseArr);
      Promise.all(promiseArr)
        .then((allData) => {
          console.log(allData);
          callback(null, allData);
        })
        .catch((err) => {
          callback(err);
        });

    }
  });
};

exports.readOne = (id, callback) => {

  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { id, text: data.toString() });
    }
  });
};

exports.update = (id, text, callback) => {

  fs.exists(path.join(exports.dataDir, id + '.txt'), (exists) => {
    if (!exists) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, {id, text});
        }
      });

    }
  });

};

exports.delete = (id, callback) => {

  fs.rm(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });

};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};