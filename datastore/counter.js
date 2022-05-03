const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;
const Promise = require('bluebird');
var fsreadFile = Promise.promisify(fs.readFile);
var fswriteFile = Promise.promisify(fs.writeFile);

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = (callback) => {
  return fsreadFile(exports.counterFile)
    .then(data => {
      callback(null, Number(data));
    }).catch(() => {
      callback(null, 0);
    });
};

const writeCounter = (count, callback) => {
  var counterString = zeroPaddedNumber(count);
  return fswriteFile(exports.counterFile, counterString)
    .then(() => {
      callback(null, counterString);
    }).catch(callback);
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  return readCounter((err, counter) => {
    if (err) {
      callback(err);
    } else {
      writeCounter(counter + 1, callback);
    }
  });
};


// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
