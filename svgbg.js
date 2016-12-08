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
    this.minify = this.minify.bind(this);
    this.buildTemplate = this.buildTemplate.bind(this);
  }

  minify () {
    const { src } = this.config;
    const { dest, options } = this.config.minify;
    const svgo = new CustomSVGO(options);

    each(this.svgList, (filename) => {
      if (path.extname(filename) === 'svg') {
        const srcSvg = fs.readFileSync(path.join(src, filename));
        const destPath = path.resolve(dest, filename);
        svgo.customOptimize(srcSvg, (result) => {
          fs.writeFileSync(destPath, result.fullSvgStr);
          this.minifiedSvgList.push(result);
        });
      }
    });
  }

  logMinSvgList () {
    each(this.minifiedSvgList, (svg) => {
      console.log(svg);
    });
  }

  buildTemplate () {
    const { background, inline, demo } = this.config;
    const templateBuilder = new TemplateBuilder(this.minifiedSvgList);
    templateBuilder.build([
      background,
      inline,
      demo,
    ]);
  }

  build () {
    this.minify();
    this.logMinSvgList();
    this.buildTemplate();
  }
}

module.exports = SvgGenerator;