// Header Controller
App.controller('HeaderCtrl', ['$scope', '$localStorage', '$window', '$state',
    function ($scope, $localStorage, $window, $state) {
        // When view content is loaded
        $scope.$on('$includeContentLoaded', function () {
            // Transparent header functionality
            $scope.helpers.uiHandleHeader();
        });

        $scope.userTask = $localStorage.userTaskList;
        $scope.logout = function () {

            $localStorage.userTaskList = {};
            $localStorage.userDetails = {};
            $state.go('login');
        };

    }
]);