const path = require('path');
const SvgGenerator = require('../svgbg');

const config = {
  src: './src',
  minify: {
    dest: './dist'
  },
  templates: [
    {
      name: 'svg_icon_full',
      type: 'less',
      dest: [ './dist' ],
      template: './templates/sample.less.hbs',
      etc: {
        a: 'b',
      }
    },
    {
      name: 'page_svg_icon',
      type: 'less',
      dest: [ './dist' ],
      template: './templates/sample_page.less.hbs'
    },
    {
      name: 'svg-icon',
      type: 'html',
      dest: [ './dist' ],
      template: './templates/sample.html.hbs'
    }
  ]
};

const svgGen = new SvgGenerator(config);
svgGen.build();
