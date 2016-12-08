const SVGO = require('svgo');

class SvgMin {
  constructor(options = null) {
    this.svgo = new SVGO(options);
  }

  minify (filename, content) {
    this.svgo.optimize(content, (result)=>{
      console.log(filename, result);
    });
  }
}

module.exports = SvgMin;