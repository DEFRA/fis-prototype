(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.LFW || (g.LFW = {})).TargetAreaPage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  latlng: [
    52.9219,
    -1.4758
  ],
  lnglat: [
    -1.4758,
    52.9219
  ]
}

},{}],2:[function(require,module,exports){
/* global $ */

var ol = require('openlayers')
var WarningsMap = require('../warnings-map')
var layers = require('../warnings-map-layers')

function TargetAreaPage (options) {
  var $page = $('main#target-area-page')
  var target = 'map'
  var $target = $('#' + target)
  var $mapColumn = $('.map-column')
  var $mapContainer = $('.map-container')
  var $toggleBase = $('a.toggle-base', $mapContainer)
  var $toggleFull = $('a.toggle-map', $mapContainer)
  var $toggleWarnings = $('a.toggle-warnings')
  var $borderToggleMap = $('a.border-toggle-map')
  var $detailsColumn = $('.details-column')
  var popup = document.getElementById('popup')
  var $popupClose = $('.popup-close')
  $('#popup').show()

  // Build up the target area layer and push to layers.
  var styleFunction = function (feature, resolution) {
    var severity = feature.get('severity')
    var type = feature.getGeometry().getType()

    switch (severity) {
      case -1: // null
      case 4: // no longer in force
        if (type === 'Point') {
          return new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 50],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/public/images/pin-grey.png'
            })
          })
        } else {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#ffffff',
              width: 3
            }),
            fill: new ol.style.Fill({
              color: 'rgba(41, 41, 41, 0.7)'
            })
          })
        }
      case 1: // severe flood warning
      case 2: // flood warning
        if (type === 'Point') {
          return new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 50],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/public/images/pin-red.png'
            })
          })
        } else {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#ffffff',
              width: 3
            }),
            fill: new ol.style.Fill({
              color: 'rgba(227, 0, 15, 0.7)'
            })
          })
        }
      case 3: // flood alert
        if (type === 'Point') {
          return new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 50],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/public/images/pin-orange.png'
            })
          })
        } else {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#ffffff',
              width: 3
            }),
            fill: new ol.style.Fill({
              color: 'rgba(241, 135, 0, 0.7)'
            })
          })
        }
      default:
        return
    }
  }

  var vectorSource = new ol.source.Vector({
    features: [(new ol.format.GeoJSON()).readFeature(options.map.polygon, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    }),
      (new ol.format.GeoJSON()).readFeature(options.map.centroid, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
      ]
  })
  var vectorLayer = new ol.layer.Vector({
    ref: 'target-area',
    source: vectorSource,
    style: styleFunction
  })

  layers.push(vectorLayer)

  // sort out popup overlay
  var overlay = new ol.Overlay({
    element: popup,
    offset: [-150, 0]
  })

  options = $.extend(true, {
    map: {
      coordinates: vectorSource.getFeatures()[1].getGeometry().getCoordinates(),
      layers: layers,
      target: target,
      overlays: [overlay]
    }
  }, options)

  $target.height(options.mapHeight)

  var warningsMap = new WarningsMap(options.map)

  warningsMap.zoomToExtent(vectorSource.getFeatures()[0].getGeometry())

  // Strip out the centroid for the selected target area after source has loaded
  layers[3].getSource().on('change', function (e) {
    if (this.getState() === 'ready') {
      var source = this
      var features = source.getFeatures()
      features.forEach(function (item) {
        if (item.get('fwa_code') === options.map.fwaCode) {
          source.removeFeature(item)
        }
      })
    }
  })

  // show the popup
  warningsMap.showOverlay(options.map.coordinates)

  $popupClose.click(function (e) {
    e.preventDefault()
    warningsMap.showOverlay()
  })

  // toggle base mapping
  $toggleBase.click(function (e) {
    e.preventDefault()
    warningsMap.toggleBase($toggleBase)
    $toggleBase.toggleClass('hide')
  })

  // toggle full screen
  $toggleFull.add($borderToggleMap).click(function (e) {
    e.preventDefault()
    window.scrollTo(0, 0)
    $page.toggleClass('fullscreen')
    $mapColumn.toggleClass('column-half')
    if ($page.hasClass('fullscreen')) {
      $target.css('height', $(window).height() + 'px')
    } else {
      window.onresize()
    }
    warningsMap.updateSize()

    $toggleFull.toggleClass('hide')
  })

  $toggleWarnings.click(function (e) {
    e.preventDefault()
    $toggleWarnings.toggleClass('on')
    warningsMap.toggleLayer('alert-polygons')
    warningsMap.toggleLayer('alert-centroids')
  })

  window.onresize = function () {
    if ($('.visible-mobile:visible').length > 0) {
      $target.height(450)
    } else {
      $target.height($detailsColumn.height())
    }
    warningsMap.updateSize()
  }
}

module.exports = TargetAreaPage

},{"../warnings-map":5,"../warnings-map-layers":3,"openlayers":8}],3:[function(require,module,exports){
var ol = require('openlayers')
var centroidStyle = require('./warnings-map-styles').centroid

module.exports = [
  // Road map
  new ol.layer.Tile({
    ref: 'bing-road',
    source: new ol.source.BingMaps({
      key: 'Ajou-3bB1TMVLPyXyNvMawg4iBPqYYhAN4QMXvOoZvs47Qmrq7L5zio0VsOOAHUr',
      imagerySet: 'road'
    }),
    visible: true
  }),
  // Aerial Map
  new ol.layer.Tile({
    ref: 'bing-aerial',
    source: new ol.source.BingMaps({
      key: 'Ajou-3bB1TMVLPyXyNvMawg4iBPqYYhAN4QMXvOoZvs47Qmrq7L5zio0VsOOAHUr',
      imagerySet: 'AerialWithLabels'
    }),
    visible: false
  }),
  // Alert polygons
  new ol.layer.Image({
    ref: 'alert-polygons',
    source: new ol.source.ImageWMS({
      url: 'https://flood-warning-information.service.gov.uk/flood/ows?service=wms',
      serverType: 'geoserver',
      params: {
        'LAYERS': 'flood_warning_alert'
      }
    })
  }),
  // Alert centroids
  new ol.layer.Vector({
    ref: 'alert-centroids',
    source: new ol.source.Vector({
      url: 'https://flood-warning-information.service.gov.uk/flood/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=flood:flood_warning_alert_centroid&maxFeatures=10000&outputFormat=application/json',
      format: new ol.format.GeoJSON()
    }),
    style: centroidStyle
  })
]

},{"./warnings-map-styles":4,"openlayers":8}],4:[function(require,module,exports){
var ol = require('openlayers')

module.exports = {
  // centroid: function (feature, resolution) {
  //   var styles = {
  //     severe: [new ol.style.Style({
  //       image: new ol.style.Icon({
  //         anchor: [13, 60],
  //         anchorXUnits: 'pixels',
  //         anchorYUnits: 'pixels',
  //         src: '/public/images/severe-flood-warning-pin.gif'
  //       })
  //     })],
  //     warning: [new ol.style.Style({
  //       image: new ol.style.Icon({
  //         anchor: [13, 60],
  //         anchorXUnits: 'pixels',
  //         anchorYUnits: 'pixels',
  //         src: '/public/images/flood-warning-pin.gif'
  //       })
  //     })],
  //     alert: [new ol.style.Style({
  //       image: new ol.style.Icon({
  //         anchor: [13, 60],
  //         anchorXUnits: 'pixels',
  //         anchorYUnits: 'pixels',
  //         src: '/public/images/flood-alert-pin.gif'
  //       })
  //     })]
  //   }
  //
  //   switch (feature.get('severity')) {
  //     case 1:
  //       return styles.severe
  //     case 2:
  //       return styles.warning
  //     case 3:
  //       return styles.alert
  //     default:
  //       return
  //   }
  // },
  // centroidHighlight: function (feature, resolution) {
  //   var textStroke = new ol.style.Stroke({
  //     color: '#dcebf9',
  //     width: 7
  //   })
  //   var textFill = new ol.style.Fill({
  //     color: '#000'
  //   })
  //
  //   var text = new ol.style.Text({
  //     font: '16px "nta", Arial, sans-serif',
  //     text: feature.get('severity_description') + ' - ' + feature.get('description'),
  //     fill: textFill,
  //     stroke: textStroke
  //   })
  //
  //   var styles = {
  //     severe: [new ol.style.Style({
  //       image: new ol.style.Icon({
  //         anchor: [13, 60],
  //         anchorXUnits: 'pixels',
  //         anchorYUnits: 'pixels',
  //         src: '/public/images/severe-flood-warning-pin.gif'
  //       }),
  //       text: text
  //     })],
  //     warning: [new ol.style.Style({
  //       image: new ol.style.Icon({
  //         anchor: [13, 60],
  //         anchorXUnits: 'pixels',
  //         anchorYUnits: 'pixels',
  //         src: '/public/images/flood-warning-pin.gif'
  //       }),
  //       text: text
  //     })],
  //     alert: [new ol.style.Style({
  //       image: new ol.style.Icon({
  //         anchor: [13, 60],
  //         anchorXUnits: 'pixels',
  //         anchorYUnits: 'pixels',
  //         src: '/public/images/flood-alert-pin.gif'
  //       }),
  //       text: text
  //     })]
  //   }
  //
  //   switch (feature.get('severity')) {
  //     case 1:
  //       return styles.severe
  //     case 2:
  //       return styles.warning
  //     case 3:
  //       return styles.alert
  //     default:
  //       return
  //   }
  // }
}

},{"openlayers":8}],5:[function(require,module,exports){
/* global $ */

var proj4 = require('proj4')
var ol = require('openlayers')
var center = require('./center-point').lnglat
var centroidHighlightStyle = require('./warnings-map-styles').centroidHighlight
var raf = require('raf')
require('classlist-polyfill')

// proj4 is accessed using global variable within
// openlayers library so we need to export it to `window`
window.proj4 = proj4

function WarningsMap (options) {
  var $body = $(document.body)
  var $container = $('#' + options.target)

  // polyfill for IE-9
  raf.polyfill()

  // Enable the map to be viewed
  $container.addClass('enable')

  var highlightedFeature

  var extent = ol.proj.transformExtent([
    -5.75447130203247,
    49.9302711486816,
    1.79968345165253,
    55.8409309387207
  ], 'EPSG:4326', 'EPSG:3857')

  var view = new ol.View({
    center: ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'),
    zoom: 6,
    minZoom: 4,
    maxZoom: 17,
    extent: extent
  })

  var map = new ol.Map({
    target: options.target,
    layers: options.layers,
    overlays: options.overlays,
    view: view,
    pixelRatio: 1,
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  })

  var featureOverlayCentroid = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
      features: new ol.Collection(),
      useSpatialIndex: false
    }),
    style: centroidHighlightStyle,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  })

  map.on('singleclick', function (e) {
    var coordinate = e.coordinate
    var pixel = e.pixel

    // Check if an alert/warning centroid has been clicked
    var feature = getFeatureFromPixel(pixel)

    if (!feature) {
      // No wfs feature so query for wms feature
      if (bullseye(pixel)) {
        getWMSFeature(coordinate, function (feature) {
          if (feature) {
            navigateToFloodWarning(feature.properties.fwa_code)
          }
        })
      }
    } else {
      // if feature has same code as the target-area then open overlay rather than open warning
      var fwaCode = feature.get('fwa_code')
      if (fwaCode === options.fwaCode) {
        showOverlay(options.coordinates)
      } else {
        navigateToFloodWarning(feature.get('fwa_code'))
      }
    }
  })

  map.on('pointermove', function (e) {
    if (e.dragging) {
      return
    }

    var pixel = map.getEventPixel(e.originalEvent)
    var feature = getFeatureFromPixel(pixel)

    if (feature || bullseye(pixel)) {
      if (feature) {
        highlightFeatureById(feature.get('fwa_key'))
      }
      $body.css('cursor', 'pointer')
    } else {
      unhighlightFeature()
      $body.css('cursor', 'default')
    }
  })

  function navigateToFloodWarning (fwaCode) {
    if (fwaCode) {
      window.location.href = '/target-area/' + fwaCode
    }
  }

  function highlightFeatureById (fwaKey) {
    var centroid = getFeatureById(fwaKey)
    highlightFeature(centroid)
  }

  function getFeatureById (fwaKey) {
    var centroidSource = getLayer('alert-centroids').getSource()
    var ret
    centroidSource.forEachFeature(function (feature) {
      if (feature.get('fwa_key') === fwaKey) {
        ret = feature
      }
    })
    return ret
  }

  function getFeatureFromPixel (pixel) {
    var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      return feature
    })
    return feature
  }

  function unhighlightFeature () {
    if (highlightedFeature) {
      featureOverlayCentroid.getSource().removeFeature(highlightedFeature)
      highlightedFeature = null
    }
  }

  function highlightFeature (featureCentroid) {
    if (featureCentroid !== highlightedFeature) {
      unhighlightFeature()

      if (featureCentroid) {
        featureOverlayCentroid.getSource().addFeature(featureCentroid)
      }

      highlightedFeature = featureCentroid
    }
  }

  function getLayer (ref) {
    var result
    map.getLayers().forEach(function (layer) {
      if (layer.get('ref') === ref) {
        result = layer
      }
    })
    return result
  }

  function bullseye (pixel) {
    return map.forEachLayerAtPixel(pixel, function (layer) {
      return true
    }, null, function (layer) {
      return layer === getLayer('alert-polygons')
    })
  }

  function getWMSFeature (coordinate, callback) {
    var feature
    var viewResolution = view.getResolution()

    var url = getLayer('alert-polygons').getSource().getGetFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {
      INFO_FORMAT: 'application/json',
      FEATURE_COUNT: 10,
      propertyName: 'fwa_key,fwa_code,severity'
    })

    if (url) {
      $.getJSON(url, function (data) {
        if (data && data.features.length) {
          // Get the feature with the lowest severity
          for (var i = 0; i < data.features.length; i++) {
            if (!feature || data.features[i].properties.severity < feature.properties.severity) {
              feature = data.features[i]
            }
          }
        }
        callback(feature)
      })
    } else {
      callback()
    }
  }

  function panTo (point, zoom) {
    view.setCenter(point)
    view.setZoom(zoom)
  }

  function toggleBase ($element) {
    var road = getLayer('bing-road')
    var aerial = getLayer('bing-aerial')

    road.setVisible(!road.getVisible())
    aerial.setVisible(!aerial.getVisible())

    if (road.getVisible()) {
      $element.html('Earth view<i class="fa fa-earth" title="Earth view"></i>')
      $element.attr('title', 'Earth view')
    } else {
      $element.html('Map view<i class="fa fa-road" title="Map view"></i>')
      $element.attr('title', 'Map view')
    }
  }

  function toggleLayer (ref) {
    var layer = getLayer(ref)
    layer.setVisible(!layer.getVisible())
  }

  function updateSize () {
    map.updateSize()
  }

  function testValues () {
    return {
      zoom: map.getView().getZoom(),
      point: map.getView().getCenter(),
      pointLngLat: ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326'),
      roadVisible: getLayer('bing-road').getVisible(),
      aerialVisible: getLayer('bing-aerial').getVisible(),
      highlightedDescription: highlightedFeature ? highlightedFeature.getProperties().description : highlightedFeature,
      highlightedFwaKey: highlightedFeature ? highlightedFeature.getProperties().fwa_key : highlightedFeature,
      featuresCount: options.layers[3].getSource().getFeatures().length
    }
  }

  function zoomToExtent (geometry) {
    map.getView().fit(geometry, map.getSize())
  }

  function showOverlay (coordinate) {
    options.overlays[0].setPosition(coordinate)
  }

  this.panTo = panTo
  this.toggleBase = toggleBase
  this.updateSize = updateSize
  this.testValues = testValues
  this.toggleLayer = toggleLayer
  this.zoomToExtent = zoomToExtent
  this.showOverlay = showOverlay
}

module.exports = WarningsMap

},{"./center-point":1,"./warnings-map-styles":4,"classlist-polyfill":7,"openlayers":8,"proj4":45,"raf":78}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
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
    var timeout = setTimeout(cleanUpNextTick);
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
    clearTimeout(timeout);
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
        setTimeout(drainQueue, 0);
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
(function (global){
// OpenLayers 3. See http://openlayers.org/
// License: https://raw.githubusercontent.com/openlayers/ol3/master/LICENSE.md
// Version: v3.18.2
;(function (root, factory) {
  if (typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.ol = factory();
  }
}(this, function () {
  var OPENLAYERS = {};
  var k,aa=this;
function ba(){var a=aa.setImmediate,b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ca(a,b,c){return a.call.apply(a.bind,arguments)}function da(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function ea(a,b,c){ea=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ca:da;return ea.apply(null,arguments)}function r(a,b){var c=a.split("."),d=OPENLAYERS||aa;c[0]in d||!d.execScript||d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===b?d[e]?d=d[e]:d=d[e]={}:d[e]=b};var fa,ga;function w(a,b){a.prototype=Object.create(b.prototype);a.prototype.constructor=a}function ha(){}function x(a){return a.Wn||(a.Wn=++ia)}var ia=0;if("undefined"!==typeof window)var ja=window;else"undefined"!==typeof global?ja=global:"undefined"!==typeof self&&(ja=self);function ka(a){this.message="Assertion failed. See http://openlayers.org/en/v3.18.2/doc/errors/#"+a+" for details.";this.code=a;this.name="AssertionError"}w(ka,Error);function la(a,b){if(!a)throw new ka(b);};function ma(a,b,c){return Math.min(Math.max(a,b),c)}var na=function(){var a;"cosh"in Math?a=Math.cosh:a=function(a){a=Math.exp(a);return(a+1/a)/2};return a}();function pa(a){la(0<a,29);return Math.pow(2,Math.ceil(Math.log(a)/Math.LN2))}function qa(a,b,c,d,e,f){var g=e-c,h=f-d;if(0!==g||0!==h){var l=((a-c)*g+(b-d)*h)/(g*g+h*h);1<l?(c=e,d=f):0<l&&(c+=g*l,d+=h*l)}return ra(a,b,c,d)}function ra(a,b,c,d){a=c-a;b=d-b;return a*a+b*b}function sa(a){return a*Math.PI/180}
function ta(a,b){var c=a%b;return 0>c*b?c+b:c}function va(a,b,c){return a+c*(b-a)};function wa(a){return function(b){if(b)return[ma(b[0],a[0],a[2]),ma(b[1],a[1],a[3])]}}function xa(a){return a};function ya(a,b,c){this.center=a;this.resolution=b;this.rotation=c};var za="function"===typeof Object.assign?Object.assign:function(a,b){if(!a||!a)throw new TypeError("Cannot convert undefined or null to object");for(var c=Object(a),d=1,e=arguments.length;d<e;++d){var f=arguments[d];if(void 0!==f&&null!==f)for(var g in f)f.hasOwnProperty(g)&&(c[g]=f[g])}return c};function Aa(a){for(var b in a)delete a[b]}function Ba(a){var b=[],c;for(c in a)b.push(a[c]);return b}function Ca(a){for(var b in a)return!1;return!b};function Da(a){function b(b){var d=a.listener,e=a.mg||a.target;a.og&&Ea(a);return d.call(e,b)}return a.ng=b}function Fa(a,b,c,d){for(var e,f=0,g=a.length;f<g;++f)if(e=a[f],e.listener===b&&e.mg===c)return d&&(e.deleteIndex=f),e}function Ga(a,b){var c=a.cb;return c?c[b]:void 0}function Ha(a){var b=a.cb;b||(b=a.cb={});return b}
function Ia(a,b){var c=Ga(a,b);if(c){for(var d=0,e=c.length;d<e;++d)a.removeEventListener(b,c[d].ng),Aa(c[d]);c.length=0;if(c=a.cb)delete c[b],0===Object.keys(c).length&&delete a.cb}}function B(a,b,c,d,e){var f=Ha(a),g=f[b];g||(g=f[b]=[]);(f=Fa(g,c,d,!1))?e||(f.og=!1):(f={mg:d,og:!!e,listener:c,target:a,type:b},a.addEventListener(b,Da(f)),g.push(f));return f}function Ja(a,b,c,d){return B(a,b,c,d,!0)}function Ka(a,b,c,d){(a=Ga(a,b))&&(c=Fa(a,c,d,!0))&&Ea(c)}
function Ea(a){if(a&&a.target){a.target.removeEventListener(a.type,a.ng);var b=Ga(a.target,a.type);if(b){var c="deleteIndex"in a?a.deleteIndex:b.indexOf(a);-1!==c&&b.splice(c,1);0===b.length&&Ia(a.target,a.type)}Aa(a)}}function La(a){var b=Ha(a),c;for(c in b)Ia(a,c)};function Na(){}Na.prototype.Lb=!1;function Oa(a){a.Lb||(a.Lb=!0,a.ma())}Na.prototype.ma=ha;function Pa(a){this.type=a;this.target=null}Pa.prototype.preventDefault=Pa.prototype.stopPropagation=function(){this.qo=!0};function Qa(a){a.stopPropagation()}function Ra(a){a.preventDefault()};function Sa(){this.Va={};this.Ba={};this.Aa={}}w(Sa,Na);Sa.prototype.addEventListener=function(a,b){var c=this.Aa[a];c||(c=this.Aa[a]=[]);-1===c.indexOf(b)&&c.push(b)};
Sa.prototype.b=function(a){var b="string"===typeof a?new Pa(a):a;a=b.type;b.target=this;var c=this.Aa[a],d;if(c){a in this.Ba||(this.Ba[a]=0,this.Va[a]=0);++this.Ba[a];for(var e=0,f=c.length;e<f;++e)if(!1===c[e].call(this,b)||b.qo){d=!1;break}--this.Ba[a];if(0===this.Ba[a]){b=this.Va[a];for(delete this.Va[a];b--;)this.removeEventListener(a,ha);delete this.Ba[a]}return d}};Sa.prototype.ma=function(){La(this)};function Ta(a,b){return b?b in a.Aa:0<Object.keys(a.Aa).length}
Sa.prototype.removeEventListener=function(a,b){var c=this.Aa[a];if(c){var d=c.indexOf(b);a in this.Va?(c[d]=ha,++this.Va[a]):(c.splice(d,1),0===c.length&&delete this.Aa[a])}};function Ua(){Sa.call(this);this.g=0}w(Ua,Sa);function Va(a){if(Array.isArray(a))for(var b=0,c=a.length;b<c;++b)Ea(a[b]);else Ea(a)}k=Ua.prototype;k.u=function(){++this.g;this.b("change")};k.K=function(){return this.g};k.I=function(a,b,c){if(Array.isArray(a)){for(var d=a.length,e=Array(d),f=0;f<d;++f)e[f]=B(this,a[f],b,c);return e}return B(this,a,b,c)};k.L=function(a,b,c){if(Array.isArray(a)){for(var d=a.length,e=Array(d),f=0;f<d;++f)e[f]=Ja(this,a[f],b,c);return e}return Ja(this,a,b,c)};
k.J=function(a,b,c){if(Array.isArray(a))for(var d=0,e=a.length;d<e;++d)Ka(this,a[d],b,c);else Ka(this,a,b,c)};k.M=Va;function Wa(a,b,c){Pa.call(this,a);this.key=b;this.oldValue=c}w(Wa,Pa);function Xa(a){Ua.call(this);x(this);this.U={};void 0!==a&&this.G(a)}w(Xa,Ua);var Ya={};function Za(a){return Ya.hasOwnProperty(a)?Ya[a]:Ya[a]="change:"+a}k=Xa.prototype;k.get=function(a){var b;this.U.hasOwnProperty(a)&&(b=this.U[a]);return b};k.P=function(){return Object.keys(this.U)};k.N=function(){return za({},this.U)};function $a(a,b,c){var d;d=Za(b);a.b(new Wa(d,b,c));a.b(new Wa("propertychange",b,c))}
k.set=function(a,b,c){c?this.U[a]=b:(c=this.U[a],this.U[a]=b,c!==b&&$a(this,a,c))};k.G=function(a,b){for(var c in a)this.set(c,a[c],b)};k.S=function(a,b){if(a in this.U){var c=this.U[a];delete this.U[a];b||$a(this,a,c)}};function ab(a,b){return a>b?1:a<b?-1:0}function bb(a,b){return 0<=a.indexOf(b)}function cb(a,b,c){var d=a.length;if(a[0]<=b)return 0;if(!(b<=a[d-1]))if(0<c)for(c=1;c<d;++c){if(a[c]<b)return c-1}else if(0>c)for(c=1;c<d;++c){if(a[c]<=b)return c}else for(c=1;c<d;++c){if(a[c]==b)return c;if(a[c]<b)return a[c-1]-b<b-a[c]?c-1:c}return d-1}function db(a){return a.reduce(function(a,c){return Array.isArray(c)?a.concat(db(c)):a.concat(c)},[])}
function eb(a,b){var c,d=Array.isArray(b)?b:[b],e=d.length;for(c=0;c<e;c++)a[a.length]=d[c]}function fb(a,b){var c=a.indexOf(b),d=-1<c;d&&a.splice(c,1);return d}function gb(a,b){for(var c=a.length>>>0,d,e=0;e<c;e++)if(d=a[e],b(d,e,a))return d;return null}function hb(a,b){var c=a.length;if(c!==b.length)return!1;for(var d=0;d<c;d++)if(a[d]!==b[d])return!1;return!0}
function ib(a){var b=jb,c=a.length,d=Array(a.length),e;for(e=0;e<c;e++)d[e]={index:e,value:a[e]};d.sort(function(a,c){return b(a.value,c.value)||a.index-c.index});for(e=0;e<a.length;e++)a[e]=d[e].value}function kb(a,b){var c;return a.every(function(d,e){c=e;return!b(d,e,a)})?-1:c}function lb(a,b){var c=b||ab;return a.every(function(b,e){if(0===e)return!0;var f=c(a[e-1],b);return!(0<f||0===f)})};function mb(a){return function(b,c,d){if(void 0!==b)return b=cb(a,b,d),b=ma(b+c,0,a.length-1),c=Math.floor(b),b!=c&&c<a.length-1?a[c]/Math.pow(a[c]/a[c+1],b-c):a[c]}}function nb(a,b,c){return function(d,e,f){if(void 0!==d)return d=Math.max(Math.floor(Math.log(b/d)/Math.log(a)+(-f/2+.5))+e,0),void 0!==c&&(d=Math.min(d,c)),b/Math.pow(a,d)}};function ob(a){if(void 0!==a)return 0}function pb(a,b){if(void 0!==a)return a+b}function qb(a){var b=2*Math.PI/a;return function(a,d){if(void 0!==a)return a=Math.floor((a+d)/b+.5)*b}}function rb(){var a=sa(5);return function(b,c){if(void 0!==b)return Math.abs(b+c)<=a?0:b+c}};function sb(a,b){var c=void 0!==b?a.toFixed(b):""+a,d=c.indexOf("."),d=-1===d?c.length:d;return 2<d?c:Array(3-d).join("0")+c}function tb(a){a=(""+a).split(".");for(var b=["1","3"],c=0;c<Math.max(a.length,b.length);c++){var d=parseInt(a[c]||"0",10),e=parseInt(b[c]||"0",10);if(d>e)return 1;if(e>d)return-1}return 0};function ub(a,b){a[0]+=b[0];a[1]+=b[1];return a}function vb(a,b){var c=a[0],d=a[1],e=b[0],f=b[1],g=e[0],e=e[1],h=f[0],f=f[1],l=h-g,m=f-e,c=0===l&&0===m?0:(l*(c-g)+m*(d-e))/(l*l+m*m||0);0>=c||(1<=c?(g=h,e=f):(g+=c*l,e+=c*m));return[g,e]}function wb(a,b,c){a=ta(a+180,360)-180;var d=Math.abs(3600*a);return Math.floor(d/3600)+"\u00b0 "+sb(Math.floor(d/60%60))+"\u2032 "+sb(d%60,c||0)+"\u2033 "+b.charAt(0>a?1:0)}
function xb(a,b,c){return a?b.replace("{x}",a[0].toFixed(c)).replace("{y}",a[1].toFixed(c)):""}function yb(a,b){for(var c=!0,d=a.length-1;0<=d;--d)if(a[d]!=b[d]){c=!1;break}return c}function zb(a,b){var c=Math.cos(b),d=Math.sin(b),e=a[1]*c+a[0]*d;a[0]=a[0]*c-a[1]*d;a[1]=e;return a}function Ab(a,b){var c=a[0]-b[0],d=a[1]-b[1];return c*c+d*d}function Bb(a,b){return Ab(a,vb(a,b))}function Cb(a,b){return xb(a,"{x}, {y}",b)};function Db(a){for(var b=Eb(),c=0,d=a.length;c<d;++c)Fb(b,a[c]);return b}function Gb(a,b,c){return c?(c[0]=a[0]-b,c[1]=a[1]-b,c[2]=a[2]+b,c[3]=a[3]+b,c):[a[0]-b,a[1]-b,a[2]+b,a[3]+b]}function Hb(a,b){return b?(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b):a.slice()}function Kb(a,b,c){b=b<a[0]?a[0]-b:a[2]<b?b-a[2]:0;a=c<a[1]?a[1]-c:a[3]<c?c-a[3]:0;return b*b+a*a}function Lb(a,b){return Mb(a,b[0],b[1])}function Nb(a,b){return a[0]<=b[0]&&b[2]<=a[2]&&a[1]<=b[1]&&b[3]<=a[3]}
function Mb(a,b,c){return a[0]<=b&&b<=a[2]&&a[1]<=c&&c<=a[3]}function Ob(a,b){var c=a[1],d=a[2],e=a[3],f=b[0],g=b[1],h=0;f<a[0]?h|=16:f>d&&(h|=4);g<c?h|=8:g>e&&(h|=2);0===h&&(h=1);return h}function Eb(){return[Infinity,Infinity,-Infinity,-Infinity]}function Qb(a,b,c,d,e){return e?(e[0]=a,e[1]=b,e[2]=c,e[3]=d,e):[a,b,c,d]}function Rb(a,b){var c=a[0],d=a[1];return Qb(c,d,c,d,b)}function Sb(a,b,c,d,e){e=Qb(Infinity,Infinity,-Infinity,-Infinity,e);return Tb(e,a,b,c,d)}
function Ub(a,b){return a[0]==b[0]&&a[2]==b[2]&&a[1]==b[1]&&a[3]==b[3]}function Vb(a,b){b[0]<a[0]&&(a[0]=b[0]);b[2]>a[2]&&(a[2]=b[2]);b[1]<a[1]&&(a[1]=b[1]);b[3]>a[3]&&(a[3]=b[3]);return a}function Fb(a,b){b[0]<a[0]&&(a[0]=b[0]);b[0]>a[2]&&(a[2]=b[0]);b[1]<a[1]&&(a[1]=b[1]);b[1]>a[3]&&(a[3]=b[1])}function Tb(a,b,c,d,e){for(;c<d;c+=e){var f=a,g=b[c],h=b[c+1];f[0]=Math.min(f[0],g);f[1]=Math.min(f[1],h);f[2]=Math.max(f[2],g);f[3]=Math.max(f[3],h)}return a}
function Xb(a,b,c){var d;return(d=b.call(c,Zb(a)))||(d=b.call(c,$b(a)))||(d=b.call(c,ac(a)))?d:(d=b.call(c,bc(a)))?d:!1}function cc(a){var b=0;dc(a)||(b=ec(a)*fc(a));return b}function Zb(a){return[a[0],a[1]]}function $b(a){return[a[2],a[1]]}function gc(a){return[(a[0]+a[2])/2,(a[1]+a[3])/2]}
function ic(a,b,c,d,e){var f=b*d[0]/2;d=b*d[1]/2;b=Math.cos(c);var g=Math.sin(c);c=f*b;f*=g;b*=d;var h=d*g,l=a[0],m=a[1];a=l-c+h;d=l-c-h;g=l+c-h;c=l+c+h;var h=m-f-b,l=m-f+b,n=m+f+b,f=m+f-b;return Qb(Math.min(a,d,g,c),Math.min(h,l,n,f),Math.max(a,d,g,c),Math.max(h,l,n,f),e)}function fc(a){return a[3]-a[1]}function jc(a,b,c){c=c?c:Eb();kc(a,b)&&(c[0]=a[0]>b[0]?a[0]:b[0],c[1]=a[1]>b[1]?a[1]:b[1],c[2]=a[2]<b[2]?a[2]:b[2],c[3]=a[3]<b[3]?a[3]:b[3]);return c}function bc(a){return[a[0],a[3]]}
function ac(a){return[a[2],a[3]]}function ec(a){return a[2]-a[0]}function kc(a,b){return a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1]}function dc(a){return a[2]<a[0]||a[3]<a[1]}function lc(a,b){var c=(a[2]-a[0])/2*(b-1),d=(a[3]-a[1])/2*(b-1);a[0]-=c;a[2]+=c;a[1]-=d;a[3]+=d}
function mc(a,b,c){a=[a[0],a[1],a[0],a[3],a[2],a[1],a[2],a[3]];b(a,a,2);var d=[a[0],a[2],a[4],a[6]],e=[a[1],a[3],a[5],a[7]];b=Math.min.apply(null,d);a=Math.min.apply(null,e);d=Math.max.apply(null,d);e=Math.max.apply(null,e);return Qb(b,a,d,e,c)};function nc(){return!0}function oc(){return!1};/*

 Latitude/longitude spherical geodesy formulae taken from
 http://www.movable-type.co.uk/scripts/latlong.html
 Licensed under CC-BY-3.0.
*/
function pc(a){this.radius=a}pc.prototype.a=function(a){for(var b=0,c=a.length,d=a[c-1][0],e=a[c-1][1],f=0;f<c;f++)var g=a[f][0],h=a[f][1],b=b+sa(g-d)*(2+Math.sin(sa(e))+Math.sin(sa(h))),d=g,e=h;return b*this.radius*this.radius/2};pc.prototype.b=function(a,b){var c=sa(a[1]),d=sa(b[1]),e=(d-c)/2,f=sa(b[0]-a[0])/2,c=Math.sin(e)*Math.sin(e)+Math.sin(f)*Math.sin(f)*Math.cos(c)*Math.cos(d);return 2*this.radius*Math.atan2(Math.sqrt(c),Math.sqrt(1-c))};
pc.prototype.offset=function(a,b,c){var d=sa(a[1]);b/=this.radius;var e=Math.asin(Math.sin(d)*Math.cos(b)+Math.cos(d)*Math.sin(b)*Math.cos(c));return[180*(sa(a[0])+Math.atan2(Math.sin(c)*Math.sin(b)*Math.cos(d),Math.cos(b)-Math.sin(d)*Math.sin(e)))/Math.PI,180*e/Math.PI]};var qc=new pc(6370997);var rc={};rc.degrees=2*Math.PI*qc.radius/360;rc.ft=.3048;rc.m=1;rc["us-ft"]=1200/3937;
function sc(a){this.eb=a.code;this.c=a.units;this.f=void 0!==a.extent?a.extent:null;this.i=void 0!==a.worldExtent?a.worldExtent:null;this.b=void 0!==a.axisOrientation?a.axisOrientation:"enu";this.g=void 0!==a.global?a.global:!1;this.a=!(!this.g||!this.f);this.j=void 0!==a.getPointResolution?a.getPointResolution:this.pk;this.l=null;this.o=a.metersPerUnit;var b=tc,c=a.code,d=uc||ja.proj4;if("function"==typeof d&&void 0===b[c]){var e=d.defs(c);if(void 0!==e){void 0!==e.axis&&void 0===a.axisOrientation&&
(this.b=e.axis);void 0===a.metersPerUnit&&(this.o=e.to_meter);void 0===a.units&&(this.c=e.units);for(var f in b)b=d.defs(f),void 0!==b&&(a=vc(f),b===e?wc([a,this]):(b=d(f,c),xc(a,this,b.forward,b.inverse)))}}}k=sc.prototype;k.Pj=function(){return this.eb};k.C=function(){return this.f};k.Ab=function(){return this.c};k.cc=function(){return this.o||rc[this.c]};k.Bk=function(){return this.i};k.kl=function(){return this.g};k.ap=function(a){this.g=a;this.a=!(!a||!this.f)};
k.Hm=function(a){this.f=a;this.a=!(!this.g||!a)};k.jp=function(a){this.i=a};k.$o=function(a){this.j=a};k.pk=function(a,b){if("degrees"==this.Ab())return a;var c=yc(this,vc("EPSG:4326")),d=[b[0]-a/2,b[1],b[0]+a/2,b[1],b[0],b[1]-a/2,b[0],b[1]+a/2],d=c(d,d,2),c=qc.b(d.slice(0,2),d.slice(2,4)),d=qc.b(d.slice(4,6),d.slice(6,8)),d=(c+d)/2,c=this.cc();void 0!==c&&(d/=c);return d};k.getPointResolution=function(a,b){return this.j(a,b)};var tc={},zc={},uc=null;
function wc(a){Ac(a);a.forEach(function(b){a.forEach(function(a){b!==a&&Bc(b,a,Cc)})})}function Dc(){var a=Ec,b=Fc,c=Gc;Hc.forEach(function(d){a.forEach(function(a){Bc(d,a,b);Bc(a,d,c)})})}function Ic(a){tc[a.eb]=a;Bc(a,a,Cc)}function Ac(a){var b=[];a.forEach(function(a){b.push(Ic(a))})}function Jc(a){return a?"string"===typeof a?vc(a):a:vc("EPSG:3857")}function Bc(a,b,c){a=a.eb;b=b.eb;a in zc||(zc[a]={});zc[a][b]=c}function xc(a,b,c,d){a=vc(a);b=vc(b);Bc(a,b,Kc(c));Bc(b,a,Kc(d))}
function Kc(a){return function(b,c,d){var e=b.length;d=void 0!==d?d:2;c=void 0!==c?c:Array(e);var f,g;for(g=0;g<e;g+=d)for(f=a([b[g],b[g+1]]),c[g]=f[0],c[g+1]=f[1],f=d-1;2<=f;--f)c[g+f]=b[g+f];return c}}function vc(a){var b;if(a instanceof sc)b=a;else if("string"===typeof a){b=tc[a];var c=uc||ja.proj4;void 0===b&&"function"==typeof c&&void 0!==c.defs(a)&&(b=new sc({code:a}),Ic(b))}return b||null}function Lc(a,b){if(a===b)return!0;var c=a.Ab()===b.Ab();return a.eb===b.eb?c:yc(a,b)===Cc&&c}
function Mc(a,b){var c=vc(a),d=vc(b);return yc(c,d)}function yc(a,b){var c=a.eb,d=b.eb,e;c in zc&&d in zc[c]&&(e=zc[c][d]);void 0===e&&(e=Nc);return e}function Nc(a,b){if(void 0!==b&&a!==b){for(var c=0,d=a.length;c<d;++c)b[c]=a[c];a=b}return a}function Cc(a,b){var c;if(void 0!==b){c=0;for(var d=a.length;c<d;++c)b[c]=a[c];c=b}else c=a.slice();return c}function Oc(a,b,c){return Mc(b,c)(a,void 0,a.length)}function Pc(a,b,c){b=Mc(b,c);return mc(a,b)};function Qc(){Xa.call(this);this.s=Eb();this.v=-1;this.i={};this.o=this.l=0}w(Qc,Xa);k=Qc.prototype;k.yb=function(a,b){var c=b?b:[NaN,NaN];this.vb(a[0],a[1],c,Infinity);return c};k.jb=function(a){return this.zc(a[0],a[1])};k.zc=oc;k.C=function(a){this.v!=this.g&&(this.s=this.Nd(this.s),this.v=this.g);var b=this.s;a?(a[0]=b[0],a[1]=b[1],a[2]=b[2],a[3]=b[3]):a=b;return a};k.Fb=function(a){return this.md(a*a)};k.lb=function(a,b){this.rc(Mc(a,b));return this};function Rc(a,b,c,d,e,f){for(var g=f?f:[],h=0;b<c;b+=d){var l=a[b],m=a[b+1];g[h++]=e[0]*l+e[2]*m+e[4];g[h++]=e[1]*l+e[3]*m+e[5]}f&&g.length!=h&&(g.length=h);return g};function Sc(){Qc.call(this);this.ka="XY";this.a=2;this.B=null}w(Sc,Qc);function Tc(a){var b;"XY"==a?b=2:"XYZ"==a||"XYM"==a?b=3:"XYZM"==a&&(b=4);return b}k=Sc.prototype;k.zc=oc;k.Nd=function(a){return Sb(this.B,0,this.B.length,this.a,a)};k.Nb=function(){return this.B.slice(0,this.a)};k.la=function(){return this.B};k.Ob=function(){return this.B.slice(this.B.length-this.a)};k.Pb=function(){return this.ka};
k.md=function(a){this.o!=this.g&&(Aa(this.i),this.l=0,this.o=this.g);if(0>a||0!==this.l&&a<=this.l)return this;var b=a.toString();if(this.i.hasOwnProperty(b))return this.i[b];var c=this.Lc(a);if(c.la().length<this.B.length)return this.i[b]=c;this.l=a;return this};k.Lc=function(){return this};k.ua=function(){return this.a};function Uc(a,b,c){a.a=Tc(b);a.ka=b;a.B=c}
function Vc(a,b,c,d){if(b)c=Tc(b);else{for(b=0;b<d;++b){if(0===c.length){a.ka="XY";a.a=2;return}c=c[0]}c=c.length;var e;2==c?e="XY":3==c?e="XYZ":4==c&&(e="XYZM");b=e}a.ka=b;a.a=c}k.rc=function(a){this.B&&(a(this.B,this.B,this.a),this.u())};
k.rotate=function(a,b){var c=this.la();if(c){for(var d=c.length,e=this.ua(),f=c?c:[],g=Math.cos(a),h=Math.sin(a),l=b[0],m=b[1],n=0,p=0;p<d;p+=e){var q=c[p]-l,t=c[p+1]-m;f[n++]=l+q*g-t*h;f[n++]=m+q*h+t*g;for(q=p+2;q<p+e;++q)f[n++]=c[q]}c&&f.length!=n&&(f.length=n);this.u()}};
k.scale=function(a,b,c){var d=b;void 0===d&&(d=a);var e=c;e||(e=gc(this.C()));if(c=this.la()){b=c.length;for(var f=this.ua(),g=c?c:[],h=e[0],e=e[1],l=0,m=0;m<b;m+=f){var n=c[m]-h,p=c[m+1]-e;g[l++]=h+a*n;g[l++]=e+d*p;for(n=m+2;n<m+f;++n)g[l++]=c[n]}c&&g.length!=l&&(g.length=l);this.u()}};k.Qc=function(a,b){var c=this.la();if(c){var d=c.length,e=this.ua(),f=c?c:[],g=0,h,l;for(h=0;h<d;h+=e)for(f[g++]=c[h]+a,f[g++]=c[h+1]+b,l=h+2;l<h+e;++l)f[g++]=c[l];c&&f.length!=g&&(f.length=g);this.u()}};function Wc(a,b,c,d){for(var e=0,f=a[c-d],g=a[c-d+1];b<c;b+=d)var h=a[b],l=a[b+1],e=e+(g*h-f*l),f=h,g=l;return e/2}function Xc(a,b,c,d){var e=0,f,g;f=0;for(g=c.length;f<g;++f){var h=c[f],e=e+Wc(a,b,h,d);b=h}return e};function Yc(a,b,c,d,e,f,g){var h=a[b],l=a[b+1],m=a[c]-h,n=a[c+1]-l;if(0!==m||0!==n)if(f=((e-h)*m+(f-l)*n)/(m*m+n*n),1<f)b=c;else if(0<f){for(e=0;e<d;++e)g[e]=va(a[b+e],a[c+e],f);g.length=d;return}for(e=0;e<d;++e)g[e]=a[b+e];g.length=d}function Zc(a,b,c,d,e){var f=a[b],g=a[b+1];for(b+=d;b<c;b+=d){var h=a[b],l=a[b+1],f=ra(f,g,h,l);f>e&&(e=f);f=h;g=l}return e}function $c(a,b,c,d,e){var f,g;f=0;for(g=c.length;f<g;++f){var h=c[f];e=Zc(a,b,h,d,e);b=h}return e}
function ad(a,b,c,d,e,f,g,h,l,m,n){if(b==c)return m;var p;if(0===e){p=ra(g,h,a[b],a[b+1]);if(p<m){for(n=0;n<d;++n)l[n]=a[b+n];l.length=d;return p}return m}for(var q=n?n:[NaN,NaN],t=b+d;t<c;)if(Yc(a,t-d,t,d,g,h,q),p=ra(g,h,q[0],q[1]),p<m){m=p;for(n=0;n<d;++n)l[n]=q[n];l.length=d;t+=d}else t+=d*Math.max((Math.sqrt(p)-Math.sqrt(m))/e|0,1);if(f&&(Yc(a,c-d,b,d,g,h,q),p=ra(g,h,q[0],q[1]),p<m)){m=p;for(n=0;n<d;++n)l[n]=q[n];l.length=d}return m}
function bd(a,b,c,d,e,f,g,h,l,m,n){n=n?n:[NaN,NaN];var p,q;p=0;for(q=c.length;p<q;++p){var t=c[p];m=ad(a,b,t,d,e,f,g,h,l,m,n);b=t}return m};function cd(a,b){var c=0,d,e;d=0;for(e=b.length;d<e;++d)a[c++]=b[d];return c}function dd(a,b,c,d){var e,f;e=0;for(f=c.length;e<f;++e){var g=c[e],h;for(h=0;h<d;++h)a[b++]=g[h]}return b}function ed(a,b,c,d,e){e=e?e:[];var f=0,g,h;g=0;for(h=c.length;g<h;++g)b=dd(a,b,c[g],d),e[f++]=b;e.length=f;return e};function fd(a,b,c,d,e){e=void 0!==e?e:[];for(var f=0;b<c;b+=d)e[f++]=a.slice(b,b+d);e.length=f;return e}function gd(a,b,c,d,e){e=void 0!==e?e:[];var f=0,g,h;g=0;for(h=c.length;g<h;++g){var l=c[g];e[f++]=fd(a,b,l,d,e[f]);b=l}e.length=f;return e};function hd(a,b,c,d,e,f,g){var h=(c-b)/d;if(3>h){for(;b<c;b+=d)f[g++]=a[b],f[g++]=a[b+1];return g}var l=Array(h);l[0]=1;l[h-1]=1;c=[b,c-d];for(var m=0,n;0<c.length;){var p=c.pop(),q=c.pop(),t=0,v=a[q],u=a[q+1],y=a[p],E=a[p+1];for(n=q+d;n<p;n+=d){var z=qa(a[n],a[n+1],v,u,y,E);z>t&&(m=n,t=z)}t>e&&(l[(m-b)/d]=1,q+d<m&&c.push(q,m),m+d<p&&c.push(m,p))}for(n=0;n<h;++n)l[n]&&(f[g++]=a[b+n*d],f[g++]=a[b+n*d+1]);return g}
function id(a,b,c,d,e,f,g,h){var l,m;l=0;for(m=c.length;l<m;++l){var n=c[l];a:{var p=a,q=n,t=d,v=e,u=f;if(b!=q){var y=v*Math.round(p[b]/v),E=v*Math.round(p[b+1]/v);b+=t;u[g++]=y;u[g++]=E;var z,G;do if(z=v*Math.round(p[b]/v),G=v*Math.round(p[b+1]/v),b+=t,b==q){u[g++]=z;u[g++]=G;break a}while(z==y&&G==E);for(;b<q;){var J,X;J=v*Math.round(p[b]/v);X=v*Math.round(p[b+1]/v);b+=t;if(J!=z||X!=G){var A=z-y,Ma=G-E,ua=J-y,M=X-E;A*M==Ma*ua&&(0>A&&ua<A||A==ua||0<A&&ua>A)&&(0>Ma&&M<Ma||Ma==M||0<Ma&&M>Ma)||(u[g++]=
z,u[g++]=G,y=z,E=G);z=J;G=X}}u[g++]=z;u[g++]=G}}h.push(g);b=n}return g};function jd(a,b){Sc.call(this);this.c=this.j=-1;this.sa(a,b)}w(jd,Sc);k=jd.prototype;k.clone=function(){var a=new jd(null);kd(a,this.ka,this.B.slice());return a};k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;this.c!=this.g&&(this.j=Math.sqrt(Zc(this.B,0,this.B.length,this.a,0)),this.c=this.g);return ad(this.B,0,this.B.length,this.a,this.j,!0,a,b,c,d)};k.im=function(){return Wc(this.B,0,this.B.length,this.a)};k.Z=function(){return fd(this.B,0,this.B.length,this.a)};
k.Lc=function(a){var b=[];b.length=hd(this.B,0,this.B.length,this.a,a,b,0);a=new jd(null);kd(a,"XY",b);return a};k.X=function(){return"LinearRing"};k.sa=function(a,b){a?(Vc(this,b,a,1),this.B||(this.B=[]),this.B.length=dd(this.B,0,a,this.a),this.u()):kd(this,"XY",null)};function kd(a,b,c){Uc(a,b,c);a.u()};function C(a,b){Sc.call(this);this.sa(a,b)}w(C,Sc);k=C.prototype;k.clone=function(){var a=new C(null);a.ba(this.ka,this.B.slice());return a};k.vb=function(a,b,c,d){var e=this.B;a=ra(a,b,e[0],e[1]);if(a<d){d=this.a;for(b=0;b<d;++b)c[b]=e[b];c.length=d;return a}return d};k.Z=function(){return this.B?this.B.slice():[]};k.Nd=function(a){return Rb(this.B,a)};k.X=function(){return"Point"};k.La=function(a){return Mb(a,this.B[0],this.B[1])};
k.sa=function(a,b){a?(Vc(this,b,a,0),this.B||(this.B=[]),this.B.length=cd(this.B,a),this.u()):this.ba("XY",null)};k.ba=function(a,b){Uc(this,a,b);this.u()};function ld(a,b,c,d,e){return!Xb(e,function(e){return!md(a,b,c,d,e[0],e[1])})}function md(a,b,c,d,e,f){for(var g=!1,h=a[c-d],l=a[c-d+1];b<c;b+=d){var m=a[b],n=a[b+1];l>f!=n>f&&e<(m-h)*(f-l)/(n-l)+h&&(g=!g);h=m;l=n}return g}function nd(a,b,c,d,e,f){if(0===c.length||!md(a,b,c[0],d,e,f))return!1;var g;b=1;for(g=c.length;b<g;++b)if(md(a,c[b-1],c[b],d,e,f))return!1;return!0};function od(a,b,c,d,e,f,g){var h,l,m,n,p,q=e[f+1],t=[],v=c[0];m=a[v-d];p=a[v-d+1];for(h=b;h<v;h+=d){n=a[h];l=a[h+1];if(q<=p&&l<=q||p<=q&&q<=l)m=(q-p)/(l-p)*(n-m)+m,t.push(m);m=n;p=l}v=NaN;p=-Infinity;t.sort(ab);m=t[0];h=1;for(l=t.length;h<l;++h){n=t[h];var u=Math.abs(n-m);u>p&&(m=(m+n)/2,nd(a,b,c,d,m,q)&&(v=m,p=u));m=n}isNaN(v)&&(v=e[f]);return g?(g.push(v,q),g):[v,q]};function pd(a,b,c,d,e,f){for(var g=[a[b],a[b+1]],h=[],l;b+d<c;b+=d){h[0]=a[b+d];h[1]=a[b+d+1];if(l=e.call(f,g,h))return l;g[0]=h[0];g[1]=h[1]}return!1};function qd(a,b,c,d,e){var f=Tb(Eb(),a,b,c,d);return kc(e,f)?Nb(e,f)||f[0]>=e[0]&&f[2]<=e[2]||f[1]>=e[1]&&f[3]<=e[3]?!0:pd(a,b,c,d,function(a,b){var c=!1,d=Ob(e,a),f=Ob(e,b);if(1===d||1===f)c=!0;else{var p=e[0],q=e[1],t=e[2],v=e[3],u=b[0],y=b[1],E=(y-a[1])/(u-a[0]);f&2&&!(d&2)&&(c=u-(y-v)/E,c=c>=p&&c<=t);c||!(f&4)||d&4||(c=y-(u-t)*E,c=c>=q&&c<=v);c||!(f&8)||d&8||(c=u-(y-q)/E,c=c>=p&&c<=t);c||!(f&16)||d&16||(c=y-(u-p)*E,c=c>=q&&c<=v)}return c}):!1}
function rd(a,b,c,d,e){var f=c[0];if(!(qd(a,b,f,d,e)||md(a,b,f,d,e[0],e[1])||md(a,b,f,d,e[0],e[3])||md(a,b,f,d,e[2],e[1])||md(a,b,f,d,e[2],e[3])))return!1;if(1===c.length)return!0;b=1;for(f=c.length;b<f;++b)if(ld(a,c[b-1],c[b],d,e))return!1;return!0};function sd(a,b,c,d){for(var e=0,f=a[c-d],g=a[c-d+1];b<c;b+=d)var h=a[b],l=a[b+1],e=e+(h-f)*(l+g),f=h,g=l;return 0<e}function td(a,b,c,d){var e=0;d=void 0!==d?d:!1;var f,g;f=0;for(g=b.length;f<g;++f){var h=b[f],e=sd(a,e,h,c);if(0===f){if(d&&e||!d&&!e)return!1}else if(d&&!e||!d&&e)return!1;e=h}return!0}
function ud(a,b,c,d,e){e=void 0!==e?e:!1;var f,g;f=0;for(g=c.length;f<g;++f){var h=c[f],l=sd(a,b,h,d);if(0===f?e&&l||!e&&!l:e&&!l||!e&&l)for(var l=a,m=h,n=d;b<m-n;){var p;for(p=0;p<n;++p){var q=l[b+p];l[b+p]=l[m-n+p];l[m-n+p]=q}b+=n;m-=n}b=h}return b}function vd(a,b,c,d){var e=0,f,g;f=0;for(g=b.length;f<g;++f)e=ud(a,e,b[f],c,d);return e};function D(a,b){Sc.call(this);this.c=[];this.A=-1;this.H=null;this.R=this.D=this.O=-1;this.j=null;this.sa(a,b)}w(D,Sc);k=D.prototype;k.uj=function(a){this.B?eb(this.B,a.la()):this.B=a.la().slice();this.c.push(this.B.length);this.u()};k.clone=function(){var a=new D(null);a.ba(this.ka,this.B.slice(),this.c.slice());return a};
k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;this.D!=this.g&&(this.O=Math.sqrt($c(this.B,0,this.c,this.a,0)),this.D=this.g);return bd(this.B,0,this.c,this.a,this.O,!0,a,b,c,d)};k.zc=function(a,b){return nd(this.Qb(),0,this.c,this.a,a,b)};k.lm=function(){return Xc(this.Qb(),0,this.c,this.a)};k.Z=function(a){var b;void 0!==a?(b=this.Qb().slice(),ud(b,0,this.c,this.a,a)):b=this.B;return gd(b,0,this.c,this.a)};k.Hb=function(){return this.c};
function wd(a){if(a.A!=a.g){var b=gc(a.C());a.H=od(a.Qb(),0,a.c,a.a,b,0);a.A=a.g}return a.H}k.Zj=function(){return new C(wd(this))};k.dk=function(){return this.c.length};k.Fg=function(a){if(0>a||this.c.length<=a)return null;var b=new jd(null);kd(b,this.ka,this.B.slice(0===a?0:this.c[a-1],this.c[a]));return b};k.Vd=function(){var a=this.ka,b=this.B,c=this.c,d=[],e=0,f,g;f=0;for(g=c.length;f<g;++f){var h=c[f],l=new jd(null);kd(l,a,b.slice(e,h));d.push(l);e=h}return d};
k.Qb=function(){if(this.R!=this.g){var a=this.B;td(a,this.c,this.a)?this.j=a:(this.j=a.slice(),this.j.length=ud(this.j,0,this.c,this.a));this.R=this.g}return this.j};k.Lc=function(a){var b=[],c=[];b.length=id(this.B,0,this.c,this.a,Math.sqrt(a),b,0,c);a=new D(null);a.ba("XY",b,c);return a};k.X=function(){return"Polygon"};k.La=function(a){return rd(this.Qb(),0,this.c,this.a,a)};
k.sa=function(a,b){if(a){Vc(this,b,a,2);this.B||(this.B=[]);var c=ed(this.B,0,a,this.a,this.c);this.B.length=0===c.length?0:c[c.length-1];this.u()}else this.ba("XY",null,this.c)};k.ba=function(a,b,c){Uc(this,a,b);this.c=c;this.u()};function xd(a,b,c,d){var e=d?d:32;d=[];var f;for(f=0;f<e;++f)eb(d,a.offset(b,c,2*Math.PI*f/e));d.push(d[0],d[1]);a=new D(null);a.ba("XY",d,[d.length]);return a}
function yd(a){var b=a[0],c=a[1],d=a[2];a=a[3];b=[b,c,b,a,d,a,d,c,b,c];c=new D(null);c.ba("XY",b,[b.length]);return c}function zd(a,b,c){var d=b?b:32,e=a.ua();b=a.ka;for(var f=new D(null,b),d=e*(d+1),e=Array(d),g=0;g<d;g++)e[g]=0;f.ba(b,e,[e.length]);Ad(f,a.qd(),a.vf(),c);return f}function Ad(a,b,c,d){var e=a.la(),f=a.ka,g=a.ua(),h=a.Hb(),l=e.length/g-1;d=d?d:0;for(var m,n,p=0;p<=l;++p)n=p*g,m=d+2*ta(p,l)*Math.PI/l,e[n]=b[0]+c*Math.cos(m),e[n+1]=b[1]+c*Math.sin(m);a.ba(f,e,h)};function Bd(a){Xa.call(this);a=a||{};this.c=[0,0];var b={};b[Cd]=void 0!==a.center?a.center:null;this.j=Jc(a.projection);var c,d,e,f=void 0!==a.minZoom?a.minZoom:0;c=void 0!==a.maxZoom?a.maxZoom:28;var g=void 0!==a.zoomFactor?a.zoomFactor:2;if(void 0!==a.resolutions)c=a.resolutions,d=c[0],e=c[c.length-1],c=mb(c);else{d=Jc(a.projection);e=d.C();var h=(e?Math.max(ec(e),fc(e)):360*rc.degrees/d.cc())/256/Math.pow(2,0),l=h/Math.pow(2,28);d=a.maxResolution;void 0!==d?f=0:d=h/Math.pow(g,f);e=a.minResolution;
void 0===e&&(e=void 0!==a.maxZoom?void 0!==a.maxResolution?d/Math.pow(g,c):h/Math.pow(g,c):l);c=f+Math.floor(Math.log(d/e)/Math.log(g));e=d/Math.pow(g,c-f);c=nb(g,d,c-f)}this.a=d;this.i=e;this.s=g;this.f=a.resolutions;this.l=f;f=void 0!==a.extent?wa(a.extent):xa;(void 0!==a.enableRotation?a.enableRotation:1)?(g=a.constrainRotation,g=void 0===g||!0===g?rb():!1===g?pb:"number"===typeof g?qb(g):pb):g=ob;this.o=new ya(f,c,g);void 0!==a.resolution?b[Dd]=a.resolution:void 0!==a.zoom&&(b[Dd]=this.constrainResolution(this.a,
a.zoom-this.l));b[Ed]=void 0!==a.rotation?a.rotation:0;this.G(b)}w(Bd,Xa);k=Bd.prototype;k.Od=function(a){return this.o.center(a)};k.constrainResolution=function(a,b,c){return this.o.resolution(a,b||0,c||0)};k.constrainRotation=function(a,b){return this.o.rotation(a,b||0)};k.bb=function(){return this.get(Cd)};function Fd(a,b){return void 0!==b?(b[0]=a.c[0],b[1]=a.c[1],b):a.c.slice()}
k.Ic=function(a){var b=this.bb();la(b,1);var c=this.$();la(void 0!==c,2);var d=this.Ma();la(void 0!==d,3);return ic(b,c,d,a)};k.Ql=function(){return this.a};k.Rl=function(){return this.i};k.Sl=function(){return this.j};k.$=function(){return this.get(Dd)};k.Tl=function(){return this.f};function Gd(a,b){return Math.max(ec(a)/b[0],fc(a)/b[1])}function Hd(a){var b=a.a,c=Math.log(b/a.i)/Math.log(2);return function(a){return b/Math.pow(2,a*c)}}k.Ma=function(){return this.get(Ed)};
function Id(a){var b=a.a,c=Math.log(b/a.i)/Math.log(2);return function(a){return Math.log(b/a)/Math.log(2)/c}}k.V=function(){var a=this.bb(),b=this.j,c=this.$(),d=this.Ma();return{center:a.slice(),projection:void 0!==b?b:null,resolution:c,rotation:d}};k.Ck=function(){var a,b=this.$();if(void 0!==b&&b>=this.i&&b<=this.a){a=this.l||0;var c,d;if(this.f){d=cb(this.f,b,1);a+=d;if(d==this.f.length-1)return a;c=this.f[d];d=c/this.f[d+1]}else c=this.a,d=this.s;a+=Math.log(c/b)/Math.log(d)}return a};
k.af=function(a,b,c){a instanceof Sc||(la(Array.isArray(a),24),la(!dc(a),25),a=yd(a));var d=c||{};c=void 0!==d.padding?d.padding:[0,0,0,0];var e=void 0!==d.constrainResolution?d.constrainResolution:!0,f=void 0!==d.nearest?d.nearest:!1,g;void 0!==d.minResolution?g=d.minResolution:void 0!==d.maxZoom?g=this.constrainResolution(this.a,d.maxZoom-this.l,0):g=0;var h=a.la(),l=this.Ma(),d=Math.cos(-l),l=Math.sin(-l),m=Infinity,n=Infinity,p=-Infinity,q=-Infinity;a=a.ua();for(var t=0,v=h.length;t<v;t+=a)var u=
h[t]*d-h[t+1]*l,y=h[t]*l+h[t+1]*d,m=Math.min(m,u),n=Math.min(n,y),p=Math.max(p,u),q=Math.max(q,y);b=Gd([m,n,p,q],[b[0]-c[1]-c[3],b[1]-c[0]-c[2]]);b=isNaN(b)?g:Math.max(b,g);e&&(g=this.constrainResolution(b,0,0),!f&&g<b&&(g=this.constrainResolution(g,-1,0)),b=g);this.Zb(b);l=-l;f=(m+p)/2+(c[1]-c[3])/2*b;c=(n+q)/2+(c[0]-c[2])/2*b;this.ob([f*d-c*l,c*d+f*l])};
k.Aj=function(a,b,c){var d=this.Ma(),e=Math.cos(-d),d=Math.sin(-d),f=a[0]*e-a[1]*d;a=a[1]*e+a[0]*d;var g=this.$(),f=f+(b[0]/2-c[0])*g;a+=(c[1]-b[1]/2)*g;d=-d;this.ob([f*e-a*d,a*e+f*d])};function Jd(a){return!!a.bb()&&void 0!==a.$()}k.rotate=function(a,b){if(void 0!==b){var c,d=this.bb();void 0!==d&&(c=[d[0]-b[0],d[1]-b[1]],zb(c,a-this.Ma()),ub(c,b));this.ob(c)}this.ge(a)};k.ob=function(a){this.set(Cd,a)};function Kd(a,b){a.c[1]+=b}k.Zb=function(a){this.set(Dd,a)};k.ge=function(a){this.set(Ed,a)};
k.kp=function(a){a=this.constrainResolution(this.a,a-this.l,0);this.Zb(a)};var Cd="center",Dd="resolution",Ed="rotation";function Ld(a){return Math.pow(a,3)}function Md(a){return 1-Ld(1-a)}function Nd(a){return 3*a*a-2*a*a*a}function Qd(a){return a}function Rd(a){return.5>a?Nd(2*a):1-Nd(2*(a-.5))};function Sd(a){var b=a.source,c=a.start?a.start:Date.now(),d=b[0],e=b[1],f=void 0!==a.duration?a.duration:1E3,g=a.easing?a.easing:Nd;return function(a,b){if(b.time<c)return b.animate=!0,b.viewHints[0]+=1,!0;if(b.time<c+f){var m=1-g((b.time-c)/f),n=d-b.viewState.center[0],p=e-b.viewState.center[1];b.animate=!0;b.viewState.center[0]+=m*n;b.viewState.center[1]+=m*p;b.viewHints[0]+=1;return!0}return!1}}
function Td(a){var b=a.rotation?a.rotation:0,c=a.start?a.start:Date.now(),d=void 0!==a.duration?a.duration:1E3,e=a.easing?a.easing:Nd,f=a.anchor?a.anchor:null;return function(a,h){if(h.time<c)return h.animate=!0,h.viewHints[0]+=1,!0;if(h.time<c+d){var l=1-e((h.time-c)/d),l=(b-h.viewState.rotation)*l;h.animate=!0;h.viewState.rotation+=l;if(f){var m=h.viewState.center;m[0]-=f[0];m[1]-=f[1];zb(m,l);ub(m,f)}h.viewHints[0]+=1;return!0}return!1}}
function Ud(a){var b=a.resolution,c=a.start?a.start:Date.now(),d=void 0!==a.duration?a.duration:1E3,e=a.easing?a.easing:Nd;return function(a,g){if(g.time<c)return g.animate=!0,g.viewHints[0]+=1,!0;if(g.time<c+d){var h=1-e((g.time-c)/d),l=b-g.viewState.resolution;g.animate=!0;g.viewState.resolution+=h*l;g.viewHints[0]+=1;return!0}return!1}};function Vd(a,b,c,d){this.ca=a;this.ea=b;this.fa=c;this.ia=d}function Wd(a,b,c){return a.ca<=b&&b<=a.ea&&a.fa<=c&&c<=a.ia}function Xd(a,b){return a.ca==b.ca&&a.fa==b.fa&&a.ea==b.ea&&a.ia==b.ia}function Yd(a,b){return a.ca<=b.ea&&a.ea>=b.ca&&a.fa<=b.ia&&a.ia>=b.fa};function Zd(a,b,c){void 0===c&&(c=[0,0]);c[0]=a[0]+2*b;c[1]=a[1]+2*b;return c}function $d(a,b,c){void 0===c&&(c=[0,0]);c[0]=a[0]*b+.5|0;c[1]=a[1]*b+.5|0;return c}function ae(a,b){if(Array.isArray(a))return a;void 0===b?b=[a,a]:b[0]=b[1]=a;return b};function be(a,b,c,d){return void 0!==d?(d[0]=a,d[1]=b,d[2]=c,d):[a,b,c]}function ce(a){var b=a[0],c=Array(b),d=1<<b-1,e,f;for(e=0;e<b;++e)f=48,a[1]&d&&(f+=1),a[2]&d&&(f+=2),c[e]=String.fromCharCode(f),d>>=1;return c.join("")};function de(a){this.minZoom=void 0!==a.minZoom?a.minZoom:0;this.b=a.resolutions;la(lb(this.b,function(a,b){return b-a}),17);this.maxZoom=this.b.length-1;this.g=void 0!==a.origin?a.origin:null;this.f=null;void 0!==a.origins&&(this.f=a.origins,la(this.f.length==this.b.length,20));var b=a.extent;void 0===b||this.g||this.f||(this.g=bc(b));la(!this.g&&this.f||this.g&&!this.f,18);this.c=null;void 0!==a.tileSizes&&(this.c=a.tileSizes,la(this.c.length==this.b.length,19));this.i=void 0!==a.tileSize?a.tileSize:
this.c?null:256;la(!this.i&&this.c||this.i&&!this.c,22);this.s=void 0!==b?b:null;this.a=null;this.l=[0,0];void 0!==a.sizes?this.a=a.sizes.map(function(a){return new Vd(Math.min(0,a[0]),Math.max(a[0]-1,-1),Math.min(0,a[1]),Math.max(a[1]-1,-1))},this):b&&ee(this,b)}var fe=[0,0,0];k=de.prototype;k.wg=function(a,b,c){a=ge(this,a,b);for(var d=a.ca,e=a.ea;d<=e;++d)for(var f=a.fa,g=a.ia;f<=g;++f)c([b,d,f])};
function he(a,b,c,d,e){e=a.Ea(b,e);for(b=b[0]-1;b>=a.minZoom;){if(c.call(null,b,ge(a,e,b,d)))return!0;--b}return!1}k.C=function(){return this.s};k.Gg=function(){return this.maxZoom};k.Hg=function(){return this.minZoom};k.Ka=function(a){return this.g?this.g:this.f[a]};k.$=function(a){return this.b[a]};k.Hh=function(){return this.b};function ie(a,b,c,d){return b[0]<a.maxZoom?(d=a.Ea(b,d),ge(a,d,b[0]+1,c)):null}
function je(a,b,c,d){ke(a,b[0],b[1],c,!1,fe);var e=fe[1],f=fe[2];ke(a,b[2],b[3],c,!0,fe);a=fe[1];b=fe[2];void 0!==d?(d.ca=e,d.ea=a,d.fa=f,d.ia=b):d=new Vd(e,a,f,b);return d}function ge(a,b,c,d){c=a.$(c);return je(a,b,c,d)}function le(a,b){var c=a.Ka(b[0]),d=a.$(b[0]),e=ae(a.Qa(b[0]),a.l);return[c[0]+(b[1]+.5)*e[0]*d,c[1]+(b[2]+.5)*e[1]*d]}k.Ea=function(a,b){var c=this.Ka(a[0]),d=this.$(a[0]),e=ae(this.Qa(a[0]),this.l),f=c[0]+a[1]*e[0]*d,c=c[1]+a[2]*e[1]*d;return Qb(f,c,f+e[0]*d,c+e[1]*d,b)};
k.Yd=function(a,b,c){return ke(this,a[0],a[1],b,!1,c)};function ke(a,b,c,d,e,f){var g=a.ec(d),h=d/a.$(g),l=a.Ka(g);a=ae(a.Qa(g),a.l);b=h*Math.floor((b-l[0])/d+(e?.5:0))/a[0];c=h*Math.floor((c-l[1])/d+(e?0:.5))/a[1];e?(b=Math.ceil(b)-1,c=Math.ceil(c)-1):(b=Math.floor(b),c=Math.floor(c));return be(g,b,c,f)}k.pd=function(a,b,c){b=this.$(b);return ke(this,a[0],a[1],b,!1,c)};k.Qa=function(a){return this.i?this.i:this.c[a]};k.ec=function(a,b){return ma(cb(this.b,a,b||0),this.minZoom,this.maxZoom)};
function ee(a,b){for(var c=a.b.length,d=Array(c),e=a.minZoom;e<c;++e)d[e]=ge(a,b,e);a.a=d};function me(a){var b=a.l;if(!b){var b=ne(a),c=oe(b,void 0,void 0),b=new de({extent:b,origin:bc(b),resolutions:c,tileSize:void 0});a.l=b}return b}function pe(a){var b={};za(b,void 0!==a?a:{});void 0===b.extent&&(b.extent=vc("EPSG:3857").C());b.resolutions=oe(b.extent,b.maxZoom,b.tileSize);delete b.maxZoom;return new de(b)}function oe(a,b,c){b=void 0!==b?b:42;var d=fc(a);a=ec(a);c=ae(void 0!==c?c:256);c=Math.max(a/c[0],d/c[1]);b+=1;d=Array(b);for(a=0;a<b;++a)d[a]=c/Math.pow(2,a);return d}
function ne(a){a=vc(a);var b=a.C();b||(a=180*rc.degrees/a.cc(),b=Qb(-a,-a,a,a));return b};function qe(a){this.a=a.html;this.b=a.tileRanges?a.tileRanges:null}qe.prototype.g=function(){return this.a};function re(a){Xa.call(this);this.a=a?a:[];se(this)}w(re,Xa);k=re.prototype;k.clear=function(){for(;0<this.gc();)this.pop()};k.pf=function(a){var b,c;b=0;for(c=a.length;b<c;++b)this.push(a[b]);return this};k.forEach=function(a,b){this.a.forEach(a,b)};k.Bl=function(){return this.a};k.item=function(a){return this.a[a]};k.gc=function(){return this.get("length")};k.ce=function(a,b){this.a.splice(a,0,b);se(this);this.b(new te(ue,b))};k.pop=function(){return this.Qf(this.gc()-1)};
k.push=function(a){var b=this.a.length;this.ce(b,a);return b};k.remove=function(a){var b=this.a,c,d;c=0;for(d=b.length;c<d;++c)if(b[c]===a)return this.Qf(c)};k.Qf=function(a){var b=this.a[a];this.a.splice(a,1);se(this);this.b(new te(ve,b));return b};k.Wo=function(a,b){var c=this.gc();if(a<c)c=this.a[a],this.a[a]=b,this.b(new te(ve,c)),this.b(new te(ue,b));else{for(;c<a;++c)this.ce(c,void 0);this.ce(a,b)}};function se(a){a.set("length",a.a.length)}var ue="add",ve="remove";
function te(a,b){Pa.call(this,a);this.element=b}w(te,Pa);var we=/^#(?:[0-9a-f]{3}){1,2}$/i,xe=/^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i,ye=/^(?:rgba)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|1|0\.\d{0,10})\)$/i,ze=/^([a-z]*)$/i;function Ae(a){return Array.isArray(a)?a:Be(a)}function Ce(a){if("string"!==typeof a){var b=a[0];b!=(b|0)&&(b=b+.5|0);var c=a[1];c!=(c|0)&&(c=c+.5|0);var d=a[2];d!=(d|0)&&(d=d+.5|0);a="rgba("+b+","+c+","+d+","+(void 0===a[3]?1:a[3])+")"}return a}
var Be=function(){var a={},b=0;return function(c){var d;if(a.hasOwnProperty(c))d=a[c];else{if(1024<=b){d=0;for(var e in a)0===(d++&3)&&(delete a[e],--b)}d=c;var f,g;ze.exec(d)&&(e=document.createElement("div"),e.style.color=d,document.body.appendChild(e),d=window.getComputedStyle(e).color,document.body.removeChild(e));we.exec(d)?(f=d.length-1,la(3==f||6==f,54),g=3==f?1:2,f=parseInt(d.substr(1+0*g,g),16),e=parseInt(d.substr(1+1*g,g),16),d=parseInt(d.substr(1+2*g,g),16),1==g&&(f=(f<<4)+f,e=(e<<4)+e,
d=(d<<4)+d),f=[f,e,d,1]):(g=ye.exec(d))?(f=Number(g[1]),e=Number(g[2]),d=Number(g[3]),g=Number(g[4]),f=De([f,e,d,g])):(g=xe.exec(d))?(f=Number(g[1]),e=Number(g[2]),d=Number(g[3]),f=De([f,e,d,1])):la(!1,14);d=f;a[c]=d;++b}return d}}();function De(a){var b=[];b[0]=ma(a[0]+.5|0,0,255);b[1]=ma(a[1]+.5|0,0,255);b[2]=ma(a[2]+.5|0,0,255);b[3]=ma(a[3],0,1);return b};function Ee(a){return"string"===typeof a||a instanceof CanvasPattern||a instanceof CanvasGradient?a:Ce(a)};var Fe=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function Ge(a,b){return a<b?-1:a>b?1:0};function He(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var Ie;a:{var Je=aa.navigator;if(Je){var Ke=Je.userAgent;if(Ke){Ie=Ke;break a}}Ie=""}function Le(a){return-1!=Ie.indexOf(a)};var Me=Le("Opera"),Ne=Le("Trident")||Le("MSIE"),Oe=Le("Edge"),Pe=Le("Gecko")&&!(-1!=Ie.toLowerCase().indexOf("webkit")&&!Le("Edge"))&&!(Le("Trident")||Le("MSIE"))&&!Le("Edge"),Qe=-1!=Ie.toLowerCase().indexOf("webkit")&&!Le("Edge"),Re;
a:{var Se="",Te=function(){var a=Ie;if(Pe)return/rv\:([^\);]+)(\)|;)/.exec(a);if(Oe)return/Edge\/([\d\.]+)/.exec(a);if(Ne)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(Qe)return/WebKit\/(\S+)/.exec(a);if(Me)return/(?:Version)[ \/]?(\S+)/.exec(a)}();Te&&(Se=Te?Te[1]:"");if(Ne){var Ue,Ve=aa.document;Ue=Ve?Ve.documentMode:void 0;if(null!=Ue&&Ue>parseFloat(Se)){Re=String(Ue);break a}}Re=Se}var We={};function Xe(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function Ye(a,b){a[0]=b[0];a[1]=b[1];a[4]=b[2];a[5]=b[3];a[12]=b[4];a[13]=b[5];return a};var Ze=Xe();function $e(a,b){var c=document.createElement("CANVAS");a&&(c.width=a);b&&(c.height=b);return c.getContext("2d")}
var af=function(){var a;return function(){if(void 0===a){var b=document.createElement("P"),c,d={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.appendChild(b);for(var e in d)e in b.style&&(b.style[e]="translate(1px,1px)",c=ja.getComputedStyle(b).getPropertyValue(d[e]));document.body.removeChild(b);a=c&&"none"!==c}return a}}(),bf=function(){var a;return function(){if(void 0===a){var b=document.createElement("P"),
c,d={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.appendChild(b);for(var e in d)e in b.style&&(b.style[e]="translate3d(1px,1px,1px)",c=ja.getComputedStyle(b).getPropertyValue(d[e]));document.body.removeChild(b);a=c&&"none"!==c}return a}}();
function cf(a,b){var c=a.style;c.WebkitTransform=b;c.MozTransform=b;c.b=b;c.msTransform=b;c.transform=b;if((c=Ne)&&!(c=We["9.0"])){for(var c=0,d=Fe(String(Re)).split("."),e=Fe("9.0").split("."),f=Math.max(d.length,e.length),g=0;0==c&&g<f;g++){var h=d[g]||"",l=e[g]||"",m=RegExp("(\\d*)(\\D*)","g"),n=RegExp("(\\d*)(\\D*)","g");do{var p=m.exec(h)||["","",""],q=n.exec(l)||["","",""];if(0==p[0].length&&0==q[0].length)break;c=Ge(0==p[1].length?0:parseInt(p[1],10),0==q[1].length?0:parseInt(q[1],10))||Ge(0==
p[2].length,0==q[2].length)||Ge(p[2],q[2])}while(0==c)}c=We["9.0"]=0<=c}c&&(a.style.transformOrigin="0 0")}function df(a,b){var c;if(bf()){var d=Ye(Ze,b),e=Array(16);for(c=0;16>c;++c)e[c]=d[c].toFixed(6);cf(a,"matrix3d("+e.join(",")+")")}else if(af()){d=Array(6);for(c=0;6>c;++c)d[c]=b[c].toFixed(6);cf(a,"matrix("+d.join(",")+")")}else a.style.left=Math.round(b[4])+"px",a.style.top=Math.round(b[5])+"px"}function ef(a,b){var c=b.parentNode;c&&c.replaceChild(a,b)}
function ff(a){a&&a.parentNode&&a.parentNode.removeChild(a)}function gf(a){for(;a.lastChild;)a.removeChild(a.lastChild)};function hf(a,b,c){Pa.call(this,a);this.map=b;this.frameState=void 0!==c?c:null}w(hf,Pa);function jf(a){Xa.call(this);this.element=a.element?a.element:null;this.a=this.R=null;this.s=[];this.render=a.render?a.render:ha;a.target&&this.c(a.target)}w(jf,Xa);jf.prototype.ma=function(){ff(this.element);Xa.prototype.ma.call(this)};jf.prototype.i=function(){return this.a};
jf.prototype.setMap=function(a){this.a&&ff(this.element);for(var b=0,c=this.s.length;b<c;++b)Ea(this.s[b]);this.s.length=0;if(this.a=a)(this.R?this.R:a.v).appendChild(this.element),this.render!==ha&&this.s.push(B(a,"postrender",this.render,this)),a.render()};jf.prototype.c=function(a){this.R="string"===typeof a?document.getElementById(a):a};function kf(a){a=a?a:{};this.O=document.createElement("UL");this.v=document.createElement("LI");this.O.appendChild(this.v);this.v.style.display="none";this.f=void 0!==a.collapsed?a.collapsed:!0;this.j=void 0!==a.collapsible?a.collapsible:!0;this.j||(this.f=!1);var b=void 0!==a.className?a.className:"ol-attribution",c=void 0!==a.tipLabel?a.tipLabel:"Attributions",d=void 0!==a.collapseLabel?a.collapseLabel:"\u00bb";"string"===typeof d?(this.A=document.createElement("span"),this.A.textContent=d):this.A=
d;d=void 0!==a.label?a.label:"i";"string"===typeof d?(this.H=document.createElement("span"),this.H.textContent=d):this.H=d;var e=this.j&&!this.f?this.A:this.H,d=document.createElement("button");d.setAttribute("type","button");d.title=c;d.appendChild(e);B(d,"click",this.Wl,this);c=document.createElement("div");c.className=b+" ol-unselectable ol-control"+(this.f&&this.j?" ol-collapsed":"")+(this.j?"":" ol-uncollapsible");c.appendChild(this.O);c.appendChild(d);jf.call(this,{element:c,render:a.render?
a.render:lf,target:a.target});this.D=!0;this.o={};this.l={};this.T={}}w(kf,jf);
function lf(a){if(a=a.frameState){var b,c,d,e,f,g,h,l,m,n,p,q=a.layerStatesArray,t=za({},a.attributions),v={},u=a.viewState.projection;c=0;for(b=q.length;c<b;c++)if(g=q[c].layer.ga())if(n=x(g).toString(),m=g.l)for(d=0,e=m.length;d<e;d++)if(h=m[d],l=x(h).toString(),!(l in t)){if(f=a.usedTiles[n]){var y=g.fb(u);a:{p=h;var E=u;if(p.b){var z,G,J,X=void 0;for(X in f)if(X in p.b){J=f[X];var A;z=0;for(G=p.b[X].length;z<G;++z){A=p.b[X][z];if(Yd(A,J)){p=!0;break a}var Ma=ge(y,ne(E),parseInt(X,10)),ua=Ma.ea-
Ma.ca+1;if(J.ca<Ma.ca||J.ea>Ma.ea)if(Yd(A,new Vd(ta(J.ca,ua),ta(J.ea,ua),J.fa,J.ia))||J.ea-J.ca+1>ua&&Yd(A,Ma)){p=!0;break a}}}p=!1}else p=!0}}else p=!1;p?(l in v&&delete v[l],t[l]=h):v[l]=h}b=[t,v];c=b[0];b=b[1];for(var M in this.o)M in c?(this.l[M]||(this.o[M].style.display="",this.l[M]=!0),delete c[M]):M in b?(this.l[M]&&(this.o[M].style.display="none",delete this.l[M]),delete b[M]):(ff(this.o[M]),delete this.o[M],delete this.l[M]);for(M in c)d=document.createElement("LI"),d.innerHTML=c[M].a,this.O.appendChild(d),
this.o[M]=d,this.l[M]=!0;for(M in b)d=document.createElement("LI"),d.innerHTML=b[M].a,d.style.display="none",this.O.appendChild(d),this.o[M]=d;M=!Ca(this.l)||!Ca(a.logos);this.D!=M&&(this.element.style.display=M?"":"none",this.D=M);M&&Ca(this.l)?this.element.classList.add("ol-logo-only"):this.element.classList.remove("ol-logo-only");var oa;a=a.logos;M=this.T;for(oa in M)oa in a||(ff(M[oa]),delete M[oa]);for(var Wb in a)b=a[Wb],b instanceof HTMLElement&&(this.v.appendChild(b),M[Wb]=b),Wb in M||(oa=
new Image,oa.src=Wb,""===b?c=oa:(c=document.createElement("a"),c.href=b,c.appendChild(oa)),this.v.appendChild(c),M[Wb]=c);this.v.style.display=Ca(a)?"none":""}else this.D&&(this.element.style.display="none",this.D=!1)}k=kf.prototype;k.Wl=function(a){a.preventDefault();mf(this)};function mf(a){a.element.classList.toggle("ol-collapsed");a.f?ef(a.A,a.H):ef(a.H,a.A);a.f=!a.f}k.Vl=function(){return this.j};
k.Yl=function(a){this.j!==a&&(this.j=a,this.element.classList.toggle("ol-uncollapsible"),!a&&this.f&&mf(this))};k.Xl=function(a){this.j&&this.f!==a&&mf(this)};k.Ul=function(){return this.f};function nf(a){a=a?a:{};this.f=void 0!==a.className?a.className:"ol-full-screen";var b=void 0!==a.label?a.label:"\u2922";this.j="string"===typeof b?document.createTextNode(b):b;b=void 0!==a.labelActive?a.labelActive:"\u00d7";this.o="string"===typeof b?document.createTextNode(b):b;var c=a.tipLabel?a.tipLabel:"Toggle full-screen",b=document.createElement("button");b.className=this.f+"-"+of();b.setAttribute("type","button");b.title=c;b.appendChild(this.j);B(b,"click",this.H,this);c=document.createElement("div");
c.className=this.f+" ol-unselectable ol-control "+(pf()?"":"ol-unsupported");c.appendChild(b);jf.call(this,{element:c,target:a.target});this.A=void 0!==a.keys?a.keys:!1;this.l=a.source}w(nf,jf);
nf.prototype.H=function(a){a.preventDefault();pf()&&(a=this.a)&&(of()?document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen():(a=this.l?"string"===typeof this.l?document.getElementById(this.l):this.l:a.xc(),this.A?a.mozRequestFullScreenWithKeys?a.mozRequestFullScreenWithKeys():a.webkitRequestFullscreen?a.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT):
qf(a):qf(a)))};nf.prototype.v=function(){var a=this.element.firstElementChild,b=this.a;of()?(a.className=this.f+"-true",ef(this.o,this.j)):(a.className=this.f+"-false",ef(this.j,this.o));b&&b.Wc()};nf.prototype.setMap=function(a){jf.prototype.setMap.call(this,a);a&&this.s.push(B(ja.document,rf(),this.v,this))};
function pf(){var a=document.body;return!!(a.webkitRequestFullscreen||a.mozRequestFullScreen&&document.mozFullScreenEnabled||a.msRequestFullscreen&&document.msFullscreenEnabled||a.requestFullscreen&&document.fullscreenEnabled)}function of(){return!!(document.webkitIsFullScreen||document.mozFullScreen||document.msFullscreenElement||document.fullscreenElement)}
function qf(a){a.requestFullscreen?a.requestFullscreen():a.msRequestFullscreen?a.msRequestFullscreen():a.mozRequestFullScreen?a.mozRequestFullScreen():a.webkitRequestFullscreen&&a.webkitRequestFullscreen()}var rf=function(){var a;return function(){if(!a){var b=document.body;b.webkitRequestFullscreen?a="webkitfullscreenchange":b.mozRequestFullScreen?a="mozfullscreenchange":b.msRequestFullscreen?a="MSFullscreenChange":b.requestFullscreen&&(a="fullscreenchange")}return a}}();function sf(a){a=a?a:{};var b=void 0!==a.className?a.className:"ol-rotate",c=void 0!==a.label?a.label:"\u21e7";this.f=null;"string"===typeof c?(this.f=document.createElement("span"),this.f.className="ol-compass",this.f.textContent=c):(this.f=c,this.f.classList.add("ol-compass"));var d=a.tipLabel?a.tipLabel:"Reset rotation",c=document.createElement("button");c.className=b+"-reset";c.setAttribute("type","button");c.title=d;c.appendChild(this.f);B(c,"click",sf.prototype.A,this);d=document.createElement("div");
d.className=b+" ol-unselectable ol-control";d.appendChild(c);b=a.render?a.render:uf;this.j=a.resetNorth?a.resetNorth:void 0;jf.call(this,{element:d,render:b,target:a.target});this.o=void 0!==a.duration?a.duration:250;this.l=void 0!==a.autoHide?a.autoHide:!0;this.v=void 0;this.l&&this.element.classList.add("ol-hidden")}w(sf,jf);
sf.prototype.A=function(a){a.preventDefault();if(void 0!==this.j)this.j();else{a=this.a;var b=a.aa();if(b){var c=b.Ma();void 0!==c&&(0<this.o&&(c%=2*Math.PI,c<-Math.PI&&(c+=2*Math.PI),c>Math.PI&&(c-=2*Math.PI),a.$a(Td({rotation:c,duration:this.o,easing:Md}))),b.ge(0))}}};
function uf(a){if(a=a.frameState){a=a.viewState.rotation;if(a!=this.v){var b="rotate("+a+"rad)";if(this.l){var c=this.element.classList.contains("ol-hidden");c||0!==a?c&&0!==a&&this.element.classList.remove("ol-hidden"):this.element.classList.add("ol-hidden")}this.f.style.msTransform=b;this.f.style.webkitTransform=b;this.f.style.transform=b}this.v=a}};function vf(a){a=a?a:{};var b=void 0!==a.className?a.className:"ol-zoom",c=void 0!==a.delta?a.delta:1,d=void 0!==a.zoomInLabel?a.zoomInLabel:"+",e=void 0!==a.zoomOutLabel?a.zoomOutLabel:"\u2212",f=void 0!==a.zoomInTipLabel?a.zoomInTipLabel:"Zoom in",g=void 0!==a.zoomOutTipLabel?a.zoomOutTipLabel:"Zoom out",h=document.createElement("button");h.className=b+"-in";h.setAttribute("type","button");h.title=f;h.appendChild("string"===typeof d?document.createTextNode(d):d);B(h,"click",vf.prototype.l.bind(this,
c));d=document.createElement("button");d.className=b+"-out";d.setAttribute("type","button");d.title=g;d.appendChild("string"===typeof e?document.createTextNode(e):e);B(d,"click",vf.prototype.l.bind(this,-c));c=document.createElement("div");c.className=b+" ol-unselectable ol-control";c.appendChild(h);c.appendChild(d);jf.call(this,{element:c,target:a.target});this.f=void 0!==a.duration?a.duration:250}w(vf,jf);
vf.prototype.l=function(a,b){b.preventDefault();var c=this.a,d=c.aa();if(d){var e=d.$();e&&(0<this.f&&c.$a(Ud({resolution:e,duration:this.f,easing:Md})),c=d.constrainResolution(e,a),d.Zb(c))}};function wf(a){a=a?a:{};var b=new re;(void 0!==a.zoom?a.zoom:1)&&b.push(new vf(a.zoomOptions));(void 0!==a.rotate?a.rotate:1)&&b.push(new sf(a.rotateOptions));(void 0!==a.attribution?a.attribution:1)&&b.push(new kf(a.attributionOptions));return b};function xf(a){a=a?a:{};var b=document.createElement("DIV");b.className=void 0!==a.className?a.className:"ol-mouse-position";jf.call(this,{element:b,render:a.render?a.render:yf,target:a.target});B(this,Za("projection"),this.Zl,this);a.coordinateFormat&&this.bi(a.coordinateFormat);a.projection&&this.fh(vc(a.projection));this.v=void 0!==a.undefinedHTML?a.undefinedHTML:"";this.o=b.innerHTML;this.j=this.l=this.f=null}w(xf,jf);
function yf(a){a=a.frameState;a?this.f!=a.viewState.projection&&(this.f=a.viewState.projection,this.l=null):this.f=null;zf(this,this.j)}k=xf.prototype;k.Zl=function(){this.l=null};k.Ag=function(){return this.get("coordinateFormat")};k.eh=function(){return this.get("projection")};k.Sk=function(a){this.j=this.a.Td(a);zf(this,this.j)};k.Tk=function(){zf(this,null);this.j=null};
k.setMap=function(a){jf.prototype.setMap.call(this,a);a&&(a=a.a,this.s.push(B(a,"mousemove",this.Sk,this),B(a,"mouseout",this.Tk,this)))};k.bi=function(a){this.set("coordinateFormat",a)};k.fh=function(a){this.set("projection",a)};function zf(a,b){var c=a.v;if(b&&a.f){if(!a.l){var d=a.eh();a.l=d?yc(a.f,d):Nc}if(d=a.a.Na(b))a.l(d,d),c=(c=a.Ag())?c(d):d.toString()}a.o&&c==a.o||(a.element.innerHTML=c,a.o=c)};function Af(a,b){var c=a;b&&(c=ea(a,b));"function"!=ba()||aa.Window&&aa.Window.prototype&&!Le("Edge")&&aa.Window.prototype.setImmediate==aa.setImmediate?(Bf||(Bf=Cf()),Bf(c)):aa.setImmediate(c)}var Bf;
function Cf(){var a=aa.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!Le("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,a=ea(function(a){if(("*"==d||a.origin==d)&&a.data==
c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&!Le("Trident")&&!Le("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.qg;c.qg=null;a()}};return function(a){d.next={qg:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");
b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){aa.setTimeout(a,0)}};var Df=["experimental-webgl","webgl","webkit-3d","moz-webgl"];function Ef(a,b){var c,d,e=Df.length;for(d=0;d<e;++d)try{if(c=a.getContext(Df[d],b))return c}catch(f){}return null};var Ff,Gf="undefined"!==typeof navigator?navigator.userAgent.toLowerCase():"",Hf=-1!==Gf.indexOf("firefox"),If=-1!==Gf.indexOf("safari")&&-1===Gf.indexOf("chrom"),Jf=-1!==Gf.indexOf("macintosh"),Kf=ja.devicePixelRatio||1,Lf=!1,Mf=function(){if(!("HTMLCanvasElement"in ja))return!1;try{var a=$e();return a?(a.setLineDash&&(Lf=!0),!0):!1}catch(b){return!1}}(),Nf="DeviceOrientationEvent"in ja,Of="geolocation"in ja.navigator,Pf="ontouchstart"in ja,Qf="PointerEvent"in ja,Rf=!!ja.navigator.msPointerEnabled,
Sf=!1,Tf,Uf=[];if("WebGLRenderingContext"in ja)try{var Vf=Ef(document.createElement("CANVAS"),{failIfMajorPerformanceCaveat:!0});Vf&&(Sf=!0,Tf=Vf.getParameter(Vf.MAX_TEXTURE_SIZE),Uf=Vf.getSupportedExtensions())}catch(a){}Ff=Sf;ga=Uf;fa=Tf;function Wf(a,b){this.b=a;this.c=b};function Xf(a){Wf.call(this,a,{mousedown:this.ml,mousemove:this.nl,mouseup:this.ql,mouseover:this.pl,mouseout:this.ol});this.a=a.g;this.g=[]}w(Xf,Wf);function Yf(a,b){for(var c=a.g,d=b.clientX,e=b.clientY,f=0,g=c.length,h;f<g&&(h=c[f]);f++){var l=Math.abs(e-h[1]);if(25>=Math.abs(d-h[0])&&25>=l)return!0}return!1}function Zf(a){var b=$f(a,a),c=b.preventDefault;b.preventDefault=function(){a.preventDefault();c()};b.pointerId=1;b.isPrimary=!0;b.pointerType="mouse";return b}k=Xf.prototype;
k.ml=function(a){if(!Yf(this,a)){if((1).toString()in this.a){var b=Zf(a);ag(this.b,bg,b,a);delete this.a[(1).toString()]}b=Zf(a);this.a[(1).toString()]=a;ag(this.b,cg,b,a)}};k.nl=function(a){if(!Yf(this,a)){var b=Zf(a);ag(this.b,dg,b,a)}};k.ql=function(a){if(!Yf(this,a)){var b=this.a[(1).toString()];b&&b.button===a.button&&(b=Zf(a),ag(this.b,eg,b,a),delete this.a[(1).toString()])}};k.pl=function(a){if(!Yf(this,a)){var b=Zf(a);fg(this.b,b,a)}};
k.ol=function(a){if(!Yf(this,a)){var b=Zf(a);gg(this.b,b,a)}};function hg(a){Wf.call(this,a,{MSPointerDown:this.vl,MSPointerMove:this.wl,MSPointerUp:this.zl,MSPointerOut:this.xl,MSPointerOver:this.yl,MSPointerCancel:this.ul,MSGotPointerCapture:this.sl,MSLostPointerCapture:this.tl});this.a=a.g;this.g=["","unavailable","touch","pen","mouse"]}w(hg,Wf);function ig(a,b){var c=b;"number"===typeof b.pointerType&&(c=$f(b,b),c.pointerType=a.g[b.pointerType]);return c}k=hg.prototype;k.vl=function(a){this.a[a.pointerId.toString()]=a;var b=ig(this,a);ag(this.b,cg,b,a)};
k.wl=function(a){var b=ig(this,a);ag(this.b,dg,b,a)};k.zl=function(a){var b=ig(this,a);ag(this.b,eg,b,a);delete this.a[a.pointerId.toString()]};k.xl=function(a){var b=ig(this,a);gg(this.b,b,a)};k.yl=function(a){var b=ig(this,a);fg(this.b,b,a)};k.ul=function(a){var b=ig(this,a);ag(this.b,bg,b,a);delete this.a[a.pointerId.toString()]};k.tl=function(a){this.b.b(new jg("lostpointercapture",a,a))};k.sl=function(a){this.b.b(new jg("gotpointercapture",a,a))};function kg(a){Wf.call(this,a,{pointerdown:this.io,pointermove:this.jo,pointerup:this.mo,pointerout:this.ko,pointerover:this.lo,pointercancel:this.ho,gotpointercapture:this.Dk,lostpointercapture:this.ll})}w(kg,Wf);k=kg.prototype;k.io=function(a){lg(this.b,a)};k.jo=function(a){lg(this.b,a)};k.mo=function(a){lg(this.b,a)};k.ko=function(a){lg(this.b,a)};k.lo=function(a){lg(this.b,a)};k.ho=function(a){lg(this.b,a)};k.ll=function(a){lg(this.b,a)};k.Dk=function(a){lg(this.b,a)};function jg(a,b,c){Pa.call(this,a);this.b=b;a=c?c:{};this.buttons=mg(a);this.pressure=ng(a,this.buttons);this.bubbles="bubbles"in a?a.bubbles:!1;this.cancelable="cancelable"in a?a.cancelable:!1;this.view="view"in a?a.view:null;this.detail="detail"in a?a.detail:null;this.screenX="screenX"in a?a.screenX:0;this.screenY="screenY"in a?a.screenY:0;this.clientX="clientX"in a?a.clientX:0;this.clientY="clientY"in a?a.clientY:0;this.button="button"in a?a.button:0;this.relatedTarget="relatedTarget"in a?a.relatedTarget:
null;this.pointerId="pointerId"in a?a.pointerId:0;this.width="width"in a?a.width:0;this.height="height"in a?a.height:0;this.pointerType="pointerType"in a?a.pointerType:"";this.isPrimary="isPrimary"in a?a.isPrimary:!1;b.preventDefault&&(this.preventDefault=function(){b.preventDefault()})}w(jg,Pa);function mg(a){if(a.buttons||og)a=a.buttons;else switch(a.which){case 1:a=1;break;case 2:a=4;break;case 3:a=2;break;default:a=0}return a}
function ng(a,b){var c=0;a.pressure?c=a.pressure:c=b?.5:0;return c}var og=!1;try{og=1===(new MouseEvent("click",{buttons:1})).buttons}catch(a){};function pg(a,b){Wf.call(this,a,{touchstart:this.pp,touchmove:this.op,touchend:this.np,touchcancel:this.mp});this.a=a.g;this.l=b;this.g=void 0;this.i=0;this.f=void 0}w(pg,Wf);k=pg.prototype;k.$h=function(){this.i=0;this.f=void 0};
function qg(a,b,c){b=$f(b,c);b.pointerId=c.identifier+2;b.bubbles=!0;b.cancelable=!0;b.detail=a.i;b.button=0;b.buttons=1;b.width=c.webkitRadiusX||c.radiusX||0;b.height=c.webkitRadiusY||c.radiusY||0;b.pressure=c.webkitForce||c.force||.5;b.isPrimary=a.g===c.identifier;b.pointerType="touch";b.clientX=c.clientX;b.clientY=c.clientY;b.screenX=c.screenX;b.screenY=c.screenY;return b}
function rg(a,b,c){function d(){b.preventDefault()}var e=Array.prototype.slice.call(b.changedTouches),f=e.length,g,h;for(g=0;g<f;++g)h=qg(a,b,e[g]),h.preventDefault=d,c.call(a,b,h)}
k.pp=function(a){var b=a.touches,c=Object.keys(this.a),d=c.length;if(d>=b.length){var e=[],f,g,h;for(f=0;f<d;++f){g=c[f];h=this.a[g];var l;if(!(l=1==g))a:{l=b.length;for(var m,n=0;n<l;n++)if(m=b[n],m.identifier===g-2){l=!0;break a}l=!1}l||e.push(h.out)}for(f=0;f<e.length;++f)this.Se(a,e[f])}b=a.changedTouches[0];c=Object.keys(this.a).length;if(0===c||1===c&&(1).toString()in this.a)this.g=b.identifier,b=ja,void 0!==this.f&&b.clearTimeout(this.f);sg(this,a);this.i++;rg(this,a,this.bo)};
k.bo=function(a,b){this.a[b.pointerId]={target:b.target,out:b,Ih:b.target};var c=this.b;b.bubbles=!0;ag(c,tg,b,a);c=this.b;b.bubbles=!1;ag(c,ug,b,a);ag(this.b,cg,b,a)};k.op=function(a){a.preventDefault();rg(this,a,this.rl)};k.rl=function(a,b){var c=this.a[b.pointerId];if(c){var d=c.out,e=c.Ih;ag(this.b,dg,b,a);d&&e!==b.target&&(d.relatedTarget=b.target,b.relatedTarget=e,d.target=e,b.target?(gg(this.b,d,a),fg(this.b,b,a)):(b.target=e,b.relatedTarget=null,this.Se(a,b)));c.out=b;c.Ih=b.target}};
k.np=function(a){sg(this,a);rg(this,a,this.qp)};k.qp=function(a,b){ag(this.b,eg,b,a);this.b.out(b,a);var c=this.b;b.bubbles=!1;ag(c,vg,b,a);delete this.a[b.pointerId];b.isPrimary&&(this.g=void 0,this.f=ja.setTimeout(this.$h.bind(this),200))};k.mp=function(a){rg(this,a,this.Se)};k.Se=function(a,b){ag(this.b,bg,b,a);this.b.out(b,a);var c=this.b;b.bubbles=!1;ag(c,vg,b,a);delete this.a[b.pointerId];b.isPrimary&&(this.g=void 0,this.f=ja.setTimeout(this.$h.bind(this),200))};
function sg(a,b){var c=a.l.g,d=b.changedTouches[0];if(a.g===d.identifier){var e=[d.clientX,d.clientY];c.push(e);ja.setTimeout(function(){fb(c,e)},2500)}};function wg(a){Sa.call(this);this.i=a;this.g={};this.c={};this.a=[];Qf?xg(this,new kg(this)):Rf?xg(this,new hg(this)):(a=new Xf(this),xg(this,a),Pf&&xg(this,new pg(this,a)));a=this.a.length;for(var b,c=0;c<a;c++)b=this.a[c],yg(this,Object.keys(b.c))}w(wg,Sa);function xg(a,b){var c=Object.keys(b.c);c&&(c.forEach(function(a){var c=b.c[a];c&&(this.c[a]=c.bind(b))},a),a.a.push(b))}wg.prototype.f=function(a){var b=this.c[a.type];b&&b(a)};
function yg(a,b){b.forEach(function(a){B(this.i,a,this.f,this)},a)}function zg(a,b){b.forEach(function(a){Ka(this.i,a,this.f,this)},a)}function $f(a,b){for(var c={},d,e=0,f=Ag.length;e<f;e++)d=Ag[e][0],c[d]=a[d]||b[d]||Ag[e][1];return c}wg.prototype.out=function(a,b){a.bubbles=!0;ag(this,Bg,a,b)};function gg(a,b,c){a.out(b,c);var d=b.target,e=b.relatedTarget;d&&e&&d.contains(e)||(b.bubbles=!1,ag(a,vg,b,c))}
function fg(a,b,c){b.bubbles=!0;ag(a,tg,b,c);var d=b.target,e=b.relatedTarget;d&&e&&d.contains(e)||(b.bubbles=!1,ag(a,ug,b,c))}function ag(a,b,c,d){a.b(new jg(b,d,c))}function lg(a,b){a.b(new jg(b.type,b,b))}wg.prototype.ma=function(){for(var a=this.a.length,b,c=0;c<a;c++)b=this.a[c],zg(this,Object.keys(b.c));Sa.prototype.ma.call(this)};
var dg="pointermove",cg="pointerdown",eg="pointerup",tg="pointerover",Bg="pointerout",ug="pointerenter",vg="pointerleave",bg="pointercancel",Ag=[["bubbles",!1],["cancelable",!1],["view",null],["detail",null],["screenX",0],["screenY",0],["clientX",0],["clientY",0],["ctrlKey",!1],["altKey",!1],["shiftKey",!1],["metaKey",!1],["button",0],["relatedTarget",null],["buttons",0],["pointerId",0],["width",0],["height",0],["pressure",0],["tiltX",0],["tiltY",0],["pointerType",""],["hwTimestamp",0],["isPrimary",
!1],["type",""],["target",null],["currentTarget",null],["which",0]];function Cg(a,b,c,d,e){hf.call(this,a,b,e);this.originalEvent=c;this.pixel=b.Td(c);this.coordinate=b.Na(this.pixel);this.dragging=void 0!==d?d:!1}w(Cg,hf);Cg.prototype.preventDefault=function(){hf.prototype.preventDefault.call(this);this.originalEvent.preventDefault()};Cg.prototype.stopPropagation=function(){hf.prototype.stopPropagation.call(this);this.originalEvent.stopPropagation()};function Dg(a,b,c,d,e){Cg.call(this,a,b,c.b,d,e);this.b=c}w(Dg,Cg);
function Eg(a){Sa.call(this);this.f=a;this.l=0;this.j=!1;this.c=[];this.g=null;a=this.f.a;this.U=0;this.v={};this.i=new wg(a);this.a=null;this.o=B(this.i,cg,this.Vk,this);this.s=B(this.i,dg,this.Ko,this)}w(Eg,Sa);function Fg(a,b){var c;c=new Dg(Gg,a.f,b);a.b(c);0!==a.l?(ja.clearTimeout(a.l),a.l=0,c=new Dg(Hg,a.f,b),a.b(c)):a.l=ja.setTimeout(function(){this.l=0;var a=new Dg(Ig,this.f,b);this.b(a)}.bind(a),250)}
function Jg(a,b){b.type==Kg||b.type==Lg?delete a.v[b.pointerId]:b.type==Mg&&(a.v[b.pointerId]=!0);a.U=Object.keys(a.v).length}k=Eg.prototype;k.Og=function(a){Jg(this,a);var b=new Dg(Kg,this.f,a);this.b(b);!this.j&&0===a.button&&Fg(this,this.g);0===this.U&&(this.c.forEach(Ea),this.c.length=0,this.j=!1,this.g=null,Oa(this.a),this.a=null)};
k.Vk=function(a){Jg(this,a);var b=new Dg(Mg,this.f,a);this.b(b);this.g=a;0===this.c.length&&(this.a=new wg(document),this.c.push(B(this.a,Ng,this.Nl,this),B(this.a,Kg,this.Og,this),B(this.i,Lg,this.Og,this)))};k.Nl=function(a){if(a.clientX!=this.g.clientX||a.clientY!=this.g.clientY){this.j=!0;var b=new Dg(Og,this.f,a,this.j);this.b(b)}a.preventDefault()};k.Ko=function(a){this.b(new Dg(a.type,this.f,a,!(!this.g||a.clientX==this.g.clientX&&a.clientY==this.g.clientY)))};
k.ma=function(){this.s&&(Ea(this.s),this.s=null);this.o&&(Ea(this.o),this.o=null);this.c.forEach(Ea);this.c.length=0;this.a&&(Oa(this.a),this.a=null);this.i&&(Oa(this.i),this.i=null);Sa.prototype.ma.call(this)};var Ig="singleclick",Gg="click",Hg="dblclick",Og="pointerdrag",Ng="pointermove",Mg="pointerdown",Kg="pointerup",Lg="pointercancel",Pg={Jp:Ig,yp:Gg,zp:Hg,Cp:Og,Fp:Ng,Bp:Mg,Ip:Kg,Hp:"pointerover",Gp:"pointerout",Dp:"pointerenter",Ep:"pointerleave",Ap:Lg};function Qg(a){Xa.call(this);var b=za({},a);b.opacity=void 0!==a.opacity?a.opacity:1;b.visible=void 0!==a.visible?a.visible:!0;b.zIndex=void 0!==a.zIndex?a.zIndex:0;b.maxResolution=void 0!==a.maxResolution?a.maxResolution:Infinity;b.minResolution=void 0!==a.minResolution?a.minResolution:0;this.G(b)}w(Qg,Xa);
function Rg(a){var b=a.Tb(),c=a.hf(),d=a.Bb(),e=a.C(),f=a.Ub(),g=a.Rb(),h=a.Sb();return{layer:a,opacity:ma(b,0,1),O:c,visible:d,Oc:!0,extent:e,zIndex:f,maxResolution:g,minResolution:Math.max(h,0)}}k=Qg.prototype;k.C=function(){return this.get("extent")};k.Rb=function(){return this.get("maxResolution")};k.Sb=function(){return this.get("minResolution")};k.Tb=function(){return this.get("opacity")};k.Bb=function(){return this.get("visible")};k.Ub=function(){return this.get("zIndex")};
k.ic=function(a){this.set("extent",a)};k.oc=function(a){this.set("maxResolution",a)};k.pc=function(a){this.set("minResolution",a)};k.jc=function(a){this.set("opacity",a)};k.kc=function(a){this.set("visible",a)};k.lc=function(a){this.set("zIndex",a)};function Sg(a,b,c,d,e){Pa.call(this,a);this.vectorContext=b;this.frameState=c;this.context=d;this.glContext=e}w(Sg,Pa);function Tg(a){Xa.call(this);this.f=vc(a.projection);this.l=Ug(a.attributions);this.O=a.logo;this.Ha=void 0!==a.state?a.state:"ready";this.D=void 0!==a.wrapX?a.wrapX:!1}w(Tg,Xa);function Ug(a){if("string"===typeof a)return[new qe({html:a})];if(a instanceof qe)return[a];if(Array.isArray(a)){for(var b=a.length,c=Array(b),d=0;d<b;d++){var e=a[d];c[d]="string"===typeof e?new qe({html:e}):e}return c}return null}k=Tg.prototype;k.ta=ha;k.xa=function(){return this.l};k.wa=function(){return this.O};k.ya=function(){return this.f};
k.V=function(){return this.Ha};k.va=function(){this.u()};k.ra=function(a){this.l=Ug(a);this.u()};function Vg(a,b){a.Ha=b;a.u()};function Wg(a){var b=za({},a);delete b.source;Qg.call(this,b);this.v=this.o=this.j=null;a.map&&this.setMap(a.map);B(this,Za("source"),this.al,this);this.Dc(a.source?a.source:null)}w(Wg,Qg);function Xg(a,b){return a.visible&&b>=a.minResolution&&b<a.maxResolution}k=Wg.prototype;k.ff=function(a){a=a?a:[];a.push(Rg(this));return a};k.ga=function(){return this.get("source")||null};k.hf=function(){var a=this.ga();return a?a.V():"undefined"};k.Gm=function(){this.u()};
k.al=function(){this.v&&(Ea(this.v),this.v=null);var a=this.ga();a&&(this.v=B(a,"change",this.Gm,this));this.u()};k.setMap=function(a){this.j&&(Ea(this.j),this.j=null);a||this.u();this.o&&(Ea(this.o),this.o=null);a&&(this.j=B(a,"precompose",function(a){var c=Rg(this);c.Oc=!1;c.zIndex=Infinity;a.frameState.layerStatesArray.push(c);a.frameState.layerStates[x(this)]=c},this),this.o=B(this,"change",a.render,a),this.u())};k.Dc=function(a){this.set("source",a)};function Yg(){this.b={};this.a=0}Yg.prototype.clear=function(){this.b={};this.a=0};Yg.prototype.get=function(a,b,c){a=b+":"+a+":"+(c?Ce(c):"null");return a in this.b?this.b[a]:null};Yg.prototype.set=function(a,b,c,d){this.b[b+":"+a+":"+(c?Ce(c):"null")]=d;++this.a};var Zg=new Yg;var $g=Array(6);function ah(){return[1,0,0,1,0,0]}function bh(a){return ch(a,1,0,0,1,0,0)}function dh(a,b){var c=a[0],d=a[1],e=a[2],f=a[3],g=a[4],h=a[5],l=b[0],m=b[1],n=b[2],p=b[3],q=b[4],t=b[5];a[0]=c*l+e*m;a[1]=d*l+f*m;a[2]=c*n+e*p;a[3]=d*n+f*p;a[4]=c*q+e*t+g;a[5]=d*q+f*t+h;return a}function ch(a,b,c,d,e,f,g){a[0]=b;a[1]=c;a[2]=d;a[3]=e;a[4]=f;a[5]=g;return a}function eh(a,b){a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3];a[4]=b[4];a[5]=b[5];return a}
function fh(a,b){var c=b[0],d=b[1];b[0]=a[0]*c+a[2]*d+a[4];b[1]=a[1]*c+a[3]*d+a[5];return b}function gh(a,b){var c=Math.cos(b),d=Math.sin(b);dh(a,ch($g,c,d,-d,c,0,0))}function hh(a,b,c){return dh(a,ch($g,b,0,0,c,0,0))}function ih(a,b,c){dh(a,ch($g,1,0,0,1,b,c))}function jh(a,b,c,d,e,f,g,h){var l=Math.sin(f);f=Math.cos(f);a[0]=d*f;a[1]=e*l;a[2]=-d*l;a[3]=e*f;a[4]=g*d*f-h*d*l+b;a[5]=g*e*l+h*e*f+c;return a}
function kh(a){var b=a[0]*a[3]-a[1]*a[2];la(0!==b,32);var c=a[0],d=a[1],e=a[2],f=a[3],g=a[4],h=a[5];a[0]=f/b;a[1]=-d/b;a[2]=-e/b;a[3]=c/b;a[4]=(e*h-f*g)/b;a[5]=-(c*h-d*g)/b;return a};function lh(a,b){this.i=b;this.g={};this.s={}}w(lh,Na);function mh(a){var b=a.viewState,c=a.coordinateToPixelTransform,d=a.pixelToCoordinateTransform;jh(c,a.size[0]/2,a.size[1]/2,1/b.resolution,-1/b.resolution,-b.rotation,-b.center[0],-b.center[1]);kh(eh(d,c))}k=lh.prototype;k.ma=function(){for(var a in this.g)Oa(this.g[a])};function nh(){if(32<Zg.a){var a=0,b,c;for(b in Zg.b)c=Zg.b[b],0!==(a++&3)||Ta(c)||(delete Zg.b[b],--Zg.a)}}
k.ta=function(a,b,c,d,e,f){function g(a,e){var f=x(a).toString(),g=b.layerStates[x(e)].Oc;if(!(f in b.skippedFeatureUids)||g)return c.call(d,a,g?e:null)}var h,l=b.viewState,m=l.resolution,n=l.projection,l=a;if(n.a){var n=n.C(),p=ec(n),q=a[0];if(q<n[0]||q>n[2])l=[q+p*Math.ceil((n[0]-q)/p),a[1]]}n=b.layerStatesArray;for(p=n.length-1;0<=p;--p){var t=n[p],q=t.layer;if(Xg(t,m)&&e.call(f,q)&&(t=oh(this,q),q.ga()&&(h=t.ta(q.ga().D?l:a,b,g,d)),h))return h}};
k.oh=function(a,b,c,d,e,f){var g,h=b.viewState.resolution,l=b.layerStatesArray,m;for(m=l.length-1;0<=m;--m){g=l[m];var n=g.layer;if(Xg(g,h)&&e.call(f,n)&&(g=oh(this,n).Ac(a,b,c,d)))return g}};k.ph=function(a,b,c,d){return void 0!==this.ta(a,b,nc,this,c,d)};function oh(a,b){var c=x(b).toString();if(c in a.g)return a.g[c];var d=a.Ve(b);a.g[c]=d;a.s[c]=B(d,"change",a.Mk,a);return d}k.Mk=function(){this.i.render()};k.Be=ha;
k.Qo=function(a,b){for(var c in this.g)if(!(b&&c in b.layerStates)){var d=c,e=this.g[d];delete this.g[d];Ea(this.s[d]);delete this.s[d];Oa(e)}};function ph(a,b){for(var c in a.g)if(!(c in b.layerStates)){b.postRenderFunctions.push(a.Qo.bind(a));break}}function jb(a,b){return a.zIndex-b.zIndex};function qh(a,b){Sa.call(this);this.oa=a;this.state=b;this.a=null;this.key=""}w(qh,Sa);function rh(a){a.b("change")}qh.prototype.Ya=function(){return this.key+"/"+this.oa};qh.prototype.i=function(){return this.oa};qh.prototype.V=function(){return this.state};function sh(a,b){this.o=a;this.f=b;this.b=[];this.g=[];this.a={}}sh.prototype.clear=function(){this.b.length=0;this.g.length=0;Aa(this.a)};function th(a){var b=a.b,c=a.g,d=b[0];1==b.length?(b.length=0,c.length=0):(b[0]=b.pop(),c[0]=c.pop(),uh(a,0));b=a.f(d);delete a.a[b];return d}sh.prototype.c=function(a){la(!(this.f(a)in this.a),31);var b=this.o(a);return Infinity!=b?(this.b.push(a),this.g.push(b),this.a[this.f(a)]=!0,vh(this,0,this.b.length-1),!0):!1};
function uh(a,b){for(var c=a.b,d=a.g,e=c.length,f=c[b],g=d[b],h=b;b<e>>1;){var l=2*b+1,m=2*b+2,l=m<e&&d[m]<d[l]?m:l;c[b]=c[l];d[b]=d[l];b=l}c[b]=f;d[b]=g;vh(a,h,b)}function vh(a,b,c){var d=a.b;a=a.g;for(var e=d[c],f=a[c];c>b;){var g=c-1>>1;if(a[g]>f)d[c]=d[g],a[c]=a[g],c=g;else break}d[c]=e;a[c]=f}function wh(a){var b=a.o,c=a.b,d=a.g,e=0,f=c.length,g,h,l;for(h=0;h<f;++h)g=c[h],l=b(g),Infinity==l?delete a.a[a.f(g)]:(d[e]=l,c[e++]=g);c.length=e;d.length=e;for(b=(a.b.length>>1)-1;0<=b;b--)uh(a,b)};function xh(a,b){sh.call(this,function(b){return a.apply(null,b)},function(a){return a[0].Ya()});this.s=b;this.l=0;this.i={}}w(xh,sh);xh.prototype.c=function(a){var b=sh.prototype.c.call(this,a);b&&B(a[0],"change",this.j,this);return b};xh.prototype.j=function(a){a=a.target;var b=a.V();if(2===b||3===b||4===b||5===b)Ka(a,"change",this.j,this),a=a.Ya(),a in this.i&&(delete this.i[a],--this.l),this.s()};
function yh(a,b,c){for(var d=0,e,f;a.l<b&&d<c&&0<a.b.length;)e=th(a)[0],f=e.Ya(),0!==e.V()||f in a.i||(a.i[f]=!0,++a.l,++d,e.load())};function zh(a,b,c){this.f=a;this.g=b;this.i=c;this.b=[];this.a=this.c=0}function Ah(a,b){var c=a.f,d=a.a,e=a.g-d,f=Math.log(a.g/a.a)/a.f;return Sd({source:b,duration:f,easing:function(a){return d*(Math.exp(c*a*f)-1)/e}})};function Bh(a){Xa.call(this);this.v=null;this.i(!0);this.handleEvent=a.handleEvent}w(Bh,Xa);Bh.prototype.f=function(){return this.get("active")};Bh.prototype.l=function(){return this.v};Bh.prototype.i=function(a){this.set("active",a)};Bh.prototype.setMap=function(a){this.v=a};function Ch(a,b,c,d,e){if(void 0!==c){var f=b.Ma(),g=b.bb();void 0!==f&&g&&e&&0<e&&(a.$a(Td({rotation:f,duration:e,easing:Md})),d&&a.$a(Sd({source:g,duration:e,easing:Md})));b.rotate(c,d)}}
function Dh(a,b,c,d,e){var f=b.$();c=b.constrainResolution(f,c,0);Eh(a,b,c,d,e)}function Eh(a,b,c,d,e){if(c){var f=b.$(),g=b.bb();void 0!==f&&g&&c!==f&&e&&0<e&&(a.$a(Ud({resolution:f,duration:e,easing:Md})),d&&a.$a(Sd({source:g,duration:e,easing:Md})));if(d){var h;a=b.bb();e=b.$();void 0!==a&&void 0!==e&&(h=[d[0]-c*(d[0]-a[0])/e,d[1]-c*(d[1]-a[1])/e]);b.ob(h)}b.Zb(c)}};function Fh(a){a=a?a:{};this.a=a.delta?a.delta:1;Bh.call(this,{handleEvent:Gh});this.c=void 0!==a.duration?a.duration:250}w(Fh,Bh);function Gh(a){var b=!1,c=a.originalEvent;if(a.type==Hg){var b=a.map,d=a.coordinate,c=c.shiftKey?-this.a:this.a,e=b.aa();Dh(b,e,c,d,this.c);a.preventDefault();b=!0}return!b};function Hh(a){a=a.originalEvent;return a.altKey&&!(a.metaKey||a.ctrlKey)&&a.shiftKey}function Ih(a){a=a.originalEvent;return 0==a.button&&!(Qe&&Jf&&a.ctrlKey)}function Jh(a){return"pointermove"==a.type}function Kh(a){return a.type==Ig}function Lh(a){a=a.originalEvent;return!a.altKey&&!(a.metaKey||a.ctrlKey)&&!a.shiftKey}function Mh(a){a=a.originalEvent;return!a.altKey&&!(a.metaKey||a.ctrlKey)&&a.shiftKey}
function Nh(a){a=a.originalEvent.target.tagName;return"INPUT"!==a&&"SELECT"!==a&&"TEXTAREA"!==a}function Oh(a){la(a.b,56);return"mouse"==a.b.pointerType}function Ph(a){a=a.b;return a.isPrimary&&0===a.button};function Qh(a){a=a?a:{};Bh.call(this,{handleEvent:a.handleEvent?a.handleEvent:Rh});this.Ne=a.handleDownEvent?a.handleDownEvent:oc;this.Ke=a.handleDragEvent?a.handleDragEvent:ha;this.pj=a.handleMoveEvent?a.handleMoveEvent:ha;this.xj=a.handleUpEvent?a.handleUpEvent:oc;this.H=!1;this.ha={};this.j=[]}w(Qh,Bh);function Sh(a){for(var b=a.length,c=0,d=0,e=0;e<b;e++)c+=a[e].clientX,d+=a[e].clientY;return[c/b,d/b]}
function Rh(a){if(!(a instanceof Dg))return!0;var b=!1,c=a.type;if(c===Mg||c===Og||c===Kg)c=a.b,a.type==Kg?delete this.ha[c.pointerId]:a.type==Mg?this.ha[c.pointerId]=c:c.pointerId in this.ha&&(this.ha[c.pointerId]=c),this.j=Ba(this.ha);this.H&&(a.type==Og?this.Ke(a):a.type==Kg&&(this.H=this.xj(a)));a.type==Mg?(this.H=a=this.Ne(a),b=this.Ec(a)):a.type==Ng&&this.pj(a);return!b}Qh.prototype.Ec=function(a){return a};function Th(a){Qh.call(this,{handleDownEvent:Uh,handleDragEvent:Vh,handleUpEvent:Wh});a=a?a:{};this.a=a.kinetic;this.c=this.o=null;this.A=a.condition?a.condition:Lh;this.s=!1}w(Th,Qh);function Vh(a){var b=Sh(this.j);this.a&&this.a.b.push(b[0],b[1],Date.now());if(this.c){var c=this.c[0]-b[0],d=b[1]-this.c[1];a=a.map.aa();var e=a.V(),d=c=[c,d],f=e.resolution;d[0]*=f;d[1]*=f;zb(c,e.rotation);ub(c,e.center);c=a.Od(c);a.ob(c)}this.c=b}
function Wh(a){var b=a.map;a=b.aa();if(0===this.j.length){var c;if(c=!this.s&&this.a)if(c=this.a,6>c.b.length)c=!1;else{var d=Date.now()-c.i,e=c.b.length-3;if(c.b[e+2]<d)c=!1;else{for(var f=e-3;0<f&&c.b[f+2]>d;)f-=3;var d=c.b[e+2]-c.b[f+2],g=c.b[e]-c.b[f],e=c.b[e+1]-c.b[f+1];c.c=Math.atan2(e,g);c.a=Math.sqrt(g*g+e*e)/d;c=c.a>c.g}}c?(c=this.a,c=(c.g-c.a)/c.f,e=this.a.c,f=a.bb(),this.o=Ah(this.a,f),b.$a(this.o),f=b.Ga(f),b=b.Na([f[0]-c*Math.cos(e),f[1]-c*Math.sin(e)]),b=a.Od(b),a.ob(b)):b.render();
Kd(a,-1);return!1}this.c=null;return!0}function Uh(a){if(0<this.j.length&&this.A(a)){var b=a.map,c=b.aa();this.c=null;this.H||Kd(c,1);this.o&&fb(b.O,this.o)&&(c.ob(a.frameState.viewState.center),this.o=null);this.a&&(a=this.a,a.b.length=0,a.c=0,a.a=0);this.s=1<this.j.length;return!0}return!1}Th.prototype.Ec=oc;function Xh(a){a=a?a:{};Qh.call(this,{handleDownEvent:Yh,handleDragEvent:Zh,handleUpEvent:$h});this.c=a.condition?a.condition:Hh;this.a=void 0;this.o=void 0!==a.duration?a.duration:250}w(Xh,Qh);function Zh(a){if(Oh(a)){var b=a.map,c=b.kb();a=a.pixel;c=Math.atan2(c[1]/2-a[1],a[0]-c[0]/2);if(void 0!==this.a){a=c-this.a;var d=b.aa(),e=d.Ma();Ch(b,d,e-a)}this.a=c}}
function $h(a){if(!Oh(a))return!0;a=a.map;var b=a.aa();Kd(b,-1);var c=b.Ma(),d=this.o,c=b.constrainRotation(c,0);Ch(a,b,c,void 0,d);return!1}function Yh(a){return Oh(a)&&Ih(a)&&this.c(a)?(Kd(a.map.aa(),1),this.a=void 0,!0):!1}Xh.prototype.Ec=oc;function ai(a){this.f=null;this.a=document.createElement("div");this.a.style.position="absolute";this.a.className="ol-box "+a;this.g=this.c=this.b=null}w(ai,Na);ai.prototype.ma=function(){this.setMap(null)};function bi(a){var b=a.c,c=a.g;a=a.a.style;a.left=Math.min(b[0],c[0])+"px";a.top=Math.min(b[1],c[1])+"px";a.width=Math.abs(c[0]-b[0])+"px";a.height=Math.abs(c[1]-b[1])+"px"}
ai.prototype.setMap=function(a){if(this.b){this.b.A.removeChild(this.a);var b=this.a.style;b.left=b.top=b.width=b.height="inherit"}(this.b=a)&&this.b.A.appendChild(this.a)};function ci(a){var b=a.c,c=a.g,b=[b,[b[0],c[1]],c,[c[0],b[1]]].map(a.b.Na,a.b);b[4]=b[0].slice();a.f?a.f.sa([b]):a.f=new D([b])}ai.prototype.Y=function(){return this.f};function di(a,b,c){Pa.call(this,a);this.coordinate=b;this.mapBrowserEvent=c}w(di,Pa);function ei(a){Qh.call(this,{handleDownEvent:fi,handleDragEvent:gi,handleUpEvent:hi});a=a?a:{};this.a=new ai(a.className||"ol-dragbox");this.c=null;this.D=a.condition?a.condition:nc;this.A=a.boxEndCondition?a.boxEndCondition:ii}w(ei,Qh);function ii(a,b,c){a=c[0]-b[0];b=c[1]-b[1];return 64<=a*a+b*b}
function gi(a){if(Oh(a)){var b=this.a,c=a.pixel;b.c=this.c;b.g=c;ci(b);bi(b);this.b(new di("boxdrag",a.coordinate,a))}}ei.prototype.Y=function(){return this.a.Y()};ei.prototype.s=ha;function hi(a){if(!Oh(a))return!0;this.a.setMap(null);this.A(a,this.c,a.pixel)&&(this.s(a),this.b(new di("boxend",a.coordinate,a)));return!1}
function fi(a){if(Oh(a)&&Ih(a)&&this.D(a)){this.c=a.pixel;this.a.setMap(a.map);var b=this.a,c=this.c;b.c=this.c;b.g=c;ci(b);bi(b);this.b(new di("boxstart",a.coordinate,a));return!0}return!1};function ji(a){a=a?a:{};var b=a.condition?a.condition:Mh;this.o=void 0!==a.duration?a.duration:200;this.O=void 0!==a.out?a.out:!1;ei.call(this,{condition:b,className:a.className||"ol-dragzoom"})}w(ji,ei);
ji.prototype.s=function(){var a=this.v,b=a.aa(),c=a.kb(),d=this.Y().C();if(this.O){var e=b.Ic(c),d=[a.Ga(Zb(d)),a.Ga(ac(d))],f=Qb(Infinity,Infinity,-Infinity,-Infinity,void 0),g,h;g=0;for(h=d.length;g<h;++g)Fb(f,d[g]);lc(e,1/Gd(f,c));d=e}c=b.constrainResolution(Gd(d,c));e=b.$();f=b.bb();a.$a(Ud({resolution:e,duration:this.o,easing:Md}));a.$a(Sd({source:f,duration:this.o,easing:Md}));b.ob(gc(d));b.Zb(c)};function ki(a){Bh.call(this,{handleEvent:li});a=a||{};this.a=function(a){return Lh(a)&&Nh(a)};this.c=void 0!==a.condition?a.condition:this.a;this.j=void 0!==a.duration?a.duration:100;this.o=void 0!==a.pixelDelta?a.pixelDelta:128}w(ki,Bh);
function li(a){var b=!1;if("keydown"==a.type){var c=a.originalEvent.keyCode;if(this.c(a)&&(40==c||37==c||39==c||38==c)){var d=a.map,b=d.aa(),e=b.$()*this.o,f=0,g=0;40==c?g=-e:37==c?f=-e:39==c?f=e:g=e;c=[f,g];zb(c,b.Ma());e=this.j;if(f=b.bb())e&&0<e&&d.$a(Sd({source:f,duration:e,easing:Qd})),d=b.Od([f[0]+c[0],f[1]+c[1]]),b.ob(d);a.preventDefault();b=!0}}return!b};function mi(a){Bh.call(this,{handleEvent:ni});a=a?a:{};this.c=a.condition?a.condition:Nh;this.a=a.delta?a.delta:1;this.j=void 0!==a.duration?a.duration:100}w(mi,Bh);function ni(a){var b=!1;if("keydown"==a.type||"keypress"==a.type){var c=a.originalEvent.charCode;if(this.c(a)&&(43==c||45==c)){var b=a.map,c=43==c?this.a:-this.a,d=b.aa();Dh(b,d,c,void 0,this.j);a.preventDefault();b=!0}}return!b};function oi(a){Bh.call(this,{handleEvent:pi});a=a||{};this.c=0;this.H=void 0!==a.duration?a.duration:250;this.s=void 0!==a.useAnchor?a.useAnchor:!0;this.a=null;this.o=this.j=void 0}w(oi,Bh);
function pi(a){var b=!1;if("wheel"==a.type||"mousewheel"==a.type){var b=a.map,c=a.originalEvent;this.s&&(this.a=a.coordinate);var d;"wheel"==a.type?(d=c.deltaY,Hf&&c.deltaMode===ja.WheelEvent.DOM_DELTA_PIXEL&&(d/=Kf),c.deltaMode===ja.WheelEvent.DOM_DELTA_LINE&&(d*=40)):"mousewheel"==a.type&&(d=-c.wheelDeltaY,If&&(d/=3));this.c+=d;void 0===this.j&&(this.j=Date.now());d=Math.max(80-(Date.now()-this.j),0);ja.clearTimeout(this.o);this.o=ja.setTimeout(this.A.bind(this,b),d);a.preventDefault();b=!0}return!b}
oi.prototype.A=function(a){var b=ma(this.c,-1,1),c=a.aa();Dh(a,c,-b,this.a,this.H);this.c=0;this.a=null;this.o=this.j=void 0};oi.prototype.D=function(a){this.s=a;a||(this.a=null)};function qi(a){Qh.call(this,{handleDownEvent:ri,handleDragEvent:si,handleUpEvent:ti});a=a||{};this.c=null;this.o=void 0;this.a=!1;this.s=0;this.D=void 0!==a.threshold?a.threshold:.3;this.A=void 0!==a.duration?a.duration:250}w(qi,Qh);
function si(a){var b=0,c=this.j[0],d=this.j[1],c=Math.atan2(d.clientY-c.clientY,d.clientX-c.clientX);void 0!==this.o&&(b=c-this.o,this.s+=b,!this.a&&Math.abs(this.s)>this.D&&(this.a=!0));this.o=c;a=a.map;c=a.a.getBoundingClientRect();d=Sh(this.j);d[0]-=c.left;d[1]-=c.top;this.c=a.Na(d);this.a&&(c=a.aa(),d=c.Ma(),a.render(),Ch(a,c,d+b,this.c))}
function ti(a){if(2>this.j.length){a=a.map;var b=a.aa();Kd(b,-1);if(this.a){var c=b.Ma(),d=this.c,e=this.A,c=b.constrainRotation(c,0);Ch(a,b,c,d,e)}return!1}return!0}function ri(a){return 2<=this.j.length?(a=a.map,this.c=null,this.o=void 0,this.a=!1,this.s=0,this.H||Kd(a.aa(),1),a.render(),!0):!1}qi.prototype.Ec=oc;function ui(a){Qh.call(this,{handleDownEvent:vi,handleDragEvent:wi,handleUpEvent:xi});a=a?a:{};this.c=null;this.s=void 0!==a.duration?a.duration:400;this.a=void 0;this.o=1}w(ui,Qh);function wi(a){var b=1,c=this.j[0],d=this.j[1],e=c.clientX-d.clientX,c=c.clientY-d.clientY,e=Math.sqrt(e*e+c*c);void 0!==this.a&&(b=this.a/e);this.a=e;1!=b&&(this.o=b);a=a.map;var e=a.aa(),c=e.$(),d=a.a.getBoundingClientRect(),f=Sh(this.j);f[0]-=d.left;f[1]-=d.top;this.c=a.Na(f);a.render();Eh(a,e,c*b,this.c)}
function xi(a){if(2>this.j.length){a=a.map;var b=a.aa();Kd(b,-1);var c=b.$(),d=this.c,e=this.s,c=b.constrainResolution(c,0,this.o-1);Eh(a,b,c,d,e);return!1}return!0}function vi(a){return 2<=this.j.length?(a=a.map,this.c=null,this.a=void 0,this.o=1,this.H||Kd(a.aa(),1),a.render(),!0):!1}ui.prototype.Ec=oc;function yi(a){a=a?a:{};var b=new re,c=new zh(-.005,.05,100);(void 0!==a.altShiftDragRotate?a.altShiftDragRotate:1)&&b.push(new Xh);(void 0!==a.doubleClickZoom?a.doubleClickZoom:1)&&b.push(new Fh({delta:a.zoomDelta,duration:a.zoomDuration}));(void 0!==a.dragPan?a.dragPan:1)&&b.push(new Th({kinetic:c}));(void 0!==a.pinchRotate?a.pinchRotate:1)&&b.push(new qi);(void 0!==a.pinchZoom?a.pinchZoom:1)&&b.push(new ui({duration:a.zoomDuration}));if(void 0!==a.keyboard?a.keyboard:1)b.push(new ki),b.push(new mi({delta:a.zoomDelta,
duration:a.zoomDuration}));(void 0!==a.mouseWheelZoom?a.mouseWheelZoom:1)&&b.push(new oi({duration:a.zoomDuration}));(void 0!==a.shiftDragZoom?a.shiftDragZoom:1)&&b.push(new ji({duration:a.zoomDuration}));return b};function zi(a){var b=a||{};a=za({},b);delete a.layers;b=b.layers;Qg.call(this,a);this.f=[];this.a={};B(this,Za("layers"),this.Ok,this);b?Array.isArray(b)?b=new re(b.slice()):la(b instanceof re,43):b=new re;this.lh(b)}w(zi,Qg);k=zi.prototype;k.ae=function(){this.Bb()&&this.u()};
k.Ok=function(){this.f.forEach(Ea);this.f.length=0;var a=this.Rc();this.f.push(B(a,ue,this.Nk,this),B(a,ve,this.Pk,this));for(var b in this.a)this.a[b].forEach(Ea);Aa(this.a);var a=a.a,c,d;b=0;for(c=a.length;b<c;b++)d=a[b],this.a[x(d).toString()]=[B(d,"propertychange",this.ae,this),B(d,"change",this.ae,this)];this.u()};k.Nk=function(a){a=a.element;var b=x(a).toString();this.a[b]=[B(a,"propertychange",this.ae,this),B(a,"change",this.ae,this)];this.u()};
k.Pk=function(a){a=x(a.element).toString();this.a[a].forEach(Ea);delete this.a[a];this.u()};k.Rc=function(){return this.get("layers")};k.lh=function(a){this.set("layers",a)};
k.ff=function(a){var b=void 0!==a?a:[],c=b.length;this.Rc().forEach(function(a){a.ff(b)});a=Rg(this);var d,e;for(d=b.length;c<d;c++)e=b[c],e.opacity*=a.opacity,e.visible=e.visible&&a.visible,e.maxResolution=Math.min(e.maxResolution,a.maxResolution),e.minResolution=Math.max(e.minResolution,a.minResolution),void 0!==a.extent&&(e.extent=void 0!==e.extent?jc(e.extent,a.extent):a.extent);return b};k.hf=function(){return"ready"};function Ai(a){sc.call(this,{code:a,units:"m",extent:Bi,global:!0,worldExtent:Ci})}w(Ai,sc);Ai.prototype.getPointResolution=function(a,b){return a/na(b[1]/6378137)};var Di=6378137*Math.PI,Bi=[-Di,-Di,Di,Di],Ci=[-180,-85,180,85],Ec="EPSG:3857 EPSG:102100 EPSG:102113 EPSG:900913 urn:ogc:def:crs:EPSG:6.18:3:3857 urn:ogc:def:crs:EPSG::3857 http://www.opengis.net/gml/srs/epsg.xml#3857".split(" ").map(function(a){return new Ai(a)});
function Fc(a,b,c){var d=a.length;c=1<c?c:2;void 0===b&&(2<c?b=a.slice():b=Array(d));for(var e=0;e<d;e+=c)b[e]=6378137*Math.PI*a[e]/180,b[e+1]=6378137*Math.log(Math.tan(Math.PI*(a[e+1]+90)/360));return b}function Gc(a,b,c){var d=a.length;c=1<c?c:2;void 0===b&&(2<c?b=a.slice():b=Array(d));for(var e=0;e<d;e+=c)b[e]=180*a[e]/(6378137*Math.PI),b[e+1]=360*Math.atan(Math.exp(a[e+1]/6378137))/Math.PI-90;return b};var Ei=new pc(6378137);function Fi(a,b){sc.call(this,{code:a,units:"degrees",extent:Gi,axisOrientation:b,global:!0,metersPerUnit:Hi,worldExtent:Gi})}w(Fi,sc);Fi.prototype.getPointResolution=function(a){return a};
var Gi=[-180,-90,180,90],Hi=Math.PI*Ei.radius/180,Hc=[new Fi("CRS:84"),new Fi("EPSG:4326","neu"),new Fi("urn:ogc:def:crs:EPSG::4326","neu"),new Fi("urn:ogc:def:crs:EPSG:6.6:4326","neu"),new Fi("urn:ogc:def:crs:OGC:1.3:CRS84"),new Fi("urn:ogc:def:crs:OGC:2:84"),new Fi("http://www.opengis.net/gml/srs/epsg.xml#4326","neu"),new Fi("urn:x-ogc:def:crs:EPSG:4326","neu")];function Ii(){wc(Ec);wc(Hc);Dc()};function Ji(a){Wg.call(this,a?a:{})}w(Ji,Wg);function Ki(a){a=a?a:{};var b=za({},a);delete b.preload;delete b.useInterimTilesOnError;Wg.call(this,b);this.l(void 0!==a.preload?a.preload:0);this.A(void 0!==a.useInterimTilesOnError?a.useInterimTilesOnError:!0)}w(Ki,Wg);Ki.prototype.f=function(){return this.get("preload")};Ki.prototype.l=function(a){this.set("preload",a)};Ki.prototype.c=function(){return this.get("useInterimTilesOnError")};Ki.prototype.A=function(a){this.set("useInterimTilesOnError",a)};var Li=[0,0,0,1],Mi=[],Ni=[0,0,0,1];function Oi(a,b,c,d){0!==b&&(a.translate(c,d),a.rotate(b),a.translate(-c,-d))};function Pi(a){this.v=a.opacity;this.U=a.rotateWithView;this.o=a.rotation;this.i=a.scale;this.H=a.snapToPixel}k=Pi.prototype;k.oe=function(){return this.v};k.pe=function(){return this.U};k.qe=function(){return this.o};k.re=function(){return this.i};k.Xd=function(){return this.H};k.se=function(a){this.v=a};k.te=function(a){this.o=a};k.ue=function(a){this.i=a};function Qi(a){a=a||{};this.l=this.f=this.c=null;this.g=void 0!==a.fill?a.fill:null;this.b=void 0!==a.stroke?a.stroke:null;this.a=a.radius;this.A=[0,0];this.s=this.D=this.j=null;var b=a.atlasManager,c,d=null,e,f=0;this.b&&(e=Ce(this.b.b),f=this.b.a,void 0===f&&(f=1),d=this.b.g,Lf||(d=null));var g=2*(this.a+f)+1;e={strokeStyle:e,Ad:f,size:g,lineDash:d};if(void 0===b)b=$e(g,g),this.f=b.canvas,c=g=this.f.width,this.Dh(e,b,0,0),this.g?this.l=this.f:(b=$e(e.size,e.size),this.l=b.canvas,this.Ch(e,b,0,0));
else{g=Math.round(g);(d=!this.g)&&(c=this.Ch.bind(this,e));var f=this.b?Ri(this.b):"-",h=this.g?Si(this.g):"-";this.c&&f==this.c[1]&&h==this.c[2]&&this.a==this.c[3]||(this.c=["c"+f+h+(void 0!==this.a?this.a.toString():"-"),f,h,this.a]);b=b.add(this.c[0],g,g,this.Dh.bind(this,e),c);this.f=b.image;this.A=[b.offsetX,b.offsetY];c=b.image.width;this.l=d?b.Qg:this.f}this.j=[g/2,g/2];this.D=[g,g];this.s=[c,c];Pi.call(this,{opacity:1,rotateWithView:!1,rotation:0,scale:1,snapToPixel:void 0!==a.snapToPixel?
a.snapToPixel:!0})}w(Qi,Pi);k=Qi.prototype;k.bc=function(){return this.j};k.wn=function(){return this.g};k.ne=function(){return this.l};k.mc=function(){return this.f};k.sd=function(){return 2};k.kd=function(){return this.s};k.Ka=function(){return this.A};k.xn=function(){return this.a};k.Jb=function(){return this.D};k.yn=function(){return this.b};k.nf=ha;k.load=ha;k.Wf=ha;
k.Dh=function(a,b,c,d){b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();b.arc(a.size/2,a.size/2,this.a,0,2*Math.PI,!0);this.g&&(b.fillStyle=Ee(this.g.b),b.fill());this.b&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Ad,a.lineDash&&b.setLineDash(a.lineDash),b.stroke());b.closePath()};
k.Ch=function(a,b,c,d){b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();b.arc(a.size/2,a.size/2,this.a,0,2*Math.PI,!0);b.fillStyle=Ce(Li);b.fill();this.b&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Ad,a.lineDash&&b.setLineDash(a.lineDash),b.stroke());b.closePath()};function Ti(a){a=a||{};this.b=void 0!==a.color?a.color:null;this.a=void 0}Ti.prototype.g=function(){return this.b};Ti.prototype.f=function(a){this.b=a;this.a=void 0};function Si(a){void 0===a.a&&(a.a=a.b instanceof CanvasPattern||a.b instanceof CanvasGradient?x(a.b).toString():"f"+(a.b?Ce(a.b):"-"));return a.a};function Ui(){this.a=-1};function Vi(){this.a=64;this.b=Array(4);this.c=Array(this.a);this.b[0]=1732584193;this.b[1]=4023233417;this.b[2]=2562383102;this.b[3]=271733878;this.f=this.g=0}(function(){function a(){}a.prototype=Ui.prototype;Vi.a=Ui.prototype;Vi.prototype=new a;Vi.prototype.constructor=Vi;Vi.b=function(a,c,d){for(var e=Array(arguments.length-2),f=2;f<arguments.length;f++)e[f-2]=arguments[f];return Ui.prototype[c].apply(a,e)}})();
function Wi(a,b,c){c||(c=0);var d=Array(16);if("string"==typeof b)for(var e=0;16>e;++e)d[e]=b.charCodeAt(c++)|b.charCodeAt(c++)<<8|b.charCodeAt(c++)<<16|b.charCodeAt(c++)<<24;else for(e=0;16>e;++e)d[e]=b[c++]|b[c++]<<8|b[c++]<<16|b[c++]<<24;b=a.b[0];c=a.b[1];var e=a.b[2],f=a.b[3],g;g=b+(f^c&(e^f))+d[0]+3614090360&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[1]+3905402710&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&(b^c))+d[2]+606105819&4294967295;e=f+(g<<17&4294967295|g>>>15);g=
c+(b^e&(f^b))+d[3]+3250441966&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(f^c&(e^f))+d[4]+4118548399&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[5]+1200080426&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&(b^c))+d[6]+2821735955&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+d[7]+4249261313&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(f^c&(e^f))+d[8]+1770035416&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[9]+2336552879&4294967295;f=b+(g<<12&4294967295|g>>>
20);g=e+(c^f&(b^c))+d[10]+4294925233&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+d[11]+2304563134&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(f^c&(e^f))+d[12]+1804603682&4294967295;b=c+(g<<7&4294967295|g>>>25);g=f+(e^b&(c^e))+d[13]+4254626195&4294967295;f=b+(g<<12&4294967295|g>>>20);g=e+(c^f&(b^c))+d[14]+2792965006&4294967295;e=f+(g<<17&4294967295|g>>>15);g=c+(b^e&(f^b))+d[15]+1236535329&4294967295;c=e+(g<<22&4294967295|g>>>10);g=b+(e^f&(c^e))+d[1]+4129170786&4294967295;b=c+(g<<5&4294967295|
g>>>27);g=f+(c^e&(b^c))+d[6]+3225465664&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[11]+643717713&4294967295;e=f+(g<<14&4294967295|g>>>18);g=c+(f^b&(e^f))+d[0]+3921069994&4294967295;c=e+(g<<20&4294967295|g>>>12);g=b+(e^f&(c^e))+d[5]+3593408605&4294967295;b=c+(g<<5&4294967295|g>>>27);g=f+(c^e&(b^c))+d[10]+38016083&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[15]+3634488961&4294967295;e=f+(g<<14&4294967295|g>>>18);g=c+(f^b&(e^f))+d[4]+3889429448&4294967295;c=e+(g<<20&4294967295|
g>>>12);g=b+(e^f&(c^e))+d[9]+568446438&4294967295;b=c+(g<<5&4294967295|g>>>27);g=f+(c^e&(b^c))+d[14]+3275163606&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[3]+4107603335&4294967295;e=f+(g<<14&4294967295|g>>>18);g=c+(f^b&(e^f))+d[8]+1163531501&4294967295;c=e+(g<<20&4294967295|g>>>12);g=b+(e^f&(c^e))+d[13]+2850285829&4294967295;b=c+(g<<5&4294967295|g>>>27);g=f+(c^e&(b^c))+d[2]+4243563512&4294967295;f=b+(g<<9&4294967295|g>>>23);g=e+(b^c&(f^b))+d[7]+1735328473&4294967295;e=f+(g<<14&4294967295|
g>>>18);g=c+(f^b&(e^f))+d[12]+2368359562&4294967295;c=e+(g<<20&4294967295|g>>>12);g=b+(c^e^f)+d[5]+4294588738&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[8]+2272392833&4294967295;f=b+(g<<11&4294967295|g>>>21);g=e+(f^b^c)+d[11]+1839030562&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[14]+4259657740&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(c^e^f)+d[1]+2763975236&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[4]+1272893353&4294967295;f=b+(g<<11&4294967295|g>>>21);g=e+(f^
b^c)+d[7]+4139469664&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[10]+3200236656&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(c^e^f)+d[13]+681279174&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[0]+3936430074&4294967295;f=b+(g<<11&4294967295|g>>>21);g=e+(f^b^c)+d[3]+3572445317&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[6]+76029189&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(c^e^f)+d[9]+3654602809&4294967295;b=c+(g<<4&4294967295|g>>>28);g=f+(b^c^e)+d[12]+3873151461&4294967295;
f=b+(g<<11&4294967295|g>>>21);g=e+(f^b^c)+d[15]+530742520&4294967295;e=f+(g<<16&4294967295|g>>>16);g=c+(e^f^b)+d[2]+3299628645&4294967295;c=e+(g<<23&4294967295|g>>>9);g=b+(e^(c|~f))+d[0]+4096336452&4294967295;b=c+(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[7]+1126891415&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[14]+2878612391&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[5]+4237533241&4294967295;c=e+(g<<21&4294967295|g>>>11);g=b+(e^(c|~f))+d[12]+1700485571&4294967295;b=c+
(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[3]+2399980690&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[10]+4293915773&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[1]+2240044497&4294967295;c=e+(g<<21&4294967295|g>>>11);g=b+(e^(c|~f))+d[8]+1873313359&4294967295;b=c+(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[15]+4264355552&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[6]+2734768916&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[13]+1309151649&4294967295;
c=e+(g<<21&4294967295|g>>>11);g=b+(e^(c|~f))+d[4]+4149444226&4294967295;b=c+(g<<6&4294967295|g>>>26);g=f+(c^(b|~e))+d[11]+3174756917&4294967295;f=b+(g<<10&4294967295|g>>>22);g=e+(b^(f|~c))+d[2]+718787259&4294967295;e=f+(g<<15&4294967295|g>>>17);g=c+(f^(e|~b))+d[9]+3951481745&4294967295;a.b[0]=a.b[0]+b&4294967295;a.b[1]=a.b[1]+(e+(g<<21&4294967295|g>>>11))&4294967295;a.b[2]=a.b[2]+e&4294967295;a.b[3]=a.b[3]+f&4294967295}
function Xi(a,b){var c;void 0===c&&(c=b.length);for(var d=c-a.a,e=a.c,f=a.g,g=0;g<c;){if(0==f)for(;g<=d;)Wi(a,b,g),g+=a.a;if("string"==typeof b)for(;g<c;){if(e[f++]=b.charCodeAt(g++),f==a.a){Wi(a,e);f=0;break}}else for(;g<c;)if(e[f++]=b[g++],f==a.a){Wi(a,e);f=0;break}}a.g=f;a.f+=c};function Yi(a){a=a||{};this.b=void 0!==a.color?a.color:null;this.f=a.lineCap;this.g=void 0!==a.lineDash?a.lineDash:null;this.c=a.lineJoin;this.i=a.miterLimit;this.a=a.width;this.l=void 0}k=Yi.prototype;k.Fn=function(){return this.b};k.ak=function(){return this.f};k.Gn=function(){return this.g};k.bk=function(){return this.c};k.gk=function(){return this.i};k.Hn=function(){return this.a};k.In=function(a){this.b=a;this.l=void 0};k.bp=function(a){this.f=a;this.l=void 0};
k.Jn=function(a){this.g=a;this.l=void 0};k.cp=function(a){this.c=a;this.l=void 0};k.ep=function(a){this.i=a;this.l=void 0};k.ip=function(a){this.a=a;this.l=void 0};
function Ri(a){if(void 0===a.l){var b="s"+(a.b?Ce(a.b):"-")+","+(void 0!==a.f?a.f.toString():"-")+","+(a.g?a.g.toString():"-")+","+(void 0!==a.c?a.c:"-")+","+(void 0!==a.i?a.i.toString():"-")+","+(void 0!==a.a?a.a.toString():"-"),c=new Vi;Xi(c,b);b=Array((56>c.g?c.a:2*c.a)-c.g);b[0]=128;for(var d=1;d<b.length-8;++d)b[d]=0;for(var e=8*c.f,d=b.length-8;d<b.length;++d)b[d]=e&255,e/=256;Xi(c,b);b=Array(16);for(d=e=0;4>d;++d)for(var f=0;32>f;f+=8)b[e++]=c.b[d]>>>f&255;if(8192>=b.length)c=String.fromCharCode.apply(null,
b);else for(c="",d=0;d<b.length;d+=8192)e=He(b,d,d+8192),c+=String.fromCharCode.apply(null,e);a.l=c}return a.l};function Zi(a){a=a||{};this.i=null;this.g=$i;void 0!==a.geometry&&this.Gh(a.geometry);this.c=void 0!==a.fill?a.fill:null;this.a=void 0!==a.image?a.image:null;this.f=void 0!==a.stroke?a.stroke:null;this.l=void 0!==a.text?a.text:null;this.b=a.zIndex}k=Zi.prototype;k.Y=function(){return this.i};k.Wj=function(){return this.g};k.Kn=function(){return this.c};k.Ln=function(){return this.a};k.Mn=function(){return this.f};k.Ja=function(){return this.l};k.Nn=function(){return this.b};
k.Gh=function(a){"function"===typeof a?this.g=a:"string"===typeof a?this.g=function(b){return b.get(a)}:a?a&&(this.g=function(){return a}):this.g=$i;this.i=a};k.On=function(a){this.b=a};function aj(a){if("function"!==typeof a){var b;Array.isArray(a)?b=a:(la(a instanceof Zi,41),b=[a]);a=function(){return b}}return a}var bj=null;
function cj(){if(!bj){var a=new Ti({color:"rgba(255,255,255,0.4)"}),b=new Yi({color:"#3399CC",width:1.25});bj=[new Zi({image:new Qi({fill:a,stroke:b,radius:5}),fill:a,stroke:b})]}return bj}
function dj(){var a={},b=[255,255,255,1],c=[0,153,255,1];a.Polygon=[new Zi({fill:new Ti({color:[255,255,255,.5]})})];a.MultiPolygon=a.Polygon;a.LineString=[new Zi({stroke:new Yi({color:b,width:5})}),new Zi({stroke:new Yi({color:c,width:3})})];a.MultiLineString=a.LineString;a.Circle=a.Polygon.concat(a.LineString);a.Point=[new Zi({image:new Qi({radius:6,fill:new Ti({color:c}),stroke:new Yi({color:b,width:1.5})}),zIndex:Infinity})];a.MultiPoint=a.Point;a.GeometryCollection=a.Polygon.concat(a.LineString,
a.Point);return a}function $i(a){return a.Y()};function F(a){a=a?a:{};var b=za({},a);delete b.style;delete b.renderBuffer;delete b.updateWhileAnimating;delete b.updateWhileInteracting;Wg.call(this,b);this.a=void 0!==a.renderBuffer?a.renderBuffer:100;this.A=null;this.i=void 0;this.l(a.style);this.R=void 0!==a.updateWhileAnimating?a.updateWhileAnimating:!1;this.T=void 0!==a.updateWhileInteracting?a.updateWhileInteracting:!1}w(F,Wg);function ej(a){return a.get("renderOrder")}F.prototype.H=function(){return this.A};F.prototype.D=function(){return this.i};
F.prototype.l=function(a){this.A=void 0!==a?a:cj;this.i=null===a?void 0:aj(this.A);this.u()};function H(a){a=a?a:{};var b=za({},a);delete b.preload;delete b.useInterimTilesOnError;F.call(this,b);this.W(a.preload?a.preload:0);this.ha(a.useInterimTilesOnError?a.useInterimTilesOnError:!0);la(void 0==a.renderMode||"image"==a.renderMode||"hybrid"==a.renderMode||"vector"==a.renderMode,28);this.s=a.renderMode||"hybrid"}w(H,F);H.prototype.f=function(){return this.get("preload")};H.prototype.c=function(){return this.get("useInterimTilesOnError")};H.prototype.W=function(a){this.set("preload",a)};
H.prototype.ha=function(a){this.set("useInterimTilesOnError",a)};function fj(){};function gj(a,b,c,d,e){this.f=a;this.A=b;this.c=c;this.H=d;this.Mb=e;this.i=this.b=this.a=this.Va=this.W=this.T=null;this.cb=this.ha=this.v=this.Aa=this.O=this.D=0;this.pa=!1;this.l=this.na=0;this.Lb=!1;this.Ba=0;this.g="";this.Ha=this.za=0;this.Ia=!1;this.o=this.sb=0;this.R=this.s=this.j=null;this.U=[];this.tb=ah()}w(gj,fj);
function hj(a,b,c){if(a.i){b=Rc(b,0,c,2,a.H,a.U);c=a.f;var d=a.tb,e=c.globalAlpha;1!=a.v&&(c.globalAlpha=e*a.v);var f=a.na;a.pa&&(f+=a.Mb);var g,h;g=0;for(h=b.length;g<h;g+=2){var l=b[g]-a.D,m=b[g+1]-a.O;a.Lb&&(l=Math.round(l),m=Math.round(m));if(0!==f||1!=a.l){var n=l+a.D,p=m+a.O;jh(d,n,p,a.l,a.l,f,-n,-p);c.setTransform.apply(c,d)}c.drawImage(a.i,a.ha,a.cb,a.Ba,a.Aa,l,m,a.Ba,a.Aa)}0===f&&1==a.l||c.setTransform(1,0,0,1,0,0);1!=a.v&&(c.globalAlpha=e)}}
function ij(a,b,c,d){var e=0;if(a.R&&""!==a.g){a.j&&jj(a,a.j);a.s&&kj(a,a.s);var f=a.R,g=a.f,h=a.Va;h?(h.font!=f.font&&(h.font=g.font=f.font),h.textAlign!=f.textAlign&&(h.textAlign=g.textAlign=f.textAlign),h.textBaseline!=f.textBaseline&&(h.textBaseline=g.textBaseline=f.textBaseline)):(g.font=f.font,g.textAlign=f.textAlign,g.textBaseline=f.textBaseline,a.Va={font:f.font,textAlign:f.textAlign,textBaseline:f.textBaseline});b=Rc(b,e,c,d,a.H,a.U);f=a.f;g=a.sb;for(a.Ia&&(g+=a.Mb);e<c;e+=d){var h=b[e]+
a.za,l=b[e+1]+a.Ha;if(0!==g||1!=a.o){var m=jh(a.tb,h,l,a.o,a.o,g,-h,-l);f.setTransform.apply(f,m)}a.s&&f.strokeText(a.g,h,l);a.j&&f.fillText(a.g,h,l)}0===g&&1==a.o||f.setTransform(1,0,0,1,0,0)}}function lj(a,b,c,d,e,f){var g=a.f;a=Rc(b,c,d,e,a.H,a.U);g.moveTo(a[0],a[1]);b=a.length;f&&(b-=2);for(c=2;c<b;c+=2)g.lineTo(a[c],a[c+1]);f&&g.closePath();return d}function mj(a,b,c,d,e){var f,g;f=0;for(g=d.length;f<g;++f)c=lj(a,b,c,d[f],e,!0);return c}k=gj.prototype;
k.Qd=function(a){if(kc(this.c,a.C())){if(this.a||this.b){this.a&&jj(this,this.a);this.b&&kj(this,this.b);var b;b=this.H;var c=this.U,d=a.la();b=d?Rc(d,0,d.length,a.ua(),b,c):null;c=b[2]-b[0];d=b[3]-b[1];c=Math.sqrt(c*c+d*d);d=this.f;d.beginPath();d.arc(b[0],b[1],c,0,2*Math.PI);this.a&&d.fill();this.b&&d.stroke()}""!==this.g&&ij(this,a.qd(),2,2)}};k.rd=function(a){this.Wb(a.c,a.f);this.Yb(a.a);this.$b(a.Ja())};
k.sc=function(a){switch(a.X()){case "Point":this.uc(a);break;case "LineString":this.hd(a);break;case "Polygon":this.$e(a);break;case "MultiPoint":this.tc(a);break;case "MultiLineString":this.Ye(a);break;case "MultiPolygon":this.Ze(a);break;case "GeometryCollection":this.Xe(a);break;case "Circle":this.Qd(a)}};k.We=function(a,b){var c=(0,b.g)(a);c&&kc(this.c,c.C())&&(this.rd(b),this.sc(c))};k.Xe=function(a){a=a.f;var b,c;b=0;for(c=a.length;b<c;++b)this.sc(a[b])};
k.uc=function(a){var b=a.la();a=a.ua();this.i&&hj(this,b,b.length);""!==this.g&&ij(this,b,b.length,a)};k.tc=function(a){var b=a.la();a=a.ua();this.i&&hj(this,b,b.length);""!==this.g&&ij(this,b,b.length,a)};k.hd=function(a){if(kc(this.c,a.C())){if(this.b){kj(this,this.b);var b=this.f,c=a.la();b.beginPath();lj(this,c,0,c.length,a.ua(),!1);b.stroke()}""!==this.g&&(a=nj(a),ij(this,a,2,2))}};
k.Ye=function(a){var b=a.C();if(kc(this.c,b)){if(this.b){kj(this,this.b);var b=this.f,c=a.la(),d=0,e=a.Hb(),f=a.ua();b.beginPath();var g,h;g=0;for(h=e.length;g<h;++g)d=lj(this,c,d,e[g],f,!1);b.stroke()}""!==this.g&&(a=oj(a),ij(this,a,a.length,2))}};k.$e=function(a){if(kc(this.c,a.C())){if(this.b||this.a){this.a&&jj(this,this.a);this.b&&kj(this,this.b);var b=this.f;b.beginPath();mj(this,a.Qb(),0,a.Hb(),a.ua());this.a&&b.fill();this.b&&b.stroke()}""!==this.g&&(a=wd(a),ij(this,a,2,2))}};
k.Ze=function(a){if(kc(this.c,a.C())){if(this.b||this.a){this.a&&jj(this,this.a);this.b&&kj(this,this.b);var b=this.f,c=pj(a),d=0,e=a.c,f=a.ua(),g,h;g=0;for(h=e.length;g<h;++g){var l=e[g];b.beginPath();d=mj(this,c,d,l,f);this.a&&b.fill();this.b&&b.stroke()}}""!==this.g&&(a=qj(a),ij(this,a,a.length,2))}};function jj(a,b){var c=a.f,d=a.T;d?d.fillStyle!=b.fillStyle&&(d.fillStyle=c.fillStyle=b.fillStyle):(c.fillStyle=b.fillStyle,a.T={fillStyle:b.fillStyle})}
function kj(a,b){var c=a.f,d=a.W;d?(d.lineCap!=b.lineCap&&(d.lineCap=c.lineCap=b.lineCap),Lf&&!hb(d.lineDash,b.lineDash)&&c.setLineDash(d.lineDash=b.lineDash),d.lineJoin!=b.lineJoin&&(d.lineJoin=c.lineJoin=b.lineJoin),d.lineWidth!=b.lineWidth&&(d.lineWidth=c.lineWidth=b.lineWidth),d.miterLimit!=b.miterLimit&&(d.miterLimit=c.miterLimit=b.miterLimit),d.strokeStyle!=b.strokeStyle&&(d.strokeStyle=c.strokeStyle=b.strokeStyle)):(c.lineCap=b.lineCap,Lf&&c.setLineDash(b.lineDash),c.lineJoin=b.lineJoin,c.lineWidth=
b.lineWidth,c.miterLimit=b.miterLimit,c.strokeStyle=b.strokeStyle,a.W={lineCap:b.lineCap,lineDash:b.lineDash,lineJoin:b.lineJoin,lineWidth:b.lineWidth,miterLimit:b.miterLimit,strokeStyle:b.strokeStyle})}
k.Wb=function(a,b){if(a){var c=a.b;this.a={fillStyle:Ee(c?c:Li)}}else this.a=null;if(b){var c=b.b,d=b.f,e=b.g,f=b.c,g=b.a,h=b.i;this.b={lineCap:void 0!==d?d:"round",lineDash:e?e:Mi,lineJoin:void 0!==f?f:"round",lineWidth:this.A*(void 0!==g?g:1),miterLimit:void 0!==h?h:10,strokeStyle:Ce(c?c:Ni)}}else this.b=null};
k.Yb=function(a){if(a){var b=a.bc(),c=a.mc(1),d=a.Ka(),e=a.Jb();this.D=b[0];this.O=b[1];this.Aa=e[1];this.i=c;this.v=a.v;this.ha=d[0];this.cb=d[1];this.pa=a.U;this.na=a.o;this.l=a.i;this.Lb=a.H;this.Ba=e[0]}else this.i=null};
k.$b=function(a){if(a){var b=a.b;b?(b=b.b,this.j={fillStyle:Ee(b?b:Li)}):this.j=null;var c=a.l;if(c){var b=c.b,d=c.f,e=c.g,f=c.c,g=c.a,c=c.i;this.s={lineCap:void 0!==d?d:"round",lineDash:e?e:Mi,lineJoin:void 0!==f?f:"round",lineWidth:void 0!==g?g:1,miterLimit:void 0!==c?c:10,strokeStyle:Ce(b?b:Ni)}}else this.s=null;var b=a.g,d=a.f,e=a.c,f=a.s,g=a.i,c=a.a,h=a.Ja(),l=a.j;a=a.o;this.R={font:void 0!==b?b:"10px sans-serif",textAlign:void 0!==l?l:"center",textBaseline:void 0!==a?a:"middle"};this.g=void 0!==
h?h:"";this.za=void 0!==d?this.A*d:0;this.Ha=void 0!==e?this.A*e:0;this.Ia=void 0!==f?f:!1;this.sb=void 0!==g?g:0;this.o=this.A*(void 0!==c?c:1)}else this.g=""};function rj(a,b,c,d,e){Sa.call(this);this.l=e;this.extent=a;this.f=c;this.resolution=b;this.state=d}w(rj,Sa);function sj(a){a.b("change")}rj.prototype.C=function(){return this.extent};rj.prototype.$=function(){return this.resolution};rj.prototype.V=function(){return this.state};function tj(a){Ua.call(this);this.a=a}w(tj,Ua);k=tj.prototype;k.ta=ha;k.Ac=function(a,b,c,d){a=fh(b.pixelToCoordinateTransform,a.slice());if(this.ta(a,b,nc,this))return c.call(d,this.a,null)};k.je=oc;k.Pd=function(a,b,c){return function(d,e){return uj(a,b,d,e,function(a){c[d]||(c[d]={});c[d][a.oa.toString()]=a})}};k.Jm=function(a){2===a.target.V()&&vj(this)};function wj(a,b){var c=b.V();2!=c&&3!=c&&B(b,"change",a.Jm,a);0==c&&(b.load(),c=b.V());return 2==c}
function vj(a){var b=a.a;b.Bb()&&"ready"==b.hf()&&a.u()}function xj(a,b){b.xh()&&a.postRenderFunctions.push(function(a,b,e){b=x(a).toString();a.Jc(e.viewState.projection,e.usedTiles[b])}.bind(null,b))}function yj(a,b){if(b){var c,d,e;d=0;for(e=b.length;d<e;++d)c=b[d],a[x(c).toString()]=c}}function zj(a,b){var c=b.O;void 0!==c&&("string"===typeof c?a.logos[c]="":c&&(la("string"==typeof c.href,44),la("string"==typeof c.src,45),a.logos[c.src]=c.href))}
function Aj(a,b,c,d){b=x(b).toString();c=c.toString();b in a?c in a[b]?(a=a[b][c],d.ca<a.ca&&(a.ca=d.ca),d.ea>a.ea&&(a.ea=d.ea),d.fa<a.fa&&(a.fa=d.fa),d.ia>a.ia&&(a.ia=d.ia)):a[b][c]=d:(a[b]={},a[b][c]=d)}function Bj(a,b,c){return[b*(Math.round(a[0]/b)+c[0]%2/2),b*(Math.round(a[1]/b)+c[1]%2/2)]}
function Cj(a,b,c,d,e,f,g,h,l,m){var n=x(b).toString();n in a.wantedTiles||(a.wantedTiles[n]={});var p=a.wantedTiles[n];a=a.tileQueue;var q=c.minZoom,t,v,u,y,E,z;for(z=g;z>=q;--z)for(v=ge(c,f,z,v),u=c.$(z),y=v.ca;y<=v.ea;++y)for(E=v.fa;E<=v.ia;++E)g-z<=h?(t=b.dc(z,y,E,d,e),0==t.V()&&(p[t.Ya()]=!0,t.Ya()in a.a||a.c([t,n,le(c,t.oa),u])),void 0!==l&&l.call(m,t)):b.Xf(z,y,E,e)};function Dj(a){tj.call(this,a);this.O=ah()}w(Dj,tj);function Ej(a,b,c){var d=b.pixelRatio,e=b.size[0]*d,f=b.size[1]*d,g=b.viewState.rotation,h=bc(c),l=ac(c),m=$b(c);c=Zb(c);fh(b.coordinateToPixelTransform,h);fh(b.coordinateToPixelTransform,l);fh(b.coordinateToPixelTransform,m);fh(b.coordinateToPixelTransform,c);a.save();Oi(a,-g,e/2,f/2);a.beginPath();a.moveTo(h[0]*d,h[1]*d);a.lineTo(l[0]*d,l[1]*d);a.lineTo(m[0]*d,m[1]*d);a.lineTo(c[0]*d,c[1]*d);a.clip();Oi(a,g,e/2,f/2)}
Dj.prototype.i=function(a,b,c){Fj(this,"precompose",c,a,void 0);var d=this.f?this.f.a():null;if(d){var e=b.extent,f=void 0!==e;f&&Ej(c,a,e);var e=this.s,g=c.globalAlpha;c.globalAlpha=b.opacity;c.drawImage(d,0,0,+d.width,+d.height,Math.round(e[4]),Math.round(e[5]),Math.round(d.width*e[0]),Math.round(d.height*e[3]));c.globalAlpha=g;f&&c.restore()}Gj(this,c,a)};
function Fj(a,b,c,d,e){var f=a.a;if(Ta(f,b)){var g=d.size[0]*d.pixelRatio,h=d.size[1]*d.pixelRatio,l=d.viewState.rotation;Oi(c,-l,g/2,h/2);a=void 0!==e?e:Hj(a,d,0);f.b(new Sg(b,new gj(c,d.pixelRatio,d.extent,a,d.viewState.rotation),d,c,null));Oi(c,l,g/2,h/2)}}function Gj(a,b,c,d){Fj(a,"postcompose",b,c,d)}function Hj(a,b,c){var d=b.viewState,e=b.pixelRatio,f=e/d.resolution;return jh(a.O,e*b.size[0]/2,e*b.size[1]/2,f,-f,-d.rotation,-d.center[0]+c,-d.center[1])};function Ij(){};var Jj=["Polygon","LineString","Image","Text"];function Kj(a,b,c,d){this.pa=a;this.T=b;this.overlaps=d;this.f=null;this.c=0;this.resolution=c;this.Ba=this.Aa=null;this.a=[];this.coordinates=[];this.Va=ah();this.b=[];this.W=[];this.ha=ah();this.cb=ah()}w(Kj,fj);
function Lj(a,b,c,d,e,f){var g=a.coordinates.length,h=a.bf(),l=[b[c],b[c+1]],m=[NaN,NaN],n=!0,p,q,t;for(p=c+e;p<d;p+=e)m[0]=b[p],m[1]=b[p+1],t=Ob(h,m),t!==q?(n&&(a.coordinates[g++]=l[0],a.coordinates[g++]=l[1]),a.coordinates[g++]=m[0],a.coordinates[g++]=m[1],n=!1):1===t?(a.coordinates[g++]=m[0],a.coordinates[g++]=m[1],n=!1):n=!0,l[0]=m[0],l[1]=m[1],q=t;p===c+e&&(a.coordinates[g++]=l[0],a.coordinates[g++]=l[1]);f&&(a.coordinates[g++]=b[c],a.coordinates[g++]=b[c+1]);return g}
function Mj(a,b){a.Aa=[0,b,0];a.a.push(a.Aa);a.Ba=[0,b,0];a.b.push(a.Ba)}
function Nj(a,b,c,d,e,f,g,h,l){var m;hb(d,a.Va)?m=a.W:(m=Rc(a.coordinates,0,a.coordinates.length,2,d,a.W),eh(a.Va,d));d=!Ca(f);var n=0,p=g.length,q,t,v=a.ha,u=a.cb,y,E,z,G,J=0,X=0;for(a=a.a!=g||a.overlaps?0:200;n<p;){var A=g[n],Ma,ua,M,oa;switch(A[0]){case 0:q=A[1];d&&f[x(q).toString()]||!q.Y()?n=A[2]:void 0===l||kc(l,q.Y().C())?++n:n=A[2]+1;break;case 1:J>a&&(b.fill(),J=0);X>a&&(b.stroke(),X=0);J||X||b.beginPath();++n;break;case 2:q=A[1];t=m[q];A=m[q+1];z=m[q+2]-t;q=m[q+3]-A;q=Math.sqrt(z*z+q*q);
b.moveTo(t+q,A);b.arc(t,A,q,0,2*Math.PI,!0);++n;break;case 3:b.closePath();++n;break;case 4:q=A[1];t=A[2];Ma=A[3];ua=A[4]*c;M=A[5]*c;var Wb=A[6],Ib=A[7],Jb=A[8],Yb=A[9];oa=A[10];z=A[11];G=A[12];var hc=A[13],Pb=A[14];for(oa&&(z+=e);q<t;q+=2){A=m[q]-ua;oa=m[q+1]-M;hc&&(A=Math.round(A),oa=Math.round(oa));if(1!=G||0!==z){var Od=A+ua,tf=oa+M;jh(v,Od,tf,G,G,z,-Od,-tf);b.transform.apply(b,v)}Od=b.globalAlpha;1!=Ib&&(b.globalAlpha=Od*Ib);var tf=Pb+Jb>Ma.width?Ma.width-Jb:Pb,Pd=Wb+Yb>Ma.height?Ma.height-Yb:
Wb;b.drawImage(Ma,Jb,Yb,tf,Pd,A,oa,tf*c,Pd*c);1!=Ib&&(b.globalAlpha=Od);if(1!=G||0!==z)kh(eh(u,v)),b.transform.apply(b,u)}++n;break;case 5:q=A[1];t=A[2];M=A[3];Wb=A[4]*c;Ib=A[5]*c;z=A[6];G=A[7]*c;Ma=A[8];ua=A[9];for((oa=A[10])&&(z+=e);q<t;q+=2){A=m[q]+Wb;oa=m[q+1]+Ib;if(1!=G||0!==z)jh(v,A,oa,G,G,z,-A,-oa),b.transform.apply(b,v);Jb=M.split("\n");Yb=Jb.length;1<Yb?(hc=Math.round(1.5*b.measureText("M").width),oa-=(Yb-1)/2*hc):hc=0;for(Pb=0;Pb<Yb;Pb++)Od=Jb[Pb],ua&&b.strokeText(Od,A,oa),Ma&&b.fillText(Od,
A,oa),oa+=hc;if(1!=G||0!==z)kh(eh(u,v)),b.transform.apply(b,u)}++n;break;case 6:if(void 0!==h&&(q=A[1],q=h(q)))return q;++n;break;case 7:a?J++:b.fill();++n;break;case 8:q=A[1];t=A[2];A=m[q];oa=m[q+1];z=A+.5|0;G=oa+.5|0;if(z!==y||G!==E)b.moveTo(A,oa),y=z,E=G;for(q+=2;q<t;q+=2)if(A=m[q],oa=m[q+1],z=A+.5|0,G=oa+.5|0,q==t-2||z!==y||G!==E)b.lineTo(A,oa),y=z,E=G;++n;break;case 9:J&&(b.fill(),J=0);b.fillStyle=A[1];++n;break;case 10:y=void 0!==A[7]?A[7]:!0;E=A[2];X&&(b.stroke(),X=0);b.strokeStyle=A[1];b.lineWidth=
y?E*c:E;b.lineCap=A[3];b.lineJoin=A[4];b.miterLimit=A[5];Lf&&b.setLineDash(A[6]);E=y=NaN;++n;break;case 11:b.font=A[1];b.textAlign=A[2];b.textBaseline=A[3];++n;break;case 12:a?X++:b.stroke();++n;break;default:++n}}J&&b.fill();X&&b.stroke()}Kj.prototype.Sa=function(a,b,c,d,e){Nj(this,a,b,c,d,e,this.a,void 0,void 0)};
function Oj(a){var b=a.b;b.reverse();var c,d=b.length,e,f,g=-1;for(c=0;c<d;++c)if(e=b[c],f=e[0],6==f)g=c;else if(0==f){e[2]=c;e=a.b;for(f=c;g<f;){var h=e[g];e[g]=e[f];e[f]=h;++g;--f}g=-1}}function Pj(a,b){a.Aa[2]=a.a.length;a.Aa=null;a.Ba[2]=a.b.length;a.Ba=null;var c=[6,b];a.a.push(c);a.b.push(c)}Kj.prototype.ie=ha;Kj.prototype.bf=function(){return this.T};
function Qj(a,b,c,d){Kj.call(this,a,b,c,d);this.j=this.R=null;this.O=this.D=this.H=this.A=this.U=this.v=this.s=this.o=this.l=this.i=this.g=void 0}w(Qj,Kj);Qj.prototype.uc=function(a,b){if(this.j){Mj(this,b);var c=a.la(),d=this.coordinates.length,c=Lj(this,c,0,c.length,a.ua(),!1);this.a.push([4,d,c,this.j,this.g,this.i,this.l,this.o,this.s,this.v,this.U,this.A,this.H,this.D,this.O]);this.b.push([4,d,c,this.R,this.g,this.i,this.l,this.o,this.s,this.v,this.U,this.A,this.H,this.D,this.O]);Pj(this,b)}};
Qj.prototype.tc=function(a,b){if(this.j){Mj(this,b);var c=a.la(),d=this.coordinates.length,c=Lj(this,c,0,c.length,a.ua(),!1);this.a.push([4,d,c,this.j,this.g,this.i,this.l,this.o,this.s,this.v,this.U,this.A,this.H,this.D,this.O]);this.b.push([4,d,c,this.R,this.g,this.i,this.l,this.o,this.s,this.v,this.U,this.A,this.H,this.D,this.O]);Pj(this,b)}};Qj.prototype.ie=function(){Oj(this);this.i=this.g=void 0;this.j=this.R=null;this.O=this.D=this.A=this.U=this.v=this.s=this.o=this.H=this.l=void 0};
Qj.prototype.Yb=function(a){var b=a.bc(),c=a.Jb(),d=a.ne(1),e=a.mc(1),f=a.Ka();this.g=b[0];this.i=b[1];this.R=d;this.j=e;this.l=c[1];this.o=a.v;this.s=f[0];this.v=f[1];this.U=a.U;this.A=a.o;this.H=a.i;this.D=a.H;this.O=c[0]};function Rj(a,b,c,d){Kj.call(this,a,b,c,d);this.g={fd:void 0,ad:void 0,bd:null,cd:void 0,dd:void 0,ed:void 0,mf:0,strokeStyle:void 0,lineCap:void 0,lineDash:null,lineJoin:void 0,lineWidth:void 0,miterLimit:void 0}}w(Rj,Kj);
function Sj(a,b,c,d,e){var f=a.coordinates.length;b=Lj(a,b,c,d,e,!1);f=[8,f,b];a.a.push(f);a.b.push(f);return d}k=Rj.prototype;k.bf=function(){this.f||(this.f=Hb(this.T),0<this.c&&Gb(this.f,this.resolution*(this.c+1)/2,this.f));return this.f};
function Tj(a){var b=a.g,c=b.strokeStyle,d=b.lineCap,e=b.lineDash,f=b.lineJoin,g=b.lineWidth,h=b.miterLimit;b.fd==c&&b.ad==d&&hb(b.bd,e)&&b.cd==f&&b.dd==g&&b.ed==h||(b.mf!=a.coordinates.length&&(a.a.push([12]),b.mf=a.coordinates.length),a.a.push([10,c,g,d,f,h,e],[1]),b.fd=c,b.ad=d,b.bd=e,b.cd=f,b.dd=g,b.ed=h)}
k.hd=function(a,b){var c=this.g,d=c.lineWidth;void 0!==c.strokeStyle&&void 0!==d&&(Tj(this),Mj(this,b),this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash],[1]),c=a.la(),Sj(this,c,0,c.length,a.ua()),this.b.push([12]),Pj(this,b))};
k.Ye=function(a,b){var c=this.g,d=c.lineWidth;if(void 0!==c.strokeStyle&&void 0!==d){Tj(this);Mj(this,b);this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash],[1]);var c=a.Hb(),d=a.la(),e=a.ua(),f=0,g,h;g=0;for(h=c.length;g<h;++g)f=Sj(this,d,f,c[g],e);this.b.push([12]);Pj(this,b)}};k.ie=function(){this.g.mf!=this.coordinates.length&&this.a.push([12]);Oj(this);this.g=null};
k.Wb=function(a,b){var c=b.b;this.g.strokeStyle=Ce(c?c:Ni);c=b.f;this.g.lineCap=void 0!==c?c:"round";c=b.g;this.g.lineDash=c?c:Mi;c=b.c;this.g.lineJoin=void 0!==c?c:"round";c=b.a;this.g.lineWidth=void 0!==c?c:1;c=b.i;this.g.miterLimit=void 0!==c?c:10;this.g.lineWidth>this.c&&(this.c=this.g.lineWidth,this.f=null)};
function Uj(a,b,c,d){Kj.call(this,a,b,c,d);this.g={sg:void 0,fd:void 0,ad:void 0,bd:null,cd:void 0,dd:void 0,ed:void 0,fillStyle:void 0,strokeStyle:void 0,lineCap:void 0,lineDash:null,lineJoin:void 0,lineWidth:void 0,miterLimit:void 0}}w(Uj,Kj);
function Vj(a,b,c,d,e){var f=a.g,g=void 0!==f.fillStyle,f=void 0!=f.strokeStyle,h=d.length;if(!g&&!f)return d[h-1];var l=[1];a.a.push(l);a.b.push(l);for(l=0;l<h;++l){var m=d[l],n=a.coordinates.length;c=Lj(a,b,c,m,e,!0);c=[8,n,c];a.a.push(c);a.b.push(c);f&&(c=[3],a.a.push(c),a.b.push(c));c=m}b=[7];a.b.push(b);g&&a.a.push(b);f&&(g=[12],a.a.push(g),a.b.push(g));return c}k=Uj.prototype;
k.Qd=function(a,b){var c=this.g,d=c.strokeStyle;if(void 0!==c.fillStyle||void 0!==d){Wj(this);Mj(this,b);this.b.push([9,Ce(Li)]);void 0!==c.strokeStyle&&this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash]);var e=a.la(),d=this.coordinates.length;Lj(this,e,0,e.length,a.ua(),!1);e=[1];d=[2,d];this.a.push(e,d);this.b.push(e,d);d=[7];this.b.push(d);void 0!==c.fillStyle&&this.a.push(d);void 0!==c.strokeStyle&&(c=[12],this.a.push(c),this.b.push(c));Pj(this,b)}};
k.$e=function(a,b){var c=this.g,d=c.strokeStyle;if(void 0!==c.fillStyle||void 0!==d)Wj(this),Mj(this,b),this.b.push([9,Ce(Li)]),void 0!==c.strokeStyle&&this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash]),c=a.Hb(),d=a.Qb(),Vj(this,d,0,c,a.ua()),Pj(this,b)};
k.Ze=function(a,b){var c=this.g,d=c.strokeStyle;if(void 0!==c.fillStyle||void 0!==d){Wj(this);Mj(this,b);this.b.push([9,Ce(Li)]);void 0!==c.strokeStyle&&this.b.push([10,c.strokeStyle,c.lineWidth,c.lineCap,c.lineJoin,c.miterLimit,c.lineDash]);var c=a.c,d=pj(a),e=a.ua(),f=0,g,h;g=0;for(h=c.length;g<h;++g)f=Vj(this,d,f,c[g],e);Pj(this,b)}};k.ie=function(){Oj(this);this.g=null;var a=this.pa;if(0!==a){var b=this.coordinates,c,d;c=0;for(d=b.length;c<d;++c)b[c]=a*Math.round(b[c]/a)}};
k.bf=function(){this.f||(this.f=Hb(this.T),0<this.c&&Gb(this.f,this.resolution*(this.c+1)/2,this.f));return this.f};
k.Wb=function(a,b){var c=this.g;if(a){var d=a.b;c.fillStyle=Ee(d?d:Li)}else c.fillStyle=void 0;b?(d=b.b,c.strokeStyle=Ce(d?d:Ni),d=b.f,c.lineCap=void 0!==d?d:"round",d=b.g,c.lineDash=d?d.slice():Mi,d=b.c,c.lineJoin=void 0!==d?d:"round",d=b.a,c.lineWidth=void 0!==d?d:1,d=b.i,c.miterLimit=void 0!==d?d:10,c.lineWidth>this.c&&(this.c=c.lineWidth,this.f=null)):(c.strokeStyle=void 0,c.lineCap=void 0,c.lineDash=null,c.lineJoin=void 0,c.lineWidth=void 0,c.miterLimit=void 0)};
function Wj(a){var b=a.g,c=b.fillStyle,d=b.strokeStyle,e=b.lineCap,f=b.lineDash,g=b.lineJoin,h=b.lineWidth,l=b.miterLimit;void 0!==c&&b.sg!=c&&(a.a.push([9,c]),b.sg=b.fillStyle);void 0===d||b.fd==d&&b.ad==e&&b.bd==f&&b.cd==g&&b.dd==h&&b.ed==l||(a.a.push([10,d,h,e,g,l,f]),b.fd=d,b.ad=e,b.bd=f,b.cd=g,b.dd=h,b.ed=l)}function Xj(a,b,c,d){Kj.call(this,a,b,c,d);this.O=this.D=this.H=null;this.j="";this.s=this.o=0;this.v=void 0;this.A=this.U=0;this.l=this.i=this.g=null}w(Xj,Kj);
function Yj(a,b,c,d,e){if(""!==a.j&&a.l&&(a.g||a.i)){if(a.g){var f=a.g,g=a.H;if(!g||g.fillStyle!=f.fillStyle){var h=[9,f.fillStyle];a.a.push(h);a.b.push(h);g?g.fillStyle=f.fillStyle:a.H={fillStyle:f.fillStyle}}}a.i&&(f=a.i,g=a.D,g&&g.lineCap==f.lineCap&&g.lineDash==f.lineDash&&g.lineJoin==f.lineJoin&&g.lineWidth==f.lineWidth&&g.miterLimit==f.miterLimit&&g.strokeStyle==f.strokeStyle||(h=[10,f.strokeStyle,f.lineWidth,f.lineCap,f.lineJoin,f.miterLimit,f.lineDash,!1],a.a.push(h),a.b.push(h),g?(g.lineCap=
f.lineCap,g.lineDash=f.lineDash,g.lineJoin=f.lineJoin,g.lineWidth=f.lineWidth,g.miterLimit=f.miterLimit,g.strokeStyle=f.strokeStyle):a.D={lineCap:f.lineCap,lineDash:f.lineDash,lineJoin:f.lineJoin,lineWidth:f.lineWidth,miterLimit:f.miterLimit,strokeStyle:f.strokeStyle}));f=a.l;g=a.O;g&&g.font==f.font&&g.textAlign==f.textAlign&&g.textBaseline==f.textBaseline||(h=[11,f.font,f.textAlign,f.textBaseline],a.a.push(h),a.b.push(h),g?(g.font=f.font,g.textAlign=f.textAlign,g.textBaseline=f.textBaseline):a.O=
{font:f.font,textAlign:f.textAlign,textBaseline:f.textBaseline});Mj(a,e);f=a.coordinates.length;b=Lj(a,b,0,c,d,!1);b=[5,f,b,a.j,a.o,a.s,a.U,a.A,!!a.g,!!a.i,a.v];a.a.push(b);a.b.push(b);Pj(a,e)}}
Xj.prototype.$b=function(a){if(a){var b=a.b;b?(b=b.b,b=Ee(b?b:Li),this.g?this.g.fillStyle=b:this.g={fillStyle:b}):this.g=null;var c=a.l;if(c){var b=c.b,d=c.f,e=c.g,f=c.c,g=c.a,c=c.i,d=void 0!==d?d:"round",e=e?e.slice():Mi,f=void 0!==f?f:"round",g=void 0!==g?g:1,c=void 0!==c?c:10,b=Ce(b?b:Ni);if(this.i){var h=this.i;h.lineCap=d;h.lineDash=e;h.lineJoin=f;h.lineWidth=g;h.miterLimit=c;h.strokeStyle=b}else this.i={lineCap:d,lineDash:e,lineJoin:f,lineWidth:g,miterLimit:c,strokeStyle:b}}else this.i=null;
var l=a.g,b=a.f,d=a.c,e=a.s,g=a.i,c=a.a,f=a.Ja(),h=a.j,m=a.o;a=void 0!==l?l:"10px sans-serif";h=void 0!==h?h:"center";m=void 0!==m?m:"middle";this.l?(l=this.l,l.font=a,l.textAlign=h,l.textBaseline=m):this.l={font:a,textAlign:h,textBaseline:m};this.j=void 0!==f?f:"";this.o=void 0!==b?b:0;this.s=void 0!==d?d:0;this.v=void 0!==e?e:!1;this.U=void 0!==g?g:0;this.A=void 0!==c?c:1}else this.j=""};function Zj(a,b,c,d,e){this.s=a;this.f=b;this.j=d;this.o=c;this.c=e;this.a={};this.i=$e(1,1);this.l=ah()}
w(Zj,Ij);function ak(a){for(var b in a.a){var c=a.a[b],d;for(d in c)c[d].ie()}}Zj.prototype.ta=function(a,b,c,d,e){var f=jh(this.l,.5,.5,1/b,-1/b,-c,-a[0],-a[1]),g=this.i;g.clearRect(0,0,1,1);var h;void 0!==this.c&&(h=Eb(),Fb(h,a),Gb(h,b*this.c,h));return bk(this,g,f,c,d,function(a){if(0<g.getImageData(0,0,1,1).data[3]){if(a=e(a))return a;g.clearRect(0,0,1,1)}},h)};
Zj.prototype.b=function(a,b){var c=void 0!==a?a.toString():"0",d=this.a[c];void 0===d&&(d={},this.a[c]=d);c=d[b];void 0===c&&(c=new ck[b](this.s,this.f,this.o,this.j),d[b]=c);return c};Zj.prototype.g=function(){return Ca(this.a)};
Zj.prototype.Sa=function(a,b,c,d,e,f){var g=Object.keys(this.a).map(Number);g.sort(ab);var h=this.f,l=h[0],m=h[1],n=h[2],h=h[3],l=[l,m,l,h,n,h,n,m];Rc(l,0,8,2,c,l);a.save();a.beginPath();a.moveTo(l[0],l[1]);a.lineTo(l[2],l[3]);a.lineTo(l[4],l[5]);a.lineTo(l[6],l[7]);a.clip();f=f?f:Jj;for(var p,q,l=0,m=g.length;l<m;++l)for(p=this.a[g[l].toString()],n=0,h=f.length;n<h;++n)q=p[f[n]],void 0!==q&&q.Sa(a,b,c,d,e);a.restore()};
function bk(a,b,c,d,e,f,g){var h=Object.keys(a.a).map(Number);h.sort(function(a,b){return b-a});var l,m,n,p,q;l=0;for(m=h.length;l<m;++l)for(p=a.a[h[l].toString()],n=Jj.length-1;0<=n;--n)if(q=p[Jj[n]],void 0!==q&&(q=Nj(q,b,1,c,d,e,q.b,f,g)))return q}var ck={Image:Qj,LineString:Rj,Polygon:Uj,Text:Xj};function dk(a,b){return x(a)-x(b)}function ek(a,b){var c=.5*a/b;return c*c}function fk(a,b,c,d,e,f){var g=!1,h,l;if(h=c.a)l=h.sd(),2==l||3==l?h.Wf(e,f):(0==l&&h.load(),h.nf(e,f),g=!0);if(e=(0,c.g)(b))d=e.md(d),(0,gk[d.X()])(a,d,c,b);return g}
var gk={Point:function(a,b,c,d){var e=c.a;if(e){if(2!=e.sd())return;var f=a.b(c.b,"Image");f.Yb(e);f.uc(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),Yj(a,b.la(),2,2,d)},LineString:function(a,b,c,d){var e=c.f;if(e){var f=a.b(c.b,"LineString");f.Wb(null,e);f.hd(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),Yj(a,nj(b),2,2,d)},Polygon:function(a,b,c,d){var e=c.c,f=c.f;if(e||f){var g=a.b(c.b,"Polygon");g.Wb(e,f);g.$e(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),Yj(a,wd(b),2,2,d)},MultiPoint:function(a,b,c,d){var e=
c.a;if(e){if(2!=e.sd())return;var f=a.b(c.b,"Image");f.Yb(e);f.tc(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),c=b.la(),Yj(a,c,c.length,b.ua(),d)},MultiLineString:function(a,b,c,d){var e=c.f;if(e){var f=a.b(c.b,"LineString");f.Wb(null,e);f.Ye(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),b=oj(b),Yj(a,b,b.length,2,d)},MultiPolygon:function(a,b,c,d){var e=c.c,f=c.f;if(f||e){var g=a.b(c.b,"Polygon");g.Wb(e,f);g.Ze(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),b=qj(b),Yj(a,b,b.length,2,d)},GeometryCollection:function(a,
b,c,d){b=b.f;var e,f;e=0;for(f=b.length;e<f;++e)(0,gk[b[e].X()])(a,b[e],c,d)},Circle:function(a,b,c,d){var e=c.c,f=c.f;if(e||f){var g=a.b(c.b,"Polygon");g.Wb(e,f);g.Qd(b,d)}if(e=c.Ja())a=a.b(c.b,"Text"),a.$b(e),Yj(a,b.qd(),2,2,d)}};function hk(a,b,c,d,e,f){this.c=void 0!==f?f:null;rj.call(this,a,b,c,void 0!==f?0:2,d);this.g=e}w(hk,rj);hk.prototype.i=function(a){this.state=a?3:2;sj(this)};hk.prototype.load=function(){0==this.state&&(this.state=1,sj(this),this.c(this.i.bind(this)))};hk.prototype.a=function(){return this.g};var ik,jk=ja,kk=-1<jk.navigator.userAgent.indexOf("OPR"),lk=-1<jk.navigator.userAgent.indexOf("Edge");ik=!(!jk.navigator.userAgent.match("CriOS")&&null!==jk.chrome&&void 0!==jk.chrome&&"Google Inc."===jk.navigator.vendor&&0==kk&&0==lk);function mk(a,b,c,d){var e=Oc(c,b,a);c=b.getPointResolution(d,c);b=b.cc();void 0!==b&&(c*=b);b=a.cc();void 0!==b&&(c/=b);a=a.getPointResolution(c,e)/c;isFinite(a)&&0<a&&(c/=a);return c}
function nk(a,b,c,d){a=c-a;b=d-b;var e=Math.sqrt(a*a+b*b);return[Math.round(c+a/e),Math.round(d+b/e)]}
function ok(a,b,c,d,e,f,g,h,l,m,n){var p=$e(Math.round(c*a),Math.round(c*b));if(0===l.length)return p.canvas;p.scale(c,c);var q=Eb();l.forEach(function(a){Vb(q,a.extent)});var t=$e(Math.round(c*ec(q)/d),Math.round(c*fc(q)/d)),v=c/d;l.forEach(function(a){t.drawImage(a.image,m,m,a.image.width-2*m,a.image.height-2*m,(a.extent[0]-q[0])*v,-(a.extent[3]-q[3])*v,ec(a.extent)*v,fc(a.extent)*v)});var u=bc(g);h.f.forEach(function(a){var b=a.source,e=a.target,g=b[1][0],h=b[1][1],l=b[2][0],m=b[2][1];a=(e[0][0]-
u[0])/f;var n=-(e[0][1]-u[1])/f,v=(e[1][0]-u[0])/f,M=-(e[1][1]-u[1])/f,oa=(e[2][0]-u[0])/f,Wb=-(e[2][1]-u[1])/f,e=b[0][0],b=b[0][1],g=g-e,h=h-b,l=l-e,m=m-b;a:{g=[[g,h,0,0,v-a],[l,m,0,0,oa-a],[0,0,g,h,M-n],[0,0,l,m,Wb-n]];h=g.length;for(l=0;l<h;l++){for(var m=l,Ib=Math.abs(g[l][l]),Jb=l+1;Jb<h;Jb++){var Yb=Math.abs(g[Jb][l]);Yb>Ib&&(Ib=Yb,m=Jb)}if(0===Ib){g=null;break a}Ib=g[m];g[m]=g[l];g[l]=Ib;for(m=l+1;m<h;m++)for(Ib=-g[m][l]/g[l][l],Jb=l;Jb<h+1;Jb++)g[m][Jb]=l==Jb?0:g[m][Jb]+Ib*g[l][Jb]}l=Array(h);
for(m=h-1;0<=m;m--)for(l[m]=g[m][h]/g[m][m],Ib=m-1;0<=Ib;Ib--)g[Ib][h]-=g[Ib][m]*l[m];g=l}g&&(p.save(),p.beginPath(),ik?(l=(a+v+oa)/3,m=(n+M+Wb)/3,h=nk(l,m,a,n),v=nk(l,m,v,M),oa=nk(l,m,oa,Wb),p.moveTo(v[0],v[1]),p.lineTo(h[0],h[1]),p.lineTo(oa[0],oa[1])):(p.moveTo(v,M),p.lineTo(a,n),p.lineTo(oa,Wb)),p.clip(),p.transform(g[0],g[2],g[1],g[3],a,n),p.translate(q[0]-e,q[3]-b),p.scale(d/c,-d/c),p.drawImage(t.canvas,0,0),p.restore())});n&&(p.save(),p.strokeStyle="black",p.lineWidth=1,h.f.forEach(function(a){var b=
a.target;a=(b[0][0]-u[0])/f;var c=-(b[0][1]-u[1])/f,d=(b[1][0]-u[0])/f,e=-(b[1][1]-u[1])/f,g=(b[2][0]-u[0])/f,b=-(b[2][1]-u[1])/f;p.beginPath();p.moveTo(d,e);p.lineTo(a,c);p.lineTo(g,b);p.closePath();p.stroke()}),p.restore());return p.canvas};function pk(a,b,c,d,e){this.g=a;this.c=b;var f={},g=Mc(this.c,this.g);this.a=function(a){var b=a[0]+"/"+a[1];f[b]||(f[b]=g(a));return f[b]};this.i=d;this.s=e*e;this.f=[];this.j=!1;this.o=this.g.a&&!!d&&!!this.g.C()&&ec(d)==ec(this.g.C());this.b=this.g.C()?ec(this.g.C()):null;this.l=this.c.C()?ec(this.c.C()):null;a=bc(c);b=ac(c);d=$b(c);c=Zb(c);e=this.a(a);var h=this.a(b),l=this.a(d),m=this.a(c);qk(this,a,b,d,c,e,h,l,m,10);if(this.j){var n=Infinity;this.f.forEach(function(a){n=Math.min(n,a.source[0][0],
a.source[1][0],a.source[2][0])});this.f.forEach(function(a){if(Math.max(a.source[0][0],a.source[1][0],a.source[2][0])-n>this.b/2){var b=[[a.source[0][0],a.source[0][1]],[a.source[1][0],a.source[1][1]],[a.source[2][0],a.source[2][1]]];b[0][0]-n>this.b/2&&(b[0][0]-=this.b);b[1][0]-n>this.b/2&&(b[1][0]-=this.b);b[2][0]-n>this.b/2&&(b[2][0]-=this.b);Math.max(b[0][0],b[1][0],b[2][0])-Math.min(b[0][0],b[1][0],b[2][0])<this.b/2&&(a.source=b)}},this)}f={}}
function qk(a,b,c,d,e,f,g,h,l,m){var n=Db([f,g,h,l]),p=a.b?ec(n)/a.b:null,q=a.b,t=a.g.a&&.5<p&&1>p,v=!1;if(0<m){if(a.c.g&&a.l)var u=Db([b,c,d,e]),v=v|.25<ec(u)/a.l;!t&&a.g.g&&p&&(v|=.25<p)}if(v||!a.i||kc(n,a.i)){if(!(v||isFinite(f[0])&&isFinite(f[1])&&isFinite(g[0])&&isFinite(g[1])&&isFinite(h[0])&&isFinite(h[1])&&isFinite(l[0])&&isFinite(l[1])))if(0<m)v=!0;else return;if(0<m&&(v||(n=a.a([(b[0]+d[0])/2,(b[1]+d[1])/2]),q=t?(ta(f[0],q)+ta(h[0],q))/2-ta(n[0],q):(f[0]+h[0])/2-n[0],n=(f[1]+h[1])/2-n[1],
v=q*q+n*n>a.s),v)){Math.abs(b[0]-d[0])<=Math.abs(b[1]-d[1])?(t=[(c[0]+d[0])/2,(c[1]+d[1])/2],q=a.a(t),n=[(e[0]+b[0])/2,(e[1]+b[1])/2],p=a.a(n),qk(a,b,c,t,n,f,g,q,p,m-1),qk(a,n,t,d,e,p,q,h,l,m-1)):(t=[(b[0]+c[0])/2,(b[1]+c[1])/2],q=a.a(t),n=[(d[0]+e[0])/2,(d[1]+e[1])/2],p=a.a(n),qk(a,b,t,n,e,f,q,p,l,m-1),qk(a,t,c,d,n,q,g,h,p,m-1));return}if(t){if(!a.o)return;a.j=!0}a.f.push({source:[f,h,l],target:[b,d,e]});a.f.push({source:[f,g,h],target:[b,c,d]})}}
function rk(a){var b=Eb();a.f.forEach(function(a){a=a.source;Fb(b,a[0]);Fb(b,a[1]);Fb(b,a[2])});return b};function sk(a,b,c,d,e,f){this.v=b;this.s=a.C();var g=b.C(),h=g?jc(c,g):c,g=mk(a,b,gc(h),d);this.j=new pk(a,b,h,this.s,.5*g);this.c=d;this.g=c;a=rk(this.j);this.o=(this.qb=f(a,g,e))?this.qb.f:1;this.zd=this.i=null;e=2;f=[];this.qb&&(e=0,f=this.qb.l);rj.call(this,c,d,this.o,e,f)}w(sk,rj);sk.prototype.ma=function(){1==this.state&&(Ea(this.zd),this.zd=null);rj.prototype.ma.call(this)};sk.prototype.a=function(){return this.i};
sk.prototype.yd=function(){var a=this.qb.V();2==a&&(this.i=ok(ec(this.g)/this.c,fc(this.g)/this.c,this.o,this.qb.$(),0,this.c,this.g,this.j,[{extent:this.qb.C(),image:this.qb.a()}],0));this.state=a;sj(this)};sk.prototype.load=function(){if(0==this.state){this.state=1;sj(this);var a=this.qb.V();2==a||3==a?this.yd():(this.zd=B(this.qb,"change",function(){var a=this.qb.V();if(2==a||3==a)Ea(this.zd),this.zd=null,this.yd()},this),this.qb.load())}};function tk(a){Tg.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,state:a.state});this.H=void 0!==a.resolutions?a.resolutions:null;this.a=null;this.pa=0}w(tk,Tg);function uk(a,b){a.H&&(b=a.H[cb(a.H,b,0)]);return b}
tk.prototype.A=function(a,b,c,d){var e=this.f;if(e&&d&&!Lc(e,d)){if(this.a){if(this.pa==this.g&&Lc(this.a.v,d)&&this.a.$()==b&&this.a.f==c&&Ub(this.a.C(),a))return this.a;Oa(this.a);this.a=null}this.a=new sk(e,d,a,b,c,function(a,b,c){return this.Kc(a,b,c,e)}.bind(this));this.pa=this.g;return this.a}e&&(d=e);return this.Kc(a,b,c,d)};tk.prototype.o=function(a){a=a.target;switch(a.V()){case 1:this.b(new vk(wk,a));break;case 2:this.b(new vk(xk,a));break;case 3:this.b(new vk(yk,a))}};
function zk(a,b){a.a().src=b}function vk(a,b){Pa.call(this,a);this.image=b}w(vk,Pa);var wk="imageloadstart",xk="imageloadend",yk="imageloaderror";function Ak(a){tk.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions,state:a.state});this.ha=a.canvasFunction;this.T=null;this.W=0;this.na=void 0!==a.ratio?a.ratio:1.5}w(Ak,tk);Ak.prototype.Kc=function(a,b,c,d){b=uk(this,b);var e=this.T;if(e&&this.W==this.g&&e.$()==b&&e.f==c&&Nb(e.C(),a))return e;a=a.slice();lc(a,this.na);(d=this.ha(a,b,c,[ec(a)/b*c,fc(a)/b*c],d))&&(e=new hk(a,b,c,this.l,d));this.T=e;this.W=this.g;return e};function Bk(a){this.c=a.source;this.Ia=ah();this.i=$e();this.j=[0,0];this.za=void 0==a.renderBuffer?100:a.renderBuffer;this.v=null;Ak.call(this,{attributions:a.attributions,canvasFunction:this.zj.bind(this),logo:a.logo,projection:a.projection,ratio:a.ratio,resolutions:a.resolutions,state:this.c.V()});this.R=null;this.s=void 0;this.uh(a.style);B(this.c,"change",this.$m,this)}w(Bk,Ak);k=Bk.prototype;
k.zj=function(a,b,c,d,e){var f=new Zj(.5*b/c,a,b,this.c.W,this.za);this.c.Nc(a,b,e);var g=!1;this.c.xb(a,function(a){var d;if(!(d=g)){var e;(d=a.hc())?e=d.call(a,b):this.s&&(e=this.s(a,b));if(e){var n,p=!1;Array.isArray(e)||(e=[e]);d=0;for(n=e.length;d<n;++d)p=fk(f,a,e[d],ek(b,c),this.Zm,this)||p;d=p}else d=!1}g=d},this);ak(f);if(g)return null;this.j[0]!=d[0]||this.j[1]!=d[1]?(this.i.canvas.width=d[0],this.i.canvas.height=d[1],this.j[0]=d[0],this.j[1]=d[1]):this.i.clearRect(0,0,d[0],d[1]);a=Ck(this,
gc(a),b,c,d);f.Sa(this.i,c,a,0,{});this.v=f;return this.i.canvas};k.ta=function(a,b,c,d,e){if(this.v){var f={};return this.v.ta(a,b,0,d,function(a){var b=x(a).toString();if(!(b in f))return f[b]=!0,e(a)})}};k.Wm=function(){return this.c};k.Xm=function(){return this.R};k.Ym=function(){return this.s};function Ck(a,b,c,d,e){c=d/c;return jh(a.Ia,e[0]/2,e[1]/2,c,-c,0,-b[0],-b[1])}k.Zm=function(){this.u()};k.$m=function(){Vg(this,this.c.V())};
k.uh=function(a){this.R=void 0!==a?a:cj;this.s=a?aj(this.R):void 0;this.u()};function Dk(a){Dj.call(this,a);this.f=null;this.s=ah();this.c=this.j=null}w(Dk,Dj);Dk.prototype.ta=function(a,b,c,d){var e=this.a;return e.ga().ta(a,b.viewState.resolution,b.viewState.rotation,b.skippedFeatureUids,function(a){return c.call(d,a,e)})};
Dk.prototype.Ac=function(a,b,c,d){if(this.f&&this.f.a())if(this.a.ga()instanceof Bk){if(a=fh(b.pixelToCoordinateTransform,a.slice()),this.ta(a,b,nc,this))return c.call(d,this.a,null)}else if(this.j||(this.j=kh(this.s.slice())),b=fh(this.j,a.slice()),this.c||(this.c=$e(1,1)),this.c.clearRect(0,0,1,1),this.c.drawImage(this.f?this.f.a():null,b[0],b[1],1,1,0,0,1,1),b=this.c.getImageData(0,0,1,1).data,0<b[3])return c.call(d,this.a,b)};
Dk.prototype.l=function(a,b){var c=a.pixelRatio,d=a.viewState,e=d.center,f=d.resolution,g=this.a.ga(),h=a.viewHints,l=a.extent;void 0!==b.extent&&(l=jc(l,b.extent));h[0]||h[1]||dc(l)||(d=g.A(l,f,c,d.projection))&&wj(this,d)&&(this.f=d);if(this.f){var d=this.f,h=d.C(),l=d.$(),m=d.f,f=c*l/(f*m),n=bh(this.s);ih(n,c*a.size[0]/2,c*a.size[1]/2);hh(n,f,f);ih(n,m*(h[0]-e[0])/l,m*(e[1]-h[3])/l);this.j=null;yj(a.attributions,d.l);zj(a,g)}return!!this.f};function Ek(a){Dj.call(this,a);this.c=$e();this.j=null;this.o=Eb();this.R=[0,0,0];this.D=ah();this.H=0}w(Ek,Dj);Ek.prototype.i=function(a,b,c){var d=Hj(this,a,0);Fj(this,"precompose",c,a,d);Fk(this,c,a,b);Gj(this,c,a,d)};
Ek.prototype.l=function(a,b){function c(a){a=a.V();return 2==a||4==a||3==a&&!t}var d=a.pixelRatio,e=a.viewState,f=e.projection,g=this.a,h=g.ga(),l=h.fb(f),m=l.ec(e.resolution,this.H),n=l.$(m),p=e.center;n==e.resolution?(p=Bj(p,n,a.size),e=ic(p,n,e.rotation,a.size)):e=a.extent;void 0!==b.extent&&(e=jc(e,b.extent));if(dc(e))return!1;n=je(l,e,n);p={};p[m]={};var q=this.Pd(h,f,p),t=g.c(),v=Eb(),u=new Vd(0,0,0,0),y,E,z,G;for(z=n.ca;z<=n.ea;++z)for(G=n.fa;G<=n.ia;++G)y=h.dc(m,z,G,d,f),!c(y)&&y.a&&(y=y.a),
c(y)?p[m][y.oa.toString()]=y:(E=he(l,y.oa,q,u,v),E||(y=ie(l,y.oa,u,v))&&q(m+1,y));q=Object.keys(p).map(Number);q.sort(ab);var v=[],J,u=0;for(z=q.length;u<z;++u)for(J in y=q[u],G=p[y],G)y=G[J],2==y.V()&&v.push(y);this.j=v;Aj(a.usedTiles,h,m,n);Cj(a,h,l,d,f,e,m,g.f());xj(a,h);zj(a,h);return!0};
Ek.prototype.Ac=function(a,b,c,d){var e=this.c.canvas,f=b.size,g=b.pixelRatio;e.width=f[0]*g;e.height=f[1]*g;this.i(b,Rg(this.a),this.c);a=this.c.getImageData(a[0],a[1],1,1).data;if(0<a[3])return c.call(d,this.a,a)};
function Fk(a,b,c,d){var e=c.pixelRatio,f=c.viewState,g=f.center,h=f.projection,l=f.rotation,m=c.size,n=Math.round(e*m[0]/2),m=Math.round(e*m[1]/2),f=e/f.resolution,p=a.a,q=p.ga(),t=e*q.Ud(h),v=q.fb(h),p=Ta(p,"render"),u=b,y=1,E,z,G;if(l||p){u=a.c;E=u.canvas;var y=q.zb(e)/e,J=b.canvas.width*y;z=b.canvas.height*y;G=Math.round(Math.sqrt(J*J+z*z));E.width!=G?E.width=E.height=G:u.clearRect(0,0,G,G);E=(G-J)/2/y;z=(G-z)/2/y;f*=y;n=Math.round(y*(n+E));m=Math.round(y*(m+z))}J=u.globalAlpha;u.globalAlpha=
d.opacity;var X=a.j,A,Ma=q.gf(h)&&1==d.opacity;Ma||(X.reverse(),A=[]);var ua=d.extent;if(d=void 0!==ua){var M=bc(ua),oa=ac(ua),Wb=$b(ua),ua=Zb(ua);fh(c.coordinateToPixelTransform,M);fh(c.coordinateToPixelTransform,oa);fh(c.coordinateToPixelTransform,Wb);fh(c.coordinateToPixelTransform,ua);var Ib=E||0,Jb=z||0;u.save();var Yb=u.canvas.width/2,hc=u.canvas.height/2;Oi(u,-l,Yb,hc);u.beginPath();u.moveTo(y*(M[0]*e+Ib),y*(M[1]*e+Jb));u.lineTo(y*(oa[0]*e+Ib),y*(oa[1]*e+Jb));u.lineTo(y*(Wb[0]*e+Ib),y*(Wb[1]*
e+Jb));u.lineTo(y*(ua[0]*e+Ib),y*(ua[1]*e+Jb));u.clip();Oi(u,l,Yb,hc)}M=0;for(oa=X.length;M<oa;++M){var Wb=X[M],ua=Wb.oa,hc=v.Ea(ua,a.o),Yb=ua[0],Pb=Zb(v.Ea(v.pd(g,Yb,a.R))),ua=Math.round(ec(hc)*f),Ib=Math.round(fc(hc)*f),Jb=Math.round((hc[0]-Pb[0])*f/ua)*ua+n+Math.round((Pb[0]-g[0])*f),hc=Math.round((Pb[1]-hc[3])*f/Ib)*Ib+m+Math.round((g[1]-Pb[1])*f);if(!Ma){Pb=[Jb,hc,Jb+ua,hc+Ib];u.save();for(var Od=0,tf=A.length;Od<tf;++Od){var Pd=A[Od];kc(Pb,Pd)&&(u.beginPath(),u.moveTo(Pb[0],Pb[1]),u.lineTo(Pb[0],
Pb[3]),u.lineTo(Pb[2],Pb[3]),u.lineTo(Pb[2],Pb[1]),u.moveTo(Pd[0],Pd[1]),u.lineTo(Pd[2],Pd[1]),u.lineTo(Pd[2],Pd[3]),u.lineTo(Pd[0],Pd[3]),u.closePath(),u.clip())}A.push(Pb)}Yb=q.jf(Yb,e,h);u.drawImage(Wb.ab(),t,t,Yb[0],Yb[1],Jb,hc,ua,Ib);Ma||u.restore()}d&&u.restore();p&&(e=E-n/y+n,h=z-m/y+m,g=jh(a.D,G/2-e,G/2-h,f,-f,-l,-g[0]+e/f,-g[1]-h/f),Fj(a,"render",u,c,g));(l||p)&&b.drawImage(u.canvas,-Math.round(E),-Math.round(z),G/y,G/y);u.globalAlpha=J};function Gk(a){Dj.call(this,a);this.c=!1;this.H=-1;this.A=NaN;this.v=Eb();this.j=this.U=null;this.o=$e()}w(Gk,Dj);
Gk.prototype.i=function(a,b,c){var d=a.extent,e=a.pixelRatio,f=b.Oc?a.skippedFeatureUids:{},g=a.viewState,h=g.projection,g=g.rotation,l=h.C(),m=this.a.ga(),n=Hj(this,a,0);Fj(this,"precompose",c,a,n);var p=b.extent,q=void 0!==p;q&&Ej(c,a,p);if((p=this.j)&&!p.g()){var t=0,v=0,u;if(Ta(this.a,"render")){u=c.canvas.width;var y=c.canvas.height;if(g){var E=Math.round(Math.sqrt(u*u+y*y)),t=(E-u)/2,v=(E-y)/2;u=y=E}this.o.canvas.width=u;this.o.canvas.height=y;u=this.o}else u=c;y=u.globalAlpha;u.globalAlpha=
b.opacity;u!=c&&u.translate(t,v);b=a.size[0]*e;E=a.size[1]*e;Oi(u,-g,b/2,E/2);p.Sa(u,e,n,g,f);if(m.D&&h.a&&!Nb(l,d)){for(var h=d[0],m=ec(l),z=0;h<l[0];)--z,n=m*z,n=Hj(this,a,n),p.Sa(u,e,n,g,f),h+=m;z=0;for(h=d[2];h>l[2];)++z,n=m*z,n=Hj(this,a,n),p.Sa(u,e,n,g,f),h-=m;n=Hj(this,a,0)}Oi(u,g,b/2,E/2);u!=c&&(Fj(this,"render",u,a,n),c.drawImage(u.canvas,-t,-v),u.translate(-t,-v));u.globalAlpha=y}q&&c.restore();Gj(this,c,a,n)};
Gk.prototype.ta=function(a,b,c,d){if(this.j){var e=this.a,f={};return this.j.ta(a,b.viewState.resolution,b.viewState.rotation,{},function(a){var b=x(a).toString();if(!(b in f))return f[b]=!0,c.call(d,a,e)})}};Gk.prototype.D=function(){vj(this)};
Gk.prototype.l=function(a){function b(a){var b,d=a.hc();d?b=d.call(a,m):(d=c.i)&&(b=d(a,m));if(b){if(b){d=!1;if(Array.isArray(b))for(var e=0,f=b.length;e<f;++e)d=fk(q,a,b[e],ek(m,n),this.D,this)||d;else d=fk(q,a,b,ek(m,n),this.D,this)||d;a=d}else a=!1;this.c=this.c||a}}var c=this.a,d=c.ga();yj(a.attributions,d.l);zj(a,d);var e=a.viewHints[0],f=a.viewHints[1],g=c.R,h=c.T;if(!this.c&&!g&&e||!h&&f)return!0;var l=a.extent,h=a.viewState,e=h.projection,m=h.resolution,n=a.pixelRatio,f=c.g,p=c.a,g=ej(c);
void 0===g&&(g=dk);l=Gb(l,p*m);p=h.projection.C();d.D&&h.projection.a&&!Nb(p,a.extent)&&(a=Math.max(ec(l)/2,ec(p)),l[0]=p[0]-a,l[2]=p[2]+a);if(!this.c&&this.A==m&&this.H==f&&this.U==g&&Nb(this.v,l))return!0;this.j=null;this.c=!1;var q=new Zj(.5*m/n,l,m,d.W,c.a);d.Nc(l,m,e);if(g){var t=[];d.xb(l,function(a){t.push(a)},this);t.sort(g);t.forEach(b,this)}else d.xb(l,b,this);ak(q);this.A=m;this.H=f;this.U=g;this.v=l;this.j=q;return!0};var Hk={image:Jj,hybrid:["Polygon","LineString"]},Ik={hybrid:["Image","Text"],vector:Jj};function Jk(a){Ek.call(this,a);this.U=!1;this.v=ah();this.H="vector"==a.s?1:0}w(Jk,Ek);
Jk.prototype.i=function(a,b,c){var d=Hj(this,a,0);Fj(this,"precompose",c,a,d);var e=b.extent,f=void 0!==e;f&&Ej(c,a,e);e=this.a.s;"vector"!==e&&Fk(this,c,a,b);if("image"!==e){var g=this.a,e=Ik[g.s],h=a.pixelRatio,l=b.Oc?a.skippedFeatureUids:{},m=a.viewState,n=m.center,p=m.rotation,q=a.size,m=h/m.resolution,t=g.ga(),v=t.zb(),u=Hj(this,a,0);Ta(g,"render")?(this.c.canvas.width=c.canvas.width,this.c.canvas.height=c.canvas.height,g=this.c):g=c;var y=g.globalAlpha;g.globalAlpha=b.opacity;b=this.j;var t=
t.tileGrid,E,z,G,J,X,A,Ma,ua;z=0;for(G=b.length;z<G;++z)J=b[z],Ma=J.f,X=t.Ea(J.oa,this.o),E=J.oa[0],A="tile-pixels"==J.j.Ab(),E=t.$(E),ua=E/v,E=Math.round(h*q[0]/2),J=Math.round(h*q[1]/2),A?(X=bc(X),bh(this.v),X=jh(this.v,E,J,m*ua,m*ua,p,(X[0]-n[0])/ua,(n[1]-X[1])/ua)):X=u,Oi(g,-p,E,J),Ma.xd.Sa(g,h,X,p,l,e),Oi(g,p,E,J);g!=c&&(Fj(this,"render",g,a,u),c.drawImage(g.canvas,0,0));g.globalAlpha=y}f&&c.restore();Gj(this,c,a,d)};
function Kk(a,b,c){function d(a){var b,c=a.hc();c?b=c.call(a,v):(c=e.i)&&(b=c(a,v));if(b){Array.isArray(b)||(b=[b]);var c=z,d=E;if(b){var f=!1;if(Array.isArray(b))for(var g=0,h=b.length;g<h;++g)f=fk(d,a,b[g],c,this.A,this)||f;else f=fk(d,a,b,c,this.A,this)||f;a=f}else a=!1;this.U=this.U||a;l.gd=l.gd||a}}var e=a.a,f=c.pixelRatio;c=c.viewState.projection;var g=e.g,h=ej(e)||null,l=b.f;if(l.gd||l.Zh!=g||l.Sf!=h){l.xd=null;l.gd=!1;var m=e.ga(),n=m.tileGrid,p=b.oa,q=b.j,t="tile-pixels"==q.Ab(),v=n.$(p[0]),
u;if(t)var y=t=m.zb(),n=ae(n.Qa(p[0])),n=[0,0,n[0]*y,n[1]*y];else t=v,n=n.Ea(p),Lc(c,q)||(u=!0,b.uf(c));l.gd=!1;var E=new Zj(0,n,t,m.i,e.a),z=ek(t,f);b=b.c;h&&h!==l.Sf&&b.sort(h);m=0;for(t=b.length;m<t;++m)f=b[m],u&&f.Y().lb(q,c),d.call(a,f);ak(E);l.Zh=g;l.Sf=h;l.xd=E;l.resolution=NaN}}
Jk.prototype.ta=function(a,b,c,d){var e=b.viewState.resolution;b=b.viewState.rotation;var f=this.a,g={},h=this.j,l=f.ga(),m=l.tileGrid,n,p,q,t,v,u;q=0;for(t=h.length;q<t;++q)u=h[q],p=u.oa,v=l.tileGrid.Ea(p,this.o),Lb(v,a)&&("tile-pixels"===u.j.Ab()?(v=bc(v),e=l.zb(),p=m.$(p[0])/e,p=[(a[0]-v[0])/p,(v[1]-a[1])/p]):p=a,u=u.f.xd,n=n||u.ta(p,e,b,{},function(a){var b=x(a).toString();if(!(b in g))return g[b]=!0,c.call(d,a,f)}));return n};Jk.prototype.A=function(){vj(this)};
Jk.prototype.l=function(a,b){var c=Ek.prototype.l.call(this,a,b);if(c)for(var d=Object.keys(a.De||{}),e=0,f=this.j.length;e<f;++e){var g=this.j[e];Kk(this,g,a);var h=g,g=a,l=this.a,m=Hk[l.s];if(m){var n=g.pixelRatio,p=h.f,q=l.g;if(!hb(p.ri,d)||p.Tf!==q){p.ri=d;p.Tf=q;var q=h.g,t=l.ga(),v=t.tileGrid,u=h.oa[0],y=v.$(u),l=ae(v.Qa(u)),u=v.$(u),E=u/y,z=l[0]*n*E,G=l[1]*n*E;q.canvas.width=z/E+.5;q.canvas.height=G/E+.5;q.scale(1/E,1/E);q.translate(z/2,G/2);E="tile-pixels"==h.j.Ab();y=n/y;t=t.zb();u/=t;v=
v.Ea(h.oa,this.o);h=bh(this.v);E?(hh(h,y*u,y*u),ih(h,-l[0]*t/2,-l[1]*t/2)):(l=gc(v),hh(h,y,-y),ih(h,-l[0],-l[1]));p.xd.Sa(q,n,h,0,g.skippedFeatureUids||{},m)}}}return c};function Lk(a,b){lh.call(this,0,b);this.f=$e();this.b=this.f.canvas;this.b.style.width="100%";this.b.style.height="100%";this.b.className="ol-unselectable";a.insertBefore(this.b,a.childNodes[0]||null);this.a=!0;this.c=ah()}w(Lk,lh);Lk.prototype.Ve=function(a){return a instanceof Ji?new Dk(a):a instanceof Ki?new Ek(a):a instanceof H?new Jk(a):a instanceof F?new Gk(a):null};
function Mk(a,b,c){var d=a.i,e=a.f;if(Ta(d,b)){var f=c.extent,g=c.pixelRatio,h=c.viewState.rotation,l=c.viewState,m=c.pixelRatio/l.resolution;a=jh(a.c,a.b.width/2,a.b.height/2,m,-m,-l.rotation,-l.center[0],-l.center[1]);d.b(new Sg(b,new gj(e,g,f,a,h),c,e,null))}}Lk.prototype.X=function(){return"canvas"};
Lk.prototype.Be=function(a){if(a){var b=this.f,c=a.pixelRatio,d=Math.round(a.size[0]*c),c=Math.round(a.size[1]*c);this.b.width!=d||this.b.height!=c?(this.b.width=d,this.b.height=c):b.clearRect(0,0,d,c);var e=a.viewState.rotation;mh(a);Mk(this,"precompose",a);var f=a.layerStatesArray;ib(f);Oi(b,e,d/2,c/2);var g=a.viewState.resolution,h,l,m,n;h=0;for(l=f.length;h<l;++h)n=f[h],m=n.layer,m=oh(this,m),Xg(n,g)&&"ready"==n.O&&m.l(a,n)&&m.i(a,n,b);Oi(b,-e,d/2,c/2);Mk(this,"postcompose",a);this.a||(this.b.style.display=
"",this.a=!0);ph(this,a);a.postRenderFunctions.push(nh)}else this.a&&(this.b.style.display="none",this.a=!1)};function Nk(a,b){tj.call(this,a);this.target=b}w(Nk,tj);Nk.prototype.Md=ha;Nk.prototype.qh=ha;function Ok(a){var b=document.createElement("DIV");b.style.position="absolute";Nk.call(this,a,b);this.f=null;this.c=ah()}w(Ok,Nk);Ok.prototype.ta=function(a,b,c,d){var e=this.a;return e.ga().ta(a,b.viewState.resolution,b.viewState.rotation,b.skippedFeatureUids,function(a){return c.call(d,a,e)})};Ok.prototype.Md=function(){gf(this.target);this.f=null};
Ok.prototype.xf=function(a,b){var c=a.viewState,d=c.center,e=c.resolution,f=c.rotation,g=this.f,h=this.a.ga(),l=a.viewHints,m=a.extent;void 0!==b.extent&&(m=jc(m,b.extent));l[0]||l[1]||dc(m)||(c=h.A(m,e,a.pixelRatio,c.projection))&&wj(this,c)&&(g=c);g&&(l=g.C(),m=g.$(),c=ah(),jh(c,a.size[0]/2,a.size[1]/2,m/e,m/e,f,(l[0]-d[0])/m,(d[1]-l[3])/m),g!=this.f&&(d=g.a(this),d.style.maxWidth="none",d.style.position="absolute",gf(this.target),this.target.appendChild(d),this.f=g),hb(c,this.c)||(df(this.target,
c),eh(this.c,c)),yj(a.attributions,g.l),zj(a,h));return!0};function Pk(a){var b=document.createElement("DIV");b.style.position="absolute";Nk.call(this,a,b);this.c=!0;this.l=1;this.i=0;this.f={}}w(Pk,Nk);Pk.prototype.Md=function(){gf(this.target);this.i=0};
Pk.prototype.xf=function(a,b){if(!b.visible)return this.c&&(this.target.style.display="none",this.c=!1),!0;var c=a.pixelRatio,d=a.viewState,e=d.projection,f=this.a,g=f.ga(),h=g.fb(e),l=c*g.Ud(e),m=h.ec(d.resolution),n=h.$(m),p=d.center,q;n==d.resolution?(p=Bj(p,n,a.size),q=ic(p,n,d.rotation,a.size)):q=a.extent;void 0!==b.extent&&(q=jc(q,b.extent));var n=je(h,q,n),t={};t[m]={};var v=this.Pd(g,e,t),u=f.c(),y=Eb(),E=new Vd(0,0,0,0),z,G,J,X;for(J=n.ca;J<=n.ea;++J)for(X=n.fa;X<=n.ia;++X)z=g.dc(m,J,X,c,
e),G=z.V(),G=2==G||4==G||3==G&&!u,!G&&z.a&&(z=z.a),G=z.V(),2==G?t[m][z.oa.toString()]=z:4==G||3==G&&!u||(G=he(h,z.oa,v,E,y),G||(z=ie(h,z.oa,E,y))&&v(m+1,z));var A;if(this.i!=g.g){for(A in this.f)u=this.f[+A],ff(u.target);this.f={};this.i=g.g}y=Object.keys(t).map(Number);y.sort(ab);var v={},Ma;J=0;for(X=y.length;J<X;++J){A=y[J];A in this.f?u=this.f[A]:(u=h.pd(p,A),u=new Qk(h,u),v[A]=!0,this.f[A]=u);A=t[A];for(Ma in A){z=u;G=A[Ma];var ua=l,M=G.oa,oa=M[0],Wb=M[1],Ib=M[2],M=M.toString();if(!(M in z.a)){var oa=
ae(z.c.Qa(oa),z.j),Jb=G.ab(z),Yb=Jb.style;Yb.maxWidth="none";var hc,Pb;0<ua?(hc=document.createElement("DIV"),Pb=hc.style,Pb.overflow="hidden",Pb.width=oa[0]+"px",Pb.height=oa[1]+"px",Yb.position="absolute",Yb.left=-ua+"px",Yb.top=-ua+"px",Yb.width=oa[0]+2*ua+"px",Yb.height=oa[1]+2*ua+"px",hc.appendChild(Jb)):(Yb.width=oa[0]+"px",Yb.height=oa[1]+"px",hc=Jb,Pb=Yb);Pb.position="absolute";Pb.left=(Wb-z.g[1])*oa[0]+"px";Pb.top=(z.g[2]-Ib)*oa[1]+"px";z.b||(z.b=document.createDocumentFragment());z.b.appendChild(hc);
z.a[M]=G}}u.b&&(u.target.appendChild(u.b),u.b=null)}l=Object.keys(this.f).map(Number);l.sort(ab);J=ah();Ma=0;for(y=l.length;Ma<y;++Ma)if(A=l[Ma],u=this.f[A],A in t)if(z=u.$(),X=u.Ka(),jh(J,a.size[0]/2,a.size[1]/2,z/d.resolution,z/d.resolution,d.rotation,(X[0]-p[0])/z,(p[1]-X[1])/z),u.setTransform(J),A in v){for(--A;0<=A;--A)if(A in this.f){this.f[A].target.parentNode&&this.f[A].target.parentNode.insertBefore(u.target,this.f[A].target.nextSibling);break}0>A&&this.target.insertBefore(u.target,this.target.childNodes[0]||
null)}else{if(!a.viewHints[0]&&!a.viewHints[1]){G=ge(u.c,q,u.g[0],E);A=[];z=void 0;for(z in u.a)X=u.a[z],ua=X.oa,Wd(G,ua[1],ua[2])||A.push(X);G=0;for(ua=A.length;G<ua;++G)X=A[G],z=X.oa.toString(),ff(X.ab(u)),delete u.a[z]}}else ff(u.target),delete this.f[A];b.opacity!=this.l&&(this.l=this.target.style.opacity=b.opacity);b.visible&&!this.c&&(this.target.style.display="",this.c=!0);Aj(a.usedTiles,g,m,n);Cj(a,g,h,c,e,q,m,f.f());xj(a,g);zj(a,g);return!0};
function Qk(a,b){this.target=document.createElement("DIV");this.target.style.position="absolute";this.target.style.width="100%";this.target.style.height="100%";this.c=a;this.g=b;this.i=bc(a.Ea(b));this.l=a.$(b[0]);this.a={};this.b=null;this.f=ah();this.j=[0,0]}Qk.prototype.Ka=function(){return this.i};Qk.prototype.$=function(){return this.l};Qk.prototype.setTransform=function(a){hb(a,this.f)||(df(this.target,a),eh(this.f,a))};function Rk(a){this.i=$e();var b=this.i.canvas;b.style.maxWidth="none";b.style.position="absolute";Nk.call(this,a,b);this.f=!1;this.l=-1;this.s=NaN;this.j=Eb();this.c=this.o=null;this.U=ah();this.v=ah()}w(Rk,Nk);k=Rk.prototype;k.Md=function(){var a=this.i.canvas;a.width=a.width;this.l=0};
k.qh=function(a,b){var c=a.viewState,d=c.center,e=c.rotation,f=c.resolution,c=a.pixelRatio,g=a.size[0],h=a.size[1],l=g*c,m=h*c,d=jh(this.U,c*g/2,c*h/2,c/f,-c/f,-e,-d[0],-d[1]),f=this.i;f.canvas.width=l;f.canvas.height=m;var n=bh(this.v);hh(n,1/c,1/c);ih(n,-(l-g)/2*c,-(m-h)/2*c);df(f.canvas,n);Sk(this,"precompose",a,d);(g=this.c)&&!g.g()&&(f.globalAlpha=b.opacity,g.Sa(f,c,d,e,b.Oc?a.skippedFeatureUids:{}),Sk(this,"render",a,d));Sk(this,"postcompose",a,d)};
function Sk(a,b,c,d){var e=a.i;a=a.a;Ta(a,b)&&a.b(new Sg(b,new gj(e,c.pixelRatio,c.extent,d,c.viewState.rotation),c,e,null))}k.ta=function(a,b,c,d){if(this.c){var e=this.a,f={};return this.c.ta(a,b.viewState.resolution,b.viewState.rotation,{},function(a){var b=x(a).toString();if(!(b in f))return f[b]=!0,c.call(d,a,e)})}};k.rh=function(){vj(this)};
k.xf=function(a){function b(a){var b,d=a.hc();d?b=d.call(a,l):(d=c.i)&&(b=d(a,l));if(b){if(b){d=!1;if(Array.isArray(b))for(var e=0,f=b.length;e<f;++e)d=fk(n,a,b[e],ek(l,m),this.rh,this)||d;else d=fk(n,a,b,ek(l,m),this.rh,this)||d;a=d}else a=!1;this.f=this.f||a}}var c=this.a,d=c.ga();yj(a.attributions,d.l);zj(a,d);var e=a.viewHints[0],f=a.viewHints[1],g=c.R,h=c.T;if(!this.f&&!g&&e||!h&&f)return!0;var f=a.extent,g=a.viewState,e=g.projection,l=g.resolution,m=a.pixelRatio;a=c.g;h=c.a;g=ej(c);void 0===
g&&(g=dk);f=Gb(f,h*l);if(!this.f&&this.s==l&&this.l==a&&this.o==g&&Nb(this.j,f))return!0;this.c=null;this.f=!1;var n=new Zj(.5*l/m,f,l,d.W,c.a);d.Nc(f,l,e);if(g){var p=[];d.xb(f,function(a){p.push(a)},this);p.sort(g);p.forEach(b,this)}else d.xb(f,b,this);ak(n);this.s=l;this.l=a;this.o=g;this.j=f;this.c=n;return!0};function Tk(a,b){lh.call(this,0,b);this.f=$e();var c=this.f.canvas;c.style.position="absolute";c.style.width="100%";c.style.height="100%";c.className="ol-unselectable";a.insertBefore(c,a.childNodes[0]||null);this.c=ah();this.b=document.createElement("DIV");this.b.className="ol-unselectable";c=this.b.style;c.position="absolute";c.width="100%";c.height="100%";B(this.b,"touchstart",Ra);a.insertBefore(this.b,a.childNodes[0]||null);this.a=!0}w(Tk,lh);Tk.prototype.ma=function(){ff(this.b);lh.prototype.ma.call(this)};
Tk.prototype.Ve=function(a){if(a instanceof Ji)a=new Ok(a);else if(a instanceof Ki)a=new Pk(a);else if(a instanceof F)a=new Rk(a);else return null;return a};function Uk(a,b,c){var d=a.i;if(Ta(d,b)){var e=c.extent,f=c.pixelRatio,g=c.viewState,h=g.rotation,l=a.f,m=l.canvas;a=jh(a.c,m.width/2,m.height/2,f/g.resolution,-f/g.resolution,-h,-g.center[0],-g.center[1]);d.b(new Sg(b,new gj(l,f,e,a,h),c,l,null))}}Tk.prototype.X=function(){return"dom"};
Tk.prototype.Be=function(a){if(a){var b=this.i;if(Ta(b,"precompose")||Ta(b,"postcompose")){var b=this.f.canvas,c=a.pixelRatio;b.width=a.size[0]*c;b.height=a.size[1]*c}Uk(this,"precompose",a);b=a.layerStatesArray;ib(b);var c=a.viewState.resolution,d,e,f,g;d=0;for(e=b.length;d<e;++d)g=b[d],f=g.layer,f=oh(this,f),this.b.insertBefore(f.target,this.b.childNodes[d]||null),Xg(g,c)&&"ready"==g.O?f.xf(a,g)&&f.qh(a,g):f.Md();var b=a.layerStates,h;for(h in this.g)h in b||(f=this.g[h],ff(f.target));this.a||(this.b.style.display=
"",this.a=!0);mh(a);ph(this,a);a.postRenderFunctions.push(nh);Uk(this,"postcompose",a)}else this.a&&(this.b.style.display="none",this.a=!1)};function Vk(a){this.b=a};function Wk(a){this.b=a}w(Wk,Vk);Wk.prototype.X=function(){return 35632};function Xk(a){this.b=a}w(Xk,Vk);Xk.prototype.X=function(){return 35633};function Yk(){this.b="precision mediump float;varying vec2 a;varying float b;uniform float k;uniform sampler2D l;void main(void){vec4 texColor=texture2D(l,a);gl_FragColor.rgb=texColor.rgb;float alpha=texColor.a*b*k;if(alpha==0.0){discard;}gl_FragColor.a=alpha;}"}w(Yk,Wk);var Zk=new Yk;
function $k(){this.b="varying vec2 a;varying float b;attribute vec2 c;attribute vec2 d;attribute vec2 e;attribute float f;attribute float g;uniform mat4 h;uniform mat4 i;uniform mat4 j;void main(void){mat4 offsetMatrix=i;if(g==1.0){offsetMatrix=i*j;}vec4 offsets=offsetMatrix*vec4(e,0.,0.);gl_Position=h*vec4(c,0.,1.)+offsets;a=d;b=f;}"}w($k,Xk);var al=new $k;
function bl(a,b){this.j=a.getUniformLocation(b,"j");this.o=a.getUniformLocation(b,"i");this.i=a.getUniformLocation(b,"k");this.l=a.getUniformLocation(b,"h");this.b=a.getAttribLocation(b,"e");this.a=a.getAttribLocation(b,"f");this.f=a.getAttribLocation(b,"c");this.g=a.getAttribLocation(b,"g");this.c=a.getAttribLocation(b,"d")};function cl(a){this.b=void 0!==a?a:[];this.a=dl}var dl=35044;function el(a,b){this.l=a;this.b=b;this.a={};this.c={};this.f={};this.o=this.s=this.i=this.j=null;(this.g=bb(ga,"OES_element_index_uint"))&&b.getExtension("OES_element_index_uint");B(this.l,"webglcontextlost",this.Yn,this);B(this.l,"webglcontextrestored",this.Zn,this)}w(el,Na);
function fl(a,b,c){var d=a.b,e=c.b,f=String(x(c));if(f in a.a)d.bindBuffer(b,a.a[f].buffer);else{var g=d.createBuffer();d.bindBuffer(b,g);var h;34962==b?h=new Float32Array(e):34963==b&&(h=a.g?new Uint32Array(e):new Uint16Array(e));d.bufferData(b,h,c.a);a.a[f]={Gb:c,buffer:g}}}function gl(a,b){var c=a.b,d=String(x(b)),e=a.a[d];c.isContextLost()||c.deleteBuffer(e.buffer);delete a.a[d]}k=el.prototype;
k.ma=function(){La(this.l);var a=this.b;if(!a.isContextLost()){for(var b in this.a)a.deleteBuffer(this.a[b].buffer);for(b in this.f)a.deleteProgram(this.f[b]);for(b in this.c)a.deleteShader(this.c[b]);a.deleteFramebuffer(this.i);a.deleteRenderbuffer(this.o);a.deleteTexture(this.s)}};k.Xn=function(){return this.b};
function hl(a){if(!a.i){var b=a.b,c=b.createFramebuffer();b.bindFramebuffer(b.FRAMEBUFFER,c);var d=il(b,1,1),e=b.createRenderbuffer();b.bindRenderbuffer(b.RENDERBUFFER,e);b.renderbufferStorage(b.RENDERBUFFER,b.DEPTH_COMPONENT16,1,1);b.framebufferTexture2D(b.FRAMEBUFFER,b.COLOR_ATTACHMENT0,b.TEXTURE_2D,d,0);b.framebufferRenderbuffer(b.FRAMEBUFFER,b.DEPTH_ATTACHMENT,b.RENDERBUFFER,e);b.bindTexture(b.TEXTURE_2D,null);b.bindRenderbuffer(b.RENDERBUFFER,null);b.bindFramebuffer(b.FRAMEBUFFER,null);a.i=c;
a.s=d;a.o=e}return a.i}function jl(a,b){var c=String(x(b));if(c in a.c)return a.c[c];var d=a.b,e=d.createShader(b.X());d.shaderSource(e,b.b);d.compileShader(e);return a.c[c]=e}function kl(a,b,c){var d=x(b)+"/"+x(c);if(d in a.f)return a.f[d];var e=a.b,f=e.createProgram();e.attachShader(f,jl(a,b));e.attachShader(f,jl(a,c));e.linkProgram(f);return a.f[d]=f}k.Yn=function(){Aa(this.a);Aa(this.c);Aa(this.f);this.o=this.s=this.i=this.j=null};k.Zn=function(){};
k.ve=function(a){if(a==this.j)return!1;this.b.useProgram(a);this.j=a;return!0};function ll(a,b,c){var d=a.createTexture();a.bindTexture(a.TEXTURE_2D,d);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);void 0!==b&&a.texParameteri(3553,10242,b);void 0!==c&&a.texParameteri(3553,10243,c);return d}function il(a,b,c){var d=ll(a,void 0,void 0);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,b,c,0,a.RGBA,a.UNSIGNED_BYTE,null);return d}
function ml(a,b){var c=ll(a,33071,33071);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,b);return c};function nl(a,b){this.H=this.A=void 0;this.o=gc(b);this.U=[];this.i=[];this.O=void 0;this.c=[];this.f=[];this.Ba=this.Aa=void 0;this.a=[];this.D=this.j=null;this.R=void 0;this.za=ah();this.Ha=ah();this.W=this.T=void 0;this.Ia=ah();this.pa=Xe();this.cb=this.ha=this.Va=void 0;this.Lb=[];this.l=[];this.b=[];this.v=null;this.g=[];this.s=[];this.na=void 0}w(nl,fj);
function pl(a,b){var c=a.v,d=a.j,e=a.Lb,f=a.l,g=b.b;return function(){if(!g.isContextLost()){var a,l;a=0;for(l=e.length;a<l;++a)g.deleteTexture(e[a]);a=0;for(l=f.length;a<l;++a)g.deleteTexture(f[a])}gl(b,c);gl(b,d)}}
function ql(a,b,c,d){var e=a.A,f=a.H,g=a.O,h=a.Aa,l=a.Ba,m=a.R,n=a.T,p=a.W,q=a.Va?1:0,t=a.ha,v=a.cb,u=a.na,y=Math.cos(t),t=Math.sin(t),E=a.a.length,z=a.b.length,G,J,X,A,Ma,ua;for(G=0;G<c;G+=d)Ma=b[G]-a.o[0],ua=b[G+1]-a.o[1],J=z/8,X=-v*e,A=-v*(g-f),a.b[z++]=Ma,a.b[z++]=ua,a.b[z++]=X*y-A*t,a.b[z++]=X*t+A*y,a.b[z++]=n/l,a.b[z++]=(p+g)/h,a.b[z++]=m,a.b[z++]=q,X=v*(u-e),A=-v*(g-f),a.b[z++]=Ma,a.b[z++]=ua,a.b[z++]=X*y-A*t,a.b[z++]=X*t+A*y,a.b[z++]=(n+u)/l,a.b[z++]=(p+g)/h,a.b[z++]=m,a.b[z++]=q,X=v*(u-e),
A=v*f,a.b[z++]=Ma,a.b[z++]=ua,a.b[z++]=X*y-A*t,a.b[z++]=X*t+A*y,a.b[z++]=(n+u)/l,a.b[z++]=p/h,a.b[z++]=m,a.b[z++]=q,X=-v*e,A=v*f,a.b[z++]=Ma,a.b[z++]=ua,a.b[z++]=X*y-A*t,a.b[z++]=X*t+A*y,a.b[z++]=n/l,a.b[z++]=p/h,a.b[z++]=m,a.b[z++]=q,a.a[E++]=J,a.a[E++]=J+1,a.a[E++]=J+2,a.a[E++]=J,a.a[E++]=J+2,a.a[E++]=J+3}nl.prototype.tc=function(a,b){this.g.push(this.a.length);this.s.push(b);var c=a.la();ql(this,c,c.length,a.ua())};
nl.prototype.uc=function(a,b){this.g.push(this.a.length);this.s.push(b);var c=a.la();ql(this,c,c.length,a.ua())};function rl(a,b){var c=b.b;a.U.push(a.a.length);a.i.push(a.a.length);a.v=new cl(a.b);fl(b,34962,a.v);a.j=new cl(a.a);fl(b,34963,a.j);var d={};sl(a.Lb,a.c,d,c);sl(a.l,a.f,d,c);a.A=void 0;a.H=void 0;a.O=void 0;a.c=null;a.f=null;a.Aa=void 0;a.Ba=void 0;a.a=null;a.R=void 0;a.T=void 0;a.W=void 0;a.Va=void 0;a.ha=void 0;a.cb=void 0;a.b=null;a.na=void 0}
function sl(a,b,c,d){var e,f,g,h=b.length;for(g=0;g<h;++g)e=b[g],f=x(e).toString(),f in c?e=c[f]:(e=ml(d,e),c[f]=e),a[g]=e}
nl.prototype.Sa=function(a,b,c,d,e,f,g,h,l,m,n){f=a.b;fl(a,34962,this.v);fl(a,34963,this.j);var p=kl(a,Zk,al),q;this.D?q=this.D:this.D=q=new bl(f,p);a.ve(p);f.enableVertexAttribArray(q.f);f.vertexAttribPointer(q.f,2,5126,!1,32,0);f.enableVertexAttribArray(q.b);f.vertexAttribPointer(q.b,2,5126,!1,32,8);f.enableVertexAttribArray(q.c);f.vertexAttribPointer(q.c,2,5126,!1,32,16);f.enableVertexAttribArray(q.a);f.vertexAttribPointer(q.a,1,5126,!1,32,24);f.enableVertexAttribArray(q.g);f.vertexAttribPointer(q.g,
1,5126,!1,32,28);p=bh(this.Ia);hh(p,2/(c*e[0]),2/(c*e[1]));gh(p,-d);ih(p,-(b[0]-this.o[0]),-(b[1]-this.o[1]));b=bh(this.Ha);hh(b,2/e[0],2/e[1]);e=bh(this.za);0!==d&&gh(e,-d);f.uniformMatrix4fv(q.l,!1,Ye(this.pa,p));f.uniformMatrix4fv(q.o,!1,Ye(this.pa,b));f.uniformMatrix4fv(q.j,!1,Ye(this.pa,e));f.uniform1f(q.i,g);var t;if(void 0===l)tl(this,f,a,h,this.Lb,this.U);else{if(m)a:{d=a.g?5125:5123;a=a.g?4:2;e=this.g.length-1;for(g=this.l.length-1;0<=g;--g)for(f.bindTexture(3553,this.l[g]),m=0<g?this.i[g-
1]:0,b=this.i[g];0<=e&&this.g[e]>=m;){t=this.g[e];c=this.s[e];p=x(c).toString();if(void 0===h[p]&&c.Y()&&(void 0===n||kc(n,c.Y().C()))&&(f.clear(f.COLOR_BUFFER_BIT|f.DEPTH_BUFFER_BIT),f.drawElements(4,b-t,d,t*a),b=l(c))){h=b;break a}b=t;e--}h=void 0}else f.clear(f.COLOR_BUFFER_BIT|f.DEPTH_BUFFER_BIT),tl(this,f,a,h,this.l,this.i),h=(h=l(null))?h:void 0;t=h}f.disableVertexAttribArray(q.f);f.disableVertexAttribArray(q.b);f.disableVertexAttribArray(q.c);f.disableVertexAttribArray(q.a);f.disableVertexAttribArray(q.g);
return t};function tl(a,b,c,d,e,f){var g=c.g?5125:5123;c=c.g?4:2;if(Ca(d)){var h;a=0;d=e.length;for(h=0;a<d;++a){b.bindTexture(3553,e[a]);var l=f[a];b.drawElements(4,l-h,g,h*c);h=l}}else{h=0;var m,l=0;for(m=e.length;l<m;++l){b.bindTexture(3553,e[l]);for(var n=0<l?f[l-1]:0,p=f[l],q=n;h<a.g.length&&a.g[h]<=p;){var t=x(a.s[h]).toString();void 0!==d[t]?(q!==n&&b.drawElements(4,n-q,g,q*c),n=q=h===a.g.length-1?p:a.g[h+1]):n=h===a.g.length-1?p:a.g[h+1];h++}q!==n&&b.drawElements(4,n-q,g,q*c)}}}
nl.prototype.Yb=function(a){var b=a.bc(),c=a.mc(1),d=a.kd(),e=a.ne(1),f=a.v,g=a.Ka(),h=a.U,l=a.o,m=a.Jb();a=a.i;var n;0===this.c.length?this.c.push(c):(n=this.c[this.c.length-1],x(n)!=x(c)&&(this.U.push(this.a.length),this.c.push(c)));0===this.f.length?this.f.push(e):(n=this.f[this.f.length-1],x(n)!=x(e)&&(this.i.push(this.a.length),this.f.push(e)));this.A=b[0];this.H=b[1];this.O=m[1];this.Aa=d[1];this.Ba=d[0];this.R=f;this.T=g[0];this.W=g[1];this.ha=l;this.Va=h;this.cb=a;this.na=m[0]};
function ul(a,b,c){this.c=b;this.i=a;this.f=c;this.a={}}w(ul,Ij);function vl(a,b){var c=[],d;for(d in a.a)c.push(pl(a.a[d],b));return function(){for(var a=c.length,b,d=0;d<a;d++)b=c[d].apply(this,arguments);return b}}function wl(a,b){for(var c in a.a)rl(a.a[c],b)}ul.prototype.b=function(a,b){var c=this.a[b];void 0===c&&(c=new xl[b](this.i,this.c),this.a[b]=c);return c};ul.prototype.g=function(){return Ca(this.a)};
ul.prototype.Sa=function(a,b,c,d,e,f,g,h){var l,m,n;l=0;for(m=Jj.length;l<m;++l)n=this.a[Jj[l]],void 0!==n&&n.Sa(a,b,c,d,e,f,g,h,void 0,!1)};function yl(a,b,c,d,e,f,g,h,l,m,n){var p=zl,q,t;for(q=Jj.length-1;0<=q;--q)if(t=a.a[Jj[q]],void 0!==t&&(t=t.Sa(b,c,d,e,p,f,g,h,l,m,n)))return t}
ul.prototype.ta=function(a,b,c,d,e,f,g,h,l,m){var n=b.b;n.bindFramebuffer(n.FRAMEBUFFER,hl(b));var p;void 0!==this.f&&(p=Gb(Rb(a),d*this.f));return yl(this,b,a,d,e,g,h,l,function(a){var b=new Uint8Array(4);n.readPixels(0,0,1,1,n.RGBA,n.UNSIGNED_BYTE,b);if(0<b[3]&&(a=m(a)))return a},!0,p)};
function Al(a,b,c,d,e,f,g,h){var l=c.b;l.bindFramebuffer(l.FRAMEBUFFER,hl(c));return void 0!==yl(a,c,b,d,e,f,g,h,function(){var a=new Uint8Array(4);l.readPixels(0,0,1,1,l.RGBA,l.UNSIGNED_BYTE,a);return 0<a[3]},!1)}var xl={Image:nl},zl=[1,1];function Bl(a,b,c,d,e,f,g){this.b=a;this.f=b;this.g=f;this.c=g;this.j=e;this.l=d;this.i=c;this.a=null}w(Bl,fj);k=Bl.prototype;k.rd=function(a){this.Yb(a.a)};k.sc=function(a){switch(a.X()){case "Point":this.uc(a,null);break;case "MultiPoint":this.tc(a,null);break;case "GeometryCollection":this.Xe(a,null)}};k.We=function(a,b){var c=(0,b.g)(a);c&&kc(this.g,c.C())&&(this.rd(b),this.sc(c))};k.Xe=function(a){a=a.f;var b,c;b=0;for(c=a.length;b<c;++b)this.sc(a[b])};
k.uc=function(a,b){var c=this.b,d=(new ul(1,this.g)).b(0,"Image");d.Yb(this.a);d.uc(a,b);rl(d,c);d.Sa(this.b,this.f,this.i,this.l,this.j,this.c,1,{},void 0,!1);pl(d,c)()};k.tc=function(a,b){var c=this.b,d=(new ul(1,this.g)).b(0,"Image");d.Yb(this.a);d.tc(a,b);rl(d,c);d.Sa(this.b,this.f,this.i,this.l,this.j,this.c,1,{},void 0,!1);pl(d,c)()};k.Yb=function(a){this.a=a};function Cl(){this.b="precision mediump float;varying vec2 a;uniform float f;uniform sampler2D g;void main(void){vec4 texColor=texture2D(g,a);gl_FragColor.rgb=texColor.rgb;gl_FragColor.a=texColor.a*f;}"}w(Cl,Wk);var Dl=new Cl;function El(){this.b="varying vec2 a;attribute vec2 b;attribute vec2 c;uniform mat4 d;uniform mat4 e;void main(void){gl_Position=e*vec4(b,0.,1.);a=(d*vec4(c,0.,1.)).st;}"}w(El,Xk);var Fl=new El;
function Gl(a,b){this.g=a.getUniformLocation(b,"f");this.f=a.getUniformLocation(b,"e");this.i=a.getUniformLocation(b,"d");this.c=a.getUniformLocation(b,"g");this.b=a.getAttribLocation(b,"b");this.a=a.getAttribLocation(b,"c")};function Hl(a,b){tj.call(this,b);this.f=a;this.T=new cl([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]);this.i=this.rb=null;this.l=void 0;this.s=ah();this.U=ah();this.H=Xe();this.v=null}w(Hl,tj);
function Il(a,b,c){var d=a.f.f;if(void 0===a.l||a.l!=c){b.postRenderFunctions.push(function(a,b,c){a.isContextLost()||(a.deleteFramebuffer(b),a.deleteTexture(c))}.bind(null,d,a.i,a.rb));b=il(d,c,c);var e=d.createFramebuffer();d.bindFramebuffer(36160,e);d.framebufferTexture2D(36160,36064,3553,b,0);a.rb=b;a.i=e;a.l=c}else d.bindFramebuffer(36160,a.i)}
Hl.prototype.sh=function(a,b,c){Jl(this,"precompose",c,a);fl(c,34962,this.T);var d=c.b,e=kl(c,Dl,Fl),f;this.v?f=this.v:this.v=f=new Gl(d,e);c.ve(e)&&(d.enableVertexAttribArray(f.b),d.vertexAttribPointer(f.b,2,5126,!1,16,0),d.enableVertexAttribArray(f.a),d.vertexAttribPointer(f.a,2,5126,!1,16,8),d.uniform1i(f.c,0));d.uniformMatrix4fv(f.i,!1,Ye(this.H,this.s));d.uniformMatrix4fv(f.f,!1,Ye(this.H,this.U));d.uniform1f(f.g,b.opacity);d.bindTexture(3553,this.rb);d.drawArrays(5,0,4);Jl(this,"postcompose",
c,a)};function Jl(a,b,c,d){a=a.a;if(Ta(a,b)){var e=d.viewState;a.b(new Sg(b,new Bl(c,e.center,e.resolution,e.rotation,d.size,d.extent,d.pixelRatio),d,null,c))}}Hl.prototype.yf=function(){this.i=this.rb=null;this.l=void 0};function Kl(a,b){Hl.call(this,a,b);this.o=this.j=this.c=null}w(Kl,Hl);function Ll(a,b){var c=b.a();return ml(a.f.f,c)}Kl.prototype.ta=function(a,b,c,d){var e=this.a;return e.ga().ta(a,b.viewState.resolution,b.viewState.rotation,b.skippedFeatureUids,function(a){return c.call(d,a,e)})};
Kl.prototype.zf=function(a,b){var c=this.f.f,d=a.pixelRatio,e=a.viewState,f=e.center,g=e.resolution,h=e.rotation,l=this.c,m=this.rb,n=this.a.ga(),p=a.viewHints,q=a.extent;void 0!==b.extent&&(q=jc(q,b.extent));p[0]||p[1]||dc(q)||(e=n.A(q,g,d,e.projection))&&wj(this,e)&&(l=e,m=Ll(this,e),this.rb&&a.postRenderFunctions.push(function(a,b){a.isContextLost()||a.deleteTexture(b)}.bind(null,c,this.rb)));l&&(c=this.f.c.l,Ml(this,c.width,c.height,d,f,g,h,l.C()),this.o=null,d=this.s,bh(d),hh(d,1,-1),ih(d,0,
-1),this.c=l,this.rb=m,yj(a.attributions,l.l),zj(a,n));return!0};function Ml(a,b,c,d,e,f,g,h){b*=f;c*=f;a=a.U;bh(a);hh(a,2*d/b,2*d/c);gh(a,-g);ih(a,h[0]-e[0],h[1]-e[1]);hh(a,(h[2]-h[0])/2,(h[3]-h[1])/2);ih(a,1,1)}Kl.prototype.je=function(a,b){return void 0!==this.ta(a,b,nc,this)};
Kl.prototype.Ac=function(a,b,c,d){if(this.c&&this.c.a())if(this.a.ga()instanceof Bk){var e=fh(b.pixelToCoordinateTransform,a.slice());if(this.ta(e,b,nc,this))return c.call(d,this.a,null)}else{e=[this.c.a().width,this.c.a().height];if(!this.o){var f=b.size;b=ah();ih(b,-1,-1);hh(b,2/f[0],2/f[1]);ih(b,0,f[1]);hh(b,1,-1);var f=kh(this.U.slice()),g=ah();ih(g,0,e[1]);hh(g,1,-1);hh(g,e[0]/2,e[1]/2);ih(g,1,1);dh(g,f);dh(g,b);this.o=g}a=fh(this.o,a.slice());if(!(0>a[0]||a[0]>e[0]||0>a[1]||a[1]>e[1])&&(this.j||
(this.j=$e(1,1)),this.j.clearRect(0,0,1,1),this.j.drawImage(this.c.a(),a[0],a[1],1,1,0,0,1,1),e=this.j.getImageData(0,0,1,1).data,0<e[3]))return c.call(d,this.a,e)}};function Nl(){this.b="precision mediump float;varying vec2 a;uniform sampler2D e;void main(void){gl_FragColor=texture2D(e,a);}"}w(Nl,Wk);var Ol=new Nl;function Pl(){this.b="varying vec2 a;attribute vec2 b;attribute vec2 c;uniform vec4 d;void main(void){gl_Position=vec4(b*d.xy+d.zw,0.,1.);a=c;}"}w(Pl,Xk);var Ql=new Pl;function Rl(a,b){this.g=a.getUniformLocation(b,"e");this.f=a.getUniformLocation(b,"d");this.b=a.getAttribLocation(b,"b");this.a=a.getAttribLocation(b,"c")};function Sl(a,b){Hl.call(this,a,b);this.O=Ol;this.W=Ql;this.c=null;this.D=new cl([0,0,0,1,1,0,1,1,0,1,0,0,1,1,1,0]);this.A=this.j=null;this.o=-1;this.R=[0,0]}w(Sl,Hl);k=Sl.prototype;k.ma=function(){gl(this.f.c,this.D);Hl.prototype.ma.call(this)};k.Pd=function(a,b,c){var d=this.f;return function(e,f){return uj(a,b,e,f,function(a){var b=d.a.b.hasOwnProperty(a.Ya());b&&(c[e]||(c[e]={}),c[e][a.oa.toString()]=a);return b})}};k.yf=function(){Hl.prototype.yf.call(this);this.c=null};
k.zf=function(a,b,c){var d=this.f,e=c.b,f=a.viewState,g=f.projection,h=this.a,l=h.ga(),m=l.fb(g),n=m.ec(f.resolution),p=m.$(n),q=l.jf(n,a.pixelRatio,g),t=q[0]/ae(m.Qa(n),this.R)[0],v=p/t,u=a.pixelRatio*l.Ud(g),y=f.center,E;p==f.resolution?(y=Bj(y,p,a.size),E=ic(y,p,f.rotation,a.size)):E=a.extent;p=je(m,E,p);if(this.j&&Xd(this.j,p)&&this.o==l.g)v=this.A;else{var z=[p.ea-p.ca+1,p.ia-p.fa+1],G=pa(Math.max(z[0]*q[0],z[1]*q[1])),z=v*G,J=m.Ka(n),X=J[0]+p.ca*q[0]*v,v=J[1]+p.fa*q[1]*v,v=[X,v,X+z,v+z];Il(this,
a,G);e.viewport(0,0,G,G);e.clearColor(0,0,0,0);e.clear(16384);e.disable(3042);G=kl(c,this.O,this.W);c.ve(G);this.c||(this.c=new Rl(e,G));fl(c,34962,this.D);e.enableVertexAttribArray(this.c.b);e.vertexAttribPointer(this.c.b,2,5126,!1,16,0);e.enableVertexAttribArray(this.c.a);e.vertexAttribPointer(this.c.a,2,5126,!1,16,8);e.uniform1i(this.c.g,0);c={};c[n]={};var A=this.Pd(l,g,c),Ma=h.c(),G=!0,X=Eb(),ua=new Vd(0,0,0,0),M,oa,Wb;for(oa=p.ca;oa<=p.ea;++oa)for(Wb=p.fa;Wb<=p.ia;++Wb){J=l.dc(n,oa,Wb,t,g);
if(void 0!==b.extent&&(M=m.Ea(J.oa,X),!kc(M,b.extent)))continue;M=J.V();M=2==M||4==M||3==M&&!Ma;!M&&J.a&&(J=J.a);M=J.V();if(2==M){if(d.a.b.hasOwnProperty(J.Ya())){c[n][J.oa.toString()]=J;continue}}else if(4==M||3==M&&!Ma)continue;G=!1;M=he(m,J.oa,A,ua,X);M||(J=ie(m,J.oa,ua,X))&&A(n+1,J)}b=Object.keys(c).map(Number);b.sort(ab);for(var A=new Float32Array(4),Ib,Ma=0,ua=b.length;Ma<ua;++Ma)for(Ib in oa=c[b[Ma]],oa)J=oa[Ib],M=m.Ea(J.oa,X),A[0]=2*(M[2]-M[0])/z,A[1]=2*(M[3]-M[1])/z,A[2]=2*(M[0]-v[0])/z-
1,A[3]=2*(M[1]-v[1])/z-1,e.uniform4fv(this.c.f,A),Tl(d,J,q,u*t),e.drawArrays(5,0,4);G?(this.j=p,this.A=v,this.o=l.g):(this.A=this.j=null,this.o=-1,a.animate=!0)}Aj(a.usedTiles,l,n,p);var Jb=d.j;Cj(a,l,m,t,g,E,n,h.f(),function(a){2!=a.V()||d.a.b.hasOwnProperty(a.Ya())||a.Ya()in Jb.a||Jb.c([a,le(m,a.oa),m.$(a.oa[0]),q,u*t])},this);xj(a,l);zj(a,l);e=this.s;bh(e);ih(e,(y[0]-v[0])/(v[2]-v[0]),(y[1]-v[1])/(v[3]-v[1]));0!==f.rotation&&gh(e,f.rotation);hh(e,a.size[0]*f.resolution/(v[2]-v[0]),a.size[1]*f.resolution/
(v[3]-v[1]));ih(e,-.5,-.5);return!0};k.Ac=function(a,b,c,d){if(this.i){a=fh(this.s,[a[0]/b.size[0],(b.size[1]-a[1])/b.size[1]].slice());a=[a[0]*this.l,a[1]*this.l];b=this.f.c.b;b.bindFramebuffer(b.FRAMEBUFFER,this.i);var e=new Uint8Array(4);b.readPixels(a[0],a[1],1,1,b.RGBA,b.UNSIGNED_BYTE,e);if(0<e[3])return c.call(d,this.a,e)}};function Ul(a,b){Hl.call(this,a,b);this.o=!1;this.R=-1;this.O=NaN;this.A=Eb();this.j=this.c=this.D=null}w(Ul,Hl);k=Ul.prototype;k.sh=function(a,b,c){this.j=b;var d=a.viewState,e=this.c;e&&!e.g()&&e.Sa(c,d.center,d.resolution,d.rotation,a.size,a.pixelRatio,b.opacity,b.Oc?a.skippedFeatureUids:{})};k.ma=function(){var a=this.c;a&&(vl(a,this.f.c)(),this.c=null);Hl.prototype.ma.call(this)};
k.ta=function(a,b,c,d){if(this.c&&this.j){var e=b.viewState,f=this.a,g={};return this.c.ta(a,this.f.c,e.center,e.resolution,e.rotation,b.size,b.pixelRatio,this.j.opacity,{},function(a){var b=x(a).toString();if(!(b in g))return g[b]=!0,c.call(d,a,f)})}};k.je=function(a,b){if(this.c&&this.j){var c=b.viewState;return Al(this.c,a,this.f.c,c.resolution,c.rotation,b.pixelRatio,this.j.opacity,b.skippedFeatureUids)}return!1};
k.Ac=function(a,b,c,d){a=fh(b.pixelToCoordinateTransform,a.slice());if(this.je(a,b))return c.call(d,this.a,null)};k.th=function(){vj(this)};
k.zf=function(a,b,c){function d(a){var b,c=a.hc();c?b=c.call(a,m):(c=e.i)&&(b=c(a,m));if(b){if(b){c=!1;if(Array.isArray(b))for(var d=0,f=b.length;d<f;++d)c=fk(q,a,b[d],ek(m,n),this.th,this)||c;else c=fk(q,a,b,ek(m,n),this.th,this)||c;a=c}else a=!1;this.o=this.o||a}}var e=this.a;b=e.ga();yj(a.attributions,b.l);zj(a,b);var f=a.viewHints[0],g=a.viewHints[1],h=e.R,l=e.T;if(!this.o&&!h&&f||!l&&g)return!0;var g=a.extent,h=a.viewState,f=h.projection,m=h.resolution,n=a.pixelRatio,h=e.g,p=e.a,l=ej(e);void 0===
l&&(l=dk);g=Gb(g,p*m);if(!this.o&&this.O==m&&this.R==h&&this.D==l&&Nb(this.A,g))return!0;this.c&&a.postRenderFunctions.push(vl(this.c,c));this.o=!1;var q=new ul(.5*m/n,g,e.a);b.Nc(g,m,f);if(l){var t=[];b.xb(g,function(a){t.push(a)},this);t.sort(l);t.forEach(d,this)}else b.xb(g,d,this);wl(q,c);this.O=m;this.R=h;this.D=l;this.A=g;this.c=q;return!0};function Vl(){this.f=0;this.b={};this.g=this.a=null}k=Vl.prototype;k.clear=function(){this.f=0;this.b={};this.g=this.a=null};k.forEach=function(a,b){for(var c=this.a;c;)a.call(b,c.Fc,c.fc,this),c=c.Cb};k.get=function(a){a=this.b[a];la(void 0!==a,15);if(a===this.g)return a.Fc;a===this.a?(this.a=this.a.Cb,this.a.Sc=null):(a.Cb.Sc=a.Sc,a.Sc.Cb=a.Cb);a.Cb=null;a.Sc=this.g;this.g=this.g.Cb=a;return a.Fc};
k.pop=function(){var a=this.a;delete this.b[a.fc];a.Cb&&(a.Cb.Sc=null);this.a=a.Cb;this.a||(this.g=null);--this.f;return a.Fc};k.replace=function(a,b){this.get(a);this.b[a].Fc=b};k.set=function(a,b){la(!(a in this.b),16);var c={fc:a,Cb:null,Sc:this.g,Fc:b};this.g?this.g.Cb=c:this.a=c;this.g=c;this.b[a]=c;++this.f};function Wl(a,b){lh.call(this,0,b);this.b=document.createElement("CANVAS");this.b.style.width="100%";this.b.style.height="100%";this.b.className="ol-unselectable";a.insertBefore(this.b,a.childNodes[0]||null);this.U=this.A=0;this.H=$e();this.o=!0;this.f=Ef(this.b,{antialias:!0,depth:!1,failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,stencil:!0});this.c=new el(this.b,this.f);B(this.b,"webglcontextlost",this.Km,this);B(this.b,"webglcontextrestored",this.Lm,this);this.a=new Vl;this.v=null;this.j=
new sh(function(a){var b=a[1];a=a[2];var e=b[0]-this.v[0],b=b[1]-this.v[1];return 65536*Math.log(a)+Math.sqrt(e*e+b*b)/a}.bind(this),function(a){return a[0].Ya()});this.D=function(){if(0!==this.j.b.length){wh(this.j);var a=th(this.j);Tl(this,a[0],a[3],a[4])}return!1}.bind(this);this.l=0;Xl(this)}w(Wl,lh);
function Tl(a,b,c,d){var e=a.f,f=b.Ya();if(a.a.b.hasOwnProperty(f))a=a.a.get(f),e.bindTexture(3553,a.rb),9729!=a.Tg&&(e.texParameteri(3553,10240,9729),a.Tg=9729),9729!=a.Vg&&(e.texParameteri(3553,10241,9729),a.Vg=9729);else{var g=e.createTexture();e.bindTexture(3553,g);if(0<d){var h=a.H.canvas,l=a.H;a.A!==c[0]||a.U!==c[1]?(h.width=c[0],h.height=c[1],a.A=c[0],a.U=c[1]):l.clearRect(0,0,c[0],c[1]);l.drawImage(b.ab(),d,d,c[0],c[1],0,0,c[0],c[1]);e.texImage2D(3553,0,6408,6408,5121,h)}else e.texImage2D(3553,
0,6408,6408,5121,b.ab());e.texParameteri(3553,10240,9729);e.texParameteri(3553,10241,9729);e.texParameteri(3553,10242,33071);e.texParameteri(3553,10243,33071);a.a.set(f,{rb:g,Tg:9729,Vg:9729})}}k=Wl.prototype;k.Ve=function(a){return a instanceof Ji?new Kl(this,a):a instanceof Ki?new Sl(this,a):a instanceof F?new Ul(this,a):null};function Yl(a,b,c){var d=a.i;if(Ta(d,b)){a=a.c;var e=c.viewState;d.b(new Sg(b,new Bl(a,e.center,e.resolution,e.rotation,c.size,c.extent,c.pixelRatio),c,null,a))}}
k.ma=function(){var a=this.f;a.isContextLost()||this.a.forEach(function(b){b&&a.deleteTexture(b.rb)});Oa(this.c);lh.prototype.ma.call(this)};k.Dj=function(a,b){for(var c=this.f,d;1024<this.a.f-this.l;){if(d=this.a.a.Fc)c.deleteTexture(d.rb);else if(+this.a.a.fc==b.index)break;else--this.l;this.a.pop()}};k.X=function(){return"webgl"};k.Km=function(a){a.preventDefault();this.a.clear();this.l=0;a=this.g;for(var b in a)a[b].yf()};k.Lm=function(){Xl(this);this.i.render()};
function Xl(a){a=a.f;a.activeTexture(33984);a.blendFuncSeparate(770,771,1,771);a.disable(2884);a.disable(2929);a.disable(3089);a.disable(2960)}
k.Be=function(a){var b=this.c,c=this.f;if(c.isContextLost())return!1;if(!a)return this.o&&(this.b.style.display="none",this.o=!1),!1;this.v=a.focus;this.a.set((-a.index).toString(),null);++this.l;Yl(this,"precompose",a);var d=[],e=a.layerStatesArray;ib(e);var f=a.viewState.resolution,g,h,l,m;g=0;for(h=e.length;g<h;++g)m=e[g],Xg(m,f)&&"ready"==m.O&&(l=oh(this,m.layer),l.zf(a,m,b)&&d.push(m));e=a.size[0]*a.pixelRatio;f=a.size[1]*a.pixelRatio;if(this.b.width!=e||this.b.height!=f)this.b.width=e,this.b.height=
f;c.bindFramebuffer(36160,null);c.clearColor(0,0,0,0);c.clear(16384);c.enable(3042);c.viewport(0,0,this.b.width,this.b.height);g=0;for(h=d.length;g<h;++g)m=d[g],l=oh(this,m.layer),l.sh(a,m,b);this.o||(this.b.style.display="",this.o=!0);mh(a);1024<this.a.f-this.l&&a.postRenderFunctions.push(this.Dj.bind(this));0!==this.j.b.length&&(a.postRenderFunctions.push(this.D),a.animate=!0);Yl(this,"postcompose",a);ph(this,a);a.postRenderFunctions.push(nh)};
k.ta=function(a,b,c,d,e,f){var g;if(this.f.isContextLost())return!1;var h=b.viewState,l=b.layerStatesArray,m;for(m=l.length-1;0<=m;--m){g=l[m];var n=g.layer;if(Xg(g,h.resolution)&&e.call(f,n)&&(g=oh(this,n).ta(a,b,c,d)))return g}};k.ph=function(a,b,c,d){var e=!1;if(this.f.isContextLost())return!1;var f=b.viewState,g=b.layerStatesArray,h;for(h=g.length-1;0<=h;--h){var l=g[h],m=l.layer;if(Xg(l,f.resolution)&&c.call(d,m)&&(e=oh(this,m).je(a,b)))return!0}return e};
k.oh=function(a,b,c,d,e){if(this.f.isContextLost())return!1;var f=b.viewState,g,h=b.layerStatesArray,l;for(l=h.length-1;0<=l;--l){g=h[l];var m=g.layer;if(Xg(g,f.resolution)&&e.call(d,m)&&(g=oh(this,m).Ac(a,b,c,d)))return g}};var Zl=["canvas","webgl","dom"];
function I(a){Xa.call(this);var b=$l(a);this.tb=void 0!==a.loadTilesWhileAnimating?a.loadTilesWhileAnimating:!1;this.Mb=void 0!==a.loadTilesWhileInteracting?a.loadTilesWhileInteracting:!1;this.Ne=void 0!==a.pixelRatio?a.pixelRatio:Kf;this.Me=b.logos;this.W=function(){this.i=void 0;this.Ro.call(this,Date.now())}.bind(this);this.Ia=ah();this.Ke=ah();this.sb=0;this.f=null;this.Ha=Eb();this.D=this.R=null;this.a=document.createElement("DIV");this.a.className="ol-viewport"+(Pf?" ol-touch":"");this.a.style.position=
"relative";this.a.style.overflow="hidden";this.a.style.width="100%";this.a.style.height="100%";this.a.style.msTouchAction="none";this.a.style.touchAction="none";this.A=document.createElement("DIV");this.A.className="ol-overlaycontainer";this.a.appendChild(this.A);this.v=document.createElement("DIV");this.v.className="ol-overlaycontainer-stopevent";a=["click","dblclick","mousedown","touchstart","mspointerdown",Mg,"mousewheel","wheel"];for(var c=0,d=a.length;c<d;++c)B(this.v,a[c],Qa);this.a.appendChild(this.v);
this.pa=new Eg(this);for(var e in Pg)B(this.pa,Pg[e],this.Ng,this);this.ha=b.keyboardEventTarget;this.s=null;B(this.a,"wheel",this.Mc,this);B(this.a,"mousewheel",this.Mc,this);this.j=b.controls;this.l=b.interactions;this.o=b.overlays;this.Bf={};this.H=new b.To(this.a,this);this.T=null;this.O=[];this.za=[];this.na=new xh(this.yk.bind(this),this.cl.bind(this));this.De={};B(this,Za("layergroup"),this.Lk,this);B(this,Za("view"),this.dl,this);B(this,Za("size"),this.$k,this);B(this,Za("target"),this.bl,
this);this.G(b.values);this.j.forEach(function(a){a.setMap(this)},this);B(this.j,ue,function(a){a.element.setMap(this)},this);B(this.j,ve,function(a){a.element.setMap(null)},this);this.l.forEach(function(a){a.setMap(this)},this);B(this.l,ue,function(a){a.element.setMap(this)},this);B(this.l,ve,function(a){a.element.setMap(null)},this);this.o.forEach(this.lg,this);B(this.o,ue,function(a){this.lg(a.element)},this);B(this.o,ve,function(a){var b=a.element.Oa();void 0!==b&&delete this.Bf[b.toString()];
a.element.setMap(null)},this)}w(I,Xa);k=I.prototype;k.qj=function(a){this.j.push(a)};k.rj=function(a){this.l.push(a)};k.jg=function(a){this.wc().Rc().push(a)};k.kg=function(a){this.o.push(a)};k.lg=function(a){var b=a.Oa();void 0!==b&&(this.Bf[b.toString()]=a);a.setMap(this)};k.$a=function(a){this.render();Array.prototype.push.apply(this.O,arguments)};
k.ma=function(){Oa(this.pa);Oa(this.H);Ka(this.a,"wheel",this.Mc,this);Ka(this.a,"mousewheel",this.Mc,this);void 0!==this.c&&(ja.removeEventListener("resize",this.c,!1),this.c=void 0);this.i&&(ja.cancelAnimationFrame(this.i),this.i=void 0);this.bh(null);Xa.prototype.ma.call(this)};k.Rd=function(a,b,c,d,e){if(this.f)return a=this.Na(a),this.H.ta(a,this.f,b,void 0!==c?c:null,void 0!==d?d:nc,void 0!==e?e:null)};
k.Ol=function(a,b,c,d,e){if(this.f)return this.H.oh(a,this.f,b,void 0!==c?c:null,void 0!==d?d:nc,void 0!==e?e:null)};k.fl=function(a,b,c){if(!this.f)return!1;a=this.Na(a);return this.H.ph(a,this.f,void 0!==b?b:nc,void 0!==c?c:null)};k.Tj=function(a){return this.Na(this.Td(a))};k.Td=function(a){var b=this.a.getBoundingClientRect();a=a.changedTouches?a.changedTouches[0]:a;return[a.clientX-b.left,a.clientY-b.top]};k.sf=function(){return this.get("target")};
k.xc=function(){var a=this.sf();return void 0!==a?"string"===typeof a?document.getElementById(a):a:null};k.Na=function(a){var b=this.f;return b?fh(b.pixelToCoordinateTransform,a.slice()):null};k.Rj=function(){return this.j};k.kk=function(){return this.o};k.jk=function(a){a=this.Bf[a.toString()];return void 0!==a?a:null};k.Yj=function(){return this.l};k.wc=function(){return this.get("layergroup")};k.ah=function(){return this.wc().Rc()};
k.Ga=function(a){var b=this.f;return b?fh(b.coordinateToPixelTransform,a.slice(0,2)):null};k.kb=function(){return this.get("size")};k.aa=function(){return this.get("view")};k.Ak=function(){return this.a};k.yk=function(a,b,c,d){var e=this.f;if(!(e&&b in e.wantedTiles&&e.wantedTiles[b][a.Ya()]))return Infinity;a=c[0]-e.focus[0];c=c[1]-e.focus[1];return 65536*Math.log(d)+Math.sqrt(a*a+c*c)/d};k.Mc=function(a,b){var c=new Cg(b||a.type,this,a);this.Ng(c)};
k.Ng=function(a){if(this.f){this.T=a.coordinate;a.frameState=this.f;var b=this.l.a,c;if(!1!==this.b(a))for(c=b.length-1;0<=c;c--){var d=b[c];if(d.f()&&!d.handleEvent(a))break}}};k.Yk=function(){var a=this.f,b=this.na;if(0!==b.b.length){var c=16,d=c;if(a){var e=a.viewHints;e[0]&&(c=this.tb?8:0,d=2);e[1]&&(c=this.Mb?8:0,d=2)}b.l<c&&(wh(b),yh(b,c,d))}b=this.za;c=0;for(d=b.length;c<d;++c)b[c](this,a);b.length=0};k.$k=function(){this.render()};
k.bl=function(){var a;this.sf()&&(a=this.xc());if(this.s){for(var b=0,c=this.s.length;b<c;++b)Ea(this.s[b]);this.s=null}a?(a.appendChild(this.a),a=this.ha?this.ha:a,this.s=[B(a,"keydown",this.Mc,this),B(a,"keypress",this.Mc,this)],this.c||(this.c=this.Wc.bind(this),ja.addEventListener("resize",this.c,!1))):(ff(this.a),void 0!==this.c&&(ja.removeEventListener("resize",this.c,!1),this.c=void 0));this.Wc()};k.cl=function(){this.render()};k.el=function(){this.render()};
k.dl=function(){this.R&&(Ea(this.R),this.R=null);var a=this.aa();a&&(this.R=B(a,"propertychange",this.el,this));this.render()};k.Lk=function(){this.D&&(this.D.forEach(Ea),this.D=null);var a=this.wc();a&&(this.D=[B(a,"propertychange",this.render,this),B(a,"change",this.render,this)]);this.render()};k.So=function(){this.i&&ja.cancelAnimationFrame(this.i);this.W()};k.render=function(){void 0===this.i&&(this.i=ja.requestAnimationFrame(this.W))};k.Lo=function(a){return this.j.remove(a)};k.Mo=function(a){return this.l.remove(a)};
k.Oo=function(a){return this.wc().Rc().remove(a)};k.Po=function(a){return this.o.remove(a)};
k.Ro=function(a){var b,c,d,e=this.kb(),f=this.aa(),g=Eb(),h=null;if(void 0!==e&&0<e[0]&&0<e[1]&&f&&Jd(f)){var h=Fd(f,this.f?this.f.viewHints:void 0),l=this.wc().ff(),m={};b=0;for(c=l.length;b<c;++b)m[x(l[b].layer)]=l[b];d=f.V();h={animate:!1,attributions:{},coordinateToPixelTransform:this.Ia,extent:g,focus:this.T?this.T:d.center,index:this.sb++,layerStates:m,layerStatesArray:l,logos:za({},this.Me),pixelRatio:this.Ne,pixelToCoordinateTransform:this.Ke,postRenderFunctions:[],size:e,skippedFeatureUids:this.De,
tileQueue:this.na,time:a,usedTiles:{},viewState:d,viewHints:h,wantedTiles:{}}}if(h){a=this.O;b=e=0;for(c=a.length;b<c;++b)f=a[b],f(this,h)&&(a[e++]=f);a.length=e;h.extent=ic(d.center,d.resolution,d.rotation,h.size,g)}this.f=h;this.H.Be(h);h&&(h.animate&&this.render(),Array.prototype.push.apply(this.za,h.postRenderFunctions),0!==this.O.length||h.viewHints[0]||h.viewHints[1]||Ub(h.extent,this.Ha)||(this.b(new hf("moveend",this,h)),Hb(h.extent,this.Ha)));this.b(new hf("postrender",this,h));Af(this.Yk,
this)};k.gi=function(a){this.set("layergroup",a)};k.Vf=function(a){this.set("size",a)};k.bh=function(a){this.set("target",a)};k.hp=function(a){this.set("view",a)};k.pi=function(a){a=x(a).toString();this.De[a]=!0;this.render()};
k.Wc=function(){var a=this.xc();if(a){var b=ja.getComputedStyle(a);this.Vf([a.offsetWidth-parseFloat(b.borderLeftWidth)-parseFloat(b.paddingLeft)-parseFloat(b.paddingRight)-parseFloat(b.borderRightWidth),a.offsetHeight-parseFloat(b.borderTopWidth)-parseFloat(b.paddingTop)-parseFloat(b.paddingBottom)-parseFloat(b.borderBottomWidth)])}else this.Vf(void 0)};k.ti=function(a){a=x(a).toString();delete this.De[a];this.render()};
function $l(a){var b=null;void 0!==a.keyboardEventTarget&&(b="string"===typeof a.keyboardEventTarget?document.getElementById(a.keyboardEventTarget):a.keyboardEventTarget);var c={},d={};if(void 0===a.logo||"boolean"===typeof a.logo&&a.logo)d["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAHGAAABxgEXwfpGAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAhNQTFRF////AP//AICAgP//AFVVQECA////K1VVSbbbYL/fJ05idsTYJFtbbcjbJllmZszWWMTOIFhoHlNiZszTa9DdUcHNHlNlV8XRIVdiasrUHlZjIVZjaMnVH1RlIFRkH1RkH1ZlasvYasvXVsPQH1VkacnVa8vWIVZjIFRjVMPQa8rXIVVkXsXRsNveIFVkIFZlIVVj3eDeh6GmbMvXH1ZkIFRka8rWbMvXIFVkIFVjIFVkbMvWH1VjbMvWIFVlbcvWIFVla8vVIFVkbMvWbMvVH1VkbMvWIFVlbcvWIFVkbcvVbMvWjNPbIFVkU8LPwMzNIFVkbczWIFVkbsvWbMvXIFVkRnB8bcvW2+TkW8XRIFVkIlZlJVloJlpoKlxrLl9tMmJwOWd0Omh1RXF8TneCT3iDUHiDU8LPVMLPVcLPVcPQVsPPVsPQV8PQWMTQWsTQW8TQXMXSXsXRX4SNX8bSYMfTYcfTYsfTY8jUZcfSZsnUaIqTacrVasrVa8jTa8rWbI2VbMvWbcvWdJObdcvUdszUd8vVeJaee87Yfc3WgJyjhqGnitDYjaarldPZnrK2oNbborW5o9bbo9fbpLa6q9ndrL3ArtndscDDutzfu8fJwN7gwt7gxc/QyuHhy+HizeHi0NfX0+Pj19zb1+Tj2uXk29/e3uLg3+Lh3+bl4uXj4ufl4+fl5Ofl5ufl5ujm5+jmySDnBAAAAFp0Uk5TAAECAgMEBAYHCA0NDg4UGRogIiMmKSssLzU7PkJJT1JTVFliY2hrdHZ3foSFhYeJjY2QkpugqbG1tre5w8zQ09XY3uXn6+zx8vT09vf4+Pj5+fr6/P39/f3+gz7SsAAAAVVJREFUOMtjYKA7EBDnwCPLrObS1BRiLoJLnte6CQy8FLHLCzs2QUG4FjZ5GbcmBDDjxJBXDWxCBrb8aM4zbkIDzpLYnAcE9VXlJSWlZRU13koIeW57mGx5XjoMZEUqwxWYQaQbSzLSkYGfKFSe0QMsX5WbjgY0YS4MBplemI4BdGBW+DQ11eZiymfqQuXZIjqwyadPNoSZ4L+0FVM6e+oGI6g8a9iKNT3o8kVzNkzRg5lgl7p4wyRUL9Yt2jAxVh6mQCogae6GmflI8p0r13VFWTHBQ0rWPW7ahgWVcPm+9cuLoyy4kCJDzCm6d8PSFoh0zvQNC5OjDJhQopPPJqph1doJBUD5tnkbZiUEqaCnB3bTqLTFG1bPn71kw4b+GFdpLElKIzRxxgYgWNYc5SCENVHKeUaltHdXx0dZ8uBI1hJ2UUDgq82CM2MwKeibqAvSO7MCABq0wXEPiqWEAAAAAElFTkSuQmCC"]=
"http://openlayers.org/";else{var e=a.logo;"string"===typeof e?d[e]="":e instanceof HTMLElement?d[x(e).toString()]=e:e&&(la("string"==typeof e.href,44),la("string"==typeof e.src,45),d[e.src]=e.href)}e=a.layers instanceof zi?a.layers:new zi({layers:a.layers});c.layergroup=e;c.target=a.target;c.view=void 0!==a.view?a.view:new Bd;var e=lh,f;void 0!==a.renderer?Array.isArray(a.renderer)?f=a.renderer:"string"===typeof a.renderer?f=[a.renderer]:la(!1,46):f=Zl;var g,h;g=0;for(h=f.length;g<h;++g){var l=f[g];
if("canvas"==l){if(Mf){e=Lk;break}}else if("dom"==l){e=Tk;break}else if("webgl"==l&&Ff){e=Wl;break}}void 0!==a.controls?Array.isArray(a.controls)?f=new re(a.controls.slice()):(la(a.controls instanceof re,47),f=a.controls):f=wf();void 0!==a.interactions?Array.isArray(a.interactions)?g=new re(a.interactions.slice()):(la(a.interactions instanceof re,48),g=a.interactions):g=yi();void 0!==a.overlays?Array.isArray(a.overlays)?a=new re(a.overlays.slice()):(la(a.overlays instanceof re,49),a=a.overlays):a=
new re;return{controls:f,interactions:g,keyboardEventTarget:b,logos:d,overlays:a,To:e,values:c}}Ii();function am(a){Xa.call(this);this.o=a.id;this.j=void 0!==a.insertFirst?a.insertFirst:!0;this.s=void 0!==a.stopEvent?a.stopEvent:!0;this.f=document.createElement("DIV");this.f.className="ol-overlay-container";this.f.style.position="absolute";this.autoPan=void 0!==a.autoPan?a.autoPan:!1;this.i=void 0!==a.autoPanAnimation?a.autoPanAnimation:{};this.l=void 0!==a.autoPanMargin?a.autoPanMargin:20;this.a={Ld:"",de:"",Ce:"",Ee:"",visible:!0};this.c=null;B(this,Za("element"),this.Gk,this);B(this,Za("map"),
this.Qk,this);B(this,Za("offset"),this.Uk,this);B(this,Za("position"),this.Wk,this);B(this,Za("positioning"),this.Xk,this);void 0!==a.element&&this.ci(a.element);this.ii(void 0!==a.offset?a.offset:[0,0]);this.li(void 0!==a.positioning?a.positioning:"top-left");void 0!==a.position&&this.tf(a.position)}w(am,Xa);k=am.prototype;k.Sd=function(){return this.get("element")};k.Oa=function(){return this.o};k.fe=function(){return this.get("map")};k.Ig=function(){return this.get("offset")};k.dh=function(){return this.get("position")};
k.Jg=function(){return this.get("positioning")};k.Gk=function(){gf(this.f);var a=this.Sd();a&&this.f.appendChild(a)};k.Qk=function(){this.c&&(ff(this.f),Ea(this.c),this.c=null);var a=this.fe();a&&(this.c=B(a,"postrender",this.render,this),bm(this),a=this.s?a.v:a.A,this.j?a.insertBefore(this.f,a.childNodes[0]||null):a.appendChild(this.f))};k.render=function(){bm(this)};k.Uk=function(){bm(this)};
k.Wk=function(){bm(this);if(void 0!==this.get("position")&&this.autoPan){var a=this.fe();if(void 0!==a&&a.xc()){var b=cm(a.xc(),a.kb()),c=this.Sd(),d=c.offsetWidth,e=c.currentStyle||ja.getComputedStyle(c),d=d+(parseInt(e.marginLeft,10)+parseInt(e.marginRight,10)),e=c.offsetHeight,f=c.currentStyle||ja.getComputedStyle(c),e=e+(parseInt(f.marginTop,10)+parseInt(f.marginBottom,10)),g=cm(c,[d,e]),c=this.l;Nb(b,g)||(d=g[0]-b[0],e=b[2]-g[2],f=g[1]-b[1],g=b[3]-g[3],b=[0,0],0>d?b[0]=d-c:0>e&&(b[0]=Math.abs(e)+
c),0>f?b[1]=f-c:0>g&&(b[1]=Math.abs(g)+c),0===b[0]&&0===b[1])||(c=a.aa().bb(),d=a.Ga(c),b=[d[0]+b[0],d[1]+b[1]],this.i&&(this.i.source=c,a.$a(Sd(this.i))),a.aa().ob(a.Na(b)))}}};k.Xk=function(){bm(this)};k.ci=function(a){this.set("element",a)};k.setMap=function(a){this.set("map",a)};k.ii=function(a){this.set("offset",a)};k.tf=function(a){this.set("position",a)};function cm(a,b){var c=a.getBoundingClientRect(),d=c.left+ja.pageXOffset,c=c.top+ja.pageYOffset;return[d,c,d+b[0],c+b[1]]}
k.li=function(a){this.set("positioning",a)};function dm(a,b){a.a.visible!==b&&(a.f.style.display=b?"":"none",a.a.visible=b)}
function bm(a){var b=a.fe(),c=a.dh();if(void 0!==b&&b.f&&void 0!==c){var c=b.Ga(c),d=b.kb(),b=a.f.style,e=a.Ig(),f=a.Jg(),g=e[0],e=e[1];if("bottom-right"==f||"center-right"==f||"top-right"==f)""!==a.a.de&&(a.a.de=b.left=""),g=Math.round(d[0]-c[0]-g)+"px",a.a.Ce!=g&&(a.a.Ce=b.right=g);else{""!==a.a.Ce&&(a.a.Ce=b.right="");if("bottom-center"==f||"center-center"==f||"top-center"==f)g-=a.f.offsetWidth/2;g=Math.round(c[0]+g)+"px";a.a.de!=g&&(a.a.de=b.left=g)}if("bottom-left"==f||"bottom-center"==f||"bottom-right"==
f)""!==a.a.Ee&&(a.a.Ee=b.top=""),c=Math.round(d[1]-c[1]-e)+"px",a.a.Ld!=c&&(a.a.Ld=b.bottom=c);else{""!==a.a.Ld&&(a.a.Ld=b.bottom="");if("center-left"==f||"center-center"==f||"center-right"==f)e-=a.f.offsetHeight/2;c=Math.round(c[1]+e)+"px";a.a.Ee!=c&&(a.a.Ee=b.top=c)}dm(a,!0)}else dm(a,!1)};function em(a){a=a?a:{};this.l=void 0!==a.collapsed?a.collapsed:!0;this.j=void 0!==a.collapsible?a.collapsible:!0;this.j||(this.l=!1);var b=void 0!==a.className?a.className:"ol-overviewmap",c=void 0!==a.tipLabel?a.tipLabel:"Overview map",d=void 0!==a.collapseLabel?a.collapseLabel:"\u00ab";"string"===typeof d?(this.o=document.createElement("span"),this.o.textContent=d):this.o=d;d=void 0!==a.label?a.label:"\u00bb";"string"===typeof d?(this.v=document.createElement("span"),this.v.textContent=d):this.v=
d;var e=this.j&&!this.l?this.o:this.v,d=document.createElement("button");d.setAttribute("type","button");d.title=c;d.appendChild(e);B(d,"click",this.bm,this);c=document.createElement("DIV");c.className="ol-overviewmap-map";var f=this.f=new I({controls:new re,interactions:new re,target:c,view:a.view});a.layers&&a.layers.forEach(function(a){f.jg(a)},this);e=document.createElement("DIV");e.className="ol-overviewmap-box";e.style.boxSizing="border-box";this.A=new am({position:[0,0],positioning:"bottom-left",
element:e});this.f.kg(this.A);e=document.createElement("div");e.className=b+" ol-unselectable ol-control"+(this.l&&this.j?" ol-collapsed":"")+(this.j?"":" ol-uncollapsible");e.appendChild(c);e.appendChild(d);jf.call(this,{element:e,render:a.render?a.render:fm,target:a.target})}w(em,jf);k=em.prototype;
k.setMap=function(a){var b=this.a;a!==b&&(b&&(b=b.aa())&&Ka(b,Za(Ed),this.be,this),jf.prototype.setMap.call(this,a),a&&(this.s.push(B(a,"propertychange",this.Rk,this)),0===this.f.ah().gc()&&this.f.gi(a.wc()),a=a.aa()))&&(B(a,Za(Ed),this.be,this),Jd(a)&&(this.f.Wc(),gm(this)))};k.Rk=function(a){"view"===a.key&&((a=a.oldValue)&&Ka(a,Za(Ed),this.be,this),a=this.a.aa(),B(a,Za(Ed),this.be,this))};k.be=function(){this.f.aa().ge(this.a.aa().Ma())};
function fm(){var a=this.a,b=this.f;if(a.f&&b.f){var c=a.kb(),a=a.aa().Ic(c),d=b.kb(),c=b.aa().Ic(d),e=b.Ga(bc(a)),f=b.Ga($b(a)),b=Math.abs(e[0]-f[0]),e=Math.abs(e[1]-f[1]),f=d[0],d=d[1];b<.1*f||e<.1*d||b>.75*f||e>.75*d?gm(this):Nb(c,a)||(a=this.f,c=this.a.aa(),a.aa().ob(c.bb()))}hm(this)}function gm(a){var b=a.a;a=a.f;var c=b.kb(),b=b.aa().Ic(c),c=a.kb();a=a.aa();lc(b,1/(.1*Math.pow(2,Math.log(7.5)/Math.LN2/2)));a.af(b,c)}
function hm(a){var b=a.a,c=a.f;if(b.f&&c.f){var d=b.kb(),e=b.aa(),f=c.aa(),c=e.Ma(),b=a.A,g=a.A.Sd(),h=e.Ic(d),d=f.$(),e=Zb(h),f=ac(h),l;if(a=a.a.aa().bb())l=[e[0]-a[0],e[1]-a[1]],zb(l,c),ub(l,a);b.tf(l);g&&(g.style.width=Math.abs((e[0]-f[0])/d)+"px",g.style.height=Math.abs((f[1]-e[1])/d)+"px")}}k.bm=function(a){a.preventDefault();im(this)};
function im(a){a.element.classList.toggle("ol-collapsed");a.l?ef(a.o,a.v):ef(a.v,a.o);a.l=!a.l;var b=a.f;a.l||b.f||(b.Wc(),gm(a),Ja(b,"postrender",function(){hm(this)},a))}k.am=function(){return this.j};k.dm=function(a){this.j!==a&&(this.j=a,this.element.classList.toggle("ol-uncollapsible"),!a&&this.l&&im(this))};k.cm=function(a){this.j&&this.l!==a&&im(this)};k.$l=function(){return this.l};k.lk=function(){return this.f};function jm(a){a=a?a:{};var b=void 0!==a.className?a.className:"ol-scale-line";this.j=document.createElement("DIV");this.j.className=b+"-inner";this.f=document.createElement("DIV");this.f.className=b+" ol-unselectable";this.f.appendChild(this.j);this.v=null;this.o=void 0!==a.minWidth?a.minWidth:64;this.l=!1;this.H=void 0;this.A="";jf.call(this,{element:this.f,render:a.render?a.render:km,target:a.target});B(this,Za(lm),this.O,this);this.D(a.units||mm)}w(jm,jf);var nm=[1,2,5];jm.prototype.Ab=function(){return this.get(lm)};
function km(a){(a=a.frameState)?this.v=a.viewState:this.v=null;om(this)}jm.prototype.O=function(){om(this)};jm.prototype.D=function(a){this.set(lm,a)};
function om(a){var b=a.v;if(b){var c=b.projection,d=c.cc(),b=c.getPointResolution(b.resolution,b.center)*d,d=a.o*b,c="",e=a.Ab();e==pm?(c=rc.degrees,b/=c,d<c/60?(c="\u2033",b*=3600):d<c?(c="\u2032",b*=60):c="\u00b0"):e==qm?.9144>d?(c="in",b/=.0254):1609.344>d?(c="ft",b/=.3048):(c="mi",b/=1609.344):e==rm?(b/=1852,c="nm"):e==mm?1>d?(c="mm",b*=1E3):1E3>d?c="m":(c="km",b/=1E3):e==sm?.9144>d?(c="in",b*=39.37):1609.344>d?(c="ft",b/=.30480061):(c="mi",b/=1609.3472):la(!1,33);for(var e=3*Math.floor(Math.log(a.o*
b)/Math.log(10)),f;;){f=nm[(e%3+3)%3]*Math.pow(10,Math.floor(e/3));d=Math.round(f/b);if(isNaN(d)){a.f.style.display="none";a.l=!1;return}if(d>=a.o)break;++e}b=f+" "+c;a.A!=b&&(a.j.innerHTML=b,a.A=b);a.H!=d&&(a.j.style.width=d+"px",a.H=d);a.l||(a.f.style.display="",a.l=!0)}else a.l&&(a.f.style.display="none",a.l=!1)}var lm="units",pm="degrees",qm="imperial",rm="nautical",mm="metric",sm="us";function tm(a){a=a?a:{};this.f=void 0;this.l=um;this.v=[];this.H=this.o=0;this.T=null;this.ha=!1;this.W=void 0!==a.duration?a.duration:200;var b=void 0!==a.className?a.className:"ol-zoomslider",c=document.createElement("button");c.setAttribute("type","button");c.className=b+"-thumb ol-unselectable";var d=document.createElement("div");d.className=b+" ol-unselectable ol-control";d.appendChild(c);this.j=new wg(d);B(this.j,cg,this.Fk,this);B(this.j,dg,this.Lg,this);B(this.j,eg,this.Mg,this);B(d,"click",
this.Ek,this);B(c,"click",Qa);jf.call(this,{element:d,render:a.render?a.render:vm})}w(tm,jf);tm.prototype.ma=function(){Oa(this.j);jf.prototype.ma.call(this)};var um=0;k=tm.prototype;k.setMap=function(a){jf.prototype.setMap.call(this,a);a&&a.render()};
function vm(a){if(a.frameState){if(!this.ha){var b=this.element,c=b.offsetWidth,d=b.offsetHeight,e=b.firstElementChild,f=ja.getComputedStyle(e),b=e.offsetWidth+parseFloat(f.marginRight)+parseFloat(f.marginLeft),e=e.offsetHeight+parseFloat(f.marginTop)+parseFloat(f.marginBottom);this.T=[b,e];c>d?(this.l=1,this.H=c-b):(this.l=um,this.o=d-e);this.ha=!0}a=a.frameState.viewState.resolution;a!==this.f&&(this.f=a,wm(this,a))}}
k.Ek=function(a){var b=this.a,c=b.aa(),d=c.$();b.$a(Ud({resolution:d,duration:this.W,easing:Md}));a=xm(this,ma(1===this.l?(a.offsetX-this.T[0]/2)/this.H:(a.offsetY-this.T[1]/2)/this.o,0,1));c.Zb(c.constrainResolution(a))};
k.Fk=function(a){if(!this.A&&a.b.target===this.element.firstElementChild&&(Kd(this.a.aa(),1),this.D=a.clientX,this.O=a.clientY,this.A=!0,0===this.v.length)){a=this.Lg;var b=this.Mg;this.v.push(B(document,"mousemove",a,this),B(document,"touchmove",a,this),B(document,dg,a,this),B(document,"mouseup",b,this),B(document,"touchend",b,this),B(document,eg,b,this))}};
k.Lg=function(a){if(this.A){var b=this.element.firstElementChild;this.f=xm(this,ma(1===this.l?(a.clientX-this.D+parseInt(b.style.left,10))/this.H:(a.clientY-this.O+parseInt(b.style.top,10))/this.o,0,1));this.a.aa().Zb(this.f);wm(this,this.f);this.D=a.clientX;this.O=a.clientY}};k.Mg=function(){if(this.A){var a=this.a,b=a.aa();Kd(b,-1);a.$a(Ud({resolution:this.f,duration:this.W,easing:Md}));a=b.constrainResolution(this.f);b.Zb(a);this.A=!1;this.O=this.D=void 0;this.v.forEach(Ea);this.v.length=0}};
function wm(a,b){var c;c=1-Id(a.a.aa())(b);var d=a.element.firstElementChild;1==a.l?d.style.left=a.H*c+"px":d.style.top=a.o*c+"px"}function xm(a,b){return Hd(a.a.aa())(1-b)};function ym(a){a=a?a:{};this.f=a.extent?a.extent:null;var b=void 0!==a.className?a.className:"ol-zoom-extent",c=void 0!==a.label?a.label:"E",d=void 0!==a.tipLabel?a.tipLabel:"Fit to extent",e=document.createElement("button");e.setAttribute("type","button");e.title=d;e.appendChild("string"===typeof c?document.createTextNode(c):c);B(e,"click",this.l,this);c=document.createElement("div");c.className=b+" ol-unselectable ol-control";c.appendChild(e);jf.call(this,{element:c,target:a.target})}w(ym,jf);
ym.prototype.l=function(a){a.preventDefault();var b=this.a;a=b.aa();var c=this.f?this.f:a.j.C(),b=b.kb();a.af(c,b)};function zm(a){Xa.call(this);a=a?a:{};this.a=null;B(this,Za("tracking"),this.Dl,this);this.qf(void 0!==a.tracking?a.tracking:!1)}w(zm,Xa);k=zm.prototype;k.ma=function(){this.qf(!1);Xa.prototype.ma.call(this)};
k.$n=function(a){if(null!==a.alpha){var b=sa(a.alpha);this.set("alpha",b);"boolean"===typeof a.absolute&&a.absolute?this.set("heading",b):"number"===typeof a.webkitCompassHeading&&-1!=a.webkitCompassAccuracy&&this.set("heading",sa(a.webkitCompassHeading))}null!==a.beta&&this.set("beta",sa(a.beta));null!==a.gamma&&this.set("gamma",sa(a.gamma));this.u()};k.Lj=function(){return this.get("alpha")};k.Oj=function(){return this.get("beta")};k.Vj=function(){return this.get("gamma")};k.Cl=function(){return this.get("heading")};
k.Xg=function(){return this.get("tracking")};k.Dl=function(){if(Nf){var a=this.Xg();a&&!this.a?this.a=B(ja,"deviceorientation",this.$n,this):a||null===this.a||(Ea(this.a),this.a=null)}};k.qf=function(a){this.set("tracking",a)};function Am(a){Xa.call(this);this.i=void 0;this.a="geometry";this.c=null;this.l=void 0;this.f=null;B(this,Za(this.a),this.$d,this);void 0!==a&&(a instanceof Qc||!a?this.Xa(a):this.G(a))}w(Am,Xa);k=Am.prototype;k.clone=function(){var a=new Am(this.N());a.Cc(this.a);var b=this.Y();b&&a.Xa(b.clone());(b=this.c)&&a.rf(b);return a};k.Y=function(){return this.get(this.a)};k.Oa=function(){return this.i};k.Xj=function(){return this.a};k.El=function(){return this.c};k.hc=function(){return this.l};k.Fl=function(){this.u()};
k.$d=function(){this.f&&(Ea(this.f),this.f=null);var a=this.Y();a&&(this.f=B(a,"change",this.Fl,this));this.u()};k.Xa=function(a){this.set(this.a,a)};k.rf=function(a){this.l=(this.c=a)?Bm(a):void 0;this.u()};k.Xb=function(a){this.i=a;this.u()};k.Cc=function(a){Ka(this,Za(this.a),this.$d,this);this.a=a;B(this,Za(this.a),this.$d,this);this.$d()};function Bm(a){if("function"!==typeof a){var b;Array.isArray(a)?b=a:(la(a instanceof Zi,41),b=[a]);a=function(){return b}}return a};var Cm=document.implementation.createDocument("","",null);function Dm(a,b){return Cm.createElementNS(a,b)}function Em(a,b){return Fm(a,b,[]).join("")}function Fm(a,b,c){if(a.nodeType==Node.CDATA_SECTION_NODE||a.nodeType==Node.TEXT_NODE)b?c.push(String(a.nodeValue).replace(/(\r\n|\r|\n)/g,"")):c.push(a.nodeValue);else for(a=a.firstChild;a;a=a.nextSibling)Fm(a,b,c);return c}function Gm(a){return a instanceof Document}function Hm(a){return a instanceof Node}
function Im(a){return(new DOMParser).parseFromString(a,"application/xml")}function Jm(a,b){return function(c,d){var e=a.call(b,c,d);void 0!==e&&eb(d[d.length-1],e)}}function Km(a,b){return function(c,d){var e=a.call(void 0!==b?b:this,c,d);void 0!==e&&d[d.length-1].push(e)}}function Lm(a,b){return function(c,d){var e=a.call(void 0!==b?b:this,c,d);void 0!==e&&(d[d.length-1]=e)}}
function Mm(a){return function(b,c){var d=a.call(this,b,c);if(void 0!==d){var e=c[c.length-1],f=b.localName,g;f in e?g=e[f]:g=e[f]=[];g.push(d)}}}function K(a,b){return function(c,d){var e=a.call(this,c,d);void 0!==e&&(d[d.length-1][void 0!==b?b:c.localName]=e)}}function L(a,b){return function(c,d,e){a.call(void 0!==b?b:this,c,d,e);e[e.length-1].node.appendChild(c)}}
function Nm(a){var b,c;return function(d,e,f){if(!b){b={};var g={};g[d.localName]=a;b[d.namespaceURI]=g;c=Om(d.localName)}Pm(b,c,e,f)}}function Om(a,b){return function(c,d,e){c=d[d.length-1].node;d=a;void 0===d&&(d=e);e=b;void 0===b&&(e=c.namespaceURI);return Dm(e,d)}}var Qm=Om();function Rm(a,b){for(var c=b.length,d=Array(c),e=0;e<c;++e)d[e]=a[b[e]];return d}function N(a,b,c){c=void 0!==c?c:{};var d,e;d=0;for(e=a.length;d<e;++d)c[a[d]]=b;return c}
function Sm(a,b,c,d){for(b=b.firstElementChild;b;b=b.nextElementSibling){var e=a[b.namespaceURI];void 0!==e&&(e=e[b.localName])&&e.call(d,b,c)}}function O(a,b,c,d,e){d.push(a);Sm(b,c,d,e);return d.pop()}function Pm(a,b,c,d,e,f){for(var g=(void 0!==e?e:c).length,h,l,m=0;m<g;++m)h=c[m],void 0!==h&&(l=b.call(f,h,d,void 0!==e?e[m]:void 0),void 0!==l&&a[l.namespaceURI][l.localName].call(f,l,h,d))}function Tm(a,b,c,d,e,f,g){e.push(a);Pm(b,c,d,e,f,g);e.pop()};function Um(a,b,c,d){return function(e,f,g){var h=new XMLHttpRequest;h.open("GET","function"===typeof a?a(e,f,g):a,!0);"arraybuffer"==b.X()&&(h.responseType="arraybuffer");h.onload=function(){if(!h.status||200<=h.status&&300>h.status){var a=b.X(),e;"json"==a||"text"==a?e=h.responseText:"xml"==a?(e=h.responseXML)||(e=Im(h.responseText)):"arraybuffer"==a&&(e=h.response);e?c.call(this,b.Fa(e,{featureProjection:g}),b.Ra(e)):d.call(this)}else d.call(this)}.bind(this);h.send()}}
function Vm(a,b){return Um(a,b,function(a,b){this.uf(b);this.di(a)},function(){this.state=3;rh(this)})}function Wm(a,b){return Um(a,b,function(a){this.Hc(a)},ha)};function Xm(){this.defaultDataProjection=null}function Ym(a,b,c){var d;c&&(d={dataProjection:c.dataProjection?c.dataProjection:a.Ra(b),featureProjection:c.featureProjection});return Zm(a,d)}function Zm(a,b){var c;b&&(c={featureProjection:b.featureProjection,dataProjection:b.dataProjection?b.dataProjection:a.defaultDataProjection,rightHanded:b.rightHanded},b.decimals&&(c.decimals=b.decimals));return c}
function $m(a,b,c){var d=c?vc(c.featureProjection):null,e=c?vc(c.dataProjection):null,f;d&&e&&!Lc(d,e)?a instanceof Qc?f=(b?a.clone():a).lb(b?d:e,b?e:d):f=Pc(b?a.slice():a,b?d:e,b?e:d):f=a;if(b&&c&&c.decimals){var g=Math.pow(10,c.decimals);a=function(a){for(var b=0,c=a.length;b<c;++b)a[b]=Math.round(a[b]*g)/g;return a};Array.isArray(f)?a(f):f.rc(a)}return f};function an(){this.defaultDataProjection=null}w(an,Xm);function bn(a){return"string"===typeof a?(a=JSON.parse(a))?a:null:null!==a?a:null}k=an.prototype;k.X=function(){return"json"};k.Vb=function(a,b){return this.Tc(bn(a),Ym(this,a,b))};k.Fa=function(a,b){return this.If(bn(a),Ym(this,a,b))};k.Uc=function(a,b){return this.Oh(bn(a),Ym(this,a,b))};k.Ra=function(a){return this.Vh(bn(a))};k.Cd=function(a,b){return JSON.stringify(this.Xc(a,b))};k.ac=function(a,b){return JSON.stringify(this.He(a,b))};
k.Yc=function(a,b){return JSON.stringify(this.Ie(a,b))};function cn(a,b,c,d,e,f){var g=NaN,h=NaN,l=(c-b)/d;if(0!==l)if(1==l)g=a[b],h=a[b+1];else if(2==l)g=(1-e)*a[b]+e*a[b+d],h=(1-e)*a[b+1]+e*a[b+d+1];else{var h=a[b],l=a[b+1],m=0,g=[0],n;for(n=b+d;n<c;n+=d){var p=a[n],q=a[n+1],m=m+Math.sqrt((p-h)*(p-h)+(q-l)*(q-l));g.push(m);h=p;l=q}c=e*m;l=0;m=g.length;for(n=!1;l<m;)e=l+(m-l>>1),h=+ab(g[e],c),0>h?l=e+1:(m=e,n=!h);e=n?l:~l;0>e?(c=(c-g[-e-2])/(g[-e-1]-g[-e-2]),b+=(-e-2)*d,g=va(a[b],a[b+d],c),h=va(a[b+1],a[b+d+1],c)):(g=a[b+e*d],h=a[b+e*d+1])}return f?(f[0]=
g,f[1]=h,f):[g,h]}function dn(a,b,c,d,e,f){if(c==b)return null;if(e<a[b+d-1])return f?(c=a.slice(b,b+d),c[d-1]=e,c):null;if(a[c-1]<e)return f?(c=a.slice(c-d,c),c[d-1]=e,c):null;if(e==a[b+d-1])return a.slice(b,b+d);b/=d;for(c/=d;b<c;)f=b+c>>1,e<a[(f+1)*d-1]?c=f:b=f+1;c=a[b*d-1];if(e==c)return a.slice((b-1)*d,(b-1)*d+d);f=(e-c)/(a[(b+1)*d-1]-c);c=[];var g;for(g=0;g<d-1;++g)c.push(va(a[(b-1)*d+g],a[b*d+g],f));c.push(e);return c}
function en(a,b,c,d,e,f){var g=0;if(f)return dn(a,g,b[b.length-1],c,d,e);if(d<a[c-1])return e?(a=a.slice(0,c),a[c-1]=d,a):null;if(a[a.length-1]<d)return e?(a=a.slice(a.length-c),a[c-1]=d,a):null;e=0;for(f=b.length;e<f;++e){var h=b[e];if(g!=h){if(d<a[g+c-1])break;if(d<=a[h-1])return dn(a,g,h,c,d,!1);g=h}}return null};function P(a,b){Sc.call(this);this.c=null;this.A=this.H=this.j=-1;this.sa(a,b)}w(P,Sc);k=P.prototype;k.sj=function(a){this.B?eb(this.B,a):this.B=a.slice();this.u()};k.clone=function(){var a=new P(null);a.ba(this.ka,this.B.slice());return a};k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;this.A!=this.g&&(this.H=Math.sqrt(Zc(this.B,0,this.B.length,this.a,0)),this.A=this.g);return ad(this.B,0,this.B.length,this.a,this.H,!1,a,b,c,d)};
k.Ij=function(a,b){return pd(this.B,0,this.B.length,this.a,a,b)};k.gm=function(a,b){return"XYM"!=this.ka&&"XYZM"!=this.ka?null:dn(this.B,0,this.B.length,this.a,a,void 0!==b?b:!1)};k.Z=function(){return fd(this.B,0,this.B.length,this.a)};k.zg=function(a,b){return cn(this.B,0,this.B.length,this.a,a,b)};k.hm=function(){var a=this.B,b=this.a,c=a[0],d=a[1],e=0,f;for(f=0+b;f<this.B.length;f+=b)var g=a[f],h=a[f+1],e=e+Math.sqrt((g-c)*(g-c)+(h-d)*(h-d)),c=g,d=h;return e};
function nj(a){a.j!=a.g&&(a.c=a.zg(.5,a.c),a.j=a.g);return a.c}k.Lc=function(a){var b=[];b.length=hd(this.B,0,this.B.length,this.a,a,b,0);a=new P(null);a.ba("XY",b);return a};k.X=function(){return"LineString"};k.La=function(a){return qd(this.B,0,this.B.length,this.a,a)};k.sa=function(a,b){a?(Vc(this,b,a,1),this.B||(this.B=[]),this.B.length=dd(this.B,0,a,this.a),this.u()):this.ba("XY",null)};k.ba=function(a,b){Uc(this,a,b);this.u()};function Q(a,b){Sc.call(this);this.c=[];this.j=this.A=-1;this.sa(a,b)}w(Q,Sc);k=Q.prototype;k.tj=function(a){this.B?eb(this.B,a.la().slice()):this.B=a.la().slice();this.c.push(this.B.length);this.u()};k.clone=function(){var a=new Q(null);a.ba(this.ka,this.B.slice(),this.c.slice());return a};k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;this.j!=this.g&&(this.A=Math.sqrt($c(this.B,0,this.c,this.a,0)),this.j=this.g);return bd(this.B,0,this.c,this.a,this.A,!1,a,b,c,d)};
k.jm=function(a,b,c){return"XYM"!=this.ka&&"XYZM"!=this.ka||0===this.B.length?null:en(this.B,this.c,this.a,a,void 0!==b?b:!1,void 0!==c?c:!1)};k.Z=function(){return gd(this.B,0,this.c,this.a)};k.Hb=function(){return this.c};k.ck=function(a){if(0>a||this.c.length<=a)return null;var b=new P(null);b.ba(this.ka,this.B.slice(0===a?0:this.c[a-1],this.c[a]));return b};
k.ld=function(){var a=this.B,b=this.c,c=this.ka,d=[],e=0,f,g;f=0;for(g=b.length;f<g;++f){var h=b[f],l=new P(null);l.ba(c,a.slice(e,h));d.push(l);e=h}return d};function oj(a){var b=[],c=a.B,d=0,e=a.c;a=a.a;var f,g;f=0;for(g=e.length;f<g;++f){var h=e[f],d=cn(c,d,h,a,.5);eb(b,d);d=h}return b}k.Lc=function(a){var b=[],c=[],d=this.B,e=this.c,f=this.a,g=0,h=0,l,m;l=0;for(m=e.length;l<m;++l){var n=e[l],h=hd(d,g,n,f,a,b,h);c.push(h);g=n}b.length=h;a=new Q(null);a.ba("XY",b,c);return a};k.X=function(){return"MultiLineString"};
k.La=function(a){a:{var b=this.B,c=this.c,d=this.a,e=0,f,g;f=0;for(g=c.length;f<g;++f){if(qd(b,e,c[f],d,a)){a=!0;break a}e=c[f]}a=!1}return a};k.sa=function(a,b){if(a){Vc(this,b,a,2);this.B||(this.B=[]);var c=ed(this.B,0,a,this.a,this.c);this.B.length=0===c.length?0:c[c.length-1];this.u()}else this.ba("XY",null,this.c)};k.ba=function(a,b,c){Uc(this,a,b);this.c=c;this.u()};
function fn(a,b){var c=a.ka,d=[],e=[],f,g;f=0;for(g=b.length;f<g;++f){var h=b[f];0===f&&(c=h.ka);eb(d,h.la());e.push(d.length)}a.ba(c,d,e)};function R(a,b){Sc.call(this);this.sa(a,b)}w(R,Sc);k=R.prototype;k.vj=function(a){this.B?eb(this.B,a.la()):this.B=a.la().slice();this.u()};k.clone=function(){var a=new R(null);a.ba(this.ka,this.B.slice());return a};k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;var e=this.B,f=this.a,g,h,l;g=0;for(h=e.length;g<h;g+=f)if(l=ra(a,b,e[g],e[g+1]),l<d){d=l;for(l=0;l<f;++l)c[l]=e[g+l];c.length=f}return d};k.Z=function(){return fd(this.B,0,this.B.length,this.a)};
k.nk=function(a){var b=this.B?this.B.length/this.a:0;if(0>a||b<=a)return null;b=new C(null);b.ba(this.ka,this.B.slice(a*this.a,(a+1)*this.a));return b};k.he=function(){var a=this.B,b=this.ka,c=this.a,d=[],e,f;e=0;for(f=a.length;e<f;e+=c){var g=new C(null);g.ba(b,a.slice(e,e+c));d.push(g)}return d};k.X=function(){return"MultiPoint"};k.La=function(a){var b=this.B,c=this.a,d,e,f,g;d=0;for(e=b.length;d<e;d+=c)if(f=b[d],g=b[d+1],Mb(a,f,g))return!0;return!1};
k.sa=function(a,b){a?(Vc(this,b,a,1),this.B||(this.B=[]),this.B.length=dd(this.B,0,a,this.a),this.u()):this.ba("XY",null)};k.ba=function(a,b){Uc(this,a,b);this.u()};function S(a,b){Sc.call(this);this.c=[];this.A=-1;this.H=null;this.R=this.D=this.O=-1;this.j=null;this.sa(a,b)}w(S,Sc);k=S.prototype;k.wj=function(a){if(this.B){var b=this.B.length;eb(this.B,a.la());a=a.Hb().slice();var c,d;c=0;for(d=a.length;c<d;++c)a[c]+=b}else this.B=a.la().slice(),a=a.Hb().slice(),this.c.push();this.c.push(a);this.u()};k.clone=function(){for(var a=new S(null),b=this.c.length,c=Array(b),d=0;d<b;++d)c[d]=this.c[d].slice();gn(a,this.ka,this.B.slice(),c);return a};
k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;if(this.D!=this.g){var e=this.c,f=0,g=0,h,l;h=0;for(l=e.length;h<l;++h)var m=e[h],g=$c(this.B,f,m,this.a,g),f=m[m.length-1];this.O=Math.sqrt(g);this.D=this.g}e=pj(this);f=this.c;g=this.a;h=this.O;l=0;var m=[NaN,NaN],n,p;n=0;for(p=f.length;n<p;++n){var q=f[n];d=bd(e,l,q,g,h,!0,a,b,c,d,m);l=q[q.length-1]}return d};
k.zc=function(a,b){var c;a:{c=pj(this);var d=this.c,e=this.a,f=0;if(0!==d.length){var g,h;g=0;for(h=d.length;g<h;++g){var l=d[g];if(nd(c,f,l,e,a,b)){c=!0;break a}f=l[l.length-1]}}c=!1}return c};k.km=function(){var a=pj(this),b=this.c,c=0,d=0,e,f;e=0;for(f=b.length;e<f;++e)var g=b[e],d=d+Xc(a,c,g,this.a),c=g[g.length-1];return d};
k.Z=function(a){var b;void 0!==a?(b=pj(this).slice(),vd(b,this.c,this.a,a)):b=this.B;a=b;b=this.c;var c=this.a,d=0,e=[],f=0,g,h;g=0;for(h=b.length;g<h;++g){var l=b[g];e[f++]=gd(a,d,l,c,e[f]);d=l[l.length-1]}e.length=f;return e};
function qj(a){if(a.A!=a.g){var b=a.B,c=a.c,d=a.a,e=0,f=[],g,h;g=0;for(h=c.length;g<h;++g){var l=c[g],e=Sb(b,e,l[0],d);f.push((e[0]+e[2])/2,(e[1]+e[3])/2);e=l[l.length-1]}b=pj(a);c=a.c;d=a.a;g=0;h=[];l=0;for(e=c.length;l<e;++l){var m=c[l];h=od(b,g,m,d,f,2*l,h);g=m[m.length-1]}a.H=h;a.A=a.g}return a.H}k.$j=function(){var a=new R(null);a.ba("XY",qj(this).slice());return a};
function pj(a){if(a.R!=a.g){var b=a.B,c;a:{c=a.c;var d,e;d=0;for(e=c.length;d<e;++d)if(!td(b,c[d],a.a,void 0)){c=!1;break a}c=!0}c?a.j=b:(a.j=b.slice(),a.j.length=vd(a.j,a.c,a.a));a.R=a.g}return a.j}k.Lc=function(a){var b=[],c=[],d=this.B,e=this.c,f=this.a;a=Math.sqrt(a);var g=0,h=0,l,m;l=0;for(m=e.length;l<m;++l){var n=e[l],p=[],h=id(d,g,n,f,a,b,h,p);c.push(p);g=n[n.length-1]}b.length=h;d=new S(null);gn(d,"XY",b,c);return d};
k.qk=function(a){if(0>a||this.c.length<=a)return null;var b;0===a?b=0:(b=this.c[a-1],b=b[b.length-1]);a=this.c[a].slice();var c=a[a.length-1];if(0!==b){var d,e;d=0;for(e=a.length;d<e;++d)a[d]-=b}d=new D(null);d.ba(this.ka,this.B.slice(b,c),a);return d};k.Wd=function(){var a=this.ka,b=this.B,c=this.c,d=[],e=0,f,g,h,l;f=0;for(g=c.length;f<g;++f){var m=c[f].slice(),n=m[m.length-1];if(0!==e)for(h=0,l=m.length;h<l;++h)m[h]-=e;h=new D(null);h.ba(a,b.slice(e,n),m);d.push(h);e=n}return d};k.X=function(){return"MultiPolygon"};
k.La=function(a){a:{var b=pj(this),c=this.c,d=this.a,e=0,f,g;f=0;for(g=c.length;f<g;++f){var h=c[f];if(rd(b,e,h,d,a)){a=!0;break a}e=h[h.length-1]}a=!1}return a};k.sa=function(a,b){if(a){Vc(this,b,a,3);this.B||(this.B=[]);var c=this.B,d=this.a,e=this.c,f=0,e=e?e:[],g=0,h,l;h=0;for(l=a.length;h<l;++h)f=ed(c,f,a[h],d,e[g]),e[g++]=f,f=f[f.length-1];e.length=g;0===e.length?this.B.length=0:(c=e[e.length-1],this.B.length=0===c.length?0:c[c.length-1]);this.u()}else gn(this,"XY",null,this.c)};
function gn(a,b,c,d){Uc(a,b,c);a.c=d;a.u()}function hn(a,b){var c=a.ka,d=[],e=[],f,g,h;f=0;for(g=b.length;f<g;++f){var l=b[f];0===f&&(c=l.ka);var m=d.length;h=l.Hb();var n,p;n=0;for(p=h.length;n<p;++n)h[n]+=m;eb(d,l.la());e.push(h)}gn(a,c,d,e)};function jn(a){a=a?a:{};this.defaultDataProjection=null;this.b=a.geometryName}w(jn,an);
function kn(a,b){if(!a)return null;var c;if("number"===typeof a.x&&"number"===typeof a.y)c="Point";else if(a.points)c="MultiPoint";else if(a.paths)c=1===a.paths.length?"LineString":"MultiLineString";else if(a.rings){var d=a.rings,e=ln(a),f=[];c=[];var g,h;g=0;for(h=d.length;g<h;++g){var l=db(d[g]);sd(l,0,l.length,e.length)?f.push([d[g]]):c.push(d[g])}for(;c.length;){d=c.shift();e=!1;for(g=f.length-1;0<=g;g--)if(Nb((new jd(f[g][0])).C(),(new jd(d)).C())){f[g].push(d);e=!0;break}e||f.push([d.reverse()])}a=
za({},a);1===f.length?(c="Polygon",a.rings=f[0]):(c="MultiPolygon",a.rings=f)}return $m((0,mn[c])(a),!1,b)}function ln(a){var b="XY";!0===a.hasZ&&!0===a.hasM?b="XYZM":!0===a.hasZ?b="XYZ":!0===a.hasM&&(b="XYM");return b}function nn(a){a=a.ka;return{hasZ:"XYZ"===a||"XYZM"===a,hasM:"XYM"===a||"XYZM"===a}}
var mn={Point:function(a){return void 0!==a.m&&void 0!==a.z?new C([a.x,a.y,a.z,a.m],"XYZM"):void 0!==a.z?new C([a.x,a.y,a.z],"XYZ"):void 0!==a.m?new C([a.x,a.y,a.m],"XYM"):new C([a.x,a.y])},LineString:function(a){return new P(a.paths[0],ln(a))},Polygon:function(a){return new D(a.rings,ln(a))},MultiPoint:function(a){return new R(a.points,ln(a))},MultiLineString:function(a){return new Q(a.paths,ln(a))},MultiPolygon:function(a){return new S(a.rings,ln(a))}},on={Point:function(a){var b=a.Z(),c;a=a.ka;
"XYZ"===a?c={x:b[0],y:b[1],z:b[2]}:"XYM"===a?c={x:b[0],y:b[1],m:b[2]}:"XYZM"===a?c={x:b[0],y:b[1],z:b[2],m:b[3]}:"XY"===a?c={x:b[0],y:b[1]}:la(!1,34);return c},LineString:function(a){var b=nn(a);return{hasZ:b.hasZ,hasM:b.hasM,paths:[a.Z()]}},Polygon:function(a){var b=nn(a);return{hasZ:b.hasZ,hasM:b.hasM,rings:a.Z(!1)}},MultiPoint:function(a){var b=nn(a);return{hasZ:b.hasZ,hasM:b.hasM,points:a.Z()}},MultiLineString:function(a){var b=nn(a);return{hasZ:b.hasZ,hasM:b.hasM,paths:a.Z()}},MultiPolygon:function(a){var b=
nn(a);a=a.Z(!1);for(var c=[],d=0;d<a.length;d++)for(var e=a[d].length-1;0<=e;e--)c.push(a[d][e]);return{hasZ:b.hasZ,hasM:b.hasM,rings:c}}};k=jn.prototype;k.Tc=function(a,b){var c=kn(a.geometry,b),d=new Am;this.b&&d.Cc(this.b);d.Xa(c);b&&b.lf&&a.attributes[b.lf]&&d.Xb(a.attributes[b.lf]);a.attributes&&d.G(a.attributes);return d};
k.If=function(a,b){var c=b?b:{};if(a.features){var d=[],e=a.features,f,g;c.lf=a.objectIdFieldName;f=0;for(g=e.length;f<g;++f)d.push(this.Tc(e[f],c));return d}return[this.Tc(a,c)]};k.Oh=function(a,b){return kn(a,b)};k.Vh=function(a){return a.spatialReference&&a.spatialReference.wkid?vc("EPSG:"+a.spatialReference.wkid):null};function pn(a,b){return(0,on[a.X()])($m(a,!0,b),b)}k.Ie=function(a,b){return pn(a,Zm(this,b))};
k.Xc=function(a,b){b=Zm(this,b);var c={},d=a.Y();d&&(c.geometry=pn(d,b));d=a.N();delete d[a.a];c.attributes=Ca(d)?{}:d;b&&b.featureProjection&&(c.spatialReference={wkid:vc(b.featureProjection).eb.split(":").pop()});return c};k.He=function(a,b){b=Zm(this,b);var c=[],d,e;d=0;for(e=a.length;d<e;++d)c.push(this.Xc(a[d],b));return{features:c}};function qn(a){Qc.call(this);this.f=a?a:null;rn(this)}w(qn,Qc);function sn(a){var b=[],c,d;c=0;for(d=a.length;c<d;++c)b.push(a[c].clone());return b}function tn(a){var b,c;if(a.f)for(b=0,c=a.f.length;b<c;++b)Ka(a.f[b],"change",a.u,a)}function rn(a){var b,c;if(a.f)for(b=0,c=a.f.length;b<c;++b)B(a.f[b],"change",a.u,a)}k=qn.prototype;k.clone=function(){var a=new qn(null);a.ei(this.f);return a};
k.vb=function(a,b,c,d){if(d<Kb(this.C(),a,b))return d;var e=this.f,f,g;f=0;for(g=e.length;f<g;++f)d=e[f].vb(a,b,c,d);return d};k.zc=function(a,b){var c=this.f,d,e;d=0;for(e=c.length;d<e;++d)if(c[d].zc(a,b))return!0;return!1};k.Nd=function(a){Qb(Infinity,Infinity,-Infinity,-Infinity,a);for(var b=this.f,c=0,d=b.length;c<d;++c)Vb(a,b[c].C());return a};k.df=function(){return sn(this.f)};
k.md=function(a){this.o!=this.g&&(Aa(this.i),this.l=0,this.o=this.g);if(0>a||0!==this.l&&a<this.l)return this;var b=a.toString();if(this.i.hasOwnProperty(b))return this.i[b];var c=[],d=this.f,e=!1,f,g;f=0;for(g=d.length;f<g;++f){var h=d[f],l=h.md(a);c.push(l);l!==h&&(e=!0)}if(e)return a=new qn(null),tn(a),a.f=c,rn(a),a.u(),this.i[b]=a;this.l=a;return this};k.X=function(){return"GeometryCollection"};k.La=function(a){var b=this.f,c,d;c=0;for(d=b.length;c<d;++c)if(b[c].La(a))return!0;return!1};
k.rotate=function(a,b){for(var c=this.f,d=0,e=c.length;d<e;++d)c[d].rotate(a,b);this.u()};k.scale=function(a,b,c){c||(c=gc(this.C()));for(var d=this.f,e=0,f=d.length;e<f;++e)d[e].scale(a,b,c);this.u()};k.ei=function(a){a=sn(a);tn(this);this.f=a;rn(this);this.u()};k.rc=function(a){var b=this.f,c,d;c=0;for(d=b.length;c<d;++c)b[c].rc(a);this.u()};k.Qc=function(a,b){var c=this.f,d,e;d=0;for(e=c.length;d<e;++d)c[d].Qc(a,b);this.u()};k.ma=function(){tn(this);Qc.prototype.ma.call(this)};function un(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=vc(a.defaultDataProjection?a.defaultDataProjection:"EPSG:4326");this.b=a.geometryName}w(un,an);function vn(a,b){return a?$m((0,wn[a.type])(a),!1,b):null}function xn(a,b){return(0,yn[a.X()])($m(a,!0,b),b)}
var wn={Point:function(a){return new C(a.coordinates)},LineString:function(a){return new P(a.coordinates)},Polygon:function(a){return new D(a.coordinates)},MultiPoint:function(a){return new R(a.coordinates)},MultiLineString:function(a){return new Q(a.coordinates)},MultiPolygon:function(a){return new S(a.coordinates)},GeometryCollection:function(a,b){var c=a.geometries.map(function(a){return vn(a,b)});return new qn(c)}},yn={Point:function(a){return{type:"Point",coordinates:a.Z()}},LineString:function(a){return{type:"LineString",
coordinates:a.Z()}},Polygon:function(a,b){var c;b&&(c=b.rightHanded);return{type:"Polygon",coordinates:a.Z(c)}},MultiPoint:function(a){return{type:"MultiPoint",coordinates:a.Z()}},MultiLineString:function(a){return{type:"MultiLineString",coordinates:a.Z()}},MultiPolygon:function(a,b){var c;b&&(c=b.rightHanded);return{type:"MultiPolygon",coordinates:a.Z(c)}},GeometryCollection:function(a,b){return{type:"GeometryCollection",geometries:a.f.map(function(a){var d=za({},b);delete d.featureProjection;return xn(a,
d)})}},Circle:function(){return{type:"GeometryCollection",geometries:[]}}};k=un.prototype;k.Tc=function(a,b){var c=vn(a.geometry,b),d=new Am;this.b&&d.Cc(this.b);d.Xa(c);void 0!==a.id&&d.Xb(a.id);a.properties&&d.G(a.properties);return d};k.If=function(a,b){var c;if("Feature"==a.type)c=[this.Tc(a,b)];else if("FeatureCollection"==a.type){c=[];var d=a.features,e,f;e=0;for(f=d.length;e<f;++e)c.push(this.Tc(d[e],b))}else la(!1,35);return c};k.Oh=function(a,b){return vn(a,b)};
k.Vh=function(a){a=a.crs;var b;a?"name"==a.type?b=vc(a.properties.name):"EPSG"==a.type?b=vc("EPSG:"+a.properties.code):la(!1,36):b=this.defaultDataProjection;return b};k.Xc=function(a,b){b=Zm(this,b);var c={type:"Feature"},d=a.Oa();void 0!==d&&(c.id=d);(d=a.Y())?c.geometry=xn(d,b):c.geometry=null;d=a.N();delete d[a.a];Ca(d)?c.properties=null:c.properties=d;return c};k.He=function(a,b){b=Zm(this,b);var c=[],d,e;d=0;for(e=a.length;d<e;++d)c.push(this.Xc(a[d],b));return{type:"FeatureCollection",features:c}};
k.Ie=function(a,b){return xn(a,Zm(this,b))};function zn(){this.f=new XMLSerializer;this.defaultDataProjection=null}w(zn,Xm);k=zn.prototype;k.X=function(){return"xml"};k.Vb=function(a,b){if(Gm(a))return An(this,a,b);if(Hm(a))return this.Mh(a,b);if("string"===typeof a){var c=Im(a);return An(this,c,b)}return null};function An(a,b,c){a=Bn(a,b,c);return 0<a.length?a[0]:null}k.Fa=function(a,b){if(Gm(a))return Bn(this,a,b);if(Hm(a))return this.nc(a,b);if("string"===typeof a){var c=Im(a);return Bn(this,c,b)}return[]};
function Bn(a,b,c){var d=[];for(b=b.firstChild;b;b=b.nextSibling)b.nodeType==Node.ELEMENT_NODE&&eb(d,a.nc(b,c));return d}k.Uc=function(a,b){if(Gm(a))return this.v(a,b);if(Hm(a)){var c=this.xe(a,[Ym(this,a,b?b:{})]);return c?c:null}return"string"===typeof a?(c=Im(a),this.v(c,b)):null};k.Ra=function(a){return Gm(a)?this.Of(a):Hm(a)?this.Ae(a):"string"===typeof a?(a=Im(a),this.Of(a)):null};k.Of=function(){return this.defaultDataProjection};k.Ae=function(){return this.defaultDataProjection};
k.Cd=function(a,b){var c=this.A(a,b);return this.f.serializeToString(c)};k.ac=function(a,b){var c=this.a(a,b);return this.f.serializeToString(c)};k.Yc=function(a,b){var c=this.s(a,b);return this.f.serializeToString(c)};function Cn(a){a=a?a:{};this.featureType=a.featureType;this.featureNS=a.featureNS;this.srsName=a.srsName;this.schemaLocation="";this.b={};this.b["http://www.opengis.net/gml"]={featureMember:Lm(Cn.prototype.ud),featureMembers:Lm(Cn.prototype.ud)};zn.call(this)}w(Cn,zn);var Dn=/^[\s\xa0]*$/;k=Cn.prototype;
k.ud=function(a,b){var c=a.localName,d=null;if("FeatureCollection"==c)"http://www.opengis.net/wfs"===a.namespaceURI?d=O([],this.b,a,b,this):d=O(null,this.b,a,b,this);else if("featureMembers"==c||"featureMember"==c){var e=b[0],f=e.featureType,g=e.featureNS,h,l;if(!f&&a.childNodes){f=[];g={};h=0;for(l=a.childNodes.length;h<l;++h){var m=a.childNodes[h];if(1===m.nodeType){var n=m.nodeName.split(":").pop();if(-1===f.indexOf(n)){var p="",q=0,m=m.namespaceURI,t;for(t in g){if(g[t]===m){p=t;break}++q}p||
(p="p"+q,g[p]=m);f.push(p+":"+n)}}}"featureMember"!=c&&(e.featureType=f,e.featureNS=g)}"string"===typeof g&&(h=g,g={},g.p0=h);var e={},f=Array.isArray(f)?f:[f],v;for(v in g){n={};h=0;for(l=f.length;h<l;++h)(-1===f[h].indexOf(":")?"p0":f[h].split(":")[0])===v&&(n[f[h].split(":").pop()]="featureMembers"==c?Km(this.Hf,this):Lm(this.Hf,this));e[g[v]]=n}"featureMember"==c?d=O(void 0,e,a,b):d=O([],e,a,b)}null===d&&(d=[]);return d};
k.xe=function(a,b){var c=b[0];c.srsName=a.firstElementChild.getAttribute("srsName");var d=O(null,this.ag,a,b,this);if(d)return $m(d,!1,c)};
k.Hf=function(a,b){var c,d;(d=a.getAttribute("fid"))||(d=a.getAttributeNS("http://www.opengis.net/gml","id")||"");var e={},f;for(c=a.firstElementChild;c;c=c.nextElementSibling){var g=c.localName;if(0===c.childNodes.length||1===c.childNodes.length&&(3===c.firstChild.nodeType||4===c.firstChild.nodeType)){var h=Em(c,!1);Dn.test(h)&&(h=void 0);e[g]=h}else"boundedBy"!==g&&(f=g),e[g]=this.xe(c,b)}c=new Am(e);f&&c.Cc(f);d&&c.Xb(d);return c};
k.Uh=function(a,b){var c=this.we(a,b);if(c){var d=new C(null);d.ba("XYZ",c);return d}};k.Sh=function(a,b){var c=O([],this.Qi,a,b,this);if(c)return new R(c)};k.Rh=function(a,b){var c=O([],this.Pi,a,b,this);if(c){var d=new Q(null);fn(d,c);return d}};k.Th=function(a,b){var c=O([],this.Ri,a,b,this);if(c){var d=new S(null);hn(d,c);return d}};k.Jh=function(a,b){Sm(this.Ui,a,b,this)};k.Rg=function(a,b){Sm(this.Ni,a,b,this)};k.Kh=function(a,b){Sm(this.Vi,a,b,this)};
k.ye=function(a,b){var c=this.we(a,b);if(c){var d=new P(null);d.ba("XYZ",c);return d}};k.wo=function(a,b){var c=O(null,this.Ed,a,b,this);if(c)return c};k.Qh=function(a,b){var c=this.we(a,b);if(c){var d=new jd(null);kd(d,"XYZ",c);return d}};k.ze=function(a,b){var c=O([null],this.Le,a,b,this);if(c&&c[0]){var d=new D(null),e=c[0],f=[e.length],g,h;g=1;for(h=c.length;g<h;++g)eb(e,c[g]),f.push(e.length);d.ba("XYZ",e,f);return d}};k.we=function(a,b){return O(null,this.Ed,a,b,this)};
k.Qi={"http://www.opengis.net/gml":{pointMember:Km(Cn.prototype.Jh),pointMembers:Km(Cn.prototype.Jh)}};k.Pi={"http://www.opengis.net/gml":{lineStringMember:Km(Cn.prototype.Rg),lineStringMembers:Km(Cn.prototype.Rg)}};k.Ri={"http://www.opengis.net/gml":{polygonMember:Km(Cn.prototype.Kh),polygonMembers:Km(Cn.prototype.Kh)}};k.Ui={"http://www.opengis.net/gml":{Point:Km(Cn.prototype.we)}};k.Ni={"http://www.opengis.net/gml":{LineString:Km(Cn.prototype.ye)}};k.Vi={"http://www.opengis.net/gml":{Polygon:Km(Cn.prototype.ze)}};
k.Fd={"http://www.opengis.net/gml":{LinearRing:Lm(Cn.prototype.wo)}};k.nc=function(a,b){var c={featureType:this.featureType,featureNS:this.featureNS};b&&za(c,Ym(this,a,b));return this.ud(a,[c])||[]};k.Ae=function(a){return vc(this.srsName?this.srsName:a.firstElementChild.getAttribute("srsName"))};function En(a){a=Em(a,!1);return Fn(a)}function Fn(a){if(a=/^\s*(true|1)|(false|0)\s*$/.exec(a))return void 0!==a[1]||!1}function Gn(a){a=Em(a,!1);a=Date.parse(a);return isNaN(a)?void 0:a/1E3}function Hn(a){a=Em(a,!1);return In(a)}function In(a){if(a=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(a))return parseFloat(a[1])}function Jn(a){a=Em(a,!1);return Kn(a)}function Kn(a){if(a=/^\s*(\d+)\s*$/.exec(a))return parseInt(a[1],10)}function T(a){return Em(a,!1).trim()}
function Ln(a,b){Mn(a,b?"1":"0")}function Nn(a,b){a.appendChild(Cm.createTextNode(b.toPrecision()))}function On(a,b){a.appendChild(Cm.createTextNode(b.toString()))}function Mn(a,b){a.appendChild(Cm.createTextNode(b))};function Pn(a){a=a?a:{};Cn.call(this,a);this.o=void 0!==a.surface?a.surface:!1;this.i=void 0!==a.curve?a.curve:!1;this.l=void 0!==a.multiCurve?a.multiCurve:!0;this.j=void 0!==a.multiSurface?a.multiSurface:!0;this.schemaLocation=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/gml http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd"}w(Pn,Cn);k=Pn.prototype;k.Ao=function(a,b){var c=O([],this.Oi,a,b,this);if(c){var d=new Q(null);fn(d,c);return d}};
k.Bo=function(a,b){var c=O([],this.Si,a,b,this);if(c){var d=new S(null);hn(d,c);return d}};k.tg=function(a,b){Sm(this.Ki,a,b,this)};k.si=function(a,b){Sm(this.Zi,a,b,this)};k.Eo=function(a,b){return O([null],this.Ti,a,b,this)};k.Go=function(a,b){return O([null],this.Yi,a,b,this)};k.Fo=function(a,b){return O([null],this.Le,a,b,this)};k.zo=function(a,b){return O([null],this.Ed,a,b,this)};k.jl=function(a,b){var c=O(void 0,this.Fd,a,b,this);c&&b[b.length-1].push(c)};
k.Ej=function(a,b){var c=O(void 0,this.Fd,a,b,this);c&&(b[b.length-1][0]=c)};k.Wh=function(a,b){var c=O([null],this.$i,a,b,this);if(c&&c[0]){var d=new D(null),e=c[0],f=[e.length],g,h;g=1;for(h=c.length;g<h;++g)eb(e,c[g]),f.push(e.length);d.ba("XYZ",e,f);return d}};k.Lh=function(a,b){var c=O([null],this.Li,a,b,this);if(c){var d=new P(null);d.ba("XYZ",c);return d}};k.vo=function(a,b){var c=O([null],this.Mi,a,b,this);return Qb(c[1][0],c[1][1],c[2][0],c[2][1])};
k.xo=function(a,b){for(var c=Em(a,!1),d=/^\s*([+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?)\s*/,e=[],f;f=d.exec(c);)e.push(parseFloat(f[1])),c=c.substr(f[0].length);if(""===c){c=b[0].srsName;d="enu";c&&(d=vc(c).b);if("neu"===d)for(c=0,d=e.length;c<d;c+=3)f=e[c],e[c]=e[c+1],e[c+1]=f;c=e.length;2==c&&e.push(0);return 0===c?void 0:e}};
k.Lf=function(a,b){var c=Em(a,!1).replace(/^\s*|\s*$/g,""),d=b[0].srsName,e=a.parentNode.getAttribute("srsDimension"),f="enu";d&&(f=vc(d).b);c=c.split(/\s+/);d=2;a.getAttribute("srsDimension")?d=Kn(a.getAttribute("srsDimension")):a.getAttribute("dimension")?d=Kn(a.getAttribute("dimension")):e&&(d=Kn(e));for(var g,h,l=[],m=0,n=c.length;m<n;m+=d)e=parseFloat(c[m]),g=parseFloat(c[m+1]),h=3===d?parseFloat(c[m+2]):0,"en"===f.substr(0,2)?l.push(e,g,h):l.push(g,e,h);return l};
k.Ed={"http://www.opengis.net/gml":{pos:Lm(Pn.prototype.xo),posList:Lm(Pn.prototype.Lf)}};k.Le={"http://www.opengis.net/gml":{interior:Pn.prototype.jl,exterior:Pn.prototype.Ej}};
k.ag={"http://www.opengis.net/gml":{Point:Lm(Cn.prototype.Uh),MultiPoint:Lm(Cn.prototype.Sh),LineString:Lm(Cn.prototype.ye),MultiLineString:Lm(Cn.prototype.Rh),LinearRing:Lm(Cn.prototype.Qh),Polygon:Lm(Cn.prototype.ze),MultiPolygon:Lm(Cn.prototype.Th),Surface:Lm(Pn.prototype.Wh),MultiSurface:Lm(Pn.prototype.Bo),Curve:Lm(Pn.prototype.Lh),MultiCurve:Lm(Pn.prototype.Ao),Envelope:Lm(Pn.prototype.vo)}};k.Oi={"http://www.opengis.net/gml":{curveMember:Km(Pn.prototype.tg),curveMembers:Km(Pn.prototype.tg)}};
k.Si={"http://www.opengis.net/gml":{surfaceMember:Km(Pn.prototype.si),surfaceMembers:Km(Pn.prototype.si)}};k.Ki={"http://www.opengis.net/gml":{LineString:Km(Cn.prototype.ye),Curve:Km(Pn.prototype.Lh)}};k.Zi={"http://www.opengis.net/gml":{Polygon:Km(Cn.prototype.ze),Surface:Km(Pn.prototype.Wh)}};k.$i={"http://www.opengis.net/gml":{patches:Lm(Pn.prototype.Eo)}};k.Li={"http://www.opengis.net/gml":{segments:Lm(Pn.prototype.Go)}};k.Mi={"http://www.opengis.net/gml":{lowerCorner:Km(Pn.prototype.Lf),upperCorner:Km(Pn.prototype.Lf)}};
k.Ti={"http://www.opengis.net/gml":{PolygonPatch:Lm(Pn.prototype.Fo)}};k.Yi={"http://www.opengis.net/gml":{LineStringSegment:Lm(Pn.prototype.zo)}};function Qn(a,b,c){c=c[c.length-1].srsName;b=b.Z();for(var d=b.length,e=Array(d),f,g=0;g<d;++g){f=b[g];var h=g,l="enu";c&&(l=vc(c).b);e[h]="en"===l.substr(0,2)?f[0]+" "+f[1]:f[1]+" "+f[0]}Mn(a,e.join(" "))}
k.Gi=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);d=Dm(a.namespaceURI,"pos");a.appendChild(d);c=c[c.length-1].srsName;a="enu";c&&(a=vc(c).b);b=b.Z();Mn(d,"en"===a.substr(0,2)?b[0]+" "+b[1]:b[1]+" "+b[0])};var Rn={"http://www.opengis.net/gml":{lowerCorner:L(Mn),upperCorner:L(Mn)}};k=Pn.prototype;k.up=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);Tm({node:a},Rn,Qm,[b[0]+" "+b[1],b[2]+" "+b[3]],c,["lowerCorner","upperCorner"],this)};
k.Di=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);d=Dm(a.namespaceURI,"posList");a.appendChild(d);Qn(d,b,c)};k.Xi=function(a,b){var c=b[b.length-1],d=c.node,e=c.exteriorWritten;void 0===e&&(c.exteriorWritten=!0);return Dm(d.namespaceURI,void 0!==e?"interior":"exterior")};
k.Je=function(a,b,c){var d=c[c.length-1].srsName;"PolygonPatch"!==a.nodeName&&d&&a.setAttribute("srsName",d);"Polygon"===a.nodeName||"PolygonPatch"===a.nodeName?(b=b.Vd(),Tm({node:a,srsName:d},Sn,this.Xi,b,c,void 0,this)):"Surface"===a.nodeName&&(d=Dm(a.namespaceURI,"patches"),a.appendChild(d),a=Dm(d.namespaceURI,"PolygonPatch"),d.appendChild(a),this.Je(a,b,c))};
k.Fe=function(a,b,c){var d=c[c.length-1].srsName;"LineStringSegment"!==a.nodeName&&d&&a.setAttribute("srsName",d);"LineString"===a.nodeName||"LineStringSegment"===a.nodeName?(d=Dm(a.namespaceURI,"posList"),a.appendChild(d),Qn(d,b,c)):"Curve"===a.nodeName&&(d=Dm(a.namespaceURI,"segments"),a.appendChild(d),a=Dm(d.namespaceURI,"LineStringSegment"),d.appendChild(a),this.Fe(a,b,c))};
k.Fi=function(a,b,c){var d=c[c.length-1],e=d.srsName,d=d.surface;e&&a.setAttribute("srsName",e);b=b.Wd();Tm({node:a,srsName:e,surface:d},Tn,this.c,b,c,void 0,this)};k.vp=function(a,b,c){var d=c[c.length-1].srsName;d&&a.setAttribute("srsName",d);b=b.he();Tm({node:a,srsName:d},Un,Om("pointMember"),b,c,void 0,this)};k.Ei=function(a,b,c){var d=c[c.length-1],e=d.srsName,d=d.curve;e&&a.setAttribute("srsName",e);b=b.ld();Tm({node:a,srsName:e,curve:d},Vn,this.c,b,c,void 0,this)};
k.Hi=function(a,b,c){var d=Dm(a.namespaceURI,"LinearRing");a.appendChild(d);this.Di(d,b,c)};k.Ii=function(a,b,c){var d=this.g(b,c);d&&(a.appendChild(d),this.Je(d,b,c))};k.wp=function(a,b,c){var d=Dm(a.namespaceURI,"Point");a.appendChild(d);this.Gi(d,b,c)};k.Ci=function(a,b,c){var d=this.g(b,c);d&&(a.appendChild(d),this.Fe(d,b,c))};
k.Zc=function(a,b,c){var d=c[c.length-1],e=za({},d);e.node=a;var f;Array.isArray(b)?d.dataProjection?f=Pc(b,d.featureProjection,d.dataProjection):f=b:f=$m(b,!0,d);Tm(e,Wn,this.g,[f],c,void 0,this)};
k.yi=function(a,b,c){var d=b.Oa();d&&a.setAttribute("fid",d);var d=c[c.length-1],e=d.featureNS,f=b.a;d.Bc||(d.Bc={},d.Bc[e]={});var g=b.N();b=[];var h=[],l;for(l in g){var m=g[l];null!==m&&(b.push(l),h.push(m),l==f||m instanceof Qc?l in d.Bc[e]||(d.Bc[e][l]=L(this.Zc,this)):l in d.Bc[e]||(d.Bc[e][l]=L(Mn)))}l=za({},d);l.node=a;Tm(l,d.Bc,Om(void 0,e),h,c,b)};
var Tn={"http://www.opengis.net/gml":{surfaceMember:L(Pn.prototype.Ii),polygonMember:L(Pn.prototype.Ii)}},Un={"http://www.opengis.net/gml":{pointMember:L(Pn.prototype.wp)}},Vn={"http://www.opengis.net/gml":{lineStringMember:L(Pn.prototype.Ci),curveMember:L(Pn.prototype.Ci)}},Sn={"http://www.opengis.net/gml":{exterior:L(Pn.prototype.Hi),interior:L(Pn.prototype.Hi)}},Wn={"http://www.opengis.net/gml":{Curve:L(Pn.prototype.Fe),MultiCurve:L(Pn.prototype.Ei),Point:L(Pn.prototype.Gi),MultiPoint:L(Pn.prototype.vp),
LineString:L(Pn.prototype.Fe),MultiLineString:L(Pn.prototype.Ei),LinearRing:L(Pn.prototype.Di),Polygon:L(Pn.prototype.Je),MultiPolygon:L(Pn.prototype.Fi),Surface:L(Pn.prototype.Je),MultiSurface:L(Pn.prototype.Fi),Envelope:L(Pn.prototype.up)}},Xn={MultiLineString:"lineStringMember",MultiCurve:"curveMember",MultiPolygon:"polygonMember",MultiSurface:"surfaceMember"};Pn.prototype.c=function(a,b){return Dm("http://www.opengis.net/gml",Xn[b[b.length-1].node.nodeName])};
Pn.prototype.g=function(a,b){var c=b[b.length-1],d=c.multiSurface,e=c.surface,f=c.curve,c=c.multiCurve,g;Array.isArray(a)?g="Envelope":(g=a.X(),"MultiPolygon"===g&&!0===d?g="MultiSurface":"Polygon"===g&&!0===e?g="Surface":"LineString"===g&&!0===f?g="Curve":"MultiLineString"===g&&!0===c&&(g="MultiCurve"));return Dm("http://www.opengis.net/gml",g)};
Pn.prototype.s=function(a,b){b=Zm(this,b);var c=Dm("http://www.opengis.net/gml","geom"),d={node:c,srsName:this.srsName,curve:this.i,surface:this.o,multiSurface:this.j,multiCurve:this.l};b&&za(d,b);this.Zc(c,a,[d]);return c};
Pn.prototype.a=function(a,b){b=Zm(this,b);var c=Dm("http://www.opengis.net/gml","featureMembers");c.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.schemaLocation);var d={srsName:this.srsName,curve:this.i,surface:this.o,multiSurface:this.j,multiCurve:this.l,featureNS:this.featureNS,featureType:this.featureType};b&&za(d,b);var d=[d],e=d[d.length-1],f=e.featureType,g=e.featureNS,h={};h[g]={};h[g][f]=L(this.yi,this);e=za({},e);e.node=c;Tm(e,h,Om(f,g),a,d);return c};function Yn(a){a=a?a:{};Cn.call(this,a);this.b["http://www.opengis.net/gml"].featureMember=Km(Cn.prototype.ud);this.schemaLocation=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/gml http://schemas.opengis.net/gml/2.1.2/feature.xsd"}w(Yn,Cn);k=Yn.prototype;
k.Nh=function(a,b){var c=Em(a,!1).replace(/^\s*|\s*$/g,""),d=b[0].srsName,e=a.parentNode.getAttribute("srsDimension"),f="enu";d&&(d=vc(d))&&(f=d.b);c=c.split(/[\s,]+/);d=2;a.getAttribute("srsDimension")?d=Kn(a.getAttribute("srsDimension")):a.getAttribute("dimension")?d=Kn(a.getAttribute("dimension")):e&&(d=Kn(e));for(var g,h,l=[],m=0,n=c.length;m<n;m+=d)e=parseFloat(c[m]),g=parseFloat(c[m+1]),h=3===d?parseFloat(c[m+2]):0,"en"===f.substr(0,2)?l.push(e,g,h):l.push(g,e,h);return l};
k.to=function(a,b){var c=O([null],this.Ji,a,b,this);return Qb(c[1][0],c[1][1],c[1][3],c[1][4])};k.hl=function(a,b){var c=O(void 0,this.Fd,a,b,this);c&&b[b.length-1].push(c)};k.ao=function(a,b){var c=O(void 0,this.Fd,a,b,this);c&&(b[b.length-1][0]=c)};k.Ed={"http://www.opengis.net/gml":{coordinates:Lm(Yn.prototype.Nh)}};k.Le={"http://www.opengis.net/gml":{innerBoundaryIs:Yn.prototype.hl,outerBoundaryIs:Yn.prototype.ao}};k.Ji={"http://www.opengis.net/gml":{coordinates:Km(Yn.prototype.Nh)}};
k.ag={"http://www.opengis.net/gml":{Point:Lm(Cn.prototype.Uh),MultiPoint:Lm(Cn.prototype.Sh),LineString:Lm(Cn.prototype.ye),MultiLineString:Lm(Cn.prototype.Rh),LinearRing:Lm(Cn.prototype.Qh),Polygon:Lm(Cn.prototype.ze),MultiPolygon:Lm(Cn.prototype.Th),Box:Lm(Yn.prototype.to)}};function Zn(a){a=a?a:{};zn.call(this);this.defaultDataProjection=vc("EPSG:4326");this.b=a.readExtensions}w(Zn,zn);var $n=[null,"http://www.topografix.com/GPX/1/0","http://www.topografix.com/GPX/1/1"];function ao(a,b,c){a.push(parseFloat(b.getAttribute("lon")),parseFloat(b.getAttribute("lat")));"ele"in c?(a.push(c.ele),delete c.ele):a.push(0);"time"in c?(a.push(c.time),delete c.time):a.push(0);return a}function bo(a,b){var c=b[b.length-1],d=a.getAttribute("href");null!==d&&(c.link=d);Sm(co,a,b)}
function eo(a,b){b[b.length-1].extensionsNode_=a}function fo(a,b){var c=b[0],d=O({flatCoordinates:[]},go,a,b);if(d){var e=d.flatCoordinates;delete d.flatCoordinates;var f=new P(null);f.ba("XYZM",e);$m(f,!1,c);c=new Am(f);c.G(d);return c}}function ho(a,b){var c=b[0],d=O({flatCoordinates:[],ends:[]},io,a,b);if(d){var e=d.flatCoordinates;delete d.flatCoordinates;var f=d.ends;delete d.ends;var g=new Q(null);g.ba("XYZM",e,f);$m(g,!1,c);c=new Am(g);c.G(d);return c}}
function jo(a,b){var c=b[0],d=O({},ko,a,b);if(d){var e=ao([],a,d),e=new C(e,"XYZM");$m(e,!1,c);c=new Am(e);c.G(d);return c}}
var lo={rte:fo,trk:ho,wpt:jo},mo=N($n,{rte:Km(fo),trk:Km(ho),wpt:Km(jo)}),co=N($n,{text:K(T,"linkText"),type:K(T,"linkType")}),go=N($n,{name:K(T),cmt:K(T),desc:K(T),src:K(T),link:bo,number:K(Jn),extensions:eo,type:K(T),rtept:function(a,b){var c=O({},no,a,b);c&&ao(b[b.length-1].flatCoordinates,a,c)}}),no=N($n,{ele:K(Hn),time:K(Gn)}),io=N($n,{name:K(T),cmt:K(T),desc:K(T),src:K(T),link:bo,number:K(Jn),type:K(T),extensions:eo,trkseg:function(a,b){var c=b[b.length-1];Sm(oo,a,b);c.ends.push(c.flatCoordinates.length)}}),
oo=N($n,{trkpt:function(a,b){var c=O({},po,a,b);c&&ao(b[b.length-1].flatCoordinates,a,c)}}),po=N($n,{ele:K(Hn),time:K(Gn)}),ko=N($n,{ele:K(Hn),time:K(Gn),magvar:K(Hn),geoidheight:K(Hn),name:K(T),cmt:K(T),desc:K(T),src:K(T),link:bo,sym:K(T),type:K(T),fix:K(T),sat:K(Jn),hdop:K(Hn),vdop:K(Hn),pdop:K(Hn),ageofdgpsdata:K(Hn),dgpsid:K(Jn),extensions:eo});
function qo(a,b){b||(b=[]);for(var c=0,d=b.length;c<d;++c){var e=b[c];if(a.b){var f=e.get("extensionsNode_")||null;a.b(e,f)}e.set("extensionsNode_",void 0)}}Zn.prototype.Mh=function(a,b){if(!bb($n,a.namespaceURI))return null;var c=lo[a.localName];if(!c)return null;c=c(a,[Ym(this,a,b)]);if(!c)return null;qo(this,[c]);return c};Zn.prototype.nc=function(a,b){if(!bb($n,a.namespaceURI))return[];if("gpx"==a.localName){var c=O([],mo,a,[Ym(this,a,b)]);if(c)return qo(this,c),c}return[]};
function ro(a,b,c){a.setAttribute("href",b);b=c[c.length-1].properties;Tm({node:a},so,Qm,[b.linkText,b.linkType],c,to)}function uo(a,b,c){var d=c[c.length-1],e=d.node.namespaceURI,f=d.properties;a.setAttributeNS(null,"lat",b[1]);a.setAttributeNS(null,"lon",b[0]);switch(d.geometryLayout){case "XYZM":0!==b[3]&&(f.time=b[3]);case "XYZ":0!==b[2]&&(f.ele=b[2]);break;case "XYM":0!==b[2]&&(f.time=b[2])}b="rtept"==a.nodeName?vo[e]:wo[e];d=Rm(f,b);Tm({node:a,properties:f},xo,Qm,d,c,b)}
var to=["text","type"],so=N($n,{text:L(Mn),type:L(Mn)}),yo=N($n,"name cmt desc src link number type rtept".split(" ")),zo=N($n,{name:L(Mn),cmt:L(Mn),desc:L(Mn),src:L(Mn),link:L(ro),number:L(On),type:L(Mn),rtept:Nm(L(uo))}),vo=N($n,["ele","time"]),Ao=N($n,"name cmt desc src link number type trkseg".split(" ")),Do=N($n,{name:L(Mn),cmt:L(Mn),desc:L(Mn),src:L(Mn),link:L(ro),number:L(On),type:L(Mn),trkseg:Nm(L(function(a,b,c){Tm({node:a,geometryLayout:b.ka,properties:{}},Bo,Co,b.Z(),c)}))}),Co=Om("trkpt"),
Bo=N($n,{trkpt:L(uo)}),wo=N($n,"ele time magvar geoidheight name cmt desc src link sym type fix sat hdop vdop pdop ageofdgpsdata dgpsid".split(" ")),xo=N($n,{ele:L(Nn),time:L(function(a,b){var c=new Date(1E3*b);a.appendChild(Cm.createTextNode(c.getUTCFullYear()+"-"+sb(c.getUTCMonth()+1)+"-"+sb(c.getUTCDate())+"T"+sb(c.getUTCHours())+":"+sb(c.getUTCMinutes())+":"+sb(c.getUTCSeconds())+"Z"))}),magvar:L(Nn),geoidheight:L(Nn),name:L(Mn),cmt:L(Mn),desc:L(Mn),src:L(Mn),link:L(ro),sym:L(Mn),type:L(Mn),fix:L(Mn),
sat:L(On),hdop:L(Nn),vdop:L(Nn),pdop:L(Nn),ageofdgpsdata:L(Nn),dgpsid:L(On)}),Eo={Point:"wpt",LineString:"rte",MultiLineString:"trk"};function Fo(a,b){var c=a.Y();if(c&&(c=Eo[c.X()]))return Dm(b[b.length-1].node.namespaceURI,c)}
var Go=N($n,{rte:L(function(a,b,c){var d=c[0],e=b.N();a={node:a,properties:e};if(b=b.Y())b=$m(b,!0,d),a.geometryLayout=b.ka,e.rtept=b.Z();d=yo[c[c.length-1].node.namespaceURI];e=Rm(e,d);Tm(a,zo,Qm,e,c,d)}),trk:L(function(a,b,c){var d=c[0],e=b.N();a={node:a,properties:e};if(b=b.Y())b=$m(b,!0,d),e.trkseg=b.ld();d=Ao[c[c.length-1].node.namespaceURI];e=Rm(e,d);Tm(a,Do,Qm,e,c,d)}),wpt:L(function(a,b,c){var d=c[0],e=c[c.length-1];e.properties=b.N();if(b=b.Y())b=$m(b,!0,d),e.geometryLayout=b.ka,uo(a,b.Z(),
c)})});Zn.prototype.a=function(a,b){b=Zm(this,b);var c=Dm("http://www.topografix.com/GPX/1/1","gpx");c.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");c.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation","http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd");c.setAttribute("version","1.1");c.setAttribute("creator","OpenLayers 3");Tm({node:c},Go,Fo,a,[b]);return c};function Ho(){this.defaultDataProjection=null}w(Ho,Xm);function Io(a){return"string"===typeof a?a:""}k=Ho.prototype;k.X=function(){return"text"};k.Vb=function(a,b){return this.td(Io(a),Zm(this,b))};k.Fa=function(a,b){return this.Jf(Io(a),Zm(this,b))};k.Uc=function(a,b){return this.vd(Io(a),Zm(this,b))};k.Ra=function(){return this.defaultDataProjection};k.Cd=function(a,b){return this.Ge(a,Zm(this,b))};k.ac=function(a,b){return this.zi(a,Zm(this,b))};k.Yc=function(a,b){return this.Dd(a,Zm(this,b))};function Jo(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=vc("EPSG:4326");this.b=a.altitudeMode?a.altitudeMode:"none"}w(Jo,Ho);var Ko=/^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{5})([NS])(\d{3})(\d{5})([EW])([AV])(\d{5})(\d{5})/,Lo=/^H.([A-Z]{3}).*?:(.*)/,Mo=/^HFDTE(\d{2})(\d{2})(\d{2})/,No=/\r\n|\r|\n/;
Jo.prototype.td=function(a,b){var c=this.b,d=a.split(No),e={},f=[],g=2E3,h=0,l=1,m=-1,n,p;n=0;for(p=d.length;n<p;++n){var q=d[n],t;if("B"==q.charAt(0)){if(t=Ko.exec(q)){var q=parseInt(t[1],10),v=parseInt(t[2],10),u=parseInt(t[3],10),y=parseInt(t[4],10)+parseInt(t[5],10)/6E4;"S"==t[6]&&(y=-y);var E=parseInt(t[7],10)+parseInt(t[8],10)/6E4;"W"==t[9]&&(E=-E);f.push(E,y);"none"!=c&&f.push("gps"==c?parseInt(t[11],10):"barometric"==c?parseInt(t[12],10):0);t=Date.UTC(g,h,l,q,v,u);t<m&&(t=Date.UTC(g,h,l+1,
q,v,u));f.push(t/1E3);m=t}}else"H"==q.charAt(0)&&((t=Mo.exec(q))?(l=parseInt(t[1],10),h=parseInt(t[2],10)-1,g=2E3+parseInt(t[3],10)):(t=Lo.exec(q))&&(e[t[1]]=t[2].trim()))}if(0===f.length)return null;d=new P(null);d.ba("none"==c?"XYM":"XYZM",f);c=new Am($m(d,!1,b));c.G(e);return c};Jo.prototype.Jf=function(a,b){var c=this.td(a,b);return c?[c]:[]};function Oo(a,b,c,d,e,f){Sa.call(this);this.j=null;this.a=a?a:new Image;null!==d&&(this.a.crossOrigin=d);this.c=f?document.createElement("CANVAS"):null;this.l=f;this.i=null;this.f=e;this.g=c;this.o=b;this.s=!1;2==this.f&&Po(this)}w(Oo,Sa);function Po(a){var b=$e(1,1);try{b.drawImage(a.a,0,0),b.getImageData(0,0,1,1)}catch(c){a.s=!0}}Oo.prototype.v=function(){this.f=3;this.i.forEach(Ea);this.i=null;this.b("change")};
Oo.prototype.U=function(){this.f=2;this.g&&(this.a.width=this.g[0],this.a.height=this.g[1]);this.g=[this.a.width,this.a.height];this.i.forEach(Ea);this.i=null;Po(this);if(!this.s&&null!==this.l){this.c.width=this.a.width;this.c.height=this.a.height;var a=this.c.getContext("2d");a.drawImage(this.a,0,0);for(var b=a.getImageData(0,0,this.a.width,this.a.height),c=b.data,d=this.l[0]/255,e=this.l[1]/255,f=this.l[2]/255,g=0,h=c.length;g<h;g+=4)c[g]*=d,c[g+1]*=e,c[g+2]*=f;a.putImageData(b,0,0)}this.b("change")};
Oo.prototype.load=function(){if(0==this.f){this.f=1;this.i=[Ja(this.a,"error",this.v,this),Ja(this.a,"load",this.U,this)];try{this.a.src=this.o}catch(a){this.v()}}};function Qo(a){a=a||{};this.c=void 0!==a.anchor?a.anchor:[.5,.5];this.f=null;this.a=void 0!==a.anchorOrigin?a.anchorOrigin:"top-left";this.j=void 0!==a.anchorXUnits?a.anchorXUnits:"fraction";this.s=void 0!==a.anchorYUnits?a.anchorYUnits:"fraction";var b=void 0!==a.crossOrigin?a.crossOrigin:null,c=void 0!==a.img?a.img:null,d=void 0!==a.imgSize?a.imgSize:null,e=a.src;la(!(void 0!==e&&c),4);la(!c||c&&d,5);void 0!==e&&0!==e.length||!c||(e=c.src||x(c).toString());la(void 0!==e&&0<e.length,6);var f=void 0!==
a.src?0:2,g=void 0!==a.color?Ae(a.color):null,h=Zg.get(e,b,g);h||(h=new Oo(c,e,d,b,f,g),Zg.set(e,b,g,h));this.b=h;this.D=void 0!==a.offset?a.offset:[0,0];this.g=void 0!==a.offsetOrigin?a.offsetOrigin:"top-left";this.l=null;this.A=void 0!==a.size?a.size:null;Pi.call(this,{opacity:void 0!==a.opacity?a.opacity:1,rotation:void 0!==a.rotation?a.rotation:0,scale:void 0!==a.scale?a.scale:1,snapToPixel:void 0!==a.snapToPixel?a.snapToPixel:!0,rotateWithView:void 0!==a.rotateWithView?a.rotateWithView:!1})}
w(Qo,Pi);k=Qo.prototype;k.bc=function(){if(this.f)return this.f;var a=this.c,b=this.Jb();if("fraction"==this.j||"fraction"==this.s){if(!b)return null;a=this.c.slice();"fraction"==this.j&&(a[0]*=b[0]);"fraction"==this.s&&(a[1]*=b[1])}if("top-left"!=this.a){if(!b)return null;a===this.c&&(a=this.c.slice());if("top-right"==this.a||"bottom-right"==this.a)a[0]=-a[0]+b[0];if("bottom-left"==this.a||"bottom-right"==this.a)a[1]=-a[1]+b[1]}return this.f=a};k.mc=function(){var a=this.b;return a.c?a.c:a.a};
k.kd=function(){return this.b.g};k.sd=function(){return this.b.f};k.ne=function(){var a=this.b;if(!a.j)if(a.s){var b=a.g[0],c=a.g[1],d=$e(b,c);d.fillRect(0,0,b,c);a.j=d.canvas}else a.j=a.a;return a.j};k.Ka=function(){if(this.l)return this.l;var a=this.D;if("top-left"!=this.g){var b=this.Jb(),c=this.b.g;if(!b||!c)return null;a=a.slice();if("top-right"==this.g||"bottom-right"==this.g)a[0]=c[0]-b[0]-a[0];if("bottom-left"==this.g||"bottom-right"==this.g)a[1]=c[1]-b[1]-a[1]}return this.l=a};k.zn=function(){return this.b.o};
k.Jb=function(){return this.A?this.A:this.b.g};k.nf=function(a,b){return B(this.b,"change",a,b)};k.load=function(){this.b.load()};k.Wf=function(a,b){Ka(this.b,"change",a,b)};function Ro(a){a=a||{};this.g=a.font;this.i=a.rotation;this.s=a.rotateWithView;this.a=a.scale;this.v=a.text;this.j=a.textAlign;this.o=a.textBaseline;this.b=void 0!==a.fill?a.fill:new Ti({color:"#333"});this.l=void 0!==a.stroke?a.stroke:null;this.f=void 0!==a.offsetX?a.offsetX:0;this.c=void 0!==a.offsetY?a.offsetY:0}k=Ro.prototype;k.Uj=function(){return this.g};k.hk=function(){return this.f};k.ik=function(){return this.c};k.Pn=function(){return this.b};k.Qn=function(){return this.s};k.Rn=function(){return this.i};
k.Sn=function(){return this.a};k.Tn=function(){return this.l};k.Ja=function(){return this.v};k.vk=function(){return this.j};k.wk=function(){return this.o};k.Zo=function(a){this.g=a};k.ji=function(a){this.f=a};k.ki=function(a){this.c=a};k.Yo=function(a){this.b=a};k.Un=function(a){this.i=a};k.Vn=function(a){this.a=a};k.fp=function(a){this.l=a};k.mi=function(a){this.v=a};k.ni=function(a){this.j=a};k.gp=function(a){this.o=a};function So(a){a=a?a:{};zn.call(this);this.defaultDataProjection=vc("EPSG:4326");var b;a.defaultStyle?b=a.defaultStyle:(b=To)||(Uo=[255,255,255,1],Vo=new Ti({color:Uo}),Wo=[20,2],Xo=Yo="pixels",Zo=[64,64],$o="https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png",ap=.5,bp=new Qo({anchor:Wo,anchorOrigin:"bottom-left",anchorXUnits:Yo,anchorYUnits:Xo,crossOrigin:"anonymous",rotation:0,scale:ap,size:Zo,src:$o}),cp=new Yi({color:Uo,width:1}),dp=new Yi({color:[51,51,51,1],width:2}),ep=new Ro({font:"bold 16px Helvetica",
fill:Vo,stroke:dp,scale:.8}),fp=new Zi({fill:Vo,image:bp,text:ep,stroke:cp,zIndex:0}),b=To=[fp]);this.g=b;this.c=void 0!==a.extractStyles?a.extractStyles:!0;this.l=void 0!==a.writeStyles?a.writeStyles:!0;this.b={};this.i=void 0!==a.showPointNames?a.showPointNames:!0}var To,Uo,Vo,Wo,Yo,Xo,Zo,$o,ap,bp,cp,dp,ep,fp;w(So,zn);
var gp=["http://www.google.com/kml/ext/2.2"],hp=[null,"http://earth.google.com/kml/2.0","http://earth.google.com/kml/2.1","http://earth.google.com/kml/2.2","http://www.opengis.net/kml/2.2"],ip={fraction:"fraction",pixels:"pixels"};
function jp(a,b){var c,d=[0,0],e="start";if(a.a){var f=a.a.kd();f&&2==f.length&&(d[0]=a.a.i*f[0]/2,d[1]=-a.a.i*f[1]/2,e="left")}if(Ca(a.Ja()))c=new Ro({text:b,offsetX:d[0],offsetY:d[1],textAlign:e});else{var f=a.Ja(),g={};for(c in f)g[c]=f[c];c=g;c.mi(b);c.ni(e);c.ji(d[0]);c.ki(d[1])}return new Zi({text:c})}
function kp(a,b,c,d,e){return function(){var f=e,g="";f&&this.Y()&&(f="Point"===this.Y().X());f&&(g=this.get("name"),f=f&&g);if(a)return f?(f=jp(a[0],g),a.concat(f)):a;if(b){var h=lp(b,c,d);return f?(f=jp(h[0],g),h.concat(f)):h}return f?(f=jp(c[0],g),c.concat(f)):c}}function lp(a,b,c){return Array.isArray(a)?a:"string"===typeof a?(!(a in c)&&"#"+a in c&&(a="#"+a),lp(c[a],b,c)):b}
function mp(a){a=Em(a,!1);if(a=/^\s*#?\s*([0-9A-Fa-f]{8})\s*$/.exec(a))return a=a[1],[parseInt(a.substr(6,2),16),parseInt(a.substr(4,2),16),parseInt(a.substr(2,2),16),parseInt(a.substr(0,2),16)/255]}function np(a){a=Em(a,!1);for(var b=[],c=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*,\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s*,\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?))?\s*/i,d;d=c.exec(a);)b.push(parseFloat(d[1]),parseFloat(d[2]),d[3]?parseFloat(d[3]):0),a=a.substr(d[0].length);return""!==a?void 0:b}
function op(a){var b=Em(a,!1).trim();return a.baseURI?(new URL(b,a.baseURI)).href:b}function pp(a){a=Hn(a);if(void 0!==a)return Math.sqrt(a)}function qp(a,b){return O(null,rp,a,b)}function sp(a,b){var c=O({B:[],wi:[]},tp,a,b);if(c){var d=c.B,c=c.wi,e,f;e=0;for(f=Math.min(d.length,c.length);e<f;++e)d[4*e+3]=c[e];c=new P(null);c.ba("XYZM",d);return c}}function up(a,b){var c=O({},vp,a,b),d=O(null,wp,a,b);if(d){var e=new P(null);e.ba("XYZ",d);e.G(c);return e}}
function xp(a,b){var c=O({},vp,a,b),d=O(null,wp,a,b);if(d){var e=new D(null);e.ba("XYZ",d,[d.length]);e.G(c);return e}}
function yp(a,b){var c=O([],zp,a,b);if(!c)return null;if(0===c.length)return new qn(c);var d,e=!0,f=c[0].X(),g,h,l;h=1;for(l=c.length;h<l;++h)if(g=c[h],g.X()!=f){e=!1;break}if(e)if("Point"==f){d=c[0];e=d.ka;f=d.la();h=1;for(l=c.length;h<l;++h)g=c[h],eb(f,g.la());d=new R(null);d.ba(e,f);Ap(d,c)}else"LineString"==f?(d=new Q(null),fn(d,c),Ap(d,c)):"Polygon"==f?(d=new S(null),hn(d,c),Ap(d,c)):"GeometryCollection"==f?d=new qn(c):la(!1,37);else d=new qn(c);return d}
function Bp(a,b){var c=O({},vp,a,b),d=O(null,wp,a,b);if(d){var e=new C(null);e.ba("XYZ",d);e.G(c);return e}}function Cp(a,b){var c=O({},vp,a,b),d=O([null],Dp,a,b);if(d&&d[0]){var e=new D(null),f=d[0],g=[f.length],h,l;h=1;for(l=d.length;h<l;++h)eb(f,d[h]),g.push(f.length);e.ba("XYZ",f,g);e.G(c);return e}}
function Ep(a,b){var c=O({},Fp,a,b);if(!c)return null;var d="fillStyle"in c?c.fillStyle:Vo,e=c.fill;void 0===e||e||(d=null);var e="imageStyle"in c?c.imageStyle:bp,f="textStyle"in c?c.textStyle:ep,g="strokeStyle"in c?c.strokeStyle:cp,c=c.outline;void 0===c||c||(g=null);return[new Zi({fill:d,image:e,stroke:g,text:f,zIndex:void 0})]}
function Ap(a,b){var c=b.length,d=Array(b.length),e=Array(b.length),f,g,h,l;h=l=!1;for(g=0;g<c;++g)f=b[g],d[g]=f.get("extrude"),e[g]=f.get("altitudeMode"),h=h||void 0!==d[g],l=l||e[g];h&&a.set("extrude",d);l&&a.set("altitudeMode",e)}function Gp(a,b){Sm(Hp,a,b)}
var Ip=N(hp,{value:Lm(T)}),Hp=N(hp,{Data:function(a,b){var c=a.getAttribute("name");if(null!==c){var d=O(void 0,Ip,a,b);d&&(b[b.length-1][c]=d)}},SchemaData:function(a,b){Sm(Jp,a,b)}}),vp=N(hp,{extrude:K(En),altitudeMode:K(T)}),rp=N(hp,{coordinates:Lm(np)}),Dp=N(hp,{innerBoundaryIs:function(a,b){var c=O(void 0,Kp,a,b);c&&b[b.length-1].push(c)},outerBoundaryIs:function(a,b){var c=O(void 0,Lp,a,b);c&&(b[b.length-1][0]=c)}}),tp=N(hp,{when:function(a,b){var c=b[b.length-1].wi,d=Em(a,!1),d=Date.parse(d);
c.push(isNaN(d)?0:d)}},N(gp,{coord:function(a,b){var c=b[b.length-1].B,d=Em(a,!1);(d=/^\s*([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s*$/i.exec(d))?c.push(parseFloat(d[1]),parseFloat(d[2]),parseFloat(d[3]),0):c.push(0,0,0,0)}})),wp=N(hp,{coordinates:Lm(np)}),Mp=N(hp,{href:K(op)},N(gp,{x:K(Hn),y:K(Hn),w:K(Hn),h:K(Hn)})),Np=N(hp,{Icon:K(function(a,b){var c=O({},Mp,a,b);return c?c:null}),heading:K(Hn),hotSpot:K(function(a){var b=
a.getAttribute("xunits"),c=a.getAttribute("yunits");return{x:parseFloat(a.getAttribute("x")),Zf:ip[b],y:parseFloat(a.getAttribute("y")),$f:ip[c]}}),scale:K(pp)}),Kp=N(hp,{LinearRing:Lm(qp)}),Op=N(hp,{color:K(mp),scale:K(pp)}),Pp=N(hp,{color:K(mp),width:K(Hn)}),zp=N(hp,{LineString:Km(up),LinearRing:Km(xp),MultiGeometry:Km(yp),Point:Km(Bp),Polygon:Km(Cp)}),Qp=N(gp,{Track:Km(sp)}),Sp=N(hp,{ExtendedData:Gp,Link:function(a,b){Sm(Rp,a,b)},address:K(T),description:K(T),name:K(T),open:K(En),phoneNumber:K(T),
visibility:K(En)}),Rp=N(hp,{href:K(op)}),Lp=N(hp,{LinearRing:Lm(qp)}),Tp=N(hp,{Style:K(Ep),key:K(T),styleUrl:K(op)}),Vp=N(hp,{ExtendedData:Gp,MultiGeometry:K(yp,"geometry"),LineString:K(up,"geometry"),LinearRing:K(xp,"geometry"),Point:K(Bp,"geometry"),Polygon:K(Cp,"geometry"),Style:K(Ep),StyleMap:function(a,b){var c=O(void 0,Up,a,b);if(c){var d=b[b.length-1];Array.isArray(c)?d.Style=c:"string"===typeof c?d.styleUrl=c:la(!1,38)}},address:K(T),description:K(T),name:K(T),open:K(En),phoneNumber:K(T),
styleUrl:K(op),visibility:K(En)},N(gp,{MultiTrack:K(function(a,b){var c=O([],Qp,a,b);if(c){var d=new Q(null);fn(d,c);return d}},"geometry"),Track:K(sp,"geometry")})),Wp=N(hp,{color:K(mp),fill:K(En),outline:K(En)}),Jp=N(hp,{SimpleData:function(a,b){var c=a.getAttribute("name");if(null!==c){var d=T(a);b[b.length-1][c]=d}}}),Fp=N(hp,{IconStyle:function(a,b){var c=O({},Np,a,b);if(c){var d=b[b.length-1],e="Icon"in c?c.Icon:{},f;f=(f=e.href)?f:$o;var g,h,l,m=c.hotSpot;m?(g=[m.x,m.y],h=m.Zf,l=m.$f):f===
$o?(g=Wo,h=Yo,l=Xo):/^http:\/\/maps\.(?:google|gstatic)\.com\//.test(f)&&(g=[.5,0],l=h="fraction");var n,m=e.x,p=e.y;void 0!==m&&void 0!==p&&(n=[m,p]);var q,m=e.w,e=e.h;void 0!==m&&void 0!==e&&(q=[m,e]);var t,e=c.heading;void 0!==e&&(t=sa(e));c=c.scale;f==$o&&(q=Zo,void 0===c&&(c=ap));g=new Qo({anchor:g,anchorOrigin:"bottom-left",anchorXUnits:h,anchorYUnits:l,crossOrigin:"anonymous",offset:n,offsetOrigin:"bottom-left",rotation:t,scale:c,size:q,src:f});d.imageStyle=g}},LabelStyle:function(a,b){var c=
O({},Op,a,b);c&&(b[b.length-1].textStyle=new Ro({fill:new Ti({color:"color"in c?c.color:Uo}),scale:c.scale}))},LineStyle:function(a,b){var c=O({},Pp,a,b);c&&(b[b.length-1].strokeStyle=new Yi({color:"color"in c?c.color:Uo,width:"width"in c?c.width:1}))},PolyStyle:function(a,b){var c=O({},Wp,a,b);if(c){var d=b[b.length-1];d.fillStyle=new Ti({color:"color"in c?c.color:Uo});var e=c.fill;void 0!==e&&(d.fill=e);c=c.outline;void 0!==c&&(d.outline=c)}}}),Up=N(hp,{Pair:function(a,b){var c=O({},Tp,a,b);if(c){var d=
c.key;d&&"normal"==d&&((d=c.styleUrl)&&(b[b.length-1]=d),(c=c.Style)&&(b[b.length-1]=c))}}});k=So.prototype;k.Ff=function(a,b){var c=N(hp,{Document:Jm(this.Ff,this),Folder:Jm(this.Ff,this),Placemark:Km(this.Nf,this),Style:this.Io.bind(this),StyleMap:this.Ho.bind(this)});if(c=O([],c,a,b,this))return c};
k.Nf=function(a,b){var c=O({geometry:null},Vp,a,b);if(c){var d=new Am,e=a.getAttribute("id");null!==e&&d.Xb(e);var e=b[0],f=c.geometry;f&&$m(f,!1,e);d.Xa(f);delete c.geometry;this.c&&d.rf(kp(c.Style,c.styleUrl,this.g,this.b,this.i));delete c.Style;d.G(c);return d}};k.Io=function(a,b){var c=a.getAttribute("id");if(null!==c){var d=Ep(a,b);d&&(c=a.baseURI?(new URL("#"+c,a.baseURI)).href:"#"+c,this.b[c]=d)}};
k.Ho=function(a,b){var c=a.getAttribute("id");if(null!==c){var d=O(void 0,Up,a,b);d&&(c=a.baseURI?(new URL("#"+c,a.baseURI)).href:"#"+c,this.b[c]=d)}};k.Mh=function(a,b){if(!bb(hp,a.namespaceURI))return null;var c=this.Nf(a,[Ym(this,a,b)]);return c?c:null};
k.nc=function(a,b){if(!bb(hp,a.namespaceURI))return[];var c;c=a.localName;if("Document"==c||"Folder"==c)return(c=this.Ff(a,[Ym(this,a,b)]))?c:[];if("Placemark"==c)return(c=this.Nf(a,[Ym(this,a,b)]))?[c]:[];if("kml"==c){c=[];var d;for(d=a.firstElementChild;d;d=d.nextElementSibling){var e=this.nc(d,b);e&&eb(c,e)}return c}return[]};k.Co=function(a){if(Gm(a))return Xp(this,a);if(Hm(a))return Yp(this,a);if("string"===typeof a)return a=Im(a),Xp(this,a)};
function Xp(a,b){var c;for(c=b.firstChild;c;c=c.nextSibling)if(c.nodeType==Node.ELEMENT_NODE){var d=Yp(a,c);if(d)return d}}function Yp(a,b){var c;for(c=b.firstElementChild;c;c=c.nextElementSibling)if(bb(hp,c.namespaceURI)&&"name"==c.localName)return T(c);for(c=b.firstElementChild;c;c=c.nextElementSibling){var d=c.localName;if(bb(hp,c.namespaceURI)&&("Document"==d||"Folder"==d||"Placemark"==d||"kml"==d)&&(d=Yp(a,c)))return d}}
k.Do=function(a){var b=[];Gm(a)?eb(b,Zp(this,a)):Hm(a)?eb(b,$p(this,a)):"string"===typeof a&&(a=Im(a),eb(b,Zp(this,a)));return b};function Zp(a,b){var c,d=[];for(c=b.firstChild;c;c=c.nextSibling)c.nodeType==Node.ELEMENT_NODE&&eb(d,$p(a,c));return d}
function $p(a,b){var c,d=[];for(c=b.firstElementChild;c;c=c.nextElementSibling)if(bb(hp,c.namespaceURI)&&"NetworkLink"==c.localName){var e=O({},Sp,c,[]);d.push(e)}for(c=b.firstElementChild;c;c=c.nextElementSibling)e=c.localName,!bb(hp,c.namespaceURI)||"Document"!=e&&"Folder"!=e&&"kml"!=e||eb(d,$p(a,c));return d}function aq(a,b){var c=Ae(b),c=[255*(4==c.length?c[3]:1),c[2],c[1],c[0]],d;for(d=0;4>d;++d){var e=parseInt(c[d],10).toString(16);c[d]=1==e.length?"0"+e:e}Mn(a,c.join(""))}
function bq(a,b,c){a={node:a};var d=b.X(),e,f;"GeometryCollection"==d?(e=b.df(),f=cq):"MultiPoint"==d?(e=b.he(),f=dq):"MultiLineString"==d?(e=b.ld(),f=eq):"MultiPolygon"==d?(e=b.Wd(),f=fq):la(!1,39);Tm(a,gq,f,e,c)}function hq(a,b,c){Tm({node:a},iq,jq,[b],c)}
function kq(a,b,c){var d={node:a};b.Oa()&&a.setAttribute("id",b.Oa());a=b.N();var e=b.hc();e&&(e=e.call(b,0))&&(e=Array.isArray(e)?e[0]:e,this.l&&(a.Style=e),(e=e.Ja())&&(a.name=e.Ja()));e=lq[c[c.length-1].node.namespaceURI];a=Rm(a,e);Tm(d,mq,Qm,a,c,e);a=c[0];(b=b.Y())&&(b=$m(b,!0,a));Tm(d,mq,cq,[b],c)}function nq(a,b,c){var d=b.la();a={node:a};a.layout=b.ka;a.stride=b.ua();Tm(a,oq,pq,[d],c)}function qq(a,b,c){b=b.Vd();var d=b.shift();a={node:a};Tm(a,rq,sq,b,c);Tm(a,rq,tq,[d],c)}
function uq(a,b){Nn(a,Math.round(b*b*1E6)/1E6)}
var vq=N(hp,["Document","Placemark"]),yq=N(hp,{Document:L(function(a,b,c){Tm({node:a},wq,xq,b,c,void 0,this)}),Placemark:L(kq)}),wq=N(hp,{Placemark:L(kq)}),zq={Point:"Point",LineString:"LineString",LinearRing:"LinearRing",Polygon:"Polygon",MultiPoint:"MultiGeometry",MultiLineString:"MultiGeometry",MultiPolygon:"MultiGeometry",GeometryCollection:"MultiGeometry"},Aq=N(hp,["href"],N(gp,["x","y","w","h"])),Bq=N(hp,{href:L(Mn)},N(gp,{x:L(Nn),y:L(Nn),w:L(Nn),h:L(Nn)})),Cq=N(hp,["scale","heading","Icon",
"hotSpot"]),Eq=N(hp,{Icon:L(function(a,b,c){a={node:a};var d=Aq[c[c.length-1].node.namespaceURI],e=Rm(b,d);Tm(a,Bq,Qm,e,c,d);d=Aq[gp[0]];e=Rm(b,d);Tm(a,Bq,Dq,e,c,d)}),heading:L(Nn),hotSpot:L(function(a,b){a.setAttribute("x",b.x);a.setAttribute("y",b.y);a.setAttribute("xunits",b.Zf);a.setAttribute("yunits",b.$f)}),scale:L(uq)}),Fq=N(hp,["color","scale"]),Gq=N(hp,{color:L(aq),scale:L(uq)}),Hq=N(hp,["color","width"]),Iq=N(hp,{color:L(aq),width:L(Nn)}),iq=N(hp,{LinearRing:L(nq)}),gq=N(hp,{LineString:L(nq),
Point:L(nq),Polygon:L(qq),GeometryCollection:L(bq)}),lq=N(hp,"name open visibility address phoneNumber description styleUrl Style".split(" ")),mq=N(hp,{MultiGeometry:L(bq),LineString:L(nq),LinearRing:L(nq),Point:L(nq),Polygon:L(qq),Style:L(function(a,b,c){a={node:a};var d={},e=b.c,f=b.f,g=b.a;b=b.Ja();g instanceof Qo&&(d.IconStyle=g);b&&(d.LabelStyle=b);f&&(d.LineStyle=f);e&&(d.PolyStyle=e);b=Jq[c[c.length-1].node.namespaceURI];d=Rm(d,b);Tm(a,Kq,Qm,d,c,b)}),address:L(Mn),description:L(Mn),name:L(Mn),
open:L(Ln),phoneNumber:L(Mn),styleUrl:L(Mn),visibility:L(Ln)}),oq=N(hp,{coordinates:L(function(a,b,c){c=c[c.length-1];var d=c.layout;c=c.stride;var e;"XY"==d||"XYM"==d?e=2:"XYZ"==d||"XYZM"==d?e=3:la(!1,34);var f,g=b.length,h="";if(0<g){h+=b[0];for(d=1;d<e;++d)h+=","+b[d];for(f=c;f<g;f+=c)for(h+=" "+b[f],d=1;d<e;++d)h+=","+b[f+d]}Mn(a,h)})}),rq=N(hp,{outerBoundaryIs:L(hq),innerBoundaryIs:L(hq)}),Lq=N(hp,{color:L(aq)}),Jq=N(hp,["IconStyle","LabelStyle","LineStyle","PolyStyle"]),Kq=N(hp,{IconStyle:L(function(a,
b,c){a={node:a};var d={},e=b.Jb(),f=b.kd(),g={href:b.b.o};if(e){g.w=e[0];g.h=e[1];var h=b.bc(),l=b.Ka();l&&f&&0!==l[0]&&l[1]!==e[1]&&(g.x=l[0],g.y=f[1]-(l[1]+e[1]));h&&0!==h[0]&&h[1]!==e[1]&&(d.hotSpot={x:h[0],Zf:"pixels",y:e[1]-h[1],$f:"pixels"})}d.Icon=g;e=b.i;1!==e&&(d.scale=e);b=b.o;0!==b&&(d.heading=b);b=Cq[c[c.length-1].node.namespaceURI];d=Rm(d,b);Tm(a,Eq,Qm,d,c,b)}),LabelStyle:L(function(a,b,c){a={node:a};var d={},e=b.b;e&&(d.color=e.b);(b=b.a)&&1!==b&&(d.scale=b);b=Fq[c[c.length-1].node.namespaceURI];
d=Rm(d,b);Tm(a,Gq,Qm,d,c,b)}),LineStyle:L(function(a,b,c){a={node:a};var d=Hq[c[c.length-1].node.namespaceURI];b=Rm({color:b.b,width:b.a},d);Tm(a,Iq,Qm,b,c,d)}),PolyStyle:L(function(a,b,c){Tm({node:a},Lq,Mq,[b.b],c)})});function Dq(a,b,c){return Dm(gp[0],"gx:"+c)}function xq(a,b){return Dm(b[b.length-1].node.namespaceURI,"Placemark")}function cq(a,b){if(a)return Dm(b[b.length-1].node.namespaceURI,zq[a.X()])}
var Mq=Om("color"),pq=Om("coordinates"),sq=Om("innerBoundaryIs"),dq=Om("Point"),eq=Om("LineString"),jq=Om("LinearRing"),fq=Om("Polygon"),tq=Om("outerBoundaryIs");
So.prototype.a=function(a,b){b=Zm(this,b);var c=Dm(hp[4],"kml");c.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:gx",gp[0]);c.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");c.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation","http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd");var d={node:c},e={};1<a.length?e.Document=a:1==a.length&&(e.Placemark=a[0]);var f=vq[c.namespaceURI],
e=Rm(e,f);Tm(d,yq,Qm,e,[b],f,this);return c};var Nq,Oq,Pq,Qq;
(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Np=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b,f){f.read=function(a,b,d,e,f){var p;p=8*f-e-1;var q=(1<<p)-1,t=q>>1,v=-7;f=d?f-1:0;var u=d?-1:1,y=a[b+f];f+=u;d=y&(1<<-v)-1;y>>=-v;for(v+=p;0<v;d=256*d+a[b+f],f+=u,v-=8);p=d&(1<<-v)-1;d>>=-v;for(v+=e;0<v;p=256*p+a[b+f],f+=u,v-=8);if(0===d)d=1-t;else{if(d===q)return p?NaN:Infinity*(y?-1:1);p+=Math.pow(2,e);d-=t}return(y?-1:1)*p*Math.pow(2,d-
e)};f.write=function(a,b,d,e,f,p){var q,t=8*p-f-1,v=(1<<t)-1,u=v>>1,y=23===f?Math.pow(2,-24)-Math.pow(2,-77):0;p=e?0:p-1;var E=e?1:-1,z=0>b||0===b&&0>1/b?1:0;b=Math.abs(b);isNaN(b)||Infinity===b?(b=isNaN(b)?1:0,e=v):(e=Math.floor(Math.log(b)/Math.LN2),1>b*(q=Math.pow(2,-e))&&(e--,q*=2),b=1<=e+u?b+y/q:b+y*Math.pow(2,1-u),2<=b*q&&(e++,q/=2),e+u>=v?(b=0,e=v):1<=e+u?(b=(b*q-1)*Math.pow(2,f),e+=u):(b=b*Math.pow(2,u-1)*Math.pow(2,f),e=0));for(;8<=f;a[d+p]=b&255,p+=E,b/=256,f-=8);e=e<<f|b;for(t+=f;0<t;a[d+
p]=e&255,p+=E,e/=256,t-=8);a[d+p-E]|=128*z}},{}],2:[function(a,b){function f(a){var b;a&&a.length&&(b=a,a=b.length);a=new Uint8Array(a||0);b&&a.set(b);a.Xh=l.Xh;a.Yf=l.Yf;a.Ph=l.Ph;a.Bi=l.Bi;a.Mf=l.Mf;a.Ai=l.Ai;a.Gf=l.Gf;a.xi=l.xi;a.toString=l.toString;a.write=l.write;a.slice=l.slice;a.rg=l.rg;a.jj=!0;return a}function g(a){for(var b=a.length,d=[],e=0,f,g;e<b;e++){f=a.charCodeAt(e);if(55295<f&&57344>f)if(g)if(56320>f){d.push(239,191,189);g=f;continue}else f=g-55296<<10|f-56320|65536,g=null;else{56319<
f||e+1===b?d.push(239,191,189):g=f;continue}else g&&(d.push(239,191,189),g=null);128>f?d.push(f):2048>f?d.push(f>>6|192,f&63|128):65536>f?d.push(f>>12|224,f>>6&63|128,f&63|128):d.push(f>>18|240,f>>12&63|128,f>>6&63|128,f&63|128)}return d}b.ja=f;var h=a("ieee754"),l,m,n;l={Xh:function(a){return(this[a]|this[a+1]<<8|this[a+2]<<16)+16777216*this[a+3]},Yf:function(a,b){this[b]=a;this[b+1]=a>>>8;this[b+2]=a>>>16;this[b+3]=a>>>24},Ph:function(a){return(this[a]|this[a+1]<<8|this[a+2]<<16)+(this[a+3]<<24)},
Mf:function(a){return h.read(this,a,!0,23,4)},Gf:function(a){return h.read(this,a,!0,52,8)},Ai:function(a,b){return h.write(this,a,b,!0,23,4)},xi:function(a,b){return h.write(this,a,b,!0,52,8)},toString:function(a,b,d){var e=a="";d=Math.min(this.length,d||this.length);for(b=b||0;b<d;b++){var f=this[b];127>=f?(a+=decodeURIComponent(e)+String.fromCharCode(f),e=""):e+="%"+f.toString(16)}return a+=decodeURIComponent(e)},write:function(a,b){for(var d=a===m?n:g(a),e=0;e<d.length;e++)this[b+e]=d[e]},slice:function(a,
b){return this.subarray(a,b)},rg:function(a,b){b=b||0;for(var d=0;d<this.length;d++)a[b+d]=this[d]}};l.Bi=l.Yf;f.byteLength=function(a){m=a;n=g(a);return n.length};f.isBuffer=function(a){return!(!a||!a.jj)}},{ieee754:1}],3:[function(a,b){(function(f){function g(a){this.Gb=l.isBuffer(a)?a:new l(a||0);this.da=0;this.length=this.Gb.length}function h(a,b){var d=b.Gb,e;e=d[b.da++];a+=268435456*(e&127);if(128>e)return a;e=d[b.da++];a+=34359738368*(e&127);if(128>e)return a;e=d[b.da++];a+=4398046511104*(e&
127);if(128>e)return a;e=d[b.da++];a+=562949953421312*(e&127);if(128>e)return a;e=d[b.da++];a+=72057594037927936*(e&127);if(128>e)return a;e=d[b.da++];if(128>e)return a+0x7fffffffffffffff*(e&127);throw Error("Expected varint not more than 10 bytes");}b.ja=g;var l=f.xp||a("./buffer");g.f=0;g.g=1;g.b=2;g.a=5;var m=Math.pow(2,63);g.prototype={Kf:function(a,b,d){for(d=d||this.length;this.da<d;){var e=this.Da(),f=this.da;a(e>>3,b,this);this.da===f&&this.lp(e)}return b},yo:function(){var a=this.Gb.Mf(this.da);
this.da+=4;return a},uo:function(){var a=this.Gb.Gf(this.da);this.da+=8;return a},Da:function(){var a=this.Gb,b,d;d=a[this.da++];b=d&127;if(128>d)return b;d=a[this.da++];b|=(d&127)<<7;if(128>d)return b;d=a[this.da++];b|=(d&127)<<14;if(128>d)return b;d=a[this.da++];b|=(d&127)<<21;return 128>d?b:h(b,this)},Jo:function(){var a=this.da,b=this.Da();if(b<m)return b;for(var d=this.da-2;255===this.Gb[d];)d--;d<a&&(d=a);for(var e=b=0;e<d-a+1;e++)var f=~this.Gb[a+e]&127,b=b+(4>e?f<<7*e:f*Math.pow(2,7*e));return-b-
1},wd:function(){var a=this.Da();return 1===a%2?(a+1)/-2:a/2},so:function(){return!!this.Da()},Pf:function(){var a=this.Da()+this.da,b=this.Gb.toString("utf8",this.da,a);this.da=a;return b},lp:function(a){a&=7;if(a===g.f)for(;127<this.Gb[this.da++];);else if(a===g.b)this.da=this.Da()+this.da;else if(a===g.a)this.da+=4;else if(a===g.g)this.da+=8;else throw Error("Unimplemented type: "+a);}}}).call(this,"undefined"!==typeof global?global:"undefined"!==typeof self?self:"undefined"!==typeof window?window:
{})},{"./buffer":2}]},{},[3])(3)});Nq=b.ja})();(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Qp=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b){function f(a,b){this.x=a;this.y=b}b.ja=f;f.prototype={clone:function(){return new f(this.x,this.y)},add:function(a){return this.clone().bj(a)},rotate:function(a){return this.clone().mj(a)},round:function(){return this.clone().nj()},angle:function(){return Math.atan2(this.y,this.x)},bj:function(a){this.x+=a.x;this.y+=a.y;return this},mj:function(a){var b=
Math.cos(a);a=Math.sin(a);var d=a*this.x+b*this.y;this.x=b*this.x-a*this.y;this.y=d;return this},nj:function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this}};f.b=function(a){return a instanceof f?a:Array.isArray(a)?new f(a[0],a[1]):a}},{}],2:[function(a,b){b.ja.aj=a("./lib/vectortile.js");b.ja.Kp=a("./lib/vectortilefeature.js");b.ja.Lp=a("./lib/vectortilelayer.js")},{"./lib/vectortile.js":3,"./lib/vectortilefeature.js":4,"./lib/vectortilelayer.js":5}],3:[function(a,b){function f(a,
b,d){3===a&&(a=new g(d,d.Da()+d.da),a.length&&(b[a.name]=a))}var g=a("./vectortilelayer");b.ja=function(a,b){this.layers=a.Kf(f,{},b)}},{"./vectortilelayer":5}],4:[function(a,b){function f(a,b,d,e,f){this.properties={};this.extent=d;this.type=0;this.qc=a;this.Oe=-1;this.Hd=e;this.Jd=f;a.Kf(g,this,b)}function g(a,b,d){if(1==a)b.id=d.Da();else if(2==a)for(a=d.Da()+d.da;d.da<a;){var e=b.Hd[d.Da()],f=b.Jd[d.Da()];b.properties[e]=f}else 3==a?b.type=d.Da():4==a&&(b.Oe=d.da)}var h=a("point-geometry");b.ja=
f;f.b=["Unknown","Point","LineString","Polygon"];f.prototype.Sg=function(){var a=this.qc;a.da=this.Oe;for(var b=a.Da()+a.da,d=1,e=0,f=0,g=0,v=[],u;a.da<b;)if(e||(e=a.Da(),d=e&7,e>>=3),e--,1===d||2===d)f+=a.wd(),g+=a.wd(),1===d&&(u&&v.push(u),u=[]),u.push(new h(f,g));else if(7===d)u&&u.push(u[0].clone());else throw Error("unknown command "+d);u&&v.push(u);return v};f.prototype.bbox=function(){var a=this.qc;a.da=this.Oe;for(var b=a.Da()+a.da,d=1,e=0,f=0,g=0,h=Infinity,u=-Infinity,y=Infinity,E=-Infinity;a.da<
b;)if(e||(e=a.Da(),d=e&7,e>>=3),e--,1===d||2===d)f+=a.wd(),g+=a.wd(),f<h&&(h=f),f>u&&(u=f),g<y&&(y=g),g>E&&(E=g);else if(7!==d)throw Error("unknown command "+d);return[h,y,u,E]}},{"point-geometry":1}],5:[function(a,b){function f(a,b){this.version=1;this.name=null;this.extent=4096;this.length=0;this.qc=a;this.Hd=[];this.Jd=[];this.Gd=[];a.Kf(g,this,b);this.length=this.Gd.length}function g(a,b,d){15===a?b.version=d.Da():1===a?b.name=d.Pf():5===a?b.extent=d.Da():2===a?b.Gd.push(d.da):3===a?b.Hd.push(d.Pf()):
4===a&&b.Jd.push(h(d))}function h(a){for(var b=null,d=a.Da()+a.da;a.da<d;)b=a.Da()>>3,b=1===b?a.Pf():2===b?a.yo():3===b?a.uo():4===b?a.Jo():5===b?a.Da():6===b?a.wd():7===b?a.so():null;return b}var l=a("./vectortilefeature.js");b.ja=f;f.prototype.feature=function(a){if(0>a||a>=this.Gd.length)throw Error("feature index out of bounds");this.qc.da=this.Gd[a];a=this.qc.Da()+this.qc.da;return new l(this.qc,a,this.extent,this.Hd,this.Jd)}},{"./vectortilefeature.js":4}]},{},[2])(2)});Oq=b.ja})();function Rq(a,b,c,d){this.g=a;this.b=b;this.c=c;this.f=d}k=Rq.prototype;k.get=function(a){return this.f[a]};k.Hb=function(){return this.c};k.C=function(){this.a||(this.a="Point"===this.g?Rb(this.b):Sb(this.b,0,this.b.length,2));return this.a};k.Qb=function(){return this.b};k.la=Rq.prototype.Qb;k.Y=function(){return this};k.Im=function(){return this.f};k.md=Rq.prototype.Y;k.ua=function(){return 2};k.hc=ha;k.X=function(){return this.g};function Sq(a){this.defaultDataProjection=null;a=a?a:{};this.defaultDataProjection=new sc({code:"",units:"tile-pixels"});this.b=a.featureClass?a.featureClass:Rq;this.g=a.geometryName?a.geometryName:"geometry";this.a=a.layerName?a.layerName:"layer";this.f=a.layers?a.layers:null}w(Sq,Xm);Sq.prototype.X=function(){return"arraybuffer"};
Sq.prototype.Fa=function(a,b){var c=this.f,d=new Nq(a),d=new Oq.aj(d),e=[],f=this.b,g,h,l;for(l in d.layers)if(!c||-1!=c.indexOf(l)){g=d.layers[l];for(var m=0,n=g.length;m<n;++m){if(f===Rq){var p=g.feature(m);h=l;var q=p.Sg(),t=[],v=[];Tq(q,v,t);var u=p.type,y=void 0;1===u?y=1===q.length?"Point":"MultiPoint":2===u?y=1===q.length?"LineString":"MultiLineString":3===u&&(y="Polygon");p=p.properties;p[this.a]=h;h=new this.b(y,v,t,p)}else{q=g.feature(m);p=l;y=b;h=new this.b;t=q.id;v=q.properties;v[this.a]=
p;p=q.type;if(0===p)p=null;else{var q=q.Sg(),u=[],E=[];Tq(q,E,u);var z=void 0;1===p?z=1===q.length?new C(null):new R(null):2===p?1===q.length?z=new P(null):z=new Q(null):3===p&&(z=new D(null));z.ba("XY",E,u);p=z}(y=$m(p,!1,Zm(this,y)))&&(v[this.g]=y);h.Xb(t);h.G(v);h.Cc(this.g)}e.push(h)}}return e};Sq.prototype.Ra=function(){return this.defaultDataProjection};Sq.prototype.c=function(a){this.f=a};
function Tq(a,b,c){for(var d=0,e=0,f=a.length;e<f;++e){var g=a[e],h,l;h=0;for(l=g.length;h<l;++h){var m=g[h];b.push(m.x,m.y)}d+=2*h;c.push(d)}};function Uq(a){this.Kb=a};function Vq(a){this.Kb=a}w(Vq,Uq);function Wq(a,b,c){this.Kb=a;this.b=b;this.a=c}w(Wq,Vq);function Xq(a,b){Wq.call(this,"And",a,b)}w(Xq,Wq);function Yq(a,b,c){this.Kb="BBOX";this.geometryName=a;this.extent=b;this.srsName=c}w(Yq,Uq);function Zq(a,b){this.Kb=a;this.b=b}w(Zq,Uq);function $q(a,b,c,d){Zq.call(this,a,b);this.g=c;this.a=d}w($q,Zq);function ar(a,b,c){$q.call(this,"PropertyIsEqualTo",a,b,c)}w(ar,$q);function br(a,b){$q.call(this,"PropertyIsGreaterThan",a,b)}w(br,$q);function cr(a,b){$q.call(this,"PropertyIsGreaterThanOrEqualTo",a,b)}w(cr,$q);function dr(a,b,c,d){this.Kb=a;this.geometryName=b||"the_geom";this.geometry=c;this.srsName=d}w(dr,Uq);function er(a,b,c){dr.call(this,"Intersects",a,b,c)}w(er,dr);function fr(a,b,c){Zq.call(this,"PropertyIsBetween",a);this.a=b;this.g=c}w(fr,Zq);function gr(a,b,c,d,e,f){Zq.call(this,"PropertyIsLike",a);this.f=b;this.i=void 0!==c?c:"*";this.c=void 0!==d?d:".";this.g=void 0!==e?e:"!";this.a=f}w(gr,Zq);function hr(a){Zq.call(this,"PropertyIsNull",a)}w(hr,Zq);function ir(a,b){$q.call(this,"PropertyIsLessThan",a,b)}w(ir,$q);function jr(a,b){$q.call(this,"PropertyIsLessThanOrEqualTo",a,b)}w(jr,$q);function kr(a){this.Kb="Not";this.condition=a}w(kr,Vq);function lr(a,b,c){$q.call(this,"PropertyIsNotEqualTo",a,b,c)}w(lr,$q);function mr(a,b){Wq.call(this,"Or",a,b)}w(mr,Wq);function nr(a,b,c){dr.call(this,"Within",a,b,c)}w(nr,dr);function or(a,b){return new Xq(a,b)}function pr(a,b,c){return new Yq(a,b,c)};function qr(){zn.call(this);this.defaultDataProjection=vc("EPSG:4326")}w(qr,zn);function rr(a,b){b[b.length-1].Bd[a.getAttribute("k")]=a.getAttribute("v")}
var sr=[null],tr=N(sr,{nd:function(a,b){b[b.length-1].Pc.push(a.getAttribute("ref"))},tag:rr}),vr=N(sr,{node:function(a,b){var c=b[0],d=b[b.length-1],e=a.getAttribute("id"),f=[parseFloat(a.getAttribute("lon")),parseFloat(a.getAttribute("lat"))];d.Wg[e]=f;var g=O({Bd:{}},ur,a,b);Ca(g.Bd)||(f=new C(f),$m(f,!1,c),c=new Am(f),c.Xb(e),c.G(g.Bd),d.features.push(c))},way:function(a,b){for(var c=b[0],d=a.getAttribute("id"),e=O({Pc:[],Bd:{}},tr,a,b),f=b[b.length-1],g=[],h=0,l=e.Pc.length;h<l;h++)eb(g,f.Wg[e.Pc[h]]);
e.Pc[0]==e.Pc[e.Pc.length-1]?(h=new D(null),h.ba("XY",g,[g.length])):(h=new P(null),h.ba("XY",g));$m(h,!1,c);c=new Am(h);c.Xb(d);c.G(e.Bd);f.features.push(c)}}),ur=N(sr,{tag:rr});qr.prototype.nc=function(a,b){var c=Ym(this,a,b);return"osm"==a.localName&&(c=O({Wg:{},features:[]},vr,a,[c]),c.features)?c.features:[]};function wr(a){return a.getAttributeNS("http://www.w3.org/1999/xlink","href")};function xr(){}xr.prototype.read=function(a){return Gm(a)?this.a(a):Hm(a)?this.b(a):"string"===typeof a?(a=Im(a),this.a(a)):null};function yr(){}w(yr,xr);yr.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.b(a);return null};yr.prototype.b=function(a){return(a=O({},zr,a,[]))?a:null};
var Ar=[null,"http://www.opengis.net/ows/1.1"],zr=N(Ar,{ServiceIdentification:K(function(a,b){return O({},Br,a,b)}),ServiceProvider:K(function(a,b){return O({},Cr,a,b)}),OperationsMetadata:K(function(a,b){return O({},Dr,a,b)})}),Er=N(Ar,{DeliveryPoint:K(T),City:K(T),AdministrativeArea:K(T),PostalCode:K(T),Country:K(T),ElectronicMailAddress:K(T)}),Fr=N(Ar,{Value:Mm(function(a){return T(a)})}),Gr=N(Ar,{AllowedValues:K(function(a,b){return O({},Fr,a,b)})}),Ir=N(Ar,{Phone:K(function(a,b){return O({},
Hr,a,b)}),Address:K(function(a,b){return O({},Er,a,b)})}),Kr=N(Ar,{HTTP:K(function(a,b){return O({},Jr,a,b)})}),Jr=N(Ar,{Get:Mm(function(a,b){var c=wr(a);return c?O({href:c},Lr,a,b):void 0}),Post:void 0}),Mr=N(Ar,{DCP:K(function(a,b){return O({},Kr,a,b)})}),Dr=N(Ar,{Operation:function(a,b){var c=a.getAttribute("name"),d=O({},Mr,a,b);d&&(b[b.length-1][c]=d)}}),Hr=N(Ar,{Voice:K(T),Facsimile:K(T)}),Lr=N(Ar,{Constraint:Mm(function(a,b){var c=a.getAttribute("name");return c?O({name:c},Gr,a,b):void 0})}),
Nr=N(Ar,{IndividualName:K(T),PositionName:K(T),ContactInfo:K(function(a,b){return O({},Ir,a,b)})}),Br=N(Ar,{Title:K(T),ServiceTypeVersion:K(T),ServiceType:K(T)}),Cr=N(Ar,{ProviderName:K(T),ProviderSite:K(wr),ServiceContact:K(function(a,b){return O({},Nr,a,b)})});function Or(a,b,c,d){var e;void 0!==d?e=d:e=[];for(var f=d=0;f<b;){var g=a[f++];e[d++]=a[f++];e[d++]=g;for(g=2;g<c;++g)e[d++]=a[f++]}e.length=d};function Pr(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=vc("EPSG:4326");this.b=a.factor?a.factor:1E5;this.a=a.geometryLayout?a.geometryLayout:"XY"}w(Pr,Ho);function Qr(a,b,c){var d,e=Array(b);for(d=0;d<b;++d)e[d]=0;var f,g;f=0;for(g=a.length;f<g;)for(d=0;d<b;++d,++f){var h=a[f],l=h-e[d];e[d]=h;a[f]=l}return Rr(a,c?c:1E5)}
function Sr(a,b,c){var d,e=Array(b);for(d=0;d<b;++d)e[d]=0;a=Tr(a,c?c:1E5);var f;c=0;for(f=a.length;c<f;)for(d=0;d<b;++d,++c)e[d]+=a[c],a[c]=e[d];return a}function Rr(a,b){var c=b?b:1E5,d,e;d=0;for(e=a.length;d<e;++d)a[d]=Math.round(a[d]*c);c=0;for(d=a.length;c<d;++c)e=a[c],a[c]=0>e?~(e<<1):e<<1;c="";d=0;for(e=a.length;d<e;++d){for(var f=a[d],g,h="";32<=f;)g=(32|f&31)+63,h+=String.fromCharCode(g),f>>=5;h+=String.fromCharCode(f+63);c+=h}return c}
function Tr(a,b){var c=b?b:1E5,d=[],e=0,f=0,g,h;g=0;for(h=a.length;g<h;++g){var l=a.charCodeAt(g)-63,e=e|(l&31)<<f;32>l?(d.push(e),f=e=0):f+=5}e=0;for(f=d.length;e<f;++e)g=d[e],d[e]=g&1?~(g>>1):g>>1;e=0;for(f=d.length;e<f;++e)d[e]/=c;return d}k=Pr.prototype;k.td=function(a,b){var c=this.vd(a,b);return new Am(c)};k.Jf=function(a,b){return[this.td(a,b)]};k.vd=function(a,b){var c=Tc(this.a),d=Sr(a,c,this.b);Or(d,d.length,c,d);c=fd(d,0,d.length,c);return $m(new P(c,this.a),!1,Zm(this,b))};
k.Ge=function(a,b){var c=a.Y();if(c)return this.Dd(c,b);la(!1,40);return""};k.zi=function(a,b){return this.Ge(a[0],b)};k.Dd=function(a,b){a=$m(a,!0,Zm(this,b));var c=a.la(),d=a.ua();Or(c,c.length,d,c);return Qr(c,d,this.b)};function Ur(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=vc(a.defaultDataProjection?a.defaultDataProjection:"EPSG:4326")}w(Ur,an);function Vr(a,b){var c=[],d,e,f,g;f=0;for(g=a.length;f<g;++f)d=a[f],0<f&&c.pop(),0<=d?e=b[d]:e=b[~d].slice().reverse(),c.push.apply(c,e);d=0;for(e=c.length;d<e;++d)c[d]=c[d].slice();return c}function Wr(a,b,c,d,e){a=a.geometries;var f=[],g,h;g=0;for(h=a.length;g<h;++g)f[g]=Xr(a[g],b,c,d,e);return f}
function Xr(a,b,c,d,e){var f=a.type,g=Yr[f];b="Point"===f||"MultiPoint"===f?g(a,c,d):g(a,b);c=new Am;c.Xa($m(b,!1,e));void 0!==a.id&&c.Xb(a.id);a.properties&&c.G(a.properties);return c}
Ur.prototype.If=function(a,b){if("Topology"==a.type){var c,d=null,e=null;a.transform&&(c=a.transform,d=c.scale,e=c.translate);var f=a.arcs;if(c){c=d;var g=e,h,l;h=0;for(l=f.length;h<l;++h){var m=f[h],n=c,p=g,q=0,t=0,v,u,y;u=0;for(y=m.length;u<y;++u)v=m[u],q+=v[0],t+=v[1],v[0]=q,v[1]=t,Zr(v,n,p)}}c=[];g=Ba(a.objects);h=0;for(l=g.length;h<l;++h)"GeometryCollection"===g[h].type?(m=g[h],c.push.apply(c,Wr(m,f,d,e,b))):(m=g[h],c.push(Xr(m,f,d,e,b)));return c}return[]};
function Zr(a,b,c){a[0]=a[0]*b[0]+c[0];a[1]=a[1]*b[1]+c[1]}Ur.prototype.Ra=function(){return this.defaultDataProjection};
var Yr={Point:function(a,b,c){a=a.coordinates;b&&c&&Zr(a,b,c);return new C(a)},LineString:function(a,b){var c=Vr(a.arcs,b);return new P(c)},Polygon:function(a,b){var c=[],d,e;d=0;for(e=a.arcs.length;d<e;++d)c[d]=Vr(a.arcs[d],b);return new D(c)},MultiPoint:function(a,b,c){a=a.coordinates;var d,e;if(b&&c)for(d=0,e=a.length;d<e;++d)Zr(a[d],b,c);return new R(a)},MultiLineString:function(a,b){var c=[],d,e;d=0;for(e=a.arcs.length;d<e;++d)c[d]=Vr(a.arcs[d],b);return new Q(c)},MultiPolygon:function(a,b){var c=
[],d,e,f,g,h,l;h=0;for(l=a.arcs.length;h<l;++h){d=a.arcs[h];e=[];f=0;for(g=d.length;f<g;++f)e[f]=Vr(d[f],b);c[h]=e}return new S(c)}};function $r(a){a=a?a:{};this.i=a.featureType;this.g=a.featureNS;this.b=a.gmlFormat?a.gmlFormat:new Pn;this.c=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd";zn.call(this)}w($r,zn);$r.prototype.nc=function(a,b){var c={featureType:this.i,featureNS:this.g};za(c,Ym(this,a,b?b:{}));c=[c];this.b.b["http://www.opengis.net/gml"].featureMember=Km(Cn.prototype.ud);(c=O([],this.b.b,a,c,this.b))||(c=[]);return c};
$r.prototype.j=function(a){if(Gm(a))return as(a);if(Hm(a))return O({},bs,a,[]);if("string"===typeof a)return a=Im(a),as(a)};$r.prototype.l=function(a){if(Gm(a))return cs(this,a);if(Hm(a))return ds(this,a);if("string"===typeof a)return a=Im(a),cs(this,a)};function cs(a,b){for(var c=b.firstChild;c;c=c.nextSibling)if(c.nodeType==Node.ELEMENT_NODE)return ds(a,c)}var es={"http://www.opengis.net/gml":{boundedBy:K(Cn.prototype.xe,"bounds")}};
function ds(a,b){var c={},d=Kn(b.getAttribute("numberOfFeatures"));c.numberOfFeatures=d;return O(c,es,b,[],a.b)}
var fs={"http://www.opengis.net/wfs":{totalInserted:K(Jn),totalUpdated:K(Jn),totalDeleted:K(Jn)}},gs={"http://www.opengis.net/ogc":{FeatureId:Km(function(a){return a.getAttribute("fid")})}},hs={"http://www.opengis.net/wfs":{Feature:function(a,b){Sm(gs,a,b)}}},bs={"http://www.opengis.net/wfs":{TransactionSummary:K(function(a,b){return O({},fs,a,b)},"transactionSummary"),InsertResults:K(function(a,b){return O([],hs,a,b)},"insertIds")}};
function as(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return O({},bs,a,[])}var is={"http://www.opengis.net/wfs":{PropertyName:L(Mn)}};function js(a,b){var c=Dm("http://www.opengis.net/ogc","Filter"),d=Dm("http://www.opengis.net/ogc","FeatureId");c.appendChild(d);d.setAttribute("fid",b);a.appendChild(c)}
var ks={"http://www.opengis.net/wfs":{Insert:L(function(a,b,c){var d=c[c.length-1],d=Dm(d.featureNS,d.featureType);a.appendChild(d);Pn.prototype.yi(d,b,c)}),Update:L(function(a,b,c){var d=c[c.length-1];la(void 0!==b.Oa(),27);var e=d.featureType,f=d.featurePrefix,f=f?f:"feature",g=d.featureNS;a.setAttribute("typeName",f+":"+e);a.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:"+f,g);e=b.Oa();if(void 0!==e){for(var f=b.P(),g=[],h=0,l=f.length;h<l;h++){var m=b.get(f[h]);void 0!==m&&g.push({name:f[h],
value:m})}Tm({node:a,srsName:d.srsName},ks,Om("Property"),g,c);js(a,e)}}),Delete:L(function(a,b,c){var d=c[c.length-1];la(void 0!==b.Oa(),26);c=d.featureType;var e=d.featurePrefix,e=e?e:"feature",d=d.featureNS;a.setAttribute("typeName",e+":"+c);a.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:"+e,d);b=b.Oa();void 0!==b&&js(a,b)}),Property:L(function(a,b,c){var d=Dm("http://www.opengis.net/wfs","Name");a.appendChild(d);Mn(d,b.name);void 0!==b.value&&null!==b.value&&(d=Dm("http://www.opengis.net/wfs",
"Value"),a.appendChild(d),b.value instanceof Qc?Pn.prototype.Zc(d,b.value,c):Mn(d,b.value))}),Native:L(function(a,b){b.tp&&a.setAttribute("vendorId",b.tp);void 0!==b.Vo&&a.setAttribute("safeToIgnore",b.Vo);void 0!==b.value&&Mn(a,b.value)})}};function ls(a,b,c){a={node:a};var d=b.b;Tm(a,ms,Om(d.Kb),[d],c);b=b.a;Tm(a,ms,Om(b.Kb),[b],c)}function ns(a,b){void 0!==b.a&&a.setAttribute("matchCase",b.a.toString());os(a,b.b);ps("Literal",a,""+b.g)}
function ps(a,b,c){a=Dm("http://www.opengis.net/ogc",a);Mn(a,c);b.appendChild(a)}function os(a,b){ps("PropertyName",a,b)}
var ms={"http://www.opengis.net/wfs":{Query:L(function(a,b,c){var d=c[c.length-1],e=d.featurePrefix,f=d.featureNS,g=d.propertyNames,h=d.srsName;a.setAttribute("typeName",(e?e+":":"")+b);h&&a.setAttribute("srsName",h);f&&a.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:"+e,f);b=za({},d);b.node=a;Tm(b,is,Om("PropertyName"),g,c);if(d=d.filter)g=Dm("http://www.opengis.net/ogc","Filter"),a.appendChild(g),Tm({node:g},ms,Om(d.Kb),[d],c)})},"http://www.opengis.net/ogc":{And:L(ls),Or:L(ls),Not:L(function(a,
b,c){b=b.condition;Tm({node:a},ms,Om(b.Kb),[b],c)}),BBOX:L(function(a,b,c){c[c.length-1].srsName=b.srsName;os(a,b.geometryName);Pn.prototype.Zc(a,b.extent,c)}),Intersects:L(function(a,b,c){c[c.length-1].srsName=b.srsName;os(a,b.geometryName);Pn.prototype.Zc(a,b.geometry,c)}),Within:L(function(a,b,c){c[c.length-1].srsName=b.srsName;os(a,b.geometryName);Pn.prototype.Zc(a,b.geometry,c)}),PropertyIsEqualTo:L(ns),PropertyIsNotEqualTo:L(ns),PropertyIsLessThan:L(ns),PropertyIsLessThanOrEqualTo:L(ns),PropertyIsGreaterThan:L(ns),
PropertyIsGreaterThanOrEqualTo:L(ns),PropertyIsNull:L(function(a,b){os(a,b.b)}),PropertyIsBetween:L(function(a,b){os(a,b.b);ps("LowerBoundary",a,""+b.a);ps("UpperBoundary",a,""+b.g)}),PropertyIsLike:L(function(a,b){a.setAttribute("wildCard",b.i);a.setAttribute("singleChar",b.c);a.setAttribute("escapeChar",b.g);void 0!==b.a&&a.setAttribute("matchCase",b.a.toString());os(a,b.b);ps("Literal",a,""+b.f)})}};
$r.prototype.o=function(a){var b=Dm("http://www.opengis.net/wfs","GetFeature");b.setAttribute("service","WFS");b.setAttribute("version","1.1.0");var c;if(a&&(a.handle&&b.setAttribute("handle",a.handle),a.outputFormat&&b.setAttribute("outputFormat",a.outputFormat),void 0!==a.maxFeatures&&b.setAttribute("maxFeatures",a.maxFeatures),a.resultType&&b.setAttribute("resultType",a.resultType),void 0!==a.startIndex&&b.setAttribute("startIndex",a.startIndex),void 0!==a.count&&b.setAttribute("count",a.count),
c=a.filter,a.bbox)){la(a.geometryName,12);var d=pr(a.geometryName,a.bbox,a.srsName);c?c=or(c,d):c=d}b.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.c);c={node:b,srsName:a.srsName,featureNS:a.featureNS?a.featureNS:this.g,featurePrefix:a.featurePrefix,geometryName:a.geometryName,filter:c,propertyNames:a.propertyNames?a.propertyNames:[]};la(Array.isArray(a.featureTypes),11);a=a.featureTypes;c=[c];d=za({},c[c.length-1]);d.node=b;Tm(d,ms,Om("Query"),a,c);return b};
$r.prototype.U=function(a,b,c,d){var e=[],f=Dm("http://www.opengis.net/wfs","Transaction");f.setAttribute("service","WFS");f.setAttribute("version","1.1.0");var g,h;d&&(g=d.gmlOptions?d.gmlOptions:{},d.handle&&f.setAttribute("handle",d.handle));f.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.c);a&&(h={node:f,featureNS:d.featureNS,featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},za(h,g),Tm(h,ks,Om("Insert"),a,e));b&&(h={node:f,featureNS:d.featureNS,
featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},za(h,g),Tm(h,ks,Om("Update"),b,e));c&&Tm({node:f,featureNS:d.featureNS,featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},ks,Om("Delete"),c,e);d.nativeElements&&Tm({node:f,featureNS:d.featureNS,featureType:d.featureType,featurePrefix:d.featurePrefix,srsName:d.srsName},ks,Om("Native"),d.nativeElements,e);return f};
$r.prototype.Of=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.Ae(a);return null};$r.prototype.Ae=function(a){if(a.firstElementChild&&a.firstElementChild.firstElementChild)for(a=a.firstElementChild.firstElementChild,a=a.firstElementChild;a;a=a.nextElementSibling)if(0!==a.childNodes.length&&(1!==a.childNodes.length||3!==a.firstChild.nodeType)){var b=[{}];this.b.xe(a,b);return vc(b.pop().srsName)}return null};function qs(a){a=a?a:{};this.defaultDataProjection=null;this.b=void 0!==a.splitCollection?a.splitCollection:!1}w(qs,Ho);function rs(a){a=a.Z();return 0===a.length?"":a[0]+" "+a[1]}function ss(a){a=a.Z();for(var b=[],c=0,d=a.length;c<d;++c)b.push(a[c][0]+" "+a[c][1]);return b.join(",")}function ts(a){var b=[];a=a.Vd();for(var c=0,d=a.length;c<d;++c)b.push("("+ss(a[c])+")");return b.join(",")}function us(a){var b=a.X();a=(0,vs[b])(a);b=b.toUpperCase();return 0===a.length?b+" EMPTY":b+"("+a+")"}
var vs={Point:rs,LineString:ss,Polygon:ts,MultiPoint:function(a){var b=[];a=a.he();for(var c=0,d=a.length;c<d;++c)b.push("("+rs(a[c])+")");return b.join(",")},MultiLineString:function(a){var b=[];a=a.ld();for(var c=0,d=a.length;c<d;++c)b.push("("+ss(a[c])+")");return b.join(",")},MultiPolygon:function(a){var b=[];a=a.Wd();for(var c=0,d=a.length;c<d;++c)b.push("("+ts(a[c])+")");return b.join(",")},GeometryCollection:function(a){var b=[];a=a.df();for(var c=0,d=a.length;c<d;++c)b.push(us(a[c]));return b.join(",")}};
k=qs.prototype;k.td=function(a,b){var c=this.vd(a,b);if(c){var d=new Am;d.Xa(c);return d}return null};k.Jf=function(a,b){var c=[],d=this.vd(a,b);this.b&&"GeometryCollection"==d.X()?c=d.f:c=[d];for(var e=[],f=0,g=c.length;f<g;++f)d=new Am,d.Xa(c[f]),e.push(d);return e};k.vd=function(a,b){var c;c=new ws(new xs(a));c.b=ys(c.a);return(c=zs(c))?$m(c,!1,b):null};k.Ge=function(a,b){var c=a.Y();return c?this.Dd(c,b):""};
k.zi=function(a,b){if(1==a.length)return this.Ge(a[0],b);for(var c=[],d=0,e=a.length;d<e;++d)c.push(a[d].Y());c=new qn(c);return this.Dd(c,b)};k.Dd=function(a,b){return us($m(a,!0,b))};function xs(a){this.a=a;this.b=-1}
function ys(a){var b=a.a.charAt(++a.b),c={position:a.b,value:b};if("("==b)c.type=2;else if(","==b)c.type=5;else if(")"==b)c.type=3;else if("0"<=b&&"9">=b||"."==b||"-"==b){c.type=4;var d,b=a.b,e=!1,f=!1;do{if("."==d)e=!0;else if("e"==d||"E"==d)f=!0;d=a.a.charAt(++a.b)}while("0"<=d&&"9">=d||"."==d&&(void 0===e||!e)||!f&&("e"==d||"E"==d)||f&&("-"==d||"+"==d));a=parseFloat(a.a.substring(b,a.b--));c.value=a}else if("a"<=b&&"z">=b||"A"<=b&&"Z">=b){c.type=1;b=a.b;do d=a.a.charAt(++a.b);while("a"<=d&&"z">=
d||"A"<=d&&"Z">=d);a=a.a.substring(b,a.b--).toUpperCase();c.value=a}else{if(" "==b||"\t"==b||"\r"==b||"\n"==b)return ys(a);if(""===b)c.type=6;else throw Error("Unexpected character: "+b);}return c}function ws(a){this.a=a}k=ws.prototype;k.match=function(a){if(a=this.b.type==a)this.b=ys(this.a);return a};
function zs(a){var b=a.b;if(a.match(1)){var c=b.value;if("GEOMETRYCOLLECTION"==c){a:{if(a.match(2)){b=[];do b.push(zs(a));while(a.match(5));if(a.match(3)){a=b;break a}}else if(As(a)){a=[];break a}throw Error(Bs(a));}return new qn(a)}var d=Cs[c],b=Ds[c];if(!d||!b)throw Error("Invalid geometry type: "+c);a=d.call(a);return new b(a)}throw Error(Bs(a));}k.Df=function(){if(this.match(2)){var a=Es(this);if(this.match(3))return a}else if(As(this))return null;throw Error(Bs(this));};
k.Cf=function(){if(this.match(2)){var a=Fs(this);if(this.match(3))return a}else if(As(this))return[];throw Error(Bs(this));};k.Ef=function(){if(this.match(2)){var a=Gs(this);if(this.match(3))return a}else if(As(this))return[];throw Error(Bs(this));};k.eo=function(){if(this.match(2)){var a;if(2==this.b.type)for(a=[this.Df()];this.match(5);)a.push(this.Df());else a=Fs(this);if(this.match(3))return a}else if(As(this))return[];throw Error(Bs(this));};
k.co=function(){if(this.match(2)){var a=Gs(this);if(this.match(3))return a}else if(As(this))return[];throw Error(Bs(this));};k.fo=function(){if(this.match(2)){for(var a=[this.Ef()];this.match(5);)a.push(this.Ef());if(this.match(3))return a}else if(As(this))return[];throw Error(Bs(this));};function Es(a){for(var b=[],c=0;2>c;++c){var d=a.b;if(a.match(4))b.push(d.value);else break}if(2==b.length)return b;throw Error(Bs(a));}function Fs(a){for(var b=[Es(a)];a.match(5);)b.push(Es(a));return b}
function Gs(a){for(var b=[a.Cf()];a.match(5);)b.push(a.Cf());return b}function As(a){var b=1==a.b.type&&"EMPTY"==a.b.value;b&&(a.b=ys(a.a));return b}function Bs(a){return"Unexpected `"+a.b.value+"` at position "+a.b.position+" in `"+a.a.a+"`"}var Ds={POINT:C,LINESTRING:P,POLYGON:D,MULTIPOINT:R,MULTILINESTRING:Q,MULTIPOLYGON:S},Cs={POINT:ws.prototype.Df,LINESTRING:ws.prototype.Cf,POLYGON:ws.prototype.Ef,MULTIPOINT:ws.prototype.eo,MULTILINESTRING:ws.prototype.co,MULTIPOLYGON:ws.prototype.fo};function Hs(){this.version=void 0}w(Hs,xr);Hs.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.b(a);return null};Hs.prototype.b=function(a){this.version=a.getAttribute("version").trim();return(a=O({version:this.version},Is,a,[]))?a:null};function Js(a,b){return O({},Ks,a,b)}function Ls(a,b){return O({},Ms,a,b)}function Ns(a,b){var c=Js(a,b);if(c){var d=[Kn(a.getAttribute("width")),Kn(a.getAttribute("height"))];c.size=d;return c}}
function Os(a,b){return O([],Ps,a,b)}
var Qs=[null,"http://www.opengis.net/wms"],Is=N(Qs,{Service:K(function(a,b){return O({},Rs,a,b)}),Capability:K(function(a,b){return O({},Ss,a,b)})}),Ss=N(Qs,{Request:K(function(a,b){return O({},Ts,a,b)}),Exception:K(function(a,b){return O([],Us,a,b)}),Layer:K(function(a,b){return O({},Vs,a,b)})}),Rs=N(Qs,{Name:K(T),Title:K(T),Abstract:K(T),KeywordList:K(Os),OnlineResource:K(wr),ContactInformation:K(function(a,b){return O({},Ws,a,b)}),Fees:K(T),AccessConstraints:K(T),LayerLimit:K(Jn),MaxWidth:K(Jn),
MaxHeight:K(Jn)}),Ws=N(Qs,{ContactPersonPrimary:K(function(a,b){return O({},Xs,a,b)}),ContactPosition:K(T),ContactAddress:K(function(a,b){return O({},Ys,a,b)}),ContactVoiceTelephone:K(T),ContactFacsimileTelephone:K(T),ContactElectronicMailAddress:K(T)}),Xs=N(Qs,{ContactPerson:K(T),ContactOrganization:K(T)}),Ys=N(Qs,{AddressType:K(T),Address:K(T),City:K(T),StateOrProvince:K(T),PostCode:K(T),Country:K(T)}),Us=N(Qs,{Format:Km(T)}),Vs=N(Qs,{Name:K(T),Title:K(T),Abstract:K(T),KeywordList:K(Os),CRS:Mm(T),
EX_GeographicBoundingBox:K(function(a,b){var c=O({},Zs,a,b);if(c){var d=c.westBoundLongitude,e=c.southBoundLatitude,f=c.eastBoundLongitude,c=c.northBoundLatitude;return void 0===d||void 0===e||void 0===f||void 0===c?void 0:[d,e,f,c]}}),BoundingBox:Mm(function(a){var b=[In(a.getAttribute("minx")),In(a.getAttribute("miny")),In(a.getAttribute("maxx")),In(a.getAttribute("maxy"))],c=[In(a.getAttribute("resx")),In(a.getAttribute("resy"))];return{crs:a.getAttribute("CRS"),extent:b,res:c}}),Dimension:Mm(function(a){return{name:a.getAttribute("name"),
units:a.getAttribute("units"),unitSymbol:a.getAttribute("unitSymbol"),"default":a.getAttribute("default"),multipleValues:Fn(a.getAttribute("multipleValues")),nearestValue:Fn(a.getAttribute("nearestValue")),current:Fn(a.getAttribute("current")),values:T(a)}}),Attribution:K(function(a,b){return O({},$s,a,b)}),AuthorityURL:Mm(function(a,b){var c=Js(a,b);if(c)return c.name=a.getAttribute("name"),c}),Identifier:Mm(T),MetadataURL:Mm(function(a,b){var c=Js(a,b);if(c)return c.type=a.getAttribute("type"),
c}),DataURL:Mm(Js),FeatureListURL:Mm(Js),Style:Mm(function(a,b){return O({},at,a,b)}),MinScaleDenominator:K(Hn),MaxScaleDenominator:K(Hn),Layer:Mm(function(a,b){var c=b[b.length-1],d=O({},Vs,a,b);if(d){var e=Fn(a.getAttribute("queryable"));void 0===e&&(e=c.queryable);d.queryable=void 0!==e?e:!1;e=Kn(a.getAttribute("cascaded"));void 0===e&&(e=c.cascaded);d.cascaded=e;e=Fn(a.getAttribute("opaque"));void 0===e&&(e=c.opaque);d.opaque=void 0!==e?e:!1;e=Fn(a.getAttribute("noSubsets"));void 0===e&&(e=c.noSubsets);
d.noSubsets=void 0!==e?e:!1;(e=In(a.getAttribute("fixedWidth")))||(e=c.fixedWidth);d.fixedWidth=e;(e=In(a.getAttribute("fixedHeight")))||(e=c.fixedHeight);d.fixedHeight=e;["Style","CRS","AuthorityURL"].forEach(function(a){a in c&&(d[a]=(d[a]||[]).concat(c[a]))});"EX_GeographicBoundingBox BoundingBox Dimension Attribution MinScaleDenominator MaxScaleDenominator".split(" ").forEach(function(a){a in d||(d[a]=c[a])});return d}})}),$s=N(Qs,{Title:K(T),OnlineResource:K(wr),LogoURL:K(Ns)}),Zs=N(Qs,{westBoundLongitude:K(Hn),
eastBoundLongitude:K(Hn),southBoundLatitude:K(Hn),northBoundLatitude:K(Hn)}),Ts=N(Qs,{GetCapabilities:K(Ls),GetMap:K(Ls),GetFeatureInfo:K(Ls)}),Ms=N(Qs,{Format:Mm(T),DCPType:Mm(function(a,b){return O({},bt,a,b)})}),bt=N(Qs,{HTTP:K(function(a,b){return O({},ct,a,b)})}),ct=N(Qs,{Get:K(Js),Post:K(Js)}),at=N(Qs,{Name:K(T),Title:K(T),Abstract:K(T),LegendURL:Mm(Ns),StyleSheetURL:K(Js),StyleURL:K(Js)}),Ks=N(Qs,{Format:K(T),OnlineResource:K(wr)}),Ps=N(Qs,{Keyword:Km(T)});function dt(a){a=a?a:{};this.g="http://mapserver.gis.umn.edu/mapserver";this.b=new Yn;this.c=a.layers?a.layers:null;zn.call(this)}w(dt,zn);
dt.prototype.nc=function(a,b){var c={};b&&za(c,Ym(this,a,b));var d=[c];a.setAttribute("namespaceURI",this.g);var e=a.localName,c=[];if(0!==a.childNodes.length){if("msGMLOutput"==e)for(var f=0,g=a.childNodes.length;f<g;f++){var h=a.childNodes[f];if(h.nodeType===Node.ELEMENT_NODE){var l=d[0],m=h.localName.replace("_layer","");if(!this.c||bb(this.c,m)){m+="_feature";l.featureType=m;l.featureNS=this.g;var n={};n[m]=Km(this.b.Hf,this.b);l=N([l.featureNS,null],n);h.setAttribute("namespaceURI",this.g);(h=
O([],l,h,d,this.b))&&eb(c,h)}}}"FeatureCollection"==e&&(d=O([],this.b.b,a,[{}],this.b))&&(c=d)}return c};function et(){this.g=new yr}w(et,xr);et.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType==Node.ELEMENT_NODE)return this.b(a);return null};et.prototype.b=function(a){var b=a.getAttribute("version").trim(),c=this.g.b(a);if(!c)return null;c.version=b;return(c=O(c,ft,a,[]))?c:null};function gt(a){var b=T(a).split(" ");if(b&&2==b.length)return a=+b[0],b=+b[1],isNaN(a)||isNaN(b)?void 0:[a,b]}
var ht=[null,"http://www.opengis.net/wmts/1.0"],it=[null,"http://www.opengis.net/ows/1.1"],ft=N(ht,{Contents:K(function(a,b){return O({},jt,a,b)})}),jt=N(ht,{Layer:Mm(function(a,b){return O({},kt,a,b)}),TileMatrixSet:Mm(function(a,b){return O({},lt,a,b)})}),kt=N(ht,{Style:Mm(function(a,b){var c=O({},mt,a,b);if(c){var d="true"===a.getAttribute("isDefault");c.isDefault=d;return c}}),Format:Mm(T),TileMatrixSetLink:Mm(function(a,b){return O({},nt,a,b)}),Dimension:Mm(function(a,b){return O({},ot,a,b)}),
ResourceURL:Mm(function(a){var b=a.getAttribute("format"),c=a.getAttribute("template");a=a.getAttribute("resourceType");var d={};b&&(d.format=b);c&&(d.template=c);a&&(d.resourceType=a);return d})},N(it,{Title:K(T),Abstract:K(T),WGS84BoundingBox:K(function(a,b){var c=O([],pt,a,b);return 2!=c.length?void 0:Db(c)}),Identifier:K(T)})),mt=N(ht,{LegendURL:Mm(function(a){var b={};b.format=a.getAttribute("format");b.href=wr(a);return b})},N(it,{Title:K(T),Identifier:K(T)})),nt=N(ht,{TileMatrixSet:K(T)}),
ot=N(ht,{Default:K(T),Value:Mm(T)},N(it,{Identifier:K(T)})),pt=N(it,{LowerCorner:Km(gt),UpperCorner:Km(gt)}),lt=N(ht,{WellKnownScaleSet:K(T),TileMatrix:Mm(function(a,b){return O({},qt,a,b)})},N(it,{SupportedCRS:K(T),Identifier:K(T)})),qt=N(ht,{TopLeftCorner:K(gt),ScaleDenominator:K(Hn),TileWidth:K(Jn),TileHeight:K(Jn),MatrixWidth:K(Jn),MatrixHeight:K(Jn)},N(it,{Identifier:K(T)}));function rt(a){Xa.call(this);a=a||{};this.a=null;this.c=Nc;this.f=void 0;B(this,Za("projection"),this.Il,this);B(this,Za("tracking"),this.Jl,this);void 0!==a.projection&&this.$g(vc(a.projection));void 0!==a.trackingOptions&&this.oi(a.trackingOptions);this.ee(void 0!==a.tracking?a.tracking:!1)}w(rt,Xa);k=rt.prototype;k.ma=function(){this.ee(!1);Xa.prototype.ma.call(this)};k.Il=function(){var a=this.Yg();a&&(this.c=yc(vc("EPSG:4326"),a),this.a&&this.set("position",this.c(this.a)))};
k.Jl=function(){if(Of){var a=this.Zg();a&&void 0===this.f?this.f=ja.navigator.geolocation.watchPosition(this.no.bind(this),this.oo.bind(this),this.Kg()):a||void 0===this.f||(ja.navigator.geolocation.clearWatch(this.f),this.f=void 0)}};
k.no=function(a){a=a.coords;this.set("accuracy",a.accuracy);this.set("altitude",null===a.altitude?void 0:a.altitude);this.set("altitudeAccuracy",null===a.altitudeAccuracy?void 0:a.altitudeAccuracy);this.set("heading",null===a.heading?void 0:sa(a.heading));this.a?(this.a[0]=a.longitude,this.a[1]=a.latitude):this.a=[a.longitude,a.latitude];var b=this.c(this.a);this.set("position",b);this.set("speed",null===a.speed?void 0:a.speed);a=xd(Ei,this.a,a.accuracy);a.rc(this.c);this.set("accuracyGeometry",a);
this.u()};k.oo=function(a){a.type="error";this.ee(!1);this.b(a)};k.Jj=function(){return this.get("accuracy")};k.Kj=function(){return this.get("accuracyGeometry")||null};k.Mj=function(){return this.get("altitude")};k.Nj=function(){return this.get("altitudeAccuracy")};k.Gl=function(){return this.get("heading")};k.Hl=function(){return this.get("position")};k.Yg=function(){return this.get("projection")};k.tk=function(){return this.get("speed")};k.Zg=function(){return this.get("tracking")};k.Kg=function(){return this.get("trackingOptions")};
k.$g=function(a){this.set("projection",a)};k.ee=function(a){this.set("tracking",a)};k.oi=function(a){this.set("trackingOptions",a)};function st(a,b,c){Sc.call(this);this.Uf(a,b?b:0,c)}w(st,Sc);k=st.prototype;k.clone=function(){var a=new st(null),b=this.B.slice();Uc(a,this.ka,b);a.u();return a};k.vb=function(a,b,c,d){var e=this.B;a-=e[0];var f=b-e[1];b=a*a+f*f;if(b<d){if(0===b)for(d=0;d<this.a;++d)c[d]=e[d];else for(d=this.vf()/Math.sqrt(b),c[0]=e[0]+d*a,c[1]=e[1]+d*f,d=2;d<this.a;++d)c[d]=e[d];c.length=this.a;return b}return d};k.zc=function(a,b){var c=this.B,d=a-c[0],c=b-c[1];return d*d+c*c<=tt(this)};
k.qd=function(){return this.B.slice(0,this.a)};k.Nd=function(a){var b=this.B,c=b[this.a]-b[0];return Qb(b[0]-c,b[1]-c,b[0]+c,b[1]+c,a)};k.vf=function(){return Math.sqrt(tt(this))};function tt(a){var b=a.B[a.a]-a.B[0];a=a.B[a.a+1]-a.B[1];return b*b+a*a}k.X=function(){return"Circle"};k.La=function(a){var b=this.C();return kc(a,b)?(b=this.qd(),a[0]<=b[0]&&a[2]>=b[0]||a[1]<=b[1]&&a[3]>=b[1]?!0:Xb(a,this.jb,this)):!1};
k.em=function(a){var b=this.a,c=this.B[b]-this.B[0],d=a.slice();d[b]=d[0]+c;for(c=1;c<b;++c)d[b+c]=a[c];Uc(this,this.ka,d);this.u()};k.Uf=function(a,b,c){if(a){Vc(this,c,a,0);this.B||(this.B=[]);c=this.B;a=cd(c,a);c[a++]=c[0]+b;var d;b=1;for(d=this.a;b<d;++b)c[a++]=c[b];c.length=a}else Uc(this,"XY",null);this.u()};k.fm=function(a){this.B[this.a]=this.B[0]+a;this.u()};function ut(a,b,c){for(var d=[],e=a(0),f=a(1),g=b(e),h=b(f),l=[f,e],m=[h,g],n=[1,0],p={},q=1E5,t,v,u,y,E;0<--q&&0<n.length;)u=n.pop(),e=l.pop(),g=m.pop(),f=u.toString(),f in p||(d.push(g[0],g[1]),p[f]=!0),y=n.pop(),f=l.pop(),h=m.pop(),E=(u+y)/2,t=a(E),v=b(t),qa(v[0],v[1],g[0],g[1],h[0],h[1])<c?(d.push(h[0],h[1]),f=y.toString(),p[f]=!0):(n.push(y,E,E,u),m.push(h,v,v,g),l.push(f,t,t,e));return d}function vt(a,b,c,d,e){var f=vc("EPSG:4326");return ut(function(d){return[a,b+(c-b)*d]},Mc(f,d),e)}
function wt(a,b,c,d,e){var f=vc("EPSG:4326");return ut(function(d){return[b+(c-b)*d,a]},Mc(f,d),e)};function xt(a){a=a||{};this.c=this.j=null;this.g=this.i=Infinity;this.f=this.l=-Infinity;this.A=this.U=Infinity;this.D=this.H=-Infinity;this.Ba=void 0!==a.targetSize?a.targetSize:100;this.O=void 0!==a.maxLines?a.maxLines:100;this.b=[];this.a=[];this.Aa=void 0!==a.strokeStyle?a.strokeStyle:yt;this.v=this.o=void 0;this.s=null;this.setMap(void 0!==a.map?a.map:null)}var yt=new Yi({color:"rgba(0,0,0,0.2)"}),zt=[90,45,30,20,10,5,2,1,.5,.2,.1,.05,.01,.005,.002,.001];
function At(a,b,c,d,e,f,g){var h=g;b=vt(b,c,d,a.c,e);h=void 0!==a.b[h]?a.b[h]:new P(null);h.ba("XY",b);kc(h.C(),f)&&(a.b[g++]=h);return g}function Bt(a,b,c,d,e){var f=e;b=wt(b,a.f,a.g,a.c,c);f=void 0!==a.a[f]?a.a[f]:new P(null);f.ba("XY",b);kc(f.C(),d)&&(a.a[e++]=f);return e}k=xt.prototype;k.Kl=function(){return this.j};k.fk=function(){return this.b};k.mk=function(){return this.a};
k.Pg=function(a){var b=a.vectorContext,c=a.frameState,d=c.extent;a=c.viewState;var e=a.center,f=a.projection,g=a.resolution;a=c.pixelRatio;a=g*g/(4*a*a);if(!this.c||!Lc(this.c,f)){var h=vc("EPSG:4326"),l=f.C(),m=f.i,n=Pc(m,h,f),p=m[2],q=m[1],t=m[0],v=n[3],u=n[2],y=n[1],n=n[0];this.i=m[3];this.g=p;this.l=q;this.f=t;this.U=v;this.A=u;this.H=y;this.D=n;this.o=Mc(h,f);this.v=Mc(f,h);this.s=this.v(gc(l));this.c=f}f.a&&(f=f.C(),h=ec(f),c=c.focus[0],c<f[0]||c>f[2])&&(c=h*Math.ceil((f[0]-c)/h),d=[d[0]+c,
d[1],d[2]+c,d[3]]);c=this.s[0];f=this.s[1];h=-1;m=Math.pow(this.Ba*g,2);p=[];q=[];g=0;for(l=zt.length;g<l;++g){t=zt[g]/2;p[0]=c-t;p[1]=f-t;q[0]=c+t;q[1]=f+t;this.o(p,p);this.o(q,q);t=Math.pow(q[0]-p[0],2)+Math.pow(q[1]-p[1],2);if(t<=m)break;h=zt[g]}g=h;if(-1==g)this.b.length=this.a.length=0;else{c=this.v(e);e=c[0];c=c[1];f=this.O;h=[Math.max(d[0],this.D),Math.max(d[1],this.H),Math.min(d[2],this.A),Math.min(d[3],this.U)];h=Pc(h,this.c,"EPSG:4326");m=h[3];q=h[1];e=Math.floor(e/g)*g;p=ma(e,this.f,this.g);
l=At(this,p,q,m,a,d,0);for(h=0;p!=this.f&&h++<f;)p=Math.max(p-g,this.f),l=At(this,p,q,m,a,d,l);p=ma(e,this.f,this.g);for(h=0;p!=this.g&&h++<f;)p=Math.min(p+g,this.g),l=At(this,p,q,m,a,d,l);this.b.length=l;c=Math.floor(c/g)*g;e=ma(c,this.l,this.i);l=Bt(this,e,a,d,0);for(h=0;e!=this.l&&h++<f;)e=Math.max(e-g,this.l),l=Bt(this,e,a,d,l);e=ma(c,this.l,this.i);for(h=0;e!=this.i&&h++<f;)e=Math.min(e+g,this.i),l=Bt(this,e,a,d,l);this.a.length=l}b.Wb(null,this.Aa);a=0;for(e=this.b.length;a<e;++a)g=this.b[a],
b.hd(g,null);a=0;for(e=this.a.length;a<e;++a)g=this.a[a],b.hd(g,null)};k.setMap=function(a){this.j&&(this.j.J("postcompose",this.Pg,this),this.j.render());a&&(a.I("postcompose",this.Pg,this),a.render());this.j=a};function Ct(a,b,c,d,e,f,g){rj.call(this,a,b,c,0,d);this.o=e;this.g=new Image;null!==f&&(this.g.crossOrigin=f);this.i={};this.c=null;this.state=0;this.j=g}w(Ct,rj);Ct.prototype.a=function(a){if(void 0!==a){var b;a=x(a);if(a in this.i)return this.i[a];Ca(this.i)?b=this.g:b=this.g.cloneNode(!1);return this.i[a]=b}return this.g};Ct.prototype.s=function(){this.state=3;this.c.forEach(Ea);this.c=null;sj(this)};
Ct.prototype.v=function(){void 0===this.resolution&&(this.resolution=fc(this.extent)/this.g.height);this.state=2;this.c.forEach(Ea);this.c=null;sj(this)};Ct.prototype.load=function(){if(0==this.state||3==this.state)this.state=1,sj(this),this.c=[Ja(this.g,"error",this.s,this),Ja(this.g,"load",this.v,this)],this.j(this,this.o)};function Dt(a,b,c,d,e){qh.call(this,a,b);this.s=c;this.g=new Image;null!==d&&(this.g.crossOrigin=d);this.c={};this.o=null;this.v=e}w(Dt,qh);k=Dt.prototype;k.ma=function(){1==this.state&&Et(this);this.a&&Oa(this.a);this.state=5;rh(this);qh.prototype.ma.call(this)};k.ab=function(a){if(void 0!==a){var b=x(a);if(b in this.c)return this.c[b];a=Ca(this.c)?this.g:this.g.cloneNode(!1);return this.c[b]=a}return this.g};k.Ya=function(){return this.s};k.Ll=function(){this.state=3;Et(this);rh(this)};
k.Ml=function(){this.state=this.g.naturalWidth&&this.g.naturalHeight?2:4;Et(this);rh(this)};k.load=function(){if(0==this.state||3==this.state)this.state=1,rh(this),this.o=[Ja(this.g,"error",this.Ll,this),Ja(this.g,"load",this.Ml,this)],this.v(this,this.s)};function Et(a){a.o.forEach(Ea);a.o=null};function Ft(a){a=a?a:{};Bh.call(this,{handleEvent:nc});this.c=a.formatConstructors?a.formatConstructors:[];this.o=a.projection?vc(a.projection):null;this.a=null;this.target=a.target?a.target:null}w(Ft,Bh);function Gt(a){a=a.dataTransfer.files;var b,c,d;b=0;for(c=a.length;b<c;++b){d=a.item(b);var e=new FileReader;e.addEventListener("load",this.j.bind(this,d));e.readAsText(d)}}function Ht(a){a.stopPropagation();a.preventDefault();a.dataTransfer.dropEffect="copy"}
Ft.prototype.j=function(a,b){var c=b.target.result,d=this.v,e=this.o;e||(e=d.aa().j);var d=this.c,f=[],g,h;g=0;for(h=d.length;g<h;++g){var l=new d[g];var m={featureProjection:e};try{f=l.Fa(c,m)}catch(n){f=null}if(f&&0<f.length)break}this.b(new It(Jt,a,f,e))};Ft.prototype.setMap=function(a){this.a&&(this.a.forEach(Ea),this.a=null);Bh.prototype.setMap.call(this,a);a&&(a=this.target?this.target:a.a,this.a=[B(a,"drop",Gt,this),B(a,"dragenter",Ht,this),B(a,"dragover",Ht,this),B(a,"drop",Ht,this)])};
var Jt="addfeatures";function It(a,b,c,d){Pa.call(this,a);this.features=c;this.file=b;this.projection=d}w(It,Pa);function Kt(a){a=a?a:{};Qh.call(this,{handleDownEvent:Lt,handleDragEvent:Mt,handleUpEvent:Nt});this.s=a.condition?a.condition:Mh;this.a=this.c=void 0;this.o=0;this.A=void 0!==a.duration?a.duration:400}w(Kt,Qh);function Mt(a){if(Oh(a)){var b=a.map,c=b.kb(),d=a.pixel;a=d[0]-c[0]/2;d=c[1]/2-d[1];c=Math.atan2(d,a);a=Math.sqrt(a*a+d*d);d=b.aa();if(void 0!==this.c){var e=c-this.c;Ch(b,d,d.Ma()-e)}this.c=c;void 0!==this.a&&(c=this.a*(d.$()/a),Eh(b,d,c));void 0!==this.a&&(this.o=this.a/a);this.a=a}}
function Nt(a){if(!Oh(a))return!0;a=a.map;var b=a.aa();Kd(b,-1);var c=this.o-1,d=b.Ma(),d=b.constrainRotation(d,0);Ch(a,b,d,void 0,void 0);var d=b.$(),e=this.A,d=b.constrainResolution(d,0,c);Eh(a,b,d,void 0,e);this.o=0;return!1}function Lt(a){return Oh(a)&&this.s(a)?(Kd(a.map.aa(),1),this.a=this.c=void 0,!0):!1};function Ot(){return[[-Infinity,-Infinity,Infinity,Infinity]]};(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Pp=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b){function f(a,b,d,e,q){d=d||0;e=e||a.length-1;for(q=q||h;e>d;){if(600<e-d){var t=e-d+1,v=b-d+1,u=Math.log(t),y=.5*Math.exp(2*u/3),u=.5*Math.sqrt(u*y*(t-y)/t)*(0>v-t/2?-1:1);f(a,b,Math.max(d,Math.floor(b-v*y/t+u)),Math.min(e,Math.floor(b+(t-v)*y/t+u)),q)}t=a[b];v=d;y=e;g(a,d,b);for(0<q(a[e],t)&&g(a,d,e);v<y;){g(a,v,y);v++;for(y--;0>q(a[v],t);)v++;
for(;0<q(a[y],t);)y--}0===q(a[d],t)?g(a,d,y):(y++,g(a,y,e));y<=b&&(d=y+1);b<=y&&(e=y-1)}}function g(a,b,d){var e=a[b];a[b]=a[d];a[d]=e}function h(a,b){return a<b?-1:a>b?1:0}b.ja=f},{}],2:[function(a,b){function f(a,b){if(!(this instanceof f))return new f(a,b);this.Re=Math.max(4,a||9);this.gg=Math.max(2,Math.ceil(.4*this.Re));b&&this.ij(b);this.clear()}function g(a,b){h(a,0,a.children.length,b,a)}function h(a,b,d,e,f){f||(f=u(null));f.ca=Infinity;f.fa=Infinity;f.ea=-Infinity;f.ia=-Infinity;for(var g;b<
d;b++)g=a.children[b],l(f,a.Wa?e(g):g);return f}function l(a,b){a.ca=Math.min(a.ca,b.ca);a.fa=Math.min(a.fa,b.fa);a.ea=Math.max(a.ea,b.ea);a.ia=Math.max(a.ia,b.ia)}function m(a,b){return a.ca-b.ca}function n(a,b){return a.fa-b.fa}function p(a){return(a.ea-a.ca)*(a.ia-a.fa)}function q(a){return a.ea-a.ca+(a.ia-a.fa)}function t(a,b){return a.ca<=b.ca&&a.fa<=b.fa&&b.ea<=a.ea&&b.ia<=a.ia}function v(a,b){return b.ca<=a.ea&&b.fa<=a.ia&&b.ea>=a.ca&&b.ia>=a.fa}function u(a){return{children:a,height:1,Wa:!0,
ca:Infinity,fa:Infinity,ea:-Infinity,ia:-Infinity}}function y(a,b,d,e,f){for(var g=[b,d],h;g.length;)d=g.pop(),b=g.pop(),d-b<=e||(h=b+Math.ceil((d-b)/e/2)*e,E(a,h,b,d,f),g.push(b,h,h,d))}b.ja=f;var E=a("quickselect");f.prototype={all:function(){return this.bg(this.data,[])},search:function(a){var b=this.data,d=[],e=this.nb;if(!v(a,b))return d;for(var f=[],g,h,l,m;b;){g=0;for(h=b.children.length;g<h;g++)l=b.children[g],m=b.Wa?e(l):l,v(a,m)&&(b.Wa?d.push(l):t(a,m)?this.bg(l,d):f.push(l));b=f.pop()}return d},
load:function(a){if(!a||!a.length)return this;if(a.length<this.gg){for(var b=0,d=a.length;b<d;b++)this.Ca(a[b]);return this}a=this.dg(a.slice(),0,a.length-1,0);this.data.children.length?this.data.height===a.height?this.ig(this.data,a):(this.data.height<a.height&&(b=this.data,this.data=a,a=b),this.fg(a,this.data.height-a.height-1,!0)):this.data=a;return this},Ca:function(a){a&&this.fg(a,this.data.height-1);return this},clear:function(){this.data=u([]);return this},remove:function(a,b){if(!a)return this;
for(var d=this.data,e=this.nb(a),f=[],g=[],h,l,m,n;d||f.length;){d||(d=f.pop(),l=f[f.length-1],h=g.pop(),n=!0);if(d.Wa){a:{m=a;var p=d.children,q=b;if(q){for(var u=0;u<p.length;u++)if(q(m,p[u])){m=u;break a}m=-1}else m=p.indexOf(m)}if(-1!==m){d.children.splice(m,1);f.push(d);this.gj(f);break}}n||d.Wa||!t(d,e)?l?(h++,d=l.children[h],n=!1):d=null:(f.push(d),g.push(h),h=0,l=d,d=d.children[0])}return this},nb:function(a){return a},Te:m,Ue:n,toJSON:function(){return this.data},bg:function(a,b){for(var d=
[];a;)a.Wa?b.push.apply(b,a.children):d.push.apply(d,a.children),a=d.pop();return b},dg:function(a,b,d,e){var f=d-b+1,h=this.Re,l;if(f<=h)return l=u(a.slice(b,d+1)),g(l,this.nb),l;e||(e=Math.ceil(Math.log(f)/Math.log(h)),h=Math.ceil(f/Math.pow(h,e-1)));l=u([]);l.Wa=!1;l.height=e;var f=Math.ceil(f/h),h=f*Math.ceil(Math.sqrt(h)),m,n,p;for(y(a,b,d,h,this.Te);b<=d;b+=h)for(n=Math.min(b+h-1,d),y(a,b,n,f,this.Ue),m=b;m<=n;m+=f)p=Math.min(m+f-1,n),l.children.push(this.dg(a,m,p,e-1));g(l,this.nb);return l},
fj:function(a,b,d,e){for(var f,g,h,l,m,n,q,t;;){e.push(b);if(b.Wa||e.length-1===d)break;q=t=Infinity;f=0;for(g=b.children.length;f<g;f++)h=b.children[f],m=p(h),n=(Math.max(h.ea,a.ea)-Math.min(h.ca,a.ca))*(Math.max(h.ia,a.ia)-Math.min(h.fa,a.fa))-m,n<t?(t=n,q=m<q?m:q,l=h):n===t&&m<q&&(q=m,l=h);b=l||b.children[0]}return b},fg:function(a,b,d){var e=this.nb;d=d?a:e(a);var e=[],f=this.fj(d,this.data,b,e);f.children.push(a);for(l(f,d);0<=b;)if(e[b].children.length>this.Re)this.oj(e,b),b--;else break;this.cj(d,
e,b)},oj:function(a,b){var d=a[b],e=d.children.length,f=this.gg;this.dj(d,f,e);e=this.ej(d,f,e);e=u(d.children.splice(e,d.children.length-e));e.height=d.height;e.Wa=d.Wa;g(d,this.nb);g(e,this.nb);b?a[b-1].children.push(e):this.ig(d,e)},ig:function(a,b){this.data=u([a,b]);this.data.height=a.height+1;this.data.Wa=!1;g(this.data,this.nb)},ej:function(a,b,d){var e,f,g,l,m,n,q;m=n=Infinity;for(e=b;e<=d-b;e++)f=h(a,0,e,this.nb),g=h(a,e,d,this.nb),l=Math.max(0,Math.min(f.ea,g.ea)-Math.max(f.ca,g.ca))*Math.max(0,
Math.min(f.ia,g.ia)-Math.max(f.fa,g.fa)),f=p(f)+p(g),l<m?(m=l,q=e,n=f<n?f:n):l===m&&f<n&&(n=f,q=e);return q},dj:function(a,b,d){var e=a.Wa?this.Te:m,f=a.Wa?this.Ue:n,g=this.cg(a,b,d,e);b=this.cg(a,b,d,f);g<b&&a.children.sort(e)},cg:function(a,b,d,e){a.children.sort(e);e=this.nb;var f=h(a,0,b,e),g=h(a,d-b,d,e),m=q(f)+q(g),n,p;for(n=b;n<d-b;n++)p=a.children[n],l(f,a.Wa?e(p):p),m+=q(f);for(n=d-b-1;n>=b;n--)p=a.children[n],l(g,a.Wa?e(p):p),m+=q(g);return m},cj:function(a,b,d){for(;0<=d;d--)l(b[d],a)},
gj:function(a){for(var b=a.length-1,d;0<=b;b--)0===a[b].children.length?0<b?(d=a[b-1].children,d.splice(d.indexOf(a[b]),1)):this.clear():g(a[b],this.nb)},ij:function(a){var b=["return a"," - b",";"];this.Te=new Function("a","b",b.join(a[0]));this.Ue=new Function("a","b",b.join(a[1]));this.nb=new Function("a","return {minX: a"+a[0]+", minY: a"+a[1]+", maxX: a"+a[2]+", maxY: a"+a[3]+"};")}}},{quickselect:1}]},{},[2])(2)});Pq=b.ja})();function Pt(a){this.b=Pq(a);this.a={}}k=Pt.prototype;k.Ca=function(a,b){var c={ca:a[0],fa:a[1],ea:a[2],ia:a[3],value:b};this.b.Ca(c);this.a[x(b)]=c};k.load=function(a,b){for(var c=Array(b.length),d=0,e=b.length;d<e;d++){var f=a[d],g=b[d],f={ca:f[0],fa:f[1],ea:f[2],ia:f[3],value:g};c[d]=f;this.a[x(g)]=f}this.b.load(c)};k.remove=function(a){a=x(a);var b=this.a[a];delete this.a[a];return null!==this.b.remove(b)};
function Qt(a,b,c){var d=a.a[x(c)];Ub([d.ca,d.fa,d.ea,d.ia],b)||(a.remove(c),a.Ca(b,c))}function Rt(a){return a.b.all().map(function(a){return a.value})}function St(a,b){return a.b.search({ca:b[0],fa:b[1],ea:b[2],ia:b[3]}).map(function(a){return a.value})}k.forEach=function(a,b){return Tt(Rt(this),a,b)};function Ut(a,b,c,d){return Tt(St(a,b),c,d)}function Tt(a,b,c){for(var d,e=0,f=a.length;e<f&&!(d=b.call(c,a[e]));e++);return d}k.clear=function(){this.b.clear();this.a={}};
k.C=function(){var a=this.b.data;return[a.ca,a.fa,a.ea,a.ia]};function U(a){a=a||{};Tg.call(this,{attributions:a.attributions,logo:a.logo,projection:void 0,state:"ready",wrapX:void 0!==a.wrapX?a.wrapX:!0});this.T=ha;this.R=a.format;this.W=void 0==a.overlaps?!0:a.overlaps;this.ha=a.url;void 0!==a.loader?this.T=a.loader:void 0!==this.ha&&(la(this.R,7),this.T=Wm(this.ha,this.R));this.Mb=void 0!==a.strategy?a.strategy:Ot;var b=void 0!==a.useSpatialIndex?a.useSpatialIndex:!0;this.a=b?new Pt:null;this.na=new Pt;this.i={};this.j={};this.o={};this.s={};this.c=null;
var c,d;a.features instanceof re?(c=a.features,d=c.a):Array.isArray(a.features)&&(d=a.features);b||void 0!==c||(c=new re(d));void 0!==d&&Vt(this,d);void 0!==c&&Wt(this,c)}w(U,Tg);k=U.prototype;k.ub=function(a){var b=x(a).toString();if(Xt(this,b,a)){Yt(this,b,a);var c=a.Y();c?(b=c.C(),this.a&&this.a.Ca(b,a)):this.i[b]=a;this.b(new Zt("addfeature",a))}this.u()};function Yt(a,b,c){a.s[b]=[B(c,"change",a.Bh,a),B(c,"propertychange",a.Bh,a)]}
function Xt(a,b,c){var d=!0,e=c.Oa();void 0!==e?e.toString()in a.j?d=!1:a.j[e.toString()]=c:(la(!(b in a.o),30),a.o[b]=c);return d}k.Hc=function(a){Vt(this,a);this.u()};function Vt(a,b){var c,d,e,f,g=[],h=[],l=[];d=0;for(e=b.length;d<e;d++)f=b[d],c=x(f).toString(),Xt(a,c,f)&&h.push(f);d=0;for(e=h.length;d<e;d++){f=h[d];c=x(f).toString();Yt(a,c,f);var m=f.Y();m?(c=m.C(),g.push(c),l.push(f)):a.i[c]=f}a.a&&a.a.load(g,l);d=0;for(e=h.length;d<e;d++)a.b(new Zt("addfeature",h[d]))}
function Wt(a,b){var c=!1;B(a,"addfeature",function(a){c||(c=!0,b.push(a.feature),c=!1)});B(a,"removefeature",function(a){c||(c=!0,b.remove(a.feature),c=!1)});B(b,ue,function(a){c||(c=!0,this.ub(a.element),c=!1)},a);B(b,ve,function(a){c||(c=!0,this.pb(a.element),c=!1)},a);a.c=b}
k.clear=function(a){if(a){for(var b in this.s)this.s[b].forEach(Ea);this.c||(this.s={},this.j={},this.o={})}else if(this.a){this.a.forEach(this.Rf,this);for(var c in this.i)this.Rf(this.i[c])}this.c&&this.c.clear();this.a&&this.a.clear();this.na.clear();this.i={};this.b(new Zt("clear"));this.u()};k.ug=function(a,b){if(this.a)return this.a.forEach(a,b);if(this.c)return this.c.forEach(a,b)};function $t(a,b,c){a.xb([b[0],b[1],b[0],b[1]],function(a){if(a.Y().jb(b))return c.call(void 0,a)})}
k.xb=function(a,b,c){if(this.a)return Ut(this.a,a,b,c);if(this.c)return this.c.forEach(b,c)};k.vg=function(a,b,c){return this.xb(a,function(d){if(d.Y().La(a)&&(d=b.call(c,d)))return d})};k.Dg=function(){return this.c};k.me=function(){var a;this.c?a=this.c.a:this.a&&(a=Rt(this.a),Ca(this.i)||eb(a,Ba(this.i)));return a};k.Cg=function(a){var b=[];$t(this,a,function(a){b.push(a)});return b};k.cf=function(a){return St(this.a,a)};
k.yg=function(a,b){var c=a[0],d=a[1],e=null,f=[NaN,NaN],g=Infinity,h=[-Infinity,-Infinity,Infinity,Infinity],l=b?b:nc;Ut(this.a,h,function(a){if(l(a)){var b=a.Y(),p=g;g=b.vb(c,d,f,g);g<p&&(e=a,a=Math.sqrt(g),h[0]=c-a,h[1]=d-a,h[2]=c+a,h[3]=d+a)}});return e};k.C=function(){return this.a.C()};k.Bg=function(a){a=this.j[a.toString()];return void 0!==a?a:null};k.zh=function(){return this.R};k.Ah=function(){return this.ha};
k.Bh=function(a){a=a.target;var b=x(a).toString(),c=a.Y();c?(c=c.C(),b in this.i?(delete this.i[b],this.a&&this.a.Ca(c,a)):this.a&&Qt(this.a,c,a)):b in this.i||(this.a&&this.a.remove(a),this.i[b]=a);c=a.Oa();void 0!==c?(c=c.toString(),b in this.o?(delete this.o[b],this.j[c]=a):this.j[c]!==a&&(au(this,a),this.j[c]=a)):b in this.o||(au(this,a),this.o[b]=a);this.u();this.b(new Zt("changefeature",a))};
k.Nc=function(a,b,c){var d=this.na;a=this.Mb(a,b);var e,f;e=0;for(f=a.length;e<f;++e){var g=a[e];Ut(d,g,function(a){return Nb(a.extent,g)})||(this.T.call(this,g,b,c),d.Ca(g,{extent:g.slice()}))}};k.pb=function(a){var b=x(a).toString();b in this.i?delete this.i[b]:this.a&&this.a.remove(a);this.Rf(a);this.u()};k.Rf=function(a){var b=x(a).toString();this.s[b].forEach(Ea);delete this.s[b];var c=a.Oa();void 0!==c?delete this.j[c.toString()]:delete this.o[b];this.b(new Zt("removefeature",a))};
function au(a,b){for(var c in a.j)if(a.j[c]===b){delete a.j[c];break}}function Zt(a,b){Pa.call(this,a);this.feature=b}w(Zt,Pa);function bu(a,b){Pa.call(this,a);this.feature=b}w(bu,Pa);
function cu(a){Qh.call(this,{handleDownEvent:du,handleEvent:eu,handleUpEvent:fu});this.pa=null;this.R=!1;this.Mb=a.source?a.source:null;this.sb=a.features?a.features:null;this.Bj=a.snapTolerance?a.snapTolerance:12;this.W=a.type;this.c=gu(this.W);this.Ia=a.minPoints?a.minPoints:this.c===hu?3:2;this.Ha=a.maxPoints?a.maxPoints:Infinity;this.Me=a.finishCondition?a.finishCondition:nc;var b=a.geometryFunction;if(!b)if("Circle"===this.W)b=function(a,b){var c=b?b:new st([NaN,NaN]);c.Uf(a[0],Math.sqrt(Ab(a[0],
a[1])));return c};else{var c,b=this.c;b===iu?c=C:b===ju?c=P:b===hu&&(c=D);b=function(a,b){var f=b;f?f.sa(a):f=new c(a);return f}}this.D=b;this.T=this.A=this.a=this.O=this.o=this.s=null;this.Cj=a.clickTolerance?a.clickTolerance*a.clickTolerance:36;this.na=new F({source:new U({useSpatialIndex:!1,wrapX:a.wrapX?a.wrapX:!1}),style:a.style?a.style:ku()});this.tb=a.geometryName;this.yj=a.condition?a.condition:Lh;this.za=a.freehandCondition?a.freehandCondition:Mh;B(this,Za("active"),this.vi,this)}w(cu,Qh);
function ku(){var a=dj();return function(b){return a[b.Y().X()]}}k=cu.prototype;k.setMap=function(a){Qh.prototype.setMap.call(this,a);this.vi()};function eu(a){this.c!==ju&&this.c!==hu||!this.za(a)||(this.R=!0);var b=!this.R;this.R&&a.type===Og?(lu(this,a),b=!1):a.type===Ng?b=mu(this,a):a.type===Hg&&(b=!1);return Rh.call(this,a)&&b}function du(a){return this.yj(a)?(this.pa=a.pixel,!0):this.R?(this.pa=a.pixel,this.s||nu(this,a),!0):!1}
function fu(a){this.R=!1;var b=this.pa,c=a.pixel,d=b[0]-c[0],b=b[1]-c[1],c=!0;d*d+b*b<=this.Cj&&(mu(this,a),this.s?this.c===ou?this.jd():pu(this,a)?this.Me(a)&&this.jd():lu(this,a):(nu(this,a),this.c===iu&&this.jd()),c=!1);return c}
function mu(a,b){if(a.s){var c=b.coordinate,d=a.o.Y(),e;a.c===iu?e=a.a:a.c===hu?(e=a.a[0],e=e[e.length-1],pu(a,b)&&(c=a.s.slice())):(e=a.a,e=e[e.length-1]);e[0]=c[0];e[1]=c[1];a.D(a.a,d);a.O&&a.O.Y().sa(c);d instanceof D&&a.c!==hu?(a.A||(a.A=new Am(new P(null))),d=d.Fg(0),c=a.A.Y(),c.ba(d.ka,d.la())):a.T&&(c=a.A.Y(),c.sa(a.T));qu(a)}else c=b.coordinate.slice(),a.O?a.O.Y().sa(c):(a.O=new Am(new C(c)),qu(a));return!0}
function pu(a,b){var c=!1;if(a.o){var d=!1,e=[a.s];a.c===ju?d=a.a.length>a.Ia:a.c===hu&&(d=a.a[0].length>a.Ia,e=[a.a[0][0],a.a[0][a.a[0].length-2]]);if(d)for(var d=b.map,f=0,g=e.length;f<g;f++){var h=e[f],l=d.Ga(h),m=b.pixel,c=m[0]-l[0],l=m[1]-l[1],m=a.R&&a.za(b)?1:a.Bj;if(c=Math.sqrt(c*c+l*l)<=m){a.s=h;break}}}return c}
function nu(a,b){var c=b.coordinate;a.s=c;a.c===iu?a.a=c.slice():a.c===hu?(a.a=[[c.slice(),c.slice()]],a.T=a.a[0]):(a.a=[c.slice(),c.slice()],a.c===ou&&(a.T=a.a));a.T&&(a.A=new Am(new P(a.T)));c=a.D(a.a);a.o=new Am;a.tb&&a.o.Cc(a.tb);a.o.Xa(c);qu(a);a.b(new bu("drawstart",a.o))}
function lu(a,b){var c=b.coordinate,d=a.o.Y(),e,f;if(a.c===ju)a.s=c.slice(),f=a.a,f.push(c.slice()),e=f.length>a.Ha,a.D(f,d);else if(a.c===hu){f=a.a[0];f.push(c.slice());if(e=f.length>a.Ha)a.s=f[0];a.D(a.a,d)}qu(a);e&&a.jd()}k.No=function(){var a=this.o.Y(),b,c;this.c===ju?(b=this.a,b.splice(-2,1),this.D(b,a)):this.c===hu&&(b=this.a[0],b.splice(-2,1),c=this.A.Y(),c.sa(b),this.D(this.a,a));0===b.length&&(this.s=null);qu(this)};
k.jd=function(){var a=ru(this),b=this.a,c=a.Y();this.c===ju?(b.pop(),this.D(b,c)):this.c===hu&&(b[0].pop(),b[0].push(b[0][0]),this.D(b,c));"MultiPoint"===this.W?a.Xa(new R([b])):"MultiLineString"===this.W?a.Xa(new Q([b])):"MultiPolygon"===this.W&&a.Xa(new S([b]));this.b(new bu("drawend",a));this.sb&&this.sb.push(a);this.Mb&&this.Mb.ub(a)};function ru(a){a.s=null;var b=a.o;b&&(a.o=null,a.O=null,a.A=null,a.na.ga().clear(!0));return b}
k.mm=function(a){var b=a.Y();this.o=a;this.a=b.Z();a=this.a[this.a.length-1];this.s=a.slice();this.a.push(a.slice());qu(this);this.b(new bu("drawstart",this.o))};k.Ec=oc;function qu(a){var b=[];a.o&&b.push(a.o);a.A&&b.push(a.A);a.O&&b.push(a.O);a=a.na.ga();a.clear(!0);a.Hc(b)}k.vi=function(){var a=this.v,b=this.f();a&&b||ru(this);this.na.setMap(b?a:null)};
function gu(a){var b;"Point"===a||"MultiPoint"===a?b=iu:"LineString"===a||"MultiLineString"===a?b=ju:"Polygon"===a||"MultiPolygon"===a?b=hu:"Circle"===a&&(b=ou);return b}var iu="Point",ju="LineString",hu="Polygon",ou="Circle";function su(a,b,c){Pa.call(this,a);this.features=b;this.mapBrowserEvent=c}w(su,Pa);
function tu(a){Qh.call(this,{handleDownEvent:uu,handleDragEvent:vu,handleEvent:wu,handleUpEvent:xu});this.tb=a.condition?a.condition:Ph;this.Ia=function(a){return Lh(a)&&Kh(a)};this.sb=a.deleteCondition?a.deleteCondition:this.Ia;this.Ha=this.c=null;this.na=[0,0];this.D=this.T=!1;this.a=new Pt;this.O=void 0!==a.pixelTolerance?a.pixelTolerance:10;this.s=this.za=!1;this.o=[];this.R=new F({source:new U({useSpatialIndex:!1,wrapX:!!a.wrapX}),style:a.style?a.style:yu(),updateWhileAnimating:!0,updateWhileInteracting:!0});
this.pa={Point:this.tm,LineString:this.hh,LinearRing:this.hh,Polygon:this.um,MultiPoint:this.rm,MultiLineString:this.qm,MultiPolygon:this.sm,GeometryCollection:this.pm};this.A=a.features;this.A.forEach(this.wf,this);B(this.A,ue,this.nm,this);B(this.A,ve,this.om,this);this.W=null}w(tu,Qh);k=tu.prototype;k.wf=function(a){var b=a.Y();b&&b.X()in this.pa&&this.pa[b.X()].call(this,a,b);(b=this.v)&&zu(this,this.na,b);B(a,"change",this.gh,this)};
function Au(a,b){a.D||(a.D=!0,a.b(new su("modifystart",a.A,b)))}function Bu(a,b){Cu(a,b);a.c&&0===a.A.gc()&&(a.R.ga().pb(a.c),a.c=null);Ka(b,"change",a.gh,a)}function Cu(a,b){var c=a.a,d=[];c.forEach(function(a){b===a.feature&&d.push(a)});for(var e=d.length-1;0<=e;--e)c.remove(d[e])}k.setMap=function(a){this.R.setMap(a);Qh.prototype.setMap.call(this,a)};k.nm=function(a){this.wf(a.element)};k.gh=function(a){this.s||(a=a.target,Bu(this,a),this.wf(a))};k.om=function(a){Bu(this,a.element)};
k.tm=function(a,b){var c=b.Z(),c={feature:a,geometry:b,qa:[c,c]};this.a.Ca(b.C(),c)};k.rm=function(a,b){var c=b.Z(),d,e,f;e=0;for(f=c.length;e<f;++e)d=c[e],d={feature:a,geometry:b,depth:[e],index:e,qa:[d,d]},this.a.Ca(b.C(),d)};k.hh=function(a,b){var c=b.Z(),d,e,f,g;d=0;for(e=c.length-1;d<e;++d)f=c.slice(d,d+2),g={feature:a,geometry:b,index:d,qa:f},this.a.Ca(Db(f),g)};
k.qm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,geometry:b,depth:[g],index:e,qa:l},this.a.Ca(Db(l),m)};k.um=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,geometry:b,depth:[g],index:e,qa:l},this.a.Ca(Db(l),m)};
k.sm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m,n,p,q;l=0;for(m=c.length;l<m;++l)for(n=c[l],g=0,h=n.length;g<h;++g)for(d=n[g],e=0,f=d.length-1;e<f;++e)p=d.slice(e,e+2),q={feature:a,geometry:b,depth:[g,l],index:e,qa:p},this.a.Ca(Db(p),q)};k.pm=function(a,b){var c,d=b.f;for(c=0;c<d.length;++c)this.pa[d[c].X()].call(this,a,d[c])};function Du(a,b){var c=a.c;c?c.Y().sa(b):(c=new Am(new C(b)),a.c=c,a.R.ga().ub(c))}function Eu(a,b){return a.index-b.index}
function uu(a){if(!this.tb(a))return!1;zu(this,a.pixel,a.map);this.o.length=0;this.D=!1;var b=this.c;if(b){var c=[],b=b.Y().Z(),d=Db([b]),d=St(this.a,d),e={};d.sort(Eu);for(var f=0,g=d.length;f<g;++f){var h=d[f],l=h.qa,m=x(h.feature),n=h.depth;n&&(m+="-"+n.join("-"));e[m]||(e[m]=Array(2));if(yb(l[0],b)&&!e[m][0])this.o.push([h,0]),e[m][0]=h;else if(yb(l[1],b)&&!e[m][1]){if("LineString"!==h.geometry.X()&&"MultiLineString"!==h.geometry.X()||!e[m][0]||0!==e[m][0].index)this.o.push([h,1]),e[m][1]=h}else x(l)in
this.Ha&&!e[m][0]&&!e[m][1]&&c.push([h,b])}c.length&&Au(this,a);for(a=c.length-1;0<=a;--a)this.il.apply(this,c[a])}return!!this.c}
function vu(a){this.T=!1;Au(this,a);a=a.coordinate;for(var b=0,c=this.o.length;b<c;++b){for(var d=this.o[b],e=d[0],f=e.depth,g=e.geometry,h=g.Z(),l=e.qa,d=d[1];a.length<g.ua();)a.push(0);switch(g.X()){case "Point":h=a;l[0]=l[1]=a;break;case "MultiPoint":h[e.index]=a;l[0]=l[1]=a;break;case "LineString":h[e.index+d]=a;l[d]=a;break;case "MultiLineString":h[f[0]][e.index+d]=a;l[d]=a;break;case "Polygon":h[f[0]][e.index+d]=a;l[d]=a;break;case "MultiPolygon":h[f[1]][f[0]][e.index+d]=a,l[d]=a}e=g;this.s=
!0;e.sa(h);this.s=!1}Du(this,a)}function xu(a){for(var b,c=this.o.length-1;0<=c;--c)b=this.o[c][0],Qt(this.a,Db(b.qa),b);this.D&&(this.b(new su("modifyend",this.A,a)),this.D=!1);return!1}function wu(a){if(!(a instanceof Dg))return!0;this.W=a;var b;Fd(a.map.aa())[1]||a.type!=Ng||this.H||(this.na=a.pixel,zu(this,a.pixel,a.map));this.c&&this.sb(a)&&(b=a.type==Ig&&this.T?!0:this.Yh());a.type==Ig&&(this.T=!1);return Rh.call(this,a)&&!b}
function zu(a,b,c){function d(a,b){return Bb(e,a.qa)-Bb(e,b.qa)}var e=c.Na(b),f=c.Na([b[0]-a.O,b[1]+a.O]),g=c.Na([b[0]+a.O,b[1]-a.O]),f=Db([f,g]),f=St(a.a,f);if(0<f.length){f.sort(d);var g=f[0].qa,h=vb(e,g),l=c.Ga(h);if(Math.sqrt(Ab(b,l))<=a.O){b=c.Ga(g[0]);c=c.Ga(g[1]);b=Ab(l,b);c=Ab(l,c);a.za=Math.sqrt(Math.min(b,c))<=a.O;a.za&&(h=b>c?g[1]:g[0]);Du(a,h);c={};c[x(g)]=!0;b=1;for(l=f.length;b<l;++b)if(h=f[b].qa,yb(g[0],h[0])&&yb(g[1],h[1])||yb(g[0],h[1])&&yb(g[1],h[0]))c[x(h)]=!0;else break;a.Ha=c;
return}}a.c&&(a.R.ga().pb(a.c),a.c=null)}
k.il=function(a,b){for(var c=a.qa,d=a.feature,e=a.geometry,f=a.depth,g=a.index,h;b.length<e.ua();)b.push(0);switch(e.X()){case "MultiLineString":h=e.Z();h[f[0]].splice(g+1,0,b);break;case "Polygon":h=e.Z();h[f[0]].splice(g+1,0,b);break;case "MultiPolygon":h=e.Z();h[f[1]][f[0]].splice(g+1,0,b);break;case "LineString":h=e.Z();h.splice(g+1,0,b);break;default:return}this.s=!0;e.sa(h);this.s=!1;h=this.a;h.remove(a);Fu(this,e,g,f,1);var l={qa:[c[0],b],feature:d,geometry:e,depth:f,index:g};h.Ca(Db(l.qa),
l);this.o.push([l,1]);c={qa:[b,c[1]],feature:d,geometry:e,depth:f,index:g+1};h.Ca(Db(c.qa),c);this.o.push([c,0]);this.T=!0};
k.Yh=function(){var a=!1;if(this.W&&this.W.type!=Og){var b=this.W;Au(this,b);var c=this.o,a={},d=!1,e,f,g,h,l,m,n,p;for(h=c.length-1;0<=h;--h)g=c[h],n=g[0],p=x(n.feature),n.depth&&(p+="-"+n.depth.join("-")),p in a||(a[p]={}),0===g[1]?(a[p].right=n,a[p].index=n.index):1==g[1]&&(a[p].left=n,a[p].index=n.index+1);for(p in a){m=a[p].right;h=a[p].left;g=a[p].index;l=g-1;n=void 0!==h?h:m;0>l&&(l=0);c=n.geometry;e=f=c.Z();d=!1;switch(c.X()){case "MultiLineString":2<f[n.depth[0]].length&&(f[n.depth[0]].splice(g,
1),d=!0);break;case "LineString":2<f.length&&(f.splice(g,1),d=!0);break;case "MultiPolygon":e=e[n.depth[1]];case "Polygon":e=e[n.depth[0]],4<e.length&&(g==e.length-1&&(g=0),e.splice(g,1),d=!0,0===g&&(e.pop(),e.push(e[0]),l=e.length-1))}d&&(e=c,this.s=!0,e.sa(f),this.s=!1,f=[],void 0!==h&&(this.a.remove(h),f.push(h.qa[0])),void 0!==m&&(this.a.remove(m),f.push(m.qa[1])),void 0!==h&&void 0!==m&&(h={depth:n.depth,feature:n.feature,geometry:n.geometry,index:l,qa:f},this.a.Ca(Db(h.qa),h)),Fu(this,c,g,n.depth,
-1),this.c&&(this.R.ga().pb(this.c),this.c=null))}a=d;this.b(new su("modifyend",this.A,b));this.D=!1}return a};function Fu(a,b,c,d,e){Ut(a.a,b.C(),function(a){a.geometry===b&&(void 0===d||void 0===a.depth||hb(a.depth,d))&&a.index>c&&(a.index+=e)})}function yu(){var a=dj();return function(){return a.Point}};function Gu(a,b,c,d){Pa.call(this,a);this.selected=b;this.deselected=c;this.mapBrowserEvent=d}w(Gu,Pa);
function Hu(a){Bh.call(this,{handleEvent:Iu});a=a?a:{};this.H=a.condition?a.condition:Kh;this.A=a.addCondition?a.addCondition:oc;this.D=a.removeCondition?a.removeCondition:oc;this.O=a.toggleCondition?a.toggleCondition:Mh;this.o=a.multi?a.multi:!1;this.j=a.filter?a.filter:nc;this.c=new F({source:new U({useSpatialIndex:!1,features:a.features,wrapX:a.wrapX}),style:a.style?a.style:Ju(),updateWhileAnimating:!0,updateWhileInteracting:!0});if(a.layers)if("function"===typeof a.layers)a=a.layers;else{var b=
a.layers;a=function(a){return bb(b,a)}}else a=nc;this.s=a;this.a={};a=this.c.ga().c;B(a,ue,this.vm,this);B(a,ve,this.ym,this)}w(Hu,Bh);k=Hu.prototype;k.wm=function(){return this.c.ga().c};k.xm=function(a){la(a instanceof Am,42);a=x(a);return this.a[a]};
function Iu(a){if(!this.H(a))return!0;var b=this.A(a),c=this.D(a),d=this.O(a),e=!b&&!c&&!d,f=a.map,g=this.c.ga().c,h=[],l=[];if(e)Aa(this.a),f.Rd(a.pixel,function(a,b){if(this.j(a,b)){l.push(a);var c=x(a);this.a[c]=b;return!this.o}},this,this.s),0<l.length&&1==g.gc()&&g.item(0)==l[0]?l.length=0:(0!==g.gc()&&(h=Array.prototype.concat(g.a),g.clear()),g.pf(l));else{f.Rd(a.pixel,function(a,e){if(this.j(a,e)){if(!b&&!d||bb(g.a,a))(c||d)&&bb(g.a,a)&&(h.push(a),f=x(a),delete this.a[f]);else{l.push(a);var f=
x(a);this.a[f]=e}return!this.o}},this,this.s);for(e=h.length-1;0<=e;--e)g.remove(h[e]);g.pf(l)}(0<l.length||0<h.length)&&this.b(new Gu("select",l,h,a));return Jh(a)}k.setMap=function(a){var b=this.v,c=this.c.ga().c;b&&c.forEach(b.ti,b);Bh.prototype.setMap.call(this,a);this.c.setMap(a);a&&c.forEach(a.pi,a)};function Ju(){var a=dj();eb(a.Polygon,a.LineString);eb(a.GeometryCollection,a.LineString);return function(b){return a[b.Y().X()]}}k.vm=function(a){var b=this.v;b&&b.pi(a.element)};
k.ym=function(a){var b=this.v;b&&b.ti(a.element)};function Ku(a){Qh.call(this,{handleEvent:Lu,handleDownEvent:nc,handleUpEvent:Mu});a=a?a:{};this.s=a.source?a.source:null;this.na=void 0!==a.vertex?a.vertex:!0;this.T=void 0!==a.edge?a.edge:!0;this.o=a.features?a.features:null;this.za=[];this.D={};this.O={};this.W={};this.A={};this.R=null;this.c=void 0!==a.pixelTolerance?a.pixelTolerance:10;this.Ha=Nu.bind(this);this.a=new Pt;this.pa={Point:this.Em,LineString:this.kh,LinearRing:this.kh,Polygon:this.Fm,MultiPoint:this.Cm,MultiLineString:this.Bm,MultiPolygon:this.Dm,
GeometryCollection:this.Am}}w(Ku,Qh);k=Ku.prototype;k.ub=function(a,b){var c=void 0!==b?b:!0,d=x(a),e=a.Y();if(e){var f=this.pa[e.X()];f&&(this.W[d]=e.C(Eb()),f.call(this,a,e),c&&(this.O[d]=B(e,"change",this.Hk.bind(this,a),this)))}c&&(this.D[d]=B(a,Za(a.a),this.zm,this))};k.Gj=function(a){this.ub(a)};k.Hj=function(a){this.pb(a)};k.ih=function(a){var b;a instanceof Zt?b=a.feature:a instanceof te&&(b=a.element);this.ub(b)};
k.jh=function(a){var b;a instanceof Zt?b=a.feature:a instanceof te&&(b=a.element);this.pb(b)};k.zm=function(a){a=a.target;this.pb(a,!0);this.ub(a,!0)};k.Hk=function(a){if(this.H){var b=x(a);b in this.A||(this.A[b]=a)}else this.ui(a)};k.pb=function(a,b){var c=void 0!==b?b:!0,d=x(a),e=this.W[d];if(e){var f=this.a,g=[];Ut(f,e,function(b){a===b.feature&&g.push(b)});for(e=g.length-1;0<=e;--e)f.remove(g[e]);c&&(Va(this.O[d]),delete this.O[d])}c&&(Va(this.D[d]),delete this.D[d])};
k.setMap=function(a){var b=this.v,c=this.za,d;this.o?d=this.o:this.s&&(d=this.s.me());b&&(c.forEach(Va),c.length=0,d.forEach(this.Hj,this));Qh.prototype.setMap.call(this,a);a&&(this.o?c.push(B(this.o,ue,this.ih,this),B(this.o,ve,this.jh,this)):this.s&&c.push(B(this.s,"addfeature",this.ih,this),B(this.s,"removefeature",this.jh,this)),d.forEach(this.Gj,this))};k.Ec=oc;k.ui=function(a){this.pb(a,!1);this.ub(a,!1)};k.Am=function(a,b){var c,d=b.f;for(c=0;c<d.length;++c)this.pa[d[c].X()].call(this,a,d[c])};
k.kh=function(a,b){var c=b.Z(),d,e,f,g;d=0;for(e=c.length-1;d<e;++d)f=c.slice(d,d+2),g={feature:a,qa:f},this.a.Ca(Db(f),g)};k.Bm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,qa:l},this.a.Ca(Db(l),m)};k.Cm=function(a,b){var c=b.Z(),d,e,f;e=0;for(f=c.length;e<f;++e)d=c[e],d={feature:a,qa:[d,d]},this.a.Ca(b.C(),d)};
k.Dm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m,n,p,q;l=0;for(m=c.length;l<m;++l)for(n=c[l],g=0,h=n.length;g<h;++g)for(d=n[g],e=0,f=d.length-1;e<f;++e)p=d.slice(e,e+2),q={feature:a,qa:p},this.a.Ca(Db(p),q)};k.Em=function(a,b){var c=b.Z(),c={feature:a,qa:[c,c]};this.a.Ca(b.C(),c)};k.Fm=function(a,b){var c=b.Z(),d,e,f,g,h,l,m;g=0;for(h=c.length;g<h;++g)for(d=c[g],e=0,f=d.length-1;e<f;++e)l=d.slice(e,e+2),m={feature:a,qa:l},this.a.Ca(Db(l),m)};
function Lu(a){var b,c,d=a.pixel,e=a.coordinate;b=a.map;var f=b.Na([d[0]-this.c,d[1]+this.c]);c=b.Na([d[0]+this.c,d[1]-this.c]);var f=Db([f,c]),g=St(this.a,f),h,f=!1,l=null;c=null;if(0<g.length){this.R=e;g.sort(this.Ha);g=g[0].qa;if(this.na&&!this.T){if(e=b.Ga(g[0]),h=b.Ga(g[1]),e=Ab(d,e),d=Ab(d,h),h=Math.sqrt(Math.min(e,d)),h=h<=this.c)f=!0,l=e>d?g[1]:g[0],c=b.Ga(l)}else this.T&&(l=vb(e,g),c=b.Ga(l),Math.sqrt(Ab(d,c))<=this.c&&(f=!0,this.na&&(e=b.Ga(g[0]),h=b.Ga(g[1]),e=Ab(c,e),d=Ab(c,h),h=Math.sqrt(Math.min(e,
d)),h=h<=this.c)))&&(l=e>d?g[1]:g[0],c=b.Ga(l));f&&(c=[Math.round(c[0]),Math.round(c[1])])}b=l;f&&(a.coordinate=b.slice(0,2),a.pixel=c);return Rh.call(this,a)}function Mu(){var a=Ba(this.A);a.length&&(a.forEach(this.ui,this),this.A={});return!1}function Nu(a,b){return Bb(this.R,a.qa)-Bb(this.R,b.qa)};function Ou(a,b,c){Pa.call(this,a);this.features=b;this.coordinate=c}w(Ou,Pa);function Pu(a){Qh.call(this,{handleDownEvent:Qu,handleDragEvent:Ru,handleMoveEvent:Su,handleUpEvent:Tu});this.s=void 0;this.a=null;this.c=void 0!==a.features?a.features:null;if(a.layers)if("function"===typeof a.layers)a=a.layers;else{var b=a.layers;a=function(a){return bb(b,a)}}else a=nc;this.A=a;this.o=null}w(Pu,Qh);
function Qu(a){this.o=Uu(this,a.pixel,a.map);return!this.a&&this.o?(this.a=a.coordinate,Su.call(this,a),this.b(new Ou("translatestart",this.c,a.coordinate)),!0):!1}function Tu(a){return this.a?(this.a=null,Su.call(this,a),this.b(new Ou("translateend",this.c,a.coordinate)),!0):!1}
function Ru(a){if(this.a){a=a.coordinate;var b=a[0]-this.a[0],c=a[1]-this.a[1];if(this.c)this.c.forEach(function(a){var d=a.Y();d.Qc(b,c);a.Xa(d)});else if(this.o){var d=this.o.Y();d.Qc(b,c);this.o.Xa(d)}this.a=a;this.b(new Ou("translating",this.c,a))}}function Su(a){var b=a.map.xc();Uu(this,a.pixel,a.map)?(this.s=b.style.cursor,b.style.cursor=this.a?"-webkit-grabbing":"-webkit-grab",b.style.cursor=this.a?"grabbing":"grab"):(b.style.cursor=void 0!==this.s?this.s:"",this.s=void 0)}
function Uu(a,b,c){var d=null;b=c.Rd(b,function(a){return a},a,a.A);a.c&&bb(a.c.a,b)&&(d=b);return d};function V(a){a=a?a:{};var b=za({},a);delete b.gradient;delete b.radius;delete b.blur;delete b.shadow;delete b.weight;F.call(this,b);this.f=null;this.ha=void 0!==a.shadow?a.shadow:250;this.W=void 0;this.c=null;B(this,Za("gradient"),this.Ik,this);this.fi(a.gradient?a.gradient:Vu);this.ai(void 0!==a.blur?a.blur:15);this.nh(void 0!==a.radius?a.radius:8);B(this,Za("blur"),this.kf,this);B(this,Za("radius"),this.kf,this);this.kf();var c=a.weight?a.weight:"weight",d;"string"===typeof c?d=function(a){return a.get(c)}:
d=c;this.l(function(a){a=d(a);a=void 0!==a?ma(a,0,1):1;var b=255*a|0,c=this.c[b];c||(c=[new Zi({image:new Qo({opacity:a,src:this.W})})],this.c[b]=c);return c}.bind(this));this.set("renderOrder",null);B(this,"render",this.Zk,this)}w(V,F);var Vu=["#00f","#0ff","#0f0","#ff0","#f00"];k=V.prototype;k.xg=function(){return this.get("blur")};k.Eg=function(){return this.get("gradient")};k.mh=function(){return this.get("radius")};
k.Ik=function(){for(var a=this.Eg(),b=$e(1,256),c=b.createLinearGradient(0,0,1,256),d=1/(a.length-1),e=0,f=a.length;e<f;++e)c.addColorStop(e*d,a[e]);b.fillStyle=c;b.fillRect(0,0,1,256);this.f=b.getImageData(0,0,1,256).data};k.kf=function(){var a=this.mh(),b=this.xg(),c=a+b+1,d=2*c,d=$e(d,d);d.shadowOffsetX=d.shadowOffsetY=this.ha;d.shadowBlur=b;d.shadowColor="#000";d.beginPath();b=c-this.ha;d.arc(b,b,a,0,2*Math.PI,!0);d.fill();this.W=d.canvas.toDataURL();this.c=Array(256);this.u()};
k.Zk=function(a){a=a.context;var b=a.canvas,b=a.getImageData(0,0,b.width,b.height),c=b.data,d,e,f;d=0;for(e=c.length;d<e;d+=4)if(f=4*c[d+3])c[d]=this.f[f],c[d+1]=this.f[f+1],c[d+2]=this.f[f+2];a.putImageData(b,0,0)};k.ai=function(a){this.set("blur",a)};k.fi=function(a){this.set("gradient",a)};k.nh=function(a){this.set("radius",a)};function Wu(a,b,c,d){function e(){delete ja[g];f.parentNode.removeChild(f)}var f=ja.document.createElement("script"),g="olc_"+x(b);f.async=!0;f.src=a+(-1==a.indexOf("?")?"?":"&")+(d||"callback")+"="+g;var h=ja.setTimeout(function(){e();c&&c()},1E4);ja[g]=function(a){ja.clearTimeout(h);e();b(a)};ja.document.getElementsByTagName("head")[0].appendChild(f)};function Xu(a,b,c,d,e,f,g,h,l,m,n){qh.call(this,e,0);this.O=void 0!==n?n:!1;this.D=g;this.H=h;this.l=null;this.c={};this.o=b;this.v=d;this.U=f?f:e;this.g=[];this.Vc=null;this.s=0;f=d.Ea(this.U);h=this.v.C();e=this.o.C();f=h?jc(f,h):f;if(0===cc(f))this.state=4;else if((h=a.C())&&(e?e=jc(e,h):e=h),d=d.$(this.U[0]),d=mk(a,c,gc(f),d),!isFinite(d)||0>=d)this.state=4;else if(this.A=new pk(a,c,f,e,d*(void 0!==m?m:.5)),0===this.A.f.length)this.state=4;else if(this.s=b.ec(d),c=rk(this.A),e&&(a.a?(c[1]=ma(c[1],
e[1],e[3]),c[3]=ma(c[3],e[1],e[3])):c=jc(c,e)),cc(c)){a=ge(b,c,this.s);for(b=a.ca;b<=a.ea;b++)for(c=a.fa;c<=a.ia;c++)(m=l(this.s,b,c,g))&&this.g.push(m);0===this.g.length&&(this.state=4)}else this.state=4}w(Xu,qh);Xu.prototype.ma=function(){1==this.state&&(this.Vc.forEach(Ea),this.Vc=null);qh.prototype.ma.call(this)};Xu.prototype.ab=function(a){if(void 0!==a){var b=x(a);if(b in this.c)return this.c[b];a=Ca(this.c)?this.l:this.l.cloneNode(!1);return this.c[b]=a}return this.l};
Xu.prototype.yd=function(){var a=[];this.g.forEach(function(b){b&&2==b.V()&&a.push({extent:this.o.Ea(b.oa),image:b.ab()})},this);this.g.length=0;if(0===a.length)this.state=3;else{var b=this.U[0],c=this.v.Qa(b),d="number"===typeof c?c:c[0],c="number"===typeof c?c:c[1],b=this.v.$(b),e=this.o.$(this.s),f=this.v.Ea(this.U);this.l=ok(d,c,this.D,e,this.o.C(),b,f,this.A,a,this.H,this.O);this.state=2}rh(this)};
Xu.prototype.load=function(){if(0==this.state){this.state=1;rh(this);var a=0;this.Vc=[];this.g.forEach(function(b){var c=b.V();if(0==c||1==c){a++;var d;d=B(b,"change",function(){var c=b.V();if(2==c||3==c||4==c)Ea(d),a--,0===a&&(this.Vc.forEach(Ea),this.Vc=null,this.yd())},this);this.Vc.push(d)}},this);this.g.forEach(function(a){0==a.V()&&a.load()});0===a&&ja.setTimeout(this.yd.bind(this),0)}};function Yu(a,b){var c=/\{z\}/g,d=/\{x\}/g,e=/\{y\}/g,f=/\{-y\}/g;return function(g){if(g)return a.replace(c,g[0].toString()).replace(d,g[1].toString()).replace(e,function(){return(-g[2]-1).toString()}).replace(f,function(){var a=b.a?b.a[g[0]]:null;la(a,55);return(a.ia-a.fa+1+g[2]).toString()})}}function Zu(a,b){for(var c=a.length,d=Array(c),e=0;e<c;++e)d[e]=Yu(a[e],b);return $u(d)}function $u(a){return 1===a.length?a[0]:function(b,c,d){if(b)return a[ta((b[1]<<b[0])+b[2],a.length)](b,c,d)}}
function av(){}function bv(a){var b=[],c=/\{(\d)-(\d)\}/.exec(a)||/\{([a-z])-([a-z])\}/.exec(a);if(c){var d=c[2].charCodeAt(0),e;for(e=c[1].charCodeAt(0);e<=d;++e)b.push(a.replace(c[0],String.fromCharCode(e)))}else b.push(a);return b};function cv(a){Vl.call(this);this.c=void 0!==a?a:2048}w(cv,Vl);function dv(a){return a.f>a.c}cv.prototype.Jc=function(a){for(var b,c;dv(this);){b=this.a.Fc;c=b.oa[0].toString();var d;if(d=c in a)b=b.oa,d=Wd(a[c],b[1],b[2]);if(d)break;else Oa(this.pop())}};function ev(a){Tg.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,state:a.state,wrapX:a.wrapX});this.ha=void 0!==a.opaque?a.opaque:!1;this.na=void 0!==a.tilePixelRatio?a.tilePixelRatio:1;this.tileGrid=void 0!==a.tileGrid?a.tileGrid:null;this.a=new cv(a.cacheSize);this.j=[0,0];this.fc=""}w(ev,Tg);k=ev.prototype;k.xh=function(){return dv(this.a)};k.Jc=function(a,b){var c=this.od(a);c&&c.Jc(b)};
function uj(a,b,c,d,e){b=a.od(b);if(!b)return!1;for(var f=!0,g,h,l=d.ca;l<=d.ea;++l)for(var m=d.fa;m<=d.ia;++m)g=a.Ib(c,l,m),h=!1,b.b.hasOwnProperty(g)&&(g=b.get(g),(h=2===g.V())&&(h=!1!==e(g))),h||(f=!1);return f}k.Ud=function(){return 0};function fv(a,b){a.fc!==b&&(a.fc=b,a.u())}k.Ib=function(a,b,c){return a+"/"+b+"/"+c};k.gf=function(){return this.ha};k.Pa=function(){return this.tileGrid};k.fb=function(a){return this.tileGrid?this.tileGrid:me(a)};
k.od=function(a){var b=this.f;return b&&!Lc(b,a)?null:this.a};k.zb=function(){return this.na};k.jf=function(a,b,c){c=this.fb(c);b=this.zb(b);a=ae(c.Qa(a),this.j);return 1==b?a:$d(a,b,this.j)};function gv(a,b,c){var d=void 0!==c?c:a.f;c=a.fb(d);if(a.D&&d.g){var e=b;b=e[0];a=le(c,e);d=ne(d);Lb(d,a)?b=e:(e=ec(d),a[0]+=e*Math.ceil((d[0]-a[0])/e),b=c.pd(a,b))}e=b[0];d=b[1];a=b[2];if(c.minZoom>e||e>c.maxZoom)c=!1;else{var f=c.C();c=(c=f?ge(c,f,e):c.a?c.a[e]:null)?Wd(c,d,a):!0}return c?b:null}
k.va=function(){this.a.clear();this.u()};k.Xf=ha;function hv(a,b){Pa.call(this,a);this.tile=b}w(hv,Pa);function iv(a){ev.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tilePixelRatio:a.tilePixelRatio,wrapX:a.wrapX});this.tileLoadFunction=a.tileLoadFunction;this.tileUrlFunction=this.vc?this.vc.bind(this):av;this.urls=null;a.urls?this.Ua(a.urls):a.url&&this.Za(a.url);a.tileUrlFunction&&this.Ta(a.tileUrlFunction)}w(iv,ev);k=iv.prototype;k.gb=function(){return this.tileLoadFunction};
k.hb=function(){return this.tileUrlFunction};k.ib=function(){return this.urls};k.yh=function(a){a=a.target;switch(a.V()){case 1:this.b(new hv("tileloadstart",a));break;case 2:this.b(new hv("tileloadend",a));break;case 3:this.b(new hv("tileloaderror",a))}};k.mb=function(a){this.a.clear();this.tileLoadFunction=a;this.u()};k.Ta=function(a,b){this.tileUrlFunction=a;"undefined"!==typeof b?fv(this,b):this.u()};
k.Za=function(a){var b=this.urls=bv(a);this.Ta(this.vc?this.vc.bind(this):Zu(b,this.tileGrid),a)};k.Ua=function(a){this.urls=a;var b=a.join("\n");this.Ta(this.vc?this.vc.bind(this):Zu(a,this.tileGrid),b)};k.Xf=function(a,b,c){a=this.Ib(a,b,c);this.a.b.hasOwnProperty(a)&&this.a.get(a)};function W(a){iv.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction?a.tileLoadFunction:jv,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:a.tileUrlFunction,url:a.url,urls:a.urls,wrapX:a.wrapX});this.crossOrigin=void 0!==a.crossOrigin?a.crossOrigin:null;this.tileClass=void 0!==a.tileClass?a.tileClass:Dt;this.i={};this.s={};this.pa=a.reprojectionErrorThreshold;
this.H=!1}w(W,iv);k=W.prototype;k.xh=function(){if(dv(this.a))return!0;for(var a in this.i)if(dv(this.i[a]))return!0;return!1};k.Jc=function(a,b){var c=this.od(a);this.a.Jc(this.a==c?b:{});for(var d in this.i){var e=this.i[d];e.Jc(e==c?b:{})}};k.Ud=function(a){return this.f&&a&&!Lc(this.f,a)?0:this.ef()};k.ef=function(){return 0};k.gf=function(a){return this.f&&a&&!Lc(this.f,a)?!1:iv.prototype.gf.call(this,a)};
k.fb=function(a){var b=this.f;return!this.tileGrid||b&&!Lc(b,a)?(b=x(a).toString(),b in this.s||(this.s[b]=me(a)),this.s[b]):this.tileGrid};k.od=function(a){var b=this.f;if(!b||Lc(b,a))return this.a;a=x(a).toString();a in this.i||(this.i[a]=new cv);return this.i[a]};function kv(a,b,c,d,e,f,g){b=[b,c,d];e=(c=gv(a,b,f))?a.tileUrlFunction(c,e,f):void 0;e=new a.tileClass(b,void 0!==e?0:4,void 0!==e?e:"",a.crossOrigin,a.tileLoadFunction);e.key=g;B(e,"change",a.yh,a);return e}
k.dc=function(a,b,c,d,e){if(this.f&&e&&!Lc(this.f,e)){var f=this.od(e);c=[a,b,c];var g;a=this.Ib.apply(this,c);f.b.hasOwnProperty(a)&&(g=f.get(a));b=this.fc;if(g&&g.key==b)return g;var h=this.f,l=this.fb(h),m=this.fb(e),n=gv(this,c,e);d=new Xu(h,l,e,m,c,n,this.zb(d),this.ef(),function(a,b,c,d){return lv(this,a,b,c,d,h)}.bind(this),this.pa,this.H);d.key=b;g?(d.a=g,f.replace(a,d)):f.set(a,d);return d}return lv(this,a,b,c,d,e)};
function lv(a,b,c,d,e,f){var g,h=a.Ib(b,c,d),l=a.fc;if(a.a.b.hasOwnProperty(h)){if(g=a.a.get(h),g.key!=l){var m=g;g.a&&g.a.key==l?(g=g.a,2==m.V()&&(g.a=m)):(g=kv(a,b,c,d,e,f,l),2==m.V()?g.a=m:m.a&&2==m.a.V()&&(g.a=m.a,m.a=null));g.a&&(g.a.a=null);a.a.replace(h,g)}}else g=kv(a,b,c,d,e,f,l),a.a.set(h,g);return g}k.Db=function(a){if(this.H!=a){this.H=a;for(var b in this.i)this.i[b].clear();this.u()}};k.Eb=function(a,b){var c=vc(a);c&&(c=x(c).toString(),c in this.s||(this.s[c]=b))};
function jv(a,b){a.ab().src=b};function mv(a){W.call(this,{cacheSize:a.cacheSize,crossOrigin:"anonymous",opaque:!0,projection:vc("EPSG:3857"),reprojectionErrorThreshold:a.reprojectionErrorThreshold,state:"loading",tileLoadFunction:a.tileLoadFunction,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.o=void 0!==a.culture?a.culture:"en-us";this.c=void 0!==a.maxZoom?a.maxZoom:-1;Wu("https://dev.virtualearth.net/REST/v1/Imagery/Metadata/"+a.imagerySet+"?uriScheme=https&include=ImageryProviders&key="+a.key,this.v.bind(this),void 0,"jsonp")}
w(mv,W);var nv=new qe({html:'<a class="ol-attribution-bing-tos" href="http://www.microsoft.com/maps/product/terms.html">Terms of Use</a>'});
mv.prototype.v=function(a){if(200!=a.statusCode||"OK"!=a.statusDescription||"ValidCredentials"!=a.authenticationResultCode||1!=a.resourceSets.length||1!=a.resourceSets[0].resources.length)Vg(this,"error");else{var b=a.brandLogoUri;-1==b.indexOf("https")&&(b=b.replace("http","https"));var c=a.resourceSets[0].resources[0],d=-1==this.c?c.zoomMax:this.c;a=ne(this.f);var e=pe({extent:a,minZoom:c.zoomMin,maxZoom:d,tileSize:c.imageWidth==c.imageHeight?c.imageWidth:[c.imageWidth,c.imageHeight]});this.tileGrid=
e;var f=this.o;this.tileUrlFunction=$u(c.imageUrlSubdomains.map(function(a){var b=[0,0,0],d=c.imageUrl.replace("{subdomain}",a).replace("{culture}",f);return function(a){if(a)return be(a[0],a[1],-a[2]-1,b),d.replace("{quadkey}",ce(b))}}));if(c.imageryProviders){var g=yc(vc("EPSG:4326"),this.f);a=c.imageryProviders.map(function(a){var b=a.attribution,c={};a.coverageAreas.forEach(function(a){var b=a.zoomMin,f=Math.min(a.zoomMax,d);a=a.bbox;a=mc([a[1],a[0],a[3],a[2]],g);var h,l;for(h=b;h<=f;++h)l=h.toString(),
b=ge(e,a,h),l in c?c[l].push(b):c[l]=[b]});return new qe({html:b,tileRanges:c})});a.push(nv);this.ra(a)}this.O=b;Vg(this,"ready")}};function ov(a){a=a||{};var b=void 0!==a.projection?a.projection:"EPSG:3857",c=void 0!==a.tileGrid?a.tileGrid:pe({extent:ne(b),maxZoom:a.maxZoom,minZoom:a.minZoom,tileSize:a.tileSize});W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,opaque:a.opaque,projection:b,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:c,tileLoadFunction:a.tileLoadFunction,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:a.tileUrlFunction,url:a.url,urls:a.urls,
wrapX:void 0!==a.wrapX?a.wrapX:!0})}w(ov,W);function pv(a){this.v=a.account;this.A=a.map||"";this.c=a.config||{};this.o={};ov.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,maxZoom:void 0!==a.maxZoom?a.maxZoom:18,minZoom:a.minZoom,projection:a.projection,state:"loading",wrapX:a.wrapX});qv(this)}w(pv,ov);k=pv.prototype;k.Qj=function(){return this.c};k.rp=function(a){za(this.c,a);qv(this)};k.Xo=function(a){this.c=a||{};qv(this)};
function qv(a){var b=JSON.stringify(a.c);if(a.o[b])rv(a,a.o[b]);else{var c="https://"+a.v+".cartodb.com/api/v1/map";a.A&&(c+="/named/"+a.A);var d=new XMLHttpRequest;d.addEventListener("load",a.Kk.bind(a,b));d.addEventListener("error",a.Jk.bind(a));d.open("POST",c);d.setRequestHeader("Content-type","application/json");d.send(JSON.stringify(a.c))}}
k.Kk=function(a,b){var c=b.target;if(!c.status||200<=c.status&&300>c.status){var d;try{d=JSON.parse(c.responseText)}catch(e){Vg(this,"error");return}rv(this,d);this.o[a]=d;Vg(this,"ready")}else Vg(this,"error")};k.Jk=function(){Vg(this,"error")};function rv(a,b){a.Za("https://"+b.cdn_url.https+"/"+a.v+"/api/v1/map/"+b.layergroupid+"/{z}/{x}/{y}.png")};function Y(a){U.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,wrapX:a.wrapX});this.H=void 0;this.pa=void 0!==a.distance?a.distance:20;this.A=[];this.za=a.geometryFunction||function(a){a=a.Y();la(a instanceof C,10);return a};this.v=a.source;this.v.I("change",Y.prototype.Ia,this)}w(Y,U);Y.prototype.sb=function(){return this.v};Y.prototype.Nc=function(a,b,c){this.v.Nc(a,b,c);b!==this.H&&(this.clear(),this.H=b,sv(this),this.Hc(this.A))};
Y.prototype.tb=function(a){this.pa=a;this.Ia()};Y.prototype.Ia=function(){this.clear();sv(this);this.Hc(this.A);this.u()};function sv(a){if(void 0!==a.H){a.A.length=0;for(var b=Eb(),c=a.pa*a.H,d=a.v.me(),e={},f=0,g=d.length;f<g;f++){var h=d[f];x(h).toString()in e||!(h=a.za(h))||(h=h.Z(),Rb(h,b),Gb(b,c,b),h=a.v.cf(b),h=h.filter(function(a){a=x(a).toString();return a in e?!1:e[a]=!0}),a.A.push(tv(a,h)))}}}
function tv(a,b){for(var c=[0,0],d=b.length-1;0<=d;--d){var e=a.za(b[d]);e?ub(c,e.Z()):b.splice(d,1)}d=1/b.length;c[0]*=d;c[1]*=d;c=new Am(new C(c));c.set("features",b);return c};function uv(a,b){var c=[];Object.keys(b).forEach(function(a){null!==b[a]&&void 0!==b[a]&&c.push(a+"="+encodeURIComponent(b[a]))});var d=c.join("&");a=a.replace(/[?&]$/,"");a=-1===a.indexOf("?")?a+"?":a+"&";return a+d};function vv(a){a=a||{};tk.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions});this.W=void 0!==a.crossOrigin?a.crossOrigin:null;this.i=a.url;this.j=void 0!==a.imageLoadFunction?a.imageLoadFunction:zk;this.v=a.params||{};this.c=null;this.s=[0,0];this.T=0;this.R=void 0!==a.ratio?a.ratio:1.5}w(vv,tk);k=vv.prototype;k.Nm=function(){return this.v};
k.Kc=function(a,b,c,d){if(void 0===this.i)return null;b=uk(this,b);var e=this.c;if(e&&this.T==this.g&&e.$()==b&&e.f==c&&Nb(e.C(),a))return e;e={F:"image",FORMAT:"PNG32",TRANSPARENT:!0};za(e,this.v);a=a.slice();var f=(a[0]+a[2])/2,g=(a[1]+a[3])/2;if(1!=this.R){var h=this.R*ec(a)/2,l=this.R*fc(a)/2;a[0]=f-h;a[1]=g-l;a[2]=f+h;a[3]=g+l}var h=b/c,l=Math.ceil(ec(a)/h),m=Math.ceil(fc(a)/h);a[0]=f-h*l/2;a[2]=f+h*l/2;a[1]=g-h*m/2;a[3]=g+h*m/2;this.s[0]=l;this.s[1]=m;f=a;g=this.s;d=d.eb.split(":").pop();e.SIZE=
g[0]+","+g[1];e.BBOX=f.join(",");e.BBOXSR=d;e.IMAGESR=d;e.DPI=90*c;d=this.i;f=d.replace(/MapServer\/?$/,"MapServer/export").replace(/ImageServer\/?$/,"ImageServer/exportImage");f==d&&la(!1,50);e=uv(f,e);this.c=new Ct(a,b,c,this.l,e,this.W,this.j);this.T=this.g;B(this.c,"change",this.o,this);return this.c};k.Mm=function(){return this.j};k.Om=function(){return this.i};k.Pm=function(a){this.c=null;this.j=a;this.u()};k.Qm=function(a){a!=this.i&&(this.i=a,this.c=null,this.u())};
k.Rm=function(a){za(this.v,a);this.c=null;this.u()};function wv(a){tk.call(this,{projection:a.projection,resolutions:a.resolutions});this.W=void 0!==a.crossOrigin?a.crossOrigin:null;this.s=void 0!==a.displayDpi?a.displayDpi:96;this.j=a.params||{};this.T=a.url;this.c=void 0!==a.imageLoadFunction?a.imageLoadFunction:zk;this.ha=void 0!==a.hidpi?a.hidpi:!0;this.na=void 0!==a.metersPerUnit?a.metersPerUnit:1;this.v=void 0!==a.ratio?a.ratio:1;this.za=void 0!==a.useOverlay?a.useOverlay:!1;this.i=null;this.R=0}w(wv,tk);k=wv.prototype;k.Tm=function(){return this.j};
k.Kc=function(a,b,c){b=uk(this,b);c=this.ha?c:1;var d=this.i;if(d&&this.R==this.g&&d.$()==b&&d.f==c&&Nb(d.C(),a))return d;1!=this.v&&(a=a.slice(),lc(a,this.v));var e=[ec(a)/b*c,fc(a)/b*c];if(void 0!==this.T){var d=this.T,f=gc(a),g=this.na,h=ec(a),l=fc(a),m=e[0],n=e[1],p=.0254/this.s,e={OPERATION:this.za?"GETDYNAMICMAPOVERLAYIMAGE":"GETMAPIMAGE",VERSION:"2.0.0",LOCALE:"en",CLIENTAGENT:"ol.source.ImageMapGuide source",CLIP:"1",SETDISPLAYDPI:this.s,SETDISPLAYWIDTH:Math.round(e[0]),SETDISPLAYHEIGHT:Math.round(e[1]),
SETVIEWSCALE:n*h>m*l?h*g/(m*p):l*g/(n*p),SETVIEWCENTERX:f[0],SETVIEWCENTERY:f[1]};za(e,this.j);d=uv(d,e);d=new Ct(a,b,c,this.l,d,this.W,this.c);B(d,"change",this.o,this)}else d=null;this.i=d;this.R=this.g;return d};k.Sm=function(){return this.c};k.Vm=function(a){za(this.j,a);this.u()};k.Um=function(a){this.i=null;this.c=a;this.u()};function xv(a){var b=a.imageExtent,c=void 0!==a.crossOrigin?a.crossOrigin:null,d=void 0!==a.imageLoadFunction?a.imageLoadFunction:zk;tk.call(this,{attributions:a.attributions,logo:a.logo,projection:vc(a.projection)});this.c=new Ct(b,void 0,1,this.l,a.url,c,d);this.i=a.imageSize?a.imageSize:null;B(this.c,"change",this.o,this)}w(xv,tk);xv.prototype.Kc=function(a){return kc(a,this.c.C())?this.c:null};
xv.prototype.o=function(a){if(2==this.c.V()){var b=this.c.C(),c=this.c.a(),d,e;this.i?(d=this.i[0],e=this.i[1]):(d=c.width,e=c.height);b=Math.ceil(ec(b)/(fc(b)/e));if(b!=d){var b=$e(b,e),f=b.canvas;b.drawImage(c,0,0,d,e,0,0,f.width,f.height);this.c.g=f}}tk.prototype.o.call(this,a)};function yv(a){a=a||{};tk.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions});this.na=void 0!==a.crossOrigin?a.crossOrigin:null;this.j=a.url;this.R=void 0!==a.imageLoadFunction?a.imageLoadFunction:zk;this.i=a.params||{};this.v=!0;zv(this);this.ha=a.serverType;this.za=void 0!==a.hidpi?a.hidpi:!0;this.c=null;this.T=[0,0];this.W=0;this.s=void 0!==a.ratio?a.ratio:1.5}w(yv,tk);var Av=[101,101];k=yv.prototype;
k.an=function(a,b,c,d){if(void 0!==this.j){var e=ic(a,b,0,Av),f={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",FORMAT:"image/png",TRANSPARENT:!0,QUERY_LAYERS:this.i.LAYERS};za(f,this.i,d);d=Math.floor((e[3]-a[1])/b);f[this.v?"I":"X"]=Math.floor((a[0]-e[0])/b);f[this.v?"J":"Y"]=d;return Bv(this,e,Av,1,vc(c),f)}};k.cn=function(){return this.i};
k.Kc=function(a,b,c,d){if(void 0===this.j)return null;b=uk(this,b);1==c||this.za&&void 0!==this.ha||(c=1);a=a.slice();var e=(a[0]+a[2])/2,f=(a[1]+a[3])/2,g=b/c,h=ec(a)/g,g=fc(a)/g,l=this.c;if(l&&this.W==this.g&&l.$()==b&&l.f==c&&Nb(l.C(),a))return l;if(1!=this.s){var l=this.s*ec(a)/2,m=this.s*fc(a)/2;a[0]=e-l;a[1]=f-m;a[2]=e+l;a[3]=f+m}e={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetMap",FORMAT:"image/png",TRANSPARENT:!0};za(e,this.i);this.T[0]=Math.ceil(h*this.s);this.T[1]=Math.ceil(g*this.s);d=Bv(this,
a,this.T,c,d,e);this.c=new Ct(a,b,c,this.l,d,this.na,this.R);this.W=this.g;B(this.c,"change",this.o,this);return this.c};k.bn=function(){return this.R};
function Bv(a,b,c,d,e,f){la(void 0!==a.j,9);f[a.v?"CRS":"SRS"]=e.eb;"STYLES"in a.i||(f.STYLES="");if(1!=d)switch(a.ha){case "geoserver":d=90*d+.5|0;f.FORMAT_OPTIONS="FORMAT_OPTIONS"in f?f.FORMAT_OPTIONS+(";dpi:"+d):"dpi:"+d;break;case "mapserver":f.MAP_RESOLUTION=90*d;break;case "carmentaserver":case "qgis":f.DPI=90*d;break;default:la(!1,8)}f.WIDTH=c[0];f.HEIGHT=c[1];c=e.b;var g;a.v&&"ne"==c.substr(0,2)?g=[b[1],b[0],b[3],b[2]]:g=b;f.BBOX=g.join(",");return uv(a.j,f)}k.dn=function(){return this.j};
k.en=function(a){this.c=null;this.R=a;this.u()};k.fn=function(a){a!=this.j&&(this.j=a,this.c=null,this.u())};k.gn=function(a){za(this.i,a);zv(this);this.c=null;this.u()};function zv(a){a.v=0<=tb(a.i.VERSION||"1.3.0")};function Cv(a){a=a||{};var b;void 0!==a.attributions?b=a.attributions:b=[Dv];ov.call(this,{attributions:b,cacheSize:a.cacheSize,crossOrigin:void 0!==a.crossOrigin?a.crossOrigin:"anonymous",opaque:void 0!==a.opaque?a.opaque:!0,maxZoom:void 0!==a.maxZoom?a.maxZoom:19,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",wrapX:a.wrapX})}w(Cv,ov);var Dv=new qe({html:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.'});(function(){var a={},b={ja:a};(function(c){if("object"===typeof a&&"undefined"!==typeof b)b.ja=c();else{var d;"undefined"!==typeof window?d=window:"undefined"!==typeof global?d=global:"undefined"!==typeof self?d=self:d=this;d.Op=c()}})(function(){return function d(a,b,g){function h(m,p){if(!b[m]){if(!a[m]){var q="function"==typeof require&&require;if(!p&&q)return q(m,!0);if(l)return l(m,!0);q=Error("Cannot find module '"+m+"'");throw q.code="MODULE_NOT_FOUND",q;}q=b[m]={ja:{}};a[m][0].call(q.ja,function(b){var d=
a[m][1][b];return h(d?d:b)},q,q.ja,d,a,b,g)}return b[m].ja}for(var l="function"==typeof require&&require,m=0;m<g.length;m++)h(g[m]);return h}({1:[function(a,b,f){a=a("./processor");f.Wi=a},{"./processor":2}],2:[function(a,b){function f(a){var b=!0;try{new ImageData(10,10)}catch(d){b=!1}return function(d){var e=d.buffers,f=d.meta,g=d.width,h=d.height,l=e.length,m=e[0].byteLength;if(d.imageOps){m=Array(l);for(d=0;d<l;++d){var G=m,J=d,X;X=new Uint8ClampedArray(e[d]);var A=g,Ma=h;X=b?new ImageData(X,
A,Ma):{data:X,width:A,height:Ma};G[J]=X}g=a(m,f).data}else{g=new Uint8ClampedArray(m);h=Array(l);G=Array(l);for(d=0;d<l;++d)h[d]=new Uint8ClampedArray(e[d]),G[d]=[0,0,0,0];for(e=0;e<m;e+=4){for(d=0;d<l;++d)J=h[d],G[d][0]=J[e],G[d][1]=J[e+1],G[d][2]=J[e+2],G[d][3]=J[e+3];d=a(G,f);g[e]=d[0];g[e+1]=d[1];g[e+2]=d[2];g[e+3]=d[3]}}return g.buffer}}function g(a,b){var d=Object.keys(a.lib||{}).map(function(b){return"var "+b+" = "+a.lib[b].toString()+";"}).concat(["var __minion__ = ("+f.toString()+")(",a.operation.toString(),
");",'self.addEventListener("message", function(event) {',"  var buffer = __minion__(event.data);","  self.postMessage({buffer: buffer, meta: event.data.meta}, [buffer]);","});"]),d=URL.createObjectURL(new Blob(d,{type:"text/javascript"})),d=new Worker(d);d.addEventListener("message",b);return d}function h(a,b){var d=f(a.operation);return{postMessage:function(a){setTimeout(function(){b({data:{buffer:d(a),meta:a.meta}})},0)}}}function l(a){this.Pe=!!a.gl;var b;0===a.threads?b=0:this.Pe?b=1:b=a.threads||
1;var d=[];if(b)for(var e=0;e<b;++e)d[e]=g(a,this.hg.bind(this,e));else d[0]=h(a,this.hg.bind(this,0));this.Kd=d;this.$c=[];this.kj=a.ro||Infinity;this.Id=0;this.Gc={};this.Qe=null}var m=a("./util").Al;l.prototype.po=function(a,b,d){this.hj({yc:a,Ug:b,pg:d});this.eg()};l.prototype.hj=function(a){for(this.$c.push(a);this.$c.length>this.kj;)this.$c.shift().pg(null,null)};l.prototype.eg=function(){if(0===this.Id&&0<this.$c.length){var a=this.Qe=this.$c.shift(),b=a.yc[0].width,d=a.yc[0].height,e=a.yc.map(function(a){return a.data.buffer}),
f=this.Kd.length;this.Id=f;if(1===f)this.Kd[0].postMessage({buffers:e,meta:a.Ug,imageOps:this.Pe,width:b,height:d},e);else for(var g=4*Math.ceil(a.yc[0].data.length/4/f),h=0;h<f;++h){for(var l=h*g,m=[],G=0,J=e.length;G<J;++G)m.push(e[h].slice(l,l+g));this.Kd[h].postMessage({buffers:m,meta:a.Ug,imageOps:this.Pe,width:b,height:d},m)}}};l.prototype.hg=function(a,b){this.Mp||(this.Gc[a]=b.data,--this.Id,0===this.Id&&this.lj())};l.prototype.lj=function(){var a=this.Qe,b=this.Kd.length,d,e;if(1===b)d=new Uint8ClampedArray(this.Gc[0].buffer),
e=this.Gc[0].meta;else{var f=a.yc[0].data.length;d=new Uint8ClampedArray(f);e=Array(f);for(var f=4*Math.ceil(f/4/b),g=0;g<b;++g){var h=g*f;d.set(new Uint8ClampedArray(this.Gc[g].buffer),h);e[g]=this.Gc[g].meta}}this.Qe=null;this.Gc={};a.pg(null,m(d,a.yc[0].width,a.yc[0].height),e);this.eg()};b.ja=l},{"./util":3}],3:[function(a,b,f){var g=!0;try{new ImageData(10,10)}catch(l){g=!1}var h=document.createElement("canvas").getContext("2d");f.Al=function(a,b,d){if(g)return new ImageData(a,b,d);b=h.createImageData(b,
d);b.data.set(a);return b}},{}]},{},[1])(1)});Qq=b.ja})();function Ev(a){this.R=null;this.za=void 0!==a.operationType?a.operationType:"pixel";this.Ia=void 0!==a.threads?a.threads:1;this.c=Fv(a.sources);for(var b=0,c=this.c.length;b<c;++b)B(this.c[b],"change",this.u,this);this.i=$e();this.ha=new xh(function(){return 1},this.u.bind(this));for(var b=Gv(this.c),c={},d=0,e=b.length;d<e;++d)c[x(b[d].layer)]=b[d];this.j=this.s=null;this.W={animate:!1,attributions:{},coordinateToPixelTransform:ah(),extent:null,focus:null,index:0,layerStates:c,layerStatesArray:b,
logos:{},pixelRatio:1,pixelToCoordinateTransform:ah(),postRenderFunctions:[],size:[0,0],skippedFeatureUids:{},tileQueue:this.ha,time:Date.now(),usedTiles:{},viewState:{rotation:0},viewHints:[],wantedTiles:{}};tk.call(this,{});void 0!==a.operation&&this.v(a.operation,a.lib)}w(Ev,tk);Ev.prototype.v=function(a,b){this.R=new Qq.Wi({operation:a,gl:"image"===this.za,ro:1,lib:b,threads:this.Ia});this.u()};function Hv(a,b,c){var d=a.s;return!d||a.g!==d.Uo||c!==d.resolution||!Ub(b,d.extent)}
Ev.prototype.A=function(a,b,c,d){c=!0;for(var e,f=0,g=this.c.length;f<g;++f)if(e=this.c[f].a.ga(),"ready"!==e.V()){c=!1;break}if(!c)return null;a=a.slice();if(!Hv(this,a,b))return this.j;c=this.i.canvas;e=Math.round(ec(a)/b);f=Math.round(fc(a)/b);if(e!==c.width||f!==c.height)c.width=e,c.height=f;e=za({},this.W);e.viewState=za({},e.viewState);var f=gc(a),g=Math.round(ec(a)/b),h=Math.round(fc(a)/b);e.extent=a;e.focus=gc(a);e.size[0]=g;e.size[1]=h;g=e.viewState;g.center=f;g.projection=d;g.resolution=
b;this.j=d=new hk(a,b,1,this.l,c,this.T.bind(this,e));this.s={extent:a,resolution:b,Uo:this.g};return d};
Ev.prototype.T=function(a,b){for(var c=this.c.length,d=Array(c),e=0;e<c;++e){var f;f=this.c[e];var g=a,h=a.layerStatesArray[e];if(f.l(g,h)){var l=g.size[0],m=g.size[1];if(Iv){var n=Iv.canvas;n.width!==l||n.height!==m?Iv=$e(l,m):Iv.clearRect(0,0,l,m)}else Iv=$e(l,m);f.i(g,h,Iv);f=Iv.getImageData(0,0,l,m)}else f=null;if(f)d[e]=f;else return}c={};this.b(new Jv(Kv,a,c));this.R.po(d,c,this.na.bind(this,a,b));yh(a.tileQueue,16,16)};
Ev.prototype.na=function(a,b,c,d,e){c?b(c):d&&(this.b(new Jv(Lv,a,e)),Hv(this,a.extent,a.viewState.resolution/a.pixelRatio)||this.i.putImageData(d,0,0),b(null))};var Iv=null;function Gv(a){return a.map(function(a){return Rg(a.a)})}function Fv(a){for(var b=a.length,c=Array(b),d=0;d<b;++d){var e=d,f=a[d],g=null;f instanceof ev?(f=new Ki({source:f}),g=new Ek(f)):f instanceof tk&&(f=new Ji({source:f}),g=new Dk(f));c[e]=g}return c}
function Jv(a,b,c){Pa.call(this,a);this.extent=b.extent;this.resolution=b.viewState.resolution/b.pixelRatio;this.data=c}w(Jv,Pa);var Kv="beforeoperations",Lv="afteroperations";var Mv={terrain:{wb:"jpg",opaque:!0},"terrain-background":{wb:"jpg",opaque:!0},"terrain-labels":{wb:"png",opaque:!1},"terrain-lines":{wb:"png",opaque:!1},"toner-background":{wb:"png",opaque:!0},toner:{wb:"png",opaque:!0},"toner-hybrid":{wb:"png",opaque:!1},"toner-labels":{wb:"png",opaque:!1},"toner-lines":{wb:"png",opaque:!1},"toner-lite":{wb:"png",opaque:!0},watercolor:{wb:"jpg",opaque:!0}},Nv={terrain:{minZoom:4,maxZoom:18},toner:{minZoom:0,maxZoom:20},watercolor:{minZoom:1,maxZoom:16}};
function Ov(a){var b=a.layer.indexOf("-"),b=-1==b?a.layer:a.layer.slice(0,b),b=Nv[b],c=Mv[a.layer];ov.call(this,{attributions:Pv,cacheSize:a.cacheSize,crossOrigin:"anonymous",maxZoom:void 0!=a.maxZoom?a.maxZoom:b.maxZoom,minZoom:void 0!=a.minZoom?a.minZoom:b.minZoom,opaque:c.opaque,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://stamen-tiles-{a-d}.a.ssl.fastly.net/"+a.layer+"/{z}/{x}/{y}."+c.wb})}w(Ov,ov);
var Pv=[new qe({html:'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.'}),Dv];function Qv(a){a=a||{};W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.c=a.params||{};this.o=Eb()}w(Qv,W);Qv.prototype.v=function(){return this.c};Qv.prototype.zb=function(a){return a};
Qv.prototype.vc=function(a,b,c){var d=this.tileGrid;d||(d=this.fb(c));if(!(d.b.length<=a[0])){var e=d.Ea(a,this.o),f=ae(d.Qa(a[0]),this.j);1!=b&&(f=$d(f,b,this.j));d={F:"image",FORMAT:"PNG32",TRANSPARENT:!0};za(d,this.c);var g=this.urls;g?(c=c.eb.split(":").pop(),d.SIZE=f[0]+","+f[1],d.BBOX=e.join(","),d.BBOXSR=c,d.IMAGESR=c,d.DPI=Math.round(d.DPI?d.DPI*b:90*b),a=1==g.length?g[0]:g[ta((a[1]<<a[0])+a[2],g.length)],b=a.replace(/MapServer\/?$/,"MapServer/export").replace(/ImageServer\/?$/,"ImageServer/exportImage"),
b==a&&la(!1,50),d=uv(b,d)):d=void 0;return d}};Qv.prototype.A=function(a){za(this.c,a);this.u()};function Rv(a,b,c){qh.call(this,a,2);this.l=b;this.c=c;this.g={}}w(Rv,qh);Rv.prototype.ab=function(a){a=void 0!==a?x(a):-1;if(a in this.g)return this.g[a];var b=this.l,c=$e(b[0],b[1]);c.strokeStyle="black";c.strokeRect(.5,.5,b[0]+.5,b[1]+.5);c.fillStyle="black";c.textAlign="center";c.textBaseline="middle";c.font="24px sans-serif";c.fillText(this.c,b[0]/2,b[1]/2);return this.g[a]=c.canvas};
function Sv(a){ev.call(this,{opaque:!1,projection:a.projection,tileGrid:a.tileGrid,wrapX:void 0!==a.wrapX?a.wrapX:!0})}w(Sv,ev);Sv.prototype.dc=function(a,b,c){var d=this.Ib(a,b,c);if(this.a.b.hasOwnProperty(d))return this.a.get(d);var e=ae(this.tileGrid.Qa(a));a=[a,b,c];b=(b=gv(this,a))?gv(this,b).toString():"";e=new Rv(a,e,b);this.a.set(d,e);return e};function Tv(a){this.c=null;W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,projection:vc("EPSG:3857"),reprojectionErrorThreshold:a.reprojectionErrorThreshold,state:"loading",tileLoadFunction:a.tileLoadFunction,wrapX:void 0!==a.wrapX?a.wrapX:!0});if(a.jsonp)Wu(a.url,this.vh.bind(this),this.ke.bind(this));else{var b=new XMLHttpRequest;b.addEventListener("load",this.jn.bind(this));b.addEventListener("error",this.hn.bind(this));b.open("GET",a.url);b.send()}}
w(Tv,W);k=Tv.prototype;k.jn=function(a){a=a.target;if(!a.status||200<=a.status&&300>a.status){var b;try{b=JSON.parse(a.responseText)}catch(c){this.ke();return}this.vh(b)}else this.ke()};k.hn=function(){this.ke()};k.xk=function(){return this.c};
k.vh=function(a){var b=vc("EPSG:4326"),c=this.f,d;if(void 0!==a.bounds){var e=yc(b,c);d=mc(a.bounds,e)}var f=a.minzoom||0,e=a.maxzoom||22;this.tileGrid=c=pe({extent:ne(c),maxZoom:e,minZoom:f});this.tileUrlFunction=Zu(a.tiles,c);if(void 0!==a.attribution&&!this.l){b=void 0!==d?d:b.C();d={};for(var g;f<=e;++f)g=f.toString(),d[g]=[ge(c,b,f)];this.ra([new qe({html:a.attribution,tileRanges:d})])}this.c=a;Vg(this,"ready")};k.ke=function(){Vg(this,"error")};function Uv(a){ev.call(this,{projection:vc("EPSG:3857"),state:"loading"});this.s=void 0!==a.preemptive?a.preemptive:!0;this.o=av;this.i=void 0;this.c=a.jsonp||!1;if(a.url)if(this.c)Wu(a.url,this.Af.bind(this),this.le.bind(this));else{var b=new XMLHttpRequest;b.addEventListener("load",this.nn.bind(this));b.addEventListener("error",this.mn.bind(this));b.open("GET",a.url);b.send()}else a.tileJSON?this.Af(a.tileJSON):la(!1,51)}w(Uv,ev);k=Uv.prototype;
k.nn=function(a){a=a.target;if(!a.status||200<=a.status&&300>a.status){var b;try{b=JSON.parse(a.responseText)}catch(c){this.le();return}this.Af(b)}else this.le()};k.mn=function(){this.le()};k.uk=function(){return this.i};k.Fj=function(a,b,c,d,e){this.tileGrid?(b=this.tileGrid.Yd(a,b),Vv(this.dc(b[0],b[1],b[2],1,this.f),a,c,d,e)):!0===e?Af(function(){c.call(d,null)}):c.call(d,null)};k.le=function(){Vg(this,"error")};
k.Af=function(a){var b=vc("EPSG:4326"),c=this.f,d;if(void 0!==a.bounds){var e=yc(b,c);d=mc(a.bounds,e)}var f=a.minzoom||0,e=a.maxzoom||22;this.tileGrid=c=pe({extent:ne(c),maxZoom:e,minZoom:f});this.i=a.template;var g=a.grids;if(g){this.o=Zu(g,c);if(void 0!==a.attribution){b=void 0!==d?d:b.C();for(d={};f<=e;++f)g=f.toString(),d[g]=[ge(c,b,f)];this.ra([new qe({html:a.attribution,tileRanges:d})])}Vg(this,"ready")}else Vg(this,"error")};
k.dc=function(a,b,c,d,e){var f=this.Ib(a,b,c);if(this.a.b.hasOwnProperty(f))return this.a.get(f);a=[a,b,c];b=gv(this,a,e);d=this.o(b,d,e);d=new Wv(a,void 0!==d?0:4,void 0!==d?d:"",this.tileGrid.Ea(a),this.s,this.c);this.a.set(f,d);return d};k.Xf=function(a,b,c){a=this.Ib(a,b,c);this.a.b.hasOwnProperty(a)&&this.a.get(a)};function Wv(a,b,c,d,e,f){qh.call(this,a,b);this.s=c;this.g=d;this.U=e;this.c=this.o=this.l=null;this.v=f}w(Wv,qh);k=Wv.prototype;k.ab=function(){return null};
k.getData=function(a){if(!this.l||!this.o)return null;var b=this.l[Math.floor((1-(a[1]-this.g[1])/(this.g[3]-this.g[1]))*this.l.length)];if("string"!==typeof b)return null;b=b.charCodeAt(Math.floor((a[0]-this.g[0])/(this.g[2]-this.g[0])*b.length));93<=b&&b--;35<=b&&b--;b-=32;a=null;b in this.o&&(b=this.o[b],this.c&&b in this.c?a=this.c[b]:a=b);return a};
function Vv(a,b,c,d,e){0==a.state&&!0===e?(Ja(a,"change",function(){c.call(d,this.getData(b))},a),Xv(a)):!0===e?Af(function(){c.call(d,this.getData(b))},a):c.call(d,a.getData(b))}k.Ya=function(){return this.s};k.Zd=function(){this.state=3;rh(this)};k.wh=function(a){this.l=a.grid;this.o=a.keys;this.c=a.data;this.state=4;rh(this)};
function Xv(a){if(0==a.state)if(a.state=1,a.v)Wu(a.s,a.wh.bind(a),a.Zd.bind(a));else{var b=new XMLHttpRequest;b.addEventListener("load",a.ln.bind(a));b.addEventListener("error",a.kn.bind(a));b.open("GET",a.s);b.send()}}k.ln=function(a){a=a.target;if(!a.status||200<=a.status&&300>a.status){var b;try{b=JSON.parse(a.responseText)}catch(c){this.Zd();return}this.wh(b)}else this.Zd()};k.kn=function(){this.Zd()};k.load=function(){this.U&&Xv(this)};function Yv(a){a=a||{};var b=a.params||{};W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,opaque:!("TRANSPARENT"in b?b.TRANSPARENT:1),projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.v=void 0!==a.gutter?a.gutter:0;this.c=b;this.o=!0;this.A=a.serverType;this.T=void 0!==a.hidpi?a.hidpi:!0;this.R="";
Zv(this);this.W=Eb();$v(this);fv(this,aw(this))}w(Yv,W);k=Yv.prototype;
k.pn=function(a,b,c,d){c=vc(c);var e=this.tileGrid;e||(e=this.fb(c));b=e.Yd(a,b);if(!(e.b.length<=b[0])){var f=e.$(b[0]),g=e.Ea(b,this.W),e=ae(e.Qa(b[0]),this.j),h=this.v;0!==h&&(e=Zd(e,h,this.j),g=Gb(g,f*h,g));h={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",FORMAT:"image/png",TRANSPARENT:!0,QUERY_LAYERS:this.c.LAYERS};za(h,this.c,d);d=Math.floor((g[3]-a[1])/f);h[this.o?"I":"X"]=Math.floor((a[0]-g[0])/f);h[this.o?"J":"Y"]=d;return bw(this,b,e,g,1,c,h)}};k.ef=function(){return this.v};
k.Ib=function(a,b,c){return this.R+W.prototype.Ib.call(this,a,b,c)};k.qn=function(){return this.c};
function bw(a,b,c,d,e,f,g){var h=a.urls;if(h){g.WIDTH=c[0];g.HEIGHT=c[1];g[a.o?"CRS":"SRS"]=f.eb;"STYLES"in a.c||(g.STYLES="");if(1!=e)switch(a.A){case "geoserver":c=90*e+.5|0;g.FORMAT_OPTIONS="FORMAT_OPTIONS"in g?g.FORMAT_OPTIONS+(";dpi:"+c):"dpi:"+c;break;case "mapserver":g.MAP_RESOLUTION=90*e;break;case "carmentaserver":case "qgis":g.DPI=90*e;break;default:la(!1,52)}f=f.b;a.o&&"ne"==f.substr(0,2)&&(a=d[0],d[0]=d[1],d[1]=a,a=d[2],d[2]=d[3],d[3]=a);g.BBOX=d.join(",");return uv(1==h.length?h[0]:h[ta((b[1]<<
b[0])+b[2],h.length)],g)}}k.zb=function(a){return this.T&&void 0!==this.A?a:1};function Zv(a){var b=0,c=[];if(a.urls){var d,e;d=0;for(e=a.urls.length;d<e;++d)c[b++]=a.urls[d]}a.R=c.join("#")}function aw(a){var b=0,c=[],d;for(d in a.c)c[b++]=d+"-"+a.c[d];return c.join("/")}
k.vc=function(a,b,c){var d=this.tileGrid;d||(d=this.fb(c));if(!(d.b.length<=a[0])){1==b||this.T&&void 0!==this.A||(b=1);var e=d.$(a[0]),f=d.Ea(a,this.W),d=ae(d.Qa(a[0]),this.j),g=this.v;0!==g&&(d=Zd(d,g,this.j),f=Gb(f,e*g,f));1!=b&&(d=$d(d,b,this.j));e={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetMap",FORMAT:"image/png",TRANSPARENT:!0};za(e,this.c);return bw(this,a,d,f,b,c,e)}};k.Ua=function(a){W.prototype.Ua.call(this,a);Zv(this)};k.rn=function(a){za(this.c,a);Zv(this);$v(this);fv(this,aw(this))};
function $v(a){a.o=0<=tb(a.c.VERSION||"1.3.0")};function cw(a,b,c,d,e){qh.call(this,a,b);this.g=$e();this.l=d;this.c=null;this.f={gd:!1,Sf:null,Zh:-1,Tf:-1,xd:null,ri:[]};this.v=e;this.o=c}w(cw,qh);k=cw.prototype;k.ab=function(){return-1==this.f.Tf?null:this.g.canvas};k.Pl=function(){return this.l};k.Ya=function(){return this.o};k.load=function(){0==this.state&&(this.state=1,rh(this),this.v(this,this.o),this.s(null,NaN,null))};k.di=function(a){this.c=a;this.state=2;rh(this)};k.uf=function(a){this.j=a};k.hi=function(a){this.s=a};function dw(a){iv.call(this,{attributions:a.attributions,cacheSize:void 0!==a.cacheSize?a.cacheSize:128,extent:a.extent,logo:a.logo,opaque:!1,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction?a.tileLoadFunction:ew,tileUrlFunction:a.tileUrlFunction,tilePixelRatio:a.tilePixelRatio,url:a.url,urls:a.urls,wrapX:void 0===a.wrapX?!0:a.wrapX});this.c=a.format?a.format:null;this.i=void 0==a.overlaps?!0:a.overlaps;this.tileClass=a.tileClass?a.tileClass:cw}w(dw,iv);
dw.prototype.dc=function(a,b,c,d,e){var f=this.Ib(a,b,c);if(this.a.b.hasOwnProperty(f))return this.a.get(f);a=[a,b,c];d=(b=gv(this,a,e))?this.tileUrlFunction(b,d,e):void 0;d=new this.tileClass(a,void 0!==d?0:4,void 0!==d?d:"",this.c,this.tileLoadFunction);B(d,"change",this.yh,this);this.a.set(f,d);return d};dw.prototype.zb=function(a){return void 0==a?iv.prototype.zb.call(this,a):a};dw.prototype.jf=function(a,b){var c=ae(this.tileGrid.Qa(a));return[Math.round(c[0]*b),Math.round(c[1]*b)]};
function ew(a,b){a.hi(Vm(b,a.l))};function fw(a){this.j=a.matrixIds;de.call(this,{extent:a.extent,origin:a.origin,origins:a.origins,resolutions:a.resolutions,tileSize:a.tileSize,tileSizes:a.tileSizes,sizes:a.sizes})}w(fw,de);fw.prototype.o=function(){return this.j};
function gw(a,b){var c=[],d=[],e=[],f=[],g=[],h;h=vc(a.SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3"));var l=h.cc(),m="ne"==h.b.substr(0,2);a.TileMatrix.sort(function(a,b){return b.ScaleDenominator-a.ScaleDenominator});a.TileMatrix.forEach(function(a){d.push(a.Identifier);var b=2.8E-4*a.ScaleDenominator/l,h=a.TileWidth,t=a.TileHeight;m?e.push([a.TopLeftCorner[1],a.TopLeftCorner[0]]):e.push(a.TopLeftCorner);c.push(b);f.push(h==t?h:[h,t]);g.push([a.MatrixWidth,-a.MatrixHeight])});
return new fw({extent:b,origins:e,resolutions:c,matrixIds:d,tileSizes:f,sizes:g})};function Z(a){function b(a){a="KVP"==d?uv(a,f):a.replace(/\{(\w+?)\}/g,function(a,b){return b.toLowerCase()in f?f[b.toLowerCase()]:a});return function(b){if(b){var c={TileMatrix:e.j[b[0]],TileCol:b[1],TileRow:-b[2]-1};za(c,g);b=a;return b="KVP"==d?uv(b,c):b.replace(/\{(\w+?)\}/g,function(a,b){return c[b]})}}}this.W=void 0!==a.version?a.version:"1.0.0";this.v=void 0!==a.format?a.format:"image/jpeg";this.c=void 0!==a.dimensions?a.dimensions:{};this.A=a.layer;this.o=a.matrixSet;this.R=a.style;var c=
a.urls;void 0===c&&void 0!==a.url&&(c=bv(a.url));var d=this.T=void 0!==a.requestEncoding?a.requestEncoding:"KVP",e=a.tileGrid,f={layer:this.A,style:this.R,tilematrixset:this.o};"KVP"==d&&za(f,{Service:"WMTS",Request:"GetTile",Version:this.W,Format:this.v});var g=this.c,h=c&&0<c.length?$u(c.map(b)):av;W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileClass:a.tileClass,
tileGrid:e,tileLoadFunction:a.tileLoadFunction,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:h,urls:c,wrapX:void 0!==a.wrapX?a.wrapX:!1});fv(this,hw(this))}w(Z,W);k=Z.prototype;k.Sj=function(){return this.c};k.sn=function(){return this.v};k.tn=function(){return this.A};k.ek=function(){return this.o};k.sk=function(){return this.T};k.vn=function(){return this.R};k.zk=function(){return this.W};function hw(a){var b=0,c=[],d;for(d in a.c)c[b++]=d+"-"+a.c[d];return c.join("/")}
k.sp=function(a){za(this.c,a);fv(this,hw(this))};function iw(a){a=a||{};var b=a.size,c=b[0],d=b[1],e=[],f=256;switch(void 0!==a.tierSizeCalculation?a.tierSizeCalculation:"default"){case "default":for(;c>f||d>f;)e.push([Math.ceil(c/f),Math.ceil(d/f)]),f+=f;break;case "truncated":for(;c>f||d>f;)e.push([Math.ceil(c/f),Math.ceil(d/f)]),c>>=1,d>>=1;break;default:la(!1,53)}e.push([1,1]);e.reverse();for(var f=[1],g=[0],d=1,c=e.length;d<c;d++)f.push(1<<d),g.push(e[d-1][0]*e[d-1][1]+g[d-1]);f.reverse();var b=[0,-b[1],b[0],0],b=new de({extent:b,origin:bc(b),
resolutions:f}),h=a.url;W.call(this,{attributions:a.attributions,cacheSize:a.cacheSize,crossOrigin:a.crossOrigin,logo:a.logo,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileClass:jw,tileGrid:b,tileUrlFunction:function(a){if(a){var b=a[0],c=a[1];a=-a[2]-1;return h+"TileGroup"+((c+a*e[b][0]+g[b])/256|0)+"/"+b+"-"+c+"-"+a+".jpg"}}})}w(iw,W);function jw(a,b,c,d,e){Dt.call(this,a,b,c,d,e);this.l={}}w(jw,Dt);
jw.prototype.ab=function(a){var b=void 0!==a?x(a).toString():"";if(b in this.l)return this.l[b];a=Dt.prototype.ab.call(this,a);if(2==this.state){if(256==a.width&&256==a.height)return this.l[b]=a;var c=$e(256,256);c.drawImage(a,0,0);return this.l[b]=c.canvas}return a};function kw(a){a=a||{};this.a=void 0!==a.initialSize?a.initialSize:256;this.g=void 0!==a.maxSize?a.maxSize:void 0!==fa?fa:2048;this.b=void 0!==a.space?a.space:1;this.c=[new lw(this.a,this.b)];this.f=this.a;this.i=[new lw(this.f,this.b)]}kw.prototype.add=function(a,b,c,d,e,f){if(b+this.b>this.g||c+this.b>this.g)return null;d=mw(this,!1,a,b,c,d,f);if(!d)return null;a=mw(this,!0,a,b,c,void 0!==e?e:ha,f);return{offsetX:d.offsetX,offsetY:d.offsetY,image:d.image,Qg:a.image}};
function mw(a,b,c,d,e,f,g){var h=b?a.i:a.c,l,m,n;m=0;for(n=h.length;m<n;++m){l=h[m];if(l=l.add(c,d,e,f,g))return l;l||m!==n-1||(b?(l=Math.min(2*a.f,a.g),a.f=l):(l=Math.min(2*a.a,a.g),a.a=l),l=new lw(l,a.b),h.push(l),++n)}return null}function lw(a,b){this.b=b;this.a=[{x:0,y:0,width:a,height:a}];this.f={};this.g=$e(a,a);this.c=this.g.canvas}lw.prototype.get=function(a){return this.f[a]||null};
lw.prototype.add=function(a,b,c,d,e){var f,g,h;g=0;for(h=this.a.length;g<h;++g)if(f=this.a[g],f.width>=b+this.b&&f.height>=c+this.b)return h={offsetX:f.x+this.b,offsetY:f.y+this.b,image:this.c},this.f[a]=h,d.call(e,this.g,f.x+this.b,f.y+this.b),a=g,b+=this.b,d=c+this.b,f.width-b>f.height-d?(c={x:f.x+b,y:f.y,width:f.width-b,height:f.height},b={x:f.x,y:f.y+d,width:b,height:f.height-d},nw(this,a,c,b)):(c={x:f.x+b,y:f.y,width:f.width-b,height:d},b={x:f.x,y:f.y+d,width:f.width,height:f.height-d},nw(this,
a,c,b)),h;return null};function nw(a,b,c,d){b=[b,1];0<c.width&&0<c.height&&b.push(c);0<d.width&&0<d.height&&b.push(d);a.a.splice.apply(a.a,b)};function ow(a){this.A=this.s=this.f=null;this.j=void 0!==a.fill?a.fill:null;this.Aa=[0,0];this.b=a.points;this.g=void 0!==a.radius?a.radius:a.radius1;this.c=void 0!==a.radius2?a.radius2:this.g;this.l=void 0!==a.angle?a.angle:0;this.a=void 0!==a.stroke?a.stroke:null;this.O=this.Ba=this.D=null;var b=a.atlasManager,c="",d="",e=0,f=null,g,h=0;this.a&&(g=Ce(this.a.b),h=this.a.a,void 0===h&&(h=1),f=this.a.g,Lf||(f=null),d=this.a.c,void 0===d&&(d="round"),c=this.a.f,void 0===c&&(c="round"),e=this.a.i,void 0===
e&&(e=10));var l=2*(this.g+h)+1,c={strokeStyle:g,Ad:h,size:l,lineCap:c,lineDash:f,lineJoin:d,miterLimit:e};if(void 0===b){var m=$e(l,l);this.s=m.canvas;b=l=this.s.width;this.Fh(c,m,0,0);this.j?this.A=this.s:(m=$e(c.size,c.size),this.A=m.canvas,this.Eh(c,m,0,0))}else l=Math.round(l),(d=!this.j)&&(m=this.Eh.bind(this,c)),e=this.a?Ri(this.a):"-",f=this.j?Si(this.j):"-",this.f&&e==this.f[1]&&f==this.f[2]&&this.g==this.f[3]&&this.c==this.f[4]&&this.l==this.f[5]&&this.b==this.f[6]||(this.f=["r"+e+f+(void 0!==
this.g?this.g.toString():"-")+(void 0!==this.c?this.c.toString():"-")+(void 0!==this.l?this.l.toString():"-")+(void 0!==this.b?this.b.toString():"-"),e,f,this.g,this.c,this.l,this.b]),m=b.add(this.f[0],l,l,this.Fh.bind(this,c),m),this.s=m.image,this.Aa=[m.offsetX,m.offsetY],b=m.image.width,this.A=d?m.Qg:this.s;this.D=[l/2,l/2];this.Ba=[l,l];this.O=[b,b];Pi.call(this,{opacity:1,rotateWithView:void 0!==a.rotateWithView?a.rotateWithView:!1,rotation:void 0!==a.rotation?a.rotation:0,scale:1,snapToPixel:void 0!==
a.snapToPixel?a.snapToPixel:!0})}w(ow,Pi);k=ow.prototype;k.bc=function(){return this.D};k.An=function(){return this.l};k.Bn=function(){return this.j};k.ne=function(){return this.A};k.mc=function(){return this.s};k.kd=function(){return this.O};k.sd=function(){return 2};k.Ka=function(){return this.Aa};k.Cn=function(){return this.b};k.Dn=function(){return this.g};k.rk=function(){return this.c};k.Jb=function(){return this.Ba};k.En=function(){return this.a};k.nf=ha;k.load=ha;k.Wf=ha;
k.Fh=function(a,b,c,d){var e;b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();this.c!==this.g&&(this.b*=2);for(c=0;c<=this.b;c++)d=2*c*Math.PI/this.b-Math.PI/2+this.l,e=0===c%2?this.g:this.c,b.lineTo(a.size/2+e*Math.cos(d),a.size/2+e*Math.sin(d));this.j&&(b.fillStyle=Ee(this.j.b),b.fill());this.a&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Ad,a.lineDash&&b.setLineDash(a.lineDash),b.lineCap=a.lineCap,b.lineJoin=a.lineJoin,b.miterLimit=a.miterLimit,b.stroke());b.closePath()};
k.Eh=function(a,b,c,d){b.setTransform(1,0,0,1,0,0);b.translate(c,d);b.beginPath();this.c!==this.g&&(this.b*=2);var e;for(c=0;c<=this.b;c++)e=2*c*Math.PI/this.b-Math.PI/2+this.l,d=0===c%2?this.g:this.c,b.lineTo(a.size/2+d*Math.cos(e),a.size/2+d*Math.sin(e));b.fillStyle=Li;b.fill();this.a&&(b.strokeStyle=a.strokeStyle,b.lineWidth=a.Ad,a.lineDash&&b.setLineDash(a.lineDash),b.stroke());b.closePath()};r("ol.animation.bounce",function(a){var b=a.resolution,c=a.start?a.start:Date.now(),d=void 0!==a.duration?a.duration:1E3,e=a.easing?a.easing:Rd;return function(a,g){if(g.time<c)return g.animate=!0,g.viewHints[0]+=1,!0;if(g.time<c+d){var h=e((g.time-c)/d),l=b-g.viewState.resolution;g.animate=!0;g.viewState.resolution+=h*l;g.viewHints[0]+=1;return!0}return!1}});r("ol.animation.pan",Sd);r("ol.animation.rotate",Td);r("ol.animation.zoom",Ud);ka.prototype.code=ka.prototype.code;r("ol.Attribution",qe);
qe.prototype.getHTML=qe.prototype.g;r("ol.Collection",re);re.prototype.clear=re.prototype.clear;re.prototype.extend=re.prototype.pf;re.prototype.forEach=re.prototype.forEach;re.prototype.getArray=re.prototype.Bl;re.prototype.item=re.prototype.item;re.prototype.getLength=re.prototype.gc;re.prototype.insertAt=re.prototype.ce;re.prototype.pop=re.prototype.pop;re.prototype.push=re.prototype.push;re.prototype.remove=re.prototype.remove;re.prototype.removeAt=re.prototype.Qf;re.prototype.setAt=re.prototype.Wo;
te.prototype.element=te.prototype.element;r("ol.color.asArray",Ae);r("ol.color.asString",Ce);r("ol.colorlike.asColorLike",Ee);r("ol.coordinate.add",ub);r("ol.coordinate.createStringXY",function(a){return function(b){return Cb(b,a)}});r("ol.coordinate.format",xb);r("ol.coordinate.rotate",zb);r("ol.coordinate.toStringHDMS",function(a,b){return a?wb(a[1],"NS",b)+" "+wb(a[0],"EW",b):""});r("ol.coordinate.toStringXY",Cb);r("ol.DeviceOrientation",zm);zm.prototype.getAlpha=zm.prototype.Lj;
zm.prototype.getBeta=zm.prototype.Oj;zm.prototype.getGamma=zm.prototype.Vj;zm.prototype.getHeading=zm.prototype.Cl;zm.prototype.getTracking=zm.prototype.Xg;zm.prototype.setTracking=zm.prototype.qf;r("ol.easing.easeIn",Ld);r("ol.easing.easeOut",Md);r("ol.easing.inAndOut",Nd);r("ol.easing.linear",Qd);r("ol.easing.upAndDown",Rd);r("ol.extent.boundingExtent",Db);r("ol.extent.buffer",Gb);r("ol.extent.containsCoordinate",Lb);r("ol.extent.containsExtent",Nb);r("ol.extent.containsXY",Mb);
r("ol.extent.createEmpty",Eb);r("ol.extent.equals",Ub);r("ol.extent.extend",Vb);r("ol.extent.getBottomLeft",Zb);r("ol.extent.getBottomRight",$b);r("ol.extent.getCenter",gc);r("ol.extent.getHeight",fc);r("ol.extent.getIntersection",jc);r("ol.extent.getSize",function(a){return[a[2]-a[0],a[3]-a[1]]});r("ol.extent.getTopLeft",bc);r("ol.extent.getTopRight",ac);r("ol.extent.getWidth",ec);r("ol.extent.intersects",kc);r("ol.extent.isEmpty",dc);r("ol.extent.applyTransform",mc);r("ol.Feature",Am);
Am.prototype.clone=Am.prototype.clone;Am.prototype.getGeometry=Am.prototype.Y;Am.prototype.getId=Am.prototype.Oa;Am.prototype.getGeometryName=Am.prototype.Xj;Am.prototype.getStyle=Am.prototype.El;Am.prototype.getStyleFunction=Am.prototype.hc;Am.prototype.setGeometry=Am.prototype.Xa;Am.prototype.setStyle=Am.prototype.rf;Am.prototype.setId=Am.prototype.Xb;Am.prototype.setGeometryName=Am.prototype.Cc;r("ol.featureloader.tile",Vm);r("ol.featureloader.xhr",Wm);r("ol.Geolocation",rt);
rt.prototype.getAccuracy=rt.prototype.Jj;rt.prototype.getAccuracyGeometry=rt.prototype.Kj;rt.prototype.getAltitude=rt.prototype.Mj;rt.prototype.getAltitudeAccuracy=rt.prototype.Nj;rt.prototype.getHeading=rt.prototype.Gl;rt.prototype.getPosition=rt.prototype.Hl;rt.prototype.getProjection=rt.prototype.Yg;rt.prototype.getSpeed=rt.prototype.tk;rt.prototype.getTracking=rt.prototype.Zg;rt.prototype.getTrackingOptions=rt.prototype.Kg;rt.prototype.setProjection=rt.prototype.$g;rt.prototype.setTracking=rt.prototype.ee;
rt.prototype.setTrackingOptions=rt.prototype.oi;r("ol.Graticule",xt);xt.prototype.getMap=xt.prototype.Kl;xt.prototype.getMeridians=xt.prototype.fk;xt.prototype.getParallels=xt.prototype.mk;xt.prototype.setMap=xt.prototype.setMap;r("ol.has.DEVICE_PIXEL_RATIO",Kf);r("ol.has.CANVAS",Mf);r("ol.has.DEVICE_ORIENTATION",Nf);r("ol.has.GEOLOCATION",Of);r("ol.has.TOUCH",Pf);r("ol.has.WEBGL",Ff);Ct.prototype.getImage=Ct.prototype.a;Ct.prototype.load=Ct.prototype.load;Dt.prototype.getImage=Dt.prototype.ab;
Dt.prototype.load=Dt.prototype.load;r("ol.inherits",w);r("ol.Kinetic",zh);r("ol.loadingstrategy.all",Ot);r("ol.loadingstrategy.bbox",function(a){return[a]});r("ol.loadingstrategy.tile",function(a){return function(b,c){var d=a.ec(c),e=ge(a,b,d),f=[],d=[d,0,0];for(d[1]=e.ca;d[1]<=e.ea;++d[1])for(d[2]=e.fa;d[2]<=e.ia;++d[2])f.push(a.Ea(d));return f}});r("ol.Map",I);I.prototype.addControl=I.prototype.qj;I.prototype.addInteraction=I.prototype.rj;I.prototype.addLayer=I.prototype.jg;
I.prototype.addOverlay=I.prototype.kg;I.prototype.beforeRender=I.prototype.$a;I.prototype.forEachFeatureAtPixel=I.prototype.Rd;I.prototype.forEachLayerAtPixel=I.prototype.Ol;I.prototype.hasFeatureAtPixel=I.prototype.fl;I.prototype.getEventCoordinate=I.prototype.Tj;I.prototype.getEventPixel=I.prototype.Td;I.prototype.getTarget=I.prototype.sf;I.prototype.getTargetElement=I.prototype.xc;I.prototype.getCoordinateFromPixel=I.prototype.Na;I.prototype.getControls=I.prototype.Rj;I.prototype.getOverlays=I.prototype.kk;
I.prototype.getOverlayById=I.prototype.jk;I.prototype.getInteractions=I.prototype.Yj;I.prototype.getLayerGroup=I.prototype.wc;I.prototype.getLayers=I.prototype.ah;I.prototype.getPixelFromCoordinate=I.prototype.Ga;I.prototype.getSize=I.prototype.kb;I.prototype.getView=I.prototype.aa;I.prototype.getViewport=I.prototype.Ak;I.prototype.renderSync=I.prototype.So;I.prototype.render=I.prototype.render;I.prototype.removeControl=I.prototype.Lo;I.prototype.removeInteraction=I.prototype.Mo;
I.prototype.removeLayer=I.prototype.Oo;I.prototype.removeOverlay=I.prototype.Po;I.prototype.setLayerGroup=I.prototype.gi;I.prototype.setSize=I.prototype.Vf;I.prototype.setTarget=I.prototype.bh;I.prototype.setView=I.prototype.hp;I.prototype.updateSize=I.prototype.Wc;Cg.prototype.originalEvent=Cg.prototype.originalEvent;Cg.prototype.pixel=Cg.prototype.pixel;Cg.prototype.coordinate=Cg.prototype.coordinate;Cg.prototype.dragging=Cg.prototype.dragging;hf.prototype.map=hf.prototype.map;
hf.prototype.frameState=hf.prototype.frameState;Wa.prototype.key=Wa.prototype.key;Wa.prototype.oldValue=Wa.prototype.oldValue;r("ol.Object",Xa);Xa.prototype.get=Xa.prototype.get;Xa.prototype.getKeys=Xa.prototype.P;Xa.prototype.getProperties=Xa.prototype.N;Xa.prototype.set=Xa.prototype.set;Xa.prototype.setProperties=Xa.prototype.G;Xa.prototype.unset=Xa.prototype.S;r("ol.Observable",Ua);r("ol.Observable.unByKey",Va);Ua.prototype.changed=Ua.prototype.u;Ua.prototype.dispatchEvent=Ua.prototype.b;
Ua.prototype.getRevision=Ua.prototype.K;Ua.prototype.on=Ua.prototype.I;Ua.prototype.once=Ua.prototype.L;Ua.prototype.un=Ua.prototype.J;Ua.prototype.unByKey=Ua.prototype.M;r("ol.Overlay",am);am.prototype.getElement=am.prototype.Sd;am.prototype.getId=am.prototype.Oa;am.prototype.getMap=am.prototype.fe;am.prototype.getOffset=am.prototype.Ig;am.prototype.getPosition=am.prototype.dh;am.prototype.getPositioning=am.prototype.Jg;am.prototype.setElement=am.prototype.ci;am.prototype.setMap=am.prototype.setMap;
am.prototype.setOffset=am.prototype.ii;am.prototype.setPosition=am.prototype.tf;am.prototype.setPositioning=am.prototype.li;r("ol.render.toContext",function(a,b){var c=a.canvas,d=b?b:{},e=d.pixelRatio||Kf;if(d=d.size)c.width=d[0]*e,c.height=d[1]*e,c.style.width=d[0]+"px",c.style.height=d[1]+"px";c=[0,0,c.width,c.height];d=hh(ah(),e,e);return new gj(a,e,c,d,0)});r("ol.size.toSize",ae);qh.prototype.getTileCoord=qh.prototype.i;qh.prototype.load=qh.prototype.load;cw.prototype.getFormat=cw.prototype.Pl;
cw.prototype.setFeatures=cw.prototype.di;cw.prototype.setProjection=cw.prototype.uf;cw.prototype.setLoader=cw.prototype.hi;r("ol.View",Bd);Bd.prototype.constrainCenter=Bd.prototype.Od;Bd.prototype.constrainResolution=Bd.prototype.constrainResolution;Bd.prototype.constrainRotation=Bd.prototype.constrainRotation;Bd.prototype.getCenter=Bd.prototype.bb;Bd.prototype.calculateExtent=Bd.prototype.Ic;Bd.prototype.getMaxResolution=Bd.prototype.Ql;Bd.prototype.getMinResolution=Bd.prototype.Rl;
Bd.prototype.getProjection=Bd.prototype.Sl;Bd.prototype.getResolution=Bd.prototype.$;Bd.prototype.getResolutions=Bd.prototype.Tl;Bd.prototype.getRotation=Bd.prototype.Ma;Bd.prototype.getZoom=Bd.prototype.Ck;Bd.prototype.fit=Bd.prototype.af;Bd.prototype.centerOn=Bd.prototype.Aj;Bd.prototype.rotate=Bd.prototype.rotate;Bd.prototype.setCenter=Bd.prototype.ob;Bd.prototype.setResolution=Bd.prototype.Zb;Bd.prototype.setRotation=Bd.prototype.ge;Bd.prototype.setZoom=Bd.prototype.kp;
r("ol.xml.getAllTextContent",Em);r("ol.xml.parse",Im);el.prototype.getGL=el.prototype.Xn;el.prototype.useProgram=el.prototype.ve;r("ol.tilegrid.createXYZ",pe);r("ol.tilegrid.TileGrid",de);de.prototype.forEachTileCoord=de.prototype.wg;de.prototype.getMaxZoom=de.prototype.Gg;de.prototype.getMinZoom=de.prototype.Hg;de.prototype.getOrigin=de.prototype.Ka;de.prototype.getResolution=de.prototype.$;de.prototype.getResolutions=de.prototype.Hh;de.prototype.getTileCoordExtent=de.prototype.Ea;
de.prototype.getTileCoordForCoordAndResolution=de.prototype.Yd;de.prototype.getTileCoordForCoordAndZ=de.prototype.pd;de.prototype.getTileSize=de.prototype.Qa;de.prototype.getZForResolution=de.prototype.ec;r("ol.tilegrid.WMTS",fw);fw.prototype.getMatrixIds=fw.prototype.o;r("ol.tilegrid.WMTS.createFromCapabilitiesMatrixSet",gw);r("ol.style.AtlasManager",kw);r("ol.style.Circle",Qi);Qi.prototype.getFill=Qi.prototype.wn;Qi.prototype.getImage=Qi.prototype.mc;Qi.prototype.getRadius=Qi.prototype.xn;
Qi.prototype.getStroke=Qi.prototype.yn;r("ol.style.Fill",Ti);Ti.prototype.getColor=Ti.prototype.g;Ti.prototype.setColor=Ti.prototype.f;r("ol.style.Icon",Qo);Qo.prototype.getAnchor=Qo.prototype.bc;Qo.prototype.getImage=Qo.prototype.mc;Qo.prototype.getOrigin=Qo.prototype.Ka;Qo.prototype.getSrc=Qo.prototype.zn;Qo.prototype.getSize=Qo.prototype.Jb;Qo.prototype.load=Qo.prototype.load;r("ol.style.Image",Pi);Pi.prototype.getOpacity=Pi.prototype.oe;Pi.prototype.getRotateWithView=Pi.prototype.pe;
Pi.prototype.getRotation=Pi.prototype.qe;Pi.prototype.getScale=Pi.prototype.re;Pi.prototype.getSnapToPixel=Pi.prototype.Xd;Pi.prototype.setOpacity=Pi.prototype.se;Pi.prototype.setRotation=Pi.prototype.te;Pi.prototype.setScale=Pi.prototype.ue;r("ol.style.RegularShape",ow);ow.prototype.getAnchor=ow.prototype.bc;ow.prototype.getAngle=ow.prototype.An;ow.prototype.getFill=ow.prototype.Bn;ow.prototype.getImage=ow.prototype.mc;ow.prototype.getOrigin=ow.prototype.Ka;ow.prototype.getPoints=ow.prototype.Cn;
ow.prototype.getRadius=ow.prototype.Dn;ow.prototype.getRadius2=ow.prototype.rk;ow.prototype.getSize=ow.prototype.Jb;ow.prototype.getStroke=ow.prototype.En;r("ol.style.Stroke",Yi);Yi.prototype.getColor=Yi.prototype.Fn;Yi.prototype.getLineCap=Yi.prototype.ak;Yi.prototype.getLineDash=Yi.prototype.Gn;Yi.prototype.getLineJoin=Yi.prototype.bk;Yi.prototype.getMiterLimit=Yi.prototype.gk;Yi.prototype.getWidth=Yi.prototype.Hn;Yi.prototype.setColor=Yi.prototype.In;Yi.prototype.setLineCap=Yi.prototype.bp;
Yi.prototype.setLineDash=Yi.prototype.Jn;Yi.prototype.setLineJoin=Yi.prototype.cp;Yi.prototype.setMiterLimit=Yi.prototype.ep;Yi.prototype.setWidth=Yi.prototype.ip;r("ol.style.Style",Zi);Zi.prototype.getGeometry=Zi.prototype.Y;Zi.prototype.getGeometryFunction=Zi.prototype.Wj;Zi.prototype.getFill=Zi.prototype.Kn;Zi.prototype.getImage=Zi.prototype.Ln;Zi.prototype.getStroke=Zi.prototype.Mn;Zi.prototype.getText=Zi.prototype.Ja;Zi.prototype.getZIndex=Zi.prototype.Nn;Zi.prototype.setGeometry=Zi.prototype.Gh;
Zi.prototype.setZIndex=Zi.prototype.On;r("ol.style.Text",Ro);Ro.prototype.getFont=Ro.prototype.Uj;Ro.prototype.getOffsetX=Ro.prototype.hk;Ro.prototype.getOffsetY=Ro.prototype.ik;Ro.prototype.getFill=Ro.prototype.Pn;Ro.prototype.getRotateWithView=Ro.prototype.Qn;Ro.prototype.getRotation=Ro.prototype.Rn;Ro.prototype.getScale=Ro.prototype.Sn;Ro.prototype.getStroke=Ro.prototype.Tn;Ro.prototype.getText=Ro.prototype.Ja;Ro.prototype.getTextAlign=Ro.prototype.vk;Ro.prototype.getTextBaseline=Ro.prototype.wk;
Ro.prototype.setFont=Ro.prototype.Zo;Ro.prototype.setOffsetX=Ro.prototype.ji;Ro.prototype.setOffsetY=Ro.prototype.ki;Ro.prototype.setFill=Ro.prototype.Yo;Ro.prototype.setRotation=Ro.prototype.Un;Ro.prototype.setScale=Ro.prototype.Vn;Ro.prototype.setStroke=Ro.prototype.fp;Ro.prototype.setText=Ro.prototype.mi;Ro.prototype.setTextAlign=Ro.prototype.ni;Ro.prototype.setTextBaseline=Ro.prototype.gp;r("ol.Sphere",pc);pc.prototype.geodesicArea=pc.prototype.a;pc.prototype.haversineDistance=pc.prototype.b;
r("ol.source.BingMaps",mv);r("ol.source.BingMaps.TOS_ATTRIBUTION",nv);r("ol.source.CartoDB",pv);pv.prototype.getConfig=pv.prototype.Qj;pv.prototype.updateConfig=pv.prototype.rp;pv.prototype.setConfig=pv.prototype.Xo;r("ol.source.Cluster",Y);Y.prototype.getSource=Y.prototype.sb;Y.prototype.setDistance=Y.prototype.tb;r("ol.source.Image",tk);vk.prototype.image=vk.prototype.image;r("ol.source.ImageArcGISRest",vv);vv.prototype.getParams=vv.prototype.Nm;vv.prototype.getImageLoadFunction=vv.prototype.Mm;
vv.prototype.getUrl=vv.prototype.Om;vv.prototype.setImageLoadFunction=vv.prototype.Pm;vv.prototype.setUrl=vv.prototype.Qm;vv.prototype.updateParams=vv.prototype.Rm;r("ol.source.ImageCanvas",Ak);r("ol.source.ImageMapGuide",wv);wv.prototype.getParams=wv.prototype.Tm;wv.prototype.getImageLoadFunction=wv.prototype.Sm;wv.prototype.updateParams=wv.prototype.Vm;wv.prototype.setImageLoadFunction=wv.prototype.Um;r("ol.source.ImageStatic",xv);r("ol.source.ImageVector",Bk);Bk.prototype.getSource=Bk.prototype.Wm;
Bk.prototype.getStyle=Bk.prototype.Xm;Bk.prototype.getStyleFunction=Bk.prototype.Ym;Bk.prototype.setStyle=Bk.prototype.uh;r("ol.source.ImageWMS",yv);yv.prototype.getGetFeatureInfoUrl=yv.prototype.an;yv.prototype.getParams=yv.prototype.cn;yv.prototype.getImageLoadFunction=yv.prototype.bn;yv.prototype.getUrl=yv.prototype.dn;yv.prototype.setImageLoadFunction=yv.prototype.en;yv.prototype.setUrl=yv.prototype.fn;yv.prototype.updateParams=yv.prototype.gn;r("ol.source.OSM",Cv);
r("ol.source.OSM.ATTRIBUTION",Dv);r("ol.source.Raster",Ev);Ev.prototype.setOperation=Ev.prototype.v;Jv.prototype.extent=Jv.prototype.extent;Jv.prototype.resolution=Jv.prototype.resolution;Jv.prototype.data=Jv.prototype.data;r("ol.source.Source",Tg);Tg.prototype.getAttributions=Tg.prototype.xa;Tg.prototype.getLogo=Tg.prototype.wa;Tg.prototype.getProjection=Tg.prototype.ya;Tg.prototype.getState=Tg.prototype.V;Tg.prototype.refresh=Tg.prototype.va;Tg.prototype.setAttributions=Tg.prototype.ra;
r("ol.source.Stamen",Ov);r("ol.source.Tile",ev);ev.prototype.getTileGrid=ev.prototype.Pa;hv.prototype.tile=hv.prototype.tile;r("ol.source.TileArcGISRest",Qv);Qv.prototype.getParams=Qv.prototype.v;Qv.prototype.updateParams=Qv.prototype.A;r("ol.source.TileDebug",Sv);r("ol.source.TileImage",W);W.prototype.setRenderReprojectionEdges=W.prototype.Db;W.prototype.setTileGridForProjection=W.prototype.Eb;r("ol.source.TileJSON",Tv);Tv.prototype.getTileJSON=Tv.prototype.xk;r("ol.source.TileUTFGrid",Uv);
Uv.prototype.getTemplate=Uv.prototype.uk;Uv.prototype.forDataAtCoordinateAndResolution=Uv.prototype.Fj;r("ol.source.TileWMS",Yv);Yv.prototype.getGetFeatureInfoUrl=Yv.prototype.pn;Yv.prototype.getParams=Yv.prototype.qn;Yv.prototype.updateParams=Yv.prototype.rn;iv.prototype.getTileLoadFunction=iv.prototype.gb;iv.prototype.getTileUrlFunction=iv.prototype.hb;iv.prototype.getUrls=iv.prototype.ib;iv.prototype.setTileLoadFunction=iv.prototype.mb;iv.prototype.setTileUrlFunction=iv.prototype.Ta;
iv.prototype.setUrl=iv.prototype.Za;iv.prototype.setUrls=iv.prototype.Ua;r("ol.source.Vector",U);U.prototype.addFeature=U.prototype.ub;U.prototype.addFeatures=U.prototype.Hc;U.prototype.clear=U.prototype.clear;U.prototype.forEachFeature=U.prototype.ug;U.prototype.forEachFeatureInExtent=U.prototype.xb;U.prototype.forEachFeatureIntersectingExtent=U.prototype.vg;U.prototype.getFeaturesCollection=U.prototype.Dg;U.prototype.getFeatures=U.prototype.me;U.prototype.getFeaturesAtCoordinate=U.prototype.Cg;
U.prototype.getFeaturesInExtent=U.prototype.cf;U.prototype.getClosestFeatureToCoordinate=U.prototype.yg;U.prototype.getExtent=U.prototype.C;U.prototype.getFeatureById=U.prototype.Bg;U.prototype.getFormat=U.prototype.zh;U.prototype.getUrl=U.prototype.Ah;U.prototype.removeFeature=U.prototype.pb;Zt.prototype.feature=Zt.prototype.feature;r("ol.source.VectorTile",dw);r("ol.source.WMTS",Z);Z.prototype.getDimensions=Z.prototype.Sj;Z.prototype.getFormat=Z.prototype.sn;Z.prototype.getLayer=Z.prototype.tn;
Z.prototype.getMatrixSet=Z.prototype.ek;Z.prototype.getRequestEncoding=Z.prototype.sk;Z.prototype.getStyle=Z.prototype.vn;Z.prototype.getVersion=Z.prototype.zk;Z.prototype.updateDimensions=Z.prototype.sp;
r("ol.source.WMTS.optionsFromCapabilities",function(a,b){var c=gb(a.Contents.Layer,function(a){return a.Identifier==b.layer}),d=a.Contents.TileMatrixSet,e,f;e=1<c.TileMatrixSetLink.length?"projection"in b?kb(c.TileMatrixSetLink,function(a){return gb(d,function(b){return b.Identifier==a.TileMatrixSet}).SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3")==b.projection}):kb(c.TileMatrixSetLink,function(a){return a.TileMatrixSet==b.matrixSet}):0;0>e&&(e=0);f=c.TileMatrixSetLink[e].TileMatrixSet;
var g=c.Format[0];"format"in b&&(g=b.format);e=kb(c.Style,function(a){return"style"in b?a.Title==b.style:a.isDefault});0>e&&(e=0);e=c.Style[e].Identifier;var h={};"Dimension"in c&&c.Dimension.forEach(function(a){var b=a.Identifier,c=a.Default;void 0===c&&(c=a.Value[0]);h[b]=c});var l=gb(a.Contents.TileMatrixSet,function(a){return a.Identifier==f}),m;m="projection"in b?vc(b.projection):vc(l.SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3"));var n=c.WGS84BoundingBox,p,q;void 0!==n&&
(q=vc("EPSG:4326").C(),q=n[0]==q[0]&&n[2]==q[2],p=Pc(n,"EPSG:4326",m),(n=m.C())&&(Nb(n,p)||(p=void 0)));var l=gw(l,p),t=[];p=b.requestEncoding;p=void 0!==p?p:"";if("OperationsMetadata"in a&&"GetTile"in a.OperationsMetadata)for(var n=a.OperationsMetadata.GetTile.DCP.HTTP.Get,v=0,u=n.length;v<u;++v){var y=gb(n[v].Constraint,function(a){return"GetEncoding"==a.name}).AllowedValues.Value;""===p&&(p=y[0]);if("KVP"===p)bb(y,"KVP")&&t.push(n[v].href);else break}0===t.length&&(p="REST",c.ResourceURL.forEach(function(a){"tile"===
a.resourceType&&(g=a.format,t.push(a.template))}));return{urls:t,layer:b.layer,matrixSet:f,format:g,projection:m,requestEncoding:p,tileGrid:l,style:e,dimensions:h,wrapX:q}});r("ol.source.XYZ",ov);r("ol.source.Zoomify",iw);Sg.prototype.vectorContext=Sg.prototype.vectorContext;Sg.prototype.frameState=Sg.prototype.frameState;Sg.prototype.context=Sg.prototype.context;Sg.prototype.glContext=Sg.prototype.glContext;Rq.prototype.get=Rq.prototype.get;Rq.prototype.getExtent=Rq.prototype.C;
Rq.prototype.getGeometry=Rq.prototype.Y;Rq.prototype.getProperties=Rq.prototype.Im;Rq.prototype.getType=Rq.prototype.X;r("ol.render.VectorContext",fj);Bl.prototype.setStyle=Bl.prototype.rd;Bl.prototype.drawGeometry=Bl.prototype.sc;Bl.prototype.drawFeature=Bl.prototype.We;gj.prototype.drawCircle=gj.prototype.Qd;gj.prototype.setStyle=gj.prototype.rd;gj.prototype.drawGeometry=gj.prototype.sc;gj.prototype.drawFeature=gj.prototype.We;r("ol.proj.common.add",Ii);r("ol.proj.METERS_PER_UNIT",rc);
r("ol.proj.Projection",sc);sc.prototype.getCode=sc.prototype.Pj;sc.prototype.getExtent=sc.prototype.C;sc.prototype.getUnits=sc.prototype.Ab;sc.prototype.getMetersPerUnit=sc.prototype.cc;sc.prototype.getWorldExtent=sc.prototype.Bk;sc.prototype.isGlobal=sc.prototype.kl;sc.prototype.setGlobal=sc.prototype.ap;sc.prototype.setExtent=sc.prototype.Hm;sc.prototype.setWorldExtent=sc.prototype.jp;sc.prototype.setGetPointResolution=sc.prototype.$o;sc.prototype.getPointResolution=sc.prototype.getPointResolution;
r("ol.proj.setProj4",function(a){uc=a});r("ol.proj.addEquivalentProjections",wc);r("ol.proj.addProjection",Ic);r("ol.proj.addCoordinateTransforms",xc);r("ol.proj.fromLonLat",function(a,b){return Oc(a,"EPSG:4326",void 0!==b?b:"EPSG:3857")});r("ol.proj.toLonLat",function(a,b){return Oc(a,void 0!==b?b:"EPSG:3857","EPSG:4326")});r("ol.proj.get",vc);r("ol.proj.equivalent",Lc);r("ol.proj.getTransform",Mc);r("ol.proj.transform",Oc);r("ol.proj.transformExtent",Pc);r("ol.layer.Base",Qg);
Qg.prototype.getExtent=Qg.prototype.C;Qg.prototype.getMaxResolution=Qg.prototype.Rb;Qg.prototype.getMinResolution=Qg.prototype.Sb;Qg.prototype.getOpacity=Qg.prototype.Tb;Qg.prototype.getVisible=Qg.prototype.Bb;Qg.prototype.getZIndex=Qg.prototype.Ub;Qg.prototype.setExtent=Qg.prototype.ic;Qg.prototype.setMaxResolution=Qg.prototype.oc;Qg.prototype.setMinResolution=Qg.prototype.pc;Qg.prototype.setOpacity=Qg.prototype.jc;Qg.prototype.setVisible=Qg.prototype.kc;Qg.prototype.setZIndex=Qg.prototype.lc;
r("ol.layer.Group",zi);zi.prototype.getLayers=zi.prototype.Rc;zi.prototype.setLayers=zi.prototype.lh;r("ol.layer.Heatmap",V);V.prototype.getBlur=V.prototype.xg;V.prototype.getGradient=V.prototype.Eg;V.prototype.getRadius=V.prototype.mh;V.prototype.setBlur=V.prototype.ai;V.prototype.setGradient=V.prototype.fi;V.prototype.setRadius=V.prototype.nh;r("ol.layer.Image",Ji);Ji.prototype.getSource=Ji.prototype.ga;r("ol.layer.Layer",Wg);Wg.prototype.getSource=Wg.prototype.ga;Wg.prototype.setMap=Wg.prototype.setMap;
Wg.prototype.setSource=Wg.prototype.Dc;r("ol.layer.Tile",Ki);Ki.prototype.getPreload=Ki.prototype.f;Ki.prototype.getSource=Ki.prototype.ga;Ki.prototype.setPreload=Ki.prototype.l;Ki.prototype.getUseInterimTilesOnError=Ki.prototype.c;Ki.prototype.setUseInterimTilesOnError=Ki.prototype.A;r("ol.layer.Vector",F);F.prototype.getSource=F.prototype.ga;F.prototype.getStyle=F.prototype.H;F.prototype.getStyleFunction=F.prototype.D;F.prototype.setStyle=F.prototype.l;r("ol.layer.VectorTile",H);
H.prototype.getPreload=H.prototype.f;H.prototype.getUseInterimTilesOnError=H.prototype.c;H.prototype.setPreload=H.prototype.W;H.prototype.setUseInterimTilesOnError=H.prototype.ha;r("ol.interaction.DoubleClickZoom",Fh);r("ol.interaction.DoubleClickZoom.handleEvent",Gh);r("ol.interaction.DragAndDrop",Ft);r("ol.interaction.DragAndDrop.handleEvent",nc);It.prototype.features=It.prototype.features;It.prototype.file=It.prototype.file;It.prototype.projection=It.prototype.projection;
di.prototype.coordinate=di.prototype.coordinate;di.prototype.mapBrowserEvent=di.prototype.mapBrowserEvent;r("ol.interaction.DragBox",ei);ei.prototype.getGeometry=ei.prototype.Y;r("ol.interaction.DragPan",Th);r("ol.interaction.DragRotate",Xh);r("ol.interaction.DragRotateAndZoom",Kt);r("ol.interaction.DragZoom",ji);bu.prototype.feature=bu.prototype.feature;r("ol.interaction.Draw",cu);r("ol.interaction.Draw.handleEvent",eu);cu.prototype.removeLastPoint=cu.prototype.No;cu.prototype.finishDrawing=cu.prototype.jd;
cu.prototype.extend=cu.prototype.mm;r("ol.interaction.Draw.createRegularPolygon",function(a,b){return function(c,d){var e=c[0],f=c[1],g=Math.sqrt(Ab(e,f)),h=d?d:zd(new st(e),a);Ad(h,e,g,b?b:Math.atan((f[1]-e[1])/(f[0]-e[0])));return h}});r("ol.interaction.defaults",yi);r("ol.interaction.Interaction",Bh);Bh.prototype.getActive=Bh.prototype.f;Bh.prototype.getMap=Bh.prototype.l;Bh.prototype.setActive=Bh.prototype.i;r("ol.interaction.KeyboardPan",ki);r("ol.interaction.KeyboardPan.handleEvent",li);
r("ol.interaction.KeyboardZoom",mi);r("ol.interaction.KeyboardZoom.handleEvent",ni);su.prototype.features=su.prototype.features;su.prototype.mapBrowserEvent=su.prototype.mapBrowserEvent;r("ol.interaction.Modify",tu);r("ol.interaction.Modify.handleEvent",wu);tu.prototype.removePoint=tu.prototype.Yh;r("ol.interaction.MouseWheelZoom",oi);r("ol.interaction.MouseWheelZoom.handleEvent",pi);oi.prototype.setMouseAnchor=oi.prototype.D;r("ol.interaction.PinchRotate",qi);r("ol.interaction.PinchZoom",ui);
r("ol.interaction.Pointer",Qh);r("ol.interaction.Pointer.handleEvent",Rh);Gu.prototype.selected=Gu.prototype.selected;Gu.prototype.deselected=Gu.prototype.deselected;Gu.prototype.mapBrowserEvent=Gu.prototype.mapBrowserEvent;r("ol.interaction.Select",Hu);Hu.prototype.getFeatures=Hu.prototype.wm;Hu.prototype.getLayer=Hu.prototype.xm;r("ol.interaction.Select.handleEvent",Iu);Hu.prototype.setMap=Hu.prototype.setMap;r("ol.interaction.Snap",Ku);Ku.prototype.addFeature=Ku.prototype.ub;
Ku.prototype.removeFeature=Ku.prototype.pb;Ou.prototype.features=Ou.prototype.features;Ou.prototype.coordinate=Ou.prototype.coordinate;r("ol.interaction.Translate",Pu);r("ol.geom.Circle",st);st.prototype.clone=st.prototype.clone;st.prototype.getCenter=st.prototype.qd;st.prototype.getRadius=st.prototype.vf;st.prototype.getType=st.prototype.X;st.prototype.intersectsExtent=st.prototype.La;st.prototype.setCenter=st.prototype.em;st.prototype.setCenterAndRadius=st.prototype.Uf;st.prototype.setRadius=st.prototype.fm;
st.prototype.transform=st.prototype.lb;r("ol.geom.Geometry",Qc);Qc.prototype.getClosestPoint=Qc.prototype.yb;Qc.prototype.intersectsCoordinate=Qc.prototype.jb;Qc.prototype.getExtent=Qc.prototype.C;Qc.prototype.rotate=Qc.prototype.rotate;Qc.prototype.scale=Qc.prototype.scale;Qc.prototype.simplify=Qc.prototype.Fb;Qc.prototype.transform=Qc.prototype.lb;r("ol.geom.GeometryCollection",qn);qn.prototype.clone=qn.prototype.clone;qn.prototype.getGeometries=qn.prototype.df;qn.prototype.getType=qn.prototype.X;
qn.prototype.intersectsExtent=qn.prototype.La;qn.prototype.setGeometries=qn.prototype.ei;qn.prototype.applyTransform=qn.prototype.rc;qn.prototype.translate=qn.prototype.Qc;r("ol.geom.LinearRing",jd);jd.prototype.clone=jd.prototype.clone;jd.prototype.getArea=jd.prototype.im;jd.prototype.getCoordinates=jd.prototype.Z;jd.prototype.getType=jd.prototype.X;jd.prototype.setCoordinates=jd.prototype.sa;r("ol.geom.LineString",P);P.prototype.appendCoordinate=P.prototype.sj;P.prototype.clone=P.prototype.clone;
P.prototype.forEachSegment=P.prototype.Ij;P.prototype.getCoordinateAtM=P.prototype.gm;P.prototype.getCoordinates=P.prototype.Z;P.prototype.getCoordinateAt=P.prototype.zg;P.prototype.getLength=P.prototype.hm;P.prototype.getType=P.prototype.X;P.prototype.intersectsExtent=P.prototype.La;P.prototype.setCoordinates=P.prototype.sa;r("ol.geom.MultiLineString",Q);Q.prototype.appendLineString=Q.prototype.tj;Q.prototype.clone=Q.prototype.clone;Q.prototype.getCoordinateAtM=Q.prototype.jm;
Q.prototype.getCoordinates=Q.prototype.Z;Q.prototype.getLineString=Q.prototype.ck;Q.prototype.getLineStrings=Q.prototype.ld;Q.prototype.getType=Q.prototype.X;Q.prototype.intersectsExtent=Q.prototype.La;Q.prototype.setCoordinates=Q.prototype.sa;r("ol.geom.MultiPoint",R);R.prototype.appendPoint=R.prototype.vj;R.prototype.clone=R.prototype.clone;R.prototype.getCoordinates=R.prototype.Z;R.prototype.getPoint=R.prototype.nk;R.prototype.getPoints=R.prototype.he;R.prototype.getType=R.prototype.X;
R.prototype.intersectsExtent=R.prototype.La;R.prototype.setCoordinates=R.prototype.sa;r("ol.geom.MultiPolygon",S);S.prototype.appendPolygon=S.prototype.wj;S.prototype.clone=S.prototype.clone;S.prototype.getArea=S.prototype.km;S.prototype.getCoordinates=S.prototype.Z;S.prototype.getInteriorPoints=S.prototype.$j;S.prototype.getPolygon=S.prototype.qk;S.prototype.getPolygons=S.prototype.Wd;S.prototype.getType=S.prototype.X;S.prototype.intersectsExtent=S.prototype.La;S.prototype.setCoordinates=S.prototype.sa;
r("ol.geom.Point",C);C.prototype.clone=C.prototype.clone;C.prototype.getCoordinates=C.prototype.Z;C.prototype.getType=C.prototype.X;C.prototype.intersectsExtent=C.prototype.La;C.prototype.setCoordinates=C.prototype.sa;r("ol.geom.Polygon",D);D.prototype.appendLinearRing=D.prototype.uj;D.prototype.clone=D.prototype.clone;D.prototype.getArea=D.prototype.lm;D.prototype.getCoordinates=D.prototype.Z;D.prototype.getInteriorPoint=D.prototype.Zj;D.prototype.getLinearRingCount=D.prototype.dk;
D.prototype.getLinearRing=D.prototype.Fg;D.prototype.getLinearRings=D.prototype.Vd;D.prototype.getType=D.prototype.X;D.prototype.intersectsExtent=D.prototype.La;D.prototype.setCoordinates=D.prototype.sa;r("ol.geom.Polygon.circular",xd);r("ol.geom.Polygon.fromExtent",yd);r("ol.geom.Polygon.fromCircle",zd);r("ol.geom.SimpleGeometry",Sc);Sc.prototype.getFirstCoordinate=Sc.prototype.Nb;Sc.prototype.getLastCoordinate=Sc.prototype.Ob;Sc.prototype.getLayout=Sc.prototype.Pb;Sc.prototype.applyTransform=Sc.prototype.rc;
Sc.prototype.translate=Sc.prototype.Qc;r("ol.format.EsriJSON",jn);jn.prototype.readFeature=jn.prototype.Vb;jn.prototype.readFeatures=jn.prototype.Fa;jn.prototype.readGeometry=jn.prototype.Uc;jn.prototype.readProjection=jn.prototype.Ra;jn.prototype.writeGeometry=jn.prototype.Yc;jn.prototype.writeGeometryObject=jn.prototype.Ie;jn.prototype.writeFeature=jn.prototype.Cd;jn.prototype.writeFeatureObject=jn.prototype.Xc;jn.prototype.writeFeatures=jn.prototype.ac;jn.prototype.writeFeaturesObject=jn.prototype.He;
r("ol.format.Feature",Xm);r("ol.format.GeoJSON",un);un.prototype.readFeature=un.prototype.Vb;un.prototype.readFeatures=un.prototype.Fa;un.prototype.readGeometry=un.prototype.Uc;un.prototype.readProjection=un.prototype.Ra;un.prototype.writeFeature=un.prototype.Cd;un.prototype.writeFeatureObject=un.prototype.Xc;un.prototype.writeFeatures=un.prototype.ac;un.prototype.writeFeaturesObject=un.prototype.He;un.prototype.writeGeometry=un.prototype.Yc;un.prototype.writeGeometryObject=un.prototype.Ie;
r("ol.format.GML",Pn);Pn.prototype.writeFeatures=Pn.prototype.ac;Pn.prototype.writeFeaturesNode=Pn.prototype.a;r("ol.format.GML2",Yn);r("ol.format.GML3",Pn);Pn.prototype.writeGeometryNode=Pn.prototype.s;Pn.prototype.writeFeatures=Pn.prototype.ac;Pn.prototype.writeFeaturesNode=Pn.prototype.a;Cn.prototype.readFeatures=Cn.prototype.Fa;r("ol.format.GPX",Zn);Zn.prototype.readFeature=Zn.prototype.Vb;Zn.prototype.readFeatures=Zn.prototype.Fa;Zn.prototype.readProjection=Zn.prototype.Ra;
Zn.prototype.writeFeatures=Zn.prototype.ac;Zn.prototype.writeFeaturesNode=Zn.prototype.a;r("ol.format.IGC",Jo);Jo.prototype.readFeature=Jo.prototype.Vb;Jo.prototype.readFeatures=Jo.prototype.Fa;Jo.prototype.readProjection=Jo.prototype.Ra;r("ol.format.KML",So);So.prototype.readFeature=So.prototype.Vb;So.prototype.readFeatures=So.prototype.Fa;So.prototype.readName=So.prototype.Co;So.prototype.readNetworkLinks=So.prototype.Do;So.prototype.readProjection=So.prototype.Ra;So.prototype.writeFeatures=So.prototype.ac;
So.prototype.writeFeaturesNode=So.prototype.a;r("ol.format.MVT",Sq);Sq.prototype.readFeatures=Sq.prototype.Fa;Sq.prototype.readProjection=Sq.prototype.Ra;Sq.prototype.setLayers=Sq.prototype.c;r("ol.format.OSMXML",qr);qr.prototype.readFeatures=qr.prototype.Fa;qr.prototype.readProjection=qr.prototype.Ra;r("ol.format.Polyline",Pr);r("ol.format.Polyline.encodeDeltas",Qr);r("ol.format.Polyline.decodeDeltas",Sr);r("ol.format.Polyline.encodeFloats",Rr);r("ol.format.Polyline.decodeFloats",Tr);
Pr.prototype.readFeature=Pr.prototype.Vb;Pr.prototype.readFeatures=Pr.prototype.Fa;Pr.prototype.readGeometry=Pr.prototype.Uc;Pr.prototype.readProjection=Pr.prototype.Ra;Pr.prototype.writeGeometry=Pr.prototype.Yc;r("ol.format.TopoJSON",Ur);Ur.prototype.readFeatures=Ur.prototype.Fa;Ur.prototype.readProjection=Ur.prototype.Ra;r("ol.format.WFS",$r);$r.prototype.readFeatures=$r.prototype.Fa;$r.prototype.readTransactionResponse=$r.prototype.j;$r.prototype.readFeatureCollectionMetadata=$r.prototype.l;
$r.prototype.writeGetFeature=$r.prototype.o;$r.prototype.writeTransaction=$r.prototype.U;$r.prototype.readProjection=$r.prototype.Ra;r("ol.format.WKT",qs);qs.prototype.readFeature=qs.prototype.Vb;qs.prototype.readFeatures=qs.prototype.Fa;qs.prototype.readGeometry=qs.prototype.Uc;qs.prototype.writeFeature=qs.prototype.Cd;qs.prototype.writeFeatures=qs.prototype.ac;qs.prototype.writeGeometry=qs.prototype.Yc;r("ol.format.WMSCapabilities",Hs);Hs.prototype.read=Hs.prototype.read;
r("ol.format.WMSGetFeatureInfo",dt);dt.prototype.readFeatures=dt.prototype.Fa;r("ol.format.WMTSCapabilities",et);et.prototype.read=et.prototype.read;r("ol.format.ogc.filter.And",Xq);r("ol.format.ogc.filter.Bbox",Yq);r("ol.format.ogc.filter.Comparison",Zq);r("ol.format.ogc.filter.ComparisonBinary",$q);r("ol.format.ogc.filter.EqualTo",ar);r("ol.format.ogc.filter.Filter",Uq);r("ol.format.ogc.filter.GreaterThan",br);r("ol.format.ogc.filter.GreaterThanOrEqualTo",cr);r("ol.format.ogc.filter.and",or);
r("ol.format.ogc.filter.or",function(a,b){return new mr(a,b)});r("ol.format.ogc.filter.not",function(a){return new kr(a)});r("ol.format.ogc.filter.bbox",pr);r("ol.format.ogc.filter.intersects",function(a,b,c){return new er(a,b,c)});r("ol.format.ogc.filter.within",function(a,b,c){return new nr(a,b,c)});r("ol.format.ogc.filter.equalTo",function(a,b,c){return new ar(a,b,c)});r("ol.format.ogc.filter.notEqualTo",function(a,b,c){return new lr(a,b,c)});
r("ol.format.ogc.filter.lessThan",function(a,b){return new ir(a,b)});r("ol.format.ogc.filter.lessThanOrEqualTo",function(a,b){return new jr(a,b)});r("ol.format.ogc.filter.greaterThan",function(a,b){return new br(a,b)});r("ol.format.ogc.filter.greaterThanOrEqualTo",function(a,b){return new cr(a,b)});r("ol.format.ogc.filter.isNull",function(a){return new hr(a)});r("ol.format.ogc.filter.between",function(a,b,c){return new fr(a,b,c)});
r("ol.format.ogc.filter.like",function(a,b,c,d,e,f){return new gr(a,b,c,d,e,f)});r("ol.format.ogc.filter.Intersects",er);r("ol.format.ogc.filter.IsBetween",fr);r("ol.format.ogc.filter.IsLike",gr);r("ol.format.ogc.filter.IsNull",hr);r("ol.format.ogc.filter.LessThan",ir);r("ol.format.ogc.filter.LessThanOrEqualTo",jr);r("ol.format.ogc.filter.Not",kr);r("ol.format.ogc.filter.NotEqualTo",lr);r("ol.format.ogc.filter.Or",mr);r("ol.format.ogc.filter.Spatial",dr);r("ol.format.ogc.filter.Within",nr);
r("ol.events.condition.altKeyOnly",function(a){a=a.originalEvent;return a.altKey&&!(a.metaKey||a.ctrlKey)&&!a.shiftKey});r("ol.events.condition.altShiftKeysOnly",Hh);r("ol.events.condition.always",nc);r("ol.events.condition.click",function(a){return a.type==Gg});r("ol.events.condition.never",oc);r("ol.events.condition.pointerMove",Jh);r("ol.events.condition.singleClick",Kh);r("ol.events.condition.doubleClick",function(a){return a.type==Hg});r("ol.events.condition.noModifierKeys",Lh);
r("ol.events.condition.platformModifierKeyOnly",function(a){a=a.originalEvent;return!a.altKey&&(Jf?a.metaKey:a.ctrlKey)&&!a.shiftKey});r("ol.events.condition.shiftKeyOnly",Mh);r("ol.events.condition.targetNotEditable",Nh);r("ol.events.condition.mouseOnly",Oh);r("ol.events.condition.primaryAction",Ph);Pa.prototype.type=Pa.prototype.type;Pa.prototype.target=Pa.prototype.target;Pa.prototype.preventDefault=Pa.prototype.preventDefault;Pa.prototype.stopPropagation=Pa.prototype.stopPropagation;
r("ol.control.Attribution",kf);r("ol.control.Attribution.render",lf);kf.prototype.getCollapsible=kf.prototype.Vl;kf.prototype.setCollapsible=kf.prototype.Yl;kf.prototype.setCollapsed=kf.prototype.Xl;kf.prototype.getCollapsed=kf.prototype.Ul;r("ol.control.Control",jf);jf.prototype.getMap=jf.prototype.i;jf.prototype.setMap=jf.prototype.setMap;jf.prototype.setTarget=jf.prototype.c;r("ol.control.FullScreen",nf);r("ol.control.defaults",wf);r("ol.control.MousePosition",xf);
r("ol.control.MousePosition.render",yf);xf.prototype.getCoordinateFormat=xf.prototype.Ag;xf.prototype.getProjection=xf.prototype.eh;xf.prototype.setCoordinateFormat=xf.prototype.bi;xf.prototype.setProjection=xf.prototype.fh;r("ol.control.OverviewMap",em);r("ol.control.OverviewMap.render",fm);em.prototype.getCollapsible=em.prototype.am;em.prototype.setCollapsible=em.prototype.dm;em.prototype.setCollapsed=em.prototype.cm;em.prototype.getCollapsed=em.prototype.$l;em.prototype.getOverviewMap=em.prototype.lk;
r("ol.control.Rotate",sf);r("ol.control.Rotate.render",uf);r("ol.control.ScaleLine",jm);jm.prototype.getUnits=jm.prototype.Ab;r("ol.control.ScaleLine.render",km);jm.prototype.setUnits=jm.prototype.D;r("ol.control.Zoom",vf);r("ol.control.ZoomSlider",tm);r("ol.control.ZoomSlider.render",vm);r("ol.control.ZoomToExtent",ym);Xa.prototype.changed=Xa.prototype.u;Xa.prototype.dispatchEvent=Xa.prototype.b;Xa.prototype.getRevision=Xa.prototype.K;Xa.prototype.on=Xa.prototype.I;Xa.prototype.once=Xa.prototype.L;
Xa.prototype.un=Xa.prototype.J;Xa.prototype.unByKey=Xa.prototype.M;re.prototype.get=re.prototype.get;re.prototype.getKeys=re.prototype.P;re.prototype.getProperties=re.prototype.N;re.prototype.set=re.prototype.set;re.prototype.setProperties=re.prototype.G;re.prototype.unset=re.prototype.S;re.prototype.changed=re.prototype.u;re.prototype.dispatchEvent=re.prototype.b;re.prototype.getRevision=re.prototype.K;re.prototype.on=re.prototype.I;re.prototype.once=re.prototype.L;re.prototype.un=re.prototype.J;
re.prototype.unByKey=re.prototype.M;te.prototype.type=te.prototype.type;te.prototype.target=te.prototype.target;te.prototype.preventDefault=te.prototype.preventDefault;te.prototype.stopPropagation=te.prototype.stopPropagation;zm.prototype.get=zm.prototype.get;zm.prototype.getKeys=zm.prototype.P;zm.prototype.getProperties=zm.prototype.N;zm.prototype.set=zm.prototype.set;zm.prototype.setProperties=zm.prototype.G;zm.prototype.unset=zm.prototype.S;zm.prototype.changed=zm.prototype.u;
zm.prototype.dispatchEvent=zm.prototype.b;zm.prototype.getRevision=zm.prototype.K;zm.prototype.on=zm.prototype.I;zm.prototype.once=zm.prototype.L;zm.prototype.un=zm.prototype.J;zm.prototype.unByKey=zm.prototype.M;Am.prototype.get=Am.prototype.get;Am.prototype.getKeys=Am.prototype.P;Am.prototype.getProperties=Am.prototype.N;Am.prototype.set=Am.prototype.set;Am.prototype.setProperties=Am.prototype.G;Am.prototype.unset=Am.prototype.S;Am.prototype.changed=Am.prototype.u;Am.prototype.dispatchEvent=Am.prototype.b;
Am.prototype.getRevision=Am.prototype.K;Am.prototype.on=Am.prototype.I;Am.prototype.once=Am.prototype.L;Am.prototype.un=Am.prototype.J;Am.prototype.unByKey=Am.prototype.M;rt.prototype.get=rt.prototype.get;rt.prototype.getKeys=rt.prototype.P;rt.prototype.getProperties=rt.prototype.N;rt.prototype.set=rt.prototype.set;rt.prototype.setProperties=rt.prototype.G;rt.prototype.unset=rt.prototype.S;rt.prototype.changed=rt.prototype.u;rt.prototype.dispatchEvent=rt.prototype.b;rt.prototype.getRevision=rt.prototype.K;
rt.prototype.on=rt.prototype.I;rt.prototype.once=rt.prototype.L;rt.prototype.un=rt.prototype.J;rt.prototype.unByKey=rt.prototype.M;Dt.prototype.getTileCoord=Dt.prototype.i;I.prototype.get=I.prototype.get;I.prototype.getKeys=I.prototype.P;I.prototype.getProperties=I.prototype.N;I.prototype.set=I.prototype.set;I.prototype.setProperties=I.prototype.G;I.prototype.unset=I.prototype.S;I.prototype.changed=I.prototype.u;I.prototype.dispatchEvent=I.prototype.b;I.prototype.getRevision=I.prototype.K;
I.prototype.on=I.prototype.I;I.prototype.once=I.prototype.L;I.prototype.un=I.prototype.J;I.prototype.unByKey=I.prototype.M;hf.prototype.type=hf.prototype.type;hf.prototype.target=hf.prototype.target;hf.prototype.preventDefault=hf.prototype.preventDefault;hf.prototype.stopPropagation=hf.prototype.stopPropagation;Cg.prototype.map=Cg.prototype.map;Cg.prototype.frameState=Cg.prototype.frameState;Cg.prototype.type=Cg.prototype.type;Cg.prototype.target=Cg.prototype.target;Cg.prototype.preventDefault=Cg.prototype.preventDefault;
Cg.prototype.stopPropagation=Cg.prototype.stopPropagation;Dg.prototype.originalEvent=Dg.prototype.originalEvent;Dg.prototype.pixel=Dg.prototype.pixel;Dg.prototype.coordinate=Dg.prototype.coordinate;Dg.prototype.dragging=Dg.prototype.dragging;Dg.prototype.preventDefault=Dg.prototype.preventDefault;Dg.prototype.stopPropagation=Dg.prototype.stopPropagation;Dg.prototype.map=Dg.prototype.map;Dg.prototype.frameState=Dg.prototype.frameState;Dg.prototype.type=Dg.prototype.type;Dg.prototype.target=Dg.prototype.target;
Wa.prototype.type=Wa.prototype.type;Wa.prototype.target=Wa.prototype.target;Wa.prototype.preventDefault=Wa.prototype.preventDefault;Wa.prototype.stopPropagation=Wa.prototype.stopPropagation;am.prototype.get=am.prototype.get;am.prototype.getKeys=am.prototype.P;am.prototype.getProperties=am.prototype.N;am.prototype.set=am.prototype.set;am.prototype.setProperties=am.prototype.G;am.prototype.unset=am.prototype.S;am.prototype.changed=am.prototype.u;am.prototype.dispatchEvent=am.prototype.b;
am.prototype.getRevision=am.prototype.K;am.prototype.on=am.prototype.I;am.prototype.once=am.prototype.L;am.prototype.un=am.prototype.J;am.prototype.unByKey=am.prototype.M;cw.prototype.getTileCoord=cw.prototype.i;Bd.prototype.get=Bd.prototype.get;Bd.prototype.getKeys=Bd.prototype.P;Bd.prototype.getProperties=Bd.prototype.N;Bd.prototype.set=Bd.prototype.set;Bd.prototype.setProperties=Bd.prototype.G;Bd.prototype.unset=Bd.prototype.S;Bd.prototype.changed=Bd.prototype.u;Bd.prototype.dispatchEvent=Bd.prototype.b;
Bd.prototype.getRevision=Bd.prototype.K;Bd.prototype.on=Bd.prototype.I;Bd.prototype.once=Bd.prototype.L;Bd.prototype.un=Bd.prototype.J;Bd.prototype.unByKey=Bd.prototype.M;fw.prototype.forEachTileCoord=fw.prototype.wg;fw.prototype.getMaxZoom=fw.prototype.Gg;fw.prototype.getMinZoom=fw.prototype.Hg;fw.prototype.getOrigin=fw.prototype.Ka;fw.prototype.getResolution=fw.prototype.$;fw.prototype.getResolutions=fw.prototype.Hh;fw.prototype.getTileCoordExtent=fw.prototype.Ea;
fw.prototype.getTileCoordForCoordAndResolution=fw.prototype.Yd;fw.prototype.getTileCoordForCoordAndZ=fw.prototype.pd;fw.prototype.getTileSize=fw.prototype.Qa;fw.prototype.getZForResolution=fw.prototype.ec;Qi.prototype.getOpacity=Qi.prototype.oe;Qi.prototype.getRotateWithView=Qi.prototype.pe;Qi.prototype.getRotation=Qi.prototype.qe;Qi.prototype.getScale=Qi.prototype.re;Qi.prototype.getSnapToPixel=Qi.prototype.Xd;Qi.prototype.setOpacity=Qi.prototype.se;Qi.prototype.setRotation=Qi.prototype.te;
Qi.prototype.setScale=Qi.prototype.ue;Qo.prototype.getOpacity=Qo.prototype.oe;Qo.prototype.getRotateWithView=Qo.prototype.pe;Qo.prototype.getRotation=Qo.prototype.qe;Qo.prototype.getScale=Qo.prototype.re;Qo.prototype.getSnapToPixel=Qo.prototype.Xd;Qo.prototype.setOpacity=Qo.prototype.se;Qo.prototype.setRotation=Qo.prototype.te;Qo.prototype.setScale=Qo.prototype.ue;ow.prototype.getOpacity=ow.prototype.oe;ow.prototype.getRotateWithView=ow.prototype.pe;ow.prototype.getRotation=ow.prototype.qe;
ow.prototype.getScale=ow.prototype.re;ow.prototype.getSnapToPixel=ow.prototype.Xd;ow.prototype.setOpacity=ow.prototype.se;ow.prototype.setRotation=ow.prototype.te;ow.prototype.setScale=ow.prototype.ue;Tg.prototype.get=Tg.prototype.get;Tg.prototype.getKeys=Tg.prototype.P;Tg.prototype.getProperties=Tg.prototype.N;Tg.prototype.set=Tg.prototype.set;Tg.prototype.setProperties=Tg.prototype.G;Tg.prototype.unset=Tg.prototype.S;Tg.prototype.changed=Tg.prototype.u;Tg.prototype.dispatchEvent=Tg.prototype.b;
Tg.prototype.getRevision=Tg.prototype.K;Tg.prototype.on=Tg.prototype.I;Tg.prototype.once=Tg.prototype.L;Tg.prototype.un=Tg.prototype.J;Tg.prototype.unByKey=Tg.prototype.M;ev.prototype.getAttributions=ev.prototype.xa;ev.prototype.getLogo=ev.prototype.wa;ev.prototype.getProjection=ev.prototype.ya;ev.prototype.getState=ev.prototype.V;ev.prototype.refresh=ev.prototype.va;ev.prototype.setAttributions=ev.prototype.ra;ev.prototype.get=ev.prototype.get;ev.prototype.getKeys=ev.prototype.P;
ev.prototype.getProperties=ev.prototype.N;ev.prototype.set=ev.prototype.set;ev.prototype.setProperties=ev.prototype.G;ev.prototype.unset=ev.prototype.S;ev.prototype.changed=ev.prototype.u;ev.prototype.dispatchEvent=ev.prototype.b;ev.prototype.getRevision=ev.prototype.K;ev.prototype.on=ev.prototype.I;ev.prototype.once=ev.prototype.L;ev.prototype.un=ev.prototype.J;ev.prototype.unByKey=ev.prototype.M;iv.prototype.getTileGrid=iv.prototype.Pa;iv.prototype.refresh=iv.prototype.va;
iv.prototype.getAttributions=iv.prototype.xa;iv.prototype.getLogo=iv.prototype.wa;iv.prototype.getProjection=iv.prototype.ya;iv.prototype.getState=iv.prototype.V;iv.prototype.setAttributions=iv.prototype.ra;iv.prototype.get=iv.prototype.get;iv.prototype.getKeys=iv.prototype.P;iv.prototype.getProperties=iv.prototype.N;iv.prototype.set=iv.prototype.set;iv.prototype.setProperties=iv.prototype.G;iv.prototype.unset=iv.prototype.S;iv.prototype.changed=iv.prototype.u;iv.prototype.dispatchEvent=iv.prototype.b;
iv.prototype.getRevision=iv.prototype.K;iv.prototype.on=iv.prototype.I;iv.prototype.once=iv.prototype.L;iv.prototype.un=iv.prototype.J;iv.prototype.unByKey=iv.prototype.M;W.prototype.getTileLoadFunction=W.prototype.gb;W.prototype.getTileUrlFunction=W.prototype.hb;W.prototype.getUrls=W.prototype.ib;W.prototype.setTileLoadFunction=W.prototype.mb;W.prototype.setTileUrlFunction=W.prototype.Ta;W.prototype.setUrl=W.prototype.Za;W.prototype.setUrls=W.prototype.Ua;W.prototype.getTileGrid=W.prototype.Pa;
W.prototype.refresh=W.prototype.va;W.prototype.getAttributions=W.prototype.xa;W.prototype.getLogo=W.prototype.wa;W.prototype.getProjection=W.prototype.ya;W.prototype.getState=W.prototype.V;W.prototype.setAttributions=W.prototype.ra;W.prototype.get=W.prototype.get;W.prototype.getKeys=W.prototype.P;W.prototype.getProperties=W.prototype.N;W.prototype.set=W.prototype.set;W.prototype.setProperties=W.prototype.G;W.prototype.unset=W.prototype.S;W.prototype.changed=W.prototype.u;
W.prototype.dispatchEvent=W.prototype.b;W.prototype.getRevision=W.prototype.K;W.prototype.on=W.prototype.I;W.prototype.once=W.prototype.L;W.prototype.un=W.prototype.J;W.prototype.unByKey=W.prototype.M;mv.prototype.setRenderReprojectionEdges=mv.prototype.Db;mv.prototype.setTileGridForProjection=mv.prototype.Eb;mv.prototype.getTileLoadFunction=mv.prototype.gb;mv.prototype.getTileUrlFunction=mv.prototype.hb;mv.prototype.getUrls=mv.prototype.ib;mv.prototype.setTileLoadFunction=mv.prototype.mb;
mv.prototype.setTileUrlFunction=mv.prototype.Ta;mv.prototype.setUrl=mv.prototype.Za;mv.prototype.setUrls=mv.prototype.Ua;mv.prototype.getTileGrid=mv.prototype.Pa;mv.prototype.refresh=mv.prototype.va;mv.prototype.getAttributions=mv.prototype.xa;mv.prototype.getLogo=mv.prototype.wa;mv.prototype.getProjection=mv.prototype.ya;mv.prototype.getState=mv.prototype.V;mv.prototype.setAttributions=mv.prototype.ra;mv.prototype.get=mv.prototype.get;mv.prototype.getKeys=mv.prototype.P;
mv.prototype.getProperties=mv.prototype.N;mv.prototype.set=mv.prototype.set;mv.prototype.setProperties=mv.prototype.G;mv.prototype.unset=mv.prototype.S;mv.prototype.changed=mv.prototype.u;mv.prototype.dispatchEvent=mv.prototype.b;mv.prototype.getRevision=mv.prototype.K;mv.prototype.on=mv.prototype.I;mv.prototype.once=mv.prototype.L;mv.prototype.un=mv.prototype.J;mv.prototype.unByKey=mv.prototype.M;ov.prototype.setRenderReprojectionEdges=ov.prototype.Db;ov.prototype.setTileGridForProjection=ov.prototype.Eb;
ov.prototype.getTileLoadFunction=ov.prototype.gb;ov.prototype.getTileUrlFunction=ov.prototype.hb;ov.prototype.getUrls=ov.prototype.ib;ov.prototype.setTileLoadFunction=ov.prototype.mb;ov.prototype.setTileUrlFunction=ov.prototype.Ta;ov.prototype.setUrl=ov.prototype.Za;ov.prototype.setUrls=ov.prototype.Ua;ov.prototype.getTileGrid=ov.prototype.Pa;ov.prototype.refresh=ov.prototype.va;ov.prototype.getAttributions=ov.prototype.xa;ov.prototype.getLogo=ov.prototype.wa;ov.prototype.getProjection=ov.prototype.ya;
ov.prototype.getState=ov.prototype.V;ov.prototype.setAttributions=ov.prototype.ra;ov.prototype.get=ov.prototype.get;ov.prototype.getKeys=ov.prototype.P;ov.prototype.getProperties=ov.prototype.N;ov.prototype.set=ov.prototype.set;ov.prototype.setProperties=ov.prototype.G;ov.prototype.unset=ov.prototype.S;ov.prototype.changed=ov.prototype.u;ov.prototype.dispatchEvent=ov.prototype.b;ov.prototype.getRevision=ov.prototype.K;ov.prototype.on=ov.prototype.I;ov.prototype.once=ov.prototype.L;
ov.prototype.un=ov.prototype.J;ov.prototype.unByKey=ov.prototype.M;pv.prototype.setRenderReprojectionEdges=pv.prototype.Db;pv.prototype.setTileGridForProjection=pv.prototype.Eb;pv.prototype.getTileLoadFunction=pv.prototype.gb;pv.prototype.getTileUrlFunction=pv.prototype.hb;pv.prototype.getUrls=pv.prototype.ib;pv.prototype.setTileLoadFunction=pv.prototype.mb;pv.prototype.setTileUrlFunction=pv.prototype.Ta;pv.prototype.setUrl=pv.prototype.Za;pv.prototype.setUrls=pv.prototype.Ua;
pv.prototype.getTileGrid=pv.prototype.Pa;pv.prototype.refresh=pv.prototype.va;pv.prototype.getAttributions=pv.prototype.xa;pv.prototype.getLogo=pv.prototype.wa;pv.prototype.getProjection=pv.prototype.ya;pv.prototype.getState=pv.prototype.V;pv.prototype.setAttributions=pv.prototype.ra;pv.prototype.get=pv.prototype.get;pv.prototype.getKeys=pv.prototype.P;pv.prototype.getProperties=pv.prototype.N;pv.prototype.set=pv.prototype.set;pv.prototype.setProperties=pv.prototype.G;pv.prototype.unset=pv.prototype.S;
pv.prototype.changed=pv.prototype.u;pv.prototype.dispatchEvent=pv.prototype.b;pv.prototype.getRevision=pv.prototype.K;pv.prototype.on=pv.prototype.I;pv.prototype.once=pv.prototype.L;pv.prototype.un=pv.prototype.J;pv.prototype.unByKey=pv.prototype.M;U.prototype.getAttributions=U.prototype.xa;U.prototype.getLogo=U.prototype.wa;U.prototype.getProjection=U.prototype.ya;U.prototype.getState=U.prototype.V;U.prototype.refresh=U.prototype.va;U.prototype.setAttributions=U.prototype.ra;U.prototype.get=U.prototype.get;
U.prototype.getKeys=U.prototype.P;U.prototype.getProperties=U.prototype.N;U.prototype.set=U.prototype.set;U.prototype.setProperties=U.prototype.G;U.prototype.unset=U.prototype.S;U.prototype.changed=U.prototype.u;U.prototype.dispatchEvent=U.prototype.b;U.prototype.getRevision=U.prototype.K;U.prototype.on=U.prototype.I;U.prototype.once=U.prototype.L;U.prototype.un=U.prototype.J;U.prototype.unByKey=U.prototype.M;Y.prototype.addFeature=Y.prototype.ub;Y.prototype.addFeatures=Y.prototype.Hc;
Y.prototype.clear=Y.prototype.clear;Y.prototype.forEachFeature=Y.prototype.ug;Y.prototype.forEachFeatureInExtent=Y.prototype.xb;Y.prototype.forEachFeatureIntersectingExtent=Y.prototype.vg;Y.prototype.getFeaturesCollection=Y.prototype.Dg;Y.prototype.getFeatures=Y.prototype.me;Y.prototype.getFeaturesAtCoordinate=Y.prototype.Cg;Y.prototype.getFeaturesInExtent=Y.prototype.cf;Y.prototype.getClosestFeatureToCoordinate=Y.prototype.yg;Y.prototype.getExtent=Y.prototype.C;Y.prototype.getFeatureById=Y.prototype.Bg;
Y.prototype.getFormat=Y.prototype.zh;Y.prototype.getUrl=Y.prototype.Ah;Y.prototype.removeFeature=Y.prototype.pb;Y.prototype.getAttributions=Y.prototype.xa;Y.prototype.getLogo=Y.prototype.wa;Y.prototype.getProjection=Y.prototype.ya;Y.prototype.getState=Y.prototype.V;Y.prototype.refresh=Y.prototype.va;Y.prototype.setAttributions=Y.prototype.ra;Y.prototype.get=Y.prototype.get;Y.prototype.getKeys=Y.prototype.P;Y.prototype.getProperties=Y.prototype.N;Y.prototype.set=Y.prototype.set;
Y.prototype.setProperties=Y.prototype.G;Y.prototype.unset=Y.prototype.S;Y.prototype.changed=Y.prototype.u;Y.prototype.dispatchEvent=Y.prototype.b;Y.prototype.getRevision=Y.prototype.K;Y.prototype.on=Y.prototype.I;Y.prototype.once=Y.prototype.L;Y.prototype.un=Y.prototype.J;Y.prototype.unByKey=Y.prototype.M;tk.prototype.getAttributions=tk.prototype.xa;tk.prototype.getLogo=tk.prototype.wa;tk.prototype.getProjection=tk.prototype.ya;tk.prototype.getState=tk.prototype.V;tk.prototype.refresh=tk.prototype.va;
tk.prototype.setAttributions=tk.prototype.ra;tk.prototype.get=tk.prototype.get;tk.prototype.getKeys=tk.prototype.P;tk.prototype.getProperties=tk.prototype.N;tk.prototype.set=tk.prototype.set;tk.prototype.setProperties=tk.prototype.G;tk.prototype.unset=tk.prototype.S;tk.prototype.changed=tk.prototype.u;tk.prototype.dispatchEvent=tk.prototype.b;tk.prototype.getRevision=tk.prototype.K;tk.prototype.on=tk.prototype.I;tk.prototype.once=tk.prototype.L;tk.prototype.un=tk.prototype.J;
tk.prototype.unByKey=tk.prototype.M;vk.prototype.type=vk.prototype.type;vk.prototype.target=vk.prototype.target;vk.prototype.preventDefault=vk.prototype.preventDefault;vk.prototype.stopPropagation=vk.prototype.stopPropagation;vv.prototype.getAttributions=vv.prototype.xa;vv.prototype.getLogo=vv.prototype.wa;vv.prototype.getProjection=vv.prototype.ya;vv.prototype.getState=vv.prototype.V;vv.prototype.refresh=vv.prototype.va;vv.prototype.setAttributions=vv.prototype.ra;vv.prototype.get=vv.prototype.get;
vv.prototype.getKeys=vv.prototype.P;vv.prototype.getProperties=vv.prototype.N;vv.prototype.set=vv.prototype.set;vv.prototype.setProperties=vv.prototype.G;vv.prototype.unset=vv.prototype.S;vv.prototype.changed=vv.prototype.u;vv.prototype.dispatchEvent=vv.prototype.b;vv.prototype.getRevision=vv.prototype.K;vv.prototype.on=vv.prototype.I;vv.prototype.once=vv.prototype.L;vv.prototype.un=vv.prototype.J;vv.prototype.unByKey=vv.prototype.M;Ak.prototype.getAttributions=Ak.prototype.xa;
Ak.prototype.getLogo=Ak.prototype.wa;Ak.prototype.getProjection=Ak.prototype.ya;Ak.prototype.getState=Ak.prototype.V;Ak.prototype.refresh=Ak.prototype.va;Ak.prototype.setAttributions=Ak.prototype.ra;Ak.prototype.get=Ak.prototype.get;Ak.prototype.getKeys=Ak.prototype.P;Ak.prototype.getProperties=Ak.prototype.N;Ak.prototype.set=Ak.prototype.set;Ak.prototype.setProperties=Ak.prototype.G;Ak.prototype.unset=Ak.prototype.S;Ak.prototype.changed=Ak.prototype.u;Ak.prototype.dispatchEvent=Ak.prototype.b;
Ak.prototype.getRevision=Ak.prototype.K;Ak.prototype.on=Ak.prototype.I;Ak.prototype.once=Ak.prototype.L;Ak.prototype.un=Ak.prototype.J;Ak.prototype.unByKey=Ak.prototype.M;wv.prototype.getAttributions=wv.prototype.xa;wv.prototype.getLogo=wv.prototype.wa;wv.prototype.getProjection=wv.prototype.ya;wv.prototype.getState=wv.prototype.V;wv.prototype.refresh=wv.prototype.va;wv.prototype.setAttributions=wv.prototype.ra;wv.prototype.get=wv.prototype.get;wv.prototype.getKeys=wv.prototype.P;
wv.prototype.getProperties=wv.prototype.N;wv.prototype.set=wv.prototype.set;wv.prototype.setProperties=wv.prototype.G;wv.prototype.unset=wv.prototype.S;wv.prototype.changed=wv.prototype.u;wv.prototype.dispatchEvent=wv.prototype.b;wv.prototype.getRevision=wv.prototype.K;wv.prototype.on=wv.prototype.I;wv.prototype.once=wv.prototype.L;wv.prototype.un=wv.prototype.J;wv.prototype.unByKey=wv.prototype.M;xv.prototype.getAttributions=xv.prototype.xa;xv.prototype.getLogo=xv.prototype.wa;
xv.prototype.getProjection=xv.prototype.ya;xv.prototype.getState=xv.prototype.V;xv.prototype.refresh=xv.prototype.va;xv.prototype.setAttributions=xv.prototype.ra;xv.prototype.get=xv.prototype.get;xv.prototype.getKeys=xv.prototype.P;xv.prototype.getProperties=xv.prototype.N;xv.prototype.set=xv.prototype.set;xv.prototype.setProperties=xv.prototype.G;xv.prototype.unset=xv.prototype.S;xv.prototype.changed=xv.prototype.u;xv.prototype.dispatchEvent=xv.prototype.b;xv.prototype.getRevision=xv.prototype.K;
xv.prototype.on=xv.prototype.I;xv.prototype.once=xv.prototype.L;xv.prototype.un=xv.prototype.J;xv.prototype.unByKey=xv.prototype.M;Bk.prototype.getAttributions=Bk.prototype.xa;Bk.prototype.getLogo=Bk.prototype.wa;Bk.prototype.getProjection=Bk.prototype.ya;Bk.prototype.getState=Bk.prototype.V;Bk.prototype.refresh=Bk.prototype.va;Bk.prototype.setAttributions=Bk.prototype.ra;Bk.prototype.get=Bk.prototype.get;Bk.prototype.getKeys=Bk.prototype.P;Bk.prototype.getProperties=Bk.prototype.N;
Bk.prototype.set=Bk.prototype.set;Bk.prototype.setProperties=Bk.prototype.G;Bk.prototype.unset=Bk.prototype.S;Bk.prototype.changed=Bk.prototype.u;Bk.prototype.dispatchEvent=Bk.prototype.b;Bk.prototype.getRevision=Bk.prototype.K;Bk.prototype.on=Bk.prototype.I;Bk.prototype.once=Bk.prototype.L;Bk.prototype.un=Bk.prototype.J;Bk.prototype.unByKey=Bk.prototype.M;yv.prototype.getAttributions=yv.prototype.xa;yv.prototype.getLogo=yv.prototype.wa;yv.prototype.getProjection=yv.prototype.ya;
yv.prototype.getState=yv.prototype.V;yv.prototype.refresh=yv.prototype.va;yv.prototype.setAttributions=yv.prototype.ra;yv.prototype.get=yv.prototype.get;yv.prototype.getKeys=yv.prototype.P;yv.prototype.getProperties=yv.prototype.N;yv.prototype.set=yv.prototype.set;yv.prototype.setProperties=yv.prototype.G;yv.prototype.unset=yv.prototype.S;yv.prototype.changed=yv.prototype.u;yv.prototype.dispatchEvent=yv.prototype.b;yv.prototype.getRevision=yv.prototype.K;yv.prototype.on=yv.prototype.I;
yv.prototype.once=yv.prototype.L;yv.prototype.un=yv.prototype.J;yv.prototype.unByKey=yv.prototype.M;Cv.prototype.setRenderReprojectionEdges=Cv.prototype.Db;Cv.prototype.setTileGridForProjection=Cv.prototype.Eb;Cv.prototype.getTileLoadFunction=Cv.prototype.gb;Cv.prototype.getTileUrlFunction=Cv.prototype.hb;Cv.prototype.getUrls=Cv.prototype.ib;Cv.prototype.setTileLoadFunction=Cv.prototype.mb;Cv.prototype.setTileUrlFunction=Cv.prototype.Ta;Cv.prototype.setUrl=Cv.prototype.Za;Cv.prototype.setUrls=Cv.prototype.Ua;
Cv.prototype.getTileGrid=Cv.prototype.Pa;Cv.prototype.refresh=Cv.prototype.va;Cv.prototype.getAttributions=Cv.prototype.xa;Cv.prototype.getLogo=Cv.prototype.wa;Cv.prototype.getProjection=Cv.prototype.ya;Cv.prototype.getState=Cv.prototype.V;Cv.prototype.setAttributions=Cv.prototype.ra;Cv.prototype.get=Cv.prototype.get;Cv.prototype.getKeys=Cv.prototype.P;Cv.prototype.getProperties=Cv.prototype.N;Cv.prototype.set=Cv.prototype.set;Cv.prototype.setProperties=Cv.prototype.G;Cv.prototype.unset=Cv.prototype.S;
Cv.prototype.changed=Cv.prototype.u;Cv.prototype.dispatchEvent=Cv.prototype.b;Cv.prototype.getRevision=Cv.prototype.K;Cv.prototype.on=Cv.prototype.I;Cv.prototype.once=Cv.prototype.L;Cv.prototype.un=Cv.prototype.J;Cv.prototype.unByKey=Cv.prototype.M;Ev.prototype.getAttributions=Ev.prototype.xa;Ev.prototype.getLogo=Ev.prototype.wa;Ev.prototype.getProjection=Ev.prototype.ya;Ev.prototype.getState=Ev.prototype.V;Ev.prototype.refresh=Ev.prototype.va;Ev.prototype.setAttributions=Ev.prototype.ra;
Ev.prototype.get=Ev.prototype.get;Ev.prototype.getKeys=Ev.prototype.P;Ev.prototype.getProperties=Ev.prototype.N;Ev.prototype.set=Ev.prototype.set;Ev.prototype.setProperties=Ev.prototype.G;Ev.prototype.unset=Ev.prototype.S;Ev.prototype.changed=Ev.prototype.u;Ev.prototype.dispatchEvent=Ev.prototype.b;Ev.prototype.getRevision=Ev.prototype.K;Ev.prototype.on=Ev.prototype.I;Ev.prototype.once=Ev.prototype.L;Ev.prototype.un=Ev.prototype.J;Ev.prototype.unByKey=Ev.prototype.M;Jv.prototype.type=Jv.prototype.type;
Jv.prototype.target=Jv.prototype.target;Jv.prototype.preventDefault=Jv.prototype.preventDefault;Jv.prototype.stopPropagation=Jv.prototype.stopPropagation;Ov.prototype.setRenderReprojectionEdges=Ov.prototype.Db;Ov.prototype.setTileGridForProjection=Ov.prototype.Eb;Ov.prototype.getTileLoadFunction=Ov.prototype.gb;Ov.prototype.getTileUrlFunction=Ov.prototype.hb;Ov.prototype.getUrls=Ov.prototype.ib;Ov.prototype.setTileLoadFunction=Ov.prototype.mb;Ov.prototype.setTileUrlFunction=Ov.prototype.Ta;
Ov.prototype.setUrl=Ov.prototype.Za;Ov.prototype.setUrls=Ov.prototype.Ua;Ov.prototype.getTileGrid=Ov.prototype.Pa;Ov.prototype.refresh=Ov.prototype.va;Ov.prototype.getAttributions=Ov.prototype.xa;Ov.prototype.getLogo=Ov.prototype.wa;Ov.prototype.getProjection=Ov.prototype.ya;Ov.prototype.getState=Ov.prototype.V;Ov.prototype.setAttributions=Ov.prototype.ra;Ov.prototype.get=Ov.prototype.get;Ov.prototype.getKeys=Ov.prototype.P;Ov.prototype.getProperties=Ov.prototype.N;Ov.prototype.set=Ov.prototype.set;
Ov.prototype.setProperties=Ov.prototype.G;Ov.prototype.unset=Ov.prototype.S;Ov.prototype.changed=Ov.prototype.u;Ov.prototype.dispatchEvent=Ov.prototype.b;Ov.prototype.getRevision=Ov.prototype.K;Ov.prototype.on=Ov.prototype.I;Ov.prototype.once=Ov.prototype.L;Ov.prototype.un=Ov.prototype.J;Ov.prototype.unByKey=Ov.prototype.M;hv.prototype.type=hv.prototype.type;hv.prototype.target=hv.prototype.target;hv.prototype.preventDefault=hv.prototype.preventDefault;hv.prototype.stopPropagation=hv.prototype.stopPropagation;
Qv.prototype.setRenderReprojectionEdges=Qv.prototype.Db;Qv.prototype.setTileGridForProjection=Qv.prototype.Eb;Qv.prototype.getTileLoadFunction=Qv.prototype.gb;Qv.prototype.getTileUrlFunction=Qv.prototype.hb;Qv.prototype.getUrls=Qv.prototype.ib;Qv.prototype.setTileLoadFunction=Qv.prototype.mb;Qv.prototype.setTileUrlFunction=Qv.prototype.Ta;Qv.prototype.setUrl=Qv.prototype.Za;Qv.prototype.setUrls=Qv.prototype.Ua;Qv.prototype.getTileGrid=Qv.prototype.Pa;Qv.prototype.refresh=Qv.prototype.va;
Qv.prototype.getAttributions=Qv.prototype.xa;Qv.prototype.getLogo=Qv.prototype.wa;Qv.prototype.getProjection=Qv.prototype.ya;Qv.prototype.getState=Qv.prototype.V;Qv.prototype.setAttributions=Qv.prototype.ra;Qv.prototype.get=Qv.prototype.get;Qv.prototype.getKeys=Qv.prototype.P;Qv.prototype.getProperties=Qv.prototype.N;Qv.prototype.set=Qv.prototype.set;Qv.prototype.setProperties=Qv.prototype.G;Qv.prototype.unset=Qv.prototype.S;Qv.prototype.changed=Qv.prototype.u;Qv.prototype.dispatchEvent=Qv.prototype.b;
Qv.prototype.getRevision=Qv.prototype.K;Qv.prototype.on=Qv.prototype.I;Qv.prototype.once=Qv.prototype.L;Qv.prototype.un=Qv.prototype.J;Qv.prototype.unByKey=Qv.prototype.M;Sv.prototype.getTileGrid=Sv.prototype.Pa;Sv.prototype.refresh=Sv.prototype.va;Sv.prototype.getAttributions=Sv.prototype.xa;Sv.prototype.getLogo=Sv.prototype.wa;Sv.prototype.getProjection=Sv.prototype.ya;Sv.prototype.getState=Sv.prototype.V;Sv.prototype.setAttributions=Sv.prototype.ra;Sv.prototype.get=Sv.prototype.get;
Sv.prototype.getKeys=Sv.prototype.P;Sv.prototype.getProperties=Sv.prototype.N;Sv.prototype.set=Sv.prototype.set;Sv.prototype.setProperties=Sv.prototype.G;Sv.prototype.unset=Sv.prototype.S;Sv.prototype.changed=Sv.prototype.u;Sv.prototype.dispatchEvent=Sv.prototype.b;Sv.prototype.getRevision=Sv.prototype.K;Sv.prototype.on=Sv.prototype.I;Sv.prototype.once=Sv.prototype.L;Sv.prototype.un=Sv.prototype.J;Sv.prototype.unByKey=Sv.prototype.M;Tv.prototype.setRenderReprojectionEdges=Tv.prototype.Db;
Tv.prototype.setTileGridForProjection=Tv.prototype.Eb;Tv.prototype.getTileLoadFunction=Tv.prototype.gb;Tv.prototype.getTileUrlFunction=Tv.prototype.hb;Tv.prototype.getUrls=Tv.prototype.ib;Tv.prototype.setTileLoadFunction=Tv.prototype.mb;Tv.prototype.setTileUrlFunction=Tv.prototype.Ta;Tv.prototype.setUrl=Tv.prototype.Za;Tv.prototype.setUrls=Tv.prototype.Ua;Tv.prototype.getTileGrid=Tv.prototype.Pa;Tv.prototype.refresh=Tv.prototype.va;Tv.prototype.getAttributions=Tv.prototype.xa;
Tv.prototype.getLogo=Tv.prototype.wa;Tv.prototype.getProjection=Tv.prototype.ya;Tv.prototype.getState=Tv.prototype.V;Tv.prototype.setAttributions=Tv.prototype.ra;Tv.prototype.get=Tv.prototype.get;Tv.prototype.getKeys=Tv.prototype.P;Tv.prototype.getProperties=Tv.prototype.N;Tv.prototype.set=Tv.prototype.set;Tv.prototype.setProperties=Tv.prototype.G;Tv.prototype.unset=Tv.prototype.S;Tv.prototype.changed=Tv.prototype.u;Tv.prototype.dispatchEvent=Tv.prototype.b;Tv.prototype.getRevision=Tv.prototype.K;
Tv.prototype.on=Tv.prototype.I;Tv.prototype.once=Tv.prototype.L;Tv.prototype.un=Tv.prototype.J;Tv.prototype.unByKey=Tv.prototype.M;Uv.prototype.getTileGrid=Uv.prototype.Pa;Uv.prototype.refresh=Uv.prototype.va;Uv.prototype.getAttributions=Uv.prototype.xa;Uv.prototype.getLogo=Uv.prototype.wa;Uv.prototype.getProjection=Uv.prototype.ya;Uv.prototype.getState=Uv.prototype.V;Uv.prototype.setAttributions=Uv.prototype.ra;Uv.prototype.get=Uv.prototype.get;Uv.prototype.getKeys=Uv.prototype.P;
Uv.prototype.getProperties=Uv.prototype.N;Uv.prototype.set=Uv.prototype.set;Uv.prototype.setProperties=Uv.prototype.G;Uv.prototype.unset=Uv.prototype.S;Uv.prototype.changed=Uv.prototype.u;Uv.prototype.dispatchEvent=Uv.prototype.b;Uv.prototype.getRevision=Uv.prototype.K;Uv.prototype.on=Uv.prototype.I;Uv.prototype.once=Uv.prototype.L;Uv.prototype.un=Uv.prototype.J;Uv.prototype.unByKey=Uv.prototype.M;Yv.prototype.setRenderReprojectionEdges=Yv.prototype.Db;Yv.prototype.setTileGridForProjection=Yv.prototype.Eb;
Yv.prototype.getTileLoadFunction=Yv.prototype.gb;Yv.prototype.getTileUrlFunction=Yv.prototype.hb;Yv.prototype.getUrls=Yv.prototype.ib;Yv.prototype.setTileLoadFunction=Yv.prototype.mb;Yv.prototype.setTileUrlFunction=Yv.prototype.Ta;Yv.prototype.setUrl=Yv.prototype.Za;Yv.prototype.setUrls=Yv.prototype.Ua;Yv.prototype.getTileGrid=Yv.prototype.Pa;Yv.prototype.refresh=Yv.prototype.va;Yv.prototype.getAttributions=Yv.prototype.xa;Yv.prototype.getLogo=Yv.prototype.wa;Yv.prototype.getProjection=Yv.prototype.ya;
Yv.prototype.getState=Yv.prototype.V;Yv.prototype.setAttributions=Yv.prototype.ra;Yv.prototype.get=Yv.prototype.get;Yv.prototype.getKeys=Yv.prototype.P;Yv.prototype.getProperties=Yv.prototype.N;Yv.prototype.set=Yv.prototype.set;Yv.prototype.setProperties=Yv.prototype.G;Yv.prototype.unset=Yv.prototype.S;Yv.prototype.changed=Yv.prototype.u;Yv.prototype.dispatchEvent=Yv.prototype.b;Yv.prototype.getRevision=Yv.prototype.K;Yv.prototype.on=Yv.prototype.I;Yv.prototype.once=Yv.prototype.L;
Yv.prototype.un=Yv.prototype.J;Yv.prototype.unByKey=Yv.prototype.M;Zt.prototype.type=Zt.prototype.type;Zt.prototype.target=Zt.prototype.target;Zt.prototype.preventDefault=Zt.prototype.preventDefault;Zt.prototype.stopPropagation=Zt.prototype.stopPropagation;dw.prototype.getTileLoadFunction=dw.prototype.gb;dw.prototype.getTileUrlFunction=dw.prototype.hb;dw.prototype.getUrls=dw.prototype.ib;dw.prototype.setTileLoadFunction=dw.prototype.mb;dw.prototype.setTileUrlFunction=dw.prototype.Ta;
dw.prototype.setUrl=dw.prototype.Za;dw.prototype.setUrls=dw.prototype.Ua;dw.prototype.getTileGrid=dw.prototype.Pa;dw.prototype.refresh=dw.prototype.va;dw.prototype.getAttributions=dw.prototype.xa;dw.prototype.getLogo=dw.prototype.wa;dw.prototype.getProjection=dw.prototype.ya;dw.prototype.getState=dw.prototype.V;dw.prototype.setAttributions=dw.prototype.ra;dw.prototype.get=dw.prototype.get;dw.prototype.getKeys=dw.prototype.P;dw.prototype.getProperties=dw.prototype.N;dw.prototype.set=dw.prototype.set;
dw.prototype.setProperties=dw.prototype.G;dw.prototype.unset=dw.prototype.S;dw.prototype.changed=dw.prototype.u;dw.prototype.dispatchEvent=dw.prototype.b;dw.prototype.getRevision=dw.prototype.K;dw.prototype.on=dw.prototype.I;dw.prototype.once=dw.prototype.L;dw.prototype.un=dw.prototype.J;dw.prototype.unByKey=dw.prototype.M;Z.prototype.setRenderReprojectionEdges=Z.prototype.Db;Z.prototype.setTileGridForProjection=Z.prototype.Eb;Z.prototype.getTileLoadFunction=Z.prototype.gb;
Z.prototype.getTileUrlFunction=Z.prototype.hb;Z.prototype.getUrls=Z.prototype.ib;Z.prototype.setTileLoadFunction=Z.prototype.mb;Z.prototype.setTileUrlFunction=Z.prototype.Ta;Z.prototype.setUrl=Z.prototype.Za;Z.prototype.setUrls=Z.prototype.Ua;Z.prototype.getTileGrid=Z.prototype.Pa;Z.prototype.refresh=Z.prototype.va;Z.prototype.getAttributions=Z.prototype.xa;Z.prototype.getLogo=Z.prototype.wa;Z.prototype.getProjection=Z.prototype.ya;Z.prototype.getState=Z.prototype.V;Z.prototype.setAttributions=Z.prototype.ra;
Z.prototype.get=Z.prototype.get;Z.prototype.getKeys=Z.prototype.P;Z.prototype.getProperties=Z.prototype.N;Z.prototype.set=Z.prototype.set;Z.prototype.setProperties=Z.prototype.G;Z.prototype.unset=Z.prototype.S;Z.prototype.changed=Z.prototype.u;Z.prototype.dispatchEvent=Z.prototype.b;Z.prototype.getRevision=Z.prototype.K;Z.prototype.on=Z.prototype.I;Z.prototype.once=Z.prototype.L;Z.prototype.un=Z.prototype.J;Z.prototype.unByKey=Z.prototype.M;iw.prototype.setRenderReprojectionEdges=iw.prototype.Db;
iw.prototype.setTileGridForProjection=iw.prototype.Eb;iw.prototype.getTileLoadFunction=iw.prototype.gb;iw.prototype.getTileUrlFunction=iw.prototype.hb;iw.prototype.getUrls=iw.prototype.ib;iw.prototype.setTileLoadFunction=iw.prototype.mb;iw.prototype.setTileUrlFunction=iw.prototype.Ta;iw.prototype.setUrl=iw.prototype.Za;iw.prototype.setUrls=iw.prototype.Ua;iw.prototype.getTileGrid=iw.prototype.Pa;iw.prototype.refresh=iw.prototype.va;iw.prototype.getAttributions=iw.prototype.xa;
iw.prototype.getLogo=iw.prototype.wa;iw.prototype.getProjection=iw.prototype.ya;iw.prototype.getState=iw.prototype.V;iw.prototype.setAttributions=iw.prototype.ra;iw.prototype.get=iw.prototype.get;iw.prototype.getKeys=iw.prototype.P;iw.prototype.getProperties=iw.prototype.N;iw.prototype.set=iw.prototype.set;iw.prototype.setProperties=iw.prototype.G;iw.prototype.unset=iw.prototype.S;iw.prototype.changed=iw.prototype.u;iw.prototype.dispatchEvent=iw.prototype.b;iw.prototype.getRevision=iw.prototype.K;
iw.prototype.on=iw.prototype.I;iw.prototype.once=iw.prototype.L;iw.prototype.un=iw.prototype.J;iw.prototype.unByKey=iw.prototype.M;Xu.prototype.getTileCoord=Xu.prototype.i;Xu.prototype.load=Xu.prototype.load;tj.prototype.changed=tj.prototype.u;tj.prototype.dispatchEvent=tj.prototype.b;tj.prototype.getRevision=tj.prototype.K;tj.prototype.on=tj.prototype.I;tj.prototype.once=tj.prototype.L;tj.prototype.un=tj.prototype.J;tj.prototype.unByKey=tj.prototype.M;Hl.prototype.changed=Hl.prototype.u;
Hl.prototype.dispatchEvent=Hl.prototype.b;Hl.prototype.getRevision=Hl.prototype.K;Hl.prototype.on=Hl.prototype.I;Hl.prototype.once=Hl.prototype.L;Hl.prototype.un=Hl.prototype.J;Hl.prototype.unByKey=Hl.prototype.M;Kl.prototype.changed=Kl.prototype.u;Kl.prototype.dispatchEvent=Kl.prototype.b;Kl.prototype.getRevision=Kl.prototype.K;Kl.prototype.on=Kl.prototype.I;Kl.prototype.once=Kl.prototype.L;Kl.prototype.un=Kl.prototype.J;Kl.prototype.unByKey=Kl.prototype.M;Sl.prototype.changed=Sl.prototype.u;
Sl.prototype.dispatchEvent=Sl.prototype.b;Sl.prototype.getRevision=Sl.prototype.K;Sl.prototype.on=Sl.prototype.I;Sl.prototype.once=Sl.prototype.L;Sl.prototype.un=Sl.prototype.J;Sl.prototype.unByKey=Sl.prototype.M;Ul.prototype.changed=Ul.prototype.u;Ul.prototype.dispatchEvent=Ul.prototype.b;Ul.prototype.getRevision=Ul.prototype.K;Ul.prototype.on=Ul.prototype.I;Ul.prototype.once=Ul.prototype.L;Ul.prototype.un=Ul.prototype.J;Ul.prototype.unByKey=Ul.prototype.M;Nk.prototype.changed=Nk.prototype.u;
Nk.prototype.dispatchEvent=Nk.prototype.b;Nk.prototype.getRevision=Nk.prototype.K;Nk.prototype.on=Nk.prototype.I;Nk.prototype.once=Nk.prototype.L;Nk.prototype.un=Nk.prototype.J;Nk.prototype.unByKey=Nk.prototype.M;Ok.prototype.changed=Ok.prototype.u;Ok.prototype.dispatchEvent=Ok.prototype.b;Ok.prototype.getRevision=Ok.prototype.K;Ok.prototype.on=Ok.prototype.I;Ok.prototype.once=Ok.prototype.L;Ok.prototype.un=Ok.prototype.J;Ok.prototype.unByKey=Ok.prototype.M;Pk.prototype.changed=Pk.prototype.u;
Pk.prototype.dispatchEvent=Pk.prototype.b;Pk.prototype.getRevision=Pk.prototype.K;Pk.prototype.on=Pk.prototype.I;Pk.prototype.once=Pk.prototype.L;Pk.prototype.un=Pk.prototype.J;Pk.prototype.unByKey=Pk.prototype.M;Rk.prototype.changed=Rk.prototype.u;Rk.prototype.dispatchEvent=Rk.prototype.b;Rk.prototype.getRevision=Rk.prototype.K;Rk.prototype.on=Rk.prototype.I;Rk.prototype.once=Rk.prototype.L;Rk.prototype.un=Rk.prototype.J;Rk.prototype.unByKey=Rk.prototype.M;Dj.prototype.changed=Dj.prototype.u;
Dj.prototype.dispatchEvent=Dj.prototype.b;Dj.prototype.getRevision=Dj.prototype.K;Dj.prototype.on=Dj.prototype.I;Dj.prototype.once=Dj.prototype.L;Dj.prototype.un=Dj.prototype.J;Dj.prototype.unByKey=Dj.prototype.M;Dk.prototype.changed=Dk.prototype.u;Dk.prototype.dispatchEvent=Dk.prototype.b;Dk.prototype.getRevision=Dk.prototype.K;Dk.prototype.on=Dk.prototype.I;Dk.prototype.once=Dk.prototype.L;Dk.prototype.un=Dk.prototype.J;Dk.prototype.unByKey=Dk.prototype.M;Ek.prototype.changed=Ek.prototype.u;
Ek.prototype.dispatchEvent=Ek.prototype.b;Ek.prototype.getRevision=Ek.prototype.K;Ek.prototype.on=Ek.prototype.I;Ek.prototype.once=Ek.prototype.L;Ek.prototype.un=Ek.prototype.J;Ek.prototype.unByKey=Ek.prototype.M;Gk.prototype.changed=Gk.prototype.u;Gk.prototype.dispatchEvent=Gk.prototype.b;Gk.prototype.getRevision=Gk.prototype.K;Gk.prototype.on=Gk.prototype.I;Gk.prototype.once=Gk.prototype.L;Gk.prototype.un=Gk.prototype.J;Gk.prototype.unByKey=Gk.prototype.M;Jk.prototype.changed=Jk.prototype.u;
Jk.prototype.dispatchEvent=Jk.prototype.b;Jk.prototype.getRevision=Jk.prototype.K;Jk.prototype.on=Jk.prototype.I;Jk.prototype.once=Jk.prototype.L;Jk.prototype.un=Jk.prototype.J;Jk.prototype.unByKey=Jk.prototype.M;Sg.prototype.type=Sg.prototype.type;Sg.prototype.target=Sg.prototype.target;Sg.prototype.preventDefault=Sg.prototype.preventDefault;Sg.prototype.stopPropagation=Sg.prototype.stopPropagation;jg.prototype.type=jg.prototype.type;jg.prototype.target=jg.prototype.target;
jg.prototype.preventDefault=jg.prototype.preventDefault;jg.prototype.stopPropagation=jg.prototype.stopPropagation;Qg.prototype.get=Qg.prototype.get;Qg.prototype.getKeys=Qg.prototype.P;Qg.prototype.getProperties=Qg.prototype.N;Qg.prototype.set=Qg.prototype.set;Qg.prototype.setProperties=Qg.prototype.G;Qg.prototype.unset=Qg.prototype.S;Qg.prototype.changed=Qg.prototype.u;Qg.prototype.dispatchEvent=Qg.prototype.b;Qg.prototype.getRevision=Qg.prototype.K;Qg.prototype.on=Qg.prototype.I;
Qg.prototype.once=Qg.prototype.L;Qg.prototype.un=Qg.prototype.J;Qg.prototype.unByKey=Qg.prototype.M;zi.prototype.getExtent=zi.prototype.C;zi.prototype.getMaxResolution=zi.prototype.Rb;zi.prototype.getMinResolution=zi.prototype.Sb;zi.prototype.getOpacity=zi.prototype.Tb;zi.prototype.getVisible=zi.prototype.Bb;zi.prototype.getZIndex=zi.prototype.Ub;zi.prototype.setExtent=zi.prototype.ic;zi.prototype.setMaxResolution=zi.prototype.oc;zi.prototype.setMinResolution=zi.prototype.pc;
zi.prototype.setOpacity=zi.prototype.jc;zi.prototype.setVisible=zi.prototype.kc;zi.prototype.setZIndex=zi.prototype.lc;zi.prototype.get=zi.prototype.get;zi.prototype.getKeys=zi.prototype.P;zi.prototype.getProperties=zi.prototype.N;zi.prototype.set=zi.prototype.set;zi.prototype.setProperties=zi.prototype.G;zi.prototype.unset=zi.prototype.S;zi.prototype.changed=zi.prototype.u;zi.prototype.dispatchEvent=zi.prototype.b;zi.prototype.getRevision=zi.prototype.K;zi.prototype.on=zi.prototype.I;
zi.prototype.once=zi.prototype.L;zi.prototype.un=zi.prototype.J;zi.prototype.unByKey=zi.prototype.M;Wg.prototype.getExtent=Wg.prototype.C;Wg.prototype.getMaxResolution=Wg.prototype.Rb;Wg.prototype.getMinResolution=Wg.prototype.Sb;Wg.prototype.getOpacity=Wg.prototype.Tb;Wg.prototype.getVisible=Wg.prototype.Bb;Wg.prototype.getZIndex=Wg.prototype.Ub;Wg.prototype.setExtent=Wg.prototype.ic;Wg.prototype.setMaxResolution=Wg.prototype.oc;Wg.prototype.setMinResolution=Wg.prototype.pc;
Wg.prototype.setOpacity=Wg.prototype.jc;Wg.prototype.setVisible=Wg.prototype.kc;Wg.prototype.setZIndex=Wg.prototype.lc;Wg.prototype.get=Wg.prototype.get;Wg.prototype.getKeys=Wg.prototype.P;Wg.prototype.getProperties=Wg.prototype.N;Wg.prototype.set=Wg.prototype.set;Wg.prototype.setProperties=Wg.prototype.G;Wg.prototype.unset=Wg.prototype.S;Wg.prototype.changed=Wg.prototype.u;Wg.prototype.dispatchEvent=Wg.prototype.b;Wg.prototype.getRevision=Wg.prototype.K;Wg.prototype.on=Wg.prototype.I;
Wg.prototype.once=Wg.prototype.L;Wg.prototype.un=Wg.prototype.J;Wg.prototype.unByKey=Wg.prototype.M;F.prototype.setMap=F.prototype.setMap;F.prototype.setSource=F.prototype.Dc;F.prototype.getExtent=F.prototype.C;F.prototype.getMaxResolution=F.prototype.Rb;F.prototype.getMinResolution=F.prototype.Sb;F.prototype.getOpacity=F.prototype.Tb;F.prototype.getVisible=F.prototype.Bb;F.prototype.getZIndex=F.prototype.Ub;F.prototype.setExtent=F.prototype.ic;F.prototype.setMaxResolution=F.prototype.oc;
F.prototype.setMinResolution=F.prototype.pc;F.prototype.setOpacity=F.prototype.jc;F.prototype.setVisible=F.prototype.kc;F.prototype.setZIndex=F.prototype.lc;F.prototype.get=F.prototype.get;F.prototype.getKeys=F.prototype.P;F.prototype.getProperties=F.prototype.N;F.prototype.set=F.prototype.set;F.prototype.setProperties=F.prototype.G;F.prototype.unset=F.prototype.S;F.prototype.changed=F.prototype.u;F.prototype.dispatchEvent=F.prototype.b;F.prototype.getRevision=F.prototype.K;F.prototype.on=F.prototype.I;
F.prototype.once=F.prototype.L;F.prototype.un=F.prototype.J;F.prototype.unByKey=F.prototype.M;V.prototype.getSource=V.prototype.ga;V.prototype.getStyle=V.prototype.H;V.prototype.getStyleFunction=V.prototype.D;V.prototype.setStyle=V.prototype.l;V.prototype.setMap=V.prototype.setMap;V.prototype.setSource=V.prototype.Dc;V.prototype.getExtent=V.prototype.C;V.prototype.getMaxResolution=V.prototype.Rb;V.prototype.getMinResolution=V.prototype.Sb;V.prototype.getOpacity=V.prototype.Tb;
V.prototype.getVisible=V.prototype.Bb;V.prototype.getZIndex=V.prototype.Ub;V.prototype.setExtent=V.prototype.ic;V.prototype.setMaxResolution=V.prototype.oc;V.prototype.setMinResolution=V.prototype.pc;V.prototype.setOpacity=V.prototype.jc;V.prototype.setVisible=V.prototype.kc;V.prototype.setZIndex=V.prototype.lc;V.prototype.get=V.prototype.get;V.prototype.getKeys=V.prototype.P;V.prototype.getProperties=V.prototype.N;V.prototype.set=V.prototype.set;V.prototype.setProperties=V.prototype.G;
V.prototype.unset=V.prototype.S;V.prototype.changed=V.prototype.u;V.prototype.dispatchEvent=V.prototype.b;V.prototype.getRevision=V.prototype.K;V.prototype.on=V.prototype.I;V.prototype.once=V.prototype.L;V.prototype.un=V.prototype.J;V.prototype.unByKey=V.prototype.M;Ji.prototype.setMap=Ji.prototype.setMap;Ji.prototype.setSource=Ji.prototype.Dc;Ji.prototype.getExtent=Ji.prototype.C;Ji.prototype.getMaxResolution=Ji.prototype.Rb;Ji.prototype.getMinResolution=Ji.prototype.Sb;Ji.prototype.getOpacity=Ji.prototype.Tb;
Ji.prototype.getVisible=Ji.prototype.Bb;Ji.prototype.getZIndex=Ji.prototype.Ub;Ji.prototype.setExtent=Ji.prototype.ic;Ji.prototype.setMaxResolution=Ji.prototype.oc;Ji.prototype.setMinResolution=Ji.prototype.pc;Ji.prototype.setOpacity=Ji.prototype.jc;Ji.prototype.setVisible=Ji.prototype.kc;Ji.prototype.setZIndex=Ji.prototype.lc;Ji.prototype.get=Ji.prototype.get;Ji.prototype.getKeys=Ji.prototype.P;Ji.prototype.getProperties=Ji.prototype.N;Ji.prototype.set=Ji.prototype.set;
Ji.prototype.setProperties=Ji.prototype.G;Ji.prototype.unset=Ji.prototype.S;Ji.prototype.changed=Ji.prototype.u;Ji.prototype.dispatchEvent=Ji.prototype.b;Ji.prototype.getRevision=Ji.prototype.K;Ji.prototype.on=Ji.prototype.I;Ji.prototype.once=Ji.prototype.L;Ji.prototype.un=Ji.prototype.J;Ji.prototype.unByKey=Ji.prototype.M;Ki.prototype.setMap=Ki.prototype.setMap;Ki.prototype.setSource=Ki.prototype.Dc;Ki.prototype.getExtent=Ki.prototype.C;Ki.prototype.getMaxResolution=Ki.prototype.Rb;
Ki.prototype.getMinResolution=Ki.prototype.Sb;Ki.prototype.getOpacity=Ki.prototype.Tb;Ki.prototype.getVisible=Ki.prototype.Bb;Ki.prototype.getZIndex=Ki.prototype.Ub;Ki.prototype.setExtent=Ki.prototype.ic;Ki.prototype.setMaxResolution=Ki.prototype.oc;Ki.prototype.setMinResolution=Ki.prototype.pc;Ki.prototype.setOpacity=Ki.prototype.jc;Ki.prototype.setVisible=Ki.prototype.kc;Ki.prototype.setZIndex=Ki.prototype.lc;Ki.prototype.get=Ki.prototype.get;Ki.prototype.getKeys=Ki.prototype.P;
Ki.prototype.getProperties=Ki.prototype.N;Ki.prototype.set=Ki.prototype.set;Ki.prototype.setProperties=Ki.prototype.G;Ki.prototype.unset=Ki.prototype.S;Ki.prototype.changed=Ki.prototype.u;Ki.prototype.dispatchEvent=Ki.prototype.b;Ki.prototype.getRevision=Ki.prototype.K;Ki.prototype.on=Ki.prototype.I;Ki.prototype.once=Ki.prototype.L;Ki.prototype.un=Ki.prototype.J;Ki.prototype.unByKey=Ki.prototype.M;H.prototype.getSource=H.prototype.ga;H.prototype.getStyle=H.prototype.H;
H.prototype.getStyleFunction=H.prototype.D;H.prototype.setStyle=H.prototype.l;H.prototype.setMap=H.prototype.setMap;H.prototype.setSource=H.prototype.Dc;H.prototype.getExtent=H.prototype.C;H.prototype.getMaxResolution=H.prototype.Rb;H.prototype.getMinResolution=H.prototype.Sb;H.prototype.getOpacity=H.prototype.Tb;H.prototype.getVisible=H.prototype.Bb;H.prototype.getZIndex=H.prototype.Ub;H.prototype.setExtent=H.prototype.ic;H.prototype.setMaxResolution=H.prototype.oc;H.prototype.setMinResolution=H.prototype.pc;
H.prototype.setOpacity=H.prototype.jc;H.prototype.setVisible=H.prototype.kc;H.prototype.setZIndex=H.prototype.lc;H.prototype.get=H.prototype.get;H.prototype.getKeys=H.prototype.P;H.prototype.getProperties=H.prototype.N;H.prototype.set=H.prototype.set;H.prototype.setProperties=H.prototype.G;H.prototype.unset=H.prototype.S;H.prototype.changed=H.prototype.u;H.prototype.dispatchEvent=H.prototype.b;H.prototype.getRevision=H.prototype.K;H.prototype.on=H.prototype.I;H.prototype.once=H.prototype.L;
H.prototype.un=H.prototype.J;H.prototype.unByKey=H.prototype.M;Bh.prototype.get=Bh.prototype.get;Bh.prototype.getKeys=Bh.prototype.P;Bh.prototype.getProperties=Bh.prototype.N;Bh.prototype.set=Bh.prototype.set;Bh.prototype.setProperties=Bh.prototype.G;Bh.prototype.unset=Bh.prototype.S;Bh.prototype.changed=Bh.prototype.u;Bh.prototype.dispatchEvent=Bh.prototype.b;Bh.prototype.getRevision=Bh.prototype.K;Bh.prototype.on=Bh.prototype.I;Bh.prototype.once=Bh.prototype.L;Bh.prototype.un=Bh.prototype.J;
Bh.prototype.unByKey=Bh.prototype.M;Fh.prototype.getActive=Fh.prototype.f;Fh.prototype.getMap=Fh.prototype.l;Fh.prototype.setActive=Fh.prototype.i;Fh.prototype.get=Fh.prototype.get;Fh.prototype.getKeys=Fh.prototype.P;Fh.prototype.getProperties=Fh.prototype.N;Fh.prototype.set=Fh.prototype.set;Fh.prototype.setProperties=Fh.prototype.G;Fh.prototype.unset=Fh.prototype.S;Fh.prototype.changed=Fh.prototype.u;Fh.prototype.dispatchEvent=Fh.prototype.b;Fh.prototype.getRevision=Fh.prototype.K;
Fh.prototype.on=Fh.prototype.I;Fh.prototype.once=Fh.prototype.L;Fh.prototype.un=Fh.prototype.J;Fh.prototype.unByKey=Fh.prototype.M;Ft.prototype.getActive=Ft.prototype.f;Ft.prototype.getMap=Ft.prototype.l;Ft.prototype.setActive=Ft.prototype.i;Ft.prototype.get=Ft.prototype.get;Ft.prototype.getKeys=Ft.prototype.P;Ft.prototype.getProperties=Ft.prototype.N;Ft.prototype.set=Ft.prototype.set;Ft.prototype.setProperties=Ft.prototype.G;Ft.prototype.unset=Ft.prototype.S;Ft.prototype.changed=Ft.prototype.u;
Ft.prototype.dispatchEvent=Ft.prototype.b;Ft.prototype.getRevision=Ft.prototype.K;Ft.prototype.on=Ft.prototype.I;Ft.prototype.once=Ft.prototype.L;Ft.prototype.un=Ft.prototype.J;Ft.prototype.unByKey=Ft.prototype.M;It.prototype.type=It.prototype.type;It.prototype.target=It.prototype.target;It.prototype.preventDefault=It.prototype.preventDefault;It.prototype.stopPropagation=It.prototype.stopPropagation;di.prototype.type=di.prototype.type;di.prototype.target=di.prototype.target;
di.prototype.preventDefault=di.prototype.preventDefault;di.prototype.stopPropagation=di.prototype.stopPropagation;Qh.prototype.getActive=Qh.prototype.f;Qh.prototype.getMap=Qh.prototype.l;Qh.prototype.setActive=Qh.prototype.i;Qh.prototype.get=Qh.prototype.get;Qh.prototype.getKeys=Qh.prototype.P;Qh.prototype.getProperties=Qh.prototype.N;Qh.prototype.set=Qh.prototype.set;Qh.prototype.setProperties=Qh.prototype.G;Qh.prototype.unset=Qh.prototype.S;Qh.prototype.changed=Qh.prototype.u;
Qh.prototype.dispatchEvent=Qh.prototype.b;Qh.prototype.getRevision=Qh.prototype.K;Qh.prototype.on=Qh.prototype.I;Qh.prototype.once=Qh.prototype.L;Qh.prototype.un=Qh.prototype.J;Qh.prototype.unByKey=Qh.prototype.M;ei.prototype.getActive=ei.prototype.f;ei.prototype.getMap=ei.prototype.l;ei.prototype.setActive=ei.prototype.i;ei.prototype.get=ei.prototype.get;ei.prototype.getKeys=ei.prototype.P;ei.prototype.getProperties=ei.prototype.N;ei.prototype.set=ei.prototype.set;ei.prototype.setProperties=ei.prototype.G;
ei.prototype.unset=ei.prototype.S;ei.prototype.changed=ei.prototype.u;ei.prototype.dispatchEvent=ei.prototype.b;ei.prototype.getRevision=ei.prototype.K;ei.prototype.on=ei.prototype.I;ei.prototype.once=ei.prototype.L;ei.prototype.un=ei.prototype.J;ei.prototype.unByKey=ei.prototype.M;Th.prototype.getActive=Th.prototype.f;Th.prototype.getMap=Th.prototype.l;Th.prototype.setActive=Th.prototype.i;Th.prototype.get=Th.prototype.get;Th.prototype.getKeys=Th.prototype.P;Th.prototype.getProperties=Th.prototype.N;
Th.prototype.set=Th.prototype.set;Th.prototype.setProperties=Th.prototype.G;Th.prototype.unset=Th.prototype.S;Th.prototype.changed=Th.prototype.u;Th.prototype.dispatchEvent=Th.prototype.b;Th.prototype.getRevision=Th.prototype.K;Th.prototype.on=Th.prototype.I;Th.prototype.once=Th.prototype.L;Th.prototype.un=Th.prototype.J;Th.prototype.unByKey=Th.prototype.M;Xh.prototype.getActive=Xh.prototype.f;Xh.prototype.getMap=Xh.prototype.l;Xh.prototype.setActive=Xh.prototype.i;Xh.prototype.get=Xh.prototype.get;
Xh.prototype.getKeys=Xh.prototype.P;Xh.prototype.getProperties=Xh.prototype.N;Xh.prototype.set=Xh.prototype.set;Xh.prototype.setProperties=Xh.prototype.G;Xh.prototype.unset=Xh.prototype.S;Xh.prototype.changed=Xh.prototype.u;Xh.prototype.dispatchEvent=Xh.prototype.b;Xh.prototype.getRevision=Xh.prototype.K;Xh.prototype.on=Xh.prototype.I;Xh.prototype.once=Xh.prototype.L;Xh.prototype.un=Xh.prototype.J;Xh.prototype.unByKey=Xh.prototype.M;Kt.prototype.getActive=Kt.prototype.f;Kt.prototype.getMap=Kt.prototype.l;
Kt.prototype.setActive=Kt.prototype.i;Kt.prototype.get=Kt.prototype.get;Kt.prototype.getKeys=Kt.prototype.P;Kt.prototype.getProperties=Kt.prototype.N;Kt.prototype.set=Kt.prototype.set;Kt.prototype.setProperties=Kt.prototype.G;Kt.prototype.unset=Kt.prototype.S;Kt.prototype.changed=Kt.prototype.u;Kt.prototype.dispatchEvent=Kt.prototype.b;Kt.prototype.getRevision=Kt.prototype.K;Kt.prototype.on=Kt.prototype.I;Kt.prototype.once=Kt.prototype.L;Kt.prototype.un=Kt.prototype.J;Kt.prototype.unByKey=Kt.prototype.M;
ji.prototype.getGeometry=ji.prototype.Y;ji.prototype.getActive=ji.prototype.f;ji.prototype.getMap=ji.prototype.l;ji.prototype.setActive=ji.prototype.i;ji.prototype.get=ji.prototype.get;ji.prototype.getKeys=ji.prototype.P;ji.prototype.getProperties=ji.prototype.N;ji.prototype.set=ji.prototype.set;ji.prototype.setProperties=ji.prototype.G;ji.prototype.unset=ji.prototype.S;ji.prototype.changed=ji.prototype.u;ji.prototype.dispatchEvent=ji.prototype.b;ji.prototype.getRevision=ji.prototype.K;
ji.prototype.on=ji.prototype.I;ji.prototype.once=ji.prototype.L;ji.prototype.un=ji.prototype.J;ji.prototype.unByKey=ji.prototype.M;bu.prototype.type=bu.prototype.type;bu.prototype.target=bu.prototype.target;bu.prototype.preventDefault=bu.prototype.preventDefault;bu.prototype.stopPropagation=bu.prototype.stopPropagation;cu.prototype.getActive=cu.prototype.f;cu.prototype.getMap=cu.prototype.l;cu.prototype.setActive=cu.prototype.i;cu.prototype.get=cu.prototype.get;cu.prototype.getKeys=cu.prototype.P;
cu.prototype.getProperties=cu.prototype.N;cu.prototype.set=cu.prototype.set;cu.prototype.setProperties=cu.prototype.G;cu.prototype.unset=cu.prototype.S;cu.prototype.changed=cu.prototype.u;cu.prototype.dispatchEvent=cu.prototype.b;cu.prototype.getRevision=cu.prototype.K;cu.prototype.on=cu.prototype.I;cu.prototype.once=cu.prototype.L;cu.prototype.un=cu.prototype.J;cu.prototype.unByKey=cu.prototype.M;ki.prototype.getActive=ki.prototype.f;ki.prototype.getMap=ki.prototype.l;ki.prototype.setActive=ki.prototype.i;
ki.prototype.get=ki.prototype.get;ki.prototype.getKeys=ki.prototype.P;ki.prototype.getProperties=ki.prototype.N;ki.prototype.set=ki.prototype.set;ki.prototype.setProperties=ki.prototype.G;ki.prototype.unset=ki.prototype.S;ki.prototype.changed=ki.prototype.u;ki.prototype.dispatchEvent=ki.prototype.b;ki.prototype.getRevision=ki.prototype.K;ki.prototype.on=ki.prototype.I;ki.prototype.once=ki.prototype.L;ki.prototype.un=ki.prototype.J;ki.prototype.unByKey=ki.prototype.M;mi.prototype.getActive=mi.prototype.f;
mi.prototype.getMap=mi.prototype.l;mi.prototype.setActive=mi.prototype.i;mi.prototype.get=mi.prototype.get;mi.prototype.getKeys=mi.prototype.P;mi.prototype.getProperties=mi.prototype.N;mi.prototype.set=mi.prototype.set;mi.prototype.setProperties=mi.prototype.G;mi.prototype.unset=mi.prototype.S;mi.prototype.changed=mi.prototype.u;mi.prototype.dispatchEvent=mi.prototype.b;mi.prototype.getRevision=mi.prototype.K;mi.prototype.on=mi.prototype.I;mi.prototype.once=mi.prototype.L;mi.prototype.un=mi.prototype.J;
mi.prototype.unByKey=mi.prototype.M;su.prototype.type=su.prototype.type;su.prototype.target=su.prototype.target;su.prototype.preventDefault=su.prototype.preventDefault;su.prototype.stopPropagation=su.prototype.stopPropagation;tu.prototype.getActive=tu.prototype.f;tu.prototype.getMap=tu.prototype.l;tu.prototype.setActive=tu.prototype.i;tu.prototype.get=tu.prototype.get;tu.prototype.getKeys=tu.prototype.P;tu.prototype.getProperties=tu.prototype.N;tu.prototype.set=tu.prototype.set;
tu.prototype.setProperties=tu.prototype.G;tu.prototype.unset=tu.prototype.S;tu.prototype.changed=tu.prototype.u;tu.prototype.dispatchEvent=tu.prototype.b;tu.prototype.getRevision=tu.prototype.K;tu.prototype.on=tu.prototype.I;tu.prototype.once=tu.prototype.L;tu.prototype.un=tu.prototype.J;tu.prototype.unByKey=tu.prototype.M;oi.prototype.getActive=oi.prototype.f;oi.prototype.getMap=oi.prototype.l;oi.prototype.setActive=oi.prototype.i;oi.prototype.get=oi.prototype.get;oi.prototype.getKeys=oi.prototype.P;
oi.prototype.getProperties=oi.prototype.N;oi.prototype.set=oi.prototype.set;oi.prototype.setProperties=oi.prototype.G;oi.prototype.unset=oi.prototype.S;oi.prototype.changed=oi.prototype.u;oi.prototype.dispatchEvent=oi.prototype.b;oi.prototype.getRevision=oi.prototype.K;oi.prototype.on=oi.prototype.I;oi.prototype.once=oi.prototype.L;oi.prototype.un=oi.prototype.J;oi.prototype.unByKey=oi.prototype.M;qi.prototype.getActive=qi.prototype.f;qi.prototype.getMap=qi.prototype.l;qi.prototype.setActive=qi.prototype.i;
qi.prototype.get=qi.prototype.get;qi.prototype.getKeys=qi.prototype.P;qi.prototype.getProperties=qi.prototype.N;qi.prototype.set=qi.prototype.set;qi.prototype.setProperties=qi.prototype.G;qi.prototype.unset=qi.prototype.S;qi.prototype.changed=qi.prototype.u;qi.prototype.dispatchEvent=qi.prototype.b;qi.prototype.getRevision=qi.prototype.K;qi.prototype.on=qi.prototype.I;qi.prototype.once=qi.prototype.L;qi.prototype.un=qi.prototype.J;qi.prototype.unByKey=qi.prototype.M;ui.prototype.getActive=ui.prototype.f;
ui.prototype.getMap=ui.prototype.l;ui.prototype.setActive=ui.prototype.i;ui.prototype.get=ui.prototype.get;ui.prototype.getKeys=ui.prototype.P;ui.prototype.getProperties=ui.prototype.N;ui.prototype.set=ui.prototype.set;ui.prototype.setProperties=ui.prototype.G;ui.prototype.unset=ui.prototype.S;ui.prototype.changed=ui.prototype.u;ui.prototype.dispatchEvent=ui.prototype.b;ui.prototype.getRevision=ui.prototype.K;ui.prototype.on=ui.prototype.I;ui.prototype.once=ui.prototype.L;ui.prototype.un=ui.prototype.J;
ui.prototype.unByKey=ui.prototype.M;Gu.prototype.type=Gu.prototype.type;Gu.prototype.target=Gu.prototype.target;Gu.prototype.preventDefault=Gu.prototype.preventDefault;Gu.prototype.stopPropagation=Gu.prototype.stopPropagation;Hu.prototype.getActive=Hu.prototype.f;Hu.prototype.getMap=Hu.prototype.l;Hu.prototype.setActive=Hu.prototype.i;Hu.prototype.get=Hu.prototype.get;Hu.prototype.getKeys=Hu.prototype.P;Hu.prototype.getProperties=Hu.prototype.N;Hu.prototype.set=Hu.prototype.set;
Hu.prototype.setProperties=Hu.prototype.G;Hu.prototype.unset=Hu.prototype.S;Hu.prototype.changed=Hu.prototype.u;Hu.prototype.dispatchEvent=Hu.prototype.b;Hu.prototype.getRevision=Hu.prototype.K;Hu.prototype.on=Hu.prototype.I;Hu.prototype.once=Hu.prototype.L;Hu.prototype.un=Hu.prototype.J;Hu.prototype.unByKey=Hu.prototype.M;Ku.prototype.getActive=Ku.prototype.f;Ku.prototype.getMap=Ku.prototype.l;Ku.prototype.setActive=Ku.prototype.i;Ku.prototype.get=Ku.prototype.get;Ku.prototype.getKeys=Ku.prototype.P;
Ku.prototype.getProperties=Ku.prototype.N;Ku.prototype.set=Ku.prototype.set;Ku.prototype.setProperties=Ku.prototype.G;Ku.prototype.unset=Ku.prototype.S;Ku.prototype.changed=Ku.prototype.u;Ku.prototype.dispatchEvent=Ku.prototype.b;Ku.prototype.getRevision=Ku.prototype.K;Ku.prototype.on=Ku.prototype.I;Ku.prototype.once=Ku.prototype.L;Ku.prototype.un=Ku.prototype.J;Ku.prototype.unByKey=Ku.prototype.M;Ou.prototype.type=Ou.prototype.type;Ou.prototype.target=Ou.prototype.target;
Ou.prototype.preventDefault=Ou.prototype.preventDefault;Ou.prototype.stopPropagation=Ou.prototype.stopPropagation;Pu.prototype.getActive=Pu.prototype.f;Pu.prototype.getMap=Pu.prototype.l;Pu.prototype.setActive=Pu.prototype.i;Pu.prototype.get=Pu.prototype.get;Pu.prototype.getKeys=Pu.prototype.P;Pu.prototype.getProperties=Pu.prototype.N;Pu.prototype.set=Pu.prototype.set;Pu.prototype.setProperties=Pu.prototype.G;Pu.prototype.unset=Pu.prototype.S;Pu.prototype.changed=Pu.prototype.u;
Pu.prototype.dispatchEvent=Pu.prototype.b;Pu.prototype.getRevision=Pu.prototype.K;Pu.prototype.on=Pu.prototype.I;Pu.prototype.once=Pu.prototype.L;Pu.prototype.un=Pu.prototype.J;Pu.prototype.unByKey=Pu.prototype.M;Qc.prototype.get=Qc.prototype.get;Qc.prototype.getKeys=Qc.prototype.P;Qc.prototype.getProperties=Qc.prototype.N;Qc.prototype.set=Qc.prototype.set;Qc.prototype.setProperties=Qc.prototype.G;Qc.prototype.unset=Qc.prototype.S;Qc.prototype.changed=Qc.prototype.u;Qc.prototype.dispatchEvent=Qc.prototype.b;
Qc.prototype.getRevision=Qc.prototype.K;Qc.prototype.on=Qc.prototype.I;Qc.prototype.once=Qc.prototype.L;Qc.prototype.un=Qc.prototype.J;Qc.prototype.unByKey=Qc.prototype.M;Sc.prototype.getClosestPoint=Sc.prototype.yb;Sc.prototype.intersectsCoordinate=Sc.prototype.jb;Sc.prototype.getExtent=Sc.prototype.C;Sc.prototype.rotate=Sc.prototype.rotate;Sc.prototype.scale=Sc.prototype.scale;Sc.prototype.simplify=Sc.prototype.Fb;Sc.prototype.transform=Sc.prototype.lb;Sc.prototype.get=Sc.prototype.get;
Sc.prototype.getKeys=Sc.prototype.P;Sc.prototype.getProperties=Sc.prototype.N;Sc.prototype.set=Sc.prototype.set;Sc.prototype.setProperties=Sc.prototype.G;Sc.prototype.unset=Sc.prototype.S;Sc.prototype.changed=Sc.prototype.u;Sc.prototype.dispatchEvent=Sc.prototype.b;Sc.prototype.getRevision=Sc.prototype.K;Sc.prototype.on=Sc.prototype.I;Sc.prototype.once=Sc.prototype.L;Sc.prototype.un=Sc.prototype.J;Sc.prototype.unByKey=Sc.prototype.M;st.prototype.getFirstCoordinate=st.prototype.Nb;
st.prototype.getLastCoordinate=st.prototype.Ob;st.prototype.getLayout=st.prototype.Pb;st.prototype.rotate=st.prototype.rotate;st.prototype.scale=st.prototype.scale;st.prototype.getClosestPoint=st.prototype.yb;st.prototype.intersectsCoordinate=st.prototype.jb;st.prototype.getExtent=st.prototype.C;st.prototype.simplify=st.prototype.Fb;st.prototype.get=st.prototype.get;st.prototype.getKeys=st.prototype.P;st.prototype.getProperties=st.prototype.N;st.prototype.set=st.prototype.set;
st.prototype.setProperties=st.prototype.G;st.prototype.unset=st.prototype.S;st.prototype.changed=st.prototype.u;st.prototype.dispatchEvent=st.prototype.b;st.prototype.getRevision=st.prototype.K;st.prototype.on=st.prototype.I;st.prototype.once=st.prototype.L;st.prototype.un=st.prototype.J;st.prototype.unByKey=st.prototype.M;qn.prototype.getClosestPoint=qn.prototype.yb;qn.prototype.intersectsCoordinate=qn.prototype.jb;qn.prototype.getExtent=qn.prototype.C;qn.prototype.rotate=qn.prototype.rotate;
qn.prototype.scale=qn.prototype.scale;qn.prototype.simplify=qn.prototype.Fb;qn.prototype.transform=qn.prototype.lb;qn.prototype.get=qn.prototype.get;qn.prototype.getKeys=qn.prototype.P;qn.prototype.getProperties=qn.prototype.N;qn.prototype.set=qn.prototype.set;qn.prototype.setProperties=qn.prototype.G;qn.prototype.unset=qn.prototype.S;qn.prototype.changed=qn.prototype.u;qn.prototype.dispatchEvent=qn.prototype.b;qn.prototype.getRevision=qn.prototype.K;qn.prototype.on=qn.prototype.I;
qn.prototype.once=qn.prototype.L;qn.prototype.un=qn.prototype.J;qn.prototype.unByKey=qn.prototype.M;jd.prototype.getFirstCoordinate=jd.prototype.Nb;jd.prototype.getLastCoordinate=jd.prototype.Ob;jd.prototype.getLayout=jd.prototype.Pb;jd.prototype.rotate=jd.prototype.rotate;jd.prototype.scale=jd.prototype.scale;jd.prototype.getClosestPoint=jd.prototype.yb;jd.prototype.intersectsCoordinate=jd.prototype.jb;jd.prototype.getExtent=jd.prototype.C;jd.prototype.simplify=jd.prototype.Fb;
jd.prototype.transform=jd.prototype.lb;jd.prototype.get=jd.prototype.get;jd.prototype.getKeys=jd.prototype.P;jd.prototype.getProperties=jd.prototype.N;jd.prototype.set=jd.prototype.set;jd.prototype.setProperties=jd.prototype.G;jd.prototype.unset=jd.prototype.S;jd.prototype.changed=jd.prototype.u;jd.prototype.dispatchEvent=jd.prototype.b;jd.prototype.getRevision=jd.prototype.K;jd.prototype.on=jd.prototype.I;jd.prototype.once=jd.prototype.L;jd.prototype.un=jd.prototype.J;jd.prototype.unByKey=jd.prototype.M;
P.prototype.getFirstCoordinate=P.prototype.Nb;P.prototype.getLastCoordinate=P.prototype.Ob;P.prototype.getLayout=P.prototype.Pb;P.prototype.rotate=P.prototype.rotate;P.prototype.scale=P.prototype.scale;P.prototype.getClosestPoint=P.prototype.yb;P.prototype.intersectsCoordinate=P.prototype.jb;P.prototype.getExtent=P.prototype.C;P.prototype.simplify=P.prototype.Fb;P.prototype.transform=P.prototype.lb;P.prototype.get=P.prototype.get;P.prototype.getKeys=P.prototype.P;P.prototype.getProperties=P.prototype.N;
P.prototype.set=P.prototype.set;P.prototype.setProperties=P.prototype.G;P.prototype.unset=P.prototype.S;P.prototype.changed=P.prototype.u;P.prototype.dispatchEvent=P.prototype.b;P.prototype.getRevision=P.prototype.K;P.prototype.on=P.prototype.I;P.prototype.once=P.prototype.L;P.prototype.un=P.prototype.J;P.prototype.unByKey=P.prototype.M;Q.prototype.getFirstCoordinate=Q.prototype.Nb;Q.prototype.getLastCoordinate=Q.prototype.Ob;Q.prototype.getLayout=Q.prototype.Pb;Q.prototype.rotate=Q.prototype.rotate;
Q.prototype.scale=Q.prototype.scale;Q.prototype.getClosestPoint=Q.prototype.yb;Q.prototype.intersectsCoordinate=Q.prototype.jb;Q.prototype.getExtent=Q.prototype.C;Q.prototype.simplify=Q.prototype.Fb;Q.prototype.transform=Q.prototype.lb;Q.prototype.get=Q.prototype.get;Q.prototype.getKeys=Q.prototype.P;Q.prototype.getProperties=Q.prototype.N;Q.prototype.set=Q.prototype.set;Q.prototype.setProperties=Q.prototype.G;Q.prototype.unset=Q.prototype.S;Q.prototype.changed=Q.prototype.u;
Q.prototype.dispatchEvent=Q.prototype.b;Q.prototype.getRevision=Q.prototype.K;Q.prototype.on=Q.prototype.I;Q.prototype.once=Q.prototype.L;Q.prototype.un=Q.prototype.J;Q.prototype.unByKey=Q.prototype.M;R.prototype.getFirstCoordinate=R.prototype.Nb;R.prototype.getLastCoordinate=R.prototype.Ob;R.prototype.getLayout=R.prototype.Pb;R.prototype.rotate=R.prototype.rotate;R.prototype.scale=R.prototype.scale;R.prototype.getClosestPoint=R.prototype.yb;R.prototype.intersectsCoordinate=R.prototype.jb;
R.prototype.getExtent=R.prototype.C;R.prototype.simplify=R.prototype.Fb;R.prototype.transform=R.prototype.lb;R.prototype.get=R.prototype.get;R.prototype.getKeys=R.prototype.P;R.prototype.getProperties=R.prototype.N;R.prototype.set=R.prototype.set;R.prototype.setProperties=R.prototype.G;R.prototype.unset=R.prototype.S;R.prototype.changed=R.prototype.u;R.prototype.dispatchEvent=R.prototype.b;R.prototype.getRevision=R.prototype.K;R.prototype.on=R.prototype.I;R.prototype.once=R.prototype.L;
R.prototype.un=R.prototype.J;R.prototype.unByKey=R.prototype.M;S.prototype.getFirstCoordinate=S.prototype.Nb;S.prototype.getLastCoordinate=S.prototype.Ob;S.prototype.getLayout=S.prototype.Pb;S.prototype.rotate=S.prototype.rotate;S.prototype.scale=S.prototype.scale;S.prototype.getClosestPoint=S.prototype.yb;S.prototype.intersectsCoordinate=S.prototype.jb;S.prototype.getExtent=S.prototype.C;S.prototype.simplify=S.prototype.Fb;S.prototype.transform=S.prototype.lb;S.prototype.get=S.prototype.get;
S.prototype.getKeys=S.prototype.P;S.prototype.getProperties=S.prototype.N;S.prototype.set=S.prototype.set;S.prototype.setProperties=S.prototype.G;S.prototype.unset=S.prototype.S;S.prototype.changed=S.prototype.u;S.prototype.dispatchEvent=S.prototype.b;S.prototype.getRevision=S.prototype.K;S.prototype.on=S.prototype.I;S.prototype.once=S.prototype.L;S.prototype.un=S.prototype.J;S.prototype.unByKey=S.prototype.M;C.prototype.getFirstCoordinate=C.prototype.Nb;C.prototype.getLastCoordinate=C.prototype.Ob;
C.prototype.getLayout=C.prototype.Pb;C.prototype.rotate=C.prototype.rotate;C.prototype.scale=C.prototype.scale;C.prototype.getClosestPoint=C.prototype.yb;C.prototype.intersectsCoordinate=C.prototype.jb;C.prototype.getExtent=C.prototype.C;C.prototype.simplify=C.prototype.Fb;C.prototype.transform=C.prototype.lb;C.prototype.get=C.prototype.get;C.prototype.getKeys=C.prototype.P;C.prototype.getProperties=C.prototype.N;C.prototype.set=C.prototype.set;C.prototype.setProperties=C.prototype.G;
C.prototype.unset=C.prototype.S;C.prototype.changed=C.prototype.u;C.prototype.dispatchEvent=C.prototype.b;C.prototype.getRevision=C.prototype.K;C.prototype.on=C.prototype.I;C.prototype.once=C.prototype.L;C.prototype.un=C.prototype.J;C.prototype.unByKey=C.prototype.M;D.prototype.getFirstCoordinate=D.prototype.Nb;D.prototype.getLastCoordinate=D.prototype.Ob;D.prototype.getLayout=D.prototype.Pb;D.prototype.rotate=D.prototype.rotate;D.prototype.scale=D.prototype.scale;D.prototype.getClosestPoint=D.prototype.yb;
D.prototype.intersectsCoordinate=D.prototype.jb;D.prototype.getExtent=D.prototype.C;D.prototype.simplify=D.prototype.Fb;D.prototype.transform=D.prototype.lb;D.prototype.get=D.prototype.get;D.prototype.getKeys=D.prototype.P;D.prototype.getProperties=D.prototype.N;D.prototype.set=D.prototype.set;D.prototype.setProperties=D.prototype.G;D.prototype.unset=D.prototype.S;D.prototype.changed=D.prototype.u;D.prototype.dispatchEvent=D.prototype.b;D.prototype.getRevision=D.prototype.K;D.prototype.on=D.prototype.I;
D.prototype.once=D.prototype.L;D.prototype.un=D.prototype.J;D.prototype.unByKey=D.prototype.M;Pn.prototype.readFeatures=Pn.prototype.Fa;Yn.prototype.readFeatures=Yn.prototype.Fa;Pn.prototype.readFeatures=Pn.prototype.Fa;jf.prototype.get=jf.prototype.get;jf.prototype.getKeys=jf.prototype.P;jf.prototype.getProperties=jf.prototype.N;jf.prototype.set=jf.prototype.set;jf.prototype.setProperties=jf.prototype.G;jf.prototype.unset=jf.prototype.S;jf.prototype.changed=jf.prototype.u;
jf.prototype.dispatchEvent=jf.prototype.b;jf.prototype.getRevision=jf.prototype.K;jf.prototype.on=jf.prototype.I;jf.prototype.once=jf.prototype.L;jf.prototype.un=jf.prototype.J;jf.prototype.unByKey=jf.prototype.M;kf.prototype.getMap=kf.prototype.i;kf.prototype.setMap=kf.prototype.setMap;kf.prototype.setTarget=kf.prototype.c;kf.prototype.get=kf.prototype.get;kf.prototype.getKeys=kf.prototype.P;kf.prototype.getProperties=kf.prototype.N;kf.prototype.set=kf.prototype.set;kf.prototype.setProperties=kf.prototype.G;
kf.prototype.unset=kf.prototype.S;kf.prototype.changed=kf.prototype.u;kf.prototype.dispatchEvent=kf.prototype.b;kf.prototype.getRevision=kf.prototype.K;kf.prototype.on=kf.prototype.I;kf.prototype.once=kf.prototype.L;kf.prototype.un=kf.prototype.J;kf.prototype.unByKey=kf.prototype.M;nf.prototype.getMap=nf.prototype.i;nf.prototype.setMap=nf.prototype.setMap;nf.prototype.setTarget=nf.prototype.c;nf.prototype.get=nf.prototype.get;nf.prototype.getKeys=nf.prototype.P;nf.prototype.getProperties=nf.prototype.N;
nf.prototype.set=nf.prototype.set;nf.prototype.setProperties=nf.prototype.G;nf.prototype.unset=nf.prototype.S;nf.prototype.changed=nf.prototype.u;nf.prototype.dispatchEvent=nf.prototype.b;nf.prototype.getRevision=nf.prototype.K;nf.prototype.on=nf.prototype.I;nf.prototype.once=nf.prototype.L;nf.prototype.un=nf.prototype.J;nf.prototype.unByKey=nf.prototype.M;xf.prototype.getMap=xf.prototype.i;xf.prototype.setMap=xf.prototype.setMap;xf.prototype.setTarget=xf.prototype.c;xf.prototype.get=xf.prototype.get;
xf.prototype.getKeys=xf.prototype.P;xf.prototype.getProperties=xf.prototype.N;xf.prototype.set=xf.prototype.set;xf.prototype.setProperties=xf.prototype.G;xf.prototype.unset=xf.prototype.S;xf.prototype.changed=xf.prototype.u;xf.prototype.dispatchEvent=xf.prototype.b;xf.prototype.getRevision=xf.prototype.K;xf.prototype.on=xf.prototype.I;xf.prototype.once=xf.prototype.L;xf.prototype.un=xf.prototype.J;xf.prototype.unByKey=xf.prototype.M;em.prototype.getMap=em.prototype.i;em.prototype.setMap=em.prototype.setMap;
em.prototype.setTarget=em.prototype.c;em.prototype.get=em.prototype.get;em.prototype.getKeys=em.prototype.P;em.prototype.getProperties=em.prototype.N;em.prototype.set=em.prototype.set;em.prototype.setProperties=em.prototype.G;em.prototype.unset=em.prototype.S;em.prototype.changed=em.prototype.u;em.prototype.dispatchEvent=em.prototype.b;em.prototype.getRevision=em.prototype.K;em.prototype.on=em.prototype.I;em.prototype.once=em.prototype.L;em.prototype.un=em.prototype.J;em.prototype.unByKey=em.prototype.M;
sf.prototype.getMap=sf.prototype.i;sf.prototype.setMap=sf.prototype.setMap;sf.prototype.setTarget=sf.prototype.c;sf.prototype.get=sf.prototype.get;sf.prototype.getKeys=sf.prototype.P;sf.prototype.getProperties=sf.prototype.N;sf.prototype.set=sf.prototype.set;sf.prototype.setProperties=sf.prototype.G;sf.prototype.unset=sf.prototype.S;sf.prototype.changed=sf.prototype.u;sf.prototype.dispatchEvent=sf.prototype.b;sf.prototype.getRevision=sf.prototype.K;sf.prototype.on=sf.prototype.I;
sf.prototype.once=sf.prototype.L;sf.prototype.un=sf.prototype.J;sf.prototype.unByKey=sf.prototype.M;jm.prototype.getMap=jm.prototype.i;jm.prototype.setMap=jm.prototype.setMap;jm.prototype.setTarget=jm.prototype.c;jm.prototype.get=jm.prototype.get;jm.prototype.getKeys=jm.prototype.P;jm.prototype.getProperties=jm.prototype.N;jm.prototype.set=jm.prototype.set;jm.prototype.setProperties=jm.prototype.G;jm.prototype.unset=jm.prototype.S;jm.prototype.changed=jm.prototype.u;jm.prototype.dispatchEvent=jm.prototype.b;
jm.prototype.getRevision=jm.prototype.K;jm.prototype.on=jm.prototype.I;jm.prototype.once=jm.prototype.L;jm.prototype.un=jm.prototype.J;jm.prototype.unByKey=jm.prototype.M;vf.prototype.getMap=vf.prototype.i;vf.prototype.setMap=vf.prototype.setMap;vf.prototype.setTarget=vf.prototype.c;vf.prototype.get=vf.prototype.get;vf.prototype.getKeys=vf.prototype.P;vf.prototype.getProperties=vf.prototype.N;vf.prototype.set=vf.prototype.set;vf.prototype.setProperties=vf.prototype.G;vf.prototype.unset=vf.prototype.S;
vf.prototype.changed=vf.prototype.u;vf.prototype.dispatchEvent=vf.prototype.b;vf.prototype.getRevision=vf.prototype.K;vf.prototype.on=vf.prototype.I;vf.prototype.once=vf.prototype.L;vf.prototype.un=vf.prototype.J;vf.prototype.unByKey=vf.prototype.M;tm.prototype.getMap=tm.prototype.i;tm.prototype.setMap=tm.prototype.setMap;tm.prototype.setTarget=tm.prototype.c;tm.prototype.get=tm.prototype.get;tm.prototype.getKeys=tm.prototype.P;tm.prototype.getProperties=tm.prototype.N;tm.prototype.set=tm.prototype.set;
tm.prototype.setProperties=tm.prototype.G;tm.prototype.unset=tm.prototype.S;tm.prototype.changed=tm.prototype.u;tm.prototype.dispatchEvent=tm.prototype.b;tm.prototype.getRevision=tm.prototype.K;tm.prototype.on=tm.prototype.I;tm.prototype.once=tm.prototype.L;tm.prototype.un=tm.prototype.J;tm.prototype.unByKey=tm.prototype.M;ym.prototype.getMap=ym.prototype.i;ym.prototype.setMap=ym.prototype.setMap;ym.prototype.setTarget=ym.prototype.c;ym.prototype.get=ym.prototype.get;ym.prototype.getKeys=ym.prototype.P;
ym.prototype.getProperties=ym.prototype.N;ym.prototype.set=ym.prototype.set;ym.prototype.setProperties=ym.prototype.G;ym.prototype.unset=ym.prototype.S;ym.prototype.changed=ym.prototype.u;ym.prototype.dispatchEvent=ym.prototype.b;ym.prototype.getRevision=ym.prototype.K;ym.prototype.on=ym.prototype.I;ym.prototype.once=ym.prototype.L;ym.prototype.un=ym.prototype.J;ym.prototype.unByKey=ym.prototype.M;
  return OPENLAYERS.ol;
}));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
var mgrs = require('mgrs');

function Point(x, y, z) {
  if (!(this instanceof Point)) {
    return new Point(x, y, z);
  }
  if (Array.isArray(x)) {
    this.x = x[0];
    this.y = x[1];
    this.z = x[2] || 0.0;
  }else if(typeof x === 'object'){
    this.x = x.x;
    this.y = x.y;
    this.z = x.z || 0.0;
  } else if (typeof x === 'string' && typeof y === 'undefined') {
    var coords = x.split(',');
    this.x = parseFloat(coords[0], 10);
    this.y = parseFloat(coords[1], 10);
    this.z = parseFloat(coords[2], 10) || 0.0;
  }
  else {
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
},{"mgrs":76}],10:[function(require,module,exports){
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

},{"./deriveConstants":41,"./extend":42,"./parseCode":46,"./projections":48}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) < HALF_PI) ? x : (x - (sign(x) * Math.PI));
};
},{"./sign":29}],13:[function(require,module,exports){
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
},{"./sign":29}],14:[function(require,module,exports){
module.exports = function(x) {
  if (Math.abs(x) > 1) {
    x = (x > 1) ? 1 : -1;
  }
  return Math.asin(x);
};
},{}],15:[function(require,module,exports){
module.exports = function(x) {
  return (1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x)));
};
},{}],16:[function(require,module,exports){
module.exports = function(x) {
  return (0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x)));
};
},{}],17:[function(require,module,exports){
module.exports = function(x) {
  return (0.05859375 * x * x * (1 + 0.75 * x));
};
},{}],18:[function(require,module,exports){
module.exports = function(x) {
  return (x * x * x * (35 / 3072));
};
},{}],19:[function(require,module,exports){
module.exports = function(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
};
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
module.exports = function(e0, e1, e2, e3, phi) {
  return (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi));
};
},{}],23:[function(require,module,exports){
module.exports = function(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / (Math.sqrt(1 - con * con));
};
},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{"./pj_mlfn":27}],27:[function(require,module,exports){
module.exports = function(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4]))));
};
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
module.exports = function(x) {
  return x<0 ? -1 : 1;
};
},{}],30:[function(require,module,exports){
module.exports = function(esinp, exp) {
  return (Math.pow((1 - esinp) / (1 + esinp), exp));
};
},{}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow(((1 - con) / (1 + con)), com);
  return (Math.tan(0.5 * (HALF_PI - phi)) / con);
};
},{}],33:[function(require,module,exports){
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
},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
exports.ft = {to_meter: 0.3048};
exports['us-ft'] = {to_meter: 1200 / 3937};

},{}],37:[function(require,module,exports){
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
},{"./Proj":10,"./transform":74}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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


},{}],40:[function(require,module,exports){
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

},{"./global":43,"./projString":47,"./wkt":75}],41:[function(require,module,exports){
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

},{"./constants/Datum":33,"./constants/Ellipsoid":34,"./datum":38,"./extend":42}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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
},{"./projections/aea":49,"./projections/aeqd":50,"./projections/cass":51,"./projections/cea":52,"./projections/eqc":53,"./projections/eqdc":54,"./projections/gnom":56,"./projections/krovak":57,"./projections/laea":58,"./projections/lcc":59,"./projections/mill":62,"./projections/moll":63,"./projections/nzmg":64,"./projections/omerc":65,"./projections/poly":66,"./projections/sinu":67,"./projections/somerc":68,"./projections/stere":69,"./projections/sterea":70,"./projections/tmerc":71,"./projections/utm":72,"./projections/vandg":73}],45:[function(require,module,exports){
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
},{"../package.json":77,"./Point":9,"./Proj":10,"./common/toPoint":31,"./core":37,"./defs":40,"./includedProjections":44,"./transform":74,"mgrs":76}],46:[function(require,module,exports){
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
},{"./defs":40,"./projString":47,"./wkt":75}],47:[function(require,module,exports){
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

},{"./constants/PrimeMeridian":35,"./constants/units":36}],48:[function(require,module,exports){
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

},{"./projections/longlat":60,"./projections/merc":61}],49:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/asinz":14,"../common/msfnz":23,"../common/qsfnz":28}],50:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/asinz":14,"../common/e0fn":15,"../common/e1fn":16,"../common/e2fn":17,"../common/e3fn":18,"../common/gN":19,"../common/imlfn":20,"../common/mlfn":22}],51:[function(require,module,exports){
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
},{"../common/adjust_lat":12,"../common/adjust_lon":13,"../common/e0fn":15,"../common/e1fn":16,"../common/e2fn":17,"../common/e3fn":18,"../common/gN":19,"../common/imlfn":20,"../common/mlfn":22}],52:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/iqsfnz":21,"../common/msfnz":23,"../common/qsfnz":28}],53:[function(require,module,exports){
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

},{"../common/adjust_lat":12,"../common/adjust_lon":13}],54:[function(require,module,exports){
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

},{"../common/adjust_lat":12,"../common/adjust_lon":13,"../common/e0fn":15,"../common/e1fn":16,"../common/e2fn":17,"../common/e3fn":18,"../common/imlfn":20,"../common/mlfn":22,"../common/msfnz":23}],55:[function(require,module,exports){
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

},{"../common/srat":30}],56:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/asinz":14}],57:[function(require,module,exports){
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

},{"../common/adjust_lon":13}],58:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/qsfnz":28}],59:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/msfnz":23,"../common/phi2z":24,"../common/sign":29,"../common/tsfnz":32}],60:[function(require,module,exports){
exports.init = function() {
  //no-op for longlat
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["longlat", "identity"];

},{}],61:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/msfnz":23,"../common/phi2z":24,"../common/tsfnz":32}],62:[function(require,module,exports){
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

},{"../common/adjust_lon":13}],63:[function(require,module,exports){
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

},{"../common/adjust_lon":13}],64:[function(require,module,exports){
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
},{}],65:[function(require,module,exports){
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
},{"../common/adjust_lon":13,"../common/phi2z":24,"../common/tsfnz":32}],66:[function(require,module,exports){
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
},{"../common/adjust_lat":12,"../common/adjust_lon":13,"../common/e0fn":15,"../common/e1fn":16,"../common/e2fn":17,"../common/e3fn":18,"../common/gN":19,"../common/mlfn":22}],67:[function(require,module,exports){
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
},{"../common/adjust_lat":12,"../common/adjust_lon":13,"../common/asinz":14,"../common/pj_enfn":25,"../common/pj_inv_mlfn":26,"../common/pj_mlfn":27}],68:[function(require,module,exports){
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

},{}],69:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/msfnz":23,"../common/phi2z":24,"../common/sign":29,"../common/tsfnz":32}],70:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"./gauss":55}],71:[function(require,module,exports){
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

},{"../common/adjust_lon":13,"../common/asinz":14,"../common/e0fn":15,"../common/e1fn":16,"../common/e2fn":17,"../common/e3fn":18,"../common/mlfn":22,"../common/sign":29}],72:[function(require,module,exports){
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

},{"./tmerc":71}],73:[function(require,module,exports){
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
},{"../common/adjust_lon":13,"../common/asinz":14}],74:[function(require,module,exports){
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
},{"./Proj":10,"./adjust_axis":11,"./common/toPoint":31,"./datum_transform":39}],75:[function(require,module,exports){
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

},{"./extend":42}],76:[function(require,module,exports){



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

},{}],77:[function(require,module,exports){
module.exports={
  "name": "proj4",
  "version": "2.3.12",
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
    "browserify": "~3.24.5",
    "grunt-browserify": "~1.3.0",
    "grunt-contrib-uglify": "~0.3.2",
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
  "gitHead": "cd07cad5c6a5b6ed82b59a21356848979eafe22c",
  "bugs": {
    "url": "https://github.com/proj4js/proj4js/issues"
  },
  "homepage": "https://github.com/proj4js/proj4js#readme",
  "_id": "proj4@2.3.12",
  "_shasum": "96b9ed2a810dad6e62f1e32b4dad37c276b427a2",
  "_from": "proj4@2.3.12",
  "_npmVersion": "2.11.3",
  "_nodeVersion": "0.12.7",
  "_npmUser": {
    "name": "ahocevar",
    "email": "andreas.hocevar@gmail.com"
  },
  "dist": {
    "shasum": "96b9ed2a810dad6e62f1e32b4dad37c276b427a2",
    "tarball": "https://registry.npmjs.org/proj4/-/proj4-2.3.12.tgz"
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
  "_resolved": "http://registry.npmjs.org/proj4/-/proj4-2.3.12.tgz"
}

},{}],78:[function(require,module,exports){
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

},{"performance-now":79}],79:[function(require,module,exports){
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

},{"_process":6}]},{},[2])(2)
});
//# sourceMappingURL=target-area.js.map
