const path = require('path');
const SvgGenerator = require('../svgbg');

const config = {
  src: path.resolve(__dirname, './src'),
  minify: {
    dest: path.resolve(__dirname, './dist'),
    options: {
      plugins: [
        { removeTitle: true },
        { removeDimensions: true },
        { removeStyleElement: true },
        { removeAttrs: { attrs: 'path:(fill|id|clip-path|fill-rule|clip-rule)' }},
        { transformsWithOnePath: true }
      ],
    }
  },
  templates: [
    {
      name: 'svg_icon_full',
      type: 'less',
      dest: [ path.resolve(__dirname, './dist') ],
      template: path.resolve(__dirname, './templates/sample.less.hbs'),
      etc: {
        a: 'b',
      }
    },
    {
      name: 'page_svg_icon',
      type: 'less',
      dest: [ path.resolve(__dirname, './dist') ],
      template: path.resolve(__dirname, './templates/sample_page.less.hbs')
    },
    {
      name: 'svg-icon',
      type: 'html',
      dest: [ path.resolve(__dirname, './dist') ],
      template: path.resolve(__dirname, './templates/sample.html.hbs')
    }
  ]
};

const svgGen = new SvgGenerator(config);
svgGen.build();

// var assert = require('assert');
//
// describe('Array', function(){
//     describe('#indexOf()', function(){
//         it('should return -1 when the value is not present', function(){
//             assert.equal(-1, [1,2,3].indexOf(2));
//         });
//     });
// });