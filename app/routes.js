module.exports = {
  bind: function (app, assetPath) {
    app.get('/', function (req, res) {
      res.render('index', { 'asset_path': assetPath })
    })

    //
    // Long term flood risk 
    //
    
    // Start - Long term flood risk
    app.get('/long-term-flood-risk', function (req, res) {
      var pageName = 'Long term flood risk'
      res.render('long-term-flood-risk', { 'page_name': pageName })
    })

    // Search - Long term flood risk
    app.get('/long-term-flood-risk/search', function (req, res) {
      var pageName = 'Long term flood risk'
      res.render('long-term-flood-risk/search', { 'page_name': pageName })
    })

    // Risk - Long term flood risk
    app.get('/long-term-flood-risk/risk', function (req, res) {
      var pageName = 'Long term flood risk'
      res.render('long-term-flood-risk/risk', { 'page_name': pageName })
    })

    // Detail - Long term flood risk
    app.get('/long-term-flood-risk/risk-detail', function (req, res) {
      var pageName = 'Long term flood risk'
      res.render('long-term-flood-risk/risk-detail', { 'page_name': pageName })
    })

    // Map - Long term flood risk
    app.get('/long-term-flood-risk/map', function (req, res) {
      var pageName = 'Long term flood risk'
      var national = req.query.address > 0 ? false : true;
      res.render('long-term-flood-risk/map', { 'page_name': pageName, 'national': national })
    })

    // Map - Long term flood risk
    app.get('/long-term-flood-risk/flood-risk-types', function (req, res) {
      var pageName = 'Learn more about the ways we describe flood risk'
      var national = req.query.address > 0 ? false : true;
      res.render('long-term-flood-risk/flood-risk-types', { 'page_name': pageName })
    })

    //
    // Flood information service 
    //   

    // River levels
    app.get('/river-levels', function (req, res) {
      var pageName = 'River levels'
      res.render('river-levels', { 'page_name': pageName })
    })

    // Terms and conditions (Private Beta)
    app.get('/terms-conditions', function (req, res) {
      var pageName = 'Private Beta terms and conditions'
      res.render('terms-conditions', { 'page_name': pageName })
    })

    // Version 3
    app.get('/stations-v3', function (req, res) {
      var pageName = 'Measuring stations (v3)'
      res.render('stations-v3', { 'page_name': pageName })
    })

    // Version 4
    app.get('/stations-v4', function (req, res) {
      var pageName = 'Measuring stations (v4)'
      res.render('stations-v4', { 'page_name': pageName })
    })

    // Version 5
    app.get('/stations-v5', function (req, res) {
      var pageName = 'Measuring stations (v5)'
      res.render('stations-v5', { 'page_name': pageName })
    })

    // Verson 6
    app.get('/stations-v6', function (req, res) {
      var pageName = 'Measuring stations (v6)'
      res.render('stations-v6', { 'page_name': pageName })
    })

    // Verson 8
    app.get('/stations-v8', function (req, res) {
      var pageName = 'Measuring stations (v8)'
      res.render('stations-v8', { 'page_name': pageName })
    })

    // Verson 8
    app.get('/stations-v9', function (req, res) {
      var pageName = 'Measuring stations (v9)'
      res.render('stations-v9', { 'page_name': pageName })
    })

    // Example station: Forecast line only
    app.get('/station/5034-forecast', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-forecast', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Fixed error band above the red line
    app.get('/station/5034-fixed-error-band', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-fixed-error-band', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Error buffer above the red line
    app.get('/station/5034-error-buffer', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-error-buffer', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    //
    // Paterns pages
    //

    // Map: Warnings
    app.get('/map-warnings', function (req, res) {
      var pageName = 'Maps: warnings'
      res.render('maps/warnings', { 'page_name': pageName })
    })

    // Map: Locator
    app.get('/map-locator', function (req, res) {
      var pageName = 'Maps: locator'
      res.render('maps/locator', { 'page_name': pageName })
    })

    //
    // Holding pages
    //
    
    // Long term flood risk - Service unavailable
    app.get('/holding-pages/long-term-flood-risk/service-unavailable', function (req, res) {
      var pageName = 'Long term flood risk - GOV.UK'
      res.render('holding-pages/long-term-flood-risk/service-unavailable', { 'page_name': pageName })
    })
    
    // Long term flood risk - Service maintenance
    app.get('/holding-pages/long-term-flood-risk/service-maintenance', function (req, res) {
      var pageName = 'Long term flood risk - GOV.UK'
      res.render('holding-pages/long-term-flood-risk/service-maintenance', { 'page_name': pageName })
    })

    //
    // Journey
    //

    // Step 1
    app.get('/journey/step-1', function (req, res) {
      var pageName = 'Flood Information Service'
      res.render('journey/step-1', { 'page_name': pageName })
    })

    // Step 1b
    app.get('/journey/step-1b', function (req, res) {
      var pageName = 'Flood Information Service'
      res.render('journey/step-1b', { 'page_name': pageName })
    })

    // Step 2
    app.get('/journey/step-2', function (req, res) {
      var pageName = 'Flood Information Service'
      res.render('journey/step-2', { 'page_name': pageName })
    })

    // Step 3
    app.get('/journey/step-3', function (req, res) {
      var pageName = 'Flood Information Service'
      res.render('journey/step-3', { 'page_name': pageName })
    })

    // Step 4
    app.get('/journey/step-4', function (req, res) {
      var pageName = 'Flood Information Service'
      var location = req.param('t')
      res.render('journey/step-4', { 'page_name': pageName, 'location': location })
    })

  }
}


