module.exports = {
  bind: function (app, assetPath) {
    app.get('/', function (req, res) {
      res.render('index', { 'asset_path': assetPath })
    })

    //
    // Flood map for planning 
    //
    
    // Start - flood map for planning
    app.get('/flood-map-for-planning', function (req, res) {
      var pageName = 'Flood map for planning'
      res.render('flood-map-for-planning/start', { 'page_name': pageName })
    })

    // Confirm location for a point - flood map for planning
    app.get('/flood-map-for-planning/confirm-location-point', function (req, res) {
      var pageName = 'Flood map for planning'
      res.render('flood-map-for-planning/confirm-location-point', { 'page_name': pageName })
    })

    // Confirm location for a boundary - flood map for planning
    app.get('/flood-map-for-planning/confirm-location-boundary', function (req, res) {
      var pageName = 'Flood map for planning'
      res.render('flood-map-for-planning/confirm-location-boundary', { 'page_name': pageName })
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

    // Measuring and forecasting river levels
    app.get('/river-levels-measuring-forecasting', function (req, res) {
      var pageName = 'Flood Information Service'
      res.render('river-levels-measuring-forecasting', { 'page_name': pageName })
    })

    //
    // Forecast line only
    //

    // Example station: Forecast with warning
    app.get('/station/5034-forecast-warning', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-probabilistic-a.json'
      res.render('station/5034-forecast-warning', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: Forecast with warning and highest
    app.get('/station/5034-forecast-warning-highest', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-probabilistic-a2.json'
      res.render('station/5034-forecast-warning-highest', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
      // Example station: Forecast with alert
      app.get('/station/5034-forecast-alert', function (req, res) {
        var section = 'station'
        var sectionName = 'Station'
        var pageName = 'Irk at Collyhurst Weir'
        var levelData = '/public/javascripts/json/shrewsbury-probabilistic-a.json'
        res.render('station/5034-forecast-alert', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
      })    
    // Example station: Forecast with low-laying land flooding possible
    app.get('/station/5034-forecast-low-lying-flooding-possible', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-probabilistic-b.json'
      res.render('station/5034-forecast-low-lying-flooding-possible', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: Forecast normal
    app.get('/station/5034-forecast-normal', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-probabilistic-c.json'
      res.render('station/5034-forecast-normal', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: No forecast
    app.get('/station/5034-no-forecast', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-no-forecast.json'
      res.render('station/5034-no-forecast', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: Closed station
    app.get('/station/5034-closed-station', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-no-forecast.json'
      res.render('station/5034-closed-station', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: Suspended station
    app.get('/station/5034-suspended-station', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-no-forecast.json'
      res.render('station/5034-suspended-station', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: Observed data error
    app.get('/station/5034-observed-data-error', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-no-forecast.json'
      res.render('station/5034-observed-data-error', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    // Example station: Forecast data error
    app.get('/station/5034-forecast-data-error', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      var levelData = '/public/javascripts/json/shrewsbury-probabilistic-c2.json'
      res.render('station/5034-forecast-data-error', { 'section': section, 'section_name': sectionName, 'page_name': pageName, 'level_data': levelData })
    })
    //
    // End
    //

    // Forecast error band and buffer

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

    //
    // SMS
    //

    app.get('/sms-auto-opt-in', function (req, res) {
      var pageName = 'Flood Information Service'
      res.render('sms-auto-opt-in', { 'page_name': pageName })
    })

  }
}


