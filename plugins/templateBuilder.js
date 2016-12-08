const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const each = require('async/each');

class TemplateBuilder {
  constructor(iconList) {
    this.iconList = iconList;
  }

  build(templateList, extraData = {}) {
    each(templateList, (templateItem) => {
      const { srcPath, destPathList } = templateItem;
      const filename = path.basename(srcPath, path.extname(srcPath));
      const template = fs.readFileSync(srcPath, {encoding: 'utf8'});
      const compile = Handlebars.compile(template);

      const compiled = compile({
        iconList: this.iconList
      });

      each(destPathList, (destPath) => {
        fs.writeFileSync(path.join(destPath, filename), compiled, {flags: 'w+'});
      });
    });
  }
}

module.exports = TemplateBuilder;