'use strict';

/**
 * This is a modified version of SVGO by Gyujin Cho.
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

class SVGO {
  constructor (config) {
    this.config = CONFIG(config);
    this.optimize = this.optimize.bind(this);
    this._optimizeOnce = this._optimizeOnce.bind(this);
  }

  optimize (svgstr, callback) {
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

module.exports = SVGO;



