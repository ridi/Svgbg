/**
 * This is a customized version of SVGO for svgbg.
 */

/**
 * SVGO is a Nodejs-based tool for optimizing SVG vector graphics files.
 *
 * @see https://github.com/svg/svgo
 *
 * @author Kir Belevich <kir@soulshine.in> (https://github.com/deepsweet)
 * @copyright © 2012 Kir Belevich
 * @license MIT https://raw.githubusercontent.com/svg/svgo/master/LICENSE
 */

const CONFIG = require('svgo/lib/svgo/config');
const SVG2JS = require('svgo/lib/svgo/svg2js');
const PLUGINS = require('svgo/lib/svgo/plugins');
const JS2SVG = require('svgo/lib/svgo/js2svg');
const defaultConfig = require('../defaultConfig.json');
const each = require('async/each');

class CustomSVGO {
  constructor(config) {
    this.config = CONFIG(Object.assign(defaultConfig, config));
    this._sortElements = this._sortElements.bind(this);
    this._sortElementsIterator = this._sortElementsIterator.bind(this);
    this._optimize = this._optimize.bind(this);
    this._optimizeOnce = this._optimizeOnce.bind(this);
  }

  customOptimize(srcSvg, filename, callback) {
    this._optimize(srcSvg, (minifiedSvgJs, minifiedSvgStr) => {
      const svgJs = minifiedSvgJs.content[0];
      callback(filename, {
        name: filename.substr(0, filename.lastIndexOf('.')),
        viewBox: {
          width: svgJs.attrs.viewBox.value.split(' ')[2],
          height: svgJs.attrs.viewBox.value.split(' ')[3],
        },
        pathList: this._sortElements(svgJs.content).pathList
          .concat()
          .filter(element => element !== undefined),
        shapeList: this._sortElements(svgJs.content).shapeList
          .concat()
          .filter(element => element !== undefined),
        fullSvgStr: minifiedSvgStr,
      });
    });
  }

  _sortElements(elementList) {
    const sortedElementList = {
      pathList: [],
      shapeList: [],
    };
    this._sortElementsIterator(elementList, sortedElementList);
    return sortedElementList;
  }

  _sortElementsIterator(elementList, sortedElementList) {
    each(elementList, (element) => {
      if (element.elem === 'g') {
        this._sortElementsIterator(element.content, sortedElementList);
      } else if (element.elem === 'path') {
        sortedElementList.pathList.push(element.attrs.d.value);
      } else if (element.elem === 'circle' || element.elem === 'ellipse') {
        sortedElementList.shapeList.push(element);
      }
    });
  }

  _optimize(svgstr, callback) {
    if (this.config.error) {
      callback(this.config);
      return;
    }

    const config = this.config;
    const maxPassCount = config.multipass ? 10 : 1;
    let counter = 0;
    let prevResultSize = Number.POSITIVE_INFINITY;

    function optimizeOnceCallback(svgjs, svg) {
      if (svgjs.error) {
        callback(svgjs, svg);
        return;
      }
      counter += 1;
      if (counter < maxPassCount && svgjs.data.length < prevResultSize) {
        prevResultSize = svgjs.data.length;
        this._optimizeOnce(svgjs.data, optimizeOnceCallback);
      } else {
        callback(svgjs, svg);
      }
    }

    this._optimizeOnce(svgstr, optimizeOnceCallback);
  }

  _optimizeOnce(svgstr, callback) {
    const config = this.config;

    SVG2JS(svgstr, (svgjs) => {
      if (svgjs.error) {
        callback(svgjs);
        return;
      }
      const minifiedSvgjs = PLUGINS(svgjs, config.plugins);
      const minifiedSvgstr = JS2SVG(minifiedSvgjs, config.js2svg).data;
      callback(minifiedSvgjs, minifiedSvgstr);
    });
  }
}

module.exports = CustomSVGO;
