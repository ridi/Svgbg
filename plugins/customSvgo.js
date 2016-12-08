'use strict';

/**
 * This is a customized version of SVGO.
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
const JSAPI = require('svgo/lib/svgo/jsAPI');
const JS2SVG = require('svgo/lib/svgo/js2svg');

class CustomSVGO {
  constructor (config) {
    this.config = CONFIG(config);
    this._sortPaths = this._sortPaths.bind(this);
    this._optimize = this._optimize.bind(this);
    this._optimizeOnce = this._optimizeOnce.bind(this);
  }

  customOptimize (srcSvg) {
    this._optimize(srcSvg, (minifiedSvgJs, minifiedSvgStr) => {
      const svgJs = minifiedSvgJs.content[0];
      return {
        name: filename.substr(0, filename.lastIndexOf('.')),
        viewBox: {
          width: svgJs.attrs.viewBox.value.split(' ')[2],
          height: svgJs.attrs.viewBox.value.split(' ')[3],
        },
        pathList: this._sortPaths(svgJs.content)
          .concat()
          .filter((element)=>{
            if (element !== undefined) {
              return element;
            }
        }),
        fullSvgStr: minifiedSvgStr,
      };
    });
  }

  _sortPaths (pathList) {
    return pathList.map((element) => {
      if (element.elem === 'g') {
        return this._sortPaths(element.content);
      } else if (element.elem === 'path') {
        return element.attrs.d.value;
      } else {
        //TODO: test용 console.log 제거
        console.log(element);
      }
    });
  }

  _optimize (svgstr, callback) {
    if (this.config.error) {
      return callback(this.config);
    }

    const config = this.config;
    const maxPassCount = config.multipass ? 10 : 1;
    let counter = 0;
    let prevResultSize = Number.POSITIVE_INFINITY;

    function optimizeOnceCallback (svgjs, svg) {
      if (svgjs.error) {
        callback(svgjs, svg);
        return;
      }
      if (++counter < maxPassCount && svgjs.data.length < prevResultSize) {
        prevResultSize = svgjs.data.length;
        this._optimizeOnce(svgjs.data, optimizeOnceCallback);
      } else {
        callback(svgjs, svg);
      }
    }

    this._optimizeOnce(svgstr, optimizeOnceCallback);
  }

  _optimizeOnce (svgstr, callback) {
    const config = this.config;

    SVG2JS(svgstr, function(svgjs) {

      if (svgjs.error) {
        callback(svgjs);
        return;
      }

      svgjs = PLUGINS(svgjs, config.plugins);
      svgstr = JS2SVG(svgjs, config.js2svg).data;

      callback(svgjs, svgstr);

    });
  }

  /**
   * The factory that creates a content item with the helper methods.
   *
   * @param {Object} data which passed to jsAPI constructor
   * @returns {JSAPI} content item
   */
  createContentItem (data) {
    return new JSAPI(data);
  };
}

module.exports = CustomSVGO;



