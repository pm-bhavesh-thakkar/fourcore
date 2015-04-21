var page = require('webpage').create();
var args = require('system').args;
var value = "";

var output_file = "testimg";
var url = "http://www.webmd.com/drugs/index-drugs.aspx";


page.onConsoleMessage = function(msg) {
    console.log(msg);
};
page.viewportSize = {
    width: 1024,
    height: 768
};

console.log("####################################################################################################");
console.log(url);
console.log("####################################################################################################");

page.onLoadFinished = function(status) {

    window.setTimeout(function() {
        try {

            page.evaluate(function() {

                $.fn.isOnScreen = function(x, y, currentObject) {

                    if (x == null || typeof x == 'undefined') x = 1;
                    if (y == null || typeof y == 'undefined') y = 1;

                    var win = $(window);

                    var viewport = {
                        top: win.scrollTop(),
                        left: win.scrollLeft()
                    };



                    viewport.right = viewport.left + win.width();
                    viewport.bottom = viewport.top + win.height();
                    console.log("Printing this object");
                    console.log($(this));
                    //var currentObject = this;
                    var boundrect = currentObject.getBoundingClientRect();

                    //console.log("element.top " + bounds.top);
                    //console.log("element.left " + bounds.left);
                    //console.log("element.right " + bounds.right);
                    //console.log("element.bottom " + bounds.bottom);
                    console.log("####################################################################################################");

                    var visible = (!(viewport.right < boundrect.left || viewport.left > boundrect.right || viewport.bottom < boundrect.top || viewport.top > boundrect.bottom));

                    if (!visible) {
                        return false;
                    }
		    
                    var win = $(window);
                    var deltas = {
                        top: Math.min(1, (boundrect.bottom - viewport.top) / win.height()),
                        bottom: Math.min(1, (viewport.bottom - boundrect.top) / win.height()),
                        left: Math.min(1, (boundrect.right - viewport.left) / win.width()),
                        right: Math.min(1, (viewport.right - boundrect.left) / win.width())
                    };

                    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;

                };
            });

            //Starts Here
            page.evaluate(function() {
                console.log("Hello");
                $("iframe[id*='ads']").contents().find("span.PubAdAI").each(function(){
                    console.log("Hi");
                    console.log($(this).isOnScreen(0.5, 0.5, this));
                });
                //$("iframe[id*='ads']").each(function() {
                //    console.log("Hi");
                //    console.log($(this).isOnScreen(0.5, 0.5, this));
                //});
            });


            page.clipRect = {
                top: 14,
                left: 3,
                width: 1024,
                height: 768
            };
            page.render('google_home.jpeg', {
                format: 'jpeg',
                quality: '100'
            });
        } catch (e) {
            status = e.message;
        }

        phantom.exit();
    }, 5000);
}

try {
    page.open(url);
    console.log('loading');
} catch (ex) {
    console.log(ex.message);
    phantom.exit();
}
