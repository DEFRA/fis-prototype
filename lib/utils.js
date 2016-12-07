var basicAuth = require('basic-auth')

exports.basicAuth = function(username, password) {
	return function(req, res, next) {

		if (!username || !password) {
			console.log('Username or password is not set.');
			return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://github.com/alphagov/govuk_prototype_kit/blob/master/docs/deploying.md#3-set-a-username-and-password">See guidance for setting these</a>.</p>');
		}
		
		var user = basicAuth(req);

		if (!user || user.name !== username || user.pass !== password) {
			res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
			return res.sendStatus(401);
		}

		next();
    
	};
};