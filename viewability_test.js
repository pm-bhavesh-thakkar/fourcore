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

                    console.log("viewport bounds :" + JSON.stringify(viewport));

                    viewport.right = viewport.left + win.width();
                    viewport.bottom = viewport.top + win.height();

                    var height = boundrect.height;
                    var width = boundrect.width;

                    console.log("Element bounds :" + JSON.stringify(boundrect));

                    if (!width || !height) {
                        return false;
                    }


                    var visible = (!(viewport.right < boundrect.left || viewport.left > boundrect.right || viewport.bottom < boundrect.top || viewport.top > boundrect.bottom));

                    if (!visible) {
                        return false;
                    }

                    var deltas = {
                        top: Math.min(1, (boundrect.bottom - viewport.top) / height),
                        bottom: Math.min(1, (viewport.bottom - boundrect.top) / height),
                        left: Math.min(1, (boundrect.right - viewport.left) / width),
                        right: Math.min(1, (viewport.right - boundrect.left) / width)
                    };
                    console.log("x  :" + deltas.left * deltas.right);
                    console.log("y  :" + deltas.top * deltas.bottom);
                    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;

                };
            });
            page.evaluate(function() {
                console.log("Hello");
                // $("iframe[id*='ads']").contents().find("span.PubAdAI").each(function(){
                //console.log("Hi");
                //console.log($(this).isOnScreen(0.5,0.5,this.getBoundingClientRect()));
                //});
                $("iframe[id*='ads']").each(function() {

                    //if ($(this).contents().find("span.PubAdAI")
                    console.log("Element zIndex is  " + this.getAttribute("zIndex"));
                    console.log("Element Viewability is : " + $(this).isOnScreen(0.5, 0.5, this.getBoundingClientRect()));
                    console.log("--------------------------------------------------------------------");
                });
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
