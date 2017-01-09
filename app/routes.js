module.exports = {
  bind: function (app, assetPath) {
    app.get('/', function (req, res) {
      res.render('index', { 'asset_path': assetPath })
    })

    // Gauging station
    app.get('/stations', function (req, res) {
      var pageName = 'Gauging stations'
      res.render('stations', { 'page_name': pageName })
    })

    // Gauging station
    app.get('/river-levels', function (req, res) {
      var pageName = 'River levels'
      res.render('river-levels', { 'page_name': pageName })
    })

    // Example station: Normal range
    app.get('/station/5090', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Greta at Low Briery'
      res.render('station/5090', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Flooding is possible
    app.get('/station/5090-flooding-possible', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Greta at Low Briery'
      res.render('station/5090-flooding-possible', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Below normal range
    app.get('/station/5090-below-normal-range', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Greta at Low Briery'
      res.render('station/5090-below-normal-range', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: No forecast data available
    app.get('/station/5090-no-forecast-data', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Greta at Low Briery'
      res.render('station/5090-no-forecast-data', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Tidal
    app.get('/station/5205', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irish Sea at Silloth Docks'
      res.render('station/5205', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

  }
}


