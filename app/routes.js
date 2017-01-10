module.exports = {
  bind: function (app, assetPath) {
    app.get('/', function (req, res) {
      res.render('index', { 'asset_path': assetPath })
    })

    // Gauging station
    app.get('/stations', function (req, res) {
      var pageName = 'Measuring stations'
      res.render('stations', { 'page_name': pageName })
    })

    // Gauging station
    app.get('/river-levels', function (req, res) {
      var pageName = 'River levels'
      res.render('river-levels', { 'page_name': pageName })
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

    // Example station: Flooding is possible, option B
    app.get('/station/5034-flooding-possible-b', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irk at Collyhurst Weir'
      res.render('station/5034-flooding-possible-b', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Tidal normal range
    app.get('/station/5205', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = ''
      res.render('station/5205', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Tidal flooding possible
    app.get('/station/5205-flooding-possible', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irish Sea at Silloth Docks'
      res.render('station/5205-flooding-possible', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

    // Example station: Tidal flooding possible, option B
    app.get('/station/5205-flooding-possible-b', function (req, res) {
      var section = 'station'
      var sectionName = 'Station'
      var pageName = 'Irish Sea at Silloth Docks'
      res.render('station/5205-flooding-possible-b', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

  }
}


