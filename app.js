
/**
 * Module dependencies.
 */

var express = require('express')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')
  , app = module.exports = express()
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// app.get('/', routes.index);
app.get('/users', user.list);
scrapeImgur();


function scrapeImgur() {
	console.log('Scraping images...');
	var urls = [];
	// Here we tell the request to fetch data from imgur and callback the results
	request( {uri: 'http://imgur.com'}, function(err, response, body) {
		var self = this;
		// Save the results of the request in an array
		self.items = new Array();
		// Check that the response came through
		if (err && response.statusCode !== 200) {
			console.log('Request error.');
		}
		// Send the body param as the HTML code we parse in jsdom.
		// Also, tell jsdom to attach jQuery in the scripts (we load jQuery
		// directly from the web)
		jsdom.env({
			html: body,
			scripts: ['http://code.jquery.com/jquery-1.6.min.js']
		}, function (err, window) {
			// Use jQuery as a regular HTML page
			var $ = window.jQuery;
			var $body = $('body');
			var $posts = $body.find('.post');
			$posts.each(function(i, post) {
				var $a = $(post).children('a');
				$a.each(function(a) {
					var $img = $a.find('img');
					$img.each(function(img) {
						var src = $img.attr('src');
						urls.push(src);
					});
				});
			});
			// console.log(urls.join(' '));
			app.get('/', routes.renderIndex(['/javascripts/im.js'],urls));
			console.log('Images loaded!');
		});
	});
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port') + "...");
});
