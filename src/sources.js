var cheerio = require('cheerio');
var request = require('request');

var source = function () {
    var self = this;

    var keywords = ['according to', 'reported'];
    var knownSources = ['economist', 'bbc', 'npr', 'pbs', 'wsj', 'abc', 'nbc', 'cbs', 'cnn', 'usatoday', 'blaze', 'nytimes',
        'washingtonpost', 'msnbc', 'guardian', 'newyorker', 'politico', 'fox'];

    var mapToRedditFormat = function (atag) {
        return '[' + atag.text() + '](' + atag.attr('href') + ')';
    };

    var checkATags = function ($, cb) {
        var sources = $('a').filter(function (i, el) {
            var txt = $(this).text().toLowerCase();
            return keywords.filter(function (k) {
                return txt.includes(k);
            }).length > 0;
        }).filter(function (i, el) {
            // Only grab links that are from known sources
            return knownSources.filter(function (src) {
                    return $(el).attr('href').toLowerCase().includes(src);
                }).length > 0;
        }).map(function (i, el) {
            return mapToRedditFormat($(this));
        });

        cb(null, sources);
    };

    var checkPTags = function ($, cb) {
        var sources = $('p')
            .filter(function (i, el) {
                // Look for text containing keywords
                var txt = $(el).text().toLowerCase();
                return keywords.filter(function (k) {
                        return txt.includes(k);
                    }).length > 0;
            }).map(function (i, el) {
                return $(this).children('a')
                    .filter(function (i, el) {
                        // Only grab links that are from known sources
                        return knownSources.filter(function (src) {
                                return $(el).attr('href').toLowerCase().includes(src);
                            }).length > 0;
                    })
                    .map(function (i, el) {
                        return mapToRedditFormat($(this));
                    });
            });

        // Flatten our results into a single array
        var flat = [];
        for(var i = 0; i < sources.length; i++) {
            for(var x = 0; x < sources[i].length; x++) {
                flat.push(sources[i][x]);
            }
        }

        cb(null, flat);
    };

    self.findPossibleSource = function (link, callback) {
        request(link, function (err, resp, body) {
            if (err) {
                callback(err);
            } else {
                // Load HTML
                var $ = cheerio.load(body);

                checkATags($, function (err, sources) {
                    if (err) {
                        callback(err);
                    } else {
                        if (sources.length) {
                            callback(null, sources);
                        } else {
                            checkPTags($, callback);
                        }
                    }
                });
            }
        });
    };

    return self;
};

module.exports = source();