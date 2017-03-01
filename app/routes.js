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

    // Map - Long term flood risk
    app.get('/long-term-flood-risk/map', function (req, res) {
      var pageName = 'Long term flood risk'
      var national = req.query.address > 0 ? false : true;
      res.render('long-term-flood-risk/map', { 'page_name': pageName, 'national': national })
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

    // Example station: Normal range
    app.get('/station/5034', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Flooding is possible
    app.get('/station/5034-flooding-possible', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-flooding-possible', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Below normal range
    app.get('/station/5034-below-normal-range', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-below-normal-range', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: No forecast data
    app.get('/station/5034-no-forecast-data', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-no-forecast-data', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: No forecast data
    app.get('/station/5034-no-forecast-data', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-no-forecast-data', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: No data
    app.get('/station/5034-no-data', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-no-data', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
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
    app.get('/stations', function (req, res) {
      var pageName = 'Measuring stations (v6)'
      res.render('stations', { 'page_name': pageName })
    })

    //
    // Holding pages
    //

    // Graph
    app.get('/graphs', function (req, res) {
      var pageName = 'Graphs'
      res.render('graphs', { 'page_name': pageName })
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


