
/*
 * GET home page.
 */

exports.renderIndex = function(scripts, urls) {
	return function(req, res){
		res.render('index', { title: 'imjs', js: scripts, image_urls: urls });
	};
};