/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var init = angular.module('pubSnoo.init', []);

init.directive('overlay', [function () {
        return{
            restrict: 'E',
            replace: true,
            template: '<div></div>',
            link: function ($scope, elem, attrs) {
                elem.addClass("overlay");
            }
        }
    }]);

init.directive('siteImage', function () {
    return{
        restrict: 'E',
        replace: true,
        template: '<img>',
        link: function ($scope, elem, attrs) {
            elem.attr('src', $scope.data.page.snapshotUrl);
        }
    }

});

init.directive('clipImage', function () {
    return{
        restrict: 'A',
        replace: true,
        link: function ($scope, elem, attrs) {
            elem.css(
                    'background-image', 'url(' + $scope.data.site.image + ' )'
                    );
        }
    }
});
init.directive('highlighAds', ['$compile', function ($compile) {
        return{
            restrict: 'E',
            replace: true,
            template: '<div></div>',
            link: function ($scope, elem, attrs) {
                elem.css({
                    'background-image': 'url(' + $scope.data.site.image + ' )',
                    position: 'absolute',
                    top: ad.bound.y + 'px',
                    left: ad.bound.x + 'px',
                    width: ad.bound.w + 'px',
                    height: ad.bound.h + 'px',
                    'background-position': -ad.bound.x + 'px' - ad.bound.y + 'px'
                });
            }
        }

    }]);


init.controller('main', ["$scope", "$http", "ngProgress", function ($scope, $http, ngProgress) {
        ngProgress.color('#43ac6a');
        $scope.resolutions = [
            {
                w: 320, h: 480
            },
            {
                w: 553, h: 320
            },
            {
                w: 569, h: 320
            },
            {
                w: 640, h: 360
            },
            {
                w: 640, h: 400
            },
            {
                w: 480, h: 320
            }
        ];


        $scope.resolution = "default";
        $scope.data = {"ads": [{"id": "129_882_219_154", "bound": {"x": "154", "y": "129", "h": "90", "w": "728"}, "viewable": "100", "overlappedAds": []}, {"id": "1724_194_2324_34", "bound": {"x": "34", "y": "1724", "h": "600", "w": "160"}, "viewable": "0", "overlappedAds": []}, {"id": "604_1004_1204_704", "bound": {"x": "704", "y": "604", "h": "600", "w": "300"}, "viewable": "27.33", "overlappedAds": []}], 
            "page": {
                "viewport": {"x": "0", "y": "0", "h": "768", "w": "1024"}, 
                "bound": {"x": "0", "y": "0", "h": "3179", "w": "1024"}, 
                "cluttered": " 10.49", 
                "topics": "reviews,drugs,webmd,health,drug,vitamin,find,healthy,content,york,care,medical,expert,approves,mobile,news,first,latest,diet,popular,review,receive,webmds,delivered,loss,toolsmy,pagesmy,example,oral261,pritopid,sectopid,symptoms,conditions,like,tips,pill,medicine,sign,food,calculator,read,people,guidance,living,guide,directory,pain,approvals,consumer,supplement", 
                "overlapDetected": "false", 
                "category": "IAB24", 
                "malwareDetected": "false", 
                "visibilityScore": "0", 
                "lang": "en", 
                "snapshotUrl": " http://localhost/1430032320213.jpeg", 
                "url": "http://www.webmd.com/drugs/index-drugs.aspx", 
                "autoRefreshDetected": "false"}}
        
        $scope.search = function () {
            ngProgress.start();

            $http({
                method: 'POST',
                url: 'http://localhost/snoopy',
//                headers: {
//                    'Access-Control-Allow-Origin': '*'
//                },
                data: {
                    url: $scope.url
                }

            }).success(function (data, status, headers, config) {
                $("#site-home").hide();
                $("#site-info").show();
                $scope.data = data;
                console.log("success");
                $("#siteImage")[0].src = $scope.data.page.snapshotUrl;
                
                ngProgress.complete();
            }).error(function (data, status, headers, config) {
                console.log("error");
                console.log(data)
                console.log(status)
                console.log(headers)
                console.log(config)
                ngProgress.complete();
            });         url: $scope.url
              //  }

//            }).success(function (data, status, headers, config) {
//                console.log("success");
//                console.log(data)
//                console.log(status)
//                console.log(headers)
//                console.log(config)
//                ngProgress.complete();
//            }).error(function (data, status, headers, config) {
//                console.log("error");
//                console.log(data)
//                console.log(status)
//                console.log(headers)
//                console.log(config)
//                ngProgress.complete();
//            });
        }


        //ngProgress.complete();

    }]).directive('bg', function () {
    return {
        link: function (scope, element, attrs) {
            if (scope.data.site.image) {
                element.css("background-image", "url(" + scope.page.snapshotUrl + ")");
            }
        }
    }
});

//    init.directive('backImg', function () {
//        return function (scope, element, attrs) {
//            var url = attrs.backImg;
//            element.css({
//                'background-image' : 'url(' + url + ')'
//            });
//        };
//    });
//    angular.module('pubSnoo.init', []).directive('backImg', function () {
//        return function (scope, element, attrs) {
//            var url = attrs.backImg;
//            element.css({
//                'background-image': 'url(' + url + ')'
//            });
//        };
//    });

var app = angular.module('pubSnoop', ['ngProgress', "pubSnoo.init"]);
