App.controller('LoginController', ['$scope', '$state', 'commonService', '$http', '$localStorage', 'Notification',
                function($scope, $state, commonService, $http, $localStorage, Notification) {

    $scope.user = {};

    $scope.loginSuccess = function (response) {

      $scope.helpers.uiBlocks('#login-content', 'state_normal');
      $scope.userDetails = response.data.AesUserMaster;
      $scope.userTaskList = response.data.tasklist;
      $localStorage.userDetails = $scope.userDetails; 
      $localStorage.userTaskList = $scope.userTaskList
      if (response.data.Success) {
        $state.go('main.home');
      } else {
        $scope.loginError(response);
      }
    };

    $scope.loginError = function (response) {

      $scope.helpers.uiBlocks('#login-content', 'state_normal');
      Notification.error('Please provide the valid credentials!');
      $scope.user.name = '';
      $scope.user.password = '';
      $('#login-username').focus()
    };

    $scope.login = function () {

      $scope.helpers.uiBlocks('#login-content', 'state_loading');
      var responseData = commonService.serialize({"userName": $scope.user.name, "password": $scope.user.password});
        $http({
              method: 'POST',
              url: 'http://localhost:8080/ECJ_WebApp/users/validate',
              data: responseData,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function(response){
         $scope.loginSuccess(response);
        }, function (response) {
          $scope.loginError(response);
        });
    };
}]);