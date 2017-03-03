const Svgbg = require('../svgbg');

const config = {
  root: __dirname,
  src: 'src',
  minify: {
    dest: 'dist/svg',
  },
  templates: [
    {
      name: 'sample',
      type: 'less',
      dest: ['dist/less'],
      template: 'templates/sample.less.hbs',
      etc: {
        a: 'b',
      },
    },
    {
      name: 'sample_page',
      type: 'less',
      dest: ['dist/less'],
      template: 'templates/sample_page.less.hbs',
    },
    {
      name: 'sample_page',
      type: 'html',
      dest: ['dist'],
      template: 'templates/sample.html.hbs',
    },
  ],
};

const svgbg = new Svgbg(config);
svgbg.build();
