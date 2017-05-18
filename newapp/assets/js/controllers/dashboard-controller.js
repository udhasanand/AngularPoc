App.controller('DashboardCtrl', ['$scope', '$localStorage', '$window', 'Notification', '$state',
    function ($scope, $localStorage, $window, Notification, $state) {

        $scope.userDetails = $localStorage.userDetails;
        if ($scope.userDetails == undefined
                || $scope.userDetails == null
                || $.isEmptyObject($scope.userDetails)) {
            Notification.error('Session has expired, Please login again!');
            $state.go('login');
        }
        /*
         * Init Chart.js Chart, for more examples you can check out http://www.chartjs.org/docs
         */

        // Get Chart Container
        var dashChartLinesCon  = jQuery('.js-dash-chartjs-lines')[0].getContext('2d');

        // Set Chart and Chart Data variables
        var dashChartLines, dashChartLinesData;

        // Lines Chart Data
        var dashChartLinesData = {
            labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
            datasets: [
                {
                    label: 'This Week',
                    fillColor: 'rgba(44, 52, 63, .07)',
                    strokeColor: 'rgba(44, 52, 63, .25)',
                    pointColor: 'rgba(44, 52, 63, .25)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(44, 52, 63, 1)',
                    data: [34, 42, 40, 65, 48, 56, 80]
                },
                {
                    label: 'Last Week',
                    fillColor: 'rgba(44, 52, 63, .1)',
                    strokeColor: 'rgba(44, 52, 63, .55)',
                    pointColor: 'rgba(44, 52, 63, .55)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(44, 52, 63, 1)',
                    data: [18, 19, 20, 35, 23, 28, 50]
                }
            ]
        };

        // Init Lines Chart
        dashChartLines = new Chart(dashChartLinesCon).Line(dashChartLinesData, {
            scaleFontFamily: "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            scaleFontColor: '#999',
            scaleFontStyle: '600',
            tooltipTitleFontFamily: "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            tooltipCornerRadius: 3,
            maintainAspectRatio: false,
            responsive: true
        });

        // Init Rating
        var initRating = function(){
            // Set Default options
            jQuery.fn.raty.defaults.starType = 'i';
            jQuery.fn.raty.defaults.hints    = ['Bad', 'Poor', 'Regular', 'Good', 'Gorgeous'];

            // Init Raty on .js-rating class
            jQuery('.js-rating').each(function(){
                var ratingEl = jQuery(this);

                ratingEl.raty({
                    score: ratingEl.data('score') ? ratingEl.data('score') : 0,
                    number: ratingEl.data('number') ? ratingEl.data('number') : 5,
                    cancel: ratingEl.data('cancel') ? ratingEl.data('cancel') : false,
                    target: ratingEl.data('target') ? ratingEl.data('target') : false,
                    targetScore: ratingEl.data('target-score') ? ratingEl.data('target-score') : false,
                    precision: ratingEl.data('precision') ? ratingEl.data('precision') : false,
                    cancelOff: ratingEl.data('cancel-off') ? ratingEl.data('cancel-off') : 'fa fa-fw fa-times text-danger',
                    cancelOn: ratingEl.data('cancel-on') ? ratingEl.data('cancel-on') : 'fa fa-fw fa-times',
                    starHalf: ratingEl.data('star-half') ? ratingEl.data('star-half') : 'fa fa-fw fa-star-half-o text-warning',
                    starOff: ratingEl.data('star-off') ? ratingEl.data('star-off') : 'fa fa-fw fa-star text-gray',
                    starOn: ratingEl.data('star-on') ? ratingEl.data('star-on') : 'fa fa-fw fa-star text-warning',
                    click: function(score, evt) {
                        // Here you could add your logic on rating click
                        // console.log('ID: ' + this.id + "\nscore: " + score + "\nevent: " + evt);
                    }
                });

                console.log(ratingEl);
            });
        };

        // Init all Ratings
        initRating();

        $('.rateReadOnly').raty('readOnly', true); 
    }
]);