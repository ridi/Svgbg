const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const each = require('async/each');

class TemplateBuilder {
  constructor(svgList) {
    this.svgList = svgList;
  }

  build(templateList, extraData = {}) {
    each(templateList, (templateItem) => {
      const srcPath = templateItem.template;
      const destPathList = templateItem.dest;

      const filename = path.basename(srcPath, path.extname(srcPath));
      const template = fs.readFileSync(srcPath, {encoding: 'utf8'});
      const compile = Handlebars.compile(template);

      const compiled = compile({
        svgList: this.svgList,
      });

      each(destPathList, (destPath) => {
        fs.writeFileSync(path.join(destPath, filename), compiled, {flags: 'w+'});
      });
    });
  }
}

module.exports = TemplateBuilder;