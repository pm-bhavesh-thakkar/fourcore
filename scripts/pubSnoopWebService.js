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
            page.settings.localToRemoteUrlAccessEnabled = true;
	    page.viewportSize = { width: 1024, height: 768 };	
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
                                    viewportBounds: viewport,
                                    elementBounds: boundrect,
                                    isVisibleOnLoad: false

                                };
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
                                console.log("x  :" + deltas.left * deltas.right);
                                console.log("y  :" + deltas.top * deltas.bottom);
                                visible = ((deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y);
                                //return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;
                                response1.isVisibleOnLoad = visible;
                                return response1;

                            };
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
			var imageName=webserver + '/'+milliseconds+'.jpeg';
                        page.render(imageName, {
                            format: 'jpeg',
                            quality: '50'
                        });
			var image={};
			image.url="http://localhost/"+milliseconds+'.jpeg';
			var finalResponse = [];
			finalResponse.push(image);
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
