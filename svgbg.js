const fs = require('fs');
const path = require('path');
const junk = require('junk');
const each = require('async/each');
const map = require('async/map');
const SVGO = require('./plugins/customSvgo');
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
    const svgo = new SVGO(options);

    each(this.svgList, (filename) => {
      const srcSvg = fs.readFileSync(path.join(src, filename));

      svgo.optimize(srcSvg, (minifiedSvgJs, minifiedSvgStr) => {
        fs.writeFileSync(path.resolve(dest, filename), minifiedSvgStr);
        const svgJs = minifiedSvgJs.content[0];

        function sortPaths (pathList) {
          return pathList.map((element) => {
            if (element.elem === 'g') {
              return sortPaths(element.content);
            } else if (element.elem === 'path') {
              return element.attrs.d.value;
            } else {
              console.log(element);
            }
          });
        }

        const svgForTemplate = {
          name: filename.substr(0, filename.lastIndexOf('.')),
          viewBox: {
            width: svgJs.attrs.viewBox.value.split(' ')[2],
            height: svgJs.attrs.viewBox.value.split(' ')[3],
          },
          pathList: sortPaths(svgJs.content).concat().filter((element)=>{
            if (element !== undefined) {
              return element;
            }
          }),
          fullSvgStr: minifiedSvgStr,
        };

        this.minifiedSvgList.push(svgForTemplate);
      });

    });
  }

  logMinSvgList () {
    each(this.minifiedSvgList, (svg) => {
      console.log(svg);
    });
  }

  buildTemplate () {
    const templateBuilder = new TemplateBuilder(this.minifiedSvgList);
    templateBuilder.build([
      this.config.background,
      this.config.inline,
      this.config.demo,
    ]);
  }

  build () {
    this.minify();
    this.logMinSvgList();
    this.buildTemplate();
  }
}

module.exports = SvgGenerator;