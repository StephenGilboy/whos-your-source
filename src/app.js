var express = require('express');
var bodyParser = require('body-parser');
var source = require('./sources');
var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res, next) {
	res.send('Still looking.');
});

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

app.listen(3000, function () {
	console.log('Listening for leads');
});
