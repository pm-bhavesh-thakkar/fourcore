"use strict";
var server = require('webserver').create();
var args = require('system').args;
var fs = require('fs');
var spawn = require("child_process").spawn
var execFile = require("child_process").execFile
var webserver = '/var/www/html'
    //var url = require('url');
var port = 8001;
console.log("Port is  " + port);
// start a server on passed port and register a request listener
server.listen(port, function(request, response) {
    console.log("started on " + new Date());
    var jsonStr = request.post,
        params, msg = "Default Message";
    console.log(JSON.stringify(request.post));
    try {
        params = JSON.parse(jsonStr);
        console.log("Params are : " + JSON.stringify(params));
        if (params.status) {
            // for server health validation
            response.statusCode = 302;
            response.write("{'status':true}");
            response.close();
        } else {


            //Mandatory parameters
            var addurl = "";
            if (typeof params.url === 'undefined' || params.url.trim() == '') {
                throw new Error("Please provide valid url");
            }
            addurl = params.url;
            console.log("addurl : " + addurl);

            var page = new WebPage();
            page.onConsoleMessage = function(msg) {
                console.log(msg);
            };
            var responseArr = [];
 	    if (params.userAgent === undefined) params.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';
            if (params.width === undefined) params.width = 1024;
            if (params.height === undefined) params.height = 768;
            page.settings.localToRemoteUrlAccessEnabled = true;
            page.viewportSize = {
                width: params.width,
                height: params.height
            };
            page.onLoadFinished = function(status) {

                window.setTimeout(function() {
                        try {

                            page.evaluate(function() {

                                    $.fn.isOnScreen = function(x, y, boundrect) {

                                        if (x == null || typeof x == 'undefined') x = 1;
                                        if (y == null || typeof y == 'undefined') y = 1;

                                        var win = $(window);

                                        var viewport = {
                                            top: win.scrollTop(),
                                            left: win.scrollLeft(),
                                            right: win.width(),
                                            bottom: win.height()
                                        };

                                        //console.log("viewport bounds :" +JSON.stringify(viewport));

                                        viewport.right = viewport.left + win.width();
                                        viewport.bottom = viewport.top + win.height();

                                        var height = boundrect.height;
                                        var width = boundrect.width;
					
                                        var response1 = {                                            
                                            elementBounds: boundrect,
                                            isVisibleOnLoad: false

                                        };
					var adTagID=boundrect.top+"_"+boundrect.right+"_"+boundrect.bottom+"_"+boundrect.left;
					response1.adTagID=adTagID;
                                        //console.log("Element bounds :" +JSON.stringify(boundrect));

                                        if (!width || !height) {
                                            response1.isVisibleOnLoad = false
                                        }


                                        var visible = (!(viewport.right < boundrect.left || viewport.left > boundrect.right || viewport.bottom < boundrect.top || viewport.top > boundrect.bottom));

                                        if (!visible) {
                                            //return false;
                                            response1.isVisibleOnLoad = false;
                                        }

                                        var deltas = {
                                            top: Math.min(1, (boundrect.bottom - viewport.top) / height),
                                            bottom: Math.min(1, (viewport.bottom - boundrect.top) / height),
                                            left: Math.min(1, (boundrect.right - viewport.left) / width),
                                            right: Math.min(1, (viewport.right - boundrect.left) / width)
                                        };
                                        var x1 = deltas.left * deltas.right;
                                        var y1 = deltas.top * deltas.bottom;
                                        console.log("x  :" + deltas.left * deltas.right);
                                        console.log("y  :" + deltas.top * deltas.bottom);
                                        if (x1 == 1 && y1 == 1) {
                                            response1.visibilityPercentage = 100;
                                        }

                                        if (x1 < y1) {
                                            if (x1 < 1) {
                                                response1.visibilityPercentage = 0;
                                            } else {
                                                response1.visibilityPercentage = x1 * 100;
                                            }
                                        } else {
                                            if (y1 < 1) {
                                                response1.visibilityPercentage = 0;
                                            } else {

                                                response1.visibilityPercentage = y1 * 100;

                                            }
                                        }
                                    
                                    visible = ((deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y);
                                    //return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;
                                    response1.isVisibleOnLoad = visible;
                                    return response1;

                                };
                            });
			
			 var lang = page.evaluate(function() {
				return  document.getElementsByTagName("html")[0].getAttribute("lang");


			});

 			var topics = page.evaluate(function() {
			
			var allText ="";
			
			$('*').filter(function()
				{
			    if(($(this).text().length>0)&&($(this).text().length<100))
			    {
				return true;
			    }
			    else
			    {
				return false;
			    }
			}).each(function()
			{
			   allText = allText + $(this).text();
			});
                          allText= allText.replace(/(\r\n|\n|\r)/gm," ");
			allText = allText.toLowerCase().replace(/\b(?:the|it is|we all|an?|by|font|this|what|more|to|you|[mh]e|she|they|we|and|your|or|string|return|value|length|about|with|for|get|up|how|from|user|home|search|read})\b/ig, '');	
			var cleanString = allText.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,""),
      words = cleanString.split(' '),
      frequencies = {},
      word, frequency, i;

  for( i=0; i<words.length; i++ ) {
    word = words[i].trim();
if (word) {
    if (word.length < 4 || word.length > 10) { continue; }
    frequencies[word] = frequencies[word] || 0;
    frequencies[word]++;
}
   
  }
  
  words = Object.keys( frequencies );

 return words.sort(function (a,b) { return frequencies[b] -frequencies[a];}).slice(0,50).toString(); //Most frequent 25 words

 			
                         });

                        responseArr = page.evaluate(function() {
                            console.log("Hello");
                            var responseArr = [];
                            $("iframe[id*='ads']").each(function() {
                                var response = $(this).isOnScreen(0.5, 0.5, this.getBoundingClientRect());
                                response.zIndex = this.getAttribute("zIndex");
                                responseArr.push(response);
                                //console.log("response  : " + JSON.stringify(response));
                            });
                            return responseArr;
                        });
                        /*page.zoomFactor = 0.50;
                                                           page.viewportSize = {
                                                               width: params.width * 0.50,
                                                               height: params.height * 0.50
                                                           };*/
                        var milliseconds = new Date().getTime();
                        var imageName = webserver + '/' + milliseconds + '.jpeg';
                        page.render(imageName, {
                            format: 'jpeg',
                            quality: '50'
                        });

			
                        var pubSite = {};
                        pubSite.imageurl = "http://localhost/" + milliseconds + '.jpeg';
 			pubSite.pageLang = lang;
			pubSite.url = addurl;
			pubSite.topics = topics;
			pubSite.currentViewPort = page.viewportSize;
                        var finalResponse = [];
                        finalResponse.push(pubSite);
                        finalResponse.push(responseArr);			
			
                        console.log("response-----------  : " + JSON.stringify(finalResponse));
                        response.statusCode = 200;
                        response.setEncoding("binary");
                        response.write(JSON.stringify(finalResponse));
                        response.close();

                    } catch (e) {
                        status = e.message;
                    }
                    // page.close();
                    //response.close();

                }, 5000);



        }


        page.open(addurl);
        console.log('loading');


    }
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




});
console.log("OK, PhantomJS is ready.");
