"use strict";
/**
 * configuration for phantomjs server
 * @type type
 */
var pubSnoop = {
    server: require('webserver').create(),
    args: require('system').args,
    fs: require('fs'),
    spawn: require("child_process").spawn,
    execFile: require("child_process").execFile,
    webserver: '/var/www/html'
            // url : require('url'),
};
var port = 8001;
//Api's for extraction information and represtentation
var EXCEPTION_LIST = {
    NOT_VALID_BOUND: "Valid instance of bound is required.",
    NOT_VALID_ADVERTISEMENT: "Valid instance of Advertisement is required.",
    VIEWPORT_UNDEFINED: "Need to define view port"
};
/**
 * 
 * @param {type} leftX
 * @param {type} topY
 * @param {type} rightX
 * @param {type} bottomY
 * @returns {Bound}
 */
function Bound(leftX, topY, rightX, bottomY) {
    this.leftX = leftX;
    this.topY = topY;
    this.rightX = rightX;
    this.bottomY = bottomY;
    var height = Math.abs(bottomY - topY);
    var width = Math.abs(rightX - leftX);
    this.getHeight = function () {
        return height;
    };
    this.getWidth = function () {
        return width;
    };
}
/**
 * 
 * @type type
 */
Bound.prototype = {
    getArea: function () {
        return this.getHeight() * this.getWidth();
    },
    isOverlaped: function (bound) {
        if (!(bound instanceof Bound))
            throw EXCEPTION_LIST.NOT_VALID_BOUND;
        return (this.getOverlappedArea(bound) > 0);
    },
    getOverlappedArea: function (bound) {
        if (!(bound instanceof Bound))
            throw EXCEPTION_LIST.NOT_VALID_BOUND;
        var x_overlap = Math.max(0, Math.min(this.rightX, bound.rightX) - Math.max(this.leftX, bound.leftX));
        var y_overlap = Math.max(0, Math.min(this.bottomY, bound.bottomY) - Math.max(this.topY, bound.topY));
        return x_overlap * y_overlap;
    },
    getOverlappedBound: function (bound) {
        if (!(bound instanceof Bound))
            throw EXCEPTION_LIST.NOT_VALID_BOUND;
        //write code here
    },
    toString: function () {
        return "{\"x\":\"" + this.leftX + "\",\"y\":\"" + this.topY + "\",\"h\":\"" + this.getHeight() + "\",\"w\":\"" + this.getWidth() + "\"}";
    }
};
/**
 * 
 * @param {type} bound
 * @returns {Advertisement}
 */
function Advertisement(bound) {
    if (!(bound instanceof Bound))
        throw EXCEPTION_LIST.NOT_VALID_BOUND;
    this.bound = bound;
    this._id = this.bound.topY + "_" + this.bound.rightX + "_" + this.bound.bottomY + "_" + this.bound.leftX;
    this._overlapped = new Array();
}
/**
 * 
 * @type type
 */
Advertisement.prototype = {
    addOverlappedAdvertisement: function (advertisement) {
        if (!(advertisement instanceof Advertisement))
            throw EXCEPTION_LIST.NOT_VALID_ADVERTISEMENT;
        this._overlapped.push(advertisement);
    },
    getArea: function () {
        return this.bound.getArea();
    },
    getOverlappedArea: function (advertisement) {
        if (!(advertisement instanceof Advertisement))
            throw EXCEPTION_LIST.NOT_VALID_ADVERTISEMENT;
        return this.bound.getOverlappedArea(advertisement.bound);
    },
    getTotalOverlappedArea: function () {
        var area = 0;
        for (var i = 0; i < this._overlapped.length; i++) {
            area += this.getOverlappedArea(this._overlapped[i]);
        }
        return area;
    },
    isOnViewport: function () {
        return this.viewable = 100 ? true : false;
    },
    setViewable: function (score) {
        this.viewable = score;
    },
    toString: function () {
        return "{\"id\":\"" + this._id + "\",\"bound\":" + this.bound.toString() + ",\"viewable\":\"" + this.viewable + "\",   \"overlappedAds\":[" + this._overlapped.toString() + "]}";
    }
};
/**
 * 
 * @returns {Page}
 */
function Page() {
    this.advertisements = new Array();
    this.topics = new Array();
    this.overlapDetected = false;
    this.malwareDetected =false;
    this.category="NA";
}
/**
 * 
 * @type type
 */
Page.prototype = {
    addAdvertisement: function (advertisement) {
        if (!(advertisement instanceof Advertisement))
            throw EXCEPTION_LIST.NOT_VALID_ADVERTISEMENT;
        //check is advertisment having visible dimantions or not
        if(advertisement.bound.getHeight()<10||advertisement.bound.getWidth()<10)
            return;
        //first check is overlapping is exist with existing advertisment
        this.checkAndMarkOverlap(advertisement);
        var height = advertisement.bound.getHeight();
        var width = advertisement.bound.getWidth();
        var deltas = {
            top: Math.min(1, (advertisement.bound.bottomY - this.viewport.topY) / height),
            bottom: Math.min(1, (this.viewport.bottomY - advertisement.bound.topY) / height),
            left: Math.min(1, (advertisement.bound.rightX - this.viewport.leftX) / width),
            right: Math.min(1, (this.viewport.rightX - advertisement.bound.leftX) / width)
        };
        var x1 = deltas.left * deltas.right;
        var y1 = deltas.top * deltas.bottom;
        if (x1 <= 0 || y1 <= 0 || isNaN(x1) || isNaN(y1)) {
            advertisement.setViewable(0);
        } else {
            advertisement.setViewable(Math.round(x1 * y1 * 10000) / 100);
        }
        //insert advertisement in the list
        this.advertisements.push(advertisement);
    },
    addSnapshotUrl: function (url) {
        this.snapShotUrl = url;
    },
    addUrl: function (url) {
        this.url = url;
    },
    checkAndMarkOverlap: function (advertisement) {
        if (!(advertisement instanceof Advertisement))
            throw EXCEPTION_LIST.NOT_VALID_ADVERTISEMENT;
        for (var i = 0; i < this.advertisements.length; i++) {
            if (this.advertisements[i].bound.isOverlaped(advertisement.bound)) {
                
                this.advertisements[i].addOverlappedAdvertisement(advertisement);
            }
        }
    },
    getAdvertisementViewablity: function () {
        if (this.viewport === undefined)
            throw EXCEPTION_LIST.VIEWPORT_UNDEFINED;
    },
    getClutteredScore: function () {
        if (this.viewport === undefined)
            throw EXCEPTION_LIST.VIEWPORT_UNDEFINED;
        var viewportArea = this.bound.getArea();
        for (var i = 0; i < this.advertisements.length; i++) {
            viewportArea -= (this.advertisements[i].getArea() - this.advertisements[i].getTotalOverlappedArea());
        }
        this.clutterd = Math.round((viewportArea / this.bound.getArea()) * 10000) / 100;
        return 100-this.clutterd;
    },
    getVisibilityScore: function () {
        var visibleCount =0;
        for(var i =0; i<this.advertisements;i++){
            if(this.advertisements[i].viewable>1){
                visibleCount++;
            }
        }
        return Math.round((visibleCount/this.advertisements)*10000)/100;
    },
    setAutoRefreshDetected: function (value) {
        this.autoRefreshDetected = value;
    },
    setBound: function (bound) {
        if (!(bound instanceof Bound))
            throw "valid instance of bound is required";
        this.bound = bound;
    },
    setCategory: function (value) {
        this.category = value;
    },
    setLanguage: function (lang) {
        this.lang = lang;
    },
    setMalwareDetected: function (value) {
        this.overlapDetected = value;
    },
    setOverlapDetected: function (value) {
        this.malwareDetected = value;
    },
    setTopics: function (topics) {
//        Array.prototype.push.apply(this.topics, topics);
        this.topics = topics;
    },
    setUserAgent: function (userAgent) {
        this.userAgent = userAgent === undefined ? 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36' : userAgent;
    },
    setViewport: function (bound) {
        if (!(bound instanceof Bound))
            throw "valid instance of bound is required";
        this.viewport = bound;
    },
    toString: function () {
        return "{\"ads\":[" + this.advertisements.toString()
                + "],\"page\":{ \"viewport\":" + this.viewport
                + ",\"bound\": " + this.bound + ",\"cluttered\" :\" " + this.getClutteredScore()
                + "\", \"topics\":" + JSON.stringify(this.topics)
                + ",\"overlapDetected\":\"" + this.overlapDetected +
                "\",\"category \":\"" + this.category +
                "\",\"malwareDetected \":\"" + this.malwareDetected +
                "\",\"visibilityScore \":\"" + this.getVisibilityScore()
                + "\",\"lang\":\"" + this.lang + "\", \"snapshotUrl\":\" " + this.snapShotUrl + "\",\"url\":\"" + this.url + "\", \"autoRefreshDetected\" :\"" + this.autoRefreshDetected + "\" }}";
    }
};
//snoop-server start

function Snooper(request, response) {
    try
    {
        var params = JSON.parse(request.post);
        if (params.status) {
            // for server health validation
            response.statusCode = 200;
            response.write("{'status':true}");
            response.close();
            return;
        }

        if (typeof params.url === 'undefined' || params.url.trim() == '') {
            throw new Error("Please provide valid url");
        }

        var page = new Page();
        page.addUrl(params.url);
        page.setUserAgent(params.userAgent);
        if (params.width === undefined)
            params.width = 1024;
        if (params.height === undefined)
            params.height = 768;
        page.setViewport(new Bound(0, 0, params.width, params.height));
        var webPage = new WebPage();
        webPage.onConsoleMessage = function (msg) {
            console.log(msg);
        };
        webPage.settings.localToRemoteUrlAccessEnabled = true;
        webPage.viewportSize = {width: params.width, height: params.height};
        webPage.open(params.url);
        webPage.onLoadFinished = function (status) {
            window.setTimeout(function () {

                page.setBound(new Bound(0, 0, webPage.evaluate(function () {
                    return document.body.offsetWidth
                }), webPage.evaluate(function () {
                    return document.body.offsetHeight
                })));

                var ads = webPage.evaluate(function () {
                    var ads = document.querySelectorAll("iframe[id*='ads']");
                    var adBounds = new Array();
                    for (var i = 0; i < ads.length; i++) {
                        var bnds = {
                            left: ads[i].getBoundingClientRect().left,
                            right: ads[i].getBoundingClientRect().right,
                            top: ads[i].getBoundingClientRect().top,
                            bottom: ads[i].getBoundingClientRect().bottom
                        };
                        adBounds.push(bnds);
                    }
                    return adBounds;
                });
                
                page.setAutoRefreshDetected(webPage.evaluate(function () {
                    return !document.querySelector("meta[http-equiv='refresh']") == undefined;
                }));
                page.setLanguage(webPage.evaluate(function () {
                    return document.getElementsByTagName("html")[0].getAttribute("lang");
                }));
                var topics;
//                webPage.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function () {
                topics = webPage.evaluate(function () {
                    var allText = "";
                    $('*').filter(function () {
                        return ($(this).text().length > 0) && ($(this).text().length < 100);
                    }).each(function () {
                        allText = allText + $(this).text();
                    });
                    allText = allText.replace(/(\r\n|\n|\r)/gm, " ");
                    allText = allText.toLowerCase().replace(/\b(?:the|it is|we all|an?|by|font|this|what|more|to|you|[mh]e|she|they|we|and|your|or|string|return|value|length|about|with|for|get|up|how|from|user|home|search|read})\b/ig, '');
                    var cleanString = allText.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""),
                            words = cleanString.split(' '),
                            frequencies = {},
                            word, frequency, i;
                    for (i = 0; i < words.length; i++) {
                        word = words[i].trim();
                        if (word) {
                            if (word.length < 4 || word.length > 10) {
                                continue;
                            }
                            frequencies[word] = frequencies[word] || 0;
                            frequencies[word]++;
                        }

                    }

                    words = Object.keys(frequencies);
                    return words.sort(function (a, b) {
                        return frequencies[b] - frequencies[a];
                    }).slice(0, 50).toString(); //Most frequent 25 words

                });
//                });

                console.log(topics);
                page.setTopics(topics);
                for (var ad in ads) {
                    page.addAdvertisement(new Advertisement(new Bound(ads[ad].left, ads[ad].top, ads[ad].right, ads[ad].bottom)));
                }
                //page.addAdvertisement(new Advertisement(new Bound(bound.left, bound.top, bound.right, bound.bottom)))

                var milliseconds = new Date().getTime();
                var imageName = pubSnoop.webserver + '/' + milliseconds + '.jpeg';
                webPage.render(imageName, {
                    format: 'jpeg',
                    quality: '70'
                });
                page.addSnapshotUrl("http://localhost/" + milliseconds + '.jpeg');
                console.log("response-----------  : " + page.toString());
                response.statusCode = 200;
                response.setEncoding("binary");
                response.write(page.toString());
                response.close();
            }, 5000);
        };
    } catch (e) {
        console.log("Inside catch block");
        console.log(e);
        msg = "Failed rendering: \n" + e;
        response.statusCode = 500;
        response.setHeader('Content-Type', 'text/plain');
        response.setHeader('Content-Length', msg.length);
        console.log(msg);
        response.write(msg);
        response.close();
    }
}

pubSnoop.server.listen(port, Snooper);