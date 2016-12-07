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

    // Example station: Greta at Low Briery
    app.get('/stations/5090', function (req, res) {
      var section = 'stations'
      var sectionName = 'Stations'
      var pageName = 'Greta at Low Briery'
      res.render('stations/5090', { 'section': section, 'section_name': sectionName, 'page_name': pageName })
    })

  }
}
