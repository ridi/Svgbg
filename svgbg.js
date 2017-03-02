const fs = require('fs');
const path = require('path');
const junk = require('junk');
const each = require('async/each');
const mkdir = require('mkdirp');
const CustomSVGO = require('./plugins/customSvgo');
const TemplateBuilder = require('./plugins/templateBuilder');
const Config = require('./plugins/config');

class SvgGenerator {
  constructor(config) {
    this.config = Config(config);
    this.svgo = new CustomSVGO(config.minify.options);
    this.svgList = fs.readdirSync(this.config.src).filter(junk.not);
    this.minifiedSvgList = [];
    this.build = this.build.bind(this);
    this.minify = this.minify.bind(this);
    this.minifyCallback = this.minifyCallback.bind(this);
    this.buildTemplate = this.buildTemplate.bind(this);
  }

  minify(filename, callback) {
    mkdir(this.config.minify.dest);
    if (path.extname(filename) === '.svg') {
      const srcSvg = fs.readFileSync(path.join(this.config.src, filename));
      this.svgo.customOptimize(srcSvg, filename, callback);
    }
  }

  minifyCallback(filename, minifiedSvg) {
    const destPath = path.resolve(this.config.minify.dest, filename);
    fs.writeFileSync(destPath, minifiedSvg.fullSvgStr);
    this.minifiedSvgList.push(minifiedSvg);
  }

  buildTemplate(callback) {
    const templateBuilder = new TemplateBuilder(this.minifiedSvgList);
    templateBuilder.buildAll(this.config.templates);
    if (callback) {
      callback();
    }
  }

  build(callback) {
    each(this.svgList, (filename) => {
      this.minify(filename, this.minifyCallback);
    });
    this.buildTemplate(callback);
  }
}

module.exports = SvgGenerator;
