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
      var data = _.map(files, (file) => {
        let id = path.basename(file, '.txt');
        return { id, text: id };
      });
      callback(null, data);
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