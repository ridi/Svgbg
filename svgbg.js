const fs = require('fs');
const path = require('path');
const junk = require('junk');
const each = require('async/each');
const CustomSVGO = require('./plugins/customSvgo');
const TemplateBuilder = require('./plugins/templateBuilder');

class SvgGenerator {
  constructor (config) {
    this.config = config;
    this.svgList = fs.readdirSync(this.config.src).filter(junk.not);
    this.minifiedSvgList = [];
    this.build = this.build.bind(this);
    this.minify = this.minify.bind(this);
    this.logMinSvgList = this.logMinSvgList.bind(this);
    this.buildTemplate = this.buildTemplate.bind(this);
    console.log('constructed');
  }

  minify () {
    console.log('inside miniy');

    const { src } = this.config;
    const { dest, options } = this.config.minify;
    const svgo = new CustomSVGO(options);

    each(this.svgList, (filename) => {
      if (path.extname(filename) === '.svg') {
        const srcSvg = fs.readFileSync(path.join(src, filename));
        const destPath = path.resolve(dest, filename);
        svgo.customOptimize(srcSvg, filename, (result) => {
          fs.writeFileSync(destPath, result.fullSvgStr);
          this.minifiedSvgList.push(result);
        });
      }
    });

    this.logMinSvgList();
    this.buildTemplate();
  }

  logMinSvgList () {
    console.log('logging');
    each(this.minifiedSvgList, (svg) => {
      console.log(svg);
    });
  }

  buildTemplate () {
    console.log('building');
    console.log(this.minifiedSvgList);
    const { background, inline, demo } = this.config;
    const templateBuilder = new TemplateBuilder(this.minifiedSvgList);
    templateBuilder.buildAll([
      background,
      inline,
      demo,
    ]);
  }

  build () {
    this.minify();
  }
}

module.exports = SvgGenerator;