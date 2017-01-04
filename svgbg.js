const fs = require('fs');
const path = require('path');
const junk = require('junk');
const each = require('async/each');
const CustomSVGO = require('./plugins/customSvgo');
const TemplateBuilder = require('./plugins/templateBuilder');

class SvgGenerator {
  constructor (config) {
    this.config = config;
    this.svgo = new CustomSVGO(config.minify.options);
    this.svgList = fs.readdirSync(this.config.src).filter(junk.not);
    this.minifiedSvgList = [];
    this.build = this.build.bind(this);
    this.minify = this.minify.bind(this);
    this.minifyCallback = this.minifyCallback.bind(this);
    this.logMinifiedSvgList = this.logMinifiedSvgList.bind(this);
    this.buildTemplate = this.buildTemplate.bind(this);
  }

  static checkDirectory (path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  minify (filename, callback) {
    SvgGenerator.checkDirectory(this.config.minify.dest);
    if (path.extname(filename) === '.svg') {
      const srcSvg = fs.readFileSync(path.join(this.config.src, filename));
      this.svgo.customOptimize(srcSvg, filename, callback);
    }
  }

  minifyCallback (filename, minifiedSvg) {
    const destPath = path.resolve(this.config.minify.dest, filename);
    fs.writeFileSync(destPath, minifiedSvg.fullSvgStr);
    this.minifiedSvgList.push(minifiedSvg);
  }

  logMinifiedSvgList () {
    each(this.minifiedSvgList, (svg) => {
      console.log("saved "+ svg.name);
    });
  }

  buildTemplate (callback) {
    const templateBuilder = new TemplateBuilder(this.minifiedSvgList);
    templateBuilder.buildAll(this.config.templates);
    callback();
  }

  build (callback) {
    each(this.svgList, (filename) => {
      this.minify(filename, this.minifyCallback);
    });
    this.logMinifiedSvgList();
    this.buildTemplate(callback);
  }
}

module.exports = SvgGenerator;