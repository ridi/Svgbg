const fs = require('fs');
const path = require('path');
const junk = require('junk');
const each = require('async/each');
const map = require('async/map');
const SVGO = require('./plugins/customSvgo');
const TemplateBuilder = require('./plugins/templateBuilder');

//// svg min
const svgoConfig = {
  plugins: [
    { removeTitle: true },
    { removeDimensions: true },
    { removeStyleElement: true },
    { removeAttrs: { attrs: 'path:(fill|id|clip-path|fill-rule|clip-rule)' }}
  ]
};

const svgo = new SVGO(svgoConfig);
const srcPath = path.resolve(__dirname, './test/src');
const destPath = path.resolve(__dirname, './test/dist');
const svgList = fs.readdirSync(srcPath).filter(junk.not);
console.log(svgList);
const minifiedSvgList = [];

each(svgList, (filename) => {
  const srcSvg = fs.readFileSync(path.join(srcPath, filename));

  svgo.optimize(srcSvg, (minifiedSvgJs, minifiedSvgStr) => {
    fs.writeFileSync(path.resolve(destPath, filename), minifiedSvgStr);
    const svgJs = minifiedSvgJs.content[0];

    function sortPaths (list) {
      return list.map((element) => {
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
    };

    minifiedSvgList.push(svgForTemplate);
  });
});

each(minifiedSvgList, (svg) => {
  console.log(svg);
});

//// template build
const templateBuilder = new TemplateBuilder(minifiedSvgList);
templateBuilder.build([
  {
    srcPath: path.resolve(__dirname, './test/templates/sample.less.hbs'),
    destPathList: [ path.resolve(__dirname, './test/dist') ]
  },
  {
    srcPath: path.resolve(__dirname, './test/templates/sample.html.hbs'),
    destPathList: [ path.resolve(__dirname, './test/dist') ]
  },
]);
