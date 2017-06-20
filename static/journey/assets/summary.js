(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.FMP || (g.FMP = {})).SummaryPage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "projection": {
    "ref": "EPSG:27700",
    "proj4": "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
    "extent": [0, 0, 800000, 1400000]
  },
  "OSGetCapabilities": "/os-get-capabilities",
  "OSAttribution": "&#169; Crown copyright and database rights {{year}} <a href='http://www.ordnancesurvey.co.uk'>OS</a> 0100024198",
  "OSLayer": "osgb",
  "OSMatrixSet": "ZoomMap",
  "tileProxy": "/gwc-proxy",
  "tileExtent": [1393.0196, 13494.9764, 673393.0196, 909494.9764],
  "tileResolutions": [896, 448, 224, 112, 56, 28, 14, 7, 3.5, 1.75, 0.875],
  "tileSize": [250, 250]
}

},{}],2:[function(require,module,exports){
var $ = require('jquery')
// proj4 is accessed using global variable within openlayers library
window.proj4 = require('proj4')
var raf = require('raf')
var ol = require('openlayers')
var parser = new ol.format.WMTSCapabilities()
var config = require('./map-config.json')
var map, callback

function Map (mapOptions) {
  // add the projection to Window.proj4
  window.proj4.defs(config.projection.ref, config.projection.proj4)

  // ie9 requires polyfill for window.requestAnimationFrame and classlist
  raf.polyfill()
  require('classlist-polyfill')

  var projection = ol.proj.get(config.projection.ref)

  projection.setExtent(config.projection.extent)

  $.when($.get(config.OSGetCapabilities)).done(function (OS) {
    // bug: parser is not getting the matrixwidth and matrixheight values when parsing,
    // therefore sizes is set to undefined array, which sets fullTileRanges_
    // to an array of undefineds thus breaking the map      return

    var result = parser.read(OS)
    // TODO
    // need to set tiles to https
    // follow up with OS
    result.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href = result.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href.replace('http://', 'https://')
    var wmtsOptions = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: config.OSLayer,
      matrixSet: config.OSMatrixSet
    })

    var attribution = config.OSAttribution.replace('{{year}}', new Date().getFullYear())

    wmtsOptions.attributions = [
      new ol.Attribution({
        html: attribution
      })
    ]

    var source = new ol.source.WMTS(wmtsOptions)

    // array of ol.tileRange can't find any reference to this object in ol3 documentation, but is set to NaN and stops the map from functioning
    // openlayers doesn't expose fulltileranges as a property, so when using minified ol have to set tilegrid.a to null, which is what fulltileranges
    // is mapped as, hopefully OS will fix their service, otherwise something more robust needs sorting out
    source.tileGrid.fullTileRanges_ = null
    source.tileGrid.a = null

    var layer = new ol.layer.Tile({
      ref: config.OSLayer,
      source: source
    })

    var layers = Array.prototype.concat([layer], mapOptions.layers)

    map = new ol.Map({
      interactions: mapOptions.interactions || ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      controls: ol.control.defaults().extend([
        new ol.control.ScaleLine({
          units: 'metric',
          minWidth: 50
        })
      ]),
      layers: layers,
      pixelRatio: 1,
      target: 'map',
      view: new ol.View({
        resolutions: source.tileGrid.getResolutions(),
        projection: projection,
        center: mapOptions.point || [440000, 310000],
        zoom: mapOptions.point ? 9 : 0,
        extent: config.projection.extent
      })
    })

    // Callback to notify map is ready
    if (callback) {
      callback(map)
    }
  })

  this.onReady = function (fn) {
    callback = fn
  }
}

module.exports = Map

},{"./map-config.json":1,"classlist-polyfill":5,"jquery":6,"openlayers":7,"proj4":44,"raf":77}],3:[function(require,module,exports){
/* global $ */
var ol = require('openlayers')
var Map = require('../map.js')
var mapConfig = require('../map-config.json')

function Summary (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var $summaryColumn = $('.summary-column')
  var $map = $('#map')
  var $page = $('main#summary-page')
  var $container = $('.map-container')
  var $mapColumn = $('.map-column')

  var mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [
      new ol.layer.Tile({
        ref: 'fmp',
        opacity: 0.7,
        zIndex: 0,
        source: new ol.source.TileWMS({
          url: mapConfig.tileProxy,
          serverType: 'geoserver',
          params: {
            LAYERS: 'fmp:fmp',
            TILED: true,
            VERSION: '1.1.1'
          },
          tileGrid: new ol.tilegrid.TileGrid({
            extent: mapConfig.tileExtent,
            resolutions: mapConfig.tileResolutions,
            tileSize: mapConfig.tileSize
          })
        })
      }),
      new ol.layer.Vector({
        ref: 'centre',
        visible: true,
        zIndex: 1,
        source: new ol.source.Vector({
          features: [
            new ol.Feature({
              geometry: new ol.geom.Point([parseInt(easting, 10), parseInt(northing, 10)])
            })]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'pin.png'
          })
        })
      })
    ],
    mapInteractions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  }
  var setBlendMode = function (evt) {
    evt.context.globalCompositeOperation = 'multiply'
  }

  var resetBlendModeFromSelect = function (evt) {
    evt.context.globalCompositeOperation = 'source-over'
  }

  mapOptions.layers[0].on('precompose', setBlendMode)
  mapOptions.layers[0].on('postcompose', resetBlendModeFromSelect)

  this.map = new Map(mapOptions)

  function isMobile () {
    return $('.visible-mobile:visible').length > 0
  }

  function sizeColumn () {
    var height = !isMobile() ? $summaryColumn.height() : 450
    $map.height(height)
  }

  // set start height
  sizeColumn()

  $(window).on('resize', sizeColumn)

  this.map.onReady(function (map) {
    $container.on('click', '.enter-fullscreen', function (e) {
      e.preventDefault()
      $page.addClass('fullscreen')
      $map.css('height', $(window).height() + 'px')
      $mapColumn.removeClass('column-half')
      map.updateSize()
    })

    $container.on('click', '.exit-fullscreen', function (e) {
      e.preventDefault()
      $page.removeClass('fullscreen')
      $mapColumn.addClass('column-half')
      $map.css('height', $summaryColumn.height() + 'px')
      map.updateSize()
    })
  })
}

module.exports = Summary

},{"../map-config.json":1,"../map.js":2,"openlayers":7}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (!("classList" in document.createElement("_"))
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],6:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

},{}],7:[function(require,module,exports){
(function (global){
// OpenLayers 3. See http://openlayers.org/
// License: https://raw.githubusercontent.com/openlayers/ol3/master/LICENSE.md
// Version: v3.17.1

(function (root, factory) {
  if (typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.ol = factory();
  }
}(this, function () {
  var OPENLAYERS = {};
  var k,aa=this;function t(a,b,c){a=a.split(".");c=c||aa;a[0]in c||!c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c[d]?c=c[d]:c=c[d]={}:c[d]=b}function ba(a){a.Zb=function(){return a.Tg?a.Tg:a.Tg=new a}}
function ca(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function da(a){return"string"==typeof a}function ea(a){return"number"==typeof a}function fa(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function w(a){return a[ga]||(a[ga]=++ha)}var ga="closure_uid_"+(1E9*Math.random()>>>0),ha=0;function ia(a,b,c){return a.call.apply(a.bind,arguments)}
function ja(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function ka(a,b,c){ka=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia:ja;return ka.apply(null,arguments)};var la,ma;function y(a,b){a.prototype=Object.create(b.prototype);a.prototype.constructor=a}function na(){}var pa=Function("return this")();var qa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function ra(a,b){return a<b?-1:a>b?1:0};function sa(a,b,c){return Math.min(Math.max(a,b),c)}var ta=function(){var a;"cosh"in Math?a=Math.cosh:a=function(a){a=Math.exp(a);return(a+1/a)/2};return a}();function ua(a,b,c,d,e,f){var g=e-c,h=f-d;if(0!==g||0!==h){var l=((a-c)*g+(b-d)*h)/(g*g+h*h);1<l?(c=e,d=f):0<l&&(c+=g*l,d+=h*l)}return va(a,b,c,d)}function va(a,b,c,d){a=c-a;b=d-b;return a*a+b*b}function wa(a){return a*Math.PI/180}function xa(a,b){var c=a%b;return 0>c*b?c+b:c}function za(a,b,c){return a+c*(b-a)};function Ba(a){return function(b){if(b)return[sa(b[0],a[0],a[2]),sa(b[1],a[1],a[3])]}}function Ca(a){return a};function Da(a,b,c){this.center=a;this.resolution=b;this.rotation=c};var Ea="function"===typeof Object.assign?Object.assign:function(a,b){if(!a||!a)throw new TypeError("Cannot convert undefined or null to object");for(var c=Object(a),d=1,e=arguments.length;d<e;++d){var f=arguments[d];if(void 0!==f&&null!==f)for(var g in f)f.hasOwnProperty(g)&&(c[g]=f[g])}return c};function Fa(a){for(var b in a)delete a[b]}function Ga(a){var b=[],c;for(c in a)b.push(a[c]);return b}function Ha(a){for(var b in a)return!1;return!b};var Ia="olm_"+(1E4*Math.random()|0);function Ja(a){function b(b){var d=a.listener,e=a.ng||a.target;a.pg&&Ka(a);return d.call(e,b)}return a.og=b}function La(a,b,c,d){for(var e,f=0,g=a.length;f<g;++f)if(e=a[f],e.listener===b&&e.ng===c)return d&&(e.deleteIndex=f),e}function Ma(a,b){var c=a[Ia];return c?c[b]:void 0}function Na(a){var b=a[Ia];b||(b=a[Ia]={});return b}
function Oa(a,b){var c=Ma(a,b);if(c){for(var d=0,e=c.length;d<e;++d)a.removeEventListener(b,c[d].og),Fa(c[d]);c.length=0;if(c=a[Ia])delete c[b],0===Object.keys(c).length&&delete a[Ia]}}function B(a,b,c,d,e){var f=Na(a),g=f[b];g||(g=f[b]=[]);(f=La(g,c,d,!1))?e||(f.pg=!1):(f={ng:d,pg:!!e,listener:c,target:a,type:b},a.addEventListener(b,Ja(f)),g.push(f));return f}function Pa(a,b,c,d){return B(a,b,c,d,!0)}function Qa(a,b,c,d){(a=Ma(a,b))&&(c=La(a,c,d,!0))&&Ka(c)}
function Ka(a){if(a&&a.target){a.target.removeEventListener(a.type,a.og);var b=Ma(a.target,a.type);if(b){var c="deleteIndex"in a?a.deleteIndex:b.indexOf(a);-1!==c&&b.splice(c,1);0===b.length&&Oa(a.target,a.type)}Fa(a)}}function Ra(a){var b=Na(a),c;for(c in b)Oa(a,c)};function Sa(){}Sa.prototype.Gb=!1;function Ta(a){a.Gb||(a.Gb=!0,a.ka())}Sa.prototype.ka=na;function Wa(a,b){this.type=a;this.target=b||null}Wa.prototype.preventDefault=Wa.prototype.stopPropagation=function(){this.to=!0};function Ya(a){a.stopPropagation()}function Za(a){a.preventDefault()};function $a(){this.Ra={};this.Ba={};this.ya={}}y($a,Sa);$a.prototype.addEventListener=function(a,b){var c=this.ya[a];c||(c=this.ya[a]=[]);-1===c.indexOf(b)&&c.push(b)};
$a.prototype.b=function(a){var b="string"===typeof a?new Wa(a):a;a=b.type;b.target=this;var c=this.ya[a],d;if(c){a in this.Ba||(this.Ba[a]=0,this.Ra[a]=0);++this.Ba[a];for(var e=0,f=c.length;e<f;++e)if(!1===c[e].call(this,b)||b.to){d=!1;break}--this.Ba[a];if(0===this.Ba[a]){b=this.Ra[a];for(delete this.Ra[a];b--;)this.removeEventListener(a,na);delete this.Ba[a]}return d}};$a.prototype.ka=function(){Ra(this)};function ab(a,b){return b?b in a.ya:0<Object.keys(a.ya).length}
$a.prototype.removeEventListener=function(a,b){var c=this.ya[a];if(c){var d=c.indexOf(b);a in this.Ra?(c[d]=na,++this.Ra[a]):(c.splice(d,1),0===c.length&&delete this.ya[a])}};function bb(){$a.call(this);this.g=0}y(bb,$a);function cb(a){if(Array.isArray(a))for(var b=0,c=a.length;b<c;++b)Ka(a[b]);else Ka(a)}k=bb.prototype;k.u=function(){++this.g;this.b("change")};k.K=function(){return this.g};k.I=function(a,b,c){if(Array.isArray(a)){for(var d=a.length,e=Array(d),f=0;f<d;++f)e[f]=B(this,a[f],b,c);return e}return B(this,a,b,c)};k.L=function(a,b,c){if(Array.isArray(a)){for(var d=a.length,e=Array(d),f=0;f<d;++f)e[f]=Pa(this,a[f],b,c);return e}return Pa(this,a,b,c)};
k.J=function(a,b,c){if(Array.isArray(a))for(var d=0,e=a.length;d<e;++d)Qa(this,a[d],b,c);else Qa(this,a,b,c)};k.M=cb;function db(a,b,c){Wa.call(this,a);this.key=b;this.oldValue=c}y(db,Wa);function eb(a){bb.call(this);w(this);this.U={};void 0!==a&&this.G(a)}y(eb,bb);var fb={};function gb(a){return fb.hasOwnProperty(a)?fb[a]:fb[a]="change:"+a}k=eb.prototype;k.get=function(a){var b;this.U.hasOwnProperty(a)&&(b=this.U[a]);return b};k.N=function(){return Object.keys(this.U)};k.O=function(){return Ea({},this.U)};function hb(a,b,c){var d;d=gb(b);a.b(new db(d,b,c));a.b(new db("propertychange",b,c))}
k.set=function(a,b,c){c?this.U[a]=b:(c=this.U[a],this.U[a]=b,c!==b&&hb(this,a,c))};k.G=function(a,b){for(var c in a)this.set(c,a[c],b)};k.P=function(a,b){if(a in this.U){var c=this.U[a];delete this.U[a];b||hb(this,a,c)}};function ib(a,b){return a>b?1:a<b?-1:0}function jb(a,b){return 0<=a.indexOf(b)}function kb(a,b,c){var d=a.length;if(a[0]<=b)return 0;if(!(b<=a[d-1]))if(0<c)for(c=1;c<d;++c){if(a[c]<b)return c-1}else if(0>c)for(c=1;c<d;++c){if(a[c]<=b)return c}else for(c=1;c<d;++c){if(a[c]==b)return c;if(a[c]<b)return a[c-1]-b<b-a[c]?c-1:c}return d-1}function lb(a){return a.reduce(function(a,c){return Array.isArray(c)?a.concat(lb(c)):a.concat(c)},[])}
function mb(a,b){var c;c=ca(b);var d="array"==c||"object"==c&&"number"==typeof b.length?b:[b],e=d.length;for(c=0;c<e;c++)a[a.length]=d[c]}function nb(a,b){var c=a.indexOf(b),d=-1<c;d&&a.splice(c,1);return d}function ob(a,b){for(var c=a.length>>>0,d,e=0;e<c;e++)if(d=a[e],b(d,e,a))return d;return null}function pb(a,b){var c=a.length;if(c!==b.length)return!1;for(var d=0;d<c;d++)if(a[d]!==b[d])return!1;return!0}
function qb(a){var b=rb,c=a.length,d=Array(a.length),e;for(e=0;e<c;e++)d[e]={index:e,value:a[e]};d.sort(function(a,c){return b(a.value,c.value)||a.index-c.index});for(e=0;e<a.length;e++)a[e]=d[e].value}function sb(a,b){var c;return a.every(function(d,e){c=e;return!b(d,e,a)})?-1:c};function tb(a){return function(b,c,d){if(void 0!==b)return b=kb(a,b,d),b=sa(b+c,0,a.length-1),a[b]}}function ub(a,b,c){return function(d,e,f){if(void 0!==d)return d=Math.max(Math.floor(Math.log(b/d)/Math.log(a)+(0<f?0:0>f?1:.5))+e,0),void 0!==c&&(d=Math.min(d,c)),b/Math.pow(a,d)}};function vb(a){if(void 0!==a)return 0}function wb(a,b){if(void 0!==a)return a+b}function xb(a){var b=2*Math.PI/a;return function(a,d){if(void 0!==a)return a=Math.floor((a+d)/b+.5)*b}}function yb(){var a=wa(5);return function(b,c){if(void 0!==b)return Math.abs(b+c)<=a?0:b+c}};function zb(a,b){var c=void 0!==b?a.toFixed(b):""+a,d=c.indexOf("."),d=-1===d?c.length:d;return 2<d?c:Array(3-d).join("0")+c}function Ab(a){a=(""+a).split(".");for(var b=["1","3"],c=0;c<Math.max(a.length,b.length);c++){var d=parseInt(a[c]||"0",10),e=parseInt(b[c]||"0",10);if(d>e)return 1;if(e>d)return-1}return 0};function Bb(a,b){a[0]+=b[0];a[1]+=b[1];return a}function Cb(a,b){var c=a[0],d=a[1],e=b[0],f=b[1],g=e[0],e=e[1],h=f[0],f=f[1],l=h-g,m=f-e,c=0===l&&0===m?0:(l*(c-g)+m*(d-e))/(l*l+m*m||0);0>=c||(1<=c?(g=h,e=f):(g+=c*l,e+=c*m));return[g,e]}function Db(a,b,c){a=xa(a+180,360)-180;var d=Math.abs(3600*a);return Math.floor(d/3600)+"\u00b0 "+zb(Math.floor(d/60%60))+"\u2032 "+zb(d%60,c||0)+"\u2033 "+b.charAt(0>a?1:0)}
function Eb(a,b,c){return a?b.replace("{x}",a[0].toFixed(c)).replace("{y}",a[1].toFixed(c)):""}function Fb(a,b){for(var c=!0,d=a.length-1;0<=d;--d)if(a[d]!=b[d]){c=!1;break}return c}function Gb(a,b){var c=Math.cos(b),d=Math.sin(b),e=a[1]*c+a[0]*d;a[0]=a[0]*c-a[1]*d;a[1]=e;return a}function Hb(a,b){var c=a[0]-b[0],d=a[1]-b[1];return c*c+d*d}function Ib(a,b){return Hb(a,Cb(a,b))}function Jb(a,b){return Eb(a,"{x}, {y}",b)};function Kb(a){for(var b=Lb(),c=0,d=a.length;c<d;++c)Mb(b,a[c]);return b}function Ob(a,b,c){return c?(c[0]=a[0]-b,c[1]=a[1]-b,c[2]=a[2]+b,c[3]=a[3]+b,c):[a[0]-b,a[1]-b,a[2]+b,a[3]+b]}function Pb(a,b){return b?(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b):a.slice()}function Rb(a,b,c){b=b<a[0]?a[0]-b:a[2]<b?b-a[2]:0;a=c<a[1]?a[1]-c:a[3]<c?c-a[3]:0;return b*b+a*a}function Sb(a,b){return Tb(a,b[0],b[1])}function Ub(a,b){return a[0]<=b[0]&&b[2]<=a[2]&&a[1]<=b[1]&&b[3]<=a[3]}
function Tb(a,b,c){return a[0]<=b&&b<=a[2]&&a[1]<=c&&c<=a[3]}function Vb(a,b){var c=a[1],d=a[2],e=a[3],f=b[0],g=b[1],h=0;f<a[0]?h|=16:f>d&&(h|=4);g<c?h|=8:g>e&&(h|=2);0===h&&(h=1);return h}function Lb(){return[Infinity,Infinity,-Infinity,-Infinity]}function Wb(a,b,c,d,e){return e?(e[0]=a,e[1]=b,e[2]=c,e[3]=d,e):[a,b,c,d]}function Xb(a,b){var c=a[0],d=a[1];return Wb(c,d,c,d,b)}function Yb(a,b,c,d,e){e=Wb(Infinity,Infinity,-Infinity,-Infinity,e);return Zb(e,a,b,c,d)}
function $b(a,b){return a[0]==b[0]&&a[2]==b[2]&&a[1]==b[1]&&a[3]==b[3]}function ac(a,b){b[0]<a[0]&&(a[0]=b[0]);b[2]>a[2]&&(a[2]=b[2]);b[1]<a[1]&&(a[1]=b[1]);b[3]>a[3]&&(a[3]=b[3]);return a}function Mb(a,b){b[0]<a[0]&&(a[0]=b[0]);b[0]>a[2]&&(a[2]=b[0]);b[1]<a[1]&&(a[1]=b[1]);b[1]>a[3]&&(a[3]=b[1])}function Zb(a,b,c,d,e){for(;c<d;c+=e){var f=a,g=b[c],h=b[c+1];f[0]=Math.min(f[0],g);f[1]=Math.min(f[1],h);f[2]=Math.max(f[2],g);f[3]=Math.max(f[3],h)}return a}
function bc(a,b,c){var d;return(d=b.call(c,cc(a)))||(d=b.call(c,dc(a)))||(d=b.call(c,ec(a)))?d:(d=b.call(c,fc(a)))?d:!1}function gc(a){var b=0;hc(a)||(b=ic(a)*jc(a));return b}function cc(a){return[a[0],a[1]]}function dc(a){return[a[2],a[1]]}function kc(a){return[(a[0]+a[2])/2,(a[1]+a[3])/2]}
function lc(a,b,c,d,e){var f=b*d[0]/2;d=b*d[1]/2;b=Math.cos(c);var g=Math.sin(c);c=f*b;f*=g;b*=d;var h=d*g,l=a[0],m=a[1];a=l-c+h;d=l-c-h;g=l+c-h;c=l+c+h;var h=m-f-b,l=m-f+b,n=m+f+b,f=m+f-b;return Wb(Math.min(a,d,g,c),Math.min(h,l,n,f),Math.max(a,d,g,c),Math.max(h,l,n,f),e)}function jc(a){return a[3]-a[1]}function mc(a,b,c){c=c?c:Lb();nc(a,b)&&(c[0]=a[0]>b[0]?a[0]:b[0],c[1]=a[1]>b[1]?a[1]:b[1],c[2]=a[2]<b[2]?a[2]:b[2],c[3]=a[3]<b[3]?a[3]:b[3]);return c}function fc(a){return[a[0],a[3]]}
function ec(a){return[a[2],a[3]]}function ic(a){return a[2]-a[0]}function nc(a,b){return a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1]}function hc(a){return a[2]<a[0]||a[3]<a[1]}function oc(a,b){var c=(a[2]-a[0])/2*(b-1),d=(a[3]-a[1])/2*(b-1);a[0]-=c;a[2]+=c;a[1]-=d;a[3]+=d}
function pc(a,b,c){a=[a[0],a[1],a[0],a[3],a[2],a[1],a[2],a[3]];b(a,a,2);var d=[a[0],a[2],a[4],a[6]],e=[a[1],a[3],a[5],a[7]];b=Math.min.apply(null,d);a=Math.min.apply(null,e);d=Math.max.apply(null,d);e=Math.max.apply(null,e);return Wb(b,a,d,e,c)};function qc(){return!0}function rc(){return!1};/*

 Latitude/longitude spherical geodesy formulae taken from
 http://www.movable-type.co.uk/scripts/latlong.html
 Licensed under CC-BY-3.0.
*/
function sc(a){this.radius=a}sc.prototype.a=function(a){for(var b=0,c=a.length,d=a[c-1][0],e=a[c-1][1],f=0;f<c;f++)var g=a[f][0],h=a[f][1],b=b+wa(g-d)*(2+Math.sin(wa(e))+Math.sin(wa(h))),d=g,e=h;return b*this.radius*this.radius/2};sc.prototype.b=function(a,b){var c=wa(a[1]),d=wa(b[1]),e=(d-c)/2,f=wa(b[0]-a[0])/2,c=Math.sin(e)*Math.sin(e)+Math.sin(f)*Math.sin(f)*Math.cos(c)*Math.cos(d);return 2*this.radius*Math.atan2(Math.sqrt(c),Math.sqrt(1-c))};
sc.prototype.offset=function(a,b,c){var d=wa(a[1]);b/=this.radius;var e=Math.asin(Math.sin(d)*Math.cos(b)+Math.cos(d)*Math.sin(b)*Math.cos(c));return[180*(wa(a[0])+Math.atan2(Math.sin(c)*Math.sin(b)*Math.cos(d),Math.cos(b)-Math.sin(d)*Math.sin(e)))/Math.PI,180*e/Math.PI]};var tc=new sc(6370997);var uc={};uc.degrees=2*Math.PI*tc.radius/360;uc.ft=.3048;uc.m=1;uc["us-ft"]=1200/3937;
function vc(a){this.cb=a.code;this.c=a.units;this.f=void 0!==a.extent?a.extent:null;this.i=void 0!==a.worldExtent?a.worldExtent:null;this.b=void 0!==a.axisOrientation?a.axisOrientation:"enu";this.g=void 0!==a.global?a.global:!1;this.a=!(!this.g||!this.f);this.o=void 0!==a.getPointResolution?a.getPointResolution:this.sk;this.l=null;this.j=a.metersPerUnit;var b=wc,c=a.code,d=xc||pa.proj4;if("function"==typeof d&&void 0===b[c]){var e=d.defs(c);if(void 0!==e){void 0!==e.axis&&void 0===a.axisOrientation&&
(this.b=e.axis);void 0===a.metersPerUnit&&(this.j=e.to_meter);void 0===a.units&&(this.c=e.units);for(var f in b)b=d.defs(f),void 0!==b&&(a=yc(f),b===e?zc([a,this]):(b=d(f,c),Ac(a,this,b.forward,b.inverse)))}}}k=vc.prototype;k.Sj=function(){return this.cb};k.H=function(){return this.f};k.wb=function(){return this.c};k.$b=function(){return this.j||uc[this.c]};k.Ek=function(){return this.i};k.pl=function(){return this.g};k.ep=function(a){this.g=a;this.a=!(!a||!this.f)};
k.Mm=function(a){this.f=a;this.a=!(!this.g||!a)};k.mp=function(a){this.i=a};k.cp=function(a){this.o=a};k.sk=function(a,b){if("degrees"==this.wb())return a;var c=Bc(this,yc("EPSG:4326")),d=[b[0]-a/2,b[1],b[0]+a/2,b[1],b[0],b[1]-a/2,b[0],b[1]+a/2],d=c(d,d,2),c=tc.b(d.slice(0,2),d.slice(2,4)),d=tc.b(d.slice(4,6),d.slice(6,8)),d=(c+d)/2,c=this.$b();void 0!==c&&(d/=c);return d};k.getPointResolution=function(a,b){return this.o(a,b)};var wc={},Cc={},xc=null;
function zc(a){Dc(a);a.forEach(function(b){a.forEach(function(a){b!==a&&Ec(b,a,Fc)})})}function Gc(){var a=Hc,b=Ic,c=Jc;Kc.forEach(function(d){a.forEach(function(a){Ec(d,a,b);Ec(a,d,c)})})}function Lc(a){wc[a.cb]=a;Ec(a,a,Fc)}function Dc(a){var b=[];a.forEach(function(a){b.push(Lc(a))})}function Mc(a){return a?"string"===typeof a?yc(a):a:yc("EPSG:3857")}function Ec(a,b,c){a=a.cb;b=b.cb;a in Cc||(Cc[a]={});Cc[a][b]=c}function Ac(a,b,c,d){a=yc(a);b=yc(b);Ec(a,b,Nc(c));Ec(b,a,Nc(d))}
function Nc(a){return function(b,c,d){var e=b.length;d=void 0!==d?d:2;c=void 0!==c?c:Array(e);var f,g;for(g=0;g<e;g+=d)for(f=a([b[g],b[g+1]]),c[g]=f[0],c[g+1]=f[1],f=d-1;2<=f;--f)c[g+f]=b[g+f];return c}}function yc(a){var b;if(a instanceof vc)b=a;else if("string"===typeof a){b=wc[a];var c=xc||pa.proj4;void 0===b&&"function"==typeof c&&void 0!==c.defs(a)&&(b=new vc({code:a}),Lc(b))}else b=null;return b}function Oc(a,b){if(a===b)return!0;var c=a.wb()===b.wb();return a.cb===b.cb?c:Bc(a,b)===Fc&&c}
function Pc(a,b){var c=yc(a),d=yc(b);return Bc(c,d)}function Bc(a,b){var c=a.cb,d=b.cb,e;c in Cc&&d in Cc[c]&&(e=Cc[c][d]);void 0===e&&(e=Qc);return e}function Qc(a,b){if(void 0!==b&&a!==b){for(var c=0,d=a.length;c<d;++c)b[c]=a[c];a=b}return a}function Fc(a,b){var c;if(void 0!==b){c=0;for(var d=a.length;c<d;++c)b[c]=a[c];c=b}else c=a.slice();return c}function Rc(a,b,c){return Pc(b,c)(a,void 0,a.length)}function Sc(a,b,c){b=Pc(b,c);return pc(a,b)};function Tc(){eb.call(this);this.v=Lb();this.A=-1;this.l={};this.s=this.o=0}y(Tc,eb);k=Tc.prototype;k.vb=function(a,b){var c=b?b:[NaN,NaN];this.sb(a[0],a[1],c,Infinity);return c};k.sg=function(a){return this.Bc(a[0],a[1])};k.Bc=rc;k.H=function(a){this.A!=this.g&&(this.v=this.Od(this.v),this.A=this.g);var b=this.v;a?(a[0]=b[0],a[1]=b[1],a[2]=b[2],a[3]=b[3]):a=b;return a};k.Bb=function(a){return this.od(a*a)};k.jb=function(a,b){this.rc(Pc(a,b));return this};function Uc(a){this.length=a.length||a;for(var b=0;b<this.length;b++)this[b]=a[b]||0}Uc.prototype.BYTES_PER_ELEMENT=4;Uc.prototype.set=function(a,b){b=b||0;for(var c=0;c<a.length&&b+c<this.length;c++)this[b+c]=a[c]};Uc.prototype.toString=Array.prototype.join;"undefined"==typeof Float32Array&&(Uc.BYTES_PER_ELEMENT=4,Uc.prototype.BYTES_PER_ELEMENT=Uc.prototype.BYTES_PER_ELEMENT,Uc.prototype.set=Uc.prototype.set,Uc.prototype.toString=Uc.prototype.toString,t("Float32Array",Uc,void 0));function Vc(a){this.length=a.length||a;for(var b=0;b<this.length;b++)this[b]=a[b]||0}Vc.prototype.BYTES_PER_ELEMENT=8;Vc.prototype.set=function(a,b){b=b||0;for(var c=0;c<a.length&&b+c<this.length;c++)this[b+c]=a[c]};Vc.prototype.toString=Array.prototype.join;if("undefined"==typeof Float64Array){try{Vc.BYTES_PER_ELEMENT=8}catch(a){}Vc.prototype.BYTES_PER_ELEMENT=Vc.prototype.BYTES_PER_ELEMENT;Vc.prototype.set=Vc.prototype.set;Vc.prototype.toString=Vc.prototype.toString;t("Float64Array",Vc,void 0)};function Wc(a,b,c,d,e){a[0]=b;a[1]=c;a[2]=d;a[3]=e};function Xc(){var a=Array(16);Yc(a,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);return a}function Zc(){var a=Array(16);Yc(a,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);return a}function Yc(a,b,c,d,e,f,g,h,l,m,n,p,q,r,u,x,v){a[0]=b;a[1]=c;a[2]=d;a[3]=e;a[4]=f;a[5]=g;a[6]=h;a[7]=l;a[8]=m;a[9]=n;a[10]=p;a[11]=q;a[12]=r;a[13]=u;a[14]=x;a[15]=v}
function $c(a,b){a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3];a[4]=b[4];a[5]=b[5];a[6]=b[6];a[7]=b[7];a[8]=b[8];a[9]=b[9];a[10]=b[10];a[11]=b[11];a[12]=b[12];a[13]=b[13];a[14]=b[14];a[15]=b[15]}function ad(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1}
function bd(a,b,c){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],l=a[5],m=a[6],n=a[7],p=a[8],q=a[9],r=a[10],u=a[11],x=a[12],v=a[13],D=a[14];a=a[15];var A=b[0],z=b[1],F=b[2],N=b[3],K=b[4],X=b[5],oa=b[6],H=b[7],ya=b[8],Ua=b[9],Xa=b[10],Va=b[11],Aa=b[12],Qb=b[13],Nb=b[14];b=b[15];c[0]=d*A+h*z+p*F+x*N;c[1]=e*A+l*z+q*F+v*N;c[2]=f*A+m*z+r*F+D*N;c[3]=g*A+n*z+u*F+a*N;c[4]=d*K+h*X+p*oa+x*H;c[5]=e*K+l*X+q*oa+v*H;c[6]=f*K+m*X+r*oa+D*H;c[7]=g*K+n*X+u*oa+a*H;c[8]=d*ya+h*Ua+p*Xa+x*Va;c[9]=e*ya+l*Ua+q*Xa+v*Va;c[10]=f*
ya+m*Ua+r*Xa+D*Va;c[11]=g*ya+n*Ua+u*Xa+a*Va;c[12]=d*Aa+h*Qb+p*Nb+x*b;c[13]=e*Aa+l*Qb+q*Nb+v*b;c[14]=f*Aa+m*Qb+r*Nb+D*b;c[15]=g*Aa+n*Qb+u*Nb+a*b}
function cd(a,b){var c=a[0],d=a[1],e=a[2],f=a[3],g=a[4],h=a[5],l=a[6],m=a[7],n=a[8],p=a[9],q=a[10],r=a[11],u=a[12],x=a[13],v=a[14],D=a[15],A=c*h-d*g,z=c*l-e*g,F=c*m-f*g,N=d*l-e*h,K=d*m-f*h,X=e*m-f*l,oa=n*x-p*u,H=n*v-q*u,ya=n*D-r*u,Ua=p*v-q*x,Xa=p*D-r*x,Va=q*D-r*v,Aa=A*Va-z*Xa+F*Ua+N*ya-K*H+X*oa;0!=Aa&&(Aa=1/Aa,b[0]=(h*Va-l*Xa+m*Ua)*Aa,b[1]=(-d*Va+e*Xa-f*Ua)*Aa,b[2]=(x*X-v*K+D*N)*Aa,b[3]=(-p*X+q*K-r*N)*Aa,b[4]=(-g*Va+l*ya-m*H)*Aa,b[5]=(c*Va-e*ya+f*H)*Aa,b[6]=(-u*X+v*F-D*z)*Aa,b[7]=(n*X-q*F+r*z)*Aa,
b[8]=(g*Xa-h*ya+m*oa)*Aa,b[9]=(-c*Xa+d*ya-f*oa)*Aa,b[10]=(u*K-x*F+D*A)*Aa,b[11]=(-n*K+p*F-r*A)*Aa,b[12]=(-g*Ua+h*H-l*oa)*Aa,b[13]=(c*Ua-d*H+e*oa)*Aa,b[14]=(-u*N+x*z-v*A)*Aa,b[15]=(n*N-p*z+q*A)*Aa)}function dd(a,b,c){var d=a[1]*b+a[5]*c+0*a[9]+a[13],e=a[2]*b+a[6]*c+0*a[10]+a[14],f=a[3]*b+a[7]*c+0*a[11]+a[15];a[12]=a[0]*b+a[4]*c+0*a[8]+a[12];a[13]=d;a[14]=e;a[15]=f}
function ed(a,b,c){Yc(a,a[0]*b,a[1]*b,a[2]*b,a[3]*b,a[4]*c,a[5]*c,a[6]*c,a[7]*c,1*a[8],1*a[9],1*a[10],1*a[11],a[12],a[13],a[14],a[15])}function fd(a,b){var c=a[0],d=a[1],e=a[2],f=a[3],g=a[4],h=a[5],l=a[6],m=a[7],n=Math.cos(b),p=Math.sin(b);a[0]=c*n+g*p;a[1]=d*n+h*p;a[2]=e*n+l*p;a[3]=f*n+m*p;a[4]=c*-p+g*n;a[5]=d*-p+h*n;a[6]=e*-p+l*n;a[7]=f*-p+m*n}new Float64Array(3);new Float64Array(3);new Float64Array(4);new Float64Array(4);new Float64Array(4);new Float64Array(16);function gd(a,b,c,d,e,f){var g=e[0],h=e[1],l=e[4],m=e[5],n=e[12];e=e[13];for(var p=f?f:[],q=0;b<c;b+=d){var r=a[b],u=a[b+1];p[q++]=g*r+l*u+n;p[q++]=h*r+m*u+e}f&&p.length!=q&&(p.length=q);return p};function hd(){Tc.call(this);this.f="XY";this.a=2;this.B=null}y(hd,Tc);function id(a){if("XY"==a)return 2;if("XYZ"==a||"XYM"==a)return 3;if("XYZM"==a)return 4}k=hd.prototype;k.Bc=rc;k.Od=function(a){return Yb(this.B,0,this.B.length,this.a,a)};k.Ib=function(){return this.B.slice(0,this.a)};k.la=function(){return this.B};k.Jb=function(){return this.B.slice(this.B.length-this.a)};k.Kb=function(){return this.f};
k.od=function(a){this.s!=this.g&&(Fa(this.l),this.o=0,this.s=this.g);if(0>a||0!==this.o&&a<=this.o)return this;var b=a.toString();if(this.l.hasOwnProperty(b))return this.l[b];var c=this.Nc(a);if(c.la().length<this.B.length)return this.l[b]=c;this.o=a;return this};k.Nc=function(){return this};k.va=function(){return this.a};function jd(a,b,c){a.a=id(b);a.f=b;a.B=c}
function kd(a,b,c,d){if(b)c=id(b);else{for(b=0;b<d;++b){if(0===c.length){a.f="XY";a.a=2;return}c=c[0]}c=c.length;b=2==c?"XY":3==c?"XYZ":4==c?"XYZM":void 0}a.f=b;a.a=c}k.rc=function(a){this.B&&(a(this.B,this.B,this.a),this.u())};k.rotate=function(a,b){var c=this.la();if(c){for(var d=c.length,e=this.va(),f=c?c:[],g=Math.cos(a),h=Math.sin(a),l=b[0],m=b[1],n=0,p=0;p<d;p+=e){var q=c[p]-l,r=c[p+1]-m;f[n++]=l+q*g-r*h;f[n++]=m+q*h+r*g;for(q=p+2;q<p+e;++q)f[n++]=c[q]}c&&f.length!=n&&(f.length=n);this.u()}};
k.Sc=function(a,b){var c=this.la();if(c){var d=c.length,e=this.va(),f=c?c:[],g=0,h,l;for(h=0;h<d;h+=e)for(f[g++]=c[h]+a,f[g++]=c[h+1]+b,l=h+2;l<h+e;++l)f[g++]=c[l];c&&f.length!=g&&(f.length=g);this.u()}};function ld(a,b,c,d){for(var e=0,f=a[c-d],g=a[c-d+1];b<c;b+=d)var h=a[b],l=a[b+1],e=e+(g*h-f*l),f=h,g=l;return e/2}function md(a,b,c,d){var e=0,f,g;f=0;for(g=c.length;f<g;++f){var h=c[f],e=e+ld(a,b,h,d);b=h}return e};function nd(a,b,c,d,e,f,g){var h=a[b],l=a[b+1],m=a[c]-h,n=a[c+1]-l;if(0!==m||0!==n)if(f=((e-h)*m+(f-l)*n)/(m*m+n*n),1<f)b=c;else if(0<f){for(e=0;e<d;++e)g[e]=za(a[b+e],a[c+e],f);g.length=d;return}for(e=0;e<d;++e)g[e]=a[b+e];g.length=d}function od(a,b,c,d,e){var f=a[b],g=a[b+1];for(b+=d;b<c;b+=d){var h=a[b],l=a[b+1],f=va(f,g,h,l);f>e&&(e=f);f=h;g=l}return e}function pd(a,b,c,d,e){var f,g;f=0;for(g=c.length;f<g;++f){var h=c[f];e=od(a,b,h,d,e);b=h}return e}
function qd(a,b,c,d,e,f,g,h,l,m,n){if(b==c)return m;var p;if(0===e){p=va(g,h,a[b],a[b+1]);if(p<m){for(n=0;n<d;++n)l[n]=a[b+n];l.length=d;return p}return m}for(var q=n?n:[NaN,NaN],r=b+d;r<c;)if(nd(a,r-d,r,d,g,h,q),p=va(g,h,q[0],q[1]),p<m){m=p;for(n=0;n<d;++n)l[n]=q[n];l.length=d;r+=d}else r+=d*Math.max((Math.sqrt(p)-Math.sqrt(m))/e|0,1);if(f&&(nd(a,c-d,b,d,g,h,q),p=va(g,h,q[0],q[1]),p<m)){m=p;for(n=0;n<d;++n)l[n]=q[n];l.length=d}return m}
function rd(a,b,c,d,e,f,g,h,l,m,n){n=n?n:[NaN,NaN];var p,q;p=0;for(q=c.length;p<q;++p){var r=c[p];m=qd(a,b,r,d,e,f,g,h,l,m,n);b=r}return m};function sd(a,b){var c=0,d,e;d=0;for(e=b.length;d<e;++d)a[c++]=b[d];return c}function td(a,b,c,d){var e,f;e=0;for(f=c.length;e<f;++e){var g=c[e],h;for(h=0;h<d;++h)a[b++]=g[h]}return b}function ud(a,b,c,d,e){e=e?e:[];var f=0,g,h;g=0;for(h=c.length;g<h;++g)b=td(a,b,c[g],d),e[f++]=b;e.length=f;return e};function vd(a,b,c,d,e){e=void 0!==e?e:[];for(var f=0;b<c;b+=d)e[f++]=a.slice(b,b+d);e.length=f;return e}function wd(a,b,c,d,e){e=void 0!==e?e:[];var f=0,g,h;g=0;for(h=c.length;g<h;++g){var l=c[g];e[f++]=vd(a,b,l,d,e[f]);b=l}e.length=f;return e};function xd(a,b,c,d,e,f,g){var h=(c-b)/d;if(3>h){for(;b<c;b+=d)f[g++]=a[b],f[g++]=a[b+1];return g}var l=Array(h);l[0]=1;l[h-1]=1;c=[b,c-d];for(var m=0,n;0<c.length;){var p=c.pop(),q=c.pop(),r=0,u=a[q],x=a[q+1],v=a[p],D=a[p+1];for(n=q+d;n<p;n+=d){var A=ua(a[n],a[n+1],u,x,v,D);A>r&&(m=n,r=A)}r>e&&(l[(m-b)/d]=1,q+d<m&&c.push(q,m),m+d<p&&c.push(m,p))}for(n=0;n<h;++n)l[n]&&(f[g++]=a[b+n*d],f[g++]=a[b+n*d+1]);return g}
function yd(a,b,c,d,e,f,g,h){var l,m;l=0;for(m=c.length;l<m;++l){var n=c[l];a:{var p=a,q=n,r=d,u=e,x=f;if(b!=q){var v=u*Math.round(p[b]/u),D=u*Math.round(p[b+1]/u);b+=r;x[g++]=v;x[g++]=D;var A,z;do if(A=u*Math.round(p[b]/u),z=u*Math.round(p[b+1]/u),b+=r,b==q){x[g++]=A;x[g++]=z;break a}while(A==v&&z==D);for(;b<q;){var F,N;F=u*Math.round(p[b]/u);N=u*Math.round(p[b+1]/u);b+=r;if(F!=A||N!=z){var K=A-v,X=z-D,oa=F-v,H=N-D;K*H==X*oa&&(0>K&&oa<K||K==oa||0<K&&oa>K)&&(0>X&&H<X||X==H||0<X&&H>X)||(x[g++]=A,x[g++]=
z,v=A,D=z);A=F;z=N}}x[g++]=A;x[g++]=z}}h.push(g);b=n}return g};function zd(a,b){hd.call(this);this.i=this.j=-1;this.pa(a,b)}y(zd,hd);k=zd.prototype;k.clone=function(){var a=new zd(null);Ad(a,this.f,this.B.slice());return a};k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;this.i!=this.g&&(this.j=Math.sqrt(od(this.B,0,this.B.length,this.a,0)),this.i=this.g);return qd(this.B,0,this.B.length,this.a,this.j,!0,a,b,c,d)};k.nm=function(){return ld(this.B,0,this.B.length,this.a)};k.Z=function(){return vd(this.B,0,this.B.length,this.a)};
k.Nc=function(a){var b=[];b.length=xd(this.B,0,this.B.length,this.a,a,b,0);a=new zd(null);Ad(a,"XY",b);return a};k.X=function(){return"LinearRing"};k.pa=function(a,b){a?(kd(this,b,a,1),this.B||(this.B=[]),this.B.length=td(this.B,0,a,this.a),this.u()):Ad(this,"XY",null)};function Ad(a,b,c){jd(a,b,c);a.u()};function C(a,b){hd.call(this);this.pa(a,b)}y(C,hd);k=C.prototype;k.clone=function(){var a=new C(null);a.ba(this.f,this.B.slice());return a};k.sb=function(a,b,c,d){var e=this.B;a=va(a,b,e[0],e[1]);if(a<d){d=this.a;for(b=0;b<d;++b)c[b]=e[b];c.length=d;return a}return d};k.Z=function(){return this.B?this.B.slice():[]};k.Od=function(a){return Xb(this.B,a)};k.X=function(){return"Point"};k.Ka=function(a){return Tb(a,this.B[0],this.B[1])};
k.pa=function(a,b){a?(kd(this,b,a,0),this.B||(this.B=[]),this.B.length=sd(this.B,a),this.u()):this.ba("XY",null)};k.ba=function(a,b){jd(this,a,b);this.u()};function Bd(a,b,c,d,e){return!bc(e,function(e){return!Cd(a,b,c,d,e[0],e[1])})}function Cd(a,b,c,d,e,f){for(var g=!1,h=a[c-d],l=a[c-d+1];b<c;b+=d){var m=a[b],n=a[b+1];l>f!=n>f&&e<(m-h)*(f-l)/(n-l)+h&&(g=!g);h=m;l=n}return g}function Dd(a,b,c,d,e,f){if(0===c.length||!Cd(a,b,c[0],d,e,f))return!1;var g;b=1;for(g=c.length;b<g;++b)if(Cd(a,c[b-1],c[b],d,e,f))return!1;return!0};function Ed(a,b,c,d,e,f,g){var h,l,m,n,p,q=e[f+1],r=[],u=c[0];m=a[u-d];p=a[u-d+1];for(h=b;h<u;h+=d){n=a[h];l=a[h+1];if(q<=p&&l<=q||p<=q&&q<=l)m=(q-p)/(l-p)*(n-m)+m,r.push(m);m=n;p=l}u=NaN;p=-Infinity;r.sort(ib);m=r[0];h=1;for(l=r.length;h<l;++h){n=r[h];var x=Math.abs(n-m);x>p&&(m=(m+n)/2,Dd(a,b,c,d,m,q)&&(u=m,p=x));m=n}isNaN(u)&&(u=e[f]);return g?(g.push(u,q),g):[u,q]};function Fd(a,b,c,d,e,f){for(var g=[a[b],a[b+1]],h=[],l;b+d<c;b+=d){h[0]=a[b+d];h[1]=a[b+d+1];if(l=e.call(f,g,h))return l;g[0]=h[0];g[1]=h[1]}return!1};function Gd(a,b,c,d,e){var f=Zb(Lb(),a,b,c,d);return nc(e,f)?Ub(e,f)||f[0]>=e[0]&&f[2]<=e[2]||f[1]>=e[1]&&f[3]<=e[3]?!0:Fd(a,b,c,d,function(a,b){var c=!1,d=Vb(e,a),f=Vb(e,b);if(1===d||1===f)c=!0;else{var p=e[0],q=e[1],r=e[2],u=e[3],x=b[0],v=b[1],D=(v-a[1])/(x-a[0]);f&2&&!(d&2)&&(c=x-(v-u)/D,c=c>=p&&c<=r);c||!(f&4)||d&4||(c=v-(x-r)*D,c=c>=q&&c<=u);c||!(f&8)||d&8||(c=x-(v-q)/D,c=c>=p&&c<=r);c||!(f&16)||d&16||(c=v-(x-p)*D,c=c>=q&&c<=u)}return c}):!1}
function Hd(a,b,c,d,e){var f=c[0];if(!(Gd(a,b,f,d,e)||Cd(a,b,f,d,e[0],e[1])||Cd(a,b,f,d,e[0],e[3])||Cd(a,b,f,d,e[2],e[1])||Cd(a,b,f,d,e[2],e[3])))return!1;if(1===c.length)return!0;b=1;for(f=c.length;b<f;++b)if(Bd(a,c[b-1],c[b],d,e))return!1;return!0};function Id(a,b,c,d){for(var e=0,f=a[c-d],g=a[c-d+1];b<c;b+=d)var h=a[b],l=a[b+1],e=e+(h-f)*(l+g),f=h,g=l;return 0<e}function Jd(a,b,c,d){var e=0;d=void 0!==d?d:!1;var f,g;f=0;for(g=b.length;f<g;++f){var h=b[f],e=Id(a,e,h,c);if(0===f){if(d&&e||!d&&!e)return!1}else if(d&&!e||!d&&e)return!1;e=h}return!0}
function Kd(a,b,c,d,e){e=void 0!==e?e:!1;var f,g;f=0;for(g=c.length;f<g;++f){var h=c[f],l=Id(a,b,h,d);if(0===f?e&&l||!e&&!l:e&&!l||!e&&l)for(var l=a,m=h,n=d;b<m-n;){var p;for(p=0;p<n;++p){var q=l[b+p];l[b+p]=l[m-n+p];l[m-n+p]=q}b+=n;m-=n}b=h}return b}function Ld(a,b,c,d){var e=0,f,g;f=0;for(g=b.length;f<g;++f)e=Kd(a,e,b[f],c,d);return e};function E(a,b){hd.call(this);this.i=[];this.C=-1;this.D=null;this.T=this.R=this.S=-1;this.j=null;this.pa(a,b)}y(E,hd);k=E.prototype;k.yj=function(a){this.B?mb(this.B,a.la()):this.B=a.la().slice();this.i.push(this.B.length);this.u()};k.clone=function(){var a=new E(null);a.ba(this.f,this.B.slice(),this.i.slice());return a};
k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;this.R!=this.g&&(this.S=Math.sqrt(pd(this.B,0,this.i,this.a,0)),this.R=this.g);return rd(this.B,0,this.i,this.a,this.S,!0,a,b,c,d)};k.Bc=function(a,b){return Dd(this.Mb(),0,this.i,this.a,a,b)};k.qm=function(){return md(this.Mb(),0,this.i,this.a)};k.Z=function(a){var b;void 0!==a?(b=this.Mb().slice(),Kd(b,0,this.i,this.a,a)):b=this.B;return wd(b,0,this.i,this.a)};k.Db=function(){return this.i};
function Md(a){if(a.C!=a.g){var b=kc(a.H());a.D=Ed(a.Mb(),0,a.i,a.a,b,0);a.C=a.g}return a.D}k.bk=function(){return new C(Md(this))};k.gk=function(){return this.i.length};k.Hg=function(a){if(0>a||this.i.length<=a)return null;var b=new zd(null);Ad(b,this.f,this.B.slice(0===a?0:this.i[a-1],this.i[a]));return b};k.Vd=function(){var a=this.f,b=this.B,c=this.i,d=[],e=0,f,g;f=0;for(g=c.length;f<g;++f){var h=c[f],l=new zd(null);Ad(l,a,b.slice(e,h));d.push(l);e=h}return d};
k.Mb=function(){if(this.T!=this.g){var a=this.B;Jd(a,this.i,this.a)?this.j=a:(this.j=a.slice(),this.j.length=Kd(this.j,0,this.i,this.a));this.T=this.g}return this.j};k.Nc=function(a){var b=[],c=[];b.length=yd(this.B,0,this.i,this.a,Math.sqrt(a),b,0,c);a=new E(null);a.ba("XY",b,c);return a};k.X=function(){return"Polygon"};k.Ka=function(a){return Hd(this.Mb(),0,this.i,this.a,a)};
k.pa=function(a,b){if(a){kd(this,b,a,2);this.B||(this.B=[]);var c=ud(this.B,0,a,this.a,this.i);this.B.length=0===c.length?0:c[c.length-1];this.u()}else this.ba("XY",null,this.i)};k.ba=function(a,b,c){jd(this,a,b);this.i=c;this.u()};function Nd(a,b,c,d){var e=d?d:32;d=[];var f;for(f=0;f<e;++f)mb(d,a.offset(b,c,2*Math.PI*f/e));d.push(d[0],d[1]);a=new E(null);a.ba("XY",d,[d.length]);return a}
function Od(a){var b=a[0],c=a[1],d=a[2];a=a[3];b=[b,c,b,a,d,a,d,c,b,c];c=new E(null);c.ba("XY",b,[b.length]);return c}function Pd(a,b,c){var d=b?b:32,e=a.va();b=a.f;for(var f=new E(null,b),d=e*(d+1),e=Array(d),g=0;g<d;g++)e[g]=0;f.ba(b,e,[e.length]);Qd(f,a.rd(),a.wf(),c);return f}function Qd(a,b,c,d){var e=a.la(),f=a.f,g=a.va(),h=a.Db(),l=e.length/g-1;d=d?d:0;for(var m,n,p=0;p<=l;++p)n=p*g,m=d+2*xa(p,l)*Math.PI/l,e[n]=b[0]+c*Math.cos(m),e[n+1]=b[1]+c*Math.sin(m);a.ba(f,e,h)};function Rd(a){eb.call(this);a=a||{};this.f=[0,0];var b={};b.center=void 0!==a.center?a.center:null;this.l=Mc(a.projection);var c,d,e,f=void 0!==a.minZoom?a.minZoom:0;c=void 0!==a.maxZoom?a.maxZoom:28;var g=void 0!==a.zoomFactor?a.zoomFactor:2;if(void 0!==a.resolutions)c=a.resolutions,d=c[0],e=c[c.length-1],c=tb(c);else{d=Mc(a.projection);e=d.H();var h=(e?Math.max(ic(e),jc(e)):360*uc.degrees/d.$b())/256/Math.pow(2,0),l=h/Math.pow(2,28);d=a.maxResolution;void 0!==d?f=0:d=h/Math.pow(g,f);e=a.minResolution;
void 0===e&&(e=void 0!==a.maxZoom?void 0!==a.maxResolution?d/Math.pow(g,c):h/Math.pow(g,c):l);c=f+Math.floor(Math.log(d/e)/Math.log(g));e=d/Math.pow(g,c-f);c=ub(g,d,c-f)}this.a=d;this.c=e;this.j=a.resolutions;this.i=f;f=void 0!==a.extent?Ba(a.extent):Ca;(void 0!==a.enableRotation?a.enableRotation:1)?(d=a.constrainRotation,d=void 0===d||!0===d?yb():!1===d?wb:ea(d)?xb(d):wb):d=vb;this.o=new Da(f,c,d);void 0!==a.resolution?b.resolution=a.resolution:void 0!==a.zoom&&(b.resolution=this.constrainResolution(this.a,
a.zoom-this.i));b.rotation=void 0!==a.rotation?a.rotation:0;this.G(b)}y(Rd,eb);k=Rd.prototype;k.Pd=function(a){return this.o.center(a)};k.constrainResolution=function(a,b,c){return this.o.resolution(a,b||0,c||0)};k.constrainRotation=function(a,b){return this.o.rotation(a,b||0)};k.ab=function(){return this.get("center")};function Sd(a,b){return void 0!==b?(b[0]=a.f[0],b[1]=a.f[1],b):a.f.slice()}k.Kc=function(a){var b=this.ab(),c=this.$(),d=this.La();return lc(b,c,d,a)};k.Vl=function(){return this.a};
k.Wl=function(){return this.c};k.Xl=function(){return this.l};k.$=function(){return this.get("resolution")};k.Yl=function(){return this.j};function Td(a,b){return Math.max(ic(a)/b[0],jc(a)/b[1])}function Ud(a){var b=a.a,c=Math.log(b/a.c)/Math.log(2);return function(a){return b/Math.pow(2,a*c)}}k.La=function(){return this.get("rotation")};function Vd(a){var b=a.a,c=Math.log(b/a.c)/Math.log(2);return function(a){return Math.log(b/a)/Math.log(2)/c}}
k.V=function(){var a=this.ab(),b=this.l,c=this.$(),d=this.La();return{center:[Math.round(a[0]/c)*c,Math.round(a[1]/c)*c],projection:void 0!==b?b:null,resolution:c,rotation:d}};k.Fk=function(){var a,b=this.$();if(void 0!==b){var c,d=0;do{c=this.constrainResolution(this.a,d);if(c==b){a=d;break}++d}while(c>this.c)}return void 0!==a?this.i+a:a};
k.cf=function(a,b,c){a instanceof hd||(a=Od(a));var d=c||{};c=void 0!==d.padding?d.padding:[0,0,0,0];var e=void 0!==d.constrainResolution?d.constrainResolution:!0,f=void 0!==d.nearest?d.nearest:!1,g;void 0!==d.minResolution?g=d.minResolution:void 0!==d.maxZoom?g=this.constrainResolution(this.a,d.maxZoom-this.i,0):g=0;var h=a.la(),l=this.La(),d=Math.cos(-l),l=Math.sin(-l),m=Infinity,n=Infinity,p=-Infinity,q=-Infinity;a=a.va();for(var r=0,u=h.length;r<u;r+=a)var x=h[r]*d-h[r+1]*l,v=h[r]*l+h[r+1]*d,
m=Math.min(m,x),n=Math.min(n,v),p=Math.max(p,x),q=Math.max(q,v);b=Td([m,n,p,q],[b[0]-c[1]-c[3],b[1]-c[0]-c[2]]);b=isNaN(b)?g:Math.max(b,g);e&&(g=this.constrainResolution(b,0,0),!f&&g<b&&(g=this.constrainResolution(g,-1,0)),b=g);this.Ub(b);l=-l;f=(m+p)/2+(c[1]-c[3])/2*b;c=(n+q)/2+(c[0]-c[2])/2*b;this.mb([f*d-c*l,c*d+f*l])};
k.Ej=function(a,b,c){var d=this.La(),e=Math.cos(-d),d=Math.sin(-d),f=a[0]*e-a[1]*d;a=a[1]*e+a[0]*d;var g=this.$(),f=f+(b[0]/2-c[0])*g;a+=(c[1]-b[1]/2)*g;d=-d;this.mb([f*e-a*d,a*e+f*d])};function Wd(a){return!!a.ab()&&void 0!==a.$()}k.rotate=function(a,b){if(void 0!==b){var c,d=this.ab();void 0!==d&&(c=[d[0]-b[0],d[1]-b[1]],Gb(c,a-this.La()),Bb(c,b));this.mb(c)}this.ie(a)};k.mb=function(a){this.set("center",a)};function Xd(a,b){a.f[1]+=b}k.Ub=function(a){this.set("resolution",a)};
k.ie=function(a){this.set("rotation",a)};k.np=function(a){a=this.constrainResolution(this.a,a-this.i,0);this.Ub(a)};function Yd(a){return Math.pow(a,3)}function Zd(a){return 1-Yd(1-a)}function $d(a){return 3*a*a-2*a*a*a}function ae(a){return a}function be(a){return.5>a?$d(2*a):1-$d(2*(a-.5))};function ce(a){var b=a.source,c=a.start?a.start:Date.now(),d=b[0],e=b[1],f=void 0!==a.duration?a.duration:1E3,g=a.easing?a.easing:$d;return function(a,b){if(b.time<c)return b.animate=!0,b.viewHints[0]+=1,!0;if(b.time<c+f){var m=1-g((b.time-c)/f),n=d-b.viewState.center[0],p=e-b.viewState.center[1];b.animate=!0;b.viewState.center[0]+=m*n;b.viewState.center[1]+=m*p;b.viewHints[0]+=1;return!0}return!1}}
function de(a){var b=a.rotation?a.rotation:0,c=a.start?a.start:Date.now(),d=void 0!==a.duration?a.duration:1E3,e=a.easing?a.easing:$d,f=a.anchor?a.anchor:null;return function(a,h){if(h.time<c)return h.animate=!0,h.viewHints[0]+=1,!0;if(h.time<c+d){var l=1-e((h.time-c)/d),l=(b-h.viewState.rotation)*l;h.animate=!0;h.viewState.rotation+=l;if(f){var m=h.viewState.center;m[0]-=f[0];m[1]-=f[1];Gb(m,l);Bb(m,f)}h.viewHints[0]+=1;return!0}return!1}}
function ee(a){var b=a.resolution,c=a.start?a.start:Date.now(),d=void 0!==a.duration?a.duration:1E3,e=a.easing?a.easing:$d;return function(a,g){if(g.time<c)return g.animate=!0,g.viewHints[0]+=1,!0;if(g.time<c+d){var h=1-e((g.time-c)/d),l=b-g.viewState.resolution;g.animate=!0;g.viewState.resolution+=h*l;g.viewHints[0]+=1;return!0}return!1}};function fe(a,b,c,d){this.ca=a;this.ea=b;this.fa=c;this.ga=d}fe.prototype.contains=function(a){return ge(this,a[1],a[2])};function ge(a,b,c){return a.ca<=b&&b<=a.ea&&a.fa<=c&&c<=a.ga}function he(a,b){return a.ca==b.ca&&a.fa==b.fa&&a.ea==b.ea&&a.ga==b.ga}function ie(a,b){return a.ca<=b.ea&&a.ea>=b.ca&&a.fa<=b.ga&&a.ga>=b.fa};function je(a){this.a=a.html;this.b=a.tileRanges?a.tileRanges:null}je.prototype.g=function(){return this.a};function ke(a,b,c){Wa.call(this,a,c);this.element=b}y(ke,Wa);function le(a){eb.call(this);this.a=a?a:[];me(this)}y(le,eb);k=le.prototype;k.clear=function(){for(;0<this.dc();)this.pop()};k.qf=function(a){var b,c;b=0;for(c=a.length;b<c;++b)this.push(a[b]);return this};k.forEach=function(a,b){this.a.forEach(a,b)};k.Gl=function(){return this.a};k.item=function(a){return this.a[a]};k.dc=function(){return this.get("length")};k.ee=function(a,b){this.a.splice(a,0,b);me(this);this.b(new ke("add",b,this))};
k.pop=function(){return this.Rf(this.dc()-1)};k.push=function(a){var b=this.a.length;this.ee(b,a);return b};k.remove=function(a){var b=this.a,c,d;c=0;for(d=b.length;c<d;++c)if(b[c]===a)return this.Rf(c)};k.Rf=function(a){var b=this.a[a];this.a.splice(a,1);me(this);this.b(new ke("remove",b,this));return b};k.Zo=function(a,b){var c=this.dc();if(a<c)c=this.a[a],this.a[a]=b,this.b(new ke("remove",c,this)),this.b(new ke("add",b,this));else{for(;c<a;++c)this.ee(c,void 0);this.ee(a,b)}};
function me(a){a.set("length",a.a.length)};function ne(a){return Array.prototype.concat.apply(Array.prototype,arguments)}function oe(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]}function pe(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var qe=/^#(?:[0-9a-f]{3}){1,2}$/i,re=/^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i,se=/^(?:rgba)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|1|0\.\d{0,10})\)$/i;function te(a){return Array.isArray(a)?a:ue(a)}function ve(a){if("string"!==typeof a){var b=a[0];b!=(b|0)&&(b=b+.5|0);var c=a[1];c!=(c|0)&&(c=c+.5|0);var d=a[2];d!=(d|0)&&(d=d+.5|0);a="rgba("+b+","+c+","+d+","+(void 0===a[3]?1:a[3])+")"}return a}
var ue=function(){var a={},b=0;return function(c){var d;if(a.hasOwnProperty(c))d=a[c];else{if(1024<=b){d=0;for(var e in a)0===(d++&3)&&(delete a[e],--b)}var f,g;qe.exec(c)?(g=3==c.length-1?1:2,d=parseInt(c.substr(1+0*g,g),16),e=parseInt(c.substr(1+1*g,g),16),f=parseInt(c.substr(1+2*g,g),16),1==g&&(d=(d<<4)+d,e=(e<<4)+e,f=(f<<4)+f),d=[d,e,f,1]):(g=se.exec(c))?(d=Number(g[1]),e=Number(g[2]),f=Number(g[3]),g=Number(g[4]),d=[d,e,f,g],d=we(d,d)):(g=re.exec(c))?(d=Number(g[1]),e=Number(g[2]),f=Number(g[3]),
d=[d,e,f,1],d=we(d,d)):d=void 0;a[c]=d;++b}return d}}();function we(a,b){var c=b||[];c[0]=sa(a[0]+.5|0,0,255);c[1]=sa(a[1]+.5|0,0,255);c[2]=sa(a[2]+.5|0,0,255);c[3]=sa(a[3],0,1);return c};function xe(a){return"string"===typeof a||a instanceof CanvasPattern||a instanceof CanvasGradient?a:ve(a)};var ye;a:{var ze=aa.navigator;if(ze){var Ae=ze.userAgent;if(Ae){ye=Ae;break a}}ye=""}function Be(a){return-1!=ye.indexOf(a)};var Ce=Be("Opera"),Ee=Be("Trident")||Be("MSIE"),Fe=Be("Edge"),Ge=Be("Gecko")&&!(-1!=ye.toLowerCase().indexOf("webkit")&&!Be("Edge"))&&!(Be("Trident")||Be("MSIE"))&&!Be("Edge"),He=-1!=ye.toLowerCase().indexOf("webkit")&&!Be("Edge"),Ie;
a:{var Je="",Ke=function(){var a=ye;if(Ge)return/rv\:([^\);]+)(\)|;)/.exec(a);if(Fe)return/Edge\/([\d\.]+)/.exec(a);if(Ee)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(He)return/WebKit\/(\S+)/.exec(a);if(Ce)return/(?:Version)[ \/]?(\S+)/.exec(a)}();Ke&&(Je=Ke?Ke[1]:"");if(Ee){var Le,Me=aa.document;Le=Me?Me.documentMode:void 0;if(null!=Le&&Le>parseFloat(Je)){Ie=String(Le);break a}}Ie=Je}var Ne={};function Oe(a,b){var c=document.createElement("CANVAS");a&&(c.width=a);b&&(c.height=b);return c.getContext("2d")}
var Pe=function(){var a;return function(){if(void 0===a){var b=document.createElement("P"),c,d={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.appendChild(b);for(var e in d)e in b.style&&(b.style[e]="translate(1px,1px)",c=pa.getComputedStyle(b).getPropertyValue(d[e]));document.body.removeChild(b);a=c&&"none"!==c}return a}}(),Qe=function(){var a;return function(){if(void 0===a){var b=document.createElement("P"),
c,d={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.appendChild(b);for(var e in d)e in b.style&&(b.style[e]="translate3d(1px,1px,1px)",c=pa.getComputedStyle(b).getPropertyValue(d[e]));document.body.removeChild(b);a=c&&"none"!==c}return a}}();
function Re(a,b){var c=a.style;c.WebkitTransform=b;c.MozTransform=b;c.b=b;c.msTransform=b;c.transform=b;if((c=Ee)&&!(c=Ne["9.0"])){for(var c=0,d=qa(String(Ie)).split("."),e=qa("9.0").split("."),f=Math.max(d.length,e.length),g=0;0==c&&g<f;g++){var h=d[g]||"",l=e[g]||"",m=RegExp("(\\d*)(\\D*)","g"),n=RegExp("(\\d*)(\\D*)","g");do{var p=m.exec(h)||["","",""],q=n.exec(l)||["","",""];if(0==p[0].length&&0==q[0].length)break;c=ra(0==p[1].length?0:parseInt(p[1],10),0==q[1].length?0:parseInt(q[1],10))||ra(0==
p[2].length,0==q[2].length)||ra(p[2],q[2])}while(0==c)}c=Ne["9.0"]=0<=c}c&&(a.style.transformOrigin="0 0")}function Se(a,b){var c;if(Qe()){var d=Array(16);for(c=0;16>c;++c)d[c]=b[c].toFixed(6);Re(a,"matrix3d("+d.join(",")+")")}else if(Pe()){var d=[b[0],b[1],b[4],b[5],b[12],b[13]],e=Array(6);for(c=0;6>c;++c)e[c]=d[c].toFixed(6);Re(a,"matrix("+e.join(",")+")")}else a.style.left=Math.round(b[12])+"px",a.style.top=Math.round(b[13])+"px"}function Te(a,b){var c=b.parentNode;c&&c.replaceChild(a,b)}
function Ue(a){a&&a.parentNode&&a.parentNode.removeChild(a)}function Ve(a){for(;a.lastChild;)a.removeChild(a.lastChild)};function We(a,b,c){Wa.call(this,a);this.map=b;this.frameState=void 0!==c?c:null}y(We,Wa);function Xe(a){eb.call(this);this.element=a.element?a.element:null;this.a=this.S=null;this.s=[];this.render=a.render?a.render:na;a.target&&this.c(a.target)}y(Xe,eb);Xe.prototype.ka=function(){Ue(this.element);eb.prototype.ka.call(this)};Xe.prototype.i=function(){return this.a};
Xe.prototype.setMap=function(a){this.a&&Ue(this.element);for(var b=0,c=this.s.length;b<c;++b)Ka(this.s[b]);this.s.length=0;if(this.a=a)(this.S?this.S:a.v).appendChild(this.element),this.render!==na&&this.s.push(B(a,"postrender",this.render,this)),a.render()};Xe.prototype.c=function(a){this.S="string"===typeof a?document.getElementById(a):a};function Ye(){this.g=0;this.f={};this.a=this.b=null}k=Ye.prototype;k.clear=function(){this.g=0;this.f={};this.a=this.b=null};function Ze(a,b){return a.f.hasOwnProperty(b)}k.forEach=function(a,b){for(var c=this.b;c;)a.call(b,c.pc,c.cc,this),c=c.yb};k.get=function(a){a=this.f[a];if(a===this.a)return a.pc;a===this.b?(this.b=this.b.yb,this.b.kc=null):(a.yb.kc=a.kc,a.kc.yb=a.yb);a.yb=null;a.kc=this.a;this.a=this.a.yb=a;return a.pc};k.wc=function(){return this.g};
k.N=function(){var a=Array(this.g),b=0,c;for(c=this.a;c;c=c.kc)a[b++]=c.cc;return a};k.zc=function(){var a=Array(this.g),b=0,c;for(c=this.a;c;c=c.kc)a[b++]=c.pc;return a};k.pop=function(){var a=this.b;delete this.f[a.cc];a.yb&&(a.yb.kc=null);this.b=a.yb;this.b||(this.a=null);--this.g;return a.pc};k.replace=function(a,b){this.get(a);this.f[a].pc=b};k.set=function(a,b){var c={cc:a,yb:null,kc:this.a,pc:b};this.a?this.a.yb=c:this.b=c;this.a=c;this.f[a]=c;++this.g};function $e(a,b,c,d){return void 0!==d?(d[0]=a,d[1]=b,d[2]=c,d):[a,b,c]}function af(a){var b=a[0],c=Array(b),d=1<<b-1,e,f;for(e=0;e<b;++e)f=48,a[1]&d&&(f+=1),a[2]&d&&(f+=2),c[e]=String.fromCharCode(f),d>>=1;return c.join("")};function bf(a){Ye.call(this);this.c=void 0!==a?a:2048}y(bf,Ye);function cf(a){return a.wc()>a.c}bf.prototype.Lc=function(a){for(var b,c;cf(this)&&!(b=this.b.pc,c=b.ma[0].toString(),c in a&&a[c].contains(b.ma));)Ta(this.pop())};function df(a,b){$a.call(this);this.ma=a;this.state=b;this.a=null;this.key=""}y(df,$a);function ef(a){a.b("change")}df.prototype.ib=function(){return w(this).toString()};df.prototype.i=function(){return this.ma};df.prototype.V=function(){return this.state};function ff(a,b,c){void 0===c&&(c=[0,0]);c[0]=a[0]+2*b;c[1]=a[1]+2*b;return c}function gf(a,b,c){void 0===c&&(c=[0,0]);c[0]=a[0]*b+.5|0;c[1]=a[1]*b+.5|0;return c}function hf(a,b){if(Array.isArray(a))return a;void 0===b?b=[a,a]:(b[0]=a,b[1]=a);return b};function jf(a){eb.call(this);this.f=yc(a.projection);this.l=kf(a.attributions);this.R=a.logo;this.za=void 0!==a.state?a.state:"ready";this.D=void 0!==a.wrapX?a.wrapX:!1}y(jf,eb);function kf(a){if("string"===typeof a)return[new je({html:a})];if(a instanceof je)return[a];if(Array.isArray(a)){for(var b=a.length,c=Array(b),d=0;d<b;d++){var e=a[d];c[d]="string"===typeof e?new je({html:e}):e}return c}return null}k=jf.prototype;k.ra=na;k.wa=function(){return this.l};k.ua=function(){return this.R};k.xa=function(){return this.f};
k.V=function(){return this.za};k.sa=function(){this.u()};k.oa=function(a){this.l=kf(a);this.u()};function lf(a,b){a.za=b;a.u()};function mf(a){this.minZoom=void 0!==a.minZoom?a.minZoom:0;this.b=a.resolutions;this.maxZoom=this.b.length-1;this.g=void 0!==a.origin?a.origin:null;this.c=null;void 0!==a.origins&&(this.c=a.origins);var b=a.extent;void 0===b||this.g||this.c||(this.g=fc(b));this.i=null;void 0!==a.tileSizes&&(this.i=a.tileSizes);this.o=void 0!==a.tileSize?a.tileSize:this.i?null:256;this.s=void 0!==b?b:null;this.a=null;this.f=[0,0];void 0!==a.sizes?this.a=a.sizes.map(function(a){return new fe(Math.min(0,a[0]),Math.max(a[0]-
1,-1),Math.min(0,a[1]),Math.max(a[1]-1,-1))},this):b&&nf(this,b)}var of=[0,0,0];k=mf.prototype;k.yg=function(a,b,c){a=pf(this,a,b);for(var d=a.ca,e=a.ea;d<=e;++d)for(var f=a.fa,g=a.ga;f<=g;++f)c([b,d,f])};function qf(a,b,c,d,e){e=a.Ea(b,e);for(b=b[0]-1;b>=a.minZoom;){if(c.call(null,b,pf(a,e,b,d)))return!0;--b}return!1}k.H=function(){return this.s};k.Ig=function(){return this.maxZoom};k.Jg=function(){return this.minZoom};k.Ia=function(a){return this.g?this.g:this.c[a]};k.$=function(a){return this.b[a]};
k.Kh=function(){return this.b};function rf(a,b,c,d){return b[0]<a.maxZoom?(d=a.Ea(b,d),pf(a,d,b[0]+1,c)):null}function sf(a,b,c,d){tf(a,b[0],b[1],c,!1,of);var e=of[1],f=of[2];tf(a,b[2],b[3],c,!0,of);a=of[1];b=of[2];void 0!==d?(d.ca=e,d.ea=a,d.fa=f,d.ga=b):d=new fe(e,a,f,b);return d}function pf(a,b,c,d){c=a.$(c);return sf(a,b,c,d)}function uf(a,b){var c=a.Ia(b[0]),d=a.$(b[0]),e=hf(a.Ja(b[0]),a.f);return[c[0]+(b[1]+.5)*e[0]*d,c[1]+(b[2]+.5)*e[1]*d]}
k.Ea=function(a,b){var c=this.Ia(a[0]),d=this.$(a[0]),e=hf(this.Ja(a[0]),this.f),f=c[0]+a[1]*e[0]*d,c=c[1]+a[2]*e[1]*d;return Wb(f,c,f+e[0]*d,c+e[1]*d,b)};k.Zd=function(a,b,c){return tf(this,a[0],a[1],b,!1,c)};function tf(a,b,c,d,e,f){var g=a.Lb(d),h=d/a.$(g),l=a.Ia(g);a=hf(a.Ja(g),a.f);b=h*Math.floor((b-l[0])/d+(e?.5:0))/a[0];c=h*Math.floor((c-l[1])/d+(e?0:.5))/a[1];e?(b=Math.ceil(b)-1,c=Math.ceil(c)-1):(b=Math.floor(b),c=Math.floor(c));return $e(g,b,c,f)}
k.qd=function(a,b,c){b=this.$(b);return tf(this,a[0],a[1],b,!1,c)};k.Ja=function(a){return this.o?this.o:this.i[a]};k.Lb=function(a,b){var c=kb(this.b,a,b||0);return sa(c,this.minZoom,this.maxZoom)};function nf(a,b){for(var c=a.b.length,d=Array(c),e=a.minZoom;e<c;++e)d[e]=pf(a,b,e);a.a=d}function vf(a){var b=a.l;if(!b){var b=wf(a),c=xf(b,void 0,void 0),b=new mf({extent:b,origin:fc(b),resolutions:c,tileSize:void 0});a.l=b}return b}
function yf(a){var b={};Ea(b,void 0!==a?a:{});void 0===b.extent&&(b.extent=yc("EPSG:3857").H());b.resolutions=xf(b.extent,b.maxZoom,b.tileSize);delete b.maxZoom;return new mf(b)}function xf(a,b,c){b=void 0!==b?b:42;var d=jc(a);a=ic(a);c=hf(void 0!==c?c:256);c=Math.max(a/c[0],d/c[1]);b+=1;d=Array(b);for(a=0;a<b;++a)d[a]=c/Math.pow(2,a);return d}function wf(a){a=yc(a);var b=a.H();b||(a=180*uc.degrees/a.$b(),b=Wb(-a,-a,a,a));return b};function zf(a){jf.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,state:a.state,wrapX:a.wrapX});this.ia=void 0!==a.opaque?a.opaque:!1;this.ta=void 0!==a.tilePixelRatio?a.tilePixelRatio:1;this.tileGrid=void 0!==a.tileGrid?a.tileGrid:null;this.a=new bf(a.cacheSize);this.o=[0,0];this.cc=""}y(zf,jf);k=zf.prototype;k.Ah=function(){return cf(this.a)};k.Lc=function(a,b){var c=this.pd(a);c&&c.Lc(b)};
function Af(a,b,c,d,e){b=a.pd(b);if(!b)return!1;for(var f=!0,g,h,l=d.ca;l<=d.ea;++l)for(var m=d.fa;m<=d.ga;++m)g=a.Eb(c,l,m),h=!1,Ze(b,g)&&(g=b.get(g),(h=2===g.V())&&(h=!1!==e(g))),h||(f=!1);return f}k.Ud=function(){return 0};function Bf(a,b){a.cc!==b&&(a.cc=b,a.u())}k.Eb=function(a,b,c){return a+"/"+b+"/"+c};k.jf=function(){return this.ia};k.Na=function(){return this.tileGrid};k.eb=function(a){return this.tileGrid?this.tileGrid:vf(a)};k.pd=function(a){var b=this.f;return b&&!Oc(b,a)?null:this.a};
k.bc=function(){return this.ta};k.$d=function(a,b,c){c=this.eb(c);b=this.bc(b);a=hf(c.Ja(a),this.o);return 1==b?a:gf(a,b,this.o)};function Cf(a,b,c){var d=void 0!==c?c:a.f;c=a.eb(d);if(a.D&&d.g){var e=b;b=e[0];a=uf(c,e);d=wf(d);Sb(d,a)?b=e:(e=ic(d),a[0]+=e*Math.ceil((d[0]-a[0])/e),b=c.qd(a,b))}e=b[0];d=b[1];a=b[2];if(c.minZoom>e||e>c.maxZoom)c=!1;else{var f=c.H();c=(c=f?pf(c,f,e):c.a?c.a[e]:null)?ge(c,d,a):!0}return c?b:null}k.sa=function(){this.a.clear();this.u()};k.Yf=na;
function Df(a,b){Wa.call(this,a);this.tile=b}y(Df,Wa);function Ef(a){a=a?a:{};this.R=document.createElement("UL");this.v=document.createElement("LI");this.R.appendChild(this.v);this.v.style.display="none";this.f=void 0!==a.collapsed?a.collapsed:!0;this.o=void 0!==a.collapsible?a.collapsible:!0;this.o||(this.f=!1);var b=void 0!==a.className?a.className:"ol-attribution",c=void 0!==a.tipLabel?a.tipLabel:"Attributions",d=void 0!==a.collapseLabel?a.collapseLabel:"\u00bb";"string"===typeof d?(this.A=document.createElement("span"),this.A.textContent=d):this.A=
d;d=void 0!==a.label?a.label:"i";"string"===typeof d?(this.C=document.createElement("span"),this.C.textContent=d):this.C=d;var e=this.o&&!this.f?this.A:this.C,d=document.createElement("button");d.setAttribute("type","button");d.title=c;d.appendChild(e);B(d,"click",this.am,this);c=document.createElement("div");c.className=b+" ol-unselectable ol-control"+(this.f&&this.o?" ol-collapsed":"")+(this.o?"":" ol-uncollapsible");c.appendChild(this.R);c.appendChild(d);Xe.call(this,{element:c,render:a.render?
a.render:Ff,target:a.target});this.D=!0;this.j={};this.l={};this.T={}}y(Ef,Xe);
function Ff(a){if(a=a.frameState){var b,c,d,e,f,g,h,l,m,n,p,q=a.layerStatesArray,r=Ea({},a.attributions),u={},x=a.viewState.projection;c=0;for(b=q.length;c<b;c++)if(g=q[c].layer.ha())if(n=w(g).toString(),m=g.l)for(d=0,e=m.length;d<e;d++)if(h=m[d],l=w(h).toString(),!(l in r)){if(f=a.usedTiles[n]){var v=g.eb(x);a:{p=h;var D=x;if(p.b){var A,z,F,N=void 0;for(N in f)if(N in p.b){F=f[N];var K;A=0;for(z=p.b[N].length;A<z;++A){K=p.b[N][A];if(ie(K,F)){p=!0;break a}var X=pf(v,wf(D),parseInt(N,10)),oa=X.ea-
X.ca+1;if(F.ca<X.ca||F.ea>X.ea)if(ie(K,new fe(xa(F.ca,oa),xa(F.ea,oa),F.fa,F.ga))||F.ea-F.ca+1>oa&&ie(K,X)){p=!0;break a}}}p=!1}else p=!0}}else p=!1;p?(l in u&&delete u[l],r[l]=h):u[l]=h}b=[r,u];c=b[0];b=b[1];for(var H in this.j)H in c?(this.l[H]||(this.j[H].style.display="",this.l[H]=!0),delete c[H]):H in b?(this.l[H]&&(this.j[H].style.display="none",delete this.l[H]),delete b[H]):(Ue(this.j[H]),delete this.j[H],delete this.l[H]);for(H in c)d=document.createElement("LI"),d.innerHTML=c[H].a,this.R.appendChild(d),
this.j[H]=d,this.l[H]=!0;for(H in b)d=document.createElement("LI"),d.innerHTML=b[H].a,d.style.display="none",this.R.appendChild(d),this.j[H]=d;H=!Ha(this.l)||!Ha(a.logos);this.D!=H&&(this.element.style.display=H?"":"none",this.D=H);H&&Ha(this.l)?this.element.classList.add("ol-logo-only"):this.element.classList.remove("ol-logo-only");var ya;a=a.logos;H=this.T;for(ya in H)ya in a||(Ue(H[ya]),delete H[ya]);for(var Ua in a)b=a[Ua],b instanceof HTMLElement&&(this.v.appendChild(b),H[Ua]=b),Ua in H||(ya=
new Image,ya.src=Ua,""===b?c=ya:(c=document.createElement("a"),c.href=b,c.appendChild(ya)),this.v.appendChild(c),H[Ua]=c);this.v.style.display=Ha(a)?"none":""}else this.D&&(this.element.style.display="none",this.D=!1)}k=Ef.prototype;k.am=function(a){a.preventDefault();Gf(this)};function Gf(a){a.element.classList.toggle("ol-collapsed");a.f?Te(a.A,a.C):Te(a.C,a.A);a.f=!a.f}k.$l=function(){return this.o};
k.cm=function(a){this.o!==a&&(this.o=a,this.element.classList.toggle("ol-uncollapsible"),!a&&this.f&&Gf(this))};k.bm=function(a){this.o&&this.f!==a&&Gf(this)};k.Zl=function(){return this.f};function Hf(a){a=a?a:{};var b=void 0!==a.className?a.className:"ol-rotate",c=void 0!==a.label?a.label:"\u21e7";this.f=null;"string"===typeof c?(this.f=document.createElement("span"),this.f.className="ol-compass",this.f.textContent=c):(this.f=c,this.f.classList.add("ol-compass"));var d=a.tipLabel?a.tipLabel:"Reset rotation",c=document.createElement("button");c.className=b+"-reset";c.setAttribute("type","button");c.title=d;c.appendChild(this.f);B(c,"click",Hf.prototype.A,this);d=document.createElement("div");
d.className=b+" ol-unselectable ol-control";d.appendChild(c);b=a.render?a.render:If;this.o=a.resetNorth?a.resetNorth:void 0;Xe.call(this,{element:d,render:b,target:a.target});this.j=void 0!==a.duration?a.duration:250;this.l=void 0!==a.autoHide?a.autoHide:!0;this.v=void 0;this.l&&this.element.classList.add("ol-hidden")}y(Hf,Xe);
Hf.prototype.A=function(a){a.preventDefault();if(void 0!==this.o)this.o();else{a=this.a;var b=a.aa();if(b){var c=b.La();void 0!==c&&(0<this.j&&(c%=2*Math.PI,c<-Math.PI&&(c+=2*Math.PI),c>Math.PI&&(c-=2*Math.PI),a.Wa(de({rotation:c,duration:this.j,easing:Zd}))),b.ie(0))}}};
function If(a){if(a=a.frameState){a=a.viewState.rotation;if(a!=this.v){var b="rotate("+a+"rad)";if(this.l){var c=this.element.classList.contains("ol-hidden");c||0!==a?c&&0!==a&&this.element.classList.remove("ol-hidden"):this.element.classList.add("ol-hidden")}this.f.style.msTransform=b;this.f.style.webkitTransform=b;this.f.style.transform=b}this.v=a}};function Jf(a){a=a?a:{};var b=void 0!==a.className?a.className:"ol-zoom",c=void 0!==a.delta?a.delta:1,d=void 0!==a.zoomInLabel?a.zoomInLabel:"+",e=void 0!==a.zoomOutLabel?a.zoomOutLabel:"\u2212",f=void 0!==a.zoomInTipLabel?a.zoomInTipLabel:"Zoom in",g=void 0!==a.zoomOutTipLabel?a.zoomOutTipLabel:"Zoom out",h=document.createElement("button");h.className=b+"-in";h.setAttribute("type","button");h.title=f;h.appendChild("string"===typeof d?document.createTextNode(d):d);B(h,"click",Jf.prototype.l.bind(this,
c));d=document.createElement("button");d.className=b+"-out";d.setAttribute("type","button");d.title=g;d.appendChild("string"===typeof e?document.createTextNode(e):e);B(d,"click",Jf.prototype.l.bind(this,-c));c=document.createElement("div");c.className=b+" ol-unselectable ol-control";c.appendChild(h);c.appendChild(d);Xe.call(this,{element:c,target:a.target});this.f=void 0!==a.duration?a.duration:250}y(Jf,Xe);
Jf.prototype.l=function(a,b){b.preventDefault();var c=this.a,d=c.aa();if(d){var e=d.$();e&&(0<this.f&&c.Wa(ee({resolution:e,duration:this.f,easing:Zd})),c=d.constrainResolution(e,a),d.Ub(c))}};function Kf(a){a=a?a:{};var b=new le;(void 0!==a.zoom?a.zoom:1)&&b.push(new Jf(a.zoomOptions));(void 0!==a.rotate?a.rotate:1)&&b.push(new Hf(a.rotateOptions));(void 0!==a.attribution?a.attribution:1)&&b.push(new Ef(a.attributionOptions));return b};function Lf(a){a=a?a:{};this.f=void 0!==a.className?a.className:"ol-full-screen";var b=void 0!==a.label?a.label:"\u2922";this.o="string"===typeof b?document.createTextNode(b):b;b=void 0!==a.labelActive?a.labelActive:"\u00d7";this.j="string"===typeof b?document.createTextNode(b):b;var c=a.tipLabel?a.tipLabel:"Toggle full-screen",b=document.createElement("button");b.className=this.f+"-"+Mf();b.setAttribute("type","button");b.title=c;b.appendChild(this.o);B(b,"click",this.C,this);c=document.createElement("div");
c.className=this.f+" ol-unselectable ol-control "+(Nf()?"":"ol-unsupported");c.appendChild(b);Xe.call(this,{element:c,target:a.target});this.A=void 0!==a.keys?a.keys:!1;this.l=a.source}y(Lf,Xe);
Lf.prototype.C=function(a){a.preventDefault();Nf()&&(a=this.a)&&(Mf()?document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen():(a=this.l?"string"===typeof this.l?document.getElementById(this.l):this.l:a.yc(),this.A?a.mozRequestFullScreenWithKeys?a.mozRequestFullScreenWithKeys():a.webkitRequestFullscreen?a.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT):
Of(a):Of(a)))};Lf.prototype.v=function(){var a=this.element.firstElementChild,b=this.a;Mf()?(a.className=this.f+"-true",Te(this.j,this.o)):(a.className=this.f+"-false",Te(this.o,this.j));b&&b.Xc()};Lf.prototype.setMap=function(a){Xe.prototype.setMap.call(this,a);a&&this.s.push(B(pa.document,Pf(),this.v,this))};
function Nf(){var a=document.body;return!!(a.webkitRequestFullscreen||a.mozRequestFullScreen&&document.mozFullScreenEnabled||a.msRequestFullscreen&&document.msFullscreenEnabled||a.requestFullscreen&&document.fullscreenEnabled)}function Mf(){return!!(document.webkitIsFullScreen||document.mozFullScreen||document.msFullscreenElement||document.fullscreenElement)}
function Of(a){a.requestFullscreen?a.requestFullscreen():a.msRequestFullscreen?a.msRequestFullscreen():a.mozRequestFullScreen?a.mozRequestFullScreen():a.webkitRequestFullscreen&&a.webkitRequestFullscreen()}var Pf=function(){var a;return function(){if(!a){var b=document.body;b.webkitRequestFullscreen?a="webkitfullscreenchange":b.mozRequestFullScreen?a="mozfullscreenchange":b.msRequestFullscreen?a="MSFullscreenChange":b.requestFullscreen&&(a="fullscreenchange")}return a}}();function Qf(a){a=a?a:{};var b=document.createElement("DIV");b.className=void 0!==a.className?a.className:"ol-mouse-position";Xe.call(this,{element:b,render:a.render?a.render:Rf,target:a.target});B(this,gb("projection"),this.dm,this);a.coordinateFormat&&this.ei(a.coordinateFormat);a.projection&&this.ih(yc(a.projection));this.v=void 0!==a.undefinedHTML?a.undefinedHTML:"";this.j=b.innerHTML;this.o=this.l=this.f=null}y(Qf,Xe);
function Rf(a){a=a.frameState;a?this.f!=a.viewState.projection&&(this.f=a.viewState.projection,this.l=null):this.f=null;Sf(this,this.o)}k=Qf.prototype;k.dm=function(){this.l=null};k.Cg=function(){return this.get("coordinateFormat")};k.hh=function(){return this.get("projection")};k.Xk=function(a){this.o=this.a.Td(a);Sf(this,this.o)};k.Yk=function(){Sf(this,null);this.o=null};
k.setMap=function(a){Xe.prototype.setMap.call(this,a);a&&(a=a.a,this.s.push(B(a,"mousemove",this.Xk,this),B(a,"mouseout",this.Yk,this)))};k.ei=function(a){this.set("coordinateFormat",a)};k.ih=function(a){this.set("projection",a)};function Sf(a,b){var c=a.v;if(b&&a.f){if(!a.l){var d=a.hh();a.l=d?Bc(a.f,d):Qc}if(d=a.a.Ma(b))a.l(d,d),c=(c=a.Cg())?c(d):d.toString()}a.j&&c==a.j||(a.element.innerHTML=c,a.j=c)};function Tf(a,b){var c=a;b&&(c=ka(a,b));"function"!=ca(aa.setImmediate)||aa.Window&&aa.Window.prototype&&!Be("Edge")&&aa.Window.prototype.setImmediate==aa.setImmediate?(Uf||(Uf=Vf()),Uf(c)):aa.setImmediate(c)}var Uf;
function Vf(){var a=aa.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!Be("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,a=ka(function(a){if(("*"==d||a.origin==d)&&a.data==
c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&!Be("Trident")&&!Be("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.rg;c.rg=null;a()}};return function(a){d.next={rg:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");
b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){aa.setTimeout(a,0)}};function Wf(a,b,c){Wa.call(this,a);this.b=b;a=c?c:{};this.buttons=Xf(a);this.pressure=Yf(a,this.buttons);this.bubbles="bubbles"in a?a.bubbles:!1;this.cancelable="cancelable"in a?a.cancelable:!1;this.view="view"in a?a.view:null;this.detail="detail"in a?a.detail:null;this.screenX="screenX"in a?a.screenX:0;this.screenY="screenY"in a?a.screenY:0;this.clientX="clientX"in a?a.clientX:0;this.clientY="clientY"in a?a.clientY:0;this.button="button"in a?a.button:0;this.relatedTarget="relatedTarget"in a?a.relatedTarget:
null;this.pointerId="pointerId"in a?a.pointerId:0;this.width="width"in a?a.width:0;this.height="height"in a?a.height:0;this.pointerType="pointerType"in a?a.pointerType:"";this.isPrimary="isPrimary"in a?a.isPrimary:!1;b.preventDefault&&(this.preventDefault=function(){b.preventDefault()})}y(Wf,Wa);function Xf(a){if(a.buttons||Zf)a=a.buttons;else switch(a.which){case 1:a=1;break;case 2:a=4;break;case 3:a=2;break;default:a=0}return a}
function Yf(a,b){var c=0;a.pressure?c=a.pressure:c=b?.5:0;return c}var Zf=!1;try{Zf=1===(new MouseEvent("click",{buttons:1})).buttons}catch(a){};var $f=["experimental-webgl","webgl","webkit-3d","moz-webgl"];function ag(a,b){var c,d,e=$f.length;for(d=0;d<e;++d)try{if(c=a.getContext($f[d],b))return c}catch(f){}return null};var bg,cg="undefined"!==typeof navigator?navigator.userAgent.toLowerCase():"",dg=-1!==cg.indexOf("firefox"),eg=-1!==cg.indexOf("safari")&&-1===cg.indexOf("chrom"),fg=-1!==cg.indexOf("macintosh"),gg=pa.devicePixelRatio||1,hg=!1,ig=function(){if(!("HTMLCanvasElement"in pa))return!1;try{var a=Oe();return a?(a.setLineDash&&(hg=!0),!0):!1}catch(b){return!1}}(),jg="DeviceOrientationEvent"in pa,kg="geolocation"in pa.navigator,lg="ontouchstart"in pa,mg="PointerEvent"in pa,ng=!!pa.navigator.msPointerEnabled,
og=!1,pg,qg=[];if("WebGLRenderingContext"in pa)try{var rg=ag(document.createElement("CANVAS"),{failIfMajorPerformanceCaveat:!0});rg&&(og=!0,pg=rg.getParameter(rg.MAX_TEXTURE_SIZE),qg=rg.getSupportedExtensions())}catch(a){}bg=og;ma=qg;la=pg;function sg(a,b){this.b=a;this.c=b};function tg(a){sg.call(this,a,{mousedown:this.rl,mousemove:this.sl,mouseup:this.vl,mouseover:this.ul,mouseout:this.tl});this.a=a.g;this.g=[]}y(tg,sg);function ug(a,b){for(var c=a.g,d=b.clientX,e=b.clientY,f=0,g=c.length,h;f<g&&(h=c[f]);f++){var l=Math.abs(e-h[1]);if(25>=Math.abs(d-h[0])&&25>=l)return!0}return!1}function vg(a){var b=wg(a,a),c=b.preventDefault;b.preventDefault=function(){a.preventDefault();c()};b.pointerId=1;b.isPrimary=!0;b.pointerType="mouse";return b}k=tg.prototype;
k.rl=function(a){if(!ug(this,a)){if((1).toString()in this.a){var b=vg(a);xg(this.b,yg,b,a);delete this.a[(1).toString()]}b=vg(a);this.a[(1).toString()]=a;xg(this.b,zg,b,a)}};k.sl=function(a){if(!ug(this,a)){var b=vg(a);xg(this.b,Ag,b,a)}};k.vl=function(a){if(!ug(this,a)){var b=this.a[(1).toString()];b&&b.button===a.button&&(b=vg(a),xg(this.b,Bg,b,a),delete this.a[(1).toString()])}};k.ul=function(a){if(!ug(this,a)){var b=vg(a);Cg(this.b,b,a)}};
k.tl=function(a){if(!ug(this,a)){var b=vg(a);Dg(this.b,b,a)}};function Eg(a){sg.call(this,a,{MSPointerDown:this.Al,MSPointerMove:this.Bl,MSPointerUp:this.El,MSPointerOut:this.Cl,MSPointerOver:this.Dl,MSPointerCancel:this.zl,MSGotPointerCapture:this.xl,MSLostPointerCapture:this.yl});this.a=a.g;this.g=["","unavailable","touch","pen","mouse"]}y(Eg,sg);function Fg(a,b){var c=b;ea(b.pointerType)&&(c=wg(b,b),c.pointerType=a.g[b.pointerType]);return c}k=Eg.prototype;k.Al=function(a){this.a[a.pointerId.toString()]=a;var b=Fg(this,a);xg(this.b,zg,b,a)};
k.Bl=function(a){var b=Fg(this,a);xg(this.b,Ag,b,a)};k.El=function(a){var b=Fg(this,a);xg(this.b,Bg,b,a);delete this.a[a.pointerId.toString()]};k.Cl=function(a){var b=Fg(this,a);Dg(this.b,b,a)};k.Dl=function(a){var b=Fg(this,a);Cg(this.b,b,a)};k.zl=function(a){var b=Fg(this,a);xg(this.b,yg,b,a);delete this.a[a.pointerId.toString()]};k.yl=function(a){this.b.b(new Wf("lostpointercapture",a,a))};k.xl=function(a){this.b.b(new Wf("gotpointercapture",a,a))};function Gg(a){sg.call(this,a,{pointerdown:this.lo,pointermove:this.mo,pointerup:this.po,pointerout:this.no,pointerover:this.oo,pointercancel:this.ko,gotpointercapture:this.Gk,lostpointercapture:this.ql})}y(Gg,sg);k=Gg.prototype;k.lo=function(a){Hg(this.b,a)};k.mo=function(a){Hg(this.b,a)};k.po=function(a){Hg(this.b,a)};k.no=function(a){Hg(this.b,a)};k.oo=function(a){Hg(this.b,a)};k.ko=function(a){Hg(this.b,a)};k.ql=function(a){Hg(this.b,a)};k.Gk=function(a){Hg(this.b,a)};function Ig(a,b){sg.call(this,a,{touchstart:this.sp,touchmove:this.rp,touchend:this.qp,touchcancel:this.pp});this.a=a.g;this.l=b;this.g=void 0;this.i=0;this.f=void 0}y(Ig,sg);k=Ig.prototype;k.ci=function(){this.i=0;this.f=void 0};
function Jg(a,b,c){b=wg(b,c);b.pointerId=c.identifier+2;b.bubbles=!0;b.cancelable=!0;b.detail=a.i;b.button=0;b.buttons=1;b.width=c.webkitRadiusX||c.radiusX||0;b.height=c.webkitRadiusY||c.radiusY||0;b.pressure=c.webkitForce||c.force||.5;b.isPrimary=a.g===c.identifier;b.pointerType="touch";b.clientX=c.clientX;b.clientY=c.clientY;b.screenX=c.screenX;b.screenY=c.screenY;return b}
function Kg(a,b,c){function d(){b.preventDefault()}var e=Array.prototype.slice.call(b.changedTouches),f=e.length,g,h;for(g=0;g<f;++g)h=Jg(a,b,e[g]),h.preventDefault=d,c.call(a,b,h)}
k.sp=function(a){var b=a.touches,c=Object.keys(this.a),d=c.length;if(d>=b.length){var e=[],f,g,h;for(f=0;f<d;++f){g=c[f];h=this.a[g];var l;if(!(l=1==g))a:{l=b.length;for(var m,n=0;n<l;n++)if(m=b[n],m.identifier===g-2){l=!0;break a}l=!1}l||e.push(h.out)}for(f=0;f<e.length;++f)this.Ue(a,e[f])}b=a.changedTouches[0];c=Object.keys(this.a).length;if(0===c||1===c&&(1).toString()in this.a)this.g=b.identifier,void 0!==this.f&&pa.clearTimeout(this.f);Lg(this,a);this.i++;Kg(this,a,this.fo)};
k.fo=function(a,b){this.a[b.pointerId]={target:b.target,out:b,Lh:b.target};var c=this.b;b.bubbles=!0;xg(c,Mg,b,a);c=this.b;b.bubbles=!1;xg(c,Ng,b,a);xg(this.b,zg,b,a)};k.rp=function(a){a.preventDefault();Kg(this,a,this.wl)};k.wl=function(a,b){var c=this.a[b.pointerId];if(c){var d=c.out,e=c.Lh;xg(this.b,Ag,b,a);d&&e!==b.target&&(d.relatedTarget=b.target,b.relatedTarget=e,d.target=e,b.target?(Dg(this.b,d,a),Cg(this.b,b,a)):(b.target=e,b.relatedTarget=null,this.Ue(a,b)));c.out=b;c.Lh=b.target}};
k.qp=function(a){Lg(this,a);Kg(this,a,this.tp)};k.tp=function(a,b){xg(this.b,Bg,b,a);this.b.out(b,a);var c=this.b;b.bubbles=!1;xg(c,Og,b,a);delete this.a[b.pointerId];b.isPrimary&&(this.g=void 0,this.f=pa.setTimeout(this.ci.bind(this),200))};k.pp=function(a){Kg(this,a,this.Ue)};k.Ue=function(a,b){xg(this.b,yg,b,a);this.b.out(b,a);var c=this.b;b.bubbles=!1;xg(c,Og,b,a);delete this.a[b.pointerId];b.isPrimary&&(this.g=void 0,this.f=pa.setTimeout(this.ci.bind(this),200))};
function Lg(a,b){var c=a.l.g,d=b.changedTouches[0];if(a.g===d.identifier){var e=[d.clientX,d.clientY];c.push(e);pa.setTimeout(function(){nb(c,e)},2500)}};function Pg(a){$a.call(this);this.i=a;this.g={};this.c={};this.a=[];mg?Qg(this,new Gg(this)):ng?Qg(this,new Eg(this)):(a=new tg(this),Qg(this,a),lg&&Qg(this,new Ig(this,a)));a=this.a.length;for(var b,c=0;c<a;c++)b=this.a[c],Rg(this,Object.keys(b.c))}y(Pg,$a);function Qg(a,b){var c=Object.keys(b.c);c&&(c.forEach(function(a){var c=b.c[a];c&&(this.c[a]=c.bind(b))},a),a.a.push(b))}Pg.prototype.f=function(a){var b=this.c[a.type];b&&b(a)};
function Rg(a,b){b.forEach(function(a){B(this.i,a,this.f,this)},a)}function Sg(a,b){b.forEach(function(a){Qa(this.i,a,this.f,this)},a)}function wg(a,b){for(var c={},d,e=0,f=Tg.length;e<f;e++)d=Tg[e][0],c[d]=a[d]||b[d]||Tg[e][1];return c}Pg.prototype.out=function(a,b){a.bubbles=!0;xg(this,Ug,a,b)};function Dg(a,b,c){a.out(b,c);var d=b.target,e=b.relatedTarget;d&&e&&d.contains(e)||(b.bubbles=!1,xg(a,Og,b,c))}
function Cg(a,b,c){b.bubbles=!0;xg(a,Mg,b,c);var d=b.target,e=b.relatedTarget;d&&e&&d.contains(e)||(b.bubbles=!1,xg(a,Ng,b,c))}function xg(a,b,c,d){a.b(new Wf(b,d,c))}function Hg(a,b){a.b(new Wf(b.type,b,b))}Pg.prototype.ka=function(){for(var a=this.a.length,b,c=0;c<a;c++)b=this.a[c],Sg(this,Object.keys(b.c));$a.prototype.ka.call(this)};
var Ag="pointermove",zg="pointerdown",Bg="pointerup",Mg="pointerover",Ug="pointerout",Ng="pointerenter",Og="pointerleave",yg="pointercancel",Tg=[["bubbles",!1],["cancelable",!1],["view",null],["detail",null],["screenX",0],["screenY",0],["clientX",0],["clientY",0],["ctrlKey",!1],["altKey",!1],["shiftKey",!1],["metaKey",!1],["button",0],["relatedTarget",null],["buttons",0],["pointerId",0],["width",0],["height",0],["pressure",0],["tiltX",0],["tiltY",0],["pointerType",""],["hwTimestamp",0],["isPrimary",
!1],["type",""],["target",null],["currentTarget",null],["which",0]];function Vg(a,b,c,d,e){We.call(this,a,b,e);this.originalEvent=c;this.pixel=b.Td(c);this.coordinate=b.Ma(this.pixel);this.dragging=void 0!==d?d:!1}y(Vg,We);Vg.prototype.preventDefault=function(){We.prototype.preventDefault.call(this);this.originalEvent.preventDefault()};Vg.prototype.stopPropagation=function(){We.prototype.stopPropagation.call(this);this.originalEvent.stopPropagation()};function Wg(a,b,c,d,e){Vg.call(this,a,b,c.b,d,e);this.b=c}y(Wg,Vg);
function Xg(a){$a.call(this);this.f=a;this.l=0;this.o=!1;this.c=[];this.g=null;a=this.f.a;this.U=0;this.v={};this.i=new Pg(a);this.a=null;this.j=B(this.i,zg,this.$k,this);this.s=B(this.i,Ag,this.No,this)}y(Xg,$a);function Yg(a,b){var c;c=new Wg(Zg,a.f,b);a.b(c);0!==a.l?(pa.clearTimeout(a.l),a.l=0,c=new Wg($g,a.f,b),a.b(c)):a.l=pa.setTimeout(function(){this.l=0;var a=new Wg(ah,this.f,b);this.b(a)}.bind(a),250)}
function bh(a,b){b.type==ch||b.type==dh?delete a.v[b.pointerId]:b.type==eh&&(a.v[b.pointerId]=!0);a.U=Object.keys(a.v).length}k=Xg.prototype;k.Qg=function(a){bh(this,a);var b=new Wg(ch,this.f,a);this.b(b);!this.o&&0===a.button&&Yg(this,this.g);0===this.U&&(this.c.forEach(Ka),this.c.length=0,this.o=!1,this.g=null,Ta(this.a),this.a=null)};
k.$k=function(a){bh(this,a);var b=new Wg(eh,this.f,a);this.b(b);this.g=a;0===this.c.length&&(this.a=new Pg(document),this.c.push(B(this.a,fh,this.Sl,this),B(this.a,ch,this.Qg,this),B(this.i,dh,this.Qg,this)))};k.Sl=function(a){if(a.clientX!=this.g.clientX||a.clientY!=this.g.clientY){this.o=!0;var b=new Wg(gh,this.f,a,this.o);this.b(b)}a.preventDefault()};k.No=function(a){this.b(new Wg(a.type,this.f,a,!(!this.g||a.clientX==this.g.clientX&&a.clientY==this.g.clientY)))};
k.ka=function(){this.s&&(Ka(this.s),this.s=null);this.j&&(Ka(this.j),this.j=null);this.c.forEach(Ka);this.c.length=0;this.a&&(Ta(this.a),this.a=null);this.i&&(Ta(this.i),this.i=null);$a.prototype.ka.call(this)};var ah="singleclick",Zg="click",$g="dblclick",gh="pointerdrag",fh="pointermove",eh="pointerdown",ch="pointerup",dh="pointercancel",hh={Mp:ah,Bp:Zg,Cp:$g,Fp:gh,Ip:fh,Ep:eh,Lp:ch,Kp:"pointerover",Jp:"pointerout",Gp:"pointerenter",Hp:"pointerleave",Dp:dh};function ih(a){eb.call(this);var b=Ea({},a);b.opacity=void 0!==a.opacity?a.opacity:1;b.visible=void 0!==a.visible?a.visible:!0;b.zIndex=void 0!==a.zIndex?a.zIndex:0;b.maxResolution=void 0!==a.maxResolution?a.maxResolution:Infinity;b.minResolution=void 0!==a.minResolution?a.minResolution:0;this.G(b)}y(ih,eb);
function jh(a){var b=a.Pb(),c=a.kf(),d=a.xb(),e=a.H(),f=a.Qb(),g=a.Nb(),h=a.Ob();return{layer:a,opacity:sa(b,0,1),R:c,visible:d,Qc:!0,extent:e,zIndex:f,maxResolution:g,minResolution:Math.max(h,0)}}k=ih.prototype;k.H=function(){return this.get("extent")};k.Nb=function(){return this.get("maxResolution")};k.Ob=function(){return this.get("minResolution")};k.Pb=function(){return this.get("opacity")};k.xb=function(){return this.get("visible")};k.Qb=function(){return this.get("zIndex")};
k.fc=function(a){this.set("extent",a)};k.nc=function(a){this.set("maxResolution",a)};k.oc=function(a){this.set("minResolution",a)};k.gc=function(a){this.set("opacity",a)};k.hc=function(a){this.set("visible",a)};k.ic=function(a){this.set("zIndex",a)};function kh(){};function lh(a,b,c,d,e,f){Wa.call(this,a,b);this.vectorContext=c;this.frameState=d;this.context=e;this.glContext=f}y(lh,Wa);function mh(a){var b=Ea({},a);delete b.source;ih.call(this,b);this.v=this.j=this.o=null;a.map&&this.setMap(a.map);B(this,gb("source"),this.fl,this);this.Fc(a.source?a.source:null)}y(mh,ih);function nh(a,b){return a.visible&&b>=a.minResolution&&b<a.maxResolution}k=mh.prototype;k.hf=function(a){a=a?a:[];a.push(jh(this));return a};k.ha=function(){return this.get("source")||null};k.kf=function(){var a=this.ha();return a?a.V():"undefined"};k.Lm=function(){this.u()};
k.fl=function(){this.v&&(Ka(this.v),this.v=null);var a=this.ha();a&&(this.v=B(a,"change",this.Lm,this));this.u()};k.setMap=function(a){this.o&&(Ka(this.o),this.o=null);a||this.u();this.j&&(Ka(this.j),this.j=null);a&&(this.o=B(a,"precompose",function(a){var c=jh(this);c.Qc=!1;c.zIndex=Infinity;a.frameState.layerStatesArray.push(c);a.frameState.layerStates[w(this)]=c},this),this.j=B(this,"change",a.render,a),this.u())};k.Fc=function(a){this.set("source",a)};function oh(a,b,c,d,e){$a.call(this);this.l=e;this.extent=a;this.f=c;this.resolution=b;this.state=d}y(oh,$a);function ph(a){a.b("change")}oh.prototype.H=function(){return this.extent};oh.prototype.$=function(){return this.resolution};oh.prototype.V=function(){return this.state};function qh(a,b,c,d,e,f,g,h){ad(a);0===b&&0===c||dd(a,b,c);1==d&&1==e||ed(a,d,e);0!==f&&fd(a,f);0===g&&0===h||dd(a,g,h);return a}function rh(a,b){return a[0]==b[0]&&a[1]==b[1]&&a[4]==b[4]&&a[5]==b[5]&&a[12]==b[12]&&a[13]==b[13]}function sh(a,b,c){var d=a[1],e=a[5],f=a[13],g=b[0];b=b[1];c[0]=a[0]*g+a[4]*b+a[12];c[1]=d*g+e*b+f;return c};function th(a){bb.call(this);this.a=a}y(th,bb);k=th.prototype;k.ra=na;k.Cc=function(a,b,c,d){a=a.slice();sh(b.pixelToCoordinateMatrix,a,a);if(this.ra(a,b,qc,this))return c.call(d,this.a)};k.le=rc;k.Qd=function(a,b,c){return function(d,e){return Af(a,b,d,e,function(a){c[d]||(c[d]={});c[d][a.ma.toString()]=a})}};k.Om=function(a){2===a.target.V()&&uh(this)};function vh(a,b){var c=b.V();2!=c&&3!=c&&B(b,"change",a.Om,a);0==c&&(b.load(),c=b.V());return 2==c}
function uh(a){var b=a.a;b.xb()&&"ready"==b.kf()&&a.u()}function wh(a,b){b.Ah()&&a.postRenderFunctions.push(function(a,b,e){b=w(a).toString();a.Lc(e.viewState.projection,e.usedTiles[b])}.bind(null,b))}function xh(a,b){if(b){var c,d,e;d=0;for(e=b.length;d<e;++d)c=b[d],a[w(c).toString()]=c}}function yh(a,b){var c=b.R;void 0!==c&&("string"===typeof c?a.logos[c]="":fa(c)&&(a.logos[c.src]=c.href))}
function zh(a,b,c,d){b=w(b).toString();c=c.toString();b in a?c in a[b]?(a=a[b][c],d.ca<a.ca&&(a.ca=d.ca),d.ea>a.ea&&(a.ea=d.ea),d.fa<a.fa&&(a.fa=d.fa),d.ga>a.ga&&(a.ga=d.ga)):a[b][c]=d:(a[b]={},a[b][c]=d)}function Ah(a,b,c){return[b*(Math.round(a[0]/b)+c[0]%2/2),b*(Math.round(a[1]/b)+c[1]%2/2)]}
function Bh(a,b,c,d,e,f,g,h,l,m){var n=w(b).toString();n in a.wantedTiles||(a.wantedTiles[n]={});var p=a.wantedTiles[n];a=a.tileQueue;var q=c.minZoom,r,u,x,v,D,A;for(A=g;A>=q;--A)for(u=pf(c,f,A,u),x=c.$(A),v=u.ca;v<=u.ea;++v)for(D=u.fa;D<=u.ga;++D)g-A<=h?(r=b.ac(A,v,D,d,e),0==r.V()&&(p[r.ma.toString()]=!0,r.ib()in a.g||a.f([r,n,uf(c,r.ma),x])),void 0!==l&&l.call(m,r)):b.Yf(A,v,D,e)};function Ch(a){this.v=a.opacity;this.U=a.rotateWithView;this.j=a.rotation;this.i=a.scale;this.C=a.snapToPixel}k=Ch.prototype;k.qe=function(){return this.v};k.Xd=function(){return this.U};k.re=function(){return this.j};k.se=function(){return this.i};k.Yd=function(){return this.C};k.te=function(a){this.v=a};k.ue=function(a){this.j=a};k.ve=function(a){this.i=a};function Dh(a){a=a||{};this.c=void 0!==a.anchor?a.anchor:[.5,.5];this.f=null;this.a=void 0!==a.anchorOrigin?a.anchorOrigin:"top-left";this.o=void 0!==a.anchorXUnits?a.anchorXUnits:"fraction";this.s=void 0!==a.anchorYUnits?a.anchorYUnits:"fraction";var b=void 0!==a.crossOrigin?a.crossOrigin:null,c=void 0!==a.img?a.img:null,d=void 0!==a.imgSize?a.imgSize:null,e=a.src;void 0!==e&&0!==e.length||!c||(e=c.src||w(c).toString());var f=void 0!==a.src?0:2,g=void 0!==a.color?te(a.color):null,h=Eh.Zb(),l=h.get(e,
b,g);l||(l=new Fh(c,e,d,b,f,g),h.set(e,b,g,l));this.b=l;this.D=void 0!==a.offset?a.offset:[0,0];this.g=void 0!==a.offsetOrigin?a.offsetOrigin:"top-left";this.l=null;this.A=void 0!==a.size?a.size:null;Ch.call(this,{opacity:void 0!==a.opacity?a.opacity:1,rotation:void 0!==a.rotation?a.rotation:0,scale:void 0!==a.scale?a.scale:1,snapToPixel:void 0!==a.snapToPixel?a.snapToPixel:!0,rotateWithView:void 0!==a.rotateWithView?a.rotateWithView:!1})}y(Dh,Ch);k=Dh.prototype;
k.Yb=function(){if(this.f)return this.f;var a=this.c,b=this.Fb();if("fraction"==this.o||"fraction"==this.s){if(!b)return null;a=this.c.slice();"fraction"==this.o&&(a[0]*=b[0]);"fraction"==this.s&&(a[1]*=b[1])}if("top-left"!=this.a){if(!b)return null;a===this.c&&(a=this.c.slice());if("top-right"==this.a||"bottom-right"==this.a)a[0]=-a[0]+b[0];if("bottom-left"==this.a||"bottom-right"==this.a)a[1]=-a[1]+b[1]}return this.f=a};k.jc=function(){var a=this.b;return a.c?a.c:a.a};k.ld=function(){return this.b.g};
k.td=function(){return this.b.f};k.pe=function(){var a=this.b;if(!a.o)if(a.s){var b=a.g[0],c=a.g[1],d=Oe(b,c);d.fillRect(0,0,b,c);a.o=d.canvas}else a.o=a.a;return a.o};k.Ia=function(){if(this.l)return this.l;var a=this.D;if("top-left"!=this.g){var b=this.Fb(),c=this.b.g;if(!b||!c)return null;a=a.slice();if("top-right"==this.g||"bottom-right"==this.g)a[0]=c[0]-b[0]-a[0];if("bottom-left"==this.g||"bottom-right"==this.g)a[1]=c[1]-b[1]-a[1]}return this.l=a};k.En=function(){return this.b.j};
k.Fb=function(){return this.A?this.A:this.b.g};k.pf=function(a,b){return B(this.b,"change",a,b)};k.load=function(){this.b.load()};k.Xf=function(a,b){Qa(this.b,"change",a,b)};function Fh(a,b,c,d,e,f){$a.call(this);this.o=null;this.a=a?a:new Image;null!==d&&(this.a.crossOrigin=d);this.c=f?document.createElement("CANVAS"):null;this.l=f;this.i=null;this.f=e;this.g=c;this.j=b;this.s=!1;2==this.f&&Gh(this)}y(Fh,$a);
function Gh(a){var b=Oe(1,1);try{b.drawImage(a.a,0,0),b.getImageData(0,0,1,1)}catch(c){a.s=!0}}Fh.prototype.v=function(){this.f=3;this.i.forEach(Ka);this.i=null;this.b("change")};
Fh.prototype.U=function(){this.f=2;this.g&&(this.a.width=this.g[0],this.a.height=this.g[1]);this.g=[this.a.width,this.a.height];this.i.forEach(Ka);this.i=null;Gh(this);if(!this.s&&null!==this.l){this.c.width=this.a.width;this.c.height=this.a.height;var a=this.c.getContext("2d");a.drawImage(this.a,0,0);for(var b=a.getImageData(0,0,this.a.width,this.a.height),c=b.data,d=this.l[0]/255,e=this.l[1]/255,f=this.l[2]/255,g=0,h=c.length;g<h;g+=4)c[g]*=d,c[g+1]*=e,c[g+2]*=f;a.putImageData(b,0,0)}this.b("change")};
Fh.prototype.load=function(){if(0==this.f){this.f=1;this.i=[Pa(this.a,"error",this.v,this),Pa(this.a,"load",this.U,this)];try{this.a.src=this.j}catch(a){this.v()}}};function Eh(){this.b={};this.a=0}ba(Eh);Eh.prototype.clear=function(){this.b={};this.a=0};Eh.prototype.get=function(a,b,c){a=b+":"+a+":"+(c?ve(c):"null");return a in this.b?this.b[a]:null};Eh.prototype.set=function(a,b,c,d){this.b[b+":"+a+":"+(c?ve(c):"null")]=d;++this.a};function Hh(a,b){this.i=b;this.g={};this.s={}}y(Hh,Sa);function Ih(a){var b=a.viewState,c=a.coordinateToPixelMatrix;qh(c,a.size[0]/2,a.size[1]/2,1/b.resolution,-1/b.resolution,-b.rotation,-b.center[0],-b.center[1]);cd(c,a.pixelToCoordinateMatrix)}k=Hh.prototype;k.ka=function(){for(var a in this.g)Ta(this.g[a])};function Jh(){var a=Eh.Zb();if(32<a.a){var b=0,c,d;for(c in a.b)d=a.b[c],0!==(b++&3)||ab(d)||(delete a.b[c],--a.a)}}
k.ra=function(a,b,c,d,e,f){function g(a,e){var f=w(a).toString(),g=b.layerStates[w(e)].Qc;if(!(f in b.skippedFeatureUids)||g)return c.call(d,a,g?e:null)}var h,l=b.viewState,m=l.resolution,n=l.projection,l=a;if(n.a){var n=n.H(),p=ic(n),q=a[0];if(q<n[0]||q>n[2])l=[q+p*Math.ceil((n[0]-q)/p),a[1]]}n=b.layerStatesArray;for(p=n.length-1;0<=p;--p){var r=n[p],q=r.layer;if(nh(r,m)&&e.call(f,q)&&(r=Kh(this,q),q.ha()&&(h=r.ra(q.ha().D?l:a,b,g,d)),h))return h}};
k.rh=function(a,b,c,d,e,f){var g,h=b.viewState.resolution,l=b.layerStatesArray,m;for(m=l.length-1;0<=m;--m){g=l[m];var n=g.layer;if(nh(g,h)&&e.call(f,n)&&(g=Kh(this,n).Cc(a,b,c,d)))return g}};k.sh=function(a,b,c,d){return void 0!==this.ra(a,b,qc,this,c,d)};function Kh(a,b){var c=w(b).toString();if(c in a.g)return a.g[c];var d=a.Xe(b);a.g[c]=d;a.s[c]=B(d,"change",a.Rk,a);return d}k.Rk=function(){this.i.render()};k.Ce=na;
k.To=function(a,b){for(var c in this.g)if(!(b&&c in b.layerStates)){var d=c,e=this.g[d];delete this.g[d];Ka(this.s[d]);delete this.s[d];Ta(e)}};function Lh(a,b){for(var c in a.g)if(!(c in b.layerStates)){b.postRenderFunctions.push(a.To.bind(a));break}}function rb(a,b){return a.zIndex-b.zIndex};function Mh(a,b){this.j=a;this.l=b;this.b=[];this.a=[];this.g={}}Mh.prototype.clear=function(){this.b.length=0;this.a.length=0;Fa(this.g)};function Nh(a){var b=a.b,c=a.a,d=b[0];1==b.length?(b.length=0,c.length=0):(b[0]=b.pop(),c[0]=c.pop(),Oh(a,0));b=a.l(d);delete a.g[b];return d}Mh.prototype.f=function(a){var b=this.j(a);return Infinity!=b?(this.b.push(a),this.a.push(b),this.g[this.l(a)]=!0,Ph(this,0,this.b.length-1),!0):!1};Mh.prototype.wc=function(){return this.b.length};
Mh.prototype.Ya=function(){return 0===this.b.length};function Oh(a,b){for(var c=a.b,d=a.a,e=c.length,f=c[b],g=d[b],h=b;b<e>>1;){var l=2*b+1,m=2*b+2,l=m<e&&d[m]<d[l]?m:l;c[b]=c[l];d[b]=d[l];b=l}c[b]=f;d[b]=g;Ph(a,h,b)}function Ph(a,b,c){var d=a.b;a=a.a;for(var e=d[c],f=a[c];c>b;){var g=c-1>>1;if(a[g]>f)d[c]=d[g],a[c]=a[g],c=g;else break}d[c]=e;a[c]=f}
function Qh(a){var b=a.j,c=a.b,d=a.a,e=0,f=c.length,g,h,l;for(h=0;h<f;++h)g=c[h],l=b(g),Infinity==l?delete a.g[a.l(g)]:(d[e]=l,c[e++]=g);c.length=e;d.length=e;for(b=(a.b.length>>1)-1;0<=b;b--)Oh(a,b)};function Rh(a,b){Mh.call(this,function(b){return a.apply(null,b)},function(a){return a[0].ib()});this.s=b;this.i=0;this.c={}}y(Rh,Mh);Rh.prototype.f=function(a){var b=Mh.prototype.f.call(this,a);b&&B(a[0],"change",this.o,this);return b};Rh.prototype.o=function(a){a=a.target;var b=a.V();if(2===b||3===b||4===b||5===b)Qa(a,"change",this.o,this),a=a.ib(),a in this.c&&(delete this.c[a],--this.i),this.s()};
function Sh(a,b,c){for(var d=0,e,f;a.i<b&&d<c&&0<a.wc();)e=Nh(a)[0],f=e.ib(),0!==e.V()||f in a.c||(a.c[f]=!0,++a.i,++d,e.load())};function Th(a,b,c){this.f=a;this.g=b;this.i=c;this.b=[];this.a=this.c=0}function Uh(a,b){var c=a.f,d=a.a,e=a.g-d,f=Math.log(a.g/a.a)/a.f;return ce({source:b,duration:f,easing:function(a){return d*(Math.exp(c*a*f)-1)/e}})};function Vh(a){eb.call(this);this.v=null;this.i(!0);this.handleEvent=a.handleEvent}y(Vh,eb);Vh.prototype.f=function(){return this.get("active")};Vh.prototype.l=function(){return this.v};Vh.prototype.i=function(a){this.set("active",a)};Vh.prototype.setMap=function(a){this.v=a};function Wh(a,b,c,d,e){if(void 0!==c){var f=b.La(),g=b.ab();void 0!==f&&g&&e&&0<e&&(a.Wa(de({rotation:f,duration:e,easing:Zd})),d&&a.Wa(ce({source:g,duration:e,easing:Zd})));b.rotate(c,d)}}
function Xh(a,b,c,d,e){var f=b.$();c=b.constrainResolution(f,c,0);Yh(a,b,c,d,e)}function Yh(a,b,c,d,e){if(c){var f=b.$(),g=b.ab();void 0!==f&&g&&c!==f&&e&&0<e&&(a.Wa(ee({resolution:f,duration:e,easing:Zd})),d&&a.Wa(ce({source:g,duration:e,easing:Zd})));if(d){var h;a=b.ab();e=b.$();void 0!==a&&void 0!==e&&(h=[d[0]-c*(d[0]-a[0])/e,d[1]-c*(d[1]-a[1])/e]);b.mb(h)}b.Ub(c)}};function Zh(a){a=a?a:{};this.a=a.delta?a.delta:1;Vh.call(this,{handleEvent:$h});this.c=void 0!==a.duration?a.duration:250}y(Zh,Vh);function $h(a){var b=!1,c=a.originalEvent;if(a.type==$g){var b=a.map,d=a.coordinate,c=c.shiftKey?-this.a:this.a,e=b.aa();Xh(b,e,c,d,this.c);a.preventDefault();b=!0}return!b};function ai(a){a=a.originalEvent;return a.altKey&&!(a.metaKey||a.ctrlKey)&&a.shiftKey}function bi(a){a=a.originalEvent;return 0==a.button&&!(He&&fg&&a.ctrlKey)}function ci(a){return"pointermove"==a.type}function di(a){return a.type==ah}function ei(a){a=a.originalEvent;return!a.altKey&&!(a.metaKey||a.ctrlKey)&&!a.shiftKey}function fi(a){a=a.originalEvent;return!a.altKey&&!(a.metaKey||a.ctrlKey)&&a.shiftKey}
function gi(a){a=a.originalEvent.target.tagName;return"INPUT"!==a&&"SELECT"!==a&&"TEXTAREA"!==a}function hi(a){return"mouse"==a.b.pointerType}function ii(a){a=a.b;return a.isPrimary&&0===a.button};function ji(a){a=a?a:{};Vh.call(this,{handleEvent:a.handleEvent?a.handleEvent:ki});this.Oe=a.handleDownEvent?a.handleDownEvent:rc;this.Pe=a.handleDragEvent?a.handleDragEvent:na;this.Mi=a.handleMoveEvent?a.handleMoveEvent:na;this.tj=a.handleUpEvent?a.handleUpEvent:rc;this.C=!1;this.ia={};this.o=[]}y(ji,Vh);function li(a){for(var b=a.length,c=0,d=0,e=0;e<b;e++)c+=a[e].clientX,d+=a[e].clientY;return[c/b,d/b]}
function ki(a){if(!(a instanceof Wg))return!0;var b=!1,c=a.type;if(c===eh||c===gh||c===ch)c=a.b,a.type==ch?delete this.ia[c.pointerId]:a.type==eh?this.ia[c.pointerId]=c:c.pointerId in this.ia&&(this.ia[c.pointerId]=c),this.o=Ga(this.ia);this.C&&(a.type==gh?this.Pe(a):a.type==ch&&(this.C=this.tj(a)));a.type==eh?(this.C=a=this.Oe(a),b=this.Gc(a)):a.type==fh&&this.Mi(a);return!b}ji.prototype.Gc=function(a){return a};function mi(a){ji.call(this,{handleDownEvent:ni,handleDragEvent:oi,handleUpEvent:pi});a=a?a:{};this.a=a.kinetic;this.c=this.j=null;this.A=a.condition?a.condition:ei;this.s=!1}y(mi,ji);function oi(a){var b=li(this.o);this.a&&this.a.b.push(b[0],b[1],Date.now());if(this.c){var c=this.c[0]-b[0],d=b[1]-this.c[1];a=a.map;var e=a.aa(),f=e.V(),d=c=[c,d],g=f.resolution;d[0]*=g;d[1]*=g;Gb(c,f.rotation);Bb(c,f.center);c=e.Pd(c);a.render();e.mb(c)}this.c=b}
function pi(a){a=a.map;var b=a.aa();if(0===this.o.length){var c;if(c=!this.s&&this.a)if(c=this.a,6>c.b.length)c=!1;else{var d=Date.now()-c.i,e=c.b.length-3;if(c.b[e+2]<d)c=!1;else{for(var f=e-3;0<f&&c.b[f+2]>d;)f-=3;var d=c.b[e+2]-c.b[f+2],g=c.b[e]-c.b[f],e=c.b[e+1]-c.b[f+1];c.c=Math.atan2(e,g);c.a=Math.sqrt(g*g+e*e)/d;c=c.a>c.g}}c&&(c=this.a,c=(c.g-c.a)/c.f,e=this.a.c,f=b.ab(),this.j=Uh(this.a,f),a.Wa(this.j),f=a.Ga(f),c=a.Ma([f[0]-c*Math.cos(e),f[1]-c*Math.sin(e)]),c=b.Pd(c),b.mb(c));Xd(b,-1);a.render();
return!1}this.c=null;return!0}function ni(a){if(0<this.o.length&&this.A(a)){var b=a.map,c=b.aa();this.c=null;this.C||Xd(c,1);b.render();this.j&&nb(b.R,this.j)&&(c.mb(a.frameState.viewState.center),this.j=null);this.a&&(a=this.a,a.b.length=0,a.c=0,a.a=0);this.s=1<this.o.length;return!0}return!1}mi.prototype.Gc=rc;function qi(a){a=a?a:{};ji.call(this,{handleDownEvent:ri,handleDragEvent:si,handleUpEvent:ti});this.c=a.condition?a.condition:ai;this.a=void 0;this.j=void 0!==a.duration?a.duration:250}y(qi,ji);function si(a){if(hi(a)){var b=a.map,c=b.Za();a=a.pixel;c=Math.atan2(c[1]/2-a[1],a[0]-c[0]/2);if(void 0!==this.a){a=c-this.a;var d=b.aa(),e=d.La();b.render();Wh(b,d,e-a)}this.a=c}}
function ti(a){if(!hi(a))return!0;a=a.map;var b=a.aa();Xd(b,-1);var c=b.La(),d=this.j,c=b.constrainRotation(c,0);Wh(a,b,c,void 0,d);return!1}function ri(a){return hi(a)&&bi(a)&&this.c(a)?(a=a.map,Xd(a.aa(),1),a.render(),this.a=void 0,!0):!1}qi.prototype.Gc=rc;function ui(a){this.f=null;this.a=document.createElement("div");this.a.style.position="absolute";this.a.className="ol-box "+a;this.g=this.c=this.b=null}y(ui,Sa);ui.prototype.ka=function(){this.setMap(null)};function vi(a){var b=a.c,c=a.g;a=a.a.style;a.left=Math.min(b[0],c[0])+"px";a.top=Math.min(b[1],c[1])+"px";a.width=Math.abs(c[0]-b[0])+"px";a.height=Math.abs(c[1]-b[1])+"px"}
ui.prototype.setMap=function(a){if(this.b){this.b.A.removeChild(this.a);var b=this.a.style;b.left=b.top=b.width=b.height="inherit"}(this.b=a)&&this.b.A.appendChild(this.a)};function wi(a){var b=a.c,c=a.g,b=[b,[b[0],c[1]],c,[c[0],b[1]]].map(a.b.Ma,a.b);b[4]=b[0].slice();a.f?a.f.pa([b]):a.f=new E([b])}ui.prototype.W=function(){return this.f};function xi(a,b,c){Wa.call(this,a);this.coordinate=b;this.mapBrowserEvent=c}y(xi,Wa);function yi(a){ji.call(this,{handleDownEvent:zi,handleDragEvent:Ai,handleUpEvent:Bi});a=a?a:{};this.a=new ui(a.className||"ol-dragbox");this.c=null;this.D=a.condition?a.condition:qc;this.A=a.boxEndCondition?a.boxEndCondition:Ci}y(yi,ji);function Ci(a,b,c){a=c[0]-b[0];b=c[1]-b[1];return 64<=a*a+b*b}
function Ai(a){if(hi(a)){var b=this.a,c=a.pixel;b.c=this.c;b.g=c;wi(b);vi(b);this.b(new xi("boxdrag",a.coordinate,a))}}yi.prototype.W=function(){return this.a.W()};yi.prototype.s=na;function Bi(a){if(!hi(a))return!0;this.a.setMap(null);this.A(a,this.c,a.pixel)&&(this.s(a),this.b(new xi("boxend",a.coordinate,a)));return!1}
function zi(a){if(hi(a)&&bi(a)&&this.D(a)){this.c=a.pixel;this.a.setMap(a.map);var b=this.a,c=this.c;b.c=this.c;b.g=c;wi(b);vi(b);this.b(new xi("boxstart",a.coordinate,a));return!0}return!1};function Di(a){a=a?a:{};var b=a.condition?a.condition:fi;this.j=void 0!==a.duration?a.duration:200;this.R=void 0!==a.out?a.out:!1;yi.call(this,{condition:b,className:a.className||"ol-dragzoom"})}y(Di,yi);
Di.prototype.s=function(){var a=this.v,b=a.aa(),c=a.Za(),d=this.W().H();if(this.R){var e=b.Kc(c),d=[a.Ga(cc(d)),a.Ga(ec(d))],f=Wb(Infinity,Infinity,-Infinity,-Infinity,void 0),g,h;g=0;for(h=d.length;g<h;++g)Mb(f,d[g]);oc(e,1/Td(f,c));d=e}c=b.constrainResolution(Td(d,c));e=b.$();f=b.ab();a.Wa(ee({resolution:e,duration:this.j,easing:Zd}));a.Wa(ce({source:f,duration:this.j,easing:Zd}));b.mb(kc(d));b.Ub(c)};function Ei(a){Vh.call(this,{handleEvent:Fi});a=a||{};this.a=function(a){return ei(a)&&gi(a)};this.c=void 0!==a.condition?a.condition:this.a;this.o=void 0!==a.duration?a.duration:100;this.j=void 0!==a.pixelDelta?a.pixelDelta:128}y(Ei,Vh);
function Fi(a){var b=!1;if("keydown"==a.type){var c=a.originalEvent.keyCode;if(this.c(a)&&(40==c||37==c||39==c||38==c)){var d=a.map,b=d.aa(),e=b.$()*this.j,f=0,g=0;40==c?g=-e:37==c?f=-e:39==c?f=e:g=e;c=[f,g];Gb(c,b.La());e=this.o;if(f=b.ab())e&&0<e&&d.Wa(ce({source:f,duration:e,easing:ae})),d=b.Pd([f[0]+c[0],f[1]+c[1]]),b.mb(d);a.preventDefault();b=!0}}return!b};function Gi(a){Vh.call(this,{handleEvent:Hi});a=a?a:{};this.c=a.condition?a.condition:gi;this.a=a.delta?a.delta:1;this.o=void 0!==a.duration?a.duration:100}y(Gi,Vh);function Hi(a){var b=!1;if("keydown"==a.type||"keypress"==a.type){var c=a.originalEvent.charCode;if(this.c(a)&&(43==c||45==c)){b=a.map;c=43==c?this.a:-this.a;b.render();var d=b.aa();Xh(b,d,c,void 0,this.o);a.preventDefault();b=!0}}return!b};function Ii(a){Vh.call(this,{handleEvent:Ji});a=a||{};this.c=0;this.C=void 0!==a.duration?a.duration:250;this.s=void 0!==a.useAnchor?a.useAnchor:!0;this.a=null;this.j=this.o=void 0}y(Ii,Vh);
function Ji(a){var b=!1;if("wheel"==a.type||"mousewheel"==a.type){var b=a.map,c=a.originalEvent;this.s&&(this.a=a.coordinate);var d;"wheel"==a.type?(d=c.deltaY,dg&&c.deltaMode===pa.WheelEvent.DOM_DELTA_PIXEL&&(d/=gg),c.deltaMode===pa.WheelEvent.DOM_DELTA_LINE&&(d*=40)):"mousewheel"==a.type&&(d=-c.wheelDeltaY,eg&&(d/=3));this.c+=d;void 0===this.o&&(this.o=Date.now());d=Math.max(80-(Date.now()-this.o),0);pa.clearTimeout(this.j);this.j=pa.setTimeout(this.A.bind(this,b),d);a.preventDefault();b=!0}return!b}
Ii.prototype.A=function(a){var b=sa(this.c,-1,1),c=a.aa();a.render();Xh(a,c,-b,this.a,this.C);this.c=0;this.a=null;this.j=this.o=void 0};Ii.prototype.D=function(a){this.s=a;a||(this.a=null)};function Ki(a){ji.call(this,{handleDownEvent:Li,handleDragEvent:Mi,handleUpEvent:Ni});a=a||{};this.c=null;this.j=void 0;this.a=!1;this.s=0;this.D=void 0!==a.threshold?a.threshold:.3;this.A=void 0!==a.duration?a.duration:250}y(Ki,ji);
function Mi(a){var b=0,c=this.o[0],d=this.o[1],c=Math.atan2(d.clientY-c.clientY,d.clientX-c.clientX);void 0!==this.j&&(b=c-this.j,this.s+=b,!this.a&&Math.abs(this.s)>this.D&&(this.a=!0));this.j=c;a=a.map;c=a.a.getBoundingClientRect();d=li(this.o);d[0]-=c.left;d[1]-=c.top;this.c=a.Ma(d);this.a&&(c=a.aa(),d=c.La(),a.render(),Wh(a,c,d+b,this.c))}
function Ni(a){if(2>this.o.length){a=a.map;var b=a.aa();Xd(b,-1);if(this.a){var c=b.La(),d=this.c,e=this.A,c=b.constrainRotation(c,0);Wh(a,b,c,d,e)}return!1}return!0}function Li(a){return 2<=this.o.length?(a=a.map,this.c=null,this.j=void 0,this.a=!1,this.s=0,this.C||Xd(a.aa(),1),a.render(),!0):!1}Ki.prototype.Gc=rc;function Oi(a){ji.call(this,{handleDownEvent:Pi,handleDragEvent:Qi,handleUpEvent:Ri});a=a?a:{};this.c=null;this.s=void 0!==a.duration?a.duration:400;this.a=void 0;this.j=1}y(Oi,ji);function Qi(a){var b=1,c=this.o[0],d=this.o[1],e=c.clientX-d.clientX,c=c.clientY-d.clientY,e=Math.sqrt(e*e+c*c);void 0!==this.a&&(b=this.a/e);this.a=e;1!=b&&(this.j=b);a=a.map;var e=a.aa(),c=e.$(),d=a.a.getBoundingClientRect(),f=li(this.o);f[0]-=d.left;f[1]-=d.top;this.c=a.Ma(f);a.render();Yh(a,e,c*b,this.c)}
function Ri(a){if(2>this.o.length){a=a.map;var b=a.aa();Xd(b,-1);var c=b.$(),d=this.c,e=this.s,c=b.constrainResolution(c,0,this.j-1);Yh(a,b,c,d,e);return!1}return!0}function Pi(a){return 2<=this.o.length?(a=a.map,this.c=null,this.a=void 0,this.j=1,this.C||Xd(a.aa(),1),a.render(),!0):!1}Oi.prototype.Gc=rc;function Si(a){a=a?a:{};var b=new le,c=new Th(-.005,.05,100);(void 0!==a.altShiftDragRotate?a.altShiftDragRotate:1)&&b.push(new qi);(void 0!==a.doubleClickZoom?a.doubleClickZoom:1)&&b.push(new Zh({delta:a.zoomDelta,duration:a.zoomDuration}));(void 0!==a.dragPan?a.dragPan:1)&&b.push(new mi({kinetic:c}));(void 0!==a.pinchRotate?a.pinchRotate:1)&&b.push(new Ki);(void 0!==a.pinchZoom?a.pinchZoom:1)&&b.push(new Oi({duration:a.zoomDuration}));if(void 0!==a.keyboard?a.keyboard:1)b.push(new Ei),b.push(new Gi({delta:a.zoomDelta,
duration:a.zoomDuration}));(void 0!==a.mouseWheelZoom?a.mouseWheelZoom:1)&&b.push(new Ii({duration:a.zoomDuration}));(void 0!==a.shiftDragZoom?a.shiftDragZoom:1)&&b.push(new Di({duration:a.zoomDuration}));return b};function Ti(a){var b=a||{};a=Ea({},b);delete a.layers;b=b.layers;ih.call(this,a);this.f=[];this.a={};B(this,gb("layers"),this.Tk,this);b?Array.isArray(b)&&(b=new le(b.slice())):b=new le;this.oh(b)}y(Ti,ih);k=Ti.prototype;k.ce=function(){this.xb()&&this.u()};
k.Tk=function(){this.f.forEach(Ka);this.f.length=0;var a=this.Tc();this.f.push(B(a,"add",this.Sk,this),B(a,"remove",this.Uk,this));for(var b in this.a)this.a[b].forEach(Ka);Fa(this.a);var a=a.a,c,d;b=0;for(c=a.length;b<c;b++)d=a[b],this.a[w(d).toString()]=[B(d,"propertychange",this.ce,this),B(d,"change",this.ce,this)];this.u()};k.Sk=function(a){a=a.element;var b=w(a).toString();this.a[b]=[B(a,"propertychange",this.ce,this),B(a,"change",this.ce,this)];this.u()};
k.Uk=function(a){a=w(a.element).toString();this.a[a].forEach(Ka);delete this.a[a];this.u()};k.Tc=function(){return this.get("layers")};k.oh=function(a){this.set("layers",a)};
k.hf=function(a){var b=void 0!==a?a:[],c=b.length;this.Tc().forEach(function(a){a.hf(b)});a=jh(this);var d,e;for(d=b.length;c<d;c++)e=b[c],e.opacity*=a.opacity,e.visible=e.visible&&a.visible,e.maxResolution=Math.min(e.maxResolution,a.maxResolution),e.minResolution=Math.max(e.minResolution,a.minResolution),void 0!==a.extent&&(e.extent=void 0!==e.extent?mc(e.extent,a.extent):a.extent);return b};k.kf=function(){return"ready"};function Ui(a){vc.call(this,{code:a,units:"m",extent:Vi,global:!0,worldExtent:Wi})}y(Ui,vc);Ui.prototype.getPointResolution=function(a,b){return a/ta(b[1]/6378137)};var Xi=6378137*Math.PI,Vi=[-Xi,-Xi,Xi,Xi],Wi=[-180,-85,180,85],Hc="EPSG:3857 EPSG:102100 EPSG:102113 EPSG:900913 urn:ogc:def:crs:EPSG:6.18:3:3857 urn:ogc:def:crs:EPSG::3857 http://www.opengis.net/gml/srs/epsg.xml#3857".split(" ").map(function(a){return new Ui(a)});
function Ic(a,b,c){var d=a.length;c=1<c?c:2;void 0===b&&(2<c?b=a.slice():b=Array(d));for(var e=0;e<d;e+=c)b[e]=6378137*Math.PI*a[e]/180,b[e+1]=6378137*Math.log(Math.tan(Math.PI*(a[e+1]+90)/360));return b}function Jc(a,b,c){var d=a.length;c=1<c?c:2;void 0===b&&(2<c?b=a.slice():b=Array(d));for(var e=0;e<d;e+=c)b[e]=180*a[e]/(6378137*Math.PI),b[e+1]=360*Math.atan(Math.exp(a[e+1]/6378137))/Math.PI-90;return b};var Yi=new sc(6378137);function Zi(a,b){vc.call(this,{code:a,units:"degrees",extent:$i,axisOrientation:b,global:!0,metersPerUnit:aj,worldExtent:$i})}y(Zi,vc);Zi.prototype.getPointResolution=function(a){return a};
var $i=[-180,-90,180,90],aj=Math.PI*Yi.radius/180,Kc=[new Zi("CRS:84"),new Zi("EPSG:4326","neu"),new Zi("urn:ogc:def:crs:EPSG::4326","neu"),new Zi("urn:ogc:def:crs:EPSG:6.6:4326","neu"),new Zi("urn:ogc:def:crs:OGC:1.3:CRS84"),new Zi("urn:ogc:def:crs:OGC:2:84"),new Zi("http://www.opengis.net/gml/srs/epsg.xml#4326","neu"),new Zi("urn:x-ogc:def:crs:EPSG:4326","neu")];function bj(){zc(Hc);zc(Kc);Gc()};function cj(a){mh.call(this,a?a:{})}y(cj,mh);function dj(a){a=a?a:{};var b=Ea({},a);delete b.preload;delete b.useInterimTilesOnError;mh.call(this,b);this.l(void 0!==a.preload?a.preload:0);this.A(void 0!==a.useInterimTilesOnError?a.useInterimTilesOnError:!0)}y(dj,mh);dj.prototype.f=function(){return this.get("preload")};dj.prototype.l=function(a){this.set("preload",a)};dj.prototype.c=function(){return this.get("useInterimTilesOnError")};dj.prototype.A=function(a){this.set("useInterimTilesOnError",a)};var ej=[0,0,0,1],fj=[],gj=[0,0,0,1];function hj(a,b,c,d){0!==b&&(a.translate(c,d),a.rotate(b),a.translate(-c,-d))};function ij(a){a=a||{};this.b=void 0!==a.color?a.color:null;this.a=void 0}ij.prototype.g=function(){return this.b};ij.prototype.f=function(a){this.b=a;this.a=void 0};function jj(a){void 0===a.a&&(a.a=a.b instanceof CanvasPattern||a.b instanceof CanvasGradient?w(a.b).toString():"f"+(a.b?ve(a.b):"-"));return a.a};function kj(){this.a=-1};function lj(){this.a=64;this.b=Array(4);this.c=Array(this.a);this.b[0]=1732584193;this.b[1]=4023233417;this.b[2]=2562383102;this.b[3]=271733878;this.f=this.g=0}(function(){function a(){}a.prototype=kj.prototype;lj.a=kj.prototype;lj.prototype=new a;lj.prototype.constructor=lj;lj.b=function(a,c,d){for(var e=Array(arguments.length-2),f=2;f<arguments.length;f++)e[f-2]=arguments[f];return kj.prototype[c].apply(a,e)}})();
function mj(a,b,c){c||(c=0);var d=Array(16);if(da(b))for(var e=0;16>e;++e)d[e]=b.charCodeAt(c++)|b.charCodeAt(c++)<<8|b.charCodeAt(c++)<<16|b.charCodeAt(c++)<<24;else for(e=0;16>e;++e)d[e]=b[c++]|b[c++]<<8|b[c++]<<16|b[c++]<<24;b=a.b[0];c=a.b[1];var e=a.b[2],f=a.b[3],g;g=b+(f^c&(e^f))+d[0]+3614090360&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[1]+3905402710&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&(b^c))+d[2]+606105819&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+
d[3]+3250441966&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(f^c&(e^f))+d[4]+4118548399&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[5]+1200080426&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&(b^c))+d[6]+2821735955&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+d[7]+4249261313&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(f^c&(e^f))+d[8]+1770035416&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[9]+2336552879&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&
(b^c))+d[10]+4294925233&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+d[11]+2304563134&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(f^c&(e^f))+d[12]+1804603682&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[13]+4254626195&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&(b^c))+d[14]+2792965006&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+d[15]+1236535329&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(e^f&(c^e))+d[1]+4129170786&4294967295;b=c+(g<<5&4294967295|g>>>
27);g=f+(c^e&(b^c))+d[6]+3225465664&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[11]+643717713&4294967295;e=f+(g<<14&4294967295|g>>>18);g=c+(f^b&(e^f))+d[0]+3921069994&4294967295;c=e+(g<<20&4294967295|g>>>12);g=b+(e^f&(c^e))+d[5]+3593408605&4294967295;b=c+(g<<5&4294967295|g>>>27);g=f+(c^e&(b^c))+d[10]+38016083&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[15]+3634488961&4294967295;e=f+(g<<14&4294967295|g>>>18);g=c+(f^b&(e^f))+d[4]+3889429448&4294967295;c=e+(g<<20&4294967295|
g>>>12);g=b+(e^f&(c^e))+d[9]+568446438&4294967295;b=c+(g<<5&4294967295|g>>>27);g=f+(c^e&(b^c))+d[14]+3275163606&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[3]+4107603335&4294967295;e=f+(g<<14&4294967295|g>>>18);g=c+(f^b&(e^f))+d[8]+1163531501&4294967295;c=e+(g<<20&4294967295|g>>>12);g=b+(e^f&(c^e))+d[13]+2850285829&4294967295;b=c+(g<<5&4294967295|g>>>27);g=f+(c^e&(b^c))+d[2]+4243563512&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[7]+1735328473&4294967295;e=f+(g<<14&4294967295|
g>>>18);g=c+(f^b&(e^f))+d[12]+2368359562&4294967295;c=e+(g<<20&4294967295|g>>>12);g=b+(c^e^f)+d[5]+4294588738&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[8]+2272392833&4294967295;f=b+(g<<11&4294967295|g>>>21);g=e+(f^b^c)+d[11]+1839030562&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[14]+4259657740&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(c^e^f)+d[1]+2763975236&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[4]+1272893353&4294967295;f=b+(g<<11&4294967295|g>>>21);g=e+(f^
b^c)+d[7]+4139469664&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[10]+3200236656&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(c^e^f)+d[13]+681279174&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[0]+3936430074&4294967295;f=b+(g<<11&4294967295|g>>>21);g=e+(f^b^c)+d[3]+3572445317&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[6]+76029189&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(c^e^f)+d[9]+3654602809&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[12]+3873151461&4294967295;
f=b+(g<<11&4294967295|g>>>21);g=e+(f^b^c)+d[15]+530742520&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[2]+3299628645&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(e^(c|~f))+d[0]+4096336452&4294967295;b=c+(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[7]+1126891415&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[14]+2878612391&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[5]+4237533241&4294967295;c=e+(g<<21&4294967295|g>>>11);g=b+(e^(c|~f))+d[12]+1700485571&4294967295;b=c+
(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[3]+2399980690&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[10]+4293915773&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[1]+2240044497&4294967295;c=e+(g<<21&4294967295|g>>>11);g=b+(e^(c|~f))+d[8]+1873313359&4294967295;b=c+(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[15]+4264355552&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[6]+2734768916&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[13]+1309151649&4294967295;
c=e+(g<<21&4294967295|g>>>11);g=b+(e^(c|~f))+d[4]+4149444226&4294967295;b=c+(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[11]+3174756917&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[2]+718787259&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[9]+3951481745&4294967295;a.b[0]=a.b[0]+b&4294967295;a.b[1]=a.b[1]+(e+(g<<21&4294967295|g>>>11))&4294967295;a.b[2]=a.b[2]+e&4294967295;a.b[3]=a.b[3]+f&4294967295}
function nj(a,b){var c;void 0===c&&(c=b.length);for(var d=c-a.a,e=a.c,f=a.g,g=0;g<c;){if(0==f)for(;g<=d;)mj(a,b,g),g+=a.a;if(da(b))for(;g<c;){if(e[f++]=b.charCodeAt(g++),f==a.a){mj(a,e);f=0;break}}else for(;g<c;)if(e[f++]=b[g++],f==a.a){mj(a,e);f=0;break}}a.g=f;a.f+=c};function oj(a){a=a||{};this.b=void 0!==a.color?a.color:null;this.f=a.lineCap;this.g=void 0!==a.lineDash?a.lineDash:null;this.c=a.lineJoin;this.i=a.miterLimit;this.a=a.width;this.l=void 0}k=oj.prototype;k.Kn=function(){return this.b};k.dk=function(){return this.f};k.Ln=function(){return this.g};k.ek=function(){return this.c};k.jk=function(){return this.i};k.Mn=function(){return this.a};k.Nn=function(a){this.b=a;this.l=void 0};k.fp=function(a){this.f=a;this.l=void 0};
k.On=function(a){this.g=a;this.l=void 0};k.gp=function(a){this.c=a;this.l=void 0};k.hp=function(a){this.i=a;this.l=void 0};k.lp=function(a){this.a=a;this.l=void 0};
function pj(a){if(void 0===a.l){var b="s"+(a.b?ve(a.b):"-")+","+(void 0!==a.f?a.f.toString():"-")+","+(a.g?a.g.toString():"-")+","+(void 0!==a.c?a.c:"-")+","+(void 0!==a.i?a.i.toString():"-")+","+(void 0!==a.a?a.a.toString():"-"),c=new lj;nj(c,b);b=Array((56>c.g?c.a:2*c.a)-c.g);b[0]=128;for(var d=1;d<b.length-8;++d)b[d]=0;for(var e=8*c.f,d=b.length-8;d<b.length;++d)b[d]=e&255,e/=256;nj(c,b);b=Array(16);for(d=e=0;4>d;++d)for(var f=0;32>f;f+=8)b[e++]=c.b[d]>>>f&255;if(8192>=b.length)c=String.fromCharCode.apply(null,
b);else for(c="",d=0;d<b.length;d+=8192)e=pe(b,d,d+8192),c+=String.fromCharCode.apply(null,e);a.l=c}return a.l};function qj(a){a=a||{};this.l=this.f=this.c=null;this.g=void 0!==a.fill?a.fill:null;this.b=void 0!==a.stroke?a.stroke:null;this.a=a.radius;this.A=[0,0];this.s=this.D=this.o=null;var b=a.atlasManager,c,d=null,e,f=0;this.b&&(e=ve(this.b.b),f=this.b.a,void 0===f&&(f=1),d=this.b.g,hg||(d=null));var g=2*(this.a+f)+1;e={strokeStyle:e,Bd:f,size:g,lineDash:d};if(void 0===b)b=Oe(g,g),this.f=b.canvas,c=g=this.f.width,this.Gh(e,b,0,0),this.g?this.l=this.f:(b=Oe(e.size,e.size),this.l=b.canvas,this.Fh(e,b,0,0));
else{g=Math.round(g);(d=!this.g)&&(c=this.Fh.bind(this,e));var f=this.b?pj(this.b):"-",h=this.g?jj(this.g):"-";this.c&&f==this.c[1]&&h==this.c[2]&&this.a==this.c[3]||(this.c=["c"+f+h+(void 0!==this.a?this.a.toString():"-"),f,h,this.a]);b=b.add(this.c[0],g,g,this.Gh.bind(this,e),c);this.f=b.image;this.A=[b.offsetX,b.offsetY];c=b.image.width;this.l=d?b.Sg:this.f}this.o=[g/2,g/2];this.D=[g,g];this.s=[c,c];Ch.call(this,{opacity:1,rotateWithView:!1,rotation:0,scale:1,snapToPixel:void 0!==a.snapToPixel?
a.snapToPixel:!0})}y(qj,Ch);k=qj.prototype;k.Yb=function(){return this.o};k.Bn=function(){return this.g};k.pe=function(){return this.l};k.jc=function(){return this.f};k.td=function(){return 2};k.ld=function(){return this.s};k.Ia=function(){return this.A};k.Cn=function(){return this.a};k.Fb=function(){return this.D};k.Dn=function(){return this.b};k.pf=na;k.load=na;k.Xf=na;
k.Gh=function(a,b,c,d){b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();b.arc(a.size/2,a.size/2,this.a,0,2*Math.PI,!0);this.g&&(b.fillStyle=xe(this.g.b),b.fill());this.b&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Bd,a.lineDash&&b.setLineDash(a.lineDash),b.stroke());b.closePath()};
k.Fh=function(a,b,c,d){b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();b.arc(a.size/2,a.size/2,this.a,0,2*Math.PI,!0);b.fillStyle=ve(ej);b.fill();this.b&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Bd,a.lineDash&&b.setLineDash(a.lineDash),b.stroke());b.closePath()};function rj(a){a=a||{};this.i=null;this.g=sj;void 0!==a.geometry&&this.Jh(a.geometry);this.c=void 0!==a.fill?a.fill:null;this.a=void 0!==a.image?a.image:null;this.f=void 0!==a.stroke?a.stroke:null;this.l=void 0!==a.text?a.text:null;this.b=a.zIndex}k=rj.prototype;k.W=function(){return this.i};k.Zj=function(){return this.g};k.Pn=function(){return this.c};k.Qn=function(){return this.a};k.Rn=function(){return this.f};k.Ha=function(){return this.l};k.Sn=function(){return this.b};
k.Jh=function(a){"function"===typeof a?this.g=a:"string"===typeof a?this.g=function(b){return b.get(a)}:a?a&&(this.g=function(){return a}):this.g=sj;this.i=a};k.Tn=function(a){this.b=a};function tj(a){if("function"!==typeof a){var b;b=Array.isArray(a)?a:[a];a=function(){return b}}return a}var uj=null;function vj(){if(!uj){var a=new ij({color:"rgba(255,255,255,0.4)"}),b=new oj({color:"#3399CC",width:1.25});uj=[new rj({image:new qj({fill:a,stroke:b,radius:5}),fill:a,stroke:b})]}return uj}
function wj(){var a={},b=[255,255,255,1],c=[0,153,255,1];a.Polygon=[new rj({fill:new ij({color:[255,255,255,.5]})})];a.MultiPolygon=a.Polygon;a.LineString=[new rj({stroke:new oj({color:b,width:5})}),new rj({stroke:new oj({color:c,width:3})})];a.MultiLineString=a.LineString;a.Circle=a.Polygon.concat(a.LineString);a.Point=[new rj({image:new qj({radius:6,fill:new ij({color:c}),stroke:new oj({color:b,width:1.5})}),zIndex:Infinity})];a.MultiPoint=a.Point;a.GeometryCollection=a.Polygon.concat(a.LineString,
a.Point);return a}function sj(a){return a.W()};function G(a){a=a?a:{};var b=Ea({},a);delete b.style;delete b.renderBuffer;delete b.updateWhileAnimating;delete b.updateWhileInteracting;mh.call(this,b);this.a=void 0!==a.renderBuffer?a.renderBuffer:100;this.A=null;this.i=void 0;this.l(a.style);this.S=void 0!==a.updateWhileAnimating?a.updateWhileAnimating:!1;this.T=void 0!==a.updateWhileInteracting?a.updateWhileInteracting:!1}y(G,mh);function xj(a){return a.get("renderOrder")}G.prototype.C=function(){return this.A};G.prototype.D=function(){return this.i};
G.prototype.l=function(a){this.A=void 0!==a?a:vj;this.i=null===a?void 0:tj(this.A);this.u()};function I(a){a=a?a:{};var b=Ea({},a);delete b.preload;delete b.useInterimTilesOnError;G.call(this,b);this.Y(a.preload?a.preload:0);this.ia(a.useInterimTilesOnError?a.useInterimTilesOnError:!0);this.s=a.renderMode||"hybrid"}y(I,G);I.prototype.f=function(){return this.get("preload")};I.prototype.c=function(){return this.get("useInterimTilesOnError")};I.prototype.Y=function(a){this.set("preload",a)};I.prototype.ia=function(a){this.set("useInterimTilesOnError",a)};function yj(a,b,c,d,e){this.f=a;this.A=b;this.c=c;this.D=d;this.Hc=e;this.i=this.b=this.a=this.ia=this.Ra=this.Y=null;this.qa=this.za=this.v=this.Ba=this.ya=this.R=0;this.Gb=!1;this.l=this.ta=0;this.Aa=!1;this.S=0;this.g="";this.j=this.C=this.qb=this.Sa=0;this.T=this.s=this.o=null;this.U=[];this.Hb=Xc()}y(yj,kh);
function zj(a,b,c){if(a.i){b=gd(b,0,c,2,a.D,a.U);c=a.f;var d=a.Hb,e=c.globalAlpha;1!=a.v&&(c.globalAlpha=e*a.v);var f=a.ta;a.Gb&&(f+=a.Hc);var g,h;g=0;for(h=b.length;g<h;g+=2){var l=b[g]-a.R,m=b[g+1]-a.ya;a.Aa&&(l=Math.round(l),m=Math.round(m));if(0!==f||1!=a.l){var n=l+a.R,p=m+a.ya;qh(d,n,p,a.l,a.l,f,-n,-p);c.setTransform(d[0],d[1],d[4],d[5],d[12],d[13])}c.drawImage(a.i,a.za,a.qa,a.S,a.Ba,l,m,a.S,a.Ba)}0===f&&1==a.l||c.setTransform(1,0,0,1,0,0);1!=a.v&&(c.globalAlpha=e)}}
function Aj(a,b,c,d){var e=0;if(a.T&&""!==a.g){a.o&&Bj(a,a.o);a.s&&Cj(a,a.s);var f=a.T,g=a.f,h=a.ia;h?(h.font!=f.font&&(h.font=g.font=f.font),h.textAlign!=f.textAlign&&(h.textAlign=g.textAlign=f.textAlign),h.textBaseline!=f.textBaseline&&(h.textBaseline=g.textBaseline=f.textBaseline)):(g.font=f.font,g.textAlign=f.textAlign,g.textBaseline=f.textBaseline,a.ia={font:f.font,textAlign:f.textAlign,textBaseline:f.textBaseline});b=gd(b,e,c,d,a.D,a.U);for(f=a.f;e<c;e+=d){g=b[e]+a.Sa;h=b[e+1]+a.qb;if(0!==a.C||
1!=a.j){var l=qh(a.Hb,g,h,a.j,a.j,a.C,-g,-h);f.setTransform(l[0],l[1],l[4],l[5],l[12],l[13])}a.s&&f.strokeText(a.g,g,h);a.o&&f.fillText(a.g,g,h)}0===a.C&&1==a.j||f.setTransform(1,0,0,1,0,0)}}function Dj(a,b,c,d,e,f){var g=a.f;a=gd(b,c,d,e,a.D,a.U);g.moveTo(a[0],a[1]);b=a.length;f&&(b-=2);for(c=2;c<b;c+=2)g.lineTo(a[c],a[c+1]);f&&g.closePath();return d}function Ej(a,b,c,d,e){var f,g;f=0;for(g=d.length;f<g;++f)c=Dj(a,b,c,d[f],e,!0);return c}k=yj.prototype;
k.Rd=function(a){if(nc(this.c,a.H())){if(this.a||this.b){this.a&&Bj(this,this.a);this.b&&Cj(this,this.b);var b;b=this.D;var c=this.U,d=a.la();b=d?gd(d,0,d.length,a.va(),b,c):null;c=b[2]-b[0];d=b[3]-b[1];c=Math.sqrt(c*c+d*d);d=this.f;d.beginPath();d.arc(b[0],b[1],c,0,2*Math.PI);this.a&&d.fill();this.b&&d.stroke()}""!==this.g&&Aj(this,a.rd(),2,2)}};k.sd=function(a){this.Sb(a.c,a.f);this.Tb(a.a);this.Vb(a.Ha())};
k.sc=function(a){switch(a.X()){case "Point":this.uc(a);break;case "LineString":this.hd(a);break;case "Polygon":this.bf(a);break;case "MultiPoint":this.tc(a);break;case "MultiLineString":this.$e(a);break;case "MultiPolygon":this.af(a);break;case "GeometryCollection":this.Ze(a);break;case "Circle":this.Rd(a)}};k.Ye=function(a,b){var c=(0,b.g)(a);c&&nc(this.c,c.H())&&(this.sd(b),this.sc(c))};k.Ze=function(a){a=a.c;var b,c;b=0;for(c=a.length;b<c;++b)this.sc(a[b])};
k.uc=function(a){var b=a.la();a=a.va();this.i&&zj(this,b,b.length);""!==this.g&&Aj(this,b,b.length,a)};k.tc=function(a){var b=a.la();a=a.va();this.i&&zj(this,b,b.length);""!==this.g&&Aj(this,b,b.length,a)};k.hd=function(a){if(nc(this.c,a.H())){if(this.b){Cj(this,this.b);var b=this.f,c=a.la();b.beginPath();Dj(this,c,0,c.length,a.va(),!1);b.stroke()}""!==this.g&&(a=Fj(a),Aj(this,a,2,2))}};
k.$e=function(a){var b=a.H();if(nc(this.c,b)){if(this.b){Cj(this,this.b);var b=this.f,c=a.la(),d=0,e=a.Db(),f=a.va();b.beginPath();var g,h;g=0;for(h=e.length;g<h;++g)d=Dj(this,c,d,e[g],f,!1);b.stroke()}""!==this.g&&(a=Gj(a),Aj(this,a,a.length,2))}};k.bf=function(a){if(nc(this.c,a.H())){if(this.b||this.a){this.a&&Bj(this,this.a);this.b&&Cj(this,this.b);var b=this.f;b.beginPath();Ej(this,a.Mb(),0,a.Db(),a.va());this.a&&b.fill();this.b&&b.stroke()}""!==this.g&&(a=Md(a),Aj(this,a,2,2))}};
k.af=function(a){if(nc(this.c,a.H())){if(this.b||this.a){this.a&&Bj(this,this.a);this.b&&Cj(this,this.b);var b=this.f,c=Hj(a),d=0,e=a.i,f=a.va(),g,h;g=0;for(h=e.length;g<h;++g){var l=e[g];b.beginPath();d=Ej(this,c,d,l,f);this.a&&b.fill();this.b&&b.stroke()}}""!==this.g&&(a=Ij(a),Aj(this,a,a.length,2))}};function Bj(a,b){var c=a.f,d=a.Y;d?d.fillStyle!=b.fillStyle&&(d.fillStyle=c.fillStyle=b.fillStyle):(c.fillStyle=b.fillStyle,a.Y={fillStyle:b.fillStyle})}
function Cj(a,b){var c=a.f,d=a.Ra;d?(d.lineCap!=b.lineCap&&(d.lineCap=c.lineCap=b.lineCap),hg&&!pb(d.lineDash,b.lineDash)&&c.setLineDash(d.lineDash=b.lineDash),d.lineJoin!=b.lineJoin&&(d.lineJoin=c.lineJoin=b.lineJoin),d.lineWidth!=b.lineWidth&&(d.lineWidth=c.lineWidth=b.lineWidth),d.miterLimit!=b.miterLimit&&(d.miterLimit=c.miterLimit=b.miterLimit),d.strokeStyle!=b.strokeStyle&&(d.strokeStyle=c.strokeStyle=b.strokeStyle)):(c.lineCap=b.lineCap,hg&&c.setLineDash(b.lineDash),c.lineJoin=b.lineJoin,c.lineWidth=
b.lineWidth,c.miterLimit=b.miterLimit,c.strokeStyle=b.strokeStyle,a.Ra={lineCap:b.lineCap,lineDash:b.lineDash,lineJoin:b.lineJoin,lineWidth:b.lineWidth,miterLimit:b.miterLimit,strokeStyle:b.strokeStyle})}
k.Sb=function(a,b){if(a){var c=a.b;this.a={fillStyle:xe(c?c:ej)}}else this.a=null;if(b){var c=b.b,d=b.f,e=b.g,f=b.c,g=b.a,h=b.i;this.b={lineCap:void 0!==d?d:"round",lineDash:e?e:fj,lineJoin:void 0!==f?f:"round",lineWidth:this.A*(void 0!==g?g:1),miterLimit:void 0!==h?h:10,strokeStyle:ve(c?c:gj)}}else this.b=null};
k.Tb=function(a){if(a){var b=a.Yb(),c=a.jc(1),d=a.Ia(),e=a.Fb();this.R=b[0];this.ya=b[1];this.Ba=e[1];this.i=c;this.v=a.v;this.za=d[0];this.qa=d[1];this.Gb=a.U;this.ta=a.j;this.l=a.i;this.Aa=a.C;this.S=e[0]}else this.i=null};
k.Vb=function(a){if(a){var b=a.b;b?(b=b.b,this.o={fillStyle:xe(b?b:ej)}):this.o=null;var c=a.l;if(c){var b=c.b,d=c.f,e=c.g,f=c.c,g=c.a,c=c.i;this.s={lineCap:void 0!==d?d:"round",lineDash:e?e:fj,lineJoin:void 0!==f?f:"round",lineWidth:void 0!==g?g:1,miterLimit:void 0!==c?c:10,strokeStyle:ve(b?b:gj)}}else this.s=null;var b=a.g,d=a.f,e=a.c,f=a.i,g=a.a,c=a.Ha(),h=a.o;a=a.j;this.T={font:void 0!==b?b:"10px sans-serif",textAlign:void 0!==h?h:"center",textBaseline:void 0!==a?a:"middle"};this.g=void 0!==c?
c:"";this.Sa=void 0!==d?this.A*d:0;this.qb=void 0!==e?this.A*e:0;this.C=void 0!==f?f:0;this.j=this.A*(void 0!==g?g:1)}else this.g=""};function Jj(a){th.call(this,a);this.R=Xc()}y(Jj,th);
Jj.prototype.i=function(a,b,c){Kj(this,"precompose",c,a,void 0);var d=this.f?this.f.a():null;if(d){var e=b.extent,f=void 0!==e;if(f){var g=a.pixelRatio,h=a.size[0]*g,l=a.size[1]*g,m=a.viewState.rotation,n=fc(e),p=ec(e),q=dc(e),e=cc(e);sh(a.coordinateToPixelMatrix,n,n);sh(a.coordinateToPixelMatrix,p,p);sh(a.coordinateToPixelMatrix,q,q);sh(a.coordinateToPixelMatrix,e,e);c.save();hj(c,-m,h/2,l/2);c.beginPath();c.moveTo(n[0]*g,n[1]*g);c.lineTo(p[0]*g,p[1]*g);c.lineTo(q[0]*g,q[1]*g);c.lineTo(e[0]*g,e[1]*
g);c.clip();hj(c,m,h/2,l/2)}g=this.s;h=c.globalAlpha;c.globalAlpha=b.opacity;c.drawImage(d,0,0,+d.width,+d.height,Math.round(g[12]),Math.round(g[13]),Math.round(d.width*g[0]),Math.round(d.height*g[5]));c.globalAlpha=h;f&&c.restore()}Lj(this,c,a)};
function Kj(a,b,c,d,e){var f=a.a;if(ab(f,b)){var g=d.size[0]*d.pixelRatio,h=d.size[1]*d.pixelRatio,l=d.viewState.rotation;hj(c,-l,g/2,h/2);a=void 0!==e?e:Mj(a,d,0);a=new yj(c,d.pixelRatio,d.extent,a,d.viewState.rotation);f.b(new lh(b,f,a,d,c,null));hj(c,l,g/2,h/2)}}function Lj(a,b,c,d){Kj(a,"postcompose",b,c,d)}function Mj(a,b,c){var d=b.viewState,e=b.pixelRatio;return qh(a.R,e*b.size[0]/2,e*b.size[1]/2,e/d.resolution,-e/d.resolution,-d.rotation,-d.center[0]+c,-d.center[1])};var Nj=["Polygon","LineString","Image","Text"];function Oj(a,b,c){this.qa=a;this.T=b;this.f=null;this.c=0;this.resolution=c;this.Ba=this.ya=null;this.a=[];this.coordinates=[];this.Ra=Xc();this.b=[];this.Y=[];this.ia=Xc();this.za=Xc()}y(Oj,kh);
function Pj(a,b,c,d,e,f){var g=a.coordinates.length,h=a.df(),l=[b[c],b[c+1]],m=[NaN,NaN],n=!0,p,q,r;for(p=c+e;p<d;p+=e)m[0]=b[p],m[1]=b[p+1],r=Vb(h,m),r!==q?(n&&(a.coordinates[g++]=l[0],a.coordinates[g++]=l[1]),a.coordinates[g++]=m[0],a.coordinates[g++]=m[1],n=!1):1===r?(a.coordinates[g++]=m[0],a.coordinates[g++]=m[1],n=!1):n=!0,l[0]=m[0],l[1]=m[1],q=r;p===c+e&&(a.coordinates[g++]=l[0],a.coordinates[g++]=l[1]);f&&(a.coordinates[g++]=b[c],a.coordinates[g++]=b[c+1]);return g}
function Qj(a,b){a.ya=[0,b,0];a.a.push(a.ya);a.Ba=[0,b,0];a.b.push(a.Ba)}
function Rj(a,b,c,d,e,f,g,h,l){var m;rh(d,a.Ra)?m=a.Y:(m=gd(a.coordinates,0,a.coordinates.length,2,d,a.Y),$c(a.Ra,d));d=!Ha(f);var n=0,p=g.length,q,r,u=a.ia;a=a.za;for(var x,v,D,A;n<p;){var z=g[n],F,N,K,X;switch(z[0]){case 0:q=z[1];d&&f[w(q).toString()]||!q.W()?n=z[2]:void 0===l||nc(l,q.W().H())?++n:n=z[2];break;case 1:b.beginPath();++n;break;case 2:q=z[1];r=m[q];z=m[q+1];D=m[q+2]-r;q=m[q+3]-z;b.arc(r,z,Math.sqrt(D*D+q*q),0,2*Math.PI,!0);++n;break;case 3:b.closePath();++n;break;case 4:q=z[1];r=z[2];
F=z[3];K=z[4]*c;var oa=z[5]*c,H=z[6];N=z[7];var ya=z[8],Ua=z[9];D=z[11];A=z[12];var Xa=z[13],Va=z[14];for(z[10]&&(D+=e);q<r;q+=2){z=m[q]-K;X=m[q+1]-oa;Xa&&(z=Math.round(z),X=Math.round(X));if(1!=A||0!==D){var Aa=z+K,Qb=X+oa;qh(u,Aa,Qb,A,A,D,-Aa,-Qb);b.transform(u[0],u[1],u[4],u[5],u[12],u[13])}Aa=b.globalAlpha;1!=N&&(b.globalAlpha=Aa*N);var Qb=Va+ya>F.width?F.width-ya:Va,Nb=H+Ua>F.height?F.height-Ua:H;b.drawImage(F,ya,Ua,Qb,Nb,z,X,Qb*c,Nb*c);1!=N&&(b.globalAlpha=Aa);if(1!=A||0!==D)cd(u,a),b.transform(a[0],
a[1],a[4],a[5],a[12],a[13])}++n;break;case 5:q=z[1];r=z[2];K=z[3];oa=z[4]*c;H=z[5]*c;D=z[6];A=z[7]*c;F=z[8];for(N=z[9];q<r;q+=2){z=m[q]+oa;X=m[q+1]+H;if(1!=A||0!==D)qh(u,z,X,A,A,D,-z,-X),b.transform(u[0],u[1],u[4],u[5],u[12],u[13]);ya=K.split("\n");Ua=ya.length;1<Ua?(Xa=Math.round(1.5*b.measureText("M").width),X-=(Ua-1)/2*Xa):Xa=0;for(Va=0;Va<Ua;Va++)Aa=ya[Va],N&&b.strokeText(Aa,z,X),F&&b.fillText(Aa,z,X),X+=Xa;if(1!=A||0!==D)cd(u,a),b.transform(a[0],a[1],a[4],a[5],a[12],a[13])}++n;break;case 6:if(void 0!==
h&&(q=z[1],q=h(q)))return q;++n;break;case 7:b.fill();++n;break;case 8:q=z[1];r=z[2];z=m[q];X=m[q+1];D=z+.5|0;A=X+.5|0;if(D!==x||A!==v)b.moveTo(z,X),x=D,v=A;for(q+=2;q<r;q+=2)if(z=m[q],X=m[q+1],D=z+.5|0,A=X+.5|0,q==r-2||D!==x||A!==v)b.lineTo(z,X),x=D,v=A;++n;break;case 9:b.fillStyle=z[1];++n;break;case 10:x=void 0!==z[7]?z[7]:!0;v=z[2];b.strokeStyle=z[1];b.lineWidth=x?v*c:v;b.lineCap=z[3];b.lineJoin=z[4];b.miterLimit=z[5];hg&&b.setLineDash(z[6]);v=x=NaN;++n;break;case 11:b.font=z[1];b.textAlign=z[2];
b.textBaseline=z[3];++n;break;case 12:b.stroke();++n;break;default:++n}}}Oj.prototype.Pa=function(a,b,c,d,e){Rj(this,a,b,c,d,e,this.a,void 0)};function Sj(a){var b=a.b;b.reverse();var c,d=b.length,e,f,g=-1;for(c=0;c<d;++c)if(e=b[c],f=e[0],6==f)g=c;else if(0==f){e[2]=c;e=a.b;for(f=c;g<f;){var h=e[g];e[g]=e[f];e[f]=h;++g;--f}g=-1}}function Tj(a,b){a.ya[2]=a.a.length;a.ya=null;a.Ba[2]=a.b.length;a.Ba=null;var c=[6,b];a.a.push(c);a.b.push(c)}Oj.prototype.ke=na;Oj.prototype.df=function(){return this.T};
function Uj(a,b,c){Oj.call(this,a,b,c);this.o=this.S=null;this.R=this.D=this.C=this.A=this.U=this.v=this.s=this.j=this.l=this.i=this.g=void 0}y(Uj,Oj);Uj.prototype.uc=function(a,b){if(this.o){Qj(this,b);var c=a.la(),d=this.coordinates.length,c=Pj(this,c,0,c.length,a.va(),!1);this.a.push([4,d,c,this.o,this.g,this.i,this.l,this.j,this.s,this.v,this.U,this.A,this.C,this.D,this.R]);this.b.push([4,d,c,this.S,this.g,this.i,this.l,this.j,this.s,this.v,this.U,this.A,this.C,this.D,this.R]);Tj(this,b)}};
Uj.prototype.tc=function(a,b){if(this.o){Qj(this,b);var c=a.la(),d=this.coordinates.length,c=Pj(this,c,0,c.length,a.va(),!1);this.a.push([4,d,c,this.o,this.g,this.i,this.l,this.j,this.s,this.v,this.U,this.A,this.C,this.D,this.R]);this.b.push([4,d,c,this.S,this.g,this.i,this.l,this.j,this.s,this.v,this.U,this.A,this.C,this.D,this.R]);Tj(this,b)}};Uj.prototype.ke=function(){Sj(this);this.i=this.g=void 0;this.o=this.S=null;this.R=this.D=this.A=this.U=this.v=this.s=this.j=this.C=this.l=void 0};
Uj.prototype.Tb=function(a){var b=a.Yb(),c=a.Fb(),d=a.pe(1),e=a.jc(1),f=a.Ia();this.g=b[0];this.i=b[1];this.S=d;this.o=e;this.l=c[1];this.j=a.v;this.s=f[0];this.v=f[1];this.U=a.U;this.A=a.j;this.C=a.i;this.D=a.C;this.R=c[0]};function Vj(a,b,c){Oj.call(this,a,b,c);this.g={fd:void 0,ad:void 0,bd:null,cd:void 0,dd:void 0,ed:void 0,nf:0,strokeStyle:void 0,lineCap:void 0,lineDash:null,lineJoin:void 0,lineWidth:void 0,miterLimit:void 0}}y(Vj,Oj);
function Wj(a,b,c,d,e){var f=a.coordinates.length;b=Pj(a,b,c,d,e,!1);f=[8,f,b];a.a.push(f);a.b.push(f);return d}k=Vj.prototype;k.df=function(){this.f||(this.f=Pb(this.T),0<this.c&&Ob(this.f,this.resolution*(this.c+1)/2,this.f));return this.f};
function Xj(a){var b=a.g,c=b.strokeStyle,d=b.lineCap,e=b.lineDash,f=b.lineJoin,g=b.lineWidth,h=b.miterLimit;b.fd==c&&b.ad==d&&pb(b.bd,e)&&b.cd==f&&b.dd==g&&b.ed==h||(b.nf!=a.coordinates.length&&(a.a.push([12]),b.nf=a.coordinates.length),a.a.push([10,c,g,d,f,h,e],[1]),b.fd=c,b.ad=d,b.bd=e,b.cd=f,b.dd=g,b.ed=h)}
k.hd=function(a,b){var c=this.g,d=c.lineWidth;void 0!==c.strokeStyle&&void 0!==d&&(Xj(this),Qj(this,b),this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash],[1]),c=a.la(),Wj(this,c,0,c.length,a.va()),this.b.push([12]),Tj(this,b))};
k.$e=function(a,b){var c=this.g,d=c.lineWidth;if(void 0!==c.strokeStyle&&void 0!==d){Xj(this);Qj(this,b);this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash],[1]);var c=a.Db(),d=a.la(),e=a.va(),f=0,g,h;g=0;for(h=c.length;g<h;++g)f=Wj(this,d,f,c[g],e);this.b.push([12]);Tj(this,b)}};k.ke=function(){this.g.nf!=this.coordinates.length&&this.a.push([12]);Sj(this);this.g=null};
k.Sb=function(a,b){var c=b.b;this.g.strokeStyle=ve(c?c:gj);c=b.f;this.g.lineCap=void 0!==c?c:"round";c=b.g;this.g.lineDash=c?c:fj;c=b.c;this.g.lineJoin=void 0!==c?c:"round";c=b.a;this.g.lineWidth=void 0!==c?c:1;c=b.i;this.g.miterLimit=void 0!==c?c:10;this.g.lineWidth>this.c&&(this.c=this.g.lineWidth,this.f=null)};
function Yj(a,b,c){Oj.call(this,a,b,c);this.g={ug:void 0,fd:void 0,ad:void 0,bd:null,cd:void 0,dd:void 0,ed:void 0,fillStyle:void 0,strokeStyle:void 0,lineCap:void 0,lineDash:null,lineJoin:void 0,lineWidth:void 0,miterLimit:void 0}}y(Yj,Oj);
function Zj(a,b,c,d,e){var f=a.g,g=[1];a.a.push(g);a.b.push(g);var h,g=0;for(h=d.length;g<h;++g){var l=d[g],m=a.coordinates.length;c=Pj(a,b,c,l,e,!0);c=[8,m,c];m=[3];a.a.push(c,m);a.b.push(c,m);c=l}b=[7];a.b.push(b);void 0!==f.fillStyle&&a.a.push(b);void 0!==f.strokeStyle&&(f=[12],a.a.push(f),a.b.push(f));return c}k=Yj.prototype;
k.Rd=function(a,b){var c=this.g,d=c.strokeStyle;if(void 0!==c.fillStyle||void 0!==d){ak(this);Qj(this,b);this.b.push([9,ve(ej)]);void 0!==c.strokeStyle&&this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash]);var e=a.la(),d=this.coordinates.length;Pj(this,e,0,e.length,a.va(),!1);e=[1];d=[2,d];this.a.push(e,d);this.b.push(e,d);d=[7];this.b.push(d);void 0!==c.fillStyle&&this.a.push(d);void 0!==c.strokeStyle&&(c=[12],this.a.push(c),this.b.push(c));Tj(this,b)}};
k.bf=function(a,b){var c=this.g,d=c.strokeStyle;if(void 0!==c.fillStyle||void 0!==d)ak(this),Qj(this,b),this.b.push([9,ve(ej)]),void 0!==c.strokeStyle&&this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash]),c=a.Db(),d=a.Mb(),Zj(this,d,0,c,a.va()),Tj(this,b)};
k.af=function(a,b){var c=this.g,d=c.strokeStyle;if(void 0!==c.fillStyle||void 0!==d){ak(this);Qj(this,b);this.b.push([9,ve(ej)]);void 0!==c.strokeStyle&&this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash]);var c=a.i,d=Hj(a),e=a.va(),f=0,g,h;g=0;for(h=c.length;g<h;++g)f=Zj(this,d,f,c[g],e);Tj(this,b)}};k.ke=function(){Sj(this);this.g=null;var a=this.qa;if(0!==a){var b=this.coordinates,c,d;c=0;for(d=b.length;c<d;++c)b[c]=a*Math.round(b[c]/a)}};
k.df=function(){this.f||(this.f=Pb(this.T),0<this.c&&Ob(this.f,this.resolution*(this.c+1)/2,this.f));return this.f};
k.Sb=function(a,b){var c=this.g;if(a){var d=a.b;c.fillStyle=xe(d?d:ej)}else c.fillStyle=void 0;b?(d=b.b,c.strokeStyle=ve(d?d:gj),d=b.f,c.lineCap=void 0!==d?d:"round",d=b.g,c.lineDash=d?d.slice():fj,d=b.c,c.lineJoin=void 0!==d?d:"round",d=b.a,c.lineWidth=void 0!==d?d:1,d=b.i,c.miterLimit=void 0!==d?d:10,c.lineWidth>this.c&&(this.c=c.lineWidth,this.f=null)):(c.strokeStyle=void 0,c.lineCap=void 0,c.lineDash=null,c.lineJoin=void 0,c.lineWidth=void 0,c.miterLimit=void 0)};
function ak(a){var b=a.g,c=b.fillStyle,d=b.strokeStyle,e=b.lineCap,f=b.lineDash,g=b.lineJoin,h=b.lineWidth,l=b.miterLimit;void 0!==c&&b.ug!=c&&(a.a.push([9,c]),b.ug=b.fillStyle);void 0===d||b.fd==d&&b.ad==e&&b.bd==f&&b.cd==g&&b.dd==h&&b.ed==l||(a.a.push([10,d,h,e,g,l,f]),b.fd=d,b.ad=e,b.bd=f,b.cd=g,b.dd=h,b.ed=l)}function bk(a,b,c){Oj.call(this,a,b,c);this.D=this.C=this.A=null;this.o="";this.U=this.v=this.s=this.j=0;this.l=this.i=this.g=null}y(bk,Oj);
function ck(a,b,c,d,e){if(""!==a.o&&a.l&&(a.g||a.i)){if(a.g){var f=a.g,g=a.A;if(!g||g.fillStyle!=f.fillStyle){var h=[9,f.fillStyle];a.a.push(h);a.b.push(h);g?g.fillStyle=f.fillStyle:a.A={fillStyle:f.fillStyle}}}a.i&&(f=a.i,g=a.C,g&&g.lineCap==f.lineCap&&g.lineDash==f.lineDash&&g.lineJoin==f.lineJoin&&g.lineWidth==f.lineWidth&&g.miterLimit==f.miterLimit&&g.strokeStyle==f.strokeStyle||(h=[10,f.strokeStyle,f.lineWidth,f.lineCap,f.lineJoin,f.miterLimit,f.lineDash,!1],a.a.push(h),a.b.push(h),g?(g.lineCap=
f.lineCap,g.lineDash=f.lineDash,g.lineJoin=f.lineJoin,g.lineWidth=f.lineWidth,g.miterLimit=f.miterLimit,g.strokeStyle=f.strokeStyle):a.C={lineCap:f.lineCap,lineDash:f.lineDash,lineJoin:f.lineJoin,lineWidth:f.lineWidth,miterLimit:f.miterLimit,strokeStyle:f.strokeStyle}));f=a.l;g=a.D;g&&g.font==f.font&&g.textAlign==f.textAlign&&g.textBaseline==f.textBaseline||(h=[11,f.font,f.textAlign,f.textBaseline],a.a.push(h),a.b.push(h),g?(g.font=f.font,g.textAlign=f.textAlign,g.textBaseline=f.textBaseline):a.D=
{font:f.font,textAlign:f.textAlign,textBaseline:f.textBaseline});Qj(a,e);f=a.coordinates.length;b=Pj(a,b,0,c,d,!1);b=[5,f,b,a.o,a.j,a.s,a.v,a.U,!!a.g,!!a.i];a.a.push(b);a.b.push(b);Tj(a,e)}}
bk.prototype.Vb=function(a){if(a){var b=a.b;b?(b=b.b,b=xe(b?b:ej),this.g?this.g.fillStyle=b:this.g={fillStyle:b}):this.g=null;var c=a.l;if(c){var b=c.b,d=c.f,e=c.g,f=c.c,g=c.a,c=c.i,d=void 0!==d?d:"round",e=e?e.slice():fj,f=void 0!==f?f:"round",g=void 0!==g?g:1,c=void 0!==c?c:10,b=ve(b?b:gj);if(this.i){var h=this.i;h.lineCap=d;h.lineDash=e;h.lineJoin=f;h.lineWidth=g;h.miterLimit=c;h.strokeStyle=b}else this.i={lineCap:d,lineDash:e,lineJoin:f,lineWidth:g,miterLimit:c,strokeStyle:b}}else this.i=null;
var l=a.g,b=a.f,d=a.c,e=a.i,g=a.a,c=a.Ha(),f=a.o,h=a.j;a=void 0!==l?l:"10px sans-serif";f=void 0!==f?f:"center";h=void 0!==h?h:"middle";this.l?(l=this.l,l.font=a,l.textAlign=f,l.textBaseline=h):this.l={font:a,textAlign:f,textBaseline:h};this.o=void 0!==c?c:"";this.j=void 0!==b?b:0;this.s=void 0!==d?d:0;this.v=void 0!==e?e:0;this.U=void 0!==g?g:1}else this.o=""};function dk(a,b,c,d){this.o=a;this.g=b;this.l=c;this.f=d;this.a={};this.c=Oe(1,1);this.i=Xc()}
function ek(a){for(var b in a.a){var c=a.a[b],d;for(d in c)c[d].ke()}}dk.prototype.ra=function(a,b,c,d,e){var f=this.i;qh(f,.5,.5,1/b,-1/b,-c,-a[0],-a[1]);var g=this.c;g.clearRect(0,0,1,1);var h;void 0!==this.f&&(h=Lb(),Mb(h,a),Ob(h,b*this.f,h));return fk(this,g,f,c,d,function(a){if(0<g.getImageData(0,0,1,1).data[3]){if(a=e(a))return a;g.clearRect(0,0,1,1)}},h)};
dk.prototype.b=function(a,b){var c=void 0!==a?a.toString():"0",d=this.a[c];void 0===d&&(d={},this.a[c]=d);c=d[b];void 0===c&&(c=new gk[b](this.o,this.g,this.l),d[b]=c);return c};dk.prototype.Ya=function(){return Ha(this.a)};
dk.prototype.Pa=function(a,b,c,d,e,f){var g=Object.keys(this.a).map(Number);g.sort(ib);var h=this.g,l=h[0],m=h[1],n=h[2],h=h[3],l=[l,m,l,h,n,h,n,m];gd(l,0,8,2,c,l);a.save();a.beginPath();a.moveTo(l[0],l[1]);a.lineTo(l[2],l[3]);a.lineTo(l[4],l[5]);a.lineTo(l[6],l[7]);a.closePath();a.clip();f=f?f:Nj;for(var p,q,l=0,m=g.length;l<m;++l)for(p=this.a[g[l].toString()],n=0,h=f.length;n<h;++n)q=p[f[n]],void 0!==q&&q.Pa(a,b,c,d,e);a.restore()};
function fk(a,b,c,d,e,f,g){var h=Object.keys(a.a).map(Number);h.sort(function(a,b){return b-a});var l,m,n,p,q;l=0;for(m=h.length;l<m;++l)for(p=a.a[h[l].toString()],n=Nj.length-1;0<=n;--n)if(q=p[Nj[n]],void 0!==q&&(q=Rj(q,b,1,c,d,e,q.b,f,g)))return q}var gk={Image:Uj,LineString:Vj,Polygon:Yj,Text:bk};function hk(a,b,c,d){this.g=a;this.b=b;this.c=c;this.f=d}k=hk.prototype;k.get=function(a){return this.f[a]};k.Db=function(){return this.c};k.H=function(){this.a||(this.a="Point"===this.g?Xb(this.b):Yb(this.b,0,this.b.length,2));return this.a};k.Mb=function(){return this.b};k.la=hk.prototype.Mb;k.W=function(){return this};k.Nm=function(){return this.f};k.od=hk.prototype.W;k.va=function(){return 2};k.ec=na;k.X=function(){return this.g};function ik(a,b){return w(a)-w(b)}function jk(a,b){var c=.5*a/b;return c*c}function lk(a,b,c,d,e,f){var g=!1,h,l;if(h=c.a)l=h.td(),2==l||3==l?h.Xf(e,f):(0==l&&h.load(),h.pf(e,f),g=!0);if(e=(0,c.g)(b))d=e.od(d),(0,mk[d.X()])(a,d,c,b);return g}
var mk={Point:function(a,b,c,d){var e=c.a;if(e){if(2!=e.td())return;var f=a.b(c.b,"Image");f.Tb(e);f.uc(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),ck(a,b.la(),2,2,d)},LineString:function(a,b,c,d){var e=c.f;if(e){var f=a.b(c.b,"LineString");f.Sb(null,e);f.hd(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),ck(a,Fj(b),2,2,d)},Polygon:function(a,b,c,d){var e=c.c,f=c.f;if(e||f){var g=a.b(c.b,"Polygon");g.Sb(e,f);g.bf(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),ck(a,Md(b),2,2,d)},MultiPoint:function(a,b,c,d){var e=
c.a;if(e){if(2!=e.td())return;var f=a.b(c.b,"Image");f.Tb(e);f.tc(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),c=b.la(),ck(a,c,c.length,b.va(),d)},MultiLineString:function(a,b,c,d){var e=c.f;if(e){var f=a.b(c.b,"LineString");f.Sb(null,e);f.$e(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),b=Gj(b),ck(a,b,b.length,2,d)},MultiPolygon:function(a,b,c,d){var e=c.c,f=c.f;if(f||e){var g=a.b(c.b,"Polygon");g.Sb(e,f);g.af(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),b=Ij(b),ck(a,b,b.length,2,d)},GeometryCollection:function(a,
b,c,d){b=b.c;var e,f;e=0;for(f=b.length;e<f;++e)(0,mk[b[e].X()])(a,b[e],c,d)},Circle:function(a,b,c,d){var e=c.c,f=c.f;if(e||f){var g=a.b(c.b,"Polygon");g.Sb(e,f);g.Rd(b,d)}if(e=c.Ha())a=a.b(c.b,"Text"),a.Vb(e),ck(a,b.rd(),2,2,d)}};function nk(a,b,c,d,e,f){this.c=void 0!==f?f:null;oh.call(this,a,b,c,void 0!==f?0:2,d);this.g=e}y(nk,oh);nk.prototype.i=function(a){this.state=a?3:2;ph(this)};nk.prototype.load=function(){0==this.state&&(this.state=1,ph(this),this.c(this.i.bind(this)))};nk.prototype.a=function(){return this.g};var ok,pk=pa.navigator,qk=pa.chrome,rk=-1<pk.userAgent.indexOf("OPR"),sk=-1<pk.userAgent.indexOf("Edge");ok=!(!pk.userAgent.match("CriOS")&&null!==qk&&void 0!==qk&&"Google Inc."===pk.vendor&&0==rk&&0==sk);function tk(a,b,c,d){var e=Rc(c,b,a);c=b.getPointResolution(d,c);b=b.$b();void 0!==b&&(c*=b);b=a.$b();void 0!==b&&(c/=b);a=a.getPointResolution(c,e)/c;isFinite(a)&&0<a&&(c/=a);return c}function uk(a,b,c,d){a=c-a;b=d-b;var e=Math.sqrt(a*a+b*b);return[Math.round(c+a/e),Math.round(d+b/e)]}
function vk(a,b,c,d,e,f,g,h,l,m,n){var p=Oe(Math.round(c*a),Math.round(c*b));if(0===l.length)return p.canvas;p.scale(c,c);var q=Lb();l.forEach(function(a){ac(q,a.extent)});var r=Oe(Math.round(c*ic(q)/d),Math.round(c*jc(q)/d)),u=c/d;l.forEach(function(a){r.drawImage(a.image,m,m,a.image.width-2*m,a.image.height-2*m,(a.extent[0]-q[0])*u,-(a.extent[3]-q[3])*u,ic(a.extent)*u,jc(a.extent)*u)});var x=fc(g);h.f.forEach(function(a){var b=a.source,e=a.target,g=b[1][0],h=b[1][1],l=b[2][0],m=b[2][1];a=(e[0][0]-
x[0])/f;var n=-(e[0][1]-x[1])/f,u=(e[1][0]-x[0])/f,H=-(e[1][1]-x[1])/f,ya=(e[2][0]-x[0])/f,Ua=-(e[2][1]-x[1])/f,e=b[0][0],b=b[0][1],g=g-e,h=h-b,l=l-e,m=m-b;a:{g=[[g,h,0,0,u-a],[l,m,0,0,ya-a],[0,0,g,h,H-n],[0,0,l,m,Ua-n]];h=g.length;for(l=0;l<h;l++){for(var m=l,Xa=Math.abs(g[l][l]),Va=l+1;Va<h;Va++){var Aa=Math.abs(g[Va][l]);Aa>Xa&&(Xa=Aa,m=Va)}if(0===Xa){g=null;break a}Xa=g[m];g[m]=g[l];g[l]=Xa;for(m=l+1;m<h;m++)for(Xa=-g[m][l]/g[l][l],Va=l;Va<h+1;Va++)g[m][Va]=l==Va?0:g[m][Va]+Xa*g[l][Va]}l=Array(h);
for(m=h-1;0<=m;m--)for(l[m]=g[m][h]/g[m][m],Xa=m-1;0<=Xa;Xa--)g[Xa][h]-=g[Xa][m]*l[m];g=l}g&&(p.save(),p.beginPath(),ok?(l=(a+u+ya)/3,m=(n+H+Ua)/3,h=uk(l,m,a,n),u=uk(l,m,u,H),ya=uk(l,m,ya,Ua),p.moveTo(h[0],h[1]),p.lineTo(u[0],u[1]),p.lineTo(ya[0],ya[1])):(p.moveTo(a,n),p.lineTo(u,H),p.lineTo(ya,Ua)),p.closePath(),p.clip(),p.transform(g[0],g[2],g[1],g[3],a,n),p.translate(q[0]-e,q[3]-b),p.scale(d/c,-d/c),p.drawImage(r.canvas,0,0),p.restore())});n&&(p.save(),p.strokeStyle="black",p.lineWidth=1,h.f.forEach(function(a){var b=
a.target;a=(b[0][0]-x[0])/f;var c=-(b[0][1]-x[1])/f,d=(b[1][0]-x[0])/f,e=-(b[1][1]-x[1])/f,g=(b[2][0]-x[0])/f,b=-(b[2][1]-x[1])/f;p.beginPath();p.moveTo(a,c);p.lineTo(d,e);p.lineTo(g,b);p.closePath();p.stroke()}),p.restore());return p.canvas};function wk(a,b,c,d,e){this.g=a;this.c=b;var f={},g=Pc(this.c,this.g);this.a=function(a){var b=a[0]+"/"+a[1];f[b]||(f[b]=g(a));return f[b]};this.i=d;this.s=e*e;this.f=[];this.o=!1;this.j=this.g.a&&!!d&&!!this.g.H()&&ic(d)==ic(this.g.H());this.b=this.g.H()?ic(this.g.H()):null;this.l=this.c.H()?ic(this.c.H()):null;a=fc(c);b=ec(c);d=dc(c);c=cc(c);e=this.a(a);var h=this.a(b),l=this.a(d),m=this.a(c);xk(this,a,b,d,c,e,h,l,m,10);if(this.o){var n=Infinity;this.f.forEach(function(a){n=Math.min(n,a.source[0][0],
a.source[1][0],a.source[2][0])});this.f.forEach(function(a){if(Math.max(a.source[0][0],a.source[1][0],a.source[2][0])-n>this.b/2){var b=[[a.source[0][0],a.source[0][1]],[a.source[1][0],a.source[1][1]],[a.source[2][0],a.source[2][1]]];b[0][0]-n>this.b/2&&(b[0][0]-=this.b);b[1][0]-n>this.b/2&&(b[1][0]-=this.b);b[2][0]-n>this.b/2&&(b[2][0]-=this.b);Math.max(b[0][0],b[1][0],b[2][0])-Math.min(b[0][0],b[1][0],b[2][0])<this.b/2&&(a.source=b)}},this)}f={}}
function xk(a,b,c,d,e,f,g,h,l,m){var n=Kb([f,g,h,l]),p=a.b?ic(n)/a.b:null,q=a.g.a&&.5<p&&1>p,r=!1;if(0<m){if(a.c.g&&a.l)var u=Kb([b,c,d,e]),r=r|.25<ic(u)/a.l;!q&&a.g.g&&p&&(r|=.25<p)}if(r||!a.i||nc(n,a.i)){if(!(r||isFinite(f[0])&&isFinite(f[1])&&isFinite(g[0])&&isFinite(g[1])&&isFinite(h[0])&&isFinite(h[1])&&isFinite(l[0])&&isFinite(l[1])))if(0<m)r=!0;else return;if(0<m&&(r||(p=a.a([(b[0]+d[0])/2,(b[1]+d[1])/2]),n=q?(xa(f[0],a.b)+xa(h[0],a.b))/2-xa(p[0],a.b):(f[0]+h[0])/2-p[0],p=(f[1]+h[1])/2-p[1],
r=n*n+p*p>a.s),r)){Math.abs(b[0]-d[0])<=Math.abs(b[1]-d[1])?(q=[(c[0]+d[0])/2,(c[1]+d[1])/2],n=a.a(q),p=[(e[0]+b[0])/2,(e[1]+b[1])/2],r=a.a(p),xk(a,b,c,q,p,f,g,n,r,m-1),xk(a,p,q,d,e,r,n,h,l,m-1)):(q=[(b[0]+c[0])/2,(b[1]+c[1])/2],n=a.a(q),p=[(d[0]+e[0])/2,(d[1]+e[1])/2],r=a.a(p),xk(a,b,q,p,e,f,n,r,l,m-1),xk(a,q,c,d,p,n,g,h,r,m-1));return}if(q){if(!a.j)return;a.o=!0}a.f.push({source:[f,h,l],target:[b,d,e]});a.f.push({source:[f,g,h],target:[b,c,d]})}}
function yk(a){var b=Lb();a.f.forEach(function(a){a=a.source;Mb(b,a[0]);Mb(b,a[1]);Mb(b,a[2])});return b};function zk(a,b,c,d,e,f){this.v=b;this.s=a.H();var g=b.H(),h=g?mc(c,g):c,g=tk(a,b,kc(h),d);this.o=new wk(a,b,h,this.s,.5*g);this.c=d;this.g=c;a=yk(this.o);this.j=(this.ob=f(a,g,e))?this.ob.f:1;this.Ad=this.i=null;e=2;f=[];this.ob&&(e=0,f=this.ob.l);oh.call(this,c,d,this.j,e,f)}y(zk,oh);zk.prototype.ka=function(){1==this.state&&(Ka(this.Ad),this.Ad=null);oh.prototype.ka.call(this)};zk.prototype.a=function(){return this.i};
zk.prototype.zd=function(){var a=this.ob.V();2==a&&(this.i=vk(ic(this.g)/this.c,jc(this.g)/this.c,this.j,this.ob.$(),0,this.c,this.g,this.o,[{extent:this.ob.H(),image:this.ob.a()}],0));this.state=a;ph(this)};zk.prototype.load=function(){if(0==this.state){this.state=1;ph(this);var a=this.ob.V();2==a||3==a?this.zd():(this.Ad=B(this.ob,"change",function(){var a=this.ob.V();if(2==a||3==a)Ka(this.Ad),this.Ad=null,this.zd()},this),this.ob.load())}};function Ak(a){jf.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,state:a.state});this.C=void 0!==a.resolutions?a.resolutions:null;this.a=null;this.qa=0}y(Ak,jf);function Bk(a,b){if(a.C){var c=kb(a.C,b,0);b=a.C[c]}return b}
Ak.prototype.A=function(a,b,c,d){var e=this.f;if(e&&d&&!Oc(e,d)){if(this.a){if(this.qa==this.g&&Oc(this.a.v,d)&&this.a.$()==b&&this.a.f==c&&$b(this.a.H(),a))return this.a;Ta(this.a);this.a=null}this.a=new zk(e,d,a,b,c,function(a,b,c){return this.Mc(a,b,c,e)}.bind(this));this.qa=this.g;return this.a}e&&(d=e);return this.Mc(a,b,c,d)};Ak.prototype.o=function(a){a=a.target;switch(a.V()){case 1:this.b(new Ck(Dk,a));break;case 2:this.b(new Ck(Ek,a));break;case 3:this.b(new Ck(Fk,a))}};
function Gk(a,b){a.a().src=b}function Ck(a,b){Wa.call(this,a);this.image=b}y(Ck,Wa);var Dk="imageloadstart",Ek="imageloadend",Fk="imageloaderror";function Hk(a){Ak.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions,state:a.state});this.ia=a.canvasFunction;this.T=null;this.Y=0;this.ta=void 0!==a.ratio?a.ratio:1.5}y(Hk,Ak);Hk.prototype.Mc=function(a,b,c,d){b=Bk(this,b);var e=this.T;if(e&&this.Y==this.g&&e.$()==b&&e.f==c&&Ub(e.H(),a))return e;a=a.slice();oc(a,this.ta);(d=this.ia(a,b,c,[ic(a)/b*c,jc(a)/b*c],d))&&(e=new nk(a,b,c,this.l,d));this.T=e;this.Y=this.g;return e};function Ik(a){eb.call(this);this.i=void 0;this.a="geometry";this.c=null;this.l=void 0;this.f=null;B(this,gb(this.a),this.be,this);void 0!==a&&(a instanceof Tc||!a?this.Ua(a):this.G(a))}y(Ik,eb);k=Ik.prototype;k.clone=function(){var a=new Ik(this.O());a.Ec(this.a);var b=this.W();b&&a.Ua(b.clone());(b=this.c)&&a.sf(b);return a};k.W=function(){return this.get(this.a)};k.Xa=function(){return this.i};k.$j=function(){return this.a};k.Jl=function(){return this.c};k.ec=function(){return this.l};k.Kl=function(){this.u()};
k.be=function(){this.f&&(Ka(this.f),this.f=null);var a=this.W();a&&(this.f=B(a,"change",this.Kl,this));this.u()};k.Ua=function(a){this.set(this.a,a)};k.sf=function(a){this.l=(this.c=a)?Jk(a):void 0;this.u()};k.mc=function(a){this.i=a;this.u()};k.Ec=function(a){Qa(this,gb(this.a),this.be,this);this.a=a;B(this,gb(this.a),this.be,this);this.be()};function Jk(a){if("function"!==typeof a){var b;b=Array.isArray(a)?a:[a];a=function(){return b}}return a};function Kk(a,b,c,d,e){df.call(this,a,b);this.g=Oe();this.l=d;this.c=null;this.f={gd:!1,Tf:null,bi:-1,Uf:-1,yd:null,ui:[]};this.v=e;this.j=c}y(Kk,df);k=Kk.prototype;k.$a=function(){return-1==this.f.Uf?null:this.g.canvas};k.Ul=function(){return this.l};k.ib=function(){return this.j};k.load=function(){0==this.state&&(this.state=1,ef(this),this.v(this,this.j),this.s(null,NaN,null))};k.gi=function(a){this.c=a;this.state=2;ef(this)};k.vf=function(a){this.o=a};k.ki=function(a){this.s=a};var Lk=document.implementation.createDocument("","",null);function Mk(a,b){return Lk.createElementNS(a,b)}function Nk(a,b){return Ok(a,b,[]).join("")}function Ok(a,b,c){if(a.nodeType==Node.CDATA_SECTION_NODE||a.nodeType==Node.TEXT_NODE)b?c.push(String(a.nodeValue).replace(/(\r\n|\r|\n)/g,"")):c.push(a.nodeValue);else for(a=a.firstChild;a;a=a.nextSibling)Ok(a,b,c);return c}function Pk(a){return a instanceof Document}function Qk(a){return a instanceof Node}
function Rk(a){return(new DOMParser).parseFromString(a,"application/xml")}function Sk(a,b){return function(c,d){var e=a.call(b,c,d);void 0!==e&&mb(d[d.length-1],e)}}function Tk(a,b){return function(c,d){var e=a.call(void 0!==b?b:this,c,d);void 0!==e&&d[d.length-1].push(e)}}function Uk(a,b){return function(c,d){var e=a.call(void 0!==b?b:this,c,d);void 0!==e&&(d[d.length-1]=e)}}
function Vk(a){return function(b,c){var d=a.call(this,b,c);if(void 0!==d){var e=c[c.length-1],f=b.localName,g;f in e?g=e[f]:g=e[f]=[];g.push(d)}}}function J(a,b){return function(c,d){var e=a.call(this,c,d);void 0!==e&&(d[d.length-1][void 0!==b?b:c.localName]=e)}}function L(a,b){return function(c,d,e){a.call(void 0!==b?b:this,c,d,e);e[e.length-1].node.appendChild(c)}}
function Wk(a){var b,c;return function(d,e,f){if(!b){b={};var g={};g[d.localName]=a;b[d.namespaceURI]=g;c=Xk(d.localName)}Yk(b,c,e,f)}}function Xk(a,b){return function(c,d,e){c=d[d.length-1].node;d=a;void 0===d&&(d=e);e=b;void 0===b&&(e=c.namespaceURI);return Mk(e,d)}}var Zk=Xk();function $k(a,b){for(var c=b.length,d=Array(c),e=0;e<c;++e)d[e]=a[b[e]];return d}function M(a,b,c){c=void 0!==c?c:{};var d,e;d=0;for(e=a.length;d<e;++d)c[a[d]]=b;return c}
function al(a,b,c,d){for(b=b.firstElementChild;b;b=b.nextElementSibling){var e=a[b.namespaceURI];void 0!==e&&(e=e[b.localName])&&e.call(d,b,c)}}function O(a,b,c,d,e){d.push(a);al(b,c,d,e);return d.pop()}function Yk(a,b,c,d,e,f){for(var g=(void 0!==e?e:c).length,h,l,m=0;m<g;++m)h=c[m],void 0!==h&&(l=b.call(f,h,d,void 0!==e?e[m]:void 0),void 0!==l&&a[l.namespaceURI][l.localName].call(f,l,h,d))}function bl(a,b,c,d,e,f,g){e.push(a);Yk(b,c,d,e,f,g);e.pop()};function cl(a,b,c,d){return function(e,f,g){var h=new XMLHttpRequest;h.open("GET","function"===typeof a?a(e,f,g):a,!0);"arraybuffer"==b.X()&&(h.responseType="arraybuffer");h.onload=function(){if(200<=h.status&&300>h.status){var a=b.X(),e;"json"==a||"text"==a?e=h.responseText:"xml"==a?(e=h.responseXML)||(e=Rk(h.responseText)):"arraybuffer"==a&&(e=h.response);e&&c.call(this,b.Fa(e,{featureProjection:g}),b.Oa(e))}else d.call(this)}.bind(this);h.send()}}
function dl(a,b){return cl(a,b,function(a,b){this.vf(b);this.gi(a)},function(){this.state=3;ef(this)})}function el(a,b){return cl(a,b,function(a){this.Jc(a)},na)};function fl(){return[[-Infinity,-Infinity,Infinity,Infinity]]};var gl,hl,il,jl;
(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Tp=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b){function f(a,b,d,e,q){d=d||0;e=e||a.length-1;for(q=q||h;e>d;){if(600<e-d){var r=e-d+1,u=b-d+1,x=Math.log(r),v=.5*Math.exp(2*x/3),x=.5*Math.sqrt(x*v*(r-v)/r)*(0>u-r/2?-1:1);f(a,b,Math.max(d,Math.floor(b-u*v/r+x)),Math.min(e,Math.floor(b+(r-u)*v/r+x)),q)}r=a[b];u=d;v=e;g(a,d,b);for(0<q(a[e],r)&&g(a,d,e);u<v;){g(a,u,v);u++;for(v--;0>q(a[u],r);)u++;
for(;0<q(a[v],r);)v--}0===q(a[d],r)?g(a,d,v):(v++,g(a,v,e));v<=b&&(d=v+1);b<=v&&(e=v-1)}}function g(a,b,d){var e=a[b];a[b]=a[d];a[d]=e}function h(a,b){return a<b?-1:a>b?1:0}b.ja=f},{}],2:[function(a,b){function f(a,b){if(!(this instanceof f))return new f(a,b);this.Te=Math.max(4,a||9);this.hg=Math.max(2,Math.ceil(.4*this.Te));b&&this.mj(b);this.clear()}function g(a,b){h(a,0,a.children.length,b,a)}function h(a,b,d,e,f){f||(f=x(null));f.ca=Infinity;f.fa=Infinity;f.ea=-Infinity;f.ga=-Infinity;for(var g;b<
d;b++)g=a.children[b],l(f,a.Ta?e(g):g);return f}function l(a,b){a.ca=Math.min(a.ca,b.ca);a.fa=Math.min(a.fa,b.fa);a.ea=Math.max(a.ea,b.ea);a.ga=Math.max(a.ga,b.ga)}function m(a,b){return a.ca-b.ca}function n(a,b){return a.fa-b.fa}function p(a){return(a.ea-a.ca)*(a.ga-a.fa)}function q(a){return a.ea-a.ca+(a.ga-a.fa)}function r(a,b){return a.ca<=b.ca&&a.fa<=b.fa&&b.ea<=a.ea&&b.ga<=a.ga}function u(a,b){return b.ca<=a.ea&&b.fa<=a.ga&&b.ea>=a.ca&&b.ga>=a.fa}function x(a){return{children:a,height:1,Ta:!0,
ca:Infinity,fa:Infinity,ea:-Infinity,ga:-Infinity}}function v(a,b,d,e,f){for(var g=[b,d],h;g.length;)d=g.pop(),b=g.pop(),d-b<=e||(h=b+Math.ceil((d-b)/e/2)*e,D(a,h,b,d,f),g.push(b,h,h,d))}b.ja=f;var D=a("quickselect");f.prototype={all:function(){return this.cg(this.data,[])},search:function(a){var b=this.data,d=[],e=this.lb;if(!u(a,b))return d;for(var f=[],g,h,l,m;b;){g=0;for(h=b.children.length;g<h;g++)l=b.children[g],m=b.Ta?e(l):l,u(a,m)&&(b.Ta?d.push(l):r(a,m)?this.cg(l,d):f.push(l));b=f.pop()}return d},
load:function(a){if(!a||!a.length)return this;if(a.length<this.hg){for(var b=0,d=a.length;b<d;b++)this.Ca(a[b]);return this}a=this.eg(a.slice(),0,a.length-1,0);this.data.children.length?this.data.height===a.height?this.jg(this.data,a):(this.data.height<a.height&&(b=this.data,this.data=a,a=b),this.gg(a,this.data.height-a.height-1,!0)):this.data=a;return this},Ca:function(a){a&&this.gg(a,this.data.height-1);return this},clear:function(){this.data=x([]);return this},remove:function(a,b){if(!a)return this;
for(var d=this.data,e=this.lb(a),f=[],g=[],h,l,m,n;d||f.length;){d||(d=f.pop(),l=f[f.length-1],h=g.pop(),n=!0);if(d.Ta){a:{m=a;var p=d.children,q=b;if(q){for(var u=0;u<p.length;u++)if(q(m,p[u])){m=u;break a}m=-1}else m=p.indexOf(m)}if(-1!==m){d.children.splice(m,1);f.push(d);this.kj(f);break}}n||d.Ta||!r(d,e)?l?(h++,d=l.children[h],n=!1):d=null:(f.push(d),g.push(h),h=0,l=d,d=d.children[0])}return this},lb:function(a){return a},Ve:m,We:n,toJSON:function(){return this.data},cg:function(a,b){for(var d=
[];a;)a.Ta?b.push.apply(b,a.children):d.push.apply(d,a.children),a=d.pop();return b},eg:function(a,b,d,e){var f=d-b+1,h=this.Te,l;if(f<=h)return l=x(a.slice(b,d+1)),g(l,this.lb),l;e||(e=Math.ceil(Math.log(f)/Math.log(h)),h=Math.ceil(f/Math.pow(h,e-1)));l=x([]);l.Ta=!1;l.height=e;var f=Math.ceil(f/h),h=f*Math.ceil(Math.sqrt(h)),m,n,p;for(v(a,b,d,h,this.Ve);b<=d;b+=h)for(n=Math.min(b+h-1,d),v(a,b,n,f,this.We),m=b;m<=n;m+=f)p=Math.min(m+f-1,n),l.children.push(this.eg(a,m,p,e-1));g(l,this.lb);return l},
jj:function(a,b,d,e){for(var f,g,h,l,m,n,q,r;;){e.push(b);if(b.Ta||e.length-1===d)break;q=r=Infinity;f=0;for(g=b.children.length;f<g;f++)h=b.children[f],m=p(h),n=(Math.max(h.ea,a.ea)-Math.min(h.ca,a.ca))*(Math.max(h.ga,a.ga)-Math.min(h.fa,a.fa))-m,n<r?(r=n,q=m<q?m:q,l=h):n===r&&m<q&&(q=m,l=h);b=l||b.children[0]}return b},gg:function(a,b,d){var e=this.lb;d=d?a:e(a);var e=[],f=this.jj(d,this.data,b,e);f.children.push(a);for(l(f,d);0<=b;)if(e[b].children.length>this.Te)this.sj(e,b),b--;else break;this.gj(d,
e,b)},sj:function(a,b){var d=a[b],e=d.children.length,f=this.hg;this.hj(d,f,e);e=this.ij(d,f,e);e=x(d.children.splice(e,d.children.length-e));e.height=d.height;e.Ta=d.Ta;g(d,this.lb);g(e,this.lb);b?a[b-1].children.push(e):this.jg(d,e)},jg:function(a,b){this.data=x([a,b]);this.data.height=a.height+1;this.data.Ta=!1;g(this.data,this.lb)},ij:function(a,b,d){var e,f,g,l,m,n,q;m=n=Infinity;for(e=b;e<=d-b;e++)f=h(a,0,e,this.lb),g=h(a,e,d,this.lb),l=Math.max(0,Math.min(f.ea,g.ea)-Math.max(f.ca,g.ca))*Math.max(0,
Math.min(f.ga,g.ga)-Math.max(f.fa,g.fa)),f=p(f)+p(g),l<m?(m=l,q=e,n=f<n?f:n):l===m&&f<n&&(n=f,q=e);return q},hj:function(a,b,d){var e=a.Ta?this.Ve:m,f=a.Ta?this.We:n,g=this.dg(a,b,d,e);b=this.dg(a,b,d,f);g<b&&a.children.sort(e)},dg:function(a,b,d,e){a.children.sort(e);e=this.lb;var f=h(a,0,b,e),g=h(a,d-b,d,e),m=q(f)+q(g),n,p;for(n=b;n<d-b;n++)p=a.children[n],l(f,a.Ta?e(p):p),m+=q(f);for(n=d-b-1;n>=b;n--)p=a.children[n],l(g,a.Ta?e(p):p),m+=q(g);return m},gj:function(a,b,d){for(;0<=d;d--)l(b[d],a)},
kj:function(a){for(var b=a.length-1,d;0<=b;b--)0===a[b].children.length?0<b?(d=a[b-1].children,d.splice(d.indexOf(a[b]),1)):this.clear():g(a[b],this.lb)},mj:function(a){var b=["return a"," - b",";"];this.Ve=new Function("a","b",b.join(a[0]));this.We=new Function("a","b",b.join(a[1]));this.lb=new Function("a","return {minX: a"+a[0]+", minY: a"+a[1]+", maxX: a"+a[2]+", maxY: a"+a[3]+"};")}}},{quickselect:1}]},{},[2])(2)});gl=b.ja})();function kl(a){this.a=gl(a);this.b={}}k=kl.prototype;k.Ca=function(a,b){var c={ca:a[0],fa:a[1],ea:a[2],ga:a[3],value:b};this.a.Ca(c);this.b[w(b)]=c};k.load=function(a,b){for(var c=Array(b.length),d=0,e=b.length;d<e;d++){var f=a[d],g=b[d],f={ca:f[0],fa:f[1],ea:f[2],ga:f[3],value:g};c[d]=f;this.b[w(g)]=f}this.a.load(c)};k.remove=function(a){a=w(a);var b=this.b[a];delete this.b[a];return null!==this.a.remove(b)};
function ll(a,b,c){var d=w(c),d=a.b[d];$b([d.ca,d.fa,d.ea,d.ga],b)||(a.remove(c),a.Ca(b,c))}function ml(a){return a.a.all().map(function(a){return a.value})}function nl(a,b){return a.a.search({ca:b[0],fa:b[1],ea:b[2],ga:b[3]}).map(function(a){return a.value})}k.forEach=function(a,b){return pl(ml(this),a,b)};function ql(a,b,c,d){return pl(nl(a,b),c,d)}function pl(a,b,c){for(var d,e=0,f=a.length;e<f&&!(d=b.call(c,a[e]));e++);return d}k.Ya=function(){return Ha(this.b)};
k.clear=function(){this.a.clear();this.b={}};k.H=function(){var a=this.a.data;return[a.ca,a.fa,a.ea,a.ga]};function P(a){a=a||{};jf.call(this,{attributions:a.attributions,logo:a.logo,projection:void 0,state:"ready",wrapX:void 0!==a.wrapX?a.wrapX:!0});this.S=na;this.qa=a.format;this.T=a.url;void 0!==a.loader?this.S=a.loader:void 0!==this.T&&(this.S=el(this.T,this.qa));this.qb=void 0!==a.strategy?a.strategy:fl;var b=void 0!==a.useSpatialIndex?a.useSpatialIndex:!0;this.a=b?new kl:null;this.Y=new kl;this.i={};this.o={};this.j={};this.s={};this.c=null;var c,d;a.features instanceof le?(c=a.features,d=c.a):Array.isArray(a.features)&&
(d=a.features);b||void 0!==c||(c=new le(d));void 0!==d&&rl(this,d);void 0!==c&&sl(this,c)}y(P,jf);k=P.prototype;k.rb=function(a){var b=w(a).toString();if(tl(this,b,a)){ul(this,b,a);var c=a.W();c?(b=c.H(),this.a&&this.a.Ca(b,a)):this.i[b]=a;this.b(new vl("addfeature",a))}this.u()};function ul(a,b,c){a.s[b]=[B(c,"change",a.Eh,a),B(c,"propertychange",a.Eh,a)]}function tl(a,b,c){var d=!0,e=c.Xa();void 0!==e?e.toString()in a.o?d=!1:a.o[e.toString()]=c:a.j[b]=c;return d}k.Jc=function(a){rl(this,a);this.u()};
function rl(a,b){var c,d,e,f,g=[],h=[],l=[];d=0;for(e=b.length;d<e;d++)f=b[d],c=w(f).toString(),tl(a,c,f)&&h.push(f);d=0;for(e=h.length;d<e;d++){f=h[d];c=w(f).toString();ul(a,c,f);var m=f.W();m?(c=m.H(),g.push(c),l.push(f)):a.i[c]=f}a.a&&a.a.load(g,l);d=0;for(e=h.length;d<e;d++)a.b(new vl("addfeature",h[d]))}
function sl(a,b){var c=!1;B(a,"addfeature",function(a){c||(c=!0,b.push(a.feature),c=!1)});B(a,"removefeature",function(a){c||(c=!0,b.remove(a.feature),c=!1)});B(b,"add",function(a){c||(a=a.element,c=!0,this.rb(a),c=!1)},a);B(b,"remove",function(a){c||(a=a.element,c=!0,this.nb(a),c=!1)},a);a.c=b}
k.clear=function(a){if(a){for(var b in this.s)this.s[b].forEach(Ka);this.c||(this.s={},this.o={},this.j={})}else if(this.a){this.a.forEach(this.Sf,this);for(var c in this.i)this.Sf(this.i[c])}this.c&&this.c.clear();this.a&&this.a.clear();this.Y.clear();this.i={};this.b(new vl("clear"));this.u()};k.wg=function(a,b){if(this.a)return this.a.forEach(a,b);if(this.c)return this.c.forEach(a,b)};function wl(a,b,c){a.ub([b[0],b[1],b[0],b[1]],function(a){if(a.W().sg(b))return c.call(void 0,a)})}
k.ub=function(a,b,c){if(this.a)return ql(this.a,a,b,c);if(this.c)return this.c.forEach(b,c)};k.xg=function(a,b,c){return this.ub(a,function(d){if(d.W().Ka(a)&&(d=b.call(c,d)))return d})};k.Fg=function(){return this.c};k.oe=function(){var a;this.c?a=this.c.a:this.a&&(a=ml(this.a),Ha(this.i)||mb(a,Ga(this.i)));return a};k.Eg=function(a){var b=[];wl(this,a,function(a){b.push(a)});return b};k.ef=function(a){return nl(this.a,a)};
k.Ag=function(a,b){var c=a[0],d=a[1],e=null,f=[NaN,NaN],g=Infinity,h=[-Infinity,-Infinity,Infinity,Infinity],l=b?b:qc;ql(this.a,h,function(a){if(l(a)){var b=a.W(),p=g;g=b.sb(c,d,f,g);g<p&&(e=a,a=Math.sqrt(g),h[0]=c-a,h[1]=d-a,h[2]=c+a,h[3]=d+a)}});return e};k.H=function(){return this.a.H()};k.Dg=function(a){a=this.o[a.toString()];return void 0!==a?a:null};k.Ch=function(){return this.qa};k.Dh=function(){return this.T};
k.Eh=function(a){a=a.target;var b=w(a).toString(),c=a.W();c?(c=c.H(),b in this.i?(delete this.i[b],this.a&&this.a.Ca(c,a)):this.a&&ll(this.a,c,a)):b in this.i||(this.a&&this.a.remove(a),this.i[b]=a);c=a.Xa();void 0!==c?(c=c.toString(),b in this.j?(delete this.j[b],this.o[c]=a):this.o[c]!==a&&(xl(this,a),this.o[c]=a)):b in this.j||(xl(this,a),this.j[b]=a);this.u();this.b(new vl("changefeature",a))};k.Ya=function(){return this.a.Ya()&&Ha(this.i)};
k.Pc=function(a,b,c){var d=this.Y;a=this.qb(a,b);var e,f;e=0;for(f=a.length;e<f;++e){var g=a[e];ql(d,g,function(a){return Ub(a.extent,g)})||(this.S.call(this,g,b,c),d.Ca(g,{extent:g.slice()}))}};k.nb=function(a){var b=w(a).toString();b in this.i?delete this.i[b]:this.a&&this.a.remove(a);this.Sf(a);this.u()};k.Sf=function(a){var b=w(a).toString();this.s[b].forEach(Ka);delete this.s[b];var c=a.Xa();void 0!==c?delete this.o[c.toString()]:delete this.j[b];this.b(new vl("removefeature",a))};
function xl(a,b){for(var c in a.o)if(a.o[c]===b){delete a.o[c];break}}function vl(a,b){Wa.call(this,a);this.feature=b}y(vl,Wa);function yl(a){this.c=a.source;this.Aa=Xc();this.i=Oe();this.j=[0,0];this.v=null;Hk.call(this,{attributions:a.attributions,canvasFunction:this.Dj.bind(this),logo:a.logo,projection:a.projection,ratio:a.ratio,resolutions:a.resolutions,state:this.c.V()});this.S=null;this.s=void 0;this.xh(a.style);B(this.c,"change",this.en,this)}y(yl,Hk);k=yl.prototype;
k.Dj=function(a,b,c,d,e){var f=new dk(.5*b/c,a,b);this.c.Pc(a,b,e);var g=!1;this.c.ub(a,function(a){var d;if(!(d=g)){var e;(d=a.ec())?e=d.call(a,b):this.s&&(e=this.s(a,b));if(e){var n,p=!1;Array.isArray(e)||(e=[e]);d=0;for(n=e.length;d<n;++d)p=lk(f,a,e[d],jk(b,c),this.dn,this)||p;d=p}else d=!1}g=d},this);ek(f);if(g)return null;this.j[0]!=d[0]||this.j[1]!=d[1]?(this.i.canvas.width=d[0],this.i.canvas.height=d[1],this.j[0]=d[0],this.j[1]=d[1]):this.i.clearRect(0,0,d[0],d[1]);a=zl(this,kc(a),b,c,d);f.Pa(this.i,
c,a,0,{});this.v=f;return this.i.canvas};k.ra=function(a,b,c,d,e){if(this.v){var f={};return this.v.ra(a,b,0,d,function(a){var b=w(a).toString();if(!(b in f))return f[b]=!0,e(a)})}};k.an=function(){return this.c};k.bn=function(){return this.S};k.cn=function(){return this.s};function zl(a,b,c,d,e){return qh(a.Aa,e[0]/2,e[1]/2,d/c,-d/c,0,-b[0],-b[1])}k.dn=function(){this.u()};k.en=function(){lf(this,this.c.V())};k.xh=function(a){this.S=void 0!==a?a:vj;this.s=a?tj(this.S):void 0;this.u()};function Al(a){Jj.call(this,a);this.f=null;this.s=Xc();this.o=this.c=null}y(Al,Jj);Al.prototype.ra=function(a,b,c,d){var e=this.a;return e.ha().ra(a,b.viewState.resolution,b.viewState.rotation,b.skippedFeatureUids,function(a){return c.call(d,a,e)})};
Al.prototype.Cc=function(a,b,c,d){if(this.f&&this.f.a())if(this.a.ha()instanceof yl){if(a=a.slice(),sh(b.pixelToCoordinateMatrix,a,a),this.ra(a,b,qc,this))return c.call(d,this.a)}else if(this.c||(this.c=Xc(),cd(this.s,this.c)),b=[0,0],sh(this.c,a,b),this.o||(this.o=Oe(1,1)),this.o.clearRect(0,0,1,1),this.o.drawImage(this.f?this.f.a():null,b[0],b[1],1,1,0,0,1,1),0<this.o.getImageData(0,0,1,1).data[3])return c.call(d,this.a)};
Al.prototype.l=function(a,b){var c=a.pixelRatio,d=a.viewState,e=d.center,f=d.resolution,g=this.a.ha(),h=a.viewHints,l=a.extent;void 0!==b.extent&&(l=mc(l,b.extent));h[0]||h[1]||hc(l)||(d=g.A(l,f,c,d.projection))&&vh(this,d)&&(this.f=d);if(this.f){var d=this.f,h=d.H(),l=d.$(),m=d.f,f=c*l/(f*m);qh(this.s,c*a.size[0]/2,c*a.size[1]/2,f,f,0,m*(h[0]-e[0])/l,m*(e[1]-h[3])/l);this.c=null;xh(a.attributions,d.l);yh(a,g)}return!!this.f};function Bl(a){Jj.call(this,a);this.c=Oe();this.o=null;this.j=Lb();this.S=[0,0,0];this.D=Xc();this.C=0}y(Bl,Jj);Bl.prototype.i=function(a,b,c){var d=Mj(this,a,0);Kj(this,"precompose",c,a,d);Cl(this,c,a,b);Lj(this,c,a,d)};
Bl.prototype.l=function(a,b){function c(a){a=a.V();return 2==a||4==a||3==a&&!r}var d=a.pixelRatio,e=a.viewState,f=e.projection,g=this.a,h=g.ha(),l=h.eb(f),m=l.Lb(e.resolution,this.C),n=l.$(m),p=e.center;n==e.resolution?(p=Ah(p,n,a.size),e=lc(p,n,e.rotation,a.size)):e=a.extent;void 0!==b.extent&&(e=mc(e,b.extent));if(hc(e))return!1;n=sf(l,e,n);p={};p[m]={};var q=this.Qd(h,f,p),r=g.c(),u=Lb(),x=new fe(0,0,0,0),v,D,A,z;for(A=n.ca;A<=n.ea;++A)for(z=n.fa;z<=n.ga;++z)v=h.ac(m,A,z,d,f),!c(v)&&v.a&&(v=v.a),
c(v)?p[m][v.ma.toString()]=v:(D=qf(l,v.ma,q,x,u),D||(v=rf(l,v.ma,x,u))&&q(m+1,v));q=Object.keys(p).map(Number);q.sort(ib);var u=[],F,x=0;for(A=q.length;x<A;++x)for(F in v=q[x],z=p[v],z)v=z[F],2==v.V()&&u.push(v);this.o=u;zh(a.usedTiles,h,m,n);Bh(a,h,l,d,f,e,m,g.f());wh(a,h);yh(a,h);return!0};Bl.prototype.Cc=function(a,b,c,d){var e=this.c.canvas,f=b.size;e.width=f[0];e.height=f[1];this.i(b,jh(this.a),this.c);if(0<this.c.getImageData(a[0],a[1],1,1).data[3])return c.call(d,this.a)};
function Cl(a,b,c,d){var e=c.pixelRatio,f=c.viewState,g=f.center,h=f.projection,l=f.resolution,f=f.rotation,m=c.size,n=Math.round(e*m[0]/2),p=Math.round(e*m[1]/2),m=e/l,q=a.a,r=q.ha(),u=r.Ud(h),x=r.eb(h),q=ab(q,"render"),v=b,D,A,z,F;if(f||q)v=a.c,D=v.canvas,F=x.Lb(l),z=r.$d(F,e,h),F=hf(x.Ja(F)),z=z[0]/F[0],l=b.canvas.width*z,A=b.canvas.height*z,F=Math.round(Math.sqrt(l*l+A*A)),D.width!=F?D.width=D.height=F:v.clearRect(0,0,F,F),D=(F-l)/2/z,A=(F-A)/2/z,m*=z,n=Math.round(z*(n+D)),p=Math.round(z*(p+A));
l=v.globalAlpha;v.globalAlpha=d.opacity;var N=a.o,K,X=r.jf(h)&&1==d.opacity;X||(N.reverse(),K=[]);var oa=d.extent;if(d=void 0!==oa){var H=fc(oa),ya=ec(oa),Ua=dc(oa),oa=cc(oa);sh(c.coordinateToPixelMatrix,H,H);sh(c.coordinateToPixelMatrix,ya,ya);sh(c.coordinateToPixelMatrix,Ua,Ua);sh(c.coordinateToPixelMatrix,oa,oa);var Xa=D||0,Va=A||0;v.save();var Aa=v.canvas.width*e/2,Qb=v.canvas.height*e/2;hj(v,-f,Aa,Qb);v.beginPath();v.moveTo(H[0]*e+Xa,H[1]*e+Va);v.lineTo(ya[0]*e+Xa,ya[1]*e+Va);v.lineTo(Ua[0]*
e+Xa,Ua[1]*e+Va);v.lineTo(oa[0]*e+Xa,oa[1]*e+Va);v.clip();hj(v,f,Aa,Qb)}H=0;for(ya=N.length;H<ya;++H){var Ua=N[H],oa=Ua.ma,Qb=x.Ea(oa,a.j),Aa=oa[0],Nb=cc(x.Ea(x.qd(g,Aa,a.S))),oa=Math.round(ic(Qb)*m),Xa=Math.round(jc(Qb)*m),Va=Math.round((Qb[0]-Nb[0])*m/oa)*oa+n+Math.round((Nb[0]-g[0])*m),Qb=Math.round((Nb[1]-Qb[3])*m/Xa)*Xa+p+Math.round((g[1]-Nb[1])*m);if(!X){Nb=[Va,Qb,Va+oa,Qb+Xa];v.save();for(var kk=0,vs=K.length;kk<vs;++kk){var De=K[kk];nc(Nb,De)&&(v.beginPath(),v.moveTo(Nb[0],Nb[1]),v.lineTo(Nb[0],
Nb[3]),v.lineTo(Nb[2],Nb[3]),v.lineTo(Nb[2],Nb[1]),v.moveTo(De[0],De[1]),v.lineTo(De[2],De[1]),v.lineTo(De[2],De[3]),v.lineTo(De[0],De[3]),v.closePath(),v.clip())}K.push(Nb)}Aa=r.$d(Aa,e,h);v.drawImage(Ua.$a(),u,u,Aa[0],Aa[1],Va,Qb,oa,Xa);X||v.restore()}d&&v.restore();q&&(e=D-n/z+n,h=A-p/z+p,g=qh(a.D,F/2-e,F/2-h,m,-m,-f,-g[0]+e/m,-g[1]-h/m),Kj(a,"render",v,c,g));(f||q)&&b.drawImage(v.canvas,-Math.round(D),-Math.round(A),F/z,F/z);v.globalAlpha=l};function Dl(a){Jj.call(this,a);this.c=!1;this.C=-1;this.A=NaN;this.v=Lb();this.o=this.U=null;this.j=Oe()}y(Dl,Jj);
Dl.prototype.i=function(a,b,c){var d=a.extent,e=a.pixelRatio,f=b.Qc?a.skippedFeatureUids:{},g=a.viewState,h=g.projection,g=g.rotation,l=h.H(),m=this.a.ha(),n=Mj(this,a,0);Kj(this,"precompose",c,a,n);var p=this.o;if(p&&!p.Ya()){var q;ab(this.a,"render")?(this.j.canvas.width=c.canvas.width,this.j.canvas.height=c.canvas.height,q=this.j):q=c;var r=q.globalAlpha;q.globalAlpha=b.opacity;b=a.size[0]*e;var u=a.size[1]*e;hj(q,-g,b/2,u/2);p.Pa(q,e,n,g,f);if(m.D&&h.a&&!Ub(l,d)){for(var h=d[0],m=ic(l),x=0;h<
l[0];)--x,n=m*x,n=Mj(this,a,n),p.Pa(q,e,n,g,f),h+=m;x=0;for(h=d[2];h>l[2];)++x,n=m*x,n=Mj(this,a,n),p.Pa(q,e,n,g,f),h-=m;n=Mj(this,a,0)}hj(q,g,b/2,u/2);q!=c&&(Kj(this,"render",q,a,n),c.drawImage(q.canvas,0,0));q.globalAlpha=r}Lj(this,c,a,n)};Dl.prototype.ra=function(a,b,c,d){if(this.o){var e=this.a,f={};return this.o.ra(a,b.viewState.resolution,b.viewState.rotation,{},function(a){var b=w(a).toString();if(!(b in f))return f[b]=!0,c.call(d,a,e)})}};Dl.prototype.D=function(){uh(this)};
Dl.prototype.l=function(a){function b(a){var b,d=a.ec();d?b=d.call(a,m):(d=c.i)&&(b=d(a,m));if(b){if(b){d=!1;if(Array.isArray(b))for(var e=0,f=b.length;e<f;++e)d=lk(q,a,b[e],jk(m,n),this.D,this)||d;else d=lk(q,a,b,jk(m,n),this.D,this)||d;a=d}else a=!1;this.c=this.c||a}}var c=this.a,d=c.ha();xh(a.attributions,d.l);yh(a,d);var e=a.viewHints[0],f=a.viewHints[1],g=c.S,h=c.T;if(!this.c&&!g&&e||!h&&f)return!0;var l=a.extent,h=a.viewState,e=h.projection,m=h.resolution,n=a.pixelRatio,f=c.g,p=c.a,g=xj(c);
void 0===g&&(g=ik);l=Ob(l,p*m);p=h.projection.H();d.D&&h.projection.a&&!Ub(p,a.extent)&&(a=Math.max(ic(l)/2,ic(p)),l[0]=p[0]-a,l[2]=p[2]+a);if(!this.c&&this.A==m&&this.C==f&&this.U==g&&Ub(this.v,l))return!0;this.o=null;this.c=!1;var q=new dk(.5*m/n,l,m,c.a);d.Pc(l,m,e);if(g){var r=[];d.ub(l,function(a){r.push(a)},this);r.sort(g);r.forEach(b,this)}else d.ub(l,b,this);ek(q);this.A=m;this.C=f;this.U=g;this.v=l;this.o=q;return!0};function El(a,b){var c=/\{z\}/g,d=/\{x\}/g,e=/\{y\}/g,f=/\{-y\}/g;return function(g){if(g)return a.replace(c,g[0].toString()).replace(d,g[1].toString()).replace(e,function(){return(-g[2]-1).toString()}).replace(f,function(){var a=b.a?b.a[g[0]]:null;return(a.ga-a.fa+1+g[2]).toString()})}}function Fl(a,b){for(var c=a.length,d=Array(c),e=0;e<c;++e)d[e]=El(a[e],b);return Gl(d)}function Gl(a){return 1===a.length?a[0]:function(b,c,d){if(b)return a[xa((b[1]<<b[0])+b[2],a.length)](b,c,d)}}
function Hl(){}function Il(a){var b=[],c=/\{(\d)-(\d)\}/.exec(a)||/\{([a-z])-([a-z])\}/.exec(a);if(c){var d=c[2].charCodeAt(0),e;for(e=c[1].charCodeAt(0);e<=d;++e)b.push(a.replace(c[0],String.fromCharCode(e)))}else b.push(a);return b};function Jl(a){zf.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tilePixelRatio:a.tilePixelRatio,wrapX:a.wrapX});this.tileLoadFunction=a.tileLoadFunction;this.tileUrlFunction=this.vc?this.vc.bind(this):Hl;this.urls=null;a.urls?this.bb(a.urls):a.url&&this.Va(a.url);a.tileUrlFunction&&this.Qa(a.tileUrlFunction)}y(Jl,zf);k=Jl.prototype;k.fb=function(){return this.tileLoadFunction};
k.gb=function(){return this.tileUrlFunction};k.hb=function(){return this.urls};k.Bh=function(a){a=a.target;switch(a.V()){case 1:this.b(new Df("tileloadstart",a));break;case 2:this.b(new Df("tileloadend",a));break;case 3:this.b(new Df("tileloaderror",a))}};k.kb=function(a){this.a.clear();this.tileLoadFunction=a;this.u()};k.Qa=function(a,b){this.tileUrlFunction=a;"undefined"!==typeof b?Bf(this,b):this.u()};
k.Va=function(a){var b=this.urls=Il(a);this.Qa(this.vc?this.vc.bind(this):Fl(b,this.tileGrid),a)};k.bb=function(a){this.urls=a;var b=a.join("\n");this.Qa(this.vc?this.vc.bind(this):Fl(a,this.tileGrid),b)};k.Yf=function(a,b,c){a=this.Eb(a,b,c);Ze(this.a,a)&&this.a.get(a)};function Kl(a){Jl.call(this,{attributions:a.attributions,cacheSize:void 0!==a.cacheSize?a.cacheSize:128,extent:a.extent,logo:a.logo,opaque:!1,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction?a.tileLoadFunction:Ll,tileUrlFunction:a.tileUrlFunction,tilePixelRatio:a.tilePixelRatio,url:a.url,urls:a.urls,wrapX:void 0===a.wrapX?!0:a.wrapX});this.c=a.format?a.format:null;this.tileClass=a.tileClass?a.tileClass:Kk}y(Kl,Jl);
Kl.prototype.ac=function(a,b,c,d,e){var f=this.Eb(a,b,c);if(Ze(this.a,f))return this.a.get(f);a=[a,b,c];d=(b=Cf(this,a,e))?this.tileUrlFunction(b,d,e):void 0;d=new this.tileClass(a,void 0!==d?0:4,void 0!==d?d:"",this.c,this.tileLoadFunction);B(d,"change",this.Bh,this);this.a.set(f,d);return d};Kl.prototype.$d=function(a,b){var c=hf(this.tileGrid.Ja(a));return[c[0]*b,c[1]*b]};function Ll(a,b){a.ki(dl(b,a.l))};var Ml={image:Nj,hybrid:["Polygon","LineString"]},Nl={hybrid:["Image","Text"],vector:Nj};function Ol(a){Bl.call(this,a);this.U=!1;this.v=Xc();this.C="vector"==a.s?1:0}y(Ol,Bl);
Ol.prototype.i=function(a,b,c){var d=Mj(this,a,0);Kj(this,"precompose",c,a,d);var e=this.a.s;"vector"!==e&&Cl(this,c,a,b);if("image"!==e){var f=this.a,e=Nl[f.s],g=a.pixelRatio,h=b.Qc?a.skippedFeatureUids:{},l=a.viewState,m=l.center,n=l.rotation,p=a.size,l=g/l.resolution,q=f.ha(),r=q.bc(g),u=Mj(this,a,0);ab(f,"render")?(this.c.canvas.width=c.canvas.width,this.c.canvas.height=c.canvas.height,f=this.c):f=c;var x=f.globalAlpha;f.globalAlpha=b.opacity;b=this.o;var q=q.tileGrid,v,D,A,z,F,N,K,X;D=0;for(A=
b.length;D<A;++D)z=b[D],K=z.f,F=q.Ea(z.ma,this.j),v=z.ma[0],N="tile-pixels"==z.o.wb(),v=q.$(v),X=v/r,v=Math.round(g*p[0]/2),z=Math.round(g*p[1]/2),N?(F=fc(F),F=qh(this.v,v,z,l*X,l*X,n,(F[0]-m[0])/X,(m[1]-F[1])/X)):F=u,hj(f,-n,v,z),K.yd.Pa(f,g,F,n,h,e),hj(f,n,v,z);f!=c&&(Kj(this,"render",f,a,u),c.drawImage(f.canvas,0,0));f.globalAlpha=x}Lj(this,c,a,d)};
function Pl(a,b,c){function d(a){var b,c=a.ec();c?b=c.call(a,u):(c=e.i)&&(b=c(a,u));if(b){Array.isArray(b)||(b=[b]);var c=D,d=v;if(b){var f=!1;if(Array.isArray(b))for(var g=0,h=b.length;g<h;++g)f=lk(d,a,b[g],c,this.A,this)||f;else f=lk(d,a,b,c,this.A,this)||f;a=f}else a=!1;this.U=this.U||a;l.gd=l.gd||a}}var e=a.a,f=c.pixelRatio;c=c.viewState.projection;var g=e.g,h=xj(e)||null,l=b.f;if(l.gd||l.bi!=g||l.Tf!=h){l.yd=null;l.gd=!1;var m=e.ha(),n=m.tileGrid,p=b.ma,q=b.o,r="tile-pixels"==q.wb(),u=n.$(p[0]),
x;r?(r=m=m.bc(f),n=hf(n.Ja(p[0])),n=[0,0,n[0]*r,n[1]*r]):(m=u,n=n.Ea(p),Oc(c,q)||(x=!0,b.vf(c)));l.gd=!1;var v=new dk(0,n,m,e.a),D=jk(m,f);b=b.c;h&&h!==l.Tf&&b.sort(h);n=0;for(p=b.length;n<p;++n)f=b[n],x&&f.W().jb(q,c),d.call(a,f);ek(v);l.bi=g;l.Tf=h;l.yd=v;l.resolution=NaN}}
Ol.prototype.ra=function(a,b,c,d){var e=b.pixelRatio,f=b.viewState.resolution;b=b.viewState.rotation;var g=this.a,h={},l=this.o,m=g.ha(),n=m.tileGrid,p,q,r,u,x,v;r=0;for(u=l.length;r<u;++r)v=l[r],q=v.ma,x=m.tileGrid.Ea(q,this.j),Sb(x,a)&&("tile-pixels"===v.o.wb()?(x=fc(x),f=m.bc(e),q=n.$(q[0])/f,q=[(a[0]-x[0])/q,(x[1]-a[1])/q]):q=a,v=v.f.yd,p=p||v.ra(q,f,b,{},function(a){var b=w(a).toString();if(!(b in h))return h[b]=!0,c.call(d,a,g)}));return p};Ol.prototype.A=function(){uh(this)};
Ol.prototype.l=function(a,b){var c=Bl.prototype.l.call(this,a,b);if(c)for(var d=Object.keys(a.Ee||{}),e=0,f=this.o.length;e<f;++e){var g=this.o[e];Pl(this,g,a);var h=g,g=a,l=this.a,m=Ml[l.s];if(m){var n=g.pixelRatio,p=h.f,q=l.g;if(!pb(p.ui,d)||p.Uf!==q){p.ui=d;p.Uf=q;var q=h.g,r=l.ha(),u=r.tileGrid,x=h.ma[0],v=u.$(x),l=hf(u.Ja(x)),x=u.$(x),D=x/v,A=l[0]*n*D,z=l[1]*n*D;q.canvas.width=A/D+.5;q.canvas.height=z/D+.5;q.scale(1/D,1/D);q.translate(A/2,z/2);D="tile-pixels"==h.o.wb();v=n/v;r=r.bc(n);x/=r;h=
u.Ea(h.ma,this.j);D?h=qh(this.v,0,0,v*x,v*x,0,-l[0]*r/2,-l[1]*r/2):(h=kc(h),h=qh(this.v,0,0,v,-v,0,-h[0],-h[1]));p.yd.Pa(q,n,h,0,g.skippedFeatureUids||{},m)}}}return c};function Ql(a,b){Hh.call(this,0,b);this.f=Oe();this.b=this.f.canvas;this.b.style.width="100%";this.b.style.height="100%";this.b.className="ol-unselectable";a.insertBefore(this.b,a.childNodes[0]||null);this.a=!0;this.c=Xc()}y(Ql,Hh);Ql.prototype.Xe=function(a){return a instanceof cj?new Al(a):a instanceof dj?new Bl(a):a instanceof I?new Ol(a):a instanceof G?new Dl(a):null};
function Rl(a,b,c){var d=a.i,e=a.f;if(ab(d,b)){var f=c.extent,g=c.pixelRatio,h=c.viewState.rotation,l=c.pixelRatio,m=c.viewState,n=m.resolution;a=qh(a.c,a.b.width/2,a.b.height/2,l/n,-l/n,-m.rotation,-m.center[0],-m.center[1]);f=new yj(e,g,f,a,h);d.b(new lh(b,d,f,c,e,null))}}Ql.prototype.X=function(){return"canvas"};
Ql.prototype.Ce=function(a){if(a){var b=this.f,c=a.pixelRatio,d=Math.round(a.size[0]*c),c=Math.round(a.size[1]*c);this.b.width!=d||this.b.height!=c?(this.b.width=d,this.b.height=c):b.clearRect(0,0,d,c);var e=a.viewState.rotation;Ih(a);Rl(this,"precompose",a);var f=a.layerStatesArray;qb(f);hj(b,e,d/2,c/2);var g=a.viewState.resolution,h,l,m,n;h=0;for(l=f.length;h<l;++h)n=f[h],m=n.layer,m=Kh(this,m),nh(n,g)&&"ready"==n.R&&m.l(a,n)&&m.i(a,n,b);hj(b,-e,d/2,c/2);Rl(this,"postcompose",a);this.a||(this.b.style.display=
"",this.a=!0);Lh(this,a);a.postRenderFunctions.push(Jh)}else this.a&&(this.b.style.display="none",this.a=!1)};function Sl(a,b){th.call(this,a);this.target=b}y(Sl,th);Sl.prototype.Nd=na;Sl.prototype.th=na;function Tl(a){var b=document.createElement("DIV");b.style.position="absolute";Sl.call(this,a,b);this.f=null;this.c=Zc()}y(Tl,Sl);Tl.prototype.ra=function(a,b,c,d){var e=this.a;return e.ha().ra(a,b.viewState.resolution,b.viewState.rotation,b.skippedFeatureUids,function(a){return c.call(d,a,e)})};Tl.prototype.Nd=function(){Ve(this.target);this.f=null};
Tl.prototype.yf=function(a,b){var c=a.viewState,d=c.center,e=c.resolution,f=c.rotation,g=this.f,h=this.a.ha(),l=a.viewHints,m=a.extent;void 0!==b.extent&&(m=mc(m,b.extent));l[0]||l[1]||hc(m)||(c=h.A(m,e,a.pixelRatio,c.projection))&&vh(this,c)&&(g=c);g&&(l=g.H(),m=g.$(),c=Xc(),qh(c,a.size[0]/2,a.size[1]/2,m/e,m/e,f,(l[0]-d[0])/m,(d[1]-l[3])/m),g!=this.f&&(d=g.a(this),d.style.maxWidth="none",d.style.position="absolute",Ve(this.target),this.target.appendChild(d),this.f=g),rh(c,this.c)||(Se(this.target,
c),$c(this.c,c)),xh(a.attributions,g.l),yh(a,h));return!0};function Ul(a){var b=document.createElement("DIV");b.style.position="absolute";Sl.call(this,a,b);this.c=!0;this.l=1;this.i=0;this.f={}}y(Ul,Sl);Ul.prototype.Nd=function(){Ve(this.target);this.i=0};
Ul.prototype.yf=function(a,b){if(!b.visible)return this.c&&(this.target.style.display="none",this.c=!1),!0;var c=a.pixelRatio,d=a.viewState,e=d.projection,f=this.a,g=f.ha(),h=g.eb(e),l=g.Ud(e),m=h.Lb(d.resolution),n=h.$(m),p=d.center,q;n==d.resolution?(p=Ah(p,n,a.size),q=lc(p,n,d.rotation,a.size)):q=a.extent;void 0!==b.extent&&(q=mc(q,b.extent));var n=sf(h,q,n),r={};r[m]={};var u=this.Qd(g,e,r),x=f.c(),v=Lb(),D=new fe(0,0,0,0),A,z,F,N;for(F=n.ca;F<=n.ea;++F)for(N=n.fa;N<=n.ga;++N)A=g.ac(m,F,N,c,e),
z=A.V(),z=2==z||4==z||3==z&&!x,!z&&A.a&&(A=A.a),z=A.V(),2==z?r[m][A.ma.toString()]=A:4==z||3==z&&!x||(z=qf(h,A.ma,u,D,v),z||(A=rf(h,A.ma,D,v))&&u(m+1,A));var K;if(this.i!=g.g){for(K in this.f)x=this.f[+K],Ue(x.target);this.f={};this.i=g.g}v=Object.keys(r).map(Number);v.sort(ib);var u={},X;F=0;for(N=v.length;F<N;++F){K=v[F];K in this.f?x=this.f[K]:(x=h.qd(p,K),x=new Vl(h,x),u[K]=!0,this.f[K]=x);K=r[K];for(X in K){A=x;z=K[X];var oa=l,H=z.ma,ya=H[0],Ua=H[1],Xa=H[2],H=H.toString();if(!(H in A.a)){var ya=
hf(A.c.Ja(ya),A.o),Va=z.$a(A),Aa=Va.style;Aa.maxWidth="none";var Qb,Nb;0<oa?(Qb=document.createElement("DIV"),Nb=Qb.style,Nb.overflow="hidden",Nb.width=ya[0]+"px",Nb.height=ya[1]+"px",Aa.position="absolute",Aa.left=-oa+"px",Aa.top=-oa+"px",Aa.width=ya[0]+2*oa+"px",Aa.height=ya[1]+2*oa+"px",Qb.appendChild(Va)):(Aa.width=ya[0]+"px",Aa.height=ya[1]+"px",Qb=Va,Nb=Aa);Nb.position="absolute";Nb.left=(Ua-A.g[1])*ya[0]+"px";Nb.top=(A.g[2]-Xa)*ya[1]+"px";A.b||(A.b=document.createDocumentFragment());A.b.appendChild(Qb);
A.a[H]=z}}x.b&&(x.target.appendChild(x.b),x.b=null)}l=Object.keys(this.f).map(Number);l.sort(ib);F=Xc();X=0;for(v=l.length;X<v;++X)if(K=l[X],x=this.f[K],K in r)if(A=x.$(),N=x.Ia(),qh(F,a.size[0]/2,a.size[1]/2,A/d.resolution,A/d.resolution,d.rotation,(N[0]-p[0])/A,(p[1]-N[1])/A),x.setTransform(F),K in u){for(--K;0<=K;--K)if(K in this.f){this.f[K].target.parentNode&&this.f[K].target.parentNode.insertBefore(x.target,this.f[K].target.nextSibling);break}0>K&&this.target.insertBefore(x.target,this.target.childNodes[0]||
null)}else{if(!a.viewHints[0]&&!a.viewHints[1]){z=pf(x.c,q,x.g[0],D);K=[];A=void 0;for(A in x.a)N=x.a[A],z.contains(N.ma)||K.push(N);z=0;for(oa=K.length;z<oa;++z)N=K[z],A=N.ma.toString(),Ue(N.$a(x)),delete x.a[A]}}else Ue(x.target),delete this.f[K];b.opacity!=this.l&&(this.l=this.target.style.opacity=b.opacity);b.visible&&!this.c&&(this.target.style.display="",this.c=!0);zh(a.usedTiles,g,m,n);Bh(a,g,h,c,e,q,m,f.f());wh(a,g);yh(a,g);return!0};
function Vl(a,b){this.target=document.createElement("DIV");this.target.style.position="absolute";this.target.style.width="100%";this.target.style.height="100%";this.c=a;this.g=b;this.i=fc(a.Ea(b));this.l=a.$(b[0]);this.a={};this.b=null;this.f=Zc();this.o=[0,0]}Vl.prototype.Ia=function(){return this.i};Vl.prototype.$=function(){return this.l};Vl.prototype.setTransform=function(a){rh(a,this.f)||(Se(this.target,a),$c(this.f,a))};function Wl(a){this.i=Oe();var b=this.i.canvas;b.style.maxWidth="none";b.style.position="absolute";Sl.call(this,a,b);this.f=!1;this.l=-1;this.s=NaN;this.o=Lb();this.c=this.j=null;this.U=Xc();this.v=Xc()}y(Wl,Sl);k=Wl.prototype;k.Nd=function(){var a=this.i.canvas;a.width=a.width;this.l=0};
k.th=function(a,b){var c=a.viewState,d=c.center,e=c.rotation,f=c.resolution,c=a.pixelRatio,g=a.size[0],h=a.size[1],l=g*c,m=h*c,d=qh(this.U,c*g/2,c*h/2,c/f,-c/f,-e,-d[0],-d[1]),f=this.i;f.canvas.width=l;f.canvas.height=m;g=qh(this.v,0,0,1/c,1/c,0,-(l-g)/2*c,-(m-h)/2*c);Se(f.canvas,g);Xl(this,"precompose",a,d);(g=this.c)&&!g.Ya()&&(f.globalAlpha=b.opacity,g.Pa(f,c,d,e,b.Qc?a.skippedFeatureUids:{}),Xl(this,"render",a,d));Xl(this,"postcompose",a,d)};
function Xl(a,b,c,d){var e=a.i;a=a.a;ab(a,b)&&(d=new yj(e,c.pixelRatio,c.extent,d,c.viewState.rotation),a.b(new lh(b,a,d,c,e,null)))}k.ra=function(a,b,c,d){if(this.c){var e=this.a,f={};return this.c.ra(a,b.viewState.resolution,b.viewState.rotation,{},function(a){var b=w(a).toString();if(!(b in f))return f[b]=!0,c.call(d,a,e)})}};k.uh=function(){uh(this)};
k.yf=function(a){function b(a){var b,d=a.ec();d?b=d.call(a,l):(d=c.i)&&(b=d(a,l));if(b){if(b){d=!1;if(Array.isArray(b))for(var e=0,f=b.length;e<f;++e)d=lk(n,a,b[e],jk(l,m),this.uh,this)||d;else d=lk(n,a,b,jk(l,m),this.uh,this)||d;a=d}else a=!1;this.f=this.f||a}}var c=this.a,d=c.ha();xh(a.attributions,d.l);yh(a,d);var e=a.viewHints[0],f=a.viewHints[1],g=c.S,h=c.T;if(!this.f&&!g&&e||!h&&f)return!0;var f=a.extent,g=a.viewState,e=g.projection,l=g.resolution,m=a.pixelRatio;a=c.g;h=c.a;g=xj(c);void 0===
g&&(g=ik);f=Ob(f,h*l);if(!this.f&&this.s==l&&this.l==a&&this.j==g&&Ub(this.o,f))return!0;this.c=null;this.f=!1;var n=new dk(.5*l/m,f,l,c.a);d.Pc(f,l,e);if(g){var p=[];d.ub(f,function(a){p.push(a)},this);p.sort(g);p.forEach(b,this)}else d.ub(f,b,this);ek(n);this.s=l;this.l=a;this.j=g;this.o=f;this.c=n;return!0};function Yl(a,b){Hh.call(this,0,b);this.f=Oe();var c=this.f.canvas;c.style.position="absolute";c.style.width="100%";c.style.height="100%";c.className="ol-unselectable";a.insertBefore(c,a.childNodes[0]||null);this.c=Xc();this.b=document.createElement("DIV");this.b.className="ol-unselectable";c=this.b.style;c.position="absolute";c.width="100%";c.height="100%";B(this.b,"touchstart",Za);a.insertBefore(this.b,a.childNodes[0]||null);this.a=!0}y(Yl,Hh);Yl.prototype.ka=function(){Ue(this.b);Hh.prototype.ka.call(this)};
Yl.prototype.Xe=function(a){if(a instanceof cj)a=new Tl(a);else if(a instanceof dj)a=new Ul(a);else if(a instanceof G)a=new Wl(a);else return null;return a};function Zl(a,b,c){var d=a.i;if(ab(d,b)){var e=c.extent,f=c.pixelRatio,g=c.viewState,h=g.rotation,l=a.f,m=l.canvas;qh(a.c,m.width/2,m.height/2,f/g.resolution,-f/g.resolution,-g.rotation,-g.center[0],-g.center[1]);a=new yj(l,f,e,a.c,h);d.b(new lh(b,d,a,c,l,null))}}Yl.prototype.X=function(){return"dom"};
Yl.prototype.Ce=function(a){if(a){var b=this.i;if(ab(b,"precompose")||ab(b,"postcompose")){var b=this.f.canvas,c=a.pixelRatio;b.width=a.size[0]*c;b.height=a.size[1]*c}Zl(this,"precompose",a);b=a.layerStatesArray;qb(b);var c=a.viewState.resolution,d,e,f,g;d=0;for(e=b.length;d<e;++d)g=b[d],f=g.layer,f=Kh(this,f),this.b.insertBefore(f.target,this.b.childNodes[d]||null),nh(g,c)&&"ready"==g.R?f.yf(a,g)&&f.th(a,g):f.Nd();var b=a.layerStates,h;for(h in this.g)h in b||(f=this.g[h],Ue(f.target));this.a||(this.b.style.display=
"",this.a=!0);Ih(a);Lh(this,a);a.postRenderFunctions.push(Jh);Zl(this,"postcompose",a)}else this.a&&(this.b.style.display="none",this.a=!1)};function $l(a){this.b=a}function am(a){this.b=a}y(am,$l);am.prototype.X=function(){return 35632};function bm(a){this.b=a}y(bm,$l);bm.prototype.X=function(){return 35633};function cm(){this.b="precision mediump float;varying vec2 a;varying float b;uniform float k;uniform sampler2D l;void main(void){vec4 texColor=texture2D(l,a);gl_FragColor.rgb=texColor.rgb;float alpha=texColor.a*b*k;if(alpha==0.0){discard;}gl_FragColor.a=alpha;}"}y(cm,am);ba(cm);
function dm(){this.b="varying vec2 a;varying float b;attribute vec2 c;attribute vec2 d;attribute vec2 e;attribute float f;attribute float g;uniform mat4 h;uniform mat4 i;uniform mat4 j;void main(void){mat4 offsetMatrix=i;if(g==1.0){offsetMatrix=i*j;}vec4 offsets=offsetMatrix*vec4(e,0.,0.);gl_Position=h*vec4(c,0.,1.)+offsets;a=d;b=f;}"}y(dm,bm);ba(dm);
function em(a,b){this.o=a.getUniformLocation(b,"j");this.j=a.getUniformLocation(b,"i");this.i=a.getUniformLocation(b,"k");this.l=a.getUniformLocation(b,"h");this.b=a.getAttribLocation(b,"e");this.a=a.getAttribLocation(b,"f");this.f=a.getAttribLocation(b,"c");this.g=a.getAttribLocation(b,"g");this.c=a.getAttribLocation(b,"d")};function fm(a){this.b=void 0!==a?a:[]};function gm(a,b){this.l=a;this.b=b;this.a={};this.c={};this.f={};this.j=this.s=this.i=this.o=null;(this.g=jb(ma,"OES_element_index_uint"))&&b.getExtension("OES_element_index_uint");B(this.l,"webglcontextlost",this.ao,this);B(this.l,"webglcontextrestored",this.bo,this)}y(gm,Sa);
function hm(a,b,c){var d=a.b,e=c.b,f=String(w(c));if(f in a.a)d.bindBuffer(b,a.a[f].buffer);else{var g=d.createBuffer();d.bindBuffer(b,g);var h;34962==b?h=new Float32Array(e):34963==b&&(h=a.g?new Uint32Array(e):new Uint16Array(e));d.bufferData(b,h,35044);a.a[f]={Cb:c,buffer:g}}}function im(a,b){var c=a.b,d=String(w(b)),e=a.a[d];c.isContextLost()||c.deleteBuffer(e.buffer);delete a.a[d]}k=gm.prototype;
k.ka=function(){Ra(this.l);var a=this.b;if(!a.isContextLost()){for(var b in this.a)a.deleteBuffer(this.a[b].buffer);for(b in this.f)a.deleteProgram(this.f[b]);for(b in this.c)a.deleteShader(this.c[b]);a.deleteFramebuffer(this.i);a.deleteRenderbuffer(this.j);a.deleteTexture(this.s)}};k.$n=function(){return this.b};
function jm(a){if(!a.i){var b=a.b,c=b.createFramebuffer();b.bindFramebuffer(b.FRAMEBUFFER,c);var d=km(b,1,1),e=b.createRenderbuffer();b.bindRenderbuffer(b.RENDERBUFFER,e);b.renderbufferStorage(b.RENDERBUFFER,b.DEPTH_COMPONENT16,1,1);b.framebufferTexture2D(b.FRAMEBUFFER,b.COLOR_ATTACHMENT0,b.TEXTURE_2D,d,0);b.framebufferRenderbuffer(b.FRAMEBUFFER,b.DEPTH_ATTACHMENT,b.RENDERBUFFER,e);b.bindTexture(b.TEXTURE_2D,null);b.bindRenderbuffer(b.RENDERBUFFER,null);b.bindFramebuffer(b.FRAMEBUFFER,null);a.i=c;
a.s=d;a.j=e}return a.i}function lm(a,b){var c=String(w(b));if(c in a.c)return a.c[c];var d=a.b,e=d.createShader(b.X());d.shaderSource(e,b.b);d.compileShader(e);return a.c[c]=e}function mm(a,b,c){var d=w(b)+"/"+w(c);if(d in a.f)return a.f[d];var e=a.b,f=e.createProgram();e.attachShader(f,lm(a,b));e.attachShader(f,lm(a,c));e.linkProgram(f);return a.f[d]=f}k.ao=function(){Fa(this.a);Fa(this.c);Fa(this.f);this.j=this.s=this.i=this.o=null};k.bo=function(){};
k.we=function(a){if(a==this.o)return!1;this.b.useProgram(a);this.o=a;return!0};function nm(a,b,c){var d=a.createTexture();a.bindTexture(a.TEXTURE_2D,d);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);void 0!==b&&a.texParameteri(3553,10242,b);void 0!==c&&a.texParameteri(3553,10243,c);return d}function km(a,b,c){var d=nm(a,void 0,void 0);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,b,c,0,a.RGBA,a.UNSIGNED_BYTE,null);return d}
function om(a,b){var c=nm(a,33071,33071);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,b);return c};function pm(a,b){this.C=this.A=void 0;this.j=kc(b);this.U=[];this.i=[];this.R=void 0;this.c=[];this.f=[];this.Ba=this.ya=void 0;this.a=[];this.D=this.o=null;this.S=void 0;this.ta=Zc();this.Aa=Zc();this.Y=this.T=void 0;this.Sa=Zc();this.za=this.ia=this.Ra=void 0;this.Gb=[];this.l=[];this.b=[];this.v=null;this.g=[];this.s=[];this.qa=void 0}y(pm,kh);
function qm(a,b){var c=a.v,d=a.o,e=a.Gb,f=a.l,g=b.b;return function(){if(!g.isContextLost()){var a,l;a=0;for(l=e.length;a<l;++a)g.deleteTexture(e[a]);a=0;for(l=f.length;a<l;++a)g.deleteTexture(f[a])}im(b,c);im(b,d)}}
function rm(a,b,c,d){var e=a.A,f=a.C,g=a.R,h=a.ya,l=a.Ba,m=a.S,n=a.T,p=a.Y,q=a.Ra?1:0,r=a.ia,u=a.za,x=a.qa,v=Math.cos(r),r=Math.sin(r),D=a.a.length,A=a.b.length,z,F,N,K,X,oa;for(z=0;z<c;z+=d)X=b[z]-a.j[0],oa=b[z+1]-a.j[1],F=A/8,N=-u*e,K=-u*(g-f),a.b[A++]=X,a.b[A++]=oa,a.b[A++]=N*v-K*r,a.b[A++]=N*r+K*v,a.b[A++]=n/l,a.b[A++]=(p+g)/h,a.b[A++]=m,a.b[A++]=q,N=u*(x-e),K=-u*(g-f),a.b[A++]=X,a.b[A++]=oa,a.b[A++]=N*v-K*r,a.b[A++]=N*r+K*v,a.b[A++]=(n+x)/l,a.b[A++]=(p+g)/h,a.b[A++]=m,a.b[A++]=q,N=u*(x-e),K=
u*f,a.b[A++]=X,a.b[A++]=oa,a.b[A++]=N*v-K*r,a.b[A++]=N*r+K*v,a.b[A++]=(n+x)/l,a.b[A++]=p/h,a.b[A++]=m,a.b[A++]=q,N=-u*e,K=u*f,a.b[A++]=X,a.b[A++]=oa,a.b[A++]=N*v-K*r,a.b[A++]=N*r+K*v,a.b[A++]=n/l,a.b[A++]=p/h,a.b[A++]=m,a.b[A++]=q,a.a[D++]=F,a.a[D++]=F+1,a.a[D++]=F+2,a.a[D++]=F,a.a[D++]=F+2,a.a[D++]=F+3}pm.prototype.tc=function(a,b){this.g.push(this.a.length);this.s.push(b);var c=a.la();rm(this,c,c.length,a.va())};
pm.prototype.uc=function(a,b){this.g.push(this.a.length);this.s.push(b);var c=a.la();rm(this,c,c.length,a.va())};function sm(a,b){var c=b.b;a.U.push(a.a.length);a.i.push(a.a.length);a.v=new fm(a.b);hm(b,34962,a.v);a.o=new fm(a.a);hm(b,34963,a.o);var d={};tm(a.Gb,a.c,d,c);tm(a.l,a.f,d,c);a.A=void 0;a.C=void 0;a.R=void 0;a.c=null;a.f=null;a.ya=void 0;a.Ba=void 0;a.a=null;a.S=void 0;a.T=void 0;a.Y=void 0;a.Ra=void 0;a.ia=void 0;a.za=void 0;a.b=null;a.qa=void 0}
function tm(a,b,c,d){var e,f,g,h=b.length;for(g=0;g<h;++g)e=b[g],f=w(e).toString(),f in c?e=c[f]:(e=om(d,e),c[f]=e),a[g]=e}
pm.prototype.Pa=function(a,b,c,d,e,f,g,h,l,m,n){f=a.b;hm(a,34962,this.v);hm(a,34963,this.o);var p=cm.Zb(),q=dm.Zb(),q=mm(a,p,q);this.D?p=this.D:this.D=p=new em(f,q);a.we(q);f.enableVertexAttribArray(p.f);f.vertexAttribPointer(p.f,2,5126,!1,32,0);f.enableVertexAttribArray(p.b);f.vertexAttribPointer(p.b,2,5126,!1,32,8);f.enableVertexAttribArray(p.c);f.vertexAttribPointer(p.c,2,5126,!1,32,16);f.enableVertexAttribArray(p.a);f.vertexAttribPointer(p.a,1,5126,!1,32,24);f.enableVertexAttribArray(p.g);f.vertexAttribPointer(p.g,
1,5126,!1,32,28);q=this.Sa;qh(q,0,0,2/(c*e[0]),2/(c*e[1]),-d,-(b[0]-this.j[0]),-(b[1]-this.j[1]));b=this.Aa;c=2/e[0];e=2/e[1];ad(b);b[0]=c;b[5]=e;b[10]=1;b[15]=1;e=this.ta;ad(e);0!==d&&fd(e,-d);f.uniformMatrix4fv(p.l,!1,q);f.uniformMatrix4fv(p.j,!1,b);f.uniformMatrix4fv(p.o,!1,e);f.uniform1f(p.i,g);var r;if(void 0===l)um(this,f,a,h,this.Gb,this.U);else{if(m)a:{d=a.g?5125:5123;a=a.g?4:2;e=this.g.length-1;for(g=this.l.length-1;0<=g;--g)for(f.bindTexture(3553,this.l[g]),m=0<g?this.i[g-1]:0,b=this.i[g];0<=
e&&this.g[e]>=m;){r=this.g[e];c=this.s[e];q=w(c).toString();if(void 0===h[q]&&c.W()&&(void 0===n||nc(n,c.W().H()))&&(f.clear(f.COLOR_BUFFER_BIT|f.DEPTH_BUFFER_BIT),f.drawElements(4,b-r,d,r*a),b=l(c))){h=b;break a}b=r;e--}h=void 0}else f.clear(f.COLOR_BUFFER_BIT|f.DEPTH_BUFFER_BIT),um(this,f,a,h,this.l,this.i),h=(h=l(null))?h:void 0;r=h}f.disableVertexAttribArray(p.f);f.disableVertexAttribArray(p.b);f.disableVertexAttribArray(p.c);f.disableVertexAttribArray(p.a);f.disableVertexAttribArray(p.g);return r};
function um(a,b,c,d,e,f){var g=c.g?5125:5123;c=c.g?4:2;if(Ha(d)){var h;a=0;d=e.length;for(h=0;a<d;++a){b.bindTexture(3553,e[a]);var l=f[a];b.drawElements(4,l-h,g,h*c);h=l}}else{h=0;var m,l=0;for(m=e.length;l<m;++l){b.bindTexture(3553,e[l]);for(var n=0<l?f[l-1]:0,p=f[l],q=n;h<a.g.length&&a.g[h]<=p;){var r=w(a.s[h]).toString();void 0!==d[r]?(q!==n&&b.drawElements(4,n-q,g,q*c),n=q=h===a.g.length-1?p:a.g[h+1]):n=h===a.g.length-1?p:a.g[h+1];h++}q!==n&&b.drawElements(4,n-q,g,q*c)}}}
pm.prototype.Tb=function(a){var b=a.Yb(),c=a.jc(1),d=a.ld(),e=a.pe(1),f=a.v,g=a.Ia(),h=a.U,l=a.j,m=a.Fb();a=a.i;var n;0===this.c.length?this.c.push(c):(n=this.c[this.c.length-1],w(n)!=w(c)&&(this.U.push(this.a.length),this.c.push(c)));0===this.f.length?this.f.push(e):(n=this.f[this.f.length-1],w(n)!=w(e)&&(this.i.push(this.a.length),this.f.push(e)));this.A=b[0];this.C=b[1];this.R=m[1];this.ya=d[1];this.Ba=d[0];this.S=f;this.T=g[0];this.Y=g[1];this.ia=l;this.Ra=h;this.za=a;this.qa=m[0]};
function vm(a,b,c){this.f=b;this.c=a;this.g=c;this.a={}}function wm(a,b){var c=[],d;for(d in a.a)c.push(qm(a.a[d],b));return function(){for(var a=c.length,b,d=0;d<a;d++)b=c[d].apply(this,arguments);return b}}function xm(a,b){for(var c in a.a)sm(a.a[c],b)}vm.prototype.b=function(a,b){var c=this.a[b];void 0===c&&(c=new ym[b](this.c,this.f),this.a[b]=c);return c};vm.prototype.Ya=function(){return Ha(this.a)};
vm.prototype.Pa=function(a,b,c,d,e,f,g,h){var l,m,n;l=0;for(m=Nj.length;l<m;++l)n=this.a[Nj[l]],void 0!==n&&n.Pa(a,b,c,d,e,f,g,h,void 0,!1)};function zm(a,b,c,d,e,f,g,h,l,m,n){var p=Am,q,r;for(q=Nj.length-1;0<=q;--q)if(r=a.a[Nj[q]],void 0!==r&&(r=r.Pa(b,c,d,e,p,f,g,h,l,m,n)))return r}
vm.prototype.ra=function(a,b,c,d,e,f,g,h,l,m){var n=b.b;n.bindFramebuffer(n.FRAMEBUFFER,jm(b));var p;void 0!==this.g&&(p=Ob(Xb(a),d*this.g));return zm(this,b,a,d,e,g,h,l,function(a){var b=new Uint8Array(4);n.readPixels(0,0,1,1,n.RGBA,n.UNSIGNED_BYTE,b);if(0<b[3]&&(a=m(a)))return a},!0,p)};
function Bm(a,b,c,d,e,f,g,h){var l=c.b;l.bindFramebuffer(l.FRAMEBUFFER,jm(c));return void 0!==zm(a,c,b,d,e,f,g,h,function(){var a=new Uint8Array(4);l.readPixels(0,0,1,1,l.RGBA,l.UNSIGNED_BYTE,a);return 0<a[3]},!1)}var ym={Image:pm},Am=[1,1];function Cm(a,b,c,d,e,f,g){this.b=a;this.f=b;this.g=f;this.c=g;this.o=e;this.l=d;this.i=c;this.a=null}y(Cm,kh);k=Cm.prototype;k.sd=function(a){this.Tb(a.a)};k.sc=function(a){switch(a.X()){case "Point":this.uc(a,null);break;case "MultiPoint":this.tc(a,null);break;case "GeometryCollection":this.Ze(a,null)}};k.Ye=function(a,b){var c=(0,b.g)(a);c&&nc(this.g,c.H())&&(this.sd(b),this.sc(c))};k.Ze=function(a){a=a.c;var b,c;b=0;for(c=a.length;b<c;++b)this.sc(a[b])};
k.uc=function(a,b){var c=this.b,d=(new vm(1,this.g)).b(0,"Image");d.Tb(this.a);d.uc(a,b);sm(d,c);d.Pa(this.b,this.f,this.i,this.l,this.o,this.c,1,{},void 0,!1);qm(d,c)()};k.tc=function(a,b){var c=this.b,d=(new vm(1,this.g)).b(0,"Image");d.Tb(this.a);d.tc(a,b);sm(d,c);d.Pa(this.b,this.f,this.i,this.l,this.o,this.c,1,{},void 0,!1);qm(d,c)()};k.Tb=function(a){this.a=a};function Dm(){this.b="precision mediump float;varying vec2 a;uniform float f;uniform sampler2D g;void main(void){vec4 texColor=texture2D(g,a);gl_FragColor.rgb=texColor.rgb;gl_FragColor.a=texColor.a*f;}"}y(Dm,am);ba(Dm);function Em(){this.b="varying vec2 a;attribute vec2 b;attribute vec2 c;uniform mat4 d;uniform mat4 e;void main(void){gl_Position=e*vec4(b,0.,1.);a=(d*vec4(c,0.,1.)).st;}"}y(Em,bm);ba(Em);
function Fm(a,b){this.g=a.getUniformLocation(b,"f");this.f=a.getUniformLocation(b,"e");this.i=a.getUniformLocation(b,"d");this.c=a.getUniformLocation(b,"g");this.b=a.getAttribLocation(b,"b");this.a=a.getAttribLocation(b,"c")};function Gm(a,b){th.call(this,b);this.f=a;this.S=new fm([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]);this.i=this.pb=null;this.l=void 0;this.s=Xc();this.U=Zc();this.v=null}y(Gm,th);
function Hm(a,b,c){var d=a.f.f;if(void 0===a.l||a.l!=c){b.postRenderFunctions.push(function(a,b,c){a.isContextLost()||(a.deleteFramebuffer(b),a.deleteTexture(c))}.bind(null,d,a.i,a.pb));b=km(d,c,c);var e=d.createFramebuffer();d.bindFramebuffer(36160,e);d.framebufferTexture2D(36160,36064,3553,b,0);a.pb=b;a.i=e;a.l=c}else d.bindFramebuffer(36160,a.i)}
Gm.prototype.vh=function(a,b,c){Im(this,"precompose",c,a);hm(c,34962,this.S);var d=c.b,e=Dm.Zb(),f=Em.Zb(),e=mm(c,e,f);this.v?f=this.v:this.v=f=new Fm(d,e);c.we(e)&&(d.enableVertexAttribArray(f.b),d.vertexAttribPointer(f.b,2,5126,!1,16,0),d.enableVertexAttribArray(f.a),d.vertexAttribPointer(f.a,2,5126,!1,16,8),d.uniform1i(f.c,0));d.uniformMatrix4fv(f.i,!1,this.s);d.uniformMatrix4fv(f.f,!1,this.U);d.uniform1f(f.g,b.opacity);d.bindTexture(3553,this.pb);d.drawArrays(5,0,4);Im(this,"postcompose",c,a)};
function Im(a,b,c,d){a=a.a;if(ab(a,b)){var e=d.viewState;a.b(new lh(b,a,new Cm(c,e.center,e.resolution,e.rotation,d.size,d.extent,d.pixelRatio),d,null,c))}}Gm.prototype.zf=function(){this.i=this.pb=null;this.l=void 0};function Jm(a,b){Gm.call(this,a,b);this.j=this.o=this.c=null}y(Jm,Gm);function Km(a,b){var c=b.a();return om(a.f.f,c)}Jm.prototype.ra=function(a,b,c,d){var e=this.a;return e.ha().ra(a,b.viewState.resolution,b.viewState.rotation,b.skippedFeatureUids,function(a){return c.call(d,a,e)})};
Jm.prototype.Af=function(a,b){var c=this.f.f,d=a.pixelRatio,e=a.viewState,f=e.center,g=e.resolution,h=e.rotation,l=this.c,m=this.pb,n=this.a.ha(),p=a.viewHints,q=a.extent;void 0!==b.extent&&(q=mc(q,b.extent));p[0]||p[1]||hc(q)||(e=n.A(q,g,d,e.projection))&&vh(this,e)&&(l=e,m=Km(this,e),this.pb&&a.postRenderFunctions.push(function(a,b){a.isContextLost()||a.deleteTexture(b)}.bind(null,c,this.pb)));l&&(c=this.f.c.l,Lm(this,c.width,c.height,d,f,g,h,l.H()),this.j=null,d=this.s,ad(d),ed(d,1,-1),dd(d,0,
-1),this.c=l,this.pb=m,xh(a.attributions,l.l),yh(a,n));return!0};function Lm(a,b,c,d,e,f,g,h){b*=f;c*=f;a=a.U;ad(a);ed(a,2*d/b,2*d/c);fd(a,-g);dd(a,h[0]-e[0],h[1]-e[1]);ed(a,(h[2]-h[0])/2,(h[3]-h[1])/2);dd(a,1,1)}Jm.prototype.le=function(a,b){return void 0!==this.ra(a,b,qc,this)};
Jm.prototype.Cc=function(a,b,c,d){if(this.c&&this.c.a())if(this.a.ha()instanceof yl){if(a=a.slice(),sh(b.pixelToCoordinateMatrix,a,a),this.ra(a,b,qc,this))return c.call(d,this.a)}else{var e=[this.c.a().width,this.c.a().height];if(!this.j){var f=b.size;b=Xc();ad(b);dd(b,-1,-1);ed(b,2/f[0],2/f[1]);dd(b,0,f[1]);ed(b,1,-1);f=Xc();cd(this.U,f);var g=Xc();ad(g);dd(g,0,e[1]);ed(g,1,-1);ed(g,e[0]/2,e[1]/2);dd(g,1,1);var h=Xc();bd(g,f,h);bd(h,b,h);this.j=h}b=[0,0];sh(this.j,a,b);if(!(0>b[0]||b[0]>e[0]||0>
b[1]||b[1]>e[1])&&(this.o||(this.o=Oe(1,1)),this.o.clearRect(0,0,1,1),this.o.drawImage(this.c.a(),b[0],b[1],1,1,0,0,1,1),0<this.o.getImageData(0,0,1,1).data[3]))return c.call(d,this.a)}};function Mm(){this.b="precision mediump float;varying vec2 a;uniform sampler2D e;void main(void){gl_FragColor=texture2D(e,a);}"}y(Mm,am);ba(Mm);function Nm(){this.b="varying vec2 a;attribute vec2 b;attribute vec2 c;uniform vec4 d;void main(void){gl_Position=vec4(b*d.xy+d.zw,0.,1.);a=c;}"}y(Nm,bm);ba(Nm);function Om(a,b){this.g=a.getUniformLocation(b,"e");this.f=a.getUniformLocation(b,"d");this.b=a.getAttribLocation(b,"b");this.a=a.getAttribLocation(b,"c")};function Pm(a,b){Gm.call(this,a,b);this.D=Mm.Zb();this.T=Nm.Zb();this.c=null;this.C=new fm([0,0,0,1,1,0,1,1,0,1,0,0,1,1,1,0]);this.A=this.o=null;this.j=-1;this.R=[0,0]}y(Pm,Gm);k=Pm.prototype;k.ka=function(){im(this.f.c,this.C);Gm.prototype.ka.call(this)};k.Qd=function(a,b,c){var d=this.f;return function(e,f){return Af(a,b,e,f,function(a){var b=Ze(d.a,a.ib());b&&(c[e]||(c[e]={}),c[e][a.ma.toString()]=a);return b})}};k.zf=function(){Gm.prototype.zf.call(this);this.c=null};
k.Af=function(a,b,c){var d=this.f,e=c.b,f=a.viewState,g=f.projection,h=this.a,l=h.ha(),m=l.eb(g),n=m.Lb(f.resolution),p=m.$(n),q=l.$d(n,a.pixelRatio,g),r=q[0]/hf(m.Ja(n),this.R)[0],u=p/r,x=l.Ud(g),v=f.center,D;p==f.resolution?(v=Ah(v,p,a.size),D=lc(v,p,f.rotation,a.size)):D=a.extent;p=sf(m,D,p);if(this.o&&he(this.o,p)&&this.j==l.g)u=this.A;else{var A=[p.ea-p.ca+1,p.ga-p.fa+1],z=Math.pow(2,Math.ceil(Math.log(Math.max(A[0]*q[0],A[1]*q[1]))/Math.LN2)),A=u*z,F=m.Ia(n),N=F[0]+p.ca*q[0]*u,u=F[1]+p.fa*q[1]*
u,u=[N,u,N+A,u+A];Hm(this,a,z);e.viewport(0,0,z,z);e.clearColor(0,0,0,0);e.clear(16384);e.disable(3042);z=mm(c,this.D,this.T);c.we(z);this.c||(this.c=new Om(e,z));hm(c,34962,this.C);e.enableVertexAttribArray(this.c.b);e.vertexAttribPointer(this.c.b,2,5126,!1,16,0);e.enableVertexAttribArray(this.c.a);e.vertexAttribPointer(this.c.a,2,5126,!1,16,8);e.uniform1i(this.c.g,0);c={};c[n]={};var K=this.Qd(l,g,c),X=h.c(),z=!0,N=Lb(),oa=new fe(0,0,0,0),H,ya,Ua;for(ya=p.ca;ya<=p.ea;++ya)for(Ua=p.fa;Ua<=p.ga;++Ua){F=
l.ac(n,ya,Ua,r,g);if(void 0!==b.extent&&(H=m.Ea(F.ma,N),!nc(H,b.extent)))continue;H=F.V();H=2==H||4==H||3==H&&!X;!H&&F.a&&(F=F.a);H=F.V();if(2==H){if(Ze(d.a,F.ib())){c[n][F.ma.toString()]=F;continue}}else if(4==H||3==H&&!X)continue;z=!1;H=qf(m,F.ma,K,oa,N);H||(F=rf(m,F.ma,oa,N))&&K(n+1,F)}b=Object.keys(c).map(Number);b.sort(ib);for(var K=new Float32Array(4),Xa,Va,Aa,X=0,oa=b.length;X<oa;++X)for(Xa in Va=c[b[X]],Va)F=Va[Xa],H=m.Ea(F.ma,N),ya=2*(H[2]-H[0])/A,Ua=2*(H[3]-H[1])/A,Aa=2*(H[0]-u[0])/A-1,
H=2*(H[1]-u[1])/A-1,Wc(K,ya,Ua,Aa,H),e.uniform4fv(this.c.f,K),Qm(d,F,q,x*r),e.drawArrays(5,0,4);z?(this.o=p,this.A=u,this.j=l.g):(this.A=this.o=null,this.j=-1,a.animate=!0)}zh(a.usedTiles,l,n,p);var Qb=d.o;Bh(a,l,m,r,g,D,n,h.f(),function(a){var b;(b=2!=a.V()||Ze(d.a,a.ib()))||(b=a.ib()in Qb.g);b||Qb.f([a,uf(m,a.ma),m.$(a.ma[0]),q,x*r])},this);wh(a,l);yh(a,l);e=this.s;ad(e);dd(e,(v[0]-u[0])/(u[2]-u[0]),(v[1]-u[1])/(u[3]-u[1]));0!==f.rotation&&fd(e,f.rotation);ed(e,a.size[0]*f.resolution/(u[2]-u[0]),
a.size[1]*f.resolution/(u[3]-u[1]));dd(e,-.5,-.5);return!0};k.Cc=function(a,b,c,d){if(this.i){var e=[0,0];sh(this.s,[a[0]/b.size[0],(b.size[1]-a[1])/b.size[1]],e);a=[e[0]*this.l,e[1]*this.l];b=this.f.c.b;b.bindFramebuffer(b.FRAMEBUFFER,this.i);e=new Uint8Array(4);b.readPixels(a[0],a[1],1,1,b.RGBA,b.UNSIGNED_BYTE,e);if(0<e[3])return c.call(d,this.a)}};function Rm(a,b){Gm.call(this,a,b);this.j=!1;this.R=-1;this.D=NaN;this.A=Lb();this.o=this.c=this.C=null}y(Rm,Gm);k=Rm.prototype;k.vh=function(a,b,c){this.o=b;var d=a.viewState,e=this.c;e&&!e.Ya()&&e.Pa(c,d.center,d.resolution,d.rotation,a.size,a.pixelRatio,b.opacity,b.Qc?a.skippedFeatureUids:{})};k.ka=function(){var a=this.c;a&&(wm(a,this.f.c)(),this.c=null);Gm.prototype.ka.call(this)};
k.ra=function(a,b,c,d){if(this.c&&this.o){var e=b.viewState,f=this.a,g={};return this.c.ra(a,this.f.c,e.center,e.resolution,e.rotation,b.size,b.pixelRatio,this.o.opacity,{},function(a){var b=w(a).toString();if(!(b in g))return g[b]=!0,c.call(d,a,f)})}};k.le=function(a,b){if(this.c&&this.o){var c=b.viewState;return Bm(this.c,a,this.f.c,c.resolution,c.rotation,b.pixelRatio,this.o.opacity,b.skippedFeatureUids)}return!1};
k.Cc=function(a,b,c,d){a=a.slice();sh(b.pixelToCoordinateMatrix,a,a);if(this.le(a,b))return c.call(d,this.a)};k.wh=function(){uh(this)};
k.Af=function(a,b,c){function d(a){var b,c=a.ec();c?b=c.call(a,m):(c=e.i)&&(b=c(a,m));if(b){if(b){c=!1;if(Array.isArray(b))for(var d=0,f=b.length;d<f;++d)c=lk(q,a,b[d],jk(m,n),this.wh,this)||c;else c=lk(q,a,b,jk(m,n),this.wh,this)||c;a=c}else a=!1;this.j=this.j||a}}var e=this.a;b=e.ha();xh(a.attributions,b.l);yh(a,b);var f=a.viewHints[0],g=a.viewHints[1],h=e.S,l=e.T;if(!this.j&&!h&&f||!l&&g)return!0;var g=a.extent,h=a.viewState,f=h.projection,m=h.resolution,n=a.pixelRatio,h=e.g,p=e.a,l=xj(e);void 0===
l&&(l=ik);g=Ob(g,p*m);if(!this.j&&this.D==m&&this.R==h&&this.C==l&&Ub(this.A,g))return!0;this.c&&a.postRenderFunctions.push(wm(this.c,c));this.j=!1;var q=new vm(.5*m/n,g,e.a);b.Pc(g,m,f);if(l){var r=[];b.ub(g,function(a){r.push(a)},this);r.sort(l);r.forEach(d,this)}else b.ub(g,d,this);xm(q,c);this.D=m;this.R=h;this.C=l;this.A=g;this.c=q;return!0};function Sm(a,b){Hh.call(this,0,b);this.b=document.createElement("CANVAS");this.b.style.width="100%";this.b.style.height="100%";this.b.className="ol-unselectable";a.insertBefore(this.b,a.childNodes[0]||null);this.U=this.A=0;this.C=Oe();this.j=!0;this.f=ag(this.b,{antialias:!0,depth:!1,failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,stencil:!0});this.c=new gm(this.b,this.f);B(this.b,"webglcontextlost",this.Pm,this);B(this.b,"webglcontextrestored",this.Qm,this);this.a=new Ye;this.v=null;this.o=
new Mh(function(a){var b=a[1];a=a[2];var e=b[0]-this.v[0],b=b[1]-this.v[1];return 65536*Math.log(a)+Math.sqrt(e*e+b*b)/a}.bind(this),function(a){return a[0].ib()});this.D=function(){if(!this.o.Ya()){Qh(this.o);var a=Nh(this.o);Qm(this,a[0],a[3],a[4])}return!1}.bind(this);this.l=0;Tm(this)}y(Sm,Hh);
function Qm(a,b,c,d){var e=a.f,f=b.ib();if(Ze(a.a,f))a=a.a.get(f),e.bindTexture(3553,a.pb),9729!=a.Wg&&(e.texParameteri(3553,10240,9729),a.Wg=9729),9729!=a.Yg&&(e.texParameteri(3553,10241,9729),a.Yg=9729);else{var g=e.createTexture();e.bindTexture(3553,g);if(0<d){var h=a.C.canvas,l=a.C;a.A!==c[0]||a.U!==c[1]?(h.width=c[0],h.height=c[1],a.A=c[0],a.U=c[1]):l.clearRect(0,0,c[0],c[1]);l.drawImage(b.$a(),d,d,c[0],c[1],0,0,c[0],c[1]);e.texImage2D(3553,0,6408,6408,5121,h)}else e.texImage2D(3553,0,6408,6408,
5121,b.$a());e.texParameteri(3553,10240,9729);e.texParameteri(3553,10241,9729);e.texParameteri(3553,10242,33071);e.texParameteri(3553,10243,33071);a.a.set(f,{pb:g,Wg:9729,Yg:9729})}}k=Sm.prototype;k.Xe=function(a){return a instanceof cj?new Jm(this,a):a instanceof dj?new Pm(this,a):a instanceof G?new Rm(this,a):null};function Um(a,b,c){var d=a.i;if(ab(d,b)){a=a.c;var e=c.viewState;d.b(new lh(b,d,new Cm(a,e.center,e.resolution,e.rotation,c.size,c.extent,c.pixelRatio),c,null,a))}}
k.ka=function(){var a=this.f;a.isContextLost()||this.a.forEach(function(b){b&&a.deleteTexture(b.pb)});Ta(this.c);Hh.prototype.ka.call(this)};k.Gj=function(a,b){for(var c=this.f,d;1024<this.a.wc()-this.l;){if(d=this.a.b.pc)c.deleteTexture(d.pb);else if(+this.a.b.cc==b.index)break;else--this.l;this.a.pop()}};k.X=function(){return"webgl"};k.Pm=function(a){a.preventDefault();this.a.clear();this.l=0;a=this.g;for(var b in a)a[b].zf()};k.Qm=function(){Tm(this);this.i.render()};
function Tm(a){a=a.f;a.activeTexture(33984);a.blendFuncSeparate(770,771,1,771);a.disable(2884);a.disable(2929);a.disable(3089);a.disable(2960)}
k.Ce=function(a){var b=this.c,c=this.f;if(c.isContextLost())return!1;if(!a)return this.j&&(this.b.style.display="none",this.j=!1),!1;this.v=a.focus;this.a.set((-a.index).toString(),null);++this.l;Um(this,"precompose",a);var d=[],e=a.layerStatesArray;qb(e);var f=a.viewState.resolution,g,h,l,m;g=0;for(h=e.length;g<h;++g)m=e[g],nh(m,f)&&"ready"==m.R&&(l=Kh(this,m.layer),l.Af(a,m,b)&&d.push(m));e=a.size[0]*a.pixelRatio;f=a.size[1]*a.pixelRatio;if(this.b.width!=e||this.b.height!=f)this.b.width=e,this.b.height=
f;c.bindFramebuffer(36160,null);c.clearColor(0,0,0,0);c.clear(16384);c.enable(3042);c.viewport(0,0,this.b.width,this.b.height);g=0;for(h=d.length;g<h;++g)m=d[g],l=Kh(this,m.layer),l.vh(a,m,b);this.j||(this.b.style.display="",this.j=!0);Ih(a);1024<this.a.wc()-this.l&&a.postRenderFunctions.push(this.Gj.bind(this));this.o.Ya()||(a.postRenderFunctions.push(this.D),a.animate=!0);Um(this,"postcompose",a);Lh(this,a);a.postRenderFunctions.push(Jh)};
k.ra=function(a,b,c,d,e,f){var g;if(this.f.isContextLost())return!1;var h=b.viewState,l=b.layerStatesArray,m;for(m=l.length-1;0<=m;--m){g=l[m];var n=g.layer;if(nh(g,h.resolution)&&e.call(f,n)&&(g=Kh(this,n).ra(a,b,c,d)))return g}};k.sh=function(a,b,c,d){var e=!1;if(this.f.isContextLost())return!1;var f=b.viewState,g=b.layerStatesArray,h;for(h=g.length-1;0<=h;--h){var l=g[h],m=l.layer;if(nh(l,f.resolution)&&c.call(d,m)&&(e=Kh(this,m).le(a,b)))return!0}return e};
k.rh=function(a,b,c,d,e){if(this.f.isContextLost())return!1;var f=b.viewState,g,h=b.layerStatesArray,l;for(l=h.length-1;0<=l;--l){g=h[l];var m=g.layer;if(nh(g,f.resolution)&&e.call(d,m)&&(g=Kh(this,m).Cc(a,b,c,d)))return g}};var Vm=["canvas","webgl","dom"];
function Q(a){eb.call(this);var b=Wm(a);this.Hb=void 0!==a.loadTilesWhileAnimating?a.loadTilesWhileAnimating:!1;this.Hc=void 0!==a.loadTilesWhileInteracting?a.loadTilesWhileInteracting:!1;this.Oe=void 0!==a.pixelRatio?a.pixelRatio:gg;this.Ne=b.logos;this.Y=function(){this.i=void 0;this.Uo.call(this,Date.now())}.bind(this);this.Sa=Xc();this.Pe=Xc();this.qb=0;this.f=null;this.Aa=Lb();this.D=this.S=null;this.a=document.createElement("DIV");this.a.className="ol-viewport"+(lg?" ol-touch":"");this.a.style.position=
"relative";this.a.style.overflow="hidden";this.a.style.width="100%";this.a.style.height="100%";this.a.style.msTouchAction="none";this.a.style.touchAction="none";this.A=document.createElement("DIV");this.A.className="ol-overlaycontainer";this.a.appendChild(this.A);this.v=document.createElement("DIV");this.v.className="ol-overlaycontainer-stopevent";a=["click","dblclick","mousedown","touchstart","mspointerdown",eh,"mousewheel","wheel"];for(var c=0,d=a.length;c<d;++c)B(this.v,a[c],Ya);this.a.appendChild(this.v);
this.za=new Xg(this);for(var e in hh)B(this.za,hh[e],this.Pg,this);this.ia=b.keyboardEventTarget;this.s=null;B(this.a,"wheel",this.Oc,this);B(this.a,"mousewheel",this.Oc,this);this.o=b.controls;this.l=b.interactions;this.j=b.overlays;this.Cf={};this.C=new b.Wo(this.a,this);this.T=null;this.R=[];this.ta=[];this.qa=new Rh(this.Bk.bind(this),this.hl.bind(this));this.Ee={};B(this,gb("layergroup"),this.Ok,this);B(this,gb("view"),this.il,this);B(this,gb("size"),this.el,this);B(this,gb("target"),this.gl,
this);this.G(b.values);this.o.forEach(function(a){a.setMap(this)},this);B(this.o,"add",function(a){a.element.setMap(this)},this);B(this.o,"remove",function(a){a.element.setMap(null)},this);this.l.forEach(function(a){a.setMap(this)},this);B(this.l,"add",function(a){a.element.setMap(this)},this);B(this.l,"remove",function(a){a.element.setMap(null)},this);this.j.forEach(this.mg,this);B(this.j,"add",function(a){this.mg(a.element)},this);B(this.j,"remove",function(a){var b=a.element.Xa();void 0!==b&&delete this.Cf[b.toString()];
a.element.setMap(null)},this)}y(Q,eb);k=Q.prototype;k.uj=function(a){this.o.push(a)};k.vj=function(a){this.l.push(a)};k.kg=function(a){this.xc().Tc().push(a)};k.lg=function(a){this.j.push(a)};k.mg=function(a){var b=a.Xa();void 0!==b&&(this.Cf[b.toString()]=a);a.setMap(this)};k.Wa=function(a){this.render();Array.prototype.push.apply(this.R,arguments)};
k.ka=function(){Ta(this.za);Ta(this.C);Qa(this.a,"wheel",this.Oc,this);Qa(this.a,"mousewheel",this.Oc,this);void 0!==this.c&&(pa.removeEventListener("resize",this.c,!1),this.c=void 0);this.i&&(pa.cancelAnimationFrame(this.i),this.i=void 0);this.fh(null);eb.prototype.ka.call(this)};k.kd=function(a,b,c,d,e){if(this.f)return a=this.Ma(a),this.C.ra(a,this.f,b,void 0!==c?c:null,void 0!==d?d:qc,void 0!==e?e:null)};
k.Tl=function(a,b,c,d,e){if(this.f)return this.C.rh(a,this.f,b,void 0!==c?c:null,void 0!==d?d:qc,void 0!==e?e:null)};k.kl=function(a,b,c){if(!this.f)return!1;a=this.Ma(a);return this.C.sh(a,this.f,void 0!==b?b:qc,void 0!==c?c:null)};k.Wj=function(a){return this.Ma(this.Td(a))};k.Td=function(a){var b=this.a.getBoundingClientRect();a=a.changedTouches?a.changedTouches[0]:a;return[a.clientX-b.left,a.clientY-b.top]};k.tf=function(){return this.get("target")};
k.yc=function(){var a=this.tf();return void 0!==a?"string"===typeof a?document.getElementById(a):a:null};k.Ma=function(a){var b=this.f;return b?(a=a.slice(),sh(b.pixelToCoordinateMatrix,a,a)):null};k.Uj=function(){return this.o};k.nk=function(){return this.j};k.mk=function(a){a=this.Cf[a.toString()];return void 0!==a?a:null};k.ak=function(){return this.l};k.xc=function(){return this.get("layergroup")};k.eh=function(){return this.xc().Tc()};
k.Ga=function(a){var b=this.f;return b?(a=a.slice(0,2),sh(b.coordinateToPixelMatrix,a,a)):null};k.Za=function(){return this.get("size")};k.aa=function(){return this.get("view")};k.Dk=function(){return this.a};k.Bk=function(a,b,c,d){var e=this.f;if(!(e&&b in e.wantedTiles&&e.wantedTiles[b][a.ma.toString()]))return Infinity;a=c[0]-e.focus[0];c=c[1]-e.focus[1];return 65536*Math.log(d)+Math.sqrt(a*a+c*c)/d};k.Oc=function(a,b){var c=new Vg(b||a.type,this,a);this.Pg(c)};
k.Pg=function(a){if(this.f){this.T=a.coordinate;a.frameState=this.f;var b=this.l.a,c;if(!1!==this.b(a))for(c=b.length-1;0<=c;c--){var d=b[c];if(d.f()&&!d.handleEvent(a))break}}};k.cl=function(){var a=this.f,b=this.qa;if(!b.Ya()){var c=16,d=c;if(a){var e=a.viewHints;e[0]&&(c=this.Hb?8:0,d=2);e[1]&&(c=this.Hc?8:0,d=2)}b.i<c&&(Qh(b),Sh(b,c,d))}b=this.ta;c=0;for(d=b.length;c<d;++c)b[c](this,a);b.length=0};k.el=function(){this.render()};
k.gl=function(){var a;this.tf()&&(a=this.yc());if(this.s){for(var b=0,c=this.s.length;b<c;++b)Ka(this.s[b]);this.s=null}a?(a.appendChild(this.a),a=this.ia?this.ia:a,this.s=[B(a,"keydown",this.Oc,this),B(a,"keypress",this.Oc,this)],this.c||(this.c=this.Xc.bind(this),pa.addEventListener("resize",this.c,!1))):(Ue(this.a),void 0!==this.c&&(pa.removeEventListener("resize",this.c,!1),this.c=void 0));this.Xc()};k.hl=function(){this.render()};k.jl=function(){this.render()};
k.il=function(){this.S&&(Ka(this.S),this.S=null);var a=this.aa();a&&(this.S=B(a,"propertychange",this.jl,this));this.render()};k.Pk=function(){this.render()};k.Qk=function(){this.render()};k.Ok=function(){this.D&&(this.D.forEach(Ka),this.D=null);var a=this.xc();a&&(this.D=[B(a,"propertychange",this.Qk,this),B(a,"change",this.Pk,this)]);this.render()};k.Vo=function(){this.i&&pa.cancelAnimationFrame(this.i);this.Y()};k.render=function(){void 0===this.i&&(this.i=pa.requestAnimationFrame(this.Y))};
k.Oo=function(a){return this.o.remove(a)};k.Po=function(a){return this.l.remove(a)};k.Ro=function(a){return this.xc().Tc().remove(a)};k.So=function(a){return this.j.remove(a)};
k.Uo=function(a){var b,c,d,e=this.Za(),f=this.aa(),g=Lb(),h=null;if(void 0!==e&&0<e[0]&&0<e[1]&&f&&Wd(f)){var h=Sd(f,this.f?this.f.viewHints:void 0),l=this.xc().hf(),m={};b=0;for(c=l.length;b<c;++b)m[w(l[b].layer)]=l[b];d=f.V();h={animate:!1,attributions:{},coordinateToPixelMatrix:this.Sa,extent:g,focus:this.T?this.T:d.center,index:this.qb++,layerStates:m,layerStatesArray:l,logos:Ea({},this.Ne),pixelRatio:this.Oe,pixelToCoordinateMatrix:this.Pe,postRenderFunctions:[],size:e,skippedFeatureUids:this.Ee,
tileQueue:this.qa,time:a,usedTiles:{},viewState:d,viewHints:h,wantedTiles:{}}}if(h){a=this.R;b=e=0;for(c=a.length;b<c;++b)f=a[b],f(this,h)&&(a[e++]=f);a.length=e;h.extent=lc(d.center,d.resolution,d.rotation,h.size,g)}this.f=h;this.C.Ce(h);h&&(h.animate&&this.render(),Array.prototype.push.apply(this.ta,h.postRenderFunctions),0!==this.R.length||h.viewHints[0]||h.viewHints[1]||$b(h.extent,this.Aa)||(this.b(new We("moveend",this,h)),Pb(h.extent,this.Aa)));this.b(new We("postrender",this,h));Tf(this.cl,
this)};k.ji=function(a){this.set("layergroup",a)};k.Wf=function(a){this.set("size",a)};k.fh=function(a){this.set("target",a)};k.kp=function(a){this.set("view",a)};k.ti=function(a){a=w(a).toString();this.Ee[a]=!0;this.render()};
k.Xc=function(){var a=this.yc();if(a){var b=pa.getComputedStyle(a);this.Wf([a.offsetWidth-parseFloat(b.borderLeftWidth)-parseFloat(b.paddingLeft)-parseFloat(b.paddingRight)-parseFloat(b.borderRightWidth),a.offsetHeight-parseFloat(b.borderTopWidth)-parseFloat(b.paddingTop)-parseFloat(b.paddingBottom)-parseFloat(b.borderBottomWidth)])}else this.Wf(void 0)};k.wi=function(a){a=w(a).toString();delete this.Ee[a];this.render()};
function Wm(a){var b=null;void 0!==a.keyboardEventTarget&&(b="string"===typeof a.keyboardEventTarget?document.getElementById(a.keyboardEventTarget):a.keyboardEventTarget);var c={},d={};if(void 0===a.logo||"boolean"===typeof a.logo&&a.logo)d["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAHGAAABxgEXwfpGAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAhNQTFRF////AP//AICAgP//AFVVQECA////K1VVSbbbYL/fJ05idsTYJFtbbcjbJllmZszWWMTOIFhoHlNiZszTa9DdUcHNHlNlV8XRIVdiasrUHlZjIVZjaMnVH1RlIFRkH1RkH1ZlasvYasvXVsPQH1VkacnVa8vWIVZjIFRjVMPQa8rXIVVkXsXRsNveIFVkIFZlIVVj3eDeh6GmbMvXH1ZkIFRka8rWbMvXIFVkIFVjIFVkbMvWH1VjbMvWIFVlbcvWIFVla8vVIFVkbMvWbMvVH1VkbMvWIFVlbcvWIFVkbcvVbMvWjNPbIFVkU8LPwMzNIFVkbczWIFVkbsvWbMvXIFVkRnB8bcvW2+TkW8XRIFVkIlZlJVloJlpoKlxrLl9tMmJwOWd0Omh1RXF8TneCT3iDUHiDU8LPVMLPVcLPVcPQVsPPVsPQV8PQWMTQWsTQW8TQXMXSXsXRX4SNX8bSYMfTYcfTYsfTY8jUZcfSZsnUaIqTacrVasrVa8jTa8rWbI2VbMvWbcvWdJObdcvUdszUd8vVeJaee87Yfc3WgJyjhqGnitDYjaarldPZnrK2oNbborW5o9bbo9fbpLa6q9ndrL3ArtndscDDutzfu8fJwN7gwt7gxc/QyuHhy+HizeHi0NfX0+Pj19zb1+Tj2uXk29/e3uLg3+Lh3+bl4uXj4ufl4+fl5Ofl5ufl5ujm5+jmySDnBAAAAFp0Uk5TAAECAgMEBAYHCA0NDg4UGRogIiMmKSssLzU7PkJJT1JTVFliY2hrdHZ3foSFhYeJjY2QkpugqbG1tre5w8zQ09XY3uXn6+zx8vT09vf4+Pj5+fr6/P39/f3+gz7SsAAAAVVJREFUOMtjYKA7EBDnwCPLrObS1BRiLoJLnte6CQy8FLHLCzs2QUG4FjZ5GbcmBDDjxJBXDWxCBrb8aM4zbkIDzpLYnAcE9VXlJSWlZRU13koIeW57mGx5XjoMZEUqwxWYQaQbSzLSkYGfKFSe0QMsX5WbjgY0YS4MBplemI4BdGBW+DQ11eZiymfqQuXZIjqwyadPNoSZ4L+0FVM6e+oGI6g8a9iKNT3o8kVzNkzRg5lgl7p4wyRUL9Yt2jAxVh6mQCogae6GmflI8p0r13VFWTHBQ0rWPW7ahgWVcPm+9cuLoyy4kCJDzCm6d8PSFoh0zvQNC5OjDJhQopPPJqph1doJBUD5tnkbZiUEqaCnB3bTqLTFG1bPn71kw4b+GFdpLElKIzRxxgYgWNYc5SCENVHKeUaltHdXx0dZ8uBI1hJ2UUDgq82CM2MwKeibqAvSO7MCABq0wXEPiqWEAAAAAElFTkSuQmCC"]=
"http://openlayers.org/";else{var e=a.logo;"string"===typeof e?d[e]="":e instanceof HTMLElement?d[w(e).toString()]=e:fa(e)&&(d[e.src]=e.href)}e=a.layers instanceof Ti?a.layers:new Ti({layers:a.layers});c.layergroup=e;c.target=a.target;c.view=void 0!==a.view?a.view:new Rd;var e=Hh,f;void 0!==a.renderer?Array.isArray(a.renderer)?f=a.renderer:"string"===typeof a.renderer&&(f=[a.renderer]):f=Vm;var g,h;g=0;for(h=f.length;g<h;++g){var l=f[g];if("canvas"==l){if(ig){e=Ql;break}}else if("dom"==l){e=Yl;break}else if("webgl"==
l&&bg){e=Sm;break}}var m;void 0!==a.controls?m=Array.isArray(a.controls)?new le(a.controls.slice()):a.controls:m=Kf();var n;void 0!==a.interactions?n=Array.isArray(a.interactions)?new le(a.interactions.slice()):a.interactions:n=Si();a=void 0!==a.overlays?Array.isArray(a.overlays)?new le(a.overlays.slice()):a.overlays:new le;return{controls:m,interactions:n,keyboardEventTarget:b,logos:d,overlays:a,Wo:e,values:c}}bj();function Xm(a){eb.call(this);this.j=a.id;this.o=void 0!==a.insertFirst?a.insertFirst:!0;this.s=void 0!==a.stopEvent?a.stopEvent:!0;this.f=document.createElement("DIV");this.f.className="ol-overlay-container";this.f.style.position="absolute";this.autoPan=void 0!==a.autoPan?a.autoPan:!1;this.i=void 0!==a.autoPanAnimation?a.autoPanAnimation:{};this.l=void 0!==a.autoPanMargin?a.autoPanMargin:20;this.a={Md:"",fe:"",De:"",Fe:"",visible:!0};this.c=null;B(this,gb("element"),this.Jk,this);B(this,gb("map"),
this.Vk,this);B(this,gb("offset"),this.Zk,this);B(this,gb("position"),this.al,this);B(this,gb("positioning"),this.bl,this);void 0!==a.element&&this.fi(a.element);this.li(void 0!==a.offset?a.offset:[0,0]);this.oi(void 0!==a.positioning?a.positioning:"top-left");void 0!==a.position&&this.uf(a.position)}y(Xm,eb);k=Xm.prototype;k.Sd=function(){return this.get("element")};k.Xa=function(){return this.j};k.he=function(){return this.get("map")};k.Kg=function(){return this.get("offset")};k.gh=function(){return this.get("position")};
k.Lg=function(){return this.get("positioning")};k.Jk=function(){Ve(this.f);var a=this.Sd();a&&this.f.appendChild(a)};k.Vk=function(){this.c&&(Ue(this.f),Ka(this.c),this.c=null);var a=this.he();a&&(this.c=B(a,"postrender",this.render,this),Ym(this),a=this.s?a.v:a.A,this.o?a.insertBefore(this.f,a.childNodes[0]||null):a.appendChild(this.f))};k.render=function(){Ym(this)};k.Zk=function(){Ym(this)};
k.al=function(){Ym(this);if(void 0!==this.get("position")&&this.autoPan){var a=this.he();if(void 0!==a&&a.yc()){var b=Zm(a.yc(),a.Za()),c=this.Sd(),d=c.offsetWidth,e=c.currentStyle||pa.getComputedStyle(c),d=d+(parseInt(e.marginLeft,10)+parseInt(e.marginRight,10)),e=c.offsetHeight,f=c.currentStyle||pa.getComputedStyle(c),e=e+(parseInt(f.marginTop,10)+parseInt(f.marginBottom,10)),g=Zm(c,[d,e]),c=this.l;Ub(b,g)||(d=g[0]-b[0],e=b[2]-g[2],f=g[1]-b[1],g=b[3]-g[3],b=[0,0],0>d?b[0]=d-c:0>e&&(b[0]=Math.abs(e)+
c),0>f?b[1]=f-c:0>g&&(b[1]=Math.abs(g)+c),0===b[0]&&0===b[1])||(c=a.aa().ab(),d=a.Ga(c),b=[d[0]+b[0],d[1]+b[1]],this.i&&(this.i.source=c,a.Wa(ce(this.i))),a.aa().mb(a.Ma(b)))}}};k.bl=function(){Ym(this)};k.fi=function(a){this.set("element",a)};k.setMap=function(a){this.set("map",a)};k.li=function(a){this.set("offset",a)};k.uf=function(a){this.set("position",a)};function Zm(a,b){var c=a.getBoundingClientRect(),d=c.left+pa.pageXOffset,c=c.top+pa.pageYOffset;return[d,c,d+b[0],c+b[1]]}
k.oi=function(a){this.set("positioning",a)};function $m(a,b){a.a.visible!==b&&(a.f.style.display=b?"":"none",a.a.visible=b)}
function Ym(a){var b=a.he(),c=a.gh();if(void 0!==b&&b.f&&void 0!==c){var c=b.Ga(c),d=b.Za(),b=a.f.style,e=a.Kg(),f=a.Lg(),g=e[0],e=e[1];if("bottom-right"==f||"center-right"==f||"top-right"==f)""!==a.a.fe&&(a.a.fe=b.left=""),g=Math.round(d[0]-c[0]-g)+"px",a.a.De!=g&&(a.a.De=b.right=g);else{""!==a.a.De&&(a.a.De=b.right="");if("bottom-center"==f||"center-center"==f||"top-center"==f)g-=a.f.offsetWidth/2;g=Math.round(c[0]+g)+"px";a.a.fe!=g&&(a.a.fe=b.left=g)}if("bottom-left"==f||"bottom-center"==f||"bottom-right"==
f)""!==a.a.Fe&&(a.a.Fe=b.top=""),c=Math.round(d[1]-c[1]-e)+"px",a.a.Md!=c&&(a.a.Md=b.bottom=c);else{""!==a.a.Md&&(a.a.Md=b.bottom="");if("center-left"==f||"center-center"==f||"center-right"==f)e-=a.f.offsetHeight/2;c=Math.round(c[1]+e)+"px";a.a.Fe!=c&&(a.a.Fe=b.top=c)}$m(a,!0)}else $m(a,!1)};function an(a){a=a?a:{};this.l=void 0!==a.collapsed?a.collapsed:!0;this.o=void 0!==a.collapsible?a.collapsible:!0;this.o||(this.l=!1);var b=void 0!==a.className?a.className:"ol-overviewmap",c=void 0!==a.tipLabel?a.tipLabel:"Overview map",d=void 0!==a.collapseLabel?a.collapseLabel:"\u00ab";"string"===typeof d?(this.j=document.createElement("span"),this.j.textContent=d):this.j=d;d=void 0!==a.label?a.label:"\u00bb";"string"===typeof d?(this.v=document.createElement("span"),this.v.textContent=d):this.v=
d;var e=this.o&&!this.l?this.j:this.v,d=document.createElement("button");d.setAttribute("type","button");d.title=c;d.appendChild(e);B(d,"click",this.gm,this);c=document.createElement("DIV");c.className="ol-overviewmap-map";var f=this.f=new Q({controls:new le,interactions:new le,target:c,view:a.view});a.layers&&a.layers.forEach(function(a){f.kg(a)},this);e=document.createElement("DIV");e.className="ol-overviewmap-box";e.style.boxSizing="border-box";this.A=new Xm({position:[0,0],positioning:"bottom-left",
element:e});this.f.lg(this.A);e=document.createElement("div");e.className=b+" ol-unselectable ol-control"+(this.l&&this.o?" ol-collapsed":"")+(this.o?"":" ol-uncollapsible");e.appendChild(c);e.appendChild(d);Xe.call(this,{element:e,render:a.render?a.render:bn,target:a.target})}y(an,Xe);k=an.prototype;
k.setMap=function(a){var b=this.a;a!==b&&(b&&(b=b.aa())&&Qa(b,gb("rotation"),this.de,this),Xe.prototype.setMap.call(this,a),a&&(this.s.push(B(a,"propertychange",this.Wk,this)),0===this.f.eh().dc()&&this.f.ji(a.xc()),a=a.aa()))&&(B(a,gb("rotation"),this.de,this),Wd(a)&&(this.f.Xc(),cn(this)))};k.Wk=function(a){"view"===a.key&&((a=a.oldValue)&&Qa(a,gb("rotation"),this.de,this),a=this.a.aa(),B(a,gb("rotation"),this.de,this))};k.de=function(){this.f.aa().ie(this.a.aa().La())};
function bn(){var a=this.a,b=this.f;if(a.f&&b.f){var c=a.Za(),a=a.aa().Kc(c),d=b.Za(),c=b.aa().Kc(d),e=b.Ga(fc(a)),f=b.Ga(dc(a)),b=Math.abs(e[0]-f[0]),e=Math.abs(e[1]-f[1]),f=d[0],d=d[1];b<.1*f||e<.1*d||b>.75*f||e>.75*d?cn(this):Ub(c,a)||(a=this.f,c=this.a.aa(),a.aa().mb(c.ab()))}dn(this)}function cn(a){var b=a.a;a=a.f;var c=b.Za(),b=b.aa().Kc(c),c=a.Za();a=a.aa();oc(b,1/(.1*Math.pow(2,Math.log(7.5)/Math.LN2/2)));a.cf(b,c)}
function dn(a){var b=a.a,c=a.f;if(b.f&&c.f){var d=b.Za(),e=b.aa(),f=c.aa();c.Za();var c=e.La(),b=a.A,g=a.A.Sd(),e=e.Kc(d),d=f.$(),f=cc(e),e=ec(e),h;if(a=a.a.aa().ab())h=[f[0]-a[0],f[1]-a[1]],Gb(h,c),Bb(h,a);b.uf(h);g&&(g.style.width=Math.abs((f[0]-e[0])/d)+"px",g.style.height=Math.abs((e[1]-f[1])/d)+"px")}}k.gm=function(a){a.preventDefault();en(this)};
function en(a){a.element.classList.toggle("ol-collapsed");a.l?Te(a.j,a.v):Te(a.v,a.j);a.l=!a.l;var b=a.f;a.l||b.f||(b.Xc(),cn(a),Pa(b,"postrender",function(){dn(this)},a))}k.fm=function(){return this.o};k.im=function(a){this.o!==a&&(this.o=a,this.element.classList.toggle("ol-uncollapsible"),!a&&this.l&&en(this))};k.hm=function(a){this.o&&this.l!==a&&en(this)};k.em=function(){return this.l};k.pk=function(){return this.f};function fn(a){a=a?a:{};var b=void 0!==a.className?a.className:"ol-scale-line";this.o=document.createElement("DIV");this.o.className=b+"-inner";this.f=document.createElement("DIV");this.f.className=b+" ol-unselectable";this.f.appendChild(this.o);this.v=null;this.j=void 0!==a.minWidth?a.minWidth:64;this.l=!1;this.C=void 0;this.A="";Xe.call(this,{element:this.f,render:a.render?a.render:gn,target:a.target});B(this,gb("units"),this.R,this);this.D(a.units||"metric")}y(fn,Xe);var hn=[1,2,5];
fn.prototype.wb=function(){return this.get("units")};function gn(a){(a=a.frameState)?this.v=a.viewState:this.v=null;jn(this)}fn.prototype.R=function(){jn(this)};fn.prototype.D=function(a){this.set("units",a)};
function jn(a){var b=a.v;if(b){var c=b.projection,d=c.$b(),b=c.getPointResolution(b.resolution,b.center)*d,d=a.j*b,c="",e=a.wb();"degrees"==e?(c=uc.degrees,b/=c,d<c/60?(c="\u2033",b*=3600):d<c?(c="\u2032",b*=60):c="\u00b0"):"imperial"==e?.9144>d?(c="in",b/=.0254):1609.344>d?(c="ft",b/=.3048):(c="mi",b/=1609.344):"nautical"==e?(b/=1852,c="nm"):"metric"==e?1>d?(c="mm",b*=1E3):1E3>d?c="m":(c="km",b/=1E3):"us"==e&&(.9144>d?(c="in",b*=39.37):1609.344>d?(c="ft",b/=.30480061):(c="mi",b/=1609.3472));for(var e=
3*Math.floor(Math.log(a.j*b)/Math.log(10)),f;;){f=hn[(e%3+3)%3]*Math.pow(10,Math.floor(e/3));d=Math.round(f/b);if(isNaN(d)){a.f.style.display="none";a.l=!1;return}if(d>=a.j)break;++e}b=f+" "+c;a.A!=b&&(a.o.innerHTML=b,a.A=b);a.C!=d&&(a.o.style.width=d+"px",a.C=d);a.l||(a.f.style.display="",a.l=!0)}else a.l&&(a.f.style.display="none",a.l=!1)};function kn(a){a=a?a:{};this.f=void 0;this.l=ln;this.v=[];this.C=this.j=0;this.T=null;this.ia=!1;this.Y=void 0!==a.duration?a.duration:200;var b=void 0!==a.className?a.className:"ol-zoomslider",c=document.createElement("button");c.setAttribute("type","button");c.className=b+"-thumb ol-unselectable";var d=document.createElement("div");d.className=b+" ol-unselectable ol-control";d.appendChild(c);this.o=new Pg(d);B(this.o,zg,this.Ik,this);B(this.o,Ag,this.Ng,this);B(this.o,Bg,this.Og,this);B(d,"click",
this.Hk,this);B(c,"click",Ya);Xe.call(this,{element:d,render:a.render?a.render:mn})}y(kn,Xe);kn.prototype.ka=function(){Ta(this.o);Xe.prototype.ka.call(this)};var ln=0;k=kn.prototype;k.setMap=function(a){Xe.prototype.setMap.call(this,a);a&&a.render()};
function mn(a){if(a.frameState){if(!this.ia){var b=this.element,c=b.offsetWidth,d=b.offsetHeight,e=b.firstElementChild,f=pa.getComputedStyle(e),b=e.offsetWidth+parseFloat(f.marginRight)+parseFloat(f.marginLeft),e=e.offsetHeight+parseFloat(f.marginTop)+parseFloat(f.marginBottom);this.T=[b,e];c>d?(this.l=1,this.C=c-b):(this.l=ln,this.j=d-e);this.ia=!0}a=a.frameState.viewState.resolution;a!==this.f&&(this.f=a,nn(this,a))}}
k.Hk=function(a){var b=this.a,c=b.aa(),d=c.$();b.Wa(ee({resolution:d,duration:this.Y,easing:Zd}));a=on(this,sa(1===this.l?(a.offsetX-this.T[0]/2)/this.C:(a.offsetY-this.T[1]/2)/this.j,0,1));c.Ub(c.constrainResolution(a))};
k.Ik=function(a){if(!this.A&&a.b.target===this.element.firstElementChild&&(Xd(this.a.aa(),1),this.D=a.clientX,this.R=a.clientY,this.A=!0,0===this.v.length)){a=this.Ng;var b=this.Og;this.v.push(B(document,"mousemove",a,this),B(document,"touchmove",a,this),B(document,Ag,a,this),B(document,"mouseup",b,this),B(document,"touchend",b,this),B(document,Bg,b,this))}};
k.Ng=function(a){if(this.A){var b=this.element.firstElementChild;this.f=on(this,sa(1===this.l?(a.clientX-this.D+parseInt(b.style.left,10))/this.C:(a.clientY-this.R+parseInt(b.style.top,10))/this.j,0,1));this.a.aa().Ub(this.f);nn(this,this.f);this.D=a.clientX;this.R=a.clientY}};k.Og=function(){if(this.A){var a=this.a,b=a.aa();Xd(b,-1);a.Wa(ee({resolution:this.f,duration:this.Y,easing:Zd}));a=b.constrainResolution(this.f);b.Ub(a);this.A=!1;this.R=this.D=void 0;this.v.forEach(Ka);this.v.length=0}};
function nn(a,b){var c;c=1-Vd(a.a.aa())(b);var d=a.element.firstElementChild;1==a.l?d.style.left=a.C*c+"px":d.style.top=a.j*c+"px"}function on(a,b){return Ud(a.a.aa())(1-b)};function pn(a){a=a?a:{};this.f=a.extent?a.extent:null;var b=void 0!==a.className?a.className:"ol-zoom-extent",c=void 0!==a.label?a.label:"E",d=void 0!==a.tipLabel?a.tipLabel:"Fit to extent",e=document.createElement("button");e.setAttribute("type","button");e.title=d;e.appendChild("string"===typeof c?document.createTextNode(c):c);B(e,"click",this.l,this);c=document.createElement("div");c.className=b+" ol-unselectable ol-control";c.appendChild(e);Xe.call(this,{element:c,target:a.target})}y(pn,Xe);
pn.prototype.l=function(a){a.preventDefault();var b=this.a;a=b.aa();var c=this.f?this.f:a.l.H(),b=b.Za();a.cf(c,b)};function qn(a){eb.call(this);a=a?a:{};this.a=null;B(this,gb("tracking"),this.Il,this);this.rf(void 0!==a.tracking?a.tracking:!1)}y(qn,eb);k=qn.prototype;k.ka=function(){this.rf(!1);eb.prototype.ka.call(this)};
k.co=function(a){if(null!==a.alpha){var b=wa(a.alpha);this.set("alpha",b);"boolean"===typeof a.absolute&&a.absolute?this.set("heading",b):ea(a.webkitCompassHeading)&&-1!=a.webkitCompassAccuracy&&this.set("heading",wa(a.webkitCompassHeading))}null!==a.beta&&this.set("beta",wa(a.beta));null!==a.gamma&&this.set("gamma",wa(a.gamma));this.u()};k.Oj=function(){return this.get("alpha")};k.Rj=function(){return this.get("beta")};k.Yj=function(){return this.get("gamma")};k.Hl=function(){return this.get("heading")};
k.$g=function(){return this.get("tracking")};k.Il=function(){if(jg){var a=this.$g();a&&!this.a?this.a=B(pa,"deviceorientation",this.co,this):a||null===this.a||(Ka(this.a),this.a=null)}};k.rf=function(a){this.set("tracking",a)};function rn(){this.defaultDataProjection=null}function sn(a,b,c){var d;c&&(d={dataProjection:c.dataProjection?c.dataProjection:a.Oa(b),featureProjection:c.featureProjection});return tn(a,d)}function tn(a,b){var c;b&&(c={featureProjection:b.featureProjection,dataProjection:b.dataProjection?b.dataProjection:a.defaultDataProjection,rightHanded:b.rightHanded},b.decimals&&(c.decimals=b.decimals));return c}
function un(a,b,c){var d=c?yc(c.featureProjection):null,e=c?yc(c.dataProjection):null,f;d&&e&&!Oc(d,e)?a instanceof Tc?f=(b?a.clone():a).jb(b?d:e,b?e:d):f=Sc(b?a.slice():a,b?d:e,b?e:d):f=a;if(b&&c&&c.decimals){var g=Math.pow(10,c.decimals);a=function(a){for(var b=0,c=a.length;b<c;++b)a[b]=Math.round(a[b]*g)/g;return a};Array.isArray(f)?a(f):f.rc(a)}return f};function vn(){this.defaultDataProjection=null}y(vn,rn);function wn(a){return fa(a)?a:"string"===typeof a?(a=JSON.parse(a))?a:null:null}k=vn.prototype;k.X=function(){return"json"};k.Rb=function(a,b){return this.Uc(wn(a),sn(this,a,b))};k.Fa=function(a,b){return this.Jf(wn(a),sn(this,a,b))};k.Vc=function(a,b){return this.Rh(wn(a),sn(this,a,b))};k.Oa=function(a){return this.Yh(wn(a))};k.Dd=function(a,b){return JSON.stringify(this.Yc(a,b))};k.Xb=function(a,b){return JSON.stringify(this.Ie(a,b))};
k.Zc=function(a,b){return JSON.stringify(this.Ke(a,b))};function xn(a,b,c,d,e,f){var g=NaN,h=NaN,l=(c-b)/d;if(0!==l)if(1==l)g=a[b],h=a[b+1];else if(2==l)g=(1-e)*a[b]+e*a[b+d],h=(1-e)*a[b+1]+e*a[b+d+1];else{var h=a[b],l=a[b+1],m=0,g=[0],n;for(n=b+d;n<c;n+=d){var p=a[n],q=a[n+1],m=m+Math.sqrt((p-h)*(p-h)+(q-l)*(q-l));g.push(m);h=p;l=q}c=e*m;l=0;m=g.length;for(n=!1;l<m;)e=l+(m-l>>1),h=+ib(g[e],c),0>h?l=e+1:(m=e,n=!h);e=n?l:~l;0>e?(c=(c-g[-e-2])/(g[-e-1]-g[-e-2]),b+=(-e-2)*d,g=za(a[b],a[b+d],c),h=za(a[b+1],a[b+d+1],c)):(g=a[b+e*d],h=a[b+e*d+1])}return f?(f[0]=
g,f[1]=h,f):[g,h]}function yn(a,b,c,d,e,f){if(c==b)return null;if(e<a[b+d-1])return f?(c=a.slice(b,b+d),c[d-1]=e,c):null;if(a[c-1]<e)return f?(c=a.slice(c-d,c),c[d-1]=e,c):null;if(e==a[b+d-1])return a.slice(b,b+d);b/=d;for(c/=d;b<c;)f=b+c>>1,e<a[(f+1)*d-1]?c=f:b=f+1;c=a[b*d-1];if(e==c)return a.slice((b-1)*d,(b-1)*d+d);f=(e-c)/(a[(b+1)*d-1]-c);c=[];var g;for(g=0;g<d-1;++g)c.push(za(a[(b-1)*d+g],a[b*d+g],f));c.push(e);return c}
function zn(a,b,c,d,e,f){var g=0;if(f)return yn(a,g,b[b.length-1],c,d,e);if(d<a[c-1])return e?(a=a.slice(0,c),a[c-1]=d,a):null;if(a[a.length-1]<d)return e?(a=a.slice(a.length-c),a[c-1]=d,a):null;e=0;for(f=b.length;e<f;++e){var h=b[e];if(g!=h){if(d<a[g+c-1])break;if(d<=a[h-1])return yn(a,g,h,c,d,!1);g=h}}return null};function R(a,b){hd.call(this);this.i=null;this.C=this.D=this.j=-1;this.pa(a,b)}y(R,hd);k=R.prototype;k.wj=function(a){this.B?mb(this.B,a):this.B=a.slice();this.u()};k.clone=function(){var a=new R(null);a.ba(this.f,this.B.slice());return a};k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;this.C!=this.g&&(this.D=Math.sqrt(od(this.B,0,this.B.length,this.a,0)),this.C=this.g);return qd(this.B,0,this.B.length,this.a,this.D,!1,a,b,c,d)};
k.Lj=function(a,b){return Fd(this.B,0,this.B.length,this.a,a,b)};k.lm=function(a,b){return"XYM"!=this.f&&"XYZM"!=this.f?null:yn(this.B,0,this.B.length,this.a,a,void 0!==b?b:!1)};k.Z=function(){return vd(this.B,0,this.B.length,this.a)};k.Bg=function(a,b){return xn(this.B,0,this.B.length,this.a,a,b)};k.mm=function(){var a=this.B,b=this.a,c=a[0],d=a[1],e=0,f;for(f=0+b;f<this.B.length;f+=b)var g=a[f],h=a[f+1],e=e+Math.sqrt((g-c)*(g-c)+(h-d)*(h-d)),c=g,d=h;return e};
function Fj(a){a.j!=a.g&&(a.i=a.Bg(.5,a.i),a.j=a.g);return a.i}k.Nc=function(a){var b=[];b.length=xd(this.B,0,this.B.length,this.a,a,b,0);a=new R(null);a.ba("XY",b);return a};k.X=function(){return"LineString"};k.Ka=function(a){return Gd(this.B,0,this.B.length,this.a,a)};k.pa=function(a,b){a?(kd(this,b,a,1),this.B||(this.B=[]),this.B.length=td(this.B,0,a,this.a),this.u()):this.ba("XY",null)};k.ba=function(a,b){jd(this,a,b);this.u()};function S(a,b){hd.call(this);this.i=[];this.j=this.C=-1;this.pa(a,b)}y(S,hd);k=S.prototype;k.xj=function(a){this.B?mb(this.B,a.la().slice()):this.B=a.la().slice();this.i.push(this.B.length);this.u()};k.clone=function(){var a=new S(null);a.ba(this.f,this.B.slice(),this.i.slice());return a};k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;this.j!=this.g&&(this.C=Math.sqrt(pd(this.B,0,this.i,this.a,0)),this.j=this.g);return rd(this.B,0,this.i,this.a,this.C,!1,a,b,c,d)};
k.om=function(a,b,c){return"XYM"!=this.f&&"XYZM"!=this.f||0===this.B.length?null:zn(this.B,this.i,this.a,a,void 0!==b?b:!1,void 0!==c?c:!1)};k.Z=function(){return wd(this.B,0,this.i,this.a)};k.Db=function(){return this.i};k.fk=function(a){if(0>a||this.i.length<=a)return null;var b=new R(null);b.ba(this.f,this.B.slice(0===a?0:this.i[a-1],this.i[a]));return b};
k.md=function(){var a=this.B,b=this.i,c=this.f,d=[],e=0,f,g;f=0;for(g=b.length;f<g;++f){var h=b[f],l=new R(null);l.ba(c,a.slice(e,h));d.push(l);e=h}return d};function Gj(a){var b=[],c=a.B,d=0,e=a.i;a=a.a;var f,g;f=0;for(g=e.length;f<g;++f){var h=e[f],d=xn(c,d,h,a,.5);mb(b,d);d=h}return b}k.Nc=function(a){var b=[],c=[],d=this.B,e=this.i,f=this.a,g=0,h=0,l,m;l=0;for(m=e.length;l<m;++l){var n=e[l],h=xd(d,g,n,f,a,b,h);c.push(h);g=n}b.length=h;a=new S(null);a.ba("XY",b,c);return a};k.X=function(){return"MultiLineString"};
k.Ka=function(a){a:{var b=this.B,c=this.i,d=this.a,e=0,f,g;f=0;for(g=c.length;f<g;++f){if(Gd(b,e,c[f],d,a)){a=!0;break a}e=c[f]}a=!1}return a};k.pa=function(a,b){if(a){kd(this,b,a,2);this.B||(this.B=[]);var c=ud(this.B,0,a,this.a,this.i);this.B.length=0===c.length?0:c[c.length-1];this.u()}else this.ba("XY",null,this.i)};k.ba=function(a,b,c){jd(this,a,b);this.i=c;this.u()};
function An(a,b){var c=a.f,d=[],e=[],f,g;f=0;for(g=b.length;f<g;++f){var h=b[f];0===f&&(c=h.f);mb(d,h.la());e.push(d.length)}a.ba(c,d,e)};function Bn(a,b){hd.call(this);this.pa(a,b)}y(Bn,hd);k=Bn.prototype;k.zj=function(a){this.B?mb(this.B,a.la()):this.B=a.la().slice();this.u()};k.clone=function(){var a=new Bn(null);a.ba(this.f,this.B.slice());return a};k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;var e=this.B,f=this.a,g,h,l;g=0;for(h=e.length;g<h;g+=f)if(l=va(a,b,e[g],e[g+1]),l<d){d=l;for(l=0;l<f;++l)c[l]=e[g+l];c.length=f}return d};k.Z=function(){return vd(this.B,0,this.B.length,this.a)};
k.rk=function(a){var b=this.B?this.B.length/this.a:0;if(0>a||b<=a)return null;b=new C(null);b.ba(this.f,this.B.slice(a*this.a,(a+1)*this.a));return b};k.je=function(){var a=this.B,b=this.f,c=this.a,d=[],e,f;e=0;for(f=a.length;e<f;e+=c){var g=new C(null);g.ba(b,a.slice(e,e+c));d.push(g)}return d};k.X=function(){return"MultiPoint"};k.Ka=function(a){var b=this.B,c=this.a,d,e,f,g;d=0;for(e=b.length;d<e;d+=c)if(f=b[d],g=b[d+1],Tb(a,f,g))return!0;return!1};
k.pa=function(a,b){a?(kd(this,b,a,1),this.B||(this.B=[]),this.B.length=td(this.B,0,a,this.a),this.u()):this.ba("XY",null)};k.ba=function(a,b){jd(this,a,b);this.u()};function T(a,b){hd.call(this);this.i=[];this.C=-1;this.D=null;this.T=this.R=this.S=-1;this.j=null;this.pa(a,b)}y(T,hd);k=T.prototype;k.Aj=function(a){if(this.B){var b=this.B.length;mb(this.B,a.la());a=a.Db().slice();var c,d;c=0;for(d=a.length;c<d;++c)a[c]+=b}else this.B=a.la().slice(),a=a.Db().slice(),this.i.push();this.i.push(a);this.u()};k.clone=function(){for(var a=new T(null),b=this.i.length,c=Array(b),d=0;d<b;++d)c[d]=this.i[d].slice();Cn(a,this.f,this.B.slice(),c);return a};
k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;if(this.R!=this.g){var e=this.i,f=0,g=0,h,l;h=0;for(l=e.length;h<l;++h)var m=e[h],g=pd(this.B,f,m,this.a,g),f=m[m.length-1];this.S=Math.sqrt(g);this.R=this.g}e=Hj(this);f=this.i;g=this.a;h=this.S;l=0;var m=[NaN,NaN],n,p;n=0;for(p=f.length;n<p;++n){var q=f[n];d=rd(e,l,q,g,h,!0,a,b,c,d,m);l=q[q.length-1]}return d};
k.Bc=function(a,b){var c;a:{c=Hj(this);var d=this.i,e=0;if(0!==d.length){var f,g;f=0;for(g=d.length;f<g;++f){var h=d[f];if(Dd(c,e,h,this.a,a,b)){c=!0;break a}e=h[h.length-1]}}c=!1}return c};k.pm=function(){var a=Hj(this),b=this.i,c=0,d=0,e,f;e=0;for(f=b.length;e<f;++e)var g=b[e],d=d+md(a,c,g,this.a),c=g[g.length-1];return d};
k.Z=function(a){var b;void 0!==a?(b=Hj(this).slice(),Ld(b,this.i,this.a,a)):b=this.B;a=b;b=this.i;var c=this.a,d=0,e=[],f=0,g,h;g=0;for(h=b.length;g<h;++g){var l=b[g];e[f++]=wd(a,d,l,c,e[f]);d=l[l.length-1]}e.length=f;return e};
function Ij(a){if(a.C!=a.g){var b=a.B,c=a.i,d=a.a,e=0,f=[],g,h;g=0;for(h=c.length;g<h;++g){var l=c[g],e=Yb(b,e,l[0],d);f.push((e[0]+e[2])/2,(e[1]+e[3])/2);e=l[l.length-1]}b=Hj(a);c=a.i;d=a.a;g=0;h=[];l=0;for(e=c.length;l<e;++l){var m=c[l];h=Ed(b,g,m,d,f,2*l,h);g=m[m.length-1]}a.D=h;a.C=a.g}return a.D}k.ck=function(){var a=new Bn(null);a.ba("XY",Ij(this).slice());return a};
function Hj(a){if(a.T!=a.g){var b=a.B,c;a:{c=a.i;var d,e;d=0;for(e=c.length;d<e;++d)if(!Jd(b,c[d],a.a,void 0)){c=!1;break a}c=!0}c?a.j=b:(a.j=b.slice(),a.j.length=Ld(a.j,a.i,a.a));a.T=a.g}return a.j}k.Nc=function(a){var b=[],c=[],d=this.B,e=this.i,f=this.a;a=Math.sqrt(a);var g=0,h=0,l,m;l=0;for(m=e.length;l<m;++l){var n=e[l],p=[],h=yd(d,g,n,f,a,b,h,p);c.push(p);g=n[n.length-1]}b.length=h;d=new T(null);Cn(d,"XY",b,c);return d};
k.tk=function(a){if(0>a||this.i.length<=a)return null;var b;0===a?b=0:(b=this.i[a-1],b=b[b.length-1]);a=this.i[a].slice();var c=a[a.length-1];if(0!==b){var d,e;d=0;for(e=a.length;d<e;++d)a[d]-=b}d=new E(null);d.ba(this.f,this.B.slice(b,c),a);return d};k.Wd=function(){var a=this.f,b=this.B,c=this.i,d=[],e=0,f,g,h,l;f=0;for(g=c.length;f<g;++f){var m=c[f].slice(),n=m[m.length-1];if(0!==e)for(h=0,l=m.length;h<l;++h)m[h]-=e;h=new E(null);h.ba(a,b.slice(e,n),m);d.push(h);e=n}return d};k.X=function(){return"MultiPolygon"};
k.Ka=function(a){a:{var b=Hj(this),c=this.i,d=this.a,e=0,f,g;f=0;for(g=c.length;f<g;++f){var h=c[f];if(Hd(b,e,h,d,a)){a=!0;break a}e=h[h.length-1]}a=!1}return a};k.pa=function(a,b){if(a){kd(this,b,a,3);this.B||(this.B=[]);var c=this.B,d=this.a,e=this.i,f=0,e=e?e:[],g=0,h,l;h=0;for(l=a.length;h<l;++h)f=ud(c,f,a[h],d,e[g]),e[g++]=f,f=f[f.length-1];e.length=g;0===e.length?this.B.length=0:(c=e[e.length-1],this.B.length=0===c.length?0:c[c.length-1]);this.u()}else Cn(this,"XY",null,this.i)};
function Cn(a,b,c,d){jd(a,b,c);a.i=d;a.u()}function Dn(a,b){var c=a.f,d=[],e=[],f,g,h;f=0;for(g=b.length;f<g;++f){var l=b[f];0===f&&(c=l.f);var m=d.length;h=l.Db();var n,p;n=0;for(p=h.length;n<p;++n)h[n]+=m;mb(d,l.la());e.push(h)}Cn(a,c,d,e)};function En(a){a=a?a:{};this.defaultDataProjection=null;this.b=a.geometryName}y(En,vn);
function Fn(a,b){if(!a)return null;var c;if(ea(a.x)&&ea(a.y))c="Point";else if(a.points)c="MultiPoint";else if(a.paths)c=1===a.paths.length?"LineString":"MultiLineString";else if(a.rings){var d=a.rings,e=Gn(a),f=[];c=[];var g,h;g=0;for(h=d.length;g<h;++g){var l=lb(d[g]);Id(l,0,l.length,e.length)?f.push([d[g]]):c.push(d[g])}for(;c.length;){d=c.shift();e=!1;for(g=f.length-1;0<=g;g--)if(Ub((new zd(f[g][0])).H(),(new zd(d)).H())){f[g].push(d);e=!0;break}e||f.push([d.reverse()])}a=Ea({},a);1===f.length?
(c="Polygon",a.rings=f[0]):(c="MultiPolygon",a.rings=f)}return un((0,Hn[c])(a),!1,b)}function Gn(a){var b="XY";!0===a.hasZ&&!0===a.hasM?b="XYZM":!0===a.hasZ?b="XYZ":!0===a.hasM&&(b="XYM");return b}function In(a){a=a.f;return{hasZ:"XYZ"===a||"XYZM"===a,hasM:"XYM"===a||"XYZM"===a}}
var Hn={Point:function(a){return void 0!==a.m&&void 0!==a.z?new C([a.x,a.y,a.z,a.m],"XYZM"):void 0!==a.z?new C([a.x,a.y,a.z],"XYZ"):void 0!==a.m?new C([a.x,a.y,a.m],"XYM"):new C([a.x,a.y])},LineString:function(a){return new R(a.paths[0],Gn(a))},Polygon:function(a){return new E(a.rings,Gn(a))},MultiPoint:function(a){return new Bn(a.points,Gn(a))},MultiLineString:function(a){return new S(a.paths,Gn(a))},MultiPolygon:function(a){return new T(a.rings,Gn(a))}},Jn={Point:function(a){var b=a.Z();a=a.f;if("XYZ"===
a)return{x:b[0],y:b[1],z:b[2]};if("XYM"===a)return{x:b[0],y:b[1],m:b[2]};if("XYZM"===a)return{x:b[0],y:b[1],z:b[2],m:b[3]};if("XY"===a)return{x:b[0],y:b[1]}},LineString:function(a){var b=In(a);return{hasZ:b.hasZ,hasM:b.hasM,paths:[a.Z()]}},Polygon:function(a){var b=In(a);return{hasZ:b.hasZ,hasM:b.hasM,rings:a.Z(!1)}},MultiPoint:function(a){var b=In(a);return{hasZ:b.hasZ,hasM:b.hasM,points:a.Z()}},MultiLineString:function(a){var b=In(a);return{hasZ:b.hasZ,hasM:b.hasM,paths:a.Z()}},MultiPolygon:function(a){var b=
In(a);a=a.Z(!1);for(var c=[],d=0;d<a.length;d++)for(var e=a[d].length-1;0<=e;e--)c.push(a[d][e]);return{hasZ:b.hasZ,hasM:b.hasM,rings:c}}};k=En.prototype;k.Uc=function(a,b){var c=Fn(a.geometry,b),d=new Ik;this.b&&d.Ec(this.b);d.Ua(c);b&&b.mf&&a.attributes[b.mf]&&d.mc(a.attributes[b.mf]);a.attributes&&d.G(a.attributes);return d};
k.Jf=function(a,b){var c=b?b:{};if(a.features){var d=[],e=a.features,f,g;c.mf=a.objectIdFieldName;f=0;for(g=e.length;f<g;++f)d.push(this.Uc(e[f],c));return d}return[this.Uc(a,c)]};k.Rh=function(a,b){return Fn(a,b)};k.Yh=function(a){return a.spatialReference&&a.spatialReference.wkid?yc("EPSG:"+a.spatialReference.wkid):null};function Kn(a,b){return(0,Jn[a.X()])(un(a,!0,b),b)}k.Ke=function(a,b){return Kn(a,tn(this,b))};
k.Yc=function(a,b){b=tn(this,b);var c={},d=a.W();d&&(c.geometry=Kn(d,b));d=a.O();delete d[a.a];c.attributes=Ha(d)?{}:d;b&&b.featureProjection&&(c.spatialReference={wkid:yc(b.featureProjection).cb.split(":").pop()});return c};k.Ie=function(a,b){b=tn(this,b);var c=[],d,e;d=0;for(e=a.length;d<e;++d)c.push(this.Yc(a[d],b));return{features:c}};function Ln(a){Tc.call(this);this.c=a?a:null;Mn(this)}y(Ln,Tc);function Nn(a){var b=[],c,d;c=0;for(d=a.length;c<d;++c)b.push(a[c].clone());return b}function On(a){var b,c;if(a.c)for(b=0,c=a.c.length;b<c;++b)Qa(a.c[b],"change",a.u,a)}function Mn(a){var b,c;if(a.c)for(b=0,c=a.c.length;b<c;++b)B(a.c[b],"change",a.u,a)}k=Ln.prototype;k.clone=function(){var a=new Ln(null);a.hi(this.c);return a};
k.sb=function(a,b,c,d){if(d<Rb(this.H(),a,b))return d;var e=this.c,f,g;f=0;for(g=e.length;f<g;++f)d=e[f].sb(a,b,c,d);return d};k.Bc=function(a,b){var c=this.c,d,e;d=0;for(e=c.length;d<e;++d)if(c[d].Bc(a,b))return!0;return!1};k.Od=function(a){Wb(Infinity,Infinity,-Infinity,-Infinity,a);for(var b=this.c,c=0,d=b.length;c<d;++c)ac(a,b[c].H());return a};k.ff=function(){return Nn(this.c)};
k.od=function(a){this.s!=this.g&&(Fa(this.l),this.o=0,this.s=this.g);if(0>a||0!==this.o&&a<this.o)return this;var b=a.toString();if(this.l.hasOwnProperty(b))return this.l[b];var c=[],d=this.c,e=!1,f,g;f=0;for(g=d.length;f<g;++f){var h=d[f],l=h.od(a);c.push(l);l!==h&&(e=!0)}if(e)return a=new Ln(null),On(a),a.c=c,Mn(a),a.u(),this.l[b]=a;this.o=a;return this};k.X=function(){return"GeometryCollection"};k.Ka=function(a){var b=this.c,c,d;c=0;for(d=b.length;c<d;++c)if(b[c].Ka(a))return!0;return!1};
k.Ya=function(){return 0===this.c.length};k.rotate=function(a,b){for(var c=this.c,d=0,e=c.length;d<e;++d)c[d].rotate(a,b);this.u()};k.hi=function(a){a=Nn(a);On(this);this.c=a;Mn(this);this.u()};k.rc=function(a){var b=this.c,c,d;c=0;for(d=b.length;c<d;++c)b[c].rc(a);this.u()};k.Sc=function(a,b){var c=this.c,d,e;d=0;for(e=c.length;d<e;++d)c[d].Sc(a,b);this.u()};k.ka=function(){On(this);Tc.prototype.ka.call(this)};function Pn(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=yc(a.defaultDataProjection?a.defaultDataProjection:"EPSG:4326");this.b=a.geometryName}y(Pn,vn);function Qn(a,b){return a?un((0,Rn[a.type])(a),!1,b):null}function Sn(a,b){return(0,Tn[a.X()])(un(a,!0,b),b)}
var Rn={Point:function(a){return new C(a.coordinates)},LineString:function(a){return new R(a.coordinates)},Polygon:function(a){return new E(a.coordinates)},MultiPoint:function(a){return new Bn(a.coordinates)},MultiLineString:function(a){return new S(a.coordinates)},MultiPolygon:function(a){return new T(a.coordinates)},GeometryCollection:function(a,b){var c=a.geometries.map(function(a){return Qn(a,b)});return new Ln(c)}},Tn={Point:function(a){return{type:"Point",coordinates:a.Z()}},LineString:function(a){return{type:"LineString",
coordinates:a.Z()}},Polygon:function(a,b){var c;b&&(c=b.rightHanded);return{type:"Polygon",coordinates:a.Z(c)}},MultiPoint:function(a){return{type:"MultiPoint",coordinates:a.Z()}},MultiLineString:function(a){return{type:"MultiLineString",coordinates:a.Z()}},MultiPolygon:function(a,b){var c;b&&(c=b.rightHanded);return{type:"MultiPolygon",coordinates:a.Z(c)}},GeometryCollection:function(a,b){return{type:"GeometryCollection",geometries:a.c.map(function(a){var d=Ea({},b);delete d.featureProjection;return Sn(a,
d)})}},Circle:function(){return{type:"GeometryCollection",geometries:[]}}};k=Pn.prototype;k.Uc=function(a,b){var c=Qn(a.geometry,b),d=new Ik;this.b&&d.Ec(this.b);d.Ua(c);void 0!==a.id&&d.mc(a.id);a.properties&&d.G(a.properties);return d};k.Jf=function(a,b){if("Feature"==a.type)return[this.Uc(a,b)];if("FeatureCollection"==a.type){var c=[],d=a.features,e,f;e=0;for(f=d.length;e<f;++e)c.push(this.Uc(d[e],b));return c}return[]};k.Rh=function(a,b){return Qn(a,b)};
k.Yh=function(a){return(a=a.crs)?"name"==a.type?yc(a.properties.name):"EPSG"==a.type?yc("EPSG:"+a.properties.code):null:this.defaultDataProjection};k.Yc=function(a,b){b=tn(this,b);var c={type:"Feature"},d=a.Xa();void 0!==d&&(c.id=d);(d=a.W())?c.geometry=Sn(d,b):c.geometry=null;d=a.O();delete d[a.a];Ha(d)?c.properties=null:c.properties=d;return c};k.Ie=function(a,b){b=tn(this,b);var c=[],d,e;d=0;for(e=a.length;d<e;++d)c.push(this.Yc(a[d],b));return{type:"FeatureCollection",features:c}};
k.Ke=function(a,b){return Sn(a,tn(this,b))};function Un(){this.f=new XMLSerializer;this.defaultDataProjection=null}y(Un,rn);k=Un.prototype;k.X=function(){return"xml"};k.Rb=function(a,b){if(Pk(a))return Vn(this,a,b);if(Qk(a))return this.Ph(a,b);if("string"===typeof a){var c=Rk(a);return Vn(this,c,b)}return null};function Vn(a,b,c){a=Wn(a,b,c);return 0<a.length?a[0]:null}k.Fa=function(a,b){if(Pk(a))return Wn(this,a,b);if(Qk(a))return this.lc(a,b);if("string"===typeof a){var c=Rk(a);return Wn(this,c,b)}return[]};
function Wn(a,b,c){var d=[];for(b=b.firstChild;b;b=b.nextSibling)b.nodeType==Node.ELEMENT_NODE&&mb(d,a.lc(b,c));return d}k.Vc=function(a,b){if(Pk(a))return this.v(a,b);if(Qk(a)){var c=this.ye(a,[sn(this,a,b?b:{})]);return c?c:null}return"string"===typeof a?(c=Rk(a),this.v(c,b)):null};k.Oa=function(a){return Pk(a)?this.Pf(a):Qk(a)?this.Be(a):"string"===typeof a?(a=Rk(a),this.Pf(a)):null};k.Pf=function(){return this.defaultDataProjection};k.Be=function(){return this.defaultDataProjection};
k.Dd=function(a,b){var c=this.A(a,b);return this.f.serializeToString(c)};k.Xb=function(a,b){var c=this.a(a,b);return this.f.serializeToString(c)};k.Zc=function(a,b){var c=this.s(a,b);return this.f.serializeToString(c)};function Xn(a){a=a?a:{};this.featureType=a.featureType;this.featureNS=a.featureNS;this.srsName=a.srsName;this.schemaLocation="";this.b={};this.b["http://www.opengis.net/gml"]={featureMember:Uk(Xn.prototype.vd),featureMembers:Uk(Xn.prototype.vd)};Un.call(this)}y(Xn,Un);var Yn=/^[\s\xa0]*$/;k=Xn.prototype;
k.vd=function(a,b){var c=a.localName,d=null;if("FeatureCollection"==c)"http://www.opengis.net/wfs"===a.namespaceURI?d=O([],this.b,a,b,this):d=O(null,this.b,a,b,this);else if("featureMembers"==c||"featureMember"==c){var e=b[0],f=e.featureType,g=e.featureNS,h,l;if(!f&&a.childNodes){f=[];g={};h=0;for(l=a.childNodes.length;h<l;++h){var m=a.childNodes[h];if(1===m.nodeType){var n=m.nodeName.split(":").pop();if(-1===f.indexOf(n)){var p="",q=0,m=m.namespaceURI,r;for(r in g){if(g[r]===m){p=r;break}++q}p||
(p="p"+q,g[p]=m);f.push(p+":"+n)}}}"featureMember"!=c&&(e.featureType=f,e.featureNS=g)}"string"===typeof g&&(h=g,g={},g.p0=h);var e={},f=Array.isArray(f)?f:[f],u;for(u in g){n={};h=0;for(l=f.length;h<l;++h)(-1===f[h].indexOf(":")?"p0":f[h].split(":")[0])===u&&(n[f[h].split(":").pop()]="featureMembers"==c?Tk(this.If,this):Uk(this.If,this));e[g[u]]=n}"featureMember"==c?d=O(void 0,e,a,b):d=O([],e,a,b)}null===d&&(d=[]);return d};
k.ye=function(a,b){var c=b[0];c.srsName=a.firstElementChild.getAttribute("srsName");var d=O(null,this.bg,a,b,this);if(d)return un(d,!1,c)};
k.If=function(a,b){var c,d;(d=a.getAttribute("fid"))||(d=a.getAttributeNS("http://www.opengis.net/gml","id")||"");var e={},f;for(c=a.firstElementChild;c;c=c.nextElementSibling){var g=c.localName;if(0===c.childNodes.length||1===c.childNodes.length&&(3===c.firstChild.nodeType||4===c.firstChild.nodeType)){var h=Nk(c,!1);Yn.test(h)&&(h=void 0);e[g]=h}else"boundedBy"!==g&&(f=g),e[g]=this.ye(c,b)}c=new Ik(e);f&&c.Ec(f);d&&c.mc(d);return c};
k.Xh=function(a,b){var c=this.xe(a,b);if(c){var d=new C(null);d.ba("XYZ",c);return d}};k.Vh=function(a,b){var c=O([],this.Ui,a,b,this);if(c)return new Bn(c)};k.Uh=function(a,b){var c=O([],this.Ti,a,b,this);if(c){var d=new S(null);An(d,c);return d}};k.Wh=function(a,b){var c=O([],this.Vi,a,b,this);if(c){var d=new T(null);Dn(d,c);return d}};k.Mh=function(a,b){al(this.Yi,a,b,this)};k.Ug=function(a,b){al(this.Ri,a,b,this)};k.Nh=function(a,b){al(this.Zi,a,b,this)};
k.ze=function(a,b){var c=this.xe(a,b);if(c){var d=new R(null);d.ba("XYZ",c);return d}};k.zo=function(a,b){var c=O(null,this.Fd,a,b,this);if(c)return c};k.Th=function(a,b){var c=this.xe(a,b);if(c){var d=new zd(null);Ad(d,"XYZ",c);return d}};k.Ae=function(a,b){var c=O([null],this.Me,a,b,this);if(c&&c[0]){var d=new E(null),e=c[0],f=[e.length],g,h;g=1;for(h=c.length;g<h;++g)mb(e,c[g]),f.push(e.length);d.ba("XYZ",e,f);return d}};k.xe=function(a,b){return O(null,this.Fd,a,b,this)};
k.Ui={"http://www.opengis.net/gml":{pointMember:Tk(Xn.prototype.Mh),pointMembers:Tk(Xn.prototype.Mh)}};k.Ti={"http://www.opengis.net/gml":{lineStringMember:Tk(Xn.prototype.Ug),lineStringMembers:Tk(Xn.prototype.Ug)}};k.Vi={"http://www.opengis.net/gml":{polygonMember:Tk(Xn.prototype.Nh),polygonMembers:Tk(Xn.prototype.Nh)}};k.Yi={"http://www.opengis.net/gml":{Point:Tk(Xn.prototype.xe)}};k.Ri={"http://www.opengis.net/gml":{LineString:Tk(Xn.prototype.ze)}};k.Zi={"http://www.opengis.net/gml":{Polygon:Tk(Xn.prototype.Ae)}};
k.Gd={"http://www.opengis.net/gml":{LinearRing:Uk(Xn.prototype.zo)}};k.lc=function(a,b){var c={featureType:this.featureType,featureNS:this.featureNS};b&&Ea(c,sn(this,a,b));return this.vd(a,[c])||[]};k.Be=function(a){return yc(this.srsName?this.srsName:a.firstElementChild.getAttribute("srsName"))};function Zn(a){a=Nk(a,!1);return $n(a)}function $n(a){if(a=/^\s*(true|1)|(false|0)\s*$/.exec(a))return void 0!==a[1]||!1}
function ao(a){a=Nk(a,!1);if(a=/^\s*(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|(?:([+\-])(\d{2})(?::(\d{2}))?))\s*$/.exec(a)){var b=Date.UTC(parseInt(a[1],10),parseInt(a[2],10)-1,parseInt(a[3],10),parseInt(a[4],10),parseInt(a[5],10),parseInt(a[6],10))/1E3;if("Z"!=a[7]){var c="-"==a[8]?-1:1,b=b+60*c*parseInt(a[9],10);void 0!==a[10]&&(b+=3600*c*parseInt(a[10],10))}return b}}function bo(a){a=Nk(a,!1);return co(a)}
function co(a){if(a=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(a))return parseFloat(a[1])}function eo(a){a=Nk(a,!1);return fo(a)}function fo(a){if(a=/^\s*(\d+)\s*$/.exec(a))return parseInt(a[1],10)}function U(a){return Nk(a,!1).trim()}function go(a,b){ho(a,b?"1":"0")}function io(a,b){a.appendChild(Lk.createTextNode(b.toPrecision()))}function jo(a,b){a.appendChild(Lk.createTextNode(b.toString()))}function ho(a,b){a.appendChild(Lk.createTextNode(b))};function ko(a){a=a?a:{};Xn.call(this,a);this.b["http://www.opengis.net/gml"].featureMember=Tk(Xn.prototype.vd);this.schemaLocation=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/gml http://schemas.opengis.net/gml/2.1.2/feature.xsd"}y(ko,Xn);k=ko.prototype;
k.Qh=function(a,b){var c=Nk(a,!1).replace(/^\s*|\s*$/g,""),d=b[0].srsName,e=a.parentNode.getAttribute("srsDimension"),f="enu";d&&(d=yc(d))&&(f=d.b);c=c.split(/[\s,]+/);d=2;a.getAttribute("srsDimension")?d=fo(a.getAttribute("srsDimension")):a.getAttribute("dimension")?d=fo(a.getAttribute("dimension")):e&&(d=fo(e));for(var g,h,l=[],m=0,n=c.length;m<n;m+=d)e=parseFloat(c[m]),g=parseFloat(c[m+1]),h=3===d?parseFloat(c[m+2]):0,"en"===f.substr(0,2)?l.push(e,g,h):l.push(g,e,h);return l};
k.wo=function(a,b){var c=O([null],this.Ni,a,b,this);return Wb(c[1][0],c[1][1],c[1][3],c[1][4])};k.ml=function(a,b){var c=O(void 0,this.Gd,a,b,this);c&&b[b.length-1].push(c)};k.eo=function(a,b){var c=O(void 0,this.Gd,a,b,this);c&&(b[b.length-1][0]=c)};k.Fd={"http://www.opengis.net/gml":{coordinates:Uk(ko.prototype.Qh)}};k.Me={"http://www.opengis.net/gml":{innerBoundaryIs:ko.prototype.ml,outerBoundaryIs:ko.prototype.eo}};k.Ni={"http://www.opengis.net/gml":{coordinates:Tk(ko.prototype.Qh)}};
k.bg={"http://www.opengis.net/gml":{Point:Uk(Xn.prototype.Xh),MultiPoint:Uk(Xn.prototype.Vh),LineString:Uk(Xn.prototype.ze),MultiLineString:Uk(Xn.prototype.Uh),LinearRing:Uk(Xn.prototype.Th),Polygon:Uk(Xn.prototype.Ae),MultiPolygon:Uk(Xn.prototype.Wh),Box:Uk(ko.prototype.wo)}};function lo(a){a=a?a:{};Xn.call(this,a);this.j=void 0!==a.surface?a.surface:!1;this.i=void 0!==a.curve?a.curve:!1;this.l=void 0!==a.multiCurve?a.multiCurve:!0;this.o=void 0!==a.multiSurface?a.multiSurface:!0;this.schemaLocation=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/gml http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd"}y(lo,Xn);k=lo.prototype;k.Do=function(a,b){var c=O([],this.Si,a,b,this);if(c){var d=new S(null);An(d,c);return d}};
k.Eo=function(a,b){var c=O([],this.Wi,a,b,this);if(c){var d=new T(null);Dn(d,c);return d}};k.vg=function(a,b){al(this.Oi,a,b,this)};k.vi=function(a,b){al(this.cj,a,b,this)};k.Ho=function(a,b){return O([null],this.Xi,a,b,this)};k.Jo=function(a,b){return O([null],this.bj,a,b,this)};k.Io=function(a,b){return O([null],this.Me,a,b,this)};k.Co=function(a,b){return O([null],this.Fd,a,b,this)};k.ol=function(a,b){var c=O(void 0,this.Gd,a,b,this);c&&b[b.length-1].push(c)};
k.Hj=function(a,b){var c=O(void 0,this.Gd,a,b,this);c&&(b[b.length-1][0]=c)};k.Zh=function(a,b){var c=O([null],this.dj,a,b,this);if(c&&c[0]){var d=new E(null),e=c[0],f=[e.length],g,h;g=1;for(h=c.length;g<h;++g)mb(e,c[g]),f.push(e.length);d.ba("XYZ",e,f);return d}};k.Oh=function(a,b){var c=O([null],this.Pi,a,b,this);if(c){var d=new R(null);d.ba("XYZ",c);return d}};k.yo=function(a,b){var c=O([null],this.Qi,a,b,this);return Wb(c[1][0],c[1][1],c[2][0],c[2][1])};
k.Ao=function(a,b){for(var c=Nk(a,!1),d=/^\s*([+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?)\s*/,e=[],f;f=d.exec(c);)e.push(parseFloat(f[1])),c=c.substr(f[0].length);if(""===c){c=b[0].srsName;d="enu";c&&(d=yc(c).b);if("neu"===d)for(c=0,d=e.length;c<d;c+=3)f=e[c],e[c]=e[c+1],e[c+1]=f;c=e.length;2==c&&e.push(0);return 0===c?void 0:e}};
k.Mf=function(a,b){var c=Nk(a,!1).replace(/^\s*|\s*$/g,""),d=b[0].srsName,e=a.parentNode.getAttribute("srsDimension"),f="enu";d&&(f=yc(d).b);c=c.split(/\s+/);d=2;a.getAttribute("srsDimension")?d=fo(a.getAttribute("srsDimension")):a.getAttribute("dimension")?d=fo(a.getAttribute("dimension")):e&&(d=fo(e));for(var g,h,l=[],m=0,n=c.length;m<n;m+=d)e=parseFloat(c[m]),g=parseFloat(c[m+1]),h=3===d?parseFloat(c[m+2]):0,"en"===f.substr(0,2)?l.push(e,g,h):l.push(g,e,h);return l};
k.Fd={"http://www.opengis.net/gml":{pos:Uk(lo.prototype.Ao),posList:Uk(lo.prototype.Mf)}};k.Me={"http://www.opengis.net/gml":{interior:lo.prototype.ol,exterior:lo.prototype.Hj}};
k.bg={"http://www.opengis.net/gml":{Point:Uk(Xn.prototype.Xh),MultiPoint:Uk(Xn.prototype.Vh),LineString:Uk(Xn.prototype.ze),MultiLineString:Uk(Xn.prototype.Uh),LinearRing:Uk(Xn.prototype.Th),Polygon:Uk(Xn.prototype.Ae),MultiPolygon:Uk(Xn.prototype.Wh),Surface:Uk(lo.prototype.Zh),MultiSurface:Uk(lo.prototype.Eo),Curve:Uk(lo.prototype.Oh),MultiCurve:Uk(lo.prototype.Do),Envelope:Uk(lo.prototype.yo)}};k.Si={"http://www.opengis.net/gml":{curveMember:Tk(lo.prototype.vg),curveMembers:Tk(lo.prototype.vg)}};
k.Wi={"http://www.opengis.net/gml":{surfaceMember:Tk(lo.prototype.vi),surfaceMembers:Tk(lo.prototype.vi)}};k.Oi={"http://www.opengis.net/gml":{LineString:Tk(Xn.prototype.ze),Curve:Tk(lo.prototype.Oh)}};k.cj={"http://www.opengis.net/gml":{Polygon:Tk(Xn.prototype.Ae),Surface:Tk(lo.prototype.Zh)}};k.dj={"http://www.opengis.net/gml":{patches:Uk(lo.prototype.Ho)}};k.Pi={"http://www.opengis.net/gml":{segments:Uk(lo.prototype.Jo)}};k.Qi={"http://www.opengis.net/gml":{lowerCorner:Tk(lo.prototype.Mf),upperCorner:Tk(lo.prototype.Mf)}};
k.Xi={"http://www.opengis.net/gml":{PolygonPatch:Uk(lo.prototype.Io)}};k.bj={"http://www.opengis.net/gml":{LineStringSegment:Uk(lo.prototype.Co)}};function mo(a,b,c){c=c[c.length-1].srsName;b=b.Z();for(var d=b.length,e=Array(d),f,g=0;g<d;++g){f=b[g];var h=g,l="enu";c&&(l=yc(c).b);e[h]="en"===l.substr(0,2)?f[0]+" "+f[1]:f[1]+" "+f[0]}ho(a,e.join(" "))}
k.Ji=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);d=Mk(a.namespaceURI,"pos");a.appendChild(d);c=c[c.length-1].srsName;a="enu";c&&(a=yc(c).b);b=b.Z();ho(d,"en"===a.substr(0,2)?b[0]+" "+b[1]:b[1]+" "+b[0])};var no={"http://www.opengis.net/gml":{lowerCorner:L(ho),upperCorner:L(ho)}};k=lo.prototype;k.xp=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);bl({node:a},no,Zk,[b[0]+" "+b[1],b[2]+" "+b[3]],c,["lowerCorner","upperCorner"],this)};
k.Gi=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);d=Mk(a.namespaceURI,"posList");a.appendChild(d);mo(d,b,c)};k.aj=function(a,b){var c=b[b.length-1],d=c.node,e=c.exteriorWritten;void 0===e&&(c.exteriorWritten=!0);return Mk(d.namespaceURI,void 0!==e?"interior":"exterior")};
k.Le=function(a,b,c){var d=c[c.length-1].srsName;"PolygonPatch"!==a.nodeName&&d&&a.setAttribute("srsName",d);"Polygon"===a.nodeName||"PolygonPatch"===a.nodeName?(b=b.Vd(),bl({node:a,srsName:d},oo,this.aj,b,c,void 0,this)):"Surface"===a.nodeName&&(d=Mk(a.namespaceURI,"patches"),a.appendChild(d),a=Mk(d.namespaceURI,"PolygonPatch"),d.appendChild(a),this.Le(a,b,c))};
k.Ge=function(a,b,c){var d=c[c.length-1].srsName;"LineStringSegment"!==a.nodeName&&d&&a.setAttribute("srsName",d);"LineString"===a.nodeName||"LineStringSegment"===a.nodeName?(d=Mk(a.namespaceURI,"posList"),a.appendChild(d),mo(d,b,c)):"Curve"===a.nodeName&&(d=Mk(a.namespaceURI,"segments"),a.appendChild(d),a=Mk(d.namespaceURI,"LineStringSegment"),d.appendChild(a),this.Ge(a,b,c))};
k.Ii=function(a,b,c){var d=c[c.length-1],e=d.srsName,d=d.surface;e&&a.setAttribute("srsName",e);b=b.Wd();bl({node:a,srsName:e,surface:d},po,this.c,b,c,void 0,this)};k.yp=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);b=b.je();bl({node:a,srsName:d},qo,Xk("pointMember"),b,c,void 0,this)};k.Hi=function(a,b,c){var d=c[c.length-1],e=d.srsName,d=d.curve;e&&a.setAttribute("srsName",e);b=b.md();bl({node:a,srsName:e,curve:d},ro,this.c,b,c,void 0,this)};
k.Ki=function(a,b,c){var d=Mk(a.namespaceURI,"LinearRing");a.appendChild(d);this.Gi(d,b,c)};k.Li=function(a,b,c){var d=this.g(b,c);d&&(a.appendChild(d),this.Le(d,b,c))};k.zp=function(a,b,c){var d=Mk(a.namespaceURI,"Point");a.appendChild(d);this.Ji(d,b,c)};k.Fi=function(a,b,c){var d=this.g(b,c);d&&(a.appendChild(d),this.Ge(d,b,c))};
k.Je=function(a,b,c){var d=c[c.length-1],e=Ea({},d);e.node=a;var f;Array.isArray(b)?d.dataProjection?f=Sc(b,d.featureProjection,d.dataProjection):f=b:f=un(b,!0,d);bl(e,so,this.g,[f],c,void 0,this)};
k.Bi=function(a,b,c){var d=b.Xa();d&&a.setAttribute("fid",d);var d=c[c.length-1],e=d.featureNS,f=b.a;d.Dc||(d.Dc={},d.Dc[e]={});var g=b.O();b=[];var h=[],l;for(l in g){var m=g[l];null!==m&&(b.push(l),h.push(m),l==f||m instanceof Tc?l in d.Dc[e]||(d.Dc[e][l]=L(this.Je,this)):l in d.Dc[e]||(d.Dc[e][l]=L(ho)))}l=Ea({},d);l.node=a;bl(l,d.Dc,Xk(void 0,e),h,c,b)};
var po={"http://www.opengis.net/gml":{surfaceMember:L(lo.prototype.Li),polygonMember:L(lo.prototype.Li)}},qo={"http://www.opengis.net/gml":{pointMember:L(lo.prototype.zp)}},ro={"http://www.opengis.net/gml":{lineStringMember:L(lo.prototype.Fi),curveMember:L(lo.prototype.Fi)}},oo={"http://www.opengis.net/gml":{exterior:L(lo.prototype.Ki),interior:L(lo.prototype.Ki)}},so={"http://www.opengis.net/gml":{Curve:L(lo.prototype.Ge),MultiCurve:L(lo.prototype.Hi),Point:L(lo.prototype.Ji),MultiPoint:L(lo.prototype.yp),
LineString:L(lo.prototype.Ge),MultiLineString:L(lo.prototype.Hi),LinearRing:L(lo.prototype.Gi),Polygon:L(lo.prototype.Le),MultiPolygon:L(lo.prototype.Ii),Surface:L(lo.prototype.Le),MultiSurface:L(lo.prototype.Ii),Envelope:L(lo.prototype.xp)}},to={MultiLineString:"lineStringMember",MultiCurve:"curveMember",MultiPolygon:"polygonMember",MultiSurface:"surfaceMember"};lo.prototype.c=function(a,b){return Mk("http://www.opengis.net/gml",to[b[b.length-1].node.nodeName])};
lo.prototype.g=function(a,b){var c=b[b.length-1],d=c.multiSurface,e=c.surface,f=c.curve,c=c.multiCurve,g;Array.isArray(a)?g="Envelope":(g=a.X(),"MultiPolygon"===g&&!0===d?g="MultiSurface":"Polygon"===g&&!0===e?g="Surface":"LineString"===g&&!0===f?g="Curve":"MultiLineString"===g&&!0===c&&(g="MultiCurve"));return Mk("http://www.opengis.net/gml",g)};
lo.prototype.s=function(a,b){b=tn(this,b);var c=Mk("http://www.opengis.net/gml","geom"),d={node:c,srsName:this.srsName,curve:this.i,surface:this.j,multiSurface:this.o,multiCurve:this.l};b&&Ea(d,b);this.Je(c,a,[d]);return c};
lo.prototype.a=function(a,b){b=tn(this,b);var c=Mk("http://www.opengis.net/gml","featureMembers");c.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.schemaLocation);var d={srsName:this.srsName,curve:this.i,surface:this.j,multiSurface:this.o,multiCurve:this.l,featureNS:this.featureNS,featureType:this.featureType};b&&Ea(d,b);var d=[d],e=d[d.length-1],f=e.featureType,g=e.featureNS,h={};h[g]={};h[g][f]=L(this.Bi,this);e=Ea({},e);e.node=c;bl(e,h,Xk(f,g),a,d);return c};function uo(a){a=a?a:{};Un.call(this);this.defaultDataProjection=yc("EPSG:4326");this.b=a.readExtensions}y(uo,Un);var vo=[null,"http://www.topografix.com/GPX/1/0","http://www.topografix.com/GPX/1/1"];function wo(a,b,c){a.push(parseFloat(b.getAttribute("lon")),parseFloat(b.getAttribute("lat")));"ele"in c?(a.push(c.ele),delete c.ele):a.push(0);"time"in c?(a.push(c.time),delete c.time):a.push(0);return a}function xo(a,b){var c=b[b.length-1],d=a.getAttribute("href");null!==d&&(c.link=d);al(yo,a,b)}
function zo(a,b){b[b.length-1].extensionsNode_=a}function Ao(a,b){var c=b[0],d=O({flatCoordinates:[]},Bo,a,b);if(d){var e=d.flatCoordinates;delete d.flatCoordinates;var f=new R(null);f.ba("XYZM",e);un(f,!1,c);c=new Ik(f);c.G(d);return c}}function Co(a,b){var c=b[0],d=O({flatCoordinates:[],ends:[]},Do,a,b);if(d){var e=d.flatCoordinates;delete d.flatCoordinates;var f=d.ends;delete d.ends;var g=new S(null);g.ba("XYZM",e,f);un(g,!1,c);c=new Ik(g);c.G(d);return c}}
function Eo(a,b){var c=b[0],d=O({},Fo,a,b);if(d){var e=wo([],a,d),e=new C(e,"XYZM");un(e,!1,c);c=new Ik(e);c.G(d);return c}}
var Go={rte:Ao,trk:Co,wpt:Eo},Ho=M(vo,{rte:Tk(Ao),trk:Tk(Co),wpt:Tk(Eo)}),yo=M(vo,{text:J(U,"linkText"),type:J(U,"linkType")}),Bo=M(vo,{name:J(U),cmt:J(U),desc:J(U),src:J(U),link:xo,number:J(eo),extensions:zo,type:J(U),rtept:function(a,b){var c=O({},Io,a,b);c&&wo(b[b.length-1].flatCoordinates,a,c)}}),Io=M(vo,{ele:J(bo),time:J(ao)}),Do=M(vo,{name:J(U),cmt:J(U),desc:J(U),src:J(U),link:xo,number:J(eo),type:J(U),extensions:zo,trkseg:function(a,b){var c=b[b.length-1];al(Jo,a,b);c.ends.push(c.flatCoordinates.length)}}),
Jo=M(vo,{trkpt:function(a,b){var c=O({},Ko,a,b);c&&wo(b[b.length-1].flatCoordinates,a,c)}}),Ko=M(vo,{ele:J(bo),time:J(ao)}),Fo=M(vo,{ele:J(bo),time:J(ao),magvar:J(bo),geoidheight:J(bo),name:J(U),cmt:J(U),desc:J(U),src:J(U),link:xo,sym:J(U),type:J(U),fix:J(U),sat:J(eo),hdop:J(bo),vdop:J(bo),pdop:J(bo),ageofdgpsdata:J(bo),dgpsid:J(eo),extensions:zo});
function Lo(a,b){b||(b=[]);for(var c=0,d=b.length;c<d;++c){var e=b[c];if(a.b){var f=e.get("extensionsNode_")||null;a.b(e,f)}e.set("extensionsNode_",void 0)}}uo.prototype.Ph=function(a,b){if(!jb(vo,a.namespaceURI))return null;var c=Go[a.localName];if(!c)return null;c=c(a,[sn(this,a,b)]);if(!c)return null;Lo(this,[c]);return c};uo.prototype.lc=function(a,b){if(!jb(vo,a.namespaceURI))return[];if("gpx"==a.localName){var c=O([],Ho,a,[sn(this,a,b)]);if(c)return Lo(this,c),c}return[]};
function Mo(a,b,c){a.setAttribute("href",b);b=c[c.length-1].properties;bl({node:a},No,Zk,[b.linkText,b.linkType],c,Oo)}function Po(a,b,c){var d=c[c.length-1],e=d.node.namespaceURI,f=d.properties;a.setAttributeNS(null,"lat",b[1]);a.setAttributeNS(null,"lon",b[0]);switch(d.geometryLayout){case "XYZM":0!==b[3]&&(f.time=b[3]);case "XYZ":0!==b[2]&&(f.ele=b[2]);break;case "XYM":0!==b[2]&&(f.time=b[2])}b="rtept"==a.nodeName?Qo[e]:Ro[e];d=$k(f,b);bl({node:a,properties:f},So,Zk,d,c,b)}
var Oo=["text","type"],No=M(vo,{text:L(ho),type:L(ho)}),To=M(vo,"name cmt desc src link number type rtept".split(" ")),Uo=M(vo,{name:L(ho),cmt:L(ho),desc:L(ho),src:L(ho),link:L(Mo),number:L(jo),type:L(ho),rtept:Wk(L(Po))}),Qo=M(vo,["ele","time"]),Vo=M(vo,"name cmt desc src link number type trkseg".split(" ")),Yo=M(vo,{name:L(ho),cmt:L(ho),desc:L(ho),src:L(ho),link:L(Mo),number:L(jo),type:L(ho),trkseg:Wk(L(function(a,b,c){bl({node:a,geometryLayout:b.f,properties:{}},Wo,Xo,b.Z(),c)}))}),Xo=Xk("trkpt"),
Wo=M(vo,{trkpt:L(Po)}),Ro=M(vo,"ele time magvar geoidheight name cmt desc src link sym type fix sat hdop vdop pdop ageofdgpsdata dgpsid".split(" ")),So=M(vo,{ele:L(io),time:L(function(a,b){var c=new Date(1E3*b);a.appendChild(Lk.createTextNode(c.getUTCFullYear()+"-"+zb(c.getUTCMonth()+1)+"-"+zb(c.getUTCDate())+"T"+zb(c.getUTCHours())+":"+zb(c.getUTCMinutes())+":"+zb(c.getUTCSeconds())+"Z"))}),magvar:L(io),geoidheight:L(io),name:L(ho),cmt:L(ho),desc:L(ho),src:L(ho),link:L(Mo),sym:L(ho),type:L(ho),fix:L(ho),
sat:L(jo),hdop:L(io),vdop:L(io),pdop:L(io),ageofdgpsdata:L(io),dgpsid:L(jo)}),Zo={Point:"wpt",LineString:"rte",MultiLineString:"trk"};function $o(a,b){var c=a.W();if(c&&(c=Zo[c.X()]))return Mk(b[b.length-1].node.namespaceURI,c)}
var ap=M(vo,{rte:L(function(a,b,c){var d=c[0],e=b.O();a={node:a,properties:e};if(b=b.W())b=un(b,!0,d),a.geometryLayout=b.f,e.rtept=b.Z();d=To[c[c.length-1].node.namespaceURI];e=$k(e,d);bl(a,Uo,Zk,e,c,d)}),trk:L(function(a,b,c){var d=c[0],e=b.O();a={node:a,properties:e};if(b=b.W())b=un(b,!0,d),e.trkseg=b.md();d=Vo[c[c.length-1].node.namespaceURI];e=$k(e,d);bl(a,Yo,Zk,e,c,d)}),wpt:L(function(a,b,c){var d=c[0],e=c[c.length-1];e.properties=b.O();if(b=b.W())b=un(b,!0,d),e.geometryLayout=b.f,Po(a,b.Z(),
c)})});uo.prototype.a=function(a,b){b=tn(this,b);var c=Mk("http://www.topografix.com/GPX/1/1","gpx");c.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");c.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation","http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd");c.setAttribute("version","1.1");c.setAttribute("creator","OpenLayers 3");bl({node:c},ap,$o,a,[b]);return c};function bp(){this.defaultDataProjection=null}y(bp,rn);function cp(a){return"string"===typeof a?a:""}k=bp.prototype;k.X=function(){return"text"};k.Rb=function(a,b){return this.ud(cp(a),tn(this,b))};k.Fa=function(a,b){return this.Kf(cp(a),tn(this,b))};k.Vc=function(a,b){return this.wd(cp(a),tn(this,b))};k.Oa=function(a){cp(a);return this.defaultDataProjection};k.Dd=function(a,b){return this.He(a,tn(this,b))};k.Xb=function(a,b){return this.Ci(a,tn(this,b))};
k.Zc=function(a,b){return this.Ed(a,tn(this,b))};function dp(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=yc("EPSG:4326");this.b=a.altitudeMode?a.altitudeMode:"none"}y(dp,bp);var ep=/^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{5})([NS])(\d{3})(\d{5})([EW])([AV])(\d{5})(\d{5})/,fp=/^H.([A-Z]{3}).*?:(.*)/,gp=/^HFDTE(\d{2})(\d{2})(\d{2})/,hp=/\r\n|\r|\n/;
dp.prototype.ud=function(a,b){var c=this.b,d=a.split(hp),e={},f=[],g=2E3,h=0,l=1,m=-1,n,p;n=0;for(p=d.length;n<p;++n){var q=d[n],r;if("B"==q.charAt(0)){if(r=ep.exec(q)){var q=parseInt(r[1],10),u=parseInt(r[2],10),x=parseInt(r[3],10),v=parseInt(r[4],10)+parseInt(r[5],10)/6E4;"S"==r[6]&&(v=-v);var D=parseInt(r[7],10)+parseInt(r[8],10)/6E4;"W"==r[9]&&(D=-D);f.push(D,v);"none"!=c&&f.push("gps"==c?parseInt(r[11],10):"barometric"==c?parseInt(r[12],10):0);r=Date.UTC(g,h,l,q,u,x);r<m&&(r=Date.UTC(g,h,l+1,
q,u,x));f.push(r/1E3);m=r}}else"H"==q.charAt(0)&&((r=gp.exec(q))?(l=parseInt(r[1],10),h=parseInt(r[2],10)-1,g=2E3+parseInt(r[3],10)):(r=fp.exec(q))&&(e[r[1]]=r[2].trim()))}if(0===f.length)return null;d=new R(null);d.ba("none"==c?"XYM":"XYZM",f);c=new Ik(un(d,!1,b));c.G(e);return c};dp.prototype.Kf=function(a,b){var c=this.ud(a,b);return c?[c]:[]};function ip(a,b){this.a={};this.b=[];this.g=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else if(a){var e;if(a instanceof ip)e=a.N(),d=a.zc();else{var c=[],f=0;for(e in a)c[f++]=e;e=c;c=[];f=0;for(d in a)c[f++]=a[d];d=c}for(c=0;c<e.length;c++)this.set(e[c],d[c])}}k=ip.prototype;k.wc=function(){return this.g};k.zc=function(){jp(this);for(var a=[],b=0;b<this.b.length;b++)a.push(this.a[this.b[b]]);return a};
k.N=function(){jp(this);return this.b.concat()};k.Ya=function(){return 0==this.g};k.clear=function(){this.a={};this.g=this.b.length=0};k.remove=function(a){return kp(this.a,a)?(delete this.a[a],this.g--,this.b.length>2*this.g&&jp(this),!0):!1};function jp(a){if(a.g!=a.b.length){for(var b=0,c=0;b<a.b.length;){var d=a.b[b];kp(a.a,d)&&(a.b[c++]=d);b++}a.b.length=c}if(a.g!=a.b.length){for(var e={},c=b=0;b<a.b.length;)d=a.b[b],kp(e,d)||(a.b[c++]=d,e[d]=1),b++;a.b.length=c}}
k.get=function(a,b){return kp(this.a,a)?this.a[a]:b};k.set=function(a,b){kp(this.a,a)||(this.g++,this.b.push(a));this.a[a]=b};k.forEach=function(a,b){for(var c=this.N(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this)}};k.clone=function(){return new ip(this)};function kp(a,b){return Object.prototype.hasOwnProperty.call(a,b)};var lp=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;function mp(a,b){if(a)for(var c=a.split("&"),d=0;d<c.length;d++){var e=c[d].indexOf("="),f,g=null;0<=e?(f=c[d].substring(0,e),g=c[d].substring(e+1)):f=c[d];b(f,g?decodeURIComponent(g.replace(/\+/g," ")):"")}};function np(a,b){this.a=this.l=this.g="";this.o=null;this.f=this.b="";this.c=!1;var c;a instanceof np?(this.c=void 0!==b?b:a.c,op(this,a.g),this.l=a.l,this.a=a.a,pp(this,a.o),this.b=a.b,qp(this,a.i.clone()),this.f=a.f):a&&(c=String(a).match(lp))?(this.c=!!b,op(this,c[1]||"",!0),this.l=rp(c[2]||""),this.a=rp(c[3]||"",!0),pp(this,c[4]),this.b=rp(c[5]||"",!0),qp(this,c[6]||"",!0),this.f=rp(c[7]||"")):(this.c=!!b,this.i=new sp(null,0,this.c))}
np.prototype.toString=function(){var a=[],b=this.g;b&&a.push(tp(b,up,!0),":");var c=this.a;if(c||"file"==b)a.push("//"),(b=this.l)&&a.push(tp(b,up,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.o,null!=c&&a.push(":",String(c));if(c=this.b)this.a&&"/"!=c.charAt(0)&&a.push("/"),a.push(tp(c,"/"==c.charAt(0)?vp:wp,!0));(c=this.i.toString())&&a.push("?",c);(c=this.f)&&a.push("#",tp(c,xp));return a.join("")};np.prototype.clone=function(){return new np(this)};
function op(a,b,c){a.g=c?rp(b,!0):b;a.g&&(a.g=a.g.replace(/:$/,""))}function pp(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.o=b}else a.o=null}function qp(a,b,c){b instanceof sp?(a.i=b,yp(a.i,a.c)):(c||(b=tp(b,zp)),a.i=new sp(b,0,a.c))}function Ap(a){return a instanceof np?a.clone():new np(a,void 0)}
function Bp(a,b){a instanceof np||(a=Ap(a));b instanceof np||(b=Ap(b));var c=a,d=b,e=c.clone(),f=!!d.g;f?op(e,d.g):f=!!d.l;f?e.l=d.l:f=!!d.a;f?e.a=d.a:f=null!=d.o;var g=d.b;if(f)pp(e,d.o);else if(f=!!d.b)if("/"!=g.charAt(0)&&(c.a&&!c.b?g="/"+g:(c=e.b.lastIndexOf("/"),-1!=c&&(g=e.b.substr(0,c+1)+g))),c=g,".."==c||"."==c)g="";else if(-1!=c.indexOf("./")||-1!=c.indexOf("/.")){for(var g=0==c.lastIndexOf("/",0),c=c.split("/"),h=[],l=0;l<c.length;){var m=c[l++];"."==m?g&&l==c.length&&h.push(""):".."==m?
((1<h.length||1==h.length&&""!=h[0])&&h.pop(),g&&l==c.length&&h.push("")):(h.push(m),g=!0)}g=h.join("/")}else g=c;f?e.b=g:f=""!==d.i.toString();f?qp(e,rp(d.i.toString())):f=!!d.f;f&&(e.f=d.f);return e}function rp(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function tp(a,b,c){return da(a)?(a=encodeURI(a).replace(b,Cp),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Cp(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}
var up=/[#\/\?@]/g,wp=/[\#\?:]/g,vp=/[\#\?]/g,zp=/[\#\?@]/g,xp=/#/g;function sp(a,b,c){this.a=this.b=null;this.g=a||null;this.f=!!c}function Dp(a){a.b||(a.b=new ip,a.a=0,a.g&&mp(a.g,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))}k=sp.prototype;k.wc=function(){Dp(this);return this.a};k.add=function(a,b){Dp(this);this.g=null;a=Ep(this,a);var c=this.b.get(a);c||this.b.set(a,c=[]);c.push(b);this.a=this.a+1;return this};
k.remove=function(a){Dp(this);a=Ep(this,a);return kp(this.b.a,a)?(this.g=null,this.a=this.a-this.b.get(a).length,this.b.remove(a)):!1};k.clear=function(){this.b=this.g=null;this.a=0};k.Ya=function(){Dp(this);return 0==this.a};function Fp(a,b){Dp(a);b=Ep(a,b);return kp(a.b.a,b)}k.N=function(){Dp(this);for(var a=this.b.zc(),b=this.b.N(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};
k.zc=function(a){Dp(this);var b=[];if(da(a))Fp(this,a)&&(b=ne(b,this.b.get(Ep(this,a))));else{a=this.b.zc();for(var c=0;c<a.length;c++)b=ne(b,a[c])}return b};k.set=function(a,b){Dp(this);this.g=null;a=Ep(this,a);Fp(this,a)&&(this.a=this.a-this.b.get(a).length);this.b.set(a,[b]);this.a=this.a+1;return this};k.get=function(a,b){var c=a?this.zc(a):[];return 0<c.length?String(c[0]):b};
k.toString=function(){if(this.g)return this.g;if(!this.b)return"";for(var a=[],b=this.b.N(),c=0;c<b.length;c++)for(var d=b[c],e=encodeURIComponent(String(d)),d=this.zc(d),f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g)}return this.g=a.join("&")};k.clone=function(){var a=new sp;a.g=this.g;this.b&&(a.b=this.b.clone(),a.a=this.a);return a};function Ep(a,b){var c=String(b);a.f&&(c=c.toLowerCase());return c}
function yp(a,b){b&&!a.f&&(Dp(a),a.g=null,a.b.forEach(function(a,b){var e=b.toLowerCase();b!=e&&(this.remove(b),this.remove(e),0<a.length&&(this.g=null,this.b.set(Ep(this,e),oe(a)),this.a=this.a+a.length))},a));a.f=b};function Gp(a){a=a||{};this.g=a.font;this.i=a.rotation;this.a=a.scale;this.s=a.text;this.o=a.textAlign;this.j=a.textBaseline;this.b=void 0!==a.fill?a.fill:new ij({color:"#333"});this.l=void 0!==a.stroke?a.stroke:null;this.f=void 0!==a.offsetX?a.offsetX:0;this.c=void 0!==a.offsetY?a.offsetY:0}k=Gp.prototype;k.Xj=function(){return this.g};k.kk=function(){return this.f};k.lk=function(){return this.c};k.Un=function(){return this.b};k.Vn=function(){return this.i};k.Wn=function(){return this.a};k.Xn=function(){return this.l};
k.Ha=function(){return this.s};k.yk=function(){return this.o};k.zk=function(){return this.j};k.bp=function(a){this.g=a};k.mi=function(a){this.f=a};k.ni=function(a){this.c=a};k.ap=function(a){this.b=a};k.Yn=function(a){this.i=a};k.Zn=function(a){this.a=a};k.ip=function(a){this.l=a};k.pi=function(a){this.s=a};k.ri=function(a){this.o=a};k.jp=function(a){this.j=a};function Hp(a){a=a?a:{};Un.call(this);this.defaultDataProjection=yc("EPSG:4326");this.g=a.defaultStyle?a.defaultStyle:Ip;this.c=void 0!==a.extractStyles?a.extractStyles:!0;this.l=void 0!==a.writeStyles?a.writeStyles:!0;this.b={};this.i=void 0!==a.showPointNames?a.showPointNames:!0}y(Hp,Un);
var Jp=["http://www.google.com/kml/ext/2.2"],Kp=[null,"http://earth.google.com/kml/2.0","http://earth.google.com/kml/2.1","http://earth.google.com/kml/2.2","http://www.opengis.net/kml/2.2"],Lp=[255,255,255,1],Mp=new ij({color:Lp}),Np=[20,2],Op=[64,64],Pp=new Dh({anchor:Np,anchorOrigin:"bottom-left",anchorXUnits:"pixels",anchorYUnits:"pixels",crossOrigin:"anonymous",rotation:0,scale:.5,size:Op,src:"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"}),Qp=new oj({color:Lp,width:1}),Rp=new Gp({font:"bold 16px Helvetica",
fill:Mp,stroke:new oj({color:[51,51,51,1],width:2}),scale:.8}),Ip=[new rj({fill:Mp,image:Pp,text:Rp,stroke:Qp,zIndex:0})],Sp={fraction:"fraction",pixels:"pixels"};function Tp(a,b){var c,d=[0,0],e="start";if(a.a){var f=a.a.ld();f&&2==f.length&&(d[0]=a.a.i*f[0]/2,d[1]=-a.a.i*f[1]/2,e="left")}if(Ha(a.Ha()))c=new Gp({text:b,offsetX:d[0],offsetY:d[1],textAlign:e});else{var f=a.Ha(),g={};for(c in f)g[c]=f[c];c=g;c.pi(b);c.ri(e);c.mi(d[0]);c.ni(d[1])}return new rj({text:c})}
function Up(a,b,c,d,e){return function(){var f=e,g="";f&&this.W()&&(f="Point"===this.W().X());f&&(g=this.get("name"),f=f&&g);if(a)return f?(f=Tp(a[0],g),a.concat(f)):a;if(b){var h=Vp(b,c,d);return f?(f=Tp(h[0],g),h.concat(f)):h}return f?(f=Tp(c[0],g),c.concat(f)):c}}function Vp(a,b,c){return Array.isArray(a)?a:"string"===typeof a?(!(a in c)&&"#"+a in c&&(a="#"+a),Vp(c[a],b,c)):b}
function Wp(a){a=Nk(a,!1);if(a=/^\s*#?\s*([0-9A-Fa-f]{8})\s*$/.exec(a))return a=a[1],[parseInt(a.substr(6,2),16),parseInt(a.substr(4,2),16),parseInt(a.substr(2,2),16),parseInt(a.substr(0,2),16)/255]}function Xp(a){a=Nk(a,!1);for(var b=[],c=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*,\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s*,\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?))?\s*/i,d;d=c.exec(a);)b.push(parseFloat(d[1]),parseFloat(d[2]),d[3]?parseFloat(d[3]):0),a=a.substr(d[0].length);return""!==a?void 0:b}
function Yp(a){var b=Nk(a,!1);return a.baseURI?Bp(a.baseURI,b.trim()).toString():b.trim()}function Zp(a){a=bo(a);if(void 0!==a)return Math.sqrt(a)}function $p(a,b){return O(null,aq,a,b)}function bq(a,b){var c=O({B:[],zi:[]},cq,a,b);if(c){var d=c.B,c=c.zi,e,f;e=0;for(f=Math.min(d.length,c.length);e<f;++e)d[4*e+3]=c[e];c=new R(null);c.ba("XYZM",d);return c}}function dq(a,b){var c=O({},eq,a,b),d=O(null,fq,a,b);if(d){var e=new R(null);e.ba("XYZ",d);e.G(c);return e}}
function gq(a,b){var c=O({},eq,a,b),d=O(null,fq,a,b);if(d){var e=new E(null);e.ba("XYZ",d,[d.length]);e.G(c);return e}}
function hq(a,b){var c=O([],iq,a,b);if(!c)return null;if(0===c.length)return new Ln(c);var d=!0,e=c[0].X(),f,g,h;g=1;for(h=c.length;g<h;++g)if(f=c[g],f.X()!=e){d=!1;break}if(d){if("Point"==e){f=c[0];d=f.f;e=f.la();g=1;for(h=c.length;g<h;++g)f=c[g],mb(e,f.la());f=new Bn(null);f.ba(d,e);jq(f,c);return f}return"LineString"==e?(f=new S(null),An(f,c),jq(f,c),f):"Polygon"==e?(f=new T(null),Dn(f,c),jq(f,c),f):"GeometryCollection"==e?new Ln(c):null}return new Ln(c)}
function kq(a,b){var c=O({},eq,a,b),d=O(null,fq,a,b);if(d){var e=new C(null);e.ba("XYZ",d);e.G(c);return e}}function lq(a,b){var c=O({},eq,a,b),d=O([null],mq,a,b);if(d&&d[0]){var e=new E(null),f=d[0],g=[f.length],h,l;h=1;for(l=d.length;h<l;++h)mb(f,d[h]),g.push(f.length);e.ba("XYZ",f,g);e.G(c);return e}}
function nq(a,b){var c=O({},oq,a,b);if(!c)return null;var d="fillStyle"in c?c.fillStyle:Mp,e=c.fill;void 0===e||e||(d=null);var e="imageStyle"in c?c.imageStyle:Pp,f="textStyle"in c?c.textStyle:Rp,g="strokeStyle"in c?c.strokeStyle:Qp,c=c.outline;void 0===c||c||(g=null);return[new rj({fill:d,image:e,stroke:g,text:f,zIndex:void 0})]}
function jq(a,b){var c=b.length,d=Array(b.length),e=Array(b.length),f,g,h,l;h=l=!1;for(g=0;g<c;++g)f=b[g],d[g]=f.get("extrude"),e[g]=f.get("altitudeMode"),h=h||void 0!==d[g],l=l||e[g];h&&a.set("extrude",d);l&&a.set("altitudeMode",e)}function pq(a,b){al(qq,a,b)}
var rq=M(Kp,{value:Uk(U)}),qq=M(Kp,{Data:function(a,b){var c=a.getAttribute("name");if(null!==c){var d=O(void 0,rq,a,b);d&&(b[b.length-1][c]=d)}},SchemaData:function(a,b){al(sq,a,b)}}),eq=M(Kp,{extrude:J(Zn),altitudeMode:J(U)}),aq=M(Kp,{coordinates:Uk(Xp)}),mq=M(Kp,{innerBoundaryIs:function(a,b){var c=O(void 0,tq,a,b);c&&b[b.length-1].push(c)},outerBoundaryIs:function(a,b){var c=O(void 0,uq,a,b);c&&(b[b.length-1][0]=c)}}),cq=M(Kp,{when:function(a,b){var c=b[b.length-1].zi,d=Nk(a,!1);if(d=/^\s*(\d{4})($|-(\d{2})($|-(\d{2})($|T(\d{2}):(\d{2}):(\d{2})(Z|(?:([+\-])(\d{2})(?::(\d{2}))?)))))\s*$/.exec(d)){var e=
Date.UTC(parseInt(d[1],10),d[3]?parseInt(d[3],10)-1:0,d[5]?parseInt(d[5],10):1,d[7]?parseInt(d[7],10):0,d[8]?parseInt(d[8],10):0,d[9]?parseInt(d[9],10):0);if(d[10]&&"Z"!=d[10]){var f="-"==d[11]?-1:1,e=e+60*f*parseInt(d[12],10);d[13]&&(e+=3600*f*parseInt(d[13],10))}c.push(e)}else c.push(0)}},M(Jp,{coord:function(a,b){var c=b[b.length-1].B,d=Nk(a,!1);(d=/^\s*([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s*$/i.exec(d))?c.push(parseFloat(d[1]),
parseFloat(d[2]),parseFloat(d[3]),0):c.push(0,0,0,0)}})),fq=M(Kp,{coordinates:Uk(Xp)}),vq=M(Kp,{href:J(Yp)},M(Jp,{x:J(bo),y:J(bo),w:J(bo),h:J(bo)})),wq=M(Kp,{Icon:J(function(a,b){var c=O({},vq,a,b);return c?c:null}),heading:J(bo),hotSpot:J(function(a){var b=a.getAttribute("xunits"),c=a.getAttribute("yunits");return{x:parseFloat(a.getAttribute("x")),$f:Sp[b],y:parseFloat(a.getAttribute("y")),ag:Sp[c]}}),scale:J(Zp)}),tq=M(Kp,{LinearRing:Uk($p)}),xq=M(Kp,{color:J(Wp),scale:J(Zp)}),yq=M(Kp,{color:J(Wp),
width:J(bo)}),iq=M(Kp,{LineString:Tk(dq),LinearRing:Tk(gq),MultiGeometry:Tk(hq),Point:Tk(kq),Polygon:Tk(lq)}),zq=M(Jp,{Track:Tk(bq)}),Bq=M(Kp,{ExtendedData:pq,Link:function(a,b){al(Aq,a,b)},address:J(U),description:J(U),name:J(U),open:J(Zn),phoneNumber:J(U),visibility:J(Zn)}),Aq=M(Kp,{href:J(Yp)}),uq=M(Kp,{LinearRing:Uk($p)}),Cq=M(Kp,{Style:J(nq),key:J(U),styleUrl:J(function(a){var b=Nk(a,!1).trim();return a.baseURI?Bp(a.baseURI,b).toString():b})}),Eq=M(Kp,{ExtendedData:pq,MultiGeometry:J(hq,"geometry"),
LineString:J(dq,"geometry"),LinearRing:J(gq,"geometry"),Point:J(kq,"geometry"),Polygon:J(lq,"geometry"),Style:J(nq),StyleMap:function(a,b){var c=O(void 0,Dq,a,b);if(c){var d=b[b.length-1];Array.isArray(c)?d.Style=c:"string"===typeof c&&(d.styleUrl=c)}},address:J(U),description:J(U),name:J(U),open:J(Zn),phoneNumber:J(U),styleUrl:J(Yp),visibility:J(Zn)},M(Jp,{MultiTrack:J(function(a,b){var c=O([],zq,a,b);if(c){var d=new S(null);An(d,c);return d}},"geometry"),Track:J(bq,"geometry")})),Fq=M(Kp,{color:J(Wp),
fill:J(Zn),outline:J(Zn)}),sq=M(Kp,{SimpleData:function(a,b){var c=a.getAttribute("name");if(null!==c){var d=U(a);b[b.length-1][c]=d}}}),oq=M(Kp,{IconStyle:function(a,b){var c=O({},wq,a,b);if(c){var d=b[b.length-1],e="Icon"in c?c.Icon:{},f;f=(f=e.href)?f:"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png";var g,h,l,m=c.hotSpot;m?(g=[m.x,m.y],h=m.$f,l=m.ag):"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"===f?(g=Np,l=h="pixels"):/^http:\/\/maps\.(?:google|gstatic)\.com\//.test(f)&&
(g=[.5,0],l=h="fraction");var n,m=e.x,p=e.y;void 0!==m&&void 0!==p&&(n=[m,p]);var q,m=e.w,e=e.h;void 0!==m&&void 0!==e&&(q=[m,e]);var r,e=c.heading;void 0!==e&&(r=wa(e));c=c.scale;"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"==f&&(q=Op,void 0===c&&(c=.5));g=new Dh({anchor:g,anchorOrigin:"bottom-left",anchorXUnits:h,anchorYUnits:l,crossOrigin:"anonymous",offset:n,offsetOrigin:"bottom-left",rotation:r,scale:c,size:q,src:f});d.imageStyle=g}},LabelStyle:function(a,b){var c=O({},xq,a,
b);c&&(b[b.length-1].textStyle=new Gp({fill:new ij({color:"color"in c?c.color:Lp}),scale:c.scale}))},LineStyle:function(a,b){var c=O({},yq,a,b);c&&(b[b.length-1].strokeStyle=new oj({color:"color"in c?c.color:Lp,width:"width"in c?c.width:1}))},PolyStyle:function(a,b){var c=O({},Fq,a,b);if(c){var d=b[b.length-1];d.fillStyle=new ij({color:"color"in c?c.color:Lp});var e=c.fill;void 0!==e&&(d.fill=e);c=c.outline;void 0!==c&&(d.outline=c)}}}),Dq=M(Kp,{Pair:function(a,b){var c=O({},Cq,a,b);if(c){var d=c.key;
d&&"normal"==d&&((d=c.styleUrl)&&(b[b.length-1]=d),(c=c.Style)&&(b[b.length-1]=c))}}});k=Hp.prototype;k.Gf=function(a,b){var c=M(Kp,{Document:Sk(this.Gf,this),Folder:Sk(this.Gf,this),Placemark:Tk(this.Of,this),Style:this.Lo.bind(this),StyleMap:this.Ko.bind(this)});if(c=O([],c,a,b,this))return c};
k.Of=function(a,b){var c=O({geometry:null},Eq,a,b);if(c){var d=new Ik,e=a.getAttribute("id");null!==e&&d.mc(e);var e=b[0],f=c.geometry;f&&un(f,!1,e);d.Ua(f);delete c.geometry;this.c&&d.sf(Up(c.Style,c.styleUrl,this.g,this.b,this.i));delete c.Style;d.G(c);return d}};k.Lo=function(a,b){var c=a.getAttribute("id");if(null!==c){var d=nq(a,b);d&&(c=a.baseURI?Bp(a.baseURI,"#"+c).toString():"#"+c,this.b[c]=d)}};
k.Ko=function(a,b){var c=a.getAttribute("id");if(null!==c){var d=O(void 0,Dq,a,b);d&&(c=a.baseURI?Bp(a.baseURI,"#"+c).toString():"#"+c,this.b[c]=d)}};k.Ph=function(a,b){if(!jb(Kp,a.namespaceURI))return null;var c=this.Of(a,[sn(this,a,b)]);return c?c:null};
k.lc=function(a,b){if(!jb(Kp,a.namespaceURI))return[];var c;c=a.localName;if("Document"==c||"Folder"==c)return(c=this.Gf(a,[sn(this,a,b)]))?c:[];if("Placemark"==c)return(c=this.Of(a,[sn(this,a,b)]))?[c]:[];if("kml"==c){c=[];var d;for(d=a.firstElementChild;d;d=d.nextElementSibling){var e=this.lc(d,b);e&&mb(c,e)}return c}return[]};k.Fo=function(a){if(Pk(a))return Gq(this,a);if(Qk(a))return Hq(this,a);if("string"===typeof a)return a=Rk(a),Gq(this,a)};
function Gq(a,b){var c;for(c=b.firstChild;c;c=c.nextSibling)if(c.nodeType==Node.ELEMENT_NODE){var d=Hq(a,c);if(d)return d}}function Hq(a,b){var c;for(c=b.firstElementChild;c;c=c.nextElementSibling)if(jb(Kp,c.namespaceURI)&&"name"==c.localName)return U(c);for(c=b.firstElementChild;c;c=c.nextElementSibling){var d=c.localName;if(jb(Kp,c.namespaceURI)&&("Document"==d||"Folder"==d||"Placemark"==d||"kml"==d)&&(d=Hq(a,c)))return d}}
k.Go=function(a){var b=[];Pk(a)?mb(b,Iq(this,a)):Qk(a)?mb(b,Jq(this,a)):"string"===typeof a&&(a=Rk(a),mb(b,Iq(this,a)));return b};function Iq(a,b){var c,d=[];for(c=b.firstChild;c;c=c.nextSibling)c.nodeType==Node.ELEMENT_NODE&&mb(d,Jq(a,c));return d}
function Jq(a,b){var c,d=[];for(c=b.firstElementChild;c;c=c.nextElementSibling)if(jb(Kp,c.namespaceURI)&&"NetworkLink"==c.localName){var e=O({},Bq,c,[]);d.push(e)}for(c=b.firstElementChild;c;c=c.nextElementSibling)e=c.localName,!jb(Kp,c.namespaceURI)||"Document"!=e&&"Folder"!=e&&"kml"!=e||mb(d,Jq(a,c));return d}function Kq(a,b){var c=te(b),c=[255*(4==c.length?c[3]:1),c[2],c[1],c[0]],d;for(d=0;4>d;++d){var e=parseInt(c[d],10).toString(16);c[d]=1==e.length?"0"+e:e}ho(a,c.join(""))}
function Lq(a,b,c){a={node:a};var d=b.X(),e,f;"GeometryCollection"==d?(e=b.ff(),f=Mq):"MultiPoint"==d?(e=b.je(),f=Nq):"MultiLineString"==d?(e=b.md(),f=Oq):"MultiPolygon"==d&&(e=b.Wd(),f=Pq);bl(a,Qq,f,e,c)}function Rq(a,b,c){bl({node:a},Sq,Tq,[b],c)}
function Uq(a,b,c){var d={node:a};b.Xa()&&a.setAttribute("id",b.Xa());a=b.O();var e=b.ec();e&&(e=e.call(b,0))&&(e=Array.isArray(e)?e[0]:e,this.l&&(a.Style=e),(e=e.Ha())&&(a.name=e.Ha()));e=Vq[c[c.length-1].node.namespaceURI];a=$k(a,e);bl(d,Wq,Zk,a,c,e);a=c[0];(b=b.W())&&(b=un(b,!0,a));bl(d,Wq,Mq,[b],c)}function Xq(a,b,c){var d=b.la();a={node:a};a.layout=b.f;a.stride=b.va();bl(a,Yq,Zq,[d],c)}function $q(a,b,c){b=b.Vd();var d=b.shift();a={node:a};bl(a,ar,br,b,c);bl(a,ar,cr,[d],c)}
function dr(a,b){io(a,Math.round(b*b*1E6)/1E6)}
var er=M(Kp,["Document","Placemark"]),hr=M(Kp,{Document:L(function(a,b,c){bl({node:a},fr,gr,b,c,void 0,this)}),Placemark:L(Uq)}),fr=M(Kp,{Placemark:L(Uq)}),ir={Point:"Point",LineString:"LineString",LinearRing:"LinearRing",Polygon:"Polygon",MultiPoint:"MultiGeometry",MultiLineString:"MultiGeometry",MultiPolygon:"MultiGeometry",GeometryCollection:"MultiGeometry"},jr=M(Kp,["href"],M(Jp,["x","y","w","h"])),kr=M(Kp,{href:L(ho)},M(Jp,{x:L(io),y:L(io),w:L(io),h:L(io)})),lr=M(Kp,["scale","heading","Icon",
"hotSpot"]),nr=M(Kp,{Icon:L(function(a,b,c){a={node:a};var d=jr[c[c.length-1].node.namespaceURI],e=$k(b,d);bl(a,kr,Zk,e,c,d);d=jr[Jp[0]];e=$k(b,d);bl(a,kr,mr,e,c,d)}),heading:L(io),hotSpot:L(function(a,b){a.setAttribute("x",b.x);a.setAttribute("y",b.y);a.setAttribute("xunits",b.$f);a.setAttribute("yunits",b.ag)}),scale:L(dr)}),or=M(Kp,["color","scale"]),pr=M(Kp,{color:L(Kq),scale:L(dr)}),qr=M(Kp,["color","width"]),rr=M(Kp,{color:L(Kq),width:L(io)}),Sq=M(Kp,{LinearRing:L(Xq)}),Qq=M(Kp,{LineString:L(Xq),
Point:L(Xq),Polygon:L($q),GeometryCollection:L(Lq)}),Vq=M(Kp,"name open visibility address phoneNumber description styleUrl Style".split(" ")),Wq=M(Kp,{MultiGeometry:L(Lq),LineString:L(Xq),LinearRing:L(Xq),Point:L(Xq),Polygon:L($q),Style:L(function(a,b,c){a={node:a};var d={},e=b.c,f=b.f,g=b.a;b=b.Ha();g instanceof Dh&&(d.IconStyle=g);b&&(d.LabelStyle=b);f&&(d.LineStyle=f);e&&(d.PolyStyle=e);b=sr[c[c.length-1].node.namespaceURI];d=$k(d,b);bl(a,tr,Zk,d,c,b)}),address:L(ho),description:L(ho),name:L(ho),
open:L(go),phoneNumber:L(ho),styleUrl:L(ho),visibility:L(go)}),Yq=M(Kp,{coordinates:L(function(a,b,c){c=c[c.length-1];var d=c.layout;c=c.stride;var e;"XY"==d||"XYM"==d?e=2:("XYZ"==d||"XYZM"==d)&&(e=3);var f,g=b.length,h="";if(0<g){h+=b[0];for(d=1;d<e;++d)h+=","+b[d];for(f=c;f<g;f+=c)for(h+=" "+b[f],d=1;d<e;++d)h+=","+b[f+d]}ho(a,h)})}),ar=M(Kp,{outerBoundaryIs:L(Rq),innerBoundaryIs:L(Rq)}),ur=M(Kp,{color:L(Kq)}),sr=M(Kp,["IconStyle","LabelStyle","LineStyle","PolyStyle"]),tr=M(Kp,{IconStyle:L(function(a,
b,c){a={node:a};var d={},e=b.Fb(),f=b.ld(),g={href:b.b.j};if(e){g.w=e[0];g.h=e[1];var h=b.Yb(),l=b.Ia();l&&f&&0!==l[0]&&l[1]!==e[1]&&(g.x=l[0],g.y=f[1]-(l[1]+e[1]));h&&0!==h[0]&&h[1]!==e[1]&&(d.hotSpot={x:h[0],$f:"pixels",y:e[1]-h[1],ag:"pixels"})}d.Icon=g;e=b.i;1!==e&&(d.scale=e);b=b.j;0!==b&&(d.heading=b);b=lr[c[c.length-1].node.namespaceURI];d=$k(d,b);bl(a,nr,Zk,d,c,b)}),LabelStyle:L(function(a,b,c){a={node:a};var d={},e=b.b;e&&(d.color=e.b);(b=b.a)&&1!==b&&(d.scale=b);b=or[c[c.length-1].node.namespaceURI];
d=$k(d,b);bl(a,pr,Zk,d,c,b)}),LineStyle:L(function(a,b,c){a={node:a};var d=qr[c[c.length-1].node.namespaceURI];b=$k({color:b.b,width:b.a},d);bl(a,rr,Zk,b,c,d)}),PolyStyle:L(function(a,b,c){bl({node:a},ur,vr,[b.b],c)})});function mr(a,b,c){return Mk(Jp[0],"gx:"+c)}function gr(a,b){return Mk(b[b.length-1].node.namespaceURI,"Placemark")}function Mq(a,b){if(a)return Mk(b[b.length-1].node.namespaceURI,ir[a.X()])}
var vr=Xk("color"),Zq=Xk("coordinates"),br=Xk("innerBoundaryIs"),Nq=Xk("Point"),Oq=Xk("LineString"),Tq=Xk("LinearRing"),Pq=Xk("Polygon"),cr=Xk("outerBoundaryIs");
Hp.prototype.a=function(a,b){b=tn(this,b);var c=Mk(Kp[4],"kml");c.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:gx",Jp[0]);c.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");c.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation","http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd");var d={node:c},e={};1<a.length?e.Document=a:1==a.length&&(e.Placemark=a[0]);var f=er[c.namespaceURI],
e=$k(e,f);bl(d,hr,Zk,e,[b],f,this);return c};(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Rp=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b,f){f.read=function(a,b,d,e,f){var p;p=8*f-e-1;var q=(1<<p)-1,r=q>>1,u=-7;f=d?f-1:0;var x=d?-1:1,v=a[b+f];f+=x;d=v&(1<<-u)-1;v>>=-u;for(u+=p;0<u;d=256*d+a[b+f],f+=x,u-=8);p=d&(1<<-u)-1;d>>=-u;for(u+=e;0<u;p=256*p+a[b+f],f+=x,u-=8);if(0===d)d=1-r;else{if(d===q)return p?NaN:Infinity*(v?-1:1);p+=Math.pow(2,e);d-=r}return(v?-1:1)*p*Math.pow(2,d-
e)};f.write=function(a,b,d,e,f,p){var q,r=8*p-f-1,u=(1<<r)-1,x=u>>1,v=23===f?Math.pow(2,-24)-Math.pow(2,-77):0;p=e?0:p-1;var D=e?1:-1,A=0>b||0===b&&0>1/b?1:0;b=Math.abs(b);isNaN(b)||Infinity===b?(b=isNaN(b)?1:0,e=u):(e=Math.floor(Math.log(b)/Math.LN2),1>b*(q=Math.pow(2,-e))&&(e--,q*=2),b=1<=e+x?b+v/q:b+v*Math.pow(2,1-x),2<=b*q&&(e++,q/=2),e+x>=u?(b=0,e=u):1<=e+x?(b=(b*q-1)*Math.pow(2,f),e+=x):(b=b*Math.pow(2,x-1)*Math.pow(2,f),e=0));for(;8<=f;a[d+p]=b&255,p+=D,b/=256,f-=8);e=e<<f|b;for(r+=f;0<r;a[d+
p]=e&255,p+=D,e/=256,r-=8);a[d+p-D]|=128*A}},{}],2:[function(a,b){function f(a){var b;a&&a.length&&(b=a,a=b.length);a=new Uint8Array(a||0);b&&a.set(b);a.$h=l.$h;a.Zf=l.Zf;a.Sh=l.Sh;a.Ei=l.Ei;a.Nf=l.Nf;a.Di=l.Di;a.Hf=l.Hf;a.Ai=l.Ai;a.toString=l.toString;a.write=l.write;a.slice=l.slice;a.tg=l.tg;a.nj=!0;return a}function g(a){for(var b=a.length,d=[],e=0,f,g;e<b;e++){f=a.charCodeAt(e);if(55295<f&&57344>f)if(g)if(56320>f){d.push(239,191,189);g=f;continue}else f=g-55296<<10|f-56320|65536,g=null;else{56319<
f||e+1===b?d.push(239,191,189):g=f;continue}else g&&(d.push(239,191,189),g=null);128>f?d.push(f):2048>f?d.push(f>>6|192,f&63|128):65536>f?d.push(f>>12|224,f>>6&63|128,f&63|128):d.push(f>>18|240,f>>12&63|128,f>>6&63|128,f&63|128)}return d}b.ja=f;var h=a("ieee754"),l,m,n;l={$h:function(a){return(this[a]|this[a+1]<<8|this[a+2]<<16)+16777216*this[a+3]},Zf:function(a,b){this[b]=a;this[b+1]=a>>>8;this[b+2]=a>>>16;this[b+3]=a>>>24},Sh:function(a){return(this[a]|this[a+1]<<8|this[a+2]<<16)+(this[a+3]<<24)},
Nf:function(a){return h.read(this,a,!0,23,4)},Hf:function(a){return h.read(this,a,!0,52,8)},Di:function(a,b){return h.write(this,a,b,!0,23,4)},Ai:function(a,b){return h.write(this,a,b,!0,52,8)},toString:function(a,b,d){var e=a="";d=Math.min(this.length,d||this.length);for(b=b||0;b<d;b++){var f=this[b];127>=f?(a+=decodeURIComponent(e)+String.fromCharCode(f),e=""):e+="%"+f.toString(16)}return a+=decodeURIComponent(e)},write:function(a,b){for(var d=a===m?n:g(a),e=0;e<d.length;e++)this[b+e]=d[e]},slice:function(a,
b){return this.subarray(a,b)},tg:function(a,b){b=b||0;for(var d=0;d<this.length;d++)a[b+d]=this[d]}};l.Ei=l.Zf;f.byteLength=function(a){m=a;n=g(a);return n.length};f.isBuffer=function(a){return!(!a||!a.nj)}},{ieee754:1}],3:[function(a,b){(function(f){function g(a){this.Cb=l.isBuffer(a)?a:new l(a||0);this.da=0;this.length=this.Cb.length}function h(a,b){var d=b.Cb,e;e=d[b.da++];a+=268435456*(e&127);if(128>e)return a;e=d[b.da++];a+=34359738368*(e&127);if(128>e)return a;e=d[b.da++];a+=4398046511104*(e&
127);if(128>e)return a;e=d[b.da++];a+=562949953421312*(e&127);if(128>e)return a;e=d[b.da++];a+=72057594037927936*(e&127);if(128>e)return a;e=d[b.da++];if(128>e)return a+0x7fffffffffffffff*(e&127);throw Error("Expected varint not more than 10 bytes");}b.ja=g;var l=f.Ap||a("./buffer");g.f=0;g.g=1;g.b=2;g.a=5;var m=Math.pow(2,63);g.prototype={Lf:function(a,b,d){for(d=d||this.length;this.da<d;){var e=this.Da(),f=this.da;a(e>>3,b,this);this.da===f&&this.op(e)}return b},Bo:function(){var a=this.Cb.Nf(this.da);
this.da+=4;return a},xo:function(){var a=this.Cb.Hf(this.da);this.da+=8;return a},Da:function(){var a=this.Cb,b,d;d=a[this.da++];b=d&127;if(128>d)return b;d=a[this.da++];b|=(d&127)<<7;if(128>d)return b;d=a[this.da++];b|=(d&127)<<14;if(128>d)return b;d=a[this.da++];b|=(d&127)<<21;return 128>d?b:h(b,this)},Mo:function(){var a=this.da,b=this.Da();if(b<m)return b;for(var d=this.da-2;255===this.Cb[d];)d--;d<a&&(d=a);for(var e=b=0;e<d-a+1;e++)var f=~this.Cb[a+e]&127,b=b+(4>e?f<<7*e:f*Math.pow(2,7*e));return-b-
1},xd:function(){var a=this.Da();return 1===a%2?(a+1)/-2:a/2},vo:function(){return!!this.Da()},Qf:function(){var a=this.Da()+this.da,b=this.Cb.toString("utf8",this.da,a);this.da=a;return b},op:function(a){a&=7;if(a===g.f)for(;127<this.Cb[this.da++];);else if(a===g.b)this.da=this.Da()+this.da;else if(a===g.a)this.da+=4;else if(a===g.g)this.da+=8;else throw Error("Unimplemented type: "+a);}}}).call(this,"undefined"!==typeof global?global:"undefined"!==typeof self?self:"undefined"!==typeof window?window:
{})},{"./buffer":2}]},{},[3])(3)});hl=b.ja})();(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Up=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b){function f(a,b){this.x=a;this.y=b}b.ja=f;f.prototype={clone:function(){return new f(this.x,this.y)},add:function(a){return this.clone().fj(a)},rotate:function(a){return this.clone().qj(a)},round:function(){return this.clone().rj()},angle:function(){return Math.atan2(this.y,this.x)},fj:function(a){this.x+=a.x;this.y+=a.y;return this},qj:function(a){var b=
Math.cos(a);a=Math.sin(a);var d=a*this.x+b*this.y;this.x=b*this.x-a*this.y;this.y=d;return this},rj:function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this}};f.b=function(a){return a instanceof f?a:Array.isArray(a)?new f(a[0],a[1]):a}},{}],2:[function(a,b){b.ja.ej=a("./lib/vectortile.js");b.ja.Np=a("./lib/vectortilefeature.js");b.ja.Op=a("./lib/vectortilelayer.js")},{"./lib/vectortile.js":3,"./lib/vectortilefeature.js":4,"./lib/vectortilelayer.js":5}],3:[function(a,b){function f(a,
b,d){3===a&&(a=new g(d,d.Da()+d.da),a.length&&(b[a.name]=a))}var g=a("./vectortilelayer");b.ja=function(a,b){this.layers=a.Lf(f,{},b)}},{"./vectortilelayer":5}],4:[function(a,b){function f(a,b,d,e,f){this.properties={};this.extent=d;this.type=0;this.qc=a;this.Qe=-1;this.Id=e;this.Kd=f;a.Lf(g,this,b)}function g(a,b,d){if(1==a)b.Qp=d.Da();else if(2==a)for(a=d.Da()+d.da;d.da<a;){var e=b.Id[d.Da()],f=b.Kd[d.Da()];b.properties[e]=f}else 3==a?b.type=d.Da():4==a&&(b.Qe=d.da)}var h=a("point-geometry");b.ja=
f;f.b=["Unknown","Point","LineString","Polygon"];f.prototype.Vg=function(){var a=this.qc;a.da=this.Qe;for(var b=a.Da()+a.da,d=1,e=0,f=0,g=0,u=[],x;a.da<b;)if(e||(e=a.Da(),d=e&7,e>>=3),e--,1===d||2===d)f+=a.xd(),g+=a.xd(),1===d&&(x&&u.push(x),x=[]),x.push(new h(f,g));else if(7===d)x&&x.push(x[0].clone());else throw Error("unknown command "+d);x&&u.push(x);return u};f.prototype.bbox=function(){var a=this.qc;a.da=this.Qe;for(var b=a.Da()+a.da,d=1,e=0,f=0,g=0,h=Infinity,x=-Infinity,v=Infinity,D=-Infinity;a.da<
b;)if(e||(e=a.Da(),d=e&7,e>>=3),e--,1===d||2===d)f+=a.xd(),g+=a.xd(),f<h&&(h=f),f>x&&(x=f),g<v&&(v=g),g>D&&(D=g);else if(7!==d)throw Error("unknown command "+d);return[h,v,x,D]}},{"point-geometry":1}],5:[function(a,b){function f(a,b){this.version=1;this.name=null;this.extent=4096;this.length=0;this.qc=a;this.Id=[];this.Kd=[];this.Hd=[];a.Lf(g,this,b);this.length=this.Hd.length}function g(a,b,d){15===a?b.version=d.Da():1===a?b.name=d.Qf():5===a?b.extent=d.Da():2===a?b.Hd.push(d.da):3===a?b.Id.push(d.Qf()):
4===a&&b.Kd.push(h(d))}function h(a){for(var b=null,d=a.Da()+a.da;a.da<d;)b=a.Da()>>3,b=1===b?a.Qf():2===b?a.Bo():3===b?a.xo():4===b?a.Mo():5===b?a.Da():6===b?a.xd():7===b?a.vo():null;return b}var l=a("./vectortilefeature.js");b.ja=f;f.prototype.feature=function(a){if(0>a||a>=this.Hd.length)throw Error("feature index out of bounds");this.qc.da=this.Hd[a];a=this.qc.Da()+this.qc.da;return new l(this.qc,a,this.extent,this.Id,this.Kd)}},{"./vectortilefeature.js":4}]},{},[2])(2)});il=b.ja})();function wr(a){this.defaultDataProjection=null;a=a?a:{};this.defaultDataProjection=new vc({code:"",units:"tile-pixels"});this.b=a.featureClass?a.featureClass:hk;this.g=a.geometryName?a.geometryName:"geometry";this.a=a.layerName?a.layerName:"layer";this.f=a.layers?a.layers:null}y(wr,rn);wr.prototype.X=function(){return"arraybuffer"};
wr.prototype.Fa=function(a,b){var c=this.f,d=new hl(a),d=new il.ej(d),e=[],f=this.b,g,h,l;for(l in d.layers)if(!c||-1!=c.indexOf(l)){g=d.layers[l];for(var m=0,n=g.length;m<n;++m){if(f===hk){var p=g.feature(m);h=l;var q=p.Vg(),r=[],u=[];xr(q,u,r);var x=p.type,v=void 0;1===x?v=1===q.length?"Point":"MultiPoint":2===x?v=1===q.length?"LineString":"MultiLineString":3===x&&(v="Polygon");p=p.properties;p[this.a]=h;h=new this.b(v,u,r,p)}else{p=g.feature(m);v=l;u=b;h=new this.b;r=p.properties;r[this.a]=v;v=
p.type;if(0===v)v=null;else{p=p.Vg();q=[];x=[];xr(p,x,q);var D=void 0;1===v?D=1===p.length?new C(null):new Bn(null):2===v?1===p.length?D=new R(null):D=new S(null):3===v&&(D=new E(null));D.ba("XY",x,q);v=D}(u=un(v,!1,tn(this,u)))&&(r[this.g]=u);h.G(r);h.Ec(this.g)}e.push(h)}}return e};wr.prototype.Oa=function(){return this.defaultDataProjection};wr.prototype.c=function(a){this.f=a};
function xr(a,b,c){for(var d=0,e=0,f=a.length;e<f;++e){var g=a[e],h,l;h=0;for(l=g.length;h<l;++h){var m=g[h];b.push(m.x,m.y)}d+=2*h;c.push(d)}};function yr(a,b){return new zr(a,b)}function Ar(a,b,c){return new Br(a,b,c)}function Cr(a){this.Wb=a}function Dr(a){this.Wb=a}y(Dr,Cr);function Er(a,b,c){this.Wb=a;this.b=b;this.a=c}y(Er,Dr);function zr(a,b){Er.call(this,"And",a,b)}y(zr,Er);function Fr(a,b){Er.call(this,"Or",a,b)}y(Fr,Er);function Gr(a){this.Wb="Not";this.condition=a}y(Gr,Dr);function Br(a,b,c){this.Wb="BBOX";this.geometryName=a;this.extent=b;this.srsName=c}y(Br,Cr);function Hr(a,b){this.Wb=a;this.b=b}y(Hr,Cr);
function Ir(a,b,c,d){Hr.call(this,a,b);this.g=c;this.a=d}y(Ir,Hr);function Jr(a,b,c){Ir.call(this,"PropertyIsEqualTo",a,b,c)}y(Jr,Ir);function Kr(a,b,c){Ir.call(this,"PropertyIsNotEqualTo",a,b,c)}y(Kr,Ir);function Lr(a,b){Ir.call(this,"PropertyIsLessThan",a,b)}y(Lr,Ir);function Mr(a,b){Ir.call(this,"PropertyIsLessThanOrEqualTo",a,b)}y(Mr,Ir);function Nr(a,b){Ir.call(this,"PropertyIsGreaterThan",a,b)}y(Nr,Ir);function Or(a,b){Ir.call(this,"PropertyIsGreaterThanOrEqualTo",a,b)}y(Or,Ir);
function Pr(a){Hr.call(this,"PropertyIsNull",a)}y(Pr,Hr);function Qr(a,b,c){Hr.call(this,"PropertyIsBetween",a);this.a=b;this.g=c}y(Qr,Hr);function Rr(a,b,c,d,e,f){Hr.call(this,"PropertyIsLike",a);this.f=b;this.i=void 0!==c?c:"*";this.c=void 0!==d?d:".";this.g=void 0!==e?e:"!";this.a=f}y(Rr,Hr);function Sr(){Un.call(this);this.defaultDataProjection=yc("EPSG:4326")}y(Sr,Un);function Tr(a,b){b[b.length-1].Cd[a.getAttribute("k")]=a.getAttribute("v")}
var Ur=[null],Vr=M(Ur,{nd:function(a,b){b[b.length-1].Rc.push(a.getAttribute("ref"))},tag:Tr}),Xr=M(Ur,{node:function(a,b){var c=b[0],d=b[b.length-1],e=a.getAttribute("id"),f=[parseFloat(a.getAttribute("lon")),parseFloat(a.getAttribute("lat"))];d.Zg[e]=f;var g=O({Cd:{}},Wr,a,b);Ha(g.Cd)||(f=new C(f),un(f,!1,c),c=new Ik(f),c.mc(e),c.G(g.Cd),d.features.push(c))},way:function(a,b){for(var c=b[0],d=a.getAttribute("id"),e=O({Rc:[],Cd:{}},Vr,a,b),f=b[b.length-1],g=[],h=0,l=e.Rc.length;h<l;h++)mb(g,f.Zg[e.Rc[h]]);
e.Rc[0]==e.Rc[e.Rc.length-1]?(h=new E(null),h.ba("XY",g,[g.length])):(h=new R(null),h.ba("XY",g));un(h,!1,c);c=new Ik(h);c.mc(d);c.G(e.Cd);f.features.push(c)}}),Wr=M(Ur,{tag:Tr});Sr.prototype.lc=function(a,b){var c=sn(this,a,b);return"osm"==a.localName&&(c=O({Zg:{},features:[]},Xr,a,[c]),c.features)?c.features:[]};function Yr(a){return a.getAttributeNS("http://www.w3.org/1999/xlink","href")};function Zr(){}Zr.prototype.read=function(a){return Pk(a)?this.a(a):Qk(a)?this.b(a):"string"===typeof a?(a=Rk(a),this.a(a)):null};function $r(){}y($r,Zr);$r.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.b(a);return null};$r.prototype.b=function(a){return(a=O({},as,a,[]))?a:null};
var bs=[null,"http://www.opengis.net/ows/1.1"],as=M(bs,{ServiceIdentification:J(function(a,b){return O({},cs,a,b)}),ServiceProvider:J(function(a,b){return O({},ds,a,b)}),OperationsMetadata:J(function(a,b){return O({},es,a,b)})}),fs=M(bs,{DeliveryPoint:J(U),City:J(U),AdministrativeArea:J(U),PostalCode:J(U),Country:J(U),ElectronicMailAddress:J(U)}),gs=M(bs,{Value:Vk(function(a){return U(a)})}),hs=M(bs,{AllowedValues:J(function(a,b){return O({},gs,a,b)})}),js=M(bs,{Phone:J(function(a,b){return O({},
is,a,b)}),Address:J(function(a,b){return O({},fs,a,b)})}),ls=M(bs,{HTTP:J(function(a,b){return O({},ks,a,b)})}),ks=M(bs,{Get:Vk(function(a,b){var c=Yr(a);return c?O({href:c},ms,a,b):void 0}),Post:void 0}),ns=M(bs,{DCP:J(function(a,b){return O({},ls,a,b)})}),es=M(bs,{Operation:function(a,b){var c=a.getAttribute("name"),d=O({},ns,a,b);d&&(b[b.length-1][c]=d)}}),is=M(bs,{Voice:J(U),Facsimile:J(U)}),ms=M(bs,{Constraint:Vk(function(a,b){var c=a.getAttribute("name");return c?O({name:c},hs,a,b):void 0})}),
os=M(bs,{IndividualName:J(U),PositionName:J(U),ContactInfo:J(function(a,b){return O({},js,a,b)})}),cs=M(bs,{Title:J(U),ServiceTypeVersion:J(U),ServiceType:J(U)}),ds=M(bs,{ProviderName:J(U),ProviderSite:J(Yr),ServiceContact:J(function(a,b){return O({},os,a,b)})});function ps(a,b,c,d){var e;void 0!==d?e=d:e=[];for(var f=d=0;f<b;){var g=a[f++];e[d++]=a[f++];e[d++]=g;for(g=2;g<c;++g)e[d++]=a[f++]}e.length=d};function qs(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=yc("EPSG:4326");this.b=a.factor?a.factor:1E5;this.a=a.geometryLayout?a.geometryLayout:"XY"}y(qs,bp);function rs(a,b,c){var d,e=Array(b);for(d=0;d<b;++d)e[d]=0;var f,g;f=0;for(g=a.length;f<g;)for(d=0;d<b;++d,++f){var h=a[f],l=h-e[d];e[d]=h;a[f]=l}return ss(a,c?c:1E5)}
function ts(a,b,c){var d,e=Array(b);for(d=0;d<b;++d)e[d]=0;a=us(a,c?c:1E5);var f;c=0;for(f=a.length;c<f;)for(d=0;d<b;++d,++c)e[d]+=a[c],a[c]=e[d];return a}function ss(a,b){var c=b?b:1E5,d,e;d=0;for(e=a.length;d<e;++d)a[d]=Math.round(a[d]*c);c=0;for(d=a.length;c<d;++c)e=a[c],a[c]=0>e?~(e<<1):e<<1;c="";d=0;for(e=a.length;d<e;++d){for(var f=a[d],g,h="";32<=f;)g=(32|f&31)+63,h+=String.fromCharCode(g),f>>=5;h+=String.fromCharCode(f+63);c+=h}return c}
function us(a,b){var c=b?b:1E5,d=[],e=0,f=0,g,h;g=0;for(h=a.length;g<h;++g){var l=a.charCodeAt(g)-63,e=e|(l&31)<<f;32>l?(d.push(e),f=e=0):f+=5}e=0;for(f=d.length;e<f;++e)g=d[e],d[e]=g&1?~(g>>1):g>>1;e=0;for(f=d.length;e<f;++e)d[e]/=c;return d}k=qs.prototype;k.ud=function(a,b){var c=this.wd(a,b);return new Ik(c)};k.Kf=function(a,b){return[this.ud(a,b)]};k.wd=function(a,b){var c=id(this.a),d=ts(a,c,this.b);ps(d,d.length,c,d);c=vd(d,0,d.length,c);return un(new R(c,this.a),!1,tn(this,b))};
k.He=function(a,b){var c=a.W();return c?this.Ed(c,b):""};k.Ci=function(a,b){return this.He(a[0],b)};k.Ed=function(a,b){a=un(a,!0,tn(this,b));var c=a.la(),d=a.va();ps(c,c.length,d,c);return rs(c,d,this.b)};function ws(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=yc(a.defaultDataProjection?a.defaultDataProjection:"EPSG:4326")}y(ws,vn);function xs(a,b){var c=[],d,e,f,g;f=0;for(g=a.length;f<g;++f)d=a[f],0<f&&c.pop(),0<=d?e=b[d]:e=b[~d].slice().reverse(),c.push.apply(c,e);d=0;for(e=c.length;d<e;++d)c[d]=c[d].slice();return c}function ys(a,b,c,d,e){a=a.geometries;var f=[],g,h;g=0;for(h=a.length;g<h;++g)f[g]=zs(a[g],b,c,d,e);return f}
function zs(a,b,c,d,e){var f=a.type,g=As[f];b="Point"===f||"MultiPoint"===f?g(a,c,d):g(a,b);c=new Ik;c.Ua(un(b,!1,e));void 0!==a.id&&c.mc(a.id);a.properties&&c.G(a.properties);return c}
ws.prototype.Jf=function(a,b){if("Topology"==a.type){var c,d=null,e=null;a.transform&&(c=a.transform,d=c.scale,e=c.translate);var f=a.arcs;if(c){c=d;var g=e,h,l;h=0;for(l=f.length;h<l;++h){var m=f[h],n=c,p=g,q=0,r=0,u,x,v;x=0;for(v=m.length;x<v;++x)u=m[x],q+=u[0],r+=u[1],u[0]=q,u[1]=r,Bs(u,n,p)}}c=[];g=Ga(a.objects);h=0;for(l=g.length;h<l;++h)"GeometryCollection"===g[h].type?(m=g[h],c.push.apply(c,ys(m,f,d,e,b))):(m=g[h],c.push(zs(m,f,d,e,b)));return c}return[]};
function Bs(a,b,c){a[0]=a[0]*b[0]+c[0];a[1]=a[1]*b[1]+c[1]}ws.prototype.Oa=function(){return this.defaultDataProjection};
var As={Point:function(a,b,c){a=a.coordinates;b&&c&&Bs(a,b,c);return new C(a)},LineString:function(a,b){var c=xs(a.arcs,b);return new R(c)},Polygon:function(a,b){var c=[],d,e;d=0;for(e=a.arcs.length;d<e;++d)c[d]=xs(a.arcs[d],b);return new E(c)},MultiPoint:function(a,b,c){a=a.coordinates;var d,e;if(b&&c)for(d=0,e=a.length;d<e;++d)Bs(a[d],b,c);return new Bn(a)},MultiLineString:function(a,b){var c=[],d,e;d=0;for(e=a.arcs.length;d<e;++d)c[d]=xs(a.arcs[d],b);return new S(c)},MultiPolygon:function(a,b){var c=
[],d,e,f,g,h,l;h=0;for(l=a.arcs.length;h<l;++h){d=a.arcs[h];e=[];f=0;for(g=d.length;f<g;++f)e[f]=xs(d[f],b);c[h]=e}return new T(c)}};function Cs(a){a=a?a:{};this.i=a.featureType;this.g=a.featureNS;this.b=a.gmlFormat?a.gmlFormat:new lo;this.c=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd";Un.call(this)}y(Cs,Un);Cs.prototype.lc=function(a,b){var c={featureType:this.i,featureNS:this.g};Ea(c,sn(this,a,b?b:{}));c=[c];this.b.b["http://www.opengis.net/gml"].featureMember=Tk(Xn.prototype.vd);(c=O([],this.b.b,a,c,this.b))||(c=[]);return c};
Cs.prototype.o=function(a){if(Pk(a))return Ds(a);if(Qk(a))return O({},Es,a,[]);if("string"===typeof a)return a=Rk(a),Ds(a)};Cs.prototype.l=function(a){if(Pk(a))return Fs(this,a);if(Qk(a))return Gs(this,a);if("string"===typeof a)return a=Rk(a),Fs(this,a)};function Fs(a,b){for(var c=b.firstChild;c;c=c.nextSibling)if(c.nodeType==Node.ELEMENT_NODE)return Gs(a,c)}var Hs={"http://www.opengis.net/gml":{boundedBy:J(Xn.prototype.ye,"bounds")}};
function Gs(a,b){var c={},d=fo(b.getAttribute("numberOfFeatures"));c.numberOfFeatures=d;return O(c,Hs,b,[],a.b)}
var Is={"http://www.opengis.net/wfs":{totalInserted:J(eo),totalUpdated:J(eo),totalDeleted:J(eo)}},Js={"http://www.opengis.net/ogc":{FeatureId:Tk(function(a){return a.getAttribute("fid")})}},Ks={"http://www.opengis.net/wfs":{Feature:function(a,b){al(Js,a,b)}}},Es={"http://www.opengis.net/wfs":{TransactionSummary:J(function(a,b){return O({},Is,a,b)},"transactionSummary"),InsertResults:J(function(a,b){return O([],Ks,a,b)},"insertIds")}};
function Ds(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return O({},Es,a,[])}var Ls={"http://www.opengis.net/wfs":{PropertyName:L(ho)}};function Ms(a,b){var c=Mk("http://www.opengis.net/ogc","Filter"),d=Mk("http://www.opengis.net/ogc","FeatureId");c.appendChild(d);d.setAttribute("fid",b);a.appendChild(c)}
var Ns={"http://www.opengis.net/wfs":{Insert:L(function(a,b,c){var d=c[c.length-1],d=Mk(d.featureNS,d.featureType);a.appendChild(d);lo.prototype.Bi(d,b,c)}),Update:L(function(a,b,c){var d=c[c.length-1],e=d.featureType,f=d.featurePrefix,f=f?f:"feature",g=d.featureNS;a.setAttribute("typeName",f+":"+e);a.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:"+f,g);e=b.Xa();if(void 0!==e){for(var f=b.N(),g=[],h=0,l=f.length;h<l;h++){var m=b.get(f[h]);void 0!==m&&g.push({name:f[h],value:m})}bl({node:a,
srsName:d.srsName},Ns,Xk("Property"),g,c);Ms(a,e)}}),Delete:L(function(a,b,c){var d=c[c.length-1];c=d.featureType;var e=d.featurePrefix,e=e?e:"feature",d=d.featureNS;a.setAttribute("typeName",e+":"+c);a.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:"+e,d);b=b.Xa();void 0!==b&&Ms(a,b)}),Property:L(function(a,b,c){var d=Mk("http://www.opengis.net/wfs","Name");a.appendChild(d);ho(d,b.name);void 0!==b.value&&null!==b.value&&(d=Mk("http://www.opengis.net/wfs","Value"),a.appendChild(d),b.value instanceof
Tc?lo.prototype.Je(d,b.value,c):ho(d,b.value))}),Native:L(function(a,b){b.wp&&a.setAttribute("vendorId",b.wp);void 0!==b.Yo&&a.setAttribute("safeToIgnore",b.Yo);void 0!==b.value&&ho(a,b.value)})}};function Os(a,b,c){a={node:a};var d=b.b;bl(a,Ps,Xk(d.Wb),[d],c);b=b.a;bl(a,Ps,Xk(b.Wb),[b],c)}function Qs(a,b){void 0!==b.a&&a.setAttribute("matchCase",b.a.toString());Rs(a,b.b);Ss("Literal",a,""+b.g)}function Ss(a,b,c){a=Mk("http://www.opengis.net/ogc",a);ho(a,c);b.appendChild(a)}
function Rs(a,b){Ss("PropertyName",a,b)}
var Ps={"http://www.opengis.net/wfs":{Query:L(function(a,b,c){var d=c[c.length-1],e=d.featurePrefix,f=d.featureNS,g=d.propertyNames,h=d.srsName;a.setAttribute("typeName",(e?e+":":"")+b);h&&a.setAttribute("srsName",h);f&&a.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:"+e,f);b=Ea({},d);b.node=a;bl(b,Ls,Xk("PropertyName"),g,c);if(d=d.filter)g=Mk("http://www.opengis.net/ogc","Filter"),a.appendChild(g),bl({node:g},Ps,Xk(d.Wb),[d],c)})},"http://www.opengis.net/ogc":{And:L(Os),Or:L(Os),Not:L(function(a,
b,c){b=b.condition;bl({node:a},Ps,Xk(b.Wb),[b],c)}),BBOX:L(function(a,b,c){c[c.length-1].srsName=b.srsName;Rs(a,b.geometryName);lo.prototype.Je(a,b.extent,c)}),PropertyIsEqualTo:L(Qs),PropertyIsNotEqualTo:L(Qs),PropertyIsLessThan:L(Qs),PropertyIsLessThanOrEqualTo:L(Qs),PropertyIsGreaterThan:L(Qs),PropertyIsGreaterThanOrEqualTo:L(Qs),PropertyIsNull:L(function(a,b){Rs(a,b.b)}),PropertyIsBetween:L(function(a,b){Rs(a,b.b);Ss("LowerBoundary",a,""+b.a);Ss("UpperBoundary",a,""+b.g)}),PropertyIsLike:L(function(a,
b){a.setAttribute("wildCard",b.i);a.setAttribute("singleChar",b.c);a.setAttribute("escapeChar",b.g);void 0!==b.a&&a.setAttribute("matchCase",b.a.toString());Rs(a,b.b);Ss("Literal",a,""+b.f)})}};
Cs.prototype.j=function(a){var b=Mk("http://www.opengis.net/wfs","GetFeature");b.setAttribute("service","WFS");b.setAttribute("version","1.1.0");var c;if(a&&(a.handle&&b.setAttribute("handle",a.handle),a.outputFormat&&b.setAttribute("outputFormat",a.outputFormat),void 0!==a.maxFeatures&&b.setAttribute("maxFeatures",a.maxFeatures),a.resultType&&b.setAttribute("resultType",a.resultType),void 0!==a.startIndex&&b.setAttribute("startIndex",a.startIndex),void 0!==a.count&&b.setAttribute("count",a.count),
c=a.filter,a.bbox)){var d=Ar(a.geometryName,a.bbox,a.srsName);c?c=yr(c,d):c=d}b.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.c);d=a.featureTypes;a=[{node:b,srsName:a.srsName,featureNS:a.featureNS?a.featureNS:this.g,featurePrefix:a.featurePrefix,geometryName:a.geometryName,filter:c,propertyNames:a.propertyNames?a.propertyNames:[]}];c=Ea({},a[a.length-1]);c.node=b;bl(c,Ps,Xk("Query"),d,a);return b};
Cs.prototype.U=function(a,b,c,d){var e=[],f=Mk("http://www.opengis.net/wfs","Transaction");f.setAttribute("service","WFS");f.setAttribute("version","1.1.0");var g,h;d&&(g=d.gmlOptions?d.gmlOptions:{},d.handle&&f.setAttribute("handle",d.handle));f.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.c);a&&(h={node:f,featureNS:d.featureNS,featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},Ea(h,g),bl(h,Ns,Xk("Insert"),a,e));b&&(h={node:f,featureNS:d.featureNS,
featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},Ea(h,g),bl(h,Ns,Xk("Update"),b,e));c&&bl({node:f,featureNS:d.featureNS,featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},Ns,Xk("Delete"),c,e);d.nativeElements&&bl({node:f,featureNS:d.featureNS,featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},Ns,Xk("Native"),d.nativeElements,e);return f};
Cs.prototype.Pf=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.Be(a);return null};Cs.prototype.Be=function(a){if(a.firstElementChild&&a.firstElementChild.firstElementChild)for(a=a.firstElementChild.firstElementChild,a=a.firstElementChild;a;a=a.nextElementSibling)if(0!==a.childNodes.length&&(1!==a.childNodes.length||3!==a.firstChild.nodeType)){var b=[{}];this.b.ye(a,b);return yc(b.pop().srsName)}return null};function Ts(a){a=a?a:{};this.defaultDataProjection=null;this.b=void 0!==a.splitCollection?a.splitCollection:!1}y(Ts,bp);function Us(a){a=a.Z();return 0===a.length?"":a[0]+" "+a[1]}function Vs(a){a=a.Z();for(var b=[],c=0,d=a.length;c<d;++c)b.push(a[c][0]+" "+a[c][1]);return b.join(",")}function Ws(a){var b=[];a=a.Vd();for(var c=0,d=a.length;c<d;++c)b.push("("+Vs(a[c])+")");return b.join(",")}function Xs(a){var b=a.X();a=(0,Ys[b])(a);b=b.toUpperCase();return 0===a.length?b+" EMPTY":b+"("+a+")"}
var Ys={Point:Us,LineString:Vs,Polygon:Ws,MultiPoint:function(a){var b=[];a=a.je();for(var c=0,d=a.length;c<d;++c)b.push("("+Us(a[c])+")");return b.join(",")},MultiLineString:function(a){var b=[];a=a.md();for(var c=0,d=a.length;c<d;++c)b.push("("+Vs(a[c])+")");return b.join(",")},MultiPolygon:function(a){var b=[];a=a.Wd();for(var c=0,d=a.length;c<d;++c)b.push("("+Ws(a[c])+")");return b.join(",")},GeometryCollection:function(a){var b=[];a=a.ff();for(var c=0,d=a.length;c<d;++c)b.push(Xs(a[c]));return b.join(",")}};
k=Ts.prototype;k.ud=function(a,b){var c=this.wd(a,b);if(c){var d=new Ik;d.Ua(c);return d}return null};k.Kf=function(a,b){var c=[],d=this.wd(a,b);this.b&&"GeometryCollection"==d.X()?c=d.c:c=[d];for(var e=[],f=0,g=c.length;f<g;++f)d=new Ik,d.Ua(c[f]),e.push(d);return e};k.wd=function(a,b){var c;c=new Zs(new $s(a));c.b=at(c.a);return(c=bt(c))?un(c,!1,b):null};k.He=function(a,b){var c=a.W();return c?this.Ed(c,b):""};
k.Ci=function(a,b){if(1==a.length)return this.He(a[0],b);for(var c=[],d=0,e=a.length;d<e;++d)c.push(a[d].W());c=new Ln(c);return this.Ed(c,b)};k.Ed=function(a,b){return Xs(un(a,!0,b))};function $s(a){this.a=a;this.b=-1}
function at(a){var b=a.a.charAt(++a.b),c={position:a.b,value:b};if("("==b)c.type=2;else if(","==b)c.type=5;else if(")"==b)c.type=3;else if("0"<=b&&"9">=b||"."==b||"-"==b){c.type=4;var d,b=a.b,e=!1,f=!1;do{if("."==d)e=!0;else if("e"==d||"E"==d)f=!0;d=a.a.charAt(++a.b)}while("0"<=d&&"9">=d||"."==d&&(void 0===e||!e)||!f&&("e"==d||"E"==d)||f&&("-"==d||"+"==d));a=parseFloat(a.a.substring(b,a.b--));c.value=a}else if("a"<=b&&"z">=b||"A"<=b&&"Z">=b){c.type=1;b=a.b;do d=a.a.charAt(++a.b);while("a"<=d&&"z">=
d||"A"<=d&&"Z">=d);a=a.a.substring(b,a.b--).toUpperCase();c.value=a}else{if(" "==b||"\t"==b||"\r"==b||"\n"==b)return at(a);if(""===b)c.type=6;else throw Error("Unexpected character: "+b);}return c}function Zs(a){this.a=a}k=Zs.prototype;k.match=function(a){if(a=this.b.type==a)this.b=at(this.a);return a};
function bt(a){var b=a.b;if(a.match(1)){var c=b.value;if("GEOMETRYCOLLECTION"==c){a:{if(a.match(2)){b=[];do b.push(bt(a));while(a.match(5));if(a.match(3)){a=b;break a}}else if(ct(a)){a=[];break a}throw Error(dt(a));}return new Ln(a)}var d=et[c],b=ft[c];if(!d||!b)throw Error("Invalid geometry type: "+c);a=d.call(a);return new b(a)}throw Error(dt(a));}k.Ef=function(){if(this.match(2)){var a=gt(this);if(this.match(3))return a}else if(ct(this))return null;throw Error(dt(this));};
k.Df=function(){if(this.match(2)){var a=ht(this);if(this.match(3))return a}else if(ct(this))return[];throw Error(dt(this));};k.Ff=function(){if(this.match(2)){var a=it(this);if(this.match(3))return a}else if(ct(this))return[];throw Error(dt(this));};k.io=function(){if(this.match(2)){var a;if(2==this.b.type)for(a=[this.Ef()];this.match(5);)a.push(this.Ef());else a=ht(this);if(this.match(3))return a}else if(ct(this))return[];throw Error(dt(this));};
k.ho=function(){if(this.match(2)){var a=it(this);if(this.match(3))return a}else if(ct(this))return[];throw Error(dt(this));};k.jo=function(){if(this.match(2)){for(var a=[this.Ff()];this.match(5);)a.push(this.Ff());if(this.match(3))return a}else if(ct(this))return[];throw Error(dt(this));};function gt(a){for(var b=[],c=0;2>c;++c){var d=a.b;if(a.match(4))b.push(d.value);else break}if(2==b.length)return b;throw Error(dt(a));}function ht(a){for(var b=[gt(a)];a.match(5);)b.push(gt(a));return b}
function it(a){for(var b=[a.Df()];a.match(5);)b.push(a.Df());return b}function ct(a){var b=1==a.b.type&&"EMPTY"==a.b.value;b&&(a.b=at(a.a));return b}function dt(a){return"Unexpected `"+a.b.value+"` at position "+a.b.position+" in `"+a.a.a+"`"}var ft={POINT:C,LINESTRING:R,POLYGON:E,MULTIPOINT:Bn,MULTILINESTRING:S,MULTIPOLYGON:T},et={POINT:Zs.prototype.Ef,LINESTRING:Zs.prototype.Df,POLYGON:Zs.prototype.Ff,MULTIPOINT:Zs.prototype.io,MULTILINESTRING:Zs.prototype.ho,MULTIPOLYGON:Zs.prototype.jo};function jt(){this.version=void 0}y(jt,Zr);jt.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.b(a);return null};jt.prototype.b=function(a){this.version=a.getAttribute("version").trim();return(a=O({version:this.version},kt,a,[]))?a:null};function lt(a,b){return O({},mt,a,b)}function nt(a,b){return O({},ot,a,b)}function pt(a,b){var c=lt(a,b);if(c){var d=[fo(a.getAttribute("width")),fo(a.getAttribute("height"))];c.size=d;return c}}
function qt(a,b){return O([],rt,a,b)}
var st=[null,"http://www.opengis.net/wms"],kt=M(st,{Service:J(function(a,b){return O({},tt,a,b)}),Capability:J(function(a,b){return O({},ut,a,b)})}),ut=M(st,{Request:J(function(a,b){return O({},vt,a,b)}),Exception:J(function(a,b){return O([],wt,a,b)}),Layer:J(function(a,b){return O({},xt,a,b)})}),tt=M(st,{Name:J(U),Title:J(U),Abstract:J(U),KeywordList:J(qt),OnlineResource:J(Yr),ContactInformation:J(function(a,b){return O({},yt,a,b)}),Fees:J(U),AccessConstraints:J(U),LayerLimit:J(eo),MaxWidth:J(eo),
MaxHeight:J(eo)}),yt=M(st,{ContactPersonPrimary:J(function(a,b){return O({},zt,a,b)}),ContactPosition:J(U),ContactAddress:J(function(a,b){return O({},At,a,b)}),ContactVoiceTelephone:J(U),ContactFacsimileTelephone:J(U),ContactElectronicMailAddress:J(U)}),zt=M(st,{ContactPerson:J(U),ContactOrganization:J(U)}),At=M(st,{AddressType:J(U),Address:J(U),City:J(U),StateOrProvince:J(U),PostCode:J(U),Country:J(U)}),wt=M(st,{Format:Tk(U)}),xt=M(st,{Name:J(U),Title:J(U),Abstract:J(U),KeywordList:J(qt),CRS:Vk(U),
EX_GeographicBoundingBox:J(function(a,b){var c=O({},Bt,a,b);if(c){var d=c.westBoundLongitude,e=c.southBoundLatitude,f=c.eastBoundLongitude,c=c.northBoundLatitude;return void 0===d||void 0===e||void 0===f||void 0===c?void 0:[d,e,f,c]}}),BoundingBox:Vk(function(a){var b=[co(a.getAttribute("minx")),co(a.getAttribute("miny")),co(a.getAttribute("maxx")),co(a.getAttribute("maxy"))],c=[co(a.getAttribute("resx")),co(a.getAttribute("resy"))];return{crs:a.getAttribute("CRS"),extent:b,res:c}}),Dimension:Vk(function(a){return{name:a.getAttribute("name"),
units:a.getAttribute("units"),unitSymbol:a.getAttribute("unitSymbol"),"default":a.getAttribute("default"),multipleValues:$n(a.getAttribute("multipleValues")),nearestValue:$n(a.getAttribute("nearestValue")),current:$n(a.getAttribute("current")),values:U(a)}}),Attribution:J(function(a,b){return O({},Ct,a,b)}),AuthorityURL:Vk(function(a,b){var c=lt(a,b);if(c)return c.name=a.getAttribute("name"),c}),Identifier:Vk(U),MetadataURL:Vk(function(a,b){var c=lt(a,b);if(c)return c.type=a.getAttribute("type"),
c}),DataURL:Vk(lt),FeatureListURL:Vk(lt),Style:Vk(function(a,b){return O({},Dt,a,b)}),MinScaleDenominator:J(bo),MaxScaleDenominator:J(bo),Layer:Vk(function(a,b){var c=b[b.length-1],d=O({},xt,a,b);if(d){var e=$n(a.getAttribute("queryable"));void 0===e&&(e=c.queryable);d.queryable=void 0!==e?e:!1;e=fo(a.getAttribute("cascaded"));void 0===e&&(e=c.cascaded);d.cascaded=e;e=$n(a.getAttribute("opaque"));void 0===e&&(e=c.opaque);d.opaque=void 0!==e?e:!1;e=$n(a.getAttribute("noSubsets"));void 0===e&&(e=c.noSubsets);
d.noSubsets=void 0!==e?e:!1;(e=co(a.getAttribute("fixedWidth")))||(e=c.fixedWidth);d.fixedWidth=e;(e=co(a.getAttribute("fixedHeight")))||(e=c.fixedHeight);d.fixedHeight=e;["Style","CRS","AuthorityURL"].forEach(function(a){a in c&&(d[a]=(d[a]||[]).concat(c[a]))});"EX_GeographicBoundingBox BoundingBox Dimension Attribution MinScaleDenominator MaxScaleDenominator".split(" ").forEach(function(a){a in d||(d[a]=c[a])});return d}})}),Ct=M(st,{Title:J(U),OnlineResource:J(Yr),LogoURL:J(pt)}),Bt=M(st,{westBoundLongitude:J(bo),
eastBoundLongitude:J(bo),southBoundLatitude:J(bo),northBoundLatitude:J(bo)}),vt=M(st,{GetCapabilities:J(nt),GetMap:J(nt),GetFeatureInfo:J(nt)}),ot=M(st,{Format:Vk(U),DCPType:Vk(function(a,b){return O({},Et,a,b)})}),Et=M(st,{HTTP:J(function(a,b){return O({},Ft,a,b)})}),Ft=M(st,{Get:J(lt),Post:J(lt)}),Dt=M(st,{Name:J(U),Title:J(U),Abstract:J(U),LegendURL:Vk(pt),StyleSheetURL:J(lt),StyleURL:J(lt)}),mt=M(st,{Format:J(U),OnlineResource:J(Yr)}),rt=M(st,{Keyword:Tk(U)});function Gt(a){a=a?a:{};this.g="http://mapserver.gis.umn.edu/mapserver";this.b=new ko;this.c=a.layers?a.layers:null;Un.call(this)}y(Gt,Un);
Gt.prototype.lc=function(a,b){var c={};b&&Ea(c,sn(this,a,b));var d=[c];a.setAttribute("namespaceURI",this.g);var e=a.localName,c=[];if(0!==a.childNodes.length){if("msGMLOutput"==e)for(var f=0,g=a.childNodes.length;f<g;f++){var h=a.childNodes[f];if(h.nodeType===Node.ELEMENT_NODE){var l=d[0],m=h.localName.replace("_layer","");if(!this.c||jb(this.c,m)){m+="_feature";l.featureType=m;l.featureNS=this.g;var n={};n[m]=Tk(this.b.If,this.b);l=M([l.featureNS,null],n);h.setAttribute("namespaceURI",this.g);(h=
O([],l,h,d,this.b))&&mb(c,h)}}}"FeatureCollection"==e&&(d=O([],this.b.b,a,[{}],this.b))&&(c=d)}return c};function Ht(){this.g=new $r}y(Ht,Zr);Ht.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.b(a);return null};Ht.prototype.b=function(a){var b=a.getAttribute("version").trim(),c=this.g.b(a);if(!c)return null;c.version=b;return(c=O(c,It,a,[]))?c:null};function Jt(a){var b=U(a).split(" ");if(b&&2==b.length)return a=+b[0],b=+b[1],isNaN(a)||isNaN(b)?void 0:[a,b]}
var Kt=[null,"http://www.opengis.net/wmts/1.0"],Lt=[null,"http://www.opengis.net/ows/1.1"],It=M(Kt,{Contents:J(function(a,b){return O({},Mt,a,b)})}),Mt=M(Kt,{Layer:Vk(function(a,b){return O({},Nt,a,b)}),TileMatrixSet:Vk(function(a,b){return O({},Ot,a,b)})}),Nt=M(Kt,{Style:Vk(function(a,b){var c=O({},Pt,a,b);if(c){var d="true"===a.getAttribute("isDefault");c.isDefault=d;return c}}),Format:Vk(U),TileMatrixSetLink:Vk(function(a,b){return O({},Qt,a,b)}),Dimension:Vk(function(a,b){return O({},Rt,a,b)}),
ResourceURL:Vk(function(a){var b=a.getAttribute("format"),c=a.getAttribute("template");a=a.getAttribute("resourceType");var d={};b&&(d.format=b);c&&(d.template=c);a&&(d.resourceType=a);return d})},M(Lt,{Title:J(U),Abstract:J(U),WGS84BoundingBox:J(function(a,b){var c=O([],St,a,b);return 2!=c.length?void 0:Kb(c)}),Identifier:J(U)})),Pt=M(Kt,{LegendURL:Vk(function(a){var b={};b.format=a.getAttribute("format");b.href=Yr(a);return b})},M(Lt,{Title:J(U),Identifier:J(U)})),Qt=M(Kt,{TileMatrixSet:J(U)}),
Rt=M(Kt,{Default:J(U),Value:Vk(U)},M(Lt,{Identifier:J(U)})),St=M(Lt,{LowerCorner:Tk(Jt),UpperCorner:Tk(Jt)}),Ot=M(Kt,{WellKnownScaleSet:J(U),TileMatrix:Vk(function(a,b){return O({},Tt,a,b)})},M(Lt,{SupportedCRS:J(U),Identifier:J(U)})),Tt=M(Kt,{TopLeftCorner:J(Jt),ScaleDenominator:J(bo),TileWidth:J(eo),TileHeight:J(eo),MatrixWidth:J(eo),MatrixHeight:J(eo)},M(Lt,{Identifier:J(U)}));function Ut(a){eb.call(this);a=a||{};this.a=null;this.c=Qc;this.f=void 0;B(this,gb("projection"),this.Nl,this);B(this,gb("tracking"),this.Ol,this);void 0!==a.projection&&this.dh(yc(a.projection));void 0!==a.trackingOptions&&this.si(a.trackingOptions);this.ge(void 0!==a.tracking?a.tracking:!1)}y(Ut,eb);k=Ut.prototype;k.ka=function(){this.ge(!1);eb.prototype.ka.call(this)};k.Nl=function(){var a=this.ah();a&&(this.c=Bc(yc("EPSG:4326"),a),this.a&&this.set("position",this.c(this.a)))};
k.Ol=function(){if(kg){var a=this.bh();a&&void 0===this.f?this.f=pa.navigator.geolocation.watchPosition(this.qo.bind(this),this.ro.bind(this),this.Mg()):a||void 0===this.f||(pa.navigator.geolocation.clearWatch(this.f),this.f=void 0)}};
k.qo=function(a){a=a.coords;this.set("accuracy",a.accuracy);this.set("altitude",null===a.altitude?void 0:a.altitude);this.set("altitudeAccuracy",null===a.altitudeAccuracy?void 0:a.altitudeAccuracy);this.set("heading",null===a.heading?void 0:wa(a.heading));this.a?(this.a[0]=a.longitude,this.a[1]=a.latitude):this.a=[a.longitude,a.latitude];var b=this.c(this.a);this.set("position",b);this.set("speed",null===a.speed?void 0:a.speed);a=Nd(Yi,this.a,a.accuracy);a.rc(this.c);this.set("accuracyGeometry",a);
this.u()};k.ro=function(a){a.type="error";this.ge(!1);this.b(a)};k.Mj=function(){return this.get("accuracy")};k.Nj=function(){return this.get("accuracyGeometry")||null};k.Pj=function(){return this.get("altitude")};k.Qj=function(){return this.get("altitudeAccuracy")};k.Ll=function(){return this.get("heading")};k.Ml=function(){return this.get("position")};k.ah=function(){return this.get("projection")};k.wk=function(){return this.get("speed")};k.bh=function(){return this.get("tracking")};k.Mg=function(){return this.get("trackingOptions")};
k.dh=function(a){this.set("projection",a)};k.ge=function(a){this.set("tracking",a)};k.si=function(a){this.set("trackingOptions",a)};function Vt(a,b,c){hd.call(this);this.Vf(a,b?b:0,c)}y(Vt,hd);k=Vt.prototype;k.clone=function(){var a=new Vt(null),b=this.B.slice();jd(a,this.f,b);a.u();return a};k.sb=function(a,b,c,d){var e=this.B;a-=e[0];var f=b-e[1];b=a*a+f*f;if(b<d){if(0===b)for(d=0;d<this.a;++d)c[d]=e[d];else for(d=this.wf()/Math.sqrt(b),c[0]=e[0]+d*a,c[1]=e[1]+d*f,d=2;d<this.a;++d)c[d]=e[d];c.length=this.a;return b}return d};k.Bc=function(a,b){var c=this.B,d=a-c[0],c=b-c[1];return d*d+c*c<=Wt(this)};
k.rd=function(){return this.B.slice(0,this.a)};k.Od=function(a){var b=this.B,c=b[this.a]-b[0];return Wb(b[0]-c,b[1]-c,b[0]+c,b[1]+c,a)};k.wf=function(){return Math.sqrt(Wt(this))};function Wt(a){var b=a.B[a.a]-a.B[0];a=a.B[a.a+1]-a.B[1];return b*b+a*a}k.X=function(){return"Circle"};k.Ka=function(a){var b=this.H();return nc(a,b)?(b=this.rd(),a[0]<=b[0]&&a[2]>=b[0]||a[1]<=b[1]&&a[3]>=b[1]?!0:bc(a,this.sg,this)):!1};
k.jm=function(a){var b=this.a,c=this.B[b]-this.B[0],d=a.slice();d[b]=d[0]+c;for(c=1;c<b;++c)d[b+c]=a[c];jd(this,this.f,d);this.u()};k.Vf=function(a,b,c){if(a){kd(this,c,a,0);this.B||(this.B=[]);c=this.B;a=sd(c,a);c[a++]=c[0]+b;var d;b=1;for(d=this.a;b<d;++b)c[a++]=c[b];c.length=a}else jd(this,"XY",null);this.u()};k.km=function(a){this.B[this.a]=this.B[0]+a;this.u()};function Xt(a,b,c){for(var d=[],e=a(0),f=a(1),g=b(e),h=b(f),l=[f,e],m=[h,g],n=[1,0],p={},q=1E5,r,u,x,v,D;0<--q&&0<n.length;)x=n.pop(),e=l.pop(),g=m.pop(),f=x.toString(),f in p||(d.push(g[0],g[1]),p[f]=!0),v=n.pop(),f=l.pop(),h=m.pop(),D=(x+v)/2,r=a(D),u=b(r),ua(u[0],u[1],g[0],g[1],h[0],h[1])<c?(d.push(h[0],h[1]),f=v.toString(),p[f]=!0):(n.push(v,D,D,x),m.push(h,u,u,g),l.push(f,r,r,e));return d}function Yt(a,b,c,d,e){var f=yc("EPSG:4326");return Xt(function(d){return[a,b+(c-b)*d]},Pc(f,d),e)}
function Zt(a,b,c,d,e){var f=yc("EPSG:4326");return Xt(function(d){return[b+(c-b)*d,a]},Pc(f,d),e)};function $t(a){a=a||{};this.c=this.o=null;this.g=this.i=Infinity;this.f=this.l=-Infinity;this.A=this.U=Infinity;this.D=this.C=-Infinity;this.Ba=void 0!==a.targetSize?a.targetSize:100;this.R=void 0!==a.maxLines?a.maxLines:100;this.b=[];this.a=[];this.ya=void 0!==a.strokeStyle?a.strokeStyle:au;this.v=this.j=void 0;this.s=null;this.setMap(void 0!==a.map?a.map:null)}var au=new oj({color:"rgba(0,0,0,0.2)"}),bu=[90,45,30,20,10,5,2,1,.5,.2,.1,.05,.01,.005,.002,.001];
function cu(a,b,c,d,e,f,g){var h=g;b=Yt(b,c,d,a.c,e);h=void 0!==a.b[h]?a.b[h]:new R(null);h.ba("XY",b);nc(h.H(),f)&&(a.b[g++]=h);return g}function du(a,b,c,d,e){var f=e;b=Zt(b,a.f,a.g,a.c,c);f=void 0!==a.a[f]?a.a[f]:new R(null);f.ba("XY",b);nc(f.H(),d)&&(a.a[e++]=f);return e}k=$t.prototype;k.Pl=function(){return this.o};k.ik=function(){return this.b};k.qk=function(){return this.a};
k.Rg=function(a){var b=a.vectorContext,c=a.frameState,d=c.extent;a=c.viewState;var e=a.center,f=a.projection,g=a.resolution;a=c.pixelRatio;a=g*g/(4*a*a);if(!this.c||!Oc(this.c,f)){var h=yc("EPSG:4326"),l=f.H(),m=f.i,n=Sc(m,h,f),p=m[2],q=m[1],r=m[0],u=n[3],x=n[2],v=n[1],n=n[0];this.i=m[3];this.g=p;this.l=q;this.f=r;this.U=u;this.A=x;this.C=v;this.D=n;this.j=Pc(h,f);this.v=Pc(f,h);this.s=this.v(kc(l));this.c=f}f.a&&(f=f.H(),h=ic(f),c=c.focus[0],c<f[0]||c>f[2])&&(c=h*Math.ceil((f[0]-c)/h),d=[d[0]+c,
d[1],d[2]+c,d[3]]);c=this.s[0];f=this.s[1];h=-1;m=Math.pow(this.Ba*g,2);p=[];q=[];g=0;for(l=bu.length;g<l;++g){r=bu[g]/2;p[0]=c-r;p[1]=f-r;q[0]=c+r;q[1]=f+r;this.j(p,p);this.j(q,q);r=Math.pow(q[0]-p[0],2)+Math.pow(q[1]-p[1],2);if(r<=m)break;h=bu[g]}g=h;if(-1==g)this.b.length=this.a.length=0;else{c=this.v(e);e=c[0];c=c[1];f=this.R;h=[Math.max(d[0],this.D),Math.max(d[1],this.C),Math.min(d[2],this.A),Math.min(d[3],this.U)];h=Sc(h,this.c,"EPSG:4326");m=h[3];q=h[1];e=Math.floor(e/g)*g;p=sa(e,this.f,this.g);
l=cu(this,p,q,m,a,d,0);for(h=0;p!=this.f&&h++<f;)p=Math.max(p-g,this.f),l=cu(this,p,q,m,a,d,l);p=sa(e,this.f,this.g);for(h=0;p!=this.g&&h++<f;)p=Math.min(p+g,this.g),l=cu(this,p,q,m,a,d,l);this.b.length=l;c=Math.floor(c/g)*g;e=sa(c,this.l,this.i);l=du(this,e,a,d,0);for(h=0;e!=this.l&&h++<f;)e=Math.max(e-g,this.l),l=du(this,e,a,d,l);e=sa(c,this.l,this.i);for(h=0;e!=this.i&&h++<f;)e=Math.min(e+g,this.i),l=du(this,e,a,d,l);this.a.length=l}b.Sb(null,this.ya);a=0;for(e=this.b.length;a<e;++a)g=this.b[a],
b.hd(g,null);a=0;for(e=this.a.length;a<e;++a)g=this.a[a],b.hd(g,null)};k.setMap=function(a){this.o&&(this.o.J("postcompose",this.Rg,this),this.o.render());a&&(a.I("postcompose",this.Rg,this),a.render());this.o=a};function eu(a,b,c,d,e,f,g){oh.call(this,a,b,c,0,d);this.j=e;this.g=new Image;null!==f&&(this.g.crossOrigin=f);this.i={};this.c=null;this.state=0;this.o=g}y(eu,oh);eu.prototype.a=function(a){if(void 0!==a){var b;a=w(a);if(a in this.i)return this.i[a];Ha(this.i)?b=this.g:b=this.g.cloneNode(!1);return this.i[a]=b}return this.g};eu.prototype.s=function(){this.state=3;this.c.forEach(Ka);this.c=null;ph(this)};
eu.prototype.v=function(){void 0===this.resolution&&(this.resolution=jc(this.extent)/this.g.height);this.state=2;this.c.forEach(Ka);this.c=null;ph(this)};eu.prototype.load=function(){if(0==this.state||3==this.state)this.state=1,ph(this),this.c=[Pa(this.g,"error",this.s,this),Pa(this.g,"load",this.v,this)],this.o(this,this.j)};function fu(a,b,c,d,e){df.call(this,a,b);this.s=c;this.g=new Image;null!==d&&(this.g.crossOrigin=d);this.c={};this.j=null;this.v=e}y(fu,df);k=fu.prototype;k.ka=function(){1==this.state&&gu(this);this.a&&Ta(this.a);this.state=5;ef(this);df.prototype.ka.call(this)};k.$a=function(a){if(void 0!==a){var b=w(a);if(b in this.c)return this.c[b];a=Ha(this.c)?this.g:this.g.cloneNode(!1);return this.c[b]=a}return this.g};k.ib=function(){return this.s};k.Ql=function(){this.state=3;gu(this);ef(this)};
k.Rl=function(){this.state=this.g.naturalWidth&&this.g.naturalHeight?2:4;gu(this);ef(this)};k.load=function(){if(0==this.state||3==this.state)this.state=1,ef(this),this.j=[Pa(this.g,"error",this.Ql,this),Pa(this.g,"load",this.Rl,this)],this.v(this,this.s)};function gu(a){a.j.forEach(Ka);a.j=null};function hu(a){a=a?a:{};Vh.call(this,{handleEvent:qc});this.c=a.formatConstructors?a.formatConstructors:[];this.j=a.projection?yc(a.projection):null;this.a=null;this.target=a.target?a.target:null}y(hu,Vh);function iu(a){a=a.dataTransfer.files;var b,c,d;b=0;for(c=a.length;b<c;++b){d=a.item(b);var e=new FileReader;e.addEventListener("load",this.o.bind(this,d));e.readAsText(d)}}function ju(a){a.stopPropagation();a.preventDefault();a.dataTransfer.dropEffect="copy"}
hu.prototype.o=function(a,b){var c=b.target.result,d=this.v,e=this.j;e||(e=d.aa().l);var d=this.c,f=[],g,h;g=0;for(h=d.length;g<h;++g){var l=new d[g];var m={featureProjection:e};try{f=l.Fa(c,m)}catch(n){f=null}if(f&&0<f.length)break}this.b(new ku(lu,this,a,f,e))};hu.prototype.setMap=function(a){this.a&&(this.a.forEach(Ka),this.a=null);Vh.prototype.setMap.call(this,a);a&&(a=this.target?this.target:a.a,this.a=[B(a,"drop",iu,this),B(a,"dragenter",ju,this),B(a,"dragover",ju,this),B(a,"drop",ju,this)])};
var lu="addfeatures";function ku(a,b,c,d,e){Wa.call(this,a,b);this.features=d;this.file=c;this.projection=e}y(ku,Wa);function mu(a){a=a?a:{};ji.call(this,{handleDownEvent:nu,handleDragEvent:ou,handleUpEvent:pu});this.s=a.condition?a.condition:fi;this.a=this.c=void 0;this.j=0;this.A=void 0!==a.duration?a.duration:400}y(mu,ji);
function ou(a){if(hi(a)){var b=a.map,c=b.Za(),d=a.pixel;a=d[0]-c[0]/2;d=c[1]/2-d[1];c=Math.atan2(d,a);a=Math.sqrt(a*a+d*d);d=b.aa();b.render();if(void 0!==this.c){var e=c-this.c;Wh(b,d,d.La()-e)}this.c=c;void 0!==this.a&&(c=this.a*(d.$()/a),Yh(b,d,c));void 0!==this.a&&(this.j=this.a/a);this.a=a}}
function pu(a){if(!hi(a))return!0;a=a.map;var b=a.aa();Xd(b,-1);var c=this.j-1,d=b.La(),d=b.constrainRotation(d,0);Wh(a,b,d,void 0,void 0);var d=b.$(),e=this.A,d=b.constrainResolution(d,0,c);Yh(a,b,d,void 0,e);this.j=0;return!1}function nu(a){return hi(a)&&this.s(a)?(Xd(a.map.aa(),1),this.a=this.c=void 0,!0):!1};function qu(a,b){Wa.call(this,a);this.feature=b}y(qu,Wa);
function ru(a){ji.call(this,{handleDownEvent:su,handleEvent:tu,handleUpEvent:uu});this.za=null;this.S=!1;this.Hc=a.source?a.source:null;this.qb=a.features?a.features:null;this.Cj=a.snapTolerance?a.snapTolerance:12;this.Y=a.type;this.c=vu(this.Y);this.Sa=a.minPoints?a.minPoints:this.c===wu?3:2;this.Aa=a.maxPoints?a.maxPoints:Infinity;this.Ne=a.finishCondition?a.finishCondition:qc;var b=a.geometryFunction;if(!b)if("Circle"===this.Y)b=function(a,b){var c=b?b:new Vt([NaN,NaN]);c.Vf(a[0],Math.sqrt(Hb(a[0],
a[1])));return c};else{var c,b=this.c;b===xu?c=C:b===yu?c=R:b===wu&&(c=E);b=function(a,b){var f=b;f?f.pa(a):f=new c(a);return f}}this.D=b;this.T=this.A=this.a=this.R=this.j=this.s=null;this.Fj=a.clickTolerance?a.clickTolerance*a.clickTolerance:36;this.qa=new G({source:new P({useSpatialIndex:!1,wrapX:a.wrapX?a.wrapX:!1}),style:a.style?a.style:zu()});this.Hb=a.geometryName;this.Bj=a.condition?a.condition:ei;this.ta=a.freehandCondition?a.freehandCondition:fi;B(this,gb("active"),this.yi,this)}y(ru,ji);
function zu(){var a=wj();return function(b){return a[b.W().X()]}}k=ru.prototype;k.setMap=function(a){ji.prototype.setMap.call(this,a);this.yi()};function tu(a){this.c!==yu&&this.c!==wu||!this.ta(a)||(this.S=!0);var b=!this.S;this.S&&a.type===gh?(Au(this,a),b=!1):a.type===fh?b=Bu(this,a):a.type===$g&&(b=!1);return ki.call(this,a)&&b}function su(a){return this.Bj(a)?(this.za=a.pixel,!0):this.S?(this.za=a.pixel,this.s||Cu(this,a),!0):!1}
function uu(a){this.S=!1;var b=this.za,c=a.pixel,d=b[0]-c[0],b=b[1]-c[1],c=!0;d*d+b*b<=this.Fj&&(Bu(this,a),this.s?this.c===Du?this.jd():Eu(this,a)?this.Ne(a)&&this.jd():Au(this,a):(Cu(this,a),this.c===xu&&this.jd()),c=!1);return c}
function Bu(a,b){if(a.s){var c=b.coordinate,d=a.j.W(),e;a.c===xu?e=a.a:a.c===wu?(e=a.a[0],e=e[e.length-1],Eu(a,b)&&(c=a.s.slice())):(e=a.a,e=e[e.length-1]);e[0]=c[0];e[1]=c[1];a.D(a.a,d);a.R&&a.R.W().pa(c);d instanceof E&&a.c!==wu?(a.A||(a.A=new Ik(new R(null))),d=d.Hg(0),c=a.A.W(),c.ba(d.f,d.la())):a.T&&(c=a.A.W(),c.pa(a.T));Fu(a)}else c=b.coordinate.slice(),a.R?a.R.W().pa(c):(a.R=new Ik(new C(c)),Fu(a));return!0}
function Eu(a,b){var c=!1;if(a.j){var d=!1,e=[a.s];a.c===yu?d=a.a.length>a.Sa:a.c===wu&&(d=a.a[0].length>a.Sa,e=[a.a[0][0],a.a[0][a.a[0].length-2]]);if(d)for(var d=b.map,f=0,g=e.length;f<g;f++){var h=e[f],l=d.Ga(h),m=b.pixel,c=m[0]-l[0],l=m[1]-l[1],m=a.S&&a.ta(b)?1:a.Cj;if(c=Math.sqrt(c*c+l*l)<=m){a.s=h;break}}}return c}
function Cu(a,b){var c=b.coordinate;a.s=c;a.c===xu?a.a=c.slice():a.c===wu?(a.a=[[c.slice(),c.slice()]],a.T=a.a[0]):(a.a=[c.slice(),c.slice()],a.c===Du&&(a.T=a.a));a.T&&(a.A=new Ik(new R(a.T)));c=a.D(a.a);a.j=new Ik;a.Hb&&a.j.Ec(a.Hb);a.j.Ua(c);Fu(a);a.b(new qu("drawstart",a.j))}
function Au(a,b){var c=b.coordinate,d=a.j.W(),e,f;if(a.c===yu)a.s=c.slice(),f=a.a,f.push(c.slice()),e=f.length>a.Aa,a.D(f,d);else if(a.c===wu){f=a.a[0];f.push(c.slice());if(e=f.length>a.Aa)a.s=f[0];a.D(a.a,d)}Fu(a);e&&a.jd()}k.Qo=function(){var a=this.j.W(),b,c;this.c===yu?(b=this.a,b.splice(-2,1),this.D(b,a)):this.c===wu&&(b=this.a[0],b.splice(-2,1),c=this.A.W(),c.pa(b),this.D(this.a,a));0===b.length&&(this.s=null);Fu(this)};
k.jd=function(){var a=Gu(this),b=this.a,c=a.W();this.c===yu?(b.pop(),this.D(b,c)):this.c===wu&&(b[0].pop(),b[0].push(b[0][0]),this.D(b,c));"MultiPoint"===this.Y?a.Ua(new Bn([b])):"MultiLineString"===this.Y?a.Ua(new S([b])):"MultiPolygon"===this.Y&&a.Ua(new T([b]));this.b(new qu("drawend",a));this.qb&&this.qb.push(a);this.Hc&&this.Hc.rb(a)};function Gu(a){a.s=null;var b=a.j;b&&(a.j=null,a.R=null,a.A=null,a.qa.ha().clear(!0));return b}
k.rm=function(a){var b=a.W();this.j=a;this.a=b.Z();a=this.a[this.a.length-1];this.s=a.slice();this.a.push(a.slice());Fu(this);this.b(new qu("drawstart",this.j))};k.Gc=rc;function Fu(a){var b=[];a.j&&b.push(a.j);a.A&&b.push(a.A);a.R&&b.push(a.R);a=a.qa.ha();a.clear(!0);a.Jc(b)}k.yi=function(){var a=this.v,b=this.f();a&&b||Gu(this);this.qa.setMap(b?a:null)};
function vu(a){var b;"Point"===a||"MultiPoint"===a?b=xu:"LineString"===a||"MultiLineString"===a?b=yu:"Polygon"===a||"MultiPolygon"===a?b=wu:"Circle"===a&&(b=Du);return b}var xu="Point",yu="LineString",wu="Polygon",Du="Circle";function Hu(a,b,c){Wa.call(this,a);this.features=b;this.mapBrowserEvent=c}y(Hu,Wa);
function Iu(a){ji.call(this,{handleDownEvent:Ju,handleDragEvent:Ku,handleEvent:Lu,handleUpEvent:Mu});this.Hb=a.condition?a.condition:ii;this.Sa=function(a){return ei(a)&&di(a)};this.qb=a.deleteCondition?a.deleteCondition:this.Sa;this.Aa=this.c=null;this.qa=[0,0];this.D=this.T=!1;this.a=new kl;this.R=void 0!==a.pixelTolerance?a.pixelTolerance:10;this.s=this.ta=!1;this.j=[];this.S=new G({source:new P({useSpatialIndex:!1,wrapX:!!a.wrapX}),style:a.style?a.style:Nu(),updateWhileAnimating:!0,updateWhileInteracting:!0});
this.za={Point:this.ym,LineString:this.kh,LinearRing:this.kh,Polygon:this.zm,MultiPoint:this.wm,MultiLineString:this.vm,MultiPolygon:this.xm,GeometryCollection:this.um};this.A=a.features;this.A.forEach(this.xf,this);B(this.A,"add",this.sm,this);B(this.A,"remove",this.tm,this);this.Y=null}y(Iu,ji);k=Iu.prototype;k.xf=function(a){var b=a.W();b.X()in this.za&&this.za[b.X()].call(this,a,b);(b=this.v)&&Ou(this,this.qa,b);B(a,"change",this.jh,this)};
function Pu(a,b){a.D||(a.D=!0,a.b(new Hu("modifystart",a.A,b)))}function Qu(a,b){Ru(a,b);a.c&&0===a.A.dc()&&(a.S.ha().nb(a.c),a.c=null);Qa(b,"change",a.jh,a)}function Ru(a,b){var c=a.a,d=[];c.forEach(function(a){b===a.feature&&d.push(a)});for(var e=d.length-1;0<=e;--e)c.remove(d[e])}k.setMap=function(a){this.S.setMap(a);ji.prototype.setMap.call(this,a)};k.sm=function(a){this.xf(a.element)};k.jh=function(a){this.s||(a=a.target,Qu(this,a),this.xf(a))};k.tm=function(a){Qu(this,a.element)};
k.ym=function(a,b){var c=b.Z(),c={feature:a,geometry:b,na:[c,c]};this.a.Ca(b.H(),c)};k.wm=function(a,b){var c=b.Z(),d,e,f;e=0;for(f=c.length;e<f;++e)d=c[e],d={feature:a,geometry:b,depth:[e],index:e,na:[d,d]},this.a.Ca(b.H(),d)};k.kh=function(a,b){var c=b.Z(),d,e,f,g;d=0;for(e=c.length-1;d<e;++d)f=c.slice(d,d+2),g={feature:a,geometry:b,index:d,na:f},this.a.Ca(Kb(f),g)};
k.vm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,geometry:b,depth:[g],index:e,na:l},this.a.Ca(Kb(l),m)};k.zm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,geometry:b,depth:[g],index:e,na:l},this.a.Ca(Kb(l),m)};
k.xm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m,n,p,q;l=0;for(m=c.length;l<m;++l)for(n=c[l],g=0,h=n.length;g<h;++g)for(d=n[g],e=0,f=d.length-1;e<f;++e)p=d.slice(e,e+2),q={feature:a,geometry:b,depth:[g,l],index:e,na:p},this.a.Ca(Kb(p),q)};k.um=function(a,b){var c,d=b.c;for(c=0;c<d.length;++c)this.za[d[c].X()].call(this,a,d[c])};function Su(a,b){var c=a.c;c?c.W().pa(b):(c=new Ik(new C(b)),a.c=c,a.S.ha().rb(c))}function Tu(a,b){return a.index-b.index}
function Ju(a){if(!this.Hb(a))return!1;Ou(this,a.pixel,a.map);this.j.length=0;this.D=!1;var b=this.c;if(b){var c=[],b=b.W().Z(),d=Kb([b]),d=nl(this.a,d),e={};d.sort(Tu);for(var f=0,g=d.length;f<g;++f){var h=d[f],l=h.na,m=w(h.feature),n=h.depth;n&&(m+="-"+n.join("-"));e[m]||(e[m]=Array(2));if(Fb(l[0],b)&&!e[m][0])this.j.push([h,0]),e[m][0]=h;else if(Fb(l[1],b)&&!e[m][1]){if("LineString"!==h.geometry.X()&&"MultiLineString"!==h.geometry.X()||!e[m][0]||0!==e[m][0].index)this.j.push([h,1]),e[m][1]=h}else w(l)in
this.Aa&&!e[m][0]&&!e[m][1]&&c.push([h,b])}c.length&&Pu(this,a);for(a=c.length-1;0<=a;--a)this.nl.apply(this,c[a])}return!!this.c}
function Ku(a){this.T=!1;Pu(this,a);a=a.coordinate;for(var b=0,c=this.j.length;b<c;++b){for(var d=this.j[b],e=d[0],f=e.depth,g=e.geometry,h=g.Z(),l=e.na,d=d[1];a.length<g.va();)a.push(0);switch(g.X()){case "Point":h=a;l[0]=l[1]=a;break;case "MultiPoint":h[e.index]=a;l[0]=l[1]=a;break;case "LineString":h[e.index+d]=a;l[d]=a;break;case "MultiLineString":h[f[0]][e.index+d]=a;l[d]=a;break;case "Polygon":h[f[0]][e.index+d]=a;l[d]=a;break;case "MultiPolygon":h[f[1]][f[0]][e.index+d]=a,l[d]=a}e=g;this.s=
!0;e.pa(h);this.s=!1}Su(this,a)}function Mu(a){for(var b,c=this.j.length-1;0<=c;--c)b=this.j[c][0],ll(this.a,Kb(b.na),b);this.D&&(this.b(new Hu("modifyend",this.A,a)),this.D=!1);return!1}function Lu(a){if(!(a instanceof Wg))return!0;this.Y=a;var b;Sd(a.map.aa())[1]||a.type!=fh||this.C||(this.qa=a.pixel,Ou(this,a.pixel,a.map));this.c&&this.qb(a)&&(a.type==ah&&this.T?b=!0:(this.c.W(),b=this.ai()));a.type==ah&&(this.T=!1);return ki.call(this,a)&&!b}
function Ou(a,b,c){function d(a,b){return Ib(e,a.na)-Ib(e,b.na)}var e=c.Ma(b),f=c.Ma([b[0]-a.R,b[1]+a.R]),g=c.Ma([b[0]+a.R,b[1]-a.R]),f=Kb([f,g]),f=nl(a.a,f);if(0<f.length){f.sort(d);var g=f[0].na,h=Cb(e,g),l=c.Ga(h);if(Math.sqrt(Hb(b,l))<=a.R){b=c.Ga(g[0]);c=c.Ga(g[1]);b=Hb(l,b);c=Hb(l,c);a.ta=Math.sqrt(Math.min(b,c))<=a.R;a.ta&&(h=b>c?g[1]:g[0]);Su(a,h);c={};c[w(g)]=!0;b=1;for(l=f.length;b<l;++b)if(h=f[b].na,Fb(g[0],h[0])&&Fb(g[1],h[1])||Fb(g[0],h[1])&&Fb(g[1],h[0]))c[w(h)]=!0;else break;a.Aa=c;
return}}a.c&&(a.S.ha().nb(a.c),a.c=null)}
k.nl=function(a,b){for(var c=a.na,d=a.feature,e=a.geometry,f=a.depth,g=a.index,h;b.length<e.va();)b.push(0);switch(e.X()){case "MultiLineString":h=e.Z();h[f[0]].splice(g+1,0,b);break;case "Polygon":h=e.Z();h[f[0]].splice(g+1,0,b);break;case "MultiPolygon":h=e.Z();h[f[1]][f[0]].splice(g+1,0,b);break;case "LineString":h=e.Z();h.splice(g+1,0,b);break;default:return}this.s=!0;e.pa(h);this.s=!1;h=this.a;h.remove(a);Uu(this,e,g,f,1);var l={na:[c[0],b],feature:d,geometry:e,depth:f,index:g};h.Ca(Kb(l.na),
l);this.j.push([l,1]);c={na:[b,c[1]],feature:d,geometry:e,depth:f,index:g+1};h.Ca(Kb(c.na),c);this.j.push([c,0]);this.T=!0};
k.ai=function(){var a=!1;if(this.Y&&this.Y.type!=gh){var b=this.Y;Pu(this,b);var c=this.j,a={},d,e,f,g,h,l,m,n,p;for(g=c.length-1;0<=g;--g)f=c[g],m=f[0],n=w(m.feature),m.depth&&(n+="-"+m.depth.join("-")),n in a||(a[n]={}),0===f[1]?(a[n].right=m,a[n].index=m.index):1==f[1]&&(a[n].left=m,a[n].index=m.index+1);for(n in a){l=a[n].right;g=a[n].left;f=a[n].index;h=f-1;m=void 0!==g?g:l;0>h&&(h=0);c=m.geometry;d=e=c.Z();p=!1;switch(c.X()){case "MultiLineString":2<e[m.depth[0]].length&&(e[m.depth[0]].splice(f,
1),p=!0);break;case "LineString":2<e.length&&(e.splice(f,1),p=!0);break;case "MultiPolygon":d=d[m.depth[1]];case "Polygon":d=d[m.depth[0]],4<d.length&&(f==d.length-1&&(f=0),d.splice(f,1),p=!0,0===f&&(d.pop(),d.push(d[0]),h=d.length-1))}p&&(d=c,this.s=!0,d.pa(e),this.s=!1,e=[],void 0!==g&&(this.a.remove(g),e.push(g.na[0])),void 0!==l&&(this.a.remove(l),e.push(l.na[1])),void 0!==g&&void 0!==l&&(g={depth:m.depth,feature:m.feature,geometry:m.geometry,index:h,na:e},this.a.Ca(Kb(g.na),g)),Uu(this,c,f,m.depth,
-1),this.c&&(this.S.ha().nb(this.c),this.c=null))}a=!0;this.b(new Hu("modifyend",this.A,b));this.D=!1}return a};function Uu(a,b,c,d,e){ql(a.a,b.H(),function(a){a.geometry===b&&(void 0===d||void 0===a.depth||pb(a.depth,d))&&a.index>c&&(a.index+=e)})}function Nu(){var a=wj();return function(){return a.Point}};function Vu(a,b,c,d){Wa.call(this,a);this.selected=b;this.deselected=c;this.mapBrowserEvent=d}y(Vu,Wa);
function Wu(a){Vh.call(this,{handleEvent:Xu});var b=a?a:{};this.C=b.condition?b.condition:di;this.A=b.addCondition?b.addCondition:rc;this.D=b.removeCondition?b.removeCondition:rc;this.R=b.toggleCondition?b.toggleCondition:fi;this.j=b.multi?b.multi:!1;this.o=b.filter?b.filter:qc;this.c=new G({source:new P({useSpatialIndex:!1,features:b.features,wrapX:b.wrapX}),style:b.style?b.style:Yu(),updateWhileAnimating:!0,updateWhileInteracting:!0});if(b.layers)if("function"===typeof b.layers)a=function(a){return b.layers(a)};
else{var c=b.layers;a=function(a){return jb(c,a)}}else a=qc;this.s=a;this.a={};a=this.c.ha().c;B(a,"add",this.Am,this);B(a,"remove",this.Dm,this)}y(Wu,Vh);k=Wu.prototype;k.Bm=function(){return this.c.ha().c};k.Cm=function(a){a=w(a);return this.a[a]};
function Xu(a){if(!this.C(a))return!0;var b=this.A(a),c=this.D(a),d=this.R(a),e=!b&&!c&&!d,f=a.map,g=this.c.ha().c,h=[],l=[];if(e)Fa(this.a),f.kd(a.pixel,function(a,b){if(this.o(a,b)){l.push(a);var c=w(a);this.a[c]=b;return!this.j}},this,this.s),0<l.length&&1==g.dc()&&g.item(0)==l[0]?l.length=0:(0!==g.dc()&&(h=Array.prototype.concat(g.a),g.clear()),g.qf(l));else{f.kd(a.pixel,function(a,e){if(this.o(a,e)){if(!b&&!d||jb(g.a,a))(c||d)&&jb(g.a,a)&&(h.push(a),f=w(a),delete this.a[f]);else{l.push(a);var f=
w(a);this.a[f]=e}return!this.j}},this,this.s);for(e=h.length-1;0<=e;--e)g.remove(h[e]);g.qf(l)}(0<l.length||0<h.length)&&this.b(new Vu("select",l,h,a));return ci(a)}k.setMap=function(a){var b=this.v,c=this.c.ha().c;b&&c.forEach(b.wi,b);Vh.prototype.setMap.call(this,a);this.c.setMap(a);a&&c.forEach(a.ti,a)};function Yu(){var a=wj();mb(a.Polygon,a.LineString);mb(a.GeometryCollection,a.LineString);return function(b){return a[b.W().X()]}}k.Am=function(a){a=a.element;var b=this.v;b&&b.ti(a)};
k.Dm=function(a){a=a.element;var b=this.v;b&&b.wi(a)};function Zu(a){ji.call(this,{handleEvent:$u,handleDownEvent:qc,handleUpEvent:av});a=a?a:{};this.s=a.source?a.source:null;this.qa=void 0!==a.vertex?a.vertex:!0;this.T=void 0!==a.edge?a.edge:!0;this.j=a.features?a.features:null;this.ta=[];this.D={};this.R={};this.Y={};this.A={};this.S=null;this.c=void 0!==a.pixelTolerance?a.pixelTolerance:10;this.Aa=bv.bind(this);this.a=new kl;this.za={Point:this.Jm,LineString:this.nh,LinearRing:this.nh,Polygon:this.Km,MultiPoint:this.Hm,MultiLineString:this.Gm,MultiPolygon:this.Im,
GeometryCollection:this.Fm}}y(Zu,ji);k=Zu.prototype;k.rb=function(a,b){var c=void 0!==b?b:!0,d=w(a),e=a.W();if(e){var f=this.za[e.X()];f&&(this.Y[d]=e.H(Lb()),f.call(this,a,e),c&&(this.R[d]=B(e,"change",this.Kk.bind(this,a),this)))}c&&(this.D[d]=B(a,gb(a.a),this.Em,this))};k.Jj=function(a){this.rb(a)};k.Kj=function(a){this.nb(a)};k.lh=function(a){var b;a instanceof vl?b=a.feature:a instanceof ke&&(b=a.element);this.rb(b)};
k.mh=function(a){var b;a instanceof vl?b=a.feature:a instanceof ke&&(b=a.element);this.nb(b)};k.Em=function(a){a=a.target;this.nb(a,!0);this.rb(a,!0)};k.Kk=function(a){if(this.C){var b=w(a);b in this.A||(this.A[b]=a)}else this.xi(a)};k.nb=function(a,b){var c=void 0!==b?b:!0,d=w(a),e=this.Y[d];if(e){var f=this.a,g=[];ql(f,e,function(b){a===b.feature&&g.push(b)});for(e=g.length-1;0<=e;--e)f.remove(g[e]);c&&(cb(this.R[d]),delete this.R[d])}c&&(cb(this.D[d]),delete this.D[d])};
k.setMap=function(a){var b=this.v,c=this.ta,d;this.j?d=this.j:this.s&&(d=this.s.oe());b&&(c.forEach(cb),c.length=0,d.forEach(this.Kj,this));ji.prototype.setMap.call(this,a);a&&(this.j?c.push(B(this.j,"add",this.lh,this),B(this.j,"remove",this.mh,this)):this.s&&c.push(B(this.s,"addfeature",this.lh,this),B(this.s,"removefeature",this.mh,this)),d.forEach(this.Jj,this))};k.Gc=rc;k.xi=function(a){this.nb(a,!1);this.rb(a,!1)};
k.Fm=function(a,b){var c,d=b.c;for(c=0;c<d.length;++c)this.za[d[c].X()].call(this,a,d[c])};k.nh=function(a,b){var c=b.Z(),d,e,f,g;d=0;for(e=c.length-1;d<e;++d)f=c.slice(d,d+2),g={feature:a,na:f},this.a.Ca(Kb(f),g)};k.Gm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,na:l},this.a.Ca(Kb(l),m)};k.Hm=function(a,b){var c=b.Z(),d,e,f;e=0;for(f=c.length;e<f;++e)d=c[e],d={feature:a,na:[d,d]},this.a.Ca(b.H(),d)};
k.Im=function(a,b){var c=b.Z(),d,e,f,g,h,l,m,n,p,q;l=0;for(m=c.length;l<m;++l)for(n=c[l],g=0,h=n.length;g<h;++g)for(d=n[g],e=0,f=d.length-1;e<f;++e)p=d.slice(e,e+2),q={feature:a,na:p},this.a.Ca(Kb(p),q)};k.Jm=function(a,b){var c=b.Z(),c={feature:a,na:[c,c]};this.a.Ca(b.H(),c)};k.Km=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,na:l},this.a.Ca(Kb(l),m)};
function $u(a){var b,c,d=a.pixel,e=a.coordinate;b=a.map;var f=b.Ma([d[0]-this.c,d[1]+this.c]);c=b.Ma([d[0]+this.c,d[1]-this.c]);var f=Kb([f,c]),g=nl(this.a,f),h,f=!1,l=null;c=null;if(0<g.length){this.S=e;g.sort(this.Aa);g=g[0].na;if(this.qa&&!this.T){if(e=b.Ga(g[0]),h=b.Ga(g[1]),e=Hb(d,e),d=Hb(d,h),h=Math.sqrt(Math.min(e,d)),h=h<=this.c)f=!0,l=e>d?g[1]:g[0],c=b.Ga(l)}else this.T&&(l=Cb(e,g),c=b.Ga(l),Math.sqrt(Hb(d,c))<=this.c&&(f=!0,this.qa&&(e=b.Ga(g[0]),h=b.Ga(g[1]),e=Hb(c,e),d=Hb(c,h),h=Math.sqrt(Math.min(e,
d)),h=h<=this.c)))&&(l=e>d?g[1]:g[0],c=b.Ga(l));f&&(c=[Math.round(c[0]),Math.round(c[1])])}b=l;f&&(a.coordinate=b.slice(0,2),a.pixel=c);return ki.call(this,a)}function av(){var a=Ga(this.A);a.length&&(a.forEach(this.xi,this),this.A={});return!1}function bv(a,b){return Ib(this.S,a.na)-Ib(this.S,b.na)};function cv(a,b,c){Wa.call(this,a);this.features=b;this.coordinate=c}y(cv,Wa);function dv(a){ji.call(this,{handleDownEvent:ev,handleDragEvent:fv,handleMoveEvent:gv,handleUpEvent:hv});this.s=void 0;this.a=null;this.c=void 0!==a.features?a.features:null;var b;if(a.layers)if("function"===typeof a.layers)b=function(b){return a.layers(b)};else{var c=a.layers;b=function(a){return jb(c,a)}}else b=qc;this.A=b;this.j=null}y(dv,ji);
function ev(a){this.j=iv(this,a.pixel,a.map);return!this.a&&this.j?(this.a=a.coordinate,gv.call(this,a),this.b(new cv("translatestart",this.c,a.coordinate)),!0):!1}function hv(a){return this.a?(this.a=null,gv.call(this,a),this.b(new cv("translateend",this.c,a.coordinate)),!0):!1}
function fv(a){if(this.a){a=a.coordinate;var b=a[0]-this.a[0],c=a[1]-this.a[1];if(this.c)this.c.forEach(function(a){var d=a.W();d.Sc(b,c);a.Ua(d)});else if(this.j){var d=this.j.W();d.Sc(b,c);this.j.Ua(d)}this.a=a;this.b(new cv("translating",this.c,a))}}
function gv(a){var b=a.map.yc();if(a=a.map.kd(a.pixel,function(a){return a})){var c=!1;this.c&&jb(this.c.a,a)&&(c=!0);this.s=b.style.cursor;b.style.cursor=this.a?"-webkit-grabbing":c?"-webkit-grab":"pointer";b.style.cursor=this.a?c?"grab":"pointer":"grabbing"}else b.style.cursor=void 0!==this.s?this.s:"",this.s=void 0}function iv(a,b,c){var d=null;b=c.kd(b,function(a){return a},a,a.A);a.c&&jb(a.c.a,b)&&(d=b);return d};function V(a){a=a?a:{};var b=Ea({},a);delete b.gradient;delete b.radius;delete b.blur;delete b.shadow;delete b.weight;G.call(this,b);this.f=null;this.ia=void 0!==a.shadow?a.shadow:250;this.Y=void 0;this.c=null;B(this,gb("gradient"),this.Lk,this);this.ii(a.gradient?a.gradient:jv);this.di(void 0!==a.blur?a.blur:15);this.qh(void 0!==a.radius?a.radius:8);B(this,gb("blur"),this.lf,this);B(this,gb("radius"),this.lf,this);this.lf();var c=a.weight?a.weight:"weight",d;"string"===typeof c?d=function(a){return a.get(c)}:
d=c;this.l(function(a){a=d(a);a=void 0!==a?sa(a,0,1):1;var b=255*a|0,c=this.c[b];c||(c=[new rj({image:new Dh({opacity:a,src:this.Y})})],this.c[b]=c);return c}.bind(this));this.set("renderOrder",null);B(this,"render",this.dl,this)}y(V,G);var jv=["#00f","#0ff","#0f0","#ff0","#f00"];k=V.prototype;k.zg=function(){return this.get("blur")};k.Gg=function(){return this.get("gradient")};k.ph=function(){return this.get("radius")};
k.Lk=function(){for(var a=this.Gg(),b=Oe(1,256),c=b.createLinearGradient(0,0,1,256),d=1/(a.length-1),e=0,f=a.length;e<f;++e)c.addColorStop(e*d,a[e]);b.fillStyle=c;b.fillRect(0,0,1,256);this.f=b.getImageData(0,0,1,256).data};k.lf=function(){var a=this.ph(),b=this.zg(),c=a+b+1,d=2*c,d=Oe(d,d);d.shadowOffsetX=d.shadowOffsetY=this.ia;d.shadowBlur=b;d.shadowColor="#000";d.beginPath();b=c-this.ia;d.arc(b,b,a,0,2*Math.PI,!0);d.fill();this.Y=d.canvas.toDataURL();this.c=Array(256);this.u()};
k.dl=function(a){a=a.context;var b=a.canvas,b=a.getImageData(0,0,b.width,b.height),c=b.data,d,e,f;d=0;for(e=c.length;d<e;d+=4)if(f=4*c[d+3])c[d]=this.f[f],c[d+1]=this.f[f+1],c[d+2]=this.f[f+2];a.putImageData(b,0,0)};k.di=function(a){this.set("blur",a)};k.ii=function(a){this.set("gradient",a)};k.qh=function(a){this.set("radius",a)};function kv(a,b,c,d){function e(){delete pa[g];f.parentNode.removeChild(f)}var f=pa.document.createElement("script"),g="olc_"+w(b);f.async=!0;f.src=a+(-1==a.indexOf("?")?"?":"&")+(d||"callback")+"="+g;var h=pa.setTimeout(function(){e();c&&c()},1E4);pa[g]=function(a){pa.clearTimeout(h);e();b(a)};pa.document.getElementsByTagName("head")[0].appendChild(f)};function lv(a,b,c,d,e,f,g,h,l,m,n){df.call(this,e,0);this.R=void 0!==n?n:!1;this.D=g;this.C=h;this.l=null;this.c={};this.j=b;this.v=d;this.U=f?f:e;this.g=[];this.Wc=null;this.s=0;f=d.Ea(this.U);h=this.v.H();e=this.j.H();f=h?mc(f,h):f;if(0===gc(f))this.state=4;else if((h=a.H())&&(e?e=mc(e,h):e=h),d=d.$(this.U[0]),d=tk(a,c,kc(f),d),!isFinite(d)||0>=d)this.state=4;else if(this.A=new wk(a,c,f,e,d*(void 0!==m?m:.5)),0===this.A.f.length)this.state=4;else if(this.s=b.Lb(d),c=yk(this.A),e&&(a.a?(c[1]=sa(c[1],
e[1],e[3]),c[3]=sa(c[3],e[1],e[3])):c=mc(c,e)),gc(c))if(a=pf(b,c,this.s),100>(a.ea-a.ca+1)*(a.ga-a.fa+1)){for(b=a.ca;b<=a.ea;b++)for(c=a.fa;c<=a.ga;c++)(m=l(this.s,b,c,g))&&this.g.push(m);0===this.g.length&&(this.state=4)}else this.state=3;else this.state=4}y(lv,df);lv.prototype.ka=function(){1==this.state&&(this.Wc.forEach(Ka),this.Wc=null);df.prototype.ka.call(this)};
lv.prototype.$a=function(a){if(void 0!==a){var b=w(a);if(b in this.c)return this.c[b];a=Ha(this.c)?this.l:this.l.cloneNode(!1);return this.c[b]=a}return this.l};
lv.prototype.zd=function(){var a=[];this.g.forEach(function(b){b&&2==b.V()&&a.push({extent:this.j.Ea(b.ma),image:b.$a()})},this);this.g.length=0;if(0===a.length)this.state=3;else{var b=this.U[0],c=this.v.Ja(b),d=ea(c)?c:c[0],c=ea(c)?c:c[1],b=this.v.$(b),e=this.j.$(this.s),f=this.v.Ea(this.U);this.l=vk(d,c,this.D,e,this.j.H(),b,f,this.A,a,this.C,this.R);this.state=2}ef(this)};
lv.prototype.load=function(){if(0==this.state){this.state=1;ef(this);var a=0;this.Wc=[];this.g.forEach(function(b){var c=b.V();if(0==c||1==c){a++;var d;d=B(b,"change",function(){var c=b.V();if(2==c||3==c||4==c)Ka(d),a--,0===a&&(this.Wc.forEach(Ka),this.Wc=null,this.zd())},this);this.Wc.push(d)}},this);this.g.forEach(function(a){0==a.V()&&a.load()});0===a&&pa.setTimeout(this.zd.bind(this),0)}};function W(a){Jl.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction?a.tileLoadFunction:mv,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:a.tileUrlFunction,url:a.url,urls:a.urls,wrapX:a.wrapX});this.crossOrigin=void 0!==a.crossOrigin?a.crossOrigin:null;this.tileClass=void 0!==a.tileClass?a.tileClass:fu;this.i={};this.s={};this.qa=a.reprojectionErrorThreshold;
this.C=!1}y(W,Jl);k=W.prototype;k.Ah=function(){if(cf(this.a))return!0;for(var a in this.i)if(cf(this.i[a]))return!0;return!1};k.Lc=function(a,b){var c=this.pd(a);this.a.Lc(this.a==c?b:{});for(var d in this.i){var e=this.i[d];e.Lc(e==c?b:{})}};k.Ud=function(a){return this.f&&a&&!Oc(this.f,a)?0:this.gf()};k.gf=function(){return 0};k.jf=function(a){return this.f&&a&&!Oc(this.f,a)?!1:Jl.prototype.jf.call(this,a)};
k.eb=function(a){var b=this.f;return!this.tileGrid||b&&!Oc(b,a)?(b=w(a).toString(),b in this.s||(this.s[b]=vf(a)),this.s[b]):this.tileGrid};k.pd=function(a){var b=this.f;if(!b||Oc(b,a))return this.a;a=w(a).toString();a in this.i||(this.i[a]=new bf);return this.i[a]};function nv(a,b,c,d,e,f,g){b=[b,c,d];e=(c=Cf(a,b,f))?a.tileUrlFunction(c,e,f):void 0;e=new a.tileClass(b,void 0!==e?0:4,void 0!==e?e:"",a.crossOrigin,a.tileLoadFunction);e.key=g;B(e,"change",a.Bh,a);return e}
k.ac=function(a,b,c,d,e){if(this.f&&e&&!Oc(this.f,e)){var f=this.pd(e);b=[a,b,c];a=this.Eb.apply(this,b);if(Ze(f,a))return f.get(a);var g=this.f;c=this.eb(g);var h=this.eb(e),l=Cf(this,b,e);d=new lv(g,c,e,h,b,l,this.bc(d),this.gf(),function(a,b,c,d){return ov(this,a,b,c,d,g)}.bind(this),this.qa,this.C);f.set(a,d);return d}return ov(this,a,b,c,d,e)};
function ov(a,b,c,d,e,f){var g,h=a.Eb(b,c,d),l=a.cc;if(Ze(a.a,h)){if(g=a.a.get(h),g.key!=l){var m=g;g.a&&g.a.key==l?(g=g.a,2==m.V()&&(g.a=m)):(g=nv(a,b,c,d,e,f,l),2==m.V()?g.a=m:m.a&&2==m.a.V()&&(g.a=m.a,m.a=null));g.a&&(g.a.a=null);a.a.replace(h,g)}}else g=nv(a,b,c,d,e,f,l),a.a.set(h,g);return g}k.zb=function(a){if(this.C!=a){this.C=a;for(var b in this.i)this.i[b].clear();this.u()}};k.Ab=function(a,b){var c=yc(a);c&&(c=w(c).toString(),c in this.s||(this.s[c]=b))};function mv(a,b){a.$a().src=b};function pv(a){W.call(this,{cacheSize:a.cacheSize,crossOrigin:"anonymous",opaque:!0,projection:yc("EPSG:3857"),reprojectionErrorThreshold:a.reprojectionErrorThreshold,state:"loading",tileLoadFunction:a.tileLoadFunction,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.j=void 0!==a.culture?a.culture:"en-us";this.c=void 0!==a.maxZoom?a.maxZoom:-1;kv("https://dev.virtualearth.net/REST/v1/Imagery/Metadata/"+a.imagerySet+"?uriScheme=https&include=ImageryProviders&key="+a.key,this.v.bind(this),void 0,"jsonp")}
y(pv,W);var qv=new je({html:'<a class="ol-attribution-bing-tos" href="http://www.microsoft.com/maps/product/terms.html">Terms of Use</a>'});
pv.prototype.v=function(a){if(200!=a.statusCode||"OK"!=a.statusDescription||"ValidCredentials"!=a.authenticationResultCode||1!=a.resourceSets.length||1!=a.resourceSets[0].resources.length)lf(this,"error");else{var b=a.brandLogoUri;-1==b.indexOf("https")&&(b=b.replace("http","https"));var c=a.resourceSets[0].resources[0],d=-1==this.c?c.zoomMax:this.c;a=wf(this.f);var e=yf({extent:a,minZoom:c.zoomMin,maxZoom:d,tileSize:c.imageWidth==c.imageHeight?c.imageWidth:[c.imageWidth,c.imageHeight]});this.tileGrid=
e;var f=this.j;this.tileUrlFunction=Gl(c.imageUrlSubdomains.map(function(a){var b=[0,0,0],d=c.imageUrl.replace("{subdomain}",a).replace("{culture}",f);return function(a){if(a)return $e(a[0],a[1],-a[2]-1,b),d.replace("{quadkey}",af(b))}}));if(c.imageryProviders){var g=Bc(yc("EPSG:4326"),this.f);a=c.imageryProviders.map(function(a){var b=a.attribution,c={};a.coverageAreas.forEach(function(a){var b=a.zoomMin,f=Math.min(a.zoomMax,d);a=a.bbox;a=pc([a[1],a[0],a[3],a[2]],g);var h,l;for(h=b;h<=f;++h)l=h.toString(),
b=pf(e,a,h),l in c?c[l].push(b):c[l]=[b]});return new je({html:b,tileRanges:c})});a.push(qv);this.oa(a)}this.R=b;lf(this,"ready")}};function rv(a){a=a||{};var b=void 0!==a.projection?a.projection:"EPSG:3857",c=void 0!==a.tileGrid?a.tileGrid:yf({extent:wf(b),maxZoom:a.maxZoom,minZoom:a.minZoom,tileSize:a.tileSize});W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,opaque:a.opaque,projection:b,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:c,tileLoadFunction:a.tileLoadFunction,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:a.tileUrlFunction,url:a.url,urls:a.urls,
wrapX:void 0!==a.wrapX?a.wrapX:!0})}y(rv,W);function sv(a){this.v=a.account;this.A=a.map||"";this.c=a.config||{};this.j={};rv.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,maxZoom:void 0!==a.maxZoom?a.maxZoom:18,minZoom:a.minZoom,projection:a.projection,state:"loading",wrapX:a.wrapX});tv(this)}y(sv,rv);k=sv.prototype;k.Tj=function(){return this.c};k.up=function(a){Ea(this.c,a);tv(this)};k.$o=function(a){this.c=a||{};tv(this)};
function tv(a){var b=JSON.stringify(a.c);if(a.j[b])uv(a,a.j[b]);else{var c="https://"+a.v+".cartodb.com/api/v1/map";a.A&&(c+="/named/"+a.A);var d=new XMLHttpRequest;d.addEventListener("load",a.Nk.bind(a,b));d.addEventListener("error",a.Mk.bind(a));d.open("POST",c);d.setRequestHeader("Content-type","application/json");d.send(JSON.stringify(a.c))}}
k.Nk=function(a,b){var c=b.target;if(200<=c.status&&300>c.status){var d;try{d=JSON.parse(c.responseText)}catch(e){lf(this,"error");return}uv(this,d);this.j[a]=d;lf(this,"ready")}else lf(this,"error")};k.Mk=function(){lf(this,"error")};function uv(a,b){a.Va("https://"+b.cdn_url.https+"/"+a.v+"/api/v1/map/"+b.layergroupid+"/{z}/{x}/{y}.png")};function Y(a){P.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,wrapX:a.wrapX});this.C=void 0;this.ta=void 0!==a.distance?a.distance:20;this.A=[];this.ia=a.geometryFunction||function(a){return a.W()};this.v=a.source;this.v.I("change",Y.prototype.Sa,this)}y(Y,P);Y.prototype.Aa=function(){return this.v};Y.prototype.Pc=function(a,b,c){this.v.Pc(a,b,c);b!==this.C&&(this.clear(),this.C=b,vv(this),this.Jc(this.A))};
Y.prototype.Sa=function(){this.clear();vv(this);this.Jc(this.A);this.u()};function vv(a){if(void 0!==a.C){a.A.length=0;for(var b=Lb(),c=a.ta*a.C,d=a.v.oe(),e={},f=0,g=d.length;f<g;f++){var h=d[f];w(h).toString()in e||!(h=a.ia(h))||(h=h.Z(),Xb(h,b),Ob(b,c,b),h=a.v.ef(b),h=h.filter(function(a){a=w(a).toString();return a in e?!1:e[a]=!0}),a.A.push(wv(a,h)))}}}
function wv(a,b){for(var c=[0,0],d=b.length-1;0<=d;--d){var e=a.ia(b[d]);e?Bb(c,e.Z()):b.splice(d,1)}d=1/b.length;c[0]*=d;c[1]*=d;c=new Ik(new C(c));c.set("features",b);return c};function xv(a,b){var c=Object.keys(b).map(function(a){return a+"="+encodeURIComponent(b[a])}).join("&");a=a.replace(/[?&]$/,"");a=-1===a.indexOf("?")?a+"?":a+"&";return a+c};function yv(a){a=a||{};Ak.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions});this.Y=void 0!==a.crossOrigin?a.crossOrigin:null;this.i=a.url;this.j=void 0!==a.imageLoadFunction?a.imageLoadFunction:Gk;this.v=a.params||{};this.c=null;this.s=[0,0];this.T=0;this.S=void 0!==a.ratio?a.ratio:1.5}y(yv,Ak);k=yv.prototype;k.Sm=function(){return this.v};
k.Mc=function(a,b,c,d){if(void 0===this.i)return null;b=Bk(this,b);var e=this.c;if(e&&this.T==this.g&&e.$()==b&&e.f==c&&Ub(e.H(),a))return e;e={F:"image",FORMAT:"PNG32",TRANSPARENT:!0};Ea(e,this.v);a=a.slice();var f=(a[0]+a[2])/2,g=(a[1]+a[3])/2;if(1!=this.S){var h=this.S*ic(a)/2,l=this.S*jc(a)/2;a[0]=f-h;a[1]=g-l;a[2]=f+h;a[3]=g+l}var h=b/c,l=Math.ceil(ic(a)/h),m=Math.ceil(jc(a)/h);a[0]=f-h*l/2;a[2]=f+h*l/2;a[1]=g-h*m/2;a[3]=g+h*m/2;this.s[0]=l;this.s[1]=m;f=a;g=this.s;d=d.cb.split(":").pop();e.SIZE=
g[0]+","+g[1];e.BBOX=f.join(",");e.BBOXSR=d;e.IMAGESR=d;e.DPI=90*c;d=this.i.replace(/MapServer\/?$/,"MapServer/export").replace(/ImageServer\/?$/,"ImageServer/exportImage");e=xv(d,e);this.c=new eu(a,b,c,this.l,e,this.Y,this.j);this.T=this.g;B(this.c,"change",this.o,this);return this.c};k.Rm=function(){return this.j};k.Tm=function(){return this.i};k.Um=function(a){this.c=null;this.j=a;this.u()};k.Vm=function(a){a!=this.i&&(this.i=a,this.c=null,this.u())};k.Wm=function(a){Ea(this.v,a);this.c=null;this.u()};function zv(a){Ak.call(this,{projection:a.projection,resolutions:a.resolutions});this.Y=void 0!==a.crossOrigin?a.crossOrigin:null;this.s=void 0!==a.displayDpi?a.displayDpi:96;this.j=a.params||{};this.T=a.url;this.c=void 0!==a.imageLoadFunction?a.imageLoadFunction:Gk;this.ia=void 0!==a.hidpi?a.hidpi:!0;this.ta=void 0!==a.metersPerUnit?a.metersPerUnit:1;this.v=void 0!==a.ratio?a.ratio:1;this.Aa=void 0!==a.useOverlay?a.useOverlay:!1;this.i=null;this.S=0}y(zv,Ak);k=zv.prototype;k.Ym=function(){return this.j};
k.Mc=function(a,b,c){b=Bk(this,b);c=this.ia?c:1;var d=this.i;if(d&&this.S==this.g&&d.$()==b&&d.f==c&&Ub(d.H(),a))return d;1!=this.v&&(a=a.slice(),oc(a,this.v));var e=[ic(a)/b*c,jc(a)/b*c];if(void 0!==this.T){var d=this.T,f=kc(a),g=this.ta,h=ic(a),l=jc(a),m=e[0],n=e[1],p=.0254/this.s,e={OPERATION:this.Aa?"GETDYNAMICMAPOVERLAYIMAGE":"GETMAPIMAGE",VERSION:"2.0.0",LOCALE:"en",CLIENTAGENT:"ol.source.ImageMapGuide source",CLIP:"1",SETDISPLAYDPI:this.s,SETDISPLAYWIDTH:Math.round(e[0]),SETDISPLAYHEIGHT:Math.round(e[1]),
SETVIEWSCALE:n*h>m*l?h*g/(m*p):l*g/(n*p),SETVIEWCENTERX:f[0],SETVIEWCENTERY:f[1]};Ea(e,this.j);d=xv(d,e);d=new eu(a,b,c,this.l,d,this.Y,this.c);B(d,"change",this.o,this)}else d=null;this.i=d;this.S=this.g;return d};k.Xm=function(){return this.c};k.$m=function(a){Ea(this.j,a);this.u()};k.Zm=function(a){this.i=null;this.c=a;this.u()};function Av(a){var b=a.imageExtent,c=void 0!==a.crossOrigin?a.crossOrigin:null,d=void 0!==a.imageLoadFunction?a.imageLoadFunction:Gk;Ak.call(this,{attributions:a.attributions,logo:a.logo,projection:yc(a.projection)});this.c=new eu(b,void 0,1,this.l,a.url,c,d);this.i=a.imageSize?a.imageSize:null;B(this.c,"change",this.o,this)}y(Av,Ak);Av.prototype.Mc=function(a){return nc(a,this.c.H())?this.c:null};
Av.prototype.o=function(a){if(2==this.c.V()){var b=this.c.H(),c=this.c.a(),d,e;this.i?(d=this.i[0],e=this.i[1]):(d=c.width,e=c.height);b=Math.ceil(ic(b)/(jc(b)/e));if(b!=d){var b=Oe(b,e),f=b.canvas;b.drawImage(c,0,0,d,e,0,0,f.width,f.height);this.c.g=f}}Ak.prototype.o.call(this,a)};function Bv(a){a=a||{};Ak.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions});this.ta=void 0!==a.crossOrigin?a.crossOrigin:null;this.j=a.url;this.S=void 0!==a.imageLoadFunction?a.imageLoadFunction:Gk;this.i=a.params||{};this.v=!0;Cv(this);this.ia=a.serverType;this.Aa=void 0!==a.hidpi?a.hidpi:!0;this.c=null;this.T=[0,0];this.Y=0;this.s=void 0!==a.ratio?a.ratio:1.5}y(Bv,Ak);var Dv=[101,101];k=Bv.prototype;
k.fn=function(a,b,c,d){if(void 0!==this.j){var e=lc(a,b,0,Dv),f={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",FORMAT:"image/png",TRANSPARENT:!0,QUERY_LAYERS:this.i.LAYERS};Ea(f,this.i,d);d=Math.floor((e[3]-a[1])/b);f[this.v?"I":"X"]=Math.floor((a[0]-e[0])/b);f[this.v?"J":"Y"]=d;return Ev(this,e,Dv,1,yc(c),f)}};k.hn=function(){return this.i};
k.Mc=function(a,b,c,d){if(void 0===this.j)return null;b=Bk(this,b);1==c||this.Aa&&void 0!==this.ia||(c=1);a=a.slice();var e=(a[0]+a[2])/2,f=(a[1]+a[3])/2,g=b/c,h=ic(a)/g,g=jc(a)/g,l=this.c;if(l&&this.Y==this.g&&l.$()==b&&l.f==c&&Ub(l.H(),a))return l;if(1!=this.s){var l=this.s*ic(a)/2,m=this.s*jc(a)/2;a[0]=e-l;a[1]=f-m;a[2]=e+l;a[3]=f+m}e={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetMap",FORMAT:"image/png",TRANSPARENT:!0};Ea(e,this.i);this.T[0]=Math.ceil(h*this.s);this.T[1]=Math.ceil(g*this.s);d=Ev(this,
a,this.T,c,d,e);this.c=new eu(a,b,c,this.l,d,this.ta,this.S);this.Y=this.g;B(this.c,"change",this.o,this);return this.c};k.gn=function(){return this.S};
function Ev(a,b,c,d,e,f){f[a.v?"CRS":"SRS"]=e.cb;"STYLES"in a.i||(f.STYLES="");if(1!=d)switch(a.ia){case "geoserver":d=90*d+.5|0;f.FORMAT_OPTIONS="FORMAT_OPTIONS"in f?f.FORMAT_OPTIONS+(";dpi:"+d):"dpi:"+d;break;case "mapserver":f.MAP_RESOLUTION=90*d;break;case "carmentaserver":case "qgis":f.DPI=90*d}f.WIDTH=c[0];f.HEIGHT=c[1];c=e.b;var g;a.v&&"ne"==c.substr(0,2)?g=[b[1],b[0],b[3],b[2]]:g=b;f.BBOX=g.join(",");return xv(a.j,f)}k.jn=function(){return this.j};k.kn=function(a){this.c=null;this.S=a;this.u()};
k.ln=function(a){a!=this.j&&(this.j=a,this.c=null,this.u())};k.mn=function(a){Ea(this.i,a);Cv(this);this.c=null;this.u()};function Cv(a){a.v=0<=Ab(a.i.VERSION||"1.3.0")};function Fv(a){a=a||{};var b;void 0!==a.attributions?b=a.attributions:b=[Gv];rv.call(this,{attributions:b,cacheSize:a.cacheSize,crossOrigin:void 0!==a.crossOrigin?a.crossOrigin:"anonymous",opaque:void 0!==a.opaque?a.opaque:!0,maxZoom:void 0!==a.maxZoom?a.maxZoom:19,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",wrapX:a.wrapX})}y(Fv,rv);var Gv=new je({html:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.'});(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Sp=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b,f){a=a("./processor");f.$i=a},{"./processor":2}],2:[function(a,b){function f(a){var b=!0;try{new ImageData(10,10)}catch(d){b=!1}return function(d){var e=d.buffers,f=d.meta,g=d.width,h=d.height,l=e.length,m=e[0].byteLength;if(d.imageOps){m=Array(l);for(d=0;d<l;++d){var z=m,F=d,N;N=new Uint8ClampedArray(e[d]);var K=g,X=h;N=b?new ImageData(N,K,
X):{data:N,width:K,height:X};z[F]=N}g=a(m,f).data}else{g=new Uint8ClampedArray(m);h=Array(l);z=Array(l);for(d=0;d<l;++d)h[d]=new Uint8ClampedArray(e[d]),z[d]=[0,0,0,0];for(e=0;e<m;e+=4){for(d=0;d<l;++d)F=h[d],z[d][0]=F[e],z[d][1]=F[e+1],z[d][2]=F[e+2],z[d][3]=F[e+3];d=a(z,f);g[e]=d[0];g[e+1]=d[1];g[e+2]=d[2];g[e+3]=d[3]}}return g.buffer}}function g(a,b){var d=Object.keys(a.lib||{}).map(function(b){return"var "+b+" = "+a.lib[b].toString()+";"}).concat(["var __minion__ = ("+f.toString()+")(",a.operation.toString(),
");",'self.addEventListener("message", function(event) {',"  var buffer = __minion__(event.data);","  self.postMessage({buffer: buffer, meta: event.data.meta}, [buffer]);","});"]),d=URL.createObjectURL(new Blob(d,{type:"text/javascript"})),d=new Worker(d);d.addEventListener("message",b);return d}function h(a,b){var d=f(a.operation);return{postMessage:function(a){setTimeout(function(){b({data:{buffer:d(a),meta:a.meta}})},0)}}}function l(a){this.Re=!!a.ll;var b;0===a.threads?b=0:this.Re?b=1:b=a.threads||
1;var d=[];if(b)for(var e=0;e<b;++e)d[e]=g(a,this.ig.bind(this,e));else d[0]=h(a,this.ig.bind(this,0));this.Ld=d;this.$c=[];this.oj=a.uo||Infinity;this.Jd=0;this.Ic={};this.Se=null}var m=a("./util").Fl;l.prototype.so=function(a,b,d){this.lj({Ac:a,Xg:b,qg:d});this.fg()};l.prototype.lj=function(a){for(this.$c.push(a);this.$c.length>this.oj;)this.$c.shift().qg(null,null)};l.prototype.fg=function(){if(0===this.Jd&&0<this.$c.length){var a=this.Se=this.$c.shift(),b=a.Ac[0].width,d=a.Ac[0].height,e=a.Ac.map(function(a){return a.data.buffer}),
f=this.Ld.length;this.Jd=f;if(1===f)this.Ld[0].postMessage({buffers:e,meta:a.Xg,imageOps:this.Re,width:b,height:d},e);else for(var g=4*Math.ceil(a.Ac[0].data.length/4/f),h=0;h<f;++h){for(var l=h*g,m=[],z=0,F=e.length;z<F;++z)m.push(e[h].slice(l,l+g));this.Ld[h].postMessage({buffers:m,meta:a.Xg,imageOps:this.Re,width:b,height:d},m)}}};l.prototype.ig=function(a,b){this.Pp||(this.Ic[a]=b.data,--this.Jd,0===this.Jd&&this.pj())};l.prototype.pj=function(){var a=this.Se,b=this.Ld.length,d,e;if(1===b)d=new Uint8ClampedArray(this.Ic[0].buffer),
e=this.Ic[0].meta;else{var f=a.Ac[0].data.length;d=new Uint8ClampedArray(f);e=Array(f);for(var f=4*Math.ceil(f/4/b),g=0;g<b;++g){var h=g*f;d.set(new Uint8ClampedArray(this.Ic[g].buffer),h);e[g]=this.Ic[g].meta}}this.Se=null;this.Ic={};a.qg(null,m(d,a.Ac[0].width,a.Ac[0].height),e);this.fg()};b.ja=l},{"./util":3}],3:[function(a,b,f){var g=!0;try{new ImageData(10,10)}catch(l){g=!1}var h=document.createElement("canvas").getContext("2d");f.Fl=function(a,b,d){if(g)return new ImageData(a,b,d);b=h.createImageData(b,
d);b.data.set(a);return b}},{}]},{},[1])(1)});jl=b.ja})();function Hv(a){this.S=null;this.Aa=void 0!==a.operationType?a.operationType:"pixel";this.Sa=void 0!==a.threads?a.threads:1;this.c=Iv(a.sources);for(var b=0,c=this.c.length;b<c;++b)B(this.c[b],"change",this.u,this);this.i=Oe();this.ia=new Rh(function(){return 1},this.u.bind(this));for(var b=Jv(this.c),c={},d=0,e=b.length;d<e;++d)c[w(b[d].layer)]=b[d];this.j=this.s=null;this.Y={animate:!1,attributions:{},coordinateToPixelMatrix:Xc(),extent:null,focus:null,index:0,layerStates:c,layerStatesArray:b,logos:{},
pixelRatio:1,pixelToCoordinateMatrix:Xc(),postRenderFunctions:[],size:[0,0],skippedFeatureUids:{},tileQueue:this.ia,time:Date.now(),usedTiles:{},viewState:{rotation:0},viewHints:[],wantedTiles:{}};Ak.call(this,{});void 0!==a.operation&&this.v(a.operation,a.lib)}y(Hv,Ak);Hv.prototype.v=function(a,b){this.S=new jl.$i({operation:a,ll:"image"===this.Aa,uo:1,lib:b,threads:this.Sa});this.u()};function Kv(a,b,c){var d=a.s;return!d||a.g!==d.Xo||c!==d.resolution||!$b(b,d.extent)}
Hv.prototype.A=function(a,b,c,d){c=!0;for(var e,f=0,g=this.c.length;f<g;++f)if(e=this.c[f].a.ha(),"ready"!==e.V()){c=!1;break}if(!c)return null;a=a.slice();if(!Kv(this,a,b))return this.j;c=this.i.canvas;e=Math.round(ic(a)/b);f=Math.round(jc(a)/b);if(e!==c.width||f!==c.height)c.width=e,c.height=f;e=Ea({},this.Y);e.viewState=Ea({},e.viewState);var f=kc(a),g=Math.round(ic(a)/b),h=Math.round(jc(a)/b);e.extent=a;e.focus=kc(a);e.size[0]=g;e.size[1]=h;g=e.viewState;g.center=f;g.projection=d;g.resolution=
b;this.j=d=new nk(a,b,1,this.l,c,this.T.bind(this,e));this.s={extent:a,resolution:b,Xo:this.g};return d};
Hv.prototype.T=function(a,b){for(var c=this.c.length,d=Array(c),e=0;e<c;++e){var f;f=this.c[e];var g=a,h=a.layerStatesArray[e];if(f.l(g,h)){var l=g.size[0],m=g.size[1];if(Lv){var n=Lv.canvas;n.width!==l||n.height!==m?Lv=Oe(l,m):Lv.clearRect(0,0,l,m)}else Lv=Oe(l,m);f.i(g,h,Lv);f=Lv.getImageData(0,0,l,m)}else f=null;if(f)d[e]=f;else return}c={};this.b(new Mv(Nv,a,c));this.S.so(d,c,this.ta.bind(this,a,b));Sh(a.tileQueue,16,16)};
Hv.prototype.ta=function(a,b,c,d,e){c?b(c):d&&(this.b(new Mv(Ov,a,e)),Kv(this,a.extent,a.viewState.resolution/a.pixelRatio)||this.i.putImageData(d,0,0),b(null))};var Lv=null;function Jv(a){return a.map(function(a){return jh(a.a)})}function Iv(a){for(var b=a.length,c=Array(b),d=0;d<b;++d){var e=d,f=a[d],g=null;f instanceof zf?(f=new dj({source:f}),g=new Bl(f)):f instanceof Ak&&(f=new cj({source:f}),g=new Al(f));c[e]=g}return c}
function Mv(a,b,c){Wa.call(this,a);this.extent=b.extent;this.resolution=b.viewState.resolution/b.pixelRatio;this.data=c}y(Mv,Wa);var Nv="beforeoperations",Ov="afteroperations";var Pv={terrain:{tb:"jpg",opaque:!0},"terrain-background":{tb:"jpg",opaque:!0},"terrain-labels":{tb:"png",opaque:!1},"terrain-lines":{tb:"png",opaque:!1},"toner-background":{tb:"png",opaque:!0},toner:{tb:"png",opaque:!0},"toner-hybrid":{tb:"png",opaque:!1},"toner-labels":{tb:"png",opaque:!1},"toner-lines":{tb:"png",opaque:!1},"toner-lite":{tb:"png",opaque:!0},watercolor:{tb:"jpg",opaque:!0}},Qv={terrain:{minZoom:4,maxZoom:18},toner:{minZoom:0,maxZoom:20},watercolor:{minZoom:1,maxZoom:16}};
function Rv(a){var b=a.layer.indexOf("-"),b=-1==b?a.layer:a.layer.slice(0,b),b=Qv[b],c=Pv[a.layer];rv.call(this,{attributions:Sv,cacheSize:a.cacheSize,crossOrigin:"anonymous",maxZoom:void 0!=a.maxZoom?a.maxZoom:b.maxZoom,minZoom:void 0!=a.minZoom?a.minZoom:b.minZoom,opaque:c.opaque,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://stamen-tiles-{a-d}.a.ssl.fastly.net/"+a.layer+"/{z}/{x}/{y}."+c.tb})}y(Rv,rv);
var Sv=[new je({html:'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.'}),Gv];function Tv(a){a=a||{};W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.c=a.params||{};this.j=Lb()}y(Tv,W);Tv.prototype.v=function(){return this.c};Tv.prototype.bc=function(a){return a};
Tv.prototype.vc=function(a,b,c){var d=this.tileGrid;d||(d=this.eb(c));if(!(d.b.length<=a[0])){var e=d.Ea(a,this.j),f=hf(d.Ja(a[0]),this.o);1!=b&&(f=gf(f,b,this.o));d={F:"image",FORMAT:"PNG32",TRANSPARENT:!0};Ea(d,this.c);var g=this.urls;g?(c=c.cb.split(":").pop(),d.SIZE=f[0]+","+f[1],d.BBOX=e.join(","),d.BBOXSR=c,d.IMAGESR=c,d.DPI=Math.round(d.DPI?d.DPI*b:90*b),a=(1==g.length?g[0]:g[xa((a[1]<<a[0])+a[2],g.length)]).replace(/MapServer\/?$/,"MapServer/export").replace(/ImageServer\/?$/,"ImageServer/exportImage"),
a=xv(a,d)):a=void 0;return a}};Tv.prototype.A=function(a){Ea(this.c,a);this.u()};function Uv(a,b,c){df.call(this,a,2);this.l=b;this.c=c;this.g={}}y(Uv,df);Uv.prototype.$a=function(a){a=void 0!==a?w(a):-1;if(a in this.g)return this.g[a];var b=this.l,c=Oe(b[0],b[1]);c.strokeStyle="black";c.strokeRect(.5,.5,b[0]+.5,b[1]+.5);c.fillStyle="black";c.textAlign="center";c.textBaseline="middle";c.font="24px sans-serif";c.fillText(this.c,b[0]/2,b[1]/2);return this.g[a]=c.canvas};
function Vv(a){zf.call(this,{opaque:!1,projection:a.projection,tileGrid:a.tileGrid,wrapX:void 0!==a.wrapX?a.wrapX:!0})}y(Vv,zf);Vv.prototype.ac=function(a,b,c){var d=this.Eb(a,b,c);if(Ze(this.a,d))return this.a.get(d);var e=hf(this.tileGrid.Ja(a));a=[a,b,c];b=(b=Cf(this,a))?Cf(this,b).toString():"";e=new Uv(a,e,b);this.a.set(d,e);return e};function Wv(a){this.c=null;W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,projection:yc("EPSG:3857"),reprojectionErrorThreshold:a.reprojectionErrorThreshold,state:"loading",tileLoadFunction:a.tileLoadFunction,wrapX:void 0!==a.wrapX?a.wrapX:!0});if(a.jsonp)kv(a.url,this.yh.bind(this),this.me.bind(this));else{var b=new XMLHttpRequest;b.addEventListener("load",this.pn.bind(this));b.addEventListener("error",this.nn.bind(this));b.open("GET",a.url);b.send()}}
y(Wv,W);k=Wv.prototype;k.pn=function(a){a=a.target;if(200<=a.status&&300>a.status){var b;try{b=JSON.parse(a.responseText)}catch(c){this.me();return}this.yh(b)}else this.me()};k.nn=function(){this.me()};k.Ak=function(){return this.c};
k.yh=function(a){var b=yc("EPSG:4326"),c=this.f,d;void 0!==a.bounds&&(d=pc(a.bounds,Bc(b,c)));var e=a.minzoom||0,f=a.maxzoom||22;this.tileGrid=c=yf({extent:wf(c),maxZoom:f,minZoom:e});this.tileUrlFunction=Fl(a.tiles,c);if(void 0!==a.attribution&&!this.l){b=void 0!==d?d:b.H();d={};for(var g;e<=f;++e)g=e.toString(),d[g]=[pf(c,b,e)];this.oa([new je({html:a.attribution,tileRanges:d})])}this.c=a;lf(this,"ready")};k.me=function(){lf(this,"error")};function Xv(a){zf.call(this,{projection:yc("EPSG:3857"),state:"loading"});this.s=void 0!==a.preemptive?a.preemptive:!0;this.j=Hl;this.i=void 0;this.c=a.jsonp||!1;if(a.url)if(this.c)kv(a.url,this.Bf.bind(this),this.ne.bind(this));else{var b=new XMLHttpRequest;b.addEventListener("load",this.tn.bind(this));b.addEventListener("error",this.sn.bind(this));b.open("GET",a.url);b.send()}else a.tileJSON&&this.Bf(a.tileJSON)}y(Xv,zf);k=Xv.prototype;
k.tn=function(a){a=a.target;if(200<=a.status&&300>a.status){var b;try{b=JSON.parse(a.responseText)}catch(c){this.ne();return}this.Bf(b)}else this.ne()};k.sn=function(){this.ne()};k.xk=function(){return this.i};k.Ij=function(a,b,c,d,e){this.tileGrid?(b=this.tileGrid.Zd(a,b),Yv(this.ac(b[0],b[1],b[2],1,this.f),a,c,d,e)):!0===e?Tf(function(){c.call(d,null)}):c.call(d,null)};k.ne=function(){lf(this,"error")};
k.Bf=function(a){var b=yc("EPSG:4326"),c=this.f,d;void 0!==a.bounds&&(d=pc(a.bounds,Bc(b,c)));var e=a.minzoom||0,f=a.maxzoom||22;this.tileGrid=c=yf({extent:wf(c),maxZoom:f,minZoom:e});this.i=a.template;var g=a.grids;if(g){this.j=Fl(g,c);if(void 0!==a.attribution){b=void 0!==d?d:b.H();for(d={};e<=f;++e)g=e.toString(),d[g]=[pf(c,b,e)];this.oa([new je({html:a.attribution,tileRanges:d})])}lf(this,"ready")}else lf(this,"error")};
k.ac=function(a,b,c,d,e){var f=this.Eb(a,b,c);if(Ze(this.a,f))return this.a.get(f);a=[a,b,c];b=Cf(this,a,e);d=this.j(b,d,e);d=new Zv(a,void 0!==d?0:4,void 0!==d?d:"",this.tileGrid.Ea(a),this.s,this.c);this.a.set(f,d);return d};k.Yf=function(a,b,c){a=this.Eb(a,b,c);Ze(this.a,a)&&this.a.get(a)};function Zv(a,b,c,d,e,f){df.call(this,a,b);this.s=c;this.g=d;this.U=e;this.c=this.j=this.l=null;this.v=f}y(Zv,df);k=Zv.prototype;k.$a=function(){return null};
k.getData=function(a){if(!this.l||!this.j)return null;var b=this.l[Math.floor((1-(a[1]-this.g[1])/(this.g[3]-this.g[1]))*this.l.length)];if("string"!==typeof b)return null;b=b.charCodeAt(Math.floor((a[0]-this.g[0])/(this.g[2]-this.g[0])*b.length));93<=b&&b--;35<=b&&b--;b-=32;a=null;b in this.j&&(b=this.j[b],this.c&&b in this.c?a=this.c[b]:a=b);return a};
function Yv(a,b,c,d,e){0==a.state&&!0===e?(Pa(a,"change",function(){c.call(d,this.getData(b))},a),$v(a)):!0===e?Tf(function(){c.call(d,this.getData(b))},a):c.call(d,a.getData(b))}k.ib=function(){return this.s};k.ae=function(){this.state=3;ef(this)};k.zh=function(a){this.l=a.grid;this.j=a.keys;this.c=a.data;this.state=4;ef(this)};
function $v(a){if(0==a.state)if(a.state=1,a.v)kv(a.s,a.zh.bind(a),a.ae.bind(a));else{var b=new XMLHttpRequest;b.addEventListener("load",a.rn.bind(a));b.addEventListener("error",a.qn.bind(a));b.open("GET",a.s);b.send()}}k.rn=function(a){a=a.target;if(200<=a.status&&300>a.status){var b;try{b=JSON.parse(a.responseText)}catch(c){this.ae();return}this.zh(b)}else this.ae()};k.qn=function(){this.ae()};k.load=function(){this.U&&$v(this)};function aw(a){a=a||{};var b=a.params||{};W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,opaque:!("TRANSPARENT"in b?b.TRANSPARENT:1),projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.v=void 0!==a.gutter?a.gutter:0;this.c=b;this.j=!0;this.A=a.serverType;this.T=void 0!==a.hidpi?a.hidpi:!0;this.S="";
bw(this);this.Y=Lb();cw(this);Bf(this,dw(this))}y(aw,W);k=aw.prototype;
k.vn=function(a,b,c,d){c=yc(c);var e=this.tileGrid;e||(e=this.eb(c));b=e.Zd(a,b);if(!(e.b.length<=b[0])){var f=e.$(b[0]),g=e.Ea(b,this.Y),e=hf(e.Ja(b[0]),this.o),h=this.v;0!==h&&(e=ff(e,h,this.o),g=Ob(g,f*h,g));h={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",FORMAT:"image/png",TRANSPARENT:!0,QUERY_LAYERS:this.c.LAYERS};Ea(h,this.c,d);d=Math.floor((g[3]-a[1])/f);h[this.j?"I":"X"]=Math.floor((a[0]-g[0])/f);h[this.j?"J":"Y"]=d;return ew(this,b,e,g,1,c,h)}};k.gf=function(){return this.v};
k.Eb=function(a,b,c){return this.S+W.prototype.Eb.call(this,a,b,c)};k.wn=function(){return this.c};
function ew(a,b,c,d,e,f,g){var h=a.urls;if(h){g.WIDTH=c[0];g.HEIGHT=c[1];g[a.j?"CRS":"SRS"]=f.cb;"STYLES"in a.c||(g.STYLES="");if(1!=e)switch(a.A){case "geoserver":c=90*e+.5|0;g.FORMAT_OPTIONS="FORMAT_OPTIONS"in g?g.FORMAT_OPTIONS+(";dpi:"+c):"dpi:"+c;break;case "mapserver":g.MAP_RESOLUTION=90*e;break;case "carmentaserver":case "qgis":g.DPI=90*e}f=f.b;a.j&&"ne"==f.substr(0,2)&&(a=d[0],d[0]=d[1],d[1]=a,a=d[2],d[2]=d[3],d[3]=a);g.BBOX=d.join(",");return xv(1==h.length?h[0]:h[xa((b[1]<<b[0])+b[2],h.length)],
g)}}k.bc=function(a){return this.T&&void 0!==this.A?a:1};function bw(a){var b=0,c=[];if(a.urls){var d,e;d=0;for(e=a.urls.length;d<e;++d)c[b++]=a.urls[d]}a.S=c.join("#")}function dw(a){var b=0,c=[],d;for(d in a.c)c[b++]=d+"-"+a.c[d];return c.join("/")}
k.vc=function(a,b,c){var d=this.tileGrid;d||(d=this.eb(c));if(!(d.b.length<=a[0])){1==b||this.T&&void 0!==this.A||(b=1);var e=d.$(a[0]),f=d.Ea(a,this.Y),d=hf(d.Ja(a[0]),this.o),g=this.v;0!==g&&(d=ff(d,g,this.o),f=Ob(f,e*g,f));1!=b&&(d=gf(d,b,this.o));e={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetMap",FORMAT:"image/png",TRANSPARENT:!0};Ea(e,this.c);return ew(this,a,d,f,b,c,e)}};k.xn=function(a){Ea(this.c,a);bw(this);cw(this);Bf(this,dw(this))};function cw(a){a.j=0<=Ab(a.c.VERSION||"1.3.0")};function fw(a){this.l=a.matrixIds;mf.call(this,{extent:a.extent,origin:a.origin,origins:a.origins,resolutions:a.resolutions,tileSize:a.tileSize,tileSizes:a.tileSizes,sizes:a.sizes})}y(fw,mf);fw.prototype.j=function(){return this.l};
function gw(a,b){var c=[],d=[],e=[],f=[],g=[],h;h=yc(a.SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3"));var l=h.$b(),m="ne"==h.b.substr(0,2);a.TileMatrix.sort(function(a,b){return b.ScaleDenominator-a.ScaleDenominator});a.TileMatrix.forEach(function(a){d.push(a.Identifier);var b=2.8E-4*a.ScaleDenominator/l,h=a.TileWidth,r=a.TileHeight;m?e.push([a.TopLeftCorner[1],a.TopLeftCorner[0]]):e.push(a.TopLeftCorner);c.push(b);f.push(h==r?h:[h,r]);g.push([a.MatrixWidth,-a.MatrixHeight])});
return new fw({extent:b,origins:e,resolutions:c,matrixIds:d,tileSizes:f,sizes:g})};function Z(a){function b(a){a="KVP"==d?xv(a,f):a.replace(/\{(\w+?)\}/g,function(a,b){return b.toLowerCase()in f?f[b.toLowerCase()]:a});return function(b){if(b){var c={TileMatrix:e.l[b[0]],TileCol:b[1],TileRow:-b[2]-1};Ea(c,g);b=a;return b="KVP"==d?xv(b,c):b.replace(/\{(\w+?)\}/g,function(a,b){return c[b]})}}}this.T=void 0!==a.version?a.version:"1.0.0";this.v=void 0!==a.format?a.format:"image/jpeg";this.c=void 0!==a.dimensions?a.dimensions:{};this.A=a.layer;this.j=a.matrixSet;this.S=a.style;var c=
a.urls;void 0===c&&void 0!==a.url&&(c=Il(a.url));var d=this.Y=void 0!==a.requestEncoding?a.requestEncoding:"KVP",e=a.tileGrid,f={layer:this.A,style:this.S,tilematrixset:this.j};"KVP"==d&&Ea(f,{Service:"WMTS",Request:"GetTile",Version:this.T,Format:this.v});var g=this.c,h=c&&0<c.length?Gl(c.map(b)):Hl;W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileClass:a.tileClass,
tileGrid:e,tileLoadFunction:a.tileLoadFunction,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:h,urls:c,wrapX:void 0!==a.wrapX?a.wrapX:!1});Bf(this,hw(this))}y(Z,W);k=Z.prototype;k.Vj=function(){return this.c};k.yn=function(){return this.v};k.zn=function(){return this.A};k.hk=function(){return this.j};k.vk=function(){return this.Y};k.An=function(){return this.S};k.Ck=function(){return this.T};function hw(a){var b=0,c=[],d;for(d in a.c)c[b++]=d+"-"+a.c[d];return c.join("/")}
k.vp=function(a){Ea(this.c,a);Bf(this,hw(this))};function iw(a){a=a||{};var b=a.size,c=b[0],d=b[1],e=[],f=256;switch(void 0!==a.tierSizeCalculation?a.tierSizeCalculation:"default"){case "default":for(;c>f||d>f;)e.push([Math.ceil(c/f),Math.ceil(d/f)]),f+=f;break;case "truncated":for(;c>f||d>f;)e.push([Math.ceil(c/f),Math.ceil(d/f)]),c>>=1,d>>=1}e.push([1,1]);e.reverse();for(var f=[1],g=[0],d=1,c=e.length;d<c;d++)f.push(1<<d),g.push(e[d-1][0]*e[d-1][1]+g[d-1]);f.reverse();var b=[0,-b[1],b[0],0],b=new mf({extent:b,origin:fc(b),resolutions:f}),h=a.url;
W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileClass:jw,tileGrid:b,tileUrlFunction:function(a){if(a){var b=a[0],c=a[1];a=-a[2]-1;return h+"TileGroup"+((c+a*e[b][0]+g[b])/256|0)+"/"+b+"-"+c+"-"+a+".jpg"}}})}y(iw,W);function jw(a,b,c,d,e){fu.call(this,a,b,c,d,e);this.l={}}y(jw,fu);
jw.prototype.$a=function(a){var b=void 0!==a?w(a).toString():"";if(b in this.l)return this.l[b];a=fu.prototype.$a.call(this,a);if(2==this.state){if(256==a.width&&256==a.height)return this.l[b]=a;var c=Oe(256,256);c.drawImage(a,0,0);return this.l[b]=c.canvas}return a};function kw(a){a=a||{};this.a=void 0!==a.initialSize?a.initialSize:256;this.g=void 0!==a.maxSize?a.maxSize:void 0!==la?la:2048;this.b=void 0!==a.space?a.space:1;this.c=[new lw(this.a,this.b)];this.f=this.a;this.i=[new lw(this.f,this.b)]}kw.prototype.add=function(a,b,c,d,e,f){if(b+this.b>this.g||c+this.b>this.g)return null;d=mw(this,!1,a,b,c,d,f);if(!d)return null;a=mw(this,!0,a,b,c,void 0!==e?e:na,f);return{offsetX:d.offsetX,offsetY:d.offsetY,image:d.image,Sg:a.image}};
function mw(a,b,c,d,e,f,g){var h=b?a.i:a.c,l,m,n;m=0;for(n=h.length;m<n;++m){l=h[m];if(l=l.add(c,d,e,f,g))return l;l||m!==n-1||(b?(l=Math.min(2*a.f,a.g),a.f=l):(l=Math.min(2*a.a,a.g),a.a=l),l=new lw(l,a.b),h.push(l),++n)}}function lw(a,b){this.b=b;this.a=[{x:0,y:0,width:a,height:a}];this.f={};this.g=Oe(a,a);this.c=this.g.canvas}lw.prototype.get=function(a){return this.f[a]||null};
lw.prototype.add=function(a,b,c,d,e){var f,g,h;g=0;for(h=this.a.length;g<h;++g)if(f=this.a[g],f.width>=b+this.b&&f.height>=c+this.b)return h={offsetX:f.x+this.b,offsetY:f.y+this.b,image:this.c},this.f[a]=h,d.call(e,this.g,f.x+this.b,f.y+this.b),a=g,b+=this.b,d=c+this.b,f.width-b>f.height-d?(c={x:f.x+b,y:f.y,width:f.width-b,height:f.height},b={x:f.x,y:f.y+d,width:b,height:f.height-d},nw(this,a,c,b)):(c={x:f.x+b,y:f.y,width:f.width-b,height:d},b={x:f.x,y:f.y+d,width:f.width,height:f.height-d},nw(this,
a,c,b)),h;return null};function nw(a,b,c,d){b=[b,1];0<c.width&&0<c.height&&b.push(c);0<d.width&&0<d.height&&b.push(d);a.a.splice.apply(a.a,b)};function ow(a){this.A=this.s=this.f=null;this.o=void 0!==a.fill?a.fill:null;this.ya=[0,0];this.b=a.points;this.g=void 0!==a.radius?a.radius:a.radius1;this.c=void 0!==a.radius2?a.radius2:this.g;this.l=void 0!==a.angle?a.angle:0;this.a=void 0!==a.stroke?a.stroke:null;this.R=this.Ba=this.D=null;var b=a.atlasManager,c="",d="",e=0,f=null,g,h=0;this.a&&(g=ve(this.a.b),h=this.a.a,void 0===h&&(h=1),f=this.a.g,hg||(f=null),d=this.a.c,void 0===d&&(d="round"),c=this.a.f,void 0===c&&(c="round"),e=this.a.i,void 0===
e&&(e=10));var l=2*(this.g+h)+1,c={strokeStyle:g,Bd:h,size:l,lineCap:c,lineDash:f,lineJoin:d,miterLimit:e};if(void 0===b){var m=Oe(l,l);this.s=m.canvas;b=l=this.s.width;this.Ih(c,m,0,0);this.o?this.A=this.s:(m=Oe(c.size,c.size),this.A=m.canvas,this.Hh(c,m,0,0))}else l=Math.round(l),(d=!this.o)&&(m=this.Hh.bind(this,c)),e=this.a?pj(this.a):"-",f=this.o?jj(this.o):"-",this.f&&e==this.f[1]&&f==this.f[2]&&this.g==this.f[3]&&this.c==this.f[4]&&this.l==this.f[5]&&this.b==this.f[6]||(this.f=["r"+e+f+(void 0!==
this.g?this.g.toString():"-")+(void 0!==this.c?this.c.toString():"-")+(void 0!==this.l?this.l.toString():"-")+(void 0!==this.b?this.b.toString():"-"),e,f,this.g,this.c,this.l,this.b]),m=b.add(this.f[0],l,l,this.Ih.bind(this,c),m),this.s=m.image,this.ya=[m.offsetX,m.offsetY],b=m.image.width,this.A=d?m.Sg:this.s;this.D=[l/2,l/2];this.Ba=[l,l];this.R=[b,b];Ch.call(this,{opacity:1,rotateWithView:void 0!==a.rotateWithView?a.rotateWithView:!1,rotation:void 0!==a.rotation?a.rotation:0,scale:1,snapToPixel:void 0!==
a.snapToPixel?a.snapToPixel:!0})}y(ow,Ch);k=ow.prototype;k.Yb=function(){return this.D};k.Fn=function(){return this.l};k.Gn=function(){return this.o};k.pe=function(){return this.A};k.jc=function(){return this.s};k.ld=function(){return this.R};k.td=function(){return 2};k.Ia=function(){return this.ya};k.Hn=function(){return this.b};k.In=function(){return this.g};k.uk=function(){return this.c};k.Fb=function(){return this.Ba};k.Jn=function(){return this.a};k.pf=na;k.load=na;k.Xf=na;
k.Ih=function(a,b,c,d){var e;b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();this.c!==this.g&&(this.b*=2);for(c=0;c<=this.b;c++)d=2*c*Math.PI/this.b-Math.PI/2+this.l,e=0===c%2?this.g:this.c,b.lineTo(a.size/2+e*Math.cos(d),a.size/2+e*Math.sin(d));this.o&&(b.fillStyle=xe(this.o.b),b.fill());this.a&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Bd,a.lineDash&&b.setLineDash(a.lineDash),b.lineCap=a.lineCap,b.lineJoin=a.lineJoin,b.miterLimit=a.miterLimit,b.stroke());b.closePath()};
k.Hh=function(a,b,c,d){b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();this.c!==this.g&&(this.b*=2);var e;for(c=0;c<=this.b;c++)e=2*c*Math.PI/this.b-Math.PI/2+this.l,d=0===c%2?this.g:this.c,b.lineTo(a.size/2+d*Math.cos(e),a.size/2+d*Math.sin(e));b.fillStyle=ej;b.fill();this.a&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Bd,a.lineDash&&b.setLineDash(a.lineDash),b.stroke());b.closePath()};t("ol.animation.bounce",function(a){var b=a.resolution,c=a.start?a.start:Date.now(),d=void 0!==a.duration?a.duration:1E3,e=a.easing?a.easing:be;return function(a,g){if(g.time<c)return g.animate=!0,g.viewHints[0]+=1,!0;if(g.time<c+d){var h=e((g.time-c)/d),l=b-g.viewState.resolution;g.animate=!0;g.viewState.resolution+=h*l;g.viewHints[0]+=1;return!0}return!1}},OPENLAYERS);t("ol.animation.pan",ce,OPENLAYERS);t("ol.animation.rotate",de,OPENLAYERS);t("ol.animation.zoom",ee,OPENLAYERS);
t("ol.Attribution",je,OPENLAYERS);je.prototype.getHTML=je.prototype.g;ke.prototype.element=ke.prototype.element;t("ol.Collection",le,OPENLAYERS);le.prototype.clear=le.prototype.clear;le.prototype.extend=le.prototype.qf;le.prototype.forEach=le.prototype.forEach;le.prototype.getArray=le.prototype.Gl;le.prototype.item=le.prototype.item;le.prototype.getLength=le.prototype.dc;le.prototype.insertAt=le.prototype.ee;le.prototype.pop=le.prototype.pop;le.prototype.push=le.prototype.push;
le.prototype.remove=le.prototype.remove;le.prototype.removeAt=le.prototype.Rf;le.prototype.setAt=le.prototype.Zo;t("ol.colorlike.asColorLike",xe,OPENLAYERS);t("ol.coordinate.add",Bb,OPENLAYERS);t("ol.coordinate.createStringXY",function(a){return function(b){return Jb(b,a)}},OPENLAYERS);t("ol.coordinate.format",Eb,OPENLAYERS);t("ol.coordinate.rotate",Gb,OPENLAYERS);t("ol.coordinate.toStringHDMS",function(a,b){return a?Db(a[1],"NS",b)+" "+Db(a[0],"EW",b):""},OPENLAYERS);
t("ol.coordinate.toStringXY",Jb,OPENLAYERS);t("ol.DeviceOrientation",qn,OPENLAYERS);qn.prototype.getAlpha=qn.prototype.Oj;qn.prototype.getBeta=qn.prototype.Rj;qn.prototype.getGamma=qn.prototype.Yj;qn.prototype.getHeading=qn.prototype.Hl;qn.prototype.getTracking=qn.prototype.$g;qn.prototype.setTracking=qn.prototype.rf;t("ol.easing.easeIn",Yd,OPENLAYERS);t("ol.easing.easeOut",Zd,OPENLAYERS);t("ol.easing.inAndOut",$d,OPENLAYERS);t("ol.easing.linear",ae,OPENLAYERS);t("ol.easing.upAndDown",be,OPENLAYERS);
t("ol.extent.boundingExtent",Kb,OPENLAYERS);t("ol.extent.buffer",Ob,OPENLAYERS);t("ol.extent.containsCoordinate",Sb,OPENLAYERS);t("ol.extent.containsExtent",Ub,OPENLAYERS);t("ol.extent.containsXY",Tb,OPENLAYERS);t("ol.extent.createEmpty",Lb,OPENLAYERS);t("ol.extent.equals",$b,OPENLAYERS);t("ol.extent.extend",ac,OPENLAYERS);t("ol.extent.getBottomLeft",cc,OPENLAYERS);t("ol.extent.getBottomRight",dc,OPENLAYERS);t("ol.extent.getCenter",kc,OPENLAYERS);t("ol.extent.getHeight",jc,OPENLAYERS);
t("ol.extent.getIntersection",mc,OPENLAYERS);t("ol.extent.getSize",function(a){return[a[2]-a[0],a[3]-a[1]]},OPENLAYERS);t("ol.extent.getTopLeft",fc,OPENLAYERS);t("ol.extent.getTopRight",ec,OPENLAYERS);t("ol.extent.getWidth",ic,OPENLAYERS);t("ol.extent.intersects",nc,OPENLAYERS);t("ol.extent.isEmpty",hc,OPENLAYERS);t("ol.extent.applyTransform",pc,OPENLAYERS);t("ol.Feature",Ik,OPENLAYERS);Ik.prototype.clone=Ik.prototype.clone;Ik.prototype.getGeometry=Ik.prototype.W;Ik.prototype.getId=Ik.prototype.Xa;
Ik.prototype.getGeometryName=Ik.prototype.$j;Ik.prototype.getStyle=Ik.prototype.Jl;Ik.prototype.getStyleFunction=Ik.prototype.ec;Ik.prototype.setGeometry=Ik.prototype.Ua;Ik.prototype.setStyle=Ik.prototype.sf;Ik.prototype.setId=Ik.prototype.mc;Ik.prototype.setGeometryName=Ik.prototype.Ec;t("ol.featureloader.tile",dl,OPENLAYERS);t("ol.featureloader.xhr",el,OPENLAYERS);t("ol.Geolocation",Ut,OPENLAYERS);Ut.prototype.getAccuracy=Ut.prototype.Mj;Ut.prototype.getAccuracyGeometry=Ut.prototype.Nj;
Ut.prototype.getAltitude=Ut.prototype.Pj;Ut.prototype.getAltitudeAccuracy=Ut.prototype.Qj;Ut.prototype.getHeading=Ut.prototype.Ll;Ut.prototype.getPosition=Ut.prototype.Ml;Ut.prototype.getProjection=Ut.prototype.ah;Ut.prototype.getSpeed=Ut.prototype.wk;Ut.prototype.getTracking=Ut.prototype.bh;Ut.prototype.getTrackingOptions=Ut.prototype.Mg;Ut.prototype.setProjection=Ut.prototype.dh;Ut.prototype.setTracking=Ut.prototype.ge;Ut.prototype.setTrackingOptions=Ut.prototype.si;t("ol.Graticule",$t,OPENLAYERS);
$t.prototype.getMap=$t.prototype.Pl;$t.prototype.getMeridians=$t.prototype.ik;$t.prototype.getParallels=$t.prototype.qk;$t.prototype.setMap=$t.prototype.setMap;t("ol.has.DEVICE_PIXEL_RATIO",gg,OPENLAYERS);t("ol.has.CANVAS",ig,OPENLAYERS);t("ol.has.DEVICE_ORIENTATION",jg,OPENLAYERS);t("ol.has.GEOLOCATION",kg,OPENLAYERS);t("ol.has.TOUCH",lg,OPENLAYERS);t("ol.has.WEBGL",bg,OPENLAYERS);eu.prototype.getImage=eu.prototype.a;eu.prototype.load=eu.prototype.load;fu.prototype.getImage=fu.prototype.$a;
fu.prototype.load=fu.prototype.load;t("ol.Kinetic",Th,OPENLAYERS);t("ol.loadingstrategy.all",fl,OPENLAYERS);t("ol.loadingstrategy.bbox",function(a){return[a]},OPENLAYERS);t("ol.loadingstrategy.tile",function(a){return function(b,c){var d=a.Lb(c),e=pf(a,b,d),f=[],d=[d,0,0];for(d[1]=e.ca;d[1]<=e.ea;++d[1])for(d[2]=e.fa;d[2]<=e.ga;++d[2])f.push(a.Ea(d));return f}},OPENLAYERS);t("ol.Map",Q,OPENLAYERS);Q.prototype.addControl=Q.prototype.uj;Q.prototype.addInteraction=Q.prototype.vj;
Q.prototype.addLayer=Q.prototype.kg;Q.prototype.addOverlay=Q.prototype.lg;Q.prototype.beforeRender=Q.prototype.Wa;Q.prototype.forEachFeatureAtPixel=Q.prototype.kd;Q.prototype.forEachLayerAtPixel=Q.prototype.Tl;Q.prototype.hasFeatureAtPixel=Q.prototype.kl;Q.prototype.getEventCoordinate=Q.prototype.Wj;Q.prototype.getEventPixel=Q.prototype.Td;Q.prototype.getTarget=Q.prototype.tf;Q.prototype.getTargetElement=Q.prototype.yc;Q.prototype.getCoordinateFromPixel=Q.prototype.Ma;Q.prototype.getControls=Q.prototype.Uj;
Q.prototype.getOverlays=Q.prototype.nk;Q.prototype.getOverlayById=Q.prototype.mk;Q.prototype.getInteractions=Q.prototype.ak;Q.prototype.getLayerGroup=Q.prototype.xc;Q.prototype.getLayers=Q.prototype.eh;Q.prototype.getPixelFromCoordinate=Q.prototype.Ga;Q.prototype.getSize=Q.prototype.Za;Q.prototype.getView=Q.prototype.aa;Q.prototype.getViewport=Q.prototype.Dk;Q.prototype.renderSync=Q.prototype.Vo;Q.prototype.render=Q.prototype.render;Q.prototype.removeControl=Q.prototype.Oo;
Q.prototype.removeInteraction=Q.prototype.Po;Q.prototype.removeLayer=Q.prototype.Ro;Q.prototype.removeOverlay=Q.prototype.So;Q.prototype.setLayerGroup=Q.prototype.ji;Q.prototype.setSize=Q.prototype.Wf;Q.prototype.setTarget=Q.prototype.fh;Q.prototype.setView=Q.prototype.kp;Q.prototype.updateSize=Q.prototype.Xc;Vg.prototype.originalEvent=Vg.prototype.originalEvent;Vg.prototype.pixel=Vg.prototype.pixel;Vg.prototype.coordinate=Vg.prototype.coordinate;Vg.prototype.dragging=Vg.prototype.dragging;
We.prototype.map=We.prototype.map;We.prototype.frameState=We.prototype.frameState;db.prototype.key=db.prototype.key;db.prototype.oldValue=db.prototype.oldValue;t("ol.Object",eb,OPENLAYERS);eb.prototype.get=eb.prototype.get;eb.prototype.getKeys=eb.prototype.N;eb.prototype.getProperties=eb.prototype.O;eb.prototype.set=eb.prototype.set;eb.prototype.setProperties=eb.prototype.G;eb.prototype.unset=eb.prototype.P;t("ol.Observable",bb,OPENLAYERS);t("ol.Observable.unByKey",cb,OPENLAYERS);
bb.prototype.changed=bb.prototype.u;bb.prototype.dispatchEvent=bb.prototype.b;bb.prototype.getRevision=bb.prototype.K;bb.prototype.on=bb.prototype.I;bb.prototype.once=bb.prototype.L;bb.prototype.un=bb.prototype.J;bb.prototype.unByKey=bb.prototype.M;t("ol.inherits",y,OPENLAYERS);t("ol.Overlay",Xm,OPENLAYERS);Xm.prototype.getElement=Xm.prototype.Sd;Xm.prototype.getId=Xm.prototype.Xa;Xm.prototype.getMap=Xm.prototype.he;Xm.prototype.getOffset=Xm.prototype.Kg;Xm.prototype.getPosition=Xm.prototype.gh;
Xm.prototype.getPositioning=Xm.prototype.Lg;Xm.prototype.setElement=Xm.prototype.fi;Xm.prototype.setMap=Xm.prototype.setMap;Xm.prototype.setOffset=Xm.prototype.li;Xm.prototype.setPosition=Xm.prototype.uf;Xm.prototype.setPositioning=Xm.prototype.oi;t("ol.render.toContext",function(a,b){var c=a.canvas,d=b?b:{},e=d.pixelRatio||gg;if(d=d.size)c.width=d[0]*e,c.height=d[1]*e,c.style.width=d[0]+"px",c.style.height=d[1]+"px";c=[0,0,c.width,c.height];d=qh(Xc(),0,0,e,e,0,0,0);return new yj(a,e,c,d,0)},OPENLAYERS);
t("ol.size.toSize",hf,OPENLAYERS);df.prototype.getTileCoord=df.prototype.i;df.prototype.load=df.prototype.load;Kk.prototype.getFormat=Kk.prototype.Ul;Kk.prototype.setFeatures=Kk.prototype.gi;Kk.prototype.setProjection=Kk.prototype.vf;Kk.prototype.setLoader=Kk.prototype.ki;t("ol.View",Rd,OPENLAYERS);Rd.prototype.constrainCenter=Rd.prototype.Pd;Rd.prototype.constrainResolution=Rd.prototype.constrainResolution;Rd.prototype.constrainRotation=Rd.prototype.constrainRotation;Rd.prototype.getCenter=Rd.prototype.ab;
Rd.prototype.calculateExtent=Rd.prototype.Kc;Rd.prototype.getMaxResolution=Rd.prototype.Vl;Rd.prototype.getMinResolution=Rd.prototype.Wl;Rd.prototype.getProjection=Rd.prototype.Xl;Rd.prototype.getResolution=Rd.prototype.$;Rd.prototype.getResolutions=Rd.prototype.Yl;Rd.prototype.getRotation=Rd.prototype.La;Rd.prototype.getZoom=Rd.prototype.Fk;Rd.prototype.fit=Rd.prototype.cf;Rd.prototype.centerOn=Rd.prototype.Ej;Rd.prototype.rotate=Rd.prototype.rotate;Rd.prototype.setCenter=Rd.prototype.mb;
Rd.prototype.setResolution=Rd.prototype.Ub;Rd.prototype.setRotation=Rd.prototype.ie;Rd.prototype.setZoom=Rd.prototype.np;t("ol.xml.getAllTextContent",Nk,OPENLAYERS);t("ol.xml.parse",Rk,OPENLAYERS);gm.prototype.getGL=gm.prototype.$n;gm.prototype.useProgram=gm.prototype.we;t("ol.tilegrid.TileGrid",mf,OPENLAYERS);mf.prototype.forEachTileCoord=mf.prototype.yg;mf.prototype.getMaxZoom=mf.prototype.Ig;mf.prototype.getMinZoom=mf.prototype.Jg;mf.prototype.getOrigin=mf.prototype.Ia;
mf.prototype.getResolution=mf.prototype.$;mf.prototype.getResolutions=mf.prototype.Kh;mf.prototype.getTileCoordExtent=mf.prototype.Ea;mf.prototype.getTileCoordForCoordAndResolution=mf.prototype.Zd;mf.prototype.getTileCoordForCoordAndZ=mf.prototype.qd;mf.prototype.getTileSize=mf.prototype.Ja;mf.prototype.getZForResolution=mf.prototype.Lb;t("ol.tilegrid.createXYZ",yf,OPENLAYERS);t("ol.tilegrid.WMTS",fw,OPENLAYERS);fw.prototype.getMatrixIds=fw.prototype.j;
t("ol.tilegrid.WMTS.createFromCapabilitiesMatrixSet",gw,OPENLAYERS);t("ol.style.AtlasManager",kw,OPENLAYERS);t("ol.style.Circle",qj,OPENLAYERS);qj.prototype.getFill=qj.prototype.Bn;qj.prototype.getImage=qj.prototype.jc;qj.prototype.getRadius=qj.prototype.Cn;qj.prototype.getStroke=qj.prototype.Dn;t("ol.style.Fill",ij,OPENLAYERS);ij.prototype.getColor=ij.prototype.g;ij.prototype.setColor=ij.prototype.f;t("ol.style.Icon",Dh,OPENLAYERS);Dh.prototype.getAnchor=Dh.prototype.Yb;Dh.prototype.getImage=Dh.prototype.jc;
Dh.prototype.getOrigin=Dh.prototype.Ia;Dh.prototype.getSrc=Dh.prototype.En;Dh.prototype.getSize=Dh.prototype.Fb;Dh.prototype.load=Dh.prototype.load;t("ol.style.Image",Ch,OPENLAYERS);Ch.prototype.getOpacity=Ch.prototype.qe;Ch.prototype.getRotateWithView=Ch.prototype.Xd;Ch.prototype.getRotation=Ch.prototype.re;Ch.prototype.getScale=Ch.prototype.se;Ch.prototype.getSnapToPixel=Ch.prototype.Yd;Ch.prototype.setOpacity=Ch.prototype.te;Ch.prototype.setRotation=Ch.prototype.ue;Ch.prototype.setScale=Ch.prototype.ve;
t("ol.style.RegularShape",ow,OPENLAYERS);ow.prototype.getAnchor=ow.prototype.Yb;ow.prototype.getAngle=ow.prototype.Fn;ow.prototype.getFill=ow.prototype.Gn;ow.prototype.getImage=ow.prototype.jc;ow.prototype.getOrigin=ow.prototype.Ia;ow.prototype.getPoints=ow.prototype.Hn;ow.prototype.getRadius=ow.prototype.In;ow.prototype.getRadius2=ow.prototype.uk;ow.prototype.getSize=ow.prototype.Fb;ow.prototype.getStroke=ow.prototype.Jn;t("ol.style.Stroke",oj,OPENLAYERS);oj.prototype.getColor=oj.prototype.Kn;
oj.prototype.getLineCap=oj.prototype.dk;oj.prototype.getLineDash=oj.prototype.Ln;oj.prototype.getLineJoin=oj.prototype.ek;oj.prototype.getMiterLimit=oj.prototype.jk;oj.prototype.getWidth=oj.prototype.Mn;oj.prototype.setColor=oj.prototype.Nn;oj.prototype.setLineCap=oj.prototype.fp;oj.prototype.setLineDash=oj.prototype.On;oj.prototype.setLineJoin=oj.prototype.gp;oj.prototype.setMiterLimit=oj.prototype.hp;oj.prototype.setWidth=oj.prototype.lp;t("ol.style.Style",rj,OPENLAYERS);
rj.prototype.getGeometry=rj.prototype.W;rj.prototype.getGeometryFunction=rj.prototype.Zj;rj.prototype.getFill=rj.prototype.Pn;rj.prototype.getImage=rj.prototype.Qn;rj.prototype.getStroke=rj.prototype.Rn;rj.prototype.getText=rj.prototype.Ha;rj.prototype.getZIndex=rj.prototype.Sn;rj.prototype.setGeometry=rj.prototype.Jh;rj.prototype.setZIndex=rj.prototype.Tn;t("ol.style.Text",Gp,OPENLAYERS);Gp.prototype.getFont=Gp.prototype.Xj;Gp.prototype.getOffsetX=Gp.prototype.kk;Gp.prototype.getOffsetY=Gp.prototype.lk;
Gp.prototype.getFill=Gp.prototype.Un;Gp.prototype.getRotation=Gp.prototype.Vn;Gp.prototype.getScale=Gp.prototype.Wn;Gp.prototype.getStroke=Gp.prototype.Xn;Gp.prototype.getText=Gp.prototype.Ha;Gp.prototype.getTextAlign=Gp.prototype.yk;Gp.prototype.getTextBaseline=Gp.prototype.zk;Gp.prototype.setFont=Gp.prototype.bp;Gp.prototype.setOffsetX=Gp.prototype.mi;Gp.prototype.setOffsetY=Gp.prototype.ni;Gp.prototype.setFill=Gp.prototype.ap;Gp.prototype.setRotation=Gp.prototype.Yn;Gp.prototype.setScale=Gp.prototype.Zn;
Gp.prototype.setStroke=Gp.prototype.ip;Gp.prototype.setText=Gp.prototype.pi;Gp.prototype.setTextAlign=Gp.prototype.ri;Gp.prototype.setTextBaseline=Gp.prototype.jp;t("ol.Sphere",sc,OPENLAYERS);sc.prototype.geodesicArea=sc.prototype.a;sc.prototype.haversineDistance=sc.prototype.b;t("ol.source.BingMaps",pv,OPENLAYERS);t("ol.source.BingMaps.TOS_ATTRIBUTION",qv,OPENLAYERS);t("ol.source.CartoDB",sv,OPENLAYERS);sv.prototype.getConfig=sv.prototype.Tj;sv.prototype.updateConfig=sv.prototype.up;
sv.prototype.setConfig=sv.prototype.$o;t("ol.source.Cluster",Y,OPENLAYERS);Y.prototype.getSource=Y.prototype.Aa;t("ol.source.ImageArcGISRest",yv,OPENLAYERS);yv.prototype.getParams=yv.prototype.Sm;yv.prototype.getImageLoadFunction=yv.prototype.Rm;yv.prototype.getUrl=yv.prototype.Tm;yv.prototype.setImageLoadFunction=yv.prototype.Um;yv.prototype.setUrl=yv.prototype.Vm;yv.prototype.updateParams=yv.prototype.Wm;t("ol.source.ImageCanvas",Hk,OPENLAYERS);t("ol.source.ImageMapGuide",zv,OPENLAYERS);
zv.prototype.getParams=zv.prototype.Ym;zv.prototype.getImageLoadFunction=zv.prototype.Xm;zv.prototype.updateParams=zv.prototype.$m;zv.prototype.setImageLoadFunction=zv.prototype.Zm;t("ol.source.Image",Ak,OPENLAYERS);Ck.prototype.image=Ck.prototype.image;t("ol.source.ImageStatic",Av,OPENLAYERS);t("ol.source.ImageVector",yl,OPENLAYERS);yl.prototype.getSource=yl.prototype.an;yl.prototype.getStyle=yl.prototype.bn;yl.prototype.getStyleFunction=yl.prototype.cn;yl.prototype.setStyle=yl.prototype.xh;
t("ol.source.ImageWMS",Bv,OPENLAYERS);Bv.prototype.getGetFeatureInfoUrl=Bv.prototype.fn;Bv.prototype.getParams=Bv.prototype.hn;Bv.prototype.getImageLoadFunction=Bv.prototype.gn;Bv.prototype.getUrl=Bv.prototype.jn;Bv.prototype.setImageLoadFunction=Bv.prototype.kn;Bv.prototype.setUrl=Bv.prototype.ln;Bv.prototype.updateParams=Bv.prototype.mn;t("ol.source.OSM",Fv,OPENLAYERS);t("ol.source.OSM.ATTRIBUTION",Gv,OPENLAYERS);t("ol.source.Raster",Hv,OPENLAYERS);Hv.prototype.setOperation=Hv.prototype.v;
Mv.prototype.extent=Mv.prototype.extent;Mv.prototype.resolution=Mv.prototype.resolution;Mv.prototype.data=Mv.prototype.data;t("ol.source.Source",jf,OPENLAYERS);jf.prototype.getAttributions=jf.prototype.wa;jf.prototype.getLogo=jf.prototype.ua;jf.prototype.getProjection=jf.prototype.xa;jf.prototype.getState=jf.prototype.V;jf.prototype.refresh=jf.prototype.sa;jf.prototype.setAttributions=jf.prototype.oa;t("ol.source.Stamen",Rv,OPENLAYERS);t("ol.source.TileArcGISRest",Tv,OPENLAYERS);
Tv.prototype.getParams=Tv.prototype.v;Tv.prototype.updateParams=Tv.prototype.A;t("ol.source.TileDebug",Vv,OPENLAYERS);t("ol.source.TileImage",W,OPENLAYERS);W.prototype.setRenderReprojectionEdges=W.prototype.zb;W.prototype.setTileGridForProjection=W.prototype.Ab;t("ol.source.TileJSON",Wv,OPENLAYERS);Wv.prototype.getTileJSON=Wv.prototype.Ak;t("ol.source.Tile",zf,OPENLAYERS);zf.prototype.getTileGrid=zf.prototype.Na;Df.prototype.tile=Df.prototype.tile;t("ol.source.TileUTFGrid",Xv,OPENLAYERS);
Xv.prototype.getTemplate=Xv.prototype.xk;Xv.prototype.forDataAtCoordinateAndResolution=Xv.prototype.Ij;t("ol.source.TileWMS",aw,OPENLAYERS);aw.prototype.getGetFeatureInfoUrl=aw.prototype.vn;aw.prototype.getParams=aw.prototype.wn;aw.prototype.updateParams=aw.prototype.xn;Jl.prototype.getTileLoadFunction=Jl.prototype.fb;Jl.prototype.getTileUrlFunction=Jl.prototype.gb;Jl.prototype.getUrls=Jl.prototype.hb;Jl.prototype.setTileLoadFunction=Jl.prototype.kb;Jl.prototype.setTileUrlFunction=Jl.prototype.Qa;
Jl.prototype.setUrl=Jl.prototype.Va;Jl.prototype.setUrls=Jl.prototype.bb;t("ol.source.Vector",P,OPENLAYERS);P.prototype.addFeature=P.prototype.rb;P.prototype.addFeatures=P.prototype.Jc;P.prototype.clear=P.prototype.clear;P.prototype.forEachFeature=P.prototype.wg;P.prototype.forEachFeatureInExtent=P.prototype.ub;P.prototype.forEachFeatureIntersectingExtent=P.prototype.xg;P.prototype.getFeaturesCollection=P.prototype.Fg;P.prototype.getFeatures=P.prototype.oe;P.prototype.getFeaturesAtCoordinate=P.prototype.Eg;
P.prototype.getFeaturesInExtent=P.prototype.ef;P.prototype.getClosestFeatureToCoordinate=P.prototype.Ag;P.prototype.getExtent=P.prototype.H;P.prototype.getFeatureById=P.prototype.Dg;P.prototype.getFormat=P.prototype.Ch;P.prototype.getUrl=P.prototype.Dh;P.prototype.removeFeature=P.prototype.nb;vl.prototype.feature=vl.prototype.feature;t("ol.source.VectorTile",Kl,OPENLAYERS);t("ol.source.WMTS",Z,OPENLAYERS);Z.prototype.getDimensions=Z.prototype.Vj;Z.prototype.getFormat=Z.prototype.yn;
Z.prototype.getLayer=Z.prototype.zn;Z.prototype.getMatrixSet=Z.prototype.hk;Z.prototype.getRequestEncoding=Z.prototype.vk;Z.prototype.getStyle=Z.prototype.An;Z.prototype.getVersion=Z.prototype.Ck;Z.prototype.updateDimensions=Z.prototype.vp;
t("ol.source.WMTS.optionsFromCapabilities",function(a,b){var c=ob(a.Contents.Layer,function(a){return a.Identifier==b.layer}),d=a.Contents.TileMatrixSet,e,f;e=1<c.TileMatrixSetLink.length?"projection"in b?sb(c.TileMatrixSetLink,function(a){return ob(d,function(b){return b.Identifier==a.TileMatrixSet}).SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3")==b.projection}):sb(c.TileMatrixSetLink,function(a){return a.TileMatrixSet==b.matrixSet}):0;0>e&&(e=0);f=c.TileMatrixSetLink[e].TileMatrixSet;
var g=c.Format[0];"format"in b&&(g=b.format);e=sb(c.Style,function(a){return"style"in b?a.Title==b.style:a.isDefault});0>e&&(e=0);e=c.Style[e].Identifier;var h={};"Dimension"in c&&c.Dimension.forEach(function(a){var b=a.Identifier,c=a.Default;void 0===c&&(c=a.Value[0]);h[b]=c});var l=ob(a.Contents.TileMatrixSet,function(a){return a.Identifier==f}),m;m="projection"in b?yc(b.projection):yc(l.SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3"));var n=c.WGS84BoundingBox,p,q;void 0!==n&&
(q=yc("EPSG:4326").H(),q=n[0]==q[0]&&n[2]==q[2],p=Sc(n,"EPSG:4326",m),(n=m.H())&&(Ub(n,p)||(p=void 0)));var l=gw(l,p),r=[];p=b.requestEncoding;p=void 0!==p?p:"";if("OperationsMetadata"in a&&"GetTile"in a.OperationsMetadata)for(var n=a.OperationsMetadata.GetTile.DCP.HTTP.Get,u=0,x=n.length;u<x;++u){var v=ob(n[u].Constraint,function(a){return"GetEncoding"==a.name}).AllowedValues.Value;""===p&&(p=v[0]);if("KVP"===p)jb(v,"KVP")&&r.push(n[u].href);else break}0===r.length&&(p="REST",c.ResourceURL.forEach(function(a){"tile"===
a.resourceType&&(g=a.format,r.push(a.template))}));return{urls:r,layer:b.layer,matrixSet:f,format:g,projection:m,requestEncoding:p,tileGrid:l,style:e,dimensions:h,wrapX:q}},OPENLAYERS);t("ol.source.XYZ",rv,OPENLAYERS);t("ol.source.Zoomify",iw,OPENLAYERS);lh.prototype.vectorContext=lh.prototype.vectorContext;lh.prototype.frameState=lh.prototype.frameState;lh.prototype.context=lh.prototype.context;lh.prototype.glContext=lh.prototype.glContext;hk.prototype.get=hk.prototype.get;
hk.prototype.getExtent=hk.prototype.H;hk.prototype.getGeometry=hk.prototype.W;hk.prototype.getProperties=hk.prototype.Nm;hk.prototype.getType=hk.prototype.X;t("ol.render.VectorContext",kh,OPENLAYERS);Cm.prototype.setStyle=Cm.prototype.sd;Cm.prototype.drawGeometry=Cm.prototype.sc;Cm.prototype.drawFeature=Cm.prototype.Ye;yj.prototype.drawCircle=yj.prototype.Rd;yj.prototype.setStyle=yj.prototype.sd;yj.prototype.drawGeometry=yj.prototype.sc;yj.prototype.drawFeature=yj.prototype.Ye;
t("ol.proj.common.add",bj,OPENLAYERS);t("ol.proj.METERS_PER_UNIT",uc,OPENLAYERS);t("ol.proj.Projection",vc,OPENLAYERS);vc.prototype.getCode=vc.prototype.Sj;vc.prototype.getExtent=vc.prototype.H;vc.prototype.getUnits=vc.prototype.wb;vc.prototype.getMetersPerUnit=vc.prototype.$b;vc.prototype.getWorldExtent=vc.prototype.Ek;vc.prototype.isGlobal=vc.prototype.pl;vc.prototype.setGlobal=vc.prototype.ep;vc.prototype.setExtent=vc.prototype.Mm;vc.prototype.setWorldExtent=vc.prototype.mp;
vc.prototype.setGetPointResolution=vc.prototype.cp;vc.prototype.getPointResolution=vc.prototype.getPointResolution;t("ol.proj.setProj4",function(a){xc=a},OPENLAYERS);t("ol.proj.addEquivalentProjections",zc,OPENLAYERS);t("ol.proj.addProjection",Lc,OPENLAYERS);t("ol.proj.addCoordinateTransforms",Ac,OPENLAYERS);t("ol.proj.fromLonLat",function(a,b){return Rc(a,"EPSG:4326",void 0!==b?b:"EPSG:3857")},OPENLAYERS);t("ol.proj.toLonLat",function(a,b){return Rc(a,void 0!==b?b:"EPSG:3857","EPSG:4326")},OPENLAYERS);
t("ol.proj.get",yc,OPENLAYERS);t("ol.proj.equivalent",Oc,OPENLAYERS);t("ol.proj.getTransform",Pc,OPENLAYERS);t("ol.proj.transform",Rc,OPENLAYERS);t("ol.proj.transformExtent",Sc,OPENLAYERS);t("ol.layer.Heatmap",V,OPENLAYERS);V.prototype.getBlur=V.prototype.zg;V.prototype.getGradient=V.prototype.Gg;V.prototype.getRadius=V.prototype.ph;V.prototype.setBlur=V.prototype.di;V.prototype.setGradient=V.prototype.ii;V.prototype.setRadius=V.prototype.qh;t("ol.layer.Image",cj,OPENLAYERS);
cj.prototype.getSource=cj.prototype.ha;t("ol.layer.Layer",mh,OPENLAYERS);mh.prototype.getSource=mh.prototype.ha;mh.prototype.setMap=mh.prototype.setMap;mh.prototype.setSource=mh.prototype.Fc;t("ol.layer.Base",ih,OPENLAYERS);ih.prototype.getExtent=ih.prototype.H;ih.prototype.getMaxResolution=ih.prototype.Nb;ih.prototype.getMinResolution=ih.prototype.Ob;ih.prototype.getOpacity=ih.prototype.Pb;ih.prototype.getVisible=ih.prototype.xb;ih.prototype.getZIndex=ih.prototype.Qb;ih.prototype.setExtent=ih.prototype.fc;
ih.prototype.setMaxResolution=ih.prototype.nc;ih.prototype.setMinResolution=ih.prototype.oc;ih.prototype.setOpacity=ih.prototype.gc;ih.prototype.setVisible=ih.prototype.hc;ih.prototype.setZIndex=ih.prototype.ic;t("ol.layer.Group",Ti,OPENLAYERS);Ti.prototype.getLayers=Ti.prototype.Tc;Ti.prototype.setLayers=Ti.prototype.oh;t("ol.layer.Tile",dj,OPENLAYERS);dj.prototype.getPreload=dj.prototype.f;dj.prototype.getSource=dj.prototype.ha;dj.prototype.setPreload=dj.prototype.l;
dj.prototype.getUseInterimTilesOnError=dj.prototype.c;dj.prototype.setUseInterimTilesOnError=dj.prototype.A;t("ol.layer.Vector",G,OPENLAYERS);G.prototype.getSource=G.prototype.ha;G.prototype.getStyle=G.prototype.C;G.prototype.getStyleFunction=G.prototype.D;G.prototype.setStyle=G.prototype.l;t("ol.layer.VectorTile",I,OPENLAYERS);I.prototype.getPreload=I.prototype.f;I.prototype.getUseInterimTilesOnError=I.prototype.c;I.prototype.setPreload=I.prototype.Y;I.prototype.setUseInterimTilesOnError=I.prototype.ia;
t("ol.interaction.DoubleClickZoom",Zh,OPENLAYERS);t("ol.interaction.DoubleClickZoom.handleEvent",$h,OPENLAYERS);t("ol.interaction.DragAndDrop",hu,OPENLAYERS);t("ol.interaction.DragAndDrop.handleEvent",qc,OPENLAYERS);ku.prototype.features=ku.prototype.features;ku.prototype.file=ku.prototype.file;ku.prototype.projection=ku.prototype.projection;xi.prototype.coordinate=xi.prototype.coordinate;xi.prototype.mapBrowserEvent=xi.prototype.mapBrowserEvent;t("ol.interaction.DragBox",yi,OPENLAYERS);
yi.prototype.getGeometry=yi.prototype.W;t("ol.interaction.DragPan",mi,OPENLAYERS);t("ol.interaction.DragRotateAndZoom",mu,OPENLAYERS);t("ol.interaction.DragRotate",qi,OPENLAYERS);t("ol.interaction.DragZoom",Di,OPENLAYERS);qu.prototype.feature=qu.prototype.feature;t("ol.interaction.Draw",ru,OPENLAYERS);t("ol.interaction.Draw.handleEvent",tu,OPENLAYERS);ru.prototype.removeLastPoint=ru.prototype.Qo;ru.prototype.finishDrawing=ru.prototype.jd;ru.prototype.extend=ru.prototype.rm;
t("ol.interaction.Draw.createRegularPolygon",function(a,b){return function(c,d){var e=c[0],f=c[1],g=Math.sqrt(Hb(e,f)),h=d?d:Pd(new Vt(e),a);Qd(h,e,g,b?b:Math.atan((f[1]-e[1])/(f[0]-e[0])));return h}},OPENLAYERS);t("ol.interaction.Interaction",Vh,OPENLAYERS);Vh.prototype.getActive=Vh.prototype.f;Vh.prototype.getMap=Vh.prototype.l;Vh.prototype.setActive=Vh.prototype.i;t("ol.interaction.defaults",Si,OPENLAYERS);t("ol.interaction.KeyboardPan",Ei,OPENLAYERS);
t("ol.interaction.KeyboardPan.handleEvent",Fi,OPENLAYERS);t("ol.interaction.KeyboardZoom",Gi,OPENLAYERS);t("ol.interaction.KeyboardZoom.handleEvent",Hi,OPENLAYERS);Hu.prototype.features=Hu.prototype.features;Hu.prototype.mapBrowserEvent=Hu.prototype.mapBrowserEvent;t("ol.interaction.Modify",Iu,OPENLAYERS);t("ol.interaction.Modify.handleEvent",Lu,OPENLAYERS);Iu.prototype.removePoint=Iu.prototype.ai;t("ol.interaction.MouseWheelZoom",Ii,OPENLAYERS);t("ol.interaction.MouseWheelZoom.handleEvent",Ji,OPENLAYERS);
Ii.prototype.setMouseAnchor=Ii.prototype.D;t("ol.interaction.PinchRotate",Ki,OPENLAYERS);t("ol.interaction.PinchZoom",Oi,OPENLAYERS);t("ol.interaction.Pointer",ji,OPENLAYERS);t("ol.interaction.Pointer.handleEvent",ki,OPENLAYERS);Vu.prototype.selected=Vu.prototype.selected;Vu.prototype.deselected=Vu.prototype.deselected;Vu.prototype.mapBrowserEvent=Vu.prototype.mapBrowserEvent;t("ol.interaction.Select",Wu,OPENLAYERS);Wu.prototype.getFeatures=Wu.prototype.Bm;Wu.prototype.getLayer=Wu.prototype.Cm;
t("ol.interaction.Select.handleEvent",Xu,OPENLAYERS);Wu.prototype.setMap=Wu.prototype.setMap;t("ol.interaction.Snap",Zu,OPENLAYERS);Zu.prototype.addFeature=Zu.prototype.rb;Zu.prototype.removeFeature=Zu.prototype.nb;cv.prototype.features=cv.prototype.features;cv.prototype.coordinate=cv.prototype.coordinate;t("ol.interaction.Translate",dv,OPENLAYERS);t("ol.geom.Circle",Vt,OPENLAYERS);Vt.prototype.clone=Vt.prototype.clone;Vt.prototype.getCenter=Vt.prototype.rd;Vt.prototype.getRadius=Vt.prototype.wf;
Vt.prototype.getType=Vt.prototype.X;Vt.prototype.intersectsExtent=Vt.prototype.Ka;Vt.prototype.setCenter=Vt.prototype.jm;Vt.prototype.setCenterAndRadius=Vt.prototype.Vf;Vt.prototype.setRadius=Vt.prototype.km;Vt.prototype.transform=Vt.prototype.jb;t("ol.geom.Geometry",Tc,OPENLAYERS);Tc.prototype.getClosestPoint=Tc.prototype.vb;Tc.prototype.getExtent=Tc.prototype.H;Tc.prototype.rotate=Tc.prototype.rotate;Tc.prototype.simplify=Tc.prototype.Bb;Tc.prototype.transform=Tc.prototype.jb;
t("ol.geom.GeometryCollection",Ln,OPENLAYERS);Ln.prototype.clone=Ln.prototype.clone;Ln.prototype.getGeometries=Ln.prototype.ff;Ln.prototype.getType=Ln.prototype.X;Ln.prototype.intersectsExtent=Ln.prototype.Ka;Ln.prototype.setGeometries=Ln.prototype.hi;Ln.prototype.applyTransform=Ln.prototype.rc;Ln.prototype.translate=Ln.prototype.Sc;t("ol.geom.LinearRing",zd,OPENLAYERS);zd.prototype.clone=zd.prototype.clone;zd.prototype.getArea=zd.prototype.nm;zd.prototype.getCoordinates=zd.prototype.Z;
zd.prototype.getType=zd.prototype.X;zd.prototype.setCoordinates=zd.prototype.pa;t("ol.geom.LineString",R,OPENLAYERS);R.prototype.appendCoordinate=R.prototype.wj;R.prototype.clone=R.prototype.clone;R.prototype.forEachSegment=R.prototype.Lj;R.prototype.getCoordinateAtM=R.prototype.lm;R.prototype.getCoordinates=R.prototype.Z;R.prototype.getCoordinateAt=R.prototype.Bg;R.prototype.getLength=R.prototype.mm;R.prototype.getType=R.prototype.X;R.prototype.intersectsExtent=R.prototype.Ka;
R.prototype.setCoordinates=R.prototype.pa;t("ol.geom.MultiLineString",S,OPENLAYERS);S.prototype.appendLineString=S.prototype.xj;S.prototype.clone=S.prototype.clone;S.prototype.getCoordinateAtM=S.prototype.om;S.prototype.getCoordinates=S.prototype.Z;S.prototype.getLineString=S.prototype.fk;S.prototype.getLineStrings=S.prototype.md;S.prototype.getType=S.prototype.X;S.prototype.intersectsExtent=S.prototype.Ka;S.prototype.setCoordinates=S.prototype.pa;t("ol.geom.MultiPoint",Bn,OPENLAYERS);
Bn.prototype.appendPoint=Bn.prototype.zj;Bn.prototype.clone=Bn.prototype.clone;Bn.prototype.getCoordinates=Bn.prototype.Z;Bn.prototype.getPoint=Bn.prototype.rk;Bn.prototype.getPoints=Bn.prototype.je;Bn.prototype.getType=Bn.prototype.X;Bn.prototype.intersectsExtent=Bn.prototype.Ka;Bn.prototype.setCoordinates=Bn.prototype.pa;t("ol.geom.MultiPolygon",T,OPENLAYERS);T.prototype.appendPolygon=T.prototype.Aj;T.prototype.clone=T.prototype.clone;T.prototype.getArea=T.prototype.pm;
T.prototype.getCoordinates=T.prototype.Z;T.prototype.getInteriorPoints=T.prototype.ck;T.prototype.getPolygon=T.prototype.tk;T.prototype.getPolygons=T.prototype.Wd;T.prototype.getType=T.prototype.X;T.prototype.intersectsExtent=T.prototype.Ka;T.prototype.setCoordinates=T.prototype.pa;t("ol.geom.Point",C,OPENLAYERS);C.prototype.clone=C.prototype.clone;C.prototype.getCoordinates=C.prototype.Z;C.prototype.getType=C.prototype.X;C.prototype.intersectsExtent=C.prototype.Ka;C.prototype.setCoordinates=C.prototype.pa;
t("ol.geom.Polygon",E,OPENLAYERS);E.prototype.appendLinearRing=E.prototype.yj;E.prototype.clone=E.prototype.clone;E.prototype.getArea=E.prototype.qm;E.prototype.getCoordinates=E.prototype.Z;E.prototype.getInteriorPoint=E.prototype.bk;E.prototype.getLinearRingCount=E.prototype.gk;E.prototype.getLinearRing=E.prototype.Hg;E.prototype.getLinearRings=E.prototype.Vd;E.prototype.getType=E.prototype.X;E.prototype.intersectsExtent=E.prototype.Ka;E.prototype.setCoordinates=E.prototype.pa;
t("ol.geom.Polygon.circular",Nd,OPENLAYERS);t("ol.geom.Polygon.fromExtent",Od,OPENLAYERS);t("ol.geom.Polygon.fromCircle",Pd,OPENLAYERS);t("ol.geom.SimpleGeometry",hd,OPENLAYERS);hd.prototype.getFirstCoordinate=hd.prototype.Ib;hd.prototype.getLastCoordinate=hd.prototype.Jb;hd.prototype.getLayout=hd.prototype.Kb;hd.prototype.applyTransform=hd.prototype.rc;hd.prototype.translate=hd.prototype.Sc;t("ol.format.EsriJSON",En,OPENLAYERS);En.prototype.readFeature=En.prototype.Rb;En.prototype.readFeatures=En.prototype.Fa;
En.prototype.readGeometry=En.prototype.Vc;En.prototype.readProjection=En.prototype.Oa;En.prototype.writeGeometry=En.prototype.Zc;En.prototype.writeGeometryObject=En.prototype.Ke;En.prototype.writeFeature=En.prototype.Dd;En.prototype.writeFeatureObject=En.prototype.Yc;En.prototype.writeFeatures=En.prototype.Xb;En.prototype.writeFeaturesObject=En.prototype.Ie;t("ol.format.Feature",rn,OPENLAYERS);t("ol.format.GeoJSON",Pn,OPENLAYERS);Pn.prototype.readFeature=Pn.prototype.Rb;
Pn.prototype.readFeatures=Pn.prototype.Fa;Pn.prototype.readGeometry=Pn.prototype.Vc;Pn.prototype.readProjection=Pn.prototype.Oa;Pn.prototype.writeFeature=Pn.prototype.Dd;Pn.prototype.writeFeatureObject=Pn.prototype.Yc;Pn.prototype.writeFeatures=Pn.prototype.Xb;Pn.prototype.writeFeaturesObject=Pn.prototype.Ie;Pn.prototype.writeGeometry=Pn.prototype.Zc;Pn.prototype.writeGeometryObject=Pn.prototype.Ke;t("ol.format.GPX",uo,OPENLAYERS);uo.prototype.readFeature=uo.prototype.Rb;
uo.prototype.readFeatures=uo.prototype.Fa;uo.prototype.readProjection=uo.prototype.Oa;uo.prototype.writeFeatures=uo.prototype.Xb;uo.prototype.writeFeaturesNode=uo.prototype.a;t("ol.format.IGC",dp,OPENLAYERS);dp.prototype.readFeature=dp.prototype.Rb;dp.prototype.readFeatures=dp.prototype.Fa;dp.prototype.readProjection=dp.prototype.Oa;t("ol.format.KML",Hp,OPENLAYERS);Hp.prototype.readFeature=Hp.prototype.Rb;Hp.prototype.readFeatures=Hp.prototype.Fa;Hp.prototype.readName=Hp.prototype.Fo;
Hp.prototype.readNetworkLinks=Hp.prototype.Go;Hp.prototype.readProjection=Hp.prototype.Oa;Hp.prototype.writeFeatures=Hp.prototype.Xb;Hp.prototype.writeFeaturesNode=Hp.prototype.a;t("ol.format.MVT",wr,OPENLAYERS);wr.prototype.readFeatures=wr.prototype.Fa;wr.prototype.readProjection=wr.prototype.Oa;wr.prototype.setLayers=wr.prototype.c;t("ol.format.OSMXML",Sr,OPENLAYERS);Sr.prototype.readFeatures=Sr.prototype.Fa;Sr.prototype.readProjection=Sr.prototype.Oa;t("ol.format.Polyline",qs,OPENLAYERS);
t("ol.format.Polyline.encodeDeltas",rs,OPENLAYERS);t("ol.format.Polyline.decodeDeltas",ts,OPENLAYERS);t("ol.format.Polyline.encodeFloats",ss,OPENLAYERS);t("ol.format.Polyline.decodeFloats",us,OPENLAYERS);qs.prototype.readFeature=qs.prototype.Rb;qs.prototype.readFeatures=qs.prototype.Fa;qs.prototype.readGeometry=qs.prototype.Vc;qs.prototype.readProjection=qs.prototype.Oa;qs.prototype.writeGeometry=qs.prototype.Zc;t("ol.format.TopoJSON",ws,OPENLAYERS);ws.prototype.readFeatures=ws.prototype.Fa;
ws.prototype.readProjection=ws.prototype.Oa;t("ol.format.WFS",Cs,OPENLAYERS);Cs.prototype.readFeatures=Cs.prototype.Fa;Cs.prototype.readTransactionResponse=Cs.prototype.o;Cs.prototype.readFeatureCollectionMetadata=Cs.prototype.l;Cs.prototype.writeGetFeature=Cs.prototype.j;Cs.prototype.writeTransaction=Cs.prototype.U;Cs.prototype.readProjection=Cs.prototype.Oa;t("ol.format.WKT",Ts,OPENLAYERS);Ts.prototype.readFeature=Ts.prototype.Rb;Ts.prototype.readFeatures=Ts.prototype.Fa;
Ts.prototype.readGeometry=Ts.prototype.Vc;Ts.prototype.writeFeature=Ts.prototype.Dd;Ts.prototype.writeFeatures=Ts.prototype.Xb;Ts.prototype.writeGeometry=Ts.prototype.Zc;t("ol.format.WMSCapabilities",jt,OPENLAYERS);jt.prototype.read=jt.prototype.read;t("ol.format.WMSGetFeatureInfo",Gt,OPENLAYERS);Gt.prototype.readFeatures=Gt.prototype.Fa;t("ol.format.WMTSCapabilities",Ht,OPENLAYERS);Ht.prototype.read=Ht.prototype.read;t("ol.format.ogc.filter.and",yr,OPENLAYERS);
t("ol.format.ogc.filter.or",function(a,b){return new Fr(a,b)},OPENLAYERS);t("ol.format.ogc.filter.not",function(a){return new Gr(a)},OPENLAYERS);t("ol.format.ogc.filter.bbox",Ar,OPENLAYERS);t("ol.format.ogc.filter.equalTo",function(a,b,c){return new Jr(a,b,c)},OPENLAYERS);t("ol.format.ogc.filter.notEqualTo",function(a,b,c){return new Kr(a,b,c)},OPENLAYERS);t("ol.format.ogc.filter.lessThan",function(a,b){return new Lr(a,b)},OPENLAYERS);
t("ol.format.ogc.filter.lessThanOrEqualTo",function(a,b){return new Mr(a,b)},OPENLAYERS);t("ol.format.ogc.filter.greaterThan",function(a,b){return new Nr(a,b)},OPENLAYERS);t("ol.format.ogc.filter.greaterThanOrEqualTo",function(a,b){return new Or(a,b)},OPENLAYERS);t("ol.format.ogc.filter.isNull",function(a){return new Pr(a)},OPENLAYERS);t("ol.format.ogc.filter.between",function(a,b,c){return new Qr(a,b,c)},OPENLAYERS);
t("ol.format.ogc.filter.like",function(a,b,c,d,e,f){return new Rr(a,b,c,d,e,f)},OPENLAYERS);t("ol.format.ogc.filter.Filter",Cr,OPENLAYERS);t("ol.format.ogc.filter.And",zr,OPENLAYERS);t("ol.format.ogc.filter.Or",Fr,OPENLAYERS);t("ol.format.ogc.filter.Not",Gr,OPENLAYERS);t("ol.format.ogc.filter.Bbox",Br,OPENLAYERS);t("ol.format.ogc.filter.Comparison",Hr,OPENLAYERS);t("ol.format.ogc.filter.ComparisonBinary",Ir,OPENLAYERS);t("ol.format.ogc.filter.EqualTo",Jr,OPENLAYERS);
t("ol.format.ogc.filter.NotEqualTo",Kr,OPENLAYERS);t("ol.format.ogc.filter.LessThan",Lr,OPENLAYERS);t("ol.format.ogc.filter.LessThanOrEqualTo",Mr,OPENLAYERS);t("ol.format.ogc.filter.GreaterThan",Nr,OPENLAYERS);t("ol.format.ogc.filter.GreaterThanOrEqualTo",Or,OPENLAYERS);t("ol.format.ogc.filter.IsNull",Pr,OPENLAYERS);t("ol.format.ogc.filter.IsBetween",Qr,OPENLAYERS);t("ol.format.ogc.filter.IsLike",Rr,OPENLAYERS);t("ol.format.GML2",ko,OPENLAYERS);t("ol.format.GML3",lo,OPENLAYERS);
lo.prototype.writeGeometryNode=lo.prototype.s;lo.prototype.writeFeatures=lo.prototype.Xb;lo.prototype.writeFeaturesNode=lo.prototype.a;t("ol.format.GML",lo,OPENLAYERS);lo.prototype.writeFeatures=lo.prototype.Xb;lo.prototype.writeFeaturesNode=lo.prototype.a;Xn.prototype.readFeatures=Xn.prototype.Fa;t("ol.events.condition.altKeyOnly",function(a){a=a.originalEvent;return a.altKey&&!(a.metaKey||a.ctrlKey)&&!a.shiftKey},OPENLAYERS);t("ol.events.condition.altShiftKeysOnly",ai,OPENLAYERS);
t("ol.events.condition.always",qc,OPENLAYERS);t("ol.events.condition.click",function(a){return a.type==Zg},OPENLAYERS);t("ol.events.condition.never",rc,OPENLAYERS);t("ol.events.condition.pointerMove",ci,OPENLAYERS);t("ol.events.condition.singleClick",di,OPENLAYERS);t("ol.events.condition.doubleClick",function(a){return a.type==$g},OPENLAYERS);t("ol.events.condition.noModifierKeys",ei,OPENLAYERS);
t("ol.events.condition.platformModifierKeyOnly",function(a){a=a.originalEvent;return!a.altKey&&(fg?a.metaKey:a.ctrlKey)&&!a.shiftKey},OPENLAYERS);t("ol.events.condition.shiftKeyOnly",fi,OPENLAYERS);t("ol.events.condition.targetNotEditable",gi,OPENLAYERS);t("ol.events.condition.mouseOnly",hi,OPENLAYERS);t("ol.events.condition.primaryAction",ii,OPENLAYERS);Wa.prototype.type=Wa.prototype.type;Wa.prototype.target=Wa.prototype.target;Wa.prototype.preventDefault=Wa.prototype.preventDefault;
Wa.prototype.stopPropagation=Wa.prototype.stopPropagation;t("ol.control.Attribution",Ef,OPENLAYERS);t("ol.control.Attribution.render",Ff,OPENLAYERS);Ef.prototype.getCollapsible=Ef.prototype.$l;Ef.prototype.setCollapsible=Ef.prototype.cm;Ef.prototype.setCollapsed=Ef.prototype.bm;Ef.prototype.getCollapsed=Ef.prototype.Zl;t("ol.control.Control",Xe,OPENLAYERS);Xe.prototype.getMap=Xe.prototype.i;Xe.prototype.setMap=Xe.prototype.setMap;Xe.prototype.setTarget=Xe.prototype.c;t("ol.control.defaults",Kf,OPENLAYERS);
t("ol.control.FullScreen",Lf,OPENLAYERS);t("ol.control.MousePosition",Qf,OPENLAYERS);t("ol.control.MousePosition.render",Rf,OPENLAYERS);Qf.prototype.getCoordinateFormat=Qf.prototype.Cg;Qf.prototype.getProjection=Qf.prototype.hh;Qf.prototype.setCoordinateFormat=Qf.prototype.ei;Qf.prototype.setProjection=Qf.prototype.ih;t("ol.control.OverviewMap",an,OPENLAYERS);t("ol.control.OverviewMap.render",bn,OPENLAYERS);an.prototype.getCollapsible=an.prototype.fm;an.prototype.setCollapsible=an.prototype.im;
an.prototype.setCollapsed=an.prototype.hm;an.prototype.getCollapsed=an.prototype.em;an.prototype.getOverviewMap=an.prototype.pk;t("ol.control.Rotate",Hf,OPENLAYERS);t("ol.control.Rotate.render",If,OPENLAYERS);t("ol.control.ScaleLine",fn,OPENLAYERS);fn.prototype.getUnits=fn.prototype.wb;t("ol.control.ScaleLine.render",gn,OPENLAYERS);fn.prototype.setUnits=fn.prototype.D;t("ol.control.Zoom",Jf,OPENLAYERS);t("ol.control.ZoomSlider",kn,OPENLAYERS);t("ol.control.ZoomSlider.render",mn,OPENLAYERS);
t("ol.control.ZoomToExtent",pn,OPENLAYERS);t("ol.color.asArray",te,OPENLAYERS);t("ol.color.asString",ve,OPENLAYERS);ke.prototype.type=ke.prototype.type;ke.prototype.target=ke.prototype.target;ke.prototype.preventDefault=ke.prototype.preventDefault;ke.prototype.stopPropagation=ke.prototype.stopPropagation;eb.prototype.changed=eb.prototype.u;eb.prototype.dispatchEvent=eb.prototype.b;eb.prototype.getRevision=eb.prototype.K;eb.prototype.on=eb.prototype.I;eb.prototype.once=eb.prototype.L;
eb.prototype.un=eb.prototype.J;eb.prototype.unByKey=eb.prototype.M;le.prototype.get=le.prototype.get;le.prototype.getKeys=le.prototype.N;le.prototype.getProperties=le.prototype.O;le.prototype.set=le.prototype.set;le.prototype.setProperties=le.prototype.G;le.prototype.unset=le.prototype.P;le.prototype.changed=le.prototype.u;le.prototype.dispatchEvent=le.prototype.b;le.prototype.getRevision=le.prototype.K;le.prototype.on=le.prototype.I;le.prototype.once=le.prototype.L;le.prototype.un=le.prototype.J;
le.prototype.unByKey=le.prototype.M;qn.prototype.get=qn.prototype.get;qn.prototype.getKeys=qn.prototype.N;qn.prototype.getProperties=qn.prototype.O;qn.prototype.set=qn.prototype.set;qn.prototype.setProperties=qn.prototype.G;qn.prototype.unset=qn.prototype.P;qn.prototype.changed=qn.prototype.u;qn.prototype.dispatchEvent=qn.prototype.b;qn.prototype.getRevision=qn.prototype.K;qn.prototype.on=qn.prototype.I;qn.prototype.once=qn.prototype.L;qn.prototype.un=qn.prototype.J;qn.prototype.unByKey=qn.prototype.M;
Ik.prototype.get=Ik.prototype.get;Ik.prototype.getKeys=Ik.prototype.N;Ik.prototype.getProperties=Ik.prototype.O;Ik.prototype.set=Ik.prototype.set;Ik.prototype.setProperties=Ik.prototype.G;Ik.prototype.unset=Ik.prototype.P;Ik.prototype.changed=Ik.prototype.u;Ik.prototype.dispatchEvent=Ik.prototype.b;Ik.prototype.getRevision=Ik.prototype.K;Ik.prototype.on=Ik.prototype.I;Ik.prototype.once=Ik.prototype.L;Ik.prototype.un=Ik.prototype.J;Ik.prototype.unByKey=Ik.prototype.M;Ut.prototype.get=Ut.prototype.get;
Ut.prototype.getKeys=Ut.prototype.N;Ut.prototype.getProperties=Ut.prototype.O;Ut.prototype.set=Ut.prototype.set;Ut.prototype.setProperties=Ut.prototype.G;Ut.prototype.unset=Ut.prototype.P;Ut.prototype.changed=Ut.prototype.u;Ut.prototype.dispatchEvent=Ut.prototype.b;Ut.prototype.getRevision=Ut.prototype.K;Ut.prototype.on=Ut.prototype.I;Ut.prototype.once=Ut.prototype.L;Ut.prototype.un=Ut.prototype.J;Ut.prototype.unByKey=Ut.prototype.M;fu.prototype.getTileCoord=fu.prototype.i;Q.prototype.get=Q.prototype.get;
Q.prototype.getKeys=Q.prototype.N;Q.prototype.getProperties=Q.prototype.O;Q.prototype.set=Q.prototype.set;Q.prototype.setProperties=Q.prototype.G;Q.prototype.unset=Q.prototype.P;Q.prototype.changed=Q.prototype.u;Q.prototype.dispatchEvent=Q.prototype.b;Q.prototype.getRevision=Q.prototype.K;Q.prototype.on=Q.prototype.I;Q.prototype.once=Q.prototype.L;Q.prototype.un=Q.prototype.J;Q.prototype.unByKey=Q.prototype.M;We.prototype.type=We.prototype.type;We.prototype.target=We.prototype.target;
We.prototype.preventDefault=We.prototype.preventDefault;We.prototype.stopPropagation=We.prototype.stopPropagation;Vg.prototype.map=Vg.prototype.map;Vg.prototype.frameState=Vg.prototype.frameState;Vg.prototype.type=Vg.prototype.type;Vg.prototype.target=Vg.prototype.target;Vg.prototype.preventDefault=Vg.prototype.preventDefault;Vg.prototype.stopPropagation=Vg.prototype.stopPropagation;Wg.prototype.originalEvent=Wg.prototype.originalEvent;Wg.prototype.pixel=Wg.prototype.pixel;
Wg.prototype.coordinate=Wg.prototype.coordinate;Wg.prototype.dragging=Wg.prototype.dragging;Wg.prototype.preventDefault=Wg.prototype.preventDefault;Wg.prototype.stopPropagation=Wg.prototype.stopPropagation;Wg.prototype.map=Wg.prototype.map;Wg.prototype.frameState=Wg.prototype.frameState;Wg.prototype.type=Wg.prototype.type;Wg.prototype.target=Wg.prototype.target;db.prototype.type=db.prototype.type;db.prototype.target=db.prototype.target;db.prototype.preventDefault=db.prototype.preventDefault;
db.prototype.stopPropagation=db.prototype.stopPropagation;Xm.prototype.get=Xm.prototype.get;Xm.prototype.getKeys=Xm.prototype.N;Xm.prototype.getProperties=Xm.prototype.O;Xm.prototype.set=Xm.prototype.set;Xm.prototype.setProperties=Xm.prototype.G;Xm.prototype.unset=Xm.prototype.P;Xm.prototype.changed=Xm.prototype.u;Xm.prototype.dispatchEvent=Xm.prototype.b;Xm.prototype.getRevision=Xm.prototype.K;Xm.prototype.on=Xm.prototype.I;Xm.prototype.once=Xm.prototype.L;Xm.prototype.un=Xm.prototype.J;
Xm.prototype.unByKey=Xm.prototype.M;Kk.prototype.getTileCoord=Kk.prototype.i;Rd.prototype.get=Rd.prototype.get;Rd.prototype.getKeys=Rd.prototype.N;Rd.prototype.getProperties=Rd.prototype.O;Rd.prototype.set=Rd.prototype.set;Rd.prototype.setProperties=Rd.prototype.G;Rd.prototype.unset=Rd.prototype.P;Rd.prototype.changed=Rd.prototype.u;Rd.prototype.dispatchEvent=Rd.prototype.b;Rd.prototype.getRevision=Rd.prototype.K;Rd.prototype.on=Rd.prototype.I;Rd.prototype.once=Rd.prototype.L;Rd.prototype.un=Rd.prototype.J;
Rd.prototype.unByKey=Rd.prototype.M;fw.prototype.forEachTileCoord=fw.prototype.yg;fw.prototype.getMaxZoom=fw.prototype.Ig;fw.prototype.getMinZoom=fw.prototype.Jg;fw.prototype.getOrigin=fw.prototype.Ia;fw.prototype.getResolution=fw.prototype.$;fw.prototype.getResolutions=fw.prototype.Kh;fw.prototype.getTileCoordExtent=fw.prototype.Ea;fw.prototype.getTileCoordForCoordAndResolution=fw.prototype.Zd;fw.prototype.getTileCoordForCoordAndZ=fw.prototype.qd;fw.prototype.getTileSize=fw.prototype.Ja;
fw.prototype.getZForResolution=fw.prototype.Lb;qj.prototype.getOpacity=qj.prototype.qe;qj.prototype.getRotateWithView=qj.prototype.Xd;qj.prototype.getRotation=qj.prototype.re;qj.prototype.getScale=qj.prototype.se;qj.prototype.getSnapToPixel=qj.prototype.Yd;qj.prototype.setOpacity=qj.prototype.te;qj.prototype.setRotation=qj.prototype.ue;qj.prototype.setScale=qj.prototype.ve;Dh.prototype.getOpacity=Dh.prototype.qe;Dh.prototype.getRotateWithView=Dh.prototype.Xd;Dh.prototype.getRotation=Dh.prototype.re;
Dh.prototype.getScale=Dh.prototype.se;Dh.prototype.getSnapToPixel=Dh.prototype.Yd;Dh.prototype.setOpacity=Dh.prototype.te;Dh.prototype.setRotation=Dh.prototype.ue;Dh.prototype.setScale=Dh.prototype.ve;ow.prototype.getOpacity=ow.prototype.qe;ow.prototype.getRotateWithView=ow.prototype.Xd;ow.prototype.getRotation=ow.prototype.re;ow.prototype.getScale=ow.prototype.se;ow.prototype.getSnapToPixel=ow.prototype.Yd;ow.prototype.setOpacity=ow.prototype.te;ow.prototype.setRotation=ow.prototype.ue;
ow.prototype.setScale=ow.prototype.ve;jf.prototype.get=jf.prototype.get;jf.prototype.getKeys=jf.prototype.N;jf.prototype.getProperties=jf.prototype.O;jf.prototype.set=jf.prototype.set;jf.prototype.setProperties=jf.prototype.G;jf.prototype.unset=jf.prototype.P;jf.prototype.changed=jf.prototype.u;jf.prototype.dispatchEvent=jf.prototype.b;jf.prototype.getRevision=jf.prototype.K;jf.prototype.on=jf.prototype.I;jf.prototype.once=jf.prototype.L;jf.prototype.un=jf.prototype.J;jf.prototype.unByKey=jf.prototype.M;
zf.prototype.getAttributions=zf.prototype.wa;zf.prototype.getLogo=zf.prototype.ua;zf.prototype.getProjection=zf.prototype.xa;zf.prototype.getState=zf.prototype.V;zf.prototype.refresh=zf.prototype.sa;zf.prototype.setAttributions=zf.prototype.oa;zf.prototype.get=zf.prototype.get;zf.prototype.getKeys=zf.prototype.N;zf.prototype.getProperties=zf.prototype.O;zf.prototype.set=zf.prototype.set;zf.prototype.setProperties=zf.prototype.G;zf.prototype.unset=zf.prototype.P;zf.prototype.changed=zf.prototype.u;
zf.prototype.dispatchEvent=zf.prototype.b;zf.prototype.getRevision=zf.prototype.K;zf.prototype.on=zf.prototype.I;zf.prototype.once=zf.prototype.L;zf.prototype.un=zf.prototype.J;zf.prototype.unByKey=zf.prototype.M;Jl.prototype.getTileGrid=Jl.prototype.Na;Jl.prototype.refresh=Jl.prototype.sa;Jl.prototype.getAttributions=Jl.prototype.wa;Jl.prototype.getLogo=Jl.prototype.ua;Jl.prototype.getProjection=Jl.prototype.xa;Jl.prototype.getState=Jl.prototype.V;Jl.prototype.setAttributions=Jl.prototype.oa;
Jl.prototype.get=Jl.prototype.get;Jl.prototype.getKeys=Jl.prototype.N;Jl.prototype.getProperties=Jl.prototype.O;Jl.prototype.set=Jl.prototype.set;Jl.prototype.setProperties=Jl.prototype.G;Jl.prototype.unset=Jl.prototype.P;Jl.prototype.changed=Jl.prototype.u;Jl.prototype.dispatchEvent=Jl.prototype.b;Jl.prototype.getRevision=Jl.prototype.K;Jl.prototype.on=Jl.prototype.I;Jl.prototype.once=Jl.prototype.L;Jl.prototype.un=Jl.prototype.J;Jl.prototype.unByKey=Jl.prototype.M;
W.prototype.getTileLoadFunction=W.prototype.fb;W.prototype.getTileUrlFunction=W.prototype.gb;W.prototype.getUrls=W.prototype.hb;W.prototype.setTileLoadFunction=W.prototype.kb;W.prototype.setTileUrlFunction=W.prototype.Qa;W.prototype.setUrl=W.prototype.Va;W.prototype.setUrls=W.prototype.bb;W.prototype.getTileGrid=W.prototype.Na;W.prototype.refresh=W.prototype.sa;W.prototype.getAttributions=W.prototype.wa;W.prototype.getLogo=W.prototype.ua;W.prototype.getProjection=W.prototype.xa;
W.prototype.getState=W.prototype.V;W.prototype.setAttributions=W.prototype.oa;W.prototype.get=W.prototype.get;W.prototype.getKeys=W.prototype.N;W.prototype.getProperties=W.prototype.O;W.prototype.set=W.prototype.set;W.prototype.setProperties=W.prototype.G;W.prototype.unset=W.prototype.P;W.prototype.changed=W.prototype.u;W.prototype.dispatchEvent=W.prototype.b;W.prototype.getRevision=W.prototype.K;W.prototype.on=W.prototype.I;W.prototype.once=W.prototype.L;W.prototype.un=W.prototype.J;
W.prototype.unByKey=W.prototype.M;pv.prototype.setRenderReprojectionEdges=pv.prototype.zb;pv.prototype.setTileGridForProjection=pv.prototype.Ab;pv.prototype.getTileLoadFunction=pv.prototype.fb;pv.prototype.getTileUrlFunction=pv.prototype.gb;pv.prototype.getUrls=pv.prototype.hb;pv.prototype.setTileLoadFunction=pv.prototype.kb;pv.prototype.setTileUrlFunction=pv.prototype.Qa;pv.prototype.setUrl=pv.prototype.Va;pv.prototype.setUrls=pv.prototype.bb;pv.prototype.getTileGrid=pv.prototype.Na;
pv.prototype.refresh=pv.prototype.sa;pv.prototype.getAttributions=pv.prototype.wa;pv.prototype.getLogo=pv.prototype.ua;pv.prototype.getProjection=pv.prototype.xa;pv.prototype.getState=pv.prototype.V;pv.prototype.setAttributions=pv.prototype.oa;pv.prototype.get=pv.prototype.get;pv.prototype.getKeys=pv.prototype.N;pv.prototype.getProperties=pv.prototype.O;pv.prototype.set=pv.prototype.set;pv.prototype.setProperties=pv.prototype.G;pv.prototype.unset=pv.prototype.P;pv.prototype.changed=pv.prototype.u;
pv.prototype.dispatchEvent=pv.prototype.b;pv.prototype.getRevision=pv.prototype.K;pv.prototype.on=pv.prototype.I;pv.prototype.once=pv.prototype.L;pv.prototype.un=pv.prototype.J;pv.prototype.unByKey=pv.prototype.M;rv.prototype.setRenderReprojectionEdges=rv.prototype.zb;rv.prototype.setTileGridForProjection=rv.prototype.Ab;rv.prototype.getTileLoadFunction=rv.prototype.fb;rv.prototype.getTileUrlFunction=rv.prototype.gb;rv.prototype.getUrls=rv.prototype.hb;rv.prototype.setTileLoadFunction=rv.prototype.kb;
rv.prototype.setTileUrlFunction=rv.prototype.Qa;rv.prototype.setUrl=rv.prototype.Va;rv.prototype.setUrls=rv.prototype.bb;rv.prototype.getTileGrid=rv.prototype.Na;rv.prototype.refresh=rv.prototype.sa;rv.prototype.getAttributions=rv.prototype.wa;rv.prototype.getLogo=rv.prototype.ua;rv.prototype.getProjection=rv.prototype.xa;rv.prototype.getState=rv.prototype.V;rv.prototype.setAttributions=rv.prototype.oa;rv.prototype.get=rv.prototype.get;rv.prototype.getKeys=rv.prototype.N;
rv.prototype.getProperties=rv.prototype.O;rv.prototype.set=rv.prototype.set;rv.prototype.setProperties=rv.prototype.G;rv.prototype.unset=rv.prototype.P;rv.prototype.changed=rv.prototype.u;rv.prototype.dispatchEvent=rv.prototype.b;rv.prototype.getRevision=rv.prototype.K;rv.prototype.on=rv.prototype.I;rv.prototype.once=rv.prototype.L;rv.prototype.un=rv.prototype.J;rv.prototype.unByKey=rv.prototype.M;sv.prototype.setRenderReprojectionEdges=sv.prototype.zb;sv.prototype.setTileGridForProjection=sv.prototype.Ab;
sv.prototype.getTileLoadFunction=sv.prototype.fb;sv.prototype.getTileUrlFunction=sv.prototype.gb;sv.prototype.getUrls=sv.prototype.hb;sv.prototype.setTileLoadFunction=sv.prototype.kb;sv.prototype.setTileUrlFunction=sv.prototype.Qa;sv.prototype.setUrl=sv.prototype.Va;sv.prototype.setUrls=sv.prototype.bb;sv.prototype.getTileGrid=sv.prototype.Na;sv.prototype.refresh=sv.prototype.sa;sv.prototype.getAttributions=sv.prototype.wa;sv.prototype.getLogo=sv.prototype.ua;sv.prototype.getProjection=sv.prototype.xa;
sv.prototype.getState=sv.prototype.V;sv.prototype.setAttributions=sv.prototype.oa;sv.prototype.get=sv.prototype.get;sv.prototype.getKeys=sv.prototype.N;sv.prototype.getProperties=sv.prototype.O;sv.prototype.set=sv.prototype.set;sv.prototype.setProperties=sv.prototype.G;sv.prototype.unset=sv.prototype.P;sv.prototype.changed=sv.prototype.u;sv.prototype.dispatchEvent=sv.prototype.b;sv.prototype.getRevision=sv.prototype.K;sv.prototype.on=sv.prototype.I;sv.prototype.once=sv.prototype.L;
sv.prototype.un=sv.prototype.J;sv.prototype.unByKey=sv.prototype.M;P.prototype.getAttributions=P.prototype.wa;P.prototype.getLogo=P.prototype.ua;P.prototype.getProjection=P.prototype.xa;P.prototype.getState=P.prototype.V;P.prototype.refresh=P.prototype.sa;P.prototype.setAttributions=P.prototype.oa;P.prototype.get=P.prototype.get;P.prototype.getKeys=P.prototype.N;P.prototype.getProperties=P.prototype.O;P.prototype.set=P.prototype.set;P.prototype.setProperties=P.prototype.G;P.prototype.unset=P.prototype.P;
P.prototype.changed=P.prototype.u;P.prototype.dispatchEvent=P.prototype.b;P.prototype.getRevision=P.prototype.K;P.prototype.on=P.prototype.I;P.prototype.once=P.prototype.L;P.prototype.un=P.prototype.J;P.prototype.unByKey=P.prototype.M;Y.prototype.addFeature=Y.prototype.rb;Y.prototype.addFeatures=Y.prototype.Jc;Y.prototype.clear=Y.prototype.clear;Y.prototype.forEachFeature=Y.prototype.wg;Y.prototype.forEachFeatureInExtent=Y.prototype.ub;Y.prototype.forEachFeatureIntersectingExtent=Y.prototype.xg;
Y.prototype.getFeaturesCollection=Y.prototype.Fg;Y.prototype.getFeatures=Y.prototype.oe;Y.prototype.getFeaturesAtCoordinate=Y.prototype.Eg;Y.prototype.getFeaturesInExtent=Y.prototype.ef;Y.prototype.getClosestFeatureToCoordinate=Y.prototype.Ag;Y.prototype.getExtent=Y.prototype.H;Y.prototype.getFeatureById=Y.prototype.Dg;Y.prototype.getFormat=Y.prototype.Ch;Y.prototype.getUrl=Y.prototype.Dh;Y.prototype.removeFeature=Y.prototype.nb;Y.prototype.getAttributions=Y.prototype.wa;Y.prototype.getLogo=Y.prototype.ua;
Y.prototype.getProjection=Y.prototype.xa;Y.prototype.getState=Y.prototype.V;Y.prototype.refresh=Y.prototype.sa;Y.prototype.setAttributions=Y.prototype.oa;Y.prototype.get=Y.prototype.get;Y.prototype.getKeys=Y.prototype.N;Y.prototype.getProperties=Y.prototype.O;Y.prototype.set=Y.prototype.set;Y.prototype.setProperties=Y.prototype.G;Y.prototype.unset=Y.prototype.P;Y.prototype.changed=Y.prototype.u;Y.prototype.dispatchEvent=Y.prototype.b;Y.prototype.getRevision=Y.prototype.K;Y.prototype.on=Y.prototype.I;
Y.prototype.once=Y.prototype.L;Y.prototype.un=Y.prototype.J;Y.prototype.unByKey=Y.prototype.M;Ak.prototype.getAttributions=Ak.prototype.wa;Ak.prototype.getLogo=Ak.prototype.ua;Ak.prototype.getProjection=Ak.prototype.xa;Ak.prototype.getState=Ak.prototype.V;Ak.prototype.refresh=Ak.prototype.sa;Ak.prototype.setAttributions=Ak.prototype.oa;Ak.prototype.get=Ak.prototype.get;Ak.prototype.getKeys=Ak.prototype.N;Ak.prototype.getProperties=Ak.prototype.O;Ak.prototype.set=Ak.prototype.set;
Ak.prototype.setProperties=Ak.prototype.G;Ak.prototype.unset=Ak.prototype.P;Ak.prototype.changed=Ak.prototype.u;Ak.prototype.dispatchEvent=Ak.prototype.b;Ak.prototype.getRevision=Ak.prototype.K;Ak.prototype.on=Ak.prototype.I;Ak.prototype.once=Ak.prototype.L;Ak.prototype.un=Ak.prototype.J;Ak.prototype.unByKey=Ak.prototype.M;yv.prototype.getAttributions=yv.prototype.wa;yv.prototype.getLogo=yv.prototype.ua;yv.prototype.getProjection=yv.prototype.xa;yv.prototype.getState=yv.prototype.V;
yv.prototype.refresh=yv.prototype.sa;yv.prototype.setAttributions=yv.prototype.oa;yv.prototype.get=yv.prototype.get;yv.prototype.getKeys=yv.prototype.N;yv.prototype.getProperties=yv.prototype.O;yv.prototype.set=yv.prototype.set;yv.prototype.setProperties=yv.prototype.G;yv.prototype.unset=yv.prototype.P;yv.prototype.changed=yv.prototype.u;yv.prototype.dispatchEvent=yv.prototype.b;yv.prototype.getRevision=yv.prototype.K;yv.prototype.on=yv.prototype.I;yv.prototype.once=yv.prototype.L;
yv.prototype.un=yv.prototype.J;yv.prototype.unByKey=yv.prototype.M;Hk.prototype.getAttributions=Hk.prototype.wa;Hk.prototype.getLogo=Hk.prototype.ua;Hk.prototype.getProjection=Hk.prototype.xa;Hk.prototype.getState=Hk.prototype.V;Hk.prototype.refresh=Hk.prototype.sa;Hk.prototype.setAttributions=Hk.prototype.oa;Hk.prototype.get=Hk.prototype.get;Hk.prototype.getKeys=Hk.prototype.N;Hk.prototype.getProperties=Hk.prototype.O;Hk.prototype.set=Hk.prototype.set;Hk.prototype.setProperties=Hk.prototype.G;
Hk.prototype.unset=Hk.prototype.P;Hk.prototype.changed=Hk.prototype.u;Hk.prototype.dispatchEvent=Hk.prototype.b;Hk.prototype.getRevision=Hk.prototype.K;Hk.prototype.on=Hk.prototype.I;Hk.prototype.once=Hk.prototype.L;Hk.prototype.un=Hk.prototype.J;Hk.prototype.unByKey=Hk.prototype.M;zv.prototype.getAttributions=zv.prototype.wa;zv.prototype.getLogo=zv.prototype.ua;zv.prototype.getProjection=zv.prototype.xa;zv.prototype.getState=zv.prototype.V;zv.prototype.refresh=zv.prototype.sa;
zv.prototype.setAttributions=zv.prototype.oa;zv.prototype.get=zv.prototype.get;zv.prototype.getKeys=zv.prototype.N;zv.prototype.getProperties=zv.prototype.O;zv.prototype.set=zv.prototype.set;zv.prototype.setProperties=zv.prototype.G;zv.prototype.unset=zv.prototype.P;zv.prototype.changed=zv.prototype.u;zv.prototype.dispatchEvent=zv.prototype.b;zv.prototype.getRevision=zv.prototype.K;zv.prototype.on=zv.prototype.I;zv.prototype.once=zv.prototype.L;zv.prototype.un=zv.prototype.J;
zv.prototype.unByKey=zv.prototype.M;Ck.prototype.type=Ck.prototype.type;Ck.prototype.target=Ck.prototype.target;Ck.prototype.preventDefault=Ck.prototype.preventDefault;Ck.prototype.stopPropagation=Ck.prototype.stopPropagation;Av.prototype.getAttributions=Av.prototype.wa;Av.prototype.getLogo=Av.prototype.ua;Av.prototype.getProjection=Av.prototype.xa;Av.prototype.getState=Av.prototype.V;Av.prototype.refresh=Av.prototype.sa;Av.prototype.setAttributions=Av.prototype.oa;Av.prototype.get=Av.prototype.get;
Av.prototype.getKeys=Av.prototype.N;Av.prototype.getProperties=Av.prototype.O;Av.prototype.set=Av.prototype.set;Av.prototype.setProperties=Av.prototype.G;Av.prototype.unset=Av.prototype.P;Av.prototype.changed=Av.prototype.u;Av.prototype.dispatchEvent=Av.prototype.b;Av.prototype.getRevision=Av.prototype.K;Av.prototype.on=Av.prototype.I;Av.prototype.once=Av.prototype.L;Av.prototype.un=Av.prototype.J;Av.prototype.unByKey=Av.prototype.M;yl.prototype.getAttributions=yl.prototype.wa;
yl.prototype.getLogo=yl.prototype.ua;yl.prototype.getProjection=yl.prototype.xa;yl.prototype.getState=yl.prototype.V;yl.prototype.refresh=yl.prototype.sa;yl.prototype.setAttributions=yl.prototype.oa;yl.prototype.get=yl.prototype.get;yl.prototype.getKeys=yl.prototype.N;yl.prototype.getProperties=yl.prototype.O;yl.prototype.set=yl.prototype.set;yl.prototype.setProperties=yl.prototype.G;yl.prototype.unset=yl.prototype.P;yl.prototype.changed=yl.prototype.u;yl.prototype.dispatchEvent=yl.prototype.b;
yl.prototype.getRevision=yl.prototype.K;yl.prototype.on=yl.prototype.I;yl.prototype.once=yl.prototype.L;yl.prototype.un=yl.prototype.J;yl.prototype.unByKey=yl.prototype.M;Bv.prototype.getAttributions=Bv.prototype.wa;Bv.prototype.getLogo=Bv.prototype.ua;Bv.prototype.getProjection=Bv.prototype.xa;Bv.prototype.getState=Bv.prototype.V;Bv.prototype.refresh=Bv.prototype.sa;Bv.prototype.setAttributions=Bv.prototype.oa;Bv.prototype.get=Bv.prototype.get;Bv.prototype.getKeys=Bv.prototype.N;
Bv.prototype.getProperties=Bv.prototype.O;Bv.prototype.set=Bv.prototype.set;Bv.prototype.setProperties=Bv.prototype.G;Bv.prototype.unset=Bv.prototype.P;Bv.prototype.changed=Bv.prototype.u;Bv.prototype.dispatchEvent=Bv.prototype.b;Bv.prototype.getRevision=Bv.prototype.K;Bv.prototype.on=Bv.prototype.I;Bv.prototype.once=Bv.prototype.L;Bv.prototype.un=Bv.prototype.J;Bv.prototype.unByKey=Bv.prototype.M;Fv.prototype.setRenderReprojectionEdges=Fv.prototype.zb;Fv.prototype.setTileGridForProjection=Fv.prototype.Ab;
Fv.prototype.getTileLoadFunction=Fv.prototype.fb;Fv.prototype.getTileUrlFunction=Fv.prototype.gb;Fv.prototype.getUrls=Fv.prototype.hb;Fv.prototype.setTileLoadFunction=Fv.prototype.kb;Fv.prototype.setTileUrlFunction=Fv.prototype.Qa;Fv.prototype.setUrl=Fv.prototype.Va;Fv.prototype.setUrls=Fv.prototype.bb;Fv.prototype.getTileGrid=Fv.prototype.Na;Fv.prototype.refresh=Fv.prototype.sa;Fv.prototype.getAttributions=Fv.prototype.wa;Fv.prototype.getLogo=Fv.prototype.ua;Fv.prototype.getProjection=Fv.prototype.xa;
Fv.prototype.getState=Fv.prototype.V;Fv.prototype.setAttributions=Fv.prototype.oa;Fv.prototype.get=Fv.prototype.get;Fv.prototype.getKeys=Fv.prototype.N;Fv.prototype.getProperties=Fv.prototype.O;Fv.prototype.set=Fv.prototype.set;Fv.prototype.setProperties=Fv.prototype.G;Fv.prototype.unset=Fv.prototype.P;Fv.prototype.changed=Fv.prototype.u;Fv.prototype.dispatchEvent=Fv.prototype.b;Fv.prototype.getRevision=Fv.prototype.K;Fv.prototype.on=Fv.prototype.I;Fv.prototype.once=Fv.prototype.L;
Fv.prototype.un=Fv.prototype.J;Fv.prototype.unByKey=Fv.prototype.M;Hv.prototype.getAttributions=Hv.prototype.wa;Hv.prototype.getLogo=Hv.prototype.ua;Hv.prototype.getProjection=Hv.prototype.xa;Hv.prototype.getState=Hv.prototype.V;Hv.prototype.refresh=Hv.prototype.sa;Hv.prototype.setAttributions=Hv.prototype.oa;Hv.prototype.get=Hv.prototype.get;Hv.prototype.getKeys=Hv.prototype.N;Hv.prototype.getProperties=Hv.prototype.O;Hv.prototype.set=Hv.prototype.set;Hv.prototype.setProperties=Hv.prototype.G;
Hv.prototype.unset=Hv.prototype.P;Hv.prototype.changed=Hv.prototype.u;Hv.prototype.dispatchEvent=Hv.prototype.b;Hv.prototype.getRevision=Hv.prototype.K;Hv.prototype.on=Hv.prototype.I;Hv.prototype.once=Hv.prototype.L;Hv.prototype.un=Hv.prototype.J;Hv.prototype.unByKey=Hv.prototype.M;Mv.prototype.type=Mv.prototype.type;Mv.prototype.target=Mv.prototype.target;Mv.prototype.preventDefault=Mv.prototype.preventDefault;Mv.prototype.stopPropagation=Mv.prototype.stopPropagation;
Rv.prototype.setRenderReprojectionEdges=Rv.prototype.zb;Rv.prototype.setTileGridForProjection=Rv.prototype.Ab;Rv.prototype.getTileLoadFunction=Rv.prototype.fb;Rv.prototype.getTileUrlFunction=Rv.prototype.gb;Rv.prototype.getUrls=Rv.prototype.hb;Rv.prototype.setTileLoadFunction=Rv.prototype.kb;Rv.prototype.setTileUrlFunction=Rv.prototype.Qa;Rv.prototype.setUrl=Rv.prototype.Va;Rv.prototype.setUrls=Rv.prototype.bb;Rv.prototype.getTileGrid=Rv.prototype.Na;Rv.prototype.refresh=Rv.prototype.sa;
Rv.prototype.getAttributions=Rv.prototype.wa;Rv.prototype.getLogo=Rv.prototype.ua;Rv.prototype.getProjection=Rv.prototype.xa;Rv.prototype.getState=Rv.prototype.V;Rv.prototype.setAttributions=Rv.prototype.oa;Rv.prototype.get=Rv.prototype.get;Rv.prototype.getKeys=Rv.prototype.N;Rv.prototype.getProperties=Rv.prototype.O;Rv.prototype.set=Rv.prototype.set;Rv.prototype.setProperties=Rv.prototype.G;Rv.prototype.unset=Rv.prototype.P;Rv.prototype.changed=Rv.prototype.u;Rv.prototype.dispatchEvent=Rv.prototype.b;
Rv.prototype.getRevision=Rv.prototype.K;Rv.prototype.on=Rv.prototype.I;Rv.prototype.once=Rv.prototype.L;Rv.prototype.un=Rv.prototype.J;Rv.prototype.unByKey=Rv.prototype.M;Tv.prototype.setRenderReprojectionEdges=Tv.prototype.zb;Tv.prototype.setTileGridForProjection=Tv.prototype.Ab;Tv.prototype.getTileLoadFunction=Tv.prototype.fb;Tv.prototype.getTileUrlFunction=Tv.prototype.gb;Tv.prototype.getUrls=Tv.prototype.hb;Tv.prototype.setTileLoadFunction=Tv.prototype.kb;Tv.prototype.setTileUrlFunction=Tv.prototype.Qa;
Tv.prototype.setUrl=Tv.prototype.Va;Tv.prototype.setUrls=Tv.prototype.bb;Tv.prototype.getTileGrid=Tv.prototype.Na;Tv.prototype.refresh=Tv.prototype.sa;Tv.prototype.getAttributions=Tv.prototype.wa;Tv.prototype.getLogo=Tv.prototype.ua;Tv.prototype.getProjection=Tv.prototype.xa;Tv.prototype.getState=Tv.prototype.V;Tv.prototype.setAttributions=Tv.prototype.oa;Tv.prototype.get=Tv.prototype.get;Tv.prototype.getKeys=Tv.prototype.N;Tv.prototype.getProperties=Tv.prototype.O;Tv.prototype.set=Tv.prototype.set;
Tv.prototype.setProperties=Tv.prototype.G;Tv.prototype.unset=Tv.prototype.P;Tv.prototype.changed=Tv.prototype.u;Tv.prototype.dispatchEvent=Tv.prototype.b;Tv.prototype.getRevision=Tv.prototype.K;Tv.prototype.on=Tv.prototype.I;Tv.prototype.once=Tv.prototype.L;Tv.prototype.un=Tv.prototype.J;Tv.prototype.unByKey=Tv.prototype.M;Vv.prototype.getTileGrid=Vv.prototype.Na;Vv.prototype.refresh=Vv.prototype.sa;Vv.prototype.getAttributions=Vv.prototype.wa;Vv.prototype.getLogo=Vv.prototype.ua;
Vv.prototype.getProjection=Vv.prototype.xa;Vv.prototype.getState=Vv.prototype.V;Vv.prototype.setAttributions=Vv.prototype.oa;Vv.prototype.get=Vv.prototype.get;Vv.prototype.getKeys=Vv.prototype.N;Vv.prototype.getProperties=Vv.prototype.O;Vv.prototype.set=Vv.prototype.set;Vv.prototype.setProperties=Vv.prototype.G;Vv.prototype.unset=Vv.prototype.P;Vv.prototype.changed=Vv.prototype.u;Vv.prototype.dispatchEvent=Vv.prototype.b;Vv.prototype.getRevision=Vv.prototype.K;Vv.prototype.on=Vv.prototype.I;
Vv.prototype.once=Vv.prototype.L;Vv.prototype.un=Vv.prototype.J;Vv.prototype.unByKey=Vv.prototype.M;Wv.prototype.setRenderReprojectionEdges=Wv.prototype.zb;Wv.prototype.setTileGridForProjection=Wv.prototype.Ab;Wv.prototype.getTileLoadFunction=Wv.prototype.fb;Wv.prototype.getTileUrlFunction=Wv.prototype.gb;Wv.prototype.getUrls=Wv.prototype.hb;Wv.prototype.setTileLoadFunction=Wv.prototype.kb;Wv.prototype.setTileUrlFunction=Wv.prototype.Qa;Wv.prototype.setUrl=Wv.prototype.Va;Wv.prototype.setUrls=Wv.prototype.bb;
Wv.prototype.getTileGrid=Wv.prototype.Na;Wv.prototype.refresh=Wv.prototype.sa;Wv.prototype.getAttributions=Wv.prototype.wa;Wv.prototype.getLogo=Wv.prototype.ua;Wv.prototype.getProjection=Wv.prototype.xa;Wv.prototype.getState=Wv.prototype.V;Wv.prototype.setAttributions=Wv.prototype.oa;Wv.prototype.get=Wv.prototype.get;Wv.prototype.getKeys=Wv.prototype.N;Wv.prototype.getProperties=Wv.prototype.O;Wv.prototype.set=Wv.prototype.set;Wv.prototype.setProperties=Wv.prototype.G;Wv.prototype.unset=Wv.prototype.P;
Wv.prototype.changed=Wv.prototype.u;Wv.prototype.dispatchEvent=Wv.prototype.b;Wv.prototype.getRevision=Wv.prototype.K;Wv.prototype.on=Wv.prototype.I;Wv.prototype.once=Wv.prototype.L;Wv.prototype.un=Wv.prototype.J;Wv.prototype.unByKey=Wv.prototype.M;Df.prototype.type=Df.prototype.type;Df.prototype.target=Df.prototype.target;Df.prototype.preventDefault=Df.prototype.preventDefault;Df.prototype.stopPropagation=Df.prototype.stopPropagation;Xv.prototype.getTileGrid=Xv.prototype.Na;
Xv.prototype.refresh=Xv.prototype.sa;Xv.prototype.getAttributions=Xv.prototype.wa;Xv.prototype.getLogo=Xv.prototype.ua;Xv.prototype.getProjection=Xv.prototype.xa;Xv.prototype.getState=Xv.prototype.V;Xv.prototype.setAttributions=Xv.prototype.oa;Xv.prototype.get=Xv.prototype.get;Xv.prototype.getKeys=Xv.prototype.N;Xv.prototype.getProperties=Xv.prototype.O;Xv.prototype.set=Xv.prototype.set;Xv.prototype.setProperties=Xv.prototype.G;Xv.prototype.unset=Xv.prototype.P;Xv.prototype.changed=Xv.prototype.u;
Xv.prototype.dispatchEvent=Xv.prototype.b;Xv.prototype.getRevision=Xv.prototype.K;Xv.prototype.on=Xv.prototype.I;Xv.prototype.once=Xv.prototype.L;Xv.prototype.un=Xv.prototype.J;Xv.prototype.unByKey=Xv.prototype.M;aw.prototype.setRenderReprojectionEdges=aw.prototype.zb;aw.prototype.setTileGridForProjection=aw.prototype.Ab;aw.prototype.getTileLoadFunction=aw.prototype.fb;aw.prototype.getTileUrlFunction=aw.prototype.gb;aw.prototype.getUrls=aw.prototype.hb;aw.prototype.setTileLoadFunction=aw.prototype.kb;
aw.prototype.setTileUrlFunction=aw.prototype.Qa;aw.prototype.setUrl=aw.prototype.Va;aw.prototype.setUrls=aw.prototype.bb;aw.prototype.getTileGrid=aw.prototype.Na;aw.prototype.refresh=aw.prototype.sa;aw.prototype.getAttributions=aw.prototype.wa;aw.prototype.getLogo=aw.prototype.ua;aw.prototype.getProjection=aw.prototype.xa;aw.prototype.getState=aw.prototype.V;aw.prototype.setAttributions=aw.prototype.oa;aw.prototype.get=aw.prototype.get;aw.prototype.getKeys=aw.prototype.N;
aw.prototype.getProperties=aw.prototype.O;aw.prototype.set=aw.prototype.set;aw.prototype.setProperties=aw.prototype.G;aw.prototype.unset=aw.prototype.P;aw.prototype.changed=aw.prototype.u;aw.prototype.dispatchEvent=aw.prototype.b;aw.prototype.getRevision=aw.prototype.K;aw.prototype.on=aw.prototype.I;aw.prototype.once=aw.prototype.L;aw.prototype.un=aw.prototype.J;aw.prototype.unByKey=aw.prototype.M;vl.prototype.type=vl.prototype.type;vl.prototype.target=vl.prototype.target;
vl.prototype.preventDefault=vl.prototype.preventDefault;vl.prototype.stopPropagation=vl.prototype.stopPropagation;Kl.prototype.getTileLoadFunction=Kl.prototype.fb;Kl.prototype.getTileUrlFunction=Kl.prototype.gb;Kl.prototype.getUrls=Kl.prototype.hb;Kl.prototype.setTileLoadFunction=Kl.prototype.kb;Kl.prototype.setTileUrlFunction=Kl.prototype.Qa;Kl.prototype.setUrl=Kl.prototype.Va;Kl.prototype.setUrls=Kl.prototype.bb;Kl.prototype.getTileGrid=Kl.prototype.Na;Kl.prototype.refresh=Kl.prototype.sa;
Kl.prototype.getAttributions=Kl.prototype.wa;Kl.prototype.getLogo=Kl.prototype.ua;Kl.prototype.getProjection=Kl.prototype.xa;Kl.prototype.getState=Kl.prototype.V;Kl.prototype.setAttributions=Kl.prototype.oa;Kl.prototype.get=Kl.prototype.get;Kl.prototype.getKeys=Kl.prototype.N;Kl.prototype.getProperties=Kl.prototype.O;Kl.prototype.set=Kl.prototype.set;Kl.prototype.setProperties=Kl.prototype.G;Kl.prototype.unset=Kl.prototype.P;Kl.prototype.changed=Kl.prototype.u;Kl.prototype.dispatchEvent=Kl.prototype.b;
Kl.prototype.getRevision=Kl.prototype.K;Kl.prototype.on=Kl.prototype.I;Kl.prototype.once=Kl.prototype.L;Kl.prototype.un=Kl.prototype.J;Kl.prototype.unByKey=Kl.prototype.M;Z.prototype.setRenderReprojectionEdges=Z.prototype.zb;Z.prototype.setTileGridForProjection=Z.prototype.Ab;Z.prototype.getTileLoadFunction=Z.prototype.fb;Z.prototype.getTileUrlFunction=Z.prototype.gb;Z.prototype.getUrls=Z.prototype.hb;Z.prototype.setTileLoadFunction=Z.prototype.kb;Z.prototype.setTileUrlFunction=Z.prototype.Qa;
Z.prototype.setUrl=Z.prototype.Va;Z.prototype.setUrls=Z.prototype.bb;Z.prototype.getTileGrid=Z.prototype.Na;Z.prototype.refresh=Z.prototype.sa;Z.prototype.getAttributions=Z.prototype.wa;Z.prototype.getLogo=Z.prototype.ua;Z.prototype.getProjection=Z.prototype.xa;Z.prototype.getState=Z.prototype.V;Z.prototype.setAttributions=Z.prototype.oa;Z.prototype.get=Z.prototype.get;Z.prototype.getKeys=Z.prototype.N;Z.prototype.getProperties=Z.prototype.O;Z.prototype.set=Z.prototype.set;
Z.prototype.setProperties=Z.prototype.G;Z.prototype.unset=Z.prototype.P;Z.prototype.changed=Z.prototype.u;Z.prototype.dispatchEvent=Z.prototype.b;Z.prototype.getRevision=Z.prototype.K;Z.prototype.on=Z.prototype.I;Z.prototype.once=Z.prototype.L;Z.prototype.un=Z.prototype.J;Z.prototype.unByKey=Z.prototype.M;iw.prototype.setRenderReprojectionEdges=iw.prototype.zb;iw.prototype.setTileGridForProjection=iw.prototype.Ab;iw.prototype.getTileLoadFunction=iw.prototype.fb;iw.prototype.getTileUrlFunction=iw.prototype.gb;
iw.prototype.getUrls=iw.prototype.hb;iw.prototype.setTileLoadFunction=iw.prototype.kb;iw.prototype.setTileUrlFunction=iw.prototype.Qa;iw.prototype.setUrl=iw.prototype.Va;iw.prototype.setUrls=iw.prototype.bb;iw.prototype.getTileGrid=iw.prototype.Na;iw.prototype.refresh=iw.prototype.sa;iw.prototype.getAttributions=iw.prototype.wa;iw.prototype.getLogo=iw.prototype.ua;iw.prototype.getProjection=iw.prototype.xa;iw.prototype.getState=iw.prototype.V;iw.prototype.setAttributions=iw.prototype.oa;
iw.prototype.get=iw.prototype.get;iw.prototype.getKeys=iw.prototype.N;iw.prototype.getProperties=iw.prototype.O;iw.prototype.set=iw.prototype.set;iw.prototype.setProperties=iw.prototype.G;iw.prototype.unset=iw.prototype.P;iw.prototype.changed=iw.prototype.u;iw.prototype.dispatchEvent=iw.prototype.b;iw.prototype.getRevision=iw.prototype.K;iw.prototype.on=iw.prototype.I;iw.prototype.once=iw.prototype.L;iw.prototype.un=iw.prototype.J;iw.prototype.unByKey=iw.prototype.M;lv.prototype.getTileCoord=lv.prototype.i;
lv.prototype.load=lv.prototype.load;th.prototype.changed=th.prototype.u;th.prototype.dispatchEvent=th.prototype.b;th.prototype.getRevision=th.prototype.K;th.prototype.on=th.prototype.I;th.prototype.once=th.prototype.L;th.prototype.un=th.prototype.J;th.prototype.unByKey=th.prototype.M;Gm.prototype.changed=Gm.prototype.u;Gm.prototype.dispatchEvent=Gm.prototype.b;Gm.prototype.getRevision=Gm.prototype.K;Gm.prototype.on=Gm.prototype.I;Gm.prototype.once=Gm.prototype.L;Gm.prototype.un=Gm.prototype.J;
Gm.prototype.unByKey=Gm.prototype.M;Jm.prototype.changed=Jm.prototype.u;Jm.prototype.dispatchEvent=Jm.prototype.b;Jm.prototype.getRevision=Jm.prototype.K;Jm.prototype.on=Jm.prototype.I;Jm.prototype.once=Jm.prototype.L;Jm.prototype.un=Jm.prototype.J;Jm.prototype.unByKey=Jm.prototype.M;Pm.prototype.changed=Pm.prototype.u;Pm.prototype.dispatchEvent=Pm.prototype.b;Pm.prototype.getRevision=Pm.prototype.K;Pm.prototype.on=Pm.prototype.I;Pm.prototype.once=Pm.prototype.L;Pm.prototype.un=Pm.prototype.J;
Pm.prototype.unByKey=Pm.prototype.M;Rm.prototype.changed=Rm.prototype.u;Rm.prototype.dispatchEvent=Rm.prototype.b;Rm.prototype.getRevision=Rm.prototype.K;Rm.prototype.on=Rm.prototype.I;Rm.prototype.once=Rm.prototype.L;Rm.prototype.un=Rm.prototype.J;Rm.prototype.unByKey=Rm.prototype.M;Sl.prototype.changed=Sl.prototype.u;Sl.prototype.dispatchEvent=Sl.prototype.b;Sl.prototype.getRevision=Sl.prototype.K;Sl.prototype.on=Sl.prototype.I;Sl.prototype.once=Sl.prototype.L;Sl.prototype.un=Sl.prototype.J;
Sl.prototype.unByKey=Sl.prototype.M;Tl.prototype.changed=Tl.prototype.u;Tl.prototype.dispatchEvent=Tl.prototype.b;Tl.prototype.getRevision=Tl.prototype.K;Tl.prototype.on=Tl.prototype.I;Tl.prototype.once=Tl.prototype.L;Tl.prototype.un=Tl.prototype.J;Tl.prototype.unByKey=Tl.prototype.M;Ul.prototype.changed=Ul.prototype.u;Ul.prototype.dispatchEvent=Ul.prototype.b;Ul.prototype.getRevision=Ul.prototype.K;Ul.prototype.on=Ul.prototype.I;Ul.prototype.once=Ul.prototype.L;Ul.prototype.un=Ul.prototype.J;
Ul.prototype.unByKey=Ul.prototype.M;Wl.prototype.changed=Wl.prototype.u;Wl.prototype.dispatchEvent=Wl.prototype.b;Wl.prototype.getRevision=Wl.prototype.K;Wl.prototype.on=Wl.prototype.I;Wl.prototype.once=Wl.prototype.L;Wl.prototype.un=Wl.prototype.J;Wl.prototype.unByKey=Wl.prototype.M;Jj.prototype.changed=Jj.prototype.u;Jj.prototype.dispatchEvent=Jj.prototype.b;Jj.prototype.getRevision=Jj.prototype.K;Jj.prototype.on=Jj.prototype.I;Jj.prototype.once=Jj.prototype.L;Jj.prototype.un=Jj.prototype.J;
Jj.prototype.unByKey=Jj.prototype.M;Al.prototype.changed=Al.prototype.u;Al.prototype.dispatchEvent=Al.prototype.b;Al.prototype.getRevision=Al.prototype.K;Al.prototype.on=Al.prototype.I;Al.prototype.once=Al.prototype.L;Al.prototype.un=Al.prototype.J;Al.prototype.unByKey=Al.prototype.M;Bl.prototype.changed=Bl.prototype.u;Bl.prototype.dispatchEvent=Bl.prototype.b;Bl.prototype.getRevision=Bl.prototype.K;Bl.prototype.on=Bl.prototype.I;Bl.prototype.once=Bl.prototype.L;Bl.prototype.un=Bl.prototype.J;
Bl.prototype.unByKey=Bl.prototype.M;Dl.prototype.changed=Dl.prototype.u;Dl.prototype.dispatchEvent=Dl.prototype.b;Dl.prototype.getRevision=Dl.prototype.K;Dl.prototype.on=Dl.prototype.I;Dl.prototype.once=Dl.prototype.L;Dl.prototype.un=Dl.prototype.J;Dl.prototype.unByKey=Dl.prototype.M;Ol.prototype.changed=Ol.prototype.u;Ol.prototype.dispatchEvent=Ol.prototype.b;Ol.prototype.getRevision=Ol.prototype.K;Ol.prototype.on=Ol.prototype.I;Ol.prototype.once=Ol.prototype.L;Ol.prototype.un=Ol.prototype.J;
Ol.prototype.unByKey=Ol.prototype.M;lh.prototype.type=lh.prototype.type;lh.prototype.target=lh.prototype.target;lh.prototype.preventDefault=lh.prototype.preventDefault;lh.prototype.stopPropagation=lh.prototype.stopPropagation;Wf.prototype.type=Wf.prototype.type;Wf.prototype.target=Wf.prototype.target;Wf.prototype.preventDefault=Wf.prototype.preventDefault;Wf.prototype.stopPropagation=Wf.prototype.stopPropagation;ih.prototype.get=ih.prototype.get;ih.prototype.getKeys=ih.prototype.N;
ih.prototype.getProperties=ih.prototype.O;ih.prototype.set=ih.prototype.set;ih.prototype.setProperties=ih.prototype.G;ih.prototype.unset=ih.prototype.P;ih.prototype.changed=ih.prototype.u;ih.prototype.dispatchEvent=ih.prototype.b;ih.prototype.getRevision=ih.prototype.K;ih.prototype.on=ih.prototype.I;ih.prototype.once=ih.prototype.L;ih.prototype.un=ih.prototype.J;ih.prototype.unByKey=ih.prototype.M;mh.prototype.getExtent=mh.prototype.H;mh.prototype.getMaxResolution=mh.prototype.Nb;
mh.prototype.getMinResolution=mh.prototype.Ob;mh.prototype.getOpacity=mh.prototype.Pb;mh.prototype.getVisible=mh.prototype.xb;mh.prototype.getZIndex=mh.prototype.Qb;mh.prototype.setExtent=mh.prototype.fc;mh.prototype.setMaxResolution=mh.prototype.nc;mh.prototype.setMinResolution=mh.prototype.oc;mh.prototype.setOpacity=mh.prototype.gc;mh.prototype.setVisible=mh.prototype.hc;mh.prototype.setZIndex=mh.prototype.ic;mh.prototype.get=mh.prototype.get;mh.prototype.getKeys=mh.prototype.N;
mh.prototype.getProperties=mh.prototype.O;mh.prototype.set=mh.prototype.set;mh.prototype.setProperties=mh.prototype.G;mh.prototype.unset=mh.prototype.P;mh.prototype.changed=mh.prototype.u;mh.prototype.dispatchEvent=mh.prototype.b;mh.prototype.getRevision=mh.prototype.K;mh.prototype.on=mh.prototype.I;mh.prototype.once=mh.prototype.L;mh.prototype.un=mh.prototype.J;mh.prototype.unByKey=mh.prototype.M;G.prototype.setMap=G.prototype.setMap;G.prototype.setSource=G.prototype.Fc;G.prototype.getExtent=G.prototype.H;
G.prototype.getMaxResolution=G.prototype.Nb;G.prototype.getMinResolution=G.prototype.Ob;G.prototype.getOpacity=G.prototype.Pb;G.prototype.getVisible=G.prototype.xb;G.prototype.getZIndex=G.prototype.Qb;G.prototype.setExtent=G.prototype.fc;G.prototype.setMaxResolution=G.prototype.nc;G.prototype.setMinResolution=G.prototype.oc;G.prototype.setOpacity=G.prototype.gc;G.prototype.setVisible=G.prototype.hc;G.prototype.setZIndex=G.prototype.ic;G.prototype.get=G.prototype.get;G.prototype.getKeys=G.prototype.N;
G.prototype.getProperties=G.prototype.O;G.prototype.set=G.prototype.set;G.prototype.setProperties=G.prototype.G;G.prototype.unset=G.prototype.P;G.prototype.changed=G.prototype.u;G.prototype.dispatchEvent=G.prototype.b;G.prototype.getRevision=G.prototype.K;G.prototype.on=G.prototype.I;G.prototype.once=G.prototype.L;G.prototype.un=G.prototype.J;G.prototype.unByKey=G.prototype.M;V.prototype.getSource=V.prototype.ha;V.prototype.getStyle=V.prototype.C;V.prototype.getStyleFunction=V.prototype.D;
V.prototype.setStyle=V.prototype.l;V.prototype.setMap=V.prototype.setMap;V.prototype.setSource=V.prototype.Fc;V.prototype.getExtent=V.prototype.H;V.prototype.getMaxResolution=V.prototype.Nb;V.prototype.getMinResolution=V.prototype.Ob;V.prototype.getOpacity=V.prototype.Pb;V.prototype.getVisible=V.prototype.xb;V.prototype.getZIndex=V.prototype.Qb;V.prototype.setExtent=V.prototype.fc;V.prototype.setMaxResolution=V.prototype.nc;V.prototype.setMinResolution=V.prototype.oc;V.prototype.setOpacity=V.prototype.gc;
V.prototype.setVisible=V.prototype.hc;V.prototype.setZIndex=V.prototype.ic;V.prototype.get=V.prototype.get;V.prototype.getKeys=V.prototype.N;V.prototype.getProperties=V.prototype.O;V.prototype.set=V.prototype.set;V.prototype.setProperties=V.prototype.G;V.prototype.unset=V.prototype.P;V.prototype.changed=V.prototype.u;V.prototype.dispatchEvent=V.prototype.b;V.prototype.getRevision=V.prototype.K;V.prototype.on=V.prototype.I;V.prototype.once=V.prototype.L;V.prototype.un=V.prototype.J;
V.prototype.unByKey=V.prototype.M;cj.prototype.setMap=cj.prototype.setMap;cj.prototype.setSource=cj.prototype.Fc;cj.prototype.getExtent=cj.prototype.H;cj.prototype.getMaxResolution=cj.prototype.Nb;cj.prototype.getMinResolution=cj.prototype.Ob;cj.prototype.getOpacity=cj.prototype.Pb;cj.prototype.getVisible=cj.prototype.xb;cj.prototype.getZIndex=cj.prototype.Qb;cj.prototype.setExtent=cj.prototype.fc;cj.prototype.setMaxResolution=cj.prototype.nc;cj.prototype.setMinResolution=cj.prototype.oc;
cj.prototype.setOpacity=cj.prototype.gc;cj.prototype.setVisible=cj.prototype.hc;cj.prototype.setZIndex=cj.prototype.ic;cj.prototype.get=cj.prototype.get;cj.prototype.getKeys=cj.prototype.N;cj.prototype.getProperties=cj.prototype.O;cj.prototype.set=cj.prototype.set;cj.prototype.setProperties=cj.prototype.G;cj.prototype.unset=cj.prototype.P;cj.prototype.changed=cj.prototype.u;cj.prototype.dispatchEvent=cj.prototype.b;cj.prototype.getRevision=cj.prototype.K;cj.prototype.on=cj.prototype.I;
cj.prototype.once=cj.prototype.L;cj.prototype.un=cj.prototype.J;cj.prototype.unByKey=cj.prototype.M;Ti.prototype.getExtent=Ti.prototype.H;Ti.prototype.getMaxResolution=Ti.prototype.Nb;Ti.prototype.getMinResolution=Ti.prototype.Ob;Ti.prototype.getOpacity=Ti.prototype.Pb;Ti.prototype.getVisible=Ti.prototype.xb;Ti.prototype.getZIndex=Ti.prototype.Qb;Ti.prototype.setExtent=Ti.prototype.fc;Ti.prototype.setMaxResolution=Ti.prototype.nc;Ti.prototype.setMinResolution=Ti.prototype.oc;
Ti.prototype.setOpacity=Ti.prototype.gc;Ti.prototype.setVisible=Ti.prototype.hc;Ti.prototype.setZIndex=Ti.prototype.ic;Ti.prototype.get=Ti.prototype.get;Ti.prototype.getKeys=Ti.prototype.N;Ti.prototype.getProperties=Ti.prototype.O;Ti.prototype.set=Ti.prototype.set;Ti.prototype.setProperties=Ti.prototype.G;Ti.prototype.unset=Ti.prototype.P;Ti.prototype.changed=Ti.prototype.u;Ti.prototype.dispatchEvent=Ti.prototype.b;Ti.prototype.getRevision=Ti.prototype.K;Ti.prototype.on=Ti.prototype.I;
Ti.prototype.once=Ti.prototype.L;Ti.prototype.un=Ti.prototype.J;Ti.prototype.unByKey=Ti.prototype.M;dj.prototype.setMap=dj.prototype.setMap;dj.prototype.setSource=dj.prototype.Fc;dj.prototype.getExtent=dj.prototype.H;dj.prototype.getMaxResolution=dj.prototype.Nb;dj.prototype.getMinResolution=dj.prototype.Ob;dj.prototype.getOpacity=dj.prototype.Pb;dj.prototype.getVisible=dj.prototype.xb;dj.prototype.getZIndex=dj.prototype.Qb;dj.prototype.setExtent=dj.prototype.fc;dj.prototype.setMaxResolution=dj.prototype.nc;
dj.prototype.setMinResolution=dj.prototype.oc;dj.prototype.setOpacity=dj.prototype.gc;dj.prototype.setVisible=dj.prototype.hc;dj.prototype.setZIndex=dj.prototype.ic;dj.prototype.get=dj.prototype.get;dj.prototype.getKeys=dj.prototype.N;dj.prototype.getProperties=dj.prototype.O;dj.prototype.set=dj.prototype.set;dj.prototype.setProperties=dj.prototype.G;dj.prototype.unset=dj.prototype.P;dj.prototype.changed=dj.prototype.u;dj.prototype.dispatchEvent=dj.prototype.b;dj.prototype.getRevision=dj.prototype.K;
dj.prototype.on=dj.prototype.I;dj.prototype.once=dj.prototype.L;dj.prototype.un=dj.prototype.J;dj.prototype.unByKey=dj.prototype.M;I.prototype.getSource=I.prototype.ha;I.prototype.getStyle=I.prototype.C;I.prototype.getStyleFunction=I.prototype.D;I.prototype.setStyle=I.prototype.l;I.prototype.setMap=I.prototype.setMap;I.prototype.setSource=I.prototype.Fc;I.prototype.getExtent=I.prototype.H;I.prototype.getMaxResolution=I.prototype.Nb;I.prototype.getMinResolution=I.prototype.Ob;
I.prototype.getOpacity=I.prototype.Pb;I.prototype.getVisible=I.prototype.xb;I.prototype.getZIndex=I.prototype.Qb;I.prototype.setExtent=I.prototype.fc;I.prototype.setMaxResolution=I.prototype.nc;I.prototype.setMinResolution=I.prototype.oc;I.prototype.setOpacity=I.prototype.gc;I.prototype.setVisible=I.prototype.hc;I.prototype.setZIndex=I.prototype.ic;I.prototype.get=I.prototype.get;I.prototype.getKeys=I.prototype.N;I.prototype.getProperties=I.prototype.O;I.prototype.set=I.prototype.set;
I.prototype.setProperties=I.prototype.G;I.prototype.unset=I.prototype.P;I.prototype.changed=I.prototype.u;I.prototype.dispatchEvent=I.prototype.b;I.prototype.getRevision=I.prototype.K;I.prototype.on=I.prototype.I;I.prototype.once=I.prototype.L;I.prototype.un=I.prototype.J;I.prototype.unByKey=I.prototype.M;Vh.prototype.get=Vh.prototype.get;Vh.prototype.getKeys=Vh.prototype.N;Vh.prototype.getProperties=Vh.prototype.O;Vh.prototype.set=Vh.prototype.set;Vh.prototype.setProperties=Vh.prototype.G;
Vh.prototype.unset=Vh.prototype.P;Vh.prototype.changed=Vh.prototype.u;Vh.prototype.dispatchEvent=Vh.prototype.b;Vh.prototype.getRevision=Vh.prototype.K;Vh.prototype.on=Vh.prototype.I;Vh.prototype.once=Vh.prototype.L;Vh.prototype.un=Vh.prototype.J;Vh.prototype.unByKey=Vh.prototype.M;Zh.prototype.getActive=Zh.prototype.f;Zh.prototype.getMap=Zh.prototype.l;Zh.prototype.setActive=Zh.prototype.i;Zh.prototype.get=Zh.prototype.get;Zh.prototype.getKeys=Zh.prototype.N;Zh.prototype.getProperties=Zh.prototype.O;
Zh.prototype.set=Zh.prototype.set;Zh.prototype.setProperties=Zh.prototype.G;Zh.prototype.unset=Zh.prototype.P;Zh.prototype.changed=Zh.prototype.u;Zh.prototype.dispatchEvent=Zh.prototype.b;Zh.prototype.getRevision=Zh.prototype.K;Zh.prototype.on=Zh.prototype.I;Zh.prototype.once=Zh.prototype.L;Zh.prototype.un=Zh.prototype.J;Zh.prototype.unByKey=Zh.prototype.M;hu.prototype.getActive=hu.prototype.f;hu.prototype.getMap=hu.prototype.l;hu.prototype.setActive=hu.prototype.i;hu.prototype.get=hu.prototype.get;
hu.prototype.getKeys=hu.prototype.N;hu.prototype.getProperties=hu.prototype.O;hu.prototype.set=hu.prototype.set;hu.prototype.setProperties=hu.prototype.G;hu.prototype.unset=hu.prototype.P;hu.prototype.changed=hu.prototype.u;hu.prototype.dispatchEvent=hu.prototype.b;hu.prototype.getRevision=hu.prototype.K;hu.prototype.on=hu.prototype.I;hu.prototype.once=hu.prototype.L;hu.prototype.un=hu.prototype.J;hu.prototype.unByKey=hu.prototype.M;ku.prototype.type=ku.prototype.type;ku.prototype.target=ku.prototype.target;
ku.prototype.preventDefault=ku.prototype.preventDefault;ku.prototype.stopPropagation=ku.prototype.stopPropagation;xi.prototype.type=xi.prototype.type;xi.prototype.target=xi.prototype.target;xi.prototype.preventDefault=xi.prototype.preventDefault;xi.prototype.stopPropagation=xi.prototype.stopPropagation;ji.prototype.getActive=ji.prototype.f;ji.prototype.getMap=ji.prototype.l;ji.prototype.setActive=ji.prototype.i;ji.prototype.get=ji.prototype.get;ji.prototype.getKeys=ji.prototype.N;
ji.prototype.getProperties=ji.prototype.O;ji.prototype.set=ji.prototype.set;ji.prototype.setProperties=ji.prototype.G;ji.prototype.unset=ji.prototype.P;ji.prototype.changed=ji.prototype.u;ji.prototype.dispatchEvent=ji.prototype.b;ji.prototype.getRevision=ji.prototype.K;ji.prototype.on=ji.prototype.I;ji.prototype.once=ji.prototype.L;ji.prototype.un=ji.prototype.J;ji.prototype.unByKey=ji.prototype.M;yi.prototype.getActive=yi.prototype.f;yi.prototype.getMap=yi.prototype.l;yi.prototype.setActive=yi.prototype.i;
yi.prototype.get=yi.prototype.get;yi.prototype.getKeys=yi.prototype.N;yi.prototype.getProperties=yi.prototype.O;yi.prototype.set=yi.prototype.set;yi.prototype.setProperties=yi.prototype.G;yi.prototype.unset=yi.prototype.P;yi.prototype.changed=yi.prototype.u;yi.prototype.dispatchEvent=yi.prototype.b;yi.prototype.getRevision=yi.prototype.K;yi.prototype.on=yi.prototype.I;yi.prototype.once=yi.prototype.L;yi.prototype.un=yi.prototype.J;yi.prototype.unByKey=yi.prototype.M;mi.prototype.getActive=mi.prototype.f;
mi.prototype.getMap=mi.prototype.l;mi.prototype.setActive=mi.prototype.i;mi.prototype.get=mi.prototype.get;mi.prototype.getKeys=mi.prototype.N;mi.prototype.getProperties=mi.prototype.O;mi.prototype.set=mi.prototype.set;mi.prototype.setProperties=mi.prototype.G;mi.prototype.unset=mi.prototype.P;mi.prototype.changed=mi.prototype.u;mi.prototype.dispatchEvent=mi.prototype.b;mi.prototype.getRevision=mi.prototype.K;mi.prototype.on=mi.prototype.I;mi.prototype.once=mi.prototype.L;mi.prototype.un=mi.prototype.J;
mi.prototype.unByKey=mi.prototype.M;mu.prototype.getActive=mu.prototype.f;mu.prototype.getMap=mu.prototype.l;mu.prototype.setActive=mu.prototype.i;mu.prototype.get=mu.prototype.get;mu.prototype.getKeys=mu.prototype.N;mu.prototype.getProperties=mu.prototype.O;mu.prototype.set=mu.prototype.set;mu.prototype.setProperties=mu.prototype.G;mu.prototype.unset=mu.prototype.P;mu.prototype.changed=mu.prototype.u;mu.prototype.dispatchEvent=mu.prototype.b;mu.prototype.getRevision=mu.prototype.K;
mu.prototype.on=mu.prototype.I;mu.prototype.once=mu.prototype.L;mu.prototype.un=mu.prototype.J;mu.prototype.unByKey=mu.prototype.M;qi.prototype.getActive=qi.prototype.f;qi.prototype.getMap=qi.prototype.l;qi.prototype.setActive=qi.prototype.i;qi.prototype.get=qi.prototype.get;qi.prototype.getKeys=qi.prototype.N;qi.prototype.getProperties=qi.prototype.O;qi.prototype.set=qi.prototype.set;qi.prototype.setProperties=qi.prototype.G;qi.prototype.unset=qi.prototype.P;qi.prototype.changed=qi.prototype.u;
qi.prototype.dispatchEvent=qi.prototype.b;qi.prototype.getRevision=qi.prototype.K;qi.prototype.on=qi.prototype.I;qi.prototype.once=qi.prototype.L;qi.prototype.un=qi.prototype.J;qi.prototype.unByKey=qi.prototype.M;Di.prototype.getGeometry=Di.prototype.W;Di.prototype.getActive=Di.prototype.f;Di.prototype.getMap=Di.prototype.l;Di.prototype.setActive=Di.prototype.i;Di.prototype.get=Di.prototype.get;Di.prototype.getKeys=Di.prototype.N;Di.prototype.getProperties=Di.prototype.O;Di.prototype.set=Di.prototype.set;
Di.prototype.setProperties=Di.prototype.G;Di.prototype.unset=Di.prototype.P;Di.prototype.changed=Di.prototype.u;Di.prototype.dispatchEvent=Di.prototype.b;Di.prototype.getRevision=Di.prototype.K;Di.prototype.on=Di.prototype.I;Di.prototype.once=Di.prototype.L;Di.prototype.un=Di.prototype.J;Di.prototype.unByKey=Di.prototype.M;qu.prototype.type=qu.prototype.type;qu.prototype.target=qu.prototype.target;qu.prototype.preventDefault=qu.prototype.preventDefault;qu.prototype.stopPropagation=qu.prototype.stopPropagation;
ru.prototype.getActive=ru.prototype.f;ru.prototype.getMap=ru.prototype.l;ru.prototype.setActive=ru.prototype.i;ru.prototype.get=ru.prototype.get;ru.prototype.getKeys=ru.prototype.N;ru.prototype.getProperties=ru.prototype.O;ru.prototype.set=ru.prototype.set;ru.prototype.setProperties=ru.prototype.G;ru.prototype.unset=ru.prototype.P;ru.prototype.changed=ru.prototype.u;ru.prototype.dispatchEvent=ru.prototype.b;ru.prototype.getRevision=ru.prototype.K;ru.prototype.on=ru.prototype.I;ru.prototype.once=ru.prototype.L;
ru.prototype.un=ru.prototype.J;ru.prototype.unByKey=ru.prototype.M;Ei.prototype.getActive=Ei.prototype.f;Ei.prototype.getMap=Ei.prototype.l;Ei.prototype.setActive=Ei.prototype.i;Ei.prototype.get=Ei.prototype.get;Ei.prototype.getKeys=Ei.prototype.N;Ei.prototype.getProperties=Ei.prototype.O;Ei.prototype.set=Ei.prototype.set;Ei.prototype.setProperties=Ei.prototype.G;Ei.prototype.unset=Ei.prototype.P;Ei.prototype.changed=Ei.prototype.u;Ei.prototype.dispatchEvent=Ei.prototype.b;
Ei.prototype.getRevision=Ei.prototype.K;Ei.prototype.on=Ei.prototype.I;Ei.prototype.once=Ei.prototype.L;Ei.prototype.un=Ei.prototype.J;Ei.prototype.unByKey=Ei.prototype.M;Gi.prototype.getActive=Gi.prototype.f;Gi.prototype.getMap=Gi.prototype.l;Gi.prototype.setActive=Gi.prototype.i;Gi.prototype.get=Gi.prototype.get;Gi.prototype.getKeys=Gi.prototype.N;Gi.prototype.getProperties=Gi.prototype.O;Gi.prototype.set=Gi.prototype.set;Gi.prototype.setProperties=Gi.prototype.G;Gi.prototype.unset=Gi.prototype.P;
Gi.prototype.changed=Gi.prototype.u;Gi.prototype.dispatchEvent=Gi.prototype.b;Gi.prototype.getRevision=Gi.prototype.K;Gi.prototype.on=Gi.prototype.I;Gi.prototype.once=Gi.prototype.L;Gi.prototype.un=Gi.prototype.J;Gi.prototype.unByKey=Gi.prototype.M;Hu.prototype.type=Hu.prototype.type;Hu.prototype.target=Hu.prototype.target;Hu.prototype.preventDefault=Hu.prototype.preventDefault;Hu.prototype.stopPropagation=Hu.prototype.stopPropagation;Iu.prototype.getActive=Iu.prototype.f;Iu.prototype.getMap=Iu.prototype.l;
Iu.prototype.setActive=Iu.prototype.i;Iu.prototype.get=Iu.prototype.get;Iu.prototype.getKeys=Iu.prototype.N;Iu.prototype.getProperties=Iu.prototype.O;Iu.prototype.set=Iu.prototype.set;Iu.prototype.setProperties=Iu.prototype.G;Iu.prototype.unset=Iu.prototype.P;Iu.prototype.changed=Iu.prototype.u;Iu.prototype.dispatchEvent=Iu.prototype.b;Iu.prototype.getRevision=Iu.prototype.K;Iu.prototype.on=Iu.prototype.I;Iu.prototype.once=Iu.prototype.L;Iu.prototype.un=Iu.prototype.J;Iu.prototype.unByKey=Iu.prototype.M;
Ii.prototype.getActive=Ii.prototype.f;Ii.prototype.getMap=Ii.prototype.l;Ii.prototype.setActive=Ii.prototype.i;Ii.prototype.get=Ii.prototype.get;Ii.prototype.getKeys=Ii.prototype.N;Ii.prototype.getProperties=Ii.prototype.O;Ii.prototype.set=Ii.prototype.set;Ii.prototype.setProperties=Ii.prototype.G;Ii.prototype.unset=Ii.prototype.P;Ii.prototype.changed=Ii.prototype.u;Ii.prototype.dispatchEvent=Ii.prototype.b;Ii.prototype.getRevision=Ii.prototype.K;Ii.prototype.on=Ii.prototype.I;Ii.prototype.once=Ii.prototype.L;
Ii.prototype.un=Ii.prototype.J;Ii.prototype.unByKey=Ii.prototype.M;Ki.prototype.getActive=Ki.prototype.f;Ki.prototype.getMap=Ki.prototype.l;Ki.prototype.setActive=Ki.prototype.i;Ki.prototype.get=Ki.prototype.get;Ki.prototype.getKeys=Ki.prototype.N;Ki.prototype.getProperties=Ki.prototype.O;Ki.prototype.set=Ki.prototype.set;Ki.prototype.setProperties=Ki.prototype.G;Ki.prototype.unset=Ki.prototype.P;Ki.prototype.changed=Ki.prototype.u;Ki.prototype.dispatchEvent=Ki.prototype.b;
Ki.prototype.getRevision=Ki.prototype.K;Ki.prototype.on=Ki.prototype.I;Ki.prototype.once=Ki.prototype.L;Ki.prototype.un=Ki.prototype.J;Ki.prototype.unByKey=Ki.prototype.M;Oi.prototype.getActive=Oi.prototype.f;Oi.prototype.getMap=Oi.prototype.l;Oi.prototype.setActive=Oi.prototype.i;Oi.prototype.get=Oi.prototype.get;Oi.prototype.getKeys=Oi.prototype.N;Oi.prototype.getProperties=Oi.prototype.O;Oi.prototype.set=Oi.prototype.set;Oi.prototype.setProperties=Oi.prototype.G;Oi.prototype.unset=Oi.prototype.P;
Oi.prototype.changed=Oi.prototype.u;Oi.prototype.dispatchEvent=Oi.prototype.b;Oi.prototype.getRevision=Oi.prototype.K;Oi.prototype.on=Oi.prototype.I;Oi.prototype.once=Oi.prototype.L;Oi.prototype.un=Oi.prototype.J;Oi.prototype.unByKey=Oi.prototype.M;Vu.prototype.type=Vu.prototype.type;Vu.prototype.target=Vu.prototype.target;Vu.prototype.preventDefault=Vu.prototype.preventDefault;Vu.prototype.stopPropagation=Vu.prototype.stopPropagation;Wu.prototype.getActive=Wu.prototype.f;Wu.prototype.getMap=Wu.prototype.l;
Wu.prototype.setActive=Wu.prototype.i;Wu.prototype.get=Wu.prototype.get;Wu.prototype.getKeys=Wu.prototype.N;Wu.prototype.getProperties=Wu.prototype.O;Wu.prototype.set=Wu.prototype.set;Wu.prototype.setProperties=Wu.prototype.G;Wu.prototype.unset=Wu.prototype.P;Wu.prototype.changed=Wu.prototype.u;Wu.prototype.dispatchEvent=Wu.prototype.b;Wu.prototype.getRevision=Wu.prototype.K;Wu.prototype.on=Wu.prototype.I;Wu.prototype.once=Wu.prototype.L;Wu.prototype.un=Wu.prototype.J;Wu.prototype.unByKey=Wu.prototype.M;
Zu.prototype.getActive=Zu.prototype.f;Zu.prototype.getMap=Zu.prototype.l;Zu.prototype.setActive=Zu.prototype.i;Zu.prototype.get=Zu.prototype.get;Zu.prototype.getKeys=Zu.prototype.N;Zu.prototype.getProperties=Zu.prototype.O;Zu.prototype.set=Zu.prototype.set;Zu.prototype.setProperties=Zu.prototype.G;Zu.prototype.unset=Zu.prototype.P;Zu.prototype.changed=Zu.prototype.u;Zu.prototype.dispatchEvent=Zu.prototype.b;Zu.prototype.getRevision=Zu.prototype.K;Zu.prototype.on=Zu.prototype.I;Zu.prototype.once=Zu.prototype.L;
Zu.prototype.un=Zu.prototype.J;Zu.prototype.unByKey=Zu.prototype.M;cv.prototype.type=cv.prototype.type;cv.prototype.target=cv.prototype.target;cv.prototype.preventDefault=cv.prototype.preventDefault;cv.prototype.stopPropagation=cv.prototype.stopPropagation;dv.prototype.getActive=dv.prototype.f;dv.prototype.getMap=dv.prototype.l;dv.prototype.setActive=dv.prototype.i;dv.prototype.get=dv.prototype.get;dv.prototype.getKeys=dv.prototype.N;dv.prototype.getProperties=dv.prototype.O;dv.prototype.set=dv.prototype.set;
dv.prototype.setProperties=dv.prototype.G;dv.prototype.unset=dv.prototype.P;dv.prototype.changed=dv.prototype.u;dv.prototype.dispatchEvent=dv.prototype.b;dv.prototype.getRevision=dv.prototype.K;dv.prototype.on=dv.prototype.I;dv.prototype.once=dv.prototype.L;dv.prototype.un=dv.prototype.J;dv.prototype.unByKey=dv.prototype.M;Tc.prototype.get=Tc.prototype.get;Tc.prototype.getKeys=Tc.prototype.N;Tc.prototype.getProperties=Tc.prototype.O;Tc.prototype.set=Tc.prototype.set;Tc.prototype.setProperties=Tc.prototype.G;
Tc.prototype.unset=Tc.prototype.P;Tc.prototype.changed=Tc.prototype.u;Tc.prototype.dispatchEvent=Tc.prototype.b;Tc.prototype.getRevision=Tc.prototype.K;Tc.prototype.on=Tc.prototype.I;Tc.prototype.once=Tc.prototype.L;Tc.prototype.un=Tc.prototype.J;Tc.prototype.unByKey=Tc.prototype.M;hd.prototype.getClosestPoint=hd.prototype.vb;hd.prototype.getExtent=hd.prototype.H;hd.prototype.rotate=hd.prototype.rotate;hd.prototype.simplify=hd.prototype.Bb;hd.prototype.transform=hd.prototype.jb;hd.prototype.get=hd.prototype.get;
hd.prototype.getKeys=hd.prototype.N;hd.prototype.getProperties=hd.prototype.O;hd.prototype.set=hd.prototype.set;hd.prototype.setProperties=hd.prototype.G;hd.prototype.unset=hd.prototype.P;hd.prototype.changed=hd.prototype.u;hd.prototype.dispatchEvent=hd.prototype.b;hd.prototype.getRevision=hd.prototype.K;hd.prototype.on=hd.prototype.I;hd.prototype.once=hd.prototype.L;hd.prototype.un=hd.prototype.J;hd.prototype.unByKey=hd.prototype.M;Vt.prototype.getFirstCoordinate=Vt.prototype.Ib;
Vt.prototype.getLastCoordinate=Vt.prototype.Jb;Vt.prototype.getLayout=Vt.prototype.Kb;Vt.prototype.rotate=Vt.prototype.rotate;Vt.prototype.getClosestPoint=Vt.prototype.vb;Vt.prototype.getExtent=Vt.prototype.H;Vt.prototype.simplify=Vt.prototype.Bb;Vt.prototype.get=Vt.prototype.get;Vt.prototype.getKeys=Vt.prototype.N;Vt.prototype.getProperties=Vt.prototype.O;Vt.prototype.set=Vt.prototype.set;Vt.prototype.setProperties=Vt.prototype.G;Vt.prototype.unset=Vt.prototype.P;Vt.prototype.changed=Vt.prototype.u;
Vt.prototype.dispatchEvent=Vt.prototype.b;Vt.prototype.getRevision=Vt.prototype.K;Vt.prototype.on=Vt.prototype.I;Vt.prototype.once=Vt.prototype.L;Vt.prototype.un=Vt.prototype.J;Vt.prototype.unByKey=Vt.prototype.M;Ln.prototype.getClosestPoint=Ln.prototype.vb;Ln.prototype.getExtent=Ln.prototype.H;Ln.prototype.rotate=Ln.prototype.rotate;Ln.prototype.simplify=Ln.prototype.Bb;Ln.prototype.transform=Ln.prototype.jb;Ln.prototype.get=Ln.prototype.get;Ln.prototype.getKeys=Ln.prototype.N;
Ln.prototype.getProperties=Ln.prototype.O;Ln.prototype.set=Ln.prototype.set;Ln.prototype.setProperties=Ln.prototype.G;Ln.prototype.unset=Ln.prototype.P;Ln.prototype.changed=Ln.prototype.u;Ln.prototype.dispatchEvent=Ln.prototype.b;Ln.prototype.getRevision=Ln.prototype.K;Ln.prototype.on=Ln.prototype.I;Ln.prototype.once=Ln.prototype.L;Ln.prototype.un=Ln.prototype.J;Ln.prototype.unByKey=Ln.prototype.M;zd.prototype.getFirstCoordinate=zd.prototype.Ib;zd.prototype.getLastCoordinate=zd.prototype.Jb;
zd.prototype.getLayout=zd.prototype.Kb;zd.prototype.rotate=zd.prototype.rotate;zd.prototype.getClosestPoint=zd.prototype.vb;zd.prototype.getExtent=zd.prototype.H;zd.prototype.simplify=zd.prototype.Bb;zd.prototype.transform=zd.prototype.jb;zd.prototype.get=zd.prototype.get;zd.prototype.getKeys=zd.prototype.N;zd.prototype.getProperties=zd.prototype.O;zd.prototype.set=zd.prototype.set;zd.prototype.setProperties=zd.prototype.G;zd.prototype.unset=zd.prototype.P;zd.prototype.changed=zd.prototype.u;
zd.prototype.dispatchEvent=zd.prototype.b;zd.prototype.getRevision=zd.prototype.K;zd.prototype.on=zd.prototype.I;zd.prototype.once=zd.prototype.L;zd.prototype.un=zd.prototype.J;zd.prototype.unByKey=zd.prototype.M;R.prototype.getFirstCoordinate=R.prototype.Ib;R.prototype.getLastCoordinate=R.prototype.Jb;R.prototype.getLayout=R.prototype.Kb;R.prototype.rotate=R.prototype.rotate;R.prototype.getClosestPoint=R.prototype.vb;R.prototype.getExtent=R.prototype.H;R.prototype.simplify=R.prototype.Bb;
R.prototype.transform=R.prototype.jb;R.prototype.get=R.prototype.get;R.prototype.getKeys=R.prototype.N;R.prototype.getProperties=R.prototype.O;R.prototype.set=R.prototype.set;R.prototype.setProperties=R.prototype.G;R.prototype.unset=R.prototype.P;R.prototype.changed=R.prototype.u;R.prototype.dispatchEvent=R.prototype.b;R.prototype.getRevision=R.prototype.K;R.prototype.on=R.prototype.I;R.prototype.once=R.prototype.L;R.prototype.un=R.prototype.J;R.prototype.unByKey=R.prototype.M;
S.prototype.getFirstCoordinate=S.prototype.Ib;S.prototype.getLastCoordinate=S.prototype.Jb;S.prototype.getLayout=S.prototype.Kb;S.prototype.rotate=S.prototype.rotate;S.prototype.getClosestPoint=S.prototype.vb;S.prototype.getExtent=S.prototype.H;S.prototype.simplify=S.prototype.Bb;S.prototype.transform=S.prototype.jb;S.prototype.get=S.prototype.get;S.prototype.getKeys=S.prototype.N;S.prototype.getProperties=S.prototype.O;S.prototype.set=S.prototype.set;S.prototype.setProperties=S.prototype.G;
S.prototype.unset=S.prototype.P;S.prototype.changed=S.prototype.u;S.prototype.dispatchEvent=S.prototype.b;S.prototype.getRevision=S.prototype.K;S.prototype.on=S.prototype.I;S.prototype.once=S.prototype.L;S.prototype.un=S.prototype.J;S.prototype.unByKey=S.prototype.M;Bn.prototype.getFirstCoordinate=Bn.prototype.Ib;Bn.prototype.getLastCoordinate=Bn.prototype.Jb;Bn.prototype.getLayout=Bn.prototype.Kb;Bn.prototype.rotate=Bn.prototype.rotate;Bn.prototype.getClosestPoint=Bn.prototype.vb;
Bn.prototype.getExtent=Bn.prototype.H;Bn.prototype.simplify=Bn.prototype.Bb;Bn.prototype.transform=Bn.prototype.jb;Bn.prototype.get=Bn.prototype.get;Bn.prototype.getKeys=Bn.prototype.N;Bn.prototype.getProperties=Bn.prototype.O;Bn.prototype.set=Bn.prototype.set;Bn.prototype.setProperties=Bn.prototype.G;Bn.prototype.unset=Bn.prototype.P;Bn.prototype.changed=Bn.prototype.u;Bn.prototype.dispatchEvent=Bn.prototype.b;Bn.prototype.getRevision=Bn.prototype.K;Bn.prototype.on=Bn.prototype.I;
Bn.prototype.once=Bn.prototype.L;Bn.prototype.un=Bn.prototype.J;Bn.prototype.unByKey=Bn.prototype.M;T.prototype.getFirstCoordinate=T.prototype.Ib;T.prototype.getLastCoordinate=T.prototype.Jb;T.prototype.getLayout=T.prototype.Kb;T.prototype.rotate=T.prototype.rotate;T.prototype.getClosestPoint=T.prototype.vb;T.prototype.getExtent=T.prototype.H;T.prototype.simplify=T.prototype.Bb;T.prototype.transform=T.prototype.jb;T.prototype.get=T.prototype.get;T.prototype.getKeys=T.prototype.N;
T.prototype.getProperties=T.prototype.O;T.prototype.set=T.prototype.set;T.prototype.setProperties=T.prototype.G;T.prototype.unset=T.prototype.P;T.prototype.changed=T.prototype.u;T.prototype.dispatchEvent=T.prototype.b;T.prototype.getRevision=T.prototype.K;T.prototype.on=T.prototype.I;T.prototype.once=T.prototype.L;T.prototype.un=T.prototype.J;T.prototype.unByKey=T.prototype.M;C.prototype.getFirstCoordinate=C.prototype.Ib;C.prototype.getLastCoordinate=C.prototype.Jb;C.prototype.getLayout=C.prototype.Kb;
C.prototype.rotate=C.prototype.rotate;C.prototype.getClosestPoint=C.prototype.vb;C.prototype.getExtent=C.prototype.H;C.prototype.simplify=C.prototype.Bb;C.prototype.transform=C.prototype.jb;C.prototype.get=C.prototype.get;C.prototype.getKeys=C.prototype.N;C.prototype.getProperties=C.prototype.O;C.prototype.set=C.prototype.set;C.prototype.setProperties=C.prototype.G;C.prototype.unset=C.prototype.P;C.prototype.changed=C.prototype.u;C.prototype.dispatchEvent=C.prototype.b;C.prototype.getRevision=C.prototype.K;
C.prototype.on=C.prototype.I;C.prototype.once=C.prototype.L;C.prototype.un=C.prototype.J;C.prototype.unByKey=C.prototype.M;E.prototype.getFirstCoordinate=E.prototype.Ib;E.prototype.getLastCoordinate=E.prototype.Jb;E.prototype.getLayout=E.prototype.Kb;E.prototype.rotate=E.prototype.rotate;E.prototype.getClosestPoint=E.prototype.vb;E.prototype.getExtent=E.prototype.H;E.prototype.simplify=E.prototype.Bb;E.prototype.transform=E.prototype.jb;E.prototype.get=E.prototype.get;E.prototype.getKeys=E.prototype.N;
E.prototype.getProperties=E.prototype.O;E.prototype.set=E.prototype.set;E.prototype.setProperties=E.prototype.G;E.prototype.unset=E.prototype.P;E.prototype.changed=E.prototype.u;E.prototype.dispatchEvent=E.prototype.b;E.prototype.getRevision=E.prototype.K;E.prototype.on=E.prototype.I;E.prototype.once=E.prototype.L;E.prototype.un=E.prototype.J;E.prototype.unByKey=E.prototype.M;ko.prototype.readFeatures=ko.prototype.Fa;lo.prototype.readFeatures=lo.prototype.Fa;lo.prototype.readFeatures=lo.prototype.Fa;
Xe.prototype.get=Xe.prototype.get;Xe.prototype.getKeys=Xe.prototype.N;Xe.prototype.getProperties=Xe.prototype.O;Xe.prototype.set=Xe.prototype.set;Xe.prototype.setProperties=Xe.prototype.G;Xe.prototype.unset=Xe.prototype.P;Xe.prototype.changed=Xe.prototype.u;Xe.prototype.dispatchEvent=Xe.prototype.b;Xe.prototype.getRevision=Xe.prototype.K;Xe.prototype.on=Xe.prototype.I;Xe.prototype.once=Xe.prototype.L;Xe.prototype.un=Xe.prototype.J;Xe.prototype.unByKey=Xe.prototype.M;Ef.prototype.getMap=Ef.prototype.i;
Ef.prototype.setMap=Ef.prototype.setMap;Ef.prototype.setTarget=Ef.prototype.c;Ef.prototype.get=Ef.prototype.get;Ef.prototype.getKeys=Ef.prototype.N;Ef.prototype.getProperties=Ef.prototype.O;Ef.prototype.set=Ef.prototype.set;Ef.prototype.setProperties=Ef.prototype.G;Ef.prototype.unset=Ef.prototype.P;Ef.prototype.changed=Ef.prototype.u;Ef.prototype.dispatchEvent=Ef.prototype.b;Ef.prototype.getRevision=Ef.prototype.K;Ef.prototype.on=Ef.prototype.I;Ef.prototype.once=Ef.prototype.L;Ef.prototype.un=Ef.prototype.J;
Ef.prototype.unByKey=Ef.prototype.M;Lf.prototype.getMap=Lf.prototype.i;Lf.prototype.setMap=Lf.prototype.setMap;Lf.prototype.setTarget=Lf.prototype.c;Lf.prototype.get=Lf.prototype.get;Lf.prototype.getKeys=Lf.prototype.N;Lf.prototype.getProperties=Lf.prototype.O;Lf.prototype.set=Lf.prototype.set;Lf.prototype.setProperties=Lf.prototype.G;Lf.prototype.unset=Lf.prototype.P;Lf.prototype.changed=Lf.prototype.u;Lf.prototype.dispatchEvent=Lf.prototype.b;Lf.prototype.getRevision=Lf.prototype.K;
Lf.prototype.on=Lf.prototype.I;Lf.prototype.once=Lf.prototype.L;Lf.prototype.un=Lf.prototype.J;Lf.prototype.unByKey=Lf.prototype.M;Qf.prototype.getMap=Qf.prototype.i;Qf.prototype.setMap=Qf.prototype.setMap;Qf.prototype.setTarget=Qf.prototype.c;Qf.prototype.get=Qf.prototype.get;Qf.prototype.getKeys=Qf.prototype.N;Qf.prototype.getProperties=Qf.prototype.O;Qf.prototype.set=Qf.prototype.set;Qf.prototype.setProperties=Qf.prototype.G;Qf.prototype.unset=Qf.prototype.P;Qf.prototype.changed=Qf.prototype.u;
Qf.prototype.dispatchEvent=Qf.prototype.b;Qf.prototype.getRevision=Qf.prototype.K;Qf.prototype.on=Qf.prototype.I;Qf.prototype.once=Qf.prototype.L;Qf.prototype.un=Qf.prototype.J;Qf.prototype.unByKey=Qf.prototype.M;an.prototype.getMap=an.prototype.i;an.prototype.setMap=an.prototype.setMap;an.prototype.setTarget=an.prototype.c;an.prototype.get=an.prototype.get;an.prototype.getKeys=an.prototype.N;an.prototype.getProperties=an.prototype.O;an.prototype.set=an.prototype.set;an.prototype.setProperties=an.prototype.G;
an.prototype.unset=an.prototype.P;an.prototype.changed=an.prototype.u;an.prototype.dispatchEvent=an.prototype.b;an.prototype.getRevision=an.prototype.K;an.prototype.on=an.prototype.I;an.prototype.once=an.prototype.L;an.prototype.un=an.prototype.J;an.prototype.unByKey=an.prototype.M;Hf.prototype.getMap=Hf.prototype.i;Hf.prototype.setMap=Hf.prototype.setMap;Hf.prototype.setTarget=Hf.prototype.c;Hf.prototype.get=Hf.prototype.get;Hf.prototype.getKeys=Hf.prototype.N;Hf.prototype.getProperties=Hf.prototype.O;
Hf.prototype.set=Hf.prototype.set;Hf.prototype.setProperties=Hf.prototype.G;Hf.prototype.unset=Hf.prototype.P;Hf.prototype.changed=Hf.prototype.u;Hf.prototype.dispatchEvent=Hf.prototype.b;Hf.prototype.getRevision=Hf.prototype.K;Hf.prototype.on=Hf.prototype.I;Hf.prototype.once=Hf.prototype.L;Hf.prototype.un=Hf.prototype.J;Hf.prototype.unByKey=Hf.prototype.M;fn.prototype.getMap=fn.prototype.i;fn.prototype.setMap=fn.prototype.setMap;fn.prototype.setTarget=fn.prototype.c;fn.prototype.get=fn.prototype.get;
fn.prototype.getKeys=fn.prototype.N;fn.prototype.getProperties=fn.prototype.O;fn.prototype.set=fn.prototype.set;fn.prototype.setProperties=fn.prototype.G;fn.prototype.unset=fn.prototype.P;fn.prototype.changed=fn.prototype.u;fn.prototype.dispatchEvent=fn.prototype.b;fn.prototype.getRevision=fn.prototype.K;fn.prototype.on=fn.prototype.I;fn.prototype.once=fn.prototype.L;fn.prototype.un=fn.prototype.J;fn.prototype.unByKey=fn.prototype.M;Jf.prototype.getMap=Jf.prototype.i;Jf.prototype.setMap=Jf.prototype.setMap;
Jf.prototype.setTarget=Jf.prototype.c;Jf.prototype.get=Jf.prototype.get;Jf.prototype.getKeys=Jf.prototype.N;Jf.prototype.getProperties=Jf.prototype.O;Jf.prototype.set=Jf.prototype.set;Jf.prototype.setProperties=Jf.prototype.G;Jf.prototype.unset=Jf.prototype.P;Jf.prototype.changed=Jf.prototype.u;Jf.prototype.dispatchEvent=Jf.prototype.b;Jf.prototype.getRevision=Jf.prototype.K;Jf.prototype.on=Jf.prototype.I;Jf.prototype.once=Jf.prototype.L;Jf.prototype.un=Jf.prototype.J;Jf.prototype.unByKey=Jf.prototype.M;
kn.prototype.getMap=kn.prototype.i;kn.prototype.setMap=kn.prototype.setMap;kn.prototype.setTarget=kn.prototype.c;kn.prototype.get=kn.prototype.get;kn.prototype.getKeys=kn.prototype.N;kn.prototype.getProperties=kn.prototype.O;kn.prototype.set=kn.prototype.set;kn.prototype.setProperties=kn.prototype.G;kn.prototype.unset=kn.prototype.P;kn.prototype.changed=kn.prototype.u;kn.prototype.dispatchEvent=kn.prototype.b;kn.prototype.getRevision=kn.prototype.K;kn.prototype.on=kn.prototype.I;
kn.prototype.once=kn.prototype.L;kn.prototype.un=kn.prototype.J;kn.prototype.unByKey=kn.prototype.M;pn.prototype.getMap=pn.prototype.i;pn.prototype.setMap=pn.prototype.setMap;pn.prototype.setTarget=pn.prototype.c;pn.prototype.get=pn.prototype.get;pn.prototype.getKeys=pn.prototype.N;pn.prototype.getProperties=pn.prototype.O;pn.prototype.set=pn.prototype.set;pn.prototype.setProperties=pn.prototype.G;pn.prototype.unset=pn.prototype.P;pn.prototype.changed=pn.prototype.u;pn.prototype.dispatchEvent=pn.prototype.b;
pn.prototype.getRevision=pn.prototype.K;pn.prototype.on=pn.prototype.I;pn.prototype.once=pn.prototype.L;pn.prototype.un=pn.prototype.J;pn.prototype.unByKey=pn.prototype.M;
  return OPENLAYERS.ol;
}));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
var mgrs = require('mgrs');

function Point(x, y, z) {
  if (!(this instanceof Point)) {
    return new Point(x, y, z);
  }
  if (Array.isArray(x)) {
    this.x = x[0];
    this.y = x[1];
    this.z = x[2] || 0.0;
  } else if(typeof x === 'object') {
    this.x = x.x;
    this.y = x.y;
    this.z = x.z || 0.0;
  } else if (typeof x === 'string' && typeof y === 'undefined') {
    var coords = x.split(',');
    this.x = parseFloat(coords[0], 10);
    this.y = parseFloat(coords[1], 10);
    this.z = parseFloat(coords[2], 10) || 0.0;
  } else {
    this.x = x;
    this.y = y;
    this.z = z || 0.0;
  }
  console.warn('proj4.Point will be removed in version 3, use proj4.toPoint');
}

Point.fromMGRS = function(mgrsStr) {
  return new Point(mgrs.toPoint(mgrsStr));
};
Point.prototype.toMGRS = function(accuracy) {
  return mgrs.forward([this.x, this.y], accuracy);
};
module.exports = Point;

},{"mgrs":75}],9:[function(require,module,exports){
var parseCode = require("./parseCode");
var extend = require('./extend');
var projections = require('./projections');
var deriveConstants = require('./deriveConstants');

function Projection(srsCode,callback) {
  if (!(this instanceof Projection)) {
    return new Projection(srsCode);
  }
  callback = callback || function(error){
    if(error){
      throw error;
    }
  };
  var json = parseCode(srsCode);
  if(typeof json !== 'object'){
    callback(srsCode);
    return;
  }
  var modifiedJSON = deriveConstants(json);
  var ourProj = Projection.projections.get(modifiedJSON.projName);
  if(ourProj){
    extend(this, modifiedJSON);
    extend(this, ourProj);
    this.init();
    callback(null, this);
  }else{
    callback(srsCode);
  }
}
Projection.projections = projections;
Projection.projections.start();
module.exports = Projection;

},{"./deriveConstants":40,"./extend":41,"./parseCode":45,"./projections":47}],10:[function(require,module,exports){
module.exports = function(crs, denorm, point) {
  var xin = point.x,
    yin = point.y,
    zin = point.z || 0.0;
  var v, t, i;
  for (i = 0; i < 3; i++) {
    if (denorm && i === 2 && point.z === undefined) {
      continue;
    }
    if (i === 0) {
      v = xin;
      t = 'x';
    }
    else if (i === 1) {
      v = yin;
      t = 'y';
    }
    else {
      v = zin;
      t = 'z';
    }
    switch (crs.axis[i]) {
    case 'e':
      point[t] = v;
      break;
    case 'w':
      point[t] = -v;
      break;
    case 'n':
      point[t] = v;
      break;
    case 's':
      point[t] = -v;
      break;
    case 'u':
      if (point[t] !== undefined) {
        point.z = v;
      }
      break;
    case 'd':
      if (point[t] !== undefined) {
        point.z = -v;
      }
      break;
    default:
      //console.log("ERROR: unknow axis ("+crs.axis[i]+") - check definition of "+crs.projName);
      return null;
    }
  }
  return point;
};

},{}],11:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) < HALF_PI) ? x : (x - (sign(x) * Math.PI));
};
},{"./sign":28}],12:[function(require,module,exports){
var TWO_PI = Math.PI * 2;
// SPI is slightly greater than Math.PI, so values that exceed the -180..180
// degree range by a tiny amount don't get wrapped. This prevents points that
// have drifted from their original location along the 180th meridian (due to
// floating point error) from changing their sign.
var SPI = 3.14159265359;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) <= SPI) ? x : (x - (sign(x) * TWO_PI));
};
},{"./sign":28}],13:[function(require,module,exports){
module.exports = function(x) {
  if (Math.abs(x) > 1) {
    x = (x > 1) ? 1 : -1;
  }
  return Math.asin(x);
};
},{}],14:[function(require,module,exports){
module.exports = function(x) {
  return (1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x)));
};
},{}],15:[function(require,module,exports){
module.exports = function(x) {
  return (0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x)));
};
},{}],16:[function(require,module,exports){
module.exports = function(x) {
  return (0.05859375 * x * x * (1 + 0.75 * x));
};
},{}],17:[function(require,module,exports){
module.exports = function(x) {
  return (x * x * x * (35 / 3072));
};
},{}],18:[function(require,module,exports){
module.exports = function(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
};
},{}],19:[function(require,module,exports){
module.exports = function(ml, e0, e1, e2, e3) {
  var phi;
  var dphi;

  phi = ml / e0;
  for (var i = 0; i < 15; i++) {
    dphi = (ml - (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi))) / (e0 - 2 * e1 * Math.cos(2 * phi) + 4 * e2 * Math.cos(4 * phi) - 6 * e3 * Math.cos(6 * phi));
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }

  //..reportError("IMLFN-CONV:Latitude failed to converge after 15 iterations");
  return NaN;
};
},{}],20:[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, q) {
  var temp = 1 - (1 - eccent * eccent) / (2 * eccent) * Math.log((1 - eccent) / (1 + eccent));
  if (Math.abs(Math.abs(q) - temp) < 1.0E-6) {
    if (q < 0) {
      return (-1 * HALF_PI);
    }
    else {
      return HALF_PI;
    }
  }
  //var phi = 0.5* q/(1-eccent*eccent);
  var phi = Math.asin(0.5 * q);
  var dphi;
  var sin_phi;
  var cos_phi;
  var con;
  for (var i = 0; i < 30; i++) {
    sin_phi = Math.sin(phi);
    cos_phi = Math.cos(phi);
    con = eccent * sin_phi;
    dphi = Math.pow(1 - con * con, 2) / (2 * cos_phi) * (q / (1 - eccent * eccent) - sin_phi / (1 - con * con) + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }

  //console.log("IQSFN-CONV:Latitude failed to converge after 30 iterations");
  return NaN;
};
},{}],21:[function(require,module,exports){
module.exports = function(e0, e1, e2, e3, phi) {
  return (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi));
};
},{}],22:[function(require,module,exports){
module.exports = function(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / (Math.sqrt(1 - con * con));
};
},{}],23:[function(require,module,exports){
var HALF_PI = Math.PI/2;
module.exports = function(eccent, ts) {
  var eccnth = 0.5 * eccent;
  var con, dphi;
  var phi = HALF_PI - 2 * Math.atan(ts);
  for (var i = 0; i <= 15; i++) {
    con = eccent * Math.sin(phi);
    dphi = HALF_PI - 2 * Math.atan(ts * (Math.pow(((1 - con) / (1 + con)), eccnth))) - phi;
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }
  //console.log("phi2z has NoConvergence");
  return -9999;
};
},{}],24:[function(require,module,exports){
var C00 = 1;
var C02 = 0.25;
var C04 = 0.046875;
var C06 = 0.01953125;
var C08 = 0.01068115234375;
var C22 = 0.75;
var C44 = 0.46875;
var C46 = 0.01302083333333333333;
var C48 = 0.00712076822916666666;
var C66 = 0.36458333333333333333;
var C68 = 0.00569661458333333333;
var C88 = 0.3076171875;

module.exports = function(es) {
  var en = [];
  en[0] = C00 - es * (C02 + es * (C04 + es * (C06 + es * C08)));
  en[1] = es * (C22 - es * (C04 + es * (C06 + es * C08)));
  var t = es * es;
  en[2] = t * (C44 - es * (C46 + es * C48));
  t *= es;
  en[3] = t * (C66 - es * C68);
  en[4] = t * es * C88;
  return en;
};
},{}],25:[function(require,module,exports){
var pj_mlfn = require("./pj_mlfn");
var EPSLN = 1.0e-10;
var MAX_ITER = 20;
module.exports = function(arg, es, en) {
  var k = 1 / (1 - es);
  var phi = arg;
  for (var i = MAX_ITER; i; --i) { /* rarely goes over 2 iterations */
    var s = Math.sin(phi);
    var t = 1 - es * s * s;
    //t = this.pj_mlfn(phi, s, Math.cos(phi), en) - arg;
    //phi -= t * (t * Math.sqrt(t)) * k;
    t = (pj_mlfn(phi, s, Math.cos(phi), en) - arg) * (t * Math.sqrt(t)) * k;
    phi -= t;
    if (Math.abs(t) < EPSLN) {
      return phi;
    }
  }
  //..reportError("cass:pj_inv_mlfn: Convergence error");
  return phi;
};
},{"./pj_mlfn":26}],26:[function(require,module,exports){
module.exports = function(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4]))));
};
},{}],27:[function(require,module,exports){
module.exports = function(eccent, sinphi) {
  var con;
  if (eccent > 1.0e-7) {
    con = eccent * sinphi;
    return ((1 - eccent * eccent) * (sinphi / (1 - con * con) - (0.5 / eccent) * Math.log((1 - con) / (1 + con))));
  }
  else {
    return (2 * sinphi);
  }
};
},{}],28:[function(require,module,exports){
module.exports = function(x) {
  return x<0 ? -1 : 1;
};
},{}],29:[function(require,module,exports){
module.exports = function(esinp, exp) {
  return (Math.pow((1 - esinp) / (1 + esinp), exp));
};
},{}],30:[function(require,module,exports){
module.exports = function (array){
  var out = {
    x: array[0],
    y: array[1]
  };
  if (array.length>2) {
    out.z = array[2];
  }
  if (array.length>3) {
    out.m = array[3];
  }
  return out;
};
},{}],31:[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow(((1 - con) / (1 + con)), com);
  return (Math.tan(0.5 * (HALF_PI - phi)) / con);
};
},{}],32:[function(require,module,exports){
exports.wgs84 = {
  towgs84: "0,0,0",
  ellipse: "WGS84",
  datumName: "WGS84"
};
exports.ch1903 = {
  towgs84: "674.374,15.056,405.346",
  ellipse: "bessel",
  datumName: "swiss"
};
exports.ggrs87 = {
  towgs84: "-199.87,74.79,246.62",
  ellipse: "GRS80",
  datumName: "Greek_Geodetic_Reference_System_1987"
};
exports.nad83 = {
  towgs84: "0,0,0",
  ellipse: "GRS80",
  datumName: "North_American_Datum_1983"
};
exports.nad27 = {
  nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
  ellipse: "clrk66",
  datumName: "North_American_Datum_1927"
};
exports.potsdam = {
  towgs84: "606.0,23.0,413.0",
  ellipse: "bessel",
  datumName: "Potsdam Rauenberg 1950 DHDN"
};
exports.carthage = {
  towgs84: "-263.0,6.0,431.0",
  ellipse: "clark80",
  datumName: "Carthage 1934 Tunisia"
};
exports.hermannskogel = {
  towgs84: "653.0,-212.0,449.0",
  ellipse: "bessel",
  datumName: "Hermannskogel"
};
exports.ire65 = {
  towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
  ellipse: "mod_airy",
  datumName: "Ireland 1965"
};
exports.rassadiran = {
  towgs84: "-133.63,-157.5,-158.62",
  ellipse: "intl",
  datumName: "Rassadiran"
};
exports.nzgd49 = {
  towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
  ellipse: "intl",
  datumName: "New Zealand Geodetic Datum 1949"
};
exports.osgb36 = {
  towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
  ellipse: "airy",
  datumName: "Airy 1830"
};
exports.s_jtsk = {
  towgs84: "589,76,480",
  ellipse: 'bessel',
  datumName: 'S-JTSK (Ferro)'
};
exports.beduaram = {
  towgs84: '-106,-87,188',
  ellipse: 'clrk80',
  datumName: 'Beduaram'
};
exports.gunung_segara = {
  towgs84: '-403,684,41',
  ellipse: 'bessel',
  datumName: 'Gunung Segara Jakarta'
};
exports.rnb72 = {
  towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",
  ellipse: "intl",
  datumName: "Reseau National Belge 1972"
};
},{}],33:[function(require,module,exports){
exports.MERIT = {
  a: 6378137.0,
  rf: 298.257,
  ellipseName: "MERIT 1983"
};
exports.SGS85 = {
  a: 6378136.0,
  rf: 298.257,
  ellipseName: "Soviet Geodetic System 85"
};
exports.GRS80 = {
  a: 6378137.0,
  rf: 298.257222101,
  ellipseName: "GRS 1980(IUGG, 1980)"
};
exports.IAU76 = {
  a: 6378140.0,
  rf: 298.257,
  ellipseName: "IAU 1976"
};
exports.airy = {
  a: 6377563.396,
  b: 6356256.910,
  ellipseName: "Airy 1830"
};
exports.APL4 = {
  a: 6378137,
  rf: 298.25,
  ellipseName: "Appl. Physics. 1965"
};
exports.NWL9D = {
  a: 6378145.0,
  rf: 298.25,
  ellipseName: "Naval Weapons Lab., 1965"
};
exports.mod_airy = {
  a: 6377340.189,
  b: 6356034.446,
  ellipseName: "Modified Airy"
};
exports.andrae = {
  a: 6377104.43,
  rf: 300.0,
  ellipseName: "Andrae 1876 (Den., Iclnd.)"
};
exports.aust_SA = {
  a: 6378160.0,
  rf: 298.25,
  ellipseName: "Australian Natl & S. Amer. 1969"
};
exports.GRS67 = {
  a: 6378160.0,
  rf: 298.2471674270,
  ellipseName: "GRS 67(IUGG 1967)"
};
exports.bessel = {
  a: 6377397.155,
  rf: 299.1528128,
  ellipseName: "Bessel 1841"
};
exports.bess_nam = {
  a: 6377483.865,
  rf: 299.1528128,
  ellipseName: "Bessel 1841 (Namibia)"
};
exports.clrk66 = {
  a: 6378206.4,
  b: 6356583.8,
  ellipseName: "Clarke 1866"
};
exports.clrk80 = {
  a: 6378249.145,
  rf: 293.4663,
  ellipseName: "Clarke 1880 mod."
};
exports.clrk58 = {
  a: 6378293.645208759,
  rf: 294.2606763692654,
  ellipseName: "Clarke 1858"
};
exports.CPM = {
  a: 6375738.7,
  rf: 334.29,
  ellipseName: "Comm. des Poids et Mesures 1799"
};
exports.delmbr = {
  a: 6376428.0,
  rf: 311.5,
  ellipseName: "Delambre 1810 (Belgium)"
};
exports.engelis = {
  a: 6378136.05,
  rf: 298.2566,
  ellipseName: "Engelis 1985"
};
exports.evrst30 = {
  a: 6377276.345,
  rf: 300.8017,
  ellipseName: "Everest 1830"
};
exports.evrst48 = {
  a: 6377304.063,
  rf: 300.8017,
  ellipseName: "Everest 1948"
};
exports.evrst56 = {
  a: 6377301.243,
  rf: 300.8017,
  ellipseName: "Everest 1956"
};
exports.evrst69 = {
  a: 6377295.664,
  rf: 300.8017,
  ellipseName: "Everest 1969"
};
exports.evrstSS = {
  a: 6377298.556,
  rf: 300.8017,
  ellipseName: "Everest (Sabah & Sarawak)"
};
exports.fschr60 = {
  a: 6378166.0,
  rf: 298.3,
  ellipseName: "Fischer (Mercury Datum) 1960"
};
exports.fschr60m = {
  a: 6378155.0,
  rf: 298.3,
  ellipseName: "Fischer 1960"
};
exports.fschr68 = {
  a: 6378150.0,
  rf: 298.3,
  ellipseName: "Fischer 1968"
};
exports.helmert = {
  a: 6378200.0,
  rf: 298.3,
  ellipseName: "Helmert 1906"
};
exports.hough = {
  a: 6378270.0,
  rf: 297.0,
  ellipseName: "Hough"
};
exports.intl = {
  a: 6378388.0,
  rf: 297.0,
  ellipseName: "International 1909 (Hayford)"
};
exports.kaula = {
  a: 6378163.0,
  rf: 298.24,
  ellipseName: "Kaula 1961"
};
exports.lerch = {
  a: 6378139.0,
  rf: 298.257,
  ellipseName: "Lerch 1979"
};
exports.mprts = {
  a: 6397300.0,
  rf: 191.0,
  ellipseName: "Maupertius 1738"
};
exports.new_intl = {
  a: 6378157.5,
  b: 6356772.2,
  ellipseName: "New International 1967"
};
exports.plessis = {
  a: 6376523.0,
  rf: 6355863.0,
  ellipseName: "Plessis 1817 (France)"
};
exports.krass = {
  a: 6378245.0,
  rf: 298.3,
  ellipseName: "Krassovsky, 1942"
};
exports.SEasia = {
  a: 6378155.0,
  b: 6356773.3205,
  ellipseName: "Southeast Asia"
};
exports.walbeck = {
  a: 6376896.0,
  b: 6355834.8467,
  ellipseName: "Walbeck"
};
exports.WGS60 = {
  a: 6378165.0,
  rf: 298.3,
  ellipseName: "WGS 60"
};
exports.WGS66 = {
  a: 6378145.0,
  rf: 298.25,
  ellipseName: "WGS 66"
};
exports.WGS7 = {
  a: 6378135.0,
  rf: 298.26,
  ellipseName: "WGS 72"
};
exports.WGS84 = {
  a: 6378137.0,
  rf: 298.257223563,
  ellipseName: "WGS 84"
};
exports.sphere = {
  a: 6370997.0,
  b: 6370997.0,
  ellipseName: "Normal Sphere (r=6370997)"
};
},{}],34:[function(require,module,exports){
exports.greenwich = 0.0; //"0dE",
exports.lisbon = -9.131906111111; //"9d07'54.862\"W",
exports.paris = 2.337229166667; //"2d20'14.025\"E",
exports.bogota = -74.080916666667; //"74d04'51.3\"W",
exports.madrid = -3.687938888889; //"3d41'16.58\"W",
exports.rome = 12.452333333333; //"12d27'8.4\"E",
exports.bern = 7.439583333333; //"7d26'22.5\"E",
exports.jakarta = 106.807719444444; //"106d48'27.79\"E",
exports.ferro = -17.666666666667; //"17d40'W",
exports.brussels = 4.367975; //"4d22'4.71\"E",
exports.stockholm = 18.058277777778; //"18d3'29.8\"E",
exports.athens = 23.7163375; //"23d42'58.815\"E",
exports.oslo = 10.722916666667; //"10d43'22.5\"E"
},{}],35:[function(require,module,exports){
exports.ft = {to_meter: 0.3048};
exports['us-ft'] = {to_meter: 1200 / 3937};

},{}],36:[function(require,module,exports){
var proj = require('./Proj');
var transform = require('./transform');
var wgs84 = proj('WGS84');

function transformer(from, to, coords) {
  var transformedArray;
  if (Array.isArray(coords)) {
    transformedArray = transform(from, to, coords);
    if (coords.length === 3) {
      return [transformedArray.x, transformedArray.y, transformedArray.z];
    }
    else {
      return [transformedArray.x, transformedArray.y];
    }
  }
  else {
    return transform(from, to, coords);
  }
}

function checkProj(item) {
  if (item instanceof proj) {
    return item;
  }
  if (item.oProj) {
    return item.oProj;
  }
  return proj(item);
}
function proj4(fromProj, toProj, coord) {
  fromProj = checkProj(fromProj);
  var single = false;
  var obj;
  if (typeof toProj === 'undefined') {
    toProj = fromProj;
    fromProj = wgs84;
    single = true;
  }
  else if (typeof toProj.x !== 'undefined' || Array.isArray(toProj)) {
    coord = toProj;
    toProj = fromProj;
    fromProj = wgs84;
    single = true;
  }
  toProj = checkProj(toProj);
  if (coord) {
    return transformer(fromProj, toProj, coord);
  }
  else {
    obj = {
      forward: function(coords) {
        return transformer(fromProj, toProj, coords);
      },
      inverse: function(coords) {
        return transformer(toProj, fromProj, coords);
      }
    };
    if (single) {
      obj.oProj = toProj;
    }
    return obj;
  }
}
module.exports = proj4;
},{"./Proj":9,"./transform":73}],37:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var PJD_GRIDSHIFT = 3;
var PJD_WGS84 = 4; // WGS84 or equivalent
var PJD_NODATUM = 5; // WGS84 or equivalent
var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
var AD_C = 1.0026000;
var COS_67P5 = 0.38268343236508977;
var datum = function(proj) {
  if (!(this instanceof datum)) {
    return new datum(proj);
  }
  this.datum_type = PJD_WGS84; //default setting
  if (!proj) {
    return;
  }
  if (proj.datumCode && proj.datumCode === 'none') {
    this.datum_type = PJD_NODATUM;
  }

  if (proj.datum_params) {
    this.datum_params = proj.datum_params.map(parseFloat);
    if (this.datum_params[0] !== 0 || this.datum_params[1] !== 0 || this.datum_params[2] !== 0) {
      this.datum_type = PJD_3PARAM;
    }
    if (this.datum_params.length > 3) {
      if (this.datum_params[3] !== 0 || this.datum_params[4] !== 0 || this.datum_params[5] !== 0 || this.datum_params[6] !== 0) {
        this.datum_type = PJD_7PARAM;
        this.datum_params[3] *= SEC_TO_RAD;
        this.datum_params[4] *= SEC_TO_RAD;
        this.datum_params[5] *= SEC_TO_RAD;
        this.datum_params[6] = (this.datum_params[6] / 1000000.0) + 1.0;
      }
    }
  }

  // DGR 2011-03-21 : nadgrids support
  this.datum_type = proj.grids ? PJD_GRIDSHIFT : this.datum_type;

  this.a = proj.a; //datum object also uses these values
  this.b = proj.b;
  this.es = proj.es;
  this.ep2 = proj.ep2;
  if (this.datum_type === PJD_GRIDSHIFT) {
    this.grids = proj.grids;
  }
};
datum.prototype = {


  /****************************************************************/
  // cs_compare_datums()
  //   Returns TRUE if the two datums match, otherwise FALSE.
  compare_datums: function(dest) {
    if (this.datum_type !== dest.datum_type) {
      return false; // false, datums are not equal
    }
    else if (this.a !== dest.a || Math.abs(this.es - dest.es) > 0.000000000050) {
      // the tolerence for es is to ensure that GRS80 and WGS84
      // are considered identical
      return false;
    }
    else if (this.datum_type === PJD_3PARAM) {
      return (this.datum_params[0] === dest.datum_params[0] && this.datum_params[1] === dest.datum_params[1] && this.datum_params[2] === dest.datum_params[2]);
    }
    else if (this.datum_type === PJD_7PARAM) {
      return (this.datum_params[0] === dest.datum_params[0] && this.datum_params[1] === dest.datum_params[1] && this.datum_params[2] === dest.datum_params[2] && this.datum_params[3] === dest.datum_params[3] && this.datum_params[4] === dest.datum_params[4] && this.datum_params[5] === dest.datum_params[5] && this.datum_params[6] === dest.datum_params[6]);
    }
    else if (this.datum_type === PJD_GRIDSHIFT || dest.datum_type === PJD_GRIDSHIFT) {
      //alert("ERROR: Grid shift transformations are not implemented.");
      //return false
      //DGR 2012-07-29 lazy ...
      return this.nadgrids === dest.nadgrids;
    }
    else {
      return true; // datums are equal
    }
  }, // cs_compare_datums()

  /*
   * The function Convert_Geodetic_To_Geocentric converts geodetic coordinates
   * (latitude, longitude, and height) to geocentric coordinates (X, Y, Z),
   * according to the current ellipsoid parameters.
   *
   *    Latitude  : Geodetic latitude in radians                     (input)
   *    Longitude : Geodetic longitude in radians                    (input)
   *    Height    : Geodetic height, in meters                       (input)
   *    X         : Calculated Geocentric X coordinate, in meters    (output)
   *    Y         : Calculated Geocentric Y coordinate, in meters    (output)
   *    Z         : Calculated Geocentric Z coordinate, in meters    (output)
   *
   */
  geodetic_to_geocentric: function(p) {
    var Longitude = p.x;
    var Latitude = p.y;
    var Height = p.z ? p.z : 0; //Z value not always supplied
    var X; // output
    var Y;
    var Z;

    var Error_Code = 0; //  GEOCENT_NO_ERROR;
    var Rn; /*  Earth radius at location  */
    var Sin_Lat; /*  Math.sin(Latitude)  */
    var Sin2_Lat; /*  Square of Math.sin(Latitude)  */
    var Cos_Lat; /*  Math.cos(Latitude)  */

    /*
     ** Don't blow up if Latitude is just a little out of the value
     ** range as it may just be a rounding issue.  Also removed longitude
     ** test, it should be wrapped by Math.cos() and Math.sin().  NFW for PROJ.4, Sep/2001.
     */
    if (Latitude < -HALF_PI && Latitude > -1.001 * HALF_PI) {
      Latitude = -HALF_PI;
    }
    else if (Latitude > HALF_PI && Latitude < 1.001 * HALF_PI) {
      Latitude = HALF_PI;
    }
    else if ((Latitude < -HALF_PI) || (Latitude > HALF_PI)) {
      /* Latitude out of range */
      //..reportError('geocent:lat out of range:' + Latitude);
      return null;
    }

    if (Longitude > Math.PI) {
      Longitude -= (2 * Math.PI);
    }
    Sin_Lat = Math.sin(Latitude);
    Cos_Lat = Math.cos(Latitude);
    Sin2_Lat = Sin_Lat * Sin_Lat;
    Rn = this.a / (Math.sqrt(1.0e0 - this.es * Sin2_Lat));
    X = (Rn + Height) * Cos_Lat * Math.cos(Longitude);
    Y = (Rn + Height) * Cos_Lat * Math.sin(Longitude);
    Z = ((Rn * (1 - this.es)) + Height) * Sin_Lat;

    p.x = X;
    p.y = Y;
    p.z = Z;
    return Error_Code;
  }, // cs_geodetic_to_geocentric()


  geocentric_to_geodetic: function(p) {
    /* local defintions and variables */
    /* end-criterium of loop, accuracy of sin(Latitude) */
    var genau = 1e-12;
    var genau2 = (genau * genau);
    var maxiter = 30;

    var P; /* distance between semi-minor axis and location */
    var RR; /* distance between center and location */
    var CT; /* sin of geocentric latitude */
    var ST; /* cos of geocentric latitude */
    var RX;
    var RK;
    var RN; /* Earth radius at location */
    var CPHI0; /* cos of start or old geodetic latitude in iterations */
    var SPHI0; /* sin of start or old geodetic latitude in iterations */
    var CPHI; /* cos of searched geodetic latitude */
    var SPHI; /* sin of searched geodetic latitude */
    var SDPHI; /* end-criterium: addition-theorem of sin(Latitude(iter)-Latitude(iter-1)) */
    var At_Pole; /* indicates location is in polar region */
    var iter; /* # of continous iteration, max. 30 is always enough (s.a.) */

    var X = p.x;
    var Y = p.y;
    var Z = p.z ? p.z : 0.0; //Z value not always supplied
    var Longitude;
    var Latitude;
    var Height;

    At_Pole = false;
    P = Math.sqrt(X * X + Y * Y);
    RR = Math.sqrt(X * X + Y * Y + Z * Z);

    /*      special cases for latitude and longitude */
    if (P / this.a < genau) {

      /*  special case, if P=0. (X=0., Y=0.) */
      At_Pole = true;
      Longitude = 0.0;

      /*  if (X,Y,Z)=(0.,0.,0.) then Height becomes semi-minor axis
       *  of ellipsoid (=center of mass), Latitude becomes PI/2 */
      if (RR / this.a < genau) {
        Latitude = HALF_PI;
        Height = -this.b;
        return;
      }
    }
    else {
      /*  ellipsoidal (geodetic) longitude
       *  interval: -PI < Longitude <= +PI */
      Longitude = Math.atan2(Y, X);
    }

    /* --------------------------------------------------------------
     * Following iterative algorithm was developped by
     * "Institut for Erdmessung", University of Hannover, July 1988.
     * Internet: www.ife.uni-hannover.de
     * Iterative computation of CPHI,SPHI and Height.
     * Iteration of CPHI and SPHI to 10**-12 radian resp.
     * 2*10**-7 arcsec.
     * --------------------------------------------------------------
     */
    CT = Z / RR;
    ST = P / RR;
    RX = 1.0 / Math.sqrt(1.0 - this.es * (2.0 - this.es) * ST * ST);
    CPHI0 = ST * (1.0 - this.es) * RX;
    SPHI0 = CT * RX;
    iter = 0;

    /* loop to find sin(Latitude) resp. Latitude
     * until |sin(Latitude(iter)-Latitude(iter-1))| < genau */
    do {
      iter++;
      RN = this.a / Math.sqrt(1.0 - this.es * SPHI0 * SPHI0);

      /*  ellipsoidal (geodetic) height */
      Height = P * CPHI0 + Z * SPHI0 - RN * (1.0 - this.es * SPHI0 * SPHI0);

      RK = this.es * RN / (RN + Height);
      RX = 1.0 / Math.sqrt(1.0 - RK * (2.0 - RK) * ST * ST);
      CPHI = ST * (1.0 - RK) * RX;
      SPHI = CT * RX;
      SDPHI = SPHI * CPHI0 - CPHI * SPHI0;
      CPHI0 = CPHI;
      SPHI0 = SPHI;
    }
    while (SDPHI * SDPHI > genau2 && iter < maxiter);

    /*      ellipsoidal (geodetic) latitude */
    Latitude = Math.atan(SPHI / Math.abs(CPHI));

    p.x = Longitude;
    p.y = Latitude;
    p.z = Height;
    return p;
  }, // cs_geocentric_to_geodetic()

  /** Convert_Geocentric_To_Geodetic
   * The method used here is derived from 'An Improved Algorithm for
   * Geocentric to Geodetic Coordinate Conversion', by Ralph Toms, Feb 1996
   */
  geocentric_to_geodetic_noniter: function(p) {
    var X = p.x;
    var Y = p.y;
    var Z = p.z ? p.z : 0; //Z value not always supplied
    var Longitude;
    var Latitude;
    var Height;

    var W; /* distance from Z axis */
    var W2; /* square of distance from Z axis */
    var T0; /* initial estimate of vertical component */
    var T1; /* corrected estimate of vertical component */
    var S0; /* initial estimate of horizontal component */
    var S1; /* corrected estimate of horizontal component */
    var Sin_B0; /* Math.sin(B0), B0 is estimate of Bowring aux variable */
    var Sin3_B0; /* cube of Math.sin(B0) */
    var Cos_B0; /* Math.cos(B0) */
    var Sin_p1; /* Math.sin(phi1), phi1 is estimated latitude */
    var Cos_p1; /* Math.cos(phi1) */
    var Rn; /* Earth radius at location */
    var Sum; /* numerator of Math.cos(phi1) */
    var At_Pole; /* indicates location is in polar region */

    X = parseFloat(X); // cast from string to float
    Y = parseFloat(Y);
    Z = parseFloat(Z);

    At_Pole = false;
    if (X !== 0.0) {
      Longitude = Math.atan2(Y, X);
    }
    else {
      if (Y > 0) {
        Longitude = HALF_PI;
      }
      else if (Y < 0) {
        Longitude = -HALF_PI;
      }
      else {
        At_Pole = true;
        Longitude = 0.0;
        if (Z > 0.0) { /* north pole */
          Latitude = HALF_PI;
        }
        else if (Z < 0.0) { /* south pole */
          Latitude = -HALF_PI;
        }
        else { /* center of earth */
          Latitude = HALF_PI;
          Height = -this.b;
          return;
        }
      }
    }
    W2 = X * X + Y * Y;
    W = Math.sqrt(W2);
    T0 = Z * AD_C;
    S0 = Math.sqrt(T0 * T0 + W2);
    Sin_B0 = T0 / S0;
    Cos_B0 = W / S0;
    Sin3_B0 = Sin_B0 * Sin_B0 * Sin_B0;
    T1 = Z + this.b * this.ep2 * Sin3_B0;
    Sum = W - this.a * this.es * Cos_B0 * Cos_B0 * Cos_B0;
    S1 = Math.sqrt(T1 * T1 + Sum * Sum);
    Sin_p1 = T1 / S1;
    Cos_p1 = Sum / S1;
    Rn = this.a / Math.sqrt(1.0 - this.es * Sin_p1 * Sin_p1);
    if (Cos_p1 >= COS_67P5) {
      Height = W / Cos_p1 - Rn;
    }
    else if (Cos_p1 <= -COS_67P5) {
      Height = W / -Cos_p1 - Rn;
    }
    else {
      Height = Z / Sin_p1 + Rn * (this.es - 1.0);
    }
    if (At_Pole === false) {
      Latitude = Math.atan(Sin_p1 / Cos_p1);
    }

    p.x = Longitude;
    p.y = Latitude;
    p.z = Height;
    return p;
  }, // geocentric_to_geodetic_noniter()

  /****************************************************************/
  // pj_geocentic_to_wgs84( p )
  //  p = point to transform in geocentric coordinates (x,y,z)
  geocentric_to_wgs84: function(p) {

    if (this.datum_type === PJD_3PARAM) {
      // if( x[io] === HUGE_VAL )
      //    continue;
      p.x += this.datum_params[0];
      p.y += this.datum_params[1];
      p.z += this.datum_params[2];

    }
    else if (this.datum_type === PJD_7PARAM) {
      var Dx_BF = this.datum_params[0];
      var Dy_BF = this.datum_params[1];
      var Dz_BF = this.datum_params[2];
      var Rx_BF = this.datum_params[3];
      var Ry_BF = this.datum_params[4];
      var Rz_BF = this.datum_params[5];
      var M_BF = this.datum_params[6];
      // if( x[io] === HUGE_VAL )
      //    continue;
      var x_out = M_BF * (p.x - Rz_BF * p.y + Ry_BF * p.z) + Dx_BF;
      var y_out = M_BF * (Rz_BF * p.x + p.y - Rx_BF * p.z) + Dy_BF;
      var z_out = M_BF * (-Ry_BF * p.x + Rx_BF * p.y + p.z) + Dz_BF;
      p.x = x_out;
      p.y = y_out;
      p.z = z_out;
    }
  }, // cs_geocentric_to_wgs84

  /****************************************************************/
  // pj_geocentic_from_wgs84()
  //  coordinate system definition,
  //  point to transform in geocentric coordinates (x,y,z)
  geocentric_from_wgs84: function(p) {

    if (this.datum_type === PJD_3PARAM) {
      //if( x[io] === HUGE_VAL )
      //    continue;
      p.x -= this.datum_params[0];
      p.y -= this.datum_params[1];
      p.z -= this.datum_params[2];

    }
    else if (this.datum_type === PJD_7PARAM) {
      var Dx_BF = this.datum_params[0];
      var Dy_BF = this.datum_params[1];
      var Dz_BF = this.datum_params[2];
      var Rx_BF = this.datum_params[3];
      var Ry_BF = this.datum_params[4];
      var Rz_BF = this.datum_params[5];
      var M_BF = this.datum_params[6];
      var x_tmp = (p.x - Dx_BF) / M_BF;
      var y_tmp = (p.y - Dy_BF) / M_BF;
      var z_tmp = (p.z - Dz_BF) / M_BF;
      //if( x[io] === HUGE_VAL )
      //    continue;

      p.x = x_tmp + Rz_BF * y_tmp - Ry_BF * z_tmp;
      p.y = -Rz_BF * x_tmp + y_tmp + Rx_BF * z_tmp;
      p.z = Ry_BF * x_tmp - Rx_BF * y_tmp + z_tmp;
    } //cs_geocentric_from_wgs84()
  }
};

/** point object, nothing fancy, just allows values to be
    passed back and forth by reference rather than by value.
    Other point classes may be used as long as they have
    x and y properties, which will get modified in the transform method.
*/
module.exports = datum;

},{}],38:[function(require,module,exports){
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var PJD_GRIDSHIFT = 3;
var PJD_NODATUM = 5; // WGS84 or equivalent
var SRS_WGS84_SEMIMAJOR = 6378137; // only used in grid shift transforms
var SRS_WGS84_ESQUARED = 0.006694379990141316; //DGR: 2012-07-29
module.exports = function(source, dest, point) {
  var wp, i, l;

  function checkParams(fallback) {
    return (fallback === PJD_3PARAM || fallback === PJD_7PARAM);
  }
  // Short cut if the datums are identical.
  if (source.compare_datums(dest)) {
    return point; // in this case, zero is sucess,
    // whereas cs_compare_datums returns 1 to indicate TRUE
    // confusing, should fix this
  }

  // Explicitly skip datum transform by setting 'datum=none' as parameter for either source or dest
  if (source.datum_type === PJD_NODATUM || dest.datum_type === PJD_NODATUM) {
    return point;
  }

  //DGR: 2012-07-29 : add nadgrids support (begin)
  var src_a = source.a;
  var src_es = source.es;

  var dst_a = dest.a;
  var dst_es = dest.es;

  var fallback = source.datum_type;
  // If this datum requires grid shifts, then apply it to geodetic coordinates.
  if (fallback === PJD_GRIDSHIFT) {
    if (this.apply_gridshift(source, 0, point) === 0) {
      source.a = SRS_WGS84_SEMIMAJOR;
      source.es = SRS_WGS84_ESQUARED;
    }
    else {
      // try 3 or 7 params transformation or nothing ?
      if (!source.datum_params) {
        source.a = src_a;
        source.es = source.es;
        return point;
      }
      wp = 1;
      for (i = 0, l = source.datum_params.length; i < l; i++) {
        wp *= source.datum_params[i];
      }
      if (wp === 0) {
        source.a = src_a;
        source.es = source.es;
        return point;
      }
      if (source.datum_params.length > 3) {
        fallback = PJD_7PARAM;
      }
      else {
        fallback = PJD_3PARAM;
      }
    }
  }
  if (dest.datum_type === PJD_GRIDSHIFT) {
    dest.a = SRS_WGS84_SEMIMAJOR;
    dest.es = SRS_WGS84_ESQUARED;
  }
  // Do we need to go through geocentric coordinates?
  if (source.es !== dest.es || source.a !== dest.a || checkParams(fallback) || checkParams(dest.datum_type)) {
    //DGR: 2012-07-29 : add nadgrids support (end)
    // Convert to geocentric coordinates.
    source.geodetic_to_geocentric(point);
    // CHECK_RETURN;
    // Convert between datums
    if (checkParams(source.datum_type)) {
      source.geocentric_to_wgs84(point);
      // CHECK_RETURN;
    }
    if (checkParams(dest.datum_type)) {
      dest.geocentric_from_wgs84(point);
      // CHECK_RETURN;
    }
    // Convert back to geodetic coordinates
    dest.geocentric_to_geodetic(point);
    // CHECK_RETURN;
  }
  // Apply grid shift to destination if required
  if (dest.datum_type === PJD_GRIDSHIFT) {
    this.apply_gridshift(dest, 1, point);
    // CHECK_RETURN;
  }

  source.a = src_a;
  source.es = src_es;
  dest.a = dst_a;
  dest.es = dst_es;

  return point;
};


},{}],39:[function(require,module,exports){
var globals = require('./global');
var parseProj = require('./projString');
var wkt = require('./wkt');

function defs(name) {
  /*global console*/
  var that = this;
  if (arguments.length === 2) {
    var def = arguments[1];
    if (typeof def === 'string') {
      if (def.charAt(0) === '+') {
        defs[name] = parseProj(arguments[1]);
      }
      else {
        defs[name] = wkt(arguments[1]);
      }
    } else {
      defs[name] = def;
    }
  }
  else if (arguments.length === 1) {
    if (Array.isArray(name)) {
      return name.map(function(v) {
        if (Array.isArray(v)) {
          defs.apply(that, v);
        }
        else {
          defs(v);
        }
      });
    }
    else if (typeof name === 'string') {
      if (name in defs) {
        return defs[name];
      }
    }
    else if ('EPSG' in name) {
      defs['EPSG:' + name.EPSG] = name;
    }
    else if ('ESRI' in name) {
      defs['ESRI:' + name.ESRI] = name;
    }
    else if ('IAU2000' in name) {
      defs['IAU2000:' + name.IAU2000] = name;
    }
    else {
      console.log(name);
    }
    return;
  }


}
globals(defs);
module.exports = defs;

},{"./global":42,"./projString":46,"./wkt":74}],40:[function(require,module,exports){
var Datum = require('./constants/Datum');
var Ellipsoid = require('./constants/Ellipsoid');
var extend = require('./extend');
var datum = require('./datum');
var EPSLN = 1.0e-10;
// ellipoid pj_set_ell.c
var SIXTH = 0.1666666666666666667;
/* 1/6 */
var RA4 = 0.04722222222222222222;
/* 17/360 */
var RA6 = 0.02215608465608465608;
module.exports = function(json) {
  // DGR 2011-03-20 : nagrids -> nadgrids
  if (json.datumCode && json.datumCode !== 'none') {
    var datumDef = Datum[json.datumCode];
    if (datumDef) {
      json.datum_params = datumDef.towgs84 ? datumDef.towgs84.split(',') : null;
      json.ellps = datumDef.ellipse;
      json.datumName = datumDef.datumName ? datumDef.datumName : json.datumCode;
    }
  }
  if (!json.a) { // do we have an ellipsoid?
    var ellipse = Ellipsoid[json.ellps] ? Ellipsoid[json.ellps] : Ellipsoid.WGS84;
    extend(json, ellipse);
  }
  if (json.rf && !json.b) {
    json.b = (1.0 - 1.0 / json.rf) * json.a;
  }
  if (json.rf === 0 || Math.abs(json.a - json.b) < EPSLN) {
    json.sphere = true;
    json.b = json.a;
  }
  json.a2 = json.a * json.a; // used in geocentric
  json.b2 = json.b * json.b; // used in geocentric
  json.es = (json.a2 - json.b2) / json.a2; // e ^ 2
  json.e = Math.sqrt(json.es); // eccentricity
  if (json.R_A) {
    json.a *= 1 - json.es * (SIXTH + json.es * (RA4 + json.es * RA6));
    json.a2 = json.a * json.a;
    json.b2 = json.b * json.b;
    json.es = 0;
  }
  json.ep2 = (json.a2 - json.b2) / json.b2; // used in geocentric
  if (!json.k0) {
    json.k0 = 1.0; //default value
  }
  //DGR 2010-11-12: axis
  if (!json.axis) {
    json.axis = "enu";
  }

  if (!json.datum) {
    json.datum = datum(json);
  }
  return json;
};

},{"./constants/Datum":32,"./constants/Ellipsoid":33,"./datum":37,"./extend":41}],41:[function(require,module,exports){
module.exports = function(destination, source) {
  destination = destination || {};
  var value, property;
  if (!source) {
    return destination;
  }
  for (property in source) {
    value = source[property];
    if (value !== undefined) {
      destination[property] = value;
    }
  }
  return destination;
};

},{}],42:[function(require,module,exports){
module.exports = function(defs) {
  defs('EPSG:4326', "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
  defs('EPSG:4269', "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees");
  defs('EPSG:3857', "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");

  defs.WGS84 = defs['EPSG:4326'];
  defs['EPSG:3785'] = defs['EPSG:3857']; // maintain backward compat, official code is 3857
  defs.GOOGLE = defs['EPSG:3857'];
  defs['EPSG:900913'] = defs['EPSG:3857'];
  defs['EPSG:102113'] = defs['EPSG:3857'];
};

},{}],43:[function(require,module,exports){
var projs = [
  require('./projections/tmerc'),
  require('./projections/utm'),
  require('./projections/sterea'),
  require('./projections/stere'),
  require('./projections/somerc'),
  require('./projections/omerc'),
  require('./projections/lcc'),
  require('./projections/krovak'),
  require('./projections/cass'),
  require('./projections/laea'),
  require('./projections/aea'),
  require('./projections/gnom'),
  require('./projections/cea'),
  require('./projections/eqc'),
  require('./projections/poly'),
  require('./projections/nzmg'),
  require('./projections/mill'),
  require('./projections/sinu'),
  require('./projections/moll'),
  require('./projections/eqdc'),
  require('./projections/vandg'),
  require('./projections/aeqd')
];
module.exports = function(proj4){
  projs.forEach(function(proj){
    proj4.Proj.projections.add(proj);
  });
};
},{"./projections/aea":48,"./projections/aeqd":49,"./projections/cass":50,"./projections/cea":51,"./projections/eqc":52,"./projections/eqdc":53,"./projections/gnom":55,"./projections/krovak":56,"./projections/laea":57,"./projections/lcc":58,"./projections/mill":61,"./projections/moll":62,"./projections/nzmg":63,"./projections/omerc":64,"./projections/poly":65,"./projections/sinu":66,"./projections/somerc":67,"./projections/stere":68,"./projections/sterea":69,"./projections/tmerc":70,"./projections/utm":71,"./projections/vandg":72}],44:[function(require,module,exports){
var proj4 = require('./core');
proj4.defaultDatum = 'WGS84'; //default datum
proj4.Proj = require('./Proj');
proj4.WGS84 = new proj4.Proj('WGS84');
proj4.Point = require('./Point');
proj4.toPoint = require("./common/toPoint");
proj4.defs = require('./defs');
proj4.transform = require('./transform');
proj4.mgrs = require('mgrs');
proj4.version = require('../package.json').version;
require('./includedProjections')(proj4);
module.exports = proj4;
},{"../package.json":76,"./Point":8,"./Proj":9,"./common/toPoint":30,"./core":36,"./defs":39,"./includedProjections":43,"./transform":73,"mgrs":75}],45:[function(require,module,exports){
var defs = require('./defs');
var wkt = require('./wkt');
var projStr = require('./projString');
function testObj(code){
  return typeof code === 'string';
}
function testDef(code){
  return code in defs;
}
function testWKT(code){
  var codeWords = ['GEOGCS','GEOCCS','PROJCS','LOCAL_CS'];
  return codeWords.reduce(function(a,b){
    return a+1+code.indexOf(b);
  },0);
}
function testProj(code){
  return code[0] === '+';
}
function parse(code){
  if (testObj(code)) {
    //check to see if this is a WKT string
    if (testDef(code)) {
      return defs[code];
    }
    else if (testWKT(code)) {
      return wkt(code);
    }
    else if (testProj(code)) {
      return projStr(code);
    }
  }else{
    return code;
  }
}

module.exports = parse;
},{"./defs":39,"./projString":46,"./wkt":74}],46:[function(require,module,exports){
var D2R = 0.01745329251994329577;
var PrimeMeridian = require('./constants/PrimeMeridian');
var units = require('./constants/units');

module.exports = function(defData) {
  var self = {};
  var paramObj = {};
  defData.split("+").map(function(v) {
    return v.trim();
  }).filter(function(a) {
    return a;
  }).forEach(function(a) {
    var split = a.split("=");
    split.push(true);
    paramObj[split[0].toLowerCase()] = split[1];
  });
  var paramName, paramVal, paramOutname;
  var params = {
    proj: 'projName',
    datum: 'datumCode',
    rf: function(v) {
      self.rf = parseFloat(v);
    },
    lat_0: function(v) {
      self.lat0 = v * D2R;
    },
    lat_1: function(v) {
      self.lat1 = v * D2R;
    },
    lat_2: function(v) {
      self.lat2 = v * D2R;
    },
    lat_ts: function(v) {
      self.lat_ts = v * D2R;
    },
    lon_0: function(v) {
      self.long0 = v * D2R;
    },
    lon_1: function(v) {
      self.long1 = v * D2R;
    },
    lon_2: function(v) {
      self.long2 = v * D2R;
    },
    alpha: function(v) {
      self.alpha = parseFloat(v) * D2R;
    },
    lonc: function(v) {
      self.longc = v * D2R;
    },
    x_0: function(v) {
      self.x0 = parseFloat(v);
    },
    y_0: function(v) {
      self.y0 = parseFloat(v);
    },
    k_0: function(v) {
      self.k0 = parseFloat(v);
    },
    k: function(v) {
      self.k0 = parseFloat(v);
    },
    a: function(v) {
      self.a = parseFloat(v);
    },
    b: function(v) {
      self.b = parseFloat(v);
    },
    r_a: function() {
      self.R_A = true;
    },
    zone: function(v) {
      self.zone = parseInt(v, 10);
    },
    south: function() {
      self.utmSouth = true;
    },
    towgs84: function(v) {
      self.datum_params = v.split(",").map(function(a) {
        return parseFloat(a);
      });
    },
    to_meter: function(v) {
      self.to_meter = parseFloat(v);
    },
    units: function(v) {
      self.units = v;
      if (units[v]) {
        self.to_meter = units[v].to_meter;
      }
    },
    from_greenwich: function(v) {
      self.from_greenwich = v * D2R;
    },
    pm: function(v) {
      self.from_greenwich = (PrimeMeridian[v] ? PrimeMeridian[v] : parseFloat(v)) * D2R;
    },
    nadgrids: function(v) {
      if (v === '@null') {
        self.datumCode = 'none';
      }
      else {
        self.nadgrids = v;
      }
    },
    axis: function(v) {
      var legalAxis = "ewnsud";
      if (v.length === 3 && legalAxis.indexOf(v.substr(0, 1)) !== -1 && legalAxis.indexOf(v.substr(1, 1)) !== -1 && legalAxis.indexOf(v.substr(2, 1)) !== -1) {
        self.axis = v;
      }
    }
  };
  for (paramName in paramObj) {
    paramVal = paramObj[paramName];
    if (paramName in params) {
      paramOutname = params[paramName];
      if (typeof paramOutname === 'function') {
        paramOutname(paramVal);
      }
      else {
        self[paramOutname] = paramVal;
      }
    }
    else {
      self[paramName] = paramVal;
    }
  }
  if(typeof self.datumCode === 'string' && self.datumCode !== "WGS84"){
    self.datumCode = self.datumCode.toLowerCase();
  }
  return self;
};

},{"./constants/PrimeMeridian":34,"./constants/units":35}],47:[function(require,module,exports){
var projs = [
  require('./projections/merc'),
  require('./projections/longlat')
];
var names = {};
var projStore = [];

function add(proj, i) {
  var len = projStore.length;
  if (!proj.names) {
    console.log(i);
    return true;
  }
  projStore[len] = proj;
  proj.names.forEach(function(n) {
    names[n.toLowerCase()] = len;
  });
  return this;
}

exports.add = add;

exports.get = function(name) {
  if (!name) {
    return false;
  }
  var n = name.toLowerCase();
  if (typeof names[n] !== 'undefined' && projStore[names[n]]) {
    return projStore[names[n]];
  }
};
exports.start = function() {
  projs.forEach(add);
};

},{"./projections/longlat":59,"./projections/merc":60}],48:[function(require,module,exports){
var EPSLN = 1.0e-10;
var msfnz = require('../common/msfnz');
var qsfnz = require('../common/qsfnz');
var adjust_lon = require('../common/adjust_lon');
var asinz = require('../common/asinz');
exports.init = function() {

  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e3 = Math.sqrt(this.es);

  this.sin_po = Math.sin(this.lat1);
  this.cos_po = Math.cos(this.lat1);
  this.t1 = this.sin_po;
  this.con = this.sin_po;
  this.ms1 = msfnz(this.e3, this.sin_po, this.cos_po);
  this.qs1 = qsfnz(this.e3, this.sin_po, this.cos_po);

  this.sin_po = Math.sin(this.lat2);
  this.cos_po = Math.cos(this.lat2);
  this.t2 = this.sin_po;
  this.ms2 = msfnz(this.e3, this.sin_po, this.cos_po);
  this.qs2 = qsfnz(this.e3, this.sin_po, this.cos_po);

  this.sin_po = Math.sin(this.lat0);
  this.cos_po = Math.cos(this.lat0);
  this.t3 = this.sin_po;
  this.qs0 = qsfnz(this.e3, this.sin_po, this.cos_po);

  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1);
  }
  else {
    this.ns0 = this.con;
  }
  this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1;
  this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0;
};

/* Albers Conical Equal Area forward equations--mapping lat,long to x,y
  -------------------------------------------------------------------*/
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  this.sin_phi = Math.sin(lat);
  this.cos_phi = Math.cos(lat);

  var qs = qsfnz(this.e3, this.sin_phi, this.cos_phi);
  var rh1 = this.a * Math.sqrt(this.c - this.ns0 * qs) / this.ns0;
  var theta = this.ns0 * adjust_lon(lon - this.long0);
  var x = rh1 * Math.sin(theta) + this.x0;
  var y = this.rh - rh1 * Math.cos(theta) + this.y0;

  p.x = x;
  p.y = y;
  return p;
};


exports.inverse = function(p) {
  var rh1, qs, con, theta, lon, lat;

  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  if (this.ns0 >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }
  con = rh1 * this.ns0 / this.a;
  if (this.sphere) {
    lat = Math.asin((this.c - con * con) / (2 * this.ns0));
  }
  else {
    qs = (this.c - con * con) / this.ns0;
    lat = this.phi1z(this.e3, qs);
  }

  lon = adjust_lon(theta / this.ns0 + this.long0);
  p.x = lon;
  p.y = lat;
  return p;
};

/* Function to compute phi1, the latitude for the inverse of the
   Albers Conical Equal-Area projection.
-------------------------------------------*/
exports.phi1z = function(eccent, qs) {
  var sinphi, cosphi, con, com, dphi;
  var phi = asinz(0.5 * qs);
  if (eccent < EPSLN) {
    return phi;
  }

  var eccnts = eccent * eccent;
  for (var i = 1; i <= 25; i++) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    con = eccent * sinphi;
    com = 1 - con * con;
    dphi = 0.5 * com * com / cosphi * (qs / (1 - eccnts) - sinphi / com + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi = phi + dphi;
    if (Math.abs(dphi) <= 1e-7) {
      return phi;
    }
  }
  return null;
};
exports.names = ["Albers_Conic_Equal_Area", "Albers", "aea"];

},{"../common/adjust_lon":12,"../common/asinz":13,"../common/msfnz":22,"../common/qsfnz":27}],49:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var mlfn = require('../common/mlfn');
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var gN = require('../common/gN');
var asinz = require('../common/asinz');
var imlfn = require('../common/imlfn');
exports.init = function() {
  this.sin_p12 = Math.sin(this.lat0);
  this.cos_p12 = Math.cos(this.lat0);
};

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var sinphi = Math.sin(p.y);
  var cosphi = Math.cos(p.y);
  var dlon = adjust_lon(lon - this.long0);
  var e0, e1, e2, e3, Mlp, Ml, tanphi, Nl1, Nl, psi, Az, G, H, GH, Hs, c, kp, cos_c, s, s2, s3, s4, s5;
  if (this.sphere) {
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North Pole case
      p.x = this.x0 + this.a * (HALF_PI - lat) * Math.sin(dlon);
      p.y = this.y0 - this.a * (HALF_PI - lat) * Math.cos(dlon);
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South Pole case
      p.x = this.x0 + this.a * (HALF_PI + lat) * Math.sin(dlon);
      p.y = this.y0 + this.a * (HALF_PI + lat) * Math.cos(dlon);
      return p;
    }
    else {
      //default case
      cos_c = this.sin_p12 * sinphi + this.cos_p12 * cosphi * Math.cos(dlon);
      c = Math.acos(cos_c);
      kp = c / Math.sin(c);
      p.x = this.x0 + this.a * kp * cosphi * Math.sin(dlon);
      p.y = this.y0 + this.a * kp * (this.cos_p12 * sinphi - this.sin_p12 * cosphi * Math.cos(dlon));
      return p;
    }
  }
  else {
    e0 = e0fn(this.es);
    e1 = e1fn(this.es);
    e2 = e2fn(this.es);
    e3 = e3fn(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North Pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp - Ml) * Math.sin(dlon);
      p.y = this.y0 - (Mlp - Ml) * Math.cos(dlon);
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South Pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp + Ml) * Math.sin(dlon);
      p.y = this.y0 + (Mlp + Ml) * Math.cos(dlon);
      return p;
    }
    else {
      //Default case
      tanphi = sinphi / cosphi;
      Nl1 = gN(this.a, this.e, this.sin_p12);
      Nl = gN(this.a, this.e, sinphi);
      psi = Math.atan((1 - this.es) * tanphi + this.es * Nl1 * this.sin_p12 / (Nl * cosphi));
      Az = Math.atan2(Math.sin(dlon), this.cos_p12 * Math.tan(psi) - this.sin_p12 * Math.cos(dlon));
      if (Az === 0) {
        s = Math.asin(this.cos_p12 * Math.sin(psi) - this.sin_p12 * Math.cos(psi));
      }
      else if (Math.abs(Math.abs(Az) - Math.PI) <= EPSLN) {
        s = -Math.asin(this.cos_p12 * Math.sin(psi) - this.sin_p12 * Math.cos(psi));
      }
      else {
        s = Math.asin(Math.sin(dlon) * Math.cos(psi) / Math.sin(Az));
      }
      G = this.e * this.sin_p12 / Math.sqrt(1 - this.es);
      H = this.e * this.cos_p12 * Math.cos(Az) / Math.sqrt(1 - this.es);
      GH = G * H;
      Hs = H * H;
      s2 = s * s;
      s3 = s2 * s;
      s4 = s3 * s;
      s5 = s4 * s;
      c = Nl1 * s * (1 - s2 * Hs * (1 - Hs) / 6 + s3 / 8 * GH * (1 - 2 * Hs) + s4 / 120 * (Hs * (4 - 7 * Hs) - 3 * G * G * (1 - 7 * Hs)) - s5 / 48 * GH);
      p.x = this.x0 + c * Math.sin(Az);
      p.y = this.y0 + c * Math.cos(Az);
      return p;
    }
  }


};

exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var rh, z, sinz, cosz, lon, lat, con, e0, e1, e2, e3, Mlp, M, N1, psi, Az, cosAz, tmp, A, B, D, Ee, F;
  if (this.sphere) {
    rh = Math.sqrt(p.x * p.x + p.y * p.y);
    if (rh > (2 * HALF_PI * this.a)) {
      return;
    }
    z = rh / this.a;

    sinz = Math.sin(z);
    cosz = Math.cos(z);

    lon = this.long0;
    if (Math.abs(rh) <= EPSLN) {
      lat = this.lat0;
    }
    else {
      lat = asinz(cosz * this.sin_p12 + (p.y * sinz * this.cos_p12) / rh);
      con = Math.abs(this.lat0) - HALF_PI;
      if (Math.abs(con) <= EPSLN) {
        if (this.lat0 >= 0) {
          lon = adjust_lon(this.long0 + Math.atan2(p.x, - p.y));
        }
        else {
          lon = adjust_lon(this.long0 - Math.atan2(-p.x, p.y));
        }
      }
      else {
        /*con = cosz - this.sin_p12 * Math.sin(lat);
        if ((Math.abs(con) < EPSLN) && (Math.abs(p.x) < EPSLN)) {
          //no-op, just keep the lon value as is
        } else {
          var temp = Math.atan2((p.x * sinz * this.cos_p12), (con * rh));
          lon = adjust_lon(this.long0 + Math.atan2((p.x * sinz * this.cos_p12), (con * rh)));
        }*/
        lon = adjust_lon(this.long0 + Math.atan2(p.x * sinz, rh * this.cos_p12 * cosz - p.y * this.sin_p12 * sinz));
      }
    }

    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    e0 = e0fn(this.es);
    e1 = e1fn(this.es);
    e2 = e2fn(this.es);
    e3 = e3fn(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M = Mlp - rh;
      lat = imlfn(M / this.a, e0, e1, e2, e3);
      lon = adjust_lon(this.long0 + Math.atan2(p.x, - 1 * p.y));
      p.x = lon;
      p.y = lat;
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M = rh - Mlp;

      lat = imlfn(M / this.a, e0, e1, e2, e3);
      lon = adjust_lon(this.long0 + Math.atan2(p.x, p.y));
      p.x = lon;
      p.y = lat;
      return p;
    }
    else {
      //default case
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      Az = Math.atan2(p.x, p.y);
      N1 = gN(this.a, this.e, this.sin_p12);
      cosAz = Math.cos(Az);
      tmp = this.e * this.cos_p12 * cosAz;
      A = -tmp * tmp / (1 - this.es);
      B = 3 * this.es * (1 - A) * this.sin_p12 * this.cos_p12 * cosAz / (1 - this.es);
      D = rh / N1;
      Ee = D - A * (1 + A) * Math.pow(D, 3) / 6 - B * (1 + 3 * A) * Math.pow(D, 4) / 24;
      F = 1 - A * Ee * Ee / 2 - D * Ee * Ee * Ee / 6;
      psi = Math.asin(this.sin_p12 * Math.cos(Ee) + this.cos_p12 * Math.sin(Ee) * cosAz);
      lon = adjust_lon(this.long0 + Math.asin(Math.sin(Az) * Math.sin(Ee) / Math.cos(psi)));
      lat = Math.atan((1 - this.es * F * this.sin_p12 / Math.sin(psi)) * Math.tan(psi) / (1 - this.es));
      p.x = lon;
      p.y = lat;
      return p;
    }
  }

};
exports.names = ["Azimuthal_Equidistant", "aeqd"];

},{"../common/adjust_lon":12,"../common/asinz":13,"../common/e0fn":14,"../common/e1fn":15,"../common/e2fn":16,"../common/e3fn":17,"../common/gN":18,"../common/imlfn":19,"../common/mlfn":21}],50:[function(require,module,exports){
var mlfn = require('../common/mlfn');
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var gN = require('../common/gN');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var imlfn = require('../common/imlfn');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
exports.init = function() {
  if (!this.sphere) {
    this.e0 = e0fn(this.es);
    this.e1 = e1fn(this.es);
    this.e2 = e2fn(this.es);
    this.e3 = e3fn(this.es);
    this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
  }
};



/* Cassini forward equations--mapping lat,long to x,y
  -----------------------------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var x, y;
  var lam = p.x;
  var phi = p.y;
  lam = adjust_lon(lam - this.long0);

  if (this.sphere) {
    x = this.a * Math.asin(Math.cos(phi) * Math.sin(lam));
    y = this.a * (Math.atan2(Math.tan(phi), Math.cos(lam)) - this.lat0);
  }
  else {
    //ellipsoid
    var sinphi = Math.sin(phi);
    var cosphi = Math.cos(phi);
    var nl = gN(this.a, this.e, sinphi);
    var tl = Math.tan(phi) * Math.tan(phi);
    var al = lam * Math.cos(phi);
    var asq = al * al;
    var cl = this.es * cosphi * cosphi / (1 - this.es);
    var ml = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, phi);

    x = nl * al * (1 - asq * tl * (1 / 6 - (8 - tl + 8 * cl) * asq / 120));
    y = ml - this.ml0 + nl * sinphi / cosphi * asq * (0.5 + (5 - tl + 6 * cl) * asq / 24);


  }

  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var phi, lam;

  if (this.sphere) {
    var dd = y + this.lat0;
    phi = Math.asin(Math.sin(dd) * Math.cos(x));
    lam = Math.atan2(Math.tan(x), Math.cos(dd));
  }
  else {
    /* ellipsoid */
    var ml1 = this.ml0 / this.a + y;
    var phi1 = imlfn(ml1, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(phi1) - HALF_PI) <= EPSLN) {
      p.x = this.long0;
      p.y = HALF_PI;
      if (y < 0) {
        p.y *= -1;
      }
      return p;
    }
    var nl1 = gN(this.a, this.e, Math.sin(phi1));

    var rl1 = nl1 * nl1 * nl1 / this.a / this.a * (1 - this.es);
    var tl1 = Math.pow(Math.tan(phi1), 2);
    var dl = x * this.a / nl1;
    var dsq = dl * dl;
    phi = phi1 - nl1 * Math.tan(phi1) / rl1 * dl * dl * (0.5 - (1 + 3 * tl1) * dl * dl / 24);
    lam = dl * (1 - dsq * (tl1 / 3 + (1 + 3 * tl1) * tl1 * dsq / 15)) / Math.cos(phi1);

  }

  p.x = adjust_lon(lam + this.long0);
  p.y = adjust_lat(phi);
  return p;

};
exports.names = ["Cassini", "Cassini_Soldner", "cass"];
},{"../common/adjust_lat":11,"../common/adjust_lon":12,"../common/e0fn":14,"../common/e1fn":15,"../common/e2fn":16,"../common/e3fn":17,"../common/gN":18,"../common/imlfn":19,"../common/mlfn":21}],51:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var qsfnz = require('../common/qsfnz');
var msfnz = require('../common/msfnz');
var iqsfnz = require('../common/iqsfnz');
/*
  reference:  
    "Cartographic Projection Procedures for the UNIX Environment-
    A User's Manual" by Gerald I. Evenden,
    USGS Open File Report 90-284and Release 4 Interim Reports (2003)
*/
exports.init = function() {
  //no-op
  if (!this.sphere) {
    this.k0 = msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
  }
};


/* Cylindrical Equal Area forward equations--mapping lat,long to x,y
    ------------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y;
  /* Forward equations
      -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  if (this.sphere) {
    x = this.x0 + this.a * dlon * Math.cos(this.lat_ts);
    y = this.y0 + this.a * Math.sin(lat) / Math.cos(this.lat_ts);
  }
  else {
    var qs = qsfnz(this.e, Math.sin(lat));
    x = this.x0 + this.a * this.k0 * dlon;
    y = this.y0 + this.a * qs * 0.5 / this.k0;
  }

  p.x = x;
  p.y = y;
  return p;
};

/* Cylindrical Equal Area inverse equations--mapping x,y to lat/long
    ------------------------------------------------------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat;

  if (this.sphere) {
    lon = adjust_lon(this.long0 + (p.x / this.a) / Math.cos(this.lat_ts));
    lat = Math.asin((p.y / this.a) * Math.cos(this.lat_ts));
  }
  else {
    lat = iqsfnz(this.e, 2 * p.y * this.k0 / this.a);
    lon = adjust_lon(this.long0 + p.x / (this.a * this.k0));
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["cea"];

},{"../common/adjust_lon":12,"../common/iqsfnz":20,"../common/msfnz":22,"../common/qsfnz":27}],52:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
exports.init = function() {

  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.lat0 = this.lat0 || 0;
  this.long0 = this.long0 || 0;
  this.lat_ts = this.lat_ts || 0;
  this.title = this.title || "Equidistant Cylindrical (Plate Carre)";

  this.rc = Math.cos(this.lat_ts);
};


// forward equations--mapping lat,long to x,y
// -----------------------------------------------------------------
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  var dlon = adjust_lon(lon - this.long0);
  var dlat = adjust_lat(lat - this.lat0);
  p.x = this.x0 + (this.a * dlon * this.rc);
  p.y = this.y0 + (this.a * dlat);
  return p;
};

// inverse equations--mapping x,y to lat/long
// -----------------------------------------------------------------
exports.inverse = function(p) {

  var x = p.x;
  var y = p.y;

  p.x = adjust_lon(this.long0 + ((x - this.x0) / (this.a * this.rc)));
  p.y = adjust_lat(this.lat0 + ((y - this.y0) / (this.a)));
  return p;
};
exports.names = ["Equirectangular", "Equidistant_Cylindrical", "eqc"];

},{"../common/adjust_lat":11,"../common/adjust_lon":12}],53:[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var msfnz = require('../common/msfnz');
var mlfn = require('../common/mlfn');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var imlfn = require('../common/imlfn');
var EPSLN = 1.0e-10;
exports.init = function() {

  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  // Standard Parallels cannot be equal and on opposite sides of the equator
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.lat2 = this.lat2 || this.lat1;
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);

  this.sinphi = Math.sin(this.lat1);
  this.cosphi = Math.cos(this.lat1);

  this.ms1 = msfnz(this.e, this.sinphi, this.cosphi);
  this.ml1 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat1);

  if (Math.abs(this.lat1 - this.lat2) < EPSLN) {
    this.ns = this.sinphi;
  }
  else {
    this.sinphi = Math.sin(this.lat2);
    this.cosphi = Math.cos(this.lat2);
    this.ms2 = msfnz(this.e, this.sinphi, this.cosphi);
    this.ml2 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat2);
    this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1);
  }
  this.g = this.ml1 + this.ms1 / this.ns;
  this.ml0 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
  this.rh = this.a * (this.g - this.ml0);
};


/* Equidistant Conic forward equations--mapping lat,long to x,y
  -----------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var rh1;

  /* Forward equations
      -----------------*/
  if (this.sphere) {
    rh1 = this.a * (this.g - lat);
  }
  else {
    var ml = mlfn(this.e0, this.e1, this.e2, this.e3, lat);
    rh1 = this.a * (this.g - ml);
  }
  var theta = this.ns * adjust_lon(lon - this.long0);
  var x = this.x0 + rh1 * Math.sin(theta);
  var y = this.y0 + this.rh - rh1 * Math.cos(theta);
  p.x = x;
  p.y = y;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  var con, rh1, lat, lon;
  if (this.ns >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }

  if (this.sphere) {
    lon = adjust_lon(this.long0 + theta / this.ns);
    lat = adjust_lat(this.g - rh1 / this.a);
    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    var ml = this.g - rh1 / this.a;
    lat = imlfn(ml, this.e0, this.e1, this.e2, this.e3);
    lon = adjust_lon(this.long0 + theta / this.ns);
    p.x = lon;
    p.y = lat;
    return p;
  }

};
exports.names = ["Equidistant_Conic", "eqdc"];

},{"../common/adjust_lat":11,"../common/adjust_lon":12,"../common/e0fn":14,"../common/e1fn":15,"../common/e2fn":16,"../common/e3fn":17,"../common/imlfn":19,"../common/mlfn":21,"../common/msfnz":22}],54:[function(require,module,exports){
var FORTPI = Math.PI/4;
var srat = require('../common/srat');
var HALF_PI = Math.PI/2;
var MAX_ITER = 20;
exports.init = function() {
  var sphi = Math.sin(this.lat0);
  var cphi = Math.cos(this.lat0);
  cphi *= cphi;
  this.rc = Math.sqrt(1 - this.es) / (1 - this.es * sphi * sphi);
  this.C = Math.sqrt(1 + this.es * cphi * cphi / (1 - this.es));
  this.phic0 = Math.asin(sphi / this.C);
  this.ratexp = 0.5 * this.C * this.e;
  this.K = Math.tan(0.5 * this.phic0 + FORTPI) / (Math.pow(Math.tan(0.5 * this.lat0 + FORTPI), this.C) * srat(this.e * sphi, this.ratexp));
};

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;

  p.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * lat + FORTPI), this.C) * srat(this.e * Math.sin(lat), this.ratexp)) - HALF_PI;
  p.x = this.C * lon;
  return p;
};

exports.inverse = function(p) {
  var DEL_TOL = 1e-14;
  var lon = p.x / this.C;
  var lat = p.y;
  var num = Math.pow(Math.tan(0.5 * lat + FORTPI) / this.K, 1 / this.C);
  for (var i = MAX_ITER; i > 0; --i) {
    lat = 2 * Math.atan(num * srat(this.e * Math.sin(p.y), - 0.5 * this.e)) - HALF_PI;
    if (Math.abs(lat - p.y) < DEL_TOL) {
      break;
    }
    p.y = lat;
  }
  /* convergence failed */
  if (!i) {
    return null;
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["gauss"];

},{"../common/srat":29}],55:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');

/*
  reference:
    Wolfram Mathworld "Gnomonic Projection"
    http://mathworld.wolfram.com/GnomonicProjection.html
    Accessed: 12th November 2009
  */
exports.init = function() {

  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  this.sin_p14 = Math.sin(this.lat0);
  this.cos_p14 = Math.cos(this.lat0);
  // Approximation for projecting points to the horizon (infinity)
  this.infinity_dist = 1000 * this.a;
  this.rc = 1;
};


/* Gnomonic forward equations--mapping lat,long to x,y
    ---------------------------------------------------*/
exports.forward = function(p) {
  var sinphi, cosphi; /* sin and cos value        */
  var dlon; /* delta longitude value      */
  var coslon; /* cos of longitude        */
  var ksp; /* scale factor          */
  var g;
  var x, y;
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
      -----------------*/
  dlon = adjust_lon(lon - this.long0);

  sinphi = Math.sin(lat);
  cosphi = Math.cos(lat);

  coslon = Math.cos(dlon);
  g = this.sin_p14 * sinphi + this.cos_p14 * cosphi * coslon;
  ksp = 1;
  if ((g > 0) || (Math.abs(g) <= EPSLN)) {
    x = this.x0 + this.a * ksp * cosphi * Math.sin(dlon) / g;
    y = this.y0 + this.a * ksp * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon) / g;
  }
  else {

    // Point is in the opposing hemisphere and is unprojectable
    // We still need to return a reasonable point, so we project 
    // to infinity, on a bearing 
    // equivalent to the northern hemisphere equivalent
    // This is a reasonable approximation for short shapes and lines that 
    // straddle the horizon.

    x = this.x0 + this.infinity_dist * cosphi * Math.sin(dlon);
    y = this.y0 + this.infinity_dist * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon);

  }
  p.x = x;
  p.y = y;
  return p;
};


exports.inverse = function(p) {
  var rh; /* Rho */
  var sinc, cosc;
  var c;
  var lon, lat;

  /* Inverse equations
      -----------------*/
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;

  p.x /= this.k0;
  p.y /= this.k0;

  if ((rh = Math.sqrt(p.x * p.x + p.y * p.y))) {
    c = Math.atan2(rh, this.rc);
    sinc = Math.sin(c);
    cosc = Math.cos(c);

    lat = asinz(cosc * this.sin_p14 + (p.y * sinc * this.cos_p14) / rh);
    lon = Math.atan2(p.x * sinc, rh * this.cos_p14 * cosc - p.y * this.sin_p14 * sinc);
    lon = adjust_lon(this.long0 + lon);
  }
  else {
    lat = this.phic0;
    lon = 0;
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["gnom"];

},{"../common/adjust_lon":12,"../common/asinz":13}],56:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
exports.init = function() {
  this.a = 6377397.155;
  this.es = 0.006674372230614;
  this.e = Math.sqrt(this.es);
  if (!this.lat0) {
    this.lat0 = 0.863937979737193;
  }
  if (!this.long0) {
    this.long0 = 0.7417649320975901 - 0.308341501185665;
  }
  /* if scale not set default to 0.9999 */
  if (!this.k0) {
    this.k0 = 0.9999;
  }
  this.s45 = 0.785398163397448; /* 45 */
  this.s90 = 2 * this.s45;
  this.fi0 = this.lat0;
  this.e2 = this.es;
  this.e = Math.sqrt(this.e2);
  this.alfa = Math.sqrt(1 + (this.e2 * Math.pow(Math.cos(this.fi0), 4)) / (1 - this.e2));
  this.uq = 1.04216856380474;
  this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa);
  this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2);
  this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g;
  this.k1 = this.k0;
  this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2));
  this.s0 = 1.37008346281555;
  this.n = Math.sin(this.s0);
  this.ro0 = this.k1 * this.n0 / Math.tan(this.s0);
  this.ad = this.s90 - this.uq;
};

/* ellipsoid */
/* calculate xy from lat/lon */
/* Constants, identical to inverse transform function */
exports.forward = function(p) {
  var gfi, u, deltav, s, d, eps, ro;
  var lon = p.x;
  var lat = p.y;
  var delta_lon = adjust_lon(lon - this.long0);
  /* Transformation */
  gfi = Math.pow(((1 + this.e * Math.sin(lat)) / (1 - this.e * Math.sin(lat))), (this.alfa * this.e / 2));
  u = 2 * (Math.atan(this.k * Math.pow(Math.tan(lat / 2 + this.s45), this.alfa) / gfi) - this.s45);
  deltav = -delta_lon * this.alfa;
  s = Math.asin(Math.cos(this.ad) * Math.sin(u) + Math.sin(this.ad) * Math.cos(u) * Math.cos(deltav));
  d = Math.asin(Math.cos(u) * Math.sin(deltav) / Math.cos(s));
  eps = this.n * d;
  ro = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(s / 2 + this.s45), this.n);
  p.y = ro * Math.cos(eps) / 1;
  p.x = ro * Math.sin(eps) / 1;

  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  return (p);
};

/* calculate lat/lon from xy */
exports.inverse = function(p) {
  var u, deltav, s, d, eps, ro, fi1;
  var ok;

  /* Transformation */
  /* revert y, x*/
  var tmp = p.x;
  p.x = p.y;
  p.y = tmp;
  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  ro = Math.sqrt(p.x * p.x + p.y * p.y);
  eps = Math.atan2(p.y, p.x);
  d = eps / Math.sin(this.s0);
  s = 2 * (Math.atan(Math.pow(this.ro0 / ro, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45);
  u = Math.asin(Math.cos(this.ad) * Math.sin(s) - Math.sin(this.ad) * Math.cos(s) * Math.cos(d));
  deltav = Math.asin(Math.cos(s) * Math.sin(d) / Math.cos(u));
  p.x = this.long0 - deltav / this.alfa;
  fi1 = u;
  ok = 0;
  var iter = 0;
  do {
    p.y = 2 * (Math.atan(Math.pow(this.k, - 1 / this.alfa) * Math.pow(Math.tan(u / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(fi1)) / (1 - this.e * Math.sin(fi1)), this.e / 2)) - this.s45);
    if (Math.abs(fi1 - p.y) < 0.0000000001) {
      ok = 1;
    }
    fi1 = p.y;
    iter += 1;
  } while (ok === 0 && iter < 15);
  if (iter >= 15) {
    return null;
  }

  return (p);
};
exports.names = ["Krovak", "krovak"];

},{"../common/adjust_lon":12}],57:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var FORTPI = Math.PI/4;
var EPSLN = 1.0e-10;
var qsfnz = require('../common/qsfnz');
var adjust_lon = require('../common/adjust_lon');
/*
  reference
    "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
    The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.
  */

exports.S_POLE = 1;
exports.N_POLE = 2;
exports.EQUIT = 3;
exports.OBLIQ = 4;


/* Initialize the Lambert Azimuthal Equal Area projection
  ------------------------------------------------------*/
exports.init = function() {
  var t = Math.abs(this.lat0);
  if (Math.abs(t - HALF_PI) < EPSLN) {
    this.mode = this.lat0 < 0 ? this.S_POLE : this.N_POLE;
  }
  else if (Math.abs(t) < EPSLN) {
    this.mode = this.EQUIT;
  }
  else {
    this.mode = this.OBLIQ;
  }
  if (this.es > 0) {
    var sinphi;

    this.qp = qsfnz(this.e, 1);
    this.mmf = 0.5 / (1 - this.es);
    this.apa = this.authset(this.es);
    switch (this.mode) {
    case this.N_POLE:
      this.dd = 1;
      break;
    case this.S_POLE:
      this.dd = 1;
      break;
    case this.EQUIT:
      this.rq = Math.sqrt(0.5 * this.qp);
      this.dd = 1 / this.rq;
      this.xmf = 1;
      this.ymf = 0.5 * this.qp;
      break;
    case this.OBLIQ:
      this.rq = Math.sqrt(0.5 * this.qp);
      sinphi = Math.sin(this.lat0);
      this.sinb1 = qsfnz(this.e, sinphi) / this.qp;
      this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1);
      this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * sinphi * sinphi) * this.rq * this.cosb1);
      this.ymf = (this.xmf = this.rq) / this.dd;
      this.xmf *= this.dd;
      break;
    }
  }
  else {
    if (this.mode === this.OBLIQ) {
      this.sinph0 = Math.sin(this.lat0);
      this.cosph0 = Math.cos(this.lat0);
    }
  }
};

/* Lambert Azimuthal Equal Area forward equations--mapping lat,long to x,y
  -----------------------------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var x, y, coslam, sinlam, sinphi, q, sinb, cosb, b, cosphi;
  var lam = p.x;
  var phi = p.y;

  lam = adjust_lon(lam - this.long0);

  if (this.sphere) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    coslam = Math.cos(lam);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      y = (this.mode === this.EQUIT) ? 1 + cosphi * coslam : 1 + this.sinph0 * sinphi + this.cosph0 * cosphi * coslam;
      if (y <= EPSLN) {
        return null;
      }
      y = Math.sqrt(2 / y);
      x = y * cosphi * Math.sin(lam);
      y *= (this.mode === this.EQUIT) ? sinphi : this.cosph0 * sinphi - this.sinph0 * cosphi * coslam;
    }
    else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        coslam = -coslam;
      }
      if (Math.abs(phi + this.phi0) < EPSLN) {
        return null;
      }
      y = FORTPI - phi * 0.5;
      y = 2 * ((this.mode === this.S_POLE) ? Math.cos(y) : Math.sin(y));
      x = y * Math.sin(lam);
      y *= coslam;
    }
  }
  else {
    sinb = 0;
    cosb = 0;
    b = 0;
    coslam = Math.cos(lam);
    sinlam = Math.sin(lam);
    sinphi = Math.sin(phi);
    q = qsfnz(this.e, sinphi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinb = q / this.qp;
      cosb = Math.sqrt(1 - sinb * sinb);
    }
    switch (this.mode) {
    case this.OBLIQ:
      b = 1 + this.sinb1 * sinb + this.cosb1 * cosb * coslam;
      break;
    case this.EQUIT:
      b = 1 + cosb * coslam;
      break;
    case this.N_POLE:
      b = HALF_PI + phi;
      q = this.qp - q;
      break;
    case this.S_POLE:
      b = phi - HALF_PI;
      q = this.qp + q;
      break;
    }
    if (Math.abs(b) < EPSLN) {
      return null;
    }
    switch (this.mode) {
    case this.OBLIQ:
    case this.EQUIT:
      b = Math.sqrt(2 / b);
      if (this.mode === this.OBLIQ) {
        y = this.ymf * b * (this.cosb1 * sinb - this.sinb1 * cosb * coslam);
      }
      else {
        y = (b = Math.sqrt(2 / (1 + cosb * coslam))) * sinb * this.ymf;
      }
      x = this.xmf * b * cosb * sinlam;
      break;
    case this.N_POLE:
    case this.S_POLE:
      if (q >= 0) {
        x = (b = Math.sqrt(q)) * sinlam;
        y = coslam * ((this.mode === this.S_POLE) ? b : -b);
      }
      else {
        x = y = 0;
      }
      break;
    }
  }

  p.x = this.a * x + this.x0;
  p.y = this.a * y + this.y0;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var lam, phi, cCe, sCe, q, rho, ab;

  if (this.sphere) {
    var cosz = 0,
      rh, sinz = 0;

    rh = Math.sqrt(x * x + y * y);
    phi = rh * 0.5;
    if (phi > 1) {
      return null;
    }
    phi = 2 * Math.asin(phi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinz = Math.sin(phi);
      cosz = Math.cos(phi);
    }
    switch (this.mode) {
    case this.EQUIT:
      phi = (Math.abs(rh) <= EPSLN) ? 0 : Math.asin(y * sinz / rh);
      x *= sinz;
      y = cosz * rh;
      break;
    case this.OBLIQ:
      phi = (Math.abs(rh) <= EPSLN) ? this.phi0 : Math.asin(cosz * this.sinph0 + y * sinz * this.cosph0 / rh);
      x *= sinz * this.cosph0;
      y = (cosz - Math.sin(phi) * this.sinph0) * rh;
      break;
    case this.N_POLE:
      y = -y;
      phi = HALF_PI - phi;
      break;
    case this.S_POLE:
      phi -= HALF_PI;
      break;
    }
    lam = (y === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ)) ? 0 : Math.atan2(x, y);
  }
  else {
    ab = 0;
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      x /= this.dd;
      y *= this.dd;
      rho = Math.sqrt(x * x + y * y);
      if (rho < EPSLN) {
        p.x = 0;
        p.y = this.phi0;
        return p;
      }
      sCe = 2 * Math.asin(0.5 * rho / this.rq);
      cCe = Math.cos(sCe);
      x *= (sCe = Math.sin(sCe));
      if (this.mode === this.OBLIQ) {
        ab = cCe * this.sinb1 + y * sCe * this.cosb1 / rho;
        q = this.qp * ab;
        y = rho * this.cosb1 * cCe - y * this.sinb1 * sCe;
      }
      else {
        ab = y * sCe / rho;
        q = this.qp * ab;
        y = rho * cCe;
      }
    }
    else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        y = -y;
      }
      q = (x * x + y * y);
      if (!q) {
        p.x = 0;
        p.y = this.phi0;
        return p;
      }
      ab = 1 - q / this.qp;
      if (this.mode === this.S_POLE) {
        ab = -ab;
      }
    }
    lam = Math.atan2(x, y);
    phi = this.authlat(Math.asin(ab), this.apa);
  }


  p.x = adjust_lon(this.long0 + lam);
  p.y = phi;
  return p;
};

/* determine latitude from authalic latitude */
exports.P00 = 0.33333333333333333333;
exports.P01 = 0.17222222222222222222;
exports.P02 = 0.10257936507936507936;
exports.P10 = 0.06388888888888888888;
exports.P11 = 0.06640211640211640211;
exports.P20 = 0.01641501294219154443;

exports.authset = function(es) {
  var t;
  var APA = [];
  APA[0] = es * this.P00;
  t = es * es;
  APA[0] += t * this.P01;
  APA[1] = t * this.P10;
  t *= es;
  APA[0] += t * this.P02;
  APA[1] += t * this.P11;
  APA[2] = t * this.P20;
  return APA;
};

exports.authlat = function(beta, APA) {
  var t = beta + beta;
  return (beta + APA[0] * Math.sin(t) + APA[1] * Math.sin(t + t) + APA[2] * Math.sin(t + t + t));
};
exports.names = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];

},{"../common/adjust_lon":12,"../common/qsfnz":27}],58:[function(require,module,exports){
var EPSLN = 1.0e-10;
var msfnz = require('../common/msfnz');
var tsfnz = require('../common/tsfnz');
var HALF_PI = Math.PI/2;
var sign = require('../common/sign');
var adjust_lon = require('../common/adjust_lon');
var phi2z = require('../common/phi2z');
exports.init = function() {

  // array of:  r_maj,r_min,lat1,lat2,c_lon,c_lat,false_east,false_north
  //double c_lat;                   /* center latitude                      */
  //double c_lon;                   /* center longitude                     */
  //double lat1;                    /* first standard parallel              */
  //double lat2;                    /* second standard parallel             */
  //double r_maj;                   /* major axis                           */
  //double r_min;                   /* minor axis                           */
  //double false_east;              /* x offset in meters                   */
  //double false_north;             /* y offset in meters                   */

  if (!this.lat2) {
    this.lat2 = this.lat1;
  } //if lat2 is not defined
  if (!this.k0) {
    this.k0 = 1;
  }
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  // Standard Parallels cannot be equal and on opposite sides of the equator
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }

  var temp = this.b / this.a;
  this.e = Math.sqrt(1 - temp * temp);

  var sin1 = Math.sin(this.lat1);
  var cos1 = Math.cos(this.lat1);
  var ms1 = msfnz(this.e, sin1, cos1);
  var ts1 = tsfnz(this.e, this.lat1, sin1);

  var sin2 = Math.sin(this.lat2);
  var cos2 = Math.cos(this.lat2);
  var ms2 = msfnz(this.e, sin2, cos2);
  var ts2 = tsfnz(this.e, this.lat2, sin2);

  var ts0 = tsfnz(this.e, this.lat0, Math.sin(this.lat0));

  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns = Math.log(ms1 / ms2) / Math.log(ts1 / ts2);
  }
  else {
    this.ns = sin1;
  }
  if (isNaN(this.ns)) {
    this.ns = sin1;
  }
  this.f0 = ms1 / (this.ns * Math.pow(ts1, this.ns));
  this.rh = this.a * this.f0 * Math.pow(ts0, this.ns);
  if (!this.title) {
    this.title = "Lambert Conformal Conic";
  }
};


// Lambert Conformal conic forward equations--mapping lat,long to x,y
// -----------------------------------------------------------------
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  // singular cases :
  if (Math.abs(2 * Math.abs(lat) - Math.PI) <= EPSLN) {
    lat = sign(lat) * (HALF_PI - 2 * EPSLN);
  }

  var con = Math.abs(Math.abs(lat) - HALF_PI);
  var ts, rh1;
  if (con > EPSLN) {
    ts = tsfnz(this.e, lat, Math.sin(lat));
    rh1 = this.a * this.f0 * Math.pow(ts, this.ns);
  }
  else {
    con = lat * this.ns;
    if (con <= 0) {
      return null;
    }
    rh1 = 0;
  }
  var theta = this.ns * adjust_lon(lon - this.long0);
  p.x = this.k0 * (rh1 * Math.sin(theta)) + this.x0;
  p.y = this.k0 * (this.rh - rh1 * Math.cos(theta)) + this.y0;

  return p;
};

// Lambert Conformal Conic inverse equations--mapping x,y to lat/long
// -----------------------------------------------------------------
exports.inverse = function(p) {

  var rh1, con, ts;
  var lat, lon;
  var x = (p.x - this.x0) / this.k0;
  var y = (this.rh - (p.y - this.y0) / this.k0);
  if (this.ns > 0) {
    rh1 = Math.sqrt(x * x + y * y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(x * x + y * y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2((con * x), (con * y));
  }
  if ((rh1 !== 0) || (this.ns > 0)) {
    con = 1 / this.ns;
    ts = Math.pow((rh1 / (this.a * this.f0)), con);
    lat = phi2z(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  else {
    lat = -HALF_PI;
  }
  lon = adjust_lon(theta / this.ns + this.long0);

  p.x = lon;
  p.y = lat;
  return p;
};

exports.names = ["Lambert Tangential Conformal Conic Projection", "Lambert_Conformal_Conic", "Lambert_Conformal_Conic_2SP", "lcc"];

},{"../common/adjust_lon":12,"../common/msfnz":22,"../common/phi2z":23,"../common/sign":28,"../common/tsfnz":31}],59:[function(require,module,exports){
exports.init = function() {
  //no-op for longlat
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["longlat", "identity"];

},{}],60:[function(require,module,exports){
var msfnz = require('../common/msfnz');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var R2D = 57.29577951308232088;
var adjust_lon = require('../common/adjust_lon');
var FORTPI = Math.PI/4;
var tsfnz = require('../common/tsfnz');
var phi2z = require('../common/phi2z');
exports.init = function() {
  var con = this.b / this.a;
  this.es = 1 - con * con;
  if(!('x0' in this)){
    this.x0 = 0;
  }
  if(!('y0' in this)){
    this.y0 = 0;
  }
  this.e = Math.sqrt(this.es);
  if (this.lat_ts) {
    if (this.sphere) {
      this.k0 = Math.cos(this.lat_ts);
    }
    else {
      this.k0 = msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
    }
  }
  else {
    if (!this.k0) {
      if (this.k) {
        this.k0 = this.k;
      }
      else {
        this.k0 = 1;
      }
    }
  }
};

/* Mercator forward equations--mapping lat,long to x,y
  --------------------------------------------------*/

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  // convert to radians
  if (lat * R2D > 90 && lat * R2D < -90 && lon * R2D > 180 && lon * R2D < -180) {
    return null;
  }

  var x, y;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    return null;
  }
  else {
    if (this.sphere) {
      x = this.x0 + this.a * this.k0 * adjust_lon(lon - this.long0);
      y = this.y0 + this.a * this.k0 * Math.log(Math.tan(FORTPI + 0.5 * lat));
    }
    else {
      var sinphi = Math.sin(lat);
      var ts = tsfnz(this.e, lat, sinphi);
      x = this.x0 + this.a * this.k0 * adjust_lon(lon - this.long0);
      y = this.y0 - this.a * this.k0 * Math.log(ts);
    }
    p.x = x;
    p.y = y;
    return p;
  }
};


/* Mercator inverse equations--mapping x,y to lat/long
  --------------------------------------------------*/
exports.inverse = function(p) {

  var x = p.x - this.x0;
  var y = p.y - this.y0;
  var lon, lat;

  if (this.sphere) {
    lat = HALF_PI - 2 * Math.atan(Math.exp(-y / (this.a * this.k0)));
  }
  else {
    var ts = Math.exp(-y / (this.a * this.k0));
    lat = phi2z(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  lon = adjust_lon(this.long0 + x / (this.a * this.k0));

  p.x = lon;
  p.y = lat;
  return p;
};

exports.names = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "merc"];

},{"../common/adjust_lon":12,"../common/msfnz":22,"../common/phi2z":23,"../common/tsfnz":31}],61:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
/*
  reference
    "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
    The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.
  */


/* Initialize the Miller Cylindrical projection
  -------------------------------------------*/
exports.init = function() {
  //no-op
};


/* Miller Cylindrical forward equations--mapping lat,long to x,y
    ------------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
      -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  var x = this.x0 + this.a * dlon;
  var y = this.y0 + this.a * Math.log(Math.tan((Math.PI / 4) + (lat / 2.5))) * 1.25;

  p.x = x;
  p.y = y;
  return p;
};

/* Miller Cylindrical inverse equations--mapping x,y to lat/long
    ------------------------------------------------------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;

  var lon = adjust_lon(this.long0 + p.x / this.a);
  var lat = 2.5 * (Math.atan(Math.exp(0.8 * p.y / this.a)) - Math.PI / 4);

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Miller_Cylindrical", "mill"];

},{"../common/adjust_lon":12}],62:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var EPSLN = 1.0e-10;
exports.init = function() {};

/* Mollweide forward equations--mapping lat,long to x,y
    ----------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var lon = p.x;
  var lat = p.y;

  var delta_lon = adjust_lon(lon - this.long0);
  var theta = lat;
  var con = Math.PI * Math.sin(lat);

  /* Iterate using the Newton-Raphson method to find theta
      -----------------------------------------------------*/
  for (var i = 0; true; i++) {
    var delta_theta = -(theta + Math.sin(theta) - con) / (1 + Math.cos(theta));
    theta += delta_theta;
    if (Math.abs(delta_theta) < EPSLN) {
      break;
    }
  }
  theta /= 2;

  /* If the latitude is 90 deg, force the x coordinate to be "0 + false easting"
       this is done here because of precision problems with "cos(theta)"
       --------------------------------------------------------------------------*/
  if (Math.PI / 2 - Math.abs(lat) < EPSLN) {
    delta_lon = 0;
  }
  var x = 0.900316316158 * this.a * delta_lon * Math.cos(theta) + this.x0;
  var y = 1.4142135623731 * this.a * Math.sin(theta) + this.y0;

  p.x = x;
  p.y = y;
  return p;
};

exports.inverse = function(p) {
  var theta;
  var arg;

  /* Inverse equations
      -----------------*/
  p.x -= this.x0;
  p.y -= this.y0;
  arg = p.y / (1.4142135623731 * this.a);

  /* Because of division by zero problems, 'arg' can not be 1.  Therefore
       a number very close to one is used instead.
       -------------------------------------------------------------------*/
  if (Math.abs(arg) > 0.999999999999) {
    arg = 0.999999999999;
  }
  theta = Math.asin(arg);
  var lon = adjust_lon(this.long0 + (p.x / (0.900316316158 * this.a * Math.cos(theta))));
  if (lon < (-Math.PI)) {
    lon = -Math.PI;
  }
  if (lon > Math.PI) {
    lon = Math.PI;
  }
  arg = (2 * theta + Math.sin(2 * theta)) / Math.PI;
  if (Math.abs(arg) > 1) {
    arg = 1;
  }
  var lat = Math.asin(arg);

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Mollweide", "moll"];

},{"../common/adjust_lon":12}],63:[function(require,module,exports){
var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
/*
  reference
    Department of Land and Survey Technical Circular 1973/32
      http://www.linz.govt.nz/docs/miscellaneous/nz-map-definition.pdf
    OSG Technical Report 4.1
      http://www.linz.govt.nz/docs/miscellaneous/nzmg.pdf
  */

/**
 * iterations: Number of iterations to refine inverse transform.
 *     0 -> km accuracy
 *     1 -> m accuracy -- suitable for most mapping applications
 *     2 -> mm accuracy
 */
exports.iterations = 1;

exports.init = function() {
  this.A = [];
  this.A[1] = 0.6399175073;
  this.A[2] = -0.1358797613;
  this.A[3] = 0.063294409;
  this.A[4] = -0.02526853;
  this.A[5] = 0.0117879;
  this.A[6] = -0.0055161;
  this.A[7] = 0.0026906;
  this.A[8] = -0.001333;
  this.A[9] = 0.00067;
  this.A[10] = -0.00034;

  this.B_re = [];
  this.B_im = [];
  this.B_re[1] = 0.7557853228;
  this.B_im[1] = 0;
  this.B_re[2] = 0.249204646;
  this.B_im[2] = 0.003371507;
  this.B_re[3] = -0.001541739;
  this.B_im[3] = 0.041058560;
  this.B_re[4] = -0.10162907;
  this.B_im[4] = 0.01727609;
  this.B_re[5] = -0.26623489;
  this.B_im[5] = -0.36249218;
  this.B_re[6] = -0.6870983;
  this.B_im[6] = -1.1651967;

  this.C_re = [];
  this.C_im = [];
  this.C_re[1] = 1.3231270439;
  this.C_im[1] = 0;
  this.C_re[2] = -0.577245789;
  this.C_im[2] = -0.007809598;
  this.C_re[3] = 0.508307513;
  this.C_im[3] = -0.112208952;
  this.C_re[4] = -0.15094762;
  this.C_im[4] = 0.18200602;
  this.C_re[5] = 1.01418179;
  this.C_im[5] = 1.64497696;
  this.C_re[6] = 1.9660549;
  this.C_im[6] = 2.5127645;

  this.D = [];
  this.D[1] = 1.5627014243;
  this.D[2] = 0.5185406398;
  this.D[3] = -0.03333098;
  this.D[4] = -0.1052906;
  this.D[5] = -0.0368594;
  this.D[6] = 0.007317;
  this.D[7] = 0.01220;
  this.D[8] = 0.00394;
  this.D[9] = -0.0013;
};

/**
    New Zealand Map Grid Forward  - long/lat to x/y
    long/lat in radians
  */
exports.forward = function(p) {
  var n;
  var lon = p.x;
  var lat = p.y;

  var delta_lat = lat - this.lat0;
  var delta_lon = lon - this.long0;

  // 1. Calculate d_phi and d_psi    ...                          // and d_lambda
  // For this algorithm, delta_latitude is in seconds of arc x 10-5, so we need to scale to those units. Longitude is radians.
  var d_phi = delta_lat / SEC_TO_RAD * 1E-5;
  var d_lambda = delta_lon;
  var d_phi_n = 1; // d_phi^0

  var d_psi = 0;
  for (n = 1; n <= 10; n++) {
    d_phi_n = d_phi_n * d_phi;
    d_psi = d_psi + this.A[n] * d_phi_n;
  }

  // 2. Calculate theta
  var th_re = d_psi;
  var th_im = d_lambda;

  // 3. Calculate z
  var th_n_re = 1;
  var th_n_im = 0; // theta^0
  var th_n_re1;
  var th_n_im1;

  var z_re = 0;
  var z_im = 0;
  for (n = 1; n <= 6; n++) {
    th_n_re1 = th_n_re * th_re - th_n_im * th_im;
    th_n_im1 = th_n_im * th_re + th_n_re * th_im;
    th_n_re = th_n_re1;
    th_n_im = th_n_im1;
    z_re = z_re + this.B_re[n] * th_n_re - this.B_im[n] * th_n_im;
    z_im = z_im + this.B_im[n] * th_n_re + this.B_re[n] * th_n_im;
  }

  // 4. Calculate easting and northing
  p.x = (z_im * this.a) + this.x0;
  p.y = (z_re * this.a) + this.y0;

  return p;
};


/**
    New Zealand Map Grid Inverse  -  x/y to long/lat
  */
exports.inverse = function(p) {
  var n;
  var x = p.x;
  var y = p.y;

  var delta_x = x - this.x0;
  var delta_y = y - this.y0;

  // 1. Calculate z
  var z_re = delta_y / this.a;
  var z_im = delta_x / this.a;

  // 2a. Calculate theta - first approximation gives km accuracy
  var z_n_re = 1;
  var z_n_im = 0; // z^0
  var z_n_re1;
  var z_n_im1;

  var th_re = 0;
  var th_im = 0;
  for (n = 1; n <= 6; n++) {
    z_n_re1 = z_n_re * z_re - z_n_im * z_im;
    z_n_im1 = z_n_im * z_re + z_n_re * z_im;
    z_n_re = z_n_re1;
    z_n_im = z_n_im1;
    th_re = th_re + this.C_re[n] * z_n_re - this.C_im[n] * z_n_im;
    th_im = th_im + this.C_im[n] * z_n_re + this.C_re[n] * z_n_im;
  }

  // 2b. Iterate to refine the accuracy of the calculation
  //        0 iterations gives km accuracy
  //        1 iteration gives m accuracy -- good enough for most mapping applications
  //        2 iterations bives mm accuracy
  for (var i = 0; i < this.iterations; i++) {
    var th_n_re = th_re;
    var th_n_im = th_im;
    var th_n_re1;
    var th_n_im1;

    var num_re = z_re;
    var num_im = z_im;
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      num_re = num_re + (n - 1) * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      num_im = num_im + (n - 1) * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }

    th_n_re = 1;
    th_n_im = 0;
    var den_re = this.B_re[1];
    var den_im = this.B_im[1];
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      den_re = den_re + n * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      den_im = den_im + n * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }

    // Complex division
    var den2 = den_re * den_re + den_im * den_im;
    th_re = (num_re * den_re + num_im * den_im) / den2;
    th_im = (num_im * den_re - num_re * den_im) / den2;
  }

  // 3. Calculate d_phi              ...                                    // and d_lambda
  var d_psi = th_re;
  var d_lambda = th_im;
  var d_psi_n = 1; // d_psi^0

  var d_phi = 0;
  for (n = 1; n <= 9; n++) {
    d_psi_n = d_psi_n * d_psi;
    d_phi = d_phi + this.D[n] * d_psi_n;
  }

  // 4. Calculate latitude and longitude
  // d_phi is calcuated in second of arc * 10^-5, so we need to scale back to radians. d_lambda is in radians.
  var lat = this.lat0 + (d_phi * SEC_TO_RAD * 1E5);
  var lon = this.long0 + d_lambda;

  p.x = lon;
  p.y = lat;

  return p;
};
exports.names = ["New_Zealand_Map_Grid", "nzmg"];
},{}],64:[function(require,module,exports){
var tsfnz = require('../common/tsfnz');
var adjust_lon = require('../common/adjust_lon');
var phi2z = require('../common/phi2z');
var HALF_PI = Math.PI/2;
var FORTPI = Math.PI/4;
var EPSLN = 1.0e-10;

/* Initialize the Oblique Mercator  projection
    ------------------------------------------*/
exports.init = function() {
  this.no_off = this.no_off || false;
  this.no_rot = this.no_rot || false;

  if (isNaN(this.k0)) {
    this.k0 = 1;
  }
  var sinlat = Math.sin(this.lat0);
  var coslat = Math.cos(this.lat0);
  var con = this.e * sinlat;

  this.bl = Math.sqrt(1 + this.es / (1 - this.es) * Math.pow(coslat, 4));
  this.al = this.a * this.bl * this.k0 * Math.sqrt(1 - this.es) / (1 - con * con);
  var t0 = tsfnz(this.e, this.lat0, sinlat);
  var dl = this.bl / coslat * Math.sqrt((1 - this.es) / (1 - con * con));
  if (dl * dl < 1) {
    dl = 1;
  }
  var fl;
  var gl;
  if (!isNaN(this.longc)) {
    //Central point and azimuth method

    if (this.lat0 >= 0) {
      fl = dl + Math.sqrt(dl * dl - 1);
    }
    else {
      fl = dl - Math.sqrt(dl * dl - 1);
    }
    this.el = fl * Math.pow(t0, this.bl);
    gl = 0.5 * (fl - 1 / fl);
    this.gamma0 = Math.asin(Math.sin(this.alpha) / dl);
    this.long0 = this.longc - Math.asin(gl * Math.tan(this.gamma0)) / this.bl;

  }
  else {
    //2 points method
    var t1 = tsfnz(this.e, this.lat1, Math.sin(this.lat1));
    var t2 = tsfnz(this.e, this.lat2, Math.sin(this.lat2));
    if (this.lat0 >= 0) {
      this.el = (dl + Math.sqrt(dl * dl - 1)) * Math.pow(t0, this.bl);
    }
    else {
      this.el = (dl - Math.sqrt(dl * dl - 1)) * Math.pow(t0, this.bl);
    }
    var hl = Math.pow(t1, this.bl);
    var ll = Math.pow(t2, this.bl);
    fl = this.el / hl;
    gl = 0.5 * (fl - 1 / fl);
    var jl = (this.el * this.el - ll * hl) / (this.el * this.el + ll * hl);
    var pl = (ll - hl) / (ll + hl);
    var dlon12 = adjust_lon(this.long1 - this.long2);
    this.long0 = 0.5 * (this.long1 + this.long2) - Math.atan(jl * Math.tan(0.5 * this.bl * (dlon12)) / pl) / this.bl;
    this.long0 = adjust_lon(this.long0);
    var dlon10 = adjust_lon(this.long1 - this.long0);
    this.gamma0 = Math.atan(Math.sin(this.bl * (dlon10)) / gl);
    this.alpha = Math.asin(dl * Math.sin(this.gamma0));
  }

  if (this.no_off) {
    this.uc = 0;
  }
  else {
    if (this.lat0 >= 0) {
      this.uc = this.al / this.bl * Math.atan2(Math.sqrt(dl * dl - 1), Math.cos(this.alpha));
    }
    else {
      this.uc = -1 * this.al / this.bl * Math.atan2(Math.sqrt(dl * dl - 1), Math.cos(this.alpha));
    }
  }

};


/* Oblique Mercator forward equations--mapping lat,long to x,y
    ----------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var dlon = adjust_lon(lon - this.long0);
  var us, vs;
  var con;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    if (lat > 0) {
      con = -1;
    }
    else {
      con = 1;
    }
    vs = this.al / this.bl * Math.log(Math.tan(FORTPI + con * this.gamma0 * 0.5));
    us = -1 * con * HALF_PI * this.al / this.bl;
  }
  else {
    var t = tsfnz(this.e, lat, Math.sin(lat));
    var ql = this.el / Math.pow(t, this.bl);
    var sl = 0.5 * (ql - 1 / ql);
    var tl = 0.5 * (ql + 1 / ql);
    var vl = Math.sin(this.bl * (dlon));
    var ul = (sl * Math.sin(this.gamma0) - vl * Math.cos(this.gamma0)) / tl;
    if (Math.abs(Math.abs(ul) - 1) <= EPSLN) {
      vs = Number.POSITIVE_INFINITY;
    }
    else {
      vs = 0.5 * this.al * Math.log((1 - ul) / (1 + ul)) / this.bl;
    }
    if (Math.abs(Math.cos(this.bl * (dlon))) <= EPSLN) {
      us = this.al * this.bl * (dlon);
    }
    else {
      us = this.al * Math.atan2(sl * Math.cos(this.gamma0) + vl * Math.sin(this.gamma0), Math.cos(this.bl * dlon)) / this.bl;
    }
  }

  if (this.no_rot) {
    p.x = this.x0 + us;
    p.y = this.y0 + vs;
  }
  else {

    us -= this.uc;
    p.x = this.x0 + vs * Math.cos(this.alpha) + us * Math.sin(this.alpha);
    p.y = this.y0 + us * Math.cos(this.alpha) - vs * Math.sin(this.alpha);
  }
  return p;
};

exports.inverse = function(p) {
  var us, vs;
  if (this.no_rot) {
    vs = p.y - this.y0;
    us = p.x - this.x0;
  }
  else {
    vs = (p.x - this.x0) * Math.cos(this.alpha) - (p.y - this.y0) * Math.sin(this.alpha);
    us = (p.y - this.y0) * Math.cos(this.alpha) + (p.x - this.x0) * Math.sin(this.alpha);
    us += this.uc;
  }
  var qp = Math.exp(-1 * this.bl * vs / this.al);
  var sp = 0.5 * (qp - 1 / qp);
  var tp = 0.5 * (qp + 1 / qp);
  var vp = Math.sin(this.bl * us / this.al);
  var up = (vp * Math.cos(this.gamma0) + sp * Math.sin(this.gamma0)) / tp;
  var ts = Math.pow(this.el / Math.sqrt((1 + up) / (1 - up)), 1 / this.bl);
  if (Math.abs(up - 1) < EPSLN) {
    p.x = this.long0;
    p.y = HALF_PI;
  }
  else if (Math.abs(up + 1) < EPSLN) {
    p.x = this.long0;
    p.y = -1 * HALF_PI;
  }
  else {
    p.y = phi2z(this.e, ts);
    p.x = adjust_lon(this.long0 - Math.atan2(sp * Math.cos(this.gamma0) - vp * Math.sin(this.gamma0), Math.cos(this.bl * us / this.al)) / this.bl);
  }
  return p;
};

exports.names = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "omerc"];
},{"../common/adjust_lon":12,"../common/phi2z":23,"../common/tsfnz":31}],65:[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var mlfn = require('../common/mlfn');
var EPSLN = 1.0e-10;
var gN = require('../common/gN');
var MAX_ITER = 20;
exports.init = function() {
  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2); // devait etre dans tmerc.js mais n y est pas donc je commente sinon retour de valeurs nulles
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);
  this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0); //si que des zeros le calcul ne se fait pas
};


/* Polyconic forward equations--mapping lat,long to x,y
    ---------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y, el;
  var dlon = adjust_lon(lon - this.long0);
  el = dlon * Math.sin(lat);
  if (this.sphere) {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.a * this.lat0;
    }
    else {
      x = this.a * Math.sin(el) / Math.tan(lat);
      y = this.a * (adjust_lat(lat - this.lat0) + (1 - Math.cos(el)) / Math.tan(lat));
    }
  }
  else {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.ml0;
    }
    else {
      var nl = gN(this.a, this.e, Math.sin(lat)) / Math.tan(lat);
      x = nl * Math.sin(el);
      y = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, lat) - this.ml0 + nl * (1 - Math.cos(el));
    }

  }
  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
};


/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  var lon, lat, x, y, i;
  var al, bl;
  var phi, dphi;
  x = p.x - this.x0;
  y = p.y - this.y0;

  if (this.sphere) {
    if (Math.abs(y + this.a * this.lat0) <= EPSLN) {
      lon = adjust_lon(x / this.a + this.long0);
      lat = 0;
    }
    else {
      al = this.lat0 + y / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var tanphi;
      for (i = MAX_ITER; i; --i) {
        tanphi = Math.tan(phi);
        dphi = -1 * (al * (phi * tanphi + 1) - phi - 0.5 * (phi * phi + bl) * tanphi) / ((phi - al) / tanphi - 1);
        phi += dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }
      lon = adjust_lon(this.long0 + (Math.asin(x * Math.tan(phi) / this.a)) / Math.sin(lat));
    }
  }
  else {
    if (Math.abs(y + this.ml0) <= EPSLN) {
      lat = 0;
      lon = adjust_lon(this.long0 + x / this.a);
    }
    else {

      al = (this.ml0 + y) / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var cl, mln, mlnp, ma;
      var con;
      for (i = MAX_ITER; i; --i) {
        con = this.e * Math.sin(phi);
        cl = Math.sqrt(1 - con * con) * Math.tan(phi);
        mln = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, phi);
        mlnp = this.e0 - 2 * this.e1 * Math.cos(2 * phi) + 4 * this.e2 * Math.cos(4 * phi) - 6 * this.e3 * Math.cos(6 * phi);
        ma = mln / this.a;
        dphi = (al * (cl * ma + 1) - ma - 0.5 * cl * (ma * ma + bl)) / (this.es * Math.sin(2 * phi) * (ma * ma + bl - 2 * al * ma) / (4 * cl) + (al - ma) * (cl * mlnp - 2 / Math.sin(2 * phi)) - mlnp);
        phi -= dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }

      //lat=phi4z(this.e,this.e0,this.e1,this.e2,this.e3,al,bl,0,0);
      cl = Math.sqrt(1 - this.es * Math.pow(Math.sin(lat), 2)) * Math.tan(lat);
      lon = adjust_lon(this.long0 + Math.asin(x * cl / this.a) / Math.sin(lat));
    }
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Polyconic", "poly"];
},{"../common/adjust_lat":11,"../common/adjust_lon":12,"../common/e0fn":14,"../common/e1fn":15,"../common/e2fn":16,"../common/e3fn":17,"../common/gN":18,"../common/mlfn":21}],66:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var pj_enfn = require('../common/pj_enfn');
var MAX_ITER = 20;
var pj_mlfn = require('../common/pj_mlfn');
var pj_inv_mlfn = require('../common/pj_inv_mlfn');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');
exports.init = function() {
  /* Place parameters in static storage for common use
    -------------------------------------------------*/


  if (!this.sphere) {
    this.en = pj_enfn(this.es);
  }
  else {
    this.n = 1;
    this.m = 0;
    this.es = 0;
    this.C_y = Math.sqrt((this.m + 1) / this.n);
    this.C_x = this.C_y / (this.m + 1);
  }

};

/* Sinusoidal forward equations--mapping lat,long to x,y
  -----------------------------------------------------*/
exports.forward = function(p) {
  var x, y;
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
    -----------------*/
  lon = adjust_lon(lon - this.long0);

  if (this.sphere) {
    if (!this.m) {
      lat = this.n !== 1 ? Math.asin(this.n * Math.sin(lat)) : lat;
    }
    else {
      var k = this.n * Math.sin(lat);
      for (var i = MAX_ITER; i; --i) {
        var V = (this.m * lat + Math.sin(lat) - k) / (this.m + Math.cos(lat));
        lat -= V;
        if (Math.abs(V) < EPSLN) {
          break;
        }
      }
    }
    x = this.a * this.C_x * lon * (this.m + Math.cos(lat));
    y = this.a * this.C_y * lat;

  }
  else {

    var s = Math.sin(lat);
    var c = Math.cos(lat);
    y = this.a * pj_mlfn(lat, s, c, this.en);
    x = this.a * lon * c / Math.sqrt(1 - this.es * s * s);
  }

  p.x = x;
  p.y = y;
  return p;
};

exports.inverse = function(p) {
  var lat, temp, lon, s;

  p.x -= this.x0;
  lon = p.x / this.a;
  p.y -= this.y0;
  lat = p.y / this.a;

  if (this.sphere) {
    lat /= this.C_y;
    lon = lon / (this.C_x * (this.m + Math.cos(lat)));
    if (this.m) {
      lat = asinz((this.m * lat + Math.sin(lat)) / this.n);
    }
    else if (this.n !== 1) {
      lat = asinz(Math.sin(lat) / this.n);
    }
    lon = adjust_lon(lon + this.long0);
    lat = adjust_lat(lat);
  }
  else {
    lat = pj_inv_mlfn(p.y / this.a, this.es, this.en);
    s = Math.abs(lat);
    if (s < HALF_PI) {
      s = Math.sin(lat);
      temp = this.long0 + p.x * Math.sqrt(1 - this.es * s * s) / (this.a * Math.cos(lat));
      //temp = this.long0 + p.x / (this.a * Math.cos(lat));
      lon = adjust_lon(temp);
    }
    else if ((s - EPSLN) < HALF_PI) {
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Sinusoidal", "sinu"];
},{"../common/adjust_lat":11,"../common/adjust_lon":12,"../common/asinz":13,"../common/pj_enfn":24,"../common/pj_inv_mlfn":25,"../common/pj_mlfn":26}],67:[function(require,module,exports){
/*
  references:
    Formules et constantes pour le Calcul pour la
    projection cylindrique conforme à axe oblique et pour la transformation entre
    des systèmes de référence.
    http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.77004.DownloadFile.tmp/swissprojectionfr.pdf
  */
exports.init = function() {
  var phy0 = this.lat0;
  this.lambda0 = this.long0;
  var sinPhy0 = Math.sin(phy0);
  var semiMajorAxis = this.a;
  var invF = this.rf;
  var flattening = 1 / invF;
  var e2 = 2 * flattening - Math.pow(flattening, 2);
  var e = this.e = Math.sqrt(e2);
  this.R = this.k0 * semiMajorAxis * Math.sqrt(1 - e2) / (1 - e2 * Math.pow(sinPhy0, 2));
  this.alpha = Math.sqrt(1 + e2 / (1 - e2) * Math.pow(Math.cos(phy0), 4));
  this.b0 = Math.asin(sinPhy0 / this.alpha);
  var k1 = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2));
  var k2 = Math.log(Math.tan(Math.PI / 4 + phy0 / 2));
  var k3 = Math.log((1 + e * sinPhy0) / (1 - e * sinPhy0));
  this.K = k1 - this.alpha * k2 + this.alpha * e / 2 * k3;
};


exports.forward = function(p) {
  var Sa1 = Math.log(Math.tan(Math.PI / 4 - p.y / 2));
  var Sa2 = this.e / 2 * Math.log((1 + this.e * Math.sin(p.y)) / (1 - this.e * Math.sin(p.y)));
  var S = -this.alpha * (Sa1 + Sa2) + this.K;

  // spheric latitude
  var b = 2 * (Math.atan(Math.exp(S)) - Math.PI / 4);

  // spheric longitude
  var I = this.alpha * (p.x - this.lambda0);

  // psoeudo equatorial rotation
  var rotI = Math.atan(Math.sin(I) / (Math.sin(this.b0) * Math.tan(b) + Math.cos(this.b0) * Math.cos(I)));

  var rotB = Math.asin(Math.cos(this.b0) * Math.sin(b) - Math.sin(this.b0) * Math.cos(b) * Math.cos(I));

  p.y = this.R / 2 * Math.log((1 + Math.sin(rotB)) / (1 - Math.sin(rotB))) + this.y0;
  p.x = this.R * rotI + this.x0;
  return p;
};

exports.inverse = function(p) {
  var Y = p.x - this.x0;
  var X = p.y - this.y0;

  var rotI = Y / this.R;
  var rotB = 2 * (Math.atan(Math.exp(X / this.R)) - Math.PI / 4);

  var b = Math.asin(Math.cos(this.b0) * Math.sin(rotB) + Math.sin(this.b0) * Math.cos(rotB) * Math.cos(rotI));
  var I = Math.atan(Math.sin(rotI) / (Math.cos(this.b0) * Math.cos(rotI) - Math.sin(this.b0) * Math.tan(rotB)));

  var lambda = this.lambda0 + I / this.alpha;

  var S = 0;
  var phy = b;
  var prevPhy = -1000;
  var iteration = 0;
  while (Math.abs(phy - prevPhy) > 0.0000001) {
    if (++iteration > 20) {
      //...reportError("omercFwdInfinity");
      return;
    }
    //S = Math.log(Math.tan(Math.PI / 4 + phy / 2));
    S = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + b / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(phy)) / 2));
    prevPhy = phy;
    phy = 2 * Math.atan(Math.exp(S)) - Math.PI / 2;
  }

  p.x = lambda;
  p.y = phy;
  return p;
};

exports.names = ["somerc"];

},{}],68:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var sign = require('../common/sign');
var msfnz = require('../common/msfnz');
var tsfnz = require('../common/tsfnz');
var phi2z = require('../common/phi2z');
var adjust_lon = require('../common/adjust_lon');
exports.ssfn_ = function(phit, sinphi, eccen) {
  sinphi *= eccen;
  return (Math.tan(0.5 * (HALF_PI + phit)) * Math.pow((1 - sinphi) / (1 + sinphi), 0.5 * eccen));
};

exports.init = function() {
  this.coslat0 = Math.cos(this.lat0);
  this.sinlat0 = Math.sin(this.lat0);
  if (this.sphere) {
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * (1 + sign(this.lat0) * Math.sin(this.lat_ts));
    }
  }
  else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (this.lat0 > 0) {
        //North pole
        //trace('stere:north pole');
        this.con = 1;
      }
      else {
        //South pole
        //trace('stere:south pole');
        this.con = -1;
      }
    }
    this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e));
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * this.cons * msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / tsfnz(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts));
    }
    this.ms1 = msfnz(this.e, this.sinlat0, this.coslat0);
    this.X0 = 2 * Math.atan(this.ssfn_(this.lat0, this.sinlat0, this.e)) - HALF_PI;
    this.cosX0 = Math.cos(this.X0);
    this.sinX0 = Math.sin(this.X0);
  }
};

// Stereographic forward equations--mapping lat,long to x,y
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var sinlat = Math.sin(lat);
  var coslat = Math.cos(lat);
  var A, X, sinX, cosX, ts, rh;
  var dlon = adjust_lon(lon - this.long0);

  if (Math.abs(Math.abs(lon - this.long0) - Math.PI) <= EPSLN && Math.abs(lat + this.lat0) <= EPSLN) {
    //case of the origine point
    //trace('stere:this is the origin point');
    p.x = NaN;
    p.y = NaN;
    return p;
  }
  if (this.sphere) {
    //trace('stere:sphere case');
    A = 2 * this.k0 / (1 + this.sinlat0 * sinlat + this.coslat0 * coslat * Math.cos(dlon));
    p.x = this.a * A * coslat * Math.sin(dlon) + this.x0;
    p.y = this.a * A * (this.coslat0 * sinlat - this.sinlat0 * coslat * Math.cos(dlon)) + this.y0;
    return p;
  }
  else {
    X = 2 * Math.atan(this.ssfn_(lat, sinlat, this.e)) - HALF_PI;
    cosX = Math.cos(X);
    sinX = Math.sin(X);
    if (Math.abs(this.coslat0) <= EPSLN) {
      ts = tsfnz(this.e, lat * this.con, this.con * sinlat);
      rh = 2 * this.a * this.k0 * ts / this.cons;
      p.x = this.x0 + rh * Math.sin(lon - this.long0);
      p.y = this.y0 - this.con * rh * Math.cos(lon - this.long0);
      //trace(p.toString());
      return p;
    }
    else if (Math.abs(this.sinlat0) < EPSLN) {
      //Eq
      //trace('stere:equateur');
      A = 2 * this.a * this.k0 / (1 + cosX * Math.cos(dlon));
      p.y = A * sinX;
    }
    else {
      //other case
      //trace('stere:normal case');
      A = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * sinX + this.cosX0 * cosX * Math.cos(dlon)));
      p.y = A * (this.cosX0 * sinX - this.sinX0 * cosX * Math.cos(dlon)) + this.y0;
    }
    p.x = A * cosX * Math.sin(dlon) + this.x0;
  }
  //trace(p.toString());
  return p;
};


//* Stereographic inverse equations--mapping x,y to lat/long
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat, ts, ce, Chi;
  var rh = Math.sqrt(p.x * p.x + p.y * p.y);
  if (this.sphere) {
    var c = 2 * Math.atan(rh / (0.5 * this.a * this.k0));
    lon = this.long0;
    lat = this.lat0;
    if (rh <= EPSLN) {
      p.x = lon;
      p.y = lat;
      return p;
    }
    lat = Math.asin(Math.cos(c) * this.sinlat0 + p.y * Math.sin(c) * this.coslat0 / rh);
    if (Math.abs(this.coslat0) < EPSLN) {
      if (this.lat0 > 0) {
        lon = adjust_lon(this.long0 + Math.atan2(p.x, - 1 * p.y));
      }
      else {
        lon = adjust_lon(this.long0 + Math.atan2(p.x, p.y));
      }
    }
    else {
      lon = adjust_lon(this.long0 + Math.atan2(p.x * Math.sin(c), rh * this.coslat0 * Math.cos(c) - p.y * this.sinlat0 * Math.sin(c)));
    }
    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (rh <= EPSLN) {
        lat = this.lat0;
        lon = this.long0;
        p.x = lon;
        p.y = lat;
        //trace(p.toString());
        return p;
      }
      p.x *= this.con;
      p.y *= this.con;
      ts = rh * this.cons / (2 * this.a * this.k0);
      lat = this.con * phi2z(this.e, ts);
      lon = this.con * adjust_lon(this.con * this.long0 + Math.atan2(p.x, - 1 * p.y));
    }
    else {
      ce = 2 * Math.atan(rh * this.cosX0 / (2 * this.a * this.k0 * this.ms1));
      lon = this.long0;
      if (rh <= EPSLN) {
        Chi = this.X0;
      }
      else {
        Chi = Math.asin(Math.cos(ce) * this.sinX0 + p.y * Math.sin(ce) * this.cosX0 / rh);
        lon = adjust_lon(this.long0 + Math.atan2(p.x * Math.sin(ce), rh * this.cosX0 * Math.cos(ce) - p.y * this.sinX0 * Math.sin(ce)));
      }
      lat = -1 * phi2z(this.e, Math.tan(0.5 * (HALF_PI + Chi)));
    }
  }
  p.x = lon;
  p.y = lat;

  //trace(p.toString());
  return p;

};
exports.names = ["stere", "Stereographic_South_Pole", "Polar Stereographic (variant B)"];

},{"../common/adjust_lon":12,"../common/msfnz":22,"../common/phi2z":23,"../common/sign":28,"../common/tsfnz":31}],69:[function(require,module,exports){
var gauss = require('./gauss');
var adjust_lon = require('../common/adjust_lon');
exports.init = function() {
  gauss.init.apply(this);
  if (!this.rc) {
    return;
  }
  this.sinc0 = Math.sin(this.phic0);
  this.cosc0 = Math.cos(this.phic0);
  this.R2 = 2 * this.rc;
  if (!this.title) {
    this.title = "Oblique Stereographic Alternative";
  }
};

exports.forward = function(p) {
  var sinc, cosc, cosl, k;
  p.x = adjust_lon(p.x - this.long0);
  gauss.forward.apply(this, [p]);
  sinc = Math.sin(p.y);
  cosc = Math.cos(p.y);
  cosl = Math.cos(p.x);
  k = this.k0 * this.R2 / (1 + this.sinc0 * sinc + this.cosc0 * cosc * cosl);
  p.x = k * cosc * Math.sin(p.x);
  p.y = k * (this.cosc0 * sinc - this.sinc0 * cosc * cosl);
  p.x = this.a * p.x + this.x0;
  p.y = this.a * p.y + this.y0;
  return p;
};

exports.inverse = function(p) {
  var sinc, cosc, lon, lat, rho;
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;

  p.x /= this.k0;
  p.y /= this.k0;
  if ((rho = Math.sqrt(p.x * p.x + p.y * p.y))) {
    var c = 2 * Math.atan2(rho, this.R2);
    sinc = Math.sin(c);
    cosc = Math.cos(c);
    lat = Math.asin(cosc * this.sinc0 + p.y * sinc * this.cosc0 / rho);
    lon = Math.atan2(p.x * sinc, rho * this.cosc0 * cosc - p.y * this.sinc0 * sinc);
  }
  else {
    lat = this.phic0;
    lon = 0;
  }

  p.x = lon;
  p.y = lat;
  gauss.inverse.apply(this, [p]);
  p.x = adjust_lon(p.x + this.long0);
  return p;
};

exports.names = ["Stereographic_North_Pole", "Oblique_Stereographic", "Polar_Stereographic", "sterea","Oblique Stereographic Alternative"];

},{"../common/adjust_lon":12,"./gauss":54}],70:[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var mlfn = require('../common/mlfn');
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var sign = require('../common/sign');
var asinz = require('../common/asinz');

exports.init = function() {
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);
  this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
};

/**
    Transverse Mercator Forward  - long/lat to x/y
    long/lat in radians
  */
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;

  var delta_lon = adjust_lon(lon - this.long0);
  var con;
  var x, y;
  var sin_phi = Math.sin(lat);
  var cos_phi = Math.cos(lat);

  if (this.sphere) {
    var b = cos_phi * Math.sin(delta_lon);
    if ((Math.abs(Math.abs(b) - 1)) < 0.0000000001) {
      return (93);
    }
    else {
      x = 0.5 * this.a * this.k0 * Math.log((1 + b) / (1 - b));
      con = Math.acos(cos_phi * Math.cos(delta_lon) / Math.sqrt(1 - b * b));
      if (lat < 0) {
        con = -con;
      }
      y = this.a * this.k0 * (con - this.lat0);
    }
  }
  else {
    var al = cos_phi * delta_lon;
    var als = Math.pow(al, 2);
    var c = this.ep2 * Math.pow(cos_phi, 2);
    var tq = Math.tan(lat);
    var t = Math.pow(tq, 2);
    con = 1 - this.es * Math.pow(sin_phi, 2);
    var n = this.a / Math.sqrt(con);
    var ml = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, lat);

    x = this.k0 * n * al * (1 + als / 6 * (1 - t + c + als / 20 * (5 - 18 * t + Math.pow(t, 2) + 72 * c - 58 * this.ep2))) + this.x0;
    y = this.k0 * (ml - this.ml0 + n * tq * (als * (0.5 + als / 24 * (5 - t + 9 * c + 4 * Math.pow(c, 2) + als / 30 * (61 - 58 * t + Math.pow(t, 2) + 600 * c - 330 * this.ep2))))) + this.y0;

  }
  p.x = x;
  p.y = y;
  return p;
};

/**
    Transverse Mercator Inverse  -  x/y to long/lat
  */
exports.inverse = function(p) {
  var con, phi;
  var delta_phi;
  var i;
  var max_iter = 6;
  var lat, lon;

  if (this.sphere) {
    var f = Math.exp(p.x / (this.a * this.k0));
    var g = 0.5 * (f - 1 / f);
    var temp = this.lat0 + p.y / (this.a * this.k0);
    var h = Math.cos(temp);
    con = Math.sqrt((1 - h * h) / (1 + g * g));
    lat = asinz(con);
    if (temp < 0) {
      lat = -lat;
    }
    if ((g === 0) && (h === 0)) {
      lon = this.long0;
    }
    else {
      lon = adjust_lon(Math.atan2(g, h) + this.long0);
    }
  }
  else { // ellipsoidal form
    var x = p.x - this.x0;
    var y = p.y - this.y0;

    con = (this.ml0 + y / this.k0) / this.a;
    phi = con;
    for (i = 0; true; i++) {
      delta_phi = ((con + this.e1 * Math.sin(2 * phi) - this.e2 * Math.sin(4 * phi) + this.e3 * Math.sin(6 * phi)) / this.e0) - phi;
      phi += delta_phi;
      if (Math.abs(delta_phi) <= EPSLN) {
        break;
      }
      if (i >= max_iter) {
        return (95);
      }
    } // for()
    if (Math.abs(phi) < HALF_PI) {
      var sin_phi = Math.sin(phi);
      var cos_phi = Math.cos(phi);
      var tan_phi = Math.tan(phi);
      var c = this.ep2 * Math.pow(cos_phi, 2);
      var cs = Math.pow(c, 2);
      var t = Math.pow(tan_phi, 2);
      var ts = Math.pow(t, 2);
      con = 1 - this.es * Math.pow(sin_phi, 2);
      var n = this.a / Math.sqrt(con);
      var r = n * (1 - this.es) / con;
      var d = x / (n * this.k0);
      var ds = Math.pow(d, 2);
      lat = phi - (n * tan_phi * ds / r) * (0.5 - ds / 24 * (5 + 3 * t + 10 * c - 4 * cs - 9 * this.ep2 - ds / 30 * (61 + 90 * t + 298 * c + 45 * ts - 252 * this.ep2 - 3 * cs)));
      lon = adjust_lon(this.long0 + (d * (1 - ds / 6 * (1 + 2 * t + c - ds / 20 * (5 - 2 * c + 28 * t - 3 * cs + 8 * this.ep2 + 24 * ts))) / cos_phi));
    }
    else {
      lat = HALF_PI * sign(y);
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Transverse_Mercator", "Transverse Mercator", "tmerc"];

},{"../common/adjust_lon":12,"../common/asinz":13,"../common/e0fn":14,"../common/e1fn":15,"../common/e2fn":16,"../common/e3fn":17,"../common/mlfn":21,"../common/sign":28}],71:[function(require,module,exports){
var D2R = 0.01745329251994329577;
var tmerc = require('./tmerc');
exports.dependsOn = 'tmerc';
exports.init = function() {
  if (!this.zone) {
    return;
  }
  this.lat0 = 0;
  this.long0 = ((6 * Math.abs(this.zone)) - 183) * D2R;
  this.x0 = 500000;
  this.y0 = this.utmSouth ? 10000000 : 0;
  this.k0 = 0.9996;

  tmerc.init.apply(this);
  this.forward = tmerc.forward;
  this.inverse = tmerc.inverse;
};
exports.names = ["Universal Transverse Mercator System", "utm"];

},{"./tmerc":70}],72:[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');
/* Initialize the Van Der Grinten projection
  ----------------------------------------*/
exports.init = function() {
  //this.R = 6370997; //Radius of earth
  this.R = this.a;
};

exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  /* Forward equations
    -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  var x, y;

  if (Math.abs(lat) <= EPSLN) {
    x = this.x0 + this.R * dlon;
    y = this.y0;
  }
  var theta = asinz(2 * Math.abs(lat / Math.PI));
  if ((Math.abs(dlon) <= EPSLN) || (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN)) {
    x = this.x0;
    if (lat >= 0) {
      y = this.y0 + Math.PI * this.R * Math.tan(0.5 * theta);
    }
    else {
      y = this.y0 + Math.PI * this.R * -Math.tan(0.5 * theta);
    }
    //  return(OK);
  }
  var al = 0.5 * Math.abs((Math.PI / dlon) - (dlon / Math.PI));
  var asq = al * al;
  var sinth = Math.sin(theta);
  var costh = Math.cos(theta);

  var g = costh / (sinth + costh - 1);
  var gsq = g * g;
  var m = g * (2 / sinth - 1);
  var msq = m * m;
  var con = Math.PI * this.R * (al * (g - msq) + Math.sqrt(asq * (g - msq) * (g - msq) - (msq + asq) * (gsq - msq))) / (msq + asq);
  if (dlon < 0) {
    con = -con;
  }
  x = this.x0 + con;
  //con = Math.abs(con / (Math.PI * this.R));
  var q = asq + g;
  con = Math.PI * this.R * (m * q - al * Math.sqrt((msq + asq) * (asq + 1) - q * q)) / (msq + asq);
  if (lat >= 0) {
    //y = this.y0 + Math.PI * this.R * Math.sqrt(1 - con * con - 2 * al * con);
    y = this.y0 + con;
  }
  else {
    //y = this.y0 - Math.PI * this.R * Math.sqrt(1 - con * con - 2 * al * con);
    y = this.y0 - con;
  }
  p.x = x;
  p.y = y;
  return p;
};

/* Van Der Grinten inverse equations--mapping x,y to lat/long
  ---------------------------------------------------------*/
exports.inverse = function(p) {
  var lon, lat;
  var xx, yy, xys, c1, c2, c3;
  var a1;
  var m1;
  var con;
  var th1;
  var d;

  /* inverse equations
    -----------------*/
  p.x -= this.x0;
  p.y -= this.y0;
  con = Math.PI * this.R;
  xx = p.x / con;
  yy = p.y / con;
  xys = xx * xx + yy * yy;
  c1 = -Math.abs(yy) * (1 + xys);
  c2 = c1 - 2 * yy * yy + xx * xx;
  c3 = -2 * c1 + 1 + 2 * yy * yy + xys * xys;
  d = yy * yy / c3 + (2 * c2 * c2 * c2 / c3 / c3 / c3 - 9 * c1 * c2 / c3 / c3) / 27;
  a1 = (c1 - c2 * c2 / 3 / c3) / c3;
  m1 = 2 * Math.sqrt(-a1 / 3);
  con = ((3 * d) / a1) / m1;
  if (Math.abs(con) > 1) {
    if (con >= 0) {
      con = 1;
    }
    else {
      con = -1;
    }
  }
  th1 = Math.acos(con) / 3;
  if (p.y >= 0) {
    lat = (-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }
  else {
    lat = -(-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }

  if (Math.abs(xx) < EPSLN) {
    lon = this.long0;
  }
  else {
    lon = adjust_lon(this.long0 + Math.PI * (xys - 1 + Math.sqrt(1 + 2 * (xx * xx - yy * yy) + xys * xys)) / 2 / xx);
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Van_der_Grinten_I", "VanDerGrinten", "vandg"];
},{"../common/adjust_lon":12,"../common/asinz":13}],73:[function(require,module,exports){
var D2R = 0.01745329251994329577;
var R2D = 57.29577951308232088;
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var datum_transform = require('./datum_transform');
var adjust_axis = require('./adjust_axis');
var proj = require('./Proj');
var toPoint = require('./common/toPoint');
module.exports = function transform(source, dest, point) {
  var wgs84;
  if (Array.isArray(point)) {
    point = toPoint(point);
  }
  function checkNotWGS(source, dest) {
    return ((source.datum.datum_type === PJD_3PARAM || source.datum.datum_type === PJD_7PARAM) && dest.datumCode !== "WGS84");
  }

  // Workaround for datum shifts towgs84, if either source or destination projection is not wgs84
  if (source.datum && dest.datum && (checkNotWGS(source, dest) || checkNotWGS(dest, source))) {
    wgs84 = new proj('WGS84');
    transform(source, wgs84, point);
    source = wgs84;
  }
  // DGR, 2010/11/12
  if (source.axis !== "enu") {
    adjust_axis(source, false, point);
  }
  // Transform source points to long/lat, if they aren't already.
  if (source.projName === "longlat") {
    point.x *= D2R; // convert degrees to radians
    point.y *= D2R;
  }
  else {
    if (source.to_meter) {
      point.x *= source.to_meter;
      point.y *= source.to_meter;
    }
    source.inverse(point); // Convert Cartesian to longlat
  }
  // Adjust for the prime meridian if necessary
  if (source.from_greenwich) {
    point.x += source.from_greenwich;
  }

  // Convert datums if needed, and if possible.
  point = datum_transform(source.datum, dest.datum, point);

  // Adjust for the prime meridian if necessary
  if (dest.from_greenwich) {
    point.x -= dest.from_greenwich;
  }

  if (dest.projName === "longlat") {
    // convert radians to decimal degrees
    point.x *= R2D;
    point.y *= R2D;
  }
  else { // else project
    dest.forward(point);
    if (dest.to_meter) {
      point.x /= dest.to_meter;
      point.y /= dest.to_meter;
    }
  }

  // DGR, 2010/11/12
  if (dest.axis !== "enu") {
    adjust_axis(dest, true, point);
  }

  return point;
};
},{"./Proj":9,"./adjust_axis":10,"./common/toPoint":30,"./datum_transform":38}],74:[function(require,module,exports){
var D2R = 0.01745329251994329577;
var extend = require('./extend');

function mapit(obj, key, v) {
  obj[key] = v.map(function(aa) {
    var o = {};
    sExpr(aa, o);
    return o;
  }).reduce(function(a, b) {
    return extend(a, b);
  }, {});
}

function sExpr(v, obj) {
  var key;
  if (!Array.isArray(v)) {
    obj[v] = true;
    return;
  }
  else {
    key = v.shift();
    if (key === 'PARAMETER') {
      key = v.shift();
    }
    if (v.length === 1) {
      if (Array.isArray(v[0])) {
        obj[key] = {};
        sExpr(v[0], obj[key]);
      }
      else {
        obj[key] = v[0];
      }
    }
    else if (!v.length) {
      obj[key] = true;
    }
    else if (key === 'TOWGS84') {
      obj[key] = v;
    }
    else {
      obj[key] = {};
      if (['UNIT', 'PRIMEM', 'VERT_DATUM'].indexOf(key) > -1) {
        obj[key] = {
          name: v[0].toLowerCase(),
          convert: v[1]
        };
        if (v.length === 3) {
          obj[key].auth = v[2];
        }
      }
      else if (key === 'SPHEROID') {
        obj[key] = {
          name: v[0],
          a: v[1],
          rf: v[2]
        };
        if (v.length === 4) {
          obj[key].auth = v[3];
        }
      }
      else if (['GEOGCS', 'GEOCCS', 'DATUM', 'VERT_CS', 'COMPD_CS', 'LOCAL_CS', 'FITTED_CS', 'LOCAL_DATUM'].indexOf(key) > -1) {
        v[0] = ['name', v[0]];
        mapit(obj, key, v);
      }
      else if (v.every(function(aa) {
        return Array.isArray(aa);
      })) {
        mapit(obj, key, v);
      }
      else {
        sExpr(v, obj[key]);
      }
    }
  }
}

function rename(obj, params) {
  var outName = params[0];
  var inName = params[1];
  if (!(outName in obj) && (inName in obj)) {
    obj[outName] = obj[inName];
    if (params.length === 3) {
      obj[outName] = params[2](obj[outName]);
    }
  }
}

function d2r(input) {
  return input * D2R;
}

function cleanWKT(wkt) {
  if (wkt.type === 'GEOGCS') {
    wkt.projName = 'longlat';
  }
  else if (wkt.type === 'LOCAL_CS') {
    wkt.projName = 'identity';
    wkt.local = true;
  }
  else {
    if (typeof wkt.PROJECTION === "object") {
      wkt.projName = Object.keys(wkt.PROJECTION)[0];
    }
    else {
      wkt.projName = wkt.PROJECTION;
    }
  }
  if (wkt.UNIT) {
    wkt.units = wkt.UNIT.name.toLowerCase();
    if (wkt.units === 'metre') {
      wkt.units = 'meter';
    }
    if (wkt.UNIT.convert) {
      if (wkt.type === 'GEOGCS') {
        if (wkt.DATUM && wkt.DATUM.SPHEROID) {
          wkt.to_meter = parseFloat(wkt.UNIT.convert, 10)*wkt.DATUM.SPHEROID.a;
        }
      } else {
        wkt.to_meter = parseFloat(wkt.UNIT.convert, 10);
      }
    }
  }

  if (wkt.GEOGCS) {
    //if(wkt.GEOGCS.PRIMEM&&wkt.GEOGCS.PRIMEM.convert){
    //  wkt.from_greenwich=wkt.GEOGCS.PRIMEM.convert*D2R;
    //}
    if (wkt.GEOGCS.DATUM) {
      wkt.datumCode = wkt.GEOGCS.DATUM.name.toLowerCase();
    }
    else {
      wkt.datumCode = wkt.GEOGCS.name.toLowerCase();
    }
    if (wkt.datumCode.slice(0, 2) === 'd_') {
      wkt.datumCode = wkt.datumCode.slice(2);
    }
    if (wkt.datumCode === 'new_zealand_geodetic_datum_1949' || wkt.datumCode === 'new_zealand_1949') {
      wkt.datumCode = 'nzgd49';
    }
    if (wkt.datumCode === "wgs_1984") {
      if (wkt.PROJECTION === 'Mercator_Auxiliary_Sphere') {
        wkt.sphere = true;
      }
      wkt.datumCode = 'wgs84';
    }
    if (wkt.datumCode.slice(-6) === '_ferro') {
      wkt.datumCode = wkt.datumCode.slice(0, - 6);
    }
    if (wkt.datumCode.slice(-8) === '_jakarta') {
      wkt.datumCode = wkt.datumCode.slice(0, - 8);
    }
    if (~wkt.datumCode.indexOf('belge')) {
      wkt.datumCode = "rnb72";
    }
    if (wkt.GEOGCS.DATUM && wkt.GEOGCS.DATUM.SPHEROID) {
      wkt.ellps = wkt.GEOGCS.DATUM.SPHEROID.name.replace('_19', '').replace(/[Cc]larke\_18/, 'clrk');
      if (wkt.ellps.toLowerCase().slice(0, 13) === "international") {
        wkt.ellps = 'intl';
      }

      wkt.a = wkt.GEOGCS.DATUM.SPHEROID.a;
      wkt.rf = parseFloat(wkt.GEOGCS.DATUM.SPHEROID.rf, 10);
    }
    if (~wkt.datumCode.indexOf('osgb_1936')) {
      wkt.datumCode = "osgb36";
    }
  }
  if (wkt.b && !isFinite(wkt.b)) {
    wkt.b = wkt.a;
  }

  function toMeter(input) {
    var ratio = wkt.to_meter || 1;
    return parseFloat(input, 10) * ratio;
  }
  var renamer = function(a) {
    return rename(wkt, a);
  };
  var list = [
    ['standard_parallel_1', 'Standard_Parallel_1'],
    ['standard_parallel_2', 'Standard_Parallel_2'],
    ['false_easting', 'False_Easting'],
    ['false_northing', 'False_Northing'],
    ['central_meridian', 'Central_Meridian'],
    ['latitude_of_origin', 'Latitude_Of_Origin'],
    ['latitude_of_origin', 'Central_Parallel'],
    ['scale_factor', 'Scale_Factor'],
    ['k0', 'scale_factor'],
    ['latitude_of_center', 'Latitude_of_center'],
    ['lat0', 'latitude_of_center', d2r],
    ['longitude_of_center', 'Longitude_Of_Center'],
    ['longc', 'longitude_of_center', d2r],
    ['x0', 'false_easting', toMeter],
    ['y0', 'false_northing', toMeter],
    ['long0', 'central_meridian', d2r],
    ['lat0', 'latitude_of_origin', d2r],
    ['lat0', 'standard_parallel_1', d2r],
    ['lat1', 'standard_parallel_1', d2r],
    ['lat2', 'standard_parallel_2', d2r],
    ['alpha', 'azimuth', d2r],
    ['srsCode', 'name']
  ];
  list.forEach(renamer);
  if (!wkt.long0 && wkt.longc && (wkt.projName === 'Albers_Conic_Equal_Area' || wkt.projName === "Lambert_Azimuthal_Equal_Area")) {
    wkt.long0 = wkt.longc;
  }
  if (!wkt.lat_ts && wkt.lat1 && (wkt.projName === 'Stereographic_South_Pole' || wkt.projName === 'Polar Stereographic (variant B)')) {
    wkt.lat0 = d2r(wkt.lat1 > 0 ? 90 : -90);
    wkt.lat_ts = wkt.lat1;
  }
}
module.exports = function(wkt, self) {
  var lisp = JSON.parse(("," + wkt).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g, ',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g, ',"$1"]').replace(/,\["VERTCS".+/,''));
  var type = lisp.shift();
  var name = lisp.shift();
  lisp.unshift(['name', name]);
  lisp.unshift(['type', type]);
  lisp.unshift('output');
  var obj = {};
  sExpr(lisp, obj);
  cleanWKT(obj.output);
  return extend(self, obj.output);
};

},{"./extend":41}],75:[function(require,module,exports){



/**
 * UTM zones are grouped, and assigned to one of a group of 6
 * sets.
 *
 * {int} @private
 */
var NUM_100K_SETS = 6;

/**
 * The column letters (for easting) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_COLUMN_LETTERS = 'AJSAJS';

/**
 * The row letters (for northing) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_ROW_LETTERS = 'AFAFAF';

var A = 65; // A
var I = 73; // I
var O = 79; // O
var V = 86; // V
var Z = 90; // Z

/**
 * Conversion of lat/lon to MGRS.
 *
 * @param {object} ll Object literal with lat and lon properties on a
 *     WGS84 ellipsoid.
 * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
 *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
 * @return {string} the MGRS string for the given location and accuracy.
 */
exports.forward = function(ll, accuracy) {
  accuracy = accuracy || 5; // default accuracy 1m
  return encode(LLtoUTM({
    lat: ll[1],
    lon: ll[0]
  }), accuracy);
};

/**
 * Conversion of MGRS to lat/lon.
 *
 * @param {string} mgrs MGRS string.
 * @return {array} An array with left (longitude), bottom (latitude), right
 *     (longitude) and top (latitude) values in WGS84, representing the
 *     bounding box for the provided MGRS reference.
 */
exports.inverse = function(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat, bbox.lon, bbox.lat];
  }
  return [bbox.left, bbox.bottom, bbox.right, bbox.top];
};

exports.toPoint = function(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat];
  }
  return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
};
/**
 * Conversion from degrees to radians.
 *
 * @private
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
function degToRad(deg) {
  return (deg * (Math.PI / 180.0));
}

/**
 * Conversion from radians to degrees.
 *
 * @private
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
function radToDeg(rad) {
  return (180.0 * (rad / Math.PI));
}

/**
 * Converts a set of Longitude and Latitude co-ordinates to UTM
 * using the WGS84 ellipsoid.
 *
 * @private
 * @param {object} ll Object literal with lat and lon properties
 *     representing the WGS84 coordinate to be converted.
 * @return {object} Object literal containing the UTM value with easting,
 *     northing, zoneNumber and zoneLetter properties, and an optional
 *     accuracy property in digits. Returns null if the conversion failed.
 */
function LLtoUTM(ll) {
  var Lat = ll.lat;
  var Long = ll.lon;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var k0 = 0.9996;
  var LongOrigin;
  var eccPrimeSquared;
  var N, T, C, A, M;
  var LatRad = degToRad(Lat);
  var LongRad = degToRad(Long);
  var LongOriginRad;
  var ZoneNumber;
  // (int)
  ZoneNumber = Math.floor((Long + 180) / 6) + 1;

  //Make sure the longitude 180.00 is in Zone 60
  if (Long === 180) {
    ZoneNumber = 60;
  }

  // Special zone for Norway
  if (Lat >= 56.0 && Lat < 64.0 && Long >= 3.0 && Long < 12.0) {
    ZoneNumber = 32;
  }

  // Special zones for Svalbard
  if (Lat >= 72.0 && Lat < 84.0) {
    if (Long >= 0.0 && Long < 9.0) {
      ZoneNumber = 31;
    }
    else if (Long >= 9.0 && Long < 21.0) {
      ZoneNumber = 33;
    }
    else if (Long >= 21.0 && Long < 33.0) {
      ZoneNumber = 35;
    }
    else if (Long >= 33.0 && Long < 42.0) {
      ZoneNumber = 37;
    }
  }

  LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin
  // in middle of
  // zone
  LongOriginRad = degToRad(LongOrigin);

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  N = a / Math.sqrt(1 - eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
  T = Math.tan(LatRad) * Math.tan(LatRad);
  C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
  A = Math.cos(LatRad) * (LongRad - LongOriginRad);

  M = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * LatRad - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * LatRad) + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * LatRad) - (35 * eccSquared * eccSquared * eccSquared / 3072) * Math.sin(6 * LatRad));

  var UTMEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0) + 500000.0);

  var UTMNorthing = (k0 * (M + N * Math.tan(LatRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720.0)));
  if (Lat < 0.0) {
    UTMNorthing += 10000000.0; //10000000 meter offset for
    // southern hemisphere
  }

  return {
    northing: Math.round(UTMNorthing),
    easting: Math.round(UTMEasting),
    zoneNumber: ZoneNumber,
    zoneLetter: getLetterDesignator(Lat)
  };
}

/**
 * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
 * class where the Zone can be specified as a single string eg."60N" which
 * is then broken down into the ZoneNumber and ZoneLetter.
 *
 * @private
 * @param {object} utm An object literal with northing, easting, zoneNumber
 *     and zoneLetter properties. If an optional accuracy property is
 *     provided (in meters), a bounding box will be returned instead of
 *     latitude and longitude.
 * @return {object} An object literal containing either lat and lon values
 *     (if no accuracy was provided), or top, right, bottom and left values
 *     for the bounding box calculated according to the provided accuracy.
 *     Returns null if the conversion failed.
 */
function UTMtoLL(utm) {

  var UTMNorthing = utm.northing;
  var UTMEasting = utm.easting;
  var zoneLetter = utm.zoneLetter;
  var zoneNumber = utm.zoneNumber;
  // check the ZoneNummber is valid
  if (zoneNumber < 0 || zoneNumber > 60) {
    return null;
  }

  var k0 = 0.9996;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var eccPrimeSquared;
  var e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  var N1, T1, C1, R1, D, M;
  var LongOrigin;
  var mu, phi1Rad;

  // remove 500,000 meter offset for longitude
  var x = UTMEasting - 500000.0;
  var y = UTMNorthing;

  // We must know somehow if we are in the Northern or Southern
  // hemisphere, this is the only time we use the letter So even
  // if the Zone letter isn't exactly correct it should indicate
  // the hemisphere correctly
  if (zoneLetter < 'N') {
    y -= 10000000.0; // remove 10,000,000 meter offset used
    // for southern hemisphere
  }

  // There are 60 zones with zone 1 being at West -180 to -174
  LongOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
  // in middle of
  // zone

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  M = y / k0;
  mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

  phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
  // double phi1 = ProjMath.radToDeg(phi1Rad);

  N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  D = x / (N1 * k0);

  var lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
  lat = radToDeg(lat);

  var lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
  lon = LongOrigin + radToDeg(lon);

  var result;
  if (utm.accuracy) {
    var topRight = UTMtoLL({
      northing: utm.northing + utm.accuracy,
      easting: utm.easting + utm.accuracy,
      zoneLetter: utm.zoneLetter,
      zoneNumber: utm.zoneNumber
    });
    result = {
      top: topRight.lat,
      right: topRight.lon,
      bottom: lat,
      left: lon
    };
  }
  else {
    result = {
      lat: lat,
      lon: lon
    };
  }
  return result;
}

/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @private
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
function getLetterDesignator(lat) {
  //This is here as an error flag to show that the Latitude is
  //outside MGRS limits
  var LetterDesignator = 'Z';

  if ((84 >= lat) && (lat >= 72)) {
    LetterDesignator = 'X';
  }
  else if ((72 > lat) && (lat >= 64)) {
    LetterDesignator = 'W';
  }
  else if ((64 > lat) && (lat >= 56)) {
    LetterDesignator = 'V';
  }
  else if ((56 > lat) && (lat >= 48)) {
    LetterDesignator = 'U';
  }
  else if ((48 > lat) && (lat >= 40)) {
    LetterDesignator = 'T';
  }
  else if ((40 > lat) && (lat >= 32)) {
    LetterDesignator = 'S';
  }
  else if ((32 > lat) && (lat >= 24)) {
    LetterDesignator = 'R';
  }
  else if ((24 > lat) && (lat >= 16)) {
    LetterDesignator = 'Q';
  }
  else if ((16 > lat) && (lat >= 8)) {
    LetterDesignator = 'P';
  }
  else if ((8 > lat) && (lat >= 0)) {
    LetterDesignator = 'N';
  }
  else if ((0 > lat) && (lat >= -8)) {
    LetterDesignator = 'M';
  }
  else if ((-8 > lat) && (lat >= -16)) {
    LetterDesignator = 'L';
  }
  else if ((-16 > lat) && (lat >= -24)) {
    LetterDesignator = 'K';
  }
  else if ((-24 > lat) && (lat >= -32)) {
    LetterDesignator = 'J';
  }
  else if ((-32 > lat) && (lat >= -40)) {
    LetterDesignator = 'H';
  }
  else if ((-40 > lat) && (lat >= -48)) {
    LetterDesignator = 'G';
  }
  else if ((-48 > lat) && (lat >= -56)) {
    LetterDesignator = 'F';
  }
  else if ((-56 > lat) && (lat >= -64)) {
    LetterDesignator = 'E';
  }
  else if ((-64 > lat) && (lat >= -72)) {
    LetterDesignator = 'D';
  }
  else if ((-72 > lat) && (lat >= -80)) {
    LetterDesignator = 'C';
  }
  return LetterDesignator;
}

/**
 * Encodes a UTM location as MGRS string.
 *
 * @private
 * @param {object} utm An object literal with easting, northing,
 *     zoneLetter, zoneNumber
 * @param {number} accuracy Accuracy in digits (1-5).
 * @return {string} MGRS string for the given UTM location.
 */
function encode(utm, accuracy) {
  // prepend with leading zeroes
  var seasting = "00000" + utm.easting,
    snorthing = "00000" + utm.northing;

  return utm.zoneNumber + utm.zoneLetter + get100kID(utm.easting, utm.northing, utm.zoneNumber) + seasting.substr(seasting.length - 5, accuracy) + snorthing.substr(snorthing.length - 5, accuracy);
}

/**
 * Get the two letter 100k designator for a given UTM easting,
 * northing and zone number value.
 *
 * @private
 * @param {number} easting
 * @param {number} northing
 * @param {number} zoneNumber
 * @return the two letter 100k designator for the given UTM location.
 */
function get100kID(easting, northing, zoneNumber) {
  var setParm = get100kSetForZone(zoneNumber);
  var setColumn = Math.floor(easting / 100000);
  var setRow = Math.floor(northing / 100000) % 20;
  return getLetter100kID(setColumn, setRow, setParm);
}

/**
 * Given a UTM zone number, figure out the MGRS 100K set it is in.
 *
 * @private
 * @param {number} i An UTM zone number.
 * @return {number} the 100k set the UTM zone is in.
 */
function get100kSetForZone(i) {
  var setParm = i % NUM_100K_SETS;
  if (setParm === 0) {
    setParm = NUM_100K_SETS;
  }

  return setParm;
}

/**
 * Get the two-letter MGRS 100k designator given information
 * translated from the UTM northing, easting and zone number.
 *
 * @private
 * @param {number} column the column index as it relates to the MGRS
 *        100k set spreadsheet, created from the UTM easting.
 *        Values are 1-8.
 * @param {number} row the row index as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM northing value. Values
 *        are from 0-19.
 * @param {number} parm the set block, as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM zone. Values are from
 *        1-60.
 * @return two letter MGRS 100k code.
 */
function getLetter100kID(column, row, parm) {
  // colOrigin and rowOrigin are the letters at the origin of the set
  var index = parm - 1;
  var colOrigin = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
  var rowOrigin = SET_ORIGIN_ROW_LETTERS.charCodeAt(index);

  // colInt and rowInt are the letters to build to return
  var colInt = colOrigin + column - 1;
  var rowInt = rowOrigin + row;
  var rollover = false;

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
    rollover = true;
  }

  if (colInt === I || (colOrigin < I && colInt > I) || ((colInt > I || colOrigin < I) && rollover)) {
    colInt++;
  }

  if (colInt === O || (colOrigin < O && colInt > O) || ((colInt > O || colOrigin < O) && rollover)) {
    colInt++;

    if (colInt === I) {
      colInt++;
    }
  }

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
    rollover = true;
  }
  else {
    rollover = false;
  }

  if (((rowInt === I) || ((rowOrigin < I) && (rowInt > I))) || (((rowInt > I) || (rowOrigin < I)) && rollover)) {
    rowInt++;
  }

  if (((rowInt === O) || ((rowOrigin < O) && (rowInt > O))) || (((rowInt > O) || (rowOrigin < O)) && rollover)) {
    rowInt++;

    if (rowInt === I) {
      rowInt++;
    }
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
  }

  var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
  return twoLetter;
}

/**
 * Decode the UTM parameters from a MGRS string.
 *
 * @private
 * @param {string} mgrsString an UPPERCASE coordinate string is expected.
 * @return {object} An object literal with easting, northing, zoneLetter,
 *     zoneNumber and accuracy (in meters) properties.
 */
function decode(mgrsString) {

  if (mgrsString && mgrsString.length === 0) {
    throw ("MGRSPoint coverting from nothing");
  }

  var length = mgrsString.length;

  var hunK = null;
  var sb = "";
  var testChar;
  var i = 0;

  // get Zone number
  while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i))) {
    if (i >= 2) {
      throw ("MGRSPoint bad conversion from: " + mgrsString);
    }
    sb += testChar;
    i++;
  }

  var zoneNumber = parseInt(sb, 10);

  if (i === 0 || i + 3 > length) {
    // A good MGRS string has to be 4-5 digits long,
    // ##AAA/#AAA at least.
    throw ("MGRSPoint bad conversion from: " + mgrsString);
  }

  var zoneLetter = mgrsString.charAt(i++);

  // Should we check the zone letter here? Why not.
  if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O') {
    throw ("MGRSPoint zone letter " + zoneLetter + " not handled: " + mgrsString);
  }

  hunK = mgrsString.substring(i, i += 2);

  var set = get100kSetForZone(zoneNumber);

  var east100k = getEastingFromChar(hunK.charAt(0), set);
  var north100k = getNorthingFromChar(hunK.charAt(1), set);

  // We have a bug where the northing may be 2000000 too low.
  // How
  // do we know when to roll over?

  while (north100k < getMinNorthing(zoneLetter)) {
    north100k += 2000000;
  }

  // calculate the char index for easting/northing separator
  var remainder = length - i;

  if (remainder % 2 !== 0) {
    throw ("MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + mgrsString);
  }

  var sep = remainder / 2;

  var sepEasting = 0.0;
  var sepNorthing = 0.0;
  var accuracyBonus, sepEastingString, sepNorthingString, easting, northing;
  if (sep > 0) {
    accuracyBonus = 100000.0 / Math.pow(10, sep);
    sepEastingString = mgrsString.substring(i, i + sep);
    sepEasting = parseFloat(sepEastingString) * accuracyBonus;
    sepNorthingString = mgrsString.substring(i + sep);
    sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
  }

  easting = sepEasting + east100k;
  northing = sepNorthing + north100k;

  return {
    easting: easting,
    northing: northing,
    zoneLetter: zoneLetter,
    zoneNumber: zoneNumber,
    accuracy: accuracyBonus
  };
}

/**
 * Given the first letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the easting value that
 * should be added to the other, secondary easting value.
 *
 * @private
 * @param {char} e The first letter from a two-letter MGRS 100´k zone.
 * @param {number} set The MGRS table set for the zone number.
 * @return {number} The easting value for the given letter and set.
 */
function getEastingFromChar(e, set) {
  // colOrigin is the letter at the origin of the set for the
  // column
  var curCol = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
  var eastingValue = 100000.0;
  var rewindMarker = false;

  while (curCol !== e.charCodeAt(0)) {
    curCol++;
    if (curCol === I) {
      curCol++;
    }
    if (curCol === O) {
      curCol++;
    }
    if (curCol > Z) {
      if (rewindMarker) {
        throw ("Bad character: " + e);
      }
      curCol = A;
      rewindMarker = true;
    }
    eastingValue += 100000.0;
  }

  return eastingValue;
}

/**
 * Given the second letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the northing value that
 * should be added to the other, secondary northing value. You have to
 * remember that Northings are determined from the equator, and the vertical
 * cycle of letters mean a 2000000 additional northing meters. This happens
 * approx. every 18 degrees of latitude. This method does *NOT* count any
 * additional northings. You have to figure out how many 2000000 meters need
 * to be added for the zone letter of the MGRS coordinate.
 *
 * @private
 * @param {char} n Second letter of the MGRS 100k zone
 * @param {number} set The MGRS table set number, which is dependent on the
 *     UTM zone number.
 * @return {number} The northing value for the given letter and set.
 */
function getNorthingFromChar(n, set) {

  if (n > 'V') {
    throw ("MGRSPoint given invalid Northing " + n);
  }

  // rowOrigin is the letter at the origin of the set for the
  // column
  var curRow = SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
  var northingValue = 0.0;
  var rewindMarker = false;

  while (curRow !== n.charCodeAt(0)) {
    curRow++;
    if (curRow === I) {
      curRow++;
    }
    if (curRow === O) {
      curRow++;
    }
    // fixing a bug making whole application hang in this loop
    // when 'n' is a wrong character
    if (curRow > V) {
      if (rewindMarker) { // making sure that this loop ends
        throw ("Bad character: " + n);
      }
      curRow = A;
      rewindMarker = true;
    }
    northingValue += 100000.0;
  }

  return northingValue;
}

/**
 * The function getMinNorthing returns the minimum northing value of a MGRS
 * zone.
 *
 * Ported from Geotrans' c Lattitude_Band_Value structure table.
 *
 * @private
 * @param {char} zoneLetter The MGRS zone to get the min northing for.
 * @return {number}
 */
function getMinNorthing(zoneLetter) {
  var northing;
  switch (zoneLetter) {
  case 'C':
    northing = 1100000.0;
    break;
  case 'D':
    northing = 2000000.0;
    break;
  case 'E':
    northing = 2800000.0;
    break;
  case 'F':
    northing = 3700000.0;
    break;
  case 'G':
    northing = 4600000.0;
    break;
  case 'H':
    northing = 5500000.0;
    break;
  case 'J':
    northing = 6400000.0;
    break;
  case 'K':
    northing = 7300000.0;
    break;
  case 'L':
    northing = 8200000.0;
    break;
  case 'M':
    northing = 9100000.0;
    break;
  case 'N':
    northing = 0.0;
    break;
  case 'P':
    northing = 800000.0;
    break;
  case 'Q':
    northing = 1700000.0;
    break;
  case 'R':
    northing = 2600000.0;
    break;
  case 'S':
    northing = 3500000.0;
    break;
  case 'T':
    northing = 4400000.0;
    break;
  case 'U':
    northing = 5300000.0;
    break;
  case 'V':
    northing = 6200000.0;
    break;
  case 'W':
    northing = 7000000.0;
    break;
  case 'X':
    northing = 7900000.0;
    break;
  default:
    northing = -1.0;
  }
  if (northing >= 0.0) {
    return northing;
  }
  else {
    throw ("Invalid zone letter: " + zoneLetter);
  }

}

},{}],76:[function(require,module,exports){
module.exports={
  "name": "proj4",
  "version": "2.3.15",
  "description": "Proj4js is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations.",
  "main": "lib/index.js",
  "directories": {
    "test": "test",
    "doc": "docs"
  },
  "scripts": {
    "test": "./node_modules/istanbul/lib/cli.js test ./node_modules/mocha/bin/_mocha test/test.js"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/proj4js/proj4js.git"
  },
  "author": "",
  "license": "MIT",
  "jam": {
    "main": "dist/proj4.js",
    "include": [
      "dist/proj4.js",
      "README.md",
      "AUTHORS",
      "LICENSE.md"
    ]
  },
  "devDependencies": {
    "grunt-cli": "~0.1.13",
    "grunt": "~0.4.2",
    "grunt-contrib-connect": "~0.6.0",
    "grunt-contrib-jshint": "~0.8.0",
    "chai": "~1.8.1",
    "mocha": "~1.17.1",
    "grunt-mocha-phantomjs": "~0.4.0",
    "browserify": "~12.0.1",
    "grunt-browserify": "~4.0.1",
    "grunt-contrib-uglify": "~0.11.1",
    "curl": "git://github.com/cujojs/curl.git",
    "istanbul": "~0.2.4",
    "tin": "~0.4.0"
  },
  "dependencies": {
    "mgrs": "~0.0.2"
  },
  "contributors": [
    {
      "name": "Mike Adair",
      "email": "madair@dmsolutions.ca"
    },
    {
      "name": "Richard Greenwood",
      "email": "rich@greenwoodmap.com"
    },
    {
      "name": "Calvin Metcalf",
      "email": "calvin.metcalf@gmail.com"
    },
    {
      "name": "Richard Marsden",
      "url": "http://www.winwaed.com"
    },
    {
      "name": "T. Mittan"
    },
    {
      "name": "D. Steinwand"
    },
    {
      "name": "S. Nelson"
    }
  ],
  "gitHead": "9fa5249c1f4183d5ddee3c4793dfd7b9f29f1886",
  "bugs": {
    "url": "https://github.com/proj4js/proj4js/issues"
  },
  "homepage": "https://github.com/proj4js/proj4js#readme",
  "_id": "proj4@2.3.15",
  "_shasum": "5ad06e8bca30be0ffa389a49e4565f51f06d089e",
  "_from": "proj4@2.3.15",
  "_npmVersion": "3.8.6",
  "_nodeVersion": "6.1.0",
  "_npmUser": {
    "name": "ahocevar",
    "email": "andreas.hocevar@gmail.com"
  },
  "dist": {
    "shasum": "5ad06e8bca30be0ffa389a49e4565f51f06d089e",
    "tarball": "https://registry.npmjs.org/proj4/-/proj4-2.3.15.tgz"
  },
  "maintainers": [
    {
      "name": "cwmma",
      "email": "calvin.metcalf@gmail.com"
    },
    {
      "name": "ahocevar",
      "email": "andreas.hocevar@gmail.com"
    }
  ],
  "_npmOperationalInternal": {
    "host": "packages-12-west.internal.npmjs.com",
    "tmp": "tmp/proj4-2.3.15.tgz_1471808262546_0.6752060337457806"
  },
  "_resolved": "https://registry.npmjs.org/proj4/-/proj4-2.3.15.tgz"
}

},{}],77:[function(require,module,exports){
(function (global){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function() {
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"performance-now":78}],78:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

}).call(this,require('_process'))

},{"_process":4}]},{},[3])(3)
});
//# sourceMappingURL=summary.js.map
