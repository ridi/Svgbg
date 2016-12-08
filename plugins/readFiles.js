const fs = require('fs');
const path = require('path');
const junk = require('junk');

function readFiles(dirPath, handleContent, handleError) {
  const dir = path.join(__dirname, '../', dirPath);
  fs.readdir(dir, function(error, fileList) {
    if (error) {
      handleError(error);
      return;
    }
    fileList = fileList.filter(junk.not);
    console.log(fileList);
    fileList.forEach(function(filename) {
      console.log(filename);
      fs.readFile(path.join(dir, filename), 'utf-8', function(error, content) {
        // console.log(content);
        if (error) {
          handleError(error);
          return;
        }
        handleContent(filename, content);
      });
    });
  });
}

module.exports = readFiles;