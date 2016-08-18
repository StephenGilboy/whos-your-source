var Snoocore = require('snoocore');
var source = require('./sources');

var reddit = new Snoocore({
	userAgent: '/u/whos-your-source whosyoursource@1.0.0',
	throttle: 3000,
	oauth: {
		type: 'explicit',
		duration: 'permanent',
		key: process.env.REDDIT_KEY,
		secret: process.env.REDDIT_SECRET,
		redirectUri: 'http://localhost:3000',
		scope: []
	}
});


// Get information about a slice of a listing
function printSlice(slice) {
	slice.stickied.forEach(function(item, i) {
		console.log('**STICKY**', item.data.title.substring(0, 20) + '...');
	});

	slice.children.forEach(function(child, i) {
		if (child.data.url) {
			source.findPossibleSource(child.data.url, function (err, sources) {
				if (sources.length) {
					console.log(child.data.url + ' Source is : ' + sources[0]);
				}
			});
		}
	});
}

reddit('/r/$subreddit/hot').listing({
	$subreddit: 'worldnews',
	limit: 10
}).then(function(slice) {
	printSlice(slice);
	return slice.next();
}).then(function(slice) {
	printSlice(slice);
	return slice.next();
}).done(printSlice);

/*
app.post('/link', function (req, res, next) {
	var link = req.body.link;
	if (!link) {
		res.status(404).end();
	} else {
		source.findPossibleSource(link, function (err, sources) {
			if (err) {
				next(err);
			} else {
				if (sources.length) {
					res.send(sources[0]);
				} else {
					res.send('No Sources');
				}
			}
		});
	}
});
*/