(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.LTFRI || (g.LTFRI = {})).MapPage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $ = require('jquery')
var map = require('./map')
var legendTemplate = require('./legend.hbs')
var Maps = require('../../../lib/models/maps')
var maps = new Maps()

var easting = getParameterByName('easting')
var northing = getParameterByName('northing')

map.loadMap(easting && [easting, northing])

function getParameterByName (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  var results = regex.exec(window.location.search)
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

$(function () {
  var selected = 'selected'
  var $page = $('main#map-page')
  var $container = $('.map-container')
  var $sidebar = $('ul.nav', $container)
  var $selector = $('select', $container)
  var $categories = $sidebar.children('li.category')
  var $maps = $categories.find('li')
  var $map = $('#map')

  // Store a reference to the map legend element
  var $legend = $('.legend')

  function setCurrent (ref) {
    maps.setCurrent(ref)

    var currMap = maps.currMap
    var currCategory = maps.currCategory

    // Update the legend
    $legend.html(legendTemplate(currMap.legend))

    // Update the main nav
    $categories.removeClass(selected)
    $categories.filter('#' + currCategory.ref).addClass(selected)
    $maps.removeClass(selected)
    $maps.filter('#' + currMap.ref).addClass(selected)

    // Update the mobile nav
    $selector.val(currMap.ref)

    // Load the map
    map.showMap('risk:' + currMap.ref.substring(currMap.ref.indexOf('_') + 1))
  }

  // Default to the first category/map
  map.onReady(function () {
    // Handle the category header clicks
    $categories.on('click', 'h2', function (e) {
      e.preventDefault()
      var $category = $(this).parent()
      if (!$category.hasClass(selected)) {
        setCurrent($category.attr('id'))
      }
    })

    // Handle the map selector clicks
    $maps.on('click', function (e) {
      e.preventDefault()
      setCurrent($(this).attr('id'))
    })

    // Handle the mobile map selector change
    $selector.on('change', function (e) {
      e.preventDefault()
      setCurrent($(this).val())
    })

    setCurrent(getParameterByName('map'))
  })

  $container.on('click', '.map-switch a.toggle-view', function (e) {
    e.preventDefault()
    $(e.delegateTarget).toggleClass('detailed')
  })

  $container.on('click', '.enter-fullscreen', function (e) {
    e.preventDefault()
    $page.addClass('fullscreen')
    $map.css('height', ($(window).height() - 100) + 'px')
    map.updateSize()
  })

  $container.on('click', '.exit-fullscreen', function (e) {
    e.preventDefault()
    $page.removeClass('fullscreen')
    $map.css('height', '')
    map.updateSize()
  })
})

module.exports = {
  testValues: map.testValues
}

},{"../../../lib/models/maps":7,"./legend.hbs":2,"./map":4,"jquery":29}],2:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "  <h3 class=\"heading-small\">"
    + container.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "  <h5 class=\"subtitle\">"
    + container.escapeExpression(((helper = (helper = helpers.subTitle || (depth0 != null ? depth0.subTitle : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"subTitle","hash":{},"data":data}) : helper)))
    + "</h5>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <li class=\"round "
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\">\n      <div>"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</div>\n    </li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.subTitle : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<br>\n\n<ul>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.keys : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <li class=\"crosshair\">\n    <div>Location of the postcode you entered</div>\n  </li>\n</ul>\n";
},"useData":true});

},{"hbsfy/runtime":28}],3:[function(require,module,exports){
module.exports={
  "projection": {
    "ref": "EPSG:27700",
    "proj4": "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
    "extent": [0, 0, 800000, 1400000]
  },
  "OSGetCapabilities": "os-get-capabilities",
  "OSAttribution": "&#169; Crown copyright and database rights {{year}} <a href='http://www.ordnancesurvey.co.uk'>OS</a> 100024198. Use of this mapping data is subject to terms and conditions",
  "OSLayer": "osgb",
  "OSMatrixSet": "ZoomMap",
  "GSWMSGetCapabilities": "gwc-proxy?SERVICE=WMS&VERSION=1.1.1&REQUEST=getcapabilities&TILED=true",
  "GSWMS": "gwc-proxy?"
}

},{}],4:[function(require,module,exports){
var $ = require('jquery')
// proj4 is accessed using global variable within openlayers library
window.proj4 = require('proj4')
var raf = require('raf')
var ol = require('openlayers')
var parser = new ol.format.WMTSCapabilities()
var wmsparser = new ol.format.WMSCapabilities()
var config = require('./map-config.json')
var overlayTemplate = require('./overlay.hbs')
var map, callback, currentLayer, $overlay, $overlayContent
var isLoading = false
var loading = 0
var loaded = 0
var loadError = 0
var maxResolution = 1000

function loadMap (point) {
  // add the projection to Window.proj4
  window.proj4.defs(config.projection.ref, config.projection.proj4)

  // ie9 requires polyfill for window.requestAnimationFrame
  raf.polyfill()

  var projection = ol.proj.get(config.projection.ref)

  projection.setExtent(config.projection.extent)

  $.when($.get(config.OSGetCapabilities), $.get(config.GSWMSGetCapabilities)).done(function (OS, WMS) {
    // bug: parser is not getting the matrixwidth and matrixheight values when parsing,
    // therefore sizes is set to undefined array, which sets fullTileRanges_
    // to an array of undefineds thus breaking the map      return
    var result = parser.read(OS[0])
    // TODO
    // need to set tiles to https
    // follow up with OS
    result.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href = result.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href.replace('http://', 'https://')

    var options = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: config.OSLayer,
      matrixSet: config.OSMatrixSet
    })

    var attribution = config.OSAttribution.replace('{{year}}', new Date().getFullYear())

    options.attributions = [
      new ol.Attribution({
        html: attribution
      })
    ]

    var source = new ol.source.WMTS(options)

    // array of ol.tileRange can't find any reference to this object in ol3 documentation, but is set to NaN and stops the map from functioning
    // openlayers doesn't expose fulltileranges as a property, so when using minified ol have to set tilegrid.a to null, which is what fulltileranges
    // is mapped as, hopefully OS will fix their service, otherwise something more robust needs sorting out
    source.tileGrid.fullTileRanges_ = null
    source.tileGrid.b = null

    var layer = new ol.layer.Tile({
      ref: config.OSLayer,
      source: source
    })
    var layers = []
    // add the base map layer
    layers.push(layer)

    var wmsResult = wmsparser.read(WMS[0])

    // I can't find a better way of doing this for a tileWMS source, WMTS souce has
    // optionsFromCapabilities function which does some of the work for you, but it looks
    // like that function just does this anyway, although i think the WMTS version does a lot more with setting up matrixSet and things
    for (var i = 0; i < wmsResult.Capability.Layer.Layer.length; i++) {
      var WmsSource = new ol.source.TileWMS({
        url: config.GSWMS,
        params: {
          LAYERS: wmsResult.Capability.Layer.Layer[i].Name,
          TILED: true,
          VERSION: wmsResult.version
        },
        tileGrid: new ol.tilegrid.TileGrid({
          extent: wmsResult.Capability.Layer.Layer[i].BoundingBox[0].extent,
          resolutions: source.tileGrid.getResolutions(),
          tileSize: [250, 250]
        })
      })

      var progress = new Progress(document.getElementById('progress'))

      source.on('tileloadstart', function () {
        progress.addLoading()
      })

      source.on('tileloadend', function () {
        progress.addLoaded()
      })

      source.on('tileloaderror', function () {
        progress.addLoaded()
      })

      WmsSource.on('tileloadstart', function () {
        isLoading = true
        loading++
        progress.addLoading()
      })

      WmsSource.on('tileloadend', function () {
        loaded++
        if (loading === loaded) {
          layerLoaded()
        }
        progress.addLoaded()
      })

      WmsSource.on('tileloaderror', function () {
        loadError++
        loaded++
        if (loading === loaded) {
          layerLoaded()
        }
        progress.addLoaded()
      })

      if (wmsResult.Capability.Layer.Layer[i].Name.indexOf('SW') > -1) {
        maxResolution = 20
      }

      layers.push(new ol.layer.Tile({
        ref: wmsResult.Capability.Layer.Layer[i].Name,
        source: WmsSource,
        opacity: 0.7,
        visible: false,
        maxResolution: maxResolution
      }))
    }

    if (point) {
      var centreLayer = new ol.layer.Vector({
        ref: 'crosshair',
        visible: true,
        source: new ol.source.Vector({
          features: [new ol.Feature({
            geometry: new ol.geom.Point(point)
          })]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon({
            src: 'public/images/crosshair.png'
          })
        })
      })
      layers.push(centreLayer)
    }

    map = new ol.Map({
      controls: ol.control.defaults().extend([
        new ol.control.ScaleLine({
          units: 'metric',
          minWidth: 128
        })
      ]),
      interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      layers: layers,
      pixelRatio: 1,
      target: 'map',
      view: new ol.View({
        resolutions: source.tileGrid.getResolutions(),
        projection: projection,
        center: point || [440000, 310000],
        zoom: point ? 9 : 0,
        extent: config.projection.extent
      })
    })

    // Map interaction functions
    map.on('singleclick', function (e) {
      var currentLayerRef = currentLayer && currentLayer.getProperties().ref

      // The overlay is only for the FWLRSF
      // TODO:Should also call bullseye(e.pixel) but currently an Openlayers bug with Firefox
      if (currentLayerRef !== 'risk:2-FWLRSF') {
        return
      }

      var resolution = map.getView().getResolution()
      var url = currentLayer.getSource().getGetFeatureInfoUrl(e.coordinate, resolution, config.projection.ref, {
        INFO_FORMAT: 'application/json',
        FEATURE_COUNT: 10
      })

      function toFixed (number) {
        if (typeof number !== 'undefined') {
          return number.toFixed(2)
        }
      }

      $.get(url, function (data) {
        if (!data || !data.features.length) {
          return
        }

        // Get the feature and build a view model from the properties
        var feature = data.features[0]
        var properties = feature.properties
        var isRiverLevelStation = feature.id.indexOf('river_level') === 0
        var viewModel = {
          flow30: isRiverLevelStation && toFixed(properties.flow_30),
          flow100: isRiverLevelStation && toFixed(properties.flow_100),
          flow1000: isRiverLevelStation && toFixed(properties.flow_1000),
          depth30: toFixed(isRiverLevelStation ? properties.depth_30 : properties.lev_30),
          depth100: toFixed(isRiverLevelStation ? properties.depth_100 : properties.lev_100),
          depth1000: toFixed(isRiverLevelStation ? properties.depth_1000 : properties.lev_1000),
          isRiverLevelStation: isRiverLevelStation,
          stationName: properties.location || properties.site
        }

        // Get the overlay content html using the template
        var html = overlayTemplate(viewModel)

        // update the content
        $overlayContent.html(html)

        // Show the overlay
        $overlay.show()
      })
    })

    // Initialise the overlays
    function hideOverlay (e) {
      e.preventDefault()
      $overlay.hide()
    }
    $overlay = $('#map-overlay')
    $overlay
      .on('click', '.map-overlay-close', hideOverlay)
      .on('click', '.map-overlay-close-link', hideOverlay)

    $overlayContent = $('.map-overlay-content', $overlay)

    // Callback to notify map is ready
    if (callback) {
      callback()
    }
  })
}

function showMap (ref) {
  closeOverlay()
  map.getLayers().forEach(function (layer) {
    var name = layer.getProperties().ref
    if (name !== config.OSLayer && name !== 'crosshair') {
      currentLayer = name === ref ? layer : currentLayer
      layer.setVisible(name === ref)
    }
  })
}

function updateSize () {
  map.updateSize()
}

function closeOverlay () {
  $overlay.hide()
}

function testValues () {
  return {
    zoom: map.getView().getZoom(),
    point: map.getView().getCenter(),
    layer: currentLayer && currentLayer.getProperties().ref,
    isLoading: isLoading
  }
}

function layerLoaded () {
  loading = 0
  loaded = 0
  loadError = 0
  isLoading = false
}

function Progress (el) {
  this.el = el
  this.tilesLoading = 0
  this.tilesLoaded = 0
}

Progress.prototype.addLoading = function () {
  if (this.tilesLoading === 0) {
    this.show()
  }
  ++this.tilesLoading
  this.update()
}

Progress.prototype.addLoaded = function () {
  var this_ = this
  setTimeout(function () {
    ++this_.tilesLoaded
    this_.update()
  }, 100)
}

Progress.prototype.update = function () {
  var width = (this.tilesLoaded / this.tilesLoading * 100).toFixed(1) + '%'
  this.el.style.width = width
  if (this.tilesLoading === this.tilesLoaded) {
    this.tilesLoading = 0
    this.tilesLoaded = 0
    var this_ = this
    setTimeout(function () {
      this_.hide()
    }, 500)
  }
}

Progress.prototype.show = function () {
  this.el.style.visibility = 'visible'
}

Progress.prototype.hide = function () {
  if (this.tilesLoading === this.tilesLoaded) {
    this.el.style.visibility = 'hidden'
    this.el.style.width = 0
  }
}

module.exports = {
  loadMap: loadMap,
  showMap: showMap,
  updateSize: updateSize,
  closeOverlay: closeOverlay,
  testValues: testValues,
  onReady: function (fn) {
    callback = fn
  }
}

},{"./map-config.json":3,"./overlay.hbs":5,"jquery":29,"openlayers":30,"proj4":67,"raf":100}],5:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    return "Depth";
},"3":function(container,depth0,helpers,partials,data) {
    return "Water level";
},"5":function(container,depth0,helpers,partials,data) {
    return "depth";
},"7":function(container,depth0,helpers,partials,data) {
    return "level";
},"9":function(container,depth0,helpers,partials,data) {
    return "Level";
},"11":function(container,depth0,helpers,partials,data) {
    return "water depth";
},"13":function(container,depth0,helpers,partials,data) {
    return "the water level";
},"15":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  <h4 class=\"heading-medium\">\n    Flow estimates at this monitoring station\n  </h4>\n\n  <h5 class=\"heading-small\">\n    High chance scenario\n  </h5>\n  <p>There's a high chance (over 3.3%) that the flow will reach "
    + alias4(((helper = (helper = helpers.flow30 || (depth0 != null ? depth0.flow30 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"flow30","hash":{},"data":data}) : helper)))
    + " cubic metres per second.</p>\n\n  <h5 class=\"heading-small\">\n    Medium chance scenario\n  </h5>\n  <p>There's a medium chance (over 1%) that the flow will reach "
    + alias4(((helper = (helper = helpers.flow100 || (depth0 != null ? depth0.flow100 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"flow100","hash":{},"data":data}) : helper)))
    + " cubic metres per second.</p>\n\n  <h5 class=\"heading-small\">\n    Low chance scenario\n  </h5>\n  <p>There's a low chance (under 1%) that the flow will reach "
    + alias4(((helper = (helper = helpers.flow1000 || (depth0 != null ? depth0.flow1000 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"flow1000","hash":{},"data":data}) : helper)))
    + " cubic metres per second.</p>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<h3 class=\"heading-large\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + " and flow estimates for the monitoring station at "
    + alias4(((helper = (helper = helpers.stationName || (depth0 != null ? depth0.stationName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"stationName","hash":{},"data":data}) : helper)))
    + "</h3>\n<p>The Environment Agency uses 3 risk scenarios to estimate the "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + " and flow of water that could occur at this location in any given year.</p>\n\n<h4 class=\"heading-medium\">\n  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(9, data, 0),"data":data})) != null ? stack1 : "")
    + " estimates at this monitoring station\n</h4>\n\n<h5 class=\"heading-small\">\n  High chance scenario\n</h5>\n<p>There's a high chance (over 3.3%) that "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "")
    + " will reach "
    + alias4(((helper = (helper = helpers.depth30 || (depth0 != null ? depth0.depth30 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"depth30","hash":{},"data":data}) : helper)))
    + "m</p>\n\n<h5 class=\"heading-small\">\n  Medium chance scenario\n</h5>\n<p>There's a medium chance (over 1%) that "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "")
    + " will reach "
    + alias4(((helper = (helper = helpers.depth100 || (depth0 != null ? depth0.depth100 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"depth100","hash":{},"data":data}) : helper)))
    + "m</p>\n\n<h5 class=\"heading-small\">\n  Low chance scenario\n</h5>\n<p>There's a low chance (under 1%) that "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "")
    + " will reach "
    + alias4(((helper = (helper = helpers.depth1000 || (depth0 != null ? depth0.depth1000 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"depth1000","hash":{},"data":data}) : helper)))
    + "m</p>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isRiverLevelStation : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<a href=\"#\" class=\"map-overlay-close-link\">Back to map</a>\n";
},"useData":true});

},{"hbsfy/runtime":28}],6:[function(require,module,exports){
module.exports={
  "categories": [
    {
      "ref": "RiversOrSea",
      "icon": "rivers-sea",
      "name": "Flood risk from rivers or the sea",
      "title": "Flood risk from rivers or the sea",
      "maps": [
        {
          "ref": "RiversOrSea_1-ROFRS",
          "name": "Extent of flooding",
          "title": "Extent of flooding from rivers or the sea",
          "legend": {
            "title": "Flood risk",
            "keys": [{
              "text": "High",
              "icon": "purple"
            }, {
              "text": "Medium",
              "icon": "dark-blue"
            }, {
              "text": "Low",
              "icon": "blue"
            }, {
              "text": "Very low",
              "icon": "light-blue"
            }]
          }
        },
        {
          "ref": "RiversOrSea_2-FWLRSF",
          "name": "Depth and flow estimates at monitoring stations",
          "title": "Estimated depth and flow of water at river and sea level monitoring stations",
          "legend": {
            "title": "Select monitoring station",
            "keys": [{
              "text": "River level monitoring station",
              "icon": "green",
              "shape": "round"
            }, {
              "text": "Sea level monitoring station",
              "icon": "red",
              "shape": "round"
            }]
          }
        }
      ]
    },
    {
      "ref": "SurfaceWater",
      "icon": "surface-water",
      "name": "Flood risk from surface water",
      "title": "Flood risk from surface water",
      "maps": [
        {
          "ref": "SurfaceWater_6-SW-Extent",
          "name": "Extent of flooding",
          "title": "Extent of flooding from surface water",
          "legend": {
            "title": "Flood risk",
            "keys": [{
              "text": "High",
              "icon": "purple"
            }, {
              "text": "Medium",
              "icon": "dark-blue"
            }, {
              "text": "Low",
              "icon": "blue"
            }, {
              "text": "Very low",
              "icon": "white"
            }]
          }
        },
        {
          "ref": "SurfaceWater_9-SWDH",
          "name": "High risk: depth",
          "title": "Surface water flood risk: water depth in a high risk scenario",
          "legend": {
            "title": "High risk scenario",
            "subTitle": "Flood depth (millimetres)",
            "keys": [{
              "text": "Over 900mm",
              "icon": "purple"
            }, {
              "text": "300 to 900mm",
              "icon": "dark-blue"
            }, {
              "text": "Below 300mm",
              "icon": "blue"
            }]
          }
        },
        {
          "ref": "SurfaceWater_12-SWVH",
          "name": "High risk: velocity",
          "title": "Surface water flood risk: water velocity in a high risk scenario",
          "legend": {
            "title": "High risk scenario",
            "subTitle": "Flood velocity (metres/second)",
            "keys": [{
              "text": "Over 0.25 m/s",
              "icon": "purple"
            }, {
              "text": "Less than 0.25 m/s",
              "icon": "blue"
            }, {
              "text": "Direction of water flow",
              "icon": "arrow"
            }]
          }
        },
        {
          "ref": "SurfaceWater_8-SWDM",
          "name": "Medium risk: depth",
          "title": "Surface water flood risk: water depth in a medium risk scenario",
          "legend": {
            "title": "Medium risk scenario",
            "subTitle": "Flood depth (millimetres)",
            "keys": [{
              "text": "Over 900mm",
              "icon": "purple"
            }, {
              "text": "300 to 900mm",
              "icon": "dark-blue"
            }, {
              "text": "Below 300mm",
              "icon": "blue"
            }]
          }
        },
        {
          "ref": "SurfaceWater_11-SWVM",
          "name": "Medium risk: velocity",
          "title": "Surface water flood risk: water velocity in a medium risk scenario",
          "legend": {
            "title": "Medium risk scenario",
            "subTitle": "Flood velocity (metres/second)",
            "keys": [{
              "text": "Over 0.25 m/s",
              "icon": "purple"
            }, {
              "text": "Less than 0.25 m/s",
              "icon": "blue"
            }, {
              "text": "Direction of water flow",
              "icon": "arrow"
            }]
          }
        },
        {
          "ref": "SurfaceWater_7-SWDL",
          "name": "Low risk: depth",
          "title": "Surface water flood risk: water depth in a low risk scenario",
          "legend": {
            "title": "Low risk scenario",
            "subTitle": "Flood depth (millimetres)",
            "keys": [{
              "text": "Over 900mm",
              "icon": "purple"
            }, {
              "text": "300 to 900mm",
              "icon": "dark-blue"
            }, {
              "text": "Below 300mm",
              "icon": "blue"
            }]
          }
        },
        {
          "ref": "SurfaceWater_10-SWVL",
          "name": "Low risk: velocity",
          "title": "Surface water flood risk: water velocity in a low risk scenario",
          "legend": {
            "title": "Low risk scenario",
            "subTitle": "Flood velocity (metres/second)",
            "keys": [{
              "text": "Over 0.25 m/s",
              "icon": "purple"
            }, {
              "text": "Less than 0.25 m/s",
              "icon": "blue"
            }, {
              "text": "Direction of water flow",
              "icon": "arrow"
            }]
          }
        }
      ]
    },
    {
      "ref": "Reservoirs",
      "icon": "reservoir",
      "name": "Flood risk from reservoirs",
      "title": "Flood risk from reservoirs",
      "maps": [
        {
          "ref": "Reservoirs_3-ROFR",
          "name": "Extent of flooding",
          "title": "Extent of flooding from rerservoirs",
          "legend": {
            "title": "Flood risk",
            "keys": [{
              "text": "Maximum extent of flooding",
              "icon": "blue"
            }]
          }
        },
        {
          "ref": "Reservoirs_4-DOFR",
          "name": "Flood depth",
          "title": "Reservoir flood risk: flood water depth",
          "legend": {
            "title": "Flood depth (metres)",
            "keys": [{
              "text": "Over 2m",
              "icon": "purple"
            }, {
              "text": "Between 0.3 and 2m",
              "icon": "dark-blue"
            }, {
              "text": "Below 0.3m",
              "icon": "blue"
            }]
          }
        },
        {
          "ref": "Reservoirs_5-SOFR",
          "name": "Flood speed",
          "title": "Reservoir flood risk: flood water speed",
          "legend": {
            "title": "Flood speed",
            "keys": [{
              "text": "Over 2m/s",
              "icon": "purple"
            }, {
              "text": "Between 0.5 and 2m/s",
              "icon": "dark-blue"
            }, {
              "text": "Below 0.5m/s",
              "icon": "blue"
            }]
          }
        }
      ]
    }
  ]
}

},{}],7:[function(require,module,exports){
var maps = require('./maps.json')

function Maps (ref) {
  this._data = maps
  this._categories = maps.categories
  this.setCurrent(ref)
}
/**
 * setCurrent
 * @param {string} ref The ref of either a category or map. If a category ref is passed, the first map in that category is used.
 */
Maps.prototype.setCurrent = function (ref) {
  // Work out the current category and map
  var category, map, defaultCategory, defaultMap
  for (var i = 0; i < this._categories.length; i++) {
    category = this._categories[i]
    if (i === 0) {
      defaultCategory = category
    }

    if (category.ref === ref) {
      this.currMap = category.maps[0]
      this.currCategory = category
      return
    }

    for (var j = 0; j < category.maps.length; j++) {
      map = category.maps[j]
      if (i === 0 && j === 0) {
        defaultMap = map
      }

      if (map.ref === ref) {
        this.currMap = map
        this.currCategory = category
        return
      }
    }
  }

  this.currMap = defaultMap
  this.currCategory = defaultCategory
}

module.exports = Maps

},{"./maps.json":6}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = require('./handlebars/base');

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = require('./handlebars/safe-string');

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = require('./handlebars/exception');

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars/base":10,"./handlebars/exception":13,"./handlebars/no-conflict":23,"./handlebars/runtime":24,"./handlebars/safe-string":25,"./handlebars/utils":26}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _helpers = require('./helpers');

var _decorators = require('./decorators');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var VERSION = '4.0.5';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];


},{"./decorators":11,"./exception":13,"./helpers":14,"./logger":22,"./utils":26}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = require('./decorators/inline');

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}


},{"./decorators/inline":12}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];


},{"../utils":26}],13:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];


},{}],14:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = require('./helpers/block-helper-missing');

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = require('./helpers/each');

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = require('./helpers/helper-missing');

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = require('./helpers/if');

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = require('./helpers/log');

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = require('./helpers/lookup');

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = require('./helpers/with');

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}


},{"./helpers/block-helper-missing":15,"./helpers/each":16,"./helpers/helper-missing":17,"./helpers/if":18,"./helpers/log":19,"./helpers/lookup":20,"./helpers/with":21}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];


},{"../utils":26}],16:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];


},{"../exception":13,"../utils":26}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];


},{"../exception":13}],18:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];


},{"../utils":26}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];


},{}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];


},{}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];


},{"../utils":26}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];


},{"./utils":26}],23:[function(require,module,exports){
(function (global){
/* global window */
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _base = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context !== options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context !== depths[0]) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    options.data = _base.createFrame(options.data);
    partialBlock = options.data['partial-block'] = options.fn;

    if (partialBlock.partials) {
      options.partials = Utils.extend({}, options.partials, partialBlock.partials);
    }
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}


},{"./base":10,"./exception":13,"./utils":26}],25:[function(require,module,exports){
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];


},{}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}


},{}],27:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":9}],28:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":27}],29:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v2.2.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-02-22T19:11Z
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
var arr = [];

var document = window.document;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "2.2.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
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
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
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

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isPlainObject: function( obj ) {

		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {

			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf( "use strict" ) === 1 ) {
				script = document.createElement( "script" );
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {

				// Otherwise, avoid the DOM node creation, insertion
				// and removal by using an indirect global eval

				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
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

	// Support: Android<4.1
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
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
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
		var tmp, args, proxy;

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

	now: Date.now,

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
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
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
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
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
			len = this.length,
			ret = [],
			self = this;

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

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
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

					// Option to run scripts is true for back-compat
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

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {

						// Inject the element directly into the jQuery object
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
			return root.ready !== undefined ?
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

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
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

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
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
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
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
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
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
				locked = queue = [];
				if ( !memory ) {
					list = memory = "";
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

		// Add listeners to Deferred subordinates; treat others as resolved
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

		// If we're not waiting on anything, resolve the master
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
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE9-10 only
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
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
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	register: function( owner, initial ) {
		var value = initial || {};

		// If it is a node unlikely to be stringify-ed or looped over
		// use plain assignment
		if ( owner.nodeType ) {
			owner[ this.expando ] = value;

		// Otherwise secure it in a non-enumerable, non-writable property
		// configurability must be true to allow the property to be
		// deleted with the delete operator
		} else {
			Object.defineProperty( owner, this.expando, {
				value: value,
				writable: true,
				configurable: true
			} );
		}
		return owner[ this.expando ];
	},
	cache: function( owner ) {

		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return an empty object.
		if ( !acceptData( owner ) ) {
			return {};
		}

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ prop ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :
			owner[ this.expando ] && owner[ this.expando ][ key ];
	},
	access: function( owner, key, value ) {
		var stored;

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase( key ) );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key === undefined ) {
			this.register( owner );

		} else {

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );

				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;

			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <= 35-45+
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://code.google.com/p/chromium/issues/detail?id=378607
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
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
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
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
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data, camelKey;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// with the key as-is
				data = dataUser.get( elem, key ) ||

					// Try to find dashed key if it exists (gh-2779)
					// This is for 2.2.x only
					dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

				if ( data !== undefined ) {
					return data;
				}

				camelKey = jQuery.camelCase( key );

				// Attempt to get data from the cache
				// with the key camelized
				data = dataUser.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			camelKey = jQuery.camelCase( key );
			this.each( function() {

				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = dataUser.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				dataUser.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
					dataUser.set( this, key, value );
				}
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
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

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
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

				// Ensure a hooks for this queue
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
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
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
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE9
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE9-11+
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

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
		tmp = getAll( fragment.appendChild( elem ), "script" );

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

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0-4.3, Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
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

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

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
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
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

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
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

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

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

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
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

			for ( ; cur !== this; cur = cur.parentNode || this ) {

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
		props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
			"screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

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

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
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

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
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
					this.focus();
					return false;
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
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
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
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
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

				// Support: Android<4.0
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

		if ( e ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e ) {
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
	}
} );


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

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
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
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
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
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
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
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
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
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

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
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

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
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
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
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
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
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

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
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
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
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
			doc = iframe[ 0 ].contentDocument;

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

var getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

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
	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {
		div.style.cssText =

			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );
	}

	jQuery.extend( support, {
		pixelPosition: function() {

			// This test is executed only once but we still do memoizing
			// since we can use the boxSizingReliable pre-computing.
			// No need to check if the test was already performed, though.
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
			// since that compresses better and they're computed together anyway.
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		},
		reliableMarginRight: function() {

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// This support function is only executed once so no memoizing is needed.
			var ret,
				marginDiv = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			marginDiv.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;box-sizing:content-box;" +
				"display:block;margin:0;border:0;padding:0";
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			documentElement.appendChild( container );

			ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

			documentElement.removeChild( container );
			div.removeChild( marginDiv );

			return ret;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );
	ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

	// Support: Opera 12.1x only
	// Fall back to style even without computed
	// computed is undefined for elems on document fragments
	if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
		ret = jQuery.style( elem, name );
	}

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
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

	return ret !== undefined ?

		// Support: IE9-11+
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
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

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
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

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
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
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Support: IE11 only
	// In IE 11 fullscreen elements inside of an iframe have
	// 100x too small dimensions (gh-1764).
	if ( document.msFullscreenElement && window.top !== window ) {

		// Support: IE11 only
		// Running getBoundingClientRect on a disconnected node
		// in IE throws an error.
		if ( elem.getClientRects().length ) {
			val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
		}
	}

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
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

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
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

		values[ index ] = dataPriv.get( elem, "olddisplay" );
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
				values[ index ] = dataPriv.access(
					elem,
					"olddisplay",
					defaultDisplay( elem.nodeName )
				);
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				dataPriv.set(
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
		"float": "cssFloat"
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

		// Gets hook for the prefixed version, then unprefixed version
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

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
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
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
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

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
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

				// Assumes a single number if not a string
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

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
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

// Support: IE9
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
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
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

			// We're done with this property
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
		dataShow = dataPriv.get( elem, "fxshow" );

	// Handle queue: false promises
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

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
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
			dataShow = dataPriv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
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

			dataPriv.remove( elem, "fxshow" );
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

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
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

			// Don't match elem in the :animated selector
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

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
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

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
		opt.duration : opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
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

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
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
				data = dataPriv.get( this );

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

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
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
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
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
		i = 0,
		timers = jQuery.timers;

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
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

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
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
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
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
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
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

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
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
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

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
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




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
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

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
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
						elem.setAttribute( "class", finalValue );
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

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
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




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// Handle most common string cases
					ret.replace( rreturn, "" ) :

					// Handle cases where value is null/undef or number
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

				// Support: IE<11
				// option.value not trimmed (#14858)
				return jQuery.trim( elem.value );
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

					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled : option.getAttribute( "disabled" ) === null ) &&
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
					if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
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




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
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
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
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

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
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
				// But now, this "simulate" function is used only for events
				// for which stopPropagation() is noop, so there is no need for that anymore.
				//
				// For the 1.x branch though, guard for "click" and "submit"
				// events is still used, but was moved to jQuery.event.stopPropagation function
				// because `originalEvent` should point to the original event for the constancy
				// with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}

} );

jQuery.fn.extend( {

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




support.focusin = "onfocusin" in window;


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
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

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

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

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
				if ( dataType[ 0 ] === "+" ) {
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
	var key, deep,
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

	var ct, type, finalDataType, firstDataType,
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
					if ( conv && s.throws ) {
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
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
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

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

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
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE8-11+
			// IE throws exception if url is malformed, e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE8-11+
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
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

		// Aborting is no longer a cancellation
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

				// Extract error from statusText and normalize for non-aborts
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

		// Shift arguments if data argument was omitted
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
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
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


jQuery.expr.filters.hidden = function( elem ) {
	return !jQuery.expr.filters.visible( elem );
};
jQuery.expr.filters.visible = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	// Use OR instead of AND as the element is not visible if either is true
	// See tickets #10406 and #13132
	return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
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

			// Use .is( ":disabled" ) so that fieldset[disabled] works
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


jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

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
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE9
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE9
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




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

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
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

		// Force json dataType
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

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
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




// Support: Safari 8+
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
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

	// Stop scripts or inline event handlers from being executed immediately
	// by using document.implementation
	context = context || ( support.createHTMLDocument ?
		document.implementation.createHTMLDocument( "" ) :
		document );

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
		selector = jQuery.trim( url.slice( off ) );
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
				callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
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
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
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
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		box = elem.getBoundingClientRect();
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
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
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
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

		// Margin is only for outerHeight, outerWidth
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
	},
	size: function() {
		return this.length;
	}
} );

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

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

},{}],30:[function(require,module,exports){
(function (global){
// OpenLayers 3. See http://openlayers.org/
// License: https://raw.githubusercontent.com/openlayers/ol3/master/LICENSE.md
// Version: v3.14.0

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
  var l,aa=this;function ba(a){return void 0!==a}function u(a,c,d){a=a.split(".");d=d||aa;a[0]in d||!d.execScript||d.execScript("var "+a[0]);for(var e;a.length&&(e=a.shift());)!a.length&&ba(c)?d[e]=c:d[e]?d=d[e]:d=d[e]={}}function ca(a){a.Zb=function(){return a.Jg?a.Jg:a.Jg=new a}}
function fa(a){var c=typeof a;if("object"==c)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return c;var d=Object.prototype.toString.call(a);if("[object Window]"==d)return"object";if("[object Array]"==d||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==d||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==c&&"undefined"==typeof a.call)return"object";return c}function ga(a){return"array"==fa(a)}function ha(a){var c=fa(a);return"array"==c||"object"==c&&"number"==typeof a.length}function ia(a){return"string"==typeof a}function ja(a){return"number"==typeof a}function ka(a){return"function"==fa(a)}function la(a){var c=typeof a;return"object"==c&&null!=a||"function"==c}function x(a){return a[ma]||(a[ma]=++na)}var ma="closure_uid_"+(1E9*Math.random()>>>0),na=0;
function oa(a,c,d){return a.call.apply(a.bind,arguments)}function pa(a,c,d){if(!a)throw Error();if(2<arguments.length){var e=Array.prototype.slice.call(arguments,2);return function(){var d=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(d,e);return a.apply(c,d)}}return function(){return a.apply(c,arguments)}}function qa(a,c,d){qa=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?oa:pa;return qa.apply(null,arguments)}
function ra(a,c){var d=Array.prototype.slice.call(arguments,1);return function(){var c=d.slice();c.push.apply(c,arguments);return a.apply(this,c)}}var sa=Date.now||function(){return+new Date};function y(a,c){function d(){}d.prototype=c.prototype;a.ia=c.prototype;a.prototype=new d;a.prototype.constructor=a;a.gp=function(a,d,g){for(var h=Array(arguments.length-2),k=2;k<arguments.length;k++)h[k-2]=arguments[k];return c.prototype[d].apply(a,h)}};var ta,ua;function va(){};var wa;var xa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function ya(a){if(!za.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(Aa,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(Ba,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(Ca,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(Da,"&quot;"));-1!=a.indexOf("'")&&(a=a.replace(Ea,"&#39;"));-1!=a.indexOf("\x00")&&(a=a.replace(Fa,"&#0;"));return a}
var Aa=/&/g,Ba=/</g,Ca=/>/g,Da=/"/g,Ea=/'/g,Fa=/\x00/g,za=/[\x00&<>"']/,Ha=String.prototype.repeat?function(a,c){return a.repeat(c)}:function(a,c){return Array(c+1).join(a)};function Ia(a,c){var d=ba(c)?a.toFixed(c):String(a),e=d.indexOf(".");-1==e&&(e=d.length);return Ha("0",Math.max(0,2-e))+d}
function Ja(a,c){for(var d=0,e=xa(String(a)).split("."),f=xa(String(c)).split("."),g=Math.max(e.length,f.length),h=0;0==d&&h<g;h++){var k=e[h]||"",m=f[h]||"",n=RegExp("(\\d*)(\\D*)","g"),p=RegExp("(\\d*)(\\D*)","g");do{var q=n.exec(k)||["","",""],r=p.exec(m)||["","",""];if(0==q[0].length&&0==r[0].length)break;d=Ka(0==q[1].length?0:parseInt(q[1],10),0==r[1].length?0:parseInt(r[1],10))||Ka(0==q[2].length,0==r[2].length)||Ka(q[2],r[2])}while(0==d)}return d}function Ka(a,c){return a<c?-1:a>c?1:0};function La(a,c,d){return Math.min(Math.max(a,c),d)}var Ma=function(){var a;"cosh"in Math?a=Math.cosh:a=function(a){a=Math.exp(a);return(a+1/a)/2};return a}();function Na(a,c,d,e,f,g){var h=f-d,k=g-e;if(0!==h||0!==k){var m=((a-d)*h+(c-e)*k)/(h*h+k*k);1<m?(d=f,e=g):0<m&&(d+=h*m,e+=k*m)}return Pa(a,c,d,e)}function Pa(a,c,d,e){a=d-a;c=e-c;return a*a+c*c}function Qa(a){return a*Math.PI/180};function Ra(a){return function(c){if(c)return[La(c[0],a[0],a[2]),La(c[1],a[1],a[3])]}}function Sa(a){return a};function Ta(a,c){return a>c?1:a<c?-1:0}function Ua(a,c){return 0<=a.indexOf(c)}function Va(a,c,d){var e=a.length;if(a[0]<=c)return 0;if(!(c<=a[e-1]))if(0<d)for(d=1;d<e;++d){if(a[d]<c)return d-1}else if(0>d)for(d=1;d<e;++d){if(a[d]<=c)return d}else for(d=1;d<e;++d){if(a[d]==c)return d;if(a[d]<c)return a[d-1]-c<c-a[d]?d-1:d}return e-1}function Wa(a){return a.reduce(function(a,d){return ga(d)?a.concat(Wa(d)):a.concat(d)},[])}
function Xa(a,c){var d,e=ha(c)?c:[c],f=e.length;for(d=0;d<f;d++)a[a.length]=e[d]}function Ya(a,c){var d=a.indexOf(c),e=-1<d;e&&a.splice(d,1);return e}function Za(a,c){for(var d=a.length>>>0,e,f=0;f<d;f++)if(e=a[f],c(e,f,a))return e;return null}function bb(a,c){var d=a.length;if(d!==c.length)return!1;for(var e=0;e<d;e++)if(a[e]!==c[e])return!1;return!0}
function cb(a){var c=db,d=a.length,e=Array(a.length),f;for(f=0;f<d;f++)e[f]={index:f,value:a[f]};e.sort(function(a,d){return c(a.value,d.value)||a.index-d.index});for(f=0;f<a.length;f++)a[f]=e[f].value}function eb(a,c){var d;return a.every(function(e,f){d=f;return!c(e,f,a)})?-1:d};function fb(a){return function(c,d,e){if(void 0!==c)return c=Va(a,c,e),c=La(c+d,0,a.length-1),a[c]}}function gb(a,c,d){return function(e,f,g){if(void 0!==e)return e=Math.max(Math.floor(Math.log(c/e)/Math.log(a)+(0<g?0:0>g?1:.5))+f,0),void 0!==d&&(e=Math.min(e,d)),c/Math.pow(a,e)}};function hb(a){if(void 0!==a)return 0}function ib(a,c){if(void 0!==a)return a+c}function jb(a){var c=2*Math.PI/a;return function(a,e){if(void 0!==a)return a=Math.floor((a+e)/c+.5)*c}}function kb(){var a=Qa(5);return function(c,d){if(void 0!==c)return Math.abs(c+d)<=a?0:c+d}};function lb(a,c,d){this.center=a;this.resolution=c;this.rotation=d};var mb="function"===typeof Object.assign?Object.assign:function(a,c){if(void 0===a||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var d=Object(a),e=1,f=arguments.length;e<f;++e){var g=arguments[e];if(void 0!==g&&null!==g)for(var h in g)g.hasOwnProperty(h)&&(d[h]=g[h])}return d};function nb(a){for(var c in a)delete a[c]}function ob(a){var c=[],d;for(d in a)c.push(a[d]);return c}function pb(a){for(var c in a)return!1;return!c};var qb="olm_"+(1E4*Math.random()|0);function rb(a){function c(c){c=a.listener.call(a.dg,c);a.fg&&sb(a);return c}return a.eg=c}function tb(a,c,d,e){for(var f,g=0,h=a.length;g<h;++g)if(f=a[g],f.listener===c&&f.dg===d)return e&&(f.deleteIndex=g),f}function ub(a,c){var d=a[qb];return d?d[c]:void 0}function vb(a){var c=a[qb];c||(c=a[qb]={});return c}
function wb(a,c){var d=ub(a,c);if(d){for(var e=0,f=d.length;e<f;++e)a.removeEventListener(c,d[e].eg),nb(d[e]);d.length=0;if(d=a[qb])delete d[c],0===Object.keys(d).length&&delete a[qb]}}function D(a,c,d,e,f){var g=vb(a),h=g[c];h||(h=g[c]=[]);(g=tb(h,d,e,!1))?f||(g.fg=!1):(g={dg:e,fg:!!f,listener:d,target:a,type:c},a.addEventListener(c,rb(g)),h.push(g));return g}function xb(a,c,d,e){return D(a,c,d,e,!0)}function yb(a,c,d,e){(a=ub(a,c))&&(d=tb(a,d,e,!0))&&sb(d)}
function sb(a){if(a&&a.target){a.target.removeEventListener(a.type,a.eg);var c=ub(a.target,a.type);if(c){var d="deleteIndex"in a?a.deleteIndex:c.indexOf(a);-1!==d&&c.splice(d,1);0===c.length&&wb(a.target,a.type)}nb(a)}};function zb(){0!=Ab&&(Bb[x(this)]=this);this.Ga=this.Ga;this.ua=this.ua}var Ab=0,Bb={};zb.prototype.Ga=!1;zb.prototype.Rd=function(){if(!this.Ga&&(this.Ga=!0,this.fa(),0!=Ab)){var a=x(this);delete Bb[a]}};function Cb(a,c){a.Ga?c.call(void 0):(a.ua||(a.ua=[]),a.ua.push(ba(void 0)?qa(c,void 0):c))}zb.prototype.fa=function(){if(this.ua)for(;this.ua.length;)this.ua.shift()()};function Db(a){a&&"function"==typeof a.Rd&&a.Rd()};function Eb(a,c){this.type=a;this.target=c}Eb.prototype.preventDefault=Eb.prototype.stopPropagation=function(){this.Jn=!0};function Fb(a){a.stopPropagation()}function Gb(a){a.preventDefault()};function Hb(){zb.call(this);this.ta={}}y(Hb,zb);Hb.prototype.addEventListener=function(a,c){var d=this.ta[a];d||(d=this.ta[a]=[]);-1===d.indexOf(c)&&d.unshift(c)};Hb.prototype.b=function(a){a="string"===typeof a?new Eb(a):a;var c=a.type;a.target=this;if(c=this.ta[c])for(var d=c.length-1;0<=d;--d)if(!1===c[d].call(this,a)||a.Jn)return!1};Hb.prototype.fa=function(){var a=vb(this),c;for(c in a)wb(this,c);Hb.ia.fa.call(this)};function Ib(a,c){return c?c in a.ta:0<Object.keys(a.ta).length}
Hb.prototype.removeEventListener=function(a,c){var d=this.ta[a];d&&(d.splice(d.indexOf(c),1),0===d.length&&delete this.ta[a])};function Jb(){Hb.call(this);this.g=0}y(Jb,Hb);function Kb(a){if(Array.isArray(a))for(var c=0,d=a.length;c<d;++c)sb(a[c]);else sb(a)}l=Jb.prototype;l.u=function(){++this.g;this.b("change")};l.L=function(){return this.g};l.I=function(a,c,d){if(Array.isArray(a)){for(var e=a.length,f=Array(e),g=0;g<e;++g)f[g]=D(this,a[g],c,d);return f}return D(this,a,c,d)};l.M=function(a,c,d){if(Array.isArray(a)){for(var e=a.length,f=Array(e),g=0;g<e;++g)f[g]=xb(this,a[g],c,d);return f}return xb(this,a,c,d)};
l.K=function(a,c,d){if(Array.isArray(a))for(var e=0,f=a.length;e<f;++e)yb(this,a[e],c,d);else yb(this,a,c,d)};l.N=Kb;function Lb(a,c,d){Eb.call(this,a);this.key=c;this.oldValue=d}y(Lb,Eb);function Mb(a){Jb.call(this);x(this);this.T={};void 0!==a&&this.C(a)}y(Mb,Jb);var Nb={};function Ob(a){return Nb.hasOwnProperty(a)?Nb[a]:Nb[a]="change:"+a}l=Mb.prototype;l.get=function(a){var c;this.T.hasOwnProperty(a)&&(c=this.T[a]);return c};l.O=function(){return Object.keys(this.T)};l.P=function(){return mb({},this.T)};function Pb(a,c,d){var e;e=Ob(c);a.b(new Lb(e,c,d));a.b(new Lb("propertychange",c,d))}
l.set=function(a,c,d){d?this.T[a]=c:(d=this.T[a],this.T[a]=c,d!==c&&Pb(this,a,d))};l.C=function(a,c){for(var d in a)this.set(d,a[d],c)};l.R=function(a,c){if(a in this.T){var d=this.T[a];delete this.T[a];c||Pb(this,a,d)}};function Qb(a,c,d){void 0===d&&(d=[0,0]);d[0]=a[0]+2*c;d[1]=a[1]+2*c;return d}function Rb(a,c,d){void 0===d&&(d=[0,0]);d[0]=a[0]*c+.5|0;d[1]=a[1]*c+.5|0;return d}function Sb(a,c){if(ga(a))return a;void 0===c?c=[a,a]:(c[0]=a,c[1]=a);return c};var Tb=Array.prototype,Ub=Tb.indexOf?function(a,c,d){return Tb.indexOf.call(a,c,d)}:function(a,c,d){d=null==d?0:0>d?Math.max(0,a.length+d):d;if(ia(a))return ia(c)&&1==c.length?a.indexOf(c,d):-1;for(;d<a.length;d++)if(d in a&&a[d]===c)return d;return-1},Vb=Tb.forEach?function(a,c,d){Tb.forEach.call(a,c,d)}:function(a,c,d){for(var e=a.length,f=ia(a)?a.split(""):a,g=0;g<e;g++)g in f&&c.call(d,f[g],g,a)},Wb=Tb.filter?function(a,c,d){return Tb.filter.call(a,c,d)}:function(a,c,d){for(var e=a.length,f=[],
g=0,h=ia(a)?a.split(""):a,k=0;k<e;k++)if(k in h){var m=h[k];c.call(d,m,k,a)&&(f[g++]=m)}return f};function Xb(a){return Tb.concat.apply(Tb,arguments)}function Yb(a){var c=a.length;if(0<c){for(var d=Array(c),e=0;e<c;e++)d[e]=a[e];return d}return[]}function Zb(a,c,d){return 2>=arguments.length?Tb.slice.call(a,c):Tb.slice.call(a,c,d)};function $b(a,c){var d=a%c;return 0>d*c?d+c:d}function ac(a,c,d){return a+d*(c-a)};function bc(a,c){a[0]+=c[0];a[1]+=c[1];return a}function cc(a,c){var d=a[0],e=a[1],f=c[0],g=c[1],h=f[0],f=f[1],k=g[0],g=g[1],m=k-h,n=g-f,d=0===m&&0===n?0:(m*(d-h)+n*(e-f))/(m*m+n*n||0);0>=d||(1<=d?(h=k,f=g):(h+=d*m,f+=d*n));return[h,f]}function dc(a,c,d){a=$b(a+180,360)-180;var e=Math.abs(3600*a);d=d||0;return Math.floor(e/3600)+"\u00b0 "+Ia(Math.floor(e/60%60))+"\u2032 "+Ia(e%60,d)+"\u2033 "+c.charAt(0>a?1:0)}
function ec(a,c,d){return a?c.replace("{x}",a[0].toFixed(d)).replace("{y}",a[1].toFixed(d)):""}function fc(a,c){for(var d=!0,e=a.length-1;0<=e;--e)if(a[e]!=c[e]){d=!1;break}return d}function gc(a,c){var d=Math.cos(c),e=Math.sin(c),f=a[1]*d+a[0]*e;a[0]=a[0]*d-a[1]*e;a[1]=f;return a}function hc(a,c){var d=a[0]-c[0],e=a[1]-c[1];return d*d+e*e}function ic(a,c){return hc(a,cc(a,c))}function jc(a,c){return ec(a,"{x}, {y}",c)};function kc(a){this.length=a.length||a;for(var c=0;c<this.length;c++)this[c]=a[c]||0}kc.prototype.b=4;kc.prototype.set=function(a,c){c=c||0;for(var d=0;d<a.length&&c+d<this.length;d++)this[c+d]=a[d]};kc.prototype.toString=Array.prototype.join;"undefined"==typeof Float32Array&&(kc.BYTES_PER_ELEMENT=4,kc.prototype.BYTES_PER_ELEMENT=kc.prototype.b,kc.prototype.set=kc.prototype.set,kc.prototype.toString=kc.prototype.toString,u("Float32Array",kc,void 0));function lc(a){this.length=a.length||a;for(var c=0;c<this.length;c++)this[c]=a[c]||0}lc.prototype.b=8;lc.prototype.set=function(a,c){c=c||0;for(var d=0;d<a.length&&c+d<this.length;d++)this[c+d]=a[d]};lc.prototype.toString=Array.prototype.join;if("undefined"==typeof Float64Array){try{lc.BYTES_PER_ELEMENT=8}catch(a){}lc.prototype.BYTES_PER_ELEMENT=lc.prototype.b;lc.prototype.set=lc.prototype.set;lc.prototype.toString=lc.prototype.toString;u("Float64Array",lc,void 0)};function mc(a,c,d,e,f){a[0]=c;a[1]=d;a[2]=e;a[3]=f};function nc(){var a=Array(16);oc(a,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);return a}function pc(){var a=Array(16);oc(a,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);return a}function oc(a,c,d,e,f,g,h,k,m,n,p,q,r,t,v,w,A){a[0]=c;a[1]=d;a[2]=e;a[3]=f;a[4]=g;a[5]=h;a[6]=k;a[7]=m;a[8]=n;a[9]=p;a[10]=q;a[11]=r;a[12]=t;a[13]=v;a[14]=w;a[15]=A}
function qc(a,c){a[0]=c[0];a[1]=c[1];a[2]=c[2];a[3]=c[3];a[4]=c[4];a[5]=c[5];a[6]=c[6];a[7]=c[7];a[8]=c[8];a[9]=c[9];a[10]=c[10];a[11]=c[11];a[12]=c[12];a[13]=c[13];a[14]=c[14];a[15]=c[15]}function rc(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1}
function sc(a,c,d){var e=a[0],f=a[1],g=a[2],h=a[3],k=a[4],m=a[5],n=a[6],p=a[7],q=a[8],r=a[9],t=a[10],v=a[11],w=a[12],A=a[13],B=a[14];a=a[15];var z=c[0],C=c[1],O=c[2],I=c[3],K=c[4],P=c[5],da=c[6],J=c[7],ea=c[8],Ga=c[9],$a=c[10],ab=c[11],Oa=c[12],Ec=c[13],Uc=c[14];c=c[15];d[0]=e*z+k*C+q*O+w*I;d[1]=f*z+m*C+r*O+A*I;d[2]=g*z+n*C+t*O+B*I;d[3]=h*z+p*C+v*O+a*I;d[4]=e*K+k*P+q*da+w*J;d[5]=f*K+m*P+r*da+A*J;d[6]=g*K+n*P+t*da+B*J;d[7]=h*K+p*P+v*da+a*J;d[8]=e*ea+k*Ga+q*$a+w*ab;d[9]=f*ea+m*Ga+r*$a+A*ab;d[10]=g*
ea+n*Ga+t*$a+B*ab;d[11]=h*ea+p*Ga+v*$a+a*ab;d[12]=e*Oa+k*Ec+q*Uc+w*c;d[13]=f*Oa+m*Ec+r*Uc+A*c;d[14]=g*Oa+n*Ec+t*Uc+B*c;d[15]=h*Oa+p*Ec+v*Uc+a*c}
function tc(a,c){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],k=a[5],m=a[6],n=a[7],p=a[8],q=a[9],r=a[10],t=a[11],v=a[12],w=a[13],A=a[14],B=a[15],z=d*k-e*h,C=d*m-f*h,O=d*n-g*h,I=e*m-f*k,K=e*n-g*k,P=f*n-g*m,da=p*w-q*v,J=p*A-r*v,ea=p*B-t*v,Ga=q*A-r*w,$a=q*B-t*w,ab=r*B-t*A,Oa=z*ab-C*$a+O*Ga+I*ea-K*J+P*da;0!=Oa&&(Oa=1/Oa,c[0]=(k*ab-m*$a+n*Ga)*Oa,c[1]=(-e*ab+f*$a-g*Ga)*Oa,c[2]=(w*P-A*K+B*I)*Oa,c[3]=(-q*P+r*K-t*I)*Oa,c[4]=(-h*ab+m*ea-n*J)*Oa,c[5]=(d*ab-f*ea+g*J)*Oa,c[6]=(-v*P+A*O-B*C)*Oa,c[7]=(p*P-r*O+t*C)*Oa,
c[8]=(h*$a-k*ea+n*da)*Oa,c[9]=(-d*$a+e*ea-g*da)*Oa,c[10]=(v*K-w*O+B*z)*Oa,c[11]=(-p*K+q*O-t*z)*Oa,c[12]=(-h*Ga+k*J-m*da)*Oa,c[13]=(d*Ga-e*J+f*da)*Oa,c[14]=(-v*I+w*C-A*z)*Oa,c[15]=(p*I-q*C+r*z)*Oa)}function uc(a,c,d){var e=a[1]*c+a[5]*d+0*a[9]+a[13],f=a[2]*c+a[6]*d+0*a[10]+a[14],g=a[3]*c+a[7]*d+0*a[11]+a[15];a[12]=a[0]*c+a[4]*d+0*a[8]+a[12];a[13]=e;a[14]=f;a[15]=g}
function vc(a,c,d){oc(a,a[0]*c,a[1]*c,a[2]*c,a[3]*c,a[4]*d,a[5]*d,a[6]*d,a[7]*d,1*a[8],1*a[9],1*a[10],1*a[11],a[12],a[13],a[14],a[15])}function wc(a,c){var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],k=a[5],m=a[6],n=a[7],p=Math.cos(c),q=Math.sin(c);a[0]=d*p+h*q;a[1]=e*p+k*q;a[2]=f*p+m*q;a[3]=g*p+n*q;a[4]=d*-q+h*p;a[5]=e*-q+k*p;a[6]=f*-q+m*p;a[7]=g*-q+n*p}new Float64Array(3);new Float64Array(3);new Float64Array(4);new Float64Array(4);new Float64Array(4);new Float64Array(16);function xc(a){for(var c=yc(),d=0,e=a.length;d<e;++d)zc(c,a[d]);return c}function Ac(a,c,d){return d?(d[0]=a[0]-c,d[1]=a[1]-c,d[2]=a[2]+c,d[3]=a[3]+c,d):[a[0]-c,a[1]-c,a[2]+c,a[3]+c]}function Bc(a,c){return c?(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c):a.slice()}function Cc(a,c,d){c=c<a[0]?a[0]-c:a[2]<c?c-a[2]:0;a=d<a[1]?a[1]-d:a[3]<d?d-a[3]:0;return c*c+a*a}function Dc(a,c){return Fc(a,c[0],c[1])}function Gc(a,c){return a[0]<=c[0]&&c[2]<=a[2]&&a[1]<=c[1]&&c[3]<=a[3]}
function Fc(a,c,d){return a[0]<=c&&c<=a[2]&&a[1]<=d&&d<=a[3]}function Hc(a,c){var d=a[1],e=a[2],f=a[3],g=c[0],h=c[1],k=0;g<a[0]?k=k|16:g>e&&(k=k|4);h<d?k|=8:h>f&&(k|=2);0===k&&(k=1);return k}function yc(){return[Infinity,Infinity,-Infinity,-Infinity]}function Ic(a,c,d,e,f){return f?(f[0]=a,f[1]=c,f[2]=d,f[3]=e,f):[a,c,d,e]}function Jc(a,c){var d=a[0],e=a[1];return Ic(d,e,d,e,c)}function Kc(a,c,d,e,f){f=Ic(Infinity,Infinity,-Infinity,-Infinity,f);return Lc(f,a,c,d,e)}
function Mc(a,c){return a[0]==c[0]&&a[2]==c[2]&&a[1]==c[1]&&a[3]==c[3]}function Nc(a,c){c[0]<a[0]&&(a[0]=c[0]);c[2]>a[2]&&(a[2]=c[2]);c[1]<a[1]&&(a[1]=c[1]);c[3]>a[3]&&(a[3]=c[3]);return a}function zc(a,c){c[0]<a[0]&&(a[0]=c[0]);c[0]>a[2]&&(a[2]=c[0]);c[1]<a[1]&&(a[1]=c[1]);c[1]>a[3]&&(a[3]=c[1])}function Lc(a,c,d,e,f){for(;d<e;d+=f){var g=a,h=c[d],k=c[d+1];g[0]=Math.min(g[0],h);g[1]=Math.min(g[1],k);g[2]=Math.max(g[2],h);g[3]=Math.max(g[3],k)}return a}
function Oc(a,c,d){var e;return(e=c.call(d,Pc(a)))||(e=c.call(d,Qc(a)))||(e=c.call(d,Rc(a)))?e:(e=c.call(d,Sc(a)))?e:!1}function Tc(a){var c=0;Vc(a)||(c=Wc(a)*Xc(a));return c}function Pc(a){return[a[0],a[1]]}function Qc(a){return[a[2],a[1]]}function Yc(a){return[(a[0]+a[2])/2,(a[1]+a[3])/2]}
function Zc(a,c,d,e,f){var g=c*e[0]/2;e=c*e[1]/2;c=Math.cos(d);var h=Math.sin(d);d=g*c;g*=h;c*=e;var k=e*h,m=a[0],n=a[1];a=m-d+k;e=m-d-k;h=m+d-k;d=m+d+k;var k=n-g-c,m=n-g+c,p=n+g+c,g=n+g-c;return Ic(Math.min(a,e,h,d),Math.min(k,m,p,g),Math.max(a,e,h,d),Math.max(k,m,p,g),f)}function Xc(a){return a[3]-a[1]}function $c(a,c,d){d=d?d:yc();ad(a,c)&&(d[0]=a[0]>c[0]?a[0]:c[0],d[1]=a[1]>c[1]?a[1]:c[1],d[2]=a[2]<c[2]?a[2]:c[2],d[3]=a[3]<c[3]?a[3]:c[3]);return d}function Sc(a){return[a[0],a[3]]}
function Rc(a){return[a[2],a[3]]}function Wc(a){return a[2]-a[0]}function ad(a,c){return a[0]<=c[2]&&a[2]>=c[0]&&a[1]<=c[3]&&a[3]>=c[1]}function Vc(a){return a[2]<a[0]||a[3]<a[1]}function bd(a,c){var d=(a[2]-a[0])/2*(c-1),e=(a[3]-a[1])/2*(c-1);a[0]-=d;a[2]+=d;a[1]-=e;a[3]+=e}
function cd(a,c,d){a=[a[0],a[1],a[0],a[3],a[2],a[1],a[2],a[3]];c(a,a,2);var e=[a[0],a[2],a[4],a[6]],f=[a[1],a[3],a[5],a[7]];c=Math.min.apply(null,e);a=Math.min.apply(null,f);e=Math.max.apply(null,e);f=Math.max.apply(null,f);return Ic(c,a,e,f,d)};function dd(a){return function(){return a}}var ed=dd(!1),fd=dd(!0),gd=dd(null);function hd(a){return a}function id(a){var c=arguments,d=c.length;return function(){for(var a,f=0;f<d;f++)a=c[f].apply(this,arguments);return a}}function jd(a){var c=arguments,d=c.length;return function(){for(var a=0;a<d;a++)if(!c[a].apply(this,arguments))return!1;return!0}};/*

 Latitude/longitude spherical geodesy formulae taken from
 http://www.movable-type.co.uk/scripts/latlong.html
 Licensed under CC-BY-3.0.
*/
function kd(a){this.radius=a}kd.prototype.a=function(a){for(var c=0,d=a.length,e=a[d-1][0],f=a[d-1][1],g=0;g<d;g++)var h=a[g][0],k=a[g][1],c=c+Qa(h-e)*(2+Math.sin(Qa(f))+Math.sin(Qa(k))),e=h,f=k;return c*this.radius*this.radius/2};kd.prototype.b=function(a,c){var d=Qa(a[1]),e=Qa(c[1]),f=(e-d)/2,g=Qa(c[0]-a[0])/2,d=Math.sin(f)*Math.sin(f)+Math.sin(g)*Math.sin(g)*Math.cos(d)*Math.cos(e);return 2*this.radius*Math.atan2(Math.sqrt(d),Math.sqrt(1-d))};
kd.prototype.offset=function(a,c,d){var e=Qa(a[1]);c/=this.radius;var f=Math.asin(Math.sin(e)*Math.cos(c)+Math.cos(e)*Math.sin(c)*Math.cos(d));return[180*(Qa(a[0])+Math.atan2(Math.sin(d)*Math.sin(c)*Math.cos(e),Math.cos(c)-Math.sin(e)*Math.sin(f)))/Math.PI,180*f/Math.PI]};var ld=new kd(6370997);var md={};md.degrees=2*Math.PI*ld.radius/360;md.ft=.3048;md.m=1;md["us-ft"]=1200/3937;
function nd(a){this.lb=a.code;this.a=a.units;this.c=void 0!==a.extent?a.extent:null;this.i=void 0!==a.worldExtent?a.worldExtent:null;this.f=void 0!==a.axisOrientation?a.axisOrientation:"enu";this.g=void 0!==a.global?a.global:!1;this.b=!(!this.g||!this.c);this.l=void 0!==a.getPointResolution?a.getPointResolution:this.Xj;this.j=null;this.o=a.metersPerUnit;var c=od,d=a.code,e=pd||aa.proj4;if("function"==typeof e&&void 0===c[d]){var f=e.defs(d);if(void 0!==f){void 0!==f.axis&&void 0===a.axisOrientation&&
(this.f=f.axis);void 0===a.metersPerUnit&&(this.o=f.to_meter);void 0===a.units&&(this.a=f.units);for(var g in c)c=e.defs(g),void 0!==c&&(a=qd(g),c===f?rd([a,this]):(c=e(g,d),sd(a,this,c.forward,c.inverse)))}}}l=nd.prototype;l.yj=function(){return this.lb};l.G=function(){return this.c};l.mm=function(){return this.a};l.$b=function(){return this.o||md[this.a]};l.hk=function(){return this.i};function td(a){return a.f}l.Tk=function(){return this.g};l.uo=function(a){this.g=a;this.b=!(!a||!this.c)};
l.nm=function(a){this.c=a;this.b=!(!this.g||!a)};l.Co=function(a){this.i=a};l.to=function(a){this.l=a};l.Xj=function(a,c){if("degrees"==this.a)return a;var d=ud(this,qd("EPSG:4326")),e=[c[0]-a/2,c[1],c[0]+a/2,c[1],c[0],c[1]-a/2,c[0],c[1]+a/2],e=d(e,e,2),d=ld.b(e.slice(0,2),e.slice(2,4)),e=ld.b(e.slice(4,6),e.slice(6,8)),e=(d+e)/2,d=this.$b();void 0!==d&&(e/=d);return e};l.getPointResolution=function(a,c){return this.l(a,c)};var od={},vd={},pd=null;
function rd(a){wd(a);a.forEach(function(c){a.forEach(function(a){c!==a&&xd(c,a,yd)})})}function zd(){var a=Ad,c=Bd,d=Cd;Dd.forEach(function(e){a.forEach(function(a){xd(e,a,c);xd(a,e,d)})})}function Ed(a){od[a.lb]=a;xd(a,a,yd)}function wd(a){var c=[];a.forEach(function(a){c.push(Ed(a))})}function Fd(a){return a?"string"===typeof a?qd(a):a:qd("EPSG:3857")}function xd(a,c,d){a=a.lb;c=c.lb;a in vd||(vd[a]={});vd[a][c]=d}function sd(a,c,d,e){a=qd(a);c=qd(c);xd(a,c,Gd(d));xd(c,a,Gd(e))}
function Gd(a){return function(c,d,e){var f=c.length;e=void 0!==e?e:2;d=void 0!==d?d:Array(f);var g,h;for(h=0;h<f;h+=e)for(g=a([c[h],c[h+1]]),d[h]=g[0],d[h+1]=g[1],g=e-1;2<=g;--g)d[h+g]=c[h+g];return d}}function qd(a){var c;if(a instanceof nd)c=a;else if("string"===typeof a){c=od[a];var d=pd||aa.proj4;void 0===c&&"function"==typeof d&&void 0!==d.defs(a)&&(c=new nd({code:a}),Ed(c))}else c=null;return c}function Hd(a,c){if(a===c)return!0;var d=a.a===c.a;return a.lb===c.lb?d:ud(a,c)===yd&&d}
function Id(a,c){var d=qd(a),e=qd(c);return ud(d,e)}function ud(a,c){var d=a.lb,e=c.lb,f;d in vd&&e in vd[d]&&(f=vd[d][e]);void 0===f&&(f=Jd);return f}function Jd(a,c){if(void 0!==c&&a!==c){for(var d=0,e=a.length;d<e;++d)c[d]=a[d];a=c}return a}function yd(a,c){var d;if(void 0!==c){d=0;for(var e=a.length;d<e;++d)c[d]=a[d];d=c}else d=a.slice();return d}function Kd(a,c,d){return Id(c,d)(a,void 0,a.length)}function Ld(a,c,d){c=Id(c,d);return cd(a,c)};function Md(){Mb.call(this);this.A=yc();this.B=-1;this.j={};this.s=this.l=0}y(Md,Mb);l=Md.prototype;l.vb=function(a,c){var d=c?c:[NaN,NaN];this.sb(a[0],a[1],d,Infinity);return d};l.ig=function(a){return this.xc(a[0],a[1])};l.xc=ed;l.G=function(a){this.B!=this.g&&(this.A=this.Pd(this.A),this.B=this.g);var c=this.A;a?(a[0]=c[0],a[1]=c[1],a[2]=c[2],a[3]=c[3]):a=c;return a};l.Bb=function(a){return this.sd(a*a)};l.fb=function(a,c){this.Hc(Id(a,c));return this};function Nd(a,c,d,e,f,g){var h=f[0],k=f[1],m=f[4],n=f[5],p=f[12];f=f[13];for(var q=g?g:[],r=0;c<d;c+=e){var t=a[c],v=a[c+1];q[r++]=h*t+m*v+p;q[r++]=k*t+n*v+f}g&&q.length!=r&&(q.length=r);return q};function Od(){Md.call(this);this.f="XY";this.a=2;this.v=null}y(Od,Md);function Pd(a){if("XY"==a)return 2;if("XYZ"==a||"XYM"==a)return 3;if("XYZM"==a)return 4}l=Od.prototype;l.xc=ed;l.Pd=function(a){return Kc(this.v,0,this.v.length,this.a,a)};l.Kb=function(){return this.v.slice(0,this.a)};l.ha=function(){return this.v};l.Lb=function(){return this.v.slice(this.v.length-this.a)};l.Mb=function(){return this.f};
l.sd=function(a){this.s!=this.g&&(nb(this.j),this.l=0,this.s=this.g);if(0>a||0!==this.l&&a<=this.l)return this;var c=a.toString();if(this.j.hasOwnProperty(c))return this.j[c];var d=this.Mc(a);if(d.ha().length<this.v.length)return this.j[c]=d;this.l=a;return this};l.Mc=function(){return this};l.qa=function(){return this.a};function Qd(a,c,d){a.a=Pd(c);a.f=c;a.v=d}
function Rd(a,c,d,e){if(c)d=Pd(c);else{for(c=0;c<e;++c){if(0===d.length){a.f="XY";a.a=2;return}d=d[0]}d=d.length;c=2==d?"XY":3==d?"XYZ":4==d?"XYZM":void 0}a.f=c;a.a=d}l.Hc=function(a){this.v&&(a(this.v,this.v,this.a),this.u())};l.Rc=function(a,c){var d=this.ha();if(d){var e=d.length,f=this.qa(),g=d?d:[],h=0,k,m;for(k=0;k<e;k+=f)for(g[h++]=d[k]+a,g[h++]=d[k+1]+c,m=k+2;m<k+f;++m)g[h++]=d[m];d&&g.length!=h&&(g.length=h);this.u()}};function Sd(a,c,d,e){for(var f=0,g=a[d-e],h=a[d-e+1];c<d;c+=e)var k=a[c],m=a[c+1],f=f+(h*k-g*m),g=k,h=m;return f/2}function Td(a,c,d,e){var f=0,g,h;g=0;for(h=d.length;g<h;++g){var k=d[g],f=f+Sd(a,c,k,e);c=k}return f};function Ud(a,c,d,e,f,g,h){var k=a[c],m=a[c+1],n=a[d]-k,p=a[d+1]-m;if(0!==n||0!==p)if(g=((f-k)*n+(g-m)*p)/(n*n+p*p),1<g)c=d;else if(0<g){for(f=0;f<e;++f)h[f]=ac(a[c+f],a[d+f],g);h.length=e;return}for(f=0;f<e;++f)h[f]=a[c+f];h.length=e}function Vd(a,c,d,e,f){var g=a[c],h=a[c+1];for(c+=e;c<d;c+=e){var k=a[c],m=a[c+1],g=Pa(g,h,k,m);g>f&&(f=g);g=k;h=m}return f}function Wd(a,c,d,e,f){var g,h;g=0;for(h=d.length;g<h;++g){var k=d[g];f=Vd(a,c,k,e,f);c=k}return f}
function Xd(a,c,d,e,f,g,h,k,m,n,p){if(c==d)return n;var q;if(0===f){q=Pa(h,k,a[c],a[c+1]);if(q<n){for(p=0;p<e;++p)m[p]=a[c+p];m.length=e;return q}return n}for(var r=p?p:[NaN,NaN],t=c+e;t<d;)if(Ud(a,t-e,t,e,h,k,r),q=Pa(h,k,r[0],r[1]),q<n){n=q;for(p=0;p<e;++p)m[p]=r[p];m.length=e;t+=e}else t+=e*Math.max((Math.sqrt(q)-Math.sqrt(n))/f|0,1);if(g&&(Ud(a,d-e,c,e,h,k,r),q=Pa(h,k,r[0],r[1]),q<n)){n=q;for(p=0;p<e;++p)m[p]=r[p];m.length=e}return n}
function Yd(a,c,d,e,f,g,h,k,m,n,p){p=p?p:[NaN,NaN];var q,r;q=0;for(r=d.length;q<r;++q){var t=d[q];n=Xd(a,c,t,e,f,g,h,k,m,n,p);c=t}return n};function Zd(a,c){var d=0,e,f;e=0;for(f=c.length;e<f;++e)a[d++]=c[e];return d}function $d(a,c,d,e){var f,g;f=0;for(g=d.length;f<g;++f){var h=d[f],k;for(k=0;k<e;++k)a[c++]=h[k]}return c}function ae(a,c,d,e,f){f=f?f:[];var g=0,h,k;h=0;for(k=d.length;h<k;++h)c=$d(a,c,d[h],e),f[g++]=c;f.length=g;return f};function be(a,c,d,e,f){f=void 0!==f?f:[];for(var g=0;c<d;c+=e)f[g++]=a.slice(c,c+e);f.length=g;return f}function ce(a,c,d,e,f){f=void 0!==f?f:[];var g=0,h,k;h=0;for(k=d.length;h<k;++h){var m=d[h];f[g++]=be(a,c,m,e,f[g]);c=m}f.length=g;return f};function de(a,c,d,e,f,g,h){var k=(d-c)/e;if(3>k){for(;c<d;c+=e)g[h++]=a[c],g[h++]=a[c+1];return h}var m=Array(k);m[0]=1;m[k-1]=1;d=[c,d-e];for(var n=0,p;0<d.length;){var q=d.pop(),r=d.pop(),t=0,v=a[r],w=a[r+1],A=a[q],B=a[q+1];for(p=r+e;p<q;p+=e){var z=Na(a[p],a[p+1],v,w,A,B);z>t&&(n=p,t=z)}t>f&&(m[(n-c)/e]=1,r+e<n&&d.push(r,n),n+e<q&&d.push(n,q))}for(p=0;p<k;++p)m[p]&&(g[h++]=a[c+p*e],g[h++]=a[c+p*e+1]);return h}
function ee(a,c,d,e,f,g,h,k){var m,n;m=0;for(n=d.length;m<n;++m){var p=d[m];a:{var q=a,r=p,t=e,v=f,w=g;if(c!=r){var A=v*Math.round(q[c]/v),B=v*Math.round(q[c+1]/v);c+=t;w[h++]=A;w[h++]=B;var z=void 0,C=void 0;do if(z=v*Math.round(q[c]/v),C=v*Math.round(q[c+1]/v),c+=t,c==r){w[h++]=z;w[h++]=C;break a}while(z==A&&C==B);for(;c<r;){var O,I;O=v*Math.round(q[c]/v);I=v*Math.round(q[c+1]/v);c+=t;if(O!=z||I!=C){var K=z-A,P=C-B,da=O-A,J=I-B;K*J==P*da&&(0>K&&da<K||K==da||0<K&&da>K)&&(0>P&&J<P||P==J||0<P&&J>P)||
(w[h++]=z,w[h++]=C,A=z,B=C);z=O;C=I}}w[h++]=z;w[h++]=C}}k.push(h);c=p}return h};function fe(a,c){Od.call(this);this.c=this.o=-1;this.la(a,c)}y(fe,Od);l=fe.prototype;l.clone=function(){var a=new fe(null);ge(a,this.f,this.v.slice());return a};l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;this.c!=this.g&&(this.o=Math.sqrt(Vd(this.v,0,this.v.length,this.a,0)),this.c=this.g);return Xd(this.v,0,this.v.length,this.a,this.o,!0,a,c,d,e)};l.Ol=function(){return Sd(this.v,0,this.v.length,this.a)};l.Y=function(){return be(this.v,0,this.v.length,this.a)};
l.Mc=function(a){var c=[];c.length=de(this.v,0,this.v.length,this.a,a,c,0);a=new fe(null);ge(a,"XY",c);return a};l.W=function(){return"LinearRing"};l.la=function(a,c){a?(Rd(this,c,a,1),this.v||(this.v=[]),this.v.length=$d(this.v,0,a,this.a),this.u()):ge(this,"XY",null)};function ge(a,c,d){Qd(a,c,d);a.u()};function E(a,c){Od.call(this);this.la(a,c)}y(E,Od);l=E.prototype;l.clone=function(){var a=new E(null);a.ba(this.f,this.v.slice());return a};l.sb=function(a,c,d,e){var f=this.v;a=Pa(a,c,f[0],f[1]);if(a<e){e=this.a;for(c=0;c<e;++c)d[c]=f[c];d.length=e;return a}return e};l.Y=function(){return this.v?this.v.slice():[]};l.Pd=function(a){return Jc(this.v,a)};l.W=function(){return"Point"};l.Ia=function(a){return Fc(a,this.v[0],this.v[1])};
l.la=function(a,c){a?(Rd(this,c,a,0),this.v||(this.v=[]),this.v.length=Zd(this.v,a),this.u()):this.ba("XY",null)};l.ba=function(a,c){Qd(this,a,c);this.u()};function he(a,c,d,e,f){return!Oc(f,function(f){return!ie(a,c,d,e,f[0],f[1])})}function ie(a,c,d,e,f,g){for(var h=!1,k=a[d-e],m=a[d-e+1];c<d;c+=e){var n=a[c],p=a[c+1];m>g!=p>g&&f<(n-k)*(g-m)/(p-m)+k&&(h=!h);k=n;m=p}return h}function je(a,c,d,e,f,g){if(0===d.length||!ie(a,c,d[0],e,f,g))return!1;var h;c=1;for(h=d.length;c<h;++c)if(ie(a,d[c-1],d[c],e,f,g))return!1;return!0};function ke(a,c,d,e,f,g,h){var k,m,n,p,q,r=f[g+1],t=[],v=d[0];n=a[v-e];q=a[v-e+1];for(k=c;k<v;k+=e){p=a[k];m=a[k+1];if(r<=q&&m<=r||q<=r&&r<=m)n=(r-q)/(m-q)*(p-n)+n,t.push(n);n=p;q=m}v=NaN;q=-Infinity;t.sort(Ta);n=t[0];k=1;for(m=t.length;k<m;++k){p=t[k];var w=Math.abs(p-n);w>q&&(n=(n+p)/2,je(a,c,d,e,n,r)&&(v=n,q=w));n=p}isNaN(v)&&(v=f[g]);return h?(h.push(v,r),h):[v,r]};function le(a,c,d,e,f,g){for(var h=[a[c],a[c+1]],k=[],m;c+e<d;c+=e){k[0]=a[c+e];k[1]=a[c+e+1];if(m=f.call(g,h,k))return m;h[0]=k[0];h[1]=k[1]}return!1};function me(a,c,d,e,f){var g=Lc(yc(),a,c,d,e);return ad(f,g)?Gc(f,g)||g[0]>=f[0]&&g[2]<=f[2]||g[1]>=f[1]&&g[3]<=f[3]?!0:le(a,c,d,e,function(a,c){var d=!1,e=Hc(f,a),g=Hc(f,c);if(1===e||1===g)d=!0;else{var q=f[0],r=f[1],t=f[2],v=f[3],w=c[0],A=c[1],B=(A-a[1])/(w-a[0]);g&2&&!(e&2)&&(d=w-(A-v)/B,d=d>=q&&d<=t);d||!(g&4)||e&4||(d=A-(w-t)*B,d=d>=r&&d<=v);d||!(g&8)||e&8||(d=w-(A-r)/B,d=d>=q&&d<=t);d||!(g&16)||e&16||(d=A-(w-q)*B,d=d>=r&&d<=v)}return d}):!1}
function ne(a,c,d,e,f){var g=d[0];if(!(me(a,c,g,e,f)||ie(a,c,g,e,f[0],f[1])||ie(a,c,g,e,f[0],f[3])||ie(a,c,g,e,f[2],f[1])||ie(a,c,g,e,f[2],f[3])))return!1;if(1===d.length)return!0;c=1;for(g=d.length;c<g;++c)if(he(a,d[c-1],d[c],e,f))return!1;return!0};function oe(a,c,d,e){for(var f=0,g=a[d-e],h=a[d-e+1];c<d;c+=e)var k=a[c],m=a[c+1],f=f+(k-g)*(m+h),g=k,h=m;return 0<f}function pe(a,c,d,e){var f=0;e=void 0!==e?e:!1;var g,h;g=0;for(h=c.length;g<h;++g){var k=c[g],f=oe(a,f,k,d);if(0===g){if(e&&f||!e&&!f)return!1}else if(e&&!f||!e&&f)return!1;f=k}return!0}
function qe(a,c,d,e,f){f=void 0!==f?f:!1;var g,h;g=0;for(h=d.length;g<h;++g){var k=d[g],m=oe(a,c,k,e);if(0===g?f&&m||!f&&!m:f&&!m||!f&&m)for(var m=a,n=k,p=e;c<n-p;){var q;for(q=0;q<p;++q){var r=m[c+q];m[c+q]=m[n-p+q];m[n-p+q]=r}c+=p;n-=p}c=k}return c}function re(a,c,d,e){var f=0,g,h;g=0;for(h=c.length;g<h;++g)f=qe(a,f,c[g],d,e);return f};function F(a,c){Od.call(this);this.c=[];this.J=-1;this.D=null;this.U=this.H=this.S=-1;this.o=null;this.la(a,c)}y(F,Od);l=F.prototype;l.fj=function(a){this.v?Xa(this.v,a.ha()):this.v=a.ha().slice();this.c.push(this.v.length);this.u()};l.clone=function(){var a=new F(null);a.ba(this.f,this.v.slice(),this.c.slice());return a};
l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;this.H!=this.g&&(this.S=Math.sqrt(Wd(this.v,0,this.c,this.a,0)),this.H=this.g);return Yd(this.v,0,this.c,this.a,this.S,!0,a,c,d,e)};l.xc=function(a,c){return je(this.Rb(),0,this.c,this.a,a,c)};l.Rl=function(){return Td(this.Rb(),0,this.c,this.a)};l.Y=function(a){var c;void 0!==a?(c=this.Rb().slice(),qe(c,0,this.c,this.a,a)):c=this.v;return ce(c,0,this.c,this.a)};l.Cb=function(){return this.c};
function se(a){if(a.J!=a.g){var c=Yc(a.G());a.D=ke(a.Rb(),0,a.c,a.a,c,0);a.J=a.g}return a.D}l.Hj=function(){return new E(se(this))};l.Mj=function(){return this.c.length};l.xg=function(a){if(0>a||this.c.length<=a)return null;var c=new fe(null);ge(c,this.f,this.v.slice(0===a?0:this.c[a-1],this.c[a]));return c};l.Vd=function(){var a=this.f,c=this.v,d=this.c,e=[],f=0,g,h;g=0;for(h=d.length;g<h;++g){var k=d[g],m=new fe(null);ge(m,a,c.slice(f,k));e.push(m);f=k}return e};
l.Rb=function(){if(this.U!=this.g){var a=this.v;pe(a,this.c,this.a)?this.o=a:(this.o=a.slice(),this.o.length=qe(this.o,0,this.c,this.a));this.U=this.g}return this.o};l.Mc=function(a){var c=[],d=[];c.length=ee(this.v,0,this.c,this.a,Math.sqrt(a),c,0,d);a=new F(null);a.ba("XY",c,d);return a};l.W=function(){return"Polygon"};l.Ia=function(a){return ne(this.Rb(),0,this.c,this.a,a)};
l.la=function(a,c){if(a){Rd(this,c,a,2);this.v||(this.v=[]);var d=ae(this.v,0,a,this.a,this.c);this.v.length=0===d.length?0:d[d.length-1];this.u()}else this.ba("XY",null,this.c)};l.ba=function(a,c,d){Qd(this,a,c);this.c=d;this.u()};function te(a,c,d,e){var f=e?e:32;e=[];var g;for(g=0;g<f;++g)Xa(e,a.offset(c,d,2*Math.PI*g/f));e.push(e[0],e[1]);a=new F(null);a.ba("XY",e,[e.length]);return a}
function ue(a){var c=a[0],d=a[1],e=a[2];a=a[3];c=[c,d,c,a,e,a,e,d,c,d];d=new F(null);d.ba("XY",c,[c.length]);return d}function ve(a,c,d){var e=c?c:32,f=a.qa();c=a.f;for(var g=new F(null,c),e=f*(e+1),f=Array(e),h=0;h<e;h++)f[h]=0;g.ba(c,f,[f.length]);we(g,a.vd(),a.nf(),d);return g}function we(a,c,d,e){var f=a.ha(),g=a.f,h=a.qa(),k=a.Cb(),m=f.length/h-1;e=e?e:0;for(var n,p,q=0;q<=m;++q)p=q*h,n=e+2*$b(q,m)*Math.PI/m,f[p]=c[0]+d*Math.cos(n),f[p+1]=c[1]+d*Math.sin(n);a.ba(g,f,k)};function xe(a){Mb.call(this);a=a||{};this.f=[0,0];var c={};c.center=void 0!==a.center?a.center:null;this.i=Fd(a.projection);var d,e,f,g=void 0!==a.minZoom?a.minZoom:0;d=void 0!==a.maxZoom?a.maxZoom:28;var h=void 0!==a.zoomFactor?a.zoomFactor:2;if(void 0!==a.resolutions)d=a.resolutions,e=d[0],f=d[d.length-1],d=fb(d);else{e=Fd(a.projection);f=e.G();var k=(f?Math.max(Wc(f),Xc(f)):360*md.degrees/e.$b())/256/Math.pow(2,0),m=k/Math.pow(2,28);e=a.maxResolution;void 0!==e?g=0:e=k/Math.pow(h,g);f=a.minResolution;
void 0===f&&(f=void 0!==a.maxZoom?void 0!==a.maxResolution?e/Math.pow(h,d):k/Math.pow(h,d):m);d=g+Math.floor(Math.log(e/f)/Math.log(h));f=e/Math.pow(h,d-g);d=gb(h,e,d-g)}this.a=e;this.l=f;this.c=g;g=void 0!==a.extent?Ra(a.extent):Sa;(void 0!==a.enableRotation?a.enableRotation:1)?(e=a.constrainRotation,e=void 0===e||!0===e?kb():!1===e?ib:ja(e)?jb(e):ib):e=hb;this.j=new lb(g,d,e);void 0!==a.resolution?c.resolution=a.resolution:void 0!==a.zoom&&(c.resolution=this.constrainResolution(this.a,a.zoom-this.c));
c.rotation=void 0!==a.rotation?a.rotation:0;this.C(c)}y(xe,Mb);l=xe.prototype;l.Qd=function(a){return this.j.center(a)};l.constrainResolution=function(a,c,d){return this.j.resolution(a,c||0,d||0)};l.constrainRotation=function(a,c){return this.j.rotation(a,c||0)};l.Wa=function(){return this.get("center")};l.bd=function(a){var c=this.Wa(),d=this.Z(),e=this.Ka();return Zc(c,d,e,a)};l.yl=function(){return this.i};l.Z=function(){return this.get("resolution")};
function ye(a){var c=a.a,d=Math.log(c/a.l)/Math.log(2);return function(a){return c/Math.pow(2,a*d)}}l.Ka=function(){return this.get("rotation")};function ze(a){var c=a.a,d=Math.log(c/a.l)/Math.log(2);return function(a){return Math.log(c/a)/Math.log(2)/d}}l.V=function(){var a=this.Wa(),c=this.i,d=this.Z(),e=this.Ka();return{center:[Math.round(a[0]/d)*d,Math.round(a[1]/d)*d],projection:void 0!==c?c:null,resolution:d,rotation:e}};
l.ik=function(){var a,c=this.Z();if(void 0!==c){var d,e=0;do{d=this.constrainResolution(this.a,e);if(d==c){a=e;break}++e}while(d>this.l)}return void 0!==a?this.c+a:a};
l.Ye=function(a,c,d){a instanceof Od||(a=ue(a));var e=d||{};d=void 0!==e.padding?e.padding:[0,0,0,0];var f=void 0!==e.constrainResolution?e.constrainResolution:!0,g=void 0!==e.nearest?e.nearest:!1,h;void 0!==e.minResolution?h=e.minResolution:void 0!==e.maxZoom?h=this.constrainResolution(this.a,e.maxZoom-this.c,0):h=0;var k=a.ha(),m=this.Ka(),e=Math.cos(-m),m=Math.sin(-m),n=Infinity,p=Infinity,q=-Infinity,r=-Infinity;a=a.qa();for(var t=0,v=k.length;t<v;t+=a)var w=k[t]*e-k[t+1]*m,A=k[t]*m+k[t+1]*e,
n=Math.min(n,w),p=Math.min(p,A),q=Math.max(q,w),r=Math.max(r,A);k=[n,p,q,r];c=[c[0]-d[1]-d[3],c[1]-d[0]-d[2]];c=Math.max(Wc(k)/c[0],Xc(k)/c[1]);c=isNaN(c)?h:Math.max(c,h);f&&(h=this.constrainResolution(c,0,0),!g&&h<c&&(h=this.constrainResolution(h,-1,0)),c=h);this.Vb(c);m=-m;g=(n+q)/2+(d[1]-d[3])/2*c;d=(p+r)/2+(d[0]-d[2])/2*c;this.mb([g*e-d*m,d*e+g*m])};
l.lj=function(a,c,d){var e=this.Ka(),f=Math.cos(-e),e=Math.sin(-e),g=a[0]*f-a[1]*e;a=a[1]*f+a[0]*e;var h=this.Z(),g=g+(c[0]/2-d[0])*h;a+=(d[1]-c[1]/2)*h;e=-e;this.mb([g*f-a*e,a*f+g*e])};function Ae(a){return!!a.Wa()&&void 0!==a.Z()}l.rotate=function(a,c){if(void 0!==c){var d,e=this.Wa();void 0!==e&&(d=[e[0]-c[0],e[1]-c[1]],gc(d,a-this.Ka()),bc(d,c));this.mb(d)}this.ke(a)};l.mb=function(a){this.set("center",a)};function Be(a,c){a.f[1]+=c}l.Vb=function(a){this.set("resolution",a)};
l.ke=function(a){this.set("rotation",a)};l.Do=function(a){a=this.constrainResolution(this.a,a-this.c,0);this.Vb(a)};function Ce(a){return Math.pow(a,3)}function De(a){return 1-Ce(1-a)}function Ee(a){return 3*a*a-2*a*a*a}function Fe(a){return a}function Ge(a){return.5>a?Ee(2*a):1-Ee(2*(a-.5))};function He(a){var c=a.source,d=a.start?a.start:Date.now(),e=c[0],f=c[1],g=void 0!==a.duration?a.duration:1E3,h=a.easing?a.easing:Ee;return function(a,c){if(c.time<d)return c.animate=!0,c.viewHints[0]+=1,!0;if(c.time<d+g){var n=1-h((c.time-d)/g),p=e-c.viewState.center[0],q=f-c.viewState.center[1];c.animate=!0;c.viewState.center[0]+=n*p;c.viewState.center[1]+=n*q;c.viewHints[0]+=1;return!0}return!1}}
function Ie(a){var c=a.rotation?a.rotation:0,d=a.start?a.start:Date.now(),e=void 0!==a.duration?a.duration:1E3,f=a.easing?a.easing:Ee,g=a.anchor?a.anchor:null;return function(a,k){if(k.time<d)return k.animate=!0,k.viewHints[0]+=1,!0;if(k.time<d+e){var m=1-f((k.time-d)/e),m=(c-k.viewState.rotation)*m;k.animate=!0;k.viewState.rotation+=m;if(g){var n=k.viewState.center;n[0]-=g[0];n[1]-=g[1];gc(n,m);bc(n,g)}k.viewHints[0]+=1;return!0}return!1}}
function Je(a){var c=a.resolution,d=a.start?a.start:Date.now(),e=void 0!==a.duration?a.duration:1E3,f=a.easing?a.easing:Ee;return function(a,h){if(h.time<d)return h.animate=!0,h.viewHints[0]+=1,!0;if(h.time<d+e){var k=1-f((h.time-d)/e),m=c-h.viewState.resolution;h.animate=!0;h.viewState.resolution+=k*m;h.viewHints[0]+=1;return!0}return!1}};function Ke(a,c,d,e){return void 0!==e?(e[0]=a,e[1]=c,e[2]=d,e):[a,c,d]}function Le(a){var c=a[0],d=Array(c),e=1<<c-1,f,g;for(f=0;f<c;++f)g=48,a[1]&e&&(g+=1),a[2]&e&&(g+=2),d[f]=String.fromCharCode(g),e>>=1;return d.join("")};function Me(a,c,d,e){this.ra=a;this.va=c;this.xa=d;this.Aa=e}Me.prototype.contains=function(a){return Ne(this,a[1],a[2])};function Ne(a,c,d){return a.ra<=c&&c<=a.va&&a.xa<=d&&d<=a.Aa}function Oe(a,c){return a.ra==c.ra&&a.xa==c.xa&&a.va==c.va&&a.Aa==c.Aa}function Pe(a,c){return a.ra<=c.va&&a.va>=c.ra&&a.xa<=c.Aa&&a.Aa>=c.xa};function Qe(a){this.a=a.html;this.b=a.tileRanges?a.tileRanges:null}Qe.prototype.g=function(){return this.a};function Re(a,c,d){Eb.call(this,a,d);this.element=c}y(Re,Eb);function Se(a){Mb.call(this);this.a=a?a:[];Te(this)}y(Se,Mb);l=Se.prototype;l.clear=function(){for(;0<this.ac();)this.pop()};l.jf=function(a){var c,d;c=0;for(d=a.length;c<d;++c)this.push(a[c]);return this};l.forEach=function(a,c){this.a.forEach(a,c)};l.il=function(){return this.a};l.item=function(a){return this.a[a]};l.ac=function(){return this.get("length")};l.de=function(a,c){this.a.splice(a,0,c);Te(this);this.b(new Re("add",c,this))};
l.pop=function(){return this.If(this.ac()-1)};l.push=function(a){var c=this.a.length;this.de(c,a);return c};l.remove=function(a){var c=this.a,d,e;d=0;for(e=c.length;d<e;++d)if(c[d]===a)return this.If(d)};l.If=function(a){var c=this.a[a];this.a.splice(a,1);Te(this);this.b(new Re("remove",c,this));return c};l.qo=function(a,c){var d=this.ac();if(a<d)d=this.a[a],this.a[a]=c,this.b(new Re("remove",d,this)),this.b(new Re("add",c,this));else{for(;d<a;++d)this.de(d,void 0);this.de(a,c)}};
function Te(a){a.set("length",a.a.length)};var Ue=/^#(?:[0-9a-f]{3}){1,2}$/i,Ve=/^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i,We=/^(?:rgba)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|1|0\.\d{0,10})\)$/i;function Xe(a){return ga(a)?a:Ye(a)}function Ze(a){if("string"!==typeof a){var c=a[0];c!=(c|0)&&(c=c+.5|0);var d=a[1];d!=(d|0)&&(d=d+.5|0);var e=a[2];e!=(e|0)&&(e=e+.5|0);a="rgba("+c+","+d+","+e+","+a[3]+")"}return a}
var Ye=function(){var a={},c=0;return function(d){var e;if(a.hasOwnProperty(d))e=a[d];else{if(1024<=c){e=0;for(var f in a)0===(e++&3)&&(delete a[f],--c)}var g,h;Ue.exec(d)?(h=3==d.length-1?1:2,e=parseInt(d.substr(1+0*h,h),16),f=parseInt(d.substr(1+1*h,h),16),g=parseInt(d.substr(1+2*h,h),16),1==h&&(e=(e<<4)+e,f=(f<<4)+f,g=(g<<4)+g),e=[e,f,g,1]):(h=We.exec(d))?(e=Number(h[1]),f=Number(h[2]),g=Number(h[3]),h=Number(h[4]),e=[e,f,g,h],e=$e(e,e)):(h=Ve.exec(d))?(e=Number(h[1]),f=Number(h[2]),g=Number(h[3]),
e=[e,f,g,1],e=$e(e,e)):e=void 0;a[d]=e;++c}return e}}();function $e(a,c){var d=c||[];d[0]=La(a[0]+.5|0,0,255);d[1]=La(a[1]+.5|0,0,255);d[2]=La(a[2]+.5|0,0,255);d[3]=La(a[3],0,1);return d};function af(a){return"string"===typeof a||a instanceof CanvasPattern||a instanceof CanvasGradient?a:Ze(a)};var bf;a:{var cf=aa.navigator;if(cf){var df=cf.userAgent;if(df){bf=df;break a}}bf=""}function ef(a){return-1!=bf.indexOf(a)};function ff(a,c){for(var d in a)c.call(void 0,a[d],d,a)}var gf="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function hf(a,c){for(var d,e,f=1;f<arguments.length;f++){e=arguments[f];for(d in e)a[d]=e[d];for(var g=0;g<gf.length;g++)d=gf[g],Object.prototype.hasOwnProperty.call(e,d)&&(a[d]=e[d])}};var jf=ef("Opera")||ef("OPR"),kf=ef("Trident")||ef("MSIE"),lf=ef("Edge"),mf=ef("Gecko")&&!(-1!=bf.toLowerCase().indexOf("webkit")&&!ef("Edge"))&&!(ef("Trident")||ef("MSIE"))&&!ef("Edge"),nf=-1!=bf.toLowerCase().indexOf("webkit")&&!ef("Edge");function of(){var a=bf;if(mf)return/rv\:([^\);]+)(\)|;)/.exec(a);if(lf)return/Edge\/([\d\.]+)/.exec(a);if(kf)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(nf)return/WebKit\/(\S+)/.exec(a)}function pf(){var a=aa.document;return a?a.documentMode:void 0}
var qf=function(){if(jf&&aa.opera){var a;var c=aa.opera.version;try{a=c()}catch(d){a=c}return a}a="";(c=of())&&(a=c?c[1]:"");return kf&&(c=pf(),c>parseFloat(a))?String(c):a}(),rf={};function sf(a){return rf[a]||(rf[a]=0<=Ja(qf,a))}var tf=aa.document,uf=tf&&kf?pf()||("CSS1Compat"==tf.compatMode?parseInt(qf,10):5):void 0;var vf=!kf||9<=uf;!mf&&!kf||kf&&9<=uf||mf&&sf("1.9.1");kf&&sf("9");function wf(a,c){this.x=ba(a)?a:0;this.y=ba(c)?c:0}l=wf.prototype;l.clone=function(){return new wf(this.x,this.y)};l.ceil=function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);return this};l.floor=function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);return this};l.round=function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this};l.scale=function(a,c){var d=ja(c)?c:a;this.x*=a;this.y*=d;return this};function xf(a,c){this.width=a;this.height=c}l=xf.prototype;l.clone=function(){return new xf(this.width,this.height)};l.ij=function(){return this.width*this.height};l.Oa=function(){return!this.ij()};l.ceil=function(){this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this};l.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};l.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this};
l.scale=function(a,c){var d=ja(c)?c:a;this.width*=a;this.height*=d;return this};function yf(a){return a?new zf(Af(a)):wa||(wa=new zf)}function Bf(a){var c=document;return ia(a)?c.getElementById(a):a}function Cf(a,c){ff(c,function(c,e){"style"==e?a.style.cssText=c:"class"==e?a.className=c:"for"==e?a.htmlFor=c:Df.hasOwnProperty(e)?a.setAttribute(Df[e],c):0==e.lastIndexOf("aria-",0)||0==e.lastIndexOf("data-",0)?a.setAttribute(e,c):a[e]=c})}
var Df={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};
function Ef(a,c,d){var e=arguments,f=document,g=e[0],h=e[1];if(!vf&&h&&(h.name||h.type)){g=["<",g];h.name&&g.push(' name="',ya(h.name),'"');if(h.type){g.push(' type="',ya(h.type),'"');var k={};hf(k,h);delete k.type;h=k}g.push(">");g=g.join("")}g=f.createElement(g);h&&(ia(h)?g.className=h:ga(h)?g.className=h.join(" "):Cf(g,h));2<e.length&&Ff(f,g,e);return g}
function Ff(a,c,d){function e(d){d&&c.appendChild(ia(d)?a.createTextNode(d):d)}for(var f=2;f<d.length;f++){var g=d[f];!ha(g)||la(g)&&0<g.nodeType?e(g):Vb(Gf(g)?Yb(g):g,e)}}function Hf(a){for(var c;c=a.firstChild;)a.removeChild(c)}function If(a,c,d){a.insertBefore(c,a.childNodes[d]||null)}function Jf(a){a&&a.parentNode&&a.parentNode.removeChild(a)}function Kf(a,c){var d=c.parentNode;d&&d.replaceChild(a,c)}
function Lf(a){if(ba(a.firstElementChild))a=a.firstElementChild;else for(a=a.firstChild;a&&1!=a.nodeType;)a=a.nextSibling;return a}function Mf(a,c){if(a.contains&&1==c.nodeType)return a==c||a.contains(c);if("undefined"!=typeof a.compareDocumentPosition)return a==c||Boolean(a.compareDocumentPosition(c)&16);for(;c&&a!=c;)c=c.parentNode;return c==a}function Af(a){return 9==a.nodeType?a:a.ownerDocument||a.document}
function Gf(a){if(a&&"number"==typeof a.length){if(la(a))return"function"==typeof a.item||"string"==typeof a.item;if(ka(a))return"function"==typeof a.item}return!1}function zf(a){this.b=a||aa.document||document}zf.prototype.C=Cf;function Nf(){return!0}zf.prototype.appendChild=function(a,c){a.appendChild(c)};zf.prototype.contains=Mf;function Of(a){if(a.classList)return a.classList;a=a.className;return ia(a)&&a.match(/\S+/g)||[]}function Pf(a,c){var d;a.classList?d=a.classList.contains(c):(d=Of(a),d=0<=Ub(d,c));return d}function Qf(a,c){a.classList?a.classList.add(c):Pf(a,c)||(a.className+=0<a.className.length?" "+c:c)}function Rf(a,c){a.classList?a.classList.remove(c):Pf(a,c)&&(a.className=Wb(Of(a),function(a){return a!=c}).join(" "))}function Sf(a,c){Pf(a,c)?Rf(a,c):Qf(a,c)};function Tf(a,c,d,e){this.top=a;this.right=c;this.bottom=d;this.left=e}l=Tf.prototype;l.clone=function(){return new Tf(this.top,this.right,this.bottom,this.left)};l.contains=function(a){return this&&a?a instanceof Tf?a.left>=this.left&&a.right<=this.right&&a.top>=this.top&&a.bottom<=this.bottom:a.x>=this.left&&a.x<=this.right&&a.y>=this.top&&a.y<=this.bottom:!1};
l.ceil=function(){this.top=Math.ceil(this.top);this.right=Math.ceil(this.right);this.bottom=Math.ceil(this.bottom);this.left=Math.ceil(this.left);return this};l.floor=function(){this.top=Math.floor(this.top);this.right=Math.floor(this.right);this.bottom=Math.floor(this.bottom);this.left=Math.floor(this.left);return this};l.round=function(){this.top=Math.round(this.top);this.right=Math.round(this.right);this.bottom=Math.round(this.bottom);this.left=Math.round(this.left);return this};
l.scale=function(a,c){var d=ja(c)?c:a;this.left*=a;this.right*=a;this.top*=d;this.bottom*=d;return this};function Uf(a,c,d,e){this.left=a;this.top=c;this.width=d;this.height=e}l=Uf.prototype;l.clone=function(){return new Uf(this.left,this.top,this.width,this.height)};l.contains=function(a){return a instanceof Uf?this.left<=a.left&&this.left+this.width>=a.left+a.width&&this.top<=a.top&&this.top+this.height>=a.top+a.height:a.x>=this.left&&a.x<=this.left+this.width&&a.y>=this.top&&a.y<=this.top+this.height};
l.distance=function(a){var c=a.x<this.left?this.left-a.x:Math.max(a.x-(this.left+this.width),0);a=a.y<this.top?this.top-a.y:Math.max(a.y-(this.top+this.height),0);return Math.sqrt(c*c+a*a)};l.ceil=function(){this.left=Math.ceil(this.left);this.top=Math.ceil(this.top);this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this};l.floor=function(){this.left=Math.floor(this.left);this.top=Math.floor(this.top);this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};
l.round=function(){this.left=Math.round(this.left);this.top=Math.round(this.top);this.width=Math.round(this.width);this.height=Math.round(this.height);return this};l.scale=function(a,c){var d=ja(c)?c:a;this.left*=a;this.width*=a;this.top*=d;this.height*=d;return this};function Vf(a,c){var d=Af(a);return d.defaultView&&d.defaultView.getComputedStyle&&(d=d.defaultView.getComputedStyle(a,null))?d[c]||d.getPropertyValue(c)||"":""}function Wf(a,c,d){var e;c instanceof wf?(e=c.x,c=c.y):(e=c,c=d);a.style.left=Xf(e);a.style.top=Xf(c)}
function Yf(a){var c;try{c=a.getBoundingClientRect()}catch(d){return{left:0,top:0,right:0,bottom:0}}kf&&a.ownerDocument.body&&(a=a.ownerDocument,c.left-=a.documentElement.clientLeft+a.body.clientLeft,c.top-=a.documentElement.clientTop+a.body.clientTop);return c}function Zf(a){if(1==a.nodeType)return a=Yf(a),new wf(a.left,a.top);a=a.changedTouches?a.changedTouches[0]:a;return new wf(a.clientX,a.clientY)}function Xf(a){"number"==typeof a&&(a=a+"px");return a}
function $f(a){var c=ag;if("none"!=(Vf(a,"display")||(a.currentStyle?a.currentStyle.display:null)||a.style&&a.style.display))return c(a);var d=a.style,e=d.display,f=d.visibility,g=d.position;d.visibility="hidden";d.position="absolute";d.display="inline";a=c(a);d.display=e;d.position=g;d.visibility=f;return a}function ag(a){var c=a.offsetWidth,d=a.offsetHeight,e=nf&&!c&&!d;return ba(c)&&!e||!a.getBoundingClientRect?new xf(c,d):(a=Yf(a),new xf(a.right-a.left,a.bottom-a.top))}
function bg(a,c){a.style.display=c?"":"none"}function cg(a,c,d,e){if(/^\d+px?$/.test(c))return parseInt(c,10);var f=a.style[d],g=a.runtimeStyle[d];a.runtimeStyle[d]=a.currentStyle[d];a.style[d]=c;c=a.style[e];a.style[d]=f;a.runtimeStyle[d]=g;return c}function dg(a,c){var d=a.currentStyle?a.currentStyle[c]:null;return d?cg(a,d,"left","pixelLeft"):0}
function eg(a,c){if(kf){var d=dg(a,c+"Left"),e=dg(a,c+"Right"),f=dg(a,c+"Top"),g=dg(a,c+"Bottom");return new Tf(f,e,g,d)}d=Vf(a,c+"Left");e=Vf(a,c+"Right");f=Vf(a,c+"Top");g=Vf(a,c+"Bottom");return new Tf(parseFloat(f),parseFloat(e),parseFloat(g),parseFloat(d))}var fg={thin:2,medium:4,thick:6};function gg(a,c){if("none"==(a.currentStyle?a.currentStyle[c+"Style"]:null))return 0;var d=a.currentStyle?a.currentStyle[c+"Width"]:null;return d in fg?fg[d]:cg(a,d,"left","pixelLeft")}
function hg(a){if(kf&&!(9<=uf)){var c=gg(a,"borderLeft"),d=gg(a,"borderRight"),e=gg(a,"borderTop");a=gg(a,"borderBottom");return new Tf(e,d,a,c)}c=Vf(a,"borderLeftWidth");d=Vf(a,"borderRightWidth");e=Vf(a,"borderTopWidth");a=Vf(a,"borderBottomWidth");return new Tf(parseFloat(e),parseFloat(d),parseFloat(a),parseFloat(c))};function ig(a,c,d){Eb.call(this,a);this.map=c;this.frameState=void 0!==d?d:null}y(ig,Eb);function jg(a){Mb.call(this);this.element=a.element?a.element:null;this.a=this.S=null;this.s=[];this.render=a.render?a.render:va;a.target&&this.c(a.target)}y(jg,Mb);jg.prototype.fa=function(){Jf(this.element);jg.ia.fa.call(this)};jg.prototype.i=function(){return this.a};
jg.prototype.setMap=function(a){this.a&&Jf(this.element);for(var c=0,d=this.s.length;c<d;++c)sb(this.s[c]);this.s.length=0;if(this.a=a)(this.S?this.S:a.A).appendChild(this.element),this.render!==va&&this.s.push(D(a,"postrender",this.render,this)),a.render()};jg.prototype.c=function(a){this.S=Bf(a)};function kg(){this.g=0;this.f={};this.a=this.b=null}l=kg.prototype;l.clear=function(){this.g=0;this.f={};this.a=this.b=null};function lg(a,c){return a.f.hasOwnProperty(c)}l.forEach=function(a,c){for(var d=this.b;d;)a.call(c,d.mc,d.ee,this),d=d.xb};l.get=function(a){a=this.f[a];if(a===this.a)return a.mc;a===this.b?(this.b=this.b.xb,this.b.hc=null):(a.xb.hc=a.hc,a.hc.xb=a.xb);a.xb=null;a.hc=this.a;this.a=this.a.xb=a;return a.mc};l.rc=function(){return this.g};
l.O=function(){var a=Array(this.g),c=0,d;for(d=this.a;d;d=d.hc)a[c++]=d.ee;return a};l.vc=function(){var a=Array(this.g),c=0,d;for(d=this.a;d;d=d.hc)a[c++]=d.mc;return a};l.pop=function(){var a=this.b;delete this.f[a.ee];a.xb&&(a.xb.hc=null);this.b=a.xb;this.b||(this.a=null);--this.g;return a.mc};l.replace=function(a,c){this.get(a);this.f[a].mc=c};l.set=function(a,c){var d={ee:a,xb:null,hc:this.a,mc:c};this.a?this.a.xb=d:this.b=d;this.a=d;this.f[a]=d;++this.g};function mg(a){kg.call(this);this.c=void 0!==a?a:2048}y(mg,kg);function ng(a){return a.rc()>a.c}function og(a,c){for(var d,e;ng(a)&&!(d=a.b.mc,e=d.ga[0].toString(),e in c&&c[e].contains(d.ga));)a.pop().Rd()};function pg(a,c){Hb.call(this);this.ga=a;this.state=c;this.a=null;this.key=""}y(pg,Hb);function qg(a){a.b("change")}pg.prototype.eb=function(){return x(this).toString()};pg.prototype.f=function(){return this.ga};pg.prototype.V=function(){return this.state};function rg(a){Mb.call(this);this.f=qd(a.projection);this.Da=void 0!==a.attributions?a.attributions:null;this.D=a.logo;this.wa=void 0!==a.state?a.state:"ready";this.J=void 0!==a.wrapX?a.wrapX:!1}y(rg,Mb);l=rg.prototype;l.oe=va;l.ea=function(){return this.Da};l.pa=function(){return this.D};l.sa=function(){return this.f};l.V=function(){return this.wa};function sg(a){return a.J}l.ma=function(a){this.Da=a;this.u()};function tg(a,c){a.wa=c;a.u()};function ug(a){this.minZoom=void 0!==a.minZoom?a.minZoom:0;this.a=a.resolutions;this.maxZoom=this.a.length-1;this.g=void 0!==a.origin?a.origin:null;this.c=null;void 0!==a.origins&&(this.c=a.origins);var c=a.extent;void 0===c||this.g||this.c||(this.g=Sc(c));this.i=null;void 0!==a.tileSizes&&(this.i=a.tileSizes);this.l=void 0!==a.tileSize?a.tileSize:this.i?null:256;this.s=void 0!==c?c:null;this.b=null;void 0!==a.sizes?this.b=a.sizes.map(function(a){return new Me(Math.min(0,a[0]),Math.max(a[0]-1,-1),
Math.min(0,a[1]),Math.max(a[1]-1,-1))},this):c&&vg(this,c);this.f=[0,0]}var wg=[0,0,0];function xg(a,c,d,e,f,g){g=a.Ca(c,g);for(c=c[0]-1;c>=a.minZoom;){if(d.call(e,c,yg(a,g,c,f)))return!0;--c}return!1}l=ug.prototype;l.G=function(){return this.s};l.yg=function(){return this.maxZoom};l.zg=function(){return this.minZoom};l.Ha=function(a){return this.g?this.g:this.c[a]};l.Z=function(a){return this.a[a]};l.Pb=function(){return this.a};
function zg(a,c,d,e){return c[0]<a.maxZoom?(e=a.Ca(c,e),yg(a,e,c[0]+1,d)):null}function Ag(a,c,d,e){Bg(a,c[0],c[1],d,!1,wg);var f=wg[1],g=wg[2];Bg(a,c[2],c[3],d,!0,wg);a=wg[1];c=wg[2];void 0!==e?(e.ra=f,e.va=a,e.xa=g,e.Aa=c):e=new Me(f,a,g,c);return e}function yg(a,c,d,e){d=a.Z(d);return Ag(a,c,d,e)}function Cg(a,c){var d=a.Ha(c[0]),e=a.Z(c[0]),f=Sb(a.Ua(c[0]),a.f);return[d[0]+(c[1]+.5)*f[0]*e,d[1]+(c[2]+.5)*f[1]*e]}
l.Ca=function(a,c){var d=this.Ha(a[0]),e=this.Z(a[0]),f=Sb(this.Ua(a[0]),this.f),g=d[0]+a[1]*f[0]*e,d=d[1]+a[2]*f[1]*e;return Ic(g,d,g+f[0]*e,d+f[1]*e,c)};l.$d=function(a,c,d){return Bg(this,a[0],a[1],c,!1,d)};function Bg(a,c,d,e,f,g){var h=Dg(a,e),k=e/a.Z(h),m=a.Ha(h);a=Sb(a.Ua(h),a.f);c=k*Math.floor((c-m[0])/e+(f?.5:0))/a[0];d=k*Math.floor((d-m[1])/e+(f?0:.5))/a[1];f?(c=Math.ceil(c)-1,d=Math.ceil(d)-1):(c=Math.floor(c),d=Math.floor(d));return Ke(h,c,d,g)}
l.ud=function(a,c,d){c=this.Z(c);return Bg(this,a[0],a[1],c,!1,d)};l.Ua=function(a){return this.l?this.l:this.i[a]};function Dg(a,c){var d=Va(a.a,c,0);return La(d,a.minZoom,a.maxZoom)}function vg(a,c){for(var d=a.a.length,e=Array(d),f=a.minZoom;f<d;++f)e[f]=yg(a,c,f);a.b=e}function Eg(a){var c=a.j;if(!c){var c=Fg(a),d=Gg(c,void 0,void 0),c=new ug({extent:c,origin:Sc(c),resolutions:d,tileSize:void 0});a.j=c}return c}
function Hg(a){var c={};mb(c,void 0!==a?a:{});void 0===c.extent&&(c.extent=qd("EPSG:3857").G());c.resolutions=Gg(c.extent,c.maxZoom,c.tileSize);delete c.maxZoom;return new ug(c)}function Gg(a,c,d){c=void 0!==c?c:42;var e=Xc(a);a=Wc(a);d=Sb(void 0!==d?d:256);d=Math.max(a/d[0],e/d[1]);c+=1;e=Array(c);for(a=0;a<c;++a)e[a]=d/Math.pow(2,a);return e}function Fg(a){a=qd(a);var c=a.G();c||(a=180*md.degrees/a.$b(),c=Ic(-a,-a,a,a));return c};function Ig(a){rg.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,state:a.state,wrapX:a.wrapX});this.na=void 0!==a.opaque?a.opaque:!1;this.ya=void 0!==a.tilePixelRatio?a.tilePixelRatio:1;this.tileGrid=void 0!==a.tileGrid?a.tileGrid:null;this.a=new mg(a.Se);this.j=[0,0]}y(Ig,rg);l=Ig.prototype;l.lh=function(){return ng(this.a)};l.mh=function(a,c){var d=this.td(a);d&&og(d,c)};
function Jg(a,c,d,e,f){c=a.td(c);if(!c)return!1;for(var g=!0,h,k,m=e.ra;m<=e.va;++m)for(var n=e.xa;n<=e.Aa;++n)h=a.Db(d,m,n),k=!1,lg(c,h)&&(h=c.get(h),(k=2===h.V())&&(k=!1!==f(h))),k||(g=!1);return g}l.Ud=function(){return 0};l.bf=function(){return""};l.Db=function(a,c,d){return a+"/"+c+"/"+d};l.Wd=function(){return this.na};l.Pb=function(){return this.tileGrid.Pb()};l.Ma=function(){return this.tileGrid};l.Za=function(a){return this.tileGrid?this.tileGrid:Eg(a)};
l.td=function(a){var c=this.f;return c&&!Hd(c,a)?null:this.a};l.uc=function(){return this.ya};function Kg(a,c,d,e){e=a.Za(e);d=a.uc(d);c=Sb(e.Ua(c),a.j);return 1==d?c:Rb(c,d,a.j)}function Lg(a,c,d){var e=void 0!==d?d:a.f;d=a.Za(e);if(a.J&&e.g){var f=c;c=f[0];a=Cg(d,f);e=Fg(e);Dc(e,a)?c=f:(f=Wc(e),a[0]+=f*Math.ceil((e[0]-a[0])/f),c=d.ud(a,c))}f=c[0];e=c[1];a=c[2];if(d.minZoom>f||f>d.maxZoom)d=!1;else{var g=d.G();d=(d=g?yg(d,g,f):d.b?d.b[f]:null)?Ne(d,e,a):!0}return d?c:null}l.Of=va;
function Mg(a,c){Eb.call(this,a);this.tile=c}y(Mg,Eb);function Ng(a){a=a?a:{};this.J=document.createElement("UL");this.A=document.createElement("LI");this.J.appendChild(this.A);bg(this.A,!1);this.f=void 0!==a.collapsed?a.collapsed:!0;this.l=void 0!==a.collapsible?a.collapsible:!0;this.l||(this.f=!1);var c=void 0!==a.className?a.className:"ol-attribution",d=void 0!==a.tipLabel?a.tipLabel:"Attributions",e=void 0!==a.collapseLabel?a.collapseLabel:"\u00bb";this.D="string"===typeof e?Ef("SPAN",{},e):e;e=void 0!==a.label?a.label:"i";this.H="string"===typeof e?
Ef("SPAN",{},e):e;d=Ef("BUTTON",{type:"button",title:d},this.l&&!this.f?this.D:this.H);D(d,"click",this.Bl,this);c=Ef("DIV",c+" ol-unselectable ol-control"+(this.f&&this.l?" ol-collapsed":"")+(this.l?"":" ol-uncollapsible"),this.J,d);jg.call(this,{element:c,render:a.render?a.render:Og,target:a.target});this.B=!0;this.o={};this.j={};this.U={}}y(Ng,jg);
function Og(a){if(a=a.frameState){var c,d,e,f,g,h,k,m,n,p,q,r=a.layerStatesArray,t=mb({},a.attributions),v={},w=a.viewState.projection;d=0;for(c=r.length;d<c;d++)if(h=r[d].layer.da())if(p=x(h).toString(),n=h.ea())for(e=0,f=n.length;e<f;e++)if(k=n[e],m=x(k).toString(),!(m in t)){if(g=a.usedTiles[p]){var A=h.Za(w);a:{q=k;var B=w;if(q.b){var z=void 0,C=void 0,O=void 0,I=void 0;for(I in g)if(I in q.b)for(var O=g[I],K,z=0,C=q.b[I].length;z<C;++z){K=q.b[I][z];if(Pe(K,O)){q=!0;break a}var P=yg(A,Fg(B),parseInt(I,
10)),da=P.va-P.ra+1;if(O.ra<P.ra||O.va>P.va)if(Pe(K,new Me($b(O.ra,da),$b(O.va,da),O.xa,O.Aa))||O.va-O.ra+1>da&&Pe(K,P)){q=!0;break a}}q=!1}else q=!0}}else q=!1;q?(m in v&&delete v[m],t[m]=k):v[m]=k}c=[t,v];d=c[0];c=c[1];for(var J in this.o)J in d?(this.j[J]||(bg(this.o[J],!0),this.j[J]=!0),delete d[J]):J in c?(this.j[J]&&(bg(this.o[J],!1),delete this.j[J]),delete c[J]):(Jf(this.o[J]),delete this.o[J],delete this.j[J]);for(J in d)e=document.createElement("LI"),e.innerHTML=d[J].a,this.J.appendChild(e),
this.o[J]=e,this.j[J]=!0;for(J in c)e=document.createElement("LI"),e.innerHTML=c[J].a,bg(e,!1),this.J.appendChild(e),this.o[J]=e;J=!pb(this.j)||!pb(a.logos);this.B!=J&&(bg(this.element,J),this.B=J);J&&pb(this.j)?Qf(this.element,"ol-logo-only"):Rf(this.element,"ol-logo-only");var ea;a=a.logos;J=this.U;for(ea in J)ea in a||(Jf(J[ea]),delete J[ea]);for(var Ga in a)Ga in J||(ea=new Image,ea.src=Ga,d=a[Ga],""===d?d=ea:(d=Ef("A",{href:d}),d.appendChild(ea)),this.A.appendChild(d),J[Ga]=d);bg(this.A,!pb(a))}else this.B&&
(bg(this.element,!1),this.B=!1)}l=Ng.prototype;l.Bl=function(a){a.preventDefault();Pg(this)};function Pg(a){Sf(a.element,"ol-collapsed");a.f?Kf(a.D,a.H):Kf(a.H,a.D);a.f=!a.f}l.Al=function(){return this.l};l.Dl=function(a){this.l!==a&&(this.l=a,Sf(this.element,"ol-uncollapsible"),!a&&this.f&&Pg(this))};l.Cl=function(a){this.l&&this.f!==a&&Pg(this)};l.zl=function(){return this.f};function Qg(a){a=a?a:{};var c=void 0!==a.className?a.className:"ol-rotate",d=void 0!==a.label?a.label:"\u21e7";this.f=null;"string"===typeof d?this.f=Ef("SPAN","ol-compass",d):(this.f=d,Qf(this.f,"ol-compass"));d=Ef("BUTTON",{"class":c+"-reset",type:"button",title:a.tipLabel?a.tipLabel:"Reset rotation"},this.f);D(d,"click",Qg.prototype.B,this);c=Ef("DIV",c+" ol-unselectable ol-control",d);d=a.render?a.render:Rg;this.l=a.resetNorth?a.resetNorth:void 0;jg.call(this,{element:c,render:d,target:a.target});
this.o=void 0!==a.duration?a.duration:250;this.j=void 0!==a.autoHide?a.autoHide:!0;this.A=void 0;this.j&&Qf(this.element,"ol-hidden")}y(Qg,jg);Qg.prototype.B=function(a){a.preventDefault();if(void 0!==this.l)this.l();else{a=this.a;var c=a.$();if(c){var d=c.Ka();void 0!==d&&(0<this.o&&(d%=2*Math.PI,d<-Math.PI&&(d+=2*Math.PI),d>Math.PI&&(d-=2*Math.PI),a.Ra(Ie({rotation:d,duration:this.o,easing:De}))),c.ke(0))}}};
function Rg(a){if(a=a.frameState){a=a.viewState.rotation;if(a!=this.A){var c="rotate("+a+"rad)";if(this.j){var d=this.element;0===a?Qf(d,"ol-hidden"):Rf(d,"ol-hidden")}this.f.style.msTransform=c;this.f.style.webkitTransform=c;this.f.style.transform=c}this.A=a}};function Sg(a){a=a?a:{};var c=void 0!==a.className?a.className:"ol-zoom",d=void 0!==a.delta?a.delta:1,e=void 0!==a.zoomOutLabel?a.zoomOutLabel:"\u2212",f=void 0!==a.zoomOutTipLabel?a.zoomOutTipLabel:"Zoom out",g=Ef("BUTTON",{"class":c+"-in",type:"button",title:void 0!==a.zoomInTipLabel?a.zoomInTipLabel:"Zoom in"},void 0!==a.zoomInLabel?a.zoomInLabel:"+");D(g,"click",ra(Sg.prototype.j,d),this);e=Ef("BUTTON",{"class":c+"-out",type:"button",title:f},e);D(e,"click",ra(Sg.prototype.j,-d),this);c=Ef("DIV",
c+" ol-unselectable ol-control",g,e);jg.call(this,{element:c,target:a.target});this.f=void 0!==a.duration?a.duration:250}y(Sg,jg);Sg.prototype.j=function(a,c){c.preventDefault();var d=this.a,e=d.$();if(e){var f=e.Z();f&&(0<this.f&&d.Ra(Je({resolution:f,duration:this.f,easing:De})),d=e.constrainResolution(f,a),e.Vb(d))}};function Tg(a){a=a?a:{};var c=new Se;(void 0!==a.zoom?a.zoom:1)&&c.push(new Sg(a.zoomOptions));(void 0!==a.rotate?a.rotate:1)&&c.push(new Qg(a.rotateOptions));(void 0!==a.attribution?a.attribution:1)&&c.push(new Ng(a.attributionOptions));return c};var Ug=nf?"webkitfullscreenchange":mf?"mozfullscreenchange":kf?"MSFullscreenChange":"fullscreenchange";function Vg(){var a=yf().b,c=a.body;return!!(c.webkitRequestFullscreen||c.mozRequestFullScreen&&a.mozFullScreenEnabled||c.msRequestFullscreen&&a.msFullscreenEnabled||c.requestFullscreen&&a.fullscreenEnabled)}
function Wg(a){a.webkitRequestFullscreen?a.webkitRequestFullscreen():a.mozRequestFullScreen?a.mozRequestFullScreen():a.msRequestFullscreen?a.msRequestFullscreen():a.requestFullscreen&&a.requestFullscreen()}function Xg(){var a=yf().b;return!!(a.webkitIsFullScreen||a.mozFullScreen||a.msFullscreenElement||a.fullscreenElement)};function Yg(a){a=a?a:{};this.f=void 0!==a.className?a.className:"ol-full-screen";var c=void 0!==a.label?a.label:"\u2922";this.j="string"===typeof c?document.createTextNode(c):c;c=void 0!==a.labelActive?a.labelActive:"\u00d7";this.l="string"===typeof c?document.createTextNode(c):c;c=a.tipLabel?a.tipLabel:"Toggle full-screen";c=Ef("BUTTON",{"class":this.f+"-"+Xg(),type:"button",title:c},this.j);D(c,"click",this.J,this);D(aa.document,Ug,this.A,this);var d=this.f+" ol-unselectable ol-control "+(Vg()?
"":"ol-unsupported"),c=Ef("DIV",d,c);jg.call(this,{element:c,target:a.target});this.B=void 0!==a.keys?a.keys:!1;this.o=a.source}y(Yg,jg);
Yg.prototype.J=function(a){a.preventDefault();Vg()&&(a=this.a)&&(Xg()?(a=yf().b,a.webkitCancelFullScreen?a.webkitCancelFullScreen():a.mozCancelFullScreen?a.mozCancelFullScreen():a.msExitFullscreen?a.msExitFullscreen():a.exitFullscreen&&a.exitFullscreen()):(a=this.o?Bf(this.o):a.tc(),this.B?a.mozRequestFullScreenWithKeys?a.mozRequestFullScreenWithKeys():a.webkitRequestFullscreen?a.webkitRequestFullscreen():Wg(a):Wg(a)))};
Yg.prototype.A=function(){var a=this.f+"-true",c=this.f+"-false",d=Lf(this.element),e=this.a;Xg()?(Pf(d,c)&&(Rf(d,c),Qf(d,a)),Kf(this.l,this.j)):(Pf(d,a)&&(Rf(d,a),Qf(d,c)),Kf(this.j,this.l));e&&e.Xc()};function Zg(a){a=a?a:{};var c=document.createElement("DIV");c.className=void 0!==a.className?a.className:"ol-mouse-position";jg.call(this,{element:c,render:a.render?a.render:$g,target:a.target});D(this,Ob("projection"),this.El,this);a.coordinateFormat&&this.Nh(a.coordinateFormat);a.projection&&this.Xg(qd(a.projection));this.A=void 0!==a.undefinedHTML?a.undefinedHTML:"";this.o=c.innerHTML;this.l=this.j=this.f=null}y(Zg,jg);
function $g(a){a=a.frameState;a?this.f!=a.viewState.projection&&(this.f=a.viewState.projection,this.j=null):this.f=null;ah(this,this.l)}l=Zg.prototype;l.El=function(){this.j=null};l.rg=function(){return this.get("coordinateFormat")};l.Wg=function(){return this.get("projection")};l.Ak=function(a){this.l=this.a.Td(a);ah(this,this.l)};l.Bk=function(){ah(this,null);this.l=null};l.setMap=function(a){Zg.ia.setMap.call(this,a);a&&(a=a.a,this.s.push(D(a,"mousemove",this.Ak,this),D(a,"mouseout",this.Bk,this)))};
l.Nh=function(a){this.set("coordinateFormat",a)};l.Xg=function(a){this.set("projection",a)};function ah(a,c){var d=a.A;if(c&&a.f){if(!a.j){var e=a.Wg();a.j=e?ud(a.f,e):Jd}if(e=a.a.La(c))a.j(e,e),d=(d=a.rg())?d(e):e.toString()}a.o&&d==a.o||(a.element.innerHTML=d,a.o=d)};function bh(a,c){var d=a;c&&(d=qa(a,c));d=ch(d);!ka(aa.setImmediate)||aa.Window&&aa.Window.prototype&&aa.Window.prototype.setImmediate==aa.setImmediate?(dh||(dh=eh()),dh(d)):aa.setImmediate(d)}var dh;
function eh(){var a=aa.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!ef("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var c=a.contentWindow,a=c.document;a.open();a.write("");a.close();var d="callImmediate"+Math.random(),e="file:"==c.location.protocol?"*":c.location.protocol+"//"+c.location.host,a=qa(function(a){if(("*"==e||a.origin==e)&&a.data==
d)this.port1.onmessage()},this);c.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){c.postMessage(d,e)}}});if("undefined"!==typeof a&&!ef("Trident")&&!ef("MSIE")){var c=new a,d={},e=d;c.port1.onmessage=function(){if(ba(d.next)){d=d.next;var a=d.hg;d.hg=null;a()}};return function(a){e.next={hg:a};e=e.next;c.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(a){var c=document.createElement("SCRIPT");
c.onreadystatechange=function(){c.onreadystatechange=null;c.parentNode.removeChild(c);c=null;a();a=null};document.documentElement.appendChild(c)}:function(a){aa.setTimeout(a,0)}}var ch=hd;function fh(a,c){this.a={};this.b=[];this.g=0;var d=arguments.length;if(1<d){if(d%2)throw Error("Uneven number of arguments");for(var e=0;e<d;e+=2)this.set(arguments[e],arguments[e+1])}else if(a){var f;if(a instanceof fh)f=a.O(),e=a.vc();else{var d=[],g=0;for(f in a)d[g++]=f;f=d;d=[];g=0;for(e in a)d[g++]=a[e];e=d}for(d=0;d<f.length;d++)this.set(f[d],e[d])}}l=fh.prototype;l.rc=function(){return this.g};l.vc=function(){gh(this);for(var a=[],c=0;c<this.b.length;c++)a.push(this.a[this.b[c]]);return a};
l.O=function(){gh(this);return this.b.concat()};l.Oa=function(){return 0==this.g};l.clear=function(){this.a={};this.g=this.b.length=0};l.remove=function(a){return hh(this.a,a)?(delete this.a[a],this.g--,this.b.length>2*this.g&&gh(this),!0):!1};function gh(a){if(a.g!=a.b.length){for(var c=0,d=0;c<a.b.length;){var e=a.b[c];hh(a.a,e)&&(a.b[d++]=e);c++}a.b.length=d}if(a.g!=a.b.length){for(var f={},d=c=0;c<a.b.length;)e=a.b[c],hh(f,e)||(a.b[d++]=e,f[e]=1),c++;a.b.length=d}}
l.get=function(a,c){return hh(this.a,a)?this.a[a]:c};l.set=function(a,c){hh(this.a,a)||(this.g++,this.b.push(a));this.a[a]=c};l.forEach=function(a,c){for(var d=this.O(),e=0;e<d.length;e++){var f=d[e],g=this.get(f);a.call(c,g,f,this)}};l.clone=function(){return new fh(this)};function hh(a,c){return Object.prototype.hasOwnProperty.call(a,c)};function ih(){this.b=sa()}new ih;ih.prototype.set=function(a){this.b=a};ih.prototype.get=function(){return this.b};function jh(a,c,d){Eb.call(this,a);this.b=c;a=d?d:{};this.buttons=kh(a);this.pressure=lh(a,this.buttons);this.bubbles="bubbles"in a?a.bubbles:!1;this.cancelable="cancelable"in a?a.cancelable:!1;this.view="view"in a?a.view:null;this.detail="detail"in a?a.detail:null;this.screenX="screenX"in a?a.screenX:0;this.screenY="screenY"in a?a.screenY:0;this.clientX="clientX"in a?a.clientX:0;this.clientY="clientY"in a?a.clientY:0;this.button="button"in a?a.button:0;this.relatedTarget="relatedTarget"in a?a.relatedTarget:
null;this.pointerId="pointerId"in a?a.pointerId:0;this.width="width"in a?a.width:0;this.height="height"in a?a.height:0;this.pointerType="pointerType"in a?a.pointerType:"";this.isPrimary="isPrimary"in a?a.isPrimary:!1;c.preventDefault&&(this.preventDefault=function(){c.preventDefault()})}y(jh,Eb);function kh(a){if(a.buttons||mh)a=a.buttons;else switch(a.which){case 1:a=1;break;case 2:a=4;break;case 3:a=2;break;default:a=0}return a}
function lh(a,c){var d=0;a.pressure?d=a.pressure:d=c?.5:0;return d}var mh=!1;try{mh=1===(new MouseEvent("click",{buttons:1})).buttons}catch(a){};function nh(a,c){var d=document.createElement("CANVAS");a&&(d.width=a);c&&(d.height=c);return d.getContext("2d")}
var oh=function(){var a;return function(){if(void 0===a)if(aa.getComputedStyle){var c=document.createElement("P"),d,e={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.appendChild(c);for(var f in e)f in c.style&&(c.style[f]="translate(1px,1px)",d=aa.getComputedStyle(c).getPropertyValue(e[f]));Jf(c);a=d&&"none"!==d}else a=!1;return a}}(),ph=function(){var a;return function(){if(void 0===a)if(aa.getComputedStyle){var c=
document.createElement("P"),d,e={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.appendChild(c);for(var f in e)f in c.style&&(c.style[f]="translate3d(1px,1px,1px)",d=aa.getComputedStyle(c).getPropertyValue(e[f]));Jf(c);a=d&&"none"!==d}else a=!1;return a}}();
function qh(a,c){var d=a.style;d.WebkitTransform=c;d.MozTransform=c;d.b=c;d.msTransform=c;d.transform=c;kf&&sf("9.0")&&(a.style.transformOrigin="0 0")}function rh(a,c){var d;if(ph()){var e=Array(16);for(d=0;16>d;++d)e[d]=c[d].toFixed(6);qh(a,"matrix3d("+e.join(",")+")")}else if(oh()){var e=[c[0],c[1],c[4],c[5],c[12],c[13]],f=Array(6);for(d=0;6>d;++d)f[d]=e[d].toFixed(6);qh(a,"matrix("+f.join(",")+")")}else a.style.left=Math.round(c[12])+"px",a.style.top=Math.round(c[13])+"px"};var sh=["experimental-webgl","webgl","webkit-3d","moz-webgl"];function th(a,c){var d,e,f=sh.length;for(e=0;e<f;++e)try{if(d=a.getContext(sh[e],c))return d}catch(g){}return null};var uh,vh="undefined"!==typeof navigator?navigator.userAgent.toLowerCase():"",wh=-1!==vh.indexOf("firefox"),xh=-1!==vh.indexOf("safari")&&-1===vh.indexOf("chrom"),yh=-1!==vh.indexOf("macintosh"),zh=aa.devicePixelRatio||1,Ah=!1,Bh=function(){if(!("HTMLCanvasElement"in aa))return!1;try{var a=nh();return a?(void 0!==a.setLineDash&&(Ah=!0),!0):!1}catch(c){return!1}}(),Ch="DeviceOrientationEvent"in aa,Dh="geolocation"in aa.navigator,Eh="ontouchstart"in aa,Fh="PointerEvent"in aa,Gh=!!aa.navigator.msPointerEnabled,
Hh=!1,Ih,Jh=[];if("WebGLRenderingContext"in aa)try{var Kh=th(document.createElement("CANVAS"),{failIfMajorPerformanceCaveat:!0});Kh&&(Hh=!0,Ih=Kh.getParameter(Kh.MAX_TEXTURE_SIZE),Jh=Kh.getSupportedExtensions())}catch(a){}uh=Hh;ua=Jh;ta=Ih;function Lh(a,c){this.b=a;this.c=c};function Mh(a){Lh.call(this,a,{mousedown:this.Vk,mousemove:this.Wk,mouseup:this.Zk,mouseover:this.Yk,mouseout:this.Xk});this.a=a.g;this.g=[]}y(Mh,Lh);function Nh(a,c){for(var d=a.g,e=c.clientX,f=c.clientY,g=0,h=d.length,k;g<h&&(k=d[g]);g++){var m=Math.abs(f-k[1]);if(25>=Math.abs(e-k[0])&&25>=m)return!0}return!1}function Oh(a){var c=Ph(a,a),d=c.preventDefault;c.preventDefault=function(){a.preventDefault();d()};c.pointerId=1;c.isPrimary=!0;c.pointerType="mouse";return c}l=Mh.prototype;
l.Vk=function(a){if(!Nh(this,a)){if((1).toString()in this.a){var c=Oh(a);Qh(this.b,Rh,c,a);delete this.a[(1).toString()]}c=Oh(a);this.a[(1).toString()]=a;Qh(this.b,Sh,c,a)}};l.Wk=function(a){if(!Nh(this,a)){var c=Oh(a);Qh(this.b,Th,c,a)}};l.Zk=function(a){if(!Nh(this,a)){var c=this.a[(1).toString()];c&&c.button===a.button&&(c=Oh(a),Qh(this.b,Uh,c,a),delete this.a[(1).toString()])}};l.Yk=function(a){if(!Nh(this,a)){var c=Oh(a);Vh(this.b,c,a)}};
l.Xk=function(a){if(!Nh(this,a)){var c=Oh(a);Wh(this.b,c,a)}};function Xh(a){Lh.call(this,a,{MSPointerDown:this.dl,MSPointerMove:this.el,MSPointerUp:this.hl,MSPointerOut:this.fl,MSPointerOver:this.gl,MSPointerCancel:this.cl,MSGotPointerCapture:this.al,MSLostPointerCapture:this.bl});this.a=a.g;this.g=["","unavailable","touch","pen","mouse"]}y(Xh,Lh);function Yh(a,c){var d=c;ja(c.pointerType)&&(d=Ph(c,c),d.pointerType=a.g[c.pointerType]);return d}l=Xh.prototype;l.dl=function(a){this.a[a.pointerId.toString()]=a;var c=Yh(this,a);Qh(this.b,Sh,c,a)};
l.el=function(a){var c=Yh(this,a);Qh(this.b,Th,c,a)};l.hl=function(a){var c=Yh(this,a);Qh(this.b,Uh,c,a);delete this.a[a.pointerId.toString()]};l.fl=function(a){var c=Yh(this,a);Wh(this.b,c,a)};l.gl=function(a){var c=Yh(this,a);Vh(this.b,c,a)};l.cl=function(a){var c=Yh(this,a);Qh(this.b,Rh,c,a);delete this.a[a.pointerId.toString()]};l.bl=function(a){this.b.b(new jh("lostpointercapture",a,a))};l.al=function(a){this.b.b(new jh("gotpointercapture",a,a))};function Zh(a){Lh.call(this,a,{pointerdown:this.Bn,pointermove:this.Cn,pointerup:this.Fn,pointerout:this.Dn,pointerover:this.En,pointercancel:this.An,gotpointercapture:this.jk,lostpointercapture:this.Uk})}y(Zh,Lh);l=Zh.prototype;l.Bn=function(a){$h(this.b,a)};l.Cn=function(a){$h(this.b,a)};l.Fn=function(a){$h(this.b,a)};l.Dn=function(a){$h(this.b,a)};l.En=function(a){$h(this.b,a)};l.An=function(a){$h(this.b,a)};l.Uk=function(a){$h(this.b,a)};l.jk=function(a){$h(this.b,a)};function ai(a,c){Lh.call(this,a,{touchstart:this.Io,touchmove:this.Ho,touchend:this.Go,touchcancel:this.Fo});this.a=a.g;this.j=c;this.g=void 0;this.i=0;this.f=void 0}y(ai,Lh);l=ai.prototype;l.Lh=function(){this.i=0;this.f=void 0};
function bi(a,c,d){c=Ph(c,d);c.pointerId=d.identifier+2;c.bubbles=!0;c.cancelable=!0;c.detail=a.i;c.button=0;c.buttons=1;c.width=d.webkitRadiusX||d.radiusX||0;c.height=d.webkitRadiusY||d.radiusY||0;c.pressure=d.webkitForce||d.force||.5;c.isPrimary=a.g===d.identifier;c.pointerType="touch";c.clientX=d.clientX;c.clientY=d.clientY;c.screenX=d.screenX;c.screenY=d.screenY;return c}
function ci(a,c,d){function e(){c.preventDefault()}var f=Array.prototype.slice.call(c.changedTouches),g=f.length,h,k;for(h=0;h<g;++h)k=bi(a,c,f[h]),k.preventDefault=e,d.call(a,c,k)}
l.Io=function(a){var c=a.touches,d=Object.keys(this.a),e=d.length;if(e>=c.length){var f=[],g,h,k;for(g=0;g<e;++g){h=d[g];k=this.a[h];var m;if(!(m=1==h))a:{m=c.length;for(var n=void 0,p=0;p<m;p++)if(n=c[p],n.identifier===h-2){m=!0;break a}m=!1}m||f.push(k.zc)}for(g=0;g<f.length;++g)this.Te(a,f[g])}c=a.changedTouches[0];d=Object.keys(this.a).length;if(0===d||1===d&&(1).toString()in this.a)this.g=c.identifier,void 0!==this.f&&aa.clearTimeout(this.f);di(this,a);this.i++;ci(this,a,this.wn)};
l.wn=function(a,c){this.a[c.pointerId]={target:c.target,zc:c,uh:c.target};var d=this.b;c.bubbles=!0;Qh(d,ei,c,a);d=this.b;c.bubbles=!1;Qh(d,fi,c,a);Qh(this.b,Sh,c,a)};l.Ho=function(a){a.preventDefault();ci(this,a,this.$k)};l.$k=function(a,c){var d=this.a[c.pointerId];if(d){var e=d.zc,f=d.uh;Qh(this.b,Th,c,a);e&&f!==c.target&&(e.relatedTarget=c.target,c.relatedTarget=f,e.target=f,c.target?(Wh(this.b,e,a),Vh(this.b,c,a)):(c.target=f,c.relatedTarget=null,this.Te(a,c)));d.zc=c;d.uh=c.target}};
l.Go=function(a){di(this,a);ci(this,a,this.Jo)};l.Jo=function(a,c){Qh(this.b,Uh,c,a);this.b.zc(c,a);var d=this.b;c.bubbles=!1;Qh(d,gi,c,a);delete this.a[c.pointerId];c.isPrimary&&(this.g=void 0,this.f=aa.setTimeout(this.Lh.bind(this),200))};l.Fo=function(a){ci(this,a,this.Te)};l.Te=function(a,c){Qh(this.b,Rh,c,a);this.b.zc(c,a);var d=this.b;c.bubbles=!1;Qh(d,gi,c,a);delete this.a[c.pointerId];c.isPrimary&&(this.g=void 0,this.f=aa.setTimeout(this.Lh.bind(this),200))};
function di(a,c){var d=a.j.g,e=c.changedTouches[0];if(a.g===e.identifier){var f=[e.clientX,e.clientY];d.push(f);aa.setTimeout(function(){Ya(d,f)},2500)}};function hi(a){Hb.call(this);this.i=a;this.g={};this.c={};this.a=[];Fh?ii(this,new Zh(this)):Gh?ii(this,new Xh(this)):(a=new Mh(this),ii(this,a),Eh&&ii(this,new ai(this,a)));a=this.a.length;for(var c,d=0;d<a;d++)c=this.a[d],ji(this,Object.keys(c.c))}y(hi,Hb);function ii(a,c){var d=Object.keys(c.c);d&&(d.forEach(function(a){var d=c.c[a];d&&(this.c[a]=d.bind(c))},a),a.a.push(c))}hi.prototype.f=function(a){var c=this.c[a.type];c&&c(a)};
function ji(a,c){c.forEach(function(a){D(this.i,a,this.f,this)},a)}function ki(a,c){c.forEach(function(a){yb(this.i,a,this.f,this)},a)}function Ph(a,c){for(var d={},e,f=0,g=li.length;f<g;f++)e=li[f][0],d[e]=a[e]||c[e]||li[f][1];return d}hi.prototype.zc=function(a,c){a.bubbles=!0;Qh(this,mi,a,c)};function Wh(a,c,d){a.zc(c,d);var e=c.relatedTarget;e&&Mf(c.target,e)||(c.bubbles=!1,Qh(a,gi,c,d))}
function Vh(a,c,d){c.bubbles=!0;Qh(a,ei,c,d);var e=c.relatedTarget;e&&Mf(c.target,e)||(c.bubbles=!1,Qh(a,fi,c,d))}function Qh(a,c,d,e){a.b(new jh(c,e,d))}function $h(a,c){a.b(new jh(c.type,c,c))}hi.prototype.fa=function(){for(var a=this.a.length,c,d=0;d<a;d++)c=this.a[d],ki(this,Object.keys(c.c));hi.ia.fa.call(this)};
var Th="pointermove",Sh="pointerdown",Uh="pointerup",ei="pointerover",mi="pointerout",fi="pointerenter",gi="pointerleave",Rh="pointercancel",li=[["bubbles",!1],["cancelable",!1],["view",null],["detail",null],["screenX",0],["screenY",0],["clientX",0],["clientY",0],["ctrlKey",!1],["altKey",!1],["shiftKey",!1],["metaKey",!1],["button",0],["relatedTarget",null],["buttons",0],["pointerId",0],["width",0],["height",0],["pressure",0],["tiltX",0],["tiltY",0],["pointerType",""],["hwTimestamp",0],["isPrimary",
!1],["type",""],["target",null],["currentTarget",null],["which",0]];function ni(a,c,d,e,f){ig.call(this,a,c,f);this.originalEvent=d;this.pixel=c.Td(d);this.coordinate=c.La(this.pixel);this.dragging=void 0!==e?e:!1}y(ni,ig);ni.prototype.preventDefault=function(){ni.ia.preventDefault.call(this);this.originalEvent.preventDefault()};ni.prototype.stopPropagation=function(){ni.ia.stopPropagation.call(this);this.originalEvent.stopPropagation()};function oi(a,c,d,e,f){ni.call(this,a,c,d.b,e,f);this.b=d}y(oi,ni);
function pi(a){Hb.call(this);this.f=a;this.j=0;this.l=!1;this.c=[];this.g=null;a=this.f.a;this.T=0;this.A={};this.i=new hi(a);this.a=null;this.o=D(this.i,Sh,this.Dk,this);this.s=D(this.i,Th,this.co,this)}y(pi,Hb);function qi(a,c){var d;d=new oi(ri,a.f,c);a.b(d);0!==a.j?(aa.clearTimeout(a.j),a.j=0,d=new oi(si,a.f,c),a.b(d)):a.j=aa.setTimeout(function(){this.j=0;var a=new oi(ti,this.f,c);this.b(a)}.bind(a),250)}
function ui(a,c){c.type==vi||c.type==wi?delete a.A[c.pointerId]:c.type==xi&&(a.A[c.pointerId]=!0);a.T=Object.keys(a.A).length}l=pi.prototype;l.Gg=function(a){ui(this,a);var c=new oi(vi,this.f,a);this.b(c);!this.l&&0===a.button&&qi(this,this.g);0===this.T&&(this.c.forEach(sb),this.c.length=0,this.l=!1,this.g=null,Db(this.a),this.a=null)};
l.Dk=function(a){ui(this,a);var c=new oi(xi,this.f,a);this.b(c);this.g=a;0===this.c.length&&(this.a=new hi(document),this.c.push(D(this.a,yi,this.ul,this),D(this.a,vi,this.Gg,this),D(this.i,wi,this.Gg,this)))};l.ul=function(a){if(a.clientX!=this.g.clientX||a.clientY!=this.g.clientY){this.l=!0;var c=new oi(zi,this.f,a,this.l);this.b(c)}a.preventDefault()};l.co=function(a){this.b(new oi(a.type,this.f,a,!(!this.g||a.clientX==this.g.clientX&&a.clientY==this.g.clientY)))};
l.fa=function(){this.s&&(sb(this.s),this.s=null);this.o&&(sb(this.o),this.o=null);this.c.forEach(sb);this.c.length=0;this.a&&(Db(this.a),this.a=null);this.i&&(Db(this.i),this.i=null);pi.ia.fa.call(this)};var ti="singleclick",ri="click",si="dblclick",zi="pointerdrag",yi="pointermove",xi="pointerdown",vi="pointerup",wi="pointercancel",Ai={ap:ti,Qo:ri,Ro:si,Uo:zi,Xo:yi,To:xi,$o:vi,Zo:"pointerover",Yo:"pointerout",Vo:"pointerenter",Wo:"pointerleave",So:wi};function Bi(a){Mb.call(this);var c=mb({},a);c.opacity=void 0!==a.opacity?a.opacity:1;c.visible=void 0!==a.visible?a.visible:!0;c.zIndex=void 0!==a.zIndex?a.zIndex:0;c.maxResolution=void 0!==a.maxResolution?a.maxResolution:Infinity;c.minResolution=void 0!==a.minResolution?a.minResolution:0;this.C(c)}y(Bi,Mb);
function Ci(a){var c=a.Sb(),d=a.df(),e=a.wb(),f=a.G(),g=a.Tb(),h=a.Nb(),k=a.Ob();return{layer:a,opacity:La(c,0,1),H:d,visible:e,Pc:!0,extent:f,zIndex:g,maxResolution:h,minResolution:Math.max(k,0)}}l=Bi.prototype;l.G=function(){return this.get("extent")};l.Nb=function(){return this.get("maxResolution")};l.Ob=function(){return this.get("minResolution")};l.Sb=function(){return this.get("opacity")};l.wb=function(){return this.get("visible")};l.Tb=function(){return this.get("zIndex")};
l.cc=function(a){this.set("extent",a)};l.kc=function(a){this.set("maxResolution",a)};l.lc=function(a){this.set("minResolution",a)};l.dc=function(a){this.set("opacity",a)};l.ec=function(a){this.set("visible",a)};l.fc=function(a){this.set("zIndex",a)};function Di(){};function Ei(a,c,d,e,f,g){Eb.call(this,a,c);this.vectorContext=d;this.frameState=e;this.context=f;this.glContext=g}y(Ei,Eb);function Fi(a){var c=mb({},a);delete c.source;Bi.call(this,c);this.o=this.l=this.j=null;a.map&&this.setMap(a.map);D(this,Ob("source"),this.Jk,this);this.Cc(a.source?a.source:null)}y(Fi,Bi);function Gi(a,c){return a.visible&&c>=a.minResolution&&c<a.maxResolution}l=Fi.prototype;l.cf=function(a){a=a?a:[];a.push(Ci(this));return a};l.da=function(){return this.get("source")||null};l.df=function(){var a=this.da();return a?a.V():"undefined"};l.lm=function(){this.u()};
l.Jk=function(){this.o&&(sb(this.o),this.o=null);var a=this.da();a&&(this.o=D(a,"change",this.lm,this));this.u()};l.setMap=function(a){this.j&&(sb(this.j),this.j=null);a||this.u();this.l&&(sb(this.l),this.l=null);a&&(this.j=D(a,"precompose",function(a){var d=Ci(this);d.Pc=!1;d.zIndex=Infinity;a.frameState.layerStatesArray.push(d);a.frameState.layerStates[x(this)]=d},this),this.l=D(this,"change",a.render,a),this.u())};l.Cc=function(a){this.set("source",a)};function Hi(a,c,d,e,f){Hb.call(this);this.o=f;this.extent=a;this.f=d;this.resolution=c;this.state=e}y(Hi,Hb);function Ii(a){a.b("change")}Hi.prototype.ea=function(){return this.o};Hi.prototype.G=function(){return this.extent};Hi.prototype.Z=function(){return this.resolution};Hi.prototype.V=function(){return this.state};function Ji(a,c,d,e,f,g,h,k){rc(a);0===c&&0===d||uc(a,c,d);1==e&&1==f||vc(a,e,f);0!==g&&wc(a,g);0===h&&0===k||uc(a,h,k);return a}function Ki(a,c){return a[0]==c[0]&&a[1]==c[1]&&a[4]==c[4]&&a[5]==c[5]&&a[12]==c[12]&&a[13]==c[13]}function Li(a,c,d){var e=a[1],f=a[5],g=a[13],h=c[0];c=c[1];d[0]=a[0]*h+a[4]*c+a[12];d[1]=e*h+f*c+g;return d};function Mi(a){Jb.call(this);this.a=a}y(Mi,Jb);l=Mi.prototype;l.gb=va;l.yc=function(a,c,d,e){a=a.slice();Li(c.pixelToCoordinateMatrix,a,a);if(this.gb(a,c,fd,this))return d.call(e,this.a)};l.ne=ed;l.cd=function(a,c,d){return function(e,f){return Jg(a,c,e,f,function(a){d[e]||(d[e]={});d[e][a.ga.toString()]=a})}};l.pm=function(a){2===a.target.V()&&Ni(this)};function Oi(a,c){var d=c.V();2!=d&&3!=d&&D(c,"change",a.pm,a);0==d&&(c.load(),d=c.V());return 2==d}
function Ni(a){var c=a.a;c.wb()&&"ready"==c.df()&&a.u()}function Pi(a,c){c.lh()&&a.postRenderFunctions.push(ra(function(a,c,f){c=x(a).toString();a.mh(f.viewState.projection,f.usedTiles[c])},c))}function Qi(a,c){if(c){var d,e,f;e=0;for(f=c.length;e<f;++e)d=c[e],a[x(d).toString()]=d}}function Ri(a,c){var d=c.D;void 0!==d&&("string"===typeof d?a.logos[d]="":la(d)&&(a.logos[d.src]=d.href))}
function Si(a,c,d,e){c=x(c).toString();d=d.toString();c in a?d in a[c]?(a=a[c][d],e.ra<a.ra&&(a.ra=e.ra),e.va>a.va&&(a.va=e.va),e.xa<a.xa&&(a.xa=e.xa),e.Aa>a.Aa&&(a.Aa=e.Aa)):a[c][d]=e:(a[c]={},a[c][d]=e)}function Ti(a,c,d){return[c*(Math.round(a[0]/c)+d[0]%2/2),c*(Math.round(a[1]/c)+d[1]%2/2)]}
function Ui(a,c,d,e,f,g,h,k,m,n){var p=x(c).toString();p in a.wantedTiles||(a.wantedTiles[p]={});var q=a.wantedTiles[p];a=a.tileQueue;var r=d.minZoom,t,v,w,A,B,z;for(z=h;z>=r;--z)for(v=yg(d,g,z,v),w=d.Z(z),A=v.ra;A<=v.va;++A)for(B=v.xa;B<=v.Aa;++B)h-z<=k?(t=c.Qb(z,A,B,e,f),0==t.V()&&(q[t.ga.toString()]=!0,t.eb()in a.g||a.f([t,p,Cg(d,t.ga),w])),void 0!==m&&m.call(n,t)):c.Of(z,A,B,f)};function Vi(a){this.A=a.opacity;this.B=a.rotateWithView;this.s=a.rotation;this.j=a.scale;this.J=a.snapToPixel}l=Vi.prototype;l.re=function(){return this.A};l.Yd=function(){return this.B};l.se=function(){return this.s};l.te=function(){return this.j};l.Zd=function(){return this.J};l.ue=function(a){this.A=a};l.ve=function(a){this.s=a};l.we=function(a){this.j=a};function Wi(a){a=a||{};this.c=void 0!==a.anchor?a.anchor:[.5,.5];this.f=null;this.a=void 0!==a.anchorOrigin?a.anchorOrigin:"top-left";this.l=void 0!==a.anchorXUnits?a.anchorXUnits:"fraction";this.o=void 0!==a.anchorYUnits?a.anchorYUnits:"fraction";var c=void 0!==a.crossOrigin?a.crossOrigin:null,d=void 0!==a.img?a.img:null,e=void 0!==a.imgSize?a.imgSize:null,f=a.src;void 0!==f&&0!==f.length||!d||(f=d.src||x(d).toString());var g=void 0!==a.src?0:2,h=void 0!==a.color?Xe(a.color):null,k=Xi.Zb(),m=k.get(f,
c,h);m||(m=new Yi(d,f,e,c,g,h),k.set(f,c,h,m));this.b=m;this.D=void 0!==a.offset?a.offset:[0,0];this.g=void 0!==a.offsetOrigin?a.offsetOrigin:"top-left";this.i=null;this.T=void 0!==a.size?a.size:null;Vi.call(this,{opacity:void 0!==a.opacity?a.opacity:1,rotation:void 0!==a.rotation?a.rotation:0,scale:void 0!==a.scale?a.scale:1,snapToPixel:void 0!==a.snapToPixel?a.snapToPixel:!0,rotateWithView:void 0!==a.rotateWithView?a.rotateWithView:!1})}y(Wi,Vi);l=Wi.prototype;
l.Yb=function(){if(this.f)return this.f;var a=this.c,c=this.Eb();if("fraction"==this.l||"fraction"==this.o){if(!c)return null;a=this.c.slice();"fraction"==this.l&&(a[0]*=c[0]);"fraction"==this.o&&(a[1]*=c[1])}if("top-left"!=this.a){if(!c)return null;a===this.c&&(a=this.c.slice());if("top-right"==this.a||"bottom-right"==this.a)a[0]=-a[0]+c[0];if("bottom-left"==this.a||"bottom-right"==this.a)a[1]=-a[1]+c[1]}return this.f=a};l.gc=function(){var a=this.b;return a.c?a.c:a.a};l.qd=function(){return this.b.f};
l.wd=function(){return this.b.g};l.qe=function(){var a=this.b;if(!a.l)if(a.s){var c=a.f[0],d=a.f[1],e=nh(c,d);e.fillRect(0,0,c,d);a.l=e.canvas}else a.l=a.a;return a.l};l.Ha=function(){if(this.i)return this.i;var a=this.D;if("top-left"!=this.g){var c=this.Eb(),d=this.b.f;if(!c||!d)return null;a=a.slice();if("top-right"==this.g||"bottom-right"==this.g)a[0]=d[0]-c[0]-a[0];if("bottom-left"==this.g||"bottom-right"==this.g)a[1]=d[1]-c[1]-a[1]}return this.i=a};l.Tm=function(){return this.b.o};
l.Eb=function(){return this.T?this.T:this.b.f};l.hf=function(a,c){return D(this.b,"change",a,c)};l.load=function(){this.b.load()};l.Nf=function(a,c){yb(this.b,"change",a,c)};function Yi(a,c,d,e,f,g){Hb.call(this);this.l=null;this.a=a?a:new Image;null!==e&&(this.a.crossOrigin=e);this.c=g?document.createElement("CANVAS"):null;this.j=g;this.i=null;this.g=f;this.f=d;this.o=c;this.s=!1;2==this.g&&Zi(this)}y(Yi,Hb);
function Zi(a){var c=nh(1,1);try{c.drawImage(a.a,0,0),c.getImageData(0,0,1,1)}catch(d){a.s=!0}}Yi.prototype.A=function(){this.g=3;this.i.forEach(sb);this.i=null;this.b("change")};
Yi.prototype.T=function(){this.g=2;this.f=[this.a.width,this.a.height];this.i.forEach(sb);this.i=null;Zi(this);if(!this.s&&null!==this.j){this.c.width=this.a.width;this.c.height=this.a.height;var a=this.c.getContext("2d");a.drawImage(this.a,0,0);for(var c=a.getImageData(0,0,this.a.width,this.a.height),d=c.data,e=this.j[0]/255,f=this.j[1]/255,g=this.j[2]/255,h=0,k=d.length;h<k;h+=4)d[h]*=e,d[h+1]*=f,d[h+2]*=g;a.putImageData(c,0,0)}this.b("change")};
Yi.prototype.load=function(){if(0==this.g){this.g=1;this.i=[xb(this.a,"error",this.A,this),xb(this.a,"load",this.T,this)];try{this.a.src=this.o}catch(a){this.A()}}};function Xi(){this.b={};this.a=0}ca(Xi);Xi.prototype.clear=function(){this.b={};this.a=0};Xi.prototype.get=function(a,c,d){a=c+":"+a+":"+(d?Ze(d):"null");return a in this.b?this.b[a]:null};Xi.prototype.set=function(a,c,d,e){this.b[c+":"+a+":"+(d?Ze(d):"null")]=e;++this.a};function $i(a,c){zb.call(this);this.i=c;this.g={};this.s={}}y($i,zb);function aj(a){var c=a.viewState,d=a.coordinateToPixelMatrix;Ji(d,a.size[0]/2,a.size[1]/2,1/c.resolution,-1/c.resolution,-c.rotation,-c.center[0],-c.center[1]);tc(d,a.pixelToCoordinateMatrix)}l=$i.prototype;l.fa=function(){for(var a in this.g)Db(this.g[a]);$i.ia.fa.call(this)};function bj(){var a=Xi.Zb();if(32<a.a){var c=0,d,e;for(d in a.b)e=a.b[d],0!==(c++&3)||Ib(e)||(delete a.b[d],--a.a)}}
l.qf=function(a,c,d,e,f,g){function h(a,f){var g=x(a).toString(),h=c.layerStates[x(f)].Pc;if(!(g in c.skippedFeatureUids)||h)return d.call(e,a,h?f:null)}var k,m=c.viewState,n=m.resolution,p=m.projection,m=a;if(p.b){var p=p.G(),q=Wc(p),r=a[0];if(r<p[0]||r>p[2])m=[r+q*Math.ceil((p[0]-r)/q),a[1]]}p=c.layerStatesArray;for(q=p.length-1;0<=q;--q){var t=p[q],r=t.layer;if(Gi(t,n)&&f.call(g,r)&&(t=cj(this,r),r.da()&&(k=t.gb(sg(r.da())?m:a,c,h,e)),k))return k}};
l.gh=function(a,c,d,e,f,g){var h,k=c.viewState.resolution,m=c.layerStatesArray,n;for(n=m.length-1;0<=n;--n){h=m[n];var p=h.layer;if(Gi(h,k)&&f.call(g,p)&&(h=cj(this,p).yc(a,c,d,e)))return h}};l.hh=function(a,c,d,e){return void 0!==this.qf(a,c,fd,this,d,e)};function cj(a,c){var d=x(c).toString();if(d in a.g)return a.g[d];var e=a.We(c);a.g[d]=e;a.s[d]=D(e,"change",a.uk,a);return e}l.uk=function(){this.i.render()};l.De=va;
l.ko=function(a,c){for(var d in this.g)if(!(c&&d in c.layerStates)){var e=d,f=this.g[e];delete this.g[e];sb(this.s[e]);delete this.s[e];Db(f)}};function dj(a,c){for(var d in a.g)if(!(d in c.layerStates)){c.postRenderFunctions.push(a.ko.bind(a));break}}function db(a,c){return a.zIndex-c.zIndex};function ej(a,c){this.o=a;this.i=c;this.b=[];this.a=[];this.g={}}ej.prototype.clear=function(){this.b.length=0;this.a.length=0;nb(this.g)};function fj(a){var c=a.b,d=a.a,e=c[0];1==c.length?(c.length=0,d.length=0):(c[0]=c.pop(),d[0]=d.pop(),gj(a,0));c=a.i(e);delete a.g[c];return e}ej.prototype.f=function(a){var c=this.o(a);return Infinity!=c?(this.b.push(a),this.a.push(c),this.g[this.i(a)]=!0,hj(this,0,this.b.length-1),!0):!1};ej.prototype.rc=function(){return this.b.length};
ej.prototype.Oa=function(){return 0===this.b.length};function gj(a,c){for(var d=a.b,e=a.a,f=d.length,g=d[c],h=e[c],k=c;c<f>>1;){var m=2*c+1,n=2*c+2,m=n<f&&e[n]<e[m]?n:m;d[c]=d[m];e[c]=e[m];c=m}d[c]=g;e[c]=h;hj(a,k,c)}function hj(a,c,d){var e=a.b;a=a.a;for(var f=e[d],g=a[d];d>c;){var h=d-1>>1;if(a[h]>g)e[d]=e[h],a[d]=a[h],d=h;else break}e[d]=f;a[d]=g}
function ij(a){var c=a.o,d=a.b,e=a.a,f=0,g=d.length,h,k,m;for(k=0;k<g;++k)h=d[k],m=c(h),Infinity==m?delete a.g[a.i(h)]:(e[f]=m,d[f++]=h);d.length=f;e.length=f;for(c=(a.b.length>>1)-1;0<=c;c--)gj(a,c)};function jj(a,c){ej.call(this,function(c){return a.apply(null,c)},function(a){return a[0].eb()});this.s=c;this.c=0;this.j={}}y(jj,ej);jj.prototype.f=function(a){var c=jj.ia.f.call(this,a);c&&D(a[0],"change",this.l,this);return c};jj.prototype.l=function(a){a=a.target;var c=a.V();if(2===c||3===c||4===c)yb(a,"change",this.l,this),a=a.eb(),a in this.j&&(delete this.j[a],--this.c),this.s()};
function kj(a,c,d){for(var e=0,f;a.c<c&&e<d&&0<a.rc();)f=fj(a)[0],0===f.V()&&(a.j[f.eb()]=!0,++a.c,++e,f.load())};function lj(a,c,d){this.f=a;this.g=c;this.i=d;this.b=[];this.a=this.c=0}function mj(a,c){var d=a.f,e=a.a,f=a.g-e,g=Math.log(a.g/a.a)/a.f;return He({source:c,duration:g,easing:function(a){return e*(Math.exp(d*a*g)-1)/f}})};function nj(a){Mb.call(this);this.A=null;this.i(!0);this.handleEvent=a.handleEvent}y(nj,Mb);nj.prototype.f=function(){return this.get("active")};nj.prototype.j=function(){return this.A};nj.prototype.i=function(a){this.set("active",a)};nj.prototype.setMap=function(a){this.A=a};function oj(a,c,d,e,f){if(void 0!==d){var g=c.Ka(),h=c.Wa();void 0!==g&&h&&f&&0<f&&(a.Ra(Ie({rotation:g,duration:f,easing:De})),e&&a.Ra(He({source:h,duration:f,easing:De})));c.rotate(d,e)}}
function pj(a,c,d,e,f){var g=c.Z();d=c.constrainResolution(g,d,0);qj(a,c,d,e,f)}function qj(a,c,d,e,f){if(d){var g=c.Z(),h=c.Wa();void 0!==g&&h&&d!==g&&f&&0<f&&(a.Ra(Je({resolution:g,duration:f,easing:De})),e&&a.Ra(He({source:h,duration:f,easing:De})));if(e){var k;a=c.Wa();f=c.Z();void 0!==a&&void 0!==f&&(k=[e[0]-d*(e[0]-a[0])/f,e[1]-d*(e[1]-a[1])/f]);c.mb(k)}c.Vb(d)}};function rj(a){a=a?a:{};this.a=a.delta?a.delta:1;nj.call(this,{handleEvent:sj});this.c=void 0!==a.duration?a.duration:250}y(rj,nj);function sj(a){var c=!1,d=a.originalEvent;if(a.type==si){var c=a.map,e=a.coordinate,d=d.shiftKey?-this.a:this.a,f=c.$();pj(c,f,d,e,this.c);a.preventDefault();c=!0}return!c};function tj(a){a=a.originalEvent;return a.altKey&&!(a.metaKey||a.ctrlKey)&&a.shiftKey}function uj(a){a=a.originalEvent;return 0==a.button&&!(nf&&yh&&a.ctrlKey)}function vj(a){return"pointermove"==a.type}function wj(a){return a.type==ti}function xj(a){a=a.originalEvent;return!a.altKey&&!(a.metaKey||a.ctrlKey)&&!a.shiftKey}function yj(a){a=a.originalEvent;return!a.altKey&&!(a.metaKey||a.ctrlKey)&&a.shiftKey}
function zj(a){a=a.originalEvent.target.tagName;return"INPUT"!==a&&"SELECT"!==a&&"TEXTAREA"!==a}function Aj(a){return"mouse"==a.b.pointerType};function Bj(a){a=a?a:{};nj.call(this,{handleEvent:a.handleEvent?a.handleEvent:Cj});this.Ec=a.handleDownEvent?a.handleDownEvent:ed;this.$c=a.handleDragEvent?a.handleDragEvent:va;this.Ne=a.handleMoveEvent?a.handleMoveEvent:va;this.Ni=a.handleUpEvent?a.handleUpEvent:ed;this.J=!1;this.Da={};this.l=[]}y(Bj,nj);function Dj(a){for(var c=a.length,d=0,e=0,f=0;f<c;f++)d+=a[f].clientX,e+=a[f].clientY;return[d/c,e/c]}
function Cj(a){if(!(a instanceof oi))return!0;var c=!1,d=a.type;if(d===xi||d===zi||d===vi)d=a.b,a.type==vi?delete this.Da[d.pointerId]:a.type==xi?this.Da[d.pointerId]=d:d.pointerId in this.Da&&(this.Da[d.pointerId]=d),this.l=ob(this.Da);this.J&&(a.type==zi?this.$c(a):a.type==vi&&(this.J=this.Ni(a)));a.type==xi?(this.J=a=this.Ec(a),c=this.Dc(a)):a.type==yi&&this.Ne(a);return!c}Bj.prototype.Dc=hd;function Ej(a){Bj.call(this,{handleDownEvent:Fj,handleDragEvent:Gj,handleUpEvent:Hj});a=a?a:{};this.a=a.kinetic;this.c=this.o=null;this.B=a.condition?a.condition:xj;this.s=!1}y(Ej,Bj);function Gj(a){var c=Dj(this.l);this.a&&this.a.b.push(c[0],c[1],Date.now());if(this.c){var d=this.c[0]-c[0],e=c[1]-this.c[1];a=a.map;var f=a.$(),g=f.V(),e=d=[d,e],h=g.resolution;e[0]*=h;e[1]*=h;gc(d,g.rotation);bc(d,g.center);d=f.Qd(d);a.render();f.mb(d)}this.c=c}
function Hj(a){a=a.map;var c=a.$();if(0===this.l.length){var d;if(d=!this.s&&this.a)if(d=this.a,6>d.b.length)d=!1;else{var e=Date.now()-d.i,f=d.b.length-3;if(d.b[f+2]<e)d=!1;else{for(var g=f-3;0<g&&d.b[g+2]>e;)g-=3;var e=d.b[f+2]-d.b[g+2],h=d.b[f]-d.b[g],f=d.b[f+1]-d.b[g+1];d.c=Math.atan2(f,h);d.a=Math.sqrt(h*h+f*f)/e;d=d.a>d.g}}d&&(d=this.a,d=(d.g-d.a)/d.f,f=this.a.c,g=c.Wa(),this.o=mj(this.a,g),a.Ra(this.o),g=a.Ta(g),d=a.La([g[0]-d*Math.cos(f),g[1]-d*Math.sin(f)]),d=c.Qd(d),c.mb(d));Be(c,-1);a.render();
return!1}this.c=null;return!0}function Fj(a){if(0<this.l.length&&this.B(a)){var c=a.map,d=c.$();this.c=null;this.J||Be(d,1);c.render();this.o&&Ya(c.H,this.o)&&(d.mb(a.frameState.viewState.center),this.o=null);this.a&&(a=this.a,a.b.length=0,a.c=0,a.a=0);this.s=1<this.l.length;return!0}return!1}Ej.prototype.Dc=ed;function Ij(a){a=a?a:{};Bj.call(this,{handleDownEvent:Jj,handleDragEvent:Kj,handleUpEvent:Lj});this.c=a.condition?a.condition:tj;this.a=void 0;this.o=void 0!==a.duration?a.duration:250}y(Ij,Bj);function Kj(a){if(Aj(a)){var c=a.map,d=c.Va();a=a.pixel;d=Math.atan2(d[1]/2-a[1],a[0]-d[0]/2);if(void 0!==this.a){a=d-this.a;var e=c.$(),f=e.Ka();c.render();oj(c,e,f-a)}this.a=d}}
function Lj(a){if(!Aj(a))return!0;a=a.map;var c=a.$();Be(c,-1);var d=c.Ka(),e=this.o,d=c.constrainRotation(d,0);oj(a,c,d,void 0,e);return!1}function Jj(a){return Aj(a)&&uj(a)&&this.c(a)?(a=a.map,Be(a.$(),1),a.render(),this.a=void 0,!0):!1}Ij.prototype.Dc=ed;function Mj(a){this.f=null;this.a=document.createElement("div");this.a.style.position="absolute";this.a.className="ol-box "+a;this.g=this.c=this.b=null}y(Mj,zb);Mj.prototype.fa=function(){this.setMap(null);Mj.ia.fa.call(this)};function Nj(a){var c=a.c,d=a.g;a=a.a.style;a.left=Math.min(c[0],d[0])+"px";a.top=Math.min(c[1],d[1])+"px";a.width=Math.abs(d[0]-c[0])+"px";a.height=Math.abs(d[1]-c[1])+"px"}
Mj.prototype.setMap=function(a){if(this.b){this.b.B.removeChild(this.a);var c=this.a.style;c.left=c.top=c.width=c.height="inherit"}(this.b=a)&&this.b.B.appendChild(this.a)};function Oj(a){var c=a.c,d=a.g,c=[c,[c[0],d[1]],d,[d[0],c[1]]].map(a.b.La,a.b);c[4]=c[0].slice();a.f?a.f.la([c]):a.f=new F([c])}Mj.prototype.X=function(){return this.f};function Pj(a,c,d){Eb.call(this,a);this.coordinate=c;this.mapBrowserEvent=d}y(Pj,Eb);function Qj(a){Bj.call(this,{handleDownEvent:Rj,handleDragEvent:Sj,handleUpEvent:Tj});a=a?a:{};this.a=new Mj(a.className||"ol-dragbox");this.c=null;this.D=a.condition?a.condition:fd;this.B=a.boxEndCondition?a.boxEndCondition:Uj}y(Qj,Bj);function Uj(a,c,d){a=d[0]-c[0];c=d[1]-c[1];return 64<=a*a+c*c}
function Sj(a){if(Aj(a)){var c=this.a,d=a.pixel;c.c=this.c;c.g=d;Oj(c);Nj(c);this.b(new Pj("boxdrag",a.coordinate,a))}}Qj.prototype.X=function(){return this.a.X()};Qj.prototype.s=va;function Tj(a){if(!Aj(a))return!0;this.a.setMap(null);this.B(a,this.c,a.pixel)&&(this.s(a),this.b(new Pj("boxend",a.coordinate,a)));return!1}
function Rj(a){if(Aj(a)&&uj(a)&&this.D(a)){this.c=a.pixel;this.a.setMap(a.map);var c=this.a,d=this.c;c.c=this.c;c.g=d;Oj(c);Nj(c);this.b(new Pj("boxstart",a.coordinate,a));return!0}return!1};function Vj(a){a=a?a:{};var c=a.condition?a.condition:yj;this.o=void 0!==a.duration?a.duration:200;Qj.call(this,{condition:c,className:a.className||"ol-dragzoom"})}y(Vj,Qj);Vj.prototype.s=function(){var a=this.A,c=a.$(),d=a.Va(),e=this.X().G(),d=c.constrainResolution(Math.max(Wc(e)/d[0],Xc(e)/d[1])),f=c.Z(),g=c.Wa();a.Ra(Je({resolution:f,duration:this.o,easing:De}));a.Ra(He({source:g,duration:this.o,easing:De}));c.mb(Yc(e));c.Vb(d)};function Wj(a){nj.call(this,{handleEvent:Xj});a=a||{};this.a=void 0!==a.condition?a.condition:jd(xj,zj);this.c=void 0!==a.duration?a.duration:100;this.l=void 0!==a.pixelDelta?a.pixelDelta:128}y(Wj,nj);
function Xj(a){var c=!1;if("keydown"==a.type){var d=a.originalEvent.keyCode;if(this.a(a)&&(40==d||37==d||39==d||38==d)){var e=a.map,c=e.$(),f=c.Z()*this.l,g=0,h=0;40==d?h=-f:37==d?g=-f:39==d?g=f:h=f;d=[g,h];gc(d,c.Ka());f=this.c;if(g=c.Wa())f&&0<f&&e.Ra(He({source:g,duration:f,easing:Fe})),e=c.Qd([g[0]+d[0],g[1]+d[1]]),c.mb(e);a.preventDefault();c=!0}}return!c};function Yj(a){nj.call(this,{handleEvent:Zj});a=a?a:{};this.c=a.condition?a.condition:zj;this.a=a.delta?a.delta:1;this.l=void 0!==a.duration?a.duration:100}y(Yj,nj);function Zj(a){var c=!1;if("keydown"==a.type||"keypress"==a.type){var d=a.originalEvent.charCode;if(this.c(a)&&(43==d||45==d)){c=a.map;d=43==d?this.a:-this.a;c.render();var e=c.$();pj(c,e,d,void 0,this.l);a.preventDefault();c=!0}}return!c};function ak(a){nj.call(this,{handleEvent:bk});a=a||{};this.c=0;this.J=void 0!==a.duration?a.duration:250;this.s=void 0!==a.useAnchor?a.useAnchor:!0;this.a=null;this.o=this.l=void 0}y(ak,nj);
function bk(a){var c=!1;if("wheel"==a.type||"mousewheel"==a.type){var c=a.map,d=a.originalEvent;this.s&&(this.a=a.coordinate);var e;"wheel"==a.type?(e=d.deltaY,wh&&d.deltaMode===aa.WheelEvent.DOM_DELTA_PIXEL&&(e/=zh),d.deltaMode===aa.WheelEvent.DOM_DELTA_LINE&&(e*=40)):"mousewheel"==a.type&&(e=-d.wheelDeltaY,xh&&(e/=3));this.c+=e;void 0===this.l&&(this.l=Date.now());e=Math.max(80-(Date.now()-this.l),0);aa.clearTimeout(this.o);this.o=aa.setTimeout(this.B.bind(this,c),e);a.preventDefault();c=!0}return!c}
ak.prototype.B=function(a){var c=La(this.c,-1,1),d=a.$();a.render();pj(a,d,-c,this.a,this.J);this.c=0;this.a=null;this.o=this.l=void 0};ak.prototype.D=function(a){this.s=a;a||(this.a=null)};function ck(a){Bj.call(this,{handleDownEvent:dk,handleDragEvent:ek,handleUpEvent:fk});a=a||{};this.c=null;this.o=void 0;this.a=!1;this.s=0;this.D=void 0!==a.threshold?a.threshold:.3;this.B=void 0!==a.duration?a.duration:250}y(ck,Bj);
function ek(a){var c=0,d=this.l[0],e=this.l[1],d=Math.atan2(e.clientY-d.clientY,e.clientX-d.clientX);void 0!==this.o&&(c=d-this.o,this.s+=c,!this.a&&Math.abs(this.s)>this.D&&(this.a=!0));this.o=d;a=a.map;d=Zf(a.a);e=Dj(this.l);e[0]-=d.x;e[1]-=d.y;this.c=a.La(e);this.a&&(d=a.$(),e=d.Ka(),a.render(),oj(a,d,e+c,this.c))}function fk(a){if(2>this.l.length){a=a.map;var c=a.$();Be(c,-1);if(this.a){var d=c.Ka(),e=this.c,f=this.B,d=c.constrainRotation(d,0);oj(a,c,d,e,f)}return!1}return!0}
function dk(a){return 2<=this.l.length?(a=a.map,this.c=null,this.o=void 0,this.a=!1,this.s=0,this.J||Be(a.$(),1),a.render(),!0):!1}ck.prototype.Dc=ed;function gk(a){Bj.call(this,{handleDownEvent:hk,handleDragEvent:ik,handleUpEvent:jk});a=a?a:{};this.c=null;this.s=void 0!==a.duration?a.duration:400;this.a=void 0;this.o=1}y(gk,Bj);function ik(a){var c=1,d=this.l[0],e=this.l[1],f=d.clientX-e.clientX,d=d.clientY-e.clientY,f=Math.sqrt(f*f+d*d);void 0!==this.a&&(c=this.a/f);this.a=f;1!=c&&(this.o=c);a=a.map;var f=a.$(),d=f.Z(),e=Zf(a.a),g=Dj(this.l);g[0]-=e.x;g[1]-=e.y;this.c=a.La(g);a.render();qj(a,f,d*c,this.c)}
function jk(a){if(2>this.l.length){a=a.map;var c=a.$();Be(c,-1);var d=c.Z(),e=this.c,f=this.s,d=c.constrainResolution(d,0,this.o-1);qj(a,c,d,e,f);return!1}return!0}function hk(a){return 2<=this.l.length?(a=a.map,this.c=null,this.a=void 0,this.o=1,this.J||Be(a.$(),1),a.render(),!0):!1}gk.prototype.Dc=ed;function kk(a){a=a?a:{};var c=new Se,d=new lj(-.005,.05,100);(void 0!==a.altShiftDragRotate?a.altShiftDragRotate:1)&&c.push(new Ij);(void 0!==a.doubleClickZoom?a.doubleClickZoom:1)&&c.push(new rj({delta:a.zoomDelta,duration:a.zoomDuration}));(void 0!==a.dragPan?a.dragPan:1)&&c.push(new Ej({kinetic:d}));(void 0!==a.pinchRotate?a.pinchRotate:1)&&c.push(new ck);(void 0!==a.pinchZoom?a.pinchZoom:1)&&c.push(new gk({duration:a.zoomDuration}));if(void 0!==a.keyboard?a.keyboard:1)c.push(new Wj),c.push(new Yj({delta:a.zoomDelta,
duration:a.zoomDuration}));(void 0!==a.mouseWheelZoom?a.mouseWheelZoom:1)&&c.push(new ak({duration:a.zoomDuration}));(void 0!==a.shiftDragZoom?a.shiftDragZoom:1)&&c.push(new Vj({duration:a.zoomDuration}));return c};function lk(a){var c=a||{};a=mb({},c);delete a.layers;c=c.layers;Bi.call(this,a);this.f=[];this.a={};D(this,Ob("layers"),this.wk,this);c?ga(c)&&(c=new Se(c.slice())):c=new Se;this.dh(c)}y(lk,Bi);l=lk.prototype;l.be=function(){this.wb()&&this.u()};
l.wk=function(){this.f.forEach(sb);this.f.length=0;var a=this.Sc();this.f.push(D(a,"add",this.vk,this),D(a,"remove",this.xk,this));for(var c in this.a)this.a[c].forEach(sb);nb(this.a);var a=a.a,d,e;c=0;for(d=a.length;c<d;c++)e=a[c],this.a[x(e).toString()]=[D(e,"propertychange",this.be,this),D(e,"change",this.be,this)];this.u()};l.vk=function(a){a=a.element;var c=x(a).toString();this.a[c]=[D(a,"propertychange",this.be,this),D(a,"change",this.be,this)];this.u()};
l.xk=function(a){a=x(a.element).toString();this.a[a].forEach(sb);delete this.a[a];this.u()};l.Sc=function(){return this.get("layers")};l.dh=function(a){this.set("layers",a)};
l.cf=function(a){var c=void 0!==a?a:[],d=c.length;this.Sc().forEach(function(a){a.cf(c)});a=Ci(this);var e,f;for(e=c.length;d<e;d++)f=c[d],f.opacity*=a.opacity,f.visible=f.visible&&a.visible,f.maxResolution=Math.min(f.maxResolution,a.maxResolution),f.minResolution=Math.max(f.minResolution,a.minResolution),void 0!==a.extent&&(f.extent=void 0!==f.extent?$c(f.extent,a.extent):a.extent);return c};l.df=function(){return"ready"};function mk(a){nd.call(this,{code:a,units:"m",extent:nk,global:!0,worldExtent:ok})}y(mk,nd);mk.prototype.getPointResolution=function(a,c){return a/Ma(c[1]/6378137)};var pk=6378137*Math.PI,nk=[-pk,-pk,pk,pk],ok=[-180,-85,180,85],Ad="EPSG:3857 EPSG:102100 EPSG:102113 EPSG:900913 urn:ogc:def:crs:EPSG:6.18:3:3857 urn:ogc:def:crs:EPSG::3857 http://www.opengis.net/gml/srs/epsg.xml#3857".split(" ").map(function(a){return new mk(a)});
function Bd(a,c,d){var e=a.length;d=1<d?d:2;void 0===c&&(2<d?c=a.slice():c=Array(e));for(var f=0;f<e;f+=d)c[f]=6378137*Math.PI*a[f]/180,c[f+1]=6378137*Math.log(Math.tan(Math.PI*(a[f+1]+90)/360));return c}function Cd(a,c,d){var e=a.length;d=1<d?d:2;void 0===c&&(2<d?c=a.slice():c=Array(e));for(var f=0;f<e;f+=d)c[f]=180*a[f]/(6378137*Math.PI),c[f+1]=360*Math.atan(Math.exp(a[f+1]/6378137))/Math.PI-90;return c};var qk=new kd(6378137);function rk(a,c){nd.call(this,{code:a,units:"degrees",extent:sk,axisOrientation:c,global:!0,metersPerUnit:tk,worldExtent:sk})}y(rk,nd);rk.prototype.getPointResolution=function(a){return a};
var sk=[-180,-90,180,90],tk=Math.PI*qk.radius/180,Dd=[new rk("CRS:84"),new rk("EPSG:4326","neu"),new rk("urn:ogc:def:crs:EPSG::4326","neu"),new rk("urn:ogc:def:crs:EPSG:6.6:4326","neu"),new rk("urn:ogc:def:crs:OGC:1.3:CRS84"),new rk("urn:ogc:def:crs:OGC:2:84"),new rk("http://www.opengis.net/gml/srs/epsg.xml#4326","neu"),new rk("urn:x-ogc:def:crs:EPSG:4326","neu")];function uk(){rd(Ad);rd(Dd);zd()};function vk(a){Fi.call(this,a?a:{})}y(vk,Fi);function G(a){a=a?a:{};var c=mb({},a);delete c.preload;delete c.useInterimTilesOnError;Fi.call(this,c);this.c(void 0!==a.preload?a.preload:0);this.i(void 0!==a.useInterimTilesOnError?a.useInterimTilesOnError:!0)}y(G,Fi);G.prototype.a=function(){return this.get("preload")};G.prototype.c=function(a){this.set("preload",a)};G.prototype.f=function(){return this.get("useInterimTilesOnError")};G.prototype.i=function(a){this.set("useInterimTilesOnError",a)};var wk=[0,0,0,1],xk=[],yk=[0,0,0,1];function zk(a,c,d,e){0!==c&&(a.translate(d,e),a.rotate(c),a.translate(-d,-e))};function Ak(a){a=a||{};this.b=void 0!==a.color?a.color:null;this.a=void 0}Ak.prototype.g=function(){return this.b};Ak.prototype.f=function(a){this.b=a;this.a=void 0};function Bk(a){void 0===a.a&&(a.a=a.b instanceof CanvasPattern||a.b instanceof CanvasGradient?x(a.b).toString():"f"+(a.b?Ze(a.b):"-"));return a.a};function Ck(){this.a=-1};function Dk(){this.a=-1;this.a=64;this.b=Array(4);this.c=Array(this.a);this.f=this.g=0;this.b[0]=1732584193;this.b[1]=4023233417;this.b[2]=2562383102;this.b[3]=271733878;this.f=this.g=0}y(Dk,Ck);
function Ek(a,c,d){d||(d=0);var e=Array(16);if(ia(c))for(var f=0;16>f;++f)e[f]=c.charCodeAt(d++)|c.charCodeAt(d++)<<8|c.charCodeAt(d++)<<16|c.charCodeAt(d++)<<24;else for(f=0;16>f;++f)e[f]=c[d++]|c[d++]<<8|c[d++]<<16|c[d++]<<24;c=a.b[0];d=a.b[1];var f=a.b[2],g=a.b[3],h=0,h=c+(g^d&(f^g))+e[0]+3614090360&4294967295;c=d+(h<<7&4294967295|h>>>25);h=g+(f^c&(d^f))+e[1]+3905402710&4294967295;g=c+(h<<12&4294967295|h>>>20);h=f+(d^g&(c^d))+e[2]+606105819&4294967295;f=g+(h<<17&4294967295|h>>>15);h=d+(c^f&(g^
c))+e[3]+3250441966&4294967295;d=f+(h<<22&4294967295|h>>>10);h=c+(g^d&(f^g))+e[4]+4118548399&4294967295;c=d+(h<<7&4294967295|h>>>25);h=g+(f^c&(d^f))+e[5]+1200080426&4294967295;g=c+(h<<12&4294967295|h>>>20);h=f+(d^g&(c^d))+e[6]+2821735955&4294967295;f=g+(h<<17&4294967295|h>>>15);h=d+(c^f&(g^c))+e[7]+4249261313&4294967295;d=f+(h<<22&4294967295|h>>>10);h=c+(g^d&(f^g))+e[8]+1770035416&4294967295;c=d+(h<<7&4294967295|h>>>25);h=g+(f^c&(d^f))+e[9]+2336552879&4294967295;g=c+(h<<12&4294967295|h>>>20);h=f+
(d^g&(c^d))+e[10]+4294925233&4294967295;f=g+(h<<17&4294967295|h>>>15);h=d+(c^f&(g^c))+e[11]+2304563134&4294967295;d=f+(h<<22&4294967295|h>>>10);h=c+(g^d&(f^g))+e[12]+1804603682&4294967295;c=d+(h<<7&4294967295|h>>>25);h=g+(f^c&(d^f))+e[13]+4254626195&4294967295;g=c+(h<<12&4294967295|h>>>20);h=f+(d^g&(c^d))+e[14]+2792965006&4294967295;f=g+(h<<17&4294967295|h>>>15);h=d+(c^f&(g^c))+e[15]+1236535329&4294967295;d=f+(h<<22&4294967295|h>>>10);h=c+(f^g&(d^f))+e[1]+4129170786&4294967295;c=d+(h<<5&4294967295|
h>>>27);h=g+(d^f&(c^d))+e[6]+3225465664&4294967295;g=c+(h<<9&4294967295|h>>>23);h=f+(c^d&(g^c))+e[11]+643717713&4294967295;f=g+(h<<14&4294967295|h>>>18);h=d+(g^c&(f^g))+e[0]+3921069994&4294967295;d=f+(h<<20&4294967295|h>>>12);h=c+(f^g&(d^f))+e[5]+3593408605&4294967295;c=d+(h<<5&4294967295|h>>>27);h=g+(d^f&(c^d))+e[10]+38016083&4294967295;g=c+(h<<9&4294967295|h>>>23);h=f+(c^d&(g^c))+e[15]+3634488961&4294967295;f=g+(h<<14&4294967295|h>>>18);h=d+(g^c&(f^g))+e[4]+3889429448&4294967295;d=f+(h<<20&4294967295|
h>>>12);h=c+(f^g&(d^f))+e[9]+568446438&4294967295;c=d+(h<<5&4294967295|h>>>27);h=g+(d^f&(c^d))+e[14]+3275163606&4294967295;g=c+(h<<9&4294967295|h>>>23);h=f+(c^d&(g^c))+e[3]+4107603335&4294967295;f=g+(h<<14&4294967295|h>>>18);h=d+(g^c&(f^g))+e[8]+1163531501&4294967295;d=f+(h<<20&4294967295|h>>>12);h=c+(f^g&(d^f))+e[13]+2850285829&4294967295;c=d+(h<<5&4294967295|h>>>27);h=g+(d^f&(c^d))+e[2]+4243563512&4294967295;g=c+(h<<9&4294967295|h>>>23);h=f+(c^d&(g^c))+e[7]+1735328473&4294967295;f=g+(h<<14&4294967295|
h>>>18);h=d+(g^c&(f^g))+e[12]+2368359562&4294967295;d=f+(h<<20&4294967295|h>>>12);h=c+(d^f^g)+e[5]+4294588738&4294967295;c=d+(h<<4&4294967295|h>>>28);h=g+(c^d^f)+e[8]+2272392833&4294967295;g=c+(h<<11&4294967295|h>>>21);h=f+(g^c^d)+e[11]+1839030562&4294967295;f=g+(h<<16&4294967295|h>>>16);h=d+(f^g^c)+e[14]+4259657740&4294967295;d=f+(h<<23&4294967295|h>>>9);h=c+(d^f^g)+e[1]+2763975236&4294967295;c=d+(h<<4&4294967295|h>>>28);h=g+(c^d^f)+e[4]+1272893353&4294967295;g=c+(h<<11&4294967295|h>>>21);h=f+(g^
c^d)+e[7]+4139469664&4294967295;f=g+(h<<16&4294967295|h>>>16);h=d+(f^g^c)+e[10]+3200236656&4294967295;d=f+(h<<23&4294967295|h>>>9);h=c+(d^f^g)+e[13]+681279174&4294967295;c=d+(h<<4&4294967295|h>>>28);h=g+(c^d^f)+e[0]+3936430074&4294967295;g=c+(h<<11&4294967295|h>>>21);h=f+(g^c^d)+e[3]+3572445317&4294967295;f=g+(h<<16&4294967295|h>>>16);h=d+(f^g^c)+e[6]+76029189&4294967295;d=f+(h<<23&4294967295|h>>>9);h=c+(d^f^g)+e[9]+3654602809&4294967295;c=d+(h<<4&4294967295|h>>>28);h=g+(c^d^f)+e[12]+3873151461&4294967295;
g=c+(h<<11&4294967295|h>>>21);h=f+(g^c^d)+e[15]+530742520&4294967295;f=g+(h<<16&4294967295|h>>>16);h=d+(f^g^c)+e[2]+3299628645&4294967295;d=f+(h<<23&4294967295|h>>>9);h=c+(f^(d|~g))+e[0]+4096336452&4294967295;c=d+(h<<6&4294967295|h>>>26);h=g+(d^(c|~f))+e[7]+1126891415&4294967295;g=c+(h<<10&4294967295|h>>>22);h=f+(c^(g|~d))+e[14]+2878612391&4294967295;f=g+(h<<15&4294967295|h>>>17);h=d+(g^(f|~c))+e[5]+4237533241&4294967295;d=f+(h<<21&4294967295|h>>>11);h=c+(f^(d|~g))+e[12]+1700485571&4294967295;c=d+
(h<<6&4294967295|h>>>26);h=g+(d^(c|~f))+e[3]+2399980690&4294967295;g=c+(h<<10&4294967295|h>>>22);h=f+(c^(g|~d))+e[10]+4293915773&4294967295;f=g+(h<<15&4294967295|h>>>17);h=d+(g^(f|~c))+e[1]+2240044497&4294967295;d=f+(h<<21&4294967295|h>>>11);h=c+(f^(d|~g))+e[8]+1873313359&4294967295;c=d+(h<<6&4294967295|h>>>26);h=g+(d^(c|~f))+e[15]+4264355552&4294967295;g=c+(h<<10&4294967295|h>>>22);h=f+(c^(g|~d))+e[6]+2734768916&4294967295;f=g+(h<<15&4294967295|h>>>17);h=d+(g^(f|~c))+e[13]+1309151649&4294967295;
d=f+(h<<21&4294967295|h>>>11);h=c+(f^(d|~g))+e[4]+4149444226&4294967295;c=d+(h<<6&4294967295|h>>>26);h=g+(d^(c|~f))+e[11]+3174756917&4294967295;g=c+(h<<10&4294967295|h>>>22);h=f+(c^(g|~d))+e[2]+718787259&4294967295;f=g+(h<<15&4294967295|h>>>17);h=d+(g^(f|~c))+e[9]+3951481745&4294967295;a.b[0]=a.b[0]+c&4294967295;a.b[1]=a.b[1]+(f+(h<<21&4294967295|h>>>11))&4294967295;a.b[2]=a.b[2]+f&4294967295;a.b[3]=a.b[3]+g&4294967295}
function Fk(a,c){var d;ba(d)||(d=c.length);for(var e=d-a.a,f=a.c,g=a.g,h=0;h<d;){if(0==g)for(;h<=e;)Ek(a,c,h),h+=a.a;if(ia(c))for(;h<d;){if(f[g++]=c.charCodeAt(h++),g==a.a){Ek(a,f);g=0;break}}else for(;h<d;)if(f[g++]=c[h++],g==a.a){Ek(a,f);g=0;break}}a.g=g;a.f+=d};function Gk(a){a=a||{};this.b=void 0!==a.color?a.color:null;this.f=a.lineCap;this.g=void 0!==a.lineDash?a.lineDash:null;this.c=a.lineJoin;this.i=a.miterLimit;this.a=a.width;this.j=void 0}l=Gk.prototype;l.Zm=function(){return this.b};l.Jj=function(){return this.f};l.$m=function(){return this.g};l.Kj=function(){return this.c};l.Pj=function(){return this.i};l.an=function(){return this.a};l.bn=function(a){this.b=a;this.j=void 0};l.vo=function(a){this.f=a;this.j=void 0};
l.cn=function(a){this.g=a;this.j=void 0};l.wo=function(a){this.c=a;this.j=void 0};l.xo=function(a){this.i=a;this.j=void 0};l.Bo=function(a){this.a=a;this.j=void 0};
function Hk(a){if(void 0===a.j){var c="s"+(a.b?Ze(a.b):"-")+","+(void 0!==a.f?a.f.toString():"-")+","+(a.g?a.g.toString():"-")+","+(void 0!==a.c?a.c:"-")+","+(void 0!==a.i?a.i.toString():"-")+","+(void 0!==a.a?a.a.toString():"-"),d=new Dk;Fk(d,c);c=Array((56>d.g?d.a:2*d.a)-d.g);c[0]=128;for(var e=1;e<c.length-8;++e)c[e]=0;for(var f=8*d.f,e=c.length-8;e<c.length;++e)c[e]=f&255,f/=256;Fk(d,c);c=Array(16);for(e=f=0;4>e;++e)for(var g=0;32>g;g+=8)c[f++]=d.b[e]>>>g&255;if(8192>=c.length)d=String.fromCharCode.apply(null,
c);else for(d="",e=0;e<c.length;e+=8192)f=Zb(c,e,e+8192),d+=String.fromCharCode.apply(null,f);a.j=d}return a.j};function Ik(a){a=a||{};this.i=this.b=this.c=null;this.f=void 0!==a.fill?a.fill:null;this.a=void 0!==a.stroke?a.stroke:null;this.g=a.radius;this.T=[0,0];this.o=this.D=this.l=null;var c=a.atlasManager,d,e=null,f,g=0;this.a&&(f=Ze(this.a.b),g=this.a.a,void 0===g&&(g=1),e=this.a.g,Ah||(e=null));var h=2*(this.g+g)+1;f={strokeStyle:f,Dd:g,size:h,lineDash:e};if(void 0===c)this.b=document.createElement("CANVAS"),this.b.height=h,this.b.width=h,d=h=this.b.width,c=this.b.getContext("2d"),this.qh(f,c,0,0),this.f?
this.i=this.b:(c=this.i=document.createElement("CANVAS"),c.height=f.size,c.width=f.size,c=c.getContext("2d"),this.ph(f,c,0,0));else{h=Math.round(h);(e=!this.f)&&(d=this.ph.bind(this,f));var g=this.a?Hk(this.a):"-",k=this.f?Bk(this.f):"-";this.c&&g==this.c[1]&&k==this.c[2]&&this.g==this.c[3]||(this.c=["c"+g+k+(void 0!==this.g?this.g.toString():"-"),g,k,this.g]);f=Jk(c,this.c[0],h,h,this.qh.bind(this,f),d);this.b=f.image;this.T=[f.offsetX,f.offsetY];d=f.image.width;this.i=e?f.Ig:this.b}this.l=[h/2,
h/2];this.D=[h,h];this.o=[d,d];Vi.call(this,{opacity:1,rotateWithView:!1,rotation:0,scale:1,snapToPixel:void 0!==a.snapToPixel?a.snapToPixel:!0})}y(Ik,Vi);l=Ik.prototype;l.Yb=function(){return this.l};l.Qm=function(){return this.f};l.qe=function(){return this.i};l.gc=function(){return this.b};l.wd=function(){return 2};l.qd=function(){return this.o};l.Ha=function(){return this.T};l.Rm=function(){return this.g};l.Eb=function(){return this.D};l.Sm=function(){return this.a};l.hf=va;l.load=va;l.Nf=va;
l.qh=function(a,c,d,e){c.setTransform(1,0,0,1,0,0);c.translate(d,e);c.beginPath();c.arc(a.size/2,a.size/2,this.g,0,2*Math.PI,!0);this.f&&(c.fillStyle=af(this.f.b),c.fill());this.a&&(c.strokeStyle=a.strokeStyle,c.lineWidth=a.Dd,a.lineDash&&c.setLineDash(a.lineDash),c.stroke());c.closePath()};
l.ph=function(a,c,d,e){c.setTransform(1,0,0,1,0,0);c.translate(d,e);c.beginPath();c.arc(a.size/2,a.size/2,this.g,0,2*Math.PI,!0);c.fillStyle=Ze(wk);c.fill();this.a&&(c.strokeStyle=a.strokeStyle,c.lineWidth=a.Dd,a.lineDash&&c.setLineDash(a.lineDash),c.stroke());c.closePath()};function Kk(a){a=a||{};this.i=null;this.f=Lk;void 0!==a.geometry&&this.th(a.geometry);this.c=void 0!==a.fill?a.fill:null;this.a=void 0!==a.image?a.image:null;this.g=void 0!==a.stroke?a.stroke:null;this.j=void 0!==a.text?a.text:null;this.b=a.zIndex}l=Kk.prototype;l.X=function(){return this.i};l.Ej=function(){return this.f};l.dn=function(){return this.c};l.en=function(){return this.a};l.fn=function(){return this.g};l.Fa=function(){return this.j};l.gn=function(){return this.b};
l.th=function(a){ka(a)?this.f=a:"string"===typeof a?this.f=function(c){return c.get(a)}:a?void 0!==a&&(this.f=function(){return a}):this.f=Lk;this.i=a};l.hn=function(a){this.b=a};function Mk(a){if(!ka(a)){var c;c=ga(a)?a:[a];a=function(){return c}}return a}var Nk=null;function Ok(){if(!Nk){var a=new Ak({color:"rgba(255,255,255,0.4)"}),c=new Gk({color:"#3399CC",width:1.25});Nk=[new Kk({image:new Ik({fill:a,stroke:c,radius:5}),fill:a,stroke:c})]}return Nk}
function Pk(){var a={},c=[255,255,255,1],d=[0,153,255,1];a.Polygon=[new Kk({fill:new Ak({color:[255,255,255,.5]})})];a.MultiPolygon=a.Polygon;a.LineString=[new Kk({stroke:new Gk({color:c,width:5})}),new Kk({stroke:new Gk({color:d,width:3})})];a.MultiLineString=a.LineString;a.Circle=a.Polygon.concat(a.LineString);a.Point=[new Kk({image:new Ik({radius:6,fill:new Ak({color:d}),stroke:new Gk({color:c,width:1.5})}),zIndex:Infinity})];a.MultiPoint=a.Point;a.GeometryCollection=a.Polygon.concat(a.LineString,
a.Point);return a}function Lk(a){return a.X()};function H(a){a=a?a:{};var c=mb({},a);delete c.style;delete c.renderBuffer;delete c.updateWhileAnimating;delete c.updateWhileInteracting;Fi.call(this,c);this.a=void 0!==a.renderBuffer?a.renderBuffer:100;this.B=null;this.f=void 0;this.c(a.style);this.s=void 0!==a.updateWhileAnimating?a.updateWhileAnimating:!1;this.A=void 0!==a.updateWhileInteracting?a.updateWhileInteracting:!1}y(H,Fi);function Qk(a){return a.get("renderOrder")}H.prototype.J=function(){return this.B};H.prototype.D=function(){return this.f};
H.prototype.c=function(a){this.B=void 0!==a?a:Ok;this.f=null===a?void 0:Mk(this.B);this.u()};function L(a){a=a?a:{};var c=mb({},a);delete c.preload;delete c.useInterimTilesOnError;H.call(this,c);this.U(a.preload?a.preload:0);this.aa(a.useInterimTilesOnError?a.useInterimTilesOnError:!0)}y(L,H);L.prototype.i=function(){return this.get("preload")};L.prototype.S=function(){return this.get("useInterimTilesOnError")};L.prototype.U=function(a){this.set("preload",a)};L.prototype.aa=function(a){this.set("useInterimTilesOnError",a)};function Rk(a,c,d,e,f){this.T={};this.g=a;this.J=c;this.c=d;this.H=e;this.$c=f;this.i=this.b=this.a=this.wa=this.Da=this.aa=null;this.oa=this.na=this.A=this.S=this.ua=this.ta=0;this.ya=!1;this.j=this.qb=0;this.Fb=!1;this.Ga=0;this.f="";this.o=this.D=this.oc=this.nc=0;this.U=this.s=this.l=null;this.B=[];this.Ec=nc()}
function Sk(a,c,d){if(a.i){c=Nd(c,0,d,2,a.H,a.B);d=a.g;var e=a.Ec,f=d.globalAlpha;1!=a.A&&(d.globalAlpha=f*a.A);var g=a.qb;a.ya&&(g+=a.$c);var h,k;h=0;for(k=c.length;h<k;h+=2){var m=c[h]-a.ta,n=c[h+1]-a.ua;a.Fb&&(m=Math.round(m),n=Math.round(n));if(0!==g||1!=a.j){var p=m+a.ta,q=n+a.ua;Ji(e,p,q,a.j,a.j,g,-p,-q);d.setTransform(e[0],e[1],e[4],e[5],e[12],e[13])}d.drawImage(a.i,a.na,a.oa,a.Ga,a.S,m,n,a.Ga,a.S)}0===g&&1==a.j||d.setTransform(1,0,0,1,0,0);1!=a.A&&(d.globalAlpha=f)}}
function Tk(a,c,d,e){var f=0;if(a.U&&""!==a.f){a.l&&Uk(a,a.l);a.s&&Vk(a,a.s);var g=a.U,h=a.g,k=a.wa;k?(k.font!=g.font&&(k.font=h.font=g.font),k.textAlign!=g.textAlign&&(k.textAlign=h.textAlign=g.textAlign),k.textBaseline!=g.textBaseline&&(k.textBaseline=h.textBaseline=g.textBaseline)):(h.font=g.font,h.textAlign=g.textAlign,h.textBaseline=g.textBaseline,a.wa={font:g.font,textAlign:g.textAlign,textBaseline:g.textBaseline});c=Nd(c,f,d,e,a.H,a.B);for(g=a.g;f<d;f+=e){h=c[f]+a.nc;k=c[f+1]+a.oc;if(0!==a.D||
1!=a.o){var m=Ji(a.Ec,h,k,a.o,a.o,a.D,-h,-k);g.setTransform(m[0],m[1],m[4],m[5],m[12],m[13])}a.s&&g.strokeText(a.f,h,k);a.l&&g.fillText(a.f,h,k)}0===a.D&&1==a.o||g.setTransform(1,0,0,1,0,0)}}function Wk(a,c,d,e,f,g){var h=a.g;a=Nd(c,d,e,f,a.H,a.B);h.moveTo(a[0],a[1]);for(c=2;c<a.length;c+=2)h.lineTo(a[c],a[c+1]);g&&h.lineTo(a[0],a[1]);return e}function Xk(a,c,d,e,f){var g=a.g,h,k;h=0;for(k=e.length;h<k;++h)d=Wk(a,c,d,e[h],f,!0),g.closePath();return d}l=Rk.prototype;
l.ld=function(a,c){var d=a.toString(),e=this.T[d];void 0!==e?e.push(c):this.T[d]=[c]};l.Ic=function(a){if(ad(this.c,a.G())){if(this.a||this.b){this.a&&Uk(this,this.a);this.b&&Vk(this,this.b);var c;c=this.H;var d=this.B,e=a.ha();c=e?Nd(e,0,e.length,a.qa(),c,d):null;d=c[2]-c[0];e=c[3]-c[1];d=Math.sqrt(d*d+e*e);e=this.g;e.beginPath();e.arc(c[0],c[1],d,0,2*Math.PI);this.a&&e.fill();this.b&&e.stroke()}""!==this.f&&Tk(this,a.vd(),2,2)}};
l.Xe=function(a,c){var d=(0,c.f)(a);if(d&&ad(this.c,d.G())){var e=c.b;void 0===e&&(e=0);this.ld(e,function(a){a.hb(c.c,c.g);a.yb(c.a);a.ib(c.Fa());Yk[d.W()].call(a,d,null)})}};l.Sd=function(a,c){var d=a.i,e,f;e=0;for(f=d.length;e<f;++e){var g=d[e];Yk[g.W()].call(this,g,c)}};l.Ib=function(a){var c=a.ha();a=a.qa();this.i&&Sk(this,c,c.length);""!==this.f&&Tk(this,c,c.length,a)};l.Hb=function(a){var c=a.ha();a=a.qa();this.i&&Sk(this,c,c.length);""!==this.f&&Tk(this,c,c.length,a)};
l.Xb=function(a){if(ad(this.c,a.G())){if(this.b){Vk(this,this.b);var c=this.g,d=a.ha();c.beginPath();Wk(this,d,0,d.length,a.qa(),!1);c.stroke()}""!==this.f&&(a=Zk(a),Tk(this,a,2,2))}};l.Jc=function(a){var c=a.G();if(ad(this.c,c)){if(this.b){Vk(this,this.b);var c=this.g,d=a.ha(),e=0,f=a.Cb(),g=a.qa();c.beginPath();var h,k;h=0;for(k=f.length;h<k;++h)e=Wk(this,d,e,f[h],g,!1);c.stroke()}""!==this.f&&(a=$k(a),Tk(this,a,a.length,2))}};
l.Lc=function(a){if(ad(this.c,a.G())){if(this.b||this.a){this.a&&Uk(this,this.a);this.b&&Vk(this,this.b);var c=this.g;c.beginPath();Xk(this,a.Rb(),0,a.Cb(),a.qa());this.a&&c.fill();this.b&&c.stroke()}""!==this.f&&(a=se(a),Tk(this,a,2,2))}};
l.Kc=function(a){if(ad(this.c,a.G())){if(this.b||this.a){this.a&&Uk(this,this.a);this.b&&Vk(this,this.b);var c=this.g,d=al(a),e=0,f=a.c,g=a.qa(),h,k;h=0;for(k=f.length;h<k;++h){var m=f[h];c.beginPath();e=Xk(this,d,e,m,g);this.a&&c.fill();this.b&&c.stroke()}}""!==this.f&&(a=bl(a),Tk(this,a,a.length,2))}};function cl(a){var c=Object.keys(a.T).map(Number);c.sort(Ta);var d,e,f,g,h;d=0;for(e=c.length;d<e;++d)for(f=a.T[c[d].toString()],g=0,h=f.length;g<h;++g)f[g](a)}
function Uk(a,c){var d=a.g,e=a.aa;e?e.fillStyle!=c.fillStyle&&(e.fillStyle=d.fillStyle=c.fillStyle):(d.fillStyle=c.fillStyle,a.aa={fillStyle:c.fillStyle})}
function Vk(a,c){var d=a.g,e=a.Da;e?(e.lineCap!=c.lineCap&&(e.lineCap=d.lineCap=c.lineCap),Ah&&!bb(e.lineDash,c.lineDash)&&d.setLineDash(e.lineDash=c.lineDash),e.lineJoin!=c.lineJoin&&(e.lineJoin=d.lineJoin=c.lineJoin),e.lineWidth!=c.lineWidth&&(e.lineWidth=d.lineWidth=c.lineWidth),e.miterLimit!=c.miterLimit&&(e.miterLimit=d.miterLimit=c.miterLimit),e.strokeStyle!=c.strokeStyle&&(e.strokeStyle=d.strokeStyle=c.strokeStyle)):(d.lineCap=c.lineCap,Ah&&d.setLineDash(c.lineDash),d.lineJoin=c.lineJoin,d.lineWidth=
c.lineWidth,d.miterLimit=c.miterLimit,d.strokeStyle=c.strokeStyle,a.Da={lineCap:c.lineCap,lineDash:c.lineDash,lineJoin:c.lineJoin,lineWidth:c.lineWidth,miterLimit:c.miterLimit,strokeStyle:c.strokeStyle})}
l.hb=function(a,c){if(a){var d=a.b;this.a={fillStyle:af(d?d:wk)}}else this.a=null;if(c){var d=c.b,e=c.f,f=c.g,g=c.c,h=c.a,k=c.i;this.b={lineCap:void 0!==e?e:"round",lineDash:f?f:xk,lineJoin:void 0!==g?g:"round",lineWidth:this.J*(void 0!==h?h:1),miterLimit:void 0!==k?k:10,strokeStyle:Ze(d?d:yk)}}else this.b=null};
l.yb=function(a){if(a){var c=a.Yb(),d=a.gc(1),e=a.Ha(),f=a.Eb();this.ta=c[0];this.ua=c[1];this.S=f[1];this.i=d;this.A=a.A;this.na=e[0];this.oa=e[1];this.ya=a.B;this.qb=a.s;this.j=a.j;this.Fb=a.J;this.Ga=f[0]}else this.i=null};
l.ib=function(a){if(a){var c=a.b;c?(c=c.b,this.l={fillStyle:af(c?c:wk)}):this.l=null;var d=a.j;if(d){var c=d.b,e=d.f,f=d.g,g=d.c,h=d.a,d=d.i;this.s={lineCap:void 0!==e?e:"round",lineDash:f?f:xk,lineJoin:void 0!==g?g:"round",lineWidth:void 0!==h?h:1,miterLimit:void 0!==d?d:10,strokeStyle:Ze(c?c:yk)}}else this.s=null;var c=a.g,e=a.f,f=a.c,g=a.i,h=a.a,d=a.Fa(),k=a.l;a=a.o;this.U={font:void 0!==c?c:"10px sans-serif",textAlign:void 0!==k?k:"center",textBaseline:void 0!==a?a:"middle"};this.f=void 0!==d?
d:"";this.nc=void 0!==e?this.J*e:0;this.oc=void 0!==f?this.J*f:0;this.D=void 0!==g?g:0;this.o=this.J*(void 0!==h?h:1)}else this.f=""};var Yk={Point:Rk.prototype.Ib,LineString:Rk.prototype.Xb,Polygon:Rk.prototype.Lc,MultiPoint:Rk.prototype.Hb,MultiLineString:Rk.prototype.Jc,MultiPolygon:Rk.prototype.Kc,GeometryCollection:Rk.prototype.Sd,Circle:Rk.prototype.Ic};function dl(a){Mi.call(this,a);this.H=nc()}y(dl,Mi);
dl.prototype.c=function(a,c,d){el(this,"precompose",d,a,void 0);var e=this.f?this.f.a():null;if(e){var f=c.extent,g=void 0!==f;if(g){var h=a.pixelRatio,k=a.size[0]*h,m=a.size[1]*h,n=a.viewState.rotation,p=Sc(f),q=Rc(f),r=Qc(f),f=Pc(f);Li(a.coordinateToPixelMatrix,p,p);Li(a.coordinateToPixelMatrix,q,q);Li(a.coordinateToPixelMatrix,r,r);Li(a.coordinateToPixelMatrix,f,f);d.save();zk(d,-n,k/2,m/2);d.beginPath();d.moveTo(p[0]*h,p[1]*h);d.lineTo(q[0]*h,q[1]*h);d.lineTo(r[0]*h,r[1]*h);d.lineTo(f[0]*h,f[1]*
h);d.clip();zk(d,n,k/2,m/2)}h=this.o;k=d.globalAlpha;d.globalAlpha=c.opacity;d.drawImage(e,0,0,+e.width,+e.height,Math.round(h[12]),Math.round(h[13]),Math.round(e.width*h[0]),Math.round(e.height*h[5]));d.globalAlpha=k;g&&d.restore()}fl(this,d,a)};
function el(a,c,d,e,f){var g=a.a;if(Ib(g,c)){var h=e.size[0]*e.pixelRatio,k=e.size[1]*e.pixelRatio,m=e.viewState.rotation;zk(d,-m,h/2,k/2);a=void 0!==f?f:gl(a,e,0);a=new Rk(d,e.pixelRatio,e.extent,a,e.viewState.rotation);g.b(new Ei(c,g,a,e,d,null));cl(a);zk(d,m,h/2,k/2)}}function fl(a,c,d,e){el(a,"postcompose",c,d,e)}function gl(a,c,d){var e=c.viewState,f=c.pixelRatio;return Ji(a.H,f*c.size[0]/2,f*c.size[1]/2,f/e.resolution,-f/e.resolution,-e.rotation,-e.center[0]+d,-e.center[1])};var hl=["Polygon","LineString","Image","Text"];function il(a,c,d){this.na=a;this.Ga=c;this.f=null;this.c=0;this.resolution=d;this.ua=this.ta=null;this.a=[];this.coordinates=[];this.aa=nc();this.b=[];this.U=[];this.Da=nc();this.wa=nc()}y(il,Di);
function jl(a,c,d,e,f,g){var h=a.coordinates.length,k=a.Ze(),m=[c[d],c[d+1]],n=[NaN,NaN],p=!0,q,r,t;for(q=d+f;q<e;q+=f)n[0]=c[q],n[1]=c[q+1],t=Hc(k,n),t!==r?(p&&(a.coordinates[h++]=m[0],a.coordinates[h++]=m[1]),a.coordinates[h++]=n[0],a.coordinates[h++]=n[1],p=!1):1===t?(a.coordinates[h++]=n[0],a.coordinates[h++]=n[1],p=!1):p=!0,m[0]=n[0],m[1]=n[1],r=t;q===d+f&&(a.coordinates[h++]=m[0],a.coordinates[h++]=m[1]);g&&(a.coordinates[h++]=c[d],a.coordinates[h++]=c[d+1]);return h}
function kl(a,c){a.ta=[0,c,0];a.a.push(a.ta);a.ua=[0,c,0];a.b.push(a.ua)}
function ll(a,c,d,e,f,g,h,k,m){var n;Ki(e,a.aa)?n=a.U:(n=Nd(a.coordinates,0,a.coordinates.length,2,e,a.U),qc(a.aa,e));e=!pb(g);var p=0,q=h.length,r=0,t,v=a.Da;a=a.wa;for(var w,A,B,z;p<q;){var C=h[p],O,I,K,P;switch(C[0]){case 0:r=C[1];e&&g[x(r).toString()]||!r.X()?p=C[2]:void 0===m||ad(m,r.X().G())?++p:p=C[2];break;case 1:c.beginPath();++p;break;case 2:r=C[1];t=n[r];C=n[r+1];B=n[r+2]-t;r=n[r+3]-C;c.arc(t,C,Math.sqrt(B*B+r*r),0,2*Math.PI,!0);++p;break;case 3:c.closePath();++p;break;case 4:r=C[1];t=
C[2];O=C[3];K=C[4]*d;var da=C[5]*d,J=C[6];I=C[7];var ea=C[8],Ga=C[9];B=C[11];z=C[12];var $a=C[13],ab=C[14];for(C[10]&&(B+=f);r<t;r+=2){C=n[r]-K;P=n[r+1]-da;$a&&(C=Math.round(C),P=Math.round(P));if(1!=z||0!==B){var Oa=C+K,Ec=P+da;Ji(v,Oa,Ec,z,z,B,-Oa,-Ec);c.transform(v[0],v[1],v[4],v[5],v[12],v[13])}Oa=c.globalAlpha;1!=I&&(c.globalAlpha=Oa*I);var Ec=ab+ea>O.width?O.width-ea:ab,Uc=J+Ga>O.height?O.height-Ga:J;c.drawImage(O,ea,Ga,Ec,Uc,C,P,Ec*d,Uc*d);1!=I&&(c.globalAlpha=Oa);if(1!=z||0!==B)tc(v,a),c.transform(a[0],
a[1],a[4],a[5],a[12],a[13])}++p;break;case 5:r=C[1];t=C[2];K=C[3];da=C[4]*d;J=C[5]*d;B=C[6];z=C[7]*d;O=C[8];for(I=C[9];r<t;r+=2){C=n[r]+da;P=n[r+1]+J;if(1!=z||0!==B)Ji(v,C,P,z,z,B,-C,-P),c.transform(v[0],v[1],v[4],v[5],v[12],v[13]);ea=K.split("\n");Ga=ea.length;1<Ga?($a=Math.round(1.5*c.measureText("M").width),P-=(Ga-1)/2*$a):$a=0;for(ab=0;ab<Ga;ab++)Oa=ea[ab],I&&c.strokeText(Oa,C,P),O&&c.fillText(Oa,C,P),P+=$a;if(1!=z||0!==B)tc(v,a),c.transform(a[0],a[1],a[4],a[5],a[12],a[13])}++p;break;case 6:if(void 0!==
k&&(r=C[1],r=k(r)))return r;++p;break;case 7:c.fill();++p;break;case 8:r=C[1];t=C[2];C=n[r];P=n[r+1];B=C+.5|0;z=P+.5|0;if(B!==w||z!==A)c.moveTo(C,P),w=B,A=z;for(r+=2;r<t;r+=2)if(C=n[r],P=n[r+1],B=C+.5|0,z=P+.5|0,B!==w||z!==A)c.lineTo(C,P),w=B,A=z;++p;break;case 9:c.fillStyle=C[1];++p;break;case 10:w=void 0!==C[7]?C[7]:!0;A=C[2];c.strokeStyle=C[1];c.lineWidth=w?A*d:A;c.lineCap=C[3];c.lineJoin=C[4];c.miterLimit=C[5];Ah&&c.setLineDash(C[6]);A=w=NaN;++p;break;case 11:c.font=C[1];c.textAlign=C[2];c.textBaseline=
C[3];++p;break;case 12:c.stroke();++p;break;default:++p}}}function ml(a){var c=a.b;c.reverse();var d,e=c.length,f,g,h=-1;for(d=0;d<e;++d)if(f=c[d],g=f[0],6==g)h=d;else if(0==g){f[2]=d;f=a.b;for(g=d;h<g;){var k=f[h];f[h]=f[g];f[g]=k;++h;--g}h=-1}}function nl(a,c){a.ta[2]=a.a.length;a.ta=null;a.ua[2]=a.b.length;a.ua=null;var d=[6,c];a.a.push(d);a.b.push(d)}il.prototype.me=va;il.prototype.Ze=function(){return this.Ga};
function pl(a,c,d){il.call(this,a,c,d);this.l=this.S=null;this.H=this.D=this.J=this.B=this.T=this.A=this.s=this.o=this.j=this.i=this.g=void 0}y(pl,il);pl.prototype.Ib=function(a,c){if(this.l){kl(this,c);var d=a.ha(),e=this.coordinates.length,d=jl(this,d,0,d.length,a.qa(),!1);this.a.push([4,e,d,this.l,this.g,this.i,this.j,this.o,this.s,this.A,this.T,this.B,this.J,this.D,this.H]);this.b.push([4,e,d,this.S,this.g,this.i,this.j,this.o,this.s,this.A,this.T,this.B,this.J,this.D,this.H]);nl(this,c)}};
pl.prototype.Hb=function(a,c){if(this.l){kl(this,c);var d=a.ha(),e=this.coordinates.length,d=jl(this,d,0,d.length,a.qa(),!1);this.a.push([4,e,d,this.l,this.g,this.i,this.j,this.o,this.s,this.A,this.T,this.B,this.J,this.D,this.H]);this.b.push([4,e,d,this.S,this.g,this.i,this.j,this.o,this.s,this.A,this.T,this.B,this.J,this.D,this.H]);nl(this,c)}};pl.prototype.me=function(){ml(this);this.i=this.g=void 0;this.l=this.S=null;this.H=this.D=this.B=this.T=this.A=this.s=this.o=this.J=this.j=void 0};
pl.prototype.yb=function(a){var c=a.Yb(),d=a.Eb(),e=a.qe(1),f=a.gc(1),g=a.Ha();this.g=c[0];this.i=c[1];this.S=e;this.l=f;this.j=d[1];this.o=a.A;this.s=g[0];this.A=g[1];this.T=a.B;this.B=a.s;this.J=a.j;this.D=a.J;this.H=d[0]};function ql(a,c,d){il.call(this,a,c,d);this.g={jd:void 0,dd:void 0,ed:null,fd:void 0,gd:void 0,hd:void 0,gf:0,strokeStyle:void 0,lineCap:void 0,lineDash:null,lineJoin:void 0,lineWidth:void 0,miterLimit:void 0}}y(ql,il);
function rl(a,c,d,e,f){var g=a.coordinates.length;c=jl(a,c,d,e,f,!1);g=[8,g,c];a.a.push(g);a.b.push(g);return e}l=ql.prototype;l.Ze=function(){this.f||(this.f=Bc(this.Ga),0<this.c&&Ac(this.f,this.resolution*(this.c+1)/2,this.f));return this.f};
function sl(a){var c=a.g,d=c.strokeStyle,e=c.lineCap,f=c.lineDash,g=c.lineJoin,h=c.lineWidth,k=c.miterLimit;c.jd==d&&c.dd==e&&bb(c.ed,f)&&c.fd==g&&c.gd==h&&c.hd==k||(c.gf!=a.coordinates.length&&(a.a.push([12]),c.gf=a.coordinates.length),a.a.push([10,d,h,e,g,k,f],[1]),c.jd=d,c.dd=e,c.ed=f,c.fd=g,c.gd=h,c.hd=k)}
l.Xb=function(a,c){var d=this.g,e=d.lineWidth;void 0!==d.strokeStyle&&void 0!==e&&(sl(this),kl(this,c),this.b.push([10,d.strokeStyle,d.lineWidth,d.lineCap,d.lineJoin,d.miterLimit,d.lineDash],[1]),d=a.ha(),rl(this,d,0,d.length,a.qa()),this.b.push([12]),nl(this,c))};
l.Jc=function(a,c){var d=this.g,e=d.lineWidth;if(void 0!==d.strokeStyle&&void 0!==e){sl(this);kl(this,c);this.b.push([10,d.strokeStyle,d.lineWidth,d.lineCap,d.lineJoin,d.miterLimit,d.lineDash],[1]);var d=a.Cb(),e=a.ha(),f=a.qa(),g=0,h,k;h=0;for(k=d.length;h<k;++h)g=rl(this,e,g,d[h],f);this.b.push([12]);nl(this,c)}};l.me=function(){this.g.gf!=this.coordinates.length&&this.a.push([12]);ml(this);this.g=null};
l.hb=function(a,c){var d=c.b;this.g.strokeStyle=Ze(d?d:yk);d=c.f;this.g.lineCap=void 0!==d?d:"round";d=c.g;this.g.lineDash=d?d:xk;d=c.c;this.g.lineJoin=void 0!==d?d:"round";d=c.a;this.g.lineWidth=void 0!==d?d:1;d=c.i;this.g.miterLimit=void 0!==d?d:10;this.g.lineWidth>this.c&&(this.c=this.g.lineWidth,this.f=null)};
function tl(a,c,d){il.call(this,a,c,d);this.g={kg:void 0,jd:void 0,dd:void 0,ed:null,fd:void 0,gd:void 0,hd:void 0,fillStyle:void 0,strokeStyle:void 0,lineCap:void 0,lineDash:null,lineJoin:void 0,lineWidth:void 0,miterLimit:void 0}}y(tl,il);
function ul(a,c,d,e,f){var g=a.g,h=[1];a.a.push(h);a.b.push(h);var k,h=0;for(k=e.length;h<k;++h){var m=e[h],n=a.coordinates.length;d=jl(a,c,d,m,f,!0);d=[8,n,d];n=[3];a.a.push(d,n);a.b.push(d,n);d=m}c=[7];a.b.push(c);void 0!==g.fillStyle&&a.a.push(c);void 0!==g.strokeStyle&&(g=[12],a.a.push(g),a.b.push(g));return d}l=tl.prototype;
l.Ic=function(a,c){var d=this.g,e=d.strokeStyle;if(void 0!==d.fillStyle||void 0!==e){vl(this);kl(this,c);this.b.push([9,Ze(wk)]);void 0!==d.strokeStyle&&this.b.push([10,d.strokeStyle,d.lineWidth,d.lineCap,d.lineJoin,d.miterLimit,d.lineDash]);var f=a.ha(),e=this.coordinates.length;jl(this,f,0,f.length,a.qa(),!1);f=[1];e=[2,e];this.a.push(f,e);this.b.push(f,e);e=[7];this.b.push(e);void 0!==d.fillStyle&&this.a.push(e);void 0!==d.strokeStyle&&(d=[12],this.a.push(d),this.b.push(d));nl(this,c)}};
l.Lc=function(a,c){var d=this.g,e=d.strokeStyle;if(void 0!==d.fillStyle||void 0!==e)vl(this),kl(this,c),this.b.push([9,Ze(wk)]),void 0!==d.strokeStyle&&this.b.push([10,d.strokeStyle,d.lineWidth,d.lineCap,d.lineJoin,d.miterLimit,d.lineDash]),d=a.Cb(),e=a.Rb(),ul(this,e,0,d,a.qa()),nl(this,c)};
l.Kc=function(a,c){var d=this.g,e=d.strokeStyle;if(void 0!==d.fillStyle||void 0!==e){vl(this);kl(this,c);this.b.push([9,Ze(wk)]);void 0!==d.strokeStyle&&this.b.push([10,d.strokeStyle,d.lineWidth,d.lineCap,d.lineJoin,d.miterLimit,d.lineDash]);var d=a.c,e=al(a),f=a.qa(),g=0,h,k;h=0;for(k=d.length;h<k;++h)g=ul(this,e,g,d[h],f);nl(this,c)}};l.me=function(){ml(this);this.g=null;var a=this.na;if(0!==a){var c=this.coordinates,d,e;d=0;for(e=c.length;d<e;++d)c[d]=a*Math.round(c[d]/a)}};
l.Ze=function(){this.f||(this.f=Bc(this.Ga),0<this.c&&Ac(this.f,this.resolution*(this.c+1)/2,this.f));return this.f};
l.hb=function(a,c){var d=this.g;if(a){var e=a.b;d.fillStyle=af(e?e:wk)}else d.fillStyle=void 0;c?(e=c.b,d.strokeStyle=Ze(e?e:yk),e=c.f,d.lineCap=void 0!==e?e:"round",e=c.g,d.lineDash=e?e.slice():xk,e=c.c,d.lineJoin=void 0!==e?e:"round",e=c.a,d.lineWidth=void 0!==e?e:1,e=c.i,d.miterLimit=void 0!==e?e:10,d.lineWidth>this.c&&(this.c=d.lineWidth,this.f=null)):(d.strokeStyle=void 0,d.lineCap=void 0,d.lineDash=null,d.lineJoin=void 0,d.lineWidth=void 0,d.miterLimit=void 0)};
function vl(a){var c=a.g,d=c.fillStyle,e=c.strokeStyle,f=c.lineCap,g=c.lineDash,h=c.lineJoin,k=c.lineWidth,m=c.miterLimit;void 0!==d&&c.kg!=d&&(a.a.push([9,d]),c.kg=c.fillStyle);void 0===e||c.jd==e&&c.dd==f&&c.ed==g&&c.fd==h&&c.gd==k&&c.hd==m||(a.a.push([10,e,k,f,h,m,g]),c.jd=e,c.dd=f,c.ed=g,c.fd=h,c.gd=k,c.hd=m)}function wl(a,c,d){il.call(this,a,c,d);this.D=this.J=this.B=null;this.l="";this.T=this.A=this.s=this.o=0;this.j=this.i=this.g=null}y(wl,il);
wl.prototype.Jb=function(a,c,d,e,f,g){if(""!==this.l&&this.j&&(this.g||this.i)){if(this.g){f=this.g;var h=this.B;if(!h||h.fillStyle!=f.fillStyle){var k=[9,f.fillStyle];this.a.push(k);this.b.push(k);h?h.fillStyle=f.fillStyle:this.B={fillStyle:f.fillStyle}}}this.i&&(f=this.i,h=this.J,h&&h.lineCap==f.lineCap&&h.lineDash==f.lineDash&&h.lineJoin==f.lineJoin&&h.lineWidth==f.lineWidth&&h.miterLimit==f.miterLimit&&h.strokeStyle==f.strokeStyle||(k=[10,f.strokeStyle,f.lineWidth,f.lineCap,f.lineJoin,f.miterLimit,
f.lineDash,!1],this.a.push(k),this.b.push(k),h?(h.lineCap=f.lineCap,h.lineDash=f.lineDash,h.lineJoin=f.lineJoin,h.lineWidth=f.lineWidth,h.miterLimit=f.miterLimit,h.strokeStyle=f.strokeStyle):this.J={lineCap:f.lineCap,lineDash:f.lineDash,lineJoin:f.lineJoin,lineWidth:f.lineWidth,miterLimit:f.miterLimit,strokeStyle:f.strokeStyle}));f=this.j;h=this.D;h&&h.font==f.font&&h.textAlign==f.textAlign&&h.textBaseline==f.textBaseline||(k=[11,f.font,f.textAlign,f.textBaseline],this.a.push(k),this.b.push(k),h?
(h.font=f.font,h.textAlign=f.textAlign,h.textBaseline=f.textBaseline):this.D={font:f.font,textAlign:f.textAlign,textBaseline:f.textBaseline});kl(this,g);f=this.coordinates.length;a=jl(this,a,c,d,e,!1);a=[5,f,a,this.l,this.o,this.s,this.A,this.T,!!this.g,!!this.i];this.a.push(a);this.b.push(a);nl(this,g)}};
wl.prototype.ib=function(a){if(a){var c=a.b;c?(c=c.b,c=af(c?c:wk),this.g?this.g.fillStyle=c:this.g={fillStyle:c}):this.g=null;var d=a.j;if(d){var c=d.b,e=d.f,f=d.g,g=d.c,h=d.a,d=d.i,e=void 0!==e?e:"round",f=f?f.slice():xk,g=void 0!==g?g:"round",h=void 0!==h?h:1,d=void 0!==d?d:10,c=Ze(c?c:yk);if(this.i){var k=this.i;k.lineCap=e;k.lineDash=f;k.lineJoin=g;k.lineWidth=h;k.miterLimit=d;k.strokeStyle=c}else this.i={lineCap:e,lineDash:f,lineJoin:g,lineWidth:h,miterLimit:d,strokeStyle:c}}else this.i=null;
var m=a.g,c=a.f,e=a.c,f=a.i,h=a.a,d=a.Fa(),g=a.l,k=a.o;a=void 0!==m?m:"10px sans-serif";g=void 0!==g?g:"center";k=void 0!==k?k:"middle";this.j?(m=this.j,m.font=a,m.textAlign=g,m.textBaseline=k):this.j={font:a,textAlign:g,textBaseline:k};this.l=void 0!==d?d:"";this.o=void 0!==c?c:0;this.s=void 0!==e?e:0;this.A=void 0!==f?f:0;this.T=void 0!==h?h:1}else this.l=""};function xl(a,c,d,e){this.s=a;this.c=c;this.o=d;this.i=e;this.g={};this.j=nh(1,1);this.l=nc()}
function yl(a){for(var c in a.g){var d=a.g[c],e;for(e in d)d[e].me()}}xl.prototype.f=function(a,c,d,e,f){var g=this.l;Ji(g,.5,.5,1/c,-1/c,-d,-a[0],-a[1]);var h=this.j;h.clearRect(0,0,1,1);var k;void 0!==this.i&&(k=yc(),zc(k,a),Ac(k,c*this.i,k));return zl(this,h,g,d,e,function(a){if(0<h.getImageData(0,0,1,1).data[3]){if(a=f(a))return a;h.clearRect(0,0,1,1)}},k)};
xl.prototype.b=function(a,c){var d=void 0!==a?a.toString():"0",e=this.g[d];void 0===e&&(e={},this.g[d]=e);d=e[c];void 0===d&&(d=new Al[c](this.s,this.c,this.o),e[c]=d);return d};xl.prototype.Oa=function(){return pb(this.g)};
xl.prototype.a=function(a,c,d,e,f,g){var h=Object.keys(this.g).map(Number);h.sort(Ta);if(!1!==g){var k=this.c;g=k[0];var m=k[1],n=k[2],k=k[3];g=[g,m,g,k,n,k,n,m];Nd(g,0,8,2,d,g);a.save();a.beginPath();a.moveTo(g[0],g[1]);a.lineTo(g[2],g[3]);a.lineTo(g[4],g[5]);a.lineTo(g[6],g[7]);a.closePath();a.clip()}var p,q;g=0;for(m=h.length;g<m;++g)for(p=this.g[h[g].toString()],n=0,k=hl.length;n<k;++n)q=p[hl[n]],void 0!==q&&ll(q,a,c,d,e,f,q.a,void 0);a.restore()};
function zl(a,c,d,e,f,g,h){var k=Object.keys(a.g).map(Number);k.sort(function(a,c){return c-a});var m,n,p,q,r;m=0;for(n=k.length;m<n;++m)for(q=a.g[k[m].toString()],p=hl.length-1;0<=p;--p)if(r=q[hl[p]],void 0!==r&&(r=ll(r,c,1,d,e,f,r.b,g,h)))return r}var Al={Image:pl,LineString:ql,Polygon:tl,Text:wl};function Bl(a,c,d,e){this.g=a;this.b=c;this.c=d;this.f=e}l=Bl.prototype;l.get=function(a){return this.f[a]};l.Cb=function(){return this.c};l.G=function(){this.a||(this.a="Point"===this.g?Jc(this.b):Kc(this.b,0,this.b.length,2));return this.a};l.Rb=function(){return this.b};l.ha=Bl.prototype.Rb;l.X=function(){return this};l.om=function(){return this.f};l.sd=Bl.prototype.X;l.qa=function(){return 2};l.bc=va;l.W=function(){return this.g};function Cl(a,c){return x(a)-x(c)}function Dl(a,c){var d=.5*a/c;return d*d}function El(a,c,d,e,f,g){var h=!1,k,m;if(k=d.a)m=k.wd(),2==m||3==m?k.Nf(f,g):(0==m&&k.load(),k.hf(f,g),h=!0);if(f=(0,d.f)(c))e=f.sd(e),(0,Fl[e.W()])(a,e,d,c);return h}
var Fl={Point:function(a,c,d,e){var f=d.a;if(f){if(2!=f.wd())return;var g=a.b(d.b,"Image");g.yb(f);g.Ib(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),a.Jb(c.ha(),0,2,2,c,e)},LineString:function(a,c,d,e){var f=d.g;if(f){var g=a.b(d.b,"LineString");g.hb(null,f);g.Xb(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),a.Jb(Zk(c),0,2,2,c,e)},Polygon:function(a,c,d,e){var f=d.c,g=d.g;if(f||g){var h=a.b(d.b,"Polygon");h.hb(f,g);h.Lc(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),a.Jb(se(c),0,2,2,c,e)},MultiPoint:function(a,
c,d,e){var f=d.a;if(f){if(2!=f.wd())return;var g=a.b(d.b,"Image");g.yb(f);g.Hb(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),d=c.ha(),a.Jb(d,0,d.length,c.qa(),c,e)},MultiLineString:function(a,c,d,e){var f=d.g;if(f){var g=a.b(d.b,"LineString");g.hb(null,f);g.Jc(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),d=$k(c),a.Jb(d,0,d.length,2,c,e)},MultiPolygon:function(a,c,d,e){var f=d.c,g=d.g;if(g||f){var h=a.b(d.b,"Polygon");h.hb(f,g);h.Kc(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),d=bl(c),a.Jb(d,0,d.length,2,
c,e)},GeometryCollection:function(a,c,d,e){c=c.i;var f,g;f=0;for(g=c.length;f<g;++f)(0,Fl[c[f].W()])(a,c[f],d,e)},Circle:function(a,c,d,e){var f=d.c,g=d.g;if(f||g){var h=a.b(d.b,"Polygon");h.hb(f,g);h.Ic(c,e)}if(f=d.Fa())a=a.b(d.b,"Text"),a.ib(f),a.Jb(c.vd(),0,2,2,c,e)}};function Gl(a,c,d,e,f,g){this.c=void 0!==g?g:null;Hi.call(this,a,c,d,void 0!==g?0:2,e);this.g=f}y(Gl,Hi);Gl.prototype.i=function(a){this.state=a?3:2;Ii(this)};Gl.prototype.load=function(){0==this.state&&(this.state=1,Ii(this),this.c(this.i.bind(this)))};Gl.prototype.a=function(){return this.g};var Hl=!((ef("Chrome")||ef("CriOS"))&&!ef("Opera")&&!ef("OPR")&&!ef("Edge"))||ef("iPhone")&&!ef("iPod")&&!ef("iPad")||ef("iPad")||ef("iPod");function Il(a,c,d,e){var f=Kd(d,c,a);d=c.getPointResolution(e,d);c=c.$b();void 0!==c&&(d*=c);c=a.$b();void 0!==c&&(d/=c);a=a.getPointResolution(d,f)/d;isFinite(a)&&0<a&&(d/=a);return d}function Jl(a,c,d,e){a=d-a;c=e-c;var f=Math.sqrt(a*a+c*c);return[Math.round(d+a/f),Math.round(e+c/f)]}
function Kl(a,c,d,e,f,g,h,k,m,n,p){var q=nh(Math.round(d*a),Math.round(d*c));if(0===m.length)return q.canvas;q.scale(d,d);var r=yc();m.forEach(function(a){Nc(r,a.extent)});var t=nh(Math.round(d*Wc(r)/e),Math.round(d*Xc(r)/e)),v=d/e;m.forEach(function(a){t.drawImage(a.image,n,n,a.image.width-2*n,a.image.height-2*n,(a.extent[0]-r[0])*v,-(a.extent[3]-r[3])*v,Wc(a.extent)*v,Xc(a.extent)*v)});var w=Sc(h);k.f.forEach(function(a){var c=a.source,f=a.target,h=c[1][0],k=c[1][1],m=c[2][0],n=c[2][1];a=(f[0][0]-
w[0])/g;var p=-(f[0][1]-w[1])/g,v=(f[1][0]-w[0])/g,J=-(f[1][1]-w[1])/g,ea=(f[2][0]-w[0])/g,Ga=-(f[2][1]-w[1])/g,f=c[0][0],c=c[0][1],h=h-f,k=k-c,m=m-f,n=n-c;a:{h=[[h,k,0,0,v-a],[m,n,0,0,ea-a],[0,0,h,k,J-p],[0,0,m,n,Ga-p]];k=h.length;for(m=0;m<k;m++){for(var n=m,$a=Math.abs(h[m][m]),ab=m+1;ab<k;ab++){var Oa=Math.abs(h[ab][m]);Oa>$a&&($a=Oa,n=ab)}if(0===$a){h=null;break a}$a=h[n];h[n]=h[m];h[m]=$a;for(n=m+1;n<k;n++)for($a=-h[n][m]/h[m][m],ab=m;ab<k+1;ab++)h[n][ab]=m==ab?0:h[n][ab]+$a*h[m][ab]}m=Array(k);
for(n=k-1;0<=n;n--)for(m[n]=h[n][k]/h[n][n],$a=n-1;0<=$a;$a--)h[$a][k]-=h[$a][n]*m[n];h=m}h&&(q.save(),q.beginPath(),Hl?(m=(a+v+ea)/3,n=(p+J+Ga)/3,k=Jl(m,n,a,p),v=Jl(m,n,v,J),ea=Jl(m,n,ea,Ga),q.moveTo(k[0],k[1]),q.lineTo(v[0],v[1]),q.lineTo(ea[0],ea[1])):(q.moveTo(a,p),q.lineTo(v,J),q.lineTo(ea,Ga)),q.closePath(),q.clip(),q.transform(h[0],h[2],h[1],h[3],a,p),q.translate(r[0]-f,r[3]-c),q.scale(e/d,-e/d),q.drawImage(t.canvas,0,0),q.restore())});p&&(q.save(),q.strokeStyle="black",q.lineWidth=1,k.f.forEach(function(a){var c=
a.target;a=(c[0][0]-w[0])/g;var d=-(c[0][1]-w[1])/g,e=(c[1][0]-w[0])/g,f=-(c[1][1]-w[1])/g,h=(c[2][0]-w[0])/g,c=-(c[2][1]-w[1])/g;q.beginPath();q.moveTo(a,d);q.lineTo(e,f);q.lineTo(h,c);q.closePath();q.stroke()}),q.restore());return q.canvas};function Ll(a,c,d,e,f){this.g=a;this.c=c;var g={},h=Id(this.c,this.g);this.a=function(a){var c=a[0]+"/"+a[1];g[c]||(g[c]=h(a));return g[c]};this.i=e;this.s=f*f;this.f=[];this.l=!1;this.o=this.g.b&&!!e&&!!this.g.G()&&Wc(e)==Wc(this.g.G());this.b=this.g.G()?Wc(this.g.G()):null;this.j=this.c.G()?Wc(this.c.G()):null;a=Sc(d);c=Rc(d);e=Qc(d);d=Pc(d);f=this.a(a);var k=this.a(c),m=this.a(e),n=this.a(d);Ml(this,a,c,e,d,f,k,m,n,10);if(this.l){var p=Infinity;this.f.forEach(function(a){p=Math.min(p,a.source[0][0],
a.source[1][0],a.source[2][0])});this.f.forEach(function(a){if(Math.max(a.source[0][0],a.source[1][0],a.source[2][0])-p>this.b/2){var c=[[a.source[0][0],a.source[0][1]],[a.source[1][0],a.source[1][1]],[a.source[2][0],a.source[2][1]]];c[0][0]-p>this.b/2&&(c[0][0]-=this.b);c[1][0]-p>this.b/2&&(c[1][0]-=this.b);c[2][0]-p>this.b/2&&(c[2][0]-=this.b);Math.max(c[0][0],c[1][0],c[2][0])-Math.min(c[0][0],c[1][0],c[2][0])<this.b/2&&(a.source=c)}},this)}g={}}
function Ml(a,c,d,e,f,g,h,k,m,n){var p=xc([g,h,k,m]),q=a.b?Wc(p)/a.b:null,r=a.g.b&&.5<q&&1>q,t=!1;if(0<n){if(a.c.g&&a.j)var v=xc([c,d,e,f]),t=t|.25<Wc(v)/a.j;!r&&a.g.g&&q&&(t|=.25<q)}if(t||!a.i||ad(p,a.i)){if(!(t||isFinite(g[0])&&isFinite(g[1])&&isFinite(h[0])&&isFinite(h[1])&&isFinite(k[0])&&isFinite(k[1])&&isFinite(m[0])&&isFinite(m[1])))if(0<n)t=!0;else return;if(0<n&&(t||(q=a.a([(c[0]+e[0])/2,(c[1]+e[1])/2]),p=r?($b(g[0],a.b)+$b(k[0],a.b))/2-$b(q[0],a.b):(g[0]+k[0])/2-q[0],q=(g[1]+k[1])/2-q[1],
t=p*p+q*q>a.s),t)){Math.abs(c[0]-e[0])<=Math.abs(c[1]-e[1])?(r=[(d[0]+e[0])/2,(d[1]+e[1])/2],p=a.a(r),q=[(f[0]+c[0])/2,(f[1]+c[1])/2],t=a.a(q),Ml(a,c,d,r,q,g,h,p,t,n-1),Ml(a,q,r,e,f,t,p,k,m,n-1)):(r=[(c[0]+d[0])/2,(c[1]+d[1])/2],p=a.a(r),q=[(e[0]+f[0])/2,(e[1]+f[1])/2],t=a.a(q),Ml(a,c,r,q,f,g,p,t,m,n-1),Ml(a,r,d,e,q,p,h,k,t,n-1));return}if(r){if(!a.o)return;a.l=!0}a.f.push({source:[g,k,m],target:[c,e,f]});a.f.push({source:[g,h,k],target:[c,d,e]})}}
function Nl(a){var c=yc();a.f.forEach(function(a){a=a.source;zc(c,a[0]);zc(c,a[1]);zc(c,a[2])});return c};function Ol(a,c,d,e,f,g){this.A=c;this.s=a.G();var h=c.G(),k=h?$c(d,h):d,h=Il(a,c,Yc(k),e);this.j=new Ll(a,c,k,this.s,.5*h);this.c=e;this.g=d;a=Nl(this.j);this.l=(this.ob=g(a,h,f))?this.ob.f:1;this.Cd=this.i=null;f=2;g=[];this.ob&&(f=0,g=this.ob.ea());Hi.call(this,d,e,this.l,f,g)}y(Ol,Hi);Ol.prototype.fa=function(){1==this.state&&(sb(this.Cd),this.Cd=null);Ol.ia.fa.call(this)};Ol.prototype.a=function(){return this.i};
Ol.prototype.Bd=function(){var a=this.ob.V();2==a&&(this.i=Kl(Wc(this.g)/this.c,Xc(this.g)/this.c,this.l,this.ob.Z(),0,this.c,this.g,this.j,[{extent:this.ob.G(),image:this.ob.a()}],0));this.state=a;Ii(this)};Ol.prototype.load=function(){if(0==this.state){this.state=1;Ii(this);var a=this.ob.V();2==a||3==a?this.Bd():(this.Cd=D(this.ob,"change",function(){var a=this.ob.V();if(2==a||3==a)sb(this.Cd),this.Cd=null,this.Bd()},this),this.ob.load())}};function Pl(a){rg.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,state:a.state});this.A=void 0!==a.resolutions?a.resolutions:null;this.a=null;this.na=0}y(Pl,rg);Pl.prototype.Pb=function(){return this.A};function Ql(a,c){if(a.A){var d=Va(a.A,c,0);c=a.A[d]}return c}
Pl.prototype.B=function(a,c,d,e){var f=this.f;if(f&&e&&!Hd(f,e)){if(this.a){if(this.na==this.g&&Hd(this.a.A,e)&&this.a.Z()==c&&this.a.f==d&&Mc(this.a.G(),a))return this.a;this.a.Rd();this.a=null}this.a=new Ol(f,e,a,c,d,function(a,c,d){return this.pd(a,c,d,f)}.bind(this));this.na=this.g;return this.a}f&&(e=f);return this.pd(a,c,d,e)};Pl.prototype.l=function(a){a=a.target;switch(a.V()){case 1:this.b(new Rl(Sl,a));break;case 2:this.b(new Rl(Tl,a));break;case 3:this.b(new Rl(Ul,a))}};
function Vl(a,c){a.a().src=c}function Rl(a,c){Eb.call(this,a);this.image=c}y(Rl,Eb);var Sl="imageloadstart",Tl="imageloadend",Ul="imageloaderror";function Wl(a){Pl.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions,state:a.state});this.aa=a.canvasFunction;this.S=null;this.U=0;this.oa=void 0!==a.ratio?a.ratio:1.5}y(Wl,Pl);Wl.prototype.pd=function(a,c,d,e){c=Ql(this,c);var f=this.S;if(f&&this.U==this.g&&f.Z()==c&&f.f==d&&Gc(f.G(),a))return f;a=a.slice();bd(a,this.oa);(e=this.aa(a,c,d,[Wc(a)/c*d,Xc(a)/c*d],e))&&(f=new Gl(a,c,d,this.ea(),e));this.S=f;this.U=this.g;return f};function Xl(a){Mb.call(this);this.i=void 0;this.a="geometry";this.c=null;this.j=void 0;this.f=null;D(this,Ob(this.a),this.ae,this);void 0!==a&&(a instanceof Md||!a?this.Pa(a):this.C(a))}y(Xl,Mb);l=Xl.prototype;l.clone=function(){var a=new Xl(this.P());a.Bc(this.a);var c=this.X();c&&a.Pa(c.clone());(c=this.c)&&a.lf(c);return a};l.X=function(){return this.get(this.a)};l.Sa=function(){return this.i};l.Fj=function(){return this.a};l.ll=function(){return this.c};l.bc=function(){return this.j};l.ml=function(){this.u()};
l.ae=function(){this.f&&(sb(this.f),this.f=null);var a=this.X();a&&(this.f=D(a,"change",this.ml,this));this.u()};l.Pa=function(a){this.set(this.a,a)};l.lf=function(a){this.j=(this.c=a)?Yl(a):void 0;this.u()};l.jc=function(a){this.i=a;this.u()};l.Bc=function(a){yb(this,Ob(this.a),this.ae,this);this.a=a;D(this,Ob(this.a),this.ae,this);this.ae()};function Yl(a){if(!ka(a)){var c;c=ga(a)?a:[a];a=function(){return c}}return a};function Zl(a,c,d,e,f){pg.call(this,a,c);this.o=nh();this.j=e;this.i=null;this.c={kd:!1,Kf:null,Kh:-1,Vc:null};this.A=f;this.l=d}y(Zl,pg);l=Zl.prototype;l.fa=function(){Zl.ia.fa.call(this)};l.xl=function(){return this.j};l.eb=function(){return this.l};l.load=function(){0==this.state&&(this.state=1,qg(this),this.A(this,this.l),this.s(null,NaN,null))};l.Ph=function(a){this.i=a;this.state=2;qg(this)};l.Th=function(a){this.s=a};function $l(){if(!kf)return!1;try{return new ActiveXObject("MSXML2.DOMDocument"),!0}catch(a){return!1}}var am=kf&&$l();function bm(a){var c=a.xml;if(c)return c;if("undefined"!=typeof XMLSerializer)return(new XMLSerializer).serializeToString(a);throw Error("Your browser does not support serializing XML documents");};var cm;a:if(document.implementation&&document.implementation.createDocument)cm=document.implementation.createDocument("","",null);else{if(am){var dm=new ActiveXObject("MSXML2.DOMDocument");if(dm){dm.resolveExternals=!1;dm.validateOnParse=!1;try{dm.setProperty("ProhibitDTD",!0),dm.setProperty("MaxXMLSize",2048),dm.setProperty("MaxElementDepth",256)}catch(a){}}if(dm){cm=dm;break a}}throw Error("Your browser does not support creating new documents");}var em=cm;
function fm(a,c){return em.createElementNS(a,c)}function gm(a,c){a||(a="");return em.createNode(1,c,a)}var hm=document.implementation&&document.implementation.createDocument?fm:gm;function im(a,c){return jm(a,c,[]).join("")}function jm(a,c,d){if(4==a.nodeType||3==a.nodeType)c?d.push(String(a.nodeValue).replace(/(\r\n|\r|\n)/g,"")):d.push(a.nodeValue);else for(a=a.firstChild;a;a=a.nextSibling)jm(a,c,d);return d}function km(a){return a.localName}
function lm(a){var c=a.localName;return void 0!==c?c:a.baseName}var mm=kf?lm:km;function nm(a){return a instanceof Document}function om(a){return la(a)&&9==a.nodeType}var pm=kf?om:nm;function qm(a){return a instanceof Node}function rm(a){return la(a)&&void 0!==a.nodeType}var sm=kf?rm:qm;function tm(a,c,d){return a.getAttributeNS(c,d)||""}function um(a,c,d){var e="";a=vm(a,c,d);void 0!==a&&(e=a.nodeValue);return e}var wm=document.implementation&&document.implementation.createDocument?tm:um;
function xm(a,c,d){return a.getAttributeNodeNS(c,d)}function ym(a,c,d){var e=null;a=a.attributes;for(var f,g,h=0,k=a.length;h<k;++h)if(f=a[h],f.namespaceURI==c&&(g=f.prefix?f.prefix+":"+d:d,g==f.nodeName)){e=f;break}return e}var vm=document.implementation&&document.implementation.createDocument?xm:ym;function zm(a,c,d,e){a.setAttributeNS(c,d,e)}function Am(a,c,d,e){c?(c=a.ownerDocument.createNode(2,d,c),c.nodeValue=e,a.setAttributeNode(c)):a.setAttribute(d,e)}
var Bm=document.implementation&&document.implementation.createDocument?zm:Am;function Cm(a){return(new DOMParser).parseFromString(a,"application/xml")}function Dm(a,c){return function(d,e){var f=a.call(c,d,e);void 0!==f&&Xa(e[e.length-1],f)}}function Em(a,c){return function(d,e){var f=a.call(void 0!==c?c:this,d,e);void 0!==f&&e[e.length-1].push(f)}}function Fm(a,c){return function(d,e){var f=a.call(void 0!==c?c:this,d,e);void 0!==f&&(e[e.length-1]=f)}}
function Gm(a){return function(c,d){var e=a.call(this,c,d);if(void 0!==e){var f=d[d.length-1],g=c.localName,h;g in f?h=f[g]:h=f[g]=[];h.push(e)}}}function M(a,c){return function(d,e){var f=a.call(this,d,e);void 0!==f&&(e[e.length-1][void 0!==c?c:d.localName]=f)}}function N(a,c){return function(d,e,f){a.call(void 0!==c?c:this,d,e,f);f[f.length-1].node.appendChild(d)}}
function Hm(a){var c,d;return function(e,f,g){if(void 0===c){c={};var h={};h[e.localName]=a;c[e.namespaceURI]=h;d=Im(e.localName)}Jm(c,d,f,g)}}function Im(a,c){return function(d,e,f){d=e[e.length-1].node;e=a;void 0===e&&(e=f);f=c;void 0===c&&(f=d.namespaceURI);return hm(f,e)}}var Km=Im();function Lm(a,c){for(var d=c.length,e=Array(d),f=0;f<d;++f)e[f]=a[c[f]];return e}function Q(a,c,d){d=void 0!==d?d:{};var e,f;e=0;for(f=a.length;e<f;++e)d[a[e]]=c;return d}
function Mm(a,c,d,e){for(c=c.firstElementChild;c;c=c.nextElementSibling){var f=a[c.namespaceURI];void 0!==f&&(f=f[c.localName],void 0!==f&&f.call(e,c,d))}}function R(a,c,d,e,f){e.push(a);Mm(c,d,e,f);return e.pop()}function Jm(a,c,d,e,f,g){for(var h=(void 0!==f?f:d).length,k,m,n=0;n<h;++n)k=d[n],void 0!==k&&(m=c.call(g,k,e,void 0!==f?f[n]:void 0),void 0!==m&&a[m.namespaceURI][m.localName].call(g,m,k,e))}function Nm(a,c,d,e,f,g,h){f.push(a);Jm(c,d,e,f,g,h);f.pop()};function Om(a,c,d,e){return function(f,g,h){var k=new XMLHttpRequest;k.open("GET",ka(a)?a(f,g,h):a,!0);"arraybuffer"==c.W()&&(k.responseType="arraybuffer");k.onload=function(){if(200<=k.status&&300>k.status){var a=c.W(),f;"json"==a||"text"==a?f=k.responseText:"xml"==a?(f=k.responseXML)||(f=Cm(k.responseText)):"arraybuffer"==a&&(f=k.response);f&&d.call(this,c.Ea(f,{featureProjection:h}),c.Qa(f))}else e.call(this)}.bind(this);k.send()}}
function Pm(a,c){return Om(a,c,function(a,c){this.g=c;this.Ph(a)},function(){this.state=3;qg(this)})}function Qm(a,c){return Om(a,c,function(a){this.Gc(a)},va)};function Rm(){return[[-Infinity,-Infinity,Infinity,Infinity]]};var Sm,Tm,Um,Vm;
(function(){var a={ja:{}};(function(){function c(a,d){if(!(this instanceof c))return new c(a,d);this.Re=Math.max(4,a||9);this.Yf=Math.max(2,Math.ceil(.4*this.Re));d&&this.Ui(d);this.clear()}function d(a,c){a.bbox=e(a,0,a.children.length,c)}function e(a,c,d,e){for(var g=[Infinity,Infinity,-Infinity,-Infinity],h;c<d;c++)h=a.children[c],f(g,a.Ja?e(h):h.bbox);return g}function f(a,c){a[0]=Math.min(a[0],c[0]);a[1]=Math.min(a[1],c[1]);a[2]=Math.max(a[2],c[2]);a[3]=Math.max(a[3],c[3])}function g(a,c){return a.bbox[0]-
c.bbox[0]}function h(a,c){return a.bbox[1]-c.bbox[1]}function k(a){return(a[2]-a[0])*(a[3]-a[1])}function m(a){return a[2]-a[0]+(a[3]-a[1])}function n(a,c){return a[0]<=c[0]&&a[1]<=c[1]&&c[2]<=a[2]&&c[3]<=a[3]}function p(a,c){return c[0]<=a[2]&&c[1]<=a[3]&&c[2]>=a[0]&&c[3]>=a[1]}function q(a,c,d,e,f){for(var g=[c,d],h;g.length;)d=g.pop(),c=g.pop(),d-c<=e||(h=c+Math.ceil((d-c)/e/2)*e,r(a,c,d,h,f),g.push(c,h,h,d))}function r(a,c,d,e,f){for(var g,h,k,m,n;d>c;){600<d-c&&(g=d-c+1,h=e-c+1,k=Math.log(g),
m=.5*Math.exp(2*k/3),n=.5*Math.sqrt(k*m*(g-m)/g)*(0>h-g/2?-1:1),k=Math.max(c,Math.floor(e-h*m/g+n)),h=Math.min(d,Math.floor(e+(g-h)*m/g+n)),r(a,k,h,e,f));g=a[e];h=c;m=d;t(a,c,e);for(0<f(a[d],g)&&t(a,c,d);h<m;){t(a,h,m);h++;for(m--;0>f(a[h],g);)h++;for(;0<f(a[m],g);)m--}0===f(a[c],g)?t(a,c,m):(m++,t(a,m,d));m<=e&&(c=m+1);e<=m&&(d=m-1)}}function t(a,c,d){var e=a[c];a[c]=a[d];a[d]=e}c.prototype={all:function(){return this.Tf(this.data,[])},search:function(a){var c=this.data,d=[],e=this.kb;if(!p(a,c.bbox))return d;
for(var f=[],g,h,k,m;c;){g=0;for(h=c.children.length;g<h;g++)k=c.children[g],m=c.Ja?e(k):k.bbox,p(a,m)&&(c.Ja?d.push(k):n(a,m)?this.Tf(k,d):f.push(k));c=f.pop()}return d},load:function(a){if(!a||!a.length)return this;if(a.length<this.Yf){for(var c=0,d=a.length;c<d;c++)this.za(a[c]);return this}a=this.Vf(a.slice(),0,a.length-1,0);this.data.children.length?this.data.height===a.height?this.$f(this.data,a):(this.data.height<a.height&&(c=this.data,this.data=a,a=c),this.Xf(a,this.data.height-a.height-1,
!0)):this.data=a;return this},za:function(a){a&&this.Xf(a,this.data.height-1);return this},clear:function(){this.data={children:[],height:1,bbox:[Infinity,Infinity,-Infinity,-Infinity],Ja:!0};return this},remove:function(a){if(!a)return this;for(var c=this.data,d=this.kb(a),e=[],f=[],g,h,k,m;c||e.length;){c||(c=e.pop(),h=e[e.length-1],g=f.pop(),m=!0);if(c.Ja&&(k=c.children.indexOf(a),-1!==k)){c.children.splice(k,1);e.push(c);this.Si(e);break}m||c.Ja||!n(c.bbox,d)?h?(g++,c=h.children[g],m=!1):c=null:
(e.push(c),f.push(g),g=0,h=c,c=c.children[0])}return this},kb:function(a){return a},Ue:function(a,c){return a[0]-c[0]},Ve:function(a,c){return a[1]-c[1]},toJSON:function(){return this.data},Tf:function(a,c){for(var d=[];a;)a.Ja?c.push.apply(c,a.children):d.push.apply(d,a.children),a=d.pop();return c},Vf:function(a,c,e,f){var g=e-c+1,h=this.Re,k;if(g<=h)return k={children:a.slice(c,e+1),height:1,bbox:null,Ja:!0},d(k,this.kb),k;f||(f=Math.ceil(Math.log(g)/Math.log(h)),h=Math.ceil(g/Math.pow(h,f-1)));
k={children:[],height:f,bbox:null,Ja:!1};var g=Math.ceil(g/h),h=g*Math.ceil(Math.sqrt(h)),m,n,p;for(q(a,c,e,h,this.Ue);c<=e;c+=h)for(n=Math.min(c+h-1,e),q(a,c,n,g,this.Ve),m=c;m<=n;m+=g)p=Math.min(m+g-1,n),k.children.push(this.Vf(a,m,p,f-1));d(k,this.kb);return k},Ri:function(a,c,d,e){for(var f,g,h,m,n,p,q,r;;){e.push(c);if(c.Ja||e.length-1===d)break;q=r=Infinity;f=0;for(g=c.children.length;f<g;f++)h=c.children[f],n=k(h.bbox),p=h.bbox,p=(Math.max(p[2],a[2])-Math.min(p[0],a[0]))*(Math.max(p[3],a[3])-
Math.min(p[1],a[1]))-n,p<r?(r=p,q=n<q?n:q,m=h):p===r&&n<q&&(q=n,m=h);c=m}return c},Xf:function(a,c,d){var e=this.kb;d=d?a.bbox:e(a);var e=[],g=this.Ri(d,this.data,c,e);g.children.push(a);for(f(g.bbox,d);0<=c;)if(e[c].children.length>this.Re)this.$i(e,c),c--;else break;this.Oi(d,e,c)},$i:function(a,c){var e=a[c],f=e.children.length,g=this.Yf;this.Pi(e,g,f);f=this.Qi(e,g,f);f={children:e.children.splice(f,e.children.length-f),height:e.height,bbox:null,Ja:!1};e.Ja&&(f.Ja=!0);d(e,this.kb);d(f,this.kb);
c?a[c-1].children.push(f):this.$f(e,f)},$f:function(a,c){this.data={children:[a,c],height:a.height+1,bbox:null,Ja:!1};d(this.data,this.kb)},Qi:function(a,c,d){var f,g,h,m,n,p,q;n=p=Infinity;for(f=c;f<=d-c;f++)g=e(a,0,f,this.kb),h=e(a,f,d,this.kb),m=Math.max(0,Math.min(g[2],h[2])-Math.max(g[0],h[0]))*Math.max(0,Math.min(g[3],h[3])-Math.max(g[1],h[1])),g=k(g)+k(h),m<n?(n=m,q=f,p=g<p?g:p):m===n&&g<p&&(p=g,q=f);return q},Pi:function(a,c,d){var e=a.Ja?this.Ue:g,f=a.Ja?this.Ve:h,k=this.Uf(a,c,d,e);c=this.Uf(a,
c,d,f);k<c&&a.children.sort(e)},Uf:function(a,c,d,g){a.children.sort(g);g=this.kb;var h=e(a,0,c,g),k=e(a,d-c,d,g),n=m(h)+m(k),p,q;for(p=c;p<d-c;p++)q=a.children[p],f(h,a.Ja?g(q):q.bbox),n+=m(h);for(p=d-c-1;p>=c;p--)q=a.children[p],f(k,a.Ja?g(q):q.bbox),n+=m(k);return n},Oi:function(a,c,d){for(;0<=d;d--)f(c[d].bbox,a)},Si:function(a){for(var c=a.length-1,e;0<=c;c--)0===a[c].children.length?0<c?(e=a[c-1].children,e.splice(e.indexOf(a[c]),1)):this.clear():d(a[c],this.kb)},Ui:function(a){var c=["return a",
" - b",";"];this.Ue=new Function("a","b",c.join(a[0]));this.Ve=new Function("a","b",c.join(a[1]));this.kb=new Function("a","return [a"+a.join(", a")+"];")}};"undefined"!==typeof a?a.ja=c:"undefined"!==typeof self?self.b=c:window.b=c})();Sm=a.ja})();function Wm(a){this.a=Sm(a);this.b={}}l=Wm.prototype;l.za=function(a,c){var d=[a[0],a[1],a[2],a[3],c];this.a.za(d);this.b[x(c)]=d};l.load=function(a,c){for(var d=Array(c.length),e=0,f=c.length;e<f;e++){var g=a[e],h=c[e],g=[g[0],g[1],g[2],g[3],h];d[e]=g;this.b[x(h)]=g}this.a.load(d)};l.remove=function(a){a=x(a);var c=this.b[a];delete this.b[a];return null!==this.a.remove(c)};function Xm(a,c,d){var e=x(d);Mc(a.b[e].slice(0,4),c)||(a.remove(d),a.za(c,d))}
function Ym(a){return a.a.all().map(function(a){return a[4]})}function Zm(a,c){return a.a.search(c).map(function(a){return a[4]})}l.forEach=function(a,c){return $m(Ym(this),a,c)};function an(a,c,d,e){return $m(Zm(a,c),d,e)}function $m(a,c,d){for(var e,f=0,g=a.length;f<g&&!(e=c.call(d,a[f]));f++);return e}l.Oa=function(){return pb(this.b)};l.clear=function(){this.a.clear();this.b={}};l.G=function(){return this.a.data.bbox};function bn(a){a=a||{};rg.call(this,{attributions:a.attributions,logo:a.logo,projection:void 0,state:"ready",wrapX:void 0!==a.wrapX?a.wrapX:!0});this.H=va;void 0!==a.loader?this.H=a.loader:void 0!==a.url&&(this.H=Qm(a.url,a.format));this.oa=void 0!==a.strategy?a.strategy:Rm;var c=void 0!==a.useSpatialIndex?a.useSpatialIndex:!0;this.a=c?new Wm:null;this.S=new Wm;this.i={};this.j={};this.l={};this.o={};this.c=null;var d,e;a.features instanceof Se?(d=a.features,e=d.a):ga(a.features)&&(e=a.features);
c||void 0!==d||(d=new Se(e));void 0!==e&&cn(this,e);void 0!==d&&dn(this,d)}y(bn,rg);l=bn.prototype;l.rb=function(a){var c=x(a).toString();if(en(this,c,a)){fn(this,c,a);var d=a.X();d?(c=d.G(),this.a&&this.a.za(c,a)):this.i[c]=a;this.b(new gn("addfeature",a))}this.u()};function fn(a,c,d){a.o[c]=[D(d,"change",a.oh,a),D(d,"propertychange",a.oh,a)]}function en(a,c,d){var e=!0,f=d.Sa();void 0!==f?f.toString()in a.j?e=!1:a.j[f.toString()]=d:a.l[c]=d;return e}l.Gc=function(a){cn(this,a);this.u()};
function cn(a,c){var d,e,f,g,h=[],k=[],m=[];e=0;for(f=c.length;e<f;e++)g=c[e],d=x(g).toString(),en(a,d,g)&&k.push(g);e=0;for(f=k.length;e<f;e++){g=k[e];d=x(g).toString();fn(a,d,g);var n=g.X();n?(d=n.G(),h.push(d),m.push(g)):a.i[d]=g}a.a&&a.a.load(h,m);e=0;for(f=k.length;e<f;e++)a.b(new gn("addfeature",k[e]))}
function dn(a,c){var d=!1;D(a,"addfeature",function(a){d||(d=!0,c.push(a.feature),d=!1)});D(a,"removefeature",function(a){d||(d=!0,c.remove(a.feature),d=!1)});D(c,"add",function(a){d||(a=a.element,d=!0,this.rb(a),d=!1)},a);D(c,"remove",function(a){d||(a=a.element,d=!0,this.nb(a),d=!1)},a);a.c=c}
l.clear=function(a){if(a){for(var c in this.o)this.o[c].forEach(sb);this.c||(this.o={},this.j={},this.l={})}else if(this.a){this.a.forEach(this.Jf,this);for(var d in this.i)this.Jf(this.i[d])}this.c&&this.c.clear();this.a&&this.a.clear();this.S.clear();this.i={};this.b(new gn("clear"));this.u()};l.mg=function(a,c){if(this.a)return this.a.forEach(a,c);if(this.c)return this.c.forEach(a,c)};function hn(a,c,d){a.ub([c[0],c[1],c[0],c[1]],function(a){if(a.X().ig(c))return d.call(void 0,a)})}
l.ub=function(a,c,d){if(this.a)return an(this.a,a,c,d);if(this.c)return this.c.forEach(c,d)};l.ng=function(a,c,d){return this.ub(a,function(e){if(e.X().Ia(a)&&(e=c.call(d,e)))return e})};l.ug=function(){return this.c};l.pe=function(){var a;this.c?a=this.c.a:this.a&&(a=Ym(this.a),pb(this.i)||Xa(a,ob(this.i)));return a};l.tg=function(a){var c=[];hn(this,a,function(a){c.push(a)});return c};l.$e=function(a){return Zm(this.a,a)};
l.pg=function(a){var c=a[0],d=a[1],e=null,f=[NaN,NaN],g=Infinity,h=[-Infinity,-Infinity,Infinity,Infinity];an(this.a,h,function(a){var m=a.X(),n=g;g=m.sb(c,d,f,g);g<n&&(e=a,a=Math.sqrt(g),h[0]=c-a,h[1]=d-a,h[2]=c+a,h[3]=d+a)});return e};l.G=function(){return this.a.G()};l.sg=function(a){a=this.j[a.toString()];return void 0!==a?a:null};
l.oh=function(a){a=a.target;var c=x(a).toString(),d=a.X();d?(d=d.G(),c in this.i?(delete this.i[c],this.a&&this.a.za(d,a)):this.a&&Xm(this.a,d,a)):c in this.i||(this.a&&this.a.remove(a),this.i[c]=a);d=a.Sa();void 0!==d?(d=d.toString(),c in this.l?(delete this.l[c],this.j[d]=a):this.j[d]!==a&&(jn(this,a),this.j[d]=a)):c in this.l||(jn(this,a),this.l[c]=a);this.u();this.b(new gn("changefeature",a))};l.Oa=function(){return this.a.Oa()&&pb(this.i)};
l.Oc=function(a,c,d){var e=this.S;a=this.oa(a,c);var f,g;f=0;for(g=a.length;f<g;++f){var h=a[f];an(e,h,function(a){return Gc(a.extent,h)})||(this.H.call(this,h,c,d),e.za(h,{extent:h.slice()}))}};l.nb=function(a){var c=x(a).toString();c in this.i?delete this.i[c]:this.a&&this.a.remove(a);this.Jf(a);this.u()};l.Jf=function(a){var c=x(a).toString();this.o[c].forEach(sb);delete this.o[c];var d=a.Sa();void 0!==d?delete this.j[d.toString()]:delete this.l[c];this.b(new gn("removefeature",a))};
function jn(a,c){for(var d in a.j)if(a.j[d]===c){delete a.j[d];break}}function gn(a,c){Eb.call(this,a);this.feature=c}y(gn,Eb);function kn(a){this.c=a.source;this.ya=nc();this.i=nh();this.j=[0,0];this.s=null;Wl.call(this,{attributions:a.attributions,canvasFunction:this.kj.bind(this),logo:a.logo,projection:a.projection,ratio:a.ratio,resolutions:a.resolutions,state:this.c.V()});this.H=null;this.o=void 0;this.kh(a.style);D(this.c,"change",this.Am,this)}y(kn,Wl);l=kn.prototype;
l.kj=function(a,c,d,e,f){var g=new xl(.5*c/d,a,c);this.c.Oc(a,c,f);var h=!1;this.c.ub(a,function(a){var e;if(!(e=h)){var f;(e=a.bc())?f=e.call(a,c):this.o&&(f=this.o(a,c));if(f){var p,q=!1;ga(f)||(f=[f]);e=0;for(p=f.length;e<p;++e)q=El(g,a,f[e],Dl(c,d),this.zm,this)||q;e=q}else e=!1}h=e},this);yl(g);if(h)return null;this.j[0]!=e[0]||this.j[1]!=e[1]?(this.i.canvas.width=e[0],this.i.canvas.height=e[1],this.j[0]=e[0],this.j[1]=e[1]):this.i.clearRect(0,0,e[0],e[1]);a=ln(this,Yc(a),c,d,e);g.a(this.i,d,
a,0,{});this.s=g;return this.i.canvas};l.oe=function(a,c,d,e,f){if(this.s){var g={};return this.s.f(a,c,0,e,function(a){var c=x(a).toString();if(!(c in g))return g[c]=!0,f(a)})}};l.wm=function(){return this.c};l.xm=function(){return this.H};l.ym=function(){return this.o};function ln(a,c,d,e,f){return Ji(a.ya,f[0]/2,f[1]/2,e/d,-e/d,0,-c[0],-c[1])}l.zm=function(){this.u()};l.Am=function(){tg(this,this.c.V())};l.kh=function(a){this.H=void 0!==a?a:Ok;this.o=a?Mk(this.H):void 0;this.u()};function mn(a){dl.call(this,a);this.f=null;this.o=nc();this.j=this.i=null}y(mn,dl);mn.prototype.gb=function(a,c,d,e){var f=this.a;return f.da().oe(a,c.viewState.resolution,c.viewState.rotation,c.skippedFeatureUids,function(a){return d.call(e,a,f)})};
mn.prototype.yc=function(a,c,d,e){if(this.f&&this.f.a())if(this.a.da()instanceof kn){if(a=a.slice(),Li(c.pixelToCoordinateMatrix,a,a),this.gb(a,c,fd,this))return d.call(e,this.a)}else if(this.i||(this.i=nc(),tc(this.o,this.i)),c=[0,0],Li(this.i,a,c),this.j||(this.j=nh(1,1)),this.j.clearRect(0,0,1,1),this.j.drawImage(this.f?this.f.a():null,c[0],c[1],1,1,0,0,1,1),0<this.j.getImageData(0,0,1,1).data[3])return d.call(e,this.a)};
mn.prototype.l=function(a,c){var d=a.pixelRatio,e=a.viewState,f=e.center,g=e.resolution,h=this.a.da(),k=a.viewHints,m=a.extent;void 0!==c.extent&&(m=$c(m,c.extent));k[0]||k[1]||Vc(m)||(e=h.B(m,g,d,e.projection))&&Oi(this,e)&&(this.f=e);if(this.f){var e=this.f,k=e.G(),m=e.Z(),n=e.f,g=d*m/(g*n);Ji(this.o,d*a.size[0]/2,d*a.size[1]/2,g,g,0,n*(k[0]-f[0])/m,n*(f[1]-k[3])/m);this.i=null;Qi(a.attributions,e.ea());Ri(a,h)}return!!this.f};function nn(a){dl.call(this,a);this.j=null;this.i=nh();this.s=null;this.A=yc()}y(nn,dl);
nn.prototype.c=function(a,c,d){var e=a.pixelRatio,f=a.viewState,g=f.center,h=f.projection,k=a.size,f=e/f.resolution,m=this.a,n=m.da(),p=n.Ud(h),q=n.Wd(h),r=gl(this,a,0);el(this,"precompose",d,a,r);Ib(m,"render")?(this.i.canvas.width=d.canvas.width,this.i.canvas.height=d.canvas.height,m=this.i):m=d;var t=Math.round(e*k[0]/2),k=Math.round(e*k[1]/2),v=m.globalAlpha;m.globalAlpha=c.opacity;c=n.Za(h);var w=this.s,A,B,z,C,O,I,K,P,da,J,ea;C=0;for(O=w.length;C<O;++C){P=w[C];da=c.Ca(P.ga,this.A);if(A=!q&&
this.j[P.ga.toString()]){m.save();m.beginPath();m.moveTo((da[0]-g[0])*f+t,(g[1]-da[1])*f+k);m.lineTo((da[2]-g[0])*f+t,(g[1]-da[1])*f+k);m.lineTo((da[2]-g[0])*f+t,(g[1]-da[3])*f+k);m.lineTo((da[0]-g[0])*f+t,(g[1]-da[3])*f+k);m.closePath();I=0;for(K=A.length;I<K;++I)B=A[I],m.moveTo((B[0]-g[0])*f+t,(g[1]-B[1])*f+k),m.lineTo((B[0]-g[0])*f+t,(g[1]-B[3])*f+k),m.lineTo((B[2]-g[0])*f+t,(g[1]-B[3])*f+k),m.lineTo((B[2]-g[0])*f+t,(g[1]-B[1])*f+k),m.closePath();m.clip()}z=P.ga[0];I=Kg(n,z,e,h);B=Sc(da);K=Math.round(Wc(da)*
f);da=Math.round(Xc(da)*f);z=Pc(c.Ca(c.ud(g,z)));J=t+Math.round((z[0]-g[0])*f);ea=k+Math.round((g[1]-z[1])*f);m.drawImage(P.cb(),p,p,I[0],I[1],Math.round((B[0]-z[0])*f/K)*K+J,Math.round((z[1]-B[1])*f/da)*da+ea,K,da);A&&m.restore()}m!=d&&(el(this,"render",m,a,r),d.drawImage(m.canvas,0,0));m.globalAlpha=v;fl(this,d,a,r)};
nn.prototype.l=function(a,c){function d(a){a=a.V();return 2==a||4==a||3==a&&!v}var e=a.pixelRatio,f=a.viewState,g=f.projection,h=this.a,k=h.da(),m=k.Za(g),n=Dg(m,f.resolution),p=m.Z(n),q=f.center;p==f.resolution?(q=Ti(q,p,a.size),f=Zc(q,p,f.rotation,a.size)):f=a.extent;void 0!==c.extent&&(f=$c(f,c.extent));if(Vc(f))return!1;var p=Ag(m,f,p),r={};r[n]={};var t=this.cd(k,g,r),v=h.f(),q=yc(),w=new Me(0,0,0,0),A,B,z,C;for(z=p.ra;z<=p.va;++z)for(C=p.xa;C<=p.Aa;++C)A=k.Qb(n,z,C,e,g),!d(A)&&A.a&&(A=A.a),
d(A)?r[n][A.ga.toString()]=A:(B=xg(m,A.ga,t,null,w,q),B||(A=zg(m,A.ga,w,q))&&t(n+1,A));t=Object.keys(r).map(Number);t.sort(Ta);z=[];var O,I;C=0;for(B=t.length;C<B;++C)for(O in A=t[C],I=r[A],I)A=I[O],2==A.V()&&z.push(A);this.s=z;if(!k.Wd(g)){var K={},P;for(C=z.length-1;0<=C;--C)P=z[C].ga,xg(m,P,function(a,c){var d=r[a];if(d){var e,f;for(e in d)if(f=d[e],c.contains(f.ga)&&2==f.V())return e in K||(K[e]=[]),K[e].push(m.Ca(P)),!0}return!1},this,w,q);this.j=K}Si(a.usedTiles,k,n,p);Ui(a,k,m,e,g,f,n,h.a());
Pi(a,k);Ri(a,k);return!0};nn.prototype.yc=function(a,c,d,e){var f=this.i.canvas,g=c.size;f.width=g[0];f.height=g[1];this.c(c,Ci(this.a),this.i);if(0<this.i.getImageData(a[0],a[1],1,1).data[3])return d.call(e,this.a)};function on(a){dl.call(this,a);this.j=!1;this.J=-1;this.B=NaN;this.A=yc();this.i=this.T=null;this.s=nh()}y(on,dl);
on.prototype.c=function(a,c,d){var e=a.extent,f=a.pixelRatio,g=c.Pc?a.skippedFeatureUids:{},h=a.viewState,k=h.projection,h=h.rotation,m=k.G(),n=this.a.da(),p=gl(this,a,0);el(this,"precompose",d,a,p);var q=this.i;if(q&&!q.Oa()){var r;Ib(this.a,"render")?(this.s.canvas.width=d.canvas.width,this.s.canvas.height=d.canvas.height,r=this.s):r=d;var t=r.globalAlpha;r.globalAlpha=c.opacity;c=a.size[0]*f;var v=a.size[1]*f;zk(r,-h,c/2,v/2);q.a(r,f,p,h,g);if(n.J&&k.b&&!Gc(m,e)){for(var k=e[0],n=Wc(m),w=0;k<m[0];)--w,
p=n*w,p=gl(this,a,p),q.a(r,f,p,h,g),k+=n;w=0;for(k=e[2];k>m[2];)++w,p=n*w,p=gl(this,a,p),q.a(r,f,p,h,g),k-=n;p=gl(this,a,0)}zk(r,h,c/2,v/2);r!=d&&(el(this,"render",r,a,p),d.drawImage(r.canvas,0,0));r.globalAlpha=t}fl(this,d,a,p)};on.prototype.gb=function(a,c,d,e){if(this.i){var f=this.a,g={};return this.i.f(a,c.viewState.resolution,c.viewState.rotation,{},function(a){var c=x(a).toString();if(!(c in g))return g[c]=!0,d.call(e,a,f)})}};on.prototype.D=function(){Ni(this)};
on.prototype.l=function(a){function c(a){var c,e=a.bc();e?c=e.call(a,n):(e=d.f)&&(c=e(a,n));if(c){if(c){e=!1;if(ga(c))for(var f=0,g=c.length;f<g;++f)e=El(r,a,c[f],Dl(n,p),this.D,this)||e;else e=El(r,a,c,Dl(n,p),this.D,this)||e;a=e}else a=!1;this.j=this.j||a}}var d=this.a,e=d.da();Qi(a.attributions,e.ea());Ri(a,e);var f=a.viewHints[0],g=a.viewHints[1],h=d.s,k=d.A;if(!this.j&&!h&&f||!k&&g)return!0;var m=a.extent,k=a.viewState,f=k.projection,n=k.resolution,p=a.pixelRatio,g=d.g,q=d.a,h=Qk(d);void 0===
h&&(h=Cl);m=Ac(m,q*n);q=k.projection.G();e.J&&k.projection.b&&!Gc(q,a.extent)&&(a=Math.max(Wc(m)/2,Wc(q)),m[0]=q[0]-a,m[2]=q[2]+a);if(!this.j&&this.B==n&&this.J==g&&this.T==h&&Gc(this.A,m))return!0;Db(this.i);this.i=null;this.j=!1;var r=new xl(.5*n/p,m,n,d.a);e.Oc(m,n,f);if(h){var t=[];e.ub(m,function(a){t.push(a)},this);t.sort(h);t.forEach(c,this)}else e.ub(m,c,this);yl(r);this.B=n;this.J=g;this.T=h;this.A=m;this.i=r;return!0};function pn(a,c){var d=/\{z\}/g,e=/\{x\}/g,f=/\{y\}/g,g=/\{-y\}/g;return function(h){if(h)return a.replace(d,h[0].toString()).replace(e,h[1].toString()).replace(f,function(){return(-h[2]-1).toString()}).replace(g,function(){var a=c.b?c.b[h[0]]:null;return(a.Aa-a.xa+1+h[2]).toString()})}}function qn(a,c){for(var d=a.length,e=Array(d),f=0;f<d;++f)e[f]=pn(a[f],c);return rn(e)}function rn(a){return 1===a.length?a[0]:function(c,d,e){if(c)return a[$b((c[1]<<c[0])+c[2],a.length)](c,d,e)}}
function sn(){}function tn(a){var c=[],d=/\{(\d)-(\d)\}/.exec(a)||/\{([a-z])-([a-z])\}/.exec(a);if(d){var e=d[2].charCodeAt(0),f;for(f=d[1].charCodeAt(0);f<=e;++f)c.push(a.replace(d[0],String.fromCharCode(f)))}else c.push(a);return c};function un(a){Ig.call(this,{attributions:a.attributions,Se:a.Se,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tilePixelRatio:a.tilePixelRatio,wrapX:a.wrapX});this.tileLoadFunction=a.tileLoadFunction;this.tileUrlFunction=this.qc?this.qc.bind(this):sn;this.urls=null;a.urls?this.Ya(a.urls):a.url&&this.Xa(a.url);a.tileUrlFunction&&this.Na(a.tileUrlFunction)}y(un,Ig);l=un.prototype;l.$a=function(){return this.tileLoadFunction};l.ab=function(){return this.tileUrlFunction};
l.bb=function(){return this.urls};l.nh=function(a){a=a.target;switch(a.V()){case 1:this.b(new Mg("tileloadstart",a));break;case 2:this.b(new Mg("tileloadend",a));break;case 3:this.b(new Mg("tileloaderror",a))}};l.jb=function(a){this.a.clear();this.tileLoadFunction=a;this.u()};l.Na=function(a){this.a.clear();this.tileUrlFunction=a;this.u()};l.Xa=function(a){a=this.urls=tn(a);this.Na(this.qc?this.qc.bind(this):qn(a,this.tileGrid))};
l.Ya=function(a){this.urls=a;this.Na(this.qc?this.qc.bind(this):qn(a,this.tileGrid))};l.Of=function(a,c,d){a=this.Db(a,c,d);lg(this.a,a)&&this.a.get(a)};function vn(a){un.call(this,{attributions:a.attributions,Se:128,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction?a.tileLoadFunction:wn,tileUrlFunction:a.tileUrlFunction,tilePixelRatio:a.tilePixelRatio,url:a.url,urls:a.urls,wrapX:void 0===a.wrapX?!0:a.wrapX});this.c=a.format?a.format:null;this.tileClass=a.tileClass?a.tileClass:Zl}y(vn,un);
vn.prototype.Qb=function(a,c,d,e,f){var g=this.Db(a,c,d);if(lg(this.a,g))return this.a.get(g);a=[a,c,d];e=(c=Lg(this,a,f))?this.tileUrlFunction(c,e,f):void 0;e=new this.tileClass(a,void 0!==e?0:4,void 0!==e?e:"",this.c,this.tileLoadFunction);D(e,"change",this.nh,this);this.a.set(g,e);return e};function wn(a,c){a.Th(Pm(c,a.j))};function xn(a){dl.call(this,a);this.s=nh();this.i=!1;this.A=[];this.T=yc();this.J=[NaN,NaN];this.j=nc()}y(xn,dl);
xn.prototype.c=function(a,c,d){var e=a.pixelRatio,f=c.Pc?a.skippedFeatureUids:{},g=a.viewState,h=g.center,k=g.projection,m=g.resolution,g=g.rotation,n=a.size,p=e/m,q=this.a,r=q.da(),t=r.uc(e),v=gl(this,a,0);el(this,"precompose",d,a,v);Ib(q,"render")?(this.s.canvas.width=d.canvas.width,this.s.canvas.height=d.canvas.height,q=this.s):q=d;var w=q.globalAlpha;q.globalAlpha=c.opacity;c=this.A;var A=r.tileGrid,B,z,C,O,I,K,P,da,J,ea,Ga,$a,ab;C=0;for(O=c.length;C<O;++C)if(ea=c[C],I=ea.c,da=A.Ca(ea.ga,this.T),
B=ea.ga[0],$a=Sb(A.Ua(B),this.J),J="tile-pixels"==ea.g.a,K=A.Z(B),Ga=K/t,z=K/m,K=Math.round(e*n[0]/2),P=Math.round(e*n[1]/2),ab=$a[0]*e*z,z*=$a[1]*e,$a=$a[0]*e,ab<$a/4||ab>4*$a)J?(da=Sc(da),Ga=Ji(this.j,K,P,p*Ga,p*Ga,g,(da[0]-h[0])/Ga,(h[1]-da[1])/Ga)):Ga=v,I.Vc.a(q,e,Ga,g,f);else{B=Kg(r,B,e,k);J?Ga=Ji(this.j,0,0,p*Ga,p*Ga,g,-B[0]/2,-B[1]/2):(Ga=Yc(da),Ga=Ji(this.j,0,0,p,-p,-g,-Ga[0],-Ga[1]));ea=ea.o;if(I.resolution!==m||I.rotation!==g)I.resolution=m,I.rotation=g,ea.canvas.width=ab+.5,ea.canvas.height=
z+.5,ea.translate(ab/2,z/2),ea.rotate(-g),I.Vc.a(ea,e,Ga,g,f,!1);I=Ji(this.j,0,0,p,-p,0,-h[0],-h[1]);I=Nd(Sc(da),0,1,2,I);q.drawImage(ea.canvas,Math.round(I[0]+K),Math.round(I[1])+P)}q!=d&&(el(this,"render",q,a,v),d.drawImage(q.canvas,0,0));q.globalAlpha=w;fl(this,d,a,v)};
function yn(a,c,d,e,f){function g(a){var c,e=a.bc();e?c=e.call(a,A):(e=d.f)&&(c=e(a,A));if(c){ga(c)||(c=[c]);var e=z,f=B;if(c){var g=!1;if(ga(c))for(var h=0,k=c.length;h<k;++h)g=El(f,a,c[h],e,this.B,this)||g;else g=El(f,a,c,e,this.B,this)||g;a=g}else a=!1;this.i=this.i||a;m.kd=m.kd||a}}var h=d.g,k=Qk(d)||null,m=c.c;if(m.kd||m.Kh!=h||m.Kf!=k){Db(m.Vc);m.Vc=null;m.kd=!1;var n=d.da(),p=n.tileGrid,q=c.ga,r=c.g,t="tile-pixels"==r.a,v,w;t?(v=Kg(n,q[0],e,c.g),v=[0,0,v[0],v[1]]):(v=p.Ca(q),Hd(f,r)||(w=!0,
c.g=f));var A=p.Z(q[0]),n=t?n.uc(e):A;m.kd=!1;var B=new xl(0,v,n,d.a),z=Dl(n,e);c=c.i;k&&k!==m.Kf&&c.sort(k);n=0;for(p=c.length;n<p;++n)e=c[n],w&&e.X().fb(r,f),g.call(a,e);yl(B);m.Kh=h;m.Kf=k;m.Vc=B;m.resolution=NaN}}
xn.prototype.gb=function(a,c,d,e){var f=c.pixelRatio,g=c.viewState.resolution;c=c.viewState.rotation;var h=this.a,k={},m=this.A,n=h.da(),p=n.tileGrid,q,r,t,v,w,A;t=0;for(v=m.length;t<v;++t)A=m[t],r=A.ga,w=n.tileGrid.Ca(r,this.T),Dc(w,a)&&("tile-pixels"===A.g.a?(w=Sc(w),g=n.uc(f),r=p.Z(r[0])/g,r=[(a[0]-w[0])/r,(w[1]-a[1])/r]):r=a,A=A.c.Vc,q=q||A.f(r,g,c,{},function(a){var c=x(a).toString();if(!(c in k))return k[c]=!0,d.call(e,a,h)}));return q};xn.prototype.B=function(){Ni(this)};
xn.prototype.l=function(a,c){var d=this.a,e=d.da();Qi(a.attributions,e.ea());Ri(a,e);var f=a.viewHints[0],g=a.viewHints[1],h=d.s,k=d.A;if(!this.i&&!h&&f||!k&&g)return!0;h=a.extent;c.extent&&(h=$c(h,c.extent));if(Vc(h))return!1;for(var g=a.viewState,f=g.projection,k=g.resolution,g=a.pixelRatio,m=e.tileGrid,n=m.Pb(),p=n.length-1;0<p&&n[p]<k;)--p;n=yg(m,h,p);Si(a.usedTiles,e,p,n);Ui(a,e,m,g,f,h,p,d.i());Pi(a,e);h={};h[p]={};var q=this.cd(e,f,h),r=d.S(),t=this.T,v=new Me(0,0,0,0),w,A,B;for(A=n.ra;A<=
n.va;++A)for(B=n.xa;B<=n.Aa;++B)k=e.Qb(p,A,B,g,f),w=k.V(),2==w||4==w||3==w&&!r?h[p][k.ga.toString()]=k:(w=xg(m,k.ga,q,null,v,t),w||(k=zg(m,k.ga,v,t))&&q(p+1,k));this.i=!1;e=Object.keys(h).map(Number);e.sort(Ta);for(var m=[],z,p=0,n=e.length;p<n;++p)for(z in k=e[p],q=h[k],q)k=q[z],2==k.V()&&(m.push(k),yn(this,k,d,g,f));this.A=m;return!0};function zn(a,c){$i.call(this,0,c);this.a=nh();this.j=nh();this.b=this.a.canvas;this.b.style.width="100%";this.b.style.height="100%";this.b.className="ol-unselectable";If(a,this.b,0);this.c=this.j.canvas;this.o=[0,0];this.A=yc();this.f=!0;this.l=nc()}y(zn,$i);zn.prototype.We=function(a){return a instanceof vk?new mn(a):a instanceof G?new nn(a):a instanceof L?new xn(a):a instanceof H?new on(a):null};
function An(a,c,d){var e=a.i,f=a.a;if(Ib(e,c)){var g=d.extent,h=d.pixelRatio,k=d.viewState.rotation,m=d.pixelRatio,n=d.viewState,p=n.resolution;a=Ji(a.l,a.b.width/2,a.b.height/2,m/p,-m/p,-n.rotation,-n.center[0],-n.center[1]);g=new Rk(f,h,g,a,k);e.b(new Ei(c,e,g,d,f,null));cl(g)}}zn.prototype.W=function(){return"canvas"};
zn.prototype.De=function(a){if(a){var c,d=a.pixelRatio,e=a.size[0]*d,f=a.size[1]*d;this.b.width=e;this.b.height=f;var g=a.viewState.rotation,h;if(g){c=this.j;h=Zc(this.o,d,g,a.size,this.A);var d=Wc(h),k=Xc(h);this.c.width=d+.5;this.c.height=k+.5;this.j.translate(Math.round((d-e)/2),Math.round((k-f)/2))}else c=this.a;aj(a);An(this,"precompose",a);d=a.layerStatesArray;cb(d);var k=a.viewState.resolution,m,n,p,q;m=0;for(n=d.length;m<n;++m)q=d[m],p=q.layer,p=cj(this,p),Gi(q,k)&&"ready"==q.H&&p.l(a,q)&&
p.c(a,q,c);g&&(this.a.translate(e/2,f/2),this.a.rotate(g),this.a.drawImage(this.c,Math.round(h[0]),Math.round(h[1])),this.a.rotate(-g),this.a.translate(-e/2,-f/2));An(this,"postcompose",a);this.f||(bg(this.b,!0),this.f=!0);dj(this,a);a.postRenderFunctions.push(bj)}else this.f&&(bg(this.b,!1),this.f=!1)};function Bn(a,c){Mi.call(this,a);this.target=c}y(Bn,Mi);Bn.prototype.i=va;Bn.prototype.o=va;function Cn(a){var c=document.createElement("DIV");c.style.position="absolute";Bn.call(this,a,c);this.f=null;this.c=pc()}y(Cn,Bn);Cn.prototype.gb=function(a,c,d,e){var f=this.a;return f.da().oe(a,c.viewState.resolution,c.viewState.rotation,c.skippedFeatureUids,function(a){return d.call(e,a,f)})};Cn.prototype.i=function(){Hf(this.target);this.f=null};
Cn.prototype.j=function(a,c){var d=a.viewState,e=d.center,f=d.resolution,g=d.rotation,h=this.f,k=this.a.da(),m=a.viewHints,n=a.extent;void 0!==c.extent&&(n=$c(n,c.extent));m[0]||m[1]||Vc(n)||(d=k.B(n,f,a.pixelRatio,d.projection))&&Oi(this,d)&&(h=d);h&&(m=h.G(),n=h.Z(),d=nc(),Ji(d,a.size[0]/2,a.size[1]/2,n/f,n/f,g,(m[0]-e[0])/n,(e[1]-m[3])/n),h!=this.f&&(e=h.a(this),e.style.maxWidth="none",e.style.position="absolute",Hf(this.target),this.target.appendChild(e),this.f=h),Ki(d,this.c)||(rh(this.target,
d),qc(this.c,d)),Qi(a.attributions,h.ea()),Ri(a,k));return!0};function Dn(a){var c=document.createElement("DIV");c.style.position="absolute";Bn.call(this,a,c);this.c=!0;this.s=1;this.l=0;this.f={}}y(Dn,Bn);Dn.prototype.i=function(){Hf(this.target);this.l=0};
Dn.prototype.j=function(a,c){if(!c.visible)return this.c&&(bg(this.target,!1),this.c=!1),!0;var d=a.pixelRatio,e=a.viewState,f=e.projection,g=this.a,h=g.da(),k=h.Za(f),m=h.Ud(f),n=Dg(k,e.resolution),p=k.Z(n),q=e.center,r;p==e.resolution?(q=Ti(q,p,a.size),r=Zc(q,p,e.rotation,a.size)):r=a.extent;void 0!==c.extent&&(r=$c(r,c.extent));var p=Ag(k,r,p),t={};t[n]={};var v=this.cd(h,f,t),w=g.f(),A=yc(),B=new Me(0,0,0,0),z,C,O,I;for(O=p.ra;O<=p.va;++O)for(I=p.xa;I<=p.Aa;++I)z=h.Qb(n,O,I,d,f),C=z.V(),C=2==
C||4==C||3==C&&!w,!C&&z.a&&(z=z.a),C=z.V(),2==C?t[n][z.ga.toString()]=z:4==C||3==C&&!w||(C=xg(k,z.ga,v,null,B,A),C||(z=zg(k,z.ga,B,A))&&v(n+1,z));var K;if(this.l!=h.g){for(K in this.f)w=this.f[+K],Jf(w.target);this.f={};this.l=h.g}A=Object.keys(t).map(Number);A.sort(Ta);var v={},P;O=0;for(I=A.length;O<I;++O){K=A[O];K in this.f?w=this.f[K]:(w=k.ud(q,K),w=new En(k,w),v[K]=!0,this.f[K]=w);K=t[K];for(P in K){z=w;C=K[P];var da=m,J=C.ga,ea=J[0],Ga=J[1],$a=J[2],J=J.toString();if(!(J in z.a)){var ea=Sb(z.c.Ua(ea),
z.l),ab=C.cb(z),Oa=ab.style;Oa.maxWidth="none";var Ec=void 0,Uc=void 0;0<da?(Ec=document.createElement("DIV"),Uc=Ec.style,Uc.overflow="hidden",Uc.width=ea[0]+"px",Uc.height=ea[1]+"px",Oa.position="absolute",Oa.left=-da+"px",Oa.top=-da+"px",Oa.width=ea[0]+2*da+"px",Oa.height=ea[1]+2*da+"px",Ec.appendChild(ab)):(Oa.width=ea[0]+"px",Oa.height=ea[1]+"px",Ec=ab,Uc=Oa);Uc.position="absolute";Uc.left=(Ga-z.g[1])*ea[0]+"px";Uc.top=(z.g[2]-$a)*ea[1]+"px";z.b||(z.b=document.createDocumentFragment());z.b.appendChild(Ec);
z.a[J]=C}}w.b&&(w.target.appendChild(w.b),w.b=null)}m=Object.keys(this.f).map(Number);m.sort(Ta);O=nc();P=0;for(A=m.length;P<A;++P)if(K=m[P],w=this.f[K],K in t)if(z=w.Z(),I=w.Ha(),Ji(O,a.size[0]/2,a.size[1]/2,z/e.resolution,z/e.resolution,e.rotation,(I[0]-q[0])/z,(q[1]-I[1])/z),w.setTransform(O),K in v){for(--K;0<=K;--K)if(K in this.f){I=this.f[K].target;I.parentNode&&I.parentNode.insertBefore(w.target,I.nextSibling);break}0>K&&If(this.target,w.target,0)}else{if(!a.viewHints[0]&&!a.viewHints[1]){C=
yg(w.c,r,w.g[0],B);K=[];z=I=void 0;for(z in w.a)I=w.a[z],C.contains(I.ga)||K.push(I);da=C=void 0;C=0;for(da=K.length;C<da;++C)I=K[C],z=I.ga.toString(),Jf(I.cb(w)),delete w.a[z]}}else Jf(w.target),delete this.f[K];c.opacity!=this.s&&(this.s=this.target.style.opacity=c.opacity);c.visible&&!this.c&&(bg(this.target,!0),this.c=!0);Si(a.usedTiles,h,n,p);Ui(a,h,k,d,f,r,n,g.a());Pi(a,h);Ri(a,h);return!0};
function En(a,c){this.target=document.createElement("DIV");this.target.style.position="absolute";this.target.style.width="100%";this.target.style.height="100%";this.c=a;this.g=c;this.i=Sc(a.Ca(c));this.j=a.Z(c[0]);this.a={};this.b=null;this.f=pc();this.l=[0,0]}En.prototype.Ha=function(){return this.i};En.prototype.Z=function(){return this.j};En.prototype.setTransform=function(a){Ki(a,this.f)||(rh(this.target,a),qc(this.f,a))};function Fn(a){this.l=nh();var c=this.l.canvas;c.style.maxWidth="none";c.style.position="absolute";Bn.call(this,a,c);this.c=!1;this.B=-1;this.T=NaN;this.s=yc();this.f=this.A=null;this.H=nc();this.D=nc()}y(Fn,Bn);
Fn.prototype.o=function(a,c){var d=a.viewState,e=d.center,f=d.rotation,g=d.resolution,d=a.pixelRatio,h=a.size[0],k=a.size[1],m=h*d,n=k*d,e=Ji(this.H,d*h/2,d*k/2,d/g,-d/g,-f,-e[0],-e[1]),g=this.l;g.canvas.width=m;g.canvas.height=n;h=Ji(this.D,0,0,1/d,1/d,0,-(m-h)/2*d,-(n-k)/2*d);rh(g.canvas,h);Gn(this,"precompose",a,e);(h=this.f)&&!h.Oa()&&(g.globalAlpha=c.opacity,h.a(g,d,e,f,c.Pc?a.skippedFeatureUids:{}),Gn(this,"render",a,e));Gn(this,"postcompose",a,e)};
function Gn(a,c,d,e){var f=a.l;a=a.a;Ib(a,c)&&(e=new Rk(f,d.pixelRatio,d.extent,e,d.viewState.rotation),a.b(new Ei(c,a,e,d,f,null)),cl(e))}Fn.prototype.gb=function(a,c,d,e){if(this.f){var f=this.a,g={};return this.f.f(a,c.viewState.resolution,c.viewState.rotation,{},function(a){var c=x(a).toString();if(!(c in g))return g[c]=!0,d.call(e,a,f)})}};Fn.prototype.J=function(){Ni(this)};
Fn.prototype.j=function(a){function c(a){var c,e=a.bc();e?c=e.call(a,m):(e=d.f)&&(c=e(a,m));if(c){if(c){e=!1;if(ga(c))for(var f=0,g=c.length;f<g;++f)e=El(p,a,c[f],Dl(m,n),this.J,this)||e;else e=El(p,a,c,Dl(m,n),this.J,this)||e;a=e}else a=!1;this.c=this.c||a}}var d=this.a,e=d.da();Qi(a.attributions,e.ea());Ri(a,e);var f=a.viewHints[0],g=a.viewHints[1],h=d.s,k=d.A;if(!this.c&&!h&&f||!k&&g)return!0;var g=a.extent,h=a.viewState,f=h.projection,m=h.resolution,n=a.pixelRatio;a=d.g;k=d.a;h=Qk(d);void 0===
h&&(h=Cl);g=Ac(g,k*m);if(!this.c&&this.T==m&&this.B==a&&this.A==h&&Gc(this.s,g))return!0;Db(this.f);this.f=null;this.c=!1;var p=new xl(.5*m/n,g,m,d.a);e.Oc(g,m,f);if(h){var q=[];e.ub(g,function(a){q.push(a)},this);q.sort(h);q.forEach(c,this)}else e.ub(g,c,this);yl(p);this.T=m;this.B=a;this.A=h;this.s=g;this.f=p;return!0};function Hn(a,c){$i.call(this,0,c);this.f=nh();var d=this.f.canvas;d.style.position="absolute";d.style.width="100%";d.style.height="100%";d.className="ol-unselectable";If(a,d,0);this.c=nc();this.b=document.createElement("DIV");this.b.className="ol-unselectable";d=this.b.style;d.position="absolute";d.width="100%";d.height="100%";D(this.b,"touchstart",Gb);If(a,this.b,0);this.a=!0}y(Hn,$i);Hn.prototype.fa=function(){Jf(this.b);Hn.ia.fa.call(this)};
Hn.prototype.We=function(a){if(a instanceof vk)a=new Cn(a);else if(a instanceof G)a=new Dn(a);else if(a instanceof H)a=new Fn(a);else return null;return a};function In(a,c,d){var e=a.i;if(Ib(e,c)){var f=d.extent,g=d.pixelRatio,h=d.viewState,k=h.rotation,m=a.f,n=m.canvas;Ji(a.c,n.width/2,n.height/2,g/h.resolution,-g/h.resolution,-h.rotation,-h.center[0],-h.center[1]);a=new Rk(m,g,f,a.c,k);e.b(new Ei(c,e,a,d,m,null));cl(a)}}Hn.prototype.W=function(){return"dom"};
Hn.prototype.De=function(a){if(a){var c=this.i;if(Ib(c,"precompose")||Ib(c,"postcompose")){var c=this.f.canvas,d=a.pixelRatio;c.width=a.size[0]*d;c.height=a.size[1]*d}In(this,"precompose",a);c=a.layerStatesArray;cb(c);var d=a.viewState.resolution,e,f,g,h;e=0;for(f=c.length;e<f;++e)h=c[e],g=h.layer,g=cj(this,g),If(this.b,g.target,e),Gi(h,d)&&"ready"==h.H?g.j(a,h)&&g.o(a,h):g.i();var c=a.layerStates,k;for(k in this.g)k in c||(g=this.g[k],Jf(g.target));this.a||(bg(this.b,!0),this.a=!0);aj(a);dj(this,
a);a.postRenderFunctions.push(bj);In(this,"postcompose",a)}else this.a&&(bg(this.b,!1),this.a=!1)};function Jn(a){this.b=a}function Kn(a){this.b=a}y(Kn,Jn);Kn.prototype.W=function(){return 35632};function Ln(a){this.b=a}y(Ln,Jn);Ln.prototype.W=function(){return 35633};function Mn(){this.b="precision mediump float;varying vec2 a;varying float b;uniform float k;uniform sampler2D l;void main(void){vec4 texColor=texture2D(l,a);gl_FragColor.rgb=texColor.rgb;float alpha=texColor.a*b*k;if(alpha==0.0){discard;}gl_FragColor.a=alpha;}"}y(Mn,Kn);ca(Mn);
function Nn(){this.b="varying vec2 a;varying float b;attribute vec2 c;attribute vec2 d;attribute vec2 e;attribute float f;attribute float g;uniform mat4 h;uniform mat4 i;uniform mat4 j;void main(void){mat4 offsetMatrix=i;if(g==1.0){offsetMatrix=i*j;}vec4 offsets=offsetMatrix*vec4(e,0.,0.);gl_Position=h*vec4(c,0.,1.)+offsets;a=d;b=f;}"}y(Nn,Ln);ca(Nn);
function On(a,c){this.l=a.getUniformLocation(c,"j");this.o=a.getUniformLocation(c,"i");this.i=a.getUniformLocation(c,"k");this.j=a.getUniformLocation(c,"h");this.b=a.getAttribLocation(c,"e");this.a=a.getAttribLocation(c,"f");this.f=a.getAttribLocation(c,"c");this.g=a.getAttribLocation(c,"g");this.c=a.getAttribLocation(c,"d")};function Pn(a){this.b=void 0!==a?a:[]};function Qn(a,c){this.A=a;this.a=c;this.g={};this.i={};this.c={};this.o=this.s=this.j=this.l=null;(this.f=Ua(ua,"OES_element_index_uint"))&&c.getExtension("OES_element_index_uint");D(this.A,"webglcontextlost",this.rn,this);D(this.A,"webglcontextrestored",this.sn,this)}
function Rn(a,c,d){var e=a.a,f=d.b,g=String(x(d));if(g in a.g)e.bindBuffer(c,a.g[g].buffer);else{var h=e.createBuffer();e.bindBuffer(c,h);var k;34962==c?k=new Float32Array(f):34963==c&&(k=a.f?new Uint32Array(f):new Uint16Array(f));e.bufferData(c,k,35044);a.g[g]={Gb:d,buffer:h}}}function Sn(a,c){var d=a.a,e=String(x(c)),f=a.g[e];d.isContextLost()||d.deleteBuffer(f.buffer);delete a.g[e]}l=Qn.prototype;
l.fa=function(){var a=this.a;if(!a.isContextLost()){for(var c in this.g)a.deleteBuffer(this.g[c].buffer);for(c in this.c)a.deleteProgram(this.c[c]);for(c in this.i)a.deleteShader(this.i[c]);a.deleteFramebuffer(this.j);a.deleteRenderbuffer(this.o);a.deleteTexture(this.s)}};l.qn=function(){return this.a};
function Tn(a){if(!a.j){var c=a.a,d=c.createFramebuffer();c.bindFramebuffer(c.FRAMEBUFFER,d);var e=Un(c,1,1),f=c.createRenderbuffer();c.bindRenderbuffer(c.RENDERBUFFER,f);c.renderbufferStorage(c.RENDERBUFFER,c.DEPTH_COMPONENT16,1,1);c.framebufferTexture2D(c.FRAMEBUFFER,c.COLOR_ATTACHMENT0,c.TEXTURE_2D,e,0);c.framebufferRenderbuffer(c.FRAMEBUFFER,c.DEPTH_ATTACHMENT,c.RENDERBUFFER,f);c.bindTexture(c.TEXTURE_2D,null);c.bindRenderbuffer(c.RENDERBUFFER,null);c.bindFramebuffer(c.FRAMEBUFFER,null);a.j=d;
a.s=e;a.o=f}return a.j}function Vn(a,c){var d=String(x(c));if(d in a.i)return a.i[d];var e=a.a,f=e.createShader(c.W());e.shaderSource(f,c.b);e.compileShader(f);return a.i[d]=f}function Wn(a,c,d){var e=x(c)+"/"+x(d);if(e in a.c)return a.c[e];var f=a.a,g=f.createProgram();f.attachShader(g,Vn(a,c));f.attachShader(g,Vn(a,d));f.linkProgram(g);return a.c[e]=g}l.rn=function(){nb(this.g);nb(this.i);nb(this.c);this.o=this.s=this.j=this.l=null};l.sn=function(){};
l.xe=function(a){if(a==this.l)return!1;this.a.useProgram(a);this.l=a;return!0};function Xn(a,c,d){var e=a.createTexture();a.bindTexture(a.TEXTURE_2D,e);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);void 0!==c&&a.texParameteri(3553,10242,c);void 0!==d&&a.texParameteri(3553,10243,d);return e}function Un(a,c,d){var e=Xn(a,void 0,void 0);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,c,d,0,a.RGBA,a.UNSIGNED_BYTE,null);return e}
function Yn(a,c){var d=Xn(a,33071,33071);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,c);return d};function Zn(a,c){this.J=this.B=void 0;this.o=Yc(c);this.T=[];this.i=[];this.H=void 0;this.c=[];this.f=[];this.ua=this.ta=void 0;this.a=[];this.D=this.l=null;this.S=void 0;this.ya=pc();this.qb=pc();this.U=this.Ga=void 0;this.Fb=pc();this.wa=this.Da=this.aa=void 0;this.oa=[];this.j=[];this.b=[];this.A=null;this.g=[];this.s=[];this.na=void 0}y(Zn,Di);
function $n(a,c){var d=a.A,e=a.l,f=a.oa,g=a.j,h=c.a;return function(){if(!h.isContextLost()){var a,m;a=0;for(m=f.length;a<m;++a)h.deleteTexture(f[a]);a=0;for(m=g.length;a<m;++a)h.deleteTexture(g[a])}Sn(c,d);Sn(c,e)}}
function ao(a,c,d,e){var f=a.B,g=a.J,h=a.H,k=a.ta,m=a.ua,n=a.S,p=a.Ga,q=a.U,r=a.aa?1:0,t=a.Da,v=a.wa,w=a.na,A=Math.cos(t),t=Math.sin(t),B=a.a.length,z=a.b.length,C,O,I,K,P,da;for(C=0;C<d;C+=e)P=c[C]-a.o[0],da=c[C+1]-a.o[1],O=z/8,I=-v*f,K=-v*(h-g),a.b[z++]=P,a.b[z++]=da,a.b[z++]=I*A-K*t,a.b[z++]=I*t+K*A,a.b[z++]=p/m,a.b[z++]=(q+h)/k,a.b[z++]=n,a.b[z++]=r,I=v*(w-f),K=-v*(h-g),a.b[z++]=P,a.b[z++]=da,a.b[z++]=I*A-K*t,a.b[z++]=I*t+K*A,a.b[z++]=(p+w)/m,a.b[z++]=(q+h)/k,a.b[z++]=n,a.b[z++]=r,I=v*(w-f),K=
v*g,a.b[z++]=P,a.b[z++]=da,a.b[z++]=I*A-K*t,a.b[z++]=I*t+K*A,a.b[z++]=(p+w)/m,a.b[z++]=q/k,a.b[z++]=n,a.b[z++]=r,I=-v*f,K=v*g,a.b[z++]=P,a.b[z++]=da,a.b[z++]=I*A-K*t,a.b[z++]=I*t+K*A,a.b[z++]=p/m,a.b[z++]=q/k,a.b[z++]=n,a.b[z++]=r,a.a[B++]=O,a.a[B++]=O+1,a.a[B++]=O+2,a.a[B++]=O,a.a[B++]=O+2,a.a[B++]=O+3}Zn.prototype.Hb=function(a,c){this.g.push(this.a.length);this.s.push(c);var d=a.ha();ao(this,d,d.length,a.qa())};
Zn.prototype.Ib=function(a,c){this.g.push(this.a.length);this.s.push(c);var d=a.ha();ao(this,d,d.length,a.qa())};function bo(a,c){var d=c.a;a.T.push(a.a.length);a.i.push(a.a.length);a.A=new Pn(a.b);Rn(c,34962,a.A);a.l=new Pn(a.a);Rn(c,34963,a.l);var e={};co(a.oa,a.c,e,d);co(a.j,a.f,e,d);a.B=void 0;a.J=void 0;a.H=void 0;a.c=null;a.f=null;a.ta=void 0;a.ua=void 0;a.a=null;a.S=void 0;a.Ga=void 0;a.U=void 0;a.aa=void 0;a.Da=void 0;a.wa=void 0;a.b=null;a.na=void 0}
function co(a,c,d,e){var f,g,h,k=c.length;for(h=0;h<k;++h)f=c[h],g=x(f).toString(),g in d?f=d[g]:(f=Yn(e,f),d[g]=f),a[h]=f}
function eo(a,c,d,e,f,g,h,k,m,n,p){var q=c.a;Rn(c,34962,a.A);Rn(c,34963,a.l);var r=Mn.Zb(),t=Nn.Zb(),t=Wn(c,r,t);a.D?r=a.D:(r=new On(q,t),a.D=r);c.xe(t);q.enableVertexAttribArray(r.f);q.vertexAttribPointer(r.f,2,5126,!1,32,0);q.enableVertexAttribArray(r.b);q.vertexAttribPointer(r.b,2,5126,!1,32,8);q.enableVertexAttribArray(r.c);q.vertexAttribPointer(r.c,2,5126,!1,32,16);q.enableVertexAttribArray(r.a);q.vertexAttribPointer(r.a,1,5126,!1,32,24);q.enableVertexAttribArray(r.g);q.vertexAttribPointer(r.g,
1,5126,!1,32,28);t=a.Fb;Ji(t,0,0,2/(e*g[0]),2/(e*g[1]),-f,-(d[0]-a.o[0]),-(d[1]-a.o[1]));d=a.qb;e=2/g[0];g=2/g[1];rc(d);d[0]=e;d[5]=g;d[10]=1;d[15]=1;g=a.ya;rc(g);0!==f&&wc(g,-f);q.uniformMatrix4fv(r.j,!1,t);q.uniformMatrix4fv(r.o,!1,d);q.uniformMatrix4fv(r.l,!1,g);q.uniform1f(r.i,h);var v;if(void 0===m)fo(a,q,c,k,a.oa,a.T);else{if(n)a:{f=c.f?5125:5123;c=c.f?4:2;g=a.g.length-1;for(h=a.j.length-1;0<=h;--h)for(q.bindTexture(3553,a.j[h]),n=0<h?a.i[h-1]:0,t=a.i[h];0<=g&&a.g[g]>=n;){v=a.g[g];d=a.s[g];
e=x(d).toString();if(void 0===k[e]&&d.X()&&(void 0===p||ad(p,d.X().G()))&&(q.clear(q.COLOR_BUFFER_BIT|q.DEPTH_BUFFER_BIT),q.drawElements(4,t-v,f,v*c),t=m(d))){a=t;break a}t=v;g--}a=void 0}else q.clear(q.COLOR_BUFFER_BIT|q.DEPTH_BUFFER_BIT),fo(a,q,c,k,a.j,a.i),a=(a=m(null))?a:void 0;v=a}q.disableVertexAttribArray(r.f);q.disableVertexAttribArray(r.b);q.disableVertexAttribArray(r.c);q.disableVertexAttribArray(r.a);q.disableVertexAttribArray(r.g);return v}
function fo(a,c,d,e,f,g){var h=d.f?5125:5123;d=d.f?4:2;if(pb(e)){var k;a=0;e=f.length;for(k=0;a<e;++a){c.bindTexture(3553,f[a]);var m=g[a];c.drawElements(4,m-k,h,k*d);k=m}}else{k=0;var n,m=0;for(n=f.length;m<n;++m){c.bindTexture(3553,f[m]);for(var p=0<m?g[m-1]:0,q=g[m],r=p;k<a.g.length&&a.g[k]<=q;){var t=x(a.s[k]).toString();void 0!==e[t]?(r!==p&&c.drawElements(4,p-r,h,r*d),p=r=k===a.g.length-1?q:a.g[k+1]):p=k===a.g.length-1?q:a.g[k+1];k++}r!==p&&c.drawElements(4,p-r,h,r*d)}}}
Zn.prototype.yb=function(a){var c=a.Yb(),d=a.gc(1),e=a.qd(),f=a.qe(1),g=a.A,h=a.Ha(),k=a.B,m=a.s,n=a.Eb();a=a.j;var p;0===this.c.length?this.c.push(d):(p=this.c[this.c.length-1],x(p)!=x(d)&&(this.T.push(this.a.length),this.c.push(d)));0===this.f.length?this.f.push(f):(p=this.f[this.f.length-1],x(p)!=x(f)&&(this.i.push(this.a.length),this.f.push(f)));this.B=c[0];this.J=c[1];this.H=n[1];this.ta=e[1];this.ua=e[0];this.S=g;this.Ga=h[0];this.U=h[1];this.Da=m;this.aa=k;this.wa=a;this.na=n[0]};
function go(a,c,d){this.i=c;this.j=a;this.c=d;this.g={}}function ho(a,c){var d=[],e;for(e in a.g)d.push($n(a.g[e],c));return id.apply(null,d)}function io(a,c){for(var d in a.g)bo(a.g[d],c)}go.prototype.b=function(a,c){var d=this.g[c];void 0===d&&(d=new jo[c](this.j,this.i),this.g[c]=d);return d};go.prototype.Oa=function(){return pb(this.g)};go.prototype.a=function(a,c,d,e,f,g,h,k){var m,n;g=0;for(m=hl.length;g<m;++g)n=this.g[hl[g]],void 0!==n&&eo(n,a,c,d,e,f,h,k,void 0,!1)};
function ko(a,c,d,e,f,g,h,k,m,n){var p=lo,q,r;for(q=hl.length-1;0<=q;--q)if(r=a.g[hl[q]],void 0!==r&&(r=eo(r,c,d,e,f,p,g,h,k,m,n)))return r}go.prototype.f=function(a,c,d,e,f,g,h,k,m,n){var p=c.a;p.bindFramebuffer(p.FRAMEBUFFER,Tn(c));var q;void 0!==this.c&&(q=Ac(Jc(a),e*this.c));return ko(this,c,a,e,f,k,m,function(a){var c=new Uint8Array(4);p.readPixels(0,0,1,1,p.RGBA,p.UNSIGNED_BYTE,c);if(0<c[3]&&(a=n(a)))return a},!0,q)};
function mo(a,c,d,e,f,g,h){var k=d.a;k.bindFramebuffer(k.FRAMEBUFFER,Tn(d));return void 0!==ko(a,d,c,e,f,g,h,function(){var a=new Uint8Array(4);k.readPixels(0,0,1,1,k.RGBA,k.UNSIGNED_BYTE,a);return 0<a[3]},!1)}var jo={Image:Zn},lo=[1,1];function no(a,c,d,e,f,g){this.a=a;this.c=c;this.f=g;this.l=f;this.j=e;this.i=d;this.g=null;this.b={}}y(no,Di);l=no.prototype;l.ld=function(a,c){var d=a.toString(),e=this.b[d];void 0!==e?e.push(c):this.b[d]=[c]};l.Ic=function(){};l.Xe=function(a,c){var d=(0,c.f)(a);if(d&&ad(this.f,d.G())){var e=c.b;void 0===e&&(e=0);this.ld(e,function(a){a.hb(c.c,c.g);a.yb(c.a);a.ib(c.Fa());var e=oo[d.W()];e&&e.call(a,d,null)})}};
l.Sd=function(a,c){var d=a.i,e,f;e=0;for(f=d.length;e<f;++e){var g=d[e],h=oo[g.W()];h&&h.call(this,g,c)}};l.Ib=function(a,c){var d=this.a,e=(new go(1,this.f)).b(0,"Image");e.yb(this.g);e.Ib(a,c);bo(e,d);eo(e,this.a,this.c,this.i,this.j,this.l,1,{},void 0,!1);$n(e,d)()};l.Xb=function(){};l.Jc=function(){};l.Hb=function(a,c){var d=this.a,e=(new go(1,this.f)).b(0,"Image");e.yb(this.g);e.Hb(a,c);bo(e,d);eo(e,this.a,this.c,this.i,this.j,this.l,1,{},void 0,!1);$n(e,d)()};l.Kc=function(){};l.Lc=function(){};
l.Jb=function(){};l.hb=function(){};l.yb=function(a){this.g=a};l.ib=function(){};var oo={Point:no.prototype.Ib,MultiPoint:no.prototype.Hb,GeometryCollection:no.prototype.Sd};function po(){this.b="precision mediump float;varying vec2 a;uniform float f;uniform sampler2D g;void main(void){vec4 texColor=texture2D(g,a);gl_FragColor.rgb=texColor.rgb;gl_FragColor.a=texColor.a*f;}"}y(po,Kn);ca(po);function qo(){this.b="varying vec2 a;attribute vec2 b;attribute vec2 c;uniform mat4 d;uniform mat4 e;void main(void){gl_Position=e*vec4(b,0.,1.);a=(d*vec4(c,0.,1.)).st;}"}y(qo,Ln);ca(qo);
function ro(a,c){this.g=a.getUniformLocation(c,"f");this.f=a.getUniformLocation(c,"e");this.i=a.getUniformLocation(c,"d");this.c=a.getUniformLocation(c,"g");this.b=a.getAttribLocation(c,"b");this.a=a.getAttribLocation(c,"c")};function so(a,c){Mi.call(this,c);this.f=a;this.S=new Pn([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]);this.i=this.pb=null;this.j=void 0;this.s=nc();this.T=pc();this.A=null}y(so,Mi);
function to(a,c,d){var e=a.f.f;if(void 0===a.j||a.j!=d){c.postRenderFunctions.push(ra(function(a,c,d){a.isContextLost()||(a.deleteFramebuffer(c),a.deleteTexture(d))},e,a.i,a.pb));c=Un(e,d,d);var f=e.createFramebuffer();e.bindFramebuffer(36160,f);e.framebufferTexture2D(36160,36064,3553,c,0);a.pb=c;a.i=f;a.j=d}else e.bindFramebuffer(36160,a.i)}
so.prototype.ih=function(a,c,d){uo(this,"precompose",d,a);Rn(d,34962,this.S);var e=d.a,f=po.Zb(),g=qo.Zb(),f=Wn(d,f,g);this.A?g=this.A:this.A=g=new ro(e,f);d.xe(f)&&(e.enableVertexAttribArray(g.b),e.vertexAttribPointer(g.b,2,5126,!1,16,0),e.enableVertexAttribArray(g.a),e.vertexAttribPointer(g.a,2,5126,!1,16,8),e.uniform1i(g.c,0));e.uniformMatrix4fv(g.i,!1,this.s);e.uniformMatrix4fv(g.f,!1,this.T);e.uniform1f(g.g,c.opacity);e.bindTexture(3553,this.pb);e.drawArrays(5,0,4);uo(this,"postcompose",d,a)};
function uo(a,c,d,e){a=a.a;if(Ib(a,c)){var f=e.viewState;a.b(new Ei(c,a,new no(d,f.center,f.resolution,f.rotation,e.size,e.extent),e,null,d))}}so.prototype.rf=function(){this.i=this.pb=null;this.j=void 0};function vo(a,c){so.call(this,a,c);this.o=this.l=this.c=null}y(vo,so);function wo(a,c){var d=c.a();return Yn(a.f.f,d)}vo.prototype.gb=function(a,c,d,e){var f=this.a;return f.da().oe(a,c.viewState.resolution,c.viewState.rotation,c.skippedFeatureUids,function(a){return d.call(e,a,f)})};
vo.prototype.sf=function(a,c){var d=this.f.f,e=a.pixelRatio,f=a.viewState,g=f.center,h=f.resolution,k=f.rotation,m=this.c,n=this.pb,p=this.a.da(),q=a.viewHints,r=a.extent;void 0!==c.extent&&(r=$c(r,c.extent));q[0]||q[1]||Vc(r)||(f=p.B(r,h,e,f.projection))&&Oi(this,f)&&(m=f,n=wo(this,f),this.pb&&a.postRenderFunctions.push(ra(function(a,c){a.isContextLost()||a.deleteTexture(c)},d,this.pb)));m&&(d=this.f.c.A,xo(this,d.width,d.height,e,g,h,k,m.G()),this.o=null,e=this.s,rc(e),vc(e,1,-1),uc(e,0,-1),this.c=
m,this.pb=n,Qi(a.attributions,m.ea()),Ri(a,p));return!0};function xo(a,c,d,e,f,g,h,k){c*=g;d*=g;a=a.T;rc(a);vc(a,2*e/c,2*e/d);wc(a,-h);uc(a,k[0]-f[0],k[1]-f[1]);vc(a,(k[2]-k[0])/2,(k[3]-k[1])/2);uc(a,1,1)}vo.prototype.ne=function(a,c){return void 0!==this.gb(a,c,fd,this)};
vo.prototype.yc=function(a,c,d,e){if(this.c&&this.c.a())if(this.a.da()instanceof kn){if(a=a.slice(),Li(c.pixelToCoordinateMatrix,a,a),this.gb(a,c,fd,this))return d.call(e,this.a)}else{var f=[this.c.a().width,this.c.a().height];if(!this.o){var g=c.size;c=nc();rc(c);uc(c,-1,-1);vc(c,2/g[0],2/g[1]);uc(c,0,g[1]);vc(c,1,-1);g=nc();tc(this.T,g);var h=nc();rc(h);uc(h,0,f[1]);vc(h,1,-1);vc(h,f[0]/2,f[1]/2);uc(h,1,1);var k=nc();sc(h,g,k);sc(k,c,k);this.o=k}c=[0,0];Li(this.o,a,c);if(!(0>c[0]||c[0]>f[0]||0>
c[1]||c[1]>f[1])&&(this.l||(this.l=nh(1,1)),this.l.clearRect(0,0,1,1),this.l.drawImage(this.c.a(),c[0],c[1],1,1,0,0,1,1),0<this.l.getImageData(0,0,1,1).data[3]))return d.call(e,this.a)}};function yo(){this.b="precision mediump float;varying vec2 a;uniform sampler2D e;void main(void){gl_FragColor=texture2D(e,a);}"}y(yo,Kn);ca(yo);function zo(){this.b="varying vec2 a;attribute vec2 b;attribute vec2 c;uniform vec4 d;void main(void){gl_Position=vec4(b*d.xy+d.zw,0.,1.);a=c;}"}y(zo,Ln);ca(zo);function Ao(a,c){this.g=a.getUniformLocation(c,"e");this.f=a.getUniformLocation(c,"d");this.b=a.getAttribLocation(c,"b");this.a=a.getAttribLocation(c,"c")};function Bo(a,c){so.call(this,a,c);this.D=yo.Zb();this.U=zo.Zb();this.c=null;this.J=new Pn([0,0,0,1,1,0,1,1,0,1,0,0,1,1,1,0]);this.B=this.l=null;this.o=-1;this.H=[0,0]}y(Bo,so);l=Bo.prototype;l.fa=function(){Sn(this.f.c,this.J);Bo.ia.fa.call(this)};l.cd=function(a,c,d){var e=this.f;return function(f,g){return Jg(a,c,f,g,function(a){var c=lg(e.a,a.eb());c&&(d[f]||(d[f]={}),d[f][a.ga.toString()]=a);return c})}};l.rf=function(){Bo.ia.rf.call(this);this.c=null};
l.sf=function(a,c,d){var e=this.f,f=d.a,g=a.viewState,h=g.projection,k=this.a,m=k.da(),n=m.Za(h),p=Dg(n,g.resolution),q=n.Z(p),r=Kg(m,p,a.pixelRatio,h),t=r[0]/Sb(n.Ua(p),this.H)[0],v=q/t,w=m.Ud(h),A=g.center,B;q==g.resolution?(A=Ti(A,q,a.size),B=Zc(A,q,g.rotation,a.size)):B=a.extent;q=Ag(n,B,q);if(this.l&&Oe(this.l,q)&&this.o==m.g)v=this.B;else{var z=[q.va-q.ra+1,q.Aa-q.xa+1],C=Math.pow(2,Math.ceil(Math.log(Math.max(z[0]*r[0],z[1]*r[1]))/Math.LN2)),z=v*C,O=n.Ha(p),I=O[0]+q.ra*r[0]*v,v=O[1]+q.xa*r[1]*
v,v=[I,v,I+z,v+z];to(this,a,C);f.viewport(0,0,C,C);f.clearColor(0,0,0,0);f.clear(16384);f.disable(3042);C=Wn(d,this.D,this.U);d.xe(C);this.c||(this.c=new Ao(f,C));Rn(d,34962,this.J);f.enableVertexAttribArray(this.c.b);f.vertexAttribPointer(this.c.b,2,5126,!1,16,0);f.enableVertexAttribArray(this.c.a);f.vertexAttribPointer(this.c.a,2,5126,!1,16,8);f.uniform1i(this.c.g,0);d={};d[p]={};var K=this.cd(m,h,d),P=k.f(),C=!0,I=yc(),da=new Me(0,0,0,0),J,ea,Ga;for(ea=q.ra;ea<=q.va;++ea)for(Ga=q.xa;Ga<=q.Aa;++Ga){O=
m.Qb(p,ea,Ga,t,h);if(void 0!==c.extent&&(J=n.Ca(O.ga,I),!ad(J,c.extent)))continue;J=O.V();J=2==J||4==J||3==J&&!P;!J&&O.a&&(O=O.a);J=O.V();if(2==J){if(lg(e.a,O.eb())){d[p][O.ga.toString()]=O;continue}}else if(4==J||3==J&&!P)continue;C=!1;J=xg(n,O.ga,K,null,da,I);J||(O=zg(n,O.ga,da,I))&&K(p+1,O)}c=Object.keys(d).map(Number);c.sort(Ta);for(var K=new Float32Array(4),$a,ab,Oa,P=0,da=c.length;P<da;++P)for($a in ab=d[c[P]],ab)O=ab[$a],J=n.Ca(O.ga,I),ea=2*(J[2]-J[0])/z,Ga=2*(J[3]-J[1])/z,Oa=2*(J[0]-v[0])/
z-1,J=2*(J[1]-v[1])/z-1,mc(K,ea,Ga,Oa,J),f.uniform4fv(this.c.f,K),Co(e,O,r,w*t),f.drawArrays(5,0,4);C?(this.l=q,this.B=v,this.o=m.g):(this.B=this.l=null,this.o=-1,a.animate=!0)}Si(a.usedTiles,m,p,q);var Ec=e.l;Ui(a,m,n,t,h,B,p,k.a(),function(a){var c;(c=2!=a.V()||lg(e.a,a.eb()))||(c=a.eb()in Ec.g);c||Ec.f([a,Cg(n,a.ga),n.Z(a.ga[0]),r,w*t])},this);Pi(a,m);Ri(a,m);f=this.s;rc(f);uc(f,(A[0]-v[0])/(v[2]-v[0]),(A[1]-v[1])/(v[3]-v[1]));0!==g.rotation&&wc(f,g.rotation);vc(f,a.size[0]*g.resolution/(v[2]-
v[0]),a.size[1]*g.resolution/(v[3]-v[1]));uc(f,-.5,-.5);return!0};l.yc=function(a,c,d,e){if(this.i){var f=[0,0];Li(this.s,[a[0]/c.size[0],(c.size[1]-a[1])/c.size[1]],f);a=[f[0]*this.j,f[1]*this.j];c=this.f.c.a;c.bindFramebuffer(c.FRAMEBUFFER,this.i);f=new Uint8Array(4);c.readPixels(a[0],a[1],1,1,c.RGBA,c.UNSIGNED_BYTE,f);if(0<f[3])return d.call(e,this.a)}};function Do(a,c){so.call(this,a,c);this.o=!1;this.H=-1;this.D=NaN;this.B=yc();this.l=this.c=this.J=null}y(Do,so);l=Do.prototype;l.ih=function(a,c,d){this.l=c;var e=a.viewState,f=this.c;f&&!f.Oa()&&f.a(d,e.center,e.resolution,e.rotation,a.size,a.pixelRatio,c.opacity,c.Pc?a.skippedFeatureUids:{})};l.fa=function(){var a=this.c;a&&(ho(a,this.f.c)(),this.c=null);Do.ia.fa.call(this)};
l.gb=function(a,c,d,e){if(this.c&&this.l){var f=c.viewState,g=this.a,h={};return this.c.f(a,this.f.c,f.center,f.resolution,f.rotation,c.size,c.pixelRatio,this.l.opacity,{},function(a){var c=x(a).toString();if(!(c in h))return h[c]=!0,d.call(e,a,g)})}};l.ne=function(a,c){if(this.c&&this.l){var d=c.viewState;return mo(this.c,a,this.f.c,d.resolution,d.rotation,this.l.opacity,c.skippedFeatureUids)}return!1};
l.yc=function(a,c,d,e){a=a.slice();Li(c.pixelToCoordinateMatrix,a,a);if(this.ne(a,c))return d.call(e,this.a)};l.jh=function(){Ni(this)};
l.sf=function(a,c,d){function e(a){var c,d=a.bc();d?c=d.call(a,n):(d=f.f)&&(c=d(a,n));if(c){if(c){d=!1;if(ga(c))for(var e=0,g=c.length;e<g;++e)d=El(r,a,c[e],Dl(n,p),this.jh,this)||d;else d=El(r,a,c,Dl(n,p),this.jh,this)||d;a=d}else a=!1;this.o=this.o||a}}var f=this.a;c=f.da();Qi(a.attributions,c.ea());Ri(a,c);var g=a.viewHints[0],h=a.viewHints[1],k=f.s,m=f.A;if(!this.o&&!k&&g||!m&&h)return!0;var h=a.extent,k=a.viewState,g=k.projection,n=k.resolution,p=a.pixelRatio,k=f.g,q=f.a,m=Qk(f);void 0===m&&
(m=Cl);h=Ac(h,q*n);if(!this.o&&this.D==n&&this.H==k&&this.J==m&&Gc(this.B,h))return!0;this.c&&a.postRenderFunctions.push(ho(this.c,d));this.o=!1;var r=new go(.5*n/p,h,f.a);c.Oc(h,n,g);if(m){var t=[];c.ub(h,function(a){t.push(a)},this);t.sort(m);t.forEach(e,this)}else c.ub(h,e,this);io(r,d);this.D=n;this.H=k;this.J=m;this.B=h;this.c=r;return!0};function Eo(a,c){$i.call(this,0,c);this.b=document.createElement("CANVAS");this.b.style.width="100%";this.b.style.height="100%";this.b.className="ol-unselectable";If(a,this.b,0);this.T=this.B=0;this.J=nh();this.o=!0;this.f=th(this.b,{antialias:!0,depth:!1,failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,stencil:!0});this.c=new Qn(this.b,this.f);D(this.b,"webglcontextlost",this.qm,this);D(this.b,"webglcontextrestored",this.rm,this);this.a=new kg;this.A=null;this.l=new ej(function(a){var c=
a[1];a=a[2];var f=c[0]-this.A[0],c=c[1]-this.A[1];return 65536*Math.log(a)+Math.sqrt(f*f+c*c)/a}.bind(this),function(a){return a[0].eb()});this.D=function(){if(!this.l.Oa()){ij(this.l);var a=fj(this.l);Co(this,a[0],a[3],a[4])}return!1}.bind(this);this.j=0;Fo(this)}y(Eo,$i);
function Co(a,c,d,e){var f=a.f,g=c.eb();if(lg(a.a,g))a=a.a.get(g),f.bindTexture(3553,a.pb),9729!=a.Mg&&(f.texParameteri(3553,10240,9729),a.Mg=9729),9729!=a.Ng&&(f.texParameteri(3553,10240,9729),a.Ng=9729);else{var h=f.createTexture();f.bindTexture(3553,h);if(0<e){var k=a.J.canvas,m=a.J;a.B!==d[0]||a.T!==d[1]?(k.width=d[0],k.height=d[1],a.B=d[0],a.T=d[1]):m.clearRect(0,0,d[0],d[1]);m.drawImage(c.cb(),e,e,d[0],d[1],0,0,d[0],d[1]);f.texImage2D(3553,0,6408,6408,5121,k)}else f.texImage2D(3553,0,6408,6408,
5121,c.cb());f.texParameteri(3553,10240,9729);f.texParameteri(3553,10241,9729);f.texParameteri(3553,10242,33071);f.texParameteri(3553,10243,33071);a.a.set(g,{pb:h,Mg:9729,Ng:9729})}}l=Eo.prototype;l.We=function(a){return a instanceof vk?new vo(this,a):a instanceof G?new Bo(this,a):a instanceof H?new Do(this,a):null};
function Go(a,c,d){var e=a.i;if(Ib(e,c)){var f=a.c;a=d.viewState;a=new no(f,a.center,a.resolution,a.rotation,d.size,d.extent);e.b(new Ei(c,e,a,d,null,f));c=Object.keys(a.b).map(Number);c.sort(Ta);var g,h;d=0;for(e=c.length;d<e;++d)for(f=a.b[c[d].toString()],g=0,h=f.length;g<h;++g)f[g](a)}}l.fa=function(){var a=this.f;a.isContextLost()||this.a.forEach(function(c){c&&a.deleteTexture(c.pb)});Db(this.c);Eo.ia.fa.call(this)};
l.mj=function(a,c){for(var d=this.f,e;1024<this.a.rc()-this.j;){if(e=this.a.b.mc)d.deleteTexture(e.pb);else if(+this.a.b.ee==c.index)break;else--this.j;this.a.pop()}};l.W=function(){return"webgl"};l.qm=function(a){a.preventDefault();this.a.clear();this.j=0;a=this.g;for(var c in a)a[c].rf()};l.rm=function(){Fo(this);this.i.render()};function Fo(a){a=a.f;a.activeTexture(33984);a.blendFuncSeparate(770,771,1,771);a.disable(2884);a.disable(2929);a.disable(3089);a.disable(2960)}
l.De=function(a){var c=this.c,d=this.f;if(d.isContextLost())return!1;if(!a)return this.o&&(bg(this.b,!1),this.o=!1),!1;this.A=a.focus;this.a.set((-a.index).toString(),null);++this.j;Go(this,"precompose",a);var e=[],f=a.layerStatesArray;cb(f);var g=a.viewState.resolution,h,k,m,n;h=0;for(k=f.length;h<k;++h)n=f[h],Gi(n,g)&&"ready"==n.H&&(m=cj(this,n.layer),m.sf(a,n,c)&&e.push(n));f=a.size[0]*a.pixelRatio;g=a.size[1]*a.pixelRatio;if(this.b.width!=f||this.b.height!=g)this.b.width=f,this.b.height=g;d.bindFramebuffer(36160,
null);d.clearColor(0,0,0,0);d.clear(16384);d.enable(3042);d.viewport(0,0,this.b.width,this.b.height);h=0;for(k=e.length;h<k;++h)n=e[h],m=cj(this,n.layer),m.ih(a,n,c);this.o||(bg(this.b,!0),this.o=!0);aj(a);1024<this.a.rc()-this.j&&a.postRenderFunctions.push(this.mj.bind(this));this.l.Oa()||(a.postRenderFunctions.push(this.D),a.animate=!0);Go(this,"postcompose",a);dj(this,a);a.postRenderFunctions.push(bj)};
l.qf=function(a,c,d,e,f,g){var h;if(this.f.isContextLost())return!1;var k=c.viewState,m=c.layerStatesArray,n;for(n=m.length-1;0<=n;--n){h=m[n];var p=h.layer;if(Gi(h,k.resolution)&&f.call(g,p)&&(h=cj(this,p).gb(a,c,d,e)))return h}};l.hh=function(a,c,d,e){var f=!1;if(this.f.isContextLost())return!1;var g=c.viewState,h=c.layerStatesArray,k;for(k=h.length-1;0<=k;--k){var m=h[k],n=m.layer;if(Gi(m,g.resolution)&&d.call(e,n)&&(f=cj(this,n).ne(a,c)))return!0}return f};
l.gh=function(a,c,d,e,f){if(this.f.isContextLost())return!1;var g=c.viewState,h,k=c.layerStatesArray,m;for(m=k.length-1;0<=m;--m){h=k[m];var n=h.layer;if(Gi(h,g.resolution)&&f.call(e,n)&&(h=cj(this,n).yc(a,c,d,e)))return h}};var Ho=["canvas","webgl","dom"];
function S(a){Mb.call(this);var c=Io(a);this.nc=void 0!==a.loadTilesWhileAnimating?a.loadTilesWhileAnimating:!1;this.oc=void 0!==a.loadTilesWhileInteracting?a.loadTilesWhileInteracting:!1;this.$c=void 0!==a.pixelRatio?a.pixelRatio:zh;this.Ec=c.logos;this.Da=function(){this.i=void 0;this.lo.call(this,Date.now())}.bind(this);this.qb=nc();this.Ne=nc();this.Fb=0;this.f=null;this.ya=yc();this.D=this.S=null;this.a=document.createElement("DIV");this.a.className="ol-viewport";this.a.style.position="relative";
this.a.style.overflow="hidden";this.a.style.width="100%";this.a.style.height="100%";this.a.style.msTouchAction="none";this.a.style.touchAction="none";Eh&&Qf(this.a,"ol-touch");this.B=document.createElement("DIV");this.B.className="ol-overlaycontainer";this.a.appendChild(this.B);this.A=document.createElement("DIV");this.A.className="ol-overlaycontainer-stopevent";a=["click","dblclick","mousedown","touchstart","mspointerdown",xi,mf?"DOMMouseScroll":"mousewheel"];for(var d=0,e=a.length;d<e;++d)D(this.A,
a[d],Fb);this.a.appendChild(this.A);a=new pi(this);for(var f in Ai)D(a,Ai[f],this.Fg,this);Cb(this,ra(Db,a));this.wa=c.keyboardEventTarget;this.s=null;D(this.a,"wheel",this.Nc,this);D(this.a,"mousewheel",this.Nc,this);this.l=c.controls;this.j=c.interactions;this.o=c.overlays;this.tf={};this.J=new c.no(this.a,this);Cb(this,ra(Db,this.J));this.U=null;this.H=[];this.oa=[];this.na=new jj(this.ek.bind(this),this.Lk.bind(this));this.aa={};D(this,Ob("layergroup"),this.rk,this);D(this,Ob("view"),this.Mk,
this);D(this,Ob("size"),this.Ik,this);D(this,Ob("target"),this.Kk,this);this.C(c.values);this.l.forEach(function(a){a.setMap(this)},this);D(this.l,"add",function(a){a.element.setMap(this)},this);D(this.l,"remove",function(a){a.element.setMap(null)},this);this.j.forEach(function(a){a.setMap(this)},this);D(this.j,"add",function(a){a.element.setMap(this)},this);D(this.j,"remove",function(a){a.element.setMap(null)},this);this.o.forEach(this.cg,this);D(this.o,"add",function(a){this.cg(a.element)},this);
D(this.o,"remove",function(a){var c=a.element.Sa();void 0!==c&&delete this.tf[c.toString()];a.element.setMap(null)},this)}y(S,Mb);l=S.prototype;l.bj=function(a){this.l.push(a)};l.cj=function(a){this.j.push(a)};l.ag=function(a){this.sc().Sc().push(a)};l.bg=function(a){this.o.push(a)};l.cg=function(a){var c=a.Sa();void 0!==c&&(this.tf[c.toString()]=a);a.setMap(this)};l.Ra=function(a){this.render();Array.prototype.push.apply(this.H,arguments)};
l.fa=function(){yb(this.a,"wheel",this.Nc,this);yb(this.a,"mousewheel",this.Nc,this);void 0!==this.c&&(aa.removeEventListener("resize",this.c,!1),this.c=void 0);this.i&&(aa.cancelAnimationFrame(this.i),this.i=void 0);Jf(this.a);S.ia.fa.call(this)};l.od=function(a,c,d,e,f){if(this.f)return a=this.La(a),this.J.qf(a,this.f,c,void 0!==d?d:null,void 0!==e?e:fd,void 0!==f?f:null)};l.vl=function(a,c,d,e,f){if(this.f)return this.J.gh(a,this.f,c,void 0!==d?d:null,void 0!==e?e:fd,void 0!==f?f:null)};
l.Ok=function(a,c,d){if(!this.f)return!1;a=this.La(a);return this.J.hh(a,this.f,void 0!==c?c:fd,void 0!==d?d:null)};l.Bj=function(a){return this.La(this.Td(a))};l.Td=function(a){var c;c=this.a;a=Zf(a);c=Zf(c);c=new wf(a.x-c.x,a.y-c.y);return[c.x,c.y]};l.Ug=function(){return this.get("target")};l.tc=function(){var a=this.Ug();return void 0!==a?Bf(a):null};l.La=function(a){var c=this.f;return c?(a=a.slice(),Li(c.pixelToCoordinateMatrix,a,a)):null};l.zj=function(){return this.l};l.Tj=function(){return this.o};
l.Sj=function(a){a=this.tf[a.toString()];return void 0!==a?a:null};l.Gj=function(){return this.j};l.sc=function(){return this.get("layergroup")};l.Tg=function(){return this.sc().Sc()};l.Ta=function(a){var c=this.f;return c?(a=a.slice(0,2),Li(c.coordinateToPixelMatrix,a,a)):null};l.Va=function(){return this.get("size")};l.$=function(){return this.get("view")};l.gk=function(){return this.a};
l.ek=function(a,c,d,e){var f=this.f;if(!(f&&c in f.wantedTiles&&f.wantedTiles[c][a.ga.toString()]))return Infinity;a=d[0]-f.focus[0];d=d[1]-f.focus[1];return 65536*Math.log(e)+Math.sqrt(a*a+d*d)/e};l.Nc=function(a,c){var d=new ni(c||a.type,this,a);this.Fg(d)};l.Fg=function(a){if(this.f){this.U=a.coordinate;a.frameState=this.f;var c=this.j.a,d;if(!1!==this.b(a))for(d=c.length-1;0<=d;d--){var e=c[d];if(e.f()&&!e.handleEvent(a))break}}};
l.Gk=function(){var a=this.f,c=this.na;if(!c.Oa()){var d=16,e=d;if(a){var f=a.viewHints;f[0]&&(d=this.nc?8:0,e=2);f[1]&&(d=this.oc?8:0,e=2)}c.c<d&&(ij(c),kj(c,d,e))}c=this.oa;d=0;for(e=c.length;d<e;++d)c[d](this,a);c.length=0};l.Ik=function(){this.render()};
l.Kk=function(){var a=this.tc();if(this.s){for(var c=0,d=this.s.length;c<d;++c)sb(this.s[c]);this.s=null}a?(a.appendChild(this.a),a=this.wa?this.wa:a,this.s=[D(a,"keydown",this.Nc,this),D(a,"keypress",this.Nc,this)],this.c||(this.c=this.Xc.bind(this),aa.addEventListener("resize",this.c,!1))):(Jf(this.a),void 0!==this.c&&(aa.removeEventListener("resize",this.c,!1),this.c=void 0));this.Xc()};l.Lk=function(){this.render()};l.Nk=function(){this.render()};
l.Mk=function(){this.S&&(sb(this.S),this.S=null);var a=this.$();a&&(this.S=D(a,"propertychange",this.Nk,this));this.render()};l.sk=function(){this.render()};l.tk=function(){this.render()};l.rk=function(){this.D&&(this.D.forEach(sb),this.D=null);var a=this.sc();a&&(this.D=[D(a,"propertychange",this.tk,this),D(a,"change",this.sk,this)]);this.render()};l.mo=function(){this.i&&aa.cancelAnimationFrame(this.i);this.Da()};l.render=function(){void 0===this.i&&(this.i=aa.requestAnimationFrame(this.Da))};
l.eo=function(a){return this.l.remove(a)};l.fo=function(a){return this.j.remove(a)};l.io=function(a){return this.sc().Sc().remove(a)};l.jo=function(a){return this.o.remove(a)};
l.lo=function(a){var c,d,e,f=this.Va(),g=this.$(),h=null;if(void 0!==f&&0<f[0]&&0<f[1]&&g&&Ae(g)){var h=g.f.slice(),k=this.sc().cf(),m={};c=0;for(d=k.length;c<d;++c)m[x(k[c].layer)]=k[c];e=g.V();h={animate:!1,attributions:{},coordinateToPixelMatrix:this.qb,extent:null,focus:this.U?this.U:e.center,index:this.Fb++,layerStates:m,layerStatesArray:k,logos:mb({},this.Ec),pixelRatio:this.$c,pixelToCoordinateMatrix:this.Ne,postRenderFunctions:[],size:f,skippedFeatureUids:this.aa,tileQueue:this.na,time:a,
usedTiles:{},viewState:e,viewHints:h,wantedTiles:{}}}if(h){a=this.H;c=f=0;for(d=a.length;c<d;++c)g=a[c],g(this,h)&&(a[f++]=g);a.length=f;h.extent=Zc(e.center,e.resolution,e.rotation,h.size)}this.f=h;this.J.De(h);h&&(h.animate&&this.render(),Array.prototype.push.apply(this.oa,h.postRenderFunctions),0!==this.H.length||h.viewHints[0]||h.viewHints[1]||Mc(h.extent,this.ya)||(this.b(new ig("moveend",this,h)),Bc(h.extent,this.ya)));this.b(new ig("postrender",this,h));bh(this.Gk,this)};
l.Sh=function(a){this.set("layergroup",a)};l.Mf=function(a){this.set("size",a)};l.wl=function(a){this.set("target",a)};l.Ao=function(a){this.set("view",a)};l.ai=function(a){a=x(a).toString();this.aa[a]=!0;this.render()};
l.Xc=function(){var a=this.tc();if(a){var c=Af(a),d=kf&&a.currentStyle;d&&Nf(yf(c))&&"auto"!=d.width&&"auto"!=d.height&&!d.boxSizing?(c=cg(a,d.width,"width","pixelWidth"),a=cg(a,d.height,"height","pixelHeight"),a=new xf(c,a)):(d=new xf(a.offsetWidth,a.offsetHeight),c=eg(a,"padding"),a=hg(a),a=new xf(d.width-a.left-c.left-c.right-a.right,d.height-a.top-c.top-c.bottom-a.bottom));this.Mf([a.width,a.height])}else this.Mf(void 0)};l.ci=function(a){a=x(a).toString();delete this.aa[a];this.render()};
function Io(a){var c=null;void 0!==a.keyboardEventTarget&&(c="string"===typeof a.keyboardEventTarget?document.getElementById(a.keyboardEventTarget):a.keyboardEventTarget);var d={},e={};if(void 0===a.logo||"boolean"===typeof a.logo&&a.logo)e["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAHGAAABxgEXwfpGAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAhNQTFRF////AP//AICAgP//AFVVQECA////K1VVSbbbYL/fJ05idsTYJFtbbcjbJllmZszWWMTOIFhoHlNiZszTa9DdUcHNHlNlV8XRIVdiasrUHlZjIVZjaMnVH1RlIFRkH1RkH1ZlasvYasvXVsPQH1VkacnVa8vWIVZjIFRjVMPQa8rXIVVkXsXRsNveIFVkIFZlIVVj3eDeh6GmbMvXH1ZkIFRka8rWbMvXIFVkIFVjIFVkbMvWH1VjbMvWIFVlbcvWIFVla8vVIFVkbMvWbMvVH1VkbMvWIFVlbcvWIFVkbcvVbMvWjNPbIFVkU8LPwMzNIFVkbczWIFVkbsvWbMvXIFVkRnB8bcvW2+TkW8XRIFVkIlZlJVloJlpoKlxrLl9tMmJwOWd0Omh1RXF8TneCT3iDUHiDU8LPVMLPVcLPVcPQVsPPVsPQV8PQWMTQWsTQW8TQXMXSXsXRX4SNX8bSYMfTYcfTYsfTY8jUZcfSZsnUaIqTacrVasrVa8jTa8rWbI2VbMvWbcvWdJObdcvUdszUd8vVeJaee87Yfc3WgJyjhqGnitDYjaarldPZnrK2oNbborW5o9bbo9fbpLa6q9ndrL3ArtndscDDutzfu8fJwN7gwt7gxc/QyuHhy+HizeHi0NfX0+Pj19zb1+Tj2uXk29/e3uLg3+Lh3+bl4uXj4ufl4+fl5Ofl5ufl5ujm5+jmySDnBAAAAFp0Uk5TAAECAgMEBAYHCA0NDg4UGRogIiMmKSssLzU7PkJJT1JTVFliY2hrdHZ3foSFhYeJjY2QkpugqbG1tre5w8zQ09XY3uXn6+zx8vT09vf4+Pj5+fr6/P39/f3+gz7SsAAAAVVJREFUOMtjYKA7EBDnwCPLrObS1BRiLoJLnte6CQy8FLHLCzs2QUG4FjZ5GbcmBDDjxJBXDWxCBrb8aM4zbkIDzpLYnAcE9VXlJSWlZRU13koIeW57mGx5XjoMZEUqwxWYQaQbSzLSkYGfKFSe0QMsX5WbjgY0YS4MBplemI4BdGBW+DQ11eZiymfqQuXZIjqwyadPNoSZ4L+0FVM6e+oGI6g8a9iKNT3o8kVzNkzRg5lgl7p4wyRUL9Yt2jAxVh6mQCogae6GmflI8p0r13VFWTHBQ0rWPW7ahgWVcPm+9cuLoyy4kCJDzCm6d8PSFoh0zvQNC5OjDJhQopPPJqph1doJBUD5tnkbZiUEqaCnB3bTqLTFG1bPn71kw4b+GFdpLElKIzRxxgYgWNYc5SCENVHKeUaltHdXx0dZ8uBI1hJ2UUDgq82CM2MwKeibqAvSO7MCABq0wXEPiqWEAAAAAElFTkSuQmCC"]=
"http://openlayers.org/";else{var f=a.logo;"string"===typeof f?e[f]="":la(f)&&(e[f.src]=f.href)}f=a.layers instanceof lk?a.layers:new lk({layers:a.layers});d.layergroup=f;d.target=a.target;d.view=void 0!==a.view?a.view:new xe;var f=$i,g;void 0!==a.renderer?ga(a.renderer)?g=a.renderer:"string"===typeof a.renderer&&(g=[a.renderer]):g=Ho;var h,k;h=0;for(k=g.length;h<k;++h){var m=g[h];if("canvas"==m){if(Bh){f=zn;break}}else if("dom"==m){f=Hn;break}else if("webgl"==m&&uh){f=Eo;break}}var n;void 0!==a.controls?
n=ga(a.controls)?new Se(a.controls.slice()):a.controls:n=Tg();var p;void 0!==a.interactions?p=ga(a.interactions)?new Se(a.interactions.slice()):a.interactions:p=kk();a=void 0!==a.overlays?ga(a.overlays)?new Se(a.overlays.slice()):a.overlays:new Se;return{controls:n,interactions:p,keyboardEventTarget:c,logos:e,overlays:a,no:f,values:d}}uk();function Jo(a){Mb.call(this);this.o=a.id;this.l=void 0!==a.insertFirst?a.insertFirst:!0;this.s=void 0!==a.stopEvent?a.stopEvent:!0;this.f=document.createElement("DIV");this.f.className="ol-overlay-container";this.f.style.position="absolute";this.autoPan=void 0!==a.autoPan?a.autoPan:!1;this.i=void 0!==a.autoPanAnimation?a.autoPanAnimation:{};this.j=void 0!==a.autoPanMargin?a.autoPanMargin:20;this.a={Od:"",fe:"",Ee:"",Fe:"",visible:!0};this.c=null;D(this,Ob("element"),this.mk,this);D(this,Ob("map"),
this.yk,this);D(this,Ob("offset"),this.Ck,this);D(this,Ob("position"),this.Ek,this);D(this,Ob("positioning"),this.Fk,this);void 0!==a.element&&this.Oh(a.element);this.Uh(void 0!==a.offset?a.offset:[0,0]);this.Xh(void 0!==a.positioning?a.positioning:"top-left");void 0!==a.position&&this.mf(a.position)}y(Jo,Mb);l=Jo.prototype;l.ie=function(){return this.get("element")};l.Sa=function(){return this.o};l.je=function(){return this.get("map")};l.Ag=function(){return this.get("offset")};l.Vg=function(){return this.get("position")};
l.Bg=function(){return this.get("positioning")};l.mk=function(){Hf(this.f);var a=this.ie();a&&this.f.appendChild(a)};l.yk=function(){this.c&&(Jf(this.f),sb(this.c),this.c=null);var a=this.je();a&&(this.c=D(a,"postrender",this.render,this),Ko(this),a=this.s?a.A:a.B,this.l?If(a,this.f,0):a.appendChild(this.f))};l.render=function(){Ko(this)};l.Ck=function(){Ko(this)};
l.Ek=function(){Ko(this);if(void 0!==this.get("position")&&this.autoPan){var a=this.je();if(void 0!==a&&a.tc()){var c=Lo(a.tc(),a.Va()),d=this.ie(),e=d.offsetWidth,f=d.currentStyle||window.getComputedStyle(d),e=e+(parseInt(f.marginLeft,10)+parseInt(f.marginRight,10)),f=d.offsetHeight,g=d.currentStyle||window.getComputedStyle(d),f=f+(parseInt(g.marginTop,10)+parseInt(g.marginBottom,10)),h=Lo(d,[e,f]),d=this.j;Gc(c,h)||(e=h[0]-c[0],f=c[2]-h[2],g=h[1]-c[1],h=c[3]-h[3],c=[0,0],0>e?c[0]=e-d:0>f&&(c[0]=
Math.abs(f)+d),0>g?c[1]=g-d:0>h&&(c[1]=Math.abs(h)+d),0===c[0]&&0===c[1])||(d=a.$().Wa(),e=a.Ta(d),c=[e[0]+c[0],e[1]+c[1]],this.i&&(this.i.source=d,a.Ra(He(this.i))),a.$().mb(a.La(c)))}}};l.Fk=function(){Ko(this)};l.Oh=function(a){this.set("element",a)};l.setMap=function(a){this.set("map",a)};l.Uh=function(a){this.set("offset",a)};l.mf=function(a){this.set("position",a)};
function Lo(a,c){var d=Af(a),e=new wf(0,0),f;f=d?Af(d):document;f=!kf||9<=uf||Nf(yf(f))?f.documentElement:f.body;if(a!=f){f=Yf(a);var g=yf(d).b,d=g.scrollingElement?g.scrollingElement:nf?g.body||g.documentElement:g.documentElement,g=g.parentWindow||g.defaultView,d=kf&&sf("10")&&g.pageYOffset!=d.scrollTop?new wf(d.scrollLeft,d.scrollTop):new wf(g.pageXOffset||d.scrollLeft,g.pageYOffset||d.scrollTop);e.x=f.left+d.x;e.y=f.top+d.y}return[e.x,e.y,e.x+c[0],e.y+c[1]]}
l.Xh=function(a){this.set("positioning",a)};function Mo(a,c){a.a.visible!==c&&(bg(a.f,c),a.a.visible=c)}
function Ko(a){var c=a.je(),d=a.Vg();if(void 0!==c&&c.f&&void 0!==d){var d=c.Ta(d),e=c.Va(),c=a.f.style,f=a.Ag(),g=a.Bg(),h=f[0],f=f[1];if("bottom-right"==g||"center-right"==g||"top-right"==g)""!==a.a.fe&&(a.a.fe=c.left=""),h=Math.round(e[0]-d[0]-h)+"px",a.a.Ee!=h&&(a.a.Ee=c.right=h);else{""!==a.a.Ee&&(a.a.Ee=c.right="");if("bottom-center"==g||"center-center"==g||"top-center"==g)h-=$f(a.f).width/2;h=Math.round(d[0]+h)+"px";a.a.fe!=h&&(a.a.fe=c.left=h)}if("bottom-left"==g||"bottom-center"==g||"bottom-right"==
g)""!==a.a.Fe&&(a.a.Fe=c.top=""),d=Math.round(e[1]-d[1]-f)+"px",a.a.Od!=d&&(a.a.Od=c.bottom=d);else{""!==a.a.Od&&(a.a.Od=c.bottom="");if("center-left"==g||"center-center"==g||"center-right"==g)f-=$f(a.f).height/2;d=Math.round(d[1]+f)+"px";a.a.Fe!=d&&(a.a.Fe=c.top=d)}Mo(a,!0)}else Mo(a,!1)};function No(a){a=a?a:{};this.j=void 0!==a.collapsed?a.collapsed:!0;this.l=void 0!==a.collapsible?a.collapsible:!0;this.l||(this.j=!1);var c=void 0!==a.className?a.className:"ol-overviewmap",d=void 0!==a.tipLabel?a.tipLabel:"Overview map",e=void 0!==a.collapseLabel?a.collapseLabel:"\u00ab";this.A="string"===typeof e?Ef("SPAN",{},e):e;e=void 0!==a.label?a.label:"\u00bb";this.B="string"===typeof e?Ef("SPAN",{},e):e;d=Ef("BUTTON",{type:"button",title:d},this.l&&!this.j?this.A:this.B);D(d,"click",this.Hl,
this);e=document.createElement("DIV");e.className="ol-overviewmap-map";var f=this.f=new S({controls:new Se,interactions:new Se,target:e,view:a.view});a.layers&&a.layers.forEach(function(a){f.ag(a)},this);var g=Ef("DIV","ol-overviewmap-box");this.o=new Jo({position:[0,0],positioning:"bottom-left",element:g});this.f.bg(this.o);c=Ef("DIV",c+" ol-unselectable ol-control"+(this.j&&this.l?" ol-collapsed":"")+(this.l?"":" ol-uncollapsible"),e,d);jg.call(this,{element:c,render:a.render?a.render:Oo,target:a.target})}
y(No,jg);l=No.prototype;l.setMap=function(a){var c=this.a;a!==c&&(c&&(c=c.$())&&yb(c,Ob("rotation"),this.ce,this),No.ia.setMap.call(this,a),a&&(this.s.push(D(a,"propertychange",this.zk,this)),0===this.f.Tg().ac()&&this.f.Sh(a.sc()),a=a.$()))&&(D(a,Ob("rotation"),this.ce,this),Ae(a)&&(this.f.Xc(),Po(this)))};l.zk=function(a){"view"===a.key&&((a=a.oldValue)&&yb(a,Ob("rotation"),this.ce,this),a=this.a.$(),D(a,Ob("rotation"),this.ce,this))};l.ce=function(){this.f.$().ke(this.a.$().Ka())};
function Oo(){var a=this.a,c=this.f;if(a.f&&c.f){var d=a.Va(),a=a.$().bd(d),e=c.Va(),d=c.$().bd(e),f=c.Ta(Sc(a)),c=c.Ta(Qc(a)),c=new xf(Math.abs(f[0]-c[0]),Math.abs(f[1]-c[1])),f=e[0],e=e[1];c.width<.1*f||c.height<.1*e||c.width>.75*f||c.height>.75*e?Po(this):Gc(d,a)||(a=this.f,d=this.a.$(),a.$().mb(d.Wa()))}Qo(this)}function Po(a){var c=a.a;a=a.f;var d=c.Va(),c=c.$().bd(d),d=a.Va();a=a.$();bd(c,1/(.1*Math.pow(2,Math.log(7.5)/Math.LN2/2)));a.Ye(c,d)}
function Qo(a){var c=a.a,d=a.f;if(c.f&&d.f){var e=c.Va(),f=c.$(),g=d.$();d.Va();var c=f.Ka(),h=a.o,d=a.o.ie(),f=f.bd(e),e=g.Z(),g=Pc(f),f=Rc(f),k;if(a=a.a.$().Wa())k=[g[0]-a[0],g[1]-a[1]],gc(k,c),bc(k,a);h.mf(k);d&&(k=new xf(Math.abs((g[0]-f[0])/e),Math.abs((f[1]-g[1])/e)),c=Nf(yf(Af(d))),!kf||sf("10")||c&&sf("8")?(d=d.style,mf?d.MozBoxSizing="border-box":nf?d.WebkitBoxSizing="border-box":d.boxSizing="border-box",d.width=Math.max(k.width,0)+"px",d.height=Math.max(k.height,0)+"px"):(a=d.style,c?(c=
eg(d,"padding"),d=hg(d),a.pixelWidth=k.width-d.left-c.left-c.right-d.right,a.pixelHeight=k.height-d.top-c.top-c.bottom-d.bottom):(a.pixelWidth=k.width,a.pixelHeight=k.height)))}}l.Hl=function(a){a.preventDefault();Ro(this)};function Ro(a){Sf(a.element,"ol-collapsed");a.j?Kf(a.A,a.B):Kf(a.B,a.A);a.j=!a.j;var c=a.f;a.j||c.f||(c.Xc(),Po(a),xb(c,"postrender",function(){Qo(this)},a))}l.Gl=function(){return this.l};l.Jl=function(a){this.l!==a&&(this.l=a,Sf(this.element,"ol-uncollapsible"),!a&&this.j&&Ro(this))};
l.Il=function(a){this.l&&this.j!==a&&Ro(this)};l.Fl=function(){return this.j};l.Uj=function(){return this.f};function So(a){a=a?a:{};var c=void 0!==a.className?a.className:"ol-scale-line";this.l=document.createElement("DIV");this.l.className=c+"-inner";this.f=document.createElement("DIV");this.f.className=c+" ol-unselectable";this.f.appendChild(this.l);this.A=null;this.o=void 0!==a.minWidth?a.minWidth:64;this.j=!1;this.D=void 0;this.B="";jg.call(this,{element:this.f,render:a.render?a.render:To,target:a.target});D(this,Ob("units"),this.U,this);this.H(a.units||"metric")}y(So,jg);var Uo=[1,2,5];
So.prototype.J=function(){return this.get("units")};function To(a){(a=a.frameState)?this.A=a.viewState:this.A=null;Vo(this)}So.prototype.U=function(){Vo(this)};So.prototype.H=function(a){this.set("units",a)};
function Vo(a){var c=a.A;if(c){var d=c.projection,e=d.$b(),c=d.getPointResolution(c.resolution,c.center)*e,e=a.o*c,d="",f=a.J();"degrees"==f?(d=md.degrees,c/=d,e<d/60?(d="\u2033",c*=3600):e<d?(d="\u2032",c*=60):d="\u00b0"):"imperial"==f?.9144>e?(d="in",c/=.0254):1609.344>e?(d="ft",c/=.3048):(d="mi",c/=1609.344):"nautical"==f?(c/=1852,d="nm"):"metric"==f?1>e?(d="mm",c*=1E3):1E3>e?d="m":(d="km",c/=1E3):"us"==f&&(.9144>e?(d="in",c*=39.37):1609.344>e?(d="ft",c/=.30480061):(d="mi",c/=1609.3472));for(var f=
3*Math.floor(Math.log(a.o*c)/Math.log(10)),g;;){g=Uo[(f%3+3)%3]*Math.pow(10,Math.floor(f/3));e=Math.round(g/c);if(isNaN(e)){bg(a.f,!1);a.j=!1;return}if(e>=a.o)break;++f}c=g+" "+d;a.B!=c&&(a.l.innerHTML=c,a.B=c);a.D!=e&&(a.l.style.width=e+"px",a.D=e);a.j||(bg(a.f,!0),a.j=!0)}else a.j&&(bg(a.f,!1),a.j=!1)};function Wo(a){a=a?a:{};this.f=void 0;this.l=Xo;this.D=null;this.U=!1;this.H=void 0!==a.duration?a.duration:200;var c=void 0!==a.className?a.className:"ol-zoomslider",d=Ef("BUTTON",{type:"button","class":c+"-thumb ol-unselectable"}),c=Ef("DIV",[c,"ol-unselectable","ol-control"],d),e=new hi(c);Cb(this,ra(Db,e));D(e,Sh,this.lk,this);D(e,Th,this.Dg,this);D(e,Uh,this.Eg,this);D(c,"click",this.kk,this);D(d,"click",Fb);jg.call(this,{element:c,render:a.render?a.render:Yo})}y(Wo,jg);var Xo=0;l=Wo.prototype;
l.setMap=function(a){Wo.ia.setMap.call(this,a);a&&a.render()};function Yo(a){if(a.frameState){if(!this.U){var c=this.element,d=$f(c),e=Lf(c),c=eg(e,"margin"),f=new xf(e.offsetWidth,e.offsetHeight),e=f.width+c.right+c.left,c=f.height+c.top+c.bottom;this.D=[e,c];e=d.width-e;c=d.height-c;d.width>d.height?(this.l=1,d=new Uf(0,0,e,0)):(this.l=Xo,d=new Uf(0,0,0,c));this.j=d;this.U=!0}a=a.frameState.viewState.resolution;a!==this.f&&(this.f=a,Zo(this,a))}}
l.kk=function(a){var c=this.a,d=c.$(),e=d.Z();c.Ra(Je({resolution:e,duration:this.H,easing:De}));a=$o(this,ap(this,a.offsetX-this.D[0]/2,a.offsetY-this.D[1]/2));d.Vb(d.constrainResolution(a))};
l.lk=function(a){if(!this.o&&a.b.target===this.element.firstElementChild&&(Be(this.a.$(),1),this.B=a.clientX,this.J=a.clientY,this.o=!0,!this.A)){a=this.Dg;var c=this.Eg;this.A=[D(document,"mousemove",a,this),D(document,"touchmove",a,this),D(document,Th,a,this),D(document,"mouseup",c,this),D(document,"touchend",c,this),D(document,Uh,c,this)]}};
l.Dg=function(a){if(this.o){var c=this.element.firstElementChild;this.f=$o(this,ap(this,a.clientX-this.B+parseInt(c.style.left,10),a.clientY-this.J+parseInt(c.style.top,10)));this.a.$().Vb(this.f);Zo(this,this.f);this.B=a.clientX;this.J=a.clientY}};l.Eg=function(){if(this.o){var a=this.a,c=a.$();Be(c,-1);a.Ra(Je({resolution:this.f,duration:this.H,easing:De}));a=c.constrainResolution(this.f);c.Vb(a);this.o=!1;this.J=this.B=void 0;this.A.forEach(sb);this.A=null}};
function Zo(a,c){var d;d=1-ze(a.a.$())(c);var e=Lf(a.element);1==a.l?Wf(e,a.j.left+a.j.width*d):Wf(e,a.j.left,a.j.top+a.j.height*d)}function ap(a,c,d){var e=a.j;return La(1===a.l?(c-e.left)/e.width:(d-e.top)/e.height,0,1)}function $o(a,c){return ye(a.a.$())(1-c)};function bp(a){a=a?a:{};this.f=a.extent?a.extent:null;var c=void 0!==a.className?a.className:"ol-zoom-extent",d=Ef("BUTTON",{type:"button",title:void 0!==a.tipLabel?a.tipLabel:"Fit to extent"},void 0!==a.label?a.label:"E");D(d,"click",this.j,this);c=Ef("DIV",c+" ol-unselectable ol-control",d);jg.call(this,{element:c,target:a.target})}y(bp,jg);bp.prototype.j=function(a){a.preventDefault();var c=this.a;a=c.$();var d=this.f?this.f:a.i.G(),c=c.Va();a.Ye(d,c)};function cp(a){Mb.call(this);a=a?a:{};this.a=null;D(this,Ob("tracking"),this.kl,this);this.kf(void 0!==a.tracking?a.tracking:!1)}y(cp,Mb);l=cp.prototype;l.fa=function(){this.kf(!1);cp.ia.fa.call(this)};
l.tn=function(a){if(null!==a.alpha){var c=Qa(a.alpha);this.set("alpha",c);"boolean"===typeof a.absolute&&a.absolute?this.set("heading",c):ja(a.webkitCompassHeading)&&-1!=a.webkitCompassAccuracy&&this.set("heading",Qa(a.webkitCompassHeading))}null!==a.beta&&this.set("beta",Qa(a.beta));null!==a.gamma&&this.set("gamma",Qa(a.gamma));this.u()};l.uj=function(){return this.get("alpha")};l.xj=function(){return this.get("beta")};l.Dj=function(){return this.get("gamma")};l.jl=function(){return this.get("heading")};
l.Pg=function(){return this.get("tracking")};l.kl=function(){if(Ch){var a=this.Pg();a&&!this.a?this.a=D(aa,"deviceorientation",this.tn,this):a||null===this.a||(sb(this.a),this.a=null)}};l.kf=function(a){this.set("tracking",a)};function dp(){this.defaultDataProjection=null}function ep(a,c,d){var e;d&&(e={dataProjection:d.dataProjection?d.dataProjection:a.Qa(c),featureProjection:d.featureProjection});return fp(a,e)}function fp(a,c){var d;c&&(d={featureProjection:c.featureProjection,dataProjection:c.dataProjection?c.dataProjection:a.defaultDataProjection,rightHanded:c.rightHanded});return d}
function gp(a,c,d){var e=d?qd(d.featureProjection):null;d=d?qd(d.dataProjection):null;return e&&d&&!Hd(e,d)?a instanceof Md?(c?a.clone():a).fb(c?e:d,c?d:e):Ld(c?a.slice():a,c?e:d,c?d:e):a};var hp=aa.JSON.parse,ip=aa.JSON.stringify;function jp(){this.defaultDataProjection=null}y(jp,dp);function kp(a){return la(a)?a:"string"===typeof a?(a=hp(a))?a:null:null}l=jp.prototype;l.W=function(){return"json"};l.Ub=function(a,c){return this.Tc(kp(a),ep(this,a,c))};l.Ea=function(a,c){return this.Af(kp(a),ep(this,a,c))};l.Uc=function(a,c){return this.Ah(kp(a),ep(this,a,c))};l.Qa=function(a){return this.Hh(kp(a))};l.Fd=function(a,c){return ip(this.Yc(a,c))};l.Wb=function(a,c){return ip(this.Ie(a,c))};
l.Zc=function(a,c){return ip(this.Ke(a,c))};function lp(a,c,d,e,f,g){var h=NaN,k=NaN,m=(d-c)/e;if(0!==m)if(1==m)h=a[c],k=a[c+1];else if(2==m)h=(1-f)*a[c]+f*a[c+e],k=(1-f)*a[c+1]+f*a[c+e+1];else{var k=a[c],m=a[c+1],n=0,h=[0],p;for(p=c+e;p<d;p+=e){var q=a[p],r=a[p+1],n=n+Math.sqrt((q-k)*(q-k)+(r-m)*(r-m));h.push(n);k=q;m=r}d=f*n;m=0;n=h.length;for(p=!1;m<n;)f=m+(n-m>>1),k=+Ta(h[f],d),0>k?m=f+1:(n=f,p=!k);f=p?m:~m;0>f?(d=(d-h[-f-2])/(h[-f-1]-h[-f-2]),c+=(-f-2)*e,h=ac(a[c],a[c+e],d),k=ac(a[c+1],a[c+e+1],d)):(h=a[c+f*e],k=a[c+f*e+1])}return g?(g[0]=
h,g[1]=k,g):[h,k]}function mp(a,c,d,e,f,g){if(d==c)return null;if(f<a[c+e-1])return g?(d=a.slice(c,c+e),d[e-1]=f,d):null;if(a[d-1]<f)return g?(d=a.slice(d-e,d),d[e-1]=f,d):null;if(f==a[c+e-1])return a.slice(c,c+e);c/=e;for(d/=e;c<d;)g=c+d>>1,f<a[(g+1)*e-1]?d=g:c=g+1;d=a[c*e-1];if(f==d)return a.slice((c-1)*e,(c-1)*e+e);g=(f-d)/(a[(c+1)*e-1]-d);d=[];var h;for(h=0;h<e-1;++h)d.push(ac(a[(c-1)*e+h],a[c*e+h],g));d.push(f);return d}
function np(a,c,d,e,f,g){var h=0;if(g)return mp(a,h,c[c.length-1],d,e,f);if(e<a[d-1])return f?(a=a.slice(0,d),a[d-1]=e,a):null;if(a[a.length-1]<e)return f?(a=a.slice(a.length-d),a[d-1]=e,a):null;f=0;for(g=c.length;f<g;++f){var k=c[f];if(h!=k){if(e<a[h+d-1])break;if(e<=a[k-1])return mp(a,h,k,d,e,!1);h=k}}return null};function T(a,c){Od.call(this);this.c=null;this.J=this.D=this.o=-1;this.la(a,c)}y(T,Od);l=T.prototype;l.dj=function(a){this.v?Xa(this.v,a):this.v=a.slice();this.u()};l.clone=function(){var a=new T(null);a.ba(this.f,this.v.slice());return a};l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;this.J!=this.g&&(this.D=Math.sqrt(Vd(this.v,0,this.v.length,this.a,0)),this.J=this.g);return Xd(this.v,0,this.v.length,this.a,this.D,!1,a,c,d,e)};
l.rj=function(a,c){return le(this.v,0,this.v.length,this.a,a,c)};l.Ml=function(a,c){return"XYM"!=this.f&&"XYZM"!=this.f?null:mp(this.v,0,this.v.length,this.a,a,void 0!==c?c:!1)};l.Y=function(){return be(this.v,0,this.v.length,this.a)};l.qg=function(a,c){return lp(this.v,0,this.v.length,this.a,a,c)};l.Nl=function(){var a=this.v,c=this.a,d=a[0],e=a[1],f=0,g;for(g=0+c;g<this.v.length;g+=c)var h=a[g],k=a[g+1],f=f+Math.sqrt((h-d)*(h-d)+(k-e)*(k-e)),d=h,e=k;return f};
function Zk(a){a.o!=a.g&&(a.c=a.qg(.5,a.c),a.o=a.g);return a.c}l.Mc=function(a){var c=[];c.length=de(this.v,0,this.v.length,this.a,a,c,0);a=new T(null);a.ba("XY",c);return a};l.W=function(){return"LineString"};l.Ia=function(a){return me(this.v,0,this.v.length,this.a,a)};l.la=function(a,c){a?(Rd(this,c,a,1),this.v||(this.v=[]),this.v.length=$d(this.v,0,a,this.a),this.u()):this.ba("XY",null)};l.ba=function(a,c){Qd(this,a,c);this.u()};function U(a,c){Od.call(this);this.c=[];this.o=this.J=-1;this.la(a,c)}y(U,Od);l=U.prototype;l.ej=function(a){this.v?Xa(this.v,a.ha().slice()):this.v=a.ha().slice();this.c.push(this.v.length);this.u()};l.clone=function(){var a=new U(null);a.ba(this.f,this.v.slice(),this.c.slice());return a};l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;this.o!=this.g&&(this.J=Math.sqrt(Wd(this.v,0,this.c,this.a,0)),this.o=this.g);return Yd(this.v,0,this.c,this.a,this.J,!1,a,c,d,e)};
l.Pl=function(a,c,d){return"XYM"!=this.f&&"XYZM"!=this.f||0===this.v.length?null:np(this.v,this.c,this.a,a,void 0!==c?c:!1,void 0!==d?d:!1)};l.Y=function(){return ce(this.v,0,this.c,this.a)};l.Cb=function(){return this.c};l.Lj=function(a){if(0>a||this.c.length<=a)return null;var c=new T(null);c.ba(this.f,this.v.slice(0===a?0:this.c[a-1],this.c[a]));return c};
l.rd=function(){var a=this.v,c=this.c,d=this.f,e=[],f=0,g,h;g=0;for(h=c.length;g<h;++g){var k=c[g],m=new T(null);m.ba(d,a.slice(f,k));e.push(m);f=k}return e};function $k(a){var c=[],d=a.v,e=0,f=a.c;a=a.a;var g,h;g=0;for(h=f.length;g<h;++g){var k=f[g],e=lp(d,e,k,a,.5);Xa(c,e);e=k}return c}l.Mc=function(a){var c=[],d=[],e=this.v,f=this.c,g=this.a,h=0,k=0,m,n;m=0;for(n=f.length;m<n;++m){var p=f[m],k=de(e,h,p,g,a,c,k);d.push(k);h=p}c.length=k;a=new U(null);a.ba("XY",c,d);return a};l.W=function(){return"MultiLineString"};
l.Ia=function(a){a:{var c=this.v,d=this.c,e=this.a,f=0,g,h;g=0;for(h=d.length;g<h;++g){if(me(c,f,d[g],e,a)){a=!0;break a}f=d[g]}a=!1}return a};l.la=function(a,c){if(a){Rd(this,c,a,2);this.v||(this.v=[]);var d=ae(this.v,0,a,this.a,this.c);this.v.length=0===d.length?0:d[d.length-1];this.u()}else this.ba("XY",null,this.c)};l.ba=function(a,c,d){Qd(this,a,c);this.c=d;this.u()};
function op(a,c){var d=a.f,e=[],f=[],g,h;g=0;for(h=c.length;g<h;++g){var k=c[g];0===g&&(d=k.f);Xa(e,k.ha());f.push(e.length)}a.ba(d,e,f)};function pp(a,c){Od.call(this);this.la(a,c)}y(pp,Od);l=pp.prototype;l.gj=function(a){this.v?Xa(this.v,a.ha()):this.v=a.ha().slice();this.u()};l.clone=function(){var a=new pp(null);a.ba(this.f,this.v.slice());return a};l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;var f=this.v,g=this.a,h,k,m;h=0;for(k=f.length;h<k;h+=g)if(m=Pa(a,c,f[h],f[h+1]),m<e){e=m;for(m=0;m<g;++m)d[m]=f[h+m];d.length=g}return e};l.Y=function(){return be(this.v,0,this.v.length,this.a)};
l.Wj=function(a){var c=this.v?this.v.length/this.a:0;if(0>a||c<=a)return null;c=new E(null);c.ba(this.f,this.v.slice(a*this.a,(a+1)*this.a));return c};l.le=function(){var a=this.v,c=this.f,d=this.a,e=[],f,g;f=0;for(g=a.length;f<g;f+=d){var h=new E(null);h.ba(c,a.slice(f,f+d));e.push(h)}return e};l.W=function(){return"MultiPoint"};l.Ia=function(a){var c=this.v,d=this.a,e,f,g,h;e=0;for(f=c.length;e<f;e+=d)if(g=c[e],h=c[e+1],Fc(a,g,h))return!0;return!1};
l.la=function(a,c){a?(Rd(this,c,a,1),this.v||(this.v=[]),this.v.length=$d(this.v,0,a,this.a),this.u()):this.ba("XY",null)};l.ba=function(a,c){Qd(this,a,c);this.u()};function V(a,c){Od.call(this);this.c=[];this.J=-1;this.D=null;this.U=this.H=this.S=-1;this.o=null;this.la(a,c)}y(V,Od);l=V.prototype;l.hj=function(a){if(this.v){var c=this.v.length;Xa(this.v,a.ha());a=a.Cb().slice();var d,e;d=0;for(e=a.length;d<e;++d)a[d]+=c}else this.v=a.ha().slice(),a=a.Cb().slice(),this.c.push();this.c.push(a);this.u()};l.clone=function(){for(var a=new V(null),c=this.c.length,d=Array(c),e=0;e<c;++e)d[e]=this.c.slice();qp(a,this.f,this.v.slice(),d);return a};
l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;if(this.H!=this.g){var f=this.c,g=0,h=0,k,m;k=0;for(m=f.length;k<m;++k)var n=f[k],h=Wd(this.v,g,n,this.a,h),g=n[n.length-1];this.S=Math.sqrt(h);this.H=this.g}f=al(this);g=this.c;h=this.a;k=this.S;m=0;var n=[NaN,NaN],p,q;p=0;for(q=g.length;p<q;++p){var r=g[p];e=Yd(f,m,r,h,k,!0,a,c,d,e,n);m=r[r.length-1]}return e};
l.xc=function(a,c){var d;a:{d=al(this);var e=this.c,f=0;if(0!==e.length){var g,h;g=0;for(h=e.length;g<h;++g){var k=e[g];if(je(d,f,k,this.a,a,c)){d=!0;break a}f=k[k.length-1]}}d=!1}return d};l.Ql=function(){var a=al(this),c=this.c,d=0,e=0,f,g;f=0;for(g=c.length;f<g;++f)var h=c[f],e=e+Td(a,d,h,this.a),d=h[h.length-1];return e};
l.Y=function(a){var c;void 0!==a?(c=al(this).slice(),re(c,this.c,this.a,a)):c=this.v;a=c;c=this.c;var d=this.a,e=0,f=[],g=0,h,k;h=0;for(k=c.length;h<k;++h){var m=c[h];f[g++]=ce(a,e,m,d,f[g]);e=m[m.length-1]}f.length=g;return f};
function bl(a){if(a.J!=a.g){var c=a.v,d=a.c,e=a.a,f=0,g=[],h,k,m=yc();h=0;for(k=d.length;h<k;++h){var n=d[h],m=Kc(c,f,n[0],e);g.push((m[0]+m[2])/2,(m[1]+m[3])/2);f=n[n.length-1]}c=al(a);d=a.c;e=a.a;f=0;h=[];k=0;for(m=d.length;k<m;++k)n=d[k],h=ke(c,f,n,e,g,2*k,h),f=n[n.length-1];a.D=h;a.J=a.g}return a.D}l.Ij=function(){var a=new pp(null);a.ba("XY",bl(this).slice());return a};
function al(a){if(a.U!=a.g){var c=a.v,d;a:{d=a.c;var e,f;e=0;for(f=d.length;e<f;++e)if(!pe(c,d[e],a.a,void 0)){d=!1;break a}d=!0}d?a.o=c:(a.o=c.slice(),a.o.length=re(a.o,a.c,a.a));a.U=a.g}return a.o}l.Mc=function(a){var c=[],d=[],e=this.v,f=this.c,g=this.a;a=Math.sqrt(a);var h=0,k=0,m,n;m=0;for(n=f.length;m<n;++m){var p=f[m],q=[],k=ee(e,h,p,g,a,c,k,q);d.push(q);h=p[p.length-1]}c.length=k;e=new V(null);qp(e,"XY",c,d);return e};
l.Yj=function(a){if(0>a||this.c.length<=a)return null;var c;0===a?c=0:(c=this.c[a-1],c=c[c.length-1]);a=this.c[a].slice();var d=a[a.length-1];if(0!==c){var e,f;e=0;for(f=a.length;e<f;++e)a[e]-=c}e=new F(null);e.ba(this.f,this.v.slice(c,d),a);return e};l.Xd=function(){var a=this.f,c=this.v,d=this.c,e=[],f=0,g,h,k,m;g=0;for(h=d.length;g<h;++g){var n=d[g].slice(),p=n[n.length-1];if(0!==f)for(k=0,m=n.length;k<m;++k)n[k]-=f;k=new F(null);k.ba(a,c.slice(f,p),n);e.push(k);f=p}return e};l.W=function(){return"MultiPolygon"};
l.Ia=function(a){a:{var c=al(this),d=this.c,e=this.a,f=0,g,h;g=0;for(h=d.length;g<h;++g){var k=d[g];if(ne(c,f,k,e,a)){a=!0;break a}f=k[k.length-1]}a=!1}return a};l.la=function(a,c){if(a){Rd(this,c,a,3);this.v||(this.v=[]);var d=this.v,e=this.a,f=this.c,g=0,f=f?f:[],h=0,k,m;k=0;for(m=a.length;k<m;++k)g=ae(d,g,a[k],e,f[h]),f[h++]=g,g=g[g.length-1];f.length=h;0===f.length?this.v.length=0:(d=f[f.length-1],this.v.length=0===d.length?0:d[d.length-1]);this.u()}else qp(this,"XY",null,this.c)};
function qp(a,c,d,e){Qd(a,c,d);a.c=e;a.u()}function rp(a,c){var d=a.f,e=[],f=[],g,h,k;g=0;for(h=c.length;g<h;++g){var m=c[g];0===g&&(d=m.f);var n=e.length;k=m.Cb();var p,q;p=0;for(q=k.length;p<q;++p)k[p]+=n;Xa(e,m.ha());f.push(k)}qp(a,d,e,f)};function sp(a){a=a?a:{};this.defaultDataProjection=null;this.b=a.geometryName}y(sp,jp);
function tp(a,c){if(!a)return null;var d;if(ja(a.x)&&ja(a.y))d="Point";else if(a.points)d="MultiPoint";else if(a.paths)d=1===a.paths.length?"LineString":"MultiLineString";else if(a.rings){var e=a.rings,f=up(a),g=[];d=[];var h,k;h=0;for(k=e.length;h<k;++h){var m=Wa(e[h]);oe(m,0,m.length,f.length)?g.push([e[h]]):d.push(e[h])}for(;d.length;){e=d.shift();f=!1;for(h=g.length-1;0<=h;h--)if(Gc((new fe(g[h][0])).G(),(new fe(e)).G())){g[h].push(e);f=!0;break}f||g.push([e.reverse()])}a=mb({},a);1===g.length?
(d="Polygon",a.rings=g[0]):(d="MultiPolygon",a.rings=g)}return gp((0,vp[d])(a),!1,c)}function up(a){var c="XY";!0===a.hasZ&&!0===a.hasM?c="XYZM":!0===a.hasZ?c="XYZ":!0===a.hasM&&(c="XYM");return c}function wp(a){a=a.f;return{hasZ:"XYZ"===a||"XYZM"===a,hasM:"XYM"===a||"XYZM"===a}}
var vp={Point:function(a){return void 0!==a.m&&void 0!==a.z?new E([a.x,a.y,a.z,a.m],"XYZM"):void 0!==a.z?new E([a.x,a.y,a.z],"XYZ"):void 0!==a.m?new E([a.x,a.y,a.m],"XYM"):new E([a.x,a.y])},LineString:function(a){return new T(a.paths[0],up(a))},Polygon:function(a){return new F(a.rings,up(a))},MultiPoint:function(a){return new pp(a.points,up(a))},MultiLineString:function(a){return new U(a.paths,up(a))},MultiPolygon:function(a){return new V(a.rings,up(a))}},xp={Point:function(a){var c=a.Y();a=a.f;if("XYZ"===
a)return{x:c[0],y:c[1],z:c[2]};if("XYM"===a)return{x:c[0],y:c[1],m:c[2]};if("XYZM"===a)return{x:c[0],y:c[1],z:c[2],m:c[3]};if("XY"===a)return{x:c[0],y:c[1]}},LineString:function(a){var c=wp(a);return{hasZ:c.hasZ,hasM:c.hasM,paths:[a.Y()]}},Polygon:function(a){var c=wp(a);return{hasZ:c.hasZ,hasM:c.hasM,rings:a.Y(!1)}},MultiPoint:function(a){var c=wp(a);return{hasZ:c.hasZ,hasM:c.hasM,points:a.Y()}},MultiLineString:function(a){var c=wp(a);return{hasZ:c.hasZ,hasM:c.hasM,paths:a.Y()}},MultiPolygon:function(a){var c=
wp(a);a=a.Y(!1);for(var d=[],e=0;e<a.length;e++)for(var f=a[e].length-1;0<=f;f--)d.push(a[e][f]);return{hasZ:c.hasZ,hasM:c.hasM,rings:d}}};l=sp.prototype;l.Tc=function(a,c){var d=tp(a.geometry,c),e=new Xl;this.b&&e.Bc(this.b);e.Pa(d);c&&c.ff&&a.attributes[c.ff]&&e.jc(a.attributes[c.ff]);a.attributes&&e.C(a.attributes);return e};
l.Af=function(a,c){var d=c?c:{};if(a.features){var e=[],f=a.features,g,h;d.ff=a.objectIdFieldName;g=0;for(h=f.length;g<h;++g)e.push(this.Tc(f[g],d));return e}return[this.Tc(a,d)]};l.Ah=function(a,c){return tp(a,c)};l.Hh=function(a){return a.spatialReference&&a.spatialReference.wkid?qd("EPSG:"+a.spatialReference.wkid):null};function yp(a,c){return(0,xp[a.W()])(gp(a,!0,c),c)}l.Ke=function(a,c){return yp(a,fp(this,c))};
l.Yc=function(a,c){c=fp(this,c);var d={},e=a.X();e&&(d.geometry=yp(e,c));e=a.P();delete e[a.a];d.attributes=pb(e)?{}:e;c&&c.featureProjection&&(d.spatialReference={wkid:qd(c.featureProjection).lb.split(":").pop()});return d};l.Ie=function(a,c){c=fp(this,c);var d=[],e,f;e=0;for(f=a.length;e<f;++e)d.push(this.Yc(a[e],c));return{features:d}};function zp(a){Md.call(this);this.i=a?a:null;Ap(this)}y(zp,Md);function Bp(a){var c=[],d,e;d=0;for(e=a.length;d<e;++d)c.push(a[d].clone());return c}function Cp(a){var c,d;if(a.i)for(c=0,d=a.i.length;c<d;++c)yb(a.i[c],"change",a.u,a)}function Ap(a){var c,d;if(a.i)for(c=0,d=a.i.length;c<d;++c)D(a.i[c],"change",a.u,a)}l=zp.prototype;l.clone=function(){var a=new zp(null);a.Qh(this.i);return a};
l.sb=function(a,c,d,e){if(e<Cc(this.G(),a,c))return e;var f=this.i,g,h;g=0;for(h=f.length;g<h;++g)e=f[g].sb(a,c,d,e);return e};l.xc=function(a,c){var d=this.i,e,f;e=0;for(f=d.length;e<f;++e)if(d[e].xc(a,c))return!0;return!1};l.Pd=function(a){Ic(Infinity,Infinity,-Infinity,-Infinity,a);for(var c=this.i,d=0,e=c.length;d<e;++d)Nc(a,c[d].G());return a};l.vg=function(){return Bp(this.i)};
l.sd=function(a){this.s!=this.g&&(nb(this.j),this.l=0,this.s=this.g);if(0>a||0!==this.l&&a<this.l)return this;var c=a.toString();if(this.j.hasOwnProperty(c))return this.j[c];var d=[],e=this.i,f=!1,g,h;g=0;for(h=e.length;g<h;++g){var k=e[g],m=k.sd(a);d.push(m);m!==k&&(f=!0)}if(f)return a=new zp(null),Cp(a),a.i=d,Ap(a),a.u(),this.j[c]=a;this.l=a;return this};l.W=function(){return"GeometryCollection"};l.Ia=function(a){var c=this.i,d,e;d=0;for(e=c.length;d<e;++d)if(c[d].Ia(a))return!0;return!1};
l.Oa=function(){return 0===this.i.length};l.Qh=function(a){a=Bp(a);Cp(this);this.i=a;Ap(this);this.u()};l.Hc=function(a){var c=this.i,d,e;d=0;for(e=c.length;d<e;++d)c[d].Hc(a);this.u()};l.Rc=function(a,c){var d=this.i,e,f;e=0;for(f=d.length;e<f;++e)d[e].Rc(a,c);this.u()};l.fa=function(){Cp(this);zp.ia.fa.call(this)};function Dp(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=qd(a.defaultDataProjection?a.defaultDataProjection:"EPSG:4326");this.b=a.geometryName}y(Dp,jp);function Ep(a,c){return a?gp((0,Fp[a.type])(a),!1,c):null}function Gp(a,c){return(0,Hp[a.W()])(gp(a,!0,c),c)}
var Fp={Point:function(a){return new E(a.coordinates)},LineString:function(a){return new T(a.coordinates)},Polygon:function(a){return new F(a.coordinates)},MultiPoint:function(a){return new pp(a.coordinates)},MultiLineString:function(a){return new U(a.coordinates)},MultiPolygon:function(a){return new V(a.coordinates)},GeometryCollection:function(a,c){var d=a.geometries.map(function(a){return Ep(a,c)});return new zp(d)}},Hp={Point:function(a){return{type:"Point",coordinates:a.Y()}},LineString:function(a){return{type:"LineString",
coordinates:a.Y()}},Polygon:function(a,c){var d;c&&(d=c.rightHanded);return{type:"Polygon",coordinates:a.Y(d)}},MultiPoint:function(a){return{type:"MultiPoint",coordinates:a.Y()}},MultiLineString:function(a){return{type:"MultiLineString",coordinates:a.Y()}},MultiPolygon:function(a,c){var d;c&&(d=c.rightHanded);return{type:"MultiPolygon",coordinates:a.Y(d)}},GeometryCollection:function(a,c){return{type:"GeometryCollection",geometries:a.i.map(function(a){return Gp(a,c)})}},Circle:function(){return{type:"GeometryCollection",
geometries:[]}}};l=Dp.prototype;l.Tc=function(a,c){var d=Ep(a.geometry,c),e=new Xl;this.b&&e.Bc(this.b);e.Pa(d);void 0!==a.id&&e.jc(a.id);a.properties&&e.C(a.properties);return e};l.Af=function(a,c){if("Feature"==a.type)return[this.Tc(a,c)];if("FeatureCollection"==a.type){var d=[],e=a.features,f,g;f=0;for(g=e.length;f<g;++f)d.push(this.Tc(e[f],c));return d}return[]};l.Ah=function(a,c){return Ep(a,c)};
l.Hh=function(a){return(a=a.crs)?"name"==a.type?qd(a.properties.name):"EPSG"==a.type?qd("EPSG:"+a.properties.code):null:this.defaultDataProjection};l.Yc=function(a,c){c=fp(this,c);var d={type:"Feature"},e=a.Sa();void 0!==e&&(d.id=e);(e=a.X())?d.geometry=Gp(e,c):d.geometry=null;e=a.P();delete e[a.a];pb(e)?d.properties=null:d.properties=e;return d};l.Ie=function(a,c){c=fp(this,c);var d=[],e,f;e=0;for(f=a.length;e<f;++e)d.push(this.Yc(a[e],c));return{type:"FeatureCollection",features:d}};
l.Ke=function(a,c){return Gp(a,fp(this,c))};function Ip(){this.defaultDataProjection=null}y(Ip,dp);l=Ip.prototype;l.W=function(){return"xml"};l.Ub=function(a,c){if(pm(a))return Jp(this,a,c);if(sm(a))return this.yh(a,c);if("string"===typeof a){var d=Cm(a);return Jp(this,d,c)}return null};function Jp(a,c,d){a=Kp(a,c,d);return 0<a.length?a[0]:null}l.Ea=function(a,c){if(pm(a))return Kp(this,a,c);if(sm(a))return this.ic(a,c);if("string"===typeof a){var d=Cm(a);return Kp(this,d,c)}return[]};
function Kp(a,c,d){var e=[];for(c=c.firstChild;c;c=c.nextSibling)1==c.nodeType&&Xa(e,a.ic(c,d));return e}l.Uc=function(a,c){if(pm(a))return this.s(a,c);if(sm(a)){var d=this.ze(a,[ep(this,a,c?c:{})]);return d?d:null}return"string"===typeof a?(d=Cm(a),this.s(d,c)):null};l.Qa=function(a){return pm(a)?this.Gf(a):sm(a)?this.Ce(a):"string"===typeof a?(a=Cm(a),this.Gf(a)):null};l.Gf=function(){return this.defaultDataProjection};l.Ce=function(){return this.defaultDataProjection};
l.Fd=function(a,c){var d=this.T(a,c);return bm(d)};l.Wb=function(a,c){var d=this.a(a,c);return bm(d)};l.Zc=function(a,c){var d=this.o(a,c);return bm(d)};function Lp(a){a=a?a:{};this.featureType=a.featureType;this.featureNS=a.featureNS;this.srsName=a.srsName;this.schemaLocation="";this.b={};this.b["http://www.opengis.net/gml"]={featureMember:Fm(Lp.prototype.yd),featureMembers:Fm(Lp.prototype.yd)};this.defaultDataProjection=null}y(Lp,Ip);var Mp=/^[\s\xa0]*$/;l=Lp.prototype;
l.yd=function(a,c){var d=mm(a),e;if("FeatureCollection"==d)"http://www.opengis.net/wfs"===a.namespaceURI?e=R([],this.b,a,c,this):e=R(null,this.b,a,c,this);else if("featureMembers"==d||"featureMember"==d){var f=c[0],g=f.featureType;e=f.featureNS;var h,k;if(!g&&a.childNodes){g=[];e={};h=0;for(k=a.childNodes.length;h<k;++h){var m=a.childNodes[h];if(1===m.nodeType){var n=m.nodeName.split(":").pop();if(-1===g.indexOf(n)){var p="",q=0,m=m.namespaceURI,r;for(r in e){if(e[r]===m){p=r;break}++q}p||(p="p"+
q,e[p]=m);g.push(p+":"+n)}}}f.featureType=g;f.featureNS=e}"string"===typeof e&&(h=e,e={},e.p0=h);r={};var g=ga(g)?g:[g],t;for(t in e){f={};h=0;for(k=g.length;h<k;++h)(-1===g[h].indexOf(":")?"p0":g[h].split(":")[0])===t&&(f[g[h].split(":").pop()]="featureMembers"==d?Em(this.zf,this):Fm(this.zf,this));r[e[t]]=f}e=R([],r,a,c)}e||(e=[]);return e};l.ze=function(a,c){var d=c[0];d.srsName=a.firstElementChild.getAttribute("srsName");var e=R(null,this.Sf,a,c,this);if(e)return gp(e,!1,d)};
l.zf=function(a,c){var d,e=a.getAttribute("fid")||wm(a,"http://www.opengis.net/gml","id"),f={},g;for(d=a.firstElementChild;d;d=d.nextElementSibling){var h=mm(d);if(0===d.childNodes.length||1===d.childNodes.length&&(3===d.firstChild.nodeType||4===d.firstChild.nodeType)){var k=im(d,!1);Mp.test(k)&&(k=void 0);f[h]=k}else"boundedBy"!==h&&(g=h),f[h]=this.ze(d,c)}d=new Xl(f);g&&d.Bc(g);e&&d.jc(e);return d};l.Gh=function(a,c){var d=this.ye(a,c);if(d){var e=new E(null);e.ba("XYZ",d);return e}};
l.Eh=function(a,c){var d=R([],this.Bi,a,c,this);if(d)return new pp(d)};l.Dh=function(a,c){var d=R([],this.Ai,a,c,this);if(d){var e=new U(null);op(e,d);return e}};l.Fh=function(a,c){var d=R([],this.Ci,a,c,this);if(d){var e=new V(null);rp(e,d);return e}};l.vh=function(a,c){Mm(this.Fi,a,c,this)};l.Kg=function(a,c){Mm(this.yi,a,c,this)};l.wh=function(a,c){Mm(this.Gi,a,c,this)};l.Ae=function(a,c){var d=this.ye(a,c);if(d){var e=new T(null);e.ba("XYZ",d);return e}};
l.Pn=function(a,c){var d=R(null,this.Hd,a,c,this);if(d)return d};l.Ch=function(a,c){var d=this.ye(a,c);if(d){var e=new fe(null);ge(e,"XYZ",d);return e}};l.Be=function(a,c){var d=R([null],this.Me,a,c,this);if(d&&d[0]){var e=new F(null),f=d[0],g=[f.length],h,k;h=1;for(k=d.length;h<k;++h)Xa(f,d[h]),g.push(f.length);e.ba("XYZ",f,g);return e}};l.ye=function(a,c){return R(null,this.Hd,a,c,this)};l.Bi=Object({"http://www.opengis.net/gml":{pointMember:Em(Lp.prototype.vh),pointMembers:Em(Lp.prototype.vh)}});
l.Ai=Object({"http://www.opengis.net/gml":{lineStringMember:Em(Lp.prototype.Kg),lineStringMembers:Em(Lp.prototype.Kg)}});l.Ci=Object({"http://www.opengis.net/gml":{polygonMember:Em(Lp.prototype.wh),polygonMembers:Em(Lp.prototype.wh)}});l.Fi=Object({"http://www.opengis.net/gml":{Point:Em(Lp.prototype.ye)}});l.yi=Object({"http://www.opengis.net/gml":{LineString:Em(Lp.prototype.Ae)}});l.Gi=Object({"http://www.opengis.net/gml":{Polygon:Em(Lp.prototype.Be)}});l.Id=Object({"http://www.opengis.net/gml":{LinearRing:Fm(Lp.prototype.Pn)}});
l.ic=function(a,c){var d={featureType:this.featureType,featureNS:this.featureNS};c&&mb(d,ep(this,a,c));return this.yd(a,[d])};l.Ce=function(a){return qd(this.A?this.A:a.firstElementChild.getAttribute("srsName"))};function Np(a){a=im(a,!1);return Op(a)}function Op(a){if(a=/^\s*(true|1)|(false|0)\s*$/.exec(a))return void 0!==a[1]||!1}
function Pp(a){a=im(a,!1);if(a=/^\s*(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|(?:([+\-])(\d{2})(?::(\d{2}))?))\s*$/.exec(a)){var c=Date.UTC(parseInt(a[1],10),parseInt(a[2],10)-1,parseInt(a[3],10),parseInt(a[4],10),parseInt(a[5],10),parseInt(a[6],10))/1E3;if("Z"!=a[7]){var d="-"==a[8]?-1:1,c=c+60*d*parseInt(a[9],10);void 0!==a[10]&&(c+=3600*d*parseInt(a[10],10))}return c}}function Qp(a){a=im(a,!1);return Rp(a)}
function Rp(a){if(a=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(a))return parseFloat(a[1])}function Sp(a){a=im(a,!1);return Tp(a)}function Tp(a){if(a=/^\s*(\d+)\s*$/.exec(a))return parseInt(a[1],10)}function W(a){return im(a,!1).trim()}function Up(a,c){Vp(a,c?"1":"0")}function Wp(a,c){a.appendChild(em.createTextNode(c.toPrecision()))}function Xp(a,c){a.appendChild(em.createTextNode(c.toString()))}function Vp(a,c){a.appendChild(em.createTextNode(c))};function Yp(a){a=a?a:{};Lp.call(this,a);this.b["http://www.opengis.net/gml"].featureMember=Em(Lp.prototype.yd);this.schemaLocation=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/gml http://schemas.opengis.net/gml/2.1.2/feature.xsd"}y(Yp,Lp);l=Yp.prototype;
l.zh=function(a,c){var d=im(a,!1).replace(/^\s*|\s*$/g,""),e=c[0].srsName,f=a.parentNode.getAttribute("srsDimension"),g="enu";e&&(e=qd(e))&&(g=e.f);d=d.split(/[\s,]+/);e=2;a.getAttribute("srsDimension")?e=Tp(a.getAttribute("srsDimension")):a.getAttribute("dimension")?e=Tp(a.getAttribute("dimension")):f&&(e=Tp(f));for(var h,k,m=[],n=0,p=d.length;n<p;n+=e)f=parseFloat(d[n]),h=parseFloat(d[n+1]),k=3===e?parseFloat(d[n+2]):0,"en"===g.substr(0,2)?m.push(f,h,k):m.push(h,f,k);return m};
l.Mn=function(a,c){var d=R([null],this.ui,a,c,this);return Ic(d[1][0],d[1][1],d[1][3],d[1][4])};l.Qk=function(a,c){var d=R(void 0,this.Id,a,c,this);d&&c[c.length-1].push(d)};l.vn=function(a,c){var d=R(void 0,this.Id,a,c,this);d&&(c[c.length-1][0]=d)};l.Hd=Object({"http://www.opengis.net/gml":{coordinates:Fm(Yp.prototype.zh)}});l.Me=Object({"http://www.opengis.net/gml":{innerBoundaryIs:Yp.prototype.Qk,outerBoundaryIs:Yp.prototype.vn}});l.ui=Object({"http://www.opengis.net/gml":{coordinates:Em(Yp.prototype.zh)}});
l.Sf=Object({"http://www.opengis.net/gml":{Point:Fm(Lp.prototype.Gh),MultiPoint:Fm(Lp.prototype.Eh),LineString:Fm(Lp.prototype.Ae),MultiLineString:Fm(Lp.prototype.Dh),LinearRing:Fm(Lp.prototype.Ch),Polygon:Fm(Lp.prototype.Be),MultiPolygon:Fm(Lp.prototype.Fh),Box:Fm(Yp.prototype.Mn)}});function Zp(a){a=a?a:{};Lp.call(this,a);this.l=void 0!==a.surface?a.surface:!1;this.c=void 0!==a.curve?a.curve:!1;this.i=void 0!==a.multiCurve?a.multiCurve:!0;this.j=void 0!==a.multiSurface?a.multiSurface:!0;this.schemaLocation=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/gml http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd"}y(Zp,Lp);l=Zp.prototype;l.Tn=function(a,c){var d=R([],this.zi,a,c,this);if(d){var e=new U(null);op(e,d);return e}};
l.Un=function(a,c){var d=R([],this.Di,a,c,this);if(d){var e=new V(null);rp(e,d);return e}};l.lg=function(a,c){Mm(this.vi,a,c,this)};l.bi=function(a,c){Mm(this.Ki,a,c,this)};l.Xn=function(a,c){return R([null],this.Ei,a,c,this)};l.Zn=function(a,c){return R([null],this.Ji,a,c,this)};l.Yn=function(a,c){return R([null],this.Me,a,c,this)};l.Sn=function(a,c){return R([null],this.Hd,a,c,this)};l.Sk=function(a,c){var d=R(void 0,this.Id,a,c,this);d&&c[c.length-1].push(d)};
l.nj=function(a,c){var d=R(void 0,this.Id,a,c,this);d&&(c[c.length-1][0]=d)};l.Ih=function(a,c){var d=R([null],this.Li,a,c,this);if(d&&d[0]){var e=new F(null),f=d[0],g=[f.length],h,k;h=1;for(k=d.length;h<k;++h)Xa(f,d[h]),g.push(f.length);e.ba("XYZ",f,g);return e}};l.xh=function(a,c){var d=R([null],this.wi,a,c,this);if(d){var e=new T(null);e.ba("XYZ",d);return e}};l.On=function(a,c){var d=R([null],this.xi,a,c,this);return Ic(d[1][0],d[1][1],d[2][0],d[2][1])};
l.Qn=function(a,c){for(var d=im(a,!1),e=/^\s*([+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?)\s*/,f=[],g;g=e.exec(d);)f.push(parseFloat(g[1])),d=d.substr(g[0].length);if(""===d){d=c[0].srsName;e="enu";d&&(e=td(qd(d)));if("neu"===e)for(d=0,e=f.length;d<e;d+=3)g=f[d],f[d]=f[d+1],f[d+1]=g;d=f.length;2==d&&f.push(0);return 0===d?void 0:f}};
l.Df=function(a,c){var d=im(a,!1).replace(/^\s*|\s*$/g,""),e=c[0].srsName,f=a.parentNode.getAttribute("srsDimension"),g="enu";e&&(g=td(qd(e)));d=d.split(/\s+/);e=2;a.getAttribute("srsDimension")?e=Tp(a.getAttribute("srsDimension")):a.getAttribute("dimension")?e=Tp(a.getAttribute("dimension")):f&&(e=Tp(f));for(var h,k,m=[],n=0,p=d.length;n<p;n+=e)f=parseFloat(d[n]),h=parseFloat(d[n+1]),k=3===e?parseFloat(d[n+2]):0,"en"===g.substr(0,2)?m.push(f,h,k):m.push(h,f,k);return m};
l.Hd=Object({"http://www.opengis.net/gml":{pos:Fm(Zp.prototype.Qn),posList:Fm(Zp.prototype.Df)}});l.Me=Object({"http://www.opengis.net/gml":{interior:Zp.prototype.Sk,exterior:Zp.prototype.nj}});
l.Sf=Object({"http://www.opengis.net/gml":{Point:Fm(Lp.prototype.Gh),MultiPoint:Fm(Lp.prototype.Eh),LineString:Fm(Lp.prototype.Ae),MultiLineString:Fm(Lp.prototype.Dh),LinearRing:Fm(Lp.prototype.Ch),Polygon:Fm(Lp.prototype.Be),MultiPolygon:Fm(Lp.prototype.Fh),Surface:Fm(Zp.prototype.Ih),MultiSurface:Fm(Zp.prototype.Un),Curve:Fm(Zp.prototype.xh),MultiCurve:Fm(Zp.prototype.Tn),Envelope:Fm(Zp.prototype.On)}});l.zi=Object({"http://www.opengis.net/gml":{curveMember:Em(Zp.prototype.lg),curveMembers:Em(Zp.prototype.lg)}});
l.Di=Object({"http://www.opengis.net/gml":{surfaceMember:Em(Zp.prototype.bi),surfaceMembers:Em(Zp.prototype.bi)}});l.vi=Object({"http://www.opengis.net/gml":{LineString:Em(Lp.prototype.Ae),Curve:Em(Zp.prototype.xh)}});l.Ki=Object({"http://www.opengis.net/gml":{Polygon:Em(Lp.prototype.Be),Surface:Em(Zp.prototype.Ih)}});l.Li=Object({"http://www.opengis.net/gml":{patches:Fm(Zp.prototype.Xn)}});l.wi=Object({"http://www.opengis.net/gml":{segments:Fm(Zp.prototype.Zn)}});
l.xi=Object({"http://www.opengis.net/gml":{lowerCorner:Em(Zp.prototype.Df),upperCorner:Em(Zp.prototype.Df)}});l.Ei=Object({"http://www.opengis.net/gml":{PolygonPatch:Fm(Zp.prototype.Yn)}});l.Ji=Object({"http://www.opengis.net/gml":{LineStringSegment:Fm(Zp.prototype.Sn)}});function $p(a,c,d){d=d[d.length-1].srsName;c=c.Y();for(var e=c.length,f=Array(e),g,h=0;h<e;++h){g=c[h];var k=h,m="enu";d&&(m=td(qd(d)));f[k]="en"===m.substr(0,2)?g[0]+" "+g[1]:g[1]+" "+g[0]}Vp(a,f.join(" "))}
l.pi=function(a,c,d){var e=d[d.length-1].srsName;e&&a.setAttribute("srsName",e);e=hm(a.namespaceURI,"pos");a.appendChild(e);d=d[d.length-1].srsName;a="enu";d&&(a=td(qd(d)));c=c.Y();Vp(e,"en"===a.substr(0,2)?c[0]+" "+c[1]:c[1]+" "+c[0])};var aq={"http://www.opengis.net/gml":{lowerCorner:N(Vp),upperCorner:N(Vp)}};l=Zp.prototype;l.Mo=function(a,c,d){var e=d[d.length-1].srsName;e&&a.setAttribute("srsName",e);Nm({node:a},aq,Km,[c[0]+" "+c[1],c[2]+" "+c[3]],d,["lowerCorner","upperCorner"],this)};
l.mi=function(a,c,d){var e=d[d.length-1].srsName;e&&a.setAttribute("srsName",e);e=hm(a.namespaceURI,"posList");a.appendChild(e);$p(e,c,d)};l.Ii=function(a,c){var d=c[c.length-1],e=d.node,f=d.exteriorWritten;void 0===f&&(d.exteriorWritten=!0);return hm(e.namespaceURI,void 0!==f?"interior":"exterior")};
l.Le=function(a,c,d){var e=d[d.length-1].srsName;"PolygonPatch"!==a.nodeName&&e&&a.setAttribute("srsName",e);"Polygon"===a.nodeName||"PolygonPatch"===a.nodeName?(c=c.Vd(),Nm({node:a,srsName:e},bq,this.Ii,c,d,void 0,this)):"Surface"===a.nodeName&&(e=hm(a.namespaceURI,"patches"),a.appendChild(e),a=hm(e.namespaceURI,"PolygonPatch"),e.appendChild(a),this.Le(a,c,d))};
l.Ge=function(a,c,d){var e=d[d.length-1].srsName;"LineStringSegment"!==a.nodeName&&e&&a.setAttribute("srsName",e);"LineString"===a.nodeName||"LineStringSegment"===a.nodeName?(e=hm(a.namespaceURI,"posList"),a.appendChild(e),$p(e,c,d)):"Curve"===a.nodeName&&(e=hm(a.namespaceURI,"segments"),a.appendChild(e),a=hm(e.namespaceURI,"LineStringSegment"),e.appendChild(a),this.Ge(a,c,d))};
l.oi=function(a,c,d){var e=d[d.length-1],f=e.srsName,e=e.surface;f&&a.setAttribute("srsName",f);c=c.Xd();Nm({node:a,srsName:f,surface:e},cq,this.f,c,d,void 0,this)};l.No=function(a,c,d){var e=d[d.length-1].srsName;e&&a.setAttribute("srsName",e);c=c.le();Nm({node:a,srsName:e},dq,Im("pointMember"),c,d,void 0,this)};l.ni=function(a,c,d){var e=d[d.length-1],f=e.srsName,e=e.curve;f&&a.setAttribute("srsName",f);c=c.rd();Nm({node:a,srsName:f,curve:e},eq,this.f,c,d,void 0,this)};
l.ri=function(a,c,d){var e=hm(a.namespaceURI,"LinearRing");a.appendChild(e);this.mi(e,c,d)};l.si=function(a,c,d){var e=this.g(c,d);e&&(a.appendChild(e),this.Le(e,c,d))};l.Oo=function(a,c,d){var e=hm(a.namespaceURI,"Point");a.appendChild(e);this.pi(e,c,d)};l.li=function(a,c,d){var e=this.g(c,d);e&&(a.appendChild(e),this.Ge(e,c,d))};
l.Je=function(a,c,d){var e=d[d.length-1],f=mb({},e);f.node=a;var g;ga(c)?e.dataProjection?g=Ld(c,e.featureProjection,e.dataProjection):g=c:g=gp(c,!0,e);Nm(f,fq,this.g,[g],d,void 0,this)};
l.hi=function(a,c,d){var e=c.Sa();e&&a.setAttribute("fid",e);var e=d[d.length-1],f=e.featureNS,g=c.a;e.Ac||(e.Ac={},e.Ac[f]={});var h=c.P();c=[];var k=[],m;for(m in h){var n=h[m];null!==n&&(c.push(m),k.push(n),m==g||n instanceof Md?m in e.Ac[f]||(e.Ac[f][m]=N(this.Je,this)):m in e.Ac[f]||(e.Ac[f][m]=N(Vp)))}m=mb({},e);m.node=a;Nm(m,e.Ac,Im(void 0,f),k,d,c)};
var cq={"http://www.opengis.net/gml":{surfaceMember:N(Zp.prototype.si),polygonMember:N(Zp.prototype.si)}},dq={"http://www.opengis.net/gml":{pointMember:N(Zp.prototype.Oo)}},eq={"http://www.opengis.net/gml":{lineStringMember:N(Zp.prototype.li),curveMember:N(Zp.prototype.li)}},bq={"http://www.opengis.net/gml":{exterior:N(Zp.prototype.ri),interior:N(Zp.prototype.ri)}},fq={"http://www.opengis.net/gml":{Curve:N(Zp.prototype.Ge),MultiCurve:N(Zp.prototype.ni),Point:N(Zp.prototype.pi),MultiPoint:N(Zp.prototype.No),
LineString:N(Zp.prototype.Ge),MultiLineString:N(Zp.prototype.ni),LinearRing:N(Zp.prototype.mi),Polygon:N(Zp.prototype.Le),MultiPolygon:N(Zp.prototype.oi),Surface:N(Zp.prototype.Le),MultiSurface:N(Zp.prototype.oi),Envelope:N(Zp.prototype.Mo)}},gq={MultiLineString:"lineStringMember",MultiCurve:"curveMember",MultiPolygon:"polygonMember",MultiSurface:"surfaceMember"};Zp.prototype.f=function(a,c){return hm("http://www.opengis.net/gml",gq[c[c.length-1].node.nodeName])};
Zp.prototype.g=function(a,c){var d=c[c.length-1],e=d.multiSurface,f=d.surface,g=d.curve,d=d.multiCurve,h;ga(a)?h="Envelope":(h=a.W(),"MultiPolygon"===h&&!0===e?h="MultiSurface":"Polygon"===h&&!0===f?h="Surface":"LineString"===h&&!0===g?h="Curve":"MultiLineString"===h&&!0===d&&(h="MultiCurve"));return hm("http://www.opengis.net/gml",h)};
Zp.prototype.o=function(a,c){c=fp(this,c);var d=hm("http://www.opengis.net/gml","geom"),e={node:d,srsName:this.srsName,curve:this.c,surface:this.l,multiSurface:this.j,multiCurve:this.i};c&&mb(e,c);this.Je(d,a,[e]);return d};
Zp.prototype.a=function(a,c){c=fp(this,c);var d=hm("http://www.opengis.net/gml","featureMembers");Bm(d,"http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.schemaLocation);var e={srsName:this.srsName,curve:this.c,surface:this.l,multiSurface:this.j,multiCurve:this.i,featureNS:this.featureNS,featureType:this.featureType};c&&mb(e,c);var e=[e],f=e[e.length-1],g=f.featureType,h=f.featureNS,k={};k[h]={};k[h][g]=N(this.hi,this);f=mb({},f);f.node=d;Nm(f,k,Im(g,h),a,e);return d};function hq(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=qd("EPSG:4326");this.b=a.readExtensions}y(hq,Ip);var iq=[null,"http://www.topografix.com/GPX/1/0","http://www.topografix.com/GPX/1/1"];function jq(a,c,d){a.push(parseFloat(c.getAttribute("lon")),parseFloat(c.getAttribute("lat")));"ele"in d?(a.push(d.ele),delete d.ele):a.push(0);"time"in d?(a.push(d.time),delete d.time):a.push(0);return a}
function kq(a,c){var d=c[c.length-1],e=a.getAttribute("href");null!==e&&(d.link=e);Mm(lq,a,c)}function mq(a,c){c[c.length-1].extensionsNode_=a}function nq(a,c){var d=c[0],e=R({flatCoordinates:[]},oq,a,c);if(e){var f=e.flatCoordinates;delete e.flatCoordinates;var g=new T(null);g.ba("XYZM",f);gp(g,!1,d);d=new Xl(g);d.C(e);return d}}
function pq(a,c){var d=c[0],e=R({flatCoordinates:[],ends:[]},qq,a,c);if(e){var f=e.flatCoordinates;delete e.flatCoordinates;var g=e.ends;delete e.ends;var h=new U(null);h.ba("XYZM",f,g);gp(h,!1,d);d=new Xl(h);d.C(e);return d}}function rq(a,c){var d=c[0],e=R({},sq,a,c);if(e){var f=jq([],a,e),f=new E(f,"XYZM");gp(f,!1,d);d=new Xl(f);d.C(e);return d}}
var tq={rte:nq,trk:pq,wpt:rq},uq=Q(iq,{rte:Em(nq),trk:Em(pq),wpt:Em(rq)}),lq=Q(iq,{text:M(W,"linkText"),type:M(W,"linkType")}),oq=Q(iq,{name:M(W),cmt:M(W),desc:M(W),src:M(W),link:kq,number:M(Sp),extensions:mq,type:M(W),rtept:function(a,c){var d=R({},vq,a,c);d&&jq(c[c.length-1].flatCoordinates,a,d)}}),vq=Q(iq,{ele:M(Qp),time:M(Pp)}),qq=Q(iq,{name:M(W),cmt:M(W),desc:M(W),src:M(W),link:kq,number:M(Sp),type:M(W),extensions:mq,trkseg:function(a,c){var d=c[c.length-1];Mm(wq,a,c);d.ends.push(d.flatCoordinates.length)}}),
wq=Q(iq,{trkpt:function(a,c){var d=R({},xq,a,c);d&&jq(c[c.length-1].flatCoordinates,a,d)}}),xq=Q(iq,{ele:M(Qp),time:M(Pp)}),sq=Q(iq,{ele:M(Qp),time:M(Pp),magvar:M(Qp),geoidheight:M(Qp),name:M(W),cmt:M(W),desc:M(W),src:M(W),link:kq,sym:M(W),type:M(W),fix:M(W),sat:M(Sp),hdop:M(Qp),vdop:M(Qp),pdop:M(Qp),ageofdgpsdata:M(Qp),dgpsid:M(Sp),extensions:mq});
function yq(a,c){c||(c=[]);for(var d=0,e=c.length;d<e;++d){var f=c[d];if(a.b){var g=f.get("extensionsNode_")||null;a.b(f,g)}f.set("extensionsNode_",void 0)}}hq.prototype.yh=function(a,c){if(!Ua(iq,a.namespaceURI))return null;var d=tq[a.localName];if(!d)return null;d=d(a,[ep(this,a,c)]);if(!d)return null;yq(this,[d]);return d};hq.prototype.ic=function(a,c){if(!Ua(iq,a.namespaceURI))return[];if("gpx"==a.localName){var d=R([],uq,a,[ep(this,a,c)]);if(d)return yq(this,d),d}return[]};
function zq(a,c,d){a.setAttribute("href",c);c=d[d.length-1].properties;Nm({node:a},Aq,Km,[c.linkText,c.linkType],d,Bq)}function Cq(a,c,d){var e=d[d.length-1],f=e.node.namespaceURI,g=e.properties;Bm(a,null,"lat",c[1]);Bm(a,null,"lon",c[0]);switch(e.geometryLayout){case "XYZM":0!==c[3]&&(g.time=c[3]);case "XYZ":0!==c[2]&&(g.ele=c[2]);break;case "XYM":0!==c[2]&&(g.time=c[2])}c=Dq[f];e=Lm(g,c);Nm({node:a,properties:g},Eq,Km,e,d,c)}
var Bq=["text","type"],Aq=Q(iq,{text:N(Vp),type:N(Vp)}),Fq=Q(iq,"name cmt desc src link number type rtept".split(" ")),Gq=Q(iq,{name:N(Vp),cmt:N(Vp),desc:N(Vp),src:N(Vp),link:N(zq),number:N(Xp),type:N(Vp),rtept:Hm(N(Cq))}),Hq=Q(iq,"name cmt desc src link number type trkseg".split(" ")),Kq=Q(iq,{name:N(Vp),cmt:N(Vp),desc:N(Vp),src:N(Vp),link:N(zq),number:N(Xp),type:N(Vp),trkseg:Hm(N(function(a,c,d){Nm({node:a,geometryLayout:c.f,properties:{}},Iq,Jq,c.Y(),d)}))}),Jq=Im("trkpt"),Iq=Q(iq,{trkpt:N(Cq)}),
Dq=Q(iq,"ele time magvar geoidheight name cmt desc src link sym type fix sat hdop vdop pdop ageofdgpsdata dgpsid".split(" ")),Eq=Q(iq,{ele:N(Wp),time:N(function(a,c){var d=new Date(1E3*c),d=d.getUTCFullYear()+"-"+Ia(d.getUTCMonth()+1)+"-"+Ia(d.getUTCDate())+"T"+Ia(d.getUTCHours())+":"+Ia(d.getUTCMinutes())+":"+Ia(d.getUTCSeconds())+"Z";a.appendChild(em.createTextNode(d))}),magvar:N(Wp),geoidheight:N(Wp),name:N(Vp),cmt:N(Vp),desc:N(Vp),src:N(Vp),link:N(zq),sym:N(Vp),type:N(Vp),fix:N(Vp),sat:N(Xp),
hdop:N(Wp),vdop:N(Wp),pdop:N(Wp),ageofdgpsdata:N(Wp),dgpsid:N(Xp)}),Lq={Point:"wpt",LineString:"rte",MultiLineString:"trk"};function Mq(a,c){var d=a.X();if(d&&(d=Lq[d.W()]))return hm(c[c.length-1].node.namespaceURI,d)}
var Nq=Q(iq,{rte:N(function(a,c,d){var e=d[0],f=c.P();a={node:a,properties:f};if(c=c.X())c=gp(c,!0,e),a.geometryLayout=c.f,f.rtept=c.Y();e=Fq[d[d.length-1].node.namespaceURI];f=Lm(f,e);Nm(a,Gq,Km,f,d,e)}),trk:N(function(a,c,d){var e=d[0],f=c.P();a={node:a,properties:f};if(c=c.X())c=gp(c,!0,e),f.trkseg=c.rd();e=Hq[d[d.length-1].node.namespaceURI];f=Lm(f,e);Nm(a,Kq,Km,f,d,e)}),wpt:N(function(a,c,d){var e=d[0],f=d[d.length-1];f.properties=c.P();if(c=c.X())c=gp(c,!0,e),f.geometryLayout=c.f,Cq(a,c.Y(),
d)})});hq.prototype.a=function(a,c){c=fp(this,c);var d=hm("http://www.topografix.com/GPX/1/1","gpx");Nm({node:d},Nq,Mq,a,[c]);return d};function Oq(){this.defaultDataProjection=null}y(Oq,dp);function Pq(a){return"string"===typeof a?a:""}l=Oq.prototype;l.W=function(){return"text"};l.Ub=function(a,c){return this.xd(Pq(a),fp(this,c))};l.Ea=function(a,c){return this.Bf(Pq(a),fp(this,c))};l.Uc=function(a,c){return this.zd(Pq(a),fp(this,c))};l.Qa=function(a){Pq(a);return this.defaultDataProjection};l.Fd=function(a,c){return this.He(a,fp(this,c))};l.Wb=function(a,c){return this.ii(a,fp(this,c))};
l.Zc=function(a,c){return this.Gd(a,fp(this,c))};function Qq(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=qd("EPSG:4326");this.b=a.altitudeMode?a.altitudeMode:"none"}y(Qq,Oq);var Rq=/^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{5})([NS])(\d{3})(\d{5})([EW])([AV])(\d{5})(\d{5})/,Sq=/^H.([A-Z]{3}).*?:(.*)/,Tq=/^HFDTE(\d{2})(\d{2})(\d{2})/,Uq=/\r\n|\r|\n/;
Qq.prototype.xd=function(a,c){var d=this.b,e=a.split(Uq),f={},g=[],h=2E3,k=0,m=1,n,p;n=0;for(p=e.length;n<p;++n){var q=e[n],r;if("B"==q.charAt(0)){if(r=Rq.exec(q)){var q=parseInt(r[1],10),t=parseInt(r[2],10),v=parseInt(r[3],10),w=parseInt(r[4],10)+parseInt(r[5],10)/6E4;"S"==r[6]&&(w=-w);var A=parseInt(r[7],10)+parseInt(r[8],10)/6E4;"W"==r[9]&&(A=-A);g.push(A,w);"none"!=d&&g.push("gps"==d?parseInt(r[11],10):"barometric"==d?parseInt(r[12],10):0);g.push(Date.UTC(h,k,m,q,t,v)/1E3)}}else if("H"==q.charAt(0))if(r=
Tq.exec(q))m=parseInt(r[1],10),k=parseInt(r[2],10)-1,h=2E3+parseInt(r[3],10);else if(r=Sq.exec(q))f[r[1]]=r[2].trim(),Tq.exec(q)}if(0===g.length)return null;e=new T(null);e.ba("none"==d?"XYM":"XYZM",g);d=new Xl(gp(e,!1,c));d.C(f);return d};Qq.prototype.Bf=function(a,c){var d=this.xd(a,c);return d?[d]:[]};var Vq=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;function Wq(a,c){if(a)for(var d=a.split("&"),e=0;e<d.length;e++){var f=d[e].indexOf("="),g=null,h=null;0<=f?(g=d[e].substring(0,f),h=d[e].substring(f+1)):g=d[e];c(g,h?decodeURIComponent(h.replace(/\+/g," ")):"")}}
function Xq(a){if(a[1]){var c=a[0],d=c.indexOf("#");0<=d&&(a.push(c.substr(d)),a[0]=c=c.substr(0,d));d=c.indexOf("?");0>d?a[1]="?":d==c.length-1&&(a[1]=void 0)}return a.join("")}function Yq(a,c,d){if(ga(c))for(var e=0;e<c.length;e++)Yq(a,String(c[e]),d);else null!=c&&d.push("&",a,""===c?"":"=",encodeURIComponent(String(c)))}function Zq(a,c){for(var d in c)Yq(d,c[d],a);return a};function $q(a,c){this.a=this.j=this.g="";this.l=null;this.f=this.b="";this.c=!1;var d;a instanceof $q?(this.c=ba(c)?c:a.c,ar(this,a.g),this.j=a.j,this.a=a.a,br(this,a.l),this.b=a.b,cr(this,a.i.clone()),this.f=a.f):a&&(d=String(a).match(Vq))?(this.c=!!c,ar(this,d[1]||"",!0),this.j=dr(d[2]||""),this.a=dr(d[3]||"",!0),br(this,d[4]),this.b=dr(d[5]||"",!0),cr(this,d[6]||"",!0),this.f=dr(d[7]||"")):(this.c=!!c,this.i=new er(null,0,this.c))}
$q.prototype.toString=function(){var a=[],c=this.g;c&&a.push(fr(c,gr,!0),":");var d=this.a;if(d||"file"==c)a.push("//"),(c=this.j)&&a.push(fr(c,gr,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.l,null!=d&&a.push(":",String(d));if(d=this.b)this.a&&"/"!=d.charAt(0)&&a.push("/"),a.push(fr(d,"/"==d.charAt(0)?hr:ir,!0));(d=this.i.toString())&&a.push("?",d);(d=this.f)&&a.push("#",fr(d,jr));return a.join("")};$q.prototype.clone=function(){return new $q(this)};
function ar(a,c,d){a.g=d?dr(c,!0):c;a.g&&(a.g=a.g.replace(/:$/,""))}function br(a,c){if(c){c=Number(c);if(isNaN(c)||0>c)throw Error("Bad port number "+c);a.l=c}else a.l=null}function cr(a,c,d){c instanceof er?(a.i=c,kr(a.i,a.c)):(d||(c=fr(c,lr)),a.i=new er(c,0,a.c))}function mr(a){return a instanceof $q?a.clone():new $q(a,void 0)}
function nr(a,c){a instanceof $q||(a=mr(a));c instanceof $q||(c=mr(c));var d=a,e=c,f=d.clone(),g=!!e.g;g?ar(f,e.g):g=!!e.j;g?f.j=e.j:g=!!e.a;g?f.a=e.a:g=null!=e.l;var h=e.b;if(g)br(f,e.l);else if(g=!!e.b)if("/"!=h.charAt(0)&&(d.a&&!d.b?h="/"+h:(d=f.b.lastIndexOf("/"),-1!=d&&(h=f.b.substr(0,d+1)+h))),d=h,".."==d||"."==d)h="";else if(-1!=d.indexOf("./")||-1!=d.indexOf("/.")){for(var h=0==d.lastIndexOf("/",0),d=d.split("/"),k=[],m=0;m<d.length;){var n=d[m++];"."==n?h&&m==d.length&&k.push(""):".."==n?
((1<k.length||1==k.length&&""!=k[0])&&k.pop(),h&&m==d.length&&k.push("")):(k.push(n),h=!0)}h=k.join("/")}else h=d;g?f.b=h:g=""!==e.i.toString();g?cr(f,dr(e.i.toString())):g=!!e.f;g&&(f.f=e.f);return f}function dr(a,c){return a?c?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function fr(a,c,d){return ia(a)?(a=encodeURI(a).replace(c,or),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function or(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}
var gr=/[#\/\?@]/g,ir=/[\#\?:]/g,hr=/[\#\?]/g,lr=/[\#\?@]/g,jr=/#/g;function er(a,c,d){this.a=this.b=null;this.g=a||null;this.f=!!d}function pr(a){a.b||(a.b=new fh,a.a=0,a.g&&Wq(a.g,function(c,d){var e=decodeURIComponent(c.replace(/\+/g," "));pr(a);a.g=null;var e=qr(a,e),f=a.b.get(e);f||a.b.set(e,f=[]);f.push(d);a.a++}))}l=er.prototype;l.rc=function(){pr(this);return this.a};
l.remove=function(a){pr(this);a=qr(this,a);return hh(this.b.a,a)?(this.g=null,this.a-=this.b.get(a).length,this.b.remove(a)):!1};l.clear=function(){this.b=this.g=null;this.a=0};l.Oa=function(){pr(this);return 0==this.a};function rr(a,c){pr(a);c=qr(a,c);return hh(a.b.a,c)}l.O=function(){pr(this);for(var a=this.b.vc(),c=this.b.O(),d=[],e=0;e<c.length;e++)for(var f=a[e],g=0;g<f.length;g++)d.push(c[e]);return d};
l.vc=function(a){pr(this);var c=[];if(ia(a))rr(this,a)&&(c=Xb(c,this.b.get(qr(this,a))));else{a=this.b.vc();for(var d=0;d<a.length;d++)c=Xb(c,a[d])}return c};l.set=function(a,c){pr(this);this.g=null;a=qr(this,a);rr(this,a)&&(this.a-=this.b.get(a).length);this.b.set(a,[c]);this.a++;return this};l.get=function(a,c){var d=a?this.vc(a):[];return 0<d.length?String(d[0]):c};
l.toString=function(){if(this.g)return this.g;if(!this.b)return"";for(var a=[],c=this.b.O(),d=0;d<c.length;d++)for(var e=c[d],f=encodeURIComponent(String(e)),e=this.vc(e),g=0;g<e.length;g++){var h=f;""!==e[g]&&(h+="="+encodeURIComponent(String(e[g])));a.push(h)}return this.g=a.join("&")};l.clone=function(){var a=new er;a.g=this.g;this.b&&(a.b=this.b.clone(),a.a=this.a);return a};function qr(a,c){var d=String(c);a.f&&(d=d.toLowerCase());return d}
function kr(a,c){c&&!a.f&&(pr(a),a.g=null,a.b.forEach(function(a,c){var f=c.toLowerCase();c!=f&&(this.remove(c),this.remove(f),0<a.length&&(this.g=null,this.b.set(qr(this,f),Yb(a)),this.a+=a.length))},a));a.f=c};function sr(a){a=a||{};this.g=a.font;this.i=a.rotation;this.a=a.scale;this.s=a.text;this.l=a.textAlign;this.o=a.textBaseline;this.b=void 0!==a.fill?a.fill:new Ak({color:"#333"});this.j=void 0!==a.stroke?a.stroke:null;this.f=void 0!==a.offsetX?a.offsetX:0;this.c=void 0!==a.offsetY?a.offsetY:0}l=sr.prototype;l.Cj=function(){return this.g};l.Qj=function(){return this.f};l.Rj=function(){return this.c};l.jn=function(){return this.b};l.kn=function(){return this.i};l.ln=function(){return this.a};l.mn=function(){return this.j};
l.Fa=function(){return this.s};l.ck=function(){return this.l};l.dk=function(){return this.o};l.so=function(a){this.g=a};l.Vh=function(a){this.f=a};l.Wh=function(a){this.c=a};l.ro=function(a){this.b=a};l.nn=function(a){this.i=a};l.pn=function(a){this.a=a};l.yo=function(a){this.j=a};l.Yh=function(a){this.s=a};l.Zh=function(a){this.l=a};l.zo=function(a){this.o=a};function tr(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=qd("EPSG:4326");this.g=a.defaultStyle?a.defaultStyle:ur;this.f=void 0!==a.extractStyles?a.extractStyles:!0;this.i=void 0!==a.writeStyles?a.writeStyles:!0;this.b={};this.c=void 0!==a.showPointNames?a.showPointNames:!0}y(tr,Ip);
var vr=["http://www.google.com/kml/ext/2.2"],wr=[null,"http://earth.google.com/kml/2.0","http://earth.google.com/kml/2.1","http://earth.google.com/kml/2.2","http://www.opengis.net/kml/2.2"],xr=[255,255,255,1],yr=new Ak({color:xr}),zr=[20,2],Ar=[64,64],Br=new Wi({anchor:zr,anchorOrigin:"bottom-left",anchorXUnits:"pixels",anchorYUnits:"pixels",crossOrigin:"anonymous",rotation:0,scale:.5,size:Ar,src:"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"}),Cr=new Gk({color:xr,width:1}),Dr=new sr({font:"bold 16px Helvetica",
fill:yr,stroke:new Gk({color:[51,51,51,1],width:2}),scale:.8}),ur=[new Kk({fill:yr,image:Br,text:Dr,stroke:Cr,zIndex:0})],Er={fraction:"fraction",pixels:"pixels"};function Fr(a,c){var d=null,e=[0,0],f="start";a.a&&(d=a.a.qd())&&2==d.length&&(e[0]=a.a.j*d[0]/2,e[1]=-a.a.j*d[1]/2,f="left");if(pb(a.Fa()))d=new sr({text:c,offsetX:e[0],offsetY:e[1],textAlign:f});else{var d=a.Fa(),g={},h;for(h in d)g[h]=d[h];d=g;d.Yh(c);d.Zh(f);d.Vh(e[0]);d.Wh(e[1])}return new Kk({text:d})}
function Gr(a,c,d,e,f){return function(){var g=f,h="";g&&this.X()&&(g="Point"===this.X().W());g&&(h=this.get("name"),g=g&&h);if(a)return g?(g=Fr(a[0],h),a.concat(g)):a;if(c){var k=Hr(c,d,e);return g?(g=Fr(k[0],h),k.concat(g)):k}return g?(g=Fr(d[0],h),d.concat(g)):d}}function Hr(a,c,d){return ga(a)?a:"string"===typeof a?(!(a in d)&&"#"+a in d&&(a="#"+a),Hr(d[a],c,d)):c}
function Ir(a){a=im(a,!1);if(a=/^\s*#?\s*([0-9A-Fa-f]{8})\s*$/.exec(a))return a=a[1],[parseInt(a.substr(6,2),16),parseInt(a.substr(4,2),16),parseInt(a.substr(2,2),16),parseInt(a.substr(0,2),16)/255]}function Jr(a){a=im(a,!1);for(var c=[],d=/^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*,\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s*,\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?))?\s*/i,e;e=d.exec(a);)c.push(parseFloat(e[1]),parseFloat(e[2]),e[3]?parseFloat(e[3]):0),a=a.substr(e[0].length);return""!==a?void 0:c}
function Kr(a){var c=im(a,!1);return a.baseURI?nr(a.baseURI,c.trim()).toString():c.trim()}function Lr(a){a=Qp(a);if(void 0!==a)return Math.sqrt(a)}function Mr(a,c){return R(null,Nr,a,c)}function Or(a,c){var d=R({v:[],fi:[]},Pr,a,c);if(d){var e=d.v,d=d.fi,f,g;f=0;for(g=Math.min(e.length,d.length);f<g;++f)e[4*f+3]=d[f];d=new T(null);d.ba("XYZM",e);return d}}function Qr(a,c){var d=R({},Rr,a,c),e=R(null,Sr,a,c);if(e){var f=new T(null);f.ba("XYZ",e);f.C(d);return f}}
function Tr(a,c){var d=R({},Rr,a,c),e=R(null,Sr,a,c);if(e){var f=new F(null);f.ba("XYZ",e,[e.length]);f.C(d);return f}}
function Ur(a,c){var d=R([],Vr,a,c);if(!d)return null;if(0===d.length)return new zp(d);var e=!0,f=d[0].W(),g,h,k;h=1;for(k=d.length;h<k;++h)if(g=d[h],g.W()!=f){e=!1;break}if(e){if("Point"==f){g=d[0];e=g.f;f=g.ha();h=1;for(k=d.length;h<k;++h)g=d[h],Xa(f,g.ha());g=new pp(null);g.ba(e,f);Wr(g,d);return g}return"LineString"==f?(g=new U(null),op(g,d),Wr(g,d),g):"Polygon"==f?(g=new V(null),rp(g,d),Wr(g,d),g):"GeometryCollection"==f?new zp(d):null}return new zp(d)}
function Xr(a,c){var d=R({},Rr,a,c),e=R(null,Sr,a,c);if(e){var f=new E(null);f.ba("XYZ",e);f.C(d);return f}}function Yr(a,c){var d=R({},Rr,a,c),e=R([null],Zr,a,c);if(e&&e[0]){var f=new F(null),g=e[0],h=[g.length],k,m;k=1;for(m=e.length;k<m;++k)Xa(g,e[k]),h.push(g.length);f.ba("XYZ",g,h);f.C(d);return f}}
function $r(a,c){var d=R({},as,a,c);if(!d)return null;var e="fillStyle"in d?d.fillStyle:yr,f=d.fill;void 0===f||f||(e=null);var f="imageStyle"in d?d.imageStyle:Br,g="textStyle"in d?d.textStyle:Dr,h="strokeStyle"in d?d.strokeStyle:Cr,d=d.outline;void 0===d||d||(h=null);return[new Kk({fill:e,image:f,stroke:h,text:g,zIndex:void 0})]}
function Wr(a,c){var d=c.length,e=Array(c.length),f=Array(c.length),g,h,k,m;k=m=!1;for(h=0;h<d;++h)g=c[h],e[h]=g.get("extrude"),f[h]=g.get("altitudeMode"),k=k||void 0!==e[h],m=m||f[h];k&&a.set("extrude",e);m&&a.set("altitudeMode",f)}function bs(a,c){Mm(cs,a,c)}
var ds=Q(wr,{value:Fm(W)}),cs=Q(wr,{Data:function(a,c){var d=a.getAttribute("name");if(null!==d){var e=R(void 0,ds,a,c);e&&(c[c.length-1][d]=e)}},SchemaData:function(a,c){Mm(es,a,c)}}),Rr=Q(wr,{extrude:M(Np),altitudeMode:M(W)}),Nr=Q(wr,{coordinates:Fm(Jr)}),Zr=Q(wr,{innerBoundaryIs:function(a,c){var d=R(void 0,fs,a,c);d&&c[c.length-1].push(d)},outerBoundaryIs:function(a,c){var d=R(void 0,gs,a,c);d&&(c[c.length-1][0]=d)}}),Pr=Q(wr,{when:function(a,c){var d=c[c.length-1].fi,e=im(a,!1);if(e=/^\s*(\d{4})($|-(\d{2})($|-(\d{2})($|T(\d{2}):(\d{2}):(\d{2})(Z|(?:([+\-])(\d{2})(?::(\d{2}))?)))))\s*$/.exec(e)){var f=
Date.UTC(parseInt(e[1],10),e[3]?parseInt(e[3],10)-1:0,e[5]?parseInt(e[5],10):1,e[7]?parseInt(e[7],10):0,e[8]?parseInt(e[8],10):0,e[9]?parseInt(e[9],10):0);if(e[10]&&"Z"!=e[10]){var g="-"==e[11]?-1:1,f=f+60*g*parseInt(e[12],10);e[13]&&(f+=3600*g*parseInt(e[13],10))}d.push(f)}else d.push(0)}},Q(vr,{coord:function(a,c){var d=c[c.length-1].v,e=im(a,!1);(e=/^\s*([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s*$/i.exec(e))?d.push(parseFloat(e[1]),
parseFloat(e[2]),parseFloat(e[3]),0):d.push(0,0,0,0)}})),Sr=Q(wr,{coordinates:Fm(Jr)}),hs=Q(wr,{href:M(Kr)},Q(vr,{x:M(Qp),y:M(Qp),w:M(Qp),h:M(Qp)})),is=Q(wr,{Icon:M(function(a,c){var d=R({},hs,a,c);return d?d:null}),heading:M(Qp),hotSpot:M(function(a){var c=a.getAttribute("xunits"),d=a.getAttribute("yunits");return{x:parseFloat(a.getAttribute("x")),Qf:Er[c],y:parseFloat(a.getAttribute("y")),Rf:Er[d]}}),scale:M(Lr)}),fs=Q(wr,{LinearRing:Fm(Mr)}),js=Q(wr,{color:M(Ir),scale:M(Lr)}),ks=Q(wr,{color:M(Ir),
width:M(Qp)}),Vr=Q(wr,{LineString:Em(Qr),LinearRing:Em(Tr),MultiGeometry:Em(Ur),Point:Em(Xr),Polygon:Em(Yr)}),ls=Q(vr,{Track:Em(Or)}),ns=Q(wr,{ExtendedData:bs,Link:function(a,c){Mm(ms,a,c)},address:M(W),description:M(W),name:M(W),open:M(Np),phoneNumber:M(W),visibility:M(Np)}),ms=Q(wr,{href:M(Kr)}),gs=Q(wr,{LinearRing:Fm(Mr)}),os=Q(wr,{Style:M($r),key:M(W),styleUrl:M(function(a){var c=im(a,!1).trim();return a.baseURI?nr(a.baseURI,c).toString():c})}),qs=Q(wr,{ExtendedData:bs,MultiGeometry:M(Ur,"geometry"),
LineString:M(Qr,"geometry"),LinearRing:M(Tr,"geometry"),Point:M(Xr,"geometry"),Polygon:M(Yr,"geometry"),Style:M($r),StyleMap:function(a,c){var d=R(void 0,ps,a,c);if(d){var e=c[c.length-1];ga(d)?e.Style=d:"string"===typeof d&&(e.styleUrl=d)}},address:M(W),description:M(W),name:M(W),open:M(Np),phoneNumber:M(W),styleUrl:M(Kr),visibility:M(Np)},Q(vr,{MultiTrack:M(function(a,c){var d=R([],ls,a,c);if(d){var e=new U(null);op(e,d);return e}},"geometry"),Track:M(Or,"geometry")})),rs=Q(wr,{color:M(Ir),fill:M(Np),
outline:M(Np)}),es=Q(wr,{SimpleData:function(a,c){var d=a.getAttribute("name");if(null!==d){var e=W(a);c[c.length-1][d]=e}}}),as=Q(wr,{IconStyle:function(a,c){var d=R({},is,a,c);if(d){var e=c[c.length-1],f="Icon"in d?d.Icon:{},g;g=(g=f.href)?g:"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png";var h,k,m,n=d.hotSpot;n?(h=[n.x,n.y],k=n.Qf,m=n.Rf):"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"===g?(h=zr,m=k="pixels"):/^http:\/\/maps\.(?:google|gstatic)\.com\//.test(g)&&(h=
[.5,0],m=k="fraction");var p,n=f.x,q=f.y;void 0!==n&&void 0!==q&&(p=[n,q]);var r,n=f.w,f=f.h;void 0!==n&&void 0!==f&&(r=[n,f]);var t,f=d.heading;void 0!==f&&(t=Qa(f));d=d.scale;"https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"==g&&(r=Ar,void 0===d&&(d=.5));h=new Wi({anchor:h,anchorOrigin:"bottom-left",anchorXUnits:k,anchorYUnits:m,crossOrigin:"anonymous",offset:p,offsetOrigin:"bottom-left",rotation:t,scale:d,size:r,src:g});e.imageStyle=h}},LabelStyle:function(a,c){var d=R({},js,a,c);
d&&(c[c.length-1].textStyle=new sr({fill:new Ak({color:"color"in d?d.color:xr}),scale:d.scale}))},LineStyle:function(a,c){var d=R({},ks,a,c);d&&(c[c.length-1].strokeStyle=new Gk({color:"color"in d?d.color:xr,width:"width"in d?d.width:1}))},PolyStyle:function(a,c){var d=R({},rs,a,c);if(d){var e=c[c.length-1];e.fillStyle=new Ak({color:"color"in d?d.color:xr});var f=d.fill;void 0!==f&&(e.fill=f);d=d.outline;void 0!==d&&(e.outline=d)}}}),ps=Q(wr,{Pair:function(a,c){var d=R({},os,a,c);if(d){var e=d.key;
e&&"normal"==e&&((e=d.styleUrl)&&(c[c.length-1]=e),(d=d.Style)&&(c[c.length-1]=d))}}});l=tr.prototype;l.xf=function(a,c){mm(a);var d=Q(wr,{Document:Dm(this.xf,this),Folder:Dm(this.xf,this),Placemark:Em(this.Ff,this),Style:this.ao.bind(this),StyleMap:this.$n.bind(this)});if(d=R([],d,a,c,this))return d};
l.Ff=function(a,c){var d=R({geometry:null},qs,a,c);if(d){var e=new Xl,f=a.getAttribute("id");null!==f&&e.jc(f);var f=c[0],g=d.geometry;g&&gp(g,!1,f);e.Pa(g);delete d.geometry;this.f&&e.lf(Gr(d.Style,d.styleUrl,this.g,this.b,this.c));delete d.Style;e.C(d);return e}};l.ao=function(a,c){var d=a.getAttribute("id");if(null!==d){var e=$r(a,c);e&&(d=a.baseURI?nr(a.baseURI,"#"+d).toString():"#"+d,this.b[d]=e)}};
l.$n=function(a,c){var d=a.getAttribute("id");if(null!==d){var e=R(void 0,ps,a,c);e&&(d=a.baseURI?nr(a.baseURI,"#"+d).toString():"#"+d,this.b[d]=e)}};l.yh=function(a,c){if(!Ua(wr,a.namespaceURI))return null;var d=this.Ff(a,[ep(this,a,c)]);return d?d:null};
l.ic=function(a,c){if(!Ua(wr,a.namespaceURI))return[];var d;d=mm(a);if("Document"==d||"Folder"==d)return(d=this.xf(a,[ep(this,a,c)]))?d:[];if("Placemark"==d)return(d=this.Ff(a,[ep(this,a,c)]))?[d]:[];if("kml"==d){d=[];var e;for(e=a.firstElementChild;e;e=e.nextElementSibling){var f=this.ic(e,c);f&&Xa(d,f)}return d}return[]};l.Vn=function(a){if(pm(a))return ss(this,a);if(sm(a))return ts(this,a);if("string"===typeof a)return a=Cm(a),ss(this,a)};
function ss(a,c){var d;for(d=c.firstChild;d;d=d.nextSibling)if(1==d.nodeType){var e=ts(a,d);if(e)return e}}function ts(a,c){var d;for(d=c.firstElementChild;d;d=d.nextElementSibling)if(Ua(wr,d.namespaceURI)&&"name"==d.localName)return W(d);for(d=c.firstElementChild;d;d=d.nextElementSibling){var e=mm(d);if(Ua(wr,d.namespaceURI)&&("Document"==e||"Folder"==e||"Placemark"==e||"kml"==e)&&(e=ts(a,d)))return e}}
l.Wn=function(a){var c=[];pm(a)?Xa(c,us(this,a)):sm(a)?Xa(c,vs(this,a)):"string"===typeof a&&(a=Cm(a),Xa(c,us(this,a)));return c};function us(a,c){var d,e=[];for(d=c.firstChild;d;d=d.nextSibling)1==d.nodeType&&Xa(e,vs(a,d));return e}
function vs(a,c){var d,e=[];for(d=c.firstElementChild;d;d=d.nextElementSibling)if(Ua(wr,d.namespaceURI)&&"NetworkLink"==d.localName){var f=R({},ns,d,[]);e.push(f)}for(d=c.firstElementChild;d;d=d.nextElementSibling)f=mm(d),!Ua(wr,d.namespaceURI)||"Document"!=f&&"Folder"!=f&&"kml"!=f||Xa(e,vs(a,d));return e}function ws(a,c){var d=Xe(c),d=[255*(4==d.length?d[3]:1),d[2],d[1],d[0]],e;for(e=0;4>e;++e){var f=parseInt(d[e],10).toString(16);d[e]=1==f.length?"0"+f:f}Vp(a,d.join(""))}
function xs(a,c,d){Nm({node:a},ys,zs,[c],d)}function As(a,c,d){var e={node:a};c.Sa()&&a.setAttribute("id",c.Sa());a=c.P();var f=c.bc();f&&(f=f.call(c,0))&&(f=ga(f)?f[0]:f,this.i&&(a.Style=f),(f=f.Fa())&&(a.name=f.Fa()));f=Bs[d[d.length-1].node.namespaceURI];a=Lm(a,f);Nm(e,Cs,Km,a,d,f);a=d[0];(c=c.X())&&(c=gp(c,!0,a));Nm(e,Cs,Ds,[c],d)}function Es(a,c,d){var e=c.ha();a={node:a};a.layout=c.f;a.stride=c.qa();Nm(a,Fs,Gs,[e],d)}
function Hs(a,c,d){c=c.Vd();var e=c.shift();a={node:a};Nm(a,Is,Js,c,d);Nm(a,Is,Ks,[e],d)}function Ls(a,c){Wp(a,c*c)}
var Ms=Q(wr,["Document","Placemark"]),Ps=Q(wr,{Document:N(function(a,c,d){Nm({node:a},Ns,Os,c,d,void 0,this)}),Placemark:N(As)}),Ns=Q(wr,{Placemark:N(As)}),Qs={Point:"Point",LineString:"LineString",LinearRing:"LinearRing",Polygon:"Polygon",MultiPoint:"MultiGeometry",MultiLineString:"MultiGeometry",MultiPolygon:"MultiGeometry"},Rs=Q(wr,["href"],Q(vr,["x","y","w","h"])),Ss=Q(wr,{href:N(Vp)},Q(vr,{x:N(Wp),y:N(Wp),w:N(Wp),h:N(Wp)})),Ts=Q(wr,["scale","heading","Icon","hotSpot"]),Vs=Q(wr,{Icon:N(function(a,
c,d){a={node:a};var e=Rs[d[d.length-1].node.namespaceURI],f=Lm(c,e);Nm(a,Ss,Km,f,d,e);e=Rs[vr[0]];f=Lm(c,e);Nm(a,Ss,Us,f,d,e)}),heading:N(Wp),hotSpot:N(function(a,c){a.setAttribute("x",c.x);a.setAttribute("y",c.y);a.setAttribute("xunits",c.Qf);a.setAttribute("yunits",c.Rf)}),scale:N(Ls)}),Ws=Q(wr,["color","scale"]),Xs=Q(wr,{color:N(ws),scale:N(Ls)}),Ys=Q(wr,["color","width"]),Zs=Q(wr,{color:N(ws),width:N(Wp)}),ys=Q(wr,{LinearRing:N(Es)}),$s=Q(wr,{LineString:N(Es),Point:N(Es),Polygon:N(Hs)}),Bs=Q(wr,
"name open visibility address phoneNumber description styleUrl Style".split(" ")),Cs=Q(wr,{MultiGeometry:N(function(a,c,d){a={node:a};var e=c.W(),f,g;"MultiPoint"==e?(f=c.le(),g=at):"MultiLineString"==e?(f=c.rd(),g=bt):"MultiPolygon"==e&&(f=c.Xd(),g=ct);Nm(a,$s,g,f,d)}),LineString:N(Es),LinearRing:N(Es),Point:N(Es),Polygon:N(Hs),Style:N(function(a,c,d){a={node:a};var e={},f=c.c,g=c.g,h=c.a;c=c.Fa();h instanceof Wi&&(e.IconStyle=h);c&&(e.LabelStyle=c);g&&(e.LineStyle=g);f&&(e.PolyStyle=f);c=dt[d[d.length-
1].node.namespaceURI];e=Lm(e,c);Nm(a,et,Km,e,d,c)}),address:N(Vp),description:N(Vp),name:N(Vp),open:N(Up),phoneNumber:N(Vp),styleUrl:N(Vp),visibility:N(Up)}),Fs=Q(wr,{coordinates:N(function(a,c,d){d=d[d.length-1];var e=d.layout;d=d.stride;var f;"XY"==e||"XYM"==e?f=2:("XYZ"==e||"XYZM"==e)&&(f=3);var g,h=c.length,k="";if(0<h){k+=c[0];for(e=1;e<f;++e)k+=","+c[e];for(g=d;g<h;g+=d)for(k+=" "+c[g],e=1;e<f;++e)k+=","+c[g+e]}Vp(a,k)})}),Is=Q(wr,{outerBoundaryIs:N(xs),innerBoundaryIs:N(xs)}),ft=Q(wr,{color:N(ws)}),
dt=Q(wr,["IconStyle","LabelStyle","LineStyle","PolyStyle"]),et=Q(wr,{IconStyle:N(function(a,c,d){a={node:a};var e={},f=c.Eb(),g=c.qd(),h={href:c.b.o};if(f){h.w=f[0];h.h=f[1];var k=c.Yb(),m=c.Ha();m&&g&&0!==m[0]&&m[1]!==f[1]&&(h.x=m[0],h.y=g[1]-(m[1]+f[1]));k&&0!==k[0]&&k[1]!==f[1]&&(e.hotSpot={x:k[0],Qf:"pixels",y:f[1]-k[1],Rf:"pixels"})}e.Icon=h;f=c.j;1!==f&&(e.scale=f);c=c.s;0!==c&&(e.heading=c);c=Ts[d[d.length-1].node.namespaceURI];e=Lm(e,c);Nm(a,Vs,Km,e,d,c)}),LabelStyle:N(function(a,c,d){a={node:a};
var e={},f=c.b;f&&(e.color=f.b);(c=c.a)&&1!==c&&(e.scale=c);c=Ws[d[d.length-1].node.namespaceURI];e=Lm(e,c);Nm(a,Xs,Km,e,d,c)}),LineStyle:N(function(a,c,d){a={node:a};var e=Ys[d[d.length-1].node.namespaceURI];c=Lm({color:c.b,width:c.a},e);Nm(a,Zs,Km,c,d,e)}),PolyStyle:N(function(a,c,d){Nm({node:a},ft,gt,[c.b],d)})});function Us(a,c,d){return hm(vr[0],"gx:"+d)}function Os(a,c){return hm(c[c.length-1].node.namespaceURI,"Placemark")}
function Ds(a,c){if(a)return hm(c[c.length-1].node.namespaceURI,Qs[a.W()])}var gt=Im("color"),Gs=Im("coordinates"),Js=Im("innerBoundaryIs"),at=Im("Point"),bt=Im("LineString"),zs=Im("LinearRing"),ct=Im("Polygon"),Ks=Im("outerBoundaryIs");
tr.prototype.a=function(a,c){c=fp(this,c);var d=hm(wr[4],"kml");Bm(d,"http://www.w3.org/2000/xmlns/","xmlns:gx",vr[0]);Bm(d,"http://www.w3.org/2000/xmlns/","xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");Bm(d,"http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation","http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd");var e={node:d},f={};1<a.length?f.Document=a:1==a.length&&(f.Placemark=a[0]);var g=Ms[d.namespaceURI],f=Lm(f,g);Nm(e,Ps,Km,f,[c],g,this);
return d};(function(){var a={},c={ja:a};(function(d){if("object"===typeof a&&"undefined"!==typeof c)c.ja=d();else{var e;"undefined"!==typeof window?e=window:"undefined"!==typeof global?e=global:"undefined"!==typeof self?e=self:e=this;e.hp=d()}})(function(){return function e(a,c,h){function k(n,q){if(!c[n]){if(!a[n]){var r="function"==typeof require&&require;if(!q&&r)return r(n,!0);if(m)return m(n,!0);r=Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r;}r=c[n]={ja:{}};a[n][0].call(r.ja,function(c){var e=
a[n][1][c];return k(e?e:c)},r,r.ja,e,a,c,h)}return c[n].ja}for(var m="function"==typeof require&&require,n=0;n<h.length;n++)k(h[n]);return k}({1:[function(a,c){function g(a){var c;a&&a.length&&(c=a,a=c.length);a=new Uint8Array(a||0);c&&a.set(c);a.Jh=m.Jh;a.Pf=m.Pf;a.Bh=m.Bh;a.ki=m.ki;a.Ef=m.Ef;a.ji=m.ji;a.yf=m.yf;a.gi=m.gi;a.toString=m.toString;a.write=m.write;a.slice=m.slice;a.jg=m.jg;a.Vi=!0;return a}function h(a){for(var c=a.length,e=[],f=0,g,h;f<c;f++){g=a.charCodeAt(f);if(55295<g&&57344>g)if(h)if(56320>
g){e.push(239,191,189);h=g;continue}else g=h-55296<<10|g-56320|65536,h=null;else{56319<g||f+1===c?e.push(239,191,189):h=g;continue}else h&&(e.push(239,191,189),h=null);128>g?e.push(g):2048>g?e.push(g>>6|192,g&63|128):65536>g?e.push(g>>12|224,g>>6&63|128,g&63|128):e.push(g>>18|240,g>>12&63|128,g>>6&63|128,g&63|128)}return e}c.ja=g;var k=a("ieee754"),m,n,p;m={Jh:function(a){return(this[a]|this[a+1]<<8|this[a+2]<<16)+16777216*this[a+3]},Pf:function(a,c){this[c]=a;this[c+1]=a>>>8;this[c+2]=a>>>16;this[c+
3]=a>>>24},Bh:function(a){return(this[a]|this[a+1]<<8|this[a+2]<<16)+(this[a+3]<<24)},Ef:function(a){return k.read(this,a,!0,23,4)},yf:function(a){return k.read(this,a,!0,52,8)},ji:function(a,c){return k.write(this,a,c,!0,23,4)},gi:function(a,c){return k.write(this,a,c,!0,52,8)},toString:function(a,c,e){var f=a="";e=Math.min(this.length,e||this.length);for(c=c||0;c<e;c++){var g=this[c];127>=g?(a+=decodeURIComponent(f)+String.fromCharCode(g),f=""):f+="%"+g.toString(16)}return a+=decodeURIComponent(f)},
write:function(a,c){for(var e=a===n?p:h(a),f=0;f<e.length;f++)this[c+f]=e[f]},slice:function(a,c){return this.subarray(a,c)},jg:function(a,c){c=c||0;for(var e=0;e<this.length;e++)a[c+e]=this[e]}};m.ki=m.Pf;g.byteLength=function(a){n=a;p=h(a);return p.length};g.isBuffer=function(a){return!(!a||!a.Vi)}},{ieee754:3}],2:[function(a,c){(function(g){function h(a){this.Gb=k.isBuffer(a)?a:new k(a||0);this.ca=0;this.length=this.Gb.length}c.ja=h;var k=g.Po||a("./buffer");h.f=0;h.g=1;h.b=2;h.a=5;var m=Math.pow(2,
63);h.prototype={Cf:function(a,c,e){for(e=e||this.length;this.ca<e;){var f=this.Ba(),g=this.ca;a(f>>3,c,this);this.ca===g&&this.Eo(f)}return c},Rn:function(){var a=this.Gb.Ef(this.ca);this.ca+=4;return a},Nn:function(){var a=this.Gb.yf(this.ca);this.ca+=8;return a},Ba:function(){var a=this.Gb,c,e,f,g,h;c=a[this.ca++];if(128>c)return c;c=c&127;f=a[this.ca++];if(128>f)return c|f<<7;f=(f&127)<<7;g=a[this.ca++];if(128>g)return c|f|g<<14;g=(g&127)<<14;h=a[this.ca++];if(128>h)return c|f|g|h<<21;e=a[this.ca++];
c=(c|f|g|(h&127)<<21)+268435456*(e&127);if(128>e)return c;e=a[this.ca++];c+=34359738368*(e&127);if(128>e)return c;e=a[this.ca++];c+=4398046511104*(e&127);if(128>e)return c;e=a[this.ca++];c+=562949953421312*(e&127);if(128>e)return c;e=a[this.ca++];c+=72057594037927936*(e&127);if(128>e)return c;e=a[this.ca++];c+=0x7fffffffffffffff*(e&127);if(128>e)return c;throw Error("Expected varint not more than 10 bytes");},bo:function(){var a=this.ca,c=this.Ba();if(c<m)return c;for(var e=this.ca-2;255===this.Gb[e];)e--;
e<a&&(e=a);for(var f=c=0;f<e-a+1;f++)var g=~this.Gb[a+f]&127,c=c+(4>f?g<<7*f:g*Math.pow(2,7*f));return-c-1},Ad:function(){var a=this.Ba();return 1===a%2?(a+1)/-2:a/2},Ln:function(){return Boolean(this.Ba())},Hf:function(){var a=this.Ba()+this.ca,c=this.Gb.toString("utf8",this.ca,a);this.ca=a;return c},Eo:function(a){a=a&7;if(a===h.f)for(;127<this.Gb[this.ca++];);else if(a===h.b)this.ca=this.Ba()+this.ca;else if(a===h.a)this.ca+=4;else if(a===h.g)this.ca+=8;else throw Error("Unimplemented type: "+
a);}}}).call(this,"undefined"!==typeof global?global:"undefined"!==typeof self?self:"undefined"!==typeof window?window:{})},{"./buffer":1}],3:[function(a,c,g){g.read=function(a,c,e,f,g){var q;q=8*g-f-1;var r=(1<<q)-1,t=r>>1,v=-7;g=e?g-1:0;var w=e?-1:1,A=a[c+g];g+=w;e=A&(1<<-v)-1;A>>=-v;for(v+=q;0<v;e=256*e+a[c+g],g+=w,v-=8);q=e&(1<<-v)-1;e>>=-v;for(v+=f;0<v;q=256*q+a[c+g],g+=w,v-=8);if(0===e)e=1-t;else{if(e===r)return q?NaN:Infinity*(A?-1:1);q+=Math.pow(2,f);e=e-t}return(A?-1:1)*q*Math.pow(2,e-f)};
g.write=function(a,c,e,f,g,q){var r,t=8*q-g-1,v=(1<<t)-1,w=v>>1,A=23===g?Math.pow(2,-24)-Math.pow(2,-77):0;q=f?0:q-1;var B=f?1:-1,z=0>c||0===c&&0>1/c?1:0;c=Math.abs(c);isNaN(c)||Infinity===c?(c=isNaN(c)?1:0,f=v):(f=Math.floor(Math.log(c)/Math.LN2),1>c*(r=Math.pow(2,-f))&&(f--,r*=2),c=1<=f+w?c+A/r:c+A*Math.pow(2,1-w),2<=c*r&&(f++,r/=2),f+w>=v?(c=0,f=v):1<=f+w?(c=(c*r-1)*Math.pow(2,g),f+=w):(c=c*Math.pow(2,w-1)*Math.pow(2,g),f=0));for(;8<=g;a[e+q]=c&255,q+=B,c/=256,g-=8);f=f<<g|c;for(t+=g;0<t;a[e+q]=
f&255,q+=B,f/=256,t-=8);a[e+q-B]|=128*z}},{}]},{},[2])(2)});Tm=c.ja})();(function(){var a={},c={ja:a};(function(d){if("object"===typeof a&&"undefined"!==typeof c)c.ja=d();else{var e;"undefined"!==typeof window?e=window:"undefined"!==typeof global?e=global:"undefined"!==typeof self?e=self:e=this;e.jp=d()}})(function(){return function e(a,c,h){function k(n,q){if(!c[n]){if(!a[n]){var r="function"==typeof require&&require;if(!q&&r)return r(n,!0);if(m)return m(n,!0);r=Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r;}r=c[n]={ja:{}};a[n][0].call(r.ja,function(c){var e=
a[n][1][c];return k(e?e:c)},r,r.ja,e,a,c,h)}return c[n].ja}for(var m="function"==typeof require&&require,n=0;n<h.length;n++)k(h[n]);return k}({1:[function(a,c){c.ja.Mi=a("./lib/vectortile.js");c.ja.bp=a("./lib/vectortilefeature.js");c.ja.cp=a("./lib/vectortilelayer.js")},{"./lib/vectortile.js":2,"./lib/vectortilefeature.js":3,"./lib/vectortilelayer.js":4}],2:[function(a,c){function g(a,c,e){3===a&&(a=new h(e,e.Ba()+e.ca),a.length&&(c[a.name]=a))}var h=a("./vectortilelayer");c.ja=function(a,c){this.layers=
a.Cf(g,{},c)}},{"./vectortilelayer":4}],3:[function(a,c){function g(a,c,e,f,g){this.properties={};this.extent=e;this.type=0;this.pc=a;this.Oe=-1;this.Kd=f;this.Md=g;a.Cf(h,this,c)}function h(a,c,e){if(1==a)c.fp=e.Ba();else if(2==a)for(a=e.Ba()+e.ca;e.ca<a;){var f=c.Kd[e.Ba()],g=c.Md[e.Ba()];c.properties[f]=g}else 3==a?c.type=e.Ba():4==a&&(c.Oe=e.ca)}var k=a("point-geometry");c.ja=g;g.b=["Unknown","Point","LineString","Polygon"];g.prototype.Lg=function(){var a=this.pc;a.ca=this.Oe;for(var c=a.Ba()+
a.ca,e=1,f=0,g=0,h=0,v=[],w;a.ca<c;)if(f||(f=a.Ba(),e=f&7,f=f>>3),f--,1===e||2===e)g+=a.Ad(),h+=a.Ad(),1===e&&(w&&v.push(w),w=[]),w.push(new k(g,h));else if(7===e)w&&w.push(w[0].clone());else throw Error("unknown command "+e);w&&v.push(w);return v};g.prototype.bbox=function(){var a=this.pc;a.ca=this.Oe;for(var c=a.Ba()+a.ca,e=1,f=0,g=0,h=0,k=Infinity,w=-Infinity,A=Infinity,B=-Infinity;a.ca<c;)if(f||(f=a.Ba(),e=f&7,f=f>>3),f--,1===e||2===e)g+=a.Ad(),h+=a.Ad(),g<k&&(k=g),g>w&&(w=g),h<A&&(A=h),h>B&&
(B=h);else if(7!==e)throw Error("unknown command "+e);return[k,A,w,B]}},{"point-geometry":5}],4:[function(a,c){function g(a,c){this.version=1;this.name=null;this.extent=4096;this.length=0;this.pc=a;this.Kd=[];this.Md=[];this.Jd=[];a.Cf(h,this,c);this.length=this.Jd.length}function h(a,c,e){15===a?c.version=e.Ba():1===a?c.name=e.Hf():5===a?c.extent=e.Ba():2===a?c.Jd.push(e.ca):3===a?c.Kd.push(e.Hf()):4===a&&c.Md.push(k(e))}function k(a){for(var c=null,e=a.Ba()+a.ca;a.ca<e;)c=a.Ba()>>3,c=1===c?a.Hf():
2===c?a.Rn():3===c?a.Nn():4===c?a.bo():5===c?a.Ba():6===c?a.Ad():7===c?a.Ln():null;return c}var m=a("./vectortilefeature.js");c.ja=g;g.prototype.feature=function(a){if(0>a||a>=this.Jd.length)throw Error("feature index out of bounds");this.pc.ca=this.Jd[a];a=this.pc.Ba()+this.pc.ca;return new m(this.pc,a,this.extent,this.Kd,this.Md)}},{"./vectortilefeature.js":3}],5:[function(a,c){function g(a,c){this.x=a;this.y=c}c.ja=g;g.prototype={clone:function(){return new g(this.x,this.y)},rotate:function(a){return this.clone().Yi(a)},
round:function(){return this.clone().Zi()},angle:function(){return Math.atan2(this.y,this.x)},Yi:function(a){var c=Math.cos(a);a=Math.sin(a);var e=a*this.x+c*this.y;this.x=c*this.x-a*this.y;this.y=e;return this},Zi:function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this}};g.b=function(a){return a instanceof g?a:Array.isArray(a)?new g(a[0],a[1]):a}},{}]},{},[1])(1)});Um=c.ja})();function ht(a){this.defaultDataProjection=null;a=a?a:{};this.defaultDataProjection=new nd({code:"",units:"tile-pixels"});this.b=a.featureClass?a.featureClass:Bl;this.g=a.geometryName?a.geometryName:"geometry";this.a=a.layerName?a.layerName:"layer";this.f=a.layers?a.layers:null}y(ht,dp);ht.prototype.W=function(){return"arraybuffer"};
ht.prototype.Ea=function(a,c){var d=this.f,e=new Tm(a),e=new Um.Mi(e),f=[],g=this.b,h,k,m;for(m in e.layers)if(!d||-1!=d.indexOf(m)){h=e.layers[m];for(var n=0,p=h.length;n<p;++n){if(g===Bl){var q=h.feature(n);k=m;var r=q.Lg(),t=[],v=[];it(r,v,t);var w=q.type,A=void 0;1===w?A=1===r.length?"Point":"MultiPoint":2===w?A=1===r.length?"LineString":"MultiLineString":3===w&&(A="Polygon");q=q.properties;q[this.a]=k;k=new this.b(A,v,t,q)}else{q=h.feature(n);A=m;v=c;k=new this.b;t=q.properties;t[this.a]=A;A=
q.type;if(0===A)A=null;else{q=q.Lg();r=[];w=[];it(q,w,r);var B=void 0;1===A?B=1===q.length?new E(null):new pp(null):2===A?1===q.length?B=new T(null):B=new U(null):3===A&&(B=new F(null));B.ba("XY",w,r);A=B}(v=gp(A,!1,fp(this,v)))&&(t[this.g]=v);k.C(t);k.Bc(this.g)}f.push(k)}}return f};ht.prototype.Qa=function(){return this.defaultDataProjection};ht.prototype.c=function(a){this.f=a};
function it(a,c,d){for(var e=0,f=0,g=a.length;f<g;++f){var h=a[f],k,m;k=0;for(m=h.length;k<m;++k){var n=h[k];c.push(n.x,n.y)}e+=2*k;d.push(e)}};function jt(){this.defaultDataProjection=null;this.defaultDataProjection=qd("EPSG:4326")}y(jt,Ip);function kt(a,c){c[c.length-1].Ed[a.getAttribute("k")]=a.getAttribute("v")}
var lt=[null],mt=Q(lt,{nd:function(a,c){c[c.length-1].Qc.push(a.getAttribute("ref"))},tag:kt}),ot=Q(lt,{node:function(a,c){var d=c[0],e=c[c.length-1],f=a.getAttribute("id"),g=[parseFloat(a.getAttribute("lon")),parseFloat(a.getAttribute("lat"))];e.Og[f]=g;var h=R({Ed:{}},nt,a,c);pb(h.Ed)||(g=new E(g),gp(g,!1,d),d=new Xl(g),d.jc(f),d.C(h.Ed),e.features.push(d))},way:function(a,c){for(var d=c[0],e=a.getAttribute("id"),f=R({Qc:[],Ed:{}},mt,a,c),g=c[c.length-1],h=[],k=0,m=f.Qc.length;k<m;k++)Xa(h,g.Og[f.Qc[k]]);
f.Qc[0]==f.Qc[f.Qc.length-1]?(k=new F(null),k.ba("XY",h,[h.length])):(k=new T(null),k.ba("XY",h));gp(k,!1,d);d=new Xl(k);d.jc(e);d.C(f.Ed);g.features.push(d)}}),nt=Q(lt,{tag:kt});jt.prototype.ic=function(a,c){var d=ep(this,a,c);return"osm"==a.localName&&(d=R({Og:{},features:[]},ot,a,[d]),d.features)?d.features:[]};function pt(a){return a.getAttributeNS("http://www.w3.org/1999/xlink","href")};function qt(){}qt.prototype.read=function(a){return pm(a)?this.a(a):sm(a)?this.b(a):"string"===typeof a?(a=Cm(a),this.a(a)):null};function rt(){}y(rt,qt);rt.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(1==a.nodeType)return this.b(a);return null};rt.prototype.b=function(a){return(a=R({},st,a,[]))?a:null};
var tt=[null,"http://www.opengis.net/ows/1.1"],st=Q(tt,{ServiceIdentification:M(function(a,c){return R({},ut,a,c)}),ServiceProvider:M(function(a,c){return R({},vt,a,c)}),OperationsMetadata:M(function(a,c){return R({},wt,a,c)})}),xt=Q(tt,{DeliveryPoint:M(W),City:M(W),AdministrativeArea:M(W),PostalCode:M(W),Country:M(W),ElectronicMailAddress:M(W)}),yt=Q(tt,{Value:Gm(function(a){return W(a)})}),zt=Q(tt,{AllowedValues:M(function(a,c){return R({},yt,a,c)})}),Bt=Q(tt,{Phone:M(function(a,c){return R({},
At,a,c)}),Address:M(function(a,c){return R({},xt,a,c)})}),Dt=Q(tt,{HTTP:M(function(a,c){return R({},Ct,a,c)})}),Ct=Q(tt,{Get:Gm(function(a,c){var d=pt(a);return d?R({href:d},Et,a,c):void 0}),Post:void 0}),Ft=Q(tt,{DCP:M(function(a,c){return R({},Dt,a,c)})}),wt=Q(tt,{Operation:function(a,c){var d=a.getAttribute("name"),e=R({},Ft,a,c);e&&(c[c.length-1][d]=e)}}),At=Q(tt,{Voice:M(W),Facsimile:M(W)}),Et=Q(tt,{Constraint:Gm(function(a,c){var d=a.getAttribute("name");return d?R({name:d},zt,a,c):void 0})}),
Gt=Q(tt,{IndividualName:M(W),PositionName:M(W),ContactInfo:M(function(a,c){return R({},Bt,a,c)})}),ut=Q(tt,{Title:M(W),ServiceTypeVersion:M(W),ServiceType:M(W)}),vt=Q(tt,{ProviderName:M(W),ProviderSite:M(pt),ServiceContact:M(function(a,c){return R({},Gt,a,c)})});function Ht(a,c,d,e){var f;void 0!==e?f=e:f=[];for(var g=e=0;g<c;){var h=a[g++];f[e++]=a[g++];f[e++]=h;for(h=2;h<d;++h)f[e++]=a[g++]}f.length=e};function It(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=qd("EPSG:4326");this.b=a.factor?a.factor:1E5;this.a=a.geometryLayout?a.geometryLayout:"XY"}y(It,Oq);function Jt(a,c,d){var e,f=Array(c);for(e=0;e<c;++e)f[e]=0;var g,h;g=0;for(h=a.length;g<h;)for(e=0;e<c;++e,++g){var k=a[g],m=k-f[e];f[e]=k;a[g]=m}return Kt(a,d?d:1E5)}
function Lt(a,c,d){var e,f=Array(c);for(e=0;e<c;++e)f[e]=0;a=Mt(a,d?d:1E5);var g;d=0;for(g=a.length;d<g;)for(e=0;e<c;++e,++d)f[e]+=a[d],a[d]=f[e];return a}function Kt(a,c){var d=c?c:1E5,e,f;e=0;for(f=a.length;e<f;++e)a[e]=Math.round(a[e]*d);d=0;for(e=a.length;d<e;++d)f=a[d],a[d]=0>f?~(f<<1):f<<1;d="";e=0;for(f=a.length;e<f;++e){for(var g=a[e],h=void 0,k="";32<=g;)h=(32|g&31)+63,k+=String.fromCharCode(h),g>>=5;h=g+63;k+=String.fromCharCode(h);d+=k}return d}
function Mt(a,c){var d=c?c:1E5,e=[],f=0,g=0,h,k;h=0;for(k=a.length;h<k;++h){var m=a.charCodeAt(h)-63,f=f|(m&31)<<g;32>m?(e.push(f),g=f=0):g+=5}f=0;for(g=e.length;f<g;++f)h=e[f],e[f]=h&1?~(h>>1):h>>1;f=0;for(g=e.length;f<g;++f)e[f]/=d;return e}l=It.prototype;l.xd=function(a,c){var d=this.zd(a,c);return new Xl(d)};l.Bf=function(a,c){return[this.xd(a,c)]};l.zd=function(a,c){var d=Pd(this.a),e=Lt(a,d,this.b);Ht(e,e.length,d,e);d=be(e,0,e.length,d);return gp(new T(d,this.a),!1,fp(this,c))};
l.He=function(a,c){var d=a.X();return d?this.Gd(d,c):""};l.ii=function(a,c){return this.He(a[0],c)};l.Gd=function(a,c){a=gp(a,!0,fp(this,c));var d=a.ha(),e=a.qa();Ht(d,d.length,e,d);return Jt(d,e,this.b)};function Nt(a){a=a?a:{};this.defaultDataProjection=null;this.defaultDataProjection=qd(a.defaultDataProjection?a.defaultDataProjection:"EPSG:4326")}y(Nt,jp);function Ot(a,c){var d=[],e,f,g,h;g=0;for(h=a.length;g<h;++g)e=a[g],0<g&&d.pop(),0<=e?f=c[e]:f=c[~e].slice().reverse(),d.push.apply(d,f);e=0;for(f=d.length;e<f;++e)d[e]=d[e].slice();return d}function Pt(a,c,d,e,f){a=a.geometries;var g=[],h,k;h=0;for(k=a.length;h<k;++h)g[h]=Qt(a[h],c,d,e,f);return g}
function Qt(a,c,d,e,f){var g=a.type,h=Rt[g];c="Point"===g||"MultiPoint"===g?h(a,d,e):h(a,c);d=new Xl;d.Pa(gp(c,!1,f));void 0!==a.id&&d.jc(a.id);a.properties&&d.C(a.properties);return d}
Nt.prototype.Af=function(a,c){if("Topology"==a.type){var d,e=null,f=null;a.transform&&(d=a.transform,e=d.scale,f=d.translate);var g=a.arcs;if(d){d=e;var h=f,k,m;k=0;for(m=g.length;k<m;++k)for(var n=g[k],p=d,q=h,r=0,t=0,v=void 0,w=void 0,A=void 0,w=0,A=n.length;w<A;++w)v=n[w],r+=v[0],t+=v[1],v[0]=r,v[1]=t,St(v,p,q)}d=[];h=ob(a.objects);k=0;for(m=h.length;k<m;++k)"GeometryCollection"===h[k].type?(n=h[k],d.push.apply(d,Pt(n,g,e,f,c))):(n=h[k],d.push(Qt(n,g,e,f,c)));return d}return[]};
function St(a,c,d){a[0]=a[0]*c[0]+d[0];a[1]=a[1]*c[1]+d[1]}Nt.prototype.Qa=function(){return this.defaultDataProjection};
var Rt={Point:function(a,c,d){a=a.coordinates;c&&d&&St(a,c,d);return new E(a)},LineString:function(a,c){var d=Ot(a.arcs,c);return new T(d)},Polygon:function(a,c){var d=[],e,f;e=0;for(f=a.arcs.length;e<f;++e)d[e]=Ot(a.arcs[e],c);return new F(d)},MultiPoint:function(a,c,d){a=a.coordinates;var e,f;if(c&&d)for(e=0,f=a.length;e<f;++e)St(a[e],c,d);return new pp(a)},MultiLineString:function(a,c){var d=[],e,f;e=0;for(f=a.arcs.length;e<f;++e)d[e]=Ot(a.arcs[e],c);return new U(d)},MultiPolygon:function(a,c){var d=
[],e,f,g,h,k,m;k=0;for(m=a.arcs.length;k<m;++k){e=a.arcs[k];f=[];g=0;for(h=e.length;g<h;++g)f[g]=Ot(e[g],c);d[k]=f}return new V(d)}};function Tt(a){a=a?a:{};this.c=a.featureType;this.g=a.featureNS;this.b=a.gmlFormat?a.gmlFormat:new Zp;this.f=a.schemaLocation?a.schemaLocation:"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd";this.defaultDataProjection=null}y(Tt,Ip);Tt.prototype.ic=function(a,c){var d={featureType:this.c,featureNS:this.g};mb(d,ep(this,a,c?c:{}));d=[d];this.b.b["http://www.opengis.net/gml"].featureMember=Em(Lp.prototype.yd);(d=R([],this.b.b,a,d,this.b))||(d=[]);return d};
Tt.prototype.j=function(a){if(pm(a))return Ut(a);if(sm(a))return R({},Vt,a,[]);if("string"===typeof a)return a=Cm(a),Ut(a)};Tt.prototype.i=function(a){if(pm(a))return Wt(this,a);if(sm(a))return Xt(this,a);if("string"===typeof a)return a=Cm(a),Wt(this,a)};function Wt(a,c){for(var d=c.firstChild;d;d=d.nextSibling)if(1==d.nodeType)return Xt(a,d)}var Yt={"http://www.opengis.net/gml":{boundedBy:M(Lp.prototype.ze,"bounds")}};
function Xt(a,c){var d={},e=Tp(c.getAttribute("numberOfFeatures"));d.numberOfFeatures=e;return R(d,Yt,c,[],a.b)}
var Zt={"http://www.opengis.net/wfs":{totalInserted:M(Sp),totalUpdated:M(Sp),totalDeleted:M(Sp)}},$t={"http://www.opengis.net/ogc":{FeatureId:Em(function(a){return a.getAttribute("fid")})}},au={"http://www.opengis.net/wfs":{Feature:function(a,c){Mm($t,a,c)}}},Vt={"http://www.opengis.net/wfs":{TransactionSummary:M(function(a,c){return R({},Zt,a,c)},"transactionSummary"),InsertResults:M(function(a,c){return R([],au,a,c)},"insertIds")}};
function Ut(a){for(a=a.firstChild;a;a=a.nextSibling)if(1==a.nodeType)return R({},Vt,a,[])}var bu={"http://www.opengis.net/wfs":{PropertyName:N(Vp)}};function cu(a,c){var d=hm("http://www.opengis.net/ogc","Filter"),e=hm("http://www.opengis.net/ogc","FeatureId");d.appendChild(e);e.setAttribute("fid",c);a.appendChild(d)}
var du={"http://www.opengis.net/wfs":{Insert:N(function(a,c,d){var e=d[d.length-1],e=hm(e.featureNS,e.featureType);a.appendChild(e);Zp.prototype.hi(e,c,d)}),Update:N(function(a,c,d){var e=d[d.length-1],f=e.featureType,g=e.featurePrefix,g=g?g:"feature",h=e.featureNS;a.setAttribute("typeName",g+":"+f);Bm(a,"http://www.w3.org/2000/xmlns/","xmlns:"+g,h);f=c.Sa();if(void 0!==f){for(var g=c.O(),h=[],k=0,m=g.length;k<m;k++){var n=c.get(g[k]);void 0!==n&&h.push({name:g[k],value:n})}Nm({node:a,srsName:e.srsName},
du,Im("Property"),h,d);cu(a,f)}}),Delete:N(function(a,c,d){var e=d[d.length-1];d=e.featureType;var f=e.featurePrefix,f=f?f:"feature",e=e.featureNS;a.setAttribute("typeName",f+":"+d);Bm(a,"http://www.w3.org/2000/xmlns/","xmlns:"+f,e);c=c.Sa();void 0!==c&&cu(a,c)}),Property:N(function(a,c,d){var e=hm("http://www.opengis.net/wfs","Name");a.appendChild(e);Vp(e,c.name);void 0!==c.value&&null!==c.value&&(e=hm("http://www.opengis.net/wfs","Value"),a.appendChild(e),c.value instanceof Md?Zp.prototype.Je(e,
c.value,d):Vp(e,c.value))}),Native:N(function(a,c){c.Lo&&a.setAttribute("vendorId",c.Lo);void 0!==c.po&&a.setAttribute("safeToIgnore",c.po);void 0!==c.value&&Vp(a,c.value)})}},eu={"http://www.opengis.net/wfs":{Query:N(function(a,c,d){var e=d[d.length-1],f=e.featurePrefix,g=e.featureNS,h=e.propertyNames,k=e.srsName;a.setAttribute("typeName",(f?f+":":"")+c);k&&a.setAttribute("srsName",k);g&&Bm(a,"http://www.w3.org/2000/xmlns/","xmlns:"+f,g);c=mb({},e);c.node=a;Nm(c,bu,Im("PropertyName"),h,d);if(e=e.bbox)h=
hm("http://www.opengis.net/ogc","Filter"),c=d[d.length-1].geometryName,f=hm("http://www.opengis.net/ogc","BBOX"),h.appendChild(f),g=hm("http://www.opengis.net/ogc","PropertyName"),Vp(g,c),f.appendChild(g),Zp.prototype.Je(f,e,d),a.appendChild(h)})}};
Tt.prototype.l=function(a){var c=hm("http://www.opengis.net/wfs","GetFeature");c.setAttribute("service","WFS");c.setAttribute("version","1.1.0");a&&(a.handle&&c.setAttribute("handle",a.handle),a.outputFormat&&c.setAttribute("outputFormat",a.outputFormat),void 0!==a.maxFeatures&&c.setAttribute("maxFeatures",a.maxFeatures),a.resultType&&c.setAttribute("resultType",a.resultType),void 0!==a.startIndex&&c.setAttribute("startIndex",a.startIndex),void 0!==a.count&&c.setAttribute("count",a.count));Bm(c,"http://www.w3.org/2001/XMLSchema-instance",
"xsi:schemaLocation",this.f);var d=a.featureTypes;a=[{node:c,srsName:a.srsName,featureNS:a.featureNS?a.featureNS:this.g,featurePrefix:a.featurePrefix,geometryName:a.geometryName,bbox:a.bbox,propertyNames:a.propertyNames?a.propertyNames:[]}];var e=mb({},a[a.length-1]);e.node=c;Nm(e,eu,Im("Query"),d,a);return c};
Tt.prototype.A=function(a,c,d,e){var f=[],g=hm("http://www.opengis.net/wfs","Transaction");g.setAttribute("service","WFS");g.setAttribute("version","1.1.0");var h,k;e&&(h=e.gmlOptions?e.gmlOptions:{},e.handle&&g.setAttribute("handle",e.handle));Bm(g,"http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation",this.f);a&&(k={node:g,featureNS:e.featureNS,featureType:e.featureType,featurePrefix:e.featurePrefix},mb(k,h),Nm(k,du,Im("Insert"),a,f));c&&(k={node:g,featureNS:e.featureNS,featureType:e.featureType,
featurePrefix:e.featurePrefix},mb(k,h),Nm(k,du,Im("Update"),c,f));d&&Nm({node:g,featureNS:e.featureNS,featureType:e.featureType,featurePrefix:e.featurePrefix},du,Im("Delete"),d,f);e.nativeElements&&Nm({node:g,featureNS:e.featureNS,featureType:e.featureType,featurePrefix:e.featurePrefix},du,Im("Native"),e.nativeElements,f);return g};Tt.prototype.Gf=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(1==a.nodeType)return this.Ce(a);return null};
Tt.prototype.Ce=function(a){if(a.firstElementChild&&a.firstElementChild.firstElementChild)for(a=a.firstElementChild.firstElementChild,a=a.firstElementChild;a;a=a.nextElementSibling)if(0!==a.childNodes.length&&(1!==a.childNodes.length||3!==a.firstChild.nodeType)){var c=[{}];this.b.ze(a,c);return qd(c.pop().srsName)}return null};function fu(a){a=a?a:{};this.defaultDataProjection=null;this.b=void 0!==a.splitCollection?a.splitCollection:!1}y(fu,Oq);function gu(a){a=a.Y();return 0===a.length?"":a[0]+" "+a[1]}function hu(a){a=a.Y();for(var c=[],d=0,e=a.length;d<e;++d)c.push(a[d][0]+" "+a[d][1]);return c.join(",")}function iu(a){var c=[];a=a.Vd();for(var d=0,e=a.length;d<e;++d)c.push("("+hu(a[d])+")");return c.join(",")}function ju(a){var c=a.W();a=(0,ku[c])(a);c=c.toUpperCase();return 0===a.length?c+" EMPTY":c+"("+a+")"}
var ku={Point:gu,LineString:hu,Polygon:iu,MultiPoint:function(a){var c=[];a=a.le();for(var d=0,e=a.length;d<e;++d)c.push("("+gu(a[d])+")");return c.join(",")},MultiLineString:function(a){var c=[];a=a.rd();for(var d=0,e=a.length;d<e;++d)c.push("("+hu(a[d])+")");return c.join(",")},MultiPolygon:function(a){var c=[];a=a.Xd();for(var d=0,e=a.length;d<e;++d)c.push("("+iu(a[d])+")");return c.join(",")},GeometryCollection:function(a){var c=[];a=a.vg();for(var d=0,e=a.length;d<e;++d)c.push(ju(a[d]));return c.join(",")}};
l=fu.prototype;l.xd=function(a,c){var d=this.zd(a,c);if(d){var e=new Xl;e.Pa(d);return e}return null};l.Bf=function(a,c){var d=[],e=this.zd(a,c);this.b&&"GeometryCollection"==e.W()?d=e.i:d=[e];for(var f=[],g=0,h=d.length;g<h;++g)e=new Xl,e.Pa(d[g]),f.push(e);return f};l.zd=function(a,c){var d;d=new lu(new mu(a));d.b=nu(d.a);return(d=ou(d))?gp(d,!1,c):null};l.He=function(a,c){var d=a.X();return d?this.Gd(d,c):""};
l.ii=function(a,c){if(1==a.length)return this.He(a[0],c);for(var d=[],e=0,f=a.length;e<f;++e)d.push(a[e].X());d=new zp(d);return this.Gd(d,c)};l.Gd=function(a,c){return ju(gp(a,!0,c))};function mu(a){this.a=a;this.b=-1}function pu(a,c){return"0"<=a&&"9">=a||"."==a&&!(void 0!==c&&c)}
function nu(a){var c=a.a.charAt(++a.b),d={position:a.b,value:c};if("("==c)d.type=2;else if(","==c)d.type=5;else if(")"==c)d.type=3;else if(pu(c)||"-"==c){d.type=4;var e,c=a.b,f=!1,g=!1;do{if("."==e)f=!0;else if("e"==e||"E"==e)g=!0;e=a.a.charAt(++a.b)}while(pu(e,f)||!g&&("e"==e||"E"==e)||g&&("-"==e||"+"==e));a=parseFloat(a.a.substring(c,a.b--));d.value=a}else if("a"<=c&&"z">=c||"A"<=c&&"Z">=c){d.type=1;c=a.b;do e=a.a.charAt(++a.b);while("a"<=e&&"z">=e||"A"<=e&&"Z">=e);a=a.a.substring(c,a.b--).toUpperCase();
d.value=a}else{if(" "==c||"\t"==c||"\r"==c||"\n"==c)return nu(a);if(""===c)d.type=6;else throw Error("Unexpected character: "+c);}return d}function lu(a){this.a=a}l=lu.prototype;l.match=function(a){if(a=this.b.type==a)this.b=nu(this.a);return a};
function ou(a){var c=a.b;if(a.match(1)){var d=c.value;if("GEOMETRYCOLLECTION"==d){a:{if(a.match(2)){c=[];do c.push(ou(a));while(a.match(5));if(a.match(3)){a=c;break a}}else if(qu(a)){a=[];break a}throw Error(ru(a));}return new zp(a)}var e=su[d],c=tu[d];if(!e||!c)throw Error("Invalid geometry type: "+d);a=e.call(a);return new c(a)}throw Error(ru(a));}l.vf=function(){if(this.match(2)){var a=uu(this);if(this.match(3))return a}else if(qu(this))return null;throw Error(ru(this));};
l.uf=function(){if(this.match(2)){var a=vu(this);if(this.match(3))return a}else if(qu(this))return[];throw Error(ru(this));};l.wf=function(){if(this.match(2)){var a=wu(this);if(this.match(3))return a}else if(qu(this))return[];throw Error(ru(this));};l.yn=function(){if(this.match(2)){var a;if(2==this.b.type)for(a=[this.vf()];this.match(5);)a.push(this.vf());else a=vu(this);if(this.match(3))return a}else if(qu(this))return[];throw Error(ru(this));};
l.xn=function(){if(this.match(2)){var a=wu(this);if(this.match(3))return a}else if(qu(this))return[];throw Error(ru(this));};l.zn=function(){if(this.match(2)){for(var a=[this.wf()];this.match(5);)a.push(this.wf());if(this.match(3))return a}else if(qu(this))return[];throw Error(ru(this));};function uu(a){for(var c=[],d=0;2>d;++d){var e=a.b;if(a.match(4))c.push(e.value);else break}if(2==c.length)return c;throw Error(ru(a));}function vu(a){for(var c=[uu(a)];a.match(5);)c.push(uu(a));return c}
function wu(a){for(var c=[a.uf()];a.match(5);)c.push(a.uf());return c}function qu(a){var c=1==a.b.type&&"EMPTY"==a.b.value;c&&(a.b=nu(a.a));return c}function ru(a){return"Unexpected `"+a.b.value+"` at position "+a.b.position+" in `"+a.a.a+"`"}var tu={POINT:E,LINESTRING:T,POLYGON:F,MULTIPOINT:pp,MULTILINESTRING:U,MULTIPOLYGON:V},su={POINT:lu.prototype.vf,LINESTRING:lu.prototype.uf,POLYGON:lu.prototype.wf,MULTIPOINT:lu.prototype.yn,MULTILINESTRING:lu.prototype.xn,MULTIPOLYGON:lu.prototype.zn};function xu(){this.version=void 0}y(xu,qt);xu.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(1==a.nodeType)return this.b(a);return null};xu.prototype.b=function(a){this.version=a.getAttribute("version").trim();return(a=R({version:this.version},yu,a,[]))?a:null};function zu(a,c){return R({},Au,a,c)}function Bu(a,c){return R({},Cu,a,c)}function Du(a,c){var d=zu(a,c);if(d){var e=[Tp(a.getAttribute("width")),Tp(a.getAttribute("height"))];d.size=e;return d}}
function Eu(a,c){return R([],Fu,a,c)}
var Gu=[null,"http://www.opengis.net/wms"],yu=Q(Gu,{Service:M(function(a,c){return R({},Hu,a,c)}),Capability:M(function(a,c){return R({},Iu,a,c)})}),Iu=Q(Gu,{Request:M(function(a,c){return R({},Ju,a,c)}),Exception:M(function(a,c){return R([],Ku,a,c)}),Layer:M(function(a,c){return R({},Lu,a,c)})}),Hu=Q(Gu,{Name:M(W),Title:M(W),Abstract:M(W),KeywordList:M(Eu),OnlineResource:M(pt),ContactInformation:M(function(a,c){return R({},Mu,a,c)}),Fees:M(W),AccessConstraints:M(W),LayerLimit:M(Sp),MaxWidth:M(Sp),
MaxHeight:M(Sp)}),Mu=Q(Gu,{ContactPersonPrimary:M(function(a,c){return R({},Nu,a,c)}),ContactPosition:M(W),ContactAddress:M(function(a,c){return R({},Ou,a,c)}),ContactVoiceTelephone:M(W),ContactFacsimileTelephone:M(W),ContactElectronicMailAddress:M(W)}),Nu=Q(Gu,{ContactPerson:M(W),ContactOrganization:M(W)}),Ou=Q(Gu,{AddressType:M(W),Address:M(W),City:M(W),StateOrProvince:M(W),PostCode:M(W),Country:M(W)}),Ku=Q(Gu,{Format:Em(W)}),Lu=Q(Gu,{Name:M(W),Title:M(W),Abstract:M(W),KeywordList:M(Eu),CRS:Gm(W),
EX_GeographicBoundingBox:M(function(a,c){var d=R({},Pu,a,c);if(d){var e=d.westBoundLongitude,f=d.southBoundLatitude,g=d.eastBoundLongitude,d=d.northBoundLatitude;return void 0===e||void 0===f||void 0===g||void 0===d?void 0:[e,f,g,d]}}),BoundingBox:Gm(function(a){var c=[Rp(a.getAttribute("minx")),Rp(a.getAttribute("miny")),Rp(a.getAttribute("maxx")),Rp(a.getAttribute("maxy"))],d=[Rp(a.getAttribute("resx")),Rp(a.getAttribute("resy"))];return{crs:a.getAttribute("CRS"),extent:c,res:d}}),Dimension:Gm(function(a){return{name:a.getAttribute("name"),
units:a.getAttribute("units"),unitSymbol:a.getAttribute("unitSymbol"),"default":a.getAttribute("default"),multipleValues:Op(a.getAttribute("multipleValues")),nearestValue:Op(a.getAttribute("nearestValue")),current:Op(a.getAttribute("current")),values:W(a)}}),Attribution:M(function(a,c){return R({},Qu,a,c)}),AuthorityURL:Gm(function(a,c){var d=zu(a,c);if(d)return d.name=a.getAttribute("name"),d}),Identifier:Gm(W),MetadataURL:Gm(function(a,c){var d=zu(a,c);if(d)return d.type=a.getAttribute("type"),
d}),DataURL:Gm(zu),FeatureListURL:Gm(zu),Style:Gm(function(a,c){return R({},Ru,a,c)}),MinScaleDenominator:M(Qp),MaxScaleDenominator:M(Qp),Layer:Gm(function(a,c){var d=c[c.length-1],e=R({},Lu,a,c);if(e){var f=Op(a.getAttribute("queryable"));void 0===f&&(f=d.queryable);e.queryable=void 0!==f?f:!1;f=Tp(a.getAttribute("cascaded"));void 0===f&&(f=d.cascaded);e.cascaded=f;f=Op(a.getAttribute("opaque"));void 0===f&&(f=d.opaque);e.opaque=void 0!==f?f:!1;f=Op(a.getAttribute("noSubsets"));void 0===f&&(f=d.noSubsets);
e.noSubsets=void 0!==f?f:!1;(f=Rp(a.getAttribute("fixedWidth")))||(f=d.fixedWidth);e.fixedWidth=f;(f=Rp(a.getAttribute("fixedHeight")))||(f=d.fixedHeight);e.fixedHeight=f;["Style","CRS","AuthorityURL"].forEach(function(a){a in d&&(e[a]=(e[a]||[]).concat(d[a]))});"EX_GeographicBoundingBox BoundingBox Dimension Attribution MinScaleDenominator MaxScaleDenominator".split(" ").forEach(function(a){a in e||(e[a]=d[a])});return e}})}),Qu=Q(Gu,{Title:M(W),OnlineResource:M(pt),LogoURL:M(Du)}),Pu=Q(Gu,{westBoundLongitude:M(Qp),
eastBoundLongitude:M(Qp),southBoundLatitude:M(Qp),northBoundLatitude:M(Qp)}),Ju=Q(Gu,{GetCapabilities:M(Bu),GetMap:M(Bu),GetFeatureInfo:M(Bu)}),Cu=Q(Gu,{Format:Gm(W),DCPType:Gm(function(a,c){return R({},Su,a,c)})}),Su=Q(Gu,{HTTP:M(function(a,c){return R({},Tu,a,c)})}),Tu=Q(Gu,{Get:M(zu),Post:M(zu)}),Ru=Q(Gu,{Name:M(W),Title:M(W),Abstract:M(W),LegendURL:Gm(Du),StyleSheetURL:M(zu),StyleURL:M(zu)}),Au=Q(Gu,{Format:M(W),OnlineResource:M(pt)}),Fu=Q(Gu,{Keyword:Em(W)});function Uu(a){a=a?a:{};this.g="http://mapserver.gis.umn.edu/mapserver";this.b=new Yp;this.f=a.layers?a.layers:null;this.defaultDataProjection=null}y(Uu,Ip);
Uu.prototype.ic=function(a,c){var d={featureType:this.featureType,featureNS:this.featureNS};c&&mb(d,ep(this,a,c));var e=[d];a.setAttribute("namespaceURI",this.g);var f=mm(a),d=[];if(0!==a.childNodes.length){if("msGMLOutput"==f)for(var g=0,h=a.childNodes.length;g<h;g++){var k=a.childNodes[g];if(1===k.nodeType){var m=e[0],n=k.localName.replace("_layer","");if(!this.f||Ua(this.f,n)){n=n+"_feature";m.featureType=n;m.featureNS=this.g;var p={};p[n]=Em(this.b.zf,this.b);m=Q([m.featureNS,null],p);k.setAttribute("namespaceURI",
this.g);(k=R([],m,k,e,this.b))&&Xa(d,k)}}}"FeatureCollection"==f&&(e=R([],this.b.b,a,[{}],this.b))&&(d=e)}return d};function Vu(){this.g=new rt}y(Vu,qt);Vu.prototype.a=function(a){for(a=a.firstChild;a;a=a.nextSibling)if(1==a.nodeType)return this.b(a);return null};Vu.prototype.b=function(a){this.version=a.getAttribute("version").trim();var c=this.g.b(a);if(!c)return null;c.version=this.version;return(c=R(c,Wu,a,[]))?c:null};function Xu(a){var c=W(a).split(" ");if(c&&2==c.length)return a=+c[0],c=+c[1],isNaN(a)||isNaN(c)?void 0:[a,c]}
var Yu=[null,"http://www.opengis.net/wmts/1.0"],Zu=[null,"http://www.opengis.net/ows/1.1"],Wu=Q(Yu,{Contents:M(function(a,c){return R({},$u,a,c)})}),$u=Q(Yu,{Layer:Gm(function(a,c){return R({},av,a,c)}),TileMatrixSet:Gm(function(a,c){return R({},bv,a,c)})}),av=Q(Yu,{Style:Gm(function(a,c){var d=R({},cv,a,c);if(d){var e="true"===a.getAttribute("isDefault");d.isDefault=e;return d}}),Format:Gm(W),TileMatrixSetLink:Gm(function(a,c){return R({},dv,a,c)}),Dimension:Gm(function(a,c){return R({},ev,a,c)}),
ResourceURL:Gm(function(a){var c=a.getAttribute("format"),d=a.getAttribute("template");a=a.getAttribute("resourceType");var e={};c&&(e.format=c);d&&(e.template=d);a&&(e.resourceType=a);return e})},Q(Zu,{Title:M(W),Abstract:M(W),WGS84BoundingBox:M(function(a,c){var d=R([],fv,a,c);return 2!=d.length?void 0:xc(d)}),Identifier:M(W)})),cv=Q(Yu,{LegendURL:Gm(function(a){var c={};c.format=a.getAttribute("format");c.href=pt(a);return c})},Q(Zu,{Title:M(W),Identifier:M(W)})),dv=Q(Yu,{TileMatrixSet:M(W)}),
ev=Q(Yu,{Default:M(W),Value:Gm(W)},Q(Zu,{Identifier:M(W)})),fv=Q(Zu,{LowerCorner:Em(Xu),UpperCorner:Em(Xu)}),bv=Q(Yu,{WellKnownScaleSet:M(W),TileMatrix:Gm(function(a,c){return R({},gv,a,c)})},Q(Zu,{SupportedCRS:M(W),Identifier:M(W)})),gv=Q(Yu,{TopLeftCorner:M(Xu),ScaleDenominator:M(Qp),TileWidth:M(Sp),TileHeight:M(Sp),MatrixWidth:M(Sp),MatrixHeight:M(Sp)},Q(Zu,{Identifier:M(W)}));function hv(a){Mb.call(this);a=a||{};this.a=null;this.c=Jd;this.f=void 0;D(this,Ob("projection"),this.pl,this);D(this,Ob("tracking"),this.ql,this);void 0!==a.projection&&this.Sg(qd(a.projection));void 0!==a.trackingOptions&&this.$h(a.trackingOptions);this.he(void 0!==a.tracking?a.tracking:!1)}y(hv,Mb);l=hv.prototype;l.fa=function(){this.he(!1);hv.ia.fa.call(this)};l.pl=function(){var a=this.Qg();a&&(this.c=ud(qd("EPSG:4326"),a),this.a&&this.set("position",this.c(this.a)))};
l.ql=function(){if(Dh){var a=this.Rg();a&&void 0===this.f?this.f=aa.navigator.geolocation.watchPosition(this.Gn.bind(this),this.Hn.bind(this),this.Cg()):a||void 0===this.f||(aa.navigator.geolocation.clearWatch(this.f),this.f=void 0)}};
l.Gn=function(a){a=a.coords;this.set("accuracy",a.accuracy);this.set("altitude",null===a.altitude?void 0:a.altitude);this.set("altitudeAccuracy",null===a.altitudeAccuracy?void 0:a.altitudeAccuracy);this.set("heading",null===a.heading?void 0:Qa(a.heading));this.a?(this.a[0]=a.longitude,this.a[1]=a.latitude):this.a=[a.longitude,a.latitude];var c=this.c(this.a);this.set("position",c);this.set("speed",null===a.speed?void 0:a.speed);a=te(qk,this.a,a.accuracy);a.Hc(this.c);this.set("accuracyGeometry",a);
this.u()};l.Hn=function(a){a.type="error";this.he(!1);this.b(a)};l.sj=function(){return this.get("accuracy")};l.tj=function(){return this.get("accuracyGeometry")||null};l.vj=function(){return this.get("altitude")};l.wj=function(){return this.get("altitudeAccuracy")};l.nl=function(){return this.get("heading")};l.ol=function(){return this.get("position")};l.Qg=function(){return this.get("projection")};l.ak=function(){return this.get("speed")};l.Rg=function(){return this.get("tracking")};l.Cg=function(){return this.get("trackingOptions")};
l.Sg=function(a){this.set("projection",a)};l.he=function(a){this.set("tracking",a)};l.$h=function(a){this.set("trackingOptions",a)};function iv(a,c,d){Od.call(this);this.Lf(a,c?c:0,d)}y(iv,Od);l=iv.prototype;l.clone=function(){var a=new iv(null),c=this.v.slice();Qd(a,this.f,c);a.u();return a};l.sb=function(a,c,d,e){var f=this.v;a-=f[0];var g=c-f[1];c=a*a+g*g;if(c<e){if(0===c)for(e=0;e<this.a;++e)d[e]=f[e];else for(e=this.nf()/Math.sqrt(c),d[0]=f[0]+e*a,d[1]=f[1]+e*g,e=2;e<this.a;++e)d[e]=f[e];d.length=this.a;return c}return e};l.xc=function(a,c){var d=this.v,e=a-d[0],d=c-d[1];return e*e+d*d<=jv(this)};
l.vd=function(){return this.v.slice(0,this.a)};l.Pd=function(a){var c=this.v,d=c[this.a]-c[0];return Ic(c[0]-d,c[1]-d,c[0]+d,c[1]+d,a)};l.nf=function(){return Math.sqrt(jv(this))};function jv(a){var c=a.v[a.a]-a.v[0];a=a.v[a.a+1]-a.v[1];return c*c+a*a}l.W=function(){return"Circle"};l.Ia=function(a){var c=this.G();return ad(a,c)?(c=this.vd(),a[0]<=c[0]&&a[2]>=c[0]||a[1]<=c[1]&&a[3]>=c[1]?!0:Oc(a,this.ig,this)):!1};
l.Kl=function(a){var c=this.a,d=this.v[c]-this.v[0],e=a.slice();e[c]=e[0]+d;for(d=1;d<c;++d)e[c+d]=a[d];Qd(this,this.f,e);this.u()};l.Lf=function(a,c,d){if(a){Rd(this,d,a,0);this.v||(this.v=[]);d=this.v;a=Zd(d,a);d[a++]=d[0]+c;var e;c=1;for(e=this.a;c<e;++c)d[a++]=d[c];d.length=a}else Qd(this,"XY",null);this.u()};l.Ll=function(a){this.v[this.a]=this.v[0]+a;this.u()};function kv(a,c,d){for(var e=[],f=a(0),g=a(1),h=c(f),k=c(g),m=[g,f],n=[k,h],p=[1,0],q={},r=1E5,t,v,w,A,B;0<--r&&0<p.length;)w=p.pop(),f=m.pop(),h=n.pop(),g=w.toString(),g in q||(e.push(h[0],h[1]),q[g]=!0),A=p.pop(),g=m.pop(),k=n.pop(),B=(w+A)/2,t=a(B),v=c(t),Na(v[0],v[1],h[0],h[1],k[0],k[1])<d?(e.push(k[0],k[1]),g=A.toString(),q[g]=!0):(p.push(A,B,B,w),n.push(k,v,v,h),m.push(g,t,t,f));return e}function lv(a,c,d,e,f){var g=qd("EPSG:4326");return kv(function(e){return[a,c+(d-c)*e]},Id(g,e),f)}
function mv(a,c,d,e,f){var g=qd("EPSG:4326");return kv(function(e){return[c+(d-c)*e,a]},Id(g,e),f)};function nv(a){a=a||{};this.c=this.l=null;this.g=this.i=Infinity;this.f=this.j=-Infinity;this.B=this.T=Infinity;this.D=this.J=-Infinity;this.ua=void 0!==a.targetSize?a.targetSize:100;this.H=void 0!==a.maxLines?a.maxLines:100;this.b=[];this.a=[];this.ta=void 0!==a.strokeStyle?a.strokeStyle:ov;this.A=this.o=void 0;this.s=null;this.setMap(void 0!==a.map?a.map:null)}var ov=new Gk({color:"rgba(0,0,0,0.2)"}),pv=[90,45,30,20,10,5,2,1,.5,.2,.1,.05,.01,.005,.002,.001];
function qv(a,c,d,e,f,g,h){var k=h;c=lv(c,d,e,a.c,f);k=void 0!==a.b[k]?a.b[k]:new T(null);k.ba("XY",c);ad(k.G(),g)&&(a.b[h++]=k);return h}function rv(a,c,d,e,f){var g=f;c=mv(c,a.f,a.g,a.c,d);g=void 0!==a.a[g]?a.a[g]:new T(null);g.ba("XY",c);ad(g.G(),e)&&(a.a[f++]=g);return f}l=nv.prototype;l.rl=function(){return this.l};l.Oj=function(){return this.b};l.Vj=function(){return this.a};
l.Hg=function(a){var c=a.vectorContext,d=a.frameState,e=d.extent;a=d.viewState;var f=a.center,g=a.projection,h=a.resolution;a=d.pixelRatio;a=h*h/(4*a*a);if(!this.c||!Hd(this.c,g)){var k=qd("EPSG:4326"),m=g.G(),n=g.i,p=Ld(n,k,g),q=n[2],r=n[1],t=n[0],v=p[3],w=p[2],A=p[1],p=p[0];this.i=n[3];this.g=q;this.j=r;this.f=t;this.T=v;this.B=w;this.J=A;this.D=p;this.o=Id(k,g);this.A=Id(g,k);this.s=this.A(Yc(m));this.c=g}k=0;g.b&&(g=g.G(),k=Wc(g),d=d.focus[0],d<g[0]||d>g[2])&&(k*=Math.ceil((g[0]-d)/k),e=[e[0]+
k,e[1],e[2]+k,e[3]]);d=this.s[0];g=this.s[1];k=-1;n=Math.pow(this.ua*h,2);q=[];r=[];h=0;for(m=pv.length;h<m;++h){t=pv[h]/2;q[0]=d-t;q[1]=g-t;r[0]=d+t;r[1]=g+t;this.o(q,q);this.o(r,r);t=Math.pow(r[0]-q[0],2)+Math.pow(r[1]-q[1],2);if(t<=n)break;k=pv[h]}h=k;if(-1==h)this.b.length=this.a.length=0;else{d=this.A(f);f=d[0];d=d[1];g=this.H;k=[Math.max(e[0],this.D),Math.max(e[1],this.J),Math.min(e[2],this.B),Math.min(e[3],this.T)];k=Ld(k,this.c,"EPSG:4326");n=k[3];r=k[1];f=Math.floor(f/h)*h;q=La(f,this.f,
this.g);m=qv(this,q,r,n,a,e,0);for(k=0;q!=this.f&&k++<g;)q=Math.max(q-h,this.f),m=qv(this,q,r,n,a,e,m);q=La(f,this.f,this.g);for(k=0;q!=this.g&&k++<g;)q=Math.min(q+h,this.g),m=qv(this,q,r,n,a,e,m);this.b.length=m;d=Math.floor(d/h)*h;f=La(d,this.j,this.i);m=rv(this,f,a,e,0);for(k=0;f!=this.j&&k++<g;)f=Math.max(f-h,this.j),m=rv(this,f,a,e,m);f=La(d,this.j,this.i);for(k=0;f!=this.i&&k++<g;)f=Math.min(f+h,this.i),m=rv(this,f,a,e,m);this.a.length=m}c.hb(null,this.ta);a=0;for(f=this.b.length;a<f;++a)h=
this.b[a],c.Xb(h,null);a=0;for(f=this.a.length;a<f;++a)h=this.a[a],c.Xb(h,null)};l.setMap=function(a){this.l&&(this.l.K("postcompose",this.Hg,this),this.l.render());a&&(a.I("postcompose",this.Hg,this),a.render());this.l=a};function sv(a,c,d,e,f,g,h){Hi.call(this,a,c,d,0,e);this.l=f;this.g=new Image;null!==g&&(this.g.crossOrigin=g);this.i={};this.c=null;this.state=0;this.j=h}y(sv,Hi);sv.prototype.a=function(a){if(void 0!==a){var c;a=x(a);if(a in this.i)return this.i[a];pb(this.i)?c=this.g:c=this.g.cloneNode(!1);return this.i[a]=c}return this.g};sv.prototype.s=function(){this.state=3;this.c.forEach(sb);this.c=null;Ii(this)};
sv.prototype.A=function(){void 0===this.resolution&&(this.resolution=Xc(this.extent)/this.g.height);this.state=2;this.c.forEach(sb);this.c=null;Ii(this)};sv.prototype.load=function(){0==this.state&&(this.state=1,Ii(this),this.c=[xb(this.g,"error",this.s,this),xb(this.g,"load",this.A,this)],this.j(this,this.l))};function tv(a,c,d,e,f){pg.call(this,a,c);this.l=d;this.g=new Image;null!==e&&(this.g.crossOrigin=e);this.c={};this.j=null;this.o=f}y(tv,pg);l=tv.prototype;l.fa=function(){1==this.state&&uv(this);this.a&&Db(this.a);tv.ia.fa.call(this)};l.cb=function(a){if(void 0!==a){var c=x(a);if(c in this.c)return this.c[c];a=pb(this.c)?this.g:this.g.cloneNode(!1);return this.c[c]=a}return this.g};l.eb=function(){return this.l};l.sl=function(){this.state=3;uv(this);qg(this)};
l.tl=function(){this.state=this.g.naturalWidth&&this.g.naturalHeight?2:4;uv(this);qg(this)};l.load=function(){0==this.state&&(this.state=1,qg(this),this.j=[xb(this.g,"error",this.sl,this),xb(this.g,"load",this.tl,this)],this.o(this,this.l))};function uv(a){a.j.forEach(sb);a.j=null};function vv(a){a=a?a:{};nj.call(this,{handleEvent:fd});this.c=a.formatConstructors?a.formatConstructors:[];this.o=a.projection?qd(a.projection):null;this.a=null;this.target=a.target?a.target:null}y(vv,nj);function wv(a){a=a.dataTransfer.files;var c,d,e;c=0;for(d=a.length;c<d;++c){e=a.item(c);var f=new FileReader;f.addEventListener("load",ra(this.l,e).bind(this));f.readAsText(e)}}function xv(a){a.stopPropagation();a.preventDefault();a.dataTransfer.dropEffect="copy"}
vv.prototype.l=function(a,c){var d=c.target.result,e=this.A,f=this.o;f||(f=e.$().i);var e=this.c,g=[],h,k;h=0;for(k=e.length;h<k;++h){var m=new e[h];var n={featureProjection:f};try{g=m.Ea(d,n)}catch(p){g=null}if(g&&0<g.length)break}this.b(new yv(zv,this,a,g,f))};vv.prototype.setMap=function(a){this.a&&(this.a.forEach(sb),this.a=null);vv.ia.setMap.call(this,a);a&&(a=this.target?this.target:a.a,this.a=[D(a,"drop",wv,this),D(a,"dragenter",xv,this),D(a,"dragover",xv,this),D(a,"drop",xv,this)])};
var zv="addfeatures";function yv(a,c,d,e,f){Eb.call(this,a,c);this.features=e;this.file=d;this.projection=f}y(yv,Eb);function Av(a,c){this.x=a;this.y=c}y(Av,wf);Av.prototype.clone=function(){return new Av(this.x,this.y)};Av.prototype.scale=wf.prototype.scale;Av.prototype.rotate=function(a){var c=Math.cos(a);a=Math.sin(a);var d=this.y*c+this.x*a;this.x=this.x*c-this.y*a;this.y=d;return this};function Bv(a){a=a?a:{};Bj.call(this,{handleDownEvent:Cv,handleDragEvent:Dv,handleUpEvent:Ev});this.s=a.condition?a.condition:yj;this.a=this.c=void 0;this.o=0;this.B=void 0!==a.duration?a.duration:400}y(Bv,Bj);
function Dv(a){if(Aj(a)){var c=a.map,d=c.Va();a=a.pixel;a=new Av(a[0]-d[0]/2,d[1]/2-a[1]);d=Math.atan2(a.y,a.x);a=Math.sqrt(a.x*a.x+a.y*a.y);var e=c.$();c.render();if(void 0!==this.c){var f=d-this.c;oj(c,e,e.Ka()-f)}this.c=d;void 0!==this.a&&(d=this.a*(e.Z()/a),qj(c,e,d));void 0!==this.a&&(this.o=this.a/a);this.a=a}}
function Ev(a){if(!Aj(a))return!0;a=a.map;var c=a.$();Be(c,-1);var d=this.o-1,e=c.Ka(),e=c.constrainRotation(e,0);oj(a,c,e,void 0,void 0);var e=c.Z(),f=this.B,e=c.constrainResolution(e,0,d);qj(a,c,e,void 0,f);this.o=0;return!1}function Cv(a){return Aj(a)&&this.s(a)?(Be(a.map.$(),1),this.a=this.c=void 0,!0):!1};function Fv(a,c){Eb.call(this,a);this.feature=c}y(Fv,Eb);
function Gv(a){Bj.call(this,{handleDownEvent:Hv,handleEvent:Iv,handleUpEvent:Jv});this.wa=null;this.U=!1;this.oc=a.source?a.source:null;this.Fb=a.features?a.features:null;this.aj=a.snapTolerance?a.snapTolerance:12;this.aa=a.type;this.c=Kv(this.aa);this.qb=a.minPoints?a.minPoints:this.c===Lv?3:2;this.ya=a.maxPoints?a.maxPoints:Infinity;var c=a.geometryFunction;if(!c)if("Circle"===this.aa)c=function(a,c){var d=c?c:new iv([NaN,NaN]);d.Lf(a[0],Math.sqrt(hc(a[0],a[1])));return d};else{var d,c=this.c;c===
Mv?d=E:c===Nv?d=T:c===Lv&&(d=F);c=function(a,c){var g=c;g?g.la(a):g=new d(a);return g}}this.D=c;this.S=this.B=this.a=this.H=this.o=this.s=null;this.jj=a.clickTolerance?a.clickTolerance*a.clickTolerance:36;this.na=new H({source:new bn({useSpatialIndex:!1,wrapX:a.wrapX?a.wrapX:!1}),style:a.style?a.style:Ov()});this.nc=a.geometryName;this.ti=a.condition?a.condition:xj;this.oa=a.freehandCondition?a.freehandCondition:yj;D(this,Ob("active"),this.ei,this)}y(Gv,Bj);
function Ov(){var a=Pk();return function(c){return a[c.X().W()]}}l=Gv.prototype;l.setMap=function(a){Gv.ia.setMap.call(this,a);this.ei()};function Iv(a){var c=!this.U;this.U&&a.type===zi?(Pv(this,a),c=!1):a.type===yi?c=Qv(this,a):a.type===si&&(c=!1);return Cj.call(this,a)&&c}function Hv(a){if(this.ti(a))return this.wa=a.pixel,!0;if(this.c!==Nv&&this.c!==Lv||!this.oa(a))return!1;this.wa=a.pixel;this.U=!0;this.s||Rv(this,a);return!0}
function Jv(a){this.U=!1;var c=this.wa,d=a.pixel,e=c[0]-d[0],c=c[1]-d[1],d=!0;e*e+c*c<=this.jj&&(Qv(this,a),this.s?this.c===Sv?this.md():Tv(this,a)?this.md():Pv(this,a):(Rv(this,a),this.c===Mv&&this.md()),d=!1);return d}
function Qv(a,c){if(a.s){var d=c.coordinate,e=a.o.X(),f;a.c===Mv?f=a.a:a.c===Lv?(f=a.a[0],f=f[f.length-1],Tv(a,c)&&(d=a.s.slice())):(f=a.a,f=f[f.length-1]);f[0]=d[0];f[1]=d[1];a.D(a.a,e);a.H&&a.H.X().la(d);e instanceof F&&a.c!==Lv?(a.B||(a.B=new Xl(new T(null))),e=e.xg(0),d=a.B.X(),d.ba(e.f,e.ha())):a.S&&(d=a.B.X(),d.la(a.S));Uv(a)}else d=c.coordinate.slice(),a.H?a.H.X().la(d):(a.H=new Xl(new E(d)),Uv(a));return!0}
function Tv(a,c){var d=!1;if(a.o){var e=!1,f=[a.s];a.c===Nv?e=a.a.length>a.qb:a.c===Lv&&(e=a.a[0].length>a.qb,f=[a.a[0][0],a.a[0][a.a[0].length-2]]);if(e)for(var e=c.map,g=0,h=f.length;g<h;g++){var k=f[g],m=e.Ta(k),n=c.pixel,d=n[0]-m[0],m=n[1]-m[1],n=a.U&&a.oa(c)?1:a.aj;if(d=Math.sqrt(d*d+m*m)<=n){a.s=k;break}}}return d}
function Rv(a,c){var d=c.coordinate;a.s=d;a.c===Mv?a.a=d.slice():a.c===Lv?(a.a=[[d.slice(),d.slice()]],a.S=a.a[0]):(a.a=[d.slice(),d.slice()],a.c===Sv&&(a.S=a.a));a.S&&(a.B=new Xl(new T(a.S)));d=a.D(a.a);a.o=new Xl;a.nc&&a.o.Bc(a.nc);a.o.Pa(d);Uv(a);a.b(new Fv("drawstart",a.o))}
function Pv(a,c){var d=c.coordinate,e=a.o.X(),f,g;if(a.c===Nv)a.s=d.slice(),g=a.a,g.push(d.slice()),f=g.length>a.ya,a.D(g,e);else if(a.c===Lv){g=a.a[0];g.push(d.slice());if(f=g.length>a.ya)a.s=g[0];a.D(a.a,e)}Uv(a);f&&a.md()}l.ho=function(){var a=this.o.X(),c,d;this.c===Nv?(c=this.a,c.splice(-2,1),this.D(c,a)):this.c===Lv&&(c=this.a[0],c.splice(-2,1),d=this.B.X(),d.la(c),this.D(this.a,a));0===c.length&&(this.s=null);Uv(this)};
l.md=function(){var a=Vv(this),c=this.a,d=a.X();this.c===Nv?(c.pop(),this.D(c,d)):this.c===Lv&&(c[0].pop(),c[0].push(c[0][0]),this.D(c,d));"MultiPoint"===this.aa?a.Pa(new pp([c])):"MultiLineString"===this.aa?a.Pa(new U([c])):"MultiPolygon"===this.aa&&a.Pa(new V([c]));this.b(new Fv("drawend",a));this.Fb&&this.Fb.push(a);this.oc&&this.oc.rb(a)};function Vv(a){a.s=null;var c=a.o;c&&(a.o=null,a.H=null,a.B=null,a.na.da().clear(!0));return c}
l.Sl=function(a){var c=a.X();this.o=a;this.a=c.Y();a=this.a[this.a.length-1];this.s=a.slice();this.a.push(a.slice());Uv(this);this.b(new Fv("drawstart",this.o))};l.Dc=ed;function Uv(a){var c=[];a.o&&c.push(a.o);a.B&&c.push(a.B);a.H&&c.push(a.H);a=a.na.da();a.clear(!0);a.Gc(c)}l.ei=function(){var a=this.A,c=this.f();a&&c||Vv(this);this.na.setMap(c?a:null)};
function Kv(a){var c;"Point"===a||"MultiPoint"===a?c=Mv:"LineString"===a||"MultiLineString"===a?c=Nv:"Polygon"===a||"MultiPolygon"===a?c=Lv:"Circle"===a&&(c=Sv);return c}var Mv="Point",Nv="LineString",Lv="Polygon",Sv="Circle";function Wv(a,c,d){Eb.call(this,a);this.features=c;this.mapBrowserPointerEvent=d}y(Wv,Eb);
function Xv(a){Bj.call(this,{handleDownEvent:Yv,handleDragEvent:Zv,handleEvent:$v,handleUpEvent:aw});this.ya=a.deleteCondition?a.deleteCondition:jd(xj,wj);this.oa=this.c=null;this.wa=[0,0];this.D=this.U=!1;this.a=new Wm;this.H=void 0!==a.pixelTolerance?a.pixelTolerance:10;this.s=this.na=!1;this.o=null;this.S=new H({source:new bn({useSpatialIndex:!1,wrapX:!!a.wrapX}),style:a.style?a.style:bw(),updateWhileAnimating:!0,updateWhileInteracting:!0});this.aa={Point:this.Zl,LineString:this.Zg,LinearRing:this.Zg,
Polygon:this.$l,MultiPoint:this.Xl,MultiLineString:this.Wl,MultiPolygon:this.Yl,GeometryCollection:this.Vl};this.B=a.features;this.B.forEach(this.pf,this);D(this.B,"add",this.Tl,this);D(this.B,"remove",this.Ul,this)}y(Xv,Bj);l=Xv.prototype;l.pf=function(a){var c=a.X();c.W()in this.aa&&this.aa[c.W()].call(this,a,c);(c=this.A)&&cw(this,this.wa,c);D(a,"change",this.Yg,this)};function dw(a,c){a.D||(a.D=!0,a.b(new Wv("modifystart",a.B,c)))}
function ew(a,c){fw(a,c);a.c&&0===a.B.ac()&&(a.S.da().nb(a.c),a.c=null);yb(c,"change",a.Yg,a)}function fw(a,c){var d=a.a,e=[];d.forEach(function(a){c===a.feature&&e.push(a)});for(var f=e.length-1;0<=f;--f)d.remove(e[f])}l.setMap=function(a){this.S.setMap(a);Xv.ia.setMap.call(this,a)};l.Tl=function(a){this.pf(a.element)};l.Yg=function(a){this.s||(a=a.target,ew(this,a),this.pf(a))};l.Ul=function(a){ew(this,a.element)};
l.Zl=function(a,c){var d=c.Y(),d={feature:a,geometry:c,ka:[d,d]};this.a.za(c.G(),d)};l.Xl=function(a,c){var d=c.Y(),e,f,g;f=0;for(g=d.length;f<g;++f)e=d[f],e={feature:a,geometry:c,depth:[f],index:f,ka:[e,e]},this.a.za(c.G(),e)};l.Zg=function(a,c){var d=c.Y(),e,f,g,h;e=0;for(f=d.length-1;e<f;++e)g=d.slice(e,e+2),h={feature:a,geometry:c,index:e,ka:g},this.a.za(xc(g),h)};
l.Wl=function(a,c){var d=c.Y(),e,f,g,h,k,m,n;h=0;for(k=d.length;h<k;++h)for(e=d[h],f=0,g=e.length-1;f<g;++f)m=e.slice(f,f+2),n={feature:a,geometry:c,depth:[h],index:f,ka:m},this.a.za(xc(m),n)};l.$l=function(a,c){var d=c.Y(),e,f,g,h,k,m,n;h=0;for(k=d.length;h<k;++h)for(e=d[h],f=0,g=e.length-1;f<g;++f)m=e.slice(f,f+2),n={feature:a,geometry:c,depth:[h],index:f,ka:m},this.a.za(xc(m),n)};
l.Yl=function(a,c){var d=c.Y(),e,f,g,h,k,m,n,p,q,r;m=0;for(n=d.length;m<n;++m)for(p=d[m],h=0,k=p.length;h<k;++h)for(e=p[h],f=0,g=e.length-1;f<g;++f)q=e.slice(f,f+2),r={feature:a,geometry:c,depth:[h,m],index:f,ka:q},this.a.za(xc(q),r)};l.Vl=function(a,c){var d,e=c.i;for(d=0;d<e.length;++d)this.aa[e[d].W()].call(this,a,e[d])};function gw(a,c){var d=a.c;d?d.X().la(c):(d=new Xl(new E(c)),a.c=d,a.S.da().rb(d))}function hw(a,c){return a.index-c.index}
function Yv(a){cw(this,a.pixel,a.map);this.o=[];this.D=!1;var c=this.c;if(c){var d=[],c=c.X().Y(),e=xc([c]),e=Zm(this.a,e),f={};e.sort(hw);for(var g=0,h=e.length;g<h;++g){var k=e[g],m=k.ka,n=x(k.feature),p=k.depth;p&&(n+="-"+p.join("-"));f[n]||(f[n]=Array(2));if(fc(m[0],c)&&!f[n][0])this.o.push([k,0]),f[n][0]=k;else if(fc(m[1],c)&&!f[n][1]){if("LineString"!==k.geometry.W()&&"MultiLineString"!==k.geometry.W()||!f[n][0]||0!==f[n][0].index)this.o.push([k,1]),f[n][1]=k}else x(m)in this.oa&&!f[n][0]&&
!f[n][1]&&d.push([k,c])}d.length&&dw(this,a);for(a=d.length-1;0<=a;--a)this.Rk.apply(this,d[a])}return!!this.c}
function Zv(a){this.U=!1;dw(this,a);a=a.coordinate;for(var c=0,d=this.o.length;c<d;++c){for(var e=this.o[c],f=e[0],g=f.depth,h=f.geometry,k=h.Y(),m=f.ka,e=e[1];a.length<h.qa();)a.push(0);switch(h.W()){case "Point":k=a;m[0]=m[1]=a;break;case "MultiPoint":k[f.index]=a;m[0]=m[1]=a;break;case "LineString":k[f.index+e]=a;m[e]=a;break;case "MultiLineString":k[g[0]][f.index+e]=a;m[e]=a;break;case "Polygon":k[g[0]][f.index+e]=a;m[e]=a;break;case "MultiPolygon":k[g[1]][g[0]][f.index+e]=a,m[e]=a}f=h;this.s=
!0;f.la(k);this.s=!1}gw(this,a)}function aw(a){for(var c,d=this.o.length-1;0<=d;--d)c=this.o[d][0],Xm(this.a,xc(c.ka),c);this.D&&(this.b(new Wv("modifyend",this.B,a)),this.D=!1);return!1}
function $v(a){if(!(a instanceof oi))return!0;var c;a.map.$().f.slice()[1]||a.type!=yi||this.J||(this.wa=a.pixel,cw(this,a.pixel,a.map));if(this.c&&this.ya(a))if(a.type==ti&&this.U)c=!0;else{this.c.X();dw(this,a);c=this.o;var d={},e,f,g,h,k,m,n,p,q;for(k=c.length-1;0<=k;--k)if(g=c[k],p=g[0],h=p.geometry,f=h.Y(),q=x(p.feature),p.depth&&(q+="-"+p.depth.join("-")),n=e=m=void 0,0===g[1]?(e=p,m=p.index):1==g[1]&&(n=p,m=p.index+1),q in d||(d[q]=[n,e,m]),g=d[q],void 0!==n&&(g[0]=n),void 0!==e&&(g[1]=e),
void 0!==g[0]&&void 0!==g[1]){e=f;q=!1;n=m-1;switch(h.W()){case "MultiLineString":f[p.depth[0]].splice(m,1);q=!0;break;case "LineString":f.splice(m,1);q=!0;break;case "MultiPolygon":e=e[p.depth[1]];case "Polygon":e=e[p.depth[0]],4<e.length&&(m==e.length-1&&(m=0),e.splice(m,1),q=!0,0===m&&(e.pop(),e.push(e[0]),n=e.length-1))}q&&(this.a.remove(g[0]),this.a.remove(g[1]),e=h,this.s=!0,e.la(f),this.s=!1,f={depth:p.depth,feature:p.feature,geometry:p.geometry,index:n,ka:[g[0].ka[0],g[1].ka[1]]},this.a.za(xc(f.ka),
f),iw(this,h,m,p.depth,-1),this.c&&(this.S.da().nb(this.c),this.c=null))}c=!0;this.b(new Wv("modifyend",this.B,a));this.D=!1}a.type==ti&&(this.U=!1);return Cj.call(this,a)&&!c}
function cw(a,c,d){function e(a,c){return ic(f,a.ka)-ic(f,c.ka)}var f=d.La(c),g=d.La([c[0]-a.H,c[1]+a.H]),h=d.La([c[0]+a.H,c[1]-a.H]),g=xc([g,h]),g=Zm(a.a,g);if(0<g.length){g.sort(e);var h=g[0].ka,k=cc(f,h),m=d.Ta(k);if(Math.sqrt(hc(c,m))<=a.H){c=d.Ta(h[0]);d=d.Ta(h[1]);c=hc(m,c);d=hc(m,d);a.na=Math.sqrt(Math.min(c,d))<=a.H;a.na&&(k=c>d?h[1]:h[0]);gw(a,k);d={};d[x(h)]=!0;c=1;for(m=g.length;c<m;++c)if(k=g[c].ka,fc(h[0],k[0])&&fc(h[1],k[1])||fc(h[0],k[1])&&fc(h[1],k[0]))d[x(k)]=!0;else break;a.oa=d;
return}}a.c&&(a.S.da().nb(a.c),a.c=null)}
l.Rk=function(a,c){for(var d=a.ka,e=a.feature,f=a.geometry,g=a.depth,h=a.index,k;c.length<f.qa();)c.push(0);switch(f.W()){case "MultiLineString":k=f.Y();k[g[0]].splice(h+1,0,c);break;case "Polygon":k=f.Y();k[g[0]].splice(h+1,0,c);break;case "MultiPolygon":k=f.Y();k[g[1]][g[0]].splice(h+1,0,c);break;case "LineString":k=f.Y();k.splice(h+1,0,c);break;default:return}this.s=!0;f.la(k);this.s=!1;k=this.a;k.remove(a);iw(this,f,h,g,1);var m={ka:[d[0],c],feature:e,geometry:f,depth:g,index:h};k.za(xc(m.ka),
m);this.o.push([m,1]);d={ka:[c,d[1]],feature:e,geometry:f,depth:g,index:h+1};k.za(xc(d.ka),d);this.o.push([d,0]);this.U=!0};function iw(a,c,d,e,f){an(a.a,c.G(),function(a){a.geometry===c&&(void 0===e||void 0===a.depth||bb(a.depth,e))&&a.index>d&&(a.index+=f)})}function bw(){var a=Pk();return function(){return a.Point}};function jw(a,c,d,e){Eb.call(this,a);this.selected=c;this.deselected=d;this.mapBrowserEvent=e}y(jw,Eb);
function kw(a){nj.call(this,{handleEvent:lw});var c=a?a:{};this.J=c.condition?c.condition:wj;this.B=c.addCondition?c.addCondition:ed;this.D=c.removeCondition?c.removeCondition:ed;this.H=c.toggleCondition?c.toggleCondition:yj;this.s=c.multi?c.multi:!1;this.l=c.filter?c.filter:fd;this.c=new H({source:new bn({useSpatialIndex:!1,features:c.features,wrapX:c.wrapX}),style:c.style?c.style:mw(),updateWhileAnimating:!0,updateWhileInteracting:!0});if(c.layers)if(ka(c.layers))a=function(a){return c.layers(a)};
else{var d=c.layers;a=function(a){return Ua(d,a)}}else a=fd;this.o=a;this.a={};a=this.c.da().c;D(a,"add",this.am,this);D(a,"remove",this.dm,this)}y(kw,nj);l=kw.prototype;l.bm=function(){return this.c.da().c};l.cm=function(a){a=x(a);return this.a[a]};
function lw(a){if(!this.J(a))return!0;var c=this.B(a),d=this.D(a),e=this.H(a),f=!c&&!d&&!e,g=a.map,h=this.c.da().c,k=[],m=[],n=!1;if(f)g.od(a.pixel,function(a,c){if(this.l(a,c)){m.push(a);var d=x(a);this.a[d]=c;return!this.s}},this,this.o),0<m.length&&1==h.ac()&&h.item(0)==m[0]||(n=!0,0!==h.ac()&&(k=Array.prototype.concat(h.a),h.clear()),h.jf(m),0===m.length?nb(this.a):0<k.length&&k.forEach(function(a){a=x(a);delete this.a[a]},this));else{g.od(a.pixel,function(a,f){if(this.l(a,f)){if(!c&&!e||Ua(h.a,
a))(d||e)&&Ua(h.a,a)&&(k.push(a),g=x(a),delete this.a[g]);else{m.push(a);var g=x(a);this.a[g]=f}return!this.s}},this,this.o);for(f=k.length-1;0<=f;--f)h.remove(k[f]);h.jf(m);if(0<m.length||0<k.length)n=!0}n&&this.b(new jw("select",m,k,a));return vj(a)}l.setMap=function(a){var c=this.A,d=this.c.da().c;c&&d.forEach(c.ci,c);kw.ia.setMap.call(this,a);this.c.setMap(a);a&&d.forEach(a.ai,a)};
function mw(){var a=Pk();Xa(a.Polygon,a.LineString);Xa(a.GeometryCollection,a.LineString);return function(c){return a[c.X().W()]}}l.am=function(a){a=a.element;var c=this.A;c&&c.ai(a)};l.dm=function(a){a=a.element;var c=this.A;c&&c.ci(a)};function nw(a){Bj.call(this,{handleEvent:ow,handleDownEvent:fd,handleUpEvent:pw});a=a?a:{};this.s=a.source?a.source:null;this.o=a.features?a.features:null;this.wa=[];this.D={};this.H={};this.U={};this.B={};this.S=null;this.c=void 0!==a.pixelTolerance?a.pixelTolerance:10;this.na=qw.bind(this);this.a=new Wm;this.aa={Point:this.jm,LineString:this.bh,LinearRing:this.bh,Polygon:this.km,MultiPoint:this.hm,MultiLineString:this.gm,MultiPolygon:this.im,GeometryCollection:this.fm}}y(nw,Bj);l=nw.prototype;
l.rb=function(a,c){var d=void 0!==c?c:!0,e=a.X(),f=this.aa[e.W()];if(f){var g=x(a);this.U[g]=e.G(yc());f.call(this,a,e);d&&(this.H[g]=D(e,"change",this.pk.bind(this,a),this),this.D[g]=D(a,Ob(a.a),this.em,this))}};l.pj=function(a){this.rb(a)};l.qj=function(a){this.nb(a)};l.$g=function(a){var c;a instanceof gn?c=a.feature:a instanceof Re&&(c=a.element);this.rb(c)};l.ah=function(a){var c;a instanceof gn?c=a.feature:a instanceof Re&&(c=a.element);this.nb(c)};
l.em=function(a){a=a.target;this.nb(a,!0);this.rb(a,!0)};l.pk=function(a){if(this.J){var c=x(a);c in this.B||(this.B[c]=a)}else this.di(a)};l.nb=function(a,c){var d=void 0!==c?c:!0,e=x(a),f=this.U[e];if(f){var g=this.a,h=[];an(g,f,function(c){a===c.feature&&h.push(c)});for(f=h.length-1;0<=f;--f)g.remove(h[f]);d&&(Kb(this.H[e]),delete this.H[e],Kb(this.D[e]),delete this.D[e])}};
l.setMap=function(a){var c=this.A,d=this.wa,e;this.o?e=this.o:this.s&&(e=this.s.pe());c&&(d.forEach(Kb),d.length=0,e.forEach(this.qj,this));nw.ia.setMap.call(this,a);a&&(this.o?d.push(D(this.o,"add",this.$g,this),D(this.o,"remove",this.ah,this)):this.s&&d.push(D(this.s,"addfeature",this.$g,this),D(this.s,"removefeature",this.ah,this)),e.forEach(this.pj,this))};l.Dc=ed;l.di=function(a){this.nb(a,!1);this.rb(a,!1)};
l.fm=function(a,c){var d,e=c.i;for(d=0;d<e.length;++d)this.aa[e[d].W()].call(this,a,e[d])};l.bh=function(a,c){var d=c.Y(),e,f,g,h;e=0;for(f=d.length-1;e<f;++e)g=d.slice(e,e+2),h={feature:a,ka:g},this.a.za(xc(g),h)};l.gm=function(a,c){var d=c.Y(),e,f,g,h,k,m,n;h=0;for(k=d.length;h<k;++h)for(e=d[h],f=0,g=e.length-1;f<g;++f)m=e.slice(f,f+2),n={feature:a,ka:m},this.a.za(xc(m),n)};l.hm=function(a,c){var d=c.Y(),e,f,g;f=0;for(g=d.length;f<g;++f)e=d[f],e={feature:a,ka:[e,e]},this.a.za(c.G(),e)};
l.im=function(a,c){var d=c.Y(),e,f,g,h,k,m,n,p,q,r;m=0;for(n=d.length;m<n;++m)for(p=d[m],h=0,k=p.length;h<k;++h)for(e=p[h],f=0,g=e.length-1;f<g;++f)q=e.slice(f,f+2),r={feature:a,ka:q},this.a.za(xc(q),r)};l.jm=function(a,c){var d=c.Y(),d={feature:a,ka:[d,d]};this.a.za(c.G(),d)};l.km=function(a,c){var d=c.Y(),e,f,g,h,k,m,n;h=0;for(k=d.length;h<k;++h)for(e=d[h],f=0,g=e.length-1;f<g;++f)m=e.slice(f,f+2),n={feature:a,ka:m},this.a.za(xc(m),n)};
function ow(a){var c,d,e=a.pixel,f=a.coordinate;c=a.map;var g=c.La([e[0]-this.c,e[1]+this.c]);d=c.La([e[0]+this.c,e[1]-this.c]);var g=xc([g,d]),h=Zm(this.a,g),k=!1,g=!1,m=null;d=null;0<h.length&&(this.S=f,h.sort(this.na),h=h[0].ka,m=cc(f,h),d=c.Ta(m),Math.sqrt(hc(e,d))<=this.c&&(g=!0,e=c.Ta(h[0]),f=c.Ta(h[1]),e=hc(d,e),f=hc(d,f),k=Math.sqrt(Math.min(e,f))<=this.c))&&(m=e>f?h[1]:h[0],d=c.Ta(m),d=[Math.round(d[0]),Math.round(d[1])]);c=m;g&&(a.coordinate=c.slice(0,2),a.pixel=d);return Cj.call(this,a)}
function pw(){var a=ob(this.B);a.length&&(a.forEach(this.di,this),this.B={});return!1}function qw(a,c){return ic(this.S,a.ka)-ic(this.S,c.ka)};function rw(a,c,d){Eb.call(this,a);this.features=c;this.coordinate=d}y(rw,Eb);function sw(a){Bj.call(this,{handleDownEvent:tw,handleDragEvent:uw,handleMoveEvent:vw,handleUpEvent:ww});this.s=void 0;this.a=null;this.c=void 0!==a.features?a.features:null;this.o=null}y(sw,Bj);function tw(a){this.o=xw(this,a.pixel,a.map);return!this.a&&this.o?(this.a=a.coordinate,vw.call(this,a),this.b(new rw("translatestart",this.c,a.coordinate)),!0):!1}
function ww(a){return this.a?(this.a=null,vw.call(this,a),this.b(new rw("translateend",this.c,a.coordinate)),!0):!1}function uw(a){if(this.a){a=a.coordinate;var c=a[0]-this.a[0],d=a[1]-this.a[1];if(this.c)this.c.forEach(function(a){var e=a.X();e.Rc(c,d);a.Pa(e)});else if(this.o){var e=this.o.X();e.Rc(c,d);this.o.Pa(e)}this.a=a;this.b(new rw("translating",this.c,a))}}
function vw(a){var c=a.map.tc();if(a=a.map.od(a.pixel,function(a){return a})){var d=!1;this.c&&Ua(this.c.a,a)&&(d=!0);this.s=c.style.cursor;c.style.cursor=this.a?"-webkit-grabbing":d?"-webkit-grab":"pointer";c.style.cursor=this.a?d?"grab":"pointer":"grabbing"}else c.style.cursor=void 0!==this.s?this.s:"",this.s=void 0}function xw(a,c,d){var e=null;c=d.od(c,function(a){return a});a.c&&Ua(a.c.a,c)&&(e=c);return e};function X(a){a=a?a:{};var c=mb({},a);delete c.gradient;delete c.radius;delete c.blur;delete c.shadow;delete c.weight;H.call(this,c);this.i=null;this.aa=void 0!==a.shadow?a.shadow:250;this.U=void 0;this.S=null;D(this,Ob("gradient"),this.qk,this);this.Rh(a.gradient?a.gradient:yw);this.Mh(void 0!==a.blur?a.blur:15);this.fh(void 0!==a.radius?a.radius:8);D(this,Ob("blur"),this.ef,this);D(this,Ob("radius"),this.ef,this);this.ef();var d=a.weight?a.weight:"weight",e;"string"===typeof d?e=function(a){return a.get(d)}:
e=d;this.c(function(a){a=e(a);a=void 0!==a?La(a,0,1):1;var c=255*a|0,d=this.S[c];d||(d=[new Kk({image:new Wi({opacity:a,src:this.U})})],this.S[c]=d);return d}.bind(this));this.set("renderOrder",null);D(this,"render",this.Hk,this)}y(X,H);var yw=["#00f","#0ff","#0f0","#ff0","#f00"];l=X.prototype;l.og=function(){return this.get("blur")};l.wg=function(){return this.get("gradient")};l.eh=function(){return this.get("radius")};
l.qk=function(){for(var a=this.wg(),c=nh(1,256),d=c.createLinearGradient(0,0,1,256),e=1/(a.length-1),f=0,g=a.length;f<g;++f)d.addColorStop(f*e,a[f]);c.fillStyle=d;c.fillRect(0,0,1,256);this.i=c.getImageData(0,0,1,256).data};l.ef=function(){var a=this.eh(),c=this.og(),d=a+c+1,e=2*d,e=nh(e,e);e.shadowOffsetX=e.shadowOffsetY=this.aa;e.shadowBlur=c;e.shadowColor="#000";e.beginPath();c=d-this.aa;e.arc(c,c,a,0,2*Math.PI,!0);e.fill();this.U=e.canvas.toDataURL();this.S=Array(256);this.u()};
l.Hk=function(a){a=a.context;var c=a.canvas,c=a.getImageData(0,0,c.width,c.height),d=c.data,e,f,g;e=0;for(f=d.length;e<f;e+=4)if(g=4*d[e+3])d[e]=this.i[g],d[e+1]=this.i[g+1],d[e+2]=this.i[g+2];a.putImageData(c,0,0)};l.Mh=function(a){this.set("blur",a)};l.Rh=function(a){this.set("gradient",a)};l.fh=function(a){this.set("radius",a)};function zw(a,c,d,e){function f(){delete aa[h];g.parentNode.removeChild(g)}var g=aa.document.createElement("script"),h="olc_"+x(c);g.async=!0;g.src=a+(-1==a.indexOf("?")?"?":"&")+(e||"callback")+"="+h;var k=aa.setTimeout(function(){f();d&&d()},1E4);aa[h]=function(a){aa.clearTimeout(k);f();c(a)};aa.document.getElementsByTagName("head")[0].appendChild(g)};function Aw(a,c,d,e,f,g,h,k,m,n,p){pg.call(this,f,0);this.J=void 0!==p?p:!1;this.B=h;this.T=k;this.i=null;this.c={};this.j=c;this.o=e;this.s=g?g:f;this.g=[];this.Wc=null;this.l=0;g=e.Ca(this.s);k=this.o.G();f=this.j.G();g=k?$c(g,k):g;if(0===Tc(g))this.state=4;else if((k=a.G())&&(f?f=$c(f,k):f=k),e=e.Z(this.s[0]),e=Il(a,d,Yc(g),e),!isFinite(e)||0>=e)this.state=4;else if(this.A=new Ll(a,d,g,f,e*(void 0!==n?n:.5)),0===this.A.f.length)this.state=4;else if(this.l=Dg(c,e),d=Nl(this.A),f&&(a.b?(d[1]=La(d[1],
f[1],f[3]),d[3]=La(d[3],f[1],f[3])):d=$c(d,f)),Tc(d))if(a=yg(c,d,this.l),100>(a.va-a.ra+1)*(a.Aa-a.xa+1)){for(c=a.ra;c<=a.va;c++)for(d=a.xa;d<=a.Aa;d++)(n=m(this.l,c,d,h))&&this.g.push(n);0===this.g.length&&(this.state=4)}else this.state=3;else this.state=4}y(Aw,pg);Aw.prototype.fa=function(){1==this.state&&(this.Wc.forEach(sb),this.Wc=null);Aw.ia.fa.call(this)};
Aw.prototype.cb=function(a){if(void 0!==a){var c=x(a);if(c in this.c)return this.c[c];a=pb(this.c)?this.i:this.i.cloneNode(!1);return this.c[c]=a}return this.i};
Aw.prototype.Bd=function(){var a=[];this.g.forEach(function(c){c&&2==c.V()&&a.push({extent:this.j.Ca(c.ga),image:c.cb()})},this);this.g.length=0;if(0===a.length)this.state=3;else{var c=this.s[0],d=this.o.Ua(c),e=ja(d)?d:d[0],d=ja(d)?d:d[1],c=this.o.Z(c),f=this.j.Z(this.l),g=this.o.Ca(this.s);this.i=Kl(e,d,this.B,f,this.j.G(),c,g,this.A,a,this.T,this.J);this.state=2}qg(this)};
Aw.prototype.load=function(){if(0==this.state){this.state=1;qg(this);var a=0;this.Wc=[];this.g.forEach(function(c){var d=c.V();if(0==d||1==d){a++;var e;e=D(c,"change",function(){var d=c.V();if(2==d||3==d||4==d)sb(e),a--,0===a&&(this.Wc.forEach(sb),this.Wc=null,this.Bd())},this);this.Wc.push(e)}},this);this.g.forEach(function(a){0==a.V()&&a.load()});0===a&&aa.setTimeout(this.Bd.bind(this),0)}};function Y(a){un.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,opaque:a.opaque,projection:a.projection,state:a.state,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction?a.tileLoadFunction:Bw,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:a.tileUrlFunction,url:a.url,urls:a.urls,wrapX:a.wrapX});this.crossOrigin=void 0!==a.crossOrigin?a.crossOrigin:null;this.tileClass=void 0!==a.tileClass?a.tileClass:tv;this.i={};this.o={};this.oa=a.reprojectionErrorThreshold;this.B=!1}
y(Y,un);l=Y.prototype;l.lh=function(){if(ng(this.a))return!0;for(var a in this.i)if(ng(this.i[a]))return!0;return!1};l.mh=function(a,c){var d=this.td(a);og(this.a,this.a==d?c:{});for(var e in this.i){var f=this.i[e];og(f,f==d?c:{})}};l.Ud=function(a){return this.f&&a&&!Hd(this.f,a)?0:this.af()};l.af=function(){return 0};l.Wd=function(a){return this.f&&a&&!Hd(this.f,a)?!1:Y.ia.Wd.call(this,a)};
l.Za=function(a){var c=this.f;return!this.tileGrid||c&&!Hd(c,a)?(c=x(a).toString(),c in this.o||(this.o[c]=Eg(a)),this.o[c]):this.tileGrid};l.td=function(a){var c=this.f;if(!c||Hd(c,a))return this.a;a=x(a).toString();a in this.i||(this.i[a]=new mg);return this.i[a]};function Cw(a,c,d,e,f,g,h){c=[c,d,e];f=(d=Lg(a,c,g))?a.tileUrlFunction(d,f,g):void 0;f=new a.tileClass(c,void 0!==f?0:4,void 0!==f?f:"",a.crossOrigin,a.tileLoadFunction);f.key=h;D(f,"change",a.nh,a);return f}
l.Qb=function(a,c,d,e,f){if(this.f&&f&&!Hd(this.f,f)){var g=this.td(f);c=[a,c,d];a=this.Db.apply(this,c);if(lg(g,a))return g.get(a);var h=this.f;d=this.Za(h);var k=this.Za(f),m=Lg(this,c,f);e=new Aw(h,d,f,k,c,m,this.uc(e),this.af(),function(a,c,d,e){return Dw(this,a,c,d,e,h)}.bind(this),this.oa,this.B);g.set(a,e);return e}return Dw(this,a,c,d,e,f)};
function Dw(a,c,d,e,f,g){var h=null,k=a.Db(c,d,e),m=a.bf();if(lg(a.a,k)){if(h=a.a.get(k),h.key!=m){var n=h;h.a&&h.a.key==m?(h=h.a,2==n.V()&&(h.a=n)):(h=Cw(a,c,d,e,f,g,m),2==n.V()?h.a=n:n.a&&2==n.a.V()&&(h.a=n.a,n.a=null));h.a&&(h.a.a=null);a.a.replace(k,h)}}else h=Cw(a,c,d,e,f,g,m),a.a.set(k,h);return h}l.zb=function(a){if(this.B!=a){this.B=a;for(var c in this.i)this.i[c].clear();this.u()}};l.Ab=function(a,c){var d=qd(a);d&&(d=x(d).toString(),d in this.o||(this.o[d]=c))};
function Bw(a,c){a.cb().src=c};function Ew(a){Y.call(this,{crossOrigin:"anonymous",opaque:!0,projection:qd("EPSG:3857"),reprojectionErrorThreshold:a.reprojectionErrorThreshold,state:"loading",tileLoadFunction:a.tileLoadFunction,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.l=void 0!==a.culture?a.culture:"en-us";this.c=void 0!==a.maxZoom?a.maxZoom:-1;zw("https://dev.virtualearth.net/REST/v1/Imagery/Metadata/"+a.imagerySet+"?uriScheme=https&include=ImageryProviders&key="+a.key,this.s.bind(this),void 0,"jsonp")}y(Ew,Y);var Fw=new Qe({html:'<a class="ol-attribution-bing-tos" href="http://www.microsoft.com/maps/product/terms.html">Terms of Use</a>'});
Ew.prototype.s=function(a){if(200!=a.statusCode||"OK"!=a.statusDescription||"ValidCredentials"!=a.authenticationResultCode||1!=a.resourceSets.length||1!=a.resourceSets[0].resources.length)tg(this,"error");else{var c=a.brandLogoUri;-1==c.indexOf("https")&&(c=c.replace("http","https"));var d=a.resourceSets[0].resources[0],e=-1==this.c?d.zoomMax:this.c;a=Fg(this.f);var f=Hg({extent:a,minZoom:d.zoomMin,maxZoom:e,tileSize:d.imageWidth==d.imageHeight?d.imageWidth:[d.imageWidth,d.imageHeight]});this.tileGrid=
f;var g=this.l;this.tileUrlFunction=rn(d.imageUrlSubdomains.map(function(a){var c=[0,0,0],e=d.imageUrl.replace("{subdomain}",a).replace("{culture}",g);return function(a){if(a)return Ke(a[0],a[1],-a[2]-1,c),e.replace("{quadkey}",Le(c))}}));if(d.imageryProviders){var h=ud(qd("EPSG:4326"),this.f);a=d.imageryProviders.map(function(a){var c=a.attribution,d={};a.coverageAreas.forEach(function(a){var c=a.zoomMin,g=Math.min(a.zoomMax,e);a=a.bbox;a=cd([a[1],a[0],a[3],a[2]],h);var k,m;for(k=c;k<=g;++k)m=k.toString(),
c=yg(f,a,k),m in d?d[m].push(c):d[m]=[c]});return new Qe({html:c,tileRanges:d})});a.push(Fw);this.ma(a)}this.D=c;tg(this,"ready")}};function Gw(a){bn.call(this,{attributions:a.attributions,extent:a.extent,logo:a.logo,projection:a.projection,wrapX:a.wrapX});this.B=void 0;this.U=void 0!==a.distance?a.distance:20;this.A=[];this.s=a.source;this.s.I("change",Gw.prototype.na,this)}y(Gw,bn);Gw.prototype.aa=function(){return this.s};Gw.prototype.Oc=function(a,c,d){this.s.Oc(a,c,d);c!==this.B&&(this.clear(),this.B=c,Hw(this),this.Gc(this.A))};Gw.prototype.na=function(){this.clear();Hw(this);this.Gc(this.A);this.u()};
function Hw(a){if(void 0!==a.B){a.A.length=0;for(var c=yc(),d=a.U*a.B,e=a.s.pe(),f={},g=0,h=e.length;g<h;g++){var k=e[g];x(k).toString()in f||(k=k.X().Y(),Jc(k,c),Ac(c,d,c),k=a.s.$e(c),k=k.filter(function(a){a=x(a).toString();return a in f?!1:f[a]=!0}),a.A.push(Iw(k)))}}}function Iw(a){for(var c=a.length,d=[0,0],e=0;e<c;e++){var f=a[e].X().Y();bc(d,f)}c=1/c;d[0]*=c;d[1]*=c;d=new Xl(new E(d));d.set("features",a);return d};function Jw(a){Pl.call(this,{projection:a.projection,resolutions:a.resolutions});this.U=void 0!==a.crossOrigin?a.crossOrigin:null;this.o=void 0!==a.displayDpi?a.displayDpi:96;this.j=a.params||{};this.S=a.url;this.c=void 0!==a.imageLoadFunction?a.imageLoadFunction:Vl;this.aa=void 0!==a.hidpi?a.hidpi:!0;this.oa=void 0!==a.metersPerUnit?a.metersPerUnit:1;this.s=void 0!==a.ratio?a.ratio:1;this.ya=void 0!==a.useOverlay?a.useOverlay:!1;this.i=null;this.H=0}y(Jw,Pl);l=Jw.prototype;l.tm=function(){return this.j};
l.pd=function(a,c,d){c=Ql(this,c);d=this.aa?d:1;var e=this.i;if(e&&this.H==this.g&&e.Z()==c&&e.f==d&&Gc(e.G(),a))return e;1!=this.s&&(a=a.slice(),bd(a,this.s));var f=[Wc(a)/c*d,Xc(a)/c*d];if(void 0!==this.S){var e=this.S,g=Yc(a),h=this.oa,k=Wc(a),m=Xc(a),n=f[0],p=f[1],q=.0254/this.o,f={OPERATION:this.ya?"GETDYNAMICMAPOVERLAYIMAGE":"GETMAPIMAGE",VERSION:"2.0.0",LOCALE:"en",CLIENTAGENT:"ol.source.ImageMapGuide source",CLIP:"1",SETDISPLAYDPI:this.o,SETDISPLAYWIDTH:Math.round(f[0]),SETDISPLAYHEIGHT:Math.round(f[1]),
SETVIEWSCALE:p*k>n*m?k*h/(n*q):m*h/(p*q),SETVIEWCENTERX:g[0],SETVIEWCENTERY:g[1]};mb(f,this.j);e=Xq(Zq([e],f));e=new sv(a,c,d,this.ea(),e,this.U,this.c);D(e,"change",this.l,this)}else e=null;this.i=e;this.H=this.g;return e};l.sm=function(){return this.c};l.vm=function(a){mb(this.j,a);this.u()};l.um=function(a){this.i=null;this.c=a;this.u()};function Kw(a){var c=void 0!==a.attributions?a.attributions:null,d=a.imageExtent,e=void 0!==a.crossOrigin?a.crossOrigin:null,f=void 0!==a.imageLoadFunction?a.imageLoadFunction:Vl;Pl.call(this,{attributions:c,logo:a.logo,projection:qd(a.projection)});this.c=new sv(d,void 0,1,c,a.url,e,f);this.i=a.imageSize?a.imageSize:null;D(this.c,"change",this.l,this)}y(Kw,Pl);Kw.prototype.pd=function(a){return ad(a,this.c.G())?this.c:null};
Kw.prototype.l=function(a){if(2==this.c.V()){var c=this.c.G(),d=this.c.a(),e,f;this.i?(e=this.i[0],f=this.i[1]):(e=d.width,f=d.height);c=Math.ceil(Wc(c)/(Xc(c)/f));if(c!=e){var g=document.createElement("canvas");g.width=c;g.height=f;g.getContext("2d").drawImage(d,0,0,e,f,0,0,g.width,g.height);this.c.g=g}}Kw.ia.l.call(this,a)};function Lw(a){a=a||{};Pl.call(this,{attributions:a.attributions,logo:a.logo,projection:a.projection,resolutions:a.resolutions});this.oa=void 0!==a.crossOrigin?a.crossOrigin:null;this.j=a.url;this.H=void 0!==a.imageLoadFunction?a.imageLoadFunction:Vl;this.i=a.params||{};this.s=!0;Mw(this);this.aa=a.serverType;this.ya=void 0!==a.hidpi?a.hidpi:!0;this.c=null;this.S=[0,0];this.U=0;this.o=void 0!==a.ratio?a.ratio:1.5}y(Lw,Pl);var Nw=[101,101];l=Lw.prototype;
l.Bm=function(a,c,d,e){if(void 0!==this.j){var f=Zc(a,c,0,Nw),g={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",FORMAT:"image/png",TRANSPARENT:!0,QUERY_LAYERS:this.i.LAYERS};mb(g,this.i,e);e=Math.floor((f[3]-a[1])/c);g[this.s?"I":"X"]=Math.floor((a[0]-f[0])/c);g[this.s?"J":"Y"]=e;return Ow(this,f,Nw,1,qd(d),g)}};l.Dm=function(){return this.i};
l.pd=function(a,c,d,e){if(void 0===this.j)return null;c=Ql(this,c);1==d||this.ya&&void 0!==this.aa||(d=1);a=a.slice();var f=(a[0]+a[2])/2,g=(a[1]+a[3])/2,h=c/d,k=Wc(a)/h,h=Xc(a)/h,m=this.c;if(m&&this.U==this.g&&m.Z()==c&&m.f==d&&Gc(m.G(),a))return m;if(1!=this.o){var m=this.o*Wc(a)/2,n=this.o*Xc(a)/2;a[0]=f-m;a[1]=g-n;a[2]=f+m;a[3]=g+n}f={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetMap",FORMAT:"image/png",TRANSPARENT:!0};mb(f,this.i);this.S[0]=Math.ceil(k*this.o);this.S[1]=Math.ceil(h*this.o);e=Ow(this,
a,this.S,d,e,f);this.c=new sv(a,c,d,this.ea(),e,this.oa,this.H);this.U=this.g;D(this.c,"change",this.l,this);return this.c};l.Cm=function(){return this.H};
function Ow(a,c,d,e,f,g){g[a.s?"CRS":"SRS"]=f.lb;"STYLES"in a.i||(g.STYLES=new String(""));if(1!=e)switch(a.aa){case "geoserver":e=90*e+.5|0;g.FORMAT_OPTIONS="FORMAT_OPTIONS"in g?g.FORMAT_OPTIONS+(";dpi:"+e):"dpi:"+e;break;case "mapserver":g.MAP_RESOLUTION=90*e;break;case "carmentaserver":case "qgis":g.DPI=90*e}g.WIDTH=d[0];g.HEIGHT=d[1];d=f.f;var h;a.s&&"ne"==d.substr(0,2)?h=[c[1],c[0],c[3],c[2]]:h=c;g.BBOX=h.join(",");return Xq(Zq([a.j],g))}l.Em=function(){return this.j};
l.Fm=function(a){this.c=null;this.H=a;this.u()};l.Gm=function(a){a!=this.j&&(this.j=a,this.c=null,this.u())};l.Hm=function(a){mb(this.i,a);Mw(this);this.c=null;this.u()};function Mw(a){a.s=0<=Ja(a.i.VERSION||"1.3.0","1.3")};function Pw(a){var c=void 0!==a.projection?a.projection:"EPSG:3857",d=void 0!==a.tileGrid?a.tileGrid:Hg({extent:Fg(c),maxZoom:a.maxZoom,tileSize:a.tileSize});Y.call(this,{attributions:a.attributions,crossOrigin:a.crossOrigin,logo:a.logo,opaque:a.opaque,projection:c,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:d,tileLoadFunction:a.tileLoadFunction,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:a.tileUrlFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0})}y(Pw,Y);function Qw(a){a=a||{};var c;void 0!==a.attributions?c=a.attributions:c=[Rw];Pw.call(this,{attributions:c,crossOrigin:void 0!==a.crossOrigin?a.crossOrigin:"anonymous",opaque:void 0!==a.opaque?a.opaque:!0,maxZoom:void 0!==a.maxZoom?a.maxZoom:19,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",wrapX:a.wrapX})}y(Qw,Pw);var Rw=new Qe({html:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.'});function Sw(a){a=a||{};var c=Tw[a.layer];this.c=a.layer;Pw.call(this,{attributions:c.attributions,crossOrigin:"anonymous",logo:"https://developer.mapquest.com/content/osm/mq_logo.png",maxZoom:c.maxZoom,reprojectionErrorThreshold:a.reprojectionErrorThreshold,opaque:c.opaque,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://otile{1-4}-s.mqcdn.com/tiles/1.0.0/"+this.c+"/{z}/{x}/{y}.jpg"})}y(Sw,Pw);
var Uw=new Qe({html:'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a>'}),Tw={osm:{maxZoom:19,opaque:!0,attributions:[Uw,Rw]},sat:{maxZoom:18,opaque:!0,attributions:[Uw,new Qe({html:"Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency"})]},hyb:{maxZoom:18,opaque:!1,attributions:[Uw,Rw]}};Sw.prototype.l=function(){return this.c};(function(){var a={},c={ja:a};(function(d){if("object"===typeof a&&"undefined"!==typeof c)c.ja=d();else{var e;"undefined"!==typeof window?e=window:"undefined"!==typeof global?e=global:"undefined"!==typeof self?e=self:e=this;e.ip=d()}})(function(){return function e(a,c,h){function k(n,q){if(!c[n]){if(!a[n]){var r="function"==typeof require&&require;if(!q&&r)return r(n,!0);if(m)return m(n,!0);r=Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r;}r=c[n]={ja:{}};a[n][0].call(r.ja,function(c){var e=
a[n][1][c];return k(e?e:c)},r,r.ja,e,a,c,h)}return c[n].ja}for(var m="function"==typeof require&&require,n=0;n<h.length;n++)k(h[n]);return k}({1:[function(a,c,g){a=a("./processor");g.Hi=a},{"./processor":2}],2:[function(a,c){function g(a){return function(c){var e=c.buffers,f=c.meta,g=c.width,h=c.height,k=e.length,m=e[0].byteLength,B;if(c.imageOps){m=Array(k);for(B=0;B<k;++B)m[B]=new ImageData(new Uint8ClampedArray(e[B]),g,h);g=a(m,f).data}else{g=new Uint8ClampedArray(m);h=Array(k);c=Array(k);for(B=
0;B<k;++B)h[B]=new Uint8ClampedArray(e[B]),c[B]=[0,0,0,0];for(e=0;e<m;e+=4){for(B=0;B<k;++B){var z=h[B];c[B][0]=z[e];c[B][1]=z[e+1];c[B][2]=z[e+2];c[B][3]=z[e+3]}B=a(c,f);g[e]=B[0];g[e+1]=B[1];g[e+2]=B[2];g[e+3]=B[3]}}return g.buffer}}function h(a,c){var e=Object.keys(a.lib||{}).map(function(c){return"var "+c+" = "+a.lib[c].toString()+";"}).concat(["var __minion__ = ("+g.toString()+")(",a.operation.toString(),");",'self.addEventListener("message", function(__event__) {',"var buffer = __minion__(__event__.data);",
"self.postMessage({buffer: buffer, meta: __event__.data.meta}, [buffer]);","});"]),e=URL.createObjectURL(new Blob(e,{type:"text/javascript"})),e=new Worker(e);e.addEventListener("message",c);return e}function k(a,c){var e=g(a.operation);return{postMessage:function(a){setTimeout(function(){c({data:{buffer:e(a),ge:a.ge}})},0)}}}function m(a){this.Pe=!!a.Pk;var c;0===a.threads?c=0:this.Pe?c=1:c=a.threads||1;var e=[];if(c)for(var f=0;f<c;++f)e[f]=h(a,this.Zf.bind(this,f));else e[0]=k(a,this.Zf.bind(this,
0));this.Nd=e;this.ad=[];this.Wi=a.Kn||Infinity;this.Ld=0;this.Fc={};this.Qe=null}m.prototype.In=function(a,c,e){this.Ti({wc:a,ge:c,gg:e});this.Wf()};m.prototype.Ti=function(a){for(this.ad.push(a);this.ad.length>this.Wi;)this.ad.shift().gg(null,null)};m.prototype.Wf=function(){if(0===this.Ld&&0<this.ad.length){var a=this.Qe=this.ad.shift(),c=a.wc[0].width,e=a.wc[0].height,f=a.wc.map(function(a){return a.data.buffer}),g=this.Nd.length;this.Ld=g;if(1===g)this.Nd[0].postMessage({buffers:f,meta:a.ge,
imageOps:this.Pe,width:c,height:e},f);else for(var h=4*Math.ceil(a.wc[0].data.length/4/g),k=0;k<g;++k){for(var m=k*h,B=[],z=0,C=f.length;z<C;++z)B.push(f[k].slice(m,m+h));this.Nd[k].postMessage({buffers:B,meta:a.ge,imageOps:this.Pe,width:c,height:e},B)}}};m.prototype.Zf=function(a,c){this.ep||(this.Fc[a]=c.data,--this.Ld,0===this.Ld&&this.Xi())};m.prototype.Xi=function(){var a=this.Qe,c=this.Nd.length,e,f;if(1===c)e=new Uint8ClampedArray(this.Fc[0].buffer),f=this.Fc[0].meta;else{var g=a.wc[0].data.length;
e=new Uint8ClampedArray(g);f=Array(g);for(var g=4*Math.ceil(g/4/c),h=0;h<c;++h){var k=h*g;e.set(new Uint8ClampedArray(this.Fc[h].buffer),k);f[h]=this.Fc[h].meta}}this.Qe=null;this.Fc={};a.gg(null,new ImageData(e,a.wc[0].width,a.wc[0].height),f);this.Wf()};c.ja=m},{}]},{},[1])(1)});Vm=c.ja})();function Vw(a){this.H=null;this.ya=void 0!==a.operationType?a.operationType:"pixel";this.qb=void 0!==a.threads?a.threads:1;this.c=Ww(a.sources);for(var c=0,d=this.c.length;c<d;++c)D(this.c[c],"change",this.u,this);this.i=nh();this.aa=new jj(function(){return 1},this.u.bind(this));for(var c=Xw(this.c),d={},e=0,f=c.length;e<f;++e)d[x(c[e].layer)]=c[e];this.j=this.o=null;this.U={animate:!1,attributions:{},coordinateToPixelMatrix:nc(),extent:null,focus:null,index:0,layerStates:d,layerStatesArray:c,logos:{},
pixelRatio:1,pixelToCoordinateMatrix:nc(),postRenderFunctions:[],size:[0,0],skippedFeatureUids:{},tileQueue:this.aa,time:Date.now(),usedTiles:{},viewState:{rotation:0},viewHints:[],wantedTiles:{}};Pl.call(this,{});void 0!==a.operation&&this.s(a.operation,a.lib)}y(Vw,Pl);Vw.prototype.s=function(a,c){this.H=new Vm.Hi({operation:a,Pk:"image"===this.ya,Kn:1,lib:c,threads:this.qb});this.u()};function Yw(a,c,d){var e=a.o;return!e||a.g!==e.oo||d!==e.resolution||!Mc(c,e.extent)}
Vw.prototype.B=function(a,c,d,e){d=!0;for(var f,g=0,h=this.c.length;g<h;++g)if(f=this.c[g].a.da(),"ready"!==f.V()){d=!1;break}if(!d)return null;if(!Yw(this,a,c))return this.j;d=this.i.canvas;f=Math.round(Wc(a)/c);g=Math.round(Xc(a)/c);if(f!==d.width||g!==d.height)d.width=f,d.height=g;f=mb({},this.U);f.viewState=mb({},f.viewState);var g=Yc(a),h=Math.round(Wc(a)/c),k=Math.round(Xc(a)/c);f.extent=a;f.focus=Yc(a);f.size[0]=h;f.size[1]=k;h=f.viewState;h.center=g;h.projection=e;h.resolution=c;this.j=e=
new Gl(a,c,1,this.ea(),d,this.S.bind(this,f));this.o={extent:a,resolution:c,oo:this.g};return e};
Vw.prototype.S=function(a,c){for(var d=this.c.length,e=Array(d),f=0;f<d;++f){var g;g=this.c[f];var h=a,k=a.layerStatesArray[f];if(g.l(h,k)){var m=h.size[0],n=h.size[1];if(Zw){var p=Zw.canvas;p.width!==m||p.height!==n?Zw=nh(m,n):Zw.clearRect(0,0,m,n)}else Zw=nh(m,n);g.c(h,k,Zw);g=Zw.getImageData(0,0,m,n)}else g=null;if(g)e[f]=g;else return}d={};this.b(new $w(ax,a,d));this.H.In(e,d,this.oa.bind(this,a,c));kj(a.tileQueue,16,16)};
Vw.prototype.oa=function(a,c,d,e,f){d?c(d):e&&(this.b(new $w(bx,a,f)),Yw(this,a.extent,a.viewState.resolution/a.pixelRatio)||this.i.putImageData(e,0,0),c(null))};var Zw=null;function Xw(a){return a.map(function(a){return Ci(a.a)})}function Ww(a){for(var c=a.length,d=Array(c),e=0;e<c;++e){var f=e,g=a[e],h=null;g instanceof Ig?(g=new G({source:g}),h=new nn(g)):g instanceof Pl&&(g=new vk({source:g}),h=new mn(g));d[f]=h}return d}
function $w(a,c,d){Eb.call(this,a);this.extent=c.extent;this.resolution=c.viewState.resolution/c.pixelRatio;this.data=d}y($w,Eb);var ax="beforeoperations",bx="afteroperations";var cx={terrain:{tb:"jpg",opaque:!0},"terrain-background":{tb:"jpg",opaque:!0},"terrain-labels":{tb:"png",opaque:!1},"terrain-lines":{tb:"png",opaque:!1},"toner-background":{tb:"png",opaque:!0},toner:{tb:"png",opaque:!0},"toner-hybrid":{tb:"png",opaque:!1},"toner-labels":{tb:"png",opaque:!1},"toner-lines":{tb:"png",opaque:!1},"toner-lite":{tb:"png",opaque:!0},watercolor:{tb:"jpg",opaque:!0}},dx={terrain:{minZoom:4,maxZoom:18},toner:{minZoom:0,maxZoom:20},watercolor:{minZoom:3,maxZoom:16}};
function ex(a){var c=a.layer.indexOf("-"),c=-1==c?a.layer:a.layer.slice(0,c),d=cx[a.layer];Pw.call(this,{attributions:fx,crossOrigin:"anonymous",maxZoom:dx[c].maxZoom,opaque:d.opaque,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileLoadFunction:a.tileLoadFunction,url:void 0!==a.url?a.url:"https://stamen-tiles-{a-d}.a.ssl.fastly.net/"+a.layer+"/{z}/{x}/{y}."+d.tb})}y(ex,Pw);
var fx=[new Qe({html:'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.'}),Rw];function gx(a){a=a||{};Y.call(this,{attributions:a.attributions,crossOrigin:a.crossOrigin,logo:a.logo,projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.c=a.params||{};this.l=yc()}y(gx,Y);gx.prototype.s=function(){return this.c};gx.prototype.uc=function(a){return a};
gx.prototype.qc=function(a,c,d){var e=this.tileGrid;e||(e=this.Za(d));if(!(e.Pb().length<=a[0])){var f=e.Ca(a,this.l),g=Sb(e.Ua(a[0]),this.j);1!=c&&(g=Rb(g,c,this.j));e={F:"image",FORMAT:"PNG32",TRANSPARENT:!0};mb(e,this.c);var h=this.urls;h?(d=d.lb.split(":").pop(),e.SIZE=g[0]+","+g[1],e.BBOX=f.join(","),e.BBOXSR=d,e.IMAGESR=d,e.DPI=Math.round(e.DPI?e.DPI*c:90*c),a=(1==h.length?h[0]:h[$b((a[1]<<a[0])+a[2],h.length)]).replace(/MapServer\/?$/,"MapServer/export").replace(/ImageServer\/?$/,"ImageServer/exportImage"),
a=Xq(Zq([a],e))):a=void 0;return a}};gx.prototype.A=function(a){mb(this.c,a);this.u()};function hx(a,c,d){pg.call(this,a,2);this.i=c;this.c=d;this.g={}}y(hx,pg);hx.prototype.cb=function(a){a=void 0!==a?x(a):-1;if(a in this.g)return this.g[a];var c=this.i,d=nh(c[0],c[1]);d.strokeStyle="black";d.strokeRect(.5,.5,c[0]+.5,c[1]+.5);d.fillStyle="black";d.textAlign="center";d.textBaseline="middle";d.font="24px sans-serif";d.fillText(this.c,c[0]/2,c[1]/2);return this.g[a]=d.canvas};
function ix(a){Ig.call(this,{opaque:!1,projection:a.projection,tileGrid:a.tileGrid,wrapX:void 0!==a.wrapX?a.wrapX:!0})}y(ix,Ig);ix.prototype.Qb=function(a,c,d){var e=this.Db(a,c,d);if(lg(this.a,e))return this.a.get(e);var f=Sb(this.tileGrid.Ua(a));a=[a,c,d];c=(c=Lg(this,a))?Lg(this,c).toString():"";f=new hx(a,f,c);this.a.set(e,f);return f};function jx(a){Y.call(this,{attributions:a.attributions,crossOrigin:a.crossOrigin,projection:qd("EPSG:3857"),reprojectionErrorThreshold:a.reprojectionErrorThreshold,state:"loading",tileLoadFunction:a.tileLoadFunction,wrapX:void 0!==a.wrapX?a.wrapX:!0});if(a.jsonp)zw(a.url,this.l.bind(this),this.c.bind(this));else{var c=new XMLHttpRequest;c.open("GET",a.url,!0);c.onload=function(){if(200<=c.status&&300>c.status){var a=JSON.parse(c.responseText);this.l(a)}else this.c()}.bind(this);c.send()}}y(jx,Y);
jx.prototype.l=function(a){var c=qd("EPSG:4326"),d=this.f,e;void 0!==a.bounds&&(e=cd(a.bounds,ud(c,d)));var f=a.minzoom||0,g=a.maxzoom||22;this.tileGrid=d=Hg({extent:Fg(d),maxZoom:g,minZoom:f});this.tileUrlFunction=qn(a.tiles,d);if(void 0!==a.attribution&&!this.ea()){c=void 0!==e?e:c.G();e={};for(var h;f<=g;++f)h=f.toString(),e[h]=[yg(d,c,f)];this.ma([new Qe({html:a.attribution,tileRanges:e})])}tg(this,"ready")};jx.prototype.c=function(){tg(this,"error")};function kx(a){Ig.call(this,{projection:qd("EPSG:3857"),state:"loading"});this.l=void 0!==a.preemptive?a.preemptive:!0;this.i=sn;this.c=void 0;zw(a.url,this.Jm.bind(this))}y(kx,Ig);l=kx.prototype;l.bk=function(){return this.c};l.oj=function(a,c,d,e,f){this.tileGrid?(c=this.tileGrid.$d(a,c),lx(this.Qb(c[0],c[1],c[2],1,this.f),a,d,e,f)):!0===f?bh(function(){d.call(e,null)}):d.call(e,null)};
l.Jm=function(a){var c=qd("EPSG:4326"),d=this.f,e;void 0!==a.bounds&&(e=cd(a.bounds,ud(c,d)));var f=a.minzoom||0,g=a.maxzoom||22;this.tileGrid=d=Hg({extent:Fg(d),maxZoom:g,minZoom:f});this.c=a.template;var h=a.grids;if(h){this.i=qn(h,d);if(void 0!==a.attribution){c=void 0!==e?e:c.G();for(e={};f<=g;++f)h=f.toString(),e[h]=[yg(d,c,f)];this.ma([new Qe({html:a.attribution,tileRanges:e})])}tg(this,"ready")}else tg(this,"error")};
l.Qb=function(a,c,d,e,f){var g=this.Db(a,c,d);if(lg(this.a,g))return this.a.get(g);a=[a,c,d];c=Lg(this,a,f);e=this.i(c,e,f);e=new mx(a,void 0!==e?0:4,void 0!==e?e:"",this.tileGrid.Ca(a),this.l);this.a.set(g,e);return e};l.Of=function(a,c,d){a=this.Db(a,c,d);lg(this.a,a)&&this.a.get(a)};function mx(a,c,d,e,f){pg.call(this,a,c);this.l=d;this.g=e;this.o=f;this.j=this.i=this.c=null}y(mx,pg);l=mx.prototype;l.cb=function(){return null};
l.getData=function(a){if(!this.c||!this.i||!this.j)return null;var c=this.c[Math.floor((1-(a[1]-this.g[1])/(this.g[3]-this.g[1]))*this.c.length)];if("string"!==typeof c)return null;a=c.charCodeAt(Math.floor((a[0]-this.g[0])/(this.g[2]-this.g[0])*c.length));93<=a&&a--;35<=a&&a--;a-=32;return a in this.i?this.j[this.i[a]]:null};
function lx(a,c,d,e,f){0==a.state&&!0===f?(xb(a,"change",function(){d.call(e,this.getData(c))},a),nx(a)):!0===f?bh(function(){d.call(e,this.getData(c))},a):d.call(e,a.getData(c))}l.eb=function(){return this.l};l.nk=function(){this.state=3;qg(this)};l.Im=function(a){this.c=a.grid;this.i=a.keys;this.j=a.data;this.state=4;qg(this)};function nx(a){0==a.state&&(a.state=1,zw(a.l,a.Im.bind(a),a.nk.bind(a)))}l.load=function(){this.o&&nx(this)};function ox(a){a=a||{};var c=a.params||{};Y.call(this,{attributions:a.attributions,crossOrigin:a.crossOrigin,logo:a.logo,opaque:!("TRANSPARENT"in c?c.TRANSPARENT:1),projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileGrid:a.tileGrid,tileLoadFunction:a.tileLoadFunction,url:a.url,urls:a.urls,wrapX:void 0!==a.wrapX?a.wrapX:!0});this.s=void 0!==a.gutter?a.gutter:0;this.c=c;this.aa="";px(this);this.l=!0;this.A=a.serverType;this.S=void 0!==a.hidpi?a.hidpi:!0;this.H="";qx(this);
this.U=yc();rx(this)}y(ox,Y);l=ox.prototype;
l.Km=function(a,c,d,e){d=qd(d);var f=this.tileGrid;f||(f=this.Za(d));c=f.$d(a,c);if(!(f.Pb().length<=c[0])){var g=f.Z(c[0]),h=f.Ca(c,this.U),f=Sb(f.Ua(c[0]),this.j),k=this.s;0!==k&&(f=Qb(f,k,this.j),h=Ac(h,g*k,h));k={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",FORMAT:"image/png",TRANSPARENT:!0,QUERY_LAYERS:this.c.LAYERS};mb(k,this.c,e);e=Math.floor((h[3]-a[1])/g);k[this.l?"I":"X"]=Math.floor((a[0]-h[0])/g);k[this.l?"J":"Y"]=e;return sx(this,c,f,h,1,d,k)}};l.af=function(){return this.s};
l.bf=function(){return this.aa};l.Db=function(a,c,d){return this.H+ox.ia.Db.call(this,a,c,d)};l.Lm=function(){return this.c};
function sx(a,c,d,e,f,g,h){var k=a.urls;if(k){h.WIDTH=d[0];h.HEIGHT=d[1];h[a.l?"CRS":"SRS"]=g.lb;"STYLES"in a.c||(h.STYLES=new String(""));if(1!=f)switch(a.A){case "geoserver":d=90*f+.5|0;h.FORMAT_OPTIONS="FORMAT_OPTIONS"in h?h.FORMAT_OPTIONS+(";dpi:"+d):"dpi:"+d;break;case "mapserver":h.MAP_RESOLUTION=90*f;break;case "carmentaserver":case "qgis":h.DPI=90*f}g=g.f;a.l&&"ne"==g.substr(0,2)&&(a=e[0],e[0]=e[1],e[1]=a,a=e[2],e[2]=e[3],e[3]=a);h.BBOX=e.join(",");return Xq(Zq([1==k.length?k[0]:k[$b((c[1]<<
c[0])+c[2],k.length)]],h))}}l.uc=function(a){return this.S&&void 0!==this.A?a:1};function qx(a){var c=0,d=[];if(a.urls){var e,f;e=0;for(f=a.urls.length;e<f;++e)d[c++]=a.urls[e]}a.H=d.join("#")}function px(a){var c=0,d=[],e;for(e in a.c)d[c++]=e+"-"+a.c[e];a.aa=d.join("/")}
l.qc=function(a,c,d){var e=this.tileGrid;e||(e=this.Za(d));if(!(e.Pb().length<=a[0])){1==c||this.S&&void 0!==this.A||(c=1);var f=e.Z(a[0]),g=e.Ca(a,this.U),e=Sb(e.Ua(a[0]),this.j),h=this.s;0!==h&&(e=Qb(e,h,this.j),g=Ac(g,f*h,g));1!=c&&(e=Rb(e,c,this.j));f={SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetMap",FORMAT:"image/png",TRANSPARENT:!0};mb(f,this.c);return sx(this,a,e,g,c,d,f)}};l.Mm=function(a){mb(this.c,a);qx(this);px(this);rx(this);this.u()};
function rx(a){a.l=0<=Ja(a.c.VERSION||"1.3.0","1.3")};function tx(a){this.j=a.matrixIds;ug.call(this,{extent:a.extent,origin:a.origin,origins:a.origins,resolutions:a.resolutions,tileSize:a.tileSize,tileSizes:a.tileSizes,sizes:a.sizes})}y(tx,ug);tx.prototype.o=function(){return this.j};
function ux(a,c){var d=[],e=[],f=[],g=[],h=[],k;k=qd(a.SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3"));var m=k.$b(),n="ne"==k.f.substr(0,2);a.TileMatrix.sort(function(a,c){return c.ScaleDenominator-a.ScaleDenominator});a.TileMatrix.forEach(function(a){e.push(a.Identifier);var c=2.8E-4*a.ScaleDenominator/m,k=a.TileWidth,t=a.TileHeight;n?f.push([a.TopLeftCorner[1],a.TopLeftCorner[0]]):f.push(a.TopLeftCorner);d.push(c);g.push(k==t?k:[k,t]);h.push([a.MatrixWidth,-a.MatrixHeight])});
return new tx({extent:c,origins:f,resolutions:d,matrixIds:e,tileSizes:g,sizes:h})};function Z(a){function c(a){a="KVP"==e?Xq(Zq([a],g)):a.replace(/\{(\w+?)\}/g,function(a,c){return c.toLowerCase()in g?g[c.toLowerCase()]:a});return function(c){if(c){var d={TileMatrix:f.j[c[0]],TileCol:c[1],TileRow:-c[2]-1};mb(d,h);c=a;return c="KVP"==e?Xq(Zq([c],d)):c.replace(/\{(\w+?)\}/g,function(a,c){return d[c]})}}}this.U=void 0!==a.version?a.version:"1.0.0";this.A=void 0!==a.format?a.format:"image/jpeg";this.c=void 0!==a.dimensions?a.dimensions:{};this.l="";vx(this);this.H=a.layer;this.s=a.matrixSet;
this.S=a.style;var d=a.urls;void 0===d&&void 0!==a.url&&(d=tn(a.url));var e=this.aa=void 0!==a.requestEncoding?a.requestEncoding:"KVP",f=a.tileGrid,g={layer:this.H,style:this.S,tilematrixset:this.s};"KVP"==e&&mb(g,{Service:"WMTS",Request:"GetTile",Version:this.U,Format:this.A});var h=this.c,k=d&&0<d.length?rn(d.map(c)):sn;Y.call(this,{attributions:a.attributions,crossOrigin:a.crossOrigin,logo:a.logo,projection:a.projection,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileClass:a.tileClass,
tileGrid:f,tileLoadFunction:a.tileLoadFunction,tilePixelRatio:a.tilePixelRatio,tileUrlFunction:k,urls:d,wrapX:void 0!==a.wrapX?a.wrapX:!1})}y(Z,Y);l=Z.prototype;l.Aj=function(){return this.c};l.Nm=function(){return this.A};l.bf=function(){return this.l};l.Om=function(){return this.H};l.Nj=function(){return this.s};l.$j=function(){return this.aa};l.Pm=function(){return this.S};l.fk=function(){return this.U};function vx(a){var c=0,d=[],e;for(e in a.c)d[c++]=e+"-"+a.c[e];a.l=d.join("/")}
l.Ko=function(a){mb(this.c,a);vx(this);this.u()};function wx(a){a=a||{};var c=a.size,d=c[0],e=c[1],f=[],g=256;switch(void 0!==a.tierSizeCalculation?a.tierSizeCalculation:"default"){case "default":for(;d>g||e>g;)f.push([Math.ceil(d/g),Math.ceil(e/g)]),g+=g;break;case "truncated":for(;d>g||e>g;)f.push([Math.ceil(d/g),Math.ceil(e/g)]),d>>=1,e>>=1}f.push([1,1]);f.reverse();for(var g=[1],h=[0],e=1,d=f.length;e<d;e++)g.push(1<<e),h.push(f[e-1][0]*f[e-1][1]+h[e-1]);g.reverse();var c=[0,-c[1],c[0],0],c=new ug({extent:c,origin:Sc(c),resolutions:g}),k=a.url;
Y.call(this,{attributions:a.attributions,crossOrigin:a.crossOrigin,logo:a.logo,reprojectionErrorThreshold:a.reprojectionErrorThreshold,tileClass:xx,tileGrid:c,tileUrlFunction:function(a){if(a){var c=a[0],d=a[1];a=-a[2]-1;return k+"TileGroup"+((d+a*f[c][0]+h[c])/256|0)+"/"+c+"-"+d+"-"+a+".jpg"}}})}y(wx,Y);function xx(a,c,d,e,f){tv.call(this,a,c,d,e,f);this.i={}}y(xx,tv);
xx.prototype.cb=function(a){var c=void 0!==a?x(a).toString():"";if(c in this.i)return this.i[c];a=xx.ia.cb.call(this,a);if(2==this.state){if(256==a.width&&256==a.height)return this.i[c]=a;var d=nh(256,256);d.drawImage(a,0,0);return this.i[c]=d.canvas}return a};function Jk(a,c,d,e,f,g){if(d+a.b>a.g||e+a.b>a.g)return null;f=yx(a,!1,c,d,e,f);if(!f)return null;a=yx(a,!0,c,d,e,void 0!==g?g:gd);return{offsetX:f.offsetX,offsetY:f.offsetY,image:f.image,Ig:a.image}}
function yx(a,c,d,e,f,g){var h=c?a.i:a.c,k,m,n;m=0;for(n=h.length;m<n;++m){k=h[m];a:{var p=k,q=d,r=e,t=f,v=g,w=void 0,A=void 0;k=void 0;A=0;for(k=p.a.length;A<k;++A)if(w=p.a[A],w.width>=r+p.b&&w.height>=t+p.b){k={offsetX:w.x+p.b,offsetY:w.y+p.b,image:p.g};p.f[q]=k;v.call(void 0,p.c,w.x+p.b,w.y+p.b);q=p;r=r+p.b;p=t+p.b;v=t=void 0;w.width-r>w.height-p?(t={x:w.x+r,y:w.y,width:w.width-r,height:w.height},v={x:w.x,y:w.y+p,width:r,height:w.height-p},zx(q,A,t,v)):(t={x:w.x+r,y:w.y,width:w.width-r,height:p},
v={x:w.x,y:w.y+p,width:w.width,height:w.height-p},zx(q,A,t,v));break a}k=null}if(k)return k;k||m!==n-1||(c?(k=Math.min(2*a.f,a.g),a.f=k):(k=Math.min(2*a.a,a.g),a.a=k),k=new Ax(k,a.b),h.push(k),++n)}}function Ax(a,c){this.b=c;this.a=[{x:0,y:0,width:a,height:a}];this.f={};this.g=document.createElement("CANVAS");this.g.width=a;this.g.height=a;this.c=this.g.getContext("2d")}Ax.prototype.get=function(a){return this.f[a]||null};
function zx(a,c,d,e){c=[c,1];0<d.width&&0<d.height&&c.push(d);0<e.width&&0<e.height&&c.push(e);a.a.splice.apply(a.a,c)};function Bx(a){this.T=this.f=this.c=null;this.o=void 0!==a.fill?a.fill:null;this.ta=[0,0];this.b=a.points;this.g=void 0!==a.radius?a.radius:a.radius1;this.i=void 0!==a.radius2?a.radius2:this.g;this.l=void 0!==a.angle?a.angle:0;this.a=void 0!==a.stroke?a.stroke:null;this.H=this.ua=this.D=null;var c=a.atlasManager,d="",e="",f=0,g=null,h,k=0;this.a&&(h=Ze(this.a.b),k=this.a.a,void 0===k&&(k=1),g=this.a.g,Ah||(g=null),e=this.a.c,void 0===e&&(e="round"),d=this.a.f,void 0===d&&(d="round"),f=this.a.i,void 0===
f&&(f=10));var m=2*(this.g+k)+1,d={strokeStyle:h,Dd:k,size:m,lineCap:d,lineDash:g,lineJoin:e,miterLimit:f};if(void 0===c){this.f=document.createElement("CANVAS");this.f.height=m;this.f.width=m;var c=m=this.f.width,n=this.f.getContext("2d");this.sh(d,n,0,0);this.o?this.T=this.f:(n=this.T=document.createElement("CANVAS"),n.height=d.size,n.width=d.size,n=n.getContext("2d"),this.rh(d,n,0,0))}else m=Math.round(m),(e=!this.o)&&(n=this.rh.bind(this,d)),f=this.a?Hk(this.a):"-",g=this.o?Bk(this.o):"-",this.c&&
f==this.c[1]&&g==this.c[2]&&this.g==this.c[3]&&this.i==this.c[4]&&this.l==this.c[5]&&this.b==this.c[6]||(this.c=["r"+f+g+(void 0!==this.g?this.g.toString():"-")+(void 0!==this.i?this.i.toString():"-")+(void 0!==this.l?this.l.toString():"-")+(void 0!==this.b?this.b.toString():"-"),f,g,this.g,this.i,this.l,this.b]),n=Jk(c,this.c[0],m,m,this.sh.bind(this,d),n),this.f=n.image,this.ta=[n.offsetX,n.offsetY],c=n.image.width,this.T=e?n.Ig:this.f;this.D=[m/2,m/2];this.ua=[m,m];this.H=[c,c];Vi.call(this,{opacity:1,
rotateWithView:void 0!==a.rotateWithView?a.rotateWithView:!1,rotation:void 0!==a.rotation?a.rotation:0,scale:1,snapToPixel:void 0!==a.snapToPixel?a.snapToPixel:!0})}y(Bx,Vi);l=Bx.prototype;l.Yb=function(){return this.D};l.Um=function(){return this.l};l.Vm=function(){return this.o};l.qe=function(){return this.T};l.gc=function(){return this.f};l.qd=function(){return this.H};l.wd=function(){return 2};l.Ha=function(){return this.ta};l.Wm=function(){return this.b};l.Xm=function(){return this.g};l.Zj=function(){return this.i};
l.Eb=function(){return this.ua};l.Ym=function(){return this.a};l.hf=va;l.load=va;l.Nf=va;
l.sh=function(a,c,d,e){var f;c.setTransform(1,0,0,1,0,0);c.translate(d,e);c.beginPath();this.i!==this.g&&(this.b*=2);for(d=0;d<=this.b;d++)e=2*d*Math.PI/this.b-Math.PI/2+this.l,f=0===d%2?this.g:this.i,c.lineTo(a.size/2+f*Math.cos(e),a.size/2+f*Math.sin(e));this.o&&(c.fillStyle=af(this.o.b),c.fill());this.a&&(c.strokeStyle=a.strokeStyle,c.lineWidth=a.Dd,a.lineDash&&c.setLineDash(a.lineDash),c.lineCap=a.lineCap,c.lineJoin=a.lineJoin,c.miterLimit=a.miterLimit,c.stroke());c.closePath()};
l.rh=function(a,c,d,e){c.setTransform(1,0,0,1,0,0);c.translate(d,e);c.beginPath();this.i!==this.g&&(this.b*=2);var f;for(d=0;d<=this.b;d++)f=2*d*Math.PI/this.b-Math.PI/2+this.l,e=0===d%2?this.g:this.i,c.lineTo(a.size/2+e*Math.cos(f),a.size/2+e*Math.sin(f));c.fillStyle=wk;c.fill();this.a&&(c.strokeStyle=a.strokeStyle,c.lineWidth=a.Dd,a.lineDash&&c.setLineDash(a.lineDash),c.stroke());c.closePath()};u("ol.animation.bounce",function(a){var c=a.resolution,d=a.start?a.start:Date.now(),e=void 0!==a.duration?a.duration:1E3,f=a.easing?a.easing:Ge;return function(a,h){if(h.time<d)return h.animate=!0,h.viewHints[0]+=1,!0;if(h.time<d+e){var k=f((h.time-d)/e),m=c-h.viewState.resolution;h.animate=!0;h.viewState.resolution+=k*m;h.viewHints[0]+=1;return!0}return!1}},OPENLAYERS);u("ol.animation.pan",He,OPENLAYERS);u("ol.animation.rotate",Ie,OPENLAYERS);u("ol.animation.zoom",Je,OPENLAYERS);
u("ol.Attribution",Qe,OPENLAYERS);Qe.prototype.getHTML=Qe.prototype.g;Re.prototype.element=Re.prototype.element;u("ol.Collection",Se,OPENLAYERS);Se.prototype.clear=Se.prototype.clear;Se.prototype.extend=Se.prototype.jf;Se.prototype.forEach=Se.prototype.forEach;Se.prototype.getArray=Se.prototype.il;Se.prototype.item=Se.prototype.item;Se.prototype.getLength=Se.prototype.ac;Se.prototype.insertAt=Se.prototype.de;Se.prototype.pop=Se.prototype.pop;Se.prototype.push=Se.prototype.push;
Se.prototype.remove=Se.prototype.remove;Se.prototype.removeAt=Se.prototype.If;Se.prototype.setAt=Se.prototype.qo;u("ol.colorlike.asColorLike",af,OPENLAYERS);u("ol.coordinate.add",bc,OPENLAYERS);u("ol.coordinate.createStringXY",function(a){return function(c){return jc(c,a)}},OPENLAYERS);u("ol.coordinate.format",ec,OPENLAYERS);u("ol.coordinate.rotate",gc,OPENLAYERS);u("ol.coordinate.toStringHDMS",function(a,c){return a?dc(a[1],"NS",c)+" "+dc(a[0],"EW",c):""},OPENLAYERS);
u("ol.coordinate.toStringXY",jc,OPENLAYERS);u("ol.DeviceOrientation",cp,OPENLAYERS);cp.prototype.getAlpha=cp.prototype.uj;cp.prototype.getBeta=cp.prototype.xj;cp.prototype.getGamma=cp.prototype.Dj;cp.prototype.getHeading=cp.prototype.jl;cp.prototype.getTracking=cp.prototype.Pg;cp.prototype.setTracking=cp.prototype.kf;u("ol.easing.easeIn",Ce,OPENLAYERS);u("ol.easing.easeOut",De,OPENLAYERS);u("ol.easing.inAndOut",Ee,OPENLAYERS);u("ol.easing.linear",Fe,OPENLAYERS);u("ol.easing.upAndDown",Ge,OPENLAYERS);
u("ol.extent.boundingExtent",xc,OPENLAYERS);u("ol.extent.buffer",Ac,OPENLAYERS);u("ol.extent.containsCoordinate",Dc,OPENLAYERS);u("ol.extent.containsExtent",Gc,OPENLAYERS);u("ol.extent.containsXY",Fc,OPENLAYERS);u("ol.extent.createEmpty",yc,OPENLAYERS);u("ol.extent.equals",Mc,OPENLAYERS);u("ol.extent.extend",Nc,OPENLAYERS);u("ol.extent.getBottomLeft",Pc,OPENLAYERS);u("ol.extent.getBottomRight",Qc,OPENLAYERS);u("ol.extent.getCenter",Yc,OPENLAYERS);u("ol.extent.getHeight",Xc,OPENLAYERS);
u("ol.extent.getIntersection",$c,OPENLAYERS);u("ol.extent.getSize",function(a){return[a[2]-a[0],a[3]-a[1]]},OPENLAYERS);u("ol.extent.getTopLeft",Sc,OPENLAYERS);u("ol.extent.getTopRight",Rc,OPENLAYERS);u("ol.extent.getWidth",Wc,OPENLAYERS);u("ol.extent.intersects",ad,OPENLAYERS);u("ol.extent.isEmpty",Vc,OPENLAYERS);u("ol.extent.applyTransform",cd,OPENLAYERS);u("ol.Feature",Xl,OPENLAYERS);Xl.prototype.clone=Xl.prototype.clone;Xl.prototype.getGeometry=Xl.prototype.X;Xl.prototype.getId=Xl.prototype.Sa;
Xl.prototype.getGeometryName=Xl.prototype.Fj;Xl.prototype.getStyle=Xl.prototype.ll;Xl.prototype.getStyleFunction=Xl.prototype.bc;Xl.prototype.setGeometry=Xl.prototype.Pa;Xl.prototype.setStyle=Xl.prototype.lf;Xl.prototype.setId=Xl.prototype.jc;Xl.prototype.setGeometryName=Xl.prototype.Bc;u("ol.featureloader.tile",Pm,OPENLAYERS);u("ol.featureloader.xhr",Qm,OPENLAYERS);u("ol.Geolocation",hv,OPENLAYERS);hv.prototype.getAccuracy=hv.prototype.sj;hv.prototype.getAccuracyGeometry=hv.prototype.tj;
hv.prototype.getAltitude=hv.prototype.vj;hv.prototype.getAltitudeAccuracy=hv.prototype.wj;hv.prototype.getHeading=hv.prototype.nl;hv.prototype.getPosition=hv.prototype.ol;hv.prototype.getProjection=hv.prototype.Qg;hv.prototype.getSpeed=hv.prototype.ak;hv.prototype.getTracking=hv.prototype.Rg;hv.prototype.getTrackingOptions=hv.prototype.Cg;hv.prototype.setProjection=hv.prototype.Sg;hv.prototype.setTracking=hv.prototype.he;hv.prototype.setTrackingOptions=hv.prototype.$h;u("ol.Graticule",nv,OPENLAYERS);
nv.prototype.getMap=nv.prototype.rl;nv.prototype.getMeridians=nv.prototype.Oj;nv.prototype.getParallels=nv.prototype.Vj;nv.prototype.setMap=nv.prototype.setMap;u("ol.has.DEVICE_PIXEL_RATIO",zh,OPENLAYERS);u("ol.has.CANVAS",Bh,OPENLAYERS);u("ol.has.DEVICE_ORIENTATION",Ch,OPENLAYERS);u("ol.has.GEOLOCATION",Dh,OPENLAYERS);u("ol.has.TOUCH",Eh,OPENLAYERS);u("ol.has.WEBGL",uh,OPENLAYERS);sv.prototype.getImage=sv.prototype.a;tv.prototype.getImage=tv.prototype.cb;u("ol.Kinetic",lj,OPENLAYERS);
u("ol.loadingstrategy.all",Rm,OPENLAYERS);u("ol.loadingstrategy.bbox",function(a){return[a]},OPENLAYERS);u("ol.loadingstrategy.tile",function(a){return function(c,d){var e=Dg(a,d),f=yg(a,c,e),g=[],e=[e,0,0];for(e[1]=f.ra;e[1]<=f.va;++e[1])for(e[2]=f.xa;e[2]<=f.Aa;++e[2])g.push(a.Ca(e));return g}},OPENLAYERS);u("ol.Map",S,OPENLAYERS);S.prototype.addControl=S.prototype.bj;S.prototype.addInteraction=S.prototype.cj;S.prototype.addLayer=S.prototype.ag;S.prototype.addOverlay=S.prototype.bg;
S.prototype.beforeRender=S.prototype.Ra;S.prototype.forEachFeatureAtPixel=S.prototype.od;S.prototype.forEachLayerAtPixel=S.prototype.vl;S.prototype.hasFeatureAtPixel=S.prototype.Ok;S.prototype.getEventCoordinate=S.prototype.Bj;S.prototype.getEventPixel=S.prototype.Td;S.prototype.getTarget=S.prototype.Ug;S.prototype.getTargetElement=S.prototype.tc;S.prototype.getCoordinateFromPixel=S.prototype.La;S.prototype.getControls=S.prototype.zj;S.prototype.getOverlays=S.prototype.Tj;
S.prototype.getOverlayById=S.prototype.Sj;S.prototype.getInteractions=S.prototype.Gj;S.prototype.getLayerGroup=S.prototype.sc;S.prototype.getLayers=S.prototype.Tg;S.prototype.getPixelFromCoordinate=S.prototype.Ta;S.prototype.getSize=S.prototype.Va;S.prototype.getView=S.prototype.$;S.prototype.getViewport=S.prototype.gk;S.prototype.renderSync=S.prototype.mo;S.prototype.render=S.prototype.render;S.prototype.removeControl=S.prototype.eo;S.prototype.removeInteraction=S.prototype.fo;
S.prototype.removeLayer=S.prototype.io;S.prototype.removeOverlay=S.prototype.jo;S.prototype.setLayerGroup=S.prototype.Sh;S.prototype.setSize=S.prototype.Mf;S.prototype.setTarget=S.prototype.wl;S.prototype.setView=S.prototype.Ao;S.prototype.updateSize=S.prototype.Xc;ni.prototype.originalEvent=ni.prototype.originalEvent;ni.prototype.pixel=ni.prototype.pixel;ni.prototype.coordinate=ni.prototype.coordinate;ni.prototype.dragging=ni.prototype.dragging;ni.prototype.preventDefault=ni.prototype.preventDefault;
ni.prototype.stopPropagation=ni.prototype.stopPropagation;ig.prototype.map=ig.prototype.map;ig.prototype.frameState=ig.prototype.frameState;Lb.prototype.key=Lb.prototype.key;Lb.prototype.oldValue=Lb.prototype.oldValue;u("ol.Object",Mb,OPENLAYERS);Mb.prototype.get=Mb.prototype.get;Mb.prototype.getKeys=Mb.prototype.O;Mb.prototype.getProperties=Mb.prototype.P;Mb.prototype.set=Mb.prototype.set;Mb.prototype.setProperties=Mb.prototype.C;Mb.prototype.unset=Mb.prototype.R;u("ol.Observable",Jb,OPENLAYERS);
u("ol.Observable.unByKey",Kb,OPENLAYERS);Jb.prototype.changed=Jb.prototype.u;Jb.prototype.dispatchEvent=Jb.prototype.b;Jb.prototype.getRevision=Jb.prototype.L;Jb.prototype.on=Jb.prototype.I;Jb.prototype.once=Jb.prototype.M;Jb.prototype.un=Jb.prototype.K;Jb.prototype.unByKey=Jb.prototype.N;u("ol.inherits",y,OPENLAYERS);u("ol.Overlay",Jo,OPENLAYERS);Jo.prototype.getElement=Jo.prototype.ie;Jo.prototype.getId=Jo.prototype.Sa;Jo.prototype.getMap=Jo.prototype.je;Jo.prototype.getOffset=Jo.prototype.Ag;
Jo.prototype.getPosition=Jo.prototype.Vg;Jo.prototype.getPositioning=Jo.prototype.Bg;Jo.prototype.setElement=Jo.prototype.Oh;Jo.prototype.setMap=Jo.prototype.setMap;Jo.prototype.setOffset=Jo.prototype.Uh;Jo.prototype.setPosition=Jo.prototype.mf;Jo.prototype.setPositioning=Jo.prototype.Xh;
u("ol.render.toContext",function(a,c){var d=a.canvas,e=c?c:{},f=e.pixelRatio||zh;if(e=e.size)d.width=e[0]*f,d.height=e[1]*f,d.style.width=e[0]+"px",d.style.height=e[1]+"px";d=[0,0,d.width,d.height];e=Ji(nc(),0,0,f,f,0,0,0);return new Rk(a,f,d,e,0)},OPENLAYERS);u("ol.size.toSize",Sb,OPENLAYERS);pg.prototype.getTileCoord=pg.prototype.f;Zl.prototype.getFormat=Zl.prototype.xl;Zl.prototype.setFeatures=Zl.prototype.Ph;Zl.prototype.setLoader=Zl.prototype.Th;u("ol.View",xe,OPENLAYERS);
xe.prototype.constrainCenter=xe.prototype.Qd;xe.prototype.constrainResolution=xe.prototype.constrainResolution;xe.prototype.constrainRotation=xe.prototype.constrainRotation;xe.prototype.getCenter=xe.prototype.Wa;xe.prototype.calculateExtent=xe.prototype.bd;xe.prototype.getProjection=xe.prototype.yl;xe.prototype.getResolution=xe.prototype.Z;xe.prototype.getRotation=xe.prototype.Ka;xe.prototype.getZoom=xe.prototype.ik;xe.prototype.fit=xe.prototype.Ye;xe.prototype.centerOn=xe.prototype.lj;
xe.prototype.rotate=xe.prototype.rotate;xe.prototype.setCenter=xe.prototype.mb;xe.prototype.setResolution=xe.prototype.Vb;xe.prototype.setRotation=xe.prototype.ke;xe.prototype.setZoom=xe.prototype.Do;u("ol.xml.getAllTextContent",im,OPENLAYERS);u("ol.xml.parse",Cm,OPENLAYERS);Qn.prototype.getGL=Qn.prototype.qn;Qn.prototype.useProgram=Qn.prototype.xe;u("ol.tilegrid.TileGrid",ug,OPENLAYERS);ug.prototype.getMaxZoom=ug.prototype.yg;ug.prototype.getMinZoom=ug.prototype.zg;ug.prototype.getOrigin=ug.prototype.Ha;
ug.prototype.getResolution=ug.prototype.Z;ug.prototype.getResolutions=ug.prototype.Pb;ug.prototype.getTileCoordExtent=ug.prototype.Ca;ug.prototype.getTileCoordForCoordAndResolution=ug.prototype.$d;ug.prototype.getTileCoordForCoordAndZ=ug.prototype.ud;ug.prototype.getTileSize=ug.prototype.Ua;u("ol.tilegrid.createXYZ",Hg,OPENLAYERS);u("ol.tilegrid.WMTS",tx,OPENLAYERS);tx.prototype.getMatrixIds=tx.prototype.o;u("ol.tilegrid.WMTS.createFromCapabilitiesMatrixSet",ux,OPENLAYERS);
u("ol.style.AtlasManager",function(a){a=a||{};this.a=void 0!==a.initialSize?a.initialSize:256;this.g=void 0!==a.maxSize?a.maxSize:void 0!==ta?ta:2048;this.b=void 0!==a.space?a.space:1;this.c=[new Ax(this.a,this.b)];this.f=this.a;this.i=[new Ax(this.f,this.b)]},OPENLAYERS);u("ol.style.Circle",Ik,OPENLAYERS);Ik.prototype.getFill=Ik.prototype.Qm;Ik.prototype.getImage=Ik.prototype.gc;Ik.prototype.getRadius=Ik.prototype.Rm;Ik.prototype.getStroke=Ik.prototype.Sm;u("ol.style.Fill",Ak,OPENLAYERS);
Ak.prototype.getColor=Ak.prototype.g;Ak.prototype.setColor=Ak.prototype.f;u("ol.style.Icon",Wi,OPENLAYERS);Wi.prototype.getAnchor=Wi.prototype.Yb;Wi.prototype.getImage=Wi.prototype.gc;Wi.prototype.getOrigin=Wi.prototype.Ha;Wi.prototype.getSrc=Wi.prototype.Tm;Wi.prototype.getSize=Wi.prototype.Eb;Wi.prototype.load=Wi.prototype.load;u("ol.style.Image",Vi,OPENLAYERS);Vi.prototype.getOpacity=Vi.prototype.re;Vi.prototype.getRotateWithView=Vi.prototype.Yd;Vi.prototype.getRotation=Vi.prototype.se;
Vi.prototype.getScale=Vi.prototype.te;Vi.prototype.getSnapToPixel=Vi.prototype.Zd;Vi.prototype.setOpacity=Vi.prototype.ue;Vi.prototype.setRotation=Vi.prototype.ve;Vi.prototype.setScale=Vi.prototype.we;u("ol.style.RegularShape",Bx,OPENLAYERS);Bx.prototype.getAnchor=Bx.prototype.Yb;Bx.prototype.getAngle=Bx.prototype.Um;Bx.prototype.getFill=Bx.prototype.Vm;Bx.prototype.getImage=Bx.prototype.gc;Bx.prototype.getOrigin=Bx.prototype.Ha;Bx.prototype.getPoints=Bx.prototype.Wm;Bx.prototype.getRadius=Bx.prototype.Xm;
Bx.prototype.getRadius2=Bx.prototype.Zj;Bx.prototype.getSize=Bx.prototype.Eb;Bx.prototype.getStroke=Bx.prototype.Ym;u("ol.style.Stroke",Gk,OPENLAYERS);Gk.prototype.getColor=Gk.prototype.Zm;Gk.prototype.getLineCap=Gk.prototype.Jj;Gk.prototype.getLineDash=Gk.prototype.$m;Gk.prototype.getLineJoin=Gk.prototype.Kj;Gk.prototype.getMiterLimit=Gk.prototype.Pj;Gk.prototype.getWidth=Gk.prototype.an;Gk.prototype.setColor=Gk.prototype.bn;Gk.prototype.setLineCap=Gk.prototype.vo;Gk.prototype.setLineDash=Gk.prototype.cn;
Gk.prototype.setLineJoin=Gk.prototype.wo;Gk.prototype.setMiterLimit=Gk.prototype.xo;Gk.prototype.setWidth=Gk.prototype.Bo;u("ol.style.Style",Kk,OPENLAYERS);Kk.prototype.getGeometry=Kk.prototype.X;Kk.prototype.getGeometryFunction=Kk.prototype.Ej;Kk.prototype.getFill=Kk.prototype.dn;Kk.prototype.getImage=Kk.prototype.en;Kk.prototype.getStroke=Kk.prototype.fn;Kk.prototype.getText=Kk.prototype.Fa;Kk.prototype.getZIndex=Kk.prototype.gn;Kk.prototype.setGeometry=Kk.prototype.th;Kk.prototype.setZIndex=Kk.prototype.hn;
u("ol.style.Text",sr,OPENLAYERS);sr.prototype.getFont=sr.prototype.Cj;sr.prototype.getOffsetX=sr.prototype.Qj;sr.prototype.getOffsetY=sr.prototype.Rj;sr.prototype.getFill=sr.prototype.jn;sr.prototype.getRotation=sr.prototype.kn;sr.prototype.getScale=sr.prototype.ln;sr.prototype.getStroke=sr.prototype.mn;sr.prototype.getText=sr.prototype.Fa;sr.prototype.getTextAlign=sr.prototype.ck;sr.prototype.getTextBaseline=sr.prototype.dk;sr.prototype.setFont=sr.prototype.so;sr.prototype.setOffsetX=sr.prototype.Vh;
sr.prototype.setOffsetY=sr.prototype.Wh;sr.prototype.setFill=sr.prototype.ro;sr.prototype.setRotation=sr.prototype.nn;sr.prototype.setScale=sr.prototype.pn;sr.prototype.setStroke=sr.prototype.yo;sr.prototype.setText=sr.prototype.Yh;sr.prototype.setTextAlign=sr.prototype.Zh;sr.prototype.setTextBaseline=sr.prototype.zo;u("ol.Sphere",kd,OPENLAYERS);kd.prototype.geodesicArea=kd.prototype.a;kd.prototype.haversineDistance=kd.prototype.b;u("ol.source.BingMaps",Ew,OPENLAYERS);
u("ol.source.BingMaps.TOS_ATTRIBUTION",Fw,OPENLAYERS);u("ol.source.Cluster",Gw,OPENLAYERS);Gw.prototype.getSource=Gw.prototype.aa;u("ol.source.ImageCanvas",Wl,OPENLAYERS);u("ol.source.ImageMapGuide",Jw,OPENLAYERS);Jw.prototype.getParams=Jw.prototype.tm;Jw.prototype.getImageLoadFunction=Jw.prototype.sm;Jw.prototype.updateParams=Jw.prototype.vm;Jw.prototype.setImageLoadFunction=Jw.prototype.um;u("ol.source.Image",Pl,OPENLAYERS);Rl.prototype.image=Rl.prototype.image;u("ol.source.ImageStatic",Kw,OPENLAYERS);
u("ol.source.ImageVector",kn,OPENLAYERS);kn.prototype.getSource=kn.prototype.wm;kn.prototype.getStyle=kn.prototype.xm;kn.prototype.getStyleFunction=kn.prototype.ym;kn.prototype.setStyle=kn.prototype.kh;u("ol.source.ImageWMS",Lw,OPENLAYERS);Lw.prototype.getGetFeatureInfoUrl=Lw.prototype.Bm;Lw.prototype.getParams=Lw.prototype.Dm;Lw.prototype.getImageLoadFunction=Lw.prototype.Cm;Lw.prototype.getUrl=Lw.prototype.Em;Lw.prototype.setImageLoadFunction=Lw.prototype.Fm;Lw.prototype.setUrl=Lw.prototype.Gm;
Lw.prototype.updateParams=Lw.prototype.Hm;u("ol.source.MapQuest",Sw,OPENLAYERS);Sw.prototype.getLayer=Sw.prototype.l;u("ol.source.OSM",Qw,OPENLAYERS);u("ol.source.OSM.ATTRIBUTION",Rw,OPENLAYERS);u("ol.source.Raster",Vw,OPENLAYERS);Vw.prototype.setOperation=Vw.prototype.s;$w.prototype.extent=$w.prototype.extent;$w.prototype.resolution=$w.prototype.resolution;$w.prototype.data=$w.prototype.data;u("ol.source.Source",rg,OPENLAYERS);rg.prototype.getAttributions=rg.prototype.ea;rg.prototype.getLogo=rg.prototype.pa;
rg.prototype.getProjection=rg.prototype.sa;rg.prototype.getState=rg.prototype.V;rg.prototype.setAttributions=rg.prototype.ma;u("ol.source.Stamen",ex,OPENLAYERS);u("ol.source.TileArcGISRest",gx,OPENLAYERS);gx.prototype.getParams=gx.prototype.s;gx.prototype.updateParams=gx.prototype.A;u("ol.source.TileDebug",ix,OPENLAYERS);u("ol.source.TileImage",Y,OPENLAYERS);Y.prototype.setRenderReprojectionEdges=Y.prototype.zb;Y.prototype.setTileGridForProjection=Y.prototype.Ab;u("ol.source.TileJSON",jx,OPENLAYERS);
u("ol.source.Tile",Ig,OPENLAYERS);Ig.prototype.getTileGrid=Ig.prototype.Ma;Mg.prototype.tile=Mg.prototype.tile;u("ol.source.TileUTFGrid",kx,OPENLAYERS);kx.prototype.getTemplate=kx.prototype.bk;kx.prototype.forDataAtCoordinateAndResolution=kx.prototype.oj;u("ol.source.TileWMS",ox,OPENLAYERS);ox.prototype.getGetFeatureInfoUrl=ox.prototype.Km;ox.prototype.getParams=ox.prototype.Lm;ox.prototype.updateParams=ox.prototype.Mm;un.prototype.getTileLoadFunction=un.prototype.$a;
un.prototype.getTileUrlFunction=un.prototype.ab;un.prototype.getUrls=un.prototype.bb;un.prototype.setTileLoadFunction=un.prototype.jb;un.prototype.setTileUrlFunction=un.prototype.Na;un.prototype.setUrl=un.prototype.Xa;un.prototype.setUrls=un.prototype.Ya;u("ol.source.Vector",bn,OPENLAYERS);bn.prototype.addFeature=bn.prototype.rb;bn.prototype.addFeatures=bn.prototype.Gc;bn.prototype.clear=bn.prototype.clear;bn.prototype.forEachFeature=bn.prototype.mg;bn.prototype.forEachFeatureInExtent=bn.prototype.ub;
bn.prototype.forEachFeatureIntersectingExtent=bn.prototype.ng;bn.prototype.getFeaturesCollection=bn.prototype.ug;bn.prototype.getFeatures=bn.prototype.pe;bn.prototype.getFeaturesAtCoordinate=bn.prototype.tg;bn.prototype.getFeaturesInExtent=bn.prototype.$e;bn.prototype.getClosestFeatureToCoordinate=bn.prototype.pg;bn.prototype.getExtent=bn.prototype.G;bn.prototype.getFeatureById=bn.prototype.sg;bn.prototype.removeFeature=bn.prototype.nb;gn.prototype.feature=gn.prototype.feature;
u("ol.source.VectorTile",vn,OPENLAYERS);u("ol.source.WMTS",Z,OPENLAYERS);Z.prototype.getDimensions=Z.prototype.Aj;Z.prototype.getFormat=Z.prototype.Nm;Z.prototype.getLayer=Z.prototype.Om;Z.prototype.getMatrixSet=Z.prototype.Nj;Z.prototype.getRequestEncoding=Z.prototype.$j;Z.prototype.getStyle=Z.prototype.Pm;Z.prototype.getVersion=Z.prototype.fk;Z.prototype.updateDimensions=Z.prototype.Ko;
u("ol.source.WMTS.optionsFromCapabilities",function(a,c){var d=Za(a.Contents.Layer,function(a){return a.Identifier==c.layer}),e=a.Contents.TileMatrixSet,f,g;f=1<d.TileMatrixSetLink.length?"projection"in c?eb(d.TileMatrixSetLink,function(a){return Za(e,function(c){return c.Identifier==a.TileMatrixSet}).SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3")==c.projection}):eb(d.TileMatrixSetLink,function(a){return a.TileMatrixSet==c.matrixSet}):0;0>f&&(f=0);g=d.TileMatrixSetLink[f].TileMatrixSet;
var h=d.Format[0];"format"in c&&(h=c.format);f=eb(d.Style,function(a){return"style"in c?a.Title==c.style:a.isDefault});0>f&&(f=0);f=d.Style[f].Identifier;var k={};"Dimension"in d&&d.Dimension.forEach(function(a){var c=a.Identifier,d=a.Default;void 0===d&&(d=a.Value[0]);k[c]=d});var m=Za(a.Contents.TileMatrixSet,function(a){return a.Identifier==g}),n;n="projection"in c?qd(c.projection):qd(m.SupportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,"$1:$3"));var p=d.WGS84BoundingBox,q,r;void 0!==p&&
(r=qd("EPSG:4326").G(),r=p[0]==r[0]&&p[2]==r[2],q=Ld(p,"EPSG:4326",n),(p=n.G())&&(Gc(p,q)||(q=void 0)));var m=ux(m,q),t=[];q=c.requestEncoding;q=void 0!==q?q:"";if(a.hasOwnProperty("OperationsMetadata")&&a.OperationsMetadata.hasOwnProperty("GetTile")&&0!==q.indexOf("REST"))for(var d=a.OperationsMetadata.GetTile.DCP.HTTP.Get,p=0,v=d.length;p<v;++p){var w=Za(d[p].Constraint,function(a){return"GetEncoding"==a.name}).AllowedValues.Value;0<w.length&&Ua(w,"KVP")&&(q="KVP",t.push(d[p].href))}else q="REST",
d.ResourceURL.forEach(function(a){"tile"==a.resourceType&&(h=a.format,t.push(a.template))});return{urls:t,layer:c.layer,matrixSet:g,format:h,projection:n,requestEncoding:q,tileGrid:m,style:f,dimensions:k,wrapX:r}},OPENLAYERS);u("ol.source.XYZ",Pw,OPENLAYERS);u("ol.source.Zoomify",wx,OPENLAYERS);Ei.prototype.vectorContext=Ei.prototype.vectorContext;Ei.prototype.frameState=Ei.prototype.frameState;Ei.prototype.context=Ei.prototype.context;Ei.prototype.glContext=Ei.prototype.glContext;
Bl.prototype.get=Bl.prototype.get;Bl.prototype.getExtent=Bl.prototype.G;Bl.prototype.getGeometry=Bl.prototype.X;Bl.prototype.getProperties=Bl.prototype.om;Bl.prototype.getType=Bl.prototype.W;u("ol.render.VectorContext",Di,OPENLAYERS);no.prototype.drawAsync=no.prototype.ld;no.prototype.drawCircleGeometry=no.prototype.Ic;no.prototype.drawFeature=no.prototype.Xe;no.prototype.drawGeometryCollectionGeometry=no.prototype.Sd;no.prototype.drawPointGeometry=no.prototype.Ib;
no.prototype.drawLineStringGeometry=no.prototype.Xb;no.prototype.drawMultiLineStringGeometry=no.prototype.Jc;no.prototype.drawMultiPointGeometry=no.prototype.Hb;no.prototype.drawMultiPolygonGeometry=no.prototype.Kc;no.prototype.drawPolygonGeometry=no.prototype.Lc;no.prototype.drawText=no.prototype.Jb;no.prototype.setFillStrokeStyle=no.prototype.hb;no.prototype.setImageStyle=no.prototype.yb;no.prototype.setTextStyle=no.prototype.ib;Rk.prototype.drawAsync=Rk.prototype.ld;
Rk.prototype.drawCircleGeometry=Rk.prototype.Ic;Rk.prototype.drawFeature=Rk.prototype.Xe;Rk.prototype.drawPointGeometry=Rk.prototype.Ib;Rk.prototype.drawMultiPointGeometry=Rk.prototype.Hb;Rk.prototype.drawLineStringGeometry=Rk.prototype.Xb;Rk.prototype.drawMultiLineStringGeometry=Rk.prototype.Jc;Rk.prototype.drawPolygonGeometry=Rk.prototype.Lc;Rk.prototype.drawMultiPolygonGeometry=Rk.prototype.Kc;Rk.prototype.setFillStrokeStyle=Rk.prototype.hb;Rk.prototype.setImageStyle=Rk.prototype.yb;
Rk.prototype.setTextStyle=Rk.prototype.ib;u("ol.proj.common.add",uk,OPENLAYERS);u("ol.proj.METERS_PER_UNIT",md,OPENLAYERS);u("ol.proj.Projection",nd,OPENLAYERS);nd.prototype.getCode=nd.prototype.yj;nd.prototype.getExtent=nd.prototype.G;nd.prototype.getUnits=nd.prototype.mm;nd.prototype.getMetersPerUnit=nd.prototype.$b;nd.prototype.getWorldExtent=nd.prototype.hk;nd.prototype.isGlobal=nd.prototype.Tk;nd.prototype.setGlobal=nd.prototype.uo;nd.prototype.setExtent=nd.prototype.nm;
nd.prototype.setWorldExtent=nd.prototype.Co;nd.prototype.setGetPointResolution=nd.prototype.to;nd.prototype.getPointResolution=nd.prototype.getPointResolution;u("ol.proj.setProj4",function(a){pd=a},OPENLAYERS);u("ol.proj.addEquivalentProjections",rd,OPENLAYERS);u("ol.proj.addProjection",Ed,OPENLAYERS);u("ol.proj.addCoordinateTransforms",sd,OPENLAYERS);u("ol.proj.fromLonLat",function(a,c){return Kd(a,"EPSG:4326",void 0!==c?c:"EPSG:3857")},OPENLAYERS);
u("ol.proj.toLonLat",function(a,c){return Kd(a,void 0!==c?c:"EPSG:3857","EPSG:4326")},OPENLAYERS);u("ol.proj.get",qd,OPENLAYERS);u("ol.proj.getTransform",Id,OPENLAYERS);u("ol.proj.transform",Kd,OPENLAYERS);u("ol.proj.transformExtent",Ld,OPENLAYERS);u("ol.layer.Heatmap",X,OPENLAYERS);X.prototype.getBlur=X.prototype.og;X.prototype.getGradient=X.prototype.wg;X.prototype.getRadius=X.prototype.eh;X.prototype.setBlur=X.prototype.Mh;X.prototype.setGradient=X.prototype.Rh;X.prototype.setRadius=X.prototype.fh;
u("ol.layer.Image",vk,OPENLAYERS);vk.prototype.getSource=vk.prototype.da;u("ol.layer.Layer",Fi,OPENLAYERS);Fi.prototype.getSource=Fi.prototype.da;Fi.prototype.setMap=Fi.prototype.setMap;Fi.prototype.setSource=Fi.prototype.Cc;u("ol.layer.Base",Bi,OPENLAYERS);Bi.prototype.getExtent=Bi.prototype.G;Bi.prototype.getMaxResolution=Bi.prototype.Nb;Bi.prototype.getMinResolution=Bi.prototype.Ob;Bi.prototype.getOpacity=Bi.prototype.Sb;Bi.prototype.getVisible=Bi.prototype.wb;Bi.prototype.getZIndex=Bi.prototype.Tb;
Bi.prototype.setExtent=Bi.prototype.cc;Bi.prototype.setMaxResolution=Bi.prototype.kc;Bi.prototype.setMinResolution=Bi.prototype.lc;Bi.prototype.setOpacity=Bi.prototype.dc;Bi.prototype.setVisible=Bi.prototype.ec;Bi.prototype.setZIndex=Bi.prototype.fc;u("ol.layer.Group",lk,OPENLAYERS);lk.prototype.getLayers=lk.prototype.Sc;lk.prototype.setLayers=lk.prototype.dh;u("ol.layer.Tile",G,OPENLAYERS);G.prototype.getPreload=G.prototype.a;G.prototype.getSource=G.prototype.da;G.prototype.setPreload=G.prototype.c;
G.prototype.getUseInterimTilesOnError=G.prototype.f;G.prototype.setUseInterimTilesOnError=G.prototype.i;u("ol.layer.Vector",H,OPENLAYERS);H.prototype.getSource=H.prototype.da;H.prototype.getStyle=H.prototype.J;H.prototype.getStyleFunction=H.prototype.D;H.prototype.setStyle=H.prototype.c;u("ol.layer.VectorTile",L,OPENLAYERS);L.prototype.getPreload=L.prototype.i;L.prototype.getUseInterimTilesOnError=L.prototype.S;L.prototype.setPreload=L.prototype.U;L.prototype.setUseInterimTilesOnError=L.prototype.aa;
u("ol.interaction.DoubleClickZoom",rj,OPENLAYERS);u("ol.interaction.DoubleClickZoom.handleEvent",sj,OPENLAYERS);u("ol.interaction.DragAndDrop",vv,OPENLAYERS);u("ol.interaction.DragAndDrop.handleEvent",fd,OPENLAYERS);yv.prototype.features=yv.prototype.features;yv.prototype.file=yv.prototype.file;yv.prototype.projection=yv.prototype.projection;Pj.prototype.coordinate=Pj.prototype.coordinate;Pj.prototype.mapBrowserEvent=Pj.prototype.mapBrowserEvent;u("ol.interaction.DragBox",Qj,OPENLAYERS);
Qj.prototype.getGeometry=Qj.prototype.X;u("ol.interaction.DragPan",Ej,OPENLAYERS);u("ol.interaction.DragRotateAndZoom",Bv,OPENLAYERS);u("ol.interaction.DragRotate",Ij,OPENLAYERS);u("ol.interaction.DragZoom",Vj,OPENLAYERS);Fv.prototype.feature=Fv.prototype.feature;u("ol.interaction.Draw",Gv,OPENLAYERS);u("ol.interaction.Draw.handleEvent",Iv,OPENLAYERS);Gv.prototype.removeLastPoint=Gv.prototype.ho;Gv.prototype.finishDrawing=Gv.prototype.md;Gv.prototype.extend=Gv.prototype.Sl;
u("ol.interaction.Draw.createRegularPolygon",function(a,c){return function(d,e){var f=d[0],g=d[1],h=Math.sqrt(hc(f,g)),k=e?e:ve(new iv(f),a);we(k,f,h,c?c:Math.atan((g[1]-f[1])/(g[0]-f[0])));return k}},OPENLAYERS);u("ol.interaction.Interaction",nj,OPENLAYERS);nj.prototype.getActive=nj.prototype.f;nj.prototype.getMap=nj.prototype.j;nj.prototype.setActive=nj.prototype.i;u("ol.interaction.defaults",kk,OPENLAYERS);u("ol.interaction.KeyboardPan",Wj,OPENLAYERS);
u("ol.interaction.KeyboardPan.handleEvent",Xj,OPENLAYERS);u("ol.interaction.KeyboardZoom",Yj,OPENLAYERS);u("ol.interaction.KeyboardZoom.handleEvent",Zj,OPENLAYERS);Wv.prototype.features=Wv.prototype.features;Wv.prototype.mapBrowserPointerEvent=Wv.prototype.mapBrowserPointerEvent;u("ol.interaction.Modify",Xv,OPENLAYERS);u("ol.interaction.Modify.handleEvent",$v,OPENLAYERS);u("ol.interaction.MouseWheelZoom",ak,OPENLAYERS);u("ol.interaction.MouseWheelZoom.handleEvent",bk,OPENLAYERS);
ak.prototype.setMouseAnchor=ak.prototype.D;u("ol.interaction.PinchRotate",ck,OPENLAYERS);u("ol.interaction.PinchZoom",gk,OPENLAYERS);u("ol.interaction.Pointer",Bj,OPENLAYERS);u("ol.interaction.Pointer.handleEvent",Cj,OPENLAYERS);jw.prototype.selected=jw.prototype.selected;jw.prototype.deselected=jw.prototype.deselected;jw.prototype.mapBrowserEvent=jw.prototype.mapBrowserEvent;u("ol.interaction.Select",kw,OPENLAYERS);kw.prototype.getFeatures=kw.prototype.bm;kw.prototype.getLayer=kw.prototype.cm;
u("ol.interaction.Select.handleEvent",lw,OPENLAYERS);kw.prototype.setMap=kw.prototype.setMap;u("ol.interaction.Snap",nw,OPENLAYERS);nw.prototype.addFeature=nw.prototype.rb;nw.prototype.removeFeature=nw.prototype.nb;rw.prototype.features=rw.prototype.features;rw.prototype.coordinate=rw.prototype.coordinate;u("ol.interaction.Translate",sw,OPENLAYERS);u("ol.geom.Circle",iv,OPENLAYERS);iv.prototype.clone=iv.prototype.clone;iv.prototype.getCenter=iv.prototype.vd;iv.prototype.getRadius=iv.prototype.nf;
iv.prototype.getType=iv.prototype.W;iv.prototype.intersectsExtent=iv.prototype.Ia;iv.prototype.setCenter=iv.prototype.Kl;iv.prototype.setCenterAndRadius=iv.prototype.Lf;iv.prototype.setRadius=iv.prototype.Ll;iv.prototype.transform=iv.prototype.fb;u("ol.geom.Geometry",Md,OPENLAYERS);Md.prototype.getClosestPoint=Md.prototype.vb;Md.prototype.getExtent=Md.prototype.G;Md.prototype.simplify=Md.prototype.Bb;Md.prototype.transform=Md.prototype.fb;u("ol.geom.GeometryCollection",zp,OPENLAYERS);
zp.prototype.clone=zp.prototype.clone;zp.prototype.getGeometries=zp.prototype.vg;zp.prototype.getType=zp.prototype.W;zp.prototype.intersectsExtent=zp.prototype.Ia;zp.prototype.setGeometries=zp.prototype.Qh;zp.prototype.applyTransform=zp.prototype.Hc;zp.prototype.translate=zp.prototype.Rc;u("ol.geom.LinearRing",fe,OPENLAYERS);fe.prototype.clone=fe.prototype.clone;fe.prototype.getArea=fe.prototype.Ol;fe.prototype.getCoordinates=fe.prototype.Y;fe.prototype.getType=fe.prototype.W;
fe.prototype.setCoordinates=fe.prototype.la;u("ol.geom.LineString",T,OPENLAYERS);T.prototype.appendCoordinate=T.prototype.dj;T.prototype.clone=T.prototype.clone;T.prototype.forEachSegment=T.prototype.rj;T.prototype.getCoordinateAtM=T.prototype.Ml;T.prototype.getCoordinates=T.prototype.Y;T.prototype.getCoordinateAt=T.prototype.qg;T.prototype.getLength=T.prototype.Nl;T.prototype.getType=T.prototype.W;T.prototype.intersectsExtent=T.prototype.Ia;T.prototype.setCoordinates=T.prototype.la;
u("ol.geom.MultiLineString",U,OPENLAYERS);U.prototype.appendLineString=U.prototype.ej;U.prototype.clone=U.prototype.clone;U.prototype.getCoordinateAtM=U.prototype.Pl;U.prototype.getCoordinates=U.prototype.Y;U.prototype.getLineString=U.prototype.Lj;U.prototype.getLineStrings=U.prototype.rd;U.prototype.getType=U.prototype.W;U.prototype.intersectsExtent=U.prototype.Ia;U.prototype.setCoordinates=U.prototype.la;u("ol.geom.MultiPoint",pp,OPENLAYERS);pp.prototype.appendPoint=pp.prototype.gj;
pp.prototype.clone=pp.prototype.clone;pp.prototype.getCoordinates=pp.prototype.Y;pp.prototype.getPoint=pp.prototype.Wj;pp.prototype.getPoints=pp.prototype.le;pp.prototype.getType=pp.prototype.W;pp.prototype.intersectsExtent=pp.prototype.Ia;pp.prototype.setCoordinates=pp.prototype.la;u("ol.geom.MultiPolygon",V,OPENLAYERS);V.prototype.appendPolygon=V.prototype.hj;V.prototype.clone=V.prototype.clone;V.prototype.getArea=V.prototype.Ql;V.prototype.getCoordinates=V.prototype.Y;
V.prototype.getInteriorPoints=V.prototype.Ij;V.prototype.getPolygon=V.prototype.Yj;V.prototype.getPolygons=V.prototype.Xd;V.prototype.getType=V.prototype.W;V.prototype.intersectsExtent=V.prototype.Ia;V.prototype.setCoordinates=V.prototype.la;u("ol.geom.Point",E,OPENLAYERS);E.prototype.clone=E.prototype.clone;E.prototype.getCoordinates=E.prototype.Y;E.prototype.getType=E.prototype.W;E.prototype.intersectsExtent=E.prototype.Ia;E.prototype.setCoordinates=E.prototype.la;u("ol.geom.Polygon",F,OPENLAYERS);
F.prototype.appendLinearRing=F.prototype.fj;F.prototype.clone=F.prototype.clone;F.prototype.getArea=F.prototype.Rl;F.prototype.getCoordinates=F.prototype.Y;F.prototype.getInteriorPoint=F.prototype.Hj;F.prototype.getLinearRingCount=F.prototype.Mj;F.prototype.getLinearRing=F.prototype.xg;F.prototype.getLinearRings=F.prototype.Vd;F.prototype.getType=F.prototype.W;F.prototype.intersectsExtent=F.prototype.Ia;F.prototype.setCoordinates=F.prototype.la;u("ol.geom.Polygon.circular",te,OPENLAYERS);
u("ol.geom.Polygon.fromExtent",ue,OPENLAYERS);u("ol.geom.Polygon.fromCircle",ve,OPENLAYERS);u("ol.geom.SimpleGeometry",Od,OPENLAYERS);Od.prototype.getFirstCoordinate=Od.prototype.Kb;Od.prototype.getLastCoordinate=Od.prototype.Lb;Od.prototype.getLayout=Od.prototype.Mb;Od.prototype.applyTransform=Od.prototype.Hc;Od.prototype.translate=Od.prototype.Rc;u("ol.format.EsriJSON",sp,OPENLAYERS);sp.prototype.readFeature=sp.prototype.Ub;sp.prototype.readFeatures=sp.prototype.Ea;sp.prototype.readGeometry=sp.prototype.Uc;
sp.prototype.readProjection=sp.prototype.Qa;sp.prototype.writeGeometry=sp.prototype.Zc;sp.prototype.writeGeometryObject=sp.prototype.Ke;sp.prototype.writeFeature=sp.prototype.Fd;sp.prototype.writeFeatureObject=sp.prototype.Yc;sp.prototype.writeFeatures=sp.prototype.Wb;sp.prototype.writeFeaturesObject=sp.prototype.Ie;u("ol.format.Feature",dp,OPENLAYERS);u("ol.format.GeoJSON",Dp,OPENLAYERS);Dp.prototype.readFeature=Dp.prototype.Ub;Dp.prototype.readFeatures=Dp.prototype.Ea;
Dp.prototype.readGeometry=Dp.prototype.Uc;Dp.prototype.readProjection=Dp.prototype.Qa;Dp.prototype.writeFeature=Dp.prototype.Fd;Dp.prototype.writeFeatureObject=Dp.prototype.Yc;Dp.prototype.writeFeatures=Dp.prototype.Wb;Dp.prototype.writeFeaturesObject=Dp.prototype.Ie;Dp.prototype.writeGeometry=Dp.prototype.Zc;Dp.prototype.writeGeometryObject=Dp.prototype.Ke;u("ol.format.GPX",hq,OPENLAYERS);hq.prototype.readFeature=hq.prototype.Ub;hq.prototype.readFeatures=hq.prototype.Ea;
hq.prototype.readProjection=hq.prototype.Qa;hq.prototype.writeFeatures=hq.prototype.Wb;hq.prototype.writeFeaturesNode=hq.prototype.a;u("ol.format.IGC",Qq,OPENLAYERS);Qq.prototype.readFeature=Qq.prototype.Ub;Qq.prototype.readFeatures=Qq.prototype.Ea;Qq.prototype.readProjection=Qq.prototype.Qa;u("ol.format.KML",tr,OPENLAYERS);tr.prototype.readFeature=tr.prototype.Ub;tr.prototype.readFeatures=tr.prototype.Ea;tr.prototype.readName=tr.prototype.Vn;tr.prototype.readNetworkLinks=tr.prototype.Wn;
tr.prototype.readProjection=tr.prototype.Qa;tr.prototype.writeFeatures=tr.prototype.Wb;tr.prototype.writeFeaturesNode=tr.prototype.a;u("ol.format.MVT",ht,OPENLAYERS);ht.prototype.setLayers=ht.prototype.c;u("ol.format.OSMXML",jt,OPENLAYERS);jt.prototype.readFeatures=jt.prototype.Ea;jt.prototype.readProjection=jt.prototype.Qa;u("ol.format.Polyline",It,OPENLAYERS);u("ol.format.Polyline.encodeDeltas",Jt,OPENLAYERS);u("ol.format.Polyline.decodeDeltas",Lt,OPENLAYERS);
u("ol.format.Polyline.encodeFloats",Kt,OPENLAYERS);u("ol.format.Polyline.decodeFloats",Mt,OPENLAYERS);It.prototype.readFeature=It.prototype.Ub;It.prototype.readFeatures=It.prototype.Ea;It.prototype.readGeometry=It.prototype.Uc;It.prototype.readProjection=It.prototype.Qa;It.prototype.writeGeometry=It.prototype.Zc;u("ol.format.TopoJSON",Nt,OPENLAYERS);Nt.prototype.readFeatures=Nt.prototype.Ea;Nt.prototype.readProjection=Nt.prototype.Qa;u("ol.format.WFS",Tt,OPENLAYERS);Tt.prototype.readFeatures=Tt.prototype.Ea;
Tt.prototype.readTransactionResponse=Tt.prototype.j;Tt.prototype.readFeatureCollectionMetadata=Tt.prototype.i;Tt.prototype.writeGetFeature=Tt.prototype.l;Tt.prototype.writeTransaction=Tt.prototype.A;Tt.prototype.readProjection=Tt.prototype.Qa;u("ol.format.WKT",fu,OPENLAYERS);fu.prototype.readFeature=fu.prototype.Ub;fu.prototype.readFeatures=fu.prototype.Ea;fu.prototype.readGeometry=fu.prototype.Uc;fu.prototype.writeFeature=fu.prototype.Fd;fu.prototype.writeFeatures=fu.prototype.Wb;
fu.prototype.writeGeometry=fu.prototype.Zc;u("ol.format.WMSCapabilities",xu,OPENLAYERS);xu.prototype.read=xu.prototype.read;u("ol.format.WMSGetFeatureInfo",Uu,OPENLAYERS);Uu.prototype.readFeatures=Uu.prototype.Ea;u("ol.format.WMTSCapabilities",Vu,OPENLAYERS);Vu.prototype.read=Vu.prototype.read;u("ol.format.GML2",Yp,OPENLAYERS);u("ol.format.GML3",Zp,OPENLAYERS);Zp.prototype.writeGeometryNode=Zp.prototype.o;Zp.prototype.writeFeatures=Zp.prototype.Wb;Zp.prototype.writeFeaturesNode=Zp.prototype.a;
u("ol.format.GML",Zp,OPENLAYERS);Zp.prototype.writeFeatures=Zp.prototype.Wb;Zp.prototype.writeFeaturesNode=Zp.prototype.a;Lp.prototype.readFeatures=Lp.prototype.Ea;u("ol.events.condition.altKeyOnly",function(a){a=a.originalEvent;return a.altKey&&!(a.metaKey||a.ctrlKey)&&!a.shiftKey},OPENLAYERS);u("ol.events.condition.altShiftKeysOnly",tj,OPENLAYERS);u("ol.events.condition.always",fd,OPENLAYERS);u("ol.events.condition.click",function(a){return a.type==ri},OPENLAYERS);
u("ol.events.condition.never",ed,OPENLAYERS);u("ol.events.condition.pointerMove",vj,OPENLAYERS);u("ol.events.condition.singleClick",wj,OPENLAYERS);u("ol.events.condition.doubleClick",function(a){return a.type==si},OPENLAYERS);u("ol.events.condition.noModifierKeys",xj,OPENLAYERS);u("ol.events.condition.platformModifierKeyOnly",function(a){a=a.originalEvent;return!a.altKey&&(yh?a.metaKey:a.ctrlKey)&&!a.shiftKey},OPENLAYERS);u("ol.events.condition.shiftKeyOnly",yj,OPENLAYERS);
u("ol.events.condition.targetNotEditable",zj,OPENLAYERS);u("ol.events.condition.mouseOnly",Aj,OPENLAYERS);u("ol.control.Attribution",Ng,OPENLAYERS);u("ol.control.Attribution.render",Og,OPENLAYERS);Ng.prototype.getCollapsible=Ng.prototype.Al;Ng.prototype.setCollapsible=Ng.prototype.Dl;Ng.prototype.setCollapsed=Ng.prototype.Cl;Ng.prototype.getCollapsed=Ng.prototype.zl;u("ol.control.Control",jg,OPENLAYERS);jg.prototype.getMap=jg.prototype.i;jg.prototype.setMap=jg.prototype.setMap;
jg.prototype.setTarget=jg.prototype.c;u("ol.control.defaults",Tg,OPENLAYERS);u("ol.control.FullScreen",Yg,OPENLAYERS);u("ol.control.MousePosition",Zg,OPENLAYERS);u("ol.control.MousePosition.render",$g,OPENLAYERS);Zg.prototype.getCoordinateFormat=Zg.prototype.rg;Zg.prototype.getProjection=Zg.prototype.Wg;Zg.prototype.setCoordinateFormat=Zg.prototype.Nh;Zg.prototype.setProjection=Zg.prototype.Xg;u("ol.control.OverviewMap",No,OPENLAYERS);u("ol.control.OverviewMap.render",Oo,OPENLAYERS);
No.prototype.getCollapsible=No.prototype.Gl;No.prototype.setCollapsible=No.prototype.Jl;No.prototype.setCollapsed=No.prototype.Il;No.prototype.getCollapsed=No.prototype.Fl;No.prototype.getOverviewMap=No.prototype.Uj;u("ol.control.Rotate",Qg,OPENLAYERS);u("ol.control.Rotate.render",Rg,OPENLAYERS);u("ol.control.ScaleLine",So,OPENLAYERS);So.prototype.getUnits=So.prototype.J;u("ol.control.ScaleLine.render",To,OPENLAYERS);So.prototype.setUnits=So.prototype.H;u("ol.control.Zoom",Sg,OPENLAYERS);
u("ol.control.ZoomSlider",Wo,OPENLAYERS);u("ol.control.ZoomSlider.render",Yo,OPENLAYERS);u("ol.control.ZoomToExtent",bp,OPENLAYERS);u("ol.color.asArray",Xe,OPENLAYERS);u("ol.color.asString",Ze,OPENLAYERS);Mb.prototype.changed=Mb.prototype.u;Mb.prototype.dispatchEvent=Mb.prototype.b;Mb.prototype.getRevision=Mb.prototype.L;Mb.prototype.on=Mb.prototype.I;Mb.prototype.once=Mb.prototype.M;Mb.prototype.un=Mb.prototype.K;Mb.prototype.unByKey=Mb.prototype.N;Se.prototype.get=Se.prototype.get;
Se.prototype.getKeys=Se.prototype.O;Se.prototype.getProperties=Se.prototype.P;Se.prototype.set=Se.prototype.set;Se.prototype.setProperties=Se.prototype.C;Se.prototype.unset=Se.prototype.R;Se.prototype.changed=Se.prototype.u;Se.prototype.dispatchEvent=Se.prototype.b;Se.prototype.getRevision=Se.prototype.L;Se.prototype.on=Se.prototype.I;Se.prototype.once=Se.prototype.M;Se.prototype.un=Se.prototype.K;Se.prototype.unByKey=Se.prototype.N;cp.prototype.get=cp.prototype.get;cp.prototype.getKeys=cp.prototype.O;
cp.prototype.getProperties=cp.prototype.P;cp.prototype.set=cp.prototype.set;cp.prototype.setProperties=cp.prototype.C;cp.prototype.unset=cp.prototype.R;cp.prototype.changed=cp.prototype.u;cp.prototype.dispatchEvent=cp.prototype.b;cp.prototype.getRevision=cp.prototype.L;cp.prototype.on=cp.prototype.I;cp.prototype.once=cp.prototype.M;cp.prototype.un=cp.prototype.K;cp.prototype.unByKey=cp.prototype.N;Xl.prototype.get=Xl.prototype.get;Xl.prototype.getKeys=Xl.prototype.O;Xl.prototype.getProperties=Xl.prototype.P;
Xl.prototype.set=Xl.prototype.set;Xl.prototype.setProperties=Xl.prototype.C;Xl.prototype.unset=Xl.prototype.R;Xl.prototype.changed=Xl.prototype.u;Xl.prototype.dispatchEvent=Xl.prototype.b;Xl.prototype.getRevision=Xl.prototype.L;Xl.prototype.on=Xl.prototype.I;Xl.prototype.once=Xl.prototype.M;Xl.prototype.un=Xl.prototype.K;Xl.prototype.unByKey=Xl.prototype.N;hv.prototype.get=hv.prototype.get;hv.prototype.getKeys=hv.prototype.O;hv.prototype.getProperties=hv.prototype.P;hv.prototype.set=hv.prototype.set;
hv.prototype.setProperties=hv.prototype.C;hv.prototype.unset=hv.prototype.R;hv.prototype.changed=hv.prototype.u;hv.prototype.dispatchEvent=hv.prototype.b;hv.prototype.getRevision=hv.prototype.L;hv.prototype.on=hv.prototype.I;hv.prototype.once=hv.prototype.M;hv.prototype.un=hv.prototype.K;hv.prototype.unByKey=hv.prototype.N;tv.prototype.getTileCoord=tv.prototype.f;S.prototype.get=S.prototype.get;S.prototype.getKeys=S.prototype.O;S.prototype.getProperties=S.prototype.P;S.prototype.set=S.prototype.set;
S.prototype.setProperties=S.prototype.C;S.prototype.unset=S.prototype.R;S.prototype.changed=S.prototype.u;S.prototype.dispatchEvent=S.prototype.b;S.prototype.getRevision=S.prototype.L;S.prototype.on=S.prototype.I;S.prototype.once=S.prototype.M;S.prototype.un=S.prototype.K;S.prototype.unByKey=S.prototype.N;ni.prototype.map=ni.prototype.map;ni.prototype.frameState=ni.prototype.frameState;oi.prototype.originalEvent=oi.prototype.originalEvent;oi.prototype.pixel=oi.prototype.pixel;
oi.prototype.coordinate=oi.prototype.coordinate;oi.prototype.dragging=oi.prototype.dragging;oi.prototype.stopPropagation=oi.prototype.stopPropagation;oi.prototype.map=oi.prototype.map;oi.prototype.frameState=oi.prototype.frameState;Jo.prototype.get=Jo.prototype.get;Jo.prototype.getKeys=Jo.prototype.O;Jo.prototype.getProperties=Jo.prototype.P;Jo.prototype.set=Jo.prototype.set;Jo.prototype.setProperties=Jo.prototype.C;Jo.prototype.unset=Jo.prototype.R;Jo.prototype.changed=Jo.prototype.u;
Jo.prototype.dispatchEvent=Jo.prototype.b;Jo.prototype.getRevision=Jo.prototype.L;Jo.prototype.on=Jo.prototype.I;Jo.prototype.once=Jo.prototype.M;Jo.prototype.un=Jo.prototype.K;Jo.prototype.unByKey=Jo.prototype.N;Zl.prototype.getTileCoord=Zl.prototype.f;xe.prototype.get=xe.prototype.get;xe.prototype.getKeys=xe.prototype.O;xe.prototype.getProperties=xe.prototype.P;xe.prototype.set=xe.prototype.set;xe.prototype.setProperties=xe.prototype.C;xe.prototype.unset=xe.prototype.R;xe.prototype.changed=xe.prototype.u;
xe.prototype.dispatchEvent=xe.prototype.b;xe.prototype.getRevision=xe.prototype.L;xe.prototype.on=xe.prototype.I;xe.prototype.once=xe.prototype.M;xe.prototype.un=xe.prototype.K;xe.prototype.unByKey=xe.prototype.N;tx.prototype.getMaxZoom=tx.prototype.yg;tx.prototype.getMinZoom=tx.prototype.zg;tx.prototype.getOrigin=tx.prototype.Ha;tx.prototype.getResolution=tx.prototype.Z;tx.prototype.getResolutions=tx.prototype.Pb;tx.prototype.getTileCoordExtent=tx.prototype.Ca;
tx.prototype.getTileCoordForCoordAndResolution=tx.prototype.$d;tx.prototype.getTileCoordForCoordAndZ=tx.prototype.ud;tx.prototype.getTileSize=tx.prototype.Ua;Ik.prototype.getOpacity=Ik.prototype.re;Ik.prototype.getRotateWithView=Ik.prototype.Yd;Ik.prototype.getRotation=Ik.prototype.se;Ik.prototype.getScale=Ik.prototype.te;Ik.prototype.getSnapToPixel=Ik.prototype.Zd;Ik.prototype.setOpacity=Ik.prototype.ue;Ik.prototype.setRotation=Ik.prototype.ve;Ik.prototype.setScale=Ik.prototype.we;
Wi.prototype.getOpacity=Wi.prototype.re;Wi.prototype.getRotateWithView=Wi.prototype.Yd;Wi.prototype.getRotation=Wi.prototype.se;Wi.prototype.getScale=Wi.prototype.te;Wi.prototype.getSnapToPixel=Wi.prototype.Zd;Wi.prototype.setOpacity=Wi.prototype.ue;Wi.prototype.setRotation=Wi.prototype.ve;Wi.prototype.setScale=Wi.prototype.we;Bx.prototype.getOpacity=Bx.prototype.re;Bx.prototype.getRotateWithView=Bx.prototype.Yd;Bx.prototype.getRotation=Bx.prototype.se;Bx.prototype.getScale=Bx.prototype.te;
Bx.prototype.getSnapToPixel=Bx.prototype.Zd;Bx.prototype.setOpacity=Bx.prototype.ue;Bx.prototype.setRotation=Bx.prototype.ve;Bx.prototype.setScale=Bx.prototype.we;rg.prototype.get=rg.prototype.get;rg.prototype.getKeys=rg.prototype.O;rg.prototype.getProperties=rg.prototype.P;rg.prototype.set=rg.prototype.set;rg.prototype.setProperties=rg.prototype.C;rg.prototype.unset=rg.prototype.R;rg.prototype.changed=rg.prototype.u;rg.prototype.dispatchEvent=rg.prototype.b;rg.prototype.getRevision=rg.prototype.L;
rg.prototype.on=rg.prototype.I;rg.prototype.once=rg.prototype.M;rg.prototype.un=rg.prototype.K;rg.prototype.unByKey=rg.prototype.N;Ig.prototype.getAttributions=Ig.prototype.ea;Ig.prototype.getLogo=Ig.prototype.pa;Ig.prototype.getProjection=Ig.prototype.sa;Ig.prototype.getState=Ig.prototype.V;Ig.prototype.setAttributions=Ig.prototype.ma;Ig.prototype.get=Ig.prototype.get;Ig.prototype.getKeys=Ig.prototype.O;Ig.prototype.getProperties=Ig.prototype.P;Ig.prototype.set=Ig.prototype.set;
Ig.prototype.setProperties=Ig.prototype.C;Ig.prototype.unset=Ig.prototype.R;Ig.prototype.changed=Ig.prototype.u;Ig.prototype.dispatchEvent=Ig.prototype.b;Ig.prototype.getRevision=Ig.prototype.L;Ig.prototype.on=Ig.prototype.I;Ig.prototype.once=Ig.prototype.M;Ig.prototype.un=Ig.prototype.K;Ig.prototype.unByKey=Ig.prototype.N;un.prototype.getTileGrid=un.prototype.Ma;un.prototype.getAttributions=un.prototype.ea;un.prototype.getLogo=un.prototype.pa;un.prototype.getProjection=un.prototype.sa;
un.prototype.getState=un.prototype.V;un.prototype.setAttributions=un.prototype.ma;un.prototype.get=un.prototype.get;un.prototype.getKeys=un.prototype.O;un.prototype.getProperties=un.prototype.P;un.prototype.set=un.prototype.set;un.prototype.setProperties=un.prototype.C;un.prototype.unset=un.prototype.R;un.prototype.changed=un.prototype.u;un.prototype.dispatchEvent=un.prototype.b;un.prototype.getRevision=un.prototype.L;un.prototype.on=un.prototype.I;un.prototype.once=un.prototype.M;
un.prototype.un=un.prototype.K;un.prototype.unByKey=un.prototype.N;Y.prototype.getTileLoadFunction=Y.prototype.$a;Y.prototype.getTileUrlFunction=Y.prototype.ab;Y.prototype.getUrls=Y.prototype.bb;Y.prototype.setTileLoadFunction=Y.prototype.jb;Y.prototype.setTileUrlFunction=Y.prototype.Na;Y.prototype.setUrl=Y.prototype.Xa;Y.prototype.setUrls=Y.prototype.Ya;Y.prototype.getTileGrid=Y.prototype.Ma;Y.prototype.getAttributions=Y.prototype.ea;Y.prototype.getLogo=Y.prototype.pa;Y.prototype.getProjection=Y.prototype.sa;
Y.prototype.getState=Y.prototype.V;Y.prototype.setAttributions=Y.prototype.ma;Y.prototype.get=Y.prototype.get;Y.prototype.getKeys=Y.prototype.O;Y.prototype.getProperties=Y.prototype.P;Y.prototype.set=Y.prototype.set;Y.prototype.setProperties=Y.prototype.C;Y.prototype.unset=Y.prototype.R;Y.prototype.changed=Y.prototype.u;Y.prototype.dispatchEvent=Y.prototype.b;Y.prototype.getRevision=Y.prototype.L;Y.prototype.on=Y.prototype.I;Y.prototype.once=Y.prototype.M;Y.prototype.un=Y.prototype.K;
Y.prototype.unByKey=Y.prototype.N;Ew.prototype.setRenderReprojectionEdges=Ew.prototype.zb;Ew.prototype.setTileGridForProjection=Ew.prototype.Ab;Ew.prototype.getTileLoadFunction=Ew.prototype.$a;Ew.prototype.getTileUrlFunction=Ew.prototype.ab;Ew.prototype.getUrls=Ew.prototype.bb;Ew.prototype.setTileLoadFunction=Ew.prototype.jb;Ew.prototype.setTileUrlFunction=Ew.prototype.Na;Ew.prototype.setUrl=Ew.prototype.Xa;Ew.prototype.setUrls=Ew.prototype.Ya;Ew.prototype.getTileGrid=Ew.prototype.Ma;
Ew.prototype.getAttributions=Ew.prototype.ea;Ew.prototype.getLogo=Ew.prototype.pa;Ew.prototype.getProjection=Ew.prototype.sa;Ew.prototype.getState=Ew.prototype.V;Ew.prototype.setAttributions=Ew.prototype.ma;Ew.prototype.get=Ew.prototype.get;Ew.prototype.getKeys=Ew.prototype.O;Ew.prototype.getProperties=Ew.prototype.P;Ew.prototype.set=Ew.prototype.set;Ew.prototype.setProperties=Ew.prototype.C;Ew.prototype.unset=Ew.prototype.R;Ew.prototype.changed=Ew.prototype.u;Ew.prototype.dispatchEvent=Ew.prototype.b;
Ew.prototype.getRevision=Ew.prototype.L;Ew.prototype.on=Ew.prototype.I;Ew.prototype.once=Ew.prototype.M;Ew.prototype.un=Ew.prototype.K;Ew.prototype.unByKey=Ew.prototype.N;bn.prototype.getAttributions=bn.prototype.ea;bn.prototype.getLogo=bn.prototype.pa;bn.prototype.getProjection=bn.prototype.sa;bn.prototype.getState=bn.prototype.V;bn.prototype.setAttributions=bn.prototype.ma;bn.prototype.get=bn.prototype.get;bn.prototype.getKeys=bn.prototype.O;bn.prototype.getProperties=bn.prototype.P;
bn.prototype.set=bn.prototype.set;bn.prototype.setProperties=bn.prototype.C;bn.prototype.unset=bn.prototype.R;bn.prototype.changed=bn.prototype.u;bn.prototype.dispatchEvent=bn.prototype.b;bn.prototype.getRevision=bn.prototype.L;bn.prototype.on=bn.prototype.I;bn.prototype.once=bn.prototype.M;bn.prototype.un=bn.prototype.K;bn.prototype.unByKey=bn.prototype.N;Gw.prototype.addFeature=Gw.prototype.rb;Gw.prototype.addFeatures=Gw.prototype.Gc;Gw.prototype.clear=Gw.prototype.clear;
Gw.prototype.forEachFeature=Gw.prototype.mg;Gw.prototype.forEachFeatureInExtent=Gw.prototype.ub;Gw.prototype.forEachFeatureIntersectingExtent=Gw.prototype.ng;Gw.prototype.getFeaturesCollection=Gw.prototype.ug;Gw.prototype.getFeatures=Gw.prototype.pe;Gw.prototype.getFeaturesAtCoordinate=Gw.prototype.tg;Gw.prototype.getFeaturesInExtent=Gw.prototype.$e;Gw.prototype.getClosestFeatureToCoordinate=Gw.prototype.pg;Gw.prototype.getExtent=Gw.prototype.G;Gw.prototype.getFeatureById=Gw.prototype.sg;
Gw.prototype.removeFeature=Gw.prototype.nb;Gw.prototype.getAttributions=Gw.prototype.ea;Gw.prototype.getLogo=Gw.prototype.pa;Gw.prototype.getProjection=Gw.prototype.sa;Gw.prototype.getState=Gw.prototype.V;Gw.prototype.setAttributions=Gw.prototype.ma;Gw.prototype.get=Gw.prototype.get;Gw.prototype.getKeys=Gw.prototype.O;Gw.prototype.getProperties=Gw.prototype.P;Gw.prototype.set=Gw.prototype.set;Gw.prototype.setProperties=Gw.prototype.C;Gw.prototype.unset=Gw.prototype.R;Gw.prototype.changed=Gw.prototype.u;
Gw.prototype.dispatchEvent=Gw.prototype.b;Gw.prototype.getRevision=Gw.prototype.L;Gw.prototype.on=Gw.prototype.I;Gw.prototype.once=Gw.prototype.M;Gw.prototype.un=Gw.prototype.K;Gw.prototype.unByKey=Gw.prototype.N;Pl.prototype.getAttributions=Pl.prototype.ea;Pl.prototype.getLogo=Pl.prototype.pa;Pl.prototype.getProjection=Pl.prototype.sa;Pl.prototype.getState=Pl.prototype.V;Pl.prototype.setAttributions=Pl.prototype.ma;Pl.prototype.get=Pl.prototype.get;Pl.prototype.getKeys=Pl.prototype.O;
Pl.prototype.getProperties=Pl.prototype.P;Pl.prototype.set=Pl.prototype.set;Pl.prototype.setProperties=Pl.prototype.C;Pl.prototype.unset=Pl.prototype.R;Pl.prototype.changed=Pl.prototype.u;Pl.prototype.dispatchEvent=Pl.prototype.b;Pl.prototype.getRevision=Pl.prototype.L;Pl.prototype.on=Pl.prototype.I;Pl.prototype.once=Pl.prototype.M;Pl.prototype.un=Pl.prototype.K;Pl.prototype.unByKey=Pl.prototype.N;Wl.prototype.getAttributions=Wl.prototype.ea;Wl.prototype.getLogo=Wl.prototype.pa;
Wl.prototype.getProjection=Wl.prototype.sa;Wl.prototype.getState=Wl.prototype.V;Wl.prototype.setAttributions=Wl.prototype.ma;Wl.prototype.get=Wl.prototype.get;Wl.prototype.getKeys=Wl.prototype.O;Wl.prototype.getProperties=Wl.prototype.P;Wl.prototype.set=Wl.prototype.set;Wl.prototype.setProperties=Wl.prototype.C;Wl.prototype.unset=Wl.prototype.R;Wl.prototype.changed=Wl.prototype.u;Wl.prototype.dispatchEvent=Wl.prototype.b;Wl.prototype.getRevision=Wl.prototype.L;Wl.prototype.on=Wl.prototype.I;
Wl.prototype.once=Wl.prototype.M;Wl.prototype.un=Wl.prototype.K;Wl.prototype.unByKey=Wl.prototype.N;Jw.prototype.getAttributions=Jw.prototype.ea;Jw.prototype.getLogo=Jw.prototype.pa;Jw.prototype.getProjection=Jw.prototype.sa;Jw.prototype.getState=Jw.prototype.V;Jw.prototype.setAttributions=Jw.prototype.ma;Jw.prototype.get=Jw.prototype.get;Jw.prototype.getKeys=Jw.prototype.O;Jw.prototype.getProperties=Jw.prototype.P;Jw.prototype.set=Jw.prototype.set;Jw.prototype.setProperties=Jw.prototype.C;
Jw.prototype.unset=Jw.prototype.R;Jw.prototype.changed=Jw.prototype.u;Jw.prototype.dispatchEvent=Jw.prototype.b;Jw.prototype.getRevision=Jw.prototype.L;Jw.prototype.on=Jw.prototype.I;Jw.prototype.once=Jw.prototype.M;Jw.prototype.un=Jw.prototype.K;Jw.prototype.unByKey=Jw.prototype.N;Kw.prototype.getAttributions=Kw.prototype.ea;Kw.prototype.getLogo=Kw.prototype.pa;Kw.prototype.getProjection=Kw.prototype.sa;Kw.prototype.getState=Kw.prototype.V;Kw.prototype.setAttributions=Kw.prototype.ma;
Kw.prototype.get=Kw.prototype.get;Kw.prototype.getKeys=Kw.prototype.O;Kw.prototype.getProperties=Kw.prototype.P;Kw.prototype.set=Kw.prototype.set;Kw.prototype.setProperties=Kw.prototype.C;Kw.prototype.unset=Kw.prototype.R;Kw.prototype.changed=Kw.prototype.u;Kw.prototype.dispatchEvent=Kw.prototype.b;Kw.prototype.getRevision=Kw.prototype.L;Kw.prototype.on=Kw.prototype.I;Kw.prototype.once=Kw.prototype.M;Kw.prototype.un=Kw.prototype.K;Kw.prototype.unByKey=Kw.prototype.N;kn.prototype.getAttributions=kn.prototype.ea;
kn.prototype.getLogo=kn.prototype.pa;kn.prototype.getProjection=kn.prototype.sa;kn.prototype.getState=kn.prototype.V;kn.prototype.setAttributions=kn.prototype.ma;kn.prototype.get=kn.prototype.get;kn.prototype.getKeys=kn.prototype.O;kn.prototype.getProperties=kn.prototype.P;kn.prototype.set=kn.prototype.set;kn.prototype.setProperties=kn.prototype.C;kn.prototype.unset=kn.prototype.R;kn.prototype.changed=kn.prototype.u;kn.prototype.dispatchEvent=kn.prototype.b;kn.prototype.getRevision=kn.prototype.L;
kn.prototype.on=kn.prototype.I;kn.prototype.once=kn.prototype.M;kn.prototype.un=kn.prototype.K;kn.prototype.unByKey=kn.prototype.N;Lw.prototype.getAttributions=Lw.prototype.ea;Lw.prototype.getLogo=Lw.prototype.pa;Lw.prototype.getProjection=Lw.prototype.sa;Lw.prototype.getState=Lw.prototype.V;Lw.prototype.setAttributions=Lw.prototype.ma;Lw.prototype.get=Lw.prototype.get;Lw.prototype.getKeys=Lw.prototype.O;Lw.prototype.getProperties=Lw.prototype.P;Lw.prototype.set=Lw.prototype.set;
Lw.prototype.setProperties=Lw.prototype.C;Lw.prototype.unset=Lw.prototype.R;Lw.prototype.changed=Lw.prototype.u;Lw.prototype.dispatchEvent=Lw.prototype.b;Lw.prototype.getRevision=Lw.prototype.L;Lw.prototype.on=Lw.prototype.I;Lw.prototype.once=Lw.prototype.M;Lw.prototype.un=Lw.prototype.K;Lw.prototype.unByKey=Lw.prototype.N;Pw.prototype.setRenderReprojectionEdges=Pw.prototype.zb;Pw.prototype.setTileGridForProjection=Pw.prototype.Ab;Pw.prototype.getTileLoadFunction=Pw.prototype.$a;
Pw.prototype.getTileUrlFunction=Pw.prototype.ab;Pw.prototype.getUrls=Pw.prototype.bb;Pw.prototype.setTileLoadFunction=Pw.prototype.jb;Pw.prototype.setTileUrlFunction=Pw.prototype.Na;Pw.prototype.setUrl=Pw.prototype.Xa;Pw.prototype.setUrls=Pw.prototype.Ya;Pw.prototype.getTileGrid=Pw.prototype.Ma;Pw.prototype.getAttributions=Pw.prototype.ea;Pw.prototype.getLogo=Pw.prototype.pa;Pw.prototype.getProjection=Pw.prototype.sa;Pw.prototype.getState=Pw.prototype.V;Pw.prototype.setAttributions=Pw.prototype.ma;
Pw.prototype.get=Pw.prototype.get;Pw.prototype.getKeys=Pw.prototype.O;Pw.prototype.getProperties=Pw.prototype.P;Pw.prototype.set=Pw.prototype.set;Pw.prototype.setProperties=Pw.prototype.C;Pw.prototype.unset=Pw.prototype.R;Pw.prototype.changed=Pw.prototype.u;Pw.prototype.dispatchEvent=Pw.prototype.b;Pw.prototype.getRevision=Pw.prototype.L;Pw.prototype.on=Pw.prototype.I;Pw.prototype.once=Pw.prototype.M;Pw.prototype.un=Pw.prototype.K;Pw.prototype.unByKey=Pw.prototype.N;
Sw.prototype.setRenderReprojectionEdges=Sw.prototype.zb;Sw.prototype.setTileGridForProjection=Sw.prototype.Ab;Sw.prototype.getTileLoadFunction=Sw.prototype.$a;Sw.prototype.getTileUrlFunction=Sw.prototype.ab;Sw.prototype.getUrls=Sw.prototype.bb;Sw.prototype.setTileLoadFunction=Sw.prototype.jb;Sw.prototype.setTileUrlFunction=Sw.prototype.Na;Sw.prototype.setUrl=Sw.prototype.Xa;Sw.prototype.setUrls=Sw.prototype.Ya;Sw.prototype.getTileGrid=Sw.prototype.Ma;Sw.prototype.getAttributions=Sw.prototype.ea;
Sw.prototype.getLogo=Sw.prototype.pa;Sw.prototype.getProjection=Sw.prototype.sa;Sw.prototype.getState=Sw.prototype.V;Sw.prototype.setAttributions=Sw.prototype.ma;Sw.prototype.get=Sw.prototype.get;Sw.prototype.getKeys=Sw.prototype.O;Sw.prototype.getProperties=Sw.prototype.P;Sw.prototype.set=Sw.prototype.set;Sw.prototype.setProperties=Sw.prototype.C;Sw.prototype.unset=Sw.prototype.R;Sw.prototype.changed=Sw.prototype.u;Sw.prototype.dispatchEvent=Sw.prototype.b;Sw.prototype.getRevision=Sw.prototype.L;
Sw.prototype.on=Sw.prototype.I;Sw.prototype.once=Sw.prototype.M;Sw.prototype.un=Sw.prototype.K;Sw.prototype.unByKey=Sw.prototype.N;Qw.prototype.setRenderReprojectionEdges=Qw.prototype.zb;Qw.prototype.setTileGridForProjection=Qw.prototype.Ab;Qw.prototype.getTileLoadFunction=Qw.prototype.$a;Qw.prototype.getTileUrlFunction=Qw.prototype.ab;Qw.prototype.getUrls=Qw.prototype.bb;Qw.prototype.setTileLoadFunction=Qw.prototype.jb;Qw.prototype.setTileUrlFunction=Qw.prototype.Na;Qw.prototype.setUrl=Qw.prototype.Xa;
Qw.prototype.setUrls=Qw.prototype.Ya;Qw.prototype.getTileGrid=Qw.prototype.Ma;Qw.prototype.getAttributions=Qw.prototype.ea;Qw.prototype.getLogo=Qw.prototype.pa;Qw.prototype.getProjection=Qw.prototype.sa;Qw.prototype.getState=Qw.prototype.V;Qw.prototype.setAttributions=Qw.prototype.ma;Qw.prototype.get=Qw.prototype.get;Qw.prototype.getKeys=Qw.prototype.O;Qw.prototype.getProperties=Qw.prototype.P;Qw.prototype.set=Qw.prototype.set;Qw.prototype.setProperties=Qw.prototype.C;Qw.prototype.unset=Qw.prototype.R;
Qw.prototype.changed=Qw.prototype.u;Qw.prototype.dispatchEvent=Qw.prototype.b;Qw.prototype.getRevision=Qw.prototype.L;Qw.prototype.on=Qw.prototype.I;Qw.prototype.once=Qw.prototype.M;Qw.prototype.un=Qw.prototype.K;Qw.prototype.unByKey=Qw.prototype.N;Vw.prototype.getAttributions=Vw.prototype.ea;Vw.prototype.getLogo=Vw.prototype.pa;Vw.prototype.getProjection=Vw.prototype.sa;Vw.prototype.getState=Vw.prototype.V;Vw.prototype.setAttributions=Vw.prototype.ma;Vw.prototype.get=Vw.prototype.get;
Vw.prototype.getKeys=Vw.prototype.O;Vw.prototype.getProperties=Vw.prototype.P;Vw.prototype.set=Vw.prototype.set;Vw.prototype.setProperties=Vw.prototype.C;Vw.prototype.unset=Vw.prototype.R;Vw.prototype.changed=Vw.prototype.u;Vw.prototype.dispatchEvent=Vw.prototype.b;Vw.prototype.getRevision=Vw.prototype.L;Vw.prototype.on=Vw.prototype.I;Vw.prototype.once=Vw.prototype.M;Vw.prototype.un=Vw.prototype.K;Vw.prototype.unByKey=Vw.prototype.N;ex.prototype.setRenderReprojectionEdges=ex.prototype.zb;
ex.prototype.setTileGridForProjection=ex.prototype.Ab;ex.prototype.getTileLoadFunction=ex.prototype.$a;ex.prototype.getTileUrlFunction=ex.prototype.ab;ex.prototype.getUrls=ex.prototype.bb;ex.prototype.setTileLoadFunction=ex.prototype.jb;ex.prototype.setTileUrlFunction=ex.prototype.Na;ex.prototype.setUrl=ex.prototype.Xa;ex.prototype.setUrls=ex.prototype.Ya;ex.prototype.getTileGrid=ex.prototype.Ma;ex.prototype.getAttributions=ex.prototype.ea;ex.prototype.getLogo=ex.prototype.pa;
ex.prototype.getProjection=ex.prototype.sa;ex.prototype.getState=ex.prototype.V;ex.prototype.setAttributions=ex.prototype.ma;ex.prototype.get=ex.prototype.get;ex.prototype.getKeys=ex.prototype.O;ex.prototype.getProperties=ex.prototype.P;ex.prototype.set=ex.prototype.set;ex.prototype.setProperties=ex.prototype.C;ex.prototype.unset=ex.prototype.R;ex.prototype.changed=ex.prototype.u;ex.prototype.dispatchEvent=ex.prototype.b;ex.prototype.getRevision=ex.prototype.L;ex.prototype.on=ex.prototype.I;
ex.prototype.once=ex.prototype.M;ex.prototype.un=ex.prototype.K;ex.prototype.unByKey=ex.prototype.N;gx.prototype.setRenderReprojectionEdges=gx.prototype.zb;gx.prototype.setTileGridForProjection=gx.prototype.Ab;gx.prototype.getTileLoadFunction=gx.prototype.$a;gx.prototype.getTileUrlFunction=gx.prototype.ab;gx.prototype.getUrls=gx.prototype.bb;gx.prototype.setTileLoadFunction=gx.prototype.jb;gx.prototype.setTileUrlFunction=gx.prototype.Na;gx.prototype.setUrl=gx.prototype.Xa;gx.prototype.setUrls=gx.prototype.Ya;
gx.prototype.getTileGrid=gx.prototype.Ma;gx.prototype.getAttributions=gx.prototype.ea;gx.prototype.getLogo=gx.prototype.pa;gx.prototype.getProjection=gx.prototype.sa;gx.prototype.getState=gx.prototype.V;gx.prototype.setAttributions=gx.prototype.ma;gx.prototype.get=gx.prototype.get;gx.prototype.getKeys=gx.prototype.O;gx.prototype.getProperties=gx.prototype.P;gx.prototype.set=gx.prototype.set;gx.prototype.setProperties=gx.prototype.C;gx.prototype.unset=gx.prototype.R;gx.prototype.changed=gx.prototype.u;
gx.prototype.dispatchEvent=gx.prototype.b;gx.prototype.getRevision=gx.prototype.L;gx.prototype.on=gx.prototype.I;gx.prototype.once=gx.prototype.M;gx.prototype.un=gx.prototype.K;gx.prototype.unByKey=gx.prototype.N;ix.prototype.getTileGrid=ix.prototype.Ma;ix.prototype.getAttributions=ix.prototype.ea;ix.prototype.getLogo=ix.prototype.pa;ix.prototype.getProjection=ix.prototype.sa;ix.prototype.getState=ix.prototype.V;ix.prototype.setAttributions=ix.prototype.ma;ix.prototype.get=ix.prototype.get;
ix.prototype.getKeys=ix.prototype.O;ix.prototype.getProperties=ix.prototype.P;ix.prototype.set=ix.prototype.set;ix.prototype.setProperties=ix.prototype.C;ix.prototype.unset=ix.prototype.R;ix.prototype.changed=ix.prototype.u;ix.prototype.dispatchEvent=ix.prototype.b;ix.prototype.getRevision=ix.prototype.L;ix.prototype.on=ix.prototype.I;ix.prototype.once=ix.prototype.M;ix.prototype.un=ix.prototype.K;ix.prototype.unByKey=ix.prototype.N;jx.prototype.setRenderReprojectionEdges=jx.prototype.zb;
jx.prototype.setTileGridForProjection=jx.prototype.Ab;jx.prototype.getTileLoadFunction=jx.prototype.$a;jx.prototype.getTileUrlFunction=jx.prototype.ab;jx.prototype.getUrls=jx.prototype.bb;jx.prototype.setTileLoadFunction=jx.prototype.jb;jx.prototype.setTileUrlFunction=jx.prototype.Na;jx.prototype.setUrl=jx.prototype.Xa;jx.prototype.setUrls=jx.prototype.Ya;jx.prototype.getTileGrid=jx.prototype.Ma;jx.prototype.getAttributions=jx.prototype.ea;jx.prototype.getLogo=jx.prototype.pa;
jx.prototype.getProjection=jx.prototype.sa;jx.prototype.getState=jx.prototype.V;jx.prototype.setAttributions=jx.prototype.ma;jx.prototype.get=jx.prototype.get;jx.prototype.getKeys=jx.prototype.O;jx.prototype.getProperties=jx.prototype.P;jx.prototype.set=jx.prototype.set;jx.prototype.setProperties=jx.prototype.C;jx.prototype.unset=jx.prototype.R;jx.prototype.changed=jx.prototype.u;jx.prototype.dispatchEvent=jx.prototype.b;jx.prototype.getRevision=jx.prototype.L;jx.prototype.on=jx.prototype.I;
jx.prototype.once=jx.prototype.M;jx.prototype.un=jx.prototype.K;jx.prototype.unByKey=jx.prototype.N;kx.prototype.getTileGrid=kx.prototype.Ma;kx.prototype.getAttributions=kx.prototype.ea;kx.prototype.getLogo=kx.prototype.pa;kx.prototype.getProjection=kx.prototype.sa;kx.prototype.getState=kx.prototype.V;kx.prototype.setAttributions=kx.prototype.ma;kx.prototype.get=kx.prototype.get;kx.prototype.getKeys=kx.prototype.O;kx.prototype.getProperties=kx.prototype.P;kx.prototype.set=kx.prototype.set;
kx.prototype.setProperties=kx.prototype.C;kx.prototype.unset=kx.prototype.R;kx.prototype.changed=kx.prototype.u;kx.prototype.dispatchEvent=kx.prototype.b;kx.prototype.getRevision=kx.prototype.L;kx.prototype.on=kx.prototype.I;kx.prototype.once=kx.prototype.M;kx.prototype.un=kx.prototype.K;kx.prototype.unByKey=kx.prototype.N;ox.prototype.setRenderReprojectionEdges=ox.prototype.zb;ox.prototype.setTileGridForProjection=ox.prototype.Ab;ox.prototype.getTileLoadFunction=ox.prototype.$a;
ox.prototype.getTileUrlFunction=ox.prototype.ab;ox.prototype.getUrls=ox.prototype.bb;ox.prototype.setTileLoadFunction=ox.prototype.jb;ox.prototype.setTileUrlFunction=ox.prototype.Na;ox.prototype.setUrl=ox.prototype.Xa;ox.prototype.setUrls=ox.prototype.Ya;ox.prototype.getTileGrid=ox.prototype.Ma;ox.prototype.getAttributions=ox.prototype.ea;ox.prototype.getLogo=ox.prototype.pa;ox.prototype.getProjection=ox.prototype.sa;ox.prototype.getState=ox.prototype.V;ox.prototype.setAttributions=ox.prototype.ma;
ox.prototype.get=ox.prototype.get;ox.prototype.getKeys=ox.prototype.O;ox.prototype.getProperties=ox.prototype.P;ox.prototype.set=ox.prototype.set;ox.prototype.setProperties=ox.prototype.C;ox.prototype.unset=ox.prototype.R;ox.prototype.changed=ox.prototype.u;ox.prototype.dispatchEvent=ox.prototype.b;ox.prototype.getRevision=ox.prototype.L;ox.prototype.on=ox.prototype.I;ox.prototype.once=ox.prototype.M;ox.prototype.un=ox.prototype.K;ox.prototype.unByKey=ox.prototype.N;
vn.prototype.getTileLoadFunction=vn.prototype.$a;vn.prototype.getTileUrlFunction=vn.prototype.ab;vn.prototype.getUrls=vn.prototype.bb;vn.prototype.setTileLoadFunction=vn.prototype.jb;vn.prototype.setTileUrlFunction=vn.prototype.Na;vn.prototype.setUrl=vn.prototype.Xa;vn.prototype.setUrls=vn.prototype.Ya;vn.prototype.getTileGrid=vn.prototype.Ma;vn.prototype.getAttributions=vn.prototype.ea;vn.prototype.getLogo=vn.prototype.pa;vn.prototype.getProjection=vn.prototype.sa;vn.prototype.getState=vn.prototype.V;
vn.prototype.setAttributions=vn.prototype.ma;vn.prototype.get=vn.prototype.get;vn.prototype.getKeys=vn.prototype.O;vn.prototype.getProperties=vn.prototype.P;vn.prototype.set=vn.prototype.set;vn.prototype.setProperties=vn.prototype.C;vn.prototype.unset=vn.prototype.R;vn.prototype.changed=vn.prototype.u;vn.prototype.dispatchEvent=vn.prototype.b;vn.prototype.getRevision=vn.prototype.L;vn.prototype.on=vn.prototype.I;vn.prototype.once=vn.prototype.M;vn.prototype.un=vn.prototype.K;
vn.prototype.unByKey=vn.prototype.N;Z.prototype.setRenderReprojectionEdges=Z.prototype.zb;Z.prototype.setTileGridForProjection=Z.prototype.Ab;Z.prototype.getTileLoadFunction=Z.prototype.$a;Z.prototype.getTileUrlFunction=Z.prototype.ab;Z.prototype.getUrls=Z.prototype.bb;Z.prototype.setTileLoadFunction=Z.prototype.jb;Z.prototype.setTileUrlFunction=Z.prototype.Na;Z.prototype.setUrl=Z.prototype.Xa;Z.prototype.setUrls=Z.prototype.Ya;Z.prototype.getTileGrid=Z.prototype.Ma;Z.prototype.getAttributions=Z.prototype.ea;
Z.prototype.getLogo=Z.prototype.pa;Z.prototype.getProjection=Z.prototype.sa;Z.prototype.getState=Z.prototype.V;Z.prototype.setAttributions=Z.prototype.ma;Z.prototype.get=Z.prototype.get;Z.prototype.getKeys=Z.prototype.O;Z.prototype.getProperties=Z.prototype.P;Z.prototype.set=Z.prototype.set;Z.prototype.setProperties=Z.prototype.C;Z.prototype.unset=Z.prototype.R;Z.prototype.changed=Z.prototype.u;Z.prototype.dispatchEvent=Z.prototype.b;Z.prototype.getRevision=Z.prototype.L;Z.prototype.on=Z.prototype.I;
Z.prototype.once=Z.prototype.M;Z.prototype.un=Z.prototype.K;Z.prototype.unByKey=Z.prototype.N;wx.prototype.setRenderReprojectionEdges=wx.prototype.zb;wx.prototype.setTileGridForProjection=wx.prototype.Ab;wx.prototype.getTileLoadFunction=wx.prototype.$a;wx.prototype.getTileUrlFunction=wx.prototype.ab;wx.prototype.getUrls=wx.prototype.bb;wx.prototype.setTileLoadFunction=wx.prototype.jb;wx.prototype.setTileUrlFunction=wx.prototype.Na;wx.prototype.setUrl=wx.prototype.Xa;wx.prototype.setUrls=wx.prototype.Ya;
wx.prototype.getTileGrid=wx.prototype.Ma;wx.prototype.getAttributions=wx.prototype.ea;wx.prototype.getLogo=wx.prototype.pa;wx.prototype.getProjection=wx.prototype.sa;wx.prototype.getState=wx.prototype.V;wx.prototype.setAttributions=wx.prototype.ma;wx.prototype.get=wx.prototype.get;wx.prototype.getKeys=wx.prototype.O;wx.prototype.getProperties=wx.prototype.P;wx.prototype.set=wx.prototype.set;wx.prototype.setProperties=wx.prototype.C;wx.prototype.unset=wx.prototype.R;wx.prototype.changed=wx.prototype.u;
wx.prototype.dispatchEvent=wx.prototype.b;wx.prototype.getRevision=wx.prototype.L;wx.prototype.on=wx.prototype.I;wx.prototype.once=wx.prototype.M;wx.prototype.un=wx.prototype.K;wx.prototype.unByKey=wx.prototype.N;Aw.prototype.getTileCoord=Aw.prototype.f;Mi.prototype.changed=Mi.prototype.u;Mi.prototype.dispatchEvent=Mi.prototype.b;Mi.prototype.getRevision=Mi.prototype.L;Mi.prototype.on=Mi.prototype.I;Mi.prototype.once=Mi.prototype.M;Mi.prototype.un=Mi.prototype.K;Mi.prototype.unByKey=Mi.prototype.N;
so.prototype.changed=so.prototype.u;so.prototype.dispatchEvent=so.prototype.b;so.prototype.getRevision=so.prototype.L;so.prototype.on=so.prototype.I;so.prototype.once=so.prototype.M;so.prototype.un=so.prototype.K;so.prototype.unByKey=so.prototype.N;vo.prototype.changed=vo.prototype.u;vo.prototype.dispatchEvent=vo.prototype.b;vo.prototype.getRevision=vo.prototype.L;vo.prototype.on=vo.prototype.I;vo.prototype.once=vo.prototype.M;vo.prototype.un=vo.prototype.K;vo.prototype.unByKey=vo.prototype.N;
Bo.prototype.changed=Bo.prototype.u;Bo.prototype.dispatchEvent=Bo.prototype.b;Bo.prototype.getRevision=Bo.prototype.L;Bo.prototype.on=Bo.prototype.I;Bo.prototype.once=Bo.prototype.M;Bo.prototype.un=Bo.prototype.K;Bo.prototype.unByKey=Bo.prototype.N;Do.prototype.changed=Do.prototype.u;Do.prototype.dispatchEvent=Do.prototype.b;Do.prototype.getRevision=Do.prototype.L;Do.prototype.on=Do.prototype.I;Do.prototype.once=Do.prototype.M;Do.prototype.un=Do.prototype.K;Do.prototype.unByKey=Do.prototype.N;
Bn.prototype.changed=Bn.prototype.u;Bn.prototype.dispatchEvent=Bn.prototype.b;Bn.prototype.getRevision=Bn.prototype.L;Bn.prototype.on=Bn.prototype.I;Bn.prototype.once=Bn.prototype.M;Bn.prototype.un=Bn.prototype.K;Bn.prototype.unByKey=Bn.prototype.N;Cn.prototype.changed=Cn.prototype.u;Cn.prototype.dispatchEvent=Cn.prototype.b;Cn.prototype.getRevision=Cn.prototype.L;Cn.prototype.on=Cn.prototype.I;Cn.prototype.once=Cn.prototype.M;Cn.prototype.un=Cn.prototype.K;Cn.prototype.unByKey=Cn.prototype.N;
Dn.prototype.changed=Dn.prototype.u;Dn.prototype.dispatchEvent=Dn.prototype.b;Dn.prototype.getRevision=Dn.prototype.L;Dn.prototype.on=Dn.prototype.I;Dn.prototype.once=Dn.prototype.M;Dn.prototype.un=Dn.prototype.K;Dn.prototype.unByKey=Dn.prototype.N;Fn.prototype.changed=Fn.prototype.u;Fn.prototype.dispatchEvent=Fn.prototype.b;Fn.prototype.getRevision=Fn.prototype.L;Fn.prototype.on=Fn.prototype.I;Fn.prototype.once=Fn.prototype.M;Fn.prototype.un=Fn.prototype.K;Fn.prototype.unByKey=Fn.prototype.N;
dl.prototype.changed=dl.prototype.u;dl.prototype.dispatchEvent=dl.prototype.b;dl.prototype.getRevision=dl.prototype.L;dl.prototype.on=dl.prototype.I;dl.prototype.once=dl.prototype.M;dl.prototype.un=dl.prototype.K;dl.prototype.unByKey=dl.prototype.N;mn.prototype.changed=mn.prototype.u;mn.prototype.dispatchEvent=mn.prototype.b;mn.prototype.getRevision=mn.prototype.L;mn.prototype.on=mn.prototype.I;mn.prototype.once=mn.prototype.M;mn.prototype.un=mn.prototype.K;mn.prototype.unByKey=mn.prototype.N;
nn.prototype.changed=nn.prototype.u;nn.prototype.dispatchEvent=nn.prototype.b;nn.prototype.getRevision=nn.prototype.L;nn.prototype.on=nn.prototype.I;nn.prototype.once=nn.prototype.M;nn.prototype.un=nn.prototype.K;nn.prototype.unByKey=nn.prototype.N;on.prototype.changed=on.prototype.u;on.prototype.dispatchEvent=on.prototype.b;on.prototype.getRevision=on.prototype.L;on.prototype.on=on.prototype.I;on.prototype.once=on.prototype.M;on.prototype.un=on.prototype.K;on.prototype.unByKey=on.prototype.N;
xn.prototype.changed=xn.prototype.u;xn.prototype.dispatchEvent=xn.prototype.b;xn.prototype.getRevision=xn.prototype.L;xn.prototype.on=xn.prototype.I;xn.prototype.once=xn.prototype.M;xn.prototype.un=xn.prototype.K;xn.prototype.unByKey=xn.prototype.N;Bi.prototype.get=Bi.prototype.get;Bi.prototype.getKeys=Bi.prototype.O;Bi.prototype.getProperties=Bi.prototype.P;Bi.prototype.set=Bi.prototype.set;Bi.prototype.setProperties=Bi.prototype.C;Bi.prototype.unset=Bi.prototype.R;Bi.prototype.changed=Bi.prototype.u;
Bi.prototype.dispatchEvent=Bi.prototype.b;Bi.prototype.getRevision=Bi.prototype.L;Bi.prototype.on=Bi.prototype.I;Bi.prototype.once=Bi.prototype.M;Bi.prototype.un=Bi.prototype.K;Bi.prototype.unByKey=Bi.prototype.N;Fi.prototype.getExtent=Fi.prototype.G;Fi.prototype.getMaxResolution=Fi.prototype.Nb;Fi.prototype.getMinResolution=Fi.prototype.Ob;Fi.prototype.getOpacity=Fi.prototype.Sb;Fi.prototype.getVisible=Fi.prototype.wb;Fi.prototype.getZIndex=Fi.prototype.Tb;Fi.prototype.setExtent=Fi.prototype.cc;
Fi.prototype.setMaxResolution=Fi.prototype.kc;Fi.prototype.setMinResolution=Fi.prototype.lc;Fi.prototype.setOpacity=Fi.prototype.dc;Fi.prototype.setVisible=Fi.prototype.ec;Fi.prototype.setZIndex=Fi.prototype.fc;Fi.prototype.get=Fi.prototype.get;Fi.prototype.getKeys=Fi.prototype.O;Fi.prototype.getProperties=Fi.prototype.P;Fi.prototype.set=Fi.prototype.set;Fi.prototype.setProperties=Fi.prototype.C;Fi.prototype.unset=Fi.prototype.R;Fi.prototype.changed=Fi.prototype.u;Fi.prototype.dispatchEvent=Fi.prototype.b;
Fi.prototype.getRevision=Fi.prototype.L;Fi.prototype.on=Fi.prototype.I;Fi.prototype.once=Fi.prototype.M;Fi.prototype.un=Fi.prototype.K;Fi.prototype.unByKey=Fi.prototype.N;H.prototype.setMap=H.prototype.setMap;H.prototype.setSource=H.prototype.Cc;H.prototype.getExtent=H.prototype.G;H.prototype.getMaxResolution=H.prototype.Nb;H.prototype.getMinResolution=H.prototype.Ob;H.prototype.getOpacity=H.prototype.Sb;H.prototype.getVisible=H.prototype.wb;H.prototype.getZIndex=H.prototype.Tb;
H.prototype.setExtent=H.prototype.cc;H.prototype.setMaxResolution=H.prototype.kc;H.prototype.setMinResolution=H.prototype.lc;H.prototype.setOpacity=H.prototype.dc;H.prototype.setVisible=H.prototype.ec;H.prototype.setZIndex=H.prototype.fc;H.prototype.get=H.prototype.get;H.prototype.getKeys=H.prototype.O;H.prototype.getProperties=H.prototype.P;H.prototype.set=H.prototype.set;H.prototype.setProperties=H.prototype.C;H.prototype.unset=H.prototype.R;H.prototype.changed=H.prototype.u;
H.prototype.dispatchEvent=H.prototype.b;H.prototype.getRevision=H.prototype.L;H.prototype.on=H.prototype.I;H.prototype.once=H.prototype.M;H.prototype.un=H.prototype.K;H.prototype.unByKey=H.prototype.N;X.prototype.getSource=X.prototype.da;X.prototype.getStyle=X.prototype.J;X.prototype.getStyleFunction=X.prototype.D;X.prototype.setStyle=X.prototype.c;X.prototype.setMap=X.prototype.setMap;X.prototype.setSource=X.prototype.Cc;X.prototype.getExtent=X.prototype.G;X.prototype.getMaxResolution=X.prototype.Nb;
X.prototype.getMinResolution=X.prototype.Ob;X.prototype.getOpacity=X.prototype.Sb;X.prototype.getVisible=X.prototype.wb;X.prototype.getZIndex=X.prototype.Tb;X.prototype.setExtent=X.prototype.cc;X.prototype.setMaxResolution=X.prototype.kc;X.prototype.setMinResolution=X.prototype.lc;X.prototype.setOpacity=X.prototype.dc;X.prototype.setVisible=X.prototype.ec;X.prototype.setZIndex=X.prototype.fc;X.prototype.get=X.prototype.get;X.prototype.getKeys=X.prototype.O;X.prototype.getProperties=X.prototype.P;
X.prototype.set=X.prototype.set;X.prototype.setProperties=X.prototype.C;X.prototype.unset=X.prototype.R;X.prototype.changed=X.prototype.u;X.prototype.dispatchEvent=X.prototype.b;X.prototype.getRevision=X.prototype.L;X.prototype.on=X.prototype.I;X.prototype.once=X.prototype.M;X.prototype.un=X.prototype.K;X.prototype.unByKey=X.prototype.N;vk.prototype.setMap=vk.prototype.setMap;vk.prototype.setSource=vk.prototype.Cc;vk.prototype.getExtent=vk.prototype.G;vk.prototype.getMaxResolution=vk.prototype.Nb;
vk.prototype.getMinResolution=vk.prototype.Ob;vk.prototype.getOpacity=vk.prototype.Sb;vk.prototype.getVisible=vk.prototype.wb;vk.prototype.getZIndex=vk.prototype.Tb;vk.prototype.setExtent=vk.prototype.cc;vk.prototype.setMaxResolution=vk.prototype.kc;vk.prototype.setMinResolution=vk.prototype.lc;vk.prototype.setOpacity=vk.prototype.dc;vk.prototype.setVisible=vk.prototype.ec;vk.prototype.setZIndex=vk.prototype.fc;vk.prototype.get=vk.prototype.get;vk.prototype.getKeys=vk.prototype.O;
vk.prototype.getProperties=vk.prototype.P;vk.prototype.set=vk.prototype.set;vk.prototype.setProperties=vk.prototype.C;vk.prototype.unset=vk.prototype.R;vk.prototype.changed=vk.prototype.u;vk.prototype.dispatchEvent=vk.prototype.b;vk.prototype.getRevision=vk.prototype.L;vk.prototype.on=vk.prototype.I;vk.prototype.once=vk.prototype.M;vk.prototype.un=vk.prototype.K;vk.prototype.unByKey=vk.prototype.N;lk.prototype.getExtent=lk.prototype.G;lk.prototype.getMaxResolution=lk.prototype.Nb;
lk.prototype.getMinResolution=lk.prototype.Ob;lk.prototype.getOpacity=lk.prototype.Sb;lk.prototype.getVisible=lk.prototype.wb;lk.prototype.getZIndex=lk.prototype.Tb;lk.prototype.setExtent=lk.prototype.cc;lk.prototype.setMaxResolution=lk.prototype.kc;lk.prototype.setMinResolution=lk.prototype.lc;lk.prototype.setOpacity=lk.prototype.dc;lk.prototype.setVisible=lk.prototype.ec;lk.prototype.setZIndex=lk.prototype.fc;lk.prototype.get=lk.prototype.get;lk.prototype.getKeys=lk.prototype.O;
lk.prototype.getProperties=lk.prototype.P;lk.prototype.set=lk.prototype.set;lk.prototype.setProperties=lk.prototype.C;lk.prototype.unset=lk.prototype.R;lk.prototype.changed=lk.prototype.u;lk.prototype.dispatchEvent=lk.prototype.b;lk.prototype.getRevision=lk.prototype.L;lk.prototype.on=lk.prototype.I;lk.prototype.once=lk.prototype.M;lk.prototype.un=lk.prototype.K;lk.prototype.unByKey=lk.prototype.N;G.prototype.setMap=G.prototype.setMap;G.prototype.setSource=G.prototype.Cc;G.prototype.getExtent=G.prototype.G;
G.prototype.getMaxResolution=G.prototype.Nb;G.prototype.getMinResolution=G.prototype.Ob;G.prototype.getOpacity=G.prototype.Sb;G.prototype.getVisible=G.prototype.wb;G.prototype.getZIndex=G.prototype.Tb;G.prototype.setExtent=G.prototype.cc;G.prototype.setMaxResolution=G.prototype.kc;G.prototype.setMinResolution=G.prototype.lc;G.prototype.setOpacity=G.prototype.dc;G.prototype.setVisible=G.prototype.ec;G.prototype.setZIndex=G.prototype.fc;G.prototype.get=G.prototype.get;G.prototype.getKeys=G.prototype.O;
G.prototype.getProperties=G.prototype.P;G.prototype.set=G.prototype.set;G.prototype.setProperties=G.prototype.C;G.prototype.unset=G.prototype.R;G.prototype.changed=G.prototype.u;G.prototype.dispatchEvent=G.prototype.b;G.prototype.getRevision=G.prototype.L;G.prototype.on=G.prototype.I;G.prototype.once=G.prototype.M;G.prototype.un=G.prototype.K;G.prototype.unByKey=G.prototype.N;L.prototype.getSource=L.prototype.da;L.prototype.getStyle=L.prototype.J;L.prototype.getStyleFunction=L.prototype.D;
L.prototype.setStyle=L.prototype.c;L.prototype.setMap=L.prototype.setMap;L.prototype.setSource=L.prototype.Cc;L.prototype.getExtent=L.prototype.G;L.prototype.getMaxResolution=L.prototype.Nb;L.prototype.getMinResolution=L.prototype.Ob;L.prototype.getOpacity=L.prototype.Sb;L.prototype.getVisible=L.prototype.wb;L.prototype.getZIndex=L.prototype.Tb;L.prototype.setExtent=L.prototype.cc;L.prototype.setMaxResolution=L.prototype.kc;L.prototype.setMinResolution=L.prototype.lc;L.prototype.setOpacity=L.prototype.dc;
L.prototype.setVisible=L.prototype.ec;L.prototype.setZIndex=L.prototype.fc;L.prototype.get=L.prototype.get;L.prototype.getKeys=L.prototype.O;L.prototype.getProperties=L.prototype.P;L.prototype.set=L.prototype.set;L.prototype.setProperties=L.prototype.C;L.prototype.unset=L.prototype.R;L.prototype.changed=L.prototype.u;L.prototype.dispatchEvent=L.prototype.b;L.prototype.getRevision=L.prototype.L;L.prototype.on=L.prototype.I;L.prototype.once=L.prototype.M;L.prototype.un=L.prototype.K;
L.prototype.unByKey=L.prototype.N;nj.prototype.get=nj.prototype.get;nj.prototype.getKeys=nj.prototype.O;nj.prototype.getProperties=nj.prototype.P;nj.prototype.set=nj.prototype.set;nj.prototype.setProperties=nj.prototype.C;nj.prototype.unset=nj.prototype.R;nj.prototype.changed=nj.prototype.u;nj.prototype.dispatchEvent=nj.prototype.b;nj.prototype.getRevision=nj.prototype.L;nj.prototype.on=nj.prototype.I;nj.prototype.once=nj.prototype.M;nj.prototype.un=nj.prototype.K;nj.prototype.unByKey=nj.prototype.N;
rj.prototype.getActive=rj.prototype.f;rj.prototype.getMap=rj.prototype.j;rj.prototype.setActive=rj.prototype.i;rj.prototype.get=rj.prototype.get;rj.prototype.getKeys=rj.prototype.O;rj.prototype.getProperties=rj.prototype.P;rj.prototype.set=rj.prototype.set;rj.prototype.setProperties=rj.prototype.C;rj.prototype.unset=rj.prototype.R;rj.prototype.changed=rj.prototype.u;rj.prototype.dispatchEvent=rj.prototype.b;rj.prototype.getRevision=rj.prototype.L;rj.prototype.on=rj.prototype.I;rj.prototype.once=rj.prototype.M;
rj.prototype.un=rj.prototype.K;rj.prototype.unByKey=rj.prototype.N;vv.prototype.getActive=vv.prototype.f;vv.prototype.getMap=vv.prototype.j;vv.prototype.setActive=vv.prototype.i;vv.prototype.get=vv.prototype.get;vv.prototype.getKeys=vv.prototype.O;vv.prototype.getProperties=vv.prototype.P;vv.prototype.set=vv.prototype.set;vv.prototype.setProperties=vv.prototype.C;vv.prototype.unset=vv.prototype.R;vv.prototype.changed=vv.prototype.u;vv.prototype.dispatchEvent=vv.prototype.b;
vv.prototype.getRevision=vv.prototype.L;vv.prototype.on=vv.prototype.I;vv.prototype.once=vv.prototype.M;vv.prototype.un=vv.prototype.K;vv.prototype.unByKey=vv.prototype.N;Bj.prototype.getActive=Bj.prototype.f;Bj.prototype.getMap=Bj.prototype.j;Bj.prototype.setActive=Bj.prototype.i;Bj.prototype.get=Bj.prototype.get;Bj.prototype.getKeys=Bj.prototype.O;Bj.prototype.getProperties=Bj.prototype.P;Bj.prototype.set=Bj.prototype.set;Bj.prototype.setProperties=Bj.prototype.C;Bj.prototype.unset=Bj.prototype.R;
Bj.prototype.changed=Bj.prototype.u;Bj.prototype.dispatchEvent=Bj.prototype.b;Bj.prototype.getRevision=Bj.prototype.L;Bj.prototype.on=Bj.prototype.I;Bj.prototype.once=Bj.prototype.M;Bj.prototype.un=Bj.prototype.K;Bj.prototype.unByKey=Bj.prototype.N;Qj.prototype.getActive=Qj.prototype.f;Qj.prototype.getMap=Qj.prototype.j;Qj.prototype.setActive=Qj.prototype.i;Qj.prototype.get=Qj.prototype.get;Qj.prototype.getKeys=Qj.prototype.O;Qj.prototype.getProperties=Qj.prototype.P;Qj.prototype.set=Qj.prototype.set;
Qj.prototype.setProperties=Qj.prototype.C;Qj.prototype.unset=Qj.prototype.R;Qj.prototype.changed=Qj.prototype.u;Qj.prototype.dispatchEvent=Qj.prototype.b;Qj.prototype.getRevision=Qj.prototype.L;Qj.prototype.on=Qj.prototype.I;Qj.prototype.once=Qj.prototype.M;Qj.prototype.un=Qj.prototype.K;Qj.prototype.unByKey=Qj.prototype.N;Ej.prototype.getActive=Ej.prototype.f;Ej.prototype.getMap=Ej.prototype.j;Ej.prototype.setActive=Ej.prototype.i;Ej.prototype.get=Ej.prototype.get;Ej.prototype.getKeys=Ej.prototype.O;
Ej.prototype.getProperties=Ej.prototype.P;Ej.prototype.set=Ej.prototype.set;Ej.prototype.setProperties=Ej.prototype.C;Ej.prototype.unset=Ej.prototype.R;Ej.prototype.changed=Ej.prototype.u;Ej.prototype.dispatchEvent=Ej.prototype.b;Ej.prototype.getRevision=Ej.prototype.L;Ej.prototype.on=Ej.prototype.I;Ej.prototype.once=Ej.prototype.M;Ej.prototype.un=Ej.prototype.K;Ej.prototype.unByKey=Ej.prototype.N;Bv.prototype.getActive=Bv.prototype.f;Bv.prototype.getMap=Bv.prototype.j;Bv.prototype.setActive=Bv.prototype.i;
Bv.prototype.get=Bv.prototype.get;Bv.prototype.getKeys=Bv.prototype.O;Bv.prototype.getProperties=Bv.prototype.P;Bv.prototype.set=Bv.prototype.set;Bv.prototype.setProperties=Bv.prototype.C;Bv.prototype.unset=Bv.prototype.R;Bv.prototype.changed=Bv.prototype.u;Bv.prototype.dispatchEvent=Bv.prototype.b;Bv.prototype.getRevision=Bv.prototype.L;Bv.prototype.on=Bv.prototype.I;Bv.prototype.once=Bv.prototype.M;Bv.prototype.un=Bv.prototype.K;Bv.prototype.unByKey=Bv.prototype.N;Ij.prototype.getActive=Ij.prototype.f;
Ij.prototype.getMap=Ij.prototype.j;Ij.prototype.setActive=Ij.prototype.i;Ij.prototype.get=Ij.prototype.get;Ij.prototype.getKeys=Ij.prototype.O;Ij.prototype.getProperties=Ij.prototype.P;Ij.prototype.set=Ij.prototype.set;Ij.prototype.setProperties=Ij.prototype.C;Ij.prototype.unset=Ij.prototype.R;Ij.prototype.changed=Ij.prototype.u;Ij.prototype.dispatchEvent=Ij.prototype.b;Ij.prototype.getRevision=Ij.prototype.L;Ij.prototype.on=Ij.prototype.I;Ij.prototype.once=Ij.prototype.M;Ij.prototype.un=Ij.prototype.K;
Ij.prototype.unByKey=Ij.prototype.N;Vj.prototype.getGeometry=Vj.prototype.X;Vj.prototype.getActive=Vj.prototype.f;Vj.prototype.getMap=Vj.prototype.j;Vj.prototype.setActive=Vj.prototype.i;Vj.prototype.get=Vj.prototype.get;Vj.prototype.getKeys=Vj.prototype.O;Vj.prototype.getProperties=Vj.prototype.P;Vj.prototype.set=Vj.prototype.set;Vj.prototype.setProperties=Vj.prototype.C;Vj.prototype.unset=Vj.prototype.R;Vj.prototype.changed=Vj.prototype.u;Vj.prototype.dispatchEvent=Vj.prototype.b;
Vj.prototype.getRevision=Vj.prototype.L;Vj.prototype.on=Vj.prototype.I;Vj.prototype.once=Vj.prototype.M;Vj.prototype.un=Vj.prototype.K;Vj.prototype.unByKey=Vj.prototype.N;Gv.prototype.getActive=Gv.prototype.f;Gv.prototype.getMap=Gv.prototype.j;Gv.prototype.setActive=Gv.prototype.i;Gv.prototype.get=Gv.prototype.get;Gv.prototype.getKeys=Gv.prototype.O;Gv.prototype.getProperties=Gv.prototype.P;Gv.prototype.set=Gv.prototype.set;Gv.prototype.setProperties=Gv.prototype.C;Gv.prototype.unset=Gv.prototype.R;
Gv.prototype.changed=Gv.prototype.u;Gv.prototype.dispatchEvent=Gv.prototype.b;Gv.prototype.getRevision=Gv.prototype.L;Gv.prototype.on=Gv.prototype.I;Gv.prototype.once=Gv.prototype.M;Gv.prototype.un=Gv.prototype.K;Gv.prototype.unByKey=Gv.prototype.N;Wj.prototype.getActive=Wj.prototype.f;Wj.prototype.getMap=Wj.prototype.j;Wj.prototype.setActive=Wj.prototype.i;Wj.prototype.get=Wj.prototype.get;Wj.prototype.getKeys=Wj.prototype.O;Wj.prototype.getProperties=Wj.prototype.P;Wj.prototype.set=Wj.prototype.set;
Wj.prototype.setProperties=Wj.prototype.C;Wj.prototype.unset=Wj.prototype.R;Wj.prototype.changed=Wj.prototype.u;Wj.prototype.dispatchEvent=Wj.prototype.b;Wj.prototype.getRevision=Wj.prototype.L;Wj.prototype.on=Wj.prototype.I;Wj.prototype.once=Wj.prototype.M;Wj.prototype.un=Wj.prototype.K;Wj.prototype.unByKey=Wj.prototype.N;Yj.prototype.getActive=Yj.prototype.f;Yj.prototype.getMap=Yj.prototype.j;Yj.prototype.setActive=Yj.prototype.i;Yj.prototype.get=Yj.prototype.get;Yj.prototype.getKeys=Yj.prototype.O;
Yj.prototype.getProperties=Yj.prototype.P;Yj.prototype.set=Yj.prototype.set;Yj.prototype.setProperties=Yj.prototype.C;Yj.prototype.unset=Yj.prototype.R;Yj.prototype.changed=Yj.prototype.u;Yj.prototype.dispatchEvent=Yj.prototype.b;Yj.prototype.getRevision=Yj.prototype.L;Yj.prototype.on=Yj.prototype.I;Yj.prototype.once=Yj.prototype.M;Yj.prototype.un=Yj.prototype.K;Yj.prototype.unByKey=Yj.prototype.N;Xv.prototype.getActive=Xv.prototype.f;Xv.prototype.getMap=Xv.prototype.j;Xv.prototype.setActive=Xv.prototype.i;
Xv.prototype.get=Xv.prototype.get;Xv.prototype.getKeys=Xv.prototype.O;Xv.prototype.getProperties=Xv.prototype.P;Xv.prototype.set=Xv.prototype.set;Xv.prototype.setProperties=Xv.prototype.C;Xv.prototype.unset=Xv.prototype.R;Xv.prototype.changed=Xv.prototype.u;Xv.prototype.dispatchEvent=Xv.prototype.b;Xv.prototype.getRevision=Xv.prototype.L;Xv.prototype.on=Xv.prototype.I;Xv.prototype.once=Xv.prototype.M;Xv.prototype.un=Xv.prototype.K;Xv.prototype.unByKey=Xv.prototype.N;ak.prototype.getActive=ak.prototype.f;
ak.prototype.getMap=ak.prototype.j;ak.prototype.setActive=ak.prototype.i;ak.prototype.get=ak.prototype.get;ak.prototype.getKeys=ak.prototype.O;ak.prototype.getProperties=ak.prototype.P;ak.prototype.set=ak.prototype.set;ak.prototype.setProperties=ak.prototype.C;ak.prototype.unset=ak.prototype.R;ak.prototype.changed=ak.prototype.u;ak.prototype.dispatchEvent=ak.prototype.b;ak.prototype.getRevision=ak.prototype.L;ak.prototype.on=ak.prototype.I;ak.prototype.once=ak.prototype.M;ak.prototype.un=ak.prototype.K;
ak.prototype.unByKey=ak.prototype.N;ck.prototype.getActive=ck.prototype.f;ck.prototype.getMap=ck.prototype.j;ck.prototype.setActive=ck.prototype.i;ck.prototype.get=ck.prototype.get;ck.prototype.getKeys=ck.prototype.O;ck.prototype.getProperties=ck.prototype.P;ck.prototype.set=ck.prototype.set;ck.prototype.setProperties=ck.prototype.C;ck.prototype.unset=ck.prototype.R;ck.prototype.changed=ck.prototype.u;ck.prototype.dispatchEvent=ck.prototype.b;ck.prototype.getRevision=ck.prototype.L;
ck.prototype.on=ck.prototype.I;ck.prototype.once=ck.prototype.M;ck.prototype.un=ck.prototype.K;ck.prototype.unByKey=ck.prototype.N;gk.prototype.getActive=gk.prototype.f;gk.prototype.getMap=gk.prototype.j;gk.prototype.setActive=gk.prototype.i;gk.prototype.get=gk.prototype.get;gk.prototype.getKeys=gk.prototype.O;gk.prototype.getProperties=gk.prototype.P;gk.prototype.set=gk.prototype.set;gk.prototype.setProperties=gk.prototype.C;gk.prototype.unset=gk.prototype.R;gk.prototype.changed=gk.prototype.u;
gk.prototype.dispatchEvent=gk.prototype.b;gk.prototype.getRevision=gk.prototype.L;gk.prototype.on=gk.prototype.I;gk.prototype.once=gk.prototype.M;gk.prototype.un=gk.prototype.K;gk.prototype.unByKey=gk.prototype.N;kw.prototype.getActive=kw.prototype.f;kw.prototype.getMap=kw.prototype.j;kw.prototype.setActive=kw.prototype.i;kw.prototype.get=kw.prototype.get;kw.prototype.getKeys=kw.prototype.O;kw.prototype.getProperties=kw.prototype.P;kw.prototype.set=kw.prototype.set;kw.prototype.setProperties=kw.prototype.C;
kw.prototype.unset=kw.prototype.R;kw.prototype.changed=kw.prototype.u;kw.prototype.dispatchEvent=kw.prototype.b;kw.prototype.getRevision=kw.prototype.L;kw.prototype.on=kw.prototype.I;kw.prototype.once=kw.prototype.M;kw.prototype.un=kw.prototype.K;kw.prototype.unByKey=kw.prototype.N;nw.prototype.getActive=nw.prototype.f;nw.prototype.getMap=nw.prototype.j;nw.prototype.setActive=nw.prototype.i;nw.prototype.get=nw.prototype.get;nw.prototype.getKeys=nw.prototype.O;nw.prototype.getProperties=nw.prototype.P;
nw.prototype.set=nw.prototype.set;nw.prototype.setProperties=nw.prototype.C;nw.prototype.unset=nw.prototype.R;nw.prototype.changed=nw.prototype.u;nw.prototype.dispatchEvent=nw.prototype.b;nw.prototype.getRevision=nw.prototype.L;nw.prototype.on=nw.prototype.I;nw.prototype.once=nw.prototype.M;nw.prototype.un=nw.prototype.K;nw.prototype.unByKey=nw.prototype.N;sw.prototype.getActive=sw.prototype.f;sw.prototype.getMap=sw.prototype.j;sw.prototype.setActive=sw.prototype.i;sw.prototype.get=sw.prototype.get;
sw.prototype.getKeys=sw.prototype.O;sw.prototype.getProperties=sw.prototype.P;sw.prototype.set=sw.prototype.set;sw.prototype.setProperties=sw.prototype.C;sw.prototype.unset=sw.prototype.R;sw.prototype.changed=sw.prototype.u;sw.prototype.dispatchEvent=sw.prototype.b;sw.prototype.getRevision=sw.prototype.L;sw.prototype.on=sw.prototype.I;sw.prototype.once=sw.prototype.M;sw.prototype.un=sw.prototype.K;sw.prototype.unByKey=sw.prototype.N;Md.prototype.get=Md.prototype.get;Md.prototype.getKeys=Md.prototype.O;
Md.prototype.getProperties=Md.prototype.P;Md.prototype.set=Md.prototype.set;Md.prototype.setProperties=Md.prototype.C;Md.prototype.unset=Md.prototype.R;Md.prototype.changed=Md.prototype.u;Md.prototype.dispatchEvent=Md.prototype.b;Md.prototype.getRevision=Md.prototype.L;Md.prototype.on=Md.prototype.I;Md.prototype.once=Md.prototype.M;Md.prototype.un=Md.prototype.K;Md.prototype.unByKey=Md.prototype.N;Od.prototype.getClosestPoint=Od.prototype.vb;Od.prototype.getExtent=Od.prototype.G;
Od.prototype.simplify=Od.prototype.Bb;Od.prototype.transform=Od.prototype.fb;Od.prototype.get=Od.prototype.get;Od.prototype.getKeys=Od.prototype.O;Od.prototype.getProperties=Od.prototype.P;Od.prototype.set=Od.prototype.set;Od.prototype.setProperties=Od.prototype.C;Od.prototype.unset=Od.prototype.R;Od.prototype.changed=Od.prototype.u;Od.prototype.dispatchEvent=Od.prototype.b;Od.prototype.getRevision=Od.prototype.L;Od.prototype.on=Od.prototype.I;Od.prototype.once=Od.prototype.M;Od.prototype.un=Od.prototype.K;
Od.prototype.unByKey=Od.prototype.N;iv.prototype.getFirstCoordinate=iv.prototype.Kb;iv.prototype.getLastCoordinate=iv.prototype.Lb;iv.prototype.getLayout=iv.prototype.Mb;iv.prototype.getClosestPoint=iv.prototype.vb;iv.prototype.getExtent=iv.prototype.G;iv.prototype.simplify=iv.prototype.Bb;iv.prototype.get=iv.prototype.get;iv.prototype.getKeys=iv.prototype.O;iv.prototype.getProperties=iv.prototype.P;iv.prototype.set=iv.prototype.set;iv.prototype.setProperties=iv.prototype.C;iv.prototype.unset=iv.prototype.R;
iv.prototype.changed=iv.prototype.u;iv.prototype.dispatchEvent=iv.prototype.b;iv.prototype.getRevision=iv.prototype.L;iv.prototype.on=iv.prototype.I;iv.prototype.once=iv.prototype.M;iv.prototype.un=iv.prototype.K;iv.prototype.unByKey=iv.prototype.N;zp.prototype.getClosestPoint=zp.prototype.vb;zp.prototype.getExtent=zp.prototype.G;zp.prototype.simplify=zp.prototype.Bb;zp.prototype.transform=zp.prototype.fb;zp.prototype.get=zp.prototype.get;zp.prototype.getKeys=zp.prototype.O;
zp.prototype.getProperties=zp.prototype.P;zp.prototype.set=zp.prototype.set;zp.prototype.setProperties=zp.prototype.C;zp.prototype.unset=zp.prototype.R;zp.prototype.changed=zp.prototype.u;zp.prototype.dispatchEvent=zp.prototype.b;zp.prototype.getRevision=zp.prototype.L;zp.prototype.on=zp.prototype.I;zp.prototype.once=zp.prototype.M;zp.prototype.un=zp.prototype.K;zp.prototype.unByKey=zp.prototype.N;fe.prototype.getFirstCoordinate=fe.prototype.Kb;fe.prototype.getLastCoordinate=fe.prototype.Lb;
fe.prototype.getLayout=fe.prototype.Mb;fe.prototype.getClosestPoint=fe.prototype.vb;fe.prototype.getExtent=fe.prototype.G;fe.prototype.simplify=fe.prototype.Bb;fe.prototype.transform=fe.prototype.fb;fe.prototype.get=fe.prototype.get;fe.prototype.getKeys=fe.prototype.O;fe.prototype.getProperties=fe.prototype.P;fe.prototype.set=fe.prototype.set;fe.prototype.setProperties=fe.prototype.C;fe.prototype.unset=fe.prototype.R;fe.prototype.changed=fe.prototype.u;fe.prototype.dispatchEvent=fe.prototype.b;
fe.prototype.getRevision=fe.prototype.L;fe.prototype.on=fe.prototype.I;fe.prototype.once=fe.prototype.M;fe.prototype.un=fe.prototype.K;fe.prototype.unByKey=fe.prototype.N;T.prototype.getFirstCoordinate=T.prototype.Kb;T.prototype.getLastCoordinate=T.prototype.Lb;T.prototype.getLayout=T.prototype.Mb;T.prototype.getClosestPoint=T.prototype.vb;T.prototype.getExtent=T.prototype.G;T.prototype.simplify=T.prototype.Bb;T.prototype.transform=T.prototype.fb;T.prototype.get=T.prototype.get;
T.prototype.getKeys=T.prototype.O;T.prototype.getProperties=T.prototype.P;T.prototype.set=T.prototype.set;T.prototype.setProperties=T.prototype.C;T.prototype.unset=T.prototype.R;T.prototype.changed=T.prototype.u;T.prototype.dispatchEvent=T.prototype.b;T.prototype.getRevision=T.prototype.L;T.prototype.on=T.prototype.I;T.prototype.once=T.prototype.M;T.prototype.un=T.prototype.K;T.prototype.unByKey=T.prototype.N;U.prototype.getFirstCoordinate=U.prototype.Kb;U.prototype.getLastCoordinate=U.prototype.Lb;
U.prototype.getLayout=U.prototype.Mb;U.prototype.getClosestPoint=U.prototype.vb;U.prototype.getExtent=U.prototype.G;U.prototype.simplify=U.prototype.Bb;U.prototype.transform=U.prototype.fb;U.prototype.get=U.prototype.get;U.prototype.getKeys=U.prototype.O;U.prototype.getProperties=U.prototype.P;U.prototype.set=U.prototype.set;U.prototype.setProperties=U.prototype.C;U.prototype.unset=U.prototype.R;U.prototype.changed=U.prototype.u;U.prototype.dispatchEvent=U.prototype.b;U.prototype.getRevision=U.prototype.L;
U.prototype.on=U.prototype.I;U.prototype.once=U.prototype.M;U.prototype.un=U.prototype.K;U.prototype.unByKey=U.prototype.N;pp.prototype.getFirstCoordinate=pp.prototype.Kb;pp.prototype.getLastCoordinate=pp.prototype.Lb;pp.prototype.getLayout=pp.prototype.Mb;pp.prototype.getClosestPoint=pp.prototype.vb;pp.prototype.getExtent=pp.prototype.G;pp.prototype.simplify=pp.prototype.Bb;pp.prototype.transform=pp.prototype.fb;pp.prototype.get=pp.prototype.get;pp.prototype.getKeys=pp.prototype.O;
pp.prototype.getProperties=pp.prototype.P;pp.prototype.set=pp.prototype.set;pp.prototype.setProperties=pp.prototype.C;pp.prototype.unset=pp.prototype.R;pp.prototype.changed=pp.prototype.u;pp.prototype.dispatchEvent=pp.prototype.b;pp.prototype.getRevision=pp.prototype.L;pp.prototype.on=pp.prototype.I;pp.prototype.once=pp.prototype.M;pp.prototype.un=pp.prototype.K;pp.prototype.unByKey=pp.prototype.N;V.prototype.getFirstCoordinate=V.prototype.Kb;V.prototype.getLastCoordinate=V.prototype.Lb;
V.prototype.getLayout=V.prototype.Mb;V.prototype.getClosestPoint=V.prototype.vb;V.prototype.getExtent=V.prototype.G;V.prototype.simplify=V.prototype.Bb;V.prototype.transform=V.prototype.fb;V.prototype.get=V.prototype.get;V.prototype.getKeys=V.prototype.O;V.prototype.getProperties=V.prototype.P;V.prototype.set=V.prototype.set;V.prototype.setProperties=V.prototype.C;V.prototype.unset=V.prototype.R;V.prototype.changed=V.prototype.u;V.prototype.dispatchEvent=V.prototype.b;V.prototype.getRevision=V.prototype.L;
V.prototype.on=V.prototype.I;V.prototype.once=V.prototype.M;V.prototype.un=V.prototype.K;V.prototype.unByKey=V.prototype.N;E.prototype.getFirstCoordinate=E.prototype.Kb;E.prototype.getLastCoordinate=E.prototype.Lb;E.prototype.getLayout=E.prototype.Mb;E.prototype.getClosestPoint=E.prototype.vb;E.prototype.getExtent=E.prototype.G;E.prototype.simplify=E.prototype.Bb;E.prototype.transform=E.prototype.fb;E.prototype.get=E.prototype.get;E.prototype.getKeys=E.prototype.O;E.prototype.getProperties=E.prototype.P;
E.prototype.set=E.prototype.set;E.prototype.setProperties=E.prototype.C;E.prototype.unset=E.prototype.R;E.prototype.changed=E.prototype.u;E.prototype.dispatchEvent=E.prototype.b;E.prototype.getRevision=E.prototype.L;E.prototype.on=E.prototype.I;E.prototype.once=E.prototype.M;E.prototype.un=E.prototype.K;E.prototype.unByKey=E.prototype.N;F.prototype.getFirstCoordinate=F.prototype.Kb;F.prototype.getLastCoordinate=F.prototype.Lb;F.prototype.getLayout=F.prototype.Mb;F.prototype.getClosestPoint=F.prototype.vb;
F.prototype.getExtent=F.prototype.G;F.prototype.simplify=F.prototype.Bb;F.prototype.transform=F.prototype.fb;F.prototype.get=F.prototype.get;F.prototype.getKeys=F.prototype.O;F.prototype.getProperties=F.prototype.P;F.prototype.set=F.prototype.set;F.prototype.setProperties=F.prototype.C;F.prototype.unset=F.prototype.R;F.prototype.changed=F.prototype.u;F.prototype.dispatchEvent=F.prototype.b;F.prototype.getRevision=F.prototype.L;F.prototype.on=F.prototype.I;F.prototype.once=F.prototype.M;
F.prototype.un=F.prototype.K;F.prototype.unByKey=F.prototype.N;Yp.prototype.readFeatures=Yp.prototype.Ea;Zp.prototype.readFeatures=Zp.prototype.Ea;Zp.prototype.readFeatures=Zp.prototype.Ea;jg.prototype.get=jg.prototype.get;jg.prototype.getKeys=jg.prototype.O;jg.prototype.getProperties=jg.prototype.P;jg.prototype.set=jg.prototype.set;jg.prototype.setProperties=jg.prototype.C;jg.prototype.unset=jg.prototype.R;jg.prototype.changed=jg.prototype.u;jg.prototype.dispatchEvent=jg.prototype.b;
jg.prototype.getRevision=jg.prototype.L;jg.prototype.on=jg.prototype.I;jg.prototype.once=jg.prototype.M;jg.prototype.un=jg.prototype.K;jg.prototype.unByKey=jg.prototype.N;Ng.prototype.getMap=Ng.prototype.i;Ng.prototype.setMap=Ng.prototype.setMap;Ng.prototype.setTarget=Ng.prototype.c;Ng.prototype.get=Ng.prototype.get;Ng.prototype.getKeys=Ng.prototype.O;Ng.prototype.getProperties=Ng.prototype.P;Ng.prototype.set=Ng.prototype.set;Ng.prototype.setProperties=Ng.prototype.C;Ng.prototype.unset=Ng.prototype.R;
Ng.prototype.changed=Ng.prototype.u;Ng.prototype.dispatchEvent=Ng.prototype.b;Ng.prototype.getRevision=Ng.prototype.L;Ng.prototype.on=Ng.prototype.I;Ng.prototype.once=Ng.prototype.M;Ng.prototype.un=Ng.prototype.K;Ng.prototype.unByKey=Ng.prototype.N;Yg.prototype.getMap=Yg.prototype.i;Yg.prototype.setMap=Yg.prototype.setMap;Yg.prototype.setTarget=Yg.prototype.c;Yg.prototype.get=Yg.prototype.get;Yg.prototype.getKeys=Yg.prototype.O;Yg.prototype.getProperties=Yg.prototype.P;Yg.prototype.set=Yg.prototype.set;
Yg.prototype.setProperties=Yg.prototype.C;Yg.prototype.unset=Yg.prototype.R;Yg.prototype.changed=Yg.prototype.u;Yg.prototype.dispatchEvent=Yg.prototype.b;Yg.prototype.getRevision=Yg.prototype.L;Yg.prototype.on=Yg.prototype.I;Yg.prototype.once=Yg.prototype.M;Yg.prototype.un=Yg.prototype.K;Yg.prototype.unByKey=Yg.prototype.N;Zg.prototype.getMap=Zg.prototype.i;Zg.prototype.setMap=Zg.prototype.setMap;Zg.prototype.setTarget=Zg.prototype.c;Zg.prototype.get=Zg.prototype.get;Zg.prototype.getKeys=Zg.prototype.O;
Zg.prototype.getProperties=Zg.prototype.P;Zg.prototype.set=Zg.prototype.set;Zg.prototype.setProperties=Zg.prototype.C;Zg.prototype.unset=Zg.prototype.R;Zg.prototype.changed=Zg.prototype.u;Zg.prototype.dispatchEvent=Zg.prototype.b;Zg.prototype.getRevision=Zg.prototype.L;Zg.prototype.on=Zg.prototype.I;Zg.prototype.once=Zg.prototype.M;Zg.prototype.un=Zg.prototype.K;Zg.prototype.unByKey=Zg.prototype.N;No.prototype.getMap=No.prototype.i;No.prototype.setMap=No.prototype.setMap;No.prototype.setTarget=No.prototype.c;
No.prototype.get=No.prototype.get;No.prototype.getKeys=No.prototype.O;No.prototype.getProperties=No.prototype.P;No.prototype.set=No.prototype.set;No.prototype.setProperties=No.prototype.C;No.prototype.unset=No.prototype.R;No.prototype.changed=No.prototype.u;No.prototype.dispatchEvent=No.prototype.b;No.prototype.getRevision=No.prototype.L;No.prototype.on=No.prototype.I;No.prototype.once=No.prototype.M;No.prototype.un=No.prototype.K;No.prototype.unByKey=No.prototype.N;Qg.prototype.getMap=Qg.prototype.i;
Qg.prototype.setMap=Qg.prototype.setMap;Qg.prototype.setTarget=Qg.prototype.c;Qg.prototype.get=Qg.prototype.get;Qg.prototype.getKeys=Qg.prototype.O;Qg.prototype.getProperties=Qg.prototype.P;Qg.prototype.set=Qg.prototype.set;Qg.prototype.setProperties=Qg.prototype.C;Qg.prototype.unset=Qg.prototype.R;Qg.prototype.changed=Qg.prototype.u;Qg.prototype.dispatchEvent=Qg.prototype.b;Qg.prototype.getRevision=Qg.prototype.L;Qg.prototype.on=Qg.prototype.I;Qg.prototype.once=Qg.prototype.M;Qg.prototype.un=Qg.prototype.K;
Qg.prototype.unByKey=Qg.prototype.N;So.prototype.getMap=So.prototype.i;So.prototype.setMap=So.prototype.setMap;So.prototype.setTarget=So.prototype.c;So.prototype.get=So.prototype.get;So.prototype.getKeys=So.prototype.O;So.prototype.getProperties=So.prototype.P;So.prototype.set=So.prototype.set;So.prototype.setProperties=So.prototype.C;So.prototype.unset=So.prototype.R;So.prototype.changed=So.prototype.u;So.prototype.dispatchEvent=So.prototype.b;So.prototype.getRevision=So.prototype.L;
So.prototype.on=So.prototype.I;So.prototype.once=So.prototype.M;So.prototype.un=So.prototype.K;So.prototype.unByKey=So.prototype.N;Sg.prototype.getMap=Sg.prototype.i;Sg.prototype.setMap=Sg.prototype.setMap;Sg.prototype.setTarget=Sg.prototype.c;Sg.prototype.get=Sg.prototype.get;Sg.prototype.getKeys=Sg.prototype.O;Sg.prototype.getProperties=Sg.prototype.P;Sg.prototype.set=Sg.prototype.set;Sg.prototype.setProperties=Sg.prototype.C;Sg.prototype.unset=Sg.prototype.R;Sg.prototype.changed=Sg.prototype.u;
Sg.prototype.dispatchEvent=Sg.prototype.b;Sg.prototype.getRevision=Sg.prototype.L;Sg.prototype.on=Sg.prototype.I;Sg.prototype.once=Sg.prototype.M;Sg.prototype.un=Sg.prototype.K;Sg.prototype.unByKey=Sg.prototype.N;Wo.prototype.getMap=Wo.prototype.i;Wo.prototype.setMap=Wo.prototype.setMap;Wo.prototype.setTarget=Wo.prototype.c;Wo.prototype.get=Wo.prototype.get;Wo.prototype.getKeys=Wo.prototype.O;Wo.prototype.getProperties=Wo.prototype.P;Wo.prototype.set=Wo.prototype.set;Wo.prototype.setProperties=Wo.prototype.C;
Wo.prototype.unset=Wo.prototype.R;Wo.prototype.changed=Wo.prototype.u;Wo.prototype.dispatchEvent=Wo.prototype.b;Wo.prototype.getRevision=Wo.prototype.L;Wo.prototype.on=Wo.prototype.I;Wo.prototype.once=Wo.prototype.M;Wo.prototype.un=Wo.prototype.K;Wo.prototype.unByKey=Wo.prototype.N;bp.prototype.getMap=bp.prototype.i;bp.prototype.setMap=bp.prototype.setMap;bp.prototype.setTarget=bp.prototype.c;bp.prototype.get=bp.prototype.get;bp.prototype.getKeys=bp.prototype.O;bp.prototype.getProperties=bp.prototype.P;
bp.prototype.set=bp.prototype.set;bp.prototype.setProperties=bp.prototype.C;bp.prototype.unset=bp.prototype.R;bp.prototype.changed=bp.prototype.u;bp.prototype.dispatchEvent=bp.prototype.b;bp.prototype.getRevision=bp.prototype.L;bp.prototype.on=bp.prototype.I;bp.prototype.once=bp.prototype.M;bp.prototype.un=bp.prototype.K;bp.prototype.unByKey=bp.prototype.N;
  return OPENLAYERS.ol;
}));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],31:[function(require,module,exports){
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
},{"mgrs":98}],32:[function(require,module,exports){
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

},{"./deriveConstants":63,"./extend":64,"./parseCode":68,"./projections":70}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) < HALF_PI) ? x : (x - (sign(x) * Math.PI));
};
},{"./sign":51}],35:[function(require,module,exports){
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
},{"./sign":51}],36:[function(require,module,exports){
module.exports = function(x) {
  if (Math.abs(x) > 1) {
    x = (x > 1) ? 1 : -1;
  }
  return Math.asin(x);
};
},{}],37:[function(require,module,exports){
module.exports = function(x) {
  return (1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x)));
};
},{}],38:[function(require,module,exports){
module.exports = function(x) {
  return (0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x)));
};
},{}],39:[function(require,module,exports){
module.exports = function(x) {
  return (0.05859375 * x * x * (1 + 0.75 * x));
};
},{}],40:[function(require,module,exports){
module.exports = function(x) {
  return (x * x * x * (35 / 3072));
};
},{}],41:[function(require,module,exports){
module.exports = function(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
};
},{}],42:[function(require,module,exports){
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
},{}],43:[function(require,module,exports){
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
},{}],44:[function(require,module,exports){
module.exports = function(e0, e1, e2, e3, phi) {
  return (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi));
};
},{}],45:[function(require,module,exports){
module.exports = function(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / (Math.sqrt(1 - con * con));
};
},{}],46:[function(require,module,exports){
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
},{}],47:[function(require,module,exports){
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
},{}],48:[function(require,module,exports){
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
},{"./pj_mlfn":49}],49:[function(require,module,exports){
module.exports = function(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4]))));
};
},{}],50:[function(require,module,exports){
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
},{}],51:[function(require,module,exports){
module.exports = function(x) {
  return x<0 ? -1 : 1;
};
},{}],52:[function(require,module,exports){
module.exports = function(esinp, exp) {
  return (Math.pow((1 - esinp) / (1 + esinp), exp));
};
},{}],53:[function(require,module,exports){
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
},{}],54:[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow(((1 - con) / (1 + con)), com);
  return (Math.tan(0.5 * (HALF_PI - phi)) / con);
};
},{}],55:[function(require,module,exports){
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
},{}],56:[function(require,module,exports){
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
},{}],57:[function(require,module,exports){
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
},{}],58:[function(require,module,exports){
exports.ft = {to_meter: 0.3048};
exports['us-ft'] = {to_meter: 1200 / 3937};

},{}],59:[function(require,module,exports){
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
},{"./Proj":32,"./transform":96}],60:[function(require,module,exports){
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

},{}],61:[function(require,module,exports){
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


},{}],62:[function(require,module,exports){
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

},{"./global":65,"./projString":69,"./wkt":97}],63:[function(require,module,exports){
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

},{"./constants/Datum":55,"./constants/Ellipsoid":56,"./datum":60,"./extend":64}],64:[function(require,module,exports){
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

},{}],65:[function(require,module,exports){
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

},{}],66:[function(require,module,exports){
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
},{"./projections/aea":71,"./projections/aeqd":72,"./projections/cass":73,"./projections/cea":74,"./projections/eqc":75,"./projections/eqdc":76,"./projections/gnom":78,"./projections/krovak":79,"./projections/laea":80,"./projections/lcc":81,"./projections/mill":84,"./projections/moll":85,"./projections/nzmg":86,"./projections/omerc":87,"./projections/poly":88,"./projections/sinu":89,"./projections/somerc":90,"./projections/stere":91,"./projections/sterea":92,"./projections/tmerc":93,"./projections/utm":94,"./projections/vandg":95}],67:[function(require,module,exports){
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
},{"../package.json":99,"./Point":31,"./Proj":32,"./common/toPoint":53,"./core":59,"./defs":62,"./includedProjections":66,"./transform":96,"mgrs":98}],68:[function(require,module,exports){
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
},{"./defs":62,"./projString":69,"./wkt":97}],69:[function(require,module,exports){
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

},{"./constants/PrimeMeridian":57,"./constants/units":58}],70:[function(require,module,exports){
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

},{"./projections/longlat":82,"./projections/merc":83}],71:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/asinz":36,"../common/msfnz":45,"../common/qsfnz":50}],72:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/asinz":36,"../common/e0fn":37,"../common/e1fn":38,"../common/e2fn":39,"../common/e3fn":40,"../common/gN":41,"../common/imlfn":42,"../common/mlfn":44}],73:[function(require,module,exports){
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
},{"../common/adjust_lat":34,"../common/adjust_lon":35,"../common/e0fn":37,"../common/e1fn":38,"../common/e2fn":39,"../common/e3fn":40,"../common/gN":41,"../common/imlfn":42,"../common/mlfn":44}],74:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/iqsfnz":43,"../common/msfnz":45,"../common/qsfnz":50}],75:[function(require,module,exports){
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

},{"../common/adjust_lat":34,"../common/adjust_lon":35}],76:[function(require,module,exports){
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

},{"../common/adjust_lat":34,"../common/adjust_lon":35,"../common/e0fn":37,"../common/e1fn":38,"../common/e2fn":39,"../common/e3fn":40,"../common/imlfn":42,"../common/mlfn":44,"../common/msfnz":45}],77:[function(require,module,exports){
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

},{"../common/srat":52}],78:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/asinz":36}],79:[function(require,module,exports){
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

},{"../common/adjust_lon":35}],80:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/qsfnz":50}],81:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/msfnz":45,"../common/phi2z":46,"../common/sign":51,"../common/tsfnz":54}],82:[function(require,module,exports){
exports.init = function() {
  //no-op for longlat
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["longlat", "identity"];

},{}],83:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/msfnz":45,"../common/phi2z":46,"../common/tsfnz":54}],84:[function(require,module,exports){
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

},{"../common/adjust_lon":35}],85:[function(require,module,exports){
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

},{"../common/adjust_lon":35}],86:[function(require,module,exports){
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
},{}],87:[function(require,module,exports){
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
},{"../common/adjust_lon":35,"../common/phi2z":46,"../common/tsfnz":54}],88:[function(require,module,exports){
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
},{"../common/adjust_lat":34,"../common/adjust_lon":35,"../common/e0fn":37,"../common/e1fn":38,"../common/e2fn":39,"../common/e3fn":40,"../common/gN":41,"../common/mlfn":44}],89:[function(require,module,exports){
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
},{"../common/adjust_lat":34,"../common/adjust_lon":35,"../common/asinz":36,"../common/pj_enfn":47,"../common/pj_inv_mlfn":48,"../common/pj_mlfn":49}],90:[function(require,module,exports){
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

},{}],91:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/msfnz":45,"../common/phi2z":46,"../common/sign":51,"../common/tsfnz":54}],92:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"./gauss":77}],93:[function(require,module,exports){
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

},{"../common/adjust_lon":35,"../common/asinz":36,"../common/e0fn":37,"../common/e1fn":38,"../common/e2fn":39,"../common/e3fn":40,"../common/mlfn":44,"../common/sign":51}],94:[function(require,module,exports){
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

},{"./tmerc":93}],95:[function(require,module,exports){
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
},{"../common/adjust_lon":35,"../common/asinz":36}],96:[function(require,module,exports){
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
},{"./Proj":32,"./adjust_axis":33,"./common/toPoint":53,"./datum_transform":61}],97:[function(require,module,exports){
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

},{"./extend":64}],98:[function(require,module,exports){



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

},{}],99:[function(require,module,exports){
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
  "_resolved": "https://registry.npmjs.org/proj4/-/proj4-2.3.12.tgz"
}

},{}],100:[function(require,module,exports){
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

},{"performance-now":101}],101:[function(require,module,exports){
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

},{"_process":8}]},{},[1])(1)
});
//# sourceMappingURL=map.js.map
