var cheerio = require('cheerio');
var request = require('request');

var source = function () {
    var self = this;

    var keywords = ['according to', 'reported'];
    var knownSources = ['economist', 'bbc', 'bloomberg', 'npr', 'pbs', 'wsj', 'abc', 'nbc', 'cbs', 'cnn', 'usatoday', 'blaze', 'nytimes',
        'washingtonpost', 'msnbc', 'guardian', 'newyorker', 'politico', 'fox', 'france24', 'independent'];

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
                var results = [];
                if ($(this).children('em').length > 0) {
                    // Sometimes sources are wrapped in <em>
                    $(this).children('em').children('a')
                        .filter(function (i, el) {
                        // Only grab links that are from known sources
                        return knownSources.filter(function (src) {
                                return $(el).attr('href').toLowerCase().includes(src);
                            }).length > 0;
                    })
                        .map(function (i, el) {
                            results.push(mapToRedditFormat($(el)));
                        });
                }

                $(this).children('a')
                    .filter(function (i, el) {
                        // Only grab links that are from known sources
                        return knownSources.filter(function (src) {
                                return $(el).attr('href').toLowerCase().includes(src);
                            }).length > 0;
                    })
                    .map(function (i, el) {
                       results.push(mapToRedditFormat($(this)));
                    });
                return results;
            });

        cb(null, sources);
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